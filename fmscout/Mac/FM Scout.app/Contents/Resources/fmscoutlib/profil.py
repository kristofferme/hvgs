"""Skjemaet som sier hvor i en spillerrecord de ulike verdiene ligger.

Et skjema er en liten JSON-fil. Den er skrevet av «kalibrer», og den kan
rettes for hånd. Det er dette laget som gjør at verktøyet kan følge med når SI
flytter på ting mellom to oppdateringer: da er det skjemaet som skal endres,
ikke koden.
"""

from __future__ import annotations

import json
import re
import struct
from dataclasses import dataclass, field
from pathlib import Path

from .felles import ROT, arbeidsmappe
from .spillere import fullfor
from .tekst import les_fast_streng

FORMAT = {
    "u8": ("B", 1), "i8": ("b", 1),
    "u16": ("<H", 2), "i16": ("<h", 2),
    "u32": ("<I", 4), "i32": ("<i", 4),
}

INNEBYGDE = ROT / "profiler"


class Strengpool:
    """En blokk lest som en rekke lengdeprefiksede strenger.

    Både offsetet og rekkefølgen er nyttig: noen felt peker rett på et offset,
    andre lagrer nummeret til strengen i en liste.

    En save på et par hundre megabyte har millioner av strenger, og å gå
    gjennom den byte for byte i Python tar minutter. Derfor plukkes kandidatene
    først ut med et regexuttrykk – det går i C – og bare de blir sett nærmere
    på. Et lengdeprefiks på fire bytes for en kort streng er lett å kjenne
    igjen: ett lite tall og tre nuller.
    """

    def __init__(self, data, prefiks: int = 4, maks: int = 96):
        self.strenger: list[str] = []
        self.offsets: list[int] = []
        self._ved_offset: dict[int, str] = {}
        rå_data = bytes(data) if not isinstance(data, bytes) else data
        n = len(rå_data)
        if prefiks == 4:
            kandidater = re.compile(
                rb"[\x01-%c]\x00\x00\x00" % maks).finditer(rå_data)
            starter = (m.start() for m in kandidater)
        else:
            starter = range(0, max(0, n - prefiks))
        format_ = {1: "B", 2: "<H", 4: "<I"}[prefiks]
        neste_tillatt = 0
        for i in starter:
            if i < neste_tillatt or i + prefiks >= n:
                continue
            (lengde,) = struct.unpack_from(format_, rå_data, i)
            if not (1 <= lengde <= maks) or i + prefiks + lengde > n:
                continue
            rå = rå_data[i + prefiks:i + prefiks + lengde]
            if b"\x00" in rå:
                continue
            try:
                tekst = rå.decode("utf-8")
            except UnicodeDecodeError:
                continue
            if not tekst.strip():
                continue
            self._ved_offset[i] = tekst
            self.offsets.append(i)
            self.strenger.append(tekst)
            neste_tillatt = i + prefiks + lengde

    def __len__(self) -> int:
        return len(self.strenger)

    def ved_offset(self, offset: int) -> str | None:
        return self._ved_offset.get(offset)

    def ved_indeks(self, nr: int) -> str | None:
        if 0 <= nr < len(self.strenger):
            return self.strenger[nr]
        return None


def _rydd_pa(rad: dict) -> dict:
    """FM lagrer PA som 0–200, men bruker −1 til −10 for «et sted i dette
    intervallet». Som usignert byte blir det 246–255. Vi regner om til et
    anslag, og merker at det *er* et anslag.
    """
    pa = rad.get("pa")
    if not isinstance(pa, int):
        return rad
    spenn = None
    if pa < 0:
        spenn = -pa
    elif 246 <= pa <= 255:
        spenn = 256 - pa
    if spenn is not None:
        ca = rad.get("ca") or 0
        rad["pa"] = max(ca, min(200, ca + spenn * 10))
        rad["pa_anslag"] = "ja"
    return rad


@dataclass
class Profil:
    navn: str = "uten navn"
    kilde: str = ""
    blokk: int = 0
    start: int = 0
    stride: int = 0
    antall: int = 0
    strengblokk: int | None = None
    felt: dict = field(default_factory=dict)
    attributter: dict = field(default_factory=dict)
    merknad: str = ""

    # -- lagring ----------------------------------------------------------

    @classmethod
    def fra_dict(cls, rå: dict) -> "Profil":
        kjente = {f for f in cls.__dataclass_fields__}
        return cls(**{k: v for k, v in rå.items() if k in kjente})

    def som_dict(self) -> dict:
        return {
            "navn": self.navn, "kilde": self.kilde, "blokk": self.blokk,
            "start": self.start, "stride": self.stride, "antall": self.antall,
            "strengblokk": self.strengblokk, "felt": self.felt,
            "attributter": self.attributter, "merknad": self.merknad,
        }

    def lagre(self, sti) -> Path:
        sti = Path(sti)
        sti.parent.mkdir(parents=True, exist_ok=True)
        sti.write_text(json.dumps(self.som_dict(), indent=1, ensure_ascii=False), "utf-8")
        return sti

    @classmethod
    def last(cls, navn_eller_sti) -> "Profil":
        sti = Path(navn_eller_sti)
        if not sti.exists():
            for mappe in (arbeidsmappe() / "profiler", INNEBYGDE):
                kandidat = mappe / f"{navn_eller_sti}.json"
                if kandidat.exists():
                    sti = kandidat
                    break
            else:
                raise FileNotFoundError(f"Fant ikke skjemaet «{navn_eller_sti}»")
        return cls.fra_dict(json.loads(sti.read_text(encoding="utf-8")))

    # -- lesing -----------------------------------------------------------

    def _verdi(self, rec, definisjon: dict, pool: Strengpool | None):
        type_ = definisjon.get("type", "u8")
        offset = definisjon["offset"]
        if type_ == "tekst":
            return les_fast_streng(rec, offset, definisjon.get("lengde", 32))
        if type_ in FORMAT:
            format_, bredde = FORMAT[type_]
            if offset + bredde > len(rec):
                return None
            (v,) = struct.unpack_from(format_, rec, offset)
            v = v * definisjon.get("skala", 1) + definisjon.get("pluss", 0)
            kart = definisjon.get("kart")
            if kart:
                return kart.get(str(v), kart.get(str(int(v))))
            return v
        if type_ in {"peker", "peker32", "indeks16", "indeks32"} and pool is not None:
            bredde = 2 if type_ == "indeks16" else 4
            format_ = "<H" if bredde == 2 else "<I"
            if offset + bredde > len(rec):
                return None
            (rå,) = struct.unpack_from(format_, rec, offset)
            if type_ in {"peker", "peker32"}:
                return pool.ved_offset(rå + definisjon.get("basis", 0))
            return pool.ved_indeks(rå + definisjon.get("startindeks", 0))
        return None

    def les(self, beholder, *, grense: int | None = None, melding=None):
        """Leser spillerne ut av en åpnet beholder."""
        data = beholder.data(self.blokk)
        pool = None
        if self.strengblokk is not None:
            pool = Strengpool(beholder.data(self.strengblokk))
        antall = self.antall if grense is None else min(self.antall, grense)
        for nr in range(antall):
            p = self.start + nr * self.stride
            rec = memoryview(data)[p:p + self.stride]
            if len(rec) < self.stride:
                break
            rad = {"kilde": self.navn}
            for nokkel, definisjon in self.felt.items():
                verdi = self._verdi(rec, definisjon, pool)
                if verdi is not None:
                    rad[nokkel] = verdi
            for nokkel, offset in self.attributter.items():
                if offset < len(rec):
                    rad[nokkel] = int(rec[offset])
            rad = _rydd_pa(rad)
            yield fullfor(rad)
            if melding and nr and nr % 25_000 == 0:
                melding(f"  {nr} spillere lest …")

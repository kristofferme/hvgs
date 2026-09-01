"""Åpner .fm-fila og pakker ut innholdet.

En FM-lagringsfil er ikke ett sammenhengende dokument. Den er en beholder med
mange komprimerte biter etter hverandre, og indeksen foran dem har endret seg
fra FM-versjon til FM-versjon. Derfor leser vi ikke indeksen: vi går gjennom
fila og finner de komprimerte bitene direkte. Det er tregere første gangen, men
det virker uavhengig av hvilken FM-versjon fila kommer fra – og resultatet
mellomlagres, så andre gangen er det bare å lese fra disk.

To pakkemetoder er i bruk:

* zlib, som FM brukte før. Hver strøm blir én blokk.
* zstd, som FM26 bruker. Der er fila delt i tusenvis av små rammer på noen få
  titalls kilobyte hver – altså én lang strøm som er hakket opp, ikke
  selvstendige deler. Derfor settes de sammen igjen til én blokk. Gjør vi ikke
  det, blir spillertabellen klippet i biter på hver rammegrense, og da finnes
  den ikke lenger.
"""

from __future__ import annotations

import json
import mmap
import shutil
import time
import zlib
from dataclasses import asdict, dataclass
from pathlib import Path

from . import pakking
from .felles import arbeidsmappe, filnokkel, si, storrelse

# En zlib-strøm starter med 0x78 og en byte som gjør at de to til sammen er
# delelig med 31. Det siler bort det aller meste før vi prøver å pakke ut.
_ZLIB_FORSTE = 0x78
MIN_BLOKK = 256          # mindre enn dette er nesten alltid falske treff
LES_BIT = 1 << 20


@dataclass
class Blokk:
    nr: int
    offset: int           # hvor i .fm-fila blokka begynner
    komprimert: int
    storrelse: int
    fil: str
    metode: str = "zlib"
    rammer: int = 1       # hvor mange komprimerte biter blokka er satt sammen av

    @property
    def forhold(self) -> float:
        return self.storrelse / self.komprimert if self.komprimert else 0.0


class Beholder:
    """Utpakket innhold fra én .fm-fil, mellomlagret på disk."""

    def __init__(self, kilde: Path, mappe: Path, blokker: list[Blokk], header: bytes = b""):
        self.kilde = kilde
        self.mappe = mappe
        self.blokker = blokker
        self.header = header
        self._åpne: dict[int, mmap.mmap] = {}

    # -- oppslag ----------------------------------------------------------

    def __len__(self) -> int:
        return len(self.blokker)

    @property
    def utpakket(self) -> int:
        return sum(b.storrelse for b in self.blokker)

    def data(self, nr: int) -> mmap.mmap:
        """Blokka som et minnekart – vi laster aldri hele saven i minnet."""
        if nr not in self._åpne:
            f = (self.mappe / self.blokker[nr].fil).open("rb")
            self._åpne[nr] = mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ)
            f.close()
        return self._åpne[nr]

    def __iter__(self):
        for blokk in self.blokker:
            yield blokk, self.data(blokk.nr)

    def lukk(self) -> None:
        for mm in self._åpne.values():
            mm.close()
        self._åpne.clear()

    # -- åpning -----------------------------------------------------------

    @classmethod
    def apne(cls, sti, *, tving: bool = False, tak_gb: float = 24.0, melding=si) -> "Beholder":
        sti = Path(sti).expanduser().resolve()
        if not sti.exists():
            raise FileNotFoundError(f"Fant ikke {sti}")
        mappe = arbeidsmappe() / "saver" / filnokkel(sti)
        indeks = mappe / "indeks.json"
        if indeks.exists() and not tving:
            try:
                return cls._fra_indeks(sti, mappe, indeks)
            except Exception:
                shutil.rmtree(mappe, ignore_errors=True)
        if mappe.exists():
            shutil.rmtree(mappe, ignore_errors=True)
        mappe.mkdir(parents=True, exist_ok=True)
        blokker, header = cls._pakk_ut(sti, mappe, tak_gb, melding)
        indeks.write_text(
            json.dumps(
                {
                    "kilde": str(sti),
                    "storrelse": sti.stat().st_size,
                    "header": header.hex(),
                    "blokker": [asdict(b) for b in blokker],
                },
                indent=1,
            ),
            encoding="utf-8",
        )
        return cls(sti, mappe, blokker, header)

    @classmethod
    def _fra_indeks(cls, sti: Path, mappe: Path, indeks: Path) -> "Beholder":
        rå = json.loads(indeks.read_text(encoding="utf-8"))
        if rå.get("storrelse") != sti.stat().st_size:
            raise ValueError("saven er endret siden sist")
        blokker = [Blokk(**b) for b in rå["blokker"]]
        for b in blokker:
            if not (mappe / b.fil).exists():
                raise ValueError("mellomlageret er ufullstendig")
        return cls(sti, mappe, blokker, bytes.fromhex(rå.get("header", "")))

    @staticmethod
    def _pakk_ut(sti: Path, mappe: Path, tak_gb: float, melding) -> tuple[list[Blokk], bytes]:
        total = sti.stat().st_size
        tak = int(tak_gb * (1 << 30))
        melding(f"Leser {sti.name} ({storrelse(total)}) …")

        with sti.open("rb") as f:
            mm = mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ)
            header = bytes(mm[:64])
            try:
                metode = _finn_metode(mm, total)
                melding(f"  pakkemetode: {metode}")
                if metode == "zstd":
                    blokker = _pakk_ut_zstd(mm, total, mappe, tak, melding)
                elif metode == "zlib":
                    blokker = _pakk_ut_zlib(mm, total, mappe, tak, melding)
                else:
                    blokker = []
            finally:
                mm.close()

        if not blokker:
            # Ingen komprimerte biter – da er saven trolig allerede utpakket
            # (eller kryptert). Vi behandler hele fila som én blokk.
            melding("  Fant ingen komprimerte biter – leser fila som den er.")
            navn = "blokk-00000.bin"
            shutil.copyfile(sti, mappe / navn)
            blokker.append(Blokk(0, 0, total, total, navn, "rå"))

        melding(
            f"  {len(blokker)} blokker, {storrelse(sum(b.storrelse for b in blokker))} "
            f"utpakket"
        )
        return blokker, header


def _finn_metode(mm: mmap.mmap, total: int) -> str:
    """Hvilken pakkemetode fila bruker. En save bruker bare én.

    Zstd-merket er fire bytes, så det dukker praktisk talt aldri opp av seg
    selv – finner vi en håndfull, er saken klar. Zlib-merket er to bytes og
    treffer tilfeldige data hele tida, så der må vi faktisk prøve å pakke ut
    for å vite noe.
    """
    zstd = 0
    forste = -1
    pos = 0
    while zstd < 4:
        i = mm.find(pakking.MAGI, pos)
        if i < 0:
            break
        if forste < 0:
            forste = i
        zstd += 1
        pos = i + 4
    # Merket er fire bytes. Å treffe det to ganger ved uhell krever noe slikt
    # som en fil på tusen terabyte, så to holder som bevis. Ett treff er også
    # nesten sikkert ekte, men da bekrefter vi det ved å pakke ut.
    if zstd >= 2:
        return "zstd"
    if zstd == 1 and pakking.tilgjengelig():
        try:
            ramme = pakking.pakk_ut_ramme(mm, forste)
        except Exception:
            ramme = None
        if ramme and ramme.data:
            return "zstd"

    treff, pos, prøvd = 0, 0, 0
    grense = min(total, 64 << 20)
    while treff < 2 and prøvd < 4000:
        i = mm.find(b"\x78", pos)
        if i < 0 or i >= grense:
            break
        pos = i + 1
        if i + 2 > total or ((_ZLIB_FORSTE << 8) | mm[i + 1]) % 31 != 0:
            continue
        prøvd += 1
        ut, _ = _pakk_ut_en(mm, i, total)
        if ut and len(ut) >= MIN_BLOKK:
            treff += 1
    return "zlib" if treff >= 2 else "rå"


def _pakk_ut_zlib(mm, total: int, mappe: Path, tak: int, melding) -> list[Blokk]:
    blokker: list[Blokk] = []
    skrevet = 0
    pos = 0
    neste_melding = time.time() + 3
    while pos < total - 2:
        i = mm.find(b"\x78", pos)
        if i < 0 or i + 2 > total:
            break
        if ((_ZLIB_FORSTE << 8) | mm[i + 1]) % 31 != 0:
            pos = i + 1
            continue
        ut, brukt = _pakk_ut_en(mm, i, total)
        if ut is None or len(ut) < MIN_BLOKK:
            pos = i + 1
            continue
        nr = len(blokker)
        navn = f"blokk-{nr:05d}.bin"
        (mappe / navn).write_bytes(ut)
        blokker.append(Blokk(nr, i, brukt, len(ut), navn, "zlib"))
        skrevet += len(ut)
        pos = i + brukt
        nå = time.time()
        if nå > neste_melding:
            neste_melding = nå + 3
            melding(f"  {100 * pos // total:3d} %  ·  {len(blokker)} blokker  ·  "
                    f"{storrelse(skrevet)} utpakket")
        if skrevet > tak:
            melding(f"  Stopper på {storrelse(skrevet)} utpakket (taket).")
            break
    return blokker


def _pakk_ut_zstd(mm, total: int, mappe: Path, tak: int, melding) -> list[Blokk]:
    """Alle rammene settes sammen til én blokk, i den rekkefølgen de står."""
    if pakking.tilgjengelig() is None:
        raise pakking.IngenZstd(
            "Saven er pakket med zstd, og maskinen mangler et bibliotek som kan "
            "pakke den ut."
        )
    melding(f"  bruker {pakking.tilgjengelig()}")
    navn = "blokk-00000.bin"
    skrevet = rammer = 0
    pos = mm.find(pakking.MAGI, 0)
    forste = pos
    neste_melding = time.time() + 3
    with (mappe / navn).open("wb") as ut:
        while pos >= 0 and pos < total:
            ramme = pakking.pakk_ut_ramme(mm, pos)
            if ramme is None or not ramme.data:
                pos = mm.find(pakking.MAGI, pos + 4)
                continue
            ut.write(ramme.data)
            skrevet += len(ramme.data)
            rammer += 1
            pos += ramme.brukt
            if mm[pos:pos + 4] != pakking.MAGI:
                pos = mm.find(pakking.MAGI, pos)
            nå = time.time()
            if nå > neste_melding:
                neste_melding = nå + 3
                melding(f"  {100 * max(pos, 0) // total:3d} %  ·  {rammer} rammer  ·  "
                        f"{storrelse(skrevet)} utpakket")
            if skrevet > tak:
                melding(f"  Stopper på {storrelse(skrevet)} utpakket (taket).")
                break
    if not skrevet:
        (mappe / navn).unlink(missing_ok=True)
        return []
    return [Blokk(0, forste, total - forste, skrevet, navn, "zstd", rammer)]


def _pakk_ut_en(mm: mmap.mmap, start: int, total: int) -> tuple[bytes | None, int]:
    """Prøver å pakke ut én zlib-strøm fra start. Returnerer (data, brukte bytes)."""
    d = zlib.decompressobj()
    ut = bytearray()
    pos = start
    try:
        while pos < total:
            bit = mm[pos:pos + LES_BIT]
            ut += d.decompress(bit)
            pos += len(bit)
            if d.eof:
                brukt = pos - start - len(d.unused_data)
                return bytes(ut), max(brukt, 1)
            if not bit:
                break
    except zlib.error:
        # Delvis utpakking er fortsatt nyttig hvis strømmen er avkortet.
        if len(ut) >= MIN_BLOKK * 4:
            return bytes(ut), max(pos - start, 1)
        return None, 0
    if len(ut) >= MIN_BLOKK:
        return bytes(ut), max(pos - start, 1)
    return None, 0

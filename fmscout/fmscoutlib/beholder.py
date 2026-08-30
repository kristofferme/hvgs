"""Åpner .fm-fila og pakker ut innholdet.

En FM-lagringsfil er ikke ett sammenhengende dokument. Den er en beholder med
mange deflate-komprimerte blokker etter hverandre, og indeksen foran dem har
endret seg fra FM-versjon til FM-versjon. Derfor leser vi ikke indeksen: vi går
gjennom fila og finner zlib-strømmene direkte. Det er tregere første gangen,
men det virker uavhengig av hvilken FM-versjon fila kommer fra – og resultatet
mellomlagres, så andre gangen er det bare å lese fra disk.
"""

from __future__ import annotations

import json
import mmap
import shutil
import time
import zlib
from dataclasses import asdict, dataclass
from pathlib import Path

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
        blokker: list[Blokk] = []
        skrevet = 0
        start = time.time()
        neste_melding = start + 3

        with sti.open("rb") as f:
            mm = mmap.mmap(f.fileno(), 0, access=mmap.ACCESS_READ)
            header = bytes(mm[:64])
            pos = 0
            try:
                while pos < total - 2:
                    i = mm.find(bytes([_ZLIB_FORSTE]), pos)
                    if i < 0:
                        break
                    if i + 2 > total:
                        break
                    b1 = mm[i + 1]
                    if ((_ZLIB_FORSTE << 8) | b1) % 31 != 0:
                        pos = i + 1
                        continue
                    ut, brukt = _pakk_ut_en(mm, i, total)
                    if ut is None or len(ut) < MIN_BLOKK:
                        pos = i + 1
                        continue
                    nr = len(blokker)
                    navn = f"blokk-{nr:05d}.bin"
                    (mappe / navn).write_bytes(ut)
                    blokker.append(Blokk(nr, i, brukt, len(ut), navn))
                    skrevet += len(ut)
                    pos = i + brukt
                    nå = time.time()
                    if nå > neste_melding:
                        neste_melding = nå + 3
                        melding(
                            f"  {100 * pos // total:3d} %  ·  {len(blokker)} blokker  ·  "
                            f"{storrelse(skrevet)} utpakket"
                        )
                    if skrevet > tak:
                        melding(
                            f"  Stopper på {storrelse(skrevet)} utpakket (taket). "
                            "Sett --tak høyere om du trenger mer."
                        )
                        break
            finally:
                mm.close()

        if not blokker:
            # Ingen komprimerte blokker – da er saven trolig allerede utpakket
            # (eller kryptert). Vi behandler hele fila som én blokk.
            melding("  Fant ingen komprimerte blokker – leser fila som den er.")
            navn = "blokk-00000.bin"
            shutil.copyfile(sti, mappe / navn)
            blokker.append(Blokk(0, 0, total, total, navn))

        melding(
            f"  {len(blokker)} blokker, {storrelse(sum(b.storrelse for b in blokker))} "
            f"utpakket på {time.time() - start:.0f} s"
        )
        return blokker, header


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

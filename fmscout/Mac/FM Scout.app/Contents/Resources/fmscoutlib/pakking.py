"""Zstandard-utpakking, med så mange veier inn som mulig.

FM26 pakker saven med zstd. Python har ikke zstd innebygd før 3.14, og macOS
har ikke libzstd fast installert, så vi kan ikke regne med noen enkelt måte å
komme til den på. Derfor prøver vi dem i tur og orden:

1. compression.zstd – Python 3.14 og nyere, ingenting å installere
2. zstandard eller pyzstd – vanlige pakker fra pip
3. libzstd via ctypes – ligger der om du har Homebrew, eller har fått den med
   noe annet
4. zstd-kommandoen, om den finnes

Finner vi ingen av dem, kan «installer_zstandard» hente pakken. Det er ett
klikk i appen, ikke en tur innom terminalen.
"""

from __future__ import annotations

import ctypes
import ctypes.util
import shutil
import subprocess
import sys
from dataclasses import dataclass

MAGI = b"\x28\xb5\x2f\xfd"          # starten på en zstd-ramme
SKIPPBAR = b"\x2a\x4d\x18"          # de fire første er 0x50-0x5f, så disse tre
LES_BIT = 1 << 22

DYLIB = [
    "libzstd.1.dylib", "libzstd.dylib",
    "/opt/homebrew/lib/libzstd.1.dylib", "/usr/local/lib/libzstd.1.dylib",
    "/usr/lib/libzstd.1.dylib",
    "libzstd.so.1", "libzstd.so",
]

CONTENTSIZE_UKJENT = 0xFFFFFFFFFFFFFFFF
CONTENTSIZE_FEIL = 0xFFFFFFFFFFFFFFFE


class IngenZstd(Exception):
    """Ingen måte å pakke ut zstd på denne maskinen."""


@dataclass
class Ramme:
    data: bytes
    brukt: int          # hvor mange bytes av kilden ramma tok


# --- de ulike veiene inn --------------------------------------------------


class _Modulmotor:
    """compression.zstd, zstandard eller pyzstd – alle med samme oppførsel."""

    def __init__(self, modul, navn: str):
        self.modul = modul
        self.navn = navn

    def _dekomprimator(self):
        for attributt in ("ZstdDecompressor", "ZstdDecompressionObj"):
            klasse = getattr(self.modul, attributt, None)
            if klasse is None:
                continue
            objekt = klasse()
            # zstandard skiller mellom kontekst og strøm-objekt.
            if hasattr(objekt, "decompressobj"):
                return objekt.decompressobj()
            if hasattr(objekt, "decompress"):
                return objekt
        raise IngenZstd(f"{self.navn} ser ikke ut som forventet")

    def komprimer(self, data: bytes) -> bytes | None:
        for attributt in ("ZstdCompressor", "compress"):
            ting = getattr(self.modul, attributt, None)
            if ting is None:
                continue
            try:
                if attributt == "compress":
                    return ting(data)
                return ting().compress(data)
            except Exception:
                continue
        return None

    def ramme(self, kilde, start: int) -> Ramme | None:
        d = self._dekomprimator()
        ut = bytearray()
        pos = start
        n = len(kilde)
        while pos < n:
            bit = bytes(kilde[pos:pos + LES_BIT])
            if not bit:
                break
            try:
                ut += d.decompress(bit)
            except Exception:
                return None
            pos += len(bit)
            if getattr(d, "eof", False):
                rest = len(getattr(d, "unused_data", b"") or b"")
                return Ramme(bytes(ut), max(1, pos - start - rest))
        return Ramme(bytes(ut), pos - start) if ut else None


class _Ctypesmotor:
    """libzstd direkte. Den kan si nøyaktig hvor lang ramma er, som er akkurat
    det vi trenger for å finne den neste."""

    navn = "libzstd"

    def __init__(self, bib):
        self.bib = bib
        bib.ZSTD_findFrameCompressedSize.restype = ctypes.c_size_t
        bib.ZSTD_findFrameCompressedSize.argtypes = [ctypes.c_void_p, ctypes.c_size_t]
        bib.ZSTD_getFrameContentSize.restype = ctypes.c_ulonglong
        bib.ZSTD_getFrameContentSize.argtypes = [ctypes.c_void_p, ctypes.c_size_t]
        bib.ZSTD_decompress.restype = ctypes.c_size_t
        bib.ZSTD_decompress.argtypes = [ctypes.c_void_p, ctypes.c_size_t,
                                        ctypes.c_void_p, ctypes.c_size_t]
        bib.ZSTD_isError.restype = ctypes.c_uint
        bib.ZSTD_isError.argtypes = [ctypes.c_size_t]
        bib.ZSTD_compressBound.restype = ctypes.c_size_t
        bib.ZSTD_compressBound.argtypes = [ctypes.c_size_t]
        bib.ZSTD_compress.restype = ctypes.c_size_t
        bib.ZSTD_compress.argtypes = [ctypes.c_void_p, ctypes.c_size_t,
                                      ctypes.c_void_p, ctypes.c_size_t, ctypes.c_int]

    def komprimer(self, data: bytes) -> bytes | None:
        tak = self.bib.ZSTD_compressBound(len(data))
        ut = ctypes.create_string_buffer(tak)
        inn = ctypes.create_string_buffer(data, len(data))
        n = self.bib.ZSTD_compress(ut, tak, inn, len(data), 3)
        if self.bib.ZSTD_isError(n):
            return None
        return ut.raw[:n]

    def ramme(self, kilde, start: int) -> Ramme | None:
        rest = bytes(kilde[start:start + (64 << 20)])
        buffer = ctypes.create_string_buffer(rest, len(rest))
        lengde = self.bib.ZSTD_findFrameCompressedSize(buffer, len(rest))
        if self.bib.ZSTD_isError(lengde) or not lengde:
            return None
        storrelse = self.bib.ZSTD_getFrameContentSize(buffer, len(rest))
        if storrelse in (CONTENTSIZE_UKJENT, CONTENTSIZE_FEIL) or storrelse > (1 << 31):
            return None
        ut = ctypes.create_string_buffer(int(storrelse) or 1)
        skrevet = self.bib.ZSTD_decompress(ut, int(storrelse) or 1, buffer, lengde)
        if self.bib.ZSTD_isError(skrevet):
            return None
        return Ramme(ut.raw[:skrevet], int(lengde))


class _Kommandomotor:
    """zstd-kommandoen. Siste utvei – vi må gjette rammegrensa selv."""

    navn = "zstd-kommandoen"

    def __init__(self, sti: str):
        self.sti = sti

    def komprimer(self, data: bytes) -> bytes | None:
        ferdig = subprocess.run([self.sti, "-c", "-q", "-"],
                                input=data, capture_output=True)
        return ferdig.stdout or None

    def ramme(self, kilde, start: int) -> Ramme | None:
        neste = kilde.find(MAGI, start + 4)
        slutt = neste if neste > 0 else len(kilde)
        bit = bytes(kilde[start:slutt])
        ferdig = subprocess.run([self.sti, "-d", "--stdout", "-q", "-"],
                                input=bit, capture_output=True)
        if not ferdig.stdout:
            return None
        return Ramme(ferdig.stdout, slutt - start)


# --- valg av motor --------------------------------------------------------

_motor = None
_lett_etter = False


def motor():
    """Den beste veien inn som finnes på denne maskinen. None om ingen."""
    global _motor, _lett_etter
    if _lett_etter:
        return _motor
    _lett_etter = True

    for navn in ("compression.zstd", "zstandard", "pyzstd"):
        try:
            modul = __import__(navn, fromlist=["*"])
        except ImportError:
            continue
        kandidat = _Modulmotor(modul, navn)
        if _virker(kandidat):
            _motor = kandidat
            return _motor

    for navn in [ctypes.util.find_library("zstd")] + DYLIB:
        if not navn:
            continue
        try:
            bib = ctypes.CDLL(navn)
            kandidat = _Ctypesmotor(bib)
        except (OSError, AttributeError):
            continue
        if _virker(kandidat):
            _motor = kandidat
            return _motor

    for sti in ("zstd", "/opt/homebrew/bin/zstd", "/usr/local/bin/zstd"):
        full = shutil.which(sti) if "/" not in sti else (sti if shutil.os.path.exists(sti) else None)
        if full:
            kandidat = _Kommandomotor(full)
            if _virker(kandidat):
                _motor = kandidat
                return _motor
    return None


PROVE = b"fmscout " * 40 + b"\x00\x01\x02 slutt"


def _virker(kandidat) -> bool:
    """En motor duger hvis den kan pakke noe og få det samme ut igjen.

    Den prøven er verdt mer enn en håndskrevet testramme: den bekrefter at
    akkurat denne veien inn virker på akkurat denne maskinen.
    """
    try:
        pakket = kandidat.komprimer(PROVE)
        if not pakket or not pakket.startswith(MAGI):
            return False
        ramme = kandidat.ramme(pakket, 0)
    except Exception:
        return False
    return bool(ramme and ramme.data == PROVE and ramme.brukt == len(pakket))


def tilgjengelig() -> str | None:
    m = motor()
    return m.navn if m else None


def pakk_ut_ramme(kilde, start: int) -> Ramme | None:
    m = motor()
    if m is None:
        raise IngenZstd(
            "Denne saven er pakket med zstd, og maskinen har ingen måte å pakke "
            "den ut på ennå."
        )
    return m.ramme(kilde, start)


def installer_zstandard(melding=print) -> bool:
    """Henter «zstandard» med pip. Det er den enkleste veien på en Mac.

    Noen Python-installasjoner er merket som «externally managed» og nekter
    å installere noe uten videre. Da prøver vi en gang til med flagget som
    sier at vi mener det – pakken havner uansett bare hos brukeren, ikke i
    systemet.
    """
    global _motor, _lett_etter
    melding("Henter zstandard …")
    forsok = [
        [sys.executable, "-m", "pip", "install", "--user", "--quiet", "zstandard"],
        [sys.executable, "-m", "pip", "install", "--user", "--quiet",
         "--break-system-packages", "zstandard"],
    ]
    for kommando in forsok:
        ferdig = subprocess.run(kommando, capture_output=True, text=True)
        if ferdig.returncode == 0:
            break
        if "externally-managed" not in (ferdig.stderr or ""):
            melding((ferdig.stderr or "").strip()[-400:] or "pip klarte det ikke")
            return False
    else:
        melding("pip fikk ikke installert zstandard")
        return False

    _motor, _lett_etter = None, False
    import importlib
    import site
    importlib.reload(site)
    for sti in site.getusersitepackages() if hasattr(site, "getusersitepackages") else []:
        if sti not in sys.path:
            sys.path.append(sti)
    importlib.invalidate_caches()
    navn = tilgjengelig()
    if navn:
        melding(f"Klart – bruker {navn}.")
        return True
    melding("Pakken ble hentet, men lastes ikke. Start FM Scout på nytt.")
    return False

"""Småting som resten av verktøyet bruker."""

from __future__ import annotations

import hashlib
import os
import re
import sys
import unicodedata
from pathlib import Path

HER = Path(__file__).resolve().parent
# Fra fmscoutlib/ inne i appen og ut til fmscout-mappa:
# Resources → Contents → FM Scout.app → Mac → fmscout
ROT = HER.parent.parent.parent.parent.parent


def si(tekst: str = "") -> None:
    print(tekst, flush=True)


def feil(tekst: str) -> None:
    print(tekst, file=sys.stderr, flush=True)


def arbeidsmappe() -> Path:
    """Der utpakkede blokker og profiler mellomlagres."""
    base = os.environ.get("FMSCOUT_HOME")
    if base:
        mappe = Path(base).expanduser()
    else:
        mappe = Path.home() / "Library" / "Caches" / "fmscout"
        if not mappe.parent.exists():  # ikke macOS
            mappe = Path.home() / ".cache" / "fmscout"
    mappe.mkdir(parents=True, exist_ok=True)
    return mappe


def filnokkel(sti: Path) -> str:
    """Kort, stabil nøkkel for en fil: navn + størrelse + starten av innholdet."""
    st = sti.stat()
    h = hashlib.sha1()
    h.update(sti.name.encode("utf-8", "replace"))
    h.update(str(st.st_size).encode())
    with sti.open("rb") as f:
        h.update(f.read(1 << 16))
        if st.st_size > (1 << 20):
            f.seek(st.st_size // 2)
            h.update(f.read(1 << 16))
            f.seek(-min(st.st_size, 1 << 16), os.SEEK_END)
            h.update(f.read(1 << 16))
    return h.hexdigest()[:16]


def storrelse(bytes_: float) -> str:
    for enhet in ("B", "kB", "MB", "GB", "TB"):
        if bytes_ < 1024 or enhet == "TB":
            if enhet == "B":
                return f"{int(bytes_)} B"
            return f"{bytes_:.1f} {enhet}"
        bytes_ /= 1024
    return f"{bytes_:.1f} TB"


def tallformat(n: int) -> str:
    return f"{n:,}".replace(",", " ")


_IKKE_ORD = re.compile(r"[^a-z0-9]+")


def flat(tekst: str) -> str:
    """Små bokstaver uten aksenter og skilletegn – til oppslag og sammenlikning."""
    if not tekst:
        return ""
    tekst = unicodedata.normalize("NFKD", str(tekst))
    tekst = "".join(c for c in tekst if not unicodedata.combining(c))
    return _IKKE_ORD.sub(" ", tekst.lower()).strip()


_PENGER = re.compile(
    r"(?P<valuta>[£€$¥]|kr|nok|usd|eur|gbp)?\s*"
    r"(?P<tall>[\d][\d\s.,]*)\s*"
    r"(?P<enhet>[kmb])?",
    re.IGNORECASE,
)
_ENHET = {"k": 1_000, "m": 1_000_000, "b": 1_000_000_000}


def les_penger(tekst) -> tuple[float | None, str]:
    """«£1.2M», «€900K p/w», «kr 12 000» → (1200000.0, '£'). Tomt → (None, '')."""
    if tekst is None:
        return None, ""
    if isinstance(tekst, (int, float)):
        return float(tekst), ""
    t = str(tekst).strip()
    if not t or t.lower() in {"n/a", "na", "-", "–", "unknown", "ukjent"}:
        return None, ""
    # Intervall («£1M - £2M») → snittet av endene.
    deler = re.split(r"\s+-\s+|\s+til\s+", t)
    if len(deler) == 2:
        a, va = les_penger(deler[0])
        b, _ = les_penger(deler[1])
        if a is not None and b is not None:
            return (a + b) / 2, va
    m = _PENGER.search(t)
    if not m or not m.group("tall"):
        return None, ""
    rå = m.group("tall").strip().rstrip(".,")
    rå = rå.replace(" ", "")
    # 1.234.567 og 1,234,567 er tusenskiller; 1.2 og 1,2 er desimaler.
    if rå.count(",") > 1 or (rå.count(",") == 1 and len(rå.split(",")[-1]) == 3 and rå.count(".") == 0 and len(rå) > 4):
        rå = rå.replace(",", "")
    if rå.count(".") > 1:
        rå = rå.replace(".", "")
    rå = rå.replace(",", ".")
    try:
        verdi = float(rå)
    except ValueError:
        return None, ""
    enhet = (m.group("enhet") or "").lower()
    if enhet in _ENHET:
        verdi *= _ENHET[enhet]
    valuta = (m.group("valuta") or "").strip()
    return verdi, valuta


def les_tall(tekst):
    """Første tall i en tekst, ellers None. «183 cm» → 183.0, «6'2\"» → None."""
    if tekst is None:
        return None
    if isinstance(tekst, bool):
        return None
    if isinstance(tekst, (int, float)):
        return float(tekst)
    t = str(tekst).strip()
    if not t or t in {"-", "–", "N/A", "n/a"}:
        return None
    m = re.search(r"-?\d+(?:[.,]\d+)?", t.replace(" ", ""))
    if not m:
        return None
    try:
        return float(m.group(0).replace(",", "."))
    except ValueError:
        return None


def les_heltall(tekst):
    v = les_tall(tekst)
    return None if v is None else int(round(v))

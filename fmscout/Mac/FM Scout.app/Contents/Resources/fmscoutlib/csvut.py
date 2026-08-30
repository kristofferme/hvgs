"""CSV ut.

Standard er semikolon og desimalkomma, som er det Excel på en norsk Mac åpner
uten å spørre. Skal tallene inn i pandas eller R, bruk «--skilletegn ,».
"""

from __future__ import annotations

import csv
import io
from pathlib import Path

from .spillere import FELT_FOR


def _celle(verdi, desimal: str):
    if verdi is None:
        return ""
    if isinstance(verdi, bool):
        return "ja" if verdi else "nei"
    if isinstance(verdi, float):
        if verdi == int(verdi):
            return str(int(verdi))
        return f"{verdi:.2f}".replace(".", desimal) if desimal != "." else f"{verdi:.2f}"
    if isinstance(verdi, list):
        return ", ".join(str(v) for v in verdi)
    return str(verdi)


def skriv(fil, rader, kolonner, *, skilletegn: str = ";", desimal: str | None = None) -> None:
    if desimal is None:
        desimal = "," if skilletegn == ";" else "."
    skriver = csv.writer(fil, delimiter=skilletegn, lineterminator="\r\n",
                         quoting=csv.QUOTE_MINIMAL)
    skriver.writerow([FELT_FOR[k].navn if k in FELT_FOR else k for k in kolonner])
    for rad in rader:
        skriver.writerow([_celle(rad.get(k), desimal) for k in kolonner])


def til_tekst(rader, kolonner, *, skilletegn: str = ";", desimal: str | None = None) -> str:
    buffer = io.StringIO()
    skriv(buffer, rader, kolonner, skilletegn=skilletegn, desimal=desimal)
    return buffer.getvalue()


def til_fil(sti, rader, kolonner, *, skilletegn: str = ";", desimal: str | None = None) -> Path:
    sti = Path(sti).expanduser()
    # utf-8-sig: BOM-en gjør at Excel skjønner at æ, ø og å er utf-8.
    with sti.open("w", encoding="utf-8-sig", newline="") as f:
        skriv(f, rader, kolonner, skilletegn=skilletegn, desimal=desimal)
    return sti

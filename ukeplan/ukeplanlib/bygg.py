"""Setter dataene inn i malen og skriver én selvstendig HTML-fil."""

from __future__ import annotations

import datetime as dt
import json
from pathlib import Path

MAPPE = Path(__file__).resolve().parent.parent / "mal"
MAL = MAPPE / "side.html"
FONTER = MAPPE / "fonter.css"
NETTFONTER = (
    '@import url("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800'
    '&family=Instrument+Sans:wght@400..600&family=DM+Mono:wght@400;500&display=swap");'
)


SKALL = (
    '<!doctype html>\n<html lang="nb">\n<meta charset="utf-8">\n'
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
)


def bygg_html(data: dict, hel_side: bool = True) -> str:
    mal = MAL.read_text(encoding="utf-8")
    # Skriftene legges inn i fila så siden holder seg lik uten nett.
    fonter = FONTER.read_text(encoding="utf-8") if FONTER.exists() else NETTFONTER
    tittel = f"Ukeplan {data['skole']}"
    generert = dt.datetime.now().strftime("%-d. %b %H:%M").lower()
    side = (
        mal.replace("__DATA__", json.dumps(data, ensure_ascii=False, indent=1))
        .replace("__FONTER__", fonter)
        .replace("__TITTEL__", tittel)
        .replace("__GENERERT__", generert)
    )
    return SKALL + side + "\n</html>\n" if hel_side else side


def skriv(data: dict, sti: Path) -> Path:
    sti = Path(sti)
    sti.parent.mkdir(parents=True, exist_ok=True)
    sti.write_text(bygg_html(data), encoding="utf-8")
    return sti

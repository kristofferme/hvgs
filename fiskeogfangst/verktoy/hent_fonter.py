#!/usr/bin/env python3
"""Henter skriftene én gang og legger dem inn i src/fonter.css som data-URI.

Læremiddelet skal virke uten nett – på båten, på skolens PC-er og på mobilen.
Da må skriftene ligge i fila. Kjøres bare når skriftvalget endres.
"""

from __future__ import annotations

import base64
import re
import urllib.request
from pathlib import Path

SRC = Path(__file__).resolve().parent.parent / "src"
AGENT = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
FAMILIER = [
    "Barlow+Condensed:wght@500;600;700;800",
    "Atkinson+Hyperlegible+Next:ital,wght@0,400..700;1,400",
    "IBM+Plex+Mono:wght@400;500;600",
    "Big+Shoulders+Stencil+Display:wght@800",
]
BEHOLD = ("latin",)


def hent(url: str) -> bytes:
    bestilling = urllib.request.Request(url, headers={"User-Agent": AGENT})
    with urllib.request.urlopen(bestilling, timeout=60) as svar:
        return svar.read()


def main() -> None:
    url = "https://fonts.googleapis.com/css2?" + "&".join(f"family={f}" for f in FAMILIER) + "&display=swap"
    css = hent(url).decode("utf-8")
    ut = ["/* Skriftene ligger inne i fila, så læremiddelet virker uten nett. */"]
    for blokk in re.finditer(r"/\* ([\w-]+) \*/\s*(@font-face \{.*?\})", css, re.S):
        subsett, regel = blokk.group(1), blokk.group(2)
        if subsett not in BEHOLD:
            continue
        adresse = re.search(r"url\((https://[^)]+\.woff2)\)", regel)
        if not adresse:
            continue
        data = base64.b64encode(hent(adresse.group(1))).decode("ascii")
        ut.append(regel.replace(adresse.group(1), f"data:font/woff2;base64,{data}"))
    (SRC / "fonter.css").write_text("\n".join(ut) + "\n", encoding="utf-8")
    kb = (SRC / "fonter.css").stat().st_size // 1024
    print(f"src/fonter.css · {len(ut) - 1} skriftsnitt · {kb} kB")


if __name__ == "__main__":
    main()

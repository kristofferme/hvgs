#!/usr/bin/env python3
"""Setter sammen presentasjonen til én fil: eksamen/index.html.

Skriftene, stilen og skriptet legges inn i fila, så den virker uten nett –
på klasserommets PC, på mobilen og som vedlegg i Teams.

    python3 bygg.py
"""

from __future__ import annotations

from pathlib import Path

MAPPE = Path(__file__).resolve().parent
MAL = MAPPE / "mal"
FONTER = MAPPE.parent / "ukeplan" / "mal" / "fonter.css"
NETTFONTER = (
    '@import url("https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500..800'
    '&family=Instrument+Sans:wght@400..600&family=DM+Mono:wght@400;500&display=swap");'
)


def main() -> None:
    side = (MAL / "side.html").read_text(encoding="utf-8")
    fonter = FONTER.read_text(encoding="utf-8") if FONTER.exists() else NETTFONTER
    ferdig = (
        side.replace("__FONTER__", fonter)
        .replace("__STIL__", (MAL / "stil.css").read_text(encoding="utf-8"))
        .replace("__SKRIPT__", (MAL / "presentasjon.js").read_text(encoding="utf-8"))
    )
    ut = MAPPE / "index.html"
    ut.write_text(ferdig, encoding="utf-8")
    print(f"{ut.relative_to(MAPPE.parent)} · {ut.stat().st_size // 1024} kB")


if __name__ == "__main__":
    main()

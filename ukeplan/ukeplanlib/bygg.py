"""Setter dataene inn i malen og skriver én selvstendig HTML-fil."""

from __future__ import annotations

import base64
import datetime as dt
import json
from pathlib import Path

BILDETYPER = {".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
              ".svg": "image/svg+xml", ".webp": "image/webp", ".gif": "image/gif"}

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


def legg_inn_logo(data: dict, *mapper: Path) -> list[str]:
    """Leser logofila og legger den inn i dataene som data-URI.

    Letes etter ved siden av arbeidsboka først, så i verktøymappa."""
    data["logo"] = ""
    fil = (data.get("logofil") or "").strip()
    if not fil:
        return []
    sti = Path(fil)
    if not sti.is_absolute():
        for mappe in list(mapper) + [MAPPE.parent]:
            if (Path(mappe) / fil).exists():
                sti = Path(mappe) / fil
                break
    if not sti.exists():
        steder = " eller ".join(str(Path(m) / fil) for m in list(mapper) + [MAPPE.parent])
        return [f"Fant ingen logo på {steder}. Nettsiden bruker skolenavnet i stedet."]
    type_ = BILDETYPER.get(sti.suffix.lower())
    if not type_:
        return [f"Logoen «{sti.name}» er av en type nettleseren ikke viser. "
                "Bruk png, jpg, svg eller webp."]
    data["logo"] = f"data:{type_};base64," + base64.b64encode(sti.read_bytes()).decode("ascii")
    return []


def bygg_html(data: dict, hel_side: bool = True) -> str:
    mal = MAL.read_text(encoding="utf-8")
    # Skriftene legges inn i fila så siden holder seg lik uten nett.
    fonter = FONTER.read_text(encoding="utf-8") if FONTER.exists() else NETTFONTER
    tittel = f"{data.get('overskrift') or data.get('tekst', {}).get('ukeplan', 'Ukeplan')} {data['skole']}"
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

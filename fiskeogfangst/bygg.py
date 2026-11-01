#!/usr/bin/env python3
"""Bygger læremiddelet til én selvstendig HTML-fil.

    python3 bygg.py            # lager publisert/index.html
    python3 bygg.py --artefakt # lager i tillegg publisert/artefakt.html

Alt – skrifter, tegninger, øvinger og lærerens egne bilder i bilder/ – legges
inn i fila. Den kan deles i Teams, sendes på e-post, legges på en minnepinne
og åpnes om bord uten nett. Ingen avhengigheter utover Python 3.
"""

from __future__ import annotations

import base64
import json
import mimetypes
import sys
from pathlib import Path

ROT = Path(__file__).resolve().parent
SRC = ROT / "src"
UT = ROT / "publisert"

CSS = ["fonter.css", "css/grunn.css", "css/skall.css", "css/blokker.css", "css/verktoy.css", "css/hav.css"]


def js_filer() -> list[Path]:
    """Kjernen først, så figurer, innhold og verktøy, og appen til slutt."""
    rekke = [SRC / "js" / "kjerne.js"]
    for mappe in ("fig", "innhold", "verktoy"):
        rekke += sorted((SRC / "js" / mappe).glob("*.js"))
    rekke.append(SRC / "js" / "app.js")
    return rekke


def bilder() -> dict[str, str]:
    """Lærerens egne bilder i bilder/ blir data-URI-er som modulene kan vise."""
    ut: dict[str, str] = {}
    mappe = ROT / "bilder"
    for fil in sorted(mappe.glob("*")):
        if fil.suffix.lower() not in (".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg"):
            continue
        storrelse = fil.stat().st_size
        if storrelse > 1_500_000:
            print(f"  ! {fil.name} er {storrelse // 1024} kB – skaler ned til under 1,5 MB (maks 1600 px bredde holder).")
        mime = mimetypes.guess_type(fil.name)[0] or "image/jpeg"
        ut[fil.name] = f"data:{mime};base64," + base64.b64encode(fil.read_bytes()).decode("ascii")
    return ut


def foto() -> dict[str, dict]:
    """Fotografiene i foto/ med kreditering fra foto/kreditter.json (CC BY 2.0)."""
    mappe = ROT / "foto"
    kred = json.loads((mappe / "kreditter.json").read_text(encoding="utf-8"))
    ut: dict[str, dict] = {}
    for navn, info in kred.items():
        fil = mappe / f"{navn}.webp"
        if not fil.exists():
            print(f"  ! mangler {fil.name}")
            continue
        ut[navn] = dict(info, src="data:image/webp;base64," + base64.b64encode(fil.read_bytes()).decode("ascii"))
    return ut


def les(sti: Path) -> str:
    return sti.read_text(encoding="utf-8")


def main() -> None:
    artefakt = "--artefakt" in sys.argv
    css = "\n".join(les(SRC / f) for f in CSS)
    js = "\n;\n".join(les(f) for f in js_filer())
    bildedata = bilder()
    fotodata = foto()
    forhånd = "window.FF_BILDER = " + json.dumps(bildedata) + ";\nwindow.FF_FOTO = " + json.dumps(fotodata, ensure_ascii=False) + ";\n"
    mal = les(SRC / "index.html")
    side = (mal.replace("/*CSS*/", css)
               .replace("/*JS*/", (forhånd + js).replace("</script", "<\\/script")))
    UT.mkdir(exist_ok=True)
    (UT / "index.html").write_text(side, encoding="utf-8")
    kb = len(side.encode("utf-8")) // 1024
    print(f"publisert/index.html · {kb} kB · {len(js_filer())} skript · {len(fotodata)} foto · {len(bildedata)} egne bilder")

    if artefakt:
        # Artefaktvisningen legger selv på <html>, <head> og <body>.
        start = side.index("<title>")
        slutt_head = side.index("</head>")
        head = side[start:slutt_head]
        body = side[side.index("<body>") + len("<body>"):side.index("</body>")]
        (UT / "artefakt.html").write_text(head + body, encoding="utf-8")
        print("publisert/artefakt.html")


if __name__ == "__main__":
    main()

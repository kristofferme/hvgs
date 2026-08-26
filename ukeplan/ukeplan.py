#!/usr/bin/env python3
"""Ukeplan – regneark inn, nettside ut.

    python3 ukeplan.py ny            lager en tom arbeidsbok
    python3 ukeplan.py ny --demo     lager en ferdig utfylt arbeidsbok
    python3 ukeplan.py bygg          leser arbeidsboka og skriver ukeplan.html
    python3 ukeplan.py sjekk         leser arbeidsboka og sier hva som skurrer
"""

from __future__ import annotations

import argparse
import datetime as dt
import subprocess
import sys
import time
from pathlib import Path

HER = Path(__file__).resolve().parent
sys.path.insert(0, str(HER))

from ukeplanlib import demo as demomodul  # noqa: E402
from ukeplanlib.bygg import legg_inn_logo, skriv  # noqa: E402
from ukeplanlib.felles import uke_til_mandag  # noqa: E402
from ukeplanlib.les import les  # noqa: E402
from ukeplanlib.regneark import lag_arbeidsbok  # noqa: E402

STANDARDFIL = HER / "Ukeplan.xlsx"
STANDARDUT = HER / "ukeplan.html"
NETLIFY_SIDE = "hvgs-vekeplan"
NETLIFY_ADRESSE = "https://hvgs-vekeplan.netlify.app"


def si(tekst: str = "") -> None:
    print(tekst)


def kommando_ny(args) -> int:
    fil = Path(args.fil)
    if fil.exists() and not args.overskriv:
        si(f"{fil} finnes allerede. Legg til --overskriv om den skal erstattes.")
        return 1
    forste = uke_til_mandag(args.uke, dt.date.today()) if args.uke else None
    lag_arbeidsbok(
        fil,
        skole=args.skole or (demomodul.SKOLE if args.demo else None),
        uke=args.uke,
        forste_dag=forste,
        klasser=demomodul.KLASSER if args.demo else None,
        fag=demomodul.FAG if args.demo else None,
        innhold=demomodul.demoinnhold() if args.demo else None,
        fagvalg=demomodul.FAGVALG if args.demo else None,
        sprak=args.sprak or (demomodul.SPRAK if args.demo else "bokmal"),
        logo=demomodul.LOGO if args.demo else "",
    )
    si(f"Arbeidsbok: {fil}")
    si("Åpne den, start på arket «Start her», og kjør så:  python3 ukeplan.py bygg")
    return 0


def kommando_bygg(args) -> int:
    fil = Path(args.fil)
    if not fil.exists():
        si(f"Fant ikke {fil}. Lag den først med:  python3 ukeplan.py ny")
        return 1
    resultat = les(fil)
    resultat.merknader += legg_inn_logo(resultat.data, fil.parent)
    ut = skriv(resultat.data, Path(args.ut))
    data = resultat.data
    _oppsummer(data)
    _merknader(resultat.merknader)
    si(f"Nettside: {ut}")
    return 0


def _oppsummer(data) -> None:
    uker = data["uker"]
    punkt = sum(len([r for r in u["rader"] if r["tekst"]]) for u in uker)
    si(f"{data['skole']} · {len(uker)} uker: " + ", ".join(str(u["uke"]) for u in uker))
    si(f"{len(data['klasser'])} klasser · {sum(len(u['rader']) for u in uker)} rader · "
       f"{punkt} punkt å gjøre · {sum(len(u['beskjeder']) for u in uker)} beskjeder")


def kommando_publiser(args) -> int:
    """Bygger planen og legger den ut på Netlify."""
    fil = Path(args.fil)
    mappe = Path(args.mappe)
    kode = kommando_bygg(argparse.Namespace(fil=str(fil), ut=str(mappe / "index.html")))
    if kode:
        return kode
    si("")
    si(f"Legger ut på Netlify ({args.side}) …")
    kommando = ["npx", "--yes", "netlify-cli", "deploy", "--prod",
                "--dir", str(mappe), "--site", args.side]
    try:
        resultat = subprocess.run(kommando, check=False)
    except FileNotFoundError:
        si("Fant ikke npx. Installer Node.js, eller legg ut mappa manuelt:")
        si(f"  {mappe}  →  https://app.netlify.com/projects/{args.side}/deploys")
        return 1
    if resultat.returncode:
        si("Netlify svarte ikke som forventet. Er du logget inn? Kjør:  npx netlify-cli login")
        return resultat.returncode
    si(f"Ute på {args.adresse}")
    return 0


def kommando_folg(args) -> int:
    """Bygger på nytt hver gang arbeidsboka lagres."""
    fil = Path(args.fil)
    ut = Path(args.ut)
    si(f"Ser på {fil.name}. Bygger {ut.name} hver gang du lagrer. Ctrl+C for å stoppe.")
    sist = None
    forrige_feil = ""
    while True:
        try:
            stempel = fil.stat().st_mtime
        except FileNotFoundError:
            time.sleep(1)
            continue
        if stempel != sist:
            time.sleep(0.5)          # la Excel bli ferdig med å skrive
            klokke = dt.datetime.now().strftime("%H:%M:%S")
            try:
                resultat = les(fil)
                resultat.merknader += legg_inn_logo(resultat.data, fil.parent)
                skriv(resultat.data, ut)
                punkt = sum(len([r for r in u["rader"] if r["tekst"]]) for u in resultat.data["uker"])
                si(f"{klokke}  bygget · {punkt} punkt å gjøre"
                   + (f" · {len(resultat.merknader)} merknader" if resultat.merknader else ""))
                forrige_feil = ""
            except Exception as feil:                      # noqa: BLE001 – fila kan være halvskrevet
                if str(feil) != forrige_feil:
                    si(f"{klokke}  fikk ikke lest fila ennå ({feil}). Prøver igjen ved neste lagring.")
                    forrige_feil = str(feil)
            sist = stempel
        time.sleep(0.8)


def kommando_sjekk(args) -> int:
    fil = Path(args.fil)
    if not fil.exists():
        si(f"Fant ikke {fil}.")
        return 1
    resultat = les(fil)
    if not resultat.merknader:
        si("Alt henger sammen. Ukearket og beskjedene bruker klasser og fag som finnes i Oppsett.")
        return 0
    _merknader(resultat.merknader)
    return 0


def _merknader(merknader) -> None:
    if not merknader:
        return
    si()
    si("Verdt å se på:")
    for m in merknader:
        si(f"  – {m}")
    si()


def main(argv=None) -> int:
    p = argparse.ArgumentParser(prog="ukeplan.py", description="Lag ukeplaner i Excel, les dem på nett.")
    under = p.add_subparsers(dest="kommando", required=True)

    ny = under.add_parser("ny", help="lag en ny arbeidsbok")
    ny.add_argument("--fil", default=str(STANDARDFIL))
    ny.add_argument("--skole", default=None)
    ny.add_argument("--uke", type=int, default=None, help="ukenummer, f.eks. 36")
    ny.add_argument("--demo", action="store_true", help="fyll den med et ferdig eksempel")
    ny.add_argument("--sprak", choices=["bokmal", "nynorsk"], default=None,
                    help="målform i arbeidsboka og på nettsiden")
    ny.add_argument("--overskriv", action="store_true")
    ny.set_defaults(funksjon=kommando_ny)

    bygg = under.add_parser("bygg", help="skriv nettsiden ut fra arbeidsboka")
    bygg.add_argument("--fil", default=str(STANDARDFIL))
    bygg.add_argument("--ut", default=str(STANDARDUT), help="hvor HTML-fila skal ligge")
    bygg.set_defaults(funksjon=kommando_bygg)

    folg = under.add_parser("følg", aliases=["folg"],
                            help="bygg automatisk hver gang arbeidsboka lagres")
    folg.add_argument("--fil", default=str(STANDARDFIL))
    folg.add_argument("--ut", default=str(STANDARDUT))
    folg.set_defaults(funksjon=kommando_folg)

    publiser = under.add_parser("publiser", help="bygg og legg ut på Netlify")
    publiser.add_argument("--fil", default=str(STANDARDFIL))
    publiser.add_argument("--mappe", default=str(HER / "publisert"))
    publiser.add_argument("--side", default=NETLIFY_SIDE)
    publiser.add_argument("--adresse", default=NETLIFY_ADRESSE)
    publiser.set_defaults(funksjon=kommando_publiser)

    sjekk = under.add_parser("sjekk", help="se etter skrivefeil og rader som ikke henger sammen")
    sjekk.add_argument("--fil", default=str(STANDARDFIL))
    sjekk.set_defaults(funksjon=kommando_sjekk)

    args = p.parse_args(argv)
    return args.funksjon(args)


if __name__ == "__main__":
    raise SystemExit(main())

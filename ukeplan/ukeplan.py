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
import sys
from pathlib import Path

HER = Path(__file__).resolve().parent
sys.path.insert(0, str(HER))

from ukeplanlib import demo as demomodul  # noqa: E402
from ukeplanlib.bygg import skriv  # noqa: E402
from ukeplanlib.felles import uke_til_mandag  # noqa: E402
from ukeplanlib.les import les  # noqa: E402
from ukeplanlib.regneark import lag_arbeidsbok  # noqa: E402

STANDARDFIL = HER / "Ukeplan.xlsx"
STANDARDUT = HER / "ukeplan.html"


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
        skole=args.skole or (demomodul.SKOLE if args.demo else "Skolen"),
        uke=args.uke,
        forste_dag=forste,
        klasser=demomodul.KLASSER if args.demo else None,
        okter=demomodul.OKTER if args.demo else None,
        innhold=demomodul.demoinnhold() if args.demo else None,
        timeplan=demomodul.TIMEPLAN if args.demo else None,
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
    ut = skriv(resultat.data, Path(args.ut))
    data = resultat.data
    uker = data["uker"]
    si(f"{data['skole']} · {len(uker)} uker: " + ", ".join(str(u["uke"]) for u in uker))
    si(f"{len(data['klasser'])} klasser · {len(uker[0]['timer']) if uker else 0} timer i timeplanen · "
       f"{sum(len(u['oppgaver']) for u in uker)} lekser og frister · "
       f"{sum(len(u['beskjeder']) for u in uker)} beskjeder")
    _merknader(resultat.merknader)
    si(f"Nettside: {ut}")
    return 0


def kommando_sjekk(args) -> int:
    fil = Path(args.fil)
    if not fil.exists():
        si(f"Fant ikke {fil}.")
        return 1
    resultat = les(fil)
    if not resultat.merknader:
        si("Alt henger sammen. Timeplanen, uka og beskjedene bruker klasser og fag som finnes i Oppsett.")
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
    ny.add_argument("--overskriv", action="store_true")
    ny.set_defaults(funksjon=kommando_ny)

    bygg = under.add_parser("bygg", help="skriv nettsiden ut fra arbeidsboka")
    bygg.add_argument("--fil", default=str(STANDARDFIL))
    bygg.add_argument("--ut", default=str(STANDARDUT), help="hvor HTML-fila skal ligge")
    bygg.set_defaults(funksjon=kommando_bygg)

    sjekk = under.add_parser("sjekk", help="se etter skrivefeil og rader som ikke henger sammen")
    sjekk.add_argument("--fil", default=str(STANDARDFIL))
    sjekk.set_defaults(funksjon=kommando_sjekk)

    args = p.parse_args(argv)
    return args.funksjon(args)


if __name__ == "__main__":
    raise SystemExit(main())

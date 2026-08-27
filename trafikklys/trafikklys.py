#!/usr/bin/env python3
"""Trafikklysmodellen – regneark inn, møtevisning ut.

    python3 trafikklys.py ny            lager en tom arbeidsbok
    python3 trafikklys.py ny --demo     lager en ferdig utfylt arbeidsbok
    python3 trafikklys.py bygg          leser arbeidsboka og skriver Elevstatus.html
    python3 trafikklys.py sjekk         leser arbeidsboka og sier hva som skurrer
    python3 trafikklys.py lister        lager oppsettet for Microsoft Lists

Arbeidsboka og møtevisningen inneholder personopplysninger. De hører hjemme i
Teams, bak tilgangsstyringen skolen allerede har – ikke på en åpen nettadresse.
Derfor finnes det med vilje ingen «publiser»-kommando her.
"""

from __future__ import annotations

import argparse
import datetime as dt
import sys
import time
from pathlib import Path

HER = Path(__file__).resolve().parent
sys.path.insert(0, str(HER))

from trafikklyslib import demo as demomodul  # noqa: E402
from trafikklyslib import lister as listermodul  # noqa: E402
from trafikklyslib.bygg import legg_inn_logo, skriv  # noqa: E402
from trafikklyslib.les import les  # noqa: E402
from trafikklyslib.regneark import lag_arbeidsbok  # noqa: E402

STANDARDFIL = HER / "Trafikklys.xlsx"
STANDARDUT = HER / "Elevstatus.html"
STANDARDLISTER = HER / "lister"


def si(tekst: str = "") -> None:
    print(tekst)


def kommando_ny(args) -> int:
    fil = Path(args.fil)
    if fil.exists() and not args.overskriv:
        si(f"{fil} finnes allerede. Legg til --overskriv om den skal erstattes.")
        return 1
    lag_arbeidsbok(
        fil,
        skole=args.skole or (demomodul.SKOLE if args.demo else None),
        skolear=demomodul.SKOLEAR if args.demo else _skolear(),
        klasser=demomodul.KLASSER if args.demo else None,
        elever=demomodul.ELEVAR if args.demo else None,
        moter=demomodul.MOTER if args.demo else _forslag_til_moter(),
        innmeldingar=demomodul.innmeldingar() if args.demo else None,
        tiltak=demomodul.tiltak() if args.demo else None,
        sprak=args.sprak or (demomodul.SPRAK if args.demo else "bokmal"),
        logo=demomodul.LOGO if args.demo else "",
    )
    si(f"Arbeidsbok: {fil}")
    si("Åpne den, start på arket «Start her», og kjør så:  python3 trafikklys.py bygg")
    if not args.demo:
        si("")
        si("Arbeidsboka inneholder personopplysninger så snart du fyller den ut.")
        si("Legg den i Teams, ikke i GitHub.")
    return 0


def _skolear() -> str:
    i_dag = dt.date.today()
    start = i_dag.year if i_dag.month >= 8 else i_dag.year - 1
    return f"{start}/{start + 1}"


def _forslag_til_moter() -> list[tuple[str, dt.date]]:
    """Fire møter i året, som et utgangspunkt skolen flytter på."""
    i_dag = dt.date.today()
    start = i_dag.year if i_dag.month >= 8 else i_dag.year - 1
    return [
        ("1 · Høst", dt.date(start, 9, 15)),
        ("2 · Før jul", dt.date(start, 11, 24)),
        ("3 · Etter jul", dt.date(start + 1, 2, 3)),
        ("4 · Vår", dt.date(start + 1, 4, 21)),
    ]


def _les(fil: Path):
    if not fil.exists():
        si(f"Fant ikke {fil}. Lag den først med:  python3 trafikklys.py ny")
        return None
    return les(fil)


def kommando_bygg(args) -> int:
    fil = Path(args.fil)
    resultat = _les(fil)
    if resultat is None:
        return 1
    resultat.merknader += legg_inn_logo(resultat.data, fil.parent)
    ut = skriv(resultat.data, Path(args.ut))
    _oppsummer(resultat.data)
    _merknader(resultat.merknader)
    si(f"Møtevisning: {ut}")
    si("Åpne fila i nettleseren og del skjermen i møtet. Ikke legg den ut på nett.")
    return 0


def _oppsummer(data) -> None:
    inn = data["innmeldingar"]
    tal = {lys: sum(1 for i in inn if i["lys"] == lys) for lys in ("gronn", "gul", "rod")}
    apne = sum(1 for t in data["tiltak"] if t["apen"])
    si(f"{data['skole']} · {data['skolear']} · {len(data['moter'])} møter · "
       f"{len(data['klasser'])} klasser")
    si(f"{len(inn)} innmeldinger: {tal['rod']} røde, {tal['gul']} gule, {tal['gronn']} grønne")
    si(f"{len(data['tiltak'])} tiltak, {apne} av dem åpne")


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
                si(f"{klokke}  bygget · {len(resultat.data['innmeldingar'])} innmeldinger"
                   + (f" · {len(resultat.merknader)} merknader" if resultat.merknader else ""))
                forrige_feil = ""
            except Exception as feil:                  # noqa: BLE001 – fila kan være halvskrevet
                if str(feil) != forrige_feil:
                    si(f"{klokke}  fikk ikke lest fila ennå ({feil}). Prøver igjen ved neste lagring.")
                    forrige_feil = str(feil)
            sist = stempel
        time.sleep(0.8)


def kommando_sjekk(args) -> int:
    resultat = _les(Path(args.fil))
    if resultat is None:
        return 1
    _oppsummer(resultat.data)
    if not resultat.merknader:
        si("")
        si("Alt henger sammen. Innmeldingene bruker klasser, elever og områder som finnes i Oppsett.")
        return 0
    _merknader(resultat.merknader)
    return 0


def kommando_lister(args) -> int:
    resultat = _les(Path(args.fil))
    if resultat is None:
        return 1
    filer = listermodul.skriv(Path(args.mappe), resultat.data)
    si(f"Oppsett for Microsoft Lists i {Path(args.mappe)}:")
    for f in filer:
        si(f"  {f.name}")
    si("")
    si("Oppskriften står i lister/LES-MEG.md.")
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
    p = argparse.ArgumentParser(
        prog="trafikklys.py",
        description="Trafikklysmodellen: lærerne melder inn i Excel, møtet får ett rutenett.")
    under = p.add_subparsers(dest="kommando", required=True)

    ny = under.add_parser("ny", help="lag en ny arbeidsbok")
    ny.add_argument("--fil", default=str(STANDARDFIL))
    ny.add_argument("--skole", default=None)
    ny.add_argument("--demo", action="store_true", help="fyll den med et ferdig eksempel")
    ny.add_argument("--sprak", choices=["bokmal", "nynorsk"], default=None,
                    help="målform i arbeidsboka og i møtevisningen")
    ny.add_argument("--overskriv", action="store_true")
    ny.set_defaults(funksjon=kommando_ny)

    bygg = under.add_parser("bygg", help="skriv møtevisningen ut fra arbeidsboka")
    bygg.add_argument("--fil", default=str(STANDARDFIL))
    bygg.add_argument("--ut", default=str(STANDARDUT))
    bygg.set_defaults(funksjon=kommando_bygg)

    folg = under.add_parser("følg", aliases=["folg"],
                            help="bygg automatisk hver gang arbeidsboka lagres")
    folg.add_argument("--fil", default=str(STANDARDFIL))
    folg.add_argument("--ut", default=str(STANDARDUT))
    folg.set_defaults(funksjon=kommando_folg)

    sjekk = under.add_parser("sjekk", help="se etter skrivefeil og rader som ikke henger sammen")
    sjekk.add_argument("--fil", default=str(STANDARDFIL))
    sjekk.set_defaults(funksjon=kommando_sjekk)

    lister = under.add_parser("lister", help="lag oppsettet for Microsoft Lists")
    lister.add_argument("--fil", default=str(STANDARDFIL))
    lister.add_argument("--mappe", default=str(STANDARDLISTER))
    lister.set_defaults(funksjon=kommando_lister)

    args = p.parse_args(argv)
    return args.funksjon(args)


if __name__ == "__main__":
    raise SystemExit(main())

#!/usr/bin/env python3
"""fmscout – speider for Football Manager-saver.

    python3 fmscout.py demo                     prøv verktøyet uten en save
    python3 fmscout.py åpne save.fm             tabellen i nettleseren
    python3 fmscout.py åpne eksport.html        samme, fra en FM-eksport
    python3 fmscout.py eksporter save.fm -o spillere.csv
    python3 fmscout.py sjekk save.fm            hva ligger i fila?
    python3 fmscout.py kalibrer save.fm --ankere ankere.json
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

HER = Path(__file__).resolve().parent
sys.path.insert(0, str(HER))


from fmscoutlib import csvut, tjener                                   # noqa: E402
from fmscoutlib.beholder import Beholder                               # noqa: E402
from fmscoutlib.datasett import Datasett                               # noqa: E402
from fmscoutlib.demo import lag_demosave                               # noqa: E402
from fmscoutlib.felles import (arbeidsmappe, feil, si, storrelse,      # noqa: E402
                               tallformat)
from fmscoutlib.kalibrer import Anker, kalibrer                        # noqa: E402
from fmscoutlib.last import Okt, last, skjema_for, skjemamappe              # noqa: E402
from fmscoutlib.profil import Profil                                   # noqa: E402
from fmscoutlib.rapport import skriv_rapport                           # noqa: E402
from fmscoutlib.spillere import FELT, FELT_FOR, STANDARDKOLONNER       # noqa: E402
from fmscoutlib.tabeller import finn_evnekandidater, finn_tabeller     # noqa: E402
from fmscoutlib.tekst import stikkprove                                # noqa: E402

ANKERMAL = [
    {
        "navn": "Skriv navnet nøyaktig som i FM",
        "alder": 24,
        "klubb": "Klubben spilleren står i",
        "nasjonalitet": "Landet spilleren er fra",
        "posisjoner": "M (C), AM (C)",
        "attributter": {
            "Pas": 15, "Tec": 14, "Dec": 13, "Fir": 14, "Vis": 15,
            "Acc": 12, "Pac": 12, "Sta": 15, "Str": 11, "Bal": 13,
            "Wor": 14, "Tea": 13, "OtB": 12, "Cmp": 13, "Ant": 13,
        },
    }
]


def les_ankere(sti) -> list[Anker]:
    rå = json.loads(Path(sti).expanduser().read_text(encoding="utf-8"))
    if isinstance(rå, dict):
        rå = [rå]
    return [Anker.fra_dict(a) for a in rå]


def velg_kolonner(valg: str, datasett: Datasett) -> list[str]:
    tilgjengelig = [f.nokkel for f in FELT if f.nokkel not in datasett.tomme]
    if not valg or valg == "alle":
        return tilgjengelig
    if valg == "standard":
        return [k for k in STANDARDKOLONNER if k in tilgjengelig]
    ut = []
    for bit in valg.split(","):
        bit = bit.strip()
        if bit in FELT_FOR:
            ut.append(bit)
        else:
            feil(f"Ukjent kolonne: {bit}")
    return ut or [k for k in STANDARDKOLONNER if k in tilgjengelig]


# --- kommandoer -----------------------------------------------------------


def kommando_demo(args) -> int:
    mappe = Path(args.mappe).expanduser()
    mappe.mkdir(parents=True, exist_ok=True)
    sti = mappe / "demo.fm"
    si("Lager en oppdiktet save …")
    _, profil = lag_demosave(sti, antall=args.antall)
    skjema = skjema_for(sti)
    Profil.fra_dict(profil).lagre(skjema)
    si(f"  {sti}  ({storrelse(sti.stat().st_size)})")
    si(f"  skjema: {skjema}")
    si("")
    if args.bare_fil:
        si("Åpne den med:  python3 fmscout.py åpne " + str(sti))
        return 0
    tjener.start(Okt.apne(sti, melding=si), port=args.port, apne=not args.ikke_apne)
    return 0


def kommando_apne(args) -> int:
    filer = args.fil
    if not filer:
        valgt = tjener.velg_fil_dialog()
        if not valgt:
            return 0
        filer = [valgt]
    if args.kalibrer_pa_nytt or args.ankere:
        # Tving fram ny kalibrering før økta settes opp.
        last(filer, skjema=args.skjema,
             ankere=les_ankere(args.ankere) if args.ankere else None,
             tving_kalibrering=True, grense=args.grense, melding=si)
    okt = Okt.apne(filer, skjema=args.skjema, grense=args.grense, melding=si)
    for merknad in okt.datasett.merknader:
        si(f"  ⚠︎ {merknad}")
    tjener.start(okt, port=args.port, apne=not args.ikke_apne)
    return 0


def kommando_eksporter(args) -> int:
    datasett = last(args.fil, skjema=args.skjema,
                    ankere=les_ankere(args.ankere) if args.ankere else None,
                    grense=args.grense, melding=si)
    kolonner = velg_kolonner(args.kolonner, datasett)
    ut = Path(args.ut).expanduser()
    csvut.til_fil(ut, datasett.rader, kolonner, skilletegn=args.skilletegn)
    si(f"{tallformat(len(datasett.rader))} spillere og {len(kolonner)} kolonner → {ut}")
    return 0


def kommando_sjekk(args) -> int:
    sti = Path(args.fil).expanduser()
    beholder = Beholder.apne(sti, tving=args.pakk_ut_pa_nytt, melding=si)
    si("")
    si(f"Fil        {sti}")
    si(f"Størrelse  {storrelse(sti.stat().st_size)}")
    si(f"Blokker    {len(beholder)}  ({storrelse(beholder.utpakket)} utpakket)")
    if beholder.header:
        si(f"Header     {beholder.header[:16].hex(' ')}")
    si("")
    si("De største blokkene:")
    for blokk in sorted(beholder.blokker, key=lambda b: b.storrelse, reverse=True)[:8]:
        si(f"  {blokk.nr:5d}  {storrelse(blokk.storrelse):>10}  "
           f"× {blokk.forhold:4.1f} sammenpressing  ved {blokk.offset}")
    si("")
    si("Smakebiter av tekst i fila:")
    for blokk in sorted(beholder.blokker, key=lambda b: b.storrelse, reverse=True)[:2]:
        for tekst in stikkprove(beholder.data(blokk.nr), 8):
            si(f"  blokk {blokk.nr}: {tekst[:70]}")
    si("")
    si("Tabeller som ser ut som spillere:")
    tabeller = finn_tabeller(beholder)
    if not tabeller:
        si("  ingen funnet")
    for tabell in tabeller[:5]:
        si(f"  blokk {tabell.blokk}: {tallformat(tabell.antall)} records à "
           f"{tabell.stride} B, attributtstripe på {tabell.stripelengde} bytes")
    if tabeller:
        si("")
        si("Kandidater til CA og PA i den største tabellen:")
        for k in finn_evnekandidater(beholder.data(tabeller[0].blokk), tabeller[0]):
            si(f"  offset {k.offset:4d}  {k.slag.upper():2}  {k.beskrivelse}")
    fil = skriv_rapport(sti, args.rapport, melding=lambda *_: None)
    si("")
    si(f"Rapport skrevet: {fil}")
    si("Neste steg:  python3 fmscout.py kalibrer " + str(sti))
    return 0


def kommando_kalibrer(args) -> int:
    if args.lag_ankermal:
        sti = Path(args.lag_ankermal).expanduser()
        sti.write_text(json.dumps(ANKERMAL, indent=2, ensure_ascii=False), encoding="utf-8")
        si(f"Mal skrevet: {sti}")
        si("Fyll inn to–fem spillere du finner igjen i saven, og kjør så:")
        si(f"  python3 fmscout.py kalibrer <save.fm> --ankere {sti}")
        return 0

    sti = Path(args.fil).expanduser()
    beholder = Beholder.apne(sti, melding=si)
    ankere = les_ankere(args.ankere) if args.ankere else []
    if not ankere:
        si("Ingen ankere oppgitt – da blir attributtene hetende attributt_01 og "
           "utover. Lag en mal med «kalibrer --lag-ankermal ankere.json».")
        si("")
    profil, rapport = kalibrer(beholder, ankere, melding=si)
    mål = Path(args.lagre).expanduser() if args.lagre else skjema_for(sti)
    profil.lagre(mål)
    si("")
    si(f"Skjema lagret: {mål}")
    if args.rapport:
        Path(args.rapport).expanduser().write_text(
            json.dumps(rapport, indent=1, ensure_ascii=False, default=str), encoding="utf-8")
        si(f"Rapport lagret: {args.rapport}")
    for merknad in rapport.get("merknader", []):
        si(f"  ⚠︎ {merknad}")
    si("")
    si(f"Prøv den:  python3 fmscout.py åpne {sti}")
    return 0


def kommando_skjemaer(args) -> int:
    mappe = skjemamappe()
    filer = sorted(mappe.glob("*.json"))
    si(f"Skjemaer i {mappe}:")
    if not filer:
        si("  (ingen ennå)")
    for fil in filer:
        try:
            profil = Profil.last(fil)
            si(f"  {fil.name}  –  {tallformat(profil.antall)} records, "
               f"{len(profil.attributter)} attributter, {len(profil.felt)} felt")
        except (ValueError, KeyError):
            si(f"  {fil.name}  –  (kan ikke leses)")
    return 0


def lag_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(
        prog="fmscout", description=__doc__,
        formatter_class=argparse.RawDescriptionHelpFormatter)
    under = p.add_subparsers(dest="kommando", required=True)

    d = under.add_parser("demo", help="lag og åpne en oppdiktet save")
    d.add_argument("--mappe", default=str(arbeidsmappe() / "demo"),
                   help="hvor demofila skal ligge")
    d.add_argument("--antall", type=int, default=900)
    d.add_argument("--bare-fil", action="store_true", help="lag fila, ikke åpne nettsida")
    d.add_argument("--port", type=int, default=0)
    d.add_argument("--ikke-apne", action="store_true")
    d.set_defaults(funksjon=kommando_demo)

    for navn in ("åpne", "apne", "open"):
        a = under.add_parser(navn, help="åpne en save eller en FM-eksport i nettleseren")
        a.add_argument("fil", nargs="*", help="uten filnavn får du en «velg fil»-rute")
        a.add_argument("--skjema", help="skjemafil eller navn (bare for .fm)")
        a.add_argument("--ankere", help="json med kjente spillere, til kalibrering")
        a.add_argument("--kalibrer-på-nytt", "--kalibrer-pa-nytt", dest="kalibrer_pa_nytt",
                       action="store_true")
        a.add_argument("--grense", type=int, help="les bare de første N spillerne")
        a.add_argument("--port", type=int, default=0)
        a.add_argument("--ikke-apne", "--ikke-åpne", dest="ikke_apne", action="store_true")
        a.set_defaults(funksjon=kommando_apne)

    e = under.add_parser("eksporter", help="skriv spillerne rett til csv")
    e.add_argument("fil", nargs="+")
    e.add_argument("-o", "--ut", default="spillere.csv")
    e.add_argument("--kolonner", default="alle",
                   help="alle | standard | navn,alder,ca,pa,…")
    e.add_argument("--skilletegn", default=";")
    e.add_argument("--skjema")
    e.add_argument("--ankere")
    e.add_argument("--grense", type=int)
    e.set_defaults(funksjon=kommando_eksporter)

    s = under.add_parser("sjekk", help="se hva som ligger i en .fm-fil")
    s.add_argument("fil")
    s.add_argument("--pakk-ut-på-nytt", "--pakk-ut-pa-nytt", dest="pakk_ut_pa_nytt",
                   action="store_true")
    s.add_argument("--rapport", help="hvor rapporten skal skrives")
    s.set_defaults(funksjon=kommando_sjekk)

    k = under.add_parser("kalibrer", help="finn ut hvordan saven er satt sammen")
    k.add_argument("fil", nargs="?")
    k.add_argument("--ankere", help="json med spillere du har slått opp i FM")
    k.add_argument("--lag-ankermal", help="skriv en tom ankerfil du kan fylle ut")
    k.add_argument("--lagre", help="hvor skjemaet skal lagres")
    k.add_argument("--rapport", help="skriv detaljene til en json-fil")
    k.set_defaults(funksjon=kommando_kalibrer)

    under.add_parser("skjemaer", help="list skjemaene du har").set_defaults(
        funksjon=kommando_skjemaer)
    return p


def main(argv=None) -> int:
    args = lag_parser().parse_args(argv)
    if args.kommando == "kalibrer" and not args.fil and not args.lag_ankermal:
        feil("Oppgi en .fm-fil, eller bruk --lag-ankermal.")
        return 2
    try:
        return args.funksjon(args)
    except KeyboardInterrupt:
        si("")
        return 130
    except (FileNotFoundError, RuntimeError, ValueError) as e:
        feil(f"Feil: {e}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())

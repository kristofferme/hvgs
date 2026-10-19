"""Lager arbeidsboka: elevlister per klasse, innmeldingsark og tiltaksark."""

from __future__ import annotations

import re

from openpyxl import Workbook
from openpyxl.formatting.rule import FormulaRule, Rule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.styles.differential import DifferentialStyle
from openpyxl.utils import get_column_letter
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.datavalidation import DataValidation

from .felles import (LYS, LYSFARGER, OMRADER, PROFILFARGE_STANDARD, STANDARDKLASSER,
                     lysnavn, statusnavn, tekster, tint, tolk_sprak)

SKRIFT = "Aptos Narrow"
BLEKK = "16212A"
GRA = "5B6A72"
ARK = "EFF2F0"
BAND = "F4F7F5"
KANT = Side(style="thin", color="D3D9D6")

ELEVRADER = 40          # elever per klasse
INNMELDINGSRADER = 700
TILTAKSRADER = 250
KLASSERADER = 60
OMRADERADER = 24
MOTERADER = 20


def _tint(hex_farge: str, andel: float) -> str:
    return tint(hex_farge, andel)


def _skrift(**kwargs) -> Font:
    kwargs.setdefault("name", SKRIFT)
    kwargs.setdefault("size", 11)
    kwargs.setdefault("color", BLEKK)
    return Font(**kwargs)


def _tittel(ws, celle: str, tekst: str, storrelse: int = 11) -> None:
    ws[celle] = tekst
    ws[celle].font = _skrift(bold=True, size=storrelse)


def _tabell(ws, kolonner, hoderad: int, rader: int) -> None:
    """Hoderad med hvit skrift på svart, og ferdig formaterte rader under."""
    for i, (navn, bredde) in enumerate(kolonner, start=1):
        c = ws.cell(row=hoderad, column=i, value=navn)
        c.font = _skrift(bold=True, color="FFFFFF")
        c.fill = PatternFill("solid", fgColor=BLEKK)
        c.alignment = Alignment(vertical="center", horizontal="left", indent=1)
        ws.column_dimensions[get_column_letter(i)].width = bredde
    ws.row_dimensions[hoderad].height = 26
    for rad in range(hoderad + 1, hoderad + 1 + rader):
        ws.row_dimensions[rad].height = 20
        for i, (_, bredde) in enumerate(kolonner, start=1):
            c = ws.cell(row=rad, column=i)
            c.border = Border(bottom=KANT, right=KANT)
            c.font = _skrift()
            c.alignment = Alignment(vertical="center", indent=1, wrap_text=bredde >= 50)


def _liste(ws, omrade: str, kilde: str, ledetekst: str) -> None:
    dv = DataValidation(type="list", formula1=kilde, allow_blank=True, showErrorMessage=False)
    dv.prompt = ledetekst
    dv.promptTitle = "Velg fra lista"
    dv.showInputMessage = True
    ws.add_data_validation(dv)
    dv.add(omrade)


def _lysfarger(ws, sterkt: str, svakt: str, kolonne: str, forste_rad: int, stopp: bool = True) -> None:
    """Farger lyscella kraftig og resten av raden svakt, så arket kan leses på farge alene.

    Med stopp=False kan en regel lenger ned (som rammene i Elevkort) gjelde i tillegg i Excel."""
    for i, (_, kode) in enumerate(LYS["nb"]):
        navn = {LYS[s][i][0] for s in ("nb", "nn")}
        prove = "OR(" + ",".join(f'EXACT(${kolonne}{forste_rad},"{n}")' for n in sorted(navn)) + ")"
        hex_ = LYSFARGER[kode]
        ws.conditional_formatting.add(
            sterkt,
            FormulaRule(formula=[prove],
                        fill=PatternFill("solid", bgColor=_tint(hex_, 0.72)),
                        font=Font(name=SKRIFT, size=11, bold=True, color=hex_.lstrip("#")),
                        stopIfTrue=stopp))
        ws.conditional_formatting.add(
            svakt,
            FormulaRule(formula=[prove],
                        fill=PatternFill("solid", bgColor=_tint(hex_, 0.93)),
                        stopIfTrue=stopp))


def _skille(ws, omrade: str, kolonne: str, forste_rad: int, tykkelse: str = "medium") -> None:
    """Strek der verdien i kolonnen bytter – skiller møter fra hverandre, og klasser."""
    ws.conditional_formatting.add(
        omrade,
        Rule(type="expression",
             formula=[f'AND(${kolonne}{forste_rad}<>"",'
                      f'${kolonne}{forste_rad}<>${kolonne}{forste_rad - 1})'],
             dxf=DifferentialStyle(border=Border(top=Side(style=tykkelse, color=BLEKK)))))


def omradenavn(klasse: str) -> str:
    """«2AKV/FF» → «ELEV_2AKV_FF». Navngitte områder tåler ikke / og mellomrom."""
    return "ELEV_" + re.sub(r"[^A-Za-z0-9_]", "_", klasse)


def _elevark(ws, klasser: list[str], elever: dict, T) -> dict:
    """Én kolonne per klasse. Elev-nedtrekket følger klassen som er valgt."""
    ws.sheet_view.showGridLines = False
    ws.freeze_panes = "A2"
    omrader = {}
    for i, klasse in enumerate(klasser, start=1):
        bokstav = get_column_letter(i)
        ws.column_dimensions[bokstav].width = 26
        c = ws.cell(row=1, column=i, value=klasse)
        c.font = _skrift(bold=True, color="FFFFFF")
        c.fill = PatternFill("solid", fgColor=BLEKK)
        c.alignment = Alignment(vertical="center", horizontal="left", indent=1)
        for r in range(2, 2 + ELEVRADER):
            celle = ws.cell(row=r, column=i)
            celle.font = _skrift()
            celle.alignment = Alignment(vertical="center", indent=1)
            celle.border = Border(bottom=KANT, right=KANT)
        for r, navn in enumerate(elever.get(klasse, []), start=2):
            ws.cell(row=r, column=i, value=navn)
        omrader[omradenavn(klasse)] = (
            f"OFFSET('{T['elevar_ark']}'!${bokstav}$2,0,0,"
            f"MAX(1,COUNTA('{T['elevar_ark']}'!${bokstav}$2:${bokstav}${1 + ELEVRADER})),1)")
    ws.row_dimensions[1].height = 26
    return omrader


def _elevformel(kolonne: str, rad: int) -> str:
    """Nedtrekket for Elev peker på klassens egen liste."""
    b = f"${kolonne}{rad}"
    return (f'IFERROR(INDIRECT("ELEV_"&SUBSTITUTE(SUBSTITUTE(SUBSTITUTE({b},"/","_")," ","_"),'
            f'"-","_")),VelKlasse)')


def lag_arbeidsbok(sti, skole=None, skolear="", klasser=None, elever=None, omrader=None,
                   moter=None, innmeldingar=None, tiltak=None, sprak="nb",
                   profilfarge=PROFILFARGE_STANDARD, logo="") -> None:
    """Skriver en ferdig arbeidsbok. Uten innhold blir arkene tomme og klare."""
    sprak = tolk_sprak(sprak)
    T = tekster(sprak)
    skole = skole or ("Skulen" if sprak == "nn" else "Skolen")
    klasser = klasser or STANDARDKLASSER
    elever = elever or {}
    omrader = omrader or OMRADER[sprak]
    moter = moter or []
    lysval = lysnavn(sprak)
    statusval = statusnavn(sprak)

    wb = Workbook()

    # ── Start her ────────────────────────────────────────────────
    start = wb.active
    start.title = T["ark_start"]
    start.sheet_view.showGridLines = False
    start.column_dimensions["A"].width = 4
    start.column_dimensions["B"].width = 106
    _tittel(start, "B2", T["trafikklys"], 22)
    linjer = [
        ("", "", ""),
        ("brod", "Hver lærer melder inn det som ikke er grønt. Møtet får ett rutenett per klasse: elevene nedover, områdene bortover, sterkeste lys i hver rute.",
                 "Kvar lærar melder inn det som ikkje er grønt. Møtet får eitt rutenett per klasse: elevane nedover, områda bortover, sterkaste lys i kvar rute."),
        ("", "", ""),
        ("steg", "1  Oppsett – skole, klasser, møtedatoer og hvilke områder dere setter lys på.",
                 "1  Oppsett – skule, klassar, møtedatoar og kva område de set lys på."),
        ("steg", "2  Elever – én kolonne per klasse med navna. Da vet Innmelding hvem som finnes.",
                 "2  Elevar – éi kolonne per klasse med namna. Då veit Innmelding kven som finst."),
        ("steg", "3  Innmelding – én rad per ting du vil melde inn. Alt har nedtrekksliste.",
                 "3  Innmelding – éi rad per ting du vil melde inn. Alt har nedtrekksliste."),
        ("steg", "4  Oversikt – i møtet. Velg møte og klasse øverst, så står rutenettet ferdig, med mest rødt øverst.",
                 "4  Oversikt – i møtet. Vel møte og klasse øvst, så står rutenettet ferdig, med mest raudt øvst."),
        ("steg", "5  Elevkort – velg en elev og se hva hver lærer skrev, og tiltakene som løper.",
                 "5  Elevkort – vel ein elev og sjå kva kvar lærar skreiv, og tiltaka som går."),
        ("steg", "6  Tiltak – det møtet blir enige om: hva, hvem og til når.",
                 "6  Tiltak – det møtet blir samde om: kva, kven og til når."),
        ("", "", ""),
        ("brod", "Alt skjer i denne fila. Den trenger ingen makroer, tillegg eller internett, så den virker også i et lukket system som IOPsky.",
                 "Alt skjer i denne fila. Ho treng ingen makroar, tillegg eller internett, så ho verkar også i eit lukka system som IOPsky."),
        ("", "", ""),
        ("mellom", "Hva lysene betyr", "Kva lysa tyder"),
        ("brod", "Grønt – alt er i orden. Trenger ikke meldes inn, men du kan gjøre det om du vil bekrefte at du har sett etter.",
                 "Grønt – alt er i orden. Treng ikkje meldast inn, men du kan gjere det om du vil stadfeste at du har sett etter."),
        ("brod", "Gult – noe å følge med på. Kontaktlærer og faglærer håndterer det i klassen, men møtet skal vite om det.",
                 "Gult – noko å følgje med på. Kontaktlærar og faglærar handterer det i klassen, men møtet skal vite om det."),
        ("brod", "Rødt – må tas opp i elevstatusmøtet. Skal ende i et tiltak med en ansvarlig og en frist.",
                 "Raudt – må takast opp i elevstatusmøtet. Skal ende i eit tiltak med ein ansvarleg og ein frist."),
        ("", "", ""),
        ("mellom", "Slik skriver du merknaden", "Slik skriv du merknaden"),
        ("brod", "Skriv det du har observert, kort og konkret: «Ikke levert de tre siste innleveringene» framfor «umotivert».",
                 "Skriv det du har observert, kort og konkret: «Ikkje levert dei tre siste innleveringane» framfor «umotivert»."),
        ("brod", "Ikke skriv helseopplysninger, diagnoser eller opplysninger om familien. Det hører hjemme i elevmappa, ikke her.",
                 "Ikkje skriv helseopplysningar, diagnosar eller opplysningar om familien. Det høyrer heime i elevmappa, ikkje her."),
        ("brod", "Denne fila inneholder personopplysninger. Den skal ligge der skolen oppbevarer taushetsbelagte dokumenter (IOPsky), delt bare med lærerne som har klassene.",
                 "Denne fila inneheld personopplysningar. Ho skal liggje der skulen oppbevarer teiepliktige dokument (IOPsky), delt berre med lærarane som har klassane."),
        ("", "", ""),
        ("mellom", "Godt å vite", "Godt å vite"),
        ("brod", "Elev-nedtrekket viser bare elevene i klassen du har valgt. Velg klasse først.",
                 "Elev-nedtrekket viser berre elevane i klassen du har valt. Vel klasse først."),
        ("brod", "Møte-kolonnen gjør at én arbeidsbok tar hele året. Oversikten viser piler for det som er nytt eller endret siden forrige møte.",
                 "Møte-kolonnen gjer at éi arbeidsbok tek heile året. Oversikta viser piler for det som er nytt eller endra sidan førre møte."),
        ("brod", "Oversikt og Elevkort er låst så formlene ikke blir skrevet over. Bare valgfeltene er åpne. Låsen har ikke passord.",
                 "Oversikt og Elevkort er låste så formlane ikkje blir skrivne over. Berre valfelta er opne. Låsen har ikkje passord."),
        ("brod", "Klikk på filterpila i Møte-kolonnen når du vil se ett møte om gangen. Rader du ikke bruker, lar du stå tomme.",
                 "Klikk på filterpila i Møte-kolonnen når du vil sjå eitt møte om gongen. Rader du ikkje bruker, lèt du stå tomme."),
    ]
    rad = 3
    for slag, pa_bokmal, pa_nynorsk in linjer:
        tekst = pa_nynorsk if sprak == "nn" else pa_bokmal
        if tekst:
            c = start.cell(row=rad, column=2, value=tekst)
            if slag == "steg":
                c.font = _skrift(bold=True, size=12)
                start.row_dimensions[rad].height = 26
            elif slag == "mellom":
                c.font = _skrift(bold=True, color=GRA)
                start.row_dimensions[rad].height = 30
            else:
                c.font = _skrift(color=GRA)
                start.row_dimensions[rad].height = 30
            c.alignment = Alignment(vertical="center", wrap_text=True)
        rad += 1

    # ── Oppsett ──────────────────────────────────────────────────
    opp = wb.create_sheet(T["ark_oppsett"])
    opp.sheet_view.showGridLines = False
    for kol, bredde in (("A", 3), ("B", 22), ("C", 30), ("D", 26), ("E", 3), ("F", 28), ("G", 54)):
        opp.column_dimensions[kol].width = bredde
    _tittel(opp, "B2", T["ark_oppsett"], 16)
    felt = [
        (T["skole"], skole, ""),
        (T["skoleaar"], skolear, ""),
        (T["sprakfelt"], T["sprak"], "bokmål / nynorsk"),
        (T["profilfarge"], profilfarge,
         "← fargen skulen sin profil bruker" if sprak == "nn" else "← fargen skolens profil bruker"),
        (T["logo"], logo,
         "← ligg i same mappe som denne fila" if sprak == "nn" else "← ligger i samme mappe som denne fila"),
    ]
    for i, (navn, verdi, merknad) in enumerate(felt):
        r = 4 + i
        opp.cell(row=r, column=2, value=navn).font = _skrift(color=GRA)
        c = opp.cell(row=r, column=3, value=verdi)
        c.font = _skrift(bold=True, size=12)
        c.fill = PatternFill("solid", fgColor=ARK)
        c.border = Border(bottom=Side(style="medium", color=BLEKK))
        c.alignment = Alignment(vertical="center", indent=1)
        opp.row_dimensions[r].height = 22
        if merknad:
            opp.cell(row=r, column=4, value=merknad).font = _skrift(size=10, italic=True, color=GRA)
    opp["C7"].fill = PatternFill("solid", fgColor=profilfarge.lstrip("#"))
    opp["C7"].font = _skrift(bold=True, size=12, color="FFFFFF")
    _liste(opp, "C6:C6", "Malformer", "bokmål eller nynorsk")

    for celle, tittel in (("B11", T["klasser"]), ("C11", T["moter"]), ("D11", T["dato"]),
                          ("F11", T["omrader"]), ("G11", T["forklaring"])):
        _tittel(opp, celle, tittel)
    for i, k in enumerate(klasser):
        opp.cell(row=12 + i, column=2, value=k).font = _skrift()
    for i, (navn, dato) in enumerate(moter):
        opp.cell(row=12 + i, column=3, value=navn).font = _skrift()
        c = opp.cell(row=12 + i, column=4, value=dato)
        c.font = _skrift()
        c.number_format = "dd.mm.yyyy"
    for i, (navn, forklaring) in enumerate(omrader):
        opp.cell(row=12 + i, column=6, value=navn).font = _skrift()
        opp.cell(row=12 + i, column=7, value=forklaring).font = _skrift(size=10, color=GRA)
    for r in range(12, 12 + KLASSERADER):
        opp.cell(row=r, column=2).border = Border(bottom=KANT)
    for r in range(12, 12 + MOTERADER):
        opp.cell(row=r, column=3).border = Border(bottom=KANT)
        opp.cell(row=r, column=4).border = Border(bottom=KANT)
        opp.cell(row=r, column=4).number_format = "dd.mm.yyyy"
    for r in range(12, 12 + OMRADERADER):
        opp.cell(row=r, column=6).border = Border(bottom=KANT)
        opp.cell(row=r, column=7).border = Border(bottom=KANT)
    opp.cell(row=12 + MOTERADER + 1, column=3,
             value=("← eitt møte per rad, nyaste nedst" if sprak == "nn"
                    else "← ett møte per rad, nyeste nederst")).font = _skrift(size=10, italic=True, color=GRA)

    # ── Lister (skjult) ──────────────────────────────────────────
    lister = wb.create_sheet(T["ark_lister"])
    lister["A1"] = T["lys"]
    for i, navn in enumerate(lysval):
        lister.cell(row=2 + i, column=1, value=navn)
    lister["B1"] = T["status"]
    for i, navn in enumerate(statusval):
        lister.cell(row=2 + i, column=2, value=navn)
    lister["D1"] = "Målformer"
    lister["D2"] = "bokmål"
    lister["D3"] = "nynorsk"
    lister["F1"] = T["elev"]
    lister["F2"] = "← vel klasse først" if sprak == "nn" else "← velg klasse først"
    lister.sheet_state = "hidden"

    A = T["ark_oppsett"]
    navngitte = {
        "Klasser": f"OFFSET({A}!$B$12,0,0,MAX(1,COUNTA({A}!$B$12:$B${11 + KLASSERADER})),1)",
        "Moter": f"OFFSET({A}!$C$12,0,0,MAX(1,COUNTA({A}!$C$12:$C${11 + MOTERADER})),1)",
        "Omrader": f"OFFSET({A}!$F$12,0,0,MAX(1,COUNTA({A}!$F$12:$F${11 + OMRADERADER})),1)",
        "Lysliste": f"'{T['ark_lister']}'!$A$2:$A${1 + len(lysval)}",
        "Statusar": f"'{T['ark_lister']}'!$B$2:$B${1 + len(statusval)}",
        "Malformer": f"'{T['ark_lister']}'!$D$2:$D$3",
        "VelKlasse": f"'{T['ark_lister']}'!$F$2",
    }

    # ── Elever ───────────────────────────────────────────────────
    elevark = wb.create_sheet(T["elevar_ark"])
    navngitte.update(_elevark(elevark, klasser, elever, T))
    for n, formel in navngitte.items():
        wb.defined_names.add(DefinedName(n, attr_text=formel))

    # ── Innmelding ───────────────────────────────────────────────
    inn = wb.create_sheet(T["ark_innmelding"])
    inn.sheet_view.showGridLines = False
    kolonner = [(T["mote"], 26), (T["klasse"], 11), (T["elev"], 26), (T["omrade"], 26),
                (T["lys"], 12), (T["merknad"], 64), (T["larer"], 20)]
    _tabell(inn, kolonner, 1, INNMELDINGSRADER)
    inn.freeze_panes = "B2"
    sist = 1 + INNMELDINGSRADER
    inn.auto_filter.ref = f"A1:G{sist}"
    _liste(inn, f"A2:A{sist}", "Moter", "Hvilket møte gjelder innmeldingen? Lista står i Oppsett.")
    _liste(inn, f"B2:B{sist}", "Klasser", "Klassen eleven går i.")
    _liste(inn, f"C2:C{sist}", _elevformel("B", 2), "Eleven. Lista viser elevene i klassen du valgte.")
    _liste(inn, f"D2:D{sist}", "Omrader", "Hva gjelder det? Områdene står i Oppsett.")
    _liste(inn, f"E2:E{sist}", "Lysliste", "Grønt, gult eller rødt.")
    _lysfarger(inn, f"E2:E{sist}", f"A2:D{sist} F2:G{sist}", "E", 2, stopp=False)
    _skille(inn, f"A2:G{sist}", "B", 2, "medium")
    _skille(inn, f"A2:G{sist}", "A", 2, "thick")

    # ── Tiltak ───────────────────────────────────────────────────
    til = wb.create_sheet(T["ark_tiltak"])
    til.sheet_view.showGridLines = False
    tkol = [(T["mote"], 26), (T["klasse"], 11), (T["elev"], 26), (T["omrade"], 24),
            (T["tiltak"], 56), (T["ansvarleg"], 22), (T["frist"], 14), (T["status"], 18)]
    _tabell(til, tkol, 1, TILTAKSRADER)
    til.freeze_panes = "B2"
    tsist = 1 + TILTAKSRADER
    til.auto_filter.ref = f"A1:H{tsist}"
    _liste(til, f"A2:A{tsist}", "Moter", "Møtet tiltaket ble bestemt på.")
    _liste(til, f"B2:B{tsist}", "Klasser", "Klassen eleven går i.")
    _liste(til, f"C2:C{tsist}", _elevformel("B", 2), "Eleven. Velg klasse først.")
    _liste(til, f"D2:D{tsist}", "Omrader", "Området tiltaket svarer på.")
    _liste(til, f"H2:H{tsist}", "Statusar", "Hvor langt er tiltaket kommet?")
    for r in range(2, tsist + 1):
        til.cell(row=r, column=7).number_format = "dd.mm.yyyy"
    avslutta = "OR(" + ",".join(f'EXACT($H2,"{n}")' for n in
                                sorted({"Avsluttet", "Avslutta"})) + ")"
    # Frist som er gått ut, på et tiltak som ikke er avsluttet.
    til.conditional_formatting.add(
        f"G2:G{tsist}",
        FormulaRule(formula=[f'AND($G2<>"",$G2<TODAY(),NOT({avslutta}))'],
                    fill=PatternFill("solid", bgColor=_tint(LYSFARGER["rod"], 0.72)),
                    font=Font(name=SKRIFT, size=11, bold=True, color=LYSFARGER["rod"].lstrip("#"))))
    til.conditional_formatting.add(
        f"A2:H{tsist}",
        FormulaRule(formula=[avslutta],
                    font=Font(name=SKRIFT, size=11, color=GRA, italic=True)))
    _skille(til, f"A2:H{tsist}", "B", 2, "medium")
    _skille(til, f"A2:H{tsist}", "A", 2, "thick")

    # ── Innhold ──────────────────────────────────────────────────
    for arknavn, rader in ((T["ark_innmelding"], innmeldingar or []),
                           (T["ark_tiltak"], tiltak or [])):
        for r, rad in enumerate(rader, start=2):
            for k, verdi in enumerate(rad, start=1):
                if verdi not in (None, ""):
                    wb[arknavn].cell(row=r, column=k, value=verdi)

    legg_til_moteark(wb, T, moter, klasser, elever, omrader, innmeldingar)

    # Hjelpelista hører hjemme bakerst, bak arka folk faktisk bruker.
    wb.move_sheet(T["ark_lister"],
                  offset=len(wb.sheetnames) - 1 - wb.sheetnames.index(T["ark_lister"]))
    wb.active = wb.sheetnames.index(T["ark_start"])
    wb.save(sti)


# ── Oversikt, elevkort og utregning ──────────────────────────────
# Møtevisningen bygd av vanlige formler, så arbeidsboka klarer seg alene i et
# lukket system som IOPsky, der verken Python eller nettsider kan kjøres.
# Bevisst bare funksjoner som har fantes lenge – SUMPRODUCT, INDEX, MATCH,
# LARGE, COUNTIFS – så det virker likt i Excel, Excel for web og LibreOffice.
MAKS_OMRADER = 12       # områdekolonner i oversikten
OVERSIKT_FORSTE = 9     # første elevrad i oversikten
ELEVKORT_RADER = 20
ELEVKORT_TILTAK = 15
FORSTE_OMRADEKOL = 6    # F


def _q(ark: str) -> str:
    return "'" + ark.replace("'", "''") + "'"


def _lysverdi(kolonne: str, rad: int) -> str:
    """Lyset som tall: grønt 1, gult 2, rødt 3, ellers 0."""
    c = f"${kolonne}{rad}"
    return (f'=IF(OR({c}="Raudt",{c}="Rødt",{c}="Raud",{c}="Rød"),3,'
            f'IF({c}="Gult",2,IF(OR({c}="Grønt",{c}="Grøn",{c}="Grønn"),1,0)))')


def _hjelpekolonner(wb, T) -> None:
    """Skjulte kolonner i Innmelding og Tiltak som Oversikt og Elevkort regner fra."""
    O, K = _q(T["ark_oversikt"]), _q(T["ark_elevkort"])
    inn = wb[T["ark_innmelding"]]
    inn["H1"], inn["I1"] = "Lysverdi", "Elevkort"
    for r in range(2, 2 + INNMELDINGSRADER):
        inn[f"H{r}"] = _lysverdi("E", r)
        inn[f"I{r}"] = (f'=IF(AND($C{r}<>"",$A{r}={O}!$C$4,$B{r}={O}!$C$5,$C{r}={K}!$C$4),'
                        f'MAX(I$1:I{r - 1})+1,"")')
    til = wb[T["ark_tiltak"]]
    til["I1"] = "Elevkort"
    for r in range(2, 2 + TILTAKSRADER):
        til[f"I{r}"] = (f'=IF(AND($E{r}<>"",$B{r}={O}!$C$5,$C{r}={K}!$C$4),'
                        f'MAX(I$1:I{r - 1})+1,"")')
    for ws, kolonner in ((inn, "HI"), (til, "I")):
        for k in kolonner:
            ws.column_dimensions[k].hidden = True


def _rekning(wb, T) -> None:
    """Skjult ark: én rad per elev i klassen, lys per område for dette og forrige møte."""
    ws = wb.create_sheet(T["ark_rekning"])
    O, I, E = _q(T["ark_oversikt"]), _q(T["ark_innmelding"]), _q(T["elevar_ark"])
    slutt = 1 + INNMELDINGSRADER
    kol = lambda k: f"{I}!${k}$2:${k}${slutt}"
    mote, klasse, forre = f"{O}!$C$4", f"{O}!$C$5", f"{O}!$C$6"
    sist = 1 + ELEVRADER

    for c, navn in enumerate(["Nr", T["elev"], "Poeng", "Sortert"], start=1):
        ws.cell(row=1, column=c, value=navn)
    for j in range(MAKS_OMRADER):
        ws.cell(row=1, column=5 + j, value=f"Nå {j + 1}")
        ws.cell(row=1, column=5 + MAKS_OMRADER + j, value=f"Før {j + 1}")
        ws.cell(row=1, column=5 + 2 * MAKS_OMRADER + j, value=f"Antall {j + 1}")
    forste_na, siste_na = get_column_letter(5), get_column_letter(4 + MAKS_OMRADER)

    for i in range(1, ELEVRADER + 1):
        r = 1 + i
        ws[f"A{r}"] = i
        ws[f"B{r}"] = (f'=IFERROR(INDEX({E}!$A$2:$AZ${sist},$A{r},'
                       f'MATCH({klasse},{E}!$A$1:$AZ$1,0))&"","")')
        na = f"$" + forste_na + f"{r}:$" + siste_na + f"{r}"
        # Mest rødt øverst, så mest gult. Siste ledd holder rekkefølgen fra Elever-arket.
        ws[f"C{r}"] = (f'=IF($B{r}="",-1-$A{r}/1000,COUNTIF({na},3)*10000+COUNTIF({na},2)*100'
                       f'+COUNTIF({na},1)+(100-$A{r})/1000)')
        ws[f"D{r}"] = f"=MATCH(LARGE($C$2:$C${sist},$A{r}),$C$2:$C${sist},0)"
        for j in range(MAKS_OMRADER):
            omrade = f"{O}!{get_column_letter(FORSTE_OMRADEKOL + j)}$8"
            felles = f"({kol('B')}={klasse})*({kol('C')}=$B{r})*({kol('D')}={omrade})"
            ws.cell(row=r, column=5 + j,
                    value=f'=IF(OR($B{r}="",{omrade}=""),0,'
                          f'SUMPRODUCT(MAX(({kol("A")}={mote})*{felles}*{kol("H")})))')
            ws.cell(row=r, column=5 + MAKS_OMRADER + j,
                    value=f'=IF(OR($B{r}="",{omrade}="",{forre}=""),0,'
                          f'SUMPRODUCT(MAX(({kol("A")}={forre})*{felles}*{kol("H")})))')
            ws.cell(row=r, column=5 + 2 * MAKS_OMRADER + j,
                    value=f'=IF(OR($B{r}="",{omrade}=""),0,'
                          f'SUMPRODUCT(({kol("A")}={mote})*{felles}*({kol("H")}>0)))')
    ws.sheet_state = "hidden"
    ws.protection.sheet = True


def _oversikt(wb, T, mote: str, klasse: str, antall_omrader: int) -> None:
    """Rutenettet for møtet: elevene nedover, områdene bortover, sterkeste lys i hver rute."""
    ws = wb.create_sheet(T["ark_oversikt"])
    ws.sheet_view.showGridLines = False
    R, TI = _q(T["ark_rekning"]), _q(T["ark_tiltak"])
    sist_elev = 1 + ELEVRADER
    siste_rad = OVERSIKT_FORSTE + ELEVRADER - 1
    forste_omr = get_column_letter(FORSTE_OMRADEKOL)
    siste_omr = get_column_letter(FORSTE_OMRADEKOL + MAKS_OMRADER - 1)

    for kolonne, bredde in (("A", 2), ("B", 26), ("C", 6), ("D", 6), ("E", 8)):
        ws.column_dimensions[kolonne].width = bredde
    for j in range(MAKS_OMRADER):
        dim = ws.column_dimensions[get_column_letter(FORSTE_OMRADEKOL + j)]
        dim.width = 15
        # Ubrukte områdekolonner skjules, så utskriften ikke krymper. Legger skolen
        # til flere områder, viser de kolonnene igjen (høyreklikk → Vis).
        dim.hidden = j >= antall_omrader

    _tittel(ws, "B2", T["elevstatus"], 20)
    for rad, navn, verdi in ((4, T["mote"], mote), (5, T["klasse"], klasse),
                             (6, T["forrige_mote"], None)):
        ws.cell(row=rad, column=2, value=navn).font = _skrift(color=GRA)
        c = ws.cell(row=rad, column=3, value=verdi)
        c.font = _skrift(bold=True, size=12)
        c.alignment = Alignment(vertical="center", indent=1)
        ws.merge_cells(start_row=rad, start_column=3, end_row=rad, end_column=5)
        ws.row_dimensions[rad].height = 22
    for rad in (4, 5):
        ws.cell(row=rad, column=3).fill = PatternFill("solid", fgColor=ARK)
        ws.cell(row=rad, column=3).border = Border(bottom=Side(style="medium", color=BLEKK))
        ws.cell(row=rad, column=3).protection = ws.cell(row=rad, column=3).protection.copy(locked=False)
    # Faste områder i stedet for de navngitte listene: OFFSET er flyktig og ville fått
    # hele utregningen til å gå på nytt ved hvert tastetrykk i boka.
    opp = _q(T["ark_oppsett"])
    moteliste = f"{opp}!$C$12:$C${11 + MOTERADER}"
    ws["C6"] = (f'=IFERROR(IF(MATCH($C$4,{moteliste},0)>1,'
                f'INDEX({moteliste},MATCH($C$4,{moteliste},0)-1)&"",""),"")')
    ws["C6"].font = _skrift(color=GRA)
    _liste(ws, "C4:C4", "Moter", "Hvilket møte vil du se?")
    _liste(ws, "C5:C5", "Klasser", "Hvilken klasse vil du se?")

    # Nøkkeltall øverst til høyre: tall på rad 4, forklaring på rad 5.
    tall = [
        (f"=SUM(C{OVERSIKT_FORSTE}:C{siste_rad})", T["rode"], LYSFARGER["rod"]),
        (f"=SUM(D{OVERSIKT_FORSTE}:D{siste_rad})", T["gule"], LYSFARGER["gul"]),
        (f"=COUNTIF({R}!$E$2:${get_column_letter(4 + MAKS_OMRADER)}${sist_elev},1)", T["grone"],
         LYSFARGER["gronn"]),
        (f'=COUNTIF({R}!$C$2:$C${sist_elev},">=1")', T["elevar_med"], "#" + BLEKK),
        (f"=SUM(E{OVERSIKT_FORSTE}:E{siste_rad})", T["opne_tiltak_kort"], "#" + BLEKK),
    ]
    for i, (formel, navn, farge) in enumerate(tall):
        k = FORSTE_OMRADEKOL + 1 + i
        c = ws.cell(row=4, column=k, value=formel)
        c.font = _skrift(bold=True, size=20, color=farge.lstrip("#"))
        c.alignment = Alignment(horizontal="left", vertical="bottom", indent=1)
        c.border = Border(left=Side(style="thick", color=farge.lstrip("#")))
        lapp = ws.cell(row=5, column=k, value=navn)
        lapp.font = _skrift(size=9, color=GRA)
        lapp.alignment = Alignment(vertical="top", indent=1, wrap_text=True)
        lapp.border = Border(left=Side(style="thick", color=farge.lstrip("#")))
    ws.row_dimensions[4].height = 30
    ws.row_dimensions[5].height = 26
    ws.cell(row=6, column=FORSTE_OMRADEKOL + 1, value=T["sortert"]).font = _skrift(
        size=9, italic=True, color=GRA)
    ws["B7"] = T["forklaring_oversikt"]
    ws["B7"].font = _skrift(size=10, color=GRA)

    # Hoderaden. Områdene hentes fra Oppsett, så kolonnene følger skolens egne.
    for k, navn in ((2, T["elev"]), (3, "■"), (4, "▲"), (5, T["tiltak"])):
        c = ws.cell(row=8, column=k, value=navn)
        c.font = _skrift(bold=True, color="FFFFFF", size=10)
        c.fill = PatternFill("solid", fgColor=BLEKK)
        c.alignment = Alignment(vertical="center", horizontal="center" if k > 2 else "left",
                                indent=0 if k > 2 else 1, wrap_text=True)
    for j in range(MAKS_OMRADER):
        c = ws.cell(row=8, column=FORSTE_OMRADEKOL + j, value=f"={opp}!$F${12 + j}&\"\"")
        c.font = _skrift(bold=True, color="FFFFFF", size=10)
        c.alignment = Alignment(vertical="center", horizontal="center", wrap_text=True)
    ws.conditional_formatting.add(
        f"{forste_omr}8:{siste_omr}8",
        FormulaRule(formula=[f'{forste_omr}8<>""'], fill=PatternFill("solid", bgColor=BLEKK)))
    ws.row_dimensions[8].height = 34

    na = f"{R}!${get_column_letter(5)}$2:${get_column_letter(4 + MAKS_OMRADER)}${sist_elev}"
    tiltak = lambda k: f"{TI}!${k}$2:${k}${1 + TILTAKSRADER}"
    for k in range(1, ELEVRADER + 1):
        r = OVERSIKT_FORSTE + k - 1
        idx = f"{R}!$D${1 + k}"
        ws[f"B{r}"] = f'=IFERROR(INDEX({R}!$B$2:$B${sist_elev},{idx}),"")'
        ws[f"C{r}"] = f'=IF($B{r}="","",COUNTIF(INDEX({na},{idx},0),3))'
        ws[f"D{r}"] = f'=IF($B{r}="","",COUNTIF(INDEX({na},{idx},0),2))'
        ws[f"E{r}"] = (f'=IF($B{r}="","",COUNTIFS({tiltak("B")},$C$5,{tiltak("C")},$B{r},'
                       f'{tiltak("E")},"<>",{tiltak("H")},"<>Avslutta",{tiltak("H")},"<>Avsluttet"))')
        for j in range(MAKS_OMRADER):
            hent = lambda forste: (f"INDEX({R}!${get_column_letter(forste + j)}$2:"
                                   f"${get_column_letter(forste + j)}${sist_elev},{idx})")
            na_, for_, antall = hent(5), hent(5 + MAKS_OMRADER), hent(5 + 2 * MAKS_OMRADER)
            ws.cell(row=r, column=FORSTE_OMRADEKOL + j, value=(
                f'=IF(OR($B{r}="",{na_}=0),"",CHOOSE({na_},"●","▲","■")'
                f'&IF({antall}>1," "&{antall},"")'
                f'&IF($C$6="","",IF({for_}=0," ✱",IF({na_}>{for_}," ↑",IF({na_}<{for_}," ↓","")))))'))
        ws.row_dimensions[r].height = 22
        for k2 in range(2, FORSTE_OMRADEKOL + MAKS_OMRADER):
            c = ws.cell(row=r, column=k2)
            c.font = _skrift(bold=k2 == 2, size=11 if k2 == 2 else 12)
            c.alignment = Alignment(vertical="center", horizontal="left" if k2 == 2 else "center",
                                    indent=1 if k2 == 2 else 0)
            if 3 <= k2 <= 5:
                c.number_format = "0;-0;;@"

    rutenett = f"{forste_omr}{OVERSIKT_FORSTE}:{siste_omr}{siste_rad}"
    for merke, kode in (("■", "rod"), ("▲", "gul"), ("●", "gronn")):
        hex_ = LYSFARGER[kode]
        ws.conditional_formatting.add(
            rutenett,
            FormulaRule(formula=[f'LEFT({forste_omr}{OVERSIKT_FORSTE},1)="{merke}"'],
                        fill=PatternFill("solid", bgColor=_tint(hex_, 0.78)),
                        font=Font(name=SKRIFT, size=12, bold=True, color=hex_.lstrip("#"))))
    for kolonne, kode in (("C", "rod"), ("D", "gul")):
        ws.conditional_formatting.add(
            f"{kolonne}{OVERSIKT_FORSTE}:{kolonne}{siste_rad}",
            FormulaRule(formula=[f"N({kolonne}{OVERSIKT_FORSTE})>0"],
                        font=Font(name=SKRIFT, size=12, bold=True, color=LYSFARGER[kode].lstrip("#"))))
    ws.conditional_formatting.add(
        f"B{OVERSIKT_FORSTE}:B{siste_rad}",
        FormulaRule(formula=[f'AND($B{OVERSIKT_FORSTE}<>"",'
                             f'SUMPRODUCT(LEN(${forste_omr}{OVERSIKT_FORSTE}:${siste_omr}{OVERSIKT_FORSTE}))=0)'],
                    font=Font(name=SKRIFT, size=11, italic=True, color=GRA)))

    # Rammene til sist. LibreOffice bruker bare den første regelen som slår til i en
    # celle, Excel alle – slik får begge fargene, og Excel rammene i tillegg.
    ws.conditional_formatting.add(
        f"B{OVERSIKT_FORSTE}:{siste_omr}{siste_rad}",
        Rule(type="expression", formula=[f'$B{OVERSIKT_FORSTE}<>""'],
             dxf=DifferentialStyle(border=Border(bottom=KANT, right=KANT))))

    ws.freeze_panes = f"C{OVERSIKT_FORSTE}"
    ws.print_area = f"B2:{siste_omr}{siste_rad}"
    ws.print_title_rows = "8:8"
    ws.page_setup.orientation = "landscape"
    ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.protection.sheet = True
    ws.protection.formatColumns = False     # så skjulte områdekolonner kan vises


def _elevkort(wb, T, elev: str) -> None:
    """Alt om én elev på dette møtet: hva hver lærer skrev, og tiltakene som løper."""
    ws = wb.create_sheet(T["ark_elevkort"])
    ws.sheet_view.showGridLines = False
    O, I, TI = _q(T["ark_oversikt"]), _q(T["ark_innmelding"]), _q(T["ark_tiltak"])
    for kolonne, bredde in (("A", 2), ("B", 24), ("C", 12), ("D", 64), ("E", 20), ("F", 16), ("G", 22)):
        ws.column_dimensions[kolonne].width = bredde
    _tittel(ws, "B2", T["ark_elevkort"], 20)

    ws["B4"] = T["elev"]
    ws["B4"].font = _skrift(color=GRA)
    ws["C4"] = elev
    ws["C4"].font = _skrift(bold=True, size=14)
    ws["C4"].fill = PatternFill("solid", fgColor=ARK)
    ws["C4"].border = Border(bottom=Side(style="medium", color=BLEKK))
    ws["C4"].protection = ws["C4"].protection.copy(locked=False)
    ws.merge_cells("C4:D4")
    ws["E4"] = T["vel_her"]
    ws["E4"].font = _skrift(size=10, italic=True, color=GRA)
    ws.row_dimensions[4].height = 26
    _liste(ws, "C4:C4",
           f'IFERROR(INDIRECT("ELEV_"&SUBSTITUTE(SUBSTITUTE(SUBSTITUTE({O}!$C$5,"/","_")," ","_"),'
           f'"-","_")),VelKlasse)',
           "Eleven. Lista viser klassen som er valgt på Oversikt-arket.")
    for rad, navn, formel in ((5, T["klasse"], f"={O}!$C$5"), (6, T["mote"], f"={O}!$C$4")):
        ws.cell(row=rad, column=2, value=navn).font = _skrift(color=GRA)
        ws.cell(row=rad, column=3, value=formel).font = _skrift(bold=True)
    ws["D5"] = T["elevkort_hint"]
    ws["D5"].font = _skrift(size=10, italic=True, color=GRA)

    inn = lambda k: f"{I}!${k}$2:${k}${1 + INNMELDINGSRADER}"
    hode = [(T["omrade"], "D"), (T["lys"], "E"), (T["merknad"], "F"), (T["larer"], "G")]
    for k, (navn, _) in enumerate(hode, start=2):
        c = ws.cell(row=8, column=k, value=navn)
        c.font = _skrift(bold=True, color="FFFFFF")
        c.fill = PatternFill("solid", fgColor=BLEKK)
        c.alignment = Alignment(vertical="center", indent=1)
    ws.row_dimensions[8].height = 24
    for m in range(1, ELEVKORT_RADER + 1):
        r = 8 + m
        for k, (_, kilde) in enumerate(hode, start=2):
            c = ws.cell(row=r, column=k,
                        value=f'=IFERROR(INDEX({inn(kilde)},MATCH({m},{inn("I")},0))&"","")')
            c.font = _skrift()
            c.alignment = Alignment(vertical="top", indent=1, wrap_text=k == 4)
    sist = 8 + ELEVKORT_RADER
    _lysfarger(ws, f"C9:C{sist}", f"B9:B{sist} D9:E{sist}", "C", 9, stopp=False)

    start = sist + 3
    _tittel(ws, f"B{start - 1}", T["tiltak"], 14)
    til = lambda k: f"{TI}!${k}$2:${k}${1 + TILTAKSRADER}"
    thode = [(T["omrade"], "D"), (T["tiltak"], "E"), (T["ansvarleg"], "F"), (T["frist"], "G"),
             (T["status"], "H"), (T["mote"], "A")]
    # Kolonnene i tiltaksdelen: B C D E F G – omrade får B, tiltaket den brede D.
    plassering = [2, 4, 5, 6, 7, 3]
    for (navn, _), k in zip(thode, plassering):
        c = ws.cell(row=start, column=k, value=navn)
        c.font = _skrift(bold=True, color="FFFFFF")
        c.fill = PatternFill("solid", fgColor=BLEKK)
        c.alignment = Alignment(vertical="center", indent=1)
    ws.row_dimensions[start].height = 24
    for m in range(1, ELEVKORT_TILTAK + 1):
        r = start + m
        for (_, kilde), k in zip(thode, plassering):
            treff = f"INDEX({til(kilde)},MATCH({m},{til('I')},0))"
            if kilde == "G":
                formel = f'=IFERROR(IF({treff}="","",{treff}),"")'
            else:
                formel = f'=IFERROR({treff}&"","")'
            c = ws.cell(row=r, column=k, value=formel)
            c.font = _skrift()
            c.alignment = Alignment(vertical="top", indent=1, wrap_text=k == 4)
            if kilde == "G":
                c.number_format = "dd.mm.yyyy"
    tsist = start + ELEVKORT_TILTAK
    avslutta = 'OR($G{r}="Avslutta",$G{r}="Avsluttet")'.format(r=start + 1)
    ws.conditional_formatting.add(
        f"F{start + 1}:F{tsist}",
        FormulaRule(formula=[f'AND(ISNUMBER($F{start + 1}),$F{start + 1}<TODAY(),NOT({avslutta}))'],
                    fill=PatternFill("solid", bgColor=_tint(LYSFARGER["rod"], 0.72)),
                    font=Font(name=SKRIFT, size=11, bold=True, color=LYSFARGER["rod"].lstrip("#"))))
    ws.conditional_formatting.add(
        f"B{start + 1}:G{tsist}",
        FormulaRule(formula=[avslutta], font=Font(name=SKRIFT, size=11, italic=True, color=GRA)))

    # Rammene til sist, av same grunn som i Oversikt.
    ws.conditional_formatting.add(
        f"B9:E{sist}",
        Rule(type="expression", formula=['$B9<>""'],
             dxf=DifferentialStyle(border=Border(bottom=KANT))))
    ws.conditional_formatting.add(
        f"B{start + 1}:G{tsist}",
        Rule(type="expression", formula=[f'$B{start + 1}<>""'],
             dxf=DifferentialStyle(border=Border(bottom=KANT))))
    ws.print_area = f"B2:G{tsist}"
    ws.page_setup.orientation = "landscape"
    ws.page_setup.paperSize = ws.PAPERSIZE_A4
    ws.page_setup.fitToWidth = 1
    ws.page_setup.fitToHeight = 0
    ws.sheet_properties.pageSetUpPr.fitToPage = True
    ws.protection.sheet = True


def legg_til_moteark(wb, T, moter, klasser, elever, omrader, innmeldingar) -> None:
    """Oversikt, Elevkort og utregningen bak dem.

    Starter på det siste møtet som har innmeldinger, ellers det første i lista."""
    brukte = {r[0] for r in (innmeldingar or [])}
    med_innhold = [m for m, _ in moter if m in brukte]
    mote = med_innhold[-1] if med_innhold else (moter[0][0] if moter else "")
    klasse = klasser[0] if klasser else ""
    treff = [r for r in (innmeldingar or []) if r[0] == mote and r[1] == klasse]
    elev = treff[0][2] if treff else (elever.get(klasse) or [""])[0]
    _oversikt(wb, T, mote, klasse, len(omrader))
    _elevkort(wb, T, elev)
    _rekning(wb, T)
    _hjelpekolonner(wb, T)

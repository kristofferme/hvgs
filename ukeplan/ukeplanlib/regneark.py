"""Lager arbeidsboka: fem ark, nedtrekkslister og fargekoder."""

from __future__ import annotations

import datetime as dt

from openpyxl import Workbook
from openpyxl.formatting.rule import FormulaRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.datavalidation import DataValidation

from .felles import DAGER, FAGFARGER, TYPER, farge_for

BLEKK = "16212A"
GRA = "5B6A72"
ARK = "EFF2F0"
KANT = Side(style="thin", color="D3D9D6")

STANDARDFAG = [
    "Norsk", "Matematikk", "Engelsk", "Naturfag", "Samfunnsfag", "KRLE",
    "Kroppsøving", "Musikk", "Kunst og håndverk", "Mat og helse", "Tysk", "Valgfag",
]
STANDARDKLASSER = ["8A", "8B", "9A", "9B", "10A", "10B"]

KOLONNER = {
    "Timeplan": [
        ("Klasse", 12), ("Dag", 12), ("Start", 9), ("Slutt", 9),
        ("Fag", 22), ("Rom", 10), ("Lærer", 14),
    ],
    "Uke": [
        ("Klasse", 12), ("Dag", 12), ("Fag", 20), ("Tema – det vi jobber med", 46),
        ("Lekse / oppgave", 46), ("Frist", 12), ("Type", 15),
    ],
    "Beskjeder": [("Klasse", 12), ("Overskrift", 26), ("Beskjed", 78)],
}

RADER = 300


def _tint(hex_farge: str, andel: float) -> str:
    """Blander fargen mot hvitt. andel=0.9 gir en svak pastell."""
    h = hex_farge.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    bland = lambda v: int(round(v + (255 - v) * andel))
    return f"{bland(r):02X}{bland(g):02X}{bland(b):02X}"


def _tittel(ws, celle: str, tekst: str, storrelse: int = 11) -> None:
    ws[celle] = tekst
    ws[celle].font = Font(name="Aptos Narrow", bold=True, size=storrelse, color=BLEKK)


def _hodrad(ws, kolonner) -> None:
    for i, (navn, bredde) in enumerate(kolonner, start=1):
        c = ws.cell(row=1, column=i, value=navn)
        c.font = Font(name="Aptos Narrow", bold=True, size=11, color="FFFFFF")
        c.fill = PatternFill("solid", fgColor=BLEKK)
        c.alignment = Alignment(vertical="center", horizontal="left", indent=1)
        ws.column_dimensions[get_column_letter(i)].width = bredde
    ws.row_dimensions[1].height = 26
    ws.freeze_panes = "A2"
    ws.auto_filter.ref = f"A1:{get_column_letter(len(kolonner))}{RADER}"
    for rad in range(2, RADER + 1):
        ws.row_dimensions[rad].height = 20
        for i in range(1, len(kolonner) + 1):
            c = ws.cell(row=rad, column=i)
            c.border = Border(bottom=KANT, right=KANT)
            c.font = Font(name="Aptos Narrow", size=11, color=BLEKK)
            c.alignment = Alignment(vertical="center", indent=1, wrap_text=bredde_wrap(kolonner, i))


def bredde_wrap(kolonner, i: int) -> bool:
    return kolonner[i - 1][1] >= 40


def _liste(ws, kolonne: str, kilde: str, ledetekst: str) -> None:
    dv = DataValidation(type="list", formula1=kilde, allow_blank=True, showErrorMessage=False)
    dv.prompt = ledetekst
    dv.promptTitle = "Velg fra lista"
    dv.showInputMessage = True
    ws.add_data_validation(dv)
    dv.add(f"{kolonne}2:{kolonne}{RADER}")


def _fargekoder(ws, fagkolonne: str, fag: list[str]) -> None:
    """Farger fagcella slik at uka kan leses på fargene alene."""
    brukte: dict[str, str] = {}
    omrade = f"{fagkolonne}2:{fagkolonne}{RADER}"
    for navn in fag:
        hex_ = farge_for(navn, brukte)
        ws.conditional_formatting.add(
            omrade,
            FormulaRule(
                formula=[f'EXACT(${fagkolonne}2,"{navn}")'],
                fill=PatternFill("solid", bgColor=_tint(hex_, 0.86)),
                font=Font(name="Aptos Narrow", size=11, bold=True, color=hex_.lstrip("#")),
                stopIfTrue=True,
            ),
        )


def lag_arbeidsbok(sti, skole="Skolen", uke=None, forste_dag=None, overskrift="Ukeplan",
                   klasser=None, fag=None, innhold=None) -> None:
    """Skriver en ferdig arbeidsbok. innhold=None gir tomme ark klare til bruk."""
    klasser = klasser or STANDARDKLASSER
    fag = fag or STANDARDFAG
    innhold = innhold or {}
    if forste_dag is None:
        i_dag = dt.date.today()
        forste_dag = i_dag - dt.timedelta(days=i_dag.weekday()) + dt.timedelta(days=7)
    if uke is None:
        uke = forste_dag.isocalendar()[1]

    wb = Workbook()

    # ── Start her ────────────────────────────────────────────────
    start = wb.active
    start.title = "Start her"
    start.sheet_view.showGridLines = False
    start.column_dimensions["A"].width = 4
    start.column_dimensions["B"].width = 104
    _tittel(start, "B2", "Ukeplan", 22)
    linjer = [
        ("", ""),
        ("steg", "1  Oppsett: skriv inn skole, ukenummer og datoen for mandagen. Legg inn klassene og fagene dine."),
        ("steg", "2  Timeplan: den faste timeplanen. Fyll den ut én gang – den gjelder uke etter uke."),
        ("steg", "3  Uke: det som er nytt denne uka. Tema, lekser, prøver og frister."),
        ("steg", "4  Beskjeder: korte meldinger hjem. Skriv «Alle» i Klasse for å nå alle klassene."),
        ("", ""),
        ("steg", "Så kjører du:  python3 ukeplan.py bygg"),
        ("brod", "Du får en ferdig nettside – ukeplan.html – som kan sendes, legges ut eller skrives ut."),
        ("", ""),
        ("mellom", "Godt å vite"),
        ("brod", "Klasse, Dag, Fag, Frist og Type har nedtrekkslister. Klikk i cella og velg."),
        ("brod", "Skriv «Alle» i Klasse-feltet når noe gjelder hele trinnet."),
        ("brod", "Fagene farges automatisk mens du skriver, så du ser feil med én gang."),
        ("brod", "Rader du ikke bruker, lar du stå tomme. Rekkefølgen spiller ingen rolle."),
        ("brod", "En lekse havner i «Å gjøre denne uka» på nettsiden. Har du satt Frist, sorteres den dit."),
    ]
    rad = 3
    for slag, tekst in linjer:
        if tekst:
            c = start.cell(row=rad, column=2, value=tekst)
            if slag == "steg":
                c.font = Font(name="Aptos Narrow", size=12, bold=True, color=BLEKK)
                start.row_dimensions[rad].height = 26
            elif slag == "mellom":
                c.font = Font(name="Aptos Narrow", size=11, bold=True, color=GRA)
                start.row_dimensions[rad].height = 30
            else:
                c.font = Font(name="Aptos Narrow", size=11, color=GRA)
                start.row_dimensions[rad].height = 20
            c.alignment = Alignment(vertical="center", wrap_text=True)
        rad += 1

    # ── Oppsett ──────────────────────────────────────────────────
    opp = wb.create_sheet("Oppsett")
    opp.sheet_view.showGridLines = False
    for kol, bredde in (("A", 3), ("B", 22), ("C", 26), ("D", 14), ("E", 22), ("F", 24), ("G", 14)):
        opp.column_dimensions[kol].width = bredde
    _tittel(opp, "B2", "Oppsett", 16)
    felt = [("Skole", skole), ("Ukenummer", uke), ("Mandag i uka", forste_dag), ("Overskrift", overskrift)]
    for i, (navn, verdi) in enumerate(felt):
        r = 4 + i
        opp.cell(row=r, column=2, value=navn).font = Font(name="Aptos Narrow", size=11, color=GRA)
        c = opp.cell(row=r, column=3, value=verdi)
        c.font = Font(name="Aptos Narrow", size=12, bold=True, color=BLEKK)
        c.fill = PatternFill("solid", fgColor=ARK)
        c.border = Border(bottom=Side(style="medium", color=BLEKK))
        c.alignment = Alignment(vertical="center", indent=1)
        opp.row_dimensions[r].height = 22
    opp["C6"].number_format = "dd.mm.yyyy"

    _tittel(opp, "D2", "Klasser")
    opp["D3"] = "Alle"
    opp["D3"].font = Font(name="Aptos Narrow", size=11, italic=True, color=GRA)
    opp["E3"] = "← velg denne når noe gjelder alle"
    opp["E3"].font = Font(name="Aptos Narrow", size=10, italic=True, color=GRA)
    for i, k in enumerate(klasser):
        c = opp.cell(row=4 + i, column=4, value=k)
        c.font = Font(name="Aptos Narrow", size=11, color=BLEKK)
    for r in range(3, 3 + 101):
        opp.cell(row=r, column=4).border = Border(bottom=KANT)

    _tittel(opp, "F2", "Fag")
    _tittel(opp, "G2", "Farge")
    brukte: dict[str, str] = {}
    for i, f in enumerate(fag):
        r = 3 + i
        opp.cell(row=r, column=6, value=f).font = Font(name="Aptos Narrow", size=11, color=BLEKK)
        hex_ = farge_for(f, brukte)
        c = opp.cell(row=r, column=7, value=hex_)
        c.font = Font(name="Aptos Narrow", size=10, color=hex_.lstrip("#"))
        c.fill = PatternFill("solid", fgColor=_tint(hex_, 0.86))
        c.alignment = Alignment(horizontal="center")
    for r in range(3, 3 + 101):
        opp.cell(row=r, column=6).border = Border(bottom=KANT)

    # ── Lister (skjult hjelpeark) ────────────────────────────────
    lister = wb.create_sheet("Lister")
    lister["A1"] = "Dager"
    lister["B1"] = "Typer"
    for i, d in enumerate(DAGER):
        lister.cell(row=2 + i, column=1, value=d)
    for i, t in enumerate([t for t in TYPER if t]):
        lister.cell(row=2 + i, column=2, value=t)
    lister.sheet_state = "hidden"

    # ── Navngitte områder ────────────────────────────────────────
    navn = {
        "Klasser": "OFFSET(Oppsett!$D$3,0,0,MAX(2,COUNTA(Oppsett!$D$3:$D$103)),1)",
        "Fagliste": "OFFSET(Oppsett!$F$3,0,0,MAX(1,COUNTA(Oppsett!$F$3:$F$103)),1)",
        "Dager": f"Lister!$A$2:$A${1 + len(DAGER)}",
        "Typer": f"Lister!$B$2:$B${1 + len([t for t in TYPER if t])}",
    }
    for n, formel in navn.items():
        wb.defined_names.add(DefinedName(n, attr_text=formel))

    # ── Timeplan, Uke, Beskjeder ─────────────────────────────────
    tp = wb.create_sheet("Timeplan")
    _hodrad(tp, KOLONNER["Timeplan"])
    _liste(tp, "A", "Klasser", "Klassen timen hører til.")
    _liste(tp, "B", "Dager", "Ukedag.")
    _liste(tp, "E", "Fagliste", "Faget. Farges automatisk.")
    for kol in ("C", "D"):
        for r in range(2, RADER + 1):
            tp[f"{kol}{r}"].number_format = "hh:mm"
            tp[f"{kol}{r}"].alignment = Alignment(vertical="center", horizontal="center")
    _fargekoder(tp, "E", fag)

    uk = wb.create_sheet("Uke")
    _hodrad(uk, KOLONNER["Uke"])
    _liste(uk, "A", "Klasser", "Klassen dette gjelder. Velg «Alle» for hele trinnet.")
    _liste(uk, "B", "Dager", "Dagen innholdet hører til.")
    _liste(uk, "C", "Fagliste", "Faget. Må stemme med timeplanen for å havne i riktig time.")
    _liste(uk, "F", "Dager", "Når må det være gjort? La stå tomt om det ikke har frist.")
    _liste(uk, "G", "Typer", "Merk prøver, innleveringer og turer.")
    _fargekoder(uk, "C", fag)

    be = wb.create_sheet("Beskjeder")
    _hodrad(be, KOLONNER["Beskjeder"])
    _liste(be, "A", "Klasser", "Klassen beskjeden gjelder. «Alle» går til alle.")

    for arknavn, rader in innhold.items():
        ws = wb[arknavn]
        for r, rad in enumerate(rader, start=2):
            for k, verdi in enumerate(rad, start=1):
                if verdi not in (None, ""):
                    ws.cell(row=r, column=k, value=verdi)

    wb.active = wb.sheetnames.index("Start her")
    wb.save(sti)

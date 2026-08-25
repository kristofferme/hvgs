"""Lager arbeidsboka: timeplanen som rutenett per klasse, og én fane per uke."""

from __future__ import annotations

import datetime as dt

from openpyxl import Workbook
from openpyxl.formatting.rule import FormulaRule, Rule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.styles.differential import DifferentialStyle
from openpyxl.utils import get_column_letter
from openpyxl.workbook.defined_name import DefinedName
from openpyxl.worksheet.datavalidation import DataValidation

from .felles import DAGER, TYPER, datospenn, farge_for, uke_til_mandag

SKRIFT = "Aptos Narrow"
BLEKK = "16212A"
GRA = "5B6A72"
ARK = "EFF2F0"
BAND = "F4F7F5"
KANT = Side(style="thin", color="D3D9D6")

STANDARDFAG = [
    "Norsk", "Matematikk", "Engelsk", "Naturfag", "Samfunnsfag", "KRLE",
    "Kroppsøving", "Musikk", "Kunst og håndverk", "Mat og helse", "Tysk", "Valgfag",
]
STANDARDKLASSER = ["8A", "8B", "9A", "9B", "10A", "10B"]
STANDARDOKTER = ["08:30–09:30", "09:40–10:40", "11:10–12:10", "12:20–13:20", "13:30–14:15"]

OKTRADER = 8            # klokkeslettrader per klasse i Timeplan
INNHOLDSRADER = 400     # rader til tema og lekser
BESKJEDRADER = 120
LARERRADER = 120
UKER_I_LISTA = 46       # nedtrekket dekker et skoleår

UKEKOLONNER = [
    ("Uke", 26), ("Klasse", 11), ("Dag", 12), ("Fag", 20), ("Tema – det vi jobber med", 42),
    ("Lekse / oppgave", 42), ("Frist", 12), ("Type", 14),
]
BESKJEDKOLONNER = [("Uke", 26), ("Klasse", 11), ("Overskrift", 26), ("Beskjed", 70)]
LARERKOLONNER = [("Klasse", 11), ("Fag", 22), ("Lærer", 16)]



def _tint(hex_farge: str, andel: float) -> str:
    h = hex_farge.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    bland = lambda v: int(round(v + (255 - v) * andel))
    return f"{bland(r):02X}{bland(g):02X}{bland(b):02X}"


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
            c.alignment = Alignment(vertical="center", indent=1, wrap_text=bredde >= 40)


def _liste(ws, omrade: str, kilde: str, ledetekst: str) -> None:
    dv = DataValidation(type="list", formula1=kilde, allow_blank=True, showErrorMessage=False)
    dv.prompt = ledetekst
    dv.promptTitle = "Velg fra lista"
    dv.showInputMessage = True
    ws.add_data_validation(dv)
    dv.add(omrade)


def _fargekoder(ws, omrade: str, kolonne: str, forste_rad: int, fag: list[str]) -> None:
    """Farger fagcella, så uka kan leses på fargene alene."""
    brukte: dict[str, str] = {}
    for navn in fag:
        hex_ = farge_for(navn, brukte)
        ws.conditional_formatting.add(
            omrade,
            FormulaRule(
                formula=[f'EXACT(${kolonne}{forste_rad},"{navn}")'],
                fill=PatternFill("solid", bgColor=_tint(hex_, 0.86)),
                font=Font(name=SKRIFT, size=11, bold=True, color=hex_.lstrip("#")),
                stopIfTrue=True,
            ),
        )


def _klasseskille(ws, omrade: str, kolonne: str, forste_rad: int) -> None:
    """Skiller klassene: annenhver klasse tonet, og strek der klassen bytter."""
    ws.conditional_formatting.add(
        omrade,
        Rule(type="expression",
             formula=[f'AND(${kolonne}{forste_rad}<>"",ISODD(MATCH(${kolonne}{forste_rad},Klasser,0)))'],
             dxf=DifferentialStyle(fill=PatternFill("solid", bgColor=BAND))),
    )
    ws.conditional_formatting.add(
        omrade,
        Rule(type="expression",
             formula=[f'AND(${kolonne}{forste_rad}<>"",${kolonne}{forste_rad}<>${kolonne}{forste_rad - 1})'],
             dxf=DifferentialStyle(border=Border(top=Side(style="medium", color=BLEKK)))),
    )


def _ukeskille(ws, omrade: str, forste_rad: int) -> None:
    """Tykk strek der ukenummeret bytter, så uker skiller seg fra klasser."""
    ws.conditional_formatting.add(
        omrade,
        Rule(type="expression",
             formula=[f'AND($A{forste_rad}<>"",$A{forste_rad}<>$A{forste_rad - 1})'],
             dxf=DifferentialStyle(border=Border(top=Side(style="thick", color=BLEKK)))),
    )


def ukemerkelapp(mandag: dt.date) -> str:
    """«36 · 31. aug – 4. sep 2026» – slik uka står i nedtrekket."""
    return f"{mandag.isocalendar()[1]} · {datospenn(mandag, mandag + dt.timedelta(days=4))}"


def ukeliste(forste_dag: dt.date, antall: int = UKER_I_LISTA) -> list[str]:
    """Merkelapper for hele skoleåret, til nedtrekket i Uke-kolonnen."""
    start = forste_dag - dt.timedelta(weeks=6)
    return [ukemerkelapp(start + dt.timedelta(weeks=i)) for i in range(antall)]


# ── Ukeark ───────────────────────────────────────────────────────
def _timeplanrutenett(ws, klasser: list[str], fag: list[str], okter: list[str],
                      timeplan: dict | None = None) -> int:
    """Ett rutenett per klasse: klokkeslett nedover, dager bortover.

    timeplan: {klasse: {dag: [fag per økt]}} fyller rutene. Gir siste rad."""
    timeplan = timeplan or {}
    ws.sheet_view.showGridLines = False
    ws.column_dimensions["A"].width = 16
    for i in range(2, 7):
        ws.column_dimensions[get_column_letter(i)].width = 21

    klassefelt = DataValidation(type="list", formula1="Klasser", allow_blank=True, showErrorMessage=False)
    klassefelt.prompt, klassefelt.promptTitle, klassefelt.showInputMessage = (
        "Klassen dette rutenettet gjelder.", "Velg fra lista", True)
    fagfelt = DataValidation(type="list", formula1="Fagliste", allow_blank=True, showErrorMessage=False)
    fagfelt.prompt, fagfelt.promptTitle, fagfelt.showInputMessage = (
        "Faget i denne timen. Tomt betyr fri.", "Velg fra lista", True)
    ws.add_data_validation(klassefelt)
    ws.add_data_validation(fagfelt)

    rad = 1
    for klasse in klasser:
        c = ws.cell(row=rad, column=1, value=klasse)
        c.font = _skrift(bold=True, size=14, color="FFFFFF")
        c.fill = PatternFill("solid", fgColor=BLEKK)
        c.alignment = Alignment(vertical="center", horizontal="center")
        klassefelt.add(c)
        for i, dag in enumerate(DAGER, start=2):
            d = ws.cell(row=rad, column=i, value=dag)
            d.font = _skrift(bold=True)
            d.fill = PatternFill("solid", fgColor=ARK)
            d.alignment = Alignment(vertical="center", horizontal="center")
            d.border = Border(bottom=Side(style="medium", color=BLEKK))
        ws.row_dimensions[rad].height = 28

        for n in range(OKTRADER):
            r = rad + 1 + n
            ws.row_dimensions[r].height = 22
            t = ws.cell(row=r, column=1, value=okter[n] if n < len(okter) else None)
            t.font = Font(name=SKRIFT, size=10, color=GRA)
            t.alignment = Alignment(vertical="center", horizontal="center")
            t.border = Border(right=Side(style="medium", color=BLEKK), bottom=KANT)
            for i, dag in enumerate(DAGER, start=2):
                celle = ws.cell(row=r, column=i)
                celle.font = _skrift()
                celle.alignment = Alignment(vertical="center", indent=1)
                celle.border = Border(bottom=KANT, right=KANT)
                fylt = timeplan.get(klasse, {}).get(dag, [])
                if n < len(fylt) and fylt[n]:
                    celle.value = fylt[n]
        fagfelt.add(f"B{rad + 1}:F{rad + OKTRADER}")
        rad += OKTRADER + 2
    return rad


def _fargekoder_rutenett(ws, kolonner: str, rader: int, fag: list[str]) -> None:
    """Fargelegger hver dagkolonne i timeplanrutenettet for seg."""
    brukte: dict[str, str] = {}
    for navn in fag:
        hex_ = farge_for(navn, brukte)
        stil = DifferentialStyle(
            fill=PatternFill("solid", bgColor=_tint(hex_, 0.86)),
            font=Font(name=SKRIFT, size=11, bold=True, color=hex_.lstrip("#")),
        )
        for kol in kolonner:
            ws.conditional_formatting.add(
                f"{kol}1:{kol}{rader}",
                Rule(type="expression", formula=[f'EXACT(${kol}1,"{navn}")'], dxf=stil, stopIfTrue=True),
            )


def lag_arbeidsbok(sti, skole="Skolen", uke=None, forste_dag=None, overskrift="Ukeplan",
                   klasser=None, fag=None, okter=None, timeplan=None, innhold=None) -> None:
    """Skriver en ferdig arbeidsbok. Uten innhold blir arkene tomme og klare."""
    klasser = klasser or STANDARDKLASSER
    fag = fag or STANDARDFAG
    okter = okter or STANDARDOKTER
    innhold = innhold or {}
    if forste_dag is None:
        i_dag = dt.date.today()
        forste_dag = i_dag - dt.timedelta(days=i_dag.weekday())
    if uke is None:
        uke = forste_dag.isocalendar()[1]
    uker = ukeliste(forste_dag)

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
        ("steg", "1  Oppsett – skole, ukenummer og datoen for mandagen. Legg inn klassene og fagene dine."),
        ("steg", "2  Timeplan – ett rutenett per klasse. Fyll det ut én gang; det gjelder alle uker."),
        ("steg", "3  Lærere – hvilken lærer faget har i hver klasse. Valgfritt."),
        ("steg", "4  Uke – tema, lekser og frister. Velg uke i nedtrekket i første kolonne."),
        ("steg", "5  Beskjeder – korte meldinger hjem, med samme ukevalg."),
        ("", ""),
        ("steg", "Så kjører du:  python3 ukeplan.py bygg"),
        ("brod", "Du får én nettside med alle ukene. Elevene blar mellom dem med pilene eller piltastene."),
        ("", ""),
        ("mellom", "Når det blir mange uker"),
        ("brod", "Uke-nedtrekket viser både ukenummer og datoer, så du slipper å telle. Én arbeidsbok tar hele skoleåret."),
        ("brod", "Klikk på filterpila i Uke-kolonnen og hak av for én uke når du vil jobbe med bare den. Det er en tykk strek mellom ukene."),
        ("brod", "Skal du gjenta noe fra forrige uke: merk radene, kopier, lim inn nederst og bytt uke i nedtrekket."),
        ("", ""),
        ("mellom", "Godt å vite"),
        ("brod", "Timeplanen gjentas i alle uker. Du fyller den ut én gang, ikke én gang per uke."),
        ("brod", "Klasse, Dag, Fag, Frist og Type har nedtrekkslister. Klikk i cella og velg."),
        ("brod", "Skriv «Alle» i Klasse-feltet når noe gjelder alle klassene."),
        ("brod", "Hver klasse får sin egen tone på ukearket, og det kommer en strek der klassen bytter."),
        ("brod", "Lekser og frister havner i «Å gjøre denne uka» på nettsiden, sortert etter frist."),
        ("brod", "Rader du ikke bruker, lar du stå tomme. Rekkefølgen spiller ingen rolle."),
    ]
    rad = 3
    for slag, tekst in linjer:
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
    opp = wb.create_sheet("Oppsett")
    opp.sheet_view.showGridLines = False
    for kol, bredde in (("A", 3), ("B", 22), ("C", 26), ("D", 30), ("E", 26), ("F", 14)):
        opp.column_dimensions[kol].width = bredde
    _tittel(opp, "B2", "Oppsett", 16)
    felt = [("Skole", skole), ("Ukenummer", uke), ("Mandag i den uka", forste_dag), ("Overskrift", overskrift)]
    for i, (navn, verdi) in enumerate(felt):
        r = 4 + i
        opp.cell(row=r, column=2, value=navn).font = _skrift(color=GRA)
        c = opp.cell(row=r, column=3, value=verdi)
        c.font = _skrift(bold=True, size=12)
        c.fill = PatternFill("solid", fgColor=ARK)
        c.border = Border(bottom=Side(style="medium", color=BLEKK))
        c.alignment = Alignment(vertical="center", indent=1)
        opp.row_dimensions[r].height = 22
    opp["C6"].number_format = "dd.mm.yyyy"
    opp["D5"] = "← uka nettsiden åpner på"
    opp["D5"].font = _skrift(size=10, italic=True, color=GRA)
    opp["D6"] = "← herfra regnes datoene i alle de andre ukene"
    opp["D6"].font = _skrift(size=10, italic=True, color=GRA)

    _tittel(opp, "B9", "Klasser")
    opp["B10"] = "Alle"
    opp["B10"].font = _skrift(italic=True, color=GRA)
    opp["C10"] = "← velg denne når noe gjelder alle"
    opp["C10"].font = _skrift(size=10, italic=True, color=GRA)
    for i, k in enumerate(klasser):
        opp.cell(row=11 + i, column=2, value=k).font = _skrift()
    for r in range(10, 111):
        opp.cell(row=r, column=2).border = Border(bottom=KANT)

    _tittel(opp, "E9", "Fag")
    _tittel(opp, "F9", "Farge")
    brukte: dict[str, str] = {}
    for i, f in enumerate(fag):
        r = 10 + i
        opp.cell(row=r, column=5, value=f).font = _skrift()
        hex_ = farge_for(f, brukte)
        c = opp.cell(row=r, column=6, value=hex_)
        c.font = Font(name=SKRIFT, size=10, color=hex_.lstrip("#"))
        c.fill = PatternFill("solid", fgColor=_tint(hex_, 0.86))
        c.alignment = Alignment(horizontal="center")
    for r in range(10, 111):
        opp.cell(row=r, column=5).border = Border(bottom=KANT)

    # ── Navngitte områder ────────────────────────────────────────
    lister = wb.create_sheet("Lister")
    lister["A1"] = "Dager"
    lister["B1"] = "Typer"
    for i, d in enumerate(DAGER):
        lister.cell(row=2 + i, column=1, value=d)
    ekte_typer = [t for t in TYPER if t]
    for i, t in enumerate(ekte_typer):
        lister.cell(row=2 + i, column=2, value=t)
    lister["D1"] = "Uker"
    for i, merkelapp in enumerate(uker):
        lister.cell(row=2 + i, column=4, value=merkelapp)
    lister.sheet_state = "hidden"

    navn = {
        "Klasser": "OFFSET(Oppsett!$B$10,0,0,MAX(2,COUNTA(Oppsett!$B$10:$B$110)),1)",
        "Fagliste": "OFFSET(Oppsett!$E$10,0,0,MAX(1,COUNTA(Oppsett!$E$10:$E$110)),1)",
        "Dager": f"Lister!$A$2:$A${1 + len(DAGER)}",
        "Typer": f"Lister!$B$2:$B${1 + len(ekte_typer)}",
        "Uker": f"Lister!$D$2:$D${1 + len(uker)}",
    }
    for n, formel in navn.items():
        wb.defined_names.add(DefinedName(n, attr_text=formel))

    # ── Timeplan ─────────────────────────────────────────────────
    tp = wb.create_sheet("Timeplan")
    siste = _timeplanrutenett(tp, klasser, fag, okter, timeplan)
    _fargekoder_rutenett(tp, "BCDEF", siste, fag)

    # ── Lærere ───────────────────────────────────────────────────
    lr = wb.create_sheet("Lærere")
    lr.sheet_view.showGridLines = False
    _tabell(lr, LARERKOLONNER, 1, LARERRADER)
    lr.freeze_panes = "A2"
    lr.auto_filter.ref = f"A1:C{LARERRADER}"
    _liste(lr, f"A2:A{LARERRADER}", "Klasser", "Klassen. «Alle» gjelder alle klasser.")
    _liste(lr, f"B2:B{LARERRADER}", "Fagliste", "Faget.")
    _fargekoder(lr, f"B2:B{LARERRADER}", "B", 2, fag)
    _klasseskille(lr, f"A2:C{LARERRADER}", "A", 2)
    for r, rad in enumerate(innhold.get("Lærere", []), start=2):
        for k, verdi in enumerate(rad, start=1):
            if verdi not in (None, ""):
                lr.cell(row=r, column=k, value=verdi)

    # ── Uke ──────────────────────────────────────────────────────
    uk = wb.create_sheet("Uke")
    uk.sheet_view.showGridLines = False
    _tabell(uk, UKEKOLONNER, 1, INNHOLDSRADER)
    uk.freeze_panes = "B2"
    uk.auto_filter.ref = f"A1:H{1 + INNHOLDSRADER}"
    sist = 1 + INNHOLDSRADER
    _liste(uk, f"A2:A{sist}", "Uker", "Velg uke. Lista viser ukenummer og datoer.")
    _liste(uk, f"B2:B{sist}", "Klasser", "Klassen dette gjelder. Velg «Alle» for alle klasser.")
    _liste(uk, f"C2:C{sist}", "Dager", "Dagen innholdet hører til.")
    _liste(uk, f"D2:D{sist}", "Fagliste", "Faget. Må stemme med timeplanen for å havne i riktig time.")
    _liste(uk, f"G2:G{sist}", "Dager", "Når må det være gjort? La stå tomt om det ikke har frist.")
    _liste(uk, f"H2:H{sist}", "Typer", "Merk prøver, innleveringer og turer.")
    _fargekoder(uk, f"D2:D{sist}", "D", 2, fag)
    _klasseskille(uk, f"A2:H{sist}", "B", 2)
    _ukeskille(uk, f"A2:H{sist}", 2)

    # ── Beskjeder ────────────────────────────────────────────────
    be = wb.create_sheet("Beskjeder")
    be.sheet_view.showGridLines = False
    _tabell(be, BESKJEDKOLONNER, 1, BESKJEDRADER)
    be.freeze_panes = "B2"
    be.auto_filter.ref = f"A1:D{1 + BESKJEDRADER}"
    _liste(be, f"A2:A{1 + BESKJEDRADER}", "Uker", "Velg uke.")
    _liste(be, f"B2:B{1 + BESKJEDRADER}", "Klasser", "Klassen beskjeden gjelder. «Alle» går til alle.")
    _klasseskille(be, f"A2:D{1 + BESKJEDRADER}", "B", 2)
    _ukeskille(be, f"A2:D{1 + BESKJEDRADER}", 2)

    for arknavn in ("Uke", "Beskjeder"):
        for r, rad in enumerate(innhold.get(arknavn, []), start=2):
            for k, verdi in enumerate(rad, start=1):
                if k == 1 and isinstance(verdi, int):
                    verdi = ukemerkelapp(uke_til_mandag(verdi, forste_dag))
                if verdi not in (None, ""):
                    wb[arknavn].cell(row=r, column=k, value=verdi)

    wb.active = wb.sheetnames.index("Start her")
    wb.save(sti)

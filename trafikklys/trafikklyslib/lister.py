"""Lager oppsettet for en liste i Microsoft Lists – der lærerne melder inn.

Excel-fila er formatert som en tabell, slik «Ny liste → Fra Excel» krever.
JSON-fila er kolonneformatering du limer inn i «Formater denne kolonnen».
"""

from __future__ import annotations

import json
from pathlib import Path

from openpyxl import Workbook
from openpyxl.worksheet.table import Table, TableStyleInfo

from .felles import LYSFARGER, lysnavn, statusnavn, tekster, tolk_sprak

SKJEMA_KOLONNE = "https://developer.microsoft.com/json-schemas/sp/v2/column-formatting.schema.json"
SKJEMA_RAD = "https://developer.microsoft.com/json-schemas/sp/v2/row-formatting.schema.json"


def _hvis(felt: str, par: list[tuple[str, str]], ellers: str) -> str:
    """Bygger den nøstede if-en SharePoint vil ha: if(a,x,if(b,y,z))."""
    ut = f"'{ellers}'"
    for verdi, resultat in reversed(par):
        ut = f"if({felt} == '{verdi}', '{resultat}', {ut})"
    return "=" + ut


def lyskolonne(sprak: str) -> dict:
    navn = lysnavn(sprak)
    par = list(zip(navn, [LYSFARGER["gronn"], LYSFARGER["gul"], LYSFARGER["rod"]]))
    return {
        "$schema": SKJEMA_KOLONNE,
        "elmType": "div",
        "txtContent": "@currentField",
        "style": {
            "display": "=if(@currentField == '', 'none', 'inline-block')",
            "padding": "2px 12px",
            "border-radius": "12px",
            "font-weight": "600",
            "color": "#ffffff",
            "background-color": _hvis("@currentField", par, "#8A8886"),
        },
    }


def radvisning(sprak: str) -> dict:
    T = tekster(sprak)
    gront, gult, rodt = lysnavn(sprak)
    return {
        "$schema": SKJEMA_RAD,
        "additionalRowClass": _hvis(
            f"[${T['lys']}]",
            [(rodt, "sp-field-severity--blocked"), (gult, "sp-field-severity--warning"),
             (gront, "sp-field-severity--good")],
            ""),
    }


def fristkolonne(sprak: str) -> dict:
    T = tekster(sprak)
    avslutta = statusnavn(sprak)[3]
    over = (f"Number([${T['frist']}]) <= Number(@now) && [${T['status']}] != '{avslutta}'")
    return {
        "$schema": SKJEMA_KOLONNE,
        "elmType": "div",
        "attributes": {"class": f"=if({over}, 'sp-field-severity--blocked', '')"},
        "style": {"display": "flex", "align-items": "center", "gap": "6px"},
        "children": [
            {"elmType": "span",
             "attributes": {"iconName": f"=if({over}, 'Warning', '')"}},
            {"elmType": "span",
             "txtContent": f"=if([${T['frist']}] == '', '', toLocaleDateString([${T['frist']}]))"},
        ],
    }


def statuskolonne(sprak: str) -> dict:
    T = tekster(sprak)
    navnene = statusnavn(sprak)
    par = [(navnene[3], "sp-field-severity--good"), (navnene[0], "sp-field-severity--blocked")]
    return {
        "$schema": SKJEMA_KOLONNE,
        "elmType": "div",
        "attributes": {"class": _hvis("@currentField", par, "sp-field-severity--warning")},
        "txtContent": "@currentField",
    }


def _tabellbok(sti: Path, arknavn: str, kolonner: list[str], rader: list[list],
               tabellnavn: str) -> None:
    wb = Workbook()
    ws = wb.active
    ws.title = arknavn
    ws.append(kolonner)
    for rad in rader:
        ws.append(rad)
    slutt = f"{chr(ord('A') + len(kolonner) - 1)}{1 + max(1, len(rader))}"
    tabell = Table(displayName=tabellnavn, ref=f"A1:{slutt}")
    tabell.tableStyleInfo = TableStyleInfo(name="TableStyleMedium2", showRowStripes=True)
    ws.add_table(tabell)
    for i, navn in enumerate(kolonner, start=1):
        ws.column_dimensions[chr(ord('A') + i - 1)].width = max(14, min(60, len(navn) + 14))
    wb.save(sti)


def skriv(mappe, data: dict) -> list[Path]:
    """Skriver alt som trengs for å sette opp lista. Returnerer filene som ble laget."""
    mappe = Path(mappe)
    mappe.mkdir(parents=True, exist_ok=True)
    sprak = tolk_sprak(data.get("sprak", "nb"))
    T = tekster(sprak)
    gront, gult, rodt = lysnavn(sprak)
    klasse = (data["klasser"] or ["1ID"])[0]
    omrade = (data["omrader"] or [{"navn": "Frammøte"}])[0]["navn"]
    mote = (data["moter"] or [{"navn": "1"}])[0]["navn"]

    laget = []

    inn = mappe / "Innmelding.xlsx"
    _tabellbok(
        inn, T["ark_innmelding"],
        [T["mote"], T["klasse"], T["elev"], T["omrade"], T["lys"], T["merknad"]],
        [[mote, klasse, "Ola Nordmann", omrade, gult,
          "Eksempelrad. Slett den når lista er laget."]],
        "Innmelding")
    laget.append(inn)

    til = mappe / "Tiltak.xlsx"
    _tabellbok(
        til, T["ark_tiltak"],
        [T["mote"], T["klasse"], T["elev"], T["omrade"], T["tiltak"], T["ansvarleg"],
         T["frist"], T["status"]],
        [[mote, klasse, "Ola Nordmann", omrade, "Eksempelrad. Slett den når lista er laget.",
          "Kontaktlærer", "", statusnavn(sprak)[0]]],
        "Tiltak")
    laget.append(til)

    for navn, innhald in (("lys-kolonne.json", lyskolonne(sprak)),
                          ("rad-visning.json", radvisning(sprak)),
                          ("tiltak-frist-kolonne.json", fristkolonne(sprak)),
                          ("tiltak-status-kolonne.json", statuskolonne(sprak))):
        sti = mappe / navn
        sti.write_text(json.dumps(innhald, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        laget.append(sti)

    valg = mappe / "valgene.txt"
    valg.write_text(
        "Verdiene til valgkolonnene i lista. Kopier og lim inn.\n\n"
        f"{T['lys']}:\n" + "\n".join(lysnavn(sprak)) + "\n\n"
        f"{T['omrade']}:\n" + "\n".join(o["navn"] for o in data["omrader"]) + "\n\n"
        f"{T['klasse']}:\n" + "\n".join(data["klasser"]) + "\n\n"
        f"{T['mote']}:\n" + "\n".join(m["navn"] for m in data["moter"]) + "\n\n"
        f"{T['status']}:\n" + "\n".join(statusnavn(sprak)) + "\n",
        encoding="utf-8")
    laget.append(valg)
    return laget

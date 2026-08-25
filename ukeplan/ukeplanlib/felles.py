"""Felles begreper: dager, fagfarger og tolerant tolking av det brukeren skriver."""

from __future__ import annotations

import datetime as dt
import re
import unicodedata

DAGER = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"]
DAG_KORT = {"Mandag": "Man", "Tirsdag": "Tir", "Onsdag": "Ons", "Torsdag": "Tor", "Fredag": "Fre"}
MANEDER = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"]

TYPER = ["", "Prøve", "Innlevering", "Frist", "Tur", "Info", "Vurdering"]

# Faste farger for fagene de fleste skoler har. Alle er valgt for å skille seg
# fra hverandre på papir og skjerm, og for å tåle å bli lysnet i mørk modus.
FAGFARGER = {
    "norsk": "#2F4B7C",
    "matematikk": "#A6432C",
    "matte": "#A6432C",
    "engelsk": "#1F6E5B",
    "naturfag": "#4F7020",
    "samfunnsfag": "#6B3A63",
    "krle": "#8A6A17",
    "kroppsøving": "#1D6D82",
    "gym": "#1D6D82",
    "musikk": "#A03A5E",
    "kunst og håndverk": "#B0651B",
    "mat og helse": "#7C5230",
    "tysk": "#365E7A",
    "spansk": "#8C4A2F",
    "fransk": "#4A4E7A",
    "arbeidslivsfag": "#55606B",
    "utdanningsvalg": "#55606B",
    "valgfag": "#5E6B4A",
    "kontaktlærertime": "#55606B",
}

# Reservefarger for fag som ikke står i lista over.
RESERVE = ["#3B5E8C", "#8A4B2A", "#2A6B57", "#6B3A63", "#7A6A1C", "#245F70", "#8C3A52", "#4C6B2F"]


def rens(verdi) -> str:
    """Gjør en celle om til ren tekst uten doble mellomrom."""
    if verdi is None:
        return ""
    if isinstance(verdi, float) and verdi.is_integer():
        verdi = int(verdi)
    return re.sub(r"\s+", " ", str(verdi)).strip()


def nokkel(verdi) -> str:
    """Sammenlikningsnøkkel: liten skrift, uten aksenter og skilletegn."""
    tekst = rens(verdi).lower()
    tekst = unicodedata.normalize("NFKD", tekst)
    return re.sub(r"[^a-z0-9æøå]+", "", tekst.replace("́", ""))


def tolk_dag(verdi) -> str:
    """'man', 'MANDAG', 'mandag ' → 'Mandag'. Ukjent dag gir tom streng."""
    n = nokkel(verdi)
    if not n:
        return ""
    for dag in DAGER:
        if n == nokkel(dag) or n == nokkel(DAG_KORT[dag]) or nokkel(dag).startswith(n[:3]):
            return dag
    return ""


def tolk_tid(verdi) -> str:
    """Godtar 08:30, 8.30, tekst eller Excel-klokkeslett. Gir 'HH:MM'."""
    if verdi is None or verdi == "":
        return ""
    if isinstance(verdi, dt.datetime):
        return verdi.strftime("%H:%M")
    if isinstance(verdi, dt.time):
        return verdi.strftime("%H:%M")
    if isinstance(verdi, (int, float)):
        total = int(round(float(verdi) % 1 * 24 * 60))
        return f"{total // 60:02d}:{total % 60:02d}"
    treff = re.match(r"^\s*(\d{1,2})[:.\s]?(\d{2})\s*$", str(verdi))
    if treff:
        return f"{int(treff.group(1)):02d}:{treff.group(2)}"
    return rens(verdi)


def tolk_dato(verdi):
    """Godtar dato-celle, '2026-08-31', '31.08.2026' eller '31.8.26'."""
    if isinstance(verdi, dt.datetime):
        return verdi.date()
    if isinstance(verdi, dt.date):
        return verdi
    tekst = rens(verdi)
    for form in ("%Y-%m-%d", "%d.%m.%Y", "%d.%m.%y", "%d/%m/%Y", "%d/%m/%y"):
        try:
            return dt.datetime.strptime(tekst, form).date()
        except ValueError:
            continue
    return None


def tolk_type(verdi) -> str:
    n = nokkel(verdi)
    for t in TYPER:
        if t and nokkel(t) == n:
            return t
    return rens(verdi)


def farge_for(fag: str, brukte: dict) -> str:
    """Fast farge hvis faget er kjent, ellers neste ledige reservefarge."""
    n = nokkel(fag)
    for navn, hex_ in FAGFARGER.items():
        if nokkel(navn) == n:
            return hex_
    if fag not in brukte:
        brukte[fag] = RESERVE[len(brukte) % len(RESERVE)]
    return brukte[fag]


def norsk_dato(dato: dt.date) -> str:
    return f"{dato.day}. {MANEDER[dato.month - 1]}"


def datospenn(fra: dt.date, til: dt.date) -> str:
    if fra.month == til.month:
        return f"{fra.day}.–{til.day}. {MANEDER[til.month - 1]} {til.year}"
    return f"{norsk_dato(fra)} – {norsk_dato(til)} {til.year}"


def mandag_i_uke(aar: int, uke: int) -> dt.date:
    return dt.date.fromisocalendar(aar, uke, 1)

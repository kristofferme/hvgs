"""Felles begreper: dager, fagfarger, språk og tolerant tolking av det brukeren skriver."""

from __future__ import annotations

import datetime as dt
import re
import unicodedata

DAGER = ["Mandag", "Tirsdag", "Onsdag", "Torsdag", "Fredag"]
DAGNAVN = {
    "nb": DAGER,
    "nn": ["Måndag", "Tysdag", "Onsdag", "Torsdag", "Fredag"],
}
# Skrivemåter og forkortelser vi godtar i cellene.
DAGFORMER = {
    "Mandag": ["mandag", "måndag", "man", "mån", "ma", "mon"],
    "Tirsdag": ["tirsdag", "tysdag", "tir", "tys", "ti"],
    "Onsdag": ["onsdag", "ons", "on"],
    "Torsdag": ["torsdag", "tor", "to"],
    "Fredag": ["fredag", "fre", "fr"],
}
MANEDER = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"]

TYPER = {
    "nb": ["Prøve", "Innlevering", "Frist", "Vurdering", "Utplassering", "Fagdag", "Tur", "Info"],
    "nn": ["Prøve", "Innlevering", "Frist", "Vurdering", "Utplassering", "Fagdag", "Tur", "Info"],
}
VIKTIGE_TYPER = ("prøve", "innlevering", "frist", "vurdering")

# Faste farger for fagene. Nøkkelen er faget i liten skrift uten skilletegn,
# så «Matematikk 1P-Y» og «matematikk 1py» treffer det samme.
FAGFARGER = {
    # Fellesfag
    "norsk": "#2F4B7C",
    "matematikk": "#A6432C",
    "engelsk": "#1F6E5B",
    "naturfag": "#4F7020",
    "samfunnsfag": "#6B3A63",
    "samfunnskunnskap": "#6B3A63",
    "historie": "#7A4B2A",
    "geografi": "#2A6B57",
    "krle": "#8A6A17",
    "religionogetikk": "#8A6A17",
    "kroppsøving": "#1D6D82",
    "musikk": "#A03A5E",
    "kunstoghåndverk": "#B0651B",
    "matoghelse": "#7C5230",
    "tysk": "#365E7A",
    "spansk": "#8C4A2F",
    "fransk": "#4A4E7A",
    "valgfag": "#5E6B4A",
    # Studieførebuande programfag
    "biologi": "#4F7020",
    "kjemi": "#2A6B57",
    "fysikk": "#3B5E8C",
    "sosiologiogsosialantropologi": "#6B3A63",
    "sosialkunnskap": "#6B3A63",
    "rettslære": "#55606B",
    "psykologi": "#7A3F6B",
    "markedsføringogledelse": "#8A5A2B",
    "økonomiogledelse": "#8A5A2B",
    "toppidrett": "#1D6D82",
    # Yrkesfag
    "helsefremmendearbeid": "#8C3A52",
    "helsefremjandearbeid": "#8C3A52",
    "kommunikasjonogsamhandling": "#7A3F6B",
    "yrkesliv": "#55606B",
    "yrkesfagligfordypning": "#55606B",
    "yrkesfagligfordjuping": "#55606B",
    "yrkesfaglegfordjuping": "#55606B",
    "yrkesfagligfordypningyff": "#55606B",
    "yff": "#55606B",
    "produksjonogtjenester": "#8A5A2B",
    "produksjonogtenester": "#8A5A2B",
    "konstruksjonogstyringsteknikk": "#3B5E8C",
    "konstruksjonsogstyringsteknikk": "#3B5E8C",
    "arbeidsmiljøogdokumentasjon": "#55606B",
    "råvareproduksjonogkvalitet": "#A8442C",
    "bransjeogarbeidsliv": "#8A5A2B",
    "arbeidsmiljøogyrkesutøvelse": "#55606B",
    "praksis": "#245F70",
    "utplassering": "#245F70",
    "kontaktlærertime": "#55606B",
    "kontaktlærartime": "#55606B",
    "klassetime": "#55606B",
    "studietid": "#55606B",
}
PROFILFARGE_STANDARD = "#0093C9"
RESERVE = ["#3B5E8C", "#8A4B2A", "#2A6B57", "#6B3A63", "#7A6A1C", "#245F70", "#8C3A52", "#4C6B2F"]

# Alt som står på nettsiden og i arbeidsboka, på begge målformer.
TEKSTER = {
    "nb": {
        "sprak": "bokmål",
        "uke": "Uke", "uker": "uker", "veke_stor": "UKE",
        "ukeplan": "Ukeplan",
        "klasse": "Klasse", "klasser": "Klasser", "alle": "Alle",
        "fag": "Fag", "farge": "Farge",
        "vis_alle": "vis alle", "skjul_alle": "skjul alle",
        "skriv_ut": "Skriv ut", "lys": "Lys", "mork": "Mørk",
        "forrige_uke": "Forrige uke", "neste_uke": "Neste uke",
        "tilbake": "Tilbake til denne uka",
        "gjore": "Å gjøre denne uka", "punkt": "punkt",
        "ingen_timer": "Ingen timer",
        "ingen_frister": "Ingen lekser eller frister denne uka.",
        "frist": "frist", "frister": "frister",
        "se_gjore": "se «Å gjøre denne uka»",
        "naa": "nå", "oppdatert": "Oppdatert",
        # Arbeidsboka
        "ark_start": "Start her", "ark_oppsett": "Oppsett", "ark_timeplan": "Timeplan",
        "ark_larere": "Lærere", "ark_uke": "Uke", "ark_beskjeder": "Beskjeder", "ark_lister": "Lister",
        "skole": "Skole", "ukenummer": "Ukenummer", "mandag_i_uka": "Mandag i den uka",
        "overskrift": "Overskrift", "sprakfelt": "Språk", "profilfarge": "Profilfarge",
        "logo": "Logo (filnavn)",
        "kol_dag": "Dag", "kol_tema": "Tema – det vi jobber med", "kol_lekse": "Lekse / oppgave",
        "kol_frist": "Frist", "kol_type": "Type", "kol_larer": "Lærer",
        "kol_tittel": "Overskrift", "kol_beskjed": "Beskjed",
    },
    "nn": {
        "sprak": "nynorsk",
        "uke": "Veke", "uker": "veker", "veke_stor": "VEKE",
        "ukeplan": "Vekeplan",
        "klasse": "Klasse", "klasser": "Klassar", "alle": "Alle",
        "fag": "Fag", "farge": "Farge",
        "vis_alle": "vis alle", "skjul_alle": "skjul alle",
        "skriv_ut": "Skriv ut", "lys": "Lys", "mork": "Mørk",
        "forrige_uke": "Førre veke", "neste_uke": "Neste veke",
        "tilbake": "Tilbake til denne veka",
        "gjore": "Å gjere denne veka", "punkt": "punkt",
        "ingen_timer": "Ingen timar",
        "ingen_frister": "Ingen lekser eller fristar denne veka.",
        "frist": "frist", "frister": "fristar",
        "se_gjore": "sjå «Å gjere denne veka»",
        "naa": "no", "oppdatert": "Oppdatert",
        # Arbeidsboka
        "ark_start": "Start her", "ark_oppsett": "Oppsett", "ark_timeplan": "Timeplan",
        "ark_larere": "Lærarar", "ark_uke": "Veke", "ark_beskjeder": "Meldingar", "ark_lister": "Lister",
        "skole": "Skule", "ukenummer": "Vekenummer", "mandag_i_uka": "Måndag i den veka",
        "overskrift": "Overskrift", "sprakfelt": "Språk", "profilfarge": "Profilfarge",
        "logo": "Logo (filnamn)",
        "kol_dag": "Dag", "kol_tema": "Tema – det vi jobbar med", "kol_lekse": "Lekse / oppgåve",
        "kol_frist": "Frist", "kol_type": "Type", "kol_larer": "Lærar",
        "kol_tittel": "Overskrift", "kol_beskjed": "Melding",
    },
}
ARKNAVN = {navn: [TEKSTER["nb"][navn], TEKSTER["nn"][navn]] for navn in
           ("ark_start", "ark_oppsett", "ark_timeplan", "ark_larere", "ark_uke",
            "ark_beskjeder", "ark_lister")}


def tekster(sprak: str = "nb") -> dict:
    return TEKSTER.get(tolk_sprak(sprak), TEKSTER["nb"])


def tolk_sprak(verdi) -> str:
    n = nokkel(verdi)
    if n.startswith("ny") or n in ("nn", "nynorsk"):
        return "nn"
    return "nb"


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
    """«man», «MÅNDAG», «tysdag» → «Mandag»/«Tirsdag». Ukjent dag gir tom streng."""
    n = nokkel(verdi)
    if not n:
        return ""
    for dag, former in DAGFORMER.items():
        if n in [nokkel(f) for f in former]:
            return dag
    if len(n) >= 3:
        for dag, former in DAGFORMER.items():
            if any(nokkel(f).startswith(n) or n.startswith(nokkel(f)) for f in former if len(f) > 3):
                return dag
    return ""


def dagnavn(sprak: str = "nb") -> list[str]:
    return DAGNAVN.get(tolk_sprak(sprak), DAGER)


def vis_dag(dag: str, sprak: str = "nb") -> str:
    """Fra det interne navnet til navnet i valgt målform."""
    if dag in DAGER:
        return dagnavn(sprak)[DAGER.index(dag)]
    return dag


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


def tolk_okt(verdi) -> tuple[str, str]:
    """'08:15–09:45' → ('08:15', '09:45'). Ett klokkeslett gir tom sluttid."""
    tekst = rens(verdi).replace("—", "–").replace("−", "–")
    deler = [d for d in re.split(r"[–\-]", tekst) if d.strip()]
    if not deler:
        return "", ""
    if len(deler) == 1:
        return tolk_tid(deler[0]), ""
    return tolk_tid(deler[0]), tolk_tid(deler[1])


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


def tolk_type(verdi, sprak: str = "nb") -> str:
    n = nokkel(verdi)
    for t in TYPER["nb"] + TYPER["nn"]:
        if nokkel(t) == n:
            return t
    return rens(verdi)


def tolk_farge(verdi, standard: str) -> str:
    tekst = rens(verdi)
    if re.fullmatch(r"#[0-9a-fA-F]{6}", tekst):
        return tekst.upper()
    return standard


def farge_for(fag: str, brukte: dict) -> str:
    """Fast farge hvis faget er kjent, ellers neste ledige reservefarge.

    «Matematikk 1P-Y» og «Norsk hovudmål» treffer grunnfaget."""
    n = nokkel(fag)
    if n in FAGFARGER:
        return FAGFARGER[n]
    for navn, hex_ in FAGFARGER.items():
        if len(navn) > 4 and n.startswith(navn):
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


def uke_til_mandag(uke: int, referanse: dt.date) -> dt.date:
    """Uke 2 kan være i januar neste år. Velger året som ligger nærmest referansen."""
    kandidater = []
    for aar in (referanse.year - 1, referanse.year, referanse.year + 1):
        try:
            kandidater.append(dt.date.fromisocalendar(aar, uke, 1))
        except ValueError:
            continue
    return min(kandidater, key=lambda d: abs((d - referanse).days))

"""Felles begreper: lysene, områdene, språket og tolerant tolking av cellene."""

from __future__ import annotations

import datetime as dt
import re
import unicodedata

# ── Lysene ───────────────────────────────────────────────────────
# Nøkkelen er den interne, målformuavhengige verdien.
LYS = {
    "nb": [("Grønt", "gronn"), ("Gult", "gul"), ("Rødt", "rod")],
    "nn": [("Grønt", "gronn"), ("Gult", "gul"), ("Raudt", "rod")],
}
LYSFARGER = {"gronn": "#2E7D4F", "gul": "#B77F0F", "rod": "#B3382A"}
LYSVEKT = {"gronn": 1, "gul": 2, "rod": 3}
# Skrivemåter vi godtar i cellene, på begge målformer og med snarveier.
LYSFORMER = {
    "gronn": ["grønt", "grønn", "grøn", "gront", "gronn", "gron", "green", "g", "1"],
    "gul": ["gult", "gul", "yellow", "y", "2"],
    "rod": ["rødt", "rød", "raudt", "raud", "rodt", "rød ", "rod", "red", "r", "3"],
}

# ── Områdene ─────────────────────────────────────────────────────
# Utgangspunktet skolen kan endre. Ett område = én kolonne i rutenettet.
OMRADER = {
    "nb": [
        ("Oppmøte", "Fravær, forsentkomming, timer eleven ikke er i"),
        ("Faglig utvikling", "Måloppnåelse, fare for IV, behov for tilrettelegging"),
        ("Arbeidsinnsats", "Innleveringer, innsats i timene, utstyr og bøker med"),
        ("Motivasjon", "Retning, mestringstro, om eleven vil være her"),
        ("Trivsel", "Hvordan eleven har det på skolen"),
        ("Klassemiljø", "Relasjoner, tilhørighet, utenforskap"),
        ("Hjem og foresatte", "Kontakt, samarbeid, informasjonsflyt"),
        ("Praktiske forhold", "Skyss, bolig, utstyr, økonomi"),
    ],
    "nn": [
        ("Frammøte", "Fråvær, for sein komming, timar eleven ikkje er i"),
        ("Fagleg utvikling", "Måloppnåing, fare for IV, behov for tilrettelegging"),
        ("Arbeidsinnsats", "Innleveringar, innsats i timane, utstyr og bøker med"),
        ("Motivasjon", "Retning, meistringstru, om eleven vil vere her"),
        ("Trivsel", "Korleis eleven har det på skulen"),
        ("Klassemiljø", "Relasjonar, tilhøyrsle, utanforskap"),
        ("Heim og føresette", "Kontakt, samarbeid, informasjonsflyt"),
        ("Praktiske forhold", "Skyss, bustad, utstyr, økonomi"),
    ],
}

# ── Status på tiltak ─────────────────────────────────────────────
STATUSAR = {
    "nb": [("Ikke startet", "apen"), ("Pågår", "apen"), ("Følges opp", "apen"),
           ("Avsluttet", "lukket"), ("Videreført", "apen")],
    "nn": [("Ikkje starta", "apen"), ("Pågår", "apen"), ("Blir følgd opp", "apen"),
           ("Avslutta", "lukket"), ("Vidareført", "apen")],
}

PROFILFARGE_STANDARD = "#0093C9"
MANEDER = ["jan", "feb", "mar", "apr", "mai", "jun", "jul", "aug", "sep", "okt", "nov", "des"]

STANDARDKLASSER = ["1ID", "1HO", "1NA", "1RM", "1TIF1", "1TIF2", "1TIF3",
                   "2AKV/FF", "2KJP/AR", "2KJP/RM", "3PB1", "3PB2"]

TEKSTER = {
    "nb": {
        "sprak": "bokmål",
        "trafikklys": "Trafikklys", "elevstatus": "Elevstatus",
        "skole": "Skole", "skoleaar": "Skoleår", "sprakfelt": "Språk",
        "profilfarge": "Profilfarge", "logo": "Logo (filnavn)", "overskrift": "Overskrift",
        "klasse": "Klasse", "klasser": "Klasser", "alle": "Alle",
        "elev": "Elev", "elever": "Elever", "elevar_ark": "Elever",
        "omrade": "Område", "omrader": "Områder", "forklaring": "Hva vi ser etter",
        "lys": "Lys", "merknad": "Merknad", "larer": "Lærer", "larere": "Lærere",
        "mote": "Møte", "moter": "Møter", "dato": "Dato",
        "tiltak": "Tiltak", "ansvarleg": "Ansvarlig", "frist": "Frist", "status": "Status",
        "ark_start": "Start her", "ark_oppsett": "Oppsett", "ark_innmelding": "Innmelding",
        "ark_tiltak": "Tiltak", "ark_lister": "Lister",
        # Møtevisningen
        "motekoe": "Ta opp i møtet", "ingen_ko": "Ingenting er meldt inn på gult eller rødt.",
        "rutenett": "Rutenett", "alfabetisk": "Alfabetisk", "mest_rodt": "Mest rødt først",
        "vis_alle_elever": "Vis alle elevene", "vis_meldte": "Vis bare de som er meldt inn",
        "opne_tiltak": "Åpne tiltak", "ingen_tiltak": "Ingen tiltak er ført opp.",
        "forrige_mote": "Forrige møte", "neste_mote": "Neste møte",
        "ingen_innmelding": "Ingen innmeldinger for denne klassen på dette møtet.",
        "meldt_av": "Meldt inn av", "ingen_merknad": "uten merknad",
        "skriv_ut": "Skriv ut", "lys_knapp": "Lys", "mork": "Mørk",
        "oppdatert": "Bygget", "lukk": "Lukk",
        "grone": "grønne", "gule": "gule", "rode": "røde",
        "ny_siden_sist": "ny siden sist", "verre": "verre enn sist", "bedre": "bedre enn sist",
        "over_frist": "over frist", "uten_lys": "ikke meldt inn",
        "personvern": "Inneholder personopplysninger.",
        "personvern_hvor": "Fila hører hjemme i Teams, bak tilgangsstyringen skolen allerede har – ikke på en åpen nettadresse. Slett den fra maskinen din etter møtet.",
        "vis_alt": "Vis alle merknadene", "skjul_alt": "Skjul merknadene",
        "aapne": "åpne", "elevar_med": "elever med noe meldt inn",
        "ingen_moter": "Ingen møter er satt opp i Oppsett-arket.",
        "ingen_elever": "Ingen elever er lagt inn for denne klassen.",
        "totalt": "til sammen", "melding": "melding", "meldinger": "meldinger",
    },
    "nn": {
        "sprak": "nynorsk",
        "trafikklys": "Trafikklys", "elevstatus": "Elevstatus",
        "skole": "Skule", "skoleaar": "Skuleår", "sprakfelt": "Språk",
        "profilfarge": "Profilfarge", "logo": "Logo (filnamn)", "overskrift": "Overskrift",
        "klasse": "Klasse", "klasser": "Klassar", "alle": "Alle",
        "elev": "Elev", "elever": "Elevar", "elevar_ark": "Elevar",
        "omrade": "Område", "omrader": "Område", "forklaring": "Kva vi ser etter",
        "lys": "Lys", "merknad": "Merknad", "larer": "Lærar", "larere": "Lærarar",
        "mote": "Møte", "moter": "Møte", "dato": "Dato",
        "tiltak": "Tiltak", "ansvarleg": "Ansvarleg", "frist": "Frist", "status": "Status",
        "ark_start": "Start her", "ark_oppsett": "Oppsett", "ark_innmelding": "Innmelding",
        "ark_tiltak": "Tiltak", "ark_lister": "Lister",
        "motekoe": "Ta opp i møtet", "ingen_ko": "Ingenting er meldt inn på gult eller raudt.",
        "rutenett": "Rutenett", "alfabetisk": "Alfabetisk", "mest_rodt": "Mest raudt først",
        "vis_alle_elever": "Vis alle elevane", "vis_meldte": "Vis berre dei som er meldte inn",
        "opne_tiltak": "Opne tiltak", "ingen_tiltak": "Ingen tiltak er førte opp.",
        "forrige_mote": "Førre møte", "neste_mote": "Neste møte",
        "ingen_innmelding": "Ingen innmeldingar for denne klassen på dette møtet.",
        "meldt_av": "Meldt inn av", "ingen_merknad": "utan merknad",
        "skriv_ut": "Skriv ut", "lys_knapp": "Lys", "mork": "Mørk",
        "oppdatert": "Bygd", "lukk": "Lukk",
        "grone": "grøne", "gule": "gule", "rode": "raude",
        "ny_siden_sist": "ny sidan sist", "verre": "verre enn sist", "bedre": "betre enn sist",
        "over_frist": "over frist", "uten_lys": "ikkje meldt inn",
        "personvern": "Inneheld personopplysningar.",
        "personvern_hvor": "Fila høyrer heime i Teams, bak tilgangsstyringa skulen allereie har – ikkje på ei open nettadresse. Slett henne frå maskina di etter møtet.",
        "vis_alt": "Vis alle merknadene", "skjul_alt": "Skjul merknadene",
        "aapne": "opne", "elevar_med": "elevar med noko meldt inn",
        "ingen_moter": "Ingen møte er sette opp i Oppsett-arket.",
        "ingen_elever": "Ingen elevar er lagde inn for denne klassen.",
        "totalt": "til saman", "melding": "melding", "meldinger": "meldingar",
    },
}
ARKNAVN = {navn: sorted({TEKSTER["nb"][navn], TEKSTER["nn"][navn]}) for navn in
           ("ark_start", "ark_oppsett", "ark_innmelding", "ark_tiltak", "ark_lister",
            "elevar_ark")}


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
    if isinstance(verdi, (dt.datetime, dt.date)):
        return kort_dato(verdi)
    return re.sub(r"\s+", " ", str(verdi)).strip()


def nokkel(verdi) -> str:
    """Sammenlikningsnøkkel: liten skrift, uten aksenter og skilletegn."""
    tekst = rens(verdi).lower()
    tekst = unicodedata.normalize("NFKD", tekst)
    return re.sub(r"[^a-z0-9æøå]+", "", tekst.replace("́", ""))


def lysnavn(sprak: str = "nb") -> list[str]:
    return [navn for navn, _ in LYS[tolk_sprak(sprak)]]


def statusnavn(sprak: str = "nb") -> list[str]:
    return [navn for navn, _ in STATUSAR[tolk_sprak(sprak)]]


def statusslag() -> dict:
    """Alle statusnavn på begge målformer → om tiltaket er åpent eller lukket."""
    return {nokkel(navn): slag for liste in STATUSAR.values() for navn, slag in liste}


def tolk_lys(verdi) -> str:
    """«Raudt», «rød», «R» → «rod». Ukjent eller tomt gir tom streng."""
    n = nokkel(verdi)
    if not n:
        return ""
    for kode, former in LYSFORMER.items():
        if n in [nokkel(f) for f in former]:
            return kode
    return ""


def vis_lys(kode: str, sprak: str = "nb") -> str:
    for navn, k in LYS[tolk_sprak(sprak)]:
        if k == kode:
            return navn
    return ""


def tolk_farge(verdi, standard: str) -> str:
    tekst = rens(verdi)
    if re.fullmatch(r"#[0-9a-fA-F]{6}", tekst):
        return tekst.upper()
    return standard


def tolk_dato(verdi):
    """Godtar dato-celle, «2026-09-12», «12.09.2026» eller «12.9.26»."""
    if isinstance(verdi, dt.datetime):
        return verdi.date()
    if isinstance(verdi, dt.date):
        return verdi
    tekst = re.sub(r"\s+", " ", str(verdi or "")).strip()
    for form in ("%Y-%m-%d", "%d.%m.%Y", "%d.%m.%y", "%d/%m/%Y", "%d/%m/%y"):
        try:
            return dt.datetime.strptime(tekst, form).date()
        except ValueError:
            continue
    return None


def kort_dato(dato) -> str:
    if isinstance(dato, dt.datetime):
        dato = dato.date()
    if not isinstance(dato, dt.date):
        return ""
    return f"{dato.day}. {MANEDER[dato.month - 1]} {dato.year}"


def tint(hex_farge: str, andel: float) -> str:
    """Lysner en farge mot hvitt. Gir hex uten «#», slik openpyxl vil ha den."""
    h = hex_farge.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    bland = lambda v: int(round(v + (255 - v) * andel))
    return f"{bland(r):02X}{bland(g):02X}{bland(b):02X}"

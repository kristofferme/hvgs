"""Spillermodellen: hvilke felt finnes, hva heter de, og hvordan regnes de om.

Attributtene beholder de engelske FM-navna (Acceleration, Off the Ball …) fordi
det er dem alle FM-spillere kjenner. Resten av kolonnene er på norsk.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from .felles import flat, les_heltall, les_penger, les_tall

TEKNISK = [
    ("corners", "Corners", "Cor"),
    ("crossing", "Crossing", "Cro"),
    ("dribbling", "Dribbling", "Dri"),
    ("finishing", "Finishing", "Fin"),
    ("first_touch", "First Touch", "Fir"),
    ("free_kicks", "Free Kick Taking", "Fre"),
    ("heading", "Heading", "Hea"),
    ("long_shots", "Long Shots", "Lon"),
    ("long_throws", "Long Throws", "L Th"),
    ("marking", "Marking", "Mar"),
    ("passing", "Passing", "Pas"),
    ("penalties", "Penalty Taking", "Pen"),
    ("tackling", "Tackling", "Tck"),
    ("technique", "Technique", "Tec"),
]

KEEPER = [
    ("aerial_reach", "Aerial Reach", "Aer"),
    ("command_of_area", "Command of Area", "Cmd"),
    ("communication", "Communication", "Com"),
    ("eccentricity", "Eccentricity", "Ecc"),
    ("handling", "Handling", "Han"),
    ("kicking", "Kicking", "Kic"),
    ("one_on_ones", "One on Ones", "1v1"),
    ("punching", "Punching (Tendency)", "Pun"),
    ("reflexes", "Reflexes", "Ref"),
    ("rushing_out", "Rushing Out (Tendency)", "TRO"),
    ("throwing", "Throwing", "Thr"),
]

MENTAL = [
    ("aggression", "Aggression", "Agg"),
    ("anticipation", "Anticipation", "Ant"),
    ("bravery", "Bravery", "Bra"),
    ("composure", "Composure", "Cmp"),
    ("concentration", "Concentration", "Cnt"),
    ("decisions", "Decisions", "Dec"),
    ("determination", "Determination", "Det"),
    ("flair", "Flair", "Fla"),
    ("leadership", "Leadership", "Ldr"),
    ("off_the_ball", "Off the Ball", "OtB"),
    ("positioning", "Positioning", "Pos"),
    ("teamwork", "Teamwork", "Tea"),
    ("vision", "Vision", "Vis"),
    ("work_rate", "Work Rate", "Wor"),
]

FYSISK = [
    ("acceleration", "Acceleration", "Acc"),
    ("agility", "Agility", "Agi"),
    ("balance", "Balance", "Bal"),
    ("jumping_reach", "Jumping Reach", "Jum"),
    ("natural_fitness", "Natural Fitness", "Nat"),
    ("pace", "Pace", "Pac"),
    ("stamina", "Stamina", "Sta"),
    ("strength", "Strength", "Str"),
]

SKJULT = [
    ("consistency", "Consistency", "Cons"),
    ("important_matches", "Important Matches", "Imp M"),
    ("injury_proneness", "Injury Proneness", "Inj"),
    ("versatility", "Versatility", "Vers"),
    ("dirtiness", "Dirtiness", "Dirt"),
    ("pressure", "Pressure", "Prs"),
    ("professionalism", "Professionalism", "Prof"),
    ("ambition", "Ambition", "Amb"),
    ("loyalty", "Loyalty", "Loy"),
    ("sportsmanship", "Sportsmanship", "Spor"),
    ("temperament", "Temperament", "Temp"),
    ("adaptability", "Adaptability", "Adapt"),
    ("controversy", "Controversy", "Contr"),
]

ATTRIBUTTGRUPPER = [
    ("Teknisk", TEKNISK),
    ("Keeper", KEEPER),
    ("Mental", MENTAL),
    ("Fysisk", FYSISK),
    ("Skjult", SKJULT),
]

ATTRIBUTTER = [rad for _, liste in ATTRIBUTTGRUPPER for rad in liste]
ATTRIBUTTNOKLER = [n for n, _, _ in ATTRIBUTTER]
ATTRIBUTTGRUPPE_FOR = {n: g for g, liste in ATTRIBUTTGRUPPER for n, _, _ in liste}


@dataclass(frozen=True)
class Felt:
    nokkel: str
    navn: str
    gruppe: str
    type: str = "tall"          # tall | tekst | penger | liste | dato
    standard: bool = False      # med i tabellen fra start
    hjelp: str = ""


def _attributtfelt() -> list[Felt]:
    ut = []
    for gruppe, liste in ATTRIBUTTGRUPPER:
        for nokkel, navn, kort in liste:
            ut.append(Felt(nokkel, navn, gruppe, "tall", False, hjelp=kort))
    return ut


FELT: list[Felt] = [
    Felt("navn", "Navn", "Identitet", "tekst", True),
    Felt("id", "ID", "Identitet", "tekst", False),
    Felt("alder", "Alder", "Identitet", "tall", True),
    Felt("fodt", "Født", "Identitet", "dato", False),
    Felt("nasjonalitet", "Nasjonalitet", "Identitet", "tekst", True),
    Felt("nasjonalitet2", "2. nasjonalitet", "Identitet", "tekst", False),
    Felt("personlighet", "Personlighet", "Identitet", "tekst", False),
    Felt("klubb", "Klubb", "Klubb", "tekst", True),
    Felt("liga", "Liga", "Klubb", "tekst", False),
    Felt("nasjon_klubb", "Klubbland", "Klubb", "tekst", False),
    Felt("kontrakt_til", "Kontrakt til", "Klubb", "tekst", False),
    Felt("verdi", "Verdi", "Klubb", "penger", True),
    Felt("lonn", "Lønn", "Klubb", "penger", False),
    Felt("posisjoner", "Posisjoner", "Klubb", "liste", True),
    Felt("beste_posisjon", "Beste pos.", "Klubb", "tekst", False),
    Felt("ca", "CA", "Evne", "tall", True, "Current Ability, 0–200"),
    Felt("pa", "PA", "Evne", "tall", True, "Potential Ability, 0–200"),
    Felt("rom", "Rom", "Evne", "tall", True, "PA minus CA"),
    Felt("pa_anslag", "PA anslått", "Evne", "tekst", False,
         "«ja» når FM lagrer potensialet som et intervall, ikke et fast tall"),
    Felt("rykte", "Rykte", "Evne", "tall", False),
    Felt("hoyde", "Høyde", "Kropp", "tall", False),
    Felt("vekt", "Vekt", "Kropp", "tall", False),
    Felt("fot_hoyre", "Høyre fot", "Kropp", "tall", False),
    Felt("fot_venstre", "Venstre fot", "Kropp", "tall", False),
    Felt("kamper", "Kamper", "Statistikk", "tall", False),
    Felt("mal", "Mål", "Statistikk", "tall", False),
    Felt("assist", "Assist", "Statistikk", "tall", False),
    Felt("snittkarakter", "Snitt", "Statistikk", "tall", False),
    *_attributtfelt(),
    Felt("snitt_teknisk", "Snitt teknisk", "Avledet", "tall", False),
    Felt("snitt_mental", "Snitt mental", "Avledet", "tall", False),
    Felt("snitt_fysisk", "Snitt fysisk", "Avledet", "tall", False),
    Felt("snitt_keeper", "Snitt keeper", "Avledet", "tall", False),
    Felt("kilde", "Kilde", "Avledet", "tekst", False),
]

FELT_FOR = {f.nokkel: f for f in FELT}
FELTNOKLER = [f.nokkel for f in FELT]
STANDARDKOLONNER = [f.nokkel for f in FELT if f.standard]

# --- posisjoner -----------------------------------------------------------

_POSISJONSKODER = ["GK", "SW", "WB", "DM", "AM", "ST", "D", "M"]
_POSTOKEN = re.compile(r"([A-Za-z]{1,3}(?:\s*/\s*[A-Za-z]{1,3})*)\s*(?:\(([RLCrlc\s/]+)\))?")
POSISJONSREKKEFOLGE = [
    "GK", "DR", "DC", "DL", "SW", "WBR", "WBL", "DM",
    "MR", "MC", "ML", "AMR", "AMC", "AML", "ST",
]
POSISJONSGRUPPER = {
    "Keeper": ["GK"],
    "Forsvar": ["DR", "DC", "DL", "SW", "WBR", "WBL"],
    "Midtbane": ["DM", "MR", "MC", "ML", "AMC"],
    "Kant": ["AMR", "AML", "MR", "ML"],
    "Angrep": ["ST", "AMC", "AMR", "AML"],
}


def _normaliser_posisjon(kode: str, side: str) -> str:
    kode = kode.upper()
    if kode in {"GK", "SW", "DM", "ST", "S"}:
        return "ST" if kode == "S" else kode
    if not side:
        return {"D": "DC", "M": "MC", "AM": "AMC", "WB": "WBR"}.get(kode, kode)
    return f"{kode}{side.upper()}"


def les_posisjoner(tekst) -> list[str]:
    """«D (RC), DM, M/AM (C), ST (C)» → ['DR','DC','DM','MC','AMC','ST']."""
    if not tekst:
        return []
    if isinstance(tekst, (list, tuple)):
        biter = list(tekst)
    else:
        biter = [b for b in re.split(r"[,;]\s*", str(tekst)) if b.strip()]
    ut: list[str] = []
    for bit in biter:
        bit = str(bit).strip()
        if not bit:
            continue
        # Allerede ferdig skrevet, som «DR» eller «AMC» – ta det som det er.
        ferdig = bit.upper().replace(" ", "")
        if ferdig in POSISJONSREKKEFOLGE:
            if ferdig not in ut:
                ut.append(ferdig)
            continue
        m = _POSTOKEN.fullmatch(bit) or _POSTOKEN.match(bit)
        if not m:
            continue
        koder = [k.strip() for k in m.group(1).split("/") if k.strip()]
        sider = re.sub(r"[^RLCrlc]", "", m.group(2) or "").upper()
        for kode in koder:
            if kode.upper() not in _POSISJONSKODER:
                continue
            if sider:
                for s in sider:
                    if s == "C" and kode.upper() in {"GK", "SW", "DM", "ST"}:
                        p = _normaliser_posisjon(kode, "")
                    else:
                        p = _normaliser_posisjon(kode, s)
                    if p not in ut:
                        ut.append(p)
            else:
                p = _normaliser_posisjon(kode, "")
                if p not in ut:
                    ut.append(p)
    ut.sort(key=lambda p: POSISJONSREKKEFOLGE.index(p) if p in POSISJONSREKKEFOLGE else 99)
    return ut


def posisjonstekst(posisjoner: list[str]) -> str:
    return ", ".join(posisjoner)


# --- spilleren ------------------------------------------------------------


def _snitt(rad: dict, noklar) -> float | None:
    verdier = [rad.get(n) for n in noklar]
    verdier = [v for v in verdier if isinstance(v, (int, float))]
    if not verdier:
        return None
    return round(sum(verdier) / len(verdier), 1)


def fullfor(rad: dict) -> dict:
    """Fyller ut avledede felt og rydder typer. Endrer og returnerer rada."""
    for nokkel in ATTRIBUTTNOKLER + ["ca", "pa", "alder", "rykte", "hoyde", "vekt",
                                     "fot_hoyre", "fot_venstre", "kamper", "mal", "assist"]:
        v = rad.get(nokkel)
        if isinstance(v, str):
            rad[nokkel] = les_heltall(v)
    for nokkel in ("verdi", "lonn"):
        v = rad.get(nokkel)
        if isinstance(v, str):
            belop, valuta = les_penger(v)
            rad[nokkel] = belop
            if valuta and not rad.get("valuta"):
                rad["valuta"] = valuta
    if isinstance(rad.get("snittkarakter"), str):
        rad["snittkarakter"] = les_tall(rad["snittkarakter"])

    poser = rad.get("posisjonsliste")
    if not poser:
        poser = les_posisjoner(rad.get("posisjoner"))
        rad["posisjonsliste"] = poser
    rad["posisjoner"] = posisjonstekst(poser)
    if not rad.get("beste_posisjon") and poser:
        rad["beste_posisjon"] = poser[0]

    ca, pa = rad.get("ca"), rad.get("pa")
    if isinstance(ca, (int, float)) and isinstance(pa, (int, float)):
        # Negativ PA i FM betyr «ukjent, innenfor et intervall».
        rad["rom"] = int(pa - ca) if pa >= 0 else None
    rad["snitt_teknisk"] = _snitt(rad, [n for n, _, _ in TEKNISK])
    rad["snitt_mental"] = _snitt(rad, [n for n, _, _ in MENTAL])
    rad["snitt_fysisk"] = _snitt(rad, [n for n, _, _ in FYSISK])
    rad["snitt_keeper"] = _snitt(rad, [n for n, _, _ in KEEPER])
    if not rad.get("sok"):
        rad["sok"] = " ".join(
            flat(str(rad.get(n) or "")) for n in ("navn", "klubb", "nasjonalitet", "liga")
        )
    return rad


def tomme_kolonner(rader: list[dict]) -> set[str]:
    """Feltnøkler der ingen spiller har verdi – de skjules i UI-et."""
    brukt = set()
    for rad in rader:
        for nokkel, verdi in rad.items():
            if verdi is not None and verdi != "" and verdi != []:
                brukt.add(nokkel)
    return {n for n in FELTNOKLER if n not in brukt}

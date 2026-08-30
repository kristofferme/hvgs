"""Leser FM sine egne eksportfiler.

I FM: marker spillerne i en visning, høyreklikk (eller ⌘P på Mac) og velg
«Print Screen» → «Web Page (.html)» eller «Text file (.rtf)». Alle kolonnene du
har i visninga blir med. Denne modulen tar imot html, rtf og vanlig csv.

Kolonnenavna kommer fra FM på engelsk, både i fullversjon («Off the Ball») og
forkortet («OtB»). Begge deler er med i oversettelsestabellen.
"""

from __future__ import annotations

import csv
import io
import re
from html.parser import HTMLParser
from pathlib import Path

from .felles import flat, les_heltall, les_penger, les_tall
from .spillere import ATTRIBUTTER, fullfor

META = {
    "navn": ["name", "navn", "player", "player name", "spiller"],
    "id": ["uid", "unique id", "id", "person id"],
    "alder": ["age", "alder"],
    "fodt": ["date of birth", "dob", "born", "født"],
    "nasjonalitet": ["nationality", "nation", "nat", "land"],
    "nasjonalitet2": ["second nationality", "2nd nationality"],
    "klubb": ["club", "team", "klubb", "lag"],
    "liga": ["division", "league", "competition", "liga"],
    "nasjon_klubb": ["based", "country", "club country"],
    "posisjoner": ["position", "positions", "pos", "posisjon"],
    "beste_posisjon": ["best pos", "best position"],
    "kontrakt_til": ["expires", "contract expires", "contract expiry", "contract"],
    "verdi": ["value", "transfer value", "verdi"],
    "lonn": ["wage", "salary", "lønn"],
    "hoyde": ["height", "høyde"],
    "vekt": ["weight", "vekt"],
    "fot_hoyre": ["right foot"],
    "fot_venstre": ["left foot"],
    "personlighet": ["personality", "personlighet"],
    "rykte": ["reputation", "rep"],
    "ca": ["ca", "current ability", "ability"],
    "pa": ["pa", "potential ability", "potential"],
    "kamper": ["apps", "appearances", "kamper"],
    "mal": ["gls", "goals", "mål"],
    "assist": ["ast", "assists", "assist"],
    "snittkarakter": ["av rat", "average rating", "rating", "snitt"],
}

FOT = {
    "very weak": 3, "weak": 6, "reasonable": 10, "fairly strong": 13,
    "strong": 16, "very strong": 20,
    "svak": 6, "sterk": 16,
}

_OVERSATT: dict[str, str] = {}
for _nokkel, _navn, _kort in ATTRIBUTTER:
    _OVERSATT[flat(_navn)] = _nokkel
    _OVERSATT[flat(_kort)] = _nokkel
    _OVERSATT[flat(_nokkel)] = _nokkel
for _nokkel, _navn in META.items():
    for _n in _navn:
        _OVERSATT.setdefault(flat(_n), _nokkel)

# «Nat» er nasjonalitet i lagvisninga og Natural Fitness i attributtvisninga.
TVETYDIG = {"nat": ("nasjonalitet", "natural_fitness")}

_INTERVALL = re.compile(r"^\s*(\d+)\s*-\s*(\d+)\s*$")


def kolonnenokkel(overskrift: str) -> str | None:
    return _OVERSATT.get(flat(overskrift))


def _tall_eller_intervall(verdi: str):
    """«12-15» fra en speiderrapport blir midtpunktet."""
    m = _INTERVALL.match(str(verdi))
    if m:
        return int(round((int(m.group(1)) + int(m.group(2))) / 2))
    return les_heltall(verdi)


class _Tabelleser(HTMLParser):
    """Plukker ut den største tabellen i ei html-fil."""

    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.tabeller: list[list[list[str]]] = []
        self._tabell = None
        self._rad = None
        self._celle = None

    def handle_starttag(self, tag, attrs):
        if tag == "table":
            self._tabell = []
        elif tag == "tr" and self._tabell is not None:
            self._rad = []
        elif tag in ("td", "th") and self._rad is not None:
            self._celle = []

    def handle_endtag(self, tag):
        if tag in ("td", "th") and self._celle is not None:
            self._rad.append(" ".join("".join(self._celle).split()))
            self._celle = None
        elif tag == "tr" and self._rad is not None:
            if any(c for c in self._rad):
                self._tabell.append(self._rad)
            self._rad = None
        elif tag == "table" and self._tabell is not None:
            self.tabeller.append(self._tabell)
            self._tabell = None

    def handle_data(self, data):
        if self._celle is not None:
            self._celle.append(data)


def les_html(tekst: str) -> list[list[str]]:
    p = _Tabelleser()
    p.feed(tekst)
    p.close()
    if not p.tabeller:
        return []
    return max(p.tabeller, key=len)


_RTF_GRUPPE = re.compile(r"\{\\\*.*?\}", re.DOTALL)
_RTF_HEX = re.compile(r"\\'([0-9a-fA-F]{2})")
_RTF_KONTROLL = re.compile(r"\\[a-zA-Z]+-?\d* ?")


def les_rtf(tekst: str) -> list[list[str]]:
    tekst = _RTF_GRUPPE.sub("", tekst)
    tekst = _RTF_HEX.sub(lambda m: bytes([int(m.group(1), 16)]).decode("cp1252", "replace"), tekst)
    tekst = re.sub(r"\\par[d]?\b", "\n", tekst)
    tekst = re.sub(r"\\line\b", "\n", tekst)
    tekst = _RTF_KONTROLL.sub("", tekst)
    tekst = tekst.replace("{", "").replace("}", "")
    rader = []
    for linje in tekst.splitlines():
        if "|" not in linje:
            continue
        celler = [c.strip() for c in linje.strip().strip("|").split("|")]
        if not any(celler):
            continue
        if all(set(c) <= set("-+ ") for c in celler):
            continue
        rader.append(celler)
    return rader


def les_csv(tekst: str) -> list[list[str]]:
    prøve = tekst[:8192]
    try:
        dialekt = csv.Sniffer().sniff(prøve, delimiters=",;\t|")
    except csv.Error:
        dialekt = csv.excel
    return [rad for rad in csv.reader(io.StringIO(tekst), dialekt) if any(rad)]


def _velg_nokler(overskrifter: list[str], rader: list[list[str]]) -> list[str | None]:
    """Gir hver kolonne en feltnøkkel. Håndterer at «Nat» betyr to ting."""
    nokler: list[str | None] = []
    for i, overskrift in enumerate(overskrifter):
        flatt = flat(overskrift)
        if flatt in TVETYDIG:
            prøve = [rad[i] for rad in rader[:40] if i < len(rad) and rad[i].strip()]
            tallaktig = sum(1 for v in prøve if les_tall(v) is not None and len(v) <= 3)
            tekst_nokkel, tall_nokkel = TVETYDIG[flatt]
            nokler.append(tall_nokkel if prøve and tallaktig / len(prøve) > 0.8 else tekst_nokkel)
            continue
        nokler.append(kolonnenokkel(overskrift))
    return nokler


def _rad_til_spiller(nokler, celler, teller: dict) -> dict | None:
    rad: dict = {"kilde": "fm-eksport"}
    for nokkel, verdi in zip(nokler, celler):
        if not nokkel or verdi is None:
            continue
        verdi = verdi.strip()
        if not verdi or verdi in {"-", "–", "N/A"}:
            continue
        if nokkel in {"verdi", "lonn"}:
            belop, valuta = les_penger(verdi)
            if belop is not None:
                rad[nokkel] = belop
                rad.setdefault("valuta", valuta)
        elif nokkel in {"fot_hoyre", "fot_venstre"}:
            rad[nokkel] = FOT.get(flat(verdi), les_heltall(verdi))
        elif nokkel in {"navn", "klubb", "liga", "nasjonalitet", "nasjonalitet2",
                        "posisjoner", "personlighet", "kontrakt_til", "beste_posisjon",
                        "fodt", "nasjon_klubb", "id"}:
            rad[nokkel] = verdi
        elif nokkel == "snittkarakter":
            rad[nokkel] = les_tall(verdi)
        else:
            tall = _tall_eller_intervall(verdi)
            if tall is not None:
                rad[nokkel] = tall
            elif _INTERVALL.match(verdi):
                rad["anslag"] = True
    if not rad.get("navn"):
        return None
    teller["lest"] = teller.get("lest", 0) + 1
    return fullfor(rad)


def les_tabell(tabell: list[list[str]]) -> tuple[list[dict], dict]:
    if not tabell:
        return [], {"feil": "fant ingen tabell i fila"}
    # Overskriftsrada er den første der minst tre celler er kjente kolonnenavn.
    overskriftsnr = 0
    for nr, rad in enumerate(tabell[:10]):
        if sum(1 for c in rad if kolonnenokkel(c)) >= 3:
            overskriftsnr = nr
            break
    overskrifter = tabell[overskriftsnr]
    innhold = tabell[overskriftsnr + 1:]
    nokler = _velg_nokler(overskrifter, innhold)
    if "navn" not in nokler:
        return [], {
            "feil": "fant ingen navnekolonne",
            "overskrifter": overskrifter,
        }
    teller: dict = {}
    rader = []
    for celler in innhold:
        if len(celler) < len(nokler) // 2:
            continue
        spiller = _rad_til_spiller(nokler, celler, teller)
        if spiller:
            rader.append(spiller)
    ukjente = [o for o, n in zip(overskrifter, nokler) if not n]
    return rader, {
        "kolonner": len(overskrifter),
        "gjenkjent": sum(1 for n in nokler if n),
        "ukjente_kolonner": ukjente,
        "spillere": len(rader),
    }


def les_eksport(sti) -> tuple[list[dict], dict]:
    """Leser en eksportfil fra FM. Returnerer (spillere, info)."""
    sti = Path(sti).expanduser()
    rå = sti.read_bytes()
    for koding in ("utf-8", "cp1252", "latin-1"):
        try:
            tekst = rå.decode(koding)
            break
        except UnicodeDecodeError:
            continue
    else:
        tekst = rå.decode("utf-8", "replace")

    endelse = sti.suffix.lower()
    if endelse in {".html", ".htm"} or "<table" in tekst[:4000].lower():
        tabell = les_html(tekst)
        form = "html"
    elif endelse == ".rtf" or tekst.lstrip().startswith("{\\rtf"):
        tabell = les_rtf(tekst)
        form = "rtf"
    else:
        tabell = les_csv(tekst)
        form = "csv"
    rader, info = les_tabell(tabell)
    info["form"] = form
    info["fil"] = str(sti)
    return rader, info

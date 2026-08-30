"""Spillerne i minnet, med filtrering, sortering og fasetter.

Alt skjer på serversida. Nettleseren får bare den sida med rader den viser, så
en save med et par hundre tusen spillere er like lett å bla i som demofila.
"""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass, field

from .felles import flat
from .spillere import (FELT, FELT_FOR, Felt, POSISJONSREKKEFOLGE,
                       POSISJONSGRUPPER, STANDARDKOLONNER, tomme_kolonner)

# Nøkler vi bruker internt, og som ikke skal bli til kolonner i tabellen.
INTERNE = {"_nr", "sok", "posisjonsliste", "valuta", "anslag"}

FASETTFELT = ("klubb", "liga", "nasjonalitet", "personlighet", "nasjon_klubb")
OMRADEFELT = ("alder", "ca", "pa", "rom", "rykte", "verdi", "lonn", "hoyde",
              "vekt", "kamper", "mal", "assist", "snittkarakter",
              "snitt_teknisk", "snitt_mental", "snitt_fysisk", "snitt_keeper")


def _sorteringsnokkel(verdi):
    if isinstance(verdi, str):
        return flat(verdi)
    if isinstance(verdi, bool):
        return int(verdi)
    if isinstance(verdi, (int, float)):
        return float(verdi)
    if isinstance(verdi, list):
        return len(verdi)
    return 0.0


@dataclass
class Datasett:
    rader: list[dict]
    navn: str = ""
    kilde: str = ""
    merknader: list[str] = field(default_factory=list)

    def __post_init__(self):
        for nr, rad in enumerate(self.rader):
            rad["_nr"] = nr
        self.tomme = tomme_kolonner(self.rader)
        self.kolonner = [f for f in FELT if f.nokkel not in self.tomme]
        self.kolonner += self._ukjente_kolonner()
        self.felt_for = {f.nokkel: f for f in self.kolonner}
        self.ukalibrert = any(f.gruppe == "Ukjent" for f in self.kolonner)
        self._fasetter = {
            felt: Counter(r.get(felt) for r in self.rader if r.get(felt))
            for felt in FASETTFELT if felt not in self.tomme
        }
        poser = Counter()
        for rad in self.rader:
            for p in rad.get("posisjonsliste") or []:
                poser[p] += 1
        self._posisjoner = poser
        self._grenser = {}
        for felt in OMRADEFELT:
            verdier = [r[felt] for r in self.rader
                       if isinstance(r.get(felt), (int, float))]
            if verdier:
                self._grenser[felt] = [min(verdier), max(verdier)]

    def _ukjente_kolonner(self) -> list[Felt]:
        """Felt som finnes i dataene, men ikke i modellen.

        Et ukalibrert skjema gir attributt_00, attributt_01 og utover. De skal
        vises likevel – verdiene er riktige, det er bare navnet vi mangler.
        """
        sett: set[str] = set()
        for rad in self.rader:
            for nokkel, verdi in rad.items():
                if (nokkel not in FELT_FOR and nokkel not in INTERNE
                        and verdi not in (None, "", [])):
                    sett.add(nokkel)
        return [Felt(n, n.replace("_", " "), "Ukjent", "tall") for n in sorted(sett)]

    # -- det UI-et trenger å vite ----------------------------------------

    def meta(self) -> dict:
        standard = [k for k in STANDARDKOLONNER if k not in self.tomme]
        if self.ukalibrert:
            standard += [f.nokkel for f in self.kolonner if f.gruppe == "Ukjent"][:8]
        return {
            "navn": self.navn,
            "kilde": self.kilde,
            "antall": len(self.rader),
            "merknader": self.merknader,
            "ukalibrert": self.ukalibrert,
            "kolonner": [
                {"nokkel": f.nokkel, "navn": f.navn, "gruppe": f.gruppe,
                 "type": f.type, "hjelp": f.hjelp}
                for f in self.kolonner
            ],
            "standardkolonner": standard or [f.nokkel for f in self.kolonner[:8]],
            "fasetter": {
                felt: [{"verdi": v, "antall": n}
                       for v, n in sorted(teller.items(), key=lambda kv: (-kv[1], flat(str(kv[0]))))]
                for felt, teller in self._fasetter.items()
            },
            "posisjoner": [
                {"verdi": p, "antall": self._posisjoner.get(p, 0)}
                for p in POSISJONSREKKEFOLGE if self._posisjoner.get(p)
            ],
            "posisjonsgrupper": POSISJONSGRUPPER,
            "grenser": self._grenser,
        }

    # -- søk --------------------------------------------------------------

    def _passer(self, sporring: dict):
        tekst = flat(sporring.get("tekst") or "")
        ord_ = [o for o in tekst.split() if o]
        fasetter = {f: set(v) for f, v in (sporring.get("fasetter") or {}).items() if v}
        posisjoner = set(sporring.get("posisjoner") or [])
        alle_posisjoner = (sporring.get("posisjonsmodus") or "en") == "alle"
        omrader = {}
        for felt, par in (sporring.get("omrader") or {}).items():
            lav = par.get("min") if isinstance(par, dict) else par[0]
            hoy = par.get("maks") if isinstance(par, dict) else par[1]
            if lav is not None or hoy is not None:
                omrader[felt] = (lav, hoy)
        krav = [(k["nokkel"], k.get("min"), k.get("maks"))
                for k in (sporring.get("attributtkrav") or []) if k.get("nokkel")]
        bare_utfylt = sporring.get("bare_utfylt") or []

        def passer(rad: dict) -> bool:
            if ord_:
                sok = rad.get("sok") or ""
                if not all(o in sok for o in ord_):
                    return False
            for felt, tillatte in fasetter.items():
                if rad.get(felt) not in tillatte:
                    return False
            if posisjoner:
                mine = set(rad.get("posisjonsliste") or [])
                if alle_posisjoner:
                    if not posisjoner <= mine:
                        return False
                elif not (posisjoner & mine):
                    return False
            for felt, (lav, hoy) in omrader.items():
                verdi = rad.get(felt)
                if not isinstance(verdi, (int, float)):
                    return False
                if lav is not None and verdi < lav:
                    return False
                if hoy is not None and verdi > hoy:
                    return False
            for nokkel, lav, hoy in krav:
                verdi = rad.get(nokkel)
                if not isinstance(verdi, (int, float)):
                    return False
                if lav is not None and verdi < lav:
                    return False
                if hoy is not None and verdi > hoy:
                    return False
            for nokkel in bare_utfylt:
                if rad.get(nokkel) in (None, "", []):
                    return False
            return True

        return passer

    def sok(self, sporring: dict) -> dict:
        passer = self._passer(sporring)
        treff = [r for r in self.rader if passer(r)]
        sortering = sporring.get("sortering") or [{"nokkel": "ca", "retning": "ned"}]
        treff = sorter(treff, sortering)
        side = max(0, int(sporring.get("side") or 0))
        storrelse = min(500, max(10, int(sporring.get("sidestorrelse") or 100)))
        start = side * storrelse
        kolonner = [k for k in (sporring.get("kolonner") or []) if k in self.felt_for]
        if not kolonner:
            kolonner = [k for k in STANDARDKOLONNER if k not in self.tomme]
        utsnitt = treff[start:start + storrelse]
        return {
            "total": len(treff),
            "side": side,
            "sider": max(1, -(-len(treff) // storrelse)),
            "kolonner": kolonner,
            "rader": [[r["_nr"]] + [r.get(k) for k in kolonner] for r in utsnitt],
            "sammendrag": sammendrag(treff),
        }

    def treff(self, sporring: dict) -> list[dict]:
        """Alle radene som passer – til CSV-eksport."""
        passer = self._passer(sporring)
        return sorter([r for r in self.rader if passer(r)],
                      sporring.get("sortering") or [{"nokkel": "ca", "retning": "ned"}])


def sorter(rader: list[dict], sortering: list[dict]) -> list[dict]:
    """Flere sorteringsnivåer. Tomme verdier havner alltid nederst."""
    ut = list(rader)
    for spec in reversed(sortering[:3]):
        nokkel = spec.get("nokkel")
        if not nokkel:
            continue
        ned = (spec.get("retning") or "ned") == "ned"
        med = [r for r in ut if r.get(nokkel) not in (None, "", [])]
        uten = [r for r in ut if r.get(nokkel) in (None, "", [])]
        med.sort(key=lambda r: _sorteringsnokkel(r.get(nokkel)), reverse=ned)
        ut = med + uten
    return ut


def sammendrag(rader: list[dict]) -> dict:
    """Litt statistikk om treffet, som vises over tabellen."""
    if not rader:
        return {}
    ut = {}
    for felt in ("ca", "pa", "alder", "verdi", "lonn"):
        verdier = [r[felt] for r in rader if isinstance(r.get(felt), (int, float))]
        if verdier:
            ut[felt] = {
                "snitt": round(sum(verdier) / len(verdier), 1),
                "maks": max(verdier),
                "sum": sum(verdier) if felt in ("verdi", "lonn") else None,
            }
    return ut

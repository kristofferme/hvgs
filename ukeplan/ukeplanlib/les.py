"""Leser arbeidsboka og setter sammen hver uke. Det som ikke stemmer, blir en merknad."""

from __future__ import annotations

import datetime as dt
import re
from dataclasses import dataclass, field

from openpyxl import load_workbook

from .felles import (ARKNAVN, DAGER, PROFILFARGE_STANDARD, datospenn, farge_for, nokkel,
                     norsk_dato, rens, tekster, tolk_dag, tolk_dato, tolk_farge,
                     tolk_sprak, tolk_type, typeslag, uke_til_mandag, vis_dag)


@dataclass
class Resultat:
    data: dict
    merknader: list[str] = field(default_factory=list)


def _ark(wb, nokkelnavn: str):
    """Finner arket enten boka er på bokmål eller nynorsk."""
    for navn in ARKNAVN[nokkelnavn]:
        if navn in wb.sheetnames:
            return wb[navn]
    return None


def _rader(ws, antall_kolonner: int, fra_rad: int = 2):
    for nr, rad in enumerate(
        ws.iter_rows(min_row=fra_rad, max_col=antall_kolonner, values_only=True), start=fra_rad
    ):
        if any(v not in (None, "") for v in rad):
            yield nr, list(rad) + [None] * (antall_kolonner - len(rad))


def _kolonneverdier(ws, kolonne: int, fra_rad: int) -> list[str]:
    ut = []
    for (verdi,) in ws.iter_rows(min_row=fra_rad, min_col=kolonne, max_col=kolonne, values_only=True):
        t = rens(verdi)
        if t:
            ut.append(t)
    return ut


def les(sti) -> Resultat:
    wb = load_workbook(sti, data_only=True)
    merknader: list[str] = []

    for nokkelnavn, vist in (("ark_oppsett", "Oppsett"), ("ark_uke", "Uke")):
        if _ark(wb, nokkelnavn) is None:
            raise SystemExit(f"Arket «{vist}» mangler i {sti}. Lag en ny arbeidsbok med: ukeplan.py ny")

    opp = _ark(wb, "ark_oppsett")
    sprak = tolk_sprak(opp["C8"].value)
    T = tekster(sprak)
    skole = rens(opp["C4"].value) or T["skole"]
    overskrift = rens(opp["C7"].value) or T["ukeplan"]
    profilfarge = tolk_farge(opp["C9"].value, PROFILFARGE_STANDARD)
    logo = rens(opp["C10"].value)

    forste = tolk_dato(opp["C6"].value)
    uke_celle = rens(opp["C5"].value)
    if forste is None and uke_celle.isdigit():
        forste = uke_til_mandag(int(uke_celle), dt.date.today())
        merknader.append("Mandagsdatoen manglet. Datoene er regnet ut fra ukenummeret.")
    if forste is None:
        i_dag = dt.date.today()
        forste = i_dag - dt.timedelta(days=i_dag.weekday())
        merknader.append("Verken dato eller ukenummer var satt. Bruker inneværende uke.")
    forste -= dt.timedelta(days=forste.weekday())
    standarduke = int(uke_celle) if uke_celle.isdigit() else forste.isocalendar()[1]

    klasser = [k for k in _kolonneverdier(opp, 2, 14) if nokkel(k) != "alle"]
    fagnavn = _kolonneverdier(opp, 5, 13)
    egne_farger = {}
    for i, navn in enumerate(fagnavn):
        hex_ = rens(opp.cell(row=13 + i, column=6).value)
        if hex_.startswith("#") and len(hex_) == 7:
            egne_farger[navn] = hex_

    fagperklasse = _les_fagvalg(wb)
    kjente_klasser = {nokkel(k): k for k in klasser}
    kjente_fag = {nokkel(f): f for f in fagnavn}

    def fest_klasse(verdi, hvor):
        t = rens(verdi)
        if not t or nokkel(t) == "alle":
            return "Alle"
        if nokkel(t) in kjente_klasser:
            return kjente_klasser[nokkel(t)]
        kjente_klasser[nokkel(t)] = t
        klasser.append(t)
        merknader.append(f"{hvor}: klassen «{t}» sto ikke i Oppsett. Den er lagt til.")
        return t

    def fest_fag(verdi, hvor):
        t = rens(verdi)
        if not t:
            return ""
        if nokkel(t) in kjente_fag:
            return kjente_fag[nokkel(t)]
        kjente_fag[nokkel(t)] = t
        fagnavn.append(t)
        merknader.append(f"{hvor}: faget «{t}» sto ikke i Oppsett. Det er lagt til.")
        return t

    # ── Radene ──────────────────────────────────────────────────
    per_uke: dict[int, list] = {}
    for nr, rad in _rader(_ark(wb, "ark_uke"), 7):
        uke, klasse, fag, tema, tekst, frist, type_ = rad
        nummer = _tolk_uke(uke, standarduke, f"Uke rad {nr}", merknader)
        tema, oppgave = rens(tema), rens(tekst)
        if not tema and not oppgave:
            merknader.append(f"Uke rad {nr}: verken tema eller oppgave. Raden er hoppet over.")
            continue
        per_uke.setdefault(nummer, []).append({
            "klasse": fest_klasse(klasse, f"Uke rad {nr}"),
            "fag": fest_fag(fag, f"Uke rad {nr}"),
            "tema": tema,
            "tekst": oppgave,
            "frist": tolk_dag(frist),
            "type": tolk_type(type_, sprak),
        })

    beskjeder: dict[int, list] = {}
    beskjedark = _ark(wb, "ark_beskjeder")
    if beskjedark is not None:
        for nr, (uke, klasse, tittel, tekst) in _rader(beskjedark, 4):
            if not rens(tekst) and not rens(tittel):
                continue
            nummer = _tolk_uke(uke, standarduke, f"Beskjeder rad {nr}", merknader)
            beskjeder.setdefault(nummer, []).append({
                "klasse": fest_klasse(klasse, f"Beskjeder rad {nr}"),
                "tittel": rens(tittel),
                "tekst": rens(tekst),
            })

    ukenumre = sorted({standarduke} | set(per_uke) | set(beskjeder),
                      key=lambda u: uke_til_mandag(u, forste))
    uker = []
    for nummer in ukenumre:
        mandag = uke_til_mandag(nummer, forste)
        uker.append({
            "uke": nummer,
            "mandag": mandag.isoformat(),
            "datospenn": datospenn(mandag, mandag + dt.timedelta(days=4)),
            "dager": [
                {
                    "navn": vis_dag(d, sprak),
                    "dato": (mandag + dt.timedelta(days=i)).isoformat(),
                    "visning": norsk_dato(mandag + dt.timedelta(days=i)),
                }
                for i, d in enumerate(DAGER)
            ],
            "rader": [
                {**rad, "frist": vis_dag(rad["frist"], sprak)} for rad in per_uke.get(nummer, [])
            ],
            "beskjeder": beskjeder.get(nummer, []),
        })

    brukte: dict[str, str] = {}
    fag_ut = [{"navn": f, "farge": egne_farger.get(f) or farge_for(f, brukte)} for f in fagnavn]

    if not any(u["rader"] for u in uker):
        merknader.append("Ingen rader i Uke-arket ennå. Nettsiden viser bare beskjeder.")
    if not klasser:
        merknader.append("Ingen klasser funnet. Legg dem inn i Oppsett.")

    data = {
        "skole": skole,
        "overskrift": overskrift,
        "standarduke": standarduke,
        "sprak": sprak,
        "tekst": T,
        "profilfarge": profilfarge,
        "logofil": logo,
        "klasser": klasser,
        "fag": fag_ut,
        "fagperklasse": fagperklasse,
        "typar": typeslag(),
        "uker": uker,
    }
    return Resultat(data=data, merknader=merknader)


def _les_fagvalg(wb) -> dict:
    """Arket «Fag per klasse»: én kolonne per klasse, faget i den rekkefølgen skolen vil ha."""
    ark = _ark(wb, "fag_per_klasse")
    if ark is None:
        return {}
    ut = {}
    for kolonne in ark.iter_cols(min_row=1, values_only=True):
        klasse = rens(kolonne[0])
        if not klasse:
            continue
        fagene = [rens(v) for v in kolonne[1:] if rens(v)]
        if fagene:
            ut[klasse] = fagene
    return ut


def _tolk_uke(verdi, standarduke: int, hvor: str, merknader) -> int:
    """Godtar «36», 36 og merkelappen fra nedtrekket: «36 · 31. aug – 4. sep 2026»."""
    tekst = rens(verdi)
    if not tekst:
        return standarduke
    treff = re.match(r"^(\d{1,2})\b", tekst)
    if not treff:
        merknader.append(f"{hvor}: «{tekst}» er ikke et ukenummer. Raden havner i uke {standarduke}.")
        return standarduke
    nummer = int(treff.group(1))
    if not 1 <= nummer <= 53:
        merknader.append(f"{hvor}: uke {nummer} finnes ikke. Raden havner i uke {standarduke}.")
        return standarduke
    return nummer

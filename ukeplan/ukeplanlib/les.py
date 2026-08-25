"""Leser arbeidsboka og setter sammen uka. Alt som ikke stemmer, blir en merknad."""

from __future__ import annotations

import datetime as dt
from dataclasses import dataclass, field

from openpyxl import load_workbook

from .felles import (DAGER, datospenn, farge_for, mandag_i_uke, nokkel, norsk_dato,
                     rens, tolk_dag, tolk_dato, tolk_tid, tolk_type)


@dataclass
class Resultat:
    data: dict
    merknader: list[str] = field(default_factory=list)


def _rader(ws, antall_kolonner: int):
    for rad in ws.iter_rows(min_row=2, max_col=antall_kolonner, values_only=True):
        if any(v not in (None, "") for v in rad):
            yield list(rad) + [None] * (antall_kolonner - len(rad))


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

    for ark in ("Oppsett", "Timeplan", "Uke"):
        if ark not in wb.sheetnames:
            raise SystemExit(f"Arket «{ark}» mangler i {sti}. Lag en ny arbeidsbok med: ukeplan.py ny")

    opp = wb["Oppsett"]
    skole = rens(opp["C4"].value) or "Skolen"
    overskrift = rens(opp["C7"].value) or "Ukeplan"

    forste = tolk_dato(opp["C6"].value)
    uke_celle = rens(opp["C5"].value)
    if forste is None and uke_celle.isdigit():
        forste = mandag_i_uke(dt.date.today().year, int(uke_celle))
        merknader.append("Mandagsdatoen manglet. Datoene er regnet ut fra ukenummeret.")
    if forste is None:
        i_dag = dt.date.today()
        forste = i_dag - dt.timedelta(days=i_dag.weekday())
        merknader.append("Verken dato eller ukenummer var satt. Bruker inneværende uke.")
    forste = forste - dt.timedelta(days=forste.weekday())
    uke = int(uke_celle) if uke_celle.isdigit() else forste.isocalendar()[1]

    klasser = [k for k in _kolonneverdier(opp, 4, 4) if nokkel(k) != "alle"]
    fagnavn = _kolonneverdier(opp, 6, 3)
    if not klasser:
        merknader.append("Ingen klasser i Oppsett. Klassene hentes fra det som står i Timeplan.")
    if not fagnavn:
        merknader.append("Ingen fag i Oppsett. Fagene hentes fra det som står i Timeplan.")

    egne_farger = {}
    for i, navn in enumerate(fagnavn):
        hex_ = rens(opp.cell(row=3 + i, column=7).value)
        if hex_.startswith("#") and len(hex_) == 7:
            egne_farger[navn] = hex_

    dager = [
        {
            "navn": d,
            "dato": (forste + dt.timedelta(days=i)).isoformat(),
            "visning": norsk_dato(forste + dt.timedelta(days=i)),
        }
        for i, d in enumerate(DAGER)
    ]

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

    # ── Timeplan ────────────────────────────────────────────────
    timer = []
    for nr, rad in enumerate(_rader(wb["Timeplan"], 7), start=2):
        klasse, dag, start, slutt, fag, rom, laerer = rad
        d = tolk_dag(dag)
        if not d:
            merknader.append(f"Timeplan rad {nr}: «{rens(dag)}» er ikke en ukedag. Raden er hoppet over.")
            continue
        timer.append({
            "klasse": fest_klasse(klasse, f"Timeplan rad {nr}"),
            "dag": d,
            "start": tolk_tid(start),
            "slutt": tolk_tid(slutt),
            "fag": fest_fag(fag, f"Timeplan rad {nr}"),
            "rom": rens(rom),
            "laerer": rens(laerer),
            "tema": "",
            "lekse": "",
            "type": "",
        })

    # ── Uka ─────────────────────────────────────────────────────
    oppgaver = []
    for nr, rad in enumerate(_rader(wb["Uke"], 7), start=2):
        klasse, dag, fag, tema, lekse, frist, type_ = rad
        d = tolk_dag(dag)
        k = fest_klasse(klasse, f"Uke rad {nr}")
        f = fest_fag(fag, f"Uke rad {nr}")
        t_type = tolk_type(type_)
        tema, lekse = rens(tema), rens(lekse)
        if not d and not tolk_dag(frist):
            sto = rens(dag)
            merknader.append(
                f"Uke rad {nr}: «{sto}» er ikke en dag mandag–fredag. Raden er hoppet over."
                if sto else f"Uke rad {nr}: mangler dag. Raden er hoppet over."
            )
            continue

        traff = _finn_timer(timer, k, d, f)
        for treff in traff:
            treff["tema"] = " · ".join(x for x in (treff["tema"], tema) if x)
            treff["lekse"] = " · ".join(x for x in (treff["lekse"], lekse) if x)
            treff["type"] = t_type or treff["type"]
        if not traff and d:
            timer.append({
                "klasse": k, "dag": d, "start": "", "slutt": "", "fag": f or "Info",
                "rom": "", "laerer": "", "tema": tema, "lekse": lekse, "type": t_type,
            })
            if f:
                merknader.append(
                    f"Uke rad {nr}: fant ingen {f}-time {d.lower()} for {k}. "
                    "Innholdet vises som eget kort den dagen."
                )
        if lekse or t_type in ("Prøve", "Innlevering", "Frist", "Tur"):
            oppgaver.append({
                "klasse": k,
                "fag": f,
                "tekst": lekse or tema or t_type,
                "dag": d or tolk_dag(frist),
                "frist": tolk_dag(frist),
                "type": t_type,
            })

    # ── Beskjeder ───────────────────────────────────────────────
    beskjeder = []
    if "Beskjeder" in wb.sheetnames:
        for nr, rad in enumerate(_rader(wb["Beskjeder"], 3), start=2):
            klasse, tittel, tekst = rad
            if not rens(tekst) and not rens(tittel):
                continue
            beskjeder.append({
                "klasse": fest_klasse(klasse, f"Beskjeder rad {nr}"),
                "tittel": rens(tittel),
                "tekst": rens(tekst),
            })

    brukte: dict[str, str] = {}
    fag_ut = [{"navn": f, "farge": egne_farger.get(f) or farge_for(f, brukte)} for f in fagnavn]
    for t in timer:
        if t["fag"] and t["fag"] not in fagnavn:
            fag_ut.append({"navn": t["fag"], "farge": farge_for(t["fag"], brukte)})

    if not timer:
        merknader.append("Timeplanen er tom. Nettsiden viser bare beskjeder og lekser.")

    data = {
        "skole": skole,
        "overskrift": overskrift,
        "uke": uke,
        "datospenn": datospenn(forste, forste + dt.timedelta(days=4)),
        "dager": dager,
        "klasser": klasser,
        "fag": fag_ut,
        "timer": timer,
        "oppgaver": oppgaver,
        "beskjeder": beskjeder,
    }
    return Resultat(data=data, merknader=merknader)


def _finn_timer(timer, klasse, dag, fag):
    """Finner timene uketeksten hører til: samme dag og fag, i riktig klasse.

    Står det «Alle» i klassefeltet, festes innholdet til timen i hver klasse."""
    if not dag or not fag:
        return []
    kandidater = [
        t for t in timer
        if t["dag"] == dag and nokkel(t["fag"]) == nokkel(fag)
        and (nokkel(t["klasse"]) == nokkel(klasse) or nokkel(klasse) == "alle" or nokkel(t["klasse"]) == "alle")
    ]
    if not kandidater:
        return []
    if nokkel(klasse) == "alle":
        per_klasse = {}
        for t in kandidater:
            per_klasse.setdefault(nokkel(t["klasse"]), []).append(t)
        return [_ledig(gruppe) for gruppe in per_klasse.values()]
    return [_ledig(kandidater)]


def _ledig(kandidater):
    """Første time uten innhold, ellers den første – to mattetimer samme dag
    får da hver sin tekst når det står to rader i Uke."""
    ledige = [t for t in kandidater if not t["tema"] and not t["lekse"]]
    return (ledige or kandidater)[0]

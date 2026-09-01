"""Oppdiktede spillere og en oppdiktet lagringsfil.

To formål: du kan prøve tabellen og eksporten uten å ha en save for hånda, og
testene har noe å kjøre mot som har samme form som en ekte FM-fil – zlib-
blokker, en strengpool og en tabell med like store spillerrecords.
"""

from __future__ import annotations

import random
import struct
import zlib
from pathlib import Path

from . import pakking
from .spillere import ATTRIBUTTNOKLER, KEEPER, fullfor

FORNAVN = [
    "Martin", "Erling", "Alexander", "Sander", "Kristoffer", "Jonas", "Ola", "Emil",
    "Mathias", "Henrik", "Tobias", "Sivert", "Aron", "Noah", "Filip", "Lucas",
    "Andrés", "Diogo", "Matteo", "Youssef", "Kenji", "Marek", "Iker", "Bruno",
    "Kwame", "Luka", "Ivan", "Milan", "Nikola", "Sean", "Callum", "Dylan",
]
ETTERNAVN = [
    "Berg", "Hansen", "Nordli", "Solheim", "Vik", "Aune", "Fjeld", "Rønning",
    "Haugen", "Strand", "Moen", "Lien", "Dahl", "Ness", "Bakke", "Sæther",
    "Ferreira", "Silva", "Rossi", "Bianchi", "Ben Ali", "Okafor", "Novák",
    "Kovač", "Petrov", "Almeida", "Duarte", "Sørlie", "Kvam", "Ødegård",
]
KLUBBER = [
    ("Hustadvika FK", "Eliteserien", "Norge"), ("Averøy IL", "Eliteserien", "Norge"),
    ("Bud BK", "Eliteserien", "Norge"), ("Elnesvågen SK", "OBOS-ligaen", "Norge"),
    ("Fræna FK", "OBOS-ligaen", "Norge"), ("Molde-Nord", "Eliteserien", "Norge"),
    ("Northport City", "Premier Division", "England"), ("Ashcombe United", "Premier Division", "England"),
    ("Real Valcorta", "Primera", "Spania"), ("Atlético Ribeira", "Primera", "Spania"),
    ("SV Hohenbach", "Bundesliga", "Tyskland"), ("FC Steinthal", "Bundesliga", "Tyskland"),
    ("Olympique Vaubry", "Ligue 1", "Frankrike"), ("US Castelmare", "Serie A", "Italia"),
]
NASJONER = ["Norge", "Sverige", "Danmark", "England", "Spania", "Frankrike", "Brasil",
            "Argentina", "Nigeria", "Japan", "Kroatia", "Portugal", "Tyskland", "Italia"]
POSISJONSVALG = [
    "GK", "D (C)", "D (RC)", "D (L)", "D/WB (R)", "D/WB (L)", "DM", "DM, M (C)",
    "M (C)", "M/AM (C)", "M (RL)", "AM (RL)", "AM (RLC)", "AM (C), ST (C)", "ST (C)",
]
PERSONLIGHET = ["Profesjonell", "Ambisiøs", "Målrettet", "Balansert", "Lettpåvirkelig",
                "Lojal", "Temperamentsfull", "Modellprofesjonell"]

KEEPERNOKLER = [n for n, _, _ in KEEPER]


def _attributt(base: int, r: random.Random) -> int:
    return max(1, min(20, int(r.gauss(base, 2.6))))


def lag_demospillere(antall: int = 900, fro: int = 26) -> list[dict]:
    r = random.Random(fro)
    rader = []
    for i in range(antall):
        klubb, liga, klubbland = r.choice(KLUBBER)
        posisjon = r.choice(POSISJONSVALG)
        keeper = posisjon == "GK"
        alder = r.choices(range(15, 39), weights=[2, 3, 5, 7, 9, 10, 10, 10, 9, 8, 8, 7,
                                                  7, 6, 6, 5, 4, 4, 3, 2, 2, 1, 1, 1])[0]
        ca = max(20, min(200, int(r.gauss(115, 32))))
        potensial = ca + max(0, int(r.gauss(38 - (alder - 17) * 2.2, 16)))
        pa = max(ca, min(200, potensial))
        nivå = 4 + (ca / 200) * 13
        rad = {
            "id": 1_000_000 + i,
            "navn": f"{r.choice(FORNAVN)} {r.choice(ETTERNAVN)}",
            "alder": alder,
            "nasjonalitet": r.choice(NASJONER),
            "klubb": klubb,
            "liga": liga,
            "nasjon_klubb": klubbland,
            "posisjoner": posisjon,
            "ca": ca,
            "pa": pa,
            "rykte": max(1, min(200, int(r.gauss(ca * 0.8, 20)))),
            "verdi": round(max(0, r.gauss(ca ** 2.6 / 9000, ca * 900)), -4),
            "lonn": round(max(500, r.gauss(ca * 95, ca * 30)), -2),
            "valuta": "€",
            "kontrakt_til": f"30.06.{2026 + r.randint(0, 5)}",
            "hoyde": int(r.gauss(186 if keeper else 181, 6)),
            "vekt": int(r.gauss(80, 7)),
            "fot_hoyre": r.choice([20, 20, 20, 15, 8]),
            "fot_venstre": r.choice([20, 12, 8, 5, 5]),
            "personlighet": r.choice(PERSONLIGHET),
            "kamper": r.randint(0, 340),
            "mal": r.randint(0, 90),
            "assist": r.randint(0, 70),
            "snittkarakter": round(r.uniform(5.9, 7.6), 2),
            "kilde": "demo",
        }
        for nokkel in ATTRIBUTTNOKLER:
            erkeeper = nokkel in KEEPERNOKLER
            if erkeeper and not keeper:
                rad[nokkel] = r.randint(1, 5)
            elif keeper and nokkel in {"finishing", "dribbling", "crossing", "corners"}:
                rad[nokkel] = r.randint(1, 6)
            else:
                rad[nokkel] = _attributt(nivå, r)
        rader.append(fullfor(rad))
    return rader


# --- oppdiktet .fm-fil ----------------------------------------------------

STRIDE = 160
ATTRIBUTTSTART = 48
DEMOATTRIBUTTER = ATTRIBUTTNOKLER[:56]


def lag_demosave(sti, antall: int = 900, fro: int = 26,
                 metode: str = "zlib") -> tuple[Path, dict]:
    """Skriver en fil med samme form som en FM-save: header + zlib-blokker.

    Returnerer stien og skjemaet fila er skrevet med – testene bruker skjemaet
    som fasit, og «demo»-kommandoen lagrer det ved siden av fila.

    Med metode «zstd» lages en fil som ligner på FM26 sine: en kort header og
    så tusenvis av små zstd-rammer som til sammen utgjør én lang strøm. Da
    krysser spillertabellen rammegrensene, akkurat som i en ekte save.
    """
    sti = Path(sti)
    rader = lag_demospillere(antall, fro)
    r = random.Random(fro + 1)

    pool = bytearray()
    plass: dict[str, int] = {}
    rekkefolge: list[str] = []

    def legg(tekst: str) -> int:
        if tekst not in plass:
            rå = tekst.encode("utf-8")
            plass[tekst] = len(pool)
            rekkefolge.append(tekst)
            pool.extend(struct.pack("<I", len(rå)))
            pool.extend(rå)
        return plass[tekst]

    lister = {
        "klubber": sorted({rad["klubb"] for rad in rader}),
        "nasjoner": sorted({rad["nasjonalitet"] for rad in rader}),
        "posisjoner": sorted({rad["posisjoner"] for rad in rader}),
    }
    oppslag, basis = {}, {}
    for navn, verdier in lister.items():
        basis[navn] = len(rekkefolge)
        oppslag[navn] = {v: i for i, v in enumerate(verdier)}
        for v in verdier:
            legg(v)
    for rad in rader:
        legg(rad["navn"])

    tabell = bytearray()
    for rad in rader:
        rec = bytearray(r.randbytes(STRIDE))
        # Sørg for at fyllet ikke lager falske attributtstriper.
        for i in range(STRIDE):
            if rec[i] <= 20:
                rec[i] = 21 + (rec[i] % 200)
        struct.pack_into("<I", rec, 0, rad["id"])
        struct.pack_into("<I", rec, 4, plass[rad["navn"]])
        rec[8] = rad["ca"]
        rec[9] = rad["pa"] if r.random() > 0.08 else (256 - r.randint(1, 10))
        rec[10] = rad["alder"]
        rec[11] = rad["rykte"]
        rec[12] = max(0, min(255, rad["hoyde"] - 120))
        rec[13] = max(0, min(255, rad["vekt"] - 40))
        struct.pack_into("<H", rec, 14, oppslag["klubber"][rad["klubb"]])
        struct.pack_into("<H", rec, 16, oppslag["posisjoner"][rad["posisjoner"]])
        struct.pack_into("<H", rec, 18, oppslag["nasjoner"][rad["nasjonalitet"]])
        for i, nokkel in enumerate(DEMOATTRIBUTTER):
            rec[ATTRIBUTTSTART + i] = max(1, min(20, int(rad.get(nokkel) or 1)))
        tabell.extend(rec)

    if metode == "zstd":
        return _skriv_zstd(sti, pool, tabell, rader, basis, r)

    hode = bytearray(b"FMDEMO\x00\x00")
    hode.extend(struct.pack("<II", len(rader), STRIDE))
    hode.extend(r.randbytes(48))

    blokker = [
        bytes(r.randbytes(4096)),          # støy, som i en ekte save
        bytes(pool),
        bytes(tabell),
        bytes(r.randbytes(2048)),
    ]
    with sti.open("wb") as f:
        f.write(bytes(hode))
        for blokk in blokker:
            f.write(zlib.compress(blokk, 6))
            f.write(r.randbytes(r.randint(8, 40)))   # padding mellom blokkene

    profil = {
        "navn": "demo",
        "kilde": "demofil",
        "blokk": 2,
        "strengblokk": 1,
        "start": 0,
        "stride": STRIDE,
        "antall": len(rader),
        "merknad": "Skjema for den oppdiktede demofila.",
        "felt": {
            "id": {"offset": 0, "type": "u32"},
            "navn": {"offset": 4, "type": "peker"},
            "ca": {"offset": 8, "type": "u8"},
            "pa": {"offset": 9, "type": "u8"},
            "alder": {"offset": 10, "type": "u8"},
            "rykte": {"offset": 11, "type": "u8"},
            "hoyde": {"offset": 12, "type": "u8", "pluss": 120},
            "vekt": {"offset": 13, "type": "u8", "pluss": 40},
            "klubb": {"offset": 14, "type": "indeks16", "startindeks": basis["klubber"]},
            "posisjoner": {"offset": 16, "type": "indeks16", "startindeks": basis["posisjoner"]},
            "nasjonalitet": {"offset": 18, "type": "indeks16", "startindeks": basis["nasjoner"]},
        },
        "attributter": {n: ATTRIBUTTSTART + i for i, n in enumerate(DEMOATTRIBUTTER)},
    }
    return sti, profil


RAMME = 32 << 10           # så store biter FM26 ser ut til å hakke strømmen i


def _skriv_zstd(sti: Path, pool: bytearray, tabell: bytearray, rader: list[dict],
                basis: dict, r: random.Random) -> tuple[Path, dict]:
    """Skriver en fil på FM26-form: kort header, så mange små zstd-rammer."""
    motor = pakking.motor()
    if motor is None:
        raise pakking.IngenZstd("kan ikke lage en zstd-demofil uten en zstd-motor")

    strom = bytes(pool) + bytes(tabell) + bytes(r.randbytes(4096))
    hode = bytearray(b"\x02\x01fmf.")
    hode.extend(struct.pack("<I", len(strom)))
    hode.extend(bytes(18))

    with sti.open("wb") as f:
        f.write(bytes(hode))
        for i in range(0, len(strom), RAMME):
            f.write(motor.komprimer(strom[i:i + RAMME]))

    profil = {
        "navn": "demo-zstd",
        "kilde": "demofil",
        "blokk": 0,
        "strengblokk": 0,
        "start": len(pool),
        "stride": STRIDE,
        "antall": len(rader),
        "merknad": "Skjema for den oppdiktede demofila i FM26-form.",
        "felt": {
            "id": {"offset": 0, "type": "u32"},
            "navn": {"offset": 4, "type": "peker"},
            "ca": {"offset": 8, "type": "u8"},
            "pa": {"offset": 9, "type": "u8"},
            "alder": {"offset": 10, "type": "u8"},
            "rykte": {"offset": 11, "type": "u8"},
            "hoyde": {"offset": 12, "type": "u8", "pluss": 120},
            "vekt": {"offset": 13, "type": "u8", "pluss": 40},
            "klubb": {"offset": 14, "type": "indeks16", "startindeks": basis["klubber"]},
            "posisjoner": {"offset": 16, "type": "indeks16", "startindeks": basis["posisjoner"]},
            "nasjonalitet": {"offset": 18, "type": "indeks16", "startindeks": basis["nasjoner"]},
        },
        "attributter": {n: ATTRIBUTTSTART + i for i, n in enumerate(DEMOATTRIBUTTER)},
    }
    return sti, profil

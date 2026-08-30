"""Feilrapport: hva ligger egentlig i denne fila?

Når verktøyet ikke finner spillerne, er det ikke stort å bli klok av at det
ikke gjorde det. Denne modulen skriver ut det den faktisk ser – blokker,
komprimering, tekst, tallmønstre – slik at det går an å se hvor det stopper:
er fila pakket ut i det hele tatt, ligger dataene der men i en annen form, er
det bare tabellsøket som bommer?
"""

from __future__ import annotations

import math
from datetime import datetime
from pathlib import Path

from .beholder import Beholder
from .felles import si, storrelse, tallformat
from .tabeller import OMRADER, dominerende_stride, finn_striper
from .tekst import stikkprove

PROVE = 2 << 20            # så mye av hver blokk vi ser på
STRIPEPROVE = 64 << 20

# Kjenningsmerkene til de vanlige pakkemetodene. Finner vi ingen zlib-strømmer,
# er det neste spørsmålet hva saven er pakket med i stedet – og da er det greit
# å slippe å gjette.
PAKKEMETODER = [
    ("zlib", b"\x78\x9c"),
    ("zlib (best)", b"\x78\xda"),
    ("zlib (rask)", b"\x78\x01"),
    ("gzip", b"\x1f\x8b\x08"),
    ("zstd", b"\x28\xb5\x2f\xfd"),
    ("lz4 (frame)", b"\x04\x22\x4d\x18"),
    ("lz4 (skippable)", b"\x04\x22\x4d\x18"),
    ("xz", b"\xfd7zXZ\x00"),
    ("bzip2", b"BZh9"),
    ("zip", b"PK\x03\x04"),
    ("brotli-ish", b"\xce\xb2\xcf\x81"),
]


def _pakkemetoder(sti: Path, tak: int = 256 << 20) -> list[tuple[str, int, float]]:
    """Teller kjenningsmerker i rå fil, og hva som er ventet ved tilfeldighet.

    Et merke på to bytes dukker opp av seg selv omtrent hver 65 536. byte, så
    et par tusen treff i en stor fil betyr ingenting. Et merke på fire bytes
    som dukker opp i det hele tatt, betyr som regel noe. Derfor står det
    forventede tallet ved siden av – det er forholdet mellom dem som teller.
    """
    rå = sti.open("rb").read(tak)
    n = len(rå)
    ut = []
    sett = set()
    for navn, merke in PAKKEMETODER:
        if merke in sett:
            continue
        sett.add(merke)
        antall, pos = 0, 0
        while antall <= 200_000:
            i = rå.find(merke, pos)
            if i < 0:
                break
            antall += 1
            pos = i + 1
        ventet = n / (256 ** len(merke))
        if antall:
            ut.append((navn, antall, ventet))
    ut.sort(key=lambda p: p[1] / max(p[2], 0.01), reverse=True)
    return ut


def _histogram(data) -> tuple[list[int], int]:
    # bytes.count går i C. Å telle 256 ganger over prøven er mye raskere enn
    # å gå gjennom den én byte om gangen i Python, og på en ekte save er det
    # forskjell på sekunder og minutter.
    bit = bytes(data[:PROVE])
    return [bit.count(b) for b in range(256)], len(bit)


def _entropi(hist: list[int], n: int) -> float:
    """Bits per byte. Rundt 8 betyr komprimert eller kryptert, under 7 betyr
    at det er struktur i dataene."""
    if not n:
        return 0.0
    ut = 0.0
    for antall in hist:
        if antall:
            p = antall / n
            ut -= p * math.log2(p)
    return ut


def _andel(hist: list[int], n: int, lav: int, hoy: int) -> float:
    if not n:
        return 0.0
    return sum(hist[lav:hoy + 1]) / n


def _linje(rapport: list[str], tekst: str = "") -> None:
    rapport.append(tekst)


def lag_rapport(sti, *, melding=si) -> str:
    sti = Path(sti).expanduser()
    r: list[str] = []
    _linje(r, "FMSCOUT – RAPPORT")
    _linje(r, f"Laget {datetime.now():%Y-%m-%d %H:%M}")
    _linje(r)
    _linje(r, f"Fil        {sti}")
    if not sti.exists():
        _linje(r, "Fila finnes ikke.")
        return "\n".join(r)
    _linje(r, f"Størrelse  {storrelse(sti.stat().st_size)} "
              f"({tallformat(sti.stat().st_size)} bytes)")

    hode = sti.open("rb").read(64)
    _linje(r, f"Header     {hode[:32].hex(' ')}")
    lesbar = "".join(chr(b) if 32 <= b < 127 else "." for b in hode[:32])
    _linje(r, f"           {lesbar}")
    _linje(r)

    _linje(r, "PAKKEMETODER SOM FINNES I FILA")
    _linje(r, "  Kjenningsmerker talt opp i de første 256 MB. «Tilfeldig» er hvor")
    _linje(r, "  mange treff man får av seg selv i like mye tilfeldige data – det")
    _linje(r, "  som betyr noe, er treff som ligger langt over det tallet.")
    _linje(r, "")
    _linje(r, "  metode           funnet   tilfeldig   forhold")
    for navn, antall, ventet in _pakkemetoder(sti):
        forhold = antall / max(ventet, 0.01)
        merke = "  ←" if forhold > 20 else ""
        _linje(r, f"  {navn:<15} {tallformat(antall):>7} {ventet:>11.1f} "
                  f"{forhold:>9.1f}{merke}")
    _linje(r)

    melding("Pakker ut fila …")
    beholder = Beholder.apne(sti, melding=melding)
    rå_fil = len(beholder) == 1 and beholder.blokker[0].komprimert >= sti.stat().st_size
    _linje(r, "UTPAKKING")
    if rå_fil:
        _linje(r, "  Fant ingen zlib-strømmer. Fila er lest som den er.")
        _linje(r, "  Det betyr som regel at saven er pakket med noe annet enn")
        _linje(r, "  zlib (for eksempel lz4 eller zstd), eller at den er kryptert.")
    else:
        _linje(r, f"  {len(beholder)} zlib-blokker, {storrelse(beholder.utpakket)} utpakket")
    _linje(r)

    blokker = sorted(beholder.blokker, key=lambda b: b.storrelse, reverse=True)[:12]
    _linje(r, "BLOKKER (de største)")
    _linje(r, "  nr        utpakket   forhold  entropi  andel 1-20  tekstbiter")
    detaljer: list[tuple] = []
    for blokk in blokker:
        data = beholder.data(blokk.nr)
        hist, n = _histogram(data)
        entropi = _entropi(hist, n)
        andel = _andel(hist, n, 1, 20)
        tekst = stikkprove(bytes(data[:PROVE]), 6)
        detaljer.append((blokk, entropi, andel, tekst))
        _linje(r, f"  {blokk.nr:<5d} {storrelse(blokk.storrelse):>11}  "
                  f"{blokk.forhold:6.1f}x  {entropi:6.2f}   {andel:8.1%}   {len(tekst):>5}")
    _linje(r)

    _linje(r, "TEKST I BLOKKENE")
    fant_tekst = False
    for blokk, _, _, tekst in detaljer:
        if tekst:
            fant_tekst = True
            _linje(r, f"  blokk {blokk.nr}: " + " · ".join(t[:28] for t in tekst[:6]))
    if not fant_tekst:
        _linje(r, "  Ingen lesbar tekst noe sted. Da er innholdet ikke pakket ut.")
    _linje(r)

    _linje(r, "TALLMØNSTRE (leter etter attributter som ligger etter hverandre)")
    _linje(r, "  Én spiller har mange attributter på rad, alle små tall. En slik")
    _linje(r, "  stripe er lett å kjenne igjen, og avstanden mellom to striper er")
    _linje(r, "  lengden på én spillerrecord.")
    _linje(r)
    noe_funnet = False
    beste_stride = None          # (blokk, stride, antall par)
    for blokk, _, _, _ in detaljer[:8]:
        rå = bytes(beholder.data(blokk.nr)[:STRIPEPROVE])
        for lav, hoy, minlengde in OMRADER:
            striper = finn_striper(rå, (lav, hoy), minlengde)
            if not striper:
                continue
            lengder = sorted({l for _, l in striper}, reverse=True)[:4]
            stride, par = dominerende_stride([o for o, _ in striper])
            noe_funnet = True
            _linje(r, f"  blokk {blokk.nr}, verdier {lav}-{hoy}, minst {minlengde} på rad:")
            _linje(r, f"    {tallformat(len(striper))} striper, lengder {lengder}")
            if stride:
                _linje(r, f"    vanligste avstand {stride} bytes, {tallformat(par)} ganger")
                if beste_stride is None or par > beste_stride[2]:
                    beste_stride = (blokk.nr, stride, par)
            else:
                _linje(r, "    ingen fast avstand mellom dem")
    if not noe_funnet:
        _linje(r, "  Ingen striper i det hele tatt.")
    _linje(r)

    _linje(r, "HVA DETTE PEKER MOT")
    for tekst in _tolkning(rå_fil, fant_tekst, detaljer, noe_funnet, beste_stride):
        _linje(r, f"  {tekst}")
    _linje(r)
    _linje(r, "Send denne rapporten videre, så er det mulig å gjøre noe med det.")
    beholder.lukk()
    return "\n".join(r)


def _tolkning(rå_fil: bool, fant_tekst: bool, detaljer, noe_funnet: bool,
              beste_stride) -> list[str]:
    ut = []
    hoy_entropi = all(e > 7.9 for _, e, _, _ in detaljer) if detaljer else False
    if rå_fil and hoy_entropi:
        ut.append("Innholdet ser fortsatt komprimert eller kryptert ut, og det ble")
        ut.append("ikke funnet zlib-strømmer. FM26 bruker altså en annen pakkemetode.")
        ut.append("Verktøyet må lære seg den før det kan lese denne saven.")
    elif rå_fil:
        ut.append("Ingen zlib-strømmer, men innholdet ser strukturert ut. Fila kan")
        ut.append("være ukomprimert i et format verktøyet ikke kjenner igjen ennå.")
    elif not fant_tekst:
        ut.append("Blokkene ble pakket ut, men inneholder ingen lesbar tekst. Da er")
        ut.append("det trolig feil blokker som er funnet – eller ett lag til med")
        ut.append("pakking inni dem.")
    elif not noe_funnet:
        ut.append("Utpakkinga virker – det står lesbar tekst i fila – men attributtene")
        ut.append("ligger ikke som en sammenhengende stripe med små tall. FM26 lagrer")
        ut.append("dem antakelig i en annen form enn de tidligere versjonene.")
    elif beste_stride and beste_stride[2] >= 50:
        blokk, stride, par = beste_stride
        ut.append(f"Dette ser ut som en spillertabell: blokk {blokk}, records på")
        ut.append(f"{stride} bytes, {tallformat(par + 1)} av dem etter hverandre.")
        ut.append("Kommer du likevel ikke videre, er det tabellsøket som er for")
        ut.append("strengt, ikke fila.")
    else:
        ut.append("Det finnes tallstriper, men de ligger ikke med fast avstand. Enten")
        ut.append("er ikke spillerrecordene like lange, eller så er det andre data enn")
        ut.append("attributter som er funnet.")
    return ut


def skriv_rapport(sti, ut=None, *, melding=si) -> Path:
    """Skriver rapporten til fil. Uten mål havner den på skrivebordet."""
    tekst = lag_rapport(sti, melding=melding)
    if ut is None:
        skrivebord = Path.home() / "Desktop"
        mappe = skrivebord if skrivebord.is_dir() else Path.home()
        ut = mappe / "fmscout-rapport.txt"
    ut = Path(ut).expanduser()
    ut.write_text(tekst, encoding="utf-8")
    return ut

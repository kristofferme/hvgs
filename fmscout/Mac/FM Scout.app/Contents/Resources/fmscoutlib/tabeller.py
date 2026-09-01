"""Finner spillertabellen i en utpakket save.

Trikset: FM lagrer attributtene til en spiller etter hverandre, og hver av dem
er et lite tall. En stripe på 16 eller flere bytes på rad som alle ligger
mellom 1 og 20 skjer nesten aldri i tilfeldige data – men den skjer én gang per
spiller. Finner vi stripene, finner vi tabellen, og avstanden mellom to striper
er lengden på én spillerrecord.
"""

from __future__ import annotations

import re
from collections import Counter
from dataclasses import dataclass, field

# 0..20 er standardintervallet for FM-attributter, men vi vet ikke sikkert
# hvordan FM26 lagrer dem, så vi prøver flere oppløsninger. Jo videre
# intervallet er, jo oftere treffer det tilfeldige data – derfor krever de
# videre intervallene en lengre stripe før den teller. Tallene er valgt slik at
# sjansen for et falskt treff holder seg lav: (200/256)^40 er rundt 1 av 100
# millioner, mens (20/256)^16 er astronomisk lite.
OMRADER = ((1, 20, 16), (1, 100, 24), (1, 200, 40))
MIN_STRIPE = 16


def _maske(omrade: tuple[int, int]) -> bytes:
    lav, høy = omrade
    return bytes(b"A"[0] if lav <= i <= høy else b"."[0] for i in range(256))


def finn_striper(data, omrade=(1, 20), minlengde: int = MIN_STRIPE,
                 maks_treff: int = 400_000) -> list[tuple[int, int]]:
    """Alle sammenhengende striper av bytes i intervallet. (offset, lengde)."""
    maske = data.translate(_maske(omrade)) if isinstance(data, bytes) else \
        bytes(data[:]).translate(_maske(omrade))
    mønster = re.compile(rb"A{%d,}" % minlengde)
    ut = []
    for m in mønster.finditer(maske):
        ut.append((m.start(), m.end() - m.start()))
        if len(ut) >= maks_treff:
            break
    return ut


def dominerende_stride(offsets: list[int], min_stride: int = 32,
                       maks_stride: int = 8192) -> tuple[int, int]:
    """Vanligste avstand mellom nabooffset, og hvor mange par som har den."""
    if len(offsets) < 3:
        return 0, 0
    teller = Counter()
    forrige = offsets[0]
    for o in offsets[1:]:
        d = o - forrige
        forrige = o
        if min_stride <= d <= maks_stride:
            teller[d] += 1
    if not teller:
        return 0, 0
    stride, antall = teller.most_common(1)[0]
    return stride, antall


@dataclass
class Tabell:
    """En rekke like store records som ligger etter hverandre."""

    blokk: int
    start: int
    stride: int
    antall: int
    stripeoffset: int          # attributtstripa sin plass inni recorden
    stripelengde: int
    omrade: tuple[int, int]
    treff: list[int] = field(default_factory=list)

    @property
    def slutt(self) -> int:
        return self.start + self.stride * self.antall

    def record(self, data, nr: int) -> memoryview:
        p = self.start + nr * self.stride
        return memoryview(data)[p:p + self.stride]

    def som_dict(self) -> dict:
        return {
            "blokk": self.blokk, "start": self.start, "stride": self.stride,
            "antall": self.antall, "stripeoffset": self.stripeoffset,
            "stripelengde": self.stripelengde, "omrade": list(self.omrade),
        }


def _tabell_fra_striper(blokk: int, striper: list[tuple[int, int]],
                        omrade: tuple[int, int], min_antall: int) -> Tabell | None:
    offsets = [o for o, _ in striper]
    stride, par = dominerende_stride(offsets)
    if not stride or par < min_antall:
        return None
    # Den lengste sammenhengende rekka med akkurat denne avstanden.
    beste_start = beste_lengde = 0
    i = 0
    while i < len(offsets) - 1:
        j = i
        while j < len(offsets) - 1 and offsets[j + 1] - offsets[j] == stride:
            j += 1
        if j - i + 1 > beste_lengde:
            beste_lengde = j - i + 1
            beste_start = i
        i = max(j, i + 1)
    if beste_lengde < min_antall:
        return None
    første = offsets[beste_start]
    lengder = Counter(l for o, l in striper[beste_start:beste_start + beste_lengde])
    stripelengde = lengder.most_common(1)[0][0]
    # Recorden begynner et sted før stripa. Nøyaktig hvor, sier ikke fila noe
    # om – men rammen vi legger på må i det minste ha plass til hele stripa,
    # ellers leser vi ut over kanten av recorden.
    stripeoffset = min(første % stride, max(0, stride - stripelengde))
    start = første - stripeoffset
    return Tabell(blokk, start, stride, beste_lengde, stripeoffset, stripelengde,
                  omrade, offsets[beste_start:beste_start + beste_lengde])


def finn_tabeller(beholder, *, min_antall: int = 50, melding=None) -> list[Tabell]:
    """Leter gjennom alle blokkene etter tabeller som ser ut som spillere."""
    funn: list[Tabell] = []
    for blokk, data in beholder:
        rå = bytes(data)
        for lav, høy, minlengde in OMRADER:
            striper = finn_striper(rå, (lav, høy), minlengde)
            if len(striper) < min_antall:
                continue
            tabell = _tabell_fra_striper(blokk.nr, striper, (lav, høy), min_antall)
            if tabell:
                funn.append(tabell)
                if melding:
                    melding(
                        f"  blokk {blokk.nr}: {tabell.antall} records à {tabell.stride} B "
                        f"(attributter {lav}–{høy})"
                    )
                break
    funn.sort(key=lambda t: t.antall, reverse=True)
    return funn


# --- CA/PA-jakt -----------------------------------------------------------


def _rangering(verdier: list[float]) -> list[float]:
    par = sorted(range(len(verdier)), key=lambda i: verdier[i])
    rang = [0.0] * len(verdier)
    for plass, i in enumerate(par):
        rang[i] = float(plass)
    return rang


def korrelasjon(a: list[float], b: list[float]) -> float:
    """Spearman – rangkorrelasjon, uten avhengigheter."""
    n = len(a)
    if n < 8 or n != len(b):
        return 0.0
    ra, rb = _rangering(a), _rangering(b)
    ma, mb = sum(ra) / n, sum(rb) / n
    teller = sum((x - ma) * (y - mb) for x, y in zip(ra, rb))
    na = sum((x - ma) ** 2 for x in ra) ** 0.5
    nb = sum((y - mb) ** 2 for y in rb) ** 0.5
    return teller / (na * nb) if na and nb else 0.0


@dataclass
class EvneKandidat:
    offset: int
    slag: str                  # "ca" eller "pa"
    poeng: float
    korrelasjon: float
    andel_negative: float
    snitt: float
    beskrivelse: str


def finn_evnekandidater(data, tabell: Tabell, *, utvalg: int = 800,
                        maks: int = 8) -> list[EvneKandidat]:
    """Gjetter hvilke bytes i recorden som er Current og Potential Ability.

    To kjennetegn skiller dem fra alt annet i recorden:

    * CA henger tett sammen med hvor gode attributtene er. Rangkorrelasjonen
      mot attributtsummen er høy for CA, lav for alt annet.
    * PA lagres i FM som et negativt tall (-1 til -10) når potensialet er satt
      som et intervall i stedet for et fast tall. En byte der noen få prosent
      av verdiene ligger på 246–255 og resten under 200, er nesten alltid PA.
    """
    n = min(tabell.antall, utvalg)
    if n < 16:
        return []
    steg = max(1, tabell.antall // n)
    records = [tabell.record(data, i * steg) for i in range(n)]
    records = [r for r in records if len(r) == tabell.stride]
    if len(records) < 16:
        return []

    attsum = []
    a0, a1 = tabell.stripeoffset, tabell.stripeoffset + tabell.stripelengde
    for r in records:
        attsum.append(float(sum(r[a0:a1])))

    kandidater: list[EvneKandidat] = []
    for off in range(tabell.stride):
        if a0 <= off < a1:
            continue
        verdier = [float(r[off]) for r in records]
        unike = len(set(verdier))
        if unike < 8:
            continue
        negative = sum(1 for v in verdier if 246 <= v <= 255) / len(verdier)
        rimelige = sum(1 for v in verdier if v <= 200 or 246 <= v <= 255) / len(verdier)
        if rimelige < 0.98:
            continue
        snitt = sum(verdier) / len(verdier)
        if not 20 <= snitt <= 200:
            continue
        k = korrelasjon(verdier, attsum)
        poeng = abs(k)
        slag = "ca"
        merknad = f"rangkorrelasjon {k:+.2f} mot attributtsummen"
        if 0.001 < negative < 0.35:
            poeng += 0.5
            slag = "pa"
            merknad += f", {negative:.1%} negative verdier (typisk PA-intervall)"
        if poeng < 0.35:
            continue
        kandidater.append(EvneKandidat(off, slag, poeng, k, negative, snitt, merknad))

    kandidater.sort(key=lambda k: k.poeng, reverse=True)
    return kandidater[:maks]

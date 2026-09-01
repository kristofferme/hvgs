"""Finner ut hvordan en spillerrecord i akkurat din save er satt sammen.

FM lagrer ikke feltnavn i fila, og Sports Interactive flytter på ting mellom
versjoner. Så i stedet for å gjette offset ut fra en tabell som var riktig i
fjor, leter vi dem opp i fila du faktisk har:

1. Attributtstripene gir tabellen og lengden på én record.
2. Strengpoolen gir navnefeltet: den bytene i recorden som peker på et navn.
3. CA og PA kjennes igjen på oppførselen sin, ikke på plasseringen.
4. Ankere – spillere du selv slår opp i FM og skriver inn verdiene til – gir
   navn på de enkelte attributtene og fasit på at resten stemmer.

Resultatet er et skjema (JSON) som «åpne» og «eksporter» leser saven med.
"""

from __future__ import annotations

import struct
from collections import Counter
from dataclasses import dataclass

from .felles import flat, si
from .nasjoner import andel_landnavn
from .profil import Profil, Strengpool
from .spillere import ATTRIBUTTER, ATTRIBUTTNOKLER, les_posisjoner
from .tabeller import Tabell, finn_evnekandidater, finn_tabeller

UTVALG = 600
PROVE = 4 << 20

KORTNAVN = {}
for _nokkel, _navn, _kort in ATTRIBUTTER:
    KORTNAVN[flat(_navn)] = _nokkel
    KORTNAVN[flat(_kort)] = _nokkel
    KORTNAVN[flat(_nokkel)] = _nokkel


def attributtnokkel(navn: str) -> str | None:
    """«OtB», «Off the Ball», «off_the_ball» → 'off_the_ball'."""
    return KORTNAVN.get(flat(navn))


@dataclass
class Anker:
    """En spiller du har slått opp i FM og skrevet av verdiene til."""

    navn: str
    attributter: dict          # nøkkel -> 1..20
    alder: int | None = None
    klubb: str | None = None
    nasjonalitet: str | None = None
    posisjoner: str | None = None

    @classmethod
    def fra_dict(cls, rå: dict) -> "Anker":
        atts = {}
        for nokkel, verdi in (rå.get("attributter") or {}).items():
            k = attributtnokkel(nokkel)
            if k and verdi not in (None, ""):
                atts[k] = int(verdi)
        return cls(rå["navn"], atts, rå.get("alder"), rå.get("klubb"),
                   rå.get("nasjonalitet"), rå.get("posisjoner"))


def bredde_for(type_: str) -> int:
    """Hvor mange bytes et felt av denne typen legger beslag på."""
    return {"u8": 1, "i8": 1, "indeks16": 2, "u16": 2, "i16": 2}.get(type_, 4)


def _u(rec, off, bredde):
    format_ = {1: "B", 2: "<H", 4: "<I"}[bredde]
    if off + bredde > len(rec):
        return None
    return struct.unpack_from(format_, rec, off)[0]


def finn_strengblokk(beholder, melding=si) -> tuple[int | None, int]:
    """Blokka med flest lesbare, lengdeprefiksede strenger."""
    beste, best_antall = None, 0
    for blokk, data in beholder:
        pool = Strengpool(bytes(data[:PROVE]))
        tetthet = len(pool)
        if tetthet > best_antall:
            beste, best_antall = blokk.nr, tetthet
    if beste is not None:
        melding(f"  strengpool: blokk {beste} (~{best_antall} strenger i prøven)")
    return beste, best_antall


def _navnepoeng(verdier: list[str]) -> float:
    """Hvor mye en samling strenger ligner på personnavn."""
    if not verdier:
        return 0.0
    treff = 0
    for v in verdier:
        if 3 <= len(v) <= 40 and any(c.isalpha() for c in v) and not v.isdigit():
            if v[:1].isupper() or not v[:1].isascii():
                treff += 1
    unike = len(set(verdier)) / len(verdier)
    return (treff / len(verdier)) * (0.5 + 0.5 * unike)


def finn_navnefelt(records, pool: Strengpool, stride: int, hopp=()) -> dict | None:
    """Byten i recorden som peker på spillernavnet – som offset eller nummer."""
    beste = None
    for off in range(0, stride - 1):
        if off in hopp:
            continue
        for type_, bredde in (("peker", 4), ("indeks32", 4), ("indeks16", 2)):
            if off + bredde > stride:
                continue
            verdier = []
            for rec in records:
                rå = _u(rec, off, bredde)
                if rå is None:
                    continue
                tekst = pool.ved_offset(rå) if type_ == "peker" else pool.ved_indeks(rå)
                if tekst:
                    verdier.append(tekst)
            dekning = len(verdier) / max(1, len(records))
            if dekning < 0.9:
                continue
            poeng = dekning * _navnepoeng(verdier)
            if beste is None or poeng > beste["poeng"]:
                beste = {"offset": off, "type": type_, "poeng": poeng,
                         "eksempler": verdier[:5]}
    if beste and beste["poeng"] > 0.6:
        return beste
    return None


def posisjonsnokkel(tekst: str) -> str:
    """«D (RC)» og «DR, DC» skal telle som samme svar."""
    if not tekst or len(tekst) > 24:
        return ""
    return ",".join(les_posisjoner(tekst))


def _plasser(pool: Strengpool, verdier: set[str], nokkel=flat) -> dict:
    """Hvor i poolen de tekstene vi spør etter ligger: nøkkel -> [(nr, offset)]."""
    ønsket = {nokkel(v) for v in verdier if v}
    ønsket.discard("")
    ut: dict[str, list[tuple[int, int]]] = {}
    for nr, tekst in enumerate(pool.strenger):
        n = nokkel(tekst)
        if n and n in ønsket:
            ut.setdefault(n, []).append((nr, pool.offsets[nr]))
    return ut


def finn_tekstfelt(par: list[tuple[bytes, str]], pool: Strengpool, stride: int,
                   hopp: set[int], nokkel=flat) -> dict | None:
    """Finner feltet som peker på en kjent tekst (klubb, nasjon, posisjon).

    For hvert anker vet vi både råverdien i recorden og hvilken tekst den skal
    bety. Da kan vi regne ut hvilket startpunkt i poolen som får regnestykket
    til å gå opp – og et startpunkt som passer for *alle* ankerne, er svaret.
    """
    if not par:
        return None
    plasser = _plasser(pool, {tekst for _, tekst in par}, nokkel)
    if not plasser:
        return None
    for off in range(stride - 1):
        if off in hopp:
            continue
        for type_, bredde in (("indeks16", 2), ("indeks32", 4), ("peker", 4)):
            if off + bredde > stride:
                continue
            baser: set[int] | None = None
            for rec, tekst in par:
                rå = _u(rec, off, bredde)
                treff = plasser.get(nokkel(tekst))
                if rå is None or not treff:
                    baser = None
                    break
                her = {(offs if type_ == "peker" else nr) - rå for nr, offs in treff}
                baser = her if baser is None else (baser & her)
                if not baser:
                    break
            if baser:
                return {"offset": off, "type": type_,
                        "basis": min(baser, key=abs), "ankere": len(par)}
    return None


def _kategorislag(verdier: list[str]) -> str:
    """Hva slags kolonne dette ser ut som: nasjon, posisjon eller navn på noe."""
    unike = list(dict.fromkeys(verdier))[:60]
    if andel_landnavn(unike) > 0.5:
        return "nasjon"
    posisjonslike = sum(1 for v in unike if les_posisjoner(v) and len(v) <= 20)
    if unike and posisjonslike / len(unike) > 0.7:
        return "posisjon"
    return "navn"


def finn_kategorifelt(records, pool: Strengpool, stride: int, hopp: set[int]) -> list[dict]:
    """Felt som peker på en tekst med få ulike verdier – klubb, liga, nasjon, posisjon."""
    funn = []
    for off in range(0, stride - 1):
        if off in hopp:
            continue
        for type_, bredde in (("indeks16", 2), ("indeks32", 4)):
            if off + bredde > stride:
                continue
            verdier = []
            for rec in records:
                rå = _u(rec, off, bredde)
                if rå is None:
                    continue
                tekst = pool.ved_indeks(rå)
                if tekst:
                    verdier.append(tekst)
            if len(verdier) / max(1, len(records)) < 0.9:
                continue
            unike = len(set(verdier))
            if not 2 <= unike <= max(4, len(records) // 3):
                continue
            funn.append({
                "offset": off, "type": type_, "unike": unike,
                "slag": _kategorislag(verdier),
                "eksempler": [v for v, _ in Counter(verdier).most_common(4)],
            })
    funn.sort(key=lambda f: f["unike"])
    return funn


def fordel_kategorifelt(kandidater: list[dict]) -> dict:
    """Gir hver kandidat en rolle: nasjonalitet, posisjoner, liga, klubb."""
    ledige = list(kandidater)
    roller: dict = {}
    for rolle, slag in (("nasjonalitet", "nasjon"), ("posisjoner", "posisjon")):
        for k in ledige:
            if k["slag"] == slag:
                roller[rolle] = k
                ledige.remove(k)
                break
    # Det som er igjen: færrest ulike verdier er liga, flest er klubb.
    navn = [k for k in ledige if k["slag"] == "navn"]
    if len(navn) >= 2:
        roller["liga"] = navn[0]
        roller["klubb"] = navn[-1]
    elif navn:
        roller["klubb"] = navn[0]
    return roller


def finn_alderfelt(records, stride: int, hopp: set[int]) -> dict | None:
    beste = None
    for off in range(stride):
        if off in hopp:
            continue
        verdier = [rec[off] for rec in records if off < len(rec)]
        if not verdier:
            continue
        innafor = sum(1 for v in verdier if 15 <= v <= 45) / len(verdier)
        if innafor < 0.98 or len(set(verdier)) < 12:
            continue
        snitt = sum(verdier) / len(verdier)
        poeng = innafor - abs(snitt - 25) / 40
        if beste is None or poeng > beste["poeng"]:
            beste = {"offset": off, "poeng": poeng, "snitt": round(snitt, 1)}
    return beste


def navngi_attributter(records, tabell: Tabell, ankere: list[Anker],
                       ankerrader: dict[str, int]) -> tuple[dict, list[str]]:
    """Kobler posisjonene i attributtstripa til FM-navn, ut fra ankerne.

    En posisjon er mulig for en attributt bare hvis verdien stemmer for *alle*
    ankerne som har oppgitt den. Med få ankere blir flere posisjoner mulige for
    samme attributt, og da hjelper det å se dem i sammenheng: har en attributt
    bare én posisjon igjen etter at de sikre har tatt sin, er den gitt. Det
    kjøres om igjen til ingenting mer løsner.

    Den motsatte regelen – «bare én attributt kan ha denne posisjonen, altså er
    det den» – ser fristende ut, men holder ikke her. Den forutsetter at den
    rette eieren av posisjonen er blant attributtene du har fylt ut, og fyller
    du ut tolv av seksti, er den som regel ikke det. Prøvekjøring med to ankere
    ga tolv navn der tre var feil. Et navn vi ikke er sikre på, er verre enn
    attributt_07, så den regelen er med vilje utelatt.
    """
    a0, lengde = tabell.stripeoffset, tabell.stripelengde
    tvil: list[str] = []
    aktuelle = [(a, ankerrader[a.navn]) for a in ankere if a.navn in ankerrader]
    if not aktuelle:
        return {}, ["ingen av ankerne ble funnet i tabellen"]

    kandidater: dict[str, set[int]] = {}
    for nokkel in ATTRIBUTTNOKLER:
        onsket = [(rec_nr, anker.attributter[nokkel])
                  for anker, rec_nr in aktuelle if nokkel in anker.attributter]
        if not onsket:
            continue
        mulige = {a0 + i for i in range(lengde)
                  if all(a0 + i < len(records[rec_nr])
                         and records[rec_nr][a0 + i] == verdi
                         for rec_nr, verdi in onsket)}
        if not mulige:
            tvil.append(f"{nokkel}: ingen plass passer med verdiene du oppga")
            continue
        kandidater[nokkel] = mulige

    kart: dict[str, int] = {}
    endret = True
    while endret and kandidater:
        endret = False
        # Én mulighet igjen for en attributt.
        for nokkel, mulige in list(kandidater.items()):
            mulige -= set(kart.values())
            if len(mulige) == 1:
                kart[nokkel] = mulige.pop()
                del kandidater[nokkel]
                endret = True
            elif not mulige:
                del kandidater[nokkel]
                tvil.append(f"{nokkel}: plassen er tatt av en annen attributt")
                endret = True

    for nokkel, mulige in kandidater.items():
        tvil.append(f"{nokkel}: {len(mulige)} mulige plasser")
    return kart, tvil


def _naabare_tekster(rec: bytes, pool: Strengpool, stride: int) -> set[str]:
    """Alle strenger recorden kan peke på, uansett hvordan vi leser tallene."""
    ut: set[str] = set()
    for off in range(stride - 1):
        for type_, bredde in (("indeks16", 2), ("indeks32", 4), ("peker", 4)):
            if off + bredde > len(rec):
                continue
            rå = _u(rec, off, bredde)
            if rå is None:
                continue
            tekst = pool.ved_offset(rå) if type_ == "peker" else pool.ved_indeks(rå)
            if tekst:
                ut.add(flat(tekst))
    return ut


def _ankerpoeng(rec: bytes, tabell: Tabell, anker: "Anker",
                pool: Strengpool | None = None) -> int:
    """Hvor godt en record passer med det du oppga om spilleren.

    Attributtverdiene alene holder ikke. De teller uten hensyn til plassering,
    og med tolv tall mellom 1 og 20 spredt over en stripe på seksti bytes
    treffer en tilfeldig navnebror like mange. Klubb og nasjonalitet er derimot
    vanskelige å treffe ved uhell, så de veier tungt når de er oppgitt.
    """
    stripe = Counter(rec[tabell.stripeoffset:tabell.stripeoffset + tabell.stripelengde])
    poeng = 0
    for ønsket, antall in Counter(anker.attributter.values()).items():
        poeng += min(antall, stripe.get(ønsket, 0))
    if anker.alder and anker.alder in set(rec):
        poeng += 2
    if pool is not None:
        nåbare = _naabare_tekster(rec, pool, tabell.stride)
        for verdi in (anker.klubb, anker.nasjonalitet):
            if verdi and flat(verdi) in nåbare:
                poeng += 8
        if anker.posisjoner:
            ønsket = posisjonsnokkel(anker.posisjoner)
            if ønsket and any(posisjonsnokkel(t) == ønsket for t in nåbare):
                poeng += 4
    return poeng



def _finn_ankere(tabell, data, pool, definisjon, ankere, prover, rapport, melding):
    """Leter opp ankerne i tabellen og legger recordene deres bakerst i prøven."""
    ankerrader: dict[str, int] = {}
    bredde = 2 if definisjon["type"] == "indeks16" else 4
    ønsket = {flat(a.navn): a for a in ankere}
    treff: dict[str, tuple[list[bytes], list[int]]] = {}
    for nr in range(tabell.antall):
        rec = bytes(tabell.record(data, nr))
        if len(rec) < tabell.stride:
            break
        rå = _u(rec, definisjon["offset"], bredde)
        tekst = (pool.ved_offset(rå) if definisjon["type"] == "peker"
                 else pool.ved_indeks(rå))
        if tekst and flat(tekst) in ønsket:
            records, plasser = treff.setdefault(flat(tekst), ([], []))
            records.append(rec)
            plasser.append(nr)
    # FM har navnebrødre. Når flere records har samme navn, velger vi den der
    # attributtverdiene du oppga faktisk finnes i stripa.
    for nokkel, (records, plasser) in treff.items():
        anker = ønsket[nokkel]
        # FM har navnebrødre, så flere records kan ha samme navn. Vi tar den
        # der attributtverdiene du oppga faktisk står i stripa.
        poengene = [_ankerpoeng(rec, tabell, anker, pool) for rec in records]
        beste_poeng = max(poengene)
        beste = records[poengene.index(beste_poeng)]
        poeng = beste_poeng
        if poengene.count(beste_poeng) > 1:
            rapport["merknader"].append(
                f"«{anker.navn}» finnes flere ganger i saven, og de er like "
                "sannsynlige ut fra det du oppga. Legg inn klubb og "
                "nasjonalitet på ankeret, så blir det riktig spiller."
            )
        krav = max(2, int(0.6 * len(anker.attributter)))
        if anker.attributter and poeng < krav:
            # Navnet finnes, men tallene står ikke der de skulle. Å bruke
            # ankeret likevel ville gitt attributtene feil navn, og det er
            # verre enn å la dem stå unavngitt.
            rapport["merknader"].append(
                f"«{anker.navn}» ble funnet i saven, men attributtverdiene du "
                "oppga står ikke i den recorden. Sjekk at tallene er skrevet av "
                "riktig, og at det er samme spiller."
            )
            continue
        if len(records) > 1:
            rapport["merknader"].append(
                f"«{anker.navn}» finnes {len(records)} ganger i saven – valgte den "
                "som passer best med verdiene du oppga."
            )
        ankerrader[anker.navn] = len(prover)
        prover.append(beste)
    rapport["ankere_funnet"] = sorted(ankerrader)
    melding(f"  fant {len(ankerrader)} av {len(ankere)} ankere i tabellen")
    return ankerrader


def kalibrer(beholder, ankere: list[Anker] | None = None, *, melding=si) -> tuple[Profil, dict]:
    """Bygger et skjema for saven. Returnerer (profil, rapport)."""
    ankere = ankere or []
    rapport: dict = {"ankere": [a.navn for a in ankere], "merknader": []}

    # 1. Tabellen.
    melding("Leter etter spillertabellen …")
    tabeller = finn_tabeller(beholder, melding=melding)
    if not tabeller:
        raise RuntimeError(
            "Fant ingen tabell som ser ut som spillere. Kjør «sjekk» på fila for "
            "å se hva som ligger i den."
        )
    tabell = tabeller[0]
    rapport["tabell"] = tabell.som_dict()
    rapport["andre_tabeller"] = [t.som_dict() for t in tabeller[1:4]]
    data = beholder.data(tabell.blokk)
    melding(f"  valgte blokk {tabell.blokk}: {tabell.antall} records à {tabell.stride} B")

    steg = max(1, tabell.antall // UTVALG)
    prover = [bytes(tabell.record(data, nr)) for nr in range(0, tabell.antall, steg)][:UTVALG]
    prover = [r for r in prover if len(r) == tabell.stride]

    profil = Profil(
        navn="auto", kilde=str(beholder.kilde), blokk=tabell.blokk,
        start=tabell.start, stride=tabell.stride, antall=tabell.antall,
        merknad="Laget av «kalibrer». Rett gjerne på feltene for hånd.",
    )
    brukt: set[int] = set(range(tabell.stripeoffset,
                                tabell.stripeoffset + tabell.stripelengde))

    # 2. Strengpoolen og navnefeltet.
    melding("Leter etter strengpoolen …")
    strengblokk, _ = finn_strengblokk(beholder, melding)
    pool = None
    if strengblokk is not None:
        pool = Strengpool(beholder.data(strengblokk))
        profil.strengblokk = strengblokk
        rapport["strengblokk"] = {"blokk": strengblokk, "strenger": len(pool)}

    ankerrader: dict[str, int] = {}
    if pool and len(pool) > 10:
        melding("Leter etter navnefeltet …")
        navnefelt = finn_navnefelt(prover, pool, tabell.stride, brukt)
        if navnefelt:
            profil.felt["navn"] = {"offset": navnefelt["offset"], "type": navnefelt["type"]}
            brukt.update(range(navnefelt["offset"],
                                navnefelt["offset"] + bredde_for(navnefelt["type"])))
            rapport["navn"] = navnefelt
            melding(f"  navn: offset {navnefelt['offset']} ({navnefelt['type']}) "
                    f"– f.eks. {', '.join(navnefelt['eksempler'][:3])}")
            # 3. Ankerne, og feltene de kan feste.
            if ankere:
                ankerrader = _finn_ankere(tabell, data, pool, profil.felt["navn"],
                                          ankere, prover, rapport, melding)
        else:
            rapport["merknader"].append(
                "Fant ikke navnefeltet. Spillerne får ID i stedet for navn."
            )

    if ankerrader and pool:
        melding("Fester klubb, nasjonalitet og posisjoner med ankerne …")
        for nokkel, hent, nokkelfunksjon in (
                ("klubb", lambda a: a.klubb, flat),
                ("nasjonalitet", lambda a: a.nasjonalitet, flat),
                ("posisjoner", lambda a: a.posisjoner, posisjonsnokkel)):
            par = [(prover[ankerrader[a.navn]], hent(a)) for a in ankere
                   if a.navn in ankerrader and hent(a)]
            if not par:
                continue
            funn = finn_tekstfelt(par, pool, tabell.stride, brukt, nokkelfunksjon)
            if not funn:
                rapport["merknader"].append(f"Fant ikke {nokkel}-feltet ut fra ankerne.")
                continue
            definisjon = {"offset": funn["offset"], "type": funn["type"]}
            if funn["type"] == "peker":
                definisjon["basis"] = funn["basis"]
            else:
                definisjon["startindeks"] = funn["basis"]
            profil.felt[nokkel] = definisjon
            brukt.update(range(funn["offset"],
                               funn["offset"] + bredde_for(funn["type"])))
            rapport.setdefault("ankerfelt", {})[nokkel] = definisjon
            melding(f"  {nokkel}: offset {funn['offset']} ({funn['type']}), "
                    f"bekreftet med {funn['ankere']} ankere")

    # 4. Resten av tekstfeltene, gjettet ut fra hva de inneholder.
    if pool and len(pool) > 10:
        kategorier = finn_kategorifelt(prover, pool, tabell.stride, brukt)
        rapport["kategorifelt"] = kategorier[:8]
        roller = fordel_kategorifelt(kategorier)
        rapport["kategoriroller"] = {r: k["offset"] for r, k in roller.items()
                                     if r not in profil.felt}
        gjettet = []
        for nokkel, funn in roller.items():
            if nokkel in profil.felt:
                continue
            profil.felt[nokkel] = {"offset": funn["offset"], "type": funn["type"]}
            brukt.update(range(funn["offset"],
                               funn["offset"] + bredde_for(funn["type"])))
            gjettet.append(nokkel)
            melding(f"  {nokkel}: offset {funn['offset']} – {funn['unike']} ulike "
                    f"({', '.join(funn['eksempler'][:3])})")
        if gjettet:
            rapport["merknader"].append(
                "Disse er gjettet ut fra innholdet, ikke bekreftet med ankere: "
                + ", ".join(gjettet) + ". Legg inn klubb, nasjonalitet og "
                "posisjoner på ankerne for å få dem sikre."
            )

    # 5. CA, PA og alder.
    melding("Leter etter CA og PA …")
    kandidater = finn_evnekandidater(data, tabell)
    rapport["evne"] = [k.__dict__ for k in kandidater]
    for slag in ("ca", "pa"):
        for k in kandidater:
            if k.slag == slag and k.offset not in brukt:
                profil.felt[slag] = {"offset": k.offset, "type": "u8"}
                brukt.add(k.offset)
                melding(f"  {slag.upper()}: offset {k.offset} – {k.beskrivelse}")
                break
        else:
            rapport["merknader"].append(f"Fant ingen sikker kandidat for {slag.upper()}.")

    alder = finn_alderfelt(prover, tabell.stride, brukt)
    if alder:
        profil.felt["alder"] = {"offset": alder["offset"], "type": "u8"}
        brukt.add(alder["offset"])
        rapport["alder"] = alder
        melding(f"  alder: offset {alder['offset']} (snitt {alder['snitt']} år)")

    # 6. Attributtene: navngi det ankerne rekker, nummerer resten.
    kart, tvil = ({}, []) if not ankerrader else navngi_attributter(
        prover, tabell, ankere, ankerrader)
    profil.attributter = dict(sorted(kart.items(), key=lambda kv: kv[1]))
    unavngitt = [tabell.stripeoffset + i for i in range(tabell.stripelengde)
                 if tabell.stripeoffset + i not in set(kart.values())]
    for off in unavngitt:
        profil.attributter[f"attributt_{off - tabell.stripeoffset:02d}"] = off
    rapport["navngitte"] = sorted(kart, key=lambda n: kart[n])
    rapport["attributter_navngitt"] = len(kart)
    rapport["attributter_ukjent"] = len(unavngitt)
    rapport["tvil"] = tvil
    if kart:
        melding(f"  navnga {len(kart)} attributter, {len(unavngitt)} står igjen som nummer")
    elif ankere:
        rapport["merknader"].append(
            "Ingen attributter kunne navngis. Sjekk at navnene på ankerne er "
            "skrevet nøyaktig som i FM."
        )
    else:
        rapport["merknader"].append(
            "Uten ankere vet vi ikke hvilken attributt som er hvilken. Legg inn et "
            "par spillere med «kalibrer --anker» for å få navn på dem."
        )
    return profil, rapport

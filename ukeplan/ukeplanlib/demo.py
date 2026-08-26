"""Eit ferdig utfylt døme: seks klassar og tre veker på Hustadvika vidaregåande skole.

Klassekodane og timeplanen er sett opp slik ein kombinert vidaregåande skule
gjerne har det – studiespesialisering og yrkesfag side om side. Byt dei ut i
Oppsett og Timeplan når du set opp skulen din på ekte.
"""

from __future__ import annotations

SKOLE = "Hustadvika vidaregåande skole"
SPRAK = "nynorsk"
LOGO = "profil/logo.png"

OKTER = ["08:15–09:45", "10:00–11:30", "12:00–13:30", "13:40–15:10"]

# Fast timeplan per klasse: fem dagar à fire økter. Tom streng = fri økt.
TIMEPLAN = {
    "1STA": {
        "Måndag":  ["Norsk", "Matematikk 1T", "Engelsk", ""],
        "Tysdag":  ["Naturfag", "Naturfag", "Kroppsøving", "Spansk"],
        "Onsdag":  ["Engelsk", "Norsk", "Samfunnskunnskap", ""],
        "Torsdag": ["Matematikk 1T", "Matematikk 1T", "Geografi", "Spansk"],
        "Fredag":  ["Norsk", "Engelsk", "Samfunnskunnskap", ""],
    },
    "2STA": {
        "Måndag":  ["Historie", "Matematikk S1", "Kroppsøving", "Sosiologi og sosialantropologi"],
        "Tysdag":  ["Norsk", "Norsk", "Biologi 1", ""],
        "Onsdag":  ["Matematikk S1", "Historie", "Spansk", "Biologi 1"],
        "Torsdag": ["Sosiologi og sosialantropologi", "Norsk", "Spansk", ""],
        "Fredag":  ["Biologi 1", "Matematikk S1", "Kroppsøving", ""],
    },
    "3STA": {
        "Måndag":  ["Norsk", "Religion og etikk", "Biologi 2", ""],
        "Tysdag":  ["Historie", "Historie", "Sosialkunnskap", "Matematikk R2"],
        "Onsdag":  ["Norsk", "Norsk", "Kroppsøving", "Biologi 2"],
        "Torsdag": ["Matematikk R2", "Sosialkunnskap", "Religion og etikk", ""],
        "Fredag":  ["Biologi 2", "Historie", "Matematikk R2", ""],
    },
    "1HSA": {
        "Måndag":  ["Helsefremjande arbeid", "Helsefremjande arbeid", "Norsk", ""],
        "Tysdag":  ["Yrkesfagleg fordjuping", "Yrkesfagleg fordjuping", "Matematikk 1P-Y", "Kroppsøving"],
        "Onsdag":  ["Kommunikasjon og samhandling", "Kommunikasjon og samhandling", "Engelsk", ""],
        "Torsdag": ["Yrkesliv i helse- og oppvekstfag", "Naturfag", "Norsk", ""],
        "Fredag":  ["Helsefremjande arbeid", "Matematikk 1P-Y", "Kroppsøving", ""],
    },
    "1TIA": {
        "Måndag":  ["Produksjon og tenester", "Produksjon og tenester", "Matematikk 1P-Y", ""],
        "Tysdag":  ["Konstruksjons- og styringsteknikk", "Konstruksjons- og styringsteknikk", "Norsk", "Kroppsøving"],
        "Onsdag":  ["Yrkesfagleg fordjuping", "Yrkesfagleg fordjuping", "Yrkesfagleg fordjuping", ""],
        "Torsdag": ["Produksjon og tenester", "Naturfag", "Engelsk", ""],
        "Fredag":  ["Konstruksjons- og styringsteknikk", "Matematikk 1P-Y", "Kroppsøving", ""],
    },
    "1RMA": {
        "Måndag":  ["Råvare, produksjon og kvalitet", "Råvare, produksjon og kvalitet", "Norsk", ""],
        "Tysdag":  ["Bransje og arbeidsliv", "Bransje og arbeidsliv", "Engelsk", "Kroppsøving"],
        "Onsdag":  ["Yrkesfagleg fordjuping", "Yrkesfagleg fordjuping", "Matematikk 1P-Y", ""],
        "Torsdag": ["Råvare, produksjon og kvalitet", "Råvare, produksjon og kvalitet", "Naturfag", ""],
        "Fredag":  ["Norsk", "Matematikk 1P-Y", "Kroppsøving", ""],
    },
}

LARAR = {
    "Norsk": "KM", "Matematikk 1T": "AT", "Matematikk 1P-Y": "AT", "Matematikk S1": "AT",
    "Matematikk R2": "AT", "Engelsk": "SB", "Naturfag": "IL", "Samfunnskunnskap": "PH",
    "Geografi": "PH", "Historie": "PH", "Religion og etikk": "PH", "Spansk": "MG",
    "Kroppsøving": "MR", "Biologi 1": "IL", "Biologi 2": "IL",
    "Sosiologi og sosialantropologi": "EV", "Sosialkunnskap": "EV",
    "Helsefremjande arbeid": "TB", "Kommunikasjon og samhandling": "TB",
    "Yrkesliv i helse- og oppvekstfag": "TB", "Produksjon og tenester": "JH",
    "Konstruksjons- og styringsteknikk": "JH", "Råvare, produksjon og kvalitet": "AN",
    "Bransje og arbeidsliv": "AN", "Yrkesfagleg fordjuping": "AN",
}

# (veke, klasse, dag, fag, tema, lekse, frist, type)
VEKE = [
    (35, "1STA", "Måndag", "Norsk", "Oppstart: kva er ein sakprosatekst?", "Les s. 12–19 i Panorama", "Onsdag", ""),
    (35, "1STA", "Tysdag", "Naturfag", "HMS og tryggleik på naturfagrommet", "", "", "Info"),
    (35, "1STA", "Torsdag", "Matematikk 1T", "Repetisjon: tal og algebra", "Oppgåve 1.20–1.34", "Fredag", ""),
    (35, "2STA", "Tysdag", "Norsk", "Retorikk: etos, patos, logos", "Les kapittel 2 og noter tre døme", "Torsdag", ""),
    (35, "3STA", "Måndag", "Biologi 2", "Kva skal vi gjennom i år? Årsplan og vurderingar", "", "", "Info"),
    (35, "1HSA", "Måndag", "Helsefremjande arbeid", "Bli kjend med faget og programområdet", "", "", "Info"),
    (35, "1TIA", "Onsdag", "Yrkesfagleg fordjuping", "Verkstadkurs: tryggleik, verneutstyr og orden", "", "", "Info"),
    (35, "1RMA", "Måndag", "Råvare, produksjon og kvalitet", "Hygiene og reinhald på kjøkkenet", "Les hygieneheftet", "Torsdag", ""),

    (36, "1STA", "Måndag", "Norsk", "Argumenterande tekst: oppbygging og kjeldebruk",
     "Skriv utkast til argumenterande tekst i Teams", "Torsdag", ""),
    (36, "1STA", "Måndag", "Matematikk 1T", "Potensar og røter", "Oppgåve 2.14–2.28", "Tysdag", ""),
    (36, "1STA", "Tysdag", "Naturfag", "Cella: oppbygging og funksjon", "Teikn ei dyrecelle med namn på delane", "Fredag", ""),
    (36, "1STA", "Onsdag", "Engelsk", "Australia: reading and vocabulary",
     "Glosetest torsdag – 20 ord frå kapittel 3", "Torsdag", "Vurdering"),
    (36, "1STA", "Torsdag", "Geografi", "Naturressursar på Nordvestlandet", "", "", ""),
    (36, "1STA", "Fredag", "Norsk", "Innlevering: argumenterande tekst",
     "Lever teksten i Teams før kl. 15.00", "Fredag", "Innlevering"),
    (36, "2STA", "Måndag", "Historie", "Den industrielle revolusjonen", "Les s. 88–95 og svar på tre spørsmål", "Onsdag", ""),
    (36, "2STA", "Tysdag", "Biologi 1", "Feltarbeid i fjøra – vi bruker skulebåten",
     "Ta med regntøy og støvlar", "Tysdag", "Tur"),
    (36, "2STA", "Fredag", "Matematikk S1", "Heildagsprøve i funksjonar", "Øv på kapittel 3", "Fredag", "Prøve"),
    (36, "3STA", "Tysdag", "Historie", "Den kalde krigen: kjeldegransking", "Les utdraga i klasserommet", "Torsdag", ""),
    (36, "3STA", "Torsdag", "Matematikk R2", "Integrasjon: delvis integrasjon", "Oppgåve 5.30–5.44", "Fredag", ""),
    (36, "1HSA", "Tysdag", "Yrkesfagleg fordjuping", "Utplassering på sjukeheimen – oppmøte kl. 08.00",
     "Ta med arbeidstøy og namneskilt", "Tysdag", "Utplassering"),
    (36, "1HSA", "Onsdag", "Kommunikasjon og samhandling", "Aktiv lytting og brukarmedverknad",
     "Skriv logg frå utplasseringa", "Torsdag", ""),
    (36, "1TIA", "Måndag", "Produksjon og tenester", "Måling og toleransar", "Oppgåvehefte s. 4–7", "Torsdag", ""),
    (36, "1TIA", "Tysdag", "Konstruksjons- og styringsteknikk", "Pneumatikk: enkle kretsar",
     "Teikn kretsen frå timen på nytt", "Fredag", ""),
    (36, "1RMA", "Torsdag", "Råvare, produksjon og kvalitet", "Fisk: filetering og kvalitet",
     "Sjå instruksjonsvideoen før timen", "Torsdag", ""),
    (36, "Alle", "Onsdag", "", "", "Frist for å melde seg på fagdagen om psykisk helse", "Onsdag", "Frist"),

    (37, "1STA", "Tysdag", "Naturfag", "Arv og miljø", "Les s. 52–60", "Torsdag", ""),
    (37, "1STA", "Torsdag", "Matematikk 1T", "Prøve i tal og algebra", "Øv på kapittel 1 og 2", "Torsdag", "Prøve"),
    (37, "2STA", "Onsdag", "Spansk", "Presentación: mi pueblo", "Øv på framføringa heime", "Onsdag", "Vurdering"),
    (37, "3STA", "Måndag", "Norsk", "Tentamen i norsk hovudmål – heile dagen",
     "Ta med lading til PC-en", "Måndag", "Prøve"),
    (37, "1HSA", "Torsdag", "Yrkesliv i helse- og oppvekstfag", "Yrkesetikk og teieplikt", "", "", ""),
    (37, "1TIA", "Onsdag", "Yrkesfagleg fordjuping", "Utplassering i bedrift heile onsdagen",
     "Meld frå til kontaktlærar om oppmøtestad", "Onsdag", "Utplassering"),
    (37, "1RMA", "Tysdag", "Bransje og arbeidsliv", "Vi lagar lunsj til personalrommet", "", "", ""),
    (37, "Alle", "Fredag", "", "", "Fagdag om psykisk helse – vanleg timeplan går ut", "Fredag", "Fagdag"),
]

# (veke, klasse, overskrift, melding)
MELDINGAR = [
    (35, "Alle", "Velkommen til eit nytt skuleår",
     "Første skuledag er måndag kl. 08.15. Ta med PC og ladar. Skulebussane går som vanleg."),
    (36, "Alle", "Foreldremøte for Vg1 torsdag",
     "Foreldremøte for alle Vg1-klassane torsdag kl. 18.00 i auditoriet. Meld frå i Visma InSchool."),
    (36, "1HSA", "Utplassering tysdag",
     "Oppmøte direkte på sjukeheimen kl. 08.00. Hugs arbeidstøy, namneskilt og matpakke."),
    (36, "2STA", "Feltarbeid med skulebåten",
     "Vi går frå kaia kl. 10.00 tysdag. Kle deg etter vêret – det blir vått."),
    (37, "Alle", "Fagdag fredag",
     "Fredag er det fagdag om psykisk helse for heile skulen. Vanleg timeplan går ut."),
    (37, "3STA", "Tentamen måndag",
     "Norsktentamen måndag. Møt opp kl. 08.00 utanfor auditoriet."),
]


def lararrader() -> list[list]:
    """Same læraren i alle klassane i dømet, så «Alle» held."""
    return [["Alle", fag, larar] for fag, larar in LARAR.items()]


def demoinnhold() -> dict:
    return {
        "Uke": [list(r) for r in VEKE],
        "Beskjeder": [list(r) for r in MELDINGAR],
        "Lærere": lararrader(),
    }


KLASSER = list(TIMEPLAN.keys())
FAG = sorted({fag for dager in TIMEPLAN.values() for dag in dager.values() for fag in dag if fag})

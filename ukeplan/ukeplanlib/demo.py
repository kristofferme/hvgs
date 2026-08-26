"""Eit ferdig utfylt døme: seks klassar og tre veker på Hustadvika vidaregåande skole.

Klassekodane er sett opp slik ein kombinert vidaregåande skule gjerne har det –
studiespesialisering og yrkesfag side om side. Byt dei ut i Oppsett når du set
opp skulen din på ekte.
"""

from __future__ import annotations

SKOLE = "Hustadvika vidaregåande skole"
SPRAK = "nynorsk"
LOGO = "profil/logo.png"

KLASSER = ["1STA", "2STA", "3STA", "1HSA", "1TIA", "1RMA"]

FAG = [
    "Norsk", "Matematikk 1T", "Matematikk 1P-Y", "Matematikk S1", "Matematikk R2",
    "Engelsk", "Naturfag", "Samfunnskunnskap", "Geografi", "Historie",
    "Religion og etikk", "Kroppsøving", "Spansk", "Biologi 1", "Biologi 2",
    "Sosiologi og sosialantropologi", "Sosialkunnskap",
    "Helsefremjande arbeid", "Kommunikasjon og samhandling",
    "Yrkesliv i helse- og oppvekstfag", "Produksjon og tenester",
    "Konstruksjons- og styringsteknikk", "Råvare, produksjon og kvalitet",
    "Bransje og arbeidsliv", "Yrkesfagleg fordjuping",
]

# (veke, klasse, fag, vi jobbar med, å gjere, frist, type)
VEKE = [
    # ── Veke 35 ──────────────────────────────────────────────────
    (35, "1STA", "Norsk", "Kva er sakprosa? Vi les og samanliknar tekstar", "Les s. 12–19 i Panorama", "Onsdag", ""),
    (35, "1STA", "Matematikk 1T", "Repetisjon: tal og algebra", "Oppgåve 1.20–1.34", "Fredag", ""),
    (35, "1STA", "Naturfag", "HMS og tryggleik på naturfagrommet", "", "", "Info"),
    (35, "2STA", "Norsk", "Retorikk: etos, patos og logos", "Les kapittel 2 og finn tre døme frå reklame", "Torsdag", ""),
    (35, "2STA", "Biologi 1", "Årsplan og vurderingar. Kva er økologi?", "", "", ""),
    (35, "3STA", "Norsk", "Vi startar med litteraturhistoria", "Les utdraget frå Ibsen", "Torsdag", ""),
    (35, "1HSA", "Helsefremjande arbeid", "Bli kjend med faget og programområdet", "", "", "Info"),
    (35, "1TIA", "Yrkesfagleg fordjuping", "Verkstadkurs: tryggleik, verneutstyr og orden", "Ta HMS-kurset i Teams", "Fredag", ""),
    (35, "1RMA", "Råvare, produksjon og kvalitet", "Hygiene og reinhald på kjøkkenet", "Les hygieneheftet", "Torsdag", ""),

    # ── Veke 36 ──────────────────────────────────────────────────
    (36, "1STA", "Norsk", "Argumenterande tekst: oppbygging og kjeldebruk",
     "Skriv utkast til argumenterande tekst i Teams", "Torsdag", ""),
    (36, "1STA", "Norsk", "", "Lever den ferdige teksten i Teams", "Fredag", "Innlevering"),
    (36, "1STA", "Matematikk 1T", "Potensar og røter", "Oppgåve 2.14–2.28", "Tysdag", ""),
    (36, "1STA", "Naturfag", "Cella: oppbygging og funksjon", "Teikn ei dyrecelle med namn på delane", "Fredag", ""),
    (36, "1STA", "Engelsk", "Australia: reading and vocabulary", "Glosetest – 20 ord frå kapittel 3", "Torsdag", "Vurdering"),
    (36, "1STA", "Geografi", "Naturressursar på Nordvestlandet", "Sjå filmen i Teams før timen", "Torsdag", ""),
    (36, "2STA", "Historie", "Den industrielle revolusjonen", "Les s. 88–95 og svar på tre spørsmål", "Onsdag", ""),
    (36, "2STA", "Biologi 1", "Feltarbeid i fjøra – vi bruker skulebåten", "Ta med regntøy og støvlar", "Tysdag", "Tur"),
    (36, "2STA", "Biologi 1", "", "Skriv feltrapport frå fjøra", "Fredag", "Innlevering"),
    (36, "2STA", "Matematikk S1", "Funksjonar: nullpunkt og topppunkt", "Øv på kapittel 3", "Fredag", "Prøve"),
    (36, "2STA", "Spansk", "Presentación: mi pueblo", "Øv på framføringa heime", "Torsdag", ""),
    (36, "3STA", "Historie", "Den kalde krigen: kjeldegransking", "Les utdraga i klasserommet", "Torsdag", ""),
    (36, "3STA", "Matematikk R2", "Integrasjon: delvis integrasjon", "Oppgåve 5.30–5.44", "Fredag", ""),
    (36, "3STA", "Biologi 2", "Genteknologi: kva er CRISPR?", "Sjå dokumentaren i Teams", "Onsdag", ""),
    (36, "1HSA", "Yrkesfagleg fordjuping", "Utplassering på sjukeheimen tysdag og onsdag",
     "Ta med arbeidstøy og namneskilt", "Tysdag", "Utplassering"),
    (36, "1HSA", "Kommunikasjon og samhandling", "Aktiv lytting og brukarmedverknad",
     "Skriv logg frå utplasseringa", "Torsdag", ""),
    (36, "1HSA", "Naturfag", "Kosthald og helse", "Les s. 40–48", "Fredag", ""),
    (36, "1TIA", "Produksjon og tenester", "Måling og toleransar", "Oppgåvehefte s. 4–7", "Torsdag", ""),
    (36, "1TIA", "Konstruksjons- og styringsteknikk", "Pneumatikk: enkle kretsar",
     "Teikn kretsen frå timen på nytt", "Fredag", ""),
    (36, "1TIA", "Norsk", "Å skrive ein arbeidsrapport", "Skriv rapport frå verkstadoppgåva", "Fredag", "Innlevering"),
    (36, "1RMA", "Råvare, produksjon og kvalitet", "Fisk: filetering og kvalitet",
     "Sjå instruksjonsvideoen før timen", "Torsdag", ""),
    (36, "1RMA", "Bransje og arbeidsliv", "Yrkesroller i restaurantbransjen", "Skriv ned tre yrke du vil vite meir om", "Fredag", ""),
    (36, "Alle", "", "", "Frist for å melde seg på fagdagen om psykisk helse", "Onsdag", "Frist"),

    # ── Veke 37 ──────────────────────────────────────────────────
    (37, "1STA", "Naturfag", "Arv og miljø", "Les s. 52–60", "Torsdag", ""),
    (37, "1STA", "Matematikk 1T", "Prøve i tal og algebra", "Øv på kapittel 1 og 2", "Torsdag", "Prøve"),
    (37, "1STA", "Samfunnskunnskap", "Demokrati: kven bestemmer i Noreg?", "Les s. 22–29", "Fredag", ""),
    (37, "2STA", "Spansk", "Framføring: mi bygd", "Framfør presentasjonen", "Onsdag", "Vurdering"),
    (37, "2STA", "Historie", "Nasjonalisme i Europa", "Les s. 96–103", "Fredag", ""),
    (37, "3STA", "Norsk", "Tentamen i norsk hovudmål – heile dagen", "Ta med ladar til PC-en", "Måndag", "Prøve"),
    (37, "3STA", "Sosialkunnskap", "Sosial ulikskap i Noreg", "Finn ein artikkel og ta han med", "Torsdag", ""),
    (37, "1HSA", "Yrkesliv i helse- og oppvekstfag", "Yrkesetikk og teieplikt", "", "", ""),
    (37, "1HSA", "Helsefremjande arbeid", "Ernæring og måltid", "Lag ein døgnmeny og lever i Teams", "Fredag", "Innlevering"),
    (37, "1TIA", "Yrkesfagleg fordjuping", "Utplassering i bedrift heile onsdagen",
     "Meld frå til kontaktlærar om oppmøtestad", "Onsdag", "Utplassering"),
    (37, "1RMA", "Bransje og arbeidsliv", "Vi lagar lunsj til personalrommet", "", "", ""),
    (37, "Alle", "", "", "Fagdag om psykisk helse – vanleg timeplan går ut", "Fredag", "Fagdag"),
]

# (veke, klasse, overskrift, melding)
MELDINGAR = [
    (35, "Alle", "Velkommen til eit nytt skuleår",
     "Første skuledag er måndag kl. 08.15. Ta med PC og ladar. Skulebussane går som vanleg."),
    (36, "Alle", "Foreldremøte for Vg1 torsdag",
     "Foreldremøte for alle Vg1-klassane torsdag kl. 18.00 i auditoriet. Meld frå i Visma InSchool."),
    (36, "1HSA", "Utplassering tysdag og onsdag",
     "Oppmøte direkte på sjukeheimen kl. 08.00. Hugs arbeidstøy, namneskilt og matpakke."),
    (36, "2STA", "Feltarbeid med skulebåten",
     "Vi går frå kaia kl. 10.00 tysdag. Kle deg etter vêret – det blir vått."),
    (37, "Alle", "Fagdag fredag",
     "Fredag er det fagdag om psykisk helse for heile skulen. Vanleg timeplan går ut."),
    (37, "3STA", "Tentamen måndag",
     "Norsktentamen måndag. Møt opp kl. 08.00 utanfor auditoriet."),
]


def demoinnhold() -> dict:
    return {
        "Uke": [list(r) for r in VEKE],
        "Beskjeder": [list(r) for r in MELDINGAR],
    }

"""Eit ferdig utfylt døme for Hustadvika vidaregåande skole.

Klassekodane er skulen sine eigne. Faglistene under er sett opp etter kva
programområda vanlegvis har – dei to Vg2-klassane 2KJP/AR og 2KJP/RM har
programfag som må rettast til dei faktiske faga. Alt saman ligg i arket
«Fag per klasse» og kan endrast der.
"""

from __future__ import annotations

SKOLE = "Hustadvika vidaregåande skole"
SPRAK = "nynorsk"
LOGO = "profil/logo.png"

FELLESFAG_VG1 = ["Norsk", "Engelsk", "Matematikk 1P-Y", "Naturfag", "Kroppsøving"]
FELLESFAG_VG2 = ["Norsk", "Samfunnskunnskap", "Kroppsøving"]
YFF = "Yrkesfagleg fordjuping"

FAGVALG = {
    "1ID": ["Norsk", "Engelsk", "Matematikk 1P", "Naturfag", "Samfunnskunnskap", "Geografi",
            "Kroppsøving", "Aktivitetslære", "Treningslære"],
    "1HO": FELLESFAG_VG1 + ["Helsefremjande arbeid", "Kommunikasjon og samhandling",
                            "Yrkesliv i helse- og oppvekstfag", YFF],
    "1NA": FELLESFAG_VG1 + ["Naturbasert produksjon og tenesteyting", "Naturbasert aktivitet", YFF],
    "1RM": FELLESFAG_VG1 + ["Råvare, produksjon og kvalitet", "Bransje og arbeidsliv", YFF],
    "1TIF1": FELLESFAG_VG1 + ["Produksjon og tenester", "Konstruksjons- og styringsteknikk", YFF],
    "1TIF2": FELLESFAG_VG1 + ["Produksjon og tenester", "Konstruksjons- og styringsteknikk", YFF],
    "1TIF3": FELLESFAG_VG1 + ["Produksjon og tenester", "Konstruksjons- og styringsteknikk", YFF],
    "2AKV/FF": FELLESFAG_VG2 + ["Drift og produksjon", "Anlegg og teknikk",
                                "Fangst og reiskap", "Fartøy og tryggleik", YFF],
    "2KJP/AR": FELLESFAG_VG2 + ["Programfag 1", "Programfag 2", YFF],
    "2KJP/RM": FELLESFAG_VG2 + ["Råvare, produksjon og kvalitet", "Bransje og arbeidsliv", YFF],
    "3PB1": ["Norsk", "Historie", "Matematikk 2P-Y", "Naturfag", "Samfunnskunnskap", "Kroppsøving"],
    "3PB2": ["Norsk", "Historie", "Matematikk 2P-Y", "Naturfag", "Samfunnskunnskap", "Kroppsøving"],
}
KLASSER = list(FAGVALG)

FAG = []
for _fagene in FAGVALG.values():
    for _f in _fagene:
        if _f not in FAG:
            FAG.append(_f)

# (veke, klasse, fag, vi jobbar med, punkt, frist, type)
VEKE = [
    # ── Veke 35 ──────────────────────────────────────────────────
    (35, "1ID", "Norsk", "Kva er sakprosa? Vi les og samanliknar tekstar", "Les s. 12–19 i Panorama", "Onsdag", "Heimearbeid"),
    (35, "1ID", "Aktivitetslære", "Basistrening og oppvarming", "Ta med innesko og treningstøy", "", "I timen"),
    (35, "1HO", "Helsefremjande arbeid", "Bli kjend med faget og programområdet", "", "", "I timen"),
    (35, "1TIF1", YFF, "Verkstadkurs: tryggleik, verneutstyr og orden", "Ta HMS-kurset i Teams", "Fredag", "Heimearbeid"),
    (35, "1NA", "Naturbasert aktivitet", "Vi riggar båten og går gjennom tryggleik om bord", "", "", "I timen"),
    (35, "1RM", "Råvare, produksjon og kvalitet", "Hygiene og reinhald på kjøkkenet", "Les hygieneheftet", "Torsdag", "Heimearbeid"),
    (35, "3PB1", "Norsk", "Vi startar med litteraturhistoria", "Les utdraget frå Ibsen", "Torsdag", "Heimearbeid"),

    # ── Veke 36 ──────────────────────────────────────────────────
    (36, "1ID", "Norsk", "Argumenterande tekst: oppbygging og kjeldebruk",
     "Skriv utkast i Teams", "Torsdag", "Heimearbeid"),
    (36, "1ID", "Norsk", "", "Lever den ferdige teksten i Teams", "Fredag", "Innlevering"),
    (36, "1ID", "Treningslære", "Utholdenheit: puls og intensitetssoner", "Vi testar puls i gymsalen", "", "I timen"),
    (36, "1ID", "Matematikk 1P", "Prosent og prosentpoeng", "Oppgåve 2.14–2.28", "Tysdag", "Heimearbeid"),
    (36, "1ID", "Naturfag", "Cella: oppbygging og funksjon", "Teikn ei dyrecelle med namn på delane", "Fredag", "Heimearbeid"),
    (36, "1ID", "Engelsk", "Australia: reading and vocabulary", "Glosetest – 20 ord frå kapittel 3", "Torsdag", "Vurdering"),

    (36, "1HO", YFF, "Utplassering på sjukeheimen tysdag og onsdag",
     "Ta med arbeidstøy og namneskilt", "Tysdag", "Utplassering"),
    (36, "1HO", "Kommunikasjon og samhandling", "Aktiv lytting og brukarmedverknad",
     "Skriv logg frå utplasseringa", "Torsdag", "Innlevering"),
    (36, "1HO", "Naturfag", "Kosthald og helse", "Les s. 40–48", "Fredag", "Heimearbeid"),
    (36, "1HO", "Helsefremjande arbeid", "Vi øver på stell og forflytting i øvingsrommet", "", "", "I timen"),

    (36, "1NA", "Naturbasert produksjon og tenesteyting", "Merdkant og fôring – vi er på anlegget onsdag",
     "Ta med flytedress og støvlar", "Onsdag", "Ekskursjon"),
    (36, "1NA", "Naturfag", "Vasskvalitet: oksygen, temperatur og salt", "Skriv ferdig målejournalen", "Fredag", "Innlevering"),

    (36, "1TIF1", "Produksjon og tenester", "Måling og toleransar", "Oppgåvehefte s. 4–7", "Torsdag", "Heimearbeid"),
    (36, "1TIF1", "Konstruksjons- og styringsteknikk", "Pneumatikk: vi koplar enkle kretsar i verkstaden", "", "", "I timen"),
    (36, "1TIF1", "Norsk", "Å skrive ein arbeidsrapport", "Lever rapport frå verkstadoppgåva", "Fredag", "Innlevering"),
    (36, "1TIF2", "Produksjon og tenester", "Sveis: kilsveis i posisjon PB", "Øv på prøvestykket", "Fredag", "Vurdering"),
    (36, "1TIF3", YFF, "Utplassering i bedrift torsdag og fredag", "Meld frå om oppmøtestad", "Onsdag", "Frist"),

    (36, "1RM", "Råvare, produksjon og kvalitet", "Fisk: filetering og kvalitet",
     "Sjå instruksjonsvideoen før timen", "Torsdag", "Heimearbeid"),
    (36, "1RM", "Bransje og arbeidsliv", "Vi lagar lunsj til personalrommet fredag", "", "", "I timen"),

    (36, "2AKV/FF", "Drift og produksjon", "Fôring og fôrfaktor", "Rekn ut fôrfaktor for merd 3", "Torsdag", "Heimearbeid"),
    (36, "2AKV/FF", "Fartøy og tryggleik", "Tryggleikskurs om bord – heile onsdagen", "", "", "Ekskursjon"),
    (36, "2KJP/RM", "Råvare, produksjon og kvalitet", "Menyplanlegging til hausten", "Lever menyforslaget", "Fredag", "Innlevering"),

    (36, "3PB1", "Historie", "Den industrielle revolusjonen", "Les s. 88–95 og svar på tre spørsmål", "Onsdag", "Heimearbeid"),
    (36, "3PB1", "Norsk", "Retorikk: vi analyserer talar i lag", "", "", "I timen"),
    (36, "3PB1", "Matematikk 2P-Y", "Prøve i økonomi", "Øv på kapittel 3", "Fredag", "Prøve"),
    (36, "3PB2", "Norsk", "Retorikk: etos, patos og logos", "Les kapittel 2", "Torsdag", "Heimearbeid"),

    (36, "Alle", "", "", "Frist for å melde seg på fagdagen om psykisk helse", "Onsdag", "Frist"),

    # ── Veke 37 ──────────────────────────────────────────────────
    (37, "1ID", "Naturfag", "Arv og miljø", "Les s. 52–60", "Torsdag", "Heimearbeid"),
    (37, "1ID", "Matematikk 1P", "Prøve i tal og prosent", "Øv på kapittel 1 og 2", "Torsdag", "Prøve"),
    (37, "1ID", "Aktivitetslære", "Vi spelar volleyball i gymsalen", "", "", "I timen"),
    (37, "1HO", "Yrkesliv i helse- og oppvekstfag", "Yrkesetikk og teieplikt", "", "", "I timen"),
    (37, "1HO", "Helsefremjande arbeid", "Ernæring og måltid", "Lag ein døgnmeny og lever i Teams", "Fredag", "Innlevering"),
    (37, "1NA", "Naturbasert aktivitet", "Vi går ut med båten tysdag", "Ta med varme klede", "", "Ekskursjon"),
    (37, "1TIF1", YFF, "Utplassering i bedrift heile onsdagen", "Meld frå til kontaktlærar", "Måndag", "Frist"),
    (37, "1RM", "Bransje og arbeidsliv", "Servering: vi øver på å ta imot gjester", "", "", "I timen"),
    (37, "2AKV/FF", "Anlegg og teknikk", "Fortøying og nøter", "Framføring av gruppeoppgåva", "Torsdag", "Framføring"),
    (37, "3PB1", "Norsk", "Tentamen i norsk hovudmål – heile dagen", "Ta med ladar til PC-en", "Måndag", "Prøve"),
    (37, "3PB2", "Samfunnskunnskap", "Sosial ulikskap i Noreg", "Finn ein artikkel og ta han med", "Torsdag", "Heimearbeid"),
    (37, "Alle", "", "", "Fagdag om psykisk helse – vanleg timeplan går ut", "Fredag", "Fagdag"),
]

# (veke, klasse, overskrift, melding)
MELDINGAR = [
    (35, "Alle", "Velkommen til eit nytt skuleår",
     "Første skuledag er måndag kl. 08.15. Ta med PC og ladar. Skulebussane går som vanleg."),
    (36, "Alle", "Foreldremøte for Vg1 torsdag",
     "Foreldremøte for alle Vg1-klassane torsdag kl. 18.00 i auditoriet. Meld frå i Visma InSchool."),
    (36, "1HO", "Utplassering tysdag og onsdag",
     "Oppmøte direkte på sjukeheimen kl. 08.00. Hugs arbeidstøy, namneskilt og matpakke."),
    (36, "1NA", "På anlegget onsdag",
     "Vi går frå kaia kl. 09.00. Flytedress og støvlar er påbode. Ta med matpakke."),
    (37, "Alle", "Fagdag fredag",
     "Fredag er det fagdag om psykisk helse for heile skulen. Vanleg timeplan går ut."),
    (37, "3PB1", "Tentamen måndag",
     "Norsktentamen måndag. Møt opp kl. 08.00 utanfor auditoriet."),
]


def demoinnhold() -> dict:
    return {
        "Uke": [list(r) for r in VEKE],
        "Beskjeder": [list(r) for r in MELDINGAR],
    }

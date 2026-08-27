"""Eksempeldata. Alle elevnavn er oppdiktede.

Bruk «python3 trafikklys.py ny --demo» for å se hvordan en utfylt bok ser ut.
Elevene, merknadene og tiltakene her er funnet på for å vise formen – ikke
noe av det gjelder virkelige personer.
"""

from __future__ import annotations

import datetime as dt

SKOLE = "Hustadvika vidaregåande skole"
SKOLEAR = "2026/2027"
SPRAK = "nynorsk"
LOGO = "profil/logo.png"
KLASSER = ["1ID", "1HO", "2AKV/FF"]

MOTER = [("1 · Haust", dt.date(2026, 9, 17)), ("2 · Før jul", dt.date(2026, 11, 26))]

ELEVAR = {
    "1ID": ["Amalie Røsberg", "Brage Settem", "Eline Vevang", "Håkon Tornes",
            "Ingrid Malmedal", "Jonas Bergset", "Kaia Sylte", "Leon Farstad",
            "Mathea Gjendem", "Noah Silseth", "Oda Hoem", "Sander Vikan"],
    "1HO": ["Andrea Lyngstad", "Emil Solheim", "Frida Oppheim", "Isak Nerland",
            "Julie Storli", "Kristian Aandahl", "Linnea Myrbø", "Marius Hjelset",
            "Nora Elvebakk", "Oliver Rakvåg", "Selma Otterlei", "Tobias Kvalvåg"],
    "2AKV/FF": ["Adrian Skotheim", "Benedikte Haukås", "Casper Rødset", "Dina Fladset",
                "Elias Vorpenes", "Hanna Bjørnerem", "Iver Sandvik", "Live Kjønnø",
                "Magnus Hasselø", "Ronja Bugge", "Simen Talberg", "Vilde Aarset"],
}

# Møte, klasse, elev, område, lys, merknad, lærar
INNMELDINGAR = [
    # ── Møte 1 ───────────────────────────────────────────────────
    ("1 · Haust", "1ID", "Brage Settem", "Frammøte", "Raudt",
     "14 timar udokumentert fråvær på seks veker, mest måndag første time.", "K. Meringdal"),
    ("1 · Haust", "1ID", "Brage Settem", "Arbeidsinnsats", "Gult",
     "Har ikkje levert dei to siste innleveringane i norsk.", "M. Sæther"),
    ("1 · Haust", "1ID", "Brage Settem", "Motivasjon", "Gult",
     "Seier sjølv at han er usikker på om han har valt rett programområde.", "K. Meringdal"),
    ("1 · Haust", "1ID", "Eline Vevang", "Fagleg utvikling", "Gult",
     "Ligg an til låg måloppnåing i matematikk. Får ikkje tid nok på prøvene.", "T. Rødal"),
    ("1 · Haust", "1ID", "Eline Vevang", "Praktiske forhold", "Gult",
     "Lang skyss, kjem 10 minutt for seint tre dagar i veka. Bussen rekk ikkje.", "K. Meringdal"),
    ("1 · Haust", "1ID", "Kaia Sylte", "Trivsel", "Raudt",
     "Sit åleine i pausane. Har sagt til meg at ho gruar seg til skulen.", "K. Meringdal"),
    ("1 · Haust", "1ID", "Kaia Sylte", "Klassemiljø", "Gult",
     "Blir ikkje plukka når klassen deler seg i grupper.", "A. Hovde"),
    ("1 · Haust", "1ID", "Leon Farstad", "Arbeidsinnsats", "Gult",
     "Gløymer bøker og utstyr. Kjem ofte utan noko å skrive med.", "T. Rødal"),
    ("1 · Haust", "1ID", "Noah Silseth", "Fagleg utvikling", "Gult",
     "Slit med lesing av lange tekstar. Bør prøvast for tilrettelegging.", "M. Sæther"),
    ("1 · Haust", "1ID", "Sander Vikan", "Frammøte", "Gult",
     "Seks einskildtimar borte, alle etter lunsj.", "K. Meringdal"),
    ("1 · Haust", "1ID", "Amalie Røsberg", "Trivsel", "Grønt",
     "Har funne seg godt til rette. Nemner det berre så det er sett etter.", "K. Meringdal"),

    ("1 · Haust", "1HO", "Emil Solheim", "Frammøte", "Raudt",
     "Har vore borte heile veke 36 og 37 utan melding.", "S. Bakken"),
    ("1 · Haust", "1HO", "Emil Solheim", "Heim og føresette", "Gult",
     "Får ikkje kontakt med føresette på telefon. Sendt melding i Visma.", "S. Bakken"),
    ("1 · Haust", "1HO", "Frida Oppheim", "Motivasjon", "Gult",
     "Seier at ho eigentleg ville på studiespesialiserande.", "S. Bakken"),
    ("1 · Haust", "1HO", "Isak Nerland", "Arbeidsinnsats", "Raudt",
     "Leverer ingenting. Sit med telefonen store delar av timen.", "R. Hoel"),
    ("1 · Haust", "1HO", "Julie Storli", "Fagleg utvikling", "Gult",
     "Fare for IV i naturfag om ho ikkje tek opp att prøva.", "R. Hoel"),
    ("1 · Haust", "1HO", "Marius Hjelset", "Klassemiljø", "Gult",
     "Høg tone mot dei andre gutane. Har snakka med han ein gong.", "S. Bakken"),
    ("1 · Haust", "1HO", "Selma Otterlei", "Praktiske forhold", "Gult",
     "Manglar arbeidstøy til praksis. Kostnaden er eit tema heime.", "S. Bakken"),

    ("1 · Haust", "2AKV/FF", "Casper Rødset", "Frammøte", "Gult",
     "Kjem for seint til første økt to–tre dagar i veka.", "J. Vollan"),
    ("1 · Haust", "2AKV/FF", "Dina Fladset", "Trivsel", "Gult",
     "Verkar sliten. Har nemnt at ho jobbar mykje ved sida av.", "J. Vollan"),
    ("1 · Haust", "2AKV/FF", "Magnus Hasselø", "Fagleg utvikling", "Raudt",
     "Manglar vurderingsgrunnlag i to programfag.", "P. Krogsæter"),
    ("1 · Haust", "2AKV/FF", "Ronja Bugge", "Motivasjon", "Gult",
     "Snakkar om å slutte etter jul. Vil helst ut i lære med ein gong.", "J. Vollan"),

    # ── Møte 2 ───────────────────────────────────────────────────
    ("2 · Før jul", "1ID", "Brage Settem", "Frammøte", "Gult",
     "Fråværet har flata ut etter avtala om måndagsoppmøte. Fem timar sidan sist.", "K. Meringdal"),
    ("2 · Før jul", "1ID", "Brage Settem", "Motivasjon", "Grønt",
     "Har bestemt seg for å halde fram. Snakkar om læreplass.", "K. Meringdal"),
    ("2 · Før jul", "1ID", "Brage Settem", "Arbeidsinnsats", "Gult",
     "Leverer no, men seint. Treng framleis påminning.", "M. Sæther"),
    ("2 · Før jul", "1ID", "Eline Vevang", "Fagleg utvikling", "Gult",
     "Betre etter utvida tid på prøvene, men framleis låg måloppnåing.", "T. Rødal"),
    ("2 · Før jul", "1ID", "Eline Vevang", "Praktiske forhold", "Grønt",
     "Ny bussavgang frå november. Kjem tidsnok no.", "K. Meringdal"),
    ("2 · Før jul", "1ID", "Kaia Sylte", "Trivsel", "Gult",
     "Har fått ein å vere saman med i pausane. Går rette vegen.", "K. Meringdal"),
    ("2 · Før jul", "1ID", "Kaia Sylte", "Klassemiljø", "Gult",
     "Fungerer betre i faste grupper enn når dei vel sjølve.", "A. Hovde"),
    ("2 · Før jul", "1ID", "Mathea Gjendem", "Frammøte", "Raudt",
     "Ny sidan sist: ni timar borte i november, ingen forklaring.", "K. Meringdal"),
    ("2 · Før jul", "1ID", "Mathea Gjendem", "Trivsel", "Gult",
     "Har trekt seg unna venninnegjengen sin.", "A. Hovde"),
    ("2 · Før jul", "1ID", "Noah Silseth", "Fagleg utvikling", "Grønt",
     "Har fått lydbøker og utvida tid. Fungerer.", "M. Sæther"),
    ("2 · Før jul", "1ID", "Sander Vikan", "Frammøte", "Grønt",
     "Ingen nye timar borte sidan møtet i september.", "K. Meringdal"),

    ("2 · Før jul", "1HO", "Emil Solheim", "Frammøte", "Raudt",
     "Framleis høgt fråvær. 21 timar totalt.", "S. Bakken"),
    ("2 · Før jul", "1HO", "Emil Solheim", "Heim og føresette", "Grønt",
     "Fekk kontakt i oktober. Møte med føresette gjennomført.", "S. Bakken"),
    ("2 · Før jul", "1HO", "Isak Nerland", "Arbeidsinnsats", "Gult",
     "Leverer att etter avtala om telefonhotell. Tre av fem siste levert.", "R. Hoel"),
    ("2 · Før jul", "1HO", "Julie Storli", "Fagleg utvikling", "Grønt",
     "Tok opp att prøva og står no i naturfag.", "R. Hoel"),
    ("2 · Før jul", "1HO", "Marius Hjelset", "Klassemiljø", "Gult",
     "Betre, men tek framleis mykje plass i verkstaden.", "S. Bakken"),
    ("2 · Før jul", "1HO", "Nora Elvebakk", "Motivasjon", "Gult",
     "Ny sidan sist: seier ho ikkje ser vitsen med fellesfaga.", "S. Bakken"),
    ("2 · Før jul", "1HO", "Selma Otterlei", "Praktiske forhold", "Grønt",
     "Arbeidstøy dekt av skulen sitt utstyrsfond.", "S. Bakken"),

    ("2 · Før jul", "2AKV/FF", "Casper Rødset", "Frammøte", "Grønt",
     "Kjem tidsnok etter samtala i oktober.", "J. Vollan"),
    ("2 · Før jul", "2AKV/FF", "Dina Fladset", "Trivsel", "Raudt",
     "Har blitt verre. Sov i timen tre gonger denne månaden.", "J. Vollan"),
    ("2 · Før jul", "2AKV/FF", "Magnus Hasselø", "Fagleg utvikling", "Gult",
     "Har levert det som mangla i eitt av dei to faga.", "P. Krogsæter"),
    ("2 · Før jul", "2AKV/FF", "Ronja Bugge", "Motivasjon", "Grønt",
     "Har fått utplassering hos ein bedrift. Blir ut skuleåret.", "J. Vollan"),
]

# Møte, klasse, elev, område, tiltak, ansvarleg, frist, status
TILTAK = [
    ("1 · Haust", "1ID", "Brage Settem", "Frammøte",
     "Fast oppmøteavtale måndag morgon, kontaktlærar tek imot ved døra i fire veker.",
     "Kontaktlærar", dt.date(2026, 10, 15), "Avslutta"),
    ("1 · Haust", "1ID", "Brage Settem", "Motivasjon",
     "Samtale med rådgivar om omval og om vegen mot læreplass.",
     "Rådgivar", dt.date(2026, 10, 10), "Avslutta"),
    ("1 · Haust", "1ID", "Kaia Sylte", "Trivsel",
     "Kontakt med helsesjukepleiar. Kontaktlærar spør korleis det går kvar fredag.",
     "Kontaktlærar", dt.date(2026, 10, 3), "Blir følgd opp"),
    ("1 · Haust", "1ID", "Eline Vevang", "Fagleg utvikling",
     "Utvida tid på prøver, og eit opplegg for rekning i studietida.",
     "Faglærar matematikk", dt.date(2026, 10, 1), "Avslutta"),
    ("1 · Haust", "1ID", "Noah Silseth", "Fagleg utvikling",
     "Kartlegging av lesing, og lydbøker i norsk og samfunnsfag.",
     "Spesialpedagogisk team", dt.date(2026, 10, 24), "Avslutta"),
    ("1 · Haust", "1HO", "Emil Solheim", "Frammøte",
     "Heimebesøk saman med rådgivar. Deretter ny plan for oppmøte.",
     "Rådgivar", dt.date(2026, 10, 8), "Vidareført"),
    ("1 · Haust", "1HO", "Isak Nerland", "Arbeidsinnsats",
     "Telefonhotell i timane, og ei innlevering om gongen med kort frist.",
     "Faglærar", dt.date(2026, 10, 17), "Avslutta"),
    ("1 · Haust", "1HO", "Selma Otterlei", "Praktiske forhold",
     "Søknad til utstyrsfondet for arbeidstøy.",
     "Kontaktlærar", dt.date(2026, 9, 30), "Avslutta"),
    ("1 · Haust", "2AKV/FF", "Magnus Hasselø", "Fagleg utvikling",
     "Plan for å ta att manglande vurderingssituasjonar, ei per veke.",
     "Faglærar programfag", dt.date(2026, 11, 20), "Pågår"),
    ("2 · Før jul", "1ID", "Mathea Gjendem", "Frammøte",
     "Samtale med eleven, deretter kontakt med føresette same veke.",
     "Kontaktlærar", dt.date(2026, 12, 5), "Ikkje starta"),
    ("2 · Før jul", "1ID", "Kaia Sylte", "Trivsel",
     "Held fram med faste grupper i alle fag ut skuleåret.",
     "Alle faglærarar", dt.date(2027, 1, 15), "Pågår"),
    ("2 · Før jul", "1HO", "Emil Solheim", "Frammøte",
     "Tverrfagleg møte med oppfølgingstenesta før jul.",
     "Rådgivar", dt.date(2026, 12, 12), "Ikkje starta"),
    ("2 · Før jul", "1HO", "Nora Elvebakk", "Motivasjon",
     "Yrkesretting av fellesfaga: matematikk med døme frå helsefag.",
     "Faglærar matematikk", dt.date(2027, 1, 20), "Ikkje starta"),
    ("2 · Før jul", "2AKV/FF", "Dina Fladset", "Trivsel",
     "Samtale om arbeidsmengd ved sida av skulen. Kontakt med helsesjukepleiar.",
     "Kontaktlærar", dt.date(2026, 12, 10), "Pågår"),
]


def innmeldingar() -> list[tuple]:
    return [list(rad) for rad in INNMELDINGAR]


def tiltak() -> list[tuple]:
    return [list(rad) for rad in TILTAK]

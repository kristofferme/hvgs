"""Et ferdig utfylt eksempel: fire klasser og tre uker på en oppdiktet ungdomsskole."""

from __future__ import annotations

OKTER = ["08:30–09:30", "09:40–10:40", "11:10–12:10", "12:20–13:20", "13:30–14:15"]

# Fast timeplan per klasse: fem dager à fem økter. Tom streng = fri økt.
TIMEPLAN = {
    "8A": {
        "Mandag":  ["Norsk", "Norsk", "Matematikk", "Naturfag", "Valgfag"],
        "Tirsdag": ["Engelsk", "Matematikk", "Kroppsøving", "Samfunnsfag", ""],
        "Onsdag":  ["Naturfag", "Norsk", "Mat og helse", "Mat og helse", ""],
        "Torsdag": ["Matematikk", "Engelsk", "KRLE", "Musikk", "Valgfag"],
        "Fredag":  ["Norsk", "Samfunnsfag", "Matematikk", "Kunst og håndverk", "Kunst og håndverk"],
    },
    "8B": {
        "Mandag":  ["Matematikk", "Naturfag", "Norsk", "Norsk", "Valgfag"],
        "Tirsdag": ["Kroppsøving", "Engelsk", "Matematikk", "Samfunnsfag", ""],
        "Onsdag":  ["Norsk", "Naturfag", "Kunst og håndverk", "Kunst og håndverk", ""],
        "Torsdag": ["Engelsk", "Matematikk", "Musikk", "KRLE", "Valgfag"],
        "Fredag":  ["Samfunnsfag", "Norsk", "Matematikk", "Mat og helse", "Mat og helse"],
    },
    "9A": {
        "Mandag":  ["Samfunnsfag", "Matematikk", "Engelsk", "Norsk", "Valgfag"],
        "Tirsdag": ["Norsk", "Naturfag", "Naturfag", "Tysk", ""],
        "Onsdag":  ["Matematikk", "Kroppsøving", "Norsk", "KRLE", "Valgfag"],
        "Torsdag": ["Engelsk", "Tysk", "Matematikk", "Kunst og håndverk", "Kunst og håndverk"],
        "Fredag":  ["Naturfag", "Norsk", "Samfunnsfag", "Musikk", ""],
    },
    "10B": {
        "Mandag":  ["Matematikk", "Norsk", "Tysk", "Naturfag", ""],
        "Tirsdag": ["Norsk", "Engelsk", "Samfunnsfag", "Matematikk", "Valgfag"],
        "Onsdag":  ["Naturfag", "Matematikk", "Kroppsøving", "Norsk", ""],
        "Torsdag": ["Engelsk", "KRLE", "Norsk", "Tysk", "Valgfag"],
        "Fredag":  ["Matematikk", "Samfunnsfag", "Musikk", "Naturfag", ""],
    },
}

LARER = {
    "Norsk": "KM", "Matematikk": "AT", "Engelsk": "SB", "Samfunnsfag": "PH", "KRLE": "PH",
    "Tysk": "SB", "Valgfag": "MR", "Kroppsøving": "MR", "Mat og helse": "IL",
    "Kunst og håndverk": "EV", "Naturfag": "IL", "Musikk": "EV",
}

# (uke, klasse, dag, fag, tema, lekse, frist, type)
UKE = [
    (35, "8A", "Mandag", "Norsk", "Oppstart: vi blir kjent med Kontekst", "Bla gjennom kapittel 1", "Onsdag", ""),
    (35, "8A", "Onsdag", "Naturfag", "Sikkerhet på naturfagrommet", "", "", "Info"),
    (35, "8A", "Fredag", "Matematikk", "Repetisjon: de fire regneartene", "Oppgave 1.1–1.12", "Fredag", ""),
    (35, "8B", "Mandag", "Matematikk", "Repetisjon: de fire regneartene", "Oppgave 1.1–1.12", "Onsdag", ""),
    (35, "9A", "Tirsdag", "Naturfag", "Vi starter med elektrisitet", "Les s. 60–66", "Torsdag", ""),
    (35, "10B", "Tirsdag", "Norsk", "Skriveramme: argumenterende tekst", "Velg tema til teksten", "Torsdag", ""),

    (36, "8A", "Mandag", "Norsk", "Nynorsk: samansette ord og orddeling", "Les s. 40–44 i Kontekst. Skriv fem setningar med samansette ord.", "Onsdag", ""),
    (36, "8A", "Mandag", "Matematikk", "Brøk: utviding og forkorting", "Oppgave 2.14–2.22", "Tirsdag", ""),
    (36, "8A", "Tirsdag", "Engelsk", "Australia: reading and vocabulary", "Glosetest torsdag – 20 ord fra kapittel 3", "Torsdag", "Prøve"),
    (36, "8A", "Onsdag", "Naturfag", "Cellen: bygning og deler", "Tegn en dyrecelle med navn på delene", "Fredag", ""),
    (36, "8A", "Onsdag", "Mat og helse", "Vi baker grovbrød – husk forkle", "", "", "Info"),
    (36, "8A", "Torsdag", "KRLE", "Buddhismen: de fire edle sannheter", "", "", ""),
    (36, "8A", "Fredag", "Matematikk", "Prøve i brøk og prosent", "Øv på oppgavene fra kapittel 2", "Fredag", "Prøve"),
    (36, "8A", "Fredag", "Kunst og håndverk", "Vi fortsetter med trearbeid", "", "", ""),
    (36, "8B", "Mandag", "Matematikk", "Brøk: utviding og forkorting", "Oppgave 2.14–2.22", "Tirsdag", ""),
    (36, "8B", "Tirsdag", "Kroppsøving", "Friidrett ute – kle deg etter været", "", "", "Info"),
    (36, "8B", "Onsdag", "Norsk", "Nynorsk: samansette ord", "Les s. 40–44 i Kontekst", "Fredag", ""),
    (36, "8B", "Fredag", "Samfunnsfag", "Innleveringsfrist: kildekritikk", "Lever oppgaven i Teams før kl. 15", "Fredag", "Innlevering"),
    (36, "9A", "Mandag", "Samfunnsfag", "Den industrielle revolusjonen", "Les s. 88–95 og svar på tre spørsmål", "Onsdag", ""),
    (36, "9A", "Tirsdag", "Naturfag", "Forsøk: elektrisitet og kretser", "Skriv rapport fra forsøket", "Torsdag", ""),
    (36, "9A", "Torsdag", "Kunst og håndverk", "Ekskursjon til kunstmuseet – vi går kl. 12.00", "Ta med matpakke", "Torsdag", "Tur"),
    (36, "9A", "Fredag", "Norsk", "Novelleanalyse: virkemidler", "Les novellen «Karen» og noter virkemidler", "Fredag", ""),
    (36, "10B", "Mandag", "Matematikk", "Funksjoner: lineære sammenhenger", "Oppgave 5.30–5.40", "Onsdag", ""),
    (36, "10B", "Tirsdag", "Norsk", "Skriveøkt: argumenterende tekst", "Førsteutkast leveres i Teams", "Torsdag", "Innlevering"),
    (36, "10B", "Torsdag", "Engelsk", "Oral presentations: prepare in pairs", "Øv på framføringen hjemme", "Fredag", ""),
    (36, "10B", "Fredag", "Naturfag", "Repetisjon før tentamen", "", "", ""),
    (36, "Alle", "Onsdag", "Valgfag", "", "Frist for å melde seg på turneringen", "Onsdag", "Frist"),

    (37, "8A", "Mandag", "Norsk", "Vi skriver forteljing", "Skriv ferdig utkastet", "Torsdag", ""),
    (37, "8A", "Tirsdag", "Samfunnsfag", "Demokrati: hvem bestemmer i Norge?", "Les s. 22–29", "Torsdag", ""),
    (37, "8A", "Torsdag", "Musikk", "Vi øver til høstkonserten", "", "", "Info"),
    (37, "8B", "Torsdag", "Engelsk", "Presentations: my hometown", "Framføring torsdag", "Torsdag", "Vurdering"),
    (37, "9A", "Onsdag", "Matematikk", "Prøve i likninger", "Øv på kapittel 3", "Onsdag", "Prøve"),
    (37, "10B", "Mandag", "Matematikk", "Tentamen – hele dagen", "Ta med kalkulator og linjal", "Mandag", "Prøve"),
    (37, "Alle", "Fredag", "", "", "Skolen slutter kl. 12.00 – planleggingsdag", "Fredag", "Info"),
]

# (uke, klasse, overskrift, beskjed)
BESKJEDER = [
    (35, "Alle", "Velkommen til et nytt skoleår", "Første skoledag er mandag kl. 08.30. Ta med skrivesaker og matpakke."),
    (36, "Alle", "Foreldremøte torsdag", "Foreldremøte for hele trinnet torsdag kl. 18.00 i aulaen. Meld fra i Vigilo om dere kommer."),
    (36, "8A", "Ny mattelærer fra mandag", "Anders tar over mattetimene ut skoleåret. Han treffes på e-post og i Vigilo."),
    (36, "9A", "Museumstur torsdag", "Vi går fra skolen kl. 12.00 og er tilbake til siste time. Ta med matpakke og drikke."),
    (37, "Alle", "Planleggingsdag fredag", "Skolen slutter kl. 12.00 på fredag. SFO holder åpent som vanlig."),
    (37, "10B", "Tentamen mandag", "Norsktentamen mandag. Møt opp kl. 08.15 utenfor rom 305."),
]


def laererrader() -> list[list]:
    """Alle klassene har de samme lærerne i demoen, så «Alle» holder."""
    return [["Alle", fag, laerer] for fag, laerer in LARER.items()]


def demoinnhold() -> dict:
    return {
        "Uke": [list(r) for r in UKE],
        "Beskjeder": [list(r) for r in BESKJEDER],
        "Lærere": laererrader(),
    }


KLASSER = list(TIMEPLAN.keys())
SKOLE = "Bjørkeli ungdomsskole"

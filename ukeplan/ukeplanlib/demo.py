"""Et ferdig utfylt eksempel: fire klasser på en oppdiktet ungdomsskole."""

from __future__ import annotations

OKTER = [("08:30", "09:30"), ("09:40", "10:40"), ("11:10", "12:10"), ("12:20", "13:20"), ("13:30", "14:15")]

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

ROM = {
    "8A": "214", "8B": "216", "9A": "301", "10B": "305",
    "Kroppsøving": "Gymsal", "Mat og helse": "Kjøkken", "Kunst og håndverk": "K&H",
    "Naturfag": "Naturfagrom", "Musikk": "Musikkrom",
}
LARER = {
    "Norsk": "KM", "Matematikk": "AT", "Engelsk": "SB", "Naturfag": "IL", "Samfunnsfag": "PH",
    "KRLE": "PH", "Kroppsøving": "MR", "Musikk": "EV", "Kunst og håndverk": "EV",
    "Mat og helse": "IL", "Tysk": "SB", "Valgfag": "MR",
}

UKE = [
    ("8A", "Mandag", "Norsk", "Nynorsk: samansette ord og orddeling", "Les s. 40–44 i Kontekst. Skriv fem setningar med samansette ord.", "Onsdag", ""),
    ("8A", "Mandag", "Matematikk", "Brøk: utviding og forkorting", "Oppgave 2.14–2.22", "Tirsdag", ""),
    ("8A", "Tirsdag", "Engelsk", "Australia: reading and vocabulary", "Glosetest torsdag – 20 ord fra kapittel 3", "Torsdag", "Prøve"),
    ("8A", "Onsdag", "Naturfag", "Cellen: bygning og deler", "Tegn en dyrecelle med navn på delene", "Fredag", ""),
    ("8A", "Onsdag", "Mat og helse", "Vi baker grovbrød – husk forkle", "", "", "Info"),
    ("8A", "Torsdag", "KRLE", "Buddhismen: de fire edle sannheter", "", "", ""),
    ("8A", "Fredag", "Matematikk", "Prøve i brøk og prosent", "Øv på oppgavene fra kapittel 2", "Fredag", "Prøve"),
    ("8A", "Fredag", "Kunst og håndverk", "Vi fortsetter med trearbeid", "", "", ""),
    ("8B", "Mandag", "Matematikk", "Brøk: utviding og forkorting", "Oppgave 2.14–2.22", "Tirsdag", ""),
    ("8B", "Tirsdag", "Kroppsøving", "Friidrett ute – kle deg etter været", "", "", "Info"),
    ("8B", "Onsdag", "Norsk", "Nynorsk: samansette ord", "Les s. 40–44 i Kontekst", "Fredag", ""),
    ("8B", "Fredag", "Samfunnsfag", "Innleveringsfrist: kildekritikk", "Lever oppgaven i Teams før kl. 15", "Fredag", "Innlevering"),
    ("9A", "Mandag", "Samfunnsfag", "Den industrielle revolusjonen", "Les s. 88–95 og svar på tre spørsmål", "Onsdag", ""),
    ("9A", "Tirsdag", "Naturfag", "Forsøk: elektrisitet og kretser", "Skriv rapport fra forsøket", "Torsdag", ""),
    ("9A", "Torsdag", "Kunst og håndverk", "Ekskursjon til kunstmuseet – vi går kl. 12.00", "Ta med matpakke", "Torsdag", "Tur"),
    ("9A", "Fredag", "Norsk", "Novelleanalyse: virkemidler", "Les novellen «Karen» og noter virkemidler", "Fredag", ""),
    ("10B", "Mandag", "Matematikk", "Funksjoner: lineære sammenhenger", "Oppgave 5.30–5.40", "Onsdag", ""),
    ("10B", "Tirsdag", "Norsk", "Skriveøkt: argumenterende tekst", "Førsteutkast leveres i Teams", "Torsdag", "Innlevering"),
    ("10B", "Torsdag", "Engelsk", "Oral presentations: prepare in pairs", "Øv på framføringen hjemme", "Fredag", ""),
    ("10B", "Fredag", "Naturfag", "Repetisjon før tentamen", "", "", ""),
    ("Alle", "Onsdag", "Valgfag", "", "Frist for å melde seg på turneringen", "Onsdag", "Frist"),
]

BESKJEDER = [
    ("Alle", "Foreldremøte torsdag", "Foreldremøte for hele trinnet torsdag kl. 18.00 i aulaen. Meld fra i Vigilo om dere kommer."),
    ("8A", "Ny mattelærer fra mandag", "Anders tar over mattetimene ut skoleåret. Han treffes på e-post og i Vigilo."),
    ("9A", "Museumstur torsdag", "Vi går fra skolen kl. 12.00 og er tilbake til siste time. Ta med matpakke og drikke."),
]


def demoinnhold() -> dict:
    timeplan = []
    for klasse, dager in TIMEPLAN.items():
        for dag, fagene in dager.items():
            for i, fag in enumerate(fagene):
                if not fag:
                    continue
                start, slutt = OKTER[i]
                timeplan.append([klasse, dag, start, slutt, fag, ROM.get(fag, ROM[klasse]), LARER.get(fag, "")])
    return {
        "Timeplan": timeplan,
        "Uke": [list(r) for r in UKE],
        "Beskjeder": [list(r) for r in BESKJEDER],
    }


KLASSER = list(TIMEPLAN.keys())
SKOLE = "Bjørkeli ungdomsskole"

# Ukeplan

Lag ukeplanen i Excel. Del den som en nettside.

Læreren jobber der læreren allerede jobber – i et regneark med nedtrekkslister
for klasse, dag og fag. Én kommando gjør regnearket om til én HTML-fil som
elever og foresatte kan åpne på telefonen, velge klasse i, og skrive ut.

```
python3 ukeplan.py ny --demo     # arbeidsbok med et ferdig eksempel
python3 ukeplan.py bygg          # Ukeplan.xlsx  →  ukeplan.html
```

Første gang: `pip install -r krav.txt` (openpyxl er det eneste som trengs).

## Slik henger det sammen

**Oppsett** – skole, ukenummer, mandagsdato. Klassene og fagene dine står i to
kolonner her, og det er dem nedtrekkslistene i resten av boka henter fra. Legger
du til et fag, får det farge automatisk.

**Timeplan** – den faste timeplanen: klasse, dag, start, slutt, fag, rom, lærer.
Denne fyller du ut én gang. Den gjelder uke etter uke.

**Uke** – det som er nytt denne uka: tema, lekse, frist og type (prøve,
innlevering, tur, info). Raden festes til riktig time når klasse, dag og fag
stemmer med timeplanen. Har klassen to mattetimer på mandag, får de hver sin
rad. Står det «Alle» i klassefeltet, gjelder raden hele trinnet.

**Beskjeder** – korte meldinger hjem, per klasse eller til alle.

Alle nedtrekkslistene godtar at du skriver fritt også – Excel maser ikke. Er det
noe som ikke henger sammen, sier `python3 ukeplan.py sjekk` fra:

```
Uke rad 12: fant ingen Naturfag-time onsdag for 8A.
            Innholdet vises som eget kort den dagen.
```

## Nettsiden

Én fil, ingenting utenfor den – skriftene ligger inne i fila, så siden ser lik
ut på skolens nett, på mobilen og uten nett i det hele tatt.

- Klassen velges med ett klikk, og huskes til neste gang. `ukeplan.html?klasse=8A`
  åpner rett i riktig klasse – nyttig når du sender lenka til én gruppe.
- Fagfilteret demper resten i stedet for å fjerne det, så uka beholder formen.
- Dagen i dag er markert, timen som pågår er ringet inn med «nå», og timer som
  er ferdige, tones ned.
- Lekser og frister samles i «Å gjøre denne uka», sortert etter frist.
- «Skriv ut» gir uka på ett A4-ark i liggende format – klar for kjøleskapet.
- Mørk modus følger telefonen. Bevegelse skrus av for den som har bedt om det.

## Legg den ut

HTML-fila er selvstendig, så den kan legges hvor som helst:

```
python3 ukeplan.py bygg --ut ../static/ukeplan.html   # publiseres med resten av nettstedet
python3 ukeplan.py bygg --ut ~/Nettsted/uke36.html    # eller hvor du vil
```

Legg den i en mappe som allerede publiseres (Netlify, GitHub Pages, skolens
egen webserver), eller send fila som vedlegg. Den virker like godt begge veier.

## Kommandoer

| Kommando | Gjør |
| --- | --- |
| `ukeplan.py ny` | ny, tom arbeidsbok |
| `ukeplan.py ny --demo` | ferdig utfylt eksempel med fire klasser |
| `ukeplan.py ny --skole "Sjøholt skule" --uke 41` | med skolenavn og uke satt |
| `ukeplan.py bygg` | leser arbeidsboka, skriver nettsiden |
| `ukeplan.py bygg --fil X.xlsx --ut Y.html` | andre filnavn |
| `ukeplan.py sjekk` | leter etter skrivefeil og rader som ikke henger sammen |

## Filene

```
ukeplan.py            kommandolinja
ukeplanlib/felles.py  dager, fagfarger, tolking av det som står i cellene
ukeplanlib/regneark.py lager arbeidsboka
ukeplanlib/les.py     leser arbeidsboka og setter sammen uka
ukeplanlib/bygg.py    fyller malen
ukeplanlib/demo.py    eksempeldataene
mal/side.html         nettsiden – utseende og oppførsel
mal/fonter.css        skriftene, lagt inn som data-URI
verktoy/hent_fonter.py henter skriftene på nytt hvis skriftvalget endres
eksempel/             ferdig arbeidsbok og ferdig nettside
```

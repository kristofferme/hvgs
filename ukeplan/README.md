# Ukeplan

Lag ukeplanene i Excel. Del dem som én nettside.

Læreren jobber der læreren allerede jobber – i et regneark med nedtrekkslister
for klasse, dag og fag. Én kommando gjør regnearket om til én HTML-fil der
elever og foresatte velger klasse, blar mellom ukene, og skriver ut.

```
python3 ukeplan.py ny --demo     # arbeidsbok med et ferdig eksempel
python3 ukeplan.py bygg          # Ukeplan.xlsx  →  ukeplan.html
```

Første gang: `pip install -r krav.txt` (openpyxl er det eneste som trengs).

## Arkene

**Oppsett** – skole, ukenummer og mandagsdato. Klassene står i én kolonne,
fagene i en annen, og det er dem nedtrekkslistene i resten av boka henter fra.
Legger du til et fag, får det farge automatisk. Ukenummeret her er uka
nettsiden åpner på.

**Timeplan** – ett rutenett per klasse: klokkeslett nedover, dager bortover,
med klassenavnet i en svart bjelke over hvert rutenett. Du velger fag i
cellene fra nedtrekkslista, og de farges mens du skriver. Timeplanen fylles ut
én gang og gjentas i alle uker.

**Lærere** – hvilken lærer et fag har i en klasse. Valgfritt, og fylles ut én
gang. «Alle» i klassefeltet gjelder alle klassene.

**Uke** – det som er nytt: tema, lekse, frist og type (prøve, innlevering, tur,
info). Første kolonne er et nedtrekk med uke og datoer – «36 · 31. aug – 4. sep
2026» – så du slipper å telle uker. Står den tom, havner raden i uka fra
Oppsett. Én arbeidsbok tar hele skoleåret: filtrer på Uke-kolonnen når du vil
se én uke om gangen. Det er en tykk strek mellom ukene, hver klasse har sin
egen tone, og en tynn strek der klassen bytter.

Raden festes til riktig time når klasse, dag og fag stemmer med timeplanen.
Har klassen to mattetimer på mandag, får de hver sin rad.

**Beskjeder** – korte meldinger hjem, med samme ukevalg. «Alle» går til alle.

Alle nedtrekkslistene godtar at du skriver fritt også – Excel maser ikke. Er
det noe som ikke henger sammen, sier `python3 ukeplan.py sjekk` fra:

```
Uke rad 12: fant ingen Naturfag-time onsdag for 8A.
            Innholdet vises som eget kort den dagen.
Uke rad 41: uke 99 finnes ikke. Raden havner i uke 36.
```

## Nettsiden

Én fil med alle ukene, og ingenting utenfor den – skriftene ligger inne i fila,
så siden ser lik ut på skolens nett, på mobilen og uten nett i det hele tatt.

- **Klasse** velges med ett klikk og huskes til neste gang.
  `ukeplan.html?klasse=8A&uke=36` åpner rett i riktig klasse og uke.
- **Bla mellom ukene** med pilene ved ukenummeret, piltastene ← og →, eller ved
  å sveipe på telefonen. Siden åpner på uka vi er i nå, og «Tilbake til denne
  uka» dukker opp når du har bladd deg vekk.
- **Lys eller mørk** følger telefonen, men knappen overstyrer og valget huskes.
- **Fagfilteret** demper resten i stedet for å fjerne det, så uka beholder
  formen. «Skjul alle» tømmer uka, så du kan hake inn det ene faget du er ute
  etter.
- **Timeplanen viser hva som skjer**: klokkeslett, fag, lærer og tema. Dagen i
  dag er markert, og timen som pågår er ringet inn med «nå».
- **«Å gjøre denne uka» viser hva som skal gjøres**: alle lekser og frister,
  gruppert under den dagen de skal være ferdige til. Tallet i daghodet sier hvor
  mange frister dagen har – klikk på det for å hoppe rett ned til dem.
- «Skriv ut» gir uka på ett A4-ark i liggende format – klar for kjøleskapet.
- Bevegelse skrus av for den som har bedt om det.

## Legg den ut

HTML-fila er selvstendig, så den kan legges hvor som helst:

```
python3 ukeplan.py bygg --ut ../static/ukeplan.html   # publiseres med resten av nettstedet
python3 ukeplan.py bygg --ut ~/Nettsted/ukeplan.html  # eller hvor du vil
```

Legg den i en mappe som allerede publiseres (Netlify, GitHub Pages, skolens
egen webserver), eller send fila som vedlegg. Den virker like godt begge veier.

## Kommandoer

| Kommando | Gjør |
| --- | --- |
| `ukeplan.py ny` | ny, tom arbeidsbok |
| `ukeplan.py ny --demo` | ferdig utfylt eksempel: fire klasser, tre uker |
| `ukeplan.py ny --skole "Sjøholt skule" --uke 41` | med skolenavn og uke satt |
| `ukeplan.py bygg` | leser arbeidsboka, skriver nettsiden |
| `ukeplan.py bygg --fil X.xlsx --ut Y.html` | andre filnavn |
| `ukeplan.py sjekk` | leter etter skrivefeil og rader som ikke henger sammen |

## Filene

```
ukeplan.py             kommandolinja
ukeplanlib/felles.py   dager, fagfarger, tolking av det som står i cellene
ukeplanlib/regneark.py lager arbeidsboka
ukeplanlib/les.py      leser arbeidsboka og setter sammen hver uke
ukeplanlib/bygg.py     fyller malen
ukeplanlib/demo.py     eksempeldataene
mal/side.html          nettsiden – utseende og oppførsel
mal/fonter.css         skriftene, lagt inn som data-URI
verktoy/hent_fonter.py henter skriftene på nytt hvis skriftvalget endres
eksempel/              ferdig arbeidsbok og ferdig nettside
```

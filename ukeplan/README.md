# Vekeplan

Læreren fyller ut én tabell i Excel. Elevene får én nettside de kan huke av i.

Satt opp for **Hustadvika vidaregåande skole**: nynorsk, videregående klasser og
fag, og skolens profilfarge og logo. Alt sammen står i Oppsett og kan byttes.

```
python3 ukeplan.py ny --demo     # arbeidsbok med et ferdig eksempel
python3 ukeplan.py følg          # bygger nettsiden hver gang du lagrer
```

Første gang: `pip install -r krav.txt` (openpyxl er det eneste som trengs).

Timeplanen med klokkeslett er med vilje ikke med – den har elevene i InSchool.
Dette er arbeidsplanen: hva vi jobber med, hva som skal gjøres, og når.

## Arbeidsboka

Fire ark, og bare to av dem er til daglig bruk.

**Uke** – én rad per ting du vil ha ut:

| Uke | Klasse | Fag | Vi jobber med | Å gjøre | Frist | Type |
| --- | --- | --- | --- | --- | --- | --- |
| 36 · 31. aug – 4. sep | 1STA | Norsk | Argumenterande tekst | Skriv utkast i Teams | Torsdag | |
| 36 · 31. aug – 4. sep | 1STA | Norsk | | Lever teksten i Teams | Fredag | Innlevering |

Alle kolonnene bortsett fra de to tekstfeltene har nedtrekksliste. Uke-lista
viser både nummer og datoer, så du slipper å telle. Skriver du to rader i samme
fag, havner begge på samme kort på nettsiden – «Vi jobber med» øverst, punktene
under. «Alle» i klassefeltet gjelder alle klassene. Frist er valgfri.

**Beskjeder** – korte meldinger hjem, med samme ukevalg.

**Oppsett** – skole, ukenummer, mandagsdato, klasser og fag. Her står også de
tre feltene som gjør planen til skolens egen:

| Felt | Hva det gjør |
| --- | --- |
| Språk | `bokmål` eller `nynorsk`. Styrer både arkene og nettsiden. |
| Profilfarge | Hex-koden til skolens farge, f.eks. `#0093C9`. Brukes på haker, framdrift og klassen i overskriften – og lysnes automatisk i mørk modus. |
| Logo | Filnavn, f.eks. `profil/logo.png`. Legges inn i HTML-fila som en del av den, så siden virker uten nett. |

**Start her** – oppskriften, i arbeidsboka.

Én arbeidsbok tar hele skoleåret. Klikk på filterpila i Uke-kolonnen når du vil
se én uke om gangen; det er en tykk strek mellom ukene og en egen tone per
klasse. Skal du gjenta noe fra forrige uke, kopierer du radene og bytter uke i
nedtrekket.

Er det noe som ikke henger sammen, sier `python3 ukeplan.py sjekk` fra:

```
Uke rad 12: faget «Naturfg» sto ikke i Oppsett. Det er lagt til.
Uke rad 41: uke 99 finnes ikke. Raden havner i uke 36.
```

## Nettsiden

Én fil med alle ukene, og ingenting utenfor den – skriftene ligger inne i fila,
så siden ser lik ut på skolens nett, på mobilen og uten nett i det hele tatt.

- **Ett kort per fag.** «Vi jobber med» øverst, punktene under, med frist og
  eventuelt merke (prøve, innlevering, utplassering, fagdag).
- **Elevene huker av.** Haken ligger i elevens egen nettleser – ingen
  innlogging, ingen personopplysninger, og læreren ser den ikke. Framdriften
  vises som «3 av 7 gjort» øverst.
- **Etter fag eller etter frist.** Samme punkter, to grupperinger, ett klikk.
  Valget huskes.
- **Klasse** velges med ett klikk og huskes. `ukeplan.html?klasse=1STA&uke=36`
  åpner rett i riktig klasse og uke – nyttig som fane i Teams.
- **Bla mellom ukene** med pilene, piltastene ← og →, eller sveip på telefonen.
  Siden åpner på uka vi er i nå.
- **Lys eller mørk** følger telefonen, men knappen overstyrer og valget huskes.
- **Skriv ut** gir arbeidsplanen på A4 med tomme avkryssingsbokser.

## Legg den ut

HTML-fila er selvstendig, så den kan legges hvor som helst:

```
python3 ukeplan.py bygg --ut ../static/ukeplan.html   # publiseres med resten av nettstedet
python3 ukeplan.py følg --ut ~/Nettsted/ukeplan.html  # bygger dit hver gang du lagrer
```

Legg den i en mappe som allerede publiseres (skolens nettsted, Netlify, GitHub
Pages), og legg adressen inn som en **Nettsted-fane** i klasseteamet i Teams –
én fane per klasse med `?klasse=…` i lenka. Da er lenka den samme hele året;
du overskriver bare fila.

## Kommandoer

| Kommando | Gjør |
| --- | --- |
| `ukeplan.py ny` | ny, tom arbeidsbok |
| `ukeplan.py ny --demo` | ferdig utfylt eksempel: seks klasser, tre uker |
| `ukeplan.py ny --sprak nynorsk` | arbeidsbok og nettside på nynorsk |
| `ukeplan.py følg` | bygger nettsiden hver gang arbeidsboka lagres |
| `ukeplan.py bygg` | bygger én gang |
| `ukeplan.py sjekk` | leter etter skrivefeil og rader som ikke henger sammen |

## Filene

```
ukeplan.py             kommandolinja
ukeplanlib/felles.py   dager, fagfarger, målform, tolking av det som står i cellene
ukeplanlib/regneark.py lager arbeidsboka
ukeplanlib/les.py      leser arbeidsboka og setter sammen hver uke
ukeplanlib/bygg.py     fyller malen og legger inn logoen
ukeplanlib/demo.py     eksempeldataene
mal/side.html          nettsiden – utseende og oppførsel
mal/fonter.css         skriftene, lagt inn som data-URI
verktoy/hent_fonter.py henter skriftene på nytt hvis skriftvalget endres
profil/                skolens logo
eksempel/              ferdig arbeidsbok og ferdig nettside
```

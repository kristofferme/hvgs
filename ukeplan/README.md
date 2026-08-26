# Vekeplan

Læreren fyller ut én tabell i Excel. Elevene får én nettside de kan huke av i.

Satt opp for **Hustadvika vidaregåande skole**: nynorsk, skolens egne klasser
(1ID, 1HO, 1NA, 1RM, 1TIF1–3, 2AKV/FF, 2KJP/AR, 2KJP/RM, 3PB1, 3PB2) med fag
per klasse, og skolens profilfarge og logo. Alt sammen står i arkene og kan
byttes. Faglistene for 2KJP/AR og 2KJP/RM har programfag som må rettes til de
faktiske faga.

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

**Type** sier hva slags punkt det er – alt er ikke lekse:

| Type | På nettsiden |
| --- | --- |
| *tom* eller Hjemmearbeid | Vanlig punkt med avkryssingsboks |
| Innlevering, Prøve, Vurdering, Framføring, Frist | Avkryssingsboks, rødt merke, og telles i «denne uka»-stripa |
| I timen, Ekskursjon, Utplassering, Fagdag, Info | Ingen boks – dette gjør dere i lag. Vises med strek foran og et rolig merke |

**Fag per klasse** – én kolonne per klasse med fagene klassen har. Fyller du ut
denne, viser Fag-nedtrekket bare klassens egne fag når du har valgt klasse, og
kortene på nettsiden kommer i den rekkefølgen du har satt dem opp. Lar du en
klasse stå tom, får du hele faglista.

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

- **Ett kort per fag**, med fagets farge i toppbandet og antall punkt som står
  igjen. «Vi jobber med» øverst, punktene under, med frist og merke.
- **En stripe over planen** viser hva som skiller seg ut denne uka:
  «1 Innlevering · 1 Vurdering · 1 Ekskursjon».
- **Elevene huker av** det de skal gjøre selv. Haken ligger i elevens egen
  nettleser – ingen innlogging, ingen personopplysninger, og læreren ser den
  ikke. Framdriften vises som «3 av 7 gjort», og blir til «Alt gjort denne uka»
  når siste hake er satt. Punkter merket «I timen» teller ikke med.
- **Etter fag eller etter frist.** Samme punkter, to grupperinger, ett klikk.
  Valget huskes.
- **Klasse** velges med ett klikk og huskes. `ukeplan.html?klasse=1STA&uke=36`
  åpner rett i riktig klasse og uke – nyttig som fane i Teams.
- **Bla mellom ukene** med pilene, piltastene ← og →, eller sveip på telefonen.
  Siden åpner på uka vi er i nå.
- **Lys eller mørk** følger telefonen, men knappen overstyrer og valget huskes.
- **Skriv ut** gir arbeidsplanen på A4 med tomme avkryssingsbokser.

## Legg den ut

Netlify-prosjektet **`hvgs-vekeplan`** er opprettet og venter på første deploy:
https://app.netlify.com/projects/hvgs-vekeplan → adressen blir
**https://hvgs-vekeplan.netlify.app**. Den adressen er den samme hele året; du
overskriver bare innholdet.

### Koble til GitHub (gjøres én gang)

Dette er den varige løsningen: du laster opp en ny `Ukeplan.xlsx`, og planen
oppdaterer seg selv.

1. Åpne https://app.netlify.com/projects/hvgs-vekeplan
2. Project configuration → Build & deploy → **Link repository** →
   `kristofferme/hvgs`
3. **Base directory: `ukeplan`** – det eneste feltet du må fylle ut.
   Byggekommando og publiseringsmappe leses fra `ukeplan/netlify.toml`.
4. **Branch to deploy:** `claude/ukeplaner-excel-html-w4xmxs`, eller `master`
   når greina er flettet inn.

Netlify installerer openpyxl, kjører `ukeplan.py bygg` på `Ukeplan.xlsx` og
publiserer mappa `publisert`. Etterpå holder det å legge en ny arbeidsbok i
repoet – i GitHub: Add file → Upload files → dra inn `Ukeplan.xlsx` → Commit.
Planen er ute omtrent ett minutt seinere. Ingen terminal.

### Eller fra terminalen

```
python3 ukeplan.py publiser
```

Bygger og legger ut i én kommando. Første gang: `npx netlify-cli login`.

### Eller dra og slipp

`python3 ukeplan.py bygg --ut publisert/index.html` og dra mappa `publisert`
inn i Deploys-fanen på Netlify.

### Lenker til Teams

Kortlenke per klasse, klar til å limes inn som **Nettsted-fane** i
klasseteamet:

```
https://hvgs-vekeplan.netlify.app/1ID
https://hvgs-vekeplan.netlify.app/1HO
https://hvgs-vekeplan.netlify.app/?klasse=2AKV/FF    ← klasser med skråstrek
```

Fanen åpner rett i riktig klasse og på uka vi er i nå.

### Mens du jobber

`python3 ukeplan.py følg` bygger `ukeplan.html` lokalt hvert lagre, så du ser
resultatet før du legger det ut.

## Kommandoer

| Kommando | Gjør |
| --- | --- |
| `ukeplan.py ny` | ny, tom arbeidsbok |
| `ukeplan.py ny --demo` | ferdig utfylt eksempel: tolv klasser, tre uker |
| `ukeplan.py ny --sprak nynorsk` | arbeidsbok og nettside på nynorsk |
| `ukeplan.py følg` | bygger nettsiden hver gang arbeidsboka lagres |
| `ukeplan.py bygg` | bygger én gang |
| `ukeplan.py publiser` | bygger og legger ut på Netlify |
| `ukeplan.py sjekk` | leter etter skrivefeil og rader som ikke henger sammen |

## Filene

```
ukeplan.py             kommandolinja
ukeplanlib/felles.py   dager, fagfarger, målform, tolking av det som står i cellene
ukeplanlib/regneark.py lager arbeidsboka
ukeplanlib/les.py      leser arbeidsboka og setter sammen hver uke
ukeplanlib/bygg.py     fyller malen og legger inn logoen
ukeplanlib/demo.py     eksempeldataene
netlify.toml           byggeoppskrift for Netlify
requirements.txt       openpyxl, så Netlify installerer den selv
Ukeplan.xlsx           arbeidsboka som ligger til grunn for det som publiseres
mal/side.html          nettsiden – utseende og oppførsel
mal/fonter.css         skriftene, lagt inn som data-URI
verktoy/hent_fonter.py henter skriftene på nytt hvis skriftvalget endres
profil/                skolens logo
eksempel/              ferdig arbeidsbok og ferdig nettside
```

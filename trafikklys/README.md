# Trafikklysmodellen

Lærerne melder inn det som ikke er grønt. Møtet får ett rutenett per klasse:
elevene nedover, områdene bortover, sterkeste lys i hver rute – og piler for
det som har endret seg siden forrige møte.

Word-dokumenter med farger klarer ikke det siste. De klarer heller ikke at ni
lærere skriver samtidig, at du ser hva som ble bestemt sist, eller at du kan
sortere på hvem som trenger mest. Det er de tre tingene denne løsningen gjør.

Satt opp for **Hustadvika vidaregåande skole**: nynorsk, skolens egne klasser,
skolens profilfarge og logo. Alt sammen står i arkene og kan byttes.

```
python3 trafikklys.py ny --demo    # arbeidsbok med et ferdig eksempel
python3 trafikklys.py ny           # tom arbeidsbok, klar til bruk
```

Første gang: `pip install -r krav.txt` (openpyxl er det eneste som trengs).
Python trengs bare for å *lage* arbeidsboka. Etter det er den en vanlig
Excel-fil som klarer seg selv.

## I IOPsky – arbeidsboka alene

IOPsky er fylkets lukkede sky for taushetsbelagte dokumenter. Der kan det
ikke kjøres programmer eller nettsider – bare dokumenter åpnes. Derfor gjør
arbeidsboka hele jobben selv, med vanlige formler:

| Ark | Brukes til |
| --- | --- |
| **Innmelding** | Lærerne melder inn – én rad per ting |
| **Oversikt** | Møtevisningen: velg møte og klasse, så står rutenettet ferdig |
| **Elevkort** | Velg en elev: hva hver lærer skrev, og tiltakene som løper |
| **Tiltak** | Det møtet ble enige om, med ansvarlig, frist og status |

Ingen makroer, ingen tillegg, ingen lenker ut. Formlene er bevisst holdt til
funksjoner som har fantes lenge (`SUMPRODUCT`, `INDEX`, `MATCH`, `LARGE`,
`COUNTIFS`), så de regner likt i Excel, Excel for web og LibreOffice.

Runden gjennom året:

```
Lærerne melder inn fortløpende  →  Innmelding-arket
I møtet                         →  Oversikt på skjermen, Elevkort ved behov
Etter møtet                     →  tiltak føres, med ansvarlig og frist
Neste møte                      →  pilene viser hva som har flyttet seg
```

### Fire ting å sjekke i IOPsky før dere starter

Jeg har ikke tilgang til IOPsky og har ikke kunnet prøve fila der. Dette
avgjør om det går slik som beskrevet:

1. **Godtar den Excel-filer**, eller bare Word? Word kan ikke regne, så med
   bare Word faller oversikten bort.
2. **Hva åpner den filene i?** Microsoft Excel (skrivebord eller nett) eller
   noe annet, for eksempel Collabora/LibreOffice. Formlene er regnet gjennom i
   LibreOffice; i Microsoft Excel bruker de bare eldre, vanlige funksjoner.
3. **Kan flere skrive samtidig**, eller må fila sjekkes ut? Låser den, er det
   lurt å ha én arbeidsbok per trinn eller per lærerteam, og en frist for
   innmelding før hvert møte.
4. **Hvem ser mappa?** Alle ansatte kan logge inn i IOPsky. Mappa med
   arbeidsboka bør bare deles med lærerne som har klassene.

To nedtrekk – Elev i Innmelding og i Elevkort – bruker `INDIRECT` for å vise
bare klassens egne elever. Virker ikke det i systemet dere har, står lista
tom; da skriver du navnet for hånd, og Oversikt finner eleven likevel så lenge
navnet er stavet som på Elever-arket.

## Med Teams – bare om skolen tillater det

Har skolen klarert at elevstatus kan ligge i Teams, finnes to tillegg:

**Innmelding i Microsoft Lists.** Lærerne skriver ofte og kort, gjerne fra
mobilen. Der er en liste bedre enn et regneark: den låser ikke, den fyller
inn «hvem» og «når» selv, og den har versjonshistorikk. Oppskrift og ferdige
filer ligger i [`lister/`](lister/LES-MEG.md); `python3 trafikklys.py
lister` lager dem med skolens egne klasser og områder. Før møtet eksporterer
du lista og limer radene inn i Innmelding-arket.

**Møtevisning som nettside.** `python3 trafikklys.py bygg` lager
`Elevstatus.html` – samme rutenett som Oversikt-arket, men med utfoldbare
elevrader og lys/mørk modus. Den krever at Python kan kjøres på en maskin der
fila får ligge, og passer derfor ikke i IOPsky.

## Arbeidsboka

Sju ark. Lærerne bruker Innmelding; møtet bruker Oversikt og Elevkort.

**Innmelding** – én rad per ting du melder inn:

| Møte | Klasse | Elev | Område | Lys | Merknad | Lærer |
| --- | --- | --- | --- | --- | --- | --- |
| 1 · Haust | 1ID | Brage Settem | Frammøte | Raudt | 14 timar udokumentert fråvær på seks veker. | K. Meringdal |
| 1 · Haust | 1ID | Brage Settem | Motivasjon | Gult | Usikker på om han har valt rett programområde. | K. Meringdal |

Alt bortsett fra merknaden har nedtrekksliste, og Elev-lista viser bare
elevene i klassen du valgte. Lyscella farges mens du skriver, og raden får en
svak tone i samme farge, så arket kan leses på avstand.

Du melder bare inn det som ikke er grønt. Ingen innmelding betyr grønt.
Vil du bekrefte at du har sett etter, setter du grønt eksplisitt – det teller
med i tallene og vises i rutenettet.

**Tiltak** – det møtet ble enige om:

| Møte | Klasse | Elev | Område | Tiltak | Ansvarlig | Frist | Status |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 · Haust | 1ID | Kaia Sylte | Trivsel | Kontakt med helsesjukepleiar. | Kontaktlærar | 03.10.2026 | Blir følgd opp |

Fristen lyser rødt når den er gått ut og tiltaket ikke er avsluttet – både i
arket og i møtevisningen.

**Oppsett** – skole, målform, profilfarge og logo, og de tre listene alt annet
henger på: klassene, møtene med dato, og områdene dere setter lys på.
Standardområdene er Frammøte, Fagleg utvikling, Arbeidsinnsats, Motivasjon,
Trivsel, Klassemiljø, Heim og føresette og Praktiske forhold. Bytt dem til det
skolen faktisk bruker – rutenettet følger etter.

**Elever** – én kolonne per klasse med navna. Det er denne som gjør at
Elev-nedtrekket vet hvem som finnes, og den Oversikt henter klassen fra.

**Oversikt** – møtevisningen i arket. Velg møte og klasse øverst. Rutenettet
viser sterkeste lys per elev og område med formene ● ▲ ■, et tall når flere
lærere har meldt inn det samme, og en pil mot forrige møte: ↑ verre,
↓ bedre, ✱ ny. Elevene står med mest rødt øverst; de uten noe meldt inn står
grått nederst. Øverst til høyre: antall røde, gule og grønne, hvor mange
elever som er meldt inn, og åpne tiltak. Skrives ut på A4 liggende.

**Elevkort** – velg en elev, så står alt som er meldt inn om eleven på det
valgte møtet, og alle tiltakene eleven har, med frist og status.

Oversikt og Elevkort er låst uten passord, så formlene ikke skrives over.
Bare valgfeltene er åpne. Legger skolen til flere områder enn de åtte, viser
du de skjulte kolonnene i Oversikt (høyreklikk → Vis). Det er plass til 12.

**Start her** – oppskriften og hva lysene betyr, i arbeidsboka.

Én arbeidsbok tar hele skoleåret. Møte-kolonnen skiller møtene fra hverandre;
klikk på filterpila når du vil se ett om gangen.

Er det noe som ikke henger sammen, sier `python3 trafikklys.py sjekk` fra:

```
Innmelding rad 12: «Frammøtte» sto ikke i Oppsett. Den er tatt med som den er.
Innmelding rad 41: «Kari Nordmann» sto ikke på Elever-arket for 1ID. Eleven er lagt til.
```

## Møtevisningen som nettside (valgfri)

Bare aktuelt der Python kan kjøres – ikke i IOPsky. Én fil, uten noe utenfor seg selv – skriftene ligger inne i fila, så den ser
lik ut på skolens nett, på en projektor og uten nett i det hele tatt.

- **Rutenettet** er hovedsaken. Én rad per elev, én kolonne per område.
  Ruta viser sterkeste lys, hvor mange lærere som har meldt inn, og en pil:
  ↑ verre enn sist, ↓ bedre enn sist, ✱ ny siden sist.
- **Formene skiller lysene** i tillegg til fargen – ● grønt, ▲ gult, ■ rødt –
  så rutenettet virker også for den som ikke ser forskjell på rødt og grønt.
- **Klikk på en elev** og raden folder seg ut: hvert område med hva hver
  enkelt lærer skrev, og tiltakene som allerede løper.
- **«Ta opp i møtet»** er køen: de som har gult eller rødt, mest rødt først.
  Klikk på et navn for å hoppe til eleven.
- **Sortert på mest rødt** som standard, eller alfabetisk. Elever uten noe
  meldt inn er skjult til du ber om å se hele klassen.
- **Tiltakstabellen** nederst viser alle tiltakene for klassen, åpne først,
  med frist og status. Overskredet frist står rødt.
- **Klasse** velges med ett klikk og huskes. Piltastene ← og → blar mellom
  møtene.
- **Skriv ut** gir rutenettet på A4 i liggende format, med tiltakene under.
- **Lys eller mørk** følger maskinen, men knappen overstyrer.

Ingenting av det du gjør på siden lagres noe sted. Nettleseren husker bare
hvilken klasse og sortering du valgte sist – aldri noe om elevene.

## Personopplysninger

Dette er det stedet løsningen skiller seg mest fra vekeplanen ved siden av.
Vekeplanen legges ut på en åpen adresse. **Dette skal aldri legges ut.**

- Arbeidsboka og `Elevstatus.html` inneholder personopplysninger om
  identifiserbare elever. De hører hjemme der skolen oppbevarer
  taushetsbelagte dokumenter – i Møre og Romsdal er det IOPsky.
- Del mappa bare med lærerne som har klassene. Brukes Teams, er det
  **lærernes eget team eller en privat kanal** – aldri klasseteamet, der
  elevene er medlemmer.
- Derfor finnes det med vilje **ingen `publiser`-kommando** her, og ingen
  `netlify.toml` i denne mappa. Koble aldri Netlify eller noe annet
  webhotell til `trafikklys/`.
- `.gitignore` holder `Trafikklys.xlsx` og `Elevstatus.html` utenfor GitHub.
  Bare eksempelfilene med oppdiktede elever ligger i repoet.
- Skriv observasjoner, ikke vurderinger av person: «ikkje levert dei tre
  siste innleveringane» framfor «umotivert». Helseopplysninger, diagnoser og
  opplysninger om familien hører hjemme i elevmappa, ikke her.
- Bygger du møtevisningen på din egen maskin, slett `Elevstatus.html` etter
  møtet.
- Sjekk med skolens personvernombud før dere setter det i drift, og få det
  inn i behandlingsprotokollen. Hvor lenge dere skal ta vare på innmeldingene,
  og når de skal slettes, er en avgjørelse skolen må ta – ikke en teknisk
  innstilling.

## Kommandoer

| Kommando | Gjør |
| --- | --- |
| `trafikklys.py ny` | ny, tom arbeidsbok |
| `trafikklys.py ny --demo` | ferdig utfylt eksempel: tre klasser, to møter |
| `trafikklys.py ny --sprak nynorsk` | arbeidsbok og møtevisning på nynorsk |
| `trafikklys.py bygg` | lager `Elevstatus.html` (valgfri, ikke for IOPsky) |
| `trafikklys.py følg` | bygger på nytt hver gang arbeidsboka lagres |
| `trafikklys.py sjekk` | leter etter skrivefeil og rader som ikke henger sammen |
| `trafikklys.py lister` | lager oppsettet for Microsoft Lists |

## Filene

```
trafikklys.py             kommandolinja
trafikklyslib/felles.py   lys, områder, målform, tolking av det som står i cellene
trafikklyslib/regneark.py lager arbeidsboka, med Oversikt, Elevkort og formlene bak
trafikklyslib/les.py      leser arbeidsboka – også et uttrekk limt inn fra Lists
trafikklyslib/bygg.py     fyller malen og legger inn logoen
trafikklyslib/lister.py   lager Excel-malene og fargeoppsettet til Microsoft Lists
trafikklyslib/demo.py     eksempeldataene, alle navn oppdiktet
mal/side.html             møtevisningen – utseende og oppførsel
lister/                   ferdige filer og oppskrift for Microsoft Lists
profil/                   skolens logo
eksempel/                 ferdig arbeidsbok og ferdig møtevisning
krav.txt                  openpyxl
```

Skriftene lånes fra `../ukeplan/mal/fonter.css`, så de ikke ligger to ganger i
repoet. Mangler den fila, henter møtevisningen skriftene fra nettet i stedet.

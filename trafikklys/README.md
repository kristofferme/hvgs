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
python3 trafikklys.py bygg         # lager møtevisningen
```

Første gang: `pip install -r krav.txt` (openpyxl er det eneste som trengs).

## Hvordan det henger sammen

To halvdeler, og de kan brukes hver for seg:

**Innmeldingen** – der lærerne skriver. Enten en liste i **Microsoft Lists**
som fane i Teams (anbefalt), eller Innmelding-arket i arbeidsboka.

**Møtevisningen** – det dere ser på i elevstatusmøtet. Én HTML-fil som
arbeidsboka lager, som du åpner i nettleseren og deler på skjermen.

Runden gjennom året:

```
Lærerne melder inn fortløpende  →  Lists (eller Excel i Teams)
Før møtet                       →  eksporter, lim inn, «trafikklys.py bygg»
I møtet                         →  Elevstatus.html på skjermen
Etter møtet                     →  tiltak føres, med ansvarlig og frist
Neste møte                      →  pilene viser hva som har flyttet seg
```

### Hvorfor Lists til innmeldingen

Lærerne skal skrive ofte og kort, gjerne fra mobilen mellom to timer. Der er
en liste bedre enn et regneark: den låser ikke, den er laget for at mange
skriver samtidig, den fyller inn «hvem» og «når» selv, og den har versjons-
historikk hvis noe blir borte. Ingen nye lisenser – Lists følger med Microsoft
365 og legges inn som en fane i teamet.

Oppskrift og ferdige filer ligger i [`lister/`](lister/LES-MEG.md). Kjør
`python3 trafikklys.py lister`, så får du dem med skolens egne klasser og
områder.

**Vil dere heller ha alt i Excel?** Det virker også. Legg `Trafikklys.xlsx`
i lærernes team, så skriver alle rett i Innmelding-arket. Ett forbehold:
Elev-nedtrekket bruker `INDIRECT` for å vise bare klassens egne elever. Det
virker i Excel på skrivebordet. I Excel for web kan det hende nedtrekket står
tomt – da skriver du navnet for hånd, og arbeidsboka sier fra hvis det er
stavet annerledes enn på Elever-arket.

## Arbeidsboka

Fem ark, og bare to av dem er til daglig bruk.

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
Elev-nedtrekket vet hvem som finnes.

**Start her** – oppskriften og hva lysene betyr, i arbeidsboka.

Én arbeidsbok tar hele skoleåret. Møte-kolonnen skiller møtene fra hverandre;
klikk på filterpila når du vil se ett om gangen.

Er det noe som ikke henger sammen, sier `python3 trafikklys.py sjekk` fra:

```
Innmelding rad 12: «Frammøtte» sto ikke i Oppsett. Den er tatt med som den er.
Innmelding rad 41: «Kari Nordmann» sto ikke på Elever-arket for 1ID. Eleven er lagt til.
```

## Møtevisningen

Én fil, uten noe utenfor seg selv – skriftene ligger inne i fila, så den ser
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
  identifiserbare elever. De hører hjemme i Teams, bak tilgangsstyringen
  skolen allerede har.
- Legg dem i **lærernes eget team eller en privat kanal** – ikke i
  klasseteamet, der elevene er medlemmer.
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
| `trafikklys.py bygg` | lager `Elevstatus.html` |
| `trafikklys.py følg` | bygger på nytt hver gang arbeidsboka lagres |
| `trafikklys.py sjekk` | leter etter skrivefeil og rader som ikke henger sammen |
| `trafikklys.py lister` | lager oppsettet for Microsoft Lists |

## Filene

```
trafikklys.py             kommandolinja
trafikklyslib/felles.py   lys, områder, målform, tolking av det som står i cellene
trafikklyslib/regneark.py lager arbeidsboka
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

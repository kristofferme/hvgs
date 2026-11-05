# Eksamen våren 2026 – Hustadvika vidaregåande skole

En interaktiv presentasjon for lærerne der **tidslinjen er presentasjonen**.
Publikum reiser langs én sammenhengende linje fra forberedelsene i januar til
siste sensur i juni – med stoppesteder, forgreninger for de ulike
eksamensformene, et veikryss for roller og hindringer underveis.

Åpne `index.html` i en nettleser. Fila er selvstendig: skrifter, innhold og
kode ligger inne i den, så den virker uten nett og kan legges i Teams eller
sendes på e-post.

## To moduser

**Presentasjonsmodus** (standard) – for storskjerm foran kollegiet.

| Tast | Hva |
| --- | --- |
| `→` `↓` `Mellomrom` | Neste steg |
| `←` `↑` | Forrige steg |
| `PgDn` `PgUp` | Neste / forrige stopp |
| `0`–`6` | Kart, kapittel 1–5, epilog |
| `Home` `End` | Start / slutt |
| `F` | Fullskjerm |
| `M` | Rolig bevegelse (respekterer også systeminnstillingen) |
| `?` | Hurtigtaster |

**Utforskermodus** (`E`) – for lærerne etter møtet.

- **Kart**: hele reisen, dra og zoom fritt, klikk et stopp for å åpne det.
- **Filter** på eksamensform og rolle – relevante stopp fremheves på tidslinjen.
- **Oppslag**: alt innhold i kronologisk rekkefølge, med søk og utskrift.
- **Mitt ansvar**: én rolle, oppgavene fordelt på fasene, med lenke til stoppet.
- **Rutiner**: alle avviksrutinene samlet – kan skrives ut til eksamenslokalet.
- **Plassholdere**: liste over lokale opplysninger som mangler.
- **Kilder**.

Lenker til et bestemt stopp: `index.html#k3-forberedelse` (legg til `/2` for steg 2).

## Reisen

| Kapittel | Innhold |
| --- | --- |
| Prolog | 2026 · tittel · hovedspørsmålet · kart over hele perioden |
| 01 Før eksamen | Oppmelding, tilrettelegging, ny ordning (ingen forberedelsesdel, ingen internett), sikker nettleser, elevinformasjon, nye standpunktregler, trekket 28. april |
| 02 Skriftlig | Perioden i tall, kalender 4.–21. mai, simulering av en eksamensdag, før/under/etter, rutine ved tekniske problemer |
| 03 Muntlig | Sporet deler seg i muntlig, muntlig-praktisk og praktisk: trekk og kunngjøring, 24 t forberedelse, inntil 30 min, sensur og klage, ansvarsfordeling |
| 04 Roller | Interaktivt ansvarsnettverk – velg rolle, se oppgavene, fremhev dem på tidslinjen |
| 05 Avvik | Seks scenarioer med spørsmål, svar, regel, rutine og kontakt |
| Epilog | Datoer, ansvar, feil vi skal unngå, hvor du finner hjelp |

## Endre innholdet

**Alt innhold ligger i `src/innhold.js`.** Datoer, tekster, sjekklister,
roller og scenarioer redigeres der. Deretter:

```
node bygg.mjs
```

Det bygger `index.html` på nytt og sier hvor mange plassholdere som er igjen.
Ingen pakker trengs – bare Node 18 eller nyere.

Under arbeid kan du også åpne `src/index.html` direkte; den leser filene i
`src/` uten bygging.

### Merking

Hvert punkt er merket med hva slags opplysning det er:

| Merke | Betyr |
| --- | --- |
| **Nasjonal regel** | Fra opplæringsforskrifta eller Udir – gjelder alle skoler |
| **Lokal rutine** | Hustadvika vgs / Møre og Romsdal – må bekreftes lokalt |
| **Tips** | Anbefaling og praktiske råd |
| *Kontroller* | Kildene spriker, eller ordlyden bør sjekkes mot siste versjon |

### Plassholdere

Lokale datoer og rutiner er **ikke funnet på**. Der opplysningen mangler, står
det en plassholder:

```js
naar: "[[Fyll inn: frist]]",
```

Den vises med stiplet ramme og «FYLL INN» i presentasjonen, og alle er listet
under Utforsk → Plassholdere. Bytt ut hele `[[…]]` med den faktiske teksten.
`[[08:30]]` (uten «Fyll inn») vises som «BEKREFT 08:30» – et eksempel som må
bekreftes.

Det som må avklares lokalt før presentasjonen brukes, er blant annet:
frister for kontroll av kandidatlister og søknad om tilrettelegging, dato for
teknisk test, kanal for kunngjøring av trekket, oppmøtetid og lokaler,
periode for muntlig eksamen i Møre og Romsdal, rammer for muntlig-praktisk og
praktisk eksamen, rutine for sykdom og dokumentasjonsfrist, og
kontaktpersoner (eksamensansvarlig, IT, ledelse).

## Kilder

Nasjonale datoer og regler er hentet fra Utdanningsdirektoratet (eksamensplan,
endringer i trekk og standpunkt, fjerning av forberedelsesdel, sikker
nettleser), opplæringsforskrifta kapittel 9 og Statsforvalteren. Hver påstand
har lenke til kilden i presentasjonen, og full liste står under Utforsk →
Kilder. Fagkodene i kalenderen er et utvalg – kontroller alltid i
[eksamensplan.udir.no](https://eksamensplan.udir.no/).

## Teknisk

- Ren HTML, CSS og JavaScript – ingen rammeverk og ingen eksterne tjenester.
- Tidslinjen er én SVG-rute i et verdenskoordinatsystem. Et kamera
  (`camTarget`/`flyTo` i `src/app.js`) flyr, zoomer og panorerer mellom stoppene,
  og linja tegnes mens reisen går. Stoppesteder og datoer er HTML som følger
  kameraet, så teksten er skarp på alle zoomnivåer.
- Scenene ligger i `SC` i `src/app.js`. `data-s="n"` på et element betyr at det
  vises fra steg n.
- Sjekklister huskes per nettleser (localStorage) – ingen data sendes noe sted.
- Skrifter: Poppins, Big Shoulders Display og JetBrains Mono (SIL OFL), lagt inn
  i `src/fonter.css`.

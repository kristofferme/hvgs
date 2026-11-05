---
name: krizi
description: Lager og endrer Krizi-presentasjoner, brukerens egen vri på Prezi. Krizi er et uendelig, zoombart lerret med animerte rammer, og presentasjonen kan redigeres direkte i nettleseren. Bruk skillen når brukeren skriver «bruk krizi», «krizi», «lag en krizi», «i krizi-stil», ber om en zoom-presentasjon eller vil endre en eksisterende Krizi-fil eller lime inn Krizi-tekst.
---

# Krizi

Krizi er et presentasjonssystem i `krizi/`. En presentasjon er **én selvstendig HTML-fil**. Fila inneholder
innholdet (JSON i `<script id="krizi-data">`) og motoren. Fila spiller av presentasjonen og lar brukeren
redigere alt selv (trykk **E**, lagre med **Ctrl+S**).

```
krizi/motor/krizi.js        motoren (kamera, animasjon, redigering)
krizi/motor/krizi.css       tema og utseende
krizi/bygg.mjs              JSON → HTML, oppgradering, uthenting
krizi/verktoy/bilder.mjs    skjermbilder av hvert steg (kvalitetssjekk)
krizi/presentasjoner/       ferdige presentasjoner (dette er kilden)
```

## Arbeidsflyt

1. **Forstå oppdraget.** Finn tema, publikum og omtrentlig lengde. Spør bare hvis temaet mangler helt.
   Ellers velger du selv: 8–16 steg er vanlig. Skriv på samme språk som brukeren (bokmål hvis ikke annet er sagt).
2. **Tegn kartet før du skriver.** En Krizi-presentasjon er en fortelling lagt ut som et landskap,
   ikke en bunke lysbilder. Bestem hovedidé, avsnitt og detaljer, og hvor de ligger i forhold til hverandre
   (se «Komposisjon» under).
3. **Skriv JSON** til en fil i scratchpaden din, f.eks. `<scratchpad>/foto.json`.
4. **Bygg:**
   ```bash
   node krizi/bygg.mjs <scratchpad>/foto.json krizi/presentasjoner/fotosyntese.html
   ```
   Skriptet advarer om ukjente id-er og om rammer som overlapper. Rett alle advarsler.
5. **Se på resultatet:**
   ```bash
   node krizi/verktoy/bilder.mjs krizi/presentasjoner/fotosyntese.html <scratchpad>/bilder
   ```
   Se på `oversikt.png` og et par steg. Sjekk at teksten er lesbar, ikke er presset sammen og ikke kolliderer.
   Motoren krymper tekst som ikke får plass. Bilder der teksten er blitt veldig liten, betyr for mye tekst.
6. **Lever:** publiser HTML-fila som Artifact (følg Artifact-verktøyets egne regler), og commit og push
   fila til arbeidsgreinen. Svar kort: lenken, én setning om hva du har bygd, og
   «trykk E for å redigere, Ctrl+S for å lagre».

**Endre en eksisterende presentasjon:** hent innholdet med
`node krizi/bygg.mjs --json krizi/presentasjoner/x.html > <scratchpad>/x.json`, endre, og bygg tilbake til samme sti.
Hvis brukeren limer inn JSON (fra «Kopier som tekst» i Krizi), bruk den som kilde, fordi den kan ha endringer som
ikke er i repoet. Behold `id` på presentasjonen og rammene, så fungerer utkast og sti videre.

**Oppgradere motoren** i alle filer etter endringer i `motor/`: `node krizi/bygg.mjs --alle`.

## Format

```json
{
  "tittel": "Fotosyntese",
  "tema": "aurora",
  "visSti": true,
  "fart": 1,
  "rammer": [
    { "id": "start", "form": "kort", "x": 0, "y": 0, "s": 1, "r": 0,
      "tekst": "### Biologi vg1\n# Fotosyntese\nHvordan planter lager mat av lys.",
      "notat": "Spør klassen: hva spiste treet?" }
  ],
  "sti": ["start", { "x": 0, "y": 0, "b": 6000, "h": 3400, "r": 0 }],
  "pynt": [ { "type": "tekst", "tekst": "LYS", "x": 0, "y": 0, "s": 4, "dybde": 0.35 } ]
}
```

**Ramme**
| felt | betydning |
|---|---|
| `id` | unik, kort, beskrivende (`"klorofyll"`) |
| `form` | `kort` (1600×900, kort med bakgrunn), `sirkel` (1000×1000), `fri` (1600×900, ingen bakgrunn) |
| `x`, `y` | sentrum i verdenskoordinater (y øker nedover) |
| `s` | skala. 1 = full størrelse. 0,1 = ti ganger mindre (kameraet zoomer inn) |
| `r` | rotasjon i grader. Kameraet roterer med, så rammen står rett når du er der |
| `tekst` | innhold i Krizi-markdown (se under) |
| `steg` | `true`: listepunktene kommer ett og ett |
| `farge` | uthevingsfarge for denne rammen, f.eks. `"#ff8a5b"` |
| `notat` | talenotater (vises med N og i presentatørvisningen med P) |
| `w`, `h` | egen størrelse i stedet for standard (sjelden nødvendig) |

**Sti**: rekkefølgen kameraet besøker. Hvert element er en ramme-id eller et utsnitt
`{x, y, b, h, r}` (sentrum, bredde og høyde av det som skal synes). Avslutt gjerne med et utsnitt
over hele lerretet, slik at publikum ser hele kartet til slutt.

**Pynt**: dekor i parallakse-lag som gir dybde. `type`: `tekst` (stort ord), `ring`, `glod` (mykt lys),
`prikk`, `bilde` (`src`). `dybde` < 1 ligger bak og beveger seg saktere (0,3–0,7 er fint).
`dybde` > 1 ligger foran og suser forbi (1,3–1,8, bruk sparsomt og små). `opasitet` overstyrer standarden.

**Krizi-markdown i `tekst`**
```
### Etikett            liten tekst med store bokstaver over tittelen
# Tittel               stor overskrift (ordene animeres inn ett og ett)
## Undertittel
Vanlig avsnitt.        **fet**  *kursiv*  ==utheving== (tegnes over med markeringstusj)
- punkt                punktliste  ·  1. nummerert liste
!! 42 % | forklaring   stort tall med forklaring
> Sitat                sitat, med «— Navn» på linja under
||                     åpner en kolonne. Alt før første || er felles topp.
![bildetekst](url)     bilde (https eller data:)
🌍                     en linje med bare emoji blir et stort ikon
---                    skillelinje
```

## Komposisjon

Det som skiller Krizi fra lysbilder, er rom og skala. Bruk begge.

- **Hierarki gjennom skala.** Tittelrammen har `s: 1`. Hovedavsnitt har `s: 0.45–0.7`. Detaljer ligger
  **inne i** rammen de hører til, med `s: 0.04–0.12`. Kameraet dykker da inn i detaljen. Bruk minst ett slikt
  dykk per presentasjon. Det er det mest Krizi-aktige grepet.
- **Plassering forteller noe.** Ting som hører sammen, ligger nær hverandre. Et motsetningspar kan ligge på hver
  sin side. En prosess kan følge en bue eller spiral. En tidslinje går fra venstre mot høyre.
- **Avstand.** Hold rammer på samme nivå minst en halv rammebredde fra hverandre, så de ikke overlapper.
  Typiske avstander for `s ≈ 0.6`: 1300–1800 enheter mellom sentrene.
- **Rotasjon.** ±2–8° på noen rammer gir liv. Ikke roter alt. Store vinkler (20–90°) bare når det betyr noe.
- **Bytt form.** Bland `kort`, `sirkel` og `fri`. `fri` passer for store titler og kolonner som skal stå rett
  på lerretet, `sirkel` for én idé eller ett tall.
- **Tekstbudsjett.** Høyst ca. 30 ord per ramme. Én tanke per ramme. Lister: 3–5 punkter, med `steg: true`.
  Bruk `!!` for tall og `>` for sitater. Det gir variasjon i rytmen.
- **Notater.** Skriv `notat` på de fleste rammene: det presentatøren skal si, eller et spørsmål til publikum.
- **Pynt.** 1–2 store ord med `dybde` 0,3–0,4 og lav opasitet bak hovedområdene, et par `glod` bak viktige rammer,
  eventuelt 2–4 `prikk` med `dybde` 1,4–1,7 som suser forbi. Ikke mer.
- **Avslutning.** Siste ramme kan være en oppsummering eller et spørsmål. Siste steg i stien kan være et utsnitt
  over hele lerretet.

**Tema**
- `aurora`: mørk nordlyshimmel, serif-titler. Standard, passer til det meste.
- `fjord`: lyst og klart, grotesk skrift. Profesjonelt, møter, rapporter.
- `kritt`: grønn tavle, håndskrift. Undervisning, klasserom, verksted.
- `glod`: varm skumring, kursiv serif. Personlig, kultur, fortelling.

## Sjekkliste før levering

- [ ] `bygg.mjs` gir ingen advarsler
- [ ] Oversiktsbildet viser et tydelig kart, ikke et rutenett av like kort
- [ ] Minst ett dykk inn i en detalj (en liten ramme inne i en større)
- [ ] Ingen ramme har så mye tekst at den er krympet tydelig
- [ ] Stien er i en logisk rekkefølge, og siste steg avslutter fortellingen
- [ ] Fila er publisert som Artifact, og den er committet og pushet

---
name: krizi
description: Lager og endrer Krizi-presentasjoner, brukerens egen vri på Prezi. Krizi er et uendelig, zoombart lerret med levende bakgrunner, animert tekst og kameraoverganger, og presentasjonen kan redigeres direkte i nettleseren. Bruk skillen når brukeren skriver «bruk krizi», «krizi», «lag en krizi», «i krizi-stil», ber om en zoom-presentasjon eller vil endre en eksisterende Krizi-fil eller lime inn Krizi-tekst.
---

# Krizi 2

Krizi er et presentasjonssystem i `krizi/`. En presentasjon er **én selvstendig HTML-fil**. Fila inneholder innholdet
(JSON i `<script id="krizi-data">`) og motoren. Fila spiller av presentasjonen og lar brukeren redigere alt selv
(**E** for redigering, dobbeltklikk for å skrive, **Ctrl+S** for å lagre).

```
krizi/motor/js/*.js        motoren, satt sammen i alfabetisk rekkefølge (00-start … 99-slutt)
krizi/motor/css/*.css      utseende og animasjoner
krizi/bygg.mjs             JSON → HTML, oppgradering, uthenting, kvalitetssjekk
krizi/verktoy/bilder.mjs   skjermbilder av hvert steg
krizi/presentasjoner/      ferdige presentasjoner (dette er kilden)
```

Eksempler å lære av (hent JSON med `--json`): `mot-krizi.html` (bane rundt en tittel, Kosmos) og
`fotosyntese.html` (dykk fra blad til celle til kloroplast, Skog med lysglimt).

## Det viktigste: hver presentasjon skal føles unik

Brukeren vil **ikke** ha et sett generiske tavler. Hver presentasjon skal ha sin egen verden, satt sammen for
akkurat dette temaet. Før du skriver JSON, bestem disse fem tingene og si dem til deg selv:

1. **Romlig metafor.** Hvordan ser temaet ut som et landskap? Velg én, og la plasseringen fortelle noe:
   - *Dykk*: makro til mikro, med detaljer gjemt inni detaljer (biologi, fysikk, «se nærmere»).
   - *Bane*: én kjerne i midten med ideer i bane rundt (et begrep og dets sider).
   - *Reise* eller *elv*: fra A til B, med en bølgende vei (historie, prosess, karriere).
   - *Tidslinje*: årstall annenhver over og under en linje.
   - *Tre*: rot nederst, greiner oppover (årsak og virkning, slektstre, kategorier).
   - *Kart* eller *by*: områder du besøker (geografi, deler av et system).
   - *Spiral*: stadig mindre rammer innover (fordypning, «kjernen i saken»).
   - *Motsetning*: to sider av lerretet (debatt, før og etter).
2. **Stil.** Ta utgangspunkt i en mal og bytt minst én byggekloss, så den passer temaet (se tabellene under).
   Gi stilen et eget `navn`. Varier fra presentasjon til presentasjon: ikke bruk samme mal to ganger på rad.
3. **Rytme.** Bland formene (`kort`, `sirkel`, `blob`, `fri`), og bland innholdstypene (tittel, tall, stolper,
   prosess, sitat, liste, ikon). To like rammer etter hverandre er kjedelig.
4. **Bevegelse.** Bruk standardovergangen fra stilen, men sett `overgang` på 2–4 nøkkelrammer: `dykk` når du går
   inn i en detalj, `drift` når du trekker deg ut, `spiral` eller `sveip` for et skifte. Sett `inn` på noen rammer
   for variasjon.
5. **Ett øyeblikk publikum husker.** Et dykk fem nivåer ned, et tall som teller opp, ord som skifter, konfetti på
   slutten, eller en pil som tegner seg mellom to ideer. Planlegg minst to slike øyeblikk.

## Arbeidsflyt

1. **Forstå oppdraget.** Finn tema, publikum og omtrentlig lengde. Spør bare hvis temaet mangler helt.
   Ellers velger du selv: 8–16 steg er vanlig. Skriv på samme språk som brukeren (bokmål hvis ikke annet er sagt).
   Hold deg til fakta du er sikker på, og ikke dikt opp statistikk.
2. **Bestem de fem tingene over**, og skisser koordinatene.
3. **Skriv JSON** til scratchpaden, f.eks. `<scratchpad>/vikingtid.json`.
4. **Bygg:**
   ```bash
   node krizi/bygg.mjs <scratchpad>/vikingtid.json krizi/presentasjoner/vikingtid.html
   ```
   Skriptet advarer om ukjente verdier, overlappende rammer og rammer med for mye tekst. Rett alle advarsler.
5. **Se på resultatet:**
   ```bash
   node krizi/verktoy/bilder.mjs krizi/presentasjoner/vikingtid.html <scratchpad>/bilder
   ```
   Se på `oversikt.png` og 3–4 steg. Kartet skal se ut som et bevisst landskap, ikke som et rutenett.
   Tekst som er blitt veldig liten, betyr for mye tekst. Steg der innholdet ikke vises ennå, er bare tatt før
   animasjonen var ferdig.
6. **Lever:** publiser HTML-fila som Artifact (følg Artifact-verktøyets regler), og commit og push den til
   arbeidsgreinen. Svar kort: lenken, én setning om metaforen og stilen du valgte, og
   «trykk E for å redigere, dobbeltklikk for å skrive, Ctrl+S for å lagre».

**Endre en eksisterende presentasjon:** `node krizi/bygg.mjs --json krizi/presentasjoner/x.html > <scratchpad>/x.json`,
endre, og bygg tilbake til samme sti. Hvis brukeren limer inn JSON (fra «Kopier som tekst»), bruk den som kilde,
fordi den kan ha endringer som ikke er i repoet. Behold `id` på presentasjonen og rammene.

**Ny motor i alle presentasjoner** etter endringer i `motor/`: `node krizi/bygg.mjs --alle`.

## Format

```json
{
  "tittel": "Vikingtiden",
  "stil": { "mal": "Riso", "navn": "Runer og salt", "verden": "hav", "overgang": "drift" },
  "rammer": [
    { "id": "start", "form": "fri", "x": 0, "y": 0, "s": 1, "tekst": "### Historie\n# Vikingtiden\n793–1066" }
  ],
  "sti": ["start", { "x": 0, "y": 0, "b": 6000, "h": 3400 }],
  "koblinger": [ { "fra": "start", "til": "handel", "tekst": "førte til" } ],
  "pynt": [ { "type": "tekst", "tekst": "HAV", "x": 0, "y": 0, "s": 5, "dybde": 0.3 } ]
}
```

**Stil** (`stil`): enten bare navnet på en mal (`"stil": "Skog"`), eller et objekt der `mal` er utgangspunktet og
resten overstyrer.

| felt | verdier |
|---|---|
| `mal` | Nordlys, Fjord, Tavle, Glød, Blåkopi, Riso, Neon, Skog, Dyphav, Kosmos, Pop, Is, Akvarell, Lava, Lavendel, Grafitt |
| `palett` | nordlys, fjord, kritt, glod, blakopi, riso, neon, skog, dyphav, sand, is, kosmos, lava, pop, lavendel, grafitt |
| `skrift` | klassisk (Fraunces), moderne (Bricolage), hand (Caveat), redaksjon (Instrument Serif), plakat (Anton, store bokstaver), geometrisk (Unbounded), teknisk (JetBrains Mono), eventyr (Young Serif), bred (Syne), elegant (Cormorant, kursiv), leken (Fredoka), tusj (Caveat Brush) |
| `verden` | nordlys, stjerner, rutenett, prikker, topografi, hav, konstellasjon, bokeh, kritt, blekk, papir, ingen. Nordlys, stjerner og kritt krever mørk palett. Papir passer lyse paletter. |
| `ramme` | glass, solid, papir (med tape), linje, skisse (håndtegnet, tegner seg selv), neon (krever mørk palett), lapp (fargelapp), ingen |
| `bevegelse` | myk, filmatisk (sakte), sprett (overskyter litt), rask, drom (veldig sakte og drømmende) |
| `inn` | ord, bokstav, maske, skriv (skrivemaskin), dekode (bokstaver rulles), blur, zoom, sveip, fall, ingen |
| `overgang` | fly, dykk (rett inn), sveip (raskt med bevegelsesuskarphet), spiral (en hel runde), kutt (svart blink), drift (sakte) |
| `sti` | linje, prikker, ingen – linjen mellom rammene |
| `navn`, `seed`, `korn` (0–0,2), `pust` (true/false), `farger` ({bg, flate, ink, a1, a2, a3} overstyrer paletten) |

Mørke paletter: nordlys, kritt, glod, blakopi, neon, skog, dyphav, kosmos, lava, grafitt. Lyse: fjord, riso, sand, is, pop, lavendel.

**Ramme**
| felt | betydning |
|---|---|
| `id` | unik, kort, beskrivende |
| `form` | `kort` (1600×900), `sirkel` (1000×1000), `blob` (1250×1000, organisk), `fri` (1600×900, uten bakgrunn) |
| `x`, `y`, `s`, `r` | sentrum (y nedover), skala (1 = full, 0,1 = ti ganger mindre), rotasjon i grader |
| `tekst` | innhold i Krizi-markdown |
| `stil` | rammestil for akkurat denne rammen (se `ramme` over) |
| `inn`, `overgang` | tekstanimasjon og kameraovergang **inn til** denne rammen |
| `steg` | `true`: listepunkter, prosess-steg og stolper kommer ett og ett |
| `farge` | uthevingsfarge (for `lapp`: lappens farge) |
| `stemning` | bakgrunnen tones mot denne fargen mens du er her |
| `feiring` | `true`: konfetti når du kommer hit |
| `notat` | talenotater (N og presentatørvisningen P) |
| `w`, `h` | egen størrelse (f.eks. kvadratisk lapp: 900×900) |

**Sti**: ramme-id-er eller utsnitt `{x, y, b, h, r}`. Avslutt gjerne med et utsnitt over hele lerretet.

**Koblinger**: `{fra, til, tekst?, form: pil|linje|stiplet, bue?, farge?}`. Håndtegnede piler som tegner seg selv
når du kommer til en av rammene. `bue` (standard 0,18) bøyer pila, og negativ verdi bøyer andre veien.

**Pynt** (parallakse-lag): `type` = `tekst`, `ring`, `glod`, `prikk`, `bilde` (`src`) eller `svg` (`svg`: markup
uten `<svg>`-tagg, tegnes med strek i `currentColor`; `w`, `h`, `strek`). Felles: `x`, `y`, `s`, `r`, `dybde`
(< 1 ligger bak og beveger seg saktere, > 1 ligger foran og suser forbi), `opasitet`, `farge`, `snurr` (roterer sakte),
`svev` (flyter opp og ned). Tegn gjerne enkle SVG-illustrasjoner som passer temaet: et bladomriss, en bølge,
en fjellrygg, en bane. Det gjør verdenen unik.

**Krizi-markdown i `tekst`**
```
### Etikett            liten tekst over tittelen
# Tittel / ## Undertittel
Vanlig avsnitt         **fet**  *kursiv*  ==markeringstusj==
__understrek__  ((ring rundt))  ~~stryk~~      tegnes for hånd når du kommer
{{ord|som|skifter}}    ordene bytter plass i en løkke
- punkt / 1. punkt
!! 42 % | forklaring   stort tall som teller opp
:: Navn | 64 %         stolpediagram, én linje per stolpe (stolpene vokser)
-> Steg                prosess med piler som tegnes mellom stegene
> Sitat  +  — Navn
||                     åpner en kolonne (alt før første || er felles topp)
![tekst](url)          bilde, eller video (.mp4/.webm)
🌍                     en linje med bare emoji blir et stort ikon
---                    skillelinje
```

## Komposisjon

- **Hierarki gjennom skala.** Tittel `s ≈ 1`. Hovedavsnitt `s ≈ 0.45–0.75`. Detaljer ligger **inni** rammen de
  hører til, med `s ≈ 0.04–0.12`, og helst nær kanten, så de ikke dekker teksten. Dykk gjerne flere nivåer:
  0,9 → 0,1 → 0,012 fungerer fint.
- **Avstand.** Rammer på samme nivå skal ikke overlappe. For `s ≈ 0.6` passer 1300–1900 enheter mellom sentrene.
  Bygg-skriptet sier fra om overlapp.
- **Rotasjon.** ±2–8° på noen rammer. Ikke roter alt.
- **Tekstbudsjett.** Høyst ca. 30 ord per ramme. Én tanke per ramme. Lister: 3–5 punkter med `steg: true`.
- **Fri tekst.** Store titler og prosesser er ofte finest som `form: "fri"` direkte på lerretet, uten kort rundt.
- **Notater** på de fleste rammene: det presentatøren skal si, eller et spørsmål til publikum.
- **Pynt.** Et stort ord med `dybde` 0,3 og `opasitet` 0,03–0,05 bak midten. 2–3 `glod` bak viktige rammer i
  palettens farger. En tematisk SVG. 2–4 `prikk` med `dybde` 1,4–1,7. Ikke mer.
- **Stemning.** Gi 2–3 rammer en `stemning`-farge, så rommet skifter lys underveis.

## Sjekkliste før levering

- [ ] Du har valgt en romlig metafor, og oversiktsbildet viser den tydelig
- [ ] Stilen er tilpasset temaet, har eget navn og er ikke en kopi av forrige presentasjon
- [ ] Minst ett dykk inn i en detalj og minst to «husk dette»-øyeblikk
- [ ] Former og innholdstyper varierer, og ingen ramme har for mye tekst
- [ ] `bygg.mjs` gir ingen advarsler, og skjermbildene ser bra ut
- [ ] Publisert som Artifact, committet og pushet

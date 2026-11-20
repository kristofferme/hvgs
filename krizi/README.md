# Krizi

Presentasjoner på et uendelig lerret. Kameraet flyr, dykker og roterer mellom ideene dine, bakgrunnen lever, og
teksten kommer til live når du lander. Hver presentasjon er én HTML-fil som du både viser og redigerer i nettleseren.

## Lage en presentasjon

Si **«bruk krizi»** til Claude og fortell hva den skal handle om. Claude velger en romlig metafor og en egen stil
for temaet, og legger presentasjonen i `presentasjoner/` (oppskriften står i `.claude/skills/krizi/SKILL.md`).

Du kan også starte selv: åpne `ny.html`, trykk **E** og begynn.

## Presentere

| Tast | |
|---|---|
| → / mellomrom / klikk | neste |
| ← | forrige |
| O | oversikt over hele lerretet |
| hjul, klyp, dra | zoom og flytt fritt («Tilbake til stien» bringer deg tilbake) |
| F | fullskjerm |
| P | presentatørvisning i eget vindu: notater, neste ramme og tid |
| N | notater på skjermen |
| S | fokuslys som følger musa |
| L | laserpeker |
| B | svart skjerm |

På telefon sveiper du for å gå videre.

## Redigere

Trykk **E**.

- **Dobbeltklikk på tekst** for å skrive rett i rammen. Enter er ferdig, Shift+Enter gir ny linje, og Enter i en
  liste lager et nytt punkt. Tab hopper til neste tekstblokk.
- **Dobbeltklikk på tomt lerret** for å lage en ny ramme akkurat der.
- **Legg til** nederst viser maler med forhåndsvisning: tittel, punkter, stort tall, sitat, sammenligning,
  prosess, diagram, idé, lapp, skiftende ord, gjemt detalj og bilde. Nye rammer legges på ledig plass ved siden av
  den du står på.
- **Verktøylinja** over valgt ramme: form, rammestil, farge og stemning, animasjon (forhåndsvises med en gang),
  kameraovergang, punkter ett og ett, kobling til en annen ramme, og mer.
- **Dra** en ramme for å flytte den. Rammer inni følger med, og hjelpelinjer viser når du treffer kanter og
  midtpunkter (hold Alt for å slå dem av). **Hjørnene** skalerer, **prikken over** roterer.
- **Ny stil** (terningen) setter sammen en helt ny stil. Panelet til høyre har ferdige stiler og alle byggeklossene:
  palett og egne farger, verden, skrift, rammer, tekstanimasjon, bevegelse, overgang, sti og filmkorn.
- **Slipp eller lim inn et bilde** for å legge det på lerretet.
- **Ctrl+Z** angrer. **Ctrl+S** lagrer fila. I Chrome og Edge lagres den rett tilbake i samme fil, mens andre
  nettlesere laster den ned.
- Endringer lagres også fortløpende i nettleseren, så du får spørsmål om å hente dem tilbake hvis du lukker uten
  å lagre.

**Kopier som tekst** (i panelet) gir deg hele presentasjonen som tekst. Lim den inn hos Claude for å be om endringer.

## Byggeklosser

16 paletter · 12 skriftpar · 12 levende verdener (nordlys, stjerner, rutenett, prikker, kartlinjer, bølger,
nettverk, lysglimt, tavle, akvarell, papir, ren) · 8 rammestiler · 4 former · 5 bevegelser · 10 tekstanimasjoner ·
6 kameraoverganger.

## For utviklere

```bash
node krizi/bygg.mjs innhold.json krizi/presentasjoner/navn.html   # JSON → HTML
node krizi/bygg.mjs --json krizi/presentasjoner/navn.html         # HTML → JSON
node krizi/bygg.mjs --alle                                       # ny motor i alle presentasjoner
node krizi/verktoy/bilder.mjs krizi/presentasjoner/navn.html ut/  # skjermbilder av hvert steg
```

Motoren ligger i `motor/js/` (settes sammen i alfabetisk rekkefølge til ett skript) og `motor/css/`, uten
avhengigheter. Kamerabevegelsen følger van Wijk og Nuij («Smooth and efficient zooming and panning»), med egne
varianter for dykk, sveip, spiral, kutt og drift. Bakgrunnene tegnes på canvas og følger kameraet med parallakse
og uendelig zoom.

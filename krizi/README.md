# Krizi

Presentasjoner på et uendelig lerret. Kameraet flyr, zoomer og roterer mellom ideene dine, og hver
presentasjon er én HTML-fil som du både viser og redigerer i nettleseren.

## Lage en presentasjon

Si **«bruk krizi»** til Claude og fortell hva den skal handle om. Claude bygger presentasjonen etter
oppskriften i `.claude/skills/krizi/SKILL.md` og legger den i `presentasjoner/`.

Du kan også starte med en tom presentasjon: åpne `ny.html`, trykk **E** og begynn.

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
| L | laserpeker |
| B | svart skjerm |

På telefon sveiper du til siden for å gå videre.

## Redigere

Trykk **E**.

- **Kort, Sirkel, Tekst, Bilde** nederst legger til en ny ramme der du står.
- **Dra** en ramme for å flytte den. Rammer som ligger inni, følger med.
- **Hjørnene** skalerer, **prikken over** roterer (hold Shift for 15°-trinn).
- **Dobbeltklikk** for å skrive. Innholdet skrives i enkel markdown (se «Slik skriver du» i panelet).
- **Slipp eller lim inn et bilde** for å legge det på lerretet.
- Panelet uten valgt ramme: tema, stiens rekkefølge (dra eller bruk pilene) og automatisk oppsett
  (Reise, Spiral, Dykk, Rutenett).
- **Ctrl+Z** angrer. **Ctrl+S** lagrer fila. I Chrome og Edge lagres den rett tilbake i samme fil,
  i andre nettlesere lastes den ned.
- Endringer lagres også fortløpende i nettleseren, så du får spørsmål om å hente dem tilbake hvis du lukker uten å lagre.

**Kopier som tekst** (i panelet) gir deg hele presentasjonen som tekst. Lim den inn hos Claude for å be om endringer.

## For utviklere

```bash
node krizi/bygg.mjs innhold.json krizi/presentasjoner/navn.html   # JSON → HTML
node krizi/bygg.mjs --json krizi/presentasjoner/navn.html         # HTML → JSON
node krizi/bygg.mjs --alle                                       # ny motor i alle presentasjoner
node krizi/verktoy/bilder.mjs krizi/presentasjoner/navn.html ut/  # skjermbilder av hvert steg
```

Motoren ligger i `motor/` og har ingen avhengigheter. Kamerabevegelsen følger van Wijk og Nuij
(«Smooth and efficient zooming and panning»). Den zoomer naturlig ut og inn igjen i stedet for å gli flatt.

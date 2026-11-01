# Fiske og fangst Vg2

Et digitalt læremiddel for programfagene i **Vg2 fiske og fangst** (læreplan
FFA02-03): *fartøy og redskaper* (337 timer), *fangst og kvalitet* (140 timer)
og *yrkesfaglig fordypning* (253 timer).

Laget for elever som lærer best med hendene og øynene: over 40 tekniske
tegninger, simulatorer, regneoppgaver med umiddelbar tilbakemelding, praktiske
oppdrag som arbeidsordre, og sjekklister i stor skrift til bruk om bord.

```
python3 bygg.py          # lager publisert/index.html – én fil, virker uten nett
```

Ingen avhengigheter utover Python 3. Åpne `publisert/index.html` i en nettleser,
del den i Teams, eller legg mappa på Netlify (se `netlify.toml`).

## Innhold

| | Moduler |
| --- | --- |
| **Fartøy og redskaper** | FR·01 Livet om bord · 02 Sikkerhet og beredskap · 03 Fartøyet og dekksutstyret · 04 Stabilitet · 05 Navigasjon · 06 Sjøveisregler og brovakt · 07 Vær, strøm og fiskeleting · 08 Redskaper · 09 Motor og vedlikehold · 10 Miljø om bord |
| **Fangst og kvalitet** | FK·01 Artene vi fisker · 02 Forvaltning og regelverk · 03 Seleksjon og bærekraft · 04 Fangstbehandling om bord · 05 Tilvirking og råstoffutnyttelse · 06 Kvalitet og hygiene · 07 Økonomi, lott og marked |
| **Yrkesfaglig fordypning** | YF·01 Praksis og veien videre |

Hver modul har *kort fortalt*, fagtekst, tegninger, quiz, praktiske oppdrag,
«Kan jeg dette?» og kilder, og er knyttet til kompetansemålene og
kjerneelementene i læreplanen. Timetallene summerer til læreplanens.

**Verktøy:** stabilitetssimulator (ekte GZ-kurve fra et spantsnitt),
lanternetrener, vikepliktstrener, sektorfyr, fart–distanse–tid,
lottkalkulator, artskort og artsquiz, sikker jobbanalyse (SJA),
nødmelding (MAYDAY/PAN-PAN) og praksislogg.

**Om bord-kort:** mann over bord, nødmelding, brann, motorsjekk og før avgang.

**For lærer:** målmatrise, forslag til årsplan, vurderingsformer og en
illustrasjonsbank der alle tegningene kan kopieres som SVG.

## Designet

Identiteten er hentet fra sjøkartet: dypvannshvitt, grunne blåtoner, landgult,
kartmagenta for navigasjonsinformasjon og overlevingsoransje for sikkerhet.
Kartrammens svart-hvite gradstige går igjen øverst på alle sider, og forsiden er
et Mercator-kart der hver modul er en havn på kursen fra Hustadvika til Vardø.
Nattpaletten er laget som broa om natta – mørk og dempet.

Fotografiene bærer designet: forsiden åpner på havna i Reine, hver etappe har
sitt eget omslagsbilde fra kysten, og bølgekanter og dyphavsblått binder
sidene sammen ned mot bunnen av sida. Tegningene (SVG) brukes der et foto ikke
kan forklare – stabilitet, lanterner, redskap, kart.

Skrifter: Barlow Condensed (overskrifter), Atkinson Hyperlegible Next
(brødtekst – laget for lesbarhet), IBM Plex Mono (tall og data) og
Big Shoulders Stencil (modulkodene, som malt på skroget). Alle ligger inne i
fila.

## Fotografier

`foto/` har 29 fotografier fra norsk og nordatlantisk kyst (WebP, maks 1280 px).
Alle er hentet fra Open Images-datasettet (Flickr) og har lisensen
**CC BY 2.0**. Fotograf, originaltittel og lenker står i
`foto/kreditter.json`, og bygget legger kreditten under hvert bilde og i en
samlet tabell på lærersiden. Nytt foto: legg `navn.webp` i `foto/`, legg til
en oppføring i `kreditter.json` og bruk det som `{ t: "foto", foto: "navn",
cap: "…" }` i en modul, eller som omslag i `FF.omslag` i `kjerne.js`.

## Egne bilder

Legg bilder i `bilder/` med modulkoden først i filnavnet, for eksempel
`fk-04-bløgging-om-bord.jpg`, og kjør `python3 bygg.py`. Se `bilder/LES-MEG.txt`.

## Mappene

```
bygg.py               bygger én selvstendig HTML-fil
src/index.html        mal
src/css/              grunnmur, skall, blokker og verktøy
src/js/kjerne.js      hjelpere, lagring, tale, SVG-hjelpere
src/js/fig/           tegningene (kart, fartøy, sikkerhet, stabilitet, navigasjon,
                      redskaper, fisk, motor, fangst, forvaltning)
src/js/innhold/       læreplanen, modulene, ordlista og lærersiden
src/js/verktoy/       simulatorer, kalkulatorer og om bord-kort
src/js/app.js         visninger og ruter
verktoy/              hent_fonter.py og lag_kart.mjs (kjøres bare ved endringer)
foto/                 fotografier + kreditter.json (CC BY 2.0)
bilder/               lærerens egne bilder
```

## Kilder og forbehold

Fagstoffet bygger på læreplanen FFA02-03 (Udir), Sjøfartsdirektoratet,
Fiskeridirektoratet, Lovdata, Kystverket, Mattilsynet, Havforskningsinstituttet,
Hovedredningssentralen og salgslagene. Kompetansemålene er gjengitt i kortform.
Tall som endres ofte – minstemål, kvoter og stengte felt – er med vilje ikke
skrevet inn; elevene øver på å finne gjeldende regler selv. Stabilitets-
simulatoren er en læringsmodell, ikke et godkjent stabilitetsprogram.

Kystlinja er fra Natural Earth (fri bruk).

# Klar – moderne tema for Visma InSchool

En Chrome-utvidelse som gir Visma InSchool (`*.inschool.visma.no`) et rolig,
moderne og godt lesbart design – uten å endre hvordan tjenesten fungerer.

![Etter: startside i lys modus](docs/02-etter-lys.png)

<table>
<tr>
<td width="50%"><img src="docs/01-for.png" alt="Før"><br><em>Før</em></td>
<td width="50%"><img src="docs/03-etter-mork.png" alt="Etter, mørk modus"><br><em>Etter, mørk modus</em></td>
</tr>
</table>

## Hva du får

- **Tydelig sidemeny.** Rolig meny med tydelig aktiv markør, egen merkevareblokk og god luft –
  lys som resten av grensesnittet, eller mørk om du heller vil ha det.
- **Kort som ser ut som kort.** Én skyggeverdi, én kantfarge, konsekvent radius – ingen dobbelt innramming.
- **En rolig hilsen på startsiden.** Dato, ukenummer, semester og klokke i samme flate som
  kortene – og bare der. Resten av skjermene får være i fred.
- **Fargekodet timeplan.** Hvert fag får sin faste tone, valgt slik at nabofagene er lette å
  skille, og fargen huskes mellom økter. Dagens kolonne markeres med «I DAG», og avlyste
  timer tones ned.
- **Lesbarhet som er målt, ikke antatt.** Hver tekst måles mot flaten den faktisk ligger
  på, og løftes til minst 4.5:1 der appens egne farger ikke holder – med fargetonen i behold.
- **Lys og mørk modus** (eller «auto» etter systemvalget), fem aksentfarger, to tettheter.
- **Typografi.** Switzer følger med utvidelsen i fire vekter, med systemfont som reserve.

## Installer

1. Last ned mappen `visma-inschool-theme/` (eller klon repoet).
2. Åpne `chrome://extensions` i Chrome.
3. Slå på **Utviklermodus** øverst til høyre.
4. Klikk **Last inn upakket** og velg mappen `visma-inschool-theme`.
5. Gå til `https://frena-vgs.inschool.visma.no/#/app/timetable` og last siden på nytt.

Utvidelsen kjører kun på `https://*.inschool.visma.no/*`.

## Bruk

- Klikk på ikonet i verktøylinja for å åpne panelet med innstillinger.
- Knappen nede til høyre bytter mellom lys og mørk.
- Hurtigtaster: `Alt+Shift+D` lys/mørk, `Alt+Shift+K` slår temaet av og på.

Innstillingene lagres i `chrome.storage.sync` og slår inn med én gang, uten omlasting.

| Innstilling | Valg | Standard |
| --- | --- | --- |
| Utseende | Auto / Lys / Mørk | Auto |
| Aksentfarge | Gran, Hav, Plomme, Rav, Kobolt | Gran |
| Tetthet | Luftig / Kompakt | Luftig |
| Sidemeny | Lys / Mørk | Lys |
| Hilsen på startsiden | på / av | på |
| Fargekodet timeplan | på / av | på |
| Snarveiknapp | på / av | på |

## Designsystemet

**Farge.** Lys modus er varmt papir (`#f2f0ea`) med hvite flater, ikke kald grå – det gir
mindre flimmer på en skjerm man ser på hele skoledagen. Mørk modus er nøytralt kull med
flater som skiller seg fra bakgrunnen på lystyrke, ikke på kant. Aksenten er dyp gran
(`#17594e`) i lys modus og mynte (`#5ec8a8`) i mørk, slik at kontrasten holder seg over
4.5:1 begge veier. Statusfarger (grønn, gul, rød, blå) er dempet mot samme papirtone,
og timeplanen bruker ti toner som er valgt for å kunne stå ved siden av hverandre.

**Typografi.** Switzer (Indian Type Foundry, via Fontshare) i vektene 400/500/600/700 –
en nøytral grotesk med åpne former som tåler små størrelser. Strammere sporing på
overskrifter, tabulære tall i tabeller og timeplan, og små, versale etiketter til
seksjonsoverskrifter.

**Farge som flate, ikke som kant.** Ingen fargede rammer, streker eller kantlinjer på
kort og timer – fargen ligger i flaten, kanten er alltid nøytral. Bakgrunnen er ensfarget,
og aksentfargen brukes bare der den betyr noe: aktivt menypunkt, primærknapp, fokus og
dagens kolonne.

**Temaet legger seg ikke oppå appen.** Har InSchool allerede luft i en beholder – typisk
fordi sidemenyen eller topplinja er `position: fixed` – beholdes den. Kort som allerede
har innvendig luft og avstand får beholde sin egen. Vi fyller bare på der det mangler,
slik at ingen kolonner sklir under menyen og ingen lister blir dobbelt så luftige.

**Kontrast.** Ingen tekst under WCAG AA. Semantiske farger (grønn, gul, rød, blå) er
justert til å klare 4.5:1 mot sine egne bakgrunner, og alt annet rettes opp av
kontrastmålingen som beskrives under.

**Form.** Én radiusskala (6/10/14/20/26 px), tre skyggenivåer, og bevegelse kun der den
forklarer noe – 180 ms, alltid med respekt for `prefers-reduced-motion`.

Alt ligger som variabler i [`css/tokens.css`](css/tokens.css). Vil du endre paletten,
er det den ene filen du trenger å røre.

## Slik virker det

Visma InSchool er en Angular-app med genererte klassenavn som kan endre seg mellom
versjoner. Temaet er derfor ikke låst til bestemte klasser. I stedet leser
[`js/classify.js`](js/classify.js) siden slik en bruker ser den – geometri, ARIA-roller,
farger og innhold – og merker elementene med `data-klar-el="sidebar | topbar | main |
card | nav-item | btn | field | table | badge | event | surface | backdrop"`.
CSS-en styler kun disse merkelappene.

Noen detaljer som er verdt å vite:

- **Opprinnelige farger huskes.** Første gang et element ses, lagres sidens egne farger.
  Uten det ville neste skann lest våre egne farger og gradvis feilklassifisert alt.
- **Flater males om.** Nesten-hvite og grå flater knyttes til paletten, og i mørk modus
  lysnes tekst som ellers ville forsvunnet. Elementer vi allerede har gitt en rolle,
  røres ikke.
- **Kontrasten måles.** For hver tekst finner vi flaten den faktisk står på ved å gå
  oppover i treet til første ugjennomsiktige farge. Er forholdet under 4.5:1, løftes
  lysheten trinnvis med fargetonen i behold, til kravet er innfridd. Ligger teksten på
  en gradient eller et bilde, lar vi den være – da kan vi ikke måle pålitelig. Målingen
  gjentas ved hvert fullskann, siden flatene kan ha endret farge underveis.
- **Appens egen luft respekteres.** Har hovedflaten allerede innrykk – typisk fordi
  sidemenyen eller topplinja er `position: fixed` – legger vi ikke vår egen padding
  oppå. Vi fyller bare på der det ikke finnes luft fra før.
- **Fargekoding krever en klynge.** Fargede felter blir bare til timer når minst tre
  ligger samlet under samme beholder. En enslig infoboks får beholde sin egen farge.
  Tonen velges ut fra fagnavnet – den mest fremhevede teksten i timen – slik at samme
  fag har samme farge uansett dag, tid og rom. Tonene deles ut i en rekkefølge som
  hopper rundt fargesirkelen, ikke via en hash, slik at fag som står ved siden av
  hverandre aldri får nesten samme farge. Tildelingen huskes i nettleseren.
- **Ruteendringer følges.** `hashchange`, `popstate` og `history.pushState` utløser nytt
  skann, i tillegg til en `MutationObserver` for innhold som lastes underveis.
- **Stilarkene holdes bakerst** i `<html>`, slik at appens egne, dynamisk innlastede ark
  ikke overstyrer temaet.
- **Skriften lastes med FontFace-API-et** fra utvidelsens egne filer, som også virker om
  siden har streng CSP for `font-src`.

## Personvern

Utvidelsen leser ingen skoledata og sender ingenting noe sted. Den har `storage` for egne
innstillinger og tilgang til `*.inschool.visma.no` for å kunne style siden. Ingen
nettverkskall, ingen sporing, ingen eksterne ressurser – Switzer ligger i utvidelsen.

## Utvikling

```
visma-inschool-theme/
├── manifest.json
├── css/     tokens, base, layout, komponenter, timeplan
├── js/      settings, inject, classify, hero, main, background
├── popup/   innstillingspanel
├── fonts/   Switzer 400/500/600/700 + NOTICE.md
└── test/    testsider + skjermbildeoppsett (Playwright)
```

Testsidene etterligner tre ganske ulike DOM-strukturer – `mock-vis.html` er bygd etter
InSchool sin faktiske oppbygning med fast meny, pilleformede undermenypunkter og
pastellfargede timer – slik at strukturgjenkjenningen kan prøves uten innlogging:

```bash
npx http-server test -p 8899 -s &
node test/screenshot.js            # skjermbilder + hva som ble gjenkjent
node test/audit.js                 # måler tekstkontrast på alle tre sidene
```

`audit.js` går gjennom hver tekst på siden, måler den mot flaten den ligger på og
rapporterer alt under WCAG AA – med og uten temaet. Sist kjøring:

| Side | Uten tema | Med tema (lys) | Med tema (mørk) |
| --- | --- | --- | --- |
| VIS-lik startside | 11 av 74 under kravet | 0 av 54 | 0 av 54 |
| Timeplan | 22 av 84 under kravet | 0 av 60 | 0 av 60 |
| Variant | 6 av 33 under kravet | 0 av 27 | 0 av 27 |

## Kjente begrensninger

- Temaet er utviklet og testet mot tre testsider som etterligner InSchool, ikke mot en
  innlogget konto. Strukturgjenkjenningen er laget for å tåle ukjent markup, men om en
  skjerm i den ekte tjenesten ser feil ut, er det som regel nok å justere terskler i
  `js/classify.js` eller legge til en regel i `css/components.css`.
- Utvidelsen endrer bare utseende. Den fyller ikke ut skjemaer, henter ikke data og
  endrer ikke funksjonalitet.

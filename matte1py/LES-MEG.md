# Matematikk 1P-Y NA

Interaktivt læremiddel i matematikk 1P-Y for Vg1 naturbruk ved Hustadvika
vidaregåande skole. Rein HTML, CSS og JavaScript – ingen byggesteg, ingen
innlogging. Framdrift og XP blir lagra i nettlesaren til eleven.

## Køyre lokalt

```
cd matte1py
python3 -m http.server 8000
```

Opne http://localhost:8000. Fila kan òg opnast direkte (index.html).

## Publisere

Mappa har eigen `netlify.toml`. Lag ein ny Netlify-side med *Base directory*
`matte1py`. Same mappe kan òg leggjast på GitHub Pages eller ein skuleserver.

## Innhald

| Kapittel | Utforsk (interaktivt) |
| --- | --- |
| 1 Tal og rekning | Rekkjefølgje-maskina, brøkjordet, tierskala, komma-hopparen, overslagsspelet |
| 2 Einingar og måling | Einingstrappa, dekar-ruta, desimalklokka |
| 3 Forhold, målestokk og blanding | Perlesnora, kartlinjalen, blandingstanken |
| 4 Prosent og vekst | Prosentlinja, vekstmaskina, prosent eller prosentpoeng |
| 5 Areal, omkrins og Pytagoras | Beiteplanleggjaren, rull hjulet, kvadrata til Pytagoras |
| 6 Volum og overflate | Figurstudio (sylinder, prisme, kjegle, merd), fyll tanken |
| 7 Funksjonar og modellar | Linjelaben, treff punkta (regresjon), to utleigarar |
| 8 Statistikk | Fisketuren (prikkplott), diagrambyggjaren |
| 9 Økonomi og rekneark | Lønnsslippen, mva-snuaren, rekneark-laben |
| 10 Algoritmar og programmering | Tenk som ei datamaskin, Python i nettlesaren |

I tillegg: Matteløypa (fri trening og 90-sekunds sprint), dagens oppgåve,
formelark (F), kalkulator (K), koordinatpeikar, lys/mørk modus og rangar
(Lærling → Matte-legende) med kombo-XP.

## Språk

Standard er bokmål, med nynorsk som val (knappen BM · NN). Innhaldet er
skrive på nynorsk og blir omsett til bokmål med ordboka i `js/spraak.js`.
Finn du eit ord som ikkje blir omsett, legg det til i lista `par` der
(`nynorsk:bokmål`), eller i `FRASAR` for uttrykk på fleire ord.

## Penn og papir

`js/papir.js` har oppgåveark til kvart kapittel (nivå 1–3, med deloppgåver)
og løysingsforslag. Sidene `#papir-<kapittel>` og `#fasit-<kapittel>` kan
skrivast ut. `#papir` er oversikta (oppgåvehefte).

## Bilete, lenker og video

`js/ressursar.js`. Bilete blir henta frå Wikimedia Commons med
`Special:FilePath` og har lenke til filsida (fotograf og lisens står der).
Lastar eit bilete ikkje, blir det berre skjult. Videoar legg du til som
`{ yt: 'YouTube-ID', tittel, kjelde }`; dei blir viste som klikk-for-å-spele
via youtube-nocookie.com.

## Endre og leggje til

Kvart kapittel er éi fil i `js/kap/`. Eit kapittel består av seksjonar med
blokker av typane `teori`, `eksempel`, `utforsk` og `oving`. Formlar skriv du
mellom `$ … $` (til dømes `$\frac{a}{b}$`, `$x^2$`, `$\pi r^2$`).

Ei øvingsoppgåve er ein funksjon som returnerer
`{ tekst, svar, eining, tips, losning }` – tala blir trekte på nytt kvar gong.
Fleirval: `{ tekst, val: [...], svar: indeks }`.

Kompetansemåla bør sjekkast mot ordlyden på udir.no (LK20, matematikk 1P-Y).

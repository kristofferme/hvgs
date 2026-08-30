# fmscout

En speider for Football Manager-saver. Åpne fila, få alle spillerne i én
tabell du kan sortere, filtrere og eksportere til CSV.

Laget for Mac. Det eneste du trenger er Python 3, som allerede ligger der.
Ingen pakker skal installeres, og ingenting sendes ut av maskinen – tabellen
kjører på `127.0.0.1` og saven blir liggende der den ligger.

```
python3 fmscout.py demo              prøv den med oppdiktede spillere
python3 fmscout.py åpne save.fm      din egen save
```

<img width="900" alt="" src="doc/skjermbilde.png">

## Kom i gang

```bash
cd fmscout
python3 fmscout.py demo
```

Nettleseren åpner seg med 900 oppdiktede spillere. Alt i tabellen virker –
filtrene, kolonnevelgeren, CSV-eksporten – så du ser hva verktøyet er før du
peker det mot din egen save.

## To veier inn

Det er to måter å få spillere inn i tabellen på, og de gir deg ulike ting.

### 1. En eksport fra FM – virker med en gang

I FM: gå til en spillerliste (stallen, et søk, en speiderrapport), marker alt
med ⌘A, trykk ⌘P og velg **Web Page (.html)**. Alle kolonnene du har i
visninga blir med i fila.

```bash
python3 fmscout.py åpne ~/Downloads/stall.html
```

Dette virker alltid, uansett FM-versjon. Ulempen er at FM ikke viser CA og PA
noe sted, så de kolonnene får du ikke med. Du kan gjerne åpne flere filer på
én gang – da slås de sammen, og en spiller som står i to av dem beholder den
oppføringa med flest utfylte felt:

```bash
python3 fmscout.py åpne stall.html speiderliste.html frie-spillere.rtf
```

`.html`, `.rtf` og `.csv` går alle sammen inn her.

### 2. Selve saven – for CA og PA

```bash
python3 fmscout.py åpne ~/Documents/Sports\ Interactive/Football\ Manager\ 2026/mitt-lag.fm
```

Første gang tar det litt tid: fila pakkes ut og legges i et mellomlager under
`~/Library/Caches/fmscout/`, så går det fort etterpå.

**Vær klar over hva dette er.** Sports Interactive dokumenterer ikke formatet
på lagringsfilene sine, og de endrer det mellom versjoner. Verktøyet har
derfor ingen ferdige tall for FM26 liggende i koden – det *leter* dem opp i
akkurat den fila du gir det:

* En save er mange deflate-komprimerte blokker etter hverandre. Vi går gjennom
  fila og pakker ut alt vi finner, uten å bry oss om hvordan indeksen ser ut.
* Attributtene til en spiller ligger etter hverandre, og alle er tall mellom 1
  og 20. En stripe på 16 eller flere slike bytes på rad skjer nesten aldri
  ellers – men den skjer én gang per spiller. Stripene gir tabellen, og
  avstanden mellom to striper gir lengden på én spillerrecord.
* CA og PA kjennes igjen på oppførselen: CA er den byten som følger
  attributtene tettest når du rangerer spillerne, og PA er den som har noen få
  prosent verdier i 246–255 – FM sin måte å si «potensialet ligger et sted i
  dette intervallet».
* Navn, klubb og nasjonalitet finnes ved å følge pekerne inn i strengtabellen.

Det som *ikke* går av seg selv, er hvilken attributt som er hvilken. Rekkefølgen
står ingen steder i fila. Der trenger verktøyet hjelp – se neste avsnitt.

Metoden er testet mot en fil som er bygd med samme form som en save (`python3
-m unittest discover -s tester`), der den finner igjen alle spillerne med alle
feltene uten et eneste offset skrevet inn på forhånd. Om den treffer like godt
på en ekte FM26-save, avhenger av hvordan SI har lagt opp akkurat den
versjonen. Blir noe feil, er det skjemaet som skal rettes, ikke koden – og
`sjekk` viser deg hva som faktisk ligger i fila.

## Kalibrering – gi attributtene riktig navn

Slå opp to–fem spillere i FM og skriv av verdiene deres. Da vet verktøyet hva
det ser på.

```bash
python3 fmscout.py kalibrer --lag-ankermal ankere.json
```

Fyll ut fila – navnet må stå nøyaktig som i FM:

```json
[
  {
    "navn": "Martin Ødegård",
    "alder": 24,
    "klubb": "Hustadvika FK",
    "nasjonalitet": "Norge",
    "posisjoner": "M (C), AM (C)",
    "attributter": {"Pas": 15, "Tec": 14, "Dec": 13, "Acc": 12, "Sta": 15}
  }
]
```

Både forkortelsene fra FM (`Pas`, `OtB`, `1v1`) og de fulle navna (`Passing`,
`Off the Ball`) går an. Jo flere attributter du skriver av, jo flere kolonner
får navn – og med to–tre spillere blir det sjelden tvil om hvilken som er
hvilken.

```bash
python3 fmscout.py kalibrer mitt-lag.fm --ankere ankere.json
```

Skjemaet lagres og blir brukt automatisk neste gang du åpner den saven. Har
spilleren en navnebror i databasen, sier verktøyet fra og velger den recorden
som passer med verdiene du oppga.

Vil du se hva som ligger i fila før du kalibrerer:

```bash
python3 fmscout.py sjekk mitt-lag.fm
```

Den viser blokkene, litt tekst fra dem, tabellene som ser ut som spillere, og
hvilke bytes som er kandidater til CA og PA.

## Tabellen

* **Søk** øverst treffer navn, klubb, liga og nasjonalitet. `/` hopper dit.
* **Posisjoner** – klikk på brikkene, eller ta en hel gruppe (Forsvar,
  Midtbane, Kant, Angrep). Velg om spilleren må kunne *minst én* av dem eller
  *alle*.
* **Tall** – alder, CA, PA, rom (PA minus CA), rykte, verdi, lønn. Trenger du
  flere, legger du dem til nederst i bolken.
* **Attributtkrav** – «Passing minst 15» og «Vision minst 14» samtidig, så
  mange du vil.
* **Klubb og nasjonalitet** – avkryssing med søkefelt og antall.
* **Kolonner** – velg fritt blant alle feltene, eller ta et ferdig sett:
  Nøkkeltall, Teknisk, Mental, Fysisk, Keeper, Skjult, Alt.
* Klikk på en overskrift for å sortere. Shift-klikk legger til et nivå til.
* Klikk på en rad for å se hele spilleren i panelet til høyre.

Filtrene og kolonnevalget huskes til neste gang du åpner samme fil.

## CSV

Knappen **Eksporter CSV** laster ned det du ser – med de filtrene og den
sorteringa du har satt, ikke bare sida på skjermen. Du får spørsmål om du vil
ha alle kolonnene eller bare de synlige.

Fra terminalen:

```bash
python3 fmscout.py eksporter mitt-lag.fm -o spillere.csv
python3 fmscout.py eksporter stall.html -o utvalg.csv --kolonner navn,alder,klubb,ca,pa
python3 fmscout.py eksporter mitt-lag.fm -o data.csv --skilletegn ,
```

Standard er semikolon og desimalkomma, som er det Excel på en norsk Mac åpner
uten å spørre om noe. Skal tallene rett inn i pandas eller R, bruk
`--skilletegn ,` – da blir desimalskilletegnet punktum.

## Kommandoer

| Kommando | Gjør |
| --- | --- |
| `demo` | lager en oppdiktet save og åpner tabellen |
| `åpne <fil …>` | åpner tabellen for en save eller en eller flere eksporter |
| `eksporter <fil …> -o ut.csv` | skriver rett til CSV |
| `sjekk <save.fm>` | viser hva som ligger i fila |
| `kalibrer <save.fm>` | finner ut hvordan saven er satt sammen |
| `skjemaer` | lister skjemaene du har fra før |

Nyttige valg: `--port` (fast portnummer), `--ikke-åpne` (ikke start
nettleseren), `--grense N` (les bare de første N spillerne mens du prøver deg
fram), `--skjema` (bruk et bestemt skjema), `--kalibrer-på-nytt`.

## Når noe ikke stemmer

**«Fant ingen tabell som ser ut som spillere.»** Kjør `sjekk` på fila. Får du
lesbare klubbnavn ut av blokkene, er saven pakket ut riktig, og det er
tabellsøket som ikke traff – gi beskjed om hva `sjekk` viser. Får du bare
støy, er saven trolig kryptert eller lagret i et format vi ikke er med på.

**Klubb og liga er byttet om.** Åpne skjemaet (`skjemaer` viser hvor det
ligger) og bytt om de to offsetene. Det er en tekstfil, og den er ment å rettes
på.

**Attributtene heter `attributt_07`.** Da er ingen ankere brukt, eller navnene
i ankerfila stemmer ikke med saven. Legg inn flere spillere og kjør `kalibrer`
på nytt.

**CA og PA ser rare ut.** `sjekk` lister kandidatene med begrunnelse. Er det en
annen byte som ser riktigere ut, sett offsetet inn i skjemaet.

**Det tar lang tid første gang.** Utpakkinga går gjennom hele fila. En stor
save kan ta noen minutter. Etterpå ligger den i mellomlageret. Skal du rydde:
`rm -rf ~/Library/Caches/fmscout`.

## Tester

```bash
python3 -m unittest discover -s tester
```

30 tester som dekker utpakking, tabellsøk, kalibrering, import av
FM-eksporter, filtrering, CSV og tjeneren.

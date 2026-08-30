# Skjemaer

Et skjema er en JSON-fil som sier hvor i en spillerrecord de ulike verdiene
ligger. `kalibrer` skriver ett for saven din, og det havner i
`~/Library/Caches/fmscout/profiler/`. Ferdige skjemaer som skal følge med
verktøyet, kan legges her – da kan de brukes med `--skjema <navn>`.

```json
{
  "navn": "fm26-mars",
  "blokk": 42,            // hvilken utpakket blokk tabellen ligger i
  "strengblokk": 11,      // blokka med navn, klubber og landsnavn
  "start": 0,             // hvor i blokka den første recorden begynner
  "stride": 512,          // hvor mange bytes én spiller tar
  "antall": 187432,
  "felt": {
    "navn":   {"offset": 12, "type": "peker"},
    "klubb":  {"offset": 40, "type": "indeks16", "startindeks": 0},
    "ca":     {"offset": 88, "type": "u8"},
    "pa":     {"offset": 89, "type": "u8"},
    "alder":  {"offset": 90, "type": "u8"},
    "hoyde":  {"offset": 92, "type": "u8", "pluss": 120}
  },
  "attributter": {"passing": 140, "finishing": 141}
}
```

## Typer

| Type | Betyr |
| --- | --- |
| `u8`, `i8`, `u16`, `i16`, `u32`, `i32` | tall, slik de ligger i fila |
| `tekst` | tekst i et fast antall bytes, sett `"lengde"` |
| `peker` | et 32-bits tall som er *offsetet* til en streng i strengblokka |
| `indeks16`, `indeks32` | et tall som er *nummeret* på strengen i strengblokka |

Alle talltyper kan ha `"pluss"` (legges til) og `"skala"` (ganges med), og
`"kart"` som gjør tall om til tekst: `{"kart": {"1": "Høyre", "2": "Venstre"}}`.
`peker` kan ha `"basis"`, `indeks*` kan ha `"startindeks"` – begge legges til
råverdien før oppslaget.

PA trenger ingen spesialbehandling: verdier fra 246 til 255 blir tolket som
FM sitt «−1 til −10», altså «potensialet ligger et sted i dette intervallet»,
og spilleren får `PA anslått = ja`.

## Å rette et skjema for hånd

Er en kolonne åpenbart feil – klubb og liga byttet om, for eksempel – er det
bare å bytte om offsetene i fila og kjøre `åpne` på nytt. Det er derfor
skjemaet er en tekstfil og ikke noe som står i koden.

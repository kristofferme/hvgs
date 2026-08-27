# Innmelding i Microsoft Lists

Dette er den varianten lærerne merker best: én liste i Teams, én rad per ting
du melder inn. Flere kan skrive samtidig, det virker på mobilen, og lista
holder selv styr på hvem som skrev hva og når.

Filene her lages av `python3 trafikklys.py lister`, og de får skolens egne
klasser, områder og møter fra arbeidsboka.

## Før du begynner: hvor lista skal ligge

**Ikke i klasseteamet.** Der er elevene medlemmer, og de vil se lista.

Legg den i lærernes eget team, eller i en **privat kanal** i klasseteamet der
bare lærerne i klassen er medlemmer. Alle som er medlem der, ser alt i lista –
det er ingen rad-for-rad-skjerming i Lists. Gå gjennom medlemslista før dere
begynner å skrive.

## Sett opp lista

1. **Teams → lærerteamet (eller den private kanalen) → + → Lists →
   Opprett en liste → Fra Excel** → last opp `Innmelding.xlsx`.
2. Sett kolonnetypene i importbildet:

   | Kolonne | Type |
   | --- | --- |
   | Møte | Valg |
   | Klasse | Valg |
   | Elev | Én tekstlinje |
   | Område | Valg |
   | Lys | Valg |
   | Merknad | Flere tekstlinjer |

3. Slett eksempelraden når lista er laget.
4. Åpne hver valgkolonne → **Rediger** → lim inn verdiene fra `valgene.txt`.
5. Gjenta for `Tiltak.xlsx`. Der er Frist en **Dato**-kolonne og Status en
   **Valg**-kolonne.

Lærer-kolonnen trenger du ikke: Lists fyller inn «Opprettet av» selv.

## Gi den farger

**Lys-kolonnen:** klikk på kolonneoverskriften → Kolonneinnstillinger →
Formater denne kolonnen → **Avansert modus** → lim inn `lys-kolonne.json`.

**Hele raden:** Visning-menyen øverst til høyre → Formater gjeldende visning →
Avansert modus → lim inn `rad-visning.json`.

I Tiltak-lista bruker du `tiltak-frist-kolonne.json` på Frist og
`tiltak-status-kolonne.json` på Status. Da lyser fristen rødt når den er gått
ut og tiltaket ikke er avsluttet.

JSON-en viser til kolonnene med `[$Lys]`, `[$Frist]` og `[$Status]`. Døper du
en kolonne om, må du rette navnet i JSON-en også.

## Visninger som gjør jobben kortere

Lag dem én gang, så velger hver lærer den de trenger:

| Visning | Filter og gruppering |
| --- | --- |
| **Mine** | Opprettet av = [Meg] |
| **Dette møtet** | Møte = det møtet dere er på nå, gruppert på Elev |
| **Bare gult og rødt** | Lys er ikke Grønt, gruppert på Klasse |

Fest lista som fane i kanalen. Da er den ett klikk unna der lærerne allerede er.

## Fra lista til møtevisningen

Før hvert møte:

1. I lista: **Eksporter → Eksporter til CSV** (eller til Excel).
2. Åpne `Trafikklys.xlsx`, gå til Innmelding-arket, og lim inn radene under
   overskriftene. Rekkefølgen på kolonnene spiller ingen rolle – arbeidsboka
   finner dem på overskriftene, og godtar «Opprettet av» som lærernavn.
3. `python3 trafikklys.py bygg`

Fire møter i året betyr fire slike runder. Skal det gå av seg selv, kan en
flyt i Power Automate skrive radene til arbeidsboka i stedet – men da må
arbeidsboka fortsatt ligge et sted bare lærerne kommer til.

# Eksamen våren 2027

Interaktiv presentasjon for elevene på **Hustadvika vidaregåande skole**: trekket,
datoene, reglene, hjelpemidlene, sykdom, sensur og klage. På nynorsk, i skolens
profilfarge og med de samme skriftene som vekeplanen.

Åpne `index.html`. Det er én fil med skriftene inni, så den virker på klasserommets
PC, på mobilen og uten nett.

## Slik styrer du

| Tast | Hva skjer |
| --- | --- |
| → / mellomrom | Neste lysbilde |
| ← | Forrige lysbilde |
| O | Oversikt over alle lysbildene |
| F | Fullskjerm |
| T | Lys eller mørk |
| L | Laserpeker for den som presenterer |
| ? | Hjelp |

På mobil og nettbrett sveiper elevene til siden. Hvert lysbilde har sin egen
adresse, for eksempel `index.html#trekkmaskin`, så du kan lenke rett dit i Teams.
På store skjermer og prosjektorer skaleres hele scenen opp.

## Det elevene kan gjøre

- **Nedtelling** til trekket, første og siste skriftlige dag og fellessensuren.
- **Tidslinje** for våren med en «i dag»-prikk og forklaring til hvert punkt.
- **Kva gjeld for meg?** Velg klasse (1ID … 3PB2) og se hvilke eksamener du kan få.
- **Trekkmaskina:** et tenkt trekk for klassen. Det står tydelig at den bare er for moro.
- **Lov eller ikkje lov?** Sorter hjelpemidler for sikker nettleser, matte del 1 og del 2.
- **Eksamensdagen** spilt av time for time på en klokke, og en **pakkeliste** som huskes.
- **Timere** for å øve på muntlig presentasjon og for lesing (25 + 5 minutter).
- **Lov eller fusk?** Et kortspill der man sveiper eller trykker.
- **Syk på eksamensdagen?** Stegene for før, under og etter eksamen.
- **Karakterskala**, **klagefrist-kalkulator**, **myte eller fakta**, **quiz** og **søkbare spørsmål og svar**.
- **Skriv ut** gir alle lysbildene på A4, med begge sider av kortene.

## Endre innholdet

| Fil | Hva som ligger der |
| --- | --- |
| `mal/side.html` | All tekst, ett `<section>` per lysbilde |
| `mal/stil.css` | Utseendet |
| `mal/presentasjon.js` | Datoene til nedtellingen (`MAAL`), fagene i trekkmaskina (`TREKK`), hjelpemidlene (`TING`) og stegene ved sykdom (`SJUK`) øverst, logikken under |

Kjør så `python3 bygg.py`. Den bygger `index.html` på nytt og legger inn skriftene
fra `../ukeplan/mal/fonter.css`.

## Kilder og forbehold

Datoene og reglene er hentet fra Utdanningsdirektoratet og opplæringsforskriften
(§ 9-30 og § 9-31) i oktober 2026:

- trekk onsdag 28. april 2027 kl. 09.00, og en ekstra trekkdato 12. februar for fag
  som må ha eksamen tidlig
- skriftlig periode 4.–21. mai og fellessensur 17.–18. juni
- sikker nettleser for digitale eksamener, og ingen PC på del 2 i matematikk,
  biologi 2, kjemi 2 og fysikk 2

Datoene for enkeltfag (norsk sidemål 4. mai, norsk hovedmål 10. mai) er funnet via
skoler og eksamenskalendere som gjengir Udirs plan. Sjekk dem mot
[eksamensplan.udir.no](https://eksamensplan.udir.no/) før presentasjonen brukes.
Det som varierer lokalt (oppmøtetid, forberedelsesdel til muntlig, frist for
legeattest) er formulert som «skulen gir deg beskjed».

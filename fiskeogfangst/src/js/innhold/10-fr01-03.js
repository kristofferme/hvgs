/* Fartøy og redskaper: FR·01–03 */

FF.moduler.push({
  id: "fr-01", fag: "fr", nr: "01", timer: 20,
  tittel: "Livet om bord",
  under: "Hvem gjør hva, hvem bestemmer, og hvordan dere jobber sammen i et lite mannskap langt fra land.",
  maal: ["FR7"], kjerne: ["Sikkerhet om bord", "Fartøy og fiskeredskaper"],
  kort: [
    "Skipperen har det øverste ansvaret for fartøyet, mannskapet og fangsten.",
    "Alle har en fast plass i fartøyinstruksen – også når noe går galt.",
    "På sjøen jobber dere i skift. Det er regler for hvor lite hvile du kan få."
  ],
  blokker: [
    { t: "ingress", html: "Et fiskefartøy er en arbeidsplass, et hjem og en bedrift på samme tid. På en sjark kan én person ha alle rollene. På en autoliner er det tjue om bord. Uansett størrelse må alle vite hva de skal gjøre – og kunne stole på hverandre." },

    { t: "h2", tekst: "Hvem gjør hva om bord" },
    { t: "p", html: "Rollene er forskjellige fra båt til båt, men funksjonene er de samme. Noen fører fartøyet, noen passer maskinen, og noen jobber med redskap og fangst. På små fartøy deler dere oppgavene mellom dere." },
    { t: "tabell", sterk: true, hode: ["Rolle", "Hovedansvar", "Typiske oppgaver"], rader: [
      ["Skipper", "Øverste ansvar for sikkerhet, navigasjon, fiske og mannskap", "Planlegger turen, velger felt, fører fangstdagbok, leder i nødsituasjoner"],
      ["Styrmann", "Skipperens nestkommanderende", "Brovakt og navigasjon, leder arbeidet på dekk"],
      ["Maskinist", "Motor og tekniske systemer", "Daglig kontroll, vedlikehold, bunkring, hydraulikk og kjøling"],
      ["Kokk", "Mat og hygiene (på større fartøy)", "Matlaging, renhold i bysse og lugarer, proviant"],
      ["Fisker / dekksmann", "Arbeid med redskap og fangst", "Setting og haling, bløgging, sløying, ising, vedlikehold av redskap, vakt"],
      ["Lærling og elev", "Lære alle oppgavene under tilsyn", "Følger instruksen, spør når noe er uklart, sier fra om feil"]
    ] },
    { t: "notat", type: "regel", etikett: "Fartøyinstruks", tittel: "Alle skal vite hvor de skal være", html: "<p>Fiskefartøy skal ha en <strong>fartøyinstruks</strong> (på større fartøy kalt mønstringsliste). Den viser hvem som gjør hva ved <strong>brann</strong>, <strong>mann over bord</strong> og når dere må <strong>forlate fartøyet</strong>, og hvilke alarmsignaler som brukes. Den skal henge synlig og gjennomgås med alle nye før avgang.</p>" },

    { t: "h2", tekst: "Første tur: sikkerhetsgjennomgang" },
    { t: "p", html: "Før du går til sjøs med et nytt fartøy, skal du få en sikkerhetsgjennomgang (familiarisering). Den tar kort tid, og den kan redde livet ditt. Be om den hvis ingen tilbyr den." },
    { t: "steg", items: [
      ["Finn redningsutstyret", "Flytevester, overlevingsdrakter, livbøyer og livflåte. Prøv drakta di."],
      ["Finn brannutstyret", "Brannslukkere, brannteppe og nødstopp for vifter og drivstoff."],
      ["Lær alarmene", "Hvordan høres generalalarm og brannalarm ut, og hvor skal du møte?"],
      ["Finn nødutgangene", "Fra lugaren, messa og maskinrommet. Gå veien én gang."],
      ["Les fartøyinstruksen", "Hva er din oppgave ved brann, mann over bord og når dere forlater fartøyet?"],
      ["Avtal hvordan du melder fra", "Hvem sier du fra til om noe er feil, farlig eller du er usikker?"]
    ] },

    { t: "h2", tekst: "Arbeid, vakt og hvile" },
    { t: "p", html: "Fisket følger fisken, ikke klokka. Det betyr lange økter, skiftarbeid og natt. Nettopp derfor er det regler for hvile. Etter skipsarbeidsloven og forskriftene om arbeidstid for fiskere er hovedregelen at du skal ha <strong>minst 10 timer hvile i løpet av 24 timer</strong> og <strong>minst 77 timer hvile i løpet av sju dager</strong>. Skipperen skal sørge for at hviletiden blir registrert." },
    { t: "notat", type: "fare", tittel: "Trøtthet er farlig", html: "<p>Mange grunnstøtinger skjer fordi den som hadde vakt, sovnet. På dekk øker faren for klem- og kuttskader når du er sliten. Si fra hvis du ikke er i stand til å ta vakta.</p>" },

    { t: "h2", tekst: "Kommunikasjon på dekk" },
    { t: "p", html: "Det er bråkete på dekk, og det er ofte dårlig sikt fra styrhuset. Derfor bruker dere korte, faste beskjeder og tegn." },
    { t: "ul", items: [
      "<strong>Lukket kommunikasjon:</strong> Gi beskjed – mottakeren gjentar – du bekrefter. «Stopp haleren!» – «Stopper haleren.» – «Riktig.»",
      "<strong>Én gir tegn til kranføreren.</strong> Avtal tegnene før løftet.",
      "<strong>Stopp betyr stopp</strong>, uansett hvem som roper.",
      "<strong>Si fra om feil</strong> – også når det er skipperen som gjør dem. Det er godt sjømannskap."
    ] },
    { t: "tenk", html: "Du er elev på en sjark. Du ser at en erfaren fisker står ved rekka uten flytevest mens dere setter garn. Hva gjør du, og hvordan sier du det?" },

    { t: "quiz", tittel: "Roller og ansvar", sp: [
      { q: "Hvem har det øverste ansvaret for sikkerheten om bord?", a: ["Skipperen", "Maskinisten", "Rederiet alene", "Den som har vakt"], r: 0, f: "Skipperen (føreren) har det øverste ansvaret om bord. Rederiet har ansvar for at sikkerhetsstyringssystemet finnes og virker." },
      { q: "Hva står i fartøyinstruksen?", a: ["Hva hver enkelt gjør ved brann, mann over bord og når dere forlater fartøyet", "Hvor mye hver person tjener", "Hvilke felt dere skal fiske på", "Rutinen for bløgging"], r: 0, f: "Fartøyinstruksen fordeler oppgavene i nødsituasjoner og viser alarmsignalene." },
      { q: "Hva er hovedregelen for hvile?", a: ["Minst 10 timer per døgn og 77 timer per uke", "Minst 6 timer per døgn", "Minst 8 timer per døgn og 50 timer per uke", "Det finnes ingen regler om hvile for fiskere"], r: 0, f: "Minst 10 timer hvile i løpet av 24 timer og minst 77 timer i løpet av sju dager." },
      { q: "Hva er lukket kommunikasjon?", a: ["Mottakeren gjentar beskjeden, og avsenderen bekrefter", "Du snakker bare over VHF", "Du gir beskjed bare én gang", "Bare skipperen gir beskjeder"], r: 0, f: "Ved å gjenta beskjeden oppdager dere misforståelser før de blir farlige." },
      { q: "Når skal du få en sikkerhetsgjennomgang?", a: ["Før du går til sjøs med et nytt fartøy", "Etter første uke om bord", "Bare hvis du er lærling", "Når Sjøfartsdirektoratet er på tilsyn"], r: 0, f: "Gjennomgangen skal skje før avgang, slik at du vet hvor utstyret er og hva du skal gjøre hvis noe skjer." },
      { q: "Hvem har maskinen og de tekniske systemene som hovedansvar?", a: ["Maskinisten", "Kokken", "Styrmannen", "Lærlingen"], r: 0, f: "Maskinisten har ansvaret for motor, hydraulikk, kjøling og det tekniske om bord." }
    ] },
    { t: "oppdrag", tittel: "Roller og beredskap på skolebåten", sted: "Om bord", tid: "2 t", gruppe: "Hele klassen", html: "Gå gjennom skolebåten sammen med læreren. Lag en oversikt over roller og en fartøyinstruks dere kan henge opp.", sjekk: [
      "Tegn en enkel skisse av båten og merk av redningsutstyr, brannslukkere og nødutganger",
      "Skriv ned hvem som har hvilken rolle på neste tur",
      "Lag fartøyinstruks: oppgaver ved brann, mann over bord og forlate fartøyet",
      "Test alarmsignalet og møteplassen",
      "Gå gjennom lukket kommunikasjon og tre tegn til kranføreren"
    ], lever: "Bilde av fartøyinstruksen i Teams" }
  ],
  kanjeg: [
    "Jeg kan forklare hva skipper, styrmann, maskinist og fisker har ansvar for.",
    "Jeg vet hva en fartøyinstruks er, og hvor jeg finner den.",
    "Jeg kan gjennomføre en sikkerhetsgjennomgang på et nytt fartøy.",
    "Jeg kjenner hovedreglene for arbeid og hvile.",
    "Jeg bruker lukket kommunikasjon på dekk."
  ],
  kilder: ["sdirFisk", "yrkesfisker", "laereplan"]
});

FF.moduler.push({
  id: "fr-02", fag: "fr", nr: "02", timer: 50,
  tittel: "Sikkerhet og beredskap",
  under: "Sikkerhetsstyring, risikovurdering, verneutstyr – og hva du gjør når noen faller over bord, det brenner eller dere må forlate fartøyet.",
  maal: ["FR6", "FR8", "FR9"], kjerne: ["Sikkerhet om bord"],
  verktoy: ["risiko", "mayday"],
  kort: [
    "Flytevest på dekk. Alltid.",
    "Tenk gjennom jobben før du gjør den: Hva kan gå galt, og hva gjør vi for å hindre det?",
    "Ved mann over bord: rop, pek, kast livbøye og trykk MOB."
  ],
  blokker: [
    { t: "ingress", html: "Fiske er et av de farligste yrkene i Norge. Fall over bord og kantring går igjen i Sjøfartsdirektoratets ulykkesstatistikk. Men de fleste ulykker har en forhistorie – og kan stoppes før de skjer." },

    { t: "h2", tekst: "Sikkerhetsstyringssystem og ISM" },
    { t: "p", html: "Et <strong>sikkerhetsstyringssystem</strong> er fartøyets egne rutiner for å drive trygt. Det skal sikre at farer blir oppdaget og tatt hånd om i tide, og at utslipp til miljøet blir forebygget. Rederiet har ansvaret, men alle om bord har rettigheter og plikter i systemet." },
    { t: "tabell", hode: ["Fartøy", "Krav", "Hvem godkjenner"], rader: [
      ["Fiskefartøy under 500 i bruttotonnasje", "Dokumentert sikkerhetsstyringssystem tilpasset fartøyet, driften og mannskapet", "Rederiet selv, tilsyn fra Sjøfartsdirektoratet"],
      ["Fiskefartøy på 500 bruttotonnasje eller mer", "Sikkerhetsstyringssystem etter <strong>ISM-koden</strong> (International Safety Management)", "Sertifiseres av Sjøfartsdirektoratet"]
    ] },
    { t: "p", html: "Et godt system er ikke en perm i hylla. Det er noe dere bruker hver dag:" },
    { t: "ul", items: [
      "<strong>Rutiner og sjekklister</strong> for avgang, setting, haling, kranløft og arbeid i maskinrommet.",
      "<strong>Risikovurderinger</strong> av arbeidsoperasjonene, laget sammen med dem som jobber om bord.",
      "<strong>Avviksmeldinger:</strong> Nesten-ulykker og feil blir skrevet ned og fulgt opp.",
      "<strong>Øvelser</strong> i brann, mann over bord og forlate fartøyet.",
      "<strong>Opplæring</strong> av nye, og <strong>vedlikeholdsplan</strong> for fartøy og utstyr."
    ] },
    { t: "notat", type: "info", etikett: "ISM-koden", html: "<p>ISM-koden er en internasjonal standard for sikkerhetsstyring. Den krever at rederiet har en sikkerhetspolitikk, klare ansvarsforhold, rutiner for nødsituasjoner, avviksbehandling, en utpekt person på land som har kontakt med ledelsen, og jevnlige revisjoner. Tanken er den samme for små fartøy: planlegg, gjør, kontroller og forbedre.</p>" },

    { t: "h2", tekst: "Risikovurdering" },
    { t: "p", html: "En risikovurdering svarer på tre spørsmål: <strong>Hva kan gå galt? Hvor sannsynlig er det? Hvor ille blir det?</strong> Risikoen er sannsynlighet ganget med konsekvens. Før en jobb som ikke er rutine – for eksempel et tungt løft i sjø – lager dere en <strong>sikker jobbanalyse (SJA)</strong>." },
    { t: "fig", fig: "risikomatrise", a: { merk: [[4, 4, "A"], [2, 5, "B"], [3, 2, "C"]] }, cap: "Risikomatrise. A: hanske setter seg fast i linehaleren (sannsynlig, alvorlig). B: brann i maskinrommet (sjelden, katastrofal). C: kutt ved sløying (kan skje, liten). Rødt må ha tiltak før jobben starter." },
    { t: "steg", tittel: "Slik gjør du en risikovurdering", items: [
      ["Beskriv jobben", "Del arbeidsoperasjonen opp i trinn. Eksempel: rigge kranen – feste stroppen – løfte – svinge inn – sette ned."],
      ["Finn farene", "For hvert trinn: Hva kan klemme, kutte, falle, velte, brenne eller dra deg med?"],
      ["Vurder risikoen", "Sett sannsynlighet og konsekvens på en skala fra 1 til 5 og finn plassen i matrisen."],
      ["Bestem tiltak", "Fjern faren hvis du kan. Ellers: tekniske tiltak (skjerming, nødstopp), så rutiner og opplæring, og til slutt verneutstyr."],
      ["Gjennomfør og følg opp", "Alle som skal gjøre jobben, går gjennom SJA-en. Etterpå: Virket tiltakene?"]
    ] },
    { t: "verktoy", navn: "risiko" },

    { t: "h2", tekst: "Personlig verneutstyr" },
    { t: "p", html: "Verneutstyret er siste skanse. Det skal ikke erstatte gode rutiner, men det skal alltid være på når rutinene ikke fjerner faren helt." },
    { t: "fig", fig: "verneutstyr", cap: "Påbudsskilt i ISO 7010-standarden. Den blå sirkelen betyr at utstyret er påbudt der skiltet henger." },
    { t: "tabell", hode: ["Arbeidsoperasjon", "Verneutstyr", "Hvorfor"], rader: [
      ["Setting og haling av garn og line", "Flytevest, hansker, kniv lett tilgjengelig", "Du kan bli dratt med av redskapen. Kniven kutter deg løs."],
      ["Kranløft og lossing", "Hjelm, hansker, vernestøvler", "Fallende last og klem"],
      ["Arbeid i maskinrommet", "Hørselvern, vernebriller ved sliping", "Støy gir varig hørselskade"],
      ["Bløgging og sløying", "Kuttsikre hansker, forkle", "Skarp kniv, glatt fisk"],
      ["Arbeid ved rekka i dårlig vær", "Flytevest og sikkerhetssele festet i fast punkt", "Fall over bord"],
      ["Frysing og ising", "Varme, tørre hansker", "Kuldeskader"]
    ] },

    { t: "h2", tekst: "Mann over bord" },
    { t: "p", html: "Når noen faller over bord, teller sekundene. Kaldt vann tar pusten fra deg, og etter få minutter mister du kraften i armene. Mange som omkommer etter fall over bord, brukte ikke flyteutstyr." },
    { t: "fig", fig: "kaldtvann", cap: "1–10–1: kuldesjokket varer ett minutt, du har rundt ti minutter med nyttige bevegelser, og det tar omtrent en time før du blir bevisstløs av nedkjøling." },
    { t: "steg", tittel: "Når noen faller over bord", items: [
      ["Rop og pek", "«Mann over bord, styrbord!» Én person peker på den som falt over bord, hele tiden, og slipper vedkommende ikke med blikket."],
      ["Kast livbøye", "Kast livbøye eller noe som flyter, så nær personen som mulig."],
      ["Trykk MOB", "MOB-knappen på kartplotteren lagrer posisjonen."],
      ["Varsle", "Gi alarm om bord. Send DSC-nødalarm og MAYDAY på VHF kanal 16, eller ring 120."],
      ["Manøvrer", "Ser dere personen: kortest vei tilbake. Ser dere ikke personen: Williamson-sving."],
      ["Berg", "Kom opp på le side med lav fart. Bruk redningsnett, MOB-båt eller heis. Løft personen vannrett hvis mulig."]
    ] },
    { t: "fig", fig: "williamson", flate: "sjo", cap: "Williamson-svingen fører fartøyet tilbake i sitt eget kjølvann, på motsatt kurs." },
    { t: "sorter", tittel: "Mann over bord – riktig rekkefølge", items: [
      "Rop «mann over bord» og pek på personen",
      "Kast livbøye",
      "Trykk MOB på kartplotteren",
      "Gi alarm og send nødmelding",
      "Manøvrer tilbake til personen",
      "Kom opp på le side og berg personen om bord"
    ] },

    { t: "h2", tekst: "Brann om bord" },
    { t: "p", html: "En brann trenger tre ting: varme, oksygen og noe som brenner. Fjerner du én av dem, slukker brannen. Om bord er det ingen brannbil som kommer – dere må klare dere selv til hjelpen er framme." },
    { t: "fig", fig: "branntrekant", cap: "Branntrekanten. Kjøle, kvele og sulte er de tre måtene å slukke på." },
    { t: "steg", tittel: "Når det brenner", items: [
      ["Varsle", "Rop «brann», utløs alarmen og si fra til styrhuset."],
      ["Redde", "Få alle ut av fare. Tell opp mannskapet."],
      ["Begrense", "Lukk dører og luker. Stopp vifter. Steng drivstoff og strøm til brannstedet."],
      ["Slukke", "Bruk riktig slukker. CO₂ og pulver på olje og elektrisk. Aldri vann på brennende fett eller olje."],
      ["Nødmelding", "Send MAYDAY hvis brannen ikke er under kontroll."]
    ] },

    { t: "h2", tekst: "Nødkommunikasjon" },
    { t: "p", html: "<strong>VHF kanal 16</strong> er nød- og anropskanalen. <strong>DSC</strong> (digitalt selektivt anrop) sender en nødalarm med posisjon på kanal 70 når du holder inne den røde knappen. Har du bare mobil, ring <strong>120</strong> – nødnummeret til Kystradio og Hovedredningssentralen." },
    { t: "tabell", hode: ["Signal", "Betyr", "Eksempel"], rader: [
      ["MAYDAY", "Nød – fare for liv eller fartøy", "Brann du ikke får kontroll på, mann over bord, synker"],
      ["PAN-PAN", "Il – alvorlig, men ikke umiddelbar livsfare", "Motorstopp nær land, skadet person om bord"],
      ["SÉCURITÉ", "Sikkerhet – varsel til andre", "Drivende container, tapt redskap i leia"]
    ] },
    { t: "verktoy", navn: "mayday" },
    { t: "p", html: "Fartøy skal også ha <strong>nødpeilesender (EPIRB)</strong> som sender posisjonen via satellitt når den kommer i sjøen, og ofte en <strong>radartransponder (SART)</strong> eller AIS-SART som viser dere på radaren og kartplotteren til redningsmannskapene." },

    { t: "h2", tekst: "Forlate fartøyet" },
    { t: "steg", items: [
      ["Ta på overlevingsdrakt", "Øv på det. Du skal klare det på under to minutter."],
      ["Send nødmelding og ta med EPIRB", "Hvis det ikke allerede er gjort."],
      ["Sett ut livflåten", "Den hydrostatiske utløseren slipper flåten hvis fartøyet synker."],
      ["Gå tørrskodd over hvis du kan", "Hopp bare når du må, og aldri ned på flåten."],
      ["Hold sammen", "Bli ved flåten. Den er lettere å finne enn en person."]
    ] },

    { t: "h2", tekst: "Sikkerhetsopplæring for fiskere" },
    { t: "p", html: "Alle som jobber på fiskefartøy, skal ha <strong>grunnleggende sikkerhetsopplæring for fiskere</strong> på minst 40 timer. Kurset dekker blant annet førstehjelp, sjøredning, brannvern og arbeidsmiljø. Deretter skal du ta et <strong>repetisjonskurs på minst 20 timer</strong> – tidligst fem og senest åtte år etter forrige kurs. Kursene holdes ved godkjente kurssentre." },

    { t: "quiz", tittel: "Sikkerhet om bord", sp: [
      { q: "Hvilke fiskefartøy skal ha sikkerhetsstyringssystem etter ISM-koden?", a: ["Fartøy med bruttotonnasje 500 eller mer", "Alle fartøy over 15 meter", "Alle fartøy, uansett størrelse", "Bare fartøy som fisker utenfor 12 nautiske mil"], r: 0, f: "Fiskefartøy på 500 bruttotonnasje eller mer skal følge ISM-koden. Mindre fartøy skal ha et sikkerhetsstyringssystem tilpasset fartøyet." },
      { q: "Hva er det første du gjør når noen faller over bord?", a: ["Roper «mann over bord» og peker", "Ringer 120", "Snur båten", "Tar på overlevingsdrakt"], r: 0, f: "Rop og pek – så mister ingen personen av syne. Deretter livbøye og MOB." },
      { q: "Hvilken rekkefølge gjelder for tiltak i en risikovurdering?", a: ["Fjerne faren – tekniske tiltak – rutiner – verneutstyr", "Verneutstyr – rutiner – tekniske tiltak", "Rutiner først, verneutstyr hvis det er tid", "Det er ingen fast rekkefølge"], r: 0, f: "Verneutstyr er siste skanse. Best er å fjerne faren helt." },
      { q: "Hva betyr PAN-PAN?", a: ["Det haster, men det er ikke umiddelbar livsfare", "Nød – fare for liv", "Varsel om fare for andre", "Test av radioen"], r: 0, f: "PAN-PAN er ilmelding. MAYDAY er nød. SÉCURITÉ er sikkerhetsvarsel." },
      { q: "Hvilket nummer ringer du fra mobil ved nød på sjøen?", a: ["120", "110", "113", "1412"], r: 0, f: "120 går til Kystradio og Hovedredningssentralen. Bruk VHF kanal 16 og DSC hvis du har det." },
      { q: "Hva slukker du brann i elektrisk utstyr med?", a: ["CO₂ eller pulver", "Vann", "Sjøvann fra brannslangen", "Brannteppe er eneste lovlige"], r: 0, f: "Vann leder strøm. CO₂ og pulver er riktig på elektrisk utstyr og olje." },
      { q: "Hvor lenge har du omtrent nyttige bevegelser i kaldt vann?", a: ["Rundt ti minutter", "Rundt en time", "Rundt ett minutt", "Rundt tre timer"], r: 0, f: "1–10–1: ett minutt kuldesjokk, rundt ti minutter der du kan berge deg selv, rundt en time før bevisstløshet." },
      { q: "Når skal du ta repetisjonskurs i sikkerhet?", a: ["Mellom fem og åtte år etter forrige kurs", "Hvert år", "Hvert tiende år", "Bare hvis du skifter fartøy"], r: 0, f: "Repetisjonskurset på minst 20 timer tas tidligst fem og senest åtte år etter forrige kurs." }
    ] },
    { t: "oppdrag", tittel: "Sikker jobbanalyse for et kranløft", sted: "Om bord / kai", tid: "3 t", html: "Dere skal løfte en pall med fiskekasser fra kaia og ned i lasterommet. Lag en SJA med verktøyet over, gå gjennom den med læreren, og gjennomfør løftet.", sjekk: [
      "Del løftet i trinn og finn farene for hvert trinn",
      "Sjekk at løfteutstyret er merket med største tillatte last",
      "Bestem hvem som gir tegn, og avtal tegnene",
      "Sett tiltak og riktig verneutstyr",
      "Gjennomfør løftet og noter det som ikke gikk som planlagt"
    ], lever: "SJA-en og et kort avvikspunkt i Teams" },
    { t: "oppdrag", tittel: "Øvelse: mann over bord", sted: "Om bord", tid: "2 t", html: "Øvelsen gjøres med en livbøye eller dukke («Oscar») i sjøen. Læreren kaster den ut uten forvarsel.", sjekk: [
      "Rop og pek – én person holder øye med «Oscar» hele tiden",
      "Kast livbøye og trykk MOB",
      "Gjennomfør Williamson-sving eller direkte manøver",
      "Berg «Oscar» på le side",
      "Evaluer: Hvor lang tid tok det? Hva gikk bra, og hva må øves mer?"
    ] }
  ],
  kanjeg: [
    "Jeg kan forklare hva et sikkerhetsstyringssystem er, og når ISM-koden gjelder.",
    "Jeg kan gjøre en risikovurdering og en sikker jobbanalyse.",
    "Jeg kan velge riktig verneutstyr til ulike arbeidsoperasjoner.",
    "Jeg vet hva jeg gjør ved mann over bord, brann og når vi forlater fartøyet.",
    "Jeg kan sende MAYDAY på VHF og vet når jeg bruker PAN-PAN og SÉCURITÉ.",
    "Jeg kjenner kravene til sikkerhetsopplæring for fiskere."
  ],
  kilder: ["sdirSms", "sdirFob", "sdirKurs", "yrkesfisker", "hrs"]
});

FF.moduler.push({
  id: "fr-03", fag: "fr", nr: "03", timer: 30,
  tittel: "Fartøyet og dekksutstyret",
  under: "Fartøytyper, navn på delene, hvordan vinsjer, halere og kraner virker – og hvordan du laster og losser trygt.",
  maal: ["FR12", "FR5"], kjerne: ["Fartøy og fiskeredskaper"],
  kort: [
    "Babord er venstre og styrbord er høyre når du ser forover.",
    "Nesten alt dekksutstyr drives av hydraulikk fra hovedmotoren.",
    "Aldri stå i bukta på et tau, og aldri under en hengende last."
  ],
  blokker: [
    { t: "ingress", html: "Fiskeflåten spenner fra åpne sjarker på seks meter til havfisketrålere på åtti. Språket om bord er det samme: forut og akter, babord og styrbord, fribord og dypgående. Kan du ordene, forstår du beskjedene." },

    { t: "h2", tekst: "Fartøytyper" },
    { t: "fig", fig: "fartoytyper", cap: "Fem vanlige fartøytyper, tegnet i samme målestokk. Kystflåten er fartøy under 28 meter, og de fleste er under 15 meter." },
    { t: "p", html: "Fartøyene deles gjerne inn etter lengde og redskap. <strong>Kystflåten</strong> fisker med garn, line, juksa, snurrevad og not nær kysten. <strong>Havfiskeflåten</strong> – trålere, autolinere og ringnotfartøy – fisker lenger ute og er ute lenger om gangen. Lengden avgjør også hvilke regler som gjelder for utstyr, bemanning og sertifikater." },

    { t: "h2", tekst: "Delene på fartøyet" },
    { t: "p", html: "Trykk på punktene i tegningen og lær navnene. Tegningen viser et kystfartøy på rundt 15 meter, sett fra styrbord side, med en gjennomskjæring under dekk." },
    { t: "hotspot", fig: "fartoySide", a: { maal: true }, cap: "Kystfartøy sett fra styrbord side. VL er vannlinja.", punkter: [
      [63.6, 7, "Topplanterner", "Rundtlys i masta. Rødt over hvitt betyr fartøy som driver fiske (ikke trål). Se modulen om sjøveisregler."],
      [64.8, 17, "Radar", "Viser land, fartøy og bøyer rundt deg, også i mørke og tåke."],
      [65, 33, "Styrhus (bro)", "Her styres og navigeres fartøyet. Skipperen har oversikt over dekket herfra."],
      [79.6, 28, "Garnhaler", "Hydraulisk hjul som haler garnet inn over rekka. Hold hender og klær unna."],
      [36, 25, "Kran", "Hydraulisk kran til å løfte redskap, fangst og proviant. Merket med største tillatte last."],
      [21, 39, "Nettrommel", "Kveiler opp snurrevad eller not. Stor klemfare – aldri gå inntil når den går."],
      [49, 44, "Luke til lasterommet", "Holdes lukket når dere ikke laster. Åpne luker slipper inn sjø."],
      [26, 66, "Maskinrom", "Hovedmotor, gir, pumper og hydraulikk."],
      [47, 66, "Lasterom", "Fisken lagres i kasser med is eller i tanker med kjølt sjøvann (RSW)."],
      [67, 63, "Lugar", "Køyer og oppholdsrom. På mange kystfartøy ligger lugaren forut."],
      [47, 57, "Fribord", "Avstanden fra vannlinja opp til dekket. Mindre fribord = mindre reserve."],
      [56, 74, "Dypgående", "Hvor dypt fartøyet stikker. Viktig når du går inn på grunt vann."],
      [15, 72, "Propell og ror", "Propellen skyver fartøyet. Roret styrer det."],
      [78, 40, "Fiskerimerke", "Registreringsmerket viser fylke, nummer og kommune. Det skal stå på begge sider av baugen."]
    ] },
    { t: "fig", fig: "fartoyTopp", cap: "Fartøyet sett ovenfra. Sektorene viser hvor lanternene skal kunne sees fra." },
    { t: "begreper", items: [
      ["Baug", "Den fremre delen av fartøyet.", "baug"],
      ["Hekk", "Den bakre enden, akterspeilet.", "hekk"],
      ["Babord", "Venstre side når du ser forover. Rødt lys.", "babord"],
      ["Styrbord", "Høyre side når du ser forover. Grønt lys.", "styrbord"],
      ["Midtskips", "Midt på fartøyet, både på langs og på tvers.", "midtskips"],
      ["Tvers", "Rett ut til siden, 90° på kursen.", "tvers"],
      ["Le og lo", "Le er siden som ligger i ly for vinden. Lo er siden vinden kommer fra.", "le og lo"],
      ["Rekke og skansekledning", "Kanten langs dekket som hindrer at folk og utstyr faller over bord.", "rekkje, skansekledning"],
      ["Lensport", "Åpning i skansekledningen der sjøvann renner av dekket.", "lensport"],
      ["Skott", "Vegg som deler fartøyet i rom. Vanntette skott stopper vann.", "skott"],
      ["Kjøl", "Ryggraden nederst i skroget.", "kjøl"],
      ["Spant", "Ribbene som gir skroget form.", "spant"]
    ] },

    { t: "h2", tekst: "Dekksutstyr og hydraulikk" },
    { t: "p", html: "Vinsjer, halere, kraner og trommelen drives nesten alltid av <strong>hydraulikk</strong>. Hovedmotoren driver en pumpe som setter olje under trykk. Oljen går via en ventil til en hydraulikkmotor på vinsjen, og tilbake til tanken. Det gir enorme krefter – og det er derfor utstyret er farlig." },
    { t: "fig", fig: "hydraulikk", cap: "Hydraulikk om bord. Rødt er trykkledning, blått er retur." },
    { t: "tabell", hode: ["Utstyr", "Brukes til", "Pass på"], rader: [
      ["Garnhaler", "Hale garn over rekka", "Klær og hansker kan dras med. Kjenn nødstoppen."],
      ["Linehaler", "Hale line. Ofte med egnemaskin på større fartøy", "Kroker som slår. Bruk vernebriller."],
      ["Tau- og snurrevadvinsj", "Hale snurrevadtau", "Tau under stort strekk. Aldri stå i bukta."],
      ["Nettrommel", "Kveile snurrevad, not eller trål", "Kan trekke inn en person på et sekund."],
      ["Kraftblokk", "Hale not i ringnotfisket", "Fallende last og slag fra notlin."],
      ["Kran", "Løfte redskap og fangst", "Største tillatte last (SWL). Ingen under lasten."],
      ["Ankervinsj", "Hive og slippe anker", "Kjetting som løper ut."]
    ] },
    { t: "notat", type: "fare", tittel: "Bukta og slingsonen", html: "<p><strong>Bukta</strong> er løkka et tau lager på dekket. Står du i den når tauet strammes, blir du dratt med. <strong>Slingsonen</strong> er området der et tau eller en wire kan slå hvis den ryker. Hold deg utenfor begge, og vit alltid hvor nødstoppen er.</p>" },

    { t: "h2", tekst: "Lasting og lossing" },
    { t: "p", html: "Hvordan du laster, avgjør hvordan fartøyet oppfører seg i sjøen. Tung last skal ligge lavt og midt i fartøyet. Last som kan forskyve seg, skal sikres. Tanker skal enten være fulle eller tomme." },
    { t: "steg", tittel: "Trygt løft med kran", items: [
      ["Sjekk utstyret", "Kran, stropper, sjakler og kroker skal være kontrollert og merket med største tillatte last (SWL)."],
      ["Vurder vekten", "Kjenner du ikke vekten, finn den ut. Husk at et løft over siden flytter tyngdepunktet opp og ut."],
      ["Én gir tegn", "Avtal tegnene. Kranføreren tar bare imot tegn fra én person – unntatt stopp."],
      ["Ingen under lasten", "Hold avstand, og bruk styretau i stedet for hendene."],
      ["Sett ned kontrollert", "Sikre lasten før stroppen løsnes."]
    ] },
    { t: "p", html: "Mer om hvorfor lasten påvirker stabiliteten, finner du i modulen om stabilitet." },

    { t: "quiz", tittel: "Fartøy og dekksutstyr", sp: [
      { q: "Du står om bord og ser forover. Hvilken side er babord?", a: ["Venstre", "Høyre", "Siden vinden kommer fra", "Siden nærmest kaia"], r: 0, f: "Babord er venstre og har rødt lys. Styrbord er høyre og har grønt lys." },
      { q: "Hva er fribord?", a: ["Avstanden fra vannlinja opp til dekket", "Avstanden fra vannlinja ned til kjølen", "Plassen på dekket der ingen utstyr står", "Høyden på masta"], r: 0, f: "Fribordet er reserven din. Avstanden ned til kjølen heter dypgående." },
      { q: "Hva driver vanligvis vinsjer og halere på et fiskefartøy?", a: ["Hydraulikk", "Trykkluft", "Håndkraft", "Vindkraft"], r: 0, f: "Hovedmotoren driver en hydraulikkpumpe som gir kraft til dekksutstyret." },
      { q: "Hva betyr SWL på en stropp eller sjakkel?", a: ["Største tillatte last", "Stålets vekt i liter", "Sikker arbeidslengde", "Standard wire-lengde"], r: 0, f: "SWL (safe working load) er den største lasten utstyret er godkjent for." },
      { q: "Hvorfor skal du aldri stå i bukta på et tau?", a: ["Du kan bli dratt med når tauet strammes", "Tauet blir skittent", "Det er uhøflig mot skipperen", "Tauet kan knyte seg"], r: 0, f: "Et tau som strammes plutselig, har nok kraft til å dra deg over bord eller inn i en vinsj." },
      { q: "Hvor skal tung last ligge?", a: ["Lavt og midt i fartøyet", "Høyt, så den er lett å nå", "Langt forut", "På dekket ved rekka"], r: 0, f: "Lav og midtstilt last holder tyngdepunktet lavt og gir bedre stabilitet." }
    ] },
    { t: "oppdrag", tittel: "Dekksrunde med maskinisten", sted: "Om bord", tid: "2 t", html: "Gå rundt på dekket sammen med maskinisten eller læreren. Finn hvert stykke dekksutstyr og svar på spørsmålene.", sjekk: [
      "Hva heter utstyret, og hva brukes det til?",
      "Hvor er nødstoppen, og hvordan virker den?",
      "Hvor er slingsonen og klemfaren?",
      "Hvordan kontrolleres og vedlikeholdes utstyret?",
      "Tegn hydraulikkanlegget: pumpe, ventil, motor og tank"
    ], lever: "Tegning og svar i Teams" }
  ],
  kanjeg: [
    "Jeg kan navnene på de viktigste delene av et fiskefartøy.",
    "Jeg kan forklare babord, styrbord, forut, akterut, le og lo.",
    "Jeg kan forklare hvordan hydraulikk driver dekksutstyret.",
    "Jeg vet hvor farene er ved vinsjer, halere, trommel og kran.",
    "Jeg kan gjennomføre et trygt kranløft og laste slik at fartøyet ligger stabilt."
  ],
  kilder: ["sdirFisk", "yrkesfisker", "ndla"]
});

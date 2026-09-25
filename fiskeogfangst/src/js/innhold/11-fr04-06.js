/* Fartøy og redskaper: FR·04–06 */

FF.moduler.push({
  id: "fr-04", fag: "fr", nr: "04", timer: 30,
  tittel: "Stabilitet",
  under: "Hvorfor et fartøy retter seg opp igjen – og hva som får det til å kantre. Du lærer G, B og M, regner ut KG og GM, og prøver deg i simulatoren.",
  maal: ["FR4", "FR5"], kjerne: ["Sikkerhet om bord", "Fartøy og fiskeredskaper"],
  verktoy: ["stabilitet"],
  kort: [
    "Tyngdepunktet G må ligge godt under metasenteret M. Avstanden GM er stabiliteten din.",
    "Alt som legger vekt høyt – is, last på dekk, kranløft – løfter G og spiser av stabiliteten.",
    "Halvfulle tanker og åpne luker er farligere enn de ser ut."
  ],
  blokker: [
    { t: "ingress", html: "Kantring er den ulykkestypen som oftest tar liv på små fiskefartøy. Den skjer sjelden uten forvarsel: For mye last, is på overbygget, et løft over siden, en halvfull tank – og så en brottsjø. Den som forstår stabilitet, ser faresignalene i tide." },

    { t: "h2", tekst: "To krefter som holder deg oppe" },
    { t: "p", html: "Et fartøy som flyter, påvirkes av to like store krefter. <strong>Vekta</strong> virker rett ned gjennom tyngdepunktet <strong>G</strong>. <strong>Oppdriften</strong> virker rett opp gjennom oppdriftssenteret <strong>B</strong>, som er midten av den delen av skroget som er under vann." },
    { t: "p", html: "Når fartøyet krenger, flytter B seg ut mot den siden som går ned, fordi mer av skroget kommer under vann der. G flytter seg ikke. Da virker oppdriften og vekta litt forskjøvet fra hverandre, og de vrir fartøyet tilbake. Den vannrette avstanden mellom dem heter <strong>GZ</strong> – den <strong>rettende armen</strong>." },
    { t: "fig", fig: "stabilitet", a: { vinkel: 25 }, flate: "", cap: "Spantsnitt krenget 25°. B har flyttet seg ut mot lav side. Oppdriften (blå) og vekta (rød) vrir fartøyet tilbake med armen GZ." },
    { t: "begreper", items: [
      ["K – kjøl", "Nullpunktet. Alle høyder måles fra kjølen.", "kjøl"],
      ["G – tyngdepunkt", "Punktet der hele vekta virker. Flytter seg når du laster, losser eller bruker drivstoff.", "tyngdepunkt"],
      ["B – oppdriftssenter", "Midten av den neddykkede delen av skroget. Flytter seg når fartøyet krenger.", "oppdriftssenter"],
      ["M – metasenter", "Punktet loddlinja fra B krysser senterlinja ved små krengninger.", "metasenter"],
      ["GM – metasenterhøyde", "Avstanden fra G opp til M. Positiv GM = fartøyet retter seg opp.", "metasenterhøgd"],
      ["GZ – rettende arm", "Den vannrette avstanden mellom vekta og oppdriften når fartøyet krenger.", "rettande arm"]
    ] },
    { t: "notat", type: "fare", tittel: "Når G kommer over M", html: "<p>Hvis tyngdepunktet G kommer høyere enn metasenteret M, blir GM negativ. Da vrir kreftene fartøyet <em>videre over</em> i stedet for tilbake. Fartøyet får slagside eller kantrer.</p>" },

    { t: "h2", tekst: "Hva flytter tyngdepunktet?" },
    { t: "fig", fig: "lastfare", cap: "Tre vanlige situasjoner der tyngdepunktet G flytter seg opp. Løft med kran flytter det i tillegg ut til siden." },
    { t: "ul", items: [
      "<strong>Ising:</strong> Sjøsprøyt som fryser på rekke, mast og styrhus, kan bli mange tonn. Is høyt oppe er det verste du kan få. Bank den løs tidlig.",
      "<strong>Løft med kran eller bom:</strong> Vekta virker i kranspissen fra det øyeblikket lasten løfter fra kaia eller sjøen. Et tungt løft over siden gir både slagside og høyere G.",
      "<strong>Last og redskap på dekk:</strong> Fangst i rommet ligger lavt. Den samme fangsten på dekket løfter G.",
      "<strong>Drivstoff og vann:</strong> Når tankene i bunnen tømmes, forsvinner vekt lavt i fartøyet. G stiger utover turen.",
      "<strong>Vann på dekk:</strong> Tette lensporter gjør at sjøvann blir liggende på dekket – høyt og fritt til å renne."
    ] },

    { t: "h2", tekst: "Fri væskeoverflate" },
    { t: "p", html: "En tank som er helt full, oppfører seg som en fast vekt. En tank som er <strong>delvis full</strong>, er noe helt annet: Når fartøyet krenger, renner væsken mot lav side og vrir fartøyet videre over. Virkningen er den samme som om G hadde flyttet seg oppover. Det gjelder også RSW-tanker, bløggekar og vann i lasterommet." },
    { t: "fig", fig: "friVaeske", cap: "I en full tank kan ikke væsken flytte seg. I en slakk tank renner den mot lav side." },
    { t: "notat", type: "praksis", tittel: "Gode vaner", html: "<ul><li>Hold tanker fulle eller tomme – ikke halvfulle.</li><li>Hold lensportene åpne og ryddige.</li><li>Lukk luker og dører når dere ikke bruker dem.</li><li>Legg tung last lavt og midt i fartøyet.</li><li>Bank løs is tidlig, og gå for le hvis det iser mye.</li><li>Følg stabilitetsboka for fartøyet – den sier hvor mye du kan laste.</li></ul>" },

    { t: "h2", tekst: "Regn ut tyngdepunktet: momentregning" },
    { t: "p", html: "Et moment er vekt ganget med arm. For å finne KG – høyden på tyngdepunktet over kjølen – ganger du hver vekt med sin høyde over kjølen, legger sammen, og deler på totalvekta." },
    { t: "tabell", tittel: "Eksempel: M/S Havbris klar til å gå ut", tall: [1, 2, 3], hode: ["Post", "Vekt (t)", "KG (m)", "Moment (tm)"], rader: [
      ["Lettskip (tomt fartøy)", "33,5", "2,12", "71,02"],
      ["Drivstoff i bunntanker", "2,5", "0,55", "1,38"],
      ["Mannskap, proviant og utstyr", "1,2", "2,20", "2,64"],
      ["Fangst i lasterommet", "6,0", "1,10", "6,60"],
      ["<strong>Sum</strong>", "<strong>43,2</strong>", "", "<strong>81,64</strong>"]
    ] },
    { t: "steg", tittel: "Fra tabell til GM", items: [
      ["Regn ut momentene", "Vekt × KG for hver post. 33,5 × 2,12 = 71,02 tm."],
      ["Summer", "Totalvekt 43,2 t. Totalmoment 81,64 tm."],
      ["Del moment på vekt", "KG = 81,64 ÷ 43,2 = 1,89 m."],
      ["Finn KM i stabilitetsboka", "Den hydrostatiske tabellen gir KM for dypgående. Her: KM = 2,77 m."],
      ["Regn ut GM", "GM = KM − KG = 2,77 − 1,89 = 0,88 m."]
    ] },
    { t: "regn", tittel: "Stabilitetsregning", intro: "Bruk tabellen over. Svar med to desimaler. Du kan bruke komma eller punktum.", oppg: [
      { q: "Regn ut KG for M/S Havbris med lasten i tabellen.", svar: 1.89, enhet: "m", des: 2, tol: 0.015, hint: "Del totalmomentet på totalvekta.", forkl: "81,64 ÷ 43,2 = 1,89 m." },
      { q: "KM er 2,77 m. Hva er GM?", svar: 0.88, enhet: "m", des: 2, tol: 0.015, forkl: "GM = KM − KG = 2,77 − 1,89 = 0,88 m." },
      { q: "Dere legger 5,0 t fisk på dekket, med KG 2,95 m. Hva blir ny KG?", svar: 2.0, enhet: "m", des: 2, tol: 0.015, hint: "Legg til den nye vekta og det nye momentet i summene.", forkl: "(81,64 + 14,75) ÷ 48,2 = 2,00 m." },
      { q: "Med mer last går fartøyet dypere, og KM blir 2,69 m. Hva er ny GM?", svar: 0.69, enhet: "m", des: 2, tol: 0.015, forkl: "2,69 − 2,00 = 0,69 m. Fem tonn på dekket kostet nesten 0,2 m GM." },
      { q: "Ved små krengninger er GZ ≈ GM × sin(krengning). Hva er GZ ved 10° når GM er 0,69 m?", svar: 0.12, enhet: "m", des: 2, tol: 0.01, forkl: "0,69 × sin 10° = 0,69 × 0,174 = 0,12 m." }
    ] },

    { t: "h2", tekst: "Prøv selv: stabilitetssimulatoren" },
    { t: "p", html: "Simulatoren regner på et ekte spantsnitt. Legg på fangst, is og kranløft, og se hvordan GM, GZ-kurven og krengningen endrer seg. Kriteriene er forenklede utgaver av IMOs krav til fiskefartøy – for ditt fartøy er det stabilitetsboka som gjelder." },
    { t: "verktoy", navn: "stabilitet" },

    { t: "quiz", tittel: "Stabilitet", sp: [
      { q: "Hva skjer med tyngdepunktet G når du legger fangst på dekket i stedet for i rommet?", a: ["Det flytter seg opp", "Det flytter seg ned", "Det står stille", "Det flytter seg forover"], r: 0, f: "Vekt høyt i fartøyet løfter G. Da blir GM mindre." },
      { q: "Hva betyr en negativ GM?", a: ["Fartøyet retter seg ikke opp og kan kantre", "Fartøyet er ekstra stabilt", "Fartøyet ligger for dypt", "Fartøyet har for lite drivstoff"], r: 0, f: "Når G er over M, vrir kreftene fartøyet videre over i stedet for tilbake." },
      { q: "Hvorfor er en halvfull tank farlig?", a: ["Væsken renner mot lav side og virker som om G stiger", "Tanken kan sprekke", "Den gjør fartøyet tyngre", "Den gir mer oppdrift"], r: 0, f: "Fri væskeoverflate gir en virtuell heving av tyngdepunktet." },
      { q: "Hvor virker vekta av en last som henger i kranen?", a: ["I kranspissen", "Der lasten står på dekket", "I kjølen", "I styrhuset"], r: 0, f: "Fra lasten er løftet, virker vekta der den henger – i kranspissen. Det flytter G opp og ut." },
      { q: "Hva er GZ?", a: ["Den rettende armen mellom vekt og oppdrift", "Dypgåendet midtskips", "Høyden fra kjølen til dekket", "Avstanden fra baug til hekk"], r: 0, f: "GZ er armen kreftene vrir fartøyet tilbake med. Stor GZ = sterkt rettende moment." },
      { q: "Hvordan finner du KG?", a: ["Summen av momentene delt på totalvekta", "KM minus GM delt på to", "Dypgående ganger bredde", "Totalvekta delt på antall tanker"], r: 0, f: "Momentregning: Σ(vekt × KG) ÷ Σ vekt." },
      { q: "Det iser kraftig på styrhuset. Hva gjør du?", a: ["Banker løs isen tidlig og vurderer å gå for le eller til havn", "Venter til det slutter å ise", "Fyller opp drivstoff på dekk", "Øker farten mot sjøen"], r: 0, f: "Is høyt oppe er svært farlig. Fjern den tidlig og reduser sjøsprøyten." }
    ] },
    { t: "oppdrag", tittel: "Krengeprøve på skolebåten", sted: "Kai / om bord", tid: "2 t", html: "Med læreren gjør dere en enkel krengeprøve: Flytt en kjent vekt fra senterlinja ut til siden og mål krengningen med et lodd eller en app. Sammenlign med utregningen.", sjekk: [
      "Noter vekt, flytteavstand og målt krengning",
      "Regn ut GM med formelen GM = (vekt × flytteavstand) ÷ (deplasement × tan krengning)",
      "Sammenlign med stabilitetsboka for fartøyet",
      "Diskuter: Hva gjør is, last på dekk og slakke tanker med tallet?"
    ] }
  ],
  kanjeg: [
    "Jeg kan forklare G, B, M, GM og GZ.",
    "Jeg kan regne ut KG med momentregning og finne GM.",
    "Jeg kan forklare hvordan is, last på dekk og kranløft påvirker stabiliteten.",
    "Jeg kan forklare fri væskeoverflate.",
    "Jeg vet hva stabilitetsboka er, og hvordan jeg bruker den."
  ],
  kilder: ["sdirStab", "sdirFisk", "yrkesfisker"]
});

FF.moduler.push({
  id: "fr-05", fag: "fr", nr: "05", timer: 50,
  tittel: "Navigasjon",
  under: "Sjøkart, sjømerker og sektorfyr, kurs og fart, elektroniske hjelpemidler – og hvordan du planlegger og dokumenterer en tur.",
  maal: ["FR2"], kjerne: ["Fartøy og fiskeredskaper"],
  verktoy: ["sektorfyr", "fdt"],
  kort: [
    "Én nautisk mil er 1852 meter – og ett bueminutt på breddeskalaen i sjøkartet.",
    "Rødt til babord og grønt til styrbord når du går i hovedleiens retning.",
    "Planlegg hele turen før du går, og følg med underveis: vurder – planlegg – gjennomfør – overvåk."
  ],
  blokker: [
    { t: "ingress", html: "Hustadvika er en av de mest værharde strekningene langs norskekysten, med grunner og skjær langt ut. Her er det ikke nok å følge streken på plotteren. Du må kunne lese kartet, kjenne merkene og vite hvor du er – også når elektronikken svikter." },

    { t: "h2", tekst: "Sjøkartet" },
    { t: "p", html: "Sjøkartet er tegnet i <strong>Mercator-projeksjon</strong>. Den er vinkeltro: En rett linje i kartet er en fast kompasskurs. Til gjengjeld blir avstander større jo lenger nord du kommer. Derfor måler du alltid distanse på <strong>breddeskalaen</strong> på siden av kartet, i høyde med der du er." },
    { t: "hotspot", fig: "sjokart", cap: "Utsnitt av et sjøkart med de vanligste symbolene. Trykk på punktene.", punkter: [
      [16, 22, "Fiskeplass", "Magenta fiskesymbol markerer kjente fiskeplasser eller oppdrettsanlegg i nærheten."],
      [15.5, 69, "Dybdetall", "Dybden i meter ved sjøkartnull (laveste astronomiske tidevann). Det er nesten alltid mer vann enn tallet viser."],
      [49, 38, "Dybdekurve", "Linje som binder sammen like dybder, her 10 og 20 meter. Tettere linjer = brattere bunn."],
      [53, 47.5, "Skjær under vann", "Pluss-tegnet er et skjær som alltid er under vann. Stiplet ring = farlig for navigasjonen."],
      [64, 38, "Skjær som tørrlegger", "Stjernen er et skjær som kommer opp av vannet ved lavvann."],
      [64, 25, "Sektorfyr", "Magenta lysflamme. Teksten forteller karakter, farger, periode, høyde og rekkevidde."],
      [58, 66, "Lateralmerke", "Grønt styrbordmerke med lys «Fl G 3s»: grønt blink hvert tredje sekund."],
      [49.4, 43.5, "Kardinalmerke", "Vestmerke. Du passerer det på vestsiden."],
      [30, 67, "Farled", "Den stiplete linja viser anbefalt led."],
      [8, 87, "Kabel", "Sjøkabel. Her er det forbudt å ankre og å fiske med bunnredskap."],
      [78, 93, "Ankerplass", "Anbefalt ankringsplass."],
      [11, 55, "Kompassrose", "Viser rettvisende nord og ofte misvisningen i området."]
    ] },
    { t: "tabell", tittel: "Slik leser du en fyrkarakter: «Oc WRG 6s 12m 9M»", hode: ["Del", "Betyr"], rader: [
      ["Oc", "Okkulterende: lyset er lenger på enn av"],
      ["WRG", "Hvitt, rødt og grønt – et sektorfyr"],
      ["6s", "Perioden: mønsteret gjentar seg hvert sjette sekund"],
      ["12m", "Lysets høyde over havet"],
      ["9M", "Rekkevidde: 9 nautiske mil"]
    ] },
    { t: "tabell", tittel: "Vanlige lyskarakterer", hode: ["Forkortelse", "Navn", "Slik ser det ut"], rader: [
      ["F", "Fast", "Lyser hele tiden"],
      ["Fl", "Blink", "Korte lys, lengre mørke"],
      ["Fl(2)", "Gruppeblink", "To blink i gruppe, så pause"],
      ["LFl", "Langt blink", "Blink på minst to sekunder"],
      ["Oc", "Okkulterende", "Lange lys, korte mørke"],
      ["Iso", "Isofase", "Like lange lys og mørke"],
      ["Q / VQ", "Hurtig / veldig hurtig", "Brukes på kardinalmerker"]
    ] },

    { t: "h2", tekst: "Sjømerker" },
    { t: "p", html: "Norge bruker IALA-system A. <strong>Hovedleiens retning</strong> går fra sør mot nord langs kysten og innover i fjorder og havner. Går du i den retningen, skal du ha rødt på babord og grønt på styrbord." },
    { t: "fig", fig: "lateralmerker", cap: "Lateralmerker viser sidene av leia. Babordmerket er rødt med sylinder. Styrbordmerket er grønt med kjegle." },
    { t: "fig", fig: "kardinalmerker", cap: "Kardinalmerker viser hvilken side av faren du skal passere. Toppmerket peker mot det svarte feltet på merket." },
    { t: "fig", fig: "andremerker", cap: "Isolert faremerke og merke for sikkert vann." },

    { t: "h2", tekst: "Sektorfyr" },
    { t: "p", html: "Sektorfyret viser forskjellig farge i forskjellige retninger. <strong>Hvit sektor</strong> dekker farbart vann. <strong>Rød og grønn sektor</strong> dekker farlig vann på hver side. Kystverket har lagt om alle sektorfyrene langs kysten etter IALA-standarden: Når du går mot en hvit sektor i hovedleiens retning, er <strong>grønt på styrbord side og rødt på babord side</strong>." },
    { t: "fig", fig: "sektorfyr", flate: "natt", cap: "Ser du rødt, er du for langt til babord. Ser du grønt, er du for langt til styrbord. Hvitt er trygt. Gamle kart og lærebøker kan vise sektorene før omleggingen – bruk oppdaterte kart." },
    { t: "verktoy", navn: "sektorfyr" },

    { t: "h2", tekst: "Kurs, peiling og kompass" },
    { t: "p", html: "Kursen oppgis i grader fra 000° (nord) med klokka til 359°. Kartet viser <strong>rettvisende</strong> retninger (mot geografisk nordpol). Magnetkompasset peker mot magnetisk nord, og i tillegg påvirkes det av jern og elektronikk om bord." },
    { t: "tabell", hode: ["Begrep", "Hva det er"], rader: [
      ["Misvisning", "Forskjellen mellom rettvisende og magnetisk nord. Står i kompassrosen på kartet og endrer seg litt hvert år."],
      ["Deviasjon", "Kompassets feil på grunn av fartøyet selv. Står i deviasjonstabellen og varierer med kursen."],
      ["Kompasskurs (KK)", "Det kompasset viser"],
      ["Rettvisende kurs (RK)", "Kursen i kartet. RK = KK + deviasjon + misvisning. Østlig er pluss, vestlig er minus."]
    ] },

    { t: "h2", tekst: "Fart, distanse og tid" },
    { t: "fig", fig: "fdt", cap: "Dekk over den du skal finne, så ser du regnestykket. D over F og T betyr at du deler; F ved siden av T betyr at du ganger." },
    { t: "verktoy", navn: "fdt" },
    { t: "regn", tittel: "Navigasjonsregning", intro: "Regn i timer, knop og nautiske mil. Husk at 45 minutter er 0,75 timer.", oppg: [
      { q: "Det er omtrent 24 nautiske mil fra Bud til Kristiansund. Hvor lang tid bruker du med 8 knop?", svar: 3, enhet: "timer", des: 1, tol: 0.01, forkl: "T = D ÷ F = 24 ÷ 8 = 3 timer." },
      { q: "Du går 13,5 nautiske mil på 1 time og 30 minutter. Hvor stor er farten?", svar: 9, enhet: "knop", des: 1, tol: 0.05, forkl: "F = D ÷ T = 13,5 ÷ 1,5 = 9 knop." },
      { q: "Du holder 8 knop i 45 minutter. Hvor langt går du?", svar: 6, enhet: "nm", des: 1, tol: 0.05, forkl: "D = F × T = 8 × 0,75 = 6 nautiske mil." },
      { q: "Hvor mange kilometer er 5 nautiske mil?", svar: 9.26, enhet: "km", des: 2, tol: 0.02, forkl: "5 × 1852 m = 9260 m = 9,26 km." },
      { q: "Kompasskurs 045°, deviasjon 2° Ø og misvisning 3° Ø. Hva er rettvisende kurs?", svar: 50, enhet: "°", des: 0, tol: 0.5, forkl: "RK = 045 + 2 + 3 = 050°." },
      { q: "Rettvisende kurs 270°, misvisning 2° Ø og deviasjon 1° V. Hvilken kompasskurs styrer du?", svar: 269, enhet: "°", des: 0, tol: 0.5, hint: "Snu formelen: KK = RK − misvisning − deviasjon. Vestlig deviasjon er minus.", forkl: "KK = 270 − 2 − (−1) = 269°." }
    ] },

    { t: "h2", tekst: "Elektroniske hjelpemidler" },
    { t: "tabell", hode: ["Utstyr", "Gir deg", "Husk"], rader: [
      ["GPS / GNSS", "Posisjon fra satellitter", "Kan forstyrres. Kontroller mot land, radar og dybde."],
      ["Kartplotter", "Elektronisk kart med posisjon og kurs", "Bruk oppdaterte kart og riktig målestokk. Zoom inn."],
      ["AIS", "Navn, kurs og fart for andre fartøy – og viser deg for dem", "Ikke alle har AIS. Små båter og tømmerstokker har det ikke."],
      ["Radar", "Avstand og peiling til land og fartøy, også i mørke og tåke", "Lær å stille forsterkning og sjøstøy. Bruk VRM og EBL."],
      ["Ekkolodd", "Dybde under fartøyet og fisk", "En god posisjonskontroll når du sammenligner med kartet."],
      ["Autopilot", "Holder kursen", "Ikke en erstatning for utkikk. Vit hvordan du kobler den ut."]
    ] },
    { t: "p", html: "<strong>Farvannsbeskrivelsen</strong> «Den norske los» fra Kartverket beskriver leder, havner, fyr, strøm og farer langs kysten. Bruk den når du planlegger turer i ukjent farvann." },

    { t: "h2", tekst: "Planlegg, gjennomfør og dokumenter turen" },
    { t: "steg", tittel: "Reiseplanen i fire trinn", items: [
      ["Vurder", "Hvor skal vi, når, og med hvilket fartøy? Sjekk vær, bølgevarsel, tidevann, dypgående og kjente farer."],
      ["Planlegg", "Sett veipunkter og kurslinjer i kartet. Noter kurs og distanse for hver etappe, sikre avstander fra land, og steder der dere kan søke le."],
      ["Gjennomfør", "Følg planen, og kontroller posisjonen jevnlig med minst to metoder – for eksempel GPS og radaravstand til en odde."],
      ["Overvåk og dokumenter", "Før logg: tid, posisjon, kurs, fart, vær og hendelser. Avvik fra planen skrives ned med årsak."]
    ] },
    { t: "notat", type: "lokalt", tittel: "Over Hustadvika", html: "<p>Strekningen mellom Bud og Kristiansund ligger åpent mot havet. Grunnene langt ut gjør at sjøen kan bryte selv i moderat vind, særlig når vind og strøm står mot hverandre. Planlegg med god margin til grunnene, sjekk bølgevarselet, og vit hvor du kan gå inn hvis været slår om.</p>" },

    { t: "quiz", tittel: "Navigasjon", sp: [
      { q: "Hvor i sjøkartet måler du distanse?", a: ["På breddeskalaen på siden, i høyde med der du er", "På lengdeskalaen øverst", "Med linjal i centimeter", "På kompassrosen"], r: 0, f: "Ett bueminutt på breddeskalaen er én nautisk mil. Lengdeskalaen gir feil distanse." },
      { q: "Du går inn fjorden i hovedleiens retning. Hvilken side har du det røde merket på?", a: ["Babord", "Styrbord", "Det skal ligge midt i leia", "Det kommer an på tidevannet"], r: 0, f: "Rødt på babord, grønt på styrbord i hovedleiens retning." },
      { q: "Du ser et merke med to kjegler som peker opp. Hvor passerer du?", a: ["Nord for merket", "Sør for merket", "Øst for merket", "Hvor du vil"], r: 0, f: "To kjegler opp er nordmerke. Du passerer på nordsiden." },
      { q: "Du går mot et sektorfyr og ser rødt lys. Hva gjør du?", a: ["Styrer mot styrbord til du ser hvitt", "Styrer mot babord", "Holder kursen", "Stopper og ankrer"], r: 0, f: "Rødt betyr at du er for langt til babord. Styr mot styrbord inn i hvit sektor." },
      { q: "Hva betyr «Fl(2) 6s»?", a: ["To blink i gruppe, gjentatt hvert sjette sekund", "To fyr med 6 mil rekkevidde", "Fast lys i 6 sekunder", "Blink hvert andre sekund i 6 sekunder"], r: 0, f: "Fl(2) er gruppeblink med to blink. 6s er perioden." },
      { q: "Hva viser dybdetallene i sjøkartet?", a: ["Dybden ved sjøkartnull – laveste astronomiske tidevann", "Dybden ved høyvann", "Gjennomsnittlig dybde over året", "Dybden i favner"], r: 0, f: "Dybden er oppgitt ved sjøkartnull. Som regel er det mer vann enn kartet viser." },
      { q: "Hvorfor skal du kontrollere GPS-posisjonen med en annen metode?", a: ["GPS kan ha feil eller bli forstyrret", "Det krever loven hvert kvarter", "Kartplotteren blir bedre av det", "Det er bare nødvendig om natta"], r: 0, f: "Radaravstander, peilinger og ekkolodd mot kartet avslører feil i satellittposisjonen." }
    ] },
    { t: "oppdrag", tittel: "Reiseplan: Bud – Kristiansund", sted: "Klasserom og om bord", tid: "4 t", html: "Lag en reiseplan fra Bud til Kristiansund over Hustadvika. Bruk papirkart eller kartplotter, og Kystverkets og Kartverkets kart på nett.", sjekk: [
      "Sjekk værvarsel, bølgevarsel og tidevann for dagen",
      "Sett veipunkter og finn kurs og distanse for hver etappe",
      "Merk av farer, sektorfyr og kardinalmerker langs ruta",
      "Regn ut tiden med 8 knop, og planlegg hvor dere kan søke le",
      "Gjennomfør turen hvis mulig, og før logg med posisjon hver halve time",
      "Evaluer: Hva avvek fra planen, og hvorfor?"
    ], lever: "Reiseplan og logg i Teams" }
  ],
  kanjeg: [
    "Jeg kan lese sjøkart: dybder, symboler og fyrkarakterer.",
    "Jeg kjenner lateralmerker, kardinalmerker og sektorfyr.",
    "Jeg kan regne med fart, distanse og tid.",
    "Jeg kan regne om mellom kompasskurs og rettvisende kurs.",
    "Jeg kan bruke kartplotter, radar, AIS og ekkolodd, og kontrollere posisjonen.",
    "Jeg kan lage, gjennomføre og dokumentere en reiseplan."
  ],
  kilder: ["kystverket", "kystverketIala", "laereplan"]
});

FF.moduler.push({
  id: "fr-06", fag: "fr", nr: "06", timer: 25,
  tittel: "Sjøveisregler og brovakt",
  under: "Hvem skal vike, hvilke lanterner du ser i mørket, lydsignaler, og hvordan du holder en våken og trygg brovakt.",
  maal: ["FR3"], kjerne: ["Sikkerhet om bord"],
  verktoy: ["lanterner", "vikeplikt"],
  kort: [
    "Står peilingen til et annet fartøy stille mens avstanden minker, er dere på kollisjonskurs.",
    "Har du et fartøy på styrbord side på kryssende kurs, er det du som skal vike.",
    "Et fiskefartøy som ikke driver fiske, er et vanlig maskindrevet fartøy."
  ],
  blokker: [
    { t: "ingress", html: "Sjøveisreglene – forskrift om forebygging av sammenstøt på sjøen – er de samme i hele verden. De sier hvem som skal vike, hvilke lys og signaler du skal vise, og hvordan du holder utkikk. Alle som fører fartøy, skal kunne dem." },

    { t: "h2", tekst: "Utkikk, fart og fare for kollisjon" },
    { t: "ul", items: [
      "<strong>Regel 5 – Utkikk:</strong> Hold utkikk med syn og hørsel, og med alle hjelpemidler du har, til enhver tid.",
      "<strong>Regel 6 – Sikker fart:</strong> Farten skal være slik at du kan stoppe eller unngå kollisjon i tide. Tenk på sikt, trafikk, vær og hvor fort fartøyet stopper.",
      "<strong>Regel 7 – Fare for kollisjon:</strong> Ta peilinger av fartøyet som nærmer seg. Endrer ikke peilingen seg merkbart mens avstanden minker, er det fare for kollisjon.",
      "<strong>Regel 8 – Manøver:</strong> Gjør manøveren i god tid og så stor at den andre ser den. En stor kursendring er bedre enn mange små."
    ] },

    { t: "h2", tekst: "Hvem skal vike?" },
    { t: "fig", fig: "vikeplikt", cap: "De tre grunnsituasjonene for to maskindrevne fartøy: møtende, kryssende og innhenting." },
    { t: "p", html: "Fartøyet som skal vike, heter det <strong>vikepliktige</strong> fartøyet. Det andre er <strong>kurs- og fartholder</strong> og skal holde kurs og fart – men må selv gjøre en manøver hvis det ser at den andre ikke viker." },
    { t: "tabell", tittel: "Regel 18 – ansvar mellom fartøy", hode: ["Fartøy under fart", "Skal holde seg unna"], rader: [
      ["Maskindrevet fartøy", "Ikke under kommando, begrenset manøvreringsevne, fartøy som driver fiske, seilfartøy"],
      ["Seilfartøy", "Ikke under kommando, begrenset manøvreringsevne, fartøy som driver fiske"],
      ["Fartøy som driver fiske", "Så langt det er mulig: ikke under kommando og begrenset manøvreringsevne"]
    ] },
    { t: "notat", type: "regel", etikett: "Viktig for fiskere", tittel: "Når regnes du som fiskende?", html: "<p>Du regnes som «fartøy som driver fiske» bare når redskapen begrenser manøvreringsevnen din – for eksempel når du trekker trål eller ligger på garn. På vei til og fra feltet er du et vanlig maskindrevet fartøy med vanlig vikeplikt. Fiskefartøy skal heller ikke hindre fartøy som må holde seg i en trang led (regel 9) eller i et trafikkseparasjonssystem (regel 10).</p>" },
    { t: "verktoy", navn: "vikeplikt" },

    { t: "h2", tekst: "Lanterner og dagsignaler" },
    { t: "p", html: "Om natta ser du bare lysene. Ut fra hvilke lys du ser og hvordan de står, kan du finne ut hva slags fartøy det er, og hvilken vei det går." },
    { t: "fig", fig: "fartoyTopp", cap: "Topplanterne 225° forover, sidelanterner 112,5° hver, hekklanterne 135° akterover." },
    { t: "figpar", figs: [
      { fig: "lanterner", a: { type: "tral", b: 40 }, flate: "natt", cap: "Tråler i fiske, sett fra styrbord baug: grønt over hvitt, og grønn sidelanterne." },
      { fig: "lanterner", a: { type: "fisk", b: 320 }, flate: "natt", cap: "Fiskefartøy med garn eller line, sett fra babord baug: rødt over hvitt, og rød sidelanterne." }
    ] },
    { t: "tabell", hode: ["Fartøy", "Lys om natta", "Dagsignal"], rader: [
      ["Maskindrevet under fart (under 50 m)", "Topplanterne, sidelanterner, hekklanterne", "–"],
      ["Tråler i fiske", "Grønt over hvitt rundtlys. Side- og hekklanterner når den gjør fart", "To kjegler med spissene mot hverandre (under 20 m: kan være en kurv)"],
      ["Fiske, ikke trål", "Rødt over hvitt rundtlys. Side- og hekklanterner når den gjør fart", "To kjegler med spissene mot hverandre"],
      ["Ikke under kommando", "To røde rundtlys under hverandre", "To svarte kuler"],
      ["Begrenset manøvreringsevne", "Rødt – hvitt – rødt rundtlys", "Kule – rombe – kule"],
      ["Til ankers (under 50 m)", "Ett hvitt rundtlys", "Én svart kule forut"]
    ] },
    { t: "verktoy", navn: "lanterner" },

    { t: "h2", tekst: "Lydsignaler" },
    { t: "tabell", hode: ["Signal", "Betyr"], rader: [
      ["• (ett kort)", "Jeg dreier til styrbord"],
      ["• • (to korte)", "Jeg dreier til babord"],
      ["• • • (tre korte)", "Jeg bakker (motor akterover)"],
      ["• • • • • (minst fem korte)", "Jeg forstår ikke hva du gjør / tvil"],
      ["— (ett langt, hvert 2. minutt, i tåke)", "Maskindrevet fartøy som gjør fart"],
      ["— • • (langt og to korte, hvert 2. minutt, i tåke)", "Blant annet fartøy som driver fiske eller ikke er under kommando"]
    ] },

    { t: "h2", tekst: "Brovakt" },
    { t: "p", html: "Sjøfartsdirektoratet har undersøkt mange grunnstøtinger med fiskefartøy. Et mønster går igjen: Den som hadde vakt, var alene, trøtt og sovnet. Andre ganger var oppmerksomheten på telefonen, fisket eller kartplotteren – ikke på sjøen." },
    { t: "steg", tittel: "Overlevering av vakt", items: [
      ["Posisjon, kurs og fart", "Hvor er vi, hvor skal vi, og hvordan går det i forhold til planen?"],
      ["Trafikk og farer", "Fartøy i nærheten, merker, grunner og redskap i sjøen."],
      ["Vær og sikt", "Hva er varslet, og hva ser du selv?"],
      ["Utstyr", "Er radar, AIS, ekkolodd og vaktalarm på? Er noe ute av drift?"],
      ["Er du klar?", "Den som tar over, skal være våken og ha nattsyn før overleveringen."]
    ] },
    { t: "notat", type: "fare", tittel: "Vaktalarmen skal stå på", html: "<p>Vaktalarmen (BNWAS) varsler hvis vakthavende ikke bekrefter med jevne mellomrom. Den er laget for å fange opp den som sovner. Slå den aldri av.</p>" },

    { t: "quiz", tittel: "Sjøveisregler og lanterner", sp: [
      { q: "To maskindrevne fartøy går rett mot hverandre. Hva gjør de?", a: ["Begge viker til styrbord", "Begge viker til babord", "Den minste viker", "Den som kommer fra nord viker"], r: 0, f: "Regel 14: Møtende fartøy viker begge til styrbord." },
      { q: "Du har et annet maskindrevet fartøy på styrbord side på kryssende kurs. Hvem viker?", a: ["Du", "Det andre fartøyet", "Den som har størst fart", "Ingen – dere holder kursen"], r: 0, f: "Regel 15: Den som har den andre på sin styrbord side, skal vike." },
      { q: "Du tar peilinger av et fartøy. Peilingen står stille og avstanden minker. Hva betyr det?", a: ["Fare for kollisjon", "Fartøyet ligger stille", "Dere går parallelt", "Fartøyet går bort fra deg"], r: 0, f: "Stående peiling og minkende avstand betyr kollisjonskurs." },
      { q: "Du ser dette rett forut i mørket. Hva er det?", fig: "lanterner", figa: { type: "fisk", b: 0, silhuett: false, tekst: "RETT FORUT" }, a: ["Fiskefartøy (ikke trål) som gjør fart mot deg", "Tråler som går fra deg", "Fartøy til ankers", "Seilbåt"], r: 0, f: "Rødt over hvitt er fiske med annet enn trål. Både grønn og rød sidelanterne betyr at den kommer rett mot deg." },
      { q: "Hva ser du her?", fig: "lanterner", figa: { type: "maskin", b: 90, silhuett: false, tekst: "TVERS OM STYRBORD" }, a: ["Maskindrevet fartøy sett fra styrbord side", "Maskindrevet fartøy sett fra babord side", "Tråler i fiske", "Fartøy uten fart"], r: 0, f: "Topplanterne og grønn sidelanterne: Du ser styrbord side av et maskindrevet fartøy. Det går fra venstre mot høyre." },
      { q: "Er du «fartøy som driver fiske» på vei ut til feltet?", a: ["Nei, da er du et vanlig maskindrevet fartøy", "Ja, alltid når du har redskap om bord", "Ja, hvis du har fiskerimerke", "Bare om natta"], r: 0, f: "Det avgjørende er om redskapen begrenser manøvreringsevnen din akkurat nå." },
      { q: "Hva betyr tre korte støt i lydsignalet?", a: ["Jeg bakker", "Jeg dreier til styrbord", "Jeg dreier til babord", "Jeg forstår ikke hva du gjør"], r: 0, f: "Ett kort: styrbord. To korte: babord. Tre korte: motor akterover. Fem eller flere: tvil." }
    ] },
    { t: "oppdrag", tittel: "Brovakt med utkikk", sted: "Om bord", tid: "2 t", html: "Ta en vakt på broa sammen med læreren eller skipperen. Før vaktlogg og øv på å vurdere fartøyene rundt dere.", sjekk: [
      "Gjennomfør overlevering med sjekklista over",
      "Ta peilinger av minst tre fartøy og vurder om det er fare for kollisjon",
      "Identifiser minst to fartøy ut fra lanterner eller dagsignaler",
      "Si høyt hvem som har vikeplikt i hver situasjon",
      "Før vaktlogg: tid, posisjon, kurs, fart, vær og observasjoner"
    ] }
  ],
  kanjeg: [
    "Jeg kan regel 5–8 om utkikk, sikker fart og fare for kollisjon.",
    "Jeg vet hvem som skal vike i møtende, kryssende og innhentende situasjoner.",
    "Jeg kan ansvarsforholdene i regel 18, og når et fiskefartøy regnes som fiskende.",
    "Jeg kjenner igjen lanterner og dagsignaler for de vanligste fartøyene.",
    "Jeg kan de viktigste lydsignalene.",
    "Jeg kan overlevere og holde en brovakt."
  ],
  kilder: ["sdirBro", "sdirFisk", "laereplan"]
});

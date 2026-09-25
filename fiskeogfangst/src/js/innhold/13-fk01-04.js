/* Fangst og kvalitet: FK·01–04 */

FF.moduler.push({
  id: "fk-01", fag: "fk", nr: "01", timer: 20,
  tittel: "Artene vi fisker",
  under: "Kjennetegn, biologi og vandringer for torsk, hyse, sei, sild, makrell, flatfisk og krabbe – og hvordan du skiller dem på dekk.",
  maal: [], kjerne: ["Marine ressurser"],
  verktoy: ["arter"],
  kort: [
    "Torsk har skjeggtråd og lys sidelinje. Hyse har svart sidelinje og svart flekk. Sei har rett, lys sidelinje.",
    "Skreien vandrer fra Barentshavet til gyteplassene langs kysten, særlig Lofoten.",
    "Norsk vårgytende sild gyter langs kysten – blant annet utenfor Møre."
  ],
  blokker: [
    { t: "ingress", html: "Du må kunne skille artene på et øyeblikk – de har ulike kvoter, minstemål og priser. Og du må kjenne livet deres: Hvor gyter de, hva spiser de, og når kommer de til kysten?" },

    { t: "h2", tekst: "Fiskens kropp" },
    { t: "fig", fig: "torskAnatomi", cap: "Torsk med navn på finner og kroppsdeler. Torskefiskene har tre ryggfinner og to gattfinner." },
    { t: "begreper", items: [
      ["Bunnfisk", "Lever nær bunnen: torsk, hyse, lange, brosme, flatfisk, steinbit.", "botnfisk"],
      ["Pelagisk fisk", "Lever i de frie vannmassene: sild, makrell, lodde, kolmule.", "pelagisk fisk"],
      ["Gyting", "Når fisken slipper rogn og melke og befrukter eggene.", "gyting"],
      ["Otolitt", "Øresteinen. Den har årringer som viser hvor gammel fisken er.", "otolitt"],
      ["Bestand", "En gruppe av samme art som gyter i samme område, og som forvaltes samlet.", "bestand"],
      ["Rekruttering", "Hvor mange ungfisk som kommer inn i bestanden hvert år.", "rekruttering"]
    ] },

    { t: "h2", tekst: "Artskort" },
    { t: "p", html: "Bla i artskortene og lær kjennetegnene. Etterpå kan du teste deg selv i artsquizen." },
    { t: "verktoy", navn: "arter" },

    { t: "h2", tekst: "Vandringer og gyting" },
    { t: "fig", fig: "fiskerikart", a: {
      alt: "Kart som viser skreiens vandring fra Barentshavet til Lofoten, og sildas vandring mellom Nord-Norge, gyteplassene på Møre og beiteområdene i Norskehavet.",
      pil: [[30, 72.2, 15.4, 68.5, 1, -43, -83], [14, 70.3, 5.4, 63.0, 2, -95, 0], [5.0, 63.6, 2.6, 67.4, 3, -38, 12]],
      omr: [[13.8, 67.9, 26, 14, "Lofoten", 0, 34], [5.8, 62.6, 18, 12, "", 0, 0], [22, 71.9, 90, 22, "", 0, 0]],
      pkt: [[7.0, 62.95, "Hustadvika", 12, 4]],
      legende: [[1, ["Skreien vandrer fra Barentshavet", "til gyteplassene, særlig Lofoten.", "Februar–april."]], [2, ["Silda vandrer fra overvintring i", "nord til gyteplassene – blant", "annet utenfor Møre."]], [3, ["Silda beiter i Norskehavet", "om sommeren."]]]
    }, cap: "Skreien (nordøstarktisk torsk) vokser opp i Barentshavet og vandrer til gyteplassene langs kysten om vinteren – de viktigste er i Lofoten. Norsk vårgytende sild overvintrer i nord, gyter blant annet langs Mørekysten, og beiter i Norskehavet om sommeren." },
    { t: "tabell", hode: ["Art", "Gyter", "Viktige fiskerier"], rader: [
      ["Skrei (torsk)", "Februar–april, Lofoten og langs kysten", "Lofotfisket og skreifisket langs hele kysten om vinteren"],
      ["Kysttorsk", "Lokalt i fjorder og langs kysten", "Hele året, strengere regulert"],
      ["Hyse", "Våren, langs eggakanten", "Line, snurrevad og trål i nord"],
      ["Sei", "Vinter, langs kysten og i Nordsjøen", "Not og trål, juksa langs kysten"],
      ["Norsk vårgytende sild", "Februar–mars, langs kysten, blant annet utenfor Møre", "Ringnot og trål høst og vinter"],
      ["Makrell", "Vår og sommer, vest for Storbritannia og i Nordsjøen", "Ringnot og trål august–oktober"]
    ] },
    { t: "notat", type: "lokalt", tittel: "Havet utenfor oss", html: "<p>Mørekysten ligger midt i vandringsveiene. Silda kommer inn for å gyte, skreien kommer langs kysten, og feltene utenfor Hustadvika og Nordmøre er viktige for både kystflåten og havfiskeflåten. Snakk med fiskere i distriktet om hvilke arter som fiskes når.</p>" },

    { t: "h2", tekst: "Økosystemet" },
    { t: "p", html: "Artene henger sammen. Torsken spiser lodde, sild og reke. Lodda spiser dyreplankton. Når loddebestanden går ned, vokser torsken dårligere og spiser mer av sine egne unger. Havforskningsinstituttet følger bestandene gjennom tokt og fangstdata, og gir råd om hvor mye som kan fiskes." },

    { t: "quiz", tittel: "Kjenner du artene?", sp: [
      { q: "Hvilken art er dette?", fig: "art", figa: { art: "hyse" }, a: ["Hyse", "Torsk", "Sei", "Lyr"], r: 0, f: "Svart sidelinje og svart flekk over brystfinnen: hyse." },
      { q: "Hvilken art er dette?", fig: "art", figa: { art: "lyr" }, a: ["Lyr", "Sei", "Torsk", "Lange"], r: 0, f: "Underkjeven stikker tydelig fram og sidelinja er mørk med bue: lyr." },
      { q: "Hvilken art er dette?", fig: "art", figa: { art: "sei" }, a: ["Sei", "Hyse", "Lyr", "Torsk"], r: 0, f: "Rett, lys sidelinje og mørk grønngrå rygg: sei." },
      { q: "Hvilken art er dette?", fig: "art", figa: { art: "brosme" }, a: ["Brosme", "Lange", "Steinbit", "Torsk"], r: 0, f: "Én lang ryggfinne med hvit kant: brosme." },
      { q: "Hvor ligger de viktigste gyteplassene for skreien?", a: ["I Lofoten", "I Nordsjøen", "I Barentshavet", "I Oslofjorden"], r: 0, f: "Skreien vandrer fra Barentshavet til kysten, og de viktigste gyteplassene er i Lofoten." },
      { q: "Hva forteller otolitten?", a: ["Hvor gammel fisken er", "Hvor fisken ble fanget", "Hvor fet fisken er", "Om fisken er hann eller hunn"], r: 0, f: "Øresteinen har årringer, som et tre." },
      { q: "Hvilken art er pelagisk?", a: ["Makrell", "Hyse", "Brosme", "Kveite"], r: 0, f: "Makrell lever i de frie vannmassene. De andre er bunnfisk." }
    ] },
    { t: "oppdrag", tittel: "Artsbestemmelse på kaia", sted: "Kai / mottak", tid: "2 t", html: "Besøk et fiskemottak eller ta med fangsten fra en tur. Bestem artene og mål dem.", sjekk: [
      "Bestem minst seks arter og skriv ned kjennetegnene du brukte",
      "Mål totallengde fra snutespissen til enden av halefinnen",
      "Finn kjønn og modenhet på noen torsk sammen med læreren",
      "Ta ut en otolitt og se etter årringer"
    ] }
  ],
  kanjeg: [
    "Jeg kan skille torsk, hyse, sei og lyr sikkert.",
    "Jeg kan kjenne igjen lange, brosme, kveite, blåkveite, uer, steinbit, sild og makrell.",
    "Jeg kan navnene på finnene og kroppsdelene til en fisk.",
    "Jeg kan forklare skreiens og sildas vandringer.",
    "Jeg kan forklare hvordan artene henger sammen i økosystemet."
  ],
  kilder: ["hi", "ndla"]
});

FF.moduler.push({
  id: "fk-02", fag: "fk", nr: "02", timer: 25,
  tittel: "Forvaltning og regelverk",
  under: "Hvem eier fisken, hvem bestemmer kvotene, og hvilke regler du må følge om bord – fra minstemål til elektronisk fangstdagbok.",
  maal: ["FK7"], kjerne: ["Marine ressurser"],
  kort: [
    "Fisken i havet tilhører fellesskapet. Retten til å fiske er gitt, ikke eid.",
    "Kvotene fordeles fra totalkvote til fartøykvote – som en trakt.",
    "Alt du fisker, skal rapporteres. Regler endres ofte: Sjekk J-meldingene."
  ],
  blokker: [
    { t: "ingress", html: "Norsk fiskeriforvaltning bygger på et enkelt prinsipp: Fisken i havet tilhører fellesskapet, og den skal høstes slik at det også er fisk til neste generasjon. Resten er detaljer – men detaljene må du kunne." },

    { t: "h2", tekst: "Lovene" },
    { t: "tabell", hode: ["Lov", "Hva den sier"], rader: [
      ["Havressurslova", "De viltlevende marine ressursene tilhører fellesskapet i Norge. Forvaltningen skal være bærekraftig og bygge på forskning."],
      ["Deltakerloven", "Hvem som kan drive ervervsmessig fiske: Du må stå i fiskermanntallet, og fartøyet må ha ervervstillatelse og deltakeradgang."],
      ["Høstingsforskriften", "Hvordan fisket skal gjennomføres: redskap, maskevidde, minstemål, merking og mye mer."],
      ["Reguleringsforskriftene", "Kvoter og regler for hvert fiskeri, for hvert år. Endres med J-meldinger."]
    ] },

    { t: "h2", tekst: "Fra forskningsråd til din kvote" },
    { t: "fig", fig: "kvotetrakt", cap: "Kvotetrakten. For torsk i nord fastsettes totalkvoten av Den norsk-russiske fiskerikommisjonen." },
    { t: "p", html: "I kystfisket skiller vi mellom <strong>lukket gruppe</strong>, der fartøyene har egen kvote, og <strong>åpen gruppe</strong>, der fiskere uten kvote kan fiske en mindre mengde. Kvotene fordeles etter en fordelingsnøkkel mellom fartøygrupper av ulik lengde." },

    { t: "h2", tekst: "Reglene om bord" },
    { t: "ul", items: [
      "<strong>Minstemål:</strong> Fisk under minstemålet skal ikke fiskes. Lengden måles fra snutespissen til enden av halefinnen. Minstemålene varierer med art og område.",
      "<strong>62°N:</strong> Mange regler er forskjellige nord og sør for 62 grader nord – like sør for Stad. Hustadvika ligger nord for 62°N.",
      "<strong>Fredningstid og stengte områder:</strong> Noen felt stenges i gytetida eller når det er mye småfisk (sanntidsstenging).",
      "<strong>Utkastforbud:</strong> Hovedregelen er at fangst av regulerte arter skal tas i land – ikke kastes ut igjen.",
      "<strong>Redskapsregler:</strong> Maskevidde, antall garn, seleksjonsinnretninger og merking."
    ] },
    { t: "fig", fig: "fiskerikart", a: { linje62: true, hav: true, alt: "Kart over norskekysten med 62-gradersgrensen tegnet inn like sør for Stad.", pkt: [[7.0, 62.95, "Hustadvika", 12, 4], [5.1, 62.19, "Stad", -10, 4, "end"]] }, cap: "62°N er en viktig grense i reguleringene. Sjekk alltid hvilket område reglene gjelder for." },
    { t: "notat", type: "regel", tittel: "Slå alltid opp gjeldende regler", html: "<p>Minstemål, kvoter og stengte områder endres ofte – noen ganger midt i sesongen. Du finner gjeldende regler hos Fiskeridirektoratet (J-meldingene) og i Lovdata. Tallene i en lærebok kan være utdatert.</p>" },

    { t: "h2", tekst: "Rapportering" },
    { t: "p", html: "Fiskeridirektoratet må vite hva som blir fisket, hvor og når. Derfor rapporterer fartøyene elektronisk (<strong>ERS</strong>)." },
    { t: "tabell", hode: ["Rapport", "Hva", "Hvem"], rader: [
      ["Fangstdagbok (ERS)", "Avgang, fangst og aktivitet, ankomst", "Fartøy under 15 m bruker Fiskeridirektoratets app på mobil eller nettbrett. Større fartøy har eget system."],
      ["Posisjonsrapportering", "Hvor fartøyet er", "Nå også for mindre fartøy – fra 2026 fartøy på 8–10 m"],
      ["Sluttseddel", "Hva som ble levert: art, vekt, kvalitet, pris", "Kjøperen fyller ut ved landing, fiskeren signerer"]
    ] },

    { t: "h2", tekst: "Hvem gjør hva i forvaltningen" },
    { t: "fig", fig: "forvaltning", cap: "Forvaltningsnivåene og organisasjonene i fiskerinæringen." },
    { t: "p", html: "Hvert år holder Fiskeridirektoratet <strong>reguleringsmøtet</strong>, der næringen, organisasjonene og forskerne diskuterer reguleringene for neste år. Fiskerne har altså en stemme – gjennom Norges Fiskarlag, Fiskebåt, Norges Kystfiskarlag og andre." },

    { t: "quiz", tittel: "Forvaltning", sp: [
      { q: "Hvem eier fisken i havet etter havressurslova?", a: ["Fellesskapet i Norge", "Den som har kvote", "Fiskeridirektoratet", "Den som fanger den først"], r: 0, f: "Ressursene tilhører fellesskapet. Kvoten gir rett til å fiske, ikke eierskap til fisken i havet." },
      { q: "Hvilken lov bestemmer hvem som kan drive ervervsmessig fiske?", a: ["Deltakerloven", "Havressurslova", "Skipsarbeidsloven", "Matloven"], r: 0, f: "Deltakerloven: fiskermanntall, ervervstillatelse og deltakeradgang." },
      { q: "Hvordan måler du lengden på en fisk?", a: ["Fra snutespissen til enden av halefinnen", "Fra øyet til halen", "Fra gjellelokket til gattet", "Bare kroppen, uten halen"], r: 0, f: "Totallengde. Legg fisken rett på målebrettet." },
      { q: "Hvor finner du gjeldende reguleringer?", a: ["J-meldingene hos Fiskeridirektoratet", "I gamle lærebøker", "På salgslagets Facebook-side", "Hos Mattilsynet"], r: 0, f: "J-meldingene er de gjeldende reguleringene, og de oppdateres fortløpende." },
      { q: "Hvem fyller ut sluttseddelen?", a: ["Kjøperen, når fisken landes", "Fiskeren før avgang", "Kystvakten", "Havforskningsinstituttet"], r: 0, f: "Sluttseddelen fylles ut av kjøperen og signeres av fiskeren." },
      { q: "Hva er sanntidsstenging?", a: ["Midlertidig stenging av felt med mye småfisk", "Stenging av havna om natta", "At kvoten er brukt opp", "Stengt fiske på søndager"], r: 0, f: "Når prøver viser for mye undermåls fisk, stenges feltet en periode." }
    ] },
    { t: "oppdrag", tittel: "Finn reglene selv", sted: "Klasserom", tid: "2 t", gruppe: "2 elever", html: "Bruk Fiskeridirektoratets nettsider og Lovdata. Fyll inn gjeldende regler i en tabell, og skriv hvor du fant dem og hvilken dato de gjelder fra.", sjekk: [
      "Minstemål for torsk, hyse, sei og lyr nord for 62°N",
      "Gjeldende J-melding for torsk, hyse og sei nord for 62°N for kystflåten",
      "Om det er stengte felt nær Hustadvika akkurat nå",
      "Hvilke rapporter skolebåten må sende på en fisketur",
      "Hvor mye en fisker i åpen gruppe kan fiske i år"
    ], lever: "Tabellen med kilder i Teams" }
  ],
  kanjeg: [
    "Jeg kan forklare havressurslova og deltakerloven.",
    "Jeg kan forklare hvordan kvotene fordeles fra totalkvote til fartøykvote.",
    "Jeg kan finne gjeldende minstemål og reguleringer selv.",
    "Jeg vet hva som skal rapporteres, og hvordan.",
    "Jeg kan forklare hvem som gjør hva i forvaltningen, og hvilke organisasjoner som finnes."
  ],
  kilder: ["fdir", "fdirJ", "hosting", "ers"]
});

FF.moduler.push({
  id: "fk-03", fag: "fk", nr: "03", timer: 15,
  tittel: "Seleksjon og bærekraft",
  under: "Hvordan redskapen kan velge ut riktig art og størrelse, og hvorfor det betyr noe for bestandene og for fiskerne selv.",
  maal: ["FK1"], kjerne: ["Marine ressurser", "Fangst, kvalitet og marked"],
  kort: [
    "Seleksjon betyr at redskapen fanger den fisken du vil ha, og slipper resten.",
    "Maskevidde, kvadratmasker, sorteringsrist og krokstørrelse styrer størrelsen.",
    "Småfisk som slipper unna i dag, er fangsten din om noen år."
  ],
  blokker: [
    { t: "ingress", html: "En ung torsk som slipper gjennom maskene i dag, kan gyte mange ganger før den blir fanget. Seleksjon er ikke bare en regel – det er en investering i ditt eget fiske." },

    { t: "h2", tekst: "To typer seleksjon" },
    { t: "tabell", hode: ["", "Størrelsesseleksjon", "Artsseleksjon"], rader: [
      ["Mål", "Slippe ut fisk under ønsket størrelse", "Unngå arter du ikke har kvote på eller ikke vil ha"],
      ["Virkemidler", "Maskevidde, kvadratmasker, sorteringsrist, krokstørrelse, fluktåpninger", "Valg av felt, tid og dyp, redskap og agn, sorteringsrist som slipper ut fisk fra reketrål"]
    ] },
    { t: "fig", fig: "seleksjon", cap: "Diamantmasker lukker seg når posen strammes. Kvadratmasker står åpne. Sorteringsrista slipper småfisk ut før posen." },
    { t: "ul", items: [
      "<strong>Maskevidde</strong> måles med maskemåler i strukket maske. Minste tillatte maskevidde står i regelverket for hvert redskap og område.",
      "<strong>Kvadratmasker</strong> brukes i posen i snurrevad og trål fordi de ikke lukker seg.",
      "<strong>Sorteringsrist</strong> i torsketrål slipper ut småfisk. I reketrål slipper rista ut fisk, mens reka går gjennom.",
      "<strong>Krokstørrelse</strong> på line og juksa styrer hvor stor fisk som biter.",
      "<strong>Fluktåpninger</strong> i teiner slipper ut små krabber og hummer."
    ] },

    { t: "h2", tekst: "Bifangst og andre arter" },
    { t: "p", html: "Sjøfugl kan bli fanget på line og i garn, og nise kan sette seg fast i garn. Tiltak som skremmeline over lina, setting i mørke og akustiske skremmere på garn reduserer bifangsten. Bunntrål kan skade koraller og svamp, og derfor er noen områder stengt for bunntråling." },

    { t: "h2", tekst: "Bærekraft og marked" },
    { t: "p", html: "Kjøperne i Europa vil vite at fisken er fisket bærekraftig. Mange norske fiskerier er eller har vært sertifisert etter miljømerket <strong>MSC</strong>. For å få og beholde sertifikatet må bestanden være i god forfatning, fisket må ha liten påvirkning på økosystemet, og forvaltningen må fungere." },
    { t: "tenk", html: "Føre-var-prinsippet sier at når vi er usikre på bestanden, skal vi fiske mindre, ikke mer. Hva betyr det for en ung fisker som nettopp har kjøpt båt og kvote? Diskuter fordeler og ulemper." },

    { t: "quiz", tittel: "Seleksjon", sp: [
      { q: "Hvorfor bruker man kvadratmasker i posen?", a: ["De står åpne når posen strammes", "De er billigere", "De holder bedre på fisken", "De er lettere å bøte"], r: 0, f: "Diamantmasker lukker seg under strekk. Kvadratmasker holder seg åpne og slipper ut småfisk." },
      { q: "Hva gjør sorteringsrista i en reketrål?", a: ["Slipper ut fisk, mens reka går gjennom til posen", "Slipper ut reke", "Sorterer reka etter størrelse om bord", "Holder trålen åpen"], r: 0, f: "Rista styrer fisken ut av en åpning, mens den lille reka går mellom spilene." },
      { q: "Hva er størrelsesseleksjon?", a: ["At redskapen slipper ut fisk under ønsket størrelse", "At fiskeren velger den største fisken om bord", "At mottaket sorterer fisken", "At du fisker på stor fisk med stor båt"], r: 0, f: "Seleksjonen skjer i sjøen – før fisken kommer om bord." },
      { q: "Hvordan reduserer du at sjøfugl tar agnet på lina?", a: ["Skremmeline og setting i mørke", "Mer agn", "Høyere fart ved setting", "Lys på dekket"], r: 0, f: "Skremmelina holder fuglene unna der lina går i sjøen." },
      { q: "Hva er MSC?", a: ["Et miljømerke for bærekraftig fiske", "Et sertifikat for skippere", "En type sorteringsrist", "Et kvotesystem"], r: 0, f: "MSC-merket viser kjøperne at fisket er vurdert som bærekraftig." }
    ] }
  ],
  kanjeg: [
    "Jeg kan forklare størrelsesseleksjon og artsseleksjon.",
    "Jeg kan forklare hvordan maskevidde, kvadratmasker, sorteringsrist og krok påvirker fangsten.",
    "Jeg kan måle maskevidde med maskemåler.",
    "Jeg kan vurdere hva seleksjon betyr for bærekraftig forvaltning."
  ],
  kilder: ["redskapshefte", "hosting", "hi"]
});

FF.moduler.push({
  id: "fk-04", fag: "fk", nr: "04", timer: 30,
  tittel: "Fangstbehandling om bord",
  under: "Bløgging, utblødning, sløying, vasking og kjøling – de første minuttene avgjør kvaliteten på fisken.",
  maal: ["FK2", "FK3"], kjerne: ["Fangst, kvalitet og marked"],
  kort: [
    "Bløgg fisken straks den er om bord – helst mens den lever.",
    "Blod som blir igjen i fisken, kan aldri vaskes ut senere.",
    "Kjøl fisken ned mot 0 °C så raskt som mulig, og hold den kald hele veien."
  ],
  blokker: [
    { t: "ingress", html: "Norsk fisk selges i konkurranse med fisk fra hele verden. Prisen avgjøres av kvaliteten, og kvaliteten avgjøres i stor grad på dekket – i minuttene etter at fisken er kommet om bord." },

    { t: "h2", tekst: "Fangstlinja" },
    { t: "fig", fig: "fangstlinje", cap: "Seks trinn fra fisken er om bord til den står i lasterommet." },
    { t: "sorter", tittel: "Sett trinnene i riktig rekkefølge", items: ["Bløgge", "Blø ut i rennende sjøvann", "Sløye", "Vaske", "Kjøle", "Lagre i kasser eller tank"] },

    { t: "h2", tekst: "Bløgging og utblødning" },
    { t: "fig", fig: "torskAnatomi", a: { blogg: true, etiketter: false }, cap: "Bløggekuttet går over strupen, der blodårene fra hjertet går til gjellene. Kutt blodårene – ikke stikk inn i buken." },
    { t: "steg", items: [
      ["Bløgg straks", "Så raskt som mulig etter at fisken er om bord, helst mens den lever. Da hjelper hjertet til å pumpe ut blodet."],
      ["Riktig kutt", "Skjær over strupen og blodårene ved gjellene. Unngå å skjære inn i innvollene."],
      ["Blø ut i rennende sjøvann", "Legg fisken i kar med rent, rennende sjøvann, så den kan flyte fritt. Følg rutinen i kvalitetssystemet – ofte 20–30 minutter."],
      ["Ikke stable i karet", "Fisk som ligger i klem, blør dårlig ut og får trykkskader."]
    ] },
    { t: "notat", type: "regel", tittel: "Kvalitetsforskriften", html: "<p>Forskrift om kvalitet på fisk og fiskevarer stiller krav til behandlingen om bord. Blant annet skal fisk som bløgges, sløyes så snart som mulig etter bløgging, slik at kvaliteten ikke forringes. Fartøy som fisker arter som skal bløgges, skal ha bløggerist på dekk i passende arbeidshøyde og kar med avrenningsrist. Mattilsynet fører tilsyn.</p>" },

    { t: "h2", tekst: "Sløying og vasking" },
    { t: "steg", items: [
      ["Åpne buken", "Skjær fra gattet og fram mot strupen, uten å skjære i tarmen."],
      ["Ta ut innvollene", "Lever og rogn kan tas vare på. Magesekk og tarm fjernes."],
      ["Fjern blodranda", "Den mørke nyra langs ryggraden fjernes med skje eller børste."],
      ["Vask", "Skyll godt med rent sjøvann innvendig og utvendig."]
    ] },

    { t: "h2", tekst: "Kjøling og lagring" },
    { t: "fig", fig: "temperatur", cap: "Jo varmere fisken er, jo raskere forsvinner kvaliteten. Prinsippskisse." },
    { t: "tabell", hode: ["Metode", "Slik virker det", "Brukes"], rader: [
      ["Is i kasser", "Fisken legges lagvis med is under, mellom og over", "Kystflåten, fersk fisk"],
      ["RSW (kjølt sjøvann)", "Sjøvann kjølt med kjøleanlegg, nær 0 °C", "Pelagisk fisk og mye bunnfisk på større fartøy"],
      ["CSW (issørpe)", "Sjøvann kjølt med is", "Mindre fartøy uten kjøleanlegg"],
      ["Frysing om bord", "Platefrysere eller blokkfrysere, ned til −18 °C eller lavere", "Frysetrålere og autolinere"],
      ["Levende lagring", "Fisken holdes levende i tank eller merd", "Levendefangst av torsk og kongekrabbe"]
    ] },
    { t: "ul", items: [
      "Kasser skal ikke fylles over kanten. Da presses fisken i kassa over.",
      "Smeltevann må renne av, så fisken ikke ligger i blodvann.",
      "Mål og noter temperaturen i fisken og i rommet.",
      "Hold lasterommet og kassene rene."
    ] },

    { t: "h2", tekst: "Utstyret om bord" },
    { t: "p", html: "Bløggekar, bløggerist, sløyebenk eller sløyemaskin, vaskemaskin for fisk, RSW-anlegg eller ismaskin, pumper, sorteringsbord og transportbånd. Utstyret skal være lett å rengjøre, og det skal ikke skade fisken. Et dårlig plassert kar eller en for høy slipp ned i rommet gir blåmerker og klemskader." },

    { t: "quiz", tittel: "Fangstbehandling", sp: [
      { q: "Når skal fisken bløgges?", a: ["Straks den er om bord, helst mens den lever", "Når hele lenka er halt", "Når dere er i havn", "Etter at den er kjølt"], r: 0, f: "Rask bløgging gir best utblødning og hvitest filet." },
      { q: "Hvorfor skal fisken blø ut i rennende sjøvann?", a: ["Så blodet renner ut og fisken ikke ligger i blodvann", "For å holde den levende", "For å gjøre den tyngre", "For å kjøle maskinrommet"], r: 0, f: "Rent, rennende sjøvann gir god utblødning." },
      { q: "Hva skjer med blod som blir igjen i fisken?", a: ["Det gir misfarget filet som ikke kan vaskes bort", "Det forsvinner når fisken fryses", "Det gjør fisken mer holdbar", "Det renner ut i mottaket"], r: 0, f: "Blodrester gir mørke flekker og lavere pris." },
      { q: "Hva er RSW?", a: ["Sjøvann kjølt med kjøleanlegg", "Rå saltfisk", "Is laget av ferskvann", "En type bløggekniv"], r: 0, f: "RSW – refrigerated sea water. CSW er sjøvann kjølt med is." },
      { q: "Hvorfor skal ikke kassene fylles over kanten?", a: ["Fisken i kassa under blir klemt", "Det tar lengre tid å levere", "Isen smelter raskere", "Kassene blir tyngre"], r: 0, f: "Klemskader gir bløt fisk og blåmerker." },
      { q: "Hva er blodranda?", a: ["Nyra langs ryggraden som skal fjernes", "Kuttet ved strupen", "En rød flekk på skinnet", "Sidelinja"], r: 0, f: "Blodranda ligger langs ryggraden og fjernes ved sløying." }
    ] },
    { t: "oppdrag", tittel: "Bløgging, sløying og temperaturlogg", sted: "Om bord", tid: "4 t", html: "På en fisketur skal dere behandle fangsten etter trinnene i fangstlinja og føre temperaturlogg.", sjekk: [
      "Bløgg fisken straks den er om bord, og noter tiden",
      "La fisken blø ut i rennende sjøvann etter rutinen",
      "Sløy, fjern blodranda og vask",
      "Is eller legg i RSW, og mål temperaturen i fisken etter 1 og 3 timer",
      "Vurder resultatet: farge på filet og blodrester"
    ], lever: "Temperaturlogg og bilder" }
  ],
  kanjeg: [
    "Jeg kan bløgge riktig og forklare hvorfor det må skje raskt.",
    "Jeg kan sløye, fjerne blodranda og vaske fisken.",
    "Jeg kan velge riktig kjølemetode og følge med på temperaturen.",
    "Jeg kan bruke fangstbehandlingsutstyret om bord.",
    "Jeg kan vurdere hvordan behandlingen påvirker kvaliteten på råstoffet."
  ],
  kilder: ["kvalitet", "mattilsynet", "rafisk"]
});

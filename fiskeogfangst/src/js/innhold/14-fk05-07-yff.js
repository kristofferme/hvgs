/* Fangst og kvalitet: FK·05–07, og yrkesfaglig fordypning */

FF.moduler.push({
  id: "fk-05", fag: "fk", nr: "05", timer: 20,
  tittel: "Tilvirking og råstoffutnyttelse",
  under: "Fra rund fisk til filet, frossen vare og tørrfisk – og hvordan hode, lever, rogn og skinn blir verdier i stedet for avfall.",
  maal: ["FK4"], kjerne: ["Fangst, kvalitet og marked"],
  kort: [
    "Tilvirkingsformen avgjør hvilket marked fisken kan selges i – og prisen.",
    "Bare rundt 40 prosent av en torsk er filet. Resten er restråstoff med verdi.",
    "Rask og skånsom tilvirking gir høyere utbytte og bedre kvalitet."
  ],
  blokker: [
    { t: "ingress", html: "Om bord bestemmer dere hvilken form fisken skal leveres i: rund, sløyd med hode, hodekappet eller fryst. På større fartøy fileteres og pakkes fisken ferdig for butikken. Valget påvirker prisen, holdbarheten – og hvor mye av fisken som blir brukt." },

    { t: "h2", tekst: "Tilvirkingsformer" },
    { t: "tabell", hode: ["Form", "Hva det er", "Typisk bruk"], rader: [
      ["Rund", "Hel fisk, ikke sløyd", "Pelagisk fisk (sild, makrell) i RSW"],
      ["Sløyd med hode", "Innvoller fjernet, hodet på", "Fersk torsk og hyse fra kystflåten"],
      ["Sløyd uten hode", "Hodekappet og sløyd", "Fryst om bord, råstoff til saltfisk og klippfisk"],
      ["Filet", "Kjøttet skåret fra beina", "Fabrikktrålere, fryst eller fersk"],
      ["Tørrfisk", "Sløyd og hengt til tørk på hjell", "Skrei fra Lofoten og Finnmark, eksport til Italia"],
      ["Saltfisk og klippfisk", "Saltet, og for klippfisk tørket", "Tilvirkes på land, eksport til Portugal, Spania og Brasil"],
      ["Kokt reke og krabbe", "Kokt og fryst om bord", "Reketrålere og snøkrabbefartøy"]
    ] },

    { t: "h2", tekst: "Råstoffutnyttelse" },
    { t: "fig", fig: "utnyttelse", cap: "Omtrentlig fordeling av en torsk. Filetutbyttet avhenger av størrelse, sesong og hvordan fisken skjæres." },
    { t: "ul", items: [
      "<strong>Lever</strong> blir tran og hermetikk.",
      "<strong>Rogn</strong> selges som ferskvare eller blir kaviar.",
      "<strong>Hoder</strong> tørkes og eksporteres, blant annet til Nigeria. Torsketunger er en lokal delikatesse.",
      "<strong>Rygg, bein og skinn</strong> blir fiskemel, olje, kollagen og ingredienser.",
      "<strong>Ensilasje:</strong> Restråstoff som ikke kan fryses, kan males og syrnes om bord og selges som fôrråstoff."
    ] },
    { t: "regn", tittel: "Utbytte og verdi", oppg: [
      { q: "En torsk veier 5,0 kg rund. Filetutbyttet er 42 %. Hvor mye filet får du?", svar: 2.1, enhet: "kg", des: 1, tol: 0.02, forkl: "5,0 × 0,42 = 2,1 kg." },
      { q: "Dere leverer 800 kg sløyd torsk med hode til 38 kr/kg. Hva er fangstverdien?", svar: 30400, enhet: "kr", des: 0, tol: 1, forkl: "800 × 38 = 30 400 kr." },
      { q: "Leveren er 6 % av rund vekt. Hvor mange kilo lever gir 1200 kg rund torsk?", svar: 72, enhet: "kg", des: 0, tol: 0.5, forkl: "1200 × 0,06 = 72 kg." }
    ] },

    { t: "h2", tekst: "Frysing om bord" },
    { t: "p", html: "Frysing stopper forråtnelsen, men bare hvis den skjer raskt. Langsom frysing gir store iskrystaller som ødelegger cellene, og fisken blir vassen når den tines. Fisken fryses i platefryser eller blokkfryser, og lagres ved minst −18 °C – gjerne lavere. Frossen fisk blir ofte glasert med et tynt islag som beskytter mot uttørking." },

    { t: "quiz", tittel: "Tilvirking", sp: [
      { q: "Hvor stor del av en torsk er omtrent filet?", a: ["Rundt 40 %", "Rundt 80 %", "Rundt 15 %", "Hele fisken"], r: 0, f: "Resten – hode, innmat, bein og skinn – er restråstoff med verdi." },
      { q: "Hva er tørrfisk?", a: ["Sløyd fisk hengt til tørk på hjell", "Saltet og tørket fisk", "Frossen filet", "Røkt fisk"], r: 0, f: "Klippfisk er saltet og tørket. Tørrfisk er bare tørket, uten salt." },
      { q: "Hvorfor må frysingen skje raskt?", a: ["Langsom frysing gir store iskrystaller som skader fisken", "For å spare strøm", "For at fisken skal veie mer", "Det spiller ingen rolle"], r: 0, f: "Små krystaller gir bedre kvalitet når fisken tines." },
      { q: "Hva er ensilasje?", a: ["Restråstoff som males og syrnes", "Is laget av sjøvann", "En type fryser", "Saltfisk"], r: 0, f: "Ensilasje blir fôrråstoff og kan lages om bord." }
    ] }
  ],
  kanjeg: [
    "Jeg kan forklare de vanligste tilvirkingsformene og hvilke markeder de går til.",
    "Jeg kan regne ut utbytte og verdi.",
    "Jeg kan forklare hvordan restråstoffet kan utnyttes.",
    "Jeg kan vurdere hvordan tilvirkingen påvirker kvaliteten."
  ],
  kilder: ["rafisk", "kvalitet"]
});

FF.moduler.push({
  id: "fk-06", fag: "fk", nr: "06", timer: 20,
  tittel: "Kvalitet og hygiene",
  under: "Hva kvalitet er, hvordan du vurderer fisken med sansene, de vanligste kvalitetsfeilene, og hvordan et kvalitetssystem virker om bord.",
  maal: ["FK5"], kjerne: ["Fangst, kvalitet og marked"],
  kort: [
    "Fersk fisk har klare øyne, røde gjeller og lukter sjø.",
    "De fleste kvalitetsfeil skyldes behandlingen: stikk, klem, blod og varme.",
    "Et kvalitetssystem er rutiner, kontroll og dokumentasjon – hver tur."
  ],
  blokker: [
    { t: "ingress", html: "Kjøperen ser på fisken i noen sekunder og bestemmer prisen. Salgslagene kontrollerer kvaliteten, og dårlig kvalitet kan gi pristrekk. God kvalitet er ikke flaks – det er rutiner." },

    { t: "h2", tekst: "Vurder fisken med sansene" },
    { t: "tabell", hode: ["Kjennetegn", "Fersk", "Ikke fersk"], rader: [
      ["Øyne", "Klare og buede", "Matte, grå og innsunkne"],
      ["Gjeller", "Klare, røde", "Brune eller grå, slimete"],
      ["Lukt", "Frisk, av sjø og tang", "Sur, stram eller av ammoniakk"],
      ["Kjøtt", "Fast og elastisk – tilbake når du trykker", "Bløtt, merke blir stående"],
      ["Skinn og slim", "Blankt, klart slim", "Matt, gult eller grumsete slim"],
      ["Buk", "Hel og ren", "Bukbrann: innvollene har spist hull i buklappen"]
    ] },

    { t: "h2", tekst: "Vanlige kvalitetsfeil" },
    { t: "fig", fig: "kvalitetsfeil", cap: "Kvalitetsfeil på en torskefilet og hva de kommer av." },
    { t: "tabell", hode: ["Feil", "Årsak", "Forebygging"], rader: [
      ["Blodflekker, stikkskader", "Pigg eller krok i kjøttet", "Grip i hodet, ikke i kjøttet. Bruk pigg bare i hodet."],
      ["Rosa eller rødlig filet", "Dårlig utblødning", "Bløgg raskt og la fisken blø ut i rennende sjøvann"],
      ["Klemskader", "For mye fisk i garn, kar eller kasser", "Hal ofte, ikke overfyll"],
      ["Spalting (gaping)", "Varme, stiv fisk som bøyes, røff behandling", "Kjøl raskt, håndter fisken forsiktig"],
      ["Kveis", "Parasitter fra naturen", "Sløy raskt – kveisen vandrer fra innvollene inn i buklappen etter døden"],
      ["Garnmerker", "Fisk som har stått lenge i garnet", "Kortere ståtid"]
    ] },

    { t: "h2", tekst: "Kvalitetssikring om bord" },
    { t: "p", html: "Et kvalitetssystem bygger på den samme tanken som sikkerhetsstyringen: <strong>Finn ut hva som kan gå galt, kontroller det, og skriv ned at det er gjort.</strong> I matproduksjon kalles metoden HACCP – fareanalyse og kritiske styringspunkter. Om bord er temperatur og tid de viktigste styringspunktene." },
    { t: "steg", items: [
      ["Rutiner", "Skriftlig rutine for bløgging, utblødning, sløying, kjøling og renhold."],
      ["Kontroll", "Mål temperatur i fisk og rom. Sjekk at kar, kasser og RSW er rene."],
      ["Dokumentasjon", "Før logg over temperatur, rengjøring og avvik."],
      ["Avvik", "Når noe går galt: skriv det ned, rett opp, og endre rutinen så det ikke skjer igjen."],
      ["Sporbarhet", "Merk kassene så kjøperen vet fartøy, fangstdato og art."]
    ] },
    { t: "h2", tekst: "Hygiene" },
    { t: "ul", items: [
      "Rengjør og desinfiser kar, kasser, benker og lasterom etter hver tur.",
      "Bruk rent sjøvann – ikke vann fra havna eller nær avløp.",
      "Hold dyr og skadedyr unna fangsten.",
      "Vask hender, og bruk rene klær og hansker. Den som er syk med oppkast eller diaré, skal ikke håndtere fisk.",
      "Oppbevar kjemikalier og drivstoff atskilt fra fangst og emballasje."
    ] },

    { t: "quiz", tittel: "Kvalitet", sp: [
      { q: "Hvordan ser gjellene ut på fersk fisk?", a: ["Klare og røde", "Brune", "Grå og slimete", "Hvite"], r: 0, f: "Røde, klare gjeller er tegn på fersk fisk." },
      { q: "Hva gir stikkskader og blodflekker?", a: ["Pigg eller krok i kjøttet", "For kaldt vann", "For mye is", "Kveis"], r: 0, f: "Bruk pigg bare i hodet, og grip fisken i hodet." },
      { q: "Hvorfor skal fisken sløyes raskt med tanke på kveis?", a: ["Kveisen vandrer fra innvollene inn i kjøttet etter døden", "Kveisen dør av luft", "Kveisen blir større i kulde", "Det har ingen betydning"], r: 0, f: "Rask sløying gir færre kveis i buklappen." },
      { q: "Hva er de viktigste styringspunktene for kvalitet om bord?", a: ["Temperatur og tid", "Farge på kassene", "Antall mannskap", "Motorturtall"], r: 0, f: "Rask nedkjøling og kort tid fra fangst til kjøling er det viktigste." },
      { q: "Hva betyr sporbarhet?", a: ["At man kan følge fisken tilbake til fartøy og fangstdato", "At fisken kan spores med GPS", "At kassene har samme farge", "At fisken er fanget med sporbar redskap"], r: 0, f: "Merking og dokumentasjon gjør at kjøperen vet hvor fisken kommer fra." }
    ] },
    { t: "oppdrag", tittel: "Kvalitetskontroll av egen fangst", sted: "Om bord / kai", tid: "2 t", html: "Vurder ti fisk fra egen fangst med skjemaet. Finn årsaken til feilene dere ser.", sjekk: [
      "Vurder øyne, gjeller, lukt, kjøtt, skinn og buk på ti fisk",
      "Filetér to fisk og se etter blod, klem og kveis",
      "Skriv hvilke feil dere fant og hva som var årsaken",
      "Foreslå én endring i rutinen om bord"
    ] }
  ],
  kanjeg: [
    "Jeg kan vurdere ferskheten til fisk med sansene.",
    "Jeg kan kjenne igjen vanlige kvalitetsfeil og forklare årsaken.",
    "Jeg kan følge rutinene i et kvalitetssystem og dokumentere.",
    "Jeg kan holde god hygiene om bord."
  ],
  kilder: ["kvalitet", "mattilsynet", "rafisk"]
});

FF.moduler.push({
  id: "fk-07", fag: "fk", nr: "07", timer: 10,
  tittel: "Økonomi, lott og marked",
  under: "Hva fangsten er verdt, hva turen koster, hvordan lotten deles – og hvor fisken ender opp i verden.",
  maal: ["FK6", "FK7"], kjerne: ["Fangst, kvalitet og marked"],
  verktoy: ["lott"],
  kort: [
    "Fangstverdi minus felleskostnader gir nettoverdien som deles.",
    "Nettoverdien deles i båtlott og mannskapslott etter hyreavtalen.",
    "Salgslagene har enerett på førstehåndssalg og fastsetter minstepriser."
  ],
  blokker: [
    { t: "ingress", html: "De fleste fiskere får betalt i lott – en andel av fangsten – og ikke fast lønn. Et godt år gir god lønn, et dårlig år gir dårlig. Derfor må du forstå regnestykket." },

    { t: "h2", tekst: "Inntekter og kostnader" },
    { t: "p", html: "<strong>Fangstinntekten</strong> er vekt ganget med pris. Prisen avhenger av art, størrelse, kvalitet, tilvirking og sesong. Kostnadene deles i to:" },
    { t: "tabell", hode: ["Type", "Eksempler", "Hvem betaler"], rader: [
      ["Felleskostnader", "Drivstoff, agn, is, emballasje, avgifter ved salg", "Trekkes fra før deling"],
      ["Båtens kostnader", "Forsikring, vedlikehold, avskrivning, renter, kvotekjøp", "Dekkes av båtlotten"],
      ["Mannskapets kostnader", "Arbeidstøy, reise", "Den enkelte, ofte med skattefradrag"]
    ] },

    { t: "h2", tekst: "Lottsystemet" },
    { t: "fig", fig: "lott", cap: "Lottoppgjøret med eksempeltall. Fordelingen står i hyreavtalen og tariffavtalen for fartøyet." },
    { t: "steg", items: [
      ["Fangstverdi", "Summen av alle sluttsedlene for perioden."],
      ["Trekk felleskostnader", "Drivstoff, agn, is og andre felleskostnader."],
      ["Del nettoverdien", "En avtalt prosent går til båten (båtlott), resten til mannskapet (mannskapslott)."],
      ["Del mannskapslotten", "Mannskapslotten deles på antall lotter. Skipperen kan ha mer enn én lott."],
      ["Lottoppgjør", "Oppgjøret gjøres jevnlig, og du får en oppgjørsliste som viser hvordan lotten er regnet ut."]
    ] },
    { t: "verktoy", navn: "lott" },
    { t: "regn", tittel: "Regn ut lotten", oppg: [
      { q: "Fangstverdien er 480 000 kr og felleskostnadene 96 000 kr. Hva er nettoverdien?", svar: 384000, enhet: "kr", des: 0, tol: 1, forkl: "480 000 − 96 000 = 384 000 kr." },
      { q: "Mannskapet får 50 % av nettoverdien. Hvor stor er mannskapslotten?", svar: 192000, enhet: "kr", des: 0, tol: 1, forkl: "384 000 × 0,5 = 192 000 kr." },
      { q: "Mannskapslotten deles på 4 lotter. Hvor mye er én lott?", svar: 48000, enhet: "kr", des: 0, tol: 1, forkl: "192 000 ÷ 4 = 48 000 kr." }
    ] },

    { t: "h2", tekst: "Salgslag og marked" },
    { t: "p", html: "All villfanget fisk i Norge omsettes første gang gjennom et <strong>salgslag</strong>. Salgslagene fastsetter minstepriser, sørger for at fiskeren får betalt, og kontrollerer at det som landes stemmer med kvotene. Norges Sildesalgslag omsetter pelagisk fisk for hele landet. Bunnfisk omsettes av regionale salgslag – langs Mørekysten blant annet Sunnmøre og Romsdal Fiskesalslag og Norges Råfisklag. Sjekk hvilket lag som gjelder der dere lander." },
    { t: "tabell", hode: ["Produkt", "Viktige markeder"], rader: [
      ["Fersk torsk og hyse", "EU og Storbritannia"],
      ["Fryst hodekappet torsk", "Kina, som bearbeider og selger videre"],
      ["Klippfisk", "Portugal, Brasil, Spania"],
      ["Tørrfisk", "Italia og Nigeria (hoder)"],
      ["Sild og makrell", "Europa, Asia og Afrika"],
      ["Kongekrabbe og snøkrabbe", "Asia, USA og Europa"]
    ] },
    { t: "p", html: "Norge eksporterer sjømat til rundt 150 land. Sjømatrådet markedsfører norsk sjømat i utlandet. Valutakurser, konkurranse fra andre land og krav fra kjøperne om bærekraft og sporbarhet påvirker prisen du får på kaia." },

    { t: "quiz", tittel: "Økonomi og marked", sp: [
      { q: "Hva er nettoverdien i lottsystemet?", a: ["Fangstverdien minus felleskostnadene", "Fangstverdien pluss drivstoff", "Båtlotten", "Det mannskapet får utbetalt"], r: 0, f: "Nettoverdien er det som deles mellom båt og mannskap." },
      { q: "Hvem fastsetter minstepriser på fisk ved førstehåndssalg?", a: ["Salgslagene", "Fiskeridirektoratet", "Mattilsynet", "Den enkelte fisker"], r: 0, f: "Salgslagene har enerett på førstehåndsomsetning og fastsetter minstepriser." },
      { q: "Hva dekker båtlotten?", a: ["Båtens egne kostnader og rederiets inntekt", "Mannskapets lønn", "Drivstoff og agn", "Skatt"], r: 0, f: "Båtlotten skal dekke forsikring, vedlikehold, renter og avskrivning." },
      { q: "Hvor står fordelingen mellom båtlott og mannskapslott?", a: ["I hyreavtalen og tariffavtalen", "I høstingsforskriften", "I sjøveisreglene", "Den bestemmes etter hver tur"], r: 0, f: "Avtalen skal være klar før du går om bord." },
      { q: "Hvilket land er et viktig marked for klippfisk?", a: ["Portugal", "Japan", "Tyskland", "Canada"], r: 0, f: "Portugal og Brasil er de store klippfiskmarkedene." }
    ] }
  ],
  kanjeg: [
    "Jeg kan regne ut fangstverdi, nettoverdi og lott.",
    "Jeg kan forklare hva båtlott og mannskapslott dekker.",
    "Jeg kan forklare salgslagenes rolle og minstepris.",
    "Jeg kan nevne viktige markeder for norsk fisk."
  ],
  kilder: ["snlLott", "rafisk", "fdir"]
});

FF.moduler.push({
  id: "yf-01", fag: "yff", nr: "01", timer: 253,
  tittel: "Praksis og veien videre",
  under: "Ut på fartøy og i bedrift. Hvordan du får mest ut av praksisen, fører logg, og hvilke veier som ligger åpne etter Vg2.",
  maal: [], kjerne: ["Sikkerhet om bord", "Fartøy og fiskeredskaper", "Fangst, kvalitet og marked"],
  verktoy: ["praksislogg"],
  kort: [
    "Yrkesfaglig fordypning er tid ute i yrket – på fartøy, i mottak og i bedrift.",
    "Før logg hver dag du er ute. Det er grunnlaget for vurderingen og for læreplassen.",
    "Etter Vg2: to år som lærling, så fagbrev som fisker."
  ],
  blokker: [
    { t: "ingress", html: "I yrkesfaglig fordypning skal du prøve deg i yrket. Du kan være med på fiske, i et fiskemottak, på et verksted eller i en annen bedrift knyttet til fiskeriene. Det er her du viser at du vil bli fisker – og her mange elever får læreplass." },

    { t: "h2", tekst: "Før du går om bord" },
    { t: "steg", items: [
      ["Avtal med bedriften", "Når, hvor lenge, og hvem er kontaktpersonen din?"],
      ["Sikkerhetskurs og helse", "Sjekk hva som kreves på fartøyet. Ta med flytevest og riktig tøy."],
      ["Mål for praksisen", "Velg to eller tre kompetansemål du vil jobbe med, og snakk med skipperen om dem."],
      ["Sikkerhetsgjennomgang", "Be om den første dag. Se modulen «Livet om bord»."]
    ] },
    { t: "notat", type: "praksis", tittel: "Slik blir du husket", html: "<ul><li>Møt presis, og si fra i god tid hvis du blir forhindret.</li><li>Spør når du er usikker. Det er tryggere enn å gjette.</li><li>Ta initiativ: Se hva som må gjøres, og gjør det.</li><li>Hold på reglene – også de ingen ser.</li><li>Takk for deg når praksisen er ferdig.</li></ul>" },

    { t: "h2", tekst: "Praksisloggen" },
    { t: "p", html: "Skriv kort hver dag: Hva gjorde du, hva lærte du, og hva var vanskelig? Loggen lagres bare på denne enheten. Kopier den inn i Teams eller OneNote når uka er ferdig." },
    { t: "verktoy", navn: "praksislogg" },

    { t: "h2", tekst: "Veien videre" },
    { t: "fig", fig: "veivalg", cap: "Det vanlige løpet er to år på skole og to år som lærling om bord. Fagbrev som fisker gir mange veier videre." },
    { t: "tabell", tittel: "Fiskeskippersertifikat klasse C", hode: ["Krav", "Hva det betyr"], rader: [
      ["Alder", "Minst 18 år"],
      ["Fartstid", "12 måneder på dekk på fiskefartøy med største lengde 10,67 meter eller mer"],
      ["Helse", "Legeerklæring om syn, fargesans og hørsel"],
      ["Kurs", "Gyldig VHF-sertifikat (SRC) og gyldig sikkerhetsopplæring for fiskere"],
      ["Eksamen", "Bestått eksamen for klasse C"],
      ["Gyldighet", "Fem år. For å fornye må du ha 12 måneders fartstid i løpet av de siste fem årene"]
    ] },
    { t: "p", html: "Med klasse C kan du føre fiskefartøy under 15 meter. For større fartøy trenger du klasse B, AB eller A, som tas gjennom fagskole og mer fartstid. Det finnes også egne ordninger for unge fiskere, for eksempel ungdomsfiskeordningen og rekrutteringskvoter. Sjekk vilkårene hos Fiskeridirektoratet." },
    { t: "tenk", etikett: "Refleksjon", html: "Hvor ser du deg selv om fem år? Skriv tre ting du må få til for å komme dit, og hvem som kan hjelpe deg." },
    { t: "oppdrag", tittel: "Søk læreplass", sted: "Klasserom", tid: "3 t", html: "Lag en søknad og en kort CV som du kan sende til rederier og fartøy i distriktet.", sjekk: [
      "Lag en liste over fem rederier eller fartøy du vil søke hos",
      "Skriv en søknad på under én side: hvem du er, hva du kan, hvorfor du vil bli fisker",
      "Legg ved praksislogg eller bilder som viser det du har gjort",
      "Øv på en telefonsamtale med læreren som skipper",
      "Send søknaden og noter hvem du har kontaktet og når"
    ] }
  ],
  kanjeg: [
    "Jeg kan forberede meg til praksis og vet hva jeg skal ta med.",
    "Jeg fører praksislogg og kan fortelle hva jeg har lært.",
    "Jeg kjenner veien fra Vg2 til fagbrev og fiskeskippersertifikat.",
    "Jeg har laget en søknad om læreplass."
  ],
  kilder: ["sdirKlC", "sdirKurs", "vilbli", "fdir"]
});

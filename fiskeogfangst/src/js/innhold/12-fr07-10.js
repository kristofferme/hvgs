/* Fartøy og redskaper: FR·07–10 */

FF.moduler.push({
  id: "fr-07", fag: "fr", nr: "07", timer: 25,
  tittel: "Vær, strøm og fiskeleting",
  under: "Hvordan vind, sjø, tidevann og strøm påvirker driften – og hvordan du finner fisken med ekkolodd, sonar og kunnskap om fiskens atferd.",
  maal: ["FR1"], kjerne: ["Fartøy og fiskeredskaper", "Marine ressurser"],
  kort: [
    "Vind mot strøm gir krapp og farlig sjø.",
    "Fisken følger temperatur, lys, mat og gyting. Skjønner du det, vet du hvor du skal lete.",
    "Et ekkolodd viser både bunnen og fisken – hvis du kan lese det."
  ],
  blokker: [
    { t: "ingress", html: "En dyktig skipper ser ikke bare på værmeldingen, men også på vinden og sjøen, vet når strømmen snur, og kjenner fiskens vaner på feltene sine. Det avgjør hvor dere setter, når dere haler – og om dere går ut i det hele tatt." },

    { t: "h2", tekst: "Vind og sjø" },
    { t: "p", html: "Vindstyrken oppgis i meter per sekund (m/s) eller som navn på Beaufort-skalaen. Varselet for kysten og havet finner du hos Meteorologisk institutt, og bølgevarsel blant annet hos BarentsWatch." },
    { t: "tabell", tittel: "Beaufort-skalaen", tall: [0, 2], hode: ["Styrke", "Navn", "m/s", "På sjøen"], rader: [
      ["0", "Stille", "0–0,2", "Speilblank sjø"],
      ["1", "Flau vind", "0,3–1,5", "Krusninger"],
      ["2", "Svak vind", "1,6–3,3", "Små bølger"],
      ["3", "Lett bris", "3,4–5,4", "Enkelte skumtopper"],
      ["4", "Laber bris", "5,5–7,9", "Mange skumtopper"],
      ["5", "Frisk bris", "8,0–10,7", "Moderate bølger, skumtopper over alt"],
      ["6", "Liten kuling", "10,8–13,8", "Store bølger, sjøsprøyt"],
      ["7", "Stiv kuling", "13,9–17,1", "Sjøen hoper seg opp, skum i striper"],
      ["8", "Sterk kuling", "17,2–20,7", "Høye bølger, toppene brekker"],
      ["9", "Liten storm", "20,8–24,4", "Svært høye bølger, dårlig sikt i sjøsprøyt"],
      ["10", "Full storm", "24,5–28,4", "Hvit sjø, sjøen ruller tungt"],
      ["11", "Sterk storm", "28,5–32,6", "Ekstremt høye bølger"],
      ["12", "Orkan", "32,7 og mer", "Lufta full av skum og sjøsprøyt"]
    ] },
    { t: "ul", items: [
      "<strong>Vindsjø</strong> er bølger laget av vinden der du er. <strong>Dønning</strong> er bølger som har reist fra et uvær langt borte.",
      "<strong>Vind mot strøm:</strong> Når vinden blåser motsatt av strømmen, blir bølgene kortere og brattere. Det er typisk i sund og over grunner.",
      "<strong>Grunner:</strong> Bølgene reiser seg og kan bryte over grunt vann, selv når det ser rolig ut ellers.",
      "<strong>Ising:</strong> Kulde, vind og sjøsprøyt sammen gir ising. Se modulen om stabilitet."
    ] },

    { t: "h2", tekst: "Tidevann og strøm" },
    { t: "p", html: "Månen og sola trekker i havet. Langs norskekysten får vi to flo og to fjære i døgnet, og høyvannet kommer rundt 50 minutter senere hver dag. Ved nymåne og fullmåne er forskjellen størst (<strong>springflo</strong>), ved halvmåne minst (<strong>nippflo</strong>)." },
    { t: "fig", fig: "tidevann", cap: "Tidevannet over et døgn. Tidevannstabeller for norske havner finner du hos Kartverket." },
    { t: "p", html: "Tidevannet lager <strong>strøm</strong>, særlig i sund og fjordmunninger. I tillegg går kyststrømmen nordover langs kysten. Strømmen påvirker hvor redskapene driver, hvordan garn og line står i sjøen, og hvor fisken står – den står gjerne med hodet mot strømmen og venter på mat." },

    { t: "h2", tekst: "Fiskens atferd" },
    { t: "tabell", hode: ["Faktor", "Hva fisken gjør", "Hva det betyr for deg"], rader: [
      ["Temperatur", "Hver art har temperaturer den trives i", "Sjekk temperaturen på feltet – den forklarer ofte hvorfor fisken er borte"],
      ["Lys", "Sild og plankton går opp om natta og ned om dagen", "Stim kan stå grunt om natta og dypt om dagen"],
      ["Mat", "Torsken følger lodda og silda", "Finner du maten, finner du fisken"],
      ["Gyting", "Skreien vandrer fra Barentshavet til gyteplassene langs kysten", "Gir de store sesongfiskeriene"],
      ["Bunn", "Mange arter står ved kanter, skråninger og hard bunn", "Studer dybdekurvene og ekkoloddet"],
      ["Strøm og tid", "Fisken biter ofte best ved strømskifte og i skumring", "Planlegg setting og haling etter det"]
    ] },

    { t: "h2", tekst: "Ekkolodd og sonar" },
    { t: "p", html: "Ekkoloddet sender en lydpuls rett ned og måler hvor lang tid ekkoet bruker tilbake. Sterke ekko vises i rødt og brunt, svake i grønt og blått. Bildet ruller fra høyre mot venstre: Det nyeste er alltid til høyre." },
    { t: "fig", fig: "ekkolodd", flate: "natt", cap: "Ekkolodd over hard bunn på rundt 90 meter. Stim midt i vannet, enkeltfisk som buer nær bunnen, og dobbeltekko fra den harde bunnen." },
    { t: "ul", items: [
      "<strong>Buer:</strong> En enkeltfisk tegnes som en bue fordi avstanden er kortest når båten er rett over.",
      "<strong>Hard bunn</strong> gir sterkt, tynt bunnekko og ofte dobbeltekko. <strong>Bløt bunn</strong> gir svakere og bredere ekko.",
      "<strong>Lav frekvens</strong> (for eksempel 50 kHz) når dypt og dekker bredt. <strong>Høy frekvens</strong> (200 kHz) gir skarpere bilde på grunt vann.",
      "<strong>Sonar</strong> sender lyden til siden og ser stimer rundt båten. Den er viktig i notfisket."
    ] },

    { t: "h2", tekst: "Planlegg turen" },
    { t: "steg", items: [
      ["Kvote og marked", "Hva har dere igjen av kvote, og hva betaler mottaket i dag?"],
      ["Vær og sjø", "Holder været hele turen – også for haling og tur hjem?"],
      ["Felt og tidevann", "Hvor har det vært fisk? Når snur strømmen på feltet?"],
      ["Redskap og agn", "Er redskapen klar, og har dere agn, is og drivstoff?"],
      ["Mottak", "Hvor leverer dere, og når stenger mottaket?"]
    ] },

    { t: "quiz", tittel: "Vær, strøm og fiskeleting", sp: [
      { q: "Hva skjer når vinden blåser mot strømmen?", a: ["Sjøen blir krapp og bratt", "Sjøen blir roligere", "Strømmen stopper", "Ingenting"], r: 0, f: "Vind mot strøm gir kortere og brattere bølger." },
      { q: "Hvor mange m/s er stiv kuling?", a: ["13,9–17,1", "8,0–10,7", "20,8–24,4", "5,5–7,9"], r: 0, f: "Stiv kuling er styrke 7 på Beaufort-skalaen." },
      { q: "Hvorfor tegnes en enkeltfisk som en bue på ekkoloddet?", a: ["Avstanden til fisken er kortest når båten er rett over", "Fisken svømmer i en bue", "Ekkoloddet er feilinnstilt", "Det er to fisker"], r: 0, f: "Når båten nærmer seg og fjerner seg, er fisken lenger unna. Rett over er den nærmest." },
      { q: "Hva er springflo?", a: ["Stor forskjell mellom flo og fjære ved nymåne og fullmåne", "Tidevann om våren", "Flo som kommer uventet", "Liten forskjell ved halvmåne"], r: 0, f: "Ved nymåne og fullmåne drar sola og månen i samme retning." },
      { q: "Hvor står sild og plankton ofte om natta?", a: ["Høyere opp i vannet", "Helt nede ved bunnen", "Inne i fjæra", "De forsvinner"], r: 0, f: "Mange arter går opp om natta og ned om dagen – døgnvandring." },
      { q: "Hvilken frekvens når dypest med ekkoloddet?", a: ["Lav, for eksempel 50 kHz", "Høy, for eksempel 200 kHz", "Frekvensen spiller ingen rolle", "Den høyeste som finnes"], r: 0, f: "Lav frekvens når dypere og dekker bredere. Høy frekvens gir skarpere bilde på grunt vann." }
    ] },
    { t: "oppdrag", tittel: "Værlogg og ekkoloddtolking", sted: "Om bord", tid: "2 t", html: "Før værlogg på en tur og tolk ekkoloddet sammen med skipperen.", sjekk: [
      "Noter varslet vind og sjø før avgang, og sammenlign med det dere får",
      "Finn tidspunktet for høy- og lavvann i nærmeste havn",
      "Tolk ekkoloddet: bunnhardhet, dybde og eventuelle fiskeekko",
      "Prøv to frekvenser og beskriv forskjellen",
      "Forklar hvorfor dere satte redskapen der dere gjorde"
    ] }
  ],
  kanjeg: [
    "Jeg kan bruke værvarsel, bølgevarsel og Beaufort-skalaen.",
    "Jeg kan forklare flo, fjære, springflo og nippflo.",
    "Jeg kan forklare hvordan temperatur, lys, mat og gyting styrer fisken.",
    "Jeg kan tolke et ekkoloddbilde.",
    "Jeg kan planlegge en fisketur ut fra vær, strøm, kvote og marked."
  ],
  kilder: ["hi", "laereplan"]
});

FF.moduler.push({
  id: "fr-08", fag: "fr", nr: "08", timer: 60,
  tittel: "Redskaper",
  under: "Garn, line, juksa, teine, snurrevad, trål og not: hvordan de er bygd, hvordan du setter og haler dem, og hvordan du holder dem i stand.",
  maal: ["FR10", "FR12", "FK1"], kjerne: ["Fartøy og fiskeredskaper"],
  kort: [
    "Passive redskaper står og venter på fisken. Aktive redskaper går etter den.",
    "Ved setting og haling: flytevest, kniv, og aldri i bukta.",
    "Hel redskap fisker bedre. Bøt, skift og spleis før skaden blir stor."
  ],
  blokker: [
    { t: "ingress", html: "Norske fiskere bruker mange ulike redskaper, og mange fartøy skifter redskap gjennom året. Å kunne redskapen – bygge den, sette den, hale den og reparere den – er kjernen i fiskeryrket." },

    { t: "h2", tekst: "Passive og aktive redskaper" },
    { t: "tabell", hode: ["", "Passive redskaper", "Aktive redskaper"], rader: [
      ["Hvordan", "Står i sjøen og venter på at fisken kommer", "Slepes eller settes rundt fisken"],
      ["Eksempler", "Garn, line, teine, juksa og snøre", "Snurrevad, trål, not"],
      ["Fordeler", "Lite drivstoff, god kvalitet (særlig line og juksa)", "Store mengder på kort tid"],
      ["Utfordringer", "Kan bli stående i dårlig vær, tapt redskap kan fiske videre", "Mer drivstoff, bunnpåvirkning (bunntrål), krever seleksjon"]
    ] },

    { t: "h2", tekst: "Garn" },
    { t: "fig", fig: "garn", cap: "Bunngarn i lenke. Flottørtelna holder garnet oppe, blytelna holder det nede." },
    { t: "p", html: "Fisken svømmer inn i garnet og setter seg fast med gjellelokkene i maskene. <strong>Maskevidden</strong> bestemmer hvor stor fisken blir – liten fisk går gjennom, stor fisk kommer ikke inn. Garn brukes særlig på torsk, sei og blåkveite, og settes ofte i lenker på mange garn." },
    { t: "steg", tittel: "Setting og haling av garn", items: [
      ["Klargjør", "Sjekk at garna er klare i kassene uten floker, og at bøyer, ankre og merking er i orden."],
      ["Sett", "Skipperen holder fart og kurs. Bøye og anker går først, så garna fra kassa. Hold hender og føtter unna garn som går ut."],
      ["Merk", "Bøyene skal ha flagg, reflektor og fartøyets merke etter regelverket."],
      ["Hal", "Bøyelina tas inn i haleren. Én styrer haleren, én plukker fisk og én legger garna ned igjen."],
      ["Ta ut fisken og bløgg", "Bløgg fisken straks den kommer om bord – ikke vent til hele lenka er halt."]
    ] },

    { t: "h2", tekst: "Line" },
    { t: "fig", fig: "line", cap: "Bunnline. Tauman med krok og agn sitter med jevne mellomrom på hovedlina." },
    { t: "p", html: "Line gir fisk av svært god kvalitet fordi den er levende når den kommer om bord. Små fartøy egner lina for hånd og setter den fra baljer. Autolinere har egnemaskin og kan sette titusenvis av kroker i døgnet. Line er det viktigste redskapet for hyse, lange og brosme." },
    { t: "notat", type: "praksis", tittel: "Sjøfugl og line", html: "<p>Sjøfugl kan ta agnet og bli dratt ned når lina settes. En <strong>skremmeline</strong> med vimpler over lina holder fuglene unna, og setting i mørket hjelper også.</p>" },

    { t: "h2", tekst: "Juksa og snøre" },
    { t: "fig", fig: "juksa", cap: "Juksamaskinen fisker selv: den finner bunnen, rykker og haler når det er fisk på." },
    { t: "p", html: "Juksa er et viktig redskap for sjarkflåten, særlig i torskefisket og seifisket. Fisken er levende og uskadd når den kommer om bord – perfekt for kvalitet og levendelagring." },

    { t: "h2", tekst: "Teine" },
    { t: "fig", fig: "teine", cap: "Teine for krabbe. Fluktåpning slipper ut småkrabbe. Råtnetråden ruster eller råtner bort, så en tapt teine slutter å fiske." },
    { t: "p", html: "Teiner brukes på krabbe, kongekrabbe, snøkrabbe, hummer, sjøkreps og enkelte fiskearter. Fangsten kommer levende opp og kan sorteres og slippes ut igjen." },

    { t: "h2", tekst: "Snurrevad" },
    { t: "fig", fig: "snurrevad", flate: "sjo", cap: "Snurrevad sett ovenfra. Tauene gjeter fisken sammen foran vadet mens de hales inn." },
    { t: "p", html: "Snurrevad er et av de vanligste redskapene i kystflåten mellom 11 og 15 meter. Fisken kommer levende om bord og kan holde god kvalitet. Vadet har en pose med kvadratmasker eller sorteringsrist som slipper ut småfisk." },

    { t: "h2", tekst: "Trål" },
    { t: "fig", fig: "tral", cap: "Bunntrål. Tråldørene sprer trålen ut, sveipene gjeter fisken inn, og sorteringsrista slipper småfisken ut før posen." },
    { t: "p", html: "<strong>Bunntrål</strong> slepes langs bunnen etter torsk, hyse, sei og reke. <strong>Flytetrål</strong> slepes oppe i vannet etter sild, makrell og kolmule. Trål er effektivt, men bruker mye drivstoff, og bunntrål kan skade sårbare bunnhabitater som koraller. Derfor er noen områder stengt for bunntrål." },

    { t: "h2", tekst: "Not" },
    { t: "fig", fig: "ringnot", cap: "Ringnot. Når snurpelina trekkes inn, lukkes bunnen av nota, og hele stimen er fanget." },
    { t: "p", html: "Ringnot brukes på sild, makrell, lodde og sei. Skipperen finner stimen med sonar og setter nota rundt den. Kystnot og landnot brukes nærmere land. Fisken kan holdes levende i nota og pumpes om bord." },

    { t: "h2", tekst: "Tauverk, knuter og vedlikehold" },
    { t: "fig", fig: "tauverk", cap: "Et tretslått tau er laget av tre kordeller. Hver kordell er spunnet av garn, og garnet av fibrer." },
    { t: "tabell", tittel: "Knuter du må kunne", hode: ["Knute", "Brukes til", "Slik husker du den"], rader: [
      ["Pålestikk", "Fast øye som ikke glir – fortøyning, livline", "«Kaninen kommer opp av hullet, rundt treet og ned i hullet igjen.»"],
      ["Dobbelt halvstikk", "Feste et tau til en pæl eller rekke", "To tørner over hverandre, enden under den siste."],
      ["Rundtørn med to halvstikk", "Feste tau med stor belastning, for eksempel fenderliner", "Tørnen tar trykket, halvstikkene holder."],
      ["Skjøtestikk", "Skjøte to tau av ulik tykkelse", "Tynn ende rundt den tykke løkka og under seg selv."],
      ["Åttetallsknute", "Stoppeknute i enden av et tau", "Tegn et åttetall med enden."]
    ] },
    { t: "ul", items: [
      "<strong>Bøting:</strong> Reparer hull i garn, not og trål med bøtenål og maskepinne i riktig maskevidde.",
      "<strong>Skifte:</strong> Bytt slitte flottører, blylines, krok og tauman før de svikter.",
      "<strong>Spleis:</strong> Et øyespleis er sterkere enn en knute. Lær øyespleis og kortspleis i tretslått tau.",
      "<strong>Tørk og lagre:</strong> Skyll redskapen i ferskvann når du kan, og lagre den tørt og mørkt. UV-lys og saltvann bryter ned fibrene."
    ] },
    { t: "notat", type: "regel", tittel: "Merking og tapt redskap", html: "<p>Faststående redskap skal merkes med bøyer etter reglene i høstingsforskriften. Mister du redskap, har du plikt til å lete etter det, og du skal melde fra om det du ikke finner. Det kan du gjøre i den elektroniske fangstdagboka eller til Kystvakten. Se modulen om miljø.</p>" },

    { t: "quiz", tittel: "Redskaper", sp: [
      { q: "Hvilket redskap er dette?", fig: "snurrevad", a: ["Snurrevad", "Ringnot", "Bunntrål", "Garn"], r: 0, f: "Tau i dråpeform rundt et område og et vad i enden: snurrevad." },
      { q: "Hva holder bunngarnet nede mot bunnen?", a: ["Blytelna", "Flottørtelna", "Bøyelina", "Maskene"], r: 0, f: "Blytelna i underkant, flottørtelna i overkant – slik står garnet som en vegg." },
      { q: "Hva gjør tråldørene?", a: ["Sprer trålen ut til sidene", "Stenger posen", "Holder fisken levende", "Viser hvor trålen er"], r: 0, f: "Dørene går ut til hver side og holder trålåpningen åpen." },
      { q: "Hvilket redskap gir fisk som kommer levende om bord?", a: ["Juksa og line", "Bunngarn som har stått lenge", "Alle redskaper gir levende fisk", "Ingen"], r: 0, f: "Juksa og line gir levende, uskadd fisk – det gir best kvalitet." },
      { q: "Hvorfor har teiner råtnetråd?", a: ["Så en tapt teine slutter å fiske", "For å holde på agnet", "For å gjøre teina tyngre", "For å merke eieren"], r: 0, f: "Råtnetråden brytes ned, og teina åpnes. Da blir det ikke «spøkelsesfiske»." },
      { q: "Hvilken knute gir et fast øye som ikke glir?", a: ["Pålestikk", "Dobbelt halvstikk", "Skjøtestikk", "Åttetallsknute"], r: 0, f: "Pålestikk er fiskerens viktigste knute." },
      { q: "Hvorfor lukker snurpelina bunnen av nota?", a: ["Så stimen ikke kan dykke ut under nota", "Så nota synker raskere", "For å lage plass til flere fisk", "For å holde nota flytende"], r: 0, f: "Når snurpelina trekkes inn gjennom ringene, lukkes nota som en pose." }
    ] },
    { t: "oppdrag", tittel: "Redskapsverksted", sted: "Verksted / kai", tid: "6 t", gruppe: "2 elever", html: "Gjør klar et garn og en linestubb, og vis at dere kan knutene og bøtingen.", sjekk: [
      "Knyt pålestikk, dobbelt halvstikk, rundtørn med to halvstikk, skjøtestikk og åttetallsknute – også med lukkede øyne",
      "Lag et øyespleis i tretslått tau",
      "Bøt et hull i garn med riktig maskevidde",
      "Egn en linestubb og legg den klar i balja",
      "Rigg bøye, bøyeline, anker og merking etter reglene"
    ], lever: "Vis læreren – bilde i Teams" }
  ],
  kanjeg: [
    "Jeg kan forklare forskjellen på passive og aktive redskaper.",
    "Jeg kan beskrive garn, line, juksa, teine, snurrevad, trål og not, og hvilke arter de brukes på.",
    "Jeg kan sette og hale garn og line trygt.",
    "Jeg kan knyte de viktigste knutene og lage et øyespleis.",
    "Jeg kan bøte garn og vedlikeholde redskap.",
    "Jeg kjenner reglene for merking og tapt redskap."
  ],
  kilder: ["redskapshefte", "hosting", "fdirTapt", "ndla"]
});

FF.moduler.push({
  id: "fr-09", fag: "fr", nr: "09", timer: 35,
  tittel: "Motor og vedlikehold",
  under: "Slik virker dieselmotoren, hva du sjekker hver dag, hvordan du starter og stopper – og hvordan en vedlikeholdsplan holder fartøyet i drift.",
  maal: ["FR10", "FR11"], kjerne: ["Fartøy og fiskeredskaper"],
  kort: [
    "Sjekk olje, kjølevann, drivstoff og reimer før du starter.",
    "Etter start: Kommer det vann ut med eksosen? Hvis ikke – stopp.",
    "Planlagt vedlikehold er billigere og tryggere enn å reparere etter havari."
  ],
  blokker: [
    { t: "ingress", html: "Hvis motoren stopper utenfor Hustadvika i pålandsvind, har du et alvorlig problem. Nesten alle motorstopp har en årsak som kunne vært oppdaget: vann i dieselen, tett sjøvannsfilter, en slitt impeller eller en reim som var sprukket." },

    { t: "h2", tekst: "Slik virker en firetakts dieselmotor" },
    { t: "fig", fig: "firetakt", cap: "De fire taktene. Stempelet går opp og ned to ganger, og veivakselen roterer to omdreininger, for hver arbeidstakt." },
    { t: "p", html: "En diesel har ikke tennplugg. Lufta blir så varm når den presses sammen, at dieselen tenner av seg selv når den sprøytes inn. Derfor er god kompresjon, ren luft og rent drivstoff alt motoren trenger." },

    { t: "h2", tekst: "Systemene rundt motoren" },
    { t: "fig", fig: "drivstoff", cap: "Drivstoffsystemet. Forfilteret med vannutskiller er det viktigste punktet du sjekker." },
    { t: "fig", fig: "kjoling", cap: "Kjølesystemet med sjøvannskrets og ferskvannskrets." },
    { t: "tabell", hode: ["System", "Hva det gjør", "Du sjekker"], rader: [
      ["Smøring", "Olje smører lagre og kjøler stempler", "Oljenivå, oljetrykk, lekkasjer, filterbytte etter timer"],
      ["Kjøling", "Fører bort varme", "Kjølevæske (kald motor), sjøvannsfilter, impeller, vann i eksosen"],
      ["Drivstoff", "Leverer ren diesel", "Vannutskiller, filtre, lekkasjer, luft i systemet"],
      ["Luft og eksos", "Frisk luft inn, eksos ut", "Luftfilter, turbo, eksosfarge"],
      ["Elektrisk", "Start, lys og instrumenter", "Batterier, poler, dynamo, hovedbryter"],
      ["Gir og propell", "Overfører kraften", "Giroljenivå, akselpakning, vibrasjoner"]
    ] },

    { t: "h2", tekst: "Daglig sjekk, start og stopp" },
    { t: "steg", tittel: "Før start", items: [
      ["Motorolje og girolje", "Nivå mellom merkene på peilepinnen."],
      ["Kjølevæske", "Sjekk nivået i ekspansjonstanken når motoren er kald. Åpne aldri lokket på varm motor."],
      ["Drivstoff", "Nok diesel til turen med margin. Tapp vann fra vannutskilleren."],
      ["Sjøvannsfilter og bunnventil", "Filteret rent, bunnventilen åpen."],
      ["Reimer og slanger", "Stramme reimer uten sprekker. Ingen lekkasjer eller skavanker."],
      ["Lensebrønn og ventilasjon", "Tørr lensebrønn, vifter i gang."]
    ] },
    { t: "steg", tittel: "Start og drift", items: [
      ["Start", "Girspak i fri. Start motoren og sjekk at alarmer slukker."],
      ["Vann ut med eksosen", "Kommer det ikke vann, stopp motoren og finn feilen – ofte bunnventil, filter eller impeller."],
      ["Oljetrykk og temperatur", "Følg med på instrumentene. Varm motoren rolig opp før full belastning."],
      ["Under drift", "Lytt, lukt og se: nye lyder, lukt av brent, rare vibrasjoner, eksosfarge."],
      ["Stopp", "La motoren gå på tomgang et par minutter så turboen kjøles. Stopp, og noter driftstimene."]
    ] },
    { t: "tabell", tittel: "Eksosfargen forteller", hode: ["Farge", "Mulig årsak"], rader: [
      ["Svart", "For mye diesel eller for lite luft: tett luftfilter, overbelastning, feil på dyser"],
      ["Blå", "Motoren brenner olje: slitte stempelringer eller ventilføringer, turbo"],
      ["Hvit", "Vann eller damp: kald motor, eller kjølevann i forbrenningen (alvorlig)"]
    ] },

    { t: "h2", tekst: "Vedlikeholdsplan" },
    { t: "p", html: "Fartøyet skal ha en <strong>vedlikeholdsplan</strong>, som del av sikkerhetsstyringssystemet. Planen sier hva som skal gjøres, hvor ofte (etter driftstimer eller dato), og hvem som gjør det. Alt som blir gjort, skal føres i maskinlogg eller vedlikeholdssystem." },
    { t: "tabell", hode: ["Intervall (eksempel)", "Arbeid"], rader: [
      ["Hver dag", "Daglig sjekk før start, vannutskiller, sjøvannsfilter"],
      ["Etter 250 timer", "Motorolje og oljefilter, drivstoffilter (se produsentens tall)"],
      ["Hvert år", "Impeller, reimer, luftfilter, anoder, ventilklaring"],
      ["Ved slipp", "Bunnstoff, propell, akselpakning, bunnventiler, anoder"],
      ["Løpende", "Luker og dørpakninger, rekkverk, lensepumper, redningsutstyr, dekksutstyr"]
    ] },
    { t: "notat", type: "praksis", tittel: "Offeranoder", html: "<p>Sink- eller aluminiumsanoder på skrog, propell og kjølere «ofrer» seg for å beskytte metallet mot korrosjon. Er en anode borte, begynner sjøvannet å tære på propellen og skroget i stedet.</p>" },

    { t: "quiz", tittel: "Motor og vedlikehold", sp: [
      { q: "Hvordan tennes dieselen i en dieselmotor?", a: ["Lufta blir så varm ved kompresjonen at dieselen tenner av seg selv", "Med tennplugg", "Med en glødeplugg hele tiden", "Med gnist fra dynamoen"], r: 0, f: "Kompresjonstenning. Glødeplugger hjelper bare ved kaldstart på noen motorer." },
      { q: "Det kommer ikke vann ut med eksosen etter start. Hva gjør du?", a: ["Stopper motoren og sjekker bunnventil, sjøvannsfilter og impeller", "Kjører videre og ser om det kommer", "Øker turtallet", "Fyller mer kjølevæske på varm motor"], r: 0, f: "Uten sjøvann overopphetes motoren raskt, og impelleren ødelegges." },
      { q: "Hvorfor tapper du vannutskilleren?", a: ["Vann i dieselen kan stoppe og skade motoren", "For å få mer drivstoff", "For å kjøle motoren", "Det er ikke nødvendig"], r: 0, f: "Vann i drivstoffet ødelegger høytrykkspumpe og dyser, og kan stoppe motoren." },
      { q: "Svart eksos betyr ofte …", a: ["For mye diesel eller for lite luft", "Oljebrenning", "Vann i forbrenningen", "At motoren er helt i orden"], r: 0, f: "Sjekk luftfilteret og belastningen." },
      { q: "Hvorfor lar du motoren gå på tomgang før du stopper?", a: ["For å kjøle ned turboen", "For å fylle batteriet", "For å tømme drivstoffet", "Det gir mindre støy"], r: 0, f: "En varm turbo uten oljesirkulasjon kan ta skade." },
      { q: "Hva gjør offeranodene?", a: ["Beskytter metall mot korrosjon", "Gir bedre fart", "Reduserer vibrasjoner", "Kjøler sjøvannet"], r: 0, f: "Anodene tæres i stedet for propellen og skroget." }
    ] },
    { t: "oppdrag", tittel: "Daglig sjekk og maskinlogg", sted: "Maskinrom", tid: "2 t", html: "Gjennomfør daglig sjekk, start motoren, følg med i drift og stopp den etter prosedyren. Før maskinlogg.", sjekk: [
      "Sjekk olje, kjølevæske, drivstoff, vannutskiller, sjøvannsfilter og reimer",
      "Start og kontroller vann i eksosen, oljetrykk og alarmer",
      "Les av temperatur og trykk etter 15 minutter",
      "Stopp etter prosedyren og noter driftstimer",
      "Finn neste planlagte vedlikehold i vedlikeholdsplanen"
    ], lever: "Utfylt maskinlogg" }
  ],
  kanjeg: [
    "Jeg kan forklare de fire taktene i en dieselmotor.",
    "Jeg kan forklare drivstoff-, kjøle- og smøresystemet.",
    "Jeg kan gjennomføre daglig sjekk, start og stopp av motoren.",
    "Jeg kan tolke eksosfarge og instrumenter.",
    "Jeg kan bruke fartøyets vedlikeholdsplan og føre logg."
  ],
  kilder: ["sdirFisk", "laereplan"]
});

FF.moduler.push({
  id: "fr-10", fag: "fr", nr: "10", timer: 12,
  tittel: "Miljø om bord",
  under: "Avfall, olje og tapte redskaper – og hva du kan gjøre for et renere hav og lavere drivstofforbruk.",
  maal: ["FR13"], kjerne: ["Marine ressurser", "Sikkerhet om bord"],
  kort: [
    "Plast, tauverk og garn skal aldri over bord.",
    "Oljeholdig lensevann og spillolje leveres i havn.",
    "Tapt redskap skal letes etter og meldes."
  ],
  blokker: [
    { t: "ingress", html: "Fiskerne lever av et rent hav. Likevel kommer mye av plasten på strendene våre fra fiske – tauverk, garnrester og fiskekasser. Det du gjør med avfallet om bord, betyr noe." },

    { t: "h2", tekst: "Avfall" },
    { t: "p", html: "Reglene for avfall fra skip bygger på den internasjonale konvensjonen <strong>MARPOL, vedlegg V</strong>. Hovedregelen er enkel: Nesten ingenting annet enn matavfall og fiskeavfall fra fangsten kan gå over bord – og da bare på visse vilkår." },
    { t: "tabell", hode: ["Avfall", "Hva gjør du"], rader: [
      ["Plast, tauverk, garn, fiskekasser", "Aldri over bord. Samle og lever i havn."],
      ["Matavfall", "Samles. Kan bare slippes ut langt fra land etter reglene."],
      ["Fiskeavfall fra egen fangst", "Kan normalt slippes ut på havet – følg regelverket for området."],
      ["Spillolje, filtre, fillete absorbenter", "Samles i egne kanner og leveres som farlig avfall."],
      ["Batterier, lysrør, maling", "Farlig avfall – lever i havn."]
    ] },
    { t: "p", html: "Større fartøy skal ha en avfallshåndteringsplan og føre søppeldagbok, og mange fartøy skal ha oppslag som forteller mannskapet reglene. Havner skal ha mottak for avfall fra skip." },

    { t: "h2", tekst: "Olje og lensevann" },
    { t: "ul", items: [
      "Lensevann med olje skal aldri pumpes rett ut. Hold maskinrommet rent, så lensevannet ikke blir oljeholdig.",
      "Bruk absorbenter under filtre og koblinger når du skifter olje og filter.",
      "Ved bunkring: én person følger med hele tiden, luftrør skal være fri, og du skal ha absorbenter klare.",
      "Oppdager du oljeflak fra eget fartøy: stopp kilden og varsle."
    ] },

    { t: "h2", tekst: "Tapte redskaper og spøkelsesfiske" },
    { t: "p", html: "Et garn som er tapt, kan fortsette å fange fisk i lang tid – det kalles <strong>spøkelsesfiske</strong>. Derfor har du plikt til å lete etter redskap du har mistet, og melde fra om det du ikke finner. Meldingen går til Kystvakten, eller du registrerer den i den elektroniske fangstdagboka. Fiskeridirektoratet bruker meldingene når de rydder opp tapte redskaper hvert år." },
    { t: "notat", type: "praksis", tittel: "Ta med hjem", html: "<p>Får du avfall i redskapen, ta det med i land. Mange havner har ordninger der fiskere kan levere marin forsøpling gratis.</p>" },

    { t: "h2", tekst: "Drivstoff og klima" },
    { t: "p", html: "Drivstoff er både den største utgiften og det største klimautslippet for de fleste fiskefartøy. Motstanden i vannet øker kraftig med farten, så litt lavere fart gir mye lavere forbruk. Ren bunn og propell, riktig vedlikeholdt motor og god planlegging av turene sparer både penger og utslipp." },
    { t: "p", html: "Nye kystfartøy bygges med batterier og hybriddrift. Stille og utslippsfri drift på feltet og i havn er ikke lenger framtid – det er i bruk i dag." },

    { t: "quiz", tittel: "Miljø om bord", sp: [
      { q: "Hva gjør du med gamle garnrester?", a: ["Samler dem og leverer i havn", "Kaster dem over bord langt ute", "Brenner dem på dekk", "Legger dem i lasterommet og glemmer dem"], r: 0, f: "Plast og tauverk skal aldri over bord." },
      { q: "Hva er spøkelsesfiske?", a: ["Tapte redskaper som fortsetter å fange fisk", "Fiske om natta", "Fiske uten kvote", "Fiske med lys"], r: 0, f: "Derfor er det plikt til å lete etter og melde tapt redskap." },
      { q: "Hvor melder du fra om tapt redskap?", a: ["Til Kystvakten eller i den elektroniske fangstdagboka", "Til Mattilsynet", "Til salgslaget", "Det trenger du ikke"], r: 0, f: "Meldingene brukes til opprenskingen." },
      { q: "Hva er den enkleste måten å spare drivstoff på?", a: ["Senke farten litt", "Kjøre med full fart for å bli fort ferdig", "Tomgangskjøre i havn", "Fylle tankene helt"], r: 0, f: "Forbruket øker kraftig med farten. Litt lavere fart gir mye lavere forbruk." },
      { q: "Hvilken internasjonal konvensjon regulerer avfall fra skip?", a: ["MARPOL", "SOLAS", "COLREG", "ISM"], r: 0, f: "MARPOL vedlegg V handler om søppel fra skip." }
    ] },
    { t: "oppdrag", tittel: "Avfallsplan for skolebåten", sted: "Om bord", tid: "2 t", html: "Kartlegg avfallet om bord i én uke, og lag en enkel avfallsplan.", sjekk: [
      "Registrer hva slags avfall som oppstår, og hvor mye",
      "Merk opp beholdere for plast, restavfall, farlig avfall og matavfall",
      "Finn ut hvor dere leverer avfall i nærmeste havn",
      "Lag et oppslag med reglene til mannskapet"
    ] }
  ],
  kanjeg: [
    "Jeg kan reglene for avfall om bord, og hva som aldri skal over bord.",
    "Jeg kan håndtere olje, lensevann og farlig avfall riktig.",
    "Jeg vet hva jeg gjør når vi mister redskap.",
    "Jeg kan forklare hvordan fart og vedlikehold påvirker drivstofforbruket."
  ],
  kilder: ["fdirTapt", "sdirFisk"]
});

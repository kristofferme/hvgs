/* ==========================================================================
   EKSAMEN VÅREN 2026 · Hustadvika vidaregåande skole
   ALT INNHOLD BOR HER. Rediger tekst, datoer og rutiner i denne fila.
   --------------------------------------------------------------------------
   Slik skriver du:
   [[Fyll inn: …]]  = plassholder. Vises med stiplet ramme. Kan fylles inn
                      direkte i presentasjonen (tast R, eller Utforsk →
                      Plassholdere) – eller her, ved å bytte ut hele [[…]].
   **tekst**        = utheving.
   type             = "nasjonal" (regel fra forskrift/Udir),
                      "lokal"    (rutine ved Hustadvika vgs / fylket),
                      "tips"     (anbefaling og praktiske råd).
   kilde            = nøkkel i KILDER nederst.
   kontroller: true = kildene spriker eller må sjekkes mot siste versjon.
   Etter endring: kjør «node bygg.mjs» i mappa eksamen2026 (se README).
   ========================================================================== */

window.EKSAMEN = (function () {

  const META = {
    skole: "Hustadvika vidaregåande skole",
    tittel: "Eksamen våren 2026",
    undertittel: "En reise gjennom eksamensperioden",
    sporsmal: "Hva må vi som lærere vite, gjøre og være forberedt på?",
    sluttbudskap: "En trygg eksamensgjennomføring starter med at alle vet hva de skal gjøre.",
    sistOppdatert: "[[Fyll inn: dato for siste gjennomgang av innholdet]]",
    ansvarligForInnhold: "[[Fyll inn: eksamensansvarlig ved Hustadvika vgs]]",
  };

  /* Kapitlene på reisen. Rekkefølgen må ikke endres. */
  const KAPITLER = [
    { nr: "", navn: "Prolog", kort: "Prolog", periode: "" },
    { nr: "01", navn: "Før eksamen", kort: "Før", periode: "Januar – april",
      ingress: "Det meste av en trygg eksamen avgjøres før den starter." },
    { nr: "02", navn: "Skriftlig eksamen", kort: "Skriftlig", periode: "4.–21. mai",
      ingress: "Tre uker der rutinene må sitte – for hver eneste kandidat." },
    { nr: "03", navn: "Muntlig og praktisk eksamen", kort: "Muntlig", periode: "Etter den skriftlige perioden",
      ingress: "Sporet deler seg i tre. Muntlig, muntlig-praktisk og praktisk eksamen har hver sine rammer – men alle starter med trekket 28. april." },
    { nr: "04", navn: "Roller og ansvar", kort: "Roller", periode: "Hele perioden",
      ingress: "Et veikryss. Hvem gjør hva – og når? Velg en rolle." },
    { nr: "05", navn: "Når noe ikke går som planlagt", kort: "Avvik", periode: "Når som helst",
      ingress: "Selv den beste planen møter hindringer. Det avgjørende er at vi vet hva vi gjør da." },
    { nr: "", navn: "Vi er i mål", kort: "Epilog", periode: "Juni" },
  ];

  /* Trekket – det som skjer 28. april */
  const TREKK = {
    punkter: [
      { tekst: "Samme dag og klokkeslett for skriftlig og muntlig eksamen. Fra 2026 er det Udir som fastsetter trekkdatoen for videregående.", type: "nasjonal", kilde: "udirTrekk" },
      { tekst: "Kunngjøres for elevene i [[Fyll inn: kanal, f.eks. Visma InSchool]]", type: "lokal" },
      { tekst: "Følg opp gruppa samme dag – både de som er trukket og de som ikke er det", type: "tips" },
    ],
  };

  /* Eksamensformer – fargene brukes i sporene på tidslinjen. */
  const FORMER = [
    { id: "skriftlig", navn: "Skriftlig", farge: "#FF5A1F" },
    { id: "muntlig", navn: "Muntlig", farge: "#F2C14E" },
    { id: "muntlig-praktisk", navn: "Muntlig-praktisk", farge: "#5EC2A8" },
    { id: "praktisk", navn: "Praktisk", farge: "#E8E1D3" },
  ];

  /* ---------------- NØKKELDATOER ---------------- */
  const DATOER = {
    tilrettelegging: { vis: "1. februar", type: "lokal", tekst: "Søknadsfrist for særskilt tilrettelegging av eksamen." },
    trekk: { vis: "28. april", kl: "09:00", iso: "2026-04-28", type: "nasjonal", kilde: "udirTrekk",
      tekst: "Trekket offentliggjøres – samme dag for skriftlig og muntlig eksamen." },
    forsteSkriftlige: { vis: "4. mai", iso: "2026-05-04", type: "nasjonal", kilde: "udirPlan", tekst: "Første dag for sentralt gitt skriftlig eksamen." },
    sisteSkriftlige: { vis: "21. mai", iso: "2026-05-21", type: "nasjonal", kilde: "udirPlan", tekst: "Siste dag for sentralt gitt skriftlig eksamen." },
    muntligPeriode: { vis: "[[Fyll inn: periode]]", type: "lokal", kilde: "mrfylke",
      tekst: "Muntlig, muntlig-praktisk og praktisk eksamen. Datoene settes lokalt og kommer etter den skriftlige perioden." },
    fellessensur: { vis: "17.–19. juni", iso: "2026-06-17", type: "nasjonal", kilde: "sfNordland", tekst: "Fellessensur for sentralt gitt skriftlig eksamen. Hvilken dag avhenger av fag." },
    sensurfrist: { vis: "19. juni", iso: "2026-06-19", type: "nasjonal", kilde: "sfNordland", tekst: "Sensurfrist for sentralt gitt skriftlig eksamen." },
    klage: { vis: "10 dager", type: "nasjonal", kilde: "lovdata", tekst: "Klagefrist på eksamenskarakter regnes fra karakteren er gjort kjent. Hurtigklage har egen, kortere frist." },
    hurtigklage: { vis: "23./24. juni", type: "nasjonal", kilde: "sfNordland", kontroller: true,
      tekst: "Frist for hurtigklage (studieforberedende fag og fellesfag). Kildene oppgir 23. juni kl. 23:59 og 24. juni – sjekk Udir/Privatistportalen." },
  };

  /* ---------------- SKRIFTLIG: KALENDER 4.–21. MAI ----------------
     Fag oppgitt fra Udirs eksamensplan (gjengitt i skolenes eksamensplaner).
     Kontroller alltid fagkoden i eksamensplan.udir.no – lista er ikke komplett. */
  const KALENDER = [
    { dato: "2026-05-04", fag: [], merknad: "Første eksamensdag" },
    { dato: "2026-05-05", fag: [["NOR1267", "Norsk hovedmål, Vg3 / påbygg"], ["NOR1262", "Norsk, Vg2 yrkesfag"]] },
    { dato: "2026-05-06", fag: [] },
    { dato: "2026-05-07", fag: [] },
    { dato: "2026-05-08", fag: [] },
    { dato: "2026-05-11", fag: [["NOR1268", "Norsk sidemål, Vg3 / påbygg"]] },
    { dato: "2026-05-12", fag: [["", "Flere yrkesfag"]] },
    { dato: "2026-05-13", fag: [["REA3058", "Matematikk R2"], ["REA3062", "Matematikk S2"]] },
    { dato: "2026-05-14", fri: "Kristi himmelfartsdag" },
    { dato: "2026-05-15", fag: [] },
    { dato: "2026-05-18", fag: [] },
    { dato: "2026-05-19", fag: [["MAT1019", "Matematikk 1P"], ["MAT1021", "Matematikk 1T"], ["", "Matematikk 1P-Y (yrkesfag)"]] },
    { dato: "2026-05-20", fag: [["ENG1007", "Engelsk, Vg1 studieforberedende"]] },
    { dato: "2026-05-21", fag: [["MAT1023", "Matematikk 2P"], ["MAT1151", "Matematikk 2P-Y"], ["REA3056", "Matematikk R1"], ["REA3060", "Matematikk S1"]], merknad: "Siste eksamensdag" },
  ];

  /* ---------------- STORE TALL ---------------- */
  const TALL = [
    { tall: 280000, vis: "280 000", tekst: "kandidater i hele landet tar sentralt gitt eksamen i løpet av tre uker fra 4. mai.", kilde: "udirKI" },
    { tall: 600, vis: "600", tekst: "ulike eksamener gjennomføres i perioden.", kilde: "udirKI" },
    { tall: 18000, vis: "18 000", tekst: "kandidater skal i tillegg bruke sikker nettleser.", kilde: "udirKI" },
  ];

  /* ---------------- KAPITTEL 1: MILEPÆLER FØR EKSAMEN ---------------- */
  const MILEPAELER = {
    tilrettelegging: {
      naar: "1. februar", naarEtikett: "Søknadsfrist",
      tittel: "Særskilt tilrettelegging",
      ingress: "Tilrettelegging må være søkt om og vedtatt før eksamen – ikke avklart i døra på eksamensdagen.",
      sjekkliste: [
        { tekst: "Elever som trenger tilrettelegging, kjenner fristen 1. februar og har søkt", type: "lokal" },
        { tekst: "Elever som bruker lese- og skrivestøtte (f.eks. IntoWords, Lingdys) har søkt særskilt tilrettelegging", type: "nasjonal" },
        { tekst: "Vedtak er fattet og kjent for eksamensansvarlig og vaktene", type: "lokal" },
        { tekst: "Tilretteleggingen eleven får på eksamen, ligner det eleven har brukt i opplæringen", type: "tips" },
      ],
      fakta: { type: "nasjonal", tekst: "Kandidater som må bruke programmer for lese- og skrivestøtte, må søke om særskilt tilrettelegging. De kan da unntas fra kravet om sikker nettleser.", kilde: "udirSEBinfo" },
      former: ["skriftlig", "muntlig", "muntlig-praktisk", "praktisk"],
      roller: ["faglarer", "skoleledelse", "eksamensansvarlig", "elev"],
    },
    teknisk: {
      naar: "[[Fyll inn: dato for felles testdag]]", naarEtikett: "Teknisk test",
      tittel: "Er maskinen klar?",
      ingress: "Gå gjennom lista med elevene i god tid før 4. mai. Kryss av – maskinen viser hva som er klart.",
      enhet: [
        { id: "os", tekst: "Windows eller macOS", detalj: "Chromebook, nettbrett og Linux fungerer ikke.", type: "nasjonal" },
        { id: "seb", tekst: "Siste versjon installert", detalj: "Lastet ned etter 1. mars, maskinen er startet på nytt. Mac: full disktilgang er slått på.", type: "nasjonal" },
        { id: "test", tekst: "Testet med eksempeloppgave", detalj: "Eleven har åpnet og levert en eksempeloppgave i sikker nettleser.", type: "nasjonal" },
        { id: "notat", tekst: "Notater skrevet ut", detalj: "Notater på PC eller i skyen kan ikke åpnes under eksamen.", type: "nasjonal" },
        { id: "strom", tekst: "Lader og reserveløsning", detalj: "Reservemaskiner og strøm i lokalet: [[Fyll inn: hvem har ansvar]].", type: "lokal" },
      ],
      fakta: { type: "nasjonal", tekst: "Uten administratorrettigheter kan installasjonen stoppe. Hjelp på skolen: [[Fyll inn: hvem]].", kilde: "udirSEB" },
      former: ["skriftlig"],
      roller: ["faglarer", "eksamensansvarlig", "elev"],
    },
    info: {
      naar: "[[Fyll inn: uke]]", naarEtikett: "Elevinformasjon",
      tittel: "Informasjon til elevene",
      ingress: "Elevene skal ikke møte eksamen med fjorårets forventninger. Mye er nytt i 2026.",
      sjekkliste: [
        { tekst: "Hvor og når trekket kunngjøres: 28. april kl. 09:00 i [[Fyll inn: kanal]]", type: "lokal" },
        { tekst: "Det er ingen forberedelsesdag til skriftlig eksamen i år", type: "nasjonal" },
        { tekst: "Skriftlig eksamen starter kl. 09:00 – oppmøte [[Fyll inn: tid og sted]]", type: "nasjonal" },
        { tekst: "Den som kommer etter kl. 10:00, får ikke gjennomføre", type: "nasjonal" },
        { tekst: "Hva eleven gjør ved sykdom – og fristen for dokumentasjon: [[Fyll inn]]", type: "lokal" },
        { tekst: "Tillatte hjelpemidler i mitt fag er gjennomgått", type: "tips" },
        { tekst: "Elevene har øvd under eksamenslike forhold – også i sikker nettleser", type: "tips" },
      ],
      fakta: { type: "tips", tekst: "Elevrettet informasjon fra Udir ligger på kandidat.udir.no. Pek elevene dit – og gå gjennom det viktigste i timen.", kilde: "udirKandidat" },
      former: ["skriftlig", "muntlig", "muntlig-praktisk", "praktisk"],
      roller: ["faglarer", "elev"],
    },
    standpunkt: {
      naar: "Nytt i 2026", naarEtikett: "Regelendring",
      tittel: "Standpunkt – nye tidspunkt",
      ingress: "Trekket kommer tidligere, og standpunkt kan settes senere enn før.",
      /* tidslinje: punkter på en linje fra 0 til 1. «frist: true» er standpunktet. */
      regler: [
        { naar: "Fag uten eksamen", hva: "Standpunkt settes så sent som mulig i opplæringsperioden.",
          tidslinje: [{ pos: 0, tekst: "Opplæring" }, { pos: 1, tekst: "Standpunkt", frist: true }] },
        { naar: "Trukket til skriftlig eksamen", hva: "Senest dagen før eksamenskarakteren blir kjent.",
          tidslinje: [{ pos: 0.12, tekst: "Skriftlig eksamen" }, { pos: 0.62, tekst: "Standpunkt senest", frist: true }, { pos: 0.9, tekst: "Eksamenskarakter kjent" }] },
        { naar: "Trukket til muntlig, muntlig-praktisk eller praktisk", hva: "Senest dagen før eksamen.",
          tidslinje: [{ pos: 0.5, tekst: "Standpunkt senest", frist: true }, { pos: 0.82, tekst: "Eksamen" }] },
      ],
      lokal: "Lokal frist for å føre standpunkt i [[Fyll inn: system]]: [[Fyll inn: dato]]",
      fakta: { type: "nasjonal", tekst: "Endringen henger sammen med at eksamenstrekket er flyttet frem.", kilde: "udirTrekk" },
      former: ["skriftlig", "muntlig", "muntlig-praktisk", "praktisk"],
      roller: ["faglarer", "skoleledelse"],
    },
  };

  /* Nytt i 2026 – den store sekvensen i kapittel 1 */
  const NYORDNING = {
    linjer: [
      { for: "Forberedelsesdag dagen før", na: "Ingen forberedelsesdel" },
      { for: "Tilgang til internett", na: "Ingen internett" },
      { for: "Egne digitale notater", na: "Bare noen få nettbaserte hjelpemidler, som ordbøker" },
    ],
    unntak: "Forberedelsesdelen beholdes i nordsamisk, sørsamisk, lulesamisk, kvensk/finsk og tegnspråk.",
    hvorfor: "Bakgrunnen er generativ KI: tekster laget på forberedelsesdagen kunne tas med inn på eksamen.",
    kilde: "udirForberedelse",
  };

  /* Sikker nettleser (Safe Exam Browser) – hva, hvilke fag, og hvordan øve */
  const SEB = {
    hva: "Safe Exam Browser låser maskinen. Eleven får bare tilgang til eksamen og de få nettressursene som er lenket i oppgavesettet – ingen andre programmer, filer eller nettsider. Programmet er ikke koblet til noen skytjeneste og henter ingen informasjon fra maskinen.",
    hvaKilde: "udirSEBinfo",
    innforing: [
      { naar: "Våren 2026", hva: "Fag som allerede brukte den: engelsk, fremmedspråk, reiseliv og språk 2, geofag 2 og noen yrkesfag på Vg3.", kontroller: true, kilde: "udirSEBfag" },
      { naar: "Høsten 2026", hva: "Flere fag.", kilde: "udirSEBfag" },
      { naar: "Våren 2027", hva: "De aller fleste skriftlige eksamener.", kilde: "udirKI" },
    ],
    ovelse: [
      { tittel: "Last ned siste versjon", tekst: "Udir bytter versjon 1. mars og 1. oktober. Last ned på nytt etter 1. mars, og avinstaller en gammel versjon først.", type: "nasjonal", kilde: "udirSEB" },
      { tittel: "Installer og start på nytt", tekst: "Følg installasjonsguiden på kandidat.udir.no. Mac: slå på full disktilgang under Sikkerhet og personvern.", type: "nasjonal", kilde: "udirSEB" },
      { tittel: "Åpne en eksempeloppgave", tekst: "Udir legger ut eksempeloppgaver som åpnes i sikker nettleser. Bruk dem i timen – gjerne flere ganger.", type: "nasjonal", kilde: "udirSEBinfo" },
      { tittel: "Øv med hjelpemidlene", tekst: "Bare noen få nettressurser er åpne. La elevene bli kjent med dem før eksamensdagen.", type: "tips" },
      { tittel: "Felles teknisk test", tekst: "Faglærer gjennomfører en teknisk test med gruppa: [[Fyll inn: dato og hvem fra IT som er med]]", type: "lokal" },
    ],
    unntak: "Elever med lese- og skrivestøtte som har vedtak om særskilt tilrettelegging, unntas fra kravet om sikker nettleser.",
  };

  /* ---------------- KAPITTEL 2: EN EKSAMENSDAG (simulering) ---------------- */
  const EKSAMENSDAG = {
    elev: "Kari",
    fag: "Norsk hovedmål, Vg3",
    varighet: "5 timer",
    steg: [
      { kl: "[[08:30]]", tittel: "Oppmøte", elev: "Kari finner navnet sitt og plassen sin i [[Fyll inn: lokale]]. Mobilen leveres [[Fyll inn: hvor]].",
        larer: "Vaktene er på plass [[Fyll inn: tid]]. Oppmøte registreres mot kandidatlista.", type: "lokal" },
      { kl: "[[08:45]]", tittel: "Innlogging", elev: "Kari logger inn. I fag med sikker nettleser starter hun Safe Exam Browser, som låser maskinen.",
        larer: "Påloggingsinformasjon deles ut av [[Fyll inn]]. Elever som ikke kommer inn, får hjelp med en gang – ikke vent til kl. 09:00.", type: "lokal" },
      { kl: "09:00", tittel: "Eksamen starter", elev: "Oppgavesettet åpnes. Kari har ingen forberedelsesdel og ingen internett – bare hjelpemidlene som er tillatt.",
        larer: "Les opp de viktigste reglene. Fra nå av: ro i lokalet, og alle avvik noteres med klokkeslett.", type: "nasjonal" },
      { kl: "09:00–10:00", tittel: "Sene kandidater", elev: "Jonas kommer 09:40. Han får starte, men får ikke kompensert tapt tid.",
        larer: "Noter når han kom. Han slutter samtidig med de andre.", type: "nasjonal" },
      { kl: "10:00", tittel: "Døra stenges", elev: "Den som møter kl. 10:00 eller senere, får ikke gjennomføre eksamen.",
        larer: "Lokal regel om å forlate lokalet før kl. 10:00: [[Fyll inn]].", type: "nasjonal" },
      { kl: "Underveis", tittel: "Uforutsett", elev: "Maskinen til Kari fryser i sju minutter.",
        larer: "Noter tidspunkt og hva som skjedde. Eksamensvakten kan gi utvidet tid når noe uforutsett skjer. Se rutinen for tekniske problemer.", type: "nasjonal" },
      { kl: "14:00", tittel: "Innlevering", elev: "Kari leverer og ser at besvarelsen er registrert som levert.",
        larer: "Sjekk at alle har levert før de forlater lokalet. Elever med utvidet tid fortsetter.", type: "tips" },
      { kl: "Etterpå", tittel: "Avslutning", elev: "Kari går hjem. Karakteren kommer etter fellessensur i juni.",
        larer: "Protokoll og avviksskjema leveres til eksamensansvarlig [[Fyll inn: hvor/hvordan]].", type: "lokal" },
    ],
  };

  /* Før / under / etter – hvem gjør hva på skriftlig eksamen */
  const SKRIFTLIG_ANSVAR = {
    faser: ["Før", "Under", "Etter"],
    rader: [
      { rolle: "faglarer", celler: [
        "Forbereder elevene på ny ordning og hjelpemidler, og øver i sikker nettleser.",
        "[[Fyll inn: er faglærer tilgjengelig på telefon under eksamen i eget fag?]]",
        "Setter standpunkt senest dagen før eksamenskarakteren blir kjent." ] },
      { rolle: "eksamensvakt", celler: [
        "Kjenner vaktinstruksen, lokalet og hvem som har tilrettelegging.",
        "Registrerer oppmøte, holder ro og orden, noterer alle avvik med klokkeslett. Kan gi utvidet tid ved uforutsette hendelser.",
        "Kontrollerer innlevering og leverer protokoll." ] },
      { rolle: "eksamensansvarlig", celler: [
        "Oppmelding, lokaler, vaktlister, tilrettelegging og teknisk beredskap.",
        "Tar imot avvik og melder tekniske feil videre.",
        "Samler protokoller og følger opp avvik, sykdom og dokumentasjon." ] },
    ],
  };

  /* Rutine: tekniske problemer under skriftlig eksamen */
  const TEKNISK_RUTINE = [
    { tittel: "Ro situasjonen", tekst: "Eleven skal ikke miste tid på å være redd. Si at tiden blir ivaretatt.", type: "tips" },
    { tittel: "Noter klokkeslett", tekst: "Når startet problemet – og når var eleven i gang igjen?", type: "nasjonal" },
    { tittel: "Samle informasjon", tekst: "Kandidatnummer, fag, tidspunkt, eksakt feilmelding og hva slags maskin. Udir har et eget skjema for dette.", type: "nasjonal", kilde: "udirTeknisk" },
    { tittel: "Tilkall hjelp", tekst: "[[Fyll inn: IT-kontakt og eksamensansvarlig – telefon]]", type: "lokal" },
    { tittel: "Gi tiden tilbake", tekst: "Eksamensvakten kan gi utvidet tid når noe uforutsett skjer. Noter hvor mye.", type: "nasjonal", kilde: "udirKI" },
    { tittel: "Meld videre", tekst: "Skjemaet leveres den som har ansvar for teknisk gjennomføring. Skolen melder til fylkeskommunen, som melder til Udir.", type: "lokal", kilde: "udirTeknisk" },
  ];

  /* ---------------- KAPITTEL 3: MUNTLIG, MUNTLIG-PRAKTISK OG PRAKTISK ---------------- */
  const SPOR = [
    { id: "muntlig", tittel: "Muntlig", eksempel: "Samtale med utgangspunkt i en forberedelsesdel",
      forberedelse: "24 timer", gjennomforing: "Inntil 30 min", type: "nasjonal", kilde: "lovdata" },
    { id: "muntlig-praktisk", tittel: "Muntlig-praktisk", eksempel: "F.eks. realfag: praktisk oppgave og samtale",
      forberedelse: "[[Fyll inn: lokal ramme]]", gjennomforing: "45 min", type: "lokal" },
    { id: "praktisk", tittel: "Praktisk", eksempel: "Tverrfaglig praktisk eksamen, Vg2 yrkesfag",
      forberedelse: "Egne regler", gjennomforing: "Egne regler", type: "lokal",
      merknad: "Tverrfaglig praktisk eksamen har egne regler: [[Fyll inn: hvor retningslinjene finnes]]" },
  ];

  const MUNTLIG = {
    trekk: {
      for: { tekst: "Kullene før", uker: 1 },
      na: { tekst: "Våren 2026", uker: 4 },
      forklaring: "Trekket for muntlig kommer 28. april – samme dag som for skriftlig. Mange elever får dermed flere uker fra de vet faget til de har eksamen, mot omtrent én uke tidligere.",
      kilde: "utdanningsnytt",
      konsekvenser: [
        { tekst: "Opplæringen fortsetter etter trekket. Planlegg perioden mellom trekk og eksamen – for de som skal opp, og for de som ikke skal.", type: "tips" },
        { tekst: "Kandidaten får vite eksamensdag og tidspunkt [[Fyll inn: når og hvordan]].", type: "lokal" },
      ],
    },
    forberedelse: {
      timer: 24,
      tekst: "Forberedelsesdelen ved muntlig eksamen varer 24 timer.",
      kilde: "lovdata",
      punkter: [
        { tekst: "Eksaminator lager oppgaven/temaet i tråd med læreplanen.", type: "nasjonal" },
        { tekst: "Slik får kandidaten forberedelsesdelen: [[Fyll inn: f.eks. Teams eller papir, og klokkeslett]]", type: "lokal" },
        { tekst: "Forberedelsesdagen gir ikke egne timer til eksaminator.", type: "lokal" },
      ],
    },
    gjennomforing: {
      tekst: "Eksamenstiden er ulik for de tre formene.",
      punkter: [
        { tekst: "Muntlig: inntil 30 minutter per kandidat.", type: "nasjonal", kilde: "lovdata" },
        { tekst: "Muntlig-praktisk, f.eks. i realfagene: 45 minutter.", type: "lokal" },
        { tekst: "Tverrfaglig praktisk eksamen, Vg2 yrkesfag: egne regler for varighet og gjennomføring.", type: "lokal" },
        { tekst: "Eksaminator leder eksamen og stiller spørsmål. Protokollmal: [[Fyll inn: hvor den ligger]]", type: "nasjonal" },
      ],
    },
    parti: {
      tall: [
        { vis: "5–7", tekst: "kandidater per parti – ett parti per dag" },
        { vis: "1", tekst: "sensor per parti, i tillegg til eksaminator" },
        { vis: "6 t", tekst: "til eksaminator per eksamensdag" },
      ],
      punkter: [
        { tekst: "Sensor 1 er eksaminator – normalt faglæreren.", type: "lokal" },
        { tekst: "Forberedelsesdagen gir ikke egne timer.", type: "lokal" },
        { tekst: "Eksamen er en del av faget.", type: "lokal" },
      ],
    },
    sensur: {
      hovedregel: "Let etter kompetansen eleven har – ikke etter det eleven ikke kan.",
      hovedregelKilde: "udirMuntlig",
      punkter: [
        { tekst: "Ved lokalt gitt muntlig, praktisk og muntlig-praktisk eksamen skal faglæreren være sensor dersom fylkeskommunen ønsker det.", type: "nasjonal", kilde: "lovdata" },
        { tekst: "Sensor 1 (eksaminator) og sensor 2 setter karakteren sammen. Kandidaten får den [[Fyll inn: når og hvordan]].", type: "lokal" },
        { tekst: "Ved muntlig eksamen kan det bare klages på formelle feil. Får eleven medhold, annulleres karakteren, og eleven kan ta ny eksamen med nye sensorer.", type: "nasjonal", kilde: "udirMuntlig" },
      ],
    },
    ansvar: {
      faser: ["Trekk", "Kunngjøring", "Forberedelse", "Gjennomføring", "Sensur"],
      rader: [
        { rolle: "eksaminator", celler: ["Følger opp gruppa etter trekket", "Sier fra om feil i oppsettet", "Lager og gir forberedelsesdelen", "Leder eksamen", "Setter karakter med sensor 2. Standpunkt senest dagen før eksamen"] },
        { rolle: "sensor", celler: ["", "Får tilsendt [[Fyll inn: hva]]", "Setter seg inn i oppgaven og læreplanen", "Lytter, kan stille spørsmål", "Setter karakter, signerer protokoll"] },
        { rolle: "eksamensansvarlig", celler: ["Kunngjør trekket", "Setter opp partier (5–7 per dag), rom og sensorer", "", "Rom og logistikk", "Samler protokoller"] },
        { rolle: "skoleledelse", celler: ["Ansvar for at trekket gjennomføres riktig", "", "", "Avgjør ved avvik", "Behandler klager"] },
      ],
    },
  };

  /* ---------------- KAPITTEL 4: ROLLER ---------------- */
  const ROLLER = [
    { id: "faglarer", navn: "Faglærer", kort: "Kjenner eleven og faget",
      ansvar: "Forbereder elevene, øver i sikker nettleser, setter standpunkt til rett tid – og er sensor 1 (eksaminator) på muntlig.",
      samarbeid: ["elev", "eksaminator", "eksamensansvarlig", "sensor"],
      oppgaver: [
        { fase: "for", tekst: "Sørge for at elever med behov har søkt tilrettelegging innen 1. februar", stopp: "k1-tilrettelegging" },
        { fase: "for", tekst: "Forberede elevene på ny ordning: ingen forberedelsesdel, ingen internett", stopp: "k1-nyordning" },
        { fase: "for", tekst: "Øve med elevene i sikker nettleser med eksempeloppgaver", stopp: "k1-seb" },
        { fase: "for", tekst: "Gå gjennom hjelpemidler og eksamensregler", stopp: "k1-info" },
        { fase: "trekk", tekst: "Følge opp gruppa etter trekket 28. april", stopp: "k1-trekk" },
        { fase: "skriftlig", tekst: "Sette standpunkt senest dagen før eksamenskarakteren blir kjent", stopp: "k1-standpunkt" },
        { fase: "muntlig", tekst: "Sette standpunkt senest dagen før muntlig eksamen", stopp: "k1-standpunkt" },
        { fase: "muntlig", tekst: "Være sensor 1 (eksaminator) for egne elever", stopp: "k3-parti" },
      ] },
    { id: "eksaminator", navn: "Eksaminator", kort: "Sensor 1 – leder eksamen",
      ansvar: "Sensor 1 – normalt faglæreren. Lager oppgavene, leder eksamen og setter karakter sammen med sensor 2. Får 6 timer per eksamensdag.",
      samarbeid: ["sensor", "faglarer", "elev", "eksamensansvarlig"],
      oppgaver: [
        { fase: "muntlig", tekst: "Lage oppgave/tema til forberedelsesdelen i tråd med læreplanen", stopp: "k3-forberedelse" },
        { fase: "muntlig", tekst: "Gi forberedelsesdelen til rett tid: [[Fyll inn]]", stopp: "k3-forberedelse" },
        { fase: "muntlig", tekst: "Lede eksamen – 30 min muntlig, 45 min muntlig-praktisk", stopp: "k3-gjennomforing" },
        { fase: "etter", tekst: "Sette karakter sammen med sensor 2 og føre protokoll", stopp: "k3-sensur" },
      ] },
    { id: "sensor", navn: "Sensor", kort: "Sensor 2 – én per parti",
      ansvar: "Én sensor per parti på 5–7 kandidater. Vurderer sammen med eksaminator og leter etter kompetansen eleven har.",
      samarbeid: ["eksaminator", "eksamensansvarlig"],
      oppgaver: [
        { fase: "muntlig", tekst: "Sette seg inn i læreplanen og oppgaven før eksamen", stopp: "k3-forberedelse" },
        { fase: "muntlig", tekst: "Lytte, notere og eventuelt stille spørsmål", stopp: "k3-gjennomforing" },
        { fase: "etter", tekst: "Sette karakter og signere protokollen", stopp: "k3-sensur" },
        { fase: "etter", tekst: "Melde forfall straks til [[Fyll inn: hvem]]", stopp: "k5-sensor" },
      ] },
    { id: "eksamensvakt", navn: "Eksamensvakt", kort: "Holder orden i lokalet",
      ansvar: "Sikrer at skriftlig eksamen gjennomføres etter reglene – og noterer alt som avviker.",
      samarbeid: ["elev", "eksamensansvarlig"],
      oppgaver: [
        { fase: "skriftlig", tekst: "Registrere oppmøte og slippe inn sene kandidater fram til kl. 10:00", stopp: "k2-simulering" },
        { fase: "skriftlig", tekst: "Notere alle avvik med klokkeslett", stopp: "k2-ansvar" },
        { fase: "skriftlig", tekst: "Gi utvidet tid ved uforutsette tekniske problemer", stopp: "k2-teknisk" },
        { fase: "skriftlig", tekst: "Følge rutinen ved mistanke om fusk", stopp: "k5-regelverk" },
        { fase: "etter", tekst: "Kontrollere innlevering og levere protokoll", stopp: "k2-ansvar" },
      ] },
    { id: "eksamensansvarlig", navn: "Eksamensansvarlig", kort: "Holder i hele løpet",
      ansvar: "Eksamensplan, lokaler, vakter, partier og sensorer, teknisk beredskap og avvik. Kontaktpunktet for alle andre.",
      samarbeid: ["faglarer", "eksaminator", "sensor", "eksamensvakt", "skoleledelse", "elev"],
      oppgaver: [
        { fase: "for", tekst: "Organisere felles teknisk test av sikker nettleser", stopp: "k1-teknisk" },
        { fase: "trekk", tekst: "Kunngjøre trekket 28. april kl. 09:00", stopp: "k1-trekk" },
        { fase: "skriftlig", tekst: "Lokaler, vaktlister og teknisk beredskap", stopp: "k2-ansvar" },
        { fase: "skriftlig", tekst: "Ta imot og melde tekniske feil videre", stopp: "k2-teknisk" },
        { fase: "muntlig", tekst: "Sette opp partier (5–7 per dag), rom og sensorer", stopp: "k3-parti" },
        { fase: "etter", tekst: "Følge opp sykdom, dokumentasjon og ny eksamen", stopp: "k5-syk" },
      ] },
    { id: "skoleledelse", navn: "Skoleledelsen", kort: "Har det overordnede ansvaret",
      ansvar: "Rektor har ansvaret for at eksamen gjennomføres etter regelverket, fatter vedtak om tilrettelegging og avgjør i tvilstilfeller.",
      samarbeid: ["eksamensansvarlig", "faglarer"],
      oppgaver: [
        { fase: "for", tekst: "Fatte vedtak om særskilt tilrettelegging", stopp: "k1-tilrettelegging" },
        { fase: "skriftlig", tekst: "Avgjøre ved avvik og mistanke om fusk", stopp: "k5-regelverk" },
        { fase: "etter", tekst: "Behandle klager på muntlig eksamen (formelle feil)", stopp: "k3-sensur" },
        { fase: "etter", tekst: "Sikre at standpunkt er satt til rett tid", stopp: "k1-standpunkt" },
      ] },
    { id: "elev", navn: "Elev", kort: "Den alt handler om",
      ansvar: "Møter forberedt, til rett tid, med lovlige hjelpemidler – og sier fra med en gang hvis noe skjer.",
      samarbeid: ["faglarer", "eksamensvakt", "eksaminator", "eksamensansvarlig"],
      oppgaver: [
        { fase: "for", tekst: "Søke tilrettelegging innen 1. februar", stopp: "k1-tilrettelegging" },
        { fase: "for", tekst: "Installere, oppdatere og teste sikker nettleser", stopp: "k1-teknisk" },
        { fase: "trekk", tekst: "Sjekke trekket 28. april kl. 09:00", stopp: "k1-trekk" },
        { fase: "skriftlig", tekst: "Møte før kl. 09:00 – senest før kl. 10:00", stopp: "k5-sent" },
        { fase: "skriftlig", tekst: "Kontakte skolen straks ved sykdom og levere dokumentasjon", stopp: "k5-syk" },
        { fase: "etter", tekst: "Følge med på karakter og klagefrist", stopp: "e-datoer" },
      ] },
  ];

  const FASER = [
    { id: "for", navn: "Før eksamen" },
    { id: "trekk", navn: "Trekk" },
    { id: "skriftlig", navn: "Skriftlig" },
    { id: "muntlig", navn: "Muntlig" },
    { id: "etter", navn: "Etter" },
  ];

  /* ---------------- KAPITTEL 5: SCENARIOER ---------------- */
  const SCENARIOER = [
    { id: "sent", nr: "01", tittel: "En elev møter for sent", situasjon: "Klokka er 09:47. Jonas står i døra til eksamenslokalet.",
      sporsmal: "Hva gjelder?",
      valg: [
        { tekst: "Han får ikke starte – eksamen er i gang", riktig: false },
        { tekst: "Han får starte, og får 47 minutter ekstra", riktig: false },
        { tekst: "Han får starte, men får ikke kompensert tapt tid", riktig: true },
      ],
      regel: "Skriftlig eksamen starter kl. 09:00. Den som møter før kl. 10:00, får gjennomføre, men får ikke kompensert tapt tid. Den som møter kl. 10:00 eller senere, får ikke gjennomføre.",
      regelType: "nasjonal", kilde: "forskrift928",
      gjor: ["Slipp eleven inn og noter klokkeslettet", "Eleven avslutter samtidig med de andre", "Etter kl. 10:00: eleven sendes til [[Fyll inn: hvem]], som registrerer fraværet"],
      kontakt: "[[Fyll inn: eksamensansvarlig, telefon]]",
      klokke: true,
    },
    { id: "syk", nr: "02", tittel: "En elev blir syk", situasjon: "Kl. 07:40 ringer Amina. Hun har feber og kommer ikke.",
      sporsmal: "Hva er det viktigste du sier til henne?",
      valg: [
        { tekst: "«Bli hjemme – du får bare en ny eksamen neste år»", riktig: false },
        { tekst: "«Ta kontakt med skolen og skaff dokumentasjon – da har du rett til ny eksamen»", riktig: true },
        { tekst: "«Kom likevel, du kan gå etter én time»", riktig: false },
      ],
      regel: "Ved dokumentert fravær (f.eks. legeerklæring) har eleven rett til ny/utsatt eksamen. Blir eleven syk under eksamen, skal hen si fra til vakten.",
      regelType: "nasjonal", kilde: "mrfylke",
      gjor: ["Be eleven kontakte [[Fyll inn: hvem]] så snart som mulig", "Dokumentasjon leveres innen [[Fyll inn: frist]]", "Syk under eksamen: vakten noterer klokkeslett og følger lokal rutine"],
      kontakt: "[[Fyll inn: kontor/eksamensansvarlig]]",
    },
    { id: "teknisk", nr: "03", tittel: "Internett eller eksamenssystemet svikter", situasjon: "Kl. 10:12 fryser skjermen til seks elever samtidig.",
      sporsmal: "Hva gjør du først?",
      valg: [
        { tekst: "Ber alle starte maskinen på nytt og håper det går", riktig: false },
        { tekst: "Noterer klokkeslett, samler informasjon og tilkaller hjelp", riktig: true },
        { tekst: "Avlyser eksamen i lokalet", riktig: false },
      ],
      regel: "Uforutsette hendelser skal ikke gå ut over kandidaten. Eksamensvakten kan gi utvidet tid. Opplysninger samles inn i lokalet og leveres den som har ansvar for teknisk gjennomføring.",
      regelType: "nasjonal", kilde: "udirTeknisk",
      gjor: ["Noter klokkeslett for hver elev", "Samle kandidatnummer, feilmelding og maskintype", "Tilkall [[Fyll inn: IT-kontakt]]", "Gi utvidet tid tilsvarende tapt tid, og noter det"],
      kontakt: "[[Fyll inn: IT-beredskap, telefon]]",
    },
    { id: "hjelpemidler", nr: "04", tittel: "Problemer med hjelpemidler", situasjon: "Elias får ikke IntoWords til å virke i sikker nettleser.",
      sporsmal: "Hva gjelder?",
      valg: [
        { tekst: "Han kan bruke en vanlig nettleser i stedet", riktig: false },
        { tekst: "Har han vedtak om tilrettelegging, skal han være unntatt sikker nettleser – kontakt eksamensansvarlig", riktig: true },
        { tekst: "Han må klare seg uten", riktig: false },
      ],
      regel: "Kandidater som må bruke lese- og skrivestøtte, må søke særskilt tilrettelegging, og kan unntas fra kravet om sikker nettleser. Uten vedtak skal vakten ikke improvisere egne løsninger.",
      regelType: "nasjonal", kilde: "udirSEBinfo",
      gjor: ["Sjekk lista over tilrettelegging for lokalet", "Kontakt eksamensansvarlig – ikke gi tilgang på egen hånd", "Noter tidspunkt; tapt tid kan kompenseres"],
      kontakt: "[[Fyll inn: eksamensansvarlig]]",
    },
    { id: "regelverk", nr: "05", tittel: "Spørsmål om regelverk", situasjon: "En vakt ser at en elev har mobilen i lomma kl. 11:20.",
      sporsmal: "Hva gjør vakten?",
      valg: [
        { tekst: "Tar besvarelsen og sender eleven ut", riktig: false },
        { tekst: "Noterer det som skjedde, sikrer forholdet og melder fra – eleven fullfører", riktig: true },
        { tekst: "Gir en muntlig advarsel og glemmer det", riktig: false },
      ],
      regel: "Vakten avgjør ikke om det er fusk. Vakten dokumenterer og melder fra. Spørsmål om annullering avgjøres etter opplæringsforskrifta kapittel 9 – ikke i eksamenslokalet.",
      regelType: "nasjonal", kilde: "lovdata",
      gjor: ["Noter klokkeslett, hva du så og hvem som var vitner", "Meld straks til [[Fyll inn: eksamensansvarlig/rektor]]", "Følg lokal rutine for mistanke om fusk: [[Fyll inn]]"],
      kontakt: "[[Fyll inn: rektor/eksamensansvarlig]]",
    },
    { id: "sensor", nr: "06", tittel: "En sensor melder forfall", situasjon: "Kvelden før muntlig eksamen melder sensor 2 seg syk. Partiet har seks kandidater.",
      sporsmal: "Hva gjør du som eksaminator?",
      valg: [
        { tekst: "Gjennomfører alene og setter karakter selv", riktig: false },
        { tekst: "Melder straks fra til eksamensansvarlig, som skaffer ny sensor", riktig: true },
        { tekst: "Utsetter eksamen på egen hånd", riktig: false },
      ],
      regel: "Hvert parti har én sensor i tillegg til eksaminator. Eksaminator kan ikke sette karakter alene.",
      regelType: "lokal",
      gjor: ["Meld fra straks – også om kvelden – til [[Fyll inn: hvem/telefon]]", "Eksamensansvarlig finner ny sensor eller avgjør endring", "Kandidatene informeres av [[Fyll inn: hvem]]"],
      kontakt: "[[Fyll inn: eksamensansvarlig, telefon utenom arbeidstid]]",
    },
  ];

  /* ---------------- EPILOG ---------------- */
  const FEIL = [
    { myte: "«Elevene får forberedelsesdag dagen før.»", fakta: "Forberedelsesdelen er fjernet på sentralt gitt skriftlig eksamen (med noen få unntak).", kilde: "udirForberedelse" },
    { myte: "«Sikker nettleser fikser vi på eksamensdagen.»", fakta: "Last ned siste versjon etter 1. mars og øv med eksempeloppgaver i god tid. Chromebook, nettbrett og Linux fungerer ikke.", kilde: "udirSEB" },
    { myte: "«Muntlig planlegger vi når trekket kommer.»", fakta: "Trekket kommer 28. april. Partier på 5–7 kandidater per dag, rom og sensorer må være klare.", kilde: null },
    { myte: "«Standpunkt setter vi før trekket, som før.»", fakta: "Standpunkt i eksamensfag settes senest dagen før eksamenskarakteren blir kjent (skriftlig) eller dagen før eksamen (muntlig).", kilde: "udirTrekk" },
    { myte: "«Avvik husker vi etterpå.»", fakta: "Alt noteres med klokkeslett, der og da. Uten notat blir det vanskelig å gi tid tilbake og å behandle klager.", kilde: null },
  ];

  const HJELP = {
    lokalt: [
      { rolle: "Eksamensansvarlig", hvem: "[[Fyll inn: navn]]", kontakt: "[[Fyll inn: telefon / e-post]]" },
      { rolle: "IT under eksamen", hvem: "[[Fyll inn: navn]]", kontakt: "[[Fyll inn: telefon]]" },
      { rolle: "Rektor / avdelingsleder", hvem: "[[Fyll inn: navn]]", kontakt: "[[Fyll inn: telefon]]" },
      { rolle: "Felles informasjon", hvem: "[[Fyll inn: Teams-kanal eller mappe]]", kontakt: "" },
    ],
    nasjonalt: ["udirEksamen", "udirKandidat", "udirSEB", "udirPlan", "udirMuntlig", "lovdata", "mrfylke"],
  };

  /* ---------------- KILDER ---------------- */
  const KILDER = {
    udirEksamen: { navn: "Udir – Administrere eksamen", url: "https://www.udir.no/eksamen-og-prover/eksamen/administrere-eksamen/" },
    udirPlan: { navn: "Udir – Eksamensplan for skriftlig eksamen", url: "https://eksamensplan.udir.no/" },
    udirTrekk: { navn: "Udir – Endringer i eksamenstrekket og standpunkt for videregående", url: "https://www.udir.no/eksamen-og-prover/eksamen/slik-endrer-vi-eksamen/eksamenstrekk-standpunkt-vgs/" },
    udirForberedelse: { navn: "Udir – Fjerning av forberedelsesdel til skriftlig sentralt gitt eksamen", url: "https://www.udir.no/eksamen-og-prover/eksamen/slik-endrer-vi-eksamen/forberedelsedel-skriftlig-eksamen/" },
    udirKI: { navn: "Udir – Gjør grep for å hindre bruk av KI på eksamen (pressemelding, april 2026)", url: "https://www.udir.no/presse/pressemeldinger/strammer-inn-for-a-hindre-bruk-av-ki-pa-eksamen/" },
    udirSEB: { navn: "Udir – Installasjonsguide for Safe Exam Browser", url: "https://kandidat.udir.no/seb/installasjonsguide" },
    udirSEBinfo: { navn: "Udir – Informasjon om Safe Exam Browser", url: "https://kandidat.udir.no/seb" },
    udirSEBfag: { navn: "Udir – Eksamensfag med sikker nettleser", url: "https://www.udir.no/eksamen-og-prover/eksamen/slik-endrer-vi-eksamen/eksamensfag-med-sikker-nettleser/" },
    udirKandidat: { navn: "Udir – Informasjon til kandidater", url: "https://kandidat.udir.no/" },
    udirMuntlig: { navn: "Udir – Regler for muntlig og muntlig-praktisk eksamen", url: "https://www.udir.no/eksamen-og-prover/eksamen/muntlig-eksamen/" },
    udirTeknisk: { navn: "Udir – Tekniske problemer under gjennomføring av eksamen (skjema)", url: "https://www.udir.no/contentassets/45c8dcc48a934c9ba99766be679bf4b3/brukerstotte-tekniske-problem-eksamen-bokmal.pdf" },
    forskrift928: { navn: "Opplæringsforskrifta § 9-28 (Udirs regelverkstolkning)", url: "https://www.udir.no/regelverkstolkninger/opplaring/forskrift-om-grunnskoleopplaringa-og-den-vidaregaande-opplaringa-opplaringsforskrifta/tredje-delen--fellesreglar-for-grunnskoleopplaringa-og-den-vidaregaande-opplaringa-for-barn-og-unge/kapittel-9-individuell-vurdering/v.-eksamen/-9-28-eksamensformer-tidsramme-og-trekk-av-elevar-til-eksamen/" },
    lovdata: { navn: "Opplæringsforskrifta kapittel 9 – Individuell vurdering (Lovdata)", url: "https://lovdata.no/forskrift/2024-06-03-900/kap9" },
    sfNordland: { navn: "Statsforvalteren – Eksamen våren 2026 (datoer for sensur og klage)", url: "https://www.statsforvalteren.no/nordland/barnehage-og-opplaring/eksamen-og-vurdering1/eksamen-varen-2026/" },
    mrfylke: { navn: "Møre og Romsdal fylkeskommune – Eksamen for elevar", url: "https://mrfylke.no/tenester/skole-og-opplaring/eksamen-og-vitnemal/eksamen-for-elevar/skriftleg-eksamen-for-elevar/" },
    utdanningsnytt: { navn: "Utdanningsnytt – Blir rekordtidlig eksamenstrekk i videregående", url: "https://www.utdanningsnytt.no/eksamen-eksamensdato-muntlig-eksamen/blir-rekordtidlig-eksamenstrekk-i-videregaende/459024" },
  };

  return { META, KAPITLER, TREKK, FORMER, DATOER, KALENDER, TALL, MILEPAELER, NYORDNING, SEB, EKSAMENSDAG, SKRIFTLIG_ANSVAR,
    TEKNISK_RUTINE, SPOR, MUNTLIG, ROLLER, FASER, SCENARIOER, FEIL, HJELP, KILDER };
})();

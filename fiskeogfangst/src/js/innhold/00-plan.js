/* Læreplanen: programfag, kjerneelementer og kompetansemål (FFA02-03).
   Målene er gjengitt i kortform på bokmål. Full ordlyd: udir.no/lk20/ffa02-03 */

FF.fag = {
  fr: {
    kode: "fr",
    navn: "Fartøy og redskaper",
    timer: 337,
    ingress: "Å drive fartøyet trygt og effektivt: mannskap, sikkerhet, stabilitet, navigasjon, sjøveisregler, redskaper, dekksutstyr, motor og miljø.",
    farge: "var(--skrog)"
  },
  fk: {
    kode: "fk",
    navn: "Fangst og kvalitet",
    timer: 140,
    ingress: "Fra fisken står i havet til den er levert på kaia: artene, forvaltningen, seleksjon, fangstbehandling, tilvirking, kvalitet og økonomi.",
    farge: "var(--magenta)"
  },
  yff: {
    kode: "yff",
    navn: "Yrkesfaglig fordypning",
    timer: 253,
    ingress: "Ut på båt og i bedrift. Praksislogg, utplassering og veien videre mot fagbrev og fiskeskippersertifikat.",
    farge: "var(--oransje)"
  }
};

FF.kjerneelementer = [
  { navn: "Marine ressurser", tekst: "Biologi og utbredelse for ulike arter, artenes økonomiske betydning, hvordan moderne fiske påvirker miljøet og ressursene, og hvordan fisket reguleres og ressursene forvaltes." },
  { navn: "Sikkerhet om bord", tekst: "Arbeid under skiftende værforhold, med skiftende arbeidstid og krav til fleksibilitet. Gjeldende regelverk for helse, miljø og sikkerhet bygd på godt sjømannskap, blant annet sikkerhetsstyringssystem og fartøyinstruks." },
  { navn: "Fartøy og fiskeredskaper", tekst: "Å gjennomføre fiskeoperasjoner med tilhørende utstyr: klargjøre og vedlikeholde fartøy og redskaper, bruke navigasjons- og fiskeletingsutstyr, sette og hale redskaper og kjenne de ulike rollene om bord." },
  { navn: "Fangst, kvalitet og marked", tekst: "Behandling og levering av fangst, kvalitetskrav til råstoff og ferdigvare i ulike markeder, og forhold og økonomi knyttet til aktuelle fiskerier." }
];

FF.maal = {
  FR1: { fag: "fr", tekst: "forklare drift av fartøy ut fra vær, strøm, tidevann og fiskens atferd" },
  FR2: { fag: "fr", tekst: "planlegge, gjennomføre, vurdere og dokumentere navigering ved hjelp av sjøkart, farvannsbeskrivelser, sjømerker og navigasjonshjelpemidler" },
  FR3: { fag: "fr", tekst: "bruke sjøveisreglene og holde brovakt i samsvar med godt sjømannskap" },
  FR4: { fag: "fr", tekst: "beregne stabiliteten til fartøy i ulike lastekondisjoner" },
  FR5: { fag: "fr", tekst: "laste og losse fartøy i samsvar med gjeldende regelverk" },
  FR6: { fag: "fr", tekst: "bruke sikkerhetsstyringssystem for fiskefartøy etter gjeldende regelverk og gjøre rede for hva ISM-koden betyr for drift og sikkerhet" },
  FR7: { fag: "fr", tekst: "beskrive hovedfunksjoner og ansvarsfordeling for mannskapet om bord" },
  FR8: { fag: "fr", tekst: "vurdere risiko ved arbeidsoperasjoner om bord" },
  FR9: { fag: "fr", tekst: "velge ut og bruke personlig verneutstyr ved ulike arbeidsoperasjoner om bord" },
  FR10: { fag: "fr", tekst: "vedlikeholde og reparere fartøy og produksjonsutstyr etter fartøyets vedlikeholdsplan" },
  FR11: { fag: "fr", tekst: "starte, stoppe og utføre rutinemessig vedlikehold av motor" },
  FR12: { fag: "fr", tekst: "gjøre rede for hvordan dekksutstyret om bord er bygd opp og fungerer" },
  FR13: { fag: "fr", tekst: "håndtere avfall og hindre skadelige utslipp etter gjeldende regelverk" },
  FK1: { fag: "fk", tekst: "bruke metoder for seleksjon og fangstbegrensning med ulike redskaper og vurdere hva metodene betyr for bærekraftig forvaltning" },
  FK2: { fag: "fk", tekst: "utføre primærbehandling av råstoff etter gjeldende regelverk" },
  FK3: { fag: "fk", tekst: "bruke fangstbehandlingsutstyr om bord og vurdere hva det betyr for kvaliteten på råstoffet" },
  FK4: { fag: "fk", tekst: "bruke tilvirkingsmetoder for ulike arter og vurdere hvordan de påvirker kvaliteten og graden av råstoffutnyttelse" },
  FK5: { fag: "fk", tekst: "bruke kvalitetssikringssystemer og følge standarder om bord" },
  FK6: { fag: "fk", tekst: "gjøre rede for sammenhengen mellom fangstinntekt, kostnader, lott og lønnsoppgjør" },
  FK7: { fag: "fk", tekst: "gjøre rede for organisasjoner og forvaltningsnivåer i næringen" }
};

/* Kildeliste som brukes i flere moduler */
FF.kilde = {
  laereplan: { type: "Udir", navn: "Læreplan i Vg2 fiske og fangst (FFA02-03)", url: "https://www.udir.no/lk20/ffa02-03" },
  sdirFisk: { type: "Sdir", navn: "Sjøfartsdirektoratet – fiskefartøy: krav, HMS og risiko", url: "https://www.sdir.no/naringsfartoy/fartoystyper/fiskefartoy/" },
  sdirSms: { type: "Sdir", navn: "Sikkerhetsstyringssystem og ISM for fiskefartøy", url: "https://www.sdir.no/naringsfartoy/fartoystyper/fiskefartoy/sikkerhetsstyringssystem-og-ism-for-fiskefartoy/" },
  sdirFob: { type: "Sdir", navn: "Fall over bord – læring av hendelser", url: "https://www.sdir.no/laring-av-hendelser/fall-over-bord--laring-av-hendelser/" },
  sdirBro: { type: "Sdir", navn: "Brovakt på fiskefartøy – læring av hendelser", url: "https://www.sdir.no/laring-av-hendelser/brovakt-pa-fiskefartoy/" },
  sdirKurs: { type: "Sdir", navn: "Grunnleggende sikkerhetsopplæring for fiskere", url: "https://www.sdir.no/naringsfartoy/fartoystyper/fiskefartoy/kurs-sertifikater-og-utdanning-for-fiskere/grunnleggende-sikkerhetsopplaring-for-fiskere/" },
  sdirStab: { type: "Sdir", navn: "Stabilitet for fiskefartøy 8–15 meter", url: "https://www.sdir.no/naringsfartoy/fartoystyper/fiskefartoy/fiskefartoy-mellom-8-og-15-meter/utstyr-fartsomrader-og-tekniske-krav/stabilitet-og-fribordsforhold2/stabilitet-for-eldre-fiskefartoy-8-15-meter/" },
  sdirKlC: { type: "Sdir", navn: "Fiskeskippersertifikat klasse C", url: "https://www.sdir.no/sjofolk/sertifikater/Informasjon_om_maritime_sertifikater_og_kvalifikasjoner/fiskeskippersertifikat-klasse-c/" },
  yrkesfisker: { type: "Fiskarlaget", navn: "Yrkesfisker.no – Sikker fisker", url: "https://www.yrkesfisker.no/no/sikker-fisker/" },
  fdir: { type: "Fdir", navn: "Fiskeridirektoratet – yrkesfiske", url: "https://www.fiskeridir.no/yrkesfiske" },
  fdirTapt: { type: "Fdir", navn: "Meld tapt redskap (yrkesfiskere)", url: "https://www.fiskeridir.no/yrkesfiske/havmiljoe/meld-tapt-redskap-for-yrkesfiskere" },
  fdirJ: { type: "Fdir", navn: "J-meldinger – gjeldende reguleringer", url: "https://www.fiskeridir.no/yrkesfiske/j-meldinger" },
  hosting: { type: "Lovdata", navn: "Høstingsforskriften – minstemål, redskap og merking", url: "https://lovdata.no/dokument/SF/forskrift/2021-12-23-3910" },
  kvalitet: { type: "Lovdata", navn: "Forskrift om kvalitet på fisk og fiskevarer", url: "https://lovdata.no/dokument/SF/forskrift/2013-06-28-844" },
  ers: { type: "Lovdata", navn: "ERS-forskriften – posisjonsrapportering og elektronisk rapportering", url: "https://lovdata.no/dokument/SF/forskrift/2009-12-21-1743" },
  mattilsynet: { type: "Mattilsynet", navn: "Bløgging og sløying", url: "https://www.mattilsynet.no/mat-og-drikke/matproduksjon/fisk-og-sjomat/regler-ved-fiske-landing-og-omsetning-av-fisk/blogging-og-sloying" },
  rafisk: { type: "Råfisklaget", navn: "Norges Råfisklag – kvalitet", url: "https://www.rafisklaget.no/" },
  hi: { type: "HI", navn: "Havforskningsinstituttet – fisk og skalldyr", url: "https://www.hi.no/hi/temasider/arter" },
  kystverket: { type: "Kystverket", navn: "Fyr, lykter og sjømerker", url: "https://www.kystverket.no/sjovegen/fyr-lykter-og-sjomerker/" },
  kystverketIala: { type: "Kystverket", navn: "IALA-omleggingen av sektorfyr er fullført", url: "https://www.kystverket.no/nyheter/iala-omleggingen-av-sjomerking-langs-norskekysten-er-fullfort" },
  hrs: { type: "HRS", navn: "Hovedredningssentralen – Kystradio", url: "https://www.hovedredningssentralen.no/kystradio/" },
  ndla: { type: "NDLA", navn: "NDLA – Fiske og fangst (Vg1 naturbruk)", url: "https://ndla.no/nb/e/naturbasert-produksjon-og-tjenesteyting-na-nab-vg1/fiske-og-fangst/bd2249c857" },
  redskapshefte: { type: "Fdir", navn: "Redskapshefte – seleksjonsinnretninger i fiskeredskaper", url: "https://www.fiskeridir.no/yrkesfiske" },
  snlLott: { type: "SNL", navn: "Store norske leksikon – lottfiske", url: "https://snl.no/lottfiske" },
  vilbli: { type: "Vilbli", navn: "Vilbli – fiske og fangst, fag- og timefordeling", url: "https://www.vilbli.no/nb/nb/no/fiske-og-fangst-fag-og-timefordeling/program/v.na/v.naffa2----/p2" }
};

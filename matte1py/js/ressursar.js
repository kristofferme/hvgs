/* Bilete, lenker og videoar per kapittel.
   Bilete blir henta frå Wikimedia Commons (fri lisens, sjå filsida for
   fotograf og lisens). Videoar: legg til { yt: 'YouTube-ID', tittel, kjelde }
   så blir dei viste som klikk-for-å-spele. */
(function () {
  const C = (fil) => ({ src: 'https://commons.wikimedia.org/wiki/Special:FilePath/' + encodeURIComponent(fil) + '?width=1400', side: 'https://commons.wikimedia.org/wiki/File:' + encodeURIComponent(fil.replace(/ /g, '_')) });
  const NDLA_NA = { tittel: 'Matematikk 1P-Y på NDLA (naturbruk)', url: 'https://ndla.no/nn/utdanning/naturbruk/d23305736cde', kjelde: 'NDLA' };
  const EKSAMEN = { tittel: 'Eksempeloppgåver 1P-Y frå Udir (hausten 2021, PDF)', url: 'https://www.matematikk.net/res/eksamen/LK20/Eksempeloppgaver_1PY_høsten_2021.pdf', kjelde: 'matematikk.net' };
  MT.ressursar = {
    tal: { bilete: Object.assign(C('Round bales at Ullsfjorden, Lyngen, Troms, Norway, 2014 August.jpg'), { tekst: 'Rundballar i Lyngen. Kor mange er det, og kva kostar dei? Overslag er gull verdt på garden.' }),
      lenker: [{ tittel: 'Prosent og prosentvis vekst (tal og algebra)', url: 'https://ndla.no/e/matematikk-1p-y---fd/prosent-og-prosentvis-vekst/6372f35945', kjelde: 'NDLA' }, NDLA_NA, { tittel: 'GeoGebra-bok for 1P', url: 'https://mat.geogebra.org/material/show/id/ufx2kmdz', kjelde: 'GeoGebra' }], video: [] },
    einingar: { bilete: Object.assign(C('Rundballer ved Sørumsgata, Ringerike.jpg'), { tekst: 'Areal i dekar, masse i tonn og tid i timar – einingane er overalt på garden.' }),
      lenker: [{ tittel: 'Kva kan du om måling av lengder? (1P-Y NA)', url: 'https://ndla.no/r/matematikk-1p-y---na/hva-kan-du-om-maling-av-lengder/85b8bbeeea', kjelde: 'NDLA' }, NDLA_NA], video: [] },
    forhold: { bilete: Object.assign(C('Storseisundet bridge.jpg'), { tekst: 'Storseisundbrua på Atlanterhavsvegen, like ved Hustadvika. På eit kart i 1 : 50 000 er brua under 1 cm lang.' }),
      lenker: [{ tittel: 'Kart og arbeidsteikningar', url: 'https://ndla.no/en/subjects/subject:29/topic:1:165344/topic:1:165378/resource:1:120944', kjelde: 'NDLA' }, { tittel: 'Kan du finne forholdet mellom ulike storleikar?', url: 'https://ndla.no/en/subjects/subject:29/topic:1:165344/topic:1:165378/resource:1:127320', kjelde: 'NDLA' }], video: [] },
    prosent: { bilete: Object.assign(C('Red deer stags.jpg'), { tekst: 'Hjortebestanden veks med ein viss prosent per år – eit typisk døme på eksponentiell vekst.' }),
      lenker: [{ tittel: 'Prosent og prosentvis vekst', url: 'https://ndla.no/e/matematikk-1p-y---fd/prosent-og-prosentvis-vekst/6372f35945', kjelde: 'NDLA' }, { tittel: 'Kva kan du om vekstfaktor og prosentvis vekst? (oppgåver)', url: 'https://ndla.no/nn/r/matematikk-1p-y---dt/hva-kan-du-om-vekstfaktor-og-prosentvis-vekst/6dffd33165', kjelde: 'NDLA' }, { tittel: 'Prosentrekning', url: 'https://snl.no/prosentregning', kjelde: 'Store norske leksikon' }], video: [] },
    geometri: { bilete: Object.assign(C('Sheep on Korgfjellet 20090628 D.JPG'), { tekst: 'Sau på beite. Kor stort er beitet, og kor mykje gjerde trengst?' }),
      lenker: [{ tittel: 'Pytagoras-setninga', url: 'https://ndla.no/en/e/mathematics-1p-y---dt/pytagoras-setning/eff86a5fd4', kjelde: 'NDLA' }, { tittel: 'Kva kan du om Pytagoras-setninga? (naturbruk)', url: 'https://ndla.no/nn/r/matematikk-1t-y---na/hva-kan-du-om-pytagoras-setning/f0a68b3a4b', kjelde: 'NDLA' }, { tittel: 'Pytagoras-setninga i GeoGebra', url: 'https://mat.geogebra.org/material/show/id/UMCzVxpE', kjelde: 'GeoGebra' }], video: [] },
    volum: { bilete: Object.assign(C('Fish farming on Astafjorden in Gratangen, Troms og Finnmark, Norway, 2022 June.jpg'), { tekst: 'Oppdrettsmerder i Astafjorden. Volumet avgjer kor mykje fisk som kan stå i kvar merd.' }),
      bilete2: Object.assign(C('Field with large round bales in white plastic.jpg'), { tekst: 'Rundballar er sylindrar. Kor mange m³ surfôr ligg på dette jordet?' }),
      lenker: [{ tittel: 'Volum og overflate (1P-Y)', url: 'https://ndla.no/nn/subject:1:947772c4-d806-40d9-95b7-6dc855a37e13/topic:3:c94055f1-8db6-4798-87ec-09277c769328/topic:3:160439b0-1530-4cc3-a743-9b32fd4fe8c7', kjelde: 'NDLA' }, { tittel: 'Volum og overflater (kompendium, PDF)', url: 'https://www.matematikk.net/res/hellerud/1617/1P/1P_Kap6_Volum_og_overflater.pdf', kjelde: 'matematikk.net' }], video: [] },
    funksjonar: { bilete: Object.assign(C('Ford tractor, Sweden.jpg'), { tekst: 'Leige av traktor: fastpris pluss timepris er ein lineær funksjon.' }),
      lenker: [{ tittel: 'Stigingstal og konstantledd', url: 'https://ndla.no/en/subject:1:9031c947-8761-4db7-ab02-33dc3a8ba2e2/topic:7:75212099-ff27-49a0-84b9-1839ec92771c/topic:7:645d6537-5fa7-4a71-b623-f6601f8f9ee5/resource:1:13549', kjelde: 'NDLA' }, { tittel: 'Kva kan du om lineære funksjonar? (oppgåver)', url: 'https://ndla.no/en/r/mathematics-1p/hva-kan-du-om-lineare-funksjoner/7046a4832b', kjelde: 'NDLA' }],
      video: [{ yt: 'U9PdErV7idw', tittel: 'Stigningstall og konstantledd for lineære funksjoner', kjelde: 'NRK Skole' }] },
    statistikk: { bilete: Object.assign(C('Torskefjorden with fish farms and fireweed.jpg'), { tekst: 'Fangst, mjølk, avling, vekt – på ein gard og i havbruk blir det samla inn mykje data.' }),
      lenker: [{ tittel: 'Tre viktige sentralmål: gjennomsnitt, median og typetal', url: 'https://www.ssb.no/ssb-skole/undervisningsopplegg/om-sentralmalene-gjennomsnitt-median-og-typetall/tre-viktige-sentralmal-er-gjennomsnitt-median-og-typetall', kjelde: 'SSB skole' }, { tittel: 'Kva kan du om sentralmål? (oppgåver)', url: 'https://ndla.no/r/matematikk-2p/hva-kan-du-om-sentralmal/b05600167a', kjelde: 'NDLA' }], video: [] },
    okonomi: { bilete: null,
      lenker: [{ tittel: 'Økonomi i 1P-Y: rekneark, lønn, budsjett og rekneskap', url: 'https://ndla.no/nb/e/matematikk-1p-y---im/okonomi/d07be3e02a', kjelde: 'NDLA' }, EKSAMEN], video: [] },
    programmering: { bilete: Object.assign(C('Lely Astronaut Display.JPG'), { tekst: 'Ein mjølkerobot følgjer ein algoritme: finn kua, finn spenane, mjølk, registrer. Programmering er òg landbruk.' }),
      lenker: [{ tittel: 'Algoritmar og programmering (Python) i 1P', url: 'https://ndla.no/f/matematikk-1p/08bed615ef2d', kjelde: 'NDLA' }, { tittel: 'Grafisk framstilling og store datasett med Python', url: 'https://ndla.no/en/e/matematikk-1p/grafisk-framstilling-og-store-datasett-med-python/19021e2ab3', kjelde: 'NDLA' }], video: [] },
  };
  MT.ressursar.felles = [EKSAMEN, NDLA_NA];
})();

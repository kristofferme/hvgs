/* Lærersiden: årsplan, vurdering og praktiske tips. */

FF.laererInnhold = function (alle) {
  var esc = FF.esc;
  function kode(m) { return m.fag.toUpperCase() + "·" + m.nr; }
  function lenke(id) { var m = FF.finnModul(id); return m ? '<a class="brikke" href="#' + id + '">' + esc(kode(m)) + "</a>" : ""; }
  var plan = [
    ["Uke 34–39", "Oppstart og sikkerhet", ["fr-01", "fr-02", "fr-03"], "Sikkerhetsgjennomgang om bord første uke. MOB-øvelse tidlig."],
    ["Uke 40–45", "Redskap og fangst om høsten", ["fr-08", "fk-01", "fk-04"], "Høstfiske med garn og line. Fangstbehandling i praksis på hver tur."],
    ["Uke 46–51", "Stabilitet og navigasjon", ["fr-04", "fr-05"], "Mørketid: god tid til sjøkart, regning og simulator."],
    ["Uke 2–7", "Sjøveisregler, vær og forvaltning", ["fr-06", "fr-07", "fk-02", "fk-03"], "Lanterneøvelser i mørket. Skreisesongen starter – følg reguleringene."],
    ["Uke 8–13", "Skreisesong og kvalitet", ["fk-05", "fk-06", "fk-07"], "Besøk mottak. Regn lott på ekte tall fra en tur."],
    ["Uke 14–19", "Motor, vedlikehold og miljø", ["fr-09", "fr-10"], "Vårpuss av skolebåten: vedlikeholdsplan i praksis."],
    ["Hele året", "Yrkesfaglig fordypning", ["yf-01"], "Praksisperioder på fartøy og i bedrift. Praksislogg hver dag."]
  ];
  var h = '<section class="seksjon"><div class="ramme"><div class="seksjon-hode"><div><span class="etikett">Forslag til progresjon</span><h2>Årsplan</h2>' +
    "<p>Planen følger fiskeåret: praktisk fiske om høsten, teori i mørketida, skreisesong og marked på vinteren, og vedlikehold om våren. Flytt modulene etter vær, fartøy og praksisperioder.</p></div></div>" +
    '<div class="tabell-rull"><table class="tabell"><thead><tr><th>Periode</th><th>Tema</th><th>Moduler</th><th>Praktisk</th></tr></thead><tbody>' +
    plan.map(function (p) { return '<tr><td class="sterk mono">' + p[0] + "</td><td>" + p[1] + "</td><td>" + p[2].map(lenke).join(" ") + "</td><td>" + p[3] + "</td></tr>"; }).join("") +
    "</tbody></table></div></div></section>";

  h += '<section class="seksjon"><div class="ramme"><div class="seksjon-hode"><div><span class="etikett">Vurdering</span><h2>Vurdering som passer faget</h2>' +
    "<p>Mye av kompetansen i fiske og fangst vises best med hendene. Bruk quizene og «Kan jeg dette?» som underveisvurdering, og vurder de praktiske oppdragene som hovedgrunnlag.</p></div></div>" +
    '<div class="tabell-rull"><table class="tabell"><thead><tr><th>Form</th><th>Passer til</th><th>Slik gjør du det</th></tr></thead><tbody>' +
    [["Praktisk vurdering om bord", "Setting og haling, bløgging, motorsjekk, MOB-øvelse, kranløft", "Bruk sjekklistene i oppdragene som kriterier. Observer, og gi muntlig tilbakemelding på stedet."],
     ["Muntlig på dekk", "Stabilitet, sjøveisregler, sikkerhetsstyring", "Still spørsmål mens eleven jobber: «Hva skjer med G nå?» «Hvem viker her?»"],
     ["Dokumentasjon", "Reiseplan, SJA, maskinlogg, temperaturlogg, praksislogg", "Eleven leverer i Teams. Vurder fullstendighet og refleksjon."],
     ["Regning", "KG og GM, fart–distanse–tid, lott, utbytte", "Regneoppgavene i modulene gir umiddelbar tilbakemelding. Lag egne tall fra skolebåten."],
     ["Selvvurdering", "Alle moduler", "«Kan jeg dette?» lagres på elevens enhet. Be eleven vise deg lista i samtalen."]
    ].map(function (r) { return '<tr><td class="sterk">' + r[0] + "</td><td>" + r[1] + "</td><td>" + r[2] + "</td></tr>"; }).join("") +
    "</tbody></table></div></div></section>";

  h += '<section class="seksjon"><div class="ramme"><div class="seksjon-hode"><div><span class="etikett">Praktisk</span><h2>Slik bruker du læremiddelet</h2></div></div>' +
    '<dl class="begreper">' +
    [["Uten nett", "Hele læremiddelet er én fil. Skrifter, tegninger og øvinger ligger inne i fila, så den virker om bord uten dekning."],
     ["Egne bilder", "Legg bilder fra deres egne turer i mappa «bilder» og kjør «python3 bygg.py». Da kan modulene vise dem. Se LES-MEG i mappa."],
     ["Illustrasjonsbank", "Alle tegningene kan kopieres som SVG til presentasjoner og prøver. Se lenken under."],
     ["Lenker til moduler", "Hver modul har en egen adresse, for eksempel …#fr-04 for stabilitet. Lim lenken inn i vekeplanen eller i Teams."],
     ["Les høyt", "Elever som strever med lesing, kan få teksten lest høyt med knappen øverst i hver modul."],
     ["Personvern", "Ingen innlogging og ingen data sendes ut. Fremdrift og logg lagres bare i nettleseren på elevens enhet."],
     ["Målform", "Teksten er på bokmål. Ordlista har nynorske og engelske fagord ved siden av hverandre."],
     ["Regelverk", "Tall som endres ofte – minstemål, kvoter og stengte felt – er med vilje ikke skrevet inn. Elevene øver på å finne gjeldende regler selv."]
    ].map(function (x) { return "<div><dt>" + x[0] + "</dt><dd>" + x[1] + "</dd></div>"; }).join("") + "</dl>" +
    '<p style="margin-top:24px"><a class="knapp" href="#figurer">Åpne illustrasjonsbanken</a></p></div></section>';
  return h;
};

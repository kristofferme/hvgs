/* Fiske og fangst Vg2 – visninger, blokker og ruter. */
"use strict";

(function () {
  var $ = FF.$, $$ = FF.$$, esc = FF.esc;
  var FAGREKKE = ["fr", "fk", "yff"];

  /* ---------- Rekkefølge og status ---------- */

  function sorterte() {
    return FF.moduler.slice().sort(function (a, b) {
      var fa = FAGREKKE.indexOf(a.fag), fb = FAGREKKE.indexOf(b.fag);
      return fa !== fb ? fa - fb : a.nr.localeCompare(b.nr);
    });
  }
  FF.alleModuler = sorterte;
  FF.finnModul = function (id) { return FF.moduler.filter(function (m) { return m.id === id; })[0]; };

  FF.status = function (id) {
    var t = FF.tilstand;
    if (t.ferdig[id]) return "ok";
    if (t.sett[id] || t.quiz[id] != null || (t.kanjeg[id] && Object.keys(t.kanjeg[id]).length)) return "paavei";
    return "ny";
  };
  var STATUSTEKST = { ok: "Fullført", paavei: "På vei", ny: "Ikke startet" };

  function kode(m) { return m.fag.toUpperCase() + "·" + m.nr; }

  function maalBrikker(liste, lenke) {
    return (liste || []).map(function (k) {
      var m = FF.maal[k];
      var tittel = m ? esc(m.tekst) : "";
      return (lenke ? '<a class="brikke" href="#laerer" title="' + tittel + '">' : '<span class="brikke" title="' + tittel + '">') +
        esc(k) + (lenke ? "</a>" : "</span>");
    }).join("");
  }

  /* ---------- Skall ---------- */

  var NAV = [
    ["kurs", "Kurs"],
    ["fr", "Fartøy og redskaper"],
    ["fk", "Fangst og kvalitet"],
    ["yff", "Fordypning"],
    ["verktoy", "Verktøy"],
    ["ordliste", "Ordliste"],
    ["laerer", "For lærer"]
  ];

  function skall() {
    var app = document.getElementById("app");
    if (!app) { app = document.createElement("div"); app.id = "app"; document.body.appendChild(app); }
    app.innerHTML =
      '<a class="skjult-visuelt" href="#innhold">Hopp til innholdet</a>' +
      '<header class="topp"><div class="skala" aria-hidden="true"></div>' +
      '<div class="ramme topp-inner">' +
      '<a class="merke" href="#kurs" aria-label="Fiske og fangst Vg2 – til forsiden">' + FF.ikon.fiskeplass +
      '<span class="merke-navn">Fiske og fangst</span><span class="merke-vg">Vg2</span></a>' +
      '<nav class="hovednav" aria-label="Hovedmeny">' +
      NAV.map(function (n) { return '<a href="#' + n[0] + '" data-rute="' + n[0] + '">' + n[1] + "</a>"; }).join("") +
      "</nav>" +
      '<div class="topp-knapper">' +
      '<button class="ikon-knapp meny-knapp" type="button" aria-expanded="false" aria-controls="hovednav">' + FF.ikon.meny + "Meny</button>" +
      '<button class="ikon-knapp tema-knapp" type="button" aria-pressed="false">' + FF.ikon.maane + '<span class="tema-tekst">Dag</span></button>' +
      "</div></div></header>" +
      '<main id="innhold" tabindex="-1"></main>' +
      '<footer class="bunn"><div class="ramme bunn-inner">' +
      "<div><h4>Fiske og fangst Vg2</h4><p>Læremiddel for programfagene i Vg2 fiske og fangst etter læreplan FFA02-03: fartøy og redskaper (337 timer), fangst og kvalitet (140 timer) og yrkesfaglig fordypning (253 timer).</p>" +
      "<p style=\"margin-top:10px\">Regelverk endres. Sjekk alltid gjeldende forskrifter og J-meldinger hos Fiskeridirektoratet, Sjøfartsdirektoratet og Lovdata før du bruker tall fra dette læremiddelet i praksis.</p>" +
      '<p class="koordinat">62°56\'N 007°05\'Ø · Hustadvika · versjon ' + FF.versjon + "</p></div>" +
      "<div><h4>Programfag</h4><ul>" +
      '<li><a href="#fr">Fartøy og redskaper</a></li><li><a href="#fk">Fangst og kvalitet</a></li><li><a href="#yff">Yrkesfaglig fordypning</a></li><li><a href="#verktoy">Verktøy og øvinger</a></li></ul></div>' +
      "<div><h4>Kilder</h4><ul>" +
      '<li><a href="https://www.udir.no/lk20/ffa02-03" target="_blank" rel="noopener">Læreplanen (Udir)</a></li>' +
      '<li><a href="https://www.fiskeridir.no/yrkesfiske" target="_blank" rel="noopener">Fiskeridirektoratet</a></li>' +
      '<li><a href="https://www.sdir.no/naringsfartoy/fartoystyper/fiskefartoy/" target="_blank" rel="noopener">Sjøfartsdirektoratet</a></li>' +
      '<li><a href="https://ndla.no" target="_blank" rel="noopener">NDLA</a></li></ul></div>' +
      "</div></footer>";

    $(".meny-knapp").addEventListener("click", function () {
      var nav = $(".hovednav");
      var apen = nav.classList.toggle("apen");
      this.setAttribute("aria-expanded", apen ? "true" : "false");
    });
    $(".hovednav").id = "hovednav";
    $(".tema-knapp").addEventListener("click", FF.tema.bytt);
    var lagret = FF.tema.hent();
    if (lagret) FF.tema.sett(lagret); else FF.tema.oppdaterKnapp();
    if (window.matchMedia) {
      try { window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", FF.tema.oppdaterKnapp); } catch (e) {}
    }
  }

  /* ---------- Forside ---------- */

  function forside() {
    var alle = sorterte();
    var ferdige = alle.filter(function (m) { return FF.status(m.id) === "ok"; }).length;
    var neste = alle.filter(function (m) { return FF.status(m.id) !== "ok"; })[0];
    var paaVei = alle.filter(function (m) { return FF.status(m.id) === "paavei"; })[0];
    var fortsett = paaVei || neste;
    var etappe = FF.kartdata.etapper[Math.min(ferdige, FF.kartdata.etapper.length - 1)];

    var h = '<div class="ramme"><section class="hero">' +
      '<div class="hero-tekst">' +
      '<p class="etikett"><span>Naturbruk</span><span>Vg2</span><span>Læreplan FFA02-03</span></p>' +
      '<h1>Fiske og fangst <span class="vg">Vg2</span></h1>' +
      '<p class="hero-ingress">Et læremiddel du kan bruke i klasserommet, i verkstedet og om bord. Tegninger, øvinger og sjekklister for alt fra stabilitet og sjøveisregler til bløgging, kvalitet og lott.</p>' +
      '<div class="kurs-status">' +
      '<div class="kurs-status-rad"><span class="stor">' + ferdige + "<small>/" + alle.length + "</small></span>" +
      '<span class="neste">etapper fullført' + (fortsett ? ". " + (paaVei ? "Du holder på med" : "Neste etappe") + ":<strong>" + esc(kode(fortsett)) + " " + esc(fortsett.tittel) + "</strong>" : "<strong>Hele kursen er fullført. God tur!</strong>") + "</span></div>" +
      '<div class="fremdrift-strek" aria-hidden="true">' + alle.map(function (m) { return '<i class="' + (FF.status(m.id) === "ok" ? "ok" : "") + '"></i>'; }).join("") + "</div>" +
      '<div class="knapperad">' +
      (fortsett ? '<a class="knapp" href="#' + fortsett.id + '">' + (paaVei ? "Fortsett" : ferdige ? "Neste etappe" : "Start kurset") + "</a>" : "") +
      '<a class="knapp sekundar" href="#verktoy">Verktøy og øvinger</a></div>' +
      "</div></div>" +
      '<div class="kartfelt">' + FF.fig.kurskart({ ferdige: alle.map(function (m) { return FF.status(m.id) === "ok"; }), moduler: alle }) +
      '<div class="kart-tittel"><span class="etikett">Kursen · ' + alle.length + ' etapper</span><strong>Fra Hustadvika til Vardø</strong>' +
      '<span class="mono">Neste havn: ' + esc(etappe[0]) + "</span></div></div>" +
      "</section></div>";

    // Reiseplanen
    h += '<section class="seksjon" id="reiseplan"><div class="ramme">' +
      '<div class="seksjon-hode"><div><span class="etikett">Reiseplan</span><h2>Etappene i Vg2</h2>' +
      "<p>Hver modul er en etappe langs kysten. Rekkefølgen er et forslag – læreren din bestemmer hvilken etappe dere tar når. Timene er veiledende og summerer til timetallet i læreplanen.</p></div></div>";
    FAGREKKE.forEach(function (f) {
      var fag = FF.fag[f];
      var liste = alle.filter(function (m) { return m.fag === f; });
      h += '<div class="programfag-hode"><h3>' + esc(fag.navn) + '</h3><span class="mono">' + fag.timer + " timer · " + liste.length + (liste.length === 1 ? " modul" : " moduler") + '</span><a class="lenkepil" href="#' + f + '">Om programfaget</a></div>';
      h += reiseplanTabell(liste, alle);
    });
    h += "</div></section>";

    // Verktøy
    h += '<section class="seksjon"><div class="ramme"><div class="seksjon-hode"><div><span class="etikett">Øv med hendene</span><h2>Verktøy og simulatorer</h2>' +
      "<p>Prøv deg fram. Endre lasten og se fartøyet krenge, finn ut hvilke lanterner du ser i mørket, og regn ut lotten etter en tur.</p></div>" +
      '<a class="lenkepil" href="#verktoy">Alle verktøy</a></div>' + verktoyRutenett(["stabilitet", "lanterner", "vikeplikt", "sektorfyr"]) + "</div></section>";

    // Om bord-kort
    h += '<section class="seksjon"><div class="ramme"><div class="seksjon-hode"><div><span class="etikett">Om bord-kort</span><h2>Sjekklister du har med deg</h2>' +
      "<p>Store bokstaver, korte punkter. Laget for å brukes på mobilen – også uten nett.</p></div></div>" +
      '<div class="lommekort-rad">' + FF.lommekort.map(function (k) {
        return '<a class="lommekort' + (k.nod ? " nod" : "") + '" href="#v-' + k.id + '"><span class="lk-kode">' + esc(k.kode) + "</span><h3>" + esc(k.tittel) + "</h3><p>" + esc(k.kort) + "</p></a>";
      }).join("") + "</div></div></section>";

    return h;
  }

  function reiseplanTabell(liste, alle) {
    var h = '<table class="reiseplan"><thead><tr><th>Etappe</th><th>Modul</th><th>Havn</th><th>Mål</th><th>Timer</th><th>Status</th></tr></thead><tbody>';
    liste.forEach(function (m) {
      var i = alle.indexOf(m);
      var havn = FF.kartdata.etapper[i] ? FF.kartdata.etapper[i][0] : "";
      var s = FF.status(m.id);
      h += '<tr class="rad" data-href="#' + m.id + '">' +
        '<td class="rp-wp">' + esc(kode(m)) + "</td>" +
        '<td class="rp-tittel"><a href="#' + m.id + '">' + esc(m.tittel) + "</a><p>" + esc(m.under) + "</p></td>" +
        '<td class="rp-havn">WP ' + String(i + 1).padStart(2, "0") + " · " + esc(havn) + "</td>" +
        '<td><div class="rp-maal">' + maalBrikker(m.maal) + "</div></td>" +
        '<td class="rp-timer">' + m.timer + " t</td>" +
        '<td class="rp-status"><span class="status-pille ' + s + '">' + STATUSTEKST[s] + "</span></td></tr>";
    });
    return h + "</tbody></table>";
  }

  function verktoyRutenett(navn) {
    var liste = navn || Object.keys(FF.verktoy).filter(function (k) { return !FF.verktoy[k].skjult; });
    return '<div class="verktoy-rutenett">' + liste.map(function (k) {
      var v = FF.verktoy[k];
      if (!v) return "";
      return '<a class="verktoy-kort" href="#v-' + k + '"><div class="vk-bilde' + (v.lys ? " lys" : "") + '">' + (v.bilde ? v.bilde() : "") + "</div>" +
        '<div class="vk-tekst"><span class="etikett">' + esc(v.etikett || "Verktøy") + "</span><h3>" + esc(v.tittel) + "</h3><p>" + esc(v.kort) + "</p></div></a>";
    }).join("") + "</div>";
  }

  /* ---------- Programfag ---------- */

  function programfag(f) {
    var fag = FF.fag[f];
    var alle = sorterte();
    var liste = alle.filter(function (m) { return m.fag === f; });
    var maal = Object.keys(FF.maal).filter(function (k) { return FF.maal[k].fag === f; });
    var h = '<header class="sidetopp">' + FF.dybdekurver(f.length * 7) + '<div class="ramme"><span class="etikett">Programfag · ' + fag.timer + " timer</span><h1>" + esc(fag.navn) + "</h1><p>" + esc(fag.ingress) + "</p></div></header>";
    h += '<section class="seksjon"><div class="ramme"><div class="seksjon-hode"><div><span class="etikett">Moduler</span><h2>Etappene</h2></div></div>' + reiseplanTabell(liste, alle) + "</div></section>";
    if (maal.length) {
      h += '<section class="seksjon"><div class="ramme"><div class="seksjon-hode"><div><span class="etikett">Kompetansemål</span><h2>Dette skal du kunne</h2><p>Målene er gjengitt i kortform. Full ordlyd står i læreplanen på udir.no.</p></div></div>' +
        '<div class="tabell-rull"><table class="tabell"><thead><tr><th>Kode</th><th>Eleven skal kunne …</th><th>Moduler</th></tr></thead><tbody>' +
        maal.map(function (k) {
          var mods = alle.filter(function (m) { return (m.maal || []).indexOf(k) > -1; });
          return "<tr><td class=\"sterk mono\">" + k + "</td><td>" + esc(FF.maal[k].tekst) + "</td><td>" +
            mods.map(function (m) { return '<a class="brikke" href="#' + m.id + '">' + esc(kode(m)) + "</a>"; }).join(" ") + "</td></tr>";
        }).join("") + "</tbody></table></div></div></section>";
    }
    if (f === "yff") {
      h += '<section class="seksjon"><div class="ramme"><div class="seksjon-hode"><div><span class="etikett">Praksis</span><h2>Praksisloggen</h2><p>Skriv ned hva du gjorde om bord eller i bedriften. Loggen lagres bare på denne enheten – kopier den til Teams eller OneNote når du er ferdig.</p></div></div><div data-verktoy="praksislogg"></div></div></section>';
    }
    return h;
  }

  /* ---------- Modul ---------- */

  var reg = {};
  function registrer(data) { var id = FF.uid("b"); reg[id] = data; return id; }

  function modul(m) {
    FF.tilstand.sett[m.id] = true; FF.lagre();
    var alle = sorterte();
    var i = alle.indexOf(m);
    var forrige = alle[i - 1], neste = alle[i + 1];
    var fag = FF.fag[m.fag];
    var ctx = { m: m, fig: 0, seksjon: 0, toc: [] };

    var kropp = "";
    if (m.kort && m.kort.length) {
      kropp += '<div class="kort-fortalt" id="kort-fortalt"><span class="etikett">Kort fortalt</span><ul>' +
        m.kort.map(function (k) { return "<li data-les>" + k + "</li>"; }).join("") + "</ul></div>";
    }
    (m.blokker || []).forEach(function (b) { kropp += blokk(b, ctx); });

    // Lærerens egne bilder: bilder/fr-08-garn-på-dekk.jpg vises i modul fr-08
    var egne = Object.keys(FF.bilder).filter(function (k) { return k.toLowerCase().indexOf(m.id + "-") === 0; }).sort();
    if (egne.length) {
      ctx.seksjon += 1;
      ctx.toc.push({ id: "bilder", tekst: "Fra våre turer" });
      kropp += '<h2 id="bilder"><span class="h-nr">' + m.nr + "." + ctx.seksjon + "</span>Fra våre turer</h2>" +
        '<div class="fotogalleri">' + egne.map(function (k) {
          var tekst = k.slice(m.id.length + 1).replace(/\.[a-z]+$/i, "").replace(/[-_]+/g, " ");
          tekst = tekst.charAt(0).toUpperCase() + tekst.slice(1);
          return '<figure class="foto"><img src="' + FF.bilder[k] + '" alt="' + esc(tekst) + '" loading="lazy"><figcaption>' + esc(tekst) + "</figcaption></figure>";
        }).join("") + "</div>";
    }

    if (m.kanjeg && m.kanjeg.length) {
      ctx.seksjon += 1;
      ctx.toc.push({ id: "kanjeg", tekst: "Kan jeg dette?", ovelse: true });
      kropp += '<h2 id="kanjeg" data-les><span class="h-nr">' + m.nr + "." + ctx.seksjon + "</span>Kan jeg dette?</h2>" +
        '<p data-les>Vurder deg selv ærlig. Svarene lagres bare på denne enheten, og du kan endre dem når du har øvd mer.</p>' +
        '<div class="kanjeg" data-kanjeg="' + m.id + '">' + m.kanjeg.map(function (k, j) {
          var v = (FF.tilstand.kanjeg[m.id] || {})[j];
          return '<div class="kanjeg-rad"><p>' + k + '</p><div class="kanjeg-valg" role="group" aria-label="Hvor godt kan du dette?">' +
            ["Ikke ennå", "På vei", "Kan det"].map(function (t, v2) {
              return '<button type="button" data-i="' + j + '" data-v="' + v2 + '" aria-pressed="' + (v === v2 ? "true" : "false") + '">' + t + "</button>";
            }).join("") + "</div></div>";
        }).join("") + "</div>";
    }
    if (m.kilder && m.kilder.length) {
      ctx.seksjon += 1;
      ctx.toc.push({ id: "kilder", tekst: "Kilder og mer å lese" });
      kropp += '<h2 id="kilder"><span class="h-nr">' + m.nr + "." + ctx.seksjon + "</span>Kilder og mer å lese</h2>" +
        '<ul class="kilder">' + m.kilder.map(function (k) {
          var kk = typeof k === "string" ? FF.kilde[k] : k;
          if (!kk) return "";
          return '<li><span class="mono">' + esc(kk.type) + '</span><a href="' + esc(kk.url) + '" target="_blank" rel="noopener">' + esc(kk.navn) + "</a></li>";
        }).join("") + "</ul>";
    }

    kropp += '<nav class="modul-slutt" aria-label="Neste og forrige modul">' +
      '<div class="fullfor"><p><strong>Ferdig med etappen?</strong> Merk den som fullført når du har lest, gjort øvingene og kan det meste i «Kan jeg dette?».</p>' +
      '<button class="knapp fullfor-knapp" type="button" data-id="' + m.id + '">' + (FF.tilstand.ferdig[m.id] ? "Fullført ✓ – angre" : "Merk som fullført") + "</button></div>" +
      (forrige ? '<a href="#' + forrige.id + '"><span class="etikett">← Forrige etappe</span><strong>' + esc(kode(forrige) + " " + forrige.tittel) + "</strong></a>" : "<span></span>") +
      (neste ? '<a class="neste" href="#' + neste.id + '"><span class="etikett">Neste etappe →</span><strong>' + esc(kode(neste) + " " + neste.tittel) + "</strong></a>" : '<a class="neste" href="#kurs"><span class="etikett">Tilbake →</span><strong>Til reiseplanen</strong></a>') +
      "</nav>";

    var toc = '<ul class="innholdsliste">' + (m.kort ? '<li><a href="#kort-fortalt" data-hopp="kort-fortalt">Kort fortalt</a></li>' : "") +
      ctx.toc.map(function (t) { return '<li class="' + (t.ovelse ? "er-ovelse" : "") + '"><a href="#' + t.id + '" data-hopp="' + t.id + '">' + esc(t.tekst) + "</a></li>"; }).join("") + "</ul>";

    var kanjegMini = "";
    if (m.kanjeg && m.kanjeg.length) {
      kanjegMini = '<div class="kanjeg-mini"><span class="etikett">Kan jeg dette?</span><div class="rad" style="grid-template-columns:repeat(' + m.kanjeg.length + ',1fr)">' +
        m.kanjeg.map(function (_, j) { var v = (FF.tilstand.kanjeg[m.id] || {})[j]; return '<i class="' + (v != null ? "v" + v : "") + '"></i>'; }).join("") +
        "</div><p>" + Object.keys(FF.tilstand.kanjeg[m.id] || {}).filter(function (k) { return FF.tilstand.kanjeg[m.id][k] === 2; }).length + " av " + m.kanjeg.length + " sitter</p></div>";
    }

    var h = '<header class="modul-topp">' + FF.dybdekurver(m.nr.charCodeAt(1) + m.fag.length * 11) + '<div class="ramme modul-topp-inner">' +
      '<div class="modul-kode" aria-hidden="true"><small>' + esc(fag.navn) + " · WP " + String(i + 1).padStart(2, "0") + "</small><span>" + m.fag.toUpperCase() + '<span class="kode-nr">' + m.nr + "</span></span></div>" +
      '<div class="modul-overskrift"><div class="smuler"><a href="#kurs">Kurs</a><span>/</span><a href="#' + m.fag + '">' + esc(fag.navn) + "</a></div>" +
      "<h1>" + esc(m.tittel) + '</h1><p class="undertittel">' + esc(m.under) + "</p></div>" +
      '<div class="modul-meta">' +
      '<div class="meta-felt"><span class="etikett">Timer</span><span class="brikke fylt">' + m.timer + " t</span></div>" +
      '<div class="meta-felt"><span class="etikett">Kompetansemål</span>' + maalBrikker(m.maal, true) + "</div>" +
      (m.kjerne ? '<div class="meta-felt"><span class="etikett">Kjerneelement</span>' + m.kjerne.map(function (k) { return '<span class="brikke">' + esc(k) + "</span>"; }).join("") + "</div>" : "") +
      '<div class="knapper"><button class="ikon-knapp les-knapp" type="button" aria-pressed="false">' + FF.ikon.hoyttaler + "Les høyt</button></div>" +
      "</div></div></header>" +
      '<div class="ramme modul-kropp"><aside class="modul-side" aria-label="Innhold i modulen"><div><span class="etikett">I denne etappen</span>' + toc + "</div>" + kanjegMini + "</aside>" +
      '<article class="modul-hoved">' + kropp + "</article></div>";
    return h;
  }

  function figur(b, ctx, innhold) {
    ctx.fig += 1;
    var nr = ctx.m.nr.replace(/^0/, "") + "." + ctx.fig;
    return '<figure class="fig"' + (b.id ? ' id="' + b.id + '"' : "") + ">" + innhold +
      (b.cap ? '<figcaption><span class="fig-nr">Figur ' + nr + "</span><span>" + b.cap + "</span></figcaption>" : "") + "</figure>";
  }

  function tegn(navn, a) {
    var f = FF.fig[navn];
    if (!f) return '<p class="mono">[mangler figur: ' + esc(navn) + "]</p>";
    try { return f(a || {}); } catch (e) { console.error(e); return '<p class="mono">[figurfeil: ' + esc(navn) + "]</p>"; }
  }

  function blokk(b, ctx) {
    switch (b.t) {
      case "ingress":
        return '<p class="ingress" data-les>' + b.html + "</p>";
      case "h2": {
        ctx.seksjon += 1;
        var id = b.id || "s" + ctx.seksjon;
        ctx.toc.push({ id: id, tekst: b.tekst });
        return '<h2 id="' + id + '" data-les><span class="h-nr">' + ctx.m.nr + "." + ctx.seksjon + "</span>" + b.tekst + "</h2>";
      }
      case "h3":
        return "<h3 data-les>" + b.tekst + "</h3>";
      case "p":
        return "<p data-les>" + b.html + "</p>";
      case "ul":
        return '<ul class="merkeliste">' + b.items.map(function (x) { return "<li data-les>" + x + "</li>"; }).join("") + "</ul>";
      case "fig":
        return figur(b, ctx, '<div class="fig-flate' + (b.flate ? " " + b.flate : "") + (b.rull ? " fig-rull" : "") + '">' + tegn(b.fig, b.a) + "</div>");
      case "figpar":
        return '<div class="fig-par">' + b.figs.map(function (f) {
          return figur(f, ctx, '<div class="fig-flate' + (f.flate ? " " + f.flate : "") + '">' + tegn(f.fig, f.a) + "</div>");
        }).join("") + "</div>";
      case "hotspot": {
        var hid = registrer(b);
        return figur(b, ctx, '<div class="fig-flate"><div class="hotspot" data-hotspot="' + hid + '">' + tegn(b.fig, b.a) +
          b.punkter.map(function (p, j) {
            return '<button type="button" class="hotspot-punkt" style="left:' + p[0] + "%;top:" + p[1] + '%" data-j="' + j + '" aria-expanded="false" aria-label="' + esc(p[2]) + '">' + (j + 1) + "</button>";
          }).join("") + '</div><div class="hotspot-info" aria-live="polite"><span class="nr">?</span><strong>Trykk på punktene</strong><p>Utforsk figuren. <span class="hotspot-teller">0 av ' + b.punkter.length + " utforsket</span></p></div></div>");
      }
      case "foto": {
        var src = FF.bilder[b.fil];
        if (!src) return "";
        return '<figure class="foto"><img src="' + src + '" alt="' + esc(b.alt || b.cap || "") + '" loading="lazy">' + (b.cap ? "<figcaption>" + b.cap + "</figcaption>" : "") + "</figure>";
      }
      case "notat": {
        var ik = { regel: FF.ikon.paragraf, fare: FF.ikon.fare, praksis: FF.ikon.hanske, lokalt: FF.ikon.lokal }[b.type] || "";
        var et = b.etikett || { regel: "Regelverk", fare: "Fare", praksis: "Praksis", lokalt: "Lokalt", info: "Merk" }[b.type || "info"];
        return '<aside class="notat ' + (b.type || "info") + '" data-les><span class="notat-etikett">' + ik + esc(et) + "</span>" +
          (b.tittel ? "<h4>" + b.tittel + "</h4>" : "") + b.html + "</aside>";
      }
      case "steg":
        return (b.tittel ? '<h3 class="steg-tittel" data-les>' + b.tittel + "</h3>" : "") + '<ol class="steg">' + b.items.map(function (s) {
          return "<li data-les><div><h4>" + s[0] + "</h4>" + (s[1] ? "<p>" + s[1] + "</p>" : "") + "</div></li>";
        }).join("") + "</ol>";
      case "tabell":
        return '<div class="tabell-rull"><table class="tabell">' + (b.tittel ? "<caption>" + b.tittel + "</caption>" : "") +
          "<thead><tr>" + b.hode.map(function (x, j) { return '<th class="' + ((b.tall || []).indexOf(j) > -1 ? "tall" : "") + '">' + x + "</th>"; }).join("") + "</tr></thead><tbody>" +
          b.rader.map(function (r) { return "<tr>" + r.map(function (x, j) { return '<td class="' + ((b.tall || []).indexOf(j) > -1 ? "tall" : "") + (j === 0 && b.sterk ? " sterk" : "") + '">' + x + "</td>"; }).join("") + "</tr>"; }).join("") +
          "</tbody></table></div>";
      case "begreper":
        return '<dl class="begreper">' + b.items.map(function (x) {
          return "<div><dt>" + x[0] + (x[2] ? '<span class="nn">nn: ' + x[2] + "</span>" : "") + "</dt><dd>" + x[1] + "</dd></div>";
        }).join("") + "</dl>";
      case "tenk":
        return '<div class="tenk" data-les>' + FF.ikon.sporsmal + '<div><span class="etikett">' + (b.etikett || "Tenk og diskuter") + "</span><p>" + b.html + "</p></div></div>";
      case "quiz": {
        var qid = registrer(b);
        var oid = "ov" + qid;
        ctx.toc.push({ id: oid, tekst: b.tittel || "Test deg selv", ovelse: true });
        return '<section class="ovelse" id="' + oid + '" data-quiz="' + qid + '"><div class="ovelse-hode"><span class="etikett">Test deg selv</span><span class="mono">' + b.sp.length + " spørsmål</span><h3>" + (b.tittel || "Sjekk hva du har lært") + '</h3></div><div class="ovelse-kropp"></div><div class="ovelse-fot"></div></section>';
      }
      case "sorter": {
        var sid = registrer(b);
        var soid = "ov" + sid;
        ctx.toc.push({ id: soid, tekst: b.tittel, ovelse: true });
        return '<section class="ovelse" id="' + soid + '" data-sorter="' + sid + '"><div class="ovelse-hode"><span class="etikett">Rekkefølge</span><span class="mono">' + b.items.length + " trinn</span><h3>" + b.tittel + '</h3></div><div class="ovelse-kropp"></div><div class="ovelse-fot"></div></section>';
      }
      case "oppdrag": {
        var pid = "opp-" + ctx.m.id + "-" + (ctx.oppdrag = (ctx.oppdrag || 0) + 1);
        ctx.toc.push({ id: pid, tekst: "Oppdrag: " + b.tittel, ovelse: true });
        var huket = FF.tilstand.sjekk[pid] || {};
        return '<section class="oppdrag" id="' + pid + '"><div class="oppdrag-hode"><div><span class="etikett">Praktisk oppdrag</span><h3>' + b.tittel + "</h3></div>" +
          '<div class="oppdrag-felt"><div><span>Sted</span><strong>' + esc(b.sted || "Om bord") + "</strong></div><div><span>Tid</span><strong>" + esc(b.tid || "1–2 t") + "</strong></div><div><span>Gruppe</span><strong>" + esc(b.gruppe || "2–3 elever") + "</strong></div></div></div>" +
          '<div class="oppdrag-kropp"><p data-les>' + b.html + "</p>" +
          (b.sjekk ? '<ul class="sjekkliste" data-sjekk="' + pid + '">' + b.sjekk.map(function (s, j) {
            return '<li><label><input type="checkbox" data-j="' + j + '" id="' + pid + "-" + j + '"' + (huket[j] ? " checked" : "") + "><span>" + s + "</span></label></li>";
          }).join("") + "</ul>" : "") +
          (b.lever ? '<p class="mono" style="font-size:.8rem;color:var(--blekk-2)">Lever: ' + b.lever + "</p>" : "") +
          "</div></section>";
      }
      case "regn": {
        var rid = registrer(b);
        var roid = "ov" + rid;
        ctx.toc.push({ id: roid, tekst: b.tittel || "Regn selv", ovelse: true });
        return '<section class="ovelse" id="' + roid + '" data-regn="' + rid + '"><div class="ovelse-hode"><span class="etikett">Regn selv</span><span class="mono">' + b.oppg.length + " oppgaver</span><h3>" + (b.tittel || "Regneoppgaver") + "</h3></div>" +
          '<div class="ovelse-kropp">' + (b.intro ? '<p class="sorter-hint">' + b.intro + "</p>" : "") + '<ol class="regn-liste">' + b.oppg.map(function (o, j) {
            var fid = roid + "-" + j;
            return '<li class="regn-oppg" data-j="' + j + '"><p>' + o.q + "</p>" +
              '<div class="regn-svar"><label class="skjult-visuelt" for="' + fid + '">Svar</label><input id="' + fid + '" inputmode="decimal" autocomplete="off" placeholder="Svar">' +
              '<span class="regn-enhet">' + (o.enhet || "") + '</span><button type="button" class="knapp liten sekundar">Sjekk</button></div><p class="regn-tilbake" aria-live="polite"></p></li>';
          }).join("") + "</ol></div></section>";
      }
      case "verktoy":
        return '<div data-verktoy="' + b.navn + '"></div>';
      case "html":
        return b.html;
      default:
        return "";
    }
  }

  /* ---------- Binding av interaktive blokker ---------- */

  function bind(rot) {
    $$("[data-quiz]", rot).forEach(function (el) { quiz(el, reg[el.getAttribute("data-quiz")]); });
    $$("[data-sorter]", rot).forEach(function (el) { sorter(el, reg[el.getAttribute("data-sorter")]); });
    $$("[data-hotspot]", rot).forEach(function (el) { hotspot(el, reg[el.getAttribute("data-hotspot")]); });
    $$("[data-regn]", rot).forEach(function (el) { regn(el, reg[el.getAttribute("data-regn")]); });
    $$("[data-sjekk]", rot).forEach(function (ul) {
      var id = ul.getAttribute("data-sjekk");
      ul.addEventListener("change", function (e) {
        var j = e.target.getAttribute("data-j");
        FF.tilstand.sjekk[id] = FF.tilstand.sjekk[id] || {};
        FF.tilstand.sjekk[id][j] = e.target.checked;
        FF.lagre();
      });
    });
    $$("[data-kanjeg]", rot).forEach(function (el) {
      var id = el.getAttribute("data-kanjeg");
      el.addEventListener("click", function (e) {
        var k = e.target.closest("button");
        if (!k) return;
        var i = k.getAttribute("data-i"), v = +k.getAttribute("data-v");
        FF.tilstand.kanjeg[id] = FF.tilstand.kanjeg[id] || {};
        FF.tilstand.kanjeg[id][i] = v;
        FF.lagre();
        $$('button[data-i="' + i + '"]', el).forEach(function (b) { b.setAttribute("aria-pressed", b === k ? "true" : "false"); });
        var mini = $(".kanjeg-mini", document);
        if (mini) {
          var m = FF.finnModul(id);
          $$("i", mini).forEach(function (ii, j) { var vv = FF.tilstand.kanjeg[id][j]; ii.className = vv != null ? "v" + vv : ""; });
          $("p", mini).textContent = Object.keys(FF.tilstand.kanjeg[id]).filter(function (q) { return FF.tilstand.kanjeg[id][q] === 2; }).length + " av " + m.kanjeg.length + " sitter";
        }
      });
    });
    $$("[data-verktoy]", rot).forEach(function (el) {
      var v = FF.verktoy[el.getAttribute("data-verktoy")];
      if (v && v.mount) { try { v.mount(el); } catch (e) { console.error(e); el.innerHTML = '<p class="mono">Verktøyet kunne ikke startes.</p>'; } }
    });
    $$("tr[data-href]", rot).forEach(function (tr) {
      tr.addEventListener("click", function (e) { if (!e.target.closest("a")) location.hash = tr.getAttribute("data-href"); });
    });
    $$("[data-hopp]", rot).forEach(function (a) {
      a.addEventListener("click", function (e) {
        e.preventDefault();
        var mål = document.getElementById(a.getAttribute("data-hopp"));
        if (mål) mål.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });
    var fk = $(".fullfor-knapp", rot);
    if (fk) fk.addEventListener("click", function () {
      var id = fk.getAttribute("data-id");
      if (FF.tilstand.ferdig[id]) { delete FF.tilstand.ferdig[id]; fk.textContent = "Merk som fullført"; FF.melding("Etappen er ikke lenger merket som fullført."); }
      else { FF.tilstand.ferdig[id] = true; fk.textContent = "Fullført ✓ – angre"; FF.melding("Etappe fullført. Kursen er oppdatert."); }
      FF.lagre();
    });
    var les = $(".les-knapp", rot);
    if (les) les.addEventListener("click", function () { FF.tale.les($$("[data-les]", $(".modul-hoved")), les); });
  }

  function quiz(el, b) {
    var kropp = $(".ovelse-kropp", el), fot = $(".ovelse-fot", el);
    var id = FF.rute;
    function start() {
      var sp = b.bland === false ? b.sp : FF.bland(b.sp);
      var svar = 0, riktige = 0;
      kropp.innerHTML = sp.map(function (s, j) {
        var alt = s.a.map(function (t, k) { return { t: t, k: k }; });
        if (s.fast !== true) alt = FF.bland(alt);
        return '<div class="quiz-sp" data-j="' + j + '"><p class="quiz-sporsmal"><span class="mono">' + String(j + 1).padStart(2, "0") + "</span><span>" + s.q + "</span></p>" +
          (s.fig ? '<div class="fig-flate">' + tegn(s.fig, s.figa) + "</div>" : "") +
          '<div class="quiz-alt">' + alt.map(function (a, n) {
            return '<button type="button" data-k="' + a.k + '"><span class="bokstav">' + "ABCDE"[n] + "</span><span>" + a.t + '</span><span class="merk" aria-hidden="true"></span></button>';
          }).join("") + "</div></div>";
      }).join("");
      fot.innerHTML = '<span class="quiz-resultat">0 av ' + sp.length + ' besvart</span>';
      $$(".quiz-sp", kropp).forEach(function (q) {
        var s = sp[+q.getAttribute("data-j")];
        q.addEventListener("click", function (e) {
          var k = e.target.closest("button");
          if (!k || k.disabled) return;
          var valgt = +k.getAttribute("data-k");
          var ok = valgt === s.r;
          svar += 1; if (ok) riktige += 1;
          $$("button", q).forEach(function (bb) {
            bb.disabled = true;
            var kk = +bb.getAttribute("data-k");
            if (kk === s.r) { bb.classList.add("riktig"); $(".merk", bb).textContent = "✓"; }
            else if (bb === k) { bb.classList.add("feil"); $(".merk", bb).textContent = "✕"; }
          });
          var f = document.createElement("p");
          f.className = "quiz-forkl" + (ok ? "" : " feil");
          f.innerHTML = "<strong>" + (ok ? "Riktig. " : "Ikke helt. ") + "</strong>" + (s.f || "");
          q.appendChild(f);
          if (svar === sp.length) {
            var gammel = FF.tilstand.quiz[b._mod || id];
            FF.tilstand.quiz[b._mod || id] = Math.max(gammel || 0, Math.round(riktige / sp.length * 100));
            FF.lagre();
            fot.innerHTML = '<span class="quiz-resultat">' + riktige + " av " + sp.length + " riktige" + '<span class="mono">' + (riktige === sp.length ? "Full pott." : riktige >= sp.length * 0.7 ? "Godt jobba." : "Les gjennom igjen og prøv på nytt.") + "</span></span>" +
              '<button type="button" class="knapp liten sekundar">Ta testen igjen</button>';
            $("button", fot).addEventListener("click", start);
          } else {
            $(".quiz-resultat", fot).textContent = svar + " av " + sp.length + " besvart · " + riktige + " riktige";
          }
        });
      });
    }
    start();
  }

  function sorter(el, b) {
    var kropp = $(".ovelse-kropp", el), fot = $(".ovelse-fot", el);
    function start() {
      var rekke = [];
      var blandet = FF.bland(b.items.map(function (t, i) { return { t: t, i: i }; }));
      kropp.innerHTML = '<p class="sorter-hint">' + (b.hint || "Trykk på trinnene i den rekkefølgen de skal gjøres. Trykk igjen for å angre.") + '</p><ol class="sorter-liste">' +
        blandet.map(function (x) { return '<li><button type="button" data-i="' + x.i + '"><span class="plass">·</span><span>' + x.t + "</span></button></li>"; }).join("") + "</ol>";
      fot.innerHTML = '<button type="button" class="knapp liten" disabled>Sjekk rekkefølgen</button><span class="mono" style="font-size:.8rem;color:var(--blekk-3)">0 av ' + b.items.length + " valgt</span>";
      var sjekk = $("button", fot), teller = $(".mono", fot);
      function tegnPlass() {
        $$(".sorter-liste button", kropp).forEach(function (k) {
          var i = +k.getAttribute("data-i"), p = rekke.indexOf(i);
          k.classList.toggle("valgt", p > -1);
          k.classList.remove("riktig", "feil");
          $(".plass", k).textContent = p > -1 ? p + 1 : "·";
        });
        sjekk.disabled = rekke.length !== b.items.length;
        teller.textContent = rekke.length + " av " + b.items.length + " valgt";
      }
      kropp.addEventListener("click", function (e) {
        var k = e.target.closest(".sorter-liste button");
        if (!k) return;
        var i = +k.getAttribute("data-i"), p = rekke.indexOf(i);
        if (p > -1) rekke.splice(p, 1); else rekke.push(i);
        tegnPlass();
      });
      sjekk.addEventListener("click", function () {
        var riktige = 0;
        $$(".sorter-liste button", kropp).forEach(function (k) {
          var i = +k.getAttribute("data-i"), p = rekke.indexOf(i);
          var ok = p === i;
          if (ok) riktige += 1;
          k.classList.remove("valgt");
          k.classList.add(ok ? "riktig" : "feil");
        });
        fot.innerHTML = '<span class="quiz-resultat">' + riktige + " av " + b.items.length + " på riktig plass</span>" +
          (riktige < b.items.length ? '<button type="button" class="knapp liten sekundar vis">Vis fasit</button>' : "") +
          '<button type="button" class="knapp liten sekundar igjen">Prøv igjen</button>';
        var vis = $(".vis", fot);
        if (vis) vis.addEventListener("click", function () {
          var ol = $(".sorter-liste", kropp);
          ol.innerHTML = b.items.map(function (t, i) { return '<li><button type="button" class="riktig" disabled><span class="plass">' + (i + 1) + "</span><span>" + t + "</span></button></li>"; }).join("");
          vis.remove();
        });
        $(".igjen", fot).addEventListener("click", start);
      });
    }
    start();
  }

  // Regneoppgaver: godtar komma og punktum, og en liten toleranse.
  function regn(el, b) {
    $$(".regn-oppg", el).forEach(function (li) {
      var o = b.oppg[+li.getAttribute("data-j")];
      var inp = $("input", li), knapp = $("button", li), ut = $(".regn-tilbake", li);
      var forsok = 0;
      function sjekk() {
        var v = parseFloat(String(inp.value).replace(/\s/g, "").replace(",", "."));
        if (isNaN(v)) { ut.className = "regn-tilbake"; ut.textContent = "Skriv inn et tall."; return; }
        var tol = o.tol != null ? o.tol : Math.max(Math.abs(o.svar) * 0.02, 0.01);
        forsok += 1;
        if (Math.abs(v - o.svar) <= tol) {
          ut.className = "regn-tilbake ok";
          ut.innerHTML = "<strong>Riktig.</strong> " + (o.forkl || "");
          inp.classList.add("ok"); inp.classList.remove("feil");
        } else {
          ut.className = "regn-tilbake feil";
          ut.innerHTML = forsok < 2 ? "<strong>Ikke helt.</strong> " + (o.hint || "Sjekk utregningen og prøv igjen.") :
            "<strong>Fasit: " + FF.tall(o.svar, o.des == null ? 1 : o.des) + " " + (o.enhet || "") + ".</strong> " + (o.forkl || "");
          inp.classList.add("feil"); inp.classList.remove("ok");
        }
      }
      knapp.addEventListener("click", sjekk);
      inp.addEventListener("keydown", function (e) { if (e.key === "Enter") sjekk(); });
    });
  }

  function hotspot(el, b) {
    var boks = el.parentNode;
    var info = $(".hotspot-info", boks);
    var sett = {};
    el.addEventListener("click", function (e) {
      var k = e.target.closest(".hotspot-punkt");
      if (!k) return;
      var j = +k.getAttribute("data-j");
      var p = b.punkter[j];
      sett[j] = true;
      $$(".hotspot-punkt", el).forEach(function (x) { x.setAttribute("aria-expanded", x === k ? "true" : "false"); });
      k.classList.add("sett");
      info.innerHTML = '<span class="nr">' + (j + 1) + "</span><strong>" + p[2] + "</strong><p>" + p[3] + ' <span class="hotspot-teller">' + Object.keys(sett).length + " av " + b.punkter.length + " utforsket</span></p>";
    });
  }

  /* ---------- Verktøy, ordliste, lærer ---------- */

  function verktoyOversikt() {
    return '<header class="sidetopp">' + FF.dybdekurver(21) + '<div class="ramme"><span class="etikett">Øv med hendene</span><h1>Verktøy og øvinger</h1>' +
      "<p>Simulatorer, kalkulatorer og øvinger du kan bruke alene, i par eller på tavla. Alt virker uten nett.</p></div></header>" +
      '<section class="seksjon"><div class="ramme">' + verktoyRutenett() + "</div></section>" +
      '<section class="seksjon"><div class="ramme"><div class="seksjon-hode"><div><span class="etikett">Om bord-kort</span><h2>Sjekklister</h2></div></div><div class="lommekort-rad">' +
      FF.lommekort.map(function (k) { return '<a class="lommekort' + (k.nod ? " nod" : "") + '" href="#v-' + k.id + '"><span class="lk-kode">' + esc(k.kode) + "</span><h3>" + esc(k.tittel) + "</h3><p>" + esc(k.kort) + "</p></a>"; }).join("") +
      "</div></div></section>";
  }

  function verktoySide(navn) {
    var v = FF.verktoy[navn];
    if (!v) return ikkeFunnet();
    var mods = sorterte().filter(function (m) { return (m.verktoy || []).indexOf(navn) > -1; });
    return '<header class="sidetopp">' + FF.dybdekurver(navn.length * 5) + '<div class="ramme"><span class="etikett">' + esc(v.etikett || "Verktøy") + "</span><h1>" + esc(v.tittel) + "</h1><p>" + esc(v.ingress || v.kort) + "</p></div></header>" +
      '<section class="seksjon"><div class="ramme"><div data-verktoy="' + navn + '"></div>' +
      (mods.length ? '<div style="margin-top:40px;display:flex;flex-wrap:wrap;gap:10px;align-items:center"><span class="etikett" style="color:var(--blekk-3)">Brukes i</span>' + mods.map(function (m) { return '<a class="brikke" href="#' + m.id + '">' + esc(kode(m) + " " + m.tittel) + "</a>"; }).join("") + "</div>" : "") +
      "</div></section>";
  }

  function ordliste() {
    var ord = FF.ord.slice().sort(function (a, b) { return a[0].localeCompare(b[0], "nb"); });
    var h = '<header class="sidetopp">' + FF.dybdekurver(33) + '<div class="ramme"><span class="etikett">' + ord.length + ' fagord</span><h1>Ordliste</h1>' +
      "<p>Fagordene på bokmål, nynorsk og engelsk. Engelsk er språket på internasjonale fartøy og i sjøveisreglene.</p></div></header>" +
      '<section class="seksjon"><div class="ramme"><div class="ordsok"><label class="skjult-visuelt" for="ordsok">Søk i ordlista</label>' +
      '<input id="ordsok" type="search" placeholder="Søk: for eksempel «fribord» eller «bløgge»" autocomplete="off"><span class="mono ordteller" style="color:var(--blekk-3);font-size:.85rem"></span></div>' +
      '<div class="tabell-rull"><table class="tabell ordliste-tabell"><thead><tr><th>Bokmål</th><th>Nynorsk</th><th>Engelsk</th><th>Forklaring</th></tr></thead><tbody>' +
      ord.map(function (o) {
        return '<tr data-sok="' + esc((o.join(" ")).toLowerCase()) + '"><td>' + esc(o[0]) + '</td><td class="nn">' + esc(o[1]) + '</td><td class="en">' + esc(o[2]) + "</td><td>" + esc(o[3]) + "</td></tr>";
      }).join("") + "</tbody></table></div></div></section>";
    return h;
  }

  function bindOrdliste() {
    var inp = $("#ordsok");
    if (!inp) return;
    var rader = $$(".ordliste-tabell tbody tr");
    var teller = $(".ordteller");
    function filtrer() {
      var q = inp.value.trim().toLowerCase();
      var n = 0;
      rader.forEach(function (r) { var vis = !q || r.getAttribute("data-sok").indexOf(q) > -1; r.hidden = !vis; if (vis) n++; });
      teller.textContent = n + " treff";
    }
    inp.addEventListener("input", filtrer);
    filtrer();
  }

  function laerer() {
    var alle = sorterte();
    var h = '<header class="sidetopp">' + FF.dybdekurver(41) + '<div class="ramme"><span class="etikett">For lærer</span><h1>Læreplan, progresjon og vurdering</h1>' +
      "<p>Oversikt over hvordan modulene dekker kompetansemålene i FFA02-03, et forslag til årsplan og ideer til vurdering. Alt kan tilpasses egen skole og egne fartøy.</p></div></header>";

    h += '<section class="seksjon"><div class="ramme"><div class="seksjon-hode"><div><span class="etikett">Kjerneelementer</span><h2>Det viktigste i faget</h2></div></div>' +
      '<dl class="begreper">' + FF.kjerneelementer.map(function (k) { return "<div><dt>" + esc(k.navn) + "</dt><dd>" + esc(k.tekst) + "</dd></div>"; }).join("") + "</dl></div></section>";

    // Målmatrise
    var koder = Object.keys(FF.maal);
    h += '<section class="seksjon"><div class="ramme"><div class="seksjon-hode"><div><span class="etikett">Målmatrise</span><h2>Moduler og kompetansemål</h2>' +
      "<p>● betyr at målet er et hovedmål i modulen. Målene er gjengitt i kortform – se udir.no/lk20/ffa02-03 for full ordlyd.</p></div></div>" +
      '<div class="tabell-rull"><table class="tabell matrise"><thead><tr><th>Mål</th><th>Eleven skal kunne …</th>' +
      alle.map(function (m) { return '<th class="tall" title="' + esc(m.tittel) + '">' + esc(kode(m)) + "</th>"; }).join("") + "</tr></thead><tbody>" +
      koder.map(function (k) {
        return '<tr><td class="sterk mono">' + k + '</td><td style="min-width:280px">' + esc(FF.maal[k].tekst) + "</td>" +
          alle.map(function (m) { return '<td class="tall" style="text-align:center;color:var(--magenta)">' + ((m.maal || []).indexOf(k) > -1 ? "●" : "") + "</td>"; }).join("") + "</tr>";
      }).join("") + "</tbody></table></div></div></section>";

    h += FF.laererInnhold ? FF.laererInnhold(alle) : "";

    // Elevens status (lokalt)
    h += '<section class="seksjon"><div class="ramme"><div class="seksjon-hode"><div><span class="etikett">Denne enheten</span><h2>Nullstill fremdrift</h2>' +
      "<p>Fremdrift, svar og praksislogg lagres bare i nettleseren på denne enheten. Bruk knappen hvis en maskin deles av flere elever.</p></div></div>" +
      '<div id="nullstill-boks" style="display:flex;gap:12px;flex-wrap:wrap;align-items:center"><button class="knapp sekundar" type="button" id="nullstill">Nullstill all fremdrift</button></div></div></section>';
    return h;
  }

  function bindLaerer() {
    var k = $("#nullstill");
    if (!k) return;
    k.addEventListener("click", function () {
      var boks = $("#nullstill-boks");
      boks.innerHTML = '<p style="font-weight:700">Sikker? Alt som er lagret på denne enheten slettes.</p><button class="knapp" type="button" id="ja">Ja, nullstill</button><button class="knapp sekundar" type="button" id="nei">Avbryt</button>';
      $("#ja").addEventListener("click", function () { FF.nullstill(); FF.melding("Fremdriften er nullstilt."); vis(); });
      $("#nei").addEventListener("click", vis);
    });
  }

  /* Illustrasjonsbank: alle tegningene samlet, til bruk i egne presentasjoner */
  function figurbank() {
    var navn = Object.keys(FF.fig).filter(function (k) { return !/^(kompassrose)$/.test(k) && !(FF.fig[k].skjult); });
    var h = '<header class="sidetopp">' + FF.dybdekurver(51) + '<div class="ramme"><span class="etikett">For lærer · ' + navn.length + ' tegninger</span><h1>Illustrasjonsbank</h1>' +
      "<p>Alle tegningene i læremiddelet. Kopier SVG-koden og lim den inn i PowerPoint, Word eller OneNote, eller ta et skjermbilde til tavla. Tegningene følger dag- og nattpaletten.</p></div></header>" +
      '<section class="seksjon"><div class="ramme" style="display:grid;gap:40px">';
    navn.forEach(function (k) {
      var bank = FF.fig[k].bank || {};
      h += '<figure class="fig"><div class="fig-flate' + (bank.flate ? " " + bank.flate : "") + '">' + tegn(k, bank.a) + "</div>" +
        '<figcaption><span class="fig-nr">' + esc(k) + "</span><span>" + esc(bank.tekst || "") + ' <button class="ikon-knapp" type="button" data-kopier-fig="' + esc(k) + '" style="height:28px;margin-left:6px">' + FF.ikon.kopier + "Kopier SVG</button></span></figcaption></figure>";
    });
    return h + "</div></section>";
  }

  function bindFigurbank() {
    $$("[data-kopier-fig]").forEach(function (b) {
      b.addEventListener("click", function () {
        var svg = b.closest("figure").querySelector("svg");
        var kopi = svg.cloneNode(true);
        kopi.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        // Bytt fargevariabler med faktiske farger så tegningen virker utenfor læremiddelet.
        var stil = getComputedStyle(document.documentElement);
        var tekst = kopi.outerHTML.replace(/var\((--[a-z0-9-]+)\)/g, function (_, v) { return stil.getPropertyValue(v).trim() || "#000"; });
        FF.kopier(tekst, b);
      });
    });
  }

  function ikkeFunnet() {
    return '<header class="sidetopp"><div class="ramme"><span class="etikett">Ukjent posisjon</span><h1>Her er det ikke kartlagt</h1><p>Siden finnes ikke. <a href="#kurs">Gå til reiseplanen</a>.</p></div></header>';
  }

  /* ---------- Ruter ---------- */

  function vis() {
    FF.tale.stopp();
    var rute = (location.hash || "#kurs").slice(1) || "kurs";
    FF.rute = rute;
    reg = {};
    var main = $("#innhold");
    var html, etter;
    var aktivNav = rute;
    if (rute === "kurs") html = forside();
    else if (FF.fag[rute]) html = programfag(rute);
    else if (rute === "verktoy") html = verktoyOversikt();
    else if (rute.indexOf("v-") === 0) { html = verktoySide(rute.slice(2)); aktivNav = "verktoy"; }
    else if (rute === "ordliste") { html = ordliste(); etter = bindOrdliste; }
    else if (rute === "laerer") { html = laerer(); etter = bindLaerer; }
    else if (rute === "figurer") { html = figurbank(); etter = bindFigurbank; aktivNav = "laerer"; }
    else {
      var m = FF.finnModul(rute);
      if (m) { html = modul(m); aktivNav = m.fag; }
      else html = ikkeFunnet();
    }
    main.innerHTML = html;
    // quiz-resultater lagres per modul
    Object.keys(reg).forEach(function (k) { reg[k]._mod = rute; });
    bind(main);
    if (etter) etter();
    $$(".hovednav a").forEach(function (a) {
      if (a.getAttribute("data-rute") === aktivNav) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    $(".hovednav").classList.remove("apen");
    $(".meny-knapp").setAttribute("aria-expanded", "false");
    window.scrollTo(0, 0);
    var tittel = { kurs: "Fiske og fangst Vg2", verktoy: "Verktøy · Fiske og fangst Vg2", ordliste: "Ordliste · Fiske og fangst Vg2", laerer: "For lærer · Fiske og fangst Vg2" }[rute];
    var h1 = $("h1", main);
    document.title = tittel || ((h1 ? h1.textContent + " · " : "") + "Fiske og fangst Vg2");
    aktivSeksjon();
  }

  // Marker aktiv seksjon i innholdslista mens du leser.
  var obs;
  function aktivSeksjon() {
    if (obs) obs.disconnect();
    var lenker = $$(".innholdsliste a");
    if (!lenker.length || !("IntersectionObserver" in window)) return;
    obs = new IntersectionObserver(function (inn) {
      inn.forEach(function (e) {
        if (e.isIntersecting) {
          lenker.forEach(function (a) { a.classList.toggle("aktiv", a.getAttribute("data-hopp") === e.target.id); });
        }
      });
    }, { rootMargin: "-90px 0px -70% 0px" });
    lenker.forEach(function (a) { var t = document.getElementById(a.getAttribute("data-hopp")); if (t) obs.observe(t); });
  }

  FF.vis = vis;
  FF.start = function () {
    skall();
    window.addEventListener("hashchange", vis);
    vis();
  };
})();

document.addEventListener("DOMContentLoaded", FF.start);

/* Kalkulatorer og skjema: fart–distanse–tid, lott, artskort, SJA, MAYDAY og praksislogg. */

(function () {
  var $ = FF.$, $$ = FF.$$, esc = FF.esc;
  function hode(tittel, hoyre) { return '<div class="vk-hode"><span class="etikett">' + esc(tittel) + "</span>" + (hoyre || "") + "</div>"; }
  function tallFra(v) { var x = parseFloat(String(v).replace(/\s/g, "").replace(",", ".")); return isNaN(x) ? null : x; }
  function mini(innhold, vb) { return '<svg viewBox="' + (vb || "0 0 400 225") + '" aria-hidden="true">' + innhold + "</svg>"; }

  /* ================= Fart, distanse, tid ================= */
  FF.verktoy.fdt = {
    tittel: "Fart, distanse og tid",
    etikett: "Kalkulator",
    kort: "Regn ut hvor lang tid turen tar, hvor fort du går, eller når du er framme.",
    lys: true,
    bilde: function () { return FF.fig.fdt(); },
    mount: function (el) {
      var id = FF.uid("fdt");
      var u = FF.utkast.hent("fdt") || { finn: "T", d: "24", f: "8", t: "3:00", avg: "06:00" };
      el.innerHTML = '<div class="vk">' + hode("Fart · distanse · tid", '<div class="vk-faner" role="group" aria-label="Hva vil du finne?"><button type="button" data-f="T">Tid</button><button type="button" data-f="F">Fart</button><button type="button" data-f="D">Distanse</button></div>') +
        '<div class="vk-kropp"><div class="vk-rad"><div class="felter">' +
        '<div class="felt" data-for="D"><label for="' + id + 'd">Distanse <span class="verdi">nautiske mil</span></label><input type="text" inputmode="decimal" id="' + id + 'd" value="' + esc(u.d) + '"></div>' +
        '<div class="felt" data-for="F"><label for="' + id + 'f">Fart <span class="verdi">knop</span></label><input type="text" inputmode="decimal" id="' + id + 'f" value="' + esc(u.f) + '"></div>' +
        '<div class="felt" data-for="T"><label for="' + id + 't">Tid <span class="verdi">timer:minutter</span></label><input type="text" id="' + id + 't" value="' + esc(u.t) + '"></div>' +
        '<div class="felt"><label for="' + id + 'a">Avgang <span class="verdi">klokkeslett</span></label><input type="time" id="' + id + 'a" value="' + esc(u.avg) + '"></div>' +
        '</div><div><p class="etikett" style="color:var(--blekk-3)">Svar</p><p class="les-av fdt-svar" style="font-size:3rem;margin-top:6px"></p><p class="fdt-utregning mono" style="margin-top:10px;font-size:.95rem"></p><p class="fdt-eta" style="margin-top:14px;font-size:1.05rem"></p></div></div></div></div>';
      function tid(s) {
        s = String(s).trim();
        if (/^\d+:\d{1,2}$/.test(s)) { var p = s.split(":"); return +p[0] + (+p[1]) / 60; }
        return tallFra(s);
      }
      function tidTekst(t) { var h = Math.floor(t), m = Math.round((t - h) * 60); if (m === 60) { h += 1; m = 0; } return h + " t " + m + " min"; }
      function regn() {
        var d = tallFra($("#" + id + "d", el).value), f = tallFra($("#" + id + "f", el).value), t = tid($("#" + id + "t", el).value);
        $$(".felt[data-for]", el).forEach(function (x) { x.style.opacity = x.getAttribute("data-for") === u.finn ? ".45" : "1"; $("input", x).disabled = x.getAttribute("data-for") === u.finn; });
        $$(".vk-faner button", el).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-f") === u.finn ? "true" : "false"); });
        var svar = "–", utr = "", timer = null;
        if (u.finn === "T" && d != null && f) { timer = d / f; svar = tidTekst(timer); utr = "T = D ÷ F = " + FF.tall(d, 1) + " ÷ " + FF.tall(f, 1) + " = " + FF.tall(timer, 2) + " timer"; }
        if (u.finn === "F" && d != null && t) { svar = FF.tall(d / t, 1) + " kn"; utr = "F = D ÷ T = " + FF.tall(d, 1) + " ÷ " + FF.tall(t, 2) + " = " + FF.tall(d / t, 2) + " knop"; timer = t; }
        if (u.finn === "D" && f != null && t != null) { svar = FF.tall(f * t, 1) + " nm"; utr = "D = F × T = " + FF.tall(f, 1) + " × " + FF.tall(t, 2) + " = " + FF.tall(f * t, 2) + " nautiske mil"; timer = t; }
        $(".fdt-svar", el).textContent = svar;
        $(".fdt-utregning", el).textContent = utr || "Fyll inn de to andre feltene.";
        var avg = $("#" + id + "a", el).value;
        if (timer != null && /^\d{2}:\d{2}$/.test(avg)) {
          var p = avg.split(":"), min = (+p[0]) * 60 + (+p[1]) + Math.round(timer * 60);
          var dag = Math.floor(min / 1440); min = min % 1440;
          $(".fdt-eta", el).textContent = "Forventet ankomst: kl. " + String(Math.floor(min / 60)).padStart(2, "0") + ":" + String(min % 60).padStart(2, "0") + (dag ? " (+" + dag + " døgn)" : "");
        } else $(".fdt-eta", el).textContent = "";
        u.d = $("#" + id + "d", el).value; u.f = $("#" + id + "f", el).value; u.t = $("#" + id + "t", el).value; u.avg = avg;
        FF.utkast.lagre("fdt", u);
      }
      $$("input", el).forEach(function (i) { i.addEventListener("input", regn); });
      $$(".vk-faner button", el).forEach(function (b) { b.addEventListener("click", function () { u.finn = b.getAttribute("data-f"); regn(); }); });
      regn();
    }
  };

  /* ================= Lott ================= */
  FF.verktoy.lott = {
    tittel: "Lottkalkulator",
    etikett: "Kalkulator",
    kort: "Fra fangstverdi til utbetalt lott: trekk felleskostnader og del mellom båt og mannskap.",
    lys: true,
    bilde: function () { return FF.fig.lott({ brutto: 1000000, felles: 220000, andel: 0.5, lotter: 3 }); },
    mount: function (el) {
      var id = FF.uid("lott");
      var u = FF.utkast.hent("lott") || { brutto: "480000", diesel: "62000", agn: "18000", is: "6000", annet: "10000", andel: "50", mannskap: "3", skipper: "1.25" };
      function felt(k, navn, enhet, hint) {
        return '<div class="felt"><label for="' + id + k + '">' + navn + ' <span class="verdi">' + enhet + '</span></label><input type="text" inputmode="decimal" id="' + id + k + '" data-k="' + k + '" value="' + esc(u[k]) + '">' + (hint ? "<small>" + hint + "</small>" : "") + "</div>";
      }
      el.innerHTML = '<div class="vk">' + hode("Lottkalkulator", '<span class="mono">Eksempeltall – bytt med deres egne</span>') +
        '<div class="vk-kropp"><div class="vk-rad"><div class="felter">' +
        felt("brutto", "Fangstverdi", "kr", "Summen av sluttsedlene for perioden") +
        '<div class="felt-par">' + felt("diesel", "Drivstoff", "kr") + felt("agn", "Agn", "kr") + "</div>" +
        '<div class="felt-par">' + felt("is", "Is og emballasje", "kr") + felt("annet", "Andre felleskostn.", "kr") + "</div>" +
        '<div class="felt-par">' + felt("andel", "Mannskapets andel", "%", "Fra hyreavtalen") + felt("mannskap", "Fiskere", "antall", "Uten skipper") + "</div>" +
        felt("skipper", "Skipperens lotter", "lotter", "For eksempel 1,25 hvis skipperen har kvart lott ekstra") +
        '</div><div><div class="fig-flate lott-fig"></div><div class="tallrad lott-tall" style="margin-top:16px"></div></div></div></div></div>';
      function regn() {
        $$("input[data-k]", el).forEach(function (i) { u[i.getAttribute("data-k")] = i.value; });
        var b = tallFra(u.brutto) || 0;
        var felles = ["diesel", "agn", "is", "annet"].reduce(function (s, k) { return s + (tallFra(u[k]) || 0); }, 0);
        var andel = Math.max(0, Math.min(100, tallFra(u.andel) || 0)) / 100;
        var n = Math.max(0, tallFra(u.mannskap) || 0), sk = Math.max(0, tallFra(u.skipper) || 0);
        var lotter = n + sk;
        var netto = Math.max(0, b - felles), mann = netto * andel, baat = netto - mann, en = lotter ? mann / lotter : 0;
        $(".lott-fig", el).innerHTML = b > 0 ? FF.fig.lott({ brutto: b, felles: Math.min(felles, b), andel: andel, lotter: Math.max(1, Math.min(8, Math.round(lotter))) }) : "";
        $(".lott-tall", el).innerHTML = [
          ["Nettoverdi", FF.kr(netto)], ["Båtlott", FF.kr(baat)], ["Mannskapslott", FF.kr(mann)],
          ["Én lott", FF.kr(en), true], ["Skipper", FF.kr(en * sk)], ["Antall lotter", FF.tall(lotter, 2)]
        ].map(function (t) { return "<div><span>" + t[0] + '</span><strong class="' + (t[2] ? "stor" : "") + '">' + t[1] + "</strong></div>"; }).join("");
        FF.utkast.lagre("lott", u);
      }
      $$("input", el).forEach(function (i) { i.addEventListener("input", regn); });
      regn();
    }
  };

  /* ================= Artskort ================= */
  var GRUPPER = { alle: "Alle", torskefisk: "Torskefisk", flatfisk: "Flatfisk", pelagisk: "Pelagisk", annet: "Andre", skalldyr: "Skalldyr" };
  var GRUPPE = { torsk: "torskefisk", hyse: "torskefisk", sei: "torskefisk", lyr: "torskefisk", lange: "torskefisk", brosme: "torskefisk", kveite: "flatfisk", blakveite: "flatfisk", sild: "pelagisk", makrell: "pelagisk", steinbit: "annet", uer: "annet", kongekrabbe: "skalldyr", snokrabbe: "skalldyr", reke: "skalldyr" };
  FF.verktoy.arter = {
    tittel: "Artskort og artsquiz",
    etikett: "Øvelse",
    kort: "Femten arter med kjennetegn, redskap og biologi – og en quiz der du kjenner dem igjen.",
    lys: true,
    bilde: function () { return FF.fig.art({ art: "torsk" }); },
    mount: function (el) {
      var gruppe = "alle", poeng = 0, antall = 0;
      el.innerHTML = '<div class="vk">' + hode("Artskort", '<div class="vk-faner" role="group" aria-label="Modus"><button type="button" data-m="kort" aria-pressed="true">Artskort</button><button type="button" data-m="quiz" aria-pressed="false">Artsquiz</button></div>') + '<div class="vk-kropp ar-innhold"></div></div>';
      var inn = $(".ar-innhold", el);
      function kort() {
        inn.innerHTML = '<div class="artsfilter forhand">' + Object.keys(GRUPPER).map(function (g) { return '<button type="button" data-g="' + g + '" aria-pressed="' + (g === gruppe) + '">' + GRUPPER[g] + "</button>"; }).join("") + "</div>" +
          '<div class="artsrutenett">' + FF.arter.filter(function (a) { return gruppe === "alle" || GRUPPE[a.id] === gruppe; }).map(function (a) {
            return '<article class="artskort"><div class="plansje">' + FF.fig.art({ art: a.id }) + '</div><div class="tekst"><h4>' + esc(a.navn) + '</h4><span class="latin">' + esc(a.latin) + "</span><ul>" + a.kjenn.map(function (k) { return "<li>" + esc(k) + "</li>"; }).join("") + '</ul><p style="font-size:.88rem;color:var(--blekk-2)">' + esc(a.fakta) + '</p><p class="redskap">Redskap: ' + esc(a.redskap) + "</p></div></article>";
          }).join("") + "</div>";
        $$(".artsfilter button", inn).forEach(function (b) { b.addEventListener("click", function () { gruppe = b.getAttribute("data-g"); kort(); }); });
      }
      function quiz() {
        var a = FF.arter[Math.floor(Math.random() * FF.arter.length)];
        var like = FF.arter.filter(function (x) { return x !== a && GRUPPE[x.id] === GRUPPE[a.id]; });
        var andre = FF.bland(like).concat(FF.bland(FF.arter.filter(function (x) { return x !== a && like.indexOf(x) < 0; })));
        var valg = FF.bland([a].concat(andre.slice(0, 3)));
        inn.innerHTML = '<div class="fig-flate" style="max-width:720px">' + FF.fig.art({ art: a.id }) + "</div>" +
          '<p class="panel-tittel">Hvilken art er dette?</p><div class="svar-knapper">' + valg.map(function (v) { return '<button type="button" data-v="' + v.id + '">' + esc(v.navn) + "</button>"; }).join("") + "</div>" +
          '<p class="tilbakemelding" aria-live="polite"></p><div style="display:flex;gap:12px;align-items:center;margin-top:12px"><button type="button" class="knapp liten ar-neste">Neste art</button><span class="poeng">' + poeng + " av " + antall + " riktige</span></div>";
        $(".svar-knapper", inn).addEventListener("click", function (e) {
          var k = e.target.closest("button");
          if (!k || k.disabled) return;
          antall += 1;
          var ok = k.getAttribute("data-v") === a.id;
          if (ok) poeng += 1;
          $$(".svar-knapper button", inn).forEach(function (x) { x.disabled = true; if (x.getAttribute("data-v") === a.id) x.classList.add("riktig"); else if (x === k) x.classList.add("feil"); });
          $(".tilbakemelding", inn).innerHTML = "<strong>" + (ok ? "Riktig – " : "Det er ") + esc(a.navn) + ".</strong> " + esc(a.kjenn.slice(0, 2).join(". ")) + ".";
          $(".poeng", inn).textContent = poeng + " av " + antall + " riktige";
        });
        $(".ar-neste", inn).addEventListener("click", quiz);
      }
      $$(".vk-faner button", el).forEach(function (k) {
        k.addEventListener("click", function () {
          $$(".vk-faner button", el).forEach(function (x) { x.setAttribute("aria-pressed", x === k ? "true" : "false"); });
          if (k.getAttribute("data-m") === "quiz") quiz(); else kort();
        });
      });
      kort();
    }
  };

  /* ================= Sikker jobbanalyse ================= */
  var SJA_EKSEMPEL = {
    jobb: "Løfte pall med fiskekasser fra kai til lasterom med kranen",
    rader: [
      { trinn: "Rigge kran og stropper", fare: "Skadet eller feil stropp ryker", s: 2, k: 4, tiltak: "Sjekk merking og SWL. Bytt skadet utstyr.", hvem: "Kranfører" },
      { trinn: "Løfte fra kaia", fare: "Lasten svinger og treffer person", s: 3, k: 4, tiltak: "Styretau. Ingen under eller ved lasten. Én gir tegn.", hvem: "Signalmann" },
      { trinn: "Svinge over rekka", fare: "Krengning, klem mot rekka", s: 3, k: 3, tiltak: "Lukket kommunikasjon. Rolig bevegelse. Lukeåpning sikret.", hvem: "Alle" },
      { trinn: "Sette ned i rommet", fare: "Fall ned i åpen luke", s: 2, k: 5, tiltak: "Rekkverk eller sikring rundt luka. Sele ved arbeid i kanten.", hvem: "Dekksmann" }
    ]
  };
  function risikoKlasse(v) { return v >= 12 ? "hoy" : v >= 5 ? "mid" : "lav"; }
  FF.verktoy.risiko = {
    tittel: "Sikker jobbanalyse",
    etikett: "Skjema",
    kort: "Del jobben i trinn, finn farene, vurder risikoen og bestem tiltak. Kopier til Teams.",
    lys: true,
    bilde: function () {
      var s = "";
      for (var a = 0; a < 5; a++) for (var b = 0; b < 5; b++) { var v = (a + 1) * (b + 1); s += '<rect x="' + (110 + b * 38) + '" y="' + (18 + (4 - a) * 38) + '" width="35" height="35" fill="' + (v >= 12 ? "var(--babord)" : v >= 5 ? "var(--gul)" : "var(--styrbord)") + '" opacity=".85"/>'; }
      return mini(s);
    },
    mount: function (el) {
      var d = FF.utkast.hent("sja") || JSON.parse(JSON.stringify(SJA_EKSEMPEL));
      var id = FF.uid("sja");
      el.innerHTML = '<div class="vk">' + hode("Sikker jobbanalyse (SJA)", '<span class="mono">Lagres på denne enheten</span>') +
        '<div class="vk-kropp"><div class="felt" style="max-width:720px"><label for="' + id + 'j">Arbeidsoperasjon</label><input type="text" id="' + id + 'j"></div>' +
        '<div class="tabell-rull" style="margin-top:16px"><table class="sja"><thead><tr><th>Trinn</th><th>Fare</th><th>Sannsynlighet</th><th>Konsekvens</th><th>Risiko</th><th>Tiltak</th><th>Ansvarlig</th><th></th></tr></thead><tbody></tbody></table></div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:14px"><button type="button" class="knapp liten sekundar sja-ny">+ Nytt trinn</button><button type="button" class="knapp liten sja-kopier">' + FF.ikon.kopier + 'Kopier som tekst</button><button type="button" class="knapp liten sekundar sja-tom">Start på nytt</button><button type="button" class="knapp liten sekundar sja-eks">Vis eksempel</button></div></div></div>';
      var tb = $("tbody", el);
      $("#" + id + "j", el).value = d.jobb;
      function valg(v) { var s = ""; for (var i = 1; i <= 5; i++) s += '<option value="' + i + '"' + (i === +v ? " selected" : "") + ">" + i + "</option>"; return s; }
      function tegn() {
        tb.innerHTML = d.rader.map(function (r, i) {
          var v = r.s * r.k;
          return '<tr data-i="' + i + '"><td><textarea data-f="trinn" aria-label="Trinn">' + esc(r.trinn) + '</textarea></td><td><textarea data-f="fare" aria-label="Fare">' + esc(r.fare) + '</textarea></td>' +
            '<td><select data-f="s" aria-label="Sannsynlighet 1 til 5">' + valg(r.s) + '</select></td><td><select data-f="k" aria-label="Konsekvens 1 til 5">' + valg(r.k) + "</select></td>" +
            '<td><span class="risikotall ' + risikoKlasse(v) + '">' + v + '</span></td><td><textarea data-f="tiltak" aria-label="Tiltak">' + esc(r.tiltak) + '</textarea></td><td><input type="text" data-f="hvem" aria-label="Ansvarlig" value="' + esc(r.hvem) + '"></td>' +
            '<td><button type="button" class="fjern" aria-label="Fjern trinn">✕</button></td></tr>';
        }).join("");
      }
      function lagre() { FF.utkast.lagre("sja", d); }
      tb.addEventListener("input", function (e) {
        var tr = e.target.closest("tr"), f = e.target.getAttribute("data-f");
        if (!tr || !f) return;
        var r = d.rader[+tr.getAttribute("data-i")];
        r[f] = f === "s" || f === "k" ? +e.target.value : e.target.value;
        if (f === "s" || f === "k") { var v = r.s * r.k, rt = $(".risikotall", tr); rt.textContent = v; rt.className = "risikotall " + risikoKlasse(v); }
        lagre();
      });
      tb.addEventListener("click", function (e) {
        if (!e.target.closest(".fjern")) return;
        d.rader.splice(+e.target.closest("tr").getAttribute("data-i"), 1); tegn(); lagre();
      });
      $("#" + id + "j", el).addEventListener("input", function () { d.jobb = this.value; lagre(); });
      $(".sja-ny", el).addEventListener("click", function () { d.rader.push({ trinn: "", fare: "", s: 1, k: 1, tiltak: "", hvem: "" }); tegn(); lagre(); });
      $(".sja-tom", el).addEventListener("click", function () { d = { jobb: "", rader: [{ trinn: "", fare: "", s: 1, k: 1, tiltak: "", hvem: "" }] }; $("#" + id + "j", el).value = ""; tegn(); lagre(); });
      $(".sja-eks", el).addEventListener("click", function () { d = JSON.parse(JSON.stringify(SJA_EKSEMPEL)); $("#" + id + "j", el).value = d.jobb; tegn(); lagre(); });
      $(".sja-kopier", el).addEventListener("click", function () {
        var t = "SIKKER JOBBANALYSE\nArbeidsoperasjon: " + d.jobb + "\n\n" + d.rader.map(function (r, i) {
          var v = r.s * r.k;
          return (i + 1) + ". " + r.trinn + "\n   Fare: " + r.fare + "\n   Risiko: " + r.s + " × " + r.k + " = " + v + (v >= 12 ? " (HØY)" : v >= 5 ? " (MIDDELS)" : " (LAV)") + "\n   Tiltak: " + r.tiltak + "\n   Ansvarlig: " + r.hvem;
        }).join("\n\n");
        FF.kopier(t);
      });
      tegn();
    }
  };

  /* ================= MAYDAY ================= */
  var HENDELSER = { brann: "Brann om bord", lekk: "Lekkasje – vi tar inn vann", kantring: "Fartøyet kantrer", mob: "Mann over bord", grunn: "Grunnstøtt og tar inn vann", motor: "Motorstopp og driver mot land", skade: "Alvorlig skadet person om bord" };
  var HJELP = { brann: "Trenger umiddelbar assistanse", lekk: "Trenger umiddelbar assistanse og lensepumper", kantring: "Trenger umiddelbar assistanse. Vi forlater fartøyet", mob: "Trenger assistanse til søk", grunn: "Trenger umiddelbar assistanse", motor: "Trenger slep", skade: "Trenger medisinsk hjelp og evakuering" };
  FF.verktoy.mayday = {
    tittel: "Nødmelding",
    etikett: "Øvelse · VHF",
    kort: "Fyll inn fartøyet og situasjonen, og få en nødmelding du kan lese høyt på kanal 16.",
    bilde: function () {
      return mini('<rect width="400" height="225" fill="#03070b"/><g fill="none" stroke="#ff7a44" stroke-width="3"><path d="M200 70 a40 40 0 0 1 0 80"/><path d="M200 50 a60 60 0 0 1 0 120"/><path d="M200 30 a80 80 0 0 1 0 160"/></g><rect x="150" y="80" width="46" height="60" rx="6" fill="#dfe8ee"/><text x="40" y="200" style="font:800 30px var(--f-sjablong);fill:#ff7a44">MAYDAY</text><text x="250" y="200" style="font:500 12px var(--f-mono);fill:#8aa0c0">VHF 16 · DSC 70 · 120</text>');
    },
    mount: function (el) {
      var id = FF.uid("my");
      var u = FF.utkast.hent("mayday") || { type: "MAYDAY", navn: "HAVBRIS", kall: "LM0000", mmsi: "257000001", pos: "62° 55′ N 006° 52′ Ø, 2 nautiske mil nordvest av Bud", hva: "brann", fritt: "", folk: "3", annet: "Vi har overlevingsdrakter på og livflåten er klar" };
      el.innerHTML = '<div class="vk">' + hode("Nødmelding på VHF", '<div class="vk-faner" role="group" aria-label="Meldingstype"><button type="button" data-t="MAYDAY">MAYDAY</button><button type="button" data-t="PAN-PAN">PAN-PAN</button></div>') +
        '<div class="vk-kropp"><div class="lk-nod">Nød til sjøs <span>VHF kanal 16 · DSC-alarm kanal 70 · Mobil 120</span></div><div class="vk-rad"><div class="felter">' +
        '<div class="felt-par"><div class="felt"><label for="' + id + 'n">Fartøyets navn</label><input type="text" id="' + id + 'n" data-k="navn"></div><div class="felt"><label for="' + id + 'k">Kallesignal</label><input type="text" id="' + id + 'k" data-k="kall"></div></div>' +
        '<div class="felt"><label for="' + id + 'm">MMSI</label><input type="text" id="' + id + 'm" data-k="mmsi" inputmode="numeric"></div>' +
        '<div class="felt"><label for="' + id + 'p">Posisjon</label><input type="text" id="' + id + 'p" data-k="pos"><small>Bredde og lengde fra plotteren, eller peiling og avstand fra et kjent sted.</small></div>' +
        '<div class="felt"><label for="' + id + 'h">Hva har skjedd?</label><select id="' + id + 'h" data-k="hva">' + Object.keys(HENDELSER).map(function (k) { return '<option value="' + k + '">' + HENDELSER[k] + "</option>"; }).join("") + "</select></div>" +
        '<div class="felt-par"><div class="felt"><label for="' + id + 'f">Personer om bord</label><input type="text" id="' + id + 'f" data-k="folk" inputmode="numeric"></div><div class="felt"><label for="' + id + 'x">Tillegg</label><input type="text" id="' + id + 'x" data-k="fritt" placeholder="f.eks. to skadet"></div></div>' +
        '<div class="felt"><label for="' + id + 'a">Annen informasjon</label><input type="text" id="' + id + 'a" data-k="annet"></div>' +
        '</div><div><div class="manus" aria-live="polite"></div><div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px"><button type="button" class="knapp liten my-les">' + FF.ikon.hoyttaler + 'Les høyt</button><button type="button" class="knapp liten sekundar my-kopier">' + FF.ikon.kopier + 'Kopier</button></div>' +
        '<p style="font-size:.85rem;color:var(--blekk-3);margin-top:12px">Øv med radioen avslått, eller på en øvingskanal avtalt med læreren. Send aldri nødmelding på ekte for å øve.</p></div></div></div></div>';
      $$("[data-k]", el).forEach(function (i) { i.value = u[i.getAttribute("data-k")] || ""; });
      function manus() {
        var t = u.type, x3 = function (s) { return s + " " + s + " " + s; };
        var navn = (u.navn || "").toUpperCase();
        return [
          "<b>" + x3(t) + "</b>",
          "Dette er " + esc(x3(navn)),
          "Kallesignal " + esc(u.kall) + ", MMSI " + esc(u.mmsi),
          "<b>" + t + "</b> " + esc(navn) + ", kallesignal " + esc(u.kall),
          "Posisjon: " + esc(u.pos),
          esc(HENDELSER[u.hva]) + (u.fritt ? ", " + esc(u.fritt) : ""),
          esc(HJELP[u.hva]),
          esc(u.folk) + " personer om bord",
          esc(u.annet),
          "OVER"
        ].filter(Boolean).join("\n");
      }
      function tegn() {
        $$(".vk-faner button", el).forEach(function (b) { b.setAttribute("aria-pressed", b.getAttribute("data-t") === u.type ? "true" : "false"); });
        $(".manus", el).innerHTML = manus();
        FF.utkast.lagre("mayday", u);
      }
      $$("[data-k]", el).forEach(function (i) { i.addEventListener("input", function () { u[i.getAttribute("data-k")] = i.value; tegn(); }); });
      $$(".vk-faner button", el).forEach(function (b) { b.addEventListener("click", function () { u.type = b.getAttribute("data-t"); tegn(); }); });
      $(".my-les", el).addEventListener("click", function () { FF.tale.les([$(".manus", el)], $(".my-les", el)); });
      $(".my-kopier", el).addEventListener("click", function () { FF.kopier($(".manus", el).textContent); });
      tegn();
    }
  };

  /* ================= Praksislogg ================= */
  FF.verktoy.praksislogg = {
    tittel: "Praksislogg",
    etikett: "Logg · YFF",
    kort: "Skriv ned hver dag i praksis. Kopier loggen til Teams når uka er ferdig.",
    lys: true,
    bilde: function () {
      var s = '<rect x="110" y="20" width="180" height="190" rx="4" fill="var(--flate)" stroke="var(--blekk)" stroke-width="2"/>';
      for (var i = 0; i < 7; i++) s += '<line x1="130" x2="' + (250 - (i % 3) * 20) + '" y1="' + (58 + i * 20) + '" y2="' + (58 + i * 20) + '" stroke="var(--linje-2)" stroke-width="3"/>';
      s += '<rect x="110" y="20" width="180" height="24" fill="var(--magenta)"/>';
      return mini(s);
    },
    mount: function (el) {
      var id = FF.uid("pl");
      var idag = new Date().toISOString().slice(0, 10);
      el.innerHTML = '<div class="vk">' + hode("Praksislogg", '<span class="mono">Lagres på denne enheten</span>') +
        '<div class="vk-kropp"><form class="felter pl-skjema" style="max-width:760px">' +
        '<div class="felt-par"><div class="felt"><label for="' + id + 'd">Dato</label><input type="date" id="' + id + 'd" value="' + idag + '" required></div><div class="felt"><label for="' + id + 't">Timer</label><input type="number" id="' + id + 't" min="0" max="24" step="0.5" value="7"></div></div>' +
        '<div class="felt"><label for="' + id + 's">Fartøy eller bedrift</label><input type="text" id="' + id + 's" placeholder="f.eks. M/S Havbris, snurrevad" required></div>' +
        '<div class="felt"><label for="' + id + 'a">Hva gjorde jeg?</label><textarea id="' + id + 'a" placeholder="Arbeidsoppgaver, redskap, fangst"></textarea></div>' +
        '<div class="felt"><label for="' + id + 'l">Hva lærte jeg?</label><textarea id="' + id + 'l"></textarea></div>' +
        '<div class="felt"><label for="' + id + 'v">Hva var vanskelig – og hvem kan hjelpe?</label><textarea id="' + id + 'v"></textarea></div>' +
        '<div class="felt"><label for="' + id + 'h">HMS: Så jeg noe som kunne gått galt?</label><input type="text" id="' + id + 'h"></div>' +
        '<div style="display:flex;gap:10px;flex-wrap:wrap"><button type="submit" class="knapp liten">Lagre dagen</button><button type="button" class="knapp liten sekundar pl-kopier">' + FF.ikon.kopier + "Kopier hele loggen</button></div></form>" +
        '<ul class="logg-liste"></ul></div></div>';
      var liste = $(".logg-liste", el);
      function tegn() {
        var l = FF.tilstand.logg || [];
        var sum = l.reduce(function (s, x) { return s + (+x.timer || 0); }, 0);
        liste.innerHTML = l.length ? '<li style="background:var(--grunt);border-color:var(--grunt-2)"><strong style="font-family:var(--f-display);font-size:1.1rem">' + l.length + " dager · " + FF.tall(sum, 1) + " timer</strong></li>" + l.map(function (x, i) {
          return '<li><div class="logg-topp"><strong>' + esc(x.sted) + '</strong><span class="mono">' + esc(x.dato) + " · " + esc(x.timer) + " t</span></div>" +
            (x.arbeid ? "<p><b>Gjorde:</b> " + esc(x.arbeid) + "</p>" : "") + (x.laerte ? "<p><b>Lærte:</b> " + esc(x.laerte) + "</p>" : "") +
            (x.vansk ? "<p><b>Vanskelig:</b> " + esc(x.vansk) + "</p>" : "") + (x.hms ? "<p><b>HMS:</b> " + esc(x.hms) + "</p>" : "") +
            '<div><button type="button" data-i="' + i + '">Slett</button></div></li>';
        }).join("") : '<li><p>Ingen dager er logget ennå. Fyll inn skjemaet etter første dag i praksis.</p></li>';
      }
      $(".pl-skjema", el).addEventListener("submit", function (e) {
        e.preventDefault();
        FF.tilstand.logg = FF.tilstand.logg || [];
        FF.tilstand.logg.unshift({ dato: $("#" + id + "d", el).value, timer: $("#" + id + "t", el).value, sted: $("#" + id + "s", el).value, arbeid: $("#" + id + "a", el).value, laerte: $("#" + id + "l", el).value, vansk: $("#" + id + "v", el).value, hms: $("#" + id + "h", el).value });
        FF.lagre();
        ["a", "l", "v", "h"].forEach(function (k) { $("#" + id + k, el).value = ""; });
        FF.melding("Dagen er lagret i loggen.");
        tegn();
      });
      liste.addEventListener("click", function (e) {
        var b = e.target.closest("button[data-i]");
        if (!b) return;
        FF.tilstand.logg.splice(+b.getAttribute("data-i"), 1); FF.lagre(); tegn();
      });
      $(".pl-kopier", el).addEventListener("click", function () {
        var t = "PRAKSISLOGG – Vg2 fiske og fangst\n\n" + (FF.tilstand.logg || []).slice().reverse().map(function (x) {
          return x.dato + " · " + x.sted + " · " + x.timer + " timer\nGjorde: " + x.arbeid + "\nLærte: " + x.laerte + "\nVanskelig: " + x.vansk + "\nHMS: " + x.hms;
        }).join("\n\n");
        FF.kopier(t);
      });
      tegn();
    }
  };
})();

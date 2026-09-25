/* Simulatorer: stabilitet, lanterner, vikeplikt og sektorfyr. */

(function () {
  var $ = FF.$, $$ = FF.$$, esc = FF.esc;

  function hode(tittel, hoyre) {
    return '<div class="vk-hode"><span class="etikett">' + esc(tittel) + "</span>" + (hoyre || "") + "</div>";
  }
  function lagreUtkast(nokkel, data) { try { localStorage.setItem("ff-vk-" + nokkel, JSON.stringify(data)); } catch (e) {} }
  function hentUtkast(nokkel) { try { return JSON.parse(localStorage.getItem("ff-vk-" + nokkel)); } catch (e) { return null; } }
  FF.utkast = { lagre: lagreUtkast, hent: hentUtkast };

  /* ================= Stabilitet ================= */

  var POSTER = [
    { id: "rom", navn: "Fangst i lasterommet", min: 0, max: 12, steg: 0.5, std: 6, kg: 1.1, tcg: 0, hint: "Lavt i fartøyet" },
    { id: "dekk", navn: "Fangst og redskap på dekk", min: 0, max: 8, steg: 0.5, std: 0, kg: 2.95, tcg: 0, hint: "Over dekk" },
    { id: "is", navn: "Is på rigg og styrhus", min: 0, max: 6, steg: 0.25, std: 0, kg: 4.6, tcg: 0, hint: "Høyt oppe" },
    { id: "diesel", navn: "Drivstoff i bunntanker", min: 0.5, max: 4, steg: 0.25, std: 2.5, kg: 0.55, tcg: 0, hint: "Bunnen av fartøyet" },
    { id: "kran", navn: "Løft med kran, 4 m ut til styrbord", min: 0, max: 3, steg: 0.1, std: 0, kg: 6.0, tcg: 4.0, hint: "Vekta virker i kranspissen" }
  ];
  var SCENARIO = {
    "Klar til å gå": { rom: 0, dekk: 0, is: 0, diesel: 3.5, kran: 0, slakk: false },
    "Full last i rommet": { rom: 12, dekk: 0, is: 0, diesel: 1.5, kran: 0, slakk: false },
    "Last på dekk": { rom: 12, dekk: 6, is: 0, diesel: 1.5, kran: 0, slakk: false },
    "Ising": { rom: 6, dekk: 0, is: 5, diesel: 1.5, kran: 0, slakk: false },
    "Kranløft": { rom: 6, dekk: 0, is: 0, diesel: 2.5, kran: 1.5, slakk: false },
    "Alt på en gang": { rom: 10, dekk: 4, is: 3, diesel: 1, kran: 1.5, slakk: true }
  };
  var FSM_SLAKK = 13.4; // tm – halvfull RSW-tank, 4 m lang og 3,4 m bred

  function gzDiagram(r, vinkel) {
    var W = 620, H = 310, ml = 52, mr = 18, mt = 30, mb = 40;
    var maxY = Math.max(0.6, Math.ceil((r.maksGZ + 0.05) * 10) / 10);
    var minY = Math.min(-0.2, Math.floor(Math.min.apply(null, r.kurve.map(function (k) { return k.gz; })) * 10) / 10);
    function X(g) { return ml + (W - ml - mr) * g / 70; }
    function Y(v) { return mt + (H - mt - mb) * (maxY - v) / (maxY - minY); }
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="GZ-kurve: rettende arm mot krengningsvinkel.">';
    for (var v = minY; v <= maxY + 1e-6; v += 0.1) {
      var y = Y(v);
      s += '<line x1="' + ml + '" x2="' + (W - mr) + '" y1="' + y + '" y2="' + y + '" stroke="' + (Math.abs(v) < 1e-6 ? "var(--blekk-3)" : "var(--linje)") + '" stroke-width="1"/>';
      s += '<text x="' + (ml - 8) + '" y="' + (y + 4) + '" text-anchor="end">' + FF.tall(v, 1) + "</text>";
    }
    for (var g = 0; g <= 70; g += 10) s += '<text x="' + X(g) + '" y="' + (H - mb + 18) + '" text-anchor="middle">' + g + "°</text>";
    s += '<text x="' + (ml + (W - ml - mr) / 2) + '" y="' + (H - 6) + '" text-anchor="middle">KRENGNING</text>';
    s += '<text x="' + ml + '" y="14">GZ (m)</text>';
    // Areal (vask) og kurve
    var d = r.kurve.map(function (k, i) { return (i ? "L" : "M") + X(k.g).toFixed(1) + " " + Y(k.gz).toFixed(1); }).join(" ");
    s += '<path d="' + d + " L" + X(70) + " " + Y(0) + " L" + X(0) + " " + Y(0) + ' Z" fill="var(--magenta)" fill-opacity="0.1"/>';
    s += '<path d="' + d + '" fill="none" stroke="var(--magenta)" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>';
    // GM-tangent ved 57,3°
    // GM-tangenten: rett linje fra origo med stigning GM per radian, kuttet ved diagramkanten
    var gEnde = Math.min(57.3, 57.3 * maxY / Math.max(r.GM, 0.01));
    if (r.GM > 0) {
      s += '<line x1="' + X(0) + '" y1="' + Y(0) + '" x2="' + X(gEnde) + '" y2="' + Y(r.GM * gEnde / 57.3) + '" stroke="var(--blekk-3)" stroke-width="1" stroke-dasharray="4 4"/>';
      s += '<text x="' + (X(gEnde) - 6) + '" y="' + (Y(r.GM * gEnde / 57.3) + 4) + '" text-anchor="end">GM-tangent</text>';
    }
    // Dekkskant i vannet
    if (r.dekkVinkel != null) {
      s += '<line x1="' + X(r.dekkVinkel) + '" x2="' + X(r.dekkVinkel) + '" y1="' + mt + '" y2="' + (H - mb) + '" stroke="var(--oransje)" stroke-width="1"/>';
      s += '<text x="' + (X(r.dekkVinkel) + 5) + '" y="' + (H - mb - 8) + '" style="fill:var(--oransje-tekst)">dekkskant i vannet</text>';
    }
    // Valgt vinkel
    var kv = r.kurve[Math.min(70, Math.round(vinkel))];
    s += '<circle cx="' + X(kv.g) + '" cy="' + Y(kv.gz) + '" r="5" fill="var(--magenta)" stroke="var(--flate)" stroke-width="2"/>';
    s += '<line class="kryss" x1="0" x2="0" y1="' + mt + '" y2="' + (H - mb) + '" stroke="var(--blekk)" stroke-width="1" visibility="hidden"/>';
    s += '<rect class="treff" x="' + ml + '" y="' + mt + '" width="' + (W - ml - mr) + '" height="' + (H - mt - mb) + '" fill="transparent"/>';
    s += "</svg>";
    return { svg: s, X: X, Y: Y, W: W, ml: ml, mr: mr };
  }

  FF.verktoy.stabilitet = {
    tittel: "Stabilitetssimulator",
    etikett: "Simulator",
    kort: "Last fartøyet, legg på is og løft med kran. Se GM, GZ-kurven og krengningen endre seg.",
    ingress: "Et spantsnitt av et kystfartøy på rundt 15 meter. Simulatoren regner ut oppdriftssenteret for hver krengningsvinkel, slik at GZ-kurven blir riktig i form også når dekkskanten går i vannet.",
    lys: true,
    bilde: function () { return FF.stab.tegnSnitt({ vinkel: 22, forklaring: false, hoyde: 520 }); },
    mount: function (el) {
      var lagret = hentUtkast("stab") || {};
      var st = {};
      POSTER.forEach(function (p) { st[p.id] = lagret[p.id] != null ? lagret[p.id] : p.std; });
      st.slakk = !!lagret.slakk;
      st.vis = lagret.vis != null ? lagret.vis : 20;
      var id = FF.uid("stab");
      el.innerHTML = '<div class="vk">' + hode("Stabilitetssimulator", '<span class="mono">M/S HAVBRIS · 14,9 m · lettskip 33,5 t</span>') +
        '<div class="vk-kropp"><div class="vk-rad"><div class="felter">' +
        '<div class="felt"><span class="felt-navn">Situasjon</span><div class="forhand">' + Object.keys(SCENARIO).map(function (k) { return '<button type="button" data-s="' + esc(k) + '">' + esc(k) + "</button>"; }).join("") + "</div></div>" +
        POSTER.map(function (p) {
          return '<div class="felt"><label for="' + id + p.id + '">' + esc(p.navn) + ' <output id="' + id + p.id + 'o"></output></label>' +
            '<input type="range" id="' + id + p.id + '" min="' + p.min + '" max="' + p.max + '" step="' + p.steg + '" value="' + st[p.id] + '" data-p="' + p.id + '"><small>' + esc(p.hint) + "</small></div>";
        }).join("") +
        '<label class="bryter"><input type="checkbox" id="' + id + 'slakk"' + (st.slakk ? " checked" : "") + '> Halvfull RSW-tank (fri væskeoverflate)</label>' +
        '<div class="felt"><label for="' + id + 'vis">Krengning i tegningen <output id="' + id + 'viso"></output></label><input type="range" id="' + id + 'vis" min="0" max="60" step="1" value="' + st.vis + '"><small>Se hvordan B flytter seg og GZ endrer seg.</small></div>' +
        "</div>" +
        '<div><div class="fig-flate stab-snitt"></div>' +
        '<p class="panel-tittel">GZ-kurve</p><div class="diagram stab-gz"></div>' +
        '<p class="panel-tittel">Tall</p><div class="tallrad stab-tall"></div>' +
        '<p class="panel-tittel">Kriterier (forenklet etter IMO for fiskefartøy)</p><ul class="kriterier stab-krit"></ul>' +
        '<p style="font-size:.82rem;color:var(--blekk-3);margin-top:10px">Læringsmodell – ikke et godkjent stabilitetsprogram. For et ekte fartøy gjelder stabilitetsboka.</p>' +
        "</div></div></div></div>";

      var snitt = $(".stab-snitt", el), gzBoks = $(".stab-gz", el), tall = $(".stab-tall", el), krit = $(".stab-krit", el);
      function vekter() {
        var v = [{ w: 33.5, kg: 2.12, tcg: 0 }, { w: 1.2, kg: 2.2, tcg: 0 }];
        POSTER.forEach(function (p) { if (st[p.id] > 0) v.push({ w: +st[p.id], kg: p.kg, tcg: p.tcg }); });
        return v;
      }
      function tegn() {
        POSTER.forEach(function (p) { $("#" + id + p.id + "o", el).textContent = FF.tall(st[p.id], p.steg < 0.5 ? 2 : 1) + " t"; });
        $("#" + id + "viso", el).textContent = st.vis + "°";
        var r = FF.stab.beregn(vekter(), st.slakk ? FSM_SLAKK : 0);
        snitt.innerHTML = FF.stab.tegnSnitt({ vinkel: st.vis, r: r, vekter: vekter(), hoyde: 470, alt: "Spantsnitt krenget " + st.vis + " grader." });
        var dg = gzDiagram(r, st.vis);
        gzBoks.innerHTML = dg.svg + '<div class="tips" hidden></div>';
        var svg = $("svg", gzBoks), tips = $(".tips", gzBoks), kryss = $(".kryss", gzBoks);
        function vis(e) {
          var rect = svg.getBoundingClientRect();
          var x = (e.clientX - rect.left) / rect.width * dg.W;
          var g = Math.max(0, Math.min(70, Math.round((x - dg.ml) / (dg.W - dg.ml - dg.mr) * 70)));
          var k = r.kurve[g];
          kryss.setAttribute("x1", dg.X(g)); kryss.setAttribute("x2", dg.X(g)); kryss.setAttribute("visibility", "visible");
          tips.hidden = false;
          tips.style.left = (dg.X(g) / dg.W * rect.width) + "px";
          tips.style.top = (dg.Y(k.gz) / 310 * rect.height) + "px";
          tips.innerHTML = "";
          var sterk = document.createElement("strong"); sterk.textContent = "GZ " + FF.tall(k.gz, 2) + " m";
          tips.appendChild(sterk); tips.appendChild(document.createTextNode(" ved " + g + "°"));
        }
        svg.addEventListener("pointermove", vis);
        svg.addEventListener("pointerleave", function () { tips.hidden = true; kryss.setAttribute("visibility", "hidden"); });
        var likevekt = r.likevekt == null ? "Kantrer" : FF.tall(r.likevekt, 1) + "°";
        tall.innerHTML = [
          ["Deplasement", FF.tall(r.D, 1) + " t"], ["Dypgående", FF.tall(r.T, 2) + " m"], ["Fribord", FF.tall(r.fribord, 2) + " m", r.fribord < 0.9],
          ["KG", FF.tall(r.KG, 2) + " m"], ["KM", FF.tall(r.KM, 2) + " m"], ["GM", FF.tall(r.GM, 2) + " m", r.GM < 0.35, true],
          ["Krengning i ro", likevekt, r.likevekt == null || r.likevekt > 5], ["Dekkskant i vann", r.dekkVinkel != null ? r.dekkVinkel + "°" : "–"], ["Største GZ", FF.tall(r.maksGZ, 2) + " m · " + r.maksVinkel + "°"]
        ].map(function (t) { return '<div class="' + (t[2] ? "fare" : "") + '"><span>' + t[0] + '</span><strong class="' + (t[3] ? "stor" : "") + '">' + t[1] + "</strong></div>"; }).join("");
        var k = [
          ["GM i rett stilling", r.GM >= 0.35, FF.tall(r.GM, 2) + " m", "minst 0,35 m"],
          ["GZ ved 30°", r.gz30 >= 0.2, FF.tall(r.gz30, 2) + " m", "minst 0,20 m"],
          ["Største GZ ved", r.maksVinkel >= 25, r.maksVinkel + "°", "minst 25°"],
          ["Areal under kurven 0–30°", r.a30 >= 0.055, FF.tall(r.a30, 3), "minst 0,055 m·rad"],
          ["Areal under kurven 0–40°", r.a40 >= 0.09, FF.tall(r.a40, 3), "minst 0,090 m·rad"],
          ["Areal under kurven 30–40°", r.a3040 >= 0.03, FF.tall(r.a3040, 3), "minst 0,030 m·rad"]
        ];
        krit.innerHTML = k.map(function (x) {
          return '<li class="' + (x[1] ? "ok" : "ikke") + '"><span class="ikon" aria-hidden="true">' + (x[1] ? "✓" : "✕") + "</span><span>" + x[0] + ' <span class="skjult-visuelt">' + (x[1] ? "oppfylt" : "ikke oppfylt") + '</span></span><span class="mono">' + x[2] + " · " + x[3] + "</span></li>";
        }).join("");
        lagreUtkast("stab", st);
      }
      $$("input[type=range][data-p]", el).forEach(function (inp) {
        inp.addEventListener("input", function () { st[inp.getAttribute("data-p")] = +inp.value; $$(".forhand button", el).forEach(function (b) { b.setAttribute("aria-pressed", "false"); }); tegn(); });
      });
      $("#" + id + "vis", el).addEventListener("input", function () { st.vis = +this.value; tegn(); });
      $("#" + id + "slakk", el).addEventListener("change", function () { st.slakk = this.checked; tegn(); });
      $$(".forhand button", el).forEach(function (b) {
        b.addEventListener("click", function () {
          var sc = SCENARIO[b.getAttribute("data-s")];
          Object.keys(sc).forEach(function (k) { st[k] = sc[k]; });
          POSTER.forEach(function (p) { $("#" + id + p.id, el).value = st[p.id]; });
          $("#" + id + "slakk", el).checked = st.slakk;
          $$(".forhand button", el).forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
          tegn();
        });
      });
      tegn();
    }
  };

  /* ================= Lanterner ================= */

  function aspektTekst(b) {
    b = ((b % 360) + 360) % 360;
    var ord = [[0, "rett forfra"], [45, "fra styrbord baug"], [90, "tvers om styrbord"], [135, "fra styrbord låring"], [180, "rett akterfra"], [225, "fra babord låring"], [270, "tvers om babord"], [315, "fra babord baug"], [360, "rett forfra"]];
    var best = ord.reduce(function (a, c) { return Math.abs(c[0] - b) < Math.abs(a[0] - b) ? c : a; });
    return best[1];
  }
  function minikart(b) {
    var a = (b - 90) * Math.PI / 180;
    var ox = 60 + Math.cos(a) * 44, oy = 60 + Math.sin(a) * 44;
    return '<svg viewBox="0 0 120 120" width="150" height="150" aria-hidden="true">' +
      '<circle cx="60" cy="60" r="44" fill="none" stroke="var(--linje-2)" stroke-dasharray="3 3"/>' +
      '<path d="M60 38 C68 46 69 58 68 80 L52 80 C51 58 52 46 60 38 Z" fill="var(--overbygg)" stroke="var(--blekk)" stroke-width="1.5"/>' +
      '<line x1="' + ox.toFixed(1) + '" y1="' + oy.toFixed(1) + '" x2="60" y2="60" stroke="var(--magenta)" stroke-width="1.5" stroke-dasharray="4 3"/>' +
      '<circle cx="' + ox.toFixed(1) + '" cy="' + oy.toFixed(1) + '" r="7" fill="var(--magenta)"/><circle cx="' + ox.toFixed(1) + '" cy="' + oy.toFixed(1) + '" r="2.5" fill="var(--flate)"/>' +
      '<text x="60" y="12" text-anchor="middle" style="font:600 10px var(--f-mono);fill:var(--blekk-3)">BAUG</text></svg>';
  }

  FF.verktoy.lanterner = {
    tittel: "Lanternetrener",
    etikett: "Øvelse · Natt",
    kort: "Hvilket fartøy er det, og hvilken vei går det? Lær lanternene i mørket.",
    ingress: "Velg fartøy og hvor du ser det fra, eller test deg selv med tilfeldige fartøy i mørket.",
    bilde: function () { return FF.lys.tegn("tral", 40, { w: 400, h: 225, silhuett: true, skala: 10 }); },
    mount: function (el) {
      var typer = Object.keys(FF.lys.typer);
      var id = FF.uid("ly");
      var modus = "utforsk", type = "tral", b = 40, sil = true, poeng = 0, antall = 0;
      el.innerHTML = '<div class="vk">' + hode("Lanternetrener", '<div class="vk-faner" role="group" aria-label="Modus"><button type="button" data-m="utforsk" aria-pressed="true">Utforsk</button><button type="button" data-m="test" aria-pressed="false">Test deg</button></div>') +
        '<div class="vk-kropp"><div class="ly-innhold"></div></div></div>';
      var inn = $(".ly-innhold", el);
      function utforsk() {
        inn.innerHTML = '<div class="vk-rad"><div class="felter">' +
          '<div class="felt"><label for="' + id + 't">Fartøy</label><select id="' + id + 't">' + typer.map(function (t) { return '<option value="' + t + '"' + (t === type ? " selected" : "") + ">" + esc(FF.lys.typer[t].navn) + "</option>"; }).join("") + "</select></div>" +
          '<div class="felt"><label for="' + id + 'b">Du ser fartøyet</label><input type="range" id="' + id + 'b" min="0" max="359" step="1" value="' + b + '"><output class="les-av" style="font-size:1.35rem;text-transform:none;letter-spacing:0"></output></div>' +
          '<div style="display:flex;gap:14px;align-items:center">' + '<span class="ly-mini"></span><p class="ly-forkl" style="font-size:.92rem"></p></div>' +
          '<label class="bryter"><input type="checkbox" id="' + id + 's"' + (sil ? " checked" : "") + "> Vis omrisset av fartøyet</label>" +
          '</div><div><div class="natt-flate ly-bilde"></div><p class="ly-kort" style="margin-top:10px;font-size:.95rem"></p></div></div>';
        function tegn() {
          $("output", inn).textContent = aspektTekst(b) + " (" + b + "°)";
          $(".ly-mini", inn).innerHTML = minikart(b);
          $(".ly-bilde", inn).innerHTML = FF.lys.tegn(type, b, { w: 640, h: 360, silhuett: sil, skala: 16, r: 11, tekst: FF.lys.typer[type].navn.toUpperCase() + " · SETT " + aspektTekst(b).toUpperCase() });
          $(".ly-kort", inn).textContent = FF.lys.typer[type].kort;
          $(".ly-forkl", inn).textContent = "Den rosa prikken er deg. Snu glidebryteren og se hvilke lys som blir synlige.";
        }
        $("#" + id + "t", inn).addEventListener("change", function () { type = this.value; tegn(); });
        $("#" + id + "b", inn).addEventListener("input", function () { b = +this.value; tegn(); });
        $("#" + id + "s", inn).addEventListener("change", function () { sil = this.checked; tegn(); });
        tegn();
      }
      function test() {
        var t = typer[Math.floor(Math.random() * typer.length)];
        var bb = [0, 30, 60, 90, 130, 180, 230, 270, 300, 330][Math.floor(Math.random() * 10)];
        if (t === "ankret" || t === "fiskstille") bb = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
        var valg = FF.bland([t].concat(FF.bland(typer.filter(function (x) { return x !== t; })).slice(0, 3)));
        inn.innerHTML = '<div class="natt-flate">' + FF.lys.tegn(t, bb, { w: 640, h: 320, silhuett: false, skala: 16, r: 11, tekst: "HVA SER DU?" }) + "</div>" +
          '<p class="panel-tittel">Hva slags fartøy er dette?</p><div class="svar-knapper">' + valg.map(function (v) { return '<button type="button" data-v="' + v + '">' + esc(FF.lys.typer[v].navn) + "</button>"; }).join("") + "</div>" +
          '<p class="tilbakemelding" aria-live="polite"></p><div style="display:flex;gap:12px;align-items:center;margin-top:12px"><button type="button" class="knapp liten ly-neste">Neste fartøy</button><span class="poeng">' + poeng + " av " + antall + " riktige</span></div>";
        $(".svar-knapper", inn).addEventListener("click", function (e) {
          var k = e.target.closest("button");
          if (!k || k.disabled) return;
          antall += 1;
          var ok = k.getAttribute("data-v") === t;
          if (ok) poeng += 1;
          $$(".svar-knapper button", inn).forEach(function (x) { x.disabled = true; if (x.getAttribute("data-v") === t) x.classList.add("riktig"); else if (x === k) x.classList.add("feil"); });
          $(".tilbakemelding", inn).innerHTML = "<strong>" + (ok ? "Riktig. " : "Feil. ") + "</strong>" + esc(FF.lys.typer[t].kort) + " Du ser fartøyet " + aspektTekst(bb) + ".";
          $(".poeng", inn).textContent = poeng + " av " + antall + " riktige";
        });
        $(".ly-neste", inn).addEventListener("click", test);
      }
      $$(".vk-faner button", el).forEach(function (k) {
        k.addEventListener("click", function () {
          modus = k.getAttribute("data-m");
          $$(".vk-faner button", el).forEach(function (x) { x.setAttribute("aria-pressed", x === k ? "true" : "false"); });
          if (modus === "test") test(); else utforsk();
        });
      });
      utforsk();
    }
  };

  /* ================= Vikeplikt ================= */

  var TYPE = {
    maskin: { navn: "maskindrevet fartøy", merke: "" },
    tral: { navn: "tråler i fiske", merke: "kjegler" },
    seil: { navn: "seilbåt under seil", merke: "seil" },
    ikkeman: { navn: "fartøy ikke under kommando", merke: "kuler" }
  };
  // [meg, andre, bx, by, bKurs, riktig, forklaring]
  var SITUASJONER = [
    ["maskin", "maskin", 0, -150, 180, "begge", "Regel 14: Dere går rett mot hverandre. Begge viker til styrbord og passerer babord mot babord."],
    ["maskin", "maskin", 130, -90, 270, "meg", "Regel 15: Du har det andre fartøyet på din styrbord side. Du skal vike – helst ved å gå aktenfor det."],
    ["maskin", "maskin", -130, -90, 90, "andre", "Regel 15 og 17: Det andre fartøyet har deg på sin styrbord side og skal vike. Du holder kurs og fart, men følger med."],
    ["maskin", "maskin", 20, -110, 0, "meg", "Regel 13: Du tar igjen et fartøy som går saktere i samme retning. Den som tar igjen, skal holde seg unna."],
    ["maskin", "maskin", -30, 120, 0, "andre", "Regel 13: Det andre fartøyet kommer bakfra og tar deg igjen. Det skal holde seg unna. Du holder kurs og fart."],
    ["maskin", "tral", -130, -90, 90, "meg", "Regel 18: Et maskindrevet fartøy skal holde seg unna et fartøy som driver fiske – selv om tråleren kommer fra babord."],
    ["maskin", "seil", -130, -90, 90, "meg", "Regel 18: Et maskindrevet fartøy skal holde seg unna et seilfartøy."],
    ["maskin", "ikkeman", 120, -120, 230, "meg", "Regel 18: Et fartøy som ikke er under kommando, kan ikke manøvrere. Du skal holde deg unna."],
    ["tral", "maskin", 130, -90, 270, "andre", "Regel 18: Du driver fiske med trål. Det maskindrevne fartøyet skal holde seg unna deg, selv om det kommer fra styrbord."],
    ["tral", "seil", 130, -90, 270, "andre", "Regel 18: Et seilfartøy skal holde seg unna et fartøy som driver fiske."],
    ["tral", "ikkeman", -120, -120, 130, "meg", "Regel 18: Også et fartøy som driver fiske, skal så langt det er mulig holde seg unna et fartøy som ikke er under kommando."]
  ];

  function dagsignal(x, y, merke) {
    if (merke === "kjegler") return '<g transform="translate(' + x + " " + y + ')"><path d="M-8 -22 L0 -8 L8 -22 Z M-8 6 L0 -8 L8 6 Z" fill="var(--blekk)"/></g>';
    if (merke === "kuler") return '<g transform="translate(' + x + " " + y + ')"><circle cy="-16" r="7" fill="var(--blekk)"/><circle cy="2" r="7" fill="var(--blekk)"/></g>';
    return "";
  }
  function seilbaat(x, y, v) {
    return '<g transform="translate(' + x + " " + y + ") rotate(" + v + ')"><path d="M0 -26 C10 -14 11 0 10 20 L-10 20 C-11 0 -10 -14 0 -26 Z" fill="var(--overbygg)" stroke="var(--blekk)" stroke-width="1.5"/><path d="M0 -14 L0 14 L18 10 Z" fill="var(--flate)" stroke="var(--blekk)"/></g>';
  }
  function situasjonSvg(s) {
    var id = FF.uid("vs");
    var cx = 300, cy = 250;
    var out = '<svg viewBox="0 0 600 420" role="img" aria-label="Situasjon sett ovenfra: ditt fartøy A og fartøy B.">';
    out += "<defs>" + FF.svg.pil(id, "var(--blekk-3)") + "</defs>";
    out += '<rect width="600" height="420" fill="var(--sjo)"/>';
    for (var r = 60; r <= 240; r += 60) out += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="var(--sjo-dyp)" stroke-width="1"/>';
    // Kurslinjer
    out += '<line x1="' + cx + '" y1="' + cy + '" x2="' + cx + '" y2="' + (cy - 150) + '" stroke="var(--blekk-3)" stroke-width="1.5" stroke-dasharray="6 5" marker-end="url(#' + id + ')"/>';
    var bx = cx + s[2], by = cy + s[3], rad = (s[4] - 90) * Math.PI / 180;
    out += '<line x1="' + bx + '" y1="' + by + '" x2="' + (bx + Math.cos(rad) * 110).toFixed(1) + '" y2="' + (by + Math.sin(rad) * 110).toFixed(1) + '" stroke="var(--blekk-3)" stroke-width="1.5" stroke-dasharray="6 5" marker-end="url(#' + id + ')"/>';
    out += s[0] === "seil" ? seilbaat(cx, cy, 0) : FF._baatTopp(cx, cy, 0, "var(--grunt-2)");
    out += s[1] === "seil" ? seilbaat(bx, by, s[4]) : FF._baatTopp(bx, by, s[4], "var(--overbygg)");
    out += dagsignal(cx + 36, cy - 10, TYPE[s[0]].merke) + dagsignal(bx + 38, by - 10, TYPE[s[1]].merke);
    out += '<text x="' + (cx - 28) + '" y="' + (cy + 52) + '" style="font:800 18px var(--f-sjablong);fill:var(--blekk)">A · DEG</text>';
    out += '<text x="' + (bx - 8) + '" y="' + (by + 48) + '" style="font:800 18px var(--f-sjablong);fill:var(--blekk)">B</text>';
    out += '<text x="16" y="28" style="font:700 17px var(--f-display);fill:var(--blekk)">A (deg): ' + esc(TYPE[s[0]].navn) + "</text>";
    out += '<text x="16" y="50" style="font:700 17px var(--f-display);fill:var(--blekk)">B: ' + esc(TYPE[s[1]].navn) + "</text>";
    return out + "</svg>";
  }

  FF.verktoy.vikeplikt = {
    tittel: "Vikepliktstrener",
    etikett: "Øvelse",
    kort: "Hvem skal vike? Elleve situasjoner med forklaring og regelnummer.",
    ingress: "Du er fartøy A. Se på situasjonen, bestem hvem som skal vike, og få forklaringen med regelnummer.",
    lys: true,
    bilde: function () { return situasjonSvg(SITUASJONER[1]); },
    mount: function (el) {
      var rekke = FF.bland(SITUASJONER), i = 0, poeng = 0, svart = 0;
      el.innerHTML = '<div class="vk">' + hode("Vikepliktstrener", '<span class="mono vp-teller"></span>') + '<div class="vk-kropp"><div class="vk-rad bred"><div class="fig-flate vp-bilde"></div><div><p class="panel-tittel">Hvem skal vike?</p><div class="svar-knapper vp-valg"></div><p class="tilbakemelding" aria-live="polite"></p><div style="display:flex;gap:12px;align-items:center;margin-top:12px"><button type="button" class="knapp liten vp-neste">Neste situasjon</button><span class="poeng"></span></div></div></div></div></div>';
      function vis() {
        var s = rekke[i % rekke.length];
        $(".vp-bilde", el).innerHTML = situasjonSvg(s);
        $(".vp-teller", el).textContent = "Situasjon " + ((i % rekke.length) + 1) + " av " + rekke.length;
        var valg = [["meg", "Jeg (A) skal vike"], ["andre", "B skal vike – jeg holder kurs og fart"], ["begge", "Begge skal vike til styrbord"]];
        $(".vp-valg", el).innerHTML = valg.map(function (v) { return '<button type="button" data-v="' + v[0] + '">' + v[1] + "</button>"; }).join("");
        $(".tilbakemelding", el).textContent = "";
        $(".poeng", el).textContent = poeng + " av " + svart + " riktige";
        $(".vp-valg", el).onclick = function (e) {
          var k = e.target.closest("button");
          if (!k || k.disabled) return;
          svart += 1;
          var ok = k.getAttribute("data-v") === s[5];
          if (ok) poeng += 1;
          $$(".vp-valg button", el).forEach(function (x) { x.disabled = true; if (x.getAttribute("data-v") === s[5]) x.classList.add("riktig"); else if (x === k) x.classList.add("feil"); });
          $(".tilbakemelding", el).innerHTML = "<strong>" + (ok ? "Riktig. " : "Ikke riktig. ") + "</strong>" + esc(s[6]);
          $(".poeng", el).textContent = poeng + " av " + svart + " riktige";
        };
      }
      $(".vp-neste", el).addEventListener("click", function () { i += 1; vis(); });
      vis();
    }
  };

  /* ================= Sektorfyr ================= */

  FF.verktoy.sektorfyr = {
    tittel: "Sektorfyr",
    etikett: "Simulator · Natt",
    kort: "Kjør båten over leia og se hvilken farge du ser – og hvilken vei du skal styre.",
    ingress: "Dra båten rundt i farvannet. Fargen du ser, avhenger av hvor du er – og hva du skal gjøre, avhenger av om du går mot fyret eller fra det.",
    bilde: function () { return FF.fig.sektorfyr(); },
    mount: function (el) {
      var fx = 500, fy = 70, bx = 470, by = 430, retning = "inn";
      el.innerHTML = '<div class="vk">' + hode("Sektorfyr", '<div class="vk-faner" role="group" aria-label="Retning"><button type="button" data-r="inn" aria-pressed="true">Mot fyret</button><button type="button" data-r="ut" aria-pressed="false">Fra fyret</button></div>') +
        '<div class="vk-kropp"><div class="vk-rad"><div><p class="les-av sf-farge">Hvitt</p><p class="sf-rad" style="margin-top:10px;font-size:1.05rem"></p><p style="margin-top:14px;font-size:.88rem;color:var(--blekk-3)">Dra båten med musa eller fingeren, eller bruk piltastene når tegningen er valgt.</p></div>' +
        '<div class="natt-flate sf-flate" tabindex="0" aria-label="Farvann med sektorfyr. Bruk piltastene for å flytte båten." style="touch-action:none;cursor:grab"></div></div></div></div>';
      var flate = $(".sf-flate", el);
      function farge() {
        var v = Math.atan2(by - fy, bx - fx) * 180 / Math.PI;
        if (v >= 84 && v <= 96) return "hvit";
        if (v > 96 && v <= 144) return "rod";
        if (v >= 36 && v < 84) return "gronn";
        return "ingen";
      }
      function tegn() {
        flate.innerHTML = FF.fig.sektorfyr({ bx: bx, by: by });
        // Snu båten når vi går fra fyret
        if (retning === "ut") {
          var b = flate.querySelector('path[fill="#e8eef2"]');
          if (b) b.setAttribute("transform", "rotate(180 " + bx + " " + (by - 3) + ")");
        }
        var f = farge();
        var tekst = { hvit: "Hvitt", rod: "Rødt", gronn: "Grønt", ingen: "Ingen lys" }[f];
        var rad = {
          inn: { hvit: "Du er i farbart vann. Hold kursen.", rod: "Du er for langt til babord. Styr mot styrbord til du ser hvitt.", gronn: "Du er for langt til styrbord. Styr mot babord til du ser hvitt.", ingen: "Du er utenfor sektorene. Finn fyret og posisjonen din i kartet." },
          ut: { hvit: "Du er i farbart vann. Hold kursen.", rod: "Du går fra fyret og ser rødt: Du er på din styrbord side av leia. Styr mot babord.", gronn: "Du går fra fyret og ser grønt: Du er på din babord side av leia. Styr mot styrbord.", ingen: "Du er utenfor sektorene. Finn fyret og posisjonen din i kartet." }
        }[retning][f];
        var fe = $(".sf-farge", el);
        fe.textContent = tekst;
        fe.style.color = f === "rod" ? "var(--babord)" : f === "gronn" ? "var(--styrbord)" : "var(--blekk)";
        $(".sf-rad", el).textContent = rad;
      }
      function flytt(e) {
        var r = flate.getBoundingClientRect();
        bx = Math.max(20, Math.min(980, (e.clientX - r.left) / r.width * 1000));
        by = Math.max(150, Math.min(540, (e.clientY - r.top) / r.height * 560));
        tegn();
      }
      var drar = false;
      flate.addEventListener("pointerdown", function (e) { drar = true; flate.setPointerCapture(e.pointerId); flytt(e); });
      flate.addEventListener("pointermove", function (e) { if (drar) flytt(e); });
      flate.addEventListener("pointerup", function () { drar = false; });
      flate.addEventListener("keydown", function (e) {
        var d = { ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12] }[e.key];
        if (!d) return;
        e.preventDefault();
        bx = Math.max(20, Math.min(980, bx + d[0])); by = Math.max(150, Math.min(540, by + d[1]));
        tegn();
      });
      $$(".vk-faner button", el).forEach(function (k) {
        k.addEventListener("click", function () {
          retning = k.getAttribute("data-r");
          $$(".vk-faner button", el).forEach(function (x) { x.setAttribute("aria-pressed", x === k ? "true" : "false"); });
          tegn();
        });
      });
      tegn();
    }
  };
})();

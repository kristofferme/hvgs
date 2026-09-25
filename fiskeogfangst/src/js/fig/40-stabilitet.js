/* Stabilitet: en enkel, men ekte 2D-modell av et spantsnitt.
   Oppdriftssenteret B regnes ut som tyngdepunktet til den neddykkede delen
   av snittet ved hver krengningsvinkel. Da blir GZ-kurven riktig i form,
   også ved store vinkler og når dekkskanten går i vannet. */

(function () {
  // Halvbredder for snittet (meter): [bredde fra senterlinjen, høyde over kjøl]
  var HALV = [[0.22, 0], [0.9, 0.12], [1.55, 0.36], [2.02, 0.72], [2.32, 1.15], [2.48, 1.65], [2.55, 2.15], [2.56, 2.55]];
  var DEKK = 2.55, SKANSE = 3.35, LEFF = 10.2, RHO = 1.025;

  function skrogPolygon() {
    var p = [];
    for (var i = HALV.length - 1; i >= 0; i--) p.push([-HALV[i][0], HALV[i][1]]);
    for (var j = 0; j < HALV.length; j++) p.push([HALV[j][0], HALV[j][1]]);
    return p;
  }
  var SKROG = skrogPolygon();

  function roter(pts, th) {
    var c = Math.cos(th), s = Math.sin(th);
    return pts.map(function (p) { return [p[0] * c + p[1] * s, -p[0] * s + p[1] * c]; });
  }
  function klipp(poly, h) {
    var ut = [];
    for (var i = 0; i < poly.length; i++) {
      var a = poly[i], b = poly[(i + 1) % poly.length];
      var ai = a[1] <= h, bi = b[1] <= h;
      if (ai) ut.push(a);
      if (ai !== bi) {
        var t = (h - a[1]) / (b[1] - a[1]);
        ut.push([a[0] + t * (b[0] - a[0]), h]);
      }
    }
    return ut;
  }
  function areal(poly) {
    var A = 0, cx = 0, cy = 0;
    for (var i = 0; i < poly.length; i++) {
      var a = poly[i], b = poly[(i + 1) % poly.length];
      var k = a[0] * b[1] - b[0] * a[1];
      A += k; cx += (a[0] + b[0]) * k; cy += (a[1] + b[1]) * k;
    }
    A /= 2;
    if (Math.abs(A) < 1e-9) return { A: 0, x: 0, y: 0 };
    return { A: Math.abs(A), x: cx / (6 * A), y: cy / (6 * A) };
  }
  // Neddykket areal ved vannlinje h for rotert snitt
  function nedsenket(th, h) { return areal(klipp(roter(SKROG, th), h)); }
  function finnVannlinje(th, A0) {
    var lo = -3, hi = 4;
    for (var i = 0; i < 50; i++) {
      var m = (lo + hi) / 2;
      if (nedsenket(th, m).A < A0) lo = m; else hi = m;
    }
    return (lo + hi) / 2;
  }
  function deplasement(T) { return nedsenket(0, T).A * LEFF * RHO; }
  function dypgaende(D) {
    var lo = 0.05, hi = DEKK + 0.6;
    for (var i = 0; i < 50; i++) { var m = (lo + hi) / 2; if (deplasement(m) < D) lo = m; else hi = m; }
    return (lo + hi) / 2;
  }
  // Vannlinjebredde ved dypgående T
  function bredde(T) {
    for (var i = 1; i < HALV.length; i++) {
      if (HALV[i][1] >= T) {
        var a = HALV[i - 1], b = HALV[i], t = (T - a[1]) / (b[1] - a[1]);
        return 2 * (a[0] + t * (b[0] - a[0]));
      }
    }
    return 2 * HALV[HALV.length - 1][0];
  }

  /* Regn ut alt for en lastkondisjon.
     vekter: [{w, kg, tcg}] (tonn, meter over kjøl, meter fra senterlinjen – styrbord positiv)
     fsm: fri væskeflate-moment i tonnmeter (legges til som virtuell heving av G) */
  function beregn(vekter, fsm) {
    var D = 0, M = 0, T_ = 0;
    vekter.forEach(function (v) { D += v.w; M += v.w * v.kg; T_ += v.w * (v.tcg || 0); });
    var KG = M / D + (fsm || 0) / D;
    var TCG = T_ / D;
    var T = dypgaende(D);
    var A0 = nedsenket(0, T).A;
    var B0 = nedsenket(0, T);
    var bw = bredde(T);
    var BM = (Math.pow(bw, 3) / 12) / A0;
    var KM = B0.y + BM;
    var GM = KM - KG;
    // GZ-kurve 0–70°
    var kurve = [];
    for (var g = 0; g <= 70; g += 1) {
      var th = g * Math.PI / 180;
      var h = finnVannlinje(th, A0);
      var B = nedsenket(th, h);
      var Gp = roter([[TCG, KG]], th)[0];
      kurve.push({ g: g, gz: B.x - Gp[0], h: h });
    }
    // Likevekt: der GZ krysser null fra minus til pluss (eller 0 hvis rett)
    var likevekt = 0;
    if (kurve[0].gz < 0) {
      likevekt = null;
      for (var i = 1; i < kurve.length; i++) {
        if (kurve[i - 1].gz < 0 && kurve[i].gz >= 0) {
          likevekt = kurve[i - 1].g + (-kurve[i - 1].gz) / (kurve[i].gz - kurve[i - 1].gz);
          break;
        }
      }
    }
    // Vinkel der dekkskanten går i vannet
    var dekkVinkel = null;
    for (var j = 0; j < kurve.length; j++) {
      var kant = roter([[HALV[HALV.length - 1][0], DEKK]], kurve[j].g * Math.PI / 180)[0];
      if (kant[1] <= kurve[j].h) { dekkVinkel = kurve[j].g; break; }
    }
    var maks = kurve.reduce(function (a, b) { return b.gz > a.gz ? b : a; }, kurve[0]);
    function arealUnder(fra, til) {
      var s = 0;
      for (var k = fra; k < til; k++) s += (kurve[k].gz + kurve[k + 1].gz) / 2 * (Math.PI / 180);
      return s;
    }
    return {
      D: D, KG: KG, TCG: TCG, T: T, A0: A0, KB: B0.y, BM: BM, KM: KM, GM: GM,
      fribord: DEKK - T, kurve: kurve, likevekt: likevekt, dekkVinkel: dekkVinkel,
      maksGZ: maks.gz, maksVinkel: maks.g, gz30: kurve[30].gz,
      a30: arealUnder(0, 30), a40: arealUnder(0, 40), a3040: arealUnder(30, 40)
    };
  }

  /* Tegn snittet ved en gitt vinkel */
  function tegnSnitt(o) {
    var th = (o.vinkel || 0) * Math.PI / 180;
    var r = o.r || beregn(o.vekter || FF.stab.standard(), o.fsm || 0);
    var A0 = r.A0;
    var h = finnVannlinje(th, A0);
    var sk = 78, cx = 500, cy = 330; // cy = kjølens plass i bildet
    function P(p) { return [cx + p[0] * sk, cy - p[1] * sk]; }
    function sti(pts) { return pts.map(function (p, i) { var q = P(p); return (i ? "L" : "M") + q[0].toFixed(1) + " " + q[1].toFixed(1); }).join(" ") + " Z"; }
    var skrog = roter(SKROG, th);
    var sub = klipp(skrog, h);
    var B = areal(sub);
    var Gp = roter([[r.TCG, r.KG]], th)[0];
    var K = roter([[0, 0]], th)[0];
    var CLtopp = roter([[0, 6.2]], th)[0];
    // M: der loddlinja gjennom B krysser senterlinja
    var dir = [Math.sin(th), Math.cos(th)];
    var tM = Math.abs(dir[0]) > 1e-4 ? (B.x - K[0]) / dir[0] : null;
    var Mp = tM != null ? [K[0] + dir[0] * tM, K[1] + dir[1] * tM] : [0, r.KM];
    var id = FF.uid("st");
    var s = '<svg viewBox="0 0 1000 ' + (o.hoyde || 520) + '" role="img" aria-label="' + FF.esc(o.alt || "Spantsnitt av fartøyet med tyngdepunkt G, oppdriftssenter B og metasenter M.") + '">';
    s += "<defs>" + FF.svg.pil(id + "a", "var(--blekk)") + FF.svg.pil(id + "g", "var(--babord)") + FF.svg.pil(id + "b", "var(--paabud)") + "</defs>";
    var wl = P([0, h])[1];
    s += '<rect x="0" y="' + wl + '" width="1000" height="' + (600 - wl) + '" fill="var(--sjo)"/>';
    s += '<line x1="0" y1="' + wl + '" x2="1000" y2="' + wl + '" stroke="var(--sjo-dyp)" stroke-width="2"/>';
    // Skansekledning
    var sL = roter([[-2.5, DEKK], [-2.46, SKANSE]], th), sR = roter([[2.5, DEKK], [2.46, SKANSE]], th);
    [sL, sR].forEach(function (p) { var a = P(p[0]), b = P(p[1]); s += '<line x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '" stroke="var(--skrog)" stroke-width="6"/>'; });
    // Styrhus-antydning
    var hus = roter([[-1.2, DEKK], [-1.2, 4.6], [1.2, 4.6], [1.2, DEKK]], th);
    s += '<path d="' + sti(hus) + '" fill="var(--overbygg)" stroke="var(--blekk)" stroke-width="1.5" opacity=".9"/>';
    s += '<path d="' + sti(skrog) + '" fill="var(--skrog)" fill-opacity="0.12" stroke="var(--skrog)" stroke-width="3"/>';
    s += '<path d="' + sti(sub) + '" fill="var(--paabud)" fill-opacity="0.16"/>';
    // Last i rommet
    if (o.last) {
      var rom = roter([[-1.8, 0.35], [-1.8, 1.9], [1.8, 1.9], [1.8, 0.35]], th);
      s += '<path d="' + sti(rom) + '" fill="none" stroke="var(--blekk-3)" stroke-dasharray="4 3"/>';
    }
    // Senterlinje
    var k = P(K), ct = P(CLtopp);
    s += '<line x1="' + k[0] + '" y1="' + k[1] + '" x2="' + ct[0] + '" y2="' + ct[1] + '" stroke="var(--blekk)" stroke-width="1" stroke-dasharray="8 4 2 4"/>';
    var g = P(Gp), b = P([B.x, B.y]), m = P(Mp);
    // Loddlinjer
    s += '<line x1="' + g[0] + '" y1="' + g[1] + '" x2="' + g[0] + '" y2="' + (g[1] + 95) + '" stroke="var(--babord)" stroke-width="3" marker-end="url(#' + id + 'g)"/>';
    s += '<line x1="' + b[0] + '" y1="' + b[1] + '" x2="' + b[0] + '" y2="' + (b[1] - 95) + '" stroke="var(--paabud)" stroke-width="3" marker-end="url(#' + id + 'b)"/>';
    if (th > 0.01) {
      s += '<line x1="' + b[0] + '" y1="' + b[1] + '" x2="' + m[0] + '" y2="' + m[1] + '" stroke="var(--paabud)" stroke-width="1" stroke-dasharray="3 3"/>';
      // GZ
      s += '<line x1="' + g[0] + '" y1="' + g[1] + '" x2="' + b[0] + '" y2="' + g[1] + '" stroke="var(--magenta)" stroke-width="3"/>';
      s += '<circle cx="' + b[0] + '" cy="' + g[1] + '" r="3.5" fill="var(--magenta)"/>';
      s += '<text x="' + (Math.max(g[0], b[0]) + 16) + '" y="' + (g[1] + 26) + '" style="font:700 18px var(--f-display);fill:var(--magenta)">GZ ' + FF.tall(Math.abs(B.x - Gp[0]), 2).replace(",", ",") + ' m</text>';
    }
    // Punktene
    function punkt(p, navn, farge, dx) {
      return '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="7" fill="var(--flate)" stroke="' + farge + '" stroke-width="2.5"/>' +
        '<text x="' + (p[0] + (dx || -14)) + '" y="' + (p[1] + 6) + '" text-anchor="' + ((dx || -14) < 0 ? "end" : "start") + '" style="font:800 20px var(--f-display);fill:' + farge + '">' + navn + "</text>";
    }
    s += '<circle cx="' + g[0] + '" cy="' + g[1] + '" r="9" fill="var(--flate)" stroke="var(--babord)" stroke-width="2.5"/>';
    s += '<path d="M' + g[0] + " " + (g[1] - 9) + " A9 9 0 0 1 " + (g[0] + 9) + " " + g[1] + " L" + g[0] + " " + g[1] + ' Z M' + g[0] + " " + (g[1] + 9) + " A9 9 0 0 1 " + (g[0] - 9) + " " + g[1] + " L" + g[0] + " " + g[1] + ' Z" fill="var(--babord)"/>';
    s += '<text x="' + (g[0] - 16) + '" y="' + (g[1] + 6) + '" text-anchor="end" style="font:800 20px var(--f-display);fill:var(--babord)">G</text>';
    s += punkt(b, "B", "var(--paabud)", 14);
    if (m[1] > 10) s += punkt(m, "M", "var(--blekk)", 14);
    s += punkt(k, "K", "var(--blekk)", -14);
    if (o.forklaring !== false) {
      s += '<g transform="translate(40 40)"><text style="font:700 15px var(--f-display);fill:var(--blekk)">' + (o.vinkel ? "KRENGNING " + FF.tall(o.vinkel, 0) + "°" : "RETT PÅ KJØL") + "</text>";
      s += '<text y="24" class="t-mono t-dempet">G – tyngdepunkt (vekta virker ned)</text>';
      s += '<text y="42" class="t-mono t-dempet">B – oppdriftssenter (oppdriften virker opp)</text>';
      s += '<text y="60" class="t-mono t-dempet">M – metasenter</text>';
      s += '<text y="78" class="t-mono t-dempet">K – kjøl · GZ – rettende arm</text></g>';
    }
    return s + "</svg>";
  }

  FF.stab = {
    beregn: beregn, tegnSnitt: tegnSnitt, DEKK: DEKK, LEFF: LEFF,
    standard: function () {
      return [
        { w: 33.5, kg: 2.12, tcg: 0 },   // lettskip
        { w: 2.5, kg: 0.55, tcg: 0 },    // drivstoff
        { w: 1.2, kg: 2.2, tcg: 0 },     // mannskap, proviant, utstyr
        { w: 6, kg: 1.1, tcg: 0 }        // fangst i rommet
      ];
    }
  };

  FF.fig.stabilitet = function (o) {
    o = o || {};
    return tegnSnitt({ vinkel: o.vinkel == null ? 25 : o.vinkel, vekter: o.vekter, fsm: o.fsm, alt: o.alt, hoyde: 470 });
  };
  FF.fig.stabilitet.bank = { a: { vinkel: 25 }, tekst: "Spantsnitt med G, B, M og rettende arm GZ." };

  /* Tre farlige situasjoner – G flytter seg */
  FF.fig.lastfare = function () {
    var s = '<svg viewBox="0 0 1000 360" role="img" aria-label="Tre situasjoner som flytter tyngdepunktet opp: ising, løft med kran og last på dekk.">';
    var panel = [
      ["Ising", "Is på rekke, mast og styrhus legger vekt høyt oppe. G stiger."],
      ["Løft med kran", "Vekta virker fra kranspissen. G flytter seg opp og ut til siden."],
      ["Last på dekk", "Fangst og redskap på dekk i stedet for i rommet. G stiger."]
    ];
    panel.forEach(function (p, i) {
      var x = 20 + i * 330, cx = x + 150, ky = 250;
      s += '<rect x="' + x + '" y="10" width="310" height="340" fill="var(--flate)" stroke="var(--linje)"/>';
      s += '<rect x="' + x + '" y="' + (ky - 60) + '" width="310" height="' + (360 - ky + 50) + '" fill="var(--sjo)" opacity=".7"/>';
      // Snitt
      s += '<path d="M' + (cx - 80) + " " + (ky - 110) + " L" + (cx - 80) + " " + (ky - 50) + " C" + (cx - 78) + " " + (ky - 10) + " " + (cx - 40) + " " + ky + " " + cx + " " + ky + " C" + (cx + 40) + " " + ky + " " + (cx + 78) + " " + (ky - 10) + " " + (cx + 80) + " " + (ky - 50) + " L" + (cx + 80) + " " + (ky - 110) + '" fill="none" stroke="var(--skrog)" stroke-width="4"/>';
      s += '<rect x="' + (cx - 34) + '" y="' + (ky - 170) + '" width="68" height="60" fill="var(--overbygg)" stroke="var(--blekk)" stroke-width="1.5"/>';
      var g0 = ky - 72, g1 = g0;
      if (i === 0) {
        s += '<path d="M' + (cx - 38) + " " + (ky - 174) + " h76 l-4 8 h-68 z M" + (cx - 84) + " " + (ky - 116) + " h12 v10 h-12 z M" + (cx + 72) + " " + (ky - 116) + ' h12 v10 h-12 z" fill="var(--grunt-2)" stroke="var(--blekk)"/>';
        for (var k = 0; k < 7; k++) s += '<path d="M' + (cx - 30 + k * 10) + " " + (ky - 166) + ' v10 l-2 -4" stroke="var(--grunt-2)" stroke-width="2" fill="none"/>';
        g1 = ky - 102;
      } else if (i === 1) {
        s += '<path d="M' + (cx + 50) + " " + (ky - 110) + " L" + (cx + 60) + " " + (ky - 200) + " L" + (cx + 130) + " " + (ky - 205) + '" fill="none" stroke="var(--oransje)" stroke-width="6"/>';
        s += '<line x1="' + (cx + 130) + '" y1="' + (ky - 205) + '" x2="' + (cx + 130) + '" y2="' + (ky - 120) + '" stroke="var(--blekk)"/>';
        s += '<rect x="' + (cx + 116) + '" y="' + (ky - 120) + '" width="28" height="22" fill="var(--garn)" stroke="var(--blekk)"/>';
        s += '<line x1="' + (cx + 130) + '" y1="' + (ky - 205) + '" x2="' + (cx + 130) + '" y2="' + (ky - 205) + '"/>';
        g1 = ky - 96;
      } else {
        for (var r = 0; r < 2; r++) for (var c = 0; c < 4; c++) s += '<rect x="' + (cx - 76 + c * 20) + '" y="' + (ky - 128 - r * 16) + '" width="18" height="14" fill="var(--grunt-2)" stroke="var(--blekk)" stroke-width="0.8"/>';
        g1 = ky - 90;
      }
      var gx1 = i === 1 ? cx + 22 : cx;
      s += '<circle cx="' + cx + '" cy="' + g0 + '" r="7" fill="none" stroke="var(--blekk-3)" stroke-width="2" stroke-dasharray="2 2"/>';
      s += '<line x1="' + cx + '" y1="' + g0 + '" x2="' + gx1 + '" y2="' + (g1 + 9) + '" stroke="var(--babord)" stroke-width="2"/>';
      s += '<circle cx="' + gx1 + '" cy="' + g1 + '" r="8" fill="var(--babord)"/>';
      s += '<text x="' + (gx1 + 12) + '" y="' + (g1 + 5) + '" style="font:800 16px var(--f-display);fill:var(--babord)">G</text>';
      s += '<text x="' + (x + 16) + '" y="44" style="font:700 22px var(--f-display);fill:var(--blekk)">' + p[0] + "</text>";
      var ord = p[1].split(" "), linje = "", ly = 296;
      ord.forEach(function (w) {
        if ((linje + " " + w).length > 40) { s += '<text x="' + (x + 16) + '" y="' + ly + '" class="t-mono" style="font-size:12px;fill:var(--blekk)">' + linje + "</text>"; ly += 17; linje = w; }
        else linje = linje ? linje + " " + w : w;
      });
      s += '<text x="' + (x + 16) + '" y="' + ly + '" class="t-mono" style="font-size:12px;fill:var(--blekk)">' + linje + "</text>";
    });
    return s + "</svg>";
  };

  /* Fri væskeoverflate */
  FF.fig.friVaeske = function () {
    var s = '<svg viewBox="0 0 1000 330" role="img" aria-label="Full tank og halvfull tank ved krengning. I den halvfulle tanken renner væsken mot den lave siden.">';
    function tank(x, fyll, tittel, tekst) {
      var r = '<g transform="translate(' + x + ' 30)">';
      r += '<g transform="rotate(14 200 120)"><rect x="60" y="40" width="280" height="160" fill="var(--flate)" stroke="var(--blekk)" stroke-width="3"/>';
      if (fyll === 1) r += '<rect x="62" y="42" width="276" height="156" fill="var(--paabud)" fill-opacity=".35"/>';
      r += "</g>";
      if (fyll < 1) {
        // Halvfull: væskeflaten holder seg vannrett
        r += '<clipPath id="tk' + x + '"><rect x="60" y="40" width="280" height="160" transform="rotate(14 200 120)"/></clipPath>';
        r += '<rect x="0" y="128" width="400" height="200" fill="var(--paabud)" fill-opacity=".35" clip-path="url(#tk' + x + ')"/>';
        r += '<line x1="40" y1="128" x2="360" y2="128" stroke="var(--paabud)" stroke-width="2"/>';
        r += '<path d="M120 112 C170 100 230 100 280 112" fill="none" stroke="var(--magenta)" stroke-width="2.5" marker-end="url(#fv' + x + ')"/>';
        r += '<defs>' + FF.svg.pil("fv" + x, "var(--magenta)") + "</defs>";
      }
      r += '<text x="200" y="262" text-anchor="middle" style="font:700 22px var(--f-display);fill:var(--blekk)">' + tittel + "</text>";
      r += '<text x="200" y="284" text-anchor="middle" class="t-mono t-dempet">' + tekst + "</text>";
      return r + "</g>";
    }
    s += tank(40, 1, "Full tank", "Væsken kan ikke flytte seg. Ingen ekstra fare.");
    s += tank(540, 0.5, "Slakk tank", "Væsken renner mot lav side. Virker som om G stiger.");
    return s + "</svg>";
  };
})();

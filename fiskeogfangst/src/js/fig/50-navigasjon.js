/* Navigasjon: sjømerker, sektorfyr, sjøkartutsnitt, fart–distanse–tid,
   tidevann, ekkolodd, vikeplikt og lanterner. */

(function () {
  var S = FF.svg;
  var SVART = "#121417", GUL = "#f4c20d", ROD = "#c8102e", GRONN = "#0b7a4b";

  /* ---------- Sjømerker ---------- */

  function stake(x, y, band, topp, h) {
    // Stake/bøye med fargebånd nedenfra og opp, og toppmerke
    h = h || 150;
    var w = 30, s = "";
    var n = band.length, bh = h / n;
    band.forEach(function (f, i) {
      s += '<rect x="' + (x - w / 2) + '" y="' + (y - (i + 1) * bh) + '" width="' + w + '" height="' + (bh + 0.5) + '" fill="' + f + '"/>';
    });
    s += '<rect x="' + (x - w / 2) + '" y="' + (y - h) + '" width="' + w + '" height="' + h + '" fill="none" stroke="var(--blekk)" stroke-width="1.5"/>';
    s += '<line x1="' + x + '" y1="' + (y - h) + '" x2="' + x + '" y2="' + (y - h - 22) + '" stroke="var(--blekk)" stroke-width="2.5"/>';
    s += topp(x, y - h - 22);
    s += '<ellipse cx="' + x + '" cy="' + (y + 2) + '" rx="34" ry="6" fill="var(--sjo-dyp)" opacity=".6"/>';
    return s;
  }
  function kjegle(x, y, opp, farge) {
    return opp ? '<path d="M' + (x - 13) + " " + y + " L" + x + " " + (y - 22) + " L" + (x + 13) + " " + y + ' Z" fill="' + farge + '"/>'
      : '<path d="M' + (x - 13) + " " + (y - 22) + " L" + x + " " + y + " L" + (x + 13) + " " + (y - 22) + ' Z" fill="' + farge + '"/>';
  }
  var TOPP = {
    nord: function (x, y) { return kjegle(x, y - 26, true, SVART) + kjegle(x, y - 2, true, SVART); },
    sor: function (x, y) { return kjegle(x, y - 26, false, SVART).replace("M", "M") + kjegle(x, y - 2, false, SVART); },
    ost: function (x, y) { return kjegle(x, y - 26, true, SVART) + kjegle(x, y - 2, false, SVART).replace(/-22/g, "-22"); },
    vest: function (x, y) { return kjegle(x, y - 26, false, SVART) + kjegle(x, y - 2, true, SVART); },
    babord: function (x, y) { return '<rect x="' + (x - 11) + '" y="' + (y - 24) + '" width="22" height="24" fill="' + ROD + '"/>'; },
    styrbord: function (x, y) { return kjegle(x, y, true, GRONN); },
    isolert: function (x, y) { return '<circle cx="' + x + '" cy="' + (y - 9) + '" r="8" fill="' + SVART + '"/><circle cx="' + x + '" cy="' + (y - 28) + '" r="8" fill="' + SVART + '"/>'; },
    sikker: function (x, y) { return '<circle cx="' + x + '" cy="' + (y - 10) + '" r="10" fill="' + ROD + '"/>'; }
  };
  // Øst-merket: spissene fra hverandre (øverst opp, nederst ned). Vest: spissene mot hverandre.
  TOPP.ost = function (x, y) { return kjegle(x, y - 24, true, SVART) + kjegle(x, y - 22 + 22, false, SVART).replace(/M/, "M"); };
  TOPP.ost = function (x, y) {
    return '<path d="M' + (x - 13) + " " + (y - 24) + " L" + x + " " + (y - 46) + " L" + (x + 13) + " " + (y - 24) + ' Z" fill="' + SVART + '"/>' +
      '<path d="M' + (x - 13) + " " + (y - 22) + " L" + x + " " + y + " L" + (x + 13) + " " + (y - 22) + ' Z" fill="' + SVART + '"/>';
  };
  TOPP.vest = function (x, y) {
    return '<path d="M' + (x - 13) + " " + (y - 46) + " L" + x + " " + (y - 24) + " L" + (x + 13) + " " + (y - 46) + ' Z" fill="' + SVART + '"/>' +
      '<path d="M' + (x - 13) + " " + y + " L" + x + " " + (y - 22) + " L" + (x + 13) + " " + y + ' Z" fill="' + SVART + '"/>';
  };
  TOPP.nord = function (x, y) {
    return '<path d="M' + (x - 13) + " " + (y - 24) + " L" + x + " " + (y - 46) + " L" + (x + 13) + " " + (y - 24) + ' Z" fill="' + SVART + '"/>' +
      '<path d="M' + (x - 13) + " " + y + " L" + x + " " + (y - 22) + " L" + (x + 13) + " " + y + ' Z" fill="' + SVART + '"/>';
  };
  TOPP.sor = function (x, y) {
    return '<path d="M' + (x - 13) + " " + (y - 46) + " L" + x + " " + (y - 24) + " L" + (x + 13) + " " + (y - 46) + ' Z" fill="' + SVART + '"/>' +
      '<path d="M' + (x - 13) + " " + (y - 22) + " L" + x + " " + y + " L" + (x + 13) + " " + (y - 22) + ' Z" fill="' + SVART + '"/>';
  };

  FF.fig.lateralmerker = function () {
    var id = FF.uid("lm");
    var s = '<svg viewBox="0 0 1000 420" role="img" aria-label="Lateralmerker: rødt babordmerke med sylinder og grønt styrbordmerke med kjegle, sett i hovedleiens retning.">';
    s += "<defs>" + S.pil(id, "var(--magenta)") + "</defs>";
    s += '<rect y="330" width="1000" height="90" fill="var(--sjo)"/>';
    s += stake(300, 330, [ROD, ROD, ROD], TOPP.babord, 170);
    s += stake(700, 330, [GRONN, GRONN, GRONN], TOPP.styrbord, 170);
    s += '<text x="300" y="380" text-anchor="middle" style="font:700 24px var(--f-display);fill:var(--babord)">BABORD</text>';
    s += '<text x="300" y="402" text-anchor="middle" class="t-mono t-dempet">rødt · sylinder · rødt lys</text>';
    s += '<text x="700" y="380" text-anchor="middle" style="font:700 24px var(--f-display);fill:var(--styrbord)">STYRBORD</text>';
    s += '<text x="700" y="402" text-anchor="middle" class="t-mono t-dempet">grønt · kjegle · grønt lys</text>';
    s += '<line x1="500" y1="320" x2="500" y2="70" stroke="var(--magenta)" stroke-width="3" marker-end="url(#' + id + ')"/>';
    s += '<text x="500" y="52" text-anchor="middle" style="font:700 17px var(--f-display);fill:var(--magenta)">HOVEDLEIENS RETNING</text>';
    s += '<text x="516" y="200" class="t-mono t-magenta">nordover langs kysten,</text><text x="516" y="216" class="t-mono t-magenta">innover i fjorder og havner</text>';
    s += '<text x="40" y="60" class="t-mono t-dempet">Går du i hovedleiens retning:</text><text x="40" y="78" class="t-mono t-dempet">rødt på babord, grønt på styrbord.</text>';
    return s + "</svg>";
  };

  FF.fig.kardinalmerker = function () {
    var s = '<svg viewBox="0 0 1000 720" role="img" aria-label="Kardinalmerker rundt en grunne. Nordmerket passeres på nordsiden, østmerket på østsiden, og så videre.">';
    var cx = 500, cy = 380;
    s += '<rect width="1000" height="720" fill="var(--flate)"/>';
    // Faresone
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="118" fill="var(--grunt)" stroke="var(--grunt-2)" stroke-width="2"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="62" fill="var(--grunt-2)"/>';
    s += '<text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" style="font:800 30px var(--f-display);fill:var(--blekk)">+</text>';
    s += '<text x="' + cx + '" y="' + (cy + 24) + '" text-anchor="middle" class="t-liten">GRUNNE</text>';
    // Kvadrantlinjer
    [45, 135, 225, 315].forEach(function (g) {
      var a = (g - 90) * Math.PI / 180;
      s += '<line x1="' + (cx + Math.cos(a) * 130) + '" y1="' + (cy + Math.sin(a) * 130) + '" x2="' + (cx + Math.cos(a) * 270) + '" y2="' + (cy + Math.sin(a) * 270) + '" stroke="var(--magenta)" stroke-width="1.2" stroke-dasharray="6 4"/>';
    });
    s += '<text x="' + (cx + 198) + '" y="' + (cy - 198) + '" class="t-mono t-magenta">NØ</text><text x="' + (cx - 214) + '" y="' + (cy - 198) + '" class="t-mono t-magenta">NV</text>';
    s += '<text x="' + (cx + 198) + '" y="' + (cy + 210) + '" class="t-mono t-magenta">SØ</text><text x="' + (cx - 214) + '" y="' + (cy + 210) + '" class="t-mono t-magenta">SV</text>';
    var merk = [
      ["NORD", cx, cy - 175, [GUL, SVART], TOPP.nord, "Passer nord for", "Lys: Q – hurtige blink"],
      ["SØR", cx, cy + 260, [SVART, GUL], TOPP.sor, "Passer sør for", "Lys: Q(6)+LFl"],
      ["ØST", cx + 250, cy + 70, [SVART, GUL, SVART], TOPP.ost, "Passer øst for", "Lys: Q(3) – 3 blink"],
      ["VEST", cx - 250, cy + 70, [GUL, SVART, GUL], TOPP.vest, "Passer vest for", "Lys: Q(9) – 9 blink"]
    ];
    merk.forEach(function (m) {
      s += stake(m[1], m[2], m[3], m[4], 110);
      var tx = m[1], ty = m[2] + 34;
      var anker = "middle";
      if (m[0] === "ØST") { tx = m[1] + 40; ty = m[2] - 70; anker = "start"; }
      if (m[0] === "VEST") { tx = m[1] - 40; ty = m[2] - 70; anker = "end"; }
      if (m[0] === "NORD") { tx = m[1] + 40; ty = m[2] - 90; anker = "start"; }
      if (m[0] === "SØR") { tx = m[1] - 40; ty = m[2] - 90; anker = "end"; }
      s += '<text x="' + tx + '" y="' + ty + '" text-anchor="' + anker + '" style="font:800 24px var(--f-display);fill:var(--blekk)">' + m[0] + "</text>";
      s += '<text x="' + tx + '" y="' + (ty + 20) + '" text-anchor="' + anker + '" class="t-mono" style="font-size:12px;fill:var(--blekk-2)">' + m[5] + "</text>";
      s += '<text x="' + tx + '" y="' + (ty + 37) + '" text-anchor="' + anker + '" class="t-mono t-dempet">' + m[6] + "</text>";
    });
    s += '<text x="30" y="44" style="font:700 20px var(--f-display);fill:var(--blekk)">Toppmerket peker mot det svarte</text>';
    s += '<text x="30" y="66" class="t-mono t-dempet">Nord: begge spisser opp – svart øverst.</text>';
    s += '<text x="30" y="84" class="t-mono t-dempet">Sør: begge spisser ned – svart nederst.</text>';
    s += '<text x="30" y="102" class="t-mono t-dempet">Øst: spissene fra hverandre – svart øverst og nederst.</text>';
    s += '<text x="30" y="120" class="t-mono t-dempet">Vest: spissene mot hverandre – svart på midten.</text>';
    return s + "</svg>";
  };

  FF.fig.andremerker = function () {
    var s = '<svg viewBox="0 0 1000 340" role="img" aria-label="Isolert faremerke og merke for sikkert vann.">';
    s += '<rect y="270" width="1000" height="70" fill="var(--sjo)"/>';
    s += stake(260, 270, [SVART, ROD, SVART], TOPP.isolert, 130);
    var st = "";
    // Sikkert vann: rød/hvite loddrette striper
    var x = 640, y = 270, h = 130;
    st += '<rect x="' + (x - 15) + '" y="' + (y - h) + '" width="30" height="' + h + '" fill="#fff"/>';
    st += '<rect x="' + (x - 15) + '" y="' + (y - h) + '" width="10" height="' + h + '" fill="' + ROD + '"/><rect x="' + (x + 5) + '" y="' + (y - h) + '" width="10" height="' + h + '" fill="' + ROD + '"/>';
    st += '<rect x="' + (x - 15) + '" y="' + (y - h) + '" width="30" height="' + h + '" fill="none" stroke="var(--blekk)" stroke-width="1.5"/>';
    st += '<line x1="' + x + '" y1="' + (y - h) + '" x2="' + x + '" y2="' + (y - h - 22) + '" stroke="var(--blekk)" stroke-width="2.5"/>' + TOPP.sikker(x, y - h - 22);
    s += st;
    s += '<text x="330" y="160" style="font:700 22px var(--f-display);fill:var(--blekk)">Isolert fare</text>';
    s += '<text x="330" y="182" class="t-mono t-dempet">Liten grunne med farbart vann rundt.</text><text x="330" y="198" class="t-mono t-dempet">To svarte kuler. Hvitt lys, Fl(2).</text>';
    s += '<text x="700" y="160" style="font:700 22px var(--f-display);fill:var(--blekk)">Sikkert vann</text>';
    s += '<text x="700" y="182" class="t-mono t-dempet">Midt i leia eller ved ansteving.</text><text x="700" y="198" class="t-mono t-dempet">Én rød kule. Hvitt lys.</text>';
    return s + "</svg>";
  };

  /* ---------- Sektorfyr ---------- */

  FF.fig.sektorfyr = function (o) {
    o = o || {};
    var fx = 500, fy = 70, R = 560;
    function sek(fra, til, farge, opa) {
      // vinkler i grader målt fra fyret, 90 = rett ned (mot sjøen)
      function p(g) { var a = g * Math.PI / 180; return [fx + Math.cos(a) * R, fy + Math.sin(a) * R]; }
      var a = p(fra), b = p(til);
      return '<path d="M' + fx + " " + fy + " L" + a[0].toFixed(1) + " " + a[1].toFixed(1) + " A" + R + " " + R + " 0 0 1 " + b[0].toFixed(1) + " " + b[1].toFixed(1) + ' Z" fill="' + farge + '" fill-opacity="' + opa + '"/>';
    }
    var s = '<svg viewBox="0 0 1000 560" role="img" aria-label="Sektorfyr sett ovenfra. Hvit sektor over farbart vann, rød sektor på babord side og grønn på styrbord side når du går mot fyret i leias retning.">';
    s += '<rect width="1000" height="560" fill="var(--natt)"/>';
    // Går du mot fyret i leias retning: rødt til babord (venstre), grønt til styrbord (høyre).
    s += sek(96, 144, "#ff3b4e", 0.32);
    s += sek(84, 96, "#ffffff", 0.24);
    s += sek(36, 84, "#27d27f", 0.3);
    // Land og grunner
    s += '<path d="M0 0 H1000 V60 C900 80 820 50 720 70 C640 86 600 60 540 64 C520 70 480 70 460 64 C400 56 340 90 260 70 C170 50 90 90 0 70 Z" fill="#3a3423"/>';
    s += '<path d="M160 330 c30 -20 70 -10 80 16 c-20 24 -70 22 -80 -16 z M770 300 c30 -18 64 -6 70 18 c-26 20 -60 16 -70 -18 z" fill="#3a3423" stroke="#6b6040"/>';
    s += '<text x="200" y="376" text-anchor="middle" class="t-mono" style="fill:#c9bfa0">skjær</text><text x="805" y="350" text-anchor="middle" class="t-mono" style="fill:#c9bfa0">skjær</text>';
    // Fyret
    s += '<circle cx="' + fx + '" cy="' + fy + '" r="9" fill="#fff"/><circle cx="' + fx + '" cy="' + fy + '" r="18" fill="none" stroke="#fff" stroke-opacity=".5"/>';
    s += '<text x="' + (fx + 26) + '" y="' + (fy - 18) + '" class="t-liten" style="fill:#f7d6ea">Fyr · Oc WRG 6s</text>';
    // Farleden
    s += '<line x1="500" y1="540" x2="500" y2="120" stroke="#ffffff" stroke-opacity=".6" stroke-width="1.5" stroke-dasharray="10 8"/>';
    // Båt
    var bx = o.bx || 500, by = o.by || 440;
    s += '<path d="M' + bx + " " + (by - 26) + " c11 12 13 30 11 46 h-22 c-2 -16 0 -34 11 -46 z" + '" fill="#e8eef2"/>';
    s += '<text x="' + (fx - 150) + '" y="480" text-anchor="middle" style="font:700 22px var(--f-display);fill:#ff8795">RØD</text>';
    s += '<text x="' + (fx - 150) + '" y="502" text-anchor="middle" class="t-mono" style="fill:#ffc2cb">for langt til babord</text>';
    s += '<text x="' + (fx + 150) + '" y="480" text-anchor="middle" style="font:700 22px var(--f-display);fill:#6ff0b0">GRØNN</text>';
    s += '<text x="' + (fx + 150) + '" y="502" text-anchor="middle" class="t-mono" style="fill:#b4f5d5">for langt til styrbord</text>';
    s += '<text x="' + fx + '" y="545" text-anchor="middle" style="font:700 18px var(--f-display);fill:#fff">HVIT – TRYGT</text>';
    return s + "</svg>";
  };
  FF.fig.sektorfyr.bank = { flate: "natt" };

  /* ---------- Sjøkartutsnitt ---------- */

  FF.fig.sjokart = function () {
    var s = '<svg viewBox="0 0 1000 600" role="img" aria-label="Utsnitt av et sjøkart med land, grunt vann, dybdekurver, dybdetall, skjær, sektorfyr, sjømerker og en kabel.">';
    s += '<rect width="1000" height="600" fill="var(--flate)"/>';
    // Grunt vann (to toner) og land
    var land = "M1000 0 H620 C640 60 600 110 640 150 C690 200 660 260 720 300 C770 334 760 400 820 430 C870 456 900 520 1000 540 Z";
    s += '<path d="' + land + '" fill="var(--grunt)" stroke="none" transform="translate(-60 0) scale(1.06 1.02)"/>';
    s += '<path d="' + land + '" fill="var(--grunt-2)" transform="translate(-28 0) scale(1.03 1.01)"/>';
    s += '<path d="' + land + '" fill="var(--land)" stroke="var(--blekk)" stroke-width="1.5"/>';
    // Holme
    s += '<ellipse cx="300" cy="190" rx="95" ry="54" fill="var(--grunt)"/><ellipse cx="300" cy="190" rx="62" ry="34" fill="var(--grunt-2)"/>';
    s += '<path d="M268 188 c10 -22 50 -26 66 -6 c8 14 -8 26 -30 26 c-22 0 -40 -6 -36 -20 z" fill="var(--land)" stroke="var(--blekk)" stroke-width="1.3"/>';
    s += '<text x="300" y="232" text-anchor="middle" style="font:italic 400 13px var(--f-tekst);fill:var(--blekk-2)">Storholmen</text>';
    // Dybdekurver
    s += '<path d="M470 0 C500 90 470 150 520 210 C570 270 560 340 640 400 C700 446 760 500 800 600" fill="none" stroke="var(--paabud)" stroke-width="1" stroke-dasharray="3 3"/>';
    s += '<path d="M360 0 C400 110 380 170 430 240 C480 320 470 380 560 450 C620 500 660 560 680 600" fill="none" stroke="var(--paabud)" stroke-width="1" stroke-dasharray="10 3 2 3"/>';
    s += '<text x="494" y="230" class="t-mono" style="fill:var(--paabud)">10</text><text x="408" y="258" class="t-mono" style="fill:var(--paabud)">20</text>';
    // Dybdetall
    var dyp = [[80, 60, "68"], [150, 420, "74"], [220, 520, "81"], [60, 300, "59"], [420, 80, "32"], [410, 380, "27"], [520, 520, "22"], [560, 140, "14"], [600, 330, "9"], [700, 470, "6₅"], [130, 180, "43"], [240, 330, "38"], [360, 470, "35"], [540, 40, "18"], [480, 300, "17"], [370, 110, "24"]];
    dyp.forEach(function (d) { s += '<text x="' + d[0] + '" y="' + d[1] + '" style="font:italic 400 13px var(--f-tekst);fill:var(--blekk)">' + d[2] + "</text>"; });
    // Skjær
    s += '<text x="520" y="290" style="font:700 20px var(--f-mono);fill:var(--blekk)">+</text>';
    s += '<text x="642" y="232" style="font:700 22px var(--f-mono);fill:var(--blekk)">✳</text>';
    s += '<circle cx="530" cy="284" r="14" fill="none" stroke="var(--blekk)" stroke-dasharray="2 2"/>';
    // Sektorfyr på odden
    var fx = 640, fy = 150;
    function stråle(g, farge, l) { var a = g * Math.PI / 180; return '<line x1="' + fx + '" y1="' + fy + '" x2="' + (fx + Math.cos(a) * l).toFixed(1) + '" y2="' + (fy + Math.sin(a) * l).toFixed(1) + '" stroke="' + farge + '" stroke-width="1"/>'; }
    s += stråle(160, "var(--blekk-3)", 260) + stråle(176, "var(--blekk-3)", 280) + stråle(186, "var(--blekk-3)", 280) + stråle(205, "var(--blekk-3)", 260);
    s += '<path d="M' + fx + " " + fy + ' m-4 -2 q-6 -28 4 -44 q10 16 4 44 z" fill="var(--magenta)" transform="rotate(-70 ' + fx + " " + fy + ')"/>';
    s += '<circle cx="' + fx + '" cy="' + fy + '" r="4" fill="var(--blekk)"/>';
    s += '<text x="' + (fx - 140) + '" y="' + (fy - 30) + '" class="t-mono t-magenta">Oc WRG 6s 12m 9M</text>';
    s += '<text x="400" y="120" class="t-mono" style="fill:var(--babord)">R</text><text x="398" y="162" class="t-mono t-dempet">W</text><text x="404" y="222" class="t-mono" style="fill:var(--styrbord)">G</text>';
    // Lateralmerke og kardinalmerke
    s += '<path d="M565 400 l10 -18 l10 18 z" fill="var(--styrbord)" stroke="var(--blekk)"/><text x="590" y="400" class="t-mono t-dempet">Fl G 3s</text>';
    s += '<g transform="translate(496 280)"><path d="M0 0 l-6 -14 h12 z M0 -16 l-6 -14 h12 z" fill="var(--blekk)" transform="rotate(180 0 -15)"/></g>';
    s += '<text x="506" y="258" class="t-mono t-dempet">V-merke</text>';
    // Farled
    s += '<path d="M60 590 C200 470 340 380 470 330 C530 300 560 250 600 200" fill="none" stroke="var(--blekk)" stroke-width="1.2" stroke-dasharray="12 6"/>';
    // Kabel
    s += '<path d="M0 520 q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="var(--magenta)" stroke-width="1.5"/>';
    s += '<text x="30" y="548" class="t-mono t-magenta">kabel – ankring forbudt</text>';
    // Ankerplass og fiskeplass
    s += '<g transform="translate(780 560)" fill="none" stroke="var(--magenta)" stroke-width="2"><circle cx="0" cy="-16" r="4"/><path d="M0 -12 V8 M-8 -4 H8 M-12 0 C-10 10 10 10 12 0"/></g>';
    s += '<g transform="translate(160 120)" fill="none" stroke="var(--magenta)" stroke-width="2"><path d="M-22 0c8 -10 20 -12 30 -6l10 -7v26l-10 -7c-10 6 -22 4 -30 -6z"/></g>';
    // Kompassrose-utsnitt
    s += FF.fig.kompassrose(110, 330, 56);
    // Målestokk
    s += '<g transform="translate(700 30)"><rect width="60" height="6" fill="var(--blekk)"/><rect x="60" width="60" height="6" fill="var(--flate)" stroke="var(--blekk)"/><rect x="120" width="60" height="6" fill="var(--blekk)"/><text y="22" class="t-mono t-dempet">0</text><text x="180" y="22" text-anchor="end" class="t-mono t-dempet">0,5 nm</text></g>';
    return s + "</svg>";
  };

  /* ---------- Fart, distanse, tid ---------- */

  FF.fig.fdt = function () {
    var s = '<svg viewBox="0 0 1000 360" role="img" aria-label="Trekanten for distanse, fart og tid. Distanse øverst, fart og tid nederst.">';
    s += '<path d="M200 30 L360 310 L40 310 Z" fill="var(--flate)" stroke="var(--blekk)" stroke-width="3" stroke-linejoin="round"/>';
    s += '<line x1="112" y1="190" x2="288" y2="190" stroke="var(--blekk)" stroke-width="2"/><line x1="200" y1="190" x2="200" y2="310" stroke="var(--blekk)" stroke-width="2"/>';
    s += '<text x="200" y="160" text-anchor="middle" style="font:800 58px var(--f-sjablong);fill:var(--magenta)">D</text>';
    s += '<text x="145" y="278" text-anchor="middle" style="font:800 50px var(--f-sjablong);fill:var(--blekk)">F</text>';
    s += '<text x="255" y="278" text-anchor="middle" style="font:800 50px var(--f-sjablong);fill:var(--blekk)">T</text>';
    var l = [["D = F × T", "distanse (nautiske mil) = fart (knop) × tid (timer)"], ["F = D ÷ T", "fart = distanse delt på tid"], ["T = D ÷ F", "tid = distanse delt på fart"]];
    l.forEach(function (x, i) {
      var y = 80 + i * 80;
      s += '<text x="440" y="' + y + '" style="font:600 30px var(--f-mono);fill:var(--blekk)">' + x[0] + "</text>";
      s += '<text x="440" y="' + (y + 24) + '" class="t-mono t-dempet" style="font-size:13px">' + x[1] + "</text>";
    });
    s += '<text x="440" y="330" class="t-mono t-magenta" style="font-size:13px">1 nautisk mil = 1852 m = 1 bueminutt breddegrad · 1 knop = 1 nm per time</text>';
    return s + "</svg>";
  };

  /* ---------- Tidevann ---------- */

  FF.fig.tidevann = function () {
    var x0 = 70, x1 = 960, y0 = 60, y1 = 300, T = 25, per = 12.42;
    function X(t) { return x0 + (x1 - x0) * t / T; }
    function Y(h) { return y0 + (y1 - y0) * (1 - (h + 1.2) / 2.4); }
    var d = "";
    for (var t = 0; t <= T; t += 0.1) { var h = Math.cos(2 * Math.PI * (t - 3.2) / per) * 0.95; d += (t ? " L" : "M") + X(t).toFixed(1) + " " + Y(h).toFixed(1); }
    var s = '<svg viewBox="0 0 1000 380" role="img" aria-label="Tidevannskurve over et døgn med to høyvann og to lavvann.">';
    for (var k = 0; k <= 24; k += 3) s += '<line x1="' + X(k) + '" x2="' + X(k) + '" y1="' + y0 + '" y2="' + y1 + '" stroke="var(--linje)"/><text x="' + X(k) + '" y="' + (y1 + 20) + '" text-anchor="middle" class="t-mono t-dempet">' + String(k).padStart(2, "0") + ":00</text>";
    s += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + Y(0) + '" y2="' + Y(0) + '" stroke="var(--blekk-3)" stroke-dasharray="4 4"/>';
    s += '<path d="' + d + ' L' + X(T) + " " + y1 + " L" + X(0) + " " + y1 + ' Z" fill="var(--grunt)"/>';
    s += '<path d="' + d + '" fill="none" stroke="var(--paabud)" stroke-width="3"/>';
    [[3.2, "HØYVANN"], [3.2 + per, "HØYVANN"]].forEach(function (p) { s += '<circle cx="' + X(p[0]) + '" cy="' + Y(0.95) + '" r="5" fill="var(--paabud)"/><text x="' + X(p[0]) + '" y="' + (Y(0.95) - 14) + '" text-anchor="middle" class="t-liten">' + p[1] + "</text>"; });
    [[3.2 + per / 2, "LAVVANN"], [3.2 + per * 1.5, "LAVVANN"]].forEach(function (p) { if (p[0] < T) s += '<circle cx="' + X(p[0]) + '" cy="' + Y(-0.95) + '" r="5" fill="var(--paabud)"/><text x="' + X(p[0]) + '" y="' + (Y(-0.95) + 26) + '" text-anchor="middle" class="t-liten">' + p[1] + "</text>"; });
    s += '<text x="' + X(6.3) + '" y="' + Y(0.2) + '" class="t-liten t-magenta" text-anchor="middle">FJÆRE ↘</text>';
    s += '<text x="' + X(12.4) + '" y="' + Y(0.2) + '" class="t-liten t-magenta" text-anchor="middle">FLO ↗</text>';
    var xa = X(9.5);
    s += '<line x1="' + xa + '" x2="' + xa + '" y1="' + Y(0.95) + '" y2="' + Y(-0.95) + '" stroke="var(--blekk)" stroke-width="1.5"/><line x1="' + (xa - 8) + '" x2="' + (xa + 8) + '" y1="' + Y(0.95) + '" y2="' + Y(0.95) + '" stroke="var(--blekk)"/><line x1="' + (xa - 8) + '" x2="' + (xa + 8) + '" y1="' + Y(-0.95) + '" y2="' + Y(-0.95) + '" stroke="var(--blekk)"/>';
    s += '<text x="' + (xa + 12) + '" y="' + (Y(-0.5)) + '" class="t-mono" style="font-size:12px;fill:var(--blekk)">tidevanns-</text><text x="' + (xa + 12) + '" y="' + (Y(-0.5) + 15) + '" class="t-mono" style="font-size:12px;fill:var(--blekk)">forskjell</text>';
    s += '<text x="' + x0 + '" y="40" style="font:700 18px var(--f-display);fill:var(--blekk)">Tidevann i løpet av et døgn</text>';
    s += '<text x="' + x0 + '" y="360" class="t-mono t-dempet">To flo og to fjære per døgn. Høyvann kommer ca. 50 minutter senere hver dag. Prinsippskisse.</text>';
    return s + "</svg>";
  };

  /* ---------- Ekkolodd ---------- */

  FF.fig.ekkolodd = function () {
    var W = 1000, H = 460, top = 30, dyp = 120;
    function Y(m) { return top + (H - top - 20) * m / dyp; }
    var id = FF.uid("ek");
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Ekkoloddbilde med bunnekko, en sildestim midt i vannet og torsk nær bunnen.">';
    s += '<defs><linearGradient id="' + id + 'b" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff2a1a"/><stop offset="0.25" stop-color="#ff9a1a"/><stop offset="0.5" stop-color="#e8e33a"/><stop offset="0.75" stop-color="#2fbf6a"/><stop offset="1" stop-color="#1b4fa8"/></linearGradient>' +
      '<radialGradient id="' + id + 's"><stop offset="0" stop-color="#ff2a1a"/><stop offset=".45" stop-color="#ffb21a"/><stop offset=".75" stop-color="#3cc56b"/><stop offset="1" stop-color="#1b4fa8" stop-opacity="0"/></radialGradient></defs>';
    s += '<rect width="' + W + '" height="' + H + '" fill="#050b1a"/>';
    // Overflatestøy
    for (var i = 0; i < 160; i++) { var x = i * 5.5; s += '<rect x="' + x + '" y="' + top + '" width="5" height="' + (6 + (i * 37 % 11)) + '" fill="#1b4fa8" opacity=".8"/>'; }
    // Bunn
    var bunn = "M0 " + Y(92);
    var pts = [];
    for (var xx = 0; xx <= 880; xx += 20) { var yy = 92 + Math.sin(xx / 120) * 5 + Math.sin(xx / 37) * 1.5 - (xx > 520 && xx < 700 ? (1 - Math.abs(xx - 610) / 90) * 14 : 0); pts.push([xx, yy]); bunn += " L" + xx + " " + Y(yy).toFixed(1); }
    s += '<path d="' + bunn + " L880 " + H + " L0 " + H + ' Z" fill="url(#' + id + 'b)"/>';
    s += '<path d="' + pts.map(function (p, i) { return (i ? "L" : "M") + p[0] + " " + Y(p[1] + 16).toFixed(1); }).join(" ") + '" fill="none" stroke="#e8e33a" stroke-width="3" opacity=".55"/>';
    // Sildestim
    s += '<ellipse cx="300" cy="' + Y(38) + '" rx="95" ry="30" fill="url(#' + id + 's)"/>';
    s += '<ellipse cx="330" cy="' + Y(36) + '" rx="40" ry="14" fill="#ff2a1a" opacity=".7"/>';
    // Fiskebuer nær bunnen
    [[560, 70], [610, 68], [640, 73], [700, 80], [470, 84], [760, 82]].forEach(function (f) {
      s += '<path d="M' + (f[0] - 14) + " " + (Y(f[1]) + 5) + " Q" + f[0] + " " + (Y(f[1]) - 7) + " " + (f[0] + 14) + " " + (Y(f[1]) + 5) + '" fill="none" stroke="#ff9a1a" stroke-width="4" stroke-linecap="round"/>';
      s += '<path d="M' + (f[0] - 8) + " " + (Y(f[1]) + 2) + " Q" + f[0] + " " + (Y(f[1]) - 5) + " " + (f[0] + 8) + " " + (Y(f[1]) + 2) + '" fill="none" stroke="#ff2a1a" stroke-width="3" stroke-linecap="round"/>';
    });
    // Dybdeskala
    s += '<rect x="880" y="0" width="120" height="' + H + '" fill="#0b1426"/>';
    for (var m = 0; m <= 120; m += 20) s += '<line x1="880" x2="892" y1="' + Y(m) + '" y2="' + Y(m) + '" stroke="#8aa0c0"/><text x="900" y="' + (Y(m) + 4) + '" style="font:500 12px var(--f-mono);fill:#8aa0c0">' + m + " m</text>";
    s += '<text x="900" y="' + (H - 60) + '" style="font:800 30px var(--f-sjablong);fill:#e8e33a">91</text><text x="902" y="' + (H - 42) + '" style="font:500 11px var(--f-mono);fill:#8aa0c0">DYBDE m</text>';
    s += '<text x="900" y="20" style="font:500 11px var(--f-mono);fill:#8aa0c0">50 kHz</text>';
    // Etiketter
    function et(x, y, tx, ty, t) { return '<line x1="' + x + '" y1="' + y + '" x2="' + tx + '" y2="' + ty + '" stroke="#fff" stroke-width="1"/><circle cx="' + x + '" cy="' + y + '" r="3" fill="#fff"/><text x="' + (tx + 6) + '" y="' + (ty + 4) + '" style="font:700 14px var(--f-display);fill:#fff;letter-spacing:.06em">' + t + "</text>"; }
    s += et(330, Y(36), 420, Y(16), "STIM · SILD");
    s += et(610, Y(68), 660, Y(50), "ENKELTFISK – BUER");
    s += et(200, Y(93), 120, Y(62), "BUNNEKKO");
    s += et(760, Y(108), 700, Y(116), "DOBBELTEKKO");
    s += '<text x="12" y="20" style="font:500 11px var(--f-mono);fill:#8aa0c0">← eldre   ·   nyest →</text>';
    return s + "</svg>";
  };
  FF.fig.ekkolodd.bank = { flate: "natt" };

  /* ---------- Vikeplikt: tre situasjoner ---------- */

  function baatTopp(x, y, vinkel, farge, navn) {
    return '<g transform="translate(' + x + " " + y + ") rotate(" + vinkel + ')"><path d="M0 -30 C12 -16 14 0 12 24 L-12 24 C-14 0 -12 -16 0 -30 Z" fill="' + farge + '" stroke="var(--blekk)" stroke-width="1.5"/>' +
      '<rect x="-6" y="-2" width="12" height="12" fill="var(--flate)" stroke="var(--blekk)"/></g>' +
      (navn ? '<text x="' + (x + 0) + '" y="' + (y + 50) + '" text-anchor="middle" style="font:800 18px var(--f-sjablong);fill:var(--blekk)">' + navn + "</text>" : "");
  }
  FF.fig.baatTopp = function (a) { return '<svg viewBox="-40 -40 80 80">' + baatTopp(0, 0, a.v || 0, a.f || "var(--overbygg)") + "</svg>"; };
  FF.fig.baatTopp.skjult = true;
  FF._baatTopp = baatTopp;

  FF.fig.vikeplikt = function () {
    var id = FF.uid("vp");
    var s = '<svg viewBox="0 0 1000 420" role="img" aria-label="Tre situasjoner: møtende kurs der begge viker til styrbord, kryssende kurs der den som har den andre på styrbord side viker, og innhenting der den som tar igjen viker.">';
    s += "<defs>" + S.pil(id, "var(--magenta)") + "</defs>";
    function panel(x, tittel, regel) {
      return '<rect x="' + x + '" y="10" width="316" height="400" fill="var(--sjo)" opacity=".55"/><text x="' + (x + 16) + '" y="42" style="font:700 22px var(--f-display);fill:var(--blekk)">' + tittel + '</text><text x="' + (x + 16) + '" y="62" class="t-mono t-dempet">' + regel + "</text>";
    }
    // Møtende
    s += panel(8, "Rett mot hverandre", "Regel 14");
    s += baatTopp(150, 330, 0, "var(--overbygg)", "A") + baatTopp(180, 130, 180, "var(--overbygg)", "B");
    s += '<path d="M150 296 C150 250 190 236 205 206" fill="none" stroke="var(--magenta)" stroke-width="2.5" marker-end="url(#' + id + ')"/>';
    s += '<path d="M180 164 C180 210 140 224 125 254" fill="none" stroke="var(--magenta)" stroke-width="2.5" marker-end="url(#' + id + ')"/>';
    s += '<text x="24" y="398" class="t-mono" style="font-size:12px;fill:var(--blekk)">Begge viker til styrbord.</text>';
    // Kryssende
    s += panel(342, "Kryssende kurs", "Regel 15");
    s += baatTopp(470, 330, 0, "var(--overbygg)", "A") + baatTopp(620, 200, 270, "var(--overbygg)", "B");
    s += '<path d="M470 296 C478 240 560 232 690 214" fill="none" stroke="var(--magenta)" stroke-width="2.5" marker-end="url(#' + id + ')"/>';
    s += '<path d="M470 296 L470 110" fill="none" stroke="var(--blekk-3)" stroke-width="1.2" stroke-dasharray="5 4"/>';
    s += '<text x="358" y="382" class="t-mono" style="font-size:12px;fill:var(--blekk)">A har B på sin styrbord side:</text><text x="358" y="398" class="t-mono" style="font-size:12px;fill:var(--blekk)">A viker og går aktenfor B.</text>';
    // Innhenting
    s += panel(676, "Innhenting", "Regel 13");
    s += '<path d="M840 170 L760 360 L920 360 Z" fill="var(--gul)" fill-opacity=".22" stroke="var(--gul)" stroke-dasharray="4 3"/>';
    s += baatTopp(840, 140, 0, "var(--overbygg)", "B") + baatTopp(820, 310, 0, "var(--overbygg)", "A");
    s += '<path d="M820 276 C820 230 790 200 796 150" fill="none" stroke="var(--magenta)" stroke-width="2.5" marker-end="url(#' + id + ')"/>';
    s += '<text x="692" y="382" class="t-mono" style="font-size:12px;fill:var(--blekk)">A kommer bakfra (mer enn 22,5° akter</text><text x="692" y="398" class="t-mono" style="font-size:12px;fill:var(--blekk)">for tvers) og holder seg unna.</text>';
    return s + "</svg>";
  };

  /* ---------- Lanterner ---------- */

  // Relativ peiling b: 0 = du ser baugen, 90 = du ser styrbord side, 180 = du ser akterenden.
  FF.lys = {
    typer: {
      maskin: { navn: "Maskindrevet fartøy under fart", kort: "Topplanterne, sidelanterner og hekklanterne.", lys: ["topp", "sb", "bb", "hekk"] },
      maskin50: { navn: "Maskindrevet fartøy over 50 m", kort: "To topplanterner (den akterste høyest), sidelanterner og hekk.", lys: ["topp", "topp2", "sb", "bb", "hekk"] },
      tral: { navn: "Tråler i fiske", kort: "Grønt over hvitt rundtlys. Side- og hekklanterner når den gjør fart.", lys: ["gronnR", "hvitR2", "sb", "bb", "hekk"] },
      fisk: { navn: "Fiskefartøy (ikke trål)", kort: "Rødt over hvitt rundtlys. Side- og hekklanterner når den gjør fart.", lys: ["rodR", "hvitR2", "sb", "bb", "hekk"] },
      fiskstille: { navn: "Fiskefartøy uten fart", kort: "Bare rødt over hvitt rundtlys – den ligger på redskapen.", lys: ["rodR", "hvitR2"] },
      ikkeman: { navn: "Ikke under kommando", kort: "To røde rundtlys under hverandre. Side- og hekklanterner når den gjør fart.", lys: ["rodR", "rodR2", "sb", "bb", "hekk"] },
      begrenset: { navn: "Begrenset manøvreringsevne", kort: "Rødt–hvitt–rødt rundtlys, i tillegg til vanlige lanterner under fart.", lys: ["rodR", "hvitRm", "rodR3", "topp", "sb", "bb", "hekk"] },
      ankret: { navn: "Fartøy til ankers (under 50 m)", kort: "Ett hvitt rundtlys der det best kan sees.", lys: ["anker"] },
      seil: { navn: "Seilfartøy under seil", kort: "Bare sidelanterner og hekklanterne – ingen topplanterne.", lys: ["sb", "bb", "hekk"] }
    },
    // [lengde forut (m), tverrskips styrbord (m), høyde (m), farge, sektor]
    pos: {
      topp: [3, 0, 8, "#fff", "topp"], topp2: [-9, 0, 11, "#fff", "topp"],
      sb: [1.5, 2.4, 4.2, "#27e083", "sb"], bb: [1.5, -2.4, 4.2, "#ff3b4e", "bb"], hekk: [-9, 0, 3, "#fff", "hekk"],
      gronnR: [0, 0, 11, "#27e083", "rundt"], rodR: [0, 0, 11, "#ff3b4e", "rundt"], rodR2: [0, 0, 9.2, "#ff3b4e", "rundt"],
      hvitR2: [0, 0, 9.2, "#fff", "rundt"], rodR3: [0, 0, 7.4, "#ff3b4e", "rundt"], hvitRm: [0, 0, 9.2, "#fff", "rundt"],
      anker: [7, 0, 6, "#fff", "rundt"]
    },
    synlig: function (sektor, b) {
      b = ((b % 360) + 360) % 360;
      if (sektor === "rundt") return true;
      if (sektor === "topp") return b <= 112.5 || b >= 247.5;
      if (sektor === "sb") return b <= 112.5;
      if (sektor === "bb") return b >= 247.5 || b === 0;
      if (sektor === "hekk") return b >= 112.5 && b <= 247.5;
      return false;
    },
    // Tegner lysene slik de ser ut fra observatøren. silhuett: vis skroget svakt
    tegn: function (type, b, o) {
      o = o || {};
      var t = FF.lys.typer[type];
      var W = o.w || 400, H = o.h || 260, sk = o.skala || 13;
      var cx = W / 2, cy = H * 0.72;
      var phi = (b + 270) * Math.PI / 180;
      function X(L, T) { return cx + (L * Math.cos(phi) + T * Math.sin(phi)) * sk; }
      var id = FF.uid("ly");
      var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="' + FF.esc(o.alt || "Lanterner i mørket") + '">';
      s += '<defs><filter id="' + id + '" x="-2" y="-2" width="5" height="5"><feGaussianBlur stdDeviation="' + (o.blur || 4) + '"/></filter></defs>';
      s += '<rect width="' + W + '" height="' + H + '" fill="' + (o.bakgrunn || "#03070b") + '"/>';
      s += '<line x1="0" x2="' + W + '" y1="' + cy + '" y2="' + cy + '" stroke="#1b2a36" stroke-width="1"/>';
      if (o.silhuett) {
        var bow = X(12, 0), stern = X(-10, 0), half = Math.abs(Math.sin(phi)) * 2.6 * sk;
        var xs = [bow, stern].sort(function (a, c) { return a - c; });
        s += '<path d="M' + (xs[0] - half) + " " + (cy - 2.6 * sk) + " L" + (xs[1] + half) + " " + (cy - 2.6 * sk) + " L" + (xs[1] + half - 6) + " " + (cy + 0.8 * sk) + " L" + (xs[0] - half + 6) + " " + (cy + 0.8 * sk) + ' Z" fill="#101c26"/>';
        s += '<line x1="' + X(0, 0) + '" x2="' + X(0, 0) + '" y1="' + (cy - 2.6 * sk) + '" y2="' + (cy - 11.4 * sk) + '" stroke="#101c26" stroke-width="3"/>';
      }
      t.lys.forEach(function (k) {
        var p = FF.lys.pos[k];
        if (!FF.lys.synlig(p[4], b)) return;
        var x = X(p[0], p[1]), y = cy - p[2] * sk;
        s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (o.r || 9) + '" fill="' + p[3] + '" filter="url(#' + id + ')" opacity=".9"/>';
        s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + ((o.r || 9) * 0.38) + '" fill="#fff"/>';
        s += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + ((o.r || 9) * 0.55) + '" fill="' + p[3] + '" opacity=".75"/>';
      });
      if (o.tekst) s += '<text x="14" y="' + (H - 14) + '" style="font:500 11px var(--f-mono);fill:#8aa0c0">' + o.tekst + "</text>";
      return s + "</svg>";
    }
  };

  FF.fig.lanterner = function (o) {
    o = o || {};
    return FF.lys.tegn(o.type || "tral", o.b == null ? 40 : o.b, { silhuett: o.silhuett !== false, w: 500, h: 280, tekst: o.tekst || FF.lys.typer[o.type || "tral"].navn.toUpperCase() + " · SETT FRA STYRBORD BAUG" });
  };
  FF.fig.lanterner.bank = { flate: "natt" };
})();

/* Motor: firetaktsprinsippet, kjølesystem, drivstoffsystem og tauverk. */

(function () {
  var S = FF.svg;

  /* Firetakt – fire ruter */
  FF.fig.firetakt = function () {
    var s = '<svg viewBox="0 0 1000 420" role="img" aria-label="De fire taktene i en dieselmotor: innsug, kompresjon, arbeid og eksos.">';
    var takt = [
      ["1", "Innsug", "Stempelet går ned. Frisk luft suges inn.", "inn", 1],
      ["2", "Kompresjon", "Ventilene er lukket. Stempelet presser lufta sammen, og den blir svært varm.", "ingen", 0],
      ["3", "Arbeid", "Diesel sprøytes inn og antennes av den varme lufta. Trykket presser stempelet ned.", "brann", 1],
      ["4", "Eksos", "Stempelet går opp og presser eksosen ut.", "ut", 0]
    ];
    takt.forEach(function (t, i) {
      var x = i * 250, cx = x + 125;
      var ned = t[4] === 1;
      var py = ned ? 196 : 140; // stempeltopp
      s += '<rect x="' + (x + 6) + '" y="6" width="238" height="408" fill="var(--flate)" stroke="var(--linje)"/>';
      // Sylinder
      s += '<path d="M' + (cx - 55) + " 90 L" + (cx - 55) + " 272 M" + (cx + 55) + " 90 L" + (cx + 55) + ' 272" stroke="var(--blekk)" stroke-width="5"/>';
      s += '<path d="M' + (cx - 70) + " 90 H" + (cx - 30) + " M" + (cx + 30) + " 90 H" + (cx + 70) + '" stroke="var(--blekk)" stroke-width="5"/>';
      // Ventiler
      var innApen = t[3] === "inn", utApen = t[3] === "ut";
      s += '<path d="M' + (cx - 38) + " " + (innApen ? 60 : 44) + " V" + (innApen ? 96 : 80) + " M" + (cx - 50) + " " + (innApen ? 96 : 80) + " H" + (cx - 26) + '" stroke="var(--paabud)" stroke-width="5"/>';
      s += '<path d="M' + (cx + 38) + " " + (utApen ? 60 : 44) + " V" + (utApen ? 96 : 80) + " M" + (cx + 26) + " " + (utApen ? 96 : 80) + " H" + (cx + 50) + '" stroke="var(--babord)" stroke-width="5"/>';
      // Dyse
      s += '<rect x="' + (cx - 5) + '" y="62" width="10" height="30" fill="var(--blekk)"/>';
      // Gass
      var fyll = t[3] === "inn" ? "var(--grunt-2)" : t[3] === "ingen" ? "var(--grunt-2)" : t[3] === "brann" ? "var(--oransje)" : "var(--dekk)";
      s += '<rect x="' + (cx - 52) + '" y="93" width="104" height="' + (py - 93) + '" fill="' + fyll + '" opacity="' + (t[3] === "ingen" ? 0.9 : 0.55) + '"/>';
      if (t[3] === "brann") s += '<path d="M' + cx + " 96 l-18 40 l14 -6 l-10 34 l30 -44 l-14 6 l12 -30 z" + '" fill="var(--gul)"/>';
      // Stempel og veivstang
      s += '<rect x="' + (cx - 50) + '" y="' + py + '" width="100" height="44" fill="var(--dekk)" stroke="var(--blekk)" stroke-width="2"/>';
      var vx = cx + (i % 2 ? -22 : 22), vy = ned ? 326 : 302;
      s += '<line x1="' + cx + '" y1="' + (py + 30) + '" x2="' + vx + '" y2="' + vy + '" stroke="var(--blekk)" stroke-width="10" stroke-linecap="round"/>';
      s += '<circle cx="' + cx + '" cy="314" r="28" fill="none" stroke="var(--blekk-3)" stroke-width="2" stroke-dasharray="4 3"/><circle cx="' + cx + '" cy="314" r="5" fill="var(--blekk)"/>';
      // Pil for stempelbevegelse
      s += '<text x="' + (cx + 64) + '" y="' + (py + 28) + '" style="font:700 22px var(--f-display);fill:var(--magenta)">' + (ned ? "↓" : "↑") + "</text>";
      // Tekst
      s += '<text x="' + (x + 20) + '" y="36" style="font:800 26px var(--f-sjablong);fill:var(--magenta)">' + t[0] + '</text><text x="' + (x + 44) + '" y="36" style="font:700 22px var(--f-display);fill:var(--blekk)">' + t[1] + "</text>";
      var ord = t[2].split(" "), linje = "", ly = 396 - 34;
      var linjer = [];
      ord.forEach(function (w) { if ((linje + " " + w).length > 30) { linjer.push(linje); linje = w; } else linje = linje ? linje + " " + w : w; });
      linjer.push(linje);
      ly = 408 - linjer.length * 15;
      linjer.forEach(function (l, j) { s += '<text x="' + (x + 20) + '" y="' + (ly + j * 15) + '" class="t-mono" style="font-size:11.5px;fill:var(--blekk-2)">' + l + "</text>"; });
    });
    return s + "</svg>";
  };

  function boks(x, y, w, h, t, u, fyll) {
    return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" fill="' + (fyll || "var(--flate)") + '" stroke="var(--blekk)" stroke-width="2"/>' +
      '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + (u ? -3 : 6)) + '" text-anchor="middle" style="font:700 17px var(--f-display);fill:var(--blekk)">' + t + "</text>" +
      (u ? '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 15) + '" text-anchor="middle" class="t-mono t-dempet">' + u + "</text>" : "");
  }

  /* Kjølesystem */
  FF.fig.kjoling = function () {
    var id = FF.uid("kj");
    var s = '<svg viewBox="0 0 1000 440" role="img" aria-label="Kjølesystem: sjøvann pumpes gjennom filter og varmeveksler og ut med eksosen. Ferskvann går i en lukket krets gjennom motoren.">';
    s += "<defs>" + S.pil(id + "s", "var(--paabud)") + S.pil(id + "f", "var(--oransje)") + "</defs>";
    s += '<rect x="0" y="380" width="1000" height="60" fill="var(--sjo)"/><text x="20" y="430" class="t-mono t-dempet">SJØEN</text>';
    s += boks(40, 250, 150, 64, "Bunnventil", "sjøkiste");
    s += boks(240, 250, 150, 64, "Sjøvannsfilter", "rens ofte");
    s += boks(440, 250, 150, 64, "Sjøvannspumpe", "impeller (gummi)", "var(--grunt)");
    s += boks(640, 250, 170, 64, "Varmeveksler", "sjø ↔ ferskvann", "var(--land)");
    s += boks(640, 60, 170, 70, "Motor", "ferskvann/kjølevæske", "var(--flate-2)");
    s += boks(450, 60, 150, 70, "Ekspansjonstank", "sjekk nivå kaldt");
    s += boks(860, 250, 110, 64, "Eksos", "vann ut");
    // Sjøvann
    s += '<path d="M115 380 V316" stroke="var(--paabud)" stroke-width="4" marker-end="url(#' + id + 's)"/>';
    [[190, 240], [390, 440], [590, 640], [810, 860]].forEach(function (p) { s += '<line x1="' + p[0] + '" y1="282" x2="' + (p[1] - 2) + '" y2="282" stroke="var(--paabud)" stroke-width="4" marker-end="url(#' + id + 's)"/>'; });
    s += '<path d="M915 314 V380" stroke="var(--paabud)" stroke-width="4" marker-end="url(#' + id + 's)"/>';
    // Ferskvann (lukket krets)
    s += '<path d="M700 130 V246" stroke="var(--oransje)" stroke-width="4" marker-end="url(#' + id + 'f)"/>';
    s += '<path d="M760 250 V134" stroke="var(--oransje)" stroke-width="4" marker-end="url(#' + id + 'f)"/>';
    s += '<path d="M640 95 H602" stroke="var(--oransje)" stroke-width="3" stroke-dasharray="6 4"/>';
    s += '<text x="40" y="44" style="font:700 22px var(--f-display);fill:var(--blekk)">Kjølesystemet</text>';
    s += '<text x="40" y="70" class="t-mono" style="font-size:12px;fill:var(--paabud)">━ Sjøvann: inn, gjennom veksleren og ut med eksosen</text>';
    s += '<text x="40" y="88" class="t-mono" style="font-size:12px;fill:var(--oransje-tekst)">━ Ferskvann/kjølevæske: lukket krets gjennom motoren</text>';
    s += '<text x="40" y="200" class="t-mono t-dempet">Sjekk at det kommer vann ut med eksosen</text><text x="40" y="216" class="t-mono t-dempet">etter start. Ikke vann = stopp motoren.</text>';
    return s + "</svg>";
  };

  /* Drivstoffsystem */
  FF.fig.drivstoff = function () {
    var id = FF.uid("ds");
    var s = '<svg viewBox="0 0 1000 300" role="img" aria-label="Drivstoffsystem fra tank via forfilter med vannutskiller, fødepumpe, finfilter og høytrykkspumpe til dysene.">';
    s += "<defs>" + S.pil(id, "var(--blekk)") + "</defs>";
    var b = [["Tank", "stengeventil"], ["Forfilter", "vannutskiller"], ["Fødepumpe", "lavt trykk"], ["Finfilter", ""], ["Høytrykks-", "pumpe"], ["Dyser", "i sylindrene"]];
    b.forEach(function (x, i) {
      var bx = 20 + i * 165;
      s += boks(bx, 110, 140, 70, x[0], x[1], i === 1 ? "var(--grunt)" : i === 0 ? "var(--land)" : "var(--flate)");
      if (i < b.length - 1) s += '<line x1="' + (bx + 140) + '" y1="145" x2="' + (bx + 163) + '" y2="145" stroke="var(--blekk)" stroke-width="3" marker-end="url(#' + id + ')"/>';
    });
    s += '<path d="M905 180 V240 H90 V184" fill="none" stroke="var(--blekk-3)" stroke-width="2" stroke-dasharray="6 4" marker-end="url(#' + id + ')"/>';
    s += '<text x="500" y="262" text-anchor="middle" class="t-mono t-dempet">returledning – overskuddsdiesel tilbake til tanken</text>';
    s += '<text x="20" y="50" style="font:700 22px var(--f-display);fill:var(--blekk)">Drivstoffsystemet</text>';
    s += '<text x="20" y="76" class="t-mono t-dempet">Vann og skitt er dieselmotorens verste fiender. Tapp vannutskilleren og bytt filter etter planen.</text>';
    return s + "</svg>";
  };

  /* Tauverk: fiber → garn → kordell → tau */
  FF.fig.tauverk = function () {
    var s = '<svg viewBox="0 0 1000 300" role="img" aria-label="Et tretslått tau åpnes opp: tauet består av tre kordeller, kordellene av garn, og garnet av fibrer.">';
    // Tau
    for (var i = 0; i < 12; i++) {
      var x = 40 + i * 30;
      s += '<path d="M' + x + " 110 C" + (x + 18) + " 118 " + (x + 26) + " 170 " + (x + 44) + ' 180" fill="none" stroke="var(--blekk)" stroke-width="30" stroke-linecap="round"/>';
      s += '<path d="M' + x + " 110 C" + (x + 18) + " 118 " + (x + 26) + " 170 " + (x + 44) + ' 180" fill="none" stroke="var(--tau)" stroke-width="26" stroke-linecap="round"/>';
    }
    // Tre kordeller spriker ut
    var farger = ["var(--tau)", "#d9b779", "#b58f4c"];
    [[-38, "Kordell"], [0, ""], [38, ""]].forEach(function (k, j) {
      s += '<path d="M430 145 C500 ' + (145 + k[0]) + " 560 " + (145 + k[0] * 1.8) + " 640 " + (145 + k[0] * 2.4) + '" fill="none" stroke="var(--blekk)" stroke-width="16" stroke-linecap="round"/>';
      s += '<path d="M430 145 C500 ' + (145 + k[0]) + " 560 " + (145 + k[0] * 1.8) + " 640 " + (145 + k[0] * 2.4) + '" fill="none" stroke="' + farger[j] + '" stroke-width="12" stroke-linecap="round"/>';
    });
    // Garn
    for (var g = 0; g < 5; g++) s += '<path d="M650 ' + (54 + g * 2) + " C700 " + (40 + g * 8) + " 740 " + (30 + g * 14) + " 800 " + (20 + g * 20) + '" fill="none" stroke="var(--tau)" stroke-width="3"/>';
    // Fibrer
    for (var f = 0; f < 14; f++) s += '<path d="M810 ' + (40 + f * 4) + " C840 " + (30 + f * 6) + " 880 " + (20 + f * 9) + " 940 " + (10 + f * 12) + '" fill="none" stroke="var(--tau)" stroke-width="1"/>';
    s += '<text x="120" y="240" style="font:700 20px var(--f-display);fill:var(--blekk)">Tau (tretslått)</text>';
    s += '<text x="520" y="260" style="font:700 20px var(--f-display);fill:var(--blekk)">Kordeller</text>';
    s += '<text x="700" y="140" style="font:700 20px var(--f-display);fill:var(--blekk)">Garn</text>';
    s += '<text x="870" y="220" style="font:700 20px var(--f-display);fill:var(--blekk)">Fibrer</text>';
    s += '<text x="120" y="262" class="t-mono t-dempet">Z-slått: kordellene går som i en Z.</text>';
    return s + "</svg>";
  };
})();

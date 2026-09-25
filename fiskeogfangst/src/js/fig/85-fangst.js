/* Fangst og kvalitet: behandlingslinja, temperatur og holdbarhet,
   råstoffutnyttelse og kvalitetsfeil. */

(function () {
  var S = FF.svg;

  /* Fangstbehandlingslinja om bord */
  FF.fig.fangstlinje = function () {
    var id = FF.uid("fl");
    var steg = [
      ["Bløgge", "Straks fisken er om bord – mens den lever"],
      ["Blø ut", "I rennende, rent sjøvann"],
      ["Sløye", "Innvoller ut, blodranda renses"],
      ["Vaske", "Rent sjøvann, fjern blod og slo"],
      ["Kjøle", "Is, RSW eller CSW – ned mot 0 °C"],
      ["Lagre", "Kasser eller tank, uten klem"]
    ];
    var s = '<svg viewBox="0 0 1000 300" role="img" aria-label="Fangstbehandling om bord i seks trinn: bløgge, blø ut, sløye, vaske, kjøle og lagre.">';
    s += "<defs>" + S.pil(id, "var(--magenta)") + "</defs>";
    var ikon = [
      // kniv
      '<path d="M-34 10 L20 -14 L30 -10 L-26 16 Z" fill="var(--dekk)" stroke="var(--blekk)" stroke-width="1.5"/><rect x="18" y="-18" width="26" height="12" rx="3" transform="rotate(-24 18 -18)" fill="var(--oransje)" stroke="var(--blekk)"/>',
      // kar med vann
      '<path d="M-38 -16 L-32 22 H32 L38 -16 Z" fill="var(--grunt-2)" stroke="var(--blekk)" stroke-width="1.5"/><path d="M-30 -2 q8 -6 16 0 t16 0 t16 0" fill="none" stroke="var(--paabud)" stroke-width="2"/><path d="M40 -26 v14" stroke="var(--paabud)" stroke-width="3"/>',
      // fisk åpen
      '<path d="M-38 0 C-20 -18 20 -18 34 0 C20 18 -20 18 -38 0 Z" fill="var(--fisk)" stroke="var(--blekk)" stroke-width="1.5"/><path d="M-20 4 C-4 12 14 12 26 4" fill="none" stroke="var(--babord)" stroke-width="3"/>',
      // spyling
      '<path d="M-38 6 C-20 -12 20 -12 34 6 C20 22 -20 22 -38 6 Z" fill="var(--fisk-lys)" stroke="var(--blekk)" stroke-width="1.5"/><path d="M-10 -30 l-6 16 M4 -30 v16 M18 -30 l6 16" stroke="var(--paabud)" stroke-width="2.5" stroke-linecap="round"/>',
      // snøfnugg / termometer
      '<rect x="-6" y="-30" width="12" height="46" rx="6" fill="var(--flate)" stroke="var(--blekk)" stroke-width="1.5"/><circle cx="0" cy="20" r="10" fill="var(--paabud)" stroke="var(--blekk)" stroke-width="1.5"/><rect x="-2" y="-4" width="4" height="22" fill="var(--paabud)"/><path d="M20 -22 v20 M10 -12 h20 M13 -19 l14 14 M27 -19 l-14 14" stroke="var(--paabud)" stroke-width="2"/>',
      // kasser
      '<rect x="-36" y="-2" width="34" height="22" fill="var(--grunt-2)" stroke="var(--blekk)" stroke-width="1.5"/><rect x="2" y="-2" width="34" height="22" fill="var(--grunt-2)" stroke="var(--blekk)" stroke-width="1.5"/><rect x="-17" y="-26" width="34" height="22" fill="var(--grunt-2)" stroke="var(--blekk)" stroke-width="1.5"/>'
    ];
    steg.forEach(function (st, i) {
      var cx = 85 + i * 166;
      s += '<circle cx="' + cx + '" cy="110" r="62" fill="var(--flate)" stroke="var(--blekk)" stroke-width="2"/>';
      s += '<g transform="translate(' + cx + ' 110)">' + ikon[i] + "</g>";
      s += '<text x="' + (cx - 56) + '" y="62" style="font:800 20px var(--f-sjablong);fill:var(--magenta)">' + String(i + 1).padStart(2, "0") + "</text>";
      s += '<text x="' + cx + '" y="206" text-anchor="middle" style="font:700 22px var(--f-display);fill:var(--blekk)">' + st[0] + "</text>";
      var ord = st[1].split(" "), linje = "", linjer = [];
      ord.forEach(function (w) { if ((linje + " " + w).length > 20) { linjer.push(linje); linje = w; } else linje = linje ? linje + " " + w : w; });
      linjer.push(linje);
      linjer.forEach(function (l, j) { s += '<text x="' + cx + '" y="' + (230 + j * 16) + '" text-anchor="middle" class="t-mono" style="font-size:11.5px;fill:var(--blekk-2)">' + l + "</text>"; });
      if (i < steg.length - 1) s += '<line x1="' + (cx + 66) + '" y1="110" x2="' + (cx + 98) + '" y2="110" stroke="var(--magenta)" stroke-width="2.5" marker-end="url(#' + id + ')"/>';
    });
    return s + "</svg>";
  };

  /* Temperatur og holdbarhet – prinsippskisse */
  FF.fig.temperatur = function () {
    var x0 = 90, x1 = 930, y0 = 50, y1 = 300;
    function X(d) { return x0 + (x1 - x0) * d / 14; }
    function Y(q) { return y1 - (y1 - y0) * q; }
    var kurver = [["0 °C", 13, "var(--paabud)"], ["4 °C", 7, "var(--styrbord)"], ["10 °C", 3.2, "var(--oransje)"]];
    var s = '<svg viewBox="0 0 1000 370" role="img" aria-label="Prinsippskisse: jo varmere fisken lagres, jo raskere synker kvaliteten.">';
    for (var d = 0; d <= 14; d += 2) s += '<line x1="' + X(d) + '" x2="' + X(d) + '" y1="' + y0 + '" y2="' + y1 + '" stroke="var(--linje)"/><text x="' + X(d) + '" y="' + (y1 + 22) + '" text-anchor="middle" class="t-mono t-dempet">' + d + "</text>";
    s += '<text x="' + ((x0 + x1) / 2) + '" y="' + (y1 + 48) + '" text-anchor="middle" class="t-liten">DAGER ETTER FANGST</text>';
    s += '<line x1="' + x0 + '" x2="' + x1 + '" y1="' + Y(0.35) + '" y2="' + Y(0.35) + '" stroke="var(--babord)" stroke-dasharray="6 4"/>';
    s += '<text x="' + (x1 - 4) + '" y="' + (Y(0.35) - 8) + '" text-anchor="end" class="t-mono" style="fill:var(--babord)">grense for god spisekvalitet</text>';
    s += '<text transform="translate(40 ' + ((y0 + y1) / 2) + ') rotate(-90)" text-anchor="middle" class="t-liten">KVALITET</text>';
    kurver.forEach(function (k) {
      var d = "";
      for (var t = 0; t <= 14; t += 0.2) {
        var q = 1 / (1 + Math.exp((t - k[1]) * 0.9 * (13 / (k[1] + 6))));
        d += (t ? " L" : "M") + X(t).toFixed(1) + " " + Y(0.1 + q * 0.85).toFixed(1);
      }
      s += '<path d="' + d + '" fill="none" stroke="' + k[2] + '" stroke-width="2.5" stroke-linecap="round"/>';
      // Direkte etikett ved kurven, med fargen som strek – teksten i blekk
      var lx = X(k[1]) + 10, ly = Y(0.62);
      s += '<line x1="' + lx + '" x2="' + (lx + 18) + '" y1="' + (ly - 5) + '" y2="' + (ly - 5) + '" stroke="' + k[2] + '" stroke-width="3"/>';
      s += '<text x="' + (lx + 24) + '" y="' + ly + '" style="font:700 16px var(--f-display);fill:var(--blekk)">' + k[0] + "</text>";
    });
    // Tegnforklaring
    kurver.forEach(function (k, i) {
      var tx = x0 + 250 + i * 175;
      s += '<line x1="' + tx + '" x2="' + (tx + 20) + '" y1="25" y2="25" stroke="' + k[2] + '" stroke-width="3"/><text x="' + (tx + 26) + '" y="30" class="t-mono" style="fill:var(--blekk-2)">Lagret ved ' + k[0] + "</text>";
    });
    s += '<text x="' + x0 + '" y="30" style="font:700 18px var(--f-display);fill:var(--blekk)">Kulde kjøper tid</text>';
    s += '<text x="' + x1 + '" y="' + (y1 + 48) + '" text-anchor="end" class="t-mono t-dempet">Prinsippskisse – ikke målte verdier</text>';
    return s + "</svg>";
  };

  /* Råstoffutnyttelse for torsk */
  FF.fig.utnyttelse = function () {
    var deler = [["Filet", 40, "var(--land)"], ["Hode", 20, "var(--grunt-2)"], ["Innmat", 17, "var(--babord)"], ["Rygg og bein", 12, "var(--dekk)"], ["Skinn", 4, "var(--tau)"], ["Blod, slo og svinn", 7, "var(--linje-2)"]];
    var s = '<svg viewBox="0 0 1000 260" role="img" aria-label="Omtrentlig fordeling av en torsk: filet cirka 40 prosent, hode 20, innmat 17, rygg og bein 12, skinn 4 og resten blod og svinn.">';
    var x = 30, W = 940;
    deler.forEach(function (d, i) {
      var w = W * d[1] / 100;
      s += '<rect x="' + x + '" y="70" width="' + (w - 3) + '" height="70" fill="' + d[2] + '" stroke="var(--blekk)" stroke-width="1.2"/>';
      s += '<text x="' + (x + 10) + '" y="112" style="font:800 22px var(--f-sjablong);fill:var(--blekk)">' + d[1] + "</text>";
      if (w > 90) s += '<text x="' + (x + 4) + '" y="166" style="font:700 16px var(--f-display);fill:var(--blekk)">' + d[0] + "</text>";
      else {
        var ny = i === 4 ? 170 : 194;
        s += '<line x1="' + (x + w / 2) + '" y1="142" x2="' + (x + w / 2) + '" y2="' + (ny - 14) + '" stroke="var(--blekk)"/>';
        s += '<text x="' + (x + w - 2) + '" y="' + ny + '" text-anchor="end" style="font:700 15px var(--f-display);fill:var(--blekk)">' + d[0] + "</text>";
      }
      x += w;
    });
    s += '<text x="30" y="44" style="font:700 20px var(--f-display);fill:var(--blekk)">Én torsk – 100 % råstoff</text>';
    s += '<text x="30" y="240" class="t-mono t-dempet">Prosent av rund vekt, omtrentlig. Varierer med størrelse, sesong (lever og rogn) og hvordan fisken skjæres.</text>';
    s += '<text x="970" y="44" text-anchor="end" class="t-mono t-magenta">Alt utenom filet er restråstoff – ikke avfall</text>';
    return s + "</svg>";
  };

  /* Kvalitetsfeil på en filet */
  FF.fig.kvalitetsfeil = function () {
    var s = '<svg viewBox="0 0 1000 360" role="img" aria-label="Filet med typiske kvalitetsfeil: blodflekker fra stikk, dårlig utblødning, klemskader, spalting og kveis.">';
    s += '<path d="M120 180 C160 90 380 60 600 70 C760 76 880 120 910 180 C880 240 760 284 600 290 C380 300 160 270 120 180 Z" fill="#f4e9e1" stroke="var(--blekk)" stroke-width="2"/>';
    for (var i = 0; i < 16; i++) s += '<path d="M' + (180 + i * 44) + " " + (100 + (i % 3) * 4) + " C" + (170 + i * 44) + " 180 " + (184 + i * 44) + " 220 " + (176 + i * 44) + " " + (270 - (i % 2) * 6) + '" fill="none" stroke="#e2cfc2" stroke-width="3"/>';
    // Blodflekk
    s += '<ellipse cx="300" cy="150" rx="28" ry="16" fill="#b0343a" opacity=".75"/><ellipse cx="310" cy="146" rx="12" ry="7" fill="#7d1f24"/>';
    // Dårlig utblødning – rosa sone
    s += '<path d="M600 90 C680 92 760 120 800 170 C740 170 660 150 600 130 Z" fill="#d88e8e" opacity=".55"/>';
    // Klemskade
    s += '<path d="M430 230 c20 -12 60 -10 70 8 c-10 16 -52 20 -70 -8 z" fill="#c9b3a8"/>';
    // Spalting
    s += '<path d="M680 220 l18 -22 M700 226 l18 -22 M720 232 l18 -22" stroke="var(--blekk)" stroke-width="2"/>';
    // Kveis
    s += '<path d="M200 220 c8 -8 18 6 26 -2 c8 -8 16 4 22 -2" fill="none" stroke="#caa15a" stroke-width="3" stroke-linecap="round"/>';
    s += S.merke(310, 146, 300, 36, "Blodflekk – stikk fra pigg eller krok", "middle");
    s += S.merke(700, 130, 720, 36, "Rosa kjøtt – dårlig utblødning", "middle");
    s += S.merke(465, 232, 470, 330, "Klemskade – for høyt stablet", "middle");
    s += S.merke(700, 214, 760, 330, "Spalting – for varm, røff behandling", "start");
    s += S.merke(224, 216, 170, 330, "Kveis (parasitt) – sjekk buklapp", "middle");
    return s + "</svg>";
  };
})();

/* Fartøyet: sideriss med gjennomskjæring, orientering og lanternesektorer,
   fartøytyper i skala og hydraulikk til dekksutstyret. */

(function () {
  var S = FF.svg;

  /* Kystfartøy, ca. 14,99 m, sett fra styrbord side. Baugen peker mot høyre. */
  FF.fig.fartoySide = function (o) {
    o = o || {};
    var id = FF.uid("fs");
    var WL = 300;
    var skrog = "M118 196 Q520 212 884 140 C878 196 866 258 846 300 C832 330 812 344 780 350 L270 352 C220 350 180 338 158 318 L132 296 L118 196 Z";
    var dekk = "M124 214 Q520 228 872 160";
    var s = '<svg viewBox="0 0 1000 440" role="img" aria-label="Sideriss av et kystfartøy med gjennomskjæring som viser maskinrom, lasterom, lugar og dekksutstyr.">';
    s += '<defs><clipPath id="' + id + 'u"><rect x="0" y="' + WL + '" width="1000" height="200"/></clipPath>' +
      '<clipPath id="' + id + 'o"><rect x="0" y="0" width="1000" height="' + WL + '"/></clipPath>' +
      '<clipPath id="' + id + 's"><path d="' + skrog + '"/></clipPath>' + S.pil(id + "p") + "</defs>";
    // Sjø
    s += '<rect x="0" y="' + WL + '" width="1000" height="140" fill="var(--sjo)"/>';
    // Skrog
    s += '<path d="' + skrog + '" fill="var(--skrog)"/>';
    s += '<path d="' + skrog + '" fill="var(--bunnstoff)" clip-path="url(#' + id + 'u)"/>';
    // Gjennomskjæring under dekk
    s += '<g clip-path="url(#' + id + 's)">';
    s += '<path d="M150 232 Q520 246 862 180 L862 360 L150 360 Z" fill="var(--flate)" opacity="0.93"/>';
    // skott
    [[345, 234], [610, 224], [800, 196]].forEach(function (b) {
      s += '<line x1="' + b[0] + '" y1="' + b[1] + '" x2="' + b[0] + '" y2="360" stroke="var(--blekk)" stroke-width="2"/>';
    });
    // tanktopp / dobbelbunn
    s += '<line x1="160" y1="328" x2="830" y2="328" stroke="var(--blekk)" stroke-width="1" stroke-dasharray="4 3"/>';
    // Maskinrom: motor
    s += '<rect x="215" y="262" width="92" height="52" rx="3" fill="var(--dekk)" stroke="var(--blekk)" stroke-width="1.5"/>';
    s += '<rect x="228" y="250" width="66" height="14" fill="var(--dekk)" stroke="var(--blekk)" stroke-width="1.2"/>';
    s += '<line x1="215" y1="300" x2="150" y2="316" stroke="var(--blekk)" stroke-width="3"/>';
    // Lasterom: kasser
    for (var r = 0; r < 3; r++) for (var k = 0; k < 7; k++) {
      s += '<rect x="' + (362 + k * 34) + '" y="' + (300 - r * 20) + '" width="31" height="18" fill="var(--grunt-2)" stroke="var(--blekk)" stroke-width="0.8"/>';
    }
    // Lugar: køyer
    s += '<rect x="628" y="262" width="80" height="10" fill="var(--land)" stroke="var(--blekk)" stroke-width="1"/>';
    s += '<rect x="628" y="296" width="80" height="10" fill="var(--land)" stroke="var(--blekk)" stroke-width="1"/>';
    s += '<rect x="722" y="250" width="54" height="56" fill="none" stroke="var(--blekk)" stroke-width="1"/>';
    // Tanker
    s += '<rect x="360" y="330" width="230" height="20" fill="var(--land-2)" opacity=".7"/>';
    s += "</g>";
    // Vannlinje, list og dekkslinje
    s += '<path d="' + dekk + '" fill="none" stroke="var(--overbygg)" stroke-width="2"/>';
    s += '<path d="M122 244 Q520 256 866 196" fill="none" stroke="var(--overbygg)" stroke-width="1.2" opacity=".7" clip-path="url(#' + id + 'o)"/>';
    s += '<line x1="60" y1="' + WL + '" x2="940" y2="' + WL + '" stroke="var(--blekk)" stroke-width="1.3" stroke-dasharray="10 5"/>';
    s += '<path d="' + skrog + '" fill="none" stroke="var(--blekk)" stroke-width="2"/>';
    // Propell og ror
    s += '<ellipse cx="150" cy="318" rx="5" ry="22" fill="var(--dekk)" stroke="var(--blekk)" stroke-width="1.5"/>';
    s += '<path d="M130 296 L112 296 L110 344 L132 340 Z" fill="var(--dekk)" stroke="var(--blekk)" stroke-width="1.5"/>';
    // Navn og fiskerimerke
    s += '<text x="760" y="192" style="font:800 20px var(--f-sjablong);fill:var(--overbygg);letter-spacing:.06em" transform="rotate(-9 760 192)">M-24-HV</text>';
    s += '<text x="610" y="215" style="font:700 15px var(--f-display);fill:var(--overbygg);letter-spacing:.2em" transform="rotate(-7 610 215)">HAVBRIS</text>';
    // Styrhus
    s += '<path d="M566 190 L566 116 L706 116 L736 164 L736 176 Q650 186 566 190 Z" fill="var(--overbygg)" stroke="var(--blekk)" stroke-width="2"/>';
    s += '<path d="M600 128 L690 128 L714 158 L600 160 Z" fill="var(--grunt-2)" stroke="var(--blekk)" stroke-width="1.2"/>';
    s += '<line x1="640" y1="128" x2="640" y2="160" stroke="var(--blekk)" stroke-width="1.2"/><line x1="680" y1="128" x2="690" y2="159" stroke="var(--blekk)" stroke-width="1.2"/>';
    s += '<rect x="574" y="136" width="18" height="40" fill="none" stroke="var(--blekk)" stroke-width="1.2"/>';
    s += '<rect x="560" y="108" width="152" height="9" fill="var(--overbygg)" stroke="var(--blekk)" stroke-width="1.5"/>';
    // Sidelanterne (grønn, styrbord)
    s += '<rect x="720" y="150" width="11" height="9" fill="var(--styrbord)" stroke="var(--blekk)"/>';
    // Mast
    s += '<line x1="636" y1="108" x2="636" y2="22" stroke="var(--blekk)" stroke-width="3"/>';
    s += '<line x1="614" y1="74" x2="668" y2="74" stroke="var(--blekk)" stroke-width="5" stroke-linecap="round"/>';
    s += '<rect x="628" y="80" width="16" height="7" fill="var(--blekk)"/>';
    s += '<circle cx="636" cy="26" r="5" fill="var(--babord)" stroke="var(--blekk)"/><circle cx="636" cy="42" r="5" fill="var(--flate)" stroke="var(--blekk)"/>';
    s += '<circle cx="636" cy="58" r="4" fill="var(--flate)" stroke="var(--blekk)"/>';
    s += '<line x1="600" y1="108" x2="600" y2="56" stroke="var(--blekk)" stroke-width="1.5"/><line x1="676" y1="108" x2="680" y2="64" stroke="var(--blekk)" stroke-width="1.5"/>';
    // Rekke/rekkverk akter
    for (var x = 140; x < 560; x += 28) {
      var y = 196 + (x - 118) * ((140 - 196) / (884 - 118)) + Math.sin((x - 118) / 766 * Math.PI) * 11;
      s += '<line x1="' + x + '" y1="' + (y + 2) + '" x2="' + x + '" y2="' + (y - 20) + '" stroke="var(--blekk)" stroke-width="1.3"/>';
    }
    s += '<path d="M140 176 Q340 190 560 172" fill="none" stroke="var(--blekk)" stroke-width="1.6"/>';
    // Luke til lasterom
    s += '<path d="M440 206 L440 190 L540 186 L540 202" fill="var(--dekk)" stroke="var(--blekk)" stroke-width="1.5"/>';
    // Kran
    s += '<rect x="372" y="184" width="16" height="24" fill="var(--oransje)" stroke="var(--blekk)" stroke-width="1.5"/>';
    s += '<path d="M380 186 L360 110 L300 96" fill="none" stroke="var(--oransje)" stroke-width="8" stroke-linejoin="round"/>';
    s += '<path d="M380 186 L360 110 L300 96" fill="none" stroke="var(--blekk)" stroke-width="1.3" stroke-linejoin="round"/>';
    s += '<line x1="300" y1="96" x2="300" y2="150" stroke="var(--blekk)" stroke-width="1"/><path d="M294 150 h12 l-6 10 z" fill="var(--blekk)"/>';
    // Nettrommel akter
    s += '<rect x="170" y="150" width="84" height="44" rx="4" fill="var(--garn)" stroke="var(--blekk)" stroke-width="1.5"/>';
    s += '<line x1="170" y1="162" x2="254" y2="162" stroke="var(--blekk)" stroke-width="0.8"/><line x1="170" y1="174" x2="254" y2="174" stroke="var(--blekk)" stroke-width="0.8"/><line x1="170" y1="186" x2="254" y2="186" stroke="var(--blekk)" stroke-width="0.8"/>';
    s += '<path d="M176 196 L186 150 M248 196 L238 150" stroke="var(--blekk)" stroke-width="2.2"/>';
    // Garnhaler forut styrbord
    s += '<path d="M770 160 L790 128" stroke="var(--blekk)" stroke-width="4"/>';
    s += '<circle cx="796" cy="122" r="15" fill="var(--dekk)" stroke="var(--blekk)" stroke-width="1.8"/><circle cx="796" cy="122" r="5" fill="var(--blekk)"/>';
    // Anker
    s += '<path d="M858 176 l8 14 M858 176 l-6 14" stroke="var(--blekk)" stroke-width="2"/>';
    // Sjølinje
    s += S.sjolinje(0, 1000, WL + 1, 3, 48, 'stroke="var(--sjo-dyp)" stroke-width="1.5"');

    if (o.etiketter) {
      s += S.merke(636, 30, 700, 22, "Topplanterner", "start");
      s += S.merke(648, 74, 720, 62, "Radar", "start");
      s += S.merke(650, 150, 760, 92, "Styrhus", "start");
      s += S.merke(796, 122, 870, 100, "Garnhaler", "start");
      s += S.merke(360, 110, 330, 70, "Kran", "end");
      s += S.merke(212, 170, 150, 120, "Nettrommel", "end");
      s += S.merke(260, 290, 190, 400, "Maskinrom", "end");
      s += S.merke(470, 290, 470, 400, "Lasterom", "middle");
      s += S.merke(668, 280, 700, 400, "Lugar", "middle");
      s += S.merke(150, 330, 70, 380, "Propell og ror", "end");
    }
    // Fribord og dypgående
    if (o.maal !== false) {
      s += '<line x1="470" y1="' + WL + '" x2="470" y2="224" stroke="var(--magenta)" stroke-width="1.6" marker-start="url(#' + id + 'p)" marker-end="url(#' + id + 'p)"/>';
      s += '<text x="478" y="266" class="t-liten t-magenta">Fribord</text>';
      s += '<line x1="560" y1="' + WL + '" x2="560" y2="351" stroke="var(--magenta)" stroke-width="1.6" marker-start="url(#' + id + 'p)" marker-end="url(#' + id + 'p)"/>';
      s += '<text x="568" y="332" class="t-liten t-magenta">Dypgående</text>';
      s += '<text x="946" y="' + (WL + 4) + '" class="t-mono t-dempet">VL</text>';
      s += '<text x="60" y="424" class="t-mono t-dempet">← AKTER</text><text x="940" y="424" text-anchor="end" class="t-mono t-dempet">FORUT →</text>';
    }
    return s + "</svg>";
  };

  /* Ovenfra: babord/styrbord, forut/akterut, og lanternesektorene */
  FF.fig.fartoyTopp = function (o) {
    o = o || {};
    var cx = 500, cy = 300, R = 210;
    function pkt(grad, r) { var a = (grad - 90) * Math.PI / 180; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; }
    function sektor(fra, til, r, farge, opa) {
      var p1 = pkt(fra, r), p2 = pkt(til, r);
      var stor = ((til - fra + 360) % 360) > 180 ? 1 : 0;
      return '<path d="M' + cx + " " + cy + " L" + p1[0].toFixed(1) + " " + p1[1].toFixed(1) + " A" + r + " " + r + " 0 " + stor + " 1 " + p2[0].toFixed(1) + " " + p2[1].toFixed(1) + ' Z" fill="' + farge + '" fill-opacity="' + (opa || 0.18) + '" stroke="' + farge + '" stroke-width="1.4"/>';
    }
    var s = '<svg viewBox="0 30 1000 580" role="img" aria-label="Fartøy sett ovenfra med babord og styrbord, og sektorene til topplanterne, sidelanternene og hekklanterna.">';
    if (o.sektorer !== false) {
      s += sektor(247.5, 112.5 + 360, R + 30, "var(--blekk-3)", 0.07);
      s += sektor(0, 112.5, R, "var(--styrbord)", 0.2);
      s += sektor(247.5, 360, R, "var(--babord)", 0.2);
      s += sektor(112.5, 247.5, R - 40, "var(--gul)", 0.22);
      var a1 = pkt(112.5, R + 58), a2 = pkt(247.5, R + 58);
      s += '<text x="' + a1[0].toFixed(0) + '" y="' + a1[1].toFixed(0) + '" class="t-mono t-dempet" text-anchor="middle">112,5°</text>';
      s += '<text x="' + a2[0].toFixed(0) + '" y="' + a2[1].toFixed(0) + '" class="t-mono t-dempet" text-anchor="middle">247,5°</text>';
      var g = pkt(55, R - 60), r = pkt(305, R - 60), h = pkt(180, R - 12), t = pkt(24, R + 44);
      s += '<text x="' + g[0].toFixed(0) + '" y="' + g[1].toFixed(0) + '" text-anchor="middle" class="t-liten" style="fill:var(--styrbord)">Grønn 112,5°</text>';
      s += '<text x="' + r[0].toFixed(0) + '" y="' + r[1].toFixed(0) + '" text-anchor="middle" class="t-liten" style="fill:var(--babord)">Rød 112,5°</text>';
      s += '<text x="' + h[0].toFixed(0) + '" y="' + (h[1] + 8).toFixed(0) + '" text-anchor="middle" class="t-liten">Hvit hekklanterne 135°</text>';
      s += '<text x="' + t[0].toFixed(0) + '" y="' + t[1].toFixed(0) + '" class="t-liten t-dempet">Hvit topplanterne 225°</text>';
    }
    // Tverrlinje
    s += '<line x1="' + (cx - R - 40) + '" y1="' + cy + '" x2="' + (cx + R + 40) + '" y2="' + cy + '" stroke="var(--blekk)" stroke-width="1" stroke-dasharray="6 4"/>';
    s += '<line x1="' + cx + '" y1="' + (cy - R - 20) + '" x2="' + cx + '" y2="' + (cy + R + 10) + '" stroke="var(--blekk)" stroke-width="1" stroke-dasharray="6 4"/>';
    // Skrog
    s += '<path d="M500 150 C548 196 560 250 558 330 L552 438 L448 438 L442 330 C440 250 452 196 500 150 Z" fill="var(--overbygg)" stroke="var(--blekk)" stroke-width="2.2"/>';
    s += '<rect x="470" y="262" width="60" height="58" fill="var(--grunt-2)" stroke="var(--blekk)" stroke-width="1.5"/>';
    s += '<rect x="476" y="350" width="48" height="40" fill="none" stroke="var(--blekk)" stroke-width="1.2" stroke-dasharray="3 2"/>';
    s += '<rect x="556" y="262" width="10" height="14" fill="var(--styrbord)" stroke="var(--blekk)"/>';
    s += '<rect x="434" y="262" width="10" height="14" fill="var(--babord)" stroke="var(--blekk)"/>';
    s += '<circle cx="500" cy="434" r="5" fill="var(--flate)" stroke="var(--blekk)" stroke-width="1.5"/>';
    // Retningsord
    s += '<text x="500" y="' + (cy - R - 44) + '" text-anchor="middle" style="font:700 22px var(--f-display);fill:var(--blekk)">FORUT</text>';
    s += '<text x="500" y="' + (cy + R + 62) + '" text-anchor="middle" style="font:700 22px var(--f-display);fill:var(--blekk)">AKTERUT</text>';
    s += '<text x="' + (cx - R - 50) + '" y="' + (cy - 12) + '" text-anchor="end" style="font:700 22px var(--f-display);fill:var(--babord)">BABORD</text>';
    s += '<text x="' + (cx + R + 50) + '" y="' + (cy - 12) + '" style="font:700 22px var(--f-display);fill:var(--styrbord)">STYRBORD</text>';
    s += '<text x="' + (cx - R - 50) + '" y="' + (cy + 16) + '" text-anchor="end" class="t-mono t-dempet">tvers om babord</text>';
    s += '<text x="' + (cx + R + 50) + '" y="' + (cy + 16) + '" class="t-mono t-dempet">tvers om styrbord</text>';
    s += '<text x="514" y="176" class="t-mono t-dempet">baug</text><text x="566" y="432" class="t-mono t-dempet">hekk</text>';
    s += '<text x="578" y="322" class="t-mono t-dempet">midtskips</text>';
    return s + "</svg>";
  };

  /* Fartøytyper i samme målestokk */
  FF.fig.fartoytyper = function () {
    var m = 9.2; // px per meter
    var base = 250, x0 = 30;
    function baat(x, lengde, typ, navn, sub) {
      var L = lengde * m, s = "";
      var h = Math.max(10, L * 0.12);
      var y = base;
      // Skrog
      s += '<path d="M' + x + " " + (y - h) + " L" + (x + L) + " " + (y - h * 1.35) + " C" + (x + L - 4) + " " + (y - h * 0.4) + " " + (x + L - L * 0.06) + " " + y + " " + (x + L - L * 0.12) + " " + (y + h * 0.35) + " L" + (x + L * 0.08) + " " + (y + h * 0.35) + " L" + x + " " + (y - h * 0.1) + ' Z" fill="var(--skrog)" stroke="var(--blekk)" stroke-width="1.2"/>';
      // Overbygg
      if (typ === "sjark") {
        s += '<rect x="' + (x + L * 0.52) + '" y="' + (y - h * 2.6) + '" width="' + (L * 0.26) + '" height="' + (h * 1.55) + '" fill="var(--overbygg)" stroke="var(--blekk)" stroke-width="1.2"/>';
      } else if (typ === "kyst") {
        s += '<rect x="' + (x + L * 0.56) + '" y="' + (y - h * 2.5) + '" width="' + (L * 0.24) + '" height="' + (h * 1.4) + '" fill="var(--overbygg)" stroke="var(--blekk)" stroke-width="1.2"/>';
        s += '<line x1="' + (x + L * 0.66) + '" y1="' + (y - h * 2.5) + '" x2="' + (x + L * 0.66) + '" y2="' + (y - h * 4) + '" stroke="var(--blekk)" stroke-width="1.5"/>';
      } else if (typ === "line") {
        s += '<rect x="' + (x + L * 0.62) + '" y="' + (y - h * 2.1) + '" width="' + (L * 0.3) + '" height="' + (h * 0.9) + '" fill="var(--overbygg)" stroke="var(--blekk)" stroke-width="1.2"/>';
        s += '<rect x="' + (x + L * 0.68) + '" y="' + (y - h * 2.8) + '" width="' + (L * 0.16) + '" height="' + (h * 0.7) + '" fill="var(--overbygg)" stroke="var(--blekk)" stroke-width="1.2"/>';
        s += '<rect x="' + (x + L * 0.1) + '" y="' + (y - h * 1.9) + '" width="' + (L * 0.48) + '" height="' + (h * 0.7) + '" fill="var(--overbygg)" stroke="var(--blekk)" stroke-width="1.2"/>';
      } else if (typ === "tral") {
        s += '<rect x="' + (x + L * 0.5) + '" y="' + (y - h * 2.2) + '" width="' + (L * 0.38) + '" height="' + (h * 1.0) + '" fill="var(--overbygg)" stroke="var(--blekk)" stroke-width="1.2"/>';
        s += '<rect x="' + (x + L * 0.6) + '" y="' + (y - h * 2.9) + '" width="' + (L * 0.18) + '" height="' + (h * 0.7) + '" fill="var(--overbygg)" stroke="var(--blekk)" stroke-width="1.2"/>';
        s += '<path d="M' + (x + L * 0.03) + " " + (y - h * 1.1) + " L" + (x + L * 0.08) + " " + (y - h * 3.2) + " L" + (x + L * 0.14) + " " + (y - h * 3.2) + " L" + (x + L * 0.18) + " " + (y - h * 1.2) + '" fill="none" stroke="var(--oransje)" stroke-width="3"/>';
      } else if (typ === "not") {
        s += '<rect x="' + (x + L * 0.62) + '" y="' + (y - h * 2.3) + '" width="' + (L * 0.3) + '" height="' + (h * 1.1) + '" fill="var(--overbygg)" stroke="var(--blekk)" stroke-width="1.2"/>';
        s += '<rect x="' + (x + L * 0.7) + '" y="' + (y - h * 3.1) + '" width="' + (L * 0.14) + '" height="' + (h * 0.8) + '" fill="var(--overbygg)" stroke="var(--blekk)" stroke-width="1.2"/>';
        s += '<path d="M' + (x + L * 0.3) + " " + (y - h * 1.3) + " L" + (x + L * 0.2) + " " + (y - h * 3.6) + '" stroke="var(--oransje)" stroke-width="3"/>';
        s += '<circle cx="' + (x + L * 0.2) + '" cy="' + (y - h * 3.6) + '" r="6" fill="var(--dekk)" stroke="var(--blekk)"/>';
        s += '<rect x="' + (x + L * 0.08) + '" y="' + (y - h * 1.9) + '" width="' + (L * 0.2) + '" height="' + (h * 0.6) + '" fill="var(--garn)" stroke="var(--blekk)" stroke-width="1"/>';
      }
      s += '<text x="' + x + '" y="' + (base + h * 0.35 + 30) + '" style="font:700 17px var(--f-display);fill:var(--blekk)">' + navn + "</text>";
      s += '<text x="' + x + '" y="' + (base + h * 0.35 + 48) + '" class="t-mono t-dempet">' + sub + "</text>";
      return s;
    }
    var s = '<svg viewBox="0 0 1000 380" role="img" aria-label="Fem fartøytyper tegnet i samme målestokk: sjark, kystfartøy, autoliner, tråler og ringnotfartøy.">';
    s += '<rect x="0" y="' + (base + 10) + '" width="1000" height="4" fill="var(--sjo)"/>';
    s += '<line x1="0" y1="' + base + '" x2="1000" y2="' + base + '" stroke="var(--sjo-dyp)" stroke-width="1"/>';
    s += baat(x0, 10.5, "sjark", "Sjark", "under 11 m · garn, line, juksa");
    s += baat(x0 + 145, 14.9, "kyst", "Kystfartøy", "11–15 m · snurrevad, garn");
    s += baat(x0 + 325, 45, "line", "Autoliner", "40–55 m · line");
    // tråler og ringnot kommer på andre rad
    var s2 = "";
    s += "</svg>";
    // Andre rad i eget koordinatsett under
    var t = '<svg viewBox="0 0 1000 300" role="img" aria-label="Tråler og ringnotfartøy i samme målestokk.">';
    base = 170;
    t += '<rect x="0" y="' + (base + 10) + '" width="1000" height="4" fill="var(--sjo)"/>';
    t += '<line x1="0" y1="' + base + '" x2="1000" y2="' + base + '" stroke="var(--sjo-dyp)" stroke-width="1"/>';
    t += baat(x0, 60, "tral", "Havfisketråler", "50–80 m · bunntrål, flytetrål");
    t += baat(x0 + 600, 36, "not", "Ringnotfartøy", "35–90 m · ringnot, pelagisk trål");
    // Målestokk
    t += '<g transform="translate(30 272)">';
    for (var i = 0; i < 6; i++) t += '<rect x="' + (i * 10 * m) + '" y="0" width="' + (10 * m) + '" height="6" fill="' + (i % 2 ? "var(--flate)" : "var(--blekk)") + '" stroke="var(--blekk)" stroke-width="1"/>';
    t += '<text x="0" y="22" class="t-mono t-dempet">0</text><text x="' + (50 * m) + '" y="22" class="t-mono t-dempet">50 m</text><text x="' + (60 * m + 8) + '" y="7" class="t-mono t-dempet">Målestokk for begge rader</text></g>';
    t += "</svg>";
    return s + t + s2;
  };

  /* Hydraulikk: slik driver motoren vinsjer, halere og kran */
  FF.fig.hydraulikk = function () {
    var id = FF.uid("hy");
    var s = '<svg viewBox="0 0 1000 380" role="img" aria-label="Enkelt hydraulikkskjema: tank, pumpe drevet av motoren, ventil, hydraulikkmotor og returfilter.">';
    s += "<defs>" + S.pil(id + "r", "var(--babord)") + S.pil(id + "b", "var(--paabud)") + "</defs>";
    function boks(x, y, w, h, tittel, under, fyll) {
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" fill="' + (fyll || "var(--flate)") + '" stroke="var(--blekk)" stroke-width="2"/>' +
        '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 - 2) + '" text-anchor="middle" style="font:700 18px var(--f-display);fill:var(--blekk)">' + tittel + "</text>" +
        '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 18) + '" text-anchor="middle" class="t-mono t-dempet">' + under + "</text>";
    }
    s += boks(40, 150, 150, 90, "Hovedmotor", "kraftuttak (PTO)", "var(--flate-2)");
    s += boks(260, 150, 130, 90, "Pumpe", "lager trykk");
    s += boks(470, 150, 150, 90, "Styreventil", "spak i styrhuset");
    s += boks(700, 150, 250, 90, "Hydraulikkmotor", "vinsj · haler · kran", "var(--land)");
    s += boks(260, 290, 130, 70, "Tank", "olje + nivåglass", "var(--grunt)");
    s += boks(470, 290, 150, 70, "Returfilter", "og kjøler");
    // akslinger og rør
    s += '<line x1="190" y1="195" x2="260" y2="195" stroke="var(--blekk)" stroke-width="6"/>';
    s += '<line x1="390" y1="180" x2="468" y2="180" stroke="var(--babord)" stroke-width="3.5" marker-end="url(#' + id + 'r)"/>';
    s += '<line x1="620" y1="180" x2="698" y2="180" stroke="var(--babord)" stroke-width="3.5" marker-end="url(#' + id + 'r)"/>';
    s += '<path d="M825 240 L825 325 L622 325" fill="none" stroke="var(--paabud)" stroke-width="3.5" marker-end="url(#' + id + 'b)"/>';
    s += '<path d="M470 325 L392 325" fill="none" stroke="var(--paabud)" stroke-width="3.5" marker-end="url(#' + id + 'b)"/>';
    s += '<path d="M325 290 L325 242" fill="none" stroke="var(--paabud)" stroke-width="3.5" marker-end="url(#' + id + 'b)"/>';
    s += '<text x="430" y="170" text-anchor="middle" class="t-liten" style="fill:var(--babord)">Trykk</text>';
    s += '<text x="660" y="170" text-anchor="middle" class="t-liten" style="fill:var(--babord)">Trykk</text>';
    s += '<text x="720" y="316" class="t-liten" style="fill:var(--paabud)">Retur</text>';
    s += '<text x="40" y="60" style="font:700 22px var(--f-display);fill:var(--blekk)">Hydraulikk om bord</text>';
    s += '<text x="40" y="86" class="t-mono t-dempet">Motoren driver pumpa. Oljen går under trykk til ventilen og videre til motoren på vinsjen.</text>';
    s += '<text x="40" y="104" class="t-mono t-dempet">Oljen går tilbake gjennom filter og kjøler til tanken.</text>';
    return s + "</svg>";
  };
})();

/* Redskaper: garn, line, juksa, snurrevad, bunntrål, ringnot, teine og seleksjon. */

(function () {
  var S = FF.svg;

  // Felles undervannsscene
  function scene(W, H, o) {
    o = o || {};
    var id = FF.uid("sc");
    var sy = o.sy || 70, by = o.by || H - 60;
    var s = '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--sjo)"/><stop offset="1" stop-color="var(--sjo-dyp)"/></linearGradient></defs>';
    s += '<rect width="' + W + '" height="' + H + '" fill="var(--flate)"/>';
    s += '<rect y="' + sy + '" width="' + W + '" height="' + (H - sy) + '" fill="url(#' + id + ')"/>';
    s += S.sjolinje(0, W, sy, 3, 40, 'stroke="var(--skrog)" stroke-width="1.6"');
    if (o.bunn !== false) {
      var d = "M0 " + by;
      for (var x = 0; x <= W; x += 50) d += " L" + x + " " + (by + Math.sin(x / 90 + (o.fase || 0)) * 8 + Math.sin(x / 23) * 2).toFixed(1);
      s += '<path d="' + d + " L" + W + " " + H + " L0 " + H + ' Z" fill="var(--bunn)"/>';
      for (var k = 0; k < 40; k++) s += '<circle cx="' + ((k * 97) % W) + '" cy="' + (by + 16 + (k * 13) % (H - by - 20)) + '" r="' + (1 + k % 3) + '" fill="var(--blekk)" opacity=".18"/>';
    }
    return s;
  }
  function boye(x, y, flagg) {
    var s = '<ellipse cx="' + x + '" cy="' + (y + 4) + '" rx="16" ry="12" fill="var(--oransje)" stroke="var(--blekk)" stroke-width="1.5"/>';
    if (flagg) s += '<line x1="' + x + '" y1="' + (y - 6) + '" x2="' + x + '" y2="' + (y - 52) + '" stroke="var(--blekk)" stroke-width="2"/><path d="M' + x + " " + (y - 52) + " l26 7 l-26 7 z" + '" fill="var(--blekk)"/>';
    return s;
  }
  function fisk(x, y, l, retn, farge) {
    var r = retn || 1, h = l * 0.28;
    return '<g transform="translate(' + x + " " + y + ") scale(" + r + ' 1)"><path d="M' + (-l / 2) + " 0 C" + (-l / 4) + " " + (-h) + " " + (l / 4) + " " + (-h) + " " + (l / 2) + " 0 C" + (l / 4) + " " + h + " " + (-l / 4) + " " + h + " " + (-l / 2) + " 0 L" + (-l / 2 - l * 0.22) + " " + (-h * 0.8) + " L" + (-l / 2 - l * 0.22) + " " + (h * 0.8) + ' Z" fill="' + (farge || "var(--fisk)") + '" stroke="var(--blekk)" stroke-width="1"/><circle cx="' + (l * 0.32) + '" cy="' + (-h * 0.2) + '" r="' + Math.max(1.2, l * 0.04) + '" fill="var(--blekk)"/></g>';
  }
  FF._fisk = fisk;
  function maskerad(x1, y1, x2, y2, rute) {
    var s = "", r = rute || 14;
    for (var x = x1; x < x2; x += r) s += '<line x1="' + x + '" y1="' + y1 + '" x2="' + (x + (y2 - y1) * 0.5) + '" y2="' + y2 + '" stroke="var(--garn)" stroke-width="0.8"/><line x1="' + (x + r) + '" y1="' + y1 + '" x2="' + (x + r - (y2 - y1) * 0.5) + '" y2="' + y2 + '" stroke="var(--garn)" stroke-width="0.8"/>';
    return s;
  }

  /* Garn */
  FF.fig.garn = function () {
    var W = 1000, H = 440, by = 380;
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Bunngarn: bøyer på overflaten, bøyeliner ned til ankre, og en garnlenke med flottørtelne og blytelne langs bunnen.">';
    s += scene(W, H, { by: by });
    s += boye(90, 64, true) + boye(910, 64, true);
    s += '<path d="M90 76 C96 180 110 300 140 ' + (by - 4) + '" fill="none" stroke="var(--tau)" stroke-width="2.2"/>';
    s += '<path d="M910 76 C904 180 890 300 860 ' + (by - 4) + '" fill="none" stroke="var(--tau)" stroke-width="2.2"/>';
    s += '<path d="M126 ' + (by - 8) + ' l14 12 l14 -12 M140 ' + (by + 4) + ' v-22" stroke="var(--blekk)" stroke-width="3" fill="none"/>';
    s += '<path d="M846 ' + (by - 8) + ' l14 12 l14 -12 M860 ' + (by + 4) + ' v-22" stroke="var(--blekk)" stroke-width="3" fill="none"/>';
    // Garnlenke
    var top = by - 150, bunn = by - 6;
    s += '<line x1="140" y1="' + bunn + '" x2="200" y2="' + bunn + '" stroke="var(--tau)" stroke-width="2"/><line x1="800" y1="' + bunn + '" x2="860" y2="' + bunn + '" stroke="var(--tau)" stroke-width="2"/>';
    s += '<g opacity=".9">' + maskerad(200, top, 800, bunn, 16) + "</g>";
    s += '<clipPath id="gk"><rect x="200" y="' + top + '" width="600" height="' + (bunn - top) + '"/></clipPath>';
    s += '<path d="M200 ' + top + ' Q500 ' + (top - 10) + ' 800 ' + top + '" fill="none" stroke="var(--tau)" stroke-width="3"/>';
    s += '<line x1="200" y1="' + bunn + '" x2="800" y2="' + bunn + '" stroke="var(--blekk)" stroke-width="4"/>';
    for (var x = 212; x < 800; x += 34) s += '<ellipse cx="' + x + '" cy="' + (top - 4 - Math.sin((x - 200) / 600 * Math.PI) * 5) + '" rx="7" ry="4.5" fill="var(--oransje)" stroke="var(--blekk)" stroke-width="1"/>';
    [400, 600].forEach(function (x) { s += '<line x1="' + x + '" y1="' + (top - 6) + '" x2="' + x + '" y2="' + bunn + '" stroke="var(--blekk)" stroke-width="1.5" stroke-dasharray="4 3"/>'; });
    s += fisk(300, by - 90, 64, 1) + fisk(560, by - 60, 72, -1) + fisk(700, by - 110, 56, 1);
    s += S.merke(90, 30, 170, 24, "Blåse / bøye med flagg", "start");
    s += S.merke(104, 220, 180, 200, "Bøyeline", "start");
    s += S.merke(140, by, 180, by + 44, "Anker / dregg", "start");
    s += S.merke(466, top - 10, 470, 110, "Flottørtelne", "middle");
    s += S.merke(520, bunn, 560, by + 44, "Blytelne", "start");
    s += S.merke(700, top + 60, 760, 150, "Garnlin (masker)", "start");
    s += '<text x="760" y="' + (by + 44) + '" text-anchor="middle" class="t-mono t-dempet">flere garn skjøtt sammen = en garnlenke</text>';
    return s + "</svg>";
  };

  /* Line */
  FF.fig.line = function () {
    var W = 1000, H = 440, by = 386;
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Bunnline: hovedline langs bunnen med tauman og kroker med agn, og bøyer og ankre i hver ende.">';
    s += scene(W, H, { by: by, fase: 2 });
    s += boye(80, 64, true) + boye(920, 64, true);
    s += '<path d="M80 76 C86 200 100 300 120 ' + (by - 6) + '" fill="none" stroke="var(--tau)" stroke-width="2.2"/><path d="M920 76 C914 200 900 300 880 ' + (by - 6) + '" fill="none" stroke="var(--tau)" stroke-width="2.2"/>';
    s += '<path d="M106 ' + (by - 10) + ' l14 12 l14 -12 M120 ' + (by + 2) + ' v-22" stroke="var(--blekk)" stroke-width="3" fill="none"/><path d="M866 ' + (by - 10) + ' l14 12 l14 -12 M880 ' + (by + 2) + ' v-22" stroke="var(--blekk)" stroke-width="3" fill="none"/>';
    var ly = by - 18;
    s += '<path d="M120 ' + (by - 8) + " Q300 " + (ly - 6) + " 500 " + ly + " T880 " + (by - 8) + '" fill="none" stroke="var(--tau)" stroke-width="2.4"/>';
    for (var x = 150; x < 860; x += 28) {
      var y = ly - 2 + Math.sin(x / 70) * 3;
      s += '<line x1="' + x + '" y1="' + y + '" x2="' + (x + 8) + '" y2="' + (y - 26) + '" stroke="var(--blekk)" stroke-width="1"/>';
      s += '<path d="M' + (x + 8) + " " + (y - 26) + ' c4 0 5 5 1 7 c-4 2 -6 -2 -4 -4" fill="none" stroke="var(--blekk)" stroke-width="1.4"/>';
      s += '<ellipse cx="' + (x + 9) + '" cy="' + (y - 21) + '" rx="3.5" ry="2" fill="var(--land-2)"/>';
    }
    s += fisk(420, by - 70, 70, 1) + fisk(690, by - 54, 80, -1);
    // Innfelt: krok med agn
    s += '<g transform="translate(640 110)"><circle r="78" fill="var(--flate)" stroke="var(--blekk)" stroke-width="1.5"/>';
    s += '<line x1="-6" y1="-66" x2="-6" y2="-10" stroke="var(--blekk)" stroke-width="2"/>';
    s += '<path d="M-6 -10 L-6 20 C-6 44 30 44 30 20 L30 8 L22 16" fill="none" stroke="var(--blekk)" stroke-width="4" stroke-linecap="round"/>';
    s += '<path d="M-16 -4 C-6 -18 18 -12 26 2 C18 16 -2 18 -16 6 Z" fill="var(--land-2)" stroke="var(--blekk)" stroke-width="1"/>';
    s += '<text x="0" y="62" text-anchor="middle" class="t-liten">Krok med agn</text></g>';
    s += '<line x1="598" y1="176" x2="522" y2="' + (ly - 26) + '" stroke="var(--blekk)" stroke-dasharray="3 3"/>';
    s += S.merke(80, 30, 160, 24, "Bøye med flagg", "start");
    s += S.merke(120, by - 2, 160, by + 44, "Ile (anker)", "start");
    s += S.merke(330, ly - 6, 360, by + 44, "Hovedline", "start");
    s += S.merke(346, ly - 20, 380, 180, "Tauman (fortom)", "middle");
    s += '<text x="700" y="' + (by + 44) + '" text-anchor="middle" class="t-mono t-dempet">avstand mellom krokene ca. 1–1,5 m</text>';
    return s + "</svg>";
  };

  /* Juksa */
  FF.fig.juksa = function () {
    var W = 1000, H = 440, by = 396;
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Juksa: sjark med juksamaskin, snøre med makker og pilk nær bunnen.">';
    s += scene(W, H, { by: by, fase: 1 });
    // Sjark
    s += '<path d="M300 54 L560 50 C556 70 548 86 530 96 L330 96 C316 88 306 74 300 54 Z" fill="var(--skrog)" stroke="var(--blekk)" stroke-width="1.5"/>';
    s += '<rect x="430" y="14" width="70" height="38" fill="var(--overbygg)" stroke="var(--blekk)" stroke-width="1.5"/><rect x="442" y="22" width="44" height="14" fill="var(--grunt-2)"/>';
    s += '<rect x="330" y="30" width="30" height="22" rx="3" fill="var(--oransje)" stroke="var(--blekk)" stroke-width="1.5"/><line x1="345" y1="30" x2="316" y2="10" stroke="var(--blekk)" stroke-width="2.5"/>';
    s += '<line x1="316" y1="10" x2="290" y2="' + (by - 80) + '" stroke="var(--blekk)" stroke-width="1.2"/>';
    var lx = function (y) { return 316 - (y - 10) * 26 / (by - 90); };
    [150, 200, 250, 290].forEach(function (y) {
      var x = lx(y);
      s += '<line x1="' + x + '" y1="' + y + '" x2="' + (x + 22) + '" y2="' + (y + 6) + '" stroke="var(--blekk)" stroke-width="1"/>';
      s += '<path d="M' + (x + 22) + " " + (y + 6) + ' c10 -2 18 2 22 8 c-8 2 -16 0 -22 -8 z" fill="var(--babord)"/>';
    });
    // Pilk
    var px = lx(by - 80);
    s += '<path d="M' + px + " " + (by - 80) + " l7 8 l-3 42 l-4 8 l-4 -8 l-3 -42 z" + '" fill="var(--dekk)" stroke="var(--blekk)" stroke-width="1.2"/>';
    s += '<path d="M' + (px - 6) + " " + (by - 22) + ' c0 8 12 8 12 0" fill="none" stroke="var(--blekk)" stroke-width="2"/>';
    s += fisk(400, by - 60, 90, -1) + fisk(220, by - 100, 70, 1) + fisk(360, 250, 60, -1);
    s += S.merke(345, 30, 250, 24, "Juksamaskin", "end");
    s += S.merke(304, 180, 190, 176, "Snøre", "end");
    s += S.merke(lx(250) + 36, 256, 500, 240, "Makker (gummimakk)", "start");
    s += S.merke(px, by - 50, 500, by - 50, "Pilk", "start");
    s += '<text x="620" y="130" style="font:700 20px var(--f-display);fill:var(--blekk)">Juksa og snøre</text>';
    s += '<text x="620" y="152" class="t-mono t-dempet">Maskinen kjenner når pilken når bunnen,</text><text x="620" y="168" class="t-mono t-dempet">heiser opp litt og rykker. Kjenner den fisk,</text><text x="620" y="184" class="t-mono t-dempet">haler den inn. Fisken blir levende om bord.</text>';
    return s + "</svg>";
  };

  /* Snurrevad sett ovenfra + profil */
  FF.fig.snurrevad = function () {
    var id = FF.uid("sn");
    var s = '<svg viewBox="0 0 1000 480" role="img" aria-label="Snurrevad sett ovenfra: tauene legges i en dråpeform rundt et område, og når tauene hales inn, gjeter de fisken inn foran vadet.">';
    s += "<defs>" + S.pil(id, "var(--magenta)") + S.pil(id + "b", "var(--blekk)") + "</defs>";
    s += '<rect width="1000" height="480" fill="var(--sjo)"/>';
    // Tau i dråpeform
    s += '<path d="M150 250 C260 90 560 60 640 170" fill="none" stroke="var(--tau)" stroke-width="3"/>';
    s += '<path d="M150 250 C260 410 560 440 640 330" fill="none" stroke="var(--tau)" stroke-width="3"/>';
    // Vad
    s += '<path d="M640 170 C680 190 700 220 720 236 L800 244 L800 256 L720 264 C700 280 680 310 640 330" fill="var(--garn)" fill-opacity=".35" stroke="var(--garn)" stroke-width="2"/>';
    s += '<rect x="800" y="238" width="44" height="24" rx="6" fill="var(--garn)" stroke="var(--blekk)"/>';
    // Bøye og båt
    s += '<circle cx="150" cy="250" r="12" fill="var(--oransje)" stroke="var(--blekk)" stroke-width="1.5"/>';
    s += FF._baatTopp(185, 250, 270, "var(--overbygg)");
    // Innhaling: piler innover
    [[330, 150, 350, 200], [470, 125, 470, 185], [330, 350, 350, 300], [470, 375, 470, 315]].forEach(function (p) {
      s += '<line x1="' + p[0] + '" y1="' + p[1] + '" x2="' + p[2] + '" y2="' + p[3] + '" stroke="var(--magenta)" stroke-width="2.4" marker-end="url(#' + id + ')"/>';
    });
    s += fisk(430, 240, 40, 1) + fisk(520, 268, 44, 1) + fisk(560, 226, 36, 1) + fisk(380, 270, 34, 1);
    s += '<path d="M470 250 L600 250" stroke="var(--magenta)" stroke-width="1.4" stroke-dasharray="5 4" marker-end="url(#' + id + ')"/>';
    s += S.merke(150, 250, 80, 180, "Bøye (start)", "end");
    s += S.merke(400, 104, 400, 50, "Snurrevadtau", "middle");
    s += S.merke(700, 214, 720, 150, "Vinger", "start");
    s += S.merke(820, 250, 880, 200, "Pose (fiskeposen)", "start");
    s += S.merke(200, 250, 250, 300, "Båten haler begge tauene", "start");
    s += '<text x="30" y="436" class="t-mono" style="font-size:12px;fill:var(--blekk)">1 Sett bøye · 2 legg ut tau · 3 sett vadet · 4 legg tau tilbake til bøya</text>';
    s += '<text x="30" y="456" class="t-mono" style="font-size:12px;fill:var(--blekk)">5 Hal begge tauene. Tauene gjeter fisken inn foran vadet, og vadet lukker seg.</text>';
    return s + "</svg>";
  };

  /* Bunntrål */
  FF.fig.tral = function () {
    var W = 1000, H = 440, by = 392;
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Bunntrål: tråleren sleper trålwire ned til tråldørene, videre sveiper og selve trålen med flottører, grunntau, belg, sorteringsrist og fiskepose.">';
    s += scene(W, H, { by: by, fase: 3 });
    // Tråler
    s += '<path d="M40 52 L250 48 C246 70 236 86 214 96 L70 96 C56 88 46 74 40 52 Z" fill="var(--skrog)" stroke="var(--blekk)" stroke-width="1.5"/>';
    s += '<rect x="150" y="16" width="70" height="34" fill="var(--overbygg)" stroke="var(--blekk)" stroke-width="1.5"/><path d="M50 50 L60 10 L74 10 L82 50" fill="none" stroke="var(--oransje)" stroke-width="4"/>';
    // Wire
    s += '<path d="M66 60 C160 150 280 250 390 ' + (by - 34) + '" fill="none" stroke="var(--blekk)" stroke-width="2"/>';
    // Tråldør
    s += '<g transform="translate(398 ' + (by - 34) + ') rotate(-12)"><rect x="-10" y="-26" width="22" height="46" rx="4" fill="var(--oransje)" stroke="var(--blekk)" stroke-width="1.5"/></g>';
    // Sveiper
    s += '<path d="M410 ' + (by - 28) + " L560 " + (by - 50) + '" stroke="var(--blekk)" stroke-width="1.6"/><path d="M410 ' + (by - 20) + " L560 " + (by - 10) + '" stroke="var(--blekk)" stroke-width="1.6"/>';
    // Trål
    s += '<path d="M560 ' + (by - 110) + " C640 " + (by - 118) + " 720 " + (by - 90) + " 800 " + (by - 70) + " L900 " + (by - 62) + " L900 " + (by - 22) + " L800 " + (by - 18) + " C720 " + (by - 14) + " 640 " + (by - 8) + " 560 " + (by - 8) + ' Z" fill="var(--garn)" fill-opacity=".28" stroke="var(--garn)" stroke-width="2"/>';
    s += maskerad(580, by - 104, 880, by - 16, 18).replace(/stroke-width="0.8"/g, 'stroke-width="0.5"');
    for (var x = 566; x < 720; x += 22) s += '<circle cx="' + x + '" cy="' + (by - 114 + (x - 566) * 0.05) + '" r="6" fill="var(--oransje)" stroke="var(--blekk)"/>';
    for (var x2 = 566; x2 < 800; x2 += 16) s += '<circle cx="' + x2 + '" cy="' + (by - 8) + '" r="6.5" fill="var(--blekk)"/>';
    s += '<line x1="760" y1="' + (by - 76) + '" x2="790" y2="' + (by - 18) + '" stroke="var(--blekk)" stroke-width="3"/>';
    for (var r = 0; r < 5; r++) s += '<line x1="' + (763 + r * 6) + '" y1="' + (by - 70 + r * 11) + '" x2="' + (769 + r * 6) + '" y2="' + (by - 70 + r * 11) + '" stroke="var(--blekk)"/>';
    s += '<path d="M900 ' + (by - 64) + " C930 " + (by - 70) + " 950 " + (by - 50) + " 950 " + (by - 42) + " C950 " + (by - 30) + " 930 " + (by - 16) + " 900 " + (by - 20) + ' Z" fill="var(--garn)" stroke="var(--blekk)" stroke-width="1.5"/>';
    s += fisk(640, by - 60, 50, 1) + fisk(700, by - 40, 44, 1) + fisk(930, by - 42, 30, 1);
    // Sand/støv bak dørene
    s += '<path d="M390 ' + (by - 4) + ' c-20 -10 -40 -8 -60 0" fill="none" stroke="var(--bunn)" stroke-width="10" opacity=".8"/>';
    s += S.merke(200, 170, 250, 130, "Trålwire", "start");
    s += S.merke(398, by - 50, 360, by - 110, "Tråldør", "end");
    s += S.merke(480, by - 40, 470, by + 34, "Sveiper", "middle");
    s += S.merke(620, by - 112, 620, by - 170, "Flottører på overtelna", "middle");
    s += S.merke(640, by - 8, 640, by + 34, "Grunntau (rockhopper)", "middle");
    s += S.merke(775, by - 48, 810, by - 150, "Sorteringsrist", "start");
    s += S.merke(930, by - 50, 930, by + 34, "Fiskepose", "middle");
    return s + "</svg>";
  };

  /* Ringnot */
  FF.fig.ringnot = function () {
    var W = 1000, H = 460;
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Ringnot: nota settes i en ring rundt stimen. Snurpeline gjennom ringer i bunnen trekkes inn så nota lukkes under fisken.">';
    s += scene(W, H, { sy: 120, bunn: false });
    // Notveggen
    s += '<path d="M300 130 C300 250 360 350 500 380 C640 350 700 250 700 130" fill="var(--garn)" fill-opacity=".25" stroke="var(--garn)" stroke-width="2"/>';
    s += maskerad(310, 136, 690, 360, 20).replace(/stroke-width="0.8"/g, 'stroke-width="0.4"');
    // Korkline på overflaten (ellipse)
    s += '<ellipse cx="500" cy="128" rx="200" ry="34" fill="none" stroke="var(--tau)" stroke-width="3"/>';
    for (var a = 0; a < 360; a += 12) { var r = a * Math.PI / 180; s += '<ellipse cx="' + (500 + Math.cos(r) * 200).toFixed(1) + '" cy="' + (128 + Math.sin(r) * 34).toFixed(1) + '" rx="6" ry="4" fill="var(--oransje)" stroke="var(--blekk)" stroke-width=".8"/>'; }
    // Snurperinger og snurpeline
    var ringer = [[330, 250], [380, 330], [450, 370], [550, 370], [620, 330], [670, 250]];
    s += '<path d="M' + ringer.map(function (p) { return p.join(" "); }).join(" L") + '" fill="none" stroke="var(--blekk)" stroke-width="1.5" stroke-dasharray="5 3"/>';
    ringer.forEach(function (p) { s += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="7" fill="none" stroke="var(--blekk)" stroke-width="2.5"/>'; });
    s += '<path d="M330 250 C300 200 290 160 300 130" fill="none" stroke="var(--blekk)" stroke-width="1.5"/>';
    // Stim
    for (var i = 0; i < 26; i++) s += fisk(420 + (i * 37) % 160, 200 + (i * 23) % 110, 22, i % 2 ? 1 : -1, "var(--fisk-lys)");
    // Fartøy
    s += '<path d="M180 108 L360 104 C356 122 346 136 326 142 L206 142 C192 136 184 124 180 108 Z" fill="var(--skrog)" stroke="var(--blekk)" stroke-width="1.5"/>';
    s += '<rect x="280" y="74" width="60" height="32" fill="var(--overbygg)" stroke="var(--blekk)" stroke-width="1.5"/><path d="M230 104 L214 60" stroke="var(--oransje)" stroke-width="4"/><circle cx="214" cy="58" r="9" fill="var(--dekk)" stroke="var(--blekk)"/>';
    s += S.merke(214, 58, 120, 40, "Kraftblokk", "end");
    s += S.merke(700, 128, 780, 90, "Korkline med flottører", "start");
    s += S.merke(690, 200, 780, 200, "Notlin (notveggen)", "start");
    s += S.merke(620, 330, 780, 320, "Snurpering", "start");
    s += S.merke(585, 370, 780, 380, "Snurpeline lukker bunnen", "start");
    s += S.merke(500, 250, 200, 280, "Stim – sild eller makrell", "end");
    return s + "</svg>";
  };

  /* Teine */
  FF.fig.teine = function () {
    var W = 1000, H = 440, by = 380;
    var s = '<svg viewBox="0 0 ' + W + " " + H + '" role="img" aria-label="Teine for krabbe: ramme med notlin, inngang, agnpose, fluktåpning og råtnetråd.">';
    s += scene(W, H, { by: by, fase: 4 });
    s += boye(120, 64, true);
    s += '<path d="M120 76 C130 200 160 300 200 ' + (by - 60) + '" fill="none" stroke="var(--tau)" stroke-width="2.2"/>';
    // Teine (stor, i profil)
    var x = 200, y = by - 150, w = 420, h = 150;
    s += '<path d="M' + x + " " + (y + h) + " L" + x + " " + (y + 40) + " Q" + (x + w / 2) + " " + (y - 30) + " " + (x + w) + " " + (y + 40) + " L" + (x + w) + " " + (y + h) + ' Z" fill="var(--garn)" fill-opacity=".14" stroke="var(--blekk)" stroke-width="3"/>';
    s += '<clipPath id="tn"><path d="M' + x + " " + (y + h) + " L" + x + " " + (y + 40) + " Q" + (x + w / 2) + " " + (y - 30) + " " + (x + w) + " " + (y + 40) + " L" + (x + w) + " " + (y + h) + ' Z"/></clipPath>';
    s += '<g clip-path="url(#tn)">' + maskerad(x - 100, y - 30, x + w + 10, y + h, 18) + "</g>";
    // Inngang (trakt)
    s += '<path d="M' + (x + 40) + " " + (y + 60) + " L" + (x + 150) + " " + (y + 90) + " L" + (x + 150) + " " + (y + 110) + " L" + (x + 40) + " " + (y + 140) + '" fill="var(--flate)" fill-opacity=".5" stroke="var(--garn)" stroke-width="2"/>';
    // Agnpose
    s += '<line x1="' + (x + 290) + '" y1="' + (y + 10) + '" x2="' + (x + 290) + '" y2="' + (y + 60) + '" stroke="var(--blekk)"/>';
    s += '<rect x="' + (x + 272) + '" y="' + (y + 60) + '" width="36" height="46" rx="6" fill="var(--land-2)" stroke="var(--blekk)" stroke-width="1.5"/>';
    // Fluktåpning
    s += '<rect x="' + (x + w - 60) + '" y="' + (y + 90) + '" width="44" height="30" rx="3" fill="var(--flate)" stroke="var(--magenta)" stroke-width="3"/>';
    // Råtnetråd
    s += '<path d="M' + (x + w - 120) + " " + (y + 30) + " q10 10 0 20 q-10 10 0 20" + '" fill="none" stroke="var(--oransje)" stroke-width="3" stroke-dasharray="3 2"/>';
    // Krabber
    function krabbe(cx, cy, st) {
      var k = '<g transform="translate(' + cx + " " + cy + ") scale(" + st + ')"><ellipse rx="22" ry="14" fill="var(--bunnstoff)" stroke="var(--blekk)"/>';
      for (var i = -1; i <= 1; i += 2) for (var j = 0; j < 4; j++) k += '<path d="M' + (i * 18) + " " + (-2 + j * 4) + " l" + (i * 14) + " " + (-6 + j * 6) + " l" + (i * 4) + ' 10" fill="none" stroke="var(--blekk)" stroke-width="2"/>';
      k += '<path d="M-12 -10 l-8 -14 l8 -2 M12 -10 l8 -14 l-8 -2" fill="none" stroke="var(--blekk)" stroke-width="3"/></g>';
      return k;
    }
    s += krabbe(x + 210, y + h - 20, 1.1) + krabbe(x + 110, y + h - 14, 0.9) + krabbe(760, by - 8, 1);
    s += S.merke(x + 60, y + 70, x + 60, y - 50, "Inngang (trakt)", "middle");
    s += S.merke(x + 290, y + 80, x + 330, y - 60, "Agnpose", "start");
    s += S.merke(x + w - 38, y + 105, 740, y + 20, "Fluktåpning", "start");
    s += S.merke(x + w - 118, y + 50, 740, y - 30, "Råtnetråd av bomull", "start");
    s += S.merke(120, 40, 190, 30, "Bøye med merking", "start");
    s += '<text x="640" y="' + (by + 40) + '" class="t-mono t-dempet">Kravene varierer med art – se høstingsforskriften.</text>';
    return s + "</svg>";
  };

  /* Seleksjon: diamantmasker, kvadratmasker og sorteringsrist */
  FF.fig.seleksjon = function () {
    var id = FF.uid("se");
    var s = '<svg viewBox="0 0 1000 400" role="img" aria-label="Diamantmasker lukker seg når nota strammes, kvadratmasker står åpne. Sorteringsrist slipper småfisk ut.">';
    s += "<defs>" + S.pil(id, "var(--magenta)") + "</defs>";
    function panel(x, t, u) { return '<rect x="' + x + '" y="10" width="310" height="380" fill="var(--flate)" stroke="var(--linje)"/><text x="' + (x + 16) + '" y="42" style="font:700 21px var(--f-display);fill:var(--blekk)">' + t + '</text><text x="' + (x + 16) + '" y="370" class="t-mono t-dempet">' + u + "</text>"; }
    s += panel(10, "Diamantmasker", "Strammes → maskene lukker seg.");
    for (var i = 0; i < 6; i++) for (var j = 0; j < 9; j++) {
      var cx = 45 + i * 44, cy = 80 + j * 30;
      s += '<path d="M' + cx + " " + (cy - 15) + " l20 15 l-20 15 l-20 -15 z" + '" fill="none" stroke="var(--garn)" stroke-width="2"/>';
    }
    s += fisk(160, 200, 70, 1, "var(--fisk-lys)");
    s += panel(345, "Kvadratmasker", "Maskene står åpne – småfisk slipper ut.");
    for (var a = 0; a < 7; a++) for (var b = 0; b < 8; b++) s += '<rect x="' + (370 + a * 38) + '" y="' + (70 + b * 36) + '" width="34" height="32" fill="none" stroke="var(--garn)" stroke-width="2"/>';
    s += fisk(500, 190, 54, -1, "var(--fisk-lys)") + '<path d="M480 212 L470 250" stroke="var(--magenta)" stroke-width="2" marker-end="url(#' + id + ')"/>';
    s += panel(680, "Sorteringsrist", "Småfisk går gjennom rista og ut.");
    s += '<path d="M700 120 L960 120 M700 300 L960 300" stroke="var(--garn)" stroke-width="3"/>';
    s += '<line x1="780" y1="124" x2="860" y2="296" stroke="var(--blekk)" stroke-width="4"/>';
    for (var r = 0; r < 7; r++) s += '<line x1="' + (786 + r * 10.5) + '" y1="' + (137 + r * 22.5) + '" x2="' + (798 + r * 10.5) + '" y2="' + (131 + r * 22.5) + '" stroke="var(--blekk)" stroke-width="2"/>';
    s += fisk(740, 180, 64, 1) + '<path d="M790 170 L920 150" stroke="var(--magenta)" stroke-width="2" marker-end="url(#' + id + ')"/>';
    s += '<text x="900" y="140" class="t-mono t-magenta" text-anchor="end">stor fisk → posen</text>';
    s += fisk(760, 250, 28, 1, "var(--fisk-lys)") + '<path d="M800 256 L870 330" stroke="var(--magenta)" stroke-width="2" marker-end="url(#' + id + ')"/>';
    s += '<text x="880" y="344" class="t-mono t-magenta">småfisk ut</text>';
    return s + "</svg>";
  };
})();

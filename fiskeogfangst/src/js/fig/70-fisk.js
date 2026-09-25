/* Fisk: torskens anatomi, bløggekutt og artsplansjer. Artene er tegnet med
   de kjennetegnene du bruker for å skille dem på dekk. */

(function () {
  var S = FF.svg;
  var STREK = "var(--blekk)";

  /* ---------- Torskefisk (torsk, hyse, sei, lyr) i felles form ---------- */
  function torskefisk(o) {
    o = o || {};
    var id = FF.uid("tf");
    var underbitt = o.underbitt || 0; // hvor langt underkjeven stikker fram
    var k = o.kropp || {};
    var s = "<defs>" +
      '<linearGradient id="' + id + 'g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + o.rygg + '"/><stop offset=".55" stop-color="' + (o.side || o.rygg) + '"/><stop offset=".78" stop-color="' + o.buk + '"/><stop offset="1" stop-color="' + o.buk + '"/></linearGradient>' +
      '<clipPath id="' + id + 'c"><path d="' + kropp() + '"/></clipPath></defs>';
    function kropp() {
      return "M905 222 C900 205 870 175 820 162 C780 150 720 " + (132 - (k.pukkel || 0)) + " 640 128 C540 126 420 140 330 160 C270 174 230 190 198 202 L198 236 C230 246 280 262 360 282 C440 300 540 314 620 312 C700 310 760 296 800 282 C840 268 " + (880 + underbitt) + " 250 " + (900 + underbitt) + " 238 Z";
    }
    var fin = 'fill="' + (o.finne || o.rygg) + '" stroke="' + STREK + '" stroke-width="1.4" stroke-linejoin="round"';
    // Finner bak kroppen
    var hale = o.gaffel ? "M200 200 C170 180 140 160 106 146 C124 185 132 205 134 219 C132 234 124 254 106 292 C140 278 170 262 200 238 Z"
      : "M200 200 C170 180 140 160 108 150 C114 185 118 205 122 219 C118 235 114 256 108 290 C140 280 170 262 200 238 Z";
    s += '<path d="' + hale + '" ' + fin + "/>";
    var d1h = o.d1 || 68;
    s += '<path d="M692 134 C682 100 662 ' + d1h + " 642 " + (d1h - 4) + ' C620 72 602 100 588 129 Z" ' + fin + "/>";
    s += '<path d="M556 127 C540 95 510 76 480 78 C455 82 435 110 420 141 Z" ' + fin + "/>";
    s += '<path d="M396 146 C382 118 360 102 336 104 C314 108 292 140 272 172 Z" ' + fin + "/>";
    s += '<path d="M500 306 C480 330 456 348 436 350 C412 350 398 322 386 292 Z" ' + fin + "/>";
    s += '<path d="M362 283 C348 306 326 320 306 320 C286 318 274 292 264 257 Z" ' + fin + "/>";
    // Kropp
    s += '<path d="' + kropp() + '" fill="url(#' + id + 'g)" stroke="' + STREK + '" stroke-width="1.8"/>';
    // Flekker
    if (o.flekker) {
      var f = "";
      for (var i = 0; i < 70; i++) {
        var x = 230 + (i * 97) % 600, y = 140 + (i * 53) % 110;
        f += '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (3 + i % 4) + '" ry="' + (2 + i % 3) + '" fill="' + o.flekker + '" opacity=".55"/>';
      }
      s += '<g clip-path="url(#' + id + 'c)">' + f + "</g>";
    }
    // Sidelinje
    s += '<path d="M780 186 C710 172 648 176 566 194 C486 212 400 214 204 219" fill="none" stroke="' + o.sidelinje + '" stroke-width="' + (o.sidelinjeB || 3.2) + '" clip-path="url(#' + id + 'c)"/>';
    if (o.flekk) s += '<ellipse cx="704" cy="214" rx="20" ry="14" fill="' + o.flekk + '" clip-path="url(#' + id + 'c)"/>';
    // Hode
    s += '<path d="M786 150 C760 190 764 252 794 292" fill="none" stroke="' + STREK + '" stroke-width="1.6"/>';
    s += '<path d="M906 226 Q884 234 856 229" fill="none" stroke="' + STREK + '" stroke-width="1.8"/>';
    s += '<circle cx="838" cy="194" r="13" fill="#f2efe4" stroke="' + STREK + '" stroke-width="1.5"/><circle cx="840" cy="194" r="7" fill="#101418"/><circle cx="842" cy="191" r="2" fill="#fff"/>';
    if (o.skjegg) s += '<path d="M874 252 q-3 ' + o.skjegg + ' -10 ' + (o.skjegg + 6) + '" fill="none" stroke="' + STREK + '" stroke-width="2.4" stroke-linecap="round"/>';
    // Bryst- og bukfinne
    s += '<path d="M748 238 C716 230 676 244 654 268 C680 288 716 282 748 262 Z" ' + fin + ' fill-opacity=".92"/>';
    s += '<path d="M800 288 C790 310 782 328 774 340 C788 332 800 314 810 290 Z" ' + fin + "/>";
    return s;
  }

  var TORSKEFISK = {
    torsk: { rygg: "#6f7249", side: "#9a9567", buk: "#efece0", flekker: "#4b4a2c", sidelinje: "#f3f0dd", skjegg: 22, finne: "#77764c" },
    hyse: { rygg: "#4f4d5c", side: "#8d8b98", buk: "#eeedf1", sidelinje: "#15151b", flekk: "#15151b", skjegg: 10, d1: 50, finne: "#4f4d5c", sidelinjeB: 3.6 },
    sei: { rygg: "#33413b", side: "#6b7a72", buk: "#d9ddd6", sidelinje: "#e9ecea", skjegg: 0, underbitt: 6, gaffel: true, finne: "#36443e" },
    lyr: { rygg: "#5c4a31", side: "#8f7a58", buk: "#e8e2d2", sidelinje: "#2f261a", skjegg: 0, underbitt: 18, finne: "#5c4a31", sidelinjeB: 3.4 }
  };

  /* ---------- Andre arter ---------- */
  function langstrakt(o) {
    // lange og brosme
    var id = FF.uid("ls");
    var s = '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + o.rygg + '"/><stop offset=".7" stop-color="' + o.side + '"/><stop offset="1" stop-color="' + o.buk + '"/></linearGradient></defs>';
    var kropp = "M920 222 C912 200 880 186 830 180 C700 170 400 178 180 198 C150 202 130 206 118 212 L118 228 C130 232 150 236 180 240 C400 262 700 266 830 260 C880 256 912 244 920 230 Z";
    var kant = o.hvitkant ? 'stroke="#f6f2e6" stroke-width="3"' : 'stroke="' + STREK + '" stroke-width="1.3"';
    if (o.art === "lange") {
      s += '<path d="M760 180 C748 156 724 150 700 176 Z" fill="' + o.rygg + '" stroke="' + STREK + '" stroke-width="1.3"/>';
      s += '<path d="M680 176 C600 150 300 162 160 196 L180 200 C320 180 600 172 680 180 Z" fill="' + o.rygg + '" stroke="' + STREK + '" stroke-width="1.3"/>';
      s += '<path d="M600 262 C500 290 280 272 160 244 L180 240 C320 256 520 262 600 260 Z" fill="' + o.rygg + '" stroke="' + STREK + '" stroke-width="1.3"/>';
      s += '<path d="M120 204 C96 196 80 206 78 220 C80 234 96 244 120 236 Z" fill="' + o.rygg + '" stroke="' + STREK + '" stroke-width="1.3"/>';
    } else {
      s += '<path d="M740 180 C700 150 400 150 150 190 C120 196 96 198 80 210 C80 222 80 226 80 232 C96 244 120 246 150 250 C400 290 620 284 640 262" fill="' + o.rygg + '" ' + kant + "/>";
    }
    s += '<path d="' + kropp + '" fill="url(#' + id + ')" stroke="' + STREK + '" stroke-width="1.8"/>';
    if (o.art === "lange") {
      s += '<ellipse cx="190" cy="190" rx="12" ry="7" fill="#1a1a14"/><ellipse cx="200" cy="248" rx="10" ry="6" fill="#1a1a14"/>';
      for (var i = 0; i < 40; i++) s += '<ellipse cx="' + (240 + (i * 83) % 560) + '" cy="' + (192 + (i * 29) % 40) + '" rx="10" ry="4" fill="#3f3f28" opacity=".35"/>';
    }
    s += '<path d="M806 184 C790 206 794 240 812 258" fill="none" stroke="' + STREK + '" stroke-width="1.5"/>';
    s += '<path d="M920 228 Q900 236 872 232" fill="none" stroke="' + STREK + '" stroke-width="1.6"/>';
    s += '<circle cx="872" cy="204" r="9" fill="#f2efe4" stroke="' + STREK + '" stroke-width="1.3"/><circle cx="873" cy="204" r="5" fill="#101418"/>';
    s += '<path d="M892 244 q-2 14 -8 20" fill="none" stroke="' + STREK + '" stroke-width="2.2" stroke-linecap="round"/>';
    s += '<path d="M786 228 C760 224 734 236 724 252 C744 262 770 254 786 242 Z" fill="' + o.rygg + '" stroke="' + STREK + '" stroke-width="1.2"/>';
    return s;
  }

  function flatfisk(o) {
    var id = FF.uid("ff");
    var sp = o.speil ? ' transform="translate(1000 0) scale(-1 1)"' : "";
    var s = '<defs><radialGradient id="' + id + '" cx=".55" cy=".45" r=".7"><stop offset="0" stop-color="' + o.lys + '"/><stop offset="1" stop-color="' + o.mork + '"/></radialGradient></defs><g' + sp + ">";
    var kropp = "M870 220 C860 150 780 104 640 96 C480 90 320 120 250 190 L250 250 C320 320 480 350 640 344 C780 336 860 290 870 220 Z";
    s += '<path d="M820 150 C760 70 480 60 290 150 L260 190 C420 110 700 100 820 150 Z" fill="' + o.mork + '" stroke="' + STREK + '" stroke-width="1.2"/>';
    s += '<path d="M820 290 C760 370 480 380 290 290 L260 250 C420 330 700 340 820 290 Z" fill="' + o.mork + '" stroke="' + STREK + '" stroke-width="1.2"/>';
    s += o.maane ? '<path d="M255 196 C200 170 150 140 110 120 C140 180 146 210 146 220 C146 230 140 260 110 320 C150 300 200 270 255 244 Z" fill="' + o.mork + '" stroke="' + STREK + '" stroke-width="1.3"/>'
      : '<path d="M255 196 C200 180 150 160 116 150 C130 190 132 210 132 220 C132 230 130 250 116 290 C150 280 200 260 255 244 Z" fill="' + o.mork + '" stroke="' + STREK + '" stroke-width="1.3"/>';
    s += '<path d="' + kropp + '" fill="url(#' + id + ')" stroke="' + STREK + '" stroke-width="1.8"/>';
    if (o.bue) s += '<path d="M780 190 C740 150 690 150 660 196 C600 212 450 216 262 220" fill="none" stroke="' + o.lys + '" stroke-width="2.4"/>';
    else s += '<path d="M780 210 C600 214 450 216 262 220" fill="none" stroke="' + o.lys + '" stroke-width="2"/>';
    s += '<path d="M800 150 C770 180 772 260 800 292" fill="none" stroke="' + STREK + '" stroke-width="1.4"/>';
    var oy1 = o.oyeKant ? 118 : 176, oy2 = o.oyeKant ? 160 : 208;
    s += '<circle cx="820" cy="' + oy1 + '" r="10" fill="#f2efe4" stroke="' + STREK + '"/><circle cx="822" cy="' + oy1 + '" r="5" fill="#101418"/>';
    s += '<circle cx="836" cy="' + oy2 + '" r="10" fill="#f2efe4" stroke="' + STREK + '"/><circle cx="838" cy="' + oy2 + '" r="5" fill="#101418"/>';
    s += '<path d="M870 226 Q856 246 830 250" fill="none" stroke="' + STREK + '" stroke-width="1.8"/>';
    s += '<path d="M760 234 C730 232 700 246 690 262 C712 270 742 262 760 248 Z" fill="' + o.mork + '" stroke="' + STREK + '" stroke-width="1.2"/>';
    return s + "</g>";
  }

  function steinbit() {
    var s = "";
    var kropp = "M900 214 C900 170 860 140 800 140 C680 140 400 176 170 206 L170 238 C400 262 680 290 800 290 C860 290 900 258 900 214 Z";
    s += '<path d="M780 142 C740 118 400 140 150 196 L150 206 C400 160 700 148 790 150 Z" fill="#59636d" stroke="' + STREK + '" stroke-width="1.3"/>';
    s += '<path d="M640 286 C500 296 300 266 150 244 L150 234 C300 256 500 280 650 278 Z" fill="#59636d" stroke="' + STREK + '" stroke-width="1.3"/>';
    s += '<path d="M170 204 C140 196 118 204 110 220 C118 236 140 244 170 238 Z" fill="#59636d" stroke="' + STREK + '" stroke-width="1.3"/>';
    s += '<path d="' + kropp + '" fill="#7d8792" stroke="' + STREK + '" stroke-width="1.8"/>';
    for (var i = 0; i < 10; i++) { var x = 260 + i * 54; s += '<path d="M' + x + " " + (184 - i * 3) + " C" + (x - 14) + " 214 " + (x + 10) + " 236 " + (x - 6) + " " + (250 + i * 3) + '" fill="none" stroke="#3a4149" stroke-width="' + (9 - i * 0.4) + '" opacity=".7"/>'; }
    s += '<path d="M896 226 Q870 244 836 238" fill="none" stroke="' + STREK + '" stroke-width="2"/>';
    s += '<path d="M880 226 l4 8 l4 -8 M866 230 l4 8 l4 -8" fill="#fff" stroke="' + STREK + '" stroke-width=".8"/>';
    s += '<circle cx="850" cy="184" r="10" fill="#f2efe4" stroke="' + STREK + '"/><circle cx="852" cy="184" r="5" fill="#101418"/>';
    s += '<path d="M770 236 C730 226 690 240 676 266 C704 282 744 274 770 256 Z" fill="#59636d" stroke="' + STREK + '" stroke-width="1.2"/>';
    return s;
  }

  function uer() {
    var s = "";
    var kropp = "M900 226 C890 180 840 138 760 126 C640 110 460 124 330 170 C280 188 240 204 214 212 L214 244 C240 252 280 266 330 280 C460 318 640 324 760 308 C840 296 890 262 900 226 Z";
    s += '<path d="M200 212 C170 190 150 170 124 160 C134 196 136 214 136 228 C136 242 134 262 124 296 C150 286 170 266 200 244 Z" fill="#c9442f" stroke="' + STREK + '" stroke-width="1.3"/>';
    s += '<path d="M760 128 L744 70 L716 120 L700 66 L676 118 L656 64 L636 116 L614 66 L594 118 L572 72 L552 122 L528 82 L506 128 Z" fill="#d85a41" stroke="' + STREK + '" stroke-width="1.3" stroke-linejoin="round"/>';
    s += '<path d="M480 132 C440 100 380 110 340 168 Z" fill="#d85a41" stroke="' + STREK + '" stroke-width="1.3"/>';
    s += '<path d="M470 310 C440 350 400 346 380 296 Z" fill="#d85a41" stroke="' + STREK + '" stroke-width="1.3"/>';
    s += '<path d="' + kropp + '" fill="#d4513a" stroke="' + STREK + '" stroke-width="1.8"/>';
    s += '<path d="M770 140 C740 190 744 260 780 300" fill="none" stroke="' + STREK + '" stroke-width="1.5"/>';
    s += '<circle cx="820" cy="190" r="24" fill="#f2efe4" stroke="' + STREK + '" stroke-width="1.5"/><circle cx="824" cy="190" r="14" fill="#101418"/>';
    s += '<path d="M902 232 Q880 250 846 246" fill="none" stroke="' + STREK + '" stroke-width="2"/>';
    s += '<path d="M730 230 C690 226 650 250 636 286 C672 300 712 286 730 262 Z" fill="#e0725b" stroke="' + STREK + '" stroke-width="1.2"/>';
    return s;
  }

  function sild(o) {
    var id = FF.uid("sd");
    var s = '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="' + o.rygg + '"/><stop offset=".45" stop-color="' + o.midt + '"/><stop offset="1" stop-color="#eef2f4"/></linearGradient></defs>';
    var kropp = "M905 222 C890 196 840 176 760 170 C620 162 420 176 260 200 C230 205 210 208 196 210 L196 234 C210 236 230 240 260 244 C420 268 620 280 760 272 C840 266 890 248 905 222 Z";
    s += '<path d="M196 212 C170 190 140 160 104 146 C130 196 134 214 136 222 C134 230 130 248 104 298 C140 284 170 256 196 232 Z" fill="' + o.rygg + '" stroke="' + STREK + '" stroke-width="1.3"/>';
    if (o.makrell) {
      s += '<path d="M660 170 C640 130 610 118 580 124 L560 172 Z M430 180 C420 150 400 140 380 144 L372 188 Z" fill="' + o.rygg + '" stroke="' + STREK + '" stroke-width="1.3"/>';
      s += '<path d="M430 262 C420 290 400 298 380 296 L372 254 Z" fill="' + o.rygg + '" stroke="' + STREK + '" stroke-width="1.3"/>';
      for (var f = 0; f < 5; f++) { s += '<path d="M' + (340 - f * 26) + ' 190 l-10 -12 l-4 14 Z M' + (340 - f * 26) + ' 252 l-10 12 l-4 -14 Z" fill="' + o.rygg + '"/>'; }
    } else {
      s += '<path d="M600 168 C580 124 540 120 500 128 L480 180 Z" fill="' + o.rygg + '" stroke="' + STREK + '" stroke-width="1.3"/>';
      s += '<path d="M360 250 C350 276 330 282 314 280 L306 244 Z" fill="' + o.rygg + '" stroke="' + STREK + '" stroke-width="1.3"/>';
    }
    s += '<path d="' + kropp + '" fill="url(#' + id + ')" stroke="' + STREK + '" stroke-width="1.8"/>';
    if (o.makrell) {
      var cl = FF.uid("mk");
      s += '<clipPath id="' + cl + '"><path d="' + kropp + '"/></clipPath><g clip-path="url(#' + cl + ')">';
      for (var i = 0; i < 16; i++) { var x = 250 + i * 38; s += '<path d="M' + x + " 150 C" + (x + 18) + " 170 " + (x - 12) + " 186 " + (x + 8) + ' 214" fill="none" stroke="#10262b" stroke-width="5"/>'; }
      s += "</g>";
    }
    s += '<path d="M790 180 C774 200 776 244 794 262" fill="none" stroke="' + STREK + '" stroke-width="1.4"/>';
    s += '<circle cx="848" cy="208" r="12" fill="#f2efe4" stroke="' + STREK + '" stroke-width="1.4"/><circle cx="850" cy="208" r="6.5" fill="#101418"/>';
    s += '<path d="M906 224 Q884 230 860 226" fill="none" stroke="' + STREK + '" stroke-width="1.6"/>';
    s += '<path d="M770 232 C740 230 712 242 700 256 C720 264 746 258 770 244 Z" fill="' + o.midt + '" stroke="' + STREK + '" stroke-width="1.1"/>';
    return s;
  }

  function krabbe(o) {
    var s = '<g transform="translate(500 214) scale(0.8)">';
    var farge = o.farge, mork = o.mork;
    for (var i = 0; i < 3; i++) for (var side = -1; side <= 1; side += 2) {
      var a = (-30 + i * 34) * Math.PI / 180, l = o.bein;
      var x1 = side * 70, y1 = -10 + i * 22;
      var x2 = side * (70 + Math.cos(a) * l * 0.6), y2 = y1 + Math.sin(a) * l * 0.6 - 30;
      var x3 = side * (70 + Math.cos(a) * l * 1.05), y3 = y1 + Math.sin(a) * l * 1.05 + 40;
      s += '<path d="M' + x1 + " " + y1 + " L" + x2.toFixed(0) + " " + y2.toFixed(0) + " L" + x3.toFixed(0) + " " + y3.toFixed(0) + '" fill="none" stroke="' + mork + '" stroke-width="' + o.tykk + '" stroke-linecap="round" stroke-linejoin="round"/>';
      s += '<path d="M' + x1 + " " + y1 + " L" + x2.toFixed(0) + " " + y2.toFixed(0) + " L" + x3.toFixed(0) + " " + y3.toFixed(0) + '" fill="none" stroke="' + farge + '" stroke-width="' + (o.tykk - 4) + '" stroke-linecap="round" stroke-linejoin="round"/>';
    }
    // Klør
    [[-1, o.klo], [1, o.klo * (o.ulikKlo ? 1.35 : 1)]].forEach(function (k) {
      var sd = k[0], st = k[1];
      s += '<path d="M' + (sd * 40) + " -60 L" + (sd * 70) + " -110 L" + (sd * 50) + ' -140" fill="none" stroke="' + mork + '" stroke-width="' + (o.tykk + 2) + '" stroke-linecap="round"/>';
      s += '<ellipse cx="' + (sd * 46) + '" cy="-150" rx="' + (10 * st) + '" ry="' + (18 * st) + '" fill="' + farge + '" stroke="' + mork + '" stroke-width="3"/>';
    });
    s += '<path d="M0 -80 C70 -80 90 -30 86 10 C80 60 40 80 0 80 C-40 80 -80 60 -86 10 C-90 -30 -70 -80 0 -80 Z" fill="' + farge + '" stroke="' + mork + '" stroke-width="3"/>';
    if (o.pigger) for (var p = 0; p < 22; p++) { var ang = p / 22 * Math.PI * 2, r = 50 + (p % 3) * 10; s += '<path d="M' + (Math.cos(ang) * r).toFixed(0) + " " + (Math.sin(ang) * r * 0.9).toFixed(0) + ' l4 -9 l4 9 z" fill="' + mork + '"/>'; }
    s += '<circle cx="-12" cy="-76" r="5" fill="#101418"/><circle cx="12" cy="-76" r="5" fill="#101418"/>';
    return s + "</g>";
  }

  function reke() {
    var s = '<g fill="#e7937e" stroke="' + STREK + '" stroke-width="1.5">';
    s += '<path d="M760 190 C700 150 600 140 500 160 C420 176 360 210 330 260 C316 290 330 312 360 306 C380 300 390 280 410 262 C460 222 540 210 620 216 C680 220 730 214 760 190 Z"/>';
    for (var i = 0; i < 6; i++) s += '<path d="M' + (420 + i * 55) + " " + (170 - i * 2) + " C" + (410 + i * 55) + " 200 " + (420 + i * 55) + " 220 " + (440 + i * 55) + ' 222" fill="none"/>';
    s += '<path d="M330 262 C300 250 280 270 290 300 C300 320 330 318 350 300 Z"/>';
    s += "</g>";
    s += '<path d="M760 186 C820 150 900 110 960 90 M760 190 C840 180 900 176 970 160" fill="none" stroke="' + STREK + '" stroke-width="1.5"/>';
    s += '<path d="M770 180 L830 176" stroke="' + STREK + '" stroke-width="3"/>';
    for (var b = 0; b < 5; b++) s += '<path d="M' + (560 + b * 34) + ' 214 l-6 40" stroke="' + STREK + '" stroke-width="1.5"/>';
    s += '<circle cx="740" cy="182" r="7" fill="#101418"/>';
    return s;
  }

  /* ---------- Artsdata ---------- */
  FF.arter = [
    { id: "torsk", navn: "Torsk", latin: "Gadus morhua", tegn: function () { return torskefisk(TORSKEFISK.torsk); },
      kjenn: ["Lang skjeggtråd under haka", "Lys, buet sidelinje", "Flekkete, grønnbrun rygg", "Overkjeven stikker lengst fram"],
      fakta: "Kysttorsk og skrei (nordøstarktisk torsk). Skreien gyter i Lofoten og langs kysten i februar–april.", redskap: "Garn, line, juksa, snurrevad, trål" },
    { id: "hyse", navn: "Hyse", latin: "Melanogrammus aeglefinus", tegn: function () { return torskefisk(TORSKEFISK.hyse); },
      kjenn: ["Svart sidelinje", "Svart flekk over brystfinnen", "Høy, spiss første ryggfinne", "Liten skjeggtråd"],
      fakta: "Lever nær bunnen og tar mye smådyr. Viktig i line- og snurrevadfisket.", redskap: "Line, snurrevad, trål, garn" },
    { id: "sei", navn: "Sei", latin: "Pollachius virens", tegn: function () { return torskefisk(TORSKEFISK.sei); },
      kjenn: ["Rett, lys sidelinje", "Mørk grønngrå rygg", "Svakt kløftet halefinne", "Ingen eller bitteliten skjeggtråd"],
      fakta: "Stimfisk som jager i de frie vannmassene. Tas i not, trål, garn og på juksa.", redskap: "Not, trål, garn, juksa" },
    { id: "lyr", navn: "Lyr", latin: "Pollachius pollachius", tegn: function () { return torskefisk(TORSKEFISK.lyr); },
      kjenn: ["Underkjeven stikker tydelig fram", "Mørk sidelinje med bue over brystfinnen", "Brunlig farge", "Ingen skjeggtråd"],
      fakta: "Kystnær art som ofte står ved tareskog og bratte kanter. Forveksles med sei.", redskap: "Garn, juksa, snøre" },
    { id: "lange", navn: "Lange", latin: "Molva molva", tegn: function () { return langstrakt({ art: "lange", rygg: "#5f6143", side: "#8f8a64", buk: "#ebe7da" }); },
      kjenn: ["Lang og smal kropp", "To ryggfinner – den første er kort", "Mørk flekk bakerst på finnene", "Skjeggtråd"],
      fakta: "Står på hard bunn på dypt vann. Viktig bifangst i linefisket.", redskap: "Line, garn" },
    { id: "brosme", navn: "Brosme", latin: "Brosme brosme", tegn: function () { return langstrakt({ art: "brosme", rygg: "#7a5d3a", side: "#a8875c", buk: "#eee4cf", hvitkant: true }); },
      kjenn: ["Én lang ryggfinne og én lang gattfinne", "Finnene har hvit kant", "Finnene går nesten sammen med halen", "Skjeggtråd"],
      fakta: "Dypvannsart på hard bunn. Tas nesten bare på line.", redskap: "Line" },
    { id: "kveite", navn: "Kveite", latin: "Hippoglossus hippoglossus", tegn: function () { return flatfisk({ lys: "#6d6e56", mork: "#44453a", bue: true, maane: true }); },
      kjenn: ["Høyrevendt flatfisk – øynene på høyre side", "Sidelinja har en høy bue over brystfinnen", "Halefinnen er måneformet", "Kan bli svært stor"],
      fakta: "Norges største flatfisk. Vokser sakte og blir kjønnsmoden sent. Strenge regler for fangst.", redskap: "Line, garn, juksa" },
    { id: "blakveite", navn: "Blåkveite", latin: "Reinhardtius hippoglossoides", tegn: function () { return flatfisk({ lys: "#58606a", mork: "#343a42", oyeKant: true, speil: true }); },
      kjenn: ["Venstrevendt – det ene øyet sitter på kanten", "Mørk på begge sider", "Rett sidelinje", "Lang og smal for en flatfisk"],
      fakta: "Lever på dypt vann langs eggakanten. Eget reguleringsregime.", redskap: "Line, garn, trål" },
    { id: "steinbit", navn: "Gråsteinbit", latin: "Anarhichas lupus", tegn: steinbit,
      kjenn: ["Stort hode med kraftige tenner", "Mørke tverrbånd", "Lang ryggfinne fra nakken til halen", "Ingen bukfinner"],
      fakta: "Knuser skjell og kråkeboller med tennene. Bruk hansker og vær forsiktig med kjeften.", redskap: "Line, garn, snurrevad" },
    { id: "uer", navn: "Uer", latin: "Sebastes spp.", tegn: uer,
      kjenn: ["Rød eller oransje", "Store øyne", "Pigger i ryggfinnen", "Kort og høy kropp"],
      fakta: "Vokser svært sakte og føder levende unger. Flere arter med strenge reguleringer.", redskap: "Trål, line, garn" },
    { id: "sild", navn: "Sild", latin: "Clupea harengus", tegn: function () { return sild({ rygg: "#2f6b86", midt: "#9dbccc" }); },
      kjenn: ["Blank, sølvfarget", "Én ryggfinne midt på ryggen", "Kløftet halefinne", "Løse skjell"],
      fakta: "Norsk vårgytende sild vandrer mellom gyteplasser på kysten og beiteområder i Norskehavet.", redskap: "Ringnot, flytetrål" },
    { id: "makrell", navn: "Makrell", latin: "Scomber scombrus", tegn: function () { return sild({ rygg: "#1f5d66", midt: "#8fb6b8", makrell: true }); },
      kjenn: ["Mørke bølgete striper på ryggen", "To ryggfinner", "Små småfinner foran halen", "Ingen svømmeblære"],
      fakta: "Stimfisk som vandrer inn i Nordsjøen og Norskehavet om sommeren og høsten.", redskap: "Ringnot, flytetrål, snøre" },
    { id: "kongekrabbe", navn: "Kongekrabbe", latin: "Paralithodes camtschaticus", tegn: function () { return krabbe({ farge: "#9b3a2e", mork: "#4a1813", bein: 170, tykk: 14, klo: 1, ulikKlo: true, pigger: true }); },
      kjenn: ["Tre par gangbein – ser ut som seks bein", "Piggete skall", "Høyre klo er større", "Kan bli over 10 kg"],
      fakta: "Innført art i Øst-Finnmark. Kvoteregulert øst for Nordkapp og fritt fiske vest for.", redskap: "Teine" },
    { id: "snokrabbe", navn: "Snøkrabbe", latin: "Chionoecetes opilio", tegn: function () { return krabbe({ farge: "#d08a4f", mork: "#6e3f1c", bein: 200, tykk: 10, klo: 0.7 }); },
      kjenn: ["Flate, lange bein", "Glatt, rundt skall", "Lys oransje farge", "Små klør"],
      fakta: "Lever på bunnen i Barentshavet. Fiskes med teinelenker på dypt vann.", redskap: "Teine" },
    { id: "reke", navn: "Dypvannsreke", latin: "Pandalus borealis", tegn: reke,
      kjenn: ["Rosa og gjennomsiktig", "Lange antenner", "Ryggen har en tydelig bøy", "Hunnene bærer rogn under halen"],
      fakta: "Tas med reketrål med sorteringsrist som slipper ut fisk.", redskap: "Reketrål" }
  ];

  FF.fig.art = function (o) {
    var a = FF.arter.filter(function (x) { return x.id === (o && o.art || "torsk"); })[0];
    return '<svg viewBox="60 40 900 360" role="img" aria-label="' + FF.esc(a.navn) + '">' + a.tegn() + "</svg>";
  };
  FF.fig.art.bank = { a: { art: "hyse" }, tekst: "Artsplansje. Bytt art med { art: 'sei' } osv." };

  /* ---------- Torskens anatomi ---------- */
  FF.fig.torskAnatomi = function (o) {
    o = o || {};
    var s = '<svg viewBox="40 20 960 400" role="img" aria-label="Torsk sett fra siden med navn på finner, sidelinje, gjellelokk og skjeggtråd' + (o.blogg ? ", og hvor bløggekuttet skal være" : "") + '.">';
    s += torskefisk(TORSKEFISK.torsk);
    if (o.blogg) {
      s += '<path d="M812 286 C800 266 792 250 790 232" fill="none" stroke="var(--magenta)" stroke-width="5" stroke-linecap="round" stroke-dasharray="2 8"/>';
      s += '<path d="M806 300 C822 296 836 286 846 272" fill="none" stroke="var(--magenta)" stroke-width="4" stroke-linecap="round"/>';
      s += S.merke(826, 290, 990, 360, "Bløggekutt ved strupen", "end");
      s += '<text x="990" y="380" class="t-mono t-magenta" text-anchor="end">kutt blodårene – ikke</text><text x="990" y="396" class="t-mono t-magenta" text-anchor="end">stikk inn i buken</text>';
    }
    if (o.etiketter !== false) {
      s += S.merke(642, 70, 642, 36, "1. ryggfinne", "middle");
      s += S.merke(480, 80, 480, 36, "2. ryggfinne", "middle");
      s += S.merke(336, 106, 330, 36, "3. ryggfinne", "middle");
      s += S.merke(440, 344, 440, 396, "1. gattfinne", "middle");
      s += S.merke(306, 316, 300, 396, "2. gattfinne", "middle");
      s += S.merke(120, 220, 60, 118, "Halefinne", "start");
      s += S.merke(520, 206, 560, 150, "Sidelinje", "start");
      s += S.merke(700, 262, 640, 396, "Brystfinne", "middle");
      s += S.merke(780, 330, 760, 396, "Bukfinne", "middle");
      if (!o.blogg) s += S.merke(866, 276, 930, 330, "Skjeggtråd", "start");
      s += S.merke(772, 200, 760, 36, "Gjellelokk", "middle");
      s += S.merke(504, 304, 540, 396, "Gattåpning", "middle");
      s += S.merke(838, 194, 900, 110, "Øye", "start");
    }
    return s + "</svg>";
  };
  FF.fig.torskAnatomi.bank = { a: { blogg: true }, tekst: "Torsk med navn på delene og bløggekutt." };
})();

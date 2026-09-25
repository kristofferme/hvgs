/* Kart: kurskartet på forsiden og fiskerikart til modulene.
   Kystlinja er Natural Earth 1:10m i Mercator (se verktoy/lag_kart.mjs). */

(function () {
  var S = FF.svg;

  // Mercator: x er lineær i lengde, y følger ln(tan(45° + φ/2)).
  function lagProj() {
    var d = FF.kartdata;
    var L = d.lengde, B = d.bredde;
    var a = (L[L.length - 1][1] - L[0][1]) / (L[L.length - 1][0] - L[0][0]);
    var b = L[0][1] - a * L[0][0];
    function m(lat) { return Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360)); }
    var k = (B[B.length - 1][1] - B[0][1]) / (m(B[B.length - 1][0]) - m(B[0][0]));
    var c = B[0][1] - k * m(B[0][0]);
    return function (lon, lat) { return [a * lon + b, k * m(lat) + c]; };
  }
  FF.proj = function (lon, lat) { FF.proj = lagProj(); return FF.proj(lon, lat); };

  function grunnkart(o) {
    var d = FF.kartdata, W = d.W, H = d.H;
    var id = FF.uid("kart");
    var s = "";
    s += '<defs><clipPath id="' + id + '"><rect x="0" y="0" width="' + W + '" height="' + H + '"/></clipPath></defs>';
    s += '<rect width="' + W + '" height="' + H + '" fill="var(--flate)"/>';
    s += '<g clip-path="url(#' + id + ')">';
    // Gradnett
    d.bredde.forEach(function (b) { s += '<line x1="0" x2="' + W + '" y1="' + b[1] + '" y2="' + b[1] + '" stroke="var(--linje)" stroke-width="0.8"/>'; });
    d.lengde.forEach(function (l) { s += '<line y1="0" y2="' + H + '" x1="' + l[1] + '" x2="' + l[1] + '" stroke="var(--linje)" stroke-width="0.8"/>'; });
    // Grunne-bånd langs kysten – slik sjøkartet toner grunt vann
    ["se", "fi", "ru", "dk", "uk", "no"].forEach(function (k) {
      if (d[k]) s += '<path d="' + d[k] + '" fill="none" stroke="var(--grunt)" stroke-width="11" stroke-linejoin="round"/>';
    });
    ["se", "fi", "ru", "dk", "uk", "no"].forEach(function (k) {
      if (d[k]) s += '<path d="' + d[k] + '" fill="none" stroke="var(--grunt-2)" stroke-width="4" stroke-linejoin="round"/>';
    });
    ["se", "fi", "ru", "dk", "uk"].forEach(function (k) {
      if (d[k]) s += '<path d="' + d[k] + '" fill="var(--land)" fill-opacity="0.55" stroke="var(--blekk-3)" stroke-width="0.6"/>';
    });
    s += '<path d="' + d.no + '" fill="var(--land)" stroke="var(--blekk)" stroke-width="0.7"/>';
    // Havnavn i kursiv, som på sjøkartet
    var hav = o.hav !== false ? [
      ["NORSKEHAVET", 5.5, 67.2], ["BARENTSHAVET", 27.5, 72.15]
    ] : [];
    hav.forEach(function (h) {
      var p = FF.proj(h[1], h[2]);
      s += '<text x="' + p[0].toFixed(1) + '" y="' + p[1].toFixed(1) + '" text-anchor="middle" style="font:italic 400 13px var(--f-tekst);letter-spacing:.32em;fill:var(--blekk-3)">' + h[0] + "</text>";
    });
    s += "</g>";
    return s;
  }

  // Kartramme med gradstige (annenhver halve grad svart/hvit)
  function ramme(W, H) {
    var d = FF.kartdata, s = "", t = 7;
    var y0 = FF.proj(10, 57.5)[1];
    s += '<rect x="-' + t + '" y="-' + t + '" width="' + (W + 2 * t) + '" height="' + (H + 2 * t) + '" fill="none" stroke="var(--blekk)" stroke-width="1"/>';
    s += '<rect x="0" y="0" width="' + W + '" height="' + H + '" fill="none" stroke="var(--blekk)" stroke-width="1"/>';
    for (var lat = 57.5; lat < 73; lat += 0.5) {
      var ya = FF.proj(10, lat)[1], yb = FF.proj(10, lat + 0.5)[1];
      var y1 = Math.max(0, Math.min(H, yb)), y2 = Math.max(0, Math.min(H, ya));
      if (y2 - y1 <= 0) continue;
      if (Math.round(lat * 2) % 2 === 0) {
        s += '<rect x="-' + t + '" y="' + y1.toFixed(1) + '" width="' + t + '" height="' + (y2 - y1).toFixed(1) + '" fill="var(--blekk)"/>';
        s += '<rect x="' + W + '" y="' + y1.toFixed(1) + '" width="' + t + '" height="' + (y2 - y1).toFixed(1) + '" fill="var(--blekk)"/>';
      }
    }
    for (var lon = 0; lon < 34; lon += 1) {
      var xa = FF.proj(lon, 65)[0], xb = FF.proj(lon + 1, 65)[0];
      var x1 = Math.max(0, xa), x2 = Math.min(W, xb);
      if (x2 - x1 <= 0) continue;
      if (lon % 2 === 0) {
        s += '<rect x="' + x1.toFixed(1) + '" y="-' + t + '" width="' + (x2 - x1).toFixed(1) + '" height="' + t + '" fill="var(--blekk)"/>';
        s += '<rect x="' + x1.toFixed(1) + '" y="' + H + '" width="' + (x2 - x1).toFixed(1) + '" height="' + t + '" fill="var(--blekk)"/>';
      }
    }
    d.bredde.forEach(function (b) {
      if (b[1] < 14 || b[1] > H - 8) return;
      s += '<text x="6" y="' + (b[1] - 4) + '" class="t-mono t-dempet">' + b[0] + "°N</text>";
    });
    d.lengde.forEach(function (l) {
      if (l[1] < 20 || l[1] > W - 30) return;
      s += '<text x="' + (l[1] + 4) + '" y="' + (H - 6) + '" class="t-mono t-dempet">' + l[0] + "°Ø</text>";
    });
    return s;
  }

  function kompassrose(cx, cy, r) {
    var s = '<g aria-hidden="true">';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + r + '" fill="none" stroke="var(--magenta)" stroke-width="0.9"/>';
    s += '<circle cx="' + cx + '" cy="' + cy + '" r="' + (r - 7) + '" fill="none" stroke="var(--magenta)" stroke-width="0.6"/>';
    for (var g = 0; g < 360; g += 10) {
      var a = (g - 90) * Math.PI / 180, l = g % 30 === 0 ? 7 : 4;
      s += '<line x1="' + (cx + Math.cos(a) * r).toFixed(1) + '" y1="' + (cy + Math.sin(a) * r).toFixed(1) + '" x2="' + (cx + Math.cos(a) * (r - l)).toFixed(1) + '" y2="' + (cy + Math.sin(a) * (r - l)).toFixed(1) + '" stroke="var(--magenta)" stroke-width="0.8"/>';
    }
    s += '<path d="M' + cx + " " + (cy - r + 9) + " L" + (cx + 5) + " " + cy + " L" + cx + " " + (cy + r - 9) + " L" + (cx - 5) + " " + cy + ' Z" fill="none" stroke="var(--magenta)" stroke-width="0.9"/>';
    s += '<path d="M' + cx + " " + (cy - r + 9) + " L" + (cx + 5) + " " + cy + " L" + cx + " " + cy + ' Z" fill="var(--magenta)"/>';
    s += '<text x="' + cx + '" y="' + (cy - r - 5) + '" text-anchor="middle" class="t-mono t-magenta">N</text>';
    return s + "</g>";
  }
  FF.fig.kompassrose = kompassrose;

  function baat(x, y, vinkel) {
    return '<g transform="translate(' + x + " " + y + ") rotate(" + (vinkel || 0) + ')"><path d="M0 -11 C5 -6 6 2 5 9 L-5 9 C-6 2 -5 -6 0 -11 Z" fill="var(--blekk)" stroke="var(--flate)" stroke-width="1.5"/><rect x="-2.5" y="0" width="5" height="4" fill="var(--flate)"/></g>';
  }

  /* Forsidens kurskart */
  FF.fig.kurskart = function (o) {
    var d = FF.kartdata, W = d.W, H = d.H;
    var e = d.etapper;
    var ferdige = o.ferdige || [];
    var moduler = o.moduler || [];
    var s = '<svg viewBox="-12 -12 ' + (W + 24) + " " + (H + 24) + '" role="img" aria-label="Sjøkart over norskekysten med kurslinja fra Hustadvika til Vardø. Hver havn er en modul.">';
    s += grunnkart({});
    // 62°N
    var y62 = FF.proj(10, 62)[1];
    s += '<line x1="0" x2="' + W + '" y1="' + y62 + '" y2="' + y62 + '" stroke="var(--magenta)" stroke-width="1.2" stroke-dasharray="8 4"/>';
    s += '<text x="' + (W - 8) + '" y="' + (y62 - 6) + '" text-anchor="end" class="t-mono t-magenta">62°N · reguleringsgrense</text>';
    // Kurslinje
    var nesteI = ferdige.indexOf(false);
    if (nesteI === -1) nesteI = e.length;
    for (var i = 0; i < e.length - 1; i++) {
      var ferdig = ferdige[i] && ferdige[i + 1];
      s += '<line x1="' + e[i][1] + '" y1="' + e[i][2] + '" x2="' + e[i + 1][1] + '" y2="' + e[i + 1][2] + '" stroke="var(--magenta)" stroke-width="' + (ferdig ? 2.4 : 1.4) + '"' + (ferdig ? "" : ' stroke-dasharray="5 4"') + "/>";
    }
    // Skolen
    var skole = FF.proj(7.14, 62.85);
    s += '<rect x="' + (skole[0] - 4) + '" y="' + (skole[1] - 4) + '" width="8" height="8" fill="var(--blekk)" transform="rotate(45 ' + skole[0] + " " + skole[1] + ')"/>';
    s += '<text x="' + (skole[0] + 10) + '" y="' + (skole[1] + 18) + '" class="t-liten">Hustadvika vgs</text>';
    // Havnene
    e.forEach(function (p, i) {
      var m = moduler[i];
      var ok = ferdige[i];
      var nord = i >= 10;
      var tx = nord ? p[1] : p[1] - 11, ty = nord ? p[2] - 11 : p[2] + 4;
      var anker = nord ? "middle" : "end";
      if (i === 11) { tx = p[1] + 10; ty = p[2] + 14; anker = "start"; }
      if (i === 17) { tx = p[1] + 4; ty = p[2] + 20; anker = "middle"; }
      if (i === 6) { tx = p[1] + 10; ty = p[2] + 4; anker = "start"; }
      if (i === 4) { tx = p[1] + 10; ty = p[2] + 10; anker = "start"; }
      var inn = '<circle cx="' + p[1] + '" cy="' + p[2] + '" r="5.5" fill="' + (ok ? "var(--magenta)" : "var(--flate)") + '" stroke="var(--magenta)" stroke-width="1.8"/>';
      if (i === nesteI) inn += '<circle cx="' + p[1] + '" cy="' + p[2] + '" r="10" fill="none" stroke="var(--magenta)" stroke-width="1"/>';
      inn += '<text x="' + tx + '" y="' + ty + '" text-anchor="' + anker + '" class="t-mono" style="font-size:10px">' + (m ? m.fag.toUpperCase() + m.nr : "") + "</text>";
      s += m ? '<a href="#' + m.id + '"><title>' + FF.esc(p[0] + " – " + m.tittel) + "</title>" + inn + "</a>" : inn;
    });
    if (nesteI < e.length) {
      var b = e[nesteI], f = e[Math.max(0, nesteI - 1)];
      var v = nesteI ? Math.atan2(b[2] - f[2], b[1] - f[1]) * 180 / Math.PI + 90 : 20;
      s += baat(b[1] - 16, b[2] + 12, v);
    }
    s += kompassrose(70, 150, 44);
    s += ramme(W, H);
    return s + "</svg>";
  };

  /* Fiskerikart med lag: {pil:[[lon,lat,lon,lat,tekst]], omr:[[lon,lat,rx,ry,tekst]], pkt:[[lon,lat,tekst]], linje62:true} */
  FF.fig.fiskerikart = function (o) {
    var d = FF.kartdata, W = d.W, H = d.H;
    var pil = FF.uid("pil");
    var s = '<svg viewBox="-12 -12 ' + (W + 24) + " " + (H + 24) + '" role="img" aria-label="' + FF.esc(o.alt || "Kart over norskekysten") + '">';
    s += "<defs>" + S.pil(pil, "var(--magenta)") + "</defs>";
    s += grunnkart(o);
    (o.omr || []).forEach(function (a) {
      var c = FF.proj(a[0], a[1]);
      s += '<ellipse cx="' + c[0].toFixed(1) + '" cy="' + c[1].toFixed(1) + '" rx="' + a[2] + '" ry="' + a[3] + '" fill="var(--magenta)" fill-opacity="0.13" stroke="var(--magenta)" stroke-width="1.2" stroke-dasharray="4 3"/>';
      if (a[4]) s += '<text x="' + (c[0] + (a[5] || 0)).toFixed(1) + '" y="' + (c[1] + (a[6] || 4)).toFixed(1) + '" text-anchor="middle" class="t-liten t-magenta">' + a[4] + "</text>";
    });
    // Piler: [lon1, lat1, lon2, lat2, nummer, kontrollpunkt dx, dy]
    (o.pil || []).forEach(function (a) {
      var p1 = FF.proj(a[0], a[1]), p2 = FF.proj(a[2], a[3]);
      var mx = (p1[0] + p2[0]) / 2 + (a[5] || 0), my = (p1[1] + p2[1]) / 2 + (a[6] || 0);
      s += '<path d="M' + p1[0].toFixed(1) + " " + p1[1].toFixed(1) + " Q" + mx.toFixed(1) + " " + my.toFixed(1) + " " + p2[0].toFixed(1) + " " + p2[1].toFixed(1) + '" fill="none" stroke="var(--magenta)" stroke-width="2.4" marker-end="url(#' + pil + ')"/>';
      if (a[4] != null) {
        var bx = 0.25 * p1[0] + 0.5 * mx + 0.25 * p2[0], by = 0.25 * p1[1] + 0.5 * my + 0.25 * p2[1];
        s += '<circle cx="' + bx.toFixed(1) + '" cy="' + by.toFixed(1) + '" r="11" fill="var(--magenta)" stroke="var(--flate)" stroke-width="2"/>';
        s += '<text x="' + bx.toFixed(1) + '" y="' + (by + 4.5).toFixed(1) + '" text-anchor="middle" style="font:800 13px var(--f-sjablong);fill:#fff">' + a[4] + "</text>";
      }
    });
    // Tegnforklaring nede til høyre (over Sverige og Finland)
    if (o.legende) {
      var ly = H - 18 - o.legende.reduce(function (n, l) { return n + l[1].length * 16 + 10; }, 0) - 14;
      s += '<rect x="' + (W - 286) + '" y="' + ly + '" width="272" height="' + (H - 12 - ly) + '" fill="var(--flate)" stroke="var(--blekk)" stroke-width="1"/>';
      var yy = ly + 24;
      o.legende.forEach(function (l) {
        s += '<circle cx="' + (W - 266) + '" cy="' + (yy - 4) + '" r="9" fill="var(--magenta)"/><text x="' + (W - 266) + '" y="' + yy + '" text-anchor="middle" style="font:800 11px var(--f-sjablong);fill:#fff">' + l[0] + "</text>";
        l[1].forEach(function (t, i) { s += '<text x="' + (W - 248) + '" y="' + (yy + i * 16) + '" class="t-mono" style="font-size:11.5px;fill:var(--blekk)">' + t + "</text>"; });
        yy += l[1].length * 16 + 10;
      });
    }
    (o.pkt || []).forEach(function (a) {
      var p = FF.proj(a[0], a[1]);
      s += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="3.5" fill="var(--blekk)"/>';
      s += '<text x="' + (p[0] + (a[3] || 8)).toFixed(1) + '" y="' + (p[1] + (a[4] || 4)).toFixed(1) + '" class="t-liten"' + (a[5] ? ' text-anchor="' + a[5] + '"' : "") + ">" + a[2] + "</text>";
    });
    if (o.linje62) {
      var y62 = FF.proj(10, 62)[1];
      s += '<line x1="0" x2="' + W + '" y1="' + y62 + '" y2="' + y62 + '" stroke="var(--magenta)" stroke-width="1.6" stroke-dasharray="8 4"/>';
      s += '<text x="' + (W - 8) + '" y="' + (y62 - 7) + '" text-anchor="end" class="t-liten t-magenta">62°N</text>';
      s += '<text x="' + (W - 8) + '" y="' + (y62 + 16) + '" text-anchor="end" class="t-mono t-dempet">sør for 62°N</text>';
      s += '<text x="' + (W - 8) + '" y="' + (y62 - 22) + '" text-anchor="end" class="t-mono t-dempet">nord for 62°N</text>';
    }
    s += kompassrose(70, 150, 40);
    s += ramme(W, H);
    return s + "</svg>";
  };
})();

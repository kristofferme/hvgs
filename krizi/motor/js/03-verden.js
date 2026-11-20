  /* ==========================================================================
     Verden: den levende bakgrunnen. Tegnes på canvas hver frame og følger
     kameraet – rutenett og prikker beveger seg nøyaktig med lerretet,
     mens kart, nettverk og akvarell ligger i parallakse-dybder.
     ========================================================================== */

  var verden = (function () {
    var cv, ctx, fx, fxCtx, dpr = 1;
    var id = 'ingen', p = PALETTER.nordlys, r = rng(1), seed = 1;
    var stov = [], stjerneskudd = null, nesteSkudd = 0;
    var offX = 0, offY = 0, logZ = 0, prev = null;
    var topo = [], nett = null, flis = null, flisMonster = null, bokeh = [];
    var konfetti = [];
    var boksV = { cx: 0, cy: 0, d: 4000 };

    function init(canvas, fxCanvas) {
      cv = canvas; ctx = cv.getContext('2d');
      fx = fxCanvas; fxCtx = fx.getContext('2d');
    }
    function storrelse() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      [cv, fx].forEach(function (c) { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
    }
    function lagZ(dybde) { return Math.pow(cam.z, dybde) * Math.pow(zRef, 1 - dybde); }

    function oppdaterBoks() {
      var b = boks(doc.rammer);
      boksV = b ? { cx: b.cx, cy: b.cy, d: Math.max(1200, Math.hypot(b.w, b.h)) } : { cx: 0, cy: 0, d: 4000 };
      if (id === 'topografi') lagTopo();
      if (id === 'konstellasjon') lagNett();
    }

    function sett() {
      var a = aktivStil();
      id = a.s.verden; p = a.p; seed = a.s.seed || 1;
      r = rng(seed);
      stov = [];
      var antall = { nordlys: 150, stjerner: 280, kritt: 90, bokeh: 0, konstellasjon: 60 }[id];
      if (antall == null) antall = p.mork ? 70 : 45;
      for (var i = 0; i < antall; i++) stov.push({ x: r(), y: r(), d: 0.25 + r() * 0.75, o: r(), a: 0.25 + r() * 0.65, sz: 0.5 + r() * (id === 'stjerner' ? 1.2 : 1.5), tw: r() * 6.28 });
      bokeh = [];
      if (id === 'bokeh') for (var j = 0; j < 38; j++) bokeh.push({ x: r(), y: r(), d: 0.2 + r() * 0.8, o: r(), rr: 18 + r() * 70, c: trekk(r, [p.a1, p.a2, p.a3]), a: 0.05 + r() * 0.12 });
      flis = null; flisMonster = null;
      if (id === 'kritt') lagFlis(lagKrittFlis);
      if (id === 'blekk') lagFlis(lagBlekkFlis);
      oppdaterBoks();
    }

    /* ---------- Fliser for parallakse-teksturer ---------- */
    function lagFlis(tegner) {
      var T = 900;
      var c = document.createElement('canvas');
      c.width = T; c.height = T;
      var g = c.getContext('2d');
      tegner(g, T, rng(seed + 11));
      flis = c;
      flisMonster = ctx.createPattern(c, 'repeat');
    }
    function iAlleHjorner(T, x, y, fn) { [-T, 0, T].forEach(function (ox) { [-T, 0, T].forEach(function (oy) { fn(x + ox, y + oy); }); }); }
    function lagKrittFlis(g, T, rr) {
      g.lineCap = 'round';
      try { g.filter = 'blur(3px)'; } catch (e) { /* ok */ }
      for (var i = 0; i < 26; i++) {
        var x = rr() * T, y = rr() * T, l = 120 + rr() * 380, a = rr() * Math.PI, w = 18 + rr() * 60;
        iAlleHjorner(T, x, y, function (px, py) {
          g.strokeStyle = 'rgba(255,255,255,' + (0.012 + rr() * 0.03).toFixed(3) + ')';
          g.lineWidth = w;
          g.beginPath();
          g.moveTo(px, py);
          g.quadraticCurveTo(px + Math.cos(a) * l * 0.5 + (rr() - 0.5) * 80, py + Math.sin(a) * l * 0.5 + (rr() - 0.5) * 80, px + Math.cos(a) * l, py + Math.sin(a) * l);
          g.stroke();
        });
      }
      try { g.filter = 'none'; } catch (e) { /* ok */ }
    }
    function lagBlekkFlis(g, T, rr) {
      var farger = [p.a1, p.a2, p.a3];
      for (var i = 0; i < 11; i++) {
        var x = rr() * T, y = rr() * T, rad0 = 70 + rr() * 170, c = farger[i % 3];
        for (var lag = 0; lag < 7; lag++) {
          var pts = [], n = 18;
          for (var k = 0; k < n; k++) {
            var a = k / n * Math.PI * 2, rr2 = rad0 * (0.7 + rr() * 0.5) * (1 - lag * 0.06);
            pts.push([Math.cos(a) * rr2, Math.sin(a) * rr2]);
          }
          iAlleHjorner(T, x, y, function (px, py) {
            g.fillStyle = rgba(c, p.mork ? 0.035 : 0.045);
            g.beginPath();
            pts.forEach(function (q, qi) { if (qi) g.lineTo(px + q[0], py + q[1]); else g.moveTo(px + q[0], py + q[1]); });
            g.closePath();
            g.fill();
          });
        }
      }
    }
    function tegnFlis(dybde, alfa) {
      if (!flisMonster || !flisMonster.setTransform || typeof DOMMatrix === 'undefined') return;
      var zp = lagZ(dybde), k = clamp(zp / zRef, 0.3, 4), T = flis.width;
      var m = new DOMMatrix()
        .translateSelf(W / 2 + po.x * dybde, H / 2 + po.y * dybde)
        .rotateSelf(-cam.r)
        .scaleSelf(k, k)
        .translateSelf(-mod(cam.x * zRef, T), -mod(cam.y * zRef, T));
      flisMonster.setTransform(m);
      ctx.globalAlpha = alfa;
      ctx.fillStyle = flisMonster;
      ctx.fillRect(0, 0, W, H);
      ctx.globalAlpha = 1;
    }

    /* ---------- Topografi: høydekurver rundt seedede topper ---------- */
    function lagTopo() {
      var rr = rng(seed + 3);
      topo = [];
      for (var i = 0; i < 7; i++) {
        var rb = boksV.d * (0.04 + rr() * 0.06);
        topo.push({
          x: boksV.cx + (rr() - 0.5) * boksV.d * 1.3, y: boksV.cy + (rr() - 0.5) * boksV.d * 1.0,
          rb: rb, n: 9 + Math.floor(rr() * 6), f1: rr() * 6.28, f2: rr() * 6.28, f3: rr() * 6.28, k1: 0.08 + rr() * 0.12, k2: 0.04 + rr() * 0.08
        });
      }
    }
    function tegnTopo() {
      var dybde = 0.45, zp = lagZ(dybde);
      ctx.save();
      ctx.translate(W / 2 + po.x * dybde, H / 2 + po.y * dybde);
      ctx.rotate(-rad(cam.r));
      ctx.scale(zp, zp);
      ctx.translate(-cam.x, -cam.y);
      var R = Math.hypot(W, H) / 2 / zp;
      topo.forEach(function (t) {
        for (var i = 1; i <= t.n; i++) {
          var rr = t.rb * i * 0.62;
          if (Math.hypot(t.x - cam.x, t.y - cam.y) - rr * 1.25 > R) continue;
          if (rr * zp < 3) continue;
          ctx.beginPath();
          for (var k = 0; k <= 80; k++) {
            var a = k / 80 * Math.PI * 2;
            var q = rr * (1 + t.k1 * Math.sin(3 * a + t.f1 + i * 0.15) + t.k2 * Math.sin(5 * a + t.f2 - i * 0.1) + 0.03 * Math.sin(9 * a + t.f3));
            var x = t.x + Math.cos(a) * q, y = t.y + Math.sin(a) * q;
            if (k) ctx.lineTo(x, y); else ctx.moveTo(x, y);
          }
          ctx.strokeStyle = rgba(i % 5 === 0 ? p.a1 : p.ink, i % 5 === 0 ? 0.22 : (p.mork ? 0.1 : 0.13));
          ctx.lineWidth = (i % 5 === 0 ? 1.6 : 1) / zp;
          ctx.stroke();
        }
      });
      ctx.restore();
    }

    /* ---------- Rutenett og prikker: uendelig zoom i nivåer ---------- */
    function nivaer(minPx) {
      var base = 100, L = Math.log(minPx / (base * cam.z)) / Math.log(5);
      var n = Math.ceil(L), f = n - L;
      return { sw: base * Math.pow(5, n), f: f };
    }
    function tegnRutenett(prikker) {
      ctx.save();
      ctx.translate(W / 2 + po.x, H / 2 + po.y);
      ctx.rotate(-rad(cam.r));
      var R = Math.hypot(W, H) / 2 + 20;
      var nv = nivaer(prikker ? 34 : 22);
      function niva(sw, alfa, str) {
        var sp = sw * cam.z;
        if (alfa < 0.01) return;
        var x0 = Math.ceil((cam.x - R / cam.z) / sw), x1 = Math.floor((cam.x + R / cam.z) / sw);
        var y0 = Math.ceil((cam.y - R / cam.z) / sw), y1 = Math.floor((cam.y + R / cam.z) / sw);
        if ((x1 - x0) > 400 || (y1 - y0) > 400) return;
        ctx.beginPath();
        if (prikker) {
          for (var i = x0; i <= x1; i++) {
            var u = (i * sw - cam.x) * cam.z;
            for (var j = y0; j <= y1; j++) {
              var v = (j * sw - cam.y) * cam.z;
              ctx.rect(u - str / 2, v - str / 2, str, str);
            }
          }
          ctx.fillStyle = rgba(p.ink, alfa);
          ctx.fill();
        } else {
          for (var a = x0; a <= x1; a++) { var uu = (a * sw - cam.x) * cam.z; ctx.moveTo(uu, -R); ctx.lineTo(uu, R); }
          for (var b = y0; b <= y1; b++) { var vv = (b * sw - cam.y) * cam.z; ctx.moveTo(-R, vv); ctx.lineTo(R, vv); }
          ctx.strokeStyle = rgba(p.ink, alfa);
          ctx.lineWidth = str;
          ctx.stroke();
        }
        return sp;
      }
      var grunn = p.mork ? 0.11 : 0.12;
      niva(nv.sw, grunn * smooth(nv.f * 1.4), prikker ? 2 : 1);
      niva(nv.sw * 5, grunn * (prikker ? 1.5 : 1.6), prikker ? 3 : 1.3);
      if (!prikker) niva(nv.sw * 25, grunn * 0.9, 2.2);
      ctx.restore();
    }

    /* ---------- Hav: bølgelinjer som ruller ---------- */
    function tegnHav(t) {
      ctx.save();
      ctx.translate(W / 2 + po.x * 0.5, H / 2 + po.y * 0.5);
      ctx.rotate(-rad(cam.r));
      var R = Math.hypot(W, H) / 2 + 40;
      var avstand = 46 * (1 + 0.35 * Math.sin(logZ * 0.5));
      var skyv = mod(offY * 0.35, avstand);
      for (var y = -R - avstand + skyv, i = 0; y < R + avstand; y += avstand, i++) {
        var idx = Math.round((y - skyv) / avstand) + Math.floor(offY * 0.35 / avstand);
        var amp = 9 + 6 * Math.sin(idx * 0.7);
        var fase = t * 0.00045 * (1 + (mod(idx, 5)) * 0.08) + offX * 0.004 + idx * 0.9;
        ctx.beginPath();
        for (var x = -R; x <= R; x += 14) {
          var yy = y + Math.sin(x * 0.012 + fase) * amp + Math.sin(x * 0.031 - fase * 1.4) * amp * 0.35;
          if (x === -R) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        var c = mod(idx, 6) === 0 ? p.a1 : p.ink;
        ctx.strokeStyle = rgba(c, mod(idx, 6) === 0 ? 0.24 : (p.mork ? 0.09 : 0.12));
        ctx.lineWidth = mod(idx, 6) === 0 ? 1.6 : 1;
        ctx.stroke();
      }
      ctx.restore();
    }

    /* ---------- Nettverk: punkter og linjer i parallakse ---------- */
    function lagNett() {
      var rr = rng(seed + 5), T = boksV.d * 0.7, pk = [];
      for (var i = 0; i < 64; i++) pk.push({ x: rr() * T, y: rr() * T, tw: rr() * 6.28, s: 0.6 + rr() * 1.6 });
      var par = [];
      for (var a = 0; a < pk.length; a++) for (var b = a + 1; b < pk.length; b++) {
        var d = Math.hypot(pk[a].x - pk[b].x, pk[a].y - pk[b].y);
        if (d < T * 0.17) par.push([a, b, d / (T * 0.17)]);
      }
      nett = { T: T, pk: pk, par: par };
    }
    function tegnNett(t) {
      if (!nett) lagNett();
      var dybde = 0.55, zp = lagZ(dybde), T = nett.T;
      var R = Math.hypot(W, H) / 2 / zp;
      var i0 = Math.floor((cam.x - R) / T), i1 = Math.floor((cam.x + R) / T);
      var j0 = Math.floor((cam.y - R) / T), j1 = Math.floor((cam.y + R) / T);
      if ((i1 - i0 + 1) * (j1 - j0 + 1) > 16) return;
      ctx.save();
      ctx.translate(W / 2 + po.x * dybde, H / 2 + po.y * dybde);
      ctx.rotate(-rad(cam.r));
      ctx.scale(zp, zp);
      ctx.translate(-cam.x, -cam.y);
      for (var i = i0; i <= i1; i++) for (var j = j0; j <= j1; j++) {
        var ox = i * T, oy = j * T;
        ctx.beginPath();
        nett.par.forEach(function (pr) {
          var a = nett.pk[pr[0]], b = nett.pk[pr[1]];
          ctx.moveTo(ox + a.x, oy + a.y); ctx.lineTo(ox + b.x, oy + b.y);
        });
        ctx.strokeStyle = rgba(p.a2, 0.12);
        ctx.lineWidth = 1 / zp;
        ctx.stroke();
        nett.pk.forEach(function (q) {
          var a = 0.35 + 0.35 * Math.sin(t * 0.0012 + q.tw);
          ctx.fillStyle = rgba(q.s > 1.6 ? p.a1 : p.ink, a);
          ctx.beginPath();
          ctx.arc(ox + q.x, oy + q.y, q.s * 1.6 / zp, 0, Math.PI * 2);
          ctx.fill();
        });
      }
      ctx.restore();
    }

    /* ---------- Støv og stjerner: strømmer utover når du zoomer inn ---------- */
    function tegnStov(t, farge, styrke) {
      var S = Math.max(W, H) * 1.25;
      for (var i = 0; i < stov.length; i++) {
        var q = stov[i];
        var fase = frac(q.o + logZ * 0.2 * q.d);
        var k = 0.4 * Math.exp(fase * 1.9);
        var bx = mod(q.x * S - offX * q.d * 0.55, S) - S / 2;
        var by = mod(q.y * S - offY * q.d * 0.55, S) - S / 2;
        var sx = W / 2 + bx * k + po.x * q.d, sy = H / 2 + by * k + po.y * q.d;
        if (sx < -10 || sy < -10 || sx > W + 10 || sy > H + 10) continue;
        var a = q.a * Math.sin(fase * Math.PI) * styrke;
        if (id === 'stjerner') a *= 0.65 + 0.35 * Math.sin(t * 0.002 + q.tw);
        if (a < 0.02) continue;
        ctx.beginPath();
        ctx.fillStyle = rgba(farge, a);
        ctx.arc(sx, sy, q.sz * (0.5 + k * 0.55), 0, Math.PI * 2);
        ctx.fill();
      }
    }
    function tegnBokeh(t) {
      var S = Math.max(W, H) * 1.3;
      ctx.save();
      if (p.mork) ctx.globalCompositeOperation = 'lighter';
      bokeh.forEach(function (q) {
        var fase = frac(q.o + logZ * 0.14 * q.d + t * 0.000015);
        var k = 0.5 * Math.exp(fase * 1.6);
        var sx = W / 2 + (mod(q.x * S - offX * q.d * 0.4, S) - S / 2) * k + po.x * q.d * 1.5;
        var sy = H / 2 + (mod(q.y * S - offY * q.d * 0.4, S) - S / 2) * k + po.y * q.d * 1.5;
        var rr = q.rr * (0.6 + k * 0.6);
        var a = q.a * Math.sin(fase * Math.PI);
        var g = ctx.createRadialGradient(sx, sy, 0, sx, sy, rr);
        g.addColorStop(0, rgba(q.c, a));
        g.addColorStop(0.7, rgba(q.c, a * 0.6));
        g.addColorStop(1, rgba(q.c, 0));
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(sx, sy, rr, 0, Math.PI * 2); ctx.fill();
      });
      ctx.restore();
    }
    function tegnNordlys(t) {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      [p.a1, p.a2, p.a3].forEach(function (c, i) {
        var y0 = H * (0.18 + i * 0.13) + Math.sin(t * 0.00011 + i) * 30 + po.y * 0.3;
        var g = ctx.createLinearGradient(0, y0 - 40, 0, y0 + 260);
        g.addColorStop(0, rgba(c, 0));
        g.addColorStop(0.15, rgba(c, 0.07));
        g.addColorStop(1, rgba(c, 0));
        ctx.fillStyle = g;
        ctx.beginPath();
        var skift = offX * 0.06 * (1 + i * 0.3) + po.x * 0.3;
        for (var x = -20; x <= W + 20; x += 16) {
          var y = y0 + Math.sin((x + skift) * 0.004 + t * 0.00035 * (1 + i * 0.2) + i * 2) * 50 + Math.sin((x + skift) * 0.011 - t * 0.0002) * 18;
          if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.lineTo(W + 20, y0 + 300); ctx.lineTo(-20, y0 + 300);
        ctx.closePath();
        ctx.fill();
      });
      ctx.restore();
    }
    function tegnStjerneskudd(t) {
      if (!stjerneskudd && t > nesteSkudd) {
        var a = rad(20 + Math.random() * 25);
        stjerneskudd = { x: Math.random() * W * 0.7, y: Math.random() * H * 0.4, a: a, t0: t };
        nesteSkudd = t + 5000 + Math.random() * 7000;
      }
      if (!stjerneskudd) return;
      var k = (t - stjerneskudd.t0) / 900;
      if (k > 1) { stjerneskudd = null; return; }
      var l = 180, x = stjerneskudd.x + Math.cos(stjerneskudd.a) * k * 500, y = stjerneskudd.y + Math.sin(stjerneskudd.a) * k * 500;
      var g = ctx.createLinearGradient(x, y, x - Math.cos(stjerneskudd.a) * l, y - Math.sin(stjerneskudd.a) * l);
      g.addColorStop(0, rgba(p.ink, 0.8 * Math.sin(k * Math.PI)));
      g.addColorStop(1, rgba(p.ink, 0));
      ctx.strokeStyle = g; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - Math.cos(stjerneskudd.a) * l, y - Math.sin(stjerneskudd.a) * l); ctx.stroke();
    }

    /* ---------- Konfetti ---------- */
    function feiring() {
      if (reduser) return;
      var farger = [p.a1, p.a2, p.a3, p.ink];
      for (var i = 0; i < 160; i++) {
        var a = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, v = 7 + Math.random() * 11;
        konfetti.push({ x: W / 2 + (Math.random() - 0.5) * 120, y: H * 0.62, vx: Math.cos(a) * v, vy: Math.sin(a) * v, r: Math.random() * 6.28, vr: (Math.random() - 0.5) * 0.3, w: 6 + Math.random() * 8, h: 4 + Math.random() * 6, c: farger[i % 4], liv: 1 });
      }
    }
    function tegnKonfetti() {
      fxCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fxCtx.clearRect(0, 0, W, H);
      if (!konfetti.length) return;
      konfetti = konfetti.filter(function (k) { return k.liv > 0 && k.y < H + 40; });
      konfetti.forEach(function (k) {
        k.vy += 0.28; k.vx *= 0.985; k.vy *= 0.985; k.x += k.vx; k.y += k.vy; k.r += k.vr; k.liv -= 0.004;
        fxCtx.save();
        fxCtx.translate(k.x, k.y); fxCtx.rotate(k.r);
        fxCtx.scale(1, Math.cos(k.r * 2.3));
        fxCtx.fillStyle = rgba(k.c, Math.min(1, k.liv * 2));
        fxCtx.fillRect(-k.w / 2, -k.h / 2, k.w, k.h);
        fxCtx.restore();
      });
    }

    function tegn(t) {
      if (!ctx) return;
      if (!prev) prev = { x: cam.x, y: cam.y, z: cam.z };
      var sd = rot((cam.x - prev.x) * cam.z, (cam.y - prev.y) * cam.z, -cam.r);
      offX += sd.x; offY += sd.y;
      if (prev.z > 0 && cam.z > 0) logZ += Math.log(cam.z / prev.z);
      prev.x = cam.x; prev.y = cam.y; prev.z = cam.z;
      if (!reduser) { offX += 0.1; offY += 0.03; }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, W, H);
      var tt = reduser ? 0 : t;
      switch (id) {
        case 'nordlys': tegnNordlys(tt); tegnStov(tt, p.ink, 1); break;
        case 'stjerner': tegnStov(tt, p.ink, 1); tegnStjerneskudd(tt); break;
        case 'rutenett': tegnRutenett(false); break;
        case 'prikker': tegnRutenett(true); break;
        case 'topografi': tegnTopo(); break;
        case 'hav': tegnHav(tt); tegnStov(tt, p.a1, 0.35); break;
        case 'konstellasjon': tegnNett(tt); break;
        case 'bokeh': tegnBokeh(tt); tegnStov(tt, p.ink, 0.5); break;
        case 'kritt': tegnFlis(0.3, 1); tegnStov(tt, p.ink, 0.5); break;
        case 'blekk': tegnFlis(0.3, 1); break;
        case 'papir': tegnStov(tt, p.ink, 0.25); break;
        default: break;
      }
      tegnKonfetti();
    }

    return { init: init, storrelse: storrelse, sett: sett, tegn: tegn, feiring: feiring, oppdaterBoks: oppdaterBoks };
  })();

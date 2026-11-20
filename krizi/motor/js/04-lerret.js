  /* ==========================================================================
     Tilstand, data og selve lerretet
     ========================================================================== */

  function normaliser(d) {
    d = d && typeof d === 'object' ? d : {};
    d.tittel = d.tittel || 'Uten tittel';
    d.id = d.id || uid() + uid();
    d.fart = typeof d.fart === 'number' ? clamp(d.fart, 0.4, 2.2) : 1;
    normaliserStil(d);
    d.rammer = Array.isArray(d.rammer) ? d.rammer : [];
    var ids = {};
    d.rammer.forEach(function (f) {
      if (!f.id || ids[f.id]) f.id = uid();
      ids[f.id] = true;
      f.x = +f.x || 0; f.y = +f.y || 0;
      f.s = +f.s > 0 ? +f.s : 1;
      f.r = +f.r || 0;
      if (!STORRELSER[f.form]) f.form = 'kort';
      if (f.stil && !RAMMESTILER[f.stil]) delete f.stil;
      if (f.inn && !INNGANGER[f.inn]) delete f.inn;
      if (f.overgang && !OVERGANGER[f.overgang]) delete f.overgang;
      f.tekst = f.tekst == null ? '' : String(f.tekst);
    });
    if (!Array.isArray(d.sti)) d.sti = d.rammer.map(function (f) { return f.id; });
    d.sti = d.sti.filter(function (e) { return typeof e === 'string' ? ids[e] : e && typeof e === 'object' && isFinite(e.x) && isFinite(e.y); });
    d.pynt = Array.isArray(d.pynt) ? d.pynt : [];
    d.koblinger = (Array.isArray(d.koblinger) ? d.koblinger : []).filter(function (k) { return k && ids[k.fra] && ids[k.til] && k.fra !== k.til; });
    return d;
  }
  function str(f) { var b = STORRELSER[f.form] || STORRELSER.kort; return [f.w || b[0], f.h || b[1]]; }
  function areal(f) { var s = str(f); return s[0] * s[1] * f.s * f.s; }
  function ramme(id) { for (var i = 0; i < doc.rammer.length; i++) if (doc.rammer[i].id === id) return doc.rammer[i]; return null; }
  function rammeStil(f) { return f.stil || doc.stil.ramme; }
  function rammeInn(f) { return f.inn || doc.stil.inn; }
  function tittelPa(f) {
    if (!f) return 'Utsnitt';
    var linjer = f.tekst.split('\n').map(function (s) { return s.trim(); }).filter(function (s) { return s && !/^!\[/.test(s) && s !== '||' && !/^-{3,}$/.test(s); });
    var linje = linjer.filter(function (s) { return /^#\s/.test(s); })[0] || linjer.filter(function (s) { return /^##\s/.test(s); })[0] || linjer[0];
    if (!linje) return /!\[/.test(f.tekst) ? 'Bilde' : 'Tom ramme';
    return linje.replace(/^(#{1,3}|!!|>|::|->|[-*•]|\d+[.)])\s*/, '').replace(/[*=`_~(){}]/g, '').replace(/\s\|\s.*$/, '').replace(/\|/g, '/').slice(0, 48);
  }

  var dataEl = document.getElementById('krizi-data');
  var doc;
  try { doc = normaliser(JSON.parse(dataEl ? dataEl.textContent : '{}')); }
  catch (e) { console.error('Krizi: kunne ikke lese presentasjonen', e); doc = normaliser({}); }

  var W = innerWidth, H = innerHeight;
  var cam = { x: 0, y: 0, z: 0.5, r: 0 };
  var po = { x: 0, y: 0 }, poMal = { x: 0, y: 0 };
  var zRef = 0.5;
  var pos = 0, viste = 0, aktivId = null, maalId = null;
  var redigerer = false, oversikt = false, friVisning = false;
  var valgt = null, valgtKobling = -1;
  var flight = null, parkert = null;
  var els = {};
  var lag = [];
  var UTKAST = 'krizi-utkast:' + doc.id;

  /* ---------- DOM ---------- */

  document.documentElement.lang = document.documentElement.lang || 'no';
  if (!document.title) document.title = doc.tittel;

  var root = h('div', { class: 'k-root' });
  var sky = h('div', { class: 'k-sky', html: '<i></i><i></i><i></i>' });
  var bgCv = h('canvas', { class: 'k-bg' });
  var stemA = h('div', { class: 'k-stemning' }), stemB = h('div', { class: 'k-stemning' });
  var stage = h('div', { class: 'k-stage' });
  var bak = h('div', { class: 'k-layer k-back' });
  var world = h('div', { class: 'k-world' });
  var fram = h('div', { class: 'k-layer k-front' });
  var lerretSvg = svgEl('svg', { class: 'k-lerret-svg' });
  var trailAlle = svgEl('path', { class: 'k-t-all' });
  var trailGjort = svgEl('path', { class: 'k-t-done' });
  var kobGruppe = svgEl('g', { class: 'k-koblinger' });
  lerretSvg.append(trailAlle, trailGjort, kobGruppe);
  var sel = h('div', { class: 'k-sel', html: '<div class="k-sel-boks"></div><i class="k-h" data-h="scale" style="left:0;top:0"></i><i class="k-h k-ne" data-h="scale" style="left:100%;top:0"></i><i class="k-h" data-h="scale" style="left:100%;top:100%"></i><i class="k-h k-sw" data-h="scale" style="left:0;top:100%"></i><i class="k-h" data-h="rot"></i>' });
  var hoverBoks = h('div', { class: 'k-hover' });
  var merker = h('div', { class: 'k-merker' });
  var guideX = h('div', { class: 'k-guide k-guide-x' }), guideY = h('div', { class: 'k-guide k-guide-y' });
  stage.append(bak, world, fram, merker, hoverBoks, sel);
  var fxCv = h('canvas', { class: 'k-fx' });
  var kuttEl = h('div', { class: 'k-kutt' });
  var lysEl = h('div', { class: 'k-fokuslys' });

  var ui = h('div', { class: 'k-ui' });
  root.append(sky, bgCv, stemA, stemB, stage, h('div', { class: 'k-grain' }), h('div', { class: 'k-vignett' }), fxCv, lysEl, kuttEl, ui);
  if (dataEl) dataEl.insertAdjacentElement('afterend', root); else document.body.append(root);
  verden.init(bgCv, fxCv);

  /* ---------- Rammer ---------- */

  function plasser(el, f) {
    el.style.transform = 'translate(' + f.x + 'px,' + f.y + 'px) rotate(' + f.r + 'deg) scale(' + f.s + ') translate(-50%,-50%)';
  }
  function blobRadius(id) {
    var r = rng(hash(id) + 17), v = function () { return Math.round(36 + r() * 28); };
    var a = v(), b = v(), c = v(), d = v();
    return a + '% ' + (100 - a) + '% ' + b + '% ' + (100 - b) + '% / ' + c + '% ' + d + '% ' + (100 - d) + '% ' + (100 - c) + '%';
  }
  function fyll(el, f) {
    var s = str(f), rs = rammeStil(f), inn = rammeInn(f);
    var var_aktiv = el.classList.contains('k-aktiv'), var_forhand = el.classList.contains('k-forhand');
    el.className = 'k-frame k-form-' + f.form + ' k-rs-' + rs + ' k-inn-' + inn +
      (var_aktiv ? ' k-aktiv' : '') + (var_forhand ? ' k-forhand' : '') + (f.id === maalId ? ' k-maal' : '') + (f.id === valgt ? ' k-valgt' : '');
    el.style.width = s[0] + 'px';
    el.style.height = s[1] + 'px';
    el.style.removeProperty('--a'); el.style.removeProperty('--lapp-bg'); el.style.removeProperty('--lapp-ink');
    if (f.farge) {
      if (rs === 'lapp') { el.style.setProperty('--lapp-bg', f.farge); el.style.setProperty('--lapp-ink', blekkPa(f.farge)); }
      else el.style.setProperty('--a', f.farge);
    }
    if (f.form === 'blob') el.style.setProperty('--blob', blobRadius(f.id)); else el.style.removeProperty('--blob');
    var html = '<div class="k-inner">' + md(f.tekst) + '</div>';
    if (rs === 'skisse' && f.form !== 'fri') {
      var r = rng(hash(f.id) + 5);
      var d = f.form === 'kort' ? grovRekt(r, s[0], s[1], 6) : grovEllipse(r, s[0] / 2, s[1] / 2, s[0] / 2 - 8, s[1] / 2 - 8, 1.1);
      html += '<svg class="k-skisse" viewBox="0 0 ' + s[0] + ' ' + s[1] + '" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="' + d + '"/></svg>';
    }
    el.innerHTML = html;
    el.classList.toggle('k-tom', !f.tekst.trim());
    el.classList.toggle('k-har-steg', !!f.steg);
    $$('.k-b', el).forEach(function (b, i) { b.style.setProperty('--i', i); });
    var ordvis = /^(ord|maske|fall)$/.test(inn), bokstavvis = /^(bokstav|skriv|dekode)$/.test(inn);
    if (ordvis || bokstavvis) $$('h1.k-b, h2.k-b', el).forEach(function (t) { delTittel(t, bokstavvis); });
    if (f.steg) $$('li, .k-fl-steg, .k-stolpe', el).forEach(function (x) { x.classList.add('k-steg'); });
    $$('img', el).forEach(function (img) { if (!img.complete) img.addEventListener('load', function () { tilpass(el); }, { once: true }); });
    if (el.isConnected) tilpass(el);
  }
  function tilpass(el) {
    var inner = el.firstElementChild;
    if (!inner || !el.isConnected) return;
    el.style.fontSize = '';
    var cs = getComputedStyle(el);
    var plass = el.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    var bredde = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    if (!(plass > 0)) return;
    function passer() { return inner.scrollHeight <= plass + 1 && inner.scrollWidth <= bredde + 1; }
    if (passer()) return;
    var base = parseFloat(cs.fontSize), lo = base * 0.28, hi = base;
    for (var i = 0; i < 8; i++) {
      var mid = (lo + hi) / 2;
      el.style.fontSize = mid + 'px';
      if (passer()) lo = mid; else hi = mid;
    }
    el.style.fontSize = lo + 'px';
  }
  function tilpassAlle() { Object.keys(els).forEach(function (k) { tilpass(els[k]); }); }
  function lagRamme(f) {
    var el = h('div', { 'data-id': f.id });
    fyll(el, f);
    plasser(el, f);
    return el;
  }

  function byggVerden() {
    world.textContent = '';
    world.append(lerretSvg, guideX, guideY);
    els = {};
    doc.rammer.slice().sort(function (a, b) { return areal(b) - areal(a); }).forEach(function (f) {
      var el = lagRamme(f);
      els[f.id] = el;
      world.append(el);
      tilpass(el);
    });
    byggPynt();
    tegnSti();
    tegnKoblinger();
    zRef = oversiktsVisning(true).z;
    verden.oppdaterBoks();
    if (aktivId && els[aktivId]) els[aktivId].classList.add('k-aktiv');
    root.classList.toggle('k-fokus', !!aktivId && !redigerer);
    visSteg();
    if (typeof byggMerker === 'function') byggMerker();
  }

  /* ---------- Pynt i parallakse-lag ---------- */

  function rensSvg(markup) {
    try {
      var d = new DOMParser().parseFromString('<svg xmlns="http://www.w3.org/2000/svg">' + markup + LUKK + 'svg>', 'image/svg+xml');
      var rot0 = d.documentElement;
      if (rot0.querySelector('parsererror')) return '';
      $$('script, foreignObject, iframe, use[href^="http"]', rot0).forEach(function (n) { n.remove(); });
      $$('*', rot0).forEach(function (n) {
        Array.prototype.slice.call(n.attributes).forEach(function (a) {
          if (/^on/i.test(a.name) || /javascript:/i.test(a.value)) n.removeAttribute(a.name);
        });
      });
      return rot0.innerHTML;
    } catch (e) { return ''; }
  }
  function byggPynt() {
    bak.textContent = ''; fram.textContent = '';
    lag = [];
    var grupper = {};
    doc.pynt.forEach(function (q) {
      var d = typeof q.dybde === 'number' ? clamp(q.dybde, 0.05, 3) : 0.6;
      var nokkel = d.toFixed(2);
      if (!grupper[nokkel]) {
        var div = h('div');
        (d > 1 ? fram : bak).append(div);
        grupper[nokkel] = { el: div, p: d };
        lag.push(grupper[nokkel]);
      }
      var type = q.type || (q.tekst ? 'tekst' : 'ring');
      var el = h('div', { class: 'k-pynt k-pynt-' + type + (q.snurr ? ' k-snurr' : '') + (q.svev ? ' k-svev' : '') });
      if (type === 'tekst') el.textContent = q.tekst || '';
      if (type === 'bilde' && q.src) el.append(h('img', { src: q.src, alt: '' }));
      if (type === 'svg' && q.svg) {
        var bw = q.w || 1000, bh = q.h || 1000;
        el.style.width = bw + 'px'; el.style.height = bh + 'px';
        el.innerHTML = '<svg viewBox="' + (q.viewBox || ('0 0 ' + bw + ' ' + bh)) + '" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="' + (q.strek || 6) + '" stroke-linecap="round" stroke-linejoin="round">' + rensSvg(q.svg) + LUKK + 'svg>';
      }
      if (q.farge) {
        el.style.color = q.farge; el.style.borderColor = q.farge;
        if (type === 'glod') el.style.background = 'radial-gradient(circle, ' + q.farge + ', transparent 62%)';
        if (type === 'prikk') el.style.background = q.farge;
      }
      el.style.opacity = q.opasitet != null ? q.opasitet : ({ tekst: 0.06, glod: 0.22, svg: 0.5, bilde: 1 }[type] || 0.18);
      el.style.transform = 'translate(' + (+q.x || 0) + 'px,' + (+q.y || 0) + 'px) rotate(' + (+q.r || 0) + 'deg) scale(' + (+q.s || 1) + ') translate(-50%,-50%)';
      grupper[nokkel].el.append(el);
    });
  }

  function inneholder(a, b) {
    if (!a || !b || areal(b) >= areal(a)) return false;
    var s = str(a), l = rot(b.x - a.x, b.y - a.y, -a.r);
    return Math.abs(l.x) <= s[0] * a.s / 2 && Math.abs(l.y) <= s[1] * a.s / 2;
  }
  function ytterste(f) {
    var best = f;
    doc.rammer.forEach(function (a) { if (a !== f && areal(a) > areal(best) && inneholder(a, f)) best = a; });
    return best;
  }
  function tilKant(f, ux, uy) {
    var s = str(f), a = s[0] * f.s / 2, b = s[1] * f.s / 2;
    if (f.form === 'sirkel' || f.form === 'blob') return Math.min(a, b);
    var l = rot(ux, uy, -f.r);
    return Math.min(Math.abs(l.x) > 1e-9 ? a / Math.abs(l.x) : Infinity, Math.abs(l.y) > 1e-9 ? b / Math.abs(l.y) : Infinity);
  }

  /* SVG-laget på lerretet dekker hele verdenen, så stier og koblinger kan klikkes */
  function plasserSvg() {
    var b = boks(doc.rammer) || { cx: 0, cy: 0, w: 4000, h: 3000 };
    var m = Math.max(b.w, b.h) * 0.6 + 2000;
    var x0 = b.cx - b.w / 2 - m, y0 = b.cy - b.h / 2 - m, w = b.w + 2 * m, hh = b.h + 2 * m;
    lerretSvg.setAttribute('viewBox', x0 + ' ' + y0 + ' ' + w + ' ' + hh);
    lerretSvg.style.left = x0 + 'px'; lerretSvg.style.top = y0 + 'px';
    lerretSvg.style.width = w + 'px'; lerretSvg.style.height = hh + 'px';
  }

  function tegnSti() {
    plasserSvg();
    var stiType = doc.stil.sti;
    lerretSvg.classList.toggle('k-sti-skjult', stiType === 'ingen');
    lerretSvg.classList.toggle('k-sti-prikker', stiType === 'prikker');
    var alle = '', gjort = '', forrige = null, side = 1;
    doc.sti.forEach(function (e, i) {
      var f0 = typeof e === 'string' ? ramme(e) : null;
      if (!f0) return;
      var f = ytterste(f0);
      if (forrige && forrige !== f) {
        var dx = f.x - forrige.x, dy = f.y - forrige.y, d = Math.hypot(dx, dy);
        var ux = dx / d, uy = dy / d;
        var t0 = tilKant(forrige, ux, uy) + 50 * forrige.s, t1 = tilKant(f, -ux, -uy) + 50 * f.s;
        if (t0 + t1 < d * 0.95) {
          var ax = forrige.x + ux * t0, ay = forrige.y + uy * t0, bx = f.x - ux * t1, by = f.y - uy * t1;
          var k = 0.18 * side; side = -side;
          var mx = (ax + bx) / 2, my = (ay + by) / 2;
          var seg = 'M' + ax.toFixed(1) + ' ' + ay.toFixed(1) + 'Q' + (mx - (by - ay) * k).toFixed(1) + ' ' + (my + (bx - ax) * k).toFixed(1) + ' ' + bx.toFixed(1) + ' ' + by.toFixed(1);
          alle += seg;
          if (i <= pos && !redigerer) gjort += seg;
        }
      }
      forrige = f;
    });
    trailAlle.setAttribute('d', alle);
    trailGjort.setAttribute('d', gjort);
  }

  /* Koblinger: håndtegnede piler mellom rammer – tegner seg selv når du kommer */
  function tegnKoblinger() {
    kobGruppe.textContent = '';
    doc.koblinger.forEach(function (k, i) {
      var a = ramme(k.fra), b = ramme(k.til);
      if (!a || !b) return;
      var dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d;
      var sk = Math.min(a.s, b.s);
      var t0 = tilKant(a, ux, uy) + 40 * a.s, t1 = tilKant(b, -ux, -uy) + 60 * b.s;
      if (t0 + t1 >= d) return;
      var ax = a.x + ux * t0, ay = a.y + uy * t0, bx = b.x - ux * t1, by = b.y - uy * t1;
      var bue = typeof k.bue === 'number' ? k.bue : 0.18;
      var cx = (ax + bx) / 2 - (by - ay) * bue, cy = (ay + by) / 2 + (bx - ax) * bue;
      var r = rng(hash(k.fra + k.til) + i);
      var j = sk * 10;
      var dd = 'M' + ax.toFixed(1) + ' ' + ay.toFixed(1) + 'Q' + (cx + (r() - 0.5) * j).toFixed(1) + ' ' + (cy + (r() - 0.5) * j).toFixed(1) + ' ' + bx.toFixed(1) + ' ' + by.toFixed(1);
      var g = svgEl('g', { class: 'k-kobling k-kob-' + (k.form || 'pil') + (i === valgtKobling ? ' k-valgt' : ''), 'data-i': i });
      g.style.setProperty('--sw', (6 * sk).toFixed(2));
      if (k.farge) g.style.setProperty('--kf', k.farge);
      g.append(svgEl('path', { class: 'k-kob-treff', d: dd, 'data-i': i }));
      g.append(svgEl('path', { class: 'k-kob-linje', d: dd, pathLength: 1 }));
      if ((k.form || 'pil') === 'pil') {
        var tx = bx - cx, ty = by - cy, tl = Math.hypot(tx, ty) || 1;
        tx /= tl; ty /= tl;
        var hl = 46 * sk, hb = 26 * sk;
        var p1x = bx - tx * hl - ty * hb, p1y = by - ty * hl + tx * hb, p2x = bx - tx * hl + ty * hb, p2y = by - ty * hl - tx * hb;
        g.append(svgEl('path', { class: 'k-kob-hode', d: 'M' + p1x.toFixed(1) + ' ' + p1y.toFixed(1) + 'L' + bx.toFixed(1) + ' ' + by.toFixed(1) + 'L' + p2x.toFixed(1) + ' ' + p2y.toFixed(1), pathLength: 1 }));
      }
      if (k.tekst) {
        var lx = 0.25 * ax + 0.5 * cx + 0.25 * bx, ly = 0.25 * ay + 0.5 * cy + 0.25 * by;
        var t = svgEl('text', { x: lx.toFixed(1), y: ly.toFixed(1), class: 'k-kob-tekst', 'text-anchor': 'middle', 'dominant-baseline': 'middle' });
        t.style.fontSize = (40 * sk).toFixed(1) + 'px';
        t.style.strokeWidth = (12 * sk).toFixed(1) + 'px';
        t.textContent = k.tekst;
        g.append(t);
      }
      kobGruppe.append(g);
    });
  }
  function tegnKoblingerFor(id) {
    if (redigerer) return;
    $$('.k-kobling', kobGruppe).forEach(function (g) {
      var k = doc.koblinger[+g.getAttribute('data-i')];
      if (!k || (k.til !== id && k.fra !== id)) return;
      g.classList.remove('k-tegn');
      void g.getBoundingClientRect();
      g.classList.add('k-tegn');
    });
  }

  /* ---------- Kamera ---------- */

  var PANEL = 372;
  function panelPa() { return redigerer && W > 720 && !root.classList.contains('k-panel-skjult'); }
  function iFelt(v) {
    if (!panelPa()) return v;
    var z = v.z * (W - PANEL) / W, d = rot(PANEL / 2 / z, 0, v.r);
    return { x: v.x + d.x, y: v.y + d.y, z: z, r: v.r };
  }
  function midtpunkt() { return tilVerden(panelPa() ? (W - PANEL) / 2 : W / 2, H / 2); }
  function rammeVisning(f) {
    var s = str(f), m = W < 700 ? 0.94 : 0.86;
    return iFelt({ x: f.x, y: f.y, z: Math.min(W * m / (s[0] * f.s), H * m / (s[1] * f.s)), r: f.r });
  }
  function boks(liste) {
    if (!liste.length) return null;
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    liste.forEach(function (f) {
      var s = str(f), hw = s[0] * f.s / 2, hh = s[1] * f.s / 2;
      [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].forEach(function (c) {
        var q = rot(c[0], c[1], f.r);
        x0 = Math.min(x0, f.x + q.x); x1 = Math.max(x1, f.x + q.x);
        y0 = Math.min(y0, f.y + q.y); y1 = Math.max(y1, f.y + q.y);
      });
    });
    return { cx: (x0 + x1) / 2, cy: (y0 + y1) / 2, w: x1 - x0, h: y1 - y0, x0: x0, y0: y0, x1: x1, y1: y1 };
  }
  function oversiktsVisning(raa) {
    var b = boks(doc.rammer);
    if (!b) return { x: 0, y: 0, z: 0.5, r: 0 };
    var m = W < 700 ? 0.92 : 0.82;
    var v = { x: b.cx, y: b.cy, z: Math.min(W * m / Math.max(b.w, 1), H * m / Math.max(b.h, 1)), r: 0 };
    return raa ? v : iFelt(v);
  }
  function visningFor(e) {
    if (typeof e === 'string') { var f = ramme(e); return f ? rammeVisning(f) : oversiktsVisning(); }
    if (!e) return oversiktsVisning();
    var b = e.b || 1600, hh = e.h || b * 9 / 16;
    return iFelt({ x: e.x, y: e.y, z: Math.min(W / b, H / hh), r: e.r || 0 });
  }

  var sisteTransform = '';
  function brukKamera() {
    var ox = W / 2 + po.x, oy = H / 2 + po.y;
    var t = 'translate(' + ox.toFixed(2) + 'px,' + oy.toFixed(2) + 'px) rotate(' + (-cam.r).toFixed(4) + 'deg) scale(' + cam.z + ') translate(' + (-cam.x) + 'px,' + (-cam.y) + 'px)';
    if (t === sisteTransform) return false;
    sisteTransform = t;
    world.style.transform = t;
    lerretSvg.style.setProperty('--iz', 1 / cam.z);
    for (var i = 0; i < lag.length; i++) {
      var L = lag[i];
      var zp = Math.pow(cam.z, L.p) * Math.pow(zRef, 1 - L.p);
      L.el.style.transform = 'translate(' + (W / 2 + po.x * L.p).toFixed(2) + 'px,' + (H / 2 + po.y * L.p).toFixed(2) + 'px) rotate(' + (-cam.r) + 'deg) scale(' + zp + ') translate(' + (-cam.x) + 'px,' + (-cam.y) + 'px)';
    }
    return true;
  }
  function tilSkjerm(x, y, c) {
    c = c || cam;
    var q = rot(x - c.x, y - c.y, -c.r);
    return { x: W / 2 + q.x * c.z, y: H / 2 + q.y * c.z };
  }
  function tilVerden(sx, sy, c) {
    c = c || cam;
    var q = rot((sx - W / 2) / c.z, (sy - H / 2) / c.z, c.r);
    return { x: c.x + q.x, y: c.y + q.y };
  }
  function skjermDelta(dx, dy, c) { c = c || cam; return rot(dx / c.z, dy / c.z, c.r); }
  function zoomVed(sx, sy, faktor) {
    var wp = tilVerden(sx, sy);
    cam.z = clamp(cam.z * faktor, 1e-4, 1e4);
    var q = rot((sx - W / 2) / cam.z, (sy - H / 2) / cam.z, cam.r);
    cam.x = wp.x - q.x; cam.y = wp.y - q.y;
  }

  /* ---------- Flytur: van Wijk & Nuij + overgangstyper ---------- */

  var EASE = {
    cubic: function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; },
    quart: function (t) { return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2; },
    quint: function (t) { return t < 0.5 ? 16 * Math.pow(t, 5) : 1 - Math.pow(-2 * t + 2, 5) / 2; },
    sine: function (t) { return -(Math.cos(Math.PI * t) - 1) / 2; },
    expo: function (t) { return t === 0 ? 0 : t === 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2; },
    back: function (t) { var c1 = 1.2, c2 = c1 * 1.525; return t < 0.5 ? (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2 : (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2; },
    ut: function (t) { return 1 - Math.pow(1 - t, 3); }
  };

  function flyTil(mal, valg) {
    valg = valg || {};
    var bev = aktivStil().b;
    var type = valg.type || 'fly';
    if (reduser && type !== 'kutt') type = 'fly';
    var fra = { x: cam.x, y: cam.y, z: cam.z, r: cam.r };
    var w0 = W / fra.z, w1 = W / mal.z;
    var dx = mal.x - fra.x, dy = mal.y - fra.y, d = Math.hypot(dx, dy);
    var rho = type === 'dykk' ? 0.75 : type === 'sveip' ? 1.05 : type === 'drift' ? 1.7 : bev.rho;
    var rho2 = rho * rho, rho4 = rho2 * rho2;
    var S, interp;
    if (d < 1e-6 * Math.max(w0, w1)) {
      var k = w1 < w0 ? -1 : 1;
      S = Math.abs(Math.log(w1 / w0)) / rho;
      interp = function (s) { return { u: 0, w: w0 * Math.exp(k * rho * s) }; };
    } else {
      var b0 = (w1 * w1 - w0 * w0 + rho4 * d * d) / (2 * w0 * rho2 * d);
      var b1 = (w1 * w1 - w0 * w0 - rho4 * d * d) / (2 * w1 * rho2 * d);
      var r0 = Math.log(Math.sqrt(b0 * b0 + 1) - b0);
      var r1 = Math.log(Math.sqrt(b1 * b1 + 1) - b1);
      S = (r1 - r0) / rho;
      var coshr0 = Math.cosh(r0), sinhr0 = Math.sinh(r0);
      interp = function (s) { return { u: w0 / (rho2 * d) * (coshr0 * Math.tanh(rho * s + r0) - sinhr0), w: w0 * coshr0 / Math.cosh(rho * s + r0) }; };
    }
    if (!isFinite(S)) { S = 1; interp = function (s) { return { u: s, w: w0 + (w1 - w0) * s }; }; }
    var fart = doc.fart * bev.fart * (type === 'sveip' ? 1.7 : type === 'drift' ? 0.62 : type === 'dykk' ? 1.1 : 1);
    var varighet = valg.varighet || clamp(380 + S * 480, 520, 3200) / fart;
    if (type === 'kutt') varighet = 620;
    if (reduser) varighet = Math.min(varighet, 260);
    var dr = vinkelDiff(fra.r, mal.r);
    if (type === 'spiral') dr += (dr >= 0 ? 1 : -1) * 360;
    var easeNavn = valg.ease || (type === 'sveip' ? 'expo' : type === 'drift' ? 'sine' : bev.ease);
    flight = {
      start: performance.now(), varighet: varighet, S: S, interp: interp, fra: fra, mal: mal, dx: dx, dy: dy,
      dr: dr, naer: valg.naer, ferdig: valg.ferdig, naerKjort: false, ease: EASE[easeNavn] || EASE.cubic, type: type, hopp: false
    };
    if (S < 1e-4 && type !== 'kutt') flight.varighet = Math.min(varighet, 520);
    parkert = null;
  }
  function stegFly(na) {
    var F = flight;
    var t = clamp((na - F.start) / F.varighet, 0, 1);
    if (F.type === 'kutt') {
      kuttEl.style.opacity = t < 0.4 ? t / 0.4 : Math.max(0, 1 - (t - 0.4) / 0.6);
      if (t >= 0.4 && !F.hopp) {
        F.hopp = true;
        cam.x = F.mal.x; cam.y = F.mal.y; cam.z = F.mal.z; cam.r = F.mal.r;
        if (!F.naerKjort) { F.naerKjort = true; if (F.naer) F.naer(); }
      }
    } else {
      var e = F.ease(t);
      if (t >= 1) { cam.x = F.mal.x; cam.y = F.mal.y; cam.z = F.mal.z; cam.r = F.mal.r; }
      else {
        var q = F.interp(e * F.S);
        cam.x = F.fra.x + q.u * F.dx; cam.y = F.fra.y + q.u * F.dy;
        cam.z = W / q.w; cam.r = F.fra.r + F.dr * e;
      }
      if (F.type === 'sveip') {
        var fart = Math.sin(t * Math.PI);
        stage.style.filter = fart > 0.05 ? 'blur(' + (fart * 5).toFixed(2) + 'px)' : '';
      }
      if (!F.naerKjort && t > 0.72) { F.naerKjort = true; if (F.naer) F.naer(); }
    }
    if (t >= 1) {
      flight = null;
      kuttEl.style.opacity = 0;
      stage.style.filter = '';
      cam.r = mod(cam.r + 180, 360) - 180;
      if (F.ferdig) F.ferdig();
    }
  }
  function stoppFly() {
    if (!flight) return;
    var F = flight; flight = null;
    kuttEl.style.opacity = 0;
    stage.style.filter = '';
    if (F.type === 'kutt' && !F.hopp) { cam.x = F.mal.x; cam.y = F.mal.y; cam.z = F.mal.z; cam.r = F.mal.r; }
    if (!F.naerKjort && F.naer) F.naer();
  }

  /* Levende kamera: når du står stille, puster bildet sakte */
  function parker(v) {
    if (redigerer || reduser || !doc.stil.pust) { parkert = null; return; }
    parkert = { t0: performance.now(), x: v.x, y: v.y, z: v.z, r: v.r };
  }
  function pust(na) {
    if (!parkert || flight || redigerer || friVisning || oversikt) return;
    var amp = aktivStil().b.pust;
    var t = (na - parkert.t0) / 1000;
    var inn = smooth(t / 10);
    var z = parkert.z * (1 + amp * (0.55 * inn + 0.45 * 0.5 * (1 - Math.cos(t * Math.PI * 2 / 17)) * inn));
    var sv = rot(Math.sin(t * Math.PI * 2 / 23) * amp * 0.5 * W / z, Math.sin(t * Math.PI * 2 / 29) * amp * 0.35 * H / z, parkert.r);
    cam.z = z; cam.x = parkert.x + sv.x * inn; cam.y = parkert.y + sv.y * inn;
    cam.r = parkert.r + Math.sin(t * Math.PI * 2 / 31) * amp * 6 * inn;
  }

  /* Musparallakse: lerretet ligger som bak et vindu */
  function oppdaterParallakse() {
    var mal = redigerer || reduser ? { x: 0, y: 0 } : poMal;
    po.x += (mal.x - po.x) * 0.06;
    po.y += (mal.y - po.y) * 0.06;
    if (Math.abs(po.x) < 0.01) po.x = 0;
    if (Math.abs(po.y) < 0.01) po.y = 0;
  }

  /* Stemning: bakgrunnen skifter farge med rammen du er i */
  var stemAktiv = stemA;
  function settStemning(farge) {
    var ny = stemAktiv === stemA ? stemB : stemA;
    if (farge) { ny.style.setProperty('--st', farge); ny.style.opacity = 1; } else ny.style.opacity = 0;
    stemAktiv.style.opacity = 0;
    stemAktiv = ny;
  }

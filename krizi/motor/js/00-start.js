/* ==========================================================================
   Krizi 2 – motor
   Kildefilene i motor/js/ settes sammen i alfabetisk rekkefølge av bygg.mjs
   til ett skript. Alle filene deler samme skop (én IIFE).
   Ingen fil kan inneholde teksten "<" + "/script".
   ========================================================================== */
(function () {
  'use strict';

  var VERSJON = '2.0';
  var STORRELSER = { kort: [1600, 900], sirkel: [1000, 1000], blob: [1250, 1000], fri: [1600, 900] };
  var reduser = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var LUKK = '<' + '/';
  var SVGNS = 'http://www.w3.org/2000/svg';

  /* ---------- Småhjelpere ---------- */

  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function h(tag, props) {
    var el = document.createElement(tag);
    if (props) {
      for (var k in props) {
        var v = props[k];
        if (v == null || v === false) continue;
        if (k === 'class') el.className = v;
        else if (k === 'html') el.innerHTML = v;
        else if (k === 'text') el.textContent = v;
        else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), v);
        else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
        else el.setAttribute(k, v === true ? '' : v);
      }
    }
    for (var i = 2; i < arguments.length; i++) leggTil(el, arguments[i]);
    return el;
  }
  function leggTil(el, kid) {
    if (kid == null || kid === false) return;
    if (Array.isArray(kid)) { kid.forEach(function (k) { leggTil(el, k); }); return; }
    el.append(kid.nodeType ? kid : document.createTextNode(String(kid)));
  }
  function svgEl(tag, attrs) {
    var el = document.createElementNS(SVGNS, tag);
    for (var k in attrs || {}) el.setAttribute(k, attrs[k]);
    return el;
  }
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function uid() { return 'r' + Math.random().toString(36).slice(2, 8); }
  function rad(d) { return d * Math.PI / 180; }
  function rot(x, y, deg) { var a = rad(deg), c = Math.cos(a), s = Math.sin(a); return { x: x * c - y * s, y: x * s + y * c }; }
  function frac(v) { return v - Math.floor(v); }
  function mod(v, m) { return ((v % m) + m) % m; }
  function vinkelDiff(a, b) { return mod(b - a + 180, 360) - 180; }
  function smooth(t) { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); }
  function hash(s) {
    s = String(s);
    var x = 2166136261;
    for (var i = 0; i < s.length; i++) { x ^= s.charCodeAt(i); x = Math.imul(x, 16777619); }
    return x >>> 0;
  }
  // Seedet tilfeldighet (mulberry32) – samme seed gir samme verden
  function rng(seed) {
    var a = (seed >>> 0) || 1;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function trekk(r, liste) { return liste[Math.floor(r() * liste.length) % liste.length]; }

  var lager = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); return true; } catch (e) { return false; } },
    del: function (k) { try { localStorage.removeItem(k); } catch (e) { /* ingen lagring */ } }
  };

  /* Farger */
  var fargeCache = {};
  function hexTilRgb(hex) {
    if (fargeCache[hex]) return fargeCache[hex];
    var m = String(hex || '').trim().replace('#', '');
    if (m.length === 3) m = m.split('').map(function (c) { return c + c; }).join('');
    var n = parseInt(m.slice(0, 6), 16);
    var rgb = isFinite(n) ? [(n >> 16) & 255, (n >> 8) & 255, n & 255] : [128, 128, 128];
    fargeCache[hex] = rgb;
    return rgb;
  }
  function rgba(hex, a) { var c = hexTilRgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + (+a).toFixed(3) + ')'; }
  function lyshet(hex) {
    var c = hexTilRgb(hex).map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  }
  function blekkPa(hex) { return lyshet(hex) > 0.42 ? '#111318' : '#ffffff'; }

  /* Ikoner (24×24, strek) */
  var IKON = {
    play: '<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>',
    edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M13.5 6.5l4 4"/>',
    pluss: '<path d="M12 5v14M5 12h14"/>',
    bilde: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="9" cy="10" r="1.8"/><path d="M21 16l-5-5-9 8"/>',
    angre: '<path d="M9 14L4 9l5-5"/><path d="M4 9h10a6 6 0 010 12h-3"/>',
    gjor: '<path d="M15 14l5-5-5-5"/><path d="M20 9H10a6 6 0 000 12h3"/>',
    oversikt: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
    lagre: '<path d="M5 3h11l3 3v15H5z"/><path d="M8 3v6h8V3M8 21v-7h8v7"/>',
    venstre: '<path d="M15 5l-7 7 7 7"/>',
    hoyre: '<path d="M9 5l7 7-7 7"/>',
    opp: '<path d="M6 15l6-6 6 6"/>',
    ned: '<path d="M6 9l6 6 6-6"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    fullskjerm: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    skjerm: '<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>',
    hjelp: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 114 2c-1 .7-1.5 1.2-1.5 2.5M12 17h.01"/>',
    kopi: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/>',
    slett: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>',
    sikt: '<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
    sti: '<circle cx="5" cy="18" r="2"/><circle cx="19" cy="6" r="2"/><path d="M7 17c6-1 4-9 10-10"/>',
    hjem: '<path d="M4 11l8-7 8 7M6 9.5V20h12V9.5"/>',
    terning: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="9" cy="9" r="1.3" fill="currentColor"/><circle cx="15" cy="15" r="1.3" fill="currentColor"/><circle cx="15" cy="9" r="1.3" fill="currentColor"/><circle cx="9" cy="15" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/>',
    magi: '<path d="M11 3l1.8 4.6L17.4 9.5l-4.6 1.9L11 16l-1.8-4.6L4.6 9.5l4.6-1.9z"/><path d="M18.5 14.5l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8z"/>',
    form: '<circle cx="8.5" cy="8.5" r="4.5"/><rect x="11.5" y="11.5" width="9" height="9" rx="2"/>',
    palett: '<path d="M12 3a9 9 0 100 18c1.2 0 1.8-.9 1.4-1.9-.5-1.1.2-2.1 1.4-2.1H17a4 4 0 004-4c0-5.5-4-10-9-10z"/><circle cx="7.5" cy="11" r="1.2" fill="currentColor"/><circle cx="10" cy="7" r="1.2" fill="currentColor"/><circle cx="15" cy="7.5" r="1.2" fill="currentColor"/>',
    farge: '<path d="M12 3.5c3.5 4.2 6 7.4 6 10.5a6 6 0 01-12 0c0-3.1 2.5-6.3 6-10.5z"/>',
    ramme: '<rect x="4" y="5" width="16" height="14" rx="2"/><path d="M4 9h16"/>',
    overgang: '<path d="M5 18A9 9 0 0118 7"/><path d="M14 6h4.5v4.5"/>',
    steg: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r="1.2" fill="currentColor"/><circle cx="4.5" cy="12" r="1.2" fill="currentColor"/><circle cx="4.5" cy="18" r="1.2" fill="currentColor"/>',
    lenke: '<path d="M10 14a4 4 0 005.6 0l3-3a4 4 0 00-5.6-5.6l-1 1"/><path d="M14 10a4 4 0 00-5.6 0l-3 3a4 4 0 005.6 5.6l1-1"/>',
    mer: '<circle cx="5" cy="12" r="1.4" fill="currentColor"/><circle cx="12" cy="12" r="1.4" fill="currentColor"/><circle cx="19" cy="12" r="1.4" fill="currentColor"/>',
    lys: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M5 19l1.5-1.5M17.5 6.5L19 5"/>',
    panel: '<rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M15 4v16"/>',
    detalj: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4.5-4.5M11 8.5v5M8.5 11h5"/>',
    tekst: '<path d="M5 6h14M12 6v13M9 19h6"/>',
    notat: '<path d="M5 4h14v12l-4 4H5z"/><path d="M15 20v-4h4M8 9h8M8 13h5"/>'
  };
  function ikon(navn) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (IKON[navn] || '') + '</svg>';
  }
  function knapp(navn, tekst, onclick, ekstra) {
    var b = h('button', Object.assign({ class: 'k-btn', type: 'button', title: tekst, 'aria-label': tekst, onclick: onclick }, ekstra || {}));
    b.innerHTML = ikon(navn) + '<span class="k-tekst">' + esc(tekst) + '</span>';
    return b;
  }
  function ikonKnapp(navn, tekst, onclick, ekstra) {
    var b = knapp(navn, tekst, onclick, ekstra);
    b.classList.add('k-ikon-knapp');
    b.querySelector('.k-tekst').remove();
    return b;
  }

  /* Håndtegnede streker: små ujevnheter gjør at det ser tegnet ut, ikke konstruert */
  function grovLinje(r, x0, y0, x1, y1, ujevn) {
    var dx = x1 - x0, dy = y1 - y0, l = Math.hypot(dx, dy) || 1;
    var nx = -dy / l, ny = dx / l, j = ujevn * l;
    var a = (r() - 0.5) * j, b = (r() - 0.5) * j;
    return 'M' + (x0 + (r() - 0.5) * j * 0.3).toFixed(1) + ' ' + (y0 + (r() - 0.5) * j * 0.3).toFixed(1) +
      'C' + (x0 + dx * 0.33 + nx * a).toFixed(1) + ' ' + (y0 + dy * 0.33 + ny * a).toFixed(1) + ' ' +
      (x0 + dx * 0.66 + nx * b).toFixed(1) + ' ' + (y0 + dy * 0.66 + ny * b).toFixed(1) + ' ' +
      (x1 + (r() - 0.5) * j * 0.3).toFixed(1) + ' ' + (y1 + (r() - 0.5) * j * 0.3).toFixed(1);
  }
  function grovRekt(r, w, hh, inn) {
    var d = '';
    for (var pass = 0; pass < 2; pass++) {
      var o = inn + pass * 7;
      d += grovLinje(r, o, o + 6, w - o, o, 0.024) + grovLinje(r, w - o - 4, o, w - o, hh - o, 0.03) +
        grovLinje(r, w - o, hh - o - 3, o, hh - o, 0.024) + grovLinje(r, o + 3, hh - o, o, o, 0.03);
    }
    return d;
  }
  function grovEllipse(r, cx, cy, rx, ry, runder) {
    var d = '', n = 28, start = r() * Math.PI * 2;
    for (var p = 0; p < (runder || 2); p++) {
      for (var i = 0; i <= n + 3; i++) {
        var a = start + i / n * Math.PI * 2;
        var k = 1 + (r() - 0.5) * 0.035 + p * 0.012;
        var x = cx + Math.cos(a) * rx * k, y = cy + Math.sin(a) * ry * k;
        d += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ' ' + y.toFixed(1);
      }
    }
    return d;
  }

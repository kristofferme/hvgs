/* Fiske og fangst Vg2 – kjerne: navnerom, hjelpere, lagring og tale. */
"use strict";

var FF = window.FF = {
  moduler: [],
  fig: {},
  verktoy: {},
  ord: [],
  bilder: window.FF_BILDER || {},
  versjon: "2026.09"
};

/* ---------- Små hjelpere ---------- */

FF.$ = function (sel, rot) { return (rot || document).querySelector(sel); };
FF.$$ = function (sel, rot) { return Array.prototype.slice.call((rot || document).querySelectorAll(sel)); };

FF.esc = function (s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

var _uid = 0;
FF.uid = function (p) { _uid += 1; return (p || "u") + _uid; };

FF.bland = function (liste) {
  var a = liste.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
};

FF.tall = function (x, des) {
  var d = des == null ? 0 : des;
  return Number(x).toLocaleString("nb-NO", { minimumFractionDigits: d, maximumFractionDigits: d });
};

FF.kr = function (x) { return FF.tall(Math.round(x)) + " kr"; };

FF.melding = function (tekst) {
  var el = FF.$(".melding");
  if (!el) {
    el = document.createElement("div");
    el.className = "melding";
    el.setAttribute("role", "status");
    document.body.appendChild(el);
  }
  el.textContent = tekst;
  el.classList.add("vis");
  clearTimeout(FF._meldingTid);
  FF._meldingTid = setTimeout(function () { el.classList.remove("vis"); }, 2400);
};

FF.kopier = function (tekst, knapp) {
  function ok() { FF.melding("Kopiert. Lim inn i Teams, OneNote eller e-post."); }
  function reserve() {
    var t = document.createElement("textarea");
    t.value = tekst;
    t.setAttribute("readonly", "");
    t.style.position = "fixed"; t.style.opacity = "0";
    document.body.appendChild(t);
    t.select();
    try { document.execCommand("copy"); ok(); } catch (e) { FF.melding("Merk teksten og kopier den selv."); }
    document.body.removeChild(t);
  }
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(tekst).then(ok, reserve);
    } else { reserve(); }
  } catch (e) { reserve(); }
};

/* ---------- Lagring (bare i denne nettleseren) ---------- */

FF.NOKKEL = "ff-vg2-v1";
FF.tilstand = (function () {
  var tom = { ferdig: {}, quiz: {}, kanjeg: {}, sjekk: {}, logg: [], sett: {} };
  try {
    var raa = window.localStorage.getItem(FF.NOKKEL);
    if (!raa) return tom;
    var t = JSON.parse(raa);
    Object.keys(tom).forEach(function (k) { if (t[k] == null) t[k] = tom[k]; });
    return t;
  } catch (e) { return tom; }
})();

FF.lagre = function () {
  try { window.localStorage.setItem(FF.NOKKEL, JSON.stringify(FF.tilstand)); } catch (e) { /* privat vindu – greit */ }
};

FF.nullstill = function () {
  FF.tilstand = { ferdig: {}, quiz: {}, kanjeg: {}, sjekk: {}, logg: [], sett: {} };
  FF.lagre();
};

/* ---------- Tema: Dag / Natt ---------- */

FF.tema = {
  hent: function () {
    try { return window.localStorage.getItem("ff-tema"); } catch (e) { return null; }
  },
  sett: function (v) {
    var rot = document.documentElement;
    if (v) rot.setAttribute("data-theme", v); else rot.removeAttribute("data-theme");
    try { if (v) window.localStorage.setItem("ff-tema", v); else window.localStorage.removeItem("ff-tema"); } catch (e) {}
    FF.tema.oppdaterKnapp();
  },
  erMork: function () {
    var v = document.documentElement.getAttribute("data-theme");
    if (v) return v === "dark";
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  },
  bytt: function () { FF.tema.sett(FF.tema.erMork() ? "light" : "dark"); },
  oppdaterKnapp: function () {
    var k = FF.$(".tema-knapp");
    if (!k) return;
    var mork = FF.tema.erMork();
    k.setAttribute("aria-pressed", mork ? "true" : "false");
    k.querySelector(".tema-tekst").textContent = mork ? "Natt" : "Dag";
    k.setAttribute("title", mork ? "Bytt til dagpalett" : "Bytt til nattpalett (bro om natta)");
  }
};

/* ---------- Les høyt ---------- */

FF.tale = {
  kan: typeof window.speechSynthesis !== "undefined" && typeof window.SpeechSynthesisUtterance !== "undefined",
  aktiv: false,
  stemme: function () {
    if (!FF.tale.kan) return null;
    var alle = window.speechSynthesis.getVoices() || [];
    return alle.filter(function (v) { return /^(nb|no|nn)/i.test(v.lang); })[0] || null;
  },
  stopp: function () {
    FF.tale.aktiv = false;
    if (FF.tale.kan) window.speechSynthesis.cancel();
    FF.$$(".leses").forEach(function (e) { e.classList.remove("leses"); });
    FF.$$(".les-knapp").forEach(function (k) { k.setAttribute("aria-pressed", "false"); });
  },
  // Leser elementene etter tur og markerer det som leses.
  les: function (elementer, knapp) {
    if (!FF.tale.kan) { FF.melding("Nettleseren din kan ikke lese høyt. Prøv Edge eller Chrome."); return; }
    if (FF.tale.aktiv) { FF.tale.stopp(); return; }
    FF.tale.aktiv = true;
    if (knapp) knapp.setAttribute("aria-pressed", "true");
    var i = 0;
    var stemme = FF.tale.stemme();
    function neste() {
      FF.$$(".leses").forEach(function (e) { e.classList.remove("leses"); });
      if (!FF.tale.aktiv || i >= elementer.length) { FF.tale.stopp(); return; }
      var el = elementer[i++];
      var tekst = (el.innerText || el.textContent || "").replace(/\s+/g, " ").trim();
      if (!tekst) { neste(); return; }
      el.classList.add("leses");
      if (el.getBoundingClientRect().top > window.innerHeight * 0.8 || el.getBoundingClientRect().top < 60) {
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      var u = new SpeechSynthesisUtterance(tekst);
      u.lang = stemme ? stemme.lang : "nb-NO";
      if (stemme) u.voice = stemme;
      u.rate = 0.95;
      u.onend = neste;
      u.onerror = function () { FF.tale.stopp(); };
      window.speechSynthesis.speak(u);
    }
    neste();
  }
};
if (FF.tale.kan) { try { window.speechSynthesis.getVoices(); } catch (e) {} }

/* ---------- SVG-hjelpere til figurene ---------- */

FF.svg = {
  // Etikett med hjelpelinje: prikk på delen, strek ut, tekst.
  merke: function (x, y, tx, ty, tekst, anker, klasse) {
    var a = anker || (tx < x ? "end" : "start");
    var dx = a === "end" ? -6 : a === "start" ? 6 : 0;
    return '<g class="' + (klasse || "") + '">' +
      '<line x1="' + x + '" y1="' + y + '" x2="' + tx + '" y2="' + ty + '" stroke="var(--blekk)" stroke-width="1"/>' +
      '<circle cx="' + x + '" cy="' + y + '" r="3" fill="var(--flate)" stroke="var(--blekk)" stroke-width="1.5"/>' +
      '<text x="' + (tx + dx) + '" y="' + (ty + 4) + '" text-anchor="' + a + '" class="t-liten">' + tekst + "</text></g>";
  },
  tekst: function (x, y, t, klasse, anker) {
    return '<text x="' + x + '" y="' + y + '" class="' + (klasse || "t-liten") + '"' +
      (anker ? ' text-anchor="' + anker + '"' : "") + ">" + t + "</text>";
  },
  // Rolige bølgelinjer for havoverflaten
  sjolinje: function (x0, x1, y, amp, bolge, stil) {
    var d = "M" + x0 + " " + y;
    for (var x = x0; x < x1; x += bolge) {
      d += " q" + (bolge / 4) + " " + (-amp) + " " + (bolge / 2) + " 0 t" + (bolge / 2) + " 0";
    }
    return '<path d="' + d + '" fill="none" ' + (stil || 'stroke="var(--skrog)" stroke-width="1.5"') + "/>";
  },
  pil: function (id, farge) {
    return '<marker id="' + id + '" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">' +
      '<path d="M0 0 L10 5 L0 10 z" fill="' + (farge || "var(--blekk)") + '"/></marker>';
  }
};

/* Dybdekurver – dekor i sidetoppen, tegnet som stiplede kotelinjer. */
FF.dybdekurver = function (frø) {
  var s = frø || 3;
  function rnd() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
  var linjer = "";
  for (var k = 0; k < 6; k++) {
    var y = 40 + k * 46 + rnd() * 20;
    var d = "M-20 " + y.toFixed(1);
    for (var x = 0; x <= 1500; x += 150) {
      var yy = y + Math.sin((x / 260) + k + rnd()) * (18 + k * 3) + (rnd() - 0.5) * 16;
      d += " S" + (x + 75) + " " + (yy + 10).toFixed(1) + " " + (x + 150) + " " + yy.toFixed(1);
    }
    var dybde = [2, 5, 10, 20, 30, 50][k];
    linjer += '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="' + (k % 2 ? "6 5" : "14 4 2 4") + '"/>';
    linjer += '<text x="' + (1180 - k * 70) + '" y="' + (y + 4).toFixed(0) + '" fill="currentColor" style="font:500 11px var(--f-mono)">' + dybde + "</text>";
  }
  return '<svg class="dybdekurver" viewBox="0 0 1400 320" preserveAspectRatio="xMidYMid slice" aria-hidden="true">' + linjer + "</svg>";
};

/* Ikoner (strek, 24-rute) */
FF.ikon = {
  sol: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M5.3 5.3l1.7 1.7M17 17l1.7 1.7M5.3 18.7 7 17M17 7l1.7-1.7"/></svg>',
  maane: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5z"/></svg>',
  meny: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  hoyttaler: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11"/></svg>',
  hake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M4.5 12.5l5 5 10-11"/></svg>',
  fare: '<svg viewBox="0 0 24 24"><path d="M12 2.8 22.4 20.8H1.6z" fill="#f4c20d" stroke="#111" stroke-width="1.6" stroke-linejoin="round"/><path d="M12 9v5.5" stroke="#111" stroke-width="2.2" stroke-linecap="round"/><circle cx="12" cy="17.4" r="1.3" fill="#111"/></svg>',
  paragraf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M15.5 5.5c-.6-1.5-2-2.3-3.7-2.3-2.2 0-3.8 1.3-3.8 3 0 3.8 8 3 8 7.2 0 1.3-.8 2.3-2 2.8M8.5 18.5c.6 1.5 2 2.3 3.7 2.3 2.2 0 3.8-1.3 3.8-3 0-3.8-8-3-8-7.2 0-1.3.8-2.3 2-2.8"/></svg>',
  hanske: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M7 21v-4.5L4.2 12.8a1.6 1.6 0 0 1 2.4-2.1L8 12V4.8a1.4 1.4 0 0 1 2.8 0V11V3.6a1.4 1.4 0 0 1 2.8 0V11V4.5a1.4 1.4 0 0 1 2.8 0V11.5V7a1.4 1.4 0 0 1 2.8 0v7.3c0 3-1.6 4.5-3 5.3V21"/></svg>',
  anker: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="5" r="2"/><path d="M12 7v14M8 10.5h8M4 13.5c.5 4.5 4 7.5 8 7.5s7.5-3 8-7.5M4 13.5l-1.5 1.8M4 13.5l2 1.2M20 13.5l1.5 1.8M20 13.5l-2 1.2"/></svg>',
  lokal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/></svg>',
  sporsmal: '<svg viewBox="0 0 40 40" fill="none" stroke="currentColor" stroke-width="2"><circle cx="20" cy="20" r="17"/><path d="M15 15.5c0-3 2.3-5 5.2-5 2.8 0 5 1.9 5 4.6 0 3.8-5 4.2-5 8.2"/><circle cx="20.2" cy="28.6" r="1.4" fill="currentColor" stroke="none"/></svg>',
  kopier: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="8" y="8" width="12" height="13" rx="1.5"/><path d="M16 8V4.5A1.5 1.5 0 0 0 14.5 3h-9A1.5 1.5 0 0 0 4 4.5v11A1.5 1.5 0 0 0 5.5 17H8"/></svg>',
  // Sjøkartets symbol for fiskeplass – brukt som merke
  fiskeplass: '<svg viewBox="0 0 34 22" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"><path d="M2 11c5-7 13-8.5 20-4l7-5v18l-7-5c-7 4.5-15 3-20-4z"/><circle cx="8.5" cy="9.6" r="1.2" fill="currentColor" stroke="none"/></svg>'
};

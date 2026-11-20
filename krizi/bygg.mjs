#!/usr/bin/env node
// Krizi – bygger presentasjoner til én selvstendig HTML-fil.
//
//   node krizi/bygg.mjs min-presentasjon.json          → krizi/presentasjoner/min-presentasjon.html
//   node krizi/bygg.mjs inn.json ut.html                → ut.html
//   node krizi/bygg.mjs krizi/presentasjoner/x.html     → ny motor i fila (innholdet beholdes)
//   node krizi/bygg.mjs --alle                          → ny motor i alle filer i krizi/presentasjoner/
//   node krizi/bygg.mjs --json krizi/presentasjoner/x.html → skriver ut innholdet som JSON
//   node krizi/bygg.mjs --ny "Tittel" [stil]            → lager en ny, nesten tom presentasjon

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const MAPPE = path.join(DIR, 'presentasjoner');

// Gyldige verdier (speiler motor/js/01-stil.js)
const GYLDIG = {
  form: ['kort', 'sirkel', 'blob', 'fri'],
  ramme: ['glass', 'solid', 'papir', 'linje', 'skisse', 'neon', 'lapp', 'ingen'],
  inn: ['ord', 'bokstav', 'maske', 'skriv', 'dekode', 'blur', 'zoom', 'sveip', 'fall', 'ingen'],
  overgang: ['fly', 'dykk', 'sveip', 'spiral', 'kutt', 'drift'],
  verden: ['nordlys', 'stjerner', 'rutenett', 'prikker', 'topografi', 'hav', 'konstellasjon', 'bokeh', 'kritt', 'blekk', 'papir', 'ingen'],
  palett: ['nordlys', 'fjord', 'kritt', 'glod', 'blakopi', 'riso', 'neon', 'skog', 'dyphav', 'sand', 'is', 'kosmos', 'lava', 'pop', 'lavendel', 'grafitt'],
  skrift: ['klassisk', 'moderne', 'hand', 'redaksjon', 'plakat', 'geometrisk', 'teknisk', 'eventyr', 'bred', 'elegant', 'leken', 'tusj'],
  bevegelse: ['myk', 'filmatisk', 'sprett', 'rask', 'drom'],
  sti: ['linje', 'prikker', 'ingen'],
  mal: ['nordlys', 'fjord', 'tavle', 'glød', 'blåkopi', 'riso', 'neon', 'skog', 'dyphav', 'kosmos', 'pop', 'is', 'akvarell', 'lava', 'lavendel', 'grafitt']
};
const SIZES = { kort: [1600, 900], sirkel: [1000, 1000], blob: [1250, 1000], fri: [1600, 900] };

function lesMotor() {
  const les = (mappe, ending) => fs.readdirSync(path.join(DIR, mappe)).filter((f) => f.endsWith(ending)).sort()
    .map((f) => fs.readFileSync(path.join(DIR, mappe, f), 'utf8')).join('\n');
  const js = les('motor/js', '.js');
  const css = les('motor/css', '.css');
  if (/<\/script/i.test(js)) throw new Error('motor/js inneholder "</script" – det knekker HTML-fila.');
  if (/<\/style/i.test(css)) throw new Error('motor/css inneholder "</style".');
  return { js, css };
}

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const slug = (s) => String(s).toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'presentasjon';

function hentData(html) {
  const m = html.match(/<script type="application\/json" id="krizi-data">([\s\S]*?)<\/script>/);
  if (!m) throw new Error('Fant ikke <script id="krizi-data"> i fila.');
  return JSON.parse(m[1]);
}

function sjekk(doc) {
  const adv = [];
  const sjekkVerdi = (felt, v, hvor) => { if (v != null && !GYLDIG[felt].includes(String(v).toLowerCase())) adv.push(`${hvor}: ukjent ${felt} "${v}" (gyldige: ${GYLDIG[felt].join(', ')})`); };
  if (!doc.tittel) adv.push('mangler "tittel"');
  if (typeof doc.stil === 'string') sjekkVerdi('mal', doc.stil, 'stil');
  else if (doc.stil && typeof doc.stil === 'object') {
    for (const k of ['palett', 'skrift', 'verden', 'ramme', 'bevegelse', 'inn', 'overgang', 'sti', 'mal']) sjekkVerdi(k, doc.stil[k], 'stil');
  }
  const ids = new Set();
  for (const f of doc.rammer || []) {
    if (!f.id) adv.push('en ramme mangler "id"');
    else if (ids.has(f.id)) adv.push(`ramme-id "${f.id}" er brukt flere ganger`);
    ids.add(f.id);
    sjekkVerdi('form', f.form, `ramme "${f.id}"`);
    sjekkVerdi('ramme', f.stil, `ramme "${f.id}" (stil)`);
    sjekkVerdi('inn', f.inn, `ramme "${f.id}"`);
    sjekkVerdi('overgang', f.overgang, `ramme "${f.id}"`);
    if (typeof f.tekst !== 'string') adv.push(`ramme "${f.id}": mangler "tekst"`);
    else {
      const ord = f.tekst.replace(/[#>!:\-|*_=~(){}]/g, ' ').split(/\s+/).filter(Boolean).length;
      if (ord > 45) adv.push(`ramme "${f.id}": ${ord} ord – mye tekst, vurder å dele opp`);
    }
  }
  for (const e of doc.sti || []) if (typeof e === 'string' && !ids.has(e)) adv.push(`stien peker på ukjent ramme "${e}"`);
  for (const k of doc.koblinger || []) if (!ids.has(k.fra) || !ids.has(k.til)) adv.push(`kobling ${k.fra} → ${k.til} peker på ukjent ramme`);

  // Rammer som overlapper uten at den ene ligger inni den andre, ser rotete ut.
  const rammer = doc.rammer || [];
  const boks = (f) => {
    const b = SIZES[f.form] || SIZES.kort;
    const w = (f.w || b[0]) * (f.s || 1), h = (f.h || b[1]) * (f.s || 1);
    const a = ((f.r || 0) * Math.PI) / 180, c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a));
    const bw = w * c + h * s, bh = w * s + h * c;
    return { x0: f.x - bw / 2, x1: f.x + bw / 2, y0: f.y - bh / 2, y1: f.y + bh / 2, a: w * h, w, h };
  };
  const inni = (A, a, fb, B) => B.a < A.a && Math.abs(fb.x - a.x) <= A.w / 2 && Math.abs(fb.y - a.y) <= A.h / 2;
  for (let i = 0; i < rammer.length; i++) {
    for (let j = i + 1; j < rammer.length; j++) {
      const A = boks(rammer[i]), B = boks(rammer[j]);
      const ox = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0), oy = Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0);
      if (ox <= 0 || oy <= 0) continue;
      const fa = rammer[i], fb = rammer[j];
      if (inni(A, fa, fb, B) || inni(B, fb, fa, A)) continue;
      if ((ox * oy) / Math.min(A.a, B.a) > 0.04) adv.push(`rammene "${fa.id}" og "${fb.id}" overlapper`);
    }
  }
  if (!doc.id) doc.id = 'k' + Math.random().toString(36).slice(2, 12);
  return adv;
}

export function lagHTML(doc) {
  const { js, css } = lesMotor();
  const json = JSON.stringify(doc, null, 1).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="no">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(doc.tittel || 'Krizi')}</title>
<meta name="generator" content="Krizi 2">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<style id="krizi-style">${css}</style>
</head>
<body>
<script type="application/json" id="krizi-data">
${json}
</script>
<script id="krizi-engine">${js}</script>
</body>
</html>
`;
}

function skriv(doc, ut) {
  const adv = sjekk(doc);
  adv.forEach((a) => console.warn('  ⚠ ' + a));
  fs.mkdirSync(path.dirname(ut), { recursive: true });
  fs.writeFileSync(ut, lagHTML(doc));
  const kb = (fs.statSync(ut).size / 1024).toFixed(0);
  console.log(`✓ ${path.relative(process.cwd(), ut)}  (${(doc.rammer || []).length} rammer, ${(doc.sti || []).length} steg, ${kb} kB)`);
}

const args = process.argv.slice(2);
if (!args.length) {
  console.log(fs.readFileSync(fileURLToPath(import.meta.url), 'utf8').split('\n').slice(1, 10).join('\n').replace(/^\/\/ ?/gm, ''));
  process.exit(0);
}

if (args[0] === '--json') {
  process.stdout.write(JSON.stringify(hentData(fs.readFileSync(args[1], 'utf8')), null, 2) + '\n');
} else if (args[0] === '--alle') {
  for (const f of fs.readdirSync(MAPPE).filter((f) => f.endsWith('.html'))) {
    const p = path.join(MAPPE, f);
    skriv(hentData(fs.readFileSync(p, 'utf8')), p);
  }
} else if (args[0] === '--ny') {
  const tittel = args[1] || 'Ny presentasjon';
  const doc = {
    tittel,
    stil: args[2] || 'Nordlys',
    rammer: [{ id: 'start', form: 'kort', x: 0, y: 0, s: 1, r: 0, tekst: `### Krizi\n# ${tittel}\nTrykk **E** for å redigere. Dobbeltklikk tekst for å skrive, og trykk **Legg til** nederst for nye rammer.` }],
    sti: ['start']
  };
  skriv(doc, args[3] || path.join(MAPPE, slug(tittel) + '.html'));
} else {
  const inn = args[0];
  const tekst = fs.readFileSync(inn, 'utf8');
  const doc = inn.endsWith('.html') ? hentData(tekst) : JSON.parse(tekst);
  const ut = args[1] || (inn.endsWith('.html') ? inn : path.join(MAPPE, slug(path.basename(inn, '.json')) + '.html'));
  skriv(doc, ut);
}

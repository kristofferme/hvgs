#!/usr/bin/env node
// Krizi – bygger presentasjoner til én selvstendig HTML-fil.
//
//   node krizi/bygg.mjs min-presentasjon.json          → krizi/presentasjoner/min-presentasjon.html
//   node krizi/bygg.mjs inn.json ut.html                → ut.html
//   node krizi/bygg.mjs krizi/presentasjoner/x.html     → oppgraderer motoren i fila (innholdet beholdes)
//   node krizi/bygg.mjs --alle                          → oppgraderer alle filer i krizi/presentasjoner/
//   node krizi/bygg.mjs --json krizi/presentasjoner/x.html → skriver ut innholdet som JSON
//   node krizi/bygg.mjs --ny "Tittel"                   → lager en tom presentasjon

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = path.dirname(fileURLToPath(import.meta.url));
const MAPPE = path.join(DIR, 'presentasjoner');
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400..800&family=Caveat:wght@500..700&family=Fraunces:ital,opsz,wght@0,9..144,300..800;1,9..144,300..800&family=Manrope:wght@400..800&display=swap';
const SIZES = { kort: [1600, 900], sirkel: [1000, 1000], fri: [1600, 900] };
const TEMAER = ['aurora', 'fjord', 'kritt', 'glod'];

const css = fs.readFileSync(path.join(DIR, 'motor/krizi.css'), 'utf8');
const js = fs.readFileSync(path.join(DIR, 'motor/krizi.js'), 'utf8');
if (/<\/script/i.test(js)) throw new Error('motor/krizi.js inneholder "</script" – det knekker HTML-fila.');
if (/<\/style/i.test(css)) throw new Error('motor/krizi.css inneholder "</style".');

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

function slug(s) {
  return String(s).toLowerCase().replace(/æ/g, 'ae').replace(/ø/g, 'o').replace(/å/g, 'a').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'presentasjon';
}

function hentData(html) {
  const m = html.match(/<script type="application\/json" id="krizi-data">([\s\S]*?)<\/script>/);
  if (!m) throw new Error('Fant ikke <script id="krizi-data"> i fila.');
  return JSON.parse(m[1]);
}

function sjekk(doc) {
  const advarsler = [];
  if (!doc.tittel) advarsler.push('mangler "tittel"');
  if (doc.tema && !TEMAER.includes(doc.tema)) advarsler.push(`ukjent tema "${doc.tema}" (bruk ${TEMAER.join(', ')})`);
  const ids = new Set();
  for (const f of doc.rammer || []) {
    if (!f.id) advarsler.push('en ramme mangler "id"');
    else if (ids.has(f.id)) advarsler.push(`ramme-id "${f.id}" er brukt flere ganger`);
    ids.add(f.id);
    if (f.form && !SIZES[f.form]) advarsler.push(`ramme "${f.id}": ukjent form "${f.form}"`);
    if (typeof f.tekst !== 'string') advarsler.push(`ramme "${f.id}": mangler "tekst"`);
  }
  for (const e of doc.sti || []) {
    if (typeof e === 'string' && !ids.has(e)) advarsler.push(`stien peker på ukjent ramme "${e}"`);
  }
  // Rammer som overlapper uten at den ene ligger inni den andre, ser rotete ut.
  const rammer = doc.rammer || [];
  const boks = (f) => {
    const [w, h] = [f.w || SIZES[f.form || 'kort'][0], f.h || SIZES[f.form || 'kort'][1]].map((v) => v * (f.s || 1));
    const a = ((f.r || 0) * Math.PI) / 180, c = Math.abs(Math.cos(a)), s = Math.abs(Math.sin(a));
    const bw = w * c + h * s, bh = w * s + h * c;
    return { x0: f.x - bw / 2, x1: f.x + bw / 2, y0: f.y - bh / 2, y1: f.y + bh / 2, a: w * h, w, h };
  };
  const inni = (a, b, A) => b.a < A.a && Math.abs(b.f.x - a.x) <= A.w / 2 && Math.abs(b.f.y - a.y) <= A.h / 2;
  for (let i = 0; i < rammer.length; i++) {
    for (let j = i + 1; j < rammer.length; j++) {
      const A = boks(rammer[i]), B = boks(rammer[j]);
      const ox = Math.min(A.x1, B.x1) - Math.max(A.x0, B.x0), oy = Math.min(A.y1, B.y1) - Math.max(A.y0, B.y0);
      if (ox <= 0 || oy <= 0) continue;
      const fa = rammer[i], fb = rammer[j];
      if (inni(fa, { f: fb, a: B.a }, A) || inni(fb, { f: fa, a: A.a }, B)) continue;
      if ((ox * oy) / Math.min(A.a, B.a) > 0.04) advarsler.push(`rammene "${fa.id}" og "${fb.id}" overlapper`);
    }
  }
  if (!doc.id) doc.id = 'k' + Math.random().toString(36).slice(2, 12);
  return advarsler;
}

export function lagHTML(doc) {
  const json = JSON.stringify(doc, null, 1).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="no">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(doc.tittel || 'Krizi')}</title>
<meta name="generator" content="Krizi">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${esc(FONT_URL)}">
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
    tittel, tema: 'aurora',
    rammer: [{ id: 'start', form: 'kort', x: 0, y: 0, s: 1, r: 0, tekst: `### Krizi\n# ${tittel}\nTrykk E for å redigere. Legg til rammer nederst, dra dem dit du vil, og trykk Ctrl+S for å lagre.` }],
    sti: ['start']
  };
  skriv(doc, args[2] || path.join(MAPPE, slug(tittel) + '.html'));
} else {
  const inn = args[0];
  const tekst = fs.readFileSync(inn, 'utf8');
  const doc = inn.endsWith('.html') ? hentData(tekst) : JSON.parse(tekst);
  const ut = args[1] || (inn.endsWith('.html') ? inn : path.join(MAPPE, slug(path.basename(inn, '.json')) + '.html'));
  skriv(doc, ut);
}

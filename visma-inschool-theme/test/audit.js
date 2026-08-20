/* Måler tekstkontrast på testsidene, med og uten temaet, og tar skjermbilder.
   Bruk: node test/audit.js [utmappe] */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SRC = path.resolve(__dirname, '..');
const OUT = process.argv[2] || path.resolve(__dirname, 'shots1x');
const PAGES = [
  ['vis', 'http://localhost:8899/mock-vis.html#/app/dashboard'],
  ['timeplan', 'http://localhost:8899/mock-inschool.html#/app/timetable'],
  ['variant', 'http://localhost:8899/mock-alt.html#/app/absence'],
];

function copy(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (['test', '.git', 'node_modules', 'docs'].includes(e.name)) continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    e.isDirectory() ? copy(s, d) : fs.copyFileSync(s, d);
  }
}

const AUDIT = () => {
  const parse = (str) => {
    const m = String(str).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
    return p.length < 3 ? null : { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const bgOf = (el) => {
    let n = el;
    while (n && n.nodeType === 1) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
      const c = parse(cs.backgroundColor);
      if (c && c.a > 0.7) return c;
      n = n.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };
  const out = [];
  document.querySelectorAll('body *').forEach((el) => {
    let own = false;
    for (const n of el.childNodes) if (n.nodeType === 3 && n.nodeValue.trim()) own = true;
    if (!own) return;
    const r = el.getBoundingClientRect();
    if (r.width < 4 || r.height < 4) return;
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.opacity === '0') return;
    const fg = parse(cs.color);
    if (!fg || fg.a < 0.15) return;
    const over = (f, b) => ({ r: f.r * f.a + b.r * (1 - f.a), g: f.g * f.a + b.g * (1 - f.a), b: f.b * f.a + b.b * (1 - f.a) });
    const big = parseFloat(cs.fontSize) >= 24 || (parseFloat(cs.fontSize) >= 18.66 && parseInt(cs.fontWeight, 10) >= 600);
    const bg = bgOf(el);
    if (!bg) return; /* gradient/bilde bak teksten – kan ikke måles pålitelig */
    const cr = ratio(fg.a < 1 ? over(fg, bg) : fg, bg);
    out.push({
      text: (el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 34),
      cls: (typeof el.className === 'string' ? el.className : '').slice(0, 22),
      cr: Math.round(cr * 100) / 100,
      need: big ? 3 : 4.5,
    });
  });
  const bad = out.filter((o) => o.cr < o.need).sort((a, b) => a.cr - b.cr);
  return { total: out.length, bad: bad.length, worst: bad.slice(0, 8) };
};

(async () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'klar-ext-'));
  copy(SRC, tmp);
  const mf = JSON.parse(fs.readFileSync(path.join(tmp, 'manifest.json'), 'utf8'));
  const local = 'http://localhost:8899/*';
  mf.content_scripts[0].matches.push(local);
  mf.host_permissions.push(local);
  mf.web_accessible_resources[0].matches.push(local);
  fs.writeFileSync(path.join(tmp, 'manifest.json'), JSON.stringify(mf, null, 2));
  fs.mkdirSync(OUT, { recursive: true });

  const ctx = await chromium.launchPersistentContext(fs.mkdtempSync(path.join(os.tmpdir(), 'klar-prof-')), {
    headless: true,
    channel: 'chromium',
    viewport: { width: 1440, height: 980 },
    deviceScaleFactor: Number(process.env.KLAR_SCALE || 1),
    args: [`--disable-extensions-except=${tmp}`, `--load-extension=${tmp}`],
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

  const extId = ctx.serviceWorkers().length
    ? ctx.serviceWorkers()[0].url().split('/')[2]
    : (await ctx.waitForEvent('serviceworker')).url().split('/')[2];
  const pop = await ctx.newPage();
  await pop.goto(`chrome-extension://${extId}/popup/popup.html`);

  for (const scheme of ['light', 'dark']) {
    await pop.bringToFront();
    await pop.click(`[data-field="scheme"] [data-value="${scheme}"]`);
    await pop.waitForTimeout(250);
    for (const [name, url] of PAGES) {
      await page.bringToFront();
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForTimeout(2400);
      await page.screenshot({ path: path.join(OUT, `${name}-${scheme}.png`), fullPage: true });
      const res = await page.evaluate(AUDIT);
      console.log(`\n== ${name} / ${scheme}: ${res.bad} av ${res.total} under kravet`);
      res.worst.forEach((w) => console.log(`   ${String(w.cr).padStart(5)} (krav ${w.need})  ${w.cls} "${w.text}"`));
      if (name === 'vis' && scheme === 'dark') {
        const st = await page.evaluate(() => ({
          sidebar: !!document.querySelector('[data-klar-el="sidebar"]'),
          navItems: document.querySelectorAll('[data-klar-el="nav-item"]').length,
          badgesInNav: document.querySelectorAll('[data-klar-el="sidebar"] [data-klar-el="badge"]').length,
          main: (document.querySelector('[data-klar-el="main"]') || {}).className,
          cards: document.querySelectorAll('[data-klar-el="card"]').length,
          events: document.querySelectorAll('[data-klar-el="event"]').length,
          hero: !!document.querySelector('.klar-hero'),
          heroW: document.querySelector('.klar-hero') ? Math.round(document.querySelector('.klar-hero').getBoundingClientRect().width) : 0,
          grid: document.querySelectorAll('[data-klar-grid]').length,
          today: document.querySelectorAll('[data-klar-today]').length,
          adjusted: document.querySelectorAll('[data-klar-ink="auto"]').length,
        }));
        console.log('   struktur:', JSON.stringify(st));
      }
    }
  }

  // Uten tema, til sammenligning
  const plain = await chromium.launch({ headless: true, channel: 'chromium' });
  const pp = await plain.newPage({ viewport: { width: 1440, height: 980 } });
  for (const [name, url] of PAGES) {
    await pp.goto(url, { waitUntil: 'load' });
    await pp.waitForTimeout(300);
    if (name === 'vis') await pp.screenshot({ path: path.join(OUT, 'vis-original.png'), fullPage: true });
    const res = await pp.evaluate(AUDIT);
    console.log(`\n== ${name} / uten tema: ${res.bad} av ${res.total} under kravet`);
  }
  await plain.close();

  console.log('\nFEIL:', errors.length ? errors : 'ingen');
  await ctx.close();
})();

/* Bygger en midlertidig kopi av utvidelsen som også treffer localhost, laster
   den i Chromium og tar skjermbilder av testsiden med og uten tema. */
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const os = require('os');

const SRC = path.resolve(__dirname, '..');
const OUT = process.argv[2] || path.resolve(__dirname, 'shots');
const SCALE = Number(process.env.KLAR_SCALE || 2);

function copy(src, dst) {
  fs.mkdirSync(dst, { recursive: true });
  for (const e of fs.readdirSync(src, { withFileTypes: true })) {
    if (['test', '.git', 'node_modules', 'shots'].includes(e.name)) continue;
    const s = path.join(src, e.name), d = path.join(dst, e.name);
    e.isDirectory() ? copy(s, d) : fs.copyFileSync(s, d);
  }
}

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
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'klar-prof-'));
  const ctx = await chromium.launchPersistentContext(profile, {
    headless: true,
    channel: 'chromium',
    viewport: { width: 1440, height: 980 },
    deviceScaleFactor: SCALE,
    args: [`--disable-extensions-except=${tmp}`, `--load-extension=${tmp}`],
  });

  const page = await ctx.newPage();
  const errors = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));

  const url = 'http://localhost:8899/mock-inschool.html#/app/timetable';

  // Med tema (lys)
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(2600);
  await page.screenshot({ path: path.join(OUT, '02-klar-lys.png'), fullPage: true });

  const state = await page.evaluate(() => ({
    root: document.documentElement.getAttribute('data-klar'),
    scheme: document.documentElement.getAttribute('data-klar-scheme'),
    sidebar: !!document.querySelector('[data-klar-el="sidebar"]'),
    navItems: document.querySelectorAll('[data-klar-el="nav-item"]').length,
    active: document.querySelectorAll('[data-klar-el="nav-item"][data-klar-active]').length,
    topbar: !!document.querySelector('[data-klar-el="topbar"]'),
    main: !!document.querySelector('[data-klar-el="main"]'),
    cards: document.querySelectorAll('[data-klar-el="card"]').length,
    events: document.querySelectorAll('[data-klar-el="event"]').length,
    buttons: document.querySelectorAll('[data-klar-el="btn"]').length,
    primary: document.querySelectorAll('[data-klar-variant="primary"]').length,
    fields: document.querySelectorAll('[data-klar-el="field"]').length,
    tables: document.querySelectorAll('[data-klar-el="table"]').length,
    badges: document.querySelectorAll('[data-klar-el="badge"]').length,
    hero: !!document.querySelector('.klar-hero'),
    fontLoaded: document.fonts.check('16px "Klar Inter"'),
    bodyFont: getComputedStyle(document.body).fontFamily.slice(0, 40),
  }));

  // Panelet – og bytt til mørk derfra, slik hele kjeden testes
  const pop = await ctx.newPage();
  const extId = ctx.serviceWorkers().length
    ? ctx.serviceWorkers()[0].url().split('/')[2]
    : (await ctx.waitForEvent('serviceworker')).url().split('/')[2];
  await pop.setViewportSize({ width: 320, height: 555 });
  await pop.goto(`chrome-extension://${extId}/popup/popup.html`);
  await pop.waitForTimeout(500);
  await pop.screenshot({ path: path.join(OUT, '04-popup.png') });
  await pop.click('[data-field="scheme"] [data-value="dark"]');
  await pop.waitForTimeout(400);
  await pop.screenshot({ path: path.join(OUT, '05-popup-mork.png') });

  // Mørk modus på siden – uten omlasting (innstillingen skal slå inn direkte)
  await page.bringToFront();
  await page.waitForTimeout(1600);
  await page.screenshot({ path: path.join(OUT, '03-klar-mork.png'), fullPage: true });

  // Variant med en helt annen DOM-struktur, i mørk og lys, samt smal skjerm
  const alt = 'http://localhost:8899/mock-alt.html#/app/absence';
  await page.goto(alt, { waitUntil: 'load' });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: path.join(OUT, '06-variant-mork.png'), fullPage: true });
  await pop.bringToFront();
  await pop.click('[data-field="scheme"] [data-value="light"]');
  await pop.waitForTimeout(300);
  await page.bringToFront();
  await page.waitForTimeout(1400);
  await page.screenshot({ path: path.join(OUT, '07-variant-lys.png'), fullPage: true });
  await page.evaluate(() => {
    const d = document.querySelector('.dialog');
    if (d) d.remove();
  });
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(OUT, '07b-variant-uten-dialog.png'), fullPage: true });
  await page.setViewportSize({ width: 900, height: 780 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(OUT, '08-variant-smal.png'), fullPage: true });
  const altState = await page.evaluate(() => ({
    sidebar: !!document.querySelector('[data-klar-el="sidebar"]'),
    brand: document.querySelector('[data-klar-el="brand"]') && document.querySelector('[data-klar-el="brand"]').textContent.trim(),
    navItems: document.querySelectorAll('[data-klar-el="nav-item"]').length,
    active: document.querySelectorAll('[data-klar-el="nav-item"][data-klar-active]').length,
    topbar: !!document.querySelector('[data-klar-el="topbar"]'),
    main: !!document.querySelector('[data-klar-el="main"]'),
    cards: document.querySelectorAll('[data-klar-el="card"]').length,
    buttons: document.querySelectorAll('[data-klar-el="btn"]').length,
    primary: document.querySelectorAll('[data-klar-variant="primary"]').length,
    badges: document.querySelectorAll('[data-klar-el="badge"]').length,
    hero: !!document.querySelector('.klar-hero'),
  }));
  await page.setViewportSize({ width: 1440, height: 980 });

  // Uten tema – egen nettleser uten utvidelsen, slik at sammenligningen blir ærlig
  const plain = await chromium.launch({ headless: true, channel: 'chromium' });
  const pp = await plain.newPage({ viewport: { width: 1440, height: 980 }, deviceScaleFactor: SCALE });
  await pp.goto(url, { waitUntil: 'load' });
  await pp.waitForTimeout(400);
  await pp.screenshot({ path: path.join(OUT, '01-original.png'), fullPage: true });
  await pp.goto(alt, { waitUntil: 'load' });
  await pp.waitForTimeout(400);
  await pp.screenshot({ path: path.join(OUT, '01b-variant-original.png'), fullPage: true });
  await plain.close();

  console.log('TIMEPLAN', JSON.stringify(state, null, 1));
  console.log('VARIANT', JSON.stringify(altState, null, 1));
  console.log('ERRORS:', errors.length ? errors : 'ingen');
  await ctx.close();
})();

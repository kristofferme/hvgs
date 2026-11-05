#!/usr/bin/env node
// Tar skjermbilder av hvert steg i en Krizi-presentasjon, for å sjekke at alt ser riktig ut.
//   node krizi/verktoy/bilder.mjs krizi/presentasjoner/x.html [utmappe] [--mobil] [--rediger]
import { createRequire } from 'node:module';
import path from 'node:path';
import fs from 'node:fs';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch { playwright = require('/usr/lib/node_modules/playwright'); }

const args = process.argv.slice(2).filter((a) => !a.startsWith('--'));
const mobil = process.argv.includes('--mobil');
const rediger = process.argv.includes('--rediger');
const fil = path.resolve(args[0]);
const ut = path.resolve(args[1] || 'krizi-bilder');
fs.mkdirSync(ut, { recursive: true });

const browser = await playwright.chromium.launch();
const page = await browser.newPage(mobil ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, hasTouch: true } : { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const feil = [];
page.on('pageerror', (e) => feil.push(e.message));
page.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) feil.push(m.text()); });
await page.goto('file://' + fil + '#1');
await page.waitForTimeout(1800);
const n = await page.evaluate(() => window.krizi.doc().sti.length);
for (let i = 0; i < n; i++) {
  await page.evaluate((i) => window.krizi.gaTil(i, { alleSteg: true }), i);
  await page.waitForTimeout(3200);
  await page.screenshot({ path: path.join(ut, `steg-${String(i + 1).padStart(2, '0')}.png`) });
}
await page.evaluate(() => window.krizi.oversikt(true));
await page.waitForTimeout(3000);
await page.screenshot({ path: path.join(ut, 'oversikt.png') });
if (rediger) {
  await page.evaluate(() => { window.krizi.gaTil(0); });
  await page.waitForTimeout(2600);
  await page.keyboard.press('e');
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(ut, 'rediger.png') });
  await page.mouse.click(page.viewportSize().width * 0.35, page.viewportSize().height * 0.5);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(ut, 'rediger-valgt.png') });
}
await browser.close();
console.log(`${n} steg → ${ut}`);
if (feil.length) { console.log('Feil i nettleseren:'); feil.forEach((f) => console.log('  ' + f)); process.exitCode = 1; }

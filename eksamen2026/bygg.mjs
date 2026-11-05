// Bygger én selvstendig fil – eksamen2026/index.html – av kildene i src/.
// Skrifter, stil, innhold og kode legges inn i fila, så den virker uten nett
// og kan sendes på e-post, legges i Teams eller åpnes rett fra disk.
//
//   node bygg.mjs
//
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const her = dirname(fileURLToPath(import.meta.url));
const src = (f) => readFileSync(join(her, "src", f), "utf8");

// Sjekk at innholdsfila lar seg lese før vi bygger.
globalThis.window = {};
new Function(src("innhold.js"))();
const D = globalThis.window.EKSAMEN;
if (!D || !D.KAPITLER) throw new Error("innhold.js mangler window.EKSAMEN – sjekk komma og klammer.");

const scriptSafe = (s) => s.replace(/<\/script/gi, "<\\/script");
const css = `<style>\n${src("fonter.css")}\n${src("stil.css")}\n</style>`;
const js = `<script>\n${scriptSafe(src("innhold.js"))}\n</script>\n<script>\n${scriptSafe(src("app.js"))}\n</script>`;

let html = src("index.html")
  .replace(/<!-- BYGG:CSS -->[\s\S]*?<!-- \/BYGG:CSS -->/, () => css)
  .replace(/<!-- BYGG:JS -->[\s\S]*?<!-- \/BYGG:JS -->/, () => js);

// Logoene legges inn i fila.
html = html.replace(/src="profil\/([a-z-]+\.png)"/g, (_, f) =>
  `src="data:image/png;base64,${readFileSync(join(her, "src", "profil", f)).toString("base64")}"`);

// Svar på plassholdere fra src/lokalt.json (lastet ned fra presentasjonen).
const lokalFil = join(her, "src", "lokalt.json");
let lokalt = {};
if (existsSync(lokalFil)) lokalt = JSON.parse(readFileSync(lokalFil, "utf8"));
html = html.replace(/(<script id="lokalt" type="application\/json">)[\s\S]*?(<\/script>)/,
  (_, a, b) => a + JSON.stringify(lokalt).replace(/</g, "\\u003c") + b);

writeFileSync(join(her, "index.html"), html);

let plass = 0;
const tell = (o) => {
  if (typeof o === "string") plass += (o.match(/\[\[(.+?)\]\]/g) || []).length;
  else if (o && typeof o === "object") Object.values(o).forEach(tell);
};
tell(D);
console.log(`Bygget eksamen2026/index.html (${(html.length / 1024).toFixed(0)} kB). Plassholdere i innhold.js: ${plass}, hvorav ${Object.keys(lokalt).length} er fylt inn via lokalt.json.`);

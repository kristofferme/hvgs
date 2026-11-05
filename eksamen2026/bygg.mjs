// Bygger én selvstendig fil – eksamen2026/index.html – av kildene i src/.
// Skrifter, stil, innhold og kode legges inn i fila, så den virker uten nett
// og kan sendes på e-post, legges i Teams eller åpnes rett fra disk.
//
//   node bygg.mjs
//
import { readFileSync, writeFileSync } from "node:fs";
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

writeFileSync(join(her, "index.html"), html);

let plass = 0;
const tell = (o) => {
  if (typeof o === "string") plass += (o.match(/\[\[(.+?)\]\]/g) || []).length;
  else if (o && typeof o === "object") Object.values(o).forEach(tell);
};
tell(D);
console.log(`Bygget eksamen2026/index.html (${(html.length / 1024).toFixed(0)} kB). Plassholdere igjen: ${plass}.`);

(() => {
"use strict";

/* ── Datoane presentasjonen reknar med (norsk sommartid, UTC+2) ── */
const MAAL = {
  trekk:  { tid: new Date("2027-04-28T09:00:00+02:00"), tekst: "Onsdag 28. april 2027 kl. 09.00", ferdig: "Trekket er klart – sjekk kva du har fått!" },
  forste: { tid: new Date("2027-05-04T09:00:00+02:00"), tekst: "Tysdag 4. mai 2027 kl. 09.00", ferdig: "Den skriftlege perioden er i gang." },
  siste:  { tid: new Date("2027-05-21T09:00:00+02:00"), tekst: "Fredag 21. mai 2027 kl. 09.00", ferdig: "Siste skriftlege dag er passert." },
  sensur: { tid: new Date("2027-06-17T09:00:00+02:00"), tekst: "Torsdag 17. juni 2027", ferdig: "Fellessensuren er i gang eller ferdig." },
};

/* Fag trekkmaskina vel mellom. Berre for moro – det ekte trekket gjer fylkeskommunen. */
const TREKK = {
  vg1sf: { fag: ["Engelsk", "Matematikk 1P", "Naturfag", "Geografi", "Samfunns\u00ADkunnskap"] },
  vg1yf: { fag: ["Engelsk", "Matematikk 1P-Y", "Naturfag"] },
  vg2yf: { fag: ["Norsk", "Samfunns\u00ADkunnskap"] },
  pb:    { skriftleg: ["Matematikk 2P-Y", "Historie"], munnleg: ["Historie", "Naturfag", "Samfunns\u00ADkunnskap", "Norsk", "Matematikk 2P-Y"] },
};

/* Hjelpemiddel: svar for [sikker nettlesar, matte del 1, matte del 2] */
const TING = [
  { namn: "Mobiltelefon", svar: ["nei", "nei", "nei"], kvifor: ["Skal vere avslått og levert.", "Skal vere avslått og levert.", "Skal vere avslått og levert."] },
  { namn: "Smartklokke", svar: ["nei", "nei", "nei"], kvifor: ["Same som mobil – ikkje på armen.", "Same som mobil – ikkje på armen.", "Same som mobil – ikkje på armen."] },
  { namn: "KI-verktøy", svar: ["nei", "nei", "nei"], kvifor: ["Bruk av KI er fusk.", "Bruk av KI er fusk.", "Bruk av KI er fusk."] },
  { namn: "Notat på papir", svar: ["ja", "nei", "ja"], kvifor: ["Papir er det du kan bruke.", "Del 1 er utan hjelpemiddel.", "Lov på del 2."] },
  { namn: "Notat lagra på PC-en", svar: ["nei", "nei", "nei"], kvifor: ["Sikker nettlesar stengjer filene.", "Del 1 er utan hjelpemiddel.", "Ingen PC på del 2 frå 2027."] },
  { namn: "Lærebok", svar: ["ja", "nei", "ja"], kvifor: ["Lov når hjelpemiddel er tillatne.", "Del 1 er utan hjelpemiddel.", "Lov på del 2."] },
  { namn: "Ordbok på papir", svar: ["ja", "nei", "ja"], kvifor: ["Lov når hjelpemiddel er tillatne.", "Del 1 er utan hjelpemiddel.", "Lov på del 2."] },
  { namn: "Kalkulator", svar: ["ja", "nei", "ja"], kvifor: ["Lov der alle hjelpemiddel er tillatne.", "Ikkje på del 1.", "Lov – spør læraren kva type."] },
  { namn: "PC", svar: ["ja", "nei", "nei"], kvifor: ["Du skriv i sikker nettlesar.", "Ingen PC på del 1.", "Frå 2027 svarer du for hand."] },
  { namn: "Linjal og passar", svar: ["ja", "ja", "ja"], kvifor: ["Vanlege skrivesaker er greitt.", "Lov, saman med vinkelmålar.", "Lov på del 2."] },
  { namn: "Niste og vatn", svar: ["ja", "ja", "ja"], kvifor: ["Ta med – fem timar er lenge.", "Ta med – fem timar er lenge.", "Ta med – fem timar er lenge."] },
  { namn: "Trådlause øyreproppar", svar: ["nei", "nei", "nei"], kvifor: ["Alt med Bluetooth er ute.", "Alt med Bluetooth er ute.", "Alt med Bluetooth er ute."] },
];

/* Sjuk på eksamensdagen: stega for kvart val */
const SJUK = {
  for: [
    { ikon: "telefon", tittel: "Meld frå til skulen med ein gong", tekst: "Ring eller send melding før eksamen startar, slik at skulen veit kvifor du ikkje kjem." },
    { ikon: "lege", tittel: "Gå til lege same dag", tekst: "Du treng legeattest som viser at du var sjuk på eksamensdagen." },
    { ikon: "papir", tittel: "Lever attesten raskt", tekst: "Gi attesten til skulen så fort du kan. Skulen fortel kva frist som gjeld." },
    { ikon: "hake", tittel: "Du får utsett eksamen", tekst: "Med gyldig dokumentasjon har du rett til utsett eksamen i neste eksamensperiode, vanlegvis til hausten.", type: "bra" },
    { ikon: "varsel", tittel: "Utan legeattest?", tekst: "Møter du ikkje og manglar dokumentasjon, blir du registrert som «ikkje møtt», og du har ikkje rett på utsett eksamen.", type: "varsel" },
  ],
  under: [
    { ikon: "prat", tittel: "Sei frå til vakta", tekst: "Ikkje gå utan å seie frå. Vakta skriv ned kva som skjer." },
    { ikon: "varsel", tittel: "Tenk deg om før du leverer", tekst: "Leverer du, blir svaret vurdert som vanleg. Avbryt du fordi du er sjuk, må du gå til lege same dag.", type: "varsel" },
    { ikon: "lege", tittel: "Legeattest same dag", tekst: "Attesten må vise at du var sjuk under eksamen. Lever han til skulen så fort du kan." },
    { ikon: "hake", tittel: "Du får utsett eksamen", tekst: "Med gyldig dokumentasjon får du ta eksamen på nytt i neste eksamensperiode.", type: "bra" },
  ],
  etter: [
    { ikon: "papir", tittel: "Svaret blir vurdert", tekst: "Når du har levert, blir svaret vurdert som vanleg. Sjukdom kan ikkje brukast som grunn til å klage etterpå." },
    { ikon: "varsel", tittel: "Kjenner du deg dårleg? Sei frå før du leverer", tekst: "Snakk med vakta medan eksamen framleis pågår – ikkje etterpå.", type: "varsel" },
  ],
};

/* ── Hjelparar ─────────────────────────────────────── */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const roleg = matchMedia("(prefers-reduced-motion: reduce)").matches;
const hent = (k, std) => { try { const v = localStorage.getItem(k); return v === null ? std : v; } catch (e) { return std; } };
const lagre = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
const ikon = (namn) => `<svg><use href="#i-${namn}"/></svg>`;
const to = (n) => String(n).padStart(2, "0");
const DAGAR = ["sundag", "måndag", "tysdag", "onsdag", "torsdag", "fredag", "laurdag"];
const MND = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];

let toastTimar;
function toast(tekst) {
  const t = $("#toast");
  t.textContent = tekst;
  t.classList.add("vis");
  clearTimeout(toastTimar);
  toastTimar = setTimeout(() => t.classList.remove("vis"), 2600);
}

/* Flytt eit element til ein ny forelder med ein mjuk glidebevegelse (FLIP). */
function flytt(el, nyForelder) {
  const fra = el.getBoundingClientRect();
  nyForelder.appendChild(el);
  if (roleg) return;
  const til = el.getBoundingClientRect();
  el.animate([
    { transform: `translate(${fra.left - til.left}px, ${fra.top - til.top}px)` },
    { transform: "none" },
  ], { duration: 420, easing: "cubic-bezier(.2,.75,.3,1)" });
}

/* ── Konfetti ──────────────────────────────────────── */
const lerret = $("#konfetti");
const ktx = lerret.getContext("2d");
let bitar = [];
let konfettiGaar = false;
function konfetti(x = innerWidth / 2, y = innerHeight / 2.4) {
  if (roleg) return;
  const fargar = ["#0093C9", "#A93A2C", "#1F6E5B", "#E9B949", "#6B3A63", "#2F4B7C", "#F08A5D"];
  for (let i = 0; i < 160; i++) {
    const v = Math.random() * Math.PI * 2;
    const fart = 4 + Math.random() * 9;
    bitar.push({
      x, y, vx: Math.cos(v) * fart, vy: Math.sin(v) * fart - 6,
      r: Math.random() * 6.28, vr: (Math.random() - .5) * .35,
      b: 6 + Math.random() * 7, h: 3 + Math.random() * 5,
      f: fargar[i % fargar.length], liv: 0,
    });
  }
  if (!konfettiGaar) { konfettiGaar = true; requestAnimationFrame(tikkKonfetti); }
}
function tikkKonfetti() {
  const dpr = devicePixelRatio || 1;
  if (lerret.width !== innerWidth * dpr) { lerret.width = innerWidth * dpr; lerret.height = innerHeight * dpr; }
  ktx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ktx.clearRect(0, 0, innerWidth, innerHeight);
  bitar = bitar.filter((b) => b.y < innerHeight + 40 && b.liv < 260);
  for (const b of bitar) {
    b.liv++; b.vy += .28; b.vx *= .985; b.x += b.vx; b.y += b.vy; b.r += b.vr;
    ktx.save(); ktx.translate(b.x, b.y); ktx.rotate(b.r);
    ktx.fillStyle = b.f; ktx.fillRect(-b.b / 2, -b.h / 2, b.b, b.h);
    ktx.restore();
  }
  if (bitar.length) requestAnimationFrame(tikkKonfetti);
  else { konfettiGaar = false; ktx.clearRect(0, 0, innerWidth, innerHeight); }
}
function konfettiFraa(el) {
  const r = el.getBoundingClientRect();
  konfetti(r.left + r.width / 2, r.top + r.height / 2);
}

/* ── Lysbileta ─────────────────────────────────────── */
const lysbilete = $$(".lysbilete");
const n = lysbilete.length;
let no = -1;

lysbilete.forEach((s) => {
  $$("[data-inn]", s).forEach((el, i) => el.style.setProperty("--n", Math.min(i, 14)));
});

/* Bokstavane i stortittelen kjem inn ein og ein */
$$(".stortittel .ord").forEach((ord) => {
  ord.innerHTML = [...ord.textContent].map((b, i) => `<span class="bokstav" style="--b:${i}">${b}</span>`).join("");
});

/* Kapittel: samanhengande grupper med same data-kapittel */
const kapittel = [];
lysbilete.forEach((s, i) => {
  const namn = s.dataset.kapittel;
  const siste = kapittel[kapittel.length - 1];
  if (siste && siste.namn === namn) siste.til = i;
  else kapittel.push({ namn, fra: i, til: i, farge: s.dataset.farge });
});
const stolpe = $("#kapittelstolpe");
kapittel.forEach((k) => {
  const b = document.createElement("button");
  b.style.setProperty("--n", k.til - k.fra + 1);
  b.dataset.farge = k.farge;
  b.setAttribute("aria-label", `Hopp til ${k.namn}`);
  b.innerHTML = `<i></i><span class="tips">${k.namn}</span>`;
  b.addEventListener("click", () => gaaTil(k.fra));
  k.knapp = b;
  stolpe.appendChild(b);
});

/* Oversikta */
const miniatyrar = $("#miniatyrar");
lysbilete.forEach((s, i) => {
  const b = document.createElement("button");
  b.className = "miniatyr";
  b.dataset.farge = s.dataset.farge;
  b.style.setProperty("--n", i);
  b.innerHTML = `<span class="nr">${to(i + 1)}</span><b>${s.dataset.tittel}</b><small>${s.dataset.kapittel}</small>`;
  b.addEventListener("click", () => { lukkLag(); gaaTil(i); });
  miniatyrar.appendChild(b);
});

/* Bakgrunnsklattane får ein fast, men ulik plass på kvart lysbilete */
function klattplass(i) {
  const r = (k) => Math.sin(i * 12.9898 + k * 78.233) * 43758.5453 % 1;
  const v = (k, m) => `${(r(k) * m).toFixed(1)}vmax`;
  const st = document.body.style;
  st.setProperty("--x1", v(1, 16)); st.setProperty("--y1", v(2, 14));
  st.setProperty("--x2", v(3, 18)); st.setProperty("--y2", v(4, 12));
  st.setProperty("--x3", v(5, 30)); st.setProperty("--y3", v(6, 22));
}

function gaaTil(i, opt = {}) {
  i = Math.max(0, Math.min(n - 1, i));
  if (i === no) return;
  const forrige = lysbilete[no];
  no = i;
  lysbilete.forEach((s, j) => {
    s.classList.toggle("aktiv", j === i);
    s.classList.toggle("forbi", j < i);
    s.inert = j !== i;
    s.setAttribute("aria-hidden", j === i ? "false" : "true");
  });
  const s = lysbilete[i];
  s.scrollTop = 0;
  document.body.dataset.farge = s.dataset.farge;
  klattplass(i);

  $("#teljar").innerHTML = `<b>${to(i + 1)}</b> / ${to(n)}`;
  $("#forrige").disabled = i === 0;
  $("#neste").disabled = i === n - 1;
  $("#kapittelnamn").textContent = s.dataset.kapittel;
  kapittel.forEach((k) => {
    const fylt = i > k.til ? 100 : i < k.fra ? 0 : ((i - k.fra + 1) / (k.til - k.fra + 1)) * 100;
    k.knapp.querySelector("i").style.setProperty("--fylt", fylt + "%");
    k.knapp.setAttribute("aria-current", i >= k.fra && i <= k.til ? "step" : "false");
  });
  $$(".miniatyr").forEach((m, j) => m.setAttribute("aria-current", j === i ? "true" : "false"));
  $("#kunngjer").textContent = `Lysbilete ${i + 1} av ${n}: ${s.dataset.tittel}`;

  if (!opt.utanAdresse) history.replaceState(null, "", "#" + s.id);
  if (forrige) forrige.dispatchEvent(new CustomEvent("ut"));
  s.dispatchEvent(new CustomEvent("inn"));
}
const neste = () => gaaTil(no + 1);
const forrige = () => gaaTil(no - 1);
const finn = (id) => lysbilete.findIndex((s) => s.id === id);

$("#neste").addEventListener("click", neste);
$("#forrige").addEventListener("click", forrige);
document.addEventListener("click", (e) => {
  const lenke = e.target.closest("[data-til]");
  if (!lenke) return;
  e.preventDefault();
  const i = finn(lenke.dataset.til);
  if (i >= 0) { lukkLag(); gaaTil(i); }
});
addEventListener("hashchange", () => {
  const i = finn(location.hash.slice(1));
  if (i >= 0) gaaTil(i, { utanAdresse: true });
});

/* Tal som tel seg opp når lysbiletet kjem inn */
lysbilete.forEach((s) => s.addEventListener("inn", () => {
  $$("[data-tel]", s).forEach(telOpp);
}));
function telOpp(el) {
  const maal = Number(el.dataset.tel);
  if (roleg) { el.textContent = maal; return; }
  const start = performance.now();
  const varigheit = 900;
  const steg = (t) => {
    const p = Math.min(1, (t - start) / varigheit);
    el.textContent = Math.round(maal * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(steg);
  };
  requestAnimationFrame(steg);
}

/* ── Tastatur og sveip ─────────────────────────────── */
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey || e.metaKey || e.altKey) return;
  const t = e.target;
  if (e.key === "Escape") { if (lukkLag()) return; if (t.blur) t.blur(); return; }
  if (t.closest("input, textarea, select, [contenteditable]")) return;
  const ope = $(".lag.ope");
  const k = e.key.toLowerCase();
  if (ope) { if (k === "o" && ope.id === "oversikt") lukkLag(); return; }
  switch (e.key) {
    case "ArrowRight": case "PageDown": e.preventDefault(); neste(); return;
    case "ArrowLeft": case "PageUp": e.preventDefault(); forrige(); return;
    case "Home": e.preventDefault(); gaaTil(0); return;
    case "End": e.preventDefault(); gaaTil(n - 1); return;
    case " ":
      if (t.closest("button, a, summary, label")) return;
      e.preventDefault(); e.shiftKey ? forrige() : neste(); return;
    case "?": opneLag("hjelp"); return;
  }
  if (k === "o") opneLag("oversikt");
  else if (k === "f") fullskjerm();
  else if (k === "t") bytTema();
  else if (k === "l") laser();
});

let sveip = null;
const scene = $("#scene");
scene.addEventListener("touchstart", (e) => {
  if (e.touches.length !== 1 || e.target.closest("[data-ingen-sveip], input")) { sveip = null; return; }
  sveip = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() };
}, { passive: true });
scene.addEventListener("touchend", (e) => {
  if (!sveip) return;
  const dx = e.changedTouches[0].clientX - sveip.x;
  const dy = e.changedTouches[0].clientY - sveip.y;
  if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4 && Date.now() - sveip.t < 800) dx < 0 ? neste() : forrige();
  sveip = null;
}, { passive: true });

/* ── Lag: oversikt og hjelp ────────────────────────── */
let fokusFor = null;
function opneLag(id) {
  const lag = document.getElementById(id);
  if (lag.classList.contains("ope")) return;
  lukkLag();
  fokusFor = document.activeElement;
  lag.classList.add("ope");
  scene.inert = true;
  const fokus = id === "oversikt" ? $(".miniatyr[aria-current='true']") : $(".lukk", lag);
  setTimeout(() => (fokus || $(".lukk", lag)).focus(), 60);
}
function lukkLag() {
  const ope = $(".lag.ope");
  if (!ope) return false;
  ope.classList.remove("ope");
  scene.inert = false;
  if (fokusFor && fokusFor.focus) fokusFor.focus();
  return true;
}
$$(".lag .lukk").forEach((b) => b.addEventListener("click", lukkLag));
$$(".lag").forEach((l) => l.addEventListener("click", (e) => { if (e.target === l) lukkLag(); }));
$("#knapp-oversikt").addEventListener("click", () => opneLag("oversikt"));
$("#knapp-hjelp").addEventListener("click", () => opneLag("hjelp"));

/* ── Tema, fullskjerm og laser ─────────────────────── */
const temaKnapp = $("#knapp-tema");
const morkNo = () => {
  const t = document.documentElement.dataset.theme;
  return t ? t === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
};
function visTemaIkon() {
  temaKnapp.innerHTML = ikon(morkNo() ? "sol" : "maane");
  $('meta[name="theme-color"]').content = morkNo() ? "#121A1F" : "#E7EBE8";
}
function bytTema() {
  const nytt = morkNo() ? "light" : "dark";
  document.documentElement.dataset.theme = nytt;
  lagre("eksamen:tema", nytt);
  visTemaIkon();
}
temaKnapp.addEventListener("click", bytTema);
matchMedia("(prefers-color-scheme: dark)").addEventListener("change", visTemaIkon);
visTemaIkon();

const fsKnapp = $("#knapp-fullskjerm");
if (!document.documentElement.requestFullscreen) fsKnapp.hidden = true;
function fullskjerm() {
  if (!document.documentElement.requestFullscreen) return;
  if (document.fullscreenElement) document.exitFullscreen();
  else document.documentElement.requestFullscreen().catch(() => {});
}
fsKnapp.addEventListener("click", fullskjerm);
document.addEventListener("fullscreenchange", () => fsKnapp.setAttribute("aria-pressed", document.fullscreenElement ? "true" : "false"));

const laserprikk = $("#laser");
function laser() {
  const paa = document.body.classList.toggle("laser-paa");
  $("#knapp-laser").setAttribute("aria-pressed", paa ? "true" : "false");
  toast(paa ? "Laserpeikar på – trykk L for å slå av" : "Laserpeikar av");
}
$("#knapp-laser").addEventListener("click", laser);
addEventListener("pointermove", (e) => {
  if (document.body.classList.contains("laser-paa")) laserprikk.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
});

/* ── Forsida: teikn arket ──────────────────────────── */
$$(".ark-illustrasjon .strek").forEach((p) => p.style.setProperty("--l", Math.ceil(p.getTotalLength())));

/* ── Snukort (nytt i 2027 og myter) ────────────────── */
const myteTeljar = $("#myte-teljar");
const snudde = new Set();
$$(".nyheit, .myte").forEach((kort, i) => {
  kort.addEventListener("click", () => {
    const paa = kort.getAttribute("aria-pressed") !== "true";
    kort.setAttribute("aria-pressed", String(paa));
    if (kort.classList.contains("myte")) {
      snudde.add(i);
      const tal = snudde.size;
      const alle = $$(".myte").length;
      myteTeljar.textContent = `${tal} av ${alle} snudde`;
      if (tal === alle && !kort.dataset.feira) { kort.dataset.feira = "1"; konfettiFraa(myteTeljar); }
    }
  });
  if (!roleg && matchMedia("(hover: hover)").matches) {
    kort.addEventListener("pointerenter", () => { kort.style.transition = "transform .15s ease-out"; });
    kort.addEventListener("pointermove", (e) => {
      const r = kort.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5;
      const y = (e.clientY - r.top) / r.height - .5;
      kort.style.transform = `rotateX(${(-y * 8).toFixed(2)}deg) rotateY(${(x * 10).toFixed(2)}deg)`;
    });
    kort.addEventListener("pointerleave", () => {
      kort.style.transition = "transform .5s cubic-bezier(.2,.75,.3,1)";
      kort.style.transform = "";
      setTimeout(() => { if (!kort.matches(":hover")) kort.style.transition = ""; }, 520);
    });
  }
});

/* ── Nedteljing ────────────────────────────────────── */
function deler(maal) {
  const ms = Math.max(0, maal - Date.now());
  return {
    ms,
    d: Math.floor(ms / 864e5),
    t: Math.floor(ms / 36e5) % 24,
    m: Math.floor(ms / 6e4) % 60,
    s: Math.floor(ms / 1e3) % 60,
  };
}
let valtMaal = "trekk";
const storklokke = $("#storklokke");
function settSiffer(boks, verdi) {
  const tekst = verdi < 100 ? to(verdi) : String(verdi);
  const gamle = $$(".siffer", boks);
  if (gamle.length !== tekst.length) {
    boks.innerHTML = [...tekst].map((c) => `<span class="siffer">${c}</span>`).join("");
    return;
  }
  [...tekst].forEach((c, i) => {
    const el = gamle[i];
    if (el.textContent === c) return;
    el.textContent = c;
    el.classList.remove("rull");
    void el.offsetWidth;
    el.classList.add("rull");
  });
}
function tikk() {
  const tr = deler(MAAL.trekk.tid);
  $$('[data-ned="trekk"]').forEach((boks) => {
    for (const k of ["d", "t", "m", "s"]) $(`[data-del="${k}"]`, boks).textContent = k === "d" ? tr[k] : to(tr[k]);
  });
  const val = MAAL[valtMaal];
  const st = deler(val.tid);
  for (const k of ["d", "t", "m", "s"]) settSiffer($(`[data-del="${k}"]`, storklokke), st[k]);
  $("#nedteljing-status").textContent = st.ms === 0 ? val.ferdig : val.tekst;
}
$$("[data-maal]").forEach((b) => b.addEventListener("click", () => {
  valtMaal = b.dataset.maal;
  $$("[data-maal]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  $$(".tal", storklokke).forEach((t) => (t.innerHTML = ""));
  tikk();
}));
tikk();
setInterval(tikk, 1000);

/* ── Tidslinja ─────────────────────────────────────── */
const bane = $("#tidslinje-bane");
const milepaelar = $$(".milepael", bane);
const datoar = milepaelar.map((m) => new Date(m.dataset.dato + (m.dataset.dato.includes("T") ? ":00+02:00" : "T00:00:00+01:00")));
const plass = milepaelar.map((_, i) => 5 + i * (90 / (milepaelar.length - 1)));
const detalj = $("#milepaeldetalj");
const liste = $("#tidslinje-liste");

milepaelar.forEach((m, i) => {
  m.style.left = plass[i] + "%";
  m.style.setProperty("--n", i);
  m.classList.add(i % 2 ? "ned" : "opp");
  m.dataset.farge = i === 2 ? "rust" : i >= 3 && i <= 7 ? "teal" : i === 8 ? "oliven" : i === 9 ? "brun" : "marine";
  m.addEventListener("click", () => visMilepael(i));
  const li = document.createElement("li");
  li.dataset.farge = m.dataset.farge;
  li.innerHTML = `<time>${m.dataset.kort}</time><div><b>${m.dataset.tittel}</b><span>${m.dataset.tekst}</span></div>`;
  liste.appendChild(li);
});
function idagPlass() {
  const naa = Date.now();
  if (naa <= datoar[0]) return plass[0] / 2;
  if (naa >= datoar[datoar.length - 1]) return 100 - plass[0] / 2;
  for (let i = 0; i < datoar.length - 1; i++) {
    if (naa >= datoar[i] && naa < datoar[i + 1]) {
      const del = (naa - datoar[i]) / (datoar[i + 1] - datoar[i]);
      return plass[i] + del * (plass[i + 1] - plass[i]);
    }
  }
  return 0;
}
function visMilepael(i) {
  const m = milepaelar[i];
  milepaelar.forEach((x, j) => x.setAttribute("aria-expanded", String(j === i)));
  detalj.dataset.farge = m.dataset.farge;
  const [dag, ...rest] = m.dataset.lang.split(" ");
  detalj.innerHTML = `<div class="dato">${m.dataset.kort}<small>${dag} ${rest.join(" ")}</small></div><h3>${m.dataset.tittel}</h3><p>${m.dataset.tekst}</p>`;
  detalj.classList.remove("byt"); void detalj.offsetWidth; detalj.classList.add("byt");
}
const nesteMilepael = () => {
  const i = datoar.findIndex((d) => d >= Date.now());
  return i === -1 ? datoar.length - 1 : i;
};
visMilepael(nesteMilepael());
const tidslinjeBilete = bane.closest(".lysbilete");
tidslinjeBilete.addEventListener("inn", () => {
  const p = idagPlass();
  const naa = Date.now();
  milepaelar.forEach((m, i) => m.classList.toggle("ferdig", datoar[i] < naa));
  $$("li", liste).forEach((li, i) => li.classList.toggle("ferdig", datoar[i] < naa));
  requestAnimationFrame(() => {
    $(".bane i", bane).style.width = p + "%";
    $(".idag", bane).style.left = p + "%";
  });
  visMilepael(nesteMilepael());
});
tidslinjeBilete.addEventListener("ut", () => {
  $(".bane i", bane).style.width = "0";
  $(".idag", bane).style.left = "0";
});

/* ── Kva gjeld for meg + trekkmaskina ──────────────── */
const klasseknappar = $$("#meg [data-klasse]");
const trekkKlassar = $("#trekk-klassar");
klasseknappar.forEach((b) => {
  const kopi = b.cloneNode(true);
  trekkKlassar.appendChild(kopi);
});
let klasse = null;
function velKlasse(k, { vis = true } = {}) {
  const b = klasseknappar.find((x) => x.dataset.klasse === k);
  if (!b) return;
  klasse = { namn: k, profil: b.dataset.profil };
  lagre("eksamen:klasse", k);
  $$("[data-klasse]").forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.klasse === k)));
  if (vis) visProfil(b.dataset.profil, k);
  byggHjul();
}
function visProfil(profil, k) {
  const mal = document.getElementById("profil-" + profil);
  const vising = $("#profilvising");
  vising.innerHTML = "";
  const innhald = mal.content.cloneNode(true);
  const stikk = $(".stikk", innhald);
  if (stikk) stikk.textContent += ` · ${k}`;
  vising.appendChild(innhald);
  const p = $(".profil", vising);
  p.classList.add("byt");
  $$("[data-tel]", vising).forEach(telOpp);
  $$(".sjanse", vising).forEach((sj) => {
    const del = $(".del", sj);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      del.style.strokeDasharray = `${(Number(sj.dataset.prosent) / 100) * 301.6} 301.6`;
    }));
  });
}
$$("[data-klasse]").forEach((b) => b.addEventListener("click", () => velKlasse(b.dataset.klasse)));

const hjul = $("#hjul");
const maskin = $("#maskin");
const resultat = $("#trekkresultat");
let spinn = false;
function hjuloppsett() {
  if (!klasse) return null;
  const t = TREKK[klasse.profil];
  if (klasse.profil === "pb") {
    return [
      { tittel: "Alle", verdiar: ["Norsk hovudmål"] },
      { tittel: "Skriftleg", verdiar: t.skriftleg },
      { tittel: "Munnleg / praktisk", verdiar: t.munnleg },
    ];
  }
  if (klasse.profil === "vg2yf") {
    return [
      { tittel: "Alle", verdiar: ["Tverrfagleg eksamen"] },
      { tittel: "Eitt fag til?", verdiar: ["Ja", "Nei"] },
      { tittel: "Fag", verdiar: t.fag },
    ];
  }
  return [
    { tittel: "Trekt ut?", verdiar: ["Ja", "Nei"] },
    { tittel: "Fag", verdiar: t.fag },
  ];
}
function byggHjul() {
  const opp = hjuloppsett();
  if (!opp) {
    hjul.innerHTML = [0, 1, 2].map(() => `<div class="hjulramme"><div class="remse"><div>?</div></div></div>`).join("");
    return;
  }
  hjul.style.gridTemplateColumns = `repeat(${opp.length}, minmax(0, 1fr))`;
  hjul.innerHTML = opp.map((h) => `<div class="hjulramme"><span class="tittelrad">${h.tittel}</span><div class="remse"><div>${h.verdiar[0] === "Ja" ? "?" : h.verdiar.length === 1 ? h.verdiar[0] : "?"}</div></div></div>`).join("");
  resultat.textContent = `Klasse ${klasse.namn}. Trykk på spaken!`;
}
const tilfeldig = (liste) => liste[Math.floor(Math.random() * liste.length)];
const smaa = (fag) => fag.charAt(0).toLowerCase() + fag.slice(1);
function trekk() {
  if (spinn) return;
  if (!klasse) { toast("Vel klasse først"); return; }
  const opp = hjuloppsett();
  let svar;
  if (klasse.profil === "pb") {
    const s = tilfeldig(opp[1].verdiar);
    const m = tilfeldig(opp[2].verdiar.filter((f) => f !== s));
    svar = [opp[0].verdiar[0], s, m];
  } else if (klasse.profil === "vg2yf") {
    const ja = Math.random() < .2;
    svar = [opp[0].verdiar[0], ja ? "Ja" : "Nei", ja ? tilfeldig(opp[2].verdiar) : "–"];
  } else {
    const ja = Math.random() < .2;
    svar = [ja ? "Ja" : "Nei", ja ? tilfeldig(opp[1].verdiar) : "–"];
  }
  spinn = true;
  maskin.classList.add("spinn");
  resultat.textContent = "Trekkjer …";
  const rammer = $$(".hjulramme", hjul);
  const hogd = rammer[0].clientHeight;
  const ventar = rammer.map((ramme, i) => new Promise((ferdig) => {
    const remse = $(".remse", ramme);
    const kjelde = opp[i].verdiar.length > 1 ? opp[i].verdiar : [opp[i].verdiar[0], opp[i].verdiar[0]];
    const rundar = roleg ? 0 : 3 + i * 2;
    const ord = [];
    for (let r = 0; r < rundar; r++) ord.push(...[...kjelde].sort(() => Math.random() - .5));
    ord.push(svar[i]);
    remse.innerHTML = ord.map((o) => `<div>${o}</div>`).join("");
    const slutt = -(ord.length - 1) * hogd;
    if (roleg) { remse.style.transform = `translateY(${slutt}px)`; ferdig(); return; }
    const anim = remse.animate([
      { transform: "translateY(0)" },
      { transform: `translateY(${slutt}px)` },
    ], { duration: 1300 + i * 650, easing: "cubic-bezier(.15,.85,.25,1.02)", fill: "forwards" });
    anim.onfinish = () => { remse.style.transform = `translateY(${slutt}px)`; anim.cancel(); ferdig(); };
  }));
  Promise.all(ventar).then(() => {
    spinn = false;
    maskin.classList.remove("spinn");
    let tekst;
    if (klasse.profil === "pb") tekst = `Du fekk <b>norsk hovudmål</b> (som alle), skriftleg i <b>${smaa(svar[1])}</b> og munnleg/praktisk i <b>${smaa(svar[2])}</b>.`;
    else if (klasse.profil === "vg2yf") tekst = svar[1] === "Ja" ? `Tverrfagleg eksamen – og du vart trekt ut i <b>${smaa(svar[2])}</b> i tillegg.` : `Berre <b>tverrfagleg eksamen</b> denne gongen. Slik går det for dei fleste.`;
    else tekst = svar[0] === "Ja" ? `Du vart trekt ut i <b>${smaa(svar[1])}</b>! Det skjer med om lag 1 av 5.` : `<b>Ikkje trekt ut</b> denne gongen. Slik går det for om lag 4 av 5.`;
    resultat.innerHTML = tekst;
    resultat.classList.remove("vis"); void resultat.offsetWidth; resultat.classList.add("vis");
    if (svar.includes("Ja") || klasse.profil === "pb") konfettiFraa(maskin);
  });
}
$("#trekk-knapp").addEventListener("click", trekk);
byggHjul();
const lagraKlasse = hent("eksamen:klasse", null);
if (lagraKlasse) velKlasse(lagraKlasse);

/* ── Hjelpemiddel-sortering ────────────────────────── */
const haug = $("#haug");
const sorter = $("#sorter");
const korger = $$(".korg", sorter);
let fane = 0;
let plasserte = 0;
let rette = 0;
function byggTing() {
  haug.innerHTML = "";
  korger.forEach((k) => ($(".boks", k).innerHTML = ""));
  plasserte = 0; rette = 0;
  TING.forEach((t, i) => {
    const el = document.createElement("div");
    el.className = "ting";
    el.dataset.i = i;
    el.innerHTML = `<span class="namn">${t.namn}<span class="forklaring" hidden></span></span><span class="val"><button class="ja" aria-label="${t.namn}: lov">${ikon("hake")}</button><button class="nei" aria-label="${t.namn}: ikkje lov">${ikon("kryss")}</button></span>`;
    $(".ja", el).addEventListener("click", () => plasser(el, "ja"));
    $(".nei", el).addEventListener("click", () => plasser(el, "nei"));
    el.addEventListener("pointerdown", startDreg);
    haug.appendChild(el);
  });
  oppdaterSortering();
}
function plasser(el, val) {
  if (el.closest(".korg")) return;
  const t = TING[el.dataset.i];
  const rett = t.svar[fane] === val;
  const korg = korger.find((k) => k.dataset.korg === val);
  flytt(el, $(".boks", korg));
  el.classList.add(rett ? "rett" : "feil");
  const f = $(".forklaring", el);
  f.hidden = false;
  f.textContent = (rett ? "Rett. " : `Feil – ${t.svar[fane] === "ja" ? "dette er lov" : "dette er ikkje lov"}. `) + t.kvifor[fane];
  plasserte++;
  if (rett) rette++;
  oppdaterSortering();
  if (plasserte === TING.length) {
    if (rette === TING.length) { toast("Alt rett – du kan reglane!"); konfettiFraa(sorter); }
    else toast(`${rette} av ${TING.length} rette. Prøv ein gong til?`);
  }
}
function oppdaterSortering() {
  $("#sorter-poeng").textContent = plasserte ? `${plasserte} av ${TING.length} sorterte · ${rette} rette` : `0 av ${TING.length} sorterte`;
}
$$("[data-fane]").forEach((b) => b.addEventListener("click", () => {
  fane = Number(b.dataset.fane);
  $$("[data-fane]").forEach((x) => x.setAttribute("aria-selected", String(x === b)));
  byggTing();
}));
$("#sorter-nullstill").addEventListener("click", byggTing);

let dreg = null;
function startDreg(e) {
  const el = e.currentTarget;
  if (e.target.closest("button") || el.closest(".korg") || e.button > 0) return;
  dreg = { el, x0: e.clientX, y0: e.clientY, aktiv: false, kopi: null, over: null };
  el.setPointerCapture(e.pointerId);
  el.addEventListener("pointermove", flyttDreg);
  el.addEventListener("pointerup", sluttDreg);
  el.addEventListener("pointercancel", sluttDreg);
}
function flyttDreg(e) {
  if (!dreg) return;
  const { el } = dreg;
  if (!dreg.aktiv) {
    if (Math.hypot(e.clientX - dreg.x0, e.clientY - dreg.y0) < 6) return;
    dreg.aktiv = true;
    const r = el.getBoundingClientRect();
    dreg.dx = dreg.x0 - r.left; dreg.dy = dreg.y0 - r.top;
    dreg.kopi = el.cloneNode(true);
    dreg.kopi.classList.add("dreg");
    dreg.kopi.style.width = r.width + "px";
    document.body.appendChild(dreg.kopi);
    el.classList.add("plasshaldar");
  }
  dreg.kopi.style.left = e.clientX - dreg.dx + "px";
  dreg.kopi.style.top = e.clientY - dreg.dy + "px";
  const under = document.elementFromPoint(e.clientX, e.clientY);
  const korg = under && under.closest(".korg");
  korger.forEach((k) => k.classList.toggle("over", k === korg));
  dreg.over = korg;
}
function sluttDreg() {
  if (!dreg) return;
  const { el, kopi, over, aktiv } = dreg;
  el.removeEventListener("pointermove", flyttDreg);
  el.removeEventListener("pointerup", sluttDreg);
  el.removeEventListener("pointercancel", sluttDreg);
  korger.forEach((k) => k.classList.remove("over"));
  if (kopi) kopi.remove();
  el.classList.remove("plasshaldar");
  dreg = null;
  if (aktiv && over) plasser(el, over.dataset.korg);
}
byggTing();

/* ── Eksamensdagen ─────────────────────────────────── */
const strekar = $("#klokkestrek");
for (let i = 0; i < 60; i++) {
  const v = i * 6 * Math.PI / 180;
  const lang = i % 5 === 0;
  const r1 = lang ? 78 : 83;
  const l = document.createElementNS("http://www.w3.org/2000/svg", "line");
  l.setAttribute("x1", 100 + Math.sin(v) * r1); l.setAttribute("y1", 100 - Math.cos(v) * r1);
  l.setAttribute("x2", 100 + Math.sin(v) * 88); l.setAttribute("y2", 100 - Math.cos(v) * 88);
  l.setAttribute("class", lang ? "strek" : "strek tynn");
  strekar.appendChild(l);
}
const dagliste = $("#dagliste");
const dagpunkt = $$("li", dagliste);
let dagSteg = -1;
let dagTimar = null;
function settKlokke(tid) {
  const [h, m] = tid.split(":").map(Number);
  const min = h * 60 + m;
  $("#viser-time").style.transform = `rotate(${min * .5}deg)`;
  $("#viser-min").style.transform = `rotate(${min * 6}deg)`;
  $("#digital").textContent = `${to(h)}:${to(m)}`;
}
function visDagSteg(i) {
  dagSteg = i;
  dagpunkt.forEach((li, j) => { li.classList.toggle("no", j === i); li.classList.toggle("gjort", j < i); });
  settKlokke(dagpunkt[i].dataset.tid);
}
function stoppDag() {
  clearInterval(dagTimar); dagTimar = null;
  dagliste.classList.remove("speler");
  $("#dag-spel").innerHTML = `${ikon("spel")}<span>Spel av dagen</span>`;
}
$("#dag-spel").addEventListener("click", () => {
  if (dagTimar) { stoppDag(); return; }
  dagliste.classList.add("speler");
  $("#dag-spel").innerHTML = `${ikon("pause")}<span>Pause</span>`;
  if (dagSteg >= dagpunkt.length - 1) dagSteg = -1;
  visDagSteg(dagSteg + 1);
  dagTimar = setInterval(() => {
    if (dagSteg >= dagpunkt.length - 1) { stoppDag(); konfettiFraa($(".klokke")); return; }
    visDagSteg(dagSteg + 1);
  }, 1700);
});
dagpunkt.forEach((li, i) => li.addEventListener("click", () => { stoppDag(); visDagSteg(i); }));
settKlokke("07:00");
$("#dagen").addEventListener("ut", stoppDag);

/* ── Sjekkliste ────────────────────────────────────── */
const boksar = $$("#sjekkliste-liste input");
const LAGER = "eksamen:sjekk";
let pakka;
try { pakka = new Set(JSON.parse(hent(LAGER, "[]"))); } catch (e) { pakka = new Set(); }
boksar.forEach((b) => (b.checked = pakka.has(b.dataset.id)));
function oppdaterSjekk(feire) {
  const tal = boksar.filter((b) => b.checked).length;
  const ring = $("#sjekk-ring");
  $(".fyll", ring).style.strokeDashoffset = 377 * (1 - tal / boksar.length);
  $("#sjekk-tal").textContent = `${tal}/${boksar.length}`;
  $("#sjekk-tekst").textContent = tal === boksar.length ? "klar for eksamen!" : "pakka";
  ring.classList.toggle("ferdig", tal === boksar.length);
  if (feire && tal === boksar.length) konfettiFraa(ring);
}
boksar.forEach((b) => b.addEventListener("change", () => {
  if (b.checked) pakka.add(b.dataset.id); else pakka.delete(b.dataset.id);
  lagre(LAGER, JSON.stringify([...pakka]));
  oppdaterSjekk(b.checked);
}));
$("#sjekk-nullstill").addEventListener("click", () => {
  boksar.forEach((b) => (b.checked = false));
  pakka.clear();
  lagre(LAGER, "[]");
  oppdaterSjekk(false);
});
oppdaterSjekk(false);

/* ── Timarar: presentasjon og lesetimar ────────────── */
function lagTimar(el) {
  const pomodoro = el.hasAttribute("data-pomodoro");
  const ring = $(".ring", el);
  const fyll = $(".fyll", ring);
  const vis = $(".vis", el);
  const fase = $(".fase", el);
  const startKnapp = $(".start", el);
  let minutt = Number(el.dataset.timar);
  let fokus = true;
  let okter = 0;
  let att = minutt * 60e3;
  let total = att;
  let slutt = null;
  let tikkar = null;
  const teikn = () => {
    const sek = Math.ceil(att / 1000);
    vis.textContent = `${to(Math.floor(sek / 60))}:${to(sek % 60)}`;
    fyll.style.strokeDashoffset = 377 * (1 - att / total);
  };
  const knapp = (gaar) => { startKnapp.innerHTML = gaar ? `${ikon("pause")}<span>Pause</span>` : `${ikon("spel")}<span>Start</span>`; };
  const stopp = () => { clearInterval(tikkar); tikkar = null; slutt = null; knapp(false); };
  const nullstill = () => {
    stopp();
    ring.classList.remove("slutt");
    att = total = minutt * 60e3;
    if (pomodoro) fase.textContent = fokus ? "fokus" : "pause";
    teikn();
  };
  const ferdig = () => {
    stopp();
    att = 0; teikn();
    if (navigator.vibrate) navigator.vibrate(200);
    if (!pomodoro) { ring.classList.add("slutt"); toast("Tida er ute!"); return; }
    if (fokus) {
      okter++;
      $(".okter", el).textContent = `${okter} ${okter === 1 ? "økt" : "økter"} fullførte`;
      konfettiFraa(ring);
      toast("Bra! Ta fem minutt pause.");
    } else toast("Pausen er over – ny økt!");
    fokus = !fokus;
    minutt = fokus ? 25 : 5;
    nullstill();
  };
  startKnapp.addEventListener("click", () => {
    if (tikkar) { att = Math.max(0, slutt - Date.now()); stopp(); return; }
    if (att <= 0) nullstill();
    ring.classList.remove("slutt");
    slutt = Date.now() + att;
    knapp(true);
    tikkar = setInterval(() => {
      att = Math.max(0, slutt - Date.now());
      teikn();
      if (att <= 0) ferdig();
    }, 200);
  });
  $(".nullstill", el).addEventListener("click", nullstill);
  $$("[data-sett]", el).forEach((b) => b.addEventListener("click", () => {
    minutt = Number(b.dataset.sett);
    $$("[data-sett]", el).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    nullstill();
  }));
  teikn();
}
$$(".timar").forEach(lagTimar);

/* ── Fusk: kortstokk ───────────────────────────────── */
const stokk = $("#stokk");
const fuskkort = $$(".fuskkort", stokk);
const fuskknappar = $("#fuskknappar");
let fuskRette = 0;
let fuskVist = null;
const ordneStokk = () => [...fuskkort].reverse().forEach((k) => stokk.appendChild(k));
ordneStokk();
function overstKort() { return $$(".fuskkort:not(.ute):not(.sluttkort)", stokk).pop(); }
function svarFusk(val) {
  const kort = overstKort();
  if (!kort) return;
  if (fuskVist === kort) { kastKort(kort, val); return; }
  const rett = kort.dataset.svar === val;
  if (rett) fuskRette++;
  kort.classList.add("vist");
  const dom = document.createElement("span");
  dom.className = "dom " + kort.dataset.svar;
  dom.textContent = (rett ? "Rett · " : "Feil · ") + (kort.dataset.svar === "fusk" ? "Fusk" : "Lov");
  kort.prepend(dom);
  fuskVist = kort;
  fuskknappar.innerHTML = `<button class="knapp primar" data-vidare="${val}">Neste kort${ikon("hogre")}</button>`;
  $("[data-vidare]", fuskknappar).focus();
}
function kastKort(kort, val) {
  kort.classList.add(val === "lov" ? "ut-hogre" : "ut-venstre", "ute");
  fuskVist = null;
  stokk.prepend(kort);
  setTimeout(() => { if (kort.classList.contains("ute")) kort.style.visibility = "hidden"; }, 550);
  if (!overstKort()) {
    const alle = fuskkort.length;
    const dom = fuskRette === alle ? "Full pott! Du kjenner reglane." : fuskRette >= alle - 2 ? "Godt jobba – sjå over dei du bomma på." : "Les reglane ein gong til – så tek du ein ny runde.";
    stokk.insertAdjacentHTML("beforeend", `<div class="fuskkort sluttkort"><p class="sluttal">${fuskRette}<small>/${alle}</small></p><p class="spm">${dom}</p></div>`);
    fuskknappar.innerHTML = `<button class="knapp" data-stokk-igjen>${ikon("nullstill")}Ta runden på nytt</button>`;
    if (fuskRette === alle) konfettiFraa(stokk);
  } else visFuskKnappar();
}
function visFuskKnappar() {
  fuskknappar.innerHTML = `<button class="knapp fusk" data-val="fusk">${ikon("kryss")}Fusk</button><button class="knapp lov" data-val="lov">${ikon("hake")}Lov</button>`;
}
fuskknappar.addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  if (b.dataset.val) svarFusk(b.dataset.val);
  else if (b.dataset.vidare) kastKort(overstKort(), b.dataset.vidare);
  else if (b.hasAttribute("data-stokk-igjen")) stokkIgjen();
});
function stokkIgjen() {
  fuskRette = 0; fuskVist = null;
  $$(".sluttkort", stokk).forEach((k) => k.remove());
  fuskkort.forEach((k) => {
    k.classList.remove("vist", "ute", "ut-hogre", "ut-venstre");
    k.style.visibility = ""; k.style.transform = "";
    const dom = $(".dom", k); if (dom) dom.remove();
  });
  ordneStokk();
  visFuskKnappar();
}
/* Dra det øvste kortet til sides: venstre = fusk, høgre = lov */
let kortdreg = null;
stokk.addEventListener("pointerdown", (e) => {
  const kort = e.target.closest(".fuskkort");
  if (!kort || kort !== overstKort() || e.button > 0) return;
  kortdreg = { kort, x0: e.clientX, dx: 0 };
  kort.setPointerCapture(e.pointerId);
  kort.style.transition = "none";
});
stokk.addEventListener("pointermove", (e) => {
  if (!kortdreg) return;
  kortdreg.dx = e.clientX - kortdreg.x0;
  kortdreg.kort.style.transform = `translateX(${kortdreg.dx}px) rotate(${kortdreg.dx / 18}deg)`;
});
const sluttKortdreg = () => {
  if (!kortdreg) return;
  const { kort, dx } = kortdreg;
  kortdreg = null;
  kort.style.transition = "";
  kort.style.transform = "";
  if (Math.abs(dx) > 90) {
    const val = dx > 0 ? "lov" : "fusk";
    if (fuskVist === kort) kastKort(kort, val); else svarFusk(val);
  }
};
stokk.addEventListener("pointerup", sluttKortdreg);
stokk.addEventListener("pointercancel", sluttKortdreg);

/* ── Sjuk-flyt ─────────────────────────────────────── */
const sjukflyt = $("#sjukflyt");
$$("[data-sjuk]").forEach((b) => b.addEventListener("click", () => {
  $$("[data-sjuk]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  const steg = SJUK[b.dataset.sjuk];
  sjukflyt.innerHTML = steg.map((s, i) => `${i ? '<div class="flytpil" aria-hidden="true"></div>' : ""}<div class="flytsteg ${s.type || ""}" style="animation-delay:${i * 140}ms"><span class="ikon">${ikon(s.ikon)}</span><div><h3>${s.tittel}</h3><p>${s.tekst}</p></div></div>`).join("");
}));

/* ── Karakterskala ─────────────────────────────────── */
const skalatekst = $("#skalatekst");
const standardSkala = skalatekst.textContent;
$$("#skala button").forEach((b) => {
  const vis = () => {
    $$("#skala button").forEach((x) => x.classList.toggle("valt", x === b));
    skalatekst.innerHTML = `<b>${b.textContent.trim()}:</b> ${b.dataset.tekst}`;
  };
  b.addEventListener("mouseenter", vis);
  b.addEventListener("focus", vis);
  b.addEventListener("click", vis);
});
$("#skala").addEventListener("mouseleave", () => {
  $$("#skala button").forEach((x) => x.classList.remove("valt"));
  skalatekst.textContent = standardSkala;
});

/* ── Klagefrist ────────────────────────────────────── */
$("#klagedato").addEventListener("change", (e) => {
  const v = e.target.value;
  const svar = $("#klagesvar");
  if (!v) { svar.textContent = "Vel ein dato, så reknar vi ut fristen."; return; }
  const [y, m, d] = v.split("-").map(Number);
  const frist = new Date(y, m - 1, d + 10);
  svar.innerHTML = `Siste dag å klage: <b>${DAGAR[frist.getDay()]} ${frist.getDate()}. ${MND[frist.getMonth()]}</b>. Sjekk fristen med skulen.`;
  svar.classList.remove("byt"); void svar.offsetWidth; svar.classList.add("byt");
});

/* ── Quiz ──────────────────────────────────────────── */
const sporsmal = $$(".sporsmal");
const quizframdrift = $("#quizframdrift");
const quizNeste = $("#quiz-neste");
const forklaring = $("#quizforklaring");
let qNo = 0;
let poeng = 0;
sporsmal.forEach((sp) => {
  quizframdrift.appendChild(document.createElement("i"));
  $$(".alternativ button", sp).forEach((b, i) => {
    b.insertAdjacentHTML("afterbegin", `<span class="bokstav">${"ABCD"[i]}</span>`);
    b.addEventListener("click", () => svarQuiz(sp, i));
  });
});
const prikkar = $$("i", quizframdrift);
function visSporsmal(i) {
  qNo = i;
  sporsmal.forEach((sp, j) => sp.classList.toggle("vis", j === i));
  prikkar.forEach((p, j) => p.classList.toggle("no", j === i));
  forklaring.classList.remove("vis");
  quizNeste.hidden = true;
}
function svarQuiz(sp, i) {
  const knappar = $$(".alternativ button", sp);
  if (knappar[0].disabled) return;
  const rett = Number(sp.dataset.rett);
  knappar.forEach((b, j) => {
    b.disabled = true;
    if (j === rett) b.classList.add("rett");
    else if (j === i) b.classList.add("feil");
    else b.classList.add("dimma");
  });
  const ok = i === rett;
  if (ok) {
    poeng++;
    const p = $("#quizpoeng");
    p.textContent = poeng;
    p.classList.remove("sprett"); void p.offsetWidth; p.classList.add("sprett");
  }
  prikkar[qNo].classList.remove("no");
  prikkar[qNo].classList.add(ok ? "rett" : "feil");
  forklaring.innerHTML = `<b>${ok ? "Rett!" : "Ikkje heilt."}</b> ${sp.dataset.forklaring}`;
  forklaring.classList.add("vis");
  quizNeste.innerHTML = qNo === sporsmal.length - 1 ? `Sjå resultatet${ikon("stjerne")}` : `Neste spørsmål${ikon("hogre")}`;
  quizNeste.hidden = false;
  quizNeste.focus();
}
quizNeste.addEventListener("click", () => {
  if (qNo < sporsmal.length - 1) { visSporsmal(qNo + 1); return; }
  sporsmal.forEach((sp) => sp.classList.remove("vis"));
  forklaring.classList.remove("vis");
  quizNeste.hidden = true;
  $("#quizresultat").textContent = `${poeng}/${sporsmal.length}`;
  $("#quizdom").textContent = poeng === sporsmal.length ? "Full pott – du er klar!" : poeng >= 6 ? "Kjempebra! Du har kontroll." : poeng >= 4 ? "Godt på veg – sjå over det du bomma på." : "Bla tilbake og les deg opp – så prøver du igjen!";
  $("#quizslutt").classList.add("vis");
  if (poeng >= 6) konfettiFraa($("#quizresultat"));
});
$("#quiz-igjen").addEventListener("click", () => {
  poeng = 0;
  $("#quizpoeng").textContent = "0";
  $("#quizslutt").classList.remove("vis");
  prikkar.forEach((p) => p.className = "");
  sporsmal.forEach((sp) => $$(".alternativ button", sp).forEach((b) => { b.disabled = false; b.classList.remove("rett", "feil", "dimma"); }));
  visSporsmal(0);
});
visSporsmal(0);

/* ── Spørsmål og svar: søk ─────────────────────────── */
const faq = $$("#faq details");
faq.forEach((d) => { d.dataset.original = $("summary", d).textContent; });
const vask = (s) => s.toLocaleLowerCase("nn").normalize("NFC");
const trygg = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
$("#faq-sok").addEventListener("input", (e) => {
  const q = vask(e.target.value.trim());
  let treff = 0;
  faq.forEach((d) => {
    const sum = $("summary", d);
    const original = d.dataset.original;
    const finst = !q || vask(d.textContent).includes(q);
    d.hidden = !finst;
    if (finst) treff++;
    if (q && finst) {
      const i = vask(original).indexOf(q);
      sum.innerHTML = i >= 0 ? trygg(original.slice(0, i)) + "<mark>" + trygg(original.slice(i, i + q.length)) + "</mark>" + trygg(original.slice(i + q.length)) : trygg(original);
    } else sum.textContent = original;
  });
  $("#faq-ingen").style.display = treff ? "none" : "block";
});

/* ── Skriv ut ──────────────────────────────────────── */
$("#knapp-skriv").addEventListener("click", () => print());

/* ── Start ─────────────────────────────────────────── */
const fraAdresse = finn(location.hash.slice(1));
gaaTil(fraAdresse >= 0 ? fraAdresse : 0, { utanAdresse: fraAdresse < 0 });
})();

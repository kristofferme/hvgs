/* ==========================================================================
   EKSAMEN VÅREN 2026 – motoren
   Tidslinjen ER presentasjonen: én sammenhengende verden med en rute (SVG),
   stoppesteder (HTML som følger kameraet) og scener som lander på hvert stopp.
   Innholdet hentes fra innhold.js (window.EKSAMEN). Ingen eksterne avhengigheter.
   ========================================================================== */
(function () {
  "use strict";

  const D = window.EKSAMEN;
  const doc = document, root = doc.documentElement, body = doc.body;
  // Fila slik den ble lastet – brukes når plassholderne lagres inn i en ny fil.
  const ORIGINAL = "<!doctype html>\n" + root.outerHTML;
  const $ = (s, r = doc) => r.querySelector(s);
  const $$ = (s, r = doc) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  /* ---------------------------------------------------------------------
     Lagring per seer (sjekklister, valg). Tåler at lagring er blokkert.
     --------------------------------------------------------------------- */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("hvgs-eks26:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("hvgs-eks26:" + k, JSON.stringify(v)); } catch (e) { /* ignorer */ } },
  };

  /* ---------------------------------------------------------------------
     Plassholdere. Hver [[…]] får en fast nøkkel. Verdier kommer fra fila
     (<script id="lokalt">) og fra det som er fylt inn i denne nettleseren.
     --------------------------------------------------------------------- */
  const LOKALT_FIL = (() => { try { const el = doc.getElementById("lokalt"); return el ? JSON.parse(el.textContent || "{}") : {}; } catch (e) { return {}; } })();
  let LOKALT = Object.assign({}, LOKALT_FIL, store.get("lokalt", {}));
  const PH = [];
  (function tagg(o, path) {
    Object.keys(o).forEach((k) => {
      const v = o[k], p = path ? `${path}.${k}` : k;
      if (typeof v === "string") {
        if (v.indexOf("[[") < 0) return;
        let n = 0;
        const list = [];
        o[k] = v.replace(/\[\[(.+?)\]\]/g, (_, t) => { const key = `${p}~${n++}`; list.push({ key, tekst: t, path: p, obj: o, prop: k }); return `[[#${key}|${t}]]`; });
        PH.push(...list);
      } else if (v && typeof v === "object") tagg(v, p);
    });
  })(D, "");
  const phVerdi = (key) => (key && LOKALT[key]) || "";
  const igjen = () => PH.filter((p) => !phVerdi(p.key)).length;

  /* ---------------------------------------------------------------------
     Tekst
     --------------------------------------------------------------------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  function fmt(s) {
    if (s == null) return "";
    return esc(s)
      .replace(/\[\[(?:#([^|]+)\|)?(.+?)\]\]/g, (_, key, t) => {
        const kAttr = key ? ` data-ph="${key}"` : "";
        const v = phVerdi(key);
        if (v) return `<span class="ph-v"${kAttr}>${esc(v)}</span>`;
        const m = t.match(/^Fyll inn:?\s*(.*)$/i);
        const lbl = m ? "Fyll inn" : "Bekreft";
        const txt = m ? m[1] : t;
        return `<span class="ph"${kAttr} title="Plassholder – tast R og klikk for å fylle inn"><b>${lbl}</b>${txt ? `<span>${txt}</span>` : ""}</span>`;
      })
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  }
  const plain = (s) => String(s || "").replace(/\[\[(?:#([^|]+)\|)?(?:Fyll inn:?\s*)?(.*?)\]\]/gi, (_, key, t) => phVerdi(key) || t).replace(/\*\*/g, "");
  const TAGNAVN = { nasjonal: "Nasjonal regel", lokal: "Lokal rutine", tips: "Tips" };
  const tag = (t, k) => (t ? `<span class="tag t-${t}">${TAGNAVN[t]}${k ? '<em>Kontroller</em>' : ""}</span>` : "");
  const src = (key) => {
    const k = key && D.KILDER[key];
    return k ? `<a class="src" href="${esc(k.url)}" target="_blank" rel="noopener">${esc(k.navn)}</a>` : "";
  };
  const R = Object.fromEntries(D.ROLLER.map((r) => [r.id, r]));
  const FORM = Object.fromEntries(D.FORMER.map((f) => [f.id, f]));
  const ALLE_FORMER = D.FORMER.map((f) => f.id);
  const UKEDAG = ["søn", "man", "tir", "ons", "tor", "fre", "lør"];
  const MND = ["januar", "februar", "mars", "april", "mai", "juni", "juli", "august", "september", "oktober", "november", "desember"];
  const isoDate = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const dagerMellom = (a, b) => Math.round((isoDate(b) - isoDate(a)) / 864e5);

  /* ---------------------------------------------------------------------
     Verdensgeometri. 1 enhet = 1 px ved zoom 1 på en 1920×1080-skjerm.
     --------------------------------------------------------------------- */
  const Y0 = 5200;                 // hovedsporets høyde (horisontale kapitler)
  const X1 = 2600;                 // kapittel 1 går loddrett ned her
  const XE = 27300;                // epilogen går loddrett opp her
  const HUMPS = [21100, 22100, 23100, 24100, 25100, 26100]; // hindringene i kapittel 5
  const HUMP_H = 240;
  const MAI0 = 5600, MAI_STEG = 250; // 4. mai ligger på x = MAI0
  const LANE = 420, LANE_A = 12300, LANE_B = 18100; // forgreningen i kapittel 3
  const KRYSS = 19100;

  const TRUNK = [[-700, 0], [X1, 0, 700], [X1, Y0, 700]];
  HUMPS.forEach((x) => TRUNK.push([x - 280, Y0, 130], [x - 110, Y0 - HUMP_H, 110], [x + 110, Y0 - HUMP_H, 110], [x + 280, Y0, 130]));
  TRUNK.push([XE, Y0, 700], [XE, 700]);
  const LANE_U = [[LANE_A, Y0], [LANE_A + 600, Y0 - LANE, 330], [LANE_B - 600, Y0 - LANE, 330], [LANE_B, Y0]];
  const LANE_D = LANE_U.map(([x, y, r]) => [x, y === Y0 ? Y0 : Y0 + LANE, r]);
  const LANE_M = [[LANE_A + 600, Y0], [LANE_B - 600, Y0]];
  const CROSS = [[KRYSS, Y0 - 1500], [KRYSS, Y0 + 1500]];
  const BBOX = { x0: -700, y0: -200, x1: XE + 200, y1: Y0 + 700 };

  function roundPath(pts) {
    let d = `M${pts[0][0]},${pts[0][1]}`;
    for (let i = 1; i < pts.length - 1; i++) {
      const [x, y, r = 0] = pts[i], [px, py] = pts[i - 1], [nx, ny] = pts[i + 1];
      const l1 = Math.hypot(x - px, y - py), l2 = Math.hypot(nx - x, ny - y);
      const rr = Math.min(r, l1 / 2, l2 / 2);
      const ax = x + ((px - x) / l1) * rr, ay = y + ((py - y) / l1) * rr;
      const bx = x + ((nx - x) / l2) * rr, by = y + ((ny - y) / l2) * rr;
      d += ` L${ax},${ay} Q${x},${y} ${bx},${by}`;
    }
    const l = pts[pts.length - 1];
    return d + ` L${l[0]},${l[1]}`;
  }

  /* ---------------------------------------------------------------------
     Reisen: alle stopp i rekkefølge.
     kap: 0 prolog · 1–5 kapitler · 6 epilog
     lay: hvor sporet ligger på skjermen (styrer komposisjonen)
     --------------------------------------------------------------------- */
  const ST = [];
  const st = (id, kap, scene, x, y, o = {}) => ST.push(Object.assign({ id, kap, scene, x, y }, o));
  const mx = (iso) => MAI0 + (isoDate(iso) - isoDate("2026-05-04")) / 864e5 * MAI_STEG;

  st("p-2026", 0, "prolog", 0, 0, { lay: "center", t: "Eksamen våren 2026", d: "2026", hd: "Våren 2026",
    cams: [{ x: 0 }, { x: 1000 }, { x: 2350 }], lx: [1150, 1700, 2350] });
  st("p-kart", 0, "kart", 1900, 0, { lay: "overview", t: "Kartet over reisen", d: "Kart", hd: "Januar – juni" });
  st("k1-portal", 1, "portal", X1, 750, { lay: "v-left", t: "Før eksamen", d: "01", hd: "Januar – april" });
  st("k1-tilrettelegging", 1, "milepael", X1, 1350, { lay: "v-left", data: "tilrettelegging", t: "Særskilt tilrettelegging", d: "01.02", hd: "Søknadsfrist 1. februar" });
  st("k1-nyordning", 1, "nyordning", X1, 1950, { lay: "v-left", t: "Ny eksamensordning", d: "Nytt", hd: "Gjelder fra våren 2026" });
  st("k1-seb", 1, "seb", X1, 2550, { lay: "v-left", t: "Sikker nettleser", d: "SEB", hd: "Safe Exam Browser", former: ["skriftlig"] });
  st("k1-teknisk", 1, "teknisk", X1, 3150, { lay: "v-left", data: "teknisk", t: "Er maskinen klar?", d: "Test", hd: "Før eksamen", former: ["skriftlig"] });
  st("k1-info", 1, "milepael", X1, 3750, { lay: "v-left", data: "info", t: "Informasjon til elevene", d: "Info", hd: "Før eksamen" });
  st("k1-standpunkt", 1, "standpunkt", X1, 4350, { lay: "v-left", data: "standpunkt", t: "Standpunkt", d: "Ny", hd: "Nytt i 2026" });
  st("k1-trekk", 1, "trekk", 3800, Y0, { lay: "h-bottom", t: "Trekket", d: "28.04", hd: "28. april · kl. 09:00", tema: "dark", stor: true });
  st("k2-portal", 2, "portal", 4500, Y0, { lay: "h-bottom", t: "Skriftlig eksamen", d: "02", hd: "4.–21. mai" });
  st("k2-tall", 2, "tall", 5050, Y0, { lay: "h-bottom", t: "Perioden i tall", d: "Tall", hd: "4.–21. mai" });
  st("k2-kalender", 2, "kalender", 5340, Y0, { lay: "h-bottom", t: "Eksamensdagene", d: "Mai", hd: "4.–21. mai", kal: true });
  st("k2-simulering", 2, "simulering", mx("2026-05-05"), Y0, { lay: "h-bottom", t: "En eksamensdag", d: "05.05", hd: "Tirsdag 5. mai" });
  st("k2-ansvar", 2, "swim", 10500, Y0, { lay: "h-bottom", data: "skriftlig", t: "Før, under, etter", d: "Ansvar", hd: "Skriftlig eksamen" });
  st("k2-teknisk", 2, "rutine", 11250, Y0, { lay: "h-bottom", t: "Når teknikken svikter", d: "Rutine", hd: "Skriftlig eksamen" });
  st("k3-portal", 3, "portal", 11900, Y0, { lay: "lanes", t: "Muntlig og praktisk eksamen", d: "03", hd: "Etter skriftlig periode" });
  st("k3-spor", 3, "spor", 13300, Y0, { lay: "lanes", t: "Tre eksamensformer", d: "Spor", hd: "Muntlig · muntlig-praktisk · praktisk" });
  st("k3-trekk", 3, "trekkmuntlig", 14000, Y0, { lay: "lanes", t: "Trekk og kunngjøring", d: "28.04", hd: "Trekk 28. april" });
  st("k3-forberedelse", 3, "forberedelse", 14700, Y0, { lay: "lanes", t: "Forberedelse", d: "24 t", hd: "Forberedelsesdelen" });
  st("k3-gjennomforing", 3, "gjennomforing", 15400, Y0, { lay: "lanes", t: "Eksamenstid", d: "Tid", hd: "Eksamenstid" });
  st("k3-parti", 3, "parti", 16100, Y0, { lay: "lanes", cam: { ay: 0.84 }, t: "Partier og sensorer", d: "5–7", hd: "Partier og sensorer" });
  st("k3-sensur", 3, "sensur", 16800, Y0, { lay: "lanes", cam: { ay: 0.86 }, t: "Vurdering og sensur", d: "Sensur", hd: "Vurdering og sensur" });
  st("k3-ansvar", 3, "swim", 17450, Y0, { lay: "lanes", cam: { ay: 0.9 }, data: "muntlig", t: "Ansvarsfordeling", d: "Ansvar", hd: "Muntlig og praktisk eksamen" });
  st("k4-roller", 4, "roller", KRYSS, Y0, { lay: "cross", t: "Roller og ansvar", d: "04", hd: "Hele perioden", former: ALLE_FORMER });
  st("k5-intro", 5, "hindringer", 20100, Y0, { lay: "hump", t: "Når noe ikke går som planlagt", d: "05", hd: "Når som helst" });
  const SCEN_FORM = { sent: ["skriftlig"], syk: ALLE_FORMER, teknisk: ["skriftlig"], hjelpemidler: ["skriftlig"], regelverk: ["skriftlig"], sensor: ["muntlig", "muntlig-praktisk", "praktisk"] };
  D.SCENARIOER.forEach((sc, i) => st("k5-" + sc.id, 5, "scenario", HUMPS[i], Y0 - HUMP_H, { lay: "hump", data: sc.id, t: sc.tittel, d: sc.nr, hd: "Hindring " + sc.nr, former: SCEN_FORM[sc.id] }));
  st("e-datoer", 6, "datoer", XE, 4300, { lay: "v-right", t: "De viktigste datoene", d: "Datoer", hd: "Oppsummering" });
  st("e-ansvar", 6, "ansvarsum", XE, 3600, { lay: "v-right", t: "De viktigste ansvarsområdene", d: "Ansvar", hd: "Oppsummering" });
  st("e-feil", 6, "feil", XE, 2900, { lay: "v-right", t: "Feil vi skal unngå", d: "Feil", hd: "Oppsummering" });
  st("e-hjelp", 6, "hjelp", XE, 2200, { lay: "v-right", t: "Her finner du hjelp", d: "Hjelp", hd: "Oppsummering" });
  st("e-slutt", 6, "slutt", XE, 1500, { lay: "center", t: "Vi er i mål", d: "Mål", hd: "Våren 2026", tema: "dark", stor: true, cams: [{}, { overview: true }] });

  const TEMA_KAP = ["dark", "light", "dark", "dark", "light", "dark", "light"];
  const FORM_KAP = { 0: ALLE_FORMER, 1: ALLE_FORMER, 2: ["skriftlig"], 3: ["muntlig", "muntlig-praktisk", "praktisk"], 4: ALLE_FORMER, 5: ALLE_FORMER, 6: ALLE_FORMER };
  const IDX = {};
  ST.forEach((s, i) => {
    IDX[s.id] = i;
    s.tema = s.tema || TEMA_KAP[s.kap];
    const m = s.data && D.MILEPAELER[s.data];
    s.former = s.former || (m && m.former) || FORM_KAP[s.kap];
    s.roller = new Set((m && m.roller) || []);
  });
  D.ROLLER.forEach((r) => r.oppgaver.forEach((o) => { if (IDX[o.stopp] != null) ST[IDX[o.stopp]].roller.add(r.id); }));
  ST.filter((s) => s.kap === 4 || s.kap === 6 || s.kap === 0).forEach((s) => D.ROLLER.forEach((r) => s.roller.add(r.id)));

  /* ---------------------------------------------------------------------
     DOM-lag
     --------------------------------------------------------------------- */
  const SVGNS = "http://www.w3.org/2000/svg";
  const app = $("#app");
  const svg = $("#track"), gCam = $("#cam");
  const nodesEl = $("#nodes"), parEl = $("#parallax"), stage = $("#stage");
  const hud = $("#hud"), ubar = $("#ubar"), panel = $("#panel"), help = $("#help");
  const mkPath = (d, cls) => { const p = doc.createElementNS(SVGNS, "path"); p.setAttribute("d", d); p.setAttribute("class", cls); p.setAttribute("vector-effect", "non-scaling-stroke"); gCam.appendChild(p); return p; };

  const dTrunk = roundPath(TRUNK);
  mkPath(dTrunk, "rt-base");
  const pLaneU = mkPath(roundPath(LANE_U), "rt-lane l-mp");
  const pLaneD = mkPath(roundPath(LANE_D), "rt-lane l-pr");
  const pLaneM = mkPath(roundPath(LANE_M), "rt-lane l-mu");
  const pCross = mkPath(roundPath(CROSS), "rt-cross");
  const pProg = mkPath(dTrunk, "rt-prog");
  const TOTAL = pProg.getTotalLength();
  const LEN = { u: pLaneU.getTotalLength(), d: pLaneD.getTotalLength(), m: pLaneM.getTotalLength(), c: pCross.getTotalLength() };

  // Prøvepunkter langs hovedsporet: brukes til å finne hvor langt linja skal tegnes.
  const SAMPLES = [];
  for (let l = 0; l <= TOTAL; l += 16) { const p = pProg.getPointAtLength(l); SAMPLES.push([l, p.x, p.y]); }
  function lenAt(x, y) {
    let best = 0, bd = Infinity;
    for (const [l, sx, sy] of SAMPLES) { const d = (sx - x) ** 2 + (sy - y) ** 2; if (d < bd) { bd = d; best = l; } }
    return best;
  }
  ST.forEach((s) => (s.L = lenAt(s.x, s.y)));

  /* ---------------------------------------------------------------------
     Kamera
     cam = { cx, cy, z } – verdenspunktet midt på skjermen og zoom.
     --------------------------------------------------------------------- */
  let W = 1920, H = 1080, S = 1;
  let RM = store.get("rolig", null);
  if (RM == null) RM = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const cam = { cx: 0, cy: 0, z: 1 };
  let prog = 0, tween = null, dirty = true;

  function measure() {
    W = innerWidth; H = innerHeight;
    S = clamp(Math.min(W / 1920, H / 1080), 0.38, 2.2);
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    root.classList.toggle("portrett", W < H * 1.05);
    dirty = true;
  }
  function anchors(lay) {
    const p = W < H * 1.05;
    switch (lay) {
      case "v-left": return { ax: p ? 0.06 : 0.16, ay: 0.5, z: 1 };
      case "v-right": return { ax: p ? 0.94 : 0.84, ay: 0.5, z: 1 };
      case "h-bottom": return { ax: p ? 0.08 : 0.12, ay: p ? 0.93 : 0.85, z: 1 };
      case "lanes": return { ax: p ? 0.06 : 0.1, ay: p ? 0.86 : 0.72, z: p ? 0.2 : 0.34 };
      case "cross": return { ax: 0.5, ay: 0.5, z: 1 };
      case "hump": return { ax: p ? 0.1 : 0.15, ay: p ? 0.92 : 0.82, z: 1 };
      default: return { ax: 0.5, ay: 0.5, z: 1 };
    }
  }
  function camOverview(extraTop) {
    const bw = BBOX.x1 - BBOX.x0, bh = BBOX.y1 - BBOX.y0;
    const z = Math.min((W * 0.9) / bw, (H * (extraTop ? 0.56 : 0.7)) / bh);
    return { cx: (BBOX.x0 + BBOX.x1) / 2, cy: (BBOX.y0 + BBOX.y1) / 2 - (H * (extraTop ? 0.1 : 0.04)) / z, z, ax: 0.5, ay: 0.5 };
  }
  function camTarget(s, step) {
    const c = Object.assign({}, s.cam || {}, (s.cams && s.cams[step]) || {});
    if (s.lay === "overview" || c.overview) return camOverview(true);
    const a = anchors(s.lay);
    let z = (c.z || a.z) * S;
    let ax = c.ax != null ? c.ax : a.ax, ay = c.ay != null ? c.ay : a.ay;
    let wx = c.x != null ? c.x : s.x, wy = c.y != null ? c.y : s.y;
    if (s.kal) { // hele mai skal få plass
      const span = 17 * MAI_STEG + 500;
      z = Math.min((W * 0.92) / span, 0.6 * S);
      wx = MAI0 + (17 * MAI_STEG) / 2; ax = 0.5; ay = root.classList.contains("portrett") ? 0.9 : 0.8;
    }
    return { cx: wx + (0.5 - ax) * (W / z), cy: wy + (0.5 - ay) * (H / z), z, ax, ay, wx, wy };
  }
  function progTarget(s, step) {
    if (s.cams && s.cams[step] && s.cams[step].overview) return TOTAL;
    if (s.lx) return lenAt(s.lx[step] != null ? s.lx[step] : s.x, s.y);
    return s.L;
  }
  const project = (x, y, c = cam) => [(x - c.cx) * c.z + W / 2, (y - c.cy) * c.z + H / 2];

  function flyTo(t, dur, p1) {
    if (dur <= 0) { cam.cx = t.cx; cam.cy = t.cy; cam.z = t.z; prog = p1; tween = null; dirty = true; return; }
    const from = { cx: cam.cx, cy: cam.cy, z: cam.z };
    const dist = Math.hypot(t.cx - from.cx, t.cy - from.cy);
    const zmin = Math.min(from.z, t.z);
    const zfit = (Math.min(W, H) * 1.4) / Math.max(dist, 1);
    const bump = dist * zmin > W * 1.6 ? Math.max(0, Math.log(zmin / zfit)) * 0.85 : 0;
    tween = { from, t, p0: prog, p1, t0: performance.now(), dur, bump };
  }
  function durFor(t) {
    if (RM) return 0;
    const dist = Math.hypot(t.cx - cam.cx, t.cy - cam.cy) * Math.min(cam.z, t.z);
    const dz = Math.abs(Math.log(t.z / cam.z));
    return clamp(620 + Math.sqrt(dist) * 13 + dz * 320, 650, 2100);
  }

  /* ---------------------------------------------------------------------
     Noder som følger kameraet: stoppesteder, maidager, månedsnavn.
     --------------------------------------------------------------------- */
  const NODES = [];
  const addNode = (el, x, y, layer = nodesEl, depth = 1) => { layer.appendChild(el); const n = { el, x, y, depth, vis: true }; NODES.push(n); return n; };
  const html = (s) => { const t = doc.createElement("template"); t.innerHTML = s.trim(); return t.content.firstElementChild; };

  ST.forEach((s, i) => {
    const el = html(`<button class="stn ${/^v-/.test(s.lay) ? "o-v" : "o-h"}${s.stor ? " stor" : ""}" data-i="${i}" aria-label="${esc(s.t)}"><i></i><span class="stn-d">${esc(s.d)}</span><span class="stn-t">${esc(s.t)}</span></button>`);
    s.node = addNode(el, s.x, s.y);
  });
  // Maidagene: én hake per dag fra 4. til 21. mai
  const KAL = {};
  D.KALENDER.forEach((k) => (KAL[k.dato] = k));
  for (let i = 0; i < 18; i++) {
    const dt = new Date(2026, 4, 4 + i);
    const iso = `2026-05-${String(4 + i).padStart(2, "0")}`;
    const k = KAL[iso], we = dt.getDay() === 0 || dt.getDay() === 6;
    const fag = k && k.fag ? k.fag : [];
    const el = html(`<button class="tick${we ? " we" : ""}${k && k.fri ? " fri" : ""}${fag.length ? " ex" : ""}" data-dato="${iso}" tabindex="-1" aria-label="${dt.getDate()}. mai">
      <span class="tk-f">${k && k.fri ? `<em>${esc(k.fri)}</em>` : fag.map(([kode, navn]) => `<span>${esc(navn)}</span>`).join("")}</span>
      <i></i><span class="tk-d">${dt.getDate()}</span><span class="tk-w">${UKEDAG[dt.getDay()]}</span></button>`);
    addNode(el, MAI0 + i * MAI_STEG, Y0);
  }
  // Store, svake månedsnavn i bakgrunnen – parallakse gir dybde
  [["Januar – april", X1 + 1500, 2500, "v", 1], ["Mai", MAI0 + 2100, Y0 - 900, "h", 2], ["Juni", XE - 1800, 2600, "v", 6]].forEach(([t, x, y, o, k]) =>
    addNode(html(`<div class="par par-${o} pk-${k}">${esc(t)}</div>`), x, y, parEl, 0.55));
  // Navn på sporene i kapittel 3
  [["Muntlig-praktisk", -LANE, "l-mp"], ["Muntlig", 0, "l-mu"], ["Praktisk", LANE, "l-pr"]].forEach(([t, dy, c]) =>
    addNode(html(`<div class="lane-tag ${c}">${esc(t)}</div>`), LANE_A + 900, Y0 + dy));

  /* ---------------------------------------------------------------------
     Tegnesløyfa
     --------------------------------------------------------------------- */
  let wa = []; // verdensforankrede elementer i scenen
  function frame(now) {
    if (tween) {
      const tt = clamp((now - tween.t0) / tween.dur, 0, 1), e = ease(tt);
      cam.cx = lerp(tween.from.cx, tween.t.cx, e);
      cam.cy = lerp(tween.from.cy, tween.t.cy, e);
      cam.z = Math.exp(lerp(Math.log(tween.from.z), Math.log(tween.t.z), e) - tween.bump * Math.sin(Math.PI * e));
      prog = lerp(tween.p0, tween.p1, easeOut(tt));
      if (tt >= 1) tween = null;
      dirty = true;
    }
    if (dirty) { render(); dirty = false; }
    requestAnimationFrame(frame);
  }
  function render() {
    const z = cam.z, tx = W / 2 - cam.cx * z, ty = H / 2 - cam.cy * z;
    gCam.setAttribute("transform", `matrix(${z} 0 0 ${z} ${tx} ${ty})`);
    pProg.style.strokeDasharray = `${Math.max(0.01, prog)} ${TOTAL + 50}`;
    const jx = SAMPLES[Math.min(SAMPLES.length - 1, Math.round(prog / 16))][1];
    const fl = clamp((jx - LANE_A) / (LANE_B - LANE_A), 0, 1);
    pLaneU.style.strokeDasharray = `${fl * LEN.u} ${LEN.u + 50}`;
    pLaneD.style.strokeDasharray = `${fl * LEN.d} ${LEN.d + 50}`;
    pLaneM.style.strokeDasharray = `${clamp((jx - LANE_A - 600) / (LANE_B - LANE_A - 1200), 0, 1) * LEN.m} ${LEN.m + 50}`;
    const fc = clamp((jx - (KRYSS - 300)) / 300, 0, 1);
    pCross.style.strokeDasharray = `${fc * LEN.c} ${LEN.c + 50}`;
    pCross.style.strokeDashoffset = `${-(1 - fc) * LEN.c * 0.5}`;
    nodesEl.style.setProperty("--tw", `${Math.max(40, MAI_STEG * z - 8)}px`);
    const lod = z < 0.11 * S ? "far" : z < 0.3 * S ? "mid" : "near";
    if (nodesEl.dataset.lod !== lod) nodesEl.dataset.lod = lod;
    const place = (n, sx, sy) => {
      const vis = sx > -400 && sx < W + 400 && sy > -300 && sy < H + 300;
      if (vis !== n.vis) { n.el.style.visibility = vis ? "" : "hidden"; n.vis = vis; }
      if (vis) n.el.style.transform = `translate3d(${sx.toFixed(1)}px,${sy.toFixed(1)}px,0)`;
    };
    for (const n of NODES) {
      if (n.depth === 1) place(n, n.x * z + tx, n.y * z + ty);
      else place(n, W / 2 + (n.x - cam.cx) * z * n.depth, H / 2 + (n.y - cam.cy) * z * n.depth);
    }
    for (const n of wa) place(n, n.x * z + tx, n.y * z + ty);
    ST.forEach((s) => s.node.el.classList.toggle("done", s.L <= prog + 2));
  }

  /* ---------------------------------------------------------------------
     Hjelpere for scener
     --------------------------------------------------------------------- */
  const pts = (list, s) => `<ul class="pts"${s != null ? ` data-s="${s}"` : ""}>${list.map((p, i) => `<li style="--i:${i}"><p>${fmt(p.tekst)}</p>${tag(p.type, p.kontroller)}${src(p.kilde)}</li>`).join("")}</ul>`;
  const fact = (f, s) => (f ? `<aside class="fact"${s != null ? ` data-s="${s}"` : ""}>${tag(f.type, f.kontroller)}<p>${fmt(f.tekst)}</p>${src(f.kilde)}</aside>` : "");
  const kapOf = (s) => D.KAPITLER[s.kap];
  const eyebrow = (t, s = 0) => `<p class="eyebrow" data-s="${s}">${t}</p>`;
  const waEl = (x, y, inner, cls = "") => `<div class="wa ${cls}" data-wx="${x}" data-wy="${y}">${inner}</div>`;
  const laneLabels = (x, fn, s = 0) =>
    [["muntlig-praktisk", -LANE], ["muntlig", 0], ["praktisk", LANE]].map(([id, dy], i) =>
      waEl(x, Y0 + dy, `<div class="ll f-${id}" data-s="${s}" style="--i:${i}">${fn(D.SPOR.find((p) => p.id === id))}</div>`, "dn")).join("");

  function checklist(id, items, s) {
    const done = new Set(store.get("cl-" + id, []));
    return `<div class="cl" data-s="${s}" data-cl="${id}">
      <div class="cl-top"><span class="cl-lbl">Sjekkliste</span><span class="cl-n"><b>${done.size}</b> av ${items.length} klart</span></div>
      <div class="cl-bar"><i style="width:${(done.size / items.length) * 100}%"></i></div>
      <ul>${items.map((it, i) => `<li style="--i:${i}"><button class="cl-it" data-k="${i}" aria-pressed="${done.has(i)}"><span class="cl-box"></span><span class="cl-tx">${fmt(it.tekst)}</span>${tag(it.type)}</button></li>`).join("")}</ul></div>`;
  }
  function bindChecklists(el) {
    $$("[data-cl]", el).forEach((cl) => {
      const id = cl.dataset.cl, n = $$(".cl-it", cl).length;
      const upd = () => {
        const on = $$(".cl-it", cl).filter((b) => b.getAttribute("aria-pressed") === "true").map((b) => +b.dataset.k);
        store.set("cl-" + id, on);
        $(".cl-n b", cl).textContent = on.length;
        $(".cl-bar i", cl).style.width = (on.length / n) * 100 + "%";
        cl.classList.toggle("full", on.length === n);
        el.dispatchEvent(new CustomEvent("cl", { detail: on }));
      };
      cl.addEventListener("click", (e) => {
        const b = e.target.closest(".cl-it"); if (!b || e.target.closest("a")) return;
        b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true");
        upd();
      });
      cl.classList.toggle("full", store.get("cl-" + id, []).length === n);
    });
  }
  function countUp(el) {
    $$("[data-count]", el).forEach((b) => {
      const gate = b.closest("[data-s]");
      if (b._done || (gate && !gate.classList.contains("on"))) return; b._done = true;
      const to = +b.dataset.count, fmtN = (v) => Math.round(v).toLocaleString("nb-NO");
      if (RM) { b.textContent = fmtN(to); return; }
      const t0 = performance.now();
      const tick = (now) => { const t = clamp((now - t0) / 1400, 0, 1); b.textContent = fmtN(to * easeOut(t)); if (t < 1) requestAnimationFrame(tick); };
      requestAnimationFrame(tick);
    });
  }

  /* ---------------------------------------------------------------------
     SCENER
     Hver scene: { html, steps, mount(el), step(n, el), destroy() }
     data-s="n" på et element = vises fra steg n.
     --------------------------------------------------------------------- */
  const SC = {};
  const merke = $("#merke");
  const LOGO = { lys: merke ? $(".lg-lys", merke).getAttribute("src") : "", mork: merke ? $(".lg-mork", merke).getAttribute("src") : "" };
  const logo = (cls, s) => (LOGO.lys ? `<span class="logo ${cls}"${s != null ? ` data-s="${s}"` : ""}><img class="lg-lys" src="${LOGO.lys}" alt="${esc(D.META.skole)}"><img class="lg-mork" src="${LOGO.mork}" alt="${esc(D.META.skole)}"></span>` : `<p class="eyebrow">${fmt(D.META.skole)}</p>`);

  SC.prolog = () => {
    const q = esc(D.META.sporsmal).replace(/(vite|gjøre|være forberedt på)/g, "<em>$1</em>");
    return {
      steps: 3,
      html: `
      ${waEl(0, 0, `<div class="pr-year" data-so="0" aria-label="2026">${[..."2026"].map((c, i) => `<span style="--i:${i}">${c}</span>`).join("")}</div>`)}
      ${waEl(300, 0, `<div class="pr-title" data-so="1">${logo("pr-logo")}<h1>Eksamen<br>våren 2026</h1><p class="pr-sub">${fmt(D.META.undertittel)}</p></div>`, "up")}
      ${waEl(1650, 0, `<div class="pr-q" data-so="2"><p class="eyebrow">Spørsmålet vi skal svare på</p><p class="pr-qt">${q}</p></div>`, "up")}
      <p class="pr-hint" data-s="0">→ starter reisen · <kbd>E</kbd> utforsk · <kbd>?</kbd> hurtigtaster</p>`,
    };
  };

  const KAPLAB = [
    { k: 1, x: X1, y: 2550, pos: "r", go: "k1-portal" },
    { k: 2, x: MAI0 + 2100, y: Y0, pos: "b", go: "k2-portal" },
    { k: 3, x: 15200, y: Y0 - LANE, pos: "t", go: "k3-portal" },
    { k: 4, x: KRYSS, y: Y0 + 380, pos: "b", go: "k4-roller" },
    { k: 5, x: 23600, y: Y0 - HUMP_H, pos: "t", go: "k5-intro" },
    { k: 6, x: XE, y: 2900, pos: "l", go: "e-datoer" },
  ];
  const kartLabels = (s) => KAPLAB.map((l, i) => { const k = D.KAPITLER[l.k]; return waEl(l.x, l.y, `<button class="kt-lab pos-${l.pos}" data-go="${l.go}"${s ? ' data-s="0"' : ""} style="--i:${i}"><span class="nr">${k.nr || "Mål"}</span><span class="nm">${fmt(k.navn)}</span><span class="pe">${fmt(k.periode)}</span></button>`); }).join("");
  SC.kart = () => ({
    steps: 1,
    html: `<div class="kt-head" data-s="0"><p class="eyebrow">Kartet over reisen</p><h2>Fem etapper.<br>Én sammenhengende periode.</h2>
      <p class="lede">Fra forberedelsene i januar til siste sensur i juni. Hvert stopp er noe vi må vite, gjøre eller være forberedt på.</p></div>
      ${kartLabels(true)}
      <div class="kt-legend" data-s="0">${D.FORMER.map((f) => `<span><i style="background:${f.farge}"></i>${f.navn}</span>`).join("")}</div>`,
  });

  SC.portal = (s) => {
    const k = kapOf(s);
    const list = ST.filter((x) => x.kap === s.kap && x !== s);
    return {
      steps: 2,
      html: `<div class="sc po">
        <div class="po-nr" data-flip aria-hidden="true">${k.nr}</div>
        <div class="po-body">${eyebrow(`Kapittel ${+k.nr} · ${fmt(k.periode)}`)}
          <h2 class="po-h" data-s="0">${fmt(k.navn)}</h2><p class="lede" data-s="0">${fmt(k.ingress)}</p>
          <ol class="po-route" data-s="1">${list.map((x, i) => `<li style="--i:${i}"><button data-go="${x.id}"><i></i><span>${fmt(x.t)}</span></button></li>`).join("")}</ol>
        </div></div>`,
    };
  };

  SC.milepael = (s) => {
    const m = D.MILEPAELER[s.data];
    return {
      steps: 3,
      html: `<div class="sc mi">
        <header class="mi-head">${eyebrow(`${fmt(m.naarEtikett)} <span class="mi-when">${fmt(m.naar)}</span>`)}
          <h2 data-flip>${fmt(m.tittel)}</h2><p class="lede" data-s="0">${fmt(m.ingress)}</p></header>
        <div class="mi-cols">${checklist(s.id, m.sjekkliste, 1)}${fact(m.fakta, 2)}</div></div>`,
      mount: bindChecklists,
    };
  };

  SC.nyordning = () => {
    const n = D.NYORDNING;
    return {
      steps: n.linjer.length + 2,
      html: `<div class="sc ny">${eyebrow(`Nytt fra våren 2026 · ${tag("nasjonal")}`)}
        <h2 class="ny-h" data-s="0">Skriftlig eksamen er strammet inn.</h2>
        <div class="ny-lines">${n.linjer.map((l, i) => `<div class="ny-row" data-s="${i + 1}"><s class="ny-for"><span>${fmt(l.for)}</span></s><span class="ny-na">${fmt(l.na)}</span></div>`).join("")}</div>
        <div class="ny-foot" data-s="${n.linjer.length + 1}"><p><strong>Hvorfor?</strong> ${fmt(n.hvorfor)}</p><p><strong>Unntak:</strong> ${fmt(n.unntak)}</p>${src(n.kilde)}${src("udirKI")}</div></div>`,
    };
  };

  SC.seb = () => {
    const X = D.SEB;
    return {
      steps: 3,
      html: `<div class="sc seb">
        <header class="mi-head">${eyebrow(`Sikker nettleser · Safe Exam Browser`)}
          <h2 data-flip>Maskinen låses.</h2><p class="lede" data-s="0">${fmt(X.hva)} ${src(X.hvaKilde)}</p></header>
        <ol class="seb-tl" data-s="1">${X.innforing.map((r, i) => `<li style="--i:${i}"><i></i><b>${fmt(r.naar)}</b><span>${fmt(r.hva)}</span>${r.kontroller ? tag("nasjonal", true) : ""}</li>`).join("")}</ol>
        <div class="seb-ov" data-s="2"><p class="eyebrow">Slik øver dere</p>
          <ol class="ru seb-ru">${X.ovelse.map((r, i) => `<li style="--i:${i}"><span class="ru-n">${String(i + 1).padStart(2, "0")}</span><h3>${fmt(r.tittel)}</h3><p>${fmt(r.tekst)}</p>${tag(r.type)}</li>`).join("")}</ol>
          <p class="seb-unntak">${fmt(X.unntak)} ${src("udirSEB")}</p></div></div>`,
    };
  };

  SC.teknisk = (s) => {
    const m = D.MILEPAELER.teknisk;
    const on = new Set(store.get("dev-" + s.id, []));
    return {
      steps: 2,
      html: `<div class="sc tek">
        <header class="mi-head">${eyebrow(`${fmt(m.naarEtikett)} <span class="mi-when">${fmt(m.naar)}</span>`)}
          <h2 data-flip>${fmt(m.tittel)}</h2><p class="lede" data-s="0">${fmt(m.ingress)}</p></header>
        <div class="tek-cols">
          <div class="tek-dev" data-s="1">${deviceSVG()}<p class="tek-status"><span class="tek-no">Ikke klar ennå</span><span class="tek-ok">Klar for eksamen</span></p>${fact(m.fakta)}</div>
          <ul class="tek-list" data-s="1">${m.enhet.map((e, i) => `<li style="--i:${i}"><button class="tek-it" data-part="${e.id}" aria-pressed="${on.has(e.id)}"><span class="cl-box"></span><span class="tek-tx"><strong>${fmt(e.tekst)}</strong><small>${fmt(e.detalj)}</small></span>${tag(e.type)}</button></li>`).join("")}</ul>
        </div></div>`,
      mount(el) {
        const sync = () => {
          const ids = $$(".tek-it", el).filter((b) => b.getAttribute("aria-pressed") === "true").map((b) => b.dataset.part);
          $$("[data-p]", el).forEach((p) => p.classList.toggle("on", ids.includes(p.dataset.p)));
          el.classList.toggle("klar", ids.length === m.enhet.length);
          store.set("dev-" + s.id, ids);
        };
        el.addEventListener("click", (e) => { const b = e.target.closest(".tek-it"); if (!b || e.target.closest("a")) return; b.setAttribute("aria-pressed", b.getAttribute("aria-pressed") === "true" ? "false" : "true"); sync(); });
        sync();
      },
    };
  };
  function deviceSVG() {
    return `<svg viewBox="0 0 520 380" class="dev" role="img" aria-label="Elevmaskin klar for eksamen">
      <g class="dv-strom" data-p="strom"><path d="M40 318 C 10 318, 10 360, 60 360 L 150 360"/><rect x="150" y="350" width="34" height="20" rx="3"/></g>
      <rect class="dv-skjerm" x="70" y="24" width="380" height="250" rx="12"/>
      <rect class="dv-seb" data-p="seb" x="88" y="42" width="344" height="214" rx="4"/>
      <g class="dv-lock" data-p="seb"><rect x="236" y="120" width="48" height="40" rx="5"/><path d="M246 120 v-12 a14 14 0 0 1 28 0 v12"/></g>
      <g class="dv-test" data-p="test"><path d="M110 200 h120"/><path d="M110 220 h170"/><path d="M110 240 h90"/><path class="ok" d="M372 214 l12 12 l22 -26"/></g>
      <text class="dv-os" data-p="os" x="100" y="68">Windows / macOS</text>
      <path class="dv-base" d="M40 290 L 480 290 L 452 318 L 68 318 Z"/>
      <g class="dv-notat" data-p="notat" transform="rotate(7 470 150)"><rect x="440" y="96" width="70" height="92" rx="3"/><path d="M452 118 h46 M452 132 h46 M452 146 h34 M452 160 h40"/></g>
    </svg>`;
  }

  SC.standpunkt = (s) => {
    const m = D.MILEPAELER.standpunkt;
    return {
      steps: m.regler.length + 2,
      html: `<div class="sc sp">
        <header class="mi-head">${eyebrow(`${fmt(m.naarEtikett)} <span class="mi-when">${fmt(m.naar)}</span>`)}
          <h2 data-flip>${fmt(m.tittel)}</h2><p class="lede" data-s="0">${fmt(m.ingress)}</p></header>
        <div class="sp-rows">${m.regler.map((r, i) => `<div class="sp-row" data-s="${i + 1}">
          <p class="sp-lbl">${fmt(r.naar)}</p>
          <div class="sp-line">${r.tidslinje.map((p) => `<span class="sp-mk${p.frist ? " frist" : ""}" style="left:${p.pos * 100}%"><i></i><em>${fmt(p.tekst)}</em></span>`).join("")}</div>
          <p class="sp-hva">${fmt(r.hva)}</p></div>`).join("")}</div>
        <div class="sp-foot" data-s="${m.regler.length + 1}">${tag("lokal")}<p>${fmt(m.lokal)}</p>${fact(m.fakta)}</div></div>`,
    };
  };

  SC.trekk = () => {
    const t = D.DATOER.trekk;
    const dager = dagerMellom(t.iso, D.DATOER.forsteSkriftlige.iso);
    return {
      steps: 3,
      html: `<div class="sc tk">${eyebrow(`Trekket · ${tag("nasjonal")}`)}
        <div class="tk-date" data-flip><span>28.</span><span>april</span></div>
        <div class="tk-row" data-s="0"><span class="tk-kl">kl. ${esc(t.kl)}</span><p class="lede">${fmt(t.tekst)} ${src(t.kilde)}</p></div>
        <div class="tk-count" data-s="1"><b data-count="${dager}">${dager}</b><span>dager til første<br>skriftlige eksamen</span></div>
        ${pts(D.TREKK.punkter, 2)}</div>`,
      step(n, el) { if (n >= 1) countUp(el); },
    };
  };

  SC.tall = () => ({
    steps: D.TALL.length + 1,
    html: `<div class="sc ta">${eyebrow("Skriftlig eksamensperiode · Nasjonalt")}
      <div class="ta-period" data-flip>4.–21. mai</div>
      <div class="ta-nums">${D.TALL.map((t, i) => `<div class="ta-n n${i}" data-s="${i + 1}"><b data-count="${t.tall}">0</b><p>${fmt(t.tekst)}</p>${src(t.kilde)}</div>`).join("")}</div></div>`,
    step(n, el) { countUp(el); },
  });

  const NOKKELDAGER = ["2026-05-05", "2026-05-11", "2026-05-13", "2026-05-19", "2026-05-20", "2026-05-21"];
  SC.kalender = () => ({
    steps: NOKKELDAGER.length + 1,
    html: `<div class="sc kal">
      <header>${eyebrow(`Skriftlig eksamen · ${tag("nasjonal")}`)}<h2 data-s="0">Tre uker. Atten dager.<br>Utvalgte fag.</h2>
        <p class="lede" data-s="0">Velg en dag på tidslinjen. Lista viser fellesfag og fag som er aktuelle for våre programområder – <strong>kontroller alltid fagkoden</strong> i Udirs eksamensplan. ${src("udirPlan")}</p></header>
      <div class="kal-day" data-s="0" aria-live="polite"></div></div>`,
    mount(el) {
      this.sel = (iso) => {
        $$(".tick", nodesEl).forEach((t) => t.classList.toggle("sel", t.dataset.dato === iso));
        const k = KAL[iso], dt = isoDate(iso);
        const fag = k && k.fag ? k.fag : [];
        $(".kal-day", el).innerHTML = `<p class="kd-d"><b>${dt.getDate()}.</b> mai<span>${["søndag", "mandag", "tirsdag", "onsdag", "torsdag", "fredag", "lørdag"][dt.getDay()]}</span></p>
          ${k && k.merknad ? `<p class="kd-m">${fmt(k.merknad)}</p>` : ""}
          ${k && k.fri ? `<p class="kd-m">${fmt(k.fri)} – ingen eksamen</p>` : ""}
          <ul>${fag.map(([kode, navn]) => `<li><span class="kd-k">${esc(kode || "—")}</span>${esc(navn)}</li>`).join("") || (k && k.fri ? "" : `<li class="kd-none">Andre fag denne dagen – se eksamensplan.udir.no</li>`)}</ul>`;
      };
      this.onTick = (e) => { const t = e.target.closest(".tick"); if (t) { e.stopPropagation(); this.sel(t.dataset.dato); } };
      nodesEl.addEventListener("click", this.onTick);
      this.sel("2026-05-04");
    },
    step(n) { this.sel(n === 0 ? "2026-05-04" : NOKKELDAGER[n - 1]); },
    destroy() { nodesEl.removeEventListener("click", this.onTick); $$(".tick.sel", nodesEl).forEach((t) => t.classList.remove("sel")); },
  });

  SC.simulering = () => {
    const E = D.EKSAMENSDAG, n = E.steg.length;
    return {
      steps: n,
      html: `<div class="sc sim">
        <header>${eyebrow(`En eksamensdag · ${fmt(E.fag)} · ${fmt(E.varighet)}`)}<h2 data-s="0">Følg ${fmt(E.elev)} fra oppmøte til innlevering</h2></header>
        <div class="sim-track" data-s="0"><div class="sim-line"><i></i></div>
          ${E.steg.map((x, i) => `<button class="sim-pt" data-k="${i}" style="left:${(i / (n - 1)) * 100}%"><i></i><span>${fmt(x.tittel)}</span></button>`).join("")}
          <div class="sim-me"><span>${fmt(E.elev)}</span></div></div>
        <div class="sim-now" data-s="0">
          <div class="sim-clock"></div>
          <div class="sim-cols"><div class="sim-col"><p class="eyebrow">${fmt(E.elev)}</p><p class="sim-tx" data-w="elev"></p></div>
            <div class="sim-col"><p class="eyebrow">Du som lærer / vakt</p><p class="sim-tx" data-w="larer"></p><div class="sim-tag"></div></div></div></div></div>`,
      mount(el) { el.addEventListener("click", (e) => { const b = e.target.closest(".sim-pt"); if (b) setStep(+b.dataset.k); }); },
      step(k, el) {
        const x = E.steg[k], p = (k / (n - 1)) * 100;
        $(".sim-line i", el).style.width = p + "%";
        $(".sim-me", el).style.left = p + "%";
        $$(".sim-pt", el).forEach((b, i) => { b.classList.toggle("done", i <= k); b.classList.toggle("cur", i === k); });
        const sw = (sel, v) => { const t = $(sel, el); t.classList.remove("swap"); void t.offsetWidth; t.innerHTML = v; t.classList.add("swap"); };
        sw(".sim-clock", fmt(x.kl));
        sw('[data-w="elev"]', fmt(x.elev));
        sw('[data-w="larer"]', fmt(x.larer));
        $(".sim-tag", el).innerHTML = tag(x.type);
      },
    };
  };

  SC.swim = (s) => {
    const A = s.data === "skriftlig" ? D.SKRIFTLIG_ANSVAR : D.MUNTLIG.ansvar;
    const tittel = s.data === "skriftlig" ? "Før, under og etter – hvem gjør hva?" : "Hvem gjør hva ved muntlig eksamen?";
    return {
      steps: A.faser.length,
      html: `<div class="sc sw-sc"><header>${eyebrow(s.data === "skriftlig" ? "Skriftlig eksamen · Ansvar" : "Muntlig eksamen · Ansvar")}<h2 data-s="0">${tittel}</h2></header>
        <div class="sw" style="--cols:${A.faser.length}">
          <div class="sw-corner"></div>${A.faser.map((f, j) => `<div class="sw-ph" data-s="${j}"><i></i>${esc(f)}</div>`).join("")}
          ${A.rader.map((r) => `<div class="sw-role">${esc(R[r.rolle].navn)}${s.data === "muntlig" ? `<small>${esc(R[r.rolle].kort)}</small>` : ""}</div>${r.celler.map((c, j) => `<div class="sw-c${c ? "" : " tom"}" data-s="${j}">${c ? fmt(c) : ""}</div>`).join("")}`).join("")}
        </div></div>`,
    };
  };

  SC.rutine = () => ({
    steps: D.TEKNISK_RUTINE.length,
    html: `<div class="sc ru-sc"><header>${eyebrow("Rutine i eksamenslokalet")}<h2 data-s="0">Når teknikken svikter</h2><p class="lede" data-s="0">Seks steg, i denne rekkefølgen. Uforutsette hendelser skal ikke gå ut over kandidaten.</p></header>
      <ol class="ru">${D.TEKNISK_RUTINE.map((r, i) => `<li data-s="${i}"><span class="ru-n">${String(i + 1).padStart(2, "0")}</span><h3>${fmt(r.tittel)}</h3><p>${fmt(r.tekst)}</p>${tag(r.type)}${src(r.kilde)}</li>`).join("")}</ol></div>`,
  });

  SC.spor = (s) => ({
    steps: 2,
    html: `<div class="sc spor"><header>${eyebrow("Tre eksamensformer")}<h2 data-flip>Samme start.<br>Tre løp.</h2>
      <p class="lede" data-s="0">Trekket 28. april gjelder alle. Datoene settes lokalt: ${fmt(D.DATOER.muntligPeriode.vis)}</p></header></div>
      ${laneLabels(s.x + 380, (p) => `<b>${fmt(p.tittel)}</b><span>${fmt(p.eksempel)}</span>`, 1)}`,
  });

  SC.trekkmuntlig = (s) => {
    const T = D.MUNTLIG.trekk;
    return {
      steps: 3,
      html: `<div class="sc tm"><header>${eyebrow("Trekk og kunngjøring")}<h2 data-s="0">Fra én uke<br>til flere uker.</h2></header>
        <div class="tm-bars" data-s="0">
          <div class="tm-bar"><span class="tm-l">${fmt(T.for.tekst)}</span><span class="tm-b"><i style="--w:${T.for.uker / 4}"></i></span><span class="tm-v">ca. ${T.for.uker} uke</span></div>
          <div class="tm-bar na"><span class="tm-l">${fmt(T.na.tekst)}</span><span class="tm-b"><i style="--w:1"></i></span><span class="tm-v">opptil ca. ${T.na.uker} uker</span></div>
          <p class="tm-note">${fmt(T.forklaring)} ${src(T.kilde)}</p></div>
        ${pts(T.konsekvenser, 1)}</div>`,
    };
  };

  SC.forberedelse = (s) => {
    const F = D.MUNTLIG.forberedelse;
    return {
      steps: 3,
      html: `<div class="sc fb"><header>${eyebrow(`Forberedelse · ${tag("nasjonal")}`)}</header>
        <div class="fb-clock" data-flip><span class="fb-h">24</span><span class="fb-sep">:</span><span class="fb-m">00</span><span class="fb-sep">:</span><span class="fb-s">00</span></div>
        <p class="lede fb-l" data-s="0">${fmt(F.tekst)} ${src(F.kilde)}</p>
        ${pts(F.punkter, 1)}</div>
        ${laneLabels(s.x + 380, (p) => `<b>${fmt(p.tittel)}</b><strong class="ll-v">${fmt(p.forberedelse)}</strong>`, 2)}`,
      mount(el) {
        const t0 = Date.now();
        const draw = () => {
          const left = Math.max(0, 24 * 3600 - Math.floor((Date.now() - t0) / 1000));
          const h = Math.floor(left / 3600), m = Math.floor((left % 3600) / 60), sec = left % 60;
          $(".fb-h", el).textContent = String(h).padStart(2, "0");
          $(".fb-m", el).textContent = String(m).padStart(2, "0");
          $(".fb-s", el).textContent = String(sec).padStart(2, "0");
        };
        this.iv = setInterval(draw, 1000);
      },
      destroy() { clearInterval(this.iv); },
    };
  };

  SC.gjennomforing = (s) => {
    const G = D.MUNTLIG.gjennomforing;
    return {
      steps: 2,
      html: `<div class="sc tid"><header>${eyebrow("Gjennomføring")}<h2 data-flip>30 minutter. 45 minutter.<br>Eller egne regler.</h2><p class="lede" data-s="0">${fmt(G.tekst)}</p></header>
        ${pts(G.punkter, 1)}</div>
        ${laneLabels(s.x + 380, (p) => `<b>${fmt(p.tittel)}</b><strong class="ll-v">${fmt(p.gjennomforing)}</strong>`, 0)}`,
    };
  };

  SC.parti = () => {
    const P = D.MUNTLIG.parti;
    const dots = Array.from({ length: 7 }, (_, i) => `<i class="${i < 5 ? "fast" : "kan"}"></i>`).join("");
    return {
      steps: P.tall.length + 1,
      html: `<div class="sc pa"><header>${eyebrow(`Partier og sensorer · ${tag("lokal")}`)}<h2 data-flip>Ett parti. Én dag.</h2></header>
        <div class="pa-nums">${P.tall.map((t, i) => `<div class="pa-n n${i}" data-s="${i}"><b>${fmt(t.vis)}</b>${i === 0 ? `<span class="pa-dots" aria-hidden="true">${dots}</span>` : ""}<p>${fmt(t.tekst)}</p></div>`).join("")}</div>
        ${pts(P.punkter, P.tall.length)}</div>`,
    };
  };

  SC.sensur = () => {
    const X = D.MUNTLIG.sensur;
    return {
      steps: 2,
      html: `<div class="sc se"><header>${eyebrow("Vurdering og sensur")}</header>
        <blockquote class="se-q" data-flip>«${fmt(X.hovedregel)}»</blockquote><p class="se-src" data-s="0">${src(X.hovedregelKilde)}</p>
        ${pts(X.punkter, 1)}</div>`,
    };
  };

  const ROLLE_ORDEN = ["faglarer", "eksaminator", "sensor", "eksamensvakt", "eksamensansvarlig", "skoleledelse", "elev"];
  SC.roller = () => {
    const ring = ROLLE_ORDEN.filter((r) => r !== "elev");
    const pos = { elev: [50, 50] };
    ring.forEach((id, i) => { const a = (i / ring.length) * Math.PI * 2 - Math.PI / 2; pos[id] = [50 + Math.cos(a) * 38, 50 + Math.sin(a) * 38]; });
    const edges = [];
    D.ROLLER.forEach((r) => r.samarbeid.forEach((o) => { const k = [r.id, o].sort().join("|"); if (!edges.includes(k)) edges.push(k); }));
    const k = D.KAPITLER[4];
    return {
      steps: ROLLE_ORDEN.length + 1,
      html: `<div class="sc ro"><header>${eyebrow(`Kapittel 4 · ${fmt(k.periode)}`)}<h2 data-s="0">${fmt(k.navn)}</h2><p class="lede" data-s="0">${fmt(k.ingress)}</p></header>
        <div class="ro-net" data-s="0">
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">${edges.map((e) => { const [a, b] = e.split("|"); return `<line data-e="${e}" x1="${pos[a][0]}" y1="${pos[a][1]}" x2="${pos[b][0]}" y2="${pos[b][1]}" vector-effect="non-scaling-stroke"/>`; }).join("")}</svg>
          ${ROLLE_ORDEN.map((id) => `<button class="ro-n${id === "elev" ? " mid" : ""}" data-r="${id}" style="left:${pos[id][0]}%;top:${pos[id][1]}%"><b>${esc(R[id].navn)}</b><span>${esc(R[id].kort)}</span></button>`).join("")}
        </div>
        <div class="ro-panel" data-s="0" aria-live="polite"></div></div>`,
      mount(el) {
        this.sel = (id) => {
          el.classList.toggle("has", !!id);
          $$(".ro-n", el).forEach((b) => { const c = id && (b.dataset.r === id || R[id].samarbeid.includes(b.dataset.r) || R[b.dataset.r].samarbeid.includes(id)); b.classList.toggle("sel", b.dataset.r === id); b.classList.toggle("rel", !!c && b.dataset.r !== id); });
          $$("line", el).forEach((l) => l.classList.toggle("on", !!id && l.dataset.e.split("|").includes(id)));
          const p = $(".ro-panel", el);
          if (!id) { p.innerHTML = `<p class="ro-hint">Velg en rolle i nettverket – eller trykk → for å gå gjennom dem én etter én.</p>`; return; }
          const r = R[id];
          p.innerHTML = `<p class="eyebrow">Rolle</p><h3 class="ro-h">${esc(r.navn)}</h3><p class="ro-a">${fmt(r.ansvar)}</p>
            <div class="ro-tl">${D.FASER.map((f) => { const o = r.oppgaver.filter((x) => x.fase === f.id); return `<div class="ro-f${o.length ? "" : " tom"}"><p class="ro-fn"><i></i>${esc(f.navn)}</p>${o.map((x) => `<button class="ro-o" data-go="${x.stopp}">${fmt(x.tekst)}</button>`).join("")}</div>`; }).join("")}</div>
            <button class="btn ro-hl" data-hl="${id}" aria-pressed="${state.rolle === id}">${state.rolle === id ? "Fremhevet på tidslinjen" : "Fremhev på tidslinjen"}</button>`;
        };
        el.addEventListener("click", (e) => {
          const n = e.target.closest(".ro-n"); if (n) { const i = ROLLE_ORDEN.indexOf(n.dataset.r); cur.step = i + 1; applyStep(cur, i + 1, true); this.sel(n.dataset.r); return; }
          const h = e.target.closest(".ro-hl"); if (h) { setRolle(state.rolle === h.dataset.hl ? null : h.dataset.hl); this.sel(h.dataset.hl); }
        });
        this.sel(null);
      },
      step(n) { this.sel(n === 0 ? null : ROLLE_ORDEN[n - 1]); },
    };
  };

  SC.hindringer = (s) => {
    const k = kapOf(s);
    return {
      steps: 2,
      html: `<div class="sc hi"><header>${eyebrow(`Kapittel 5 · ${fmt(k.periode)}`)}<div class="po-nr hi-nr" data-flip aria-hidden="true">05</div><h2 data-s="0">${fmt(k.navn)}</h2><p class="lede" data-s="0">${fmt(k.ingress)}</p></header>
        <ol class="hi-list" data-s="1">${D.SCENARIOER.map((x, i) => `<li style="--i:${i}"><button data-go="k5-${x.id}"><span class="hi-n">${x.nr}</span><span class="hi-t">${fmt(x.tittel)}</span></button></li>`).join("")}</ol></div>`,
    };
  };

  SC.scenario = (s) => {
    const X = D.SCENARIOER.find((x) => x.id === s.data);
    return {
      steps: 4,
      html: `<div class="sc sn">
        <header>${eyebrow(`Hindring ${X.nr} · ${fmt(X.tittel)}`)}<p class="sn-sit" data-flip>${fmt(X.situasjon)}</p></header>
        ${X.klokke ? `<div class="ck" data-s="1"><div class="ck-top"><span class="ck-t">09:47</span><span class="ck-o"></span></div>
          <input class="ck-r" type="range" min="530" max="630" step="1" value="587" aria-label="Når møter eleven?"><div class="ck-sc"><span style="left:${(10 / 100) * 100}%">09:00</span><span style="left:${(70 / 100) * 100}%">10:00</span></div></div>` : ""}
        <div class="sn-q" data-s="1"><p class="sn-qt">${fmt(X.sporsmal)}</p><div class="sn-opts">${X.valg.map((v, i) => `<button class="sn-o" data-k="${i}" data-r="${v.riktig}"><span class="sn-l">${"ABC"[i]}</span>${fmt(v.tekst)}</button>`).join("")}</div></div>
        <div class="sn-ans" data-s="2"><div class="sn-rule">${tag(X.regelType, X.kontroller)}<p>${fmt(X.regel)}</p>${src(X.kilde)}</div></div>
        <div class="sn-do" data-s="3"><div><p class="eyebrow">Gjør dette</p><ol>${X.gjor.map((g) => `<li>${fmt(g)}</li>`).join("")}</ol></div>
          <div class="sn-k"><p class="eyebrow">Kontakt</p><p>${fmt(X.kontakt)}</p></div></div></div>`,
      mount(el) {
        el.addEventListener("click", (e) => { const o = e.target.closest(".sn-o"); if (!o) return; el.dataset.valgt = o.dataset.k; if (cur.step < 2) setStep(2); else markOpts(el); });
        const r = $(".ck-r", el);
        if (r) {
          const upd = () => {
            const m = +r.value, hh = Math.floor(m / 60), mm = m % 60;
            $(".ck-t", el).textContent = `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
            const o = $(".ck-o", el);
            o.className = "ck-o " + (m < 540 ? "ok" : m < 600 ? "mid" : "no");
            o.textContent = m < 540 ? "I god tid før start" : m < 600 ? `Får starte. Mister ${m - 540} min – tiden kompenseres ikke.` : "Får ikke gjennomføre eksamen.";
          };
          r.addEventListener("input", upd); upd();
        }
      },
      step(n, el) { el.classList.toggle("svar", n >= 2); if (n >= 2) markOpts(el); },
    };
  };
  function markOpts(el) {
    $$(".sn-o", el).forEach((o) => { o.classList.toggle("rett", o.dataset.r === "true"); o.classList.toggle("feil", o.dataset.r !== "true" && el.dataset.valgt === o.dataset.k); });
  }

  SC.datoer = () => {
    const keys = ["tilrettelegging", "trekk", "forsteSkriftlige", "sisteSkriftlige", "muntligPeriode", "fellessensur", "sensurfrist", "klage", "hurtigklage"];
    return {
      steps: 2,
      html: `<div class="sc ep da"><header>${eyebrow("Epilog · Vi er i mål")}<h2 data-s="0">De viktigste datoene</h2></header>
        <ol class="da-l" data-s="1">${keys.map((k, i) => { const d = D.DATOER[k]; return `<li style="--i:${i}"><span class="da-d">${fmt(d.vis)}${d.kl ? `<small>kl. ${esc(d.kl)}</small>` : ""}</span><span class="da-t">${fmt(d.tekst)}</span>${tag(d.type, d.kontroller)}</li>`; }).join("")}</ol></div>`,
    };
  };

  SC.ansvarsum = () => ({
    steps: 2,
    html: `<div class="sc ep as"><header>${eyebrow("Epilog · Vi er i mål")}<h2 data-s="0">Hvem har ansvaret for hva?</h2></header>
      <ol class="as-l" data-s="1">${ROLLE_ORDEN.map((id, i) => `<li style="--i:${i}"><button data-hl="${id}" class="as-r"><b>${esc(R[id].navn)}</b><span>${fmt(R[id].ansvar)}</span></button></li>`).join("")}</ol></div>`,
    mount(el) { el.addEventListener("click", (e) => { const b = e.target.closest("[data-hl]"); if (b) { openPanel("ansvar", b.dataset.hl); } }); },
  });

  SC.feil = () => ({
    steps: D.FEIL.length + 1,
    html: `<div class="sc ep fe"><header>${eyebrow("Epilog · Vi er i mål")}<h2 data-s="0">${D.FEIL.length} feil vi skal unngå</h2><p class="lede" data-s="0">Klikk på en påstand – eller trykk → – for å se hva som faktisk gjelder.</p></header>
      <ol class="fe-l">${D.FEIL.map((f, i) => `<li data-s="0" style="--i:${i}"><button class="fe-b" data-k="${i}"><span class="fe-n">${String(i + 1).padStart(2, "0")}</span><span class="fe-m">${fmt(f.myte)}</span><span class="fe-f"><span>${fmt(f.fakta)}</span></span></button></li>`).join("")}</ol></div>`,
    mount(el) { el.addEventListener("click", (e) => { const b = e.target.closest(".fe-b"); if (b) b.classList.toggle("snudd"); }); },
    step(n, el) { $$(".fe-b", el).forEach((b, i) => b.classList.toggle("snudd", i < n)); },
  });

  SC.hjelp = () => ({
    steps: 2,
    html: `<div class="sc ep hj"><header>${eyebrow("Epilog · Vi er i mål")}<h2 data-s="0">Her finner du hjelp</h2></header>
      <div class="hj-cols">
        <div class="hj-lok" data-s="0"><p class="eyebrow">Ved Hustadvika vgs ${tag("lokal")}</p>
          <dl>${D.HJELP.lokalt.map((h) => `<div><dt>${fmt(h.rolle)}</dt><dd>${fmt(h.hvem)}${h.kontakt ? `<br><span>${fmt(h.kontakt)}</span>` : ""}</dd></div>`).join("")}</dl></div>
        <div class="hj-nas" data-s="1"><p class="eyebrow">Nasjonalt og i fylket</p>
          <ul>${D.HJELP.nasjonalt.map((k) => `<li>${src(k)}</li>`).join("")}</ul>
          <button class="btn" data-act="utf">Åpne oppslagsverket <kbd>E</kbd></button></div>
      </div></div>`,
  });

  SC.slutt = () => ({
    steps: 2,
    html: `<div class="sc fin">${logo("fin-logo", 0)}
      <p class="fin-q" data-flip>${fmt(D.META.sluttbudskap)}</p>
      <p class="fin-hint" data-s="1">Hele reisen – fra januar til juni. Trykk <kbd>E</kbd> for å bruke presentasjonen som oppslagsverk.</p></div>`,
  });

  /* ---------------------------------------------------------------------
     Navigasjon
     --------------------------------------------------------------------- */
  const state = { mode: "pres", rolle: null, form: null, kartFri: false, tab: null };
  let cur = null;
  const stepsOf = (s) => (s._steps != null ? s._steps : (s._steps = SC[s.scene](s).steps || 1));

  function applyStep(c, n, silent) {
    $$("[data-s]", c.el).forEach((e) => e.classList.toggle("on", +e.dataset.s <= n));
    $$("[data-so]", c.el).forEach((e) => e.classList.toggle("on", +e.dataset.so === n));
    c.el.dataset.step = n;
    if (!silent && c.def.step) c.def.step(n, c.el);
  }
  function setStep(n) {
    if (!cur || cur.dead) return;
    const s = cur.stop;
    n = clamp(n, 0, stepsOf(s) - 1);
    const old = cur.step;
    cur.step = n;
    applyStep(cur, n);
    if ((s.cams && s.cams.length > 1) || s.lx) {
      const t = camTarget(s, n);
      flyTo(t, durFor(t), progTarget(s, n));
      if (s.cams && s.cams[n] && s.cams[n].overview) body.classList.add("is-overview"); else if (s.lay !== "overview") body.classList.remove("is-overview");
    }
    if (old !== n) updateHash();
    updateHUD();
  }

  function goTo(i, step = 0, o = {}) {
    i = clamp(i, 0, ST.length - 1);
    const s = ST[i];
    step = clamp(step, 0, stepsOf(s) - 1);
    if (cur && cur.i === i && !cur.dead) { setStep(step); return; }
    const t = camTarget(s, step);
    const dur = o.instant ? 0 : durFor(t);
    const from = cur ? cur.stop : null;
    const dx = from ? s.x - from.x : 1, dy = from ? s.y - from.y : 0, dl = Math.hypot(dx, dy) || 1;
    flyTo(t, dur, progTarget(s, step));
    body.dataset.tema = s.tema;
    body.classList.toggle("is-overview", s.lay === "overview" || !!(s.cams && s.cams[step] && s.cams[step].overview));
    body.dataset.kap = s.kap;
    body.dataset.stopp = s.id;
    nodesEl.classList.toggle("kal", !!s.kal);
    if (cur && !cur.dead) leave(cur, dx / dl, dy / dl);
    enter(s, i, step, dur, dx / dl, dy / dl);
    ST.forEach((x) => x.node.el.classList.toggle("cur", x === s));
    if (!o.keepFri) setKartFri(false);
    updateHUD(true);
    updateHash();
  }
  function leave(c, ux, uy) {
    const el = c.el;
    if (c.def.destroy) c.def.destroy();
    el.style.setProperty("--lx", `${-ux * 90}px`); el.style.setProperty("--ly", `${-uy * 90}px`);
    el.classList.remove("in"); el.classList.add("out");
    el.setAttribute("aria-hidden", "true");
    wa = [];
    setTimeout(() => el.remove(), RM ? 0 : 450);
  }
  function enter(s, i, step, dur, ux, uy) {
    const def = SC[s.scene](s);
    const el = doc.createElement("section");
    el.className = `scene sc-${s.scene} lay-${s.lay} kap-${s.kap}`;
    el.setAttribute("aria-label", plain(s.t));
    el.innerHTML = def.html;
    const a = camTarget(s, step);
    setStageVars(el, s, a);
    el.style.setProperty("--ex", `${ux * 110}px`); el.style.setProperty("--ey", `${uy * 110}px`);
    stage.appendChild(el);
    cur = { i, stop: s, step, el, def };
    wa = $$(".wa", el).map((w) => ({ el: w, x: +w.dataset.wx, y: +w.dataset.wy, vis: true }));
    if (def.mount) def.mount.call(def, el);
    applyStep(cur, step, true);
    dirty = true;
    const delay = RM ? 0 : clamp(dur * 0.42, 0, 820);
    const c = cur;
    setTimeout(() => {
      if (cur !== c) return;
      el.classList.add("in");
      applyStep(c, c.step);
      flip(el, a);
    }, delay);
  }
  function setStageVars(el, s, a) {
    el.style.setProperty("--tx", `${a.ax * W}px`);
    el.style.setProperty("--ty", `${a.ay * H}px`);
    el.style.setProperty("--lt", `${a.ay * H - LANE * a.z}px`);
  }
  // Delt element: stoppestedet vokser ut til scenens store tittel/dato.
  function flip(el, a) {
    const f = $("[data-flip]", el);
    if (!f) return;
    f.classList.add("flipped");
    if (RM || !f.animate) return;
    const r = f.getBoundingClientRect();
    if (!r.width) return;
    const dx = a.ax * W - (r.left + r.width / 2), dy = a.ay * H - (r.top + r.height / 2);
    f.animate([
      { transform: `translate(${dx}px, ${dy}px) scale(0.04)`, opacity: 0 },
      { opacity: 1, offset: 0.35 },
      { transform: "none", opacity: 1 },
    ], { duration: 820, easing: "cubic-bezier(.2,.75,.1,1)" });
  }

  function next() { if (!cur) return; if (cur.step < stepsOf(cur.stop) - 1) setStep(cur.step + 1); else if (cur.i < ST.length - 1) goTo(cur.i + 1, 0); }
  function prev() { if (!cur) return; if (cur.step > 0) setStep(cur.step - 1); else if (cur.i > 0) goTo(cur.i - 1, stepsOf(ST[cur.i - 1]) - 1); }
  const fullt = (i) => (state.mode === "utf" ? stepsOf(ST[i]) - 1 : 0);
  function goId(id, step) { const i = IDX[id]; if (i != null) { closePanel(); goTo(i, step != null ? step : fullt(i)); } }

  function updateHash() {
    if (!cur) return;
    const h = `#${cur.stop.id}${cur.step ? "/" + cur.step : ""}`;
    try { history.replaceState(null, "", h); } catch (e) { /* file:// i enkelte nettlesere */ }
  }

  /* ---------------------------------------------------------------------
     HUD: kapittel, dato, framdrift
     --------------------------------------------------------------------- */
  function buildHUD() {
    const segs = D.KAPITLER.map((k, ki) => {
      const ss = ST.map((s, i) => [s, i]).filter(([s]) => s.kap === ki);
      return `<div class="pg-seg" style="flex:${ss.length}"><div class="pg-ticks">${ss.map(([s, i]) => `<button class="pg-t" data-i="${i}" aria-label="${esc(s.t)}" title="${esc(plain(s.t))}"></button>`).join("")}</div><span class="pg-lbl">${esc(k.kort)}</span></div>`;
    }).join("");
    hud.innerHTML = `
      <div class="hud-tl"><span class="hk-nr"></span><span class="hk-nm"></span></div>
      <div class="hud-tr"><span class="hd"></span>
        <span class="hud-btns"><button class="hb" data-act="utf">Utforsk <kbd>E</kbd></button><button class="hb" data-act="rm" aria-pressed="${RM}">Rolig bevegelse</button><button class="hb" data-act="fs">Fullskjerm <kbd>F</kbd></button><button class="hb" data-act="help" aria-label="Hurtigtaster">?</button></span></div>
      <div class="hud-rolle" hidden></div>
      <div class="hud-b"><div class="pg">${segs}</div><span class="pg-n"><b>1</b> / ${ST.length}</span></div>
      <div class="hud-nav"><button data-act="prev" aria-label="Forrige">‹</button><button data-act="next" aria-label="Neste">›</button></div>
      <p class="sr" aria-live="polite"></p>`;
  }
  let lastKap = -1;
  function updateHUD(changed) {
    if (!cur) return;
    const s = cur.stop, k = D.KAPITLER[s.kap];
    if (s.kap !== lastKap) {
      const tl = $(".hud-tl", hud);
      tl.classList.remove("swap"); void tl.offsetWidth; tl.classList.add("swap");
      $(".hk-nr", hud).textContent = k.nr ? `Kapittel ${+k.nr}` : k.kort;
      $(".hk-nm", hud).innerHTML = fmt(k.navn);
      lastKap = s.kap;
    }
    $(".hd", hud).innerHTML = fmt(s.hd || "");
    $$(".pg-t", hud).forEach((b) => { const i = +b.dataset.i; b.classList.toggle("done", i < cur.i); b.classList.toggle("cur", i === cur.i); b.classList.toggle("hl", !!state.rolle && ST[i].roller.has(state.rolle)); });
    $(".pg-n b", hud).textContent = cur.i + 1;
    if (changed) $(".sr", hud).textContent = `${k.navn}: ${plain(s.t)}`;
  }
  let idleT;
  function wake() { root.classList.add("awake"); clearTimeout(idleT); idleT = setTimeout(() => root.classList.remove("awake"), 2600); }

  /* ---------------------------------------------------------------------
     Rollefremheving og filter
     --------------------------------------------------------------------- */
  function setRolle(id) {
    state.rolle = id;
    ST.forEach((s) => s.node.el.classList.toggle("hl", !!id && s.roller.has(id)));
    root.classList.toggle("har-rolle", !!id);
    const r = $(".hud-rolle", hud);
    if (id) { r.hidden = false; r.innerHTML = `<span>Fremhevet: <b>${esc(R[id].navn)}</b></span><button data-act="norolle" aria-label="Fjern fremheving">Fjern</button>`; }
    else r.hidden = true;
    updateHUD();
    if (state.mode === "utf") renderUbar();
  }
  function setForm(id) {
    state.form = id;
    ST.forEach((s) => s.node.el.classList.toggle("dim", !!id && !s.former.includes(id)));
    if (state.mode === "utf") renderUbar();
  }

  /* ---------------------------------------------------------------------
     Utforskermodus
     --------------------------------------------------------------------- */

  function renderUbar() {
    ubar.innerHTML = `<nav class="ub" aria-label="Utforsk">
      <span class="ub-t">Utforsk</span>
      <button data-tab="kart" aria-pressed="${state.kartFri && !state.tab}">Kart</button>
      <button data-tab="oppslag" aria-pressed="${state.tab === "oppslag"}">Oppslag</button>
      <button data-tab="ansvar" aria-pressed="${state.tab === "ansvar"}">Mitt ansvar</button>
      <button data-tab="rutiner" aria-pressed="${state.tab === "rutiner"}">Rutiner</button>
      <button data-tab="plass" aria-pressed="${state.tab === "plass"}">Plassholdere <b>${igjen()}</b></button>
      <button data-tab="kilder" aria-pressed="${state.tab === "kilder"}">Kilder</button>
      <span class="ub-sp"></span>
      <button class="ub-pres" data-act="pres">Presentasjonsmodus</button></nav>
      <div class="ub-f">
        <span class="ub-fl">Eksamensform</span>${[{ id: null, navn: "Alle" }].concat(D.FORMER).map((f) => `<button class="chip" data-form="${f.id || ""}" aria-pressed="${state.form === f.id}">${f.farge ? `<i style="background:${f.farge}"></i>` : ""}${esc(f.navn)}</button>`).join("")}
        <span class="ub-fl">Rolle</span>${[{ id: null, navn: "Ingen" }].concat(ROLLE_ORDEN.map((r) => R[r])).map((r) => `<button class="chip" data-rolle="${r.id || ""}" aria-pressed="${state.rolle === r.id}">${esc(r.navn)}</button>`).join("")}
      </div>
      <p class="ub-hint">${state.kartFri ? "Dra for å flytte · rull for å zoome · klikk et stopp for å åpne det" : `<button class="lnk" data-tab="kart">‹ Tilbake til kartet</button> · piltastene går videre i reisen`}</p>`;
  }
  function setMode(m) {
    state.mode = m;
    root.classList.toggle("utf", m === "utf");
    if (m === "utf") { renderUbar(); setKartFri(true); }
    else { closePanel(); ubar.innerHTML = ""; returnToStop(); }
  }
  let kartLag = null;
  function setKartFri(on) {
    state.kartFri = on;
    root.classList.toggle("kartfri", on);
    if (!on && kartLag) { kartLag.remove(); kartLag = null; }
    if (on) {
      if (cur && !cur.dead) { leave(cur, 0, 0); cur.dead = true; }
      if (!kartLag) {
        kartLag = doc.createElement("section");
        kartLag.className = "scene sc-kart lay-overview in kartlag";
        kartLag.innerHTML = kartLabels(false);
        stage.appendChild(kartLag);
      }
      wa = $$(".wa", kartLag).map((w) => ({ el: w, x: +w.dataset.wx, y: +w.dataset.wy, vis: true }));
      const t = camOverview(false);
      t.cy -= (H * 0.04) / t.z;
      flyTo(t, durFor(t), Math.max(prog, 1));
      body.classList.add("is-overview");
      body.dataset.tema = "dark";
      ST.forEach((x) => x.node.el.classList.remove("cur"));
      $(".hd", hud).textContent = "Hele perioden";
      if (state.mode === "utf") renderUbar();
    }
  }

  function openPanel(tab, arg) {
    if (state.mode !== "utf") setMode("utf");
    state.tab = tab;
    panel.hidden = false;
    panel.innerHTML = `<div class="pn-in">${PANELS[tab](arg)}</div><button class="pn-x" data-act="lukk" aria-label="Lukk">Lukk <kbd>Esc</kbd></button>`;
    panel.scrollTop = 0;
    root.classList.add("panel-open");
    renderUbar();
    const f = $("input, button", panel); if (f) f.focus({ preventScroll: true });
  }
  function closePanel() {
    if (panel.hidden) return;
    panel.hidden = true; panel.innerHTML = ""; state.tab = null;
    root.classList.remove("panel-open");
    if (state.mode === "utf") renderUbar();
  }

  function oppslagFor(s) {
    const m = s.data && D.MILEPAELER[s.data];
    const li = (arr) => `<ul>${arr.map((x) => `<li>${fmt(x.tekst || x)}${x.type ? " " + tag(x.type, x.kontroller) : ""}</li>`).join("")}</ul>`;
    switch (s.scene) {
      case "milepael": return `<p>${fmt(m.ingress)}</p><p class="op-k">${fmt(m.naarEtikett)}: ${fmt(m.naar)}</p>${li(m.sjekkliste)}${fact(m.fakta)}`;
      case "teknisk": return `<p>${fmt(m.ingress)}</p>${li(m.enhet.map((e) => ({ tekst: `**${e.tekst}** – ${e.detalj}`, type: e.type })))}${fact(m.fakta)}`;
      case "standpunkt": return `<p>${fmt(m.ingress)}</p><ul>${m.regler.map((r) => `<li><strong>${fmt(r.naar)}:</strong> ${fmt(r.hva)}</li>`).join("")}</ul><p>${tag("lokal")} ${fmt(m.lokal)}</p>${fact(m.fakta)}`;
      case "nyordning": return `<ul>${D.NYORDNING.linjer.map((l) => `<li><s>${fmt(l.for)}</s> → <strong>${fmt(l.na)}</strong></li>`).join("")}</ul><p>${fmt(D.NYORDNING.hvorfor)}</p><p>${fmt(D.NYORDNING.unntak)}</p>${src(D.NYORDNING.kilde)}`;
      case "trekk": return `<p><strong>${fmt(D.DATOER.trekk.vis)} kl. ${esc(D.DATOER.trekk.kl)}.</strong> ${fmt(D.DATOER.trekk.tekst)}</p>${li(D.TREKK.punkter)}${src("udirTrekk")}`;
      case "tall": return `<ul>${D.TALL.map((t) => `<li><strong>${esc(t.vis)}</strong> ${fmt(t.tekst)}</li>`).join("")}</ul>${src("udirKI")}`;
      case "kalender": return `<ul class="op-kal">${D.KALENDER.map((k) => { const d = isoDate(k.dato); return `<li><strong>${d.getDate()}. mai</strong> ${k.fri ? fmt(k.fri) : k.fag && k.fag.length ? k.fag.map(([kode, n]) => `${esc(n)}${kode ? ` <code>${esc(kode)}</code>` : ""}`).join(" · ") : "<span class='mut'>Se eksamensplanen</span>"}</li>`; }).join("")}</ul><p>Kontroller fagkoder i ${src("udirPlan")}</p>`;
      case "simulering": return `<ol>${D.EKSAMENSDAG.steg.map((x) => `<li><strong>${fmt(x.kl)} ${fmt(x.tittel)}.</strong> ${fmt(x.larer)} ${tag(x.type)}</li>`).join("")}</ol>`;
      case "swim": { const A = s.data === "skriftlig" ? D.SKRIFTLIG_ANSVAR : D.MUNTLIG.ansvar; return A.rader.map((r) => `<p><strong>${esc(R[r.rolle].navn)}:</strong> ${r.celler.map((c, j) => (c ? `<em>${esc(A.faser[j])}</em> ${fmt(c)}` : "")).filter(Boolean).join(" · ")}</p>`).join(""); }
      case "rutine": return `<ol>${D.TEKNISK_RUTINE.map((r) => `<li><strong>${fmt(r.tittel)}.</strong> ${fmt(r.tekst)} ${tag(r.type)}</li>`).join("")}</ol>`;
      case "spor": return `<ul>${D.SPOR.map((p) => `<li><strong>${fmt(p.tittel)}</strong> (${fmt(p.eksempel)}): forberedelse ${fmt(p.forberedelse)}, eksamenstid ${fmt(p.gjennomforing)}. ${p.merknad ? fmt(p.merknad) : ""} ${tag(p.type)}</li>`).join("")}</ul><p>${fmt(D.DATOER.muntligPeriode.tekst)} ${fmt(D.DATOER.muntligPeriode.vis)}</p>`;
      case "seb": return `<p>${fmt(D.SEB.hva)} ${src(D.SEB.hvaKilde)}</p><ul>${D.SEB.innforing.map((r) => `<li><strong>${fmt(r.naar)}:</strong> ${fmt(r.hva)}${r.kontroller ? " " + tag("nasjonal", true) : ""} ${src(r.kilde)}</li>`).join("")}</ul><p><strong>Slik øver dere:</strong></p><ol>${D.SEB.ovelse.map((r) => `<li><strong>${fmt(r.tittel)}.</strong> ${fmt(r.tekst)} ${tag(r.type)} ${src(r.kilde)}</li>`).join("")}</ol><p>${fmt(D.SEB.unntak)}</p>`;
      case "parti": return `<ul>${D.MUNTLIG.parti.tall.map((t) => `<li><strong>${fmt(t.vis)}</strong> ${fmt(t.tekst)}</li>`).join("")}</ul>${li(D.MUNTLIG.parti.punkter)}`;
      case "trekkmuntlig": return `<p>${fmt(D.MUNTLIG.trekk.forklaring)} ${src(D.MUNTLIG.trekk.kilde)}</p>${li(D.MUNTLIG.trekk.konsekvenser)}`;
      case "forberedelse": return `<p>${fmt(D.MUNTLIG.forberedelse.tekst)} ${src(D.MUNTLIG.forberedelse.kilde)}</p>${li(D.MUNTLIG.forberedelse.punkter)}`;
      case "gjennomforing": return `<p>${fmt(D.MUNTLIG.gjennomforing.tekst)}</p>${li(D.MUNTLIG.gjennomforing.punkter)}`;
      case "sensur": return `<p><strong>${fmt(D.MUNTLIG.sensur.hovedregel)}</strong></p>${li(D.MUNTLIG.sensur.punkter)}`;
      case "roller": return `<p>Se fanen <button class="lnk" data-tab="ansvar">Mitt ansvar</button>.</p>`;
      case "scenario": { const X = D.SCENARIOER.find((x) => x.id === s.data); return `<p><em>${fmt(X.situasjon)}</em></p><p>${tag(X.regelType, X.kontroller)} ${fmt(X.regel)} ${src(X.kilde)}</p><ol>${X.gjor.map((g) => `<li>${fmt(g)}</li>`).join("")}</ol><p><strong>Kontakt:</strong> ${fmt(X.kontakt)}</p>`; }
      case "datoer": return `<ul>${Object.values(D.DATOER).map((d) => `<li><strong>${fmt(d.vis)}</strong> ${fmt(d.tekst)} ${tag(d.type, d.kontroller)}</li>`).join("")}</ul>`;
      case "feil": return `<ol>${D.FEIL.map((f) => `<li><s>${fmt(f.myte)}</s> ${fmt(f.fakta)}</li>`).join("")}</ol>`;
      case "hjelp": return `<ul>${D.HJELP.lokalt.map((h) => `<li><strong>${fmt(h.rolle)}:</strong> ${fmt(h.hvem)} ${fmt(h.kontakt)}</li>`).join("")}</ul>`;
      default: return "";
    }
  }

  const GRUPPE = { META: "Om innholdet", TREKK: "Trekket", DATOER: "Datoer", MILEPAELER: "Før eksamen", SEB: "Sikker nettleser", EKSAMENSDAG: "Eksamensdagen", SKRIFTLIG_ANSVAR: "Skriftlig – ansvar", TEKNISK_RUTINE: "Tekniske problemer", SPOR: "Eksamensformer", MUNTLIG: "Muntlig og praktisk", ROLLER: "Roller", SCENARIOER: "Når noe ikke går som planlagt", FEIL: "Feil vi skal unngå", HJELP: "Kontakter" };
  const phHint = (p) => { const m = p.tekst.match(/^Fyll inn:?\s*(.*)$/i); return m ? (m[1] || "Fyll inn") : `Bekreft: ${p.tekst}`; };
  const phKontekst = (p) => fmt(p.obj[p.prop]).split(`data-ph="${p.key}"`).join(`data-ph="${p.key}" data-cur`);

  /* Fyll inn plassholdere direkte i presentasjonen */
  function setLokal(key, val) {
    val = String(val || "").trim();
    if (val) LOKALT[key] = val; else delete LOKALT[key];
    store.set("lokalt", LOKALT);
    rerender();
    const n = $(".ph-n", panel); if (n) n.textContent = igjen();
    const b = $('[data-tab="plass"] b', ubar); if (b) b.textContent = igjen();
    const inp = $(`.ph-in[data-key="${CSS.escape(key)}"]`, panel);
    if (inp && inp !== doc.activeElement) inp.value = phVerdi(key);
    if (inp) inp.closest("li").classList.toggle("fylt", !!phVerdi(key));
  }
  // Bygg scenen på nytt der den står, uten kamerabevegelse.
  function rerender() {
    if (!cur || cur.dead) return;
    const s = cur.stop, old = cur.el;
    if (cur.def.destroy) cur.def.destroy();
    const def = SC[s.scene](s);
    const el = doc.createElement("section");
    el.className = old.className; el.style.cssText = old.style.cssText; el.setAttribute("aria-label", old.getAttribute("aria-label") || "");
    el.innerHTML = def.html;
    cur.el = el; cur.def = def;
    if (def.mount) def.mount.call(def, el);
    applyStep(cur, cur.step, true);
    $$("[data-s], [data-so]", el).forEach((e) => (e.style.transition = "none"));
    $$("[data-flip]", el).forEach((f) => f.classList.add("flipped"));
    el.classList.add("in");
    stage.replaceChild(el, old);
    requestAnimationFrame(() => $$("[data-s], [data-so]", el).forEach((e) => (e.style.transition = "")));
    wa = $$(".wa", el).map((w) => ({ el: w, x: +w.dataset.wx, y: +w.dataset.wy, vis: true }));
    if (def.step) def.step(cur.step, el);
    dirty = true;
  }
  const ed = doc.createElement("div");
  ed.id = "phedit"; ed.hidden = true; ed.setAttribute("role", "dialog");
  app.appendChild(ed);
  const redigHint = doc.createElement("p");
  redigHint.id = "redig-hint";
  redigHint.innerHTML = `<b>Fyll inn</b> Klikk på en stiplet plassholder · <kbd>R</kbd> avslutter · Lagre som ny fil under Utforsk → Plassholdere`;
  app.appendChild(redigHint);
  function setRedig(on) { state.redig = on; root.classList.toggle("redig", on); if (!on) lukkEditor(); }
  function lukkEditor() { ed.hidden = true; ed.innerHTML = ""; }
  function apneEditor(el) {
    const key = el.dataset.ph, p = PH.find((x) => x.key === key);
    if (!p) return;
    ed.dataset.key = key;
    ed.innerHTML = `<p class="eyebrow">Fyll inn</p><p class="pe-ctx">${phKontekst(p)}</p>
      <textarea rows="2" placeholder="${esc(phHint(p))}">${esc(phVerdi(key))}</textarea>
      <div class="pe-b"><button class="btn" data-pe="ok">Lagre <kbd>Enter</kbd></button><button class="lnk" data-pe="tom">Tøm</button><button class="lnk" data-pe="x">Avbryt</button></div>`;
    ed.hidden = false;
    const r = el.getBoundingClientRect(), w = ed.offsetWidth, h = ed.offsetHeight;
    ed.style.left = `${clamp(r.left, 12, W - w - 12)}px`;
    ed.style.top = `${r.bottom + 10 + h < H - 12 ? r.bottom + 10 : Math.max(12, r.top - h - 10)}px`;
    const ta = $("textarea", ed); ta.focus(); ta.select();
  }
  ed.addEventListener("click", (e) => {
    const b = e.target.closest("[data-pe]"); if (!b) return;
    if (b.dataset.pe === "ok") setLokal(ed.dataset.key, $("textarea", ed).value);
    else if (b.dataset.pe === "tom") setLokal(ed.dataset.key, "");
    lukkEditor();
  });
  ed.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); setLokal(ed.dataset.key, $("textarea", ed).value); lukkEditor(); }
    else if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); lukkEditor(); }
  });
  doc.addEventListener("click", (e) => {
    if (!state.redig || e.target.closest("#phedit")) return;
    const ph = e.target.closest("[data-ph]");
    if (!ph || ph.closest("#panel")) { if (!ed.hidden && !e.target.closest("#panel")) lukkEditor(); return; }
    e.preventDefault(); e.stopPropagation();
    apneEditor(ph);
  }, true);
  function lastNed(navn, innhold, type) {
    const a = doc.createElement("a");
    a.href = URL.createObjectURL(new Blob([innhold], { type }));
    a.download = navn;
    doc.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }
  function lagreFil() {
    const json = JSON.stringify(LOKALT, null, 1).replace(/</g, "\\u003c");
    const ny = ORIGINAL.replace(/(<script id="lokalt" type="application\/json">)[\s\S]*?(<\/script>)/, (_, a, b) => a + json + b);
    lastNed("eksamen-2026.html", ny, "text/html");
  }

  const PANELS = {
    oppslag() {
      const q = (state.q || "").toLowerCase();
      const items = ST.filter((s) => !["prolog", "kart", "portal", "hindringer", "slutt", "ansvarsum"].includes(s.scene))
        .filter((s) => !state.form || s.former.includes(state.form))
        .filter((s) => !state.rolle || s.roller.has(state.rolle));
      const rows = items.map((s) => ({ s, body: oppslagFor(s) })).filter((x) => !q || (x.s.t + " " + x.body).toLowerCase().replace(/<[^>]+>/g, "").includes(q));
      let lastK = -1;
      return `<header class="pn-h"><p class="eyebrow">Oppslagsverk</p><h2>Alt på ett sted</h2>
        <p class="lede">Hele innholdet i presentasjonen, i kronologisk rekkefølge. Filtrer på eksamensform og rolle i linja over.</p>
        <div class="pn-tools"><input type="search" class="pn-q" placeholder="Søk – f.eks. «sykdom», «standpunkt», «sensor»" value="${esc(state.q || "")}" aria-label="Søk i oppslagsverket"><button class="btn" data-act="print">Skriv ut</button></div>
        <p class="pn-n">${rows.length} treff${state.form ? ` · ${esc(FORM[state.form].navn)}` : ""}${state.rolle ? ` · ${esc(R[state.rolle].navn)}` : ""}</p></header>
        <div class="op">${rows.map(({ s, body: b }) => { const head = s.kap !== lastK ? `<h3 class="op-kap"><span>${esc(D.KAPITLER[s.kap].nr || "")}</span>${fmt(D.KAPITLER[s.kap].navn)}</h3>` : ""; lastK = s.kap; return `${head}<article class="op-a"><div class="op-d">${fmt(s.hd || "")}</div><div class="op-b"><h4>${fmt(s.t)}</h4>${b}<p class="op-meta">${s.former.map((f) => `<i style="background:${FORM[f].farge}" title="${esc(FORM[f].navn)}"></i>`).join("")}<button class="lnk" data-go="${s.id}">Vis i reisen</button></p></div></article>`; }).join("") || `<p class="mut">Ingen treff.</p>`}</div>`;
    },
    ansvar(id) {
      id = id || state.rolle || "faglarer";
      const r = R[id];
      return `<header class="pn-h"><p class="eyebrow">Mitt ansvar</p><h2>${esc(r.navn)}</h2><p class="lede">${fmt(r.ansvar)}</p>
        <div class="pn-tools">${ROLLE_ORDEN.map((x) => `<button class="chip" data-panrolle="${x}" aria-pressed="${x === id}">${esc(R[x].navn)}</button>`).join("")}</div>
        <p><button class="btn" data-hl="${id}" aria-pressed="${state.rolle === id}">${state.rolle === id ? "Fremhevet på tidslinjen" : "Fremhev på tidslinjen"}</button></p></header>
        <div class="an">${D.FASER.map((f) => { const o = r.oppgaver.filter((x) => x.fase === f.id); return `<section class="an-f${o.length ? "" : " tom"}"><h3><i></i>${esc(f.navn)}</h3>${o.map((x) => `<div class="an-o"><p>${fmt(x.tekst)}</p><button class="lnk" data-go="${x.stopp}">Vis i reisen</button></div>`).join("") || `<p class="mut">Ingen faste oppgaver.</p>`}</section>`; }).join("")}</div>
        <p class="mut">Samarbeider tettest med: ${r.samarbeid.map((x) => esc(R[x].navn)).join(", ")}.</p>`;
    },
    rutiner() {
      return `<header class="pn-h"><p class="eyebrow">Rutiner</p><h2>Når noe ikke går som planlagt</h2><p class="lede">Regelen, hva du gjør og hvem du kontakter. Skriv gjerne ut og legg i eksamenslokalet.</p><div class="pn-tools"><button class="btn" data-act="print">Skriv ut</button></div></header>
        <div class="ru-p">${D.SCENARIOER.map((X) => `<article class="op-a"><div class="op-d">${X.nr}</div><div class="op-b"><h4>${fmt(X.tittel)}</h4><p>${tag(X.regelType, X.kontroller)} ${fmt(X.regel)} ${src(X.kilde)}</p><ol>${X.gjor.map((g) => `<li>${fmt(g)}</li>`).join("")}</ol><p><strong>Kontakt:</strong> ${fmt(X.kontakt)}</p><p class="op-meta"><button class="lnk" data-go="k5-${X.id}">Vis i reisen</button></p></div></article>`).join("")}
        <article class="op-a"><div class="op-d">IT</div><div class="op-b"><h4>Tekniske problemer – steg for steg</h4>${oppslagFor(ST[IDX["k2-teknisk"]])}</div></article></div>`;
    },
    plass() {
      const g = {};
      PH.forEach((p) => { const k = p.path.split(".")[0]; (g[k] = g[k] || []).push(p); });
      return `<header class="pn-h"><p class="eyebrow">Lokale opplysninger</p><h2><span class="ph-n">${igjen()}</span> av ${PH.length} gjenstår</h2>
        <p class="lede">Skriv svarene rett inn her – de vises med en gang i presentasjonen. Du kan også trykke <kbd>R</kbd> og klikke på en stiplet plassholder i selve presentasjonen.</p>
        <div class="pn-tools"><button class="btn" data-act="lagre">Lagre som ny fil</button><button class="btn" data-act="redig">Fyll inn i presentasjonen <kbd>R</kbd></button><button class="btn" data-act="json">Last ned verdiene (JSON)</button><button class="lnk" data-act="nullstill">Nullstill</button></div>
        <p class="mut">Svarene huskes i denne nettleseren. Trykk «Lagre som ny fil» og del den nye fila – da får alle kollegene med seg svarene.</p></header>
        <div class="ph-l">${Object.keys(g).map((k) => `<section><h3>${esc(GRUPPE[k] || k)}</h3><ul>${g[k].map((p) => `<li class="${phVerdi(p.key) ? "fylt" : ""}"><p class="ph-ctx">${phKontekst(p)}</p><input class="ph-in" data-key="${esc(p.key)}" value="${esc(phVerdi(p.key))}" placeholder="${esc(phHint(p))}" aria-label="${esc(phHint(p))}"></li>`).join("")}</ul></section>`).join("")}</div>`;
    },
    kilder() {
      return `<header class="pn-h"><p class="eyebrow">Kilder</p><h2>Hvor kommer innholdet fra?</h2>
        <p class="lede">Nasjonale regler og datoer er hentet fra Utdanningsdirektoratet, opplæringsforskrifta og Statsforvalteren. Lokale rutiner er merket som plassholdere til de er avklart ved skolen. Punkter merket <em>Kontroller</em> har kilder som spriker – sjekk siste versjon.</p></header>
        <ul class="ki">${Object.entries(D.KILDER).map(([k, v]) => `<li><a href="${esc(v.url)}" target="_blank" rel="noopener">${esc(v.navn)}</a><span>${esc(v.url)}</span></li>`).join("")}</ul>
        <div class="ki-forkl"><p>${tag("nasjonal")} Regel fra forskrift eller Udir – gjelder alle skoler.</p><p>${tag("lokal")} Rutine ved Hustadvika vgs eller i Møre og Romsdal.</p><p>${tag("tips")} Anbefaling og praktiske råd.</p></div>
        <p class="mut">Sist gjennomgått: ${fmt(D.META.sistOppdatert)} · Ansvarlig: ${fmt(D.META.ansvarligForInnhold)}</p>`;
    },
  };

  /* ---------------------------------------------------------------------
     Hjelp-overlegg
     --------------------------------------------------------------------- */
  help.innerHTML = `<div class="hp-in"><p class="eyebrow">Hurtigtaster</p><h2>Styr reisen</h2><dl>
    <div><dt><kbd>→</kbd> <kbd>Mellomrom</kbd></dt><dd>Neste steg</dd></div>
    <div><dt><kbd>←</kbd></dt><dd>Forrige steg</dd></div>
    <div><dt><kbd>PgDn</kbd> <kbd>PgUp</kbd></dt><dd>Neste / forrige stopp</dd></div>
    <div><dt><kbd>0</kbd>–<kbd>6</kbd></dt><dd>Hopp til kart, kapittel 1–5 og epilog</dd></div>
    <div><dt><kbd>Home</kbd> <kbd>End</kbd></dt><dd>Start / slutt</dd></div>
    <div><dt><kbd>E</kbd></dt><dd>Utforskermodus – kart, oppslag, mitt ansvar</dd></div>
    <div><dt><kbd>F</kbd></dt><dd>Fullskjerm</dd></div>
    <div><dt><kbd>M</kbd></dt><dd>Rolig bevegelse av/på</dd></div>
    <div><dt><kbd>R</kbd></dt><dd>Fyll inn plassholdere direkte i presentasjonen</dd></div>
    <div><dt><kbd>Esc</kbd></dt><dd>Lukk</dd></div></dl>
    <p class="mut">Tips: Klikk på et stoppested på tidslinjen for å hoppe dit.</p><button class="btn" data-act="help">Lukk</button></div>`;
  const toggleHelp = (on) => { help.hidden = on == null ? !help.hidden : !on; };

  /* ---------------------------------------------------------------------
     Hendelser
     --------------------------------------------------------------------- */
  const KAP_HOPP = ["p-kart", "k1-portal", "k2-portal", "k3-portal", "k4-roller", "k5-intro", "e-datoer"];
  function setRM(v) { RM = v; root.classList.toggle("rm", RM); store.set("rolig", RM); const b = $('[data-act="rm"]', hud); if (b) b.setAttribute("aria-pressed", RM); }
  function fullscreen() { const el = doc.fullscreenElement; if (el) doc.exitFullscreen && doc.exitFullscreen(); else root.requestFullscreen && root.requestFullscreen().catch(() => {}); }

  doc.addEventListener("keydown", (e) => {
    if (e.target.closest && e.target.closest("input, textarea, select")) { if (e.key === "Escape") e.target.blur(); return; }
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const k = e.key;
    if (k === "Escape") { if (!ed.hidden) lukkEditor(); else if (!help.hidden) toggleHelp(false); else if (!panel.hidden) closePanel(); else if (state.redig) setRedig(false); else if (state.mode === "utf") setMode("pres"); return; }
    if (!panel.hidden && ["ArrowUp", "ArrowDown", "PageUp", "PageDown", " ", "Home", "End"].includes(k)) return; // la panelet rulle
    if (k === "ArrowRight" || k === "ArrowDown" || (k === " " && !e.shiftKey)) { e.preventDefault(); if (state.kartFri) returnToStop(); else next(); }
    else if (k === "ArrowLeft" || k === "ArrowUp" || (k === " " && e.shiftKey)) { e.preventDefault(); if (state.kartFri) returnToStop(); else prev(); }
    else if (k === "PageDown") { e.preventDefault(); if (cur) goTo(cur.i + 1); }
    else if (k === "PageUp") { e.preventDefault(); if (cur) goTo(cur.i - 1); }
    else if (k === "Home") { e.preventDefault(); goTo(0); }
    else if (k === "End") { e.preventDefault(); goTo(ST.length - 1); }
    else if (/^[0-6]$/.test(k)) goId(KAP_HOPP[+k], 0);
    else if (k === "e" || k === "E") setMode(state.mode === "utf" ? "pres" : "utf");
    else if (k === "f" || k === "F") fullscreen();
    else if (k === "m" || k === "M") setRM(!RM);
    else if (k === "r" || k === "R") { closePanel(); setRedig(!state.redig); }
    else if (k === "?" || k === "h" || k === "H") toggleHelp();
    else return;
    wake();
  });
  function returnToStop() {
    setKartFri(false);
    if (!cur) return;
    if (cur.dead) goTo(cur.i, cur.step);
    else { const t = camTarget(cur.stop, cur.step); flyTo(t, durFor(t), progTarget(cur.stop, cur.step)); body.dataset.tema = cur.stop.tema; }
  }

  doc.addEventListener("click", (e) => {
    const t = e.target;
    const act = t.closest("[data-act]");
    if (act) {
      const a = act.dataset.act;
      if (a === "utf") setMode(state.mode === "utf" ? "pres" : "utf");
      else if (a === "pres") setMode("pres");
      else if (a === "fs") fullscreen();
      else if (a === "rm") setRM(!RM);
      else if (a === "help") toggleHelp();
      else if (a === "prev") prev();
      else if (a === "next") next();
      else if (a === "lukk") closePanel();
      else if (a === "norolle") setRolle(null);
      else if (a === "print") window.print();
      else if (a === "lagre") lagreFil();
      else if (a === "json") lastNed("lokalt.json", JSON.stringify(LOKALT, null, 2), "application/json");
      else if (a === "redig") { closePanel(); setRedig(true); }
      else if (a === "nullstill") { if (confirm("Fjerne alle svar som er fylt inn i denne nettleseren?")) { LOKALT = Object.assign({}, LOKALT_FIL); store.set("lokalt", {}); rerender(); openPanel("plass"); } }
      return;
    }
    const tab = t.closest("[data-tab]");
    if (tab) { const v = tab.dataset.tab; if (v === "kart") { closePanel(); setKartFri(true); } else openPanel(v); return; }
    const pr = t.closest("[data-panrolle]");
    if (pr) { openPanel("ansvar", pr.dataset.panrolle); return; }
    const hl = t.closest("[data-hl]");
    if (hl && !t.closest(".scene")) { setRolle(state.rolle === hl.dataset.hl ? null : hl.dataset.hl); if (state.tab === "ansvar") openPanel("ansvar", hl.dataset.hl); return; }
    const fo = t.closest("[data-form]");
    if (fo) { setForm(fo.dataset.form || null); if (state.tab === "oppslag") openPanel("oppslag"); return; }
    const ro = t.closest("[data-rolle]");
    if (ro) { setRolle(ro.dataset.rolle || null); if (state.tab === "oppslag") openPanel("oppslag"); return; }
    const go = t.closest("[data-go]");
    if (go) { e.preventDefault(); const was = state.kartFri; goId(go.dataset.go); if (was) renderUbar(); return; }
    const stn = t.closest(".stn");
    if (stn && !drag.moved) { goTo(+stn.dataset.i, fullt(+stn.dataset.i)); if (state.mode === "utf") renderUbar(); return; }
    const pg = t.closest(".pg-t");
    if (pg) { goTo(+pg.dataset.i, fullt(+pg.dataset.i)); if (state.mode === "utf") renderUbar(); }
  });
  let phT;
  panel.addEventListener("input", (e) => {
    if (e.target.classList.contains("ph-in")) {
      const t = e.target;
      clearTimeout(phT); phT = setTimeout(() => setLokal(t.dataset.key, t.value), 350);
      return;
    }
    if (e.target.classList.contains("pn-q")) {
      state.q = e.target.value;
      const pos = e.target.selectionStart;
      openPanel("oppslag");
      const q = $(".pn-q", panel); q.focus(); q.setSelectionRange(pos, pos);
    }
  });

  // Fri navigering i kartet: dra for å panorere, rull for å zoome.
  const drag = { on: false, moved: false, x: 0, y: 0 };
  app.addEventListener("pointerdown", (e) => {
    if (!state.kartFri || e.button !== 0 || e.target.closest("#hud, #ubar, #panel, .scene button, .scene a")) return;
    drag.on = true; drag.moved = false; drag.x = e.clientX; drag.y = e.clientY; tween = null;
  });
  window.addEventListener("pointermove", (e) => {
    wake();
    if (!drag.on) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) drag.moved = true;
    cam.cx -= dx / cam.z; cam.cy -= dy / cam.z; drag.x = e.clientX; drag.y = e.clientY; dirty = true;
  });
  window.addEventListener("pointerup", () => { drag.on = false; setTimeout(() => (drag.moved = false), 0); });

  let wheelAcc = 0, wheelLock = 0;
  window.addEventListener("wheel", (e) => {
    if (e.target.closest("#panel")) return;
    if (state.kartFri) {
      e.preventDefault(); tween = null;
      const f = Math.exp(-e.deltaY * 0.0016), oz = camOverview(false).z;
      const nz = clamp(cam.z * f, oz * 0.7, 1.4 * S);
      const wx = cam.cx + (e.clientX - W / 2) / cam.z, wy = cam.cy + (e.clientY - H / 2) / cam.z;
      cam.cx = wx - (e.clientX - W / 2) / nz; cam.cy = wy - (e.clientY - H / 2) / nz; cam.z = nz; dirty = true;
      return;
    }
    // La innhold som kan rulle, rulle (små skjermer).
    let n = e.target;
    while (n && n !== doc.body) { if (n.scrollHeight > n.clientHeight + 2 && /(auto|scroll)/.test(getComputedStyle(n).overflowY)) { const atEnd = e.deltaY > 0 ? n.scrollTop + n.clientHeight >= n.scrollHeight - 2 : n.scrollTop <= 0; if (!atEnd) return; } n = n.parentElement; }
    const now = performance.now();
    if (now < wheelLock) return;
    wheelAcc += e.deltaY;
    if (Math.abs(wheelAcc) > 70) { wheelAcc > 0 ? next() : prev(); wheelAcc = 0; wheelLock = now + 650; }
  }, { passive: false });

  let touch = null;
  window.addEventListener("touchstart", (e) => { if (e.touches.length === 1 && !state.kartFri) touch = { x: e.touches[0].clientX, y: e.touches[0].clientY, t: Date.now() }; }, { passive: true });
  window.addEventListener("touchend", (e) => {
    if (!touch || !panel.hidden) return;
    const t = e.changedTouches[0], dx = t.clientX - touch.x, dy = t.clientY - touch.y;
    if (Date.now() - touch.t < 600 && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.4) dx < 0 ? next() : prev();
    touch = null;
  });

  window.addEventListener("resize", () => {
    measure();
    if (state.kartFri) { const t = camOverview(false); cam.cx = t.cx; cam.cy = t.cy; cam.z = t.z; }
    else if (cur && !cur.dead) { const t = camTarget(cur.stop, cur.step); flyTo(t, 0, progTarget(cur.stop, cur.step)); setStageVars(cur.el, cur.stop, t); }
  });
  window.addEventListener("hashchange", () => { const [id, st0] = location.hash.slice(1).split("/"); if (IDX[id] != null && (!cur || cur.stop.id !== id)) goTo(IDX[id], +st0 || 0); });

  /* ---------------------------------------------------------------------
     Start
     --------------------------------------------------------------------- */
  measure();
  buildHUD();
  setRM(RM);
  requestAnimationFrame(frame);
  const [hid, hst] = location.hash.slice(1).split("/");
  if (IDX[hid] != null) {
    goTo(IDX[hid], +hst || 0, { instant: true });
  } else {
    // Åpningen: linja tegnes inn fra venstre mens «2026» reiser seg.
    const t = camTarget(ST[0], 0);
    cam.cx = t.cx; cam.cy = t.cy; cam.z = t.z; prog = 0;
    goTo(0, 0, { instant: true });
    prog = 0;
    flyTo(t, RM ? 0 : 2400, progTarget(ST[0], 0));
  }
  root.classList.add("startet");
  wake();
})();

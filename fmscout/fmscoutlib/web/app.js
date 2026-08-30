"use strict";

// fmscout – all filtrering skjer på serversida, denne fila tegner og spør.

const $ = (v) => document.querySelector(v);
const lag = (tag, klasse, tekst) => {
  const e = document.createElement(tag);
  if (klasse) e.className = klasse;
  if (tekst !== undefined) e.textContent = tekst;
  return e;
};

const LAGERNOKKEL = "fmscout-tilstand-v1";
const OMRADEFORVALG = ["alder", "ca", "pa", "rom", "verdi", "lonn", "rykte"];
const FORVALGSSETT = {
  "Standard": null,
  "Nøkkeltall": ["navn", "alder", "klubb", "posisjoner", "ca", "pa", "rom", "verdi", "lonn"],
  "Teknisk": "Teknisk", "Mental": "Mental", "Fysisk": "Fysisk",
  "Keeper": "Keeper", "Skjult": "Skjult",
  "Alt": "alt",
};

let meta = null;
let feltFor = {};
let tilstand = {
  tekst: "", fasetter: {}, posisjoner: [], posisjonsmodus: "en",
  omrader: {}, attributtkrav: [], bare_utfylt: [],
  sortering: [{ nokkel: "ca", retning: "ned" }],
  side: 0, sidestorrelse: 100, kolonner: [],
};
let sisteSvar = null;
let teller = 0;

// ---------- oppstart ----------

async function start() {
  meta = await (await fetch("/api/meta")).json();
  meta.kolonner.forEach((k) => (feltFor[k.nokkel] = k));
  $("#kilde").textContent = meta.navn || meta.kilde || "";
  $("#kilde").title = meta.kilde || "";
  document.title = meta.navn ? `fmscout – ${meta.navn}` : "fmscout";

  hentLagret();
  if (!tilstand.kolonner.length) tilstand.kolonner = meta.standardkolonner.slice();
  tilstand.kolonner = tilstand.kolonner.filter((k) => feltFor[k]);
  if (!tilstand.kolonner.length) tilstand.kolonner = meta.standardkolonner.slice();

  byggFiltre();
  byggKolonnevalg();
  koble();
  if (meta.merknader && meta.merknader.length) visMerknader(meta.merknader);
  sok();
}

function hentLagret() {
  try {
    const lagret = JSON.parse(localStorage.getItem(LAGERNOKKEL) || "null");
    if (lagret && lagret.kilde === meta.kilde) Object.assign(tilstand, lagret.tilstand, { side: 0 });
  } catch (e) { /* første gang, eller ryddet nettleser */ }
}

function lagre() {
  try {
    localStorage.setItem(LAGERNOKKEL, JSON.stringify({ kilde: meta.kilde, tilstand }));
  } catch (e) { /* privat vindu – da husker vi bare ikke */ }
}

function visMerknader(merknader) {
  const boks = lag("div", "sammendrag");
  boks.style.color = "var(--middels)";
  boks.textContent = "⚠︎ " + merknader.join("  ·  ");
  $("#sammendrag").after(boks);
}

// ---------- filterpanelet ----------

function bolk(tittel, apen) {
  const d = lag("details", "bolk");
  d.open = !!apen;
  const s = lag("summary");
  s.append(lag("span", null, tittel));
  d.append(s);
  const inn = lag("div", "bolkinnhold");
  d.append(inn);
  return { rot: d, inn, summary: s };
}

function byggFiltre() {
  const rot = $("#filterinnhold");
  rot.textContent = "";

  // Posisjoner
  if (meta.posisjoner.length) {
    const b = bolk("Posisjoner", true);
    const modus = lag("select");
    [["en", "minst én av dem"], ["alle", "alle sammen"]].forEach(([v, t]) => {
      const o = lag("option", null, t); o.value = v; modus.append(o);
    });
    modus.value = tilstand.posisjonsmodus;
    modus.onchange = () => { tilstand.posisjonsmodus = modus.value; sok(true); };

    const brikker = lag("div", "brikker");
    meta.posisjoner.forEach((p) => {
      const knapp = lag("span", "brikke", `${p.verdi} (${p.antall})`);
      knapp.dataset.verdi = p.verdi;
      if (tilstand.posisjoner.includes(p.verdi)) knapp.classList.add("på");
      knapp.onclick = () => {
        const i = tilstand.posisjoner.indexOf(p.verdi);
        if (i >= 0) tilstand.posisjoner.splice(i, 1); else tilstand.posisjoner.push(p.verdi);
        knapp.classList.toggle("på");
        oppdaterTeller(b.summary, tilstand.posisjoner.length);
        sok(true);
      };
      brikker.append(knapp);
    });
    const grupper = lag("div", "brikker");
    Object.entries(meta.posisjonsgrupper || {}).forEach(([navn, liste]) => {
      const knapp = lag("span", "brikke", navn);
      knapp.onclick = () => {
        tilstand.posisjoner = liste.filter((p) => meta.posisjoner.some((m) => m.verdi === p));
        byggFiltre(); sok(true);
      };
      grupper.append(knapp);
    });
    b.inn.append(modus, brikker, grupper);
    oppdaterTeller(b.summary, tilstand.posisjoner.length);
    rot.append(b.rot);
  }

  // Tallområder
  const omrade = bolk("Tall", true);
  const valgte = new Set([...OMRADEFORVALG.filter((f) => meta.grenser[f]),
                          ...Object.keys(tilstand.omrader)]);
  valgte.forEach((felt) => omrade.inn.append(omradeRad(felt, omrade.summary)));
  const legg = lag("select");
  legg.append(lag("option", null, "+ legg til tallfilter"));
  Object.keys(meta.grenser).filter((f) => !valgte.has(f)).forEach((f) => {
    const o = lag("option", null, (feltFor[f] || {}).navn || f); o.value = f; legg.append(o);
  });
  legg.onchange = () => {
    if (!legg.value) return;
    tilstand.omrader[legg.value] = { min: null, maks: null };
    byggFiltre();
  };
  omrade.inn.append(legg);
  oppdaterTeller(omrade.summary, Object.values(tilstand.omrader)
    .filter((o) => o.min != null || o.maks != null).length);
  rot.append(omrade.rot);

  // Attributtkrav
  const krav = bolk("Attributtkrav", tilstand.attributtkrav.length > 0);
  tegnKrav(krav);
  rot.append(krav.rot);

  // Fasetter
  Object.entries(meta.fasetter).forEach(([felt, verdier]) => {
    if (!verdier.length) return;
    const navn = (feltFor[felt] || {}).navn || felt;
    const b = bolk(navn, false);
    const sokefelt = lag("input", "sokefelt");
    sokefelt.type = "search";
    sokefelt.placeholder = `Søk i ${navn.toLowerCase()} …`;
    const liste = lag("div", "avkryss");
    const tegn = () => {
      liste.textContent = "";
      const q = sokefelt.value.toLowerCase();
      const valgt = new Set(tilstand.fasetter[felt] || []);
      const treff = verdier.filter((v) => !q || String(v.verdi).toLowerCase().includes(q));
      treff.slice(0, 400).forEach((v) => {
        const l = lag("label");
        const boks = lag("input");
        boks.type = "checkbox";
        boks.checked = valgt.has(v.verdi);
        boks.onchange = () => {
          const nå = new Set(tilstand.fasetter[felt] || []);
          if (boks.checked) nå.add(v.verdi); else nå.delete(v.verdi);
          tilstand.fasetter[felt] = [...nå];
          if (!tilstand.fasetter[felt].length) delete tilstand.fasetter[felt];
          oppdaterTeller(b.summary, (tilstand.fasetter[felt] || []).length);
          sok(true);
        };
        l.append(boks, lag("span", null, String(v.verdi)), lag("span", "antall", v.antall));
        liste.append(l);
      });
      if (treff.length > 400) liste.append(lag("div", "antall", `… og ${treff.length - 400} til`));
    };
    sokefelt.oninput = tegn;
    tegn();
    b.inn.append(sokefelt, liste);
    oppdaterTeller(b.summary, (tilstand.fasetter[felt] || []).length);
    rot.append(b.rot);
  });
}

function oppdaterTeller(summary, antall) {
  let merke = summary.querySelector(".valgt");
  if (!merke) { merke = lag("span", "valgt"); summary.append(merke); }
  merke.textContent = antall ? `${antall} valgt` : "";
}

function omradeRad(felt, summary) {
  const rad = lag("div", "parinput");
  const grense = meta.grenser[felt] || [0, 200];
  const navn = (feltFor[felt] || {}).navn || felt;
  rad.append(lag("label", null, navn));
  const verdier = tilstand.omrader[felt] || { min: null, maks: null };
  ["min", "maks"].forEach((side) => {
    const inn = lag("input");
    inn.type = "number";
    inn.placeholder = side === "min" ? Math.floor(grense[0]) : Math.ceil(grense[1]);
    if (verdier[side] != null) inn.value = verdier[side];
    inn.onchange = () => {
      const tall = inn.value === "" ? null : Number(inn.value);
      tilstand.omrader[felt] = { ...(tilstand.omrader[felt] || {}), [side]: tall };
      const o = tilstand.omrader[felt];
      if (o.min == null && o.maks == null) delete tilstand.omrader[felt];
      oppdaterTeller(summary, Object.values(tilstand.omrader)
        .filter((x) => x.min != null || x.maks != null).length);
      sok(true);
    };
    rad.append(inn);
  });
  return rad;
}

function tegnKrav(b) {
  b.inn.textContent = "";
  const attributter = meta.kolonner.filter((k) =>
    ["Teknisk", "Keeper", "Mental", "Fysisk", "Skjult", "Avledet"].includes(k.gruppe));
  tilstand.attributtkrav.forEach((krav, nr) => {
    const rad = lag("div", "kravrad");
    const velg = lag("select");
    attributter.forEach((a) => {
      const o = lag("option", null, a.navn); o.value = a.nokkel;
      if (a.nokkel === krav.nokkel) o.selected = true;
      velg.append(o);
    });
    velg.onchange = () => { krav.nokkel = velg.value; sok(true); };
    const min = lag("input");
    min.type = "number"; min.placeholder = "min"; min.value = krav.min ?? "";
    min.onchange = () => { krav.min = min.value === "" ? null : Number(min.value); sok(true); };
    const bort = lag("button", "knapp liten", "×");
    bort.onclick = () => { tilstand.attributtkrav.splice(nr, 1); tegnKrav(b); sok(true); };
    rad.append(velg, min, bort);
    b.inn.append(rad);
  });
  const legg = lag("button", "lenkeknapp", "+ legg til krav");
  legg.onclick = () => {
    tilstand.attributtkrav.push({ nokkel: attributter[0] && attributter[0].nokkel, min: 14 });
    b.rot.open = true; tegnKrav(b); sok(true);
  };
  b.inn.append(legg);
  oppdaterTeller(b.summary, tilstand.attributtkrav.length);
}

// ---------- kolonnevelger ----------

function byggKolonnevalg() {
  const rot = $("#kolonnevalg");
  rot.textContent = "";
  const grupper = {};
  meta.kolonner.forEach((k) => (grupper[k.gruppe] = grupper[k.gruppe] || []).push(k));
  Object.entries(grupper).forEach(([gruppe, felt]) => {
    const boks = lag("div", "kolonnegruppe");
    boks.append(lag("h4", null, gruppe));
    felt.forEach((f) => {
      const l = lag("label");
      const inn = lag("input");
      inn.type = "checkbox";
      inn.checked = tilstand.kolonner.includes(f.nokkel);
      inn.dataset.nokkel = f.nokkel;
      inn.onchange = () => {
        if (inn.checked) {
          if (!tilstand.kolonner.includes(f.nokkel)) tilstand.kolonner.push(f.nokkel);
        } else {
          tilstand.kolonner = tilstand.kolonner.filter((k) => k !== f.nokkel);
        }
        $("#kolonnetelling").textContent = `${tilstand.kolonner.length} kolonner valgt`;
      };
      l.append(inn, lag("span", null, f.navn));
      if (f.hjelp) l.title = f.hjelp;
      boks.append(l);
    });
    rot.append(boks);
  });

  const forvalg = $("#forvalg");
  forvalg.textContent = "";
  Object.entries(FORVALGSSETT).forEach(([navn, spec]) => {
    const knapp = lag("span", "brikke", navn);
    knapp.onclick = () => {
      let nye;
      if (spec === null) nye = meta.standardkolonner.slice();
      else if (spec === "alt") nye = meta.kolonner.map((k) => k.nokkel);
      else if (Array.isArray(spec)) nye = spec.filter((k) => feltFor[k]);
      else nye = ["navn", "alder", "klubb", "ca", "pa"].filter((k) => feltFor[k])
        .concat(meta.kolonner.filter((k) => k.gruppe === spec).map((k) => k.nokkel));
      tilstand.kolonner = nye;
      byggKolonnevalg();
      $("#kolonnetelling").textContent = `${nye.length} kolonner valgt`;
    };
    forvalg.append(knapp);
  });
  $("#kolonnetelling").textContent = `${tilstand.kolonner.length} kolonner valgt`;
}

// ---------- søk og tabell ----------

let tidsavbrudd = null;
function sok(nullstillSide) {
  if (nullstillSide) tilstand.side = 0;
  clearTimeout(tidsavbrudd);
  tidsavbrudd = setTimeout(utfor, 60);
}

async function utfor() {
  const mitt = ++teller;
  lagre();
  const svar = await fetch("/api/sok", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tilstand),
  });
  const data = await svar.json();
  if (mitt !== teller) return;              // et nyere søk er allerede på vei
  if (data.feil) { $("#treffinfo").textContent = "Feil: " + data.feil; return; }
  sisteSvar = data;
  tegnTabell(data);
}

function tegnTabell(data) {
  $("#treffinfo").innerHTML = `<b>${data.total.toLocaleString("nb-NO")}</b> spillere`;
  $("#sidetall").textContent = `${data.side + 1} / ${data.sider}`;
  $("#forrige").disabled = data.side === 0;
  $("#neste").disabled = data.side + 1 >= data.sider;

  const sammendrag = $("#sammendrag");
  sammendrag.textContent = "";
  Object.entries(data.sammendrag || {}).forEach(([felt, tall]) => {
    const navn = (feltFor[felt] || {}).navn || felt;
    const s = lag("span");
    s.innerHTML = `${navn} snitt <b>${formater(felt, tall.snitt)}</b> · høyest <b>${formater(felt, tall.maks)}</b>`;
    sammendrag.append(s);
  });

  const hode = $("#hodemal");
  hode.textContent = "";
  data.kolonner.forEach((nokkel) => {
    const felt = feltFor[nokkel] || { navn: nokkel, type: "tekst" };
    const th = lag("th", null, felt.navn);
    if (felt.hjelp) th.title = felt.hjelp;
    const sort = tilstand.sortering.find((s) => s.nokkel === nokkel);
    if (sort) th.append(lag("span", "pil", sort.retning === "ned" ? " ▼" : " ▲"));
    th.onclick = (e) => {
      const nå = tilstand.sortering[0];
      const retning = nå && nå.nokkel === nokkel && nå.retning === "ned" ? "opp" : "ned";
      const ny = { nokkel, retning };
      tilstand.sortering = e.shiftKey
        ? [ny, ...tilstand.sortering.filter((s) => s.nokkel !== nokkel)].slice(0, 3)
        : [ny];
      sok(true);
    };
    hode.append(th);
  });

  const kropp = $("#kropp");
  kropp.textContent = "";
  data.rader.forEach((rad) => {
    const tr = lag("tr");
    tr.dataset.nr = rad[0];
    data.kolonner.forEach((nokkel, i) => {
      const felt = feltFor[nokkel] || { type: "tekst" };
      const verdi = rad[i + 1];
      const td = lag("td");
      if (nokkel === "navn") td.className = "navn";
      else if (felt.type === "tall" || felt.type === "penger") td.className = "tall";
      td.textContent = formater(nokkel, verdi);
      if (erAttributt(felt) && typeof verdi === "number") {
        td.classList.add("a", "a" + niva(verdi));
      }
      tr.append(td);
    });
    tr.onclick = () => visSpiller(rad[0]);
    kropp.append(tr);
  });
  $("#tomt").classList.toggle("skjult", data.rader.length > 0);
}

function erAttributt(felt) {
  return ["Teknisk", "Keeper", "Mental", "Fysisk", "Skjult"].includes(felt.gruppe);
}

function niva(v) {
  if (v <= 5) return 1;
  if (v <= 9) return 2;
  if (v <= 13) return 3;
  if (v <= 16) return 4;
  return 5;
}

function formater(nokkel, verdi) {
  if (verdi === null || verdi === undefined || verdi === "") return "–";
  const felt = feltFor[nokkel];
  if (felt && felt.type === "penger" && typeof verdi === "number") {
    try {
      return new Intl.NumberFormat("nb-NO", { notation: "compact", maximumFractionDigits: 1 }).format(verdi);
    } catch (e) {
      return Math.round(verdi).toLocaleString("nb-NO");
    }
  }
  if (typeof verdi === "number") {
    return Number.isInteger(verdi) ? verdi.toLocaleString("nb-NO") : verdi.toFixed(1).replace(".", ",");
  }
  if (Array.isArray(verdi)) return verdi.join(", ");
  return String(verdi);
}

// ---------- spillerkortet ----------

async function visSpiller(nr) {
  const rad = await (await fetch("/api/spiller?nr=" + nr)).json();
  const rot = $("#detaljinnhold");
  rot.textContent = "";
  rot.append(lag("h3", null, rad.navn || "Uten navn"));
  const under = [rad.alder ? rad.alder + " år" : null, rad.posisjoner, rad.klubb, rad.nasjonalitet]
    .filter(Boolean).join(" · ");
  rot.append(lag("div", "under", under));

  const tall = lag("div", "nokkeltall");
  [["ca", "CA"], ["pa", "PA"], ["rom", "Rom"], ["verdi", "Verdi"], ["lonn", "Lønn"],
   ["rykte", "Rykte"]].forEach(([nokkel, navn]) => {
    if (rad[nokkel] === undefined || rad[nokkel] === null) return;
    const boks = lag("div");
    boks.append(lag("small", null, navn), lag("b", null, formater(nokkel, rad[nokkel])));
    tall.append(boks);
  });
  rot.append(tall);

  Object.entries(meta.attributtgrupper).forEach(([gruppe, nokler]) => {
    const med = nokler.filter((n) => typeof rad[n] === "number");
    if (!med.length) return;
    const boks = lag("div", "attgruppe");
    boks.append(lag("h4", null, gruppe));
    med.sort((a, b) => rad[b] - rad[a]).forEach((n) => {
      const linje = lag("div", "attrad");
      linje.append(lag("span", null, (feltFor[n] || {}).navn || n));
      linje.append(lag("span", "a a" + niva(rad[n]), rad[n]));
      boks.append(linje);
    });
    rot.append(boks);
  });

  const resten = lag("div", "attgruppe");
  resten.append(lag("h4", null, "Annet"));
  ["liga", "kontrakt_til", "personlighet", "hoyde", "vekt", "fot_hoyre", "fot_venstre",
   "kamper", "mal", "assist", "snittkarakter", "fodt", "id", "kilde"].forEach((n) => {
    if (rad[n] === undefined || rad[n] === null || rad[n] === "") return;
    const linje = lag("div", "attrad");
    linje.append(lag("span", null, (feltFor[n] || {}).navn || n));
    linje.append(lag("span", null, formater(n, rad[n])));
    resten.append(linje);
  });
  if (resten.children.length > 1) rot.append(resten);
  $("#detalj").classList.remove("skjult");
}

// ---------- knapper og taster ----------

function koble() {
  const sokefelt = $("#tekstsok");
  sokefelt.value = tilstand.tekst;
  sokefelt.oninput = () => {
    tilstand.tekst = sokefelt.value;
    clearTimeout(tidsavbrudd);
    tidsavbrudd = setTimeout(() => { tilstand.side = 0; utfor(); }, 220);
  };

  $("#sidestorrelse").value = String(tilstand.sidestorrelse);
  $("#sidestorrelse").onchange = (e) => {
    tilstand.sidestorrelse = Number(e.target.value); sok(true);
  };
  $("#forrige").onclick = () => { if (tilstand.side > 0) { tilstand.side--; utfor(); } };
  $("#neste").onclick = () => {
    if (sisteSvar && tilstand.side + 1 < sisteSvar.sider) { tilstand.side++; utfor(); }
  };

  $("#knapp-nullstill").onclick = () => {
    tilstand = {
      ...tilstand, tekst: "", fasetter: {}, posisjoner: [], omrader: {},
      attributtkrav: [], side: 0,
    };
    $("#tekstsok").value = "";
    byggFiltre(); utfor();
  };

  $("#knapp-kolonner").onclick = () => $("#modal-kolonner").classList.remove("skjult");
  const lukkModal = () => { $("#modal-kolonner").classList.add("skjult"); utfor(); };
  $("#lukk-kolonner").onclick = lukkModal;
  $("#bruk-kolonner").onclick = lukkModal;
  $("#modal-kolonner").onclick = (e) => { if (e.target.id === "modal-kolonner") lukkModal(); };

  $("#lukk-detalj").onclick = () => $("#detalj").classList.add("skjult");

  $("#knapp-csv").onclick = () => {
    const alle = confirm(
      "Vil du ha med alle kolonnene i fila?\n\n" +
      "OK = alle kolonner\nAvbryt = bare de du ser i tabellen nå"
    );
    const q = encodeURIComponent(JSON.stringify(tilstand));
    window.location = `/api/csv?q=${q}&kolonner=${alle ? "alle" : "synlige"}`;
  };

  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && document.activeElement !== sokefelt) {
      e.preventDefault(); sokefelt.focus(); sokefelt.select();
    } else if (e.key === "Escape") {
      $("#detalj").classList.add("skjult");
      $("#modal-kolonner").classList.add("skjult");
    }
  });
}

start();

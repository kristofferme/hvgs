/* Kapittel 6 – Volum og overflate */
(function () {
  const { R, el, n, tilf, vel, glidar } = MT;

  const FIGURAR = {
    sylinder: { namn: 'Sylinder', døme: 'Silo, rundball, tank', mal: [['r', 'Radius $r$', 0.2, 5, 0.1, 0.6], ['h', 'Høgd $h$', 0.2, 12, 0.1, 1.2]],
      V: (m) => Math.PI * m.r * m.r * m.h, O: (m) => 2 * Math.PI * m.r * m.r + 2 * Math.PI * m.r * m.h,
      VF: (m) => R`$V = \pi r^2 h = \pi * ${n(m.r, 2)}^2 * ${n(m.h, 2)}$`, OF: (m) => R`$O = 2\pi r^2 + 2\pi r h$` },
    prisme: { namn: 'Rett prisme', døme: 'Kasse, container, fôrbrett', mal: [['l', 'Lengd $l$', 0.2, 10, 0.1, 3], ['b', 'Breidd $b$', 0.2, 6, 0.1, 1.5], ['h', 'Høgd $h$', 0.2, 6, 0.1, 1]],
      V: (m) => m.l * m.b * m.h, O: (m) => 2 * (m.l * m.b + m.l * m.h + m.b * m.h),
      VF: (m) => R`$V = G * h = ${n(m.l, 2)} * ${n(m.b, 2)} * ${n(m.h, 2)}$`, OF: () => R`$O = 2(lb + lh + bh)$` },
    kjegle: { namn: 'Kjegle', døme: 'Kornhaug, sandhaug, trakt', mal: [['r', 'Radius $r$', 0.2, 5, 0.1, 2], ['h', 'Høgd $h$', 0.2, 6, 0.1, 1.5]],
      V: (m) => (Math.PI * m.r * m.r * m.h) / 3, O: (m) => Math.PI * m.r * Math.hypot(m.r, m.h),
      VF: (m) => R`$V = \frac{\pi r^2 h}{3} = \frac{\pi * ${n(m.r, 2)}^2 * ${n(m.h, 2)}}{3}$`, OF: () => R`$\text{Krum flate} = \pi r s$` },
    merd: { namn: 'Oppdrettsmerd', døme: 'Sylinder med kjegleforma botn', mal: [['r', 'Radius $r$', 5, 30, 0.5, 20], ['h', 'Djupn sylinder $h$', 5, 40, 1, 20], ['k', 'Djupn kjegle $k$', 0, 20, 1, 10], ['t', 'Biomasse (tonn)', 50, 2000, 10, 600]],
      V: (m) => Math.PI * m.r * m.r * m.h + (Math.PI * m.r * m.r * m.k) / 3, O: null,
      VF: (m) => R`$V = \pi r^2 h + \frac{\pi r^2 k}{3}$` },
  };

  function studio(vert) {
    let typ = 'sylinder'; const m = {};
    const faner = el('div', { class: 'faner', role: 'tablist' });
    const teikning = el('div', { class: 'iso' });
    const k = el('div', { class: 'kontrollar' });
    const res = el('div', {});
    Object.entries(FIGURAR).forEach(([id, f]) => faner.append(el('button', { class: 'fane' + (id === typ ? ' pa' : ''), 'data-id': id, onclick: () => { typ = id; MT.$$('.fane', faner).forEach((b) => b.classList.toggle('pa', b.dataset.id === id)); bygg(); } }, f.namn)));
    vert.append(faner, el('div', { class: 'widget-delt' }, teikning, el('div', {}, k, res)));
    function bygg() {
      k.innerHTML = ''; const F = FIGURAR[typ];
      F.mal.forEach(([id, namn, a, b, s, v]) => { m[id] = v; glidar(k, { namn, min: a, max: b, steg: s, verdi: v, eining: id === 't' ? 't' : 'm', vedEndring: (x) => { m[id] = x; tegn(); } }); });
      tegn();
    }
    function tegn() {
      const F = FIGURAR[typ], V = F.V(m);
      teikning.innerHTML = svg(typ, m);
      let h = `<p class="svak">${F.døme}</p>` + MT.mat(`<p>${F.VF(m)} $\\approx \\hl{${n(V, 2)}~\\text{m}^3}$</p><p class="mono">= ${n(V * 1000, 0)} liter</p>`);
      if (F.O) h += MT.mat(`<p>${F.OF(m)} $\\approx ${n(F.O(m), 2)}~\\text{m}^2$</p>`);
      if (typ === 'merd') {
        const t = (m.t * 1000) / V;
        h += MT.mat(`<div class="maalar ${t > 25 ? 'over' : ''}"><div class="maalar-bar"><span style="width:${Math.min(100, (t / 30) * 100)}%"></span><i style="left:${(25 / 30) * 100}%"></i></div><p>Tettleik: <b class="mono">${n(t, 1)} kg/m³</b>. ${t > 25 ? 'Det er over grensa på 25 kg/m³ i forskrifta. Fisken treng meir plass.' : 'Det er under grensa på 25 kg/m³ som gjeld for laks i sjøen.'}</p></div>`);
      }
      res.innerHTML = h;
    }
    bygg();
  }

  function svg(typ, m) {
    const W = 300, H = 260;
    let ut = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Teikning av figuren">`;
    if (typ === 'sylinder' || typ === 'kjegle') {
      const s = 190 / Math.max(2 * m.r, m.h * 1.1), rx = m.r * s, ry = rx * 0.32, hh = m.h * s, cx = W / 2, yb = H - 30, yt = yb - hh;
      if (typ === 'sylinder') {
        ut += `<path d="M${cx - rx} ${yt} V${yb} A${rx} ${ry} 0 0 0 ${cx + rx} ${yb} V${yt}" class="iso-side"></path>`;
        ut += `<path d="M${cx - rx} ${yb} A${rx} ${ry} 0 0 1 ${cx + rx} ${yb}" class="iso-skjult"></path>`;
        ut += `<ellipse cx="${cx}" cy="${yt}" rx="${rx}" ry="${ry}" class="iso-topp"></ellipse>`;
        ut += `<line x1="${cx}" y1="${yt}" x2="${cx + rx}" y2="${yt}" class="iso-mal"></line><text x="${cx + rx / 2}" y="${yt - 6}" class="iso-tekst">r = ${n(m.r, 1)}</text>`;
        ut += `<line x1="${cx + rx + 14}" y1="${yt}" x2="${cx + rx + 14}" y2="${yb}" class="iso-mal"></line><text x="${cx + rx + 18}" y="${(yt + yb) / 2}" class="iso-tekst">h = ${n(m.h, 1)}</text>`;
      } else {
        ut += `<path d="M${cx - rx} ${yb} L${cx} ${yt} L${cx + rx} ${yb} A${rx} ${ry} 0 0 1 ${cx - rx} ${yb}" class="iso-side"></path>`;
        ut += `<path d="M${cx - rx} ${yb} A${rx} ${ry} 0 0 1 ${cx + rx} ${yb}" class="iso-skjult"></path>`;
        ut += `<line x1="${cx}" y1="${yt}" x2="${cx}" y2="${yb}" class="iso-mal"></line><line x1="${cx}" y1="${yb}" x2="${cx + rx}" y2="${yb}" class="iso-mal"></line>`;
        ut += `<text x="${cx + 5}" y="${(yt + yb) / 2}" class="iso-tekst">h = ${n(m.h, 1)}</text><text x="${cx + rx / 2}" y="${yb - 6}" class="iso-tekst">r = ${n(m.r, 1)}</text>`;
      }
    } else if (typ === 'prisme') {
      const s = 170 / Math.max(m.l + m.b * 0.5, m.h + m.b * 0.5), l = m.l * s, b = m.b * s * 0.5, h = m.h * s, x0 = (W - l - b) / 2, y0 = H - 25;
      ut += `<path d="M${x0} ${y0} h${l} v${-h} h${-l} Z" class="iso-side"></path>`;
      ut += `<path d="M${x0} ${y0 - h} l${b} ${-b} h${l} l${-b} ${b} Z" class="iso-topp"></path>`;
      ut += `<path d="M${x0 + l} ${y0} l${b} ${-b} v${-h} l${-b} ${b} Z" class="iso-side mork"></path>`;
      ut += `<path d="M${x0} ${y0} l${b} ${-b} h${l} M${x0 + b} ${y0 - b} v${-h}" class="iso-skjult"></path>`;
      ut += `<text x="${x0 + l / 2}" y="${y0 + 16}" class="iso-tekst" text-anchor="middle">l = ${n(m.l, 1)}</text><text x="${x0 + l + b / 2 + 6}" y="${y0 - b / 2 + 4}" class="iso-tekst">b = ${n(m.b, 1)}</text><text x="${x0 - 6}" y="${y0 - h / 2}" class="iso-tekst" text-anchor="end">h = ${n(m.h, 1)}</text>`;
    } else {
      const s = 200 / Math.max(2 * m.r, (m.h + m.k) * 1.05), rx = m.r * s, ry = rx * 0.22, cx = W / 2, yt = 34, yb = yt + m.h * s, yk = yb + m.k * s;
      ut += `<rect x="0" y="${yt}" width="${W}" height="${H - yt}" class="sjo"></rect>`;
      ut += `<path d="M${cx - rx} ${yt} V${yb} L${cx} ${yk} L${cx + rx} ${yb} V${yt}" class="iso-side not"></path>`;
      ut += `<ellipse cx="${cx}" cy="${yt}" rx="${rx}" ry="${ry}" class="iso-topp ring"></ellipse>`;
      const V = FIGURAR.merd.V(m), tett = (m.t * 1000) / V, antal = Math.min(160, Math.round(tett * 4));
      let fr = 7; const tilfeldig = () => { fr = (fr * 9301 + 49297) % 233280; return fr / 233280; };
      for (let i = 0; i < antal; i++) { const yy = yt + 6 + tilfeldig() * (yk - yt - 10); const maxx = yy < yb ? rx - 6 : (rx - 6) * (1 - (yy - yb) / (yk - yb)); const xx = cx + (tilfeldig() * 2 - 1) * Math.max(0, maxx); ut += `<path d="M${xx - 4} ${yy} q4 -3 8 0 q-4 3 -8 0 l-3 -2 v4 z" class="fisk"></path>`; }
      ut += `<text x="${cx + rx + 4 > W - 60 ? W - 4 : cx + rx + 4}" y="${(yt + yb) / 2}" class="iso-tekst" text-anchor="${cx + rx + 4 > W - 60 ? 'end' : 'start'}">h = ${n(m.h, 0)}</text><text x="${cx + 8}" y="${(yb + yk) / 2}" class="iso-tekst">k = ${n(m.k, 0)}</text>`;
    }
    return ut + '</svg>';
  }

  /* --- Fyll tanken: samanheng mellom volum og tid --- */
  function fylling(vert) {
    const tekst = el('p', { class: 'utforsk-tekst', html: R`Ein sylindrisk vasstank har radius <b data-v="r"></b> og høgd <b data-v="h"></b>. Han rommar <b data-o="L"></b> liter. Med ein slange som gir <b data-v="q"></b> tek det <b data-o="tid" class="hl"></b> å fylle han.` });
    vert.append(tekst);
    MT.utforsk(tekst, { r: { v: 0.8, min: 0.2, max: 3, steg: 0.05, des: 2, eining: 'm', px: 4 }, h: { v: 1.5, min: 0.3, max: 5, steg: 0.1, des: 1, eining: 'm', px: 4 }, q: { v: 25, min: 5, max: 200, steg: 5, eining: 'L/min', px: 3 } }, {
      L: (s) => n(Math.PI * s.r * s.r * s.h * 1000, 0),
      tid: (s) => { const min = (Math.PI * s.r * s.r * s.h * 1000) / s.q; return min >= 60 ? `${Math.floor(min / 60)} t ${Math.round(min % 60)} min` : `${n(min, 0)} min`; },
    });
  }

  const G = [
    () => { const d = vel([1.2, 1.25, 1.5]), b = vel([1.2, 1.25]); return { tekst: `Ein rundball har diameter ${n(d, 2)} m og breidd ${n(b, 2)} m. Kva er volumet i m³? Svar med to desimalar.`, svar: Math.PI * (d / 2) ** 2 * b, eining: 'm³', tol: 0.011, tips: R`Rundballen er ein sylinder: $V = \pi r^2 h$. Hugs at radius er halve diameteren.`, losning: MT.mat(R`$$V = \pi * ${n(d / 2, 3)}^2 * ${n(b, 2)} \approx ${n(Math.PI * (d / 2) ** 2 * b, 3)}~\text{m}^3$$`) }; },
    () => { const r = tilf(4, 15) / 10, h = tilf(8, 25) / 10; return { tekst: `Ein mjølketank er ein sylinder med radius ${n(r, 1)} m og lengd ${n(h, 1)} m. Kor mange liter rommar tanken? Rund av til heile liter.`, svar: Math.PI * r * r * h * 1000, eining: 'L', tol: 1, tips: R`Rekn volumet i m³ og gong med 1000.`, losning: MT.mat(R`$$V = \pi * ${n(r, 1)}^2 * ${n(h, 1)} \approx ${n(Math.PI * r * r * h, 4)}~\text{m}^3 = ${n(Math.PI * r * r * h * 1000, 0)}~\text{L}$$`) }; },
    () => { const l = tilf(20, 80), a = tilf(8, 15) / 10, b = tilf(4, 7) / 10, h = tilf(5, 10) / 10; return { tekst: R`Ei grøft er ${l} m lang. Tverrsnittet er eit trapes med breidd ${n(a, 1)} m øvst, ${n(b, 1)} m nedst og djupn ${n(h, 1)} m. Kor mange m³ jord må gravast ut?`, svar: ((a + b) * h) / 2 * l, eining: 'm³', tips: R`Grøfta er ei prisme. Finn arealet av tverrsnittet (trapes) og gong med lengda.`, losning: MT.mat(R`$$G = \frac{(${n(a, 1)} + ${n(b, 1)}) * ${n(h, 1)}}{2} = ${n(((a + b) * h) / 2, 3)}~\text{m}^2 \qquad V = ${n(((a + b) * h) / 2, 3)} * ${l} = ${n(((a + b) * h) / 2 * l, 2)}~\text{m}^3$$`) }; },
    () => { const r = tilf(15, 40) / 10, h = tilf(8, 20) / 10; return { tekst: `Ein kornhaug har form som ei kjegle med radius ${n(r, 1)} m og høgd ${n(h, 1)} m. Kva er volumet? Svar med to desimalar.`, svar: (Math.PI * r * r * h) / 3, eining: 'm³', tol: 0.011, tips: R`$V = \frac{\pi r^2 h}{3}$`, losning: MT.mat(R`$$V = \frac{\pi * ${n(r, 1)}^2 * ${n(h, 1)}}{3} \approx ${n((Math.PI * r * r * h) / 3, 3)}~\text{m}^3$$`) }; },
    () => { const r = vel([15, 20, 25]), h = vel([15, 20, 25]), t = tilf(20, 120) * 10; const V = Math.PI * r * r * h; return { tekst: `Ei merd er (forenkla) ein sylinder med radius ${r} m og djupn ${h} m. Ho inneheld ${t} tonn laks. Kva er tettleiken i kg/m³? Svar med éin desimal.`, svar: (t * 1000) / V, eining: 'kg/m³', tol: 0.06, tips: R`Tettleik = masse delt på volum. Gjer om tonn til kg (gong med 1000).`, losning: MT.mat(R`$$V = \pi * ${r}^2 * ${h} \approx ${n(V, 0)}~\text{m}^3 \qquad \frac{${n(t * 1000, 0)}~\text{kg}}{${n(V, 0)}~\text{m}^3} \approx ${n((t * 1000) / V, 2)}~\text{kg/m}^3$$`) }; },
    () => { const l = tilf(2, 6), b = tilf(1, 3), h = tilf(1, 2), q = vel([20, 25, 40, 50]); return { tekst: `Ein vasskum er ${l} m lang, ${b} m brei og ${h} m djup. Ei pumpe tømmer ${q} liter per minutt. Kor mange minutt tek det å tømme kummen?`, svar: (l * b * h * 1000) / q, eining: 'min', tips: 'Rekn volumet i liter, og del på kor mykje pumpa tek per minutt.', losning: MT.mat(R`$$V = ${l} * ${b} * ${h} = ${l * b * h}~\text{m}^3 = ${n(l * b * h * 1000, 0)}~\text{L} \qquad \frac{${n(l * b * h * 1000, 0)}}{${q}} = ${n((l * b * h * 1000) / q, 1)}~\text{min}$$`) }; },
  ];

  MT.nyttKapittel({
    id: 'volum', nr: 6, tittel: 'Volum og overflate', kort: 'Prisme, sylinder, kjegle, merd og tettleik.',
    glyf: '<ellipse cx="16" cy="8" rx="9" ry="3"/><path d="M7 8v16c0 2 4 3 9 3s9-1 9-3V8"/>',
    maal: ['Rekne ut volum av prisme, sylinder og kjegle', 'Rekne ut overflate, til dømes for maling eller plast', 'Gjere om mellom m³ og liter', 'Rekne med tettleik, til dømes kg fisk per m³'],
    formlar: [['Prisme', R`$V = G * h$`], ['Sylinder', R`$V = \pi r^2 h$`], ['Kjegle og pyramide', R`$V = \frac{G * h}{3}$`], ['Kule', R`$V = \frac{4}{3} \pi r^3$`], ['Overflate sylinder', R`$O = 2\pi r^2 + 2\pi r h$`], ['Tettleik', R`$\rho = \frac{m}{V}$`]],
    seksjonar: [
      { id: 'prisme', tittel: 'Prisme og sylinder', blokker: [
        { type: 'teori', html: R`<p>Ei <b>prisme</b> har like store botn og topp, og rette sider. Volumet er arealet av grunnflata gonga med høgda:</p>
$$V = G * h$$
<p>Ein <b>sylinder</b> er ei «rund prisme». Grunnflata er ein sirkel, så $G = \pi r^2$ og $V = \pi r^2 h$. Silo, rundball, mjølketank og vassrøyr er sylindrar.</p>` },
        { type: 'utforsk', tittel: 'Figurstudio', intro: 'Vel ein figur og dra i glidarane. Teikninga, volumet og overflata blir oppdaterte medan du drar.', lag: studio },
        { type: 'eksempel', nr: '6.1', tittel: 'Kor mykje rommar siloen?', oppgave: 'Ein tårnsilo har indre diameter 6 m og høgd 14 m. Kor mange m³ surfôr kan han romme?', steg: [R`Radius: $r = 6 : 2 = 3$ m.`, R`Grunnflate: $G = \pi * 3^2 \approx 28,27~\text{m}^2$.`, R`Volum: $V = 28,27 * 14 \approx 395,8~\text{m}^3$.`], svar: 'Siloen rommar om lag 396 m³.' },
      ] },
      { id: 'kjegle', tittel: 'Kjegle og samansette lekamar', blokker: [
        { type: 'teori', html: R`<p>Ei <b>kjegle</b> eller ein <b>pyramide</b> har tredjeparten av volumet til ein sylinder eller ei prisme med same grunnflate og høgd:</p>
$$V = \frac{G * h}{3}$$
<p>Ei oppdrettsmerd kan sjåast som ein sylinder med ei kjegle under. Volumet er summen av dei to delane.</p>` },
        { type: 'eksempel', nr: '6.2', tittel: 'Tettleik i ei merd', oppgave: 'Ei merd har radius 20 m. Sylinderdelen er 20 m djup, og kjegla under er 10 m djup. Det er 600 tonn laks i merda. Er tettleiken under 25 kg/m³?', steg: [R`Sylinder: $\pi * 20^2 * 20 \approx 25~133~\text{m}^3$.`, R`Kjegle: $\frac{\pi * 20^2 * 10}{3} \approx 4~189~\text{m}^3$.`, R`Totalt: $25~133 + 4~189 = 29~322~\text{m}^3$.`, R`Tettleik: $\frac{600~000~\text{kg}}{29~322~\text{m}^3} \approx 20,5~\text{kg/m}^3$.`], svar: 'Ja, tettleiken er om lag 20,5 kg/m³, under grensa.' },
      ] },
      { id: 'liter', tittel: 'Volum, liter og tid', blokker: [
        { type: 'teori', html: R`<p>Når du veit volumet i m³, gongar du med 1000 for å få liter. Kjenner du kor mange liter per minutt ei pumpe eller ein slange gir, kan du rekne ut tida:</p>$$\text{tid} = \frac{\text{volum}}{\text{liter per minutt}}$$` },
        { type: 'utforsk', tittel: 'Fyll tanken', intro: 'Dra i dei understreka tala.', lag: fylling },
      ] },
      { id: 'oving', tittel: 'Øving', blokker: [{ type: 'oving', generatorar: G }] },
    ],
  });
})();

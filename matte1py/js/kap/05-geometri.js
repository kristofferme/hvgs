/* Kapittel 5 – Areal, omkrins og Pytagoras */
(function () {
  const { R, el, n, tilf, vel, glidar } = MT;

  /* --- Beiteplanleggjaren: dra hjørna på eit gjerde --- */
  function beite(vert) {
    const g = new MT.Graf(vert, { xmin: 0, xmax: 120, ymin: 0, ymax: 80, hogd: 360, xsteg: 10, ysteg: 10, xnamn: 'meter', ynamn: 'meter', likAkse: true, aria: 'Beite med hjørne du kan dra' });
    let P = [[10, 10], [85, 8], [105, 50], [55, 62], [12, 45]].map(([x, y]) => ({ x, y, snap: 1 }));
    const info = el('div', { class: 'tal-rad' });
    const k = el('div', { class: 'kontrollar' });
    let pris = 85, sau = 0.8;
    glidar(k, { namn: 'Gjerdepris', min: 20, max: 250, steg: 5, verdi: pris, eining: 'kr/m', vedEndring: (v) => { pris = v; oppdater(); } });
    glidar(k, { namn: 'Sauer per dekar', min: 0.2, max: 2, steg: 0.1, verdi: sau, vedEndring: (v) => { sau = v; oppdater(); } });
    const knappar = el('div', { class: 'rad' },
      el('button', { class: 'knapp sekundar', onclick: () => { if (P.length >= 9) return; let bi = 0, bl = 0; P.forEach((p, i) => { const q = P[(i + 1) % P.length], l = Math.hypot(q.x - p.x, q.y - p.y); if (l > bl) { bl = l; bi = i; } }); const q = P[(bi + 1) % P.length]; P.splice(bi + 1, 0, { x: Math.round((P[bi].x + q.x) / 2), y: Math.round((P[bi].y + q.y) / 2), snap: 1 }); kople(); oppdater(); } }, '+ Hjørne'),
      el('button', { class: 'knapp sekundar', onclick: () => { if (P.length > 3) { P.pop(); kople(); oppdater(); } } }, '− Hjørne'),
      el('button', { class: 'knapp sekundar', onclick: () => { P = [[10, 10], [90, 10], [90, 50], [10, 50]].map(([x, y]) => ({ x, y, snap: 1 })); kople(); oppdater(); } }, 'Rektangel'));
    vert.append(info, el('div', { class: 'widget-delt' }, k, knappar));
    const kople = () => { P.forEach((p) => (p.vedFlytt = oppdater)); g.handtak = P; };
    function areal() { let s = 0; P.forEach((p, i) => { const q = P[(i + 1) % P.length]; s += p.x * q.y - q.x * p.y; }); return Math.abs(s) / 2; }
    function omkrins() { return P.reduce((s, p, i) => { const q = P[(i + 1) % P.length]; return s + Math.hypot(q.x - p.x, q.y - p.y); }, 0); }
    g.lag = (g) => {
      const A = MT.farge('green');
      g.mangekant(P.map((p) => [p.x, p.y]), MT.alfa(A, 0.18), A);
      P.forEach((p, i) => { const q = P[(i + 1) % P.length]; const l = Math.hypot(q.x - p.x, q.y - p.y); g.tekst(n(l, 1) + ' m', (p.x + q.x) / 2, (p.y + q.y) / 2 + 2.5, g.F.svak, 'center', '11px "DM Mono", monospace'); });
    };
    function oppdater() {
      const A = areal(), O = omkrins();
      info.innerHTML = `<div><span class="merkelapp">Areal</span><b class="mono">${n(A, 0)} m²</b></div><div><span class="merkelapp">Dekar</span><b class="mono">${n(A / 1000, 2)} daa</b></div><div><span class="merkelapp">Gjerde</span><b class="mono">${n(O, 1)} m</b></div><div><span class="merkelapp">Gjerdepris</span><b class="mono">${n(O * pris, 0)} kr</b></div><div><span class="merkelapp">Plass til</span><b class="mono">${Math.floor((A / 1000) * sau)} sauer</b></div>`;
      g.teikn();
    }
    kople(); oppdater();
  }

  /* --- Pytagoras med kvadrat på sidene --- */
  function pytagoras(vert) {
    const g = new MT.Graf(vert, { xmin: -8, xmax: 14, ymin: -8, ymax: 14, hogd: 400, likAkse: true, xnamn: '', ynamn: '', aria: 'Rettvinkla trekant med kvadrat på sidene' });
    g.visMus = false;
    const A = { x: 4, y: 0, snap: 0.5, berreX: true }, B = { x: 0, y: 3, snap: 0.5, berreY: true };
    const res = el('div', {});
    vert.append(res);
    const oppdater = () => { A.x = Math.max(1, Math.min(7, A.x)); B.y = Math.max(1, Math.min(7, B.y)); const a = A.x, b = B.y, c = Math.hypot(a, b); const W = a + 2 * b + 2, H = 2 * a + b + 2, asp = (g.h - 44) / Math.max(1, g.b - 54); const xs = Math.max(W, H / asp); g.o.xmin = -b - 1 - (xs - W) / 2; g.o.xmax = g.o.xmin + xs; g.o.ymidt = b / 2; res.innerHTML = MT.mat(R`$$\red{${n(a, 1)}^2} + \hl{${n(b, 1)}^2} = ${n(a * a, 2)} + ${n(b * b, 2)} = ${n(c * c, 2)} = c^2 \quad\Rightarrow\quad c = \sqrt{${n(c * c, 2)}} \approx ${n(c, 2)}$$`); g.teikn(); };
    A.vedFlytt = oppdater; B.vedFlytt = oppdater;
    g.handtak = [A, B];
    new ResizeObserver(() => oppdater()).observe(g.c);
    g.lag = (g) => {
      const a = A.x, b = B.y, Rd = MT.farge('red'), Am = MT.farge('amber'), Ac = MT.farge('accent');
      g.mangekant([[0, 0], [a, 0], [a, -a], [0, -a]], MT.alfa(Rd, 0.16), Rd);
      g.mangekant([[0, 0], [0, b], [-b, b], [-b, 0]], MT.alfa(Am, 0.2), Am);
      g.mangekant([[a, 0], [0, b], [b, b + a], [a + b, a]], MT.alfa(Ac, 0.14), Ac);
      g.mangekant([[0, 0], [a, 0], [0, b]], MT.alfa(g.F.blekk, 0.08), g.F.blekk);
      g.mangekant([[0, 0], [0.5, 0], [0.5, 0.5], [0, 0.5]], null, g.F.blekk);
      g.tekst(n(a * a, 1), a / 2, -a / 2, Rd, 'center', '700 14px "DM Mono", monospace');
      g.tekst(n(b * b, 1), -b / 2, b / 2, Am, 'center', '700 14px "DM Mono", monospace');
      g.tekst(n(a * a + b * b, 1), (a + b) / 2, (a + b) / 2, Ac, 'center', '700 14px "DM Mono", monospace');
      g.tekst('a', a / 2, 0.45, g.F.blekk, 'center', 'italic 15px "STIX Two Text", Georgia, serif');
      g.tekst('b', 0.4, b / 2, g.F.blekk, 'left', 'italic 15px "STIX Two Text", Georgia, serif');
      g.tekst('c', a / 2 - 0.35, b / 2 - 0.35, g.F.blekk, 'right', 'italic 15px "STIX Two Text", Georgia, serif');
    };
    oppdater();
  }

  /* --- Rull hjulet: omkrinsen til ein sirkel --- */
  function hjul(vert) {
    const g = new MT.Graf(vert, { xmin: -1, xmax: 14, ymin: -1, ymax: 4, hogd: 220, xsteg: 1, ysteg: 1, likAkse: true, ymidt: 1.6, xnamn: '', ynamn: '', aria: 'Sirkel som rullar' });
    g.visMus = false;
    const k = el('div', { class: 'kontrollar' });
    let r = 1, vinkel = 0, anim;
    const res = el('div', {});
    const vis = () => { res.innerHTML = MT.mat(R`$$O = 2 * \pi * r = 2 * \pi * ${n(r, 2)} \approx \hl{${n(2 * Math.PI * r, 2)}} \qquad A = \pi * r^2 \approx ${n(Math.PI * r * r, 2)}$$`); };
    g.lag = (g) => {
      const s = vinkel * r, cx = s, cy = r, Ac = MT.farge('accent'), Rd = MT.farge('red');
      g.linje(-1, 0, 14, 0, g.F.blekk, 1.4);
      g.linje(0, 0, s, 0, Rd, 4);
      const ctx = g.ctx; ctx.beginPath(); ctx.arc(g.X(cx), g.Y(cy), g.X(r) - g.X(0), 0, 7); ctx.fillStyle = MT.alfa(Ac, 0.12); ctx.fill(); ctx.strokeStyle = Ac; ctx.lineWidth = 2.5; ctx.stroke();
      // den raude delen av omkrinsen som ikkje har rulla ut enno
      ctx.beginPath(); ctx.arc(g.X(cx), g.Y(cy), g.X(r) - g.X(0), Math.PI / 2 + vinkel, Math.PI / 2 + 2 * Math.PI, false); ctx.strokeStyle = Rd; ctx.lineWidth = 4; ctx.stroke();
      const px = cx - r * Math.sin(vinkel) , py = cy - r * Math.cos(vinkel);
      g.linje(cx, cy, px, py, g.F.blekk, 1.5); g.punkt(px, py, Rd, 5);
      g.tekst('d = ' + n(2 * r, 1), cx, cy + r + 0.35, g.F.svak, 'center', '12px "DM Mono", monospace');
      if (vinkel >= 2 * Math.PI - 1e-6) g.tekst('π · d ≈ ' + n(2 * Math.PI * r, 2), s / 2, -0.45, Rd, 'center', '700 13px "DM Mono", monospace');
    };
    const rull = () => { cancelAnimationFrame(anim); vinkel = 0; const t0 = performance.now(); const steg = (t) => { vinkel = Math.min(2 * Math.PI, ((t - t0) / 2200) * 2 * Math.PI); if (MT.roleg) vinkel = 2 * Math.PI; g.teikn(); if (vinkel < 2 * Math.PI) anim = requestAnimationFrame(steg); }; anim = requestAnimationFrame(steg); };
    glidar(k, { namn: 'Radius $r$', min: 0.5, max: 2, steg: 0.1, verdi: r, vedEndring: (v) => { r = v; vinkel = 0; vis(); g.teikn(); } });
    vert.append(el('div', { class: 'widget-delt' }, k, el('div', { class: 'rad' }, el('button', { class: 'knapp', onclick: rull }, 'Rull éin runde'))), res);
    vis(); g.teikn();
  }

  const G = [
    () => { const l = tilf(12, 80), b = tilf(5, 40); return { tekst: `Ein hønsegard er rektangulær, ${l} m lang og ${b} m brei. Kor mange meter netting trengst rundt heile garden?`, svar: 2 * (l + b), eining: 'm', tips: 'Omkrinsen er summen av alle sidene: to lengder og to breidder.', losning: MT.mat(R`$$O = 2 * ${l} + 2 * ${b} = ${2 * (l + b)}~\text{m}$$`) }; },
    () => { const g_ = tilf(6, 40), h = tilf(4, 30); return { tekst: R`Eit trekanta jordstykke har grunnlinje ${g_} m og høgd ${h} m. Kva er arealet?`, svar: (g_ * h) / 2, eining: 'm²', tips: R`Arealet av ein trekant er $\frac{g * h}{2}$.`, losning: MT.mat(R`$$A = \frac{${g_} * ${h}}{2} = ${n((g_ * h) / 2, 1)}~\text{m}^2$$`) }; },
    () => { const a = tilf(20, 60), b = tilf(30, 90), h = tilf(15, 50); return { tekst: R`Eit jorde har form som eit trapes. Dei to parallelle sidene er ${a} m og ${b} m, og avstanden mellom dei er ${h} m. Kor mange <b>dekar</b> er jordet?`, svar: ((a + b) * h) / 2 / 1000, eining: 'daa', tips: R`Trapes: $A = \frac{(a + b) * h}{2}$. Del på 1000 for å få dekar.`, losning: MT.mat(R`$$A = \frac{(${a} + ${b}) * ${h}}{2} = ${n(((a + b) * h) / 2, 1)}~\text{m}^2 = ${n(((a + b) * h) / 2000, 3)}~\text{daa}$$`) }; },
    () => { const r = tilf(2, 25); const t = vel(['areal', 'omkrins']); return { tekst: t === 'areal' ? `Ei vatningsmaskin vatnar ein sirkel med radius ${r} m. Kor stort areal blir vatna? Rund av til heile m².` : `Ein rund innhegning til hest har radius ${r} m. Kor lang er innhegninga rundt? Rund av til éin desimal.`, svar: t === 'areal' ? Math.PI * r * r : 2 * Math.PI * r, eining: t === 'areal' ? 'm²' : 'm', tol: t === 'areal' ? 1 : 0.11, tips: t === 'areal' ? R`$A = \pi * r^2$` : R`$O = 2 * \pi * r$`, losning: MT.mat(t === 'areal' ? R`$$A = \pi * ${r}^2 \approx ${n(Math.PI * r * r, 1)}~\text{m}^2$$` : R`$$O = 2 * \pi * ${r} \approx ${n(2 * Math.PI * r, 2)}~\text{m}$$`) }; },
    () => { const [a, b, c] = vel([[3, 4, 5], [6, 8, 10], [5, 12, 13], [9, 12, 15], [8, 15, 17], [2.4, 3.2, 4], [1.5, 2, 2.5]]); return { tekst: R`Ein rettvinkla trekant har katetar på ${n(a, 1)} m og ${n(b, 1)} m. Kor lang er hypotenusen?`, svar: c, eining: 'm', tips: R`Pytagoras: $c^2 = a^2 + b^2$, så $c = \sqrt{a^2 + b^2}$.`, losning: MT.mat(R`$$c = \sqrt{${n(a, 1)}^2 + ${n(b, 1)}^2} = \sqrt{${n(a * a + b * b, 2)}} = ${n(c, 2)}~\text{m}$$`) }; },
    () => { const s = tilf(4, 12) / 2, h = s + tilf(2, 8) / 2; const k = Math.sqrt(h * h - s * s); return { tekst: R`Ein stige som er ${n(h, 1)} m lang, står mot ein låvevegg. Foten av stigen står ${n(s, 1)} m frå veggen. Kor høgt opp på veggen når stigen? Svar med to desimalar.`, svar: k, eining: 'm', tol: 0.011, tips: R`Stigen er hypotenusen. $b = \sqrt{c^2 - a^2}$.`, losning: MT.mat(R`$$b = \sqrt{${n(h, 1)}^2 - ${n(s, 1)}^2} = \sqrt{${n(h * h - s * s, 2)}} \approx ${n(k, 2)}~\text{m}$$`) }; },
    () => { const l = tilf(4, 12) * 10, b = tilf(3, 8) * 10, p = vel([45, 65, 89, 120]); return { tekst: `Eit beite på ${l} m × ${b} m skal gjerdast inn. Gjerdet kostar ${p} kr per meter. Kva kostar gjerdet?`, svar: 2 * (l + b) * p, eining: 'kr', tips: 'Rekn omkrinsen først, og gong med prisen per meter.', losning: MT.mat(R`$$O = 2 * (${l} + ${b}) = ${2 * (l + b)}~\text{m} \qquad ${2 * (l + b)} * ${p} = ${n(2 * (l + b) * p, 0)}~\text{kr}$$`) }; },
  ];

  MT.nyttKapittel({
    id: 'geometri', nr: 5, tittel: 'Areal, omkrins og Pytagoras', kort: 'Mangekantar, sirklar, samansette figurar og rette vinklar.',
    glyf: '<path d="M5 27V7l22 20z"/><path d="M5 22h5v5"/>',
    maal: ['Rekne ut omkrins og areal av mangekantar og sirklar', 'Rekne ut areal av samansette figurar, til dømes jorde og beite', 'Bruke Pytagoras-setninga i praktiske situasjonar', 'Bruke 3-4-5-regelen for å lage rette vinklar'],
    formlar: [['Rektangel', R`$A = l * b$`], ['Trekant', R`$A = \frac{g * h}{2}$`], ['Parallellogram', R`$A = g * h$`], ['Trapes', R`$A = \frac{(a + b) * h}{2}$`], ['Sirkel', R`$O = 2 \pi r,~ A = \pi r^2$`], ['Pytagoras', R`$a^2 + b^2 = c^2$`]],
    seksjonar: [
      { id: 'areal', tittel: 'Areal og omkrins', blokker: [
        { type: 'teori', html: R`<p><b>Omkrinsen</b> er lengda rundt ein figur – det du treng av gjerde. <b>Arealet</b> er kor stor flate figuren dekkjer – det du treng av gjødsel eller såfrø.</p>
<div class="figurrad">
<figure><svg viewBox="0 0 120 80" aria-hidden="true"><rect x="10" y="15" width="100" height="50" class="fig"></rect><text x="60" y="76" class="figtekst">l</text><text x="114" y="44" class="figtekst">b</text></svg><figcaption>$A = l * b$</figcaption></figure>
<figure><svg viewBox="0 0 120 80" aria-hidden="true"><path d="M10 65 L110 65 L75 12 Z" class="fig"></path><path d="M75 12 V65" class="hjelp"></path><text x="60" y="78" class="figtekst">g</text><text x="80" y="44" class="figtekst">h</text></svg><figcaption>$A = \frac{g * h}{2}$</figcaption></figure>
<figure><svg viewBox="0 0 120 80" aria-hidden="true"><path d="M10 65 L110 65 L85 15 L30 15 Z" class="fig"></path><path d="M30 15 V65" class="hjelp"></path><text x="58" y="11" class="figtekst">a</text><text x="60" y="78" class="figtekst">b</text><text x="34" y="44" class="figtekst">h</text></svg><figcaption>$A = \frac{(a+b) * h}{2}$</figcaption></figure>
<figure><svg viewBox="0 0 120 80" aria-hidden="true"><circle cx="60" cy="40" r="30" class="fig"></circle><path d="M60 40 H90" class="hjelp"></path><text x="74" y="36" class="figtekst">r</text></svg><figcaption>$A = \pi r^2$</figcaption></figure>
</div>
<p>Eit jorde har sjeldan ei pen form. Då deler du det opp i figurar du kjenner, reknar ut arealet av kvar, og legg saman. Det kallar vi ein <b>samansett figur</b>.</p>` },
        { type: 'utforsk', tittel: 'Beiteplanleggjaren', intro: 'Dra i hjørna for å forme beitet. Arealet blir rekna ut med koordinatane til hjørna, sjølv for skeive former.', lag: beite },
        { type: 'eksempel', nr: '5.1', tittel: 'Eit L-forma jorde', oppgave: 'Eit jorde har form som ein L. Det kan delast i eit rektangel på 80 m × 40 m og eit på 30 m × 25 m. Kor mange dekar er jordet?', steg: [R`Rektangel 1: $80 * 40 = 3200~\text{m}^2$.`, R`Rektangel 2: $30 * 25 = 750~\text{m}^2$.`, R`Til saman: $3200 + 750 = 3950~\text{m}^2 = 3,95$ daa.`], svar: 'Jordet er om lag 4 dekar.' },
      ] },
      { id: 'sirkel', tittel: 'Sirkelen og π', blokker: [
        { type: 'teori', html: R`<p>Uansett kor stor ein sirkel er, er omkrinsen litt over tre gonger så lang som diameteren. Dette forholdet heiter $\pi$ (pi):</p>
$$\pi = \frac{O}{d} \approx 3,14 \qquad O = \pi * d = 2 * \pi * r$$` },
        { type: 'utforsk', tittel: 'Rull hjulet', intro: 'Sjå kor langt hjulet kjem på éin runde. Den raude streken er omkrinsen, rulla ut på bakken.', lag: hjul },
      ] },
      { id: 'pytagoras', tittel: 'Pytagoras og rette vinklar', blokker: [
        { type: 'teori', html: R`<p>I ein <b>rettvinkla trekant</b> heiter dei to kortaste sidene <i>katetar</i>, og den lengste sida (motsett den rette vinkelen) heiter <i>hypotenus</i>. Pytagoras-setninga seier:</p>
$$a^2 + b^2 = c^2$$
<p>Teiknar du eit kvadrat på kvar side, blir dei to små kvadrata til saman like store som det store.</p>` },
        { type: 'utforsk', tittel: 'Kvadrata til Pytagoras', intro: 'Dra dei to blå punkta langs aksane. Tala i kvadrata er areala deira. Sjekk at dei to små alltid blir like mykje som det store.', lag: pytagoras },
        { type: 'eksempel', nr: '5.2', tittel: 'Snekkartrikset 3-4-5', oppgave: 'Du skal setje opp grunnmuren til eit reiskapshus og vil sjekke at hjørnet er rett (90°). Korleis kan du bruke Pytagoras med eit målband?', steg: [R`Mål 3 m langs den eine veggen og 4 m langs den andre, frå hjørnet.`, R`Om vinkelen er rett, skal avstanden mellom dei to merka vere $\sqrt{3^2 + 4^2} = \sqrt{25} = 5$ m.`, R`Er avstanden meir enn 5 m, er vinkelen større enn 90°. Er han mindre, er vinkelen for spiss. Du kan òg bruke 6-8-10 eller 0,6-0,8-1,0.`], svar: 'Diagonalen skal vere nøyaktig 5 m når sidene er 3 m og 4 m.' },
      ] },
      { id: 'oving', tittel: 'Øving', blokker: [{ type: 'oving', generatorar: G }] },
    ],
  });
})();

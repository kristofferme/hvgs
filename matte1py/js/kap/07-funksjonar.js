/* Kapittel 7 – Funksjonar og modellar */
(function () {
  const { R, el, n, tilf, vel, glidar } = MT;

  /* --- Linjelaben: dra to punkt, sjå formelen --- */
  function linjelab(vert) {
    const formel = el('div', { class: 'stor-formel', 'aria-live': 'polite' });
    vert.append(formel);
    const g = new MT.Graf(vert, { xmin: -1, xmax: 10, ymin: -2, ymax: 12, hogd: 340, xsteg: 1, ysteg: 1, aria: 'Rett linje gjennom to punkt du kan dra' });
    const P = { x: 1, y: 3, snap: 0.5 }, Q = { x: 6, y: 8, snap: 0.5 };
    let maal = null;
    const status = el('div', { class: 'tilbake' });
    const utfordring = el('button', { class: 'knapp sekundar', onclick: () => { maal = { a: vel([-1.5, -1, -0.5, 0.5, 1, 1.5, 2, 3]), b: tilf(0, 8) }; status.className = 'tilbake info'; status.innerHTML = MT.mat(R`Utfordring: få linja di til å bli $y = ${n(maal.a, 1)}x + ${n(maal.b, 1)}$. Den stipla linja viser målet.`); g.teikn(); } }, 'Gi meg ei utfordring');
    vert.append(el('div', { class: 'rad' }, utfordring), status);
    const ab = () => { const a = (Q.y - P.y) / (Q.x - P.x); return { a, b: P.y - a * P.x }; };
    g.lag = (g) => {
      const Ac = MT.farge('accent'), Rd = MT.farge('red');
      if (maal) g.funksjon((x) => maal.a * x + maal.b, MT.farge('amber'), 3, [8, 6]);
      if (P.x === Q.x) { g.linje(P.x, -2, P.x, 12, Ac, 2.5); return; }
      const { a, b } = ab();
      g.funksjon((x) => a * x + b, Ac, 2.5);
      // stigningstrekant
      g.linje(P.x, P.y, Q.x, P.y, Rd, 2, [4, 4]); g.linje(Q.x, P.y, Q.x, Q.y, Rd, 2, [4, 4]);
      g.tekst('Δx = ' + n(Q.x - P.x, 1), (P.x + Q.x) / 2, P.y - 0.5, Rd, 'center', '12px "DM Mono", monospace');
      g.tekst('Δy = ' + n(Q.y - P.y, 1), Q.x + 0.2, (P.y + Q.y) / 2, Rd, 'left', '12px "DM Mono", monospace');
      g.punkt(0, b, MT.farge('green'), 5);
    };
    const oppdater = () => {
      if (P.x === Q.x) { formel.innerHTML = MT.mat('$x = ' + n(P.x, 1) + '$ (loddrett linje er ikkje ein funksjon)'); g.teikn(); return; }
      const { a, b } = ab();
      formel.innerHTML = MT.mat(R`$y = \hl{${n(a, 2)}}x ${b < 0 ? '-' : '+'} ${n(Math.abs(b), 2)}$` + `<div class="liten svak">${MT.mat(R`Stigingstal $a = \frac{\Delta y}{\Delta x} = \frac{${n(Q.y - P.y, 1)}}{${n(Q.x - P.x, 1)}} = ${n(a, 2)}$. Konstantledd $b = ${n(b, 2)}$ (der linja kryssar $y$-aksen).`)}</div>`);
      if (maal && Math.abs(a - maal.a) < 0.01 && Math.abs(b - maal.b) < 0.01) { status.className = 'tilbake rett'; status.textContent = 'Treff! Linja di er heilt lik målet.'; maal = null; }
      g.teikn();
    };
    P.vedFlytt = oppdater; Q.vedFlytt = oppdater; g.handtak = [P, Q];
    oppdater();
  }

  /* --- Treff punkta: tilpass ei linje til måledata --- */
  function treff(vert) {
    const data = [[0, 4.6], [1, 7.4], [2, 9.8], [3, 12.9], [4, 15.1], [5, 18.3], [6, 20.4], [7, 23.6], [8, 25.9]];
    const g = new MT.Graf(vert, { xmin: -0.5, xmax: 9, ymin: 0, ymax: 30, hogd: 320, xsteg: 1, ysteg: 5, xnamn: 'veke', ynamn: 'kg', aria: 'Vekt på lam og ei linje du kan tilpasse' });
    const A = { x: 0, y: 8, snap: 0.1, berreY: true }, B = { x: 8, y: 20, snap: 0.1, berreY: true };
    const res = el('div', { class: 'tal-rad' });
    let visBest = false;
    const best = (() => { const N = data.length, sx = data.reduce((s, d) => s + d[0], 0), sy = data.reduce((s, d) => s + d[1], 0), sxx = data.reduce((s, d) => s + d[0] * d[0], 0), sxy = data.reduce((s, d) => s + d[0] * d[1], 0); const a = (N * sxy - sx * sy) / (N * sxx - sx * sx); return { a, b: (sy - a * sx) / N }; })();
    const avvik = () => { const a = (B.y - A.y) / 8, b = A.y; return data.reduce((s, [x, y]) => s + (y - (a * x + b)) ** 2, 0); };
    const bestAvvik = data.reduce((s, [x, y]) => s + (y - (best.a * x + best.b)) ** 2, 0);
    g.lag = (g) => {
      const a = (B.y - A.y) / 8, b = A.y, Ac = MT.farge('accent'), Rd = MT.farge('red');
      data.forEach(([x, y]) => g.linje(x, y, x, a * x + b, MT.alfa(Rd, 0.7), 1.5));
      g.funksjon((x) => a * x + b, Ac, 2.5);
      if (visBest) g.funksjon((x) => best.a * x + best.b, MT.farge('green'), 2, [6, 5]);
      data.forEach(([x, y]) => g.punkt(x, y, g.F.blekk, 4));
    };
    const oppdater = () => {
      const a = (B.y - A.y) / 8, b = A.y, f = avvik(), poeng = Math.max(0, Math.round(100 * (bestAvvik / f)));
      res.innerHTML = MT.mat(`<div><span class="merkelapp">Modellen din</span><b>$y = ${n(a, 2)}x + ${n(b, 2)}$</b></div><div><span class="merkelapp">Sum av kvadrerte avvik</span><b class="mono">${n(f, 2)}</b></div><div><span class="merkelapp">Treffsikkerheit</span><b class="mono">${poeng} %</b></div>`);
      g.teikn();
    };
    A.vedFlytt = oppdater; B.vedFlytt = oppdater; g.handtak = [A, B];
    vert.append(res, el('div', { class: 'rad' }, el('button', { class: 'knapp sekundar', onclick: (e) => { visBest = !visBest; e.currentTarget.textContent = visBest ? 'Skjul regresjonslinja' : 'Vis regresjonslinja (beste linje)'; oppdater(); } }, 'Vis regresjonslinja (beste linje)')), el('p', { class: 'svak liten', html: MT.mat(R`Dei raude strekane er avstanden frå kvart målepunkt til linja. Regresjonslinja er den linja som gir minst sum av kvadrata av desse avstandane: $y = ${n(best.a, 2)}x + ${n(best.b, 2)}$. Eit lam veks altså om lag ${n(best.a, 1)} kg per veke.`) }));
    oppdater();
  }

  /* --- To tilbod --- */
  function tilbod(vert) {
    const tekst = el('p', { class: 'utforsk-tekst', html: R`<b class="farge-a">Utleigar A</b> tek <b data-v="b1"></b> i fastpris og <b data-v="a1"></b> per time for ein minigravar. <b class="farge-b">Utleigar B</b> tek <b data-v="b2"></b> og <b data-v="a2"></b> per time. <span data-o="konk"></span>` });
    vert.append(tekst);
    const g = new MT.Graf(vert, { xmin: 0, xmax: 24, ymin: 0, ymax: 6000, hogd: 300, xsteg: 2, ysteg: 1000, xnamn: 'timar', ynamn: 'kr', aria: 'To lineære kostnadsfunksjonar' });
    let s;
    g.lag = (g) => {
      const A = MT.farge('accent'), B = MT.farge('red');
      g.funksjon((x) => s.b1 + s.a1 * x, A, 2.5); g.funksjon((x) => s.b2 + s.a2 * x, B, 2.5);
      if (s.a1 !== s.a2) { const x = (s.b2 - s.b1) / (s.a1 - s.a2); if (x > 0 && x < 24) { const y = s.b1 + s.a1 * x; g.linje(x, 0, x, y, g.F.svak, 1, [3, 4]); g.punkt(x, y, MT.farge('amber'), 7, true); } }
      if (g.mus) { const x = Math.max(0, g.mus[0]); g.linje(x, 0, x, 6000, MT.alfa(g.F.blekk, 0.3), 1); g.tekst(`A: ${n(s.b1 + s.a1 * x, 0)} kr   B: ${n(s.b2 + s.a2 * x, 0)} kr`, Math.min(x + 0.3, 14), 5600, g.F.blekk, 'left', '12px "DM Mono", monospace'); }
    };
    s = MT.utforsk(tekst, { b1: { v: 800, min: 0, max: 3000, steg: 50, eining: 'kr', px: 2 }, a1: { v: 250, min: 50, max: 500, steg: 10, eining: 'kr', px: 3 }, b2: { v: 1500, min: 0, max: 3000, steg: 50, eining: 'kr', px: 2 }, a2: { v: 180, min: 50, max: 500, steg: 10, eining: 'kr', px: 3 } }, {
      konk: (s) => { if (s.a1 === s.a2) return s.b1 === s.b2 ? 'Tilboda er like.' : `Same timepris, så ${s.b1 < s.b2 ? 'A' : 'B'} er alltid billegast.`; const x = (s.b2 - s.b1) / (s.a1 - s.a2); if (x <= 0) return `${s.b1 + s.a1 < s.b2 + s.a2 ? 'A' : 'B'} er billegast heile vegen.`; return R`Linjene kryssar kvarandre når $x \approx ${n(x, 1)}$ timar. Leiger du kortare tid, er <b>${s.b1 < s.b2 ? 'A' : 'B'}</b> billegast. Leiger du lenger, er <b>${s.b1 < s.b2 ? 'B' : 'A'}</b> billegast.`; },
    });
    tekst.addEventListener('endra', (e) => { s = e.detail; g.teikn(); });
    g.teikn();
  }

  const G = [
    () => { const a = vel([15, 25, 40, 45, 60]), b = vel([200, 300, 450, 500]), x = tilf(2, 12); return { tekst: R`Kostnaden for å leige ein tilhengar er $K(x) = ${a}x + ${b}$, der $x$ er talet på timar. Kva kostar det å leige han i ${x} timar?`, svar: a * x + b, eining: 'kr', tips: R`Set inn $x = ${x}$ i formelen.`, losning: MT.mat(R`$$K(${x}) = ${a} * ${x} + ${b} = ${a * x + b}$$`) }; },
    () => { const x1 = tilf(0, 4), x2 = x1 + tilf(1, 5), a = vel([-3, -2, -1, 0.5, 1, 2, 3, 4]), b = tilf(-3, 8); return { tekst: R`Ei rett linje går gjennom punkta $(${x1}, ${n(a * x1 + b, 1)})$ og $(${x2}, ${n(a * x2 + b, 1)})$. Kva er stigingstalet?`, svar: a, tips: R`$a = \frac{y_2 - y_1}{x_2 - x_1}$`, losning: MT.mat(R`$$a = \frac{${n(a * x2 + b, 1)} - ${n(a * x1 + b, 1)}}{${x2} - ${x1}} = \frac{${n(a * (x2 - x1), 1)}}{${x2 - x1}} = ${n(a, 2)}$$`) }; },
    () => { const a = vel([12, 15, 20, 25]), b = vel([100, 150, 200]), K = b + a * tilf(5, 30); return { tekst: R`Eit transportfirma tek $K(x) = ${a}x + ${b}$ kroner for å køyre $x$ km med dyr. Kor langt kan du få køyrt for ${K} kr?`, svar: (K - b) / a, eining: 'km', tips: R`Løys likninga $${a}x + ${b} = ${K}$.`, losning: MT.mat(R`$$${a}x + ${b} = ${K} \Rightarrow ${a}x = ${K - b} \Rightarrow x = \frac{${K - b}}{${a}} = ${n((K - b) / a, 2)}$$`) }; },
    () => { const v0 = tilf(30, 60) / 10, a = tilf(2, 5) / 10; const t = [0, 1, 2, 3].map((x) => [x, +(v0 + a * x).toFixed(1)]); return { tekst: `Tabellen viser høgda på ei plante (i cm) dei første dagane: ${t.map(([x, y]) => `dag ${x}: ${n(y, 1)} cm`).join(', ')}. Planta veks like mykje kvar dag. Kor høg er ho dag 10?`, svar: v0 + a * 10, eining: 'cm', tips: 'Finn kor mykje planta veks per dag (stigingstalet), og kva ho starta på (konstantleddet).', losning: MT.mat(R`$$h(x) = ${n(a, 1)}x + ${n(v0, 1)} \qquad h(10) = ${n(a, 1)} * 10 + ${n(v0, 1)} = ${n(v0 + a * 10, 1)}~\text{cm}$$`) }; },
    () => { const a1 = vel([150, 200, 250]), b1 = vel([500, 800, 1000]), a2 = a1 - vel([50, 100]), b2 = b1 + vel([400, 600, 1000]); const x = (b2 - b1) / (a1 - a2); return { tekst: R`Tilbod A kostar $${a1}x + ${b1}$ og tilbod B kostar $${a2}x + ${b2}$ kroner for $x$ timar. Etter kor mange timar kostar dei like mykje?`, svar: x, eining: 'timar', tips: 'Set uttrykka like kvarandre og løys for x.', losning: MT.mat(R`$$${a1}x + ${b1} = ${a2}x + ${b2} \Rightarrow ${a1 - a2}x = ${b2 - b1} \Rightarrow x = ${n(x, 2)}$$`) }; },
    () => { const s = vel([[R`Fastpris for leige`, 'b'], [R`Pris per time`, 'a']]); const a = vel([35, 45, 60]), b = vel([250, 400]); return { tekst: R`I modellen $K(x) = ${a}x + ${b}$ for leige av ein vedkløyvar: kva tal står for <b>${s[0].toLowerCase()}</b>?`, val: [String(a), String(b), String(a + b)], svar: s[1] === 'a' ? 0 : 1, losning: `<p>Stigingstalet (${a}) er prisen per time. Konstantleddet (${b}) er det du betaler sjølv om du leiger i 0 timar – fastprisen.</p>` }; },
  ];

  MT.nyttKapittel({
    id: 'funksjonar', nr: 7, tittel: 'Funksjonar og modellar', kort: 'Koordinatsystem, lineære funksjonar, stigingstal og modellar.',
    glyf: '<path d="M5 27V5M5 27h22"/><path d="M7 24L26 8"/>',
    maal: ['Lese og lage grafar i eit koordinatsystem', 'Tolke stigingstal og konstantledd i praktiske samanhengar', 'Lage lineære modellar frå tabellar og tekst', 'Samanlikne tilbod ved å finne skjeringspunkt'],
    formlar: [['Lineær funksjon', R`$f(x) = ax + b$`], ['Stigingstal', R`$a = \frac{y_2 - y_1}{x_2 - x_1}$`], ['Eksponentiell modell', R`$f(x) = a * k^x$`]],
    seksjonar: [
      { id: 'lineaer', tittel: 'Lineære funksjonar', blokker: [
        { type: 'teori', html: R`<p>Ein <b>funksjon</b> er ein regel som gir nøyaktig éin verdi $y$ for kvar verdi $x$. Når grafen er ei rett linje, kallar vi funksjonen <b>lineær</b>:</p>
$$f(x) = ax + b$$
<ul><li>$a$ er <b>stigingstalet</b>: kor mykje $y$ endrar seg når $x$ aukar med 1.</li><li>$b$ er <b>konstantleddet</b>: verdien når $x = 0$, der linja kryssar $y$-aksen.</li></ul>
<p>Leiger du ein tilhengar for 300 kr pluss 45 kr per time, er kostnaden $K(x) = 45x + 300$.</p>` },
        { type: 'utforsk', tittel: 'Linjelaben', intro: 'Dra dei to punkta. Den raude trekanten viser stigingstalet, og det grøne punktet viser konstantleddet.', lag: linjelab },
      ] },
      { id: 'modell', tittel: 'Modellar frå måledata', blokker: [
        { type: 'teori', html: R`<p>I naturbruk måler vi ofte noko over tid: vekta til eit lam, høgda til ei plante, temperaturen i sjøen. Ligg målepunkta nesten på ei rett linje, kan vi lage ein <b>lineær modell</b>. Modellen kan brukast til å seie noko om verdiar vi ikkje har målt.</p>
<p class="merk">Ein modell er ei forenkling. Eit lam held ikkje fram med å vekse like fort heile livet, så modellen gjeld berre i eit avgrensa område.</p>` },
        { type: 'utforsk', tittel: 'Treff punkta', intro: 'Vekta til eit lam er målt kvar veke. Dra endepunkta på linja slik at ho passar best mogleg til målingane.', lag: treff },
        { type: 'eksempel', nr: '7.1', tittel: 'Bruke modellen', oppgave: 'Vekta til eit lam kan modellerast med $V(x) = 2,7x + 4,6$, der $x$ er veker etter fødsel og $V$ er kg. Kva seier modellen om vekta etter 12 veker? Når veg lammet 40 kg?', steg: [R`$V(12) = 2,7 * 12 + 4,6 = 37$ kg.`, R`$2,7x + 4,6 = 40 \Rightarrow 2,7x = 35,4 \Rightarrow x \approx 13,1$ veker.`, R`Tolking: 4,6 kg er fødselsvekta, og lammet legg på seg om lag 2,7 kg i veka.`], svar: '37 kg etter 12 veker. 40 kg etter om lag 13 veker.' },
      ] },
      { id: 'samanlikne', tittel: 'Samanlikne tilbod', blokker: [
        { type: 'teori', html: R`<p>Når to tilbod er lineære funksjonar, er det billegaste tilbodet avhengig av kor mykje du brukar. <b>Skjeringspunktet</b> mellom grafane viser når dei kostar like mykje. Du finn det ved å setje uttrykka like kvarandre og løyse likninga, eller ved å lese av grafen.</p>` },
        { type: 'utforsk', tittel: 'To utleigarar', intro: 'Dra i prisane i teksten, og før musa over grafen for å lese av.', lag: tilbod },
      ] },
      { id: 'oving', tittel: 'Øving', blokker: [{ type: 'oving', generatorar: G }] },
    ],
  });
})();

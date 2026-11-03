/* Kapittel 9 – Økonomi og rekneark */
(function () {
  const { R, el, n, tilf, vel, glidar } = MT;

  /* --- Lønnsslippen --- */
  function lonn(vert) {
    const k = el('div', { class: 'kontrollar' });
    const slipp = el('div', { class: 'slipp mono' });
    const bar = el('div', { class: 'stabel' });
    const m = { tl: 185, t: 75, ot: 6, sk: 22 };
    glidar(k, { namn: 'Timelønn', min: 120, max: 320, steg: 1, verdi: m.tl, eining: 'kr', vedEndring: (v) => { m.tl = v; tegn(); } });
    glidar(k, { namn: 'Vanlege timar', min: 0, max: 162, steg: 1, verdi: m.t, eining: 't', vedEndring: (v) => { m.t = v; tegn(); } });
    glidar(k, { namn: 'Overtid (+40 %)', min: 0, max: 30, steg: 0.5, verdi: m.ot, eining: 't', vedEndring: (v) => { m.ot = v; tegn(); } });
    glidar(k, { namn: 'Skattetrekk', min: 0, max: 45, steg: 1, verdi: m.sk, eining: '%', vedEndring: (v) => { m.sk = v; tegn(); } });
    vert.append(el('div', { class: 'widget-delt' }, k, el('div', {}, slipp, bar)));
    function tegn() {
      const vanleg = m.tl * m.t, otl = m.tl * 1.4, ot = otl * m.ot, brutto = vanleg + ot, skatt = (brutto * m.sk) / 100, netto = brutto - skatt;
      slipp.innerHTML = `<div class="slipp-hode"><b>Lønnsslipp</b><span>Sommarjobb på garden</span></div>
        <div><span>${n(m.t, 0)} t × ${n(m.tl, 2)} kr</span><span>${n(vanleg, 2)}</span></div>
        <div><span>${n(m.ot, 1)} t overtid × ${n(otl, 2)} kr</span><span>${n(ot, 2)}</span></div>
        <div class="sum"><span>Bruttolønn</span><span>${n(brutto, 2)}</span></div>
        <div class="trekk"><span>Skattetrekk ${m.sk} %</span><span>−${n(skatt, 2)}</span></div>
        <div class="sum stor"><span>Utbetalt (netto)</span><span>${n(netto, 2)} kr</span></div>
        <div class="svak"><span>Feriepengar neste år (10,2 %)</span><span>${n(brutto * 0.102, 2)}</span></div>`;
      bar.innerHTML = brutto ? `<span class="netto" style="flex:${netto}">Netto ${n((netto / brutto) * 100, 0)} %</span><span class="skatt" style="flex:${skatt || 0.0001}">Skatt</span>` : '';
    }
    tegn();
  }

  /* --- MVA-snuaren --- */
  function mva(vert) {
    let sats = 25, retning = 'utan';
    const inn = el('input', { id: 'mva-pris', class: 'mono', value: '4 990', inputmode: 'decimal', 'aria-label': 'Pris' });
    const faner = el('div', { class: 'faner' });
    [['utan', 'Eg har pris utan mva'], ['med', 'Eg har pris med mva']].forEach(([id, t]) => faner.append(el('button', { class: 'fane' + (id === retning ? ' pa' : ''), 'data-id': id, onclick: () => { retning = id; MT.$$('.fane', faner).forEach((b) => b.classList.toggle('pa', b.dataset.id === id)); tegn(); } }, t)));
    const satsar = el('div', { class: 'faner' });
    [[25, '25 % (vanleg)'], [15, '15 % (mat)']].forEach(([s, t]) => satsar.append(el('button', { class: 'fane' + (s === sats ? ' pa' : ''), 'data-s': s, onclick: () => { sats = s; MT.$$('.fane', satsar).forEach((b) => b.classList.toggle('pa', +b.dataset.s === s)); tegn(); } }, t)));
    const scene = el('div', { class: 'snuar' });
    inn.addEventListener('input', tegn);
    vert.append(faner, satsar, el('div', { class: 'rad' }, el('label', { for: 'mva-pris', class: 'svak' }, 'Pris (kr):'), inn), scene);
    function tegn() {
      const v = MT.tolk(inn.value); if (isNaN(v)) { scene.textContent = 'Skriv ein pris.'; return; }
      const k = 1 + sats / 100, utan = retning === 'utan' ? v : v / k, med = utan * k;
      scene.innerHTML = MT.mat(`<div class="snuar-boks ${retning === 'utan' ? 'kjend' : ''}"><span class="merkelapp">Utan mva</span><b class="mono">${n(utan, 2)} kr</b></div>
        <div class="snuar-pilar"><span class="${retning === 'utan' ? 'aktiv' : ''}">$* ${n(k, 2)}$ →</span><span class="${retning === 'med' ? 'aktiv' : ''}">← $: ${n(k, 2)}$</span></div>
        <div class="snuar-boks ${retning === 'med' ? 'kjend' : ''}"><span class="merkelapp">Med mva</span><b class="mono">${n(med, 2)} kr</b></div>
        <p class="brei">Mva-beløpet er <b class="mono">${n(med - utan, 2)} kr</b>. Merk: når du går baklengs, deler du på ${n(k, 2)}. Du trekkjer <i>ikkje</i> frå ${sats} %.</p>`);
    }
    tegn();
  }

  /* --- Rekneark-laben --- */
  function rekneark(vert) {
    const KOL = ['A', 'B', 'C', 'D'], RADER = 9;
    const celler = {
      A1: 'Post', B1: 'Inntekt', C1: 'Utgift',
      A2: 'Lønn sommarjobb', B2: '14200',
      A3: 'Sal av egg', B3: '2350',
      A4: 'Mobil', C4: '299',
      A5: 'Mat og kantine', C5: '1800',
      A6: 'Busskort', C6: '450',
      A7: 'Sparing', C7: '=B8*0,2',
      A8: 'Sum', B8: '=SUMMER(B2:B7)', C8: '=SUMMER(C2:C7)',
      A9: 'Til overs', B9: '=B8-C8',
    };
    let valt = 'B8';
    const linje = el('div', { class: 'formellinje' }, el('span', { class: 'mono cellenamn' }, valt), el('input', { id: 'rk-formel', class: 'mono', 'aria-label': 'Innhaldet i cella' }));
    const rutenett = el('div', { class: 'rk-grid', role: 'grid' });
    vert.append(linje, el('div', { class: 'rk-vert' }, rutenett), el('p', { class: 'svak liten', html: 'Formlar startar med <span class="mono">=</span>. Du kan bruke cellenamn (<span class="mono">B2</span>), <span class="mono">+ − * /</span>, og <span class="mono">SUMMER(B2:B7)</span> eller <span class="mono">GJENNOMSNITT(B2:B7)</span>. Prøv å endre lønna og sjå at summane følgjer med.' }));
    const rf = linje.lastChild;
    function verdi(id, sti = []) {
      const raa = celler[id]; if (raa == null || raa === '') return 0;
      if (sti.includes(id)) throw new Error('Sirkelreferanse');
      if (!String(raa).startsWith('=')) { const v = MT.tolk(raa); return isNaN(v) ? raa : v; }
      let f = raa.slice(1).toUpperCase();
      const omraade = (a, b) => { const [ka, ra] = [a[0], +a.slice(1)], [kb, rb] = [b[0], +b.slice(1)]; const ut = []; for (let k = KOL.indexOf(ka); k <= KOL.indexOf(kb); k++) for (let r = ra; r <= rb; r++) { const v = verdi(KOL[k] + r, [...sti, id]); if (typeof v === 'number') ut.push(v); } return ut; };
      f = f.replace(/(SUMMER|SUM|GJENNOMSNITT|AVERAGE|MAKS|MAX|MIN)\(([A-D]\d):([A-D]\d)\)/g, (_, fn, a, b) => { const l = omraade(a, b); const v = /SUM/.test(fn) ? l.reduce((s, x) => s + x, 0) : /GJ|AV/.test(fn) ? l.reduce((s, x) => s + x, 0) / (l.length || 1) : /MA/.test(fn) ? Math.max(...l) : Math.min(...l); return '(' + v + ')'; });
      f = f.replace(/\b([A-D])(\d)\b/g, (_, k, r) => { const v = verdi(k + r, [...sti, id]); if (typeof v !== 'number') throw new Error('Tekst i ' + k + r); return '(' + v + ')'; });
      return MT.rekn(f);
    }
    function tegn() {
      rutenett.innerHTML = '';
      rutenett.append(el('div', { class: 'rk-hjorne' }));
      KOL.forEach((k) => rutenett.append(el('div', { class: 'rk-kol' }, k)));
      for (let r = 1; r <= RADER; r++) {
        rutenett.append(el('div', { class: 'rk-rad' }, String(r)));
        KOL.forEach((k) => {
          const id = k + r; let vis = celler[id] || '', cls = 'rk-celle';
          if (String(vis).startsWith('=')) { try { const v = verdi(id); vis = typeof v === 'number' ? n(v, 2) : v; cls += ' formel'; } catch (e) { vis = '#FEIL'; cls += ' feil'; } }
          else if (!isNaN(MT.tolk(vis)) && vis !== '') { vis = n(MT.tolk(vis), 2); cls += ' tal'; }
          if (id === valt) cls += ' valt';
          rutenett.append(el('button', { class: cls, 'data-id': id, role: 'gridcell', 'aria-label': id + ': ' + (celler[id] || 'tom'), onclick: () => { valt = id; rf.value = celler[id] || ''; linje.firstChild.textContent = id; tegn(); rf.focus(); } }, vis));
        });
      }
    }
    rf.addEventListener('input', () => { celler[valt] = rf.value; tegn(); });
    rf.addEventListener('keydown', (e) => { if (e.key === 'Enter') { const r = +valt.slice(1); if (r < RADER) { valt = valt[0] + (r + 1); rf.value = celler[valt] || ''; linje.firstChild.textContent = valt; tegn(); } } });
    rf.value = celler[valt]; tegn();
  }

  const G = [
    () => { const tl = tilf(160, 260), t = tilf(20, 120), ot = tilf(2, 12); return { tekst: `Ein elev på sommarjobb har timelønn ${tl} kr og får 40 % tillegg for overtid. Ein månad jobbar eleven ${t} vanlege timar og ${ot} timar overtid. Kva er bruttolønna?`, svar: tl * t + tl * 1.4 * ot, eining: 'kr', tips: `Overtidsbetalinga per time er ${tl} · 1,4.`, losning: MT.mat(R`$$${tl} * ${t} + ${tl} * 1,4 * ${ot} = ${n(tl * t, 0)} + ${n(tl * 1.4 * ot, 2)} = ${n(tl * t + tl * 1.4 * ot, 2)}~\text{kr}$$`) }; },
    () => { const b = tilf(80, 400) * 50, s = vel([18, 22, 25, 30, 33]); return { tekst: `Bruttolønna er ${n(b, 0)} kr og skattetrekket er ${s} %. Kor mykje blir utbetalt?`, svar: b * (1 - s / 100), eining: 'kr', tips: `Du får behalde ${100 - s} % av lønna.`, losning: MT.mat(R`$$${n(b, 0)} * ${n(1 - s / 100, 2)} = ${n(b * (1 - s / 100), 2)}~\text{kr}$$`) }; },
    () => { const p = tilf(4, 300) * 10; return { tekst: `Ein frøpose kostar ${n(p, 0)} kr <b>utan</b> meirverdiavgift. Kva kostar han med 25 % mva?`, svar: p * 1.25, eining: 'kr', tips: 'Gong med vekstfaktoren 1,25.', losning: MT.mat(R`$$${n(p, 0)} * 1,25 = ${n(p * 1.25, 2)}~\text{kr}$$`) }; },
    () => { const u = tilf(20, 900) * 10, med = u * 1.25; return { tekst: `Ei motorsag kostar ${n(med, 2)} kr <b>med</b> 25 % mva. Kva er prisen utan mva?`, svar: u, eining: 'kr', tips: 'Del på 1,25 – ikkje trekk frå 25 %.', losning: MT.mat(R`$$\frac{${n(med, 2)}}{1,25} = ${n(u, 2)}~\text{kr}$$`) }; },
    () => { const a = [vel([2, 3, 5]), tilf(39, 89)], b = [vel([10, 12, 15]), 0]; b[1] = Math.round(((a[1] / a[0]) * b[0] * vel([0.8, 0.9, 1.1, 1.2])) / 1) ; const pa = a[1] / a[0], pb = b[1] / b[0]; return { tekst: `Hundefôr: Pose A er ${a[0]} kg og kostar ${a[1]} kr. Pose B er ${b[0]} kg og kostar ${b[1]} kr. Kva er kiloprisen for den <b>billegaste</b> posen?`, svar: Math.min(pa, pb), eining: 'kr/kg', tips: 'Kilopris = pris delt på kg. Rekn ut for begge.', losning: MT.mat(R`$$A: \frac{${a[1]}}{${a[0]}} = ${n(pa, 2)}~\text{kr/kg} \qquad B: \frac{${b[1]}}{${b[0]}} = ${n(pb, 2)}~\text{kr/kg}$$`) }; },
    () => { const k = tilf(10, 50) * 1000, r = vel([3, 3.5, 4, 4.5, 5]), t = tilf(2, 8); return { tekst: `Du set inn ${n(k, 0)} kr på ein sparekonto med ${n(r, 1)} % rente per år. Kor mykje står på kontoen etter ${t} år?`, svar: k * Math.pow(1 + r / 100, t), eining: 'kr', tips: R`Bruk vekstfaktor: $${n(k, 0)} * ${n(1 + r / 100, 3)}^{${t}}$.`, losning: MT.mat(R`$$${n(k, 0)} * ${n(1 + r / 100, 3)}^{${t}} \approx ${n(k * Math.pow(1 + r / 100, t), 2)}~\text{kr}$$`) }; },
    () => { const b = tilf(100, 300) * 100; return { tekst: `Ein elev tente ${n(b, 0)} kr brutto i fjor. Kor mykje får eleven i feriepengar i år, når satsen er 10,2 %?`, svar: b * 0.102, eining: 'kr', tips: '10,2 % = 0,102.', losning: MT.mat(R`$$${n(b, 0)} * 0,102 = ${n(b * 0.102, 2)}~\text{kr}$$`) }; },
  ];

  MT.nyttKapittel({
    id: 'okonomi', nr: 9, tittel: 'Økonomi og rekneark', kort: 'Lønn, skatt, mva, budsjett, prisar, rente og rekneark.',
    glyf: '<rect x="4" y="8" width="24" height="16" rx="2"/><circle cx="16" cy="16" r="4"/><path d="M8 12v.1M24 20v.1"/>',
    maal: ['Rekne ut brutto- og nettolønn, overtid og feriepengar', 'Rekne med meirverdiavgift', 'Lage og vurdere budsjett og rekneskap', 'Samanlikne prisar med einingspris', 'Bruke rekneark med formlar'],
    formlar: [['Overtid (minst)', R`$\text{timelønn} * 1,4$`], ['Feriepengar', R`$\text{brutto} * 0,102$`], ['Nettolønn', R`$\text{brutto} * (1 - \frac{\text{skatt}}{100})$`], ['Med mva (25 %)', R`$\text{utan} * 1,25$`], ['Utan mva', R`$\frac{\text{med}}{1,25}$`], ['Einingspris', R`$\frac{\text{pris}}{\text{mengd}}$`]],
    seksjonar: [
      { id: 'lonn', tittel: 'Lønn og skatt', blokker: [
        { type: 'teori', html: R`<p><b>Bruttolønn</b> er all lønn før skatt. <b>Nettolønn</b> er det som blir utbetalt etter skattetrekk. Med <b>prosenttrekk</b> blir ein fast prosent av lønna trekt.</p>
<ul><li>Overtid skal etter arbeidsmiljølova betalast med minst 40 % tillegg: timelønn $* 1,4$.</li><li>Feriepengar er normalt 10,2 % av det du tente året før, og blir utbetalte i staden for vanleg lønn i ferien.</li></ul>` },
        { type: 'utforsk', tittel: 'Lønnsslippen', intro: 'Still inn timelønn, timar og skatt. Sjå korleis lønnsslippen blir rekna ut linje for linje.', lag: lonn },
        { type: 'eksempel', nr: '9.1', tittel: 'Sommarjobb i fjøset', oppgave: 'Sigrid har timelønn 190 kr. I juli jobbar ho 110 timar og 8 timar overtid. Skattetrekket er 20 %. Kva får ho utbetalt?', steg: [R`Vanleg lønn: $110 * 190 = 20~900$ kr.`, R`Overtid: $8 * 190 * 1,4 = 2~128$ kr.`, R`Brutto: $20~900 + 2~128 = 23~028$ kr.`, R`Netto: $23~028 * 0,80 = 18~422,40$ kr.`], svar: 'Ho får utbetalt 18 422,40 kr.' },
      ] },
      { id: 'mva', tittel: 'Meirverdiavgift', blokker: [
        { type: 'teori', html: R`<p>Meirverdiavgift (mva) er ein skatt som blir lagd på varer og tenester. Den vanlege satsen i Noreg er 25 %, og for mat er han 15 %. Bedrifter oppgir ofte prisar <i>utan</i> mva til kvarandre, medan forbrukarar ser prisar <i>med</i> mva.</p>
$$\text{med mva} = \text{utan mva} * 1,25 \qquad \text{utan mva} = \frac{\text{med mva}}{1,25}$$` },
        { type: 'utforsk', tittel: 'Mva-snuaren', intro: 'Skriv ein pris og vel kva du kjenner. Pilene viser vegen begge retningar.', lag: mva },
      ] },
      { id: 'budsjett', tittel: 'Budsjett og rekneark', blokker: [
        { type: 'teori', html: R`<p>Eit <b>budsjett</b> er ein plan over inntekter og utgifter framover. Eit <b>rekneskap</b> viser kva som faktisk skjedde. Går det i pluss, har du eit <i>overskot</i>. Går det i minus, har du eit <i>underskot</i>.</p>
<p>I eit <b>rekneark</b> (Excel, Google Sheets, Numbers) skriv du formlar i staden for tal. Endrar du eitt tal, blir alt som avheng av det, rekna ut på nytt. Det gjer rekneark perfekt for budsjett, avlingsoversikter og fôrplanar.</p>` },
        { type: 'utforsk', tittel: 'Rekneark-laben', intro: 'Eit ekte, lite rekneark. Trykk på ei celle for å sjå formelen, og skriv inn eigne tal og formlar.', lag: rekneark },
        { type: 'eksempel', nr: '9.2', tittel: 'Kva er billegast?', oppgave: 'Strøsagflis blir seld i sekk på 20 kg for 159 kr, eller i storsekk på 350 kg for 2 490 kr. Kva er billegast per kg?', steg: [R`Liten sekk: $\frac{159}{20} = 7,95$ kr/kg.`, R`Storsekk: $\frac{2490}{350} \approx 7,11$ kr/kg.`, R`Storsekken er $7,95 - 7,11 = 0,84$ kr billegare per kg. Men du må ha plass til han, og bruke opp flisa før ho blir dårleg.`], svar: 'Storsekken er billegast per kg.' },
      ] },
      { id: 'oving', tittel: 'Øving', blokker: [{ type: 'oving', generatorar: G }] },
    ],
  });
})();

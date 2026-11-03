/* Kapittel 1 – Tal og rekning */
(function () {
  const { R, el, n, tilf, vel, glidar, utforsk } = MT;

  /* --- Rekkjefølgje-maskina: reknar eit uttrykk steg for steg --- */
  function tokens(s) { return s.match(/\d+(?:[.,]\d+)?|[-+*/^()]/g).map((t) => (/\d/.test(t) ? +t.replace(',', '.') : t)); }
  function nesteSteg(t) {
    let a = 0, b = t.length - 1;
    const opn = t.lastIndexOf('(');
    if (opn >= 0) { a = opn + 1; b = t.indexOf(')', opn) - 1; if (a === b) return { slett: [opn, opn + 2], fra: opn, til: opn + 2, grunn: 'Parentesen er ferdig rekna' }; }
    const del = t.slice(a, b + 1);
    let i = del.lastIndexOf('^'), grunn = 'Potens først';
    if (i < 0) { i = del.findIndex((x) => x === '*' || x === '/'); grunn = 'Gange og dele før pluss og minus'; }
    if (i < 0) { i = del.findIndex((x) => x === '+' || x === '-'); grunn = 'Pluss og minus frå venstre'; }
    if (opn >= 0) grunn = 'Inne i parentesen: ' + grunn.toLowerCase();
    i += a;
    const x = t[i - 1], y = t[i + 1], op = t[i];
    const v = op === '^' ? Math.pow(x, y) : op === '*' ? x * y : op === '/' ? x / y : op === '+' ? x + y : x - y;
    return { fra: i - 1, til: i + 1, v, grunn };
  }
  const visTok = (x) => (typeof x === 'number' ? n(x, 4) : x === '*' ? '·' : x === '/' ? ':' : x === '-' ? '−' : x);
  function teiknUttrykk(t, hl) {
    let h = '', i = 0;
    while (i < t.length) {
      if (hl && i === hl.fra) { h += '<span class="hl-bit">'; }
      if (t[i] === '^') { h += '<sup>' + visTok(t[i + 1]) + '</sup>'; i += 2; if (hl && i - 1 === hl.til) h += '</span>'; continue; }
      h += '<span class="tok' + (typeof t[i] === 'string' ? ' op' : '') + '">' + visTok(t[i]) + '</span>';
      if (hl && i === hl.til) h += '</span>';
      i++;
    }
    return h;
  }
  const UTTRYKK = ['2+3*4^2', '(8-3)*2^3', '48/(2+6)*3', '5+2*(9-4)^2', '100-4*3^2+6', '(12+18)/5-2*2', '3*(2+4)^2/9', '7+(20-2*4)/3'];
  function rekkjefolgje(vert) {
    const skjerm = el('div', { class: 'uttrykk-skjerm', 'aria-live': 'polite' });
    const grunn = el('div', { class: 'uttrykk-grunn mono' });
    const logg = el('ol', { class: 'uttrykk-logg' });
    let t, hl;
    const start = (s) => { t = tokens(s); hl = null; logg.innerHTML = ''; vis(); };
    const vis = () => { skjerm.innerHTML = teiknUttrykk(t, hl); };
    const steg = () => {
      if (t.length === 1) { start(vel(UTTRYKK)); return; }
      if (!hl) { hl = nesteSteg(t); grunn.textContent = hl.grunn; vis(); knapp.textContent = 'Rekn ut det markerte'; return; }
      const før = teiknUttrykk(t, hl);
      if (hl.slett) t.splice(hl.slett[0], 3, t[hl.slett[0] + 1]); else t.splice(hl.fra, 3, hl.v);
      // fjern parentes rundt eitt tal med ein gong
      for (let i = 0; i < t.length - 2; i++) if (t[i] === '(' && typeof t[i + 1] === 'number' && t[i + 2] === ')') t.splice(i, 3, t[i + 1]);
      logg.append(el('li', { class: 'mono' }, ''));
      logg.lastChild.innerHTML = før + ' <span class="pil">=</span> ' + teiknUttrykk(t);
      hl = null; vis();
      if (t.length === 1) { grunn.textContent = 'Ferdig! Svaret er ' + n(t[0], 4); knapp.textContent = 'Nytt uttrykk'; }
      else { grunn.textContent = 'Kva skal reknast no?'; knapp.textContent = 'Vis neste operasjon'; }
    };
    const knapp = el('button', { class: 'knapp', onclick: steg }, 'Vis neste operasjon');
    const eige = el('input', { class: 'mono', id: 'eige-uttrykk', placeholder: 'Skriv eige, t.d. 4+2*(5-1)^2', 'aria-label': 'Eige uttrykk' });
    const prov = el('form', { class: 'rad', onsubmit: (e) => { e.preventDefault(); if (/^[\d+\-*/^().,\s]+$/.test(eige.value) && /\d/.test(eige.value)) { try { MT.rekn(eige.value); start(eige.value.replace(/\s/g, '')); grunn.textContent = 'Kva skal reknast først?'; knapp.textContent = 'Vis neste operasjon'; } catch (_) { grunn.textContent = 'Uttrykket er ikkje gyldig'; } } } }, eige, el('button', { class: 'knapp sekundar', type: 'submit' }, 'Bruk'));
    vert.append(skjerm, grunn, el('div', { class: 'rad' }, knapp), logg, prov);
    start(UTTRYKK[0]); grunn.textContent = 'Kva skal reknast først? Trykk på knappen.';
  }

  /* --- Brøkjordet: eit jorde delt i nemnar-stripar --- */
  function brokjorde(vert) {
    const svg = el('div', { class: 'brok-jorde' });
    const info = el('div', { class: 'brok-info' });
    const kontroll = el('div', { class: 'kontrollar' });
    let t = 3, m = 4;
    const tegn = () => {
      t = Math.min(t, m); tg.inn.max = m; if (tg.v > m) tg.v = m;
      let h = '<svg viewBox="0 0 400 200" role="img" aria-label="Jorde delt i ' + m + ' like stripar, ' + t + ' er farga">';
      const b = 400 / m;
      for (let i = 0; i < m; i++) h += `<rect x="${i * b + 1}" y="1" width="${b - 2}" height="198" rx="2" class="${i < t ? 'stripe pa' : 'stripe'}" style="transition-delay:${i * 25}ms"></rect>`;
      for (let i = 0; i < m; i++) for (let j = 0; j < 9; j++) h += `<path d="M${i * b + 8} ${16 + j * 21} h${Math.max(0, b - 16)}" class="foure"></path>`;
      svg.innerHTML = h + '</svg>';
      info.innerHTML = MT.mat(R`$\frac{${t}}{${m}} = ${n(t / m, 4)} = ${n((t / m) * 100, 2)}~\%$` + `<p>Av eit jorde på <b>240 dekar</b> er det <b>${n((240 * t) / m, 2)} dekar</b>. Utrekning: ${MT.mat(R`$240 : ${m} * ${t} = ${n((240 * t) / m, 2)}$`)}</p>`);
    };
    const tg = glidar(kontroll, { namn: 'Teljar', min: 0, max: 4, verdi: t, vedEndring: (v) => { t = v; tegn(); } });
    glidar(kontroll, { namn: 'Nemnar', min: 1, max: 12, verdi: m, vedEndring: (v) => { m = v; tegn(); } });
    vert.append(el('div', { class: 'widget-delt' }, svg, el('div', {}, kontroll, info)));
    tegn();
  }

  /* --- Komma-hopparen: frå tal til standardform --- */
  function kommaHoppar(vert) {
    const inn = el('input', { id: 'komma-tal', class: 'mono', value: '384000000', inputmode: 'decimal', 'aria-label': 'Tal du vil skrive på standardform' });
    const scene = el('div', { class: 'komma-scene mono', 'aria-live': 'polite' });
    const res = el('div', { class: 'komma-res' });
    const knapp = el('button', { class: 'knapp' }, 'Hopp!');
    const forslag = el('div', { class: 'brikker' });
    [['Avstand jord–måne (m)', '384000000'], ['Laks i ein stor merd', '200000'], ['Diameter på ei celle (m)', '0,00001'], ['Sandkorn (kg)', '0,0000006'], ['Folketal i Noreg', '5600000']].forEach(([t, v]) => forslag.append(el('button', { class: 'brikke', onclick: () => { inn.value = v; kjor(); } }, t)));
    let timer;
    function kjor() {
      clearTimeout(timer);
      const s = inn.value.replace(/[\s ]/g, '').replace('.', ',');
      if (!/^\d+(,\d+)?$/.test(s) || /^0+(,0*)?$/.test(s)) { scene.textContent = 'Skriv eit positivt tal, t.d. 0,00042'; res.innerHTML = ''; return; }
      let [hel, des = ''] = s.split(',');
      hel = hel.replace(/^0+(?=\d)/, '');
      const siffer = (hel + des).split('');
      let komma = hel.length; // komma står etter så mange siffer
      const forste = siffer.findIndex((c) => c !== '0');
      const maal = forste + 1; const hopp = komma - maal; // positiv = hopp mot venstre
      let pos = komma, tal = 0;
      const tegn = () => {
        let h = '';
        siffer.forEach((c, i) => { if (i === pos) h += '<span class="komma">,</span>'; h += `<span class="siffer${i < forste ? ' null' : ''}">${c}</span>`; });
        if (pos >= siffer.length) h += '<span class="komma">,</span>';
        scene.innerHTML = h + `<span class="hopp-tel">${tal} hopp ${hopp >= 0 ? '←' : '→'}</span>`;
      };
      tegn();
      const steg = () => {
        if (pos === maal) {
          const a = (siffer.slice(forste, forste + 1).join('') + (siffer.slice(forste + 1).join('').replace(/0+$/, '') ? ',' + siffer.slice(forste + 1).join('').replace(/0+$/, '') : ''));
          res.innerHTML = MT.mat(R`$$${s} = \hl{${a} * 10^{${hopp}}}$$` + `<p>Kommaet hoppa <b>${Math.abs(hopp)}</b> plassar mot ${hopp >= 0 ? 'venstre, så eksponenten er positiv' : 'høgre, så eksponenten er negativ'}. På kalkulatoren står det <span class="mono">${a}E${hopp}</span>.</p>`);
          return;
        }
        pos += pos > maal ? -1 : 1; tal++; tegn();
        timer = setTimeout(steg, MT.roleg ? 0 : 380);
      };
      res.innerHTML = '';
      timer = setTimeout(steg, 500);
    }
    knapp.onclick = kjor;
    inn.addEventListener('keydown', (e) => { if (e.key === 'Enter') kjor(); });
    vert.append(forslag, el('div', { class: 'rad' }, inn, knapp), scene, res);
    kjor();
  }

  /* --- Tierpotens-skala --- */
  const SKALA = [[-6, 'Bakterie', '1 µm'], [-5, 'Tjukkleik på eit hår', 'ca. 0,05 mm'], [-4, 'Pollenkorn', '0,1 mm'], [-3, 'Sandkorn', '1 mm'], [-2, 'Breidda på ein lakselus', '1 cm'], [-1, 'Lengda på ei gulrot', '10 cm'], [0, 'Eit lam (lengd)', '1 m'], [1, 'Ein traktor med hengar', '10 m'], [2, 'Ein fotballbane', '100 m'], [3, 'Frå skulen til butikken', '1 km'], [4, 'Breidda på ein fjord', '10 km'], [5, 'Kristiansund–Molde, omtrent', '100 km'], [6, 'Lengda på Noreg (luftline)', '1 750 km'], [7, 'Diameteren til jorda', '12 742 km']];
  function tierskala(vert) {
    const vis = el('div', { class: 'tier-vis' });
    const linje = el('div', { class: 'tier-linje', 'aria-hidden': 'true' });
    SKALA.forEach(([e]) => linje.append(el('span', { 'data-e': e }, e)));
    const k = el('div', { class: 'kontrollar' });
    const sett = (e) => {
      const [, ting, mal] = SKALA.find((s) => s[0] === e);
      const tal = e >= 0 ? n(Math.pow(10, e), 0) : '0,' + '0'.repeat(-e - 1) + '1';
      vis.innerHTML = MT.mat(R`<div class="tier-pot">$10^{${e}}~\text{m}$</div><div class="tier-tal mono">= ${tal} m</div><div class="tier-ting">${ting} <span class="svak">(${mal})</span></div>`);
      MT.$$('span', linje).forEach((s) => s.classList.toggle('pa', +s.dataset.e === e));
    };
    glidar(k, { namn: 'Eksponent $n$', min: -6, max: 7, verdi: 0, fmt: (v) => '$n = ' + v + '$', vedEndring: sett });
    vert.append(vis, linje, k); sett(0);
  }

  /* --- Overslagsspelet --- */
  function overslagsspel(vert) {
    const scene = el('div', { class: 'spel' });
    vert.append(scene);
    let runde = 0, poeng = 0, tid, start;
    const meny = () => {
      scene.innerHTML = '';
      scene.append(el('p', { html: 'Ti reknestykke. Du har <b>8 sekund</b> på kvart. Vel svaret som er <b>nærast</b> – ikkje rekn nøyaktig, gjer overslag!' }), el('button', { class: 'knapp', onclick: () => { runde = 0; poeng = 0; neste(); } }, 'Start spelet'));
      const best = MT.les('overslag-best', null); if (best != null) scene.append(el('p', { class: 'svak mono' }, 'Beste resultat: ' + best + '/10'));
    };
    const neste = () => {
      clearInterval(tid);
      if (runde === 10) { const best = Math.max(poeng, MT.les('overslag-best', 0)); MT.skriv('overslag-best', best); scene.innerHTML = ''; scene.append(el('div', { class: 'spel-slutt', html: `<div class="stort-tal">${poeng}/10</div><p>${poeng >= 8 ? 'Imponerande overslag!' : poeng >= 5 ? 'Bra! Prøv igjen og slå deg sjølv.' : 'Øving gjer meister – rund av til tal som er lette å rekne med.'}</p>` }), el('button', { class: 'knapp', onclick: meny }, 'Spel igjen')); return; }
      runde++;
      const typ = tilf(0, 2);
      let a, b, txt, v;
      if (typ === 0) { a = tilf(11, 99) + tilf(1, 9) / 10; b = tilf(11, 99); v = a * b; txt = `${n(a, 1)} · ${b}`; }
      else if (typ === 1) { a = tilf(101, 999); b = tilf(11, 49); v = a / b; txt = `${a} : ${b}`; }
      else { a = tilf(199, 999); b = tilf(3, 29); v = a * b; txt = `${a} · ${b}`; }
      const fak = MT.stokk([1, vel([0.5, 0.6, 0.7]), vel([1.6, 1.8, 2, 3])]);
      const svar = fak.map((f) => Math.round(v * f / Math.pow(10, Math.max(0, Math.floor(Math.log10(v)) - 1))) * Math.pow(10, Math.max(0, Math.floor(Math.log10(v)) - 1)));
      const rett = fak.indexOf(1);
      scene.innerHTML = '';
      const bar = el('div', { class: 'tidsbar' }, el('span'));
      scene.append(el('div', { class: 'spel-topp mono' }, `Runde ${runde}/10`, el('span', {}, `Poeng: ${poeng}`)), bar, el('div', { class: 'spel-stykke mono' }, txt + ' ≈ ?'));
      const g = el('div', { class: 'val-grid' });
      let ferdig = false;
      const vel_ = (i, btn) => { if (ferdig) return; ferdig = true; clearInterval(tid); if (i === rett) { poeng++; btn && btn.classList.add('rett'); } else { btn && btn.classList.add('feil'); g.children[rett].classList.add('rett'); } setTimeout(neste, 900); };
      svar.forEach((s, i) => g.append(el('button', { class: 'val mono', onclick: (e) => vel_(i, e.currentTarget) }, n(s, 0))));
      scene.append(g);
      start = performance.now();
      tid = setInterval(() => { const p = (performance.now() - start) / 8000; bar.firstChild.style.width = Math.max(0, 100 - p * 100) + '%'; if (p >= 1) vel_(-1); }, 50);
    };
    meny();
  }

  /* --- Generatorar --- */
  const G = [
    () => { const s = vel(['a+b*c', '(a+b)*c', 'a*b-c', 'a+b*c^2', '(a-b)^2+c', 'a*(b+c)-b']); const a = tilf(2, 9), b = tilf(2, 6), c = tilf(2, 5); const u = s.replace('a', a).replace(/b/g, b).replace('c', c); const v = MT.rekn(u); return { tekst: R`Rekn ut: $${u}$`, svar: v, tips: 'Parentesar først, så potensar, så gange/dele, til slutt pluss/minus.', losning: '<ol class="los-steg">' + (() => { let t = tokens(u), h = ''; while (t.length > 1) { const st = nesteSteg(t); if (st.slett) t.splice(st.slett[0], 3, t[st.slett[0] + 1]); else t.splice(st.fra, 3, st.v); for (let i = 0; i < t.length - 2; i++) if (t[i] === '(' && typeof t[i + 1] === 'number' && t[i + 2] === ')') t.splice(i, 3, t[i + 1]); h += '<li class="mono">= ' + teiknUttrykk(t) + '</li>'; } return h; })() + '</ol>' }; },
    () => { const q = vel([3, 4, 5, 6, 8, 10]), p = tilf(1, q - 1), N = q * tilf(5, 40); const ting = vel([['dekar', 'Eit jorde er'], ['sauer', 'Ein besetning har'], ['liter', 'Ein tank rommar']]); return { tekst: R`${ting[1]} ${N} ${ting[0]}. Kor mykje er $\frac{${p}}{${q}}$ av dette?`, svar: (N * p) / q, eining: ting[0], tips: R`Del på nemnaren og gong med teljaren: $${N} : ${q} * ${p}$.`, losning: MT.mat(R`$$${N} : ${q} = ${n(N / q)} \quad\text{og}\quad ${n(N / q)} * ${p} = ${n((N * p) / q)}$$`) }; },
    () => { const q = vel([2, 4, 5, 8, 10, 20, 25]), p = tilf(1, q - 1); return { tekst: R`Skriv $\frac{${p}}{${q}}$ som prosent.`, svar: (p / q) * 100, eining: '%', tips: 'Rekn teljar delt på nemnar, og gong svaret med 100.', losning: MT.mat(R`$$\frac{${p}}{${q}} = ${n(p / q, 4)} = ${n((p / q) * 100, 2)}~\%$$`) }; },
    () => { const e = vel([-5, -4, -3, 3, 4, 5, 6, 7]); const a = tilf(11, 98) / 10; const tal = a * Math.pow(10, e); const vist = e > 0 ? n(tal, 0) : tal.toFixed(-e + 1).replace('.', ','); return { tekst: R`Skriv talet <span class="mono">${vist}</span> på standardform $a*10^n$. Kva er $n$?`, svar: e, tol: 0, tips: 'Tel kor mange plassar kommaet må flytte seg for at det skal stå eitt siffer (ikkje 0) føre kommaet.', losning: MT.mat(R`$$${vist} = ${n(a, 2)} * 10^{${e}}$$`) }; },
    () => { const g = vel([2, 3, 5, 10]), e = g === 10 ? tilf(2, 6) : tilf(2, g === 2 ? 8 : 4); return { tekst: R`Rekn ut potensen $${g}^{${e}}$.`, svar: Math.pow(g, e), tips: R`$${g}^{${e}}$ betyr at du gongar ${g} med seg sjølv ${e} gonger.`, losning: MT.mat(R`$$${Array(e).fill(g).join('*')} = ${n(Math.pow(g, e), 0)}$$`) }; },
    () => { const st = tilf(25, 49), pris = vel([389, 412, 495, 512, 598, 612]); const ov = Math.round(st / 10) * 10 * Math.round(pris / 100) * 100; const val = MT.stokk([ov, ov * 10, Math.round(ov / 10)]); return { tekst: `Ein bonde kjøper ${st} rundballar til ${pris} kr stykket. Kva er eit godt overslag over prisen?`, val: val.map((v) => n(v, 0) + ' kr'), svar: val.indexOf(ov), losning: MT.mat(R`$$${st} * ${pris} \approx ${Math.round(st / 10) * 10} * ${Math.round(pris / 100) * 100} = ${n(ov, 0)}$$Nøyaktig svar: ${n(st * pris, 0)} kr.`) }; },
  ];

  MT.nyttKapittel({
    id: 'tal', nr: 1, tittel: 'Tal og rekning', kort: 'Rekneprioritering, brøk, potensar, standardform og overslag.',
    glyf: '<path d="M6 10h8M10 6v8M18 10h8M6 24l8-8M6 16l8 8M18 20h8M18 26h8"/>',
    maal: ['Rekne med rett rekkjefølgje på rekneartane', 'Rekne med brøk og finne brøkdelen av ei mengd', 'Skrive store og små tal på standardform', 'Gjere overslag og vurdere om eit svar er rimeleg'],
    formlar: [['Rekkjefølgje', R`$(\,) \to a^n \to *,: \to +,-$`], ['Brøk av mengd', R`$\frac{a}{b}~\text{av}~N = N : b * a$`], ['Standardform', R`$a*10^n,~ 1 \le a < 10$`], ['Negativ eksponent', R`$10^{-n} = \frac{1}{10^n}$`]],
    seksjonar: [
      { id: 'prioritet', tittel: 'Rekneprioritering', blokker: [
        { type: 'teori', html: R`<p>Når eit reknestykke har fleire rekneartar, må alle rekne i same rekkjefølgje. Elles får vi ulike svar på same stykke. Regelen er:</p>
<ol class="talliste"><li><b>Parentesar</b> – det som står inni, reknar du først.</li><li><b>Potensar</b> – til dømes $4^2$.</li><li><b>Gange og dele</b> – frå venstre mot høgre.</li><li><b>Pluss og minus</b> – frå venstre mot høgre.</li></ol>
$$2 + 3 * 4^2 = 2 + 3 * 16 = 2 + 48 = 50$$
<p class="merk">Kalkulatoren og Python følgjer same regel. Skriv du <span class="mono">2+3*4</span>, får du 14, ikkje 20.</p>` },
        { type: 'utforsk', tittel: 'Rekkjefølgje-maskina', intro: 'Maskina markerer kva som skal reknast i kvart steg, og forklarer kvifor. Prøv eige uttrykk nedst.', lag: rekkjefolgje },
      ] },
      { id: 'brok', tittel: 'Brøk', blokker: [
        { type: 'teori', html: R`<p>Ein brøk består av ein <b>teljar</b> over brøkstreken og ein <b>nemnar</b> under. Nemnaren seier kor mange like delar heilskapen er delt i. Teljaren seier kor mange av delane vi har.</p>
$$\frac{3}{4} \quad \text{betyr: del i 4 like delar, ta 3 av dei}$$
<p>For å finne ein brøkdel av ei mengd, deler du på nemnaren og gongar med teljaren. Ein brøk kan òg skrivast som desimaltal og prosent: $\frac{3}{4} = 3 : 4 = 0,75 = 75~\%$.</p>` },
        { type: 'utforsk', tittel: 'Brøkjordet', intro: 'Endre teljar og nemnar. Jordet blir delt i like stripar, og du ser brøken som desimaltal, prosent og dekar.', lag: brokjorde },
        { type: 'eksempel', nr: '1.1', tittel: 'Gras og korn', oppgave: 'Ein gard på Farstad har 180 dekar dyrka mark. $\\frac{2}{3}$ av arealet er gras, og resten er korn. Kor mange dekar er korn?', steg: [R`Gras: $180 : 3 * 2 = 60 * 2 = 120$ dekar.`, R`Korn er resten: $180 - 120 = 60$ dekar.`, R`Kontroll: korn er $\frac{1}{3}$ av arealet, og $180 : 3 = 60$. Det stemmer.`], svar: '60 dekar er korn.' },
      ] },
      { id: 'standardform', tittel: 'Potensar og standardform', blokker: [
        { type: 'teori', html: R`<p>Ein <b>potens</b> er ein kort måte å skrive gjentatt multiplikasjon på: $2^5 = 2*2*2*2*2 = 32$. Talet nede er <i>grunntalet</i>, og talet oppe er <i>eksponenten</i>.</p>
<p>Tierpotensar gjer det lett å skrive veldig store og veldig små tal:</p>
$$10^3 = 1000 \qquad 10^0 = 1 \qquad 10^{-3} = \frac{1}{1000} = 0,001$$
<p>Eit tal er skrive på <b>standardform</b> når det står som $a * 10^n$, der $a$ er minst 1 og mindre enn 10. Avstanden til månen er $384~000~000~\text{m} = 3,84*10^8~\text{m}$.</p>` },
        { type: 'utforsk', tittel: 'Frå bakterie til jordklode', intro: 'Dra i glidaren. Kvar gong eksponenten aukar med 1, blir lengda ti gonger større.', lag: tierskala },
        { type: 'utforsk', tittel: 'Komma-hopparen', intro: 'Skriv eit tal og sjå kommaet hoppe til det står eitt siffer framfor det. Tel hoppa – det er eksponenten.', lag: kommaHoppar },
      ] },
      { id: 'overslag', tittel: 'Overslag og avrunding', blokker: [
        { type: 'teori', html: R`<p>Eit <b>overslag</b> er ei rask utrekning med tal som er runda av slik at dei er lette å rekne med. Du brukar overslag for å kontrollere at svaret på kalkulatoren er rimeleg, eller når du står i butikken utan kalkulator.</p>
<p>Ved multiplikasjon blir overslaget best om du rundar eitt tal opp og det andre ned: $38 * 495 \approx 40 * 500 = 20~000$.</p>
<p><b>Avrunding:</b> Er det neste sifferet 5 eller meir, rundar du opp. Elles rundar du ned. $12,46 \approx 12,5$ og $12,44 \approx 12,4$.</p>` },
        { type: 'eksempel', nr: '1.2', tittel: 'Fôrkjøp', oppgave: 'Ein bonde kjøper 38 sekker kraftfôr til 495 kr per sekk. Gjer eit overslag og samanlikn med nøyaktig svar.', steg: [R`Rund av: $38 \approx 40$ og $495 \approx 500$.`, R`Overslag: $40 * 500 = 20~000$ kr.`, R`Nøyaktig: $38 * 495 = 18~810$ kr. Overslaget ligg litt over fordi begge tala vart runda opp.`], svar: 'Om lag 20 000 kr (nøyaktig 18 810 kr).' },
        { type: 'utforsk', tittel: 'Overslagsspelet', intro: 'Klar for tidspress? Kvar runde viser eit stykke og tre svar. Berre eitt av dei er rimeleg.', lag: overslagsspel },
      ] },
      { id: 'oving', tittel: 'Øving', blokker: [{ type: 'oving', generatorar: G }] },
    ],
  });
})();

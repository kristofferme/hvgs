/* Kapittel 8 – Statistikk */
(function () {
  const { R, el, n, tilf, vel } = MT;

  const snitt = (d) => d.reduce((s, x) => s + x, 0) / d.length;
  const median = (d) => { const s = d.slice().sort((a, b) => a - b), m = s.length >> 1; return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2; };
  const typetal = (d) => { const f = {}; d.forEach((x) => (f[x] = (f[x] || 0) + 1)); const mx = Math.max(...Object.values(f)); return Object.keys(f).filter((k) => f[k] === mx).map(Number).sort((a, b) => a - b); };

  /* --- Prikkplott med vippe for gjennomsnittet --- */
  function prikkplott(vert) {
    let data = [3, 4, 4, 5, 5, 5, 6, 6, 7, 9, 2, 5];
    const flate = el('div', { class: 'prikk' });
    const stat = el('div', { class: 'tal-rad' });
    vert.append(el('p', { class: 'svak liten' }, 'Klikk i ei kolonne for å leggje til ein elev. Klikk på ein prikk for å fjerne han.'), flate, stat,
      el('div', { class: 'rad' }, el('button', { class: 'knapp sekundar', onclick: () => { data = Array.from({ length: tilf(8, 18) }, () => Math.min(10, Math.max(0, Math.round(5 + (Math.random() + Math.random() + Math.random() - 1.5) * 4)))); tegn(); } }, 'Tilfeldig fisketur'), el('button', { class: 'knapp sekundar', onclick: () => { data.push(10, 10); tegn(); } }, 'Legg til to «storfiskarar»'), el('button', { class: 'knapp sekundar', onclick: () => { data = []; tegn(); } }, 'Tøm')));
    function tegn() {
      const W = 520, H = 250, x0 = 30, dx = 46, base = 190;
      const m = data.length ? snitt(data) : null, md = data.length ? median(data) : null;
      const tel = {}; let h = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Prikkplott med ${data.length} verdiar">`;
      for (let v = 0; v <= 10; v++) h += `<rect x="${x0 + v * dx - dx / 2}" y="10" width="${dx}" height="${base - 10}" class="kolonne" data-v="${v}"></rect><text x="${x0 + v * dx}" y="${base + 18}" class="aks-tekst" text-anchor="middle">${v}</text>`;
      h += `<line x1="${x0 - dx / 2}" y1="${base}" x2="${x0 + 10 * dx + dx / 2}" y2="${base}" class="bjelke"></line>`;
      data.forEach((v, i) => { tel[v] = (tel[v] || 0) + 1; const y = base - 10 - (tel[v] - 1) * 15; h += `<circle cx="${x0 + v * dx}" cy="${y}" r="6.5" class="prikkp" data-i="${i}" tabindex="0" aria-label="Verdi ${v}, trykk for å fjerne"></circle>`; });
      if (m != null) {
        const mx = x0 + m * dx;
        h += `<path d="M${mx} ${base + 2} l-11 20 h22 z" class="vippe"></path><text x="${mx}" y="${base + 40}" class="aks-tekst sterk" text-anchor="middle">snitt ${n(m, 2)}</text>`;
        h += `<line x1="${x0 + md * dx}" y1="14" x2="${x0 + md * dx}" y2="${base}" class="median-linje"></line><text x="${x0 + md * dx + 4}" y="22" class="aks-tekst median-tekst">median ${n(md, 1)}</text>`;
      }
      flate.innerHTML = h + `<text x="${W - 4}" y="${H - 4}" class="aks-tekst" text-anchor="end">fisk per elev</text></svg>`;
      MT.$$('.kolonne', flate).forEach((k) => k.addEventListener('click', () => { if (data.length < 40) { data.push(+k.dataset.v); tegn(); } }));
      MT.$$('.prikkp', flate).forEach((p) => { const fjern = () => { data.splice(+p.dataset.i, 1); tegn(); }; p.addEventListener('click', fjern); p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') fjern(); }); });
      stat.innerHTML = data.length ? `<div><span class="merkelapp">Tal på elevar</span><b class="mono">${data.length}</b></div><div><span class="merkelapp">Gjennomsnitt</span><b class="mono">${n(m, 2)}</b></div><div><span class="merkelapp">Median</span><b class="mono">${n(md, 1)}</b></div><div><span class="merkelapp">Typetal</span><b class="mono">${typetal(data).join(' og ')}</b></div><div><span class="merkelapp">Variasjonsbreidd</span><b class="mono">${Math.max(...data) - Math.min(...data)}</b></div>` : '<div><span class="merkelapp">Ingen data</span><b>Klikk for å leggje til</b></div>';
    }
    tegn();
  }

  /* --- Diagrambyggjaren --- */
  function diagram(vert) {
    const rader = [['Sau', 1120], ['Storfe', 640], ['Geit', 180], ['Hest', 95], ['Høns', 2400]];
    let typ = 'soyle', lur = false;
    const faner = el('div', { class: 'faner' });
    [['soyle', 'Søylediagram'], ['sektor', 'Sektordiagram'], ['linje', 'Linjediagram']].forEach(([id, t]) => faner.append(el('button', { class: 'fane' + (id === typ ? ' pa' : ''), 'data-id': id, onclick: () => { typ = id; MT.$$('.fane', faner).forEach((b) => b.classList.toggle('pa', b.dataset.id === id)); tegn(); } }, t)));
    const tab = el('div', { class: 'redtab' });
    rader.forEach((r, i) => {
      const a = el('input', { value: r[0], id: 'kat' + i, 'aria-label': 'Kategori ' + (i + 1) }), b = el('input', { value: r[1], id: 'val' + i, class: 'mono', inputmode: 'numeric', 'aria-label': 'Verdi ' + (i + 1) });
      a.oninput = () => { r[0] = a.value; tegn(); }; b.oninput = () => { const v = MT.tolk(b.value); if (!isNaN(v) && v >= 0) { r[1] = v; tegn(); } };
      tab.append(a, b);
    });
    const flate = el('div', { class: 'diagram' });
    const lurbrytar = el('label', { class: 'brytar' }, el('input', { type: 'checkbox', id: 'lur' }), ' Lurediagram: la y-aksen starte nær den minste verdien');
    lurbrytar.firstChild.onchange = (e) => { lur = e.target.checked; tegn(); };
    const forklar = el('p', { class: 'svak liten' });
    vert.append(faner, el('div', { class: 'widget-delt' }, el('div', {}, el('div', { class: 'merkelapp' }, 'Dyr registrerte i kommunen (eksempeldata)'), tab, lurbrytar), el('div', {}, flate, forklar)));
    const FARGAR = ['accent', 'red', 'amber', 'green', 'ink-2'];
    function tegn() {
      lurbrytar.hidden = typ === 'sektor';
      const W = 360, H = 250, sum = rader.reduce((s, r) => s + r[1], 0), maks = Math.max(...rader.map((r) => r[1]), 1), min = Math.min(...rader.map((r) => r[1]));
      let h = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${typ}">`;
      if (typ === 'sektor') {
        let v = -Math.PI / 2; const cx = 120, cy = 125, r = 100;
        rader.forEach((d, i) => { const a = (d[1] / sum) * Math.PI * 2; const x1 = cx + r * Math.cos(v), y1 = cy + r * Math.sin(v), x2 = cx + r * Math.cos(v + a), y2 = cy + r * Math.sin(v + a); h += `<path d="M${cx} ${cy} L${x1} ${y1} A${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${x2} ${y2} Z" style="fill:var(--${FARGAR[i]})" class="sektorbit"></path>`; v += a; h += `<rect x="245" y="${30 + i * 36}" width="12" height="12" style="fill:var(--${FARGAR[i]})"></rect><text x="262" y="${40 + i * 36}" class="aks-tekst sterk">${d[0]}</text><text x="262" y="${54 + i * 36}" class="aks-tekst">${n((d[1] / sum) * 100, 1)} % · ${n((d[1] / sum) * 360, 0)}°</text>`; });
        forklar.innerHTML = MT.mat(R`Kvar sektor er $\frac{\text{verdi}}{\text{sum}} * 360°$. Sum: ${n(sum, 0)}.`);
      } else {
        const y0 = lur ? Math.floor((min * 0.9) / 10) * 10 : 0, top = maks * 1.08, X0 = 48, Y0 = 210, bw = (W - X0 - 10) / rader.length;
        const Y = (v) => Y0 - ((v - y0) / (top - y0)) * (Y0 - 14);
        for (let k = 0; k <= 4; k++) { const v = y0 + ((top - y0) * k) / 4; h += `<line x1="${X0}" x2="${W - 6}" y1="${Y(v)}" y2="${Y(v)}" class="rutelinje"></line><text x="${X0 - 6}" y="${Y(v) + 4}" class="aks-tekst" text-anchor="end">${n(v, 0)}</text>`; }
        if (typ === 'soyle') rader.forEach((d, i) => { h += `<rect x="${X0 + i * bw + bw * 0.18}" y="${Y(d[1])}" width="${bw * 0.64}" height="${Math.max(0, Y0 - Y(d[1]))}" class="soylebit" style="fill:var(--${FARGAR[i]})"></rect>`; });
        else h += `<polyline points="${rader.map((d, i) => `${X0 + i * bw + bw / 2},${Y(d[1])}`).join(' ')}" class="linjebit"></polyline>` + rader.map((d, i) => `<circle cx="${X0 + i * bw + bw / 2}" cy="${Y(d[1])}" r="4" class="linjepunkt"></circle>`).join('');
        rader.forEach((d, i) => { h += `<text x="${X0 + i * bw + bw / 2}" y="${Y0 + 16}" class="aks-tekst" text-anchor="middle">${d[0]}</text>`; });
        h += `<line x1="${X0}" x2="${W - 6}" y1="${Y0}" y2="${Y0}" class="bjelke"></line>`;
        if (lur) h += `<path d="M${X0 - 8} ${Y0 - 10} l8 -4 l8 4 M${X0 - 8} ${Y0 - 4} l8 -4 l8 4" class="brot"></path>`;
        forklar.textContent = typ === 'linje' ? 'Linjediagram passar best når verdiane på x-aksen kjem i ei rekkjefølgje, til dømes år eller månader. For dyreslag er søyle- eller sektordiagram betre.' : lur ? 'Når y-aksen ikkje startar på 0, ser små skilnader store ut. Sjekk alltid aksane!' : 'Søylediagram er godt for å samanlikne storleikar.';
      }
      flate.innerHTML = h + '</svg>';
    }
    tegn();
  }

  const lag = (k, a, b) => Array.from({ length: k }, () => tilf(a, b));
  const visListe = (d) => d.map((x) => n(x, 1)).join(', ');
  const G = [
    () => { const d = lag(tilf(5, 8), 18, 42).map((x) => x / 10); return { tekst: `Fødselsvekta (kg) til nokre lam var: ${visListe(d)}. Kva er gjennomsnittet? Svar med to desimalar.`, svar: snitt(d), eining: 'kg', tol: 0.006, tips: 'Legg saman alle verdiane og del på kor mange verdiar det er.', losning: MT.mat(R`$$\frac{${n(d.reduce((s, x) => s + x, 0), 1)}}{${d.length}} \approx ${n(snitt(d), 3)}~\text{kg}$$`) }; },
    () => { const d = lag(vel([7, 8, 9, 10]), 12, 35); const s = d.slice().sort((a, b) => a - b); return { tekst: `Ein mjølkeprodusent noterte kor mange liter ei ku mjølka kvar dag: ${d.join(', ')}. Kva er medianen?`, svar: median(d), eining: 'L', tips: 'Sorter verdiane frå minst til størst. Medianen er verdien i midten (eller snittet av dei to i midten).', losning: `<p>Sortert: ${s.join(', ')}</p><p>${s.length % 2 ? 'Verdien i midten er' : `Dei to i midten er ${s[s.length / 2 - 1]} og ${s[s.length / 2]}, så medianen er`} <b>${n(median(d), 1)}</b>.</p>` }; },
    () => { const d = lag(tilf(9, 14), 0, 5); const t = typetal(d); if (t.length > 1) d.push(t[0]); return { tekst: `Talet på lam per søye i ein flokk: ${d.join(', ')}. Kva er typetalet?`, svar: typetal(d)[0], tol: 0, tips: 'Typetalet er den verdien som kjem oftast.', losning: `<p>Tel opp: ${[0, 1, 2, 3, 4, 5].map((v) => `${v}: ${d.filter((x) => x === v).length}`).join(' · ')}. Typetalet er <b>${typetal(d)[0]}</b>.</p>` }; },
    () => { const d = lag(tilf(6, 9), -4, 14); return { tekst: `Temperaturen (°C) klokka 07 ei veke i mars: ${d.join(', ')}. Kva er variasjonsbreidda?`, svar: Math.max(...d) - Math.min(...d), eining: '°C', tol: 0, tips: 'Variasjonsbreidd = største verdi − minste verdi.', losning: MT.mat(R`$$${Math.max(...d)} - (${Math.min(...d)}) = ${Math.max(...d) - Math.min(...d)}$$`) }; },
    () => { const tot = vel([20, 25, 40, 50, 80]), f = tilf(2, tot / 2); return { tekst: `I ei undersøking blant ${tot} elevar på naturbruk svarte ${f} at dei vil bli gartnar. Kva er den relative frekvensen i prosent?`, svar: (f / tot) * 100, eining: '%', tips: 'Relativ frekvens = frekvens delt på totalen. Gong med 100 for prosent.', losning: MT.mat(R`$$\frac{${f}}{${tot}} = ${n(f / tot, 3)} = ${n((f / tot) * 100, 1)}~\%$$`) }; },
    () => { const d = lag(4, 50, 90), mal = tilf(65, 80); const mangl = mal * 5 - d.reduce((s, x) => s + x, 0); if (mangl < 0 || mangl > 100) return G[0](); return { tekst: `Ein elev har fått ${d.join(', ')} poeng på fire prøver. Kor mange poeng må eleven få på den femte prøva for at snittet skal bli ${mal}?`, svar: mangl, eining: 'poeng', tips: `Om snittet skal vere ${mal} på 5 prøver, må summen vere ${mal} · 5.`, losning: MT.mat(R`$$${mal} * 5 = ${mal * 5} \qquad ${mal * 5} - ${d.reduce((s, x) => s + x, 0)} = ${mangl}$$`) }; },
  ];

  MT.nyttKapittel({
    id: 'statistikk', nr: 8, tittel: 'Statistikk', kort: 'Sentralmål, spreiing, frekvens og diagram.',
    glyf: '<path d="M5 27h22"/><rect x="7" y="16" width="4" height="11"/><rect x="14" y="9" width="4" height="18"/><rect x="21" y="13" width="4" height="14"/>',
    maal: ['Rekne ut og tolke gjennomsnitt, median og typetal', 'Finne variasjonsbreidd', 'Lage frekvenstabellar og rekne relativ frekvens', 'Lage og vurdere søyle-, sektor- og linjediagram'],
    formlar: [['Gjennomsnitt', R`$\bar{x} = \frac{\text{sum av verdiar}}{\text{tal på verdiar}}$`], ['Relativ frekvens', R`$\frac{\text{frekvens}}{\text{totalt}}$`], ['Variasjonsbreidd', R`$\text{største} - \text{minste}$`], ['Sektorvinkel', R`$\frac{\text{verdi}}{\text{sum}} * 360°$`]],
    seksjonar: [
      { id: 'sentralmal', tittel: 'Sentralmål og spreiing', blokker: [
        { type: 'teori', html: R`<p>Når vi har mange tal, ønskjer vi éin verdi som seier noko om kva som er «typisk». Det kallar vi eit <b>sentralmål</b>:</p>
<ul><li><b>Gjennomsnitt</b>: summen av alle verdiane delt på kor mange det er.</li><li><b>Median</b>: verdien i midten når verdiane er sorterte. Er det eit partal verdiar, tek du snittet av dei to i midten.</li><li><b>Typetal</b>: verdien som kjem oftast.</li></ul>
<p><b>Variasjonsbreidda</b> er skilnaden mellom største og minste verdi. Ho seier noko om kor spreidde dataa er.</p>
<p class="merk">Gjennomsnittet blir dratt mykje av ekstreme verdiar. Medianen er meir robust. Prøv knappen «storfiskarar» under.</p>` },
        { type: 'utforsk', tittel: 'Fisketuren', intro: 'Kvar prikk er ein elev, og plasseringa viser kor mange fisk eleven fekk. Trekanten er gjennomsnittet – punktet der bjelken ville balansert.', lag: prikkplott },
        { type: 'eksempel', nr: '8.1', tittel: 'Mjølk per ku', oppgave: 'Ein bonde registrerte mjølkeyting (liter per dag) for sju kyr: 28, 31, 24, 35, 31, 22, 29. Finn gjennomsnitt, median, typetal og variasjonsbreidd.', steg: [R`Sum: $28 + 31 + 24 + 35 + 31 + 22 + 29 = 200$. Snitt: $\frac{200}{7} \approx 28,6$ L.`, R`Sortert: 22, 24, 28, <b>29</b>, 31, 31, 35. Medianen er 29 L.`, R`Typetal: 31 (kjem to gonger).`, R`Variasjonsbreidd: $35 - 22 = 13$ L.`], svar: 'Snitt 28,6 L, median 29 L, typetal 31 L, variasjonsbreidd 13 L.' },
      ] },
      { id: 'frekvens', tittel: 'Frekvens og relativ frekvens', blokker: [
        { type: 'teori', html: R`<p>Ein <b>frekvenstabell</b> viser kor mange gonger kvar verdi førekjem. <b>Relativ frekvens</b> er frekvensen delt på totalen – ofte skriven som prosent.</p>
<div class="tabell-vert"><table class="tabell"><thead><tr><th>Lam per søye</th><th>Frekvens</th><th>Relativ frekvens</th></tr></thead><tbody><tr><td>1</td><td>12</td><td>$\frac{12}{60} = 20~\%$</td></tr><tr><td>2</td><td>36</td><td>$60~\%$</td></tr><tr><td>3</td><td>12</td><td>$20~\%$</td></tr><tr><td><b>Sum</b></td><td><b>60</b></td><td><b>100 %</b></td></tr></tbody></table></div>
<p>Gjennomsnittet frå ein frekvenstabell: $\frac{1*12 + 2*36 + 3*12}{60} = \frac{120}{60} = 2$ lam per søye.</p>` },
      ] },
      { id: 'diagram', tittel: 'Diagram', blokker: [
        { type: 'teori', html: R`<p>Kva diagram du vel, kjem an på kva du vil vise: <b>søylediagram</b> samanliknar storleikar, <b>sektordiagram</b> viser delar av ein heilskap, og <b>linjediagram</b> viser utvikling over tid.</p>` },
        { type: 'utforsk', tittel: 'Diagrambyggjaren', intro: 'Endre tala i tabellen og byt diagramtype. Slå på «lurediagram» og sjå korleis aksen kan villeie.', lag: diagram },
      ] },
      { id: 'oving', tittel: 'Øving', blokker: [{ type: 'oving', generatorar: G }] },
    ],
  });
})();

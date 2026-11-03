/* Kapittel 2 – Einingar og måling */
(function () {
  const { R, el, n, tilf, vel, glidar } = MT;

  const SYSTEM = {
    lengd: { namn: 'Lengd', fak: 10, ein: ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'], vis: (e) => e },
    areal: { namn: 'Areal', fak: 100, ein: ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'], vis: (e) => e + '²' },
    volum: { namn: 'Volum', fak: 1000, ein: ['km', 'hm', 'dam', 'm', 'dm', 'cm', 'mm'], vis: (e) => e + '³' },
    liter: { namn: 'Liter', fak: 10, ein: ['kL', 'hL', 'daL', 'L', 'dL', 'cL', 'mL'], vis: (e) => e },
    masse: { namn: 'Masse', fak: 10, ein: ['kg', 'hg', 'dag', 'g', 'dg', 'cg', 'mg'], vis: (e) => e },
  };

  /* --- Einingstrappa --- */
  function trapp(vert) {
    let sys = 'lengd', fra = 3, til = 5, verdi = 2.5;
    const fane = el('div', { class: 'faner', role: 'tablist' });
    Object.entries(SYSTEM).forEach(([k, s]) => fane.append(el('button', { class: 'fane' + (k === sys ? ' pa' : ''), role: 'tab', 'data-k': k, onclick: (e) => { sys = k; MT.$$('.fane', fane).forEach((b) => b.classList.toggle('pa', b.dataset.k === k)); tegn(); } }, s.namn)));
    const scene = el('div', { class: 'trapp' });
    const inn = el('input', { id: 'trapp-verdi', class: 'mono', value: '2,5', inputmode: 'decimal', 'aria-label': 'Verdi' });
    const res = el('div', { class: 'trapp-res', 'aria-live': 'polite' });
    inn.addEventListener('input', () => { const v = MT.tolk(inn.value); if (!isNaN(v)) { verdi = v; tegn(); } });
    const hjelp = el('p', { class: 'svak liten' }, 'Trykk «frå» og «til» under trinna for å velje einingar.');
    function tegn() {
      const S = SYSTEM[sys];
      scene.innerHTML = '';
      S.ein.forEach((e, i) => {
        const trinn = el('div', { class: 'trinn' + (i === fra ? ' fra' : '') + (i === til ? ' til' : '') + ((i > Math.min(fra, til) && i <= Math.max(fra, til)) ? ' gar' : ''), style: `--i:${i}` });
        trinn.append(el('div', { class: 'trinn-ein mono' }, S.vis(e)));
        trinn.append(el('div', { class: 'trinn-knappar' }, el('button', { class: 'mini', onclick: () => { fra = i; tegn(); }, 'aria-label': 'Frå ' + S.vis(e) }, 'frå'), el('button', { class: 'mini', onclick: () => { til = i; tegn(); }, 'aria-label': 'Til ' + S.vis(e) }, 'til')));
        scene.append(trinn);
      });
      const steg = til - fra; const faktor = Math.pow(S.fak, Math.abs(steg));
      const ut = steg >= 0 ? verdi * faktor : verdi / faktor;
      const ord = steg === 0 ? 'Same eining – ingenting endrar seg.' : `${Math.abs(steg)} trinn ${steg > 0 ? 'ned' : 'opp'} i trappa. Kvart trinn er ×${S.fak} ${steg > 0 ? '' : '(baklengs: :' + S.fak + ')'}.`;
      res.innerHTML = MT.mat(`<div class="trapp-svar"><span class="mono">${n(verdi, 6)} ${S.vis(S.ein[fra])}</span> <span class="pil">=</span> <b class="mono">${n(ut, 8)} ${S.vis(S.ein[til])}</b></div><p>${ord} ${steg !== 0 ? R`Vi ${steg > 0 ? 'gongar' : 'deler'} med $${S.fak}^{${Math.abs(steg)}} = ${n(faktor, 0)}$.` : ''}</p>`);
    }
    vert.append(fane, el('div', { class: 'rad' }, el('label', { for: 'trapp-verdi', class: 'svak' }, 'Verdi:'), inn), scene, res, hjelp);
    tegn();
  }

  /* --- Dekar-visualisering: dra hjørnet på eit rektangulært jorde --- */
  function dekar(vert) {
    const g = new MT.Graf(vert, { xmin: 0, xmax: 120, ymin: 0, ymax: 80, hogd: 340, xsteg: 10, ysteg: 10, xnamn: 'meter', ynamn: 'meter', aria: 'Rektangel du kan dra i' });
    const info = el('div', { class: 'tal-rad' });
    vert.append(info);
    const h = { x: 40, y: 25, snap: 1, vedFlytt: () => oppdater() };
    g.handtak = [h];
    const ref = el('label', { class: 'brytar' }, el('input', { type: 'checkbox', id: 'vis-fotball' }), ' Vis ein fotballbane (105 × 68 m) til samanlikning');
    vert.append(ref);
    ref.firstChild.addEventListener('change', () => g.teikn());
    g.lag = (g) => {
      const F = g.F, a = MT.farge('accent');
      if (ref.firstChild.checked) { g.mangekant([[0, 0], [105, 0], [105, 68], [0, 68]], MT.alfa(MT.farge('green'), 0.12), MT.farge('green')); g.tekst('Fotballbane ≈ 7,1 daa', 104, 65, MT.farge('green'), 'right'); }
      g.mangekant([[0, 0], [h.x, 0], [h.x, h.y], [0, h.y]], MT.alfa(a, 0.18), a);
      // rutar på 10 × 10 m = 100 m²
      g.tekst(`${n(h.x, 0)} m`, h.x / 2, -0 + 3, F.blekk, 'center');
      g.tekst(`${n(h.y, 0)} m`, h.x + 2, h.y / 2, F.blekk, 'left');
    };
    function oppdater() {
      const A = h.x * h.y;
      info.innerHTML = MT.mat(`<div><span class="merkelapp">Areal</span><b class="mono">${n(A, 0)} m²</b></div><div><span class="merkelapp">I dekar</span><b class="mono">${n(A / 1000, 2)} daa</b></div><div><span class="merkelapp">I hektar</span><b class="mono">${n(A / 10000, 3)} ha</b></div><div><span class="merkelapp">Gjerde rundt</span><b class="mono">${n(2 * (h.x + h.y), 0)} m</b></div>`);
      g.teikn();
    }
    oppdater();
  }

  /* --- Tid: desimaltimar ↔ timar og minutt --- */
  function tidshjul(vert) {
    const svg = el('div', { class: 'klokke' });
    const tekst = el('div', { class: 'klokke-tekst' });
    const k = el('div', { class: 'kontrollar' });
    const sett = (t) => {
      const timar = Math.floor(t), min = Math.round((t - timar) * 60);
      const v = (t - timar) * 360;
      const r = 80, x = 100 + r * Math.sin((v * Math.PI) / 180), y = 100 - r * Math.cos((v * Math.PI) / 180);
      svg.innerHTML = `<svg viewBox="0 0 200 200" role="img" aria-label="Klokke som viser ${min} minutt"><circle cx="100" cy="100" r="88" class="urskive"></circle>${Array.from({ length: 12 }, (_, i) => `<line x1="100" y1="16" x2="100" y2="${i % 3 ? 24 : 30}" transform="rotate(${i * 30} 100 100)" class="strek"></line>`).join('')}<path d="M100 100 L100 20 A80 80 0 ${v > 180 ? 1 : 0} 1 ${x} ${y} Z" class="sektor"></path><line x1="100" y1="100" x2="${x}" y2="${y}" class="visar"></line><circle cx="100" cy="100" r="4" class="nav"></circle></svg>`;
      tekst.innerHTML = MT.mat(`<div class="stort-tal mono">${n(t, 2)} t</div><div class="mono">= ${timar} t ${min} min</div><p>Desimaldelen er $${n(t - timar, 2)}$ av ein time: $${n(t - timar, 2)} * 60 = ${min}$ minutt.</p>`);
    };
    glidar(k, { namn: 'Tid', min: 0, max: 5, steg: 0.05, verdi: 1.25, eining: 't', vedEndring: sett });
    vert.append(el('div', { class: 'widget-delt' }, svg, el('div', {}, k, tekst)));
    sett(1.25);
  }

  const G = [
    () => { const ein = ['km', 'm', 'dm', 'cm', 'mm'], i = tilf(0, 3), j = tilf(i + 1, 4), fakt = { km: 3, m: 0, dm: -1, cm: -2, mm: -3 }; const v = vel([1.2, 0.45, 3.75, 12, 0.08, 250, 6.5]); const ned = vel([true, false]); const [a, b] = ned ? [ein[i], ein[j]] : [ein[j], ein[i]]; const svar = v * Math.pow(10, fakt[a] - fakt[b]); return { tekst: R`Gjer om: $${n(v, 3)}~\text{${a}} =~?~\text{${b}}$`, svar, eining: b, tol: Math.abs(svar) * 1e-6 + 1e-9, tips: 'Kvart trinn i lengdetrappa er ein faktor 10. Mellom km og m er det 3 trinn.', losning: MT.mat(R`$$${n(v, 3)}~\text{${a}} = ${n(svar, 6)}~\text{${b}}$$ Vi ${fakt[a] > fakt[b] ? 'gongar' : 'deler'} med $10^{${Math.abs(fakt[a] - fakt[b])}}$.`) }; },
    () => { const v = vel([1.5, 2.4, 0.8, 12, 35, 4.2]); const t = vel(['daa→m²', 'm²→daa', 'ha→daa', 'daa→ha']); const tab = { 'daa→m²': [1000, 'daa', 'm²'], 'm²→daa': [1 / 1000, 'm²', 'daa'], 'ha→daa': [10, 'ha', 'daa'], 'daa→ha': [0.1, 'daa', 'ha'] }[t]; const vv = t === 'm²→daa' ? v * 1000 : v; return { tekst: `Gjer om: ${n(vv, 3)} ${tab[1]} = ? ${tab[2]}`, svar: vv * tab[0], eining: tab[2], tips: '1 dekar = 1000 m². 1 hektar = 10 dekar = 10 000 m².', losning: `<p>${n(vv, 3)} ${tab[1]} = <b>${n(vv * tab[0], 4)} ${tab[2]}</b></p>` }; },
    () => { const l = tilf(4, 30) * 10, b = tilf(3, 20) * 10; return { tekst: `Eit rektangulært beite er ${l} m langt og ${b} m breitt. Kor mange dekar er beitet?`, svar: (l * b) / 1000, eining: 'daa', tips: 'Rekn arealet i m² først, og del så på 1000.', losning: MT.mat(R`$$A = ${l} * ${b} = ${n(l * b, 0)}~\text{m}^2 = ${n((l * b) / 1000, 2)}~\text{daa}$$`) }; },
    () => { const v = vel([2.5, 0.75, 1.2, 0.4, 3.6]); const ty = vel([['m³', 'L', 1000], ['dm³', 'L', 1], ['L', 'dL', 10], ['L', 'mL', 1000], ['cm³', 'mL', 1]]); return { tekst: `Gjer om: ${n(v, 3)} ${ty[0]} = ? ${ty[1]}`, svar: v * ty[2], eining: ty[1], tips: '1 L = 1 dm³. 1 m³ = 1000 L. 1 mL = 1 cm³.', losning: `<p>${n(v, 3)} ${ty[0]} · ${n(ty[2], 0)} = <b>${n(v * ty[2], 3)} ${ty[1]}</b></p>` }; },
    () => { const t = vel([1.25, 2.5, 0.75, 3.2, 1.4, 4.6]); return { tekst: R`Ein maskin går i $${n(t, 2)}$ timar. Kor mange <b>minutt</b> er det til saman?`, svar: t * 60, eining: 'min', tips: 'Ein time er 60 minutt. Gong talet på timar med 60.', losning: MT.mat(R`$$${n(t, 2)} * 60 = ${n(t * 60, 0)}~\text{min} = ${Math.floor(t)}~\text{t}~${Math.round((t % 1) * 60)}~\text{min}$$`) }; },
    () => { const m = tilf(15, 45), km = vel([12, 18, 24, 30, 45]); return { tekst: `Ein traktor køyrer ${km} km på ${m} minutt. Kva er farten i km/t?`, svar: km / (m / 60), eining: 'km/t', tips: 'Gjer om minutta til timar (del på 60), og del strekninga på tida.', losning: MT.mat(R`$$v = \frac{${km}~\text{km}}{${m}/60~\text{t}} = ${n(km / (m / 60), 2)}~\text{km/t}$$`) }; },
  ];

  MT.nyttKapittel({
    id: 'einingar', nr: 2, tittel: 'Einingar og måling', kort: 'Lengd, areal, volum, liter, masse, dekar og tid.',
    glyf: '<path d="M4 22h24M4 22v-6M10 22v-3M16 22v-6M22 22v-3M28 22v-6"/><path d="M6 10h20" stroke-dasharray="2 3"/>',
    maal: ['Gjere om mellom einingar for lengd, areal, volum, masse og tid', 'Rekne med dekar og hektar', 'Vurdere kva eining som passar i ein naturbrukssituasjon'],
    formlar: [['Lengd', R`$1~\text{km} = 1000~\text{m}$`], ['Areal', R`$1~\text{m}^2 = 100~\text{dm}^2$`], ['Dekar og hektar', R`$1~\text{daa} = 1000~\text{m}^2,~1~\text{ha} = 10~\text{daa}$`], ['Volum og liter', R`$1~\text{dm}^3 = 1~\text{L},~1~\text{m}^3 = 1000~\text{L}$`], ['Fart', R`$v = \frac{s}{t}$`]],
    seksjonar: [
      { id: 'prefiks', tittel: 'Einingstrappa', blokker: [
        { type: 'teori', html: R`<p>Einingane i det metriske systemet heng saman med tierpotensar. Førestavingane fortel kor stor eininga er:</p>
<div class="tabell-vert"><table class="tabell"><thead><tr><th>Førestaving</th><th>kilo</th><th>hekto</th><th>deka</th><th>–</th><th>desi</th><th>centi</th><th>milli</th></tr></thead><tbody><tr><td>Faktor</td><td>1000</td><td>100</td><td>10</td><td>1</td><td>0,1</td><td>0,01</td><td>0,001</td></tr><tr><td>Lengd</td><td>km</td><td>hm</td><td>dam</td><td>m</td><td>dm</td><td>cm</td><td>mm</td></tr></tbody></table></div>
<p>Går du <b>ned</b> eit trinn i trappa, gongar du. Går du <b>opp</b>, deler du. Kor stor faktoren er, kjem an på kva du måler:</p>
<ul><li><b>Lengd</b>: 10 per trinn</li><li><b>Areal</b>: $10^2 = 100$ per trinn, fordi både lengda og breidda blir gonga med 10</li><li><b>Volum</b>: $10^3 = 1000$ per trinn</li></ul>` },
        { type: 'utforsk', tittel: 'Einingstrappa', intro: 'Vel kva du måler, og trykk «frå» og «til» på trinna. Trappa viser kor mange trinn du går, og kva du må gonge eller dele med.', lag: trapp },
      ] },
      { id: 'dekar', tittel: 'Areal på garden: dekar og hektar', blokker: [
        { type: 'teori', html: R`<p>I landbruket blir areal oftast målt i <b>dekar</b> (daa). Eitt dekar er 1000 m², til dømes eit felt på 40 m × 25 m. Større areal blir målt i <b>hektar</b> (ha).</p>
$$1~\text{daa} = 1000~\text{m}^2 \qquad 1~\text{ha} = 10~\text{daa} = 10~000~\text{m}^2$$
<p>Gjødsel, såkorn og avling blir ofte oppgitt <i>per dekar</i>: 50 kg gjødsel per dekar på 12 dekar gir $50 * 12 = 600$ kg.</p>` },
        { type: 'utforsk', tittel: 'Kor stort er eit dekar?', intro: 'Dra i hjørnet av jordet. Kvar rute er 10 m × 10 m = 100 m², så ti ruter er eitt dekar.', lag: dekar },
        { type: 'eksempel', nr: '2.1', tittel: 'Gjødsling', oppgave: 'Eit jorde er 160 m langt og 75 m breitt. Bonden skal spreie 45 kg gjødsel per dekar. Kor mykje gjødsel treng ho?', steg: [R`Areal: $160 * 75 = 12~000~\text{m}^2$.`, R`I dekar: $12~000 : 1000 = 12~\text{daa}$.`, R`Gjødsel: $45 * 12 = 540~\text{kg}$.`], svar: 'Ho treng 540 kg gjødsel.' },
      ] },
      { id: 'volum-liter', tittel: 'Volum, liter og masse', blokker: [
        { type: 'teori', html: R`<p>Ein liter er det same som ein kubikkdesimeter: ein terning som er 10 cm på kvar led. Derfor er</p>
$$1~\text{L} = 1~\text{dm}^3 \qquad 1~\text{m}^3 = 1000~\text{L} \qquad 1~\text{mL} = 1~\text{cm}^3$$
<p>Ein liter vatn veg om lag 1 kg. Ein tank på 2 m³ med vatn veg altså om lag 2000 kg, eller 2 tonn.</p>` },
        { type: 'eksempel', nr: '2.2', tittel: 'Vasstrau i fjøset', oppgave: 'Eit vasstrau er 1,2 m langt, 40 cm breitt og 30 cm djupt. Kor mange liter rommar det?', steg: [R`Gjer alt om til dm, sidan $1~\text{dm}^3 = 1~\text{L}$: 12 dm, 4 dm og 3 dm.`, R`$V = 12 * 4 * 3 = 144~\text{dm}^3$.`, R`$144~\text{dm}^3 = 144~\text{L}$.`], svar: 'Trauet rommar 144 liter.' },
      ] },
      { id: 'tid', tittel: 'Tid og fart', blokker: [
        { type: 'teori', html: R`<p>Tid blir ikkje målt i tiarsystemet: ein time har 60 minutt. Kalkulatoren gir ofte tid som desimaltal, og då må du gjere om:</p>
$$1,25~\text{t} = 1~\text{t} + 0,25 * 60~\text{min} = 1~\text{t}~15~\text{min}$$
<p>Fart er strekning delt på tid: $v = \frac{s}{t}$. Ein traktor som køyrer 18 km på 45 minutt, har farten $18 : 0,75 = 24$ km/t.</p>` },
        { type: 'utforsk', tittel: 'Desimalklokka', intro: 'Dra i glidaren og sjå korleis desimaldelen av ein time blir til minutt.', lag: tidshjul },
      ] },
      { id: 'oving', tittel: 'Øving', blokker: [{ type: 'oving', generatorar: G }] },
    ],
  });
})();

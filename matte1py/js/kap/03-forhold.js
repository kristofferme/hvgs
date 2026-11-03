/* Kapittel 3 – Forhold, målestokk og blanding */
(function () {
  const { R, el, n, tilf, vel, glidar } = MT;

  /* --- Blandingstanken --- */
  function tank(vert) {
    const svg = el('div', { class: 'tank' });
    const info = el('div', { class: 'tal-rad' });
    const k = el('div', { class: 'kontrollar' });
    let V = 200, x = 250;
    const tegn = () => {
      const kons = V / (x + 1), vatn = V - kons;
      const fyll = Math.min(1, V / 600), hTot = 220 * fyll, hK = Math.max(4, hTot / (x + 1));
      svg.innerHTML = `<svg viewBox="0 0 220 280" role="img" aria-label="Tank med ${n(V, 0)} liter blanding">
        <defs><clipPath id="tank-klipp"><rect x="30" y="30" width="160" height="230" rx="14"></rect></clipPath></defs>
        <g clip-path="url(#tank-klipp)"><rect x="30" y="${260 - hTot}" width="160" height="${hTot}" class="vatn"></rect>
        <rect x="30" y="${260 - hTot}" width="160" height="${hK}" class="kons"></rect>
        <path d="M30 ${260 - hTot} q20 -6 40 0 t40 0 t40 0 t40 0" class="bolge"></path></g>
        <rect x="30" y="30" width="160" height="230" rx="14" class="tankkant"></rect>
        ${[100, 200, 300, 400, 500, 600].map((l) => `<line x1="190" x2="200" y1="${260 - (220 * l) / 600}" y2="${260 - (220 * l) / 600}" class="strek"></line><text x="204" y="${264 - (220 * l) / 600}" class="aks-tekst">${l}</text>`).join('')}
        <rect x="95" y="16" width="30" height="16" rx="3" class="tankkant"></rect></svg>`;
      info.innerHTML = MT.mat(`<div><span class="merkelapp">Konsentrat</span><b class="mono">${kons >= 1 ? n(kons, 2) + ' L' : n(kons * 1000, 0) + ' mL'}</b></div><div><span class="merkelapp">Vatn</span><b class="mono">${n(vatn, 1)} L</b></div><div><span class="merkelapp">Delar i alt</span><b class="mono">1 + ${x} = ${x + 1}</b></div><div><span class="merkelapp">Del konsentrat</span><b class="mono">${n(100 / (x + 1), 2)} %</b></div>`);
    };
    glidar(k, { namn: 'Mengd i tanken', min: 10, max: 600, steg: 10, verdi: V, eining: 'L', vedEndring: (v) => { V = v; tegn(); } });
    glidar(k, { namn: 'Forhold 1 : x', min: 5, max: 500, steg: 5, verdi: x, fmt: (v) => '1 : ' + v, vedEndring: (v) => { x = v; tegn(); } });
    vert.append(el('div', { class: 'widget-delt' }, svg, el('div', {}, k, info, el('p', { class: 'svak liten', html: R`Utrekning: konsentrat $= \frac{\text{total}}{1 + x}$. Laget med konsentrat er teikna tjukkare enn det er, slik at du ser det.` }))));
    tegn();
  }

  /* --- Kartlinjalen --- */
  const KYST = 'M0 40 C40 60 70 30 110 52 S170 90 200 70 S260 30 300 58 S360 100 400 80 L400 0 L0 0 Z';
  function kart(vert) {
    const W = 400, H = 260, PER_CM = 20; // 20 einingar = 1 cm på «kartet»
    let mal = 50000; const pinnar = [{ x: 90, y: 170 }, { x: 300, y: 120 }];
    const vel_ = el('div', { class: 'faner' });
    [10000, 25000, 50000, 100000].forEach((m) => vel_.append(el('button', { class: 'fane' + (m === mal ? ' pa' : ''), 'data-m': m, onclick: () => { mal = m; MT.$$('.fane', vel_).forEach((b) => b.classList.toggle('pa', +b.dataset.m === m)); tegn(); } }, '1 : ' + n(m, 0))));
    const flate = el('div', { class: 'kart' });
    const info = el('div', { class: 'tal-rad' });
    vert.append(vel_, flate, info);
    function tegn() {
      const [a, b] = pinnar; const d = Math.hypot(b.x - a.x, b.y - a.y) / PER_CM; const verk = (d * mal) / 100;
      flate.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Kart med to nålar du kan dra">
        <rect width="${W}" height="${H}" class="hav"></rect>
        <path d="${KYST}" class="land"></path>
        <path d="M60 200 q30 -25 60 -4 q20 18 -10 30 q-40 10 -50 -26z" class="land"></path>
        <path d="M250 150 q30 -30 70 -10 q30 20 0 40 q-50 20 -70 -30z" class="land"></path>
        <path d="M170 210 q12 -10 24 0 q6 10 -10 14 q-16 2 -14 -14z" class="land"></path>
        ${Array.from({ length: 21 }, (_, i) => `<line x1="${i * 20}" y1="0" x2="${i * 20}" y2="${H}" class="kartrute"></line>`).join('')}
        <line x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}" class="maalelinje"></line>
        ${pinnar.map((p, i) => `<g class="pinne" data-i="${i}" tabindex="0" role="slider" aria-label="Nål ${i + 1}" transform="translate(${p.x} ${p.y})"><circle r="16" class="treff"></circle><circle r="7"></circle><text y="-12" text-anchor="middle">${'AB'[i]}</text></g>`).join('')}
        <g transform="translate(16 ${H - 20})"><rect width="${PER_CM * 2}" height="5" class="malestokk"></rect><rect x="${PER_CM * 2}" width="${PER_CM * 2}" height="5" class="malestokk lys"></rect><text y="-5" class="aks-tekst">0</text><text x="${PER_CM * 4}" y="-5" class="aks-tekst" text-anchor="middle">${n((4 * mal) / 100000, 2)} km</text></g>
      </svg>`;
      info.innerHTML = MT.mat(`<div><span class="merkelapp">På kartet</span><b class="mono">${n(d, 1)} cm</b></div><div><span class="merkelapp">I røynda</span><b class="mono">${verk >= 1000 ? n(verk / 1000, 2) + ' km' : n(verk, 0) + ' m'}</b></div><div class="brei"><span class="merkelapp">Utrekning</span>$${n(d, 1)}~\text{cm} * ${n(mal, 0)} = ${n(d * mal, 0)}~\text{cm} = ${n(verk / 1000, 3)}~\text{km}$</div>`);
      MT.$$('.pinne', flate).forEach((g) => {
        const i = +g.dataset.i;
        g.addEventListener('pointerdown', (e) => { g.setPointerCapture(e.pointerId); g.classList.add('drar'); });
        g.addEventListener('pointermove', (e) => {
          if (!g.hasPointerCapture(e.pointerId)) return;
          const r = flate.firstChild.getBoundingClientRect();
          pinnar[i].x = Math.max(8, Math.min(W - 8, ((e.clientX - r.left) / r.width) * W));
          pinnar[i].y = Math.max(8, Math.min(H - 8, ((e.clientY - r.top) / r.height) * H));
          const [a, b] = pinnar; const d = Math.hypot(b.x - a.x, b.y - a.y) / PER_CM;
          g.setAttribute('transform', `translate(${pinnar[i].x} ${pinnar[i].y})`);
          const l = MT.$('.maalelinje', flate); l.setAttribute('x1', a.x); l.setAttribute('y1', a.y); l.setAttribute('x2', b.x); l.setAttribute('y2', b.y);
          const verk = (d * mal) / 100;
          MT.$$('.tal-rad b', info)[0].textContent = n(d, 1) + ' cm';
          MT.$$('.tal-rad b', info)[1].textContent = verk >= 1000 ? n(verk / 1000, 2) + ' km' : n(verk, 0) + ' m';
        });
        g.addEventListener('pointerup', () => tegn());
        g.addEventListener('keydown', (e) => { const d = { ArrowLeft: [-4, 0], ArrowRight: [4, 0], ArrowUp: [0, -4], ArrowDown: [0, 4] }[e.key]; if (d) { e.preventDefault(); pinnar[i].x += d[0]; pinnar[i].y += d[1]; tegn(); MT.$(`.pinne[data-i="${i}"]`, flate).focus(); } });
      });
    }
    info.classList.add('tal-rad');
    tegn();
  }

  /* --- Dele i forhold: perlesnor --- */
  function perler(vert) {
    const scene = el('div', { class: 'perler' });
    const k = el('div', { class: 'kontrollar' });
    const res = el('div', {});
    let a = 2, b = 3, tot = 400;
    const tegn = () => {
      const del = tot / (a + b);
      scene.innerHTML = Array.from({ length: a + b }, (_, i) => `<span class="perle ${i < a ? 'a' : 'b'}" style="--d:${i * 30}ms">${n(del, 1)}</span>`).join('');
      res.innerHTML = MT.mat(R`<p>Del ${n(tot, 0)} kg fôr i forholdet $${a}:${b}$. Det er $${a} + ${b} = ${a + b}$ delar, og kvar del er $${n(tot, 0)} : ${a + b} = ${n(del, 2)}$ kg.</p><p><b class="farge-a">Kvige-gruppa:</b> $${a} * ${n(del, 2)} = ${n(a * del, 2)}$ kg &nbsp; <b class="farge-b">Ku-gruppa:</b> $${b} * ${n(del, 2)} = ${n(b * del, 2)}$ kg</p>`);
    };
    glidar(k, { namn: 'Første tal', min: 1, max: 8, verdi: a, vedEndring: (v) => { a = v; tegn(); } });
    glidar(k, { namn: 'Andre tal', min: 1, max: 8, verdi: b, vedEndring: (v) => { b = v; tegn(); } });
    glidar(k, { namn: 'Fôr i alt', min: 50, max: 1000, steg: 50, verdi: tot, eining: 'kg', vedEndring: (v) => { tot = v; tegn(); } });
    vert.append(k, scene, res); tegn();
  }

  const G = [
    () => { const m = vel([10000, 25000, 50000, 100000]), cm = tilf(2, 18) / (m >= 50000 ? 2 : 1); return { tekst: `På eit kart i målestokk 1 : ${n(m, 0)} er avstanden mellom to fjellvatn ${n(cm, 1)} cm. Kor mange km er det i røynda?`, svar: (cm * m) / 100000, eining: 'km', tips: 'Gong kartavstanden med målestokktalet. Då får du svaret i cm. 1 km = 100 000 cm.', losning: MT.mat(R`$$${n(cm, 1)} * ${n(m, 0)} = ${n(cm * m, 0)}~\text{cm} = ${n((cm * m) / 100000, 3)}~\text{km}$$`) }; },
    () => { const m = vel([10000, 20000, 50000]), km = tilf(1, 12) / 2; return { tekst: `Ein sti er ${n(km, 1)} km lang. Kor mange cm blir han på eit kart i målestokk 1 : ${n(m, 0)}?`, svar: (km * 100000) / m, eining: 'cm', tips: 'Gjer om km til cm (gong med 100 000), og del på målestokktalet.', losning: MT.mat(R`$$\frac{${n(km * 100000, 0)}~\text{cm}}{${n(m, 0)}} = ${n((km * 100000) / m, 2)}~\text{cm}$$`) }; },
    () => { const x = vel([50, 100, 200, 250, 400]), V = vel([100, 200, 300, 400, 500]) ; return { tekst: `Eit plantevernmiddel skal blandast 1 : ${x} med vatn. Kor mange liter konsentrat trengst for å få ${V} liter ferdig blanding?`, svar: V / (x + 1), eining: 'L', tips: R`Forholdet 1 : ${x} gir $1 + ${x} = ${x + 1}$ delar i alt. Del totalmengda på talet på delar.`, losning: MT.mat(R`$$\frac{${V}~\text{L}}{${x + 1}} = ${n(V / (x + 1), 3)}~\text{L}$$`) }; },
    () => { const a = tilf(1, 5), b = tilf(1, 5), t = (a + b) * tilf(10, 60); return { tekst: R`Ein gevinst på ${n(t, 0)} kr frå ein potetsal skal delast mellom to klassar i forholdet $${a} : ${b}$. Kor mykje får klassen med den <b>største</b> delen?`, svar: (Math.max(a, b) * t) / (a + b), eining: 'kr', tips: 'Finn først kor mykje éin del er: totalen delt på summen av tala i forholdet.', losning: MT.mat(R`$$\text{Éin del} = \frac{${t}}{${a + b}} = ${n(t / (a + b), 2)} \qquad ${Math.max(a, b)} * ${n(t / (a + b), 2)} = ${n((Math.max(a, b) * t) / (a + b), 2)}$$`) }; },
    () => { const dose = vel([1, 2, 2.5]), per = vel([10, 20, 25]), kg = tilf(30, 95); return { tekst: `Eit ormemiddel til sau skal doserast med ${n(dose, 1)} mL per ${per} kg kroppsvekt. Kor mange mL skal ein sau på ${kg} kg ha?`, svar: (kg / per) * dose, eining: 'mL', tips: `Kor mange gonger ${per} kg går det i ${kg} kg? Gong det med ${n(dose, 1)} mL.`, losning: MT.mat(R`$$\frac{${kg}}{${per}} * ${n(dose, 1)} = ${n((kg / per) * dose, 2)}~\text{mL}$$`) }; },
    () => { const dyr = tilf(3, 8), kg = tilf(10, 30), ny = tilf(9, 25); return { tekst: `${dyr} kalvar et ${kg * dyr} kg grovfôr per døgn. Kor mykje et ${ny} kalvar, om kvar et like mykje?`, svar: kg * ny, eining: 'kg', tips: 'Finn først kor mykje éin kalv et.', losning: MT.mat(R`$$\frac{${kg * dyr}}{${dyr}} = ${kg}~\text{kg per kalv} \qquad ${kg} * ${ny} = ${kg * ny}~\text{kg}$$`) }; },
  ];

  MT.nyttKapittel({
    id: 'forhold', nr: 3, tittel: 'Forhold, målestokk og blanding', kort: 'Dele i forhold, kart og teikningar, blandingar og dosering.',
    glyf: '<circle cx="9" cy="16" r="4"/><circle cx="23" cy="16" r="4"/><path d="M15 13v.1M15 19v.1"/>',
    maal: ['Forstå og rekne med forhold', 'Bruke målestokk på kart og teikningar', 'Rekne ut blandingsforhold og doseringar'],
    formlar: [['Målestokk', R`$\text{røynd} = \text{kart} * \text{målestokktal}$`], ['Blanding 1 : x', R`$\text{konsentrat} = \frac{\text{total}}{1+x}$`], ['Dele i forhold a : b', R`$\text{éin del} = \frac{\text{total}}{a+b}$`]],
    seksjonar: [
      { id: 'forhold', tittel: 'Forhold og deling', blokker: [
        { type: 'teori', html: R`<p>Eit <b>forhold</b> samanliknar to storleikar. Forholdet mellom 6 sauer og 2 bukkar er $6 : 2$, som kan forkortast til $3 : 1$. Det betyr at det er tre gonger så mange sauer som bukkar.</p>
<p>Når noko skal <b>delast i forholdet</b> $a : b$, deler du det heile i $a + b$ like delar. Den eine får $a$ delar, den andre $b$ delar.</p>` },
        { type: 'utforsk', tittel: 'Perlesnora', intro: 'Ei mengd fôr skal delast mellom to dyregrupper. Kvar perle er éin del.', lag: perler },
      ] },
      { id: 'malestokk', tittel: 'Målestokk', blokker: [
        { type: 'teori', html: R`<p>Målestokken fortel kor mykje mindre eit kart eller ei teikning er enn røynda. På eit kart i målestokk $1 : 50~000$ svarar 1 cm på kartet til $50~000$ cm $= 500$ m i terrenget.</p>
$$\text{avstand i røynda} = \text{avstand på kartet} * \text{målestokktalet}$$
<p>Teikningar av fjøs og maskindelar kan òg vere <i>forstørra</i>, til dømes $5 : 1$. Då er teikninga fem gonger større enn røynda.</p>` },
        { type: 'utforsk', tittel: 'Kartlinjalen', intro: 'Dra nålane A og B over kystkartet, og byt målestokk. Kvar rute er 1 cm på kartet.', lag: kart },
        { type: 'eksempel', nr: '3.1', tittel: 'Tur til fjellvatnet', oppgave: 'På eit turkart i målestokk 1 : 25 000 er stien til vatnet 14,2 cm. Kor lang er stien i røynda?', steg: [R`Gong med målestokktalet: $14,2 * 25~000 = 355~000$ cm.`, R`Gjer om til meter (del på 100): $3550$ m.`, R`Gjer om til km (del på 1000): $3,55$ km.`], svar: 'Stien er om lag 3,6 km.' },
      ] },
      { id: 'blanding', tittel: 'Blandingsforhold og dosering', blokker: [
        { type: 'teori', html: R`<p>Plantevernmiddel, ensileringsmiddel, vaskemiddel og medisin blir ofte blanda med vatn. Eit <b>blandingsforhold</b> på $1 : 250$ betyr her <i>1 del konsentrat til 250 delar vatn</i>. Då er det $251$ delar i alt.</p>
$$\text{konsentrat} = \frac{\text{ferdig blanding}}{1 + 250}$$
<p class="merk">Sjå alltid på etiketten korleis produsenten meiner forholdet skal lesast. Nokre oppgir i staden prosent eller mL per liter.</p>
<p><b>Dosering</b> er mengd per eining, til dømes 2 mL per 10 kg kroppsvekt. Rekn ut kor mange «einingar» dyret har, og gong med dosen.</p>` },
        { type: 'utforsk', tittel: 'Blandingstanken', intro: 'Still inn kor mykje som skal i tanken og kva forhold som gjeld. Sjå kor lite konsentrat som trengst.', lag: tank },
        { type: 'eksempel', nr: '3.2', tittel: 'Sprøyting av potetåker', oppgave: 'Ein sprøytetank skal fyllast med 300 L ferdig blanding. Forholdet er 1 : 200. Kor mykje konsentrat og kor mykje vatn trengst?', steg: [R`Talet på delar: $1 + 200 = 201$.`, R`Konsentrat: $300 : 201 \approx 1,49$ L.`, R`Vatn: $300 - 1,49 = 298,51$ L.`], svar: 'Om lag 1,5 L konsentrat og 298,5 L vatn.' },
      ] },
      { id: 'oving', tittel: 'Øving', blokker: [{ type: 'oving', generatorar: G }] },
    ],
  });
})();

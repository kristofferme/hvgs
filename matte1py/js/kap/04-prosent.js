/* Kapittel 4 – Prosent og vekst */
(function () {
  const { R, el, n, tilf, vel, glidar, utforsk } = MT;

  /* --- Prosentlinja: dobbel talline --- */
  function prosentlinje(vert) {
    const scene = el('div', { class: 'dobbel' });
    const k = el('div', { class: 'kontrollar' });
    let heil = 480, p = 35;
    const tegn = () => {
      const del = (heil * p) / 100;
      const tikk = [0, 25, 50, 75, 100].map((t) => `<span style="left:${t}%">${t} %</span>`).join('');
      const tikk2 = [0, 25, 50, 75, 100].map((t) => `<span style="left:${t}%">${n((heil * t) / 100, 1)}</span>`).join('');
      scene.innerHTML = `<div class="dl-rad topp">${tikk}</div><div class="dl-bar"><div class="dl-fyll" style="width:${Math.min(p, 100)}%"></div><div class="dl-merke" style="left:${Math.min(p, 100)}%"><b>${n(p, 1)} %</b><b>${n(del, 2)}</b></div></div><div class="dl-rad">${tikk2}</div>`;
      res.innerHTML = MT.mat(R`$$${n(p, 1)}~\%~\text{av}~${n(heil, 0)} = ${n(heil, 0)} * ${n(p / 100, 4)} = \hl{${n(del, 2)}}$$`);
    };
    const res = el('div', {});
    glidar(k, { namn: 'Det heile (100 %)', min: 20, max: 2000, steg: 20, verdi: heil, vedEndring: (v) => { heil = v; tegn(); } });
    glidar(k, { namn: 'Prosent', min: 0, max: 100, steg: 0.5, verdi: p, eining: '%', vedEndring: (v) => { p = v; tegn(); } });
    vert.append(k, scene, res); tegn();
  }

  /* --- Vekstmaskina: eksponentiell mot lineær vekst --- */
  function vekstmaskin(vert) {
    const tekst = el('p', { class: 'utforsk-tekst', html: R`Ein hjortebestand på <b data-v="a"></b> dyr endrar seg med <b data-v="p"></b> per år. Vekstfaktoren er <b data-o="k"></b>. Etter <b data-v="t"></b> er bestanden <b data-o="slutt" class="hl"></b> dyr.` });
    vert.append(tekst);
    const g = new MT.Graf(vert, { xmin: 0, xmax: 20, ymin: 0, ymax: 2000, hogd: 300, xnamn: 'år', ynamn: 'dyr', aria: 'Graf over vekst' });
    const forklar = el('label', { class: 'brytar' }, el('input', { type: 'checkbox', id: 'vis-linear', checked: true }), ' Samanlikn med lineær vekst (same tal dyr kvart år som første året)');
    vert.append(forklar);
    let s;
    const teikn = () => {
      const { a, p, t } = s, k = 1 + p / 100;
      const maks = Math.max(a * Math.pow(k, 20), a * 1.2, a + 20 * a * (k - 1), 50);
      g.o.ymax = Math.ceil(maks / 100) * 100; g.o.ymin = 0;
      g.lag = (g) => {
        const A = MT.farge('accent'), Rd = MT.farge('red');
        for (let i = 0; i <= 20; i++) g.soyle(i, 0.6, a * Math.pow(k, i), MT.alfa(A, i <= t ? 0.55 : 0.15));
        if (forklar.firstChild.checked) g.funksjon((x) => a + a * (k - 1) * x, Rd, 2, [6, 5]);
        g.funksjon((x) => a * Math.pow(k, x), A, 2.5);
        g.punkt(t, a * Math.pow(k, t), A, 6, true);
        g.tekst(n(a * Math.pow(k, t), 0), t, a * Math.pow(k, t) + g.o.ymax * 0.05, g.F.blekk, 'center');
      };
      g.teikn();
    };
    s = utforsk(tekst, { a: { v: 400, min: 50, max: 1500, steg: 10, px: 3 }, p: { v: 8, min: -20, max: 25, steg: 0.5, des: 1, fmt: (v) => (v >= 0 ? '+' : '−') + n(Math.abs(v), 1) + ' %' }, t: { v: 10, min: 0, max: 20, steg: 1, px: 10, fmt: (v) => v + (v === 1 ? ' år' : ' år') } }, { k: (s) => n(1 + s.p / 100, 3), slutt: (s) => n(s.a * Math.pow(1 + s.p / 100, s.t), 0) });
    tekst.addEventListener('endra', (e) => { s = e.detail; teikn(); });
    forklar.firstChild.addEventListener('change', teikn);
    vert.append(el('p', { class: 'svak liten', html: R`Formel: $B = ${'a'} * k^t$. Prøv ein negativ prosent – då minkar bestanden, men den blir aldri null.` }));
    teikn();
  }

  /* --- Prosent eller prosentpoeng? --- */
  function poeng(vert) {
    const k = el('div', { class: 'kontrollar' });
    const res = el('div', { class: 'to-kol' });
    let fra = 20, til = 25;
    const tegn = () => {
      const pp = til - fra, pr = ((til - fra) / fra) * 100;
      res.innerHTML = MT.mat(`<div class="tal-kort"><span class="merkelapp">Endring i prosentpoeng</span><b class="stort-tal mono">${pp >= 0 ? '+' : '−'}${n(Math.abs(pp), 1)}</b><span>$${n(til, 1)} - ${n(fra, 1)}$</span></div><div class="tal-kort"><span class="merkelapp">Endring i prosent</span><b class="stort-tal mono">${pr >= 0 ? '+' : '−'}${n(Math.abs(pr), 1)} %</b><span>$\\frac{${n(til - fra, 1)}}{${n(fra, 1)}} * 100$</span></div>`);
    };
    glidar(k, { namn: 'Rente før', min: 1, max: 40, steg: 0.5, verdi: fra, eining: '%', vedEndring: (v) => { fra = v; tegn(); } });
    glidar(k, { namn: 'Rente etter', min: 1, max: 40, steg: 0.5, verdi: til, eining: '%', vedEndring: (v) => { til = v; tegn(); } });
    vert.append(k, res); tegn();
  }

  const G = [
    () => { const p = vel([5, 12, 15, 20, 25, 30, 35, 40, 8, 2.5]), v = tilf(4, 60) * 20; return { tekst: `Kva er ${n(p, 1)} % av ${n(v, 0)} kg?`, svar: (v * p) / 100, eining: 'kg', tips: `Gjer prosenten om til desimaltal: ${n(p, 1)} % = ${n(p / 100, 3)}.`, losning: MT.mat(R`$$${n(v, 0)} * ${n(p / 100, 3)} = ${n((v * p) / 100, 2)}$$`) }; },
    () => { const gml = tilf(20, 90) * 10, p = vel([5, 10, 12, 15, 20, 25]), opp = vel([true, false]); const ny = gml * (1 + (opp ? p : -p) / 100); return { tekst: `Prisen på ein sekk kraftfôr gjekk frå ${n(gml, 0)} kr til ${n(ny, 2)} kr. Kor mange prosent ${opp ? 'auke' : 'nedgang'} var det?`, svar: p, eining: '%', tips: R`Prosentvis endring $= \frac{\text{endring}}{\text{gammal verdi}} * 100$.`, losning: MT.mat(R`$$\frac{${n(Math.abs(ny - gml), 2)}}{${n(gml, 0)}} * 100 = ${p}~\%$$`) }; },
    () => { const v = tilf(10, 80) * 50, p = vel([3, 4, 6, 8, 12, 15, 25]), opp = vel([true, false]); const k = 1 + (opp ? p : -p) / 100; return { tekst: `Ein traktor kosta ${n(v, 0)} kr. Prisen ${opp ? 'aukar' : 'blir sett ned'} med ${p} %. Kva er den nye prisen?`, svar: v * k, eining: 'kr', tips: `Vekstfaktoren er ${n(k, 2)}. Gong den gamle prisen med vekstfaktoren.`, losning: MT.mat(R`$$${n(v, 0)} * ${n(k, 2)} = ${n(v * k, 2)}~\text{kr}$$`) }; },
    () => { const p = vel([10, 20, 25, 15, 30]), ny = tilf(10, 90) * 30; const gml = ny / (1 - p / 100); return { tekst: `Etter ${p} % rabatt kostar ei motorsag ${n(ny, 0)} kr. Kva kosta ho før rabatten?`, svar: gml, eining: 'kr', tips: `Ny pris = gammal pris · ${n(1 - p / 100, 2)}. Del den nye prisen på vekstfaktoren.`, losning: MT.mat(R`$$\frac{${n(ny, 0)}}{${n(1 - p / 100, 2)}} = ${n(gml, 2)}~\text{kr}$$`) }; },
    () => { const a = tilf(20, 80) * 10, p = vel([5, 8, 10, 12, 15]), t = tilf(3, 10); return { tekst: `Ein lakseoppdrettar startar med ${n(a, 0)} tonn biomasse som aukar med ${p} % per månad. Kor mange tonn er det etter ${t} månader?`, svar: a * Math.pow(1 + p / 100, t), eining: 'tonn', tips: R`Bruk $a * k^t$ med $k = ${n(1 + p / 100, 2)}$.`, losning: MT.mat(R`$$${n(a, 0)} * ${n(1 + p / 100, 2)}^{${t}} = ${n(a * Math.pow(1 + p / 100, t), 1)}$$`) }; },
    () => { const a = tilf(10, 30), b = a + vel([-4, -3, -2, 2, 3, 5]); const sporsmal = vel(['poeng', 'prosent']); const s = sporsmal === 'poeng' ? b - a : ((b - a) / a) * 100; return { tekst: `Delen av elevane som syklar til skulen, endra seg frå ${a} % til ${b} %. Kor stor er endringa i <b>${sporsmal === 'poeng' ? 'prosentpoeng' : 'prosent'}</b>?`, svar: s, eining: sporsmal === 'poeng' ? 'p.p.' : '%', tips: sporsmal === 'poeng' ? 'Prosentpoeng er differansen mellom dei to prosenttala.' : 'Del endringa på den gamle verdien og gong med 100.', losning: MT.mat(sporsmal === 'poeng' ? R`$$${b} - ${a} = ${b - a}~\text{prosentpoeng}$$` : R`$$\frac{${b - a}}{${a}} * 100 = ${n(s, 2)}~\%$$`) }; },
  ];

  MT.nyttKapittel({
    id: 'prosent', nr: 4, tittel: 'Prosent og vekst', kort: 'Prosent, vekstfaktor, prosentvis endring og gjenteken vekst.',
    glyf: '<circle cx="9" cy="9" r="3.5"/><circle cx="23" cy="23" r="3.5"/><path d="M25 7L7 25"/>',
    maal: ['Rekne med prosent og prosentvis endring', 'Bruke vekstfaktor ved auke og nedgang', 'Rekne med gjenteken prosentvis endring', 'Skilje mellom prosent og prosentpoeng'],
    formlar: [['Prosentdel', R`$\text{del} = \text{heile} * \frac{p}{100}$`], ['Prosentvis endring', R`$\frac{\text{ny} - \text{gammal}}{\text{gammal}} * 100$`], ['Vekstfaktor', R`$k = 1 \pm \frac{p}{100}$`], ['Gjenteken vekst', R`$B = a * k^t$`], ['Finne gammal verdi', R`$\text{gammal} = \frac{\text{ny}}{k}$`]],
    seksjonar: [
      { id: 'prosentdel', tittel: 'Prosent av', blokker: [
        { type: 'teori', html: R`<p>Prosent betyr <i>hundredelar</i>: $1~\% = \frac{1}{100} = 0,01$. Når du skal finne $p~\%$ av eit tal, gongar du talet med $\frac{p}{100}$.</p>
$$35~\% ~\text{av}~ 480 = 480 * 0,35 = 168$$
<p>Skal du finne <b>kor mange prosent</b> ein del er av det heile, deler du delen på det heile: 12 av 48 kyr er kalva, og $\frac{12}{48} = 0,25 = 25~\%$.</p>` },
        { type: 'utforsk', tittel: 'Prosentlinja', intro: 'Den øvste linja går frå 0 til 100 %, den nedste frå 0 til det heile. Same punkt på begge.', lag: prosentlinje },
      ] },
      { id: 'vekstfaktor', tittel: 'Vekstfaktor', blokker: [
        { type: 'teori', html: R`<p>Når ein verdi aukar eller minkar med ein prosent, kan du rekne den nye verdien i éin operasjon med <b>vekstfaktoren</b>:</p>
$$k = 1 + \frac{p}{100}~\text{ved auke} \qquad k = 1 - \frac{p}{100}~\text{ved nedgang}$$
<p>Ein auke på 12 % gir $k = 1,12$. Ein nedgang på 30 % gir $k = 0,70$. Ny verdi $=$ gammal verdi $* k$. Kjenner du den nye verdien og vil finne den gamle, deler du på $k$.</p>` },
        { type: 'eksempel', nr: '4.1', tittel: 'Fôrprisen aukar', oppgave: 'Ein sekk kraftfôr kostar 420 kr. Prisen aukar med 12 %. Kva blir den nye prisen?', steg: [R`Vekstfaktor: $k = 1 + 0,12 = 1,12$.`, R`Ny pris: $420 * 1,12 = 470,40$ kr.`], svar: 'Den nye prisen er 470,40 kr.' },
        { type: 'eksempel', nr: '4.2', tittel: 'Kva kosta ho før salet?', oppgave: 'Ei motorsag kostar 5 600 kr etter 20 % rabatt. Kva kosta ho før?', steg: [R`Rabatt på 20 % gir $k = 0,80$.`, R`Gammal pris $\cdot~0,80 = 5600$, så gammal pris $= \frac{5600}{0,80} = 7000$ kr.`, R`Vanleg feil: å leggje 20 % til 5 600 kr gir 6 720 kr. Det er feil, fordi rabatten var 20 % av den <i>gamle</i> prisen.`], svar: 'Ho kosta 7 000 kr.' },
      ] },
      { id: 'vekst', tittel: 'Gjenteken vekst', blokker: [
        { type: 'teori', html: R`<p>Når ein verdi endrar seg med same prosent fleire gonger på rad, gongar du med vekstfaktoren éin gong per periode:</p>
$$B = a * k^t$$
<p>der $a$ er startverdien, $k$ er vekstfaktoren og $t$ er talet på periodar. Dette kallar vi <b>eksponentiell vekst</b>. Han startar roleg, men skyt fart, fordi kvar auke blir rekna av ein stadig større verdi.</p>` },
        { type: 'utforsk', tittel: 'Vekstmaskina', intro: 'Dra i dei understreka tala i teksten. Søylene viser bestanden kvart år, og den stipla linja viser lineær vekst.', lag: vekstmaskin },
      ] },
      { id: 'poeng', tittel: 'Prosent eller prosentpoeng?', blokker: [
        { type: 'teori', html: R`<p>Når eit prosenttal endrar seg, kan endringa målast på to måtar. Går renta frå 20 % til 25 %, har ho auka med <b>5 prosentpoeng</b>. Men ho har auka med <b>25 prosent</b>, fordi $\frac{5}{20} = 0,25$.</p>` },
        { type: 'utforsk', tittel: 'To måtar å måle på', intro: 'Endre dei to prosenttala og samanlikn.', lag: poeng },
      ] },
      { id: 'oving', tittel: 'Øving', blokker: [{ type: 'oving', generatorar: G }] },
    ],
  });
})();

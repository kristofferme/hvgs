/* Appen: ruting, framside, kapittelvising, trening, verktøy og peikar. */
(function () {
  'use strict';
  const { el, n, R } = MT;
  const hovud = MT.$('#hovud');
  const K = MT.kapittel.sort((a, b) => a.nr - b.nr);

  /* ---------- Tema ---------- */
  const tema = MT.les('tema', null);
  if (tema) document.documentElement.dataset.theme = tema;
  const erMork = () => document.documentElement.dataset.theme ? document.documentElement.dataset.theme === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches;
  MT.$('#temaknapp').addEventListener('click', () => {
    const ny = erMork() ? 'light' : 'dark';
    document.documentElement.dataset.theme = ny; MT.skriv('tema', ny);
    document.dispatchEvent(new CustomEvent('mt:tema'));
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => document.dispatchEvent(new CustomEvent('mt:tema')));

  /* ---------- XP-merke ---------- */
  const xp = MT.$('#xp');
  const visXp = () => { xp.textContent = MT.lager.xp + ' XP'; xp.classList.remove('hopp'); void xp.offsetWidth; xp.classList.add('hopp'); };
  document.addEventListener('mt:framdrift', visXp); xp.textContent = MT.lager.xp + ' XP';

  /* ---------- Koordinatpeikar ---------- */
  const peikar = MT.$('#peikar');
  let peikarPa = MT.les('peikar', true) && matchMedia('(pointer: fine)').matches && !MT.roleg;
  const peikarKnapp = MT.$('#peikarknapp');
  const settPeikar = () => { peikar.hidden = !peikarPa; peikarKnapp.setAttribute('aria-pressed', peikarPa); };
  peikarKnapp.addEventListener('click', () => { peikarPa = !peikarPa; MT.skriv('peikar', peikarPa); settPeikar(); });
  settPeikar();
  let raf;
  addEventListener('pointermove', (e) => {
    if (!peikarPa || e.pointerType !== 'mouse') return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      peikar.style.setProperty('--x', e.clientX + 'px'); peikar.style.setProperty('--y', e.clientY + 'px');
      const over = e.target.closest && e.target.closest('canvas, input, textarea, button, a, select, .skrubb, svg, .rk-grid');
      peikar.classList.toggle('dempa', !!over);
      MT.$('.peikar-tal', peikar).textContent = `(${Math.round(e.clientX / 24)}, ${Math.round((innerHeight - e.clientY) / 24)})`;
    });
  }, { passive: true });

  /* ---------- Skuffer: formelark og kalkulator ---------- */
  const skuff = MT.$('#skuff'), skuffInn = MT.$('#skuff-innhald'), skuffTittel = MT.$('#skuff-tittel');
  let sistFokus;
  function opneSkuff(kva) {
    sistFokus = document.activeElement;
    skuffInn.innerHTML = '';
    if (kva === 'formlar') { skuffTittel.textContent = 'Formelark'; formelark(skuffInn); }
    else { skuffTittel.textContent = 'Kalkulator'; kalkulator(skuffInn); }
    skuff.hidden = false; requestAnimationFrame(() => skuff.classList.add('open'));
    setTimeout(() => { const f = MT.$('input', skuffInn); f && f.focus(); }, 60);
  }
  function lukkSkuff() { skuff.classList.remove('open'); setTimeout(() => { skuff.hidden = true; }, 220); sistFokus && sistFokus.focus && sistFokus.focus(); }
  MT.$('#formelknapp').addEventListener('click', () => opneSkuff('formlar'));
  MT.$('#kalkknapp').addEventListener('click', () => opneSkuff('kalk'));
  MT.$('#skuff-lukk').addEventListener('click', lukkSkuff);
  MT.$('#skuff-bak').addEventListener('click', lukkSkuff);
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !skuff.hidden) lukkSkuff();
    const skriv = /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if (skriv || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'k' || e.key === 'K') { e.preventDefault(); opneSkuff('kalk'); }
    if (e.key === 'f' || e.key === 'F') { e.preventDefault(); opneSkuff('formlar'); }
  });

  function formelark(v) {
    const sok = el('input', { id: 'formelsok', type: 'search', placeholder: 'Søk, t.d. «sylinder» eller «mva»', 'aria-label': 'Søk i formlane' });
    const liste = el('div', { class: 'formelliste' });
    v.append(sok, liste);
    const tegn = () => {
      const q = sok.value.trim().toLowerCase(); liste.innerHTML = '';
      K.forEach((k) => {
        const f = k.formlar.filter(([namn, t]) => !q || namn.toLowerCase().includes(q) || k.tittel.toLowerCase().includes(q) || t.toLowerCase().includes(q));
        if (!f.length) return;
        const g = el('section', {}, el('h3', {}, el('span', { class: 'mono svak' }, k.nr + ' '), k.tittel));
        f.forEach(([namn, t]) => g.append(el('div', { class: 'formel' }, el('span', {}, namn), el('span', { html: t }))));
        liste.append(g);
      });
      if (!liste.children.length) liste.append(el('p', { class: 'svak' }, 'Ingen formlar passar med søket.'));
    };
    sok.addEventListener('input', tegn); tegn();
  }

  let kalkLogg = MT.les('kalklogg', []);
  function kalkulator(v) {
    const vis = el('div', { class: 'kalk-vis mono', 'aria-live': 'polite' });
    const inn = el('input', { id: 'kalk-inn', class: 'mono', placeholder: 't.d. 2*pi*3^2', autocomplete: 'off', 'aria-label': 'Reknestykke' });
    const logg = el('ol', { class: 'kalk-logg mono' });
    const tegnLogg = () => { logg.innerHTML = ''; kalkLogg.slice(-8).reverse().forEach(([u, r]) => logg.append(el('li', { onclick: () => { inn.value = String(r).replace('.', ','); inn.focus(); } }, el('span', {}, u), el('b', {}, '= ' + n(r, 8))))); };
    const rekn = () => {
      if (!inn.value.trim()) return;
      try { const ans = kalkLogg.length ? kalkLogg[kalkLogg.length - 1][1] : 0; const r = MT.rekn(inn.value.replace(/ans/gi, '(' + ans + ')')); vis.textContent = n(r, 10); vis.classList.remove('feil'); kalkLogg.push([inn.value, r]); kalkLogg = kalkLogg.slice(-30); MT.skriv('kalklogg', kalkLogg); inn.value = ''; tegnLogg(); }
      catch (e) { vis.textContent = 'Kan ikkje rekne ut dette'; vis.classList.add('feil'); }
    };
    inn.addEventListener('keydown', (e) => { if (e.key === 'Enter') rekn(); });
    const tast = el('div', { class: 'kalk-tastar' });
    [['(', '('], [')', ')'], ['xʸ', '^'], ['√', 'sqrt('], ['π', 'pi'], ['%', '%'], ['ans', 'ans'], ['C', null], ['=', '=']].forEach(([t, s]) => tast.append(el('button', { class: 'knapp sekundar mono', onclick: () => { if (s === '=') return rekn(); if (s === null) { inn.value = ''; vis.textContent = '0'; return inn.focus(); } inn.setRangeText(s, inn.selectionStart, inn.selectionEnd, 'end'); inn.focus(); } }, t)));
    vis.textContent = '0';
    v.append(vis, inn, tast, el('p', { class: 'svak liten', html: 'Bruk komma eller punktum som desimalteikn. <span class="mono">^</span> er potens, <span class="mono">sqrt( )</span> er kvadratrot. Trykk på eit tidlegare svar for å bruke det igjen.' }), logg);
    tegnLogg();
  }

  /* ---------- Ruting ---------- */
  function rute() {
    const h = (location.hash || '#start').slice(1);
    hovud.innerHTML = '';
    hovud.classList.remove('inn'); void hovud.offsetWidth; hovud.classList.add('inn');
    MT.$$('.nav-lenke').forEach((a) => a.classList.toggle('pa', a.getAttribute('href') === '#' + h || (h.startsWith('k-') && a.dataset.nav === 'kap')));
    if (h.startsWith('k-')) { const [id, sek] = h.slice(2).split('--'); const k = K.find((x) => x.id === id); if (k) { kapittelSide(k); document.title = k.tittel + ' · Matematikk 1P-Y NA'; if (sek) setTimeout(() => { const s = document.getElementById('s-' + sek); s && s.scrollIntoView(); }, 30); else scrollTo(0, 0); return; } }
    if (h === 'trening') { treningSide(); document.title = 'Matteløypa · Matematikk 1P-Y NA'; scrollTo(0, 0); return; }
    if (h === 'laereplan') { laereplanSide(); document.title = 'Læreplan · Matematikk 1P-Y NA'; scrollTo(0, 0); return; }
    framside(); document.title = 'Matematikk 1P-Y NA'; scrollTo(0, 0);
  }
  addEventListener('hashchange', rute);

  /* ---------- Framside ---------- */
  function seedRandom(seed) { return function () { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

  function framside() {
    const L = MT.lager;
    const totaltRett = Object.values(L.rett).reduce((s, x) => s + x, 0);
    const meistra = K.filter((k) => MT.framdrift(k.id) >= 1).length;
    const hero = el('section', { class: 'hero' });
    const kurve = el('div', { class: 'hero-kurve' });
    hero.append(
      el('div', { class: 'hero-tekst' },
        el('p', { class: 'merkelapp' }, 'Vg1 naturbruk · Hustadvika vidaregåande skole'),
        el('h1', { html: 'Matematikk <span class="hero-1py">1P-Y</span> <span class="hero-na">for naturbruk</span>' }),
        el('p', { class: 'ingress' }, 'Ti kapittel med teori, eksempel steg for steg, figurar du kan dra i og oppgåver som blir laga på nytt kvar gong. Alt tek utgangspunkt i garden, skogen, sjøen og jobben.'),
        el('div', { class: 'hero-knappar' },
          el('a', { class: 'knapp stor', href: '#k-' + (K.find((k) => MT.framdrift(k.id) < 1) || K[0]).id }, totaltRett ? 'Hald fram' : 'Start med kapittel 1'),
          el('a', { class: 'knapp sekundar stor', href: '#trening' }, 'Matteløypa'))),
      kurve);
    hovud.append(hero);
    laeringskurve(kurve);

    hovud.append(el('section', { class: 'status-rad', 'aria-label': 'Framdrifta di' },
      ...[['XP', L.xp], ['Rette svar', totaltRett], ['Kapittel meistra', meistra + ' av ' + K.length], ['Beste rekkje', L.besteRekke]].map(([a, b]) => el('div', {}, el('span', { class: 'merkelapp' }, a), el('b', { class: 'mono' }, String(b))))));

    // Dagens oppgåve
    const d = new Date(); const frø = +(d.getFullYear() + '' + (d.getMonth() + 1) + d.getDate());
    const r = seedRandom(frø); const kap = K[Math.floor(r() * K.length)]; const gens = kap.seksjonar.find((s) => s.id === 'oving').blokker[0].generatorar;
    const g = gens[Math.floor(r() * gens.length)];
    const dag = el('section', { class: 'dagens' });
    dag.append(el('div', { class: 'dagens-hode' }, el('h2', {}, 'Dagens oppgåve'), el('span', { class: 'mono svak' }, ['sundag','måndag','tysdag','onsdag','torsdag','fredag','laurdag'][d.getDay()] + ' ' + d.getDate() + '. ' + ['januar','februar','mars','april','mai','juni','juli','august','september','oktober','november','desember'][d.getMonth()] + ' · frå kapittel ' + kap.nr)));
    const ekte = Math.random; Math.random = seedRandom(frø * 7);
    let o; try { o = g(); } finally { Math.random = ekte; }
    MT.ovingsboks(dag, { kapId: kap.id, generatorar: [() => o, ...gens], tittel: kap.tittel });
    hovud.append(dag);

    const rutenett = el('section', { class: 'kapittelrutenett', 'aria-label': 'Kapittel' });
    rutenett.append(el('h2', { class: 'seksjonstittel' }, 'Kapittel'));
    const liste = el('div', { class: 'kort-liste' });
    K.forEach((k) => {
      const p = MT.framdrift(k.id);
      liste.append(el('a', { class: 'kap-kort' + (p >= 1 ? ' meistra' : ''), href: '#k-' + k.id, style: `--p:${p}` },
        el('span', { class: 'kap-nr mono' }, String(k.nr).padStart(2, '0')),
        svgGlyf(k.glyf),
        el('h3', {}, k.tittel), el('p', {}, k.kort),
        el('span', { class: 'kap-bar', 'aria-label': Math.round(p * 100) + ' prosent meistra' }, el('span'))));
    });
    rutenett.append(liste); hovud.append(rutenett);

    hovud.append(el('section', { class: 'verktoyrad' },
      el('a', { class: 'verktoy', href: '#k-programmering--python' }, el('b', {}, 'Python-laben'), el('span', {}, 'Køyr Python rett i nettlesaren')),
      el('button', { class: 'verktoy', onclick: () => opneSkuff('formlar') }, el('b', {}, 'Formelark'), el('span', {}, 'Alle formlane samla. Snarveg: F')),
      el('button', { class: 'verktoy', onclick: () => opneSkuff('kalk') }, el('b', {}, 'Kalkulator'), el('span', {}, 'Med historikk og π. Snarveg: K')),
      el('a', { class: 'verktoy', href: '#laereplan' }, el('b', {}, 'Læreplan og kjerneelement'), el('span', {}, 'Kva kapitla dekkjer'))));
  }

  function svgGlyf(path) { const s = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); s.setAttribute('viewBox', '0 0 32 32'); s.setAttribute('class', 'glyf'); s.setAttribute('aria-hidden', 'true'); s.innerHTML = path; return s; }

  /* Læringskurva: kapitla som punkt på ein logistisk funksjon */
  function laeringskurve(vert) {
    const f = (x) => 10 / (1 + Math.exp(-(x - 5.5) * 0.9));
    const g = new MT.Graf(vert, { xmin: 0, xmax: 11, ymin: -0.6, ymax: 11, hogd: 360, xsteg: 1, ysteg: 1, xnamn: 'kapittel', ynamn: 'meistring', aria: 'Læringskurva med kapitla som punkt' });
    g.visMus = false;
    let t = MT.roleg ? 1 : 0, hover = -1;
    const tips = el('div', { class: 'kurve-tips', hidden: true });
    vert.append(tips, el('div', { class: 'kurve-formel', html: R`$f(x) = \frac{10}{1 + e^{-0,9(x - 5,5)}}$` }));
    g.lag = (g) => {
      const A = MT.farge('accent'), Gr = MT.farge('green');
      const xs = 0.2 + t * 10.6;
      g.funksjon((x) => (x <= xs ? f(x) : NaN), A, 3);
      K.forEach((k, i) => { const x = i + 1; if (x > xs) return; const p = MT.framdrift(k.id); g.linje(x, 0, x, f(x), MT.alfa(g.F.svak, 0.4), 1, [2, 4]); g.punkt(x, f(x), p >= 1 ? Gr : g.F.papir, hover === i ? 11 : 8); g.ctx.lineWidth = 2.5; g.ctx.strokeStyle = p >= 1 ? Gr : A; g.ctx.beginPath(); g.ctx.arc(g.X(x), g.Y(f(x)), hover === i ? 11 : 8, -Math.PI / 2, -Math.PI / 2 + Math.max(0.0001, p) * Math.PI * 2); g.ctx.stroke(); g.tekst(String(k.nr), x, f(x), g.F.blekk, 'center', '600 10px "DM Mono", monospace'); });
    };
    const anim = (t0) => { const s = (now) => { t = Math.min(1, (now - t0) / 1600); t = 1 - Math.pow(1 - t, 3); g.teikn(); if (t < 1) requestAnimationFrame(s); }; requestAnimationFrame(s); };
    if (!MT.roleg) anim(performance.now()); else g.teikn();
    const naermast = (e) => { const r = g.c.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top; let b = -1, bd = 26; K.forEach((k, i) => { const d = Math.hypot(g.X(i + 1) - px, g.Y(f(i + 1)) - py); if (d < bd) { bd = d; b = i; } }); return b; };
    g.c.addEventListener('pointermove', (e) => { const i = naermast(e); if (i !== hover) { hover = i; g.teikn(); } g.c.style.cursor = i >= 0 ? 'pointer' : 'default'; if (i >= 0) { const k = K[i]; tips.hidden = false; tips.innerHTML = `<b>${k.nr}. ${k.tittel}</b><span>${Math.round(MT.framdrift(k.id) * 100)} % meistra</span>`; tips.style.left = g.X(i + 1) + 'px'; tips.style.top = g.Y(f(i + 1)) + 'px'; } else tips.hidden = true; });
    g.c.addEventListener('pointerleave', () => { hover = -1; tips.hidden = true; g.teikn(); });
    g.c.addEventListener('click', (e) => { const i = naermast(e); if (i >= 0) location.hash = 'k-' + K[i].id; });
  }

  /* ---------- Kapittelside ---------- */
  function kapittelSide(k) {
    const i = K.indexOf(k);
    const topp = el('header', { class: 'kap-topp' });
    topp.append(el('a', { class: 'tilbake-lenke', href: '#start' }, '← Alle kapittel'),
      el('div', { class: 'kap-tittelrad' }, el('span', { class: 'kap-stort-nr mono', 'aria-hidden': 'true' }, String(k.nr).padStart(2, '0')), el('div', {}, el('p', { class: 'merkelapp' }, 'Kapittel ' + k.nr), el('h1', {}, k.tittel), el('p', { class: 'ingress' }, k.kort))),
      el('div', { class: 'maal-boks' }, el('h2', { class: 'merkelapp' }, 'Dette skal du lære'), el('ul', {}, ...k.maal.map((m) => el('li', {}, m)))));
    const innhald = el('nav', { class: 'innhald', 'aria-label': 'Innhald i kapittelet' });
    const il = el('ol', {});
    const tekst = el('div', { class: 'kap-tekst' });
    k.seksjonar.forEach((s, si) => {
      const nr = k.nr + '.' + (si + 1);
      il.append(el('li', {}, el('a', { href: '#k-' + k.id + '--' + s.id, 'data-s': s.id, onclick: (e) => { e.preventDefault(); history.replaceState(null, '', '#k-' + k.id + '--' + s.id); document.getElementById('s-' + s.id).scrollIntoView({ behavior: MT.roleg ? 'auto' : 'smooth' }); } }, el('span', { class: 'mono svak' }, nr), ' ' + s.tittel)));
      const sek = el('section', { class: 'seksjon', id: 's-' + s.id });
      sek.append(el('h2', {}, el('span', { class: 'sek-nr mono' }, nr), s.tittel));
      s.blokker.forEach((b) => {
        if (b.type === 'teori') sek.append(el('div', { class: 'teori', html: b.html }));
        else if (b.type === 'eksempel') MT.eksempel(sek, b);
        else if (b.type === 'utforsk') { const w = el('figure', { class: 'utforsk' }); w.append(el('figcaption', {}, el('span', { class: 'merkelapp' }, 'Utforsk'), el('h3', {}, b.tittel), b.intro ? el('p', { html: b.intro }) : null)); const kropp = el('div', { class: 'utforsk-kropp' }); w.append(kropp); sek.append(w); try { b.lag(kropp); } catch (e) { kropp.append(el('p', { class: 'tilbake feil' }, 'Denne figuren kunne ikkje lastast: ' + e.message)); console.error(e); } }
        else if (b.type === 'oving') { sek.append(el('p', { class: 'svak' }, `Oppgåvene blir laga på nytt kvar gong. Få ${MT.MAAL} rette på første forsøk for å meistre kapittelet.`)); MT.ovingsboks(sek, { kapId: k.id, generatorar: b.generatorar }); }
      });
      tekst.append(sek);
    });
    innhald.append(el('p', { class: 'merkelapp' }, 'Innhald'), il, el('div', { class: 'innhald-framdrift' }, el('span', { class: 'merkelapp' }, 'Meistring'), el('span', { class: 'kap-bar', style: `--p:${MT.framdrift(k.id)}` }, el('span'))));
    const nav = el('nav', { class: 'kap-nav', 'aria-label': 'Førre og neste kapittel' },
      i > 0 ? el('a', { href: '#k-' + K[i - 1].id }, el('span', { class: 'merkelapp' }, '← Førre'), K[i - 1].tittel) : el('span'),
      i < K.length - 1 ? el('a', { href: '#k-' + K[i + 1].id, class: 'neste' }, el('span', { class: 'merkelapp' }, 'Neste →'), K[i + 1].tittel) : el('a', { href: '#trening', class: 'neste' }, el('span', { class: 'merkelapp' }, 'Ferdig? →'), 'Matteløypa'));
    tekst.append(nav);
    hovud.append(topp, el('div', { class: 'kap-oppsett' }, innhald, tekst));
    document.addEventListener('mt:framdrift', () => { const b = MT.$('.innhald-framdrift .kap-bar'); b && b.style.setProperty('--p', MT.framdrift(k.id)); });
    // marker aktiv seksjon i innhaldslista
    const obs = new IntersectionObserver((e) => e.forEach((x) => { if (x.isIntersecting) MT.$$('a', il).forEach((a) => a.classList.toggle('pa', a.dataset.s === x.target.id.slice(2))); }), { rootMargin: '-30% 0px -60% 0px' });
    MT.$$('.seksjon', tekst).forEach((s) => obs.observe(s));
  }

  /* ---------- Matteløypa (blanda trening) ---------- */
  function treningSide() {
    let valde = new Set(MT.les('treningval', K.map((k) => k.id)));
    const topp = el('header', { class: 'kap-topp' });
    topp.append(el('a', { class: 'tilbake-lenke', href: '#start' }, '← Framsida'), el('p', { class: 'merkelapp' }, 'Blanda trening'), el('h1', {}, 'Matteløypa'), el('p', { class: 'ingress' }, 'Oppgåver frå kapitla du vel, i tilfeldig rekkjefølgje. Kvar rett på første forsøk gir XP og byggjer rekkja di. Eitt feil svar, og rekkja startar på nytt.'));
    const brikker = el('div', { class: 'brikker' });
    K.forEach((k) => brikker.append(el('button', { class: 'brikke' + (valde.has(k.id) ? ' pa' : ''), 'aria-pressed': valde.has(k.id), onclick: (e) => { valde.has(k.id) ? valde.delete(k.id) : valde.add(k.id); if (!valde.size) valde.add(k.id); MT.skriv('treningval', [...valde]); e.currentTarget.classList.toggle('pa', valde.has(k.id)); e.currentTarget.setAttribute('aria-pressed', valde.has(k.id)); start(); } }, k.nr + '. ' + k.tittel)));
    const vert = el('div', { class: 'trening-vert' });
    hovud.append(topp, el('div', { class: 'smal' }, el('p', { class: 'merkelapp' }, 'Kapittel med i løypa'), brikker, vert));
    function start() {
      vert.innerHTML = '';
      const blanda = MT.stokk(K.filter((k) => valde.has(k.id)).flatMap((k) => k.seksjonar.find((s) => s.id === 'oving').blokker[0].generatorar.map((g) => () => { const o = g(); o.kap = k.id; o.tekst = `<span class="kap-merke mono">Kap. ${k.nr}</span> ` + o.tekst; return o; })));
      MT.ovingsboks(vert, { kapId: 'blanda', generatorar: blanda, tittel: 'Matteløypa' });
    }
    start();
  }

  /* ---------- Læreplan ---------- */
  function laereplanSide() {
    const KJ = [
      ['Utforsking og problemløysing', 'Eleven lagar strategiar, prøver seg fram og ser etter mønster.', ['Rekkjefølgje-maskina', 'Beiteplanleggjaren', 'Python-laben']],
      ['Modellering og anvendingar', 'Eleven lagar og vurderer modellar av situasjonar frå naturbruk og kvardag.', ['Treff punkta (lamvekt)', 'Vekstmaskina (bestand)', 'Merd og tettleik']],
      ['Resonnering og argumentasjon', 'Eleven grunngir framgangsmåtar og vurderer om svar er rimelege.', ['Overslagsspelet', '3-4-5-regelen', 'Lurediagram']],
      ['Representasjon og kommunikasjon', 'Eleven brukar og byter mellom tabell, graf, formel og tekst.', ['Prosentlinja', 'Linjelaben', 'Diagrambyggjaren']],
      ['Abstraksjon og generalisering', 'Eleven ser det generelle i det konkrete og brukar formlar og symbol.', ['Einingstrappa', 'Kvadrata til Pytagoras', 'Rekneark-laben']],
      ['Matematiske kunnskapsområde', 'Tal og algebra, geometri, funksjonar, statistikk og økonomi.', K.map((k) => k.tittel)],
    ];
    hovud.append(el('header', { class: 'kap-topp' }, el('a', { class: 'tilbake-lenke', href: '#start' }, '← Framsida'), el('p', { class: 'merkelapp' }, 'For elevar og lærarar'), el('h1', {}, 'Læreplan og kjerneelement'), el('p', { class: 'ingress', html: 'Nettstaden er laga for matematikk 1P-Y på Vg1 naturbruk (LK20). Kapitla dekkjer tema i læreplanen for fellesfaget, med eksempel frå landbruk, skogbruk, fiske, havbruk og dyrehald. Sjekk alltid ordlyden i kompetansemåla på <a href="https://www.udir.no/lk20/" target="_blank" rel="noopener">udir.no</a>. NDLA har òg mange oppgåver for 1P-Y på <a href="https://ndla.no/nn/utdanning/naturbruk" target="_blank" rel="noopener">ndla.no</a>.' })));
    const smal = el('div', { class: 'smal' });
    const tab = el('div', { class: 'tabell-vert' });
    tab.innerHTML = `<table class="tabell"><thead><tr><th>Kapittel</th><th>Dette skal eleven lære</th></tr></thead><tbody>${K.map((k) => `<tr><td><a href="#k-${k.id}"><span class="mono svak">${k.nr}</span> ${k.tittel}</a></td><td><ul>${k.maal.map((m) => `<li>${m}</li>`).join('')}</ul></td></tr>`).join('')}</tbody></table>`;
    smal.append(el('h2', { class: 'seksjonstittel' }, 'Kapitla og læringsmåla'), tab, el('h2', { class: 'seksjonstittel' }, 'Kjerneelementa i matematikk'));
    const kj = el('div', { class: 'kjerne-liste' });
    KJ.forEach(([t, b, d]) => kj.append(el('article', {}, el('h3', {}, t), el('p', {}, b), el('p', { class: 'svak liten' }, 'Til dømes: ' + d.join(' · ')))));
    smal.append(kj);
    const nulst = el('div', { class: 'nullstill' });
    const knapp = el('button', { class: 'knapp sekundar' }, 'Nullstill framdrifta mi');
    knapp.onclick = () => { nulst.innerHTML = ''; nulst.append(el('p', {}, 'Er du sikker? XP og rette svar blir sletta frå denne nettlesaren.'), el('div', { class: 'rad' }, el('button', { class: 'knapp fare', onclick: () => { MT.lager = { xp: 0, rett: {}, forsok: {}, sett: {}, rekke: 0, besteRekke: 0, dagar: {} }; MT.lagre(); document.dispatchEvent(new CustomEvent('mt:framdrift')); nulst.innerHTML = '<p class="tilbake rett">Framdrifta er nullstilt.</p>'; } }, 'Ja, nullstill'), el('button', { class: 'knapp sekundar', onclick: () => { nulst.innerHTML = ''; nulst.append(knapp); } }, 'Avbryt'))); };
    nulst.append(knapp);
    smal.append(el('h2', { class: 'seksjonstittel' }, 'Personvern'), el('p', {}, 'Framdrift og XP blir berre lagra i nettlesaren din. Ingenting blir sendt nokon stad, og det finst ingen innlogging.'), nulst);
    hovud.append(smal);
  }

  rute();
})();

  /* ==========================================================================
     Stil: palett, skrift, verden, rammer, bevegelse, tekstanimasjon, overgang.
     Hver presentasjon har sin egen kombinasjon, og terningen lager nye.
     ========================================================================== */

  var PALETTER = {
    nordlys: { navn: 'Nordlys', mork: 1, bg: '#060b18', bg2: '#0d1d38', flate: '#111d36', ink: '#eef3ff', ink2: '#b3c2de', a1: '#5ef2c5', a2: '#9a86ff', a3: '#4cc3ff' },
    fjord: { navn: 'Fjord', mork: 0, bg: '#e4eaee', bg2: '#f8fafb', flate: '#ffffff', ink: '#0d2136', ink2: '#46596c', a1: '#f0531c', a2: '#1662d6', a3: '#14a38b' },
    kritt: { navn: 'Kritt', mork: 1, bg: '#1b2822', bg2: '#28392f', flate: '#22322a', ink: '#f2f0e6', ink2: '#c8cfc2', a1: '#ffd94a', a2: '#86d4ff', a3: '#ff9ec4' },
    glod: { navn: 'Glød', mork: 1, bg: '#150b19', bg2: '#2e1233', flate: '#24112a', ink: '#fff3ea', ink2: '#e3c4bb', a1: '#ff8a5b', a2: '#ffcf73', a3: '#ff5d8f' },
    blakopi: { navn: 'Blåkopi', mork: 1, bg: '#0b2f63', bg2: '#134588', flate: '#0f3b76', ink: '#f4f8ff', ink2: '#b8cdee', a1: '#ffd23f', a2: '#7fe3ff', a3: '#ff8b7b' },
    riso: { navn: 'Riso', mork: 0, bg: '#f1eee8', bg2: '#fbfaf7', flate: '#ffffff', ink: '#1c1b2e', ink2: '#4e4b63', a1: '#ff48b0', a2: '#0078bf', a3: '#ffb400' },
    neon: { navn: 'Neon', mork: 1, bg: '#07060d', bg2: '#151027', flate: '#100c1e', ink: '#f5f2ff', ink2: '#b9b2d6', a1: '#ff2bd6', a2: '#2bf0ff', a3: '#fff04d' },
    skog: { navn: 'Skog', mork: 1, bg: '#0c1c15', bg2: '#173126', flate: '#14281f', ink: '#f1ecdc', ink2: '#c4c8b2', a1: '#a6e36b', a2: '#e8c872', a3: '#6fc3a4' },
    dyphav: { navn: 'Dyphav', mork: 1, bg: '#031a22', bg2: '#073241', flate: '#062a36', ink: '#eafcff', ink2: '#a9cdd6', a1: '#3de0d0', a2: '#ff7a59', a3: '#7aa8ff' },
    sand: { navn: 'Sand', mork: 0, bg: '#ebe2d2', bg2: '#f7f2e9', flate: '#fffaf2', ink: '#33261a', ink2: '#6b5a49', a1: '#0e7c7b', a2: '#d99a2b', a3: '#7b4dff' },
    is: { navn: 'Is', mork: 0, bg: '#e7f1f8', bg2: '#f8fcff', flate: '#ffffff', ink: '#10263b', ink2: '#4a6176', a1: '#00a3d6', a2: '#7a5cff', a3: '#ff6b8b' },
    kosmos: { navn: 'Kosmos', mork: 1, bg: '#0a0616', bg2: '#1b1036', flate: '#160d2c', ink: '#f6f0ff', ink2: '#bdb0dc', a1: '#ffb347', a2: '#8a6cff', a3: '#ff5d8f' },
    lava: { navn: 'Lava', mork: 1, bg: '#13100e', bg2: '#2a1d16', flate: '#201712', ink: '#fff4ea', ink2: '#d6c2b2', a1: '#ff5a1f', a2: '#ffb000', a3: '#ff8fb1' },
    pop: { navn: 'Pop', mork: 0, bg: '#f4f4ef', bg2: '#ffffff', flate: '#ffffff', ink: '#111111', ink2: '#444444', a1: '#ff3b30', a2: '#0057ff', a3: '#ffc800' },
    lavendel: { navn: 'Lavendel', mork: 0, bg: '#ece8ff', bg2: '#faf8ff', flate: '#ffffff', ink: '#24194a', ink2: '#5b4f84', a1: '#7b4dff', a2: '#ff6fae', a3: '#18b6a0' },
    grafitt: { navn: 'Grafitt', mork: 1, bg: '#18191d', bg2: '#25272e', flate: '#202228', ink: '#ececec', ink2: '#a9abb3', a1: '#ffb3c7', a2: '#9ad0ff', a3: '#ffd98a' }
  };

  function gf(familie, akser) { return 'https://fonts.googleapis.com/css2?family=' + familie.replace(/ /g, '+') + (akser ? ':' + akser : '') + '&display=swap'; }
  var SKRIFTER = {
    klassisk: { navn: 'Klassisk', disp: '"Fraunces", Georgia, serif', w: 600, h1: 2.5, spor: '-0.022em', urls: [gf('Fraunces', 'ital,opsz,wght@0,9..144,300..800;1,9..144,300..800'), gf('Manrope', 'wght@400..800')], body: '"Manrope", "Segoe UI", system-ui, sans-serif', last: ['600 1em Fraunces', '400 1em Manrope'] },
    moderne: { navn: 'Moderne', disp: '"Bricolage Grotesque", "Avenir Next", system-ui, sans-serif', w: 700, h1: 2.5, spor: '-0.03em', urls: [gf('Bricolage Grotesque', 'opsz,wght@12..96,400..800'), gf('Manrope', 'wght@400..800')], body: '"Manrope", "Segoe UI", system-ui, sans-serif', last: ['700 1em "Bricolage Grotesque"', '400 1em Manrope'] },
    hand: { navn: 'Håndskrift', disp: '"Caveat", "Segoe Print", cursive', w: 700, h1: 3.1, spor: '0', urls: [gf('Caveat', 'wght@500..700'), gf('Manrope', 'wght@400..800')], body: '"Manrope", "Segoe UI", system-ui, sans-serif', last: ['700 1em Caveat', '400 1em Manrope'] },
    redaksjon: { navn: 'Redaksjon', disp: '"Instrument Serif", Georgia, serif', w: 400, h1: 3, spor: '-0.015em', urls: [gf('Instrument Serif', 'ital@0;1'), gf('Instrument Sans', 'wght@400..700')], body: '"Instrument Sans", "Segoe UI", system-ui, sans-serif', last: ['400 1em "Instrument Serif"', '400 1em "Instrument Sans"'] },
    plakat: { navn: 'Plakat', disp: '"Anton", Impact, "Arial Narrow", sans-serif', w: 400, h1: 2.9, spor: '0.005em', store: true, urls: [gf('Anton'), gf('Archivo', 'wght@400..800')], body: '"Archivo", "Segoe UI", system-ui, sans-serif', last: ['400 1em Anton', '400 1em Archivo'] },
    geometrisk: { navn: 'Geometrisk', disp: '"Unbounded", "Avenir Next", sans-serif', w: 600, h1: 2.05, spor: '-0.03em', urls: [gf('Unbounded', 'wght@400..800'), gf('Figtree', 'wght@400..800')], body: '"Figtree", "Segoe UI", system-ui, sans-serif', last: ['600 1em Unbounded', '400 1em Figtree'] },
    teknisk: { navn: 'Teknisk', disp: '"JetBrains Mono", "SF Mono", Menlo, monospace', w: 700, h1: 2.05, spor: '-0.04em', urls: [gf('JetBrains Mono', 'wght@400..800'), gf('IBM Plex Sans', 'wght@400;600;700')], body: '"IBM Plex Sans", "Segoe UI", system-ui, sans-serif', last: ['700 1em "JetBrains Mono"', '400 1em "IBM Plex Sans"'] },
    eventyr: { navn: 'Eventyr', disp: '"Young Serif", Georgia, serif', w: 400, h1: 2.5, spor: '-0.01em', urls: [gf('Young Serif'), gf('Figtree', 'wght@400..800')], body: '"Figtree", "Segoe UI", system-ui, sans-serif', last: ['400 1em "Young Serif"', '400 1em Figtree'] },
    bred: { navn: 'Bred', disp: '"Syne", "Avenir Next", sans-serif', w: 700, h1: 2.4, spor: '-0.02em', urls: [gf('Syne', 'wght@400..800'), gf('Manrope', 'wght@400..800')], body: '"Manrope", "Segoe UI", system-ui, sans-serif', last: ['700 1em Syne', '400 1em Manrope'] },
    elegant: { navn: 'Elegant', disp: '"Cormorant Garamond", Garamond, Georgia, serif', w: 600, h1: 3, spor: '-0.01em', kursiv: true, urls: [gf('Cormorant Garamond', 'ital,wght@0,500..700;1,500..700'), gf('Jost', 'wght@400..700')], body: '"Jost", "Segoe UI", system-ui, sans-serif', last: ['italic 600 1em "Cormorant Garamond"', '400 1em Jost'] },
    leken: { navn: 'Leken', disp: '"Fredoka", "Avenir Next Rounded", system-ui, sans-serif', w: 600, h1: 2.6, spor: '-0.01em', urls: [gf('Fredoka', 'wght@400..700'), gf('Nunito', 'wght@400..800')], body: '"Nunito", "Segoe UI", system-ui, sans-serif', last: ['600 1em Fredoka', '400 1em Nunito'] },
    tusj: { navn: 'Tusj', disp: '"Caveat Brush", "Segoe Print", cursive', w: 400, h1: 3, spor: '0', urls: [gf('Caveat Brush'), gf('Nunito', 'wght@400..800')], body: '"Nunito", "Segoe UI", system-ui, sans-serif', last: ['400 1em "Caveat Brush"', '400 1em Nunito'] }
  };

  var VERDENER = {
    nordlys: { navn: 'Nordlys', mork: true },
    stjerner: { navn: 'Stjernehimmel', mork: true },
    rutenett: { navn: 'Rutenett' },
    prikker: { navn: 'Prikkark' },
    topografi: { navn: 'Kartlinjer' },
    hav: { navn: 'Bølger' },
    konstellasjon: { navn: 'Nettverk' },
    bokeh: { navn: 'Lysglimt' },
    kritt: { navn: 'Tavle', mork: true },
    blekk: { navn: 'Akvarell' },
    papir: { navn: 'Papir' },
    ingen: { navn: 'Ren' }
  };
  var RAMMESTILER = {
    glass: 'Glass', solid: 'Kort', papir: 'Papirark', linje: 'Strek', skisse: 'Skisse', neon: 'Neon', lapp: 'Lapp', ingen: 'Ingen ramme'
  };
  var FORMER = { kort: 'Kort', sirkel: 'Sirkel', blob: 'Blob', fri: 'Fri tekst' };
  var BEVEGELSER = {
    myk: { navn: 'Myk', fart: 1, ease: 'cubic', rho: 1.32, pust: 0.02 },
    filmatisk: { navn: 'Filmatisk', fart: 0.72, ease: 'quint', rho: 1.45, pust: 0.032 },
    sprett: { navn: 'Sprett', fart: 1.12, ease: 'back', rho: 1.25, pust: 0.015 },
    rask: { navn: 'Rask', fart: 1.6, ease: 'quart', rho: 1.18, pust: 0.01 },
    drom: { navn: 'Drøm', fart: 0.6, ease: 'sine', rho: 1.6, pust: 0.045 }
  };
  var INNGANGER = {
    ord: 'Ord for ord', bokstav: 'Bokstav for bokstav', maske: 'Maske', skriv: 'Skrivemaskin', dekode: 'Dekode',
    blur: 'Uskarp til skarp', zoom: 'Zoom', sveip: 'Sveip', fall: 'Fall', ingen: 'Ingen'
  };
  var OVERGANGER = { fly: 'Fly', dykk: 'Dykk', sveip: 'Sveip', spiral: 'Spiral', kutt: 'Kutt', drift: 'Drift' };
  var STIER = { linje: 'Linje', prikker: 'Prikker', ingen: 'Skjult' };

  var STILER = [
    { navn: 'Nordlys', palett: 'nordlys', skrift: 'klassisk', verden: 'nordlys', ramme: 'glass', bevegelse: 'myk', inn: 'ord', overgang: 'fly', sti: 'linje' },
    { navn: 'Fjord', palett: 'fjord', skrift: 'moderne', verden: 'prikker', ramme: 'solid', bevegelse: 'rask', inn: 'maske', overgang: 'fly', sti: 'prikker' },
    { navn: 'Tavle', palett: 'kritt', skrift: 'hand', verden: 'kritt', ramme: 'skisse', bevegelse: 'sprett', inn: 'skriv', overgang: 'fly', sti: 'prikker' },
    { navn: 'Glød', palett: 'glod', skrift: 'elegant', verden: 'bokeh', ramme: 'glass', bevegelse: 'filmatisk', inn: 'blur', overgang: 'drift', sti: 'linje' },
    { navn: 'Blåkopi', palett: 'blakopi', skrift: 'teknisk', verden: 'rutenett', ramme: 'linje', bevegelse: 'rask', inn: 'dekode', overgang: 'sveip', sti: 'prikker' },
    { navn: 'Riso', palett: 'riso', skrift: 'plakat', verden: 'papir', ramme: 'lapp', bevegelse: 'sprett', inn: 'fall', overgang: 'fly', sti: 'ingen' },
    { navn: 'Neon', palett: 'neon', skrift: 'geometrisk', verden: 'konstellasjon', ramme: 'neon', bevegelse: 'rask', inn: 'dekode', overgang: 'sveip', sti: 'linje' },
    { navn: 'Skog', palett: 'skog', skrift: 'eventyr', verden: 'topografi', ramme: 'papir', bevegelse: 'drom', inn: 'ord', overgang: 'drift', sti: 'prikker' },
    { navn: 'Dyphav', palett: 'dyphav', skrift: 'bred', verden: 'hav', ramme: 'glass', bevegelse: 'drom', inn: 'blur', overgang: 'dykk', sti: 'linje' },
    { navn: 'Kosmos', palett: 'kosmos', skrift: 'redaksjon', verden: 'stjerner', ramme: 'ingen', bevegelse: 'filmatisk', inn: 'bokstav', overgang: 'spiral', sti: 'linje' },
    { navn: 'Pop', palett: 'pop', skrift: 'leken', verden: 'prikker', ramme: 'solid', bevegelse: 'sprett', inn: 'zoom', overgang: 'fly', sti: 'ingen' },
    { navn: 'Is', palett: 'is', skrift: 'redaksjon', verden: 'topografi', ramme: 'linje', bevegelse: 'myk', inn: 'maske', overgang: 'fly', sti: 'prikker' },
    { navn: 'Akvarell', palett: 'sand', skrift: 'tusj', verden: 'blekk', ramme: 'papir', bevegelse: 'myk', inn: 'sveip', overgang: 'drift', sti: 'prikker' },
    { navn: 'Lava', palett: 'lava', skrift: 'plakat', verden: 'bokeh', ramme: 'ingen', bevegelse: 'filmatisk', inn: 'maske', overgang: 'dykk', sti: 'linje' },
    { navn: 'Lavendel', palett: 'lavendel', skrift: 'bred', verden: 'blekk', ramme: 'solid', bevegelse: 'myk', inn: 'ord', overgang: 'fly', sti: 'prikker' },
    { navn: 'Grafitt', palett: 'grafitt', skrift: 'moderne', verden: 'rutenett', ramme: 'skisse', bevegelse: 'rask', inn: 'sveip', overgang: 'sveip', sti: 'linje' }
  ];
  var GAMLE_TEMA = { aurora: 'Nordlys', fjord: 'Fjord', kritt: 'Tavle', glod: 'Glød' };

  var ADJEKTIV = ['Stille', 'Elektrisk', 'Varm', 'Kald', 'Gylden', 'Dyp', 'Lys', 'Vill', 'Myk', 'Skarp', 'Drømmende', 'Klar', 'Hemmelig', 'Rolig', 'Lysende', 'Rastløs', 'Salt', 'Sølvgrå'];
  var SUBSTANTIV = ['fjell', 'hav', 'natt', 'morgen', 'skog', 'by', 'storm', 'bris', 'kyst', 'vidde', 'tåke', 'glød', 'puls', 'bølge', 'stjerne', 'fjære', 'høst', 'myr'];

  function stilFraMal(m, seed) {
    var s = JSON.parse(JSON.stringify(m));
    s.seed = seed != null ? seed : Math.floor(Math.random() * 1e9);
    s.korn = s.korn != null ? s.korn : 0.07;
    return s;
  }

  // Terningen: setter sammen en ny, sammenhengende stil fra byggeklossene
  function lagStil(seed) {
    var r = rng(seed);
    var pid = trekk(r, Object.keys(PALETTER)), p = PALETTER[pid];
    var verdener = Object.keys(VERDENER).filter(function (v) {
      if (v === 'ingen') return false;
      if (VERDENER[v].mork && !p.mork) return false;
      if (v === 'kritt') return pid === 'kritt' || pid === 'skog' || pid === 'grafitt';
      if (v === 'papir') return !p.mork;
      return true;
    });
    var rammer = Object.keys(RAMMESTILER).filter(function (k) { return k !== 'neon' || p.mork; });
    return {
      navn: trekk(r, ADJEKTIV) + ' ' + trekk(r, SUBSTANTIV),
      palett: pid,
      skrift: trekk(r, Object.keys(SKRIFTER)),
      verden: trekk(r, verdener),
      ramme: trekk(r, rammer),
      bevegelse: trekk(r, Object.keys(BEVEGELSER)),
      inn: trekk(r, Object.keys(INNGANGER).filter(function (k) { return k !== 'ingen'; })),
      overgang: trekk(r, ['fly', 'fly', 'dykk', 'sveip', 'spiral', 'drift']),
      sti: trekk(r, ['linje', 'prikker', 'prikker', 'ingen']),
      korn: +(0.03 + r() * 0.08).toFixed(2),
      seed: seed
    };
  }

  function finnMal(navn) {
    var n = String(navn || '').toLowerCase();
    return STILER.filter(function (m) { return m.navn.toLowerCase() === n; })[0];
  }
  function normaliserStil(d) {
    var s = d.stil;
    if (typeof s === 'string') s = finnMal(s) ? stilFraMal(finnMal(s), hash(d.id || s)) : null;
    if (s && typeof s === 'object' && s.mal && finnMal(s.mal)) {
      var grunn = stilFraMal(finnMal(s.mal), hash(d.id || s.mal));
      s = Object.assign(grunn, s);
      delete s.mal;
    }
    if (!s || typeof s !== 'object') {
      var mal = STILER.filter(function (m) { return m.navn === GAMLE_TEMA[d.tema]; })[0] || STILER[0];
      s = stilFraMal(mal, hash(d.id || 'krizi'));
    }
    if (!PALETTER[s.palett]) s.palett = 'nordlys';
    if (!SKRIFTER[s.skrift]) s.skrift = 'klassisk';
    if (!VERDENER[s.verden]) s.verden = 'nordlys';
    if (!RAMMESTILER[s.ramme]) s.ramme = 'glass';
    if (!BEVEGELSER[s.bevegelse]) s.bevegelse = 'myk';
    if (!INNGANGER[s.inn]) s.inn = 'ord';
    if (!OVERGANGER[s.overgang]) s.overgang = 'fly';
    if (!STIER[s.sti]) s.sti = d.visSti === false ? 'ingen' : 'linje';
    if (typeof s.seed !== 'number') s.seed = hash(d.id || 'krizi');
    if (typeof s.korn !== 'number') s.korn = 0.07;
    if (s.farger && typeof s.farger !== 'object') delete s.farger;
    s.pust = s.pust !== false;
    d.stil = s;
    delete d.tema; delete d.visSti;
    return s;
  }

  function aktivStil() {
    var s = doc.stil;
    var p = Object.assign({}, PALETTER[s.palett], s.farger || {});
    return { s: s, p: p, f: SKRIFTER[s.skrift], b: BEVEGELSER[s.bevegelse] };
  }

  var lastetSkrift = {};
  function lastSkrift(f, ferdig) {
    f.urls.forEach(function (u) {
      if (lastetSkrift[u]) return;
      lastetSkrift[u] = true;
      document.head.append(h('link', { rel: 'stylesheet', href: u }));
    });
    if (!document.fonts || !document.fonts.load) return;
    Promise.all(f.last.map(function (spes) { return document.fonts.load(spes, 'AÆØÅaæøå').catch(function () { return null; }); }))
      .then(function () { if (ferdig) ferdig(); });
  }

  function brukStil() {
    var a = aktivStil(), p = a.p, f = a.f, st = document.documentElement.style;
    var sett = function (k, v) { st.setProperty(k, v); };
    sett('--bg', p.bg); sett('--bg-2', p.bg2); sett('--flate', p.flate);
    sett('--ink', p.ink); sett('--ink-2', p.ink2);
    sett('--a1', p.a1); sett('--a2', p.a2); sett('--a3', p.a3);
    sett('--a-ink', blekkPa(p.a1));
    sett('--mork', p.mork ? 1 : 0);
    sett('--f-disp', f.disp); sett('--f-body', f.body);
    sett('--disp-w', f.w); sett('--disp-stil', f.kursiv ? 'italic' : 'normal');
    sett('--disp-spor', f.spor); sett('--disp-case', f.store ? 'uppercase' : 'none');
    sett('--h1', f.h1 + 'em');
    sett('--korn', a.s.korn);
    document.documentElement.setAttribute('data-verden', a.s.verden);
    document.documentElement.setAttribute('data-mork', p.mork ? '1' : '0');
    document.documentElement.style.colorScheme = p.mork ? 'dark' : 'light';
    var meta = $('meta[name="theme-color"]');
    if (!meta) { meta = h('meta', { name: 'theme-color' }); document.head.append(meta); }
    meta.setAttribute('content', p.bg);
    lastSkrift(f, function () { if (typeof tilpassAlle === 'function') tilpassAlle(); });
    if (typeof verden !== 'undefined') verden.sett();
  }

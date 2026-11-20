  /* ==========================================================================
     Redigering
     ========================================================================== */

  var historikk = [], fremtid = [], sisteBilde = null, ulagret = false;
  var kobleFra = null;

  function veksleRedigering(pa) {
    if (pa === undefined) pa = !redigerer;
    if (!pa) avsluttSkriv(true);
    redigerer = pa;
    root.classList.toggle('k-editing', pa);
    lukkPopover();
    if (pa) {
      oversikt = false; parkert = null;
      root.classList.remove('k-oversikt', 'k-fri-visning', 'k-skjul-ui', 'k-idle', 'k-vis-notater', 'k-laser-pa', 'k-lys-pa');
      settAktiv(null); settMaal(null); settStemning(null);
      if (!sisteBilde) sisteBilde = JSON.stringify(doc);
    } else {
      velg(null);
      avbrytKobling();
      if (!doc.sti.length) toast('Legg minst én ramme i stien for å presentere.');
    }
    byggDokk();
    byggPanel();
    tegnSti();
    tegnKoblinger();
    byggMerker();
    if (!pa) gaTil(pos, { behold: true, type: 'fly' });
    else if (!friVisning && doc.sti.length) flyTil(visningFor(doc.sti[pos]), { varighet: 700 });
  }

  function velg(id) {
    if (skriv && (!id || skriv.f.id !== id)) avsluttSkriv(true);
    if (valgt && els[valgt]) els[valgt].classList.remove('k-valgt');
    valgt = id && ramme(id) ? id : null;
    if (valgt) valgtKobling = -1;
    if (valgt && els[valgt]) els[valgt].classList.add('k-valgt');
    lukkPopover();
    byggPanel();
    byggVerktoy();
    tegnKoblinger();
    oppdaterMarkering();
  }
  function velgKobling(i) {
    avsluttSkriv(true);
    if (valgt && els[valgt]) els[valgt].classList.remove('k-valgt');
    valgt = null;
    valgtKobling = i;
    lukkPopover();
    byggPanel();
    byggVerktoy();
    tegnKoblinger();
    oppdaterMarkering();
  }

  /* ---------- Markering, merker, hover ---------- */

  function hjornerPaSkjerm(f) {
    var s = str(f), hw = s[0] * f.s / 2, hh = s[1] * f.s / 2;
    return [[-hw, -hh], [hw, -hh], [hw, hh], [-hw, hh]].map(function (c) { var q = rot(c[0], c[1], f.r); return tilSkjerm(f.x + q.x, f.y + q.y); });
  }
  function plasserBoks(el, f) {
    var s = str(f), c = tilSkjerm(f.x, f.y);
    el.style.width = (s[0] * f.s * cam.z) + 'px';
    el.style.height = (s[1] * f.s * cam.z) + 'px';
    el.style.transform = 'translate(' + c.x + 'px,' + c.y + 'px) rotate(' + (f.r - cam.r) + 'deg) translate(-50%,-50%)';
  }
  function oppdaterMarkering() {
    var f = valgt && ramme(valgt);
    if (!f || !redigerer) { sel.classList.remove('k-pa'); }
    else { sel.classList.add('k-pa'); plasserBoks(sel, f); }
    plasserVerktoy();
  }
  var hoverId = null;
  function visHover(id) {
    hoverId = id && id !== valgt ? id : null;
    var f = hoverId && ramme(hoverId);
    hoverBoks.classList.toggle('k-pa', !!f && redigerer);
    if (f) plasserBoks(hoverBoks, f);
  }

  var merkeEls = {};
  function byggMerker() {
    merker.textContent = '';
    merkeEls = {};
    if (!redigerer) return;
    doc.rammer.forEach(function (f) {
      var i = doc.sti.indexOf(f.id);
      var m = h('button', { class: 'k-merke' + (i < 0 ? ' k-utenfor' : ''), type: 'button', title: i < 0 ? 'Ikke i stien – klikk for å legge til' : 'Steg ' + (i + 1) + ' – klikk for å velge', text: i < 0 ? '+' : String(i + 1) });
      m.addEventListener('pointerdown', function (e) { e.stopPropagation(); });
      m.addEventListener('click', function (e) {
        e.stopPropagation();
        if (i < 0) veksleSti(f.id); else velg(f.id);
      });
      merker.append(m);
      merkeEls[f.id] = m;
    });
    oppdaterMerker();
  }
  function oppdaterMerker() {
    if (!redigerer) return;
    doc.rammer.forEach(function (f) {
      var m = merkeEls[f.id];
      if (!m) return;
      var s = str(f), bredde = s[0] * f.s * cam.z;
      if (bredde < 60) { m.style.display = 'none'; return; }
      m.style.display = '';
      var q = rot(-s[0] * f.s / 2, -s[1] * f.s / 2, f.r), p = tilSkjerm(f.x + q.x, f.y + q.y);
      m.style.transform = 'translate(' + (p.x - 12) + 'px,' + (p.y - 40) + 'px)';
    });
  }

  /* ---------- Verktøylinje ved valgt ramme ---------- */

  function byggVerktoy() {
    verktoy.textContent = '';
    verktoy.classList.remove('k-pa');
    if (!redigerer) return;
    var f = valgt && ramme(valgt);
    if (f) {
      verktoy.append(
        knapp('tekst', 'Skriv', function () { var b = $('[data-l]', els[f.id]); if (b) startSkriv(f, b, null, true); else fokuserTekst(true); }),
        h('span', { class: 'k-sep' }),
        ikonKnapp('form', 'Form', function (e) { visPopover(e.currentTarget, valgPanel(FORMER, f.form, function (v) { endreRamme(f, function () { f.form = v; if (v !== 'fri' || !/^!\[/.test(f.tekst.trim())) { delete f.w; delete f.h; } }); })); }),
        ikonKnapp('ramme', 'Rammestil', function (e) { visPopover(e.currentTarget, valgPanel(RAMMESTILER, f.stil || '', function (v) { endreRamme(f, function () { if (v) f.stil = v; else delete f.stil; }); }, 'Som resten')); }),
        ikonKnapp('farge', 'Farge', function (e) { visPopover(e.currentTarget, fargePanel(f)); }),
        ikonKnapp('magi', 'Animasjon', function (e) { visPopover(e.currentTarget, valgPanel(INNGANGER, f.inn || '', function (v) { endreRamme(f, function () { if (v) f.inn = v; else delete f.inn; }); forhandsvis(f.id); }, 'Som resten')); }),
        ikonKnapp('overgang', 'Kameraovergang hit', function (e) { visPopover(e.currentTarget, valgPanel(OVERGANGER, f.overgang || '', function (v) { if (v) f.overgang = v; else delete f.overgang; lagreHistorikk(); byggPanel(); }, 'Som resten')); }),
        ikonKnapp('steg', f.steg ? 'Punkter ett og ett: på' : 'Punkter ett og ett: av', function () { endreRamme(f, function () { f.steg = !f.steg; if (!f.steg) delete f.steg; }); byggVerktoy(); }, { class: 'k-btn' + (f.steg ? ' k-pa-knapp' : '') }),
        ikonKnapp('lenke', 'Koble til en annen ramme', function () { startKobling(f.id); }),
        ikonKnapp('play', 'Forhåndsvis animasjonen', function () { forhandsvis(f.id); }),
        ikonKnapp('mer', 'Mer', function (e) { visPopover(e.currentTarget, merPanel(f)); }),
        ikonKnapp('slett', 'Slett', slettValgt, { class: 'k-btn k-fare' })
      );
    } else if (valgtKobling >= 0 && doc.koblinger[valgtKobling]) {
      var k = doc.koblinger[valgtKobling];
      var inp = h('input', { type: 'text', class: 'k-kob-input', value: k.tekst || '', placeholder: 'Tekst på pila', 'aria-label': 'Tekst på pila' });
      inp.addEventListener('input', function () { k.tekst = inp.value; if (!k.tekst) delete k.tekst; tegnKoblinger(); senereHistorikk(); });
      var seg = h('div', { class: 'k-seg k-seg-liten' });
      [['pil', 'Pil'], ['linje', 'Linje'], ['stiplet', 'Stiplet']].forEach(function (o) {
        seg.append(h('button', { type: 'button', 'aria-pressed': String((k.form || 'pil') === o[0]), text: o[1], onclick: function () { k.form = o[0]; tegnKoblinger(); lagreHistorikk(); byggVerktoy(); } }));
      });
      verktoy.append(seg, inp,
        ikonKnapp('overgang', 'Bøy andre veien', function () { k.bue = -(typeof k.bue === 'number' ? k.bue : 0.18); tegnKoblinger(); lagreHistorikk(); }),
        ikonKnapp('slett', 'Slett koblingen', function () { doc.koblinger.splice(valgtKobling, 1); valgtKobling = -1; tegnKoblinger(); lagreHistorikk(); byggVerktoy(); }, { class: 'k-btn k-fare' }));
    } else return;
    verktoy.classList.add('k-pa');
    plasserVerktoy();
  }
  function plasserVerktoy() {
    if (!verktoy.classList.contains('k-pa')) return;
    var pkt;
    var f = valgt && ramme(valgt);
    if (f) pkt = hjornerPaSkjerm(f);
    else if (valgtKobling >= 0) {
      var k = doc.koblinger[valgtKobling], a = k && ramme(k.fra), b = k && ramme(k.til);
      if (!a || !b) return;
      var m = tilSkjerm((a.x + b.x) / 2, (a.y + b.y) / 2);
      pkt = [{ x: m.x, y: m.y - 30 }, { x: m.x, y: m.y + 30 }];
    } else return;
    var minY = Math.min.apply(null, pkt.map(function (p) { return p.y; }));
    var maxY = Math.max.apply(null, pkt.map(function (p) { return p.y; }));
    var cx = pkt.reduce(function (s, p) { return s + p.x; }, 0) / pkt.length;
    var vw = verktoy.offsetWidth, vh = verktoy.offsetHeight;
    var hoyre = panelPa() ? W - PANEL : W;
    var x = clamp(cx - vw / 2, 12, hoyre - vw - 12);
    var y = minY - vh - 52;
    if (y < 12) y = maxY + 22;
    if (y + vh > H - 84) y = clamp(minY + 12, 12, H - vh - 84);
    verktoy.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
  }

  function valgPanel(valg, aktiv, onvelg, standardTekst) {
    var boks = h('div', { class: 'k-valg' });
    if (standardTekst) boks.append(h('button', { type: 'button', class: 'k-chip' + (!aktiv ? ' k-pa' : ''), text: standardTekst, onclick: function () { onvelg(''); lukkPopover(); } }));
    Object.keys(valg).forEach(function (k) {
      boks.append(h('button', { type: 'button', class: 'k-chip' + (aktiv === k ? ' k-pa' : ''), text: valg[k], onclick: function () { onvelg(k); $$('.k-chip', boks).forEach(function (c) { c.classList.remove('k-pa'); }); this.classList.add('k-pa'); } }));
    });
    return boks;
  }
  function fargeRad(aktiv, onvelg, autoTekst) {
    var p = aktivStil().p;
    var rad = h('div', { class: 'k-farger' });
    rad.append(h('button', { type: 'button', class: 'k-auto', title: autoTekst, 'aria-label': autoTekst, 'aria-pressed': String(!aktiv), onclick: function () { onvelg(null); } }));
    [p.a1, p.a2, p.a3, p.ink, '#ff5d8f', '#ffd94a', '#4cc3ff', '#5ef2c5', '#ff8a5b', '#9a86ff'].forEach(function (c) {
      rad.append(h('button', { type: 'button', title: c, 'aria-label': 'Farge ' + c, style: { background: c }, 'aria-pressed': String(aktiv === c), onclick: function () { onvelg(c); } }));
    });
    var egen = h('input', { type: 'color', value: /^#[0-9a-f]{6}$/i.test(aktiv || '') ? aktiv : p.a1, title: 'Egen farge', 'aria-label': 'Egen farge' });
    egen.addEventListener('input', function () { onvelg(egen.value, true); });
    rad.append(egen);
    return rad;
  }
  function fargePanel(f) {
    var boks = h('div', { class: 'k-fargepanel' });
    boks.append(h('div', { class: 'k-etikett', text: 'Uthevingsfarge' }), fargeRad(f.farge, function (c, levende) {
      endreRamme(f, function () { if (c) f.farge = c; else delete f.farge; }, levende);
    }, 'Som resten'));
    boks.append(h('div', { class: 'k-etikett', text: 'Stemning – bakgrunnen får denne fargen her' }), fargeRad(f.stemning, function (c, levende) {
      if (c) f.stemning = c; else delete f.stemning;
      settStemning(c || null);
      if (levende) senereHistorikk(); else lagreHistorikk();
    }, 'Ingen'));
    return boks;
  }
  function merPanel(f) {
    var i = doc.sti.indexOf(f.id);
    return h('div', { class: 'k-valg k-valg-liste' },
      knapp('sti', i >= 0 ? 'Ta ut av stien' : 'Legg i stien', function () { veksleSti(f.id); lukkPopover(); }),
      knapp('detalj', 'Gjem en detalj inni', function () { lukkPopover(); detaljInni(f); }),
      knapp('kopi', 'Dupliser (Ctrl+D)', function () { lukkPopover(); dupliser(); }),
      knapp('sikt', 'Zoom hit', function () { lukkPopover(); flyTil(rammeVisning(f)); }),
      knapp('magi', f.feiring ? 'Konfetti ved ankomst: på' : 'Konfetti ved ankomst', function () { f.feiring = !f.feiring; if (!f.feiring) delete f.feiring; lagreHistorikk(); lukkPopover(); toast(f.feiring ? 'Konfetti når du kommer hit.' : 'Konfetti er slått av.'); }),
      knapp('notat', 'Notater', function () { lukkPopover(); root.classList.remove('k-panel-skjult'); var n = $('#k-notat', panel); if (n) n.focus(); })
    );
  }

  function forhandsvis(id) {
    var el = els[id], f = ramme(id);
    if (!el || !f) return;
    el.classList.remove('k-forhand', 'k-aktiv');
    void el.offsetWidth;
    el.classList.add('k-forhand', 'k-aktiv');
    $$('.k-steg', el).forEach(function (x) { x.classList.add('k-vis'); });
    $$('.k-kobling', kobGruppe).forEach(function (g) { var k = doc.koblinger[+g.getAttribute('data-i')]; if (k && (k.til === id || k.fra === id)) { g.classList.remove('k-tegn'); void g.getBoundingClientRect(); g.classList.add('k-tegn', 'k-forhand'); } });
    stoppEffekter();
    startEffekter(el, f);
    clearTimeout(el._forhand);
    el._forhand = setTimeout(function () {
      el.classList.remove('k-forhand', 'k-aktiv');
      $$('.k-steg', el).forEach(function (x) { x.classList.remove('k-vis'); });
      $$('.k-kobling.k-forhand', kobGruppe).forEach(function (g) { g.classList.remove('k-forhand', 'k-tegn'); });
    }, 3200);
  }

  /* ---------- Historikk ---------- */

  function lagreHistorikk() {
    var na = JSON.stringify(doc);
    if (sisteBilde === null) { sisteBilde = na; return; }
    if (na === sisteBilde) return;
    historikk.push(sisteBilde);
    if (historikk.length > 150) historikk.shift();
    sisteBilde = na;
    fremtid = [];
    ulagret = true;
    lagreUtkast();
    oppdaterStatus();
  }
  function settDoc(json) {
    avsluttSkriv(false);
    doc = normaliser(JSON.parse(json));
    sisteBilde = json;
    if (valgt && !ramme(valgt)) valgt = null;
    if (valgtKobling >= doc.koblinger.length) valgtKobling = -1;
    pos = clamp(pos, 0, Math.max(0, doc.sti.length - 1));
    brukStil();
    byggVerden();
    byggPanel();
    byggVerktoy();
    oppdaterStatus();
    ulagret = true;
    lagreUtkast();
  }
  function angre() { if (!historikk.length) return; fremtid.push(sisteBilde); settDoc(historikk.pop()); }
  function gjorOm() { if (!fremtid.length) return; historikk.push(sisteBilde); settDoc(fremtid.pop()); }
  var utkastTimer = null;
  function lagreUtkast() {
    clearTimeout(utkastTimer);
    utkastTimer = setTimeout(function () { lager.set(UTKAST, JSON.stringify({ tid: Date.now(), doc: doc })); }, 400);
  }
  var tekstTimer = null;
  function senereHistorikk() { clearTimeout(tekstTimer); tekstTimer = setTimeout(lagreHistorikk, 650); }

  function oppdaterRamme(f, innhold) {
    var el = els[f.id];
    if (!el) return;
    if (innhold) fyll(el, f);
    plasser(el, f);
  }
  function endreRamme(f, endring, levende) {
    endring();
    oppdaterRamme(f, true);
    tegnSti(); tegnKoblinger();
    if (levende) senereHistorikk(); else lagreHistorikk();
    byggPanel();
    oppdaterMarkering();
  }

  /* ---------- Nye rammer ---------- */

  var MALER = [
    { id: 'tittel', navn: 'Tittel', form: 'kort', tekst: '### Etikett\n# Stor tittel\nEn kort undertekst som setter tonen.' },
    { id: 'punkter', navn: 'Punkter', form: 'kort', steg: true, tekst: '## Tre ting å huske\n- Første poeng\n- Andre poeng\n- Tredje poeng' },
    { id: 'tall', navn: 'Stort tall', form: 'sirkel', tekst: '!! 87 % | av noe som betyr mye' },
    { id: 'sitat', navn: 'Sitat', form: 'fri', tekst: '> Et sitat som setter seg fast.\n— Navn Navnesen' },
    { id: 'kolonner', navn: 'Sammenligning', form: 'kort', tekst: '## Før og etter\n||\n### Før\nSlik var det.\n||\n### Etter\nSlik ble det.' },
    { id: 'prosess', navn: 'Prosess', form: 'fri', tekst: '## Slik gjør du det\n-> Start\n-> Underveis\n-> Mål' },
    { id: 'diagram', navn: 'Diagram', form: 'kort', tekst: '## Hva velger folk?\n:: Alternativ A | 64 %\n:: Alternativ B | 23 %\n:: Alternativ C | 13 %' },
    { id: 'ide', navn: 'Idé', form: 'blob', tekst: '💡\n## En stor idé\nForklar den med én setning.' },
    { id: 'ord', navn: 'Ord på lerretet', form: 'fri', stil: 'ingen', tekst: '# Ett ord' },
    { id: 'lapp', navn: 'Lapp', form: 'kort', stil: 'lapp', w: 900, h: 900, tekst: '## Husk!\nSkriv noe kort her.' },
    { id: 'roter', navn: 'Skiftende ord', form: 'fri', stil: 'ingen', tekst: '# Vi lager {{presentasjoner|historier|reiser}}' },
    { id: 'merket', navn: 'Med markering', form: 'kort', tekst: '## Det __viktigste__ først\nSett ((ring rundt)) det som teller, og ~~stryk~~ det som ikke gjør det.' }
  ];

  function visMaler(kilde) {
    var boks = h('div', { class: 'k-maler' });
    MALER.forEach(function (m) {
      var flis = h('button', { type: 'button', class: 'k-mal', title: m.navn, onclick: function () { lukkPopover(); nyRamme(m); } });
      var vindu = h('div', { class: 'k-mal-vindu' });
      var falsk = { id: 'mal-' + m.id, form: m.form, stil: m.stil, tekst: m.tekst, w: m.w, h: m.h, x: 0, y: 0, s: 1, r: 0, steg: false };
      var el = h('div');
      vindu.append(el);
      flis.append(vindu, h('span', { text: m.navn }));
      boks.append(flis);
      el._f = falsk;
    });
    boks.append(
      h('button', { type: 'button', class: 'k-mal k-mal-spesial', onclick: function () { lukkPopover(); var f = valgt ? ramme(valgt) : ramme(aktivEllerPos()); if (f) detaljInni(f); else toast('Velg en ramme først, så gjemmer jeg en detalj inni den.'); } }, h('div', { class: 'k-mal-vindu', html: ikon('detalj') }), h('span', { text: 'Gjemt detalj' })),
      h('button', { type: 'button', class: 'k-mal k-mal-spesial', onclick: function () { lukkPopover(); velgBilde(); } }, h('div', { class: 'k-mal-vindu', html: ikon('bilde') }), h('span', { text: 'Bilde' }))
    );
    visPopover(kilde, boks, 'over');
    $$('.k-mal-vindu', boks).forEach(function (v) {
      var el = v.firstElementChild;
      if (!el || !el._f) return;
      fyll(el, el._f);
      var s = str(el._f), k = Math.min(150 / s[0], 86 / s[1]);
      el.style.transform = 'translate(-50%,-50%) scale(' + k + ')';
      el.style.left = '50%'; el.style.top = '50%';
      tilpass(el);
    });
  }
  function aktivEllerPos() { return aktivId || (typeof doc.sti[pos] === 'string' ? doc.sti[pos] : null); }

  function overlapper(x, y, w, hh, unntak) {
    var a = { x0: x - w / 2, x1: x + w / 2, y0: y - hh / 2, y1: y + hh / 2 };
    return doc.rammer.some(function (o) {
      if (unntak && unntak(o)) return false;
      var b = boks([o]);
      var mx = Math.min(w, b.w) * 0.06, my = Math.min(hh, b.h) * 0.06;
      return a.x0 < b.x1 + mx && a.x1 > b.x0 - mx && a.y0 < b.y1 + my && a.y1 > b.y0 - my;
    });
  }
  function finnPlass(ref, w, hh) {
    if (!ref) {
      var m = midtpunkt();
      return { x: m.x, y: m.y, r: Math.round(cam.r) };
    }
    var s = str(ref), rw = s[0] * ref.s, rh = s[1] * ref.s;
    var forfedre = function (o) { return o === ref ? false : inneholder(o, ref); };
    var retninger = [[1, 0], [1, 0.7], [0, 1], [-1, 0.7], [-1, 0], [0, -1], [1, -0.7], [-1, -0.7]];
    for (var ring = 0; ring < 5; ring++) {
      for (var i = 0; i < retninger.length; i++) {
        var d = retninger[i];
        var ox = d[0] * ((rw + w) / 2 * 1.15 + ring * w * 1.2);
        var oy = d[1] * ((rh + hh) / 2 * 1.2 + ring * hh * 1.25);
        var q = rot(ox, oy, ref.r);
        var x = ref.x + q.x, y = ref.y + q.y;
        if (!overlapper(x, y, w, hh, forfedre)) return { x: Math.round(x), y: Math.round(y), r: ref.r };
      }
    }
    var b = boks(doc.rammer);
    return { x: Math.round(b.x1 + w), y: Math.round(b.cy), r: 0 };
  }

  function nyRamme(m) {
    m = m || MALER[0];
    var ref = valgt ? ramme(valgt) : ramme(aktivEllerPos());
    var f = { id: uid(), form: m.form || 'kort', tekst: m.tekst || '' };
    if (m.stil) f.stil = m.stil;
    if (m.steg) f.steg = true;
    if (m.w) { f.w = m.w; f.h = m.h; }
    var s0 = str(f);
    var skala;
    if (ref) skala = ref.s * str(ref)[0] * (f.form === 'sirkel' || f.form === 'blob' ? 0.55 : 0.8) / s0[0];
    else skala = ((panelPa() ? W - PANEL : W) / cam.z) * 0.5 / s0[0];
    f.s = +skala.toPrecision(3);
    var p = finnPlass(ref, s0[0] * f.s, s0[1] * f.s);
    f.x = p.x; f.y = p.y; f.r = p.r || 0;
    if (ref && !m.stil && f.form === 'kort') f.r = Math.round((ref.r || 0) + (Math.random() - 0.5) * 6);
    doc.rammer.push(f);
    var refI = ref ? doc.sti.indexOf(ref.id) : -1;
    var inn = refI >= 0 ? refI + 1 : Math.min(pos + 1, doc.sti.length);
    doc.sti.splice(inn, 0, f.id);
    pos = inn;
    byggVerden();
    lagreHistorikk();
    velg(f.id);
    var v = rammeVisning(f);
    v.z *= 0.75;
    flyTil(v, { varighet: 900 });
    var forste = $('h1[data-l], h2[data-l], p[data-l], .k-stat[data-l], blockquote[data-l]', els[f.id]);
    if (forste) setTimeout(function () { if (valgt === f.id) startSkriv(f, $('[data-l="' + forste.getAttribute('data-l') + '"]', els[f.id]), null, true); }, 950);
    return f;
  }
  function detaljInni(ref) {
    var s = str(ref);
    var o = rot(s[0] * ref.s * 0.36, s[1] * ref.s * 0.3, ref.r);
    var f = { id: uid(), form: 'sirkel', x: Math.round(ref.x + o.x), y: Math.round(ref.y + o.y), r: ref.r + 6, s: +(ref.s * s[0] / 1000 * 0.1).toPrecision(3), tekst: '### Detalj\n## Zoom inn\nGjemt til du kommer hit.' };
    doc.rammer.push(f);
    var i = doc.sti.indexOf(ref.id);
    doc.sti.splice(i >= 0 ? i + 1 : doc.sti.length, 0, f.id);
    byggVerden(); lagreHistorikk(); velg(f.id);
    flyTil(rammeVisning(f), { type: 'dykk' });
    toast('En liten ramme er gjemt inni. Den synes først når kameraet dykker inn.');
  }
  function fokuserTekst(merkAlt) {
    root.classList.remove('k-panel-skjult');
    var ta = $('#k-innhold', panel);
    if (!ta) return;
    ta.focus();
    if (merkAlt) ta.select();
  }
  function slettValgt() {
    if (!valgt) return;
    var id = valgt;
    avsluttSkriv(false);
    doc.rammer = doc.rammer.filter(function (f) { return f.id !== id; });
    doc.sti = doc.sti.filter(function (e) { return e !== id; });
    doc.koblinger = doc.koblinger.filter(function (k) { return k.fra !== id && k.til !== id; });
    valgt = null;
    pos = clamp(pos, 0, Math.max(0, doc.sti.length - 1));
    byggVerden(); lagreHistorikk(); byggPanel(); byggVerktoy(); oppdaterMarkering();
    toast('Rammen er slettet.', [{ tekst: 'Angre', fn: angre }]);
  }
  function dupliser() {
    var f = valgt && ramme(valgt);
    if (!f) return;
    var ny = JSON.parse(JSON.stringify(f));
    ny.id = uid();
    var s = str(f), p = finnPlass(f, s[0] * f.s, s[1] * f.s);
    ny.x = p.x; ny.y = p.y;
    doc.rammer.push(ny);
    var i = doc.sti.indexOf(f.id);
    if (i >= 0) doc.sti.splice(i + 1, 0, ny.id);
    byggVerden(); lagreHistorikk(); velg(ny.id);
  }
  function iSti(id) { return doc.sti.indexOf(id) >= 0; }
  function veksleSti(id) {
    if (iSti(id)) doc.sti = doc.sti.filter(function (e) { return e !== id; });
    else doc.sti.splice(Math.min(pos + 1, doc.sti.length), 0, id);
    pos = clamp(pos, 0, Math.max(0, doc.sti.length - 1));
    tegnSti(); lagreHistorikk(); byggPanel(); byggMerker(); byggVerktoy();
  }

  /* ---------- Koblinger ---------- */

  var koblingsToast = null;
  function startKobling(id) {
    kobleFra = id;
    root.classList.add('k-kobler');
    if (koblingsToast) koblingsToast();
    koblingsToast = toast('Klikk rammen pila skal gå til. Esc avbryter.', null, 0);
  }
  function avbrytKobling() {
    kobleFra = null;
    root.classList.remove('k-kobler');
    if (koblingsToast) { koblingsToast(); koblingsToast = null; }
  }
  function fullforKobling(til) {
    var fra = kobleFra;
    avbrytKobling();
    if (!fra || fra === til) return;
    doc.koblinger.push({ fra: fra, til: til, form: 'pil' });
    tegnKoblinger();
    lagreHistorikk();
    velgKobling(doc.koblinger.length - 1);
    var inp = $('.k-kob-input', verktoy);
    if (inp) inp.focus();
  }

  /* ---------- Skriv rett i rammen ---------- */

  var skriv = null;
  function startSkriv(f, blokk, punkt, merkAlt) {
    avsluttSkriv(true);
    if (!f || !blokk || !els[f.id] || !els[f.id].contains(blokk)) return;
    if (blokkTilMd(blokk) === null) { velg(f.id); fokuserTekst(false); return; }
    if (valgt !== f.id) velg(f.id);
    var l = (blokk.getAttribute('data-l') || '').split('-').map(Number);
    if (!(l.length === 2 && isFinite(l[0]))) return;
    skriv = { f: f, blokk: blokk, a: l[0], b: l[1] };
    $$('svg, .k-roter', blokk).forEach(function (n) { n.setAttribute('contenteditable', 'false'); });
    try { blokk.contentEditable = 'plaintext-only'; } catch (e) { /* eldre nettleser */ }
    if (blokk.contentEditable !== 'plaintext-only') blokk.contentEditable = 'true';
    blokk.classList.add('k-skriver');
    root.classList.add('k-skrivemodus');
    blokk.addEventListener('keydown', skrivTast);
    blokk.addEventListener('input', skrivInput);
    blokk.addEventListener('blur', skrivBlur);
    blokk.addEventListener('paste', limInnRen);
    blokk.focus({ preventScroll: true });
    var s = window.getSelection();
    var rng0 = null;
    if (punkt && document.caretRangeFromPoint) rng0 = document.caretRangeFromPoint(punkt.x, punkt.y);
    else if (punkt && document.caretPositionFromPoint) { var cp = document.caretPositionFromPoint(punkt.x, punkt.y); if (cp) { rng0 = document.createRange(); rng0.setStart(cp.offsetNode, cp.offset); } }
    if (!rng0 || !blokk.contains(rng0.startContainer) || merkAlt) { rng0 = document.createRange(); rng0.selectNodeContents(blokk); if (!merkAlt) rng0.collapse(false); }
    s.removeAllRanges(); s.addRange(rng0);
    lukkPopover();
  }
  function skrivTast(e) {
    var t = skriv && skriv.blokk;
    if (!t) return;
    var mod0 = e.ctrlKey || e.metaKey;
    if (mod0 && /^[bi]$/i.test(e.key)) { e.preventDefault(); pakkInn(e.key.toLowerCase() === 'b' ? 'strong' : 'em'); return; }
    if (mod0 && e.key.toLowerCase() === 'z') { e.preventDefault(); avsluttSkriv(true); angre(); return; }
    if (e.key === 'Escape') { e.preventDefault(); avsluttSkriv(true); return; }
    if (e.key === 'Tab') { e.preventDefault(); nesteBlokk(e.shiftKey ? -1 : 1); return; }
    if (e.key !== 'Enter') return;
    var tag = t.tagName;
    if ((tag === 'UL' || tag === 'OL') && !e.shiftKey) {
      e.preventDefault();
      var s = window.getSelection(), li = s.anchorNode && (s.anchorNode.nodeType === 1 ? s.anchorNode : s.anchorNode.parentNode).closest('li');
      if (!li || !t.contains(li)) return;
      if (!li.textContent.trim() && li === t.lastElementChild) { li.remove(); avsluttSkriv(true); return; }
      var ny = document.createElement('li');
      ny.append(document.createTextNode('​'));
      li.after(ny);
      var r = document.createRange(); r.setStart(ny.firstChild, 1); r.collapse(true);
      s.removeAllRanges(); s.addRange(r);
      skrivInput();
      return;
    }
    if (e.shiftKey && (tag === 'P' || tag === 'BLOCKQUOTE')) { e.preventDefault(); document.execCommand('insertLineBreak'); return; }
    e.preventDefault();
    avsluttSkriv(true);
  }
  function nesteBlokk(retning) {
    if (!skriv) return;
    var f = skriv.f, alle = $$('[data-l]', els[f.id]), i = alle.indexOf(skriv.blokk);
    avsluttSkriv(true);
    var nyeAlle = $$('[data-l]', els[f.id]);
    var neste = nyeAlle[clamp(i + retning, 0, nyeAlle.length - 1)];
    if (neste) startSkriv(f, neste, null, true);
  }
  function pakkInn(tag) {
    var s = window.getSelection();
    if (!s.rangeCount) return;
    var r = s.getRangeAt(0);
    if (r.collapsed) return;
    var el = document.createElement(tag);
    try { r.surroundContents(el); } catch (e) { el.append(r.extractContents()); r.insertNode(el); }
    s.removeAllRanges();
    var nr = document.createRange(); nr.selectNodeContents(el); s.addRange(nr);
    skrivInput();
  }
  function limInnRen(e) {
    var tekst = e.clipboardData && e.clipboardData.getData('text/plain');
    if (tekst == null) return;
    e.preventDefault();
    document.execCommand('insertText', false, tekst.replace(/\r?\n/g, ' '));
  }
  function skrivInput() { if (skriv && els[skriv.f.id]) tilpass(els[skriv.f.id]); }
  function skrivBlur() { setTimeout(function () { if (skriv && document.activeElement !== skriv.blokk) avsluttSkriv(true); }, 0); }
  function avsluttSkriv(lagreDet) {
    if (!skriv) return;
    var s = skriv;
    skriv = null;
    var b = s.blokk;
    b.removeEventListener('keydown', skrivTast);
    b.removeEventListener('input', skrivInput);
    b.removeEventListener('blur', skrivBlur);
    b.removeEventListener('paste', limInnRen);
    b.removeAttribute('contenteditable');
    b.classList.remove('k-skriver');
    root.classList.remove('k-skrivemodus');
    if (lagreDet) {
      var nye = blokkTilMd(b);
      if (nye) {
        nye = nye.map(function (l) { return l.replace(/​/g, ''); }).filter(function (l) { return l.trim() && !/^(#{1,3}|-|\d+\.|>|!!|->|::)\s*$/.test(l.trim()); });
        var linjer = s.f.tekst.split('\n');
        linjer.splice.apply(linjer, [s.a, s.b - s.a + 1].concat(nye));
        var ny = linjer.join('\n').replace(/\n{3,}/g, '\n\n').replace(/^\n+|\n+$/g, '');
        if (ny !== s.f.tekst) { s.f.tekst = ny; lagreHistorikk(); }
      }
    }
    if (els[s.f.id]) { fyll(els[s.f.id], s.f); }
    var ta = $('#k-innhold', panel);
    if (ta && valgt === s.f.id) ta.value = s.f.tekst;
    var hd = $('.k-panel-hode h3', panel);
    if (hd && valgt === s.f.id) hd.textContent = tittelPa(s.f);
    oppdaterMarkering();
  }

  /* ---------- Snapping med hjelpelinjer ---------- */

  function snap(g, ny) {
    var f = g.f, s = str(f), hw = s[0] * ny.s / 2, hh = s[1] * ny.s / 2;
    var terskel = 8 / cam.z;
    var kx = [], ky = [];
    doc.rammer.forEach(function (o) {
      if (o === f || inneholder(o, f) || g.barn.some(function (b) { return b.f === o; })) return;
      var so = str(o), ow = so[0] * o.s / 2, oh = so[1] * o.s / 2;
      kx.push(o.x, o.x - ow, o.x + ow); ky.push(o.y, o.y - oh, o.y + oh);
    });
    function best(egne, kand) {
      var b = null;
      egne.forEach(function (e) { kand.forEach(function (c) { var d = c - e; if (Math.abs(d) < terskel && (!b || Math.abs(d) < Math.abs(b.d))) b = { d: d, linje: c }; }); });
      return b;
    }
    var bx = Math.abs(vinkelDiff(0, cam.r)) < 1 ? best([ny.x, ny.x - hw, ny.x + hw], kx) : null;
    var by = Math.abs(vinkelDiff(0, cam.r)) < 1 ? best([ny.y, ny.y - hh, ny.y + hh], ky) : null;
    if (bx) ny.x += bx.d;
    if (by) ny.y += by.d;
    visGuide(guideX, bx && bx.linje, true);
    visGuide(guideY, by && by.linje, false);
    return ny;
  }
  function visGuide(el, v, vertikal) {
    if (v == null) { el.classList.remove('k-pa'); return; }
    el.classList.add('k-pa');
    var lengde = 6000 / cam.z, tykk = 1.5 / cam.z;
    if (vertikal) { el.style.left = (v - tykk / 2) + 'px'; el.style.top = (cam.y - lengde / 2) + 'px'; el.style.width = tykk + 'px'; el.style.height = lengde + 'px'; }
    else { el.style.top = (v - tykk / 2) + 'px'; el.style.left = (cam.x - lengde / 2) + 'px'; el.style.height = tykk + 'px'; el.style.width = lengde + 'px'; }
  }
  function skjulGuider() { guideX.classList.remove('k-pa'); guideY.classList.remove('k-pa'); }

  /* ---------- Ordne rammene automatisk ---------- */

  function ordne(type) {
    var sett = {}, liste = [];
    doc.sti.forEach(function (e) { if (typeof e === 'string' && !sett[e]) { sett[e] = 1; liste.push(ramme(e)); } });
    doc.rammer.forEach(function (f) { if (!sett[f.id]) liste.push(f); });
    liste = liste.filter(Boolean);
    if (!liste.length) return;
    if (type === 'reise') {
      var x = 0;
      liste.forEach(function (f, i) {
        f.s = i === 0 ? 1 : 0.62; f.r = i === 0 ? 0 : (i % 2 ? -1 : 1) * (2 + (i % 3) * 2);
        var w = str(f)[0] * f.s;
        if (i > 0) x += w / 2 + (i === 1 ? 800 : 420);
        f.x = Math.round(x); f.y = Math.round(i === 0 ? 0 : Math.sin(i * 1.25) * 520);
        x += w / 2;
      });
    } else if (type === 'spiral') {
      var cx = 0, cy = 0, s = 1.2, retning = 0, forrigeS = null;
      liste.forEach(function (f, i) {
        f.s = +s.toPrecision(3); f.r = 0;
        if (i > 0) {
          var a = str(liste[i - 1]), b = str(f);
          var dx = [1, 0, -1, 0][retning], dy = [0, 1, 0, -1][retning];
          var avstand = dx ? (a[0] * forrigeS + b[0] * f.s) / 2 * 1.06 : (a[1] * forrigeS + b[1] * f.s) / 2 * 1.08;
          cx += dx * avstand; cy += dy * avstand;
          retning = (retning + 1) % 4;
        }
        f.x = Math.round(cx); f.y = Math.round(cy);
        forrigeS = f.s; s *= 0.58;
      });
    } else if (type === 'dykk') {
      liste.forEach(function (f, i) {
        if (i === 0) { f.x = 0; f.y = 0; f.s = 1; f.r = 0; return; }
        var p = liste[i - 1], ps = str(p);
        f.s = +(p.s * 0.17).toPrecision(3);
        var o = rot(ps[0] * p.s * 0.37, ps[1] * p.s * 0.31, p.r);
        f.x = p.x + o.x; f.y = p.y + o.y; f.r = p.r + (i % 2 ? 8 : -6);
      });
    } else if (type === 'bane') {
      var midt = liste[0];
      midt.x = 0; midt.y = 0; midt.s = 1; midt.r = 0;
      var n = liste.length - 1, R = 1900 + n * 90;
      liste.slice(1).forEach(function (f, i) {
        var a = -Math.PI / 2 + i / n * Math.PI * 2;
        f.s = 0.5; f.x = Math.round(Math.cos(a) * R * 1.25); f.y = Math.round(Math.sin(a) * R * 0.8);
        f.r = Math.round(Math.cos(a) * 6);
      });
    } else if (type === 'tidslinje') {
      liste.forEach(function (f, i) {
        f.s = i === 0 ? 0.9 : 0.55; f.r = 0;
        f.x = i * 1150; f.y = i === 0 ? 0 : (i % 2 ? -560 : 560);
      });
    } else {
      var kol = Math.ceil(Math.sqrt(liste.length));
      liste.forEach(function (f, i) { f.s = 1; f.r = 0; f.x = (i % kol) * 1800; f.y = Math.floor(i / kol) * 1150; });
    }
    byggVerden(); lagreHistorikk(); flyTil(oversiktsVisning());
    toast('Rammene er ordnet. Ctrl+Z tar deg tilbake.');
  }

  /* ---------- Bilder ---------- */

  function velgBilde() {
    var inp = h('input', { type: 'file', accept: 'image/*,video/mp4,video/webm' });
    inp.addEventListener('change', function () { if (inp.files[0]) leggTilBildeFil(inp.files[0]); });
    inp.click();
  }
  function lesFil(fil) { return new Promise(function (ok, feil) { var r = new FileReader(); r.onload = function () { ok(r.result); }; r.onerror = feil; r.readAsDataURL(fil); }); }
  function lastBilde(src) { return new Promise(function (ok, feil) { var i = new Image(); i.onload = function () { ok(i); }; i.onerror = feil; i.src = src; }); }
  function leggTilBildeFil(fil, punkt) {
    if (!/^image\//.test(fil.type)) { toast('Bare bildefiler kan legges på lerretet.'); return; }
    lesFil(fil).then(function (url) {
      return lastBilde(url).then(function (img) {
        var maks = 1800, k = Math.min(1, maks / Math.max(img.width, img.height));
        if (k === 1 && fil.size < 700000) return { url: url, w: img.width, h: img.height };
        var c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        var ut = fil.type === 'image/png' ? c.toDataURL('image/png') : '';
        if (!ut || ut.length > 1500000) ut = c.toDataURL('image/jpeg', 0.86);
        return { url: ut, w: c.width, h: c.height };
      });
    }).then(function (b) {
      if (!redigerer) veksleRedigering(true);
      var bredde = 1600, hoyde = Math.round(clamp(bredde * b.h / b.w, 300, 2400)) + 80;
      var f = { id: uid(), form: 'fri', w: bredde + 80, h: hoyde, tekst: '![](' + b.url + ')' };
      var ref = valgt ? ramme(valgt) : ramme(aktivEllerPos());
      f.s = ref ? +(ref.s * str(ref)[0] * 0.8 / f.w).toPrecision(3) : +((Math.min(W / cam.z * 0.45 / f.w, H / cam.z * 0.6 / f.h))).toPrecision(3);
      var p = punkt ? tilVerden(punkt.x, punkt.y) : finnPlass(ref, f.w * f.s, f.h * f.s);
      f.x = Math.round(p.x); f.y = Math.round(p.y); f.r = Math.round(p.r || 0);
      doc.rammer.push(f);
      doc.sti.splice(Math.min(pos + 1, doc.sti.length), 0, f.id);
      byggVerden(); lagreHistorikk(); velg(f.id);
      if (!punkt) flyTil(rammeVisning(f));
    }).catch(function () { toast('Klarte ikke å lese bildet.'); });
  }

  /* ---------- Stil: terning og studio ---------- */

  function terning() {
    var gammel = JSON.stringify(doc.stil);
    doc.stil = lagStil(Math.floor(Math.random() * 1e9));
    doc.stil.pust = JSON.parse(gammel).pust !== false;
    brukStil(); byggVerden(); lagreHistorikk(); byggPanel();
    toast('Ny stil: «' + doc.stil.navn + '»', [{ tekst: 'Kast igjen', primar: true, fn: terning }, { tekst: 'Angre', fn: angre }], 5000);
  }
  function settStilFelt(felt, verdi) {
    doc.stil[felt] = verdi;
    if (felt === 'palett') delete doc.stil.farger;
    doc.stil.navn = doc.stil.navn && !/\(tilpasset\)$/.test(doc.stil.navn) ? doc.stil.navn + ' (tilpasset)' : (doc.stil.navn || 'Egen stil');
    brukStil(); byggVerden(); lagreHistorikk(); byggPanel();
  }

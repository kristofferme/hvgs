  /* ==========================================================================
     Peker, touch, hjul, tastatur
     ========================================================================== */

  var pekere = {}, gest = null;
  function antallPekere() { return Object.keys(pekere).length; }
  function pekerListe() { return Object.keys(pekere).map(function (k) { return pekere[k]; }); }

  stage.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse' && e.button !== 0 && e.button !== 1) return;
    if (skriv && skriv.blokk.contains(e.target)) return;
    if (!redigerer && e.target.closest('a')) return;
    if (skriv) avsluttSkriv(true);
    aktivitet();
    pekere[e.pointerId] = { x: e.clientX, y: e.clientY };
    try { stage.setPointerCapture(e.pointerId); } catch (er) { /* ok */ }
    if (antallPekere() === 2) {
      var ps = pekerListe();
      gest = { type: 'klyp', d0: Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y) || 1, m0: { x: (ps[0].x + ps[1].x) / 2, y: (ps[0].y + ps[1].y) / 2 }, cam0: Object.assign({}, cam), flyttet: true };
      return;
    }
    if (antallPekere() > 2) return;
    stoppFly();
    parkert = null;
    var handtak = e.target.closest('[data-h]');
    var rammeEl = e.target.closest('.k-frame');
    var kob = e.target.closest('.k-kob-treff');
    var g = { sx: e.clientX, sy: e.clientY, t: performance.now(), flyttet: false, cam0: Object.assign({}, cam), mal: rammeEl ? rammeEl.dataset.id : null, touch: e.pointerType === 'touch' };
    if (redigerer && kob && !kobleFra) {
      velgKobling(+kob.getAttribute('data-i'));
      g.type = 'panorer'; g.kobling = true;
    } else if (redigerer && handtak && valgt) {
      g.type = handtak.dataset.h;
      startGruppe(g, ramme(valgt));
    } else if (redigerer && rammeEl && e.button === 0 && !kobleFra) {
      if (valgt !== rammeEl.dataset.id) velg(rammeEl.dataset.id);
      g.type = 'flytt';
      startGruppe(g, ramme(valgt));
    } else {
      g.type = 'panorer';
    }
    gest = g;
  });

  function startGruppe(g, f) {
    g.f = f;
    g.f0 = { x: f.x, y: f.y, s: f.s, r: f.r };
    g.barn = doc.rammer.filter(function (b) { return b !== f && inneholder(f, b); }).map(function (b) { return { f: b, x: b.x, y: b.y, s: b.s, r: b.r }; });
    var c = tilSkjerm(f.x, f.y);
    g.c = c;
    g.d0 = Math.hypot(g.sx - c.x, g.sy - c.y) || 1;
    g.a0 = Math.atan2(g.sy - c.y, g.sx - c.x);
  }
  function brukGruppe(g, ny) {
    var f = g.f, f0 = g.f0;
    f.x = ny.x; f.y = ny.y; f.s = ny.s; f.r = ny.r;
    oppdaterRamme(f);
    var k = ny.s / f0.s, dr = ny.r - f0.r;
    g.barn.forEach(function (b) {
      var l = rot(b.x - f0.x, b.y - f0.y, -f0.r);
      var q = rot(l.x * k, l.y * k, ny.r);
      b.f.x = ny.x + q.x; b.f.y = ny.y + q.y; b.f.s = b.s * k; b.f.r = b.r + dr;
      oppdaterRamme(b.f);
    });
    tegnKoblinger();
    oppdaterMarkering();
    oppdaterMerker();
  }

  function sporMus(e) {
    if (root.classList.contains('k-laser-pa')) laser.style.transform = 'translate(' + e.clientX + 'px,' + e.clientY + 'px)';
    if (root.classList.contains('k-lys-pa')) { lysEl.style.setProperty('--mx', e.clientX + 'px'); lysEl.style.setProperty('--my', e.clientY + 'px'); }
    if (e.pointerType === 'mouse') { poMal.x = -(e.clientX / W - 0.5) * 18; poMal.y = -(e.clientY / H - 0.5) * 12; }
  }
  document.addEventListener('pointermove', sporMus, { passive: true });

  stage.addEventListener('pointermove', function (e) {
    var p = pekere[e.pointerId];
    if (!p || !gest) {
      if (e.pointerType === 'mouse') aktivitet();
      if (redigerer && !gest) { var fe = e.target.closest('.k-frame'); visHover(fe ? fe.dataset.id : null); }
      return;
    }
    p.x = e.clientX; p.y = e.clientY;
    var g = gest;
    if (g.type === 'klyp') {
      var ps = pekerListe();
      if (ps.length < 2) return;
      var d1 = Math.hypot(ps[0].x - ps[1].x, ps[0].y - ps[1].y) || 1;
      var m1 = { x: (ps[0].x + ps[1].x) / 2, y: (ps[0].y + ps[1].y) / 2 };
      var wp = tilVerden(g.m0.x, g.m0.y, g.cam0);
      cam.z = clamp(g.cam0.z * d1 / g.d0, 1e-4, 1e4);
      var q = rot((m1.x - W / 2) / cam.z, (m1.y - H / 2) / cam.z, cam.r);
      cam.x = wp.x - q.x; cam.y = wp.y - q.y;
      merkFri();
      return;
    }
    var dx = e.clientX - g.sx, dy = e.clientY - g.sy;
    if (!g.flyttet && Math.hypot(dx, dy) > (g.touch ? 8 : 4)) { g.flyttet = true; root.classList.add('k-drar'); visHover(null); lukkPopover(); }
    if (!g.flyttet) return;
    if (g.type === 'panorer') {
      var d = skjermDelta(dx, dy, g.cam0);
      cam.x = g.cam0.x - d.x; cam.y = g.cam0.y - d.y;
      merkFri();
    } else if (g.type === 'flytt') {
      var dw = skjermDelta(dx, dy);
      var ny = { x: g.f0.x + dw.x, y: g.f0.y + dw.y, s: g.f0.s, r: g.f0.r };
      if (!e.altKey) ny = snap(g, ny); else skjulGuider();
      brukGruppe(g, ny);
    } else if (g.type === 'scale') {
      var dd = Math.hypot(e.clientX - g.c.x, e.clientY - g.c.y);
      brukGruppe(g, { x: g.f0.x, y: g.f0.y, s: Math.max(1e-4, g.f0.s * dd / g.d0), r: g.f0.r });
    } else if (g.type === 'rot') {
      var a = Math.atan2(e.clientY - g.c.y, e.clientX - g.c.x);
      var r = g.f0.r + (a - g.a0) * 180 / Math.PI;
      if (e.shiftKey) r = Math.round(r / 15) * 15;
      else if (Math.abs(vinkelDiff(0, r) - Math.round(vinkelDiff(0, r) / 90) * 90) < 3) r = Math.round(r / 90) * 90;
      brukGruppe(g, { x: g.f0.x, y: g.f0.y, s: g.f0.s, r: Math.round(r * 10) / 10 });
    }
  });

  function merkFri() {
    parkert = null;
    if (!redigerer && !oversikt) { friVisning = true; root.classList.add('k-fri-visning'); }
  }

  function pekerOpp(e) {
    if (!pekere[e.pointerId]) return;
    delete pekere[e.pointerId];
    var g = gest;
    if (!g) return;
    if (g.type === 'klyp') { if (antallPekere() === 0) gest = null; return; }
    if (antallPekere() > 0) return;
    gest = null;
    root.classList.remove('k-drar');
    skjulGuider();
    var dt = performance.now() - g.t, dx = e.clientX - g.sx, dy = e.clientY - g.sy;
    if (g.flyttet) {
      if (g.type !== 'panorer') { lagreHistorikk(); tegnSti(); verden.oppdaterBoks(); }
      else if (!redigerer && g.touch && dt < 400 && Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.3) {
        cam.x = g.cam0.x; cam.y = g.cam0.y; friVisning = false; root.classList.remove('k-fri-visning');
        if (dx < 0) neste(); else forrige();
      }
      return;
    }
    if (e.type === 'pointercancel') return;
    if (redigerer) {
      if (kobleFra) { if (g.mal) fullforKobling(g.mal); else avbrytKobling(); return; }
      if (!g.mal && !g.kobling) velg(null);
      return;
    }
    if (oversikt) { if (g.mal) gaTilRamme(g.mal); else visOversikt(false); return; }
    var aktiv = ramme(aktivId);
    if (g.mal && g.mal !== aktivId && !(aktiv && inneholder(ramme(g.mal), aktiv))) gaTilRamme(g.mal);
    else neste();
  }
  stage.addEventListener('pointerup', pekerOpp);
  stage.addEventListener('pointercancel', pekerOpp);

  stage.addEventListener('dblclick', function (e) {
    if (!redigerer) return;
    // Pekerfangst gjør at e.target er scenen – finn elementet som faktisk ligger under musa
    var mal = document.elementFromPoint(e.clientX, e.clientY) || e.target;
    if (skriv && skriv.blokk.contains(mal)) return;
    var el = mal.closest('.k-frame');
    if (el) {
      var f = ramme(el.dataset.id);
      var blokk = mal.closest('[data-l]');
      if (blokk && el.contains(blokk)) startSkriv(f, blokk, { x: e.clientX, y: e.clientY });
      else { velg(f.id); fokuserTekst(true); }
      return;
    }
    if (mal.closest('.k-kob-treff, .k-merke, .k-h, .k-ui')) return;
    // Dobbeltklikk på tomt lerret: ny ramme akkurat der
    var p = tilVerden(e.clientX, e.clientY);
    var m = MALER[0], f2 = { id: uid(), form: 'kort', tekst: m.tekst, r: Math.round(cam.r) };
    f2.s = +(((panelPa() ? W - PANEL : W) / cam.z) * 0.42 / 1600).toPrecision(3);
    f2.x = Math.round(p.x); f2.y = Math.round(p.y);
    doc.rammer.push(f2);
    doc.sti.splice(Math.min(pos + 1, doc.sti.length), 0, f2.id);
    byggVerden(); lagreHistorikk(); velg(f2.id);
    var forste = $('[data-l]', els[f2.id]);
    if (forste) startSkriv(f2, forste, null, true);
  });

  stage.addEventListener('wheel', function (e) {
    e.preventDefault();
    stoppFly();
    aktivitet();
    var faktor = e.deltaMode === 1 ? 33 : e.deltaMode === 2 ? 400 : 1;
    if (e.shiftKey && !e.ctrlKey) {
      var d = skjermDelta((e.deltaY || e.deltaX) * faktor, 0);
      cam.x += d.x; cam.y += d.y;
    } else {
      var k = e.ctrlKey ? 0.011 : 0.0017;
      zoomVed(e.clientX, e.clientY, Math.exp(-e.deltaY * faktor * k));
    }
    merkFri();
  }, { passive: false });

  root.addEventListener('dragover', function (e) {
    if (!e.dataTransfer || Array.prototype.indexOf.call(e.dataTransfer.types || [], 'Files') < 0) return;
    e.preventDefault(); root.classList.add('k-dropp-pa');
  });
  root.addEventListener('dragleave', function (e) { if (e.target === root || !root.contains(e.relatedTarget)) root.classList.remove('k-dropp-pa'); });
  root.addEventListener('drop', function (e) {
    root.classList.remove('k-dropp-pa');
    var fil = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
    if (!fil) return;
    e.preventDefault();
    leggTilBildeFil(fil, { x: e.clientX, y: e.clientY });
  });
  document.addEventListener('paste', function (e) {
    if (skriver(e.target)) return;
    var items = (e.clipboardData && e.clipboardData.items) || [];
    for (var i = 0; i < items.length; i++) {
      if (items[i].kind === 'file' && /^image\//.test(items[i].type)) { e.preventDefault(); leggTilBildeFil(items[i].getAsFile()); return; }
    }
  });

  /* ---------- Tastatur ---------- */

  function skriver(t) {
    return t && (t.tagName === 'TEXTAREA' || (t.tagName === 'INPUT' && !/^(checkbox|range|color|button)$/.test(t.type)) || t.isContentEditable);
  }
  function tast(e) {
    var t = e.target, mod0 = e.ctrlKey || e.metaKey, k = e.key;
    if (skriver(t)) {
      if (mod0 && k.toLowerCase() === 's') { e.preventDefault(); lagre(); }
      if (k === 'Escape' && !t.isContentEditable) t.blur();
      return;
    }
    if (t && t.tagName === 'BUTTON' && (k === ' ' || k === 'Enter')) return;
    if (mod0) {
      var kk = k.toLowerCase();
      if (kk === 's') { e.preventDefault(); lagre(); }
      else if (kk === 'z' && redigerer) { e.preventDefault(); if (e.shiftKey) gjorOm(); else angre(); }
      else if (kk === 'y' && redigerer) { e.preventDefault(); gjorOm(); }
      else if (kk === 'd' && redigerer && valgt) { e.preventDefault(); dupliser(); }
      return;
    }
    if (e.altKey) return;
    if (hjelp.classList.contains('k-pa')) { if (k === 'Escape' || k === '?') { visHjelp(false); e.preventDefault(); } return; }
    if (root.classList.contains('k-blank-pa') && k !== 'b' && k !== 'B' && k !== '.') root.classList.remove('k-blank-pa');
    if (redigerer && valgt && /^Arrow/.test(k)) {
      e.preventDefault();
      var f = ramme(valgt), steg = e.shiftKey ? 40 : 6;
      var d = skjermDelta(k === 'ArrowLeft' ? -steg : k === 'ArrowRight' ? steg : 0, k === 'ArrowUp' ? -steg : k === 'ArrowDown' ? steg : 0);
      var g = {}; startGruppe(g, f); brukGruppe(g, { x: f.x + d.x, y: f.y + d.y, s: f.s, r: f.r });
      senereHistorikk(); tegnSti();
      return;
    }
    switch (k) {
      case 'ArrowRight': case 'ArrowDown': case ' ': case 'PageDown':
        e.preventDefault(); if (redigerer) gaTilIRedigering(pos + 1); else neste(); break;
      case 'Enter':
        e.preventDefault();
        if (redigerer && valgt) { var b = $('[data-l]', els[valgt]); if (b) startSkriv(ramme(valgt), b, null, true); }
        else if (redigerer) gaTilIRedigering(pos + 1); else neste();
        break;
      case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
        e.preventDefault(); if (redigerer) gaTilIRedigering(pos - 1); else forrige(); break;
      case 'Backspace': case 'Delete':
        if (redigerer && valgt) { e.preventDefault(); slettValgt(); }
        else if (redigerer && valgtKobling >= 0) { e.preventDefault(); doc.koblinger.splice(valgtKobling, 1); valgtKobling = -1; tegnKoblinger(); lagreHistorikk(); byggVerktoy(); }
        else if (!redigerer && k === 'Backspace') { e.preventDefault(); forrige(); }
        break;
      case 'Home': e.preventDefault(); if (!redigerer) gaTil(0); break;
      case 'End': e.preventDefault(); if (!redigerer) gaTil(doc.sti.length - 1, { alleSteg: true }); break;
      case 'o': case 'O': if (redigerer) flyTil(oversiktsVisning()); else visOversikt(); break;
      case 'Escape':
        if (popover.classList.contains('k-pa')) lukkPopover();
        else if (kobleFra) avbrytKobling();
        else if (redigerer && (valgt || valgtKobling >= 0)) { valgtKobling = -1; velg(null); }
        else if (oversikt || friVisning) gaTil(pos, { behold: true });
        else if (!redigerer) visOversikt(true);
        break;
      case 'e': case 'E': veksleRedigering(); break;
      case 'f': case 'F': fullskjerm(); break;
      case 'n': case 'N': if (!redigerer) root.classList.toggle('k-vis-notater'); break;
      case 'p': case 'P': if (!redigerer) apnePresentator(); break;
      case 'l': case 'L': if (!redigerer) root.classList.toggle('k-laser-pa'); break;
      case 's': case 'S': if (!redigerer) root.classList.toggle('k-lys-pa'); break;
      case 'b': case 'B': case '.': if (!redigerer) root.classList.toggle('k-blank-pa'); break;
      case '?': visHjelp(true); break;
      default: return;
    }
  }
  function gaTilIRedigering(i) {
    if (!doc.sti.length) return;
    pos = clamp(i, 0, doc.sti.length - 1);
    flyTil(visningFor(doc.sti[pos]));
    markerStiRad();
  }
  document.addEventListener('keydown', tast);

  window.addEventListener('resize', function () {
    W = innerWidth; H = innerHeight;
    verden.storrelse();
    zRef = oversiktsVisning(true).z;
    sisteTransform = '';
    if (!flight && !friVisning && !redigerer) {
      var v = oversikt ? oversiktsVisning() : visningFor(doc.sti[pos]);
      cam.x = v.x; cam.y = v.y; cam.z = v.z; cam.r = v.r;
      parker(v);
    }
  });
  window.addEventListener('hashchange', function () {
    var n = parseInt(location.hash.slice(1), 10);
    if (n >= 1 && n - 1 !== pos && !redigerer) gaTil(n - 1);
  });
  window.addEventListener('beforeunload', function (e) {
    if (ulagret) { e.preventDefault(); e.returnValue = ''; }
  });

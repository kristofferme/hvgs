  /* ==========================================================================
     Navigasjon og effekter ved ankomst
     ========================================================================== */

  function antallSteg(id) { var el = els[id]; return el ? el.querySelectorAll('.k-steg').length : 0; }
  function visSteg() {
    var id = maalId || aktivId;
    $$('.k-steg.k-vis', world).forEach(function (x) { if (!id || !els[id] || !els[id].contains(x)) x.classList.remove('k-vis'); });
    if (!id || !els[id]) return;
    $$('.k-steg', els[id]).forEach(function (x, i) { x.classList.toggle('k-vis', i < viste); });
  }

  /* ---------- Effekter ---------- */

  var effektTimere = [];
  function stoppEffekter() {
    effektTimere.forEach(function (t) { clearInterval(t); clearTimeout(t); cancelAnimationFrame(t); });
    effektTimere = [];
    $$('[data-original]', world).forEach(function (el) { el.textContent = el.getAttribute('data-original'); el.removeAttribute('data-original'); });
    $$('.k-c[data-ch]', world).forEach(function (c) { c.textContent = c.getAttribute('data-ch'); c.removeAttribute('data-ch'); });
  }
  function formaterSom(mal, v, desimaler) {
    var s = v.toFixed(desimaler);
    var komma = /\d,\d/.test(mal);
    var mellomrom = /\d[  ]\d{3}/.test(mal);
    var deler = s.split('.');
    if (mellomrom) deler[0] = deler[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return deler.join(komma ? ',' : '.');
  }
  function tellOpp(el, forsinkelse) {
    var tekst = el.textContent;
    var m = tekst.replace(/ /g, ' ').match(/-?\d[\d ]*(?:[.,]\d+)?/);
    if (!m || el.querySelector('*:not(br)')) return;
    var mal = m[0].trim(), v = parseFloat(mal.replace(/ /g, '').replace(',', '.'));
    if (!isFinite(v) || (/^(1[5-9]|20)\d\d$/.test(mal))) return; // årstall teller vi ikke opp
    var des = (mal.split(/[.,]/)[1] || '').length;
    var fore = tekst.slice(0, tekst.indexOf(m[0].trim())), etter = tekst.slice(tekst.indexOf(m[0].trim()) + mal.length);
    el.setAttribute('data-original', tekst);
    var t0 = performance.now() + (forsinkelse || 0), varighet = 1500;
    function steg(na) {
      var k = clamp((na - t0) / varighet, 0, 1), e = EASE.ut(k);
      el.textContent = fore + formaterSom(mal, v * e, des) + etter;
      if (k < 1) effektTimere.push(requestAnimationFrame(steg));
      else { el.textContent = tekst; el.removeAttribute('data-original'); }
    }
    effektTimere.push(requestAnimationFrame(steg));
  }
  var TEGN = 'ABCDEFGHIJKLMNOPQRSTUVWXYZÆØÅ0123456789#%&*+=?';
  function dekod(tittel) {
    var bokstaver = $$('.k-c', tittel);
    var start = performance.now() + 60;
    bokstaver.forEach(function (c) { c.setAttribute('data-ch', c.textContent); });
    function steg(na) {
      var ferdig = true;
      bokstaver.forEach(function (c, i) {
        var slutt = start + 260 + i * 38;
        if (na < slutt) {
          ferdig = false;
          if (na > start + i * 12 && /\S/.test(c.getAttribute('data-ch'))) c.textContent = TEGN[Math.floor(Math.random() * TEGN.length)];
        } else if (c.hasAttribute('data-ch')) { c.textContent = c.getAttribute('data-ch'); c.removeAttribute('data-ch'); }
      });
      if (!ferdig) effektTimere.push(requestAnimationFrame(steg));
    }
    effektTimere.push(requestAnimationFrame(steg));
  }
  function roterOrd(span) {
    var ord = $$('.k-ro', span), i = 0;
    if (ord.length < 2) return;
    effektTimere.push(setInterval(function () {
      ord[i].classList.remove('k-pa'); ord[i].classList.add('k-ut');
      var gammel = ord[i];
      setTimeout(function () { gammel.classList.remove('k-ut'); }, 700);
      i = (i + 1) % ord.length;
      ord[i].classList.add('k-pa');
    }, 2300));
  }
  function startEffekter(el, f) {
    if (redigerer && !el.classList.contains('k-forhand')) return;
    if (reduser) return;
    $$('.k-teller', el).forEach(function (t) {
      var stolpe = t.closest('.k-stolpe');
      if (stolpe && stolpe.classList.contains('k-steg') && !stolpe.classList.contains('k-vis')) return;
      var b = t.closest('.k-b');
      var i = b ? +b.style.getPropertyValue('--i') || 0 : 0;
      tellOpp(t, i * 95 + (stolpe ? +stolpe.style.getPropertyValue('--j') * 120 : 0));
    });
    if (rammeInn(f) === 'dekode') $$('.k-tittel', el).forEach(dekod);
    $$('.k-roter', el).forEach(roterOrd);
  }

  function landingsPuls(f) {
    if (reduser || redigerer) return;
    var s = str(f);
    var p = h('div', { class: 'k-puls k-puls-' + f.form });
    p.style.width = s[0] + 'px'; p.style.height = s[1] + 'px';
    p.style.transform = 'translate(' + f.x + 'px,' + f.y + 'px) rotate(' + f.r + 'deg) scale(' + f.s + ') translate(-50%,-50%)';
    if (f.form === 'blob') p.style.borderRadius = blobRadius(f.id);
    world.append(p);
    setTimeout(function () { p.remove(); }, 1400);
  }

  function settAktiv(id) {
    stoppEffekter();
    Object.keys(els).forEach(function (k) { if (k !== id) els[k].classList.remove('k-aktiv'); });
    aktivId = id;
    if (id && els[id]) {
      var el = els[id], f = ramme(id);
      el.classList.remove('k-aktiv');
      void el.offsetWidth;
      el.classList.add('k-aktiv');
      startEffekter(el, f);
      tegnKoblingerFor(id);
      if (!redigerer) {
        landingsPuls(f);
        if (f.feiring) verden.feiring();
      }
    }
    root.classList.toggle('k-fokus', !!id && !redigerer);
  }
  function settMaal(id) {
    if (maalId && els[maalId]) els[maalId].classList.remove('k-maal');
    maalId = id;
    if (id && els[id]) els[id].classList.add('k-maal');
  }

  function gaTil(i, valg) {
    valg = valg || {};
    if (!doc.sti.length) { flyTil(oversiktsVisning()); return; }
    i = clamp(i, 0, doc.sti.length - 1);
    var endret = i !== pos;
    pos = i;
    oversikt = false; friVisning = false;
    root.classList.remove('k-oversikt', 'k-fri-visning');
    var e = doc.sti[i];
    var id = typeof e === 'string' ? e : null;
    var f = id ? ramme(id) : null;
    if (!valg.behold || endret) viste = valg.alleSteg && id ? antallSteg(id) : 0;
    settAktiv(null);
    settMaal(id);
    visSteg();
    if (!redigerer) settStemning(f ? f.stemning : e && e.stemning);
    var mal = visningFor(e);
    function ankomst() { settAktiv(id); settMaal(null); visSteg(); }
    var type = valg.type || (f && f.overgang) || (e && e.overgang) || doc.stil.overgang;
    if (valg.straks) { stoppFly(); cam.x = mal.x; cam.y = mal.y; cam.z = mal.z; cam.r = mal.r; ankomst(); parker(mal); }
    else flyTil(mal, Object.assign({ naer: ankomst, type: type, ferdig: function () { parker(mal); } }, valg.fly || {}));
    tegnSti();
    oppdaterStatus();
    if (!redigerer) skrivHash();
  }
  function neste() {
    if (oversikt) { gaTil(pos, { behold: true }); return; }
    var id = typeof doc.sti[pos] === 'string' ? doc.sti[pos] : null;
    if (!friVisning && id && viste < antallSteg(id)) {
      viste++;
      stoppFly();
      if (aktivId !== id) settAktiv(id);
      settMaal(null); visSteg();
      var ny = $$('.k-steg', els[id])[viste - 1];
      if (ny) $$('.k-teller', ny).forEach(function (t) { tellOpp(t, 200); });
      oppdaterStatus();
      return;
    }
    if (friVisning) {
      if ((id && viste < antallSteg(id)) || pos >= doc.sti.length - 1) gaTil(pos, { behold: true });
      else gaTil(pos + 1);
      return;
    }
    if (pos < doc.sti.length - 1) gaTil(pos + 1);
    else blink();
  }
  function forrige() {
    if (oversikt || friVisning) { gaTil(pos, { behold: true }); return; }
    var id = typeof doc.sti[pos] === 'string' ? doc.sti[pos] : null;
    if (id && viste > 0) { viste--; visSteg(); oppdaterStatus(); return; }
    if (pos > 0) gaTil(pos - 1, { alleSteg: true, type: 'fly' });
    else blink();
  }
  function blink() {
    if (reduser) return;
    var z = cam.z, x = cam.x, y = cam.y, r = cam.r;
    flyTil({ x: x, y: y, z: z * 0.97, r: r }, { varighet: 150, ease: 'ut', ferdig: function () { flyTil({ x: x, y: y, z: z, r: r }, { varighet: 420, ease: 'back', ferdig: function () { parker({ x: x, y: y, z: z, r: r }); } }); } });
  }
  function visOversikt(pa) {
    if (pa === undefined) pa = !oversikt;
    if (!pa) { gaTil(pos, { behold: true }); return; }
    oversikt = true;
    root.classList.add('k-oversikt');
    settAktiv(null); settMaal(null);
    settStemning(null);
    flyTil(oversiktsVisning(), { type: 'fly' });
    oppdaterStatus();
  }
  function gaTilRamme(id) {
    var i = doc.sti.indexOf(id);
    if (i >= 0 && !redigerer) { gaTil(i); return; }
    var f = ramme(id);
    if (!f) return;
    oversikt = false; root.classList.remove('k-oversikt');
    friVisning = !redigerer; root.classList.toggle('k-fri-visning', friVisning);
    settAktiv(null);
    var v = rammeVisning(f);
    flyTil(v, { naer: function () { if (!redigerer) settAktiv(id); } });
  }
  function skrivHash() {
    var ny = '#' + (pos + 1);
    if (location.hash !== ny) { try { history.replaceState(null, '', ny); } catch (e) { /* ignorer */ } }
  }

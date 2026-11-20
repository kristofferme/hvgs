  /* ==========================================================================
     Grensesnitt: dokk, status, toast, hjelp, presentatørvisning, verktøy
     ========================================================================== */

  var progress = h('div', { class: 'k-progress', html: '<i></i>' });
  var dock = h('div', { class: 'k-dock', role: 'toolbar', 'aria-label': 'Krizi' });
  var panel = h('aside', { class: 'k-panel', 'aria-label': 'Rediger' });
  var toaster = h('div', { class: 'k-toaster', role: 'status', 'aria-live': 'polite' });
  var tilbake = h('button', { class: 'k-btn k-tilbake', type: 'button', onclick: function () { gaTil(pos, { behold: true }); } });
  tilbake.innerHTML = ikon('hjem') + '<span>Tilbake til stien</span>';
  var notater = h('div', { class: 'k-notater' });
  var laser = h('div', { class: 'k-laser' });
  var blank = h('div', { class: 'k-blank', onclick: function () { root.classList.remove('k-blank-pa'); } });
  var hjelp = h('div', { class: 'k-hjelp', onclick: function (e) { if (e.target === hjelp) visHjelp(false); } });
  var dropp = h('div', { class: 'k-dropp', text: 'Slipp bildet for å legge det på lerretet' });
  var verktoy = h('div', { class: 'k-verktoy', role: 'toolbar', 'aria-label': 'Ramme' });
  var popover = h('div', { class: 'k-popover', role: 'dialog' });
  ui.append(progress, tilbake, notater, dock, panel, verktoy, popover, toaster, hjelp, dropp);
  root.append(laser, blank);

  var teller, knappAngre, knappGjor, knappLagre;
  function byggDokk() {
    dock.textContent = '';
    teller = knappAngre = knappGjor = knappLagre = null;
    if (redigerer) {
      dock.append(
        knapp('pluss', 'Legg til', function (e) { visMaler(e.currentTarget); }, { class: 'k-btn k-primar-lys' }),
        knapp('bilde', 'Bilde', velgBilde),
        h('span', { class: 'k-sep' }),
        (knappAngre = ikonKnapp('angre', 'Angre (Ctrl+Z)', angre)),
        (knappGjor = ikonKnapp('gjor', 'Gjør om (Ctrl+Shift+Z)', gjorOm)),
        h('span', { class: 'k-sep' }),
        ikonKnapp('oversikt', 'Se hele lerretet (O)', function () { flyTil(oversiktsVisning()); }),
        knapp('terning', 'Ny stil', function () { terning(); }),
        ikonKnapp('panel', 'Vis eller skjul panelet', function () { root.classList.toggle('k-panel-skjult'); }),
        h('span', { class: 'k-sep' }),
        (knappLagre = knapp('lagre', 'Lagre', lagre)),
        knapp('play', 'Presenter', function () { veksleRedigering(false); }, { class: 'k-btn k-primar' })
      );
    } else {
      teller = h('span', { class: 'k-teller-ui' });
      dock.append(
        ikonKnapp('venstre', 'Forrige (←)', forrige),
        teller,
        ikonKnapp('hoyre', 'Neste (→)', neste),
        h('span', { class: 'k-sep' }),
        ikonKnapp('oversikt', 'Oversikt (O)', function () { visOversikt(); }),
        ikonKnapp('fullskjerm', 'Fullskjerm (F)', fullskjerm),
        ikonKnapp('skjerm', 'Presentatørvisning (P)', apnePresentator),
        ikonKnapp('lys', 'Fokuslys (S)', function () { root.classList.toggle('k-lys-pa'); }),
        ikonKnapp('hjelp', 'Hjelp (?)', function () { visHjelp(true); }),
        h('span', { class: 'k-sep' }),
        knapp('edit', 'Rediger', function () { veksleRedigering(true); })
      );
    }
    oppdaterStatus();
  }

  function oppdaterStatus() {
    var n = doc.sti.length;
    var e = doc.sti[pos], id = typeof e === 'string' ? e : null;
    var totalt = antallSteg(id);
    if (teller) teller.textContent = n ? (pos + 1) + ' / ' + n : '0 / 0';
    var andel = n > 1 ? pos / (n - 1) : 1;
    if (totalt) andel = n > 1 ? (pos + viste / (totalt + 1)) / (n - 1) : viste / totalt;
    progress.firstChild.style.width = (oversikt ? 0 : clamp(andel, 0, 1) * 100) + '%';
    progress.style.display = redigerer ? 'none' : '';
    if (knappAngre) knappAngre.disabled = !historikk.length;
    if (knappGjor) knappGjor.disabled = !fremtid.length;
    if (knappLagre) knappLagre.classList.toggle('k-ulagret', ulagret);
    var f = id ? ramme(id) : null;
    notater.innerHTML = '<b>Notater · ' + esc(tittelPa(f)) + '</b>' + (f && f.notat ? esc(f.notat) : '<span style="opacity:.6">Ingen notater for denne rammen.</span>');
    oppdaterPresentator();
    if (redigerer && !valgt && typeof markerStiRad === 'function') markerStiRad();
  }

  function toast(tekst, handlinger, ms) {
    var t = h('div', { class: 'k-toast' }, h('span', { text: tekst }));
    (handlinger || []).forEach(function (a) {
      t.append(h('button', { class: 'k-btn' + (a.primar ? ' k-primar' : ''), type: 'button', text: a.tekst, onclick: function () { a.fn(); fjern(); } }));
    });
    function fjern() { t.classList.add('k-ut'); setTimeout(function () { t.remove(); }, 360); }
    toaster.append(t);
    if (ms !== 0) setTimeout(fjern, ms || 3200);
    return fjern;
  }

  var idleTimer = null;
  function aktivitet() {
    root.classList.remove('k-skjul-ui', 'k-idle');
    clearTimeout(idleTimer);
    idleTimer = setTimeout(function () {
      if (redigerer || dock.matches(':hover')) return;
      root.classList.add('k-skjul-ui', 'k-idle');
    }, 2600);
  }

  function visHjelp(pa) {
    if (pa) {
      hjelp.innerHTML = '<div role="dialog" aria-label="Hjelp"><h2>Krizi</h2><p>Et uendelig lerret. Kameraet flyr mellom rammene langs stien din.</p><dl>' +
        '<h4>Presentere</h4>' +
        '<dt><kbd>→</kbd> <kbd>mellomrom</kbd></dt><dd>Neste steg</dd>' +
        '<dt><kbd>←</kbd></dt><dd>Forrige steg</dd>' +
        '<dt><kbd>O</kbd></dt><dd>Oversikt over hele lerretet</dd>' +
        '<dt>klikk på en ramme</dt><dd>Fly dit</dd>' +
        '<dt>hjul / klyp · dra</dt><dd>Zoom og flytt fritt</dd>' +
        '<dt><kbd>F</kbd></dt><dd>Fullskjerm</dd>' +
        '<dt><kbd>P</kbd></dt><dd>Presentatørvisning i eget vindu</dd>' +
        '<dt><kbd>N</kbd></dt><dd>Notater</dd>' +
        '<dt><kbd>S</kbd></dt><dd>Fokuslys som følger musa</dd>' +
        '<dt><kbd>L</kbd></dt><dd>Laserpeker</dd>' +
        '<dt><kbd>B</kbd></dt><dd>Svart skjerm</dd>' +
        '<h4>Redigere</h4>' +
        '<dt><kbd>E</kbd></dt><dd>Slå redigering av og på</dd>' +
        '<dt>dobbeltklikk på tekst</dt><dd>Skriv rett i rammen (<kbd>Enter</kbd> for ferdig, <kbd>Shift</kbd>+<kbd>Enter</kbd> for ny linje)</dd>' +
        '<dt>dra ramme</dt><dd>Flytt – rammer inni følger med, hjelpelinjer viser når du treffer</dd>' +
        '<dt>hjørne · prikk over</dt><dd>Skaler · roter (<kbd>Shift</kbd> gir 15°-trinn)</dd>' +
        '<dt>verktøylinja</dt><dd>Form, rammestil, farge, animasjon, overgang, punkter, koblinger</dd>' +
        '<dt><kbd>Ctrl</kbd> <kbd>D</kbd></dt><dd>Dupliser</dd>' +
        '<dt><kbd>Delete</kbd></dt><dd>Slett valgt ramme</dd>' +
        '<dt><kbd>Ctrl</kbd> <kbd>Z</kbd></dt><dd>Angre</dd>' +
        '<dt><kbd>Ctrl</kbd> <kbd>S</kbd></dt><dd>Lagre fila</dd>' +
        '<dt>slipp / lim inn bilde</dt><dd>Legg bildet på lerretet</dd>' +
        '</dl></div>';
    }
    hjelp.classList.toggle('k-pa', !!pa);
  }

  function fullskjerm() {
    try {
      if (document.fullscreenElement) document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(function () { toast('Fullskjerm er ikke tilgjengelig her.'); });
    } catch (e) { toast('Fullskjerm er ikke tilgjengelig her.'); }
  }

  /* ---------- Presentatørvisning ---------- */

  var presVindu = null, presTimer = null, presStart = Date.now();
  function apnePresentator() {
    var w = null;
    try { w = window.open('', 'krizi-presentator', 'popup,width=1100,height=700'); } catch (e) { w = null; }
    if (!w) { toast('Nettleseren stoppet vinduet. Tillat popup-vinduer for denne siden, eller trykk N for notater her.'); return; }
    presVindu = w;
    presStart = Date.now();
    var d = w.document, p = aktivStil().p;
    d.title = 'Presentatør · ' + doc.tittel;
    d.head.innerHTML = '<meta charset="utf-8"><style>' +
      'body{margin:0;font:16px/1.5 Manrope,system-ui,sans-serif;background:#0b111d;color:#e9eef9;height:100vh;display:grid;grid-template-columns:1.3fr 1fr;grid-template-rows:auto 1fr auto;gap:18px;padding:22px;box-sizing:border-box}' +
      'header{grid-column:1/-1;display:flex;justify-content:space-between;align-items:baseline;gap:20px}' +
      'h1{margin:0;font-size:15px;letter-spacing:.14em;text-transform:uppercase;color:#98a6c2}' +
      '.tid{font-size:42px;font-weight:800;font-variant-numeric:tabular-nums;cursor:pointer}.klokke{color:#98a6c2;font-variant-numeric:tabular-nums}' +
      'section{background:#121a2b;border:1px solid rgba(255,255,255,.08);border-radius:18px;padding:20px 24px;overflow:auto}' +
      'small{display:block;font-size:11px;letter-spacing:.16em;text-transform:uppercase;color:' + p.a1 + ';font-weight:800;margin-bottom:6px}' +
      '.na{font-size:30px;font-weight:800;line-height:1.15}.neste{font-size:20px;font-weight:700;color:#b9c6e0}.notat{white-space:pre-wrap;font-size:22px;line-height:1.5}' +
      'footer{grid-column:1/-1;display:flex;gap:10px;align-items:center}button{font:inherit;font-weight:700;background:#1b2640;color:inherit;border:0;border-radius:12px;padding:12px 20px;cursor:pointer}button:hover{background:#25335a}' +
      '.steg{margin-left:auto;color:#98a6c2;font-variant-numeric:tabular-nums}' +
      '</style>';
    d.body.innerHTML = '<header><h1></h1><div><span class="tid" title="Klikk for å nullstille">00:00</span> <span class="klokke"></span></div></header>' +
      '<section><small>Nå</small><div class="na"></div><div style="height:18px"></div><small>Notater</small><div class="notat"></div></section>' +
      '<section><small>Neste</small><div class="neste"></div></section>' +
      '<footer><button data-a="forrige">← Forrige</button><button data-a="neste">Neste →</button><button data-a="oversikt">Oversikt</button><span class="steg"></span></footer>';
    $('h1', d).textContent = doc.tittel;
    $('.tid', d).addEventListener('click', function () { presStart = Date.now(); klokke(); });
    d.body.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('button');
      if (!a) return;
      if (a.dataset.a === 'neste') neste(); else if (a.dataset.a === 'forrige') forrige(); else visOversikt();
    });
    d.addEventListener('keydown', tast);
    clearInterval(presTimer);
    presTimer = setInterval(klokke, 1000);
    klokke();
    oppdaterPresentator();
  }
  function klokke() {
    if (!presVindu || presVindu.closed) { clearInterval(presTimer); presVindu = null; return; }
    var s = Math.floor((Date.now() - presStart) / 1000);
    var d = presVindu.document;
    var t = $('.tid', d); if (t) t.textContent = String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
    var k = $('.klokke', d); if (k) k.textContent = new Date().toLocaleTimeString('no', { hour: '2-digit', minute: '2-digit' });
  }
  function oppdaterPresentator() {
    if (!presVindu || presVindu.closed) return;
    var d = presVindu.document;
    var e = doc.sti[pos], f = typeof e === 'string' ? ramme(e) : null;
    var n = doc.sti[pos + 1], nf = typeof n === 'string' ? ramme(n) : null;
    var na = $('.na', d); if (!na) return;
    na.textContent = tittelPa(f);
    $('.notat', d).textContent = f && f.notat ? f.notat : '–';
    $('.neste', d).textContent = n ? tittelPa(nf) : 'Slutt';
    var tot = antallSteg(f && f.id);
    $('.steg', d).textContent = 'Ramme ' + (pos + 1) + ' av ' + doc.sti.length + (tot ? ' · punkt ' + viste + ' av ' + tot : '');
  }

  /* ---------- Popover (felles for verktøylinja og dokka) ---------- */

  var popoverKilde = null;
  function visPopover(kilde, innhold, plassering) {
    if (popoverKilde === kilde && popover.classList.contains('k-pa')) { lukkPopover(); return; }
    popover.textContent = '';
    popover.append(innhold);
    popover.classList.add('k-pa');
    popoverKilde = kilde;
    $$('.k-aktiv-knapp', ui).forEach(function (b) { b.classList.remove('k-aktiv-knapp'); });
    if (kilde) kilde.classList.add('k-aktiv-knapp');
    var r = kilde.getBoundingClientRect();
    var pw = popover.offsetWidth, ph = popover.offsetHeight;
    var x = clamp(r.left + r.width / 2 - pw / 2, 12, W - pw - 12);
    var y = plassering === 'over' || r.bottom + ph + 12 > H ? r.top - ph - 10 : r.bottom + 10;
    popover.style.left = x + 'px';
    popover.style.top = clamp(y, 12, H - ph - 12) + 'px';
  }
  function lukkPopover() {
    popover.classList.remove('k-pa');
    if (popoverKilde) popoverKilde.classList.remove('k-aktiv-knapp');
    popoverKilde = null;
  }
  document.addEventListener('pointerdown', function (e) {
    if (!popover.classList.contains('k-pa')) return;
    if (popover.contains(e.target) || (popoverKilde && popoverKilde.contains(e.target))) return;
    lukkPopover();
  }, true);

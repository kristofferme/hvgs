  /* ==========================================================================
     Sidepanel: innhold for valgt ramme, eller stilstudio + sti
     ========================================================================== */

  function felt(etikett, innhold, forId) {
    return h('div', { class: 'k-felt' }, typeof etikett === 'string' ? h('label', { text: etikett, for: forId }) : etikett, innhold);
  }
  function seksjon(tittel, innhold, apen) {
    var d = h('details', { class: 'k-seksjon' }, h('summary', { text: tittel }), h('div', { class: 'k-seksjon-kropp' }, innhold));
    if (apen) d.open = true;
    return d;
  }

  var panelScroll = {};
  function byggPanel() {
    var gammel = $('.k-panel-kropp', panel);
    if (gammel) panelScroll[panel.getAttribute('data-modus')] = gammel.scrollTop;
    panel.textContent = '';
    if (!redigerer) return;
    var f = valgt && ramme(valgt);
    var modus = f ? 'ramme' : 'studio';
    panel.setAttribute('data-modus', modus);
    if (f) byggRammePanel(f); else byggStudio();
    var ny = $('.k-panel-kropp', panel);
    if (ny && panelScroll[modus]) ny.scrollTop = panelScroll[modus];
  }

  function byggRammePanel(f) {
    var i = doc.sti.indexOf(f.id);
    panel.append(h('div', { class: 'k-panel-hode' },
      h('div', null, h('h3', { text: tittelPa(f) }), h('small', { text: i >= 0 ? 'Steg ' + (i + 1) + ' i stien · dobbeltklikk teksten for å skrive i rammen' : 'Ikke i stien' })),
      ikonKnapp('x', 'Lukk', function () { velg(null); })
    ));
    var kropp = h('div', { class: 'k-panel-kropp' });
    var ta = h('textarea', { id: 'k-innhold', rows: 9, spellcheck: 'true' });
    ta.value = f.tekst;
    ta.addEventListener('input', function () {
      f.tekst = ta.value;
      oppdaterRamme(f, true);
      $('.k-panel-hode h3', panel).textContent = tittelPa(f);
      senereHistorikk();
    });
    kropp.append(felt('Innhold', ta, 'k-innhold'));
    kropp.append(h('details', { class: 'k-detaljer' }, h('summary', { text: 'Slik skriver du' }),
      h('div', { class: 'k-hint', html:
        '<code># Tittel</code> <code>## Undertittel</code> <code>### Etikett</code><br>' +
        '<code>- punkt</code> · <code>1. punkt</code><br>' +
        '<code>!! 42 % | forklaring</code> stort tall som teller opp<br>' +
        '<code>:: Navn | 64 %</code> stolpediagram (én linje per stolpe)<br>' +
        '<code>-> Steg</code> prosess med piler<br>' +
        '<code>&gt; sitat</code> og <code>— Navn</code> under<br>' +
        '<code>**fet**</code> <code>*kursiv*</code> <code>==tusj==</code><br>' +
        '<code>__understrek__</code> <code>((ring rundt))</code> <code>~~stryk~~</code> tegnes for hånd<br>' +
        '<code>{{ord|som|skifter}}</code> ord som bytter seg selv<br>' +
        '<code>||</code> åpner en kolonne · <code>![tekst](lenke)</code> bilde eller video<br>' +
        'En linje med bare emoji blir et stort ikon.' })));

    var notat = h('textarea', { id: 'k-notat', rows: 3, placeholder: 'Det du vil huske å si. Bare du ser dette.' });
    notat.value = f.notat || '';
    notat.style.fontFamily = 'var(--f-ui)';
    notat.addEventListener('input', function () { f.notat = notat.value; if (!f.notat) delete f.notat; senereHistorikk(); });
    kropp.append(felt('Notater', notat, 'k-notat'));

    var info = h('div', { class: 'k-hint' });
    info.innerHTML = 'Form: <b>' + FORMER[f.form] + '</b> · Ramme: <b>' + RAMMESTILER[rammeStil(f)] + '</b> · Animasjon: <b>' + INNGANGER[rammeInn(f)] + '</b> · Overgang: <b>' + OVERGANGER[f.overgang || doc.stil.overgang] + '</b>' +
      '<br>Endre dette i verktøylinja over rammen.';
    kropp.append(info);
    kropp.append(h('div', { class: 'k-knapperad' },
      knapp('sti', iSti(f.id) ? 'Ta ut av stien' : 'Legg i stien', function () { veksleSti(f.id); }),
      knapp('kopi', 'Dupliser', dupliser),
      knapp('slett', 'Slett', slettValgt, { class: 'k-btn k-fare' })
    ));
    panel.append(kropp);
  }

  var alleSkrifterLastet = false;
  function byggStudio() {
    var st = doc.stil, a = aktivStil();
    if (!alleSkrifterLastet) { alleSkrifterLastet = true; Object.keys(SKRIFTER).forEach(function (k) { lastSkrift(SKRIFTER[k]); }); }
    panel.append(h('div', { class: 'k-panel-hode' },
      h('div', null, h('h3', { text: 'Utseende' }), h('small', { text: 'Klikk på en ramme for å endre den' })),
      ikonKnapp('play', 'Presenter (E)', function () { veksleRedigering(false); })
    ));
    var kropp = h('div', { class: 'k-panel-kropp' });

    var tittel = h('input', { type: 'text', id: 'k-tittel', value: doc.tittel });
    tittel.addEventListener('input', function () { doc.tittel = tittel.value || 'Uten tittel'; document.title = doc.tittel; senereHistorikk(); });
    kropp.append(felt('Tittel', tittel, 'k-tittel'));

    var stilKort = h('div', { class: 'k-stilkort' },
      h('div', null, h('small', { text: 'Stilen akkurat nå' }), h('b', { text: st.navn || 'Egen stil' })),
      knapp('terning', 'Overrask meg', terning, { class: 'k-btn k-primar' }));
    kropp.append(stilKort);

    var maler = h('div', { class: 'k-stiler' });
    STILER.forEach(function (m) {
      var p = PALETTER[m.palett], sk = SKRIFTER[m.skrift];
      var b = h('button', { type: 'button', class: 'k-stil' + (st.navn === m.navn ? ' k-pa' : ''), title: m.navn, onclick: function () {
        var pust = doc.stil.pust;
        doc.stil = stilFraMal(m, Math.floor(Math.random() * 1e9));
        doc.stil.pust = pust;
        brukStil(); byggVerden(); lagreHistorikk(); byggPanel();
      } });
      var prov = h('span', { class: 'k-stil-prov', style: { background: 'radial-gradient(circle at 30% 25%, ' + p.bg2 + ', ' + p.bg + ' 75%)', color: p.ink } });
      prov.append(h('i', { text: 'Aa', style: { fontFamily: sk.disp, fontWeight: sk.w, fontStyle: sk.kursiv ? 'italic' : 'normal', textTransform: sk.store ? 'uppercase' : 'none' } }),
        h('em', { style: { background: p.a1 } }), h('em', { style: { background: p.a2 } }), h('em', { style: { background: p.a3 } }));
      b.append(prov, h('b', { text: m.navn }));
      maler.append(b);
    });
    kropp.append(felt(h('span', { class: 'k-etikett', text: 'Ferdige stiler' }), maler));

    function chips(valg, aktiv, felt0, stilFn) {
      var boks = h('div', { class: 'k-valg' });
      Object.keys(valg).forEach(function (k) {
        var navn = typeof valg[k] === 'string' ? valg[k] : valg[k].navn;
        var c = h('button', { type: 'button', class: 'k-chip' + (aktiv === k ? ' k-pa' : ''), text: navn, onclick: function () { settStilFelt(felt0, k); } });
        if (stilFn) stilFn(c, k);
        boks.append(c);
      });
      return boks;
    }
    var palettBoks = h('div', { class: 'k-paletter' });
    Object.keys(PALETTER).forEach(function (k) {
      var p = PALETTER[k];
      var b = h('button', { type: 'button', class: 'k-palett' + (st.palett === k ? ' k-pa' : ''), title: p.navn, 'aria-label': 'Palett ' + p.navn, onclick: function () { settStilFelt('palett', k); }, style: { background: p.bg } });
      [p.a1, p.a2, p.a3].forEach(function (c) { b.append(h('i', { style: { background: c } })); });
      palettBoks.append(b);
    });
    var egne = h('div', { class: 'k-egne-farger' });
    [['bg', 'Bakgrunn'], ['flate', 'Kort'], ['ink', 'Tekst'], ['a1', 'Aksent 1'], ['a2', 'Aksent 2'], ['a3', 'Aksent 3']].forEach(function (par) {
      var inp = h('input', { type: 'color', value: a.p[par[0]], 'aria-label': par[1] });
      inp.addEventListener('input', function () {
        doc.stil.farger = doc.stil.farger || {};
        doc.stil.farger[par[0]] = inp.value;
        if (par[0] === 'bg') doc.stil.farger.bg2 = inp.value;
        if (par[0] === 'ink') doc.stil.farger.ink2 = inp.value;
        brukStil(); senereHistorikk();
      });
      egne.append(h('label', { class: 'k-egen-farge' }, inp, h('span', { text: par[1] })));
    });

    kropp.append(seksjon('Farger', h('div', { class: 'k-stabel' }, palettBoks, egne), true));
    kropp.append(seksjon('Verden i bakgrunnen', chips(VERDENER, st.verden, 'verden')));
    kropp.append(seksjon('Skrift', chips(SKRIFTER, st.skrift, 'skrift', function (c, k) { var s = SKRIFTER[k]; c.style.fontFamily = s.disp; c.style.fontWeight = s.w; c.style.fontSize = '15px'; if (s.store) c.style.textTransform = 'uppercase'; })));
    kropp.append(seksjon('Rammer', chips(RAMMESTILER, st.ramme, 'ramme')));
    kropp.append(seksjon('Tekst kommer inn', chips(INNGANGER, st.inn, 'inn')));
    var bevBoks = h('div', { class: 'k-stabel' }, chips(BEVEGELSER, st.bevegelse, 'bevegelse'), h('div', { class: 'k-etikett', text: 'Kameraovergang' }), chips(OVERGANGER, st.overgang, 'overgang'));
    var fart = h('input', { type: 'range', id: 'k-fart', class: 'k-glider', min: '0.5', max: '1.8', step: '0.1', value: String(doc.fart) });
    fart.addEventListener('input', function () { doc.fart = +fart.value; senereHistorikk(); });
    var pust = h('input', { type: 'checkbox', id: 'k-pust' });
    pust.checked = st.pust !== false;
    pust.addEventListener('change', function () { doc.stil.pust = pust.checked; lagreHistorikk(); });
    bevBoks.append(felt('Fart', fart, 'k-fart'), h('label', { class: 'k-bryter', for: 'k-pust' }, pust, 'Levende kamera – bildet puster sakte når du står stille'));
    kropp.append(seksjon('Bevegelse', bevBoks));
    var korn = h('input', { type: 'range', id: 'k-korn', class: 'k-glider', min: '0', max: '0.2', step: '0.01', value: String(st.korn) });
    korn.addEventListener('input', function () { doc.stil.korn = +korn.value; brukStil(); senereHistorikk(); });
    kropp.append(seksjon('Detaljer', h('div', { class: 'k-stabel' }, h('div', { class: 'k-etikett', text: 'Stien mellom rammene' }), chips(STIER, st.sti, 'sti'), felt('Filmkorn', korn, 'k-korn'))));

    var liste = h('ol', { class: 'k-sti-liste' });
    var draIdx = -1;
    doc.sti.forEach(function (e, i) {
      var f = typeof e === 'string' ? ramme(e) : null;
      var li = h('li', { draggable: 'true', 'data-i': i, class: i === pos ? 'k-her' : '' },
        h('span', { class: 'k-nr', text: String(i + 1) }),
        h('span', { class: 'k-navn', text: f ? tittelPa(f) : 'Utsnitt' }));
      function mini(navn, tekst, fn, av) {
        var b = h('button', { type: 'button', class: 'k-mini', title: tekst, 'aria-label': tekst, html: ikon(navn), onclick: function (ev) { ev.stopPropagation(); fn(); } });
        if (av) b.disabled = true;
        return b;
      }
      li.append(
        mini('opp', 'Flytt opp', function () { flyttSti(i, i - 1); }, i === 0),
        mini('ned', 'Flytt ned', function () { flyttSti(i, i + 1); }, i === doc.sti.length - 1),
        mini('x', 'Fjern fra stien', function () { doc.sti.splice(i, 1); pos = clamp(pos, 0, Math.max(0, doc.sti.length - 1)); tegnSti(); lagreHistorikk(); byggPanel(); byggMerker(); })
      );
      li.addEventListener('click', function () { pos = i; viste = 0; flyTil(visningFor(e)); markerStiRad(); });
      li.addEventListener('dblclick', function () { if (f) velg(f.id); });
      li.addEventListener('dragstart', function (ev) { draIdx = i; ev.dataTransfer.effectAllowed = 'move'; try { ev.dataTransfer.setData('text/plain', String(i)); } catch (er) { /* ok */ } });
      li.addEventListener('dragover', function (ev) { ev.preventDefault(); li.classList.add('k-dra-over'); });
      li.addEventListener('dragleave', function () { li.classList.remove('k-dra-over'); });
      li.addEventListener('drop', function (ev) { ev.preventDefault(); ev.stopPropagation(); li.classList.remove('k-dra-over'); if (draIdx >= 0 && draIdx !== i) flyttSti(draIdx, draIdx < i ? i - 1 : i); draIdx = -1; });
      liste.append(li);
    });
    if (!doc.sti.length) liste.append(h('li', { style: { cursor: 'default' }, text: 'Stien er tom. Legg til rammer med knappen nede.' }));
    kropp.append(felt(h('span', { class: 'k-etikett', text: 'Sti · rekkefølgen du presenterer i' }), h('div', { class: 'k-stabel' }, liste,
      h('div', { class: 'k-knapperad' }, knapp('pluss', 'Stopp her også', function () {
        var m = midtpunkt();
        var bredde = (panelPa() ? W - PANEL : W) / cam.z;
        doc.sti.splice(Math.min(pos + 1, doc.sti.length), 0, { x: Math.round(m.x), y: Math.round(m.y), b: Math.round(bredde), h: Math.round(H / cam.z), r: Math.round(cam.r) });
        pos = Math.min(pos + 1, doc.sti.length - 1);
        tegnSti(); lagreHistorikk(); byggPanel();
        toast('Utsnittet er lagt i stien. Kameraet stopper akkurat her.');
      })))));

    kropp.append(felt(h('span', { class: 'k-etikett', text: 'Ordne rammene automatisk' }), h('div', { class: 'k-knapperad' },
      [['reise', 'Reise', 'En bølgende vei fra venstre mot høyre'], ['spiral', 'Spiral', 'Hver ramme mindre enn den forrige'], ['dykk', 'Dykk', 'Hver ramme gjemt inne i den forrige'],
        ['bane', 'Bane', 'Første ramme i midten, resten i bane rundt'], ['tidslinje', 'Tidslinje', 'Annenhver over og under en linje'], ['rutenett', 'Rutenett', 'På rad og rekke']].map(function (o) {
        return h('button', { class: 'k-btn', type: 'button', text: o[1], title: o[2], onclick: function () { ordne(o[0]); } });
      }))));

    kropp.append(felt(h('span', { class: 'k-etikett', text: 'Lagre' }), h('div', { class: 'k-stabel' },
      h('div', { class: 'k-knapperad' },
        knapp('lagre', 'Lagre fil', lagre, { class: 'k-btn k-primar' }),
        knapp('kopi', 'Kopier som tekst', kopierTekst)),
      h('div', { class: 'k-hint', text: 'Hele presentasjonen ligger i én HTML-fil. «Kopier som tekst» gir deg innholdet, som du kan lime inn hos Claude for å få endringer.' }))));

    panel.append(kropp);
  }
  function markerStiRad() {
    $$('.k-sti-liste li', panel).forEach(function (li) { li.classList.toggle('k-her', +li.dataset.i === pos); });
  }
  function flyttSti(fra, til) {
    if (til < 0 || til >= doc.sti.length) return;
    var e = doc.sti.splice(fra, 1)[0];
    doc.sti.splice(til, 0, e);
    if (pos === fra) pos = til;
    tegnSti(); lagreHistorikk(); byggPanel(); byggMerker();
  }

  /* ---------- Lagring ---------- */

  var filHandle = null;
  var iRamme = (function () { try { return window.top !== window; } catch (e) { return true; } })();
  function somHTML() {
    var css = ($('#krizi-style') || {}).textContent || '';
    var js = ($('#krizi-engine') || {}).textContent || '';
    var json = JSON.stringify(doc, null, 1).replace(/</g, '\\u003c');
    var lenker = aktivStil().f.urls.map(function (u) { return '<link rel="stylesheet" href="' + u.replace(/&/g, '&amp;') + '">\n'; }).join('');
    return '<!doctype html>\n<html lang="no">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n' +
      '<title>' + esc(doc.tittel) + LUKK + 'title>\n<meta name="generator" content="Krizi ' + VERSJON + '">\n' +
      '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n' + lenker +
      '<style id="krizi-style">' + css + LUKK + 'style>\n' + LUKK + 'head>\n<body>\n' +
      '<script type="application/json" id="krizi-data">\n' + json + '\n' + LUKK + 'script>\n' +
      '<script id="krizi-engine">' + js + LUKK + 'script>\n' + LUKK + 'body>\n' + LUKK + 'html>\n';
  }
  function filnavn() {
    var s = doc.tittel.toLowerCase().replace(/[æ]/g, 'ae').replace(/[ø]/g, 'o').replace(/[å]/g, 'a').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    return (s || 'presentasjon') + '.html';
  }
  function lagret() { ulagret = false; lager.del(UTKAST); oppdaterStatus(); }
  function lagre() {
    avsluttSkriv(true);
    lagreHistorikk();
    var html = somHTML();
    if (iRamme) {
      kopierTekst('Her kan ikke siden lagre filer, så presentasjonen er kopiert som tekst. Lim den inn hos Claude, eller åpne HTML-fila lokalt for å lagre.');
      lagreUtkast();
      return;
    }
    if (window.showSaveFilePicker) {
      var p = filHandle ? Promise.resolve(filHandle) : window.showSaveFilePicker({ suggestedName: filnavn(), types: [{ description: 'Krizi-presentasjon', accept: { 'text/html': ['.html'] } }] });
      p.then(function (handle) {
        filHandle = handle;
        return handle.createWritable().then(function (w) { return w.write(html).then(function () { return w.close(); }); });
      }).then(function () { lagret(); toast('Lagret i «' + (filHandle.name || filnavn()) + '».'); })
        .catch(function (e) { if (e && e.name === 'AbortError') return; lastNed(html); });
      return;
    }
    lastNed(html);
  }
  function lastNed(html) {
    try {
      var blob = new Blob([html], { type: 'text/html' });
      var a = h('a', { href: URL.createObjectURL(blob), download: filnavn() });
      document.body.append(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      lagret();
      toast('Lastet ned «' + filnavn() + '». Åpne den fila neste gang.', [{ tekst: 'Kopier som tekst', fn: kopierTekst }], 6000);
    } catch (e) { kopierTekst(); }
  }
  function kopierTekst(melding) {
    var tekst = JSON.stringify(doc, null, 1);
    var ok = function () { toast(typeof melding === 'string' ? melding : 'Presentasjonen er kopiert. Lim den inn hos Claude for å få endringer.', null, 6000); };
    try { navigator.clipboard.writeText(tekst).then(ok, function () { visTekst(tekst); }); }
    catch (e) { visTekst(tekst); }
  }
  function visTekst(tekst) {
    var ta = h('textarea', { rows: 12, style: { width: '100%', fontSize: '12px' } });
    ta.value = tekst;
    hjelp.innerHTML = '';
    hjelp.append(h('div', null, h('h2', { text: 'Presentasjonen som tekst' }), h('p', { text: 'Merk alt og kopier.' }), ta));
    hjelp.classList.add('k-pa');
    ta.focus(); ta.select();
  }

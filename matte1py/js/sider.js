/* Ekstra sider: oppgåveark (penn og papir), løysingsforslag, ressursar,
   kapittelbilete og Matteløypa med sprint. */
(function () {
  'use strict';
  const { el } = MT;
  const iRamme = (() => { try { return window.self !== window.top; } catch (e) { return true; } })();
  const NIVA = { 1: 'Grunnleggjande', 2: 'Middels', 3: 'Utfordrande' };
  const BOKST = 'abcdefgh';
  MT.sider = {};

  /* ---------- Bilete med kreditering ---------- */
  MT.sider.bilete = function (b, klasse = 'kap-bilete') {
    if (!b) return null;
    const fig = el('figure', { class: klasse });
    const img = el('img', { src: b.src, alt: b.tekst, loading: 'lazy', decoding: 'async', referrerpolicy: 'no-referrer' });
    img.addEventListener('error', () => fig.remove());
    img.addEventListener('load', () => fig.classList.add('lasta'));
    fig.append(img, el('figcaption', {}, el('span', {}, b.tekst), el('a', { href: b.side, target: '_blank', rel: 'noopener' }, 'Foto: Wikimedia Commons')));
    return fig;
  };

  /* ---------- Ressursblokk: video og lenker ---------- */
  MT.sider.ressursar = function (vert, k) {
    const r = MT.ressursar[k.id] || { lenker: [], video: [] };
    if (r.bilete2) { const f = MT.sider.bilete(r.bilete2, 'kap-bilete smal-bilete'); f && vert.append(f); }
    if (r.video.length) {
      const vg = el('div', { class: 'video-rad' });
      r.video.forEach((v) => {
        const kort = el('div', { class: 'video-kort' });
        const url = 'https://www.youtube.com/watch?v=' + v.yt;
        const tom = el('a', { class: 'video-flate', href: url, target: '_blank', rel: 'noopener', 'aria-label': 'Sjå videoen ' + v.tittel });
        const bilde = el('img', { src: 'https://i.ytimg.com/vi/' + v.yt + '/hqdefault.jpg', alt: '', loading: 'lazy' });
        bilde.addEventListener('error', () => bilde.remove());
        tom.append(bilde, el('span', { class: 'spel-av', 'aria-hidden': 'true' }, '▶'));
        if (!iRamme) tom.addEventListener('click', (e) => { e.preventDefault(); const f = el('iframe', { src: 'https://www.youtube-nocookie.com/embed/' + v.yt + '?autoplay=1&rel=0', title: v.tittel, allow: 'autoplay; encrypted-media; picture-in-picture', allowfullscreen: true, loading: 'lazy' }); tom.replaceWith(el('div', { class: 'video-flate' }, f)); });
        kort.append(tom, el('div', { class: 'video-tekst' }, el('span', { class: 'merkelapp' }, 'Video · ' + v.kjelde), el('b', {}, v.tittel)));
        vg.append(kort);
      });
      vert.append(vg);
    }
    const ll = el('div', { class: 'lenke-liste' });
    r.lenker.forEach((l, i) => ll.append(el('a', { class: 'lenke-kort', href: l.url, target: '_blank', rel: 'noopener', style: `--d:${i * 70}ms` }, el('span', { class: 'kjelde mono' }, l.kjelde), el('b', {}, l.tittel), el('span', { class: 'ut-pil', 'aria-hidden': 'true' }, '↗'))));
    vert.append(ll, el('p', { class: 'svak liten' }, 'Lenkene opnar NDLA og andre sider i ei ny fane. NDLA har både fagtekstar, videoar og oppgåver for 1P-Y.'));
  };

  /* ---------- Førehandsvising av oppgåvearket i kapittelet ---------- */
  MT.sider.papirBlokk = function (vert, k) {
    const opp = MT.papir[k.id] || [];
    const gjort = MT.les('papir-' + k.id, {});
    const kort = el('div', { class: 'papir-kort' });
    kort.append(el('div', { class: 'papir-ark', 'aria-hidden': 'true' }, ...opp.slice(0, 4).map((o, i) => el('div', { class: 'papir-linje', style: `--d:${i * 90}ms` }, el('b', { class: 'mono' }, (i + 1) + '.'), el('span', {}, '')))),
      el('div', { class: 'papir-info' },
        el('h3', {}, `${opp.length} oppgåver for blyant og kalkulator`),
        el('p', { class: 'svak' }, `Frå grunnleggjande til utfordrande, med deloppgåver. Du har kryssa av ${Object.values(gjort).filter(Boolean).length} av ${opp.length}.`),
        el('div', { class: 'niva-rad' }, ...[1, 2, 3].map((n) => el('span', { class: 'niva n' + n }, NIVA[n] + ' · ' + opp.filter((o) => o.n === n).length))),
        el('div', { class: 'rad' }, el('a', { class: 'knapp', href: '#papir-' + k.id }, 'Opne oppgåvearket'), el('a', { class: 'knapp sekundar', href: '#fasit-' + k.id }, 'Løysingsforslag'))));
    vert.append(kort);
  };

  function arkHode(k, fasit) {
    const h = el('header', { class: 'kap-topp ark-topp' });
    h.append(el('a', { class: 'tilbake-lenke', href: '#k-' + k.id + '--papir' }, '← Tilbake til kapittel ' + k.nr),
      el('p', { class: 'merkelapp' }, (fasit ? 'Løysingsforslag' : 'Oppgåveark') + ' · kapittel ' + k.nr),
      el('h1', {}, k.tittel),
      el('p', { class: 'ingress' }, fasit ? 'Prøv sjølv først. Opne løysinga på éi og éi oppgåve, og samanlikn med utrekninga di. Det finst ofte fleire rette måtar å løyse ei oppgåve på.' : 'Løys oppgåvene i kladdeboka eller på eit ark. Skriv utrekninga, ikkje berre svaret. Kryss av når du er ferdig.'),
      el('div', { class: 'rad' },
        el('a', { class: 'knapp ' + (fasit ? 'sekundar' : ''), href: fasit ? '#papir-' + k.id : '#fasit-' + k.id }, fasit ? '← Til oppgåvene' : 'Til løysingsforslaget →'),
        iRamme ? null : el('button', { class: 'knapp sekundar', onclick: () => window.print() }, 'Skriv ut'),
        fasit ? el('button', { class: 'knapp sekundar', onclick: () => MT.$$('details.fasit').forEach((d) => (d.open = true)) }, 'Vis alle løysingane') : null));
    return h;
  }

  MT.sider.papir = function (hovud, k, fasit) {
    const opp = MT.papir[k.id] || [];
    const gjort = MT.les('papir-' + k.id, {});
    hovud.append(arkHode(k, fasit));
    const ark = el('ol', { class: 'ark' + (fasit ? ' er-fasit' : '') });
    opp.forEach((o, i) => {
      const li = el('li', { class: 'ark-oppg', style: `--d:${i * 60}ms` });
      const hode = el('div', { class: 'ark-hode' }, el('span', { class: 'ark-nr mono' }, String(i + 1)), el('span', { class: 'niva n' + o.n }, NIVA[o.n]));
      if (!fasit) {
        const id = `gjort-${k.id}-${i}`;
        const cb = el('input', { type: 'checkbox', id, checked: !!gjort[i] });
        cb.addEventListener('change', () => { gjort[i] = cb.checked; MT.skriv('papir-' + k.id, gjort); li.classList.toggle('gjort', cb.checked); if (cb.checked) { const r = cb.getBoundingClientRect(); MT.konfetti(r.left, r.top, 18); } });
        hode.append(el('label', { class: 'gjort-merke', for: id }, cb, ' Ferdig'));
        li.classList.toggle('gjort', !!gjort[i]);
      }
      li.append(hode, el('div', { class: 'ark-tekst', html: o.t }));
      const dl = el('ol', { class: 'ark-del', type: 'a' });
      o.d.forEach((d, j) => {
        const del = el('li', {}, el('div', { html: d }));
        if (fasit) { const det = el('details', { class: 'fasit' }); det.append(el('summary', {}, 'Vis løysing ' + BOKST[j] + ')'), el('div', { class: 'fasit-tekst', html: o.l[j] || '' })); del.append(det); }
        else del.append(el('div', { class: 'skrivelinjer', 'aria-hidden': 'true' }));
        dl.append(del);
      });
      li.append(dl);
      ark.append(li);
    });
    hovud.append(el('div', { class: 'smal' }, ark));
  };

  MT.sider.papirOversikt = function (hovud, K) {
    hovud.append(el('header', { class: 'kap-topp' }, el('a', { class: 'tilbake-lenke', href: '#start' }, '← Framsida'), el('p', { class: 'merkelapp' }, 'Penn og papir'), el('h1', {}, 'Oppgåvehefte'), el('p', { class: 'ingress' }, 'Oppgåver til kvart kapittel som du løyser for hand, med eigne sider for løysingsforslag. Fint til lekser, repetisjon og prøveførebuing.')));
    const g = el('div', { class: 'kort-liste' });
    K.forEach((k) => { const opp = MT.papir[k.id] || [], gjort = Object.values(MT.les('papir-' + k.id, {})).filter(Boolean).length; g.append(el('div', { class: 'kap-kort hefte', style: `--p:${opp.length ? gjort / opp.length : 0}` }, el('span', { class: 'kap-nr mono' }, String(k.nr).padStart(2, '0')), el('h3', {}, k.tittel), el('p', {}, `${opp.length} oppgåver · ${gjort} ferdige`), el('div', { class: 'rad' }, el('a', { class: 'knapp', href: '#papir-' + k.id }, 'Oppgåver'), el('a', { class: 'knapp sekundar', href: '#fasit-' + k.id }, 'Løysing')), el('span', { class: 'kap-bar' }, el('span')))); });
    hovud.append(g, el('h2', { class: 'seksjonstittel' }, 'Eksamenstrening'), el('div', { class: 'lenke-liste' }, ...MT.ressursar.felles.map((l) => el('a', { class: 'lenke-kort', href: l.url, target: '_blank', rel: 'noopener' }, el('span', { class: 'kjelde mono' }, l.kjelde), el('b', {}, l.tittel), el('span', { class: 'ut-pil' }, '↗')))));
  };

  /* ---------- Matteløypa med fri modus og sprint ---------- */
  MT.sider.trening = function (hovud, K) {
    let valde = new Set(MT.les('treningval', K.map((k) => k.id)));
    let modus = 'fri';
    hovud.append(el('header', { class: 'kap-topp' }, el('a', { class: 'tilbake-lenke', href: '#start' }, '← Framsida'), el('p', { class: 'merkelapp' }, 'Blanda trening'), el('h1', {}, 'Matteløypa'), el('p', { class: 'ingress' }, 'Oppgåver frå kapitla du vel. Rett på første forsøk gir XP, og rekkja di gir kombo: 5 på rad gir dobbel XP, 10 på rad gir trippel. Eitt feil, og kombo startar på nytt.')));
    const brikker = el('div', { class: 'brikker' });
    K.forEach((k) => brikker.append(el('button', { class: 'brikke' + (valde.has(k.id) ? ' pa' : ''), 'aria-pressed': valde.has(k.id), onclick: (e) => { valde.has(k.id) ? valde.delete(k.id) : valde.add(k.id); if (!valde.size) valde.add(k.id); MT.skriv('treningval', [...valde]); e.currentTarget.classList.toggle('pa', valde.has(k.id)); e.currentTarget.setAttribute('aria-pressed', valde.has(k.id)); start(); } }, k.nr + '. ' + k.tittel)));
    const modusEl = el('div', { class: 'faner' });
    [['fri', 'Fri trening'], ['sprint', 'Sprint · 90 sekund']].forEach(([m, t]) => modusEl.append(el('button', { class: 'fane' + (m === modus ? ' pa' : ''), 'data-m': m, onclick: () => { modus = m; MT.$$('.fane', modusEl).forEach((b) => b.classList.toggle('pa', b.dataset.m === m)); start(); } }, t)));
    const vert = el('div', { class: 'trening-vert' });
    hovud.append(el('div', { class: 'smal' }, modusEl, el('p', { class: 'merkelapp' }, 'Kapittel med i løypa'), brikker, vert));
    let timer;
    const gens = () => MT.stokk(K.filter((k) => valde.has(k.id)).flatMap((k) => k.seksjonar.find((s) => s.id === 'oving').blokker[0].generatorar.map((g) => () => { const o = g(); o.kap = k.id; o.tekst = `<span class="kap-merke mono">Kap. ${k.nr}</span> ` + o.tekst; return o; })));
    function start() {
      clearInterval(timer); vert.innerHTML = '';
      if (modus === 'fri') { MT.ovingsboks(vert, { kapId: 'blanda', generatorar: gens(), tittel: 'Matteløypa' }); return; }
      const best = MT.les('sprint-best', 0);
      const intro = el('div', { class: 'sprint-intro' }, el('div', { class: 'sprint-tal mono' }, '90'), el('div', {}, el('h2', {}, 'Sprint'), el('p', {}, `Løys så mange oppgåver du klarer på 90 sekund. Rett gir 1 poeng. Rekorden din er ${best}.`), el('button', { class: 'knapp stor', onclick: kjor }, 'Start sprinten')));
      vert.append(intro);
    }
    function kjor() {
      vert.innerHTML = '';
      let poeng = 0, igjen = 90;
      const klokke = el('div', { class: 'sprint-klokke' });
      const tegnKlokke = () => { const o = 2 * Math.PI * 28; klokke.innerHTML = `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="28" class="ring-bak"></circle><circle cx="32" cy="32" r="28" class="ring-fram ${igjen <= 10 ? 'kritisk' : ''}" style="stroke-dasharray:${o};stroke-dashoffset:${o * (1 - igjen / 90)}"></circle></svg><b class="mono">${igjen}</b><span class="mono">${poeng} poeng</span>`; };
      vert.append(klokke); tegnKlokke();
      const boksVert = el('div');
      vert.append(boksVert);
      MT.ovingsboks(boksVert, { kapId: 'blanda', generatorar: gens(), tittel: 'Sprint', vedSvar: (rett) => { if (rett) { poeng++; tegnKlokke(); } } });
      timer = setInterval(() => {
        igjen--; tegnKlokke();
        if (igjen <= 0) {
          clearInterval(timer);
          const best = MT.les('sprint-best', 0), rekord = poeng > best;
          if (rekord) MT.skriv('sprint-best', poeng);
          vert.innerHTML = '';
          vert.append(el('div', { class: 'sprint-slutt' }, el('p', { class: 'merkelapp' }, 'Tida er ute'), el('div', { class: 'sprint-tal mono' }, String(poeng)), el('p', {}, rekord ? 'Ny rekord!' : `Rekorden din er ${best}.`), el('button', { class: 'knapp stor', onclick: kjor }, 'Ein gong til'), el('button', { class: 'knapp sekundar stor', onclick: start }, 'Tilbake')));
          if (rekord) { const r = vert.getBoundingClientRect(); MT.konfetti(r.left + r.width / 2, r.top + 80, 120); }
        }
      }, 1000);
    }
    addEventListener('hashchange', () => clearInterval(timer), { once: true });
    start();
  };
})();

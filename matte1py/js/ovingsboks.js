/* Øvingsboksen: animert oppgåvekort med kombo, meistringsring,
   konfetti av matematiske symbol, rettestempel, raud penn ved feil
   og eit kladdeark eleven kan teikne på. */
(function () {
  'use strict';
  const el = MT.el;

  /* ---------- Konfetti av matematiske symbol ---------- */
  let konfCanvas, konfCtx, partiklar = [], konfRaf;
  const SYMBOL = ['π', '∑', '√', '%', '+', '×', '÷', '=', '∞', 'Δ', 'x²', '½', '∫', '≈', '°'];
  MT.konfetti = function (x, y, mengd = 46) {
    if (MT.roleg) return;
    if (!konfCanvas) {
      konfCanvas = el('canvas', { class: 'konfetti', 'aria-hidden': 'true' });
      document.body.append(konfCanvas); konfCtx = konfCanvas.getContext('2d');
    }
    const dpr = devicePixelRatio || 1; konfCanvas.width = innerWidth * dpr; konfCanvas.height = innerHeight * dpr; konfCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const F = [MT.farge('accent'), MT.farge('green'), MT.farge('amber'), MT.farge('red'), MT.farge('ink')];
    for (let i = 0; i < mengd; i++) {
      const v = Math.random() * Math.PI * 2, f = 4 + Math.random() * 9;
      partiklar.push({ x, y, vx: Math.cos(v) * f, vy: Math.sin(v) * f - 7, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.3, s: MT.vel(SYMBOL), c: MT.vel(F), str: 14 + Math.random() * 16, liv: 1 });
    }
    cancelAnimationFrame(konfRaf);
    const steg = () => {
      konfCtx.clearRect(0, 0, innerWidth, innerHeight);
      partiklar = partiklar.filter((p) => p.liv > 0 && p.y < innerHeight + 40);
      partiklar.forEach((p) => {
        p.vy += 0.32; p.vx *= 0.985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.liv -= 0.009;
        konfCtx.save(); konfCtx.translate(p.x, p.y); konfCtx.rotate(p.r); konfCtx.globalAlpha = Math.max(0, Math.min(1, p.liv * 1.6));
        konfCtx.fillStyle = p.c; konfCtx.font = `700 ${p.str}px "STIX Two Text", Georgia, serif`; konfCtx.textAlign = 'center'; konfCtx.fillText(p.s, 0, 0); konfCtx.restore();
      });
      if (partiklar.length) konfRaf = requestAnimationFrame(steg); else konfCtx.clearRect(0, 0, innerWidth, innerHeight);
    };
    konfRaf = requestAnimationFrame(steg);
  };

  /* XP flyg frå kortet opp til XP-merket i toppen */
  MT.xpFlyg = function (fraEl, xp) {
    const mal = document.getElementById('xp'); if (!mal || !xp) return;
    const a = fraEl.getBoundingClientRect(), b = mal.getBoundingClientRect();
    const f = el('div', { class: 'xp-flyg mono' }, '+' + xp + ' XP');
    document.body.append(f);
    const x0 = a.left + a.width / 2, y0 = a.top + a.height / 2;
    f.style.left = x0 + 'px'; f.style.top = y0 + 'px';
    if (MT.roleg || !f.animate) { setTimeout(() => f.remove(), 600); return; }
    f.animate([
      { transform: 'translate(-50%,-50%) scale(.6)', opacity: 0 },
      { transform: 'translate(-50%,-120%) scale(1.25)', opacity: 1, offset: 0.25 },
      { transform: `translate(calc(${b.left + b.width / 2 - x0}px - 50%), calc(${b.top + b.height / 2 - y0}px - 50%)) scale(.5)`, opacity: 0.2 },
    ], { duration: 1100, easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = () => f.remove();
  };

  /* ---------- Kladdeark ---------- */
  function kladdeark() {
    const vert = el('div', { class: 'kladd' });
    const c = el('canvas', { class: 'kladd-flate', 'aria-label': 'Kladdeark: teikn og rekn med fingeren eller musa' });
    let farge = 'ink', viskar = false, teiknar = false, sist = null;
    const verktoy = el('div', { class: 'kladd-verktoy' });
    [['ink', 'Blyant'], ['accent', 'Blå'], ['red', 'Raud']].forEach(([f, t]) => verktoy.append(el('button', { class: 'kladd-farge' + (f === farge ? ' pa' : ''), style: `--f:var(--${f})`, 'aria-label': t, title: t, onclick: (e) => { farge = f; viskar = false; MT.$$('button', verktoy).forEach((b) => b.classList.remove('pa')); e.currentTarget.classList.add('pa'); } })));
    verktoy.append(el('button', { class: 'kladd-knapp', title: 'Viskelêr', onclick: (e) => { viskar = true; MT.$$('button', verktoy).forEach((b) => b.classList.remove('pa')); e.currentTarget.classList.add('pa'); } }, 'Viskelêr'), el('button', { class: 'kladd-knapp', onclick: () => { const ctx = c.getContext('2d'); ctx.clearRect(0, 0, c.width, c.height); } }, 'Tøm'));
    vert.append(verktoy, c);
    const tilpass = () => { const dpr = devicePixelRatio || 1, w = c.clientWidth, h = c.clientHeight; if (!w) return; const tmp = c.width ? c.getContext('2d').getImageData(0, 0, c.width, c.height) : null; c.width = w * dpr; c.height = h * dpr; const ctx = c.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); if (tmp) ctx.putImageData(tmp, 0, 0); };
    new ResizeObserver(tilpass).observe(c);
    const pos = (e) => { const r = c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top, e.pressure || 0.5]; };
    c.addEventListener('pointerdown', (e) => { teiknar = true; sist = pos(e); c.setPointerCapture(e.pointerId); e.preventDefault(); });
    c.addEventListener('pointermove', (e) => {
      if (!teiknar) return; const p = pos(e), ctx = c.getContext('2d');
      ctx.globalCompositeOperation = viskar ? 'destination-out' : 'source-over';
      ctx.strokeStyle = MT.farge(farge); ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.lineWidth = viskar ? 22 : 1.6 + p[2] * 2.2;
      ctx.beginPath(); ctx.moveTo(sist[0], sist[1]); ctx.quadraticCurveTo(sist[0], sist[1], (sist[0] + p[0]) / 2, (sist[1] + p[1]) / 2); ctx.lineTo(p[0], p[1]); ctx.stroke();
      sist = p;
    });
    const slutt = () => { teiknar = false; };
    c.addEventListener('pointerup', slutt); c.addEventListener('pointercancel', slutt);
    return vert;
  }

  /* ---------- Meistringsring ---------- */
  function ring(p) {
    const r = 17, o = 2 * Math.PI * r;
    return `<svg viewBox="0 0 44 44" class="ring" aria-hidden="true"><circle cx="22" cy="22" r="${r}" class="ring-bak"></circle><circle cx="22" cy="22" r="${r}" class="ring-fram" style="stroke-dasharray:${o};stroke-dashoffset:${o * (1 - p)}"></circle></svg>`;
  }

  /* ---------- Sjølve boksen ---------- */
  MT.ovingsboks = function (vert, { kapId, generatorar, tittel = 'Øving', vedSvar } = {}) {
    const boks = el('div', { class: 'oving' });
    const topp = el('div', { class: 'oving-topp' });
    const ringEl = el('div', { class: 'oving-ring' });
    const kombo = el('div', { class: 'kombo mono', 'aria-live': 'polite' });
    const spor = el('div', { class: 'spor', 'aria-hidden': 'true' });
    topp.append(el('div', { class: 'oving-tittel' }, ringEl, el('div', {}, el('span', { class: 'merkelapp' }, tittel), el('span', { class: 'oving-tel mono' }))), spor, kombo);
    const scene = el('div', { class: 'oving-scene' });
    boks.append(topp, scene);
    vert.append(boks);
    const historikk = [];
    let nr = 0, o, kladdOpen = MT.les('kladd', false);

    const visTopp = () => {
      const tel = MT.$('.oving-tel', topp);
      if (kapId === 'blanda') { const rg = MT.rang(); ringEl.innerHTML = ring(rg.til ? (MT.lager.xp - rg.fra) / (rg.til - rg.fra) : 1); tel.textContent = `${rg.namn} · ${MT.lager.xp} XP`; }
      else { const r = MT.lager.rett[kapId] || 0; ringEl.innerHTML = ring(MT.framdrift(kapId)); tel.textContent = `${Math.min(r, MT.MAAL)}/${MT.MAAL} mot meistring`; }
      const k = MT.kombo(), rk = MT.lager.rekke;
      kombo.className = 'kombo mono k' + k + (rk ? ' aktiv' : '');
      kombo.innerHTML = `<span class="kombo-x">×${k}</span><span class="kombo-r">${rk} på rad</span>`;
      spor.innerHTML = historikk.slice(-10).map((h) => `<i class="${h ? 'r' : 'f'}"></i>`).join('');
    };
    document.addEventListener('mt:framdrift', visTopp);

    function ny() {
      nr++;
      const gen = nr <= generatorar.length ? generatorar[nr - 1] : MT.vel(generatorar);
      o = gen();
      visTopp();
      const gammal = MT.$('.kort', scene);
      if (gammal) { gammal.classList.add('ut'); setTimeout(() => gammal.remove(), 260); }
      const kort = el('article', { class: 'kort inn' });
      setTimeout(() => kort.classList.remove('inn'), 20);
      kort.append(el('div', { class: 'kort-hode' }, el('span', { class: 'kort-nr mono' }, 'Oppgåve ' + String(nr).padStart(2, '0')), el('button', { class: 'kladd-brytar' + (kladdOpen ? ' pa' : ''), type: 'button', 'aria-pressed': kladdOpen, onclick: (e) => { kladdOpen = !kladdOpen; MT.skriv('kladd', kladdOpen); e.currentTarget.classList.toggle('pa', kladdOpen); e.currentTarget.setAttribute('aria-pressed', kladdOpen); kladdVert.hidden = !kladdOpen; } }, '✎ Kladdeark')));
      kort.append(el('div', { class: 'oppg-tekst', html: o.tekst }));
      const stempel = el('div', { class: 'stempel', 'aria-hidden': 'true' }, 'RETT');
      const tilbake = el('div', { class: 'tilbake', 'aria-live': 'polite' });
      const ekstra = el('div', { class: 'oppg-ekstra' });
      let forsok = 0, ferdig = false, svarFelt;

      const resultat = (rett) => {
        forsok++;
        if (rett === null) { tilbake.className = 'tilbake info'; tilbake.textContent = 'Skriv svaret som eit tal, til dømes 12,5'; return; }
        if (rett) {
          const forste = forsok === 1 && !ferdig;
          let xp = 0;
          if (!ferdig) { xp = MT.registrer(o.kap || kapId, forsok === 1); historikk.push(forsok === 1); }
          ferdig = true;
          kort.classList.add('er-rett'); kort.classList.remove('er-feil');
          stempel.textContent = forste ? MT.vel(['RETT!', 'TOPP!', 'JA!', 'PERFEKT']) : 'RETT';
          stempel.classList.add('vis');
          tilbake.className = 'tilbake rett';
          tilbake.innerHTML = MT.mat(forste ? (MT.lager.rekke >= 3 ? `${MT.lager.rekke} rette på rad!` : 'Rett på første forsøk.') : 'Rett! Neste gong klarer du det på første forsøk.');
          const r = (svarFelt || kort).getBoundingClientRect();
          if (forste) { MT.konfetti(r.left + r.width / 2, r.top, MT.lager.rekke >= 5 ? 80 : 40); MT.xpFlyg(svarFelt || kort, xp); }
          visKnapp(neste, true);
          if (o.losning) losKnapp.hidden = false;
          vedSvar && vedSvar(forste);
          setTimeout(() => neste.focus(), 40);
        } else {
          if (forsok === 1) { MT.registrer(o.kap || kapId, false); historikk.push(false); vedSvar && vedSvar(false); }
          kort.classList.remove('er-feil'); void kort.offsetWidth; kort.classList.add('er-feil');
          tilbake.className = 'tilbake feil';
          tilbake.innerHTML = MT.mat(forsok === 1 ? 'Ikkje heilt. Sjå over utrekninga og prøv igjen.' : forsok === 2 ? 'Framleis feil. Ta eit tips?' : 'Sjå løysinga, og prøv ei ny oppgåve.');
          if (o.tips) tipsKnapp.classList.add('puls');
          if (forsok >= 2 && o.losning) losKnapp.hidden = false;
        }
      };

      if (o.val) {
        const vg = el('div', { class: 'val-grid' });
        o.val.forEach((t, i) => vg.append(el('button', { class: 'val', style: `--d:${i * 60}ms`, html: t, onclick: (e) => { if (ferdig) return; const r = MT.sjekk(o, i); e.currentTarget.classList.add(r ? 'rett' : 'feil'); svarFelt = e.currentTarget; resultat(r); } })));
        kort.append(vg);
      } else {
        const inn = el('input', { class: 'svar-inn mono', inputmode: 'decimal', autocomplete: 'off', placeholder: '?', 'aria-label': 'Svaret ditt', id: 'svar-' + kapId + '-' + nr });
        const tolking = el('span', { class: 'tolking mono', 'aria-hidden': 'true' });
        inn.addEventListener('input', () => { const v = MT.tolk(inn.value); tolking.textContent = inn.value.trim() === '' ? '' : isNaN(v) ? 'kan ikkje lese talet' : '= ' + MT.n(v, 6) + (o.eining ? ' ' + o.eining.replace(/<[^>]+>/g, '') : ''); tolking.classList.toggle('ugyldig', inn.value.trim() !== '' && isNaN(v)); kort.classList.remove('er-feil'); });
        const skjema = el('form', { class: 'svar-rad', onsubmit: (e) => { e.preventDefault(); if (ferdig) { ny(); return; } resultat(MT.sjekk(o, inn.value)); } });
        const felt = el('div', { class: 'svar-felt' }, inn);
        felt.insertAdjacentHTML('beforeend', '<svg class="raudpenn" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M8 34 C 40 6, 120 4, 186 22 C 196 30, 170 56, 100 54 C 40 52, 6 46, 14 24"></path><path pathLength="1" d="M30 46 L 172 12"></path></svg>');
        svarFelt = felt;
        skjema.append(...[felt, o.eining ? el('span', { class: 'eining', html: o.eining }) : null, el('button', { class: 'knapp sjekk', type: 'submit' }, 'Sjekk')].filter(Boolean));
        kort.append(skjema, tolking);
        if (nr > 1) setTimeout(() => inn.focus({ preventScroll: true }), 300);
      }
      const tipsKnapp = el('button', { class: 'lite-knapp', type: 'button', hidden: !o.tips, onclick: () => { ekstra.prepend(el('div', { class: 'tips', html: '<b>Tips</b> ' + o.tips })); tipsKnapp.hidden = true; } }, 'Tips');
      const losKnapp = el('button', { class: 'lite-knapp', type: 'button', hidden: true, onclick: () => { ekstra.append(el('div', { class: 'losning', html: '<b>Løysing</b>' + o.losning })); losKnapp.hidden = true; ferdig = true; visKnapp(neste, true); } }, 'Vis løysinga');
      const neste = el('button', { class: 'knapp sekundar neste-knapp', type: 'button', onclick: ny }, 'Ny oppgåve →');
      const visKnapp = (b, pa) => b.classList.toggle('klar', pa);
      const kladdVert = kladdeark(); kladdVert.hidden = !kladdOpen;
      kort.append(tilbake, ekstra, el('div', { class: 'oppg-knappar' }, tipsKnapp, losKnapp, el('span', { class: 'fyll' }), neste), kladdVert, stempel);
      scene.append(kort);
    }
    ny();
    return { ny };
  };
})();

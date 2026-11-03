/* Kjerne for Matematikk 1P-Y NA.
   Inneheld: lagring, formelsetjing ($…$), talformatering, oppgåvemotor,
   utforskbare tal (dra i tala), og ein liten grafmotor for canvas. */
(function () {
  'use strict';
  const MT = (window.MT = { kapittel: [], verktoy: {} });
  const R = (MT.R = String.raw);

  /* ---------- Lagring (alt i nettlesaren til eleven) ---------- */
  const NOKKEL = 'matte1pyna.v1';
  const tom = () => ({ xp: 0, rett: {}, forsok: {}, sett: {}, rekke: 0, besteRekke: 0, dagar: {} });
  MT.lager = tom();
  try { const l = JSON.parse(localStorage.getItem(NOKKEL)); if (l) MT.lager = Object.assign(tom(), l); } catch (e) {}
  MT.lagre = () => { try { localStorage.setItem(NOKKEL, JSON.stringify(MT.lager)); } catch (e) {} };
  MT.les = (k, d) => { try { const v = localStorage.getItem('mt.' + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
  MT.skriv = (k, v) => { try { localStorage.setItem('mt.' + k, JSON.stringify(v)); } catch (e) {} };

  MT.MAAL = 8; // rette svar for å meistre eit kapittel
  MT.registrer = function (kapId, rett) {
    const L = MT.lager;
    L.forsok[kapId] = (L.forsok[kapId] || 0) + 1;
    if (rett) {
      L.rett[kapId] = (L.rett[kapId] || 0) + 1;
      L.rekke += 1; L.besteRekke = Math.max(L.besteRekke, L.rekke);
      L.xp += 10 + Math.min(L.rekke, 10);
      L.dagar[new Date().toISOString().slice(0, 10)] = 1;
    } else L.rekke = 0;
    MT.lagre();
    document.dispatchEvent(new CustomEvent('mt:framdrift'));
  };
  MT.framdrift = (kapId) => Math.min(1, (MT.lager.rett[kapId] || 0) / MT.MAAL);

  /* ---------- Tilfeldige tal ---------- */
  MT.tilf = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  MT.vel = (arr) => arr[Math.floor(Math.random() * arr.length)];
  MT.steg = (a, b, s) => { const n = Math.round((b - a) / s); return +(a + s * MT.tilf(0, n)).toFixed(6); };
  MT.stokk = (arr) => { const a = arr.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  /* ---------- Talformat (norsk: desimalkomma, mellomrom i tusen) ---------- */
  MT.n = function (x, d) {
    if (!isFinite(x)) return '–';
    if (d == null) d = Math.abs(x) >= 100 ? 0 : Math.abs(x) >= 10 ? 1 : 2;
    let s = (+x).toFixed(d);
    if (d > 0) s = s.replace(/0+$/, '').replace(/\.$/, '');
    if (s === '-0') s = '0';
    const [h, des] = s.split('.');
    const neg = h.startsWith('-');
    const hel = (neg ? h.slice(1) : h).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return (neg ? '−' : '') + hel + (des ? ',' + des : '');
  };
  MT.kr = (x, d = 2) => MT.n(x, d).replace(/,(\d)$/, ',$10') + ' kr';
  MT.tolk = function (s) {
    if (s == null) return NaN;
    s = String(s).trim().toLowerCase()
      .replace(/[\s  ]/g, '').replace(/−/g, '-').replace(/kr|%|m²|m³|m2|m3|daa|liter|[a-zæøå²³]+$/g, '');
    if (/^-?\d+([.,]\d+)?\/-?\d+([.,]\d+)?$/.test(s)) { const [a, b] = s.split('/'); return parseFloat(a.replace(',', '.')) / parseFloat(b.replace(',', '.')); }
    // tusenskilje med punktum ("12.500") når det ikkje finst komma
    if (/^-?\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
    s = s.replace(',', '.');
    if (!/^-?\d*\.?\d+(e-?\d+)?$/.test(s)) return NaN;
    return parseFloat(s);
  };

  /* ---------- Formelsetjing: $…$ og $$…$$ ---------- */
  const SYM = { cdot: '·', times: '×', div: ':', pi: 'π', approx: '≈', le: '≤', ge: '≥', ne: '≠', Rightarrow: '⇒', to: '→', pm: '±', deg: '°', infty: '∞', Delta: 'Δ', quad: '<span class="q"></span>', qquad: '<span class="q"></span><span class="q"></span>', ',': ' ', '%': '%' };
  const esc = (c) => (c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '&' ? '&amp;' : c);
  MT.tex = function (s) {
    let i = 0;
    function arg() {
      while (s[i] === ' ') i++;
      if (s[i] === '{') { i++; return gruppe(); }
      const c = s[i++]; return /[a-zA-Z]/.test(c) ? '<i>' + c + '</i>' : esc(c);
    }
    function raa() { while (s[i] === ' ') i++; if (s[i] !== '{') return ''; let d = 1, j = ++i; while (j < s.length && d) { if (s[j] === '{') d++; if (s[j] === '}') d--; j++; } const t = s.slice(i, j - 1); i = j; return t; }
    function gruppe() {
      let ut = '';
      while (i < s.length) {
        const c = s[i];
        if (c === '}') { i++; return ut; }
        if (c === '{') { i++; ut += gruppe(); continue; }
        if (c === '\\') {
          const m = /^\\([a-zA-Z]+|.)/.exec(s.slice(i)); i += m[0].length; const k = m[1];
          if (k === 'frac') { const a = arg(), b = arg(); ut += '<span class="fr"><span>' + a + '</span><span>' + b + '</span></span>'; }
          else if (k === 'sqrt') ut += '<span class="sq">√<span>' + arg() + '</span></span>';
          else if (k === 'text') ut += '<span class="tx">' + raa() + '</span>';
          else if (k === 'bar') ut += '<span class="ov">' + arg() + '</span>';
          else if (k === 'hl') ut += '<span class="hl">' + arg() + '</span>';
          else if (k === 'red') ut += '<span class="rd">' + arg() + '</span>';
          else ut += SYM[k] != null ? SYM[k] : k;
          continue;
        }
        if (c === '^' || c === '_') { i++; const a = arg(); ut += c === '^' ? '<sup>' + a + '</sup>' : '<sub>' + a + '</sub>'; continue; }
        if (/[a-zA-Z]/.test(c)) { ut += '<i>' + c + '</i>'; i++; continue; }
        if (c === '*') { ut += '<span class="o">·</span>'; i++; continue; }
        if (c === '-') { ut += '<span class="o">−</span>'; i++; continue; }
        if ('=+<>≈'.includes(c)) { ut += '<span class="o">' + esc(c) + '</span>'; i++; continue; }
        if (c === ' ') { i++; continue; }
        if (c === '~') { ut += ' '; i++; continue; }
        ut += esc(c); i++;
      }
      return ut;
    }
    return gruppe();
  };
  MT.mat = function (html) {
    return String(html)
      .replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => '<div class="md">' + MT.tex(t.trim()) + '</div>')
      .replace(/\$([^$\n]+?)\$/g, (_, t) => '<span class="m">' + MT.tex(t) + '</span>');
  };

  /* ---------- Små DOM-hjelparar ---------- */
  MT.el = function (tag, attr, ...barn) {
    const e = document.createElement(tag);
    if (attr) for (const k in attr) {
      if (k === 'html') e.innerHTML = MT.mat(attr[k]);
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), attr[k]);
      else if (attr[k] !== false && attr[k] != null) e.setAttribute(k, attr[k] === true ? '' : attr[k]);
    }
    for (const b of barn.flat()) if (b != null) e.append(b.nodeType ? b : document.createTextNode(b));
    return e;
  };
  MT.$ = (s, r = document) => r.querySelector(s);
  MT.$$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  MT.farge = (namn) => getComputedStyle(document.documentElement).getPropertyValue('--' + namn).trim() || '#888';
  MT.roleg = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Glidebrytar med etikett og verdivising */
  let gid = 0;
  MT.glidar = function (forelder, { namn, min, max, steg = 1, verdi, eining = '', fmt, vedEndring }) {
    const id = 'g' + ++gid;
    const ut = MT.el('output', { for: id });
    const inn = MT.el('input', { type: 'range', id, min, max, step: steg, value: verdi });
    const vis = () => { ut.innerHTML = MT.mat(fmt ? fmt(+inn.value) : MT.n(+inn.value, 3) + (eining ? ' ' + eining : '')); };
    inn.addEventListener('input', () => { vis(); vedEndring && vedEndring(+inn.value); });
    vis();
    const rad = MT.el('label', { class: 'glid', for: id }, MT.el('span', { class: 'glid-namn', html: namn }), inn, ut);
    forelder.append(rad);
    return { get v() { return +inn.value; }, set v(x) { inn.value = x; vis(); }, inn };
  };

  /* ---------- Utforskbare tal: dra i eit tal i teksten ----------
     HTML:  <b data-v="r"></b>  og  <b data-o="V"></b>
     MT.utforsk(el, { r: {v:3,min:1,max:9,steg:.5,eining:'m'} }, { V: s => ... }) */
  MT.utforsk = function (rot, vars, utdata) {
    const s = {}; for (const k in vars) s[k] = vars[k].v;
    const oppdater = () => {
      MT.$$('[data-v]', rot).forEach((e) => { const d = vars[e.dataset.v]; e.textContent = (d.fmt ? d.fmt(s[e.dataset.v]) : MT.n(s[e.dataset.v], d.des)) + (d.eining ? ' ' + d.eining : ''); });
      MT.$$('[data-o]', rot).forEach((e) => { const r = utdata[e.dataset.o](s); e.innerHTML = typeof r === 'number' ? MT.n(r) : MT.mat(r); });
      rot.dispatchEvent(new CustomEvent('endra', { detail: s }));
    };
    MT.$$('[data-v]', rot).forEach((e) => {
      const d = vars[e.dataset.v]; const k = e.dataset.v;
      e.classList.add('skrubb'); e.tabIndex = 0; e.setAttribute('role', 'slider');
      e.setAttribute('aria-label', 'Dra til sida eller bruk piltastane for å endre ' + k);
      e.title = 'Dra meg til sida ↔';
      const set = (x) => { s[k] = Math.min(d.max, Math.max(d.min, +(Math.round(x / d.steg) * d.steg).toFixed(6))); e.setAttribute('aria-valuenow', s[k]); oppdater(); };
      let x0 = 0, v0 = 0;
      e.addEventListener('pointerdown', (ev) => { ev.preventDefault(); e.setPointerCapture(ev.pointerId); x0 = ev.clientX; v0 = s[k]; e.classList.add('drar'); document.body.classList.add('drar'); });
      e.addEventListener('pointermove', (ev) => { if (!e.hasPointerCapture(ev.pointerId)) return; const px = (d.px || 6); set(v0 + Math.round((ev.clientX - x0) / px) * d.steg); });
      const slepp = () => { e.classList.remove('drar'); document.body.classList.remove('drar'); };
      e.addEventListener('pointerup', slepp); e.addEventListener('pointercancel', slepp);
      e.addEventListener('keydown', (ev) => { if (ev.key === 'ArrowRight' || ev.key === 'ArrowUp') { set(s[k] + d.steg); ev.preventDefault(); } if (ev.key === 'ArrowLeft' || ev.key === 'ArrowDown') { set(s[k] - d.steg); ev.preventDefault(); } });
    });
    oppdater();
    return s;
  };

  /* ---------- Graf på canvas ---------- */
  class Graf {
    constructor(vert, o = {}) {
      this.o = Object.assign({ xmin: -1, xmax: 10, ymin: -1, ymax: 10, hogd: 320, xsteg: null, ysteg: null, xnamn: 'x', ynamn: 'y', marg: [14, 14, 30, 40] }, o);
      this.c = MT.el('canvas', { class: 'graf', role: 'img', 'aria-label': o.aria || 'Graf' });
      this.c.style.height = this.o.hogd + 'px';
      vert.append(this.c);
      this.ctx = this.c.getContext('2d');
      this.handtak = []; this.lag = null;
      new ResizeObserver(() => this.teikn()).observe(this.c);
      document.addEventListener('mt:tema', () => this.teikn());
      this.c.addEventListener('pointerdown', (e) => this._ned(e));
      this.c.addEventListener('pointermove', (e) => this._flytt(e));
      this.c.addEventListener('pointerup', () => { this.dra = null; this.c.classList.remove('drar'); });
      this.c.addEventListener('pointerleave', () => { if (!this.dra) { this.mus = null; this.teikn(); } });
    }
    get b() { return this.c.clientWidth; } get h() { return this.c.clientHeight; }
    X(x) { const [t, r, , l] = this.o.marg; return l + (x - this.o.xmin) / (this.o.xmax - this.o.xmin) * (this.b - l - r); }
    Y(y) { const [t, , u] = this.o.marg; return t + (this.o.ymax - y) / (this.o.ymax - this.o.ymin) * (this.h - t - u); }
    iX(px) { const [, r, , l] = this.o.marg; return this.o.xmin + (px - l) / (this.b - l - r) * (this.o.xmax - this.o.xmin); }
    iY(py) { const [t, , u] = this.o.marg; return this.o.ymax - (py - t) / (this.h - t - u) * (this.o.ymax - this.o.ymin); }
    _pos(e) { const r = this.c.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; }
    _ned(e) {
      const [px, py] = this._pos(e); let best = null, bd = 22;
      for (const h of this.handtak) { const d = Math.hypot(this.X(h.x) - px, this.Y(h.y) - py); if (d < bd) { bd = d; best = h; } }
      if (best) { this.dra = best; this.c.setPointerCapture(e.pointerId); this.c.classList.add('drar'); e.preventDefault(); }
      else if (this.vedKlikk) this.vedKlikk(this.iX(px), this.iY(py), e);
    }
    _flytt(e) {
      const [px, py] = this._pos(e);
      this.mus = [this.iX(px), this.iY(py)];
      if (this.dra) {
        let x = this.iX(px), y = this.iY(py); const s = this.dra.snap;
        if (s) { x = Math.round(x / s) * s; y = Math.round(y / s) * s; }
        x = Math.max(this.o.xmin, Math.min(this.o.xmax, x)); y = Math.max(this.o.ymin, Math.min(this.o.ymax, y));
        if (this.dra.berreX) y = this.dra.y; if (this.dra.berreY) x = this.dra.x;
        this.dra.x = x; this.dra.y = y; this.dra.vedFlytt && this.dra.vedFlytt(x, y);
      }
      const naer = this.handtak.some((h) => Math.hypot(this.X(h.x) - px, this.Y(h.y) - py) < 22);
      this.c.style.cursor = this.dra ? 'grabbing' : naer ? 'grab' : this.vedKlikk ? 'crosshair' : 'default';
      this.teikn();
    }
    _tick(spenn) { const r = spenn / 8, p = Math.pow(10, Math.floor(Math.log10(r))), m = r / p; return (m < 1.5 ? 1 : m < 3.5 ? 2 : m < 7.5 ? 5 : 10) * p; }
    teikn() {
      const c = this.c, ctx = this.ctx, dpr = window.devicePixelRatio || 1;
      if (!this.b) return;
      if (this.o.likAkse) { const [t, r, u, l] = this.o.marg; const midt = this.o.ymidt != null ? this.o.ymidt : (this.o.ymin + this.o.ymax) / 2; const sp = (this.o.xmax - this.o.xmin) * (this.h - t - u) / (this.b - l - r); this.o.ymidt = midt; this.o.ymin = midt - sp / 2; this.o.ymax = midt + sp / 2; }
      c.width = this.b * dpr; c.height = this.h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const F = { blekk: MT.farge('ink'), svak: MT.farge('ink-2'), rute: MT.farge('rute-sterk'), aks: MT.farge('accent'), papir: MT.farge('surface') };
      this.F = F;
      ctx.clearRect(0, 0, this.b, this.h);
      const o = this.o, xs = o.xsteg || this._tick(o.xmax - o.xmin), ys = o.ysteg || this._tick(o.ymax - o.ymin);
      ctx.lineWidth = 1; ctx.font = '11px "DM Mono", ui-monospace, monospace';
      // rutenett
      ctx.strokeStyle = F.rute; ctx.beginPath();
      for (let x = Math.ceil(o.xmin / xs) * xs; x <= o.xmax + 1e-9; x += xs) { const p = Math.round(this.X(x)) + .5; ctx.moveTo(p, this.Y(o.ymax)); ctx.lineTo(p, this.Y(o.ymin)); }
      for (let y = Math.ceil(o.ymin / ys) * ys; y <= o.ymax + 1e-9; y += ys) { const p = Math.round(this.Y(y)) + .5; ctx.moveTo(this.X(o.xmin), p); ctx.lineTo(this.X(o.xmax), p); }
      ctx.stroke();
      // aksar
      ctx.strokeStyle = F.blekk; ctx.fillStyle = F.svak; ctx.lineWidth = 1.4; ctx.beginPath();
      const y0 = this.Y(Math.max(o.ymin, Math.min(o.ymax, 0))), x0 = this.X(Math.max(o.xmin, Math.min(o.xmax, 0)));
      ctx.moveTo(this.X(o.xmin), y0); ctx.lineTo(this.X(o.xmax), y0); ctx.moveTo(x0, this.Y(o.ymin)); ctx.lineTo(x0, this.Y(o.ymax)); ctx.stroke();
      ctx.textAlign = 'center'; ctx.textBaseline = 'top';
      for (let x = Math.ceil(o.xmin / xs) * xs; x <= o.xmax + 1e-9; x += xs) if (Math.abs(x) > 1e-9 || o.xmin >= 0) ctx.fillText(MT.n(x, 3), this.X(x), y0 + 5);
      ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      for (let y = Math.ceil(o.ymin / ys) * ys; y <= o.ymax + 1e-9; y += ys) if (Math.abs(y) > 1e-9) ctx.fillText(MT.n(y, 3), x0 - 6, this.Y(y));
      ctx.font = 'italic 13px "STIX Two Text", Cambria, Georgia, serif'; ctx.fillStyle = F.blekk;
      ctx.textAlign = 'right'; ctx.textBaseline = 'bottom'; ctx.fillText(o.xnamn, this.X(o.xmax) - 2, y0 - 4);
      ctx.textAlign = 'left'; ctx.textBaseline = 'top'; ctx.fillText(o.ynamn, x0 + 6, this.Y(o.ymax) + 2);
      ctx.save(); ctx.beginPath(); ctx.rect(this.X(o.xmin), this.Y(o.ymax), this.X(o.xmax) - this.X(o.xmin), this.Y(o.ymin) - this.Y(o.ymax)); ctx.clip();
      this.lag && this.lag(this);
      ctx.restore();
      for (const h of this.handtak) this.punkt(h.x, h.y, h.farge || F.aks, h === this.dra ? 9 : 7, true);
      if (this.mus && this.visMus !== false) {
        ctx.font = '11px "DM Mono", monospace'; ctx.fillStyle = F.svak; ctx.textAlign = 'right'; ctx.textBaseline = 'top';
        ctx.fillText('(' + MT.n(this.mus[0], 1) + ', ' + MT.n(this.mus[1], 1) + ')', this.b - 8, 6);
      }
    }
    funksjon(f, farge, b = 2.5, strek) {
      const ctx = this.ctx; ctx.strokeStyle = farge || this.F.aks; ctx.lineWidth = b; ctx.setLineDash(strek || []); ctx.beginPath();
      let ned = false; const n = Math.max(200, this.b);
      for (let i = 0; i <= n; i++) { const x = this.o.xmin + (this.o.xmax - this.o.xmin) * i / n, y = f(x); if (!isFinite(y)) { ned = false; continue; } const py = this.Y(y); if (Math.abs(py) > 1e5) { ned = false; continue; } ned ? ctx.lineTo(this.X(x), py) : ctx.moveTo(this.X(x), py); ned = true; }
      ctx.stroke(); ctx.setLineDash([]);
    }
    punkt(x, y, farge, r = 5, ring) {
      const ctx = this.ctx; ctx.beginPath(); ctx.arc(this.X(x), this.Y(y), r, 0, 7);
      ctx.fillStyle = farge || this.F.aks; ctx.fill();
      if (ring) { ctx.lineWidth = 2.5; ctx.strokeStyle = this.F.papir; ctx.stroke(); }
    }
    linje(x1, y1, x2, y2, farge, b = 1.5, strek) { const ctx = this.ctx; ctx.strokeStyle = farge || this.F.blekk; ctx.lineWidth = b; ctx.setLineDash(strek || []); ctx.beginPath(); ctx.moveTo(this.X(x1), this.Y(y1)); ctx.lineTo(this.X(x2), this.Y(y2)); ctx.stroke(); ctx.setLineDash([]); }
    tekst(t, x, y, farge, just = 'left', font) { const ctx = this.ctx; ctx.font = font || '600 12px "Instrument Sans", system-ui, sans-serif'; ctx.fillStyle = farge || this.F.blekk; ctx.textAlign = just; ctx.textBaseline = 'middle'; ctx.fillText(t, this.X(x), this.Y(y)); }
    mangekant(p, fyll, strek) { const ctx = this.ctx; ctx.beginPath(); p.forEach(([x, y], i) => (i ? ctx.lineTo(this.X(x), this.Y(y)) : ctx.moveTo(this.X(x), this.Y(y)))); ctx.closePath(); if (fyll) { ctx.fillStyle = fyll; ctx.fill(); } if (strek) { ctx.strokeStyle = strek; ctx.lineWidth = 2; ctx.stroke(); } }
    soyle(x, b, y, fyll) { const ctx = this.ctx; ctx.fillStyle = fyll; const x1 = this.X(x - b / 2), x2 = this.X(x + b / 2), y1 = this.Y(Math.max(0, y)), y2 = this.Y(Math.min(0, y)); ctx.fillRect(x1, y1, x2 - x1, y2 - y1); }
  }
  MT.Graf = Graf;
  MT.alfa = (farge, a) => { // #rrggbb -> rgba
    const m = /^#?([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(farge.trim());
    return m ? `rgba(${parseInt(m[1], 16)},${parseInt(m[2], 16)},${parseInt(m[3], 16)},${a})` : farge;
  };

  /* ---------- Trygg kalkulator ---------- */
  MT.rekn = function (uttrykk) {
    let s = String(uttrykk).toLowerCase().replace(/\s| /g, '').replace(/−/g, '-').replace(/·|×/g, '*').replace(/:/g, '/').replace(/,/g, '.');
    s = s.replace(/π|pi/g, '(PI)').replace(/√/g, 'sqrt').replace(/(\d)\(/g, '$1*(').replace(/\)(\d|\()/g, ')*$1');
    s = s.replace(/(\d+(?:\.\d+)?)%/g, '($1/100)');
    if (!/^(sqrt|PI|[\d.+\-*/^()e]|\*\*)*$/i.test(s.replace(/sqrt|pi/gi, ''))) throw new Error('Ugyldig teikn');
    s = s.replace(/\^/g, '**').replace(/sqrt/g, 'Math.sqrt').replace(/\(PI\)/gi, '(Math.PI)');
    const v = Function('"use strict";return (' + s + ')')();
    if (typeof v !== 'number' || !isFinite(v)) throw new Error('Ikkje eit tal');
    return v;
  };

  /* ---------- Oppgåvemotor ----------
     Ein generator returnerer:
     { tekst, svar, eining?, tol?, tips?, losning?, val? (fleirval: [tekst...], svar = indeks) } */
  MT.sjekk = function (o, inn) {
    if (o.val) return inn === o.svar;
    const x = MT.tolk(inn);
    if (isNaN(x)) return null;
    const tol = o.tol != null ? o.tol : Math.max(0.011, Math.abs(o.svar) * 0.005);
    return Math.abs(x - o.svar) <= tol;
  };

  MT.ovingsboks = function (vert, { kapId, generatorar, tittel = 'Øving' }) {
    const boks = MT.el('div', { class: 'oving' });
    const topp = MT.el('div', { class: 'oving-topp' });
    const tel = MT.el('span', { class: 'oving-tel mono' });
    const kropp = MT.el('div', { class: 'oving-kropp', 'aria-live': 'polite' });
    topp.append(MT.el('span', { class: 'merkelapp' }, tittel), tel);
    boks.append(topp, kropp);
    vert.append(boks);
    let nr = 0, o, gen;
    const visTel = () => { if (kapId === 'blanda') { tel.textContent = `${MT.lager.xp} XP · rekkje ${MT.lager.rekke}`; return; } const r = MT.lager.rett[kapId] || 0; tel.textContent = `${Math.min(r, MT.MAAL)}/${MT.MAAL} mot meistring · rekkje ${MT.lager.rekke}`; };
    document.addEventListener('mt:framdrift', visTel);
    function ny() {
      nr++; gen = generatorar[(nr - 1) % generatorar.length];
      if (nr > generatorar.length) gen = MT.vel(generatorar);
      o = gen(); visTel();
      kropp.innerHTML = '';
      const sp = MT.el('div', { class: 'oppg-tekst', html: o.tekst });
      kropp.append(MT.el('div', { class: 'oppg-nr mono' }, 'Oppgåve ' + nr), sp);
      const tilbake = MT.el('div', { class: 'tilbake' });
      let forsok = 0, ferdig = false;
      const svarFerdig = (rett, inn) => {
        forsok++;
        if (rett === null) { tilbake.className = 'tilbake info'; tilbake.textContent = 'Skriv svaret som eit tal, til dømes 12,5'; return; }
        if (rett) {
          tilbake.className = 'tilbake rett'; tilbake.innerHTML = MT.mat(MT.vel(['Rett!', 'Heilt rett.', 'Det stemmer.', 'Rett – godt jobba.']) + (o.losning ? ' <button class="lenkeknapp vis-los">Sjå utrekninga</button>' : ''));
          if (!ferdig) MT.registrer(o.kap || kapId, forsok === 1);
          ferdig = true; boks.classList.remove('feil-rist'); boks.classList.add('rett-puls');
          setTimeout(() => boks.classList.remove('rett-puls'), 700);
          nesteBtn.focus();
        } else {
          tilbake.className = 'tilbake feil';
          tilbake.innerHTML = MT.mat(forsok === 1 ? 'Ikkje heilt. Sjå over utrekninga og prøv igjen.' + (o.tips ? ' <button class="lenkeknapp vis-tips">Vis eit tips</button>' : '') : 'Framleis feil. ' + (o.losning ? '<button class="lenkeknapp vis-los">Vis løysinga</button>' : ''));
          if (forsok === 1) MT.registrer(o.kap || kapId, false);
          boks.classList.remove('feil-rist'); void boks.offsetWidth; boks.classList.add('feil-rist');
        }
      };
      if (o.val) {
        const vg = MT.el('div', { class: 'val-grid' });
        o.val.forEach((t, i) => vg.append(MT.el('button', { class: 'val', html: t, onclick: (e) => { if (ferdig) return; const r = MT.sjekk(o, i); e.currentTarget.classList.add(r ? 'rett' : 'feil'); svarFerdig(r); } })));
        kropp.append(vg);
      } else {
        const id = 'svar-' + kapId;
        const f = MT.el('form', { class: 'svar-rad', onsubmit: (e) => { e.preventDefault(); if (ferdig) { ny(); return; } svarFerdig(MT.sjekk(o, inn.value), inn.value); } });
        const inn = MT.el('input', { id, class: 'svar-inn mono', inputmode: 'decimal', autocomplete: 'off', placeholder: 'Svar', 'aria-label': 'Svaret ditt' });
        f.append(...[inn, o.eining ? MT.el('span', { class: 'eining', html: o.eining }) : null, MT.el('button', { class: 'knapp', type: 'submit' }, 'Sjekk')].filter(Boolean));
        kropp.append(f);
        setTimeout(() => { if (boks.getBoundingClientRect().top < innerHeight && document.activeElement && document.activeElement.closest && document.activeElement.closest('.oving') === boks) inn.focus(); }, 30);
      }
      const ekstra = MT.el('div', { class: 'oppg-ekstra' });
      kropp.append(tilbake, ekstra);
      tilbake.addEventListener('click', (e) => {
        if (e.target.classList.contains('vis-tips')) { ekstra.innerHTML = MT.mat('<div class="tips"><b>Tips:</b> ' + o.tips + '</div>'); e.target.remove(); }
        if (e.target.classList.contains('vis-los')) { ekstra.innerHTML = MT.mat('<div class="losning"><b>Løysing</b>' + o.losning + '</div>'); e.target.remove(); ferdig = true; }
      });
      const nesteBtn = MT.el('button', { class: 'knapp sekundar', onclick: ny }, 'Ny oppgåve →');
      kropp.append(MT.el('div', { class: 'oppg-knappar' }, nesteBtn));
    }
    ny();
    return { ny };
  };

  /* ---------- Steg-for-steg-eksempel ---------- */
  MT.eksempel = function (vert, { nr, tittel, oppgave, steg, svar }) {
    const b = MT.el('article', { class: 'eksempel' });
    b.append(MT.el('header', { class: 'eks-hode' }, MT.el('span', { class: 'merkelapp' }, 'Eksempel ' + nr), MT.el('h4', { html: tittel })));
    b.append(MT.el('div', { class: 'eks-oppg', html: oppgave }));
    const liste = MT.el('ol', { class: 'eks-steg' });
    b.append(liste);
    let i = 0;
    const knapp = MT.el('button', { class: 'knapp sekundar' }, 'Vis første steg');
    const alle = MT.el('button', { class: 'lenkeknapp' }, 'Vis heile løysinga');
    const svarEl = MT.el('div', { class: 'eks-svar', html: '<b>Svar:</b> ' + svar, hidden: true });
    const neste = () => {
      if (i < steg.length) { const li = MT.el('li', { html: steg[i] }); liste.append(li); i++; }
      if (i >= steg.length) { svarEl.hidden = false; knapp.hidden = true; alle.hidden = true; }
      else knapp.textContent = 'Neste steg (' + (i + 1) + '/' + steg.length + ')';
    };
    knapp.onclick = neste; alle.onclick = () => { while (i < steg.length) neste(); };
    b.append(svarEl, MT.el('div', { class: 'eks-knappar' }, knapp, alle));
    vert.append(b);
  };

  MT.nyttKapittel = (k) => MT.kapittel.push(k);
})();

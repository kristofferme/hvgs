/* Mini-Python i nettlesaren.
   Omset ein liten del av Python (variablar, if/elif/else, for … in range,
   while, def, lister, print, input, f-strengar, math) til JavaScript og
   køyrer det i ein avgrensa sandkasse med vern mot evige løkker. */
(function () {
  'use strict';

  function delStrengar(linje) {
    // Del linja i [kode, streng, kode, streng ...] så vi ikkje omset inni strengar.
    const deler = []; let i = 0, kode = '';
    while (i < linje.length) {
      const c = linje[i];
      if (c === '#') break;
      const f = (c === 'f' || c === 'F') && (linje[i + 1] === '"' || linje[i + 1] === "'") && !/\w/.test(linje[i - 1] || '');
      if (c === '"' || c === "'" || f) {
        const q = f ? linje[i + 1] : c; let j = i + (f ? 2 : 1), s = '';
        while (j < linje.length && linje[j] !== q) { if (linje[j] === '\\') { s += linje[j] + linje[j + 1]; j += 2; continue; } s += linje[j++]; }
        if (j >= linje.length) throw new Error('Strengen manglar avsluttande ' + q);
        deler.push({ k: kode }); kode = '';
        deler.push({ s, f }); i = j + 1; continue;
      }
      kode += c; i++;
    }
    deler.push({ k: kode });
    return deler;
  }

  function omsetUttrykk(u) {
    return delStrengar(u).map((d) => {
      if (d.k != null) {
        return d.k
          .replace(/\band\b/g, '&&').replace(/\bor\b/g, '||').replace(/\bnot\s+/g, '!')
          .replace(/\bTrue\b/g, 'true').replace(/\bFalse\b/g, 'false').replace(/\bNone\b/g, 'null')
          .replace(/([\w.\]\)]+)\s*\/\/\s*([\w.]+)/g, 'Math.floor(($1)/($2))')
          .replace(/\.append\(/g, '.push(')
          .replace(/\bend\s*=\s*$/, '__End(').replace(/\bsep\s*=\s*$/, '__Sep(')
          .replace(/math\.(sqrt|floor|ceil|log10|log|exp|sin|cos|tan)\b/g, 'Math.$1').replace(/math\.pi\b/g, 'Math.PI');
      }
      if (d.f) {
        const malar = d.s.replace(/`/g, '\\`').replace(/\{([^{}]+)\}/g, (_, e) => {
          const [ut, spes] = e.split(/:(?=[^:]*$)/);
          return '${__fmt(' + omsetUttrykk(ut) + (spes ? ',"' + spes + '"' : '') + ')}';
        });
        return '`' + malar + '`';
      }
      return JSON.stringify(d.s.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\(.)/g, '$1'));
    }).join('')
      // end= / sep= som stod rett før ein streng
      .replace(/__End\(("(?:[^"\\]|\\.)*"|`[^`]*`)/g, '__End($1)').replace(/__Sep\(("(?:[^"\\]|\\.)*"|`[^`]*`)/g, '__Sep($1)');
  }

  function omset(kjelde) {
    const linjer = kjelde.replace(/\t/g, '    ').split('\n');
    const ut = []; const stabel = [0]; let ventarBlokk = false;
    linjer.forEach((raa, n) => {
      const nr = n + 1;
      const utanKommentar = delStrengar(raa).length ? raa : raa;
      if (/^\s*(#.*)?$/.test(utanKommentar)) return;
      const innrykk = raa.match(/^ */)[0].length;
      let l = raa.trim();
      // fjern kommentar på slutten (utanfor strengar)
      const deler = delStrengar(l); let lengd = 0; deler.forEach((d) => { lengd += d.k != null ? d.k.length : d.s.length + (d.f ? 3 : 2); }); l = l.slice(0, lengd).trim();
      if (!l) return;
      if (ventarBlokk) {
        if (innrykk <= stabel[stabel.length - 1]) throw feil('Forventa innrykk etter kolon', nr);
        stabel.push(innrykk); ventarBlokk = false;
      } else if (innrykk > stabel[stabel.length - 1]) throw feil('Uventa innrykk', nr);
      while (innrykk < stabel[stabel.length - 1]) { stabel.pop(); ut.push('}'); }
      if (innrykk !== stabel[stabel.length - 1]) throw feil('Innrykket passar ikkje med linjene over', nr);

      let m;
      const blokk = (s) => { ut.push(s + ' {'); ventarBlokk = true; };
      if (/^(import|from)\s/.test(l)) return;
      if ((m = /^for\s+(\w+)\s+in\s+range\((.*)\)\s*:$/.exec(l))) return blokk(`__l(${nr}); for (${m[1]} of __range(${omsetUttrykk(m[2])}))`);
      if ((m = /^for\s+(\w+)\s+in\s+(.+):$/.exec(l))) return blokk(`__l(${nr}); for (${m[1]} of __iter(${omsetUttrykk(m[2])}))`);
      if ((m = /^while\s+(.+):$/.exec(l))) return blokk(`while (__g(${nr}) && (${omsetUttrykk(m[1])}))`);
      if ((m = /^if\s+(.+):$/.exec(l))) return blokk(`if ((__l(${nr}), ${omsetUttrykk(m[1])}))`);
      if ((m = /^elif\s+(.+):$/.exec(l))) { forventEtterBlokk(ut, nr); return blokk(`else if ((__l(${nr}), ${omsetUttrykk(m[1])}))`); }
      if (/^else\s*:$/.test(l)) { forventEtterBlokk(ut, nr); return blokk('else'); }
      if ((m = /^def\s+(\w+)\s*\((.*)\)\s*:$/.exec(l))) return blokk(`${m[1]} = function (${m[2]})`);
      if (/:$/.test(l) && /^(for|while|if|elif|else|def)\b/.test(l)) throw feil('Kan ikkje lese denne linja – sjekk skrivemåten', nr);
      if (/^(for|while|if|elif|def)\b/.test(l)) throw feil('Det manglar kolon (:) på slutten av linja', nr);
      if (l === 'pass') return ut.push(';');
      if (l === 'break' || l === 'continue') return ut.push(l + ';');
      if ((m = /^return\b\s*(.*)$/.exec(l))) return ut.push(`return ${omsetUttrykk(m[1] || 'null')};`);
      if ((m = /^(\w+(?:\s*,\s*\w+)+)\s*=(?!=)\s*(.+)$/.exec(l))) return ut.push(`__l(${nr}); [${m[1]}] = [${omsetUttrykk(m[2])}];`);
      ut.push(`__l(${nr}); ${omsetUttrykk(l)};`);
    });
    if (ventarBlokk) throw feil('Programmet sluttar før blokka etter kolon', linjer.length);
    while (stabel.length > 1) { stabel.pop(); ut.push('}'); }
    return ut.join('\n');
  }
  function forventEtterBlokk(ut, nr) { if (ut[ut.length - 1] !== '}') throw feil('«elif»/«else» må stå rett under ei if-blokk', nr); }
  function feil(t, nr) { const e = new Error(t + ' (linje ' + nr + ')'); e.pyLinje = nr; return e; }

  function fmt(v, spes) {
    if (spes) {
      const m = /^\.(\d+)f$/.exec(spes);
      if (m && typeof v === 'number') return v.toFixed(+m[1]);
    }
    return vis(v);
  }
  function vis(v) {
    if (v === true) return 'True'; if (v === false) return 'False'; if (v == null) return 'None';
    if (Array.isArray(v)) return '[' + v.map((x) => (typeof x === 'string' ? "'" + x + "'" : vis(x))).join(', ') + ']';
    if (typeof v === 'number') { if (Number.isInteger(v)) return String(v); return String(+v.toPrecision(15)); }
    if (typeof v === 'function') return '<funksjon>';
    return String(v);
  }

  function kjor(kjelde, { inndata = [], maksSteg = 200000 } = {}) {
    const utskrift = []; let linje = 0, steg = 0, innI = 0;
    const tell = () => { if (++steg > maksSteg) throw new Error('Programmet køyrde for lenge – har du ei evig løkke? (linje ' + linje + ')'); };
    const End = function (v) { this.end = v; }, Sep = function (v) { this.sep = v; };
    const innebygd = {
      __l: (n) => { linje = n; tell(); },
      __g: (n) => { linje = n; tell(); return true; },
      __range: (a, b, c) => { if (b === undefined) { b = a; a = 0; } c = c || 1; const r = []; for (let i = a; c > 0 ? i < b : i > b; i += c) { r.push(i); if (r.length > 1e6) throw new Error('For stor range'); } return r; },
      __iter: (x) => (typeof x === 'string' ? x.split('') : x),
      __fmt: fmt,
      __End: (v) => new End(v), __Sep: (v) => new Sep(v),
      print: (...a) => { let end = '\n', sep = ' '; a = a.filter((x) => { if (x instanceof End) { end = x.end; return false; } if (x instanceof Sep) { sep = x.sep; return false; } return true; }); utskrift.push(a.map(vis).join(sep) + end); if (utskrift.length > 5000) throw new Error('For mykje utskrift'); },
      input: (t) => { if (t) utskrift.push(String(t)); const v = inndata[innI++]; if (v === undefined) throw new Error('Programmet ventar på inndata. Skriv verdiar i feltet «Inndata» (éin per linje).'); utskrift.push(v + '\n'); return String(v); },
      int: (x) => { const v = parseInt(String(x).replace(',', '.'), 10); if (isNaN(v)) throw new Error('int() fekk noko som ikkje er eit tal'); return typeof x === 'number' ? Math.trunc(x) : v; },
      float: (x) => { const v = parseFloat(String(x).replace(',', '.')); if (isNaN(v)) throw new Error('float() fekk noko som ikkje er eit tal'); return v; },
      str: (x) => vis(x), len: (x) => x.length, abs: Math.abs,
      round: (x, d = 0) => { const f = Math.pow(10, d); return Math.round(x * f) / f; },
      min: (...a) => Math.min(...(a.length === 1 ? a[0] : a)), max: (...a) => Math.max(...(a.length === 1 ? a[0] : a)),
      sum: (l) => l.reduce((s, x) => s + x, 0), sorted: (l) => l.slice().sort((a, b) => a - b), list: (l) => Array.from(l),
      sqrt: Math.sqrt, pi: Math.PI, math: { sqrt: Math.sqrt, pi: Math.PI },
      Math, Array, undefined: undefined,
    };
    const brukar = {};
    const scope = new Proxy(brukar, {
      has: (_, k) => typeof k === 'string',
      get: (_, k) => {
        if (k === Symbol.unscopables) return undefined;
        if (k in brukar) return brukar[k];
        if (k in innebygd) return innebygd[k];
        throw new Error("Namnet '" + String(k) + "' er ikkje definert (linje " + linje + ')');
      },
      set: (_, k, v) => { if (k in innebygd && !k.startsWith('__')) throw new Error("'" + k + "' er eit innebygd namn – vel eit anna variabelnamn"); brukar[k] = v; return true; },
    });
    let js;
    try { js = omset(kjelde); } catch (e) { return { ok: false, feil: e.message, linje: e.pyLinje, utskrift: '', variablar: {} }; }
    try {
      // eslint-disable-next-line no-new-func
      Function('__s', 'with (__s) {\n' + js + '\n}')(scope);
      return { ok: true, utskrift: utskrift.join(''), variablar: Object.assign({}, brukar), js };
    } catch (e) {
      let t = e.message;
      if (e instanceof SyntaxError) t = 'Syntaksfeil: sjekk parentesar, operatorar og skrivemåten' + (linje ? ' (rundt linje ' + linje + ')' : '');
      else if (e instanceof TypeError) t = 'Typefeil: ' + t + ' (linje ' + linje + ')';
      return { ok: false, feil: t, linje, utskrift: utskrift.join(''), variablar: Object.assign({}, brukar) };
    }
  }

  window.MiniPython = { kjor, omset, vis };
})();

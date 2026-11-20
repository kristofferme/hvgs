  /* ==========================================================================
     Krizi-markdown → HTML
     Hver blokk får data-l="fra-til" (linjenumre i kilden), slik at den kan
     redigeres direkte på lerretet og skrives tilbake til riktig sted.
     ========================================================================== */

  var EMOJI = /^(?:[☀-➿]|\p{Extended_Pictographic}|\p{Emoji_Modifier}|‍|️|\s)+$/u;
  var DASH = /^(—|–|--)\s*/;
  var annoNr = 0;

  function annoSvg(type) {
    var r = rng(++annoNr * 7919);
    if (type === 'u') {
      var y = 5 + (r() - 0.5) * 2;
      return '<svg class="k-ann" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M1 ' + (y + 1).toFixed(1) + ' C 30 ' + (y - 2).toFixed(1) + ', 60 ' + (y + 2.5).toFixed(1) + ', 99 ' + (y - 0.5).toFixed(1) + '"/></svg>';
    }
    if (type === 'ring') {
      return '<svg class="k-ann" viewBox="0 0 120 60" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="' + grovEllipse(r, 60, 30, 56, 26, 1.15) + '"/></svg>';
    }
    return '<svg class="k-ann" viewBox="0 0 100 10" preserveAspectRatio="none" aria-hidden="true"><path pathLength="1" d="M0 ' + (5 + r() * 2).toFixed(1) + ' L100 ' + (4 + r() * 2).toFixed(1) + '"/></svg>';
  }

  function inline(s) {
    s = esc(s);
    return s
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\{\{([^}]+)\}\}/g, function (m, ord) {
        var liste = ord.split('|').map(function (o) { return o.trim(); }).filter(Boolean);
        return '<span class="k-roter" data-ord="' + liste.join('|') + '">' + liste.map(function (o, i) { return '<span class="k-ro' + (i === 0 ? ' k-pa' : '') + '">' + o + '</span>'; }).join('') + '</span>';
      })
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?!\*)/g, '$1<em>$2</em>')
      .replace(/==([^=]+)==/g, '<mark>$1</mark>')
      .replace(/__([^_]+)__/g, function (m, t) { return '<span class="k-u">' + t + annoSvg('u') + '</span>'; })
      .replace(/\(\(([^()]+)\)\)/g, function (m, t) { return '<span class="k-ring">' + t + annoSvg('ring') + '</span>'; })
      .replace(/~~([^~]+)~~/g, function (m, t) { return '<span class="k-stryk">' + t + annoSvg('stryk') + '</span>'; })
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (m, t, u) {
        return /^(https?:|mailto:|#)/i.test(u) ? '<a href="' + u + '" target="_blank" rel="noopener">' + t + '</a>' : t;
      });
  }

  function tallFra(s) {
    var m = String(s).replace(/ /g, ' ').match(/-?\d[\d ]*(?:[.,]\d+)?/);
    if (!m) return null;
    var v = parseFloat(m[0].replace(/ /g, '').replace(',', '.'));
    return isFinite(v) ? v : null;
  }

  function md(src) {
    var topp = [], kolonner = [], cur = topp;
    var linjer = String(src).replace(/\r/g, '').split('\n');
    var blokk = null; // { type, start, slutt, data }

    function l(b) { return ' data-l="' + b.start + '-' + b.slutt + '"'; }
    function tom() {
      var b = blokk;
      if (!b) return;
      blokk = null;
      if (b.type === 'p') cur.push('<p class="k-b"' + l(b) + '>' + b.data.map(inline).join('<br>') + '</p>');
      else if (b.type === 'ul' || b.type === 'ol') cur.push('<' + b.type + ' class="k-b"' + l(b) + '>' + b.data.map(function (i) { return '<li>' + inline(i) + '</li>'; }).join('') + LUKK + b.type + '>');
      else if (b.type === 'sitat') {
        var cite = '', d = b.data.slice();
        if (d.length > 1 && DASH.test(d[d.length - 1])) cite = '<cite>' + inline(d.pop().replace(DASH, '')) + '</cite>';
        cur.push('<blockquote class="k-b"' + l(b) + '><p>' + d.map(inline).join('<br>') + '</p>' + cite + '</blockquote>');
      } else if (b.type === 'stolper') {
        var rader = b.data.map(function (r) {
          var deler = r.split(/\s*\|\s*/);
          return { navn: deler[0], tekst: (deler[1] || '').trim(), v: tallFra(deler[1] || '') };
        });
        var maks = Math.max.apply(null, rader.map(function (r) { return Math.abs(r.v || 0); }).concat([1e-9]));
        var alleProsent = rader.every(function (r) { return r.v != null && r.v >= 0 && r.v <= 100; }) && /%/.test(b.data.join(' '));
        if (alleProsent) maks = 100;
        cur.push('<div class="k-b k-stolper"' + l(b) + '>' + rader.map(function (r, i) {
          return '<div class="k-stolpe" style="--v:' + (Math.abs(r.v || 0) / maks).toFixed(4) + ';--j:' + i + '"><span class="k-st-navn">' + inline(r.navn) + '</span><span class="k-st-spor"><i></i></span><span class="k-st-tall k-teller">' + inline(r.tekst) + '</span></div>';
        }).join('') + '</div>');
      } else if (b.type === 'flyt') {
        cur.push('<div class="k-b k-flyt"' + l(b) + '>' + b.data.map(function (t, i) {
          return (i ? '<svg class="k-fl-pil" style="--j:' + i + '" viewBox="0 0 60 24" aria-hidden="true"><path pathLength="1" d="M4 12 C 20 8, 36 16, 52 12"/><path pathLength="1" d="M44 5 L53 12 L44 19"/></svg>' : '') +
            '<div class="k-fl-steg" style="--j:' + i + '"><span class="k-fl-nr">' + (i + 1) + '</span><span class="k-fl-tekst">' + inline(t) + '</span></div>';
        }).join('') + '</div>');
      }
    }
    function start(type, i) { tom(); blokk = { type: type, start: i, slutt: i, data: [] }; }
    function enkel(html, i) { tom(); cur.push(html.replace('§L', ' data-l="' + i + '-' + i + '"')); }

    linjer.forEach(function (raw, i) {
      var t = raw.trim(), m;
      if (!t) { tom(); return; }
      if (t === '||') { tom(); cur = []; kolonner.push(cur); return; }
      if (blokk && blokk.type === 'sitat' && DASH.test(t)) { blokk.data.push(t); blokk.slutt = i; return; }
      if ((m = t.match(/^>\s?(.*)$/))) { if (!blokk || blokk.type !== 'sitat') start('sitat', i); blokk.data.push(m[1]); blokk.slutt = i; return; }
      if ((m = t.match(/^::\s*(.+)$/))) { if (!blokk || blokk.type !== 'stolper') start('stolper', i); blokk.data.push(m[1]); blokk.slutt = i; return; }
      if ((m = t.match(/^->\s*(.+)$/))) { if (!blokk || blokk.type !== 'flyt') start('flyt', i); blokk.data.push(m[1]); blokk.slutt = i; return; }
      if ((m = t.match(/^[-*•]\s+(.*)$/))) { if (!blokk || blokk.type !== 'ul') start('ul', i); blokk.data.push(m[1]); blokk.slutt = i; return; }
      if ((m = t.match(/^\d+[.)]\s+(.*)$/))) { if (!blokk || blokk.type !== 'ol') start('ol', i); blokk.data.push(m[1]); blokk.slutt = i; return; }
      if ((m = t.match(/^(#{1,3})\s+(.*)$/))) {
        var n = m[1].length;
        if (n === 1) enkel('<h1 class="k-b"§L>' + inline(m[2]) + '</h1>', i);
        else if (n === 2) enkel('<h2 class="k-b"§L>' + inline(m[2]) + '</h2>', i);
        else enkel('<div class="k-b k-eyebrow"§L>' + inline(m[2]) + '</div>', i);
        return;
      }
      if ((m = t.match(/^!!\s*(.+)$/))) {
        var deler = m[1].split(/\s+\|\s+/);
        enkel('<div class="k-b k-stat"§L><span class="k-num k-teller">' + inline(deler[0].trim()) + '</span>' + (deler[1] ? '<span class="k-cap">' + inline(deler.slice(1).join(' | ').trim()) + '</span>' : '') + '</div>', i);
        return;
      }
      if ((m = t.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/))) {
        var src = m[2], alt = m[1];
        var media = /\.(mp4|webm|mov)(\?|#|$)/i.test(src)
          ? '<video src="' + esc(src) + '" autoplay muted loop playsinline></video>'
          : '<img src="' + esc(src) + '" alt="' + esc(alt) + '" draggable="false">';
        enkel('<figure class="k-b k-img"§L><div class="k-img-ramme">' + media + '</div>' + (alt ? '<figcaption>' + inline(alt) + '</figcaption>' : '') + '</figure>', i);
        return;
      }
      if (/^(-{3,}|\*{3,})$/.test(t)) { enkel('<hr class="k-b"§L>', i); return; }
      if (EMOJI.test(t) && !/^[\d\s#*]+$/.test(t)) { enkel('<div class="k-b k-ikon"§L>' + esc(t) + '</div>', i); return; }
      if (!blokk || blokk.type !== 'p') start('p', i);
      blokk.data.push(t); blokk.slutt = i;
    });
    tom();
    kolonner = kolonner.filter(function (c) { return c.length; });
    if (kolonner.length) {
      return topp.join('') + '<div class="k-cols" style="--n:' + kolonner.length + '">' + kolonner.map(function (c) { return '<div class="k-col">' + c.join('') + '</div>'; }).join('') + '</div>';
    }
    return topp.join('');
  }

  /* Del overskrifter i ord og bokstaver for animasjon */
  function delTittel(el, bokstaver) {
    var w = 0, c = 0;
    var walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) { return n.parentNode.closest('.k-roter, svg') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
    });
    var noder = [];
    while (walker.nextNode()) noder.push(walker.currentNode);
    noder.forEach(function (node) {
      var frag = document.createDocumentFragment();
      node.textContent.split(/(\s+)/).forEach(function (bit) {
        if (!bit) return;
        if (/^\s+$/.test(bit)) { frag.append(document.createTextNode(bit)); return; }
        var ord = document.createElement('span');
        ord.className = 'k-w';
        ord.style.setProperty('--w', w++);
        var indre = document.createElement('span');
        indre.className = 'k-wi';
        if (bokstaver) {
          Array.from(bit).forEach(function (ch) {
            var sp = document.createElement('span');
            sp.className = 'k-c';
            sp.style.setProperty('--c', c++);
            sp.textContent = ch;
            indre.append(sp);
          });
        } else indre.textContent = bit;
        ord.append(indre);
        frag.append(ord);
      });
      node.parentNode.replaceChild(frag, node);
    });
    el.classList.add('k-tittel');
    el.style.setProperty('--n-c', c);
  }

  /* ---------- HTML → markdown (for redigering direkte på lerretet) ---------- */

  function tilMd(node) {
    var ut = '';
    node.childNodes.forEach(function (n) {
      if (n.nodeType === 3) { ut += n.textContent.replace(/ /g, ' '); return; }
      if (n.nodeType !== 1) return;
      var tag = n.tagName, cl = n.classList;
      if (tag === 'svg' || tag === 'SVG' || n instanceof SVGElement) return;
      if (cl.contains('k-roter')) { ut += '{{' + n.getAttribute('data-ord') + '}}'; return; }
      if (tag === 'BR') { ut += '\n'; return; }
      var indre = tilMd(n);
      if (tag === 'STRONG' || tag === 'B') ut += '**' + indre + '**';
      else if (tag === 'EM' || tag === 'I') ut += '*' + indre + '*';
      else if (tag === 'MARK') ut += '==' + indre + '==';
      else if (tag === 'CODE') ut += '`' + indre + '`';
      else if (cl.contains('k-u')) ut += '__' + indre + '__';
      else if (cl.contains('k-ring')) ut += '((' + indre + '))';
      else if (cl.contains('k-stryk')) ut += '~~' + indre + '~~';
      else if (tag === 'A') ut += '[' + indre + '](' + n.getAttribute('href') + ')';
      else if (tag === 'DIV' || tag === 'P') ut += (ut && !/\n$/.test(ut) ? '\n' : '') + indre;
      else ut += indre;
    });
    return ut;
  }
  function enLinje(s) { return s.replace(/\s*\n\s*/g, ' ').replace(/\s{2,}/g, ' ').trim(); }

  // Gjør en redigert blokk om til kildelinjer igjen. null = blokken kan ikke redigeres direkte.
  function blokkTilMd(el) {
    var tag = el.tagName, cl = el.classList;
    if (tag === 'H1') return ['# ' + enLinje(tilMd(el))];
    if (tag === 'H2') return ['## ' + enLinje(tilMd(el))];
    if (cl.contains('k-eyebrow')) return ['### ' + enLinje(tilMd(el))];
    if (tag === 'P') return tilMd(el).split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    if (tag === 'UL' || tag === 'OL') {
      return $$('li', el).map(function (li, i) { var t = enLinje(tilMd(li)); return t ? (tag === 'UL' ? '- ' : (i + 1) + '. ') + t : null; }).filter(Boolean);
    }
    if (tag === 'BLOCKQUOTE') {
      var p = el.querySelector('p'), c = el.querySelector('cite');
      var ut = (p ? tilMd(p) : '').split('\n').map(function (s) { return s.trim(); }).filter(Boolean).map(function (s) { return '> ' + s; });
      if (c && enLinje(tilMd(c))) ut.push('— ' + enLinje(tilMd(c)));
      return ut;
    }
    if (cl.contains('k-stat')) {
      var num = el.querySelector('.k-num'), cap = el.querySelector('.k-cap');
      var n = num ? enLinje(num.getAttribute('data-original') || tilMd(num)) : '';
      return ['!! ' + n + (cap && enLinje(tilMd(cap)) ? ' | ' + enLinje(tilMd(cap)) : '')];
    }
    if (cl.contains('k-flyt')) {
      return $$('.k-fl-tekst', el).map(function (s) { var t = enLinje(tilMd(s)); return t ? '-> ' + t : null; }).filter(Boolean);
    }
    if (cl.contains('k-stolper')) {
      return $$('.k-stolpe', el).map(function (r) {
        var navn = enLinje(tilMd(r.querySelector('.k-st-navn'))), tall = r.querySelector('.k-st-tall');
        var v = tall ? enLinje(tall.getAttribute('data-original') || tilMd(tall)) : '';
        return navn ? ':: ' + navn + ' | ' + v : null;
      }).filter(Boolean);
    }
    return null;
  }

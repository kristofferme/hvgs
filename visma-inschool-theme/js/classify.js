/* ==========================================================================
   Klar – strukturgjenkjenning

   Visma InSchool genererer klassenavn vi ikke kan stole på over tid. I stedet
   for å låse temaet til bestemte klasser leser vi DOM-en slik en bruker ser
   den: geometri, roller, farger og innhold. Hvert element merkes med
   data-klar-el="…", og CSS-en styler kun disse merkelappene.
   ========================================================================== */
(function () {
  'use strict';

  const NS = (window.__klar = window.__klar || {});

  const SKIP_TAGS = new Set([
    'SCRIPT', 'STYLE', 'LINK', 'META', 'HEAD', 'TITLE', 'NOSCRIPT', 'TEMPLATE',
    'CANVAS', 'IFRAME', 'OBJECT', 'EMBED', 'BR', 'HR', 'IMG', 'PICTURE', 'SOURCE',
    'AUDIO', 'VIDEO', 'MAP', 'AREA',
  ]);

  const ICON_RE = /(^|[\s_-])(icon|ikon|fa|glyph|symbol|material-icons)/i;

  /* Elementer vi allerede har sett på: 1 = grunnpass, 2 = geometripass */
  let seen = new WeakMap();
  /* Sidens egne farger, lest før temaet fikk tak i elementet. Uten dette ville
     et nytt skann lese våre egne farger og gradvis endre klassifiseringen. */
  const origin = new WeakMap();
  /* Kontrollerte tekster. Tømmes ved hvert fullskann, slik at målingen gjøres
     på nytt når flatene har fått sine endelige farger. */
  let checked = new WeakSet();

  function originalColors(el, cs) {
    let o = origin.get(el);
    if (!o) {
      o = { bg: parseColor(cs.backgroundColor), fg: parseColor(cs.color) };
      origin.set(el, o);
    }
    return o;
  }
  let mainRect = null;
  let sidebarEl = null;
  let topbarEl = null;
  let mainEl = null;

  /* ---------------------------------------------------------------- farger */
  function parseColor(str) {
    if (!str || str === 'transparent' || str === 'none') return null;
    const m = String(str).match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[\s,/]+/).filter(Boolean).map(parseFloat);
    if (p.length < 3 || p.some((n) => isNaN(n))) return null;
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  }

  function luminance(c) {
    const f = (v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  }

  function saturation(c) {
    const mx = Math.max(c.r, c.g, c.b);
    const mn = Math.min(c.r, c.g, c.b);
    return mx === 0 ? 0 : (mx - mn) / mx;
  }

  function hueOf(c) {
    const r = c.r / 255, g = c.g / 255, b = c.b / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    if (!d) return 0;
    let h;
    if (mx === r) h = ((g - b) / d) % 6;
    else if (mx === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    return h < 0 ? h + 360 : h;
  }

  function chromaOf(c) {
    return Math.max(c.r, c.g, c.b) - Math.min(c.r, c.g, c.b);
  }

  function rgbToHsl(c) {
    const r = c.r / 255, g = c.g / 255, b = c.b / 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    const l = (mx + mn) / 2;
    let h = 0;
    let sat = 0;
    if (d) {
      sat = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = ((g - b) / d) % 6;
      else if (mx === g) h = (b - r) / d + 2;
      else h = (r - g) / d + 4;
      h *= 60;
      if (h < 0) h += 360;
    }
    return { h: h, s: sat, l: l };
  }

  function hslToRgb(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 60) { r = c; g = x; }
    else if (h < 120) { r = x; g = c; }
    else if (h < 180) { g = c; b = x; }
    else if (h < 240) { g = x; b = c; }
    else if (h < 300) { r = x; b = c; }
    else { r = c; b = x; }
    return {
      r: Math.round((r + m) * 255),
      g: Math.round((g + m) * 255),
      b: Math.round((b + m) * 255),
      a: 1,
    };
  }

  function contrastRatio(a, b) {
    const l1 = luminance(a), l2 = luminance(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  }

  function toneFromColor(c) {
    if (!c || c.a < 0.08) return null;
    if (saturation(c) < 0.14) return null;
    const h = hueOf(c);
    if (h < 18 || h >= 336) return 'danger';
    if (h < 48) return 'warn';
    if (h < 70) return 'warn';
    if (h < 170) return 'ok';
    if (h < 260) return 'info';
    return 'accent';
  }

  /* --------------------------------------------------------------- verktøy */
  function isOurs(el) {
    return el.hasAttribute('data-klar-own') || !!el.closest('[data-klar-own]');
  }

  function textOf(el) {
    return (el.textContent || '').replace(/\s+/g, ' ').trim();
  }

  function visible(rect) {
    return rect.width > 0 && rect.height > 0;
  }

  function classOf(el) {
    return typeof el.className === 'string' ? el.className : el.getAttribute('class') || '';
  }

  function looksLike(el, re) {
    return re.test(classOf(el)) || re.test(el.id || '') || re.test(el.tagName.toLowerCase());
  }

  /* ================================================================= skallet
     Sidemeny, topplinje og hovedflate finnes én gang per side. De letes opp
     på nytt ved ruteendringer, siden Angular bytter ut hele treet.
     ====================================================================== */

  const NAV_RE = /(sidenav|sidebar|side-menu|sidemeny|main-?menu|mainnav|leftnav|left-?menu|nav-?panel|drawer|hovedmeny)/i;
  const BAR_RE = /(topbar|top-?nav|toolbar|appbar|app-?header|navbar|header-?bar|masthead)/i;
  const MAIN_RE = /(main-?content|content-?area|page-?content|app-?content|router-?outlet|workspace|content-wrapper)/i;

  function findSidebar() {
    const candidates = new Set();
    document
      .querySelectorAll('nav, aside, [role="navigation"], [class*="nav" i], [class*="menu" i], [class*="drawer" i], [id*="nav" i], [id*="menu" i]')
      .forEach((el) => candidates.add(el));

    let best = null;
    let bestScore = 0;
    const vh = window.innerHeight;

    candidates.forEach((el) => {
      if (isOurs(el)) return;
      const r = el.getBoundingClientRect();
      if (!visible(r)) return;
      if (r.left > 40 || r.width < 56 || r.width > 460) return;
      if (r.height < vh * 0.42) return;
      const links = el.querySelectorAll('a, [role="menuitem"], [role="treeitem"], button, li').length;
      if (links < 3) return;
      let score = r.height / vh + Math.min(links, 24) / 6;
      if (looksLike(el, NAV_RE)) score += 4;
      if (el.tagName === 'NAV' || el.getAttribute('role') === 'navigation') score += 2;
      /* Foretrekk den ytterste beholderen når flere overlapper */
      score -= depthOf(el) * 0.05;
      if (score > bestScore) {
        bestScore = score;
        best = el;
      }
    });
    return best;
  }

  function depthOf(el) {
    let d = 0;
    while ((el = el.parentElement)) d++;
    return d;
  }

  function findTopbar() {
    let best = null;
    let bestScore = 0;
    const vw = window.innerWidth;
    document
      .querySelectorAll('header, [role="banner"], [class*="header" i], [class*="toolbar" i], [class*="topbar" i], [class*="navbar" i], [class*="appbar" i]')
      .forEach((el) => {
        if (isOurs(el)) return;
        if (sidebarEl && (sidebarEl === el || sidebarEl.contains(el))) return;
        const r = el.getBoundingClientRect();
        if (!visible(r)) return;
        if (r.top > 12 || r.height < 28 || r.height > 150) return;
        if (r.width < vw * 0.45) return;
        let score = r.width / vw;
        if (looksLike(el, BAR_RE)) score += 2;
        if (el.tagName === 'HEADER' || el.getAttribute('role') === 'banner') score += 1.5;
        score -= depthOf(el) * 0.05;
        if (score > bestScore) {
          bestScore = score;
          best = el;
        }
      });
    return best;
  }

  /* Når hovedflaten ligger i en beholder som også rommer topplinja, går vi ett
     hakk ned – vi vil style selve innholdet, ikke hele høyre halvdel. */
  function refineMain(el, guard) {
    if (!el || !topbarEl || !el.contains(topbarEl) || (guard || 0) > 6) return el;
    let best = null;
    let bestArea = 0;
    for (const child of el.children) {
      if (child === topbarEl || child.contains(topbarEl) || isOurs(child)) continue;
      const r = child.getBoundingClientRect();
      const a = r.width * r.height;
      if (a > bestArea) {
        bestArea = a;
        best = child;
      }
    }
    if (best && bestArea > window.innerWidth * window.innerHeight * 0.12) return refineMain(best, (guard || 0) + 1);
    return el;
  }

  /* Siste utvei: følg den bredeste greina til høyre for menyen nedover i treet. */
  function structuralMain() {
    const sideRight = sidebarEl ? sidebarEl.getBoundingClientRect().right : 0;
    let node = document.body;
    for (let depth = 0; depth < 8; depth++) {
      let best = null;
      let bestArea = 0;
      for (const child of node.children) {
        if (isOurs(child) || SKIP_TAGS.has(child.tagName)) continue;
        if (sidebarEl && (child === sidebarEl || child.contains(sidebarEl))) {
          /* beholderen rommer menyen – gå inn i den */
          if (child.contains(sidebarEl) && child !== sidebarEl) {
            const r0 = child.getBoundingClientRect();
            const a0 = r0.width * r0.height;
            if (a0 > bestArea) {
              bestArea = a0;
              best = child;
            }
          }
          continue;
        }
        const r = child.getBoundingClientRect();
        if (!visible(r) || r.right < sideRight) continue;
        const a = r.width * r.height;
        if (a > bestArea) {
          bestArea = a;
          best = child;
        }
      }
      if (!best || best === node) break;
      node = best;
      if (!node.contains(sidebarEl) && node.getBoundingClientRect().left >= sideRight - 8) break;
    }
    return node === document.body ? null : node;
  }

  function findMain() {
    const explicit = document.querySelector('main, [role="main"]');
    if (explicit && visible(explicit.getBoundingClientRect())) return refineMain(explicit);

    let best = null;
    let bestScore = 0;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    document
      .querySelectorAll('[class*="content" i], [class*="page" i], [class*="main" i], [class*="container" i], [class*="view" i], [class*="body" i], [id*="content" i], section, article, router-outlet + *')
      .forEach((el) => {
        if (isOurs(el)) return;
        if (sidebarEl && (sidebarEl === el || el.contains(sidebarEl))) return;
        if (topbarEl && (topbarEl === el || topbarEl.contains(el))) return;
        const r = el.getBoundingClientRect();
        if (!visible(r)) return;
        if (r.width < vw * 0.4 || r.height < vh * 0.25) return;
        let score = (r.width * r.height) / (vw * vh);
        if (looksLike(el, MAIN_RE)) score += 2;
        if (el.querySelector('h1, h2')) score += 1;
        score -= depthOf(el) * 0.03;
        if (score > bestScore) {
          bestScore = score;
          best = el;
        }
      });
    return refineMain(best || structuralMain());
  }

  /* Mange oppsett har fast sidemeny og topplinje, og lar hovedflaten holde
     avstanden med sin egen luft. Da skal vi ikke overstyre den – vi legger
     bare til luft der appen ikke har noen. Verdien leses én gang, før våre
     egne regler slår inn. */
  const mainPad = new WeakMap();

  function applyMainPadding(el) {
    let pad = mainPad.get(el);
    if (!pad) {
      const cs = window.getComputedStyle(el);
      pad = {
        x: Math.min(parseFloat(cs.paddingLeft) || 0, parseFloat(cs.paddingRight) || 0),
        y: parseFloat(cs.paddingTop) || 0,
      };
      mainPad.set(el, pad);
    }
    if (pad.x < 14) el.setAttribute('data-klar-padx', '');
    if (pad.y < 14) el.setAttribute('data-klar-padt', '');
  }

  /* I sidemenyen er ikke alt lenker – mange oppsett bruker klikkbare div-er.
     Alt som oppfører seg som et menypunkt skal se ut som ett. */
  function isNavCandidate(el) {
    if (el.matches('a, button, [role="menuitem"], [role="treeitem"], [role="tab"], [role="link"]')) return true;
    if (/(^|[\s_-])(item|group|link|entry|node|row)/i.test(classOf(el)) && el.children.length <= 4) {
      return window.getComputedStyle(el).cursor === 'pointer';
    }
    return false;
  }

  function tagNavItems(nav) {
    const hash = location.hash || '';
    const items = nav.querySelectorAll(
      'a, button, [role="menuitem"], [role="treeitem"], [role="tab"], [role="link"], [class*="item" i], [class*="group" i], [class*="link" i]'
    );
    items.forEach((el) => {
      if (isOurs(el)) return;
      if (!isNavCandidate(el)) return;
      const t = textOf(el);
      if (!t || t.length > 48) return;
      /* hopp over elementer som bare inneholder et annet menypunkt */
      if (el.querySelector('a, button, [role="menuitem"], [role="treeitem"]')) return;
      el.setAttribute('data-klar-el', 'nav-item');

      const href = el.getAttribute('href') || '';
      const cls = classOf(el) + ' ' + classOf(el.parentElement || document.body);
      const activeByClass = /(^|[\s_-])(active|selected|current|is-open|router-link-active)/i.test(cls);
      const activeByAria = el.getAttribute('aria-current') !== null || el.getAttribute('aria-selected') === 'true';
      const activeByHref = href.length > 2 && hash.length > 2 && hash.indexOf(href.replace(/^#/, '')) === 0;
      if (activeByClass || activeByAria || activeByHref) el.setAttribute('data-klar-active', '');
      else el.removeAttribute('data-klar-active');
    });
  }

  /* Øverste tekstblokk i menyen er som regel skolens/Vismas navn. */
  function tagBrand(nav) {
    for (const child of nav.children) {
      if (child.hasAttribute('data-klar-el')) continue;
      if (child.querySelector('a, [role="menuitem"], button')) continue;
      const t = textOf(child);
      if (t && t.length <= 40) {
        child.setAttribute('data-klar-el', 'brand');
      }
      return;
    }
  }

  function shell() {
    const nextSidebar = findSidebar();
    if (nextSidebar) {
      if (sidebarEl && sidebarEl !== nextSidebar) sidebarEl.removeAttribute('data-klar-el');
      sidebarEl = nextSidebar;
      sidebarEl.setAttribute('data-klar-el', 'sidebar');
      tagBrand(sidebarEl);
      tagNavItems(sidebarEl);
    }

    const nextTop = findTopbar();
    if (nextTop) {
      if (topbarEl && topbarEl !== nextTop) topbarEl.removeAttribute('data-klar-el');
      topbarEl = nextTop;
      topbarEl.setAttribute('data-klar-el', 'topbar');
    }

    const nextMain = findMain();
    if (nextMain) {
      if (mainEl && mainEl !== nextMain) {
        mainEl.removeAttribute('data-klar-el');
        mainEl.removeAttribute('data-klar-padx');
        mainEl.removeAttribute('data-klar-padt');
      }
      mainEl = nextMain;
      mainEl.setAttribute('data-klar-el', 'main');
      applyMainPadding(mainEl);
    }
    mainRect = (mainEl || document.body).getBoundingClientRect();
    return { sidebar: sidebarEl, topbar: topbarEl, main: mainEl };
  }

  /* ============================================================ enkeltdeler */

  function tagButton(el, cs) {
    if (el.hasAttribute('data-klar-variant')) return;
    const t = textOf(el);
    const o = originalColors(el, cs);
    const bg = o.bg;
    const fg = o.fg;
    let variant = 'plain';

    if (bg && bg.a > 0.5 && saturation(bg) > 0.18 && luminance(bg) < 0.6) {
      variant = toneFromColor(bg) === 'danger' ? 'danger' : 'primary';
    } else if (!bg || bg.a < 0.08) {
      variant = 'ghost';
    }
    if (!t) {
      const r = el.getBoundingClientRect();
      if (!visible(r) || r.width <= 56) variant = 'icon';
    }
    if (fg && bg && bg.a < 0.08 && saturation(fg) > 0.3 && hueOf(fg) < 20) variant = 'danger';

    el.setAttribute('data-klar-el', 'btn');
    el.setAttribute('data-klar-variant', variant);
  }

  function tagBadge(el, cs) {
    if (el.getAttribute('data-klar-el') === 'badge') return;
    const o = originalColors(el, cs);
    const tone = toneFromColor(o.bg) || toneFromColor(o.fg);
    el.setAttribute('data-klar-el', 'badge');
    if (tone) el.setAttribute('data-klar-tone', tone);
  }

  function ownTextOf(el) {
    let t = '';
    for (const n of el.childNodes) if (n.nodeType === 3) t += n.nodeValue;
    return t.replace(/\s+/g, ' ').trim();
  }

  /* Fagnavnet er nesten alltid den mest fremhevede teksten i timen – større
     eller tyngre enn klokkeslett, rom og lærer. Vi bruker den som nøkkel, slik
     at samme fag får samme tone uansett dag, tid og rom. */
  function subjectKey(el) {
    let best = '';
    let bestScore = 0;
    const nodes = el.querySelectorAll('*');
    const list = nodes.length ? Array.prototype.slice.call(nodes) : [];
    list.push(el);
    for (const n of list) {
      const t = ownTextOf(n);
      if (t.length < 3) continue;
      const cs = window.getComputedStyle(n);
      const weight = parseInt(cs.fontWeight, 10) || 400;
      const score = (parseFloat(cs.fontSize) || 12) * (weight >= 600 ? 1.45 : weight >= 500 ? 1.15 : 1);
      if (score > bestScore) {
        bestScore = score;
        best = t;
      }
    }
    return (best || textOf(el))
      .toLowerCase()
      .replace(/[^a-zæøå ]+/g, ' ')
      .trim()
      .split(/\s+/)
      .filter((w) => w.length > 1)
      .slice(0, 3)
      .join(' ');
  }

  /* Emnefarger: samme fag skal alltid få samme tone, uavhengig av dag. */
  function hueFor(key) {
    let h = 0;
    for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return (h % 10) + 1;
  }

  const CANCEL_RE = /(avlyst|utgår|utgatt|cancel|fritatt)/i;

  function tagEvent(el, cs) {
    const t = textOf(el);
    if (!t) return false;
    el.setAttribute('data-klar-el', 'event');
    el.setAttribute('data-klar-hue', String(hueFor(subjectKey(el))));
    if (CANCEL_RE.test(t) || cs.textDecorationLine.indexOf('line-through') >= 0) {
      el.setAttribute('data-klar-state', 'cancelled');
    }
    return true;
  }

  /* En time kjennes igjen på at flaten har et fargestikk – også de svake
     pastellene InSchool bruker. Men et enslig farget felt er som regel en
     infoboks, ikke en time, så fargekoding slår først inn når flere ligger
     samlet (se promoteEvents). */
  function looksLikeEvent(el, cs, rect) {
    if (!NS.settings || !NS.settings.colorCode) return false;
    const bg = originalColors(el, cs).bg;
    if (!bg || bg.a < 0.15) return false;
    if (chromaOf(bg) < 8) return false;
    if (rect.width < 44 || rect.height < 18) return false;
    if (mainRect && rect.width * rect.height > mainRect.width * mainRect.height * 0.16) return false;
    if (el.matches('a[href], button, input, select, textarea, th')) return false;
    const t = textOf(el);
    return t.length > 0 && t.length < 220;
  }

  function promoteEvents() {
    const host = mainEl || document.body;
    if (!host) return;
    const cands = Array.from(host.querySelectorAll('[data-klar-cand]'));
    if (!cands.length) return;

    /* Hovedflaten og <body> teller ikke som klynge – da ville en enslig
       infoboks blitt farget bare fordi timeplanen ligger på samme side. */
    const counts = new Map();
    const tooBig = new Set([mainEl, document.body, document.documentElement].filter(Boolean));
    cands.forEach((c) => {
      let p = c.parentElement;
      for (let d = 0; p && d < 6; d++, p = p.parentElement) {
        if (tooBig.has(p)) break;
        counts.set(p, (counts.get(p) || 0) + 1);
      }
    });

    cands.forEach((c) => {
      c.removeAttribute('data-klar-cand');
      if (c.hasAttribute('data-klar-el')) return;
      let p = c.parentElement;
      let cluster = false;
      for (let d = 0; p && d < 6; d++, p = p.parentElement) {
        if (tooBig.has(p)) break;
        if ((counts.get(p) || 0) >= 3) {
          cluster = true;
          break;
        }
      }
      if (!cluster) return;
      c.removeAttribute('data-klar-paper');
      c.removeAttribute('data-klar-ink');
      c.style.removeProperty('--klar-fg');
      tagEvent(c, window.getComputedStyle(c));
      c.querySelectorAll('[data-klar-ink]').forEach((k) => {
        k.removeAttribute('data-klar-ink');
        k.style.removeProperty('--klar-fg');
      });
    });
  }

  function looksLikeCard(el, cs, rect) {
    if (el.getAttribute('data-klar-el') === 'card') return true;
    if (rect.width < 190 || rect.height < 62) return false;
    if (!el.children.length) return false;
    if (mainRect && rect.height > Math.max(mainRect.height, window.innerHeight) * 1.6) return false;
    if (rect.width > window.innerWidth - 24 && rect.height > window.innerHeight * 1.2) return false;

    const bg = originalColors(el, cs).bg;
    const hasBg = !!bg && bg.a > 0.04;
    const hasShadow = cs.boxShadow && cs.boxShadow !== 'none';
    const hasBorder =
      parseFloat(cs.borderTopWidth) > 0 ||
      parseFloat(cs.borderBottomWidth) > 0 ||
      parseFloat(cs.borderLeftWidth) > 0;
    const hasRadius = parseFloat(cs.borderTopLeftRadius) > 1;
    const named = /(^|[\s_-])(card|panel|widget|tile|box|paper|surface|kort)/i.test(classOf(el)) || el.tagName === 'MAT-CARD';

    if (named && (hasBg || hasShadow || hasBorder)) return true;
    if (hasShadow && hasBg) return true;
    return hasBg && (hasBorder || hasRadius) && el.querySelector('h1,h2,h3,h4,table,ul,ol,p,dl');
  }

  function cardDepth(el) {
    let d = 0;
    let p = el.parentElement;
    while (p) {
      if (p.getAttribute && p.getAttribute('data-klar-el') === 'card') d++;
      p = p.parentElement;
    }
    return d;
  }

  /* Flater og tekst som ligger igjen fra originaldesignet males om, slik at
     grå og hvite toner følger paletten (og blir lesbare i mørk modus). */
  function repaint(el, cs, dark) {
    if (el === document.body || el === document.documentElement) return;
    const o = originalColors(el, cs);
    const bg = o.bg;
    if (bg && bg.a > 0.05 && saturation(bg) < 0.16) {
      const l = luminance(bg);
      if (l > 0.93) el.setAttribute('data-klar-paper', '1');
      else if (l > 0.85) el.setAttribute('data-klar-paper', '2');
      else if (l > 0.7) el.setAttribute('data-klar-paper', '3');
      else if (dark && l > 0.16) el.setAttribute('data-klar-paper', '2');
    }
    const fg = o.fg;
    if (!fg || fg.a < 0.3) return;
    const l = luminance(fg);
    if (dark) {
      /* Mørk tekst på det som nå er en mørk flate må lysne. */
      if (saturation(fg) > 0.22) return;
      if (l < 0.12) el.setAttribute('data-klar-ink', '1');
      else if (l < 0.3) el.setAttribute('data-klar-ink', '2');
      else if (l < 0.42) el.setAttribute('data-klar-ink', '3');
      return;
    }
    /* I lys modus samstemmer vi kalde gråtoner med paletten, men lar lenker,
       knapper og tydelig fargede elementer være i fred. */
    if (saturation(fg) > 0.34) return;
    if (el.matches('a[href], button, [role="button"], [data-klar-el]')) return;
    if (l < 0.05) el.setAttribute('data-klar-ink', '1');
    else if (l < 0.18) el.setAttribute('data-klar-ink', '2');
    else if (l < 0.5) el.setAttribute('data-klar-ink', '3');
  }

  /* Timeplanens rutenett: en tabell med flere fargede timer. Dagens kolonne
     får en svak tone slik at blikket finner den med én gang. */
  const DAYS = ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag'];

  function markGrid(table) {
    if (table.querySelectorAll('[data-klar-el="event"]').length < 3) return;
    table.setAttribute('data-klar-grid', '');
    markToday(table);
  }

  function markToday(table) {
    const today = DAYS[new Date().getDay()];
    const heads = table.querySelectorAll('thead th, tr:first-child th');
    let index = -1;
    heads.forEach((th, i) => {
      if (index < 0 && textOf(th).toLowerCase().indexOf(today) === 0) index = i;
    });
    table.querySelectorAll('[data-klar-today]').forEach((el) => el.removeAttribute('data-klar-today'));
    if (index < 0) return;
    if (heads[index]) heads[index].setAttribute('data-klar-today', '');
    table.querySelectorAll('tbody tr').forEach((tr) => {
      const cell = tr.children[index];
      if (cell) cell.setAttribute('data-klar-today', '');
    });
  }

  /* ================================================== lesbarhet
     Appen har mange tekstfarger som var ment mot hvitt. Etter ommaling kan de
     havne under kravet til kontrast. Her måles hver tekst mot flaten den
     faktisk ligger på, og fargen løftes – med hue-en i behold – til den er
     over 4.5:1. Kun elementer med egen tekst røres.
     ====================================================================== */

  const TEXT_SKIP =
    '[data-klar-el="event"], [data-klar-el="badge"], [data-klar-el="btn"], [data-klar-el="sidebar"], [data-klar-own]';

  function hasOwnText(el) {
    for (const n of el.childNodes) {
      if (n.nodeType === 3 && n.nodeValue && n.nodeValue.trim().length) return true;
    }
    return false;
  }

  function effectiveBg(el) {
    let n = el;
    while (n && n.nodeType === 1) {
      const cs = window.getComputedStyle(n);
      /* Ligger teksten på et bilde eller en gradient, vet vi ikke hva den
         faktisk står mot – da rører vi den ikke. */
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return null;
      const c = parseColor(cs.backgroundColor);
      if (c && c.a > 0.7) return c;
      n = n.parentElement;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  }

  function fixContrast(el, cs) {
    if (!hasOwnText(el)) return;
    if (el.closest(TEXT_SKIP)) return;
    const fg = parseColor(cs.color);
    if (!fg || fg.a < 0.5) return;
    const bg = effectiveBg(el);
    if (!bg) return;
    if (contrastRatio(fg, bg) >= 4.5) return;

    const needLight = luminance(bg) < 0.42;
    const hsl = rgbToHsl(fg);
    const sat = Math.min(hsl.s, needLight ? 0.5 : 0.72);
    const steps = needLight ? [0.72, 0.78, 0.84, 0.9, 0.96] : [0.42, 0.35, 0.28, 0.21, 0.14, 0.07];
    for (const l of steps) {
      const c = hslToRgb(hsl.h, hsl.s < 0.06 ? 0 : sat, l);
      if (contrastRatio(c, bg) >= 4.6) {
        el.style.setProperty('--klar-fg', 'rgb(' + c.r + ',' + c.g + ',' + c.b + ')');
        el.setAttribute('data-klar-ink', 'auto');
        return;
      }
    }
    el.setAttribute('data-klar-ink', '1');
  }

  function clearAdjustments() {
    document.querySelectorAll('[data-klar-ink="auto"]').forEach((el) => {
      el.style.removeProperty('--klar-fg');
      el.removeAttribute('data-klar-ink');
    });
  }

  /* ------------------------------------------------------------ hovedpass */
  function process(el, dark) {
    if (!el || el.nodeType !== 1) return;
    if (el.namespaceURI && el.namespaceURI.indexOf('svg') > 0) return;
    const tag = el.tagName;
    if (SKIP_TAGS.has(tag)) return;
    if (isOurs(el)) return;

    const stage = seen.get(el) || 0;
    if (stage >= 2 && checked.has(el)) return;

    const cs = window.getComputedStyle(el);
    if (!cs) return;

    if (stage < 1) {
      let handled = false;

      if (
        tag === 'BUTTON' ||
        el.getAttribute('role') === 'button' ||
        (tag === 'INPUT' && /^(submit|button|reset)$/i.test(el.type || '')) ||
        (tag === 'A' && /(^|[\s_-])(btn|button|knapp)/i.test(classOf(el)))
      ) {
        if (!(sidebarEl && sidebarEl.contains(el))) {
          tagButton(el, cs);
          handled = true;
        }
      } else if (
        (tag === 'INPUT' && !/^(checkbox|radio|file|range|hidden|image|color)$/i.test(el.type || '')) ||
        tag === 'SELECT' ||
        tag === 'TEXTAREA' ||
        el.getAttribute('role') === 'combobox' ||
        el.getAttribute('role') === 'searchbox' ||
        el.getAttribute('contenteditable') === 'true'
      ) {
        el.setAttribute('data-klar-el', 'field');
        handled = true;
      } else if (tag === 'TABLE') {
        el.setAttribute('data-klar-el', 'table');
        handled = true;
      } else if (
        /(^|[\s_-])(badge|chip|tag|pill|status|label-|counter)/i.test(classOf(el)) &&
        !ICON_RE.test(classOf(el)) &&
        !(sidebarEl && sidebarEl.contains(el))
      ) {
        const t = textOf(el);
        if (t && t.length <= 28 && el.children.length <= 2) {
          tagBadge(el, cs);
          handled = true;
        }
      }

      if (!handled && !el.hasAttribute('data-klar-el')) repaint(el, cs, dark);
      seen.set(el, 1);
    }

    /* Geometriavhengig del – krever at elementet faktisk er synlig. */
    const rect = el.getBoundingClientRect();
    if (!visible(rect)) return; /* prøves igjen ved neste fullskann */

    if (stage >= 2) {
      fixContrast(el, cs);
      checked.add(el);
      return;
    }

    const role = el.getAttribute('role');
    if ((role === 'dialog' || role === 'alertdialog' || tag === 'DIALOG') && !el.hasAttribute('data-klar-el')) {
      const fullscreen = rect.width > window.innerWidth * 0.88 && rect.height > window.innerHeight * 0.88;
      if (fullscreen) {
        /* Elementet er selve bakteppet – boksen inni skal være flaten. */
        el.setAttribute('data-klar-el', 'backdrop');
        let box = null;
        let boxArea = 0;
        for (const child of el.children) {
          const r = child.getBoundingClientRect();
          const a = r.width * r.height;
          if (a > boxArea && a < window.innerWidth * window.innerHeight * 0.85) {
            boxArea = a;
            box = child;
          }
        }
        if (box) box.setAttribute('data-klar-el', 'surface');
      } else {
        el.setAttribute('data-klar-el', 'surface');
      }
    }

    if (!el.hasAttribute('data-klar-el') && mainEl && mainEl.contains(el)) {
      if (looksLikeEvent(el, cs, rect)) {
        el.setAttribute('data-klar-cand', '');
      } else if (cardDepth(el) < 2 && looksLikeCard(el, cs, rect)) {
        el.removeAttribute('data-klar-paper');
        el.setAttribute('data-klar-el', 'card');
        if (el.matches('a[href], [role="button"], [tabindex]:not([tabindex="-1"])')) {
          el.setAttribute('data-klar-clickable', '');
        }
      }
    }
    fixContrast(el, cs);
    checked.add(el);
    seen.set(el, 2);
  }

  /* Kjører i porsjoner slik at siden ikke hakker. */
  let queue = [];
  let running = false;

  function pump(dark) {
    running = true;
    const deadline = performance.now() + 8;
    let n = 0;
    while (queue.length && performance.now() < deadline && n < 600) {
      process(queue.shift(), dark);
      n++;
    }
    if (queue.length) {
      (window.requestIdleCallback || window.requestAnimationFrame)(() => pump(dark));
    } else {
      running = false;
      promoteEvents();
      (mainEl || document.body).querySelectorAll('table').forEach(markGrid);
    }
  }

  function enqueue(nodes, dark) {
    for (const node of nodes) {
      if (!node || node.nodeType !== 1) continue;
      queue.push(node);
      const kids = node.querySelectorAll ? node.querySelectorAll('*') : [];
      for (let i = 0; i < kids.length && queue.length < 20000; i++) queue.push(kids[i]);
    }
    if (!running && queue.length) pump(dark);
  }

  function scanAll(dark) {
    if (!document.body) return;
    checked = new WeakSet();
    queue = [];
    enqueue([document.body], dark);
  }

  function reset() {
    queue = [];
    running = false;
    seen = new WeakMap();
    checked = new WeakSet();
    clearAdjustments();
    sidebarEl = topbarEl = mainEl = null;
  }

  NS.classify = { shell, scanAll, enqueue, reset, tagNavItems, markGrid, promoteEvents, structuralMain, clearAdjustments, get main() { return mainEl; } };
})();

/* ==========================================================================
   Klar – oppsett og livssyklus
   ========================================================================== */
(function () {
  'use strict';

  const NS = (window.__klar = window.__klar || {});
  const root = document.documentElement;
  let scanTimer = null;
  let shellTimer = null;
  let fab = null;

  /* ------------------------------------------------------------ attributter */
  function applyAttrs(s) {
    NS.settings = s;
    root.setAttribute('data-klar', s.enabled ? 'on' : 'off');
    root.setAttribute('data-klar-scheme', NS.resolveScheme(s));
    root.setAttribute('data-klar-accent', s.accent);
    root.setAttribute('data-klar-density', s.density);
    root.setAttribute('data-klar-sidebar', s.sidebar);
    root.setAttribute('data-klar-fab', s.fab ? 'on' : 'off');
  }

  function isDark() {
    return root.getAttribute('data-klar-scheme') === 'dark';
  }

  /* ------------------------------------------------------------------ skann */
  function refreshShell() {
    if (!NS.settings.enabled || !document.body) return;
    const parts = NS.classify.shell();
    const hosts = [parts.main, NS.classify.structuralMain(), document.body];
    for (const host of hosts) {
      if (!host) continue;
      NS.hero.mount(host);
      if (!NS.settings.hero || NS.hero.ok()) break;
    }
  }

  function scheduleScan(nodes) {
    if (!NS.settings.enabled) return;
    if (nodes && nodes.length) NS.classify.enqueue(nodes, isDark());
    clearTimeout(shellTimer);
    shellTimer = setTimeout(refreshShell, 220);
  }

  function fullRescan() {
    if (!NS.settings.enabled || !document.body) return;
    refreshShell();
    NS.classify.scanAll(isDark());
  }

  function watchDom() {
    const obs = new MutationObserver((records) => {
      const added = [];
      for (const rec of records) {
        for (const node of rec.addedNodes) {
          if (node.nodeType === 1 && !node.hasAttribute('data-klar-own')) added.push(node);
        }
      }
      if (!added.length) return;
      clearTimeout(scanTimer);
      scanTimer = setTimeout(() => scheduleScan(added), 90);
    });
    obs.observe(document.documentElement, { childList: true, subtree: true });
  }

  /* Angular bytter visning uten sideinnlasting – vi følger med på ruta. */
  function watchRoute() {
    let last = location.href;
    const changed = () => {
      if (location.href === last) return;
      last = location.href;
      setTimeout(fullRescan, 260);
      setTimeout(fullRescan, 900);
    };
    window.addEventListener('hashchange', changed);
    window.addEventListener('popstate', changed);
    ['pushState', 'replaceState'].forEach((m) => {
      const orig = history[m];
      if (typeof orig !== 'function') return;
      history[m] = function () {
        const r = orig.apply(this, arguments);
        changed();
        return r;
      };
    });
    setInterval(changed, 1200);
  }

  function watchScroll() {
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      if (y > 6) root.setAttribute('data-klar-scrolled', '');
      else root.removeAttribute('data-klar-scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true, capture: true });
    document.addEventListener('scroll', onScroll, { passive: true, capture: true });
    onScroll();
  }

  /* ------------------------------------------------------------------- knapp */
  const SUN =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M18.7 5.3l-1.6 1.6M6.9 17.1l-1.6 1.6"/></svg>';
  const MOON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14.4A8.4 8.4 0 0 1 9.6 4a8.4 8.4 0 1 0 10.4 10.4z"/></svg>';

  function mountFab() {
    if (!document.body) return;
    if (fab && fab.isConnected) {
      paintFab();
      return;
    }
    fab = document.createElement('button');
    fab.className = 'klar-fab';
    fab.type = 'button';
    fab.setAttribute('data-klar-own', '');
    fab.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      applyAttrs(NS.saveSettings({ scheme: isDark() ? 'light' : 'dark' }));
      paintFab();
      fullRescan();
    });
    document.body.appendChild(fab);
    paintFab();
  }

  function paintFab() {
    if (!fab) return;
    const dark = isDark();
    fab.innerHTML = (dark ? SUN : MOON) + '<span>' + (dark ? 'Lys' : 'Mørk') + '</span>';
    fab.title = 'Klar: bytt mellom lys og mørk (Alt+Shift+D)';
  }

  /* ----------------------------------------------------------------- oppsett */
  function afterBody(fn) {
    if (document.body) return fn();
    new MutationObserver((_, obs) => {
      if (document.body) {
        obs.disconnect();
        fn();
      }
    }).observe(document.documentElement, { childList: true });
  }

  async function start() {
    applyAttrs(NS.settings); /* speilet – umiddelbart, uten blink */
    const css = NS.injectCss();
    NS.injectFont();

    const s = await NS.loadSettings();
    applyAttrs(s);
    await css; /* kontrastmålingen er verdiløs før temaet faktisk gjelder */

    afterBody(() => {
      mountFab();
      watchDom();
      watchRoute();
      watchScroll();
      fullRescan();
      setTimeout(fullRescan, 700);
      setTimeout(fullRescan, 2000);
    });

    NS.onSettingsChange((next) => {
      const wasDark = isDark();
      applyAttrs(next);
      if (!next.enabled) {
        NS.hero.unmount();
      } else {
        if (wasDark !== isDark()) NS.classify.reset();
        fullRescan();
      }
      paintFab();
    });

    if (window.matchMedia) {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      const onMq = () => {
        if (NS.settings.scheme !== 'auto') return;
        applyAttrs(NS.settings);
        paintFab();
        fullRescan();
      };
      mq.addEventListener ? mq.addEventListener('change', onMq) : mq.addListener(onMq);
    }

    try {
      chrome.runtime.onMessage.addListener((msg) => {
        if (!msg) return;
        if (msg.type === 'klar:toggle') {
          applyAttrs(NS.saveSettings({ enabled: !NS.settings.enabled }));
          if (!NS.settings.enabled) NS.hero.unmount();
          else fullRescan();
          paintFab();
        } else if (msg.type === 'klar:scheme') {
          applyAttrs(NS.saveSettings({ scheme: isDark() ? 'light' : 'dark' }));
          NS.classify.reset();
          fullRescan();
          paintFab();
        }
      });
    } catch (e) {
      /* ignorer */
    }
  }

  start();
})();

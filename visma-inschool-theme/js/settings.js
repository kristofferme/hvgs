/* ==========================================================================
   Klar – innstillinger
   Leser/skriver chrome.storage.sync, og speiler verdiene i localStorage slik
   at temaet kan påføres synkront ved document_start (ingen hvit blink).
   ========================================================================== */
(function () {
  'use strict';

  const NS = (window.__klar = window.__klar || {});

  const DEFAULTS = {
    enabled: true,
    scheme: 'auto', // auto | light | dark
    accent: 'spruce', // spruce | ocean | plum | amber | cobalt
    density: 'cozy', // cozy | compact
    sidebar: 'light', // light | dark
    hero: true,
    colorCode: true,
    fab: true,
  };

  const MIRROR_KEY = '__klar_settings_v1';

  function clean(raw) {
    const s = Object.assign({}, DEFAULTS, raw || {});
    if (!['auto', 'light', 'dark'].includes(s.scheme)) s.scheme = DEFAULTS.scheme;
    if (!['spruce', 'ocean', 'plum', 'amber', 'cobalt'].includes(s.accent)) s.accent = DEFAULTS.accent;
    if (!['cozy', 'compact'].includes(s.density)) s.density = DEFAULTS.density;
    if (!['dark', 'light'].includes(s.sidebar)) s.sidebar = DEFAULTS.sidebar;
    ['enabled', 'hero', 'colorCode', 'fab'].forEach((k) => (s[k] = !!s[k]));
    return s;
  }

  function readMirror() {
    try {
      return clean(JSON.parse(localStorage.getItem(MIRROR_KEY) || 'null'));
    } catch (e) {
      return clean(null);
    }
  }

  function writeMirror(s) {
    try {
      localStorage.setItem(MIRROR_KEY, JSON.stringify(s));
    } catch (e) {
      /* privat modus e.l. – speilet er kun en optimalisering */
    }
  }

  function load() {
    return new Promise((resolve) => {
      try {
        chrome.storage.sync.get(DEFAULTS, (raw) => {
          const s = clean(chrome.runtime.lastError ? null : raw);
          writeMirror(s);
          resolve(s);
        });
      } catch (e) {
        resolve(readMirror());
      }
    });
  }

  function save(patch) {
    const next = clean(Object.assign({}, NS.settings, patch));
    writeMirror(next);
    try {
      chrome.storage.sync.set(next);
    } catch (e) {
      /* ignorer */
    }
    return next;
  }

  function onChange(fn) {
    try {
      chrome.storage.onChanged.addListener((changes, area) => {
        if (area !== 'sync') return;
        const next = clean(
          Object.assign({}, NS.settings, Object.fromEntries(Object.entries(changes).map(([k, v]) => [k, v.newValue])))
        );
        writeMirror(next);
        fn(next);
      });
    } catch (e) {
      /* ignorer */
    }
  }

  /* Lys eller mørk, etter at «auto» er slått opp mot systemvalget. */
  function resolveScheme(s) {
    if (s.scheme === 'auto') {
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return s.scheme;
  }

  NS.DEFAULTS = DEFAULTS;
  NS.settings = readMirror();
  NS.loadSettings = load;
  NS.saveSettings = save;
  NS.onSettingsChange = onChange;
  NS.resolveScheme = resolveScheme;
  NS.cleanSettings = clean;
})();

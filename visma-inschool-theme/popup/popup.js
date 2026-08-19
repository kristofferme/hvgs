/* Klar – logikk for innstillingspanelet */
(function () {
  'use strict';

  const DEFAULTS = {
    enabled: true,
    scheme: 'auto',
    accent: 'spruce',
    density: 'cozy',
    sidebar: 'dark',
    hero: true,
    colorCode: true,
    fab: true,
  };

  const groups = Array.from(document.querySelectorAll('[data-field]'));
  const switches = ['enabled', 'hero', 'colorCode', 'fab'].map((id) => document.getElementById(id));
  let state = Object.assign({}, DEFAULTS);

  function systemDark() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  function render() {
    groups.forEach((g) => {
      const field = g.dataset.field;
      g.querySelectorAll('button').forEach((b) => {
        b.setAttribute('aria-pressed', String(b.dataset.value === state[field]));
      });
    });
    switches.forEach((el) => (el.checked = !!state[el.id]));
    document.body.dataset.disabled = String(!state.enabled);
    const dark = state.scheme === 'dark' || (state.scheme === 'auto' && systemDark());
    document.documentElement.dataset.scheme = dark ? 'dark' : 'light';
    const swatch = document.querySelector('[data-field="accent"] [data-value="' + state.accent + '"]');
    if (swatch) {
      document.documentElement.style.setProperty('--accent', dark ? darker(swatch.style.getPropertyValue('--sw')) : swatch.style.getPropertyValue('--sw').trim());
    }
  }

  /* Aksentfargen lysnes i mørk modus, som i selve temaet. */
  function darker(hex) {
    const map = {
      '#17594e': '#5ec8a8',
      '#1a4f95': '#6fb1f7',
      '#6d2f61': '#d693c9',
      '#8a5510': '#e6b06a',
      '#2f3ab5': '#94a0f5',
    };
    return map[hex.trim().toLowerCase()] || hex.trim();
  }

  function save(patch) {
    state = Object.assign({}, state, patch);
    render();
    chrome.storage.sync.set(state);
  }

  groups.forEach((g) => {
    g.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-value]');
      if (!btn) return;
      save({ [g.dataset.field]: btn.dataset.value });
    });
  });

  switches.forEach((el) => {
    el.addEventListener('change', () => save({ [el.id]: el.checked }));
  });

  chrome.storage.sync.get(DEFAULTS, (raw) => {
    state = Object.assign({}, DEFAULTS, raw || {});
    render();
  });
})();

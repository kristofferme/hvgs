/* ==========================================================================
   Klar – innsprøyting av stil og skrift
   Stilarkene legges inn som <style> sist i <html> slik at de vinner over
   sidens egne ark. Skriften lastes via FontFace-API-et, som også virker på
   sider med streng CSP for font-src.
   ========================================================================== */
(function () {
  'use strict';

  const NS = (window.__klar = window.__klar || {});
  const FILES = ['css/tokens.css', 'css/base.css', 'css/layout.css', 'css/components.css', 'css/timetable.css'];
  const nodes = [];
  let keeperQueued = false;

  function url(path) {
    return chrome.runtime.getURL(path);
  }

  async function injectCss() {
    const root = document.documentElement;
    const texts = await Promise.all(
      FILES.map((f) =>
        fetch(url(f))
          .then((r) => r.text())
          .catch(() => '')
      )
    );
    texts.forEach((text, i) => {
      if (!text) return;
      const style = document.createElement('style');
      style.setAttribute('data-klar-own', '');
      style.setAttribute('data-klar-css', FILES[i]);
      style.textContent = text;
      root.appendChild(style);
      nodes.push(style);
    });
    keepLast();
  }

  /* Sidens rammeverk laster stil dynamisk. Vi flytter våre ark bakerst igjen
     dersom noe legger seg etter dem. */
  function keepLast() {
    const obs = new MutationObserver(() => {
      if (keeperQueued) return;
      keeperQueued = true;
      requestAnimationFrame(() => {
        keeperQueued = false;
        const root = document.documentElement;
        const last = nodes[nodes.length - 1];
        if (!last || last === root.lastElementChild) return;
        nodes.forEach((n) => root.appendChild(n));
      });
    });
    obs.observe(document.documentElement, { childList: true });
    if (document.head) obs.observe(document.head, { childList: true });
  }

  async function injectFont() {
    if (!window.FontFace || !document.fonts) return;
    try {
      const buf = await fetch(url('fonts/InterVariable.woff2')).then((r) => r.arrayBuffer());
      const face = new FontFace('Klar Inter', buf, { weight: '100 900', display: 'swap' });
      await face.load();
      document.fonts.add(face);
    } catch (e) {
      /* systemets egen grotesk brukes da – temaet fungerer uansett */
    }
  }

  NS.injectCss = injectCss;
  NS.injectFont = injectFont;
})();

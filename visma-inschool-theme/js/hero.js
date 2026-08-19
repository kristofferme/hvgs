/* ==========================================================================
   Klar – hero
   En rolig velkomstflate øverst i innholdet: hilsen, dato, uke og klokke.
   Alt innhold utledes av tid og av sidens egen tittel – ingen data hentes.
   ========================================================================== */
(function () {
  'use strict';

  const NS = (window.__klar = window.__klar || {});
  let el = null;
  let timer = null;

  const PAGE_TITLES = [
    [/timetable|timeplan/i, 'Timeplan', 'Uka di, time for time.'],
    [/absence|frav/i, 'Fravær', 'Oversikt over føringer og dokumentasjon.'],
    [/assess|vurder|karakter|grade/i, 'Vurdering', 'Karakterer, tilbakemeldinger og frister.'],
    [/message|melding|mail/i, 'Meldinger', 'Samtaler med skolen.'],
    [/homework|lekse|task|oppgave/i, 'Arbeid', 'Lekser og innleveringer framover.'],
    [/schedule|plan/i, 'Planlegger', 'Det som skjer framover.'],
    [/exam|eksamen|prøve/i, 'Prøver', 'Datoer og forberedelser.'],
    [/course|fag|subject/i, 'Fag', 'Fagene dine dette skoleåret.'],
    [/student|elev|person/i, 'Elev', 'Personalia og kontaktinformasjon.'],
    [/dashboard|home|start/i, 'Oversikt', 'Alt det viktigste samlet på ett sted.'],
  ];

  function greeting(h) {
    if (h < 5) return 'God natt';
    if (h < 10) return 'God morgen';
    if (h < 12) return 'God formiddag';
    if (h < 17) return 'God ettermiddag';
    if (h < 22) return 'God kveld';
    return 'God natt';
  }

  /* ISO-8601 ukenummer */
  function isoWeek(d) {
    const t = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    const day = t.getUTCDay() || 7;
    t.setUTCDate(t.getUTCDate() + 4 - day);
    const start = new Date(Date.UTC(t.getUTCFullYear(), 0, 1));
    return Math.ceil(((t - start) / 86400000 + 1) / 7);
  }

  function semester(d) {
    const y = d.getFullYear();
    return d.getMonth() >= 6 ? 'Høst ' + y : 'Vår ' + y;
  }

  function pageInfo() {
    const hash = location.hash || location.pathname || '';
    for (const [re, title, sub] of PAGE_TITLES) {
      if (re.test(hash)) return { title, sub };
    }
    const active = document.querySelector('[data-klar-el="nav-item"][data-klar-active]');
    if (active) {
      const t = (active.textContent || '').replace(/\s+/g, ' ').trim();
      if (t && t.length < 40) return { title: t, sub: 'Alt om ' + t.toLowerCase() + ' samlet.' };
    }
    return { title: 'Visma InSchool', sub: 'Skoledagen din, samlet på ett sted.' };
  }

  function build() {
    const node = document.createElement('section');
    node.className = 'klar-hero';
    node.setAttribute('data-klar-own', '');
    node.innerHTML =
      '<div class="klar-hero__row">' +
      '<div class="klar-hero__col">' +
      '<div class="klar-hero__eyebrow" data-k="eyebrow"></div>' +
      '<h1 class="klar-hero__title" data-k="title"></h1>' +
      '<p class="klar-hero__sub" data-k="sub"></p>' +
      '</div>' +
      '<div class="klar-hero__meta">' +
      '<span class="klar-hero__tag" data-k="week"></span>' +
      '<span class="klar-hero__tag" data-k="term"></span>' +
      '<div class="klar-hero__clock" data-k="clock"></div>' +
      '</div>' +
      '</div>';
    return node;
  }

  function fill(node) {
    const now = new Date();
    const info = pageInfo();
    const dato = now.toLocaleDateString('nb-NO', { weekday: 'long', day: 'numeric', month: 'long' });
    const q = (k) => node.querySelector('[data-k="' + k + '"]');
    q('eyebrow').textContent = info.title + ' · ' + dato.charAt(0).toUpperCase() + dato.slice(1);
    q('title').textContent = greeting(now.getHours());
    q('sub').textContent = info.sub;
    q('week').textContent = 'Uke ' + isoWeek(now);
    q('term').textContent = semester(now);
    q('clock').textContent = now.toLocaleTimeString('nb-NO', { hour: '2-digit', minute: '2-digit' });
  }

  function mount(main) {
    if (!main) return;
    if (!NS.settings || !NS.settings.hero) {
      unmount();
      return;
    }
    if (!el || !el.isConnected) el = build();
    if (el.parentElement !== main || main.firstElementChild !== el) main.insertBefore(el, main.firstChild);
    fill(el);
    if (!timer) timer = setInterval(() => el && el.isConnected && fill(el), 20000);
  }

  function unmount() {
    if (el && el.parentElement) el.parentElement.removeChild(el);
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  }

  NS.hero = { mount, unmount };
})();

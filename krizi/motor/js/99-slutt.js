  /* ==========================================================================
     Hovedløkka og oppstart
     ========================================================================== */

  function lokke(na) {
    if (flight) stegFly(na); else pust(na);
    oppdaterParallakse();
    var endret = brukKamera();
    verden.tegn(na);
    if (redigerer && endret) {
      oppdaterMarkering();
      oppdaterMerker();
      if (hoverId) visHover(hoverId);
    }
    requestAnimationFrame(lokke);
  }

  function start() {
    brukStil();
    verden.storrelse();
    byggVerden();
    byggDokk();
    var n = parseInt(location.hash.slice(1), 10);
    if (doc.sti.length && n >= 1 && n <= doc.sti.length) {
      pos = n - 1;
      gaTil(pos, { straks: true });
    } else if (doc.sti.length) {
      // Åpning: start langt ute og fly inn til første ramme
      var o = oversiktsVisning();
      cam.x = o.x; cam.y = o.y; cam.z = o.z * 0.4; cam.r = -8;
      setTimeout(function () { gaTil(0, { type: 'fly', fly: { varighet: reduser ? 200 : 2600, ease: 'quint' } }); }, 380);
    } else {
      var o2 = oversiktsVisning(); cam.x = o2.x; cam.y = o2.y; cam.z = o2.z; cam.r = 0;
      veksleRedigering(true);
    }
    requestAnimationFrame(lokke);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(tilpassAlle);
    setTimeout(tilpassAlle, 1500);

    var utkast = null;
    try { utkast = JSON.parse(lager.get(UTKAST) || 'null'); } catch (e) { utkast = null; }
    if (utkast && utkast.doc && JSON.stringify(normaliser(utkast.doc)) !== JSON.stringify(doc)) {
      var tid = new Date(utkast.tid).toLocaleString('no', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
      toast('Du har ulagrede endringer fra ' + tid + '.', [
        { tekst: 'Hent dem tilbake', primar: true, fn: function () { historikk.push(JSON.stringify(doc)); settDoc(JSON.stringify(utkast.doc)); veksleRedigering(true); } },
        { tekst: 'Forkast', fn: function () { lager.del(UTKAST); } }
      ], 0);
    } else if (doc.sti.length && !lager.get('krizi-sett-hjelp-2')) {
      setTimeout(function () { toast(W < 700 ? 'Trykk eller sveip for neste · snu telefonen for større tekst' : '→ eller mellomrom for neste · O for oversikt · E for å redigere'); }, 3000);
      lager.set('krizi-sett-hjelp-2', '1');
    }
    aktivitet();
  }

  window.krizi = {
    neste: neste, forrige: forrige, gaTil: gaTil, rediger: veksleRedigering, oversikt: visOversikt,
    doc: function () { return doc; }, html: somHTML, versjon: VERSJON, stil: function () { return aktivStil(); },
    terning: terning, velg: velg, forhandsvis: forhandsvis,
    brukMal: function (navn) { var m = finnMal(navn); if (!m) return false; doc.stil = stilFraMal(m, doc.stil.seed); brukStil(); byggVerden(); return true; },
    maler: function () { return STILER.map(function (m) { return m.navn; }); }
  };
  start();
})();

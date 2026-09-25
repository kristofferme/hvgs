/* Sikkerhet: verneutstyr, mann over bord, risikomatrise, branntrekanten, kaldt vann. */

(function () {
  var S = FF.svg;

  /* Påbudsskilt i ISO 7010-stil: hvitt piktogram på blå sirkel */
  var PIKTO = {
    hjelm: '<circle cx="50" cy="56" r="13" fill="#fff"/><path d="M28 50 C28 30 72 30 72 50 L76 52 L24 52 Z" fill="#fff"/><path d="M30 86 C30 72 70 72 70 86 Z" fill="#fff"/>',
    horsel: '<circle cx="50" cy="50" r="16" fill="#fff"/><path d="M30 86 C30 72 70 72 70 86 Z" fill="#fff"/><path d="M28 48 C28 22 72 22 72 48" fill="none" stroke="#fff" stroke-width="4"/><rect x="24" y="42" width="10" height="18" rx="4" fill="#fff" stroke="var(--paabud)" stroke-width="2"/><rect x="66" y="42" width="10" height="18" rx="4" fill="#fff" stroke="var(--paabud)" stroke-width="2"/>',
    briller: '<circle cx="50" cy="52" r="17" fill="#fff"/><path d="M30 88 C30 74 70 74 70 88 Z" fill="#fff"/><rect x="31" y="42" width="38" height="12" rx="5" fill="var(--paabud)"/><rect x="34" y="44" width="14" height="8" rx="3" fill="#fff"/><rect x="52" y="44" width="14" height="8" rx="3" fill="#fff"/>',
    hansker: '<path d="M38 84 V66 L28 54 a5 5 0 0 1 8 -6 L40 52 V26 a5 5 0 0 1 10 0 V46 V22 a5 5 0 0 1 10 0 V46 V26 a5 5 0 0 1 10 0 V50 V36 a5 5 0 0 1 10 0 V62 C78 72 72 78 66 80 V84 Z" fill="#fff"/>',
    sko: '<path d="M32 20 H54 V58 L76 64 C82 66 84 72 82 78 H26 V70 C26 66 30 62 32 60 Z" fill="#fff"/><rect x="26" y="78" width="56" height="6" fill="#fff"/>',
    vest: '<circle cx="50" cy="26" r="10" fill="#fff"/><path d="M30 42 C30 36 38 36 44 36 L50 50 L56 36 C62 36 70 36 70 42 L70 84 L54 84 L50 60 L46 84 L30 84 Z" fill="#fff"/><path d="M32 60 H44 M56 60 H68" stroke="var(--paabud)" stroke-width="3"/>'
  };
  FF.fig.verneutstyr = function (o) {
    var liste = (o && o.liste) || [
      ["vest", "Flytevest", "Alltid på dekk"],
      ["hjelm", "Hjelm", "Under kran og løft"],
      ["hansker", "Hansker", "Tau, krok og kniv"],
      ["sko", "Vernestøvler", "Stål i tåa, sklisikre"],
      ["horsel", "Hørselvern", "Maskinrom og vinsj"],
      ["briller", "Vernebriller", "Sliping, bøting, is"]
    ];
    var w = 160, s = '<svg viewBox="0 0 ' + (liste.length * w) + ' 250" role="img" aria-label="Påbudsskilt for personlig verneutstyr.">';
    liste.forEach(function (x, i) {
      var cx = i * w + w / 2;
      s += '<g transform="translate(' + (cx - 50) + ' 20)"><circle cx="50" cy="50" r="50" fill="var(--paabud)"/><circle cx="50" cy="50" r="46" fill="none" stroke="#fff" stroke-width="2"/>' + PIKTO[x[0]] + "</g>";
      s += '<text x="' + cx + '" y="160" text-anchor="middle" style="font:700 20px var(--f-display);fill:var(--blekk)">' + x[1] + "</text>";
      s += '<text x="' + cx + '" y="182" text-anchor="middle" class="t-mono t-dempet">' + x[2] + "</text>";
    });
    return s + "</svg>";
  };

  /* Mann over bord – Williamson-sving */
  FF.fig.williamson = function () {
    var id = FF.uid("wi");
    var s = '<svg viewBox="0 0 1000 520" role="img" aria-label="Williamson-sving: fartøyet svinger ut, legger om roret og kommer tilbake på motsatt kurs mot personen i vannet.">';
    s += "<defs>" + S.pil(id, "var(--magenta)") + "</defs>";
    s += '<rect width="1000" height="520" fill="var(--sjo)"/>';
    // Opprinnelig kurs
    s += '<line x1="330" y1="500" x2="330" y2="40" stroke="var(--blekk-3)" stroke-width="1" stroke-dasharray="6 5"/>';
    s += '<text x="318" y="490" text-anchor="end" class="t-mono t-dempet">opprinnelig kurs 000°</text>';
    // Banen
    var d = "M330 470 L330 340 C330 300 350 262 385 238 C430 206 470 160 470 120 C470 70 420 44 372 50 C340 54 330 80 330 110 L330 318";
    s += '<path d="' + d + '" fill="none" stroke="var(--magenta)" stroke-width="3" marker-end="url(#' + id + ')"/>';
    // Personen
    s += '<circle cx="330" cy="340" r="9" fill="var(--oransje)" stroke="var(--blekk)" stroke-width="1.5"/>';
    s += '<circle cx="330" cy="340" r="18" fill="none" stroke="var(--oransje)" stroke-width="1.5" stroke-dasharray="3 3"/>';
    // Båtikon ved start
    s += '<path d="M330 452 c8 10 9 22 8 34 h-16 c-1 -12 0 -24 8 -34 z" fill="var(--blekk)"/>';
    // Nummererte punkt
    function nr(x, y, n, tx, ty, tittel, tekst) {
      var r = '<circle cx="' + x + '" cy="' + y + '" r="14" fill="var(--blekk)"/><text x="' + x + '" y="' + (y + 5) + '" text-anchor="middle" style="font:800 15px var(--f-sjablong);fill:var(--papir)">' + n + "</text>";
      r += '<text x="' + tx + '" y="' + ty + '" style="font:700 19px var(--f-display);fill:var(--blekk)">' + tittel + "</text>";
      tekst.forEach(function (t, i) { r += '<text x="' + tx + '" y="' + (ty + 20 + i * 17) + '" class="t-mono" style="font-size:12px;fill:var(--blekk-2)">' + t + "</text>"; });
      return r;
    }
    s += nr(300, 340, 1, 560, 400, "Rop, pek, kast", ["«Mann over bord, styrbord!»", "Kast livbøye. Trykk MOB på plotteren.", "Én person peker og slipper ikke taket."]);
    s += nr(385, 238, 2, 560, 270, "Hardt ror mot siden", ["Legg roret hardt over mot den", "siden personen falt ut."]);
    s += nr(470, 120, 3, 560, 130, "Ved 60° fra kursen", ["Legg roret hardt over til", "motsatt side."]);
    s += nr(330, 110, 4, 60, 150, "Motsatt kurs 180°", ["Rett opp. Personen ligger", "nå foran baugen. Senk farten", "og kom opp på le side."]);
    s += '<text x="60" y="60" style="font:700 24px var(--f-display);fill:var(--blekk)">Williamson-sving</text>';
    s += '<text x="60" y="84" class="t-mono t-dempet">Når du ikke ser personen, eller om natta.</text>';
    s += '<text x="60" y="100" class="t-mono t-dempet">Ser du personen: kortest mulig vei tilbake.</text>';
    return s + "</svg>";
  };

  /* Risikomatrise 5 × 5 */
  FF.fig.risikomatrise = function (o) {
    o = o || {};
    var cel = 86, x0 = 170, y0 = 40;
    var s = '<svg viewBox="0 0 700 600" role="img" aria-label="Risikomatrise med sannsynlighet på den loddrette aksen og konsekvens på den vannrette.">';
    var sKat = ["Svært sjelden", "Sjelden", "Kan skje", "Sannsynlig", "Svært sannsynlig"];
    var kKat = ["Ubetydelig", "Liten", "Moderat", "Alvorlig", "Katastrofal"];
    for (var sv = 0; sv < 5; sv++) for (var k = 0; k < 5; k++) {
      var verdi = (sv + 1) * (k + 1);
      var farge = verdi >= 12 ? "var(--babord)" : verdi >= 5 ? "var(--gul)" : "var(--styrbord)";
      var x = x0 + k * cel, y = y0 + (4 - sv) * cel;
      s += '<rect x="' + x + '" y="' + y + '" width="' + (cel - 3) + '" height="' + (cel - 3) + '" fill="' + farge + '" fill-opacity="' + (verdi >= 12 ? 0.85 : verdi >= 5 ? 0.75 : 0.7) + '"/>';
      s += '<text x="' + (x + cel / 2 - 1) + '" y="' + (y + cel / 2 + 6) + '" text-anchor="middle" style="font:600 18px var(--f-mono);fill:' + (verdi >= 12 || verdi < 5 ? "#fff" : "#1a1400") + '">' + verdi + "</text>";
    }
    sKat.forEach(function (t, i) { s += '<text x="' + (x0 - 12) + '" y="' + (y0 + (4 - i) * cel + cel / 2 + 4) + '" text-anchor="end" class="t-liten">' + t + "</text>"; });
    kKat.forEach(function (t, i) { s += '<text x="' + (x0 + i * cel + cel / 2) + '" y="' + (y0 + 5 * cel + 22) + '" text-anchor="middle" class="t-liten">' + t + "</text>"; });
    s += '<text x="' + (x0 + 2.5 * cel) + '" y="' + (y0 + 5 * cel + 52) + '" text-anchor="middle" style="font:700 18px var(--f-display);fill:var(--blekk)">KONSEKVENS →</text>';
    s += '<text transform="translate(28 ' + (y0 + 2.5 * cel) + ') rotate(-90)" text-anchor="middle" style="font:700 18px var(--f-display);fill:var(--blekk)">SANNSYNLIGHET →</text>';
    if (o.merk) {
      o.merk.forEach(function (m) {
        var x = x0 + (m[1] - 1) * cel + cel / 2, y = y0 + (5 - m[0]) * cel + cel / 2;
        s += '<circle cx="' + x + '" cy="' + (y - 20) + '" r="11" fill="var(--flate)" stroke="var(--blekk)" stroke-width="2"/><text x="' + x + '" y="' + (y - 15.5) + '" text-anchor="middle" style="font:700 12px var(--f-mono);fill:var(--blekk)">' + m[2] + "</text>";
      });
    }
    return s + "</svg>";
  };

  /* Branntrekanten */
  FF.fig.branntrekant = function () {
    var s = '<svg viewBox="0 0 1000 400" role="img" aria-label="Branntrekanten: varme, oksygen og brennbart materiale. Fjern én side, og brannen slukker.">';
    s += '<path d="M250 50 L420 340 L80 340 Z" fill="var(--oransje-flate)" stroke="var(--oransje)" stroke-width="10" stroke-linejoin="round"/>';
    s += '<path d="M250 150 C280 190 290 220 272 262 C262 236 250 230 244 214 C236 238 222 250 226 280 C200 256 196 222 214 194 C222 214 232 216 236 206 C232 186 238 166 250 150 Z" fill="var(--oransje)"/>';
    s += '<text x="140" y="190" text-anchor="end" transform="rotate(-60 140 190)" style="font:700 22px var(--f-display);fill:var(--blekk)"></text>';
    s += '<text x="118" y="176" text-anchor="middle" style="font:700 22px var(--f-display);fill:var(--blekk)">VARME</text>';
    s += '<text x="384" y="176" text-anchor="middle" style="font:700 22px var(--f-display);fill:var(--blekk)">OKSYGEN</text>';
    s += '<text x="250" y="380" text-anchor="middle" style="font:700 22px var(--f-display);fill:var(--blekk)">BRENNBART MATERIALE</text>';
    var r = [
      ["Kjøle", "Fjerner varmen", "Vann – aldri på fett eller strøm"],
      ["Kvele", "Fjerner oksygenet", "Brannteppe, CO₂, skum, lukk dører"],
      ["Sulte", "Fjerner brenselet", "Steng drivstoff og strøm"]
    ];
    r.forEach(function (x, i) {
      var y = 90 + i * 100;
      s += '<text x="560" y="' + y + '" style="font:800 30px var(--f-display);fill:var(--oransje-tekst)">' + x[0] + "</text>";
      s += '<text x="680" y="' + (y - 6) + '" style="font:700 17px var(--f-display);fill:var(--blekk)">' + x[1] + "</text>";
      s += '<text x="680" y="' + (y + 14) + '" class="t-mono t-dempet">' + x[2] + "</text>";
      s += '<line x1="560" y1="' + (y + 32) + '" x2="960" y2="' + (y + 32) + '" stroke="var(--linje)"/>';
    });
    return s + "</svg>";
  };

  /* 1–10–1: det som skjer når du havner i kaldt vann */
  FF.fig.kaldtvann = function () {
    var s = '<svg viewBox="0 0 1000 300" role="img" aria-label="Regelen 1–10–1 for kaldt vann: ett minutt kuldesjokk, ti minutter med nyttige bevegelser, én time før bevisstløshet.">';
    var deler = [
      ["1", "minutt", "Kuldesjokk", "Du gisper etter luft. Hold hodet over vann og få kontroll på pusten.", 270],
      ["10", "minutter", "Nyttige bevegelser", "Nå må du berge deg selv: ta tak, kom deg opp, tenn lys, bruk fløyta.", 320],
      ["1", "time", "Før bevisstløshet", "Kroppen kjøles ned. Flytevest og drakt holder deg oppe til hjelpen kommer.", 350]
    ];
    var x = 30;
    deler.forEach(function (d, i) {
      var w = d[4];
      s += '<rect x="' + x + '" y="40" width="' + (w - 6) + '" height="64" fill="' + ["var(--babord)", "var(--oransje)", "var(--paabud)"][i] + '"/>';
      s += '<text x="' + (x + 14) + '" y="90" style="font:800 46px var(--f-sjablong);fill:#fff">' + d[0] + '</text><text x="' + (x + (d[0].length > 1 ? 70 : 46)) + '" y="88" style="font:700 18px var(--f-display);fill:#fff;text-transform:uppercase;letter-spacing:.06em">' + d[1] + "</text>";
      s += '<text x="' + x + '" y="140" style="font:700 20px var(--f-display);fill:var(--blekk)">' + d[2] + "</text>";
      var ord = d[3].split(" "), linje = "", ly = 164;
      ord.forEach(function (o) {
        if ((linje + " " + o).length * 7.3 > w - 24) { s += '<text x="' + x + '" y="' + ly + '" class="t-mono" style="font-size:12px;fill:var(--blekk-2)">' + linje + "</text>"; ly += 17; linje = o; }
        else linje = linje ? linje + " " + o : o;
      });
      s += '<text x="' + x + '" y="' + ly + '" class="t-mono" style="font-size:12px;fill:var(--blekk-2)">' + linje + "</text>";
      x += w;
    });
    s += '<text x="30" y="270" class="t-mono t-dempet">Tidene er en tommelfingerregel. I norsk sjøvann om vinteren går det ofte fortere.</text>';
    return s + "</svg>";
  };
})();

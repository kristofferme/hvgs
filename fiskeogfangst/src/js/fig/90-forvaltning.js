/* Forvaltning og økonomi: kvotetrakten, forvaltningsnivåene, lott og veien videre. */

(function () {
  var S = FF.svg;

  FF.fig.kvotetrakt = function () {
    var niv = [
      ["Forskningsråd", "ICES og HI anbefaler hvor mye som kan fiskes", 0.98],
      ["Totalkvote (TAC)", "Forhandles – torsk i nord med Russland", 0.84],
      ["Norges kvote", "Norges andel av totalkvoten", 0.7],
      ["Gruppekvoter", "Delt mellom havfiske- og kystflåten", 0.56],
      ["Fartøygrupper", "Kystflåten deles i lengdegrupper", 0.42],
      ["Fartøykvote", "Hvor mye akkurat din båt kan fiske i år", 0.28]
    ];
    var s = '<svg viewBox="0 0 1000 470" role="img" aria-label="Kvotetrakten: fra forskningsråd og totalkvote, via Norges kvote og gruppekvoter, ned til kvoten for ett fartøy.">';
    var cx = 290, h = 66;
    niv.forEach(function (n, i) {
      var w1 = 560 * n[2], w2 = 560 * (niv[i + 1] ? niv[i + 1][2] : n[2] * 0.8);
      var y = 20 + i * (h + 8);
      var farge = i === 0 ? "var(--grunt)" : i === niv.length - 1 ? "var(--magenta)" : "var(--grunt-2)";
      s += '<path d="M' + (cx - w1 / 2) + " " + y + " H" + (cx + w1 / 2) + " L" + (cx + w2 / 2) + " " + (y + h) + " H" + (cx - w2 / 2) + ' Z" fill="' + farge + '" stroke="var(--blekk)" stroke-width="1.5"/>';
      s += '<text x="' + cx + '" y="' + (y + h / 2 + 7) + '" text-anchor="middle" style="font:700 19px var(--f-display);fill:' + (i === niv.length - 1 ? "#fff" : "var(--blekk)") + '">' + n[0] + "</text>";
      s += '<line x1="' + (cx + w1 / 2 + 8) + '" y1="' + (y + h / 2) + '" x2="590" y2="' + (y + h / 2) + '" stroke="var(--linje-2)" stroke-dasharray="2 3"/>';
      s += '<text x="600" y="' + (y + h / 2 + 5) + '" class="t-mono" style="font-size:12.5px;fill:var(--blekk-2)">' + n[1] + "</text>";
    });
    return s + "</svg>";
  };

  FF.fig.forvaltning = function () {
    var s = '<svg viewBox="0 0 1000 520" role="img" aria-label="Forvaltningsnivåene i fiskerinæringen: Stortinget, departementet, direktoratene, forskning, kontroll, salgslagene og organisasjonene.">';
    function boks(x, y, w, h, t, u, fyll, farge) {
      return '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" fill="' + (fyll || "var(--flate)") + '" stroke="' + (farge || "var(--blekk)") + '" stroke-width="1.8"/>' +
        '<text x="' + (x + 12) + '" y="' + (y + 26) + '" style="font:700 17px var(--f-display);fill:var(--blekk)">' + t + "</text>" +
        u.map(function (l, i) { return '<text x="' + (x + 12) + '" y="' + (y + 46 + i * 15) + '" class="t-mono" style="font-size:11.5px;fill:var(--blekk-2)">' + l + "</text>"; }).join("");
    }
    function linje(x1, y1, x2, y2) { return '<path d="M' + x1 + " " + y1 + " V" + ((y1 + y2) / 2) + " H" + x2 + " V" + y2 + '" fill="none" stroke="var(--blekk)" stroke-width="1.5"/>'; }
    s += '<text x="20" y="30" class="t-liten t-dempet">LOVGIVNING OG POLITIKK</text>';
    s += boks(360, 40, 280, 70, "Stortinget", ["Lover: havressurslova,", "deltakerloven"], "var(--land)");
    s += boks(330, 150, 340, 70, "Nærings- og fiskeridepartementet", ["Forskrifter, kvoter, internasjonale", "avtaler"], "var(--land)");
    s += linje(500, 110, 500, 150);
    s += '<text x="20" y="262" class="t-liten t-dempet">FORVALTNING, FORSKNING OG KONTROLL</text>';
    var rad = [
      ["Fiskeridirektoratet", ["Reguleringer og", "kontroll"]],
      ["Havforskningsinstituttet", ["Bestandsberegninger", "og råd"]],
      ["Kystvakten", ["Kontroll på havet"]],
      ["Sjøfartsdirektoratet", ["Sikkerhet på fartøy,", "sertifikater"]],
      ["Mattilsynet", ["Mattrygghet og", "hygiene"]]
    ];
    rad.forEach(function (r, i) {
      var x = 20 + i * 196;
      s += boks(x, 272, 184, 84, r[0], r[1]);
      s += linje(500, 220, x + 92, 272);
    });
    s += '<text x="20" y="392" class="t-liten t-dempet">NÆRINGEN SELV</text>';
    var org = [
      ["Salgslagene", ["Førstehåndssalg,", "minstepris, sluttsedler"], "var(--grunt)"],
      ["Norges Fiskarlag", ["Fiskernes interesser,", "reguleringsmøtet"], "var(--grunt)"],
      ["Fiskebåt", ["Havfiskeflåten"], "var(--grunt)"],
      ["Sjømannsforbundet", ["Mannskapets lønns-", "og arbeidsvilkår"], "var(--grunt)"],
      ["Sjømatrådet", ["Markedsfører norsk", "sjømat i utlandet"], "var(--grunt)"]
    ];
    org.forEach(function (r, i) { s += boks(20 + i * 196, 402, 184, 84, r[0], r[1], r[2]); });
    s += '<text x="980" y="512" text-anchor="end" class="t-mono t-dempet">Internasjonalt: ICES · Den norsk-russiske fiskerikommisjonen · avtaler med EU, Storbritannia og Færøyene</text>';
    return s + "</svg>";
  };

  FF.fig.lott = function (o) {
    o = o || {};
    var brutto = o.brutto || 1000000, felles = o.felles || 220000, andel = o.andel || 0.5, lotter = o.lotter || 3;
    var netto = brutto - felles, mannskap = netto * andel, baat = netto - mannskap;
    var W = 920, x0 = 40;
    function b(v) { return W * v / brutto; }
    var s = '<svg viewBox="0 0 1000 330" role="img" aria-label="Lottoppgjør: fangstverdi minus felleskostnader gir nettoverdi, som deles i båtlott og mannskapslott.">';
    s += '<rect x="' + x0 + '" y="40" width="' + W + '" height="46" fill="var(--grunt-2)" stroke="var(--blekk)"/>';
    s += '<text x="' + (x0 + 12) + '" y="70" style="font:700 18px var(--f-display);fill:var(--blekk)">Fangstverdi (brutto) ' + FF.kr(brutto) + "</text>";
    s += '<rect x="' + x0 + '" y="110" width="' + b(felles) + '" height="46" fill="var(--linje-2)" stroke="var(--blekk)"/>';
    s += '<text x="' + (x0 + 10) + '" y="139" style="font:700 15px var(--f-display);fill:var(--blekk)">Felleskostnader</text>';
    s += '<rect x="' + (x0 + b(felles)) + '" y="110" width="' + b(netto) + '" height="46" fill="var(--land)" stroke="var(--blekk)"/>';
    s += '<text x="' + (x0 + b(felles) + 12) + '" y="139" style="font:700 17px var(--f-display);fill:var(--blekk)">Nettoverdi ' + FF.kr(netto) + "</text>";
    s += '<rect x="' + (x0 + b(felles)) + '" y="180" width="' + b(baat) + '" height="46" fill="var(--skrog)" stroke="var(--blekk)"/>';
    s += '<text x="' + (x0 + b(felles) + 12) + '" y="209" style="font:700 17px var(--f-display);fill:#fff">Båtlott ' + FF.kr(baat) + "</text>";
    s += '<rect x="' + (x0 + b(felles) + b(baat)) + '" y="180" width="' + b(mannskap) + '" height="46" fill="var(--magenta)" stroke="var(--blekk)"/>';
    s += '<text x="' + (x0 + b(felles) + b(baat) + 12) + '" y="209" style="font:700 17px var(--f-display);fill:#fff">Mannskapslott ' + FF.kr(mannskap) + "</text>";
    for (var i = 0; i < lotter; i++) {
      var w = b(mannskap) / lotter;
      var x = x0 + b(felles) + b(baat) + i * w;
      s += '<rect x="' + x + '" y="250" width="' + (w - 4) + '" height="40" fill="var(--magenta-flate)" stroke="var(--magenta)"/>';
      s += '<text x="' + (x + 8) + '" y="275" class="t-mono" style="font-size:12px;fill:var(--blekk)">1 lott ' + FF.kr(mannskap / lotter) + "</text>";
    }
    s += '<text x="' + x0 + '" y="275" class="t-mono t-dempet">Drivstoff, agn, is, avgifter …</text>';
    s += '<text x="' + x0 + '" y="318" class="t-mono t-dempet">Eksempeltall. Prosentene står i hyreavtalen og tariffavtalen for fartøyet.</text>';
    return s + "</svg>";
  };

  /* Veien videre – som et linjekart */
  FF.fig.veivalg = function () {
    var s = '<svg viewBox="0 0 1000 400" role="img" aria-label="Veien videre: Vg1 naturbruk, Vg2 fiske og fangst, læretid, fagbrev som fisker, og videre til fiskeskippersertifikat, fagskole eller høyere utdanning.">';
    var y = 200, fx = 500;
    s += '<path d="M60 ' + y + ' H' + fx + '" stroke="var(--magenta)" stroke-width="10" stroke-linecap="round"/>';
    s += '<path d="M' + fx + ' ' + y + ' C560 ' + y + ' 560 80 620 80 H640" fill="none" stroke="var(--magenta)" stroke-width="10" stroke-linecap="round"/>';
    s += '<path d="M' + fx + ' ' + y + ' H640" fill="none" stroke="var(--skrog)" stroke-width="10" stroke-linecap="round"/>';
    s += '<path d="M' + fx + ' ' + y + ' C560 ' + y + ' 560 320 620 320 H640" fill="none" stroke="var(--oransje)" stroke-width="10" stroke-linecap="round"/>';
    s += '<path d="M200 ' + y + ' C240 ' + y + ' 240 300 290 300 H330" fill="none" stroke="var(--linje-2)" stroke-width="6" stroke-dasharray="2 10" stroke-linecap="round"/>';
    s += '<text x="340" y="304" class="t-mono t-dempet">eller Vg3 i skole</text>';
    var st = [[60, "Vg1", "Naturbruk"], [200, "Vg2", "Fiske og fangst"], [350, "Lære", "2 år om bord"], [fx, "Fagbrev", "Fisker"]];
    st.forEach(function (p) {
      s += '<circle cx="' + p[0] + '" cy="' + y + '" r="16" fill="var(--flate)" stroke="var(--blekk)" stroke-width="4"/>';
      s += '<text x="' + p[0] + '" y="' + (y - 34) + '" text-anchor="middle" style="font:800 22px var(--f-sjablong);fill:var(--blekk)">' + p[1] + "</text>";
      s += '<text x="' + p[0] + '" y="' + (y + 44) + '" text-anchor="middle" class="t-mono" style="font-size:12px;fill:var(--blekk-2)">' + p[2] + "</text>";
    });
    s += '<circle cx="200" cy="' + y + '" r="23" fill="none" stroke="var(--magenta)" stroke-width="2"/>';
    s += '<text x="200" y="' + (y + 64) + '" text-anchor="middle" class="t-liten t-magenta">DU ER HER</text>';
    var ender = [[80, "Fiskeskipper klasse C", "Fører fiskefartøy under 15 m.", "Krever fartstid, SRC og sikkerhetskurs."],
      [y, "Fagskole og maritim utdanning", "Fiskeskipper A og B,", "maskinist, styrmann."],
      [320, "Påbygg og høyere utdanning", "Nautikk, fiskeri- og havbruksfag,", "økonomi og ledelse."]];
    ender.forEach(function (e) {
      s += '<circle cx="652" cy="' + e[0] + '" r="11" fill="var(--flate)" stroke="var(--blekk)" stroke-width="3"/>';
      s += '<text x="676" y="' + (e[0] - 4) + '" style="font:700 18px var(--f-display);fill:var(--blekk)">' + e[1] + "</text>";
      s += '<text x="676" y="' + (e[0] + 15) + '" class="t-mono t-dempet" style="font-size:11.5px">' + e[2] + "</text>";
      s += '<text x="676" y="' + (e[0] + 30) + '" class="t-mono t-dempet" style="font-size:11.5px">' + e[3] + "</text>";
    });
    return s + "</svg>";
  };
})();

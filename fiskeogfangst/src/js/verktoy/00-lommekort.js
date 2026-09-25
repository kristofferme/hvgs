/* Om bord-kort: korte sjekklister i stor skrift, laget for mobilen. */

FF.lommekort = [
  { id: "mob", kode: "KORT 01 · NØD", tittel: "Mann over bord", nod: true, kort: "Rop, pek, kast, trykk MOB – og kom deg tilbake.",
    punkter: [["Rop «mann over bord»", "Si hvilken side. Alle skal høre det."], ["Pek – og slipp ikke med blikket", "Én person gjør bare dette."], ["Kast livbøye", "Så nær som mulig."], ["Trykk MOB på plotteren", "Posisjonen lagres."], ["Gi alarm og send MAYDAY", "VHF 16 / DSC 70 / mobil 120."], ["Manøvrer tilbake", "Ser du personen: kortest vei. Ellers: Williamson-sving."], ["Berg på le side", "Lav fart. Nett, heis eller MOB-båt."]] },
  { id: "nodmelding", kode: "KORT 02 · NØD", tittel: "Nødmelding", nod: true, kort: "Slik sender du MAYDAY på VHF kanal 16.",
    punkter: [["Trykk DSC-knappen", "Hold den røde knappen inne til alarmen går."], ["Kanal 16, høy effekt", "Trykk inn og snakk rolig."], ["MAYDAY MAYDAY MAYDAY", "Dette er [navn ×3], kallesignal, MMSI."], ["MAYDAY [navn]", "Gjenta navn og kallesignal."], ["Posisjon", "Bredde og lengde, eller peiling og avstand fra kjent sted."], ["Hva har skjedd og hva trenger dere", "Brann, lekk, mann over bord …"], ["Antall personer – OVER", "Slipp knappen og lytt."]] },
  { id: "brann", kode: "KORT 03 · NØD", tittel: "Brann", nod: true, kort: "Varsle, redde, begrense, slokke.",
    punkter: [["Varsle", "Rop «brann» og utløs alarmen."], ["Redde", "Få alle ut av fare og tell opp."], ["Begrense", "Lukk dører og luker. Stopp vifter."], ["Steng drivstoff og strøm", "Nødstopp og hovedbryter."], ["Slokke", "CO₂ eller pulver på olje og elektrisk. Aldri vann på fett."], ["MAYDAY", "Hvis brannen ikke er under kontroll."]] },
  { id: "motorsjekk", kode: "KORT 04", tittel: "Motorsjekk", kort: "Før start, ved start og ved stopp.",
    punkter: [["Olje i motor og gir", "Mellom merkene."], ["Kjølevæske", "Sjekk kald. Aldri åpne varm."], ["Diesel og vannutskiller", "Nok til turen. Tapp vann."], ["Sjøvannsfilter og bunnventil", "Rent filter, åpen ventil."], ["Reimer og lekkasjer", "Hele reimer, tørt under motoren."], ["Start: vann i eksosen?", "Nei = stopp motoren."], ["Stopp: tomgang først", "La turboen kjøle seg. Noter timer."]] },
  { id: "avgang", kode: "KORT 05", tittel: "Før avgang", kort: "Sjekklista før dere kaster loss.",
    punkter: [["Vær og bølgevarsel", "Holder det hele turen?"], ["Alle har flytevest og kjenner fartøyinstruksen", "Nye om bord har fått sikkerhetsgjennomgang."], ["Redningsutstyr", "Drakter, livbøye, flåte, EPIRB."], ["Motorsjekk gjort", "Se kort 04."], ["Luker og dører lukket, lensepumper virker", "Lensportene er åpne."], ["Navigasjon", "Lanterner, VHF, plotter, radar. Reiseplan klar."], ["Noen på land vet", "Hvor dere skal og når dere er tilbake."]] }
];

FF.lommekort.forEach(function (k) {
  FF.verktoy[k.id] = {
    tittel: k.tittel, etikett: "Om bord-kort", kort: k.kort, skjult: true,
    mount: function (el) {
      var nokkel = "lk-" + k.id;
      var huket = (FF.tilstand.sjekk[nokkel]) || {};
      el.innerHTML = '<div class="lk-stor' + (k.nod ? " nod" : "") + '">' +
        (k.nod ? '<div class="lk-nod">Nød til sjøs <span>VHF 16 · DSC 70 · 120</span></div>' : "") +
        '<ol class="lk-liste">' + k.punkter.map(function (p, i) {
          return '<li><label><span><strong>' + FF.esc(p[0]) + "</strong><span>" + FF.esc(p[1]) + '</span></span><input type="checkbox" data-i="' + i + '"' + (huket[i] ? " checked" : "") + ' aria-label="Utført: ' + FF.esc(p[0]) + '"></label></li>';
        }).join("") + '</ol><button type="button" class="knapp sekundar lk-null" style="margin-top:18px">Nullstill kortet</button></div>';
      el.querySelector(".lk-liste").addEventListener("change", function (e) {
        FF.tilstand.sjekk[nokkel] = FF.tilstand.sjekk[nokkel] || {};
        FF.tilstand.sjekk[nokkel][e.target.getAttribute("data-i")] = e.target.checked;
        FF.lagre();
      });
      el.querySelector(".lk-null").addEventListener("click", function () {
        FF.tilstand.sjekk[nokkel] = {}; FF.lagre();
        FF.$$("input", el).forEach(function (i) { i.checked = false; });
      });
    }
  };
});

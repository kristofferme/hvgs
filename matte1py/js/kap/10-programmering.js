/* Kapittel 10 – Algoritmar og programmering */
(function () {
  const { R, el, n, tilf, vel } = MT;

  const PROGRAM = {
    'Rentesrente': `saldo = 10000
rente = 4

for aar in range(1, 11):
    saldo = saldo * (1 + rente / 100)
    print(f"År {aar}: {saldo:.2f} kr")`,
    'Når passerer bestanden 1000?': `hjort = 400
aar = 0

while hjort < 1000:
    hjort = hjort * 1.08
    aar = aar + 1

print("Bestanden passerer 1000 dyr etter", aar, "år")
print("Då er det", round(hjort), "hjort")`,
    'Fôrkalkulator (med input)': `sauer = int(input("Tal på sauer: "))
kg = float(input("Kg fôr per sau per dag: "))
dagar = 200

total = sauer * kg * dagar
print("Du treng", round(total), "kg fôr til innefôringa")

if total > 50000:
    print("Det er meir enn 50 tonn!")
else:
    print("Det er under 50 tonn.")`,
    'Snittvekt av lam': `vekter = [4.2, 3.8, 5.1, 4.6, 3.9, 4.4]
summen = 0

for v in vekter:
    summen = summen + v

snitt = summen / len(vekter)
print(f"Snittvekt: {snitt:.2f} kg")
print("Tyngste lam:", max(vekter), "kg")`,
    'Verditabell for ein funksjon': `def kostnad(timar):
    return 45 * timar + 300

print("Timar | Kostnad")
for t in range(0, 11, 2):
    print(t, "|", kostnad(t), "kr")`,
    'Sjekk rett vinkel': `import math

a = 3
b = 4
c = math.sqrt(a**2 + b**2)
print("Diagonalen skal vere", c, "m")

malt = 5.04
if abs(malt - c) < 0.02:
    print("Hjørnet er rett nok!")
else:
    print("Juster hjørnet.")`,
  };

  /* --- Python-laben --- */
  function lab(vert, opts = {}) {
    const velg = el('select', { id: 'py-val' + (opts.id || ''), 'aria-label': 'Vel eit eksempelprogram' });
    Object.keys(PROGRAM).forEach((k) => velg.append(el('option', { value: k }, MT.t(k))));
    const kode = el('textarea', { class: 'kode mono', id: 'py-kode' + (opts.id || ''), spellcheck: 'false', autocapitalize: 'off', 'aria-label': 'Python-kode' });
    const linjenr = el('div', { class: 'linjenr mono', 'aria-hidden': 'true' });
    const inndata = el('textarea', { class: 'inndata mono', id: 'py-inn' + (opts.id || ''), rows: 2, placeholder: 'Inndata, éin verdi per linje (til input())', 'aria-label': 'Inndata' });
    const ut = el('pre', { class: 'utdata mono', 'aria-live': 'polite' });
    const vars = el('div', { class: 'variablar' });
    const kjorBtn = el('button', { class: 'knapp' }, '▶ Køyr');
    const sett = (k) => { kode.value = MT.t(PROGRAM[k]); inndata.value = k.includes('input') ? '120\n2.5' : ''; tal(); kjor(); };
    const tal = () => { linjenr.textContent = kode.value.split('\n').map((_, i) => i + 1).join('\n'); };
    function kjor() {
      const r = MiniPython.kjor(kode.value, { inndata: inndata.value.split('\n').filter((x) => x.trim() !== '') });
      ut.textContent = r.utskrift || (r.ok ? '(programmet skreiv ikkje ut noko)' : '');
      if (!r.ok) { const f = el('span', { class: 'py-feil' }, '\n⚠ ' + r.feil); ut.append(f); }
      ut.classList.toggle('har-feil', !r.ok);
      vars.innerHTML = '';
      const v = Object.entries(r.variablar).filter(([, x]) => typeof x !== 'function');
      if (v.length) { const t = el('table', { class: 'tabell liten' }); t.innerHTML = '<thead><tr><th>Variabel</th><th>Verdi til slutt</th></tr></thead><tbody>' + v.map(([k, x]) => `<tr><td class="mono">${k}</td><td class="mono">${MiniPython.vis(x).replace(/</g, '&lt;')}</td></tr>`).join('') + '</tbody>'; vars.append(t); }
    }
    kode.addEventListener('input', tal);
    kode.addEventListener('scroll', () => { linjenr.scrollTop = kode.scrollTop; });
    kode.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') { e.preventDefault(); const s = kode.selectionStart; kode.setRangeText('    ', s, kode.selectionEnd, 'end'); tal(); }
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) { e.preventDefault(); kjor(); return; }
      if (e.key === 'Enter' && !e.shiftKey) { // auto-innrykk
        const s = kode.selectionStart, linje = kode.value.slice(0, s).split('\n').pop(); let inn = linje.match(/^ */)[0]; if (/:\s*$/.test(linje)) inn += '    ';
        e.preventDefault(); kode.setRangeText('\n' + inn, s, kode.selectionEnd, 'end'); tal();
      }
    });
    velg.addEventListener('change', () => sett(velg.value));
    kjorBtn.onclick = kjor;
    vert.append(el('div', { class: 'py' },
      el('div', { class: 'py-topp' }, velg, kjorBtn, el('span', { class: 'svak liten' }, 'Ctrl + Enter køyrer')),
      el('div', { class: 'py-redigering' }, linjenr, kode),
      inndata,
      el('div', { class: 'py-ut' }, el('div', { class: 'merkelapp' }, 'Utskrift'), ut),
      vars));
    sett(opts.start || Object.keys(PROGRAM)[0]);
  }
  MT.verktoy.pythonLab = lab;

  /* --- Algoritme-flytskjema: «tenk som ei datamaskin» --- */
  function flyt(vert) {
    const kode = ['bestand = 400', 'aar = 0', 'while bestand < 600:', '    bestand = bestand * 1.1', '    aar = aar + 1', 'print(aar)'];
    let pc = 0, mem = {}, utskrift = [], ferdig = false;
    const vis = el('div', { class: 'flyt' });
    const kodeEl = el('ol', { class: 'flyt-kode mono' });
    const minne = el('div', { class: 'flyt-minne' });
    const utEl = el('div', { class: 'flyt-ut mono' });
    kode.forEach((l) => kodeEl.append(el('li', {}, l.replace(/ /g, ' '))));
    const steg = () => {
      if (ferdig) { pc = 0; mem = {}; utskrift = []; ferdig = false; tegn(); return; }
      const l = kode[pc].trim();
      if (pc === 0) { mem.bestand = 400; pc = 1; }
      else if (pc === 1) { mem.aar = 0; pc = 2; }
      else if (pc === 2) { pc = mem.bestand < 600 ? 3 : 5; mem['bestand < 600'] = mem.bestand < 600 ? 'True' : 'False'; }
      else if (pc === 3) { mem.bestand = +(mem.bestand * 1.1).toFixed(6); pc = 4; }
      else if (pc === 4) { mem.aar += 1; pc = 2; }
      else if (pc === 5) { utskrift.push(mem.aar); ferdig = true; }
      void l; tegn();
    };
    const knapp = el('button', { class: 'knapp' }, 'Neste steg');
    knapp.onclick = steg;
    function tegn() {
      MT.$$('li', kodeEl).forEach((li, i) => li.classList.toggle('pa', i === pc && !ferdig));
      minne.innerHTML = '<div class="merkelapp">Minnet</div>' + (Object.keys(mem).length ? Object.entries(mem).map(([k, v]) => `<div class="minne-celle"><span class="mono">${k}</span><b class="mono">${typeof v === 'number' ? MiniPython.vis(+v.toFixed(4)) : v}</b></div>`).join('') : '<p class="svak liten">Tomt</p>');
      utEl.textContent = utskrift.length ? '> ' + utskrift.join('\n> ') : '';
      knapp.textContent = ferdig ? 'Start på nytt' : pc === 0 && !Object.keys(mem).length ? 'Start' : 'Neste steg';
    }
    vis.append(kodeEl, el('div', {}, minne, el('div', { class: 'merkelapp' }, 'Utskrift'), utEl));
    vert.append(vis, el('div', { class: 'rad' }, knapp));
    tegn();
  }

  const G = [
    () => { const a = tilf(1, 10), d = tilf(2, 9), k = tilf(3, 6); const p = `x = ${a}\nfor i in range(${k}):\n    x = x + ${d}\nprint(x)`; return { tekst: `Kva skriv programmet ut?<pre class="kode-vis mono">${p}</pre>`, svar: a + d * k, tol: 0, tips: `Løkka går ${k} gonger, og kvar gong blir x ${d} større.`, losning: `<p>x startar på ${a} og aukar med ${d} i ${k} runder: ${a} + ${k} · ${d} = <b>${a + d * k}</b>.</p>` }; },
    () => { const a = tilf(2, 5), k = 2, g = vel([50, 100, 200]); const p = `x = ${a}\nn = 0\nwhile x < ${g}:\n    x = x * ${k}\n    n = n + 1\nprint(n)`; const r = MiniPython.kjor(p); return { tekst: `Kva skriv programmet ut?<pre class="kode-vis mono">${p}</pre>`, svar: +r.utskrift.trim(), tol: 0, tips: 'Skriv opp verdien av x og n etter kvar runde i løkka, til x ikkje lenger er mindre enn grensa.', losning: `<p>Køyring: ${(() => { let x = a, nn = 0, s = `x = ${a}`; while (x < g) { x *= k; nn++; s += ` → ${x}`; } return s; })()}. Løkka går <b>${r.utskrift.trim()}</b> gonger.</p>` }; },
    () => { const v = tilf(-5, 15), g = tilf(0, 8); const p = `temp = ${v}\nif temp < ${g}:\n    print("Dekk til plantene")\nelse:\n    print("Alt i orden")`; return { tekst: `Kva skriv programmet ut?<pre class="kode-vis mono">${p}</pre>`, val: ['Dekk til plantene', 'Alt i orden', 'Ingenting'], svar: v < g ? 0 : 1, losning: `<p>${v} er ${v < g ? 'mindre' : 'ikkje mindre'} enn ${g}, så programmet skriv «${v < g ? 'Dekk til plantene' : 'Alt i orden'}».</p>` }; },
    () => { const l = [tilf(2, 9), tilf(2, 9), tilf(2, 9), tilf(2, 9)]; const p = `tal = [${l.join(', ')}]\ns = 0\nfor t in tal:\n    s = s + t\nprint(s / len(tal))`; return { tekst: `Kva skriv programmet ut?<pre class="kode-vis mono">${p}</pre>`, svar: l.reduce((a, b) => a + b, 0) / 4, tips: 'Programmet reknar ut gjennomsnittet av tala i lista.', losning: `<p>Summen er ${l.reduce((a, b) => a + b, 0)}, og det er 4 tal: <b>${n(l.reduce((a, b) => a + b, 0) / 4, 2)}</b>.</p>` }; },
    () => { const a = tilf(10, 50) * 10, p_ = vel([5, 10, 20]), k = tilf(2, 4); const p = `pris = ${a}\nfor aar in range(${k}):\n    pris = pris * ${n(1 + p_ / 100, 2).replace(',', '.')}\nprint(round(pris))`; return { tekst: `Kva skriv programmet ut?<pre class="kode-vis mono">${p}</pre>`, svar: Math.round(a * Math.pow(1 + p_ / 100, k)), tol: 0, tips: `Prisen blir gonga med ${n(1 + p_ / 100, 2)} ${k} gonger.`, losning: MT.mat(R`$$${a} * ${n(1 + p_ / 100, 2)}^{${k}} \approx ${n(a * Math.pow(1 + p_ / 100, k), 2)}$$ <code>round</code> rundar av til heiltal.`) }; },
  ];

  MT.nyttKapittel({
    id: 'programmering', nr: 10, tittel: 'Algoritmar og programmering', kort: 'Variablar, løkker, vilkår og Python som reknehjelp.',
    glyf: '<path d="M11 9l-7 7 7 7M21 9l7 7-7 7M18 6l-4 20"/>',
    maal: ['Forklare kva ein algoritme er', 'Bruke variablar, løkker og vilkår i Python', 'Lage program som løyser praktiske problem, til dømes vekst og budsjett', 'Lese eit program og seie kva det gjer'],
    formlar: [['Løkke med teljing', R`<span class="mono">for i in range(1, 11):</span>`], ['Løkke med vilkår', R`<span class="mono">while x &lt; 1000:</span>`], ['Vilkår', R`<span class="mono">if x &gt; 0: … else: …</span>`], ['Utskrift med to desimalar', R`<span class="mono">print(f"{x:.2f}")</span>`]],
    seksjonar: [
      { id: 'algoritme', tittel: 'Kva er ein algoritme?', blokker: [
        { type: 'teori', html: R`<p>Ein <b>algoritme</b> er ei nøyaktig oppskrift som løyser eit problem steg for steg. Ein fôrplan, ei bruksrettleiing for ei melkemaskin og framgangsmåten for å gonge to tal er alle algoritmar.</p>
<p>Ei datamaskin følgjer algoritmen heilt bokstavleg. Derfor må vi vere presise. Dei tre viktigaste byggjeklossane er:</p>
<ul><li><b>Variablar</b> – namngitte boksar som lagrar verdiar: <span class="mono">bestand = 400</span></li><li><b>Løkker</b> – gjentek noko: <span class="mono">for</span> eit fast tal gonger, <span class="mono">while</span> så lenge noko er sant</li><li><b>Vilkår</b> – vel ulike vegar: <span class="mono">if</span> / <span class="mono">elif</span> / <span class="mono">else</span></li></ul>` },
        { type: 'utforsk', tittel: 'Tenk som ei datamaskin', intro: 'Gå gjennom programmet linje for linje. Sjå kva som skjer i minnet og når løkka stoppar.', lag: flyt },
      ] },
      { id: 'python', tittel: 'Python-laben', blokker: [
        { type: 'teori', html: R`<p>Under er ein Python-editor som køyrer rett i nettlesaren. Vel eit eksempel, endre tala og køyr. Prøv å gjere programma til dine eigne: Kva skjer med rentesrenta om renta er 6 %? Kor lang tid tek det for bestanden å nå 2000?</p>
<p class="merk">Innrykk (mellomrom framfor linja) betyr noko i Python. Linjene inni ei løkke eller eit vilkår skal ha fire mellomrom framfor seg.</p>` },
        { type: 'utforsk', tittel: 'Python i nettlesaren', intro: 'Eit avgrensa Python som støttar variablar, if/elif/else, for/while, def, lister, print, input og f-strengar.', lag: (v) => lab(v) },
        { type: 'eksempel', nr: '10.1', tittel: 'Kor lenge til doblinga?', oppgave: 'Ein bonde set 50 000 kr i banken med 5 % rente. Lag ein algoritme som finn ut kor mange år det tek før pengane er dobla.', steg: [R`Variablar: <span class="mono">saldo = 50000</span> og <span class="mono">aar = 0</span>.`, R`Løkke: så lenge <span class="mono">saldo &lt; 100000</span>, gong saldoen med 1,05 og legg 1 til <span class="mono">aar</span>.`, R`Etter løkka: skriv ut <span class="mono">aar</span>. Programmet gir 15 år, fordi $1,05^{14} \approx 1,98$ og $1,05^{15} \approx 2,08$.`], svar: 'Det tek 15 år.' },
      ] },
      { id: 'oving', tittel: 'Øving', blokker: [{ type: 'oving', generatorar: G }] },
    ],
  });
})();

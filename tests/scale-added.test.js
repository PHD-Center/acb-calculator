// Drugs added in 2026-11 from the scales' own published lists (ACB 2012 update; GABS,
// Kiesel 2018 Table 4). Checks spot values against the source and that every entry's
// recorded source agrees with its numbers. Run: node tests/scale-added.test.js
const { load } = require('./harness');
const app = load({ expose: ['SCALE_ADDED', 'ALL_DRUGS', 'XDRUGS', '_matchTranscripts'] });
let n = 0, fail = 0;
const ok = (c, m) => { n++; if (!c) { fail++; console.log('FAIL ' + m); } else console.log('ok   ' + m); };
const A = Object.fromEntries(app.SCALE_ADDED.map(d => [d.name, d]));
// spot values read from the sources
const spot = { Amitriptyline: [3, 3], Chlorphenamine: [3, 3], Promethazine: [3, 1], Trospium: [3, 3], Loxapine: [2, 2], Pimozide: [2, 2],
  Cimetidine: [1, 2], Cetirizine: [1, 1], Methocarbamol: [3, 1], Hyoscyamine: [3, 0], Citalopram: [0, 1], Metformin: [0, 1] };
for (const [nm, [acb, gabs]] of Object.entries(spot)) ok(A[nm] && A[nm].ACB === acb && A[nm].GABS === gabs, `${nm}: ACB ${acb}, GABS ${gabs}`);
ok(app.SCALE_ADDED.every(d => d.src.includes(`ACB ${d.ACB}`) && d.src.includes(`GABS ${d.GABS}`)), 'every added entry records the source of its ACB and GABS value');
ok(app.SCALE_ADDED.every(d => ['ADS', 'mACB', 'KABS', 'ARS'].every(s => d[s] === 0 && d.na.includes(s))), 'ADS, m-ACB, KABS, ARS marked unchecked (not filled) on every added entry');
const keys = app.ALL_DRUGS.map(d => d.atc + '|' + d.name);
ok(new Set(keys).size === keys.length && !app.ALL_DRUGS.some(d => d.ext && app.SCALE_ADDED.some(a => a.atc === d.atc)), 'no added drug also appears in the unscored list');
// Ciclosporin (L04AD01, labelled Voclosporin before 2026-11) and other US/INN spellings
const cic = app.DRUGS.find(d => d.atc === 'L04AD01');
ok(cic.name === 'Ciclosporin' && cic.ACB === 0 && cic.GABS === 1, 'L04AD01 is Ciclosporin; ACB 0 (ACB 2012: not listed), GABS 1 (Kiesel 2018 Table 4)');
for (const [q, atc] of [['cyclosporine', 'L04AD01'], ['cyclosporin', 'L04AD01'], ['acetaminophen', 'N02BE01'], ['chlorpheniramine', 'R06AB04'], ['pethidine', 'N02AB02'], ['frusemide', 'C03CA01']]) {
  const typed = app.search(q)[0], heard = app._matchTranscripts([q]).filter(r => r.checked).map(r => r.drug.atc);
  ok(typed && typed.atc === atc && heard.includes(atc), `"${q}" finds ${atc} when typed and when heard`);
}
console.log(`\nadded scale drugs: ${app.SCALE_ADDED.length} entries; tests ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);

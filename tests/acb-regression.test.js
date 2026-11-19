// Existing anticholinergic scores must not change. The golden file was produced
// from the app as it was before the 2026-11 additions (commit e06afdb) by running
// `node tests/acb-regression.test.js --write <old index.html>`.
const fs = require('fs'), path = require('path');
const { load } = require('./harness');
const LISTS = [
  ['Quetiapine', 'Lorazepam'],
  ['Oxybutynin', 'Solifenacin', 'Furosemide', 'Hydroxyzine'],
  ['Amantadine', 'Trihexyphenidyl', 'Biperiden', 'Clozapine', 'Olanzapine'],
  ['Paroxetine', 'Imipramine', 'Doxepin', 'Diphenhydramine', 'Meclizine', 'Cough Mixture'],
  ['Warfarin', 'Digoxin', 'Metoprolol', 'Furosemide', 'Captopril', 'Nifedipine', 'Isosorbide Mononitrate'],
  ['Tizanidine', 'Glycopyrrolate', 'Otilonium', 'Pipoxolan'],
  ['Famotidine'],
  ['Quetiapine', 'Quetiapine'],
  ['Chlorpromazine', 'Trifluoperazine', 'Haloperidol', 'Cyproheptadine', 'Carbamazepine', 'Meperidine', 'Codeine', 'Theophylline'],
];
function scores(app) {
  return LISTS.map(names => {
    app.selected.length = 0;
    for (const n of names) { const d = app.DRUGS.find(x => x.name === n); if (!d) throw new Error('missing ' + n); app.selected.push(d); }
    const t = app.totals();
    return { names, totals: t };
  });
}
const golden = path.join(__dirname, 'acb-golden.json');
if (process.argv[2] === '--write') {
  const app = load({ file: process.argv[3] });
  const out = { drugs: app.DRUGS.map(d => [d.name, d.atc, d.ACB, d.ADS, d.GABS, d.mACB, d.KABS, d.ARS]), lists: scores(app) };
  fs.writeFileSync(golden, JSON.stringify(out, null, 1));
  console.log('wrote golden from', process.argv[3]);
} else {
  const want = JSON.parse(fs.readFileSync(golden, 'utf8'));
  const app = load();
  let fail = 0;
  // Documented corrections since the golden file: names only, scores must stay identical.
  // L04AD01 is ciclosporin in the WHO ATC index; the PHDc entry was labelled Voclosporin (2026-11).
  const RENAMED = { 'L04AD01|Voclosporin': 'Ciclosporin' };
  const expected = want.drugs.map(r => RENAMED[r[1] + '|' + r[0]] ? [RENAMED[r[1] + '|' + r[0]]].concat(r.slice(1)) : r);
  const now = app.DRUGS.map(d => [d.name, d.atc, d.ACB, d.ADS, d.GABS, d.mACB, d.KABS, d.ARS]);
  if (JSON.stringify(now) !== JSON.stringify(expected)) { console.log('FAIL: the 122-drug scale table changed'); fail++; }
  const got = scores(app);
  got.forEach((g, i) => {
    const ok = JSON.stringify(g.totals) === JSON.stringify(want.lists[i].totals);
    if (!ok) fail++;
    console.log((ok ? 'same ' : 'DIFF ') + g.names.join(' + ') + ' -> ' + JSON.stringify(g.totals));
  });
  console.log(fail ? `ACB regression: ${fail} failure(s)` : `ACB regression: all ${got.length} lists identical to before, drug table unchanged apart from the documented rename`);
  process.exit(fail ? 1 : 0);
}

// Transcript-to-drug matching on simulated recogniser output (no audio involved).
// Run: node tests/voice-match.test.js [file.json] [-v]
// A drug counts as found when it is pre-ticked in the confirmation list; "offered"
// means it is in the list but not ticked. No-drug utterances must tick nothing.
const fs = require('fs'), path = require('path');
const { load } = require('./harness');
const file = process.argv.find(a => a.endsWith('.json')) || path.join(__dirname, 'voice-transcripts.json');
const verbose = process.argv.includes('-v');
const app = load({ expose: ['_matchTranscripts', 'ALL_DRUGS'] });
const cases = JSON.parse(fs.readFileSync(file, 'utf8')).cases;
const inDb = n => app.ALL_DRUGS.some(d => d.name.toLowerCase() === n.toLowerCase());
const t0 = Date.now();
const s = { said: 0, ticked: 0, offered: 0, fp: 0, utt: 0, uttAll: 0, neg: 0, negClean: 0, kinds: {} };
for (const c of cases) {
  const res = app._matchTranscripts(c.alts);
  const ticked = res.filter(r => r.checked).map(r => r.drug.name.toLowerCase());
  const all = res.map(r => r.drug.name.toLowerCase());
  const exp = c.expect.map(e => e.toLowerCase());
  const missingDb = exp.filter(e => !inDb(e));
  if (missingDb.length) console.log('NOTE not in drug list: ' + missingDb.join(', '));
  const k = s.kinds[c.kind] = s.kinds[c.kind] || { said: 0, ticked: 0, fp: 0 };
  if (!exp.length) {
    s.neg++; if (!ticked.length) s.negClean++; else s.fp += ticked.length;
    if (verbose || ticked.length) console.log(`${ticked.length ? 'FP  ' : 'ok  '} ${c.id} [${c.alts[0]}] -> ${ticked.join(', ') || '(nothing ticked)'}`);
    continue;
  }
  s.utt++;
  const hit = exp.filter(e => ticked.includes(e)), off = exp.filter(e => !ticked.includes(e) && all.includes(e));
  const fp = ticked.filter(x => !exp.includes(x));
  s.said += exp.length; s.ticked += hit.length; s.offered += off.length; s.fp += fp.length; if (hit.length === exp.length && !fp.length) s.uttAll++;
  k.said += exp.length; k.ticked += hit.length; k.fp += fp.length;
  const tag = hit.length === exp.length && !fp.length ? 'ok  ' : 'MISS';
  if (verbose || tag !== 'ok  ') console.log(`${tag} ${c.id} [${c.alts[0]}] -> ticked: ${ticked.join(', ') || '-'}${off.length ? ' | offered: ' + off.join(', ') : ''}${fp.length ? ' | wrong: ' + fp.join(', ') : ''}`);
}
const pct = (a, b) => (100 * a / b).toFixed(0) + '%';
console.log(`\n${cases.length} simulated utterances, ${((Date.now() - t0) / cases.length).toFixed(0)} ms each`);
console.log(`drugs said: ${s.said}; pre-ticked: ${s.ticked} (${pct(s.ticked, s.said)}); offered unticked: ${s.offered}; missed: ${s.said - s.ticked - s.offered}`);
console.log(`utterances fully right (all drugs ticked, nothing wrong ticked): ${s.uttAll}/${s.utt} (${pct(s.uttAll, s.utt)})`);
console.log(`wrong drugs pre-ticked: ${s.fp}; no-drug utterances with nothing ticked: ${s.negClean}/${s.neg}`);
for (const [k, v] of Object.entries(s.kinds)) if (v.said) console.log(`  ${k.padEnd(11)} ${v.ticked}/${v.said} ticked, ${v.fp} wrong`);

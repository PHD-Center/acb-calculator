// Worked examples for the whole-list medication review. Run: node tests/medreview.test.js
const { load } = require('./harness');
const app = load({ expose: ['ALL_DRUGS', 'XDRUGS', 'MR_DOSES', 'calcDBI', 'dbiTerm', 'calcSedLoad', 'sedRating', 'calcFRID', 'calcPoly', 'calcDuplicates', 'dbiEntryFor'] });
let fail = 0, n = 0;
const ok = (cond, msg) => { n++; if (!cond) { fail++; console.log('FAIL ' + msg); } else console.log('ok   ' + msg); };
const near = (a, b, tol) => Math.abs(a - b) <= (tol || 0.005);
const byAtc = atc => app.ALL_DRUGS.find(d => d.atc === atc) || { name: atc, atc, ACB: 0, ADS: 0, GABS: 0, mACB: 0, KABS: 0, ARS: 0 };
const key = d => d.atc + '|' + d.name;

// ---------- 1. DBI ----------
// (a) Formula against the published worked example: Kouladjian L et al. Clin Interv Aging
// 2014;9:1503-15, Table 1 (US product-information delta): darifenacin 15 mg (delta 7.5) 0.67,
// temazepam 7.5 mg (delta 7.5) 0.50, codeine 90 mg (delta 120) 0.43, irbesartan and
// paracetamol 0; total 1.60.
const t1 = app.dbiTerm(15, 7.5), t2 = app.dbiTerm(7.5, 7.5), t3 = app.dbiTerm(90, 120);
ok(near(t1, 0.67) && near(t2, 0.50) && near(t3, 0.43), `DBI terms ${t1.toFixed(2)} ${t2.toFixed(2)} ${t3.toFixed(2)} = paper 0.67 0.50 0.43`);
ok(near(t1 + t2 + t3, 1.60), `DBI total ${(t1 + t2 + t3).toFixed(2)} = paper 1.60`);
// (b) Same regimen through the app with the implemented variant (Byrne 2018 deltas):
// darifenacin delta 7.5 -> 15/22.5 = 0.667; temazepam delta 5 -> 7.5/12.5 = 0.600;
// codeine delta 120 -> 90/210 = 0.429; irbesartan, paracetamol not on the list -> 0. Sum 1.695.
const reg = [byAtc('G04BD10'), byAtc('N05CD07'), byAtc('R05DA04'), byAtc('C09CA04'), byAtc('N02BE01')];
const doses = {}; [[0, 15], [1, 7.5], [2, 90], [3, 300], [4, 1800]].forEach(([i, mg]) => doses[key(reg[i])] = { mg });
const r = app.calcDBI(reg, doses);
ok(r.items.length === 3 && r.complete, `DBI counts 3 drugs (darifenacin, temazepam, codeine), complete=${r.complete}`);
ok(near(r.total, 1.695, 0.001), `DBI (Byrne deltas) ${r.total.toFixed(3)} = hand calculation 1.695`);
// (c) Missing dose -> not complete; enzyme inducer footnote; route choice
const r2 = app.calcDBI([byAtc('N05AH04'), byAtc('N05BA06')], { [key(byAtc('N05AH04'))]: { mg: 25 } });
ok(!r2.complete && r2.missing.length === 1 && r2.missing[0].drug.atc === 'N05BA06', 'DBI reports the drug whose dose is missing');
ok(near(r2.items[0].value, 25 / 75), 'quetiapine 25 mg/day, delta 50 -> 0.333');
const lam = byAtc('N03AX09'), cbz = byAtc('N03AF01');
const r3 = app.calcDBI([lam, cbz], { [key(lam)]: { mg: 200 }, [key(cbz)]: { mg: 400 } });
ok(r3.items.find(i => i.drug.atc === 'N03AX09').delta === 200, 'lamotrigine delta 200 when an enzyme inducer (carbamazepine) is on the list (Table S1 footnote)');
ok(near(r3.total, 200 / 400 + 400 / 800), `lamotrigine 200 + carbamazepine 400 -> ${r3.total.toFixed(3)} = 1.000`);
const fen = byAtc('N02AB03');
const r4 = app.calcDBI([fen], { [key(fen)]: { mg: 0.6, route: 't' } });
ok(r4.items[0].route === 't' && near(r4.items[0].value, 0.6 / 0.9), 'fentanyl transdermal 0.6 mg/day, delta 0.3 -> 0.667');
const gaba = byAtc('N02BF01');
ok(!!app.dbiEntryFor(gaba) && app.dbiEntryFor(gaba).d.o === 900, 'gabapentin under its current ATC code N02BF01 finds Byrne delta 900 mg');
const cm = app.ALL_DRUGS.find(d => d.name === 'Cough Mixture');
ok(app.calcDBI([cm], {}).notListed.length === 1, 'Cough Mixture (on ACB scale, not on DBI list) is reported as not counted');

// ---------- 2. Sedative load ----------
// Every example drug named in Taipale 2012 Table 8 must get the published rating.
const G1 = { N05AA01: 'chlorpromazine', N05AD01: 'haloperidol', N05AF01: 'flupentixol', N05AL01: 'sulpiride', N05AN01: 'lithium',
  N05BA06: 'lorazepam', N05BB01: 'hydroxyzine', N05CF01: 'zopiclone', N05CF02: 'zolpidem', N05CD07: 'temazepam', N06AA04: 'clomipramine',
  N06AA06: 'trimipramine', N06AA10: 'nortriptyline', N06AA12: 'doxepin', N06AA09: 'amitriptyline', N06AX03: 'mianserin' };
const G2 = { N02AA01: 'morphine', N02AA05: 'oxycodone', N02AE01: 'buprenorphine', N02AX02: 'tramadol', N02AB03: 'fentanyl',
  N03AB02: 'phenytoin', N03AF01: 'carbamazepine', N03AG01: 'valproic acid', N02BF01: 'gabapentin', N03AE01: 'clonazepam', N03AX09: 'lamotrigine',
  N03AX14: 'levetiracetam', N02BF02: 'pregabalin', N03AX11: 'topiramate', N04AA02: 'biperiden', N05AH02: 'clozapine', N05AH03: 'olanzapine',
  N05AH04: 'quetiapine', N05AX08: 'risperidone', N05AX12: 'aripiprazole', N05AE04: 'ziprasidone', N06AB03: 'fluoxetine', N06AB05: 'paroxetine',
  N06AB06: 'sertraline', N06AB10: 'escitalopram', N06AX05: 'trazodone', N06AX11: 'mirtazapine', N06AX16: 'venlafaxine', N06AX21: 'duloxetine',
  N04BC05: 'pramipexole', N04BC04: 'ropinirole', N04BC09: 'rotigotine', N02CC01: 'sumatriptan', A03FA01: 'metoclopramide', A04AD01: 'scopolamine',
  M03BX01: 'baclofen', M03BX02: 'tizanidine', R03DA04: 'theophylline', R05DA04: 'codeine', R06AE05: 'meclozine' };
const bad = [];
for (const [a, nm] of Object.entries(G1)) if (app.sedRating({ atc: a, name: nm }) !== 2) bad.push(nm + ' should be 2');
for (const [a, nm] of Object.entries(G2)) if (app.sedRating({ atc: a, name: nm }) !== 1) bad.push(nm + ' should be 1');
for (const [a, nm] of Object.entries({ C03CA01: 'furosemide', R06AX13: 'loratadine', N06DA02: 'donepezil', A10BA02: 'metformin' })) if (app.sedRating({ atc: a, name: nm }) !== 0) bad.push(nm + ' should be 0');
ok(!bad.length, `all ${Object.keys(G1).length + Object.keys(G2).length + 4} Table 8 example drugs rated as published` + (bad.length ? ': ' + bad.join(', ') : ''));
// Hand calculation: lorazepam 2 + quetiapine 1 + tramadol 1 + furosemide 0 = 4 (band >= 3)
const sl = app.calcSedLoad(['N05BA06', 'N05AH04', 'N02AX02', 'C03CA01'].map(byAtc));
ok(sl.total === 4 && sl.band === 2, `sedative load lorazepam+quetiapine+tramadol+furosemide = ${sl.total} (hand calculation 4, band >=3)`);
const sl2 = app.calcSedLoad(['N05AL05', 'N05AX13'].map(byAtc));
ok(sl2.total === 0 && sl2.unrated.length === 2, 'amisulpride and paliperidone are not in the published table: reported as unrated, not guessed');

// ---------- 3. STOPPFall ----------
const fr = app.calcFRID(['N05BA06', 'N05CF02', 'C03CA01', 'G04CA02', 'C02CA04', 'G04BD04', 'A03BB01', 'A10BA02', 'N03AE01', 'C09AA02'].map(byAtc));
const cls = Object.fromEntries(fr.items.map(i => [i.drug.atc, i.classes.join('+')]));
ok(fr.count === 8, `STOPPFall: 8 of 10 drugs flagged (got ${fr.count}: ${JSON.stringify(cls)})`);
ok(cls.N05BA06 === 'bzd' && cls.N05CF02 === 'zdrug' && cls.C03CA01 === 'diuretic' && cls.G04CA02 === 'abBph' && cls.C02CA04 === 'abHtn'
  && cls.G04BD04 === 'bladder' && cls.A03BB01 === 'anticholinergic' && cls.N03AE01 === 'bzd+antiepileptic' && !cls.A10BA02 && !cls.C09AA02,
  'STOPPFall classes match the Doyle 2025 ATC operationalisation; clonazepam counted once with both classes');

// ---------- 4. Polypharmacy and duplicates ----------
const five = ['N05AH04', 'N05BA06', 'C03CA01', 'A10BA02', 'C09AA02'].map(byAtc);
ok(app.calcPoly(five).n === 5 && app.calcPoly(five).band === 1, '5 distinct medicines -> polypharmacy (>=5)');
ok(app.calcPoly(five.concat([five[0]])).n === 5, 'the same medicine entered twice is counted once');
const ten = five.concat(['B01AC06', 'C10AA05', 'A02BC01', 'N02BE01', 'H03AA01'].map(byAtc));
ok(app.calcPoly(ten).band === 2, '10 distinct medicines -> excessive polypharmacy (>=10)');
const dup = app.calcDuplicates([byAtc('N05BA06'), byAtc('N05BA12'), byAtc('N05AH04'), byAtc('N05AH04'), byAtc('C03CA01')]);
ok(dup.length === 2 && dup.find(g => g.cls === 'N05BA' && !g.sameDrug) && dup.find(g => g.cls === 'N05AH' && g.sameDrug),
  'duplicates: lorazepam+alprazolam (same ATC level 4) and quetiapine entered twice');

console.log(`\nmedication review tests: ${n - fail}/${n} passed`);
process.exit(fail ? 1 : 0);

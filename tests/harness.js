// Loads index.html's main script into a Node vm with a stub DOM so the app's
// own functions (scoring, matching, the new medication modules) can be tested
// without a browser. Usage: const app = require('./harness').load();
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function fakeEl() {
  const store = {};
  const el = new Proxy(function () {}, {
    get(_, k) {
      if (k === 'classList') return { add() {}, remove() {}, toggle() {}, contains() { return true; } };
      if (k === 'style') return store.style || (store.style = {});
      if (k === 'dataset') return store.dataset || (store.dataset = {});
      if (k === 'querySelectorAll') return () => [];
      if (k === 'querySelector') return () => null;
      if (k === 'contains') return () => false;
      if (k === 'closest') return () => null;
      if (k === 'value' || k === 'innerHTML' || k === 'textContent' || k === 'className') return store[k] || '';
      if (k === Symbol.toPrimitive) return () => '';
      if (k in store) return store[k];
      return () => undefined;
    },
    set(_, k, v) { store[k] = v; return true; },
  });
  return el;
}

function load(opts) {
  opts = opts || {};
  const file = opts.file || path.join(__dirname, '..', 'index.html');
  const html = fs.readFileSync(file, 'utf8');
  const scripts = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  const main = scripts.sort((a, b) => b.length - a.length)[0];
  const els = {};
  const ls = Object.assign({}, opts.localStorage || {});
  const storage = {
    getItem: k => (k in ls ? ls[k] : null),
    setItem: (k, v) => { ls[k] = String(v); },
    removeItem: k => { delete ls[k]; },
  };
  const document = {
    getElementById: id => els[id] || (els[id] = fakeEl()),
    addEventListener() {}, createElement: () => fakeEl(),
    querySelectorAll: () => [], querySelector: () => null,
    body: fakeEl(), head: fakeEl(), referrer: '',
  };
  const win = {
    document, localStorage: storage, sessionStorage: storage,
    navigator: { userAgent: 'node', language: 'zh-TW' },
    addEventListener() {}, setInterval() { return 0; }, clearInterval() {},
    setTimeout() { return 0; }, clearTimeout() {},
    fetch: () => Promise.reject(new Error('no network in tests')),
    console: { log() {}, warn() {}, error() {} },
    alert() {}, confirm() { return false; }, print() {},
    scrollTo() {}, URL, Blob: function () {}, Date, Math, JSON, Promise, Map, Set,
  };
  win.window = win; win.globalThis = win; win.self = win;
  const ctx = vm.createContext(win);
  // top-level const/let/function declarations are not properties of the context
  // object, so append an exporter that hands the test what it asks for.
  const names = (opts.expose || []).concat([
    'DRUGS', 'BRANDS', 'SCALES', 'selected', 'totals', 'search', 'render', 'setLang',
    '_fuzzyMatchOCR', '_phoneticKey', '_lev',
  ]);
  const exporter = '\n;globalThis.__app = {' + [...new Set(names)].map(n =>
    `get ${JSON.stringify(n)}() { try { return ${n}; } catch (e) { return undefined; } }`).join(',') + '};';
  vm.runInContext(main + exporter, ctx, { filename: 'index.html<script>' });
  win.__app.__els = els; win.__app.__win = win;
  return win.__app;
}
module.exports = { load };

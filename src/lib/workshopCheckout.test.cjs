const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function loader() {
  const api = {};
  const scripts = [];
  const timers = new Map();
  const events = new Map();
  const diagnostics = [];
  let timerId = 0;
  const window = { setTimeout(callback, timeout) { timers.set(++timerId, { callback, timeout }); return timerId; }, clearTimeout: id => timers.delete(id) };
  const document = {
    createElement: () => ({ remove() { this.removed = true; } }),
    head: { appendChild: script => scripts.push(script) },
    addEventListener: (event, callback) => events.set(event, callback),
    removeEventListener: (event, callback) => { if (events.get(event) === callback) events.delete(event); },
  };
  const navigator = { onLine: true };
  vm.runInNewContext(ts.transpileModule(readFileSync(`${__dirname}/workshopPayment.ts`, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, { exports: api, window, document, navigator, console: { info: (...args) => diagnostics.push(args) } });
  return { ...api, window, document, scripts, timers, events, navigator, diagnostics };
}

test('uses an already loaded Checkout without injecting another script', async () => {
  const api = loader(); api.window.Razorpay = function() {};
  await api.loadCheckout();
  assert.equal(api.scripts.length, 0);
});

test('concurrent callers share one load and success removes timers/listeners', async () => {
  const api = loader();
  const first = api.loadCheckout(); const second = api.loadCheckout();
  assert.equal(first, second);
  assert.equal(api.scripts.length, 1);
  assert.equal(api.scripts[0].src, 'https://checkout.razorpay.com/v1/checkout.js');
  api.window.Razorpay = function() {};
  api.scripts[0].onload();
  await first;
  assert.equal(api.timers.size, 0); assert.equal(api.events.size, 0);
});

test('network failure removes the failed script and allows a genuinely fresh retry', async () => {
  const api = loader(); const first = api.loadCheckout();
  api.scripts[0].onerror();
  await assert.rejects(first, error => error.name === 'CheckoutLoadError' && error.code === 'SDK_LOAD_FAILED' && !/extension/.test(error.message));
  assert.equal(api.diagnostics.at(-1)[1].code, 'SDK_LOAD_FAILED');
  assert.equal(api.scripts[0].removed, true);
  assert.equal(api.timers.size, 0); assert.equal(api.events.size, 0);
  const retry = api.loadCheckout();
  assert.equal(api.scripts.length, 2);
  api.window.Razorpay = function() {};
  api.scripts[1].onload(); await retry;
});

test('slow script timeout is distinct from a failed payment and can be retried', async () => {
  const api = loader(); const pending = api.loadCheckout();
  const timer = [...api.timers.values()][0];
  assert.equal(timer.timeout, 30000);
  timer.callback();
  await assert.rejects(pending, error => error.name === 'CheckoutLoadError' && error.code === 'SDK_TIMEOUT');
  assert.equal(api.scripts[0].removed, true);
  assert.equal(api.timers.size, 0); assert.equal(api.events.size, 0);
});

test('a CSP block reports the security policy and removes listeners', async () => {
  const api = loader(); const pending = api.loadCheckout();
  api.events.get('securitypolicyviolation')({ blockedURI: 'https://checkout.razorpay.com/v1/checkout.js' });
  await assert.rejects(pending, error => error.name === 'CheckoutLoadError' && /security policy/.test(error.message));
  assert.equal(api.events.size, 0);
});

test('loading a script without its Checkout constructor cannot count as success', async () => {
  const api = loader(); const pending = api.loadCheckout();
  api.scripts[0].onload();
  await assert.rejects(pending, error => error.name === 'CheckoutLoadError' && /did not initialize/.test(error.message));
  assert.equal(api.scripts[0].removed, true);
});

test('a browser refusing script insertion cleans up and allows retry', async () => {
  const api = loader();
  api.document.head.appendChild = () => { throw new TypeError('Script insertion blocked'); };
  await assert.rejects(api.loadCheckout(), error => error.name === 'CheckoutLoadError' && /browser blocked/.test(error.message));
  assert.equal(api.timers.size, 0); assert.equal(api.events.size, 0);
});

test('offline status is reported separately from an unknown script failure', async () => {
  const api = loader(); api.navigator.onLine = false;
  const pending = api.loadCheckout();
  api.scripts[0].onerror();
  await assert.rejects(pending, error => error.code === 'SDK_OFFLINE');
});

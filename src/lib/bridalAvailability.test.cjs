const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function client(response) {
  const calls = [];
  const endpoints = [];
  const exports = {};
  const source = readFileSync(__dirname + '/bridalAvailability.ts', 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(compiled, {
    exports,
    require: () => ({ postWorkshopAction: async (payload, endpoint) => { calls.push(payload); endpoints.push(endpoint); return typeof response === 'function' ? response(payload) : response; } }),
  });
  return { api: exports, calls, endpoints };
}

test('availability client sends the POST action to the studio booking deployment', async () => {
  const result = { ok: true, available: true, date: '2027-01-20', session: 'Morning', status: 'AVAILABLE' };
  const { api, calls, endpoints } = client(result);
  assert.equal(api.BRIDAL_AVAILABILITY_API_URL, 'https://script.google.com/macros/s/AKfycbzj1dDVfYQt-zOTTdkV8fTegusSdISJZHUr4RuzHPc5gwWnUCcE77NToadNgrWsNYgQlw/exec');
  assert.deepEqual(await api.checkBridalAvailability('2027-01-20', 'Muhurtham', 'Morning'), result);
  assert.deepEqual(endpoints, [api.BRIDAL_AVAILABILITY_API_URL]);
  assert.deepEqual(JSON.parse(JSON.stringify(calls)), [{ action: 'check_bridal_availability', date: '2027-01-20', occasion: 'Muhurtham', session: 'Morning' }]);
});

test('availability client accepts booked responses and rejects unconfirmed or mismatched responses', async () => {
  const booked = client({ ok: true, available: false, date: '2027-01-20', session: 'Evening', status: 'BOOKED' });
  assert.equal((await booked.api.checkBridalAvailability('2027-01-20', 'Reception', 'Evening')).status, 'BOOKED');
  for (const response of [
    { ok: false, available: false, date: '2027-01-20', session: 'Morning', status: 'ERROR' },
    { ok: true, available: true, date: '2027-01-21', session: 'Morning', status: 'AVAILABLE' },
    { ok: true, available: true, date: '2027-01-20', session: 'Morning', status: 'BOOKED' },
  ]) {
    const invalid = client(response);
    await assert.rejects(() => invalid.api.checkBridalAvailability('2027-01-20', 'Muhurtham', 'Morning'));
  }
});

test('Full Day checks both existing slots and requires both to be available', async () => {
  for (const blocked of [[], ['Morning'], ['Evening'], ['Morning', 'Evening']]) {
    const { api, calls, endpoints } = client(payload => ({ ok: true, available: !blocked.includes(payload.session), date: payload.date, session: payload.session, status: blocked.includes(payload.session) ? 'BOOKED' : 'AVAILABLE' }));
    const result = await api.checkBridalAvailability('2027-01-20', 'Muhurtham', 'Full Day');
    assert.equal(result.available, blocked.length === 0);
    assert.equal(result.session, 'Full Day');
    assert.equal(result.status, blocked.length ? 'BOOKED' : 'AVAILABLE');
    assert.deepEqual(calls.map(call => call.session).sort(), ['Evening', 'Morning']);
    assert.ok(endpoints.every(endpoint => endpoint === api.BRIDAL_AVAILABILITY_API_URL));
  }
});

test('Full Day cannot be confirmed when either slot check fails', async () => {
  const { api } = client(payload => ({ ok: payload.session === 'Morning', available: true, date: payload.date, session: payload.session, status: 'AVAILABLE' }));
  await assert.rejects(() => api.checkBridalAvailability('2027-01-20', 'Muhurtham', 'Full Day'));
});

test('Full Day overlaps either session while Morning and Evening remain independent', () => {
  const { api } = client({});
  assert.equal(api.bridalSessionsOverlap('Morning', 'Evening'), false);
  for (const session of ['Morning', 'Evening', 'Full Day']) {
    assert.equal(api.bridalSessionsOverlap('Full Day', session), true);
    assert.equal(api.bridalSessionsOverlap(session, 'Full Day'), true);
    assert.equal(api.bridalSessionsOverlap(session, session), true);
  }
});

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

function client(response) {
  const calls = [];
  const exports = {};
  const source = readFileSync(__dirname + '/bridalAvailability.ts', 'utf8');
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(compiled, {
    exports,
    require: () => ({ postWorkshopAction: async payload => { calls.push(payload); return response; } }),
  });
  return { api: exports, calls };
}

test('availability client calls the existing Apps Script POST action with date, occasion and session', async () => {
  const result = { ok: true, available: true, date: '2027-01-20', session: 'Morning', status: 'AVAILABLE' };
  const { api, calls } = client(result);
  assert.deepEqual(await api.checkBridalAvailability('2027-01-20', 'Muhurtham', 'Morning'), result);
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
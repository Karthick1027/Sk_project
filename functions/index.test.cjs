// Archived Firebase backend unit checks only. Active Apps Script tests live in google-apps-script/WorkshopRegistrations.test.cjs.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');

const registration = {
  name: 'Workshop Student', email: 'student@example.com', phone: '919876543210',
  course: 'Full 2-day masterclass', city: '', gender: 'Female',
  mainGoal: 'Learn bridal makeup', experience: 'Beginner', question: '',
};
const proof = {
  razorpay_order_id: 'order_test', razorpay_payment_id: 'pay_test',
  razorpay_signature: crypto.createHmac('sha256', 'test-secret').update('order_test|pay_test').digest('hex'),
};

function backend({ status = 'captured', sheetOk = true, mismatch = false, amount = 50000, paymentAmount = amount } = {}) {
  const events = [];
  const exports = {};
  class HttpsError extends Error { constructor(code, message, details) { super(message); this.code = code; this.details = details; } }
  vm.runInNewContext(readFileSync(join(__dirname, 'index.js'), 'utf8'), {
    exports, Buffer, console: { error() {} },
    require(name) {
      if (name === 'node:crypto') return crypto;
      if (name === 'firebase-functions/v2/https') return { onCall: (_options, handler) => handler, HttpsError };
      if (name === 'firebase-functions/params') return { defineSecret: (key) => ({ value: () => key === 'RAZORPAY_KEY_SECRET' ? 'test-secret' : 'test-key' }) };
      throw new Error(`Unexpected dependency: ${name}`);
    },
    async fetch(url, options = {}) {
      events.push({ url, options });
      let result;
      if (url.endsWith('/orders') && options.method === 'POST') {
        const payload = JSON.parse(options.body);
        result = { id: 'order_test', ...payload };
      } else if (url.endsWith('/orders/order_test')) {
        result = { amount, currency: 'INR', notes: {
          type: 'workshop_advance', course: registration.course,
          registration_hash: crypto.createHash('sha256').update(JSON.stringify({ ...registration, paymentScreenshot: '' })).digest('hex'),
        } };
      } else if (url.endsWith('/capture')) {
        result = { status: 'captured' };
      } else if (url.includes('/payments/')) {
        result = { order_id: mismatch ? 'order_other' : 'order_test', amount: paymentAmount, currency: 'INR', status };
      } else {
        result = { ok: sheetOk };
      }
      return { ok: true, json: async () => result };
    },
  });
  return { ...exports, events };
}

test('order validates the chosen amount and binds the registration hash', async () => {
  const api = backend();
  const order = await api.createWorkshopOrder({ data: { registration, amount: '750.25' } });
  assert.equal(order.amount, 75025);
  assert.equal(order.currency, 'INR');
  assert.equal(JSON.parse(api.events[0].options.body).notes.registration_hash.length, 64);
});

test('invalid required details cannot create an order', async () => {
  const api = backend();
  await assert.rejects(api.createWorkshopOrder({ data: { registration: { ...registration, name: ' ' } } }), { code: 'invalid-argument' });
  assert.equal(api.events.length, 0);
});

test('invalid chosen amounts are rejected before creating an order', async () => {
  const api = backend();
  for (const amount of ['', '0', '0.99', '-20', '1.001', 'NaN', 'Infinity', '90071992547410']) {
    await assert.rejects(api.createWorkshopOrder({ data: { registration, amount } }), { code: 'invalid-argument' });
  }
  assert.equal(api.events.length, 0);
});

test('variable amount is captured, saved and returned from the verified order', async () => {
  const api = backend({ status: 'authorized', amount: 75025 });
  const result = await api.verifyWorkshopPayment({ data: { ...proof, registration, amount: 1 } });
  assert.equal(result.amount, 75025);
  assert.equal(result.currency, 'INR');
  assert.equal(JSON.parse(api.events.find(event => event.url.endsWith('/capture')).options.body).amount, 75025);
  assert.equal(JSON.parse(api.events.at(-1).options.body).advance, 750.25);
});

test('a payment with a different amount from its order cannot reach Sheets', async () => {
  const api = backend({ amount: 75025, paymentAmount: 50000 });
  await assert.rejects(api.verifyWorkshopPayment({ data: { ...proof, registration } }), { code: 'failed-precondition' });
  assert.equal(api.events.some(event => event.url.includes('script.google.com')), false);
});

test('students can pay below the suggested INR 500 and save the actual verified amount', async () => {
  const api = backend({ amount: 25000 });
  const order = await api.createWorkshopOrder({ data: { registration, amount: '250' } });
  assert.equal(order.amount, 25000);
  const result = await api.verifyWorkshopPayment({ data: { ...proof, registration } });
  assert.equal(result.ok, true);
  assert.equal(result.amount, 25000);
  assert.equal(JSON.parse(api.events.at(-1).options.body).advance, 250);
});

test('invalid signature is rejected before any API or sheet requests', async () => {
  const api = backend();
  await assert.rejects(api.verifyWorkshopPayment({ data: { ...proof, razorpay_signature: '0'.repeat(64), registration } }), { code: 'permission-denied' });
  assert.equal(api.events.length, 0);
});

for (const scenario of [{ status: 'failed' }, { mismatch: true }]) {
  test(`unverified payment cannot reach Sheets: ${JSON.stringify(scenario)}`, async () => {
    const api = backend(scenario);
    await assert.rejects(api.verifyWorkshopPayment({ data: { ...proof, registration } }), { code: 'failed-precondition' });
    assert.equal(api.events.some((event) => event.url.includes('script.google.com')), false);
  });
}

test('changed registration details cannot reuse a valid payment', async () => {
  const api = backend();
  await assert.rejects(api.verifyWorkshopPayment({ data: { ...proof, registration: { ...registration, name: 'Someone else' } } }), { code: 'failed-precondition' });
  assert.equal(api.events.length, 2);
});

test('authorized payment is captured before saving; streaming reports the actual saving stage', async () => {
  const api = backend({ status: 'authorized' });
  const result = await api.verifyWorkshopPayment({ data: { ...proof, registration }, acceptsStreaming: true }, {
    sendChunk: async (chunk) => {
      assert.equal(chunk.stage, 'saving');
      assert.equal(api.events.at(-1).url.endsWith('/capture'), true);
    },
  });
  assert.equal(result.ok, true);
  const saved = JSON.parse(api.events.at(-1).options.body);
  assert.equal(saved.phone, '919876543210');
  assert.equal(saved.advance, 500);
  assert.equal(saved.paymentId, 'pay_test');
});

test('successful payment is not successful registration when Sheets fails', async () => {
  const api = backend({ sheetOk: false });
  await assert.rejects(api.verifyWorkshopPayment({ data: { ...proof, registration } }), (error) => error.code === 'internal' && error.details.code === 'REGISTRATION_SAVE_FAILED');
});

test('non-streaming clients preserve the existing callable contract', async () => {
  const api = backend();
  const result = await api.verifyWorkshopPayment({ data: { ...proof, registration } });
  assert.equal(result.ok, true);
});


const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const crypto = require('node:crypto');

const registration = {
  name: 'Student', phone: '919876543210', email: 'student@example.com', gender: 'Female',
  goal: 'Learn bridal makeup', question: 'Please keep existing responses', experience: 'Beginner',
  city: 'Chennai', course: 'Full 2-day masterclass',
};
const signature = crypto.createHmac('sha256', 'test-secret').update('order_test|pay_test').digest('hex');
const proof = { action: 'verify_payment', orderId: 'order_test', paymentId: 'pay_test', signature };

function backend(options = {}) {
  const originalHeaders = Array.from({ length: 11 }, (_, i) => `Original Google Form header ${i + 1}`);
  const rows = [originalHeaders.slice(), ['existing timestamp', 'Existing Form Student', '919999999999', 'Female', 'Original goal', '', 'Pro', 'original@example.com', 'City', 9, 'existing-screenshot']];
  const original = JSON.stringify(rows);
  const properties = new Map(options.noCredentials ? [] : [['RAZORPAY_KEY_ID', 'rzp_test_123'], ['RAZORPAY_KEY_SECRET', 'test-secret']]);
  const calls = [];
  const writes = [];
  let columns = 11;
  let locked = false;
  let status = options.status || 'captured';
  let failAppend = Boolean(options.failAppend);
  let flushFailures = options.flushFailures || 0;
  let order;
  const sheet = {
    getMaxColumns: () => columns,
    insertColumnsAfter(after, count) { assert.equal(after, columns); columns += count; },
    getLastRow: () => rows.length,
    appendRow(values) {
      assert.equal(locked, true);
      if (failAppend) throw new Error('Sheet access denied');
      rows.push(Array.from(values));
      if (options.concurrentForm) rows.push(['later Google Form timestamp', 'Concurrent Form Student', '918888888888']);
    },
    getRange(row, column, count = 1, width = 1) {
      assert.ok(column + width - 1 <= columns, 'missing L-R columns must be added before reading them');
      const values = () => Array.from({ length: count }, (_, r) => Array.from({ length: width }, (_, c) => rows[row - 1 + r]?.[column - 1 + c] ?? ''));
      const write = value => {
        assert.ok(row !== 1 || column > 11, 'Google Form headers A-K must never be written');
        writes.push({ row, column, value });
        rows[row - 1][column - 1] = value;
      };
      return {
        getValues: values, getDisplayValues: () => values().map(row => row.map(String)),
        getValue: () => values()[0][0], getDisplayValue: () => String(values()[0][0]),
        setValue: write, setRichTextValue: value => write(value.url), clearContent: () => write(''),
      };
    },
  };
  const context = {
    console: { error() {}, warn() {}, log() {} },
    LockService: { getScriptLock: () => ({ waitLock() { assert.equal(locked, false); locked = true; }, releaseLock() { locked = false; } }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: key => properties.get(key), setProperty: (key, value) => properties.set(key, value), deleteProperty: key => properties.delete(key) }) },
    SpreadsheetApp: {
      openById(id) {
        assert.equal(id, '1TdrQD7sq_uRgLkPoKwubH23QJY-reCejaNTVgvr3ows');
        if (options.noSheetAccess) throw new Error('Permission denied');
        return { getSheetByName(name) { assert.equal(name, 'Form Responses 1'); return options.noTab ? null : sheet; } };
      },
      flush() { if (flushFailures > 0) { flushFailures--; throw new Error('Temporary sheet flush failure'); } },
      newRichTextValue() { const rich = { setText() { return rich; }, setLinkUrl(url) { rich.url = url; return rich; }, build() { return rich; } }; return rich; },
    },
    ContentService: { MimeType: { JSON: 'application/json' }, createTextOutput: text => ({ setMimeType: () => ({ ...JSON.parse(text), getContent: () => text }) }) },
    Utilities: {
      Charset: { UTF_8: 'UTF-8' }, DigestAlgorithm: { SHA_256: 'SHA-256' },
      computeDigest: (_algorithm, text) => Array.from(crypto.createHash('sha256').update(text).digest(), n => n > 127 ? n - 256 : n),
      computeHmacSha256Signature: (text, key) => Array.from(crypto.createHmac('sha256', key).update(text).digest(), n => n > 127 ? n - 256 : n),
      base64Encode: text => Buffer.from(text).toString('base64'),
      newBlob: text => ({ getBytes: () => Buffer.from(text) }),
      getUuid: () => '12345678-1234-1234-1234-123456789012',
    },
    UrlFetchApp: { fetch(url, request) {
      assert.ok(url.startsWith('https://api.razorpay.com/v1/'), 'Apps Script must never call Firebase Functions');
      assert.equal(request.headers.Authorization, `Basic ${Buffer.from('rzp_test_123:test-secret').toString('base64')}`);
      calls.push({ url, request });
      let result;
      let code = 200;
      if (url.endsWith('/orders')) {
        const body = JSON.parse(request.payload);
        assert.ok(Number.isSafeInteger(body.amount) && body.amount >= 100);
        assert.equal(body.currency, 'INR');
        order = { id: 'order_test', ...body };
        result = order;
      } else if (url.endsWith('/orders/order_test')) {
        result = { ...order, ...options.order };
      } else if (url.endsWith('/capture')) {
        assert.equal(JSON.parse(request.payload).amount, order.amount);
        if (options.captureFails) { code = 400; result = { error: 'Capture failed' }; }
        else { status = 'captured'; result = { status }; }
      } else {
        result = { id: 'pay_test', order_id: 'order_test', amount: order.amount, currency: 'INR', status, captured: status === 'captured', ...options.payment };
      }
      return { getResponseCode: () => code, getContentText: () => JSON.stringify(result) };
    } },
  };
  vm.createContext(context);
  vm.runInContext(readFileSync(`${__dirname}/WorkshopRegistrations.gs`, 'utf8'), context);
  const post = data => {
    const { getContent, ...result } = context.doPost({ postData: { contents: JSON.stringify(data) } });
    return result;
  };
  return {
    post, rows, properties, calls, writes, original, context, sheet,
    create: overrides => post({ action: 'create_order', amount: 500, registration, ...overrides }),
    allowAppend: () => { failAppend = false; },
  };
}

test('creates the suggested INR 500 order directly through Razorpay; no unverified row is saved', () => {
  const api = backend();
  const order = api.create();
  assert.deepEqual(order, { ok: true, keyId: 'rzp_test_123', orderId: 'order_test', amount: 50000, currency: 'INR' });
  assert.equal(JSON.stringify(api.rows), api.original);
  assert.equal(api.writes.length, 0);
  assert.ok(api.properties.has('WORKSHOP_ORDER_order_test'));
  assert.equal(JSON.stringify(order).includes('test-secret'), false);
});

test('rejects missing email, bad course and invalid amounts before contacting Razorpay', () => {
  const api = backend();
  for (const override of [{ registration: { ...registration, email: '' } }, { registration: { ...registration, course: 'Unknown' } }, ...['', '0', '-1', '0.99', '1.001', '750.25', 'Infinity', undefined].map(amount => ({ amount }))]) {
    assert.equal(api.create(override).code, 'VALIDATION_ERROR');
  }
  assert.equal(api.calls.length, 0);
  assert.equal(JSON.stringify(api.rows), api.original);
});

test('editable amounts below and above INR 500 are captured, saved and retried without another charge', () => {
  for (const amount of ['1', '250', '500', '750', '1000']) {
    const api = backend({ status: 'authorized' });
    const order = api.create({ amount });
    assert.equal(order.amount, Math.round(Number(amount) * 100));
    const result = api.post({ ...proof, amount: '1' });
    assert.equal(result.ok, true);
    assert.equal(result.amount, order.amount);
    assert.equal(api.rows[2][17], Number(amount));
    assert.ok(api.rows[2][13].includes(encodeURIComponent('INR ' + Number(amount).toFixed(2))));
    assert.equal(api.post(proof).duplicate, true);
    assert.equal(api.rows.length, 3);
    assert.equal(api.calls.filter(call => call.url.endsWith('/orders')).length, 1);
  }
});

for (const options of [{ noTab: true }, { noSheetAccess: true }, { noCredentials: true }]) {
  test(`setup failure blocks checkout without creating any sheet: ${JSON.stringify(options)}`, () => {
    const api = backend(options);
    assert.equal(api.create().ok, false);
    assert.equal(api.calls.length, 0);
    assert.equal(JSON.stringify(api.rows), api.original);
  });
}

test('only fills missing L-R headers; preserves Google Form headers and all old rows', () => {
  const api = backend();
  api.context.setupWorkshopRegistration();
  const originals = JSON.parse(api.original);
  assert.deepEqual(api.rows[0].slice(0, 11), originals[0]);
  assert.deepEqual(api.rows[1], originals[1]);
  assert.deepEqual(api.rows[0].slice(11), ['Payment Status', 'Confirmation Sent', 'WhatsApp Link', 'Course', 'Razorpay Payment ID', 'Razorpay Order ID', 'Advance Paid (INR)']);
  api.rows[0][11] = 'Existing payment header';
  api.context.setupWorkshopRegistration();
  assert.equal(api.rows[0][11], 'Existing payment header');
});

test('invalid HMAC is rejected before Razorpay calls or sheet writes', () => {
  const api = backend(); api.create();
  const calls = api.calls.length;
  assert.equal(api.post({ ...proof, signature: '0'.repeat(64) }).code, 'PAYMENT_VERIFICATION_FAILED');
  assert.equal(api.calls.length, calls);
  assert.equal(api.writes.length, 0);
  assert.equal(api.rows.length, 2);
});

for (const options of [
  { payment: { amount: 25000 } }, { payment: { currency: 'USD' } },
  { payment: { order_id: 'order_other' } }, { payment: { captured: false } },
  { status: 'failed' }, { order: { amount: 25000 } }, { order: { currency: 'USD' } },
  { status: 'authorized', captureFails: true },
]) {
  test(`unverified payment cannot append a row: ${JSON.stringify(options)}`, () => {
    const api = backend(options); api.create();
    assert.equal(api.post(proof).code, 'PAYMENT_VERIFICATION_FAILED');
    assert.equal(api.rows.length, 2);
    assert.equal(api.writes.length, 0);
  });
}

test('verified registration appends A-R correctly after existing Form records', () => {
  const api = backend(); api.create();
  const result = api.post(proof);
  assert.equal(result.ok, true); assert.equal(result.verified, true); assert.equal(result.saved, true);
  assert.equal(result.row, 3);
  assert.deepEqual(api.rows[1], JSON.parse(api.original)[1]);
  const row = api.rows[2];
  assert.ok(row[0] instanceof Date || Object.prototype.toString.call(row[0]) === '[object Date]');
  assert.deepEqual(row.slice(1, 13), ['Student', '919876543210', 'Female', 'Learn bridal makeup', 'Please keep existing responses', 'Beginner', 'student@example.com', 'Chennai', '', '', 'Verified', 'Ready to Send']);
  assert.match(row[13], /^https:\/\/web\.whatsapp\.com\/send\?phone=919876543210/);
  assert.deepEqual(row.slice(14), ['Full 2-day masterclass', 'pay_test', 'order_test', 500]);
  assert.equal(api.properties.has('WORKSHOP_ORDER_order_test'), false);
});

test('authorized payment is captured and fetched again before saving', () => {
  const api = backend({ status: 'authorized' }); api.create();
  assert.equal(api.post(proof).ok, true);
  const capture = api.calls.findIndex(call => call.url.endsWith('/capture'));
  assert.ok(capture > 0);
  assert.equal(api.calls[capture + 1].url.endsWith('/payments/pay_test'), true);
});

test('duplicate retries reverify payment and save exactly one row, even after pending data is deleted', () => {
  const api = backend(); api.create();
  assert.equal(api.post(proof).duplicate, false);
  const calls = api.calls.length;
  assert.equal(api.post(proof).duplicate, true);
  assert.equal(api.calls.length, calls + 2);
  assert.equal(api.rows.length, 3);
});

test('saving failure is not success; retry uses the same payment and appends once', () => {
  const api = backend({ failAppend: true }); api.create();
  const failed = api.post(proof);
  assert.equal(failed.ok, false); assert.equal(failed.code, 'REGISTRATION_SAVE_FAILED');
  assert.equal(failed.verified, true); assert.equal(failed.saved, false);
  assert.equal(api.rows.length, 2);
  assert.ok(api.properties.has('WORKSHOP_ORDER_order_test'));
  api.allowAppend();
  assert.equal(api.post(proof).ok, true);
  assert.equal(api.rows.length, 3);
  assert.equal(api.calls.filter(call => call.url.endsWith('/orders')).length, 1);
});

test('lost acknowledgement after append is recovered without appending twice', () => {
  const api = backend({ flushFailures: 1 }); api.create();
  assert.equal(api.post(proof).code, 'REGISTRATION_SAVE_FAILED');
  assert.equal(api.rows.length, 3);
  assert.equal(api.post(proof).duplicate, true);
  assert.equal(api.rows.length, 3);
});

test('concurrent Google Form append cannot redirect the website WhatsApp update to the wrong row', () => {
  const api = backend({ concurrentForm: true }); api.create();
  assert.equal(api.post(proof).row, 3);
  assert.equal(api.rows[3][1], 'Concurrent Form Student');
  assert.equal(api.rows[3][13], undefined);
  assert.ok(api.rows[2][13]);
});

test('public requests cannot bypass signature verification with the old private token callback', () => {
  const api = backend();
  assert.equal(api.post({ ...registration, paymentId: 'pay_test', orderId: 'order_test', advance: 500, apiToken: 'anything' }).code, 'UNKNOWN_ACTION');
  assert.equal(api.rows.length, 2);
});

test('a saved registration cannot reuse a payment ID with a different order ID', () => {
  const api = backend(); api.create();
  api.context.setupWorkshopRegistration();
  api.rows.push(['old', 'Other Student', '', '', '', '', '', '', '', '', '', 'Verified', '', '', registration.course, 'pay_test', 'order_other', 500]);
  const result = api.post(proof);
  assert.equal(result.code, 'PAYMENT_ALREADY_USED');
  assert.equal(api.rows.length, 3);
  assert.equal(api.rows[2][1], 'Other Student');
});

test('tampered pending registration cannot be saved against an existing payment', () => {
  const api = backend(); api.create();
  const key = 'WORKSHOP_ORDER_order_test';
  const stored = JSON.parse(api.properties.get(key));
  stored.registration.name = 'Someone else';
  api.properties.set(key, JSON.stringify(stored));
  assert.equal(api.post(proof).code, 'PAYMENT_VERIFICATION_FAILED');
  assert.equal(api.rows.length, 2);
});

test('verification never substitutes INR 500 for a missing stored expected amount', () => {
  const api = backend(); api.create({ amount: 750 });
  const key = 'WORKSHOP_ORDER_order_test';
  const stored = JSON.parse(api.properties.get(key));
  delete stored.amount;
  api.properties.set(key, JSON.stringify(stored));
  assert.equal(api.post(proof).code, 'PAYMENT_VERIFICATION_FAILED');
  assert.equal(api.rows.length, 2);
});

test('mismatched stored expected amount is rejected before capture or saving', () => {
  const api = backend({ status: 'authorized' }); api.create({ amount: 250 });
  const key = 'WORKSHOP_ORDER_order_test';
  const stored = JSON.parse(api.properties.get(key));
  stored.amount = 50000;
  api.properties.set(key, JSON.stringify(stored));
  assert.equal(api.post(proof).code, 'PAYMENT_VERIFICATION_FAILED');
  assert.equal(api.calls.some(call => call.url.endsWith('/capture')), false);
  assert.equal(api.rows.length, 2);
});

test('an existing INR 500 pending order from the old Firebase bridge can be recovered without repaying', () => {
  const remoteOrder = {};
  const api = backend({ order: remoteOrder }); api.create();
  const legacy = {
    name: registration.name, email: registration.email, phone: registration.phone, course: registration.course,
    city: registration.city, gender: registration.gender, mainGoal: registration.goal,
    experience: registration.experience, question: registration.question, paymentScreenshot: '',
  };
  api.properties.set('WORKSHOP_ORDER_order_test', JSON.stringify({ registration: legacy, amount: 50000, currency: 'INR' }));
  remoteOrder.notes = { type: 'workshop_advance', course: registration.course, registration_hash: crypto.createHash('sha256').update(JSON.stringify(legacy)).digest('hex') };
  assert.equal(api.post(proof).ok, true);
  assert.equal(api.rows[2][4], registration.goal);
  assert.equal(api.calls.filter(call => call.url.endsWith('/orders')).length, 1);
});

test('read-only diagnostics identify Apps Script backend and do not expose credentials or change rows', () => {
  const api = backend();
  const status = api.context.doGet();
  assert.equal(status.backend, 'google-apps-script');
  assert.equal(status.sheetAccessible, true); assert.equal(status.credentialsConfigured, true);
  assert.equal(JSON.stringify(status).includes('test-secret'), false);
  assert.equal(JSON.stringify(api.rows), api.original);
  assert.equal(api.writes.length, 0);
});

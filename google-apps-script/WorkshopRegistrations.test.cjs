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
  const logs = [];
  let columns = 11;
  let locked = false;
  let lockCalls = 0;
  let status = options.status || 'captured';
  let failAppend = Boolean(options.failAppend);
  let failUpdate = Boolean(options.failUpdate);
  let failVerifiedFlush = Boolean(options.failVerifiedFlush);
  let verifiedWrite = false;
  let flushFailures = options.flushFailures || 0;
  let order;
  const sheet = {
    getName: () => 'Form Responses 1',
    getSheetId: () => 1885927180,
    getFilter: () => options.filtered ? {} : null,
    getMaxColumns: () => columns,
    insertColumnsAfter(after, count) { assert.equal(after, columns); columns += count; },
    getLastRow: () => rows.length,
    appendRow(values) {
      assert.equal(locked, true);
      if (failAppend) throw new Error('Sheet access denied');
      rows.push(Array.from(values));
      if (options.missingOrderAfterAppend) rows[rows.length - 1][16] = '';
      if (options.corruptPendingConfirmation) rows[rows.length - 1][12] = 'Ready to Send';
      if (options.concurrentForm) rows.push(['later Google Form timestamp', 'Concurrent Form Student', '918888888888']);
    },
    getRange(row, column, count = 1, width = 1) {
      assert.ok(column + width - 1 <= columns, 'missing L-R columns must be added before reading them');
      const values = () => Array.from({ length: count }, (_, r) => Array.from({ length: width }, (_, c) => rows[row - 1 + r]?.[column - 1 + c] ?? ''));
      const write = (targetRow, targetColumn, value) => {
        if (options.protectedHeaders && targetRow === 1) throw new Error('Cannot edit a protected header range');
        assert.ok(targetRow !== 1 || targetColumn > 11, 'Google Form headers A-K must never be written');
        writes.push({ row: targetRow, column: targetColumn, value });
        while (rows[targetRow - 1].length < targetColumn) rows[targetRow - 1].push('');
        rows[targetRow - 1][targetColumn - 1] = value;
      };
      return {
        getValues: values, getDisplayValues: () => values().map(row => row.map(String)),
        getValue: () => values()[0][0], getDisplayValue: () => String(values()[0][0]),
        setValue: value => write(row, column, value),
        setValues(matrix) {
          if (failUpdate && row > 1 && column === 12 && matrix[0][0] === 'Verified') throw new Error('Sheet update denied');
          if (row > 1 && column === 12 && matrix[0][0] === 'Verified') verifiedWrite = true;
          matrix.forEach((line, r) => line.forEach((value, c) => write(row + r, column + c, value)));
        },
        setNumberFormat() { return this; },
        setRichTextValue: value => write(row, column, value.url), clearContent: () => write(row, column, ''),
      };
    },
  };
  const context = {
    console: { error: (...args) => logs.push(args.join(' ')), warn() {}, log: (...args) => logs.push(args.join(' ')) },
    LockService: { getScriptLock: () => ({ waitLock() { lockCalls++; if (options.lockTimeout && (!options.lockTimeoutAfterCreate || lockCalls > 1)) throw new Error('Lock timeout'); assert.equal(locked, false); locked = true; }, releaseLock() { locked = false; } }) },
    PropertiesService: { getScriptProperties: () => ({ getProperty: key => properties.get(key), setProperty: (key, value) => properties.set(key, value), deleteProperty: key => properties.delete(key) }) },
    SpreadsheetApp: {
      openById(id) {
        assert.equal(id, '1TdrQD7sq_uRgLkPoKwubH23QJY-reCejaNTVgvr3ows');
        if (options.noSheetAccess) throw new Error('Permission denied');
        return {
          getSheetByName(name) { assert.equal(name, 'Form Responses 1'); return options.noTab ? null : sheet; },
          setSpreadsheetTimeZone(value) { assert.equal(value, 'Asia/Kolkata'); },
          getSpreadsheetTimeZone: () => 'Asia/Kolkata',
        };
      },
      flush() {
        if (failVerifiedFlush && verifiedWrite) { failVerifiedFlush = false; throw new Error('Temporary verified-row flush failure'); }
        if (flushFailures > 0) { flushFailures--; throw new Error('Temporary sheet flush failure'); }
      },
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
    post, rows, properties, calls, writes, logs, original, context, sheet,
    create: overrides => post({ action: 'create_order', amount: 500, registration, ...overrides }),
    allowAppend: () => { failAppend = false; },
    allowUpdate: () => { failUpdate = false; },
  };
}

test('creates the suggested INR 500 order and saves its pending row before checkout', () => {
  const api = backend();
  const order = api.create();
  assert.deepEqual(order, { ok: true, registrationSaved: true, pendingSaved: true, row: 3, keyId: 'rzp_test_123', orderId: 'order_test', amount: 50000, currency: 'INR' });
  assert.equal(api.rows.length, 3);
  assert.equal(api.rows[2][11], 'Pending');
  assert.equal(api.rows[2][12], 'No');
  assert.equal(api.rows[2][13], '');
  assert.equal(api.rows[2][14], registration.course);
  assert.equal(api.rows[2][15], '');
  assert.equal(api.rows[2][16], 'order_test');
  assert.equal(api.rows[2][17], 500);
  assert.equal(api.properties.has('WORKSHOP_ORDER_order_test'), false);
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
    assert.equal(result.saved, true);
    assert.equal(api.rows[2][17], Number(amount));
    assert.ok(api.rows[2][13].startsWith('https://wa.me/919876543210?text='));
    assert.equal(api.rows[2][12], 'Ready to Send');
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
  const writes = api.writes.length;
  assert.equal(api.post({ ...proof, signature: '0'.repeat(64) }).code, 'PAYMENT_VERIFICATION_FAILED');
  assert.equal(api.calls.length, calls);
  assert.equal(api.writes.length, writes);
  assert.equal(api.rows[2][11], 'Pending');
});

for (const options of [
  { payment: { amount: 25000 } }, { payment: { currency: 'USD' } },
  { payment: { order_id: 'order_other' } }, { payment: { captured: false } },
  { status: 'failed' }, { order: { amount: 25000 } }, { order: { currency: 'USD' } },
  { status: 'authorized', captureFails: true },
]) {
  test(`unverified payment leaves the pending row unchanged: ${JSON.stringify(options)}`, () => {
    const api = backend(options); api.create();
    const before = JSON.stringify(api.rows[2]);
    assert.equal(api.post(proof).code, 'PAYMENT_VERIFICATION_FAILED');
    assert.equal(api.rows.length, 3);
    assert.equal(JSON.stringify(api.rows[2]), before);
  });
}

test('verified payment updates the existing pending row and preserves A-K', () => {
  const api = backend(); api.create();
  const result = api.post(proof);
  assert.equal(result.ok, true); assert.equal(result.verified, true); assert.equal(result.saved, true);
  assert.equal(result.paymentId, 'pay_test');
  assert.equal(result.orderId, 'order_test');
  assert.equal(result.amount, 50000);
  assert.equal(result.currency, 'INR');
  assert.equal(result.row, 3);
  assert.deepEqual(api.rows[1], JSON.parse(api.original)[1]);
  const row = api.rows[2];
  assert.ok(row[0] instanceof Date || Object.prototype.toString.call(row[0]) === '[object Date]');
  assert.deepEqual(row.slice(1, 11), ['Student', '919876543210', 'Female', 'Learn bridal makeup', 'Please keep existing responses', 'Beginner', 'student@example.com', 'Chennai', '', '']);
  assert.equal(row[11], 'Verified');
  assert.equal(row[12], 'Ready to Send');
  assert.match(row[13], /^https:\/\/wa\.me\/919876543210\?text=/);
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

test('saving failure is not success; retry updates the same pending row without another order', () => {
  const api = backend({ failUpdate: true }); api.create();
  const failed = api.post(proof);
  assert.equal(failed.ok, false); assert.equal(failed.code, 'REGISTRATION_SAVE_FAILED');
  assert.equal(failed.verified, true); assert.equal(failed.saved, false);
  assert.equal(api.rows.length, 3);
  assert.equal(api.rows[2][11], 'Pending');
  assert.equal(api.properties.has('WORKSHOP_ORDER_order_test'), false);
  api.allowUpdate();
  assert.equal(api.post(proof).ok, true);
  assert.equal(api.rows.length, 3);
  assert.equal(api.calls.filter(call => call.url.endsWith('/orders')).length, 1);
});

test('lost verification acknowledgement is recovered without appending twice', () => {
  const api = backend({ failVerifiedFlush: true }); api.create();
  assert.equal(api.post(proof).code, 'REGISTRATION_SAVE_FAILED');
  assert.equal(api.rows.length, 3);
  assert.equal(api.rows[2][11], 'Verified');
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
  assert.equal(api.rows.length, 4);
  assert.equal(api.rows[3][1], 'Other Student');
});

test('tampered pending row cannot be saved against an existing payment', () => {
  const api = backend(); api.create();
  api.rows[2][1] = 'Someone else';
  assert.equal(api.post(proof).code, 'PAYMENT_VERIFICATION_FAILED');
  assert.equal(api.rows.length, 3);
});

test('verification recovers from the pending row when its Script Property is missing', () => {
  const api = backend(); api.create({ amount: 750 });
  api.properties.delete('WORKSHOP_ORDER_order_test');
  const result = api.post(proof);
  assert.equal(result.ok, true);
  assert.equal(result.saved, true);
  assert.equal(api.rows[2][17], 750);
});

test('owner recovery verifies a captured payment from its pending row without Script Properties or a new order', () => {
  const api = backend();
  api.create({ amount: 10 });
  api.properties.delete('WORKSHOP_ORDER_order_test');
  const orderCount = api.calls.filter(call => call.url.endsWith('/orders')).length;
  const result = api.context.recoverCapturedWorkshopPayment('pay_test');
  assert.equal(result.ok, true);
  assert.equal(result.verified, true);
  assert.equal(result.saved, true);
  assert.equal(result.paymentId, 'pay_test');
  assert.equal(result.orderId, 'order_test');
  assert.equal(api.rows[2][17], 10);
  assert.equal(api.calls.filter(call => call.url.endsWith('/orders')).length, orderCount);
  assert.equal(api.rows.length, 3);
});

test('owner recovery refuses to invent registration data when both the pending row and Script Property are missing', () => {
  const api = backend();
  api.create({ amount: 10 });
  api.rows.splice(2, 1);
  api.properties.delete('WORKSHOP_ORDER_order_test');
  assert.throws(() => api.context.recoverCapturedWorkshopPayment('pay_test'), /original registration is missing/i);
  assert.equal(api.rows.length, 2);
  assert.equal(api.calls.filter(call => call.url.endsWith('/orders')).length, 1);
});

test('mismatched pending-row amount is rejected before capture or saving', () => {
  const api = backend({ status: 'authorized' }); api.create({ amount: 250 });
  api.rows[2][17] = 500;
  assert.equal(api.post(proof).code, 'PAYMENT_VERIFICATION_FAILED');
  assert.equal(api.calls.some(call => call.url.endsWith('/capture')), false);
  assert.equal(api.rows.length, 3);
});

test('a legacy property cannot cause verification to append a missing registration row', () => {
  const remoteOrder = {};
  const api = backend({ order: remoteOrder }); api.create();
  const legacy = {
    name: registration.name, email: registration.email, phone: registration.phone, course: registration.course,
    city: registration.city, gender: registration.gender, mainGoal: registration.goal,
    experience: registration.experience, question: registration.question, paymentScreenshot: '',
  };
  api.properties.set('WORKSHOP_ORDER_order_test', JSON.stringify({ registration: legacy, amount: 50000, currency: 'INR' }));
  api.rows.splice(2, 1);
  remoteOrder.notes = { type: 'workshop_advance', course: registration.course, registration_hash: crypto.createHash('sha256').update(JSON.stringify(legacy)).digest('hex') };
  const result = api.post(proof);
  assert.equal(result.ok, false);
  assert.equal(result.verified, true);
  assert.equal(result.saved, false);
  assert.equal(result.code, 'REGISTRATION_SAVE_FAILED');
  assert.equal(result.saveCause, 'ORDER_NOT_FOUND');
  assert.equal(result.saveStage, 'locate_pending_row');
  assert.equal(api.rows.length, 2);
  assert.equal(api.properties.has('WORKSHOP_ORDER_order_test'), true);
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

test('verification save failures identify the failing stage and sanitized exception', () => {
  const api = backend({ failUpdate: true }); api.create();
  const result = api.post(proof);
  assert.equal(result.code, 'REGISTRATION_SAVE_FAILED');
  assert.equal(result.saveStage, 'update_verified_row');
  assert.ok(result.reference);
  assert.equal(result.saved, false);
  const log = api.logs.map(entry => JSON.parse(entry)).find(entry => entry.event === "workshop_registration_save_failed");
  assert.equal(log.reference, result.reference);
  assert.equal(log.cause, 'SHEET_WRITE_ERROR');
  assert.equal(log.stage, 'update_verified_row');
  assert.equal(log.message, undefined);
  assert.equal(log.exceptionClass, 'Error');
  assert.equal(log.exceptionMessage, 'Sheet update denied');
  assert.equal(log.spreadsheetId, '1TdrQD7sq_uRgLkPoKwubH23QJY-reCejaNTVgvr3ows');
  assert.equal(JSON.stringify(result).includes('Sheet access denied'), false);
  assert.equal(JSON.stringify(result).includes('test-secret'), false);
});

test('missing pending registration and property is rejected without creating a payment record', () => {
  const api = backend(); api.create();
  api.rows.splice(2, 1);
  api.properties.delete('WORKSHOP_ORDER_order_test');
  const result = api.post(proof);
  assert.equal(result.code, 'ORDER_NOT_FOUND');
  assert.equal(result.saved, false);
  assert.equal(api.rows.length, 2);
});

test('pending save lock failure blocks checkout and logs no personal data', () => {
  const api = backend({ lockTimeout: true });
  const result = api.create();
  assert.equal(result.ok, false);
  assert.equal(result.code, 'PENDING_REGISTRATION_SAVE_FAILED');
  assert.equal(result.saveStage, 'acquire_lock');
  assert.equal(api.calls.filter(call => call.url.endsWith('/orders')).length, 1);
  assert.equal(api.rows.length, 2);
});

test('pending row save failure blocks checkout and does not change A-K', () => {
  const api = backend({ failAppend: true });
  const result = api.create();
  assert.equal(result.ok, false);
  assert.equal(result.code, 'PENDING_REGISTRATION_SAVE_FAILED');
  assert.equal(result.saveStage, 'append_pending_row');
  assert.equal(api.rows.length, 2);
  assert.deepEqual(api.rows.slice(0, 2).map(row => row.slice(0, 11)), JSON.parse(api.original));
});

test('verification lock and sheet flush failures are reported as verified but unsaved', () => {
  const lockApi = backend({ lockTimeout: true, lockTimeoutAfterCreate: true });
  lockApi.create();
  const lockFailure = lockApi.post(proof);
  assert.equal(lockFailure.code, 'REGISTRATION_SAVE_FAILED');
  assert.equal(lockFailure.verified, true);
  assert.equal(lockFailure.saved, false);
  assert.equal(lockFailure.saveStage, 'acquire_lock');

  const flushApi = backend({ failVerifiedFlush: true });
  flushApi.create();
  const flushFailure = flushApi.post(proof);
  assert.equal(flushFailure.code, 'REGISTRATION_SAVE_FAILED');
  assert.equal(flushFailure.saved, false);
  assert.equal(flushFailure.saveStage, 'flush_verified_row');
});

test('manual destination diagnostics report the exact tab and filter state without changing data', () => {
  const api = backend({ filtered: true });
  const report = api.context.diagnoseWorkshopSaving();
  assert.equal(report.spreadsheetId, '1TdrQD7sq_uRgLkPoKwubH23QJY-reCejaNTVgvr3ows');
  assert.equal(report.sheetId, 1885927180);
  assert.equal(report.sheetName, 'Form Responses 1');
  assert.equal(report.hasFilter, true);
  assert.equal(report.lastUsedRow, 2);
  assert.equal(api.writes.length, 0);
  assert.equal(api.calls.length, 0);
  assert.equal(JSON.stringify(api.rows), api.original);
});

test('caught verification rejection logs its action/reference without pretending the row was saved', () => {
  const api = backend(); api.create();
  const result = api.post({ ...proof, signature: '0'.repeat(64) });
  assert.equal(result.ok, false); assert.equal(result.saved, false);
  assert.ok(result.reference);
  const event = JSON.parse(api.logs.at(-1));
  assert.equal(event.event, 'workshop_request_failed');
  assert.equal(event.action, 'verify_payment');
  assert.equal(event.reference, result.reference);
  assert.equal(event.code, 'PAYMENT_VERIFICATION_FAILED');
  const logs = JSON.stringify(api.logs);
  for (const secret of ['test-secret', registration.email, registration.phone, proof.signature]) assert.equal(logs.includes(secret), false);
});

test('successful verification logs saving only after the exact row is confirmed', () => {
  const api = backend(); api.create();
  const result = api.post(proof);
  const event = JSON.parse(api.logs.at(-1));
  assert.equal(event.event, 'workshop_request_completed');
  assert.equal(event.action, 'verify_payment');
  assert.equal(event.saved, true); assert.equal(event.verified, true);
  assert.equal(event.row, result.row);
});

test('failed flush or order lookup after append never acknowledges a Pending save', () => {
  for (const [options, stage] of [
    [{ flushFailures: 1 }, 'flush_pending_row'],
    [{ missingOrderAfterAppend: true }, 'locate_pending_row'],
    [{ corruptPendingConfirmation: true }, 'read_back_pending_row'],
  ]) {
    const api = backend(options);
    const result = api.create();
    assert.equal(result.ok, false);
    assert.equal(result.code, 'PENDING_REGISTRATION_SAVE_FAILED');
    assert.equal(result.stage, stage);
    assert.equal(result.saveStage, stage);
    assert.notEqual(result.pendingSaved, true);
    assert.equal(result.orderId, undefined);
    assert.ok(result.reference);
  }
});

test('malformed POST is a structured rejection without leaking the body', () => {
  const api = backend();
  const result = api.context.doPost({ postData: { contents: '{"email":"private@example.com"' } });
  assert.equal(result.code, 'INVALID_REQUEST');
  assert.equal(result.stage, 'parse_request');
  assert.equal(result.ok, false);
  assert.equal(api.calls.length, 0);
  assert.equal(JSON.stringify([result, api.logs]).includes('private@example.com'), false);
});

test('Pending acknowledgement follows row confirmation and logs no customer fields', () => {
  const api = backend();
  const result = api.create();
  const events = api.logs.map(entry => JSON.parse(entry));
  assert.equal(result.pendingSaved, true);
  const confirmed = events.findIndex(event => event.event === 'workshop_pending_row_confirmed');
  const completed = events.findIndex(event => event.event === 'workshop_request_completed');
  assert.ok(confirmed >= 0 && completed > confirmed);
  assert.equal(events[completed].pendingSaved, true);
  for (const value of [registration.name, registration.email, registration.phone, registration.goal, registration.question, 'test-secret', proof.signature]) {
    assert.equal(JSON.stringify(api.logs).includes(value), false);
  }
});

test('diagnostics distinguish append failure from a persisted row followed by failure', () => {
  for (const [options, stage, appended, flushed, matched, readBack] of [
    [{ failAppend: true }, 'append_pending_row', false, false, null, null],
    [{ flushFailures: 1 }, 'flush_pending_row', true, false, null, null],
    [{ missingOrderAfterAppend: true }, 'locate_pending_row', true, true, 0, null],
    [{ corruptPendingConfirmation: true }, 'read_back_pending_row', true, true, 1, false],
  ]) {
    const api = backend(options);
    const result = api.create();
    const events = api.logs.map(entry => JSON.parse(entry));
    assert.equal(result.ok, false);
    assert.equal(result.orderId, undefined);
    assert.equal(result.pendingSaved, undefined);
    assert.equal(result.saveStage, stage);
    assert.equal(events.some(event => event.event === 'workshop_pending_append_returned'), appended);
    assert.equal(events.some(event => event.event === 'workshop_pending_flush_completed'), flushed);
    assert.equal(events.find(event => event.event === 'workshop_pending_lookup_completed')?.matchCount ?? null, matched);
    assert.equal(events.find(event => event.event === 'workshop_pending_read_back')?.valid ?? null, readBack);
    const failure = events.find(event => event.event === 'workshop_pending_save_failed');
    assert.equal(failure.exceptionClass, 'Error');
    assert.equal(typeof failure.exceptionMessage, 'string');
    assert.equal(result.exceptionMessage, undefined);
    assert.equal(api.rows.length, appended ? 3 : 2);
  }
});

test('Pending errors retain the original exception class and operational message only in owner logs', () => {
  const api = backend();
  api.sheet.appendRow = () => { throw new TypeError('Cannot edit a protected cell or object.'); };
  const result = api.create();
  const failure = api.logs.map(entry => JSON.parse(entry)).find(event => event.event === 'workshop_pending_save_failed');
  assert.equal(failure.exceptionClass, 'TypeError');
  assert.equal(failure.exceptionMessage, 'Cannot edit a protected cell or object.');
  assert.equal(result.error.includes('protected'), false);
  assert.equal(result.ok, false);
});

test('exception diagnostics redact registration values, credentials, signatures and quoted cell values', () => {
  const api = backend();
  const credentials = Buffer.from('rzp_test_123:test-secret').toString('base64');
  const data = { ...registration, name: 'A.* [Student]', question: 'Unusual (goal)?' };
  const message = 'Cannot write ' + Object.values(data).join(' / ') + ' test-secret rzp_test_123 ' + credentials +
    ' ' + proof.signature + ' other@example.com +91 98765 43210 "Another customer"';
  const result = api.context.safeWorkshopException_(new Error(message), data);
  assert.ok(result.exceptionMessage.startsWith('Cannot write'));
  for (const value of [...Object.values(data), 'test-secret', 'rzp_test_123', credentials, proof.signature, 'other@example.com', '98765', 'Another customer']) {
    assert.equal(result.exceptionMessage.includes(value), false);
  }
});

test('destination permission errors are diagnosed before any Razorpay order is created', () => {
  const api = backend({ noSheetAccess: true });
  const result = api.create();
  const failure = api.logs.map(entry => JSON.parse(entry)).find(event => event.event === 'workshop_destination_check_failed');
  assert.equal(failure.exceptionClass, 'Error');
  assert.equal(failure.exceptionMessage, 'Permission denied');
  assert.equal(result.stage, 'check_destination');
  assert.equal(result.code, 'SHEET_ACCESS_FAILED');
  assert.equal(api.calls.length, 0);
  assert.equal(api.writes.length, 0);
});

test('a row removed after payment checks is not recreated by verification', () => {
  const api = backend(); api.create();
  const save = api.context.saveVerifiedRegistration_;
  api.context.saveVerifiedRegistration_ = (...args) => {
    api.rows.splice(2, 1);
    return save(...args);
  };
  const result = api.post(proof);
  assert.equal(result.ok, false);
  assert.equal(result.verified, true);
  assert.equal(result.saved, false);
  assert.equal(result.saveCause, 'ORDER_NOT_FOUND');
  assert.equal(result.saveStage, 'locate_pending_row');
  assert.equal(api.rows.length, 2);
  assert.equal(api.calls.filter(call => call.url.endsWith('/orders')).length, 1);
});

test('a pending amount changed after payment checks cannot be overwritten during saving', () => {
  const api = backend(); api.create();
  const save = api.context.saveVerifiedRegistration_;
  api.context.saveVerifiedRegistration_ = (...args) => {
    api.rows[2][17] = 750;
    return save(...args);
  };
  const result = api.post(proof);
  assert.equal(result.ok, false);
  assert.equal(result.saved, false);
  assert.equal(result.saveCause, 'SHEET_ROW_CONFLICT');
  assert.equal(api.rows[2][11], 'Pending');
  assert.equal(api.rows[2][17], 750);
  assert.equal(api.rows.length, 3);
});

test('duplicate Pending persistence cannot create a second row for the same order', () => {
  const api = backend(); api.create();
  assert.throws(() => api.context.savePendingRegistration_(registration, 'order_test', 50000), error => error.code === 'ORDER_ALREADY_EXISTS');
  assert.equal(api.rows.length, 3);
  assert.equal(api.rows[2][11], 'Pending');
});

test('real frontend helper and Apps Script agree on INR 500, paise and confirmed persistence', async () => {
  const ts = require('typescript');
  for (const failAppend of [false, true]) {
    const api = backend({ failAppend });
    const frontend = {};
    vm.runInNewContext(ts.transpileModule(readFileSync(`${__dirname}/../src/lib/workshopPayment.ts`, 'utf8'), {
      compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    }).outputText, {
      exports: frontend, setTimeout, clearTimeout, AbortController, Error, TypeError, SyntaxError,
      fetch: async (_url, options) => {
        const payload = JSON.parse(options.body);
        assert.equal(payload.amount, 500, 'request uses whole rupees, not 5 or 50000');
        const result = api.post(payload);
        const razorpayOrder = api.calls.find(call => call.url.endsWith('/orders'));
        assert.equal(JSON.parse(razorpayOrder.request.payload).amount, 50000);
        assert.equal(result.registrationSaved, !failAppend);
        if (!failAppend) {
          assert.equal(api.rows[2][11], 'Pending', 'row exists before response reaches the frontend');
          assert.equal(api.rows[2][16], result.orderId);
          assert.equal(api.rows[2][17], 500);
        }
        return { ok: true, type: 'cors', json: async () => result };
      },
    });
    const form = { ...frontend.initialRegistration, name: registration.name, email: registration.email,
      phone: '9876543210', gender: registration.gender, experience: registration.experience, mainGoal: registration.goal };
    const request = frontend.createWorkshopOrder({ registration: form, amount: '500' });
    if (failAppend) {
      await assert.rejects(request, error => error.diagnostics.code === 'PENDING_REGISTRATION_SAVE_FAILED');
      assert.equal(api.rows.length, 2);
    } else {
      const order = await request;
      assert.equal(order.amount, 50000, 'Checkout receives the exact Razorpay paise amount');
      assert.equal(order.currency, 'INR');
    }
  }
});

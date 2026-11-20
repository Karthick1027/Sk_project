const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const exportsObject = {};
const storage = new Map();
let fetchHandler;
vm.runInNewContext(ts.transpileModule(readFileSync(`${__dirname}/workshopPayment.ts`, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, {
  exports: exportsObject,
  fetch: (...args) => fetchHandler(...args),
  setTimeout, clearTimeout, AbortController, Error, TypeError, SyntaxError,
  sessionStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) },
});
const { normalizePhone, validateRegistration, initialRegistration, storePendingPayment, readPendingPayment, createWorkshopOrder, verifyWorkshopPayment, WORKSHOP_API_URL } = exportsObject;
const validRegistration = { ...initialRegistration, name: 'Student', email: 'student@example.com', phone: '9876543210', gender: 'Female', experience: 'Beginner', mainGoal: 'Learn bridal makeup' };

test('phone accepts national numbers and strips exactly one pasted India prefix', () => {
  for (const input of ['9876543210', '+91 98765 43210', '919876543210', '0091 98765 43210']) assert.equal(normalizePhone(input), '9876543210');
  assert.equal(normalizePhone('ab98x76543210!'), '9876543210');
  assert.equal(normalizePhone('9123456789'), '9123456789');
  assert.equal(normalizePhone('987654321012345'), '9876543210');
});

test('all mandatory fields report inline errors and whitespace is rejected', () => {
  const errors = validateRegistration({ ...initialRegistration, name: '  ', course: '' });
  assert.deepEqual(Object.keys(errors).sort(), ['name', 'email', 'phone', 'course', 'gender', 'experience', 'mainGoal'].sort());
});

test('only ten-digit Indian mobile numbers pass validation', () => {
  const valid = { ...validRegistration, name: 'Student', phone: '9876543210', gender: 'Female', experience: 'Beginner', mainGoal: 'Bridal makeup' };
  assert.equal(Object.keys(validateRegistration(valid)).length, 0);
  for (const phone of ['987654321', '919876543210', '1234567890', '98765abcde']) assert.ok(validateRegistration({ ...valid, phone }).phone);
});

test('payment receipt survives reload for verification retry and clears after confirmation', () => {
  const pending = { proof: { razorpay_order_id: 'order_test', razorpay_payment_id: 'pay_test', razorpay_signature: 'signature' }, registration: { ...initialRegistration } };
  storePendingPayment(pending);
  assert.equal(readPendingPayment().proof.razorpay_payment_id, 'pay_test');
  storePendingPayment(null);
  assert.equal(readPendingPayment(), null);
});

const validOrder = { ok: true, pendingSaved: true, row: 3, keyId: 'rzp_test_123', orderId: 'order_123', amount: 50000, currency: 'INR' };
const jsonResponse = (data) => ({ ok: true, type: 'cors', json: async () => data });

test('create_order sends goal and international phone using a readable simple CORS POST', async () => {
  const registration = { ...validRegistration, name: 'Student', phone: '919876543210', mainGoal: 'Learn bridal makeup' };
  fetchHandler = async (url, options) => {
    assert.equal(url, WORKSHOP_API_URL);
    assert.equal(options.method, 'POST');
    assert.equal(options.mode, 'cors');
    assert.equal(options.redirect, 'follow');
    assert.equal(options.credentials, 'omit');
    assert.equal(options.headers['Content-Type'], 'text/plain;charset=UTF-8');
    const { mainGoal, ...details } = registration;
    assert.deepEqual(JSON.parse(options.body), { action: 'create_order', amount: 500, registration: { ...details, goal: mainGoal } });
    return jsonResponse(validOrder);
  };
  const order = await createWorkshopOrder({ registration });
  assert.equal(order.orderId, validOrder.orderId);
  assert.equal(order.amount, 50000);
});

test('verify_payment sends only action, orderId, paymentId and signature', async () => {
  fetchHandler = async (_url, options) => {
    assert.deepEqual(JSON.parse(options.body), { action: 'verify_payment', orderId: 'order_123', paymentId: 'pay_123', signature: 'signed-proof' });
    return jsonResponse({ ok: true, verified: true, saved: true, amount: 50000, currency: 'INR' });
  };
  await verifyWorkshopPayment({ razorpay_order_id: 'order_123', razorpay_payment_id: 'pay_123', razorpay_signature: 'signed-proof' });
});

test('HTTP 200 with backend rejection does not create a usable order', async () => {
  fetchHandler = async () => jsonResponse({ ok: false, error: 'Please fill all required fields.' });
  await assert.rejects(createWorkshopOrder({ registration: validRegistration }), /Please fill all required fields/);
});

test('CORS failure, opaque responses, non-JSON and HTTP failures never confirm an order', async () => {
  for (const handler of [
    async () => { throw new TypeError('Failed to fetch'); },
    async () => ({ ok: false, type: 'opaque' }),
    async () => ({ ok: true, type: 'opaqueredirect' }),
    async () => ({ ok: true, type: 'cors', json: async () => { throw new SyntaxError('HTML login page'); } }),
    async () => ({ ok: false, type: 'cors', status: 500 }),
  ]) {
    fetchHandler = handler;
    await assert.rejects(createWorkshopOrder({ registration: validRegistration }), { name: 'WorkshopCommunicationError' });
  }
});

test('missing order fields and wrong amount/currency cannot open checkout', async () => {
  for (const order of [{ ok: true }, { ...validOrder, amount: 500 }, { ...validOrder, currency: 'USD' }, { ...validOrder, keyId: '' }]) {
    fetchHandler = async () => jsonResponse(order);
    await assert.rejects(createWorkshopOrder({ registration: validRegistration }), /invalid payment order/);
  }
});

test('valid order fields without confirmed Pending persistence cannot open checkout', async () => {
  for (const changes of [{ pendingSaved: undefined }, { pendingSaved: false }, { pendingSaved: 'true' }, { row: undefined }, { row: 1 }, { row: '3' }, { row: 3.5 }]) {
    fetchHandler = async () => jsonResponse({ ...validOrder, ...changes });
    await assert.rejects(createWorkshopOrder({ registration: validRegistration }), error => error.kind === 'order' && error.diagnostics.code === 'PENDING_SAVE_NOT_CONFIRMED');
  }
});

test('verify requires explicit backend confirmation and rejects incomplete saving', async () => {
  const proof = { razorpay_order_id: 'order_123', razorpay_payment_id: 'pay_123', razorpay_signature: 'signature' };
  for (const result of [{}, { ok: false }, { ok: true }, { ok: true, verified: false }, { ok: true, saved: false }]) {
    fetchHandler = async () => jsonResponse(result);
    await assert.rejects(verifyWorkshopPayment(proof));
  }
});

test('missing or invalid email never sends an order request', async () => {
  let requests = 0;
  fetchHandler = async () => { requests++; return jsonResponse(validOrder); };
  for (const email of ['', '   ', 'student@', 'student.example.com', 'a b@example.com']) {
    await assert.rejects(createWorkshopOrder({ registration: { ...validRegistration, email } }), (error) => error.name === 'RegistrationValidationError' && Boolean(error.fields.email));
  }
  assert.equal(requests, 0);
});

test('payload contains all nine API fields, trimmed email, exact course and one country code', async () => {
  for (const phone of ['9876543210', '919876543210']) {
    fetchHandler = async (_url, options) => {
      assert.deepEqual(JSON.parse(options.body).registration, {
        name: 'Student', phone: '919876543210', email: 'student@example.com',
        gender: 'Female', experience: 'Beginner', goal: 'Learn bridal makeup',
        question: '', city: 'Chennai', course: 'Full 2-day masterclass',
      });
      return jsonResponse(validOrder);
    };
    await createWorkshopOrder({ registration: { ...validRegistration, phone, email: ' Student@Example.com ', city: 'Chennai' } });
  }
});

test('unknown course and overlong backend-limited fields never create an order', async () => {
  let requests = 0;
  fetchHandler = async () => { requests++; return jsonResponse(validOrder); };
  for (const override of [{ course: 'Full 2-Day Masterclass' }, { mainGoal: 'x'.repeat(501) }, { experience: 'x'.repeat(151) }]) {
    await assert.rejects(createWorkshopOrder({ registration: { ...validRegistration, ...override } }), { name: 'RegistrationValidationError' });
  }
  assert.equal(requests, 0);
});

test('backend validation fields map goal back to the form mainGoal field', async () => {
  fetchHandler = async () => jsonResponse({ ok: false, code: 'VALIDATION_ERROR', fields: { goal: 'Please describe your goal.', email: 'Invalid email address.' }, error: 'Check your fields.' });
  await assert.rejects(createWorkshopOrder({ registration: validRegistration }), (error) => error.name === 'RegistrationValidationError' && error.fields.mainGoal === 'Please describe your goal.' && error.fields.email === 'Invalid email address.');
});

test('Google Sheets saving failures are distinct from unverified payment failures', async () => {
  const proof = { razorpay_order_id: 'order_123', razorpay_payment_id: 'pay_123', razorpay_signature: 'signed-proof' };
  fetchHandler = async () => jsonResponse({ ok: false, code: 'REGISTRATION_SAVE_FAILED', error: 'Payment was received, but registration could not be saved.' });
  await assert.rejects(verifyWorkshopPayment(proof), (error) => error.kind === 'saving');
  fetchHandler = async () => jsonResponse({ ok: false, code: 'PAYMENT_VERIFICATION_FAILED', error: 'Payment signature could not be verified.' });
  await assert.rejects(verifyWorkshopPayment(proof), (error) => error.kind === 'payment');
});

test('invalid amounts never send an order request', async () => {
  let requests = 0;
  fetchHandler = async () => { requests++; return jsonResponse(validOrder); };
  for (const amount of ['', '0', '-20', '0.99', '1.001', '750.25', '1e3', 'Infinity', '90071992547410']) {
    await assert.rejects(createWorkshopOrder({ registration: validRegistration, amount }), (error) => error.name === 'RegistrationValidationError' && Boolean(error.fields.amount));
  }
  assert.equal(requests, 0);
});

test('valid Apps Script order without undocumented backend/version metadata is accepted', async () => {
  fetchHandler = async () => jsonResponse(validOrder);
  const order = await createWorkshopOrder({ registration: validRegistration });
  assert.equal(order.orderId, 'order_123');
  assert.equal(order.amount, 50000);
});

test('success requires the actual backend-verified amount to match the order', async () => {
  const proof = { razorpay_order_id: 'order_123', razorpay_payment_id: 'pay_123', razorpay_signature: 'signed-proof' };
  fetchHandler = async () => jsonResponse({ ok: true, verified: true, saved: true, amount: 50000, currency: 'INR' });
  assert.equal(await verifyWorkshopPayment(proof, 50000), 500);
  await assert.rejects(verifyWorkshopPayment(proof, 25000), /amount does not match/);
  fetchHandler = async () => jsonResponse({ ok: true, verified: true, saved: true, amount: 25000, currency: 'INR' });
  assert.equal(await verifyWorkshopPayment(proof, 25000), 250);
  fetchHandler = async () => jsonResponse({ ok: true, verified: true, saved: true });
  await assert.rejects(verifyWorkshopPayment(proof), /amount does not match/);
});

test('chosen amount is sent to Apps Script and checked before opening Checkout', async () => {
  for (const amount of ['1', '250', '500', '750', '1000']) {
    fetchHandler = async (_url, options) => {
      assert.equal(JSON.parse(options.body).amount, Number(amount));
      return jsonResponse({ ...validOrder, amount: Math.round(Number(amount) * 100) });
    };
    assert.equal((await createWorkshopOrder({ registration: validRegistration, amount })).amount, Math.round(Number(amount) * 100));
  }
  fetchHandler = async () => jsonResponse(validOrder);
  await assert.rejects(createWorkshopOrder({ registration: validRegistration, amount: '250' }), /invalid payment order/);
});

test('saving errors retain safe backend stage and reference in the customer message', async () => {
  fetchHandler = async () => jsonResponse({ ok: false, code: 'REGISTRATION_SAVE_FAILED', error: 'Registration could not be saved.', reference: 'abc12345', saveStage: 'append_row', saveCause: 'SHEET_WRITE_ERROR', registration: validRegistration, signature: 'must-not-appear' });
  await assert.rejects(verifyWorkshopPayment({ razorpay_order_id: 'order_123', razorpay_payment_id: 'pay_123', razorpay_signature: 'proof' }), error => {
    assert.equal(error.kind, 'saving');
    assert.equal(error.diagnostics.reference, 'abc12345');
    assert.match(error.message, /REGISTRATION_SAVE_FAILED.*append_row.*abc12345/);
    assert.equal(error.message.includes('must-not-appear'), false);
    assert.equal(error.message.includes(validRegistration.email), false);
    return true;
  });
});

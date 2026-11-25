const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');

const exportsObject = {};
const storage = new Map();
let fetchHandler;
class MockFileReader {
  async readAsDataURL(file) {
    try {
      this.result = 'data:' + file.type + ';base64,' + Buffer.from(await file.arrayBuffer()).toString('base64');
      this.onload();
    } catch (_) { this.onerror(); }
  }
}
vm.runInNewContext(ts.transpileModule(readFileSync(`${__dirname}/workshopPayment.ts`, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, {
  exports: exportsObject,
  fetch: (...args) => fetchHandler(...args),
  setTimeout, clearTimeout, AbortController, Error, TypeError, SyntaxError, FileReader: MockFileReader,
  sessionStorage: { getItem: (key) => storage.get(key), setItem: (key, value) => storage.set(key, value), removeItem: (key) => storage.delete(key) },
});
const { normalizePhone, validateRegistration, initialRegistration, storePendingPayment, readPendingPayment, createWorkshopOrder, verifyWorkshopPayment, WORKSHOP_API_URL } = exportsObject;
const validRegistration = { ...initialRegistration, name: 'Student', email: 'student@example.com', phone: '9876543210', gender: 'Female', experience: 'Beginner', mainGoal: 'Learn bridal makeup' };
const validProof = { razorpay_order_id: 'order_123', razorpay_payment_id: 'pay_123', razorpay_signature: 'a'.repeat(64) };

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

test('receipt survives reload for manual review without another payment', () => {
  const pending = { paymentId: 'pay_test', registration: { ...initialRegistration }, amount: 50000 };
  storePendingPayment(pending);
  assert.equal(readPendingPayment().paymentId, 'pay_test');
  storePendingPayment(null);
  assert.equal(readPendingPayment(), null);
});

const validOrder = { ok: true, registrationSaved: true, paymentVerification: 'AUTOMATIC', row: 3, keyId: 'rzp_test_123', orderId: 'order_123', amount: 50000, currency: 'INR' };
const jsonResponse = (data) => ({ ok: true, type: 'cors', json: async () => data });

test('duplicate contacts show only the rejected field with a short message', async () => {
  for (const field of ['email', 'phone']) {
    const message = 'This contact has already been used to register.';
    fetchHandler = async () => jsonResponse({ ok: false, code: 'DUPLICATE_REGISTRATION', error: 'This phone number or email address has already been registered.', fields: { [field]: message } });
    await assert.rejects(createWorkshopOrder({ registration: validRegistration }), error => {
      assert.equal(error.name, 'RegistrationValidationError');
      assert.deepEqual(Object.keys(error.fields), [field]);
      assert.equal(error.fields[field], field === 'email' ? 'Email already registered.' : 'WhatsApp number already registered.');
      return true;
    });
  }
});

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
  for (const changes of [{ registrationSaved: undefined }, { registrationSaved: false }, { registrationSaved: 'true' }, { registrationSaved: undefined, pendingSaved: true }, { row: undefined }, { row: 1 }, { row: '3' }, { row: 3.5 }]) {
    fetchHandler = async () => jsonResponse({ ...validOrder, ...changes });
    await assert.rejects(createWorkshopOrder({ registration: validRegistration }), error => error.kind === 'order' && error.diagnostics.code === 'PENDING_SAVE_NOT_CONFIRMED');
  }
});

test('registrationSaved cannot override a false or missing ok acknowledgement', async () => {
  for (const ok of [undefined, false, 'true']) {
    fetchHandler = async () => jsonResponse({ ...validOrder, ok });
    await assert.rejects(createWorkshopOrder({ registration: validRegistration }));
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
        question: '', city: 'Chennai', course: '2-Day Online Live Demo Workshop',
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

test('legacy receipts migrate to manual review without any verification request or stored signature', () => {
  storage.set('sk-workshop-pending-payment', JSON.stringify({ proof: { razorpay_order_id: 'order_old', razorpay_payment_id: 'pay_old', razorpay_signature: 'old-signature' }, registration: validRegistration, amount: 50000 }));
  fetchHandler = () => { throw new Error('Receipt reading must not send network requests'); };
  const receipt = readPendingPayment();
  assert.equal(receipt.paymentId, 'pay_old');
  assert.equal(receipt.amount, 50000);
  assert.equal(storage.get('sk-workshop-pending-payment').includes('old-signature'), false);
  storePendingPayment(null);
});

test('manual and unspecified backends cannot enable automatic payment verification', async () => {
  for (const paymentVerification of [undefined, 'MANUAL', false]) {
    fetchHandler = async () => jsonResponse({ ...validOrder, paymentVerification });
    await assert.rejects(createWorkshopOrder({ registration: validRegistration }), error => error.diagnostics.code === 'AUTOMATIC_WORKFLOW_REQUIRED');
  }
});

test('Checkout proof survives reload for verification-only recovery', () => {
  const pending = { paymentId: validProof.razorpay_payment_id, proof: validProof, registration: validRegistration, amount: 50000, registrationSaved: true };
  storePendingPayment(pending);
  assert.equal(readPendingPayment().proof.razorpay_signature, validProof.razorpay_signature);
  assert.equal(readPendingPayment().proof.razorpay_order_id, validProof.razorpay_order_id);
  storePendingPayment(null);
});

test('verification sends the actual Checkout fields without registration or client amount', async () => {
  fetchHandler = async (_url, options) => {
    assert.deepEqual(JSON.parse(options.body), { action: 'verify_payment', orderId: 'order_123', paymentId: 'pay_123', signature: validProof.razorpay_signature });
    return jsonResponse({ ok: true, verified: true, saved: true, orderId: 'order_123', paymentId: 'pay_123', amount: 50000, currency: 'INR', row: 3 });
  };
  assert.equal(await verifyWorkshopPayment(validProof, 50000), 500);
});

test('only explicit verification plus confirmed saving and matching payment can show success', async () => {
  const valid = { ok: true, verified: true, saved: true, amount: 50000, currency: 'INR', orderId: 'order_123', paymentId: 'pay_123' };
  for (const changes of [{ ok: false }, { ok: undefined }, { verified: undefined }, { verified: false }, { saved: false }, { amount: 500 }, { currency: 'USD' }, { orderId: 'order_other' }, { paymentId: 'pay_other' }]) {
    fetchHandler = async () => jsonResponse({ ...valid, ...changes });
    await assert.rejects(verifyWorkshopPayment(validProof, 50000));
  }
});

test('captured payment and unconfirmed Sheet update is a saving error, never another charge', async () => {
  fetchHandler = async () => jsonResponse({ ok: false, verified: true, paymentCaptured: true, saved: false, code: 'REGISTRATION_SAVE_FAILED', error: 'Payment was captured but saving failed. Contact SK Bridal Studio; do not pay again.' });
  await assert.rejects(verifyWorkshopPayment(validProof, 50000), error => error.kind === 'saving' && /do not pay again/i.test(error.message));
});

test('local payment proof is uploaded with create_order and needs explicit persistence acknowledgement', async () => {
  const bytes = Buffer.from([137,80,78,71,13,10,26,10]);
  const file = new File([bytes], 'receipt.png', { type: 'image/png' });
  fetchHandler = async (_url, options) => {
    const payload = JSON.parse(options.body);
    assert.deepEqual(payload.paymentProof, { mimeType: 'image/png', base64: bytes.toString('base64') });
    assert.equal(payload.registration.name, validRegistration.name);
    return jsonResponse({ ...validOrder, paymentProofSaved: true });
  };
  assert.equal((await createWorkshopOrder({ registration: validRegistration, paymentProof: file })).amount, 50000);
  fetchHandler = async () => jsonResponse(validOrder);
  await assert.rejects(createWorkshopOrder({ registration: validRegistration, paymentProof: file }), error => error.diagnostics.code === 'PAYMENT_PROOF_NOT_CONFIRMED');
});

test('empty, unsupported and oversized local proofs fail inline without a backend request', async () => {
  let requests = 0;
  fetchHandler = async () => { requests++; return jsonResponse(validOrder); };
  for (const paymentProof of [{ size: 0, type: 'image/png' }, { size: 10, type: 'text/html' }, { size: 5 * 1024 * 1024 + 1, type: 'image/png' }]) {
    await assert.rejects(createWorkshopOrder({ registration: validRegistration, paymentProof }), error => error.fields.paymentScreenshot && error.name === 'RegistrationValidationError');
  }
  assert.equal(requests, 0);
});


test('availability endpoint override does not change the workshop default', async () => {
  const requested = [];
  const availabilityEndpoint = 'https://script.google.com/macros/s/test-endpoint-override/exec';
  fetchHandler = async url => { requested.push(url); return jsonResponse({ ok: true }); };
  await exportsObject.postWorkshopAction({ action: 'check_bridal_availability' }, availabilityEndpoint);
  await exportsObject.postWorkshopAction({ action: 'verify_payment' });
  assert.deepEqual(requested, [availabilityEndpoint, WORKSHOP_API_URL]);
  assert.equal(WORKSHOP_API_URL, 'https://script.google.com/macros/s/AKfycbzj1dDVfYQt-zOTTdkV8fTegusSdISJZHUr4RuzHPc5gwWnUCcE77NToadNgrWsNYgQlw/exec');
});

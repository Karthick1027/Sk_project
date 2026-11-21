// Exercises the built Workshop page with mocked payment/network responses.
// No requests are sent to Apps Script or Razorpay.
const { createServer } = require('node:http');
const { readFileSync, mkdtempSync, existsSync } = require('node:fs');
const { join, resolve, extname } = require('node:path');
const { tmpdir } = require('node:os');
const { spawn } = require('node:child_process');
const browser = process.argv[2];
if (!browser) throw new Error('Pass an installed Edge/Chrome executable path.');
const root = resolve(__dirname, '../dist');
const setup = `<style>[role="option"] { transition: none !important; }</style><script>
window.qa = { orders: 0, verifications: 0, checkouts: 0, mode: 'validation', payloads: [] };
window.fetch = async (url, options = {}) => {
  const qa = window.qa;
  if (!String(url).includes('script.google.com')) return new Response('{}');
  const payload = JSON.parse(options.body);
  qa.payloads.push(payload);
  let response;
  if (payload.action === 'create_order') {
    qa.orders++;
    response = qa.mode === 'validation' ? { ok: false, code: 'VALIDATION_ERROR', fields: { email: 'Please check your email.' }, error: 'Check your fields.' }
      : { ok: true, registrationSaved: true, saved: true, paymentVerification: 'AUTOMATIC', row: 3, orderId: 'order_123', keyId: 'rzp_test_123', amount: Number(payload.amount) * 100, currency: 'INR' };
    qa.amount = Math.round(Number(payload.amount) * 100);
    if (qa.mode === 'unconfirmed-pending') delete response.registrationSaved;
    if (qa.mode === 'wrong-amount') response.amount = 500;
    if (qa.mode === 'pending-save-failed') response = { ok: false, code: 'PENDING_REGISTRATION_SAVE_FAILED', error: 'Your registration could not be saved, so Checkout was not opened.', stage: 'append_pending_row', reference: 'qa123456', saved: false };
  } else {
    qa.verifications++;
    const expected = { action: 'verify_payment', orderId: 'order_123', paymentId: 'pay_123', signature: 'a'.repeat(64) };
    if (JSON.stringify(payload) !== JSON.stringify(expected)) throw new Error('Unexpected verification payload');
    await new Promise(resolve => setTimeout(resolve, 180));
    response = qa.mode === 'verification-failure' ? { ok: false, verified: false, saved: false, code: 'PAYMENT_VERIFICATION_FAILED', error: 'Payment could not be verified.' }
      : qa.mode === 'saving-failure' ? { ok: false, verified: true, paymentCaptured: true, saved: false, code: 'REGISTRATION_SAVE_FAILED', error: 'Payment was captured but saving failed. Do not pay again.' }
      : qa.mode === 'unconfirmed-verification' ? { ok: true, verified: false, saved: false }
      : { ok: true, verified: true, saved: true, amount: qa.amount, currency: 'INR', row: 3, orderId: 'order_123', paymentId: 'pay_123' };
  }
  return new Response(JSON.stringify(response), { headers: { 'Content-Type': 'application/json' } });
};
window.Razorpay = class {
  constructor(options) { this.options = options; this.events = {}; }
  on(name, callback) { this.events[name] = callback; }
  close() { this.options.modal.ondismiss(); }
  open() {
    window.qa.checkouts++;
    window.qa.checkoutAmount = this.options.amount;
    window.qa.checkoutDescription = this.options.description;
    if (window.qa.mode === 'open-error') throw new Error('Checkout initialization rejected');
    if (window.qa.mode === 'cancelled') { setTimeout(() => this.options.modal.ondismiss(), 10); return; }
    setTimeout(() => {
      if (window.qa.mode === 'failure') this.events['payment.failed']();
      else {
        const proof = { razorpay_order_id: 'order_123', razorpay_payment_id: 'pay_123', razorpay_signature: 'a'.repeat(64) };
        this.options.handler(proof); this.options.handler(proof);
      }
    }, 10);
  }
};
window.qa.mockRazorpay = window.Razorpay;
const appendToHead = document.head.appendChild.bind(document.head);
document.head.appendChild = node => {
  if (window.qa.blockGateway && node.src?.includes('checkout.razorpay.com')) {
    setTimeout(() => node.onerror?.(new Event('error')), 1);
    return node;
  }
  return appendToHead(node);
};
</script>`;
const checks = `<script>
const delay = () => new Promise(resolve => setTimeout(resolve, 60));
const results = [];
const assert = (condition, message) => { if (!condition) throw new Error(message); results.push(message); };
const setField = async (name, value) => {
  const field = document.querySelector('[name="' + name + '"]');
  if (field.getAttribute('role') === 'combobox') {
    field.click(); await delay();
    [...document.querySelectorAll('[role="option"]')].find(option => option.dataset.value === value).click();
    await delay(); return;
  }
  const prototype = field.tagName === 'SELECT' ? HTMLSelectElement.prototype : field.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
  Object.getOwnPropertyDescriptor(prototype, 'value').set.call(field, value);
  field.dispatchEvent(new Event(field.tagName === 'SELECT' ? 'change' : 'input', { bubbles: true }));
  await delay();
};
const submit = async () => { document.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })); await delay(); await delay(); };
(async () => {
  for (let count = 0; !document.querySelector('[name="email"]') && count < 80; count++) await delay();
  try {
    assert(document.querySelector('[name="email"]').required, 'Required Email Address input is rendered');
    const course = document.querySelector('[name="course"]');
    course.click(); await delay();
    const hovered = [...document.querySelectorAll('[role="option"]')].find(option => option.dataset.value === 'Reception Look (Day 2)');
    hovered.dispatchEvent(new MouseEvent('mouseover', { bubbles: true })); await delay();
    assert(getComputedStyle(hovered).backgroundColor === 'rgb(216, 194, 165)' && getComputedStyle(hovered).color === 'rgb(59, 38, 30)', 'Dropdown hover uses light brown background and dark brown text (' + getComputedStyle(hovered).backgroundColor + ', ' + getComputedStyle(hovered).color + ')');
    course.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); await delay();
    assert(course.getAttribute('aria-expanded') === 'false' && !document.querySelector('[role="listbox"]'), 'Escape closes the dropdown');
    course.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true })); await delay();
    course.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true })); await delay();
    course.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true })); await delay();
    assert(course.value === 'Reception Look (Day 2)' && document.activeElement === course, 'Dropdown supports keyboard selection and retains focus');
    await setField('course', 'Full 2-day masterclass');
    await submit();
    assert(document.getElementById('workshop-email-error') && !document.querySelector('dialog[open]') && qa.orders === 0 && qa.checkouts === 0, 'Empty fields show inline errors without order or checkout');
    for (const [name, value] of Object.entries({ name: 'Test Student', email: 'bad-email', phone: '9876543210', gender: 'Female', experience: 'Beginner', mainGoal: 'Learn bridal makeup', city: 'Chennai', question: 'Please keep these details' })) await setField(name, value);
    await submit();
    assert(document.getElementById('workshop-email-error') && qa.orders === 0, 'Invalid email prevents order creation');
    await setField('amount', '250');
    await setField('email', 'Student@Example.com');
    await setField('amount', '250.50'); await submit();
    assert(document.getElementById('workshop-amount-error') && qa.orders === 0, 'Fractional rupee amounts are rejected before order creation');
    await setField('amount', '250');
    await submit();
    assert(document.getElementById('workshop-email-error')?.textContent === 'Please check your email.' && !document.querySelector('dialog[open]') && qa.orders === 1 && qa.checkouts === 0, 'Backend field error stays inline and does not show payment failure');
    assert(qa.payloads[0].registration.email === 'student@example.com' && qa.payloads[0].registration.phone === '919876543210' && qa.payloads[0].registration.goal === 'Learn bridal makeup', 'Payload maps email, phone and goal correctly');
    assert(qa.payloads[0].amount === 250, 'Edited amount below INR 500 is sent to Apps Script');
    qa.mode = 'unconfirmed-pending'; await submit();
    assert(qa.checkouts === 0 && !document.querySelector('dialog[open]') && document.querySelector('[role="alert"]')?.textContent.includes('registration was saved'), 'Unconfirmed Pending save blocks Checkout and displays an actionable error');
    qa.mode = 'pending-save-failed'; await submit();
    assert(qa.checkouts === 0 && qa.verifications === 0 && !document.querySelector('dialog[open]') && document.querySelector('[role="alert"]')?.textContent.includes('qa123456'), 'Pending save rejection blocks Checkout, shows the stage/reference and releases the processing state');
    assert(!document.querySelector('form button[type="submit"]').disabled, 'Pending save failure allows a retry without leaving the form processing');
    qa.mode = 'gateway-blocked'; qa.blockGateway = true; delete window.Razorpay;
    const ordersBeforeBlocked = qa.orders;
    await submit();
    assert(document.getElementById('payment-result-title')?.textContent === 'Unable to Open Payment' && qa.orders === ordersBeforeBlocked + 1 && qa.checkouts === 0, 'Registration is saved before SDK loading even if Checkout script is blocked');
    assert(document.querySelector('[name="name"]').value === 'Test Student', 'Gateway failure preserves registration details');
    document.querySelector('[aria-label="Close payment message"]').click(); await delay();
    qa.blockGateway = false; window.Razorpay = qa.mockRazorpay;
    qa.mode = 'open-error'; await submit();
    assert(document.getElementById('payment-result-title')?.textContent === 'Unable to Open Payment', 'Checkout open exceptions are distinct from payment failures');
    document.querySelector('[aria-label="Close payment message"]').click(); await delay();
    const createdOrders = qa.orders;
    qa.mode = 'cancelled'; await submit();
    assert(qa.orders === createdOrders && qa.verifications === 0, 'Retry after opening failure reuses the same order without verifying or charging');
    document.querySelector('[aria-label="Close payment message"]').click(); await delay();
    qa.mode = 'failure';
    await setField('email', 'student@example.com');
    await submit();
    assert(qa.orders === createdOrders + 1, 'Editing registration details creates a newly bound order');
    const failedOrderCount = qa.orders;
    assert(document.getElementById('payment-result-title')?.textContent === 'Payment Not Completed', 'Razorpay failure retains animated payment dialog');
    document.querySelector('[aria-label="Close payment message"]').click(); await delay();
    assert(document.querySelector('[name="question"]').value === 'Please keep these details', 'Payment failure preserves form details');
    // Amount and cancellation checks happen before reporting Checkout success.
    await setField('amount', '500');
    const checkoutsBefore500 = qa.checkouts;
    qa.mode = 'wrong-amount'; await submit();
    assert(qa.payloads.at(-1).amount === 500 && qa.checkouts === checkoutsBefore500 && document.querySelector('[role="alert"]')?.textContent.includes('invalid payment order'), 'INR 500 rejects a response of only 500 paise');
    qa.mode = 'cancelled'; await submit();
    assert(qa.checkoutAmount === 50000 && qa.checkoutDescription.includes('500') && qa.checkouts === checkoutsBefore500 + 1, 'INR 500 reaches Checkout as 50000 paise');
    assert(document.querySelector('dialog').textContent.includes('remain Pending'), 'Cancellation keeps registration Pending');
    document.querySelector('[aria-label="Close payment message"]').click(); await delay();
    const orderCount = qa.orders;
    qa.mode = 'verification-failure'; await submit();
    assert(document.querySelector('form button[type="submit"]').disabled, 'Form is locked during backend verification');
    await submit(); await delay(); await delay();
    assert(qa.orders === orderCount && qa.verifications === 1, 'Duplicate callbacks and submits send exactly one verification and no new order');
    assert(document.getElementById('payment-result-title')?.textContent === 'Payment Verification Pending', 'Unverified callback never shows success');
    assert(JSON.parse(sessionStorage.getItem('sk-workshop-pending-payment')).proof.razorpay_signature === 'a'.repeat(64), 'Receipt is retained for reload and retry');
    qa.mode = 'saving-failure';
    [...document.querySelectorAll('dialog button')].find(button => button.textContent === 'Retry Verification').click();
    await delay(); await delay(); await delay(); await delay();
    assert(document.getElementById('payment-result-title')?.textContent === 'Registration Update Not Confirmed' && document.querySelector('dialog').textContent.includes('Do not pay again'), 'Captured payment with failed Sheet update instructs contact and no further payment');
    qa.mode = 'unconfirmed-verification';
    [...document.querySelectorAll('dialog button')].find(button => button.textContent === 'Retry Verification').click();
    await delay(); await delay(); await delay(); await delay();
    assert(document.getElementById('payment-result-title')?.textContent === 'Payment Verification Pending', 'Generic HTTP success without verified acknowledgement is rejected');
    qa.mode = 'success';
    [...document.querySelectorAll('dialog button')].find(button => button.textContent === 'Retry Verification').click();
    await delay(); await delay(); await delay(); await delay();
    assert(document.getElementById('payment-result-title')?.textContent === 'Payment Verified', 'Success appears only after backend verification and confirmed saving');
    assert(qa.orders === orderCount && qa.verifications === 4 && qa.checkouts === checkoutsBefore500 + 2, 'Verification retries never create another order or open Checkout again');
    assert(sessionStorage.getItem('sk-workshop-pending-payment') === null, 'Confirmed success clears the recovery receipt');
    assert(document.querySelector('dialog').textContent.includes('500'), 'Verified success displays the actual amount');
    [...document.querySelectorAll('dialog button')].find(button => button.textContent === 'Continue to Workshop').click(); await delay();
    assert(document.querySelector('[name="email"]').value === '' && document.querySelector('[name="amount"]').value === '500', 'Form resets after confirmed success is dismissed');
    document.body.dataset.qa = 'passed';
  } catch (error) { results.push('FAILED: ' + error.message); document.body.dataset.qa = 'failed'; }
  const output = document.createElement('pre'); output.id = 'qa-result'; output.textContent = JSON.stringify(results); document.body.appendChild(output);
})();
</script>`;
const html = readFileSync(join(root, 'index.html'), 'utf8').replace('<head>', `<head>${setup}`).replace('</body>', `${checks}</body>`);
const server = createServer((request, response) => {
  const path = resolve(root, '.' + new URL(request.url, 'http://localhost').pathname);
  if (path.startsWith(root + require('node:path').sep) && existsSync(path) && extname(path)) {
    const types = { '.js': 'application/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg' };
    response.setHeader('Content-Type', types[extname(path)] || 'application/octet-stream');
    response.end(readFileSync(path));
  } else { response.setHeader('Content-Type', 'text/html'); response.end(html); }
});
server.listen(0, '127.0.0.1', () => {
  const child = spawn(browser, ['--headless', '--disable-gpu', '--no-first-run', '--no-default-browser-check', '--window-size=375,812', `--user-data-dir=${mkdtempSync(join(tmpdir(), 'sk-workshop-form-'))}`, '--dump-dom', '--virtual-time-budget=15000', `http://127.0.0.1:${server.address().port}/workshops`], { windowsHide: true });
  let output = '';
  child.stdout.on('data', chunk => { output += chunk; });
  child.stderr.resume();
  const timer = setTimeout(() => child.kill(), 45000);
  child.on('error', error => { console.error(error); server.close(); clearTimeout(timer); process.exitCode = 1; });
  child.on('close', () => {
    server.close(); clearTimeout(timer);
    console.log(output.match(/<pre id="qa-result">(.*?)<\/pre>/s)?.[1] || 'Browser checks did not complete.');
    process.exitCode = output.includes('data-qa="passed"') ? 0 : 1;
  });
});

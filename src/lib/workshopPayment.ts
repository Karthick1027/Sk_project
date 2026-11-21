export const initialRegistration = {
  name: '', email: '', phone: '', course: 'Full 2-day masterclass', city: '',
  gender: '', mainGoal: '', experience: '', question: '',
};
export type Registration = typeof initialRegistration;
export type RegistrationField = keyof Registration | 'amount';
export type RegistrationErrors = Partial<Record<RegistrationField, string>>;
export const DEFAULT_PAYMENT_AMOUNT = '500';
export function paymentAmountPaise(value: string): number {
  const text = value.trim();
  const rupees = Number(text);
  const paise = rupees * 100;
  if (!/^\d+$/.test(text) || !Number.isSafeInteger(rupees) || rupees < 1 || !Number.isSafeInteger(paise)) {
    throw new RegistrationValidationError({ amount: 'Enter a whole-rupee amount of at least ₹1.' });
  }
  return paise;
}
export function formatPaymentAmount(amount: number): string {
  return amount.toLocaleString('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 2 });
}
export const WORKSHOP_COURSES = ['Full 2-day masterclass', 'Muhurtham Look (Day 1)', 'Reception Look (Day 2)'] as const;
export class RegistrationValidationError extends Error {
  constructor(public fields: RegistrationErrors, message = 'Please check the highlighted registration fields.') {
    super(message);
    this.name = 'RegistrationValidationError';
  }
}
export class WorkshopApiError extends Error {
  constructor(public kind: 'order' | 'payment' | 'saving', message: string, public diagnostics: { code?: string; reference?: string; saveStage?: string; saveCause?: string } = {}) {
    super(message);
    this.name = 'WorkshopApiError';
  }
}
export type PaymentStage = 'idle' | 'creating' | 'opening' | 'checkout' | 'verifying' | 'saving';
export interface PaymentProof {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}
export interface PendingPayment { proof: PaymentProof; registration: Registration; amount?: number }
interface WorkshopOrder { orderId: string; amount: number; currency: string; keyId: string }
interface CheckoutOptions {
  key: string; amount: number; currency: string; order_id: string;
  name: string; description: string;
  prefill: { name: string; contact: string; email?: string };
  theme: { color: string };
  redirect: false;
  retry: { enabled: boolean };
  modal: { ondismiss: () => void; handleback: boolean };
  handler: (proof: PaymentProof) => void;
}
export interface Checkout {
  open: () => void;
  close: () => void;
  on: (event: 'payment.failed', handler: () => void) => void;
}

// Only explicitly selected, non-personal diagnostics belong in the console.
// Never log registrations, callback objects, signatures or API response bodies.
export function logWorkshopPayment(event: string, details: { code?: string; stage?: PaymentStage; mode?: 'test' | 'live'; amount?: number; currency?: string; reference?: string; saveStage?: string; saveCause?: string } = {}): void {
  console.info('[Workshop payment]', { event, ...details });
}
declare global {
  interface Window { Razorpay?: new (options: CheckoutOptions) => Checkout }
}

export const WORKSHOP_API_URL = 'https://script.google.com/macros/s/AKfycbydFnmOzR1QlMBNjcX5yy1BKVMW7ktNomOC7ZzhpKNyrDs3yrzfx43cgP8gp8ZwLzf5/exec';

export class WorkshopCommunicationError extends Error {
  constructor() {
    super('Unable to read the registration server response. Please check your connection and try again. If this continues, contact SK Bridal Studio; the payment connection needs to be checked.');
    this.name = 'WorkshopCommunicationError';
  }
}

async function postWorkshopAction(payload: object): Promise<Record<string, unknown>> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90000);
  try {
    // A simple POST avoids a JSON preflight. CORS still has to permit reading
    // the redirected response; an opaque/no-cors response is never confirmation.
    const response = await fetch(WORKSHOP_API_URL, {
      method: 'POST', mode: 'cors', redirect: 'follow', credentials: 'omit',
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body: JSON.stringify(payload), signal: controller.signal,
    });
    if (!response.ok || response.type === 'opaque' || response.type === 'opaqueredirect') throw new WorkshopCommunicationError();
    const data: unknown = await response.json();
    if (!data || typeof data !== 'object' || Array.isArray(data)) throw new WorkshopCommunicationError();
    const result = data as Record<string, unknown>;
    if (result.ok !== true) {
      const message = typeof result.error === 'string' ? result.error.slice(0, 500) : 'The registration server did not confirm this request.';
      const action = (payload as { action?: string }).action;
      const fields: RegistrationErrors = {};
      const backendFields = result.fields || result.fieldErrors;
      if (backendFields && typeof backendFields === 'object') {
        for (const [key, value] of Object.entries(backendFields)) {
          const field = key === 'goal' ? 'mainGoal' : key;
          if ((field === 'amount' || Object.prototype.hasOwnProperty.call(initialRegistration, field)) && typeof value === 'string') fields[field as RegistrationField] = value.slice(0, 500);
        }
      }
      if (action === 'create_order' && (result.code === 'VALIDATION_ERROR' || Object.keys(fields).length || /required fields|registration details|invalid email|invalid course|valid Indian WhatsApp/i.test(message))) {
        if (/email/i.test(message)) fields.email ||= 'Please enter a valid email address.';
        if (/course/i.test(message)) fields.course ||= 'Please select one of the available courses.';
        if (/WhatsApp|phone/i.test(message)) fields.phone ||= 'Enter a valid 10-digit Indian mobile number.';
        throw new RegistrationValidationError(fields, message);
      }
      const saving = result.code === 'REGISTRATION_SAVE_FAILED' || result.stage === 'saving' || /registration.*(?:could not be saved|not saved)|(?:saving|save).*(?:registration|sheet)/i.test(message);
      // Preserve only bounded diagnostic tokens. Never log the raw response,
      // registration details, signatures or credentials.
      const token = (value: unknown) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(value) ? value : undefined;
      const diagnostics = { code: token(result.code), reference: token(result.reference), saveStage: token(result.saveStage) || token(result.stage), saveCause: token(result.saveCause) };
      const context = [diagnostics.code, diagnostics.saveStage, diagnostics.saveCause, diagnostics.reference ? 'Reference: ' + diagnostics.reference : undefined].filter(Boolean).join(' / ');
      throw new WorkshopApiError(saving ? 'saving' : action === 'create_order' ? 'order' : 'payment', context ? message + ' (' + context + ')' : message, diagnostics);
    }
    return result;
  } catch (error) {
    if (error instanceof TypeError || error instanceof SyntaxError || (error instanceof Error && error.name === 'AbortError')) throw new WorkshopCommunicationError();
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

export async function createWorkshopOrder({ registration, amount = DEFAULT_PAYMENT_AMOUNT }: { registration: Registration; amount?: string }): Promise<WorkshopOrder> {
  const normalized = Object.fromEntries(Object.entries(registration).map(([key, value]) => [key, value.trim()])) as Registration;
  normalized.email = normalized.email.toLowerCase();
  if (/^91[6-9][0-9]{9}$/.test(normalized.phone)) normalized.phone = normalized.phone.slice(2);
  const errors = validateRegistration(normalized);
  let paise = 0;
  try { paise = paymentAmountPaise(amount); } catch (error) {
    if (error instanceof RegistrationValidationError) Object.assign(errors, error.fields); else throw error;
  }
  if (Object.keys(errors).length) throw new RegistrationValidationError(errors);
  // The form and Apps Script request use rupees. The backend converts to
  // paise for Razorpay; its response and Checkout amount remain in paise.
  const amountRupees = Number(amount.trim());
  const { mainGoal, ...details } = normalized;
  const data = await postWorkshopAction({
    action: 'create_order', amount: amountRupees, registration: { ...details, phone: `91${normalized.phone}`, goal: mainGoal },
  });
  // Do not open Checkout just because the POST was sent or returned HTTP 200.
  if (typeof data.orderId !== 'string' || !/^order_[A-Za-z0-9]+$/.test(data.orderId) ||
      typeof data.keyId !== 'string' || !/^rzp_(test|live)_[A-Za-z0-9]+$/.test(data.keyId) ||
      data.amount !== paise || data.currency !== 'INR') {
    throw new Error('The registration server returned an invalid payment order. Checkout was not opened. Please contact SK Bridal Studio.');
  }
  if (data.registrationSaved !== true || typeof data.row !== 'number' || !Number.isSafeInteger(data.row) || data.row < 2) {
    throw new WorkshopApiError('order', 'We could not confirm that your registration was saved. Checkout was not opened. Please contact SK Bridal Studio before trying again.', { code: 'PENDING_SAVE_NOT_CONFIRMED' });
  }
  return { orderId: data.orderId, keyId: data.keyId, amount: data.amount, currency: data.currency };
}

export async function verifyWorkshopPayment(proof: PaymentProof, expectedPaise?: number): Promise<number> {
  const result = await postWorkshopAction({
    action: 'verify_payment', orderId: proof.razorpay_order_id,
    paymentId: proof.razorpay_payment_id, signature: proof.razorpay_signature,
  });
  // Require the action-specific confirmation, not a generic health-check ok.
  if (result.verified === true && result.saved !== true) throw new WorkshopApiError('saving', 'Your payment was verified, but registration saving was not confirmed. Retry the existing payment without paying again.');
  if (result.verified !== true || result.saved !== true) throw new WorkshopApiError('payment', 'Payment verification and registration saving have not been confirmed. Please retry the existing payment.');
  if (typeof result.amount !== 'number' || !Number.isSafeInteger(result.amount) || result.amount < 100 || result.currency !== 'INR' || (expectedPaise != null && result.amount !== expectedPaise)) throw new WorkshopApiError('payment', 'The verified payment amount does not match your order. Please contact SK Bridal Studio.');
  return result.amount / 100;
}

let checkoutScript: Promise<void> | undefined;
export const CHECKOUT_SCRIPT_URL = 'https://checkout.razorpay.com/v1/checkout.js';
type CheckoutLoadCode = 'SDK_TIMEOUT' | 'SDK_CSP_BLOCKED' | 'SDK_NOT_INITIALIZED' | 'SDK_OFFLINE' | 'SDK_LOAD_FAILED' | 'SDK_INSERTION_BLOCKED';
export class CheckoutLoadError extends Error {
  constructor(message: string, public code: CheckoutLoadCode = 'SDK_LOAD_FAILED') { super(message); this.name = 'CheckoutLoadError'; }
}
export function loadCheckout(): Promise<void> {
  if (typeof window.Razorpay === 'function') return Promise.resolve();
  if (!checkoutScript) {
    checkoutScript = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      let settled = false;
      const timer = window.setTimeout(() => fail('SDK_TIMEOUT', 'Razorpay Checkout did not finish loading within 30 seconds. Please try again.'), 30000);
      const finish = () => {
        window.clearTimeout(timer);
        script.onload = null;
        script.onerror = null;
        document.removeEventListener('securitypolicyviolation', onPolicyViolation);
      };
      const fail = (code: CheckoutLoadCode, message: string) => {
        if (settled) return;
        settled = true;
        finish();
        script.remove();
        logWorkshopPayment('checkout_script_failed', { code, stage: 'opening' });
        reject(new CheckoutLoadError(`${message} Reference: ${code}.`, code));
      };
      const onPolicyViolation = (event: SecurityPolicyViolationEvent) => {
        if (event.blockedURI.includes('checkout.razorpay.com')) fail('SDK_CSP_BLOCKED', 'Your browser security policy blocked the payment gateway. Please contact SK Bridal Studio.');
      };
      document.addEventListener('securitypolicyviolation', onPolicyViolation);
      try {
        script.src = CHECKOUT_SCRIPT_URL;
        script.async = true;
        script.onload = () => {
          if (settled) return;
          if (typeof window.Razorpay === 'function') { settled = true; finish(); logWorkshopPayment('checkout_script_ready'); resolve(); }
          else fail('SDK_NOT_INITIALIZED', 'The payment gateway did not initialize. Please refresh the page and try again.');
        };
        script.onerror = () => {
          if (typeof navigator !== 'undefined' && navigator.onLine === false) fail('SDK_OFFLINE', 'Your browser reports that it is offline. Reconnect and try again.');
          else fail('SDK_LOAD_FAILED', 'Your browser could not load Razorpay Checkout. Please try again. If this continues, contact SK Bridal Studio with this reference.');
        };
        logWorkshopPayment('checkout_script_requested', { stage: 'opening' });
        document.head.appendChild(script);
      } catch {
        fail('SDK_INSERTION_BLOCKED', 'Your browser blocked loading the payment gateway. Please contact SK Bridal Studio or try another browser.');
      }
    }).then(() => { checkoutScript = undefined; }, (error: unknown) => {
      checkoutScript = undefined;
      if (error instanceof CheckoutLoadError) throw error;
      throw new CheckoutLoadError('The payment gateway could not load. Please refresh the page and try again.');
    });
  }
  return checkoutScript;
}

export function normalizePhone(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (digits.length === 14 && digits.startsWith('0091')) digits = digits.slice(4);
  else if (digits.length === 12 && digits.startsWith('91')) digits = digits.slice(2);
  return digits.slice(0, 10);
}

export function validateRegistration(registration: Registration) {
  const errors: RegistrationErrors = {};
  if (!registration.name.trim()) errors.name = 'Please enter your full name.';
  if (!registration.email.trim()) errors.email = 'Please enter your email address.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registration.email.trim())) errors.email = 'Please enter a valid email address.';
  if (!/^[6-9][0-9]{9}$/.test(registration.phone)) errors.phone = 'Enter a valid 10-digit Indian mobile number.';
  if (!(WORKSHOP_COURSES as readonly string[]).includes(registration.course)) errors.course = 'Please select a course.';
  if (!['Female', 'Male', 'Prefer not to say'].includes(registration.gender)) errors.gender = 'Please select your gender.';
  if (!registration.experience.trim()) errors.experience = 'Please describe your makeup experience.';
  if (!registration.mainGoal.trim()) errors.mainGoal = 'Please enter your main goal for joining.';
  const limits = { name: 100, email: 150, gender: 50, experience: 150, mainGoal: 500, question: 1000, city: 100 } as const;
  for (const [field, max] of Object.entries(limits)) {
    if (registration[field as keyof typeof limits].trim().length > max) errors[field as keyof typeof limits] = `Please use ${max} characters or fewer.`;
  }
  return errors;
}

const pendingKey = 'sk-workshop-pending-payment';
export function readPendingPayment(): PendingPayment | null {
  try {
    const pending = JSON.parse(sessionStorage.getItem(pendingKey) || 'null') as PendingPayment | null;
    if (!pending?.proof || !pending.registration) return null;
    const validProof = Object.values(pending.proof).length === 3 &&
      ['razorpay_order_id', 'razorpay_payment_id', 'razorpay_signature'].every((key) => typeof pending.proof[key as keyof PaymentProof] === 'string' && pending.proof[key as keyof PaymentProof].length > 0);
    const validRegistration = Object.keys(initialRegistration).every((key) => typeof pending.registration[key as keyof Registration] === 'string');
    return validProof && validRegistration ? pending : null;
  } catch { return null; }
}
export function storePendingPayment(pending: PendingPayment | null) {
  // The signature is a payment receipt, never a Razorpay API secret. The backend revalidates it on every retry.
  try {
    if (pending) sessionStorage.setItem(pendingKey, JSON.stringify(pending));
    else sessionStorage.removeItem(pendingKey);
  } catch { /* Retry remains available in memory when browser storage is disabled. */ }
}

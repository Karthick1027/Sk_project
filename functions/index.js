// Legacy backend retained for reference only. Not deployed or called by the
// Spark-plan website; google-apps-script/WorkshopRegistrations.gs is active.
const { createHash, createHmac, timingSafeEqual } = require('node:crypto');
const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

const razorpayKeyId = defineSecret('RAZORPAY_KEY_ID');
const razorpayKeySecret = defineSecret('RAZORPAY_KEY_SECRET');
const workshopApiToken = defineSecret('WORKSHOP_API_TOKEN');
const registrationUrl = 'https://script.google.com/macros/s/AKfycbzj1dDVfYQt-zOTTdkV8fTegusSdISJZHUr4RuzHPc5gwWnUCcE77NToadNgrWsNYgQlw/exec';
function paymentAmountPaise(value = 500) {
  const text = String(value).trim();
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) throw new HttpsError('invalid-argument', 'Enter a payment amount of at least INR 1 with up to two decimal places.');
  const [whole, fraction = ''] = text.split('.');
  const paise = Number(whole) * 100 + Number(fraction.padEnd(2, '0'));
  if (!Number.isSafeInteger(paise) || paise < 100) throw new HttpsError('invalid-argument', 'Payment amount is invalid.');
  return paise;
}
const allowedCourses = [
  '2-Day Online Live Demo Workshop',
  '15-Day Bridal Makeup Masterclass',
  '30-Day Professional Bridal Makeup Masterclass',
];

function razorpayAuthorization() {
  const credentials = `${razorpayKeyId.value()}:${razorpayKeySecret.value()}`;
  return `Basic ${Buffer.from(credentials).toString('base64')}`;
}

async function razorpayRequest(path, options = {}) {
  const response = await fetch(`https://api.razorpay.com/v1${path}`, {
    ...options,
    headers: {
      Authorization: razorpayAuthorization(),
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const result = await response.json();

  if (!response.ok) {
    console.error('Razorpay API request failed:', response.status, result.error?.code);
    throw new HttpsError('internal', 'Payment processing is unavailable. Please try again.');
  }

  return result;
}

function validateRegistration(registration) {
  if (!registration || typeof registration !== 'object') {
    throw new HttpsError('invalid-argument', 'Registration details are required.');
  }

  const clean = {
    name: String(registration.name || '').trim(),
    email: String(registration.email || '').trim(),
    phone: String(registration.phone || '').trim(),
    course: String(registration.course || '').trim(),
    city: String(registration.city || '').trim(),
    gender: String(registration.gender || '').trim(),
    mainGoal: String(registration.mainGoal || '').trim(),
    experience: String(registration.experience || '').trim(),
    question: String(registration.question || '').trim(),
    paymentScreenshot: String(registration.paymentScreenshot || '').trim(),
  };

  if (
    !clean.name || clean.name.length > 100 ||
    (clean.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean.email)) || clean.email.length > 150 ||
    !/^[0-9]{10,15}$/.test(clean.phone) ||
    !allowedCourses.includes(clean.course) ||
    !clean.gender || clean.gender.length > 100 ||
    !clean.mainGoal || clean.mainGoal.length > 1000 ||
    !clean.experience || clean.experience.length > 500 ||
    clean.city.length > 100 || clean.question.length > 1000 ||
    clean.paymentScreenshot.length > 500
  ) {
    throw new HttpsError('invalid-argument', 'Some registration details are invalid.');
  }

  return clean;
}

function registrationHash(registration) {
  return createHash('sha256').update(JSON.stringify(registration)).digest('hex');
}

exports.createWorkshopOrder = onCall(
  { secrets: [razorpayKeyId, razorpayKeySecret] },
  async (request) => {
    const registration = validateRegistration(request.data?.registration);
    const advancePaise = paymentAmountPaise(request.data?.amount);

    const order = await razorpayRequest('/orders', {
      method: 'POST',
      body: JSON.stringify({
        amount: advancePaise,
        currency: 'INR',
        receipt: `workshop_${Date.now()}`,
        notes: {
          type: 'workshop_advance',
          course: registration.course,
          registration_hash: registrationHash(registration),
        },
      }),
    });

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: razorpayKeyId.value(),
    };
  },
);

exports.verifyWorkshopPayment = onCall(
  { secrets: [razorpayKeyId, razorpayKeySecret, workshopApiToken] },
  async (request, response) => {
    const { razorpay_order_id: orderId, razorpay_payment_id: paymentId, razorpay_signature: signature } = request.data || {};
    const registration = validateRegistration(request.data?.registration);
    const paymentProof = request.data?.paymentProof;

    if (paymentProof != null) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
      if (
        typeof paymentProof.name !== 'string' || paymentProof.name.length > 200 ||
        !allowedTypes.includes(paymentProof.mimeType) ||
        typeof paymentProof.dataBase64 !== 'string' ||
        paymentProof.dataBase64.length > 5600000 ||
        !/^[A-Za-z0-9+/]+={0,2}$/.test(paymentProof.dataBase64)
      ) {
        throw new HttpsError('invalid-argument', 'Payment proof file is invalid or too large.');
      }
    }

    if (
      typeof orderId !== 'string' ||
      typeof paymentId !== 'string' ||
      typeof signature !== 'string' ||
      !/^[a-f\d]{64}$/i.test(signature)
    ) {
      throw new HttpsError('invalid-argument', 'Payment verification details are invalid.');
    }

    const expectedSignature = createHmac('sha256', razorpayKeySecret.value())
      .update(`${orderId}|${paymentId}`)
      .digest();
    const receivedSignature = Buffer.from(signature, 'hex');

    if (!timingSafeEqual(expectedSignature, receivedSignature)) {
      throw new HttpsError('permission-denied', 'Payment signature could not be verified.');
    }

    const order = await razorpayRequest(`/orders/${encodeURIComponent(orderId)}`);
    let payment = await razorpayRequest(`/payments/${encodeURIComponent(paymentId)}`);

    if (
      !Number.isSafeInteger(order.amount) || order.amount < 100 ||
      order.currency !== 'INR' ||
      order.notes?.type !== 'workshop_advance' ||
      order.notes?.course !== registration.course ||
      order.notes?.registration_hash !== registrationHash(registration) ||
      payment.order_id !== orderId ||
      payment.amount !== order.amount ||
      payment.currency !== 'INR'
    ) {
      throw new HttpsError('failed-precondition', 'Payment does not match this workshop order.');
    }

    if (payment.status === 'authorized') {
      payment = await razorpayRequest(`/payments/${encodeURIComponent(paymentId)}/capture`, {
        method: 'POST',
        body: JSON.stringify({ amount: order.amount, currency: 'INR' }),
      });
    }

    if (payment.status !== 'captured') {
      throw new HttpsError('failed-precondition', 'Payment has not been captured. Please contact us if you were charged.');
    }

    if (request.acceptsStreaming && response) {
      await response.sendChunk({ stage: 'saving' });
    }

    try {
      const sheetResponse = await fetch(registrationUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          ...registration,
          source: 'SK Bridal Studio Website',
          paymentId,
          orderId,
          advance: order.amount / 100,
          paymentProof,
          apiToken: workshopApiToken.value(),
        }),
      });
      const sheetResult = await sheetResponse.json();

      if (!sheetResponse.ok || !sheetResult.ok) {
        throw new Error('Registration sheet did not acknowledge saving.');
      }
    } catch {
      console.error('Verified payment could not be saved to the registration sheet.');
      throw new HttpsError('internal', 'Payment was received, but registration could not be saved. Please contact us.', { code: 'REGISTRATION_SAVE_FAILED', stage: 'saving' });
    }

    return { ok: true, amount: order.amount, currency: order.currency };
  },
);

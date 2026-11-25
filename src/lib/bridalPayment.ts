import { postWorkshopAction, WorkshopApiError, type PaymentProof } from './workshopPayment';

export const BRIDAL_ADVANCE_PAISE = 200000;
export interface BridalBooking { name: string; email: string; phone: string; eventDate: string; session: string }
export interface BridalOrder { orderId: string; keyId: string; amount: number; currency: string }
export const BRIDAL_SESSIONS = ['Muhurtham', 'Reception', 'Engagement', 'Other bridal session'];

async function bridalAction(payload: object, verifying = false): Promise<Record<string, unknown>> {
  try {
    return await postWorkshopAction(payload);
  } catch (error) {
    if (error instanceof WorkshopApiError && error.diagnostics.code === 'UNKNOWN_ACTION') {
      throw new Error(verifying
        ? 'Payment verification is temporarily unavailable. Contact SK Bridal Studio with your payment ID. Do not pay again.'
        : 'Bridal payments are temporarily unavailable. Contact SK Bridal Studio to complete your booking.');
    }
    throw error;
  }
}

export async function createBridalOrder(booking: BridalBooking, requestId: string): Promise<BridalOrder> {
  const data = await bridalAction({ action: 'create_bridal_order', booking, requestId, availabilityConfirmed: true });
  if (data.bookingSaved !== true || data.amount !== BRIDAL_ADVANCE_PAISE || data.currency !== 'INR' || typeof data.orderId !== 'string' || !/^order_[A-Za-z0-9]+$/.test(data.orderId) || typeof data.keyId !== 'string' || !/^rzp_(live|test)_[A-Za-z0-9]+$/.test(data.keyId)) {
    throw new Error('The bridal payment order was not confirmed. Contact SK Bridal Studio before paying.');
  }
  return { orderId: data.orderId, keyId: data.keyId, amount: data.amount, currency: data.currency };
}

export async function verifyBridalPayment(proof: PaymentProof): Promise<void> {
  const data = await bridalAction({ action: 'verify_bridal_payment', orderId: proof.razorpay_order_id, paymentId: proof.razorpay_payment_id, signature: proof.razorpay_signature }, true);
  if (data.verified !== true || data.saved !== true || data.amount !== BRIDAL_ADVANCE_PAISE || data.currency !== 'INR' || data.orderId !== proof.razorpay_order_id || data.paymentId !== proof.razorpay_payment_id) {
    throw new Error('Payment is not confirmed yet. If charged, do not pay again. Retry verification or contact SK Bridal Studio.');
  }
}

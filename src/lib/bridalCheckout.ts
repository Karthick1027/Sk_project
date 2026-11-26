import { postWorkshopAction, WorkshopApiError, type PaymentProof } from './workshopPayment';
import { BRIDAL_AVAILABILITY_API_URL } from './bridalAvailability';
import { bridalAdvanceTotal, validateBridalEnquiry, type BridalEnquiry } from './bridalEnquiry';

export interface BridalCheckoutOrder { orderId: string; keyId: string; amount: number; currency: 'INR' }
export interface BridalCheckoutReceipt { proof: PaymentProof; amount: number; verified: boolean }
const RECEIPT_KEY = 'sk-bridal-checkout-receipt-v1';
export function readBridalCheckoutReceipt(): BridalCheckoutReceipt | null {
  try {
    const value = JSON.parse(sessionStorage.getItem(RECEIPT_KEY) || 'null');
    if (value && /^order_[A-Za-z0-9]+$/.test(value.proof?.razorpay_order_id) && /^pay_[A-Za-z0-9]+$/.test(value.proof?.razorpay_payment_id) && /^[a-f0-9]{64}$/i.test(value.proof?.razorpay_signature) && [200000, 300000, 400000].includes(value.amount)) return { proof: value.proof, amount: value.amount, verified: false };
  } catch { /* Storage may be unavailable. */ }
  return null;
}
export function storeBridalCheckoutReceipt(receipt: BridalCheckoutReceipt): void {
  try { sessionStorage.setItem(RECEIPT_KEY, JSON.stringify(receipt)); } catch { /* Keep the receipt in component state. */ }
}
export async function createBridalCheckout(booking: BridalEnquiry): Promise<BridalCheckoutOrder> {
  if (Object.keys(validateBridalEnquiry(booking)).length) throw new Error('Please check your booking details before paying.');
  let data: Record<string, unknown>;
  try {
    data = await postWorkshopAction({ action: 'create_bridal_checkout', booking, availabilityConfirmed: true, detailsSent: true }, BRIDAL_AVAILABILITY_API_URL);
  } catch (error) {
    if (error instanceof WorkshopApiError && error.diagnostics.code === 'UNKNOWN_ACTION') throw new Error('Secure checkout is temporarily unavailable. Please contact SK Bridal Studio. Payment has not started.');
    throw error;
  }
  if (data.ok !== true || typeof data.orderId !== 'string' || !/^order_[A-Za-z0-9]+$/.test(data.orderId) || typeof data.keyId !== 'string' || !/^rzp_(test|live)_[A-Za-z0-9]+$/.test(data.keyId) || data.amount !== bridalAdvanceTotal(booking) * 100 || data.currency !== 'INR') throw new Error('The payment order could not be confirmed. Checkout was not opened.');
  return data as unknown as BridalCheckoutOrder;
}
export async function verifyBridalCheckout(receipt: BridalCheckoutReceipt): Promise<void> {
  const { proof } = receipt;
  const data = await postWorkshopAction({ action: 'verify_bridal_checkout', orderId: proof.razorpay_order_id, paymentId: proof.razorpay_payment_id, signature: proof.razorpay_signature }, BRIDAL_AVAILABILITY_API_URL);
  if (data.ok !== true || data.verified !== true || data.amount !== receipt.amount || data.currency !== 'INR' || data.orderId !== proof.razorpay_order_id || data.paymentId !== proof.razorpay_payment_id) throw new Error('Payment verification is pending. Do not pay again; retry verification or contact SK Bridal Studio.');
}

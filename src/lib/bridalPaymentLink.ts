import { postWorkshopAction, WorkshopApiError } from './workshopPayment';
import { BRIDAL_AVAILABILITY_API_URL } from './bridalAvailability';
import { bridalAdvanceTotal, validateBridalEnquiry, type BridalEnquiry } from './bridalEnquiry';

export interface BridalPaymentLink { id: string; url: string; amount: number; currency: 'INR' }
export async function createBridalPaymentLink(booking: BridalEnquiry): Promise<BridalPaymentLink> {
  if (Object.keys(validateBridalEnquiry(booking)).length) throw new Error('Please check your booking details before paying.');
  let data: Record<string, unknown>;
  try {
    data = await postWorkshopAction({ action: 'create_bridal_payment_link', booking, availabilityConfirmed: true, detailsSent: true }, BRIDAL_AVAILABILITY_API_URL);
  } catch (error) {
    if (error instanceof WorkshopApiError && error.diagnostics.code === 'UNKNOWN_ACTION') throw new Error('The payment link connection needs an update. Contact SK Bridal Studio; payment has not started.');
    throw error;
  }
  if (data.ok !== true || typeof data.paymentLinkId !== 'string' || !/^plink_[A-Za-z0-9]+$/.test(data.paymentLinkId) || data.amount !== bridalAdvanceTotal(booking) * 100 || data.currency !== 'INR' || data.status !== 'created' || data.amountPreset !== true || typeof data.url !== 'string') throw new Error('The payment provider did not confirm the selected advance. Payment was not opened.');
  const url = new URL(data.url);
  if (url.protocol !== 'https:' || !['rzp.io', 'rzp.pay'].includes(url.hostname) || url.username || url.password || url.port) throw new Error('The payment provider returned an invalid link. Payment was not opened.');
  return { id: data.paymentLinkId, url: url.href, amount: data.amount, currency: 'INR' };
}

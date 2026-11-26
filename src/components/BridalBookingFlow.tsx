import { useState } from 'react';
import BridalAvailability from './BridalAvailability';
import BridalAdvancePayment from './BridalAdvancePayment';
import { readBridalCheckoutReceipt } from '../lib/bridalCheckout';
import type { BridalEnquiry } from '../lib/bridalEnquiry';

export interface BridalBookingStart { days: BridalEnquiry['days']; venue: string; revision: number }
export default function BridalBookingFlow() {
  const [start, setStart] = useState<BridalBookingStart>();
  const [openAvailability, setOpenAvailability] = useState(0);
  const [hasReceipt, setHasReceipt] = useState(() => {
    try { return Boolean(readBridalCheckoutReceipt() || sessionStorage.getItem('sk-bridal-payment-receipt-v1')); }
    catch { return false; }
  });
  return <>
    {!hasReceipt && <BridalAvailability bookingFlow openRequest={openAvailability} onContinue={selection => {
      if (selection) setStart(previous => ({ ...selection, revision: (previous?.revision || 0) + 1 }));
    }} />}
    <BridalAdvancePayment availabilityConfirmed={Boolean(start)} bookingStart={start} hideTrigger={!hasReceipt} onReceipt={() => setHasReceipt(true)} onChangeDates={() => setOpenAvailability(value => value + 1)} />
    {!hasReceipt && <p className="mt-3 font-inter text-xs leading-relaxed text-sand/90">Check availability → Add details → Send on WhatsApp → Pay</p>}
  </>;
}

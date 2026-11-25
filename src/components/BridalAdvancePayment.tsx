import { useEffect, useRef, useState } from 'react';
import { Lock, Loader2, X, CheckCircle2 } from 'lucide-react';
import { BRIDAL_SESSIONS, createBridalOrder, verifyBridalPayment, type BridalBooking } from '../lib/bridalPayment';
import { loadCheckout, normalizePhone, type PaymentProof } from '../lib/workshopPayment';
import BridalBookingEnquiry from './BridalBookingEnquiry';

const RECEIPT_KEY = 'sk-bridal-payment-receipt-v1';
const REQUEST_KEY = 'sk-bridal-payment-request-v1';
function readReceipt(): { proof: PaymentProof; verified: boolean } | null {
  try {
    const data = JSON.parse(sessionStorage.getItem(RECEIPT_KEY) || 'null');
    if (data && /^order_[A-Za-z0-9]+$/.test(data.proof?.razorpay_order_id) && /^pay_[A-Za-z0-9]+$/.test(data.proof?.razorpay_payment_id) && /^[a-f0-9]{64}$/i.test(data.proof?.razorpay_signature)) return { proof: data.proof, verified: data.verified === true };
  } catch { /* No recovery receipt. */ }
  return null;
}

export { BRIDAL_PAYMENT_URL } from '../lib/bridalEnquiry';

export default function BridalAdvancePayment({ availabilityConfirmed }: { availabilityConfirmed: boolean }) {
  // Retain verification-only recovery for any previously captured API payment.
  const [hasPreviousReceipt] = useState(() => Boolean(readReceipt()));
  if (hasPreviousReceipt) return <PreviousBridalPayment availabilityConfirmed={availabilityConfirmed} />;
  return <BridalBookingEnquiry availabilityConfirmed={availabilityConfirmed} />;
}

function PreviousBridalPayment({ availabilityConfirmed }: { availabilityConfirmed: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const busy = useRef(false);
  const mounted = useRef(true);
  const [receipt, setReceipt] = useState(readReceipt);
  const [booking, setBooking] = useState<BridalBooking>({ name: '', email: '', phone: '', eventDate: '', session: 'Muhurtham' });
  const [stage, setStage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => { mounted.current = true; return () => { mounted.current = false; }; }, []);
  const reopen = () => { if (mounted.current && !dialog.current?.open) dialog.current?.showModal(); };

  const verify = async (proof: PaymentProof) => {
    setStage('Verifying payment…');
    try {
      await verifyBridalPayment(proof);
      try { sessionStorage.setItem(RECEIPT_KEY, JSON.stringify({ proof, verified: true })); } catch { /* In-memory receipt remains. */ }
      if (mounted.current) { setReceipt({ proof, verified: true }); setError(''); }
    } catch (failure) {
      if (mounted.current) setError(failure instanceof Error ? failure.message : 'Unable to verify payment. Do not pay again; retry verification.');
    } finally {
      busy.current = false;
      if (mounted.current) setStage('');
    }
  };

  const pay = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy.current || receipt || !availabilityConfirmed) return;
    busy.current = true; setError(''); setStage('Preparing secure checkout…');
    let settled = false;
    try {
      const submitted = { ...booking, name: booking.name.trim(), email: booking.email.trim().toLowerCase(), phone: `91${normalizePhone(booking.phone)}` };
      const fingerprint = JSON.stringify(submitted);
      const previous = JSON.parse(sessionStorage.getItem(REQUEST_KEY) || 'null');
      const requestId = previous?.fingerprint === fingerprint ? previous.requestId : crypto.randomUUID();
      // Keep the reference before sending: a lost response can retry the same order.
      sessionStorage.setItem(REQUEST_KEY, JSON.stringify({ fingerprint, requestId }));
      await loadCheckout();
      const order = await createBridalOrder(submitted, requestId);
      if (!mounted.current) { busy.current = false; return; }
      if (!window.Razorpay) throw new Error('Razorpay checkout could not load. Please try again.');
      const checkout = new window.Razorpay({
        key: order.keyId, order_id: order.orderId, amount: order.amount, currency: order.currency,
        name: 'SK Bridal Studio', description: `Bridal advance · ${submitted.eventDate} · ${submitted.session}`,
        prefill: { name: submitted.name, email: submitted.email, contact: submitted.phone },
        theme: { color: '#3B261E' }, redirect: false, retry: { enabled: false },
        modal: { handleback: false, ondismiss: () => {
          if (settled) return; settled = true; busy.current = false;
          if (mounted.current) { setStage(''); setError('Checkout closed. If you were charged, contact SK Bridal Studio before trying again.'); reopen(); }
        } },
        handler: proof => {
          if (settled) return; settled = true;
          // Keep the actual signed Razorpay receipt for verification-only retries.
          try { sessionStorage.setItem(RECEIPT_KEY, JSON.stringify({ proof, verified: false })); } catch { /* Keep receipt in component state. */ }
          checkout.close();
          if (mounted.current) { setReceipt({ proof, verified: false }); reopen(); }
          if (proof.razorpay_order_id !== order.orderId) {
            busy.current = false;
            if (mounted.current) { setStage(''); setError('The returned payment order does not match this booking. Contact SK Bridal Studio and do not pay again.'); }
            return;
          }
          void verify(proof);
        },
      });
      checkout.on('payment.failed', () => {
        if (settled) return; settled = true; checkout.close(); busy.current = false;
        if (mounted.current) { setStage(''); setError('Payment was not confirmed. If charged, contact SK Bridal Studio before retrying.'); reopen(); }
      });
      dialog.current?.close();
      setStage('Payment window open…');
      checkout.open();
    } catch (failure) {
      settled = true; busy.current = false;
      if (mounted.current) { setStage(''); setError(failure instanceof Error ? failure.message : 'Unable to start payment. Please contact SK Bridal Studio.'); reopen(); }
    }
  };

  const field = 'field min-w-0 min-h-11 !py-2 text-base';
  const label = 'mb-1 block text-sm font-medium text-cocoa';
  return (
    <>
      <button data-bridal-booking-trigger type="button" disabled={Boolean(stage) || (!availabilityConfirmed && !receipt)} onClick={reopen} className="btn-light mt-3 w-full !whitespace-normal text-center">
        {stage ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" /> : <Lock className="h-4 w-4 shrink-0" />}
        {receipt?.verified ? 'View Payment Receipt' : receipt ? 'Retry Payment Verification' : 'Pay ₹2,000 Advance'}
      </button>
      <p className="mt-3 font-inter text-xs leading-relaxed text-sand/90">Contact us to confirm your date first. Secure checkout powered by Razorpay.</p>
      <dialog ref={dialog} onCancel={event => { if (busy.current) event.preventDefault(); }} className="m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-2xl overflow-y-auto rounded-2xl border border-sand bg-ivory p-4 text-left text-chocolate shadow-luxe backdrop:bg-chocolate/60 sm:w-[calc(100%-3rem)] sm:p-6">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-cocoa">Bridal booking advance</p><h3 className="mt-1 font-playfair text-2xl">{receipt?.verified ? 'Payment verified' : 'Reserve your session'}</h3></div>
          <button type="button" disabled={Boolean(stage)} onClick={() => dialog.current?.close()} aria-label="Close payment form" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-beige disabled:opacity-40"><X className="h-5 w-5" /></button>
        </div>
        {receipt ? (
          <div className="space-y-4 font-inter text-sm leading-relaxed">
            {receipt.verified && <CheckCircle2 aria-hidden="true" className="h-10 w-10 text-sage" />}
            <p>{receipt.verified ? 'Your ₹2,000 advance is verified. SK Bridal Studio will send your final booking confirmation.' : 'Your payment needs verification. Do not pay again; retry verification below.'}</p>
            <p className="break-all rounded-lg bg-beige p-3">Payment ID: {receipt.proof.razorpay_payment_id}</p>
            {!receipt.verified && <button type="button" disabled={Boolean(stage)} className="btn-primary w-full" onClick={() => { if (!busy.current) { busy.current = true; setError(''); void verify(receipt.proof); } }}>Retry Verification</button>}
          </div>
        ) : (
          <form onSubmit={pay} className="space-y-3 font-inter">
            <p className="rounded-lg border border-sand/70 bg-beige/60 px-3 py-2 text-sm leading-relaxed text-ink"><span className="font-semibold text-chocolate">₹2,000 per session</span> · Non-refundable<br />Use the date and session confirmed with us.</p>
            <fieldset disabled={Boolean(stage)} className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 [&>div]:min-w-0">
              <div><label className={label} htmlFor="bridal-name">Your name</label><input className={field} id="bridal-name" required maxLength={100} autoComplete="name" value={booking.name} onChange={event => setBooking({ ...booking, name: event.target.value })} /></div>
              <div><label className={label} htmlFor="bridal-email">Email</label><input className={field} id="bridal-email" type="email" required maxLength={150} autoComplete="email" value={booking.email} onChange={event => setBooking({ ...booking, email: event.target.value })} /></div>
              <div className="sm:col-span-2"><label className={label} htmlFor="bridal-phone">WhatsApp number (+91)</label><input className={field} id="bridal-phone" type="tel" inputMode="numeric" pattern="[6-9][0-9]{9}" required maxLength={10} autoComplete="tel-national" value={booking.phone} onChange={event => setBooking({ ...booking, phone: normalizePhone(event.target.value) })} /></div>
              <div className="grid grid-cols-2 gap-3 sm:col-span-2">
                <div className="min-w-0"><label className={label} htmlFor="bridal-date">Event date</label><input className={`${field} min-w-0`} id="bridal-date" type="date" required value={booking.eventDate} onChange={event => setBooking({ ...booking, eventDate: event.target.value })} /></div>
                <div className="min-w-0"><label className={label} htmlFor="bridal-session">Session</label><select className={field} id="bridal-session" value={booking.session} onChange={event => setBooking({ ...booking, session: event.target.value })}>{BRIDAL_SESSIONS.map(session => <option key={session}>{session}</option>)}</select></div>
              </div>
              <button type="submit" className="btn-primary min-h-11 w-full !whitespace-normal !py-3 sm:col-span-2"><Lock className="h-4 w-4 shrink-0" />Pay ₹2,000 with Razorpay</button>
            </fieldset>
          </form>
        )}
        {stage && <p role="status" className="mt-4 text-sm text-cocoa">{stage}</p>}
        {error && <p role="alert" className="mt-4 rounded-lg border border-clay/30 bg-blush/30 p-3 text-sm leading-relaxed text-red-800">{error}</p>}
      </dialog>
    </>
  );
}

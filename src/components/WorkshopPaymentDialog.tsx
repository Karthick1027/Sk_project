import { useEffect, useRef } from 'react';
import { AlertCircle, Check, X } from 'lucide-react';
import './WorkshopPaymentDialog.css';
import { formatPaymentAmount } from '../lib/workshopPayment';

export type PaymentResult = 'success' | 'failure' | 'cancelled' | 'gateway-unavailable' | 'verification-failure' | 'saving-failure' | 'review-required';
interface Props {
  result: PaymentResult;
  detail?: string;
  course: string;
  amount: number;
  pending: boolean;
  onClose: () => void;
  onRetry: () => void;
}

export default function WorkshopPaymentDialog({ result, detail, course, amount, pending, onClose, onRetry }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const success = result === 'success';
  const cancelled = result === 'cancelled';
  const gatewayUnavailable = result === 'gateway-unavailable';
  const reviewRequired = result === 'review-required';
  const savingFailed = result === 'saving-failure';
  useEffect(() => {
    const element = dialog.current;
    const previousFocus = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    element?.showModal();
    return () => { element?.close(); document.body.style.overflow = overflow; previousFocus?.focus(); };
  }, []);

  return (
    <dialog ref={dialog} aria-labelledby="payment-result-title" aria-describedby="payment-result-description" onCancel={(event) => { event.preventDefault(); onClose(); }} className="workshop-payment-dialog w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-3xl border border-champagne bg-ivory p-6 text-center text-chocolate shadow-luxe sm:p-8">
      <button type="button" onClick={onClose} aria-label="Close payment message" className="absolute right-3 top-3 rounded-full p-2 text-cocoa focus-visible:outline focus-visible:outline-2 focus-visible:outline-cocoa"><X className="h-5 w-5" /></button>
      {success && <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl" aria-hidden="true">{Array.from({ length: 16 }, (_, index) => <i key={index} className="workshop-confetti" style={{ left: `${5 + index * 6}%`, animationDelay: `${(index % 5) * 0.12}s`, backgroundColor: ['#C8AA7F', '#6B4939', '#DCC9A8'][index % 3] }} />)}</div>}
      <div className={`workshop-result-icon mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full border ${success ? 'border-champagne bg-beige text-cocoa' : 'border-amber-300 bg-amber-50 text-amber-800'}`}>
        {success ? <Check className="workshop-check h-10 w-10" strokeWidth={2} /> : <AlertCircle className="h-10 w-10" />}
      </div>
      <h2 id="payment-result-title" className="font-playfair text-3xl">{success ? 'Payment Verified' : savingFailed ? 'Registration Update Not Confirmed' : reviewRequired ? 'Payment Needs Review' : result === 'verification-failure' ? 'Payment Verification Pending' : cancelled ? 'Payment Cancelled' : gatewayUnavailable ? 'Unable to Open Payment' : 'Payment Not Completed'}</h2>
      <p id="payment-result-description" className="mt-4 text-sm leading-relaxed text-cocoa">
        {success ? `Your ${formatPaymentAmount(amount)} advance payment has been verified and your registration is confirmed.` : savingFailed ? 'Your payment was captured, but the registration update could not be confirmed. Contact SK Bridal Studio with your payment ID. Do not pay again. You can retry verification below.' : reviewRequired ? 'Your earlier payment needs review by SK Bridal Studio. Contact us with your payment ID and do not pay again.' : result === 'verification-failure' ? 'Your payment has not been confirmed yet. If you were charged, do not pay again. Retry verification below or contact SK Bridal Studio.' : cancelled ? 'Your registration details are saved and remain Pending. Checkout was closed. If you were charged, contact SK Bridal Studio before trying again.' : gatewayUnavailable ? 'The payment window did not open. Your form details have been kept so you can try again.' : 'Your registration details are saved and remain Pending. If you were charged, contact SK Bridal Studio before trying again.'}
      </p>
      {!success && !cancelled && detail && <p role="alert" className="mt-3 break-words text-sm leading-relaxed text-red-800">{detail}</p>}
      {success ? <>
        <p className="mt-3 text-sm text-cocoa">Your seat at SK Bridal Studio is confirmed.</p>
        <dl className="my-6 space-y-3 rounded-xl border border-champagne bg-beige p-4 text-left text-sm">
          <div><dt className="text-mocha">Selected course</dt><dd className="mt-1 break-words font-semibold">{course}</dd></div>
          <div className="flex justify-between gap-3"><dt>Advance paid</dt><dd className="font-semibold">{formatPaymentAmount(amount)}</dd></div>
          <div className="flex justify-between gap-3"><dt>Payment status</dt><dd className="font-semibold">Verified</dd></div>
        </dl>
      </> : pending && <p className="mt-3 text-sm leading-relaxed text-cocoa">Keep your payment receipt. Retrying verification does not create another payment. Contact SK Bridal Studio if confirmation remains unavailable.</p>}
      <div className="relative mt-6 flex flex-col gap-3">
        {success ? <button type="button" className="btn-primary w-full !whitespace-normal" onClick={onClose}>Continue to Workshop</button> : <>
          {!reviewRequired && <button type="button" className="btn-primary w-full" onClick={onRetry}>{pending ? 'Retry Verification' : 'Try Again'}</button>}
          <button type="button" className="btn-outline w-full" onClick={onClose}>Close</button>
        </>}
      </div>
    </dialog>
  );
}

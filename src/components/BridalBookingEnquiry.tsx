import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Check, ExternalLink, Lock, MessageCircle, X } from 'lucide-react';
import { BRIDAL_ENQUIRY_SESSIONS, BRIDAL_DAY_ADVANCES, bridalPaymentDestination, bridalAdvanceTotal, bridalDayField, buildBridalEnquiryUrl, validateBridalEnquiry, type BridalEnquiry, type BridalDay } from '../lib/bridalEnquiry';
import { normalizePhone } from '../lib/workshopPayment';
import WorkshopDropdown from './WorkshopDropdown';
import BridalDatePicker from './BridalDatePicker';
import './BridalBookingEnquiry.css';

export default function BridalBookingEnquiry({ availabilityConfirmed }: { availabilityConfirmed: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [details, setDetails] = useState<BridalEnquiry>({ name: '', email: '', phone: '', days: [{ eventDate: '', session: 'Muhurtham' }], venue: '' });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [whatsappUrl, setWhatsappUrl] = useState('');
  const [sentDetails, setSentDetails] = useState(false);
  const [handoffError, setHandoffError] = useState('');
  useEffect(() => {
    if (!availabilityConfirmed) { setSentDetails(false); dialog.current?.close(); }
  }, [availabilityConfirmed]);
  const total = bridalAdvanceTotal(details);
  const formattedTotal = `₹${total.toLocaleString('en-IN')}`;
  let payment: { url: string; amountPreset: boolean } | null = null;
  try {
    payment = bridalPaymentDestination(details);
  } catch { /* Keep payment disabled if a configured URL is invalid. */ }
  const update = (field: Exclude<keyof BridalEnquiry, 'days'>, value: string) => {
    setDetails(previous => ({ ...previous, [field]: value }));
    setErrors(previous => ({ ...previous, [field]: undefined }));
    setWhatsappUrl(''); setSentDetails(false);
  };
  const changeDays = (count: number) => {
    if (![1, 2, 3].includes(count)) return;
    setDetails(previous => ({ ...previous, days: Array.from({ length: count }, (_, index) => previous.days[index] || { eventDate: '', session: 'Muhurtham' }) }));
    setErrors({}); setWhatsappUrl(''); setSentDetails(false);
  };
  const updateDay = (index: number, field: keyof BridalDay, value: string) => {
    setDetails(previous => ({ ...previous, days: previous.days.map((day, dayIndex) => dayIndex === index ? { ...day, [field]: value } : day) }));
    setErrors(previous => ({ ...previous, [bridalDayField(index, field)]: undefined }));
    setWhatsappUrl(''); setSentDetails(false);
  };
  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!availabilityConfirmed) return;
    const invalid = validateBridalEnquiry(details);
    setErrors(invalid);
    const first = Object.keys(invalid)[0];
    if (first) { document.getElementById(`booking-${first}`)?.focus(); return; }
    const url = buildBridalEnquiryUrl(details);
    setWhatsappUrl(url); setSentDetails(false); setHandoffError('');
    // User submits the form; WhatsApp still requires them to tap Send.
    try { window.open(url, '_blank', 'noopener,noreferrer'); }
    catch { setHandoffError('Use Open WhatsApp below to send your details.'); }
  };
  const fieldClass = 'field min-h-11 min-w-0 !py-2 text-base';
  const labelClass = 'mb-1 block text-[13px] font-medium text-cocoa';
  const fieldProps = (field: string) => ({ id: `booking-${field}`, name: field, 'aria-invalid': Boolean(errors[field]), 'aria-describedby': errors[field] ? `booking-${field}-error` : undefined });
  const fieldError = (field: string) => errors[field] && <p id={`booking-${field}-error`} className="mt-1 text-sm text-red-700">{errors[field]}</p>;
  return (
    <>
      <button data-bridal-booking-trigger type="button" disabled={!availabilityConfirmed} aria-describedby="bridal-enquiry-help" onClick={() => dialog.current?.showModal()} className="btn-light mt-3 w-full !whitespace-normal text-center hover:!translate-y-0"><Lock aria-hidden="true" className="h-4 w-4 shrink-0" />Details &amp; Pay</button>
      <p id="bridal-enquiry-help" className="mt-3 font-inter text-xs leading-relaxed text-sand/90">{availabilityConfirmed ? 'Choose 1–3 days, send your details on WhatsApp, then pay the total advance on Razorpay.' : 'Confirm your date with us first to enable payment.'}</p>
      <dialog ref={dialog} aria-labelledby="bridal-enquiry-title" className="bridal-booking-dialog m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-2xl overflow-y-auto rounded-2xl border border-sand bg-ivory p-4 text-left text-chocolate shadow-luxe backdrop:bg-chocolate/60">
        <div className="sticky -top-4 z-30 -mx-4 -mt-4 mb-3 flex items-start justify-between gap-2 border-b border-sand bg-ivory px-4 py-3">
          <div className="min-w-0"><p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-cocoa">Bridal booking advance</p><h3 id="bridal-enquiry-title" className="mt-1 font-playfair text-xl">{whatsappUrl ? 'Send details, then pay' : 'Reserve your session'}</h3></div>
          <div className="flex shrink-0 items-center gap-1">
            {whatsappUrl && <button type="button" aria-label="Edit booking details" className="flex min-h-11 items-center gap-1.5 rounded-lg px-2 font-inter text-sm text-cocoa hover:bg-beige focus-visible:outline focus-visible:outline-2 focus-visible:outline-cocoa" onClick={() => { setWhatsappUrl(''); setSentDetails(false); }}><ArrowLeft aria-hidden="true" className="h-4 w-4" />Back</button>}
            <button type="button" aria-label="Close booking form" onClick={() => dialog.current?.close()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-beige focus-visible:outline focus-visible:outline-2 focus-visible:outline-cocoa"><X className="h-5 w-5" /></button>
          </div>
        </div>
        <div className="mb-2.5 grid grid-cols-2 gap-2 font-inter text-[13px]">
          <span className={`rounded-lg border px-2.5 py-1.5 ${whatsappUrl ? 'border-sand text-cocoa' : 'border-champagne bg-beige font-semibold'}`}>1. Booking details</span>
          <span className={`rounded-lg border px-2.5 py-1.5 ${whatsappUrl ? 'border-champagne bg-beige font-semibold' : 'border-sand text-cocoa'}`}>2. WhatsApp & payment</span>
        </div>
        {!whatsappUrl ? (
          <form onSubmit={submit} noValidate className="space-y-2.5 font-inter">
            <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-sand/70 bg-beige/60 px-2.5 py-1.5 text-[13px] text-ink"><span>Non-refundable advance</span><strong aria-live="polite" className="text-sm text-chocolate">Total advance: {formattedTotal}</strong></div>
            <div className="grid min-w-0 grid-cols-1 gap-2.5 sm:grid-cols-2 [&>div]:min-w-0">
              <div><label htmlFor="booking-name" className={labelClass}>Your name *</label><input {...fieldProps('name')} required maxLength={100} autoComplete="name" className={fieldClass} value={details.name} onChange={event => update('name', event.target.value)} />{fieldError('name')}</div>
              <div><label htmlFor="booking-email" className={labelClass}>Email *</label><input {...fieldProps('email')} type="email" required maxLength={150} autoComplete="email" className={fieldClass} value={details.email} onChange={event => update('email', event.target.value)} />{fieldError('email')}</div>
              <div><label htmlFor="booking-phone" className={labelClass}>WhatsApp number (+91) *</label><input {...fieldProps('phone')} type="tel" inputMode="numeric" required maxLength={10} autoComplete="tel-national" className={fieldClass} value={details.phone} onChange={event => update('phone', normalizePhone(event.target.value))} />{fieldError('phone')}</div>
              <div><label htmlFor="booking-venue" className={labelClass}>Venue / city <span className="font-normal">(optional)</span></label><input {...fieldProps('venue')} maxLength={200} className={fieldClass} value={details.venue} onChange={event => update('venue', event.target.value)} />{fieldError('venue')}</div>
              <div className="rounded-xl border border-sand bg-beige/40 p-2.5 sm:col-span-2"><label id="booking-days-label" htmlFor="booking-days" className={labelClass}>Number of days *</label><WorkshopDropdown {...fieldProps('days')} inlineMenu value={String(details.days.length)} onChange={value => changeDays(Number(value))} options={[1, 2, 3].map(count => ({ value: String(count), label: `${count} ${count === 1 ? 'day' : 'days'} · ₹${BRIDAL_DAY_ADVANCES[count].toLocaleString('en-IN')} advance` }))} />{fieldError('days')}</div>
              {details.days.map((day, index) => (
                <fieldset key={index} className="min-w-0 rounded-xl border border-sand px-2.5 pb-2.5 pt-1 sm:col-span-2">
                  <legend className="px-1 text-[13px] font-semibold text-cocoa">Day {index + 1}</legend>
                  <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 [&>div]:min-w-0">
                    <div><label htmlFor={`booking-${bridalDayField(index, 'eventDate')}`} className={labelClass}>Event date *</label><BridalDatePicker {...fieldProps(bridalDayField(index, 'eventDate'))} value={day.eventDate} onChange={value => updateDay(index, 'eventDate', value)} />{fieldError(bridalDayField(index, 'eventDate'))}</div>
                    <div><label id={`booking-${bridalDayField(index, 'session')}-label`} htmlFor={`booking-${bridalDayField(index, 'session')}`} className={labelClass}>Session *</label><WorkshopDropdown {...fieldProps(bridalDayField(index, 'session'))} inlineMenu value={day.session} onChange={value => updateDay(index, 'session', value)} options={BRIDAL_ENQUIRY_SESSIONS.map(session => ({ value: session, label: session }))} />{fieldError(bridalDayField(index, 'session'))}</div>
                  </div>
                </fieldset>
              ))}
            </div>
            <button type="submit" className="btn-primary min-h-11 w-full !whitespace-normal !py-3"><MessageCircle aria-hidden="true" className="h-4 w-4 shrink-0" />Send Details on WhatsApp</button>
            <p className="text-center text-xs leading-relaxed text-cocoa">Opens WhatsApp with your details. Tap Send to share them with SK Bridal Studio.</p>
          </form>
        ) : (
          <div className="space-y-4 font-inter text-sm leading-relaxed">
            <div className="rounded-xl border border-sand bg-beige/60 p-3">
              <p className="font-semibold text-chocolate">Tap Send in WhatsApp</p>
              <p className="mt-1 text-cocoa">Your details are prepared for +91 86680 38093. After sending, return here to continue with payment.</p>
              <div className="mt-3 space-y-1 break-words border-t border-sand pt-3 text-cocoa"><p className="font-medium">{details.name.trim()} · {details.days.length} {details.days.length === 1 ? 'day' : 'days'}</p>{details.days.map((day, index) => <p key={index}>Day {index + 1}: {day.eventDate.split('-').reverse().join('/')} · {day.session}</p>)}<p className="pt-1 font-semibold text-chocolate">Total advance: {formattedTotal}</p></div>
            </div>
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-outline w-full !whitespace-normal !py-3"><MessageCircle aria-hidden="true" className="h-4 w-4 shrink-0" />Open WhatsApp Again</a>
            {handoffError && <p role="alert" className="text-red-700">{handoffError}</p>}
            <label htmlFor="booking-details-sent" className="flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-sand p-3 text-cocoa"><input id="booking-details-sent" type="checkbox" checked={sentDetails} onChange={event => setSentDetails(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-chocolate" /><span>I have sent my booking details on WhatsApp.</span></label>
            {sentDetails && payment ? <a data-bridal-payment-link href={payment.url} target="_blank" rel="noopener noreferrer" className="btn-primary w-full !whitespace-normal !py-3"><ExternalLink aria-hidden="true" className="h-4 w-4 shrink-0" />Pay</a> : <button type="button" disabled className="btn-primary w-full !whitespace-normal !py-3"><Lock aria-hidden="true" className="h-4 w-4 shrink-0" />Pay</button>}
            <p className="flex items-start gap-2 text-cocoa"><Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" /><span>{payment === null ? 'Payment is temporarily unavailable. Contact SK Bridal Studio.' : <>Enter <strong className="text-chocolate">{total}</strong> as the amount on Razorpay.</>} After paying, send the receipt in the same WhatsApp chat. We will verify it and confirm your booking.</span></p>
          </div>
        )}
      </dialog>
    </>
  );
}

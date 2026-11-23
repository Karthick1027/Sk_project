import { useRef, useState, type FormEvent } from 'react';
import { MessageCircle, Plus, X } from 'lucide-react';
import { BRIDAL_ENQUIRY_SESSIONS, BRIDAL_WHATSAPP_NUMBER, type BridalDay } from '../lib/bridalEnquiry';
import BridalDatePicker from './BridalDatePicker';
import WorkshopDropdown from './WorkshopDropdown';
import './BridalBookingEnquiry.css';

export default function BridalAvailability() {
  const dialog = useRef<HTMLDialogElement>(null);
  const [events, setEvents] = useState<BridalDay[]>([{ eventDate: '', session: 'Muhurtham' }]);
  const [venue, setVenue] = useState('');
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [preparedUrl, setPreparedUrl] = useState('');
  const update = (index: number, field: keyof BridalDay, value: string) => {
    setEvents(previous => previous.map((event, i) => i === index ? { ...event, [field]: value } : event));
    setErrors(previous => ({ ...previous, [index]: '' }));
    setPreparedUrl('');
  };
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const invalid: Record<number, string> = {};
    events.forEach((entry, index) => {
      const date = new Date(entry.eventDate + 'T12:00:00Z');
      if (!/^\d{4}-\d{2}-\d{2}$/.test(entry.eventDate) || !Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== entry.eventDate) invalid[index] = 'Choose your event date.';
    });
    setErrors(invalid);
    if (Object.keys(invalid).length) {
      document.getElementById(`availability-date-${Object.keys(invalid)[0]}`)?.focus();
      return;
    }
    const message = [
      'Hi *SK Bridal Studio* ! Please confirm availability for my events:',
      ...events.map((entry, index) => `*Event ${index + 1}* : ${entry.eventDate.split('-').reverse().join('/')} - ${entry.session}`),
      ...(venue.trim() ? [`*Venue / city* : ${venue.trim()}`] : []),
      'Please let me know if these dates and sessions are available before I proceed with booking.',
    ].join('\n');
    const url = `https://wa.me/${BRIDAL_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    setPreparedUrl(url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return <>
    <button data-bridal-availability-trigger type="button" onClick={() => dialog.current?.showModal()} className="btn-light w-full !whitespace-normal text-center hover:!translate-y-0">
      <MessageCircle className="h-4 w-4" />Check Date Availability
    </button>
    <dialog ref={dialog} aria-labelledby="availability-title" className="bridal-booking-dialog m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-lg overflow-y-auto rounded-2xl border border-sand bg-ivory p-4 text-left text-chocolate shadow-luxe backdrop:bg-chocolate/60">
      <div className="sticky -top-4 z-30 -mx-4 -mt-4 mb-4 flex items-start justify-between gap-3 border-b border-sand bg-ivory px-4 py-3">
        <div><h2 id="availability-title" className="font-playfair text-xl">Check Date Availability</h2><p className="mt-1 font-inter text-sm text-cocoa">Share your event dates and sessions on WhatsApp.</p></div>
        <button type="button" aria-label="Close availability form" onClick={() => dialog.current?.close()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-beige focus-visible:outline focus-visible:outline-2 focus-visible:outline-cocoa"><X className="h-5 w-5" /></button>
      </div>
      <form onSubmit={submit} noValidate className="space-y-4 font-inter">
        {events.map((entry, index) => <div key={index} role="group" aria-labelledby={`availability-event-${index}`} className="relative min-w-0 rounded-xl border border-sand p-3 pt-5">
          <h3 id={`availability-event-${index}`} className="absolute -top-2.5 left-2 bg-ivory px-2 text-sm font-semibold text-cocoa">Event {index + 1}</h3>
          {events.length > 1 && <button type="button" className="absolute -right-1 -top-3 flex h-6 w-6 items-center justify-center rounded-full border border-chocolate bg-chocolate text-ivory hover:bg-cocoa focus-visible:outline focus-visible:outline-2 focus-visible:outline-cocoa" aria-label={`Remove event ${index + 1}`} title={`Remove event ${index + 1}`} onClick={() => { setEvents(previous => previous.filter((_, i) => i !== index)); setErrors({}); setPreparedUrl(''); }}><X aria-hidden="true" className="h-3 w-3" /></button>}
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 [&>div]:min-w-0">
            <div><label htmlFor={`availability-date-${index}`} className="mb-1 block text-sm text-cocoa">Event date *</label><BridalDatePicker id={`availability-date-${index}`} name={`availability-date-${index}`} value={entry.eventDate} onChange={value => update(index, 'eventDate', value)} aria-invalid={Boolean(errors[index])} aria-describedby={errors[index] ? `availability-error-${index}` : undefined} />{errors[index] && <p id={`availability-error-${index}`} role="alert" className="mt-1 text-sm text-red-700">{errors[index]}</p>}</div>
            <div><label id={`availability-session-${index}-label`} htmlFor={`availability-session-${index}`} className="mb-1 block text-sm text-cocoa">Session *</label><WorkshopDropdown id={`availability-session-${index}`} name={`availability-session-${index}`} inlineMenu value={entry.session} onChange={value => update(index, 'session', value)} options={BRIDAL_ENQUIRY_SESSIONS.map(session => ({ value: session, label: session }))} /></div>
          </div>
        </div>)}
        {events.length < 3 && <button type="button" className="flex min-h-11 items-center gap-2 rounded-lg border border-sand px-3 py-2 text-sm text-cocoa transition-colors hover:border-champagne hover:bg-beige focus-visible:outline focus-visible:outline-2 focus-visible:outline-cocoa" onClick={() => { setEvents(previous => [...previous, { eventDate: '', session: 'Reception' }]); setPreparedUrl(''); }}><Plus className="h-4 w-4" />Add another event</button>}
        <div><label htmlFor="availability-venue" className="mb-1 block text-sm text-cocoa">Venue / city (optional)</label><input id="availability-venue" name="venue" className="field" maxLength={200} value={venue} onChange={event => { setVenue(event.target.value); setPreparedUrl(''); }} placeholder="Event location" /></div>
        <button type="submit" className="btn-primary w-full !whitespace-normal"><MessageCircle className="h-4 w-4" />Send Dates on WhatsApp</button>
        <p className="text-center text-sm text-cocoa">Tap Send in WhatsApp. Wait for our availability confirmation before paying.</p>
        {preparedUrl && <div role="status" className="rounded-lg border border-sand bg-beige p-3 text-sm text-cocoa">Your event details are ready. <a href={preparedUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Open WhatsApp again</a><button type="button" onClick={() => dialog.current?.close()} className="mt-2 flex min-h-11 w-full items-center justify-center rounded-lg border border-sand text-chocolate hover:bg-ivory">Done</button></div>}
      </form>
    </dialog>
  </>;
}

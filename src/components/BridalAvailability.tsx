import { useEffect, useRef, useState, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, Loader2, MessageCircle, Plus, X, XCircle } from 'lucide-react';
import { BRIDAL_WHATSAPP_NUMBER } from '../lib/bridalEnquiry';
import { BRIDAL_AVAILABILITY_OCCASIONS, BRIDAL_SESSIONS, checkBridalAvailability, type BridalAvailabilityOccasion, type BridalSession } from '../lib/bridalAvailability';
import BridalDatePicker from './BridalDatePicker';
import WorkshopDropdown from './WorkshopDropdown';
import './BridalBookingEnquiry.css';

interface AvailabilityEvent {
  id: number;
  eventDate: string;
  occasion: BridalAvailabilityOccasion;
  session: BridalSession;
}

interface EventAvailability {
  key: string;
  state: 'loading' | 'available' | 'booked' | 'error';
}

const defaultSession = (occasion: BridalAvailabilityOccasion): BridalSession => occasion === 'Reception' ? 'Evening' : 'Morning';
const selectionKey = (event: AvailabilityEvent) => `${event.eventDate}|${event.occasion}|${event.session}`;
const validDate = (value: string) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
};

export default function BridalAvailability() {
  const dialog = useRef<HTMLDialogElement>(null);
  const nextId = useRef(2);
  const latestKey = useRef(new Map<number, string>());
  const [events, setEvents] = useState<AvailabilityEvent[]>([{ id: 1, eventDate: '', occasion: 'Muhurtham', session: 'Morning' }]);
  const [availability, setAvailability] = useState<Record<number, EventAvailability>>({});
  const [venue, setVenue] = useState('');
  const [errors, setErrors] = useState<Record<number, string>>({});
  const [preparedUrl, setPreparedUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const activeIds = new Set(events.map(event => event.id));
    for (const id of latestKey.current.keys()) if (!activeIds.has(id)) latestKey.current.delete(id);

    events.forEach(event => {
      const key = selectionKey(event);
      if (!validDate(event.eventDate)) {
        latestKey.current.delete(event.id);
        return;
      }
      if (latestKey.current.get(event.id) === key) return;
      latestKey.current.set(event.id, key);
      setAvailability(previous => ({ ...previous, [event.id]: { key, state: 'loading' } }));
      void checkBridalAvailability(event.eventDate, event.occasion, event.session).then(result => {
        if (latestKey.current.get(event.id) === key) {
          setAvailability(previous => ({ ...previous, [event.id]: { key, state: result.available ? 'available' : 'booked' } }));
        }
      }).catch(() => {
        if (latestKey.current.get(event.id) === key) {
          setAvailability(previous => ({ ...previous, [event.id]: { key, state: 'error' } }));
        }
      });
    });
  }, [events]);

  const update = (index: number, field: 'eventDate' | 'occasion' | 'session', value: string) => {
    setEvents(previous => previous.map((entry, itemIndex) => {
      if (itemIndex !== index) return entry;
      if (field === 'occasion') {
        const occasion = value as BridalAvailabilityOccasion;
        return { ...entry, occasion, session: defaultSession(occasion) };
      }
      return { ...entry, [field]: value } as AvailabilityEvent;
    }));
    setErrors(previous => ({ ...previous, [index]: '' }));
    setPreparedUrl('');
  };

  const isAvailable = (event: AvailabilityEvent) => {
    const result = availability[event.id];
    return result?.key === selectionKey(event) && result.state === 'available';
  };
  const sharesSlot = (event: AvailabilityEvent) => events.some(other => other.id !== event.id && other.eventDate === event.eventDate && other.session === event.session);
  const allAvailable = events.length > 0 && events.every(event => validDate(event.eventDate) && isAvailable(event) && !sharesSlot(event));

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (submitting) return;
    const invalid: Record<number, string> = {};
    events.forEach((entry, index) => { if (!validDate(entry.eventDate)) invalid[index] = 'Choose your event date.'; });
    setErrors(invalid);
    if (Object.keys(invalid).length) {
      document.getElementById(`availability-date-${Object.keys(invalid)[0]}`)?.focus();
      return;
    }
    if (!allAvailable) return;

    setSubmitting(true);
    setPreparedUrl('');
    const whatsappWindow = window.open('', '_blank');
    const checks = await Promise.all(events.map(async entry => {
      try {
        const result = await checkBridalAvailability(entry.eventDate, entry.occasion, entry.session);
        setAvailability(previous => ({ ...previous, [entry.id]: { key: selectionKey(entry), state: result.available ? 'available' : 'booked' } }));
        return result.available;
      } catch {
        setAvailability(previous => ({ ...previous, [entry.id]: { key: selectionKey(entry), state: 'error' } }));
        return false;
      }
    }));
    setSubmitting(false);
    if (!checks.every(Boolean)) {
      whatsappWindow?.close();
      return;
    }

    const message = [
      'Hi *SK Bridal Studio*! Please confirm my event booking details:',
      ...events.map((entry, index) => `*Event ${index + 1}*: ${entry.eventDate.split('-').reverse().join('/')} - ${entry.occasion} - ${entry.session}`),
      ...(venue.trim() ? [`*Venue / city*: ${venue.trim()}`] : []),
      'Please confirm the booking details with me.',
    ].join('\n');
    const url = `https://web.whatsapp.com/send?phone=${BRIDAL_WHATSAPP_NUMBER}&text=${encodeURIComponent(message)}`;
    setPreparedUrl(url);
    if (whatsappWindow) {
      try { whatsappWindow.location.href = url; }
      catch { whatsappWindow.close(); }
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const statusContent = (entry: AvailabilityEvent) => {
    if (!validDate(entry.eventDate)) return <span className="text-cocoa">Choose a date to check availability.</span>;
    if (sharesSlot(entry)) return <span className="inline-flex items-center gap-2 text-red-800"><XCircle aria-hidden="true" className="h-4 w-4" />This date and session are already selected for another event.</span>;
    const result = availability[entry.id];
    const state = result?.key === selectionKey(entry) ? result.state : 'loading';
    if (state === 'loading') return <span className="inline-flex items-center gap-2 text-cocoa"><Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />Checking {entry.session.toLowerCase()} availability…</span>;
    if (state === 'available') return <span className="inline-flex items-center gap-2 text-green-800"><CheckCircle2 aria-hidden="true" className="h-4 w-4" />Available for {entry.session.toLowerCase()}</span>;
    if (state === 'booked') return <span className="inline-flex items-center gap-2 text-red-800"><XCircle aria-hidden="true" className="h-4 w-4" />{entry.session} is booked. Choose another session or date.</span>;
    return <span className="flex flex-wrap items-center gap-2 text-cocoa"><AlertCircle aria-hidden="true" className="h-4 w-4" />Unable to check availability. <button type="button" className="underline underline-offset-2" onClick={() => { latestKey.current.delete(entry.id); setEvents(previous => previous.map(item => item.id === entry.id ? { ...item } : item)); }}>Check again</button></span>;
  };

  return <>
    <button data-bridal-availability-trigger type="button" onClick={() => dialog.current?.showModal()} className="btn-light w-full !whitespace-normal text-center hover:!translate-y-0">
      <MessageCircle className="h-4 w-4" />Check Date Availability
    </button>
    <dialog ref={dialog} aria-labelledby="availability-title" className="bridal-booking-dialog m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%-1.5rem)] max-w-lg overflow-y-auto rounded-2xl border border-sand bg-ivory p-4 text-left text-chocolate shadow-luxe backdrop:bg-chocolate/60">
      <div className="sticky -top-4 z-30 -mx-4 -mt-4 mb-4 flex items-start justify-between gap-3 border-b border-sand bg-ivory px-4 py-3">
        <div><h2 id="availability-title" className="font-playfair text-xl">Check Date Availability</h2><p className="mt-1 font-inter text-sm text-cocoa">Choose an event date, occasion and session.</p></div>
        <button type="button" aria-label="Close availability form" onClick={() => dialog.current?.close()} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-beige focus-visible:outline focus-visible:outline-2 focus-visible:outline-cocoa"><X className="h-5 w-5" /></button>
      </div>
      <form onSubmit={submit} noValidate className="space-y-4 font-inter">
        {events.map((entry, index) => <div key={entry.id} role="group" aria-labelledby={`availability-event-${index}`} className="relative min-w-0 rounded-xl border border-sand p-3 pt-5">
          <h3 id={`availability-event-${index}`} className="absolute -top-2.5 left-2 bg-ivory px-2 text-sm font-semibold text-cocoa">Event {index + 1}</h3>
          {events.length > 1 && <button type="button" className="absolute -right-1 -top-3 flex h-6 w-6 items-center justify-center rounded-full border border-chocolate bg-chocolate text-ivory hover:bg-cocoa focus-visible:outline focus-visible:outline-2 focus-visible:outline-cocoa" aria-label={`Remove event ${index + 1}`} title={`Remove event ${index + 1}`} onClick={() => { setEvents(previous => previous.filter((_, itemIndex) => itemIndex !== index)); setErrors({}); setPreparedUrl(''); }}><X aria-hidden="true" className="h-3 w-3" /></button>}
          <div className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2 [&>div]:min-w-0">
            <div><label htmlFor={`availability-date-${index}`} className="mb-1 block text-sm text-cocoa">Event date *</label><BridalDatePicker id={`availability-date-${index}`} name={`availability-date-${index}`} value={entry.eventDate} onChange={value => update(index, 'eventDate', value)} aria-invalid={Boolean(errors[index])} aria-describedby={errors[index] ? `availability-error-${index}` : undefined} />{errors[index] && <p id={`availability-error-${index}`} role="alert" className="mt-1 text-sm text-red-700">{errors[index]}</p>}</div>
            <div><label id={`availability-occasion-${index}-label`} htmlFor={`availability-occasion-${index}`} className="mb-1 block text-sm text-cocoa">Occasion *</label><WorkshopDropdown id={`availability-occasion-${index}`} name={`availability-occasion-${index}`} inlineMenu value={entry.occasion} onChange={value => update(index, 'occasion', value)} options={BRIDAL_AVAILABILITY_OCCASIONS.map(occasion => ({ value: occasion, label: occasion }))} /></div>
            <div><label id={`availability-session-${index}-label`} htmlFor={`availability-session-${index}`} className="mb-1 block text-sm text-cocoa">Session *</label><WorkshopDropdown id={`availability-session-${index}`} name={`availability-session-${index}`} inlineMenu value={entry.session} onChange={value => update(index, 'session', value)} options={BRIDAL_SESSIONS.map(session => ({ value: session, label: session }))} /></div>
          </div>
          <p role="status" aria-live="polite" className="mt-3 rounded-lg border border-sand bg-beige p-2.5 text-sm">{statusContent(entry)}</p>
        </div>)}
        {events.length < 3 && <button type="button" className="flex min-h-11 items-center gap-2 rounded-lg border border-sand px-3 py-2 text-sm text-cocoa transition-colors hover:border-champagne hover:bg-beige focus-visible:outline focus-visible:outline-2 focus-visible:outline-cocoa" onClick={() => { const id = nextId.current++; setEvents(previous => [...previous, { id, eventDate: '', occasion: 'Reception', session: 'Evening' }]); setPreparedUrl(''); }}><Plus className="h-4 w-4" />Add another event</button>}
        <div><label htmlFor="availability-venue" className="mb-1 block text-sm text-cocoa">Venue / city (optional)</label><input id="availability-venue" name="venue" className="field" maxLength={200} value={venue} onChange={event => { setVenue(event.target.value); setPreparedUrl(''); }} placeholder="Event location" /></div>
        <button type="submit" disabled={!allAvailable || submitting} className="btn-primary w-full !whitespace-normal disabled:cursor-not-allowed disabled:opacity-60">{submitting ? <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" /> : <MessageCircle className="h-4 w-4" />}{submitting ? 'Rechecking availability…' : 'Send Dates on WhatsApp'}</button>
        <p className="text-center text-sm text-cocoa">All selected dates and sessions must be available. Tap Send in WhatsApp to share your request.</p>
        {preparedUrl && <div role="status" className="rounded-lg border border-sand bg-beige p-3 text-sm text-cocoa">Your event details are ready. <a href={preparedUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4">Open WhatsApp again</a><button type="button" onClick={() => dialog.current?.close()} className="mt-2 flex min-h-11 w-full items-center justify-center rounded-lg border border-sand text-chocolate hover:bg-ivory">Done</button></div>}
      </form>
    </dialog>
  </>;
}

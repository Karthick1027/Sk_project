import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';

const iso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const parse = (value: string) => {
  const text = /^\d{2}\/\d{2}\/\d{4}$/.test(value) ? value.split('/').reverse().join('-') : value;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) return null;
  const [year, month, day] = text.split('-').map(Number);
  const date = new Date(year, month - 1, day, 12);
  return Number.isFinite(date.getTime()) && iso(date) === text ? date : null;
};
const display = (value: string) => value ? value.split('-').reverse().join('/') : '';

interface Props {
  id: string; name: string; value: string; onChange: (value: string) => void;
  'aria-invalid'?: boolean; 'aria-describedby'?: string;
}

export default function BridalDatePicker({ id, name, value, onChange, 'aria-invalid': invalid, 'aria-describedby': description }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const typing = useRef(false);
  const calendarId = useId();
  const [draft, setDraft] = useState(display(value));
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => parse(value) || new Date());
  const [focusDate, setFocusDate] = useState(() => iso(parse(value) || new Date()));
  const today = iso(new Date());
  useEffect(() => { if (typing.current) { typing.current = false; return; } setDraft(display(value)); }, [value]);
  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => { if (!root.current?.contains(event.target as Node)) setOpen(false); };
    document.addEventListener('pointerdown', close);
    const frame = requestAnimationFrame(() => {
      panel.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' });
      panel.current?.querySelector<HTMLButtonElement>(`[data-date="${focusDate}"]`)?.focus({ preventScroll: true });
    });
    return () => { document.removeEventListener('pointerdown', close); cancelAnimationFrame(frame); };
  }, [open, focusDate]);
  const close = () => { setOpen(false); toggle.current?.focus({ preventScroll: true }); };
  const choose = (date: string) => { typing.current = false; onChange(date); setDraft(display(date)); close(); };
  const moveMonth = (offset: number) => {
    const date = new Date(cursor.getFullYear(), cursor.getMonth() + offset, 1, 12);
    setCursor(date); setFocusDate(iso(date));
  };
  const keyboard = (event: KeyboardEvent<HTMLButtonElement>, date: Date) => {
    const next = new Date(date);
    const offset = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
    if (offset !== undefined) next.setDate(next.getDate() + offset);
    else if (event.key === 'Home') next.setDate(next.getDate() - (next.getDay() + 6) % 7);
    else if (event.key === 'End') next.setDate(next.getDate() + 6 - (next.getDay() + 6) % 7);
    else if (event.key === 'PageUp' || event.key === 'PageDown') { event.preventDefault(); moveMonth(event.key === 'PageUp' ? -1 : 1); return; }
    else return;
    event.preventDefault(); setCursor(next); setFocusDate(iso(next));
  };
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1, 12);
  const leading = (first.getDay() + 6) % 7;
  const length = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const monthLabel = cursor.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const iconButton = 'flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-cocoa hover:bg-sand/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mocha';
  return (
    <div ref={root} className="min-w-0" onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false); }} onKeyDown={event => { if (open && event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(); } }}>
      <div className="relative">
        <input id={id} name={name} type="text" inputMode="numeric" placeholder="DD/MM/YYYY" autoComplete="off" maxLength={10} required aria-invalid={invalid} aria-describedby={description} value={draft} onChange={event => {
          const text = event.target.value; typing.current = true; setDraft(text); const date = parse(text); onChange(date ? iso(date) : '');
        }} onBlur={() => { const date = parse(draft); if (date) setDraft(display(iso(date))); }} className="field min-h-[50px] !py-2 !pr-12 text-base tabular-nums placeholder:tracking-wide" />
        <button ref={toggle} type="button" aria-label="Choose event date" aria-expanded={open} aria-controls={calendarId} onClick={() => {
          if (open) close(); else { const date = parse(value) || new Date(); setCursor(date); setFocusDate(iso(date)); setOpen(true); }
        }} className="absolute inset-y-0 right-1 my-auto flex h-10 w-10 items-center justify-center rounded-lg text-cocoa hover:bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mocha"><CalendarDays aria-hidden="true" className="h-5 w-5" /></button>
      </div>
      {open && <div ref={panel} id={calendarId} role="group" aria-label="Choose event date" className="mt-2 min-w-0 rounded-2xl border border-champagne bg-ivory p-3 shadow-soft">
        <div className="mb-2 flex items-center justify-between gap-1 rounded-xl bg-beige p-1">
          <button type="button" aria-label="Previous month" onClick={() => moveMonth(-1)} className={iconButton}><ChevronLeft aria-hidden="true" className="h-4 w-4" /></button>
          <p aria-live="polite" className="text-center text-sm font-semibold text-chocolate">{monthLabel}</p>
          <button type="button" aria-label="Next month" onClick={() => moveMonth(1)} className={iconButton}><ChevronRight aria-hidden="true" className="h-4 w-4" /></button>
        </div>
        <div className="grid grid-cols-7 gap-0.5 text-center">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => <span key={day} className="py-2 text-xs font-medium text-cocoa">{day}</span>)}
          {Array.from({ length: leading }, (_, index) => <span key={`blank-${index}`} />)}
          {Array.from({ length }, (_, index) => {
            const date = new Date(cursor.getFullYear(), cursor.getMonth(), index + 1, 12);
            const key = iso(date), selected = value === key;
            return <button key={key} type="button" data-date={key} aria-label={date.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} aria-pressed={selected} aria-current={today === key ? 'date' : undefined} tabIndex={focusDate === key ? 0 : -1} onClick={() => choose(key)} onKeyDown={event => keyboard(event, date)} className={`aspect-square min-h-8 rounded-lg text-sm tabular-nums outline-none transition-colors focus-visible:ring-2 focus-visible:ring-mocha focus-visible:ring-offset-1 ${selected ? 'bg-chocolate font-semibold text-ivory' : today === key ? 'bg-beige font-semibold text-chocolate ring-1 ring-inset ring-champagne' : 'text-cocoa hover:bg-champagne/50'}`}>{index + 1}</button>;
          })}
        </div>
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-sand pt-2 text-sm">
          <button type="button" className="min-h-10 rounded px-2 text-cocoa hover:bg-beige focus-visible:ring-2 focus-visible:ring-mocha" onClick={() => choose(today)}>Today</button>
          <button type="button" className="min-h-10 rounded px-2 text-cocoa hover:bg-beige focus-visible:ring-2 focus-visible:ring-mocha" onClick={() => choose('')}>Clear date</button>
        </div>
      </div>}
    </div>
  );
}

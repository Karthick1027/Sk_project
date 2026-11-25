import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { Check, ChevronDown } from 'lucide-react';

interface Option { value: string; label: string }
interface Props {
  id: string;
  name: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  disabled?: boolean;
  inlineMenu?: boolean;
  'aria-invalid'?: boolean;
  'aria-describedby'?: string;
}

export default function WorkshopDropdown({ id, name, value, options, onChange, disabled, inlineMenu = false, 'aria-invalid': invalid, 'aria-describedby': description }: Props) {
  const listId = `workshop-options-${useId()}`;
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const search = useRef({ text: '', time: 0 });
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const selected = options.findIndex(option => option.value === value);

  useEffect(() => {
    if (!open) return;
    const closeOutside = (event: Event) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', closeOutside);
    document.addEventListener('focusin', closeOutside);
    return () => {
      document.removeEventListener('pointerdown', closeOutside);
      document.removeEventListener('focusin', closeOutside);
    };
  }, [open]);

  useEffect(() => {
    if (!open || disabled) return;
    const frame = window.requestAnimationFrame(() => {
      if (!list.current) return;
      const viewport = window.visualViewport;
      const viewportHeight = viewport?.height ?? window.innerHeight;
      const viewportBottom = (viewport?.offsetTop ?? 0) + viewportHeight;
      // Keep room for the field and header on short screens or with a keyboard open.
      list.current.style.maxHeight = `${Math.max(44, Math.min(240, viewportHeight - 192))}px`;
      if (inlineMenu) {
        // Scroll within the dialog rather than the page behind its backdrop.
        list.current.scrollIntoView({ block: 'nearest', behavior: 'instant' });
        return;
      }
      const overflow = list.current.getBoundingClientRect().bottom - viewportBottom + 16;
      if (overflow > 0) {
        window.scrollBy({
          top: overflow,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
        });
      }
    });
    return () => window.cancelAnimationFrame(frame);
  }, [open, disabled, inlineMenu]);

  useEffect(() => {
    const menu = list.current;
    const option = document.getElementById(`${listId}-${active}`);
    if (!open || !menu || !option) return;
    // Move within the options without scrolling the page again on hover/navigation.
    const top = option.offsetTop - menu.clientTop;
    const bottom = top + option.offsetHeight;
    if (top < menu.scrollTop) menu.scrollTop = top;
    else if (bottom > menu.scrollTop + menu.clientHeight) menu.scrollTop = bottom - menu.clientHeight;
  }, [active, open, listId]);

  const choose = (index: number) => {
    if (disabled || !options[index]) return;
    onChange(options[index].value);
    setOpen(false);
    trigger.current?.focus();
  };
  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Tab') { setOpen(false); return; }
    if (event.key === 'Escape') { event.preventDefault(); setOpen(false); return; }
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (open && active >= 0) choose(active);
      else { setActive(Math.max(selected, 0)); setOpen(true); }
      return;
    }
    if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
      event.preventDefault();
      setOpen(true);
      if (event.key === 'Home') setActive(0);
      else if (event.key === 'End') setActive(options.length - 1);
      else if (!open) setActive(Math.max(selected, 0));
      else setActive(previous => previous < 0 ? (event.key === 'ArrowDown' ? 0 : options.length - 1) : (previous + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length);
      return;
    }
    if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
      event.preventDefault();
      const now = Date.now();
      search.current.text = (now - search.current.time < 700 ? search.current.text : '') + event.key.toLowerCase();
      search.current.time = now;
      const match = options.findIndex(option => option.label.toLowerCase().startsWith(search.current.text));
      if (match >= 0) { setActive(match); setOpen(true); }
    }
  };

  return (
    <div ref={root} className="relative min-w-0">
      <button ref={trigger} id={id} name={name} value={value} type="button" role="combobox" aria-required="true" aria-expanded={open && !disabled} aria-haspopup="listbox" aria-controls={listId} aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined} aria-labelledby={`${id}-label ${id}-value`} aria-invalid={invalid} aria-describedby={description} disabled={disabled} onKeyDown={onKeyDown} onClick={() => { setActive(Math.max(selected, 0)); setOpen(previous => !previous); }} className="field relative flex min-h-[50px] items-center !pr-10 text-left">
        <span id={`${id}-value`} className="min-w-0 break-words">{options[selected]?.label || 'Select an option'}</span>
        <ChevronDown aria-hidden="true" className={`pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-cocoa transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && !disabled && <ul ref={list} id={listId} role="listbox" aria-labelledby={`${id}-label`} onMouseLeave={() => setActive(-1)} className={`${inlineMenu ? 'relative' : 'absolute left-0 right-0 top-full'} z-50 mt-2 max-h-60 overflow-y-auto rounded-xl border border-champagne bg-beige p-1.5 shadow-luxe`}>
        {options.map((option, index) => (
          <li key={option.value} id={`${listId}-${index}`} role="option" aria-selected={value === option.value} data-value={option.value} onMouseEnter={() => setActive(index)} onMouseDown={event => event.preventDefault()} onClick={() => choose(index)} className={`flex min-h-11 cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-3 text-base transition-colors duration-150 ${active === index ? 'bg-champagne text-chocolate' : selected === index ? 'bg-chocolate text-ivory' : 'bg-beige text-chocolate'}`}>
            <span className="min-w-0 break-words">{option.label}</span>
            {selected === index && <Check aria-hidden="true" className="h-4 w-4 shrink-0" />}
          </li>
        ))}
      </ul>}
    </div>
  );
}

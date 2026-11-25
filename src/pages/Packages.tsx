import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, Plus, Gift, Car, Sparkles, Gem, Award, Brush, MessageCircle, ArrowRight, ArrowDown, Instagram,
  Wallet, CalendarCheck, CalendarClock, Percent, Receipt, Lock, Clock,
  Smartphone, SmartphoneNfc, QrCode, Landmark, Banknote, CreditCard, type LucideIcon,
} from 'lucide-react';
import PageHero from '../components/PageHero';
import BridalAdvancePayment from '../components/BridalAdvancePayment';
import BridalAvailability from '../components/BridalAvailability';
import { PackagesBackdrop } from '../components/PageBackdrops';
import './Packages.css';
import {
  bridalPackages, packageAddOns, addOnServices, bookingAdvance, bookingSteps, bookingNotes, paymentMethods, BridalPackage,
} from '../data/packages';

const SEO_TITLE = 'Bridal Makeup Packages | SK Bridal Studio';
const SEO_DESCRIPTION =
  'Bridal makeup packages in Chennai by SK Bridal Studio: HD / Matte, Glossy / Waterproof and Airbrush finishes with hairstyling, saree draping and more.';

const WHATSAPP_URL = 'https://wa.me/918668038093';
const JEWELLERY_URL = 'https://instagram.com/sk_bridal.collections';
// Number of inclusions shown before "Read in full" is opened
const PREVIEW_COUNT = 4;

type BookingMode = 'single' | 'combo';

const perkIcon = (perk: string) => {
  if (perk.includes('travel')) return Car;
  if (perk.includes('groom')) return Sparkles;
  if (perk.includes('Touch-up')) return Brush;
  return Gem;
};

const stepIcons = [MessageCircle, Wallet, CalendarCheck];

// Generic icons per payment method (the icon set has no brand logos)
const paymentIcons: Record<string, LucideIcon> = {
  'Google Pay': Smartphone,
  PhonePe: SmartphoneNfc,
  Paytm: Wallet,
  UPI: QrCode,
  'Net banking': Landmark,
  Cash: Banknote,
  'Credit Card': CreditCard,
};

const noteIcon = (note: string) => {
  if (note.startsWith('All prices')) return Percent;
  if (note.includes('Travel')) return Car;
  if (note.includes('bill')) return Receipt;
  if (note.includes('Date')) return CalendarClock;
  return Lock;
};

const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

const enquiryLink = (pkg: BridalPackage, mode: BookingMode) => {
  const booking = mode === 'combo' ? 'Muhurtham + Reception' : 'a single session';
  const text = `Hi SK Bridal Studio! I'd like to enquire about Package ${pkg.id} – ${pkg.finish} ${pkg.finishAccent} (${formatPrice(pkg.price)}) for ${booking}.`;
  return `${WHATSAPP_URL}?text=${encodeURIComponent(text)}`;
};

/**
 * Float the whole card while idle; freeze its current pose during hover or
 * keyboard interaction so the controls stay steady while being used.
 */
const DatePass: React.FC = () => {
  const cardRoot = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasOpenDialog, setHasOpenDialog] = useState(false);
  const [availabilityConfirmed, setAvailabilityConfirmed] = useState(false);
  useEffect(() => {
    if (!cardRoot.current) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.1 });
    observer.observe(cardRoot.current);
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const root = cardRoot.current;
    if (!root) return;
    const syncDialogState = () => {
      setHasOpenDialog(Boolean(root.querySelector('dialog[open]')));
      const active = document.activeElement;
      setIsFocused(active instanceof HTMLElement && root.contains(active) && (window.matchMedia('(max-width: 1023px)').matches || active.matches(':focus-visible')));
    };
    const observer = new MutationObserver(syncDialogState);
    observer.observe(root, { subtree: true, attributes: true, attributeFilter: ['open'] });
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={cardRoot} data-advance-card data-motion-paused={isHovered || isFocused || hasOpenDialog} onPointerEnter={event => { if (event.pointerType === 'mouse') setIsHovered(true); }} onPointerLeave={() => setIsHovered(false)} onPointerCancel={() => setIsHovered(false)} onFocusCapture={event => setIsFocused(window.matchMedia('(max-width: 1023px)').matches || (event.target as HTMLElement).matches(':focus-visible'))} onPointerDownCapture={event => { if (event.pointerType === 'mouse') setIsFocused(false); else setIsHovered(true); }} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsFocused(false); }} onKeyDownCapture={event => { if (event.key === 'Tab' || event.key === 'Enter' || event.key === ' ') setIsFocused(true); }} className="advance-card-scene relative mt-10" style={{ '--advance-motion-state': inView && !isHovered && !isFocused && !hasOpenDialog ? 'running' : 'paused' } as React.CSSProperties}>
      {/* Soft ground shadow */}
      <div aria-hidden="true" className="advance-card-ground-shadow pointer-events-none absolute inset-x-8 -bottom-6 h-12 rounded-full bg-chocolate/35 blur-xl" />

      <div data-advance-card-motion className="advance-card-motion group relative rounded-3xl bg-chocolate text-ivory">
        <div aria-hidden="true" className="advance-card-depth pointer-events-none absolute inset-0 rounded-3xl" />
        <div aria-hidden="true" className="advance-card-rim pointer-events-none absolute inset-0 rounded-3xl" />
        <div className="relative">
          <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 z-0 rounded-3xl transition-transform duration-[400ms] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none [will-change:transform] [transform-style:preserve-3d]"
          style={{ transform: 'rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))' }}
          >
          {/* Back layer: the card's thickness, visible as it tilts */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-3xl bg-[#1d120d] shadow-luxe [transform:translateZ(-18px)]" />

          {/* Card face */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl bg-gradient-to-br from-[#5a3d30] via-chocolate to-[#241610] ring-1 ring-champagne/30">
            <div className="advance-card-aura absolute -right-10 -top-12 h-48 w-48 rounded-full bg-champagne/30 blur-2xl" />
            <div className="advance-card-sheen absolute inset-0 overflow-hidden rounded-3xl" />
            <div className="absolute inset-2 rounded-[1.25rem] border border-champagne/25" />
            <div
              className="absolute inset-0 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: 'radial-gradient(circle at var(--gx, 25%) var(--gy, 0%), rgba(255,252,246,0.22), transparent 55%)' }}
            />
          </div>
          </div>

          {/* The whole card moves together and pauses while its controls are used. */}
          <div className="advance-card-content relative z-10 px-6 py-7 sm:px-8">
            <div className="flex items-start justify-between gap-4">
              <p className="font-inter text-[11px] font-semibold uppercase tracking-[0.35em] text-champagne">Booking advance from</p>
              <CalendarCheck className="h-6 w-6 shrink-0 text-champagne" />
            </div>
            <p className="mt-4 font-playfair text-5xl sm:text-6xl font-semibold leading-none">
              {formatPrice(bookingAdvance)}
            </p>
            <p className="mt-3 font-cormorant text-xl italic text-sand/90">
              Pay only after we confirm availability
            </p>

            {/* Perforated tear line with half-circle notches at the card edges */}
            <div aria-hidden="true" className="relative my-6 border-t-2 border-dashed border-champagne/30">
              <span className="absolute -left-6 sm:-left-8 -top-3 h-6 w-3 rounded-r-full bg-beige" />
              <span className="absolute -right-6 sm:-right-8 -top-3 h-6 w-3 rounded-l-full bg-beige" />
            </div>

            <BridalAvailability onContinue={() => {
              const bookingButton = cardRoot.current?.querySelector<HTMLButtonElement>('[data-bridal-booking-trigger]');
              if (bookingButton && !bookingButton.disabled) bookingButton.click();
              else document.getElementById('bridal-availability-confirmed')?.focus();
            }} />
            <label htmlFor="bridal-availability-confirmed" className="mt-4 flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border border-champagne/25 bg-ivory/5 p-3 font-inter text-sm leading-relaxed text-sand">
              <input id="bridal-availability-confirmed" type="checkbox" checked={availabilityConfirmed} onChange={event => setAvailabilityConfirmed(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 cursor-pointer accent-champagne" />
              <span>SK Bridal Studio has confirmed my date and session availability.</span>
            </label>
            <BridalAdvancePayment availabilityConfirmed={availabilityConfirmed} />
            <p className="mt-2 font-inter text-xs leading-relaxed text-champagne">Advance varies by number of days and is non-refundable.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

interface PackageCardProps {
  pkg: BridalPackage;
  mode: BookingMode;
  expanded: boolean;
  onToggleExpanded: () => void;
  onShowCombo: () => void;
  delay: number;
  /** The active card is dark: viewport highlight on mobile, hover/selection on desktop. */
  active: boolean;
  onHover: () => void;
  onSelect: () => void;
}

const PackageCard: React.FC<PackageCardProps> = ({
  pkg, mode, expanded, onToggleExpanded, onShowCombo, delay, active, onHover, onSelect,
}) => {
  const dark = active;
  const items = expanded ? pkg.includes : pkg.includes.slice(0, PREVIEW_COUNT);
  const hidden = pkg.includes.length - PREVIEW_COUNT;

  return (
    <article
      id={`package-${pkg.id}`}
      data-package-id={pkg.id}
      data-active={active}
      // Hover only for a real mouse; touch browsers fire a fake hover on tap that never clears
      onPointerEnter={(e) => e.pointerType === 'mouse' && onHover()}
      onClick={onSelect}
      className={`color-fade relative flex flex-col scroll-mt-28 cursor-pointer rounded-[1.75rem] border p-6 sm:p-8 lg:p-6 xl:p-10 animate-fade-in transition-[background-color,border-color,box-shadow,margin] duration-300 ${
        dark
          ? 'bg-chocolate text-ivory border-chocolate shadow-luxe lg:-my-4'
          : 'bg-ivory text-ink border-sand shadow-soft'
      }`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Inset hairline frame */}
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute inset-2.5 rounded-[1.4rem] border ${
          dark ? 'border-champagne/25' : 'border-champagne/40'
        }`}
      />

      {/* Recommended tag, sitting on the card's top edge */}
      {pkg.recommended && (
        <span
          className={`absolute -top-3.5 right-6 sm:right-8 z-10 inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-inter text-[10px] font-semibold uppercase tracking-[0.25em] shadow-soft ring-1 transition-colors duration-300 ${
            dark ? 'bg-champagne text-chocolate ring-ivory/60' : 'bg-chocolate text-ivory ring-champagne'
          }`}
        >
          <Award className="h-3.5 w-3.5" />
          Recommended
        </span>
      )}

      {/* Header row */}
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className={`font-inter text-[11px] font-semibold uppercase tracking-[0.35em] ${dark ? 'text-champagne' : 'text-mocha'}`}>
            Package {String(pkg.id).padStart(2, '0')}
          </p>
          {pkg.featured && (
            <span
              className={`mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-inter text-[10px] font-semibold uppercase tracking-[0.25em] ring-1 ${
                dark ? 'bg-champagne/15 text-champagne ring-champagne/40' : 'bg-beige text-cocoa ring-champagne'
              }`}
            >
              <Sparkles className="h-3 w-3" />
              Signature
            </span>
          )}
        </div>
        <span
          aria-hidden="true"
          className={`font-cormorant text-6xl sm:text-7xl lg:text-6xl xl:text-7xl italic leading-none ${dark ? 'text-champagne/30' : 'text-champagne/70'}`}
        >
          {String(pkg.id).padStart(2, '0')}
        </span>
      </div>

      {/* Title + price */}
      {/* Sizes step down at lg, where three cards share a laptop-width row */}
      <h3 className="relative mt-4 font-playfair text-3xl sm:text-4xl lg:text-3xl xl:text-4xl font-medium leading-tight">
        <span className={dark ? 'text-ivory' : 'text-chocolate'}>{pkg.finish}</span>
        <span className={`block font-cormorant italic font-medium ${dark ? 'text-champagne' : 'text-cocoa'}`}>
          {pkg.finishAccent}
        </span>
      </h3>

      <div className="relative mt-6 flex flex-wrap items-end gap-x-3 gap-y-1">
        <span className={`font-playfair text-4xl sm:text-5xl lg:text-4xl xl:text-5xl font-semibold leading-none ${dark ? 'text-ivory' : 'text-chocolate'}`}>
          {formatPrice(pkg.price)}
        </span>
        <span className={`pb-1 whitespace-nowrap font-inter text-xs uppercase tracking-[0.2em] ${dark ? 'text-sand/70' : 'text-mocha'}`}>
          / session
        </span>
      </div>

      <p className={`relative mt-5 font-inter text-[15px] leading-relaxed ${dark ? 'text-sand/90' : 'text-ink'}`}>
        {pkg.description}
      </p>

      {/* Wear time */}
      <p className={`relative mt-4 flex items-start gap-2.5 font-inter text-sm leading-snug ${dark ? 'text-sand/90' : 'text-ink'}`}>
        <Clock className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? 'text-champagne' : 'text-mocha'}`} />
        <span>
          <span className={`font-semibold ${dark ? 'text-ivory' : 'text-chocolate'}`}>Stays fresh for {pkg.wearTime.charAt(0).toLowerCase() + pkg.wearTime.slice(1)}</span>{' '}
          in air-conditioned venues, and even longer with gentle aftercare
        </span>
      </p>

      <div className={`relative my-7 h-px ${dark ? 'bg-champagne/25' : 'bg-sand'}`} />

      {/* Inclusions */}
      <p className={`relative font-inter text-[11px] font-semibold uppercase tracking-[0.3em] ${dark ? 'text-champagne' : 'text-mocha'}`}>
        What's included
      </p>
      <ul className="relative mt-4 space-y-3">
        {items.map((item, i) => (
          <li key={item} className="flex items-start gap-3 font-inter text-[15px] leading-snug">
            <span
              className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                dark ? 'bg-champagne/20 text-champagne' : 'bg-beige text-cocoa'
              }`}
            >
              <Check className="h-3 w-3" strokeWidth={2.5} />
            </span>
            <span className={i === 0 ? `font-semibold ${dark ? 'text-ivory' : 'text-chocolate'}` : dark ? 'text-sand/90' : 'text-ink'}>
              {item}
            </span>
          </li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onToggleExpanded}
        aria-expanded={expanded}
        className={`relative mt-5 inline-flex items-center gap-3 self-start font-inter text-[11px] font-semibold uppercase tracking-[0.3em] transition-colors duration-300 ${
          dark ? 'text-champagne hover:text-ivory' : 'text-cocoa hover:text-chocolate'
        }`}
      >
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full border transition-transform duration-500 ${
            expanded ? 'rotate-45' : ''
          } ${dark ? 'border-champagne/50' : 'border-champagne'}`}
        >
          <Plus className="h-4 w-4" />
        </span>
        {expanded ? 'Show less' : `Read in full · +${hidden}`}
      </button>

      {/* Muhurtham + Reception offer */}
      <div className="relative mt-auto pt-8">
        {mode === 'combo' ? (
          <div
            key="combo"
            className={`animate-fade-in rounded-2xl p-5 ${
              dark ? 'bg-ivory/[0.06] ring-1 ring-champagne/30' : 'bg-blush/50 ring-1 ring-blush'
            }`}
          >
            <p className={`flex items-center gap-2 font-inter text-[11px] font-semibold uppercase tracking-[0.25em] ${dark ? 'text-champagne' : 'text-cocoa'}`}>
              <Gift className="h-4 w-4" />
              Complimentary with both sessions
            </p>
            <ul className="mt-4 space-y-3">
              {pkg.comboPerks.map((perk) => {
                const Icon = perkIcon(perk);
                return (
                  <li key={perk} className={`flex items-start gap-3 font-inter text-sm leading-snug ${dark ? 'text-ivory' : 'text-chocolate'}`}>
                    <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${dark ? 'text-champagne' : 'text-mocha'}`} />
                    {perk}
                  </li>
                );
              })}
            </ul>
          </div>
        ) : (
          <button
            type="button"
            onClick={onShowCombo}
            className={`group flex w-full items-center gap-3 rounded-2xl border border-dashed px-4 py-3.5 text-left font-inter text-sm transition-colors duration-300 ${
              dark
                ? 'border-champagne/40 text-sand/90 hover:bg-ivory/[0.06]'
                : 'border-champagne text-ink hover:bg-beige'
            }`}
          >
            <Gift className={`h-5 w-5 shrink-0 ${dark ? 'text-champagne' : 'text-mocha'}`} />
            <span className="flex-1">
              Book Muhurtham & Reception to unlock{' '}
              <span className={`font-semibold ${dark ? 'text-ivory' : 'text-chocolate'}`}>{pkg.comboPerks.length} complimentary perks</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
          </button>
        )}

        <a
          href={enquiryLink(pkg, mode)}
          target="_blank"
          rel="noopener noreferrer"
          // Compact and centred on phones, full card width from sm up
          className={`${dark ? 'btn-light' : 'btn-primary'} mx-auto mt-6 flex w-fit !px-6 !py-3 text-sm sm:w-full sm:!py-3.5 sm:text-[15px]`}
        >
          <MessageCircle className="h-4 w-4" />
          Enquire on WhatsApp
        </a>
      </div>
    </article>
  );
};

// Point on a quadratic curve from (x0,y0) via control (cx,cy) to (x1,y1), used to string beads along a necklace
const onCurve = (t: number, x0: number, y0: number, cx: number, cy: number, x1: number, y1: number) => ({
  x: (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t ** 2 * x1,
  y: (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y1,
});

// Gold beads on the outer strand (the gap in the middle is where the pendant hangs), pearls on the inner one
const goldBeads = Array.from({ length: 19 }, (_, i) => onCurve(0.05 + i * 0.05, 12, 6, 120, 196, 228, 6)).filter(
  (_, i) => i < 8 || i > 10
);
const pearls = Array.from({ length: 15 }, (_, i) => onCurve(0.06 + i * 0.0629, 44, 6, 120, 128, 196, 6));

// Temple-style haaram: pearl strand, gold bead strand and a ruby pendant with pearl drops
const Necklace: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 240 200" aria-hidden="true" className={className}>
    <path d="M12 6 Q120 196 228 6" fill="none" className="stroke-mocha/60" strokeWidth="1.2" />
    <path d="M44 6 Q120 128 196 6" fill="none" className="stroke-champagne" strokeWidth="1" />
    {pearls.map((p, i) => (
      <circle key={`p${i}`} cx={p.x} cy={p.y} r="3.2" className="fill-ivory stroke-champagne" strokeWidth="1" />
    ))}
    {goldBeads.map((b, i) => (
      <g key={`g${i}`}>
        <circle cx={b.x} cy={b.y} r={i % 2 ? 3.4 : 5} className="fill-champagne stroke-mocha" strokeWidth="1" />
        {i % 2 === 0 && <circle cx={b.x} cy={b.y} r="1.8" className="fill-clay/60" />}
      </g>
    ))}
    {/* Pendant */}
    <g transform="translate(120 104)">
      <path d="M-14 0 Q0 -10 14 0" fill="none" className="stroke-mocha" strokeWidth="1.2" />
      <path d="M0 2 C 18 10 18 34 0 50 C -18 34 -18 10 0 2 Z" className="fill-champagne stroke-mocha" strokeWidth="1.2" />
      <path d="M0 10 C 10 16 10 30 0 40 C -10 30 -10 16 0 10 Z" className="fill-ivory/70 stroke-mocha/70" strokeWidth="0.8" />
      <ellipse cx="0" cy="25" rx="4.5" ry="7" className="fill-clay/70" />
      <circle cx="-1.5" cy="22" r="1.2" className="fill-ivory/80" />
      {[-12, 0, 12].map((x) => (
        <g key={x}>
          <line x1={x * 0.6} y1={x ? 44 : 50} x2={x} y2={x ? 58 : 62} className="stroke-mocha/70" strokeWidth="0.8" />
          <circle cx={x} cy={x ? 61 : 66} r={x ? 3 : 4} className="fill-ivory stroke-champagne" strokeWidth="1" />
        </g>
      ))}
    </g>
  </svg>
);

// Jhumka earring on a thread, swinging gently from the top of the card
const Jhumka: React.FC<{ className?: string; thread: number; delay?: string }> = ({ className = '', thread, delay }) => (
  <div
    aria-hidden="true"
    style={{ animationDelay: delay }}
    className={`origin-top animate-swing motion-reduce:animate-none ${className}`}
  >
    <svg viewBox={`0 0 40 ${thread + 66}`} className="w-full h-auto">
      <line x1="20" y1="0" x2="20" y2={thread} className="stroke-champagne" strokeWidth="1" />
      <g transform={`translate(0 ${thread})`}>
        <circle cx="20" cy="6" r="6" className="fill-champagne stroke-mocha" strokeWidth="1" />
        <circle cx="20" cy="6" r="2.4" className="fill-clay/60" />
        <circle cx="20" cy="16" r="2.4" className="fill-ivory stroke-champagne" strokeWidth="1" />
        <path d="M7 42 Q7 22 20 22 Q33 22 33 42 Z" className="fill-champagne stroke-mocha" strokeWidth="1" />
        <path d="M11 34 Q20 28 29 34" fill="none" className="stroke-mocha/70" strokeWidth="0.8" />
        <line x1="6" y1="42" x2="34" y2="42" className="stroke-mocha" strokeWidth="1.4" />
        {[8, 14, 20, 26, 32].map((x) => (
          <circle key={x} cx={x} cy="47" r="2.3" className="fill-ivory stroke-champagne" strokeWidth="0.9" />
        ))}
        <circle cx="20" cy="55" r="2.8" className="fill-ivory stroke-champagne" strokeWidth="0.9" />
      </g>
    </svg>
  </div>
);

const Packages: React.FC = () => {
  const [mode, setMode] = useState<BookingMode>('single');
  // Shared across cards so the three columns stay the same height
  const [expanded, setExpanded] = useState(false);
  // Stacked cards follow scrolling; desktop cards keep hover and click selection.
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const packageGrid = useRef<HTMLDivElement>(null);
  const [visibleId, setVisibleId] = useState<number | null>(null);
  const activeId = visibleId ?? hoveredId ?? selectedId;

  useEffect(() => {
    const grid = packageGrid.current;
    if (!grid) return;
    const stacked = window.matchMedia('(max-width: 1023px)');
    let frame: number | null = null;
    const updateVisibleCard = () => {
      frame = null;
      let nextId: number | null = null;
      if (stacked.matches) {
        const viewportTop = Math.max(0, document.querySelector('header')?.getBoundingClientRect().bottom ?? 0);
        let greatestVisibleHeight = 0;
        for (const card of grid.querySelectorAll<HTMLElement>('[data-package-id]')) {
          const bounds = card.getBoundingClientRect();
          const visibleHeight = Math.max(0, Math.min(bounds.bottom, window.innerHeight) - Math.max(bounds.top, viewportTop));
          if (visibleHeight > greatestVisibleHeight) {
            greatestVisibleHeight = visibleHeight;
            nextId = Number(card.dataset.packageId);
          }
        }
      }
      setVisibleId(previous => previous === nextId ? previous : nextId);
    };
    const scheduleUpdate = () => {
      if (frame === null) frame = requestAnimationFrame(updateVisibleCard);
    };
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    stacked.addEventListener('change', scheduleUpdate);
    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(grid);
    scheduleUpdate();
    return () => {
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      stacked.removeEventListener('change', scheduleUpdate);
      resizeObserver.disconnect();
      if (frame !== null) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const prevTitle = document.title;
    let meta = document.querySelector('meta[name="description"]') as HTMLMetaElement | null;
    const created = !meta;
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    const prevDesc = meta.getAttribute('content') ?? '';

    document.title = SEO_TITLE;
    meta.setAttribute('content', SEO_DESCRIPTION);

    return () => {
      document.title = prevTitle;
      if (created) {
        meta?.remove();
      } else {
        meta?.setAttribute('content', prevDesc);
      }
    };
  }, []);

  // Phones show the short label with a caption under it; wider screens show the full label on one line
  const modes: { key: BookingMode; label: string; short: string; caption: string }[] = [
    { key: 'single', label: 'Single Session', short: 'Single Session', caption: 'One ceremony' },
    { key: 'combo', label: 'Muhurtham + Reception', short: 'Both Sessions', caption: 'Muhurtham + Reception' },
  ];

  return (
    <div className="pt-20 min-h-screen bg-ivory">
      <PageHero
        eyebrow="Bridal Packages"
        backdrop={<PackagesBackdrop />}
        title={
          <>
            Your Bridal Look,{' '}
            {/* Own line, so the title stays clear of the hanging garlands on laptops */}
            <span className="block font-cormorant italic text-cocoa">Thoughtfully Packaged</span>
          </>
        }
        subtitle="Three bridal makeup finishes, each complete with hairstyling, saree draping and the finishing touches, for weddings within Chennai."
        padding="pt-16 pb-6 sm:pt-20 sm:pb-10 md:pt-20 md:pb-10"
      >
        {/* The three finishes at a glance; each jumps to (and highlights) its package card */}
        {/* Compact on phones so all three fit on one row */}
        <div className="mt-5 sm:mt-9 flex flex-wrap justify-center gap-1.5 sm:gap-3">
          {bridalPackages.map((pkg, i) => (
            <button
              key={pkg.id}
              type="button"
              onClick={() => {
                setSelectedId(pkg.id);
                // No explicit behavior, so it follows the page's smooth scrolling
                document.getElementById(`package-${pkg.id}`)?.scrollIntoView({ block: 'start' });
              }}
              className={`group inline-flex items-center gap-1.5 sm:gap-2 rounded-full border px-3 sm:px-4 py-2 font-inter text-[10px] sm:text-xs font-semibold uppercase tracking-[0.06em] sm:tracking-[0.18em] shadow-soft backdrop-blur-sm animate-fade-in transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mocha/50 ${
                selectedId === pkg.id
                  ? 'border-chocolate bg-chocolate text-ivory'
                  : 'border-sand bg-ivory/80 text-cocoa hover:border-mocha hover:text-chocolate'
              }`}
              style={{ animationDelay: `${0.3 + i * 0.15}s` }}
            >
              <Sparkles className={`hidden sm:block h-3.5 w-3.5 ${selectedId === pkg.id ? 'text-champagne' : 'text-mocha'}`} />
              {/* "Glossy" + "or Waterproof" reads as "Glossy / Waterproof"; other accents are descriptions, so dropped */}
              {pkg.finishAccent.startsWith('or ') ? `${pkg.finish} / ${pkg.finishAccent.slice(3)}` : pkg.finish}
              <ArrowDown className="hidden sm:block h-3 w-3 opacity-60 transition-transform duration-300 group-hover:translate-y-0.5" />
            </button>
          ))}
        </div>
      </PageHero>

      <section className="container mx-auto px-4 pt-6 pb-10 sm:pt-10 sm:pb-12 md:pt-10 md:pb-14 md:max-w-[90%]">
        {/* Booking toggle */}
        <div id="booking-options" className="relative scroll-mt-28 flex flex-col items-center gap-3 sm:gap-4 text-center">
          <p className="eyebrow">I'm booking for</p>
          <div
            role="group"
            aria-label="Booking type"
            className="grid w-full max-w-sm grid-cols-2 gap-1 rounded-[1.4rem] border border-sand bg-beige/70 p-1.5 shadow-soft sm:inline-flex sm:w-auto sm:max-w-full sm:gap-0 sm:rounded-full"
          >
            {modes.map((m) => {
              const active = mode === m.key;
              return (
                <button
                  key={m.key}
                  type="button"
                  onClick={() => setMode(m.key)}
                  aria-pressed={active}
                  className={`flex flex-col items-center justify-center rounded-2xl px-3 py-2.5 transition-all duration-300 sm:flex-row sm:gap-2 sm:rounded-full sm:px-6 [-webkit-tap-highlight-color:transparent] ${
                    active ? 'bg-chocolate text-ivory shadow-soft' : 'text-cocoa hover:text-chocolate'
                  }`}
                >
                  <span className="flex items-center gap-1.5 whitespace-nowrap font-inter text-[11px] sm:text-xs font-semibold uppercase tracking-[0.12em] sm:tracking-[0.2em]">
                    {m.key === 'combo' && <Gift className="h-3.5 w-3.5 shrink-0" />}
                    <span className="sm:hidden">{m.short}</span>
                    <span className="hidden sm:inline">{m.label}</span>
                  </span>
                  <span className={`mt-0.5 whitespace-nowrap font-inter text-[11px] sm:hidden ${active ? 'text-sand/80' : 'text-mocha'}`}>
                    {m.caption}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="font-inter text-sm text-mocha max-w-md">
            {mode === 'combo'
              ? 'Booking both ceremonies with us? Complimentary extras are now shown on every package.'
              : 'Prices are per session. Switch to Muhurtham + Reception to see the complimentary extras.'}
          </p>
          <Link to="/packages#booking-procedure" className="btn-outline !border-gray-300 !bg-gray-100 !px-4 !py-2.5 text-sm hover:!bg-gray-200 hover:!text-chocolate lg:absolute lg:right-0 lg:top-10">
            <CalendarCheck aria-hidden="true" className="h-4 w-4 shrink-0" />
            Booking Procedure
          </Link>
        </div>

        {/* Package cards */}
        <div
          ref={packageGrid}
          onPointerLeave={() => setHoveredId(null)}
          className="mt-8 sm:mt-10 grid gap-6 lg:gap-6 xl:gap-8 lg:grid-cols-3 lg:items-stretch max-w-xl lg:max-w-none mx-auto"
        >
          {bridalPackages.map((pkg, i) => (
            <PackageCard
              key={pkg.id}
              pkg={pkg}
              mode={mode}
              expanded={expanded}
              onToggleExpanded={() => setExpanded((v) => !v)}
              onShowCombo={() => setMode('combo')}
              delay={i * 120}
              active={pkg.id === activeId}
              onHover={() => setHoveredId(pkg.id)}
              onSelect={() => setSelectedId(pkg.id)}
            />
          ))}
        </div>

        {/* Add-ons + jewellery */}
        <div className="mt-7 sm:mt-9 grid gap-4 lg:grid-cols-5">
          <div className="card p-5 sm:p-6 lg:col-span-3">
            <p className="eyebrow">Good to know</p>
            <h3 className="mt-3 font-playfair text-2xl sm:text-3xl font-medium text-chocolate">
              Add-ons <span className="font-cormorant italic text-cocoa">&amp; extras</span>
            </h3>
            <dl className="mt-3 divide-y divide-sand/70">
              {packageAddOns.map((a) => (
                <div key={a.label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 py-3">
                  <dt className="font-inter text-[15px] font-medium text-chocolate">{a.label}</dt>
                  <dd className="font-cormorant text-xl italic text-cocoa">{a.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-3 font-inter text-sm text-mocha">
              Not included in package prices. Travel within Chennai is always included.
            </p>
          </div>

          {/* Bottom padding leaves room for the necklace wherever the card isn't stretched taller than its text */}
          <div className="relative overflow-hidden rounded-2xl bg-beige p-5 pb-32 sm:p-6 sm:pb-36 xl:pb-6 border border-sand lg:col-span-2">
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-champagne/40 blur-3xl" />
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-10 -right-6 h-56 w-56 rounded-full bg-champagne/30 blur-3xl" />

            {/* Jewellery illustrations */}
            <Jhumka thread={18} className="pointer-events-none absolute top-0 right-8 w-7 sm:right-12 sm:w-8" />
            <Jhumka thread={46} delay="-2.5s" className="pointer-events-none absolute top-0 right-20 w-6 sm:right-24 sm:w-7" />
            <Necklace className="pointer-events-none absolute -bottom-4 right-2 w-40 sm:w-44 sm:right-6 drop-shadow-[0_8px_14px_rgba(59,38,30,0.12)]" />
            <Sparkles aria-hidden="true" className="pointer-events-none absolute bottom-36 right-56 h-4 w-4 text-mocha/60 animate-twinkle motion-reduce:animate-none hidden sm:block" />
            <Sparkles aria-hidden="true" className="pointer-events-none absolute bottom-10 right-64 h-3 w-3 text-mocha/50 animate-twinkle motion-reduce:animate-none [animation-delay:-1.5s] hidden sm:block" />

            <div className="relative">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory text-cocoa ring-1 ring-champagne">
                <Gem className="h-5 w-5" />
              </span>
              <h3 className="mt-3 font-playfair text-2xl font-medium text-chocolate">Bridal Jewellery</h3>
              <p className="mt-3 font-inter text-[15px] leading-relaxed text-ink">
                Book the Airbrush package for both Muhurtham &amp; Reception and one session's rental of a full bridal jewellery set is included.
                Pick your favourite set from our jewellery collection.
              </p>
              <a
                href={JEWELLERY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline mt-4 !px-5 !py-3 text-sm"
              >
                <Instagram className="h-4 w-4" />
                @sk_bridal.collections
              </a>
            </div>
          </div>
        </div>

        {/* Add-on services by the team */}
        <div className="mt-10 grid overflow-hidden rounded-3xl border border-sand bg-beige/60 sm:mt-14 lg:grid-cols-[.85fr_1.65fr]">
          <div className="relative isolate overflow-hidden bg-chocolate p-5 text-ivory sm:p-8 xl:p-10">
            <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 -right-24 -z-10 h-80 w-64 rounded-t-full border border-champagne/20 p-4"><div className="h-full w-full rounded-t-full border border-champagne/15" /></div>
            <p className="font-inter text-xs font-semibold uppercase tracking-[0.25em] text-champagne">Add-on services</p>
            <div className="my-5 hidden h-px w-12 bg-champagne/60 sm:block" />
            <h3 className="font-playfair text-3xl font-medium leading-tight sm:text-4xl">
              <span className="mt-3 block text-2xl sm:hidden">Extra services for your wedding</span>
              <span className="hidden sm:block">Extra hands<span className="mt-1 block font-cormorant text-5xl italic text-champagne">on the day</span></span>
            </h3>
            <p className="mt-3 max-w-sm font-inter text-sm leading-relaxed text-sand/90 sm:mt-5">
              My trained team takes care of the little details, so you and your bridal party can enjoy every moment.
            </p>
            <p className="mt-4 flex items-start gap-2 border-t border-champagne/20 pt-3 font-inter text-sm leading-relaxed text-champagne sm:mt-6 sm:pt-4">
              <Plus aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />Available with a bridal package booking only.
            </p>
          </div>
          <ul className="grid gap-3 p-3 sm:grid-cols-2 sm:gap-4 sm:p-5 xl:p-6">
            {addOnServices.map((s, index) => {
              const Icon = [Gem, Brush, Sparkles, Clock][index];
              return (
                <li key={s.title} className="grid min-w-0 grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 gap-y-1 rounded-2xl border border-sand/80 bg-ivory p-4 sm:flex sm:flex-col sm:gap-0 sm:p-6">
                  <div className="row-span-3 flex items-start gap-3 sm:mb-4 sm:items-center" aria-hidden="true">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-champagne bg-beige text-cocoa"><Icon className="h-[18px] w-[18px]" strokeWidth={1.5} /></span>
                    <span className="hidden h-px flex-1 bg-sand/80 sm:block" />
                  </div>
                  <h4 className="col-start-2 font-inter text-base font-semibold leading-snug text-chocolate sm:font-playfair sm:text-xl sm:font-medium"><span className="sm:hidden">{s.mobileTitle}</span><span className="hidden sm:inline">{s.title}</span></h4>
                  <p className="col-start-2 text-sm leading-relaxed text-cocoa sm:mt-1 sm:font-cormorant sm:text-2xl sm:italic sm:leading-tight"><span className="sm:hidden">{s.mobileDescription}</span><span className="hidden sm:inline">{s.accent}</span></p>
                  {s.options.length > 0 && (
                    <ul className="col-start-2 mt-2 flex flex-wrap gap-x-3 gap-y-2 font-inter text-sm text-cocoa sm:mt-4 sm:border-t sm:border-sand/70 sm:pt-3">
                      {s.options.map((option) => (
                        <li key={option} className="flex items-center gap-1.5"><span aria-hidden="true" className="h-1 w-1 shrink-0 rounded-full bg-mocha" />{option}</li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>

        {/* Booking procedure */}
        <div id="booking-procedure" className="relative mt-10 scroll-mt-28 sm:mt-14 overflow-hidden rounded-[2rem] border border-sand bg-beige p-6 sm:p-10 xl:p-14">
          <div aria-hidden="true" className="pointer-events-none absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-blush/60 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-champagne/40 blur-3xl" />

          <div className="relative grid gap-10 lg:grid-cols-5 lg:gap-14">
            {/* Heading + date pass */}
            <div className="lg:col-span-2">
              <p className="eyebrow">Booking procedure</p>
              <h3 className="mt-3 font-playfair text-3xl sm:text-4xl xl:text-5xl font-medium leading-tight text-chocolate">
                Reserving <span className="font-cormorant italic text-cocoa">your date</span>
              </h3>
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-ivory px-4 py-1.5 font-inter text-[11px] font-semibold uppercase tracking-[0.25em] text-cocoa ring-1 ring-champagne">
                <Sparkles className="h-3.5 w-3.5" />
                First come, first served
              </p>

              <DatePass />
            </div>

            {/* Steps timeline */}
            <div className="flex min-w-0 flex-col gap-6 lg:col-span-3 lg:pt-2">
            <ol className="relative">
              {bookingSteps.map((s, i) => {
                const Icon = stepIcons[i];
                const last = i === bookingSteps.length - 1;
                return (
                  <li key={s.title} className="group relative flex gap-5 sm:gap-6 pb-8 last:pb-0">
                    {!last && (
                      <span aria-hidden="true" className="absolute left-7 top-16 bottom-2 w-px -translate-x-1/2 border-l-2 border-dashed border-champagne" />
                    )}
                    <span className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-ivory text-cocoa ring-1 ring-champagne shadow-soft transition-colors duration-500 group-hover:bg-chocolate group-hover:text-champagne">
                      <Icon className="h-6 w-6" />
                      <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-chocolate font-inter text-[11px] font-semibold text-ivory ring-2 ring-beige">
                        {i + 1}
                      </span>
                    </span>
                    <div className="flex-1 rounded-2xl bg-ivory/70 p-5 ring-1 ring-sand/70 transition-all duration-500 group-hover:bg-ivory group-hover:shadow-soft group-hover:translate-x-1">
                      <p className="font-inter text-[10px] font-semibold uppercase tracking-[0.35em] text-mocha">
                        Step {String(i + 1).padStart(2, '0')}
                      </p>
                      <h4 className="mt-1 font-playfair text-xl sm:text-2xl font-medium text-chocolate">{s.title}</h4>
                      <p className="mt-2 font-inter text-[15px] leading-relaxed text-ink">{s.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className="mt-auto rounded-2xl border border-sand bg-ivory/70 p-4 sm:p-5 lg:ml-20">
              <h4 className="mb-3 font-inter text-sm font-semibold text-cocoa">We accept</h4>
              <ul className="flex flex-wrap gap-2">
                {paymentMethods.map((method) => {
                  const Icon = paymentIcons[method] ?? Wallet;
                  return (
                    <li key={method} className="inline-flex items-center gap-2 rounded-lg border border-champagne/25 bg-chocolate px-3 py-2 font-inter text-sm text-ivory">
                      <Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-champagne" />
                      {method}
                    </li>
                  );
                })}
              </ul>
            </div>
            </div>
          </div>

          {/* Fine print */}
          <div className="relative mt-8 sm:mt-10 border-t border-sand pt-6 sm:pt-8">
            <p className="font-inter text-[11px] font-semibold uppercase tracking-[0.35em] text-mocha">Good to know</p>
            <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {bookingNotes.map((note) => {
                const Icon = noteIcon(note);
                return (
                  <li key={note} className="flex items-start gap-3 rounded-xl bg-ivory/70 p-4 ring-1 ring-sand/70 font-inter text-sm leading-snug text-ink">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-beige text-cocoa ring-1 ring-champagne">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="pt-1.5">{note}</span>
                  </li>
                );
              })}
            </ul>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Packages;

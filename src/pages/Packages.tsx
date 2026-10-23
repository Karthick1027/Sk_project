import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Check, Plus, Gift, Car, Sparkles, Gem, Brush, MessageCircle, ArrowRight, Instagram,
  Wallet, CalendarCheck, CalendarClock, Percent, Receipt, Lock,
} from 'lucide-react';
import PageHero from '../components/PageHero';
import CtaBanner from '../components/CtaBanner';
import { PackagesBackdrop } from '../components/PageBackdrops';
import {
  bridalPackages, packageAddOns, bookingAdvance, bookingSteps, bookingNotes, paymentMethods, BridalPackage,
} from '../data/packages';

const SEO_TITLE = 'Bridal Makeup Packages | SK Bridal Studio';
const SEO_DESCRIPTION =
  'Bridal makeup packages in Chennai by SK Bridal Studio: Airbrush, Glossy / Waterproof and HD / Matte finishes with hairstyling, saree draping and more.';

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

const noteIcon = (note: string) => {
  if (note.startsWith('All prices')) return Percent;
  if (note.includes('Travel')) return Car;
  if (note.includes('bill')) return Receipt;
  if (note.includes('Date')) return CalendarClock;
  return Lock;
};

const RESERVE_URL = `${WHATSAPP_URL}?text=${encodeURIComponent("Hi SK Bridal Studio! I'd like to check availability and reserve my date.")}`;

const formatPrice = (price: number) => `₹${price.toLocaleString('en-IN')}`;

const enquiryLink = (pkg: BridalPackage, mode: BookingMode) => {
  const booking = mode === 'combo' ? 'Muhurtham + Reception' : 'a single session';
  const text = `Hi SK Bridal Studio! I'd like to enquire about Package ${pkg.id} – ${pkg.finish} ${pkg.finishAccent} (${formatPrice(pkg.price)}) for ${booking}.`;
  return `${WHATSAPP_URL}?text=${encodeURIComponent(text)}`;
};

/**
 * Ticket-style advance card in 3D: it tilts toward the pointer (or tap) with a moving glare,
 * the text floats at different depths, and a back layer gives it thickness.
 * With no pointer on it, it sways gently so touch users still see the depth.
 */
const DatePass: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);

  const tilt = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    el.style.setProperty('--ry', `${(x - 0.5) * 20}deg`);
    el.style.setProperty('--rx', `${(0.5 - y) * 16}deg`);
    el.style.setProperty('--gx', `${x * 100}%`);
    el.style.setProperty('--gy', `${y * 100}%`);
  };

  const reset = () => {
    ref.current?.style.setProperty('--rx', '0deg');
    ref.current?.style.setProperty('--ry', '0deg');
  };

  return (
    <div className="relative mt-10 [perspective:1100px]">
      {/* Soft ground shadow */}
      <div aria-hidden="true" className="absolute inset-x-10 -bottom-5 h-10 rounded-full bg-chocolate/35 blur-2xl" />

      <div className="animate-sway-3d hover:[animation-play-state:paused] motion-reduce:animate-none [transform-style:preserve-3d]">
        <div
          ref={ref}
          onPointerMove={tilt}
          onPointerDown={tilt}
          onPointerLeave={reset}
          className="group relative rounded-3xl text-ivory transition-transform duration-200 ease-out [transform-style:preserve-3d]"
          style={{ transform: 'rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg))' }}
        >
          {/* Back layer: the card's thickness, visible as it tilts */}
          <div aria-hidden="true" className="absolute inset-0 rounded-3xl bg-[#1d120d] shadow-luxe [transform:translateZ(-18px)]" />

          {/* Card face */}
          <div aria-hidden="true" className="absolute inset-0 overflow-hidden rounded-3xl bg-gradient-to-br from-[#5a3d30] via-chocolate to-[#241610] ring-1 ring-champagne/30">
            <div className="absolute -right-10 -top-12 h-40 w-40 rounded-full bg-champagne/25 blur-2xl" />
            <div className="absolute inset-2 rounded-[1.25rem] border border-champagne/25" />
            <div
              className="absolute inset-0 opacity-60 transition-opacity duration-300 group-hover:opacity-100"
              style={{ background: 'radial-gradient(circle at var(--gx, 25%) var(--gy, 0%), rgba(255,252,246,0.22), transparent 55%)' }}
            />
          </div>

          {/* Content, layered at different depths */}
          <div className="relative px-6 py-7 sm:px-8 [transform-style:preserve-3d]">
            <div className="flex items-start justify-between gap-4 [transform:translateZ(30px)]">
              <p className="font-inter text-[11px] font-semibold uppercase tracking-[0.35em] text-champagne">Advance per session</p>
              <CalendarCheck className="h-6 w-6 shrink-0 text-champagne" />
            </div>
            <p className="mt-4 font-playfair text-5xl sm:text-6xl font-semibold leading-none [text-shadow:0_10px_24px_rgba(0,0,0,0.45)] [transform:translateZ(70px)]">
              {formatPrice(bookingAdvance)}
            </p>
            <p className="mt-3 font-cormorant text-xl italic text-sand/90 [transform:translateZ(40px)]">
              Secures your date · Non-refundable
            </p>

            {/* Perforated tear line with half-circle notches at the card edges */}
            <div aria-hidden="true" className="relative my-6 border-t-2 border-dashed border-champagne/30">
              <span className="absolute -left-6 sm:-left-8 -top-3 h-6 w-3 rounded-r-full bg-beige" />
              <span className="absolute -right-6 sm:-right-8 -top-3 h-6 w-3 rounded-l-full bg-beige" />
            </div>

            <a
              href={RESERVE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-light w-full shadow-[0_14px_30px_-12px_rgba(0,0,0,0.6)] [transform:translateZ(50px)]"
            >
              <MessageCircle className="h-4 w-4" />
              Reserve on WhatsApp
            </a>
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
  /** The active (hovered) card is rendered dark. */
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
      // Hover only for a real mouse; touch browsers fire a fake hover on tap that never clears
      onPointerEnter={(e) => e.pointerType === 'mouse' && onHover()}
      onClick={onSelect}
      className={`color-fade relative flex flex-col cursor-pointer rounded-[1.75rem] border p-6 sm:p-8 xl:p-10 animate-fade-in transition-[background-color,border-color,box-shadow,margin] duration-300 ${
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
          className={`font-cormorant text-6xl sm:text-7xl italic leading-none ${dark ? 'text-champagne/30' : 'text-champagne/70'}`}
        >
          {String(pkg.id).padStart(2, '0')}
        </span>
      </div>

      {/* Title + price */}
      <h3 className="relative mt-4 font-playfair text-3xl sm:text-4xl font-medium leading-tight">
        <span className={dark ? 'text-ivory' : 'text-chocolate'}>{pkg.finish}</span>
        <span className={`block font-cormorant italic font-medium ${dark ? 'text-champagne' : 'text-cocoa'}`}>
          {pkg.finishAccent}
        </span>
      </h3>

      <div className="relative mt-6 flex items-end gap-3">
        <span className={`font-playfair text-4xl sm:text-5xl font-semibold leading-none ${dark ? 'text-ivory' : 'text-chocolate'}`}>
          {formatPrice(pkg.price)}
        </span>
        <span className={`pb-1 font-inter text-xs uppercase tracking-[0.2em] ${dark ? 'text-sand/70' : 'text-mocha'}`}>
          / session
        </span>
      </div>

      <p className={`relative mt-5 font-inter text-[15px] leading-relaxed ${dark ? 'text-sand/90' : 'text-ink'}`}>
        {pkg.description}
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
          className={`${dark ? 'btn-light' : 'btn-primary'} mt-6 w-full`}
        >
          <MessageCircle className="h-4 w-4" />
          Enquire on WhatsApp
        </a>
      </div>
    </article>
  );
};

const Packages: React.FC = () => {
  const [mode, setMode] = useState<BookingMode>('single');
  // Shared across cards so the three columns stay the same height
  const [expanded, setExpanded] = useState(false);
  // The hovered card turns dark; otherwise the clicked/tapped one does, so touch users get it too.
  // With neither, every card stays light.
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const activeId = hoveredId ?? selectedId;

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

  const modes: { key: BookingMode; label: string }[] = [
    { key: 'single', label: 'Single Session' },
    { key: 'combo', label: 'Muhurtham + Reception' },
  ];

  return (
    <div className="pt-20 min-h-screen bg-ivory">
      <PageHero
        eyebrow="Bridal Packages"
        backdrop={<PackagesBackdrop />}
        title={
          <>
            Your Bridal Look,{' '}
            <span className="font-cormorant italic text-cocoa">Thoughtfully Packaged</span>
          </>
        }
        subtitle="Three bridal makeup finishes, each complete with hairstyling, saree draping and the finishing touches, for weddings within Chennai."
      />

      <section className="container mx-auto px-4 py-12 sm:py-16 md:py-20 md:max-w-[90%]">
        {/* Booking toggle */}
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="eyebrow">I'm booking for</p>
          <div role="group" aria-label="Booking type" className="inline-flex max-w-full rounded-full border border-sand bg-beige/70 p-1.5 shadow-soft">
            {modes.map((m) => (
              <button
                key={m.key}
                type="button"
                onClick={() => setMode(m.key)}
                aria-pressed={mode === m.key}
                className={`flex items-center gap-2 rounded-full px-4 sm:px-6 py-2.5 font-inter text-[11px] sm:text-xs font-semibold uppercase tracking-[0.15em] sm:tracking-[0.2em] transition-all duration-300 ${
                  mode === m.key ? 'bg-chocolate text-ivory shadow-soft' : 'text-cocoa hover:text-chocolate'
                }`}
              >
                {m.key === 'combo' && <Gift className="h-3.5 w-3.5 shrink-0" />}
                {m.label}
              </button>
            ))}
          </div>
          <p className="font-inter text-sm text-mocha max-w-md">
            {mode === 'combo'
              ? 'Booking both ceremonies with us? Complimentary extras are now shown on every package.'
              : 'Prices are per session. Switch to Muhurtham + Reception to see the complimentary extras.'}
          </p>
        </div>

        {/* Package cards */}
        <div
          onPointerLeave={() => setHoveredId(null)}
          className="mt-12 sm:mt-16 grid gap-6 lg:gap-6 xl:gap-8 lg:grid-cols-3 lg:items-stretch max-w-xl lg:max-w-none mx-auto"
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
        <div className="mt-16 sm:mt-20 grid gap-6 lg:grid-cols-5">
          <div className="card p-6 sm:p-8 lg:col-span-3">
            <p className="eyebrow">Good to know</p>
            <h3 className="mt-3 font-playfair text-2xl sm:text-3xl font-medium text-chocolate">
              Add-ons <span className="font-cormorant italic text-cocoa">&amp; extras</span>
            </h3>
            <dl className="mt-6 divide-y divide-sand/70">
              {packageAddOns.map((a) => (
                <div key={a.label} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
                  <dt className="font-inter text-[15px] font-medium text-chocolate">{a.label}</dt>
                  <dd className="font-cormorant text-xl italic text-cocoa">{a.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 font-inter text-sm text-mocha">
              Not included in package prices. Travel within Chennai is always included.
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl bg-beige p-6 sm:p-8 border border-sand lg:col-span-2">
            <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-champagne/40 blur-3xl" />
            <div className="relative">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-ivory text-cocoa ring-1 ring-champagne">
                <Gem className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-playfair text-2xl font-medium text-chocolate">Bridal Jewellery</h3>
              <p className="mt-3 font-inter text-[15px] leading-relaxed text-ink">
                Book both Muhurtham &amp; Reception and one session's rental of a full bridal jewellery set is included.
                Pick your favourite set from our jewellery collection.
              </p>
              <a
                href={JEWELLERY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-outline mt-6 !px-5 !py-3 text-sm"
              >
                <Instagram className="h-4 w-4" />
                @sk_bridal.collections
              </a>
            </div>
          </div>
        </div>

        {/* Booking procedure */}
        <div className="relative mt-16 sm:mt-20 overflow-hidden rounded-[2rem] border border-sand bg-beige p-6 sm:p-10 xl:p-14">
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
            <ol className="relative lg:col-span-3 lg:pt-2">
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
          </div>

          {/* Fine print + payment */}
          <div className="relative mt-10 sm:mt-12 border-t border-sand pt-8 sm:pt-10">
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

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="mr-1 font-inter text-[11px] font-semibold uppercase tracking-[0.35em] text-mocha">We accept</span>
              {paymentMethods.map((m) => (
                <span key={m} className="rounded-full bg-chocolate px-4 py-1.5 font-inter text-xs font-medium tracking-wide text-ivory shadow-soft">
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <CtaBanner
        eyebrow="Still deciding?"
        title="Let's find the finish that's made for you"
        text="Share your wedding date, venue and the look you love. We'll help you choose the package that suits your skin and your celebration."
      >
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-light">
          <MessageCircle className="h-4 w-4" />
          Chat on WhatsApp
        </a>
        <Link to="/contact" className="btn-ghost-light">
          Contact Us
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CtaBanner>
    </div>
  );
};

export default Packages;

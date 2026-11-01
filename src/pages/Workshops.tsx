import React, { useEffect, useId, useState } from 'react';
import {
  Instagram, ArrowDown, Sparkles, Check, Info, Radio, VideoOff, ShieldCheck, MonitorPlay, MessagesSquare, Award,
  type LucideIcon,
} from 'lucide-react';
import SectionHeading from '../components/SectionHeading';
import CtaBanner from '../components/CtaBanner';
import heroImage from '../images/gallery/client_2151.jpg';
import polaroidImage from '../images/gallery/client_2175.jpg';
import muhurthamImage from '../images/gallery/client_2170.jpg';
import receptionImage from '../images/gallery/client_2163.jpg';

const INSTAGRAM_URL = 'https://instagram.com/srinithimakeupartist';
// Opens a DM thread straight away in the Instagram app or web
const DM_URL = 'https://ig.me/m/srinithimakeupartist';

interface Highlight {
  label: string;
  title: string;
  text: string;
  /** Skin-tone swatches the look is demonstrated on */
  swatches?: string[];
}

interface WorkshopDay {
  num: string;
  title: string;
  accent: string;
  tagline: string;
  image: string;
  description: string;
  highlights: Highlight[];
  learn: string[];
  note?: string;
}

const days: WorkshopDay[] = [
  {
    num: '01',
    title: 'Muhurtham',
    accent: 'Look',
    tagline: 'Timeless South Indian bridal, made skin-true.',
    image: muhurthamImage,
    description:
      'The traditional muhurtham bride, taught in depth on a medium-fair skin makeover with an airbrush foundation base. Timeless elegance with balanced tones and authentic skin that looks real up close and in every photo.',
    highlights: [
      {
        label: 'The look',
        title: 'South Indian bridal',
        text: 'Timeless traditional elegance, balanced tones, authentic skin.',
      },
      {
        label: 'Demonstrated on',
        title: 'Medium-fair skin',
        text: 'A full makeover, matched precisely to the skin’s natural undertone.',
        swatches: ['#C99476', '#D9A98A', '#E8C1A4'],
      },
      {
        label: 'The technique',
        title: 'Airbrush foundation',
        text: 'A seamless, lightweight base that stays flawless from morning rituals to photos.',
      },
    ],
    learn: [
      'Understanding skin types and undertones for flawless base creation',
      "Correcting skin tone to match the bride's natural complexion",
      'Airbrush foundation technique for a seamless, long-wear base',
      'Bringing out the glow without heavy layering',
      'Complete vanity reveal and product knowledge',
    ],
    note: 'Hairstyling is not covered in this session.',
  },
  {
    num: '02',
    title: 'Reception',
    accent: 'Look',
    tagline: 'Evening glam, and curls with extensions that last all night.',
    image: receptionImage,
    description:
      'The evening reception bride, taught on a deep-dusky skin makeover: glam designed to enhance depth, not hide it, with precise undertone matching and radiant evening luminosity. Finished with a curls hairstyle, styled with extensions, that holds all night.',
    highlights: [
      {
        label: 'The look',
        title: 'Wedding evening glam',
        text: 'Skin-true bridal glam with radiant evening luminosity.',
      },
      {
        label: 'Demonstrated on',
        title: 'Deep-dusky skin',
        text: 'A full makeover that enhances depth instead of hiding it.',
        swatches: ['#6E4430', '#83543B', '#9A6646'],
      },
      {
        label: 'The hair',
        title: 'Curls with extensions',
        text: 'Long-lasting curls with hair extensions for open reception hair.',
      },
    ],
    learn: [
      'Matching undertones precisely on deep-dusky skin',
      'Building evening luminosity that photographs beautifully',
      'Curls hairstyle with extensions that lasts all night',
      'Time-saving hacks for real bridal bookings',
      'Makeup guidance from my real bridal experience',
    ],
  },
];

const marqueeItems = [
  'Muhurtham bridal', 'Airbrush foundation', 'Reception glam', 'Undertone matching',
  'Complete vanity reveal', 'Curls with extensions', 'Extended live Q&A', 'Digital completion certificate',
];

const essentials: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: VideoOff, title: 'No recordings', text: 'Sessions are live only, so join in real time.' },
  { icon: ShieldCheck, title: 'Secure access', text: 'You join through a professional, private app.' },
  { icon: MonitorPlay, title: 'Crystal-clear HD', text: 'Every brush stroke streamed in high definition.' },
  { icon: MessagesSquare, title: 'Extended Q&A', text: 'Time set aside to clear every doubt you bring.' },
];

const steps = [
  { title: 'Send a DM', text: 'Message @srinithimakeupartist on Instagram to ask for a seat.' },
  { title: 'Get your details', text: "You'll receive the fee, the schedule and how to confirm." },
  { title: 'Join live', text: 'Log in through the secure app link and learn in real time.' },
];

/** Circular "Live · Online" sticker whose text slowly rotates */
const SpinBadge: React.FC = () => {
  const pathId = `ws-badge-${useId().replace(/:/g, '')}`;
  return (
    <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-ivory shadow-luxe ring-1 ring-champagne sm:h-32 sm:w-32">
      <svg viewBox="0 0 120 120" aria-hidden="true" className="absolute inset-0 h-full w-full animate-[spin_20s_linear_infinite] motion-reduce:animate-none">
        <defs>
          <path id={pathId} d="M60,60 m-44,0 a44,44 0 1,1 88,0 a44,44 0 1,1 -88,0" />
        </defs>
        <text className="fill-cocoa font-inter text-[9.5px] font-semibold uppercase tracking-[0.28em]">
          <textPath href={`#${pathId}`}>Live · Online · 2-Day Workshop ·</textPath>
        </text>
      </svg>
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-chocolate text-champagne">
        <Radio className="h-5 w-5" />
      </span>
    </div>
  );
};

/** Illustrated preview of the digital completion certificate */
const CertificatePreview: React.FC = () => (
  <div
    role="img"
    aria-label="Sample digital certificate of completion from SK Bridal Studio, signed by Srinithi"
    className="relative mx-auto w-full max-w-md rotate-[-2deg] transition-transform duration-500 hover:rotate-0"
  >
    <div className="relative aspect-[1.414/1] rounded-md bg-ivory p-2 shadow-luxe sm:p-2.5">
      {/* Double frame */}
      <div className="flex h-full flex-col items-center justify-between rounded-sm border-2 border-champagne px-4 py-3 text-center outline outline-1 outline-offset-[-7px] outline-champagne/60 sm:px-6 sm:py-5">
        {/* Corner flourishes */}
        {['left-2 top-2', 'right-2 top-2 rotate-90', 'bottom-2 right-2 rotate-180', 'bottom-2 left-2 -rotate-90'].map((pos) => (
          <span key={pos} aria-hidden="true" className={`absolute h-4 w-4 border-l-2 border-t-2 border-mocha/50 sm:h-5 sm:w-5 ${pos}`} />
        ))}

        <div>
          <p className="font-inter text-[7px] font-semibold uppercase tracking-[0.35em] text-mocha sm:text-[9px]">SK Bridal Studio</p>
          <p className="mt-1 font-playfair text-base font-medium uppercase leading-none tracking-[0.12em] text-chocolate sm:mt-1.5 sm:text-xl">
            Certificate
          </p>
          <p className="mt-0.5 font-cormorant text-xs italic text-cocoa sm:text-base">of Completion</p>
        </div>

        <div className="w-full">
          <p className="font-inter text-[6px] uppercase tracking-[0.25em] text-mocha sm:text-[8px]">Proudly presented to</p>
          <p className="mx-auto mt-0.5 w-3/4 border-b border-champagne pb-0.5 font-script text-xl leading-tight text-chocolate sm:text-3xl">
            Your Name
          </p>
          <p className="mt-1 font-inter text-[6px] leading-snug text-ink sm:mt-1.5 sm:text-[8.5px]">
            for completing the 2-Day Live Bridal Makeup &amp; Hair Masterclass
          </p>
        </div>

        <div className="flex w-full items-end justify-between gap-2">
          <div className="w-1/3 text-center">
            <p className="font-script text-base leading-none text-cocoa sm:text-2xl">Srinithi</p>
            <p className="mt-0.5 border-t border-champagne pt-0.5 font-inter text-[5.5px] uppercase tracking-[0.2em] text-mocha sm:text-[7px]">Makeup Artist</p>
          </div>
          <div className="w-1/3 text-center">
            <p className="font-cormorant text-xs italic leading-none text-cocoa sm:text-base">Live · Online</p>
            <p className="mt-0.5 border-t border-champagne pt-0.5 font-inter text-[5.5px] uppercase tracking-[0.2em] text-mocha sm:text-[7px]">Workshop</p>
          </div>
        </div>
      </div>

      {/* Seal with ribbon tails */}
      <div aria-hidden="true" className="absolute -bottom-5 left-1/2 -translate-x-1/2 sm:-bottom-6">
        <span className="absolute left-1/2 top-6 h-8 w-3 -translate-x-[110%] rotate-[18deg] bg-cocoa [clip-path:polygon(0_0,100%_0,100%_100%,50%_80%,0_100%)] sm:top-8 sm:h-10 sm:w-4" />
        <span className="absolute left-1/2 top-6 h-8 w-3 translate-x-[10%] -rotate-[18deg] bg-cocoa [clip-path:polygon(0_0,100%_0,100%_100%,50%_80%,0_100%)] sm:top-8 sm:h-10 sm:w-4" />
        <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-champagne to-mocha text-chocolate shadow-soft ring-4 ring-ivory sm:h-14 sm:w-14">
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-dashed border-chocolate/50 sm:h-10 sm:w-10">
            <Award className="h-4 w-4 sm:h-5 sm:w-5" />
          </span>
        </span>
      </div>
    </div>
  </div>
);

const Workshops: React.FC = () => {
  const [active, setActive] = useState(0);
  const day = days[active];

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Live Makeup & Hair Workshops | SK Bridal Studio';
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <div className="pt-20 min-h-screen bg-ivory">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-beige to-ivory">
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 -left-32 h-96 w-96 rounded-full bg-blush/50 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 right-0 h-96 w-96 rounded-full bg-champagne/30 blur-3xl" />

        <div className="relative container mx-auto grid items-center gap-12 px-4 pt-6 pb-8 sm:py-14 md:max-w-[90%] lg:grid-cols-[1.1fr_0.9fr] lg:gap-10 lg:py-16">
          <div className="text-center lg:text-left animate-fade-in">
            <span className="inline-flex items-center gap-2.5 rounded-full border border-champagne bg-ivory/80 px-4 py-2 font-inter text-[11px] font-semibold uppercase tracking-[0.3em] text-cocoa">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-clay animate-ping motion-reduce:hidden" />
                <span className="relative h-2 w-2 rounded-full bg-clay" />
              </span>
              Live Virtual Masterclass
            </span>

            <h1 className="mt-5 sm:mt-7 font-playfair text-5xl sm:text-6xl xl:text-7xl font-medium leading-[1.05] text-chocolate">
              Two sessions.
              <br />
              Two styles.
              <br />
              <span className="font-cormorant italic text-cocoa">Mastered live.</span>
            </h1>

            <p className="mx-auto mt-4 sm:mt-7 max-w-xl font-inter text-base sm:text-lg leading-relaxed text-ink lg:mx-0">
              A two-day interactive virtual masterclass with Srinithi: the muhurtham look on the first day, the
              reception look on the second. Demonstrated as it happens, with all your questions answered along the way.
            </p>

            <dl className="mx-auto mt-5 sm:mt-9 grid max-w-md grid-cols-3 divide-x divide-sand rounded-2xl border border-sand bg-ivory/70 py-3 sm:py-4 lg:mx-0">
              {[
                ['02', 'Days'],
                ['02', 'Bridal looks'],
                ['01', 'Curls Hairstyle'],
              ].map(([n, label]) => (
                <div key={label} className="px-2 text-center">
                  <dt className="sr-only">{label}</dt>
                  <dd className="font-cormorant text-3xl sm:text-4xl italic leading-none text-chocolate">{n}</dd>
                  <dd className="mt-1 sm:mt-1.5 font-inter text-[10px] font-semibold uppercase leading-snug tracking-[0.1em] sm:tracking-[0.2em] text-mocha">{label}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-6 sm:mt-9 flex flex-col gap-3 sm:gap-4 sm:flex-row sm:justify-center lg:justify-start">
              <a href={DM_URL} target="_blank" rel="noopener noreferrer" className="btn-primary !py-3 sm:!py-3.5">
                <Instagram className="h-4 w-4" />
                DM to Register
              </a>
              <a href="#programme" className="btn-outline !py-3 sm:!py-3.5">
                Explore the 2 Days
                <ArrowDown className="h-4 w-4" />
              </a>
            </div>
            <p className="mt-3 sm:mt-4 font-inter text-sm text-mocha">Registration by Instagram DM only. No calls, please.</p>
          </div>

          {/* Photo collage */}
          <div className="relative mx-auto w-full max-w-sm sm:max-w-md">
            <div className="relative aspect-[4/5] overflow-hidden rounded-t-full rounded-b-[2rem] border-[6px] border-ivory shadow-luxe">
              <img
                src={heroImage}
                alt="Srinithi finishing a bride's makeup"
                decoding="async"
                className="h-full w-full object-cover object-[50%_30%]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-chocolate/40 via-transparent to-transparent" />
            </div>

            <figure className="absolute -bottom-10 -left-4 w-36 rotate-[-7deg] rounded-md bg-ivory p-2 pb-3 shadow-luxe transition-transform duration-500 hover:rotate-0 sm:-left-12 sm:w-44">
              <img src={polaroidImage} alt="" loading="lazy" decoding="async" className="aspect-square w-full rounded-sm object-cover object-top" />
              <figcaption className="mt-2 text-center font-script text-2xl leading-none text-cocoa">Learn with me</figcaption>
            </figure>

            <div className="absolute -right-3 -top-6 sm:-right-10">
              <SpinBadge />
            </div>
          </div>
        </div>
      </section>

      {/* Topic ribbon */}
      <div className="overflow-hidden bg-chocolate py-5 [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
        <ul className="flex w-max animate-marquee items-center motion-reduce:animate-none">
          {[...marqueeItems, ...marqueeItems].map((item, i) => (
            <li
              key={`${item}-${i}`}
              aria-hidden={i >= marqueeItems.length}
              className="flex items-center whitespace-nowrap px-6 font-cormorant text-2xl italic text-sand"
            >
              {item}
              <Sparkles className="ml-12 h-4 w-4 text-champagne" />
            </li>
          ))}
        </ul>
      </div>

      {/* Programme */}
      <section id="programme" className="scroll-mt-24 py-10 md:py-16">
        <div className="container mx-auto px-4 md:max-w-[90%]">
          <SectionHeading
            eyebrow="The Programme"
            title={
              <>
                Two Days, <span className="font-cormorant italic text-cocoa">Two Bridal Looks</span>
              </>
            }
            subtitle="Both looks are taught in depth, using techniques refined through real bridal experience, to bridge the gap between model practice and a real bride. Pick a day to see what's covered."
            className="mb-8 md:mb-10"
          />

          {/* Day switcher */}
          <div role="tablist" aria-label="Workshop days" className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-2">
            {days.map((d, i) => {
              const selected = i === active;
              return (
                <button
                  key={d.num}
                  type="button"
                  role="tab"
                  id={`day-tab-${d.num}`}
                  aria-selected={selected}
                  aria-controls="day-panel"
                  onClick={() => setActive(i)}
                  className={`group relative flex items-center gap-4 sm:gap-5 overflow-hidden rounded-3xl sm:rounded-[1.75rem] border px-5 py-3.5 text-left transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-ivory sm:p-6 ${
                    selected
                      ? 'border-chocolate bg-chocolate text-ivory shadow-luxe'
                      : 'border-sand bg-ivory text-chocolate shadow-soft hover:-translate-y-0.5 hover:border-champagne'
                  }`}
                >
                  <span
                    className={`font-cormorant text-5xl italic leading-none sm:text-7xl ${selected ? 'text-champagne' : 'text-champagne/80'}`}
                  >
                    {d.num}
                  </span>
                  <span>
                    <span className={`block font-inter text-[11px] font-semibold uppercase tracking-[0.3em] ${selected ? 'text-champagne' : 'text-mocha'}`}>
                      Day {d.num}
                    </span>
                    <span className="mt-1 sm:mt-1.5 block font-playfair text-lg font-medium leading-snug sm:text-2xl">
                      {d.title} {d.accent}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* Selected day */}
          <div
            key={day.num}
            id="day-panel"
            role="tabpanel"
            aria-labelledby={`day-tab-${day.num}`}
            className="mt-10 grid items-start gap-10 animate-fade-in lg:mt-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12"
          >
            <div className="relative mx-auto w-[calc(100%-2rem)] max-w-sm lg:sticky lg:top-28">
              <div aria-hidden="true" className="absolute -inset-4 rounded-t-full border border-champagne" />
              <div className="relative aspect-[4/5] rounded-t-full bg-gradient-to-b from-champagne via-mocha to-champagne p-1.5 shadow-luxe">
                <div className="h-full w-full overflow-hidden rounded-t-full bg-sand">
                  <img
                    src={day.image}
                    alt={`${day.title} ${day.accent} workshop`}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover object-top"
                  />
                </div>
              </div>
              <span className="card absolute -bottom-6 -right-4 flex flex-col items-center justify-center px-5 py-3 animate-float sm:-right-8">
                <span className="font-inter text-[10px] font-semibold uppercase tracking-[0.3em] text-mocha">Day</span>
                <span className="font-cormorant text-4xl italic leading-none text-cocoa">{day.num}</span>
              </span>
            </div>

            <div className="text-center lg:text-left">
              <h2 className="font-playfair text-4xl sm:text-5xl font-medium leading-tight text-chocolate">
                {day.title} <span className="font-cormorant italic text-cocoa">{day.accent}</span>
              </h2>
              <p className="mt-3 font-cormorant text-2xl italic text-mocha">{day.tagline}</p>
              <div className="ornament mx-auto mt-6 lg:mx-0" />
              <p className="mx-auto mt-6 max-w-2xl font-inter text-base sm:text-lg leading-relaxed text-ink lg:mx-0">
                {day.description}
              </p>

              <div className="mt-9 grid gap-4 text-left sm:grid-cols-2">
                {day.highlights.map((h) => (
                  // An odd card out at the end spans the full row
                  <article key={h.label} className="card relative p-6 sm:last:odd:col-span-2">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-inter text-[11px] font-semibold uppercase tracking-[0.3em] text-mocha">{h.label}</p>
                      {h.swatches && (
                        <span className="flex -space-x-1.5" aria-hidden="true">
                          {h.swatches.map((c) => (
                            <span key={c} className="h-5 w-5 rounded-full ring-2 ring-ivory" style={{ backgroundColor: c }} />
                          ))}
                        </span>
                      )}
                    </div>
                    <h3 className="mt-3 font-playfair text-2xl font-medium text-chocolate">{h.title}</h3>
                    <p className="mt-2 font-inter text-sm leading-relaxed text-ink">{h.text}</p>
                  </article>
                ))}
              </div>

              <div className="mt-10 text-left">
                <p className="eyebrow">What you'll learn</p>
                <ol className="mt-5 grid gap-3 sm:grid-cols-2">
                  {day.learn.map((item, i) => (
                    <li key={item} className="flex items-start gap-3 rounded-2xl border border-sand bg-beige/50 p-4">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-chocolate font-inter text-[11px] font-semibold text-champagne">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="font-inter text-sm leading-relaxed text-ink">{item}</span>
                    </li>
                  ))}
                </ol>
                {day.note && (
                  <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-blush/60 px-4 py-2 font-inter text-xs font-medium text-cocoa">
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    {day.note}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Before you join */}
      <section className="relative overflow-hidden bg-beige py-10 md:py-16">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-blush/60 blur-3xl" />
        <div className="relative container mx-auto px-4 md:max-w-[90%]">
          <SectionHeading
            eyebrow="Before You Join"
            title="Good to Know"
            subtitle="How the live sessions run, so you can plan your day"
            className="mb-8 md:mb-10"
          />
          {/* Compact rows on phones (icon beside the text); centred cards from sm up */}
          <div className="mx-auto grid max-w-5xl gap-3 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {essentials.map((e) => (
              <div key={e.title} className="group card flex items-center gap-4 p-4 text-left transition-transform duration-300 hover:-translate-y-1 sm:block sm:p-6 sm:text-center">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-beige text-cocoa ring-1 ring-champagne transition-colors duration-300 group-hover:bg-chocolate group-hover:text-champagne sm:mx-auto sm:h-14 sm:w-14">
                  <e.icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </span>
                <div>
                  <h3 className="font-playfair text-lg font-medium text-chocolate sm:mt-5 sm:text-xl">{e.title}</h3>
                  <p className="mt-0.5 font-inter text-sm leading-relaxed text-ink sm:mt-2">{e.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Certificate callout */}
          <div className="mx-auto mt-6 grid max-w-5xl items-center gap-10 overflow-hidden rounded-[1.75rem] bg-chocolate px-6 pb-12 pt-8 text-center shadow-luxe sm:mt-8 sm:px-10 sm:pb-14 md:grid-cols-[1fr_1.1fr] md:py-12 md:text-left">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-champagne/50 px-3.5 py-1.5 font-inter text-[11px] font-semibold uppercase tracking-[0.3em] text-champagne">
                <Award className="h-3.5 w-3.5" />
                Included
              </span>
              <h3 className="mt-4 font-playfair text-2xl font-medium leading-tight text-ivory sm:text-3xl">
                Digital <span className="font-cormorant italic text-champagne">Completion Certificate</span>
              </h3>
              <p className="mx-auto mt-3 max-w-md font-inter text-sm leading-relaxed text-sand sm:text-base md:mx-0">
                Every participant receives a digital certificate of completion at the end of the workshop.
              </p>
            </div>
            <CertificatePreview />
          </div>
        </div>
      </section>

      {/* How to register */}
      <section className="py-10 md:py-16 bg-ivory">
        <div className="container mx-auto px-4 md:max-w-[90%]">
          <SectionHeading
            eyebrow="How to Register"
            title={
              <>
                Three Steps to <span className="font-cormorant italic text-cocoa">Your Seat</span>
              </>
            }
            className="mb-8 md:mb-10"
          />
          <div className="relative mx-auto max-w-5xl">
            <div aria-hidden="true" className="absolute left-[16.67%] right-[16.67%] top-8 hidden border-t-2 border-dashed border-champagne md:block" />
            <ol className="relative grid gap-10 md:grid-cols-3 md:gap-8">
              {steps.map((s, i) => (
                <li key={s.title} className="relative text-center">
                  <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-chocolate font-cormorant text-3xl italic text-champagne ring-8 ring-ivory">
                    {i === steps.length - 1 ? <Check className="h-7 w-7" /> : i + 1}
                  </span>
                  <h3 className="mt-5 font-playfair text-2xl font-medium text-chocolate">{s.title}</h3>
                  <p className="mx-auto mt-2 max-w-xs font-inter text-sm leading-relaxed text-ink">{s.text}</p>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-8 text-center">
            <a href={DM_URL} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <Instagram className="h-4 w-4" />
              DM to Register
            </a>
          </div>
        </div>
      </section>

      <CtaBanner
        eyebrow="Learn With Me"
        title="New Workshops Are Announced on Instagram First"
        text="Follow along so you never miss a session, or send a DM now to save your place."
      >
        <a href={DM_URL} target="_blank" rel="noopener noreferrer" className="btn-light">
          <Instagram className="h-4 w-4" />
          DM to Register
        </a>
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost-light">
          Follow @srinithimakeupartist
        </a>
      </CtaBanner>
    </div>
  );
};

export default Workshops;

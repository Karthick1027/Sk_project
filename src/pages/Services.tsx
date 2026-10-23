import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brush, Flower2, Sparkles, Gift, Eye, Aperture, Feather, Gem, MessageCircle, ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import PageHero from '../components/PageHero';
import SectionHeading from '../components/SectionHeading';
import CtaBanner from '../components/CtaBanner';
import GiftCelebration from '../components/GiftCelebration';
import makeupImage from '../images/gallery/client_2149.jpg';
import hairImage from '../images/gallery/client_2167.jpg';
import drapingImage from '../images/Garden_wedding.jpeg';

const WHATSAPP_URL = 'https://wa.me/918668038093';

interface Service {
  title: string;
  accent: string;
  icon: LucideIcon;
  image: string;
  position: string;
  description: string;
  highlights: string[];
}

const services: Service[] = [
  {
    title: 'Bridal',
    accent: 'Makeup',
    icon: Brush,
    image: makeupImage,
    position: 'object-bottom',
    description:
      "Pick an HD or airbrush finish, blended to suit your skin's natural undertone. The result is smooth, smudge-proof and camera-ready, staying fresh from the morning muhurtham right through to the evening reception.",
    highlights: ['HD finish', 'Airbrush', 'Undertone matched', 'Smudge-proof'],
  },
  {
    title: 'Bridal',
    accent: 'Hairstyling',
    icon: Flower2,
    image: hairImage,
    position: 'object-[50%_35%]',
    description:
      'Classic jasmine jadai, soft romantic curls or a structured bun. Every style is pinned firmly to carry your dupatta, veil or maang tikka, and stays comfortable through long hours of rituals and celebration.',
    highlights: ['Jasmine jadai', 'Soft curls', 'Elegant buns', 'Accessory-ready'],
  },
  {
    title: 'Saree & Lehenga',
    accent: 'Draping',
    icon: Sparkles,
    image: drapingImage,
    position: 'object-center',
    description:
      'Neat, evenly set pleats and a graceful drape styled for your saree or lehenga. Each fold is pinned securely so it stays picture-perfect while you walk, sit and dance all day long.',
    highlights: ['Silk sarees', 'Lehengas', 'Even pleats', 'All-day hold'],
  },
];

const compliments: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Eye, title: 'Eyelashes', text: 'Fluttery lashes that open up and define your eyes.' },
  { icon: Aperture, title: 'Lenses', text: 'Coloured lenses to complete your bridal gaze.' },
  { icon: Feather, title: 'Hair Extensions', text: 'Added length and volume for fuller, richer styles.' },
  { icon: Gem, title: 'Javuri & Kunjalam', text: 'Traditional South Indian braid extensions and tassels.' },
];

const brands = [
  'Make Up For Ever', 'Anastasia Beverly Hills', 'NYX', 'Urban Decay', 'Natasha Denona',
  'Charlotte Tilbury', 'Estée Lauder', 'Dior', 'Chanel',
];

// Each brand gets its own type style, echoing how the names look on their packaging
const brandStyles = [
  'font-inter text-2xl sm:text-3xl font-medium uppercase tracking-[0.2em]',
  'font-cormorant text-3xl sm:text-4xl italic',
  'font-inter text-3xl sm:text-4xl font-bold uppercase tracking-[0.3em]',
  'font-playfair text-2xl sm:text-3xl font-semibold uppercase tracking-[0.12em]',
  'font-cormorant text-3xl sm:text-4xl uppercase tracking-[0.2em]',
  'font-playfair text-2xl sm:text-3xl uppercase tracking-[0.12em]',
  'font-cormorant text-3xl sm:text-4xl font-medium uppercase tracking-[0.18em]',
  'font-cormorant text-3xl sm:text-4xl uppercase tracking-[0.4em]',
  'font-inter text-2xl sm:text-3xl font-bold uppercase tracking-[0.04em]',
];

const Services: React.FC = () => {
  const [giftOpen, setGiftOpen] = useState(false);
  const closeGift = useCallback(() => setGiftOpen(false), []);

  useEffect(() => {
    const prevTitle = document.title;
    document.title = 'Bridal Makeup, Hair & Draping Services | SK Bridal Studio';
    return () => {
      document.title = prevTitle;
    };
  }, []);

  return (
    <div className="pt-20 min-h-screen bg-ivory">
      <PageHero
        eyebrow="Our Services"
        title={
          <>
            Your Bridal Look,{' '}
            <span className="font-cormorant italic text-cocoa">Created by One Artist</span>
          </>
        }
        subtitle="Makeup, hair and draping are all done personally by me, from the very first brush stroke to the final pin. No part of your look is ever handed to an assistant."
      />

      {/* Personal promise */}
      <section className="bg-ivory">
        <div className="container mx-auto px-4 md:max-w-[90%]">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 rounded-full border border-sand bg-beige/60 px-6 py-5 text-center sm:flex-row sm:justify-center sm:gap-6 sm:text-left shadow-soft">
            <p className="font-inter text-[11px] font-semibold uppercase tracking-[0.3em] text-cocoa">
              No assistants · No hand-offs
            </p>
            <span className="hidden h-6 w-px bg-champagne sm:block" />
            <p className="font-script text-3xl text-chocolate">Just me, for you — Srinithi</p>
          </div>
        </div>
      </section>

      {/* Three crafts */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 md:max-w-[90%]">
          <SectionHeading
            eyebrow="What I Do"
            title="Three Crafts, One Pair of Hands"
            subtitle="Everything your bridal look needs, done start to finish by the same artist"
            className="mb-14 md:mb-20"
          />

          <div className="space-y-20 md:space-y-28">
            {services.map((s, i) => {
              const flip = i % 2 === 1;
              const num = String(i + 1).padStart(2, '0');
              return (
                <article key={s.accent} className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
                  {/* Arched photo */}
                  <div className={`relative mx-auto w-[calc(100%-2rem)] max-w-sm sm:max-w-md ${flip ? 'lg:order-2' : ''}`}>
                    <div aria-hidden="true" className="absolute -inset-4 rounded-t-full border border-champagne" />
                    <div className="group relative aspect-[4/5] rounded-t-full bg-gradient-to-b from-champagne via-mocha to-champagne p-1.5 shadow-luxe">
                      <div className="relative h-full w-full overflow-hidden rounded-t-full bg-sand">
                        <img
                          src={s.image}
                          alt={`${s.title} ${s.accent} by SK Bridal Studio`}
                          loading="lazy"
                          decoding="async"
                          className={`h-full w-full object-cover ${s.position} transition-transform duration-700 group-hover:scale-105`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-chocolate/30 via-transparent to-transparent" />
                      </div>
                    </div>
                    <span
                      className={`absolute -bottom-6 ${flip ? '-left-4 sm:-left-8' : '-right-4 sm:-right-8'} card flex h-20 w-20 items-center justify-center font-cormorant text-4xl italic text-cocoa animate-float`}
                    >
                      {num}
                    </span>
                  </div>

                  {/* Copy */}
                  <div className="text-center lg:text-left">
                    <div className="flex items-center justify-center gap-3 lg:justify-start">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-chocolate text-champagne">
                        <s.icon className="h-5 w-5" />
                      </span>
                      <p className="font-inter text-[11px] font-semibold uppercase tracking-[0.35em] text-mocha">Service {num}</p>
                    </div>
                    <h2 className="mt-5 font-playfair text-4xl sm:text-5xl font-medium leading-tight text-chocolate">
                      {s.title}{' '}
                      <span className="font-cormorant italic text-cocoa">{s.accent}</span>
                    </h2>
                    <div className="ornament mx-auto mt-6 lg:mx-0" />
                    <p className="mx-auto mt-6 max-w-xl font-inter text-base sm:text-lg leading-relaxed text-ink lg:mx-0">
                      {s.description}
                    </p>
                    <ul className="mt-7 flex flex-wrap justify-center gap-2.5 lg:justify-start">
                      {s.highlights.map((h) => (
                        <li
                          key={h}
                          className="rounded-full border border-champagne bg-beige px-4 py-1.5 font-inter text-xs font-medium uppercase tracking-[0.15em] text-cocoa"
                        >
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* Complimentary extras, styled as a ribbon-tied gift box */}
      <section className="relative overflow-hidden bg-beige py-16 md:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blush/60 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-champagne/40 blur-3xl" />
        <div className="relative container mx-auto px-4 md:max-w-[90%]">
          <SectionHeading
            eyebrow="Complimentary"
            title="My Gift to Every Bride"
            subtitle="Included with every bridal package, at no extra cost"
            className="mb-12 md:mb-16"
          />

          <div className="mx-auto max-w-4xl rounded-[2rem] bg-chocolate p-3 shadow-luxe">
            <div className="relative grid overflow-hidden rounded-[1.5rem] border border-champagne/25 sm:grid-cols-2">
              {/* Ribbons + knot */}
              <div aria-hidden="true" className="absolute inset-y-0 left-1/2 hidden w-4 -translate-x-1/2 bg-champagne/20 sm:block" />
              <div aria-hidden="true" className="absolute inset-x-0 top-1/2 hidden h-4 -translate-y-1/2 bg-champagne/20 sm:block" />
              <button
                type="button"
                onClick={() => setGiftOpen(true)}
                aria-label="Open your bridal gift"
                className="group absolute left-1/2 top-1/2 z-10 hidden h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-champagne text-chocolate ring-8 ring-chocolate transition-transform duration-300 hover:scale-110 focus-visible:outline-none focus-visible:ring-champagne/60 sm:flex"
              >
                <span aria-hidden="true" className="absolute inset-0 rounded-full bg-champagne/60 animate-ping motion-reduce:hidden" />
                <Gift className="relative h-7 w-7 transition-transform duration-300 group-hover:-rotate-12" />
                <span className="absolute left-1/2 top-full mt-4 -translate-x-1/2 whitespace-nowrap rounded-full border border-champagne/40 bg-chocolate px-3 py-1 font-inter text-[10px] font-semibold uppercase tracking-[0.25em] text-champagne">
                  Tap to open
                </span>
              </button>

              {compliments.map((c, i) => (
                <div
                  key={c.title}
                  className={`group relative flex items-start gap-4 border-b border-champagne/15 p-6 last:border-b-0 sm:border-b-0 sm:p-10 ${
                    i % 2 === 0 ? 'sm:pr-14' : 'sm:pl-14'
                  } ${i < 2 ? 'sm:pb-14' : 'sm:pt-14'}`}
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-ivory/10 text-champagne ring-1 ring-champagne/30 transition-colors duration-500 group-hover:bg-champagne group-hover:text-chocolate">
                    <c.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="font-playfair text-2xl font-medium text-ivory">{c.title}</h3>
                    <p className="mt-1.5 font-inter text-sm leading-relaxed text-sand/80">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* The ribbon knot is hidden on phones, so offer the gift as a button instead */}
            <button type="button" onClick={() => setGiftOpen(true)} className="btn-secondary mt-3 w-full sm:hidden">
              <Gift className="h-4 w-4" />
              Open Your Gift
            </button>
          </div>
        </div>
      </section>

      <GiftCelebration open={giftOpen} onClose={closeGift} items={compliments} whatsappUrl={WHATSAPP_URL} />

      {/* Brands marquee */}
      <section className="py-16 md:py-20 bg-ivory">
        <div className="container mx-auto px-4 md:max-w-[90%]">
          <SectionHeading
            eyebrow="In My Kit"
            title="Brands I Trust on Your Skin"
            subtitle="Only premium, long-wear products touch your skin on your big day"
            className="mb-10 md:mb-12"
          />
        </div>
        <div className="border-y border-sand bg-beige/50 py-8 sm:py-10 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <ul className="flex w-max animate-marquee items-center hover:[animation-play-state:paused] motion-reduce:animate-none">
            {[...brands, ...brands].map((b, i) => (
              <li
                key={`${b}-${i}`}
                aria-hidden={i >= brands.length}
                className="flex items-center whitespace-nowrap px-8 sm:px-12 text-chocolate"
              >
                <span className={brandStyles[i % brands.length]}>{b}</span>
                <Sparkles className="ml-16 sm:ml-24 h-4 w-4 text-champagne" />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <CtaBanner
        title="Let's Plan Your Bridal Look"
        text="Tell me your wedding date, venue and the style you dream of, and I'll take care of every detail from makeup to the final drape."
      >
        <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="btn-light">
          <MessageCircle className="h-4 w-4" />
          Chat on WhatsApp
        </a>
        <Link to="/packages" className="btn-ghost-light">
          View Packages
          <ArrowRight className="h-4 w-4" />
        </Link>
      </CtaBanner>
    </div>
  );
};

export default Services;

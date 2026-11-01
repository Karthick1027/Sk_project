import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';

export interface Testimonial {
  name: string;
  event: string;
  text: string;
  rating: number;
  image: string;
}

const AUTOPLAY_MS = 2000; // how long each card rests before the next one slides in
const SLIDE_MS = 1200;    // duration of the slide itself, slower than the browser's built-in smooth scroll

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

const ArrowButton: React.FC<{ direction: 'prev' | 'next'; onClick: () => void; className?: string }> = ({
  direction, onClick, className = ''
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={direction === 'prev' ? 'Previous testimonial' : 'Next testimonial'}
    // active: gives touch screens the same filled look on tap, since they never get hover
    className={`h-12 w-12 shrink-0 items-center justify-center rounded-full border border-champagne bg-ivory text-cocoa shadow-soft transition-all duration-300 hover:bg-chocolate hover:text-ivory hover:border-chocolate active:scale-95 active:bg-chocolate active:text-ivory active:border-chocolate active:duration-75 focus:outline-none focus-visible:ring-2 focus-visible:ring-champagne focus-visible:ring-offset-2 focus-visible:ring-offset-ivory [-webkit-tap-highlight-color:transparent] ${className}`}
  >
    {direction === 'prev' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
  </button>
);

// Long reviews are cut to a few lines so one essay doesn't stretch every card in the row
const ReviewQuote: React.FC<{ text: string }> = ({ text }) => {
  const ref = useRef<HTMLQuoteElement>(null);
  const [open, setOpen] = useState(false);
  const [clamped, setClamped] = useState(false);

  useEffect(() => {
    const check = () => {
      const el = ref.current;
      if (el && !open) setClamped(el.scrollHeight > el.clientHeight + 1);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [open]);

  return (
    <div className="flex-1 mb-5">
      <blockquote ref={ref} className={`whitespace-pre-line font-inter text-ink leading-relaxed ${open ? '' : 'line-clamp-5'}`}>
        "{text}"
      </blockquote>
      {(clamped || open) && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="mt-2 font-inter text-xs font-semibold uppercase tracking-[0.2em] text-cocoa hover:text-chocolate transition-colors duration-300"
        >
          {open ? 'Show less' : 'Read more'}
        </button>
      )}
    </div>
  );
};

const TestimonialSlider: React.FC<{ testimonials: Testimonial[]; rows?: number }> = ({ testimonials, rows = 1 }) => {
  // Each slide is a column of `rows` cards stacked on top of each other
  const columns = Array.from({ length: Math.ceil(testimonials.length / rows) }, (_, c) =>
    testimonials.slice(c * rows, c * rows + rows)
  );
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const frameRef = useRef(0);

  // Distance between the left edges of two neighbouring columns (column width + gap)
  const getStep = useCallback(() => {
    const cols = trackRef.current?.children;
    if (!cols || cols.length < 2) return 0;
    return (cols[1] as HTMLElement).offsetLeft - (cols[0] as HTMLElement).offsetLeft;
  }, []);

  const measure = useCallback(() => {
    const track = trackRef.current;
    const step = getStep();
    if (!track || !step) return;
    const perView = Math.max(1, Math.round(track.clientWidth / step));
    setMaxIndex(Math.max(0, columns.length - perView));
    setIndex(Math.round(track.scrollLeft / step));
  }, [getStep, columns.length]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const stopSliding = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    if (trackRef.current) trackRef.current.style.scrollSnapType = '';
  }, []);

  useEffect(() => stopSliding, [stopSliding]);

  const goTo = useCallback((target: number) => {
    const track = trackRef.current;
    if (!track) return;
    // Wrap around at either end so the arrows and autoplay loop
    const next = target > maxIndex ? 0 : target < 0 ? maxIndex : target;
    const from = track.scrollLeft;
    const distance = next * getStep() - from;
    stopSliding();
    if (!distance) return;
    // Visitors who ask for reduced motion get an instant change instead of a slide
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      track.scrollLeft = from + distance;
      return;
    }
    // Animate by hand for a slow, eased glide; snapping is switched off meanwhile or it fights each frame
    track.style.scrollSnapType = 'none';
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / SLIDE_MS);
      track.scrollLeft = from + distance * easeInOutCubic(t);
      if (t < 1) frameRef.current = requestAnimationFrame(tick);
      else track.style.scrollSnapType = '';
    };
    frameRef.current = requestAnimationFrame(tick);
  }, [getStep, maxIndex, stopSliding]);

  // Autoplay one card at a time; hold while hovered, focused or touched, then carry on
  useEffect(() => {
    if (isPaused || maxIndex === 0) return;
    const timer = window.setTimeout(() => goTo(index + 1), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [index, isPaused, maxIndex, goTo]);

  const handleNav = (target: number) => goTo(target);

  return (
    <div
      className="relative"
      role="region"
      aria-roledescription="carousel"
      aria-label="Client testimonials"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onTouchStart={() => { stopSliding(); setIsPaused(true); }}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Side arrows on wide screens, sitting in the page margin; hidden while everything fits on screen */}
      {maxIndex > 0 && (
        <>
          <ArrowButton direction="prev" onClick={() => handleNav(index - 1)} className="hidden xl:flex absolute -left-16 top-1/2 -translate-y-[calc(50%+1.875rem)] z-10" />
          <ArrowButton direction="next" onClick={() => handleNav(index + 1)} className="hidden xl:flex absolute -right-16 top-1/2 -translate-y-[calc(50%+1.875rem)] z-10" />
        </>
      )}

      {/* Native scroll-snap track: swipeable on touch, padded so card shadows and hover lift aren't clipped */}
      <div
        ref={trackRef}
        onScroll={measure}
        className="no-scrollbar -mx-3 flex snap-x snap-mandatory scroll-px-3 gap-6 lg:gap-8 overflow-x-auto px-3 pt-3 pb-10"
      >
        {columns.map((column, c) => (
          <div
            key={column[0].name}
            role="group"
            aria-roledescription="slide"
            aria-label={`${c + 1} of ${columns.length}`}
            // Equal grid rows, and columns stretched to the tallest one, keep every card the same height
            className="grid w-full shrink-0 snap-start gap-6 lg:gap-8 md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4rem)/3)]"
            style={{ gridTemplateRows: `repeat(${rows}, minmax(0, 1fr))` }}
          >
            {column.map((testimonial) => (
              <div
                key={testimonial.name}
                className="relative flex flex-col bg-beige rounded-2xl p-6 sm:p-8 border border-sand/60 hover:shadow-luxe hover:-translate-y-1 transition-all duration-500"
              >
                <Quote className="absolute top-6 right-6 w-10 h-10 text-champagne/70" />

                <div className="flex mb-5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 fill-current ${i < testimonial.rating ? 'text-mocha' : 'text-sand'}`} />
                  ))}
                </div>

                <ReviewQuote text={testimonial.text} />

                <div className="flex items-center gap-4 pt-5 border-t border-sand">
                  {testimonial.image ? (
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      className="w-14 h-14 shrink-0 rounded-full object-cover ring-2 ring-ivory shadow-soft"
                    />
                  ) : (
                    <div className="w-14 h-14 shrink-0 rounded-full bg-chocolate ring-2 ring-ivory shadow-soft flex items-center justify-center font-playfair text-xl text-champagne">
                      {testimonial.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <h3 className="font-playfair text-lg font-medium text-chocolate">{testimonial.name}</h3>
                    <p className="font-inter text-xs uppercase tracking-[0.2em] text-mocha mt-0.5">{testimonial.event}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Dots, flanked by arrows below xl */}
      {maxIndex > 0 && (
        <div className="flex items-center justify-center gap-4">
          <ArrowButton direction="prev" onClick={() => handleNav(index - 1)} className="flex xl:hidden" />
          <div className="flex items-center">
            {Array.from({ length: maxIndex + 1 }, (_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleNav(i)}
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                className="flex h-8 items-center px-1.5"
              >
                <span
                  className={`block h-2 rounded-full transition-all duration-500 ${
                    i === index ? 'w-7 bg-chocolate' : 'w-2 bg-sand hover:bg-champagne'
                  }`}
                />
              </button>
            ))}
          </div>
          <ArrowButton direction="next" onClick={() => handleNav(index + 1)} className="flex xl:hidden" />
        </div>
      )}
    </div>
  );
};

export default TestimonialSlider;

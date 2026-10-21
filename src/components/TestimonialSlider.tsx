import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react';

export interface Testimonial {
  name: string;
  event: string;
  text: string;
  rating: number;
  image: string;
}

const AUTOPLAY_MS = 6000;

const ArrowButton: React.FC<{ direction: 'prev' | 'next'; onClick: () => void; className?: string }> = ({
  direction, onClick, className = ''
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={direction === 'prev' ? 'Previous testimonial' : 'Next testimonial'}
    className={`h-12 w-12 shrink-0 items-center justify-center rounded-full border border-champagne bg-ivory text-cocoa shadow-soft hover:bg-chocolate hover:text-ivory hover:border-chocolate transition-colors duration-300 ${className}`}
  >
    {direction === 'prev' ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
  </button>
);

const TestimonialSlider: React.FC<{ testimonials: Testimonial[] }> = ({ testimonials }) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const [maxIndex, setMaxIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [userInteracted, setUserInteracted] = useState(false);

  // Distance between the left edges of two neighbouring cards (card width + gap)
  const getStep = useCallback(() => {
    const cards = trackRef.current?.children;
    if (!cards || cards.length < 2) return 0;
    return (cards[1] as HTMLElement).offsetLeft - (cards[0] as HTMLElement).offsetLeft;
  }, []);

  const measure = useCallback(() => {
    const track = trackRef.current;
    const step = getStep();
    if (!track || !step) return;
    const perView = Math.max(1, Math.round(track.clientWidth / step));
    setMaxIndex(Math.max(0, testimonials.length - perView));
    setIndex(Math.round(track.scrollLeft / step));
  }, [getStep, testimonials.length]);

  useEffect(() => {
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [measure]);

  const goTo = useCallback((target: number) => {
    const track = trackRef.current;
    if (!track) return;
    // Wrap around at either end so the arrows and autoplay loop
    const next = target > maxIndex ? 0 : target < 0 ? maxIndex : target;
    track.scrollTo({ left: next * getStep(), behavior: 'smooth' });
  }, [getStep, maxIndex]);

  // Autoplay until the visitor takes control; hold while hovered or focused
  useEffect(() => {
    if (isPaused || userInteracted || maxIndex === 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const timer = window.setTimeout(() => goTo(index + 1), AUTOPLAY_MS);
    return () => window.clearTimeout(timer);
  }, [index, isPaused, userInteracted, maxIndex, goTo]);

  const handleNav = (target: number) => {
    setUserInteracted(true);
    goTo(target);
  };

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
      onTouchStart={() => setUserInteracted(true)}
    >
      {/* Side arrows on wide screens, sitting in the page margin */}
      <ArrowButton direction="prev" onClick={() => handleNav(index - 1)} className="hidden xl:flex absolute -left-16 top-1/2 -translate-y-[calc(50%+1.875rem)] z-10" />
      <ArrowButton direction="next" onClick={() => handleNav(index + 1)} className="hidden xl:flex absolute -right-16 top-1/2 -translate-y-[calc(50%+1.875rem)] z-10" />

      {/* Native scroll-snap track: swipeable on touch, padded so card shadows and hover lift aren't clipped */}
      <div
        ref={trackRef}
        onScroll={measure}
        className="no-scrollbar -mx-3 flex snap-x snap-mandatory scroll-px-3 gap-6 lg:gap-8 overflow-x-auto px-3 pt-3 pb-10"
      >
        {testimonials.map((testimonial, i) => (
          <div
            key={testimonial.name}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${testimonials.length}`}
            className="relative flex w-full shrink-0 snap-start flex-col bg-beige rounded-2xl p-6 sm:p-8 border border-sand/60 hover:shadow-luxe hover:-translate-y-1 transition-all duration-500 md:w-[calc((100%-1.5rem)/2)] lg:w-[calc((100%-4rem)/3)]"
          >
            <Quote className="absolute top-6 right-6 w-10 h-10 text-champagne/70" />

            <div className="flex mb-5">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} className="w-4 h-4 text-mocha fill-current" />
              ))}
            </div>

            <blockquote className="flex-1 font-inter text-ink leading-relaxed mb-8">
              "{testimonial.text}"
            </blockquote>

            <div className="flex items-center gap-4 pt-6 border-t border-sand">
              {testimonial.image ? (
                <img
                  src={testimonial.image}
                  alt={testimonial.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-ivory shadow-soft"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-chocolate ring-2 ring-ivory shadow-soft flex items-center justify-center font-playfair text-xl text-champagne">
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

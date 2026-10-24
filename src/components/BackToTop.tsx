import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

// Scroll distance before the button shows up
const SHOW_AFTER = 400;
const RING_RADIUS = 26;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

const BackToTop: React.FC = () => {
  const [visible, setVisible] = useState(false);
  // 0–1, how far down the page we are; drawn as a ring around the button
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setVisible(window.scrollY > SHOW_AFTER);
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      aria-label="Back to top"
      // No explicit behavior, so it follows the page's smooth scrolling
      onClick={() => window.scrollTo({ top: 0 })}
      tabIndex={visible ? 0 : -1}
      className={`group fixed bottom-5 right-5 sm:bottom-8 sm:right-8 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-chocolate text-ivory shadow-luxe transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(59,38,30,0.6)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-mocha/60 focus-visible:ring-offset-2 focus-visible:ring-offset-ivory ${
        visible ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-4'
      }`}
    >
      <svg aria-hidden="true" viewBox="0 0 60 60" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="30" cy="30" r={RING_RADIUS} fill="none" className="stroke-ivory/15" strokeWidth="2" />
        <circle
          cx="30"
          cy="30"
          r={RING_RADIUS}
          fill="none"
          className="stroke-champagne"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={RING_LENGTH}
          strokeDashoffset={RING_LENGTH * (1 - progress)}
        />
      </svg>
      <ArrowUp className="relative h-5 w-5 transition-transform duration-300 group-hover:-translate-y-0.5" />
    </button>
  );
};

export default BackToTop;

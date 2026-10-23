import React, { useEffect, useMemo, useRef } from 'react';
import { Gift, MessageCircle, X, type LucideIcon } from 'lucide-react';

interface GiftItem {
  icon: LucideIcon;
  title: string;
}

interface GiftCelebrationProps {
  open: boolean;
  onClose: () => void;
  items: GiftItem[];
  whatsappUrl: string;
}

// Lipstick, blush, bronzer, eyeshadow and highlighter shades
const SHADES = [
  '#B3261E', '#8E2C48', '#D7707F', '#E8836B', '#F8D7D9', '#D9A88B',
  '#A0663E', '#D4AF37', '#D8C2A5', '#9C6B85', '#6A2C4A',
];

// lipstick = bullet, powder = pressed-pan dot, glitter = diamond fleck, shimmer = glowing speck
const SHAPES = ['lipstick', 'powder', 'glitter', 'shimmer'] as const;
type Shape = (typeof SHAPES)[number];

const shapeClass: Record<Shape, string> = {
  lipstick: 'h-4 w-1.5 rounded-t-full rounded-b-sm',
  powder: 'h-2.5 w-2.5 rounded-full',
  glitter: 'h-2 w-2 rounded-[2px]',
  shimmer: 'h-1.5 w-1.5 rounded-full shadow-[0_0_6px_currentColor]',
};

const PIECE_COUNT = 90;

const makePieces = () =>
  Array.from({ length: PIECE_COUNT }, (_, i) => {
    const angle = Math.random() * Math.PI * 2;
    const distance = 120 + Math.random() * 260;
    const color = SHADES[i % SHADES.length];
    return {
      shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
      color,
      style: {
        '--x': `${Math.cos(angle) * distance}px`,
        // Bias upwards so the burst fountains before it falls
        '--y': `${Math.sin(angle) * distance - 120}px`,
        '--r': `${(Math.random() - 0.5) * 900}deg`,
        backgroundColor: color,
        color,
        animationDelay: `${Math.random() * 0.35}s`,
        animationDuration: `${2.2 + Math.random() * 1.4}s`,
      } as React.CSSProperties,
    };
  });

const GiftCelebration: React.FC<GiftCelebrationProps> = ({ open, onClose, items, whatsappUrl }) => {
  const closeRef = useRef<HTMLButtonElement>(null);
  // Fresh scatter every time the gift is opened
  const pieces = useMemo(() => (open ? makePieces() : []), [open]);

  // Lock page scroll, close on Escape, and hand focus back to the gift when the popup closes
  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
      trigger?.focus();
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden bg-chocolate/80 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gift-title"
    >
      <div
        className="relative w-full max-w-md rounded-[2rem] bg-ivory p-8 text-center shadow-luxe animate-gift-pop sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-cocoa transition-colors duration-300 hover:bg-beige focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne"
        >
          <X className="h-5 w-5" />
        </button>

        <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-champagne text-chocolate ring-8 ring-beige animate-swing">
          <Gift className="h-9 w-9" />
        </span>
        <p className="mt-6 font-script text-4xl text-cocoa">Surprise!</p>
        <h2 id="gift-title" className="mt-1 font-playfair text-3xl font-medium text-chocolate">
          A Little Gift, Just for You
        </h2>
        <div className="ornament mx-auto mt-5" />
        <p className="mt-5 font-inter text-sm leading-relaxed text-ink">
          Every bridal package comes with these finishing touches, at no extra cost.
        </p>

        <ul className="mt-6 grid grid-cols-2 gap-2.5 text-left">
          {items.map((item) => (
            <li key={item.title} className="flex items-center gap-2.5 rounded-xl border border-sand bg-beige/70 px-3 py-2.5">
              <item.icon className="h-4 w-4 shrink-0 text-mocha" />
              <span className="font-inter text-xs font-medium text-chocolate">{item.title}</span>
            </li>
          ))}
        </ul>

        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-primary mt-8 w-full">
          <MessageCircle className="h-4 w-4" />
          Claim on WhatsApp
        </a>
      </div>

      {/* Makeup-shade confetti bursting from the centre */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 motion-reduce:hidden">
        {pieces.map((p, i) => (
          <span key={i} className={`absolute left-1/2 top-1/2 animate-confetti ${shapeClass[p.shape]}`} style={p.style} />
        ))}
      </div>
    </div>
  );
};

export default GiftCelebration;

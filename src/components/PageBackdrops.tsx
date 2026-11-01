import React, { useId } from 'react';

const uid = (raw: string) => raw.replace(/:/g, '');
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

/* ───────────────────────── Gallery: jali lattice + peacock feathers ───────────────────────── */

const PeacockFeather: React.FC<{ className?: string }> = ({ className = '' }) => {
  const barbs = range(22).map((i) => ({ y: 128 + i * 12, len: 40 - i * 1.2 }));
  // Fringe around the eye, skipping the bottom where the shaft joins (60°–120°).
  const fringe = range(24).map((i) => i * 15).filter((a) => a < 60 || a > 120);

  return (
    <svg viewBox="0 0 120 420" className={className} fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
      <path d="M60 420 C 58 320, 62 220, 60 118" />
      {barbs.map(({ y, len }) => (
        <g key={y}>
          <path d={`M60 ${y} q ${-len * 0.5} ${-len * 0.2} ${-len} ${-len * 0.7}`} />
          <path d={`M60 ${y} q ${len * 0.5} ${-len * 0.2} ${len} ${-len * 0.7}`} />
        </g>
      ))}
      {fringe.map((a) => {
        const r = (Math.PI * a) / 180;
        const x1 = 60 + 38 * Math.cos(r);
        const y1 = 70 + 52 * Math.sin(r);
        const x2 = 60 + 50 * Math.cos(r);
        const y2 = 70 + 66 * Math.sin(r);
        return <path key={a} d={`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`} />;
      })}
      <path d="M60 18 C 28 38, 24 92, 60 122 C 96 92, 92 38, 60 18 Z" />
      <path d="M60 44 C 40 58, 38 90, 60 108 C 82 90, 80 58, 60 44 Z" />
      <ellipse cx="60" cy="84" rx="11" ry="15" fill="currentColor" fillOpacity="0.45" />
    </svg>
  );
};

export const GalleryBackdrop: React.FC = () => {
  const jaliId = `sk-jali-${uid(useId())}`;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Ogee jali screen, clear in the centre behind the text */}
      <svg className="absolute inset-0 h-full w-full text-mocha opacity-[0.22] [mask-image:radial-gradient(ellipse_45%_60%_at_50%_50%,transparent_35%,black_85%)]">
        <defs>
          <pattern id={jaliId} width="60" height="80" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="0.9">
              <path d="M30 0 C 30 20, 0 20, 0 40 C 0 60, 30 60, 30 80" />
              <path d="M30 0 C 30 20, 60 20, 60 40 C 60 60, 30 60, 30 80" />
            </g>
            <g fill="currentColor">
              <circle cx="30" cy="40" r="2" />
              <circle cx="0" cy="0" r="1.6" />
              <circle cx="60" cy="0" r="1.6" />
              <circle cx="0" cy="80" r="1.6" />
              <circle cx="60" cy="80" r="1.6" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${jaliId})`} />
      </svg>

      {/* Peacock feathers sweeping in from the lower corners */}
      <PeacockFeather className="absolute -bottom-16 left-4 md:left-[6%] h-64 md:h-96 text-mocha opacity-40 rotate-[28deg] origin-bottom" />
      <PeacockFeather className="absolute -bottom-20 left-0 md:left-[2%] h-52 md:h-80 text-mocha opacity-30 rotate-[50deg] origin-bottom" />
      <PeacockFeather className="absolute -bottom-16 right-4 md:right-[6%] h-64 md:h-96 text-mocha opacity-40 -rotate-[28deg] origin-bottom" />
      <PeacockFeather className="absolute -bottom-20 right-0 md:right-[2%] h-52 md:h-80 text-mocha opacity-30 -rotate-[50deg] origin-bottom" />
    </div>
  );
};

/* ───────────────────────── Contact: mehendi vines + falling petals ───────────────────────── */

const petals = [
  { left: '10%', delay: '0s', duration: '14s', scale: 1 },
  { left: '24%', delay: '-6s', duration: '17s', scale: 0.8 },
  { left: '40%', delay: '-10s', duration: '15s', scale: 0.9 },
  { left: '58%', delay: '-3s', duration: '18s', scale: 1.1 },
  { left: '74%', delay: '-12s', duration: '13s', scale: 0.85 },
  { left: '88%', delay: '-8s', duration: '16s', scale: 1 },
];

export const ContactBackdrop: React.FC = () => {
  const vineId = `sk-mehendi-${uid(useId())}`;

  // One repeating tile of a henna vine; the S-curve meets itself seamlessly top to bottom.
  const vine = (side: string) => (
    <svg className="h-full w-full">
      <defs>
        <pattern id={`${vineId}-${side}`} width="120" height="180" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round">
            <path d="M60 0 C 20 45, 100 135, 60 180" />
            <path d="M46 50 C 22 46, 10 68, 22 80 C 30 87, 40 79, 33 72" />
            <path d="M74 130 C 98 134, 110 112, 98 100 C 90 93, 80 101, 87 108" />
            <path d="M52 30 C 44 20, 30 18, 20 24 C 30 32, 44 34, 52 30 Z" />
            <path d="M68 150 C 76 160, 90 162, 100 156 C 90 148, 76 146, 68 150 Z" />
            <path d="M72 82 C 84 78, 92 66, 90 54 C 80 60, 74 70, 72 82 Z" />
            <path d="M48 98 C 36 102, 28 114, 30 126 C 40 120, 46 110, 48 98 Z" />
          </g>
          <g fill="currentColor">
            <circle cx="12" cy="92" r="1.8" />
            <circle cx="20" cy="98" r="1.4" />
            <circle cx="8" cy="102" r="1.2" />
            <circle cx="108" cy="88" r="1.8" />
            <circle cx="100" cy="82" r="1.4" />
            <circle cx="112" cy="78" r="1.2" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${vineId}-${side})`} />
    </svg>
  );

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Mehendi vines framing both edges */}
      <div className="absolute inset-y-0 left-0 w-20 md:w-28 text-mocha opacity-30 hidden sm:block [mask-image:linear-gradient(to_bottom,black_60%,transparent)]">
        {vine('left')}
      </div>
      <div className="absolute inset-y-0 right-0 w-20 md:w-28 text-mocha opacity-30 hidden sm:block -scale-x-100 [mask-image:linear-gradient(to_bottom,black_60%,transparent)]">
        {vine('right')}
      </div>

      {/* Drifting petals */}
      {petals.map((p) => (
        <svg
          key={p.left}
          viewBox="-8 -8 16 16"
          className="absolute -top-4 w-4 h-4 animate-petal motion-reduce:hidden"
          style={{ left: p.left, animationDelay: p.delay, animationDuration: p.duration, scale: String(p.scale) }}
        >
          <path d="M0 -7 C 6 -4, 6 4, 0 7 C -6 4, -6 -4, 0 -7 Z" className="fill-blush stroke-mocha" strokeWidth="0.6" />
          <path d="M0 -5 L0 5" className="stroke-mocha" strokeWidth="0.4" />
        </svg>
      ))}
    </div>
  );
};

/* ───────────────────────── Packages: marigold strings + kolam dots ───────────────────────── */

const Marigold: React.FC<{ cy: number; r: number }> = ({ cy, r }) => (
  <g transform={`translate(13 ${cy})`}>
    {range(10).map((i) => (
      <circle key={i} r={r * 0.42} cx={r * 0.62 * Math.cos((i * Math.PI) / 5)} cy={r * 0.62 * Math.sin((i * Math.PI) / 5)} />
    ))}
    <circle r={r * 0.55} />
  </g>
);

const MarigoldStrand: React.FC<{ count: number; delay?: string }> = ({ count, delay = '0s' }) => {
  const step = 22;
  const lastY = 14 + (count - 1) * step;
  const height = lastY + 34;

  return (
    <svg
      width="26"
      height={height}
      viewBox={`0 0 26 ${height}`}
      className="origin-top animate-[swing_7s_ease-in-out_infinite] motion-reduce:animate-none"
      style={{ animationDelay: delay }}
    >
      <line x1="13" y1="0" x2="13" y2={lastY + 10} className="stroke-mocha" strokeWidth="0.8" />
      <g className="fill-champagne stroke-mocha" strokeWidth="0.6">
        {range(count).map((i) => (
          <Marigold key={i} cy={14 + i * step} r={i % 2 === 0 ? 9 : 7.5} />
        ))}
      </g>
      {/* Leaf pair and tassel at the end of the string */}
      <g className="fill-mocha">
        <path d={`M13 ${lastY + 9} C 6 ${lastY + 12}, 3 ${lastY + 18}, 5 ${lastY + 24} C 10 ${lastY + 20}, 12 ${lastY + 15}, 13 ${lastY + 9} Z`} />
        <path d={`M13 ${lastY + 9} C 20 ${lastY + 12}, 23 ${lastY + 18}, 21 ${lastY + 24} C 16 ${lastY + 20}, 14 ${lastY + 15}, 13 ${lastY + 9} Z`} />
        <circle cx="13" cy={lastY + 28} r="2.6" />
      </g>
    </svg>
  );
};

const strandsLeft = [
  { count: 6, delay: '0s' },
  { count: 11, delay: '-2.2s' },
  { count: 8, delay: '-4.1s' },
  { count: 13, delay: '-1.3s' },
  { count: 5, delay: '-5.6s' },
];

// Mango-leaf thoranam strung across the top: two leaves, then a marigold, repeating
const Thoranam: React.FC = () => (
  <div className="absolute top-0 left-4 right-4 xl:left-[19%] xl:right-[19%] flex justify-center overflow-hidden opacity-90 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
    <div className="absolute top-[3px] inset-x-0 h-px bg-mocha/60" />
    <div className="flex shrink-0 items-start gap-1.5">
      {range(45).map((i) => (
        <svg
          key={i}
          {...(i % 3 === 2
            ? { width: 22, height: 26, viewBox: '0 0 26 30' }
            : { width: 16, height: 42, viewBox: '0 0 16 42' })}
          className="origin-top animate-leaf-sway motion-reduce:animate-none"
          style={{ animationDelay: `${-((i * 0.37) % 4)}s` }}
        >
          {i % 3 === 2 ? (
            <>
              <line x1="13" y1="3" x2="13" y2="10" className="stroke-mocha" strokeWidth="0.8" />
              <g className="fill-champagne stroke-mocha" strokeWidth="0.6">
                <Marigold cy={18} r={9} />
              </g>
            </>
          ) : (
            <>
              <line x1="8" y1="3" x2="8" y2="8" className="stroke-mocha" strokeWidth="0.8" />
              <path d="M8 8 C 15 14, 15 30, 8 41 C 1 30, 1 14, 8 8 Z" className="fill-sage/60 stroke-cocoa/60" strokeWidth="0.6" />
              <path d="M8 10 L8 38" className="stroke-cocoa/40" strokeWidth="0.5" />
            </>
          )}
        </svg>
      ))}
    </div>
  </div>
);

// Clay oil lamp with a flickering flame and a soft glow behind it
const Diya: React.FC<{ className?: string; delay?: string }> = ({ className = '', delay = '0s' }) => {
  const flameId = `sk-flame-${uid(useId())}`;

  return (
    <div className={`absolute ${className}`}>
      <div className="relative animate-float motion-reduce:animate-none" style={{ animationDelay: delay }}>
        <div className="absolute left-1/2 top-0 h-20 w-20 -translate-x-1/2 -translate-y-1/4 rounded-full bg-champagne/70 blur-2xl animate-pulse motion-reduce:animate-none" />
        <svg viewBox="0 0 80 90" className="relative w-16 xl:w-20">
          <defs>
            <linearGradient id={flameId} x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" stopColor="#C96B6B" />
              <stop offset="0.55" stopColor="#E9B864" />
              <stop offset="1" stopColor="#FBE7B5" />
            </linearGradient>
          </defs>
          <g
            className="origin-bottom [transform-box:fill-box] animate-flicker motion-reduce:animate-none"
            style={{ animationDelay: delay }}
          >
            <path d="M40 10 C 49 25, 51 36, 40 47 C 29 36, 31 25, 40 10 Z" fill={`url(#${flameId})`} />
            <path d="M40 29 C 44 35, 44 41, 40 46 C 36 41, 36 35, 40 29 Z" className="fill-ivory" opacity="0.85" />
          </g>
          <line x1="40" y1="46" x2="40" y2="51" className="stroke-chocolate" strokeWidth="1.4" />
          <path
            d="M6 51 C 10 72, 26 82, 40 82 C 54 82, 70 72, 74 51 Z"
            className="fill-champagne stroke-mocha"
            strokeWidth="1"
          />
          <ellipse cx="40" cy="51" rx="34" ry="4.5" className="fill-sand stroke-mocha" strokeWidth="1" />
          <g className="fill-cocoa/70">
            {[[20, 63], [30, 68], [40, 70], [50, 68], [60, 63]].map(([cx, cy]) => <circle key={cx} cx={cx} cy={cy} r="1.6" />)}
          </g>
          <path d="M30 81 L33 88 L47 88 L50 81" className="fill-sand stroke-mocha" strokeWidth="1" />
        </svg>
      </div>
    </div>
  );
};

const sparkles = [
  { top: '22%', left: '27%', delay: '0s', size: 12 },
  { top: '16%', left: '66%', delay: '-2.6s', size: 9 },
  { top: '34%', left: '76%', delay: '-1.2s', size: 14 },
  { top: '66%', left: '21%', delay: '-2s', size: 11 },
  { top: '74%', left: '81%', delay: '-0.6s', size: 10 },
  { top: '84%', left: '34%', delay: '-3.1s', size: 8 },
  { top: '82%', left: '64%', delay: '-1.7s', size: 9 },
];

export const PackagesBackdrop: React.FC = () => {
  const kolamId = `sk-kolam-${uid(useId())}`;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Kolam dot grid with small diamonds, fading at the edges */}
      <svg className="absolute inset-0 h-full w-full text-mocha opacity-[0.25] [mask-image:radial-gradient(ellipse_70%_75%_at_50%_45%,black_25%,transparent_80%)]">
        <defs>
          <pattern id={kolamId} width="32" height="32" patternUnits="userSpaceOnUse">
            <circle cx="16" cy="16" r="1.4" fill="currentColor" />
            <path d="M0 -4 L4 0 L0 4 L-4 0 Z M32 -4 L36 0 L32 4 L28 0 Z M0 28 L4 32 L0 36 L-4 32 Z M32 28 L36 32 L32 36 L28 32 Z" fill="none" stroke="currentColor" strokeWidth="0.7" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${kolamId})`} />
      </svg>

      {/* Marigold strings hanging on both sides; only from xl, below that they hang over the one-line title */}
      <div className="absolute top-0 left-10 hidden xl:flex items-start gap-3 opacity-80">
        {strandsLeft.map((s) => <MarigoldStrand key={s.delay} count={s.count} delay={s.delay} />)}
      </div>
      <div className="absolute top-0 right-10 hidden xl:flex flex-row-reverse items-start gap-3 opacity-80">
        {strandsLeft.map((s) => <MarigoldStrand key={s.delay} count={s.count} delay={`${parseFloat(s.delay) - 1}s`} />)}
      </div>

      <Thoranam />

      {/* Diyas either side of the title, clear of the garlands */}
      <Diya className="hidden lg:block top-[36%] left-[11%] xl:left-[18%]" />
      <Diya className="hidden lg:block top-[36%] right-[11%] xl:right-[18%]" delay="-2s" />

      {/* Twinkling sparkles */}
      {sparkles.map((s) => (
        <svg
          key={s.top + s.left}
          viewBox="-10 -10 20 20"
          className="absolute hidden md:block text-mocha animate-twinkle motion-reduce:animate-none"
          style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }}
        >
          <path d="M0 -10 C 1 -2, 2 -1, 10 0 C 2 1, 1 2, 0 10 C -1 2, -2 1, -10 0 C -2 -1, -1 -2, 0 -10 Z" fill="currentColor" />
        </svg>
      ))}
    </div>
  );
};

/* ───────────────────────── Reviews: laurel seal + floating review cards ───────────────────────── */

// Leaf pairs along one side of the wreath, from the bottom up; the right side mirrors it.
// Each pair sprouts from the stem (r = 78), one leaning out and one leaning in.
const laurelLeaves = range(9).flatMap((i) => {
  const deg = 120 + i * 16;
  const a = (deg * Math.PI) / 180;
  return [
    { x: 100 + 87 * Math.cos(a), y: 100 + 87 * Math.sin(a), rot: deg - 30 },
    { x: 100 + 69 * Math.cos(a), y: 100 + 69 * Math.sin(a), rot: deg + 30 },
  ];
});

const LaurelSeal: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`absolute h-48 w-48 ${className}`}>
    <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full text-mocha" fill="none" stroke="currentColor" strokeWidth="1.1">
      {[1, -1].map((side) => (
        <g key={side} transform={side === -1 ? 'translate(200 0) scale(-1 1)' : undefined}>
          <path d="M86.5 176.8 A 78 78 0 0 1 79.8 24.7" />
          {laurelLeaves.map((l) => (
            <ellipse
              key={l.rot}
              cx={l.x.toFixed(1)}
              cy={l.y.toFixed(1)}
              rx="4"
              ry="10"
              transform={`rotate(${l.rot} ${l.x.toFixed(1)} ${l.y.toFixed(1)})`}
              fill="currentColor"
              fillOpacity="0.18"
            />
          ))}
        </g>
      ))}
      <circle cx="100" cy="100" r="58" strokeDasharray="2 5" strokeOpacity="0.7" />
    </svg>
    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
      <span className="flex gap-0.5 text-mocha">
        {range(5).map((i) => (
          <svg key={i} viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
            <path d="M12 2l3 6.9 7.5.6-5.7 4.9 1.8 7.3L12 17.8 5.4 21.7l1.8-7.3L1.5 9.5 9 8.9z" />
          </svg>
        ))}
      </span>
      <span className="mt-1.5 font-script text-3xl leading-none text-cocoa">Loved by</span>
      <span className="mt-1 font-inter text-[10px] font-semibold uppercase tracking-[0.35em] text-mocha">Brides</span>
    </div>
  </div>
);

// Abstract review card: stars, text lines and an avatar, no real words
const MiniReviewCard: React.FC<{ lines: string[] }> = ({ lines }) => (
  <div className="w-52 rounded-2xl bg-ivory/90 p-4 shadow-soft ring-1 ring-sand backdrop-blur-sm">
    <span className="flex gap-0.5 text-mocha">
      {range(5).map((i) => (
        <svg key={i} viewBox="0 0 24 24" className="h-2.5 w-2.5" fill="currentColor">
          <path d="M12 2l3 6.9 7.5.6-5.7 4.9 1.8 7.3L12 17.8 5.4 21.7l1.8-7.3L1.5 9.5 9 8.9z" />
        </svg>
      ))}
    </span>
    <div className="mt-3 space-y-1.5">
      {lines.map((w, i) => <span key={i} className="block h-1.5 rounded-full bg-sand" style={{ width: w }} />)}
    </div>
    <div className="mt-4 flex items-center gap-2 border-t border-sand/70 pt-3">
      <span className="h-6 w-6 rounded-full bg-champagne/70" />
      <span className="h-1.5 w-16 rounded-full bg-champagne/60" />
    </div>
  </div>
);

const HeartBubble: React.FC<{ className?: string; delay?: string }> = ({ className = '', delay = '0s' }) => (
  <div className={`absolute animate-float motion-reduce:animate-none ${className}`} style={{ animationDelay: delay }}>
    <div className="flex h-10 w-10 items-center justify-center rounded-full rounded-bl-sm bg-blush shadow-soft">
      <svg viewBox="0 0 24 24" className="h-4 w-4 text-clay" fill="currentColor">
        <path d="M12 21s-7.5-4.6-9.6-9.2C.9 8.4 3 4.5 6.8 4.5c2.1 0 3.6 1.2 5.2 3 1.6-1.8 3.1-3 5.2-3 3.8 0 5.9 3.9 4.4 7.3C19.5 16.4 12 21 12 21z" />
      </svg>
    </div>
  </div>
);

const reviewSparkles = [
  { top: '14%', left: '30%', delay: '0s', size: 10 },
  { top: '72%', left: '27%', delay: '-1.4s', size: 12 },
  { top: '20%', left: '70%', delay: '-2.3s', size: 9 },
  { top: '78%', left: '72%', delay: '-0.7s', size: 11 },
  { top: '46%', left: '4%', delay: '-2.9s', size: 8 },
  { top: '40%', left: '96%', delay: '-1.9s', size: 9 },
];

export const ReviewsBackdrop: React.FC = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    {/* Oversized quote marks, barely there */}
    <span className="absolute -top-10 left-[3%] font-playfair text-[16rem] leading-none text-champagne/25 select-none">&ldquo;</span>
    <span className="absolute -bottom-40 right-[3%] font-playfair text-[16rem] leading-none text-champagne/25 select-none">&rdquo;</span>

    {/* Side pieces only from xl, where the title leaves room either side */}
    <div className="hidden xl:block">
      <LaurelSeal className="top-[18%] left-[5%] 2xl:left-[9%]" />
      <HeartBubble className="top-[64%] left-[17%] 2xl:left-[21%]" delay="-1.5s" />

      <div className="absolute top-[14%] right-[4%] 2xl:right-[8%]">
        <div className="rotate-6 animate-float motion-reduce:animate-none" style={{ animationDelay: '-2s' }}>
          <MiniReviewCard lines={['100%', '90%', '55%']} />
        </div>
      </div>
      <div className="absolute top-[44%] right-[10%] 2xl:right-[14%]">
        <div className="-rotate-6">
          <div className="animate-float motion-reduce:animate-none">
            <MiniReviewCard lines={['100%', '75%']} />
          </div>
        </div>
      </div>
      <HeartBubble className="top-[40%] right-[4%] 2xl:right-[8%]" />
    </div>

    {/* Twinkling sparkles */}
    {reviewSparkles.map((s) => (
      <svg
        key={s.top + s.left}
        viewBox="-10 -10 20 20"
        className="absolute hidden md:block text-mocha animate-twinkle motion-reduce:animate-none"
        style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }}
      >
        <path d="M0 -10 C 1 -2, 2 -1, 10 0 C 2 1, 1 2, 0 10 C -1 2, -2 1, -10 0 C -2 -1, -1 -2, 0 -10 Z" fill="currentColor" />
      </svg>
    ))}
  </div>
);

/* ───────────────────────── Services: makeup, hair and draping line art ───────────────────────── */

const MakeupBrush: React.FC<{ className?: string; full?: boolean }> = ({ className = '', full = false }) => (
  <svg viewBox="0 0 40 200" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
    <path
      d={full ? 'M20 2 C 36 10, 38 40, 28 54 L12 54 C 2 40, 4 10, 20 2 Z' : 'M20 6 C 29 16, 31 38, 26 54 L14 54 C 9 38, 11 16, 20 6 Z'}
      fill="currentColor"
      fillOpacity="0.22"
    />
    <rect x="13" y="54" width="14" height="22" rx="2" />
    <path d="M13 61 H27 M13 69 H27" strokeOpacity="0.6" />
    <path d="M14 76 L17 190 Q20 197 23 190 L26 76" />
  </svg>
);

const PowderCompact: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 120 136" className={className} fill="none" stroke="currentColor" strokeWidth="1.3">
    {/* Mirror lid */}
    <circle cx="60" cy="36" r="33" />
    <circle cx="60" cy="36" r="26" fill="currentColor" fillOpacity="0.08" />
    <path d="M44 26 Q 50 16, 62 14" strokeLinecap="round" strokeOpacity="0.7" />
    <rect x="52" y="66" width="16" height="6" rx="2" />
    {/* Powder base */}
    <circle cx="60" cy="102" r="33" />
    <circle cx="60" cy="102" r="24" fill="currentColor" fillOpacity="0.2" />
    {range(6).map((i) => {
      const a = (i * 60 * Math.PI) / 180;
      return <circle key={i} cx={(60 + 12 * Math.cos(a)).toFixed(1)} cy={(102 + 12 * Math.sin(a)).toFixed(1)} r="2.5" strokeOpacity="0.6" />;
    })}
  </svg>
);

const Lipstick: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 50 140" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round">
    <path d="M15 62 V28 L35 12 V62 Z" fill="currentColor" fillOpacity="0.3" />
    <rect x="12" y="62" width="26" height="18" rx="2" />
    <rect x="9" y="80" width="32" height="56" rx="3" />
    <path d="M9 92 H41" strokeOpacity="0.6" />
  </svg>
);

// A strand of jasmine buds and blossoms, as worn in bridal hair
const JasmineStrand: React.FC<{ count: number; className?: string; delay?: string }> = ({ count, className = '', delay = '0s' }) => {
  const h = count * 26 + 20;
  return (
    <svg
      viewBox={`0 0 40 ${h}`}
      className={`origin-top animate-swing motion-reduce:animate-none ${className}`}
      style={{ animationDelay: delay, height: h, width: 40 }}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
    >
      <path d={`M20 0 V${h - 8}`} strokeOpacity="0.6" />
      {range(count).map((i) => {
        const cy = 18 + i * 26;
        return (
          <g key={i} transform={`translate(20 ${cy})`}>
            {range(5).map((p) => (
              <ellipse key={p} cx="0" cy="-6" rx="3.2" ry="6" transform={`rotate(${p * 72})`} fill="currentColor" fillOpacity="0.14" />
            ))}
            <circle r="1.8" fill="currentColor" />
          </g>
        );
      })}
      <path d={`M20 ${h - 8} l-4 8 M20 ${h - 8} l4 8 M20 ${h - 8} v8`} strokeOpacity="0.7" />
    </svg>
  );
};

// Saree pleats fanned out, with a dotted zari border along the hem
const SareePleats: React.FC<{ className?: string }> = ({ className = '' }) => {
  const hem = range(9).map((i) => 12 + i * 17);
  return (
    <svg viewBox="0 0 160 130" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round">
      <path d="M80 8 L12 104 Q 80 124, 148 104 Z" fill="currentColor" fillOpacity="0.08" />
      {hem.map((x) => <path key={x} d={`M80 8 L${x} ${104 + Math.sin(((x - 12) / 136) * Math.PI) * 10}`} strokeOpacity="0.55" />)}
      <path d="M12 104 Q 80 124, 148 104" />
      <path d="M14 112 Q 80 132, 146 112" />
      {range(12).map((i) => {
        const t = (i + 0.5) / 12;
        const x = 14 + t * 132;
        const y = 108 + Math.sin(t * Math.PI) * 10;
        return <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r="1.4" fill="currentColor" />;
      })}
      <circle cx="80" cy="8" r="3" fill="currentColor" />
    </svg>
  );
};

const serviceSparkles = [
  { top: '18%', left: '22%', delay: '0s', size: 10 },
  { top: '70%', left: '25%', delay: '-1.6s', size: 12 },
  { top: '26%', left: '76%', delay: '-2.4s', size: 9 },
  { top: '74%', left: '74%', delay: '-0.8s', size: 11 },
];

export const ServicesBackdrop: React.FC = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
    {/* Side illustrations only from 2xl: the one-line title is too wide to clear them on smaller laptops */}
    <div className="hidden 2xl:block text-mocha">
      {/* Makeup: crossed brushes, an open compact and a lipstick */}
      <div className="absolute top-[12%] left-[8%] opacity-80">
        <MakeupBrush full className="absolute h-44 w-9 -rotate-[22deg]" />
        <MakeupBrush className="absolute left-10 h-40 w-8 rotate-[18deg]" />
      </div>
      <div className="absolute bottom-[10%] left-[15%] animate-float motion-reduce:animate-none" style={{ animationDelay: '-1s' }}>
        <PowderCompact className="h-28 w-24 opacity-80" />
      </div>
      <div className="absolute bottom-[12%] left-[6%] rotate-12 opacity-80">
        <Lipstick className="h-24 w-9" />
      </div>

      {/* Hair and draping: jasmine strands and a fan of saree pleats */}
      <div className="absolute top-0 right-[4%] min-[1800px]:right-[8%] flex items-start gap-5 opacity-80">
        <JasmineStrand count={7} />
        <JasmineStrand count={5} delay="-1.8s" />
        <JasmineStrand count={8} delay="-0.9s" />
      </div>
      <SareePleats className="absolute bottom-[8%] right-[8%] min-[1800px]:right-[16%] h-28 w-36 opacity-80" />
    </div>

    {/* Twinkling sparkles */}
    {serviceSparkles.map((s) => (
      <svg
        key={s.top + s.left}
        viewBox="-10 -10 20 20"
        className="absolute hidden md:block text-mocha animate-twinkle motion-reduce:animate-none"
        style={{ top: s.top, left: s.left, width: s.size, height: s.size, animationDelay: s.delay }}
      >
        <path d="M0 -10 C 1 -2, 2 -1, 10 0 C 2 1, 1 2, 0 10 C -1 2, -2 1, -10 0 C -2 -1, -1 -2, 0 -10 Z" fill="currentColor" />
      </svg>
    ))}
  </div>
);

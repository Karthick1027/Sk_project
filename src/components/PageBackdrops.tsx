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

      {/* Marigold strings hanging on both sides */}
      <div className="absolute top-0 left-4 xl:left-10 hidden lg:flex items-start gap-3 opacity-80">
        {strandsLeft.map((s) => <MarigoldStrand key={s.delay} count={s.count} delay={s.delay} />)}
      </div>
      <div className="absolute top-0 right-4 xl:right-10 hidden lg:flex flex-row-reverse items-start gap-3 opacity-80">
        {strandsLeft.map((s) => <MarigoldStrand key={s.delay} count={s.count} delay={`${parseFloat(s.delay) - 1}s`} />)}
      </div>
    </div>
  );
};

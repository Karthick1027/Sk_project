import React, { useId } from 'react';

const uid = (raw: string) => raw.replace(/:/g, '');

type Placement = { x: number; y: number; r?: number; s?: number };

const place = ({ x, y, r = 0, s = 1 }: Placement) => `translate(${x} ${y}) rotate(${r}) scale(${s})`;

// Line-art lotus in full bloom; origin is the base of the flower.
export const LotusFlower: React.FC<Placement> = (p) => (
  <g transform={place(p)}>
    <path d="M0 -92 C -16 -62, -16 -27, 0 -2 C 16 -27, 16 -62, 0 -92 Z" />
    <path d="M0 -78 L0 -14" />
    <path d="M-2 -2 C -32 -12, -50 -42, -48 -72 C -25 -62, -8 -37, -2 -2 Z" />
    <path d="M2 -2 C 32 -12, 50 -42, 48 -72 C 25 -62, 8 -37, 2 -2 Z" />
    <path d="M-30 -52 C -22 -38, -12 -22, -5 -8" />
    <path d="M30 -52 C 22 -38, 12 -22, 5 -8" />
    <path d="M-4 0 C -44 3, -74 -17, -86 -40 C -54 -42, -24 -27, -4 0 Z" />
    <path d="M4 0 C 44 3, 74 -17, 86 -40 C 54 -42, 24 -27, 4 0 Z" />
    <path d="M-28 6 C -12 13, 12 13, 28 6" />
    <g fill="currentColor" stroke="none">
      <circle cy="-104" r="2.4" />
      <circle cx="-12" cy="-99" r="1.6" />
      <circle cx="12" cy="-99" r="1.6" />
      <circle cx="-22" cy="-90" r="1.2" />
      <circle cx="22" cy="-90" r="1.2" />
    </g>
  </g>
);

// Closed lotus bud with a sepal; origin is where it meets the stem.
const LotusBud: React.FC<Placement> = (p) => (
  <g transform={place(p)}>
    <path d="M0 0 C -14 -16, -13 -40, 0 -58 C 13 -40, 14 -16, 0 0 Z" />
    <path d="M0 -6 C -6 -20, -6 -38, 0 -50" />
    <path d="M-3 -2 C -18 -8, -24 -20, -24 -32 C -14 -25, -6 -14, -3 -2 Z" />
    <path d="M3 -2 C 18 -8, 24 -20, 24 -32 C 14 -25, 6 -14, 3 -2 Z" />
  </g>
);

// Long pointed leaf with a centre vein, pointing right from the origin.
const Leaf: React.FC<Placement> = (p) => (
  <path
    transform={place(p)}
    d="M0 0 C 8 -11, 27 -14, 44 0 C 27 14, 8 11, 0 0 Z M3 0 L 38 0"
  />
);

// Lotus spray: one bloom, two buds and leaves on curving stems.
const LotusSpray: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="0 0 420 380" className={className} fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M70 380 C 100 330, 150 290, 205 262" />
    <path d="M95 380 C 140 320, 270 270, 330 165" />
    <path d="M45 380 C 40 320, 55 260, 72 212" />

    <LotusFlower x={210} y={258} r={18} s={1.05} />
    <LotusBud x={332} y={160} r={28} s={1.05} />
    <LotusBud x={72} y={210} r={-14} s={0.85} />

    <Leaf x={130} y={318} r={-150} s={1.9} />
    <Leaf x={250} y={262} r={-40} s={1.5} />
    <Leaf x={58} y={290} r={-100} s={1.4} />
    <Leaf x={290} y={222} r={-120} s={1.1} />

    <g fill="currentColor" stroke="none">
      <circle cx="370" cy="110" r="2.2" />
      <circle cx="384" cy="124" r="1.6" />
      <circle cx="360" cy="92" r="1.4" />
      <circle cx="40" cy="160" r="2" />
      <circle cx="30" cy="176" r="1.4" />
    </g>
  </svg>
);

// A temple bell hanging from a beaded string.
const HangingBell: React.FC<{ length: number; delay?: string }> = ({ length, delay = '0s' }) => {
  const gradientId = `sk-gold-${uid(useId())}`;
  const y = length;
  const beads = [];
  for (let by = 12; by < length - 8; by += 14) beads.push(by);

  return (
    <svg
      width="28"
      height={length + 40}
      viewBox={`0 0 28 ${length + 40}`}
      className="origin-top animate-swing motion-reduce:animate-none"
      style={{ animationDelay: delay }}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#E3D2BE" />
          <stop offset="50%" stopColor="#A78B73" />
          <stop offset="100%" stopColor="#6B4F3F" />
        </linearGradient>
      </defs>
      <line x1="14" y1="0" x2="14" y2={y} stroke="#A78B73" strokeWidth="0.9" />
      <g fill={`url(#${gradientId})`}>
        {beads.map((by) => <circle key={by} cx="14" cy={by} r="1.8" />)}
        <circle cx="14" cy={y} r="3.2" />
        <path d={`M14 ${y + 2} C 5 ${y + 4}, 4 ${y + 14}, 3 ${y + 22} L 25 ${y + 22} C 24 ${y + 14}, 23 ${y + 4}, 14 ${y + 2} Z`} />
        <ellipse cx="14" cy={y + 22.5} rx="12.5" ry="2.4" />
        <circle cx="6" cy={y + 28} r="1.8" />
        <circle cx="14" cy={y + 28} r="1.8" />
        <circle cx="22" cy={y + 28} r="1.8" />
        <circle cx="14" cy={y + 35} r="3" />
      </g>
      <path d={`M9 ${y + 10} C 9 ${y + 15}, 8 ${y + 18}, 7 ${y + 20}`} stroke="#FFFCF6" strokeOpacity="0.6" strokeWidth="1" fill="none" />
    </svg>
  );
};

const HeroBackdrop: React.FC = () => {
  const patternId = `sk-floral-${uid(useId())}`;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Fine floral lattice, faded towards the edges */}
      <svg className="absolute inset-0 h-full w-full text-mocha opacity-[0.14] [mask-image:radial-gradient(ellipse_75%_70%_at_65%_45%,black_20%,transparent_75%)]">
        <defs>
          <pattern id={patternId} width="72" height="72" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="0.8" transform="translate(36 36)">
              <ellipse cy="-7" rx="3.2" ry="7" />
              <ellipse cy="7" rx="3.2" ry="7" />
              <ellipse cx="-7" rx="7" ry="3.2" />
              <ellipse cx="7" rx="7" ry="3.2" />
              <circle r="1.6" fill="currentColor" stroke="none" />
            </g>
            <g fill="currentColor">
              <circle cx="0" cy="0" r="1.3" />
              <circle cx="72" cy="0" r="1.3" />
              <circle cx="0" cy="72" r="1.3" />
              <circle cx="72" cy="72" r="1.3" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${patternId})`} />
      </svg>

      {/* Soft colour glows */}
      <div className="absolute -top-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-champagne/30 blur-3xl" />
      <div className="absolute bottom-0 -left-32 h-80 w-80 rounded-full bg-blush/50 blur-3xl" />

      {/* Gold line-art lotus sprays */}
      <LotusSpray className="absolute -bottom-24 -left-16 w-60 md:w-80 text-mocha opacity-30" />
      <LotusSpray className="absolute -bottom-10 -right-10 w-56 md:w-72 text-mocha opacity-25 -scale-x-100" />

      {/* Hanging temple bells */}
      <div className="absolute top-0 right-4 lg:right-8 hidden md:flex items-start gap-5 opacity-80">
        <HangingBell length={120} delay="0s" />
        <HangingBell length={200} delay="-1.6s" />
        <HangingBell length={90} delay="-3.1s" />
      </div>
    </div>
  );
};

export default HeroBackdrop;

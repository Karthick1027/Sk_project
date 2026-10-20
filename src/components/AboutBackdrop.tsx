import React, { useId } from 'react';

const uid = (raw: string) => raw.replace(/:/g, '');
const range = (n: number) => Array.from({ length: n }, (_, i) => i);

// Small five-petal blossom used along the garland.
const Blossom: React.FC<{ x: number; y: number; s?: number }> = ({ x, y, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    {range(5).map((i) => (
      <ellipse key={i} cy="-3.6" rx="2.4" ry="3.4" transform={`rotate(${i * 72})`} />
    ))}
    <circle r="1.5" className="fill-cocoa" />
  </g>
);

// Line-art mandala built from concentric petal rings.
export const Mandala: React.FC<{ className?: string }> = ({ className = '' }) => (
  <svg viewBox="-200 -200 400 400" className={className} fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" aria-hidden="true">
    {/* Centre flower */}
    {range(8).map((i) => (
      <path key={`c${i}`} transform={`rotate(${i * 45})`} d="M0 -8 C -8 -16, -8 -28, 0 -34 C 8 -28, 8 -16, 0 -8 Z" />
    ))}
    <circle r="5" />
    <circle r="40" />
    <circle r="44" />

    {/* Petal ring */}
    {range(12).map((i) => (
      <g key={`p${i}`} transform={`rotate(${i * 30})`}>
        <path d="M0 -44 C -16 -60, -16 -86, 0 -104 C 16 -86, 16 -60, 0 -44 Z" />
        <path d="M0 -54 L0 -92" />
      </g>
    ))}
    {range(12).map((i) => (
      <path key={`q${i}`} transform={`rotate(${i * 30 + 15})`} d="M0 -50 C -8 -62, -8 -74, 0 -84 C 8 -74, 8 -62, 0 -50 Z" />
    ))}
    <circle r="114" />

    {/* Scalloped arches */}
    {range(24).map((i) => (
      <path key={`a${i}`} transform={`rotate(${i * 15})`} d="M-15 -114 Q 0 -162, 15 -114" />
    ))}
    {range(24).map((i) => (
      <circle key={`d${i}`} transform={`rotate(${i * 15 + 7.5})`} cy="-128" r="1.8" fill="currentColor" stroke="none" />
    ))}
    <circle r="150" strokeDasharray="0.1 6" strokeWidth="2.2" />

    {/* Outer leaf fringe */}
    {range(36).map((i) => (
      <path key={`l${i}`} transform={`rotate(${i * 10})`} d="M0 -160 C -6 -168, -6 -178, 0 -188 C 6 -178, 6 -168, 0 -160 Z" />
    ))}
    <circle r="195" strokeDasharray="0.1 8" strokeWidth="2.4" />
  </svg>
);

const AboutBackdrop: React.FC = () => {
  const id = uid(useId());
  const paisleyId = `sk-paisley-${id}`;
  const garlandId = `sk-garland-${id}`;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Paisley lattice, strongest behind the text column */}
      <svg className="absolute inset-0 h-full w-full text-mocha opacity-[0.16] [mask-image:radial-gradient(ellipse_60%_70%_at_25%_55%,black_15%,transparent_75%)]">
        <defs>
          <pattern id={paisleyId} width="96" height="96" patternUnits="userSpaceOnUse">
            <g fill="none" stroke="currentColor" strokeWidth="0.9" strokeLinecap="round">
              {[{ x: 26, y: 28, r: -20 }, { x: 74, y: 74, r: 160 }].map((p) => (
                <g key={p.x} transform={`translate(${p.x} ${p.y}) rotate(${p.r})`}>
                  <path d="M-2 14 C -17 12, -17 -10, -2 -15 C 10 -19, 18 -9, 12 1 C 8 8, 12 15, 20 12" />
                  <path d="M-2 8 C -10 6, -10 -6, -2 -9 C 4 -11, 8 -6, 6 -1" />
                  <circle cx="-3" cy="-1" r="1.6" fill="currentColor" stroke="none" />
                </g>
              ))}
              <circle cx="74" cy="22" r="1.3" fill="currentColor" stroke="none" />
              <circle cx="22" cy="74" r="1.3" fill="currentColor" stroke="none" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${paisleyId})`} />
      </svg>

      {/* Soft colour glows */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-champagne/30 blur-3xl" />
      <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-blush/40 blur-3xl" />

      {/* Flower garland (toran) along the top edge */}
      <svg className="absolute top-0 left-0 h-[52px] w-full opacity-70">
        <defs>
          <pattern id={garlandId} width="120" height="52" patternUnits="userSpaceOnUse">
            <path d="M0 4 Q 60 46, 120 4" fill="none" stroke="#A78B73" strokeWidth="0.9" />
            <g className="fill-champagne stroke-mocha" strokeWidth="0.6">
              <Blossom x={18} y={14.7} s={0.85} />
              <Blossom x={36} y={21.6} />
              <Blossom x={60} y={25} s={1.15} />
              <Blossom x={84} y={21.6} />
              <Blossom x={102} y={14.7} s={0.85} />
            </g>
            <g className="fill-mocha">
              <path d="M60 30 L60 38" stroke="#A78B73" strokeWidth="0.8" />
              <path d="M60 38 C 56 42, 56 46, 60 50 C 64 46, 64 42, 60 38 Z" />
              <circle cx="0" cy="6" r="3" />
              <circle cx="120" cy="6" r="3" />
            </g>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill={`url(#${garlandId})`} />
      </svg>
    </div>
  );
};

export default AboutBackdrop;

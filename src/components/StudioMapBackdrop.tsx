import React, { useId } from 'react';
import './StudioMapBackdrop.css';

const route = 'M-40 510 H140 Q170 510 170 480 V240 Q170 210 200 210 H410 Q440 210 440 180 V90 Q440 60 470 60 H790 Q820 60 820 90 V360 Q820 390 850 390 H1080 Q1110 390 1110 420 V620 Q1110 650 1140 650 H1450';

const StudioMapBackdrop: React.FC = () => {
  const patternId = `studio-streets-${useId().replace(/:/g, '')}`;

  return (
    <div aria-hidden="true" className="studio-map-backdrop">
      <svg viewBox="0 0 1400 760" preserveAspectRatio="xMidYMid slice" fill="none">
        <defs>
          <pattern id={patternId} width="280" height="220" patternUnits="userSpaceOnUse" patternTransform="rotate(-12)">
            <path d="M0 40H280 M0 150H280 M65 0V220 M210 0V220" stroke="currentColor" strokeWidth="1.2" />
            <path d="M0 92H135V150 M135 0V40 M210 92H280 M65 190H210" stroke="currentColor" strokeWidth=".7" />
            <rect x="79" y="54" width="42" height="24" rx="5" fill="currentColor" fillOpacity=".13" />
            <rect x="150" y="163" width="46" height="40" rx="7" fill="currentColor" fillOpacity=".13" />
          </pattern>
        </defs>
        <rect width="1400" height="760" fill={`url(#${patternId})`} className="studio-map-streets" />
        <path d="M-60 720C190 550 120 340 300 300S550 440 660 260 960 100 1460 160" stroke="currentColor" strokeWidth="30" className="studio-map-river" />
        <path d={route} stroke="currentColor" strokeWidth="2" strokeDasharray="5 9" className="studio-map-route-base" />
        <path d={route} pathLength="1000" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="studio-map-route-moving" />
        <g className="studio-map-landmarks" stroke="currentColor">
          <circle cx="170" cy="400" r="7" fill="#FFFCF6" strokeWidth="2" />
          <circle cx="610" cy="60" r="7" fill="#FFFCF6" strokeWidth="2" />
          <circle cx="1110" cy="510" r="7" fill="#FFFCF6" strokeWidth="2" />
          <circle cx="820" cy="210" r="22" strokeWidth="1" />
          <circle cx="820" cy="210" r="12" fill="#FFFCF6" strokeWidth="2" />
          <circle cx="820" cy="210" r="4" fill="currentColor" stroke="none" />
        </g>
      </svg>
    </div>
  );
};

export default StudioMapBackdrop;

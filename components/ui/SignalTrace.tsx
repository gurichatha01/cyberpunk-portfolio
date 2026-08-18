'use client';

import { useMemo } from 'react';
import type { CSSProperties } from 'react';
import type { Era } from '@/content/journey';

const W = 1000;
const MID = 108;
const NODE_X = [80, 285, 460, 660, 915];

/* Waveform whose amplitude grows left→right: near-flat at 2019, full by now.
   Built as an SVG path string in JS (§4). Deterministic, so it's memoised and
   never regenerates — the draw-in animation runs once and selecting an era only
   recolours it, it does not redraw. */
function buildPath(gain: number): string {
  let d = '';
  for (let x = 0; x <= W; x += 3) {
    const t = x / W;
    const amp = (2 + Math.pow(t, 1.7) * 56) * gain;
    const y =
      MID -
      Math.sin(x * 0.085) * amp -
      Math.sin(x * 0.21) * amp * 0.42 -
      Math.sin(x * 0.44) * amp * 0.16;
    d += `${x === 0 ? 'M' : 'L'}${x.toFixed(0)} ${y.toFixed(1)} `;
  }
  return d;
}

interface SignalTraceProps {
  eras: Era[];
  era: number;
  onSelect: (i: number) => void;
}

export function SignalTrace({ eras, era, onSelect }: SignalTraceProps) {
  const main = useMemo(() => buildPath(1), []);
  const ghost = useMemo(() => buildPath(1.12), []);
  const pct = Math.round(((era + 1) / eras.length) * 100);

  return (
    <div className="scope">
      <div className="shead">
        <span>SIGNAL STRENGTH · 2019 → NOW</span>
        <span>AMPLITUDE ▲ {pct}%</span>
      </div>
      {/* The whole trace is one image for AT; the chips below are the real
          keyboard control, so the nodes are mouse affordances only. */}
      <svg
        viewBox="0 0 1000 165"
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label="Career signal trace — amplitude grows from 2019 to now"
      >
        {[30, 108, 150].map((y) => (
          <line key={y} className="gridln" x1="0" y1={y} x2="1000" y2={y} />
        ))}
        {[200, 400, 600, 800].map((x) => (
          <line key={x} className="gridln" x1={x} y1="8" x2={x} y2="150" />
        ))}
        <path className="trace ghost" d={ghost} />
        <path className="trace" d={main} />
        {eras.map((e, i) => (
          <g key={i} style={{ ['--nc']: e.nc } as CSSProperties}>
            <line
              className={`nodetick${i === era ? ' sel' : ''}`}
              x1={NODE_X[i]}
              y1="14"
              x2={NODE_X[i]}
              y2="132"
            />
            <circle
              className={`nodedot${i === era ? ' sel' : ''}`}
              cx={NODE_X[i]}
              cy="108"
              r={i === era ? 8 : 6}
              onClick={() => onSelect(i)}
            />
            <text
              className={`yr${i === era ? ' sel' : ''}`}
              x={NODE_X[i]}
              y="152"
              textAnchor="middle"
            >
              {e.yr}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}

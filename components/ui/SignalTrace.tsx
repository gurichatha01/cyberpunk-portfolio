'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties, MutableRefObject } from 'react';
import type { Era } from '@/content/journey';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* =========================================================================
   Signal trace — simple and unbreakable (journey-v5).

   FIXED viewBox: horizontal 0 0 1000 200, vertical 0 0 200 1000. Amplitude is a
   fraction of the viewBox, so the wave scales with whatever height CSS gives the
   box (preserveAspectRatio="none"). Nothing is measured — no ResizeObserver — so
   it can't render blank when it mounts on an inactive tab.

   The paths get a real `d` on first render (phase 0); rAF only overrides it. The
   wave never depends on rAF having run. vector-effect="non-scaling-stroke" is on
   every stroked element because the box is stretched.
   ========================================================================= */

const ALONG = 1000; // sweep axis length (both orientations)
const ACROSS = 200; // cross axis; centre = 100
const CENTRE = ACROSS / 2;
const HEADROOM = 0.86; // wave uses at most 86% of the half-height
const MAX_AMP = CENTRE * HEADROOM;

// harmonic weights / frequency multiples / phase multiples
const HW = [1, 0.42, 0.24, 0.13];
const HMUL = [1, 2.3, 4.1, 7.3];
const HPH = [1, 1.7, 2.6, 3.4];

function sigAt(t: number, eras: Era[], seg: number) {
  const p = Math.min(seg, Math.max(0, t * seg));
  const i = Math.floor(p);
  const f = p - i;
  const a = eras[i].sig;
  const b = eras[Math.min(seg, i + 1)].sig;
  return {
    freq: a.freq + (b.freq - a.freq) * f,
    harm: a.harm + (b.harm - a.harm) * f,
    amp: a.amp + (b.amp - a.amp) * f,
    jit: a.jit + (b.jit - a.jit) * f,
  };
}

const nodeWindow = (u: number, seg: number) =>
  Math.pow(Math.abs(Math.sin(Math.PI * u * seg)), 0.55);

/* Harmonics are normalised, then clamped, so the result is guaranteed within
   ±MAX_AMP — the wave can never poke through the scope edge. */
function sample(u: number, phase: number, eras: Era[], seg: number) {
  const s = sigAt(u, eras, seg);
  const x = u * 1000;
  let v = 0;
  let norm = 0;
  for (let h = 0; h < 4; h++) {
    const present = Math.min(1, Math.max(0, s.harm - h));
    if (present <= 0) continue;
    const w = HW[h] * present;
    v += Math.sin(x * s.freq * HMUL[h] + phase * HPH[h]) * w;
    norm += w;
  }
  v += Math.sin(x * 1.35 + phase * 4.2) * s.jit;
  norm += s.jit;
  v = norm > 0 ? v / norm : 0;
  v = Math.max(-1, Math.min(1, v));
  const env = 0.12 + Math.pow(u, 1.4) * 0.88;
  return v * env * s.amp * nodeWindow(u, seg) * MAX_AMP;
}

function buildPath(
  phase: number,
  from: number,
  to: number,
  vertical: boolean,
  eras: Era[],
  seg: number
) {
  const steps = vertical ? 420 : 340;
  const a0 = Math.max(0, Math.floor(from * steps));
  const a1 = Math.min(steps, Math.ceil(to * steps));
  if (a1 <= a0) return '';
  const pts: string[] = [];
  for (let k = a0; k <= a1; k++) {
    const u = k / steps;
    const off = sample(u, phase, eras, seg);
    const px = vertical ? CENTRE + off : u * ALONG;
    const py = vertical ? u * ALONG : CENTRE - off;
    pts.push(`${k === a0 ? 'M' : 'L'}${px.toFixed(1)} ${py.toFixed(1)}`);
  }
  return pts.join(' ');
}

interface SignalTraceProps {
  eras: Era[];
  era: number;
  vertical: boolean;
  /** 0–1 fill progress, read every frame so scroll can drive it imperatively */
  progress: MutableRefObject<number>;
  onSelect?: (i: number) => void;
  className?: string;
}

export function SignalTrace({
  eras,
  era,
  vertical,
  progress,
  onSelect,
  className,
}: SignalTraceProps) {
  const reduced = useReducedMotion();
  const dimRef = useRef<SVGPathElement>(null);
  const litRef = useRef<SVGPathElement>(null);
  const beamRef = useRef<SVGPathElement>(null);

  const seg = eras.length - 1;
  const pos = (i: number) => (i / seg) * ALONG;

  // Static first-paint paths — the wave is NEVER blank, even before rAF runs.
  const initDim = buildPath(0, 0, 1, vertical, eras, seg);
  const initLit = buildPath(0, 0, Math.max(0.004, era / seg), vertical, eras, seg);

  useEffect(() => {
    let raf = 0;
    let stop = false;
    const t0 = performance.now();

    const frame = (now: number) => {
      if (stop) return;
      const phase = reduced ? 0 : ((now - t0) / 1000) * 1.05;
      const p = progress.current;
      dimRef.current?.setAttribute('d', buildPath(phase, 0, 1, vertical, eras, seg));
      litRef.current?.setAttribute(
        'd',
        buildPath(phase, 0, Math.max(0.004, p), vertical, eras, seg)
      );
      if (beamRef.current) {
        if (reduced) {
          beamRef.current.setAttribute('d', '');
        } else {
          const bu = ((now - t0) / 3000) % 1;
          beamRef.current.setAttribute(
            'd',
            buildPath(phase, Math.max(0, bu - 0.06), bu, vertical, eras, seg)
          );
        }
      }
      // reduced motion paints exactly one frame; otherwise loop
      if (!reduced) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // Pause the loop when the tab is hidden (the static `d` keeps it visible).
    const onVis = () => {
      if (reduced) return;
      if (document.hidden) {
        stop = true;
        cancelAnimationFrame(raf);
      } else {
        stop = false;
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      stop = true;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [eras, vertical, reduced, progress]);

  return (
    <svg
      className={className}
      viewBox={vertical ? `0 0 ${ACROSS} ${ALONG}` : `0 0 ${ALONG} ${ACROSS}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Career signal trace — the waveform gains frequency and amplitude from 2019 to now"
    >
      {/* node grid lines */}
      {eras.map((_, i) =>
        vertical ? (
          <line
            key={i}
            className="gridln"
            x1="4"
            y1={pos(i)}
            x2={ACROSS - 4}
            y2={pos(i)}
            vectorEffect="non-scaling-stroke"
          />
        ) : (
          <line
            key={i}
            className="gridln"
            x1={pos(i)}
            y1="0"
            x2={pos(i)}
            y2={ACROSS}
            vectorEffect="non-scaling-stroke"
          />
        )
      )}

      {/* desktop: centre line + playhead marking the selected era */}
      {!vertical && (
        <>
          <line
            className="gridln"
            x1="0"
            y1={CENTRE}
            x2={ALONG}
            y2={CENTRE}
            vectorEffect="non-scaling-stroke"
          />
          <line
            className="playhead"
            x1={pos(era)}
            y1="0"
            x2={pos(era)}
            y2={ACROSS}
            vectorEffect="non-scaling-stroke"
          />
        </>
      )}

      {/* the signal: full dim trace, lit portion up to progress, sweeping beam.
          `d` is set on render so it's never blank; rAF overrides it. */}
      <path
        ref={dimRef}
        className="wave-dim"
        d={initDim}
        strokeWidth="1.4"
        vectorEffect="non-scaling-stroke"
      />
      <path
        ref={litRef}
        className="wave-lit"
        d={initLit}
        strokeWidth="1.9"
        vectorEffect="non-scaling-stroke"
      />
      <path ref={beamRef} className="beam" strokeWidth="1.7" vectorEffect="non-scaling-stroke" />

      {/* era nodes */}
      {eras.map((e, i) => {
        const cx = vertical ? CENTRE : pos(i);
        const cy = vertical ? pos(i) : CENTRE;
        const dot = (
          <circle
            className="nodedot"
            cx={cx}
            cy={cy}
            r={i === era ? 7 : 5}
            fill={i <= era ? e.hex : '#0a0e14'}
            stroke={e.hex}
            strokeWidth="2"
            vectorEffect="non-scaling-stroke"
            style={
              i === era ? ({ filter: `drop-shadow(0 0 9px ${e.hex})` } as CSSProperties) : undefined
            }
          />
        );
        // desktop nodes are a mouse affordance; the chips are the real control
        return onSelect && !vertical ? (
          <g key={i} onClick={() => onSelect(i)} style={{ cursor: 'pointer' }}>
            <rect x={pos(i) - 30} y="0" width="60" height={ACROSS} fill="transparent" />
            {dot}
          </g>
        ) : (
          <g key={i}>{dot}</g>
        );
      })}
    </svg>
  );
}

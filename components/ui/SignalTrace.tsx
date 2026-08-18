'use client';

import { useEffect, useMemo, useRef } from 'react';
import type { MutableRefObject } from 'react';
import type { Era } from '@/content/journey';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* Geometry. Horizontal = desktop scope, vertical = mobile spine. Both use
   preserveAspectRatio="none" so the viewBox stretches to whatever box CSS
   gives it, which is how the trace fills the panel at any height. */
const H = { w: 1000, cy: 95, h: 190, amp: 66, step: 2.0 };
const V = { w: 66, cx: 33, h: 660, amp: 27, step: 1.4 };

/* Per-sample terms that don't depend on the animation phase. Computing these
   once (instead of every frame) leaves only the sin() calls in the hot loop. */
interface Precomputed {
  n: number;
  /** x * freq, and the three harmonic multiples */
  f1: Float32Array;
  f2: Float32Array;
  f3: Float32Array;
  f4: Float32Array;
  /** jitter carrier + gain */
  xj: Float32Array;
  jit: Float32Array;
  /** harmonic gains, already zeroed where the harmonic isn't present */
  g2: Float32Array;
  g3: Float32Array;
  g4: Float32Array;
  /** envelope * amp * node-window * maxAmp — the whole amplitude term */
  env: Float32Array;
  /** screen position along the sweep axis */
  pos: Float32Array;
}

function precompute(eras: Era[], vertical: boolean): Precomputed {
  const G = vertical ? V : H;
  const seg = eras.length - 1;
  const total = vertical ? G.h : (G as typeof H).w;
  const n = Math.ceil(total / G.step);

  const f1 = new Float32Array(n + 1);
  const f2 = new Float32Array(n + 1);
  const f3 = new Float32Array(n + 1);
  const f4 = new Float32Array(n + 1);
  const xj = new Float32Array(n + 1);
  const jit = new Float32Array(n + 1);
  const g2 = new Float32Array(n + 1);
  const g3 = new Float32Array(n + 1);
  const g4 = new Float32Array(n + 1);
  const env = new Float32Array(n + 1);
  const pos = new Float32Array(n + 1);

  for (let k = 0; k <= n; k++) {
    const u = k / n;

    // interpolate the signal character between the two surrounding eras
    const p = Math.min(seg, Math.max(0, u * seg));
    const i = Math.floor(p);
    const t = p - i;
    const a = eras[i].sig;
    const b = eras[Math.min(seg, i + 1)].sig;
    const freq = a.freq + (b.freq - a.freq) * t;
    const harm = a.harm + (b.harm - a.harm) * t;
    const amp = a.amp + (b.amp - a.amp) * t;
    const jitter = a.jit + (b.jit - a.jit) * t;

    const x = u * 1000;
    f1[k] = x * freq;
    f2[k] = x * freq * 2.3;
    f3[k] = x * freq * 4.1;
    f4[k] = x * freq * 7.3;
    xj[k] = x * 1.35;
    jit[k] = jitter;
    g2[k] = harm > 1 ? 0.42 * Math.min(1, harm - 1) : 0;
    g3[k] = harm > 2 ? 0.24 * Math.min(1, harm - 2) : 0;
    g4[k] = harm > 3 ? 0.13 * Math.min(1, harm - 3) : 0;

    // pinch the wave to a zero crossing exactly on every node, so the markers
    // always sit on the axis instead of somewhere mid-swing
    const nodeWindow = Math.pow(Math.abs(Math.sin(Math.PI * u * seg)), 0.55);
    const envelope = 0.12 + Math.pow(u, 1.4) * 0.88;
    env[k] = envelope * amp * nodeWindow * G.amp * 0.62;

    pos[k] = vertical ? u * G.h : u * (G as typeof H).w;
  }

  return { n, f1, f2, f3, f4, xj, jit, g2, g3, g4, env, pos };
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

  const pre = useMemo(() => precompute(eras, vertical), [eras, vertical]);
  const G = vertical ? V : H;
  const seg = eras.length - 1;

  /* Holds a "paint one static frame" closure. With reduced motion there's no
     rAF loop, so the trace still needs a repaint when the selection (and hence
     the fill) changes — otherwise the lit portion would never update. */
  const repaint = useRef<(() => void) | null>(null);

  useEffect(() => {
    const build = (phase: number, from: number, to: number) => {
      const a0 = Math.max(0, Math.floor(from * pre.n));
      const a1 = Math.min(pre.n, Math.ceil(to * pre.n));
      if (a1 <= a0) return '';
      let d = '';
      for (let k = a0; k <= a1; k++) {
        let v = Math.sin(pre.f1[k] + phase);
        if (pre.g2[k]) v += Math.sin(pre.f2[k] + phase * 1.7) * pre.g2[k];
        if (pre.g3[k]) v += Math.sin(pre.f3[k] + phase * 2.6) * pre.g3[k];
        if (pre.g4[k]) v += Math.sin(pre.f4[k] + phase * 3.4) * pre.g4[k];
        v += Math.sin(pre.xj[k] + phase * 4.2) * pre.jit[k];
        const off = v * pre.env[k];
        const px = vertical ? V.cx + off : pre.pos[k];
        const py = vertical ? pre.pos[k] : H.cy - off;
        d += `${k === a0 ? 'M' : 'L'}${px.toFixed(1)} ${py.toFixed(1)} `;
      }
      return d;
    };

    const paint = (phase: number, now: number, t0: number) => {
      const p = progress.current;
      dimRef.current?.setAttribute('d', build(phase, 0, 1));
      litRef.current?.setAttribute('d', build(phase, 0, Math.max(0.004, p)));
      if (beamRef.current) {
        if (reduced) {
          beamRef.current.setAttribute('d', '');
        } else {
          const bu = ((now - t0) / 3000) % 1;
          beamRef.current.setAttribute('d', build(phase, Math.max(0, bu - 0.06), bu));
        }
      }
    };

    // Reduced motion: paint one static frame, no loop at all.
    if (reduced) {
      repaint.current = () => paint(0, 0, 0);
      repaint.current();
      return () => {
        repaint.current = null;
      };
    }

    let raf = 0;
    const t0 = performance.now();
    let running = true;

    const frame = (now: number) => {
      if (!running) return;
      paint(((now - t0) / 1000) * 1.05, now, t0);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    // Don't burn CPU animating a trace nobody is looking at.
    const onVisibility = () => {
      if (document.hidden) {
        running = false;
        cancelAnimationFrame(raf);
      } else if (!running) {
        running = true;
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [pre, vertical, reduced, progress]);

  // Reduced motion only: the animation loop isn't running, so redraw the fill
  // whenever the selected era moves.
  useEffect(() => {
    if (reduced) repaint.current?.();
  }, [era, reduced]);

  const nodeAt = (i: number) => (i / seg) * (vertical ? V.h : H.w);

  return (
    <svg
      className={className}
      viewBox={`0 0 ${G.w} ${G.h}`}
      preserveAspectRatio="none"
      role="img"
      aria-label="Career signal trace — the waveform gains frequency and amplitude from 2019 to now"
    >
      {/* grid */}
      {vertical
        ? eras.map((_, i) => (
            <line
              key={i}
              className="gridln"
              x1="3"
              y1={nodeAt(i)}
              x2={V.w - 3}
              y2={nodeAt(i)}
            />
          ))
        : [
            [25, 95, 165].map((y) => (
              <line key={`h${y}`} className="gridln" x1="0" y1={y} x2={H.w} y2={y} />
            )),
            eras.map((_, i) => (
              <line
                key={`v${i}`}
                className="gridln"
                x1={nodeAt(i)}
                y1="6"
                x2={nodeAt(i)}
                y2={H.h - 6}
              />
            )),
          ]}

      {/* playhead marks the selected era on the desktop scope */}
      {!vertical && (
        <line
          className="playhead"
          x1={nodeAt(era)}
          y1="6"
          x2={nodeAt(era)}
          y2={H.h - 6}
          vectorEffect="non-scaling-stroke"
        />
      )}

      {/* the signal: full dim trace, lit portion up to progress, sweeping beam */}
      <path ref={dimRef} className="wave-dim" vectorEffect="non-scaling-stroke" />
      <path ref={litRef} className="wave-lit" vectorEffect="non-scaling-stroke" />
      <path ref={beamRef} className="beam" vectorEffect="non-scaling-stroke" />

      {/* era nodes */}
      {eras.map((e, i) => {
        const at = nodeAt(i);
        const cx = vertical ? V.cx : at;
        const cy = vertical ? at : H.cy;
        const dot = (
          <circle
            className="nodedot"
            cx={cx}
            cy={cy}
            r={i === era ? 8 : vertical ? 5.5 : 6}
            fill={i <= era ? e.hex : '#0a0e14'}
            stroke={e.hex}
            vectorEffect="non-scaling-stroke"
            style={i === era ? { filter: `drop-shadow(0 0 9px ${e.hex})` } : undefined}
          />
        );
        // desktop nodes are a mouse affordance; the chips are the real control
        return onSelect && !vertical ? (
          <g key={i} onClick={() => onSelect(i)} style={{ cursor: 'pointer' }}>
            <rect x={at - 30} y="6" width="60" height={H.h - 12} fill="transparent" />
            {dot}
          </g>
        ) : (
          <g key={i}>{dot}</g>
        );
      })}
    </svg>
  );
}

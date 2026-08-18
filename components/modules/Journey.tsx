'use client';

import { useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { SignalTrace } from '@/components/ui/SignalTrace';
import { ERAS, formatDuration } from '@/content/journey';

interface JourneyProps {
  era: number;
  setEra: (i: number) => void;
}

export default function Journey({ era, setEra }: JourneyProps) {
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const firstRun = useRef(true);

  // Arrow keys scrub eras while JOURNEY is on screen. If a chip has focus,
  // move focus along with the selection so keyboard nav stays coherent.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      let next = era;
      if (e.key === 'ArrowRight') next = Math.min(ERAS.length - 1, era + 1);
      else if (e.key === 'ArrowLeft') next = Math.max(0, era - 1);
      else return;
      e.preventDefault();
      if (next === era) return;
      const chipFocused = chipRefs.current.includes(
        document.activeElement as HTMLButtonElement
      );
      setEra(next);
      if (chipFocused) {
        requestAnimationFrame(() => chipRefs.current[next]?.focus());
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [era, setEra]);

  // Keep the selected chip visible in the mobile scroll-snap row (§5).
  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    chipRefs.current[era]?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [era]);

  const E = ERAS[era];
  const dur = E.since ? formatDuration(E.since) : E.dur;

  return (
    <div style={{ ['--ac']: E.nc } as CSSProperties}>
      <div className="sec-h disp">JOURNEY</div>
      <div className="sec-sub">SIGNAL LOG · HARDWARE → DATA → PRODUCT</div>

      <SignalTrace eras={ERAS} era={era} onSelect={setEra} />

      <div className="jrow">
        {ERAS.map((e, i) => (
          <button
            key={i}
            ref={(el) => {
              chipRefs.current[i] = el;
            }}
            type="button"
            className={`jchip${i === era ? ' on' : ''}`}
            style={{ ['--jc']: e.nc } as CSSProperties}
            aria-pressed={i === era}
            onClick={() => setEra(i)}
          >
            {e.org} · {e.yr}
          </button>
        ))}
      </div>

      <div className="era" key={era} style={{ ['--ac']: E.nc } as CSSProperties}>
        <div className="top">
          <div>
            <div className="when">{E.when}</div>
            <div className="org disp">{E.org}</div>
            <div className="rl">{E.role}</div>
          </div>
          <div className="dur" suppressHydrationWarning>
            {dur}
          </div>
        </div>
        <p>
          {E.body.map((run, i) =>
            run.b ? <b key={i}>{run.t}</b> : <span key={i}>{run.t}</span>
          )}
        </p>
        <div className="augh">▸ AUGMENTS INSTALLED</div>
        <div className="augs">
          {E.augs.map((a) => (
            <span className="aug" key={a}>
              {a}
            </span>
          ))}
        </div>
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {`Era: ${E.org}, ${E.yr}`}
      </div>
    </div>
  );
}

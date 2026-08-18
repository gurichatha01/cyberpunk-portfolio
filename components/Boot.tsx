'use client';

import { useCallback, useEffect, useRef } from 'react';
import { BOOT_DURATION, BOOT_LINES, BOOT_TITLE } from '@/content/boot';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* Full boot intro — same length on mobile as desktop (owner override of §5's
   shortened mobile boot). Plays on every load; there's deliberately no
   sessionStorage skip. Escape hatches: tap/click anywhere, press any key, or
   prefers-reduced-motion (which dismisses it immediately, per §6). */
export default function Boot({ onDone }: { onDone: () => void }) {
  const reduced = useReducedMotion();
  const done = useRef(false);

  const finish = useCallback(() => {
    if (done.current) return;
    done.current = true;
    onDone();
  }, [onDone]);

  useEffect(() => {
    if (reduced) {
      finish();
      return;
    }
    const t = window.setTimeout(finish, BOOT_DURATION);
    const onKey = () => finish();
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [reduced, finish]);

  return (
    <div
      className="boot"
      role="status"
      aria-label="System booting"
      onClick={finish}
    >
      <div className="ln big disp" style={{ animationDelay: '0.05s' }}>
        {BOOT_TITLE}
      </div>
      {BOOT_LINES.map((line) => (
        <div className="ln" key={line.text} style={{ animationDelay: `${line.delay}s` }}>
          {line.text}
        </div>
      ))}
      <div className="bootskip" style={{ animationDelay: '2s' }}>
        tap / any key to skip ▸
      </div>
    </div>
  );
}

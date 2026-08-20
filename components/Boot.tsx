'use client';

import { useCallback, useEffect, useState } from 'react';
import { BOOT_DURATION, BOOT_LINES, BOOT_MODES, BOOT_TITLE } from '@/content/boot';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export type ExperienceMode = 'console' | 'signal';

interface BootProps {
  onSelect: (mode: ExperienceMode) => void;
}

/* The boot sequence now resolves into an explicit experience selector. It
   still plays on every load, but never chooses a mode on the user's behalf. */
export default function Boot({ onSelect }: BootProps) {
  const reduced = useReducedMotion();
  const [ready, setReady] = useState(false);

  const select = useCallback(
    (mode: ExperienceMode) => {
      window.scrollTo({ top: 0 });
      onSelect(mode);
    },
    [onSelect]
  );

  useEffect(() => {
    if (reduced) {
      setReady(true);
      return;
    }
    const t = window.setTimeout(() => setReady(true), BOOT_DURATION);
    const onKey = (event: KeyboardEvent) => {
      if (event.key === '1') select('console');
      else if (event.key === '2') select('signal');
      else setReady(true);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('keydown', onKey);
    };
  }, [reduced, select]);

  return (
    <div
      className={`boot${ready ? ' ready' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Choose portfolio experience"
    >
      <div className="boot-grid" aria-hidden="true" />
      <div className="bootcore">
        <div className="bootlog" aria-live="polite">
          <div className="ln big disp" style={{ animationDelay: '0.05s' }}>
            {BOOT_TITLE}
          </div>
          {BOOT_LINES.map((line) => (
            <div className="ln" key={line.text} style={{ animationDelay: `${line.delay}s` }}>
              {line.text}
            </div>
          ))}
        </div>

        {!ready ? (
          <button className="bootskip" type="button" onClick={() => setReady(true)}>
            tap / any key to reveal modes ▸
          </button>
        ) : (
          <div className="bootmenu">
            <div className="bootprompt">
              <span>BOOT TARGET REQUIRED</span>
              <b>SELECT AN EXPERIENCE</b>
            </div>

            <div className="bootmodes">
              {BOOT_MODES.map((mode) => (
                <button
                  className={`bootmode ${mode.accent}`}
                  type="button"
                  key={mode.id}
                  onClick={() => select(mode.id)}
                >
                  <span className="bootmode-no">{mode.no}</span>
                  <span className="bootmode-ver">{mode.version}</span>
                  <strong className="disp">{mode.title}</strong>
                  <span className="bootmode-copy">{mode.description}</span>
                  <span className="bootmode-command">▸ {mode.command}</span>
                </button>
              ))}
            </div>

            <div className="bootkeys">[ 1 ] CONSOLE · [ 2 ] SIGNAL RUN</div>
          </div>
        )}
      </div>
    </div>
  );
}

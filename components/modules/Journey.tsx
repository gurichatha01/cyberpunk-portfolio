'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { CSSProperties } from 'react';
import { SignalTrace } from '@/components/ui/SignalTrace';
import {
  ERAS,
  JOURNEY_FOOTNOTE,
  JOURNEY_HEADER,
  formatDuration,
  type Era,
} from '@/content/journey';
import { useMediaQuery } from '@/hooks/useMediaQuery';

const SEG = ERAS.length - 1;

function EraCard({ e, dim }: { e: Era; dim?: boolean }) {
  const dur = e.since ? formatDuration(e.since) : e.dur;
  return (
    <article className={`era${dim ? ' off' : ''}`} style={{ ['--ac']: e.nc } as CSSProperties}>
      <div className="top">
        <div>
          <div className="when">{e.when}</div>
          <h3 className="org disp">{e.org}</h3>
          <div className="rl">{e.role}</div>
        </div>
        <div className="dur" suppressHydrationWarning>
          {dur}
        </div>
      </div>
      <p>
        {e.body.map((run, i) =>
          run.b ? <b key={i}>{run.t}</b> : <span key={i}>{run.t}</span>
        )}
      </p>
      <div className="augh">▸ AUGMENTS INSTALLED</div>
      <div className="augs">
        {e.augs.map((a) => (
          <span className="aug" key={a}>
            {a}
          </span>
        ))}
      </div>
    </article>
  );
}

interface JourneyProps {
  era: number;
  setEra: (i: number) => void;
}

export default function Journey({ era, setEra }: JourneyProps) {
  const mobile = useMediaQuery('(max-width: 767px)');

  // 0–1 fill of the lit trace. A ref, not state: on mobile it's driven by
  // scroll every frame and must not trigger a React render.
  const progress = useRef(era / SEG);

  const scroller = useRef<HTMLDivElement>(null);
  const cards = useRef<(HTMLDivElement | null)[]>([]);
  const chips = useRef<(HTMLButtonElement | null)[]>([]);

  // Desktop: the fill follows the selected era.
  useEffect(() => {
    if (!mobile) progress.current = era / SEG;
  }, [era, mobile]);

  // Mobile: the fill follows scroll continuously, and the era selection snaps
  // to whichever card is nearest the middle of the viewport.
  const onScroll = useCallback(() => {
    const el = scroller.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    progress.current = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0;

    const mid = el.scrollTop + el.clientHeight / 2;
    let best = 0;
    let bestDist = Infinity;
    cards.current.forEach((c, i) => {
      if (!c) return;
      const d = Math.abs(c.offsetTop + c.offsetHeight / 2 - mid);
      if (d < bestDist) {
        bestDist = d;
        best = i;
      }
    });
    setEra(best);
  }, [setEra]);

  useEffect(() => {
    if (!mobile) return;
    const el = scroller.current;
    if (!el) return;
    let ticking = false;
    const handler = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
    };
    el.addEventListener('scroll', handler, { passive: true });
    onScroll();
    return () => el.removeEventListener('scroll', handler);
  }, [mobile, onScroll]);

  // Arrow keys scrub in both layouts.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      let next = era;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = Math.min(SEG, era + 1);
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = Math.max(0, era - 1);
      else return;
      e.preventDefault();
      if (next === era) return;
      if (mobile) {
        cards.current[next]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        setEra(next);
        if (chips.current.includes(document.activeElement as HTMLButtonElement)) {
          requestAnimationFrame(() => chips.current[next]?.focus());
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [era, mobile, setEra]);

  const E = ERAS[era];
  const acStyle = { ['--ac']: E.nc } as CSSProperties;

  return (
    <div className="jr" style={acStyle}>
      <h2 className="sec-h disp">{JOURNEY_HEADER.title}</h2>
      <div className="sec-sub">{JOURNEY_HEADER.sub}</div>

      {mobile ? (
        <div className="scope scope-v" style={acStyle}>
          <div className="shead">
            <span>SIGNAL LOG</span>
            <span>
              DENSITY <b>{Math.round(E.sig.amp * 100)}%</b> · HARM{' '}
              <b>{Math.round(E.sig.harm)}</b>
            </span>
          </div>
          <div className="mwrap">
            <SignalTrace
              className="spine"
              eras={ERAS}
              era={era}
              vertical
              progress={progress}
            />
            <div className="mscroll" ref={scroller}>
              {ERAS.map((e, i) => (
                <div
                  className="mcard"
                  key={i}
                  ref={(el) => {
                    cards.current[i] = el;
                  }}
                >
                  <EraCard e={e} dim={i !== era} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="scope" style={acStyle}>
            <div className="shead">
              <span>SIGNAL LOG · 2019 → NOW</span>
              <span>
                DENSITY <b>{Math.round(E.sig.amp * 100)}%</b> · HARMONICS{' '}
                <b>{Math.round(E.sig.harm)}</b>
              </span>
            </div>
            <SignalTrace
              className="hscope"
              eras={ERAS}
              era={era}
              vertical={false}
              progress={progress}
              onSelect={setEra}
            />
          </div>

          <div className="jrow">
            {ERAS.map((e, i) => (
              <button
                key={i}
                ref={(el) => {
                  chips.current[i] = el;
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

          <EraCard e={E} />
        </>
      )}

      <div className="footnote">
        {mobile ? JOURNEY_FOOTNOTE.mobile : JOURNEY_FOOTNOTE.desktop}
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {`Era: ${E.org}, ${E.yr}`}
      </div>
    </div>
  );
}

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { NAV } from '@/content/nav';
import { useIsTouch } from '@/hooks/useIsTouch';
import { useReducedMotion } from '@/hooks/useReducedMotion';

/* Live clock in the topbar. Renders empty on the server and fills in after
   mount so there's no hydration mismatch on the timestamp. */
function Clock() {
  const [t, setT] = useState('');
  useEffect(() => {
    const tick = () => setT(new Date().toLocaleTimeString('en-GB'));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return <span suppressHydrationWarning>{t || '--:--:--'}</span>;
}

interface FrameProps {
  active: number;
  onSelect: (i: number) => void;
  onExit: () => void;
  /** the active module fills the stage exactly and scrolls internally
      (JOURNEY always; STACK on mobile) instead of growing the stage */
  fill?: boolean;
  children: React.ReactNode;
}

export default function Frame({ active, onSelect, onExit, fill, children }: FrameProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const desktopTabs = useRef<(HTMLButtonElement | null)[]>([]);
  const isTouch = useIsTouch();
  const reduced = useReducedMotion();

  /* Glitch on nav changes, not on first load. The panel carries key={active},
     so every switch remounts a fresh DOM node and the animation replays from
     0% — no timer or teardown needed; the animation's `both` fill leaves the
     settled state fully visible. This ref just distinguishes the very first
     paint (swap only) from later switches (swap + glitch). */
  const mountedOnce = useRef(false);
  useEffect(() => {
    mountedOnce.current = true;
  }, []);

  /* Each module starts at the top of the stage — a fresh module shouldn't
     inherit the previous one's scroll position. */
  useEffect(() => {
    stageRef.current?.scrollTo({ top: 0 });
  }, [active]);

  /* Mouse parallax — desktop pointers only, rAF-throttled, and skipped
     entirely when the user prefers reduced motion (§5, §6). */
  useEffect(() => {
    const el = rootRef.current;
    if (!el || isTouch || reduced) return;

    let raf = 0;
    let px = 0;
    let py = 0;

    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      px = (e.clientX - r.left) / r.width - 0.5;
      py = (e.clientY - r.top) / r.height - 0.5;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          el.style.setProperty('--px', px.toFixed(3));
          el.style.setProperty('--py', py.toFixed(3));
          raf = 0;
        });
      }
    };

    window.addEventListener('mousemove', onMove);
    return () => {
      window.removeEventListener('mousemove', onMove);
      if (raf) cancelAnimationFrame(raf);
      el.style.setProperty('--px', '0');
      el.style.setProperty('--py', '0');
    };
  }, [isTouch, reduced]);

  /* Roving focus on the desktop tablist: arrows move selection and focus,
     Home/End jump to the ends. Activation follows focus. */
  const onTabKey = useCallback(
    (e: React.KeyboardEvent) => {
      let next = active;
      if (e.key === 'ArrowRight') next = (active + 1) % NAV.length;
      else if (e.key === 'ArrowLeft') next = (active - 1 + NAV.length) % NAV.length;
      else if (e.key === 'Home') next = 0;
      else if (e.key === 'End') next = NAV.length - 1;
      else return;
      e.preventDefault();
      onSelect(next);
      desktopTabs.current[next]?.focus();
    },
    [active, onSelect]
  );

  return (
    <div className="gos" ref={rootRef}>
      {/* corner brackets + vertical serial */}
      <span className="bracket tl" />
      <span className="bracket tr" />
      <span className="bracket bl" />
      <span className="bracket br" />
      <div className="serial">PERSONNEL FILE · 2409-AX · CHATHA</div>

      <div className="frame">
        {/* topbar — collapses to one line on mobile */}
        <header className="topbar">
          <div className="grp">
            <span className="brand">GURI//OS</span>
            <span className="opt">v1.3</span>
          </div>
          <div className="grp">
            <span className="online-state">
              <span className="dot" />
              ONLINE
            </span>
            <span className="opt">GURUGRAM · IN</span>
            <span className="opt">
              <Clock />
            </span>
            <button className="console-exit" type="button" onClick={onExit}>
              <span className="exit-long">EXIT TO BOOT</span>
              <span className="exit-short">BOOT</span>
              {' ↗'}
            </button>
            <a className="resume disp" href="/resume">
              ▸ RÉSUMÉ
            </a>
          </div>
        </header>

        {/* desktop tab row */}
        <nav
          className="nav-desktop"
          role="tablist"
          aria-label="Modules"
          onKeyDown={onTabKey}
        >
          {NAV.map((item, i) => (
            <button
              key={item.id}
              ref={(el) => {
                desktopTabs.current[i] = el;
              }}
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={active === i}
              aria-controls="module-panel"
              tabIndex={active === i ? 0 : -1}
              className="tab"
              onClick={() => onSelect(i)}
            >
              <span className="k">{item.no}</span>
              {item.label}
            </button>
          ))}
        </nav>

        {/* the active module */}
        <main className="stage" ref={stageRef}>
          <div
            id="module-panel"
            role="tabpanel"
            aria-labelledby={`tab-${NAV[active].id}`}
            className={`panel${fill ? ' fill' : ''}${reduced ? '' : ' anim'}${
              mountedOnce.current && !reduced ? ' glitching' : ''
            }`}
            key={active}
          >
            {children}
          </div>
        </main>

        {/* hint bar — keyboard legend only (résumé lives in the topbar).
            Hidden on mobile, where it would otherwise be an empty strip. */}
        <div className="hint">
          <span className="keys">[ 1–5 ] SWITCH MODULE · [ ← → ] SCRUB JOURNEY</span>
        </div>
      </div>

      {/* mobile bottom bar — thumb reach, safe-area aware (§5) */}
      <nav className="nav-mobile" role="tablist" aria-label="Modules">
        {NAV.map((item, i) => (
          <button
            key={item.id}
            role="tab"
            aria-selected={active === i}
            aria-controls="module-panel"
            tabIndex={active === i ? 0 : -1}
            className="mtab"
            onClick={() => onSelect(i)}
          >
            <span className="mk">{item.no}</span>
            <span className="ml">{item.short}</span>
          </button>
        ))}
      </nav>

      {/* FX overlays — order matters for blending */}
      <div className="fx glow" />
      <div className="fx scan" />
      <div className="fx flick" />
      <div className="fx vig" />
    </div>
  );
}

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
  children: React.ReactNode;
}

export default function Frame({ active, onSelect, children }: FrameProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const desktopTabs = useRef<(HTMLButtonElement | null)[]>([]);
  const isTouch = useIsTouch();
  const reduced = useReducedMotion();

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
      <div className="serial">PERSONNEL FILE · 0117-AX · CHATHA</div>

      <div className="frame">
        {/* topbar — collapses to one line on mobile */}
        <header className="topbar">
          <div className="grp">
            <span className="brand">GURI//OS</span>
            <span className="opt">v1.3</span>
          </div>
          <div className="grp">
            <span>
              <span className="dot" />
              ONLINE
            </span>
            <span className="opt">GURUGRAM · IN</span>
            <Clock />
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
        <main className="stage">
          <div
            id="module-panel"
            role="tabpanel"
            aria-labelledby={`tab-${NAV[active].id}`}
            className={`panel${reduced ? '' : ' anim'}`}
            key={active}
          >
            {children}
          </div>
        </main>

        {/* hint bar */}
        <div className="hint">
          <span className="keys">[ 1–5 ] SWITCH MODULE · [ ← → ] SCRUB JOURNEY</span>
          <a className="sk" href="/resume">
            skip → plain résumé ▸
          </a>
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

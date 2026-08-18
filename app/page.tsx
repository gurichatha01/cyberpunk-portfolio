'use client';

import { useCallback, useEffect, useState } from 'react';
import Boot from '@/components/Boot';
import Frame from '@/components/Frame';
import Builds from '@/components/modules/Builds';
import Journey from '@/components/modules/Journey';
import Profile from '@/components/modules/Profile';
import { NAV } from '@/content/nav';
import { ERAS } from '@/content/journey';

/* Placeholders for the modules not built yet (steps 3–5). PROFILE (index 0)
   is now real; the rest stay stand-ins so both navs remain fully wired.
   --ac recolours the panel accent per §3. */
const PLACEHOLDER: Record<number, { tag: string; note: string; ac: string }> = {
  3: {
    tag: 'ANALYSIS × SHIPPING',
    note: 'Grouped skill tags — DATA / SHIP KIT / EARLIER — plus education and certs. — coming in step 5.',
    ac: 'var(--green)',
  },
  4: {
    tag: 'OPEN A CHANNEL',
    note: 'Contact rows — real links only. — coming in step 5.',
    ac: 'var(--cyan)',
  },
};

export default function Page() {
  const [active, setActive] = useState(0);
  const [booted, setBooted] = useState(false);
  // era lives here so the selection persists across module switches
  const [era, setEra] = useState(ERAS.length - 1);

  const select = useCallback((i: number) => {
    setActive((cur) => (cur === i ? cur : i));
  }, []);

  /* Global 1–5 shortcut to switch modules (hint bar advertises it). */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // ignore when typing in a field
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key >= '1' && e.key <= String(NAV.length)) {
        select(Number(e.key) - 1);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [select]);

  const item = NAV[active];
  const ph = PLACEHOLDER[active];

  return (
    <>
      {!booted && <Boot onDone={() => setBooted(true)} />}
      <Frame active={active} onSelect={select} fill={active === 2}>
        {active === 0 ? (
          <Profile revealed={booted} onGo={select} />
        ) : active === 1 ? (
          <Builds />
        ) : active === 2 ? (
          <Journey era={era} setEra={setEra} />
        ) : (
          ph && (
            <section className="ph" style={{ ['--ac' as string]: ph.ac }}>
              <div className="ph-no">
                MODULE {item.no} // {item.label}
              </div>
              <div className="ph-h disp">{item.label}</div>
              <div className="ph-tag">{ph.tag}</div>
              <p className="ph-note">{ph.note}</p>
            </section>
          )
        )}
      </Frame>
    </>
  );
}

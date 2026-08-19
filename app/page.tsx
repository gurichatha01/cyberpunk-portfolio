'use client';

import { useCallback, useEffect, useState } from 'react';
import Boot from '@/components/Boot';
import Frame from '@/components/Frame';
import Builds from '@/components/modules/Builds';
import Journey from '@/components/modules/Journey';
import Profile from '@/components/modules/Profile';
import Stack from '@/components/modules/Stack';
import Transmit from '@/components/modules/Transmit';
import { NAV } from '@/content/nav';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ERAS } from '@/content/journey';

export default function Page() {
  const [active, setActive] = useState(0);
  const [booted, setBooted] = useState(false);
  // era lives here so the selection persists across module switches
  const [era, setEra] = useState(ERAS.length - 1);
  const compact = useMediaQuery('(max-width: 860px)');

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

  return (
    <>
      {!booted && <Boot onDone={() => setBooted(true)} />}
      <Frame active={active} onSelect={select} fill={active === 2 || active === 4 || (active === 3 && compact)}>
        {active === 0 ? (
          <Profile revealed={booted} onGo={select} />
        ) : active === 1 ? (
          <Builds />
        ) : active === 2 ? (
          <Journey era={era} setEra={setEra} />
        ) : active === 3 ? (
          <Stack />
        ) : (
          <Transmit />
        )}
      </Frame>
    </>
  );
}

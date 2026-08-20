'use client';

import { useCallback, useEffect, useState } from 'react';
import Boot, { ExperienceMode } from '@/components/Boot';
import Frame from '@/components/Frame';
import Builds from '@/components/modules/Builds';
import Journey from '@/components/modules/Journey';
import Profile from '@/components/modules/Profile';
import Stack from '@/components/modules/Stack';
import Transmit from '@/components/modules/Transmit';
import SignalRun from '@/components/scroll/SignalRun';
import { NAV } from '@/content/nav';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { ERAS } from '@/content/journey';

export default function Page() {
  const [active, setActive] = useState(0);
  const [experience, setExperience] = useState<ExperienceMode | null>(null);
  // era lives here so the selection persists across module switches
  const [era, setEra] = useState(ERAS.length - 1);
  const compact = useMediaQuery('(max-width: 860px)');

  const select = useCallback((i: number) => {
    setActive((cur) => (cur === i ? cur : i));
  }, []);

  /* Global 1–5 shortcut to switch modules (hint bar advertises it). */
  useEffect(() => {
    if (experience !== 'console') return;
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
  }, [experience, select]);

  const chooseExperience = useCallback((mode: ExperienceMode) => {
    window.scrollTo({ top: 0 });
    setExperience(mode);
  }, []);

  const exitExperience = useCallback(() => {
    window.scrollTo({ top: 0 });
    setExperience(null);
  }, []);

  if (!experience) {
    return <Boot onSelect={chooseExperience} />;
  }

  if (experience === 'signal') {
    return <SignalRun onExit={exitExperience} />;
  }

  return (
    <Frame
      active={active}
      onSelect={select}
      onExit={exitExperience}
      fill={active === 2 || active === 4 || (active === 3 && compact)}
    >
      {active === 0 ? (
        <Profile revealed onGo={select} />
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
  );
}

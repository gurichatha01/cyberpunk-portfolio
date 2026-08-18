'use client';

import { useCallback, useEffect, useState } from 'react';
import Frame from '@/components/Frame';
import { NAV } from '@/content/nav';

/* Step-1 placeholders. Each module is a stand-in until its real component
   lands (steps 2–5). They exist so both navs are demonstrably wired and the
   swap between modules can be felt. --ac recolours the panel accent per §3. */
const PLACEHOLDER: {
  tag: string;
  note: string;
  ac: string;
}[] = [
  {
    tag: 'THE OPERATOR',
    note: 'Giant GURI wordmark, decode-scramble, bio + spec chips + CTAs. — coming in step 2.',
    ac: 'var(--cyan)',
  },
  {
    tag: 'TAPE DECK',
    note: 'Insert a cassette, the deck seats it, reels spin, the readout decodes in. — coming in step 3.',
    ac: 'var(--magenta)',
  },
  {
    tag: 'SIGNAL TRACE',
    note: 'Career as an oscilloscope reading; amplitude grows 2019 → now. — coming in step 4.',
    ac: 'var(--cyan)',
  },
  {
    tag: 'ANALYSIS × SHIPPING',
    note: 'Grouped skill tags — DATA / SHIP KIT / EARLIER — plus education and certs. — coming in step 5.',
    ac: 'var(--green)',
  },
  {
    tag: 'OPEN A CHANNEL',
    note: 'Contact rows — real links only. — coming in step 5.',
    ac: 'var(--cyan)',
  },
];

export default function Page() {
  const [active, setActive] = useState(0);

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
    <Frame active={active} onSelect={select}>
      <section className="ph" style={{ ['--ac' as string]: ph.ac }}>
        <div className="ph-no">
          MODULE {item.no} // {item.label}
        </div>
        <div className="ph-h disp">{item.label}</div>
        <div className="ph-tag">{ph.tag}</div>
        <p className="ph-note">{ph.note}</p>
      </section>
    </Frame>
  );
}

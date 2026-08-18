'use client';

import { useEffect, useState } from 'react';

/* True when the user asked the OS to reduce motion. We gate the parallax,
   flicker and (later) boot / reels / trace-draw on this (§6). SSR-safe:
   starts false, corrects on mount. */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return reduced;
}

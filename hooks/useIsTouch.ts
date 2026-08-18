'use client';

import { useEffect, useState } from 'react';

/* True on devices with no fine hover pointer (phones, most tablets). Used to
   kill the mouse-parallax translate and the heavier FX on touch (§5). SSR-safe:
   starts false so the server/client first paint agree, corrects on mount. */
export function useIsTouch(): boolean {
  const [touch, setTouch] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(hover: none)');
    const update = () => setTouch(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  return touch;
}

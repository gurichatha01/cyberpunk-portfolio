'use client';

import { useMediaQuery } from './useMediaQuery';

/* True on devices with no fine hover pointer. Used to kill the mouse-parallax
   translate and the heavier FX on touch (§5). */
export function useIsTouch(): boolean {
  return useMediaQuery('(hover: none)');
}

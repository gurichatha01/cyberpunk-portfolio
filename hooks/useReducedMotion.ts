'use client';

import { useMediaQuery } from './useMediaQuery';

/* True when the user asked the OS to reduce motion. Gates the parallax, boot,
   glitch, reels and the live waveform (§6). */
export function useReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

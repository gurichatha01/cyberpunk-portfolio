'use client';

import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useScramble } from '@/hooks/useScramble';

interface ScrambleProps {
  text: string;
  /** start decoding when this flips true (e.g. after boot) */
  run: boolean;
  className?: string;
  speed?: number;
}

/* Renders the scrambling glyphs for sighted users but exposes the clean text
   to assistive tech (§7): the animated part is aria-hidden, and a visually
   hidden copy carries the real string. */
export function Scramble({ text, run, className, speed }: ScrambleProps) {
  const reduced = useReducedMotion();
  const out = useScramble(text, run && !reduced, speed);

  return (
    <span className={className}>
      <span aria-hidden="true">{out}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

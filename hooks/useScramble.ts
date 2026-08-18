'use client';

import { useEffect, useState } from 'react';

const GLYPHS = 'ABCDEFGHJKLMNPRSTUVWXYZ0123456789/#*<>[]';

/* Decode-scramble: characters resolve left-to-right from random glyphs into
   the target string. Length never changes, so it can't cause layout shift.
   When `run` is false it just returns the target (used for reduced motion and
   the pre-reveal state). */
export function useScramble(target: string, run: boolean, speed = 55): string {
  const [out, setOut] = useState(target);

  useEffect(() => {
    if (!run) {
      setOut(target);
      return;
    }
    let frame = 0;
    const id = window.setInterval(() => {
      frame++;
      const revealed = Math.floor(frame / 2);
      let s = '';
      for (let i = 0; i < target.length; i++) {
        s += i < revealed ? target[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setOut(s);
      if (revealed >= target.length) window.clearInterval(id);
    }, speed);
    return () => window.clearInterval(id);
  }, [target, run, speed]);

  return out;
}

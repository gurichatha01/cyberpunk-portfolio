/* Boot-sequence copy. Kept in content/* like everything else (§2) so the
   sequence reads as data, not markup. `delay` is the per-line fade-in offset
   in seconds; the overlay finishes shortly after the last line lands. */

export interface BootLine {
  text: string;
  /** fade-in delay in seconds */
  delay: number;
}

export const BOOT_TITLE = 'GURI//OS';

export const BOOT_LINES: BootLine[] = [
  { text: 'BOOT ROM v1.3 — CHATHA SYSTEMS', delay: 0.5 },
  { text: 'DETECTING OPERATOR . . . . . . OK', delay: 0.9 },
  { text: 'LOADING PERSONNEL FILE [0117-GS]', delay: 1.3 },
  { text: '> DECRYPTING_', delay: 1.7 },
];

/** Total time the overlay stays up before auto-dismiss (ms). */
export const BOOT_DURATION = 2100;

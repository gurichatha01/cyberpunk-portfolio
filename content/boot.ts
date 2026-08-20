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
  { text: 'LOADING PERSONNEL FILE [2409-GCSS]', delay: 1.3 },
  { text: '> DECRYPTING_', delay: 1.7 },
];

/** Total time the overlay stays up before auto-dismiss (ms). */
export const BOOT_DURATION = 2100;

export interface BootMode {
  id: 'console' | 'signal';
  no: string;
  title: string;
  version: string;
  description: string;
  command: string;
  accent: 'yellow' | 'cyan';
}

export const BOOT_MODES: BootMode[] = [
  {
    id: 'console',
    no: '01',
    title: 'CONSOLE OS',
    version: 'ORIGINAL · v1.3',
    description: 'The tabbed operator console. Direct access to every system module.',
    command: 'ENTER CONSOLE',
    accent: 'yellow',
  },
  {
    id: 'signal',
    no: '02',
    title: 'SIGNAL RUN',
    version: 'EXPERIMENTAL · v2.0',
    description: 'A continuous descent through the person, the work, and the signal.',
    command: 'BEGIN DESCENT',
    accent: 'cyan',
  },
];

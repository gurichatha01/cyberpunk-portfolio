/* BUILDS (module 02) — the cassettes. Copy verbatim from the brief/prototype
   (§9). `ac` is the accent CSS value that recolours the deck + readout when the
   tape is loaded. `cells` are the readout key/value pairs. */

export interface Tape {
  id: string;
  name: string;
  /** small label under the name on the cassette sticker */
  side: string;
  /** accent colour, e.g. 'var(--magenta)' */
  ac: string;
  /** readout module line */
  mod: string;
  tag: string;
  copy: string;
  cells: [string, string][];
  stack: string[];
  href: string;
  /** visible link text */
  label: string;
}

export const TAPES: Tape[] = [
  {
    id: 'auxd',
    name: 'AUXD',
    side: 'MOD-01 · SIDE A',
    ac: 'var(--magenta)',
    mod: 'MOD-01 · ALBUM DECK',
    tag: 'LETTERBOXD, BUT FOR MUSIC',
    copy: "An album-first social platform. Rate out of 5 ★, with a 6th star for the ones that really matter. Write short reviews called Takes and build a profile around your taste. Discovery runs through people, not an algorithm. It doesn't replace Spotify or Apple Music: you listen wherever you already listen. Aux'd is where your listening lives.",
    cells: [
      ['STATUS', 'LIVE'],
      ['TYPE', 'SOCIAL / MUSIC'],
      ['ROLE', 'SOLO · END-TO-END'],
    ],
    stack: ['Next.js', 'TypeScript', 'Supabase', 'PostgreSQL', 'MusicBrainz'],
    href: 'https://theauxd.vercel.app',
    label: 'theauxd.vercel.app',
  },
  {
    id: 'lores',
    name: 'LORES',
    side: 'MOD-02 · SIDE B',
    ac: 'var(--green)',
    mod: 'MOD-02 · SIGNAL ANALYZER',
    tag: 'WHATSAPP CHAT → PDF REPORT',
    copy: 'Upload a chat export, get a designed PDF report back. Choose from six modes: Sweetheart, Ride or Die, Group Wrapped, Family, Work or Roast. Parsing runs on your own device, so the chat itself never leaves your phone.',
    cells: [
      ['STATUS', 'LIVE · PAID'],
      ['TYPE', 'AI / ANALYSIS'],
      ['ROLE', 'SOLO · END-TO-END'],
    ],
    stack: ['React', 'Gemini', 'Supabase', 'Razorpay'],
    href: 'https://lores.in',
    label: 'lores.in',
  },
];

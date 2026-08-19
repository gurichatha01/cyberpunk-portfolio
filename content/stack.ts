/* STACK (module 04) — the stack as a circuit board.
   Every skill is an IC chip, coloured by the ERA it was installed in. The era
   palette is deliberately identical to JOURNEY's so the two modules read as
   one system. Chip notes are first-person, one line each (§4). */

export interface StackEra {
  /** raw hex — SVG/canvas need a real colour, not a var() */
  c: string;
  label: string;
}

export interface Chip {
  id: string;
  name: string;
  era: EraKey;
  /** ids of chips this one is wired to */
  links: string[];
  note: string;
}

export interface Bank {
  id: string;
  cap: string;
  chips: Chip[];
}

export type EraKey = 'thapar' | 'mylo' | 'criteo' | 'shipping';

/* same four accents as JOURNEY */
export const ERA: Record<EraKey, StackEra> = {
  thapar: { c: '#00e5ff', label: 'THAPAR · 2019' },
  mylo: { c: '#22f5a8', label: 'MYLO · 2023' },
  criteo: { c: '#fcee0a', label: 'CRITEO · 2024' },
  shipping: { c: '#ff2e6e', label: 'SHIPPING · 2026' },
};

export const BANKS: Bank[] = [
  {
    id: 'data',
    cap: 'BANK A · DATA CORE',
    chips: [
      {
        id: 'sql',
        name: 'SQL',
        era: 'mylo',
        links: ['bigquery', 'hive', 'tableau', 'powerbi', 'postgres'],
        note: 'Where almost every answer starts. Window functions and CTEs do more of the work than people expect.',
      },
      {
        id: 'python',
        name: 'Python',
        era: 'thapar',
        links: ['bigquery', 'c', 'gemini'],
        note: "Picked up in an engineering degree, kept for automation and anything SQL can't reach.",
      },
      {
        id: 'bigquery',
        name: 'BigQuery',
        era: 'mylo',
        links: ['sql', 'python'],
        note: 'The warehouse at Mylo and the habit that carried into Criteo. Partitioning is a cost decision, not a technical one.',
      },
      {
        id: 'hive',
        name: 'Hive',
        era: 'criteo',
        links: ['sql'],
        note: 'Adtech data at Criteo scale. Slower to query, so you learn to ask the right question the first time.',
      },
      {
        id: 'tableau',
        name: 'Tableau',
        era: 'criteo',
        links: ['sql'],
        note: 'Client-facing dashboards. The hard part is deciding what to leave out.',
      },
      {
        id: 'powerbi',
        name: 'Power BI',
        era: 'criteo',
        links: ['sql'],
        note: 'Internal reporting. Same discipline as Tableau, different politics.',
      },
      {
        id: 'excel',
        name: 'Excel Modelling',
        era: 'mylo',
        links: [],
        note: 'Unglamorous and undefeated. Logistics cost models and P&L work at Mylo lived here.',
      },
    ],
  },
  {
    id: 'ship',
    cap: 'BANK B · SHIP KIT',
    chips: [
      {
        id: 'nextjs',
        name: 'Next.js',
        era: 'shipping',
        links: ['typescript', 'react', 'vercel', 'supabase', 'razorpay', 'gemini'],
        note: 'Both products run on it. App Router, static where possible, server only where it earns its keep.',
      },
      {
        id: 'typescript',
        name: 'TypeScript',
        era: 'shipping',
        links: ['nextjs', 'react'],
        note: 'Non-negotiable once a side project outlives the weekend you built it in.',
      },
      {
        id: 'react',
        name: 'React',
        era: 'shipping',
        links: ['nextjs', 'typescript'],
        note: 'Component discipline. Most of my bugs are state bugs, so state lives in as few places as possible.',
      },
      {
        id: 'supabase',
        name: 'Supabase',
        era: 'shipping',
        links: ['postgres', 'nextjs'],
        note: 'Auth, database and storage without standing up a backend. Row-level security is the feature.',
      },
      {
        id: 'postgres',
        name: 'PostgreSQL',
        era: 'shipping',
        links: ['supabase', 'sql'],
        note: 'The bridge. Same SQL I write at work, now behind my own products.',
      },
      {
        id: 'razorpay',
        name: 'Razorpay',
        era: 'shipping',
        links: ['nextjs'],
        note: 'INR payments and UPI for Lores. Getting domestic activation through is its own skill.',
      },
      {
        id: 'gemini',
        name: 'Gemini',
        era: 'shipping',
        links: ['nextjs', 'python'],
        note: 'The analysis engine behind Lores. Prompt design turned out to be product design.',
      },
      {
        id: 'vercel',
        name: 'Vercel',
        era: 'shipping',
        links: ['nextjs'],
        note: 'Deploy target for both products. Preview URLs are how I make decisions.',
      },
    ],
  },
  {
    id: 'legacy',
    cap: 'BANK C · LEGACY / HARDWARE',
    chips: [
      {
        id: 'flutter',
        name: 'Flutter',
        era: 'thapar',
        links: ['photogrammetry'],
        note: 'The Android app for the photogrammetry scanner. First time I shipped something someone else used.',
      },
      {
        id: 'solidworks',
        name: 'SolidWorks',
        era: 'thapar',
        links: ['photogrammetry'],
        note: 'Modelled the 3D-printed scanner rig. Tolerances teach you that shipping is physical.',
      },
      {
        id: 'c',
        name: 'C',
        era: 'thapar',
        links: ['python'],
        note: 'Embedded work during the degree. Still the reason I think about what things cost to run.',
      },
      {
        id: 'photogrammetry',
        name: 'Photogrammetry',
        era: 'thapar',
        links: ['flutter', 'solidworks'],
        note: "Photos in, 3D model out. The same shape as everything I've built since: messy input, readable output.",
      },
    ],
  },
];

/** flat list, each chip tagged with its bank caption */
export const ALL: (Chip & { bank: string })[] = BANKS.flatMap((b) =>
  b.chips.map((c) => ({ ...c, bank: b.cap }))
);

export const byId = (id: string) => ALL.find((c) => c.id === id);

export const STACK_HEADER = {
  title: 'STACK',
  sub: 'TAP A CHIP TO TRACE IT',
};

export const STACK_IDLE = {
  big: 'NO MODULE SELECTED',
  sub: 'TAP A CHIP TO TRACE ITS CONNECTIONS',
};

/* Education and certification (§9). The board doesn't model these as chips —
   they aren't tools — so they sit under it as plain credentials. */
export const CREDENTIALS = [
  {
    k: 'EDU',
    v: 'Thapar Institute — B.Tech, Electronic & Computer Engineering (2019–2023)',
  },
  { k: 'CERT', v: 'Google — Foundations: Data, Data, Everywhere' },
];

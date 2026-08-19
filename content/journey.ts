/* JOURNEY (module 03) — real career history (§9), wording from the prototype.
   Body is modelled as styled runs so emphasis lives in content. `nc` is the
   era's accent. Ongoing roles carry `since` ('YYYY-MM') and their duration is
   computed at render so it never drifts; fixed roles use the literal `dur`. */

export interface EraRun {
  t: string;
  b?: boolean;
}

/* Signal character of an era. These drive the waveform: the trace gets faster,
   richer and louder as the career progresses, and the values interpolate
   between adjacent eras so the line reads as one continuous signal. */
export interface Signal {
  /** base frequency */
  freq: number;
  /** how many harmonics ride on top (1–4) */
  harm: number;
  /** amplitude, 0–1 */
  amp: number;
  /** high-frequency jitter */
  jit: number;
}

export interface Era {
  /** short year shown on the trace node */
  yr: string;
  /** full date range */
  when: string;
  org: string;
  role: string;
  /** literal duration for finished roles */
  dur?: string;
  /** start 'YYYY-MM' for ongoing roles — duration is computed from this */
  since?: string;
  /** accent colour, e.g. 'var(--cyan)' */
  nc: string;
  /** raw hex of `nc` — the canvas/SVG needs a real colour, not a var() */
  hex: string;
  /** waveform character for this era */
  sig: Signal;
  body: EraRun[];
  /** skills gained — the "augments installed" chips */
  augs: string[];
}

/** Module header. Kept short — "SIGNAL LOG" already labels the scope itself,
    and a longer line wraps to two rows on a phone. */
export const JOURNEY_HEADER = {
  title: 'JOURNEY',
  sub: 'HARDWARE → DATA → PRODUCT',
};

/** Footnote under the trace — the one-line reading of the whole signal. */
export const JOURNEY_FOOTNOTE = {
  desktop: 'ONE THING AT A TIME IN 2019 · FOUR AT ONCE NOW',
  mobile: 'SCROLL TO ADVANCE · THE SIGNAL FILLS AS YOU GO',
};

export const ERAS: Era[] = [
  {
    yr: '2019',
    when: '2019 — 2023',
    org: 'THAPAR',
    role: 'B.TECH · ELECTRONIC & COMPUTER ENGINEERING',
    dur: '4 YRS',
    nc: 'var(--cyan)',
    hex: '#00e5ff',
    sig: { freq: 0.03, harm: 1, amp: 0.2, jit: 0.015 },
    body: [
      { t: 'Started in ' },
      { t: 'hardware', b: true },
      { t: ', not software. Built a ' },
      { t: '3D-printed photogrammetry scanner', b: true },
      {
        t: ' — SolidWorks for the rig, a Flutter Android app that turned a set of photos into a 3D model. Ran hospitality for the Thapar Adventure Club for three years, which is where the organising-people part came from.',
      },
    ],
    augs: ['Python', 'C', 'SolidWorks', 'Flutter', 'Signals & Systems', 'Team Lead'],
  },
  {
    yr: '2023',
    when: 'JAN 2023 — AUG 2023',
    org: 'MYLO',
    role: 'PRODUCT ANALYST · INTERN',
    dur: '8 MOS',
    nc: 'var(--green)',
    hex: '#22f5a8',
    sig: { freq: 0.052, harm: 2, amp: 0.38, jit: 0.035 },
    body: [
      { t: "First contact with real product data, at India's #1 parenting platform — " },
      { t: '10M+ users', b: true },
      {
        t: '. Learned that the interesting question is rarely the one you were handed, and that a number with no decision attached is just trivia.',
      },
    ],
    augs: ['SQL', 'Product Metrics', 'Cohorts', 'Dashboards'],
  },
  {
    yr: '2023',
    when: 'SEP 2023 — OCT 2024',
    org: 'MYLO',
    role: 'DATA ANALYST · FULL-TIME',
    dur: '1 YR 2 MOS',
    nc: 'var(--green)',
    hex: '#22f5a8',
    sig: { freq: 0.078, harm: 2, amp: 0.58, jit: 0.06 },
    body: [
      { t: 'Owned analytics across ' },
      { t: 'supply chain and D2C logistics', b: true },
      { t: '. Built P&L dashboards, modelled logistics cost, and ran a data audit that ' },
      { t: 'recovered credit notes', b: true },
      {
        t: ' nobody had noticed were owed. First time analysis turned directly into money.',
      },
    ],
    augs: ['BigQuery', 'Python', 'Cost Modelling', 'P&L', 'Data Audit'],
  },
  {
    yr: '2024',
    when: 'OCT 2024 — PRESENT',
    org: 'CRITEO',
    role: 'DATA ANALYST · GCOC (APAC → AMS)',
    since: '2024-10',
    nc: 'var(--yellow)',
    hex: '#fcee0a',
    sig: { freq: 0.105, harm: 3, amp: 0.78, jit: 0.1 },
    body: [
      { t: 'Joined for ' },
      { t: 'APAC', b: true },
      { t: ', now in the Global Client Operations Center for ' },
      { t: 'AMS', b: true },
      {
        t: ". Adtech data at scale — performance metrics, query review, executive summaries — plus onboarding and training new analysts. Learned to make numbers legible to people who don't want numbers.",
      },
    ],
    augs: ['Hive', 'Tableau', 'Power BI', 'Adtech', 'Query Review', 'Stakeholder Comms'],
  },
  {
    yr: '2026',
    when: '2026 — PRESENT',
    org: 'FREELANCE',
    role: 'INDIE PRODUCT BUILDER',
    dur: 'ONGOING',
    nc: 'var(--magenta)',
    hex: '#ff2e6e',
    sig: { freq: 0.14, harm: 4, amp: 1, jit: 0.16 },
    body: [
      { t: 'Stopped leaving things in a GitHub repo. Shipped ' },
      { t: "Aux'd", b: true },
      { t: ' and ' },
      { t: 'Lores', b: true },
      {
        t: ' end to end — idea, UX, database, auth, catalogue, payments, deploy. The hard part was never the code; it was deciding what belongs in v1. Same instinct as the 2020 scanner, six years of tooling later.',
      },
    ],
    augs: ['Next.js', 'TypeScript', 'Supabase', 'Razorpay', 'Gemini', 'FREELANCE'],
  },
];

/** "X YRS Y MOS" from a 'YYYY-MM' start to now. Keeps ongoing roles current. */
export function formatDuration(since: string): string {
  const [y, m] = since.split('-').map(Number);
  const now = new Date();
  let months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
  if (months < 0) months = 0;
  const yrs = Math.floor(months / 12);
  const mos = months % 12;
  const yPart = yrs > 0 ? `${yrs} YR${yrs > 1 ? 'S' : ''}` : '';
  const mPart = mos > 0 ? `${mos} MO${mos > 1 ? 'S' : ''}` : '';
  return [yPart, mPart].filter(Boolean).join(' ') || '0 MOS';
}

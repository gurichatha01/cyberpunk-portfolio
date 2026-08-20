/* PROFILE (module 01) copy — verbatim from the brief (§9). Bio is modelled as
   styled runs so the bold emphasis lives in content, not in the component. */

export interface BioRun {
  t: string;
  /** render emphasised (brighter) */
  b?: boolean;
}

export interface Chip {
  k: string;
  v: string;
}

export interface Cta {
  label: string;
  /** module index this CTA jumps to */
  to: number;
  /** primary (filled-on-hover yellow) vs ghost */
  primary?: boolean;
}

export interface Profile {
  eyebrow: string;
  /** the wordmark that decode-scrambles on reveal */
  name: string;
  fullName: string;
  role: { a: string; b: string };
  bio: BioRun[];
  chips: Chip[];
  ctas: Cta[];
}

export const PROFILE: Profile = {
  eyebrow: 'PERSONNEL FILE // 2409-GC',
  name: 'GURI',
  fullName: 'GURMEHERDEEP SINGH CHATHA',
  role: { a: 'DATA ANALYST', b: 'PRODUCT BUILDER' },
  bio: [
    {
      t: 'Electronics engineer by training, analyst by trade, builder by choice.',
      b: true,
    },
    {
      t: " Data Analyst at Criteo's Global Client Operations Center for AMS, working with SQL, Python and BigQuery at scale. Shipping my own consumer products on the side. I take invisible things like your listening and your chats, then turn them into something you can read.",
    },
  ],
  chips: [
    { k: 'ROLE', v: 'DATA ANALYST @ CRITEO' },
    { k: 'UNIT', v: 'GCOC · AMS' },
    { k: 'BASE', v: 'GURUGRAM, IN' },
    { k: 'STATUS', v: 'SHIPPING INNOVATIONS' },
  ],
  ctas: [
    { label: '▸ LOAD A TAPE', to: 1, primary: true },
    { label: '▸ TRACE THE SIGNAL', to: 2 },
  ],
};

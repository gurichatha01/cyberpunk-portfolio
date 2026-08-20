/* Résumé content (§7) — the professional, bullet-point version, taken verbatim
   from the operator's actual résumé. Kept separate from the JOURNEY narrative
   (which is first-person story) so /resume can read like a real CV. */

export const RESUME_SUMMARY =
  'Data Analyst skilled in SQL, Python, BigQuery, Hive, Power BI and Tableau. Resolves complex data requests and automates reporting workflows, with 250+ tickets handled, manual effort reduced and credit notes recovered through data-driven audits. Excels at root-cause analysis, campaign and delivery troubleshooting, P&L and decision-making dashboards, and API integrations.';

export interface ResumeRole {
  org: string;
  title: string;
  location: string;
  dates: string;
  bullets: string[];
}

export const RESUME_ROLES: ResumeRole[] = [
  {
    org: 'Criteo',
    title: 'Data Analyst, AMS / APAC, Global Client Operations Center',
    location: 'Gurgaon, India',
    dates: 'Oct 2024 to Present',
    bullets: [
      'Translate business and commercial requests into scalable data problems and solutions using SQL, Python, Hive and Excel, supporting global analytics teams.',
      'Resolved 250+ tickets across data pulls, ad-hoc reporting, campaign performance, delivery troubleshooting, margin analysis and audience creation while consistently meeting SLAs.',
      'Performed root-cause analysis on KPI drops, pacing issues, under/over-delivery and reporting discrepancies using event-level and historical data.',
      'Supported analytics for APAC and AMER markets, adapting insights to diverse campaign structures and regional requirements.',
      'Owned reports and analytical tools in Python, Tableau and internal platforms; automated recurring workflows to cut turnaround and manual effort.',
      'Built a one-stop onboarding resource for new joiners and provide QA and query reviews for junior analysts.',
      'Distil complex analyses into concise executive summaries that drive alignment and decisive follow-up.',
    ],
  },
  {
    org: 'Mylo',
    title: 'Data Analyst',
    location: 'Gurgaon, India',
    dates: 'Jan 2023 to Oct 2024',
    bullets: [
      'Owned analytics across supply chain, operations and finance using SQL, Python, Power BI and BigQuery.',
      'Developed and maintained a P&L dashboard monitoring key financial and operational metrics.',
      "Replicated Delhivery's B2C logistics cost logic, achieving <5% deviation between calculated and actual delivery costs.",
      'Identified discrepancies and secured ₹20 to ₹25 lakh in credit notes within four months.',
      'Built decision-making dashboards integrating Dynamic Reorder Rate (DRR) and real-time shipment tracking to reduce stockouts.',
      'Designed and monitored A/B tests, implemented demand forecasting with linear regression, and integrated Google Ads APIs for automated analytics.',
    ],
  },
];

export interface SkillGroup {
  label: string;
  items: string[];
}

export const RESUME_SKILLS: SkillGroup[] = [
  { label: 'Languages & Analytics', items: ['Python', 'SQL', 'PL/SQL', 'Pandas', 'NumPy'] },
  { label: 'Databases & Cloud', items: ['BigQuery', 'Google Cloud', 'MySQL', 'MongoDB', 'Hive'] },
  {
    label: 'Data & Visualisation',
    items: ['Power BI', 'Tableau', 'Data Analysis', 'Data Visualisation'],
  },
  {
    label: 'Product / Ship Kit',
    items: ['Next.js', 'TypeScript', 'React', 'Supabase', 'PostgreSQL', 'Razorpay', 'Gemini', 'Vercel'],
  },
  { label: 'Tools', items: ['Excel', 'Git / Gerrit', 'APIs'] },
];

export const RESUME_EDU = {
  degree: 'B.Tech, Electronic & Computer Engineering',
  school: 'Thapar Institute of Engineering & Technology, Patiala',
  dates: 'Aug 2019 to Jul 2023',
  extra:
    'Hospitality Head, Thapar Adventure Club (Core Team). Electives incl. Deep Learning for Computer Vision, Blockchain, AR/VR.',
};

export const RESUME_CERT = 'Google: Foundations: Data, Data, Everywhere';

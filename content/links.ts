/* Contact channels (§9). Real links only. Email and phone are the operator's
   own, from the résumé; GitHub stays a clearly-marked placeholder until given.
   Used by both the TRANSMIT module and the /resume contact section. */

export interface Channel {
  id: string;
  label: string;
  /** displayed value */
  value: string;
  href: string;
  /** short status line shown on the right */
  status: string;
  /** accent CSS value */
  accent: string;
  /** icon id resolved in the component */
  icon: 'mail' | 'phone' | 'link' | 'git' | 'disc' | 'sig';
  /** true = not a real destination yet; render as a marked placeholder */
  todo?: boolean;
}

export const CHANNELS: Channel[] = [
  {
    id: 'email',
    label: 'EMAIL',
    value: 'chathags@outlook.com',
    href: 'mailto:chathags@outlook.com',
    status: 'PRIMARY · OPEN',
    accent: 'var(--yellow)',
    icon: 'mail',
  },
  {
    id: 'phone',
    label: 'PHONE',
    value: '+91 98888 16669',
    href: 'tel:+919888816669',
    status: 'VOICE · OPEN',
    accent: 'var(--green)',
    icon: 'phone',
  },
  {
    id: 'linkedin',
    label: 'LINKEDIN',
    value: '/in/gurmeherdeepchatha2001',
    href: 'https://www.linkedin.com/in/gurmeherdeepchatha2001/',
    status: 'CHANNEL OPEN',
    accent: 'var(--cyan)',
    icon: 'link',
  },
  {
    id: 'github',
    label: 'GITHUB',
    value: 'github.com/gurichatha01',
    href: 'https://github.com/gurichatha01',
    status: 'CHANNEL OPEN',
    accent: 'var(--mute)',
    icon: 'git',
  },
  {
    id: 'auxd',
    label: 'AUXD',
    value: 'theauxd.vercel.app',
    href: 'https://theauxd.vercel.app',
    status: '● LIVE PRODUCT',
    accent: 'var(--magenta)',
    icon: 'disc',
  },
  {
    id: 'lores',
    label: 'LORES',
    value: 'lores.in',
    href: 'https://lores.in',
    status: '● LIVE PRODUCT',
    accent: 'var(--green)',
    icon: 'sig',
  },
];

export const LOCATION = 'Gurugram, India';

export const TRANSMIT_HEADER = { title: 'TRANSMIT', sub: 'OPEN CHANNELS' };

export const SIGNOFF = {
  prompt: 'guri@gcoc',
  whoami: 'gurmeherdeep singh chatha — analyst who ships',
  status: 'open to good problems, better teams, and anything worth building',
};

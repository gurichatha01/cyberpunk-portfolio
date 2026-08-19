'use client';

import type { CSSProperties, ReactNode } from 'react';
import { CHANNELS, SIGNOFF, TRANSMIT_HEADER } from '@/content/links';

/* Inline SVG icons — a handful, per §10. Keyed by the channel's `icon` id. */
const ICONS: Record<string, ReactNode> = {
  mail: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="1" />
      <path d="M3 6l9 7 9-7" />
    </svg>
  ),
  phone: (
    <svg viewBox="0 0 24 24">
      <path d="M5 4h3l2 5-2 1a11 11 0 0 0 5 5l1-2 5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2" />
    </svg>
  ),
  link: (
    <svg viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M8 10v7M8 7v.01M12 17v-7M16 17v-4a2 2 0 0 0-4 0" />
    </svg>
  ),
  git: (
    <svg viewBox="0 0 24 24">
      <path d="M9 19c-4 1.5-4-2-6-2m12 4v-3.5a3 3 0 0 0-1-2.3c3-.3 5-1.6 5-5.5a4.3 4.3 0 0 0-1.2-3 4 4 0 0 0-.1-3s-1-.3-3.3 1.3a11 11 0 0 0-6 0C5.8 3.6 4.8 3.9 4.8 3.9a4 4 0 0 0-.1 3A4.3 4.3 0 0 0 3.5 10c0 3.9 2 5.2 5 5.5a3 3 0 0 0-1 2.3V21" />
    </svg>
  ),
  disc: (
    <svg viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="2.4" />
    </svg>
  ),
  sig: (
    <svg viewBox="0 0 24 24">
      <path d="M4 20V10M9 20V6M14 20v-9M19 20V4" />
    </svg>
  ),
};

const SignalBars = () => (
  <span className="bars" aria-hidden="true">
    <i />
    <i />
    <i />
    <i />
  </span>
);

export default function Transmit() {
  return (
    <div className="tx">
      <h2 className="sec-h disp">{TRANSMIT_HEADER.title}</h2>
      <div className="sec-sub">
        {TRANSMIT_HEADER.sub} ·{' '}
        <span className="live">
          <i />
          LISTENING
        </span>
      </div>

      <div className="chan">
        {CHANNELS.map((c) => {
          const inner = (
            <>
              <span className="ico">{ICONS[c.icon]}</span>
              <span className="mid">
                <span className="k">{c.label}</span>
                <span className="v">{c.value}</span>
              </span>
              <span className="rt">
                <span className="status">{c.status}</span>
                <span className="rt-sig">
                  <SignalBars />
                  <span className="arrow">▸</span>
                </span>
              </span>
            </>
          );

          const style = { ['--cc']: c.accent } as CSSProperties;

          // placeholder channels aren't real destinations — render inert, marked
          if (c.todo) {
            return (
              <div key={c.id} className="ch todo" style={style} aria-label={`${c.label}: not set yet`}>
                {inner}
              </div>
            );
          }

          const external = c.href.startsWith('http');
          return (
            <a
              key={c.id}
              className="ch"
              href={c.href}
              style={style}
              aria-label={`${c.label}: ${c.value}`}
              {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
            >
              {inner}
            </a>
          );
        })}
      </div>

      <div className="signoff" aria-hidden="true">
        <div className="l">
          <span className="p">{SIGNOFF.prompt}</span>:<b>~</b>$ whoami
        </div>
        <div className="l">
          <b>{SIGNOFF.whoami}</b>
        </div>
        <div className="l">
          <span className="p">{SIGNOFF.prompt}</span>:<b>~</b>$ status
        </div>
        <div className="l">
          <b>{SIGNOFF.status}</b>
        </div>
        <div className="l end">
          // END OF TRANSMISSION<span className="cur" />
        </div>
      </div>
    </div>
  );
}

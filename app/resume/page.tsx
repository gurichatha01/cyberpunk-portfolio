import type { Metadata } from 'next';
import Link from 'next/link';
import { PROFILE } from '@/content/profile';
import { ERAS, formatDuration } from '@/content/journey';
import { BANKS, CREDENTIALS } from '@/content/stack';
import { TAPES } from '@/content/projects';

export const metadata: Metadata = {
  title: 'Résumé — Gurmeherdeep Singh Chatha',
  description:
    'Plain-text résumé for Gurmeherdeep Singh (Guri) Chatha — Data Analyst at Criteo and indie product builder.',
};

/* Plain, semantic, lightly-styled résumé (§7). This is the recruiter escape
   hatch and the crawlable version — one <h1>, real headings, real links, no
   HUD, no JavaScript. All copy comes from the same content/* files as the app,
   so it can never drift from the console. */
export default function Resume() {
  return (
    <main className="resume-doc">
      <p className="resume-back">
        <Link href="/">← back to GURI//OS</Link>
      </p>

      <header>
        <h1>{PROFILE.fullName}</h1>
        <p className="lede">
          {PROFILE.role.a} × {PROFILE.role.b} · Gurugram, India
        </p>
        <p>
          {PROFILE.bio.map((run, i) =>
            run.b ? <strong key={i}>{run.t}</strong> : <span key={i}>{run.t}</span>
          )}
        </p>
      </header>

      <section>
        <h2>Experience &amp; education</h2>
        {[...ERAS].reverse().map((e) => {
          const dur = e.since ? formatDuration(e.since) : e.dur;
          return (
            <article key={`${e.org}-${e.yr}`}>
              <h3>
                {e.org} — {e.role}
              </h3>
              <p className="meta">
                {e.when}
                {dur ? ` · ${dur}` : ''}
              </p>
              <p>
                {e.body.map((run, i) =>
                  run.b ? <strong key={i}>{run.t}</strong> : <span key={i}>{run.t}</span>
                )}
              </p>
              <p className="tags">Skills: {e.augs.join(', ')}</p>
            </article>
          );
        })}
      </section>

      <section>
        <h2>Selected projects</h2>
        {TAPES.map((t) => (
          <article key={t.id}>
            <h3>
              {t.name} — {t.tag.toLowerCase()}
            </h3>
            <p>{t.copy}</p>
            <p className="tags">Built with: {t.stack.join(', ')}</p>
            <p>
              <a href={t.href} target="_blank" rel="noreferrer">
                {t.label}
              </a>
            </p>
          </article>
        ))}
      </section>

      <section>
        <h2>Skills</h2>
        {BANKS.map((bank) => (
          <p key={bank.id}>
            <strong>{bank.cap.replace(/^BANK [A-Z] · /, '')}:</strong>{' '}
            {bank.chips.map((c) => c.name).join(', ')}
          </p>
        ))}
      </section>

      <section>
        <h2>Education &amp; certification</h2>
        {CREDENTIALS.map((c) => (
          <p key={c.k}>
            <strong>{c.k}:</strong> {c.v}
          </p>
        ))}
      </section>

      <section>
        <h2>Contact</h2>
        <ul>
          <li>
            LinkedIn:{' '}
            <a
              href="https://www.linkedin.com/in/gurmeherdeepchatha2001/"
              target="_blank"
              rel="noreferrer"
            >
              /in/gurmeherdeepchatha2001
            </a>
          </li>
          <li>
            AUXD:{' '}
            <a href="https://theauxd.vercel.app" target="_blank" rel="noreferrer">
              theauxd.vercel.app
            </a>
          </li>
          <li>
            LORES:{' '}
            <a href="https://lores.in" target="_blank" rel="noreferrer">
              lores.in
            </a>
          </li>
          <li>Email: TODO — add before launch</li>
          <li>GitHub: TODO — add before launch</li>
        </ul>
      </section>
    </main>
  );
}

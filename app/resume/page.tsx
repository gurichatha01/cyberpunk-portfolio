import type { Metadata } from 'next';
import Link from 'next/link';
import { PROFILE } from '@/content/profile';
import {
  RESUME_SUMMARY,
  RESUME_ROLES,
  RESUME_SKILLS,
  RESUME_EDU,
  RESUME_CERT,
} from '@/content/resume';
import { TAPES } from '@/content/projects';
import { CHANNELS, LOCATION } from '@/content/links';

export const metadata: Metadata = {
  title: 'Résumé — Gurmeherdeep Singh Chatha',
  description:
    'Résumé for Gurmeherdeep Singh (Guri) Chatha — Data Analyst at Criteo (AMS/APAC) and indie product builder.',
};

/* Plain, semantic, lightly-styled résumé (§7): the recruiter escape hatch and
   the crawlable version. One <h1>, real headings and links, no HUD, no JS. All
   copy comes from content/* so it can't drift from the console. */
export default function Resume() {
  const email = CHANNELS.find((c) => c.id === 'email');
  const phone = CHANNELS.find((c) => c.id === 'phone');
  const linkedin = CHANNELS.find((c) => c.id === 'linkedin');

  return (
    <main className="resume-doc">
      <p className="resume-back">
        <Link href="/">← back to GURI//OS</Link>
      </p>

      <header>
        <h1>{PROFILE.fullName}</h1>
        <p className="lede">
          {PROFILE.role.a} × {PROFILE.role.b}
        </p>
        <p className="contact-line">
          {LOCATION}
          {email && (
            <>
              {' · '}
              <a href={email.href}>{email.value}</a>
            </>
          )}
          {phone && (
            <>
              {' · '}
              <a href={phone.href}>{phone.value}</a>
            </>
          )}
          {linkedin && (
            <>
              {' · '}
              <a href={linkedin.href} target="_blank" rel="noreferrer">
                {linkedin.value}
              </a>
            </>
          )}
        </p>
        <p className="summary">{RESUME_SUMMARY}</p>
      </header>

      <section>
        <h2>Experience</h2>
        {RESUME_ROLES.map((r) => (
          <article key={r.org}>
            <h3>
              {r.title} · {r.org}
            </h3>
            <p className="meta">
              {r.dates} · {r.location}
            </p>
            <ul>
              {r.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section>
        <h2>Projects</h2>
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
        {RESUME_SKILLS.map((g) => (
          <p key={g.label}>
            <strong>{g.label}:</strong> {g.items.join(', ')}
          </p>
        ))}
      </section>

      <section>
        <h2>Education &amp; certification</h2>
        <article>
          <h3>{RESUME_EDU.degree}</h3>
          <p className="meta">
            {RESUME_EDU.school} · {RESUME_EDU.dates}
          </p>
          <p>{RESUME_EDU.extra}</p>
        </article>
        <p>
          <strong>Certification:</strong> {RESUME_CERT}
        </p>
      </section>

      <section>
        <h2>Contact</h2>
        <ul>
          {CHANNELS.map((c) => (
            <li key={c.id}>
              {c.label}:{' '}
              {c.todo ? (
                <span>{c.value}</span>
              ) : c.href.startsWith('http') ? (
                <a href={c.href} target="_blank" rel="noreferrer">
                  {c.value}
                </a>
              ) : (
                <a href={c.href}>{c.value}</a>
              )}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

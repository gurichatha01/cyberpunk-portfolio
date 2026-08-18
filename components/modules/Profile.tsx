'use client';

import { Scramble } from '@/components/ui/Scramble';
import { PROFILE } from '@/content/profile';

interface ProfileProps {
  /** true once boot has lifted — triggers the wordmark decode */
  revealed: boolean;
  /** jump to another module */
  onGo: (i: number) => void;
}

export default function Profile({ revealed, onGo }: ProfileProps) {
  return (
    <div>
      <div className="eyebrow">{PROFILE.eyebrow}</div>

      <h1 className="name disp">
        <Scramble text={PROFILE.name} run={revealed} />
      </h1>

      <div className="fullname">{PROFILE.fullName}</div>

      <div className="role disp">
        {PROFILE.role.a}
        <span className="x">×</span>
        {PROFILE.role.b}
      </div>

      <p className="bio">
        {PROFILE.bio.map((run, i) =>
          run.b ? <b key={i}>{run.t}</b> : <span key={i}>{run.t}</span>
        )}
      </p>

      <div className="chips">
        {PROFILE.chips.map((c) => (
          <span className="chip" key={c.k}>
            {c.k} · <b>{c.v}</b>
          </span>
        ))}
      </div>

      <div className="ctas">
        {PROFILE.ctas.map((c) => (
          <button
            key={c.label}
            className={`btn${c.primary ? '' : ' ghost'}`}
            onClick={() => onGo(c.to)}
          >
            {c.label}
          </button>
        ))}
      </div>
    </div>
  );
}

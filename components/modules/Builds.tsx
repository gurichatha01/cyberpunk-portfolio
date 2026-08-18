'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Cassette } from '@/components/ui/Cassette';
import { TAPES, type Tape } from '@/content/projects';
import type { CSSProperties } from 'react';

type Phase = 'idle' | 'loading' | 'seated' | 'ejecting';

const LOAD_MS = 860; // idle -> seated
const EJECT_MS = 480; // seated -> idle
const DEFAULT_AC = 'var(--cyan)';

export default function Builds() {
  const [loaded, setLoaded] = useState<Tape | null>(null);
  const [phase, setPhase] = useState<Phase>('idle');
  const [status, setStatus] = useState('');

  // refs mirror state so timed callbacks read the live value, not a stale closure
  const phaseRef = useRef(phase);
  const loadedRef = useRef(loaded);
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    loadedRef.current = loaded;
  }, [loaded]);

  const timers = useRef<number[]>([]);
  const addTimer = (id: number) => timers.current.push(id);
  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  const ejectBtn = useRef<HTMLButtonElement>(null);

  const insert = useCallback((tape: Tape) => {
    setLoaded(tape);
    setPhase('loading');
    addTimer(
      window.setTimeout(() => {
        setPhase('seated');
        setStatus(`${tape.name} loaded`);
        // recover focus if the picked shelf button unmounted out from under it
        if (document.activeElement === document.body) ejectBtn.current?.focus();
      }, LOAD_MS)
    );
  }, []);

  const eject = useCallback(() => {
    const name = loadedRef.current?.name;
    setPhase('ejecting');
    addTimer(
      window.setTimeout(() => {
        setLoaded(null);
        setPhase('idle');
        setStatus(name ? `${name} ejected` : 'Tape ejected');
      }, EJECT_MS)
    );
  }, []);

  // Pick from the shelf. Guards double-taps mid-transition; auto-ejects first
  // if a different tape is already loaded.
  const pick = useCallback(
    (tape: Tape) => {
      if (phaseRef.current === 'loading' || phaseRef.current === 'ejecting') return;
      if (loadedRef.current) {
        eject();
        addTimer(window.setTimeout(() => insert(tape), EJECT_MS + 20));
      } else {
        insert(tape);
      }
    },
    [eject, insert]
  );

  const ac = loaded ? loaded.ac : DEFAULT_AC;
  const shelf = TAPES.filter((t) => !loaded || t.id !== loaded.id);
  const busy = phase === 'loading' || phase === 'ejecting';
  const slotState: 'loading' | 'seated' | 'ejecting' =
    phase === 'loading' ? 'loading' : phase === 'ejecting' ? 'ejecting' : 'seated';

  return (
    <div>
      <div className="sec-h disp">BUILDS</div>
      <div className="sec-sub">INSERT A CASSETTE TO READ THE FILE</div>

      <div className="deckwrap" style={{ ['--ac']: ac } as CSSProperties}>
        <div className="deckcol">
          <div className="deck">
            <div className="dhead">
              <span>TAPE DECK · TD-77</span>
              <span className="pwr">
                {phase === 'seated' ? 'PLAY' : 'STOP'}
                <i className={`led${phase === 'seated' ? ' on' : ''}`} />
              </span>
            </div>

            <div className="slot">
              <div className="slotmouth" />
              {loaded ? (
                <Cassette tape={loaded} mode="slot" slotState={slotState} />
              ) : (
                <span className="slotempty">— NO TAPE —</span>
              )}
            </div>

            <div className="transport">
              <button
                ref={ejectBtn}
                type="button"
                className="tbtn"
                disabled={!loaded || phase !== 'seated'}
                onClick={eject}
              >
                ◂ EJECT
              </button>
              <button type="button" className="tbtn" disabled>
                ▸ PLAY
              </button>
              <button type="button" className="tbtn" disabled>
                ▪ STOP
              </button>
            </div>

            <div className={`vu${phase === 'seated' ? ' live' : ''}`} aria-hidden="true">
              {Array.from({ length: 14 }).map((_, i) => (
                <i key={i} />
              ))}
            </div>
          </div>

          <div className="shelf">
            <div className="cap">{loaded ? 'OTHER TAPES' : 'SELECT A TAPE'}</div>
            <div className="shelfrow">
              {shelf.map((t) => (
                <Cassette
                  key={t.id}
                  tape={t}
                  mode="button"
                  disabled={busy}
                  onClick={() => pick(t)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="readout">
          {!loaded || phase === 'loading' ? (
            <div className="ro-idle">
              <div className="big disp">
                {phase === 'loading' ? 'READING TAPE . . .' : 'AWAITING TAPE'}
              </div>
              <div className="ro-idle-sub">
                {phase === 'loading' ? 'DECRYPTING SIDE' : 'PICK A CASSETTE FROM THE SHELF'}
              </div>
            </div>
          ) : (
            <div className="ro-in" key={loaded.id}>
              <div className="ro-mod">{loaded.mod}</div>
              <div className="ro-h disp">{loaded.name}</div>
              <div className="ro-tag">{loaded.tag}</div>
              <p className="ro-p">{loaded.copy}</p>
              <div className="ro-grid">
                {loaded.cells.map(([k, v]) => (
                  <div className="ro-cell" key={k}>
                    <span>{k}</span>
                    <b>{v}</b>
                  </div>
                ))}
              </div>
              <div className="ro-stack">
                {loaded.stack.map((s) => (
                  <em key={s}>{s}</em>
                ))}
              </div>
              <a className="access" href={loaded.href} target="_blank" rel="noreferrer">
                OPEN {loaded.label} ▸
              </a>
            </div>
          )}
        </div>
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {status}
      </div>
    </div>
  );
}

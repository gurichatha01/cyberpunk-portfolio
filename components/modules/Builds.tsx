'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Cassette } from '@/components/ui/Cassette';
import { TAPES, type Tape } from '@/content/projects';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { CSSProperties } from 'react';

type Phase = 'idle' | 'loading' | 'seated' | 'ejecting';

const LOAD_MS = 860; // idle -> seated
const EJECT_MS = 480; // seated -> idle
const DEFAULT_AC = 'var(--cyan)';

export default function Builds() {
  // Mobile is a different interaction entirely (§5): no deck box, no readout
  // box — the cassette IS the container and expands in place. Desktop keeps the
  // two-column deck. 860px is the split.
  const isMobile = useMediaQuery('(max-width: 860px)');

  // ---- mobile: which card is expanded ----
  const [openId, setOpenId] = useState<string | null>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // ---- desktop: the deck's insert/eject machine ----
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

  // Pick from the shelf (desktop). Guards double-taps; auto-ejects first.
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

  // Toggle a mobile card open/closed (one at a time), then bring it into view.
  const toggle = (tape: Tape) => {
    const next = openId === tape.id ? null : tape.id;
    setOpenId(next);
    setStatus(next ? `${tape.name} playing` : 'Stopped');
    if (next) {
      const cardEl = cardRefs.current[next];
      // measure the (currently clipped) body so max-height animates to an exact
      // content height instead of a magic number
      const bodyEl = cardEl?.querySelector<HTMLElement>('.body');
      if (cardEl && bodyEl) cardEl.style.setProperty('--body-h', `${bodyEl.scrollHeight}px`);
      window.setTimeout(() => {
        cardEl?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 400);
    }
  };

  /* ============================ MOBILE ============================ */
  if (isMobile) {
    return (
      <div className="bd">
        <div className="sec-h disp">BUILDS</div>
        <div className="sec-sub">TAP A TAPE TO PLAY IT</div>

        <div className="tapes">
          {TAPES.map((tape) => {
            const open = openId === tape.id;
            return (
              <div
                key={tape.id}
                ref={(el) => {
                  cardRefs.current[tape.id] = el;
                }}
                className={`card${open ? ' open' : ''}`}
                style={{ ['--ac']: tape.ac } as CSSProperties}
              >
                <button
                  type="button"
                  className="face"
                  onClick={() => toggle(tape)}
                  aria-expanded={open}
                  aria-controls={`tape-body-${tape.id}`}
                >
                  <span className="mcass">
                    <i className="screw a" />
                    <i className="screw b" />
                    <i className="screw c" />
                    <i className="screw d" />
                    <span className="mlbl">
                      <span className="stripe" />
                      <span className="t disp">{tape.name}</span>
                      <span className="s">{tape.side}</span>
                      <span className="tag">{tape.tag}</span>
                    </span>
                    <span className="mwin">
                      <span className="hub" />
                      <span className="band" />
                      <span className="hub" />
                    </span>
                  </span>
                  <span className="strip">
                    <span className="stat">
                      <i className="led" />
                      {open ? 'PLAYING' : 'STOP'}
                    </span>
                    <span className="vu" aria-hidden="true">
                      {Array.from({ length: 10 }).map((_, i) => (
                        <i key={i} />
                      ))}
                    </span>
                    <span className="hintx">{open ? '▾' : 'TAP ▸'}</span>
                  </span>
                </button>

                <div className="body" id={`tape-body-${tape.id}`}>
                  <div className="inner">
                    <div className="pad">
                      <div className="ro-mod">{tape.mod}</div>
                      <p className="ro-p">{tape.copy}</p>
                      <div className="ro-grid">
                        {tape.cells.map(([k, v]) => (
                          <div className="ro-cell" key={k}>
                            <span>{k}</span>
                            <b>{v}</b>
                          </div>
                        ))}
                      </div>
                      <div className="ro-stack">
                        {tape.stack.map((s) => (
                          <em key={s}>{s}</em>
                        ))}
                      </div>
                      <div className="acts">
                        <a
                          className="access"
                          href={tape.href}
                          target="_blank"
                          rel="noreferrer"
                        >
                          OPEN {tape.name} ▸
                        </a>
                        <button
                          type="button"
                          className="ejectb"
                          onClick={() => {
                            setOpenId(null);
                            setStatus('Stopped');
                          }}
                        >
                          ◂ EJECT
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sr-only" role="status" aria-live="polite">
          {status}
        </div>
      </div>
    );
  }

  /* ============================ DESKTOP ============================ */
  const ac = loaded ? loaded.ac : DEFAULT_AC;
  const busy = phase === 'loading' || phase === 'ejecting';
  const slotState: 'loading' | 'seated' | 'ejecting' =
    phase === 'loading' ? 'loading' : phase === 'ejecting' ? 'ejecting' : 'seated';

  return (
    <div className="bd">
      <div className="sec-h disp">BUILDS</div>
      <div className="sec-sub">INSERT A CASSETTE TO READ THE FILE</div>

      <div className="deckwrap" style={{ ['--ac']: ac } as CSSProperties}>
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

        <div className="shelf" aria-label="Tape rack">
          <div className="cap">
            <span>TAPE RACK · 02 SLOTS</span>
            <b>{loaded ? '01 READY' : '02 READY'}</b>
          </div>
          <div className="shelfrow">
            {TAPES.map((t) => {
              const inDeck = loaded?.id === t.id;
              return (
                <div className={`rack-slot${inDeck ? ' in-deck' : ''}`} key={t.id}>
                  {inDeck ? (
                    <div className="rack-empty" aria-label={`${t.name} is in the tape deck`}>
                      <span>{t.name} · IN DECK</span>
                      <i>RETURNING ON EJECT</i>
                    </div>
                  ) : (
                    <Cassette
                      tape={t}
                      mode="button"
                      disabled={busy}
                      onClick={() => pick(t)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {status}
      </div>
    </div>
  );
}

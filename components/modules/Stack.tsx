'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import {
  ALL,
  BANKS,
  CREDENTIALS,
  ERA,
  STACK_HEADER,
  STACK_IDLE,
  byId,
} from '@/content/stack';

interface TracePath {
  id: string;
  d: string;
}

/** chamfer length on each corner — makes the turn read as PCB routing, not a bend */
const CHAMFER = 7;

export default function Stack() {
  const [sel, setSel] = useState<string | null>(null);
  const [paths, setPaths] = useState<TracePath[]>([]);

  const boardRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const active = sel ? byId(sel) : null;
  const ac = active ? ERA[active.era].c : 'var(--cyan)';
  const linkSet = new Set(active ? active.links : []);

  /* Route a trace from the selected chip to each chip it links to. Positions
     are measured from the real DOM boxes, never hardcoded, so the wiring
     survives any reflow. Manhattan path with chamfered corners. */
  const route = useCallback(() => {
    const board = boardRef.current;
    const from = sel ? chipRefs.current[sel] : null;
    if (!sel || !board || !from) {
      setPaths([]);
      return;
    }
    const b = board.getBoundingClientRect();
    const fr = from.getBoundingClientRect();
    const ax = fr.left - b.left + fr.width / 2;
    const ay = fr.top - b.top + fr.height / 2;

    const out: TracePath[] = [];
    for (const lid of byId(sel)?.links ?? []) {
      const to = chipRefs.current[lid];
      if (!to) continue;
      const tr = to.getBoundingClientRect();
      const bx = tr.left - b.left + tr.width / 2;
      const by = tr.top - b.top + tr.height / 2;
      const midY = (ay + by) / 2;
      const dir = by > ay ? 1 : -1;
      const sx = bx > ax ? 1 : -1;
      out.push({
        id: lid,
        d: [
          `M ${ax} ${ay}`,
          `L ${ax} ${midY - dir * CHAMFER}`,
          `L ${ax + sx * CHAMFER} ${midY}`,
          `L ${bx - sx * CHAMFER} ${midY}`,
          `L ${bx} ${midY + dir * CHAMFER}`,
          `L ${bx} ${by}`,
        ].join(' '),
      });
    }
    setPaths(out);
  }, [sel]);

  useEffect(() => {
    route();
  }, [route]);

  /* Recompute on any resize of the board — this is what keeps the traces
     aligned through the mobile reflow. rAF-throttled so a drag-resize doesn't
     thrash layout. */
  useEffect(() => {
    let queued = false;
    const run = () => {
      if (queued) return;
      queued = true;
      requestAnimationFrame(() => {
        queued = false;
        route();
      });
    };
    window.addEventListener('resize', run);
    const board = boardRef.current;
    const ro = new ResizeObserver(run);
    if (board) ro.observe(board);
    return () => {
      window.removeEventListener('resize', run);
      ro.disconnect();
    };
  }, [route]);

  /* The readout is always on screen (a fixed region below the board on mobile,
     the side panel on desktop), so selecting only swaps its contents — nothing
     scrolls. */
  const select = useCallback((id: string | null) => setSel(id), []);

  return (
    <div className="st" style={{ ['--ac']: ac } as CSSProperties}>
      <h2 className="sec-h disp">{STACK_HEADER.title}</h2>
      <div className="sec-sub">{STACK_HEADER.sub}</div>

      <div className={`st-layout${active ? ' has-selection' : ' is-idle'}`}>
        {/* ---------------- BOARD ---------------- */}
        <div className="board" ref={boardRef} style={{ ['--ac']: ac } as CSSProperties}>
          <div className="bh">
            <span>BOARD REV 1.3 · {ALL.length} MODULES</span>
            <span>
              {active ? (
                <>
                  LINKED <b>{active.links.length}</b>
                </>
              ) : (
                'NO MODULE SELECTED'
              )}
            </span>
          </div>

          <svg className="traces" aria-hidden="true">
            {paths.map((p) => (
              <g key={p.id} style={{ ['--tc']: ac } as CSSProperties}>
                <path className="tr" d={p.d} />
                <path className="tr-flow" d={p.d} />
              </g>
            ))}
          </svg>

          {BANKS.map((bank) => (
            <div className="bank" key={bank.id}>
              <div className="cap">{bank.cap}</div>
              <div className="chipgrid">
                {bank.chips.map((c) => {
                  const on = sel === c.id;
                  const linked = linkSet.has(c.id);
                  const dim = sel && !on && !linked;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      ref={(el) => {
                        chipRefs.current[c.id] = el;
                      }}
                      className={`chip${on ? ' on' : linked ? ' link' : dim ? ' dim' : ''}`}
                      style={{ ['--cc']: ERA[c.era].c } as CSSProperties}
                      onClick={() => select(on ? null : c.id)}
                      aria-pressed={on}
                      aria-label={`${c.name}, installed ${ERA[c.era].label}`}
                    >
                      <i className="eradot" />
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ---------------- READOUT ----------------
            Wrapped so the grid row height is driven by the BOARD alone. Without
            this, selecting a chip with a long note grew the readout, grew the
            row, and pushed the legend + credentials down the page. The readout
            now fills the board's height and scrolls inside if it needs to. */}
        <div className="read-col">
          <div className="read" style={{ ['--ac']: ac } as CSSProperties}>
          {active && (
            <button
              type="button"
              className="read-close"
              onClick={() => select(null)}
              aria-label="Return to the stack board"
            >
              ◂ BOARD
            </button>
          )}
          {!active ? (
            <div className="idle">
              <div className="b disp">{STACK_IDLE.big}</div>
              <div className="s">{STACK_IDLE.sub}</div>
            </div>
          ) : (
            <div key={active.id} className="read-in">
              <div className="rslot">{active.bank}</div>
              <h3 className="disp">{active.name}</h3>
              <div className="grp">INSTALLED · {ERA[active.era].label}</div>
              <p>{active.note}</p>
              <div className="kv">
                <span>MODULE</span>
                <b>{active.name.toUpperCase()}</b>
              </div>
              <div className="kv">
                <span>INSTALLED</span>
                <b>{ERA[active.era].label}</b>
              </div>
              <div className="kv">
                <span>LINKS</span>
                <b>{active.links.length || '—'}</b>
              </div>
              {active.links.length > 0 && (
                <div className="lk">
                  <div className="cap">▸ TRACED TO</div>
                  <div className="row">
                    {active.links.map((l) => (
                      <button
                        key={l}
                        type="button"
                        className="lktag"
                        onClick={() => select(l)}
                      >
                        {byId(l)?.name ?? l}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="legend">
        {Object.entries(ERA).map(([k, v]) => (
          <span key={k}>
            <i style={{ background: v.c }} />
            {v.label}
          </span>
        ))}
      </div>

      <div className="creds">
        {CREDENTIALS.map((c) => (
          <div key={c.k}>
            <span>{c.k}</span> · {c.v}
          </div>
        ))}
      </div>

      <div className="sr-only" role="status" aria-live="polite">
        {active
          ? `${active.name} selected, installed ${ERA[active.era].label}, ${active.links.length} links`
          : ''}
      </div>
    </div>
  );
}

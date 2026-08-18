'use client';

import type { CSSProperties } from 'react';
import type { Tape } from '@/content/projects';

type SlotState = 'loading' | 'seated' | 'ejecting';

interface CassetteProps {
  tape: Tape;
  /** button = interactive shelf item; slot = decorative unit inside the deck */
  mode: 'button' | 'slot';
  /** animation/appearance state while inside the slot */
  slotState?: SlotState;
  disabled?: boolean;
  onClick?: () => void;
}

/* Pure-CSS cassette: body, four screws, paper label with accent stripe, window
   with two hubs + tape. No images (§1). The hubs only spin once the tape is
   seated. Accent is passed as --ac so the stripe matches the project colour. */
export function Cassette({ tape, mode, slotState, disabled, onClick }: CassetteProps) {
  const spin = slotState === 'seated';

  const inner = (
    <>
      <i className="screw a" />
      <i className="screw b" />
      <i className="screw c" />
      <i className="screw d" />
      <span className="lbl">
        <span className="stripe" />
        <span className="t disp">{tape.name}</span>
        <span className="s">{tape.side}</span>
      </span>
      <span className="win">
        <span className={`hub${spin ? ' spin' : ''}`} />
        <span className="tape" />
        <span className={`hub${spin ? ' spin' : ''}`} />
      </span>
    </>
  );

  const style = { ['--ac']: tape.ac } as CSSProperties;

  if (mode === 'button') {
    return (
      <button
        type="button"
        className="cass cassbtn"
        style={style}
        aria-label={`Load ${tape.name} cassette`}
        disabled={disabled}
        onClick={onClick}
      >
        {inner}
      </button>
    );
  }

  return (
    <div className={`cass${slotState ? ` ${slotState}` : ''}`} style={style} aria-hidden="true">
      {inner}
    </div>
  );
}

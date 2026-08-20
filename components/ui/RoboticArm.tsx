import type { CSSProperties } from 'react';
import type { Tape } from '@/content/projects';

interface RoboticArmProps {
  tape: Tape;
  mode: 'insert' | 'eject';
  slot: number;
}

export function RoboticArm({ tape, mode, slot }: RoboticArmProps) {
  return (
    <div
      className={`robot-transfer ${mode} slot-${slot}`}
      style={
        {
          ['--arm-ac']: tape.ac,
          ['--rack-slot-y']: `${slot * 162}px`,
        } as CSSProperties
      }
      aria-hidden="true"
    >
      <div className="arm-rail">
        <span>GANTRY // TD-77</span>
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="arm-lift-guide">
        <i />
        <b>RACK 0{slot + 1}</b>
      </div>

      <div className="arm-carriage">
        <span className="arm-status">
          <b>{mode === 'insert' ? 'ACQUIRE' : 'RETURN'}</b>
          <i>RACK 0{slot + 1}</i>
        </span>
        <span className="arm-motor">
          <i className="arm-core" />
          <i className="arm-vent" />
        </span>
        <span className="arm-upper" />
        <span className="arm-joint" />
        <span className="arm-fore" />
        <span className="arm-wrist" />
        <span className="arm-claw">
          <i />
          <i />
        </span>
        <span className="arm-payload">
          <span className="arm-payload-label">
            <b>{tape.name}</b>
            <i>{tape.side}</i>
          </span>
          <span className="arm-payload-reels">
            <i />
            <em />
            <i />
          </span>
        </span>
        <span className="arm-sparks">
          <i />
          <i />
          <i />
          <i />
        </span>
      </div>
    </div>
  );
}

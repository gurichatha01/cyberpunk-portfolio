/* Module navigation. All copy lives in content/* (§2) — edit labels here,
   never in the components. `short` is what the mobile bottom bar shows so the
   five items never overflow at 320px (§5); `label` is the desktop nav. */

export interface NavItem {
  /** stable id, used as React key and for the tablist aria wiring */
  id: string;
  /** two-digit module number shown as the dim prefix */
  no: string;
  /** desktop nav label */
  label: string;
  /** mobile bottom-bar label — kept short so 5 fit at 320px */
  short: string;
}

export const NAV: NavItem[] = [
  { id: 'profile',  no: '01', label: 'PROFILE',  short: 'PROFILE' },
  { id: 'builds',   no: '02', label: 'BUILDS',   short: 'BUILDS' },
  { id: 'journey',  no: '03', label: 'JOURNEY',  short: 'JOURNEY' },
  { id: 'stack',    no: '04', label: 'STACK',    short: 'STACK' },
  { id: 'transmit', no: '05', label: 'TRANSMIT', short: 'TRANSMIT' },
];

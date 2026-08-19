import React, { useState, useEffect, useRef, useCallback } from "react";

/* =========================================================================
   STACK v2 — "INSTALLED MODULES"
   The stack as a circuit board. Chips are ICs, coloured by the ERA they were
   installed in (same palette as JOURNEY). Tap a chip -> it powers on, PCB
   traces route to every linked chip, signal animates down them, readout fills.
   ========================================================================= */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

:root{
  --void:#05060a; --panel:#0b0e15; --panel2:#11151f; --line:#1c2230;
  --yellow:#fcee0a; --cyan:#00e5ff; --magenta:#ff2e6e; --green:#22f5a8;
  --ink:#e9edf5; --mute:#8794a8;
}
*{box-sizing:border-box;}
.st,.st *{font-family:'JetBrains Mono',ui-monospace,monospace;}
.disp{font-family:'Chakra Petch',sans-serif;}
.st{background:radial-gradient(120% 90% at 50% -10%,#0c1020 0%,var(--void) 60%),var(--void);
  color:var(--ink);padding:24px clamp(16px,4vw,60px) 34px;min-height:100vh;}

.sec-h{font-family:'Chakra Petch',sans-serif;font-weight:700;font-size:clamp(28px,6vw,46px);
  color:var(--ink);margin:0 0 3px;line-height:1;}
.sec-sub{color:var(--mute);font-size:clamp(9px,2.3vw,12px);letter-spacing:.24em;margin-bottom:18px;}

.layout{display:grid;grid-template-columns:1fr minmax(260px,330px);gap:20px;align-items:start;}
@media(max-width:860px){.layout{grid-template-columns:1fr;}}

/* ---------- board ---------- */
.board{position:relative;border:1px solid var(--line);padding:16px 14px 14px;overflow:hidden;
  background:
    linear-gradient(180deg,#080c12,#050810),
    repeating-linear-gradient(0deg,transparent 0 23px,#0d141d 23px 24px),
    repeating-linear-gradient(90deg,transparent 0 23px,#0d141d 23px 24px);
  clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));}
.board .bh{display:flex;justify-content:space-between;font-size:9px;letter-spacing:.2em;
  color:var(--mute);margin-bottom:14px;gap:10px;}
.board .bh b{color:var(--ac);font-weight:500;}

.traces{position:absolute;inset:0;pointer-events:none;z-index:1;overflow:visible;}
.tr{fill:none;stroke:var(--tc);stroke-width:1.4;stroke-linejoin:round;stroke-linecap:round;
  opacity:.55;filter:drop-shadow(0 0 4px var(--tc));}
.tr-flow{fill:none;stroke:#fff;stroke-width:1.6;stroke-linejoin:round;stroke-linecap:round;
  opacity:.75;stroke-dasharray:5 26;animation:flow .9s linear infinite;}
@keyframes flow{to{stroke-dashoffset:-31}}

.bank{position:relative;z-index:2;margin-bottom:16px;}
.bank:last-child{margin-bottom:0;}
.bank .cap{font-size:9px;letter-spacing:.28em;color:var(--mute);margin-bottom:9px;
  display:flex;align-items:center;gap:8px;}
.bank .cap::after{content:"";flex:1;height:1px;background:var(--line);}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(96px,1fr));gap:9px;}
@media(max-width:420px){.grid{grid-template-columns:repeat(auto-fill,minmax(84px,1fr));}}

/* ---------- chip ---------- */
.chip{position:relative;background:linear-gradient(160deg,#161b25,#0c1017);border:1px solid #232b3a;
  color:#9dabbf;font-size:9.5px;letter-spacing:.04em;padding:14px 6px;cursor:pointer;
  min-height:52px;display:flex;align-items:center;justify-content:center;text-align:center;
  font-family:'JetBrains Mono',monospace;transition:.16s;line-height:1.25;
  clip-path:polygon(0 0,calc(100% - 7px) 0,100% 7px,100% 100%,7px 100%,0 calc(100% - 7px));}
.chip::before,.chip::after{content:"";position:absolute;top:9px;bottom:9px;width:3px;
  background:repeating-linear-gradient(180deg,#39424f 0 3px,transparent 3px 7px);transition:.16s;}
.chip::before{left:-3px;} .chip::after{right:-3px;}
.chip:hover{color:var(--cc);border-color:var(--cc);}
.chip.on{color:#05060a;background:var(--cc);border-color:var(--cc);font-weight:700;
  box-shadow:0 0 22px color-mix(in srgb,var(--cc) 55%,transparent);}
.chip.on::before,.chip.on::after{background:repeating-linear-gradient(180deg,var(--cc) 0 3px,transparent 3px 7px);}
.chip.link{border-color:var(--cc);color:var(--cc);
  box-shadow:0 0 14px color-mix(in srgb,var(--cc) 26%,transparent) inset;}
.chip.dim{opacity:.34;}
.chip .era{position:absolute;top:3px;right:4px;width:5px;height:5px;border-radius:50%;background:var(--cc);opacity:.85;}
.chip.on .era{background:#05060a;}

/* ---------- readout ---------- */
.read{border:1px solid var(--line);background:linear-gradient(160deg,var(--panel),var(--panel2));
  padding:20px;position:relative;min-height:280px;
  clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));}
.read::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--ac);
  box-shadow:0 0 16px var(--ac);transition:.25s;}
.read .slot{font-size:9px;letter-spacing:.24em;color:var(--mute);}
.read h3{font-family:'Chakra Petch',sans-serif;font-weight:700;font-size:clamp(24px,5vw,34px);
  color:var(--ink);margin:5px 0 4px;line-height:1;}
.read .grp{color:var(--ac);font-size:10.5px;letter-spacing:.16em;margin-bottom:14px;}
.read p{color:#a8b2c4;font-size:12.5px;line-height:1.65;margin:0 0 16px;}
.read .kv{display:flex;justify-content:space-between;gap:10px;padding:9px 0;border-top:1px solid var(--line);
  font-size:10px;letter-spacing:.1em;}
.read .kv span{color:var(--mute);}
.read .kv b{color:var(--ac);font-weight:500;text-align:right;}
.read .lk{margin-top:14px;}
.read .lk .cap{font-size:9px;letter-spacing:.22em;color:var(--mute);margin-bottom:8px;}
.read .lk .row{display:flex;gap:6px;flex-wrap:wrap;}
.read .lk em{font-style:normal;font-size:9.5px;letter-spacing:.06em;border:1px solid var(--line);
  padding:5px 8px;color:#9dabbf;cursor:pointer;transition:.16s;}
.read .lk em:hover{border-color:var(--ac);color:var(--ac);}
.idle{display:flex;flex-direction:column;align-items:center;justify-content:center;
  min-height:250px;gap:9px;color:#39445a;text-align:center;}
.idle .b{font-family:'Chakra Petch',sans-serif;font-size:15px;letter-spacing:.28em;color:#46536b;}
.idle .s{font-size:10px;letter-spacing:.16em;}

.legend{display:flex;gap:12px;flex-wrap:wrap;margin-top:16px;font-size:9px;letter-spacing:.14em;color:var(--mute);}
.legend i{display:inline-block;width:7px;height:7px;border-radius:50%;margin-right:5px;vertical-align:middle;}
@media(prefers-reduced-motion:reduce){.tr-flow{animation:none;opacity:.4;}}
`;

/* era palette — identical to JOURNEY */
const ERA = {
  thapar:  { c:"#00e5ff", label:"THAPAR · 2019" },
  mylo:    { c:"#22f5a8", label:"MYLO · 2023" },
  criteo:  { c:"#fcee0a", label:"CRITEO · 2024" },
  shipping:{ c:"#ff2e6e", label:"SHIPPING · 2026" },
};

const BANKS = [
  { id:"data", cap:"BANK A · DATA CORE", chips:[
    { id:"sql", name:"SQL", era:"mylo", links:["bigquery","hive","tableau","powerbi","postgres"],
      note:"Where almost every answer starts. Window functions and CTEs do more of the work than people expect." },
    { id:"python", name:"Python", era:"thapar", links:["bigquery","c","gemini"],
      note:"Picked up in an engineering degree, kept for automation and anything SQL can't reach." },
    { id:"bigquery", name:"BigQuery", era:"mylo", links:["sql","python"],
      note:"The warehouse at Mylo and the habit that carried into Criteo. Partitioning is a cost decision, not a technical one." },
    { id:"hive", name:"Hive", era:"criteo", links:["sql"],
      note:"Adtech data at Criteo scale. Slower to query, so you learn to ask the right question the first time." },
    { id:"tableau", name:"Tableau", era:"criteo", links:["sql"],
      note:"Client-facing dashboards. The hard part is deciding what to leave out." },
    { id:"powerbi", name:"Power BI", era:"criteo", links:["sql"],
      note:"Internal reporting. Same discipline as Tableau, different politics." },
    { id:"excel", name:"Excel Modelling", era:"mylo", links:[],
      note:"Unglamorous and undefeated. Logistics cost models and P&L work at Mylo lived here." },
  ]},
  { id:"ship", cap:"BANK B · SHIP KIT", chips:[
    { id:"nextjs", name:"Next.js", era:"shipping", links:["typescript","react","vercel","supabase","razorpay","gemini"],
      note:"Both products run on it. App Router, static where possible, server only where it earns its keep." },
    { id:"typescript", name:"TypeScript", era:"shipping", links:["nextjs","react"],
      note:"Non-negotiable once a side project outlives the weekend you built it in." },
    { id:"react", name:"React", era:"shipping", links:["nextjs","typescript"],
      note:"Component discipline. Most of my bugs are state bugs, so state lives in as few places as possible." },
    { id:"supabase", name:"Supabase", era:"shipping", links:["postgres","nextjs"],
      note:"Auth, database and storage without standing up a backend. Row-level security is the feature." },
    { id:"postgres", name:"PostgreSQL", era:"shipping", links:["supabase","sql"],
      note:"The bridge. Same SQL I write at work, now behind my own products." },
    { id:"razorpay", name:"Razorpay", era:"shipping", links:["nextjs"],
      note:"INR payments and UPI for Lores. Getting domestic activation through is its own skill." },
    { id:"gemini", name:"Gemini", era:"shipping", links:["nextjs","python"],
      note:"The analysis engine behind Lores. Prompt design turned out to be product design." },
    { id:"vercel", name:"Vercel", era:"shipping", links:["nextjs"],
      note:"Deploy target for both products. Preview URLs are how I make decisions." },
  ]},
  { id:"legacy", cap:"BANK C · LEGACY / HARDWARE", chips:[
    { id:"flutter", name:"Flutter", era:"thapar", links:["photogrammetry"],
      note:"The Android app for the photogrammetry scanner. First time I shipped something someone else used." },
    { id:"solidworks", name:"SolidWorks", era:"thapar", links:["photogrammetry"],
      note:"Modelled the 3D-printed scanner rig. Tolerances teach you that shipping is physical." },
    { id:"c", name:"C", era:"thapar", links:["python"],
      note:"Embedded work during the degree. Still the reason I think about what things cost to run." },
    { id:"photogrammetry", name:"Photogrammetry", era:"thapar", links:["flutter","solidworks"],
      note:"Photos in, 3D model out. The same shape as everything I've built since: messy input, readable output." },
  ]},
];

const ALL = BANKS.flatMap((b) => b.chips.map((c) => ({ ...c, bank: b.cap })));
const byId = (id) => ALL.find((c) => c.id === id);

export default function Stack() {
  const [sel, setSel] = useState(null);
  const boardRef = useRef(null);
  const chipRefs = useRef({});
  const [paths, setPaths] = useState([]);

  const active = sel ? byId(sel) : null;
  const ac = active ? ERA[active.era].c : "var(--cyan)";
  const linkSet = new Set(active ? active.links : []);

  /* route PCB traces from the active chip to each linked chip */
  const route = useCallback(() => {
    if (!sel || !boardRef.current) { setPaths([]); return; }
    const board = boardRef.current.getBoundingClientRect();
    const a = chipRefs.current[sel];
    if (!a) { setPaths([]); return; }
    const ar = a.getBoundingClientRect();
    const ax = ar.left - board.left + ar.width / 2;
    const ay = ar.top - board.top + ar.height / 2;

    const out = [];
    (byId(sel).links || []).forEach((lid) => {
      const b = chipRefs.current[lid]; if (!b) return;
      const br = b.getBoundingClientRect();
      const bx = br.left - board.left + br.width / 2;
      const by = br.top - board.top + br.height / 2;
      const midY = (ay + by) / 2;
      const ch = 7; // chamfer
      const dir = by > ay ? 1 : -1;
      const sx = bx > ax ? 1 : -1;
      // manhattan route with 45-degree corners, like real PCB routing
      const d = [
        `M ${ax} ${ay}`,
        `L ${ax} ${midY - dir * ch}`,
        `L ${ax + sx * ch} ${midY}`,
        `L ${bx - sx * ch} ${midY}`,
        `L ${bx} ${midY + dir * ch}`,
        `L ${bx} ${by}`,
      ].join(" ");
      out.push({ id: lid, d });
    });
    setPaths(out);
  }, [sel]);

  useEffect(() => { route(); }, [route]);
  useEffect(() => {
    const h = () => route();
    window.addEventListener("resize", h);
    const ro = new ResizeObserver(h);
    boardRef.current && ro.observe(boardRef.current);
    return () => { window.removeEventListener("resize", h); ro.disconnect(); };
  }, [route]);

  return (
    <div className="st" style={{ "--ac": ac }}>
      <style>{CSS}</style>
      <h2 className="sec-h disp">STACK</h2>
      <div className="sec-sub">INSTALLED MODULES · TAP A CHIP TO TRACE IT</div>

      <div className="layout">
        {/* ---------------- BOARD ---------------- */}
        <div className="board" ref={boardRef} style={{ "--ac": ac }}>
          <div className="bh">
            <span>BOARD REV 1.3 · {ALL.length} MODULES</span>
            <span>{active ? <>LINKED <b>{active.links.length}</b></> : "NO MODULE SELECTED"}</span>
          </div>

          <svg className="traces">
            {paths.map((p) => (
              <g key={p.id} style={{ "--tc": ac }}>
                <path className="tr" d={p.d} />
                <path className="tr-flow" d={p.d} />
              </g>
            ))}
          </svg>

          {BANKS.map((bank) => (
            <div className="bank" key={bank.id}>
              <div className="cap">{bank.cap}</div>
              <div className="grid">
                {bank.chips.map((c) => {
                  const on = sel === c.id;
                  const linked = linkSet.has(c.id);
                  const dim = sel && !on && !linked;
                  return (
                    <button key={c.id} ref={(el) => (chipRefs.current[c.id] = el)}
                      className={"chip" + (on ? " on" : linked ? " link" : dim ? " dim" : "")}
                      style={{ "--cc": ERA[c.era].c }}
                      onClick={() => setSel(on ? null : c.id)}
                      aria-pressed={on}
                      aria-label={`${c.name}, installed ${ERA[c.era].label}`}>
                      <i className="era" />
                      {c.name}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* ---------------- READOUT ---------------- */}
        <div className="read" style={{ "--ac": ac }}>
          {!active ? (
            <div className="idle">
              <div className="b">NO MODULE SELECTED</div>
              <div className="s">TAP A CHIP TO TRACE ITS CONNECTIONS</div>
            </div>
          ) : (
            <div key={active.id}>
              <div className="slot">{active.bank}</div>
              <h3 className="disp">{active.name}</h3>
              <div className="grp">INSTALLED · {ERA[active.era].label}</div>
              <p>{active.note}</p>
              <div className="kv"><span>MODULE</span><b>{active.name.toUpperCase()}</b></div>
              <div className="kv"><span>INSTALLED</span><b>{ERA[active.era].label}</b></div>
              <div className="kv"><span>LINKS</span><b>{active.links.length || "—"}</b></div>
              {active.links.length > 0 && (
                <div className="lk">
                  <div className="cap">▸ TRACED TO</div>
                  <div className="row">
                    {active.links.map((l) => (
                      <em key={l} onClick={() => setSel(l)}>{byId(l)?.name || l}</em>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="legend">
        {Object.entries(ERA).map(([k, v]) => (
          <span key={k}><i style={{ background: v.c }} />{v.label}</span>
        ))}
      </div>
    </div>
  );
}

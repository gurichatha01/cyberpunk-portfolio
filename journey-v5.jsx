import React, { useState, useEffect, useRef, useCallback } from "react";

/* =========================================================================
   JOURNEY v5 — simple and unbreakable.

   v4 measured the container with a ResizeObserver. That was unnecessary and
   fragile: if the module mounts hidden (inactive tab) the measurement is 0
   and NOTHING renders. A viewBox already gives resolution independence.

   So: FIXED viewBox. Amplitude is a fixed fraction of it, so it scales with
   whatever height the CSS gives the box. Nothing to measure, nothing to fail.
   Paths also get a `d` on first render, so the wave is never blank even
   before requestAnimationFrame runs.
   ========================================================================= */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

:root{
  --void:#05060a; --panel:#0b0e15; --panel2:#11151f; --line:#1c2230;
  --yellow:#fcee0a; --cyan:#00e5ff; --magenta:#ff2e6e; --green:#22f5a8;
  --ink:#e9edf5; --mute:#8794a8;
}
*{box-sizing:border-box;}
.jr,.jr *{font-family:'JetBrains Mono',ui-monospace,monospace;}
.disp{font-family:'Chakra Petch',sans-serif;}
.jr{background:radial-gradient(120% 90% at 50% -10%,#0c1020 0%,var(--void) 60%),var(--void);
  color:var(--ink);padding:24px clamp(16px,4vw,60px) 30px;min-height:100vh;max-width:100%;overflow-x:hidden;}

.sec-h{font-family:'Chakra Petch',sans-serif;font-weight:700;font-size:clamp(28px,6vw,46px);
  color:var(--ink);margin:0 0 3px;line-height:1;}
.sec-sub{color:var(--mute);font-size:clamp(9px,2.3vw,12px);letter-spacing:.24em;margin-bottom:16px;}

.scope{position:relative;border:1px solid var(--line);background:linear-gradient(180deg,#080b11,#04060a);
  padding:12px;margin-bottom:16px;overflow:hidden;
  clip-path:polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px));}
.shead{display:flex;justify-content:space-between;gap:10px;font-size:9px;letter-spacing:.18em;
  color:var(--mute);margin-bottom:8px;white-space:nowrap;overflow:hidden;}
.shead b{color:var(--ac);font-weight:500;}

/* CSS owns the height. The viewBox scales the wave to fit it. */
.plot{display:block;width:100%;height:clamp(130px,20vh,180px);}
.plot.vert{width:100%;height:clamp(360px,58vh,540px);}

.gridln{stroke:#131926;}
.wave-dim{fill:none;stroke:#28324a;stroke-linecap:round;stroke-linejoin:round;}
.wave-lit{fill:none;stroke:var(--ac);stroke-linecap:round;stroke-linejoin:round;
  filter:drop-shadow(0 0 4px var(--ac));}
.beam{fill:none;stroke:#fff;opacity:.42;stroke-linecap:round;}
.playhead{stroke:var(--ac);opacity:.4;stroke-dasharray:3 4;}
.nodedot{transition:r .2s;}

.jrow{display:flex;gap:6px;margin-bottom:16px;overflow-x:auto;padding-bottom:4px;
  scrollbar-width:none;-ms-overflow-style:none;}
.jrow::-webkit-scrollbar{display:none;}
.jchip{flex:none;border:1px solid var(--line);background:transparent;color:var(--mute);
  font-size:10.5px;letter-spacing:.1em;padding:11px 14px;cursor:pointer;transition:.16s;
  font-family:'JetBrains Mono',monospace;min-height:44px;}
.jchip:hover{color:var(--ink);border-color:var(--jc);}
.jchip.on{color:var(--void);background:var(--jc);border-color:var(--jc);font-weight:700;}

.mwrap{display:grid;grid-template-columns:62px 1fr;gap:12px;}
.mscroll{height:clamp(360px,58vh,540px);overflow-y:auto;overscroll-behavior:contain;
  scroll-snap-type:y mandatory;scrollbar-width:none;-ms-overflow-style:none;}
.mscroll::-webkit-scrollbar{display:none;}
.mcard{scroll-snap-align:center;scroll-snap-stop:always;margin-bottom:12px;}
.mcard:last-child{margin-bottom:0;}

.era{border:1px solid var(--line);background:linear-gradient(160deg,var(--panel),var(--panel2));
  padding:clamp(16px,4vw,26px);position:relative;transition:opacity .25s;
  clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));}
.era::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--ac);box-shadow:0 0 16px var(--ac);}
.era.off{opacity:.42;}
.era .top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:10px;}
.era .when{font-size:9.5px;letter-spacing:.2em;color:var(--mute);}
.era .org{font-family:'Chakra Petch',sans-serif;font-weight:700;font-size:clamp(23px,5.4vw,40px);
  color:var(--ink);line-height:1.02;margin:4px 0 3px;}
.era .rl{color:var(--ac);font-size:clamp(9.5px,2.5vw,12.5px);letter-spacing:.09em;line-height:1.5;}
.era .dur{font-size:9px;letter-spacing:.14em;color:var(--mute);border:1px solid var(--line);padding:6px 9px;white-space:nowrap;flex:none;}
.era p{color:#a8b2c4;font-size:clamp(12px,3vw,13.5px);line-height:1.62;max-width:620px;margin:0 0 14px;}
.era p b{color:var(--ink);font-weight:500;}
.augh{font-size:9px;letter-spacing:.22em;color:var(--mute);margin-bottom:8px;}
.augs{display:flex;gap:6px;flex-wrap:wrap;}
.aug{font-size:9.5px;letter-spacing:.06em;border:1px solid var(--ac);color:var(--ac);padding:6px 9px;opacity:.9;}
.footnote{margin-top:14px;font-size:9px;letter-spacing:.14em;color:var(--mute);text-align:center;opacity:.65;}
@media(prefers-reduced-motion:reduce){*{animation-duration:.001s!important;}}
`;

const ERAS = [
  { yr:"2019", when:"2019 — 2023", org:"THAPAR", role:"B.TECH · ELECTRONIC & COMPUTER ENGINEERING",
    dur:"4 YRS", nc:"#00e5ff", sig:{ freq:.030, harm:1, amp:.20, jit:.015 },
    body:<>Started in <b>hardware</b>, not software. Built a <b>3D-printed photogrammetry scanner</b> — SolidWorks for the rig, a Flutter app that turned a set of photos into a 3D model. Ran hospitality for the Thapar Adventure Club for three years.</>,
    augs:["Python","C","SolidWorks","Flutter","Team Lead"] },
  { yr:"2023", when:"JAN — AUG 2023", org:"MYLO", role:"PRODUCT ANALYST · INTERN",
    dur:"8 MOS", nc:"#22f5a8", sig:{ freq:.052, harm:2, amp:.38, jit:.035 },
    body:<>First contact with real product data, at India's #1 parenting platform — <b>10M+ users</b>. Learned that the interesting question is rarely the one you were handed, and a number with no decision attached is just trivia.</>,
    augs:["SQL","Product Metrics","Cohorts","Dashboards"] },
  { yr:"2023", when:"SEP 2023 — OCT 2024", org:"MYLO", role:"DATA ANALYST · FULL-TIME",
    dur:"1 YR 2 MOS", nc:"#22f5a8", sig:{ freq:.078, harm:2, amp:.58, jit:.06 },
    body:<>Owned analytics across <b>supply chain and D2C logistics</b>. Built P&L dashboards, modelled logistics cost, and ran a data audit that <b>recovered credit notes</b> nobody had noticed were owed. First time analysis turned directly into money.</>,
    augs:["BigQuery","Python","Cost Modelling","P&L","Data Audit"] },
  { yr:"2024", when:"OCT 2024 — PRESENT", org:"CRITEO", role:"DATA ANALYST · GCOC (APAC → AMS)",
    dur:"1 YR 11 MOS", nc:"#fcee0a", sig:{ freq:.105, harm:3, amp:.78, jit:.10 },
    body:<>Joined for <b>APAC</b>, now in the Global Client Operations Center for <b>AMS</b>. Adtech data at scale — performance metrics, query review, executive summaries — plus onboarding new analysts. Learned to make numbers legible to people who don't want numbers.</>,
    augs:["Hive","Tableau","Power BI","Adtech","Stakeholder Comms"] },
  { yr:"2026", when:"2026 — PRESENT", org:"SHIPPING", role:"INDIE PRODUCT BUILDER",
    dur:"ONGOING", nc:"#ff2e6e", sig:{ freq:.140, harm:4, amp:1, jit:.16 },
    body:<>Stopped leaving things in a GitHub repo. Shipped <b>Aux'd</b> and <b>Lores</b> end to end — idea, UX, database, auth, payments, deploy. The hard part was never the code; it was deciding what belongs in v1. Same instinct as the 2020 scanner, six years of tooling later.</>,
    augs:["Next.js","TypeScript","Supabase","Razorpay","Gemini","Shipping"] },
];
const SEG = ERAS.length - 1;

/* ---- fixed coordinate systems. amplitude is a fraction of these. ---- */
const HZ = { along: 1000, across: 200 };   // horizontal: viewBox 0 0 1000 200
const VT = { along: 1000, across: 200 };   // vertical:   viewBox 0 0 200 1000
const HEADROOM = 0.86;                     // wave uses at most 86% of half-height

const HW  = [1, .42, .24, .13];
const HMUL= [1, 2.3, 4.1, 7.3];
const HPH = [1, 1.7, 2.6, 3.4];

function sigAt(t) {
  const p = Math.min(SEG, Math.max(0, t * SEG));
  const i = Math.floor(p), f = p - i;
  const a = ERAS[i].sig, b = ERAS[Math.min(SEG, i + 1)].sig;
  return {
    freq: a.freq + (b.freq - a.freq) * f,
    harm: a.harm + (b.harm - a.harm) * f,
    amp:  a.amp  + (b.amp  - a.amp)  * f,
    jit:  a.jit  + (b.jit  - a.jit)  * f,
  };
}
const nodeWindow = (u) => Math.pow(Math.abs(Math.sin(Math.PI * u * SEG)), .55);

/* guaranteed within +/- maxAmp: harmonics are normalised, then clamped */
function sample(u, phase, maxAmp) {
  const s = sigAt(u);
  const x = u * 1000;
  let v = 0, norm = 0;
  for (let h = 0; h < 4; h++) {
    const present = Math.min(1, Math.max(0, s.harm - h));
    if (present <= 0) continue;
    const w = HW[h] * present;
    v += Math.sin(x * s.freq * HMUL[h] + phase * HPH[h]) * w;
    norm += w;
  }
  v += Math.sin(x * 1.35 + phase * 4.2) * s.jit;
  norm += s.jit;
  v = norm > 0 ? v / norm : 0;
  v = Math.max(-1, Math.min(1, v));
  const env = .12 + Math.pow(u, 1.4) * .88;
  return v * env * s.amp * nodeWindow(u) * maxAmp;
}

/* build a path in the FIXED viewBox space */
function buildPath(phase, from, to, vertical) {
  const G = vertical ? VT : HZ;
  const centre = G.across / 2;
  const maxAmp = centre * HEADROOM;
  const steps = vertical ? 420 : 340;
  const a0 = Math.max(0, Math.floor(from * steps));
  const a1 = Math.min(steps, Math.ceil(to * steps));
  if (a1 <= a0) return "";
  const pts = [];
  for (let k = a0; k <= a1; k++) {
    const u = k / steps;
    const off = sample(u, phase, maxAmp);
    const px = vertical ? (centre + off) : (u * G.along);
    const py = vertical ? (u * G.along)  : (centre - off);
    pts.push((k === a0 ? "M" : "L") + px.toFixed(1) + " " + py.toFixed(1));
  }
  return pts.join(" ");
}

const useMedia = (q) => {
  const [m, setM] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(q);
    const h = () => setM(mq.matches); h();
    mq.addEventListener("change", h);
    return () => mq.removeEventListener("change", h);
  }, [q]);
  return m;
};

export default function Journey() {
  const [era, setEra] = useState(0);
  const isMobile = useMedia("(max-width: 760px)");
  const reduce = useMedia("(prefers-reduced-motion: reduce)");
  const E = ERAS[era];

  const litRef = useRef(null), dimRef = useRef(null), beamRef = useRef(null);
  const scrollRef = useRef(null), cardRefs = useRef([]);
  const progRef = useRef(0);

  useEffect(() => { if (!isMobile) progRef.current = era / SEG; }, [era, isMobile]);

  const onScroll = useCallback(() => {
    const el = scrollRef.current; if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    progRef.current = max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0;
    const mid = el.scrollTop + el.clientHeight / 2;
    let best = 0, bd = Infinity;
    cardRefs.current.forEach((c, i) => {
      if (!c) return;
      const d = Math.abs(c.offsetTop + c.offsetHeight / 2 - mid);
      if (d < bd) { bd = d; best = i; }
    });
    setEra((p) => (p === best ? p : best));
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const el = scrollRef.current; if (!el) return;
    let tick = false;
    const h = () => { if (tick) return; tick = true;
      requestAnimationFrame(() => { onScroll(); tick = false; }); };
    el.addEventListener("scroll", h, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", h);
  }, [isMobile, onScroll]);

  useEffect(() => {
    let raf, stop = false;
    const t0 = performance.now();
    const frame = (now) => {
      if (stop) return;
      const phase = reduce ? 0 : ((now - t0) / 1000) * 1.05;
      const p = progRef.current;
      dimRef.current && dimRef.current.setAttribute("d", buildPath(phase, 0, 1, isMobile));
      litRef.current && litRef.current.setAttribute("d", buildPath(phase, 0, Math.max(.004, p), isMobile));
      if (beamRef.current) {
        if (reduce) beamRef.current.setAttribute("d", "");
        else {
          const bu = ((now - t0) / 3000) % 1;
          beamRef.current.setAttribute("d", buildPath(phase, Math.max(0, bu - .06), bu, isMobile));
        }
      }
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { stop = true; cancelAnimationFrame(raf); };
  }, [isMobile, reduce]);

  /* static first-paint paths — the wave is NEVER blank, even before rAF */
  const initDim = buildPath(0, 0, 1, isMobile);
  const initLit = buildPath(0, 0, Math.max(.004, era / SEG), isMobile);

  const G = isMobile ? VT : HZ;
  const centre = G.across / 2;
  const pos = (i) => (i / SEG) * G.along;

  const EraCard = ({ e, dim }) => (
    <div className={"era" + (dim ? " off" : "")} style={{ "--ac": e.nc }}>
      <div className="top">
        <div>
          <div className="when">{e.when}</div>
          <div className="org disp">{e.org}</div>
          <div className="rl">{e.role}</div>
        </div>
        <div className="dur">{e.dur}</div>
      </div>
      <p>{e.body}</p>
      <div className="augh">▸ AUGMENTS INSTALLED</div>
      <div className="augs">{e.augs.map((a) => <span className="aug" key={a}>{a}</span>)}</div>
    </div>
  );

  const Plot = () => (
    <svg
      className={"plot" + (isMobile ? " vert" : "")}
      viewBox={isMobile ? `0 0 ${VT.across} ${VT.along}` : `0 0 ${HZ.along} ${HZ.across}`}
      preserveAspectRatio="none">
      {ERAS.map((_, i) => (
        isMobile
          ? <line key={i} className="gridln" x1="4" y1={pos(i)} x2={G.across - 4} y2={pos(i)} vectorEffect="non-scaling-stroke" />
          : <line key={i} className="gridln" x1={pos(i)} y1="0" x2={pos(i)} y2={G.across} vectorEffect="non-scaling-stroke" />
      ))}
      {!isMobile && (
        <>
          <line className="gridln" x1="0" y1={centre} x2={G.along} y2={centre} vectorEffect="non-scaling-stroke" />
          <line className="playhead" x1={pos(era)} y1="0" x2={pos(era)} y2={G.across} vectorEffect="non-scaling-stroke" />
        </>
      )}
      <path ref={dimRef} className="wave-dim" d={initDim} strokeWidth="1.4" vectorEffect="non-scaling-stroke" />
      <path ref={litRef} className="wave-lit" d={initLit} strokeWidth="1.9" vectorEffect="non-scaling-stroke" />
      <path ref={beamRef} className="beam" strokeWidth="1.7" vectorEffect="non-scaling-stroke" />
      {ERAS.map((e, i) => {
        const cx = isMobile ? centre : pos(i);
        const cy = isMobile ? pos(i) : centre;
        return (
          <g key={i} onClick={() => !isMobile && setEra(i)} style={{ cursor: isMobile ? "default" : "pointer" }}>
            {!isMobile && <rect x={cx - 30} y="0" width="60" height={G.across} fill="transparent" />}
            <circle className="nodedot" cx={cx} cy={cy} r={i === era ? 7 : 5}
              fill={i <= era ? e.nc : "#0a0e14"} stroke={e.nc}
              strokeWidth="2" vectorEffect="non-scaling-stroke"
              style={i === era ? { filter: `drop-shadow(0 0 9px ${e.nc})` } : undefined} />
          </g>
        );
      })}
    </svg>
  );

  return (
    <div className="jr" style={{ "--ac": E.nc }}>
      <style>{CSS}</style>
      <h2 className="sec-h disp">JOURNEY</h2>
      <div className="sec-sub">HARDWARE → DATA → PRODUCT</div>

      {isMobile ? (
        <div className="scope" style={{ "--ac": E.nc, padding: "12px 10px" }}>
          <div className="shead">
            <span>SIGNAL LOG</span>
            <span>DENSITY <b>{Math.round(E.sig.amp * 100)}%</b></span>
          </div>
          <div className="mwrap">
            <Plot />
            <div className="mscroll" ref={scrollRef}>
              {ERAS.map((e, i) => (
                <div className="mcard" key={i} ref={(el) => (cardRefs.current[i] = el)}>
                  <EraCard e={e} dim={i !== era} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="scope" style={{ "--ac": E.nc }}>
            <div className="shead">
              <span>SIGNAL LOG · 2019 → NOW</span>
              <span>DENSITY <b>{Math.round(E.sig.amp * 100)}%</b> · HARMONICS <b>{Math.round(E.sig.harm)}</b></span>
            </div>
            <Plot />
          </div>
          <div className="jrow">
            {ERAS.map((e, i) => (
              <button key={i} className={"jchip" + (i === era ? " on" : "")}
                style={{ "--jc": e.nc }} onClick={() => setEra(i)} aria-pressed={i === era}>
                {e.org} · {e.yr}
              </button>
            ))}
          </div>
          <EraCard e={E} dim={false} />
        </>
      )}

      <div className="footnote">
        {isMobile ? "SCROLL TO ADVANCE · THE SIGNAL FILLS AS YOU GO"
                  : "ONE THING AT A TIME IN 2019 · FOUR AT ONCE NOW"}
      </div>
    </div>
  );
}

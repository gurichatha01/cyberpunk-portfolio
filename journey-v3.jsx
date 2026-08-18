import React, { useState, useEffect, useRef, useCallback } from "react";

/* =========================================================================
   JOURNEY v3
   · waveform pinches to a zero-crossing exactly at every node  -> aligned
   · sample step measured in PIXELS -> no aliasing at the dense end
   · MOBILE: scroll-snap era cards; scrolling fills the signal continuously
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
  color:var(--ink);padding:24px clamp(16px,4vw,60px) 30px;min-height:100vh;}

.sec-h{font-family:'Chakra Petch',sans-serif;font-weight:700;font-size:clamp(28px,6vw,46px);
  color:var(--ink);margin:0 0 3px;line-height:1;}
.sec-sub{color:var(--mute);font-size:clamp(9px,2.3vw,12px);letter-spacing:.24em;margin-bottom:16px;}

.scope{position:relative;border:1px solid var(--line);background:linear-gradient(180deg,#080b11,#04060a);
  padding:12px;margin-bottom:16px;overflow:hidden;
  clip-path:polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px));}
.shead{display:flex;justify-content:space-between;gap:10px;font-size:9px;letter-spacing:.18em;
  color:var(--mute);margin-bottom:8px;white-space:nowrap;}
.shead b{color:var(--ac);font-weight:500;}
.scope svg{display:block;width:100%;}

.gridln{stroke:#131926;stroke-width:1;}
.wave-dim{fill:none;stroke:#28324a;stroke-width:1.4;stroke-linecap:round;stroke-linejoin:round;}
.wave-lit{fill:none;stroke:var(--ac);stroke-width:1.9;stroke-linecap:round;stroke-linejoin:round;
  filter:drop-shadow(0 0 4px var(--ac));}
.beam{fill:none;stroke:#fff;stroke-width:1.7;opacity:.45;stroke-linecap:round;}
.playhead{stroke:var(--ac);stroke-width:1;opacity:.4;stroke-dasharray:3 4;}
.nodedot{stroke-width:2;pointer-events:none;transition:r .2s;}
.yr{font-size:10px;letter-spacing:.08em;pointer-events:none;}

/* ---------- MOBILE ---------- */
.mwrap{display:grid;grid-template-columns:66px 1fr;gap:12px;}
.mscroll{height:62vh;min-height:400px;overflow-y:auto;overscroll-behavior:contain;
  scroll-snap-type:y mandatory;scrollbar-width:none;-ms-overflow-style:none;
  padding-right:2px;}
.mscroll::-webkit-scrollbar{display:none;}
.mcard{scroll-snap-align:center;scroll-snap-stop:always;margin-bottom:12px;}
.mcard:last-child{margin-bottom:0;}

/* ---------- desktop chips ---------- */
.jrow{display:flex;gap:6px;margin-bottom:16px;overflow-x:auto;padding-bottom:4px;
  scrollbar-width:none;-ms-overflow-style:none;}
.jrow::-webkit-scrollbar{display:none;}
.jchip{flex:none;border:1px solid var(--line);background:transparent;color:var(--mute);
  font-size:10.5px;letter-spacing:.1em;padding:11px 14px;cursor:pointer;transition:.16s;
  font-family:'JetBrains Mono',monospace;min-height:44px;}
.jchip:hover{color:var(--ink);border-color:var(--jc);}
.jchip.on{color:var(--void);background:var(--jc);border-color:var(--jc);font-weight:700;}

/* ---------- era card ---------- */
.era{border:1px solid var(--line);background:linear-gradient(160deg,var(--panel),var(--panel2));
  padding:clamp(16px,4vw,26px);position:relative;transition:border-color .25s,opacity .25s;
  clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));}
.era::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--ac);
  box-shadow:0 0 16px var(--ac);transition:.25s;}
.era.off{opacity:.42;}
.era.off::before{opacity:.35;box-shadow:none;}
.era .top{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:10px;}
.era .when{font-size:9.5px;letter-spacing:.2em;color:var(--mute);}
.era .org{font-family:'Chakra Petch',sans-serif;font-weight:700;font-size:clamp(23px,5.4vw,40px);
  color:var(--ink);line-height:1.02;margin:4px 0 3px;}
.era .rl{color:var(--ac);font-size:clamp(9.5px,2.5vw,12.5px);letter-spacing:.09em;line-height:1.5;}
.era .dur{font-size:9px;letter-spacing:.14em;color:var(--mute);border:1px solid var(--line);
  padding:6px 9px;white-space:nowrap;flex:none;}
.era p{color:#a8b2c4;font-size:clamp(12px,3vw,13.5px);line-height:1.62;max-width:620px;margin:0 0 14px;}
.era p b{color:var(--ink);font-weight:500;}
.augh{font-size:9px;letter-spacing:.22em;color:var(--mute);margin-bottom:8px;}
.augs{display:flex;gap:6px;flex-wrap:wrap;}
.aug{font-size:9.5px;letter-spacing:.06em;border:1px solid var(--ac);color:var(--ac);padding:6px 9px;opacity:.9;}

.footnote{margin-top:14px;font-size:9px;letter-spacing:.14em;color:var(--mute);text-align:center;opacity:.65;line-height:1.6;}
@media(prefers-reduced-motion:reduce){*{animation-duration:.001s!important;}}
`;

const ERAS = [
  { yr:"2019", when:"2019 — 2023", org:"THAPAR", role:"B.TECH · ELECTRONIC & COMPUTER ENGINEERING",
    dur:"4 YRS", nc:"#00e5ff",
    sig:{ freq:.030, harm:1, amp:.20, jit:.015 },
    body:<>Started in <b>hardware</b>, not software. Built a <b>3D-printed photogrammetry scanner</b> — SolidWorks for the rig, a Flutter app that turned a set of photos into a 3D model. Ran hospitality for the Thapar Adventure Club for three years.</>,
    augs:["Python","C","SolidWorks","Flutter","Team Lead"] },
  { yr:"2023", when:"JAN — AUG 2023", org:"MYLO", role:"PRODUCT ANALYST · INTERN",
    dur:"8 MOS", nc:"#22f5a8",
    sig:{ freq:.052, harm:2, amp:.38, jit:.035 },
    body:<>First contact with real product data, at India's #1 parenting platform — <b>10M+ users</b>. Learned that the interesting question is rarely the one you were handed, and a number with no decision attached is just trivia.</>,
    augs:["SQL","Product Metrics","Cohorts","Dashboards"] },
  { yr:"2023", when:"SEP 2023 — OCT 2024", org:"MYLO", role:"DATA ANALYST · FULL-TIME",
    dur:"1 YR 2 MOS", nc:"#22f5a8",
    sig:{ freq:.078, harm:2, amp:.58, jit:.06 },
    body:<>Owned analytics across <b>supply chain and D2C logistics</b>. Built P&L dashboards, modelled logistics cost, and ran a data audit that <b>recovered credit notes</b> nobody had noticed were owed. First time analysis turned directly into money.</>,
    augs:["BigQuery","Python","Cost Modelling","P&L","Data Audit"] },
  { yr:"2024", when:"OCT 2024 — PRESENT", org:"CRITEO", role:"DATA ANALYST · GCOC (APAC → AMS)",
    dur:"1 YR 11 MOS", nc:"#fcee0a",
    sig:{ freq:.105, harm:3, amp:.78, jit:.10 },
    body:<>Joined for <b>APAC</b>, now in the Global Client Operations Center for <b>AMS</b>. Adtech data at scale — performance metrics, query review, executive summaries — plus onboarding new analysts. Learned to make numbers legible to people who don't want numbers.</>,
    augs:["Hive","Tableau","Power BI","Adtech","Stakeholder Comms"] },
  { yr:"2026", when:"2026 — PRESENT", org:"SHIPPING", role:"INDIE PRODUCT BUILDER",
    dur:"ONGOING", nc:"#ff2e6e",
    sig:{ freq:.140, harm:4, amp:1, jit:.16 },
    body:<>Stopped leaving things in a GitHub repo. Shipped <b>Aux'd</b> and <b>Lores</b> end to end — idea, UX, database, auth, payments, deploy. The hard part was never the code; it was deciding what belongs in v1. Same instinct as the 2020 scanner, six years of tooling later.</>,
    augs:["Next.js","TypeScript","Supabase","Razorpay","Gemini","Shipping"] },
];
const N = ERAS.length;
const SEG = N - 1;

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

/* window: exactly 0 at every node position -> the wave crosses the axis on each marker */
function nodeWindow(u) {
  return Math.pow(Math.abs(Math.sin(Math.PI * u * SEG)), 0.55);
}

function sample(u, phase, maxAmp) {
  const s = sigAt(u);
  const x = u * 1000;
  let v = Math.sin(x * s.freq + phase);
  if (s.harm > 1) v += Math.sin(x * s.freq * 2.3 + phase * 1.7) * .42 * Math.min(1, s.harm - 1);
  if (s.harm > 2) v += Math.sin(x * s.freq * 4.1 + phase * 2.6) * .24 * Math.min(1, s.harm - 2);
  if (s.harm > 3) v += Math.sin(x * s.freq * 7.3 + phase * 3.4) * .13 * Math.min(1, s.harm - 3);
  v += Math.sin(x * 1.35 + phase * 4.2) * s.jit;
  const env = .12 + Math.pow(u, 1.4) * .88;
  return v * env * s.amp * nodeWindow(u) * maxAmp * 0.62;
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

/* geometry */
const V = { w: 66, cx: 33, h: 660, amp: 27, step: 1.4 };
const H = { w: 1000, cy: 95, h: 190, amp: 66, step: 2.0 };

export default function Journey() {
  const [era, setEra] = useState(0);
  const isMobile = useMedia("(max-width: 760px)");
  const reduce = useMedia("(prefers-reduced-motion: reduce)");
  const E = ERAS[era];

  const litRef = useRef(null), dimRef = useRef(null), beamRef = useRef(null);
  const scrollRef = useRef(null);
  const cardRefs = useRef([]);
  const progRef = useRef(0);

  /* desktop: progress follows selection */
  useEffect(() => {
    if (!isMobile) progRef.current = era / SEG;
  }, [era, isMobile]);

  /* mobile: progress follows scroll, continuously */
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
    const h = () => {
      if (tick) return; tick = true;
      requestAnimationFrame(() => { onScroll(); tick = false; });
    };
    el.addEventListener("scroll", h, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", h);
  }, [isMobile, onScroll]);

  /* the living trace */
  useEffect(() => {
    let raf, stop = false;
    const t0 = performance.now();
    const G = isMobile ? V : H;
    const total = isMobile ? G.h : G.w;
    const steps = Math.ceil(total / G.step);

    const build = (phase, from, to) => {
      const a0 = Math.max(0, Math.floor(from * steps));
      const a1 = Math.min(steps, Math.ceil(to * steps));
      if (a1 <= a0) return "";
      const pts = [];
      for (let k = a0; k <= a1; k++) {
        const u = k / steps;
        const off = sample(u, phase, G.amp);
        const px = isMobile ? (G.cx + off) : (u * G.w);
        const py = isMobile ? (u * G.h) : (G.cy - off);
        pts.push((k === a0 ? "M" : "L") + px.toFixed(1) + " " + py.toFixed(1));
      }
      return pts.join(" ");
    };

    const frame = (now) => {
      if (stop) return;
      const phase = reduce ? 0 : ((now - t0) / 1000) * 1.05;
      const p = progRef.current;
      dimRef.current && dimRef.current.setAttribute("d", build(phase, 0, 1));
      litRef.current && litRef.current.setAttribute("d", build(phase, 0, Math.max(.004, p)));
      if (beamRef.current) {
        if (reduce) beamRef.current.setAttribute("d", "");
        else {
          const bu = ((now - t0) / 3000) % 1;
          beamRef.current.setAttribute("d", build(phase, Math.max(0, bu - .06), bu));
        }
      }
      if (!reduce) raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => { stop = true; cancelAnimationFrame(raf); };
  }, [isMobile, reduce]);

  const scrollTo = (i) => {
    const c = cardRefs.current[i];
    if (c) c.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const EraCard = ({ e, i, dim }) => (
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

  return (
    <div className="jr" style={{ "--ac": E.nc }}>
      <style>{CSS}</style>
      <h2 className="sec-h disp">JOURNEY</h2>
      <div className="sec-sub">HARDWARE → DATA → PRODUCT</div>

      {isMobile ? (
        <div className="scope" style={{ "--ac": E.nc, padding: "12px 10px" }}>
          <div className="shead">
            <span>SIGNAL LOG</span>
            <span>DENSITY <b>{Math.round(E.sig.amp * 100)}%</b> · HARM <b>{Math.round(E.sig.harm)}</b></span>
          </div>
          <div className="mwrap">
            <svg viewBox={`0 0 ${V.w} ${V.h}`} preserveAspectRatio="none"
                 style={{ height: "62vh", minHeight: 400 }} aria-hidden="true">
              {ERAS.map((_, i) => (
                <line key={i} className="gridln" x1="3" y1={(i / SEG) * V.h} x2={V.w - 3} y2={(i / SEG) * V.h} />
              ))}
              <path ref={dimRef} className="wave-dim" vectorEffect="non-scaling-stroke" />
              <path ref={litRef} className="wave-lit" vectorEffect="non-scaling-stroke" />
              <path ref={beamRef} className="beam" vectorEffect="non-scaling-stroke" />
              {ERAS.map((e, i) => (
                <circle key={i} className="nodedot" cx={V.cx} cy={(i / SEG) * V.h}
                  r={i === era ? 8 : 5.5} fill={i <= era ? e.nc : "#0a0e14"} stroke={e.nc}
                  vectorEffect="non-scaling-stroke"
                  style={i === era ? { filter: `drop-shadow(0 0 8px ${e.nc})` } : undefined} />
              ))}
            </svg>

            <div className="mscroll" ref={scrollRef}>
              {ERAS.map((e, i) => (
                <div className="mcard" key={i} ref={(el) => (cardRefs.current[i] = el)}>
                  <EraCard e={e} i={i} dim={i !== era} />
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
            <svg viewBox={`0 0 ${H.w} ${H.h}`} preserveAspectRatio="none" style={{ height: H.h }}>
              {[25, 95, 165].map((y) => <line key={y} className="gridln" x1="0" y1={y} x2={H.w} y2={y} />)}
              {ERAS.map((_, i) => (
                <line key={i} className="gridln" x1={(i / SEG) * H.w} y1="6" x2={(i / SEG) * H.w} y2="184" />
              ))}
              <line className="playhead" x1={(era / SEG) * H.w} y1="6" x2={(era / SEG) * H.w} y2="184"
                vectorEffect="non-scaling-stroke" />
              <path ref={dimRef} className="wave-dim" vectorEffect="non-scaling-stroke" />
              <path ref={litRef} className="wave-lit" vectorEffect="non-scaling-stroke" />
              <path ref={beamRef} className="beam" vectorEffect="non-scaling-stroke" />
              {ERAS.map((e, i) => {
                const x = (i / SEG) * H.w;
                return (
                  <g key={i} onClick={() => setEra(i)} style={{ cursor: "pointer" }}>
                    <rect x={x - 30} y="6" width="60" height="178" fill="transparent" />
                    <circle className="nodedot" cx={x} cy={H.cy} r={i === era ? 8 : 6}
                      fill={i <= era ? e.nc : "#0a0e14"} stroke={e.nc} vectorEffect="non-scaling-stroke"
                      style={i === era ? { filter: `drop-shadow(0 0 10px ${e.nc})` } : undefined} />
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="jrow">
            {ERAS.map((e, i) => (
              <button key={i} className={"jchip" + (i === era ? " on" : "")}
                style={{ "--jc": e.nc }} onClick={() => setEra(i)} aria-pressed={i === era}>
                {e.org} · {e.yr}
              </button>
            ))}
          </div>

          <EraCard e={E} i={era} dim={false} />
        </>
      )}

      <div className="footnote">
        {isMobile
          ? "SCROLL TO ADVANCE · THE SIGNAL FILLS AS YOU GO"
          : "ONE THING AT A TIME IN 2019 · FOUR AT ONCE NOW"}
      </div>
    </div>
  );
}

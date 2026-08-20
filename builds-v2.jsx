import React, { useState, useEffect, useRef } from "react";

/* =========================================================================
   BUILDS v2
   DESKTOP : deck + readout, two columns (unchanged — it works)
   MOBILE  : NO deck box, NO empty readout. The cassette IS the container.
             Full-width tapes; tap one and it expands in place — reels spin,
             VU lives, project readout unfolds inside the same card.
   ========================================================================= */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

:root{
  --void:#05060a; --panel:#0b0e15; --panel2:#11151f; --line:#1c2230;
  --yellow:#fcee0a; --cyan:#00e5ff; --magenta:#ff2e6e; --green:#22f5a8;
  --ink:#e9edf5; --mute:#8794a8;
}
*{box-sizing:border-box;}
.bd,.bd *{font-family:'JetBrains Mono',ui-monospace,monospace;}
.disp{font-family:'Chakra Petch',sans-serif;}
.bd{background:radial-gradient(120% 90% at 50% -10%,#0c1020 0%,var(--void) 60%),var(--void);
  color:var(--ink);padding:24px clamp(14px,4vw,60px) 40px;min-height:100vh;
  max-width:100%;overflow-x:hidden;}

.sec-h{font-family:'Chakra Petch',sans-serif;font-weight:700;font-size:clamp(28px,6vw,46px);
  color:var(--ink);margin:0 0 3px;line-height:1;}
.sec-sub{color:var(--mute);font-size:clamp(9px,2.3vw,12px);letter-spacing:.22em;margin-bottom:18px;}

/* ================= MOBILE : expanding tapes ================= */
.tapes{display:flex;flex-direction:column;gap:12px;}
.card{border:1px solid var(--line);background:linear-gradient(160deg,#12161f,#080a10);
  overflow:hidden;transition:border-color .25s;position:relative;
  clip-path:polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px));}
.card.open{border-color:var(--ac);}
.card::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--ac);
  transform:scaleY(0);transform-origin:top;transition:transform .35s;z-index:3;}
.card.open::before{transform:scaleY(1);box-shadow:0 0 16px var(--ac);}

/* the tape face — always visible, acts as the button */
.face{width:100%;background:transparent;border:0;padding:14px;cursor:pointer;text-align:left;
  display:block;font-family:'JetBrains Mono',monospace;}
.mcass{position:relative;border-radius:5px;padding:12px;
  background:linear-gradient(160deg,#232a34,#0e1218);border:1px solid #2f3745;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.07);}
.mcass .screw{position:absolute;width:5px;height:5px;border-radius:50%;background:#3d4552;}
.mcass .screw.a{top:6px;left:6px}.mcass .screw.b{top:6px;right:6px}
.mcass .screw.c{bottom:6px;left:6px}.mcass .screw.d{bottom:6px;right:6px}
.mlbl{position:relative;background:linear-gradient(150deg,#e9e6dc,#c6c4ba);border-radius:2px;
  padding:9px 12px 9px 16px;overflow:hidden;margin-bottom:10px;}
.mlbl .stripe{position:absolute;left:0;top:0;bottom:0;width:6px;background:var(--ac);}
.mlbl .t{font-family:'Chakra Petch',sans-serif;font-weight:700;font-size:24px;color:#12151b;line-height:1;}
.mlbl .s{font-size:8px;letter-spacing:.16em;color:#5c5f66;margin-top:3px;}
.mlbl .tag{font-size:8.5px;letter-spacing:.1em;color:#3f434b;margin-top:5px;}
.mwin{background:#05070b;border:1px solid #262d39;border-radius:3px;height:44px;
  display:flex;align-items:center;justify-content:space-between;padding:0 14px;gap:12px;}
.hub{width:26px;height:26px;border-radius:50%;border:2px solid #39414f;flex:none;
  background:radial-gradient(circle,#0a0d12 34%,#1a1f28 36%);position:relative;}
.hub::after{content:"";position:absolute;inset:5px;border-radius:50%;
  background:conic-gradient(from 0deg,#2c3340 0 25%,#151a22 0 50%,#2c3340 0 75%,#151a22 0);}
.card.open .hub::after{animation:spin 1.7s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
.band{flex:1;height:13px;background:linear-gradient(#2a1d12,#160f08);border-radius:2px;}

/* status strip under the tape face */
.strip{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:10px;}
.stat{font-size:9px;letter-spacing:.18em;color:var(--mute);display:flex;align-items:center;gap:7px;}
.led{width:7px;height:7px;border-radius:50%;background:#2a3040;transition:.3s;}
.card.open .led{background:var(--ac);box-shadow:0 0 10px var(--ac);}
.vu{display:flex;gap:2px;align-items:flex-end;height:14px;flex:1;max-width:120px;}
.vu i{flex:1;background:#1a2130;height:16%;}
.card.open .vu i{background:var(--ac);animation:vu .55s infinite alternate;}
.card.open .vu i:nth-child(2n){animation-duration:.4s}
.card.open .vu i:nth-child(3n){animation-duration:.72s}
@keyframes vu{from{height:16%}to{height:100%}}
.hintx{font-size:9px;letter-spacing:.16em;color:var(--ac);white-space:nowrap;}

/* expanding body — grid trick, animates cleanly */
.body{display:grid;grid-template-rows:0fr;transition:grid-template-rows .38s cubic-bezier(.4,0,.2,1);}
.card.open .body{grid-template-rows:1fr;}
.body > .inner{overflow:hidden;min-height:0;}
.pad{padding:2px 14px 16px;}
.ro-tag{color:var(--ac);font-size:10.5px;letter-spacing:.14em;margin-bottom:10px;}
.ro-p{color:#a8b2c4;font-size:12.5px;line-height:1.65;margin:0 0 14px;}
.ro-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(96px,1fr));gap:8px;margin-bottom:14px;}
.ro-cell{border:1px solid var(--line);padding:9px 10px;}
.ro-cell span{display:block;font-size:8.5px;letter-spacing:.16em;color:var(--mute);margin-bottom:3px;}
.ro-cell b{font-size:11px;color:var(--ink);font-weight:500;}
.ro-stack{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:16px;}
.ro-stack em{font-style:normal;font-size:9.5px;letter-spacing:.06em;border:1px solid var(--line);padding:5px 8px;color:var(--mute);}
.acts{display:flex;gap:8px;}
.access{flex:1;display:flex;align-items:center;justify-content:center;font-family:'Chakra Petch',sans-serif;
  font-weight:700;font-size:12.5px;letter-spacing:.12em;padding:14px 10px;min-height:48px;
  border:1px solid var(--ac);color:var(--ac);text-decoration:none;transition:.18s;
  clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));}
.access:active{background:var(--ac);color:var(--void);}
.ejectb{border:1px solid var(--line);background:transparent;color:var(--mute);font-size:10px;
  letter-spacing:.14em;padding:0 16px;min-height:48px;cursor:pointer;font-family:'JetBrains Mono',monospace;}

/* ================= DESKTOP ================= */
.deckwrap{display:grid;grid-template-columns:minmax(280px,340px) 1fr;gap:24px;align-items:start;}
.deck{border:1px solid var(--line);padding:18px;background:linear-gradient(165deg,#12161f,#080a10);
  clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));}
.dhead{display:flex;justify-content:space-between;font-size:10px;letter-spacing:.22em;color:var(--mute);margin-bottom:12px;}
.slot{position:relative;height:150px;background:#04060a;border:1px solid #171d29;
  box-shadow:inset 0 6px 22px rgba(0,0,0,.95);display:flex;align-items:center;justify-content:center;overflow:hidden;}
.slotempty{font-size:11px;letter-spacing:.26em;color:#2b3444;}
.dcass{width:224px;height:138px;border-radius:5px;position:relative;flex:none;cursor:pointer;
  background:linear-gradient(160deg,#232a34,#0e1218);border:1px solid #2f3745;transition:.18s;}
.dcass:hover{transform:translateY(-5px);border-color:var(--ac);}
.dcass .dl{position:absolute;top:12px;left:12px;right:12px;height:52px;background:linear-gradient(150deg,#e9e6dc,#c6c4ba);
  border-radius:2px;padding:6px 9px 6px 14px;overflow:hidden;}
.dcass .dl .stripe{position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--ac);}
.dcass .dl .t{font-family:'Chakra Petch',sans-serif;font-weight:700;font-size:21px;color:#12151b;line-height:1;}
.dcass .dl .s{font-size:8px;letter-spacing:.16em;color:#5c5f66;margin-top:3px;}
.dcass .dw{position:absolute;bottom:14px;left:12px;right:12px;height:52px;background:#05070b;
  border:1px solid #262d39;border-radius:3px;display:flex;align-items:center;justify-content:space-around;padding:0 10px;}
.dcass.seated .hub::after{animation:spin 1.7s linear infinite;}
.dcass.loading{animation:insert .8s cubic-bezier(.5,0,.2,1) both;}
@keyframes insert{0%{transform:translateY(-120px) rotate(-5deg);opacity:0}30%{opacity:1}
  72%{transform:translateY(6px)}86%{transform:translateY(-2px)}100%{transform:translateY(0)}}
.transport{display:flex;gap:6px;margin-top:14px;}
.tbtn{flex:1;border:1px solid var(--line);background:#0a0e14;color:var(--mute);font-size:10px;
  letter-spacing:.14em;padding:10px 0;cursor:pointer;font-family:'JetBrains Mono',monospace;}
.tbtn:disabled{opacity:.28;cursor:default;}
.shelfrow{display:flex;gap:14px;flex-wrap:wrap;margin-top:20px;}
.readout{border:1px solid var(--line);background:linear-gradient(160deg,var(--panel),var(--panel2));
  padding:26px;min-height:320px;position:relative;
  clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));}
.readout::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--ac);box-shadow:0 0 16px var(--ac);}
.ro-h{font-family:'Chakra Petch',sans-serif;font-weight:700;font-size:clamp(30px,5vw,54px);color:var(--ink);line-height:1;margin:4px 0;}
.ro-mod{font-size:10px;letter-spacing:.28em;color:var(--mute);}
.idle{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:300px;gap:9px;color:#39445a;}
.idle .b{font-family:'Chakra Petch',sans-serif;font-size:15px;letter-spacing:.28em;color:#46536b;}
@media(prefers-reduced-motion:reduce){*{animation:none!important;transition-duration:.001s!important;}}
`;

const TAPES = [
  { id:"auxd", name:"AUXD", side:"MOD-01 · SIDE A", ac:"#ff2e6e",
    mod:"MOD-01 · ALBUM DECK", tag:"LETTERBOXD, BUT FOR MUSIC",
    copy:"An album-first social platform. Rate out of 5 ★ — with a 6th star for the ones that really matter — write short reviews called Takes, and build a profile around your taste. Discovery runs through people, not an algorithm. You listen wherever you already listen; Aux'd is where your listening lives.",
    cells:[["STATUS","LIVE"],["TYPE","SOCIAL / MUSIC"],["ROLE","SOLO · END-TO-END"]],
    stack:["Next.js","TypeScript","Supabase","PostgreSQL","MusicBrainz"],
    href:"https://theauxd.vercel.app", label:"theauxd.vercel.app" },
  { id:"lores", name:"LORES", side:"MOD-02 · SIDE B", ac:"#22f5a8",
    mod:"MOD-02 · SIGNAL ANALYZER", tag:"WHATSAPP CHAT → PDF REPORT",
    copy:"Upload a chat export, get a designed PDF report back. Six modes — Sweetheart, Ride or Die, Group Wrapped, Family, Work, Roast. Parsing runs on your own device, so the chat itself never leaves your phone.",
    cells:[["STATUS","LIVE · PAID"],["TYPE","AI / ANALYSIS"],["ROLE","SOLO · END-TO-END"]],
    stack:["React","Gemini","Supabase","Razorpay"],
    href:"https://lores.in", label:"lores.in" },
];

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

export default function Builds() {
  const isMobile = useMedia("(max-width: 860px)");
  const [open, setOpen] = useState(null);      // mobile
  const [loaded, setLoaded] = useState(null);  // desktop
  const [phase, setPhase] = useState("idle");
  const cardRefs = useRef({});

  const toggle = (id) => {
    const next = open === id ? null : id;
    setOpen(next);
    if (next) {
      setTimeout(() => {
        cardRefs.current[next]?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 400);
    }
  };

  const insert = (t) => {
    if (phase === "loading") return;
    setLoaded(t); setPhase("loading");
    setTimeout(() => setPhase("seated"), 810);
  };
  const eject = () => { setLoaded(null); setPhase("idle"); };

  /* ---------------- MOBILE ---------------- */
  if (isMobile) {
    return (
      <div className="bd">
        <style>{CSS}</style>
        <h2 className="sec-h disp">BUILDS</h2>
        <div className="sec-sub">TAP A TAPE TO PLAY IT</div>

        <div className="tapes">
          {TAPES.map((t) => {
            const isOpen = open === t.id;
            return (
              <div key={t.id} ref={(el) => (cardRefs.current[t.id] = el)}
                className={"card" + (isOpen ? " open" : "")} style={{ "--ac": t.ac }}>
                <button className="face" onClick={() => toggle(t.id)} aria-expanded={isOpen}>
                  <div className="mcass">
                    <i className="screw a" /><i className="screw b" /><i className="screw c" /><i className="screw d" />
                    <div className="mlbl">
                      <div className="stripe" />
                      <div className="t disp">{t.name}</div>
                      <div className="s">{t.side}</div>
                      <div className="tag">{t.tag}</div>
                    </div>
                    <div className="mwin">
                      <div className="hub" /><div className="band" /><div className="hub" />
                    </div>
                  </div>
                  <div className="strip">
                    <span className="stat"><i className="led" />{isOpen ? "PLAYING" : "STOP"}</span>
                    <span className="vu">{Array.from({ length: 10 }).map((_, i) => <i key={i} />)}</span>
                    <span className="hintx">{isOpen ? "▾" : "TAP ▸"}</span>
                  </div>
                </button>

                <div className="body">
                  <div className="inner">
                    <div className="pad">
                      <div className="ro-tag">{t.mod}</div>
                      <p className="ro-p">{t.copy}</p>
                      <div className="ro-grid">
                        {t.cells.map(([k, v]) => (
                          <div className="ro-cell" key={k}><span>{k}</span><b>{v}</b></div>
                        ))}
                      </div>
                      <div className="ro-stack">{t.stack.map((s) => <em key={s}>{s}</em>)}</div>
                      <div className="acts">
                        <a className="access" href={t.href} target="_blank" rel="noreferrer">
                          OPEN {t.name} ▸
                        </a>
                        <button className="ejectb" onClick={() => setOpen(null)}>◂ EJECT</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  /* ---------------- DESKTOP ---------------- */
  const ac = loaded ? loaded.ac : "var(--cyan)";
  const shelf = TAPES.filter((t) => !loaded || t.id !== loaded.id);
  const DCass = ({ t, cls, onClick }) => (
    <div className={"dcass " + cls} style={{ "--ac": t.ac }} onClick={onClick}>
      <div className="dl"><div className="stripe" />
        <div className="t disp">{t.name}</div><div className="s">{t.side}</div></div>
      <div className="dw"><div className="hub" /><div className="band" /><div className="hub" /></div>
    </div>
  );

  return (
    <div className="bd" style={{ "--ac": ac }}>
      <style>{CSS}</style>
      <h2 className="sec-h disp">BUILDS</h2>
      <div className="sec-sub">INSERT A CASSETTE TO READ THE FILE</div>

      <div className="deckwrap">
        <div>
          <div className="deck" style={{ "--ac": ac }}>
            <div className="dhead">
              <span>TAPE DECK · TD-77</span>
              <span>{phase === "seated" ? "PLAY" : "STOP"}</span>
            </div>
            <div className="slot">
              {loaded ? <DCass t={loaded} cls={phase === "loading" ? "loading" : "seated"} />
                      : <span className="slotempty">— NO TAPE —</span>}
            </div>
            <div className="transport">
              <button className="tbtn" disabled={phase !== "seated"} onClick={eject}>◂ EJECT</button>
              <button className="tbtn" disabled>▸ PLAY</button>
              <button className="tbtn" disabled>▪ STOP</button>
            </div>
          </div>
          <div className="shelfrow">
            {shelf.map((t) => (
              <DCass key={t.id} t={t} cls=""
                onClick={() => (loaded ? (eject(), setTimeout(() => insert(t), 120)) : insert(t))} />
            ))}
          </div>
        </div>

        <div className="readout" style={{ "--ac": ac }}>
          {!loaded || phase === "loading" ? (
            <div className="idle">
              <div className="b">{phase === "loading" ? "READING TAPE . . ." : "AWAITING TAPE"}</div>
              <div style={{ fontSize: 11, letterSpacing: ".18em" }}>PICK A CASSETTE FROM THE SHELF</div>
            </div>
          ) : (
            <div>
              <div className="ro-mod">{loaded.mod}</div>
              <div className="ro-h disp">{loaded.name}</div>
              <div className="ro-tag">{loaded.tag}</div>
              <p className="ro-p">{loaded.copy}</p>
              <div className="ro-grid">
                {loaded.cells.map(([k, v]) => (
                  <div className="ro-cell" key={k}><span>{k}</span><b>{v}</b></div>
                ))}
              </div>
              <div className="ro-stack">{loaded.stack.map((s) => <em key={s}>{s}</em>)}</div>
              <a className="access" style={{ display: "inline-flex", flex: "none", padding: "12px 22px" }}
                href={loaded.href} target="_blank" rel="noreferrer">OPEN {loaded.label} ▸</a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

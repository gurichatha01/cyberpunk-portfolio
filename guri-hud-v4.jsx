import React, { useState, useEffect, useRef, useCallback } from "react";

/* =========================================================================
   GURI//OS v1.3
   PROFILE — the operator
   BUILDS  — tape deck: insert a cassette, read the file
   JOURNEY — career as a signal trace. Amplitude grows 2019 -> now.
   STACK / TRANSMIT
   All career data below is real, from the LinkedIn.
   ========================================================================= */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

:root{
  --void:#05060a; --panel:#0b0e15; --panel2:#11151f; --line:#1c2230;
  --yellow:#fcee0a; --cyan:#00e5ff; --magenta:#ff2e6e; --green:#22f5a8;
  --ink:#e9edf5; --mute:#5f6b80;
}
*{box-sizing:border-box;}
.gos,.gos *{font-family:'JetBrains Mono',ui-monospace,monospace;}
.gos{position:relative;min-height:100vh;width:100%;
  background:radial-gradient(120% 90% at 50% -10%,#0c1020 0%,var(--void) 60%),var(--void);
  color:var(--ink);overflow-x:hidden;--px:0;--py:0;}
.disp{font-family:'Chakra Petch',sans-serif;}

.fx{position:fixed;inset:0;pointer-events:none;z-index:60;}
.fx.scan{background:repeating-linear-gradient(0deg,rgba(0,0,0,0) 0px,rgba(0,0,0,0) 2px,rgba(0,0,0,.28) 3px,rgba(0,0,0,0) 4px);mix-blend-mode:multiply;opacity:.5;}
.fx.glow{background:radial-gradient(90% 60% at 50% 40%,rgba(0,229,255,.05),transparent 70%);}
.fx.vig{box-shadow:inset 0 0 200px 40px rgba(0,0,0,.9);}
.fx.flick{background:#fff;opacity:0;animation:flick 7s infinite steps(1);}
@keyframes flick{0%,97%{opacity:0}97.5%{opacity:.015}98%{opacity:0}98.5%{opacity:.02}99%{opacity:0}}

.bracket{position:fixed;width:26px;height:26px;z-index:55;border:2px solid var(--yellow);box-shadow:0 0 12px rgba(252,238,10,.5);}
.bracket.tl{top:16px;left:16px;border-right:0;border-bottom:0;}
.bracket.tr{top:16px;right:16px;border-left:0;border-bottom:0;}
.bracket.bl{bottom:16px;left:16px;border-right:0;border-top:0;}
.bracket.br{bottom:16px;right:16px;border-left:0;border-top:0;}

.frame{position:relative;z-index:10;min-height:100vh;padding:44px clamp(28px,5vw,90px);
  display:flex;flex-direction:column;transform:translate(calc(var(--px)*-6px),calc(var(--py)*-6px));}
.topbar{display:flex;justify-content:space-between;align-items:center;gap:16px;font-size:11px;
  letter-spacing:.18em;color:var(--mute);border-bottom:1px solid var(--line);padding-bottom:12px;flex-wrap:wrap;}
.topbar .brand{color:var(--yellow);font-weight:700;letter-spacing:.22em;text-shadow:0 0 10px rgba(252,238,10,.55);}
.topbar .grp{display:flex;gap:20px;align-items:center;flex-wrap:wrap;}
.dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green);margin-right:7px;animation:pulse 1.6s infinite;}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.35}}
.serial{position:fixed;left:20px;top:50%;transform:translateY(-50%) rotate(180deg);writing-mode:vertical-rl;
  font-size:10px;letter-spacing:.4em;color:var(--mute);z-index:40;opacity:.7;}

.nav{display:flex;gap:6px;margin:26px 0 28px;flex-wrap:wrap;}
.tab{background:transparent;border:1px solid var(--line);color:var(--mute);font-family:'Chakra Petch',sans-serif;
  font-weight:600;font-size:13px;letter-spacing:.16em;padding:9px 17px;cursor:pointer;transition:.18s;
  clip-path:polygon(0 0,calc(100% - 9px) 0,100% 9px,100% 100%,9px 100%,0 calc(100% - 9px));}
.tab .k{font-size:10px;color:var(--line);margin-right:8px;}
.tab:hover{color:var(--ink);border-color:var(--cyan);}
.tab.on{color:var(--void);background:var(--yellow);border-color:var(--yellow);box-shadow:0 0 22px rgba(252,238,10,.45);}
.tab.on .k{color:rgba(5,6,10,.5);}

.stage{flex:1;display:flex;align-items:center;position:relative;padding:10px 0;}
.panel{width:100%;animation:swap .32s ease both;}
@keyframes swap{0%{opacity:0;transform:translateX(-8px)}100%{opacity:1;transform:none}}
.glitching{animation:glitch .32s steps(2) both;}
@keyframes glitch{0%{clip-path:inset(0 0 60% 0);transform:translateX(-6px)}20%{clip-path:inset(50% 0 20% 0);transform:translateX(6px)}40%{clip-path:inset(20% 0 40% 0);transform:translateX(-3px)}100%{clip-path:inset(0 0 0 0);transform:none}}

/* ---------- PROFILE ---------- */
.eyebrow{color:var(--cyan);font-size:12px;letter-spacing:.4em;text-shadow:0 0 10px rgba(0,229,255,.5);margin-bottom:14px;}
.name{font-family:'Chakra Petch',sans-serif;font-weight:700;line-height:.86;font-size:clamp(64px,15vw,190px);
  color:var(--ink);text-shadow:3px 0 var(--magenta),-3px 0 var(--cyan),0 0 40px rgba(252,238,10,.25);}
.fullname{font-family:'Chakra Petch',sans-serif;font-weight:500;letter-spacing:.34em;font-size:clamp(11px,1.5vw,15px);color:var(--mute);margin:12px 0 20px;}
.role{font-family:'Chakra Petch',sans-serif;font-weight:600;font-size:clamp(18px,3vw,34px);color:var(--yellow);text-shadow:0 0 22px rgba(252,238,10,.4);}
.role .x{color:var(--magenta);text-shadow:0 0 18px rgba(255,46,110,.6);padding:0 .25em;}
.bio{max-width:660px;color:#aab3c4;font-size:14px;line-height:1.75;margin:20px 0 30px;}
.bio b{color:var(--ink);font-weight:500;}
.chips{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:34px;}
.chip{border:1px solid var(--line);padding:8px 13px;font-size:11px;letter-spacing:.14em;color:var(--mute);}
.chip b{color:var(--cyan);font-weight:500;}
.ctas{display:flex;gap:12px;flex-wrap:wrap;}
.btn{font-family:'Chakra Petch',sans-serif;font-weight:600;font-size:13px;letter-spacing:.14em;padding:12px 22px;
  cursor:pointer;border:1px solid var(--yellow);color:var(--yellow);background:transparent;transition:.18s;text-decoration:none;display:inline-block;
  clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));}
.btn:hover{background:var(--yellow);color:var(--void);box-shadow:0 0 24px rgba(252,238,10,.5);}
.btn.ghost{border-color:var(--line);color:var(--mute);}
.btn.ghost:hover{border-color:var(--cyan);color:var(--cyan);background:transparent;}

.sec-h{font-family:'Chakra Petch',sans-serif;font-weight:700;font-size:clamp(26px,4.4vw,46px);color:var(--ink);margin-bottom:4px;}
.sec-sub{color:var(--mute);font-size:12px;letter-spacing:.3em;margin-bottom:26px;}

/* ---------- DECK ---------- */
.deckwrap{display:grid;grid-template-columns:minmax(280px,340px) 1fr;gap:26px;align-items:start;}
@media(max-width:900px){.deckwrap{grid-template-columns:1fr;}}
.deck{position:relative;border:1px solid var(--line);padding:18px;background:linear-gradient(165deg,#12161f,#080a10);
  box-shadow:0 20px 50px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.04);
  clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));}
.deck .dhead{display:flex;justify-content:space-between;align-items:center;font-size:10px;letter-spacing:.24em;color:var(--mute);margin-bottom:12px;}
.pwr{display:flex;align-items:center;gap:7px;}
.led{width:8px;height:8px;border-radius:50%;background:#2a3040;transition:.3s;}
.led.on{background:var(--ac);box-shadow:0 0 12px var(--ac),0 0 24px var(--ac);}
.slot{position:relative;height:150px;background:#04060a;border:1px solid #171d29;overflow:hidden;
  box-shadow:inset 0 6px 22px rgba(0,0,0,.95);display:flex;align-items:center;justify-content:center;}
.slotmouth{position:absolute;top:0;left:0;right:0;height:8px;background:linear-gradient(#000,#0d1219);border-bottom:1px solid #1b2230;z-index:5;}
.slotempty{font-size:11px;letter-spacing:.28em;color:#2b3444;}
.cass{position:relative;width:224px;height:138px;border-radius:5px;cursor:pointer;
  background:linear-gradient(160deg,#20262f,#0e1218);border:1px solid #2c3442;
  box-shadow:0 8px 18px rgba(0,0,0,.6),inset 0 1px 0 rgba(255,255,255,.07);
  transition:transform .18s,box-shadow .18s,border-color .18s;flex:none;}
.cass:hover{transform:translateY(-6px) rotate(-1deg);border-color:var(--ac);box-shadow:0 14px 30px rgba(0,0,0,.7);}
.cass .screw{position:absolute;width:5px;height:5px;border-radius:50%;background:#39414f;box-shadow:inset 0 1px 1px rgba(0,0,0,.8);}
.cass .screw.a{top:6px;left:6px}.cass .screw.b{top:6px;right:6px}
.cass .screw.c{bottom:6px;left:6px}.cass .screw.d{bottom:6px;right:6px}
.cass .lbl{position:absolute;top:12px;left:12px;right:12px;height:52px;background:linear-gradient(150deg,#e9e6dc,#c8c6bc);border-radius:2px;padding:6px 9px;overflow:hidden;}
.cass .lbl .t{font-family:'Chakra Petch',sans-serif;font-weight:700;font-size:21px;color:#12151b;line-height:1;}
.cass .lbl .s{font-size:8px;letter-spacing:.18em;color:#5c5f66;margin-top:3px;}
.cass .lbl .stripe{position:absolute;left:0;top:0;bottom:0;width:5px;background:var(--ac);}
.cass .win{position:absolute;bottom:14px;left:12px;right:12px;height:52px;background:#05070b;border:1px solid #262d39;border-radius:3px;display:flex;align-items:center;justify-content:space-around;padding:0 10px;}
.hub{width:32px;height:32px;border-radius:50%;border:2px solid #39414f;background:radial-gradient(circle,#0a0d12 34%,#1a1f28 36%);position:relative;}
.hub::after{content:"";position:absolute;inset:6px;border-radius:50%;background:conic-gradient(from 0deg,#2c3340 0 25%,#151a22 0 50%,#2c3340 0 75%,#151a22 0);}
.hub.spin::after{animation:spin 1.6s linear infinite;}
@keyframes spin{to{transform:rotate(360deg)}}
.tape{flex:1;height:16px;margin:0 6px;background:linear-gradient(#2a1d12,#160f08);border-radius:2px;}
.cass.loading{animation:insert .85s cubic-bezier(.5,0,.2,1) forwards;pointer-events:none;}
@keyframes insert{0%{transform:translateY(-120px) rotate(-6deg) scale(.96);opacity:0}30%{opacity:1}70%{transform:translateY(6px) rotate(0) scale(1)}85%{transform:translateY(-2px)}100%{transform:translateY(0)}}
.cass.ejecting{animation:eject .5s ease-in forwards;pointer-events:none;}
@keyframes eject{0%{transform:none;opacity:1}100%{transform:translateY(-130px) rotate(5deg);opacity:0}}
.transport{display:flex;gap:6px;margin-top:14px;}
.tbtn{flex:1;border:1px solid var(--line);background:#0a0e14;color:var(--mute);font-size:10px;letter-spacing:.16em;padding:9px 0;cursor:pointer;transition:.16s;font-family:'JetBrains Mono',monospace;}
.tbtn:hover:not(:disabled){border-color:var(--ac);color:var(--ac);}
.tbtn:disabled{opacity:.3;cursor:default;}
.vu{display:flex;gap:3px;align-items:flex-end;height:22px;margin-top:12px;}
.vu i{flex:1;background:#1a2130;transition:.1s;}
.vu.live i{background:var(--ac);box-shadow:0 0 8px var(--ac);animation:vu .6s infinite alternate;}
.vu.live i:nth-child(2n){animation-duration:.42s}.vu.live i:nth-child(3n){animation-duration:.78s}
@keyframes vu{from{height:12%}to{height:100%}}
.shelf{display:flex;flex-direction:column;gap:14px;}
.shelf .cap{font-size:10px;letter-spacing:.28em;color:var(--mute);}
.shelfrow{display:flex;gap:16px;flex-wrap:wrap;}
.readout{border:1px solid var(--line);background:linear-gradient(160deg,var(--panel),var(--panel2));padding:26px;min-height:300px;
  clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));position:relative;}
.readout::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--ac);box-shadow:0 0 18px var(--ac);}
.ro-idle{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;min-height:280px;gap:10px;color:#2f3849;text-align:center;}
.ro-idle .big{font-family:'Chakra Petch',sans-serif;font-size:16px;letter-spacing:.3em;color:#39445a;}
.ro-in{animation:roIn .45s ease both;}
@keyframes roIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.ro-mod{font-size:10px;letter-spacing:.3em;color:var(--mute);}
.ro-h{font-family:'Chakra Petch',sans-serif;font-weight:700;font-size:clamp(34px,6vw,60px);color:var(--ink);line-height:1;margin:4px 0;}
.ro-tag{color:var(--ac);font-size:12px;letter-spacing:.18em;text-shadow:0 0 12px var(--ac);margin-bottom:18px;}
.ro-p{color:#9aa4b6;font-size:13.5px;line-height:1.7;max-width:520px;margin:0 0 18px;}
.ro-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-bottom:22px;}
.ro-cell{border:1px solid var(--line);padding:10px 12px;}
.ro-cell span{display:block;font-size:9px;letter-spacing:.2em;color:var(--mute);margin-bottom:4px;}
.ro-cell b{font-size:12px;color:var(--ink);font-weight:500;}
.ro-stack{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:22px;}
.ro-stack em{font-style:normal;font-size:10px;letter-spacing:.14em;border:1px solid var(--line);padding:5px 9px;color:var(--mute);}
.access{display:inline-block;font-family:'Chakra Petch',sans-serif;font-weight:600;font-size:13px;letter-spacing:.14em;padding:12px 22px;
  border:1px solid var(--ac);color:var(--ac);text-decoration:none;transition:.18s;
  clip-path:polygon(0 0,calc(100% - 10px) 0,100% 10px,100% 100%,10px 100%,0 calc(100% - 10px));}
.access:hover{background:var(--ac);color:var(--void);box-shadow:0 0 24px var(--ac);}

/* ---------- JOURNEY : signal trace ---------- */
.scope{position:relative;border:1px solid var(--line);background:linear-gradient(180deg,#080b11,#04060a);
  padding:16px 16px 8px;margin-bottom:20px;overflow:hidden;
  clip-path:polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px));}
.scope .shead{display:flex;justify-content:space-between;font-size:9px;letter-spacing:.26em;color:var(--mute);margin-bottom:6px;gap:10px;}
.scope svg{display:block;width:100%;}
.trace{fill:none;stroke:var(--ac);stroke-width:1.6;filter:drop-shadow(0 0 5px var(--ac));
  stroke-dasharray:4200;stroke-dashoffset:4200;animation:draw 2.2s ease forwards;}
@keyframes draw{to{stroke-dashoffset:0}}
.trace.ghost{stroke:var(--magenta);opacity:.26;stroke-width:1;filter:none;animation-delay:.08s;}
.gridln{stroke:#141a25;stroke-width:1;}
.nodedot{fill:#0a0e14;stroke:var(--nc);stroke-width:2;cursor:pointer;transition:.2s;}
.nodedot.sel{fill:var(--nc);filter:drop-shadow(0 0 10px var(--nc));}
.nodetick{stroke:#232b39;stroke-width:1;}
.nodetick.sel{stroke:var(--nc);opacity:.5;stroke-dasharray:3 4;}
.yr{font-family:'JetBrains Mono',monospace;font-size:11px;fill:var(--mute);letter-spacing:.1em;}
.yr.sel{fill:var(--nc);}

.jrow{display:flex;gap:7px;flex-wrap:wrap;margin-bottom:20px;}
.jchip{border:1px solid var(--line);background:transparent;color:var(--mute);font-size:10.5px;letter-spacing:.14em;
  padding:8px 12px;cursor:pointer;transition:.16s;font-family:'JetBrains Mono',monospace;}
.jchip:hover{color:var(--ink);border-color:var(--jc);}
.jchip.on{color:var(--void);background:var(--jc);border-color:var(--jc);box-shadow:0 0 18px var(--jc);font-weight:700;}

.era{border:1px solid var(--line);background:linear-gradient(160deg,var(--panel),var(--panel2));padding:26px;position:relative;
  clip-path:polygon(0 0,calc(100% - 16px) 0,100% 16px,100% 100%,16px 100%,0 calc(100% - 16px));animation:roIn .4s ease both;}
.era::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--ac);box-shadow:0 0 18px var(--ac);}
.era .top{display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;align-items:flex-start;margin-bottom:14px;}
.era .when{font-size:10px;letter-spacing:.28em;color:var(--mute);}
.era .org{font-family:'Chakra Petch',sans-serif;font-weight:700;font-size:clamp(26px,4vw,40px);color:var(--ink);line-height:1.05;margin:4px 0 2px;}
.era .rl{color:var(--ac);font-size:12.5px;letter-spacing:.16em;text-shadow:0 0 12px var(--ac);}
.era .dur{font-size:10px;letter-spacing:.2em;color:var(--mute);border:1px solid var(--line);padding:7px 11px;white-space:nowrap;}
.era p{color:#9aa4b6;font-size:13.5px;line-height:1.75;max-width:620px;margin:0 0 18px;}
.era p b{color:var(--ink);font-weight:500;}
.augh{font-size:9.5px;letter-spacing:.3em;color:var(--mute);margin-bottom:9px;}
.augs{display:flex;gap:7px;flex-wrap:wrap;}
.aug{font-size:10px;letter-spacing:.12em;border:1px solid var(--ac);color:var(--ac);padding:6px 10px;opacity:.9;animation:augIn .3s ease both;}
.aug:nth-child(2){animation-delay:.05s}.aug:nth-child(3){animation-delay:.1s}
.aug:nth-child(4){animation-delay:.15s}.aug:nth-child(5){animation-delay:.2s}
.aug:nth-child(6){animation-delay:.25s}
@keyframes augIn{from{opacity:0;transform:translateY(6px)}to{opacity:.9;transform:none}}

/* ---------- STACK / CONTACT ---------- */
.stack{max-width:620px;}
.grpname{font-size:10px;letter-spacing:.3em;color:var(--mute);margin:0 0 10px;}
.sgrid{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px;}
.sgrid em{font-style:normal;font-size:11px;letter-spacing:.12em;border:1px solid var(--line);padding:8px 12px;color:#aab3c4;transition:.16s;}
.sgrid em:hover{border-color:var(--sc);color:var(--sc);}
.stack .foot{margin-top:8px;color:var(--mute);font-size:12px;line-height:1.75;border-top:1px solid var(--line);padding-top:18px;}
.stack .foot b{color:var(--yellow);}
.contact{max-width:560px;}
.contact .line{display:flex;justify-content:space-between;padding:16px 0;border-bottom:1px solid var(--line);gap:14px;}
.contact .line span{color:var(--mute);font-size:12px;letter-spacing:.16em;}
.contact .line a{color:var(--cyan);text-decoration:none;font-size:14px;}
.contact .line a:hover{text-shadow:0 0 12px var(--cyan);}

.hint{border-top:1px solid var(--line);padding-top:12px;margin-top:24px;display:flex;justify-content:space-between;
  font-size:11px;letter-spacing:.16em;color:var(--mute);flex-wrap:wrap;gap:8px;}
.hint .sk{color:var(--yellow);text-decoration:none;}

.boot{position:fixed;inset:0;z-index:100;background:var(--void);display:flex;align-items:center;justify-content:center;
  flex-direction:column;gap:14px;font-size:13px;letter-spacing:.16em;color:var(--green);text-align:center;padding:20px;}
.boot .ln{opacity:0;animation:ln .28s forwards;}
.boot .big{font-family:'Chakra Petch',sans-serif;font-weight:700;font-size:clamp(30px,8vw,44px);color:var(--yellow);letter-spacing:.1em;text-shadow:0 0 30px rgba(252,238,10,.6);}
@keyframes ln{to{opacity:1}}

@media(max-width:640px){.frame{padding:40px 20px;}.serial{display:none;}.cass{width:196px;height:122px;}}
@media(prefers-reduced-motion:reduce){*{animation-duration:.001s!important;}}
`;

const GLYPHS = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789/#*<>[]";
function useScramble(target, run, speed = 55) {
  const [out, setOut] = useState(target);
  useEffect(() => {
    if (!run) { setOut(target); return; }
    let f = 0;
    const id = setInterval(() => {
      f++; const rev = Math.floor(f / 2); let s = "";
      for (let i = 0; i < target.length; i++)
        s += i < rev ? target[i] : GLYPHS[(Math.random() * GLYPHS.length) | 0];
      setOut(s); if (rev >= target.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [target, run, speed]);
  return out;
}
function Clock() {
  const [t, setT] = useState("");
  useEffect(() => { const f = () => setT(new Date().toLocaleTimeString("en-GB")); f();
    const id = setInterval(f, 1000); return () => clearInterval(id); }, []);
  return <span>{t}</span>;
}

const TABS = ["PROFILE", "BUILDS", "JOURNEY", "STACK", "CONTACT"];

const TAPES = [
  { id:"auxd", name:"AUXD", side:"MOD-01 · SIDE A", ac:"var(--magenta)",
    mod:"MOD-01 · ALBUM DECK", tag:"LETTERBOXD, BUT FOR MUSIC",
    copy:"An album-first social platform. Rate out of 5 ★ — with a 6th star for the ones that really matter — write short reviews called Takes, and build a profile around your taste. Discovery runs through people, not an algorithm. It doesn't replace Spotify or Apple Music: you listen wherever you already listen. Aux'd is where your listening lives.",
    cells:[["STATUS","LIVE"],["TYPE","SOCIAL / MUSIC"],["ROLE","SOLO · END-TO-END"]],
    stack:["Next.js","TypeScript","Supabase","PostgreSQL","MusicBrainz"],
    href:"https://theauxd.vercel.app", label:"theauxd.vercel.app" },
  { id:"lores", name:"LORES", side:"MOD-02 · SIDE B", ac:"var(--green)",
    mod:"MOD-02 · SIGNAL ANALYZER", tag:"WHATSAPP CHAT → PDF REPORT",
    copy:"Upload a chat export, get a designed PDF report back. Six modes — Sweetheart, Ride or Die, Group Wrapped, Family, Work, Roast. Parsing runs on your own device, so the chat itself never leaves your phone.",
    cells:[["STATUS","LIVE · PAID"],["TYPE","AI / ANALYSIS"],["ROLE","SOLO · END-TO-END"]],
    stack:["React","Gemini","Supabase","Razorpay"],
    href:"https://lores.in", label:"lores.in" },
];

/* --- real history --- */
const ERAS = [
  { yr:"2019", when:"2019 — 2023", org:"THAPAR", role:"B.TECH · ELECTRONIC & COMPUTER ENGINEERING",
    dur:"4 YRS", nc:"var(--cyan)",
    body:<>Started in <b>hardware</b>, not software. Built a <b>3D-printed photogrammetry scanner</b> — SolidWorks for the rig, a Flutter Android app that turned a set of photos into a 3D model. Ran hospitality for the Thapar Adventure Club for three years, which is where the organising-people part came from.</>,
    augs:["Python","C","SolidWorks","Flutter","Signals & Systems","Team Lead"] },
  { yr:"2023", when:"JAN 2023 — AUG 2023", org:"MYLO", role:"PRODUCT ANALYST · INTERN",
    dur:"8 MOS", nc:"var(--green)",
    body:<>First contact with real product data, at India's #1 parenting platform — <b>10M+ users</b>. Learned that the interesting question is rarely the one you were handed, and that a number with no decision attached is just trivia.</>,
    augs:["SQL","Product Metrics","Cohorts","Dashboards"] },
  { yr:"2023", when:"SEP 2023 — OCT 2024", org:"MYLO", role:"DATA ANALYST · FULL-TIME",
    dur:"1 YR 2 MOS", nc:"var(--green)",
    body:<>Owned analytics across <b>supply chain and D2C logistics</b>. Built P&L dashboards, modelled logistics cost, and ran a data audit that <b>recovered credit notes</b> nobody had noticed were owed. First time analysis turned directly into money.</>,
    augs:["BigQuery","Python","Cost Modelling","P&L","Data Audit"] },
  { yr:"2024", when:"OCT 2024 — PRESENT", org:"CRITEO", role:"DATA ANALYST · GCOC (APAC → AMS)",
    dur:"1 YR 11 MOS", nc:"var(--yellow)",
    body:<>Joined for <b>APAC</b>, now in the Global Client Operations Center for <b>AMS</b>. Adtech data at scale — performance metrics, query review, executive summaries — plus onboarding and training new analysts. Learned to make numbers legible to people who don't want numbers.</>,
    augs:["Hive","Tableau","Power BI","Adtech","Query Review","Stakeholder Comms"] },
  { yr:"2026", when:"2026 — PRESENT", org:"SHIPPING", role:"INDIE PRODUCT BUILDER",
    dur:"ONGOING", nc:"var(--magenta)",
    body:<>Stopped leaving things in a GitHub repo. Shipped <b>Aux'd</b> and <b>Lores</b> end to end — idea, UX, database, auth, catalogue, payments, deploy. The hard part was never the code; it was deciding what belongs in v1. Same instinct as the 2020 scanner, six years of tooling later.</>,
    augs:["Next.js","TypeScript","Supabase","Razorpay","Gemini","Shipping"] },
];

function tracePath(gain = 1) {
  const W = 1000, MID = 108; let d = "";
  for (let x = 0; x <= W; x += 3) {
    const t = x / W;
    const amp = (2 + Math.pow(t, 1.7) * 56) * gain;
    const y = MID - Math.sin(x * .085) * amp - Math.sin(x * .21) * amp * .42 - Math.sin(x * .44) * amp * .16;
    d += (x === 0 ? "M" : "L") + x.toFixed(0) + " " + y.toFixed(1) + " ";
  }
  return d;
}
const NODE_X = [80, 285, 460, 660, 915];

function Cassette({ tape, cls = "", onClick }) {
  return (
    <div className={"cass " + cls} style={{ "--ac": tape.ac }} onClick={onClick}
      role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick?.(); } }}>
      <i className="screw a" /><i className="screw b" /><i className="screw c" /><i className="screw d" />
      <div className="lbl">
        <div className="stripe" />
        <div className="t disp">{tape.name}</div>
        <div className="s">{tape.side}</div>
      </div>
      <div className="win">
        <div className={"hub" + (cls === "seated" ? " spin" : "")} />
        <div className="tape" />
        <div className={"hub" + (cls === "seated" ? " spin" : "")} />
      </div>
    </div>
  );
}

export default function App() {
  const [booted, setBooted] = useState(false);
  const [tab, setTab] = useState(0);
  const [glitch, setGlitch] = useState(false);
  const [loaded, setLoaded] = useState(null);
  const [phase, setPhase] = useState("idle");
  const [era, setEra] = useState(ERAS.length - 1);
  const gosRef = useRef(null);

  useEffect(() => { const t = setTimeout(() => setBooted(true), 2100); return () => clearTimeout(t); }, []);

  const go = useCallback((i) => {
    if (i === tab) return;
    setGlitch(true); setTab(i); setTimeout(() => setGlitch(false), 320);
  }, [tab]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key >= "1" && e.key <= "5") go(+e.key - 1);
      if (tab === 2) {
        if (e.key === "ArrowRight") setEra((p) => Math.min(ERAS.length - 1, p + 1));
        if (e.key === "ArrowLeft") setEra((p) => Math.max(0, p - 1));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, tab]);

  const insert = (tape) => {
    if (phase === "loading" || phase === "ejecting") return;
    setLoaded(tape); setPhase("loading");
    setTimeout(() => setPhase("seated"), 860);
  };
  const eject = () => {
    setPhase("ejecting");
    setTimeout(() => { setLoaded(null); setPhase("idle"); }, 480);
  };

  const onMove = (e) => {
    const el = gosRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--px", (((e.clientX - r.left) / r.width) - .5).toFixed(3));
    el.style.setProperty("--py", (((e.clientY - r.top) / r.height) - .5).toFixed(3));
  };

  const nameOut = useScramble("GURI", booted);
  const ac = loaded ? loaded.ac : "var(--cyan)";
  const shelf = TAPES.filter((t) => !loaded || t.id !== loaded.id);
  const E = ERAS[era];

  return (
    <div className="gos" ref={gosRef} onMouseMove={onMove}>
      <style>{CSS}</style>

      {!booted && (
        <div className="boot">
          <div className="ln big" style={{ animationDelay: ".05s" }}>GURI//OS</div>
          <div className="ln" style={{ animationDelay: ".5s" }}>BOOT ROM v1.3 — CHATHA SYSTEMS</div>
          <div className="ln" style={{ animationDelay: ".9s" }}>DETECTING OPERATOR . . . . . . OK</div>
          <div className="ln" style={{ animationDelay: "1.3s" }}>LOADING PERSONNEL FILE [0117-GS]</div>
          <div className="ln" style={{ animationDelay: "1.7s" }}>&gt; DECRYPTING_</div>
        </div>
      )}

      <span className="bracket tl" /><span className="bracket tr" />
      <span className="bracket bl" /><span className="bracket br" />
      <div className="serial">PERSONNEL FILE · 0117-AX · CHATHA</div>

      <div className="frame">
        <div className="topbar">
          <div className="grp"><span className="brand">GURI//OS</span><span>v1.3</span></div>
          <div className="grp">
            <span><span className="dot" />ONLINE</span><span>GURUGRAM · IN</span><span><Clock /></span>
          </div>
        </div>

        <div className="nav">
          {TABS.map((t, i) => (
            <button key={t} className={"tab" + (tab === i ? " on" : "")} onClick={() => go(i)}>
              <span className="k">0{i + 1}</span>{t}
            </button>
          ))}
        </div>

        <div className="stage">
          <div className={"panel" + (glitch ? " glitching" : "")} key={tab}>

            {/* 01 PROFILE */}
            {tab === 0 && (
              <div>
                <div className="eyebrow">PERSONNEL FILE // 0117-GS</div>
                <div className="name disp">{nameOut}</div>
                <div className="fullname">GURMEHERDEEP SINGH CHATHA</div>
                <div className="role disp">DATA ANALYST<span className="x">×</span>PRODUCT BUILDER</div>
                <p className="bio">
                  <b>Electronics engineer by training, analyst by trade, builder by choice.</b> Data
                  Analyst at Criteo's Global Client Operations Center for AMS — SQL, Python and
                  BigQuery at scale. Shipping my own consumer products on the side. I take invisible
                  things — your listening, your chats — and turn them into something you can read.
                </p>
                <div className="chips">
                  <span className="chip">ROLE · <b>DATA ANALYST @ CRITEO</b></span>
                  <span className="chip">UNIT · <b>GCOC · AMS</b></span>
                  <span className="chip">BASE · <b>GURUGRAM, IN</b></span>
                  <span className="chip">STATUS · <b>SHIPPING</b></span>
                </div>
                <div className="ctas">
                  <button className="btn" onClick={() => go(1)}>▸ LOAD A TAPE</button>
                  <button className="btn ghost" onClick={() => go(2)}>▸ TRACE THE SIGNAL</button>
                </div>
              </div>
            )}

            {/* 02 BUILDS */}
            {tab === 1 && (
              <div>
                <div className="sec-h disp">BUILDS</div>
                <div className="sec-sub">INSERT A CASSETTE TO READ THE FILE</div>
                <div className="deckwrap" style={{ "--ac": ac }}>
                  <div>
                    <div className="deck" style={{ "--ac": ac }}>
                      <div className="dhead">
                        <span>TAPE DECK · TD-77</span>
                        <span className="pwr">{phase === "seated" ? "PLAY" : "STOP"}
                          <i className={"led" + (phase === "seated" ? " on" : "")} /></span>
                      </div>
                      <div className="slot">
                        <div className="slotmouth" />
                        {loaded ? (
                          <Cassette tape={loaded}
                            cls={phase === "loading" ? "loading" : phase === "ejecting" ? "ejecting" : "seated"} />
                        ) : <span className="slotempty">— NO TAPE —</span>}
                      </div>
                      <div className="transport">
                        <button className="tbtn" disabled={!loaded || phase !== "seated"} onClick={eject}>◂ EJECT</button>
                        <button className="tbtn" disabled>▸ PLAY</button>
                        <button className="tbtn" disabled>▪ STOP</button>
                      </div>
                      <div className={"vu" + (phase === "seated" ? " live" : "")}>
                        {Array.from({ length: 14 }).map((_, i) => <i key={i} style={{ height: "12%" }} />)}
                      </div>
                    </div>
                    <div className="shelf" style={{ marginTop: 22 }}>
                      <div className="cap">{loaded ? "OTHER TAPES" : "SELECT A TAPE"}</div>
                      <div className="shelfrow">
                        {shelf.map((t) => (
                          <Cassette key={t.id} tape={t}
                            onClick={() => (loaded ? (eject(), setTimeout(() => insert(t), 500)) : insert(t))} />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="readout" style={{ "--ac": ac }}>
                    {!loaded || phase === "loading" ? (
                      <div className="ro-idle">
                        <div className="big">{phase === "loading" ? "READING TAPE . . ." : "AWAITING TAPE"}</div>
                        <div style={{ fontSize: 11, letterSpacing: ".2em" }}>
                          {phase === "loading" ? "DECRYPTING SIDE" : "PICK A CASSETTE FROM THE SHELF"}
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
                            <div className="ro-cell" key={k}><span>{k}</span><b>{v}</b></div>
                          ))}
                        </div>
                        <div className="ro-stack">{loaded.stack.map((s) => <em key={s}>{s}</em>)}</div>
                        <a className="access" href={loaded.href} target="_blank" rel="noreferrer">
                          OPEN {loaded.label} ▸
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* 03 JOURNEY */}
            {tab === 2 && (
              <div style={{ "--ac": E.nc }}>
                <div className="sec-h disp">JOURNEY</div>
                <div className="sec-sub">SIGNAL LOG · HARDWARE → DATA → PRODUCT</div>

                <div className="scope" style={{ "--ac": E.nc }}>
                  <div className="shead">
                    <span>SIGNAL STRENGTH · 2019 → NOW</span>
                    <span>AMPLITUDE ▲ {Math.round(((era + 1) / ERAS.length) * 100)}%</span>
                  </div>
                  <svg viewBox="0 0 1000 165" preserveAspectRatio="xMidYMid meet">
                    {[30, 108, 150].map((y) => <line key={y} className="gridln" x1="0" y1={y} x2="1000" y2={y} />)}
                    {[200, 400, 600, 800].map((x) => <line key={x} className="gridln" x1={x} y1="8" x2={x} y2="150" />)}
                    <path className="trace ghost" d={tracePath(1.12)} />
                    <path className="trace" d={tracePath(1)} />
                    {ERAS.map((e, i) => (
                      <g key={i} style={{ "--nc": e.nc }}>
                        <line className={"nodetick" + (i === era ? " sel" : "")} x1={NODE_X[i]} y1="14" x2={NODE_X[i]} y2="132" />
                        <circle className={"nodedot" + (i === era ? " sel" : "")} cx={NODE_X[i]} cy="108"
                          r={i === era ? 8 : 6} onClick={() => setEra(i)} />
                        <text className={"yr" + (i === era ? " sel" : "")} x={NODE_X[i]} y="152" textAnchor="middle">{e.yr}</text>
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="jrow">
                  {ERAS.map((e, i) => (
                    <button key={i} className={"jchip" + (i === era ? " on" : "")}
                      style={{ "--jc": e.nc }} onClick={() => setEra(i)}>
                      {e.org} · {e.yr}
                    </button>
                  ))}
                </div>

                <div className="era" key={era} style={{ "--ac": E.nc }}>
                  <div className="top">
                    <div>
                      <div className="when">{E.when}</div>
                      <div className="org disp">{E.org}</div>
                      <div className="rl">{E.role}</div>
                    </div>
                    <div className="dur">{E.dur}</div>
                  </div>
                  <p>{E.body}</p>
                  <div className="augh">▸ AUGMENTS INSTALLED</div>
                  <div className="augs">{E.augs.map((a) => <span className="aug" key={a}>{a}</span>)}</div>
                </div>
              </div>
            )}

            {/* 04 STACK */}
            {tab === 3 && (
              <div className="stack">
                <div className="sec-h disp">STACK</div>
                <div className="sec-sub">ANALYSIS × SHIPPING</div>
                <div className="grpname">▸ DATA</div>
                <div className="sgrid" style={{ "--sc": "var(--cyan)" }}>
                  {["SQL","Python","BigQuery","Hive","Tableau","Power BI","Excel Modelling"].map(s => <em key={s}>{s}</em>)}
                </div>
                <div className="grpname">▸ SHIP KIT</div>
                <div className="sgrid" style={{ "--sc": "var(--magenta)" }}>
                  {["Next.js","TypeScript","React","Supabase","PostgreSQL","Razorpay","Gemini","Vercel"].map(s => <em key={s}>{s}</em>)}
                </div>
                <div className="grpname">▸ EARLIER</div>
                <div className="sgrid" style={{ "--sc": "var(--green)" }}>
                  {["Flutter","SolidWorks","C","Photogrammetry"].map(s => <em key={s}>{s}</em>)}
                </div>
                <div className="foot">
                  EDU · <b>Thapar Institute</b> — B.Tech, Electronic &amp; Computer Engineering (2019–2023)<br />
                  CERT · Google — Foundations: Data, Data, Everywhere
                </div>
              </div>
            )}

            {/* 05 CONTACT */}
            {tab === 4 && (
              <div className="contact">
                <div className="sec-h disp">TRANSMIT</div>
                <div className="sec-sub">OPEN A CHANNEL</div>
                <div className="line"><span>EMAIL</span><a href="#">add your email ▸</a></div>
                <div className="line"><span>LINKEDIN</span>
                  <a href="https://www.linkedin.com/in/gurmeherdeepchatha2001/" target="_blank" rel="noreferrer">/in/gurmeherdeepchatha2001 ▸</a></div>
                <div className="line"><span>GITHUB</span><a href="#">add your github ▸</a></div>
                <div className="line"><span>AUXD</span><a href="https://theauxd.vercel.app" target="_blank" rel="noreferrer">theauxd.vercel.app ▸</a></div>
                <div className="line"><span>LORES</span><a href="https://lores.in" target="_blank" rel="noreferrer">lores.in ▸</a></div>
              </div>
            )}
          </div>
        </div>

        <div className="hint">
          <span>[ 1–5 ] SWITCH MODULE · [ ← → ] SCRUB JOURNEY</span>
          <a className="sk" href="#">skip → plain résumé ▸</a>
        </div>
      </div>

      <div className="fx glow" /><div className="fx scan" /><div className="fx flick" /><div className="fx vig" />
    </div>
  );
}

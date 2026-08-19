import React, { useState, useEffect, useRef } from "react";

/* =========================================================================
   TRANSMIT — open comms channels. Links only, no backend.
   Each channel is a live signal readout; the panel signs off like a terminal.
   ========================================================================= */

const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');

:root{
  --void:#05060a; --panel:#0b0e15; --panel2:#11151f; --line:#1c2230;
  --yellow:#fcee0a; --cyan:#00e5ff; --magenta:#ff2e6e; --green:#22f5a8;
  --ink:#e9edf5; --mute:#8794a8;
}
*{box-sizing:border-box;}
.tx,.tx *{font-family:'JetBrains Mono',ui-monospace,monospace;}
.disp{font-family:'Chakra Petch',sans-serif;}
.tx{background:radial-gradient(120% 90% at 50% -10%,#0c1020 0%,var(--void) 60%),var(--void);
  color:var(--ink);padding:24px clamp(16px,4vw,60px) 40px;min-height:100vh;}

.sec-h{font-family:'Chakra Petch',sans-serif;font-weight:700;font-size:clamp(28px,6vw,46px);
  color:var(--ink);margin:0 0 3px;line-height:1;}
.sec-sub{color:var(--mute);font-size:clamp(9px,2.3vw,12px);letter-spacing:.24em;margin-bottom:20px;
  display:flex;align-items:center;gap:9px;flex-wrap:wrap;}
.live{display:inline-flex;align-items:center;gap:6px;color:var(--green);}
.live i{width:7px;height:7px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green);animation:blink 1.5s infinite;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.3}}

.chan{display:flex;flex-direction:column;gap:10px;margin-bottom:26px;}
.ch{position:relative;display:grid;grid-template-columns:26px 1fr auto;align-items:center;gap:14px;
  border:1px solid var(--line);background:linear-gradient(120deg,#0a0e15,#0b0e15);
  padding:16px 18px;text-decoration:none;color:var(--ink);transition:.18s;overflow:hidden;
  clip-path:polygon(0 0,calc(100% - 12px) 0,100% 12px,100% 100%,12px 100%,0 calc(100% - 12px));}
.ch::before{content:"";position:absolute;left:0;top:0;bottom:0;width:3px;background:var(--cc);
  transform:scaleY(0);transform-origin:bottom;transition:transform .2s;}
.ch:hover,.ch:focus-visible{border-color:var(--cc);background:linear-gradient(120deg,color-mix(in srgb,var(--cc) 9%,#0a0e15),#0b0e15);outline:none;}
.ch:hover::before,.ch:focus-visible::before{transform:scaleY(1);}

.ch .ico{width:26px;height:26px;display:flex;align-items:center;justify-content:center;color:var(--cc);}
.ch .ico svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.6;}
.ch .mid .k{font-family:'Chakra Petch',sans-serif;font-weight:700;font-size:16px;letter-spacing:.04em;color:var(--ink);line-height:1;}
.ch .mid .v{font-size:11px;letter-spacing:.06em;color:var(--mute);margin-top:4px;word-break:break-all;}
.ch:hover .mid .v,.ch:focus-visible .mid .v{color:var(--cc);}

.ch .rt{display:flex;flex-direction:column;align-items:flex-end;gap:6px;}
.ch .st{font-size:8.5px;letter-spacing:.16em;color:var(--cc);white-space:nowrap;opacity:.85;}
.bars{display:flex;gap:2px;align-items:flex-end;height:14px;}
.bars i{width:3px;background:var(--cc);opacity:.85;animation:sig 1s infinite alternate;}
.bars i:nth-child(1){height:35%;animation-delay:0s}
.bars i:nth-child(2){height:60%;animation-delay:.12s}
.bars i:nth-child(3){height:85%;animation-delay:.24s}
.bars i:nth-child(4){height:100%;animation-delay:.36s}
@keyframes sig{from{opacity:.3;transform:scaleY(.75)}to{opacity:.9;transform:scaleY(1)}}
.arrow{font-size:15px;color:var(--cc);transition:transform .18s;}
.ch:hover .arrow{transform:translateX(3px);}
@media(max-width:520px){
  .ch{grid-template-columns:24px 1fr;gap:12px;padding:14px 15px;}
  .ch .rt{grid-column:1 / -1;flex-direction:row;justify-content:space-between;align-items:center;
    border-top:1px solid var(--line);padding-top:10px;margin-top:2px;}
}

/* terminal sign-off */
.signoff{border:1px solid var(--line);background:#04060a;padding:18px 20px;font-size:12px;line-height:1.9;
  clip-path:polygon(0 0,calc(100% - 14px) 0,100% 14px,100% 100%,14px 100%,0 calc(100% - 14px));}
.signoff .l{color:var(--mute);}
.signoff .l .p{color:var(--green);}
.signoff .l b{color:var(--ink);font-weight:400;}
.signoff .end{color:var(--yellow);letter-spacing:.14em;}
.cur{display:inline-block;width:8px;height:15px;background:var(--yellow);margin-left:3px;
  vertical-align:-2px;animation:cur 1.05s steps(1) infinite;}
@keyframes cur{50%{opacity:0}}
@media(prefers-reduced-motion:reduce){.bars i,.live i,.cur{animation:none;}}
`;

const I = {
  mail:  <svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="M3 6l9 7 9-7"/></svg>,
  link:  <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 10v7M8 7v.01M12 17v-7M16 17v-4a2 2 0 0 0-4 0"/></svg>,
  git:   <svg viewBox="0 0 24 24"><path d="M9 19c-4 1.5-4-2-6-2m12 4v-3.5a3 3 0 0 0-1-2.3c3-.3 5-1.6 5-5.5a4.3 4.3 0 0 0-1.2-3 4 4 0 0 0-.1-3s-1-.3-3.3 1.3a11 11 0 0 0-6 0C5.8 3.6 4.8 3.9 4.8 3.9a4 4 0 0 0-.1 3A4.3 4.3 0 0 0 3.5 10c0 3.9 2 5.2 5 5.5a3 3 0 0 0-1 2.3V21"/></svg>,
  disc:  <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.4"/></svg>,
  sig:   <svg viewBox="0 0 24 24"><path d="M4 20V10M9 20V6M14 20v-9M19 20V4"/></svg>,
};

/* email / github are placeholders until you fill them — clearly marked */
const CHANNELS = [
  { k:"EMAIL",    v:"add-your-email@domain.com", st:"PRIMARY · OPEN",  cc:"var(--yellow)",  icon:I.mail,
    href:"mailto:add-your-email@domain.com", todo:true },
  { k:"LINKEDIN", v:"/in/gurmeherdeepchatha2001", st:"CHANNEL OPEN",   cc:"var(--cyan)",    icon:I.link,
    href:"https://www.linkedin.com/in/gurmeherdeepchatha2001/" },
  { k:"GITHUB",   v:"add your github",            st:"CHANNEL OPEN",    cc:"var(--ink)",     icon:I.git,
    href:"#", todo:true },
  { k:"AUXD",     v:"theauxd.vercel.app",         st:"● LIVE PRODUCT",  cc:"var(--magenta)", icon:I.disc,
    href:"https://theauxd.vercel.app" },
  { k:"LORES",    v:"lores.in",                   st:"● LIVE PRODUCT",  cc:"var(--green)",   icon:I.sig,
    href:"https://lores.in" },
];

export default function Transmit() {
  return (
    <div className="tx">
      <style>{CSS}</style>
      <h2 className="sec-h disp">TRANSMIT</h2>
      <div className="sec-sub">
        OPEN CHANNELS · <span className="live"><i />LISTENING</span>
      </div>

      <div className="chan">
        {CHANNELS.map((c) => {
          const ext = c.href.startsWith("http");
          return (
            <a key={c.k} className="ch" href={c.href} style={{ "--cc": c.cc }}
              {...(ext ? { target: "_blank", rel: "noreferrer" } : {})}
              aria-label={`${c.k}: ${c.v}`}>
              <span className="ico">{c.icon}</span>
              <span className="mid">
                <span className="k">{c.k}</span>
                <span className="v">{c.v}</span>
              </span>
              <span className="rt">
                <span className="st">{c.st}</span>
                <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span className="bars"><i /><i /><i /><i /></span>
                  <span className="arrow">▸</span>
                </span>
              </span>
            </a>
          );
        })}
      </div>

      <div className="signoff">
        <div className="l"><span className="p">guri@gcoc</span>:<b>~</b>$ whoami</div>
        <div className="l"><b>gurmeherdeep singh chatha — analyst who ships</b></div>
        <div className="l"><span className="p">guri@gcoc</span>:<b>~</b>$ status</div>
        <div className="l"><b>open to good problems, better teams, and anything worth building</b></div>
        <div className="l end">// END OF TRANSMISSION<span className="cur" /></div>
      </div>
    </div>
  );
}

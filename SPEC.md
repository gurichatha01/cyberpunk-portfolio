# GURI//OS — Portfolio Build Spec

Personal portfolio for **Gurmeherdeep Singh (Guri) Chatha** — Data Analyst @ Criteo, indie product builder.

A Cyberpunk-2077-style operable HUD. Five modules: PROFILE, BUILDS, JOURNEY, STACK, TRANSMIT.
Not a scrolling page — a **console you operate**.

A working visual reference is attached (`guri-hud-v4.jsx`). **Match its look and feel exactly.**
It is a single-file prototype: treat it as the design target, not the architecture.

---

## 1. Stack

- **Next.js (App Router) + TypeScript**, `output: 'export'` (fully static)
- **Plain CSS Modules** or a single global stylesheet with CSS custom properties. No Tailwind.
- **No animation libraries.** No framer-motion, no GSAP, no three.js. Everything is CSS
  transitions/keyframes plus a small amount of React state. This is a hard constraint —
  the whole aesthetic is achievable with CSS and the bundle stays tiny.
- **`next/font`** for Chakra Petch + JetBrains Mono (self-hosted, `display: swap`).
  Load only the weights actually used: Chakra Petch 600/700, JetBrains Mono 400/500.
- Deploy target: Vercel.

**Zero images.** Everything — cassettes, deck, waveform, scanlines — is CSS or inline SVG.
Keep it that way; it's why this can be fast.

---

## 2. Architecture

```
app/
  layout.tsx          # fonts, metadata, OG
  page.tsx            # shell: boot -> frame -> active module
  globals.css         # tokens + shared chrome
  resume/page.tsx     # plain semantic HTML fallback (see §7)
components/
  Boot.tsx            # boot sequence
  Frame.tsx           # topbar, nav, brackets, hint bar, FX overlays
  modules/
    Profile.tsx
    Builds.tsx        # tape deck
    Journey.tsx       # signal trace
    Stack.tsx
    Transmit.tsx
  ui/
    Cassette.tsx
    SignalTrace.tsx
    Scramble.tsx      # text-decode effect
content/
  profile.ts          # bio, chips
  projects.ts         # cassette/project data
  journey.ts          # career eras
  stack.ts
  links.ts
hooks/
  useReducedMotion.ts
  useIsTouch.ts
```

**All copy lives in `content/*.ts`.** Zero hardcoded strings in components — I need to edit
content without touching JSX. Type each content file with an exported interface.

---

## 3. Design tokens

```css
--void:#05060a;  --panel:#0b0e15;  --panel2:#11151f;  --line:#1c2230;
--yellow:#fcee0a;   /* system chrome / active state */
--cyan:#00e5ff;     /* secondary chrome */
--magenta:#ff2e6e;  /* AUXD + indie era */
--green:#22f5a8;    /* LORES + Mylo era */
--ink:#e9edf5;  --mute:#5f6b80;
```

Type: **Chakra Petch** for display/headings/buttons, **JetBrains Mono** for everything else.
Notched corners via `clip-path: polygon(...)` on panels and buttons — this is the signature
shape language, use it consistently.

Accent colour is passed down as a `--ac` custom property so a whole panel recolours from one
place (loaded cassette recolours the deck; selected era recolours the journey panel).

---

## 4. Modules

### 01 PROFILE
Giant `GURI` wordmark with RGB-split text-shadow, decode-scramble on first load. Full name,
role line, bio, spec chips, two CTAs (→ BUILDS, → JOURNEY).

### 02 BUILDS — tape deck
The signature interaction. A deck with an empty slot; cassettes on a shelf below.
Tap a cassette → it animates into the slot (drop, seat, settle) → PLAY LED lights in that
project's accent → reels spin → VU meters animate → the readout panel decodes in with the
project details and a live link. EJECT reverses it. Selecting the other tape auto-ejects first.

Cassettes are **pure CSS** — body, screws, paper label with accent stripe, window with two
spinning hubs and tape between them.

State machine: `idle → loading (860ms) → seated → ejecting (480ms) → idle`.
Guard against double-taps mid-transition.

### 03 JOURNEY — signal trace
Career as an oscilloscope reading whose **amplitude grows from 2019 to now**
(flat line → full waveform). Inline SVG, path generated in JS, drawn in via `stroke-dasharray`.
Five era nodes on the trace; selecting one recolours the panel and swaps the era card.
Each era lists **AUGMENTS INSTALLED** (skills gained) as accent-bordered chips.
Controls: click node, click chip, arrow keys.

### 04 STACK
Grouped skill tags — DATA / SHIP KIT / EARLIER — plus education and certs.
**No percentage bars.** No self-rated proficiency numbers.

### 05 TRANSMIT
Contact rows. Real links only; no fake ones.

---

## 5. Mobile — this is the priority, not an afterthought

The prototype is desktop-first. **Redesign these for touch; don't just let them shrink.**

**Navigation.** On `<768px`, module nav becomes a **fixed bottom bar** (thumb reach), full
width, five items, short labels, `env(safe-area-inset-bottom)` respected. Active item gets the
yellow fill. Keep the top status bar but drop to one line.

**Builds.** Single column. Deck first, shelf below as a **horizontal scroll-snap row**
(`scroll-snap-type: x mandatory`) so cassettes stay large and swipeable rather than shrinking.
Readout stacks under the deck. Cassette min tap target 44×44 throughout.

**Journey.** Keep the SVG trace (it scales), but **hide the year labels under 640px** and make
the era chips a horizontal scroll-snap row — chips are the primary control on mobile, the trace
is decoration there. Selected chip should `scrollIntoView({ block: 'nearest' })`.

**Effects.**
- Disable the mouse-parallax translate entirely on `(hover: none)` — it does nothing on touch
  and costs a repaint per move. Also throttle it to `requestAnimationFrame` on desktop.
- Scanline overlay: reduce opacity to ~0.3 on mobile.
- Drop the full-screen flicker animation on mobile.
- `filter: drop-shadow()` only on the single trace path, never on many elements at once.

**Boot.** 2.1s is too long on a phone. Use **1.2s on mobile**, tap-anywhere-to-skip, and
`sessionStorage` to skip it entirely on repeat views within a session. (Fine here — this is a
real site, not a sandboxed artifact.)

**Type.** Clamp all display sizes so nothing overflows at 320px. Test at 320, 375, 390, 768.

**No horizontal scroll anywhere.** `overflow-x: hidden` on the shell is a patch, not a fix —
find the actual overflowing element.

---

## 6. Performance budget

- Lighthouse mobile ≥ 95 across the board. LCP < 1.5s on simulated 4G.
- Total JS < 90KB gzipped. If a dependency pushes past that, drop the dependency.
- No layout shift: reserve height for the deck slot, readout panel, and era card so swapping
  modules doesn't jump. CLS target 0.
- Animate only `transform` and `opacity`. Never animate `width`/`height`/`top`/`left`.
  (The waveform `stroke-dashoffset` draw is the one allowed exception — one path, once.)
- `will-change` sparingly and only on elements actually mid-transition.
- Respect `prefers-reduced-motion: reduce` — kill the boot, glitch transitions, spinning reels,
  VU animation and trace draw; keep static end states. This must be genuinely usable, not broken.

---

## 7. Accessibility (non-negotiable)

- Real `<button>` / `<a>` elements. Module nav is a proper tablist with roving focus.
- Visible focus rings — a yellow outline that fits the aesthetic, never `outline: none`.
- Cassettes are buttons: keyboard-operable, `aria-pressed`, meaningful labels
  ("Load AUXD cassette").
- Live regions announce state changes ("AUXD loaded", "era: Criteo").
- **`/resume` route**: plain, semantic, unstyled-ish HTML with the same content. Linked from the
  "skip → plain résumé" control in the hint bar. This is the recruiter escape hatch and the
  crawlable version — it matters.
- Colour contrast: the `--mute` grey on `--void` is borderline. Bump it until body text passes
  AA (4.5:1). Decorative labels can stay dim.

---

## 8. SEO / sharing

- Full metadata in `layout.tsx`: title, description, canonical.
- OpenGraph + Twitter card. Generate the OG image with `next/og` (ImageResponse) in the same
  visual language — black, yellow, the GURI wordmark. This gets seen every time the link is
  posted on LinkedIn, so it matters more than usual.
- JSON-LD `Person` schema with `sameAs` links.
- `sitemap.ts` and `robots.ts`.

---

## 9. Content — real data, use verbatim

**Profile.** Gurmeherdeep Singh (Guri) Chatha. Data Analyst, Criteo — Global Client Operations
Center, AMS. Based Gurugram, India. Framing: *electronics engineer by training, analyst by
trade, builder by choice.*

**Projects.**
- **AUXD** — theauxd.vercel.app — "Letterboxd, but for music." Album-first social platform.
  Rate out of 5★ with a 6th star for favourites, write short reviews called Takes, build a taste
  profile, follow friends, discover through people rather than an algorithm. Doesn't replace
  Spotify — you listen wherever you already listen. Built solo end-to-end: UX, database, auth,
  music catalogue, social features, deploy. *Next.js, TypeScript, Supabase, PostgreSQL,
  MusicBrainz.* Accent: magenta.
- **LORES** — lores.in — WhatsApp chat export → designed PDF report. Six modes: Sweetheart,
  Ride or Die, Group Wrapped, Family, Work, Roast. Parsing runs client-side; the chat never
  leaves the device. *React, Gemini, Supabase, Razorpay.* Accent: green.

**Journey eras** (all real — take exact wording from `guri-hud-v4.jsx`):
1. **2019–2023 · Thapar Institute** — B.Tech Electronic & Computer Engineering. Built a
   3D-printed photogrammetry scanner (SolidWorks rig + Flutter app). Hospitality Head, Thapar
   Adventure Club. Accent cyan.
2. **Jan–Aug 2023 · Mylo** — Product Analyst Intern. 8 mos. Accent green.
3. **Sep 2023–Oct 2024 · Mylo** — Data Analyst. 1 yr 2 mos. Supply chain + D2C logistics, P&L
   dashboards, logistics cost modelling, credit-note recovery via data audit. Accent green.
4. **Oct 2024–present · Criteo** — Data Analyst, GCOC (joined APAC, now AMS). Accent yellow.
5. **2026–present · Shipping** — indie products. Accent magenta.

The through-line: **hardware → data → product.** The 2020 scanner and the 2026 music platform
are the same instinct, six years of tooling apart. Keep that line in the final era.

**Stack.** DATA: SQL, Python, BigQuery, Hive, Tableau, Power BI, Excel modelling.
SHIP KIT: Next.js, TypeScript, React, Supabase, PostgreSQL, Razorpay, Gemini, Vercel.
EARLIER: Flutter, SolidWorks, C, photogrammetry.
EDU: Thapar Institute, B.Tech Electronic & Computer Engineering (2019–2023).
CERT: Google — Foundations: Data, Data, Everywhere.

**Links.** LinkedIn: `/in/gurmeherdeepchatha2001`. AUXD and LORES as above.
Email and GitHub: **leave as clearly-marked TODO placeholders — do not invent them.**

---

## 10. Explicitly do NOT

- Do not add Tailwind, framer-motion, GSAP, three.js, or a component library.
- Do not use purple/violet gradients. The palette above is the palette.
- Do not add stock images, avatars, or icon libraries beyond a handful of inline SVGs.
- Do not add percentage/proficiency bars anywhere.
- Do not invent contact details, dates, employers, metrics, or testimonials.
- Do not make the site a long vertical scroll — it's a module switcher.
- Do not gate content behind the animation. Every module must be reachable immediately.

---

## 11. Build order

1. Scaffold + tokens + fonts + `Frame` chrome (topbar, brackets, nav, FX) — desktop and mobile
   nav both working.
2. PROFILE + boot sequence.
3. BUILDS tape deck — the signature interaction. Get it right before moving on.
4. JOURNEY signal trace.
5. STACK + TRANSMIT + `/resume`.
6. Metadata, OG image, a11y pass, Lighthouse pass.

Commit at each step. After step 3 and step 6, run a mobile check at 375px and report Lighthouse.

---

## 12. Later (do not build now)

- Sound design: mechanical clunk on cassette insert, tape hiss on play, UI blips. Must be
  behind a mute toggle, default **off**, and initialised only after a user gesture (autoplay is
  blocked). This is the single biggest jump in feel — but only after the site ships.
- A third cassette slot when the next product is ready.

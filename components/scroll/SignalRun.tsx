'use client';

import { CSSProperties, useEffect, useMemo, useRef, useState } from 'react';
import { ERAS, formatDuration } from '@/content/journey';
import { CHANNELS, LOCATION, SIGNOFF } from '@/content/links';
import { PROFILE } from '@/content/profile';
import { TAPES } from '@/content/projects';
import { BANKS, CREDENTIALS, ERA } from '@/content/stack';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import styles from './SignalRun.module.css';

interface SignalRunProps {
  onExit: () => void;
}

const SCENES = [
  { id: 'signal-profile', no: '00', label: 'IDENTITY', colour: '#00e5ff' },
  { id: 'signal-builds', no: '01', label: 'BUILDS', colour: '#ff2e6e' },
  { id: 'signal-journey', no: '02', label: 'JOURNEY', colour: '#fcee0a' },
  { id: 'signal-stack', no: '03', label: 'STACK', colour: '#22f5a8' },
  { id: 'signal-transmit', no: '04', label: 'TRANSMIT', colour: '#00e5ff' },
] as const;

type RunStyle = CSSProperties & Record<`--${string}`, string | number>;

function SignalField({
  active,
  progress,
}: {
  active: number;
  progress: React.MutableRefObject<number>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = (time = 0) => {
      context.clearRect(0, 0, width, height);
      const p = progress.current;
      const colour = SCENES[active]?.colour ?? SCENES[0].colour;

      context.lineWidth = 1;
      context.strokeStyle = 'rgba(135, 148, 168, 0.055)';
      for (let x = 0; x <= width; x += 56) {
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }
      for (let y = 0; y <= height; y += 56) {
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }

      const base = height * (0.45 + p * 0.16);
      const amplitude = Math.min(74, 12 + p * 72) * Math.min(1, width / 920);
      const speed = reduced ? 0 : time * 0.00045;
      const gradient = context.createLinearGradient(0, 0, width, 0);
      gradient.addColorStop(0, 'rgba(0, 229, 255, 0)');
      gradient.addColorStop(0.24, `${colour}66`);
      gradient.addColorStop(0.68, `${colour}bb`);
      gradient.addColorStop(1, 'rgba(252, 238, 10, 0)');
      context.strokeStyle = gradient;
      context.lineWidth = 1.5;
      context.beginPath();
      for (let x = -4; x <= width + 4; x += 4) {
        const normalized = x / Math.max(width, 1);
        const envelope = Math.sin(Math.PI * Math.max(0, Math.min(1, normalized)));
        const wave =
          Math.sin(x * (0.008 + p * 0.01) + speed * 8) * 0.58 +
          Math.sin(x * 0.027 - speed * 4) * (0.15 + p * 0.22) +
          Math.sin(x * 0.071 + speed * 2) * p * 0.16;
        const y = base + wave * amplitude * envelope;
        if (x === -4) context.moveTo(x, y);
        else context.lineTo(x, y);
      }
      context.stroke();

      context.fillStyle = `${colour}88`;
      for (let i = 0; i < 13; i += 1) {
        const x = ((i * 197 + p * width * 0.45) % (width + 80)) - 40;
        const y = (i * 113 + height * 0.18) % Math.max(height, 1);
        const flicker = reduced ? 1 : 0.5 + Math.sin(time * 0.002 + i) * 0.5;
        context.globalAlpha = 0.08 + flicker * 0.15;
        context.fillRect(x, y, i % 3 === 0 ? 12 : 3, 1);
      }
      context.globalAlpha = 1;

      if (!reduced) frame = window.requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, [active, progress, reduced]);

  return <canvas ref={canvasRef} className={styles.signalField} aria-hidden="true" />;
}

function ProjectVisual({ id }: { id: string }) {
  if (id === 'auxd') {
    return (
      <div className={`${styles.projectVisual} ${styles.auxVisual}`} aria-hidden="true">
        <div className={styles.albumOrbit}>
          <span>A</span>
          <i />
        </div>
        <div className={styles.ratingTrack}>
          {[1, 2, 3, 4, 5, 6].map((star) => (
            <b key={star}>★</b>
          ))}
        </div>
        <span className={styles.visualCode}>TASTE / PEOPLE / SIGNAL</span>
      </div>
    );
  }

  return (
    <div className={`${styles.projectVisual} ${styles.loresVisual}`} aria-hidden="true">
      <div className={styles.analysisTopbar}>
        <span>INPUT / WHATSAPP_EXPORT.TXT</span>
        <b><i /> LOCAL ANALYSIS</b>
      </div>

      <div className={styles.chatScanner}>
        <div className={styles.threadRail}>
          <span>01</span><span>02</span><span>03</span><span>04</span><span>05</span><span>06</span>
        </div>
        <div className={styles.messageFeed}>
          <div className={styles.messageA}>
            <small>23:07 · A</small>
            <p>you&apos;re not going to believe what happened</p>
            <i><span>TONE</span><b>EXCITED</b></i>
          </div>
          <div className={styles.messageB}>
            <small>B · 23:08</small>
            <p>voice note. now.</p>
            <i><span>REPLY</span><b>00:42</b></i>
          </div>
          <div className={styles.messageA}>
            <small>23:12 · A</small>
            <p>okay but you cannot judge me 😭</p>
            <i><span>SIGNAL</span><b>TRUST</b></i>
          </div>
          <div className={styles.messageB}>
            <small>B · 23:12</small>
            <p>too late. sending snacks.</p>
            <i><span>PATTERN</span><b>CARE</b></i>
          </div>
        </div>
        <div className={styles.scanBeam}>
          <span>SCANNING THREAD</span>
        </div>
      </div>

      <div className={styles.analysisRail}>
        <div><small>CONVERSATION RHYTHM</small><span><i /><i /><i /><i /><i /><i /><i /><i /></span></div>
        <div><small>RELATIONSHIP SIGNALS</small><b>TONE · TIMING · THREADS</b></div>
        <div><small>PRIVACY GATE</small><b>ON-DEVICE ✓</b></div>
      </div>

      <div className={styles.reportAssembler}>
        <span>REPORT ASSEMBLY</span>
        <strong>LORES</strong>
        <div><i /><i /><i /><i /></div>
        <b>PDF // 06 CHAPTERS</b>
      </div>

      <span className={styles.visualCode}>RAW CHAT / SIGNAL EXTRACTION / DESIGNED REPORT</span>
    </div>
  );
}

export default function SignalRun({ onExit }: SignalRunProps) {
  const rootRef = useRef<HTMLElement>(null);
  const scrollProgress = useRef(0);
  const reduced = useReducedMotion();
  const [activeScene, setActiveScene] = useState(0);
  const [activeEra, setActiveEra] = useState(0);
  const [selectedSkill, setSelectedSkill] = useState(BANKS[0].chips[0].id);

  const selectedChip = useMemo(
    () => BANKS.flatMap((bank) => bank.chips).find((chip) => chip.id === selectedSkill),
    [selectedSkill]
  );

  useEffect(() => {
    let frame = 0;
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      let sceneIndex = 0;
      SCENES.forEach((scene, index) => {
        const element = document.getElementById(scene.id);
        if (element && element.getBoundingClientRect().top <= window.innerHeight * 0.44) {
          sceneIndex = index;
        }
      });
      scrollProgress.current = value;
      rootRef.current?.style.setProperty('--run-progress', String(value));
      setActiveScene((current) => (current === sceneIndex ? current : sceneIndex));
      frame = 0;
    };
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-era-index]'));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActiveEra(Number((visible.target as HTMLElement).dataset.eraIndex));
      },
      { rootMargin: '-32% 0px -42% 0px', threshold: [0.15, 0.4, 0.7] }
    );
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  const jumpTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  };

  const switchMode = () => {
    window.scrollTo({ top: 0 });
    onExit();
  };

  const era = ERAS[activeEra];

  return (
    <main
      ref={rootRef}
      className={styles.run}
      style={{ '--scene-colour': SCENES[activeScene].colour } as RunStyle}
    >
      <SignalField active={activeScene} progress={scrollProgress} />
      <div className={styles.scanlines} aria-hidden="true" />
      <div className={styles.noise} aria-hidden="true" />

      <header className={styles.hud}>
        <button className={styles.brand} type="button" onClick={() => jumpTo('signal-profile')}>
          <b>GURI//OS</b>
          <span>SIGNAL RUN · 2.0</span>
        </button>
        <div className={styles.hudStatus} aria-live="polite">
          <span className={styles.liveDot} />
          <span>{SCENES[activeScene].no}</span>
          <b>{SCENES[activeScene].label}</b>
        </div>
        <div className={styles.hudActions}>
          <span className={styles.mobileOnline}>
            <i /> ONLINE
          </span>
          <button className={styles.modeSwitch} type="button" onClick={switchMode}>
            <span className={styles.switchLong}>EXIT TO BOOT</span>
            <span className={styles.switchShort}>BOOT</span>
            {' ↗'}
          </button>
          <a className={styles.runResume} href="/resume">
            ▸ RÉSUMÉ
          </a>
        </div>
        <div className={styles.progressRail} aria-hidden="true">
          <i />
        </div>
      </header>

      <nav className={styles.sceneNav} aria-label="Signal Run sections">
        {SCENES.map((scene, index) => (
          <button
            key={scene.id}
            type="button"
            className={activeScene === index ? styles.activeScene : ''}
            onClick={() => jumpTo(scene.id)}
            aria-label={`Go to ${scene.label}`}
            aria-current={activeScene === index ? 'location' : undefined}
          >
            <span>{scene.no}</span>
            <b>{scene.label}</b>
          </button>
        ))}
      </nav>

      <section id="signal-profile" className={`${styles.scene} ${styles.hero}`} data-run-section>
        <div className={styles.heroHalo} aria-hidden="true">
          <i />
          <i />
          <i />
          <span>Profile ID: 2409-GC</span>
        </div>
        <div className={styles.heroCopy}>
          <p className={styles.kicker}>{PROFILE.eyebrow}</p>
          <h1 className={styles.heroName} aria-label={PROFILE.name}>
            <span>GU</span>
            <span>RI</span>
          </h1>
          <p className={styles.fullName}>{PROFILE.fullName}</p>
          <h2 className={styles.roleLine}>
            {PROFILE.role.a} <i>×</i> {PROFILE.role.b}
          </h2>
          <p className={styles.heroBio}>
            {PROFILE.bio.map((part, index) =>
              part.b ? <strong key={index}>{part.t}</strong> : <span key={index}>{part.t}</span>
            )}
          </p>
          <div className={styles.identityGrid}>
            {PROFILE.chips.map((chip) => (
              <span key={chip.k}>
                <small>{chip.k}</small>
                <b>{chip.v}</b>
              </span>
            ))}
          </div>
        </div>
        <button className={styles.scrollCue} type="button" onClick={() => jumpTo('signal-builds')}>
          <span>ENTER THE SIGNAL</span>
          <i />
        </button>
      </section>

      <section id="signal-builds" className={`${styles.scene} ${styles.builds}`} data-run-section>
        <div className={styles.sceneHeading}>
          <span>01 / SHIPPED SYSTEMS</span>
          <h2>THE WORK<br />BECOMES REAL.</h2>
          <p>Two products. Built from first question to final deploy.</p>
        </div>

        <div className={styles.projectStream}>
          {TAPES.map((tape, index) => (
            <article
              className={`${styles.projectStep} ${index === 1 ? styles.projectStepAlt : ''}`}
              key={tape.id}
              style={{ '--project-accent': tape.ac } as RunStyle}
            >
              <div className={styles.projectCard}>
                <div className={styles.projectIndex}>
                  <span>{tape.mod}</span>
                  <b>0{index + 1}</b>
                </div>
                <div className={styles.projectLayout}>
                  <ProjectVisual id={tape.id} />
                  <div className={styles.projectCopy}>
                    <p>{tape.side}</p>
                    <h3>{tape.name}</h3>
                    <h4>{tape.tag}</h4>
                    <p className={styles.projectDescription}>{tape.copy}</p>
                    <div className={styles.projectFacts}>
                      {tape.cells.map(([key, value]) => (
                        <span key={key}>
                          <small>{key}</small>
                          <b>{value}</b>
                        </span>
                      ))}
                    </div>
                    <div className={styles.techRow}>
                      {tape.stack.map((tech) => <span key={tech}>{tech}</span>)}
                    </div>
                    <a href={tape.href} target="_blank" rel="noreferrer">
                      OPEN {tape.label} ↗
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section id="signal-journey" className={`${styles.scene} ${styles.journey}`} data-run-section>
        <div className={styles.journeyIntro}>
          <span>02 / CAREER SIGNAL</span>
          <h2 className={styles.journeyTitle}>
            <span>HARDWARE</span>
            <span><i>→</i> DATA</span>
            <span><i>→</i> PRODUCT</span>
          </h2>
          <p>The frequency rises as the work compounds.</p>
        </div>

        <div className={styles.journeyGrid}>
          <aside className={styles.scope} style={{ '--era-accent': era.hex } as RunStyle}>
            <div className={styles.scopeHead}>
              <span>LIVE TRACE</span>
              <b>{String(activeEra + 1).padStart(2, '0')} / {String(ERAS.length).padStart(2, '0')}</b>
            </div>
            <div className={styles.scopeWave} aria-hidden="true">
              {Array.from({ length: 21 }, (_, index) => (
                <i
                  key={index}
                  style={{
                    '--bar': `${16 + Math.abs(Math.sin(index * era.sig.freq * 42)) * era.sig.amp * 78}%`,
                    '--delay': `${index * -0.045}s`,
                  } as RunStyle}
                />
              ))}
            </div>
            <p>{era.when}</p>
            <h3>{era.org}</h3>
            <strong>{era.role}</strong>
            <div className={styles.scopeData}>
              <span>FREQ <b>{Math.round(era.sig.freq * 1000)}Hz</b></span>
              <span>HARM <b>{era.sig.harm}</b></span>
              <span>AMP <b>{Math.round(era.sig.amp * 100)}%</b></span>
            </div>
          </aside>

          <div className={styles.eraStream}>
            {ERAS.map((item, index) => (
              <article
                key={`${item.org}-${item.when}`}
                className={`${styles.eraCard} ${activeEra === index ? styles.eraCardActive : ''}`}
                data-era-index={index}
                style={{ '--era-accent': item.hex } as RunStyle}
              >
                <div className={styles.eraMarker}>
                  <b>{item.yr}</b>
                  <i />
                </div>
                <div className={styles.eraCopy}>
                  <div className={styles.eraMeta}>
                    <span>{item.when}</span>
                    <b>{item.since ? formatDuration(item.since) : item.dur}</b>
                  </div>
                  <h3>{item.org}</h3>
                  <h4>{item.role}</h4>
                  <p>
                    {item.body.map((part, partIndex) =>
                      part.b ? <strong key={partIndex}>{part.t}</strong> : <span key={partIndex}>{part.t}</span>
                    )}
                  </p>
                  <div className={styles.augmentRow}>
                    {item.augs.map((augment) => <span key={augment}>{augment}</span>)}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="signal-stack" className={`${styles.scene} ${styles.stack}`} data-run-section>
        <div className={styles.sceneHeading}>
          <span>03 / CAPABILITY MATRIX</span>
          <h2>TOOLS ARE<br />MEMORY.</h2>
          <p>Every module entered through a real piece of work. Select one to inspect its trace.</p>
        </div>

        <div className={styles.stackConsole}>
          <div className={styles.bankField}>
            {BANKS.map((bank) => (
              <section key={bank.id} className={styles.bank}>
                <h3>{bank.cap}</h3>
                <div className={styles.chipGrid}>
                  {bank.chips.map((chip) => (
                    <button
                      key={chip.id}
                      type="button"
                      className={selectedSkill === chip.id ? styles.selectedChip : ''}
                      style={{ '--chip-accent': ERA[chip.era].c } as RunStyle}
                      onClick={() => setSelectedSkill(chip.id)}
                    >
                      <i />
                      <span>{chip.name}</span>
                      <small>{ERA[chip.era].label}</small>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>

          <aside className={styles.skillReadout} style={{ '--chip-accent': selectedChip ? ERA[selectedChip.era].c : '#22f5a8' } as RunStyle}>
            <span>SELECTED MODULE</span>
            <h3>{selectedChip?.name}</h3>
            <p>{selectedChip?.note}</p>
            <div>
              <small>LINKED SYSTEMS</small>
              <p>{selectedChip?.links.length ? selectedChip.links.join(' / ').toUpperCase() : 'STANDALONE MODULE'}</p>
            </div>
          </aside>
        </div>

        <div className={styles.credentials}>
          {CREDENTIALS.map((credential) => (
            <span key={credential.k + credential.v}>
              <small>{credential.k}</small>
              <b>{credential.v}</b>
            </span>
          ))}
        </div>
      </section>

      <section id="signal-transmit" className={`${styles.scene} ${styles.transmit}`} data-run-section>
        <div className={styles.transmitGlow} aria-hidden="true">TX</div>
        <div className={styles.transmitHead}>
          <span>04 / OPEN CHANNELS</span>
          <h2>LET&apos;S MAKE<br />A SIGNAL.</h2>
          <p>{LOCATION} · ONLINE</p>
        </div>

        <div className={styles.channelGrid}>
          {CHANNELS.map((channel, index) => (
            <a
              key={channel.id}
              href={channel.href}
              target={channel.href.startsWith('http') ? '_blank' : undefined}
              rel={channel.href.startsWith('http') ? 'noreferrer' : undefined}
              style={{ '--channel-accent': channel.accent } as RunStyle}
            >
              <span>0{index + 1}</span>
              <div>
                <strong>{channel.label}</strong>
                <small>{channel.value}</small>
              </div>
              <b>{channel.status}</b>
              <i>↗</i>
            </a>
          ))}
        </div>

        <div className={styles.terminal}>
          <p><b>{SIGNOFF.prompt}:~$</b> whoami</p>
          <p>{SIGNOFF.whoami}</p>
          <p><b>{SIGNOFF.prompt}:~$</b> status</p>
          <p>{SIGNOFF.status}</p>
          <strong>// END OF SIGNAL — BEGIN SOMETHING</strong>
        </div>

        <footer className={styles.runFooter}>
          <span>GURI//OS · SIGNAL RUN 2.0</span>
          <button type="button" onClick={() => jumpTo('signal-profile')}>RETURN TO SOURCE ↑</button>
          <button type="button" onClick={switchMode}>SWITCH EXPERIENCE ↗</button>
        </footer>
      </section>
    </main>
  );
}

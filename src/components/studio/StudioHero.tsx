'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { business, stats } from '@/content/site';
import type { StudioInput } from './StudioCanvas';
import { setSound, sfx } from './sfx';
import { asset } from '@/lib/asset';

const StudioCanvas = dynamic(() => import('./StudioCanvas'), { ssr: false });

const SCENES = 5;
// NPZ reels shown on the studio's back wall (muted, trimmed to about 8 s each)
const REELS = ['/media/reel-al-anwar.mp4', '/media/reel-sandwich.mp4', '/media/reel-street-food.mp4'].map(asset);
const REEL_MODE: 'wall' | 'fit' = 'fit'; // user picked fit on 2026-11-25

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(c.getContext('webgl2') || c.getContext('webgl'));
  } catch {
    return false;
  }
}

function setPageState(s: 'dark' | 'lit' | 'page') {
  const r = document.documentElement;
  if (r.dataset.set !== s) r.dataset.set = s;
}

export default function StudioHero() {
  const track = useRef<HTMLDivElement>(null);
  const stick = useRef<HTMLDivElement>(null);
  const hud = useRef<HTMLDivElement>(null);
  const tc = useRef<HTMLDivElement>(null);
  const shutter = useRef<HTMLDivElement>(null);
  const input = useRef<StudioInput>({ target: 0, mx: 0, my: 0 });
  const lit = useRef(false);
  const inStudio = useRef(true);
  const pov = useRef(false);
  const recT = useRef(0);

  const [mount3d, setMount3d] = useState(false);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [reduce, setReduce] = useState(false);
  const [sound, setSoundState] = useState(false);
  const [slot, setSlot] = useState<HTMLElement | null>(null);

  // load the 3D scene once the page is idle, and only where WebGL works
  useEffect(() => {
    setReduce(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setSlot(document.getElementById('header-slot'));
    setPageState('dark');
    if (!hasWebGL()) return;
    const go = () => setMount3d(true);
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number };
    if (w.requestIdleCallback) w.requestIdleCallback(go, { timeout: 1200 });
    else setTimeout(go, 200);
  }, []);

  // scroll drives the scene; when scrolling stops, settle on the nearest scene in the direction of travel
  useEffect(() => {
    const t = track.current!;
    let settleT = 0, settling = false, lastY = window.scrollY, dir = 1;
    const read = () => {
      const r = t.getBoundingClientRect();
      const total = t.offsetHeight - window.innerHeight;
      input.current.target = Math.max(0, Math.min(1, -r.top / total));
      const inside = r.bottom > 64;
      if (inside !== inStudio.current) inStudio.current = inside;
      setPageState(inside ? (lit.current ? 'lit' : 'dark') : 'page');
    };
    const onScroll = () => {
      read();
      if (Math.abs(window.scrollY - lastY) > 0.5) dir = window.scrollY > lastY ? 1 : -1;
      lastY = window.scrollY;
      if (settling) return;
      clearTimeout(settleT);
      settleT = window.setTimeout(() => {
        const top = t.getBoundingClientRect().top + window.scrollY, vh = window.innerHeight, y = window.scrollY - top;
        if (y < 0 || y > t.offsetHeight - vh) return;
        const f = y / vh, base = Math.floor(f), frac = f - base;
        const idx = dir > 0 ? (frac > 0.12 ? base + 1 : base) : frac < 0.88 ? base : base + 1;
        const goal = top + Math.min(idx * vh, t.offsetHeight - vh);
        if (Math.abs(goal - window.scrollY) < 4) return;
        const instant = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        settling = true;
        window.scrollTo({ top: goal, behavior: instant ? 'auto' : 'smooth' });
        setTimeout(() => (settling = false), instant ? 0 : 700);
      }, 140);
    };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      input.current.mx = (e.clientX / window.innerWidth) * 2 - 1;
      input.current.my = (e.clientY / window.innerHeight) * 2 - 1;
    };
    read();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', read);
    window.addEventListener('pointermove', onMove);
    const io = new IntersectionObserver(([e]) => setActive(e.isIntersecting));
    io.observe(stick.current!);
    return () => {
      clearTimeout(settleT);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', read);
      window.removeEventListener('pointermove', onMove);
      io.disconnect();
      setPageState('page');
    };
  }, []);

  const events = useMemo(
    () => ({
      onSwitch: () => sfx.switch(),
      onShutter: () => {
        sfx.shutter();
        const el = shutter.current;
        if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        el.classList.remove('snap');
        void el.offsetWidth;
        el.classList.add('snap');
      },
      onLit: (l: boolean) => {
        lit.current = l;
        if (inStudio.current) setPageState(l ? 'lit' : 'dark');
      },
      onPov: (on: boolean) => {
        pov.current = on;
        recT.current = 0;
        hud.current?.classList.toggle('on', on);
      },
    }),
    [],
  );

  const onTick = useCallback((_now: number, dt: number) => {
    if (!pov.current || !tc.current) return;
    recT.current += dt;
    const s = Math.floor(recT.current), fr = Math.floor((recT.current % 1) * 25);
    tc.current.textContent = `00:00:${String(s % 60).padStart(2, '0')}:${String(fr).padStart(2, '0')}`;
  }, []);
  const onReady = useCallback(() => setReady(true), []);

  const toggleSound = () => {
    const next = !sound;
    setSoundState(next);
    setSound(next);
  };

  return (
    <div ref={track} className="studio-track" style={{ height: `${SCENES * 100}vh` }}>
      <div ref={stick} className="studio-stick">
        <div className={`studio-poster${ready ? ' is-hidden' : ''}`} aria-hidden="true" />
        {mount3d && <StudioCanvas input={input} events={events} reduce={reduce} active={active} onTick={onTick} onReady={onReady} reels={REELS} reelMode={REEL_MODE} />}
        <div className="studio-scrim" aria-hidden="true" />
        <div ref={hud} className="hud" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
          <div className="rec">
            <b />
            REC
          </div>
          <div ref={tc} className="tc">
            00:00:00:00
          </div>
          <div className="cross" />
        </div>
        <div ref={shutter} className="shutter" aria-hidden="true" />
      </div>

      <div className="studio-panels">
        <section className="panel" aria-labelledby="hero-title">
          <div>
            <h1 id="hero-title">
              Photography, video and <em>social media</em> for growing brands.
            </h1>
            <p>We plan, shoot, edit and publish content for restaurants, fashion, jewellery and interior brands.</p>
            <a className="cta" href={`tel:${business.phones[0].tel}`}>
              Call {business.phones[0].display}
            </a>
            {mount3d && <p className="hint">Scroll to switch on the lights. Drag to spin the turntable.</p>}
          </div>
        </section>
        <section className="panel">
          <div>
            <h2>
              Lit, shot and <em>edited</em> in-house.
            </h2>
            <p>Product shoots, brand films, reels and model shoots, with editing, colour grading and motion graphics done by the same team.</p>
          </div>
        </section>
        <section className="panel">
          <div>
            <h2>
              Shot on our <em>own kit</em>.
            </h2>
            <p>Sony ZV-E10 camera, gimbal, LED video lights, a soft lighting setup, wireless microphones and tripods.</p>
          </div>
        </section>
        <section className="panel">
          <div>
            <h2>
              Through the <em>lens</em>.
            </h2>
            <p>Every project runs through eight steps, from brand discovery to publishing and growth.</p>
          </div>
        </section>
        <section className="panel pov" aria-label="NPZ in numbers">
          <div>
            <dl className="stats">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <b>
                      {s.value}
                      <span>{s.unit}</span>
                    </b>
                    <small aria-hidden="true">{s.label}</small>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      </div>

      {slot &&
        mount3d &&
        createPortal(
          <button type="button" className="sound" aria-pressed={sound} onClick={toggleSound}>
            {sound ? 'Sound on' : 'Sound off'}
          </button>,
          slot,
        )}
    </div>
  );
}

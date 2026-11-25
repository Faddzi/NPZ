'use client';

// The 3D studio, drawn with plain three.js. (It used React Three Fiber until the Next 16 security update:
// Next 16 runs React 19, which Fiber 8 does not support, and Fiber 9 needs a newer three.js that changes the colours.)
// The renderer settings below copy what Fiber 8 set up with `legacy`, so the scene looks the same.
import { useEffect, useRef, type MutableRefObject } from 'react';
import * as THREE from 'three';
import { buildStudio, type StudioEvents } from './buildStudio';

export type StudioInput = {
  target: number; // scroll progress through the studio, 0 to 1
  mx: number; // cursor, -1 to 1
  my: number;
};

type Props = {
  input: MutableRefObject<StudioInput>;
  events: StudioEvents;
  reduce: boolean;
  active: boolean; // false when the studio is off screen: the loop stops
  onTick?: (now: number, dt: number) => void;
  onReady?: () => void;
  reels?: string[];
  reelMode?: 'wall' | 'fit';
};

export default function StudioCanvas({ input, events, reduce, active, onTick, onReady, reels, reelMode }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const activeRef = useRef(active);
  const startLoop = useRef<() => void>(() => {});
  const ev = useRef(events);
  const tick = useRef(onTick);
  useEffect(() => {
    ev.current = events;
    tick.current = onTick;
  });

  useEffect(() => {
    const host = wrap.current;
    if (!host) return;

    // colour handling as React Three Fiber 8 did it with `legacy` on three r150
    const cm = THREE.ColorManagement as unknown as { enabled?: boolean; legacyMode?: boolean };
    if ('enabled' in cm) cm.enabled = false;
    else cm.legacyMode = true;

    const gl = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    gl.outputEncoding = THREE.sRGBEncoding;
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.shadowMap.enabled = true;
    gl.shadowMap.type = THREE.PCFSoftShadowMap;
    gl.shadowMap.autoUpdate = false;
    gl.domElement.style.display = 'block';
    host.appendChild(gl.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 1.9, 9.6);
    camera.lookAt(0, 0, 0);

    // resolution: start at the screen's own (max 2), drop when frames run slow, never below MIN
    const max = Math.min(window.devicePixelRatio || 1, 2);
    // never render below the screen's own resolution on 1x screens: lower values made the NPZ mark and text look pixelated
    const MIN = Math.min(max, 1.25);
    let factor = 0.5;
    let dpr = max;
    gl.setPixelRatio(dpr);

    // desktop: scene sits right of the copy; mobile: wider lens, scene shifted up above the copy
    const resize = () => {
      const w = host.clientWidth || 1;
      const h = host.clientHeight || 1;
      gl.setSize(w, h);
      camera.aspect = w / h;
      const narrow = w < 700;
      camera.fov = narrow ? 58 : 38;
      if (narrow) camera.setViewOffset(w, h, 0, h * 0.22, w, h);
      else camera.setViewOffset(w, h, -w * 0.2, 0, w, h);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);

    const s = buildStudio(
      gl,
      scene,
      reduce,
      {
        onSwitch: () => ev.current.onSwitch(),
        onShutter: () => ev.current.onShutter(),
        onLit: (l) => ev.current.onLit(l),
        onPov: (o) => ev.current.onPov(o),
      },
      { reels, reelMode },
    );
    onReady?.();

    // drag to spin the turntable
    const el = gl.domElement;
    let down = false;
    let lastX = 0;
    const pd = (e: PointerEvent) => {
      down = true;
      lastX = e.clientX;
    };
    const pm = (e: PointerEvent) => {
      if (!down) return;
      s.drag(e.clientX - lastX);
      lastX = e.clientX;
    };
    const pu = () => {
      if (!down) return;
      down = false;
      s.drag(null);
    };
    el.addEventListener('pointerdown', pd);
    window.addEventListener('pointermove', pm);
    window.addEventListener('pointerup', pu);

    // frame loop
    const clock = new THREE.Clock();
    let prog = input.current.target;
    const mouse = { x: 0, y: 0 };
    let raf = 0;
    let frames = 0;
    let windowStart = performance.now();
    const frame = () => {
      raf = 0;
      if (!activeRef.current) return;
      raf = requestAnimationFrame(frame);
      const dt = Math.min(0.05, clock.getDelta());
      const now = clock.elapsedTime;
      const t = input.current.target;
      prog += reduce ? t - prog : (t - prog) * Math.min(1, dt * 10);
      if (!reduce) {
        mouse.x += (input.current.mx - mouse.x) * Math.min(1, dt * 3);
        mouse.y += (input.current.my - mouse.y) * Math.min(1, dt * 3);
      }
      s.update(camera, { now, dt, p: prog, mx: mouse.x, my: mouse.y });
      tick.current?.(now, dt);
      gl.render(scene, camera);

      // every 2.5 s: lower the resolution if frames ran under 50 fps, raise it again when there is headroom
      frames++;
      const span = performance.now() - windowStart;
      if (span >= 2500) {
        const fps = (frames * 1000) / span;
        frames = 0;
        windowStart = performance.now();
        const next = fps < 50 ? Math.max(0, factor - 0.1) : fps > 58 ? Math.min(1, factor + 0.1) : factor;
        if (next !== factor) {
          factor = next;
          const d = Math.round((MIN + (max - MIN) * factor) * 20) / 20;
          if (d !== dpr) {
            dpr = d;
            gl.setPixelRatio(dpr);
            resize();
          }
        }
      }
    };
    startLoop.current = () => {
      if (raf || !activeRef.current) return;
      clock.getDelta(); // don't count the paused time as one long frame
      frames = 0;
      windowStart = performance.now();
      raf = requestAnimationFrame(frame);
    };
    startLoop.current();

    return () => {
      cancelAnimationFrame(raf);
      startLoop.current = () => {};
      ro.disconnect();
      el.removeEventListener('pointerdown', pd);
      window.removeEventListener('pointermove', pm);
      window.removeEventListener('pointerup', pu);
      s.dispose();
      gl.dispose();
      el.remove();
    };
  }, [input, reduce, onReady, reels, reelMode]);

  // pause the loop while the studio is off screen
  useEffect(() => {
    activeRef.current = active;
    if (active) startLoop.current();
  }, [active]);

  return <div ref={wrap} aria-hidden="true" style={{ position: 'relative', width: '100%', height: '100%', overflow: 'hidden', touchAction: 'pan-y', cursor: 'grab' }} />;
}

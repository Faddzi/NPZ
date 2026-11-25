'use client';

import { useEffect, useRef } from 'react';
import { asset } from '@/lib/asset';

// Three short NPZ reels, muted and looping, that play only while on screen.
// Reduced motion shows the poster frames instead.
const reels = [
  { src: '/media/about-grill.mp4', poster: '/work/about-grill.webp', label: 'Street food reel: shawarma on the grill' },
  { src: '/media/about-lights.mp4', poster: '/work/about-lights.webp', label: 'Brand reel for a lighting store, presenter among festive lights' },
  { src: '/media/about-ride.mp4', poster: '/work/about-ride.webp', label: 'Travel film: rider on a motorcycle with the city skyline behind' },
];

export default function ReelFrames() {
  const list = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const vids = Array.from(list.current?.querySelectorAll('video') ?? []);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          const v = e.target as HTMLVideoElement;
          if (e.isIntersecting) v.play().catch(() => {});
          else v.pause();
        }),
      { threshold: 0.25 },
    );
    vids.forEach((v) => io.observe(v));
    return () => io.disconnect();
  }, []);

  return (
    <ul ref={list} className="reel-frames" aria-label="Recent reels">
      {reels.map((r) => (
        <li key={r.src}>
          <video muted loop playsInline preload="metadata" poster={asset(r.poster)} aria-label={r.label}>
            <source src={asset(r.src)} type="video/mp4" />
          </video>
        </li>
      ))}
    </ul>
  );
}

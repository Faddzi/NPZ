'use client';

import { useEffect, useRef } from 'react';
import { asset } from '@/lib/asset';

// A muted looping reel that plays only while on screen. Reduced motion, or no scripts, shows the poster.
export default function PlayOnView({ src, poster, label }: { src: string; poster: string; label: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => {}) : v.pause()), { threshold: 0.25 });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  return (
    <video ref={ref} muted loop playsInline preload="metadata" poster={asset(poster)} aria-label={label}>
      <source src={asset(src)} type="video/mp4" />
    </video>
  );
}

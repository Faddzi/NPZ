'use client';

import { useEffect, useRef, type ReactNode } from 'react';

// Images wipe in from the bottom as they enter the viewport. Text never animates.
export default function Reveal({ children, delay = 0 }: { children: ReactNode; delay?: number }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const node = el.current;
    if (!node || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let kill = () => {};
    let cancelled = false;
    void (async () => {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const tween = gsap.fromTo(
        node,
        { clipPath: 'inset(100% 0 0 0)' },
        {
          clipPath: 'inset(0% 0 0 0)',
          duration: 0.9,
          delay,
          ease: 'power3.out',
          scrollTrigger: { trigger: node, start: 'top 88%', once: true },
        },
      );
      kill = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    })();
    return () => {
      cancelled = true;
      kill();
    };
  }, [delay]);

  return <div ref={el}>{children}</div>;
}

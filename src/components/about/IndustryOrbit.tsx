'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { industries } from '@/content/site';

// Industries from slide 9 orbit a lens-like hub. Scrolling turns the ring; hovering a node names it in the hub.
// Under 820px the ring becomes a grid. Reduced motion keeps the ring still.

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const icon = (d: ReactNode) => (
  <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true" {...S}>
    {d}
  </svg>
);

const icons: ReactNode[] = [
  // restaurants & cafés: cloche
  icon(<><path d="M3 17h18" /><path d="M5 17a7 7 0 0 1 14 0" /><path d="M12 8V6.5" /><circle cx="12" cy="5.5" r="1" /></>),
  // fashion & clothing: t-shirt
  icon(<path d="M8.5 3.5 4 6l1.8 4 2-1V20h8.4V9l2 1L20 6l-4.5-2.5c-.6 1.5-2 2.5-3.5 2.5s-2.9-1-3.5-2.5Z" />),
  // jewellery & luxury: diamond
  icon(<><path d="M6 4h12l3 5-9 11L3 9Z" /><path d="M3 9h18" /><path d="m9 4-1.5 5L12 20l4.5-11L15 4" /></>),
  // home décor & interiors: armchair and lamp
  icon(<><path d="M3 13v-2a2 2 0 0 1 4 0v2h6v-2a2 2 0 0 1 4 0v2" /><path d="M3 13v4h14v-4" /><path d="M5 17v2M15 17v2" /><path d="M20 19V9" /><path d="M18 9h4l-1-4h-2Z" /></>),
  // food & beverage: cup with straw
  icon(<><path d="M6 8h12l-1.5 12h-9Z" /><path d="M5 8h14" /><path d="m13 8 2-5h3" /><path d="M7 13h10" /></>),
  // retail stores: shopping bag
  icon(<><path d="M5 8h14l-1 12H6Z" /><path d="M9 10V7a3 3 0 0 1 6 0v3" /></>),
  // lifestyle brands: sunglasses
  icon(<><path d="M2 10h20" /><path d="M3 10c0 3 1.3 5 4 5s4-2 4-5" /><path d="M13 10c0 3 1.3 5 4 5s4-2 4-5" /><path d="M11 11.5c.6-.6 1.4-.6 2 0" /></>),
  // beauty & cosmetics: lipstick
  icon(<><path d="M9 21h6V12H9Z" /><path d="M10 12V8l4-3v7" /><path d="M8 15h8" /></>),
  // footwear & accessories: sneaker
  icon(<><path d="M3 17V9l4 1 2 3 5 1.5c3 .8 7 1.5 7 3.5v1H3Z" /><path d="M3 19h18" /><path d="m10 13.5 1-1.5M12.5 14l1-1.5" /></>),
  // home & kitchen: pot
  icon(<><path d="M5 10h14v7a3 3 0 0 1-3 3H8a3 3 0 0 1-3-3Z" /><path d="M2 11h3M19 11h3" /><path d="M4 10h16" /><path d="M10 7h4" /><path d="M12 7V5.5" /></>),
  // events & hospitality: calendar with star
  icon(<><rect x="4" y="5" width="16" height="15" rx="1.5" /><path d="M4 9.5h16M8 3v4M16 3v4" /><path d="m12 11.5 1 2 2.2.3-1.6 1.5.4 2.2-2-1-2 1 .4-2.2-1.6-1.5 2.2-.3Z" /></>),
  // local businesses & startups: rocket
  icon(<><path d="M14 4c3 0 6 3 6 6l-6 6-6-6c0-3 3-6 6-6Z" transform="rotate(45 14 10)" /><circle cx="14.5" cy="9.5" r="1.6" /><path d="M8 15c-2 0-3.5 2-3.5 4.5C7 19.5 9 18 9 16" /><path d="m7.5 12.5-3-.5 2-3h3M11.5 16.5l.5 3 3-2v-3" /></>),
];

export default function IndustryOrbit() {
  const box = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);

  // scroll turns the ring a little, about a third of a turn across the section
  useEffect(() => {
    const el = box.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let raf = 0;
    const tick = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const p = (window.innerHeight - r.top) / (window.innerHeight + r.height);
      el.style.setProperty('--spin', `${(Math.max(0, Math.min(1, p)) - 0.5) * 120}deg`);
    };
    const on = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    tick();
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', on);
      window.removeEventListener('resize', on);
    };
  }, []);

  return (
    <div ref={box} className="orbit" data-active={active ?? undefined}>
      <div className="orbit-hub" aria-hidden="true">
        <span className="orbit-hub-ring" />
        <span className="orbit-hub-text">
          {active === null ? (
            <>
              <b>12</b>
              <small>industries</small>
            </>
          ) : (
            <em>{industries[active]}</em>
          )}
        </span>
      </div>
      <svg className="orbit-track" viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="40.5" />
      </svg>
      <ul className="orbit-ring">
        {industries.map((x, i) => (
          <li
            key={x}
            className="orbit-node"
            style={{ '--a': `${(i / industries.length) * 360}deg` } as React.CSSProperties}
            onPointerEnter={() => setActive(i)}
            onPointerLeave={() => setActive(null)}
          >
            <span className="orbit-node-in">
              {icons[i]}
              <span className="orbit-label">{x}</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

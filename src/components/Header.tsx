'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { business, nav } from '@/content/site';

export default function Header() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => setOpen(false), [path]);

  // close on Escape, keep focus inside the open menu
  useEffect(() => {
    if (!open) return;
    const first = panel.current?.querySelector<HTMLElement>('a');
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        btn.current?.focus();
      }
      if (e.key === 'Tab' && panel.current) {
        const f = Array.from(panel.current.querySelectorAll<HTMLElement>('a,button'));
        const items = [btn.current!, ...f];
        const i = items.indexOf(document.activeElement as HTMLElement);
        if (e.shiftKey && i <= 0) {
          e.preventDefault();
          items[items.length - 1].focus();
        } else if (!e.shiftKey && i === items.length - 1) {
          e.preventDefault();
          items[0].focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  const isCurrent = (href: string) => (href === '/' ? path === '/' : path.startsWith(href.replace(/\/$/, '')));

  return (
    <header className="site-header" data-open={open || undefined}>
      <Link href="/" className="logo" aria-label={`${business.short}, ${business.name}, home`}>
        NPZ
      </Link>
      <div className="header-right">
        <nav aria-label="Main" className="hidden md:block">
          <ul className="nav-links">
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={isCurrent(n.href) ? 'page' : undefined}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div id="header-slot" className="header-slot" />
        <a className="header-call md:hidden" href={`tel:${business.phones[0].tel}`}>
          Call
        </a>
        <button
          ref={btn}
          type="button"
          className="menu-btn md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Close' : 'Menu'}
        </button>
      </div>
      <div id="mobile-menu" ref={panel} className="mobile-menu md:hidden" hidden={!open}>
        <nav aria-label="Main">
          <ul>
            {nav.map((n) => (
              <li key={n.href}>
                <Link href={n.href} aria-current={isCurrent(n.href) ? 'page' : undefined}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <p>
          <a href={`tel:${business.phones[0].tel}`}>{business.phones[0].display}</a>
          <br />
          <a href={`mailto:${business.email}`}>{business.email}</a>
        </p>
      </div>
    </header>
  );
}

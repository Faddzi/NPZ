import Link from 'next/link';
import { business, nav } from '@/content/site';

export default function Footer() {
  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto grid max-w-page gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1fr] md:px-8">
        <div>
          <p className="font-display text-3xl font-black uppercase italic [font-variation-settings:'wdth'_125]">NPZ</p>
          <p className="mt-2 max-w-[36ch] text-mute-dark">{business.name}. Photography, video and social media for growing brands.</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-mute-dark">Contact</h2>
          <ul className="mt-3 space-y-2">
            {business.phones.map((p) => (
              <li key={p.tel}>
                <a className="link-plain" href={`tel:${p.tel}`}>
                  {p.display}
                </a>
              </li>
            ))}
            <li>
              <a className="link-plain break-all" href={`mailto:${business.email}`}>
                {business.email}
              </a>
            </li>
            <li>
              <a className="link-plain" href={business.instagram.url} rel="noopener" target="_blank">
                Instagram {business.instagram.handle}
              </a>
            </li>
          </ul>
        </div>
        <nav aria-label="Footer">
          <h2 className="text-sm font-semibold text-mute-dark">Pages</h2>
          <ul className="mt-3 space-y-2">
            {nav.map((n) => (
              <li key={n.href}>
                <Link className="link-plain" href={n.href}>
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <div className="mx-auto flex max-w-page flex-col gap-2 border-t border-white/15 px-5 py-6 text-sm text-mute-dark sm:flex-row sm:items-center sm:justify-between md:px-8">
        <p>
          © {new Date().getFullYear()} {business.name}
        </p>
        <p>
          Developed &amp; maintained by{' '}
          <a className="link-plain text-paper" href="https://seven72.com/ref=npz" target="_blank" rel="noopener">
            seven72.com
          </a>
        </p>
      </div>
    </footer>
  );
}

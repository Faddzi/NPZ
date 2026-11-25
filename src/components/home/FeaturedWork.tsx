import Image from 'next/image';
import Link from 'next/link';
import { categories } from '@/content/site';
import Reveal from './Reveal';

export default function FeaturedWork() {
  return (
    <section aria-labelledby="work-title" className="bg-ink text-paper">
      <div className="mx-auto max-w-page px-5 py-20 md:px-8 md:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <h2 id="work-title" className="display text-[clamp(32px,5vw,68px)]">
            Selected <em>work</em>
          </h2>
          <Link href="/portfolio/" className="link-arrow">
            Open the portfolio
          </Link>
        </div>
        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((c, i) => (
            <li key={c.slug}>
              <Link href={`/portfolio/?category=${c.slug}`} className="work-card group block">
                <Reveal delay={i * 0.08}>
                  <div className="relative aspect-[4/5] overflow-hidden bg-white/5">
                    <Image
                      src={c.image}
                      alt={c.alt}
                      fill
                      sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                    />
                  </div>
                </Reveal>
                <h3 className="mt-4 text-xl font-semibold group-hover:underline group-focus-visible:underline">{c.title}</h3>
                <p className="mt-1 text-mute-dark">{c.line}</p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

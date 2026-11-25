import type { Metadata } from 'next';
import Image from 'next/image';
import { business, servicePage, socialResults } from '@/content/site';
import PlayOnView from '@/components/services/PlayOnView';
import ContactBlock from '@/components/home/ContactBlock';

export const metadata: Metadata = {
  title: 'Services',
  description: `${business.name}: social media management, content strategy, photography, brand films, reels, post-production, design, branding and paid ads.`,
};

const pad = (n: number) => String(n).padStart(2, '0');
const total = servicePage.reduce((n, g) => n + g.items.length, 0);
// running number of the first service in each group (01 to 13 across the page)
const firstNo = servicePage.map((_, gi) => servicePage.slice(0, gi).reduce((n, g) => n + g.items.length, 0) + 1);
const fmtK = (n: number) => (n >= 1000 ? `${+(n / 1000).toFixed(1)}K` : String(n));

export default function ServicesPage() {
  const top = socialResults.topReels;
  const max = Math.max(...top);

  return (
    <>
      {/* intro + jump links */}
      <section aria-labelledby="svc-title" className="bg-paper text-ink">
        <div className="mx-auto max-w-page px-5 pb-16 pt-32 md:px-8 md:pb-24 md:pt-40">
          <h1 id="svc-title" className="display max-w-[14ch] text-[clamp(40px,7.4vw,112px)]">
            {total} services, <em>one team</em>.
          </h1>
          <p className="mt-8 max-w-[52ch] text-lg text-mute-light md:text-xl">
            We provide end-to-end creative and digital marketing solutions tailored to help brands grow. Pick one service or hand us the whole thing.
          </p>
          <nav aria-label="Service groups" className="mt-12">
            <ul className="svc-jump">
              {servicePage.map((g, i) => (
                <li key={g.id}>
                  <a href={`#${g.id}`}>
                    <span aria-hidden="true">{pad(i + 1)}</span>
                    {g.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </section>

      {/* the four groups */}
      <div className="bg-ink text-paper">
        {servicePage.map((g, gi) => (
          <section key={g.id} id={g.id} aria-labelledby={`${g.id}-title`} className={`svc-group ${gi % 2 ? 'svc-flip' : ''}`}>
            <div className="mx-auto grid max-w-page gap-10 px-5 py-20 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:px-8 md:py-28">
              <div className="svc-media-wrap">
                <div className="svc-media">
                  {g.media.kind === 'video' && <PlayOnView src={g.media.src} poster={g.media.poster} label={g.media.alt} />}
                  {g.media.kind === 'image' && <Image src={g.media.src} alt={g.media.alt} width={800} height={1000} sizes="(min-width: 768px) 420px, 90vw" />}
                  {g.media.kind === 'art' && (
                    <div className="svc-art" aria-hidden="true">
                      <span className="svc-art-glyph">Aa</span>
                      <span className="svc-art-sw" />
                      <span className="svc-art-sw" />
                      <span className="svc-art-sw" />
                      <span className="svc-art-target" />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <p className="svc-count" aria-hidden="true">
                  {pad(gi + 1)} / {pad(servicePage.length)}
                </p>
                <h2 id={`${g.id}-title`} className="display mt-3 text-[clamp(32px,5vw,68px)]">
                  {g.title}
                </h2>
                <ol className="svc-list" start={firstNo[gi]}>
                  {g.items.map((s, si) => {
                    return (
                      <li key={s.name}>
                        <span className="svc-idx" aria-hidden="true">
                          {pad(firstNo[gi] + si)}
                        </span>
                        <div>
                          <h3 className="text-xl font-semibold md:text-2xl">{s.name}</h3>
                          <p className="mt-1 text-mute-dark">{s.text}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* results, slide 14 */}
      <section aria-labelledby="res-title" className="bg-paper text-ink">
        <div className="mx-auto max-w-page px-5 py-20 md:px-8 md:py-28">
          <div className="grid gap-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-end md:gap-16">
            <h2 id="res-title" className="display text-[clamp(32px,5vw,68px)]">
              Real reach, <em>real numbers</em>
            </h2>
            <p className="max-w-[40ch] text-lg text-mute-light">Instagram insights from one client account we manage, May to July.</p>
          </div>

          <ul className="res-tiles mt-12">
            {socialResults.tiles.map((t) => (
              <li key={t.label}>
                <p className="res-num">
                  {t.value}
                  {t.unit && <span>{t.unit}</span>}
                </p>
                <p className="mt-2 text-lg font-semibold">{t.label}</p>
                <p className="mt-1 text-mute-light">{t.note}</p>
              </li>
            ))}
          </ul>

          <figure className="res-chart mt-14">
            <figcaption className="text-lg font-semibold">Views on the five best reels</figcaption>
            <ol className="mt-6">
              {top.map((v, i) => (
                <li key={v}>
                  <span className="res-rank">Reel {i + 1}</span>
                  <span className="res-track">
                    <span className="res-bar" style={{ '--w': `${(v / max) * 100}%` } as React.CSSProperties} />
                  </span>
                  <span className="res-val">{fmtK(v)}</span>
                </li>
              ))}
            </ol>
            <p className="mt-4 text-sm text-mute-light">L is lakh: 2.7L is 270,000 views.</p>
          </figure>
        </div>
      </section>

      <ContactBlock />
    </>
  );
}

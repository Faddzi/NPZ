import type { Metadata } from 'next';
import Image from 'next/image';
import { business, portfolioFilters, portfolioReels, portfolioShots } from '@/content/site';
import PlayOnView from '@/components/services/PlayOnView';
import ContactBlock from '@/components/home/ContactBlock';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: `Reels, product photography and brand shoots by ${business.name} for jewellery, food, fashion and interior brands.`,
};

export default function PortfolioPage() {
  return (
    <>
      {/* intro + reel rail */}
      <section aria-labelledby="pf-title" className="bg-ink text-paper">
        <div className="mx-auto max-w-page px-5 pt-32 md:px-8 md:pt-40">
          <h1 id="pf-title" className="display max-w-[14ch] text-[clamp(40px,7.4vw,112px)]">
            Work that <em>stops the scroll</em>.
          </h1>
          <p className="mt-8 max-w-[52ch] text-lg text-mute-dark md:text-xl">
            Reels, product shoots and brand films for jewellery, food, fashion and interior brands. A selection of our own shoots and edits.
          </p>
        </div>
        <ul className="pf-rail" aria-label="Reels" tabIndex={0}>
          {portfolioReels.map((r, i) => (
            <li key={r.src} className="pf-reel" style={{ '--k': i - 2 } as React.CSSProperties}>
              <div className="pf-phone">
                <PlayOnView src={r.src} poster={r.poster} label={r.alt} />
              </div>
              <p className="mt-4 font-semibold">{r.title}</p>
              <p className="text-sm text-mute-dark">{r.tag}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* spotlight: Al Anwar Jewellery (client on slide 15; its name is on the work itself) */}
      <section aria-labelledby="spot-aa" className="bg-paper text-ink">
        <div className="mx-auto grid max-w-page items-center gap-12 px-5 py-20 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:px-8 md:py-28">
          <div>
            <p className="pf-kicker">Client spotlight</p>
            <h2 id="spot-aa" className="display mt-3 text-[clamp(32px,4.4vw,58px)]">
              Al Anwar <em>Jewellery</em>
            </h2>
            <p className="mt-6 max-w-[42ch] text-lg text-mute-light">Campaign posts, product close-ups and reels, all made for one jewellery brand.</p>
            <ul className="pf-tags mt-8" aria-label="What we made">
              <li>Campaign creatives</li>
              <li>Product photography</li>
              <li>Reels</li>
            </ul>
          </div>
          <div className="pf-stack" aria-label="Al Anwar Jewellery work">
            <figure className="pf-card pf-card-a">
              <Image src="/folio/bracelet-campaign.webp" alt="Campaign post: tennis bracelet on a wrist, headed Timeless Luxury" width={900} height={900} sizes="(min-width: 768px) 360px, 60vw" />
            </figure>
            <figure className="pf-card pf-card-b">
              <Image src="/folio/bracelet-detail.webp" alt="Campaign post: 18 karat yellow gold diamond bracelet on a wrist" width={900} height={900} sizes="(min-width: 768px) 320px, 55vw" />
            </figure>
            <figure className="pf-card pf-card-c">
              <Image src="/folio/jewellery-hero.webp" alt="Gold necklace with pear-shaped stones, worn close to the camera" width={900} height={623} sizes="(min-width: 768px) 380px, 70vw" />
            </figure>
          </div>
        </div>
      </section>

      {/* spotlight: Easy Boba (client on slide 15) */}
      <section aria-labelledby="spot-eb" className="pf-boba text-white">
        <div className="mx-auto grid max-w-page items-center gap-12 px-5 py-20 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:gap-16 md:px-8 md:py-28">
          <div className="pf-cups" aria-label="Easy Boba work">
            <Image className="pf-cup pf-cup-a" src="/folio/pop-cup-a.webp" alt="Easy Boba cup with a pale green drink" width={477} height={630} sizes="(min-width: 768px) 260px, 40vw" />
            <figure className="pf-card pf-boba-card">
              <Image src="/folio/easy-boba.webp" alt="Easy Boba drinks with a stamp-and-collect card on pink" width={421} height={581} sizes="(min-width: 768px) 300px, 50vw" />
            </figure>
            <Image className="pf-cup pf-cup-b" src="/folio/pop-cup-b.webp" alt="Easy Boba cup with a berry drink" width={447} height={573} sizes="(min-width: 768px) 240px, 38vw" />
          </div>
          <div>
            <p className="pf-kicker pf-kicker-light">Client spotlight</p>
            <h2 id="spot-eb" className="display mt-3 text-[clamp(32px,4.4vw,58px)]">Easy Boba</h2>
            <p className="mt-6 max-w-[40ch] text-lg">Product shots and cut-outs for a bubble tea brand, ready to drop into posts, offers and ads.</p>
          </div>
        </div>
      </section>

      {/* gallery with filters. The filters are radio buttons, so they work without scripts. */}
      <section aria-labelledby="gal-title" className="bg-ink text-paper">
        <div className="pf-gallery mx-auto max-w-page px-5 py-20 md:px-8 md:py-28">
          <h2 id="gal-title" className="display text-[clamp(32px,5vw,68px)]">
            More <em>work</em>
          </h2>
          <fieldset className="pf-filters mt-8">
            <legend className="sr-only">Show work from</legend>
            {portfolioFilters.map((f) => (
              <span key={f.id}>
                <input type="radio" name="pf-filter" id={`pf-f-${f.id}`} value={f.id} defaultChecked={f.id === 'all'} />
                <label htmlFor={`pf-f-${f.id}`}>{f.label}</label>
              </span>
            ))}
          </fieldset>
          <ul className="pf-grid mt-10">
            {portfolioShots.map((s) => (
              <li key={s.src} className={`pf-tile cat-${s.cat}`}>
                <Image src={s.src} alt={s.alt} width={s.w} height={s.h} sizes="(min-width: 1280px) 400px, (min-width: 1024px) 31vw, 46vw" />
              </li>
            ))}
          </ul>
          <p className="mt-12 text-lg">
            More on Instagram:{' '}
            <a className="link-plain font-semibold" href={business.instagram.url} target="_blank" rel="noopener noreferrer">
              {business.instagram.handle}
            </a>
          </p>
        </div>
      </section>

      <ContactBlock />
    </>
  );
}

import type { Metadata } from 'next';
import { business, processSteps } from '@/content/site';
import BriefForm from '@/components/contact/BriefForm';
import { asset } from '@/lib/asset';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Call, email or message ${business.name} on Instagram to plan your next shoot, reel or campaign.`,
};

export default function ContactPage() {
  const [p1, p2] = business.phones;

  return (
    <>
      {/* intro + direct lines (slide 19) */}
      <section aria-labelledby="ct-title" className="bg-ink text-paper">
        <div className="mx-auto max-w-page px-5 pb-20 pt-32 md:px-8 md:pb-28 md:pt-40">
          <h1 id="ct-title" className="display max-w-[13ch] text-[clamp(40px,7.4vw,112px)]">
            Let&rsquo;s make something <em>worth watching</em>.
          </h1>
          <p className="mt-8 max-w-[48ch] text-lg text-mute-dark md:text-xl">Call, email or message us on Instagram. Tell us what you are launching and we&rsquo;ll take it from there.</p>

          <ul className="ct-lines mt-14">
            <li>
              <span className="ct-label">Call</span>
              <a href={`tel:${p1.tel}`} className="ct-big">
                {p1.display}
              </a>
              <a href={`tel:${p2.tel}`} className="ct-small">
                or {p2.display}
              </a>
            </li>
            <li>
              <span className="ct-label">Email</span>
              <a href={`mailto:${business.email}`} className="ct-big ct-email">
                {business.email.split('@')[0]}@<wbr />
                {business.email.split('@')[1]}
              </a>
            </li>
            <li className="ct-ig">
              <span className="ct-label">Instagram</span>
              <a href={business.instagram.url} className="ct-big" target="_blank" rel="noopener noreferrer">
                {business.instagram.handle}
              </a>
              <div className="ct-qr">
                {/* eslint-disable-next-line @next/next/no-img-element -- tiny static SVG */}
                <img src={asset('/contact-ig-qr.svg')} alt="QR code for @nationalpromozone on Instagram" width={132} height={132} />
                <span>Scan to open on your phone</span>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* brief */}
      <section aria-labelledby="brief-title" className="bg-paper text-ink">
        <div className="mx-auto grid max-w-page gap-12 px-5 py-20 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:px-8 md:py-28">
          <div>
            <h2 id="brief-title" className="display text-[clamp(32px,5vw,68px)]">
              Send us a <em>brief</em>
            </h2>
            <p className="mt-6 max-w-[40ch] text-lg text-mute-light">A few lines is enough. The more we know about your brand and your deadline, the faster we can plan.</p>
            <h3 className="mt-12 text-sm font-semibold uppercase tracking-wide text-red-deep">What happens next</h3>
            <ol className="ct-next mt-4">
              {processSteps.slice(0, 3).map((s, i) => (
                <li key={s.title}>
                  <span aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <p className="font-semibold">{s.title}</p>
                    <p className="text-mute-light">{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
          <BriefForm />
        </div>
      </section>
    </>
  );
}

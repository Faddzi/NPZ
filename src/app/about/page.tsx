import type { Metadata } from 'next';
import Image from 'next/image';
import { business, founderBio, kit, processSteps, team } from '@/content/site';
import ReelFrames from '@/components/about/ReelFrames';
import IndustryOrbit from '@/components/about/IndustryOrbit';
import PixelStudio from '@/components/about/PixelStudio';
import ContactBlock from '@/components/home/ContactBlock';

export const metadata: Metadata = {
  title: 'About',
  description: `${business.name} is a small in-house team led by founder ${business.founder.name}: content strategy, photography, video, editing and social media.`,
};

export default function AboutPage() {
  const founder = team[0];

  return (
    <>
      {/* intro */}
      <section aria-labelledby="about-title" className="bg-paper text-ink">
        <div className="mx-auto max-w-page px-5 pb-16 pt-32 md:px-8 md:pb-24 md:pt-40">
          <h1 id="about-title" className="display max-w-[14ch] text-[clamp(40px,7.4vw,112px)]">
            A small team behind <em>every frame</em>.
          </h1>
          <p className="mt-8 max-w-[52ch] text-lg text-mute-light md:text-xl">
            {business.name} offers end-to-end creative and digital marketing for brands that want to grow. Strategy, shoots, editing and publishing all
            happen in-house.
          </p>
          <ReelFrames />
        </div>
      </section>

      {/* founder */}
      <section aria-labelledby="founder-title" className="bg-ink text-paper">
        <div className="mx-auto grid max-w-page items-center gap-10 px-5 py-20 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:px-8 md:py-28">
          <div className="founder-photo">
            <Image src={founder.photo} alt={`Portrait of ${founder.name}`} width={360} height={360} sizes="(min-width: 768px) 360px, 70vw" />
          </div>
          <div>
            <h2 id="founder-title" className="display text-[clamp(32px,5vw,68px)]">
              Meet the <em>founder</em>
            </h2>
            <figure className="mt-8">
              <blockquote className="text-lg leading-relaxed text-paper/90 md:text-xl">
                <p>&ldquo;{founderBio}&rdquo;</p>
              </blockquote>
              <figcaption className="mt-6">
                <span className="block text-xl font-semibold">{founder.name}</span>
                <span className="text-mute-dark">{founder.role}</span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* team */}
      <section aria-labelledby="team-title" className="bg-paper text-ink">
        <div className="mx-auto max-w-page px-5 py-20 md:px-8 md:py-28">
          <h2 id="team-title" className="display text-[clamp(32px,5vw,68px)]">
            The <em>team</em>
          </h2>
          <p className="mt-6 max-w-[48ch] text-lg text-mute-light">
            <span className="hidden md:inline">Hover over</span>
            <span className="md:hidden">Swipe across and tap</span> anyone in the studio to see what they&rsquo;re up to.
          </p>
          <div className="mt-10">
            <PixelStudio />
          </div>
          <ul className="sr-only">
            {team.map((m) => (
              <li key={m.name}>
                {m.name}, {m.role}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* process: eight frames on a strip of film */}
      <section aria-labelledby="process-title" className="bg-ink text-paper">
        <div className="mx-auto max-w-page px-5 pt-20 md:px-8 md:pt-28">
          <h2 id="process-title" className="display text-[clamp(32px,5vw,68px)]">
            How a project <em>runs</em>
          </h2>
          <p className="mt-6 max-w-[48ch] text-lg text-mute-dark">Every project goes through the same eight steps, from the first call to the post that goes live.</p>
        </div>
        <div className="mx-auto max-w-page px-5 pb-20 pt-12 md:px-8 md:pb-28">
          <ol className="steps">
            {processSteps.map((s, i) => (
              <li key={s.title} className="step">
                <span className="step-no" aria-hidden="true">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="mt-6 text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-mute-dark">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* kit */}
      <section aria-labelledby="kit-title" className="bg-paper text-ink">
        <div className="mx-auto grid max-w-page gap-10 px-5 py-20 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-16 md:px-8 md:py-28">
          <div>
            <h2 id="kit-title" className="display text-[clamp(32px,5vw,68px)]">
              Our <em>kit</em>
            </h2>
            <p className="mt-6 max-w-[40ch] text-lg text-mute-light">Professional-grade equipment, so every project meets a high visual standard.</p>
          </div>
          <dl className="kit">
            {kit.map((k) => (
              <div key={k.what} className="kit-row">
                <dt>{k.what}</dt>
                <dd>{k.item}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* industries: a 4 x 3 grid of tiles */}
      <section aria-labelledby="ind-title" className="bg-ink text-paper">
        <div className="mx-auto max-w-page px-5 py-20 md:px-8 md:py-28">
          <div className="grid gap-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-end md:gap-16">
            <h2 id="ind-title" className="display text-[clamp(32px,5vw,68px)]">
              Industries we can <em>work with</em>
            </h2>
            <p className="max-w-[40ch] text-lg text-mute-dark">From startups to established brands, we help every brand tell its story.</p>
          </div>
          <div className="mt-12 md:mt-16">
            <IndustryOrbit />
          </div>
        </div>
      </section>

      <ContactBlock />
    </>
  );
}

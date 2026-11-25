import Link from 'next/link';
import { business, serviceGroups } from '@/content/site';

export default function Intro() {
  return (
    <section aria-labelledby="intro-title" className="bg-paper text-ink">
      <div className="mx-auto max-w-page px-5 py-20 md:px-8 md:py-28">
        <h2 id="intro-title" className="display max-w-[18ch] text-[clamp(32px,5vw,68px)]">
          Creative and digital marketing, <em>start to finish</em>.
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2 md:gap-12">
          <p className="text-lg text-mute-light">
            {business.name} plans your content, shoots it, edits it and publishes it, so one team carries a brand from the first idea to the post that goes
            live.
          </p>
          <p className="text-lg text-mute-light">
            The studio is led by founder {business.founder.name}, a cinematographer and photographer who works across content strategy, videography,
            video editing and social media marketing.
          </p>
        </div>

        <div className="mt-16 grid gap-px bg-ink/15 sm:grid-cols-2 lg:grid-cols-4">
          {serviceGroups.map((g) => (
            <div key={g.title} className="bg-paper p-6 sm:pr-8">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-red-deep">{g.title}</h3>
              <ul className="mt-4 space-y-2">
                {g.items.map((i) => (
                  <li key={i}>{i}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="mt-8">
          <Link href="/services/" className="link-arrow">
            See all services
          </Link>
        </p>
      </div>
    </section>
  );
}

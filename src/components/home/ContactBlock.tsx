import Link from 'next/link';
import { business } from '@/content/site';

export default function ContactBlock() {
  return (
    <section aria-labelledby="contact-title" className="bg-red-deep text-white">
      <div className="mx-auto max-w-page px-5 py-20 md:px-8 md:py-24">
        <h2 id="contact-title" className="display max-w-[16ch] text-[clamp(32px,5.4vw,76px)]">
          Have a brand to shoot?
        </h2>
        <p className="mt-6 max-w-[48ch] text-lg">Call or email and tell us what you are launching.</p>
        <div className="mt-10 flex flex-col gap-4 text-xl font-semibold sm:flex-row sm:flex-wrap sm:gap-x-10">
          <a className="link-plain" href={`tel:${business.phones[0].tel}`}>
            {business.phones[0].display}
          </a>
          <a className="link-plain break-all" href={`mailto:${business.email}`}>
            {business.email}
          </a>
        </div>
        <p className="mt-10">
          <Link href="/contact/" className="btn-ink">
            Go to the contact page
          </Link>
        </p>
      </div>
    </section>
  );
}

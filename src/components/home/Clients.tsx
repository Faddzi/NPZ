import Image from 'next/image';
import { clients } from '@/content/site';

// A contact sheet: each client is a frame on a strip of film, and two strips roll in opposite directions.
// Hovering a strip stops it; reduced motion shows the sheet still.
const half = Math.ceil(clients.length / 2);
const strips = [clients.slice(0, half), clients.slice(half)];

function Frame({ c }: { c: (typeof clients)[number] }) {
  return (
    <li className="frame">
      <div className="frame-print">
        {c.logo ? (
          <Image src={c.logo} alt={`${c.name} logo`} width={480} height={300} sizes="240px" className="frame-logo" />
        ) : (
          <span className="frame-missing">
            {c.name}
            <small>Logo to come</small>
          </span>
        )}
      </div>
    </li>
  );
}

export default function Clients() {
  return (
    <section aria-labelledby="clients-title" className="clients bg-ink text-paper">
      <div className="mx-auto max-w-page px-5 pt-20 md:px-8 md:pt-28">
        <h2 id="clients-title" className="display text-[clamp(32px,5vw,68px)]">
          Brands we&rsquo;ve <em>worked with</em>
        </h2>
      </div>

      <div className="sheet mt-12 pb-20 md:pb-28">
        {strips.map((list, row) => (
          <div key={row} className={`strip ${row ? 'strip-rev' : ''}`}>
            <div className="strip-edge" aria-hidden="true" />
            <div className="strip-track">
              <ul className="strip-run">
                {list.map((c) => (
                  <Frame key={c.name} c={c} />
                ))}
              </ul>
              {/* second copy makes the loop seamless; screen readers get the list once */}
              <ul className="strip-run" aria-hidden="true">
                {list.map((c) => (
                  <Frame key={c.name} c={c} />
                ))}
              </ul>
            </div>
            <div className="strip-edge" aria-hidden="true" />
          </div>
        ))}
      </div>
    </section>
  );
}

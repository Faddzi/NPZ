'use client';

import { useState } from 'react';
import { business, serviceGroups } from '@/content/site';

// No email service is chosen yet, so the brief opens the visitor's own email app with everything filled in.
// Without scripts the form still works: the browser hands the fields to the email app as plain text.
export default function BriefForm() {
  const [sent, setSent] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const name = String(f.get('name') ?? '').trim();
    const brand = String(f.get('brand') ?? '').trim();
    const wants = f.getAll('service').map(String);
    const phone = String(f.get('phone') ?? '').trim();
    const head = [`Name: ${name}`, brand && `Business: ${brand}`, phone && `Phone: ${phone}`, wants.length > 0 && `Interested in: ${wants.join(', ')}`];
    const lines = [...head.filter(Boolean), '', String(f.get('message') ?? '')];
    const subject = `New project${brand ? ` for ${brand}` : ''} from ${name}`;
    window.location.href = `mailto:${business.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    setSent(true);
  };

  return (
    <form className="brief" action={`mailto:${business.email}`} method="post" encType="text/plain" onSubmit={onSubmit}>
      <div className="brief-row">
        <div className="brief-field">
          <label htmlFor="b-name">Your name</label>
          <input id="b-name" name="name" required autoComplete="name" />
        </div>
        <div className="brief-field">
          <label htmlFor="b-brand">
            Business name <span>(optional)</span>
          </label>
          <input id="b-brand" name="brand" autoComplete="organization" />
        </div>
      </div>
      <div className="brief-field">
        <label htmlFor="b-phone">
          Phone <span>(optional, if you&rsquo;d like a call back)</span>
        </label>
        <input id="b-phone" name="phone" type="tel" autoComplete="tel" inputMode="tel" />
      </div>
      <fieldset className="brief-field">
        <legend>What do you need?</legend>
        <div className="brief-chips">
          {[...serviceGroups.map((g) => g.title), 'Not sure yet'].map((t) => (
            <label key={t} className="brief-chip">
              <input type="checkbox" name="service" value={t} />
              <span>{t}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="brief-field">
        <label htmlFor="b-msg">Tell us about the project</label>
        <textarea id="b-msg" name="message" rows={5} required placeholder="What are you launching, and when?" />
      </div>
      <div className="brief-foot">
        <button type="submit" className="btn-ink">
          Send by email
        </button>
        <p className="text-mute-light" aria-live="polite">
          {sent ? 'Your email app should now be open with your brief filled in. Just press send.' : 'This opens your email app with your brief filled in. Nothing is stored on this site.'}
        </p>
      </div>
    </form>
  );
}

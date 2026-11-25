import type { Metadata, Viewport } from 'next';
import { Archivo, Instrument_Sans } from 'next/font/google';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { business } from '@/content/site';
import './globals.css';

const display = Archivo({ subsets: ['latin'], axes: ['wdth'], style: ['normal', 'italic'], variable: '--font-display', display: 'swap' });
const body = Instrument_Sans({ subsets: ['latin'], weight: ['400', '600'], variable: '--font-body', display: 'swap' });

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://example.com'; // set once the domain is confirmed

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${business.name} | Photography, video and social media`, template: `%s | ${business.name}` },
  description: 'National Promo Zone plans, shoots, edits and publishes content for restaurants, fashion, jewellery and interior brands.',
  openGraph: { type: 'website', siteName: business.name, locale: 'en_IN' },
  twitter: { card: 'summary_large_image' },
};

export const viewport: Viewport = { themeColor: '#0B0B0C', viewportFit: 'cover' };

// LocalBusiness data uses only facts from the portfolio PDF. Address and area served stay out until NPZ supplies them.
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  name: business.name,
  alternateName: business.short,
  description: business.summary,
  telephone: business.phones.map((p) => p.tel),
  email: business.email,
  sameAs: [business.instagram.url],
  founder: { '@type': 'Person', name: business.founder.name },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-IN" data-set="page" className={`${display.variable} ${body.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}

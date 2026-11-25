// Finishes the GitHub Pages export in ./out (run after GITHUB_PAGES=1 next build).
import { readdirSync, readFileSync, writeFileSync, statSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';

const base = process.env.PAGES_BASE_PATH ?? '/NPZ';
const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));

// CSS url('/file') points at /public, which now lives under the base path
for (const f of walk('out').filter((f) => extname(f) === '.css')) {
  const s = readFileSync(f, 'utf8');
  const fixed = s.replace(/url\((['"]?)\/(?!\/|_next\/)/g, (m, q) => `url(${q}${base}/`);
  if (fixed !== s) writeFileSync(f, fixed);
}

// /folio is the portfolio image folder; anyone who types it lands on the Portfolio page
mkdirSync('out/folio', { recursive: true });
const to = `${base}/portfolio/`;
writeFileSync(
  'out/folio/index.html',
  `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Portfolio</title><meta name="robots" content="noindex"><link rel="canonical" href="${to}"><meta http-equiv="refresh" content="0; url=${to}"><script>location.replace(${JSON.stringify(to)})</script></head><body><a href="${to}">Go to the portfolio</a></body></html>\n`,
);

// GitHub Pages: serve _next as-is
writeFileSync('out/.nojekyll', '');
console.log(`GitHub Pages export ready in ./out (base ${base})`);

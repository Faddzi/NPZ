# National Promo Zone website

Next.js (App Router) + TypeScript + Tailwind + React Three Fiber + GSAP.

## Run

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Review copy that works from any folder (used for private preview links):

```bash
PREVIEW=1 npx next build && node scripts/preview.mjs   # output in ./out
```

GitHub Pages build (static export under `/NPZ`, the same as the deploy workflow):

```bash
npm run build:pages   # output in ./out; set PAGES_BASE_PATH to change the /NPZ prefix
```

## Deploy

Every push to `main` builds and publishes the site to https://faddzi.github.io/NPZ/ through `.github/workflows/pages.yml`.
In the repo settings, Pages must use **GitHub Actions** as its source.

## Where things live

- `src/content/site.ts`: every fact on the site, each tagged with the PDF slide it came from. Add nothing that is not in the PDF.
- `src/components/studio/`: the 3D studio hero. `buildStudio.ts` builds and animates the set; `StudioCanvas.tsx` is the R3F wrapper; `StudioHero.tsx` holds the scroll scenes, viewfinder and sound toggle.
- `src/components/home/`: the Home sections below the studio.
- `public/work/`, `public/media/`: NPZ media picked for Home (the rest of their media folder is kept for the Portfolio page). `public/clients/`: logos cut from the deck.
- `public/studio-poster*.jpg`: still frames of the studio, shown while the 3D loads and when a browser has no WebGL.

## Rules carried from the brief

- Hero has one call-to-action: the call button.
- Headings and subtitles never animate. Only images and the 3D scene move, and both respect reduced motion.
- 3D performance budget: one shadow-casting light, shadows refreshed every other frame, reel texture at 15 fps, pixel ratio 0.85 to 1.5 driven by PerformanceMonitor.
- Set `NEXT_PUBLIC_SITE_URL` once the domain is confirmed.

## Status

- Home: built.
- About, Services, Portfolio, Contact: next, one page at a time.

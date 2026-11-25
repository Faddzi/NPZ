// PREVIEW=1 builds a static copy for review links; scripts/preview.mjs rewrites /__REL__ to relative paths.
const preview = process.env.PREVIEW === '1';
// GITHUB_PAGES=1 builds the static site for GitHub Pages, served under /<repo> (default /NPZ).
// scripts/pages.mjs finishes the export (CSS image paths, /folio redirect page).
const pages = process.env.GITHUB_PAGES === '1';
const pagesBase = process.env.PAGES_BASE_PATH ?? '/NPZ';

const staticConfig = preview
  ? { output: 'export', assetPrefix: '/__REL__', trailingSlash: true, env: { NEXT_PUBLIC_ASSET_BASE: '.' } }
  : pages
    ? { output: 'export', basePath: pagesBase, trailingSlash: true, env: { NEXT_PUBLIC_ASSET_BASE: pagesBase } }
    : {};

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  ...staticConfig,
  images:
    preview || pages
      ? { loader: 'custom', loaderFile: './src/lib/previewImageLoader.ts' }
      : { formats: ['image/avif', 'image/webp'] },
  // /folio is only the portfolio image folder; send anyone who types it to the page itself.
  // Static exports cannot redirect, so scripts/pages.mjs writes a redirect page there instead.
  ...(preview || pages ? {} : { redirects: async () => [{ source: '/folio', destination: '/portfolio', permanent: false }] }),
};

export default nextConfig;

// Used only by static builds (PREVIEW=1 and GITHUB_PAGES=1), where Next cannot optimise images.
// PREVIEW keeps image paths relative so the review copy works from any folder; GITHUB_PAGES prefixes the
// site's base path (/NPZ), because next/image does not add basePath to src on its own.
const base = process.env.NEXT_PUBLIC_ASSET_BASE ?? '';

export default function previewImageLoader({ src }: { src: string; width: number; quality?: number }) {
  if (!src.startsWith('/') || src.startsWith('//')) return src;
  if (base === '.') return `.${src}`;
  return base && !src.startsWith(`${base}/`) ? `${base}${src}` : src;
}

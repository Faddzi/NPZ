// Paths to files in /public. Review copies (PREVIEW=1) set NEXT_PUBLIC_ASSET_BASE to "." so paths stay relative;
// GitHub Pages builds (GITHUB_PAGES=1) set it to the base path, e.g. "/NPZ".
const base = process.env.NEXT_PUBLIC_ASSET_BASE ?? '';
export const asset = (path: string) => `${base}${path}`;

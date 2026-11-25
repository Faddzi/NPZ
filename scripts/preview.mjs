// Turns the static export in ./out into a copy that works from any folder (used for private review links).
import { readdirSync, readFileSync, writeFileSync, statSync, renameSync, rmSync } from 'node:fs';
import { join, extname } from 'node:path';

// some hosts reserve names that start with "_", so _next is served as assets
renameSync('out/_next', 'out/assets');
for (const f of ['out/404', 'out/404.html', 'out/index.txt']) rmSync(f, { recursive: true, force: true });

const walk = (d) => readdirSync(d).flatMap((f) => (statSync(join(d, f)).isDirectory() ? walk(join(d, f)) : [join(d, f)]));
for (const f of walk('out')) {
  const ext = extname(f);
  if (!['.html', '.js', '.css', '.txt'].includes(ext)) continue;
  let s = readFileSync(f, 'utf8');
  if (ext === '.css') {
    s = s.replaceAll('/__REL__/_next/static/', '../').replace(/url\((['"]?)\/(?!\/)/g, 'url($1../../../');
  } else {
    s = s.replaceAll('/__REL__/', './').replaceAll('/__REL__', '.').replaceAll('/_next/', '/assets/');
    if (ext === '.html') s = s.replace(/(src|srcSet|srcset)="\/(?!\/)/g, '$1="./').replace(/, \/(work|studio)/g, ', ./$1');
  }
  // escape the Unicode replacement character inside JS strings so strict hosts accept the file
  if (ext === '.js') s = s.replaceAll('\uFFFD', '\\ufffd');
  writeFileSync(f, s);
}
console.log('preview ready in ./out');

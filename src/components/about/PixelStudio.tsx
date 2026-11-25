import { team } from '@/content/site';
import { teamLines } from '@/content/team-lines';

// A pixel-art NPZ studio with the team at work. Hover, focus or tap a person for a speech bubble:
// name and role first, then their lines in turn. It runs on CSS alone (no client script), so it also works
// in in-app viewers where scripts don't run: see "pixel studio" in globals.css. The scene is a 200 x 100 grid drawn as SVG.

const PAL: Record<string, string> = {
  k: '#0d0a08', // hair
  s: '#b97c5c', // skin
  S: '#9c6249', // skin shade
  g: '#0b0b0c', // glasses frame
  e: '#f3f1ec', // lens glint
  b: '#2b1d16', // beard
  m: '#6e3326', // mouth
  t: '#f3f1ec', // teeth
  w: '#ebe8e1', // white blazer
  r: '#e0221b', // NPZ red
  d: '#1b1a19', // dark shirt
  j: '#2a2b33', // trousers
  h: '#0e0e0e', // shoes
  p: '#e9bcc7', // pink top
  P: '#d9a3b1', // pink shade
  n: '#23314f', // navy shirt
  N: '#4a5d8c', // shirt pattern
};

// each sprite is 14 px wide; "." is transparent
const MUSTAFA = [
  '...k.kk.kk.k..',
  '..kkkkkkkkkkk.',
  '.kkkkkkkkkkkk.',
  '.kksssssssskk.',
  '.kssssssssssk.',
  '.sggggssggggs.',
  '.sgkegssgkegs.',
  '.sggggssggggs.',
  '.ssssssssssss.',
  '.sbsssSSsssbs.',
  '.sbbbmmmmbbbs.',
  '..bbbbbbbbbb..',
  '...bbbbbbbb...',
  '....bbbbbb....',
  '..wwwwdrdwwww.',
  '.wwwwwdrdwwwww',
  '.wwrwwdrdwwkww',
  '.wwwwwdrdwrwrw',
  'swwkwwdrdwrrws',
  'swwwwwdddwrrws',
  'swwwwwdddwwrws',
  's.wwwwdddwww.s',
  '..wwwwdddwwww.',
  '..jjjjjjjjjj..',
  '..jjjjjjjjjj..',
  '..jjjj..jjjj..',
  '..jjjj..jjjj..',
  '..jjjj..jjjj..',
  '..jjjj..jjjj..',
  '..jjjj..jjjj..',
  '.hhhhh..hhhhh.',
];
const NOORIYAH = [
  '...kkkkkkkk...',
  '..kkkkkkkkkk..',
  '.kkkkkkkkkkkk.',
  '.kksssssssskk.',
  '.kssssssssssk.',
  '.kggggssggggk.',
  '.kgkegssgkegk.',
  '.kggggssggggk.',
  '.kssssSSssssk.',
  '.kksssmmssskk.',
  '.kkkssssssskk.',
  'kkkk.ssss.kkkk',
  'kkkppppppppkkk',
  'kkppppppppppkk',
  'kpppppPPpppppk',
  '.pppppPPppppp.',
  '.pppppppppppp.',
  '.pppppppppppp.',
];
const HASAN = [
  '....kkkkkkk...',
  '...kkkkkkkkk..',
  '..kkkkkkkkkkk.',
  '..kssssssssk..',
  '..ssssssssss..',
  '..ssgssssgss..',
  '..ssssSSssss..',
  '..sbmttttmbs..',
  '..sbbbbbbbbs..',
  '...bbbbbbbb...',
  '....ssssss....',
  '..nnnnnnnnnn..',
  '.nnNnnnnnNnnn.',
  'nnnnnNnnnnnNnn',
  'nNnnnnnNnnnnnn',
  'nnnnNnnnnnNnnn',
  'nnnnnnnnnnnnnn',
  'nnNnnnnnNnnnnn',
];

// 5 x 5 pixel letters for the wall sign
const LETTERS: Record<string, string[]> = {
  N: ['r...r', 'rr..r', 'r.r.r', 'r..rr', 'r...r'],
  P: ['rrrr.', 'r...r', 'rrrr.', 'r....', 'r....'],
  Z: ['rrrrr', '...r.', '..r..', '.r...', 'rrrrr'],
};

// turns a sprite into one path per colour (runs of the same colour merge into one rectangle)
function Sprite({ rows, x, y, pal = PAL }: { rows: string[]; x: number; y: number; pal?: Record<string, string> }) {
  const byColour: Record<string, string> = {};
  rows.forEach((row, ry) => {
    let i = 0;
    while (i < row.length) {
      const c = row[i];
      let j = i;
      while (j < row.length && row[j] === c) j++;
      if (c !== '.') byColour[c] = (byColour[c] ?? '') + `M${x + i} ${y + ry}h${j - i}v1h${i - j}z`;
      i = j;
    }
  });
  return (
    <>
      {Object.entries(byColour).map(([c, d]) => (
        <path key={c} d={d} fill={pal[c] ?? c} />
      ))}
    </>
  );
}

const R = ({ x, y, w, h, c, className }: { x: number; y: number; w: number; h: number; c: string; className?: string }) => (
  <rect x={x} y={y} width={w} height={h} fill={c} className={className} />
);

// where each person sits (scene units): head anchor for the bubble, and the hit area
const W = 120, H = 60;
const SPOTS = [
  { bx: 18, by: 26, hit: { x: 8, y: 24, w: 34, h: 35 } },
  { bx: 56, by: 30, hit: { x: 42, y: 28, w: 34, h: 31 } },
  { bx: 101, by: 30, hit: { x: 79, y: 28, w: 41, h: 31 } },
];

const SLOT = 2.2; // seconds each line stays up

export default function PixelStudio() {
  // one keyframe set per line count, so editing team-lines.ts never breaks the timing
  const counts = Array.from(new Set(team.map((m) => teamLines[m.name].length)));
  const keyframes = counts
    .map((n) => {
      const end = (100 / n).toFixed(3);
      const off = (100 / n + 0.01).toFixed(3);
      const frames = `0%,${end}%{opacity:1}${off}%,100%{opacity:0}`;
      return `@keyframes px-cyc-${n}{${frames}}@keyframes px-cyc-${n}-b{${frames}}`;
    })
    .join('');

  return (
    <div className="pixel-scroll">
      <style>{keyframes}</style>
      <div className="pixel-studio">
        <svg viewBox="0 0 120 60" shapeRendering="crispEdges" aria-hidden="true">
          {/* wall and floor */}
          <R x={0} y={0} w={120} h={49} c="#3a3531" />
          <R x={0} y={0} w={120} h={1} c="#1c1a18" />
          <R x={0} y={48} w={120} h={1.5} c="#2a2826" />
          <R x={0} y={49.5} w={120} h={10.5} c="#26231f" />
          {[52.5, 55.5, 58.5].map((yy) => (
            <R key={yy} x={0} y={yy} w={120} h={0.4} c="#2e2a26" />
          ))}

          {/* NPZ sign with a glow */}
          <R x={44} y={4} w={30} h={13} c="#2a0d0b" className="px-glow" />
          <R x={46} y={6} w={26} h={9} c="#1a0908" />
          <Sprite rows={LETTERS.N} x={49} y={8} />
          <Sprite rows={LETTERS.P} x={56.5} y={8} />
          <Sprite rows={LETTERS.Z} x={64} y={8} />

          {/* shelf, frames and a clock */}
          <R x={18} y={10} w={16} h={1} c="#3a3733" />
          <R x={19} y={6} w={3} h={4} c="#0b0b0c" />
          <R x={23} y={5} w={2} h={5} c="#b9b5ae" />
          <R x={27} y={7.5} w={5} h={2.5} c="#c40000" />
          <R x={82} y={8} w={10} h={8} c="#3a3733" />
          <R x={83} y={9} w={8} h={6} c="#c40000" />
          <R x={85} y={10.5} w={4} h={3} c="#ebe8e1" />
          <R x={95} y={10} w={7} h={10} c="#3a3733" />
          <R x={96} y={11} w={5} h={8} c="#ebe8e1" />
          <R x={97.5} y={13} w={2} h={3} c="#0b0b0c" />
          <R x={109} y={5} w={7} h={7} c="#3a3733" />
          <R x={110} y={6} w={5} h={5} c="#ebe8e1" />
          <R x={112} y={7} w={1} h={2} c="#0b0b0c" />
          <R x={112} y={8.5} w={2} h={0.8} c="#c40000" className="px-hand" />

          {/* softbox on a stand */}
          <path d="M2 9h8l3 3v9l-3 3h-8l-3-3v-9z" fill="#0b0b0c" />
          <path d="M2.6 10.2h6.8l2.4 2.4v7.8l-2.4 2.4h-6.8l-2.4-2.4v-7.8z" fill="#ebe8e1" className="px-soft" />
          <R x={5.5} y={24} w={1} h={33} c="#3a3733" />
          <path d="M6 54l-4 4h1l3-3 3 3h1z" fill="#3a3733" />
          <path d="M12 13L36 30v8L12 22z" fill="#ebe8e1" opacity="0.06" />

          {/* Mustafa and his camera */}
          <g className="px-char px-c0">
            <Sprite rows={MUSTAFA} x={11} y={27} />
            <R x={14} y={33} w={2} h={1} c="#b97c5c" className="px-blink" />
            <R x={20} y={33} w={2} h={1} c="#b97c5c" className="px-blink" />
          </g>
          <R x={27} y={32} w={9} h={6} c="#0b0b0c" />
          <R x={28} y={30.5} w={3} h={1.5} c="#0b0b0c" />
          <R x={36} y={33} w={4} h={4} c="#232220" />
          <R x={40} y={33.4} w={0.8} h={3.2} c="#3a3733" />
          <R x={28.2} y={33} w={1.2} h={1.2} c="#ff2a1a" className="px-rec" />
          <R x={31} y={33.5} w={3.5} h={2.5} c="#2e2c2a" />
          <R x={30.5} y={38} w={1.5} h={2} c="#3a3733" />
          <path d="M31 40l-4.5 18h1l3.5-15 3.5 15h1z" fill="#3a3733" />
          <R x={30.8} y={40} w={0.8} h={18} c="#3a3733" />
          <R x={24} y={44} w={3} h={2} c="#b97c5c" />

          {/* Nooriyah's desk */}
          <g className="px-char px-c1">
            <Sprite rows={NOORIYAH} x={49} y={31} />
            <R x={52} y={37} w={2} h={1} c="#b97c5c" className="px-blink" />
            <R x={58} y={37} w={2} h={1} c="#b97c5c" className="px-blink" />
          </g>
          <R x={42} y={48} w={34} h={1.5} c="#57514a" />
          <R x={43} y={49.5} w={1.5} h={8.5} c="#1c1a18" />
          <R x={73.5} y={49.5} w={1.5} h={8.5} c="#1c1a18" />
          <R x={51} y={46.5} w={2.5} h={1.5} c="#b97c5c" className="px-type-a" />
          <R x={58.5} y={46.5} w={2.5} h={1.5} c="#b97c5c" className="px-type-b" />
          <R x={63} y={39} w={11} h={8} c="#b9b5ae" />
          <R x={64} y={40} w={9} h={6} c="#cfcbc4" />
          <R x={67.5} y={42} w={2} h={2} c="#c40000" />
          <R x={62} y={47} w={13} h={1} c="#8f8b85" />
          <R x={44} y={44.5} w={3} h={3.5} c="#ebe8e1" />
          <R x={44} y={44.5} w={3} h={0.8} c="#8a5a3c" />
          <R x={47} y={45.3} w={0.8} h={1.6} c="#ebe8e1" />
          <R x={44.6} y={41} w={0.7} h={2} c="#b9b5ae" className="px-steam" />
          <R x={46} y={40} w={0.7} h={2} c="#b9b5ae" className="px-steam px-steam-2" />

          {/* Hasan's desk */}
          <g className="px-char px-c2">
            <Sprite rows={HASAN} x={94} y={31} />
            <R x={98} y={36} w={1} h={1} c="#b97c5c" className="px-blink" />
            <R x={103} y={36} w={1} h={1} c="#b97c5c" className="px-blink" />
          </g>
          <R x={79} y={48} w={41} h={1.5} c="#57514a" />
          <R x={80} y={49.5} w={1.5} h={8.5} c="#1c1a18" />
          <R x={117} y={49.5} w={1.5} h={8.5} c="#1c1a18" />
          <R x={80} y={35} w={13} h={10} c="#0b0b0c" />
          <R x={81} y={36} w={11} h={8} c="#ebe8e1" />
          <R x={82} y={37} w={5} h={4} c="#c40000" />
          <R x={88} y={37} w={3} h={1.5} c="#0b0b0c" />
          <R x={88} y={39.5} w={3} h={0.7} c="#8f8b85" />
          <R x={82} y={42.3} w={9} h={0.7} c="#8f8b85" />
          <R x={85.5} y={45} w={2} h={3} c="#1c1a18" />
          <R x={106} y={35} w={13} h={10} c="#0b0b0c" />
          <R x={107} y={36} w={11} h={8} c="#1b1a19" />
          <Sprite rows={LETTERS.N} x={108} y={37} pal={{ r: '#ff3b2e' }} />
          <Sprite rows={LETTERS.P} x={113.5} y={37} pal={{ r: '#ebe8e1' }} />
          <R x={116.2} y={37} w={0.7} h={5} c="#ebe8e1" className="px-cursor" />
          <R x={111.5} y={45} w={2} h={3} c="#1c1a18" />
          <R x={96} y={47.2} w={9} h={0.8} c="#0b0b0c" />
          <R x={102} y={45.8} w={2.5} h={1.5} c="#b97c5c" className="px-pen" />
          <R x={96.5} y={45.8} w={2.5} h={1.5} c="#b97c5c" />
        </svg>

        {/* a button over each person, for mouse, touch and keyboard focus */}
        {team.map((m, i) => {
          const h = SPOTS[i].hit;
          return (
            <button
              key={m.name}
              type="button"
              className={`pixel-hit pixel-hit-${i}`}
              style={{ left: `${(h.x / W) * 100}%`, top: `${(h.y / H) * 100}%`, width: `${(h.w / W) * 100}%`, height: `${(h.h / H) * 100}%` }}
              aria-label={`${m.name}, ${m.role}`}
            />
          );
        })}

        {/* one bubble per person: name and role, then each line in turn */}
        {team.map((m, i) => {
          const lines = teamLines[m.name];
          const n = lines.length;
          return (
            <div
              key={m.name}
              className={`pixel-bubble pixel-bubble-${i}`}
              style={
                {
                  left: `${(SPOTS[i].bx / W) * 100}%`,
                  top: `${(SPOTS[i].by / H) * 100}%`,
                  '--period': `${n * SLOT}s`,
                  '--cyc': `px-cyc-${n}`,
                  '--cyc-b': `px-cyc-${n}-b`,
                  '--o': `${-i * 0.7}s`,
                } as React.CSSProperties
              }
              aria-hidden="true"
            >
              <b>{m.name.split(' ')[0]}</b>
              <span className="px-lines">
                <span className="px-role">{m.role}</span>
                {lines.map((l, j) => (
                  <span key={j} className="px-ln" style={{ '--i': j } as React.CSSProperties}>
                    {l}
                  </span>
                ))}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Synthesised studio sounds. Nothing plays until the visitor turns sound on.
let ctx: AudioContext | null = null;
let enabled = false;

export function setSound(on: boolean) {
  enabled = on;
  if (on && !ctx) {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
    } catch {
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') void ctx.resume();
}

function noise(a: AudioContext, dur: number) {
  const b = a.createBuffer(1, Math.max(1, (a.sampleRate * dur) | 0), a.sampleRate);
  const d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
  const s = a.createBufferSource();
  s.buffer = b;
  return s;
}
function blip(a: AudioContext, t0: number, freq: number, q: number, gain: number, dur: number) {
  const n = noise(a, dur), f = a.createBiquadFilter(), g = a.createGain();
  f.type = 'bandpass';
  f.frequency.value = freq;
  f.Q.value = q;
  g.gain.value = gain;
  n.connect(f).connect(g).connect(a.destination);
  n.start(t0);
}
function thump(a: AudioContext, t0: number, freq: number, gain: number) {
  const o = a.createOscillator(), g = a.createGain();
  o.frequency.setValueAtTime(freq, t0);
  o.frequency.exponentialRampToValueAtTime(freq * 0.5, t0 + 0.08);
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.1);
  o.connect(g).connect(a.destination);
  o.start(t0);
  o.stop(t0 + 0.12);
}

export const sfx = {
  switch() {
    if (!enabled || !ctx) return;
    const t = ctx.currentTime;
    blip(ctx, t, 2400, 3, 0.5, 0.03);
    thump(ctx, t, 110, 0.35);
  },
  shutter() {
    if (!enabled || !ctx) return;
    const t = ctx.currentTime;
    blip(ctx, t, 3200, 2, 0.6, 0.025);
    blip(ctx, t + 0.075, 2600, 2, 0.5, 0.03);
    thump(ctx, t + 0.075, 180, 0.15);
  },
};

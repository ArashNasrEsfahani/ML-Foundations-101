/** Minimal linear-scale helpers for SVG widgets (replaces d3-scale). */

export interface Scale {
  (v: number): number;
  invert: (px: number) => number;
  domain: [number, number];
  range: [number, number];
}

export function linearScale(domain: [number, number], range: [number, number]): Scale {
  const [d0, d1] = domain;
  const [r0, r1] = range;
  const m = (r1 - r0) / (d1 - d0 || 1e-9);
  const fn = ((v: number) => r0 + (v - d0) * m) as Scale;
  fn.invert = (px: number) => d0 + (px - r0) / m;
  fn.domain = domain;
  fn.range = range;
  return fn;
}

export const clamp = (v: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, v));

export function extent(values: number[]): [number, number] {
  let lo = Infinity;
  let hi = -Infinity;
  for (const v of values) {
    if (v < lo) lo = v;
    if (v > hi) hi = v;
  }
  return [lo, hi];
}

/** nice tick values for a hand-drawn axis */
export function ticks(lo: number, hi: number, n = 5): number[] {
  const span = hi - lo;
  if (span <= 0) return [lo];
  const step = Math.pow(10, Math.floor(Math.log10(span / n)));
  const err = (span / n) / step;
  const mult = err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1;
  const s = step * mult;
  const start = Math.ceil(lo / s) * s;
  const out: number[] = [];
  for (let v = start; v <= hi + 1e-9; v += s) out.push(Math.round(v * 1e9) / 1e9);
  return out;
}

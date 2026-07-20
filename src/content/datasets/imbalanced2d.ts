import { mulberry32, gaussian, shuffled } from '../../lib/rng';

export interface ImbPt {
  x: number;
  y: number;
  /** +1 = minority class (filled dot), -1 = majority class (open circle) */
  label: 1 | -1;
}

const clampP = (v: number) => Math.max(0.3, Math.min(9.7, v));

/**
 * A deliberately lopsided dataset: 95 majority points spread widely over the
 * whole panel, 5 minority points in a tight cluster. Seeded and reproducible.
 * Predicting "majority" everywhere already scores 95% accuracy — the trap
 * Chapter 8 warns about.
 */
export function imbalanced2d(): ImbPt[] {
  const rand = mulberry32(80801);
  const g = gaussian(rand);
  const pts: ImbPt[] = [];
  for (let i = 0; i < 95; i++) {
    pts.push({ x: clampP(0.5 + rand() * 9), y: clampP(0.5 + rand() * 9), label: -1 });
  }
  for (let i = 0; i < 5; i++) {
    pts.push({ x: clampP(7.9 + g() * 0.45), y: clampP(7.9 + g() * 0.45), label: 1 });
  }
  return pts;
}

function minorityLabelOf(points: ImbPt[]): 1 | -1 {
  let pos = 0;
  for (const p of points) if (p.label === 1) pos++;
  return pos <= points.length - pos ? 1 : -1;
}

/**
 * Oversampling: keep every point and add (factor - 1) jittered copies of each
 * minority point (seeded Gaussian jitter, sd 0.22), so the minority class
 * carries `factor` times its original weight.
 */
export function oversample(points: ImbPt[], factor: number, seed: number): ImbPt[] {
  const rand = mulberry32(seed);
  const g = gaussian(rand);
  const minority = minorityLabelOf(points);
  const out = points.slice();
  for (const p of points) {
    if (p.label !== minority) continue;
    for (let k = 1; k < factor; k++) {
      out.push({ x: clampP(p.x + g() * 0.22), y: clampP(p.y + g() * 0.22), label: p.label });
    }
  }
  return out;
}

/**
 * Undersampling: keep every minority point but only a seeded random
 * `keepFraction` of the majority points.
 */
export function undersample(points: ImbPt[], keepFraction: number, seed: number): ImbPt[] {
  const rand = mulberry32(seed);
  const minority = minorityLabelOf(points);
  const minor = points.filter((p) => p.label === minority);
  const major = points.filter((p) => p.label !== minority);
  const keep = Math.max(1, Math.round(major.length * keepFraction));
  return [...shuffled(major, rand).slice(0, keep), ...minor];
}

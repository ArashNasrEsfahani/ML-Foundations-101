import { mulberry32, gaussian, shuffled } from '../../lib/rng';

export interface WavePoint {
  x: number;
  y: number;
}

/** The smooth "truth" the noisy samples come from (also drawn nowhere — the model must guess it). */
export const waveTruth = (x: number): number =>
  0.5 + 0.35 * Math.sin(2 * Math.PI * 1.1 * x - 0.6);

/**
 * 22 seeded points from a sin-ish smooth curve plus gaussian noise (sd 0.07)
 * on x ∈ [0,1], split into 14 training and 8 validation points for the
 * OverfitLab widget. x positions are evenly spread with a little jitter;
 * the split is a seeded shuffle, so validation points cover the whole range.
 *
 * Seed 7 was chosen so the validation-MSE curve over polynomial degrees 0–12
 * is a clean U with a unique minimum at degree 3 (runner-up ≈ 75% higher),
 * and so the high-degree fits misbehave visibly without exploding.
 */
export function wavepoints(): { train: WavePoint[]; validation: WavePoint[] } {
  const rand = mulberry32(7);
  const g = gaussian(rand);
  const all: WavePoint[] = [];
  for (let i = 0; i < 22; i++) {
    const x = Math.max(0.01, Math.min(0.99, (i + 0.5) / 22 + (rand() - 0.5) * 0.03));
    const y = waveTruth(x) + 0.07 * g();
    all.push({ x, y });
  }
  const idx = shuffled(all.map((_, i) => i), rand);
  const val = new Set(idx.slice(0, 8));
  return {
    train: all.filter((_, i) => !val.has(i)),
    validation: all.filter((_, i) => val.has(i)),
  };
}

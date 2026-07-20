import { mulberry32, gaussian } from '../../lib/rng';

export interface NoisyPt {
  x: number;
  y: number;
  /** +1 = class A (filled dot), -1 = class B (open circle) */
  label: 1 | -1;
}

const clamp01 = (v: number) => Math.max(0.3, Math.min(9.7, v));

/**
 * Two overlapping seeded Gaussian blobs (40 + 40 points) with ~12% of the
 * labels flipped — deliberately messy, for the ensemble widgets. A single
 * small tree overfits the flipped points; a bagged forest smooths them out.
 */
export function noisy2d(): NoisyPt[] {
  const rand = mulberry32(70701);
  const g = gaussian(rand);
  const pts: NoisyPt[] = [];
  for (let i = 0; i < 40; i++) {
    pts.push({ x: clamp01(3.4 + g() * 1.5), y: clamp01(6.5 + g() * 1.5), label: 1 });
  }
  for (let i = 0; i < 40; i++) {
    pts.push({ x: clamp01(6.6 + g() * 1.5), y: clamp01(3.5 + g() * 1.5), label: -1 });
  }
  // flip ~12% of labels (seeded, so the "noise" is always the same points)
  for (const p of pts) {
    if (rand() < 0.12) p.label = (-p.label) as 1 | -1;
  }
  return pts;
}

/**
 * Smaller diagonal two-blob set, separable but with positional scatter —
 * the training data for the BoostingStepper widget. Chosen (by seed) so that
 * AdaBoost with decision stumps reaches 0 training errors in a few rounds.
 */
export function boost2d(): NoisyPt[] {
  const rand = mulberry32(70734);
  const g = gaussian(rand);
  const pts: NoisyPt[] = [];
  for (let i = 0; i < 13; i++) {
    pts.push({ x: clamp01(6.2 + g() * 1.25), y: clamp01(6.2 + g() * 1.25), label: 1 });
  }
  for (let i = 0; i < 13; i++) {
    pts.push({ x: clamp01(3.8 + g() * 1.25), y: clamp01(3.8 + g() * 1.25), label: -1 });
  }
  return pts;
}

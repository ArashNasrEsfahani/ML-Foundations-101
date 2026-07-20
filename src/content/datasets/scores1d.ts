import { mulberry32, gaussian } from '../../lib/rng';
import type { ScoredExample } from '../../lib/ml/metrics';

/**
 * Sixty model confidence scores with ground-truth labels for the ThresholdRoc
 * widget: 30 positives clustered near 0.65 and 30 negatives near 0.35
 * (sd 0.15 each, clipped to the unit interval) — enough overlap that no
 * threshold is perfect. Seeded, so every visitor sees the same data.
 *
 * Seed 34 was chosen so the challenge (TPR ≥ 0.9 with FPR ≤ 0.2) is reachable
 * on a threshold window ≈ [0.42, 0.49] — findable, but not where the widget
 * starts (0.5). Empirical AUC ≈ 0.94.
 */
export function scores1d(): ScoredExample[] {
  const rand = mulberry32(34);
  const g = gaussian(rand);
  const clip = (v: number) => Math.max(0.01, Math.min(0.99, v));
  const out: ScoredExample[] = [];
  for (let i = 0; i < 30; i++) out.push({ score: clip(0.65 + 0.15 * g()), label: 1 });
  for (let i = 0; i < 30; i++) out.push({ score: clip(0.35 + 0.15 * g()), label: 0 });
  return out;
}

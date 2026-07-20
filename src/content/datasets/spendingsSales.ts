import { mulberry32, gaussian } from '../../lib/rng';

export interface SpendingPoint {
  /** radio-ad spendings, millions */
  x: number;
  /** units sold */
  y: number;
}

/**
 * Toy "ad spendings vs units sold" data in the spirit of the book's Figure
 * (original numbers, seeded and reproducible). x spans ~10–48, generated as
 * y ≈ 0.4·x + 3 + gaussian noise, clamped to 5–25 units.
 *
 * Seed and noise level are deliberately chosen so that full-batch gradient
 * descent behaves well pedagogically on the RAW (unscaled) feature:
 *  - α = 0.001 converges (stability threshold ≈ 1/mean(x²), hence the
 *    slightly low-biased base grid keeping mean(x²) ≈ 875);
 *  - any α in ~[0.0001, 0.001] reaches 1.02× the least-squares optimum
 *    within 30 epochs (the sampled intercept lands near the w=0, b=0 start);
 *  - α ≳ 0.0012 visibly diverges.
 * Do not change the seed casually — tests/gd.spec.ts and the DescentStepper
 * challenge depend on these properties.
 */
export function spendingsSales(): SpendingPoint[] {
  const rand = mulberry32(20240421);
  const g = gaussian(rand);
  const base = [10, 11, 13, 14, 16, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 38, 41, 44, 46, 48];
  return base.map((bx) => {
    const x = Math.round((bx + (rand() - 0.5) * 2) * 10) / 10;
    const y = Math.round((0.4 * x + 3 + g() * 2.6) * 10) / 10;
    return { x, y: Math.max(5, Math.min(25, y)) };
  });
}

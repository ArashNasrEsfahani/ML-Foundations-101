/**
 * Pure math for the BayesBoxes widget (framework-free).
 * Story: screening a population for a rare illness with an imperfect test.
 */

/**
 * Posterior P(sick | positive) by Bayes' rule.
 * @param prior P(sick), the base rate in the population (0..1)
 * @param sens  P(+ | sick), the test's sensitivity (0..1)
 * @param fpr   P(+ | healthy), the false-positive rate (0..1)
 */
export function posterior(prior: number, sens: number, fpr: number): number {
  const truePos = sens * prior;
  const falsePos = fpr * (1 - prior);
  const denom = truePos + falsePos;
  return denom <= 0 ? 0 : truePos / denom;
}

export interface BayesCounts {
  sick: number;
  healthy: number;
  sickPos: number;
  sickNeg: number;
  healthyPos: number;
  healthyNeg: number;
  totalPos: number;
}

/**
 * Natural-frequency counts for a population of `n` people, rounded to whole
 * people so a dot grid can show them. Always partitions exactly: sick + healthy = n,
 * sickPos + sickNeg = sick, healthyPos + healthyNeg = healthy.
 */
export function bayesCounts(n: number, prior: number, sens: number, fpr: number): BayesCounts {
  const sick = Math.min(n, Math.max(0, Math.round(n * prior)));
  const healthy = n - sick;
  const sickPos = Math.min(sick, Math.max(0, Math.round(sick * sens)));
  const healthyPos = Math.min(healthy, Math.max(0, Math.round(healthy * fpr)));
  return {
    sick,
    healthy,
    sickPos,
    sickNeg: sick - sickPos,
    healthyPos,
    healthyNeg: healthy - healthyPos,
    totalPos: sickPos + healthyPos,
  };
}

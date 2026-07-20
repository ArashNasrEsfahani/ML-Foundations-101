/**
 * Logistic regression for 1D inputs — pure, framework-free math.
 * Model: p(y=1 | x) = σ(w·x + b). Trained by maximizing the log-likelihood.
 */

export interface Point1D {
  x: number;
  /** binary class label */
  label: 0 | 1;
}

/** The standard logistic (sigmoid) function: squashes ℝ into (0, 1). */
export function sigmoid(z: number): number {
  return 1 / (1 + Math.exp(-z));
}

/**
 * Log-likelihood of the labels under the model σ(w·x + b):
 * Σ yᵢ ln pᵢ + (1 − yᵢ) ln(1 − pᵢ). Probabilities are clamped away from 0
 * so the result stays finite.
 */
export function logLikelihood(points: Point1D[], w: number, b: number): number {
  let ll = 0;
  for (const p of points) {
    const q = sigmoid(w * p.x + b);
    const pr = p.label === 1 ? q : 1 - q;
    ll += Math.log(Math.max(pr, 1e-12));
  }
  return ll;
}

/**
 * One gradient-ascent step on the log-likelihood.
 * ∂LL/∂w = Σ (yᵢ − pᵢ)·xᵢ,  ∂LL/∂b = Σ (yᵢ − pᵢ).
 * The surface is concave, so small steps always increase LL.
 */
export function ascentStep(
  points: Point1D[],
  w: number,
  b: number,
  lr = 0.01,
): { w: number; b: number } {
  let gw = 0;
  let gb = 0;
  for (const p of points) {
    const q = sigmoid(w * p.x + b);
    gw += (p.label - q) * p.x;
    gb += p.label - q;
  }
  return { w: w + lr * gw, b: b + lr * gb };
}

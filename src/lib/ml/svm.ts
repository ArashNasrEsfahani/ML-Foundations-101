/**
 * SVM-flavored classifiers for 2D toy data — pure, framework-free math.
 *
 * 1) Linear soft-margin SVM trained by subgradient descent on
 *    J = ½‖w‖² + (C/N) Σ max(0, 1 − yᵢ(w·xᵢ − b)).
 * 2) An RBF-kernel perceptron: the classic dual trick — the model is a set of
 *    per-example counts (alphas), and prediction is a kernel-weighted vote.
 */

export interface LabeledPoint {
  x: number;
  y: number;
  label: 1 | -1;
}

export interface LinearModel {
  w: [number, number];
  b: number;
}

/** Raw decision value w·p − b for a linear model. */
export function decisionLinear(model: LinearModel, x: number, y: number): number {
  return model.w[0] * x + model.w[1] * y - model.b;
}

/**
 * Subgradient descent on the soft-margin objective. C trades margin width
 * against violations: large C punishes every point inside the margin.
 */
export function fitLinearSvm(
  points: LabeledPoint[],
  C: number,
  steps = 600,
  lr = 0.01,
): LinearModel {
  let w0 = 0;
  let w1 = 0;
  let b = 0;
  const n = points.length || 1;
  for (let s = 0; s < steps; s++) {
    // regularizer gradient
    let g0 = w0;
    let g1 = w1;
    let gb = 0;
    for (const p of points) {
      const m = p.label * (w0 * p.x + w1 * p.y - b);
      if (m < 1) {
        // active hinge: subgradient of 1 − y(w·x − b)
        g0 -= (C * p.label * p.x) / n;
        g1 -= (C * p.label * p.y) / n;
        gb += (C * p.label) / n;
      }
    }
    const eta = lr / (1 + s * 0.005); // mild decay stabilizes the tail
    w0 -= eta * g0;
    w1 -= eta * g1;
    b -= eta * gb;
  }
  return { w: [w0, w1], b };
}

/** Gaussian RBF kernel k(a, b) = exp(−γ‖a − b‖²). */
export function rbfKernel(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  gamma: number,
): number {
  const dx = ax - bx;
  const dy = ay - by;
  return Math.exp(-gamma * (dx * dx + dy * dy));
}

/**
 * Kernel perceptron with the RBF kernel. Each mistake on example i bumps
 * its alpha; prediction is sign of Σ αⱼ yⱼ k(xⱼ, x). Stops early once an
 * epoch makes no mistakes (training accuracy 100%).
 */
export function fitKernelPerceptron(
  points: LabeledPoint[],
  gamma: number,
  epochs = 40,
): number[] {
  const n = points.length;
  const alphas = new Array<number>(n).fill(0);
  // precompute the kernel matrix (toy sizes only)
  const K: number[][] = [];
  for (let i = 0; i < n; i++) {
    K.push([]);
    for (let j = 0; j < n; j++) {
      K[i].push(rbfKernel(points[i].x, points[i].y, points[j].x, points[j].y, gamma));
    }
  }
  for (let e = 0; e < epochs; e++) {
    let mistakes = 0;
    for (let i = 0; i < n; i++) {
      let score = 0;
      for (let j = 0; j < n; j++) {
        if (alphas[j] !== 0) score += alphas[j] * points[j].label * K[i][j];
      }
      if (points[i].label * score <= 0) {
        alphas[i] += 1;
        mistakes++;
      }
    }
    if (mistakes === 0) break;
  }
  return alphas;
}

/** Raw kernel-vote score for a query point (positive → class +1). */
export function predictKernel(
  points: LabeledPoint[],
  alphas: number[],
  gamma: number,
  x: number,
  y: number,
): number {
  let s = 0;
  for (let j = 0; j < points.length; j++) {
    if (alphas[j] !== 0) {
      s += alphas[j] * points[j].label * rbfKernel(points[j].x, points[j].y, x, y, gamma);
    }
  }
  return s;
}

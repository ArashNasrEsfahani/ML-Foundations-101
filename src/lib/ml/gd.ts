/**
 * Pure gradient-descent engine for one-feature linear regression f(x) = w·x + b.
 * Framework-free: used by the DescentStepper widget and unit-tested in tests/gd.spec.ts.
 */

export interface XYPoint {
  x: number;
  y: number;
}

/** Mean squared error of the line (w, b) over the points. */
export function loss(points: XYPoint[], w: number, b: number): number {
  let sum = 0;
  for (const p of points) {
    const r = p.y - (w * p.x + b);
    sum += r * r;
  }
  return sum / points.length;
}

/**
 * One full-batch gradient-descent epoch (one sweep over all points,
 * then one update of each parameter). Returns the updated parameters.
 *
 *   ∂l/∂w = (1/N) Σ −2·xᵢ·(yᵢ − (w·xᵢ + b))
 *   ∂l/∂b = (1/N) Σ −2·(yᵢ − (w·xᵢ + b))
 */
export function gradStep(
  points: XYPoint[],
  w: number,
  b: number,
  alpha: number,
): { w: number; b: number } {
  const n = points.length;
  let gw = 0;
  let gb = 0;
  for (const p of points) {
    const r = p.y - (w * p.x + b);
    gw += (-2 * p.x * r) / n;
    gb += (-2 * r) / n;
  }
  return { w: w - alpha * gw, b: b - alpha * gb };
}

/**
 * Run gradient descent from w = 0, b = 0.
 * history[0] is the starting state; one further entry per epoch (length = epochs + 1).
 */
export function runEpochs(
  points: XYPoint[],
  alpha: number,
  epochs: number,
): { history: { w: number; b: number; loss: number }[] } {
  let w = 0;
  let b = 0;
  const history: { w: number; b: number; loss: number }[] = [
    { w, b, loss: loss(points, w, b) },
  ];
  for (let e = 0; e < epochs; e++) {
    ({ w, b } = gradStep(points, w, b, alpha));
    history.push({ w, b, loss: loss(points, w, b) });
  }
  return { history };
}

/** Closed-form least-squares solution — the optimum gradient descent crawls toward. */
export function closedForm(points: XYPoint[]): { w: number; b: number } {
  const n = points.length;
  let mx = 0;
  let my = 0;
  for (const p of points) {
    mx += p.x / n;
    my += p.y / n;
  }
  let sxy = 0;
  let sxx = 0;
  for (const p of points) {
    sxy += (p.x - mx) * (p.y - my);
    sxx += (p.x - mx) * (p.x - mx);
  }
  const w = sxy / (sxx || 1e-12);
  return { w, b: my - w * mx };
}

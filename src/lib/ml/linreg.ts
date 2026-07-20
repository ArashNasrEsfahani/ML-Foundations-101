/**
 * Linear regression — pure, framework-free math.
 * Model: f(x) = w·x + b for 1D inputs. Closed-form least squares + MSE.
 */

export interface PointXY {
  x: number;
  y: number;
}

/** Closed-form least squares fit: w = cov(x,y)/var(x), b = ȳ − w·x̄. */
export function fitLinreg(points: PointXY[]): { w: number; b: number } {
  const n = points.length;
  if (n === 0) return { w: 0, b: 0 };
  let mx = 0;
  let my = 0;
  for (const p of points) {
    mx += p.x;
    my += p.y;
  }
  mx /= n;
  my /= n;
  let sxx = 0;
  let sxy = 0;
  for (const p of points) {
    const dx = p.x - mx;
    sxx += dx * dx;
    sxy += dx * (p.y - my);
  }
  const w = sxx === 0 ? 0 : sxy / sxx;
  return { w, b: my - w * mx };
}

/** Mean squared error of the line (w, b) over the points. */
export function mse(points: PointXY[], w: number, b: number): number {
  const n = points.length;
  if (n === 0) return 0;
  let s = 0;
  for (const p of points) {
    const r = w * p.x + b - p.y;
    s += r * r;
  }
  return s / n;
}

/**
 * One gradient-descent step on the MSE objective, taken in mean-centered
 * coordinates (y ≈ w·(x−x̄) + c) so the step is well conditioned; the result
 * is converted back to (w, b). Each step strictly reduces MSE for lr < 0.5.
 */
export function descentStep(
  points: PointXY[],
  w: number,
  b: number,
  lr = 0.08,
): { w: number; b: number } {
  const n = points.length;
  if (n === 0) return { w, b };
  let mx = 0;
  let my = 0;
  for (const p of points) {
    mx += p.x;
    my += p.y;
  }
  mx /= n;
  my /= n;
  const c = b + w * mx; // prediction at x = x̄
  let gw = 0;
  let gc = 0;
  let varx = 0;
  for (const p of points) {
    const dx = p.x - mx;
    const r = w * dx + c - p.y;
    gw += (2 / n) * r * dx;
    gc += (2 / n) * r;
    varx += (dx * dx) / n;
  }
  const w2 = w - (lr / Math.max(varx, 1e-9)) * gw;
  const c2 = c - lr * gc;
  return { w: w2, b: c2 - w2 * mx };
}

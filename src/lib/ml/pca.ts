/** Pure, framework-free PCA for 2D point clouds (closed-form 2x2 eigen-decomposition). */

export interface Pt {
  x: number;
  y: number;
}

export interface Cov2 {
  /** var(x) */ a: number;
  /** cov(x, y) */ b: number;
  /** var(y) */ c: number;
}

export interface Pca2Result {
  mean: Pt;
  cov: Cov2;
  /** angle (radians) of the first principal component — the max-variance direction */
  angle1: number;
  /** angle of the second PC, orthogonal to the first */
  angle2: number;
  /** variance along PC1 (largest eigenvalue) */
  var1: number;
  /** variance along PC2 (smallest eigenvalue) */
  var2: number;
}

export function meanOf(points: Pt[]): Pt {
  let sx = 0;
  let sy = 0;
  for (const p of points) {
    sx += p.x;
    sy += p.y;
  }
  const n = points.length || 1;
  return { x: sx / n, y: sy / n };
}

/** Population covariance matrix of a 2D cloud. */
export function covariance(points: Pt[]): Cov2 {
  const m = meanOf(points);
  let a = 0;
  let b = 0;
  let c = 0;
  for (const p of points) {
    const dx = p.x - m.x;
    const dy = p.y - m.y;
    a += dx * dx;
    b += dx * dy;
    c += dy * dy;
  }
  const n = points.length || 1;
  return { a: a / n, b: b / n, c: c / n };
}

/**
 * Closed-form eigen-decomposition of the symmetric 2x2 covariance matrix:
 * eigenvalues (a+c)/2 ± sqrt(((a−c)/2)² + b²), PC1 angle = ½·atan2(2b, a−c).
 */
export function pca2(points: Pt[]): Pca2Result {
  const mean = meanOf(points);
  const cov = covariance(points);
  const { a, b, c } = cov;
  const half = (a + c) / 2;
  const rad = Math.sqrt(((a - c) / 2) ** 2 + b * b);
  const var1 = half + rad;
  const var2 = half - rad;
  const angle1 = 0.5 * Math.atan2(2 * b, a - c);
  const angle2 = angle1 + Math.PI / 2;
  return { mean, cov, angle1, angle2, var1, var2 };
}

/** Variance of the 1D projections of the cloud onto the direction `angle`: uᵀΣu. */
export function varianceCapturedAlong(points: Pt[], angle: number): number {
  const { a, b, c } = covariance(points);
  const co = Math.cos(angle);
  const si = Math.sin(angle);
  return a * co * co + 2 * b * si * co + c * si * si;
}

/** Smallest absolute difference between two axis angles, ignoring direction (mod 180°). */
export function axisAngleDiff(t1: number, t2: number): number {
  let d = Math.abs(t1 - t2) % Math.PI;
  if (d > Math.PI / 2) d = Math.PI - d;
  return d;
}

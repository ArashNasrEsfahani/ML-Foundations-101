/**
 * Least-squares polynomial fitting — pure, framework-free.
 *
 * Fits by normal equations on a small Vandermonde system, solved with
 * gaussian elimination (partial pivoting). To keep the system reasonably
 * conditioned up to degree ~12, fitting happens in a scaled variable
 * t = 2x − 1 (so x ∈ [0,1] maps to t ∈ [−1,1]). Coefficients are therefore
 * in the t-basis; `predictPoly` applies the same scaling, so callers can
 * treat (coeffs, x) as an opaque model.
 */

export interface XY {
  x: number;
  y: number;
}

const scaleX = (x: number): number => 2 * x - 1;

/** Solve A c = b by gaussian elimination with partial pivoting. */
function solveLinear(A: number[][], b: number[]): number[] {
  const n = b.length;
  const M = A.map((row, i) => [...row, b[i]]);
  for (let col = 0; col < n; col++) {
    let piv = col;
    for (let r = col + 1; r < n; r++) {
      if (Math.abs(M[r][col]) > Math.abs(M[piv][col])) piv = r;
    }
    [M[col], M[piv]] = [M[piv], M[col]];
    const p = M[col][col];
    if (Math.abs(p) < 1e-12) continue; // degenerate column → coefficient stays 0
    for (let r = col + 1; r < n; r++) {
      const f = M[r][col] / p;
      for (let c = col; c <= n; c++) M[r][c] -= f * M[col][c];
    }
  }
  const out = new Array<number>(n).fill(0);
  for (let row = n - 1; row >= 0; row--) {
    let sum = M[row][n];
    for (let col = row + 1; col < n; col++) sum -= M[row][col] * out[col];
    out[row] = Math.abs(M[row][row]) < 1e-12 ? 0 : sum / M[row][row];
  }
  return out;
}

/**
 * Fit y ≈ Σ c_k t^k (t = 2x−1) of the given degree.
 * Builds XᵀX and Xᵀy directly, adds a whisper of ridge (~1e-10 relative)
 * so high degrees stay numerically stable, then solves.
 */
export function fitPoly(points: XY[], degree: number): number[] {
  const n = degree + 1;
  const A: number[][] = Array.from({ length: n }, () => new Array<number>(n).fill(0));
  const b = new Array<number>(n).fill(0);
  for (const p of points) {
    const t = scaleX(p.x);
    const pow: number[] = [1];
    for (let k = 1; k <= 2 * degree; k++) pow.push(pow[k - 1] * t);
    for (let i = 0; i < n; i++) {
      b[i] += pow[i] * p.y;
      for (let j = 0; j < n; j++) A[i][j] += pow[i + j];
    }
  }
  const ridge = 1e-10 * Math.max(1, points.length);
  for (let i = 0; i < n; i++) A[i][i] += ridge;
  return solveLinear(A, b);
}

/** Evaluate the fitted polynomial at raw x (Horner scheme in the scaled variable). */
export function predictPoly(coeffs: number[], x: number): number {
  const t = scaleX(x);
  let y = 0;
  for (let k = coeffs.length - 1; k >= 0; k--) y = y * t + coeffs[k];
  return y;
}

/** Mean squared error of the fitted polynomial over a set of points. */
export function mse(coeffs: number[], points: XY[]): number {
  if (points.length === 0) return 0;
  let sum = 0;
  for (const p of points) {
    const d = predictPoly(coeffs, p.x) - p.y;
    sum += d * d;
  }
  return sum / points.length;
}

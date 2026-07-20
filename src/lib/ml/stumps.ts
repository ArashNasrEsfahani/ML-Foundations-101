/**
 * Decision stumps, tiny depth-limited trees, bagging and AdaBoost on 2-D
 * labeled points. Pure and framework-free — used by the Chapter 7/8 widgets
 * (EnsembleSandbox, BoostingStepper) and unit-tested in tests/stumps.spec.ts.
 */
import { mulberry32 } from '../rng';

export interface Pt2L {
  x: number;
  y: number;
  label: 1 | -1;
}

/* ------------------------------------------------------------------ stumps */

export interface Stump {
  axis: 'x' | 'y';
  threshold: number;
  /** label predicted when the coordinate is greater than the threshold */
  above: 1 | -1;
}

export function stumpPredict(s: Stump, p: { x: number; y: number }): 1 | -1 {
  const v = s.axis === 'x' ? p.x : p.y;
  return v > s.threshold ? s.above : ((-s.above) as 1 | -1);
}

/** Weighted 0-1 error of a stump (weights need not be normalized). */
export function stumpError(s: Stump, points: Pt2L[], weights: number[]): number {
  let e = 0;
  for (let i = 0; i < points.length; i++) {
    if (stumpPredict(s, points[i]) !== points[i].label) e += weights[i];
  }
  return e;
}

/**
 * Exhaustive search over both axes and all mid-point thresholds for the stump
 * with the lowest weighted error. Deterministic: ties keep the first candidate.
 */
export function bestStump(points: Pt2L[], weights: number[]): Stump {
  let totalW = 0;
  for (const w of weights) totalW += w;

  let best: Stump = { axis: 'x', threshold: 0, above: 1 };
  let bestErr = Infinity;

  for (const axis of ['x', 'y'] as const) {
    const values = points.map((p) => (axis === 'x' ? p.x : p.y));
    const sorted = [...new Set(values)].sort((a, b) => a - b);
    const thresholds: number[] = [sorted[0] - 1];
    for (let i = 0; i + 1 < sorted.length; i++) {
      thresholds.push((sorted[i] + sorted[i + 1]) / 2);
    }
    for (const threshold of thresholds) {
      // error when `above` predicts +1
      let ePos = 0;
      for (let i = 0; i < points.length; i++) {
        const pred = values[i] > threshold ? 1 : -1;
        if (pred !== points[i].label) ePos += weights[i];
      }
      const eNeg = totalW - ePos; // flipping `above` flips every prediction
      if (ePos < bestErr) {
        bestErr = ePos;
        best = { axis, threshold, above: 1 };
      }
      if (eNeg < bestErr) {
        bestErr = eNeg;
        best = { axis, threshold, above: -1 };
      }
    }
  }
  return best;
}

/* ---------------------------------------------------- tiny trees + bagging */

export type TreeNode =
  | { kind: 'leaf'; label: 1 | -1 }
  | { kind: 'split'; axis: 'x' | 'y'; threshold: number; left: TreeNode; right: TreeNode };

function majorityLabel(points: Pt2L[]): 1 | -1 {
  let s = 0;
  for (const p of points) s += p.label;
  return s >= 0 ? 1 : -1;
}

function minorityCount(points: Pt2L[]): number {
  let pos = 0;
  for (const p of points) if (p.label === 1) pos++;
  return Math.min(pos, points.length - pos);
}

/**
 * Greedy depth-limited tree: at each node pick the axis/threshold whose two
 * majority-labeled children misclassify the fewest points. Deterministic.
 */
export function trainTree(points: Pt2L[], depth: number): TreeNode {
  const leafErr = minorityCount(points);
  if (depth <= 0 || leafErr === 0 || points.length < 2) {
    return { kind: 'leaf', label: majorityLabel(points) };
  }

  let best: { axis: 'x' | 'y'; threshold: number } | null = null;
  let bestErr = leafErr; // must strictly improve on the plain leaf

  for (const axis of ['x', 'y'] as const) {
    const values = points.map((p) => (axis === 'x' ? p.x : p.y));
    const sorted = [...new Set(values)].sort((a, b) => a - b);
    for (let i = 0; i + 1 < sorted.length; i++) {
      const threshold = (sorted[i] + sorted[i + 1]) / 2;
      const left: Pt2L[] = [];
      const right: Pt2L[] = [];
      for (const p of points) {
        ((axis === 'x' ? p.x : p.y) <= threshold ? left : right).push(p);
      }
      const err = minorityCount(left) + minorityCount(right);
      if (err < bestErr) {
        bestErr = err;
        best = { axis, threshold };
      }
    }
  }

  if (!best) return { kind: 'leaf', label: majorityLabel(points) };

  const left: Pt2L[] = [];
  const right: Pt2L[] = [];
  for (const p of points) {
    ((best.axis === 'x' ? p.x : p.y) <= best.threshold ? left : right).push(p);
  }
  return {
    kind: 'split',
    axis: best.axis,
    threshold: best.threshold,
    left: trainTree(left, depth - 1),
    right: trainTree(right, depth - 1),
  };
}

export function treePredict(node: TreeNode, p: { x: number; y: number }): 1 | -1 {
  let n = node;
  while (n.kind === 'split') {
    n = (n.axis === 'x' ? p.x : p.y) <= n.threshold ? n.left : n.right;
  }
  return n.label;
}

/** Bagging: train `nTrees` depth-limited trees on seeded bootstrap samples. */
export function baggedTrees(points: Pt2L[], nTrees: number, depth: number, seed: number): TreeNode[] {
  const rand = mulberry32(seed);
  const trees: TreeNode[] = [];
  for (let t = 0; t < nTrees; t++) {
    const sample: Pt2L[] = [];
    for (let i = 0; i < points.length; i++) {
      sample.push(points[Math.floor(rand() * points.length)]);
    }
    trees.push(trainTree(sample, depth));
  }
  return trees;
}

/** Majority vote over the forest (ties break toward +1, deterministically). */
export function forestPredict(trees: TreeNode[], p: { x: number; y: number }): 1 | -1 {
  let s = 0;
  for (const t of trees) s += treePredict(t, p);
  return s >= 0 ? 1 : -1;
}

/** Fraction of trees voting +1 — handy for shading soft decision regions. */
export function forestVoteFraction(trees: TreeNode[], p: { x: number; y: number }): number {
  if (trees.length === 0) return 0.5;
  let pos = 0;
  for (const t of trees) if (treePredict(t, p) === 1) pos++;
  return pos / trees.length;
}

/* ---------------------------------------------------------------- AdaBoost */

export interface AdaModel {
  stumps: Stump[];
  alphas: number[];
  /** weightsHistory[t] = normalized example weights *after* t rounds (index 0 = uniform start) */
  weightsHistory: number[][];
}

export function adaboost(points: Pt2L[], rounds: number): AdaModel {
  const n = points.length;
  let w = new Array<number>(n).fill(1 / n);
  const stumps: Stump[] = [];
  const alphas: number[] = [];
  const weightsHistory: number[][] = [w.slice()];

  for (let t = 0; t < rounds; t++) {
    const stump = bestStump(points, w);
    const err = Math.min(Math.max(stumpError(stump, points, w), 1e-12), 1 - 1e-12);
    const alpha = 0.5 * Math.log((1 - err) / err);
    stumps.push(stump);
    alphas.push(alpha);

    const next = new Array<number>(n);
    let sum = 0;
    for (let i = 0; i < n; i++) {
      const h = stumpPredict(stump, points[i]);
      next[i] = w[i] * Math.exp(-alpha * points[i].label * h);
      sum += next[i];
    }
    for (let i = 0; i < n; i++) next[i] /= sum;
    w = next;
    weightsHistory.push(w.slice());

    if (err < 1e-9) break; // a perfect stump dominates every later vote
  }
  return { stumps, alphas, weightsHistory };
}

/** Sign of the alpha-weighted stump vote, optionally using only the first `upTo` rounds. */
export function adaPredict(model: AdaModel, p: { x: number; y: number }, upTo?: number): 1 | -1 {
  const m = upTo === undefined ? model.stumps.length : Math.min(upTo, model.stumps.length);
  let s = 0;
  for (let t = 0; t < m; t++) s += model.alphas[t] * stumpPredict(model.stumps[t], p);
  return s >= 0 ? 1 : -1;
}

/* ----------------------------------------------------------- tiny metrics */

/** Fraction of points a predictor labels correctly. */
export function accuracy(points: Pt2L[], predict: (p: { x: number; y: number }) => 1 | -1): number {
  if (points.length === 0) return 0;
  let ok = 0;
  for (const p of points) if (predict(p) === p.label) ok++;
  return ok / points.length;
}

/** Number of training errors of a predictor. */
export function countErrors(points: Pt2L[], predict: (p: { x: number; y: number }) => 1 | -1): number {
  let e = 0;
  for (const p of points) if (predict(p) !== p.label) e++;
  return e;
}

import { describe, it, expect } from 'vitest';
import {
  bestStump,
  stumpPredict,
  stumpError,
  trainTree,
  treePredict,
  baggedTrees,
  forestPredict,
  adaboost,
  adaPredict,
  accuracy,
  countErrors,
  type Pt2L,
} from '../src/lib/ml/stumps';
import { noisy2d, boost2d } from '../src/content/datasets/noisy2d';

describe('decision stumps', () => {
  it('splits an obviously separable dataset perfectly', () => {
    const pts: Pt2L[] = [
      { x: 1, y: 5, label: -1 },
      { x: 2, y: 4, label: -1 },
      { x: 3, y: 6, label: -1 },
      { x: 7, y: 5, label: 1 },
      { x: 8, y: 6, label: 1 },
      { x: 9, y: 4, label: 1 },
    ];
    const w = pts.map(() => 1 / pts.length);
    const s = bestStump(pts, w);
    expect(s.axis).toBe('x');
    expect(s.threshold).toBeGreaterThan(3);
    expect(s.threshold).toBeLessThan(7);
    expect(stumpError(s, pts, w)).toBe(0);
    for (const p of pts) expect(stumpPredict(s, p)).toBe(p.label);
  });

  it('minimizes WEIGHTED error, not raw count (hand-computed fixture)', () => {
    // labels along x: +, +, -, + — but the "-" point carries most of the weight,
    // so the best stump sacrifices the light +1 point at x=4 to get it right.
    const pts: Pt2L[] = [
      { x: 1, y: 0, label: 1 },
      { x: 2, y: 0, label: 1 },
      { x: 3, y: 0, label: -1 },
      { x: 4, y: 0, label: 1 },
    ];
    const w = [0.1, 0.1, 0.6, 0.2];
    const s = bestStump(pts, w);
    expect(s).toEqual({ axis: 'x', threshold: 2.5, above: -1 });
    expect(stumpError(s, pts, w)).toBeCloseTo(0.2, 10);
  });
});

describe('adaboost', () => {
  it('training error is non-increasing over rounds and reaches 0 within 12 on the seeded boost2d set', () => {
    const pts = boost2d() as Pt2L[];
    const model = adaboost(pts, 12);
    const errs: number[] = [];
    for (let t = 1; t <= model.stumps.length; t++) {
      errs.push(countErrors(pts, (p) => adaPredict(model, p, t)));
    }
    for (let t = 1; t < errs.length; t++) {
      expect(errs[t]).toBeLessThanOrEqual(errs[t - 1]);
    }
    expect(Math.min(...errs)).toBe(0);
    expect(errs.indexOf(0) + 1).toBeLessThanOrEqual(12);
  });

  it('keeps example weights normalized and raises the weight of misclassified points', () => {
    const pts = boost2d() as Pt2L[];
    const model = adaboost(pts, 5);
    for (const w of model.weightsHistory) {
      expect(w.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 9);
    }
    // after round 1, every point the first stump misclassified must weigh MORE than before
    const first = model.stumps[0];
    const before = model.weightsHistory[0];
    const after = model.weightsHistory[1];
    pts.forEach((p, i) => {
      if (stumpPredict(first, p) !== p.label) {
        expect(after[i]).toBeGreaterThan(before[i]);
      }
    });
  });
});

describe('bagging', () => {
  it('a 15-tree bagged forest beats a single stump on the seeded noisy two-blob set (train accuracy)', () => {
    const pts = noisy2d() as Pt2L[];
    const w = pts.map(() => 1 / pts.length);
    const stump = bestStump(pts, w);
    const stumpAcc = accuracy(pts, (p) => stumpPredict(stump, p));
    const forest = baggedTrees(pts, 15, 2, 42);
    const forestAcc = accuracy(pts, (p) => forestPredict(forest, p));
    expect(forestAcc).toBeGreaterThan(stumpAcc);
  });

  it('the widget challenge is satisfiable: forest (seed 2024, n ≥ 20) beats the single depth-2 tree', () => {
    const pts = noisy2d() as Pt2L[];
    const tree = trainTree(pts, 2);
    const treeAcc = accuracy(pts, (p) => treePredict(tree, p));
    for (const n of [20, 25, 30]) {
      const forest = baggedTrees(pts, n, 2, 2024);
      expect(accuracy(pts, (p) => forestPredict(forest, p))).toBeGreaterThan(treeAcc);
    }
  });
});

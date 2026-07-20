import { describe, it, expect } from 'vitest';
import { kmeansStep, kmeansInit, maxCentroidShift, assignPoints } from '../src/lib/ml/kmeans';
import { blobs3 } from '../src/content/datasets/blobs3';

const PERMS3 = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
];

function partitionAccuracy(assignments: number[], truth: number[]): number {
  let best = 0;
  for (const perm of PERMS3) {
    let ok = 0;
    for (let i = 0; i < truth.length; i++) {
      if (perm[assignments[i]] === truth[i]) ok++;
    }
    best = Math.max(best, ok / truth.length);
  }
  return best;
}

describe('kmeans on three seeded blobs', () => {
  const pts = blobs3();
  const truth = pts.map((p) => p.blob);

  it('hand-computed fixture: one step assigns and averages correctly', () => {
    const square = [
      { x: 0, y: 0 },
      { x: 0, y: 2 },
      { x: 10, y: 0 },
      { x: 10, y: 2 },
    ];
    const { assignments, newCentroids, inertia } = kmeansStep(square, [
      { x: 1, y: 1 },
      { x: 9, y: 1 },
    ]);
    expect(assignments).toEqual([0, 0, 1, 1]);
    expect(newCentroids[0]).toEqual({ x: 0, y: 1 });
    expect(newCentroids[1]).toEqual({ x: 10, y: 1 });
    // each point is at distance sqrt(1+1) from its centroid: 4 * 2 = 8
    expect(inertia).toBeCloseTo(8, 10);
  });

  it('converges to the correct 3-blob partition from a seeded init', () => {
    let centroids = kmeansInit(pts, 3, 7);
    let assignments: number[] = [];
    for (let iter = 0; iter < 60; iter++) {
      const step = kmeansStep(pts, centroids);
      assignments = step.assignments;
      if (maxCentroidShift(centroids, step.newCentroids) < 1e-9) break;
      centroids = step.newCentroids;
    }
    expect(partitionAccuracy(assignments, truth)).toBeGreaterThanOrEqual(0.95);
  });

  it('inertia is non-increasing across Lloyd steps', () => {
    let centroids = kmeansInit(pts, 3, 12345);
    let prev = Infinity;
    for (let iter = 0; iter < 40; iter++) {
      const step = kmeansStep(pts, centroids);
      expect(step.inertia).toBeLessThanOrEqual(prev + 1e-9);
      prev = step.inertia;
      if (maxCentroidShift(centroids, step.newCentroids) < 1e-9) break;
      centroids = step.newCentroids;
    }
  });

  it('empty clusters keep their previous centroid position', () => {
    const far = { x: 100, y: 100 };
    const { newCentroids } = kmeansStep(
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
      ],
      [{ x: 0.5, y: 0 }, far],
    );
    expect(newCentroids[1]).toEqual(far);
  });

  it('assignPoints inertia matches a direct computation', () => {
    const centroids = kmeansInit(pts, 3, 99);
    const { assignments, inertia } = assignPoints(pts, centroids);
    let manual = 0;
    for (let i = 0; i < pts.length; i++) {
      const c = centroids[assignments[i]];
      manual += (pts[i].x - c.x) ** 2 + (pts[i].y - c.y) ** 2;
    }
    expect(inertia).toBeCloseTo(manual, 8);
  });
});

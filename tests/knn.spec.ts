import { describe, it, expect } from 'vitest';
import { knnPredict, distance, type KnnPoint } from '../src/lib/ml/knn';

describe('k-nearest neighbors', () => {
  const pts: KnnPoint[] = [
    { x: 1.0, y: 1.0, label: 1 },
    { x: 1.5, y: 1.0, label: 1 },
    { x: 9.0, y: 9.0, label: -1 },
    { x: 8.0, y: 9.0, label: -1 },
    { x: 9.0, y: 8.0, label: -1 },
  ];

  it('k = 1 returns the nearest point’s label (euclidean)', () => {
    expect(knnPredict(pts, { x: 2, y: 1 }, 1, 'euclidean')).toBe(1);
    expect(knnPredict(pts, { x: 8.5, y: 8.5 }, 1, 'euclidean')).toBe(-1);
  });

  it('a larger k flips a local minority into the global majority', () => {
    // near the two +1 points, but 3 of the 5 nearest are −1
    expect(knnPredict(pts, { x: 2, y: 1 }, 1, 'euclidean')).toBe(1);
    expect(knnPredict(pts, { x: 2, y: 1 }, 5, 'euclidean')).toBe(-1);
  });

  it('k is capped at the dataset size and ties break to the nearest neighbor', () => {
    const two: KnnPoint[] = [
      { x: 0, y: 1, label: 1 },
      { x: 0, y: 2, label: -1 },
    ];
    // k = 2 → vote is a tie → nearest (0,1) wins
    expect(knnPredict(two, { x: 0, y: 0.9 }, 2, 'euclidean')).toBe(1);
    // k larger than the dataset works too
    expect(knnPredict(two, { x: 0, y: 1.9 }, 7, 'euclidean')).toBe(-1);
  });

  it('cosine cares about direction, euclidean about position', () => {
    const dir: KnnPoint[] = [
      { x: 9, y: 0, label: 1 }, // far along the x-axis
      { x: 2, y: 2, label: -1 }, // nearby on the diagonal
    ];
    const q = { x: 3, y: 0.3 }; // close to the diagonal point, but pointing along x
    expect(knnPredict(dir, q, 1, 'euclidean')).toBe(-1);
    expect(knnPredict(dir, q, 1, 'cosine')).toBe(1);
  });

  it('distance metrics behave at the landmarks', () => {
    expect(distance({ x: 0, y: 0 }, { x: 3, y: 4 }, 'euclidean')).toBeCloseTo(5, 9);
    // same direction → cosine distance 0; orthogonal → 1
    expect(distance({ x: 2, y: 2 }, { x: 5, y: 5 }, 'cosine')).toBeCloseTo(0, 9);
    expect(distance({ x: 1, y: 0 }, { x: 0, y: 3 }, 'cosine')).toBeCloseTo(1, 9);
  });
});

import { mulberry32, shuffled } from '../rng';

/** Pure, framework-free k-means helpers for 2D points (Lloyd's algorithm). */

export interface P2 {
  x: number;
  y: number;
}

export interface KmeansStepResult {
  /** index of the closest centroid for every point (computed with the GIVEN centroids) */
  assignments: number[];
  /** the mean of each centroid's assigned points (empty clusters keep their old position) */
  newCentroids: P2[];
  /** sum of squared distances from each point to its assigned (given) centroid */
  inertia: number;
}

const d2 = (a: P2, b: P2): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
};

/** Assign each point to its nearest centroid; also report the inertia of that assignment. */
export function assignPoints(points: P2[], centroids: P2[]): { assignments: number[]; inertia: number } {
  const assignments = new Array<number>(points.length);
  let inertia = 0;
  for (let i = 0; i < points.length; i++) {
    let best = 0;
    let bestD = Infinity;
    for (let c = 0; c < centroids.length; c++) {
      const dd = d2(points[i], centroids[c]);
      if (dd < bestD) {
        bestD = dd;
        best = c;
      }
    }
    assignments[i] = best;
    inertia += bestD;
  }
  return { assignments, inertia };
}

/** Average the points of each cluster; a cluster with no points keeps its previous centroid. */
export function updateCentroids(points: P2[], assignments: number[], centroids: P2[]): P2[] {
  const sums = centroids.map(() => ({ x: 0, y: 0, n: 0 }));
  for (let i = 0; i < points.length; i++) {
    const s = sums[assignments[i]];
    s.x += points[i].x;
    s.y += points[i].y;
    s.n += 1;
  }
  return sums.map((s, c) => (s.n === 0 ? { ...centroids[c] } : { x: s.x / s.n, y: s.y / s.n }));
}

/**
 * One full Lloyd iteration: assign every point to the nearest of the given
 * centroids, then average each cluster. Iterating this never increases inertia.
 */
export function kmeansStep(points: P2[], centroids: P2[]): KmeansStepResult {
  const { assignments, inertia } = assignPoints(points, centroids);
  const newCentroids = updateCentroids(points, assignments, centroids);
  return { assignments, newCentroids, inertia };
}

/** Seeded init: pick k distinct data points as the starting centroids. */
export function kmeansInit(points: P2[], k: number, seed: number): P2[] {
  const rand = mulberry32(seed);
  const idx = shuffled(points.map((_, i) => i), rand).slice(0, Math.min(k, points.length));
  return idx.map((i) => ({ x: points[i].x, y: points[i].y }));
}

/** Largest distance any centroid moved between two centroid lists. */
export function maxCentroidShift(a: P2[], b: P2[]): number {
  let m = 0;
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    m = Math.max(m, Math.sqrt(d2(a[i], b[i])));
  }
  return m;
}

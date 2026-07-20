/**
 * k-Nearest Neighbors for 2D toy data — pure, framework-free math.
 * Supports Euclidean distance and cosine distance (1 − cosine similarity,
 * treating each point as a vector from the origin).
 */

export interface KnnPoint {
  x: number;
  y: number;
  label: 1 | -1;
}

export type Metric = 'euclidean' | 'cosine';

/** Distance between two 2D points under the chosen metric. */
export function distance(
  a: { x: number; y: number },
  b: { x: number; y: number },
  metric: Metric,
): number {
  if (metric === 'euclidean') {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }
  // cosine distance: direction only — vectors from the origin
  const na = Math.hypot(a.x, a.y);
  const nb = Math.hypot(b.x, b.y);
  if (na === 0 || nb === 0) return 1; // undefined direction → neutral
  const cos = (a.x * b.x + a.y * b.y) / (na * nb);
  return 1 - cos;
}

/**
 * Majority vote among the k nearest training points (k is capped at the
 * dataset size). Vote ties break toward the single nearest neighbor.
 */
export function knnPredict(
  points: KnnPoint[],
  query: { x: number; y: number },
  k: number,
  metric: Metric,
): 1 | -1 {
  if (points.length === 0) return 1;
  const ranked = points
    .map((p) => ({ label: p.label, d: distance(p, query, metric) }))
    .sort((a, b) => a.d - b.d);
  const kk = Math.max(1, Math.min(k, ranked.length));
  let vote = 0;
  for (let i = 0; i < kk; i++) vote += ranked[i].label;
  if (vote > 0) return 1;
  if (vote < 0) return -1;
  return ranked[0].label;
}

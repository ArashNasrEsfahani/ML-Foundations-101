/** Pure, framework-free DBSCAN for 2D points. */

export interface DbPoint {
  x: number;
  y: number;
}

export const NOISE = -1;

/**
 * Classic DBSCAN. Returns one label per point: 0,1,2,… are cluster ids,
 * -1 marks noise (points whose eps-neighborhood never reaches minPts and
 * that are not density-reachable from any core point).
 *
 * A point's eps-neighborhood includes the point itself, so a core point is
 * one with at least `minPts` points (itself included) within distance `eps`.
 */
export function dbscan(points: DbPoint[], eps: number, minPts: number): number[] {
  const n = points.length;
  const UNVISITED = -2;
  const labels = new Array<number>(n).fill(UNVISITED);
  const eps2 = eps * eps;

  const regionQuery = (i: number): number[] => {
    const out: number[] = [];
    const p = points[i];
    for (let j = 0; j < n; j++) {
      const dx = points[j].x - p.x;
      const dy = points[j].y - p.y;
      if (dx * dx + dy * dy <= eps2) out.push(j);
    }
    return out;
  };

  let cluster = -1;
  for (let i = 0; i < n; i++) {
    if (labels[i] !== UNVISITED) continue;
    const nb = regionQuery(i);
    if (nb.length < minPts) {
      labels[i] = NOISE;
      continue;
    }
    cluster++;
    labels[i] = cluster;
    const seeds = nb.filter((j) => j !== i);
    for (let s = 0; s < seeds.length; s++) {
      const j = seeds[s];
      if (labels[j] === NOISE) labels[j] = cluster; // border point, adopted
      if (labels[j] !== UNVISITED) continue;
      labels[j] = cluster;
      const nb2 = regionQuery(j);
      if (nb2.length >= minPts) {
        for (const q of nb2) seeds.push(q); // j is core: expand through it
      }
    }
  }
  return labels;
}

/** Number of clusters found (ignoring noise). */
export function clusterCount(labels: number[]): number {
  let m = -1;
  for (const l of labels) if (l > m) m = l;
  return m + 1;
}

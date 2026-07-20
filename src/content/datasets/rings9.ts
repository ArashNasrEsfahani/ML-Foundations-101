import { mulberry32, gaussian } from '../../lib/rng';

export interface RingPt {
  x: number;
  y: number;
  /** 0 = inner ring, 1 = outer ring (ground truth) */
  ring: 0 | 1;
}

/**
 * Two concentric rings (40 + 40 seeded points) centered at (5,5) in [0,10]².
 * Inner radius ≈ 1.5, outer ≈ 3.8, with small radial noise. K-means cannot
 * separate them (clusters are not blob-shaped); DBSCAN can.
 */
export function rings9(): RingPt[] {
  const rand = mulberry32(90909);
  const g = gaussian(rand);
  const pts: RingPt[] = [];
  const make = (radius: number, count: number, ring: 0 | 1) => {
    for (let i = 0; i < count; i++) {
      const theta = (i / count) * Math.PI * 2 + rand() * 0.04;
      const r = radius + g() * 0.08;
      pts.push({
        x: 5 + r * Math.cos(theta),
        y: 5 + r * Math.sin(theta),
        ring,
      });
    }
  };
  make(1.5, 40, 0);
  make(3.8, 40, 1);
  return pts;
}

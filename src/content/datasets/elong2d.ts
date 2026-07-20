import { mulberry32, gaussian } from '../../lib/rng';

/** The true major-axis angle of the elongated cloud, in radians (30°). */
export const ELONG_ANGLE = Math.PI / 6;

export interface ElongPt {
  x: number;
  y: number;
}

/**
 * A correlated, elongated seeded gaussian cloud for PCA: 120 points centered
 * at (5,5), stretched along the 30° direction (σ≈1.9 along, σ≈0.45 across).
 * The along-axis coordinate is truncated so everything stays inside [0,10]².
 */
export function elong2d(): ElongPt[] {
  const rand = mulberry32(90912);
  const g = gaussian(rand);
  const co = Math.cos(ELONG_ANGLE);
  const si = Math.sin(ELONG_ANGLE);
  const pts: ElongPt[] = [];
  for (let i = 0; i < 120; i++) {
    const t = Math.max(-4.6, Math.min(4.6, g() * 1.9)); // along the major axis
    const s = Math.max(-1.3, Math.min(1.3, g() * 0.45)); // across it
    pts.push({
      x: 5 + t * co - s * si,
      y: 5 + t * si + s * co,
    });
  }
  return pts;
}

import { mulberry32, gaussian } from '../../lib/rng';

export interface Pt2 {
  x: number;
  y: number;
  /** +1 = spam (filled), -1 = not spam (open) */
  label: 1 | -1;
}

/**
 * Toy "spam detection" data: x = exclamation marks per message, y = money words
 * per message. Linearly separable with a modest margin (seeded, reproducible).
 */
export function spam2d(): Pt2[] {
  const rand = mulberry32(20240101);
  const g = gaussian(rand);
  const pts: Pt2[] = [];
  for (let i = 0; i < 14; i++) {
    pts.push({ x: 6.6 + g() * 1.1, y: 7.0 + g() * 1.1, label: 1 });
  }
  for (let i = 0; i < 14; i++) {
    pts.push({ x: 3.0 + g() * 1.05, y: 2.8 + g() * 1.05, label: -1 });
  }
  // clamp into the plot window
  return pts.map((p) => ({
    ...p,
    x: Math.max(0.4, Math.min(9.6, p.x)),
    y: Math.max(0.4, Math.min(9.6, p.y)),
  }));
}

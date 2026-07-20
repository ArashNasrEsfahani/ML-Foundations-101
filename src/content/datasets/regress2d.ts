import { mulberry32, gaussian } from '../../lib/rng';

export interface RegPoint {
  x: number;
  y: number;
}

/**
 * Toy regression data: ~16 seeded points scattered around the line
 * y = 0.7x + 1.6 with gaussian noise, x spanning 0..10. Reproducible.
 */
export function regress2d(): RegPoint[] {
  const rand = mulberry32(30301);
  const g = gaussian(rand);
  const pts: RegPoint[] = [];
  for (let i = 0; i < 16; i++) {
    const x = 0.5 + (9 * i) / 15 + (rand() - 0.5) * 0.5;
    const y = 0.7 * x + 1.6 + g() * 0.65;
    pts.push({
      x: Math.max(0.2, Math.min(9.8, x)),
      y: Math.max(0.3, Math.min(9.7, y)),
    });
  }
  return pts;
}

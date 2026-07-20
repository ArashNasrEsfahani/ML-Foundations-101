import { mulberry32 } from '../../lib/rng';

export interface RingPoint {
  x: number;
  y: number;
  /** +1 = inner disk (filled), −1 = outer ring (open) */
  label: 1 | -1;
}

/**
 * A disk of one class surrounded by a ring of the other (~70 points, seeded).
 * The true boundary is a circle — hopeless for a straight line, easy for an
 * RBF kernel. Domain 0..10, centered at (5, 5).
 */
export function rings(): RingPoint[] {
  const rand = mulberry32(77701);
  const pts: RingPoint[] = [];
  for (let i = 0; i < 30; i++) {
    // inner disk, radius up to ~1.8 (sqrt for uniform area coverage)
    const r = 0.3 + 1.5 * Math.sqrt(rand());
    const a = 2 * Math.PI * rand();
    pts.push({ x: 5 + r * Math.cos(a), y: 5 + r * Math.sin(a), label: 1 });
  }
  for (let i = 0; i < 40; i++) {
    // outer ring, radius 3.3..4.2
    const r = 3.3 + 0.9 * rand();
    const a = 2 * Math.PI * (i / 40) + rand() * 0.15;
    pts.push({ x: 5 + r * Math.cos(a), y: 5 + r * Math.sin(a), label: -1 });
  }
  return pts.map((p) => ({
    ...p,
    x: Math.max(0.3, Math.min(9.7, p.x)),
    y: Math.max(0.3, Math.min(9.7, p.y)),
  }));
}

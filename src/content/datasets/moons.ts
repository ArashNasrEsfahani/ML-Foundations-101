import { mulberry32, gaussian } from '../../lib/rng';

export interface MoonPoint {
  x: number;
  y: number;
  /** +1 = upper moon (filled), −1 = lower moon (open) */
  label: 1 | -1;
}

/**
 * Two interleaved half-moons (~60 points, seeded): the classic
 * "no straight line will ever separate these" dataset. Domain 0..10.
 */
export function moons(): MoonPoint[] {
  const rand = mulberry32(42421);
  const g = gaussian(rand);
  const pts: MoonPoint[] = [];
  const R = 2.7;
  for (let i = 0; i < 30; i++) {
    // upper arc, opening downward
    const t = (Math.PI * i) / 29;
    pts.push({
      x: 3.5 + R * Math.cos(t) + g() * 0.32,
      y: 4.2 + R * Math.sin(t) + g() * 0.32,
      label: 1,
    });
  }
  for (let i = 0; i < 30; i++) {
    // lower arc, opening upward, shifted right — it dips into the other moon's bay
    const t = Math.PI + (Math.PI * i) / 29;
    pts.push({
      x: 6.5 + R * Math.cos(t) + g() * 0.32,
      y: 5.6 + R * Math.sin(t) + g() * 0.32,
      label: -1,
    });
  }
  return pts.map((p) => ({
    ...p,
    x: Math.max(0.3, Math.min(9.7, p.x)),
    y: Math.max(0.3, Math.min(9.7, p.y)),
  }));
}

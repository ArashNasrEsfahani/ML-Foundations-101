import { mulberry32, gaussian } from '../../lib/rng';

/** A labeled 2D point in [-1, 1]² for the TinyNetLab widget. */
export interface NNPoint {
  x: number;
  y: number;
  /** class: 1 = filled ink dot, 0 = open circle */
  label: 0 | 1;
}

const clampCoord = (v: number): number => Math.max(-0.95, Math.min(0.95, v));

/**
 * XOR arrangement: four gaussian blobs, one per quadrant. Same-sign quadrants
 * are class 0, opposite-sign quadrants class 1 — not separable by any single
 * straight line, the classic "you need a hidden layer" dataset. 80 points.
 */
export function xorQuads(): NNPoint[] {
  const rand = mulberry32(60611);
  const g = gaussian(rand);
  const pts: NNPoint[] = [];
  const blobs: { cx: number; cy: number; label: 0 | 1 }[] = [
    { cx: 0.5, cy: 0.5, label: 0 },
    { cx: -0.5, cy: -0.5, label: 0 },
    { cx: -0.5, cy: 0.5, label: 1 },
    { cx: 0.5, cy: -0.5, label: 1 },
  ];
  for (const b of blobs) {
    for (let i = 0; i < 20; i++) {
      pts.push({
        x: clampCoord(b.cx + g() * 0.16),
        y: clampCoord(b.cy + g() * 0.16),
        label: b.label,
      });
    }
  }
  return pts;
}

/**
 * Inner disk (class 1) inside an outer annulus (class 0). A closed curved
 * boundary — impossible for one linear unit, easy with a few hidden units.
 * 80 points.
 */
export function circleSet(): NNPoint[] {
  const rand = mulberry32(60612);
  const pts: NNPoint[] = [];
  for (let i = 0; i < 40; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.36 * Math.sqrt(rand());
    pts.push({ x: clampCoord(r * Math.cos(a)), y: clampCoord(r * Math.sin(a)), label: 1 });
  }
  for (let i = 0; i < 40; i++) {
    const a = rand() * Math.PI * 2;
    const r = 0.6 + rand() * 0.28;
    pts.push({ x: clampCoord(r * Math.cos(a)), y: clampCoord(r * Math.sin(a)), label: 0 });
  }
  return pts;
}

/**
 * Two interleaved spirals — the hard one. The boundary has to wind through
 * the plane, so small hidden layers visibly underfit while 7–8 units (plus
 * patience) can solve it. Points are interleaved arm-by-arm so per-example
 * gradient descent doesn't see 45 same-class points in a row. 90 points.
 */
export function spiralSet(): NNPoint[] {
  const rand = mulberry32(60613);
  const g = gaussian(rand);
  const arms: [NNPoint[], NNPoint[]] = [[], []];
  for (const arm of [0, 1] as const) {
    for (let i = 0; i < 45; i++) {
      const t = i / 44;
      const r = 0.12 + 0.72 * t;
      const a = t * 1.8 * Math.PI + arm * Math.PI;
      arms[arm].push({
        x: clampCoord(r * Math.cos(a) + g() * 0.025),
        y: clampCoord(r * Math.sin(a) + g() * 0.025),
        label: arm,
      });
    }
  }
  const pts: NNPoint[] = [];
  for (let i = 0; i < 45; i++) pts.push(arms[0][i], arms[1][i]);
  return pts;
}

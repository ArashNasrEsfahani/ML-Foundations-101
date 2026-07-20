import { mulberry32, gaussian } from '../../lib/rng';

export interface BlobPt {
  x: number;
  y: number;
  /** which of the three generating blobs the point came from (ground truth) */
  blob: 0 | 1 | 2;
}

const CENTERS: [number, number][] = [
  [2.5, 3.0],
  [7.3, 7.4],
  [7.8, 2.3],
];

/**
 * Three well-separated seeded gaussian blobs (25 points each) in [0,10]².
 * Ground-truth blob ids let widgets/tests verify a clustering against the
 * generating structure.
 */
export function blobs3(): BlobPt[] {
  const rand = mulberry32(90903);
  const g = gaussian(rand);
  const pts: BlobPt[] = [];
  for (let b = 0 as 0 | 1 | 2; b < 3; b++) {
    const [cx, cy] = CENTERS[b];
    for (let i = 0; i < 25; i++) {
      pts.push({
        x: Math.max(0.4, Math.min(9.6, cx + g() * 0.7)),
        y: Math.max(0.4, Math.min(9.6, cy + g() * 0.7)),
        blob: b,
      });
    }
  }
  return pts;
}

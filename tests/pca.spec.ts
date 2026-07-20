import { describe, it, expect } from 'vitest';
import { pca2, varianceCapturedAlong, covariance, axisAngleDiff } from '../src/lib/ml/pca';
import { elong2d, ELONG_ANGLE } from '../src/content/datasets/elong2d';

const DEG = Math.PI / 180;

describe('pca on the elongated seeded cloud', () => {
  const pts = elong2d();

  it('hand-computed fixture: axis-aligned cross has a diagonal-free covariance', () => {
    const cross = [
      { x: -2, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: -1 },
      { x: 0, y: 1 },
    ];
    const cov = covariance(cross);
    expect(cov.a).toBeCloseTo(2, 10); // (4+4)/4
    expect(cov.b).toBeCloseTo(0, 10);
    expect(cov.c).toBeCloseTo(0.5, 10); // (1+1)/4
    const r = pca2(cross);
    expect(axisAngleDiff(r.angle1, 0)).toBeLessThan(1e-9); // PC1 = x-axis
    expect(r.var1).toBeCloseTo(2, 10);
    expect(r.var2).toBeCloseTo(0.5, 10);
  });

  it('PC1 recovers the true 30° generating angle within ±3°', () => {
    const r = pca2(pts);
    expect(axisAngleDiff(r.angle1, ELONG_ANGLE)).toBeLessThan(3 * DEG);
  });

  it('captured variance along PC1 exceeds captured variance along PC2', () => {
    const r = pca2(pts);
    const v1 = varianceCapturedAlong(pts, r.angle1);
    const v2 = varianceCapturedAlong(pts, r.angle2);
    expect(v1).toBeGreaterThan(v2);
    // and they agree with the eigenvalues
    expect(v1).toBeCloseTo(r.var1, 8);
    expect(v2).toBeCloseTo(r.var2, 8);
  });

  it('variance along any axis is bounded by the PC1 variance', () => {
    const r = pca2(pts);
    for (let deg = 0; deg < 180; deg += 15) {
      const v = varianceCapturedAlong(pts, deg * DEG);
      expect(v).toBeLessThanOrEqual(r.var1 + 1e-9);
      expect(v).toBeGreaterThanOrEqual(r.var2 - 1e-9);
    }
  });
});

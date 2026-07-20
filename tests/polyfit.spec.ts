import { describe, it, expect } from 'vitest';
import { fitPoly, predictPoly, mse, type XY } from '../src/lib/ml/polyfit';
import { mulberry32, gaussian } from '../src/lib/rng';

describe('fitPoly / predictPoly', () => {
  it('degree-1 fit of an exact line recovers it', () => {
    // y = 1 + 2x sampled at 11 points
    const line: XY[] = Array.from({ length: 11 }, (_, i) => {
      const x = i / 10;
      return { x, y: 1 + 2 * x };
    });
    const coeffs = fitPoly(line, 1);
    // predictions reproduce the line everywhere (including off-grid x)
    for (const x of [0, 0.05, 0.33, 0.5, 0.77, 1]) {
      expect(predictPoly(coeffs, x)).toBeCloseTo(1 + 2 * x, 6);
    }
    // coefficients are in the scaled basis t = 2x - 1: y = 2 + t
    expect(coeffs[0]).toBeCloseTo(2, 6);
    expect(coeffs[1]).toBeCloseTo(1, 6);
    expect(mse(coeffs, line)).toBeLessThan(1e-10);
  });

  it('degree-0 fit is the mean of y', () => {
    const pts: XY[] = [
      { x: 0.1, y: 1 },
      { x: 0.5, y: 2 },
      { x: 0.9, y: 6 },
    ];
    const coeffs = fitPoly(pts, 0);
    expect(coeffs).toHaveLength(1);
    expect(predictPoly(coeffs, 0.42)).toBeCloseTo(3, 6);
  });

  it('degree-9 train error < degree-1 train error on noisy curved data', () => {
    const rand = mulberry32(123);
    const g = gaussian(rand);
    const pts: XY[] = Array.from({ length: 20 }, (_, i) => {
      const x = i / 19;
      return { x, y: Math.sin(2 * Math.PI * x) + 0.1 * g() };
    });
    const c1 = fitPoly(pts, 1);
    const c9 = fitPoly(pts, 9);
    const err1 = mse(c1, pts);
    const err9 = mse(c9, pts);
    expect(Number.isFinite(err1)).toBe(true);
    expect(Number.isFinite(err9)).toBe(true);
    expect(err9).toBeLessThan(err1);
  });

  it('stays finite and sane for every degree 0–12 on ~20 points in [0,1]', () => {
    const rand = mulberry32(2024);
    const g = gaussian(rand);
    const pts: XY[] = Array.from({ length: 20 }, (_, i) => {
      const x = (i + 0.5) / 20;
      return { x, y: 0.5 + 0.35 * Math.sin(2 * Math.PI * x) + 0.05 * g() };
    });
    let prevTrain = Infinity;
    for (let d = 0; d <= 12; d++) {
      const c = fitPoly(pts, d);
      const err = mse(c, pts);
      expect(Number.isFinite(err)).toBe(true);
      expect(err).toBeGreaterThanOrEqual(0);
      // training error can never get dramatically worse as capacity grows
      expect(err).toBeLessThanOrEqual(prevTrain * 1.01 + 1e-9);
      prevTrain = err;
    }
  });
});

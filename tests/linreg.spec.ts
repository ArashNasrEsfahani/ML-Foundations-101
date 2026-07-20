import { describe, it, expect } from 'vitest';
import { fitLinreg, mse, descentStep } from '../src/lib/ml/linreg';

describe('linear regression (closed form + MSE)', () => {
  it('recovers an exact line y = 2x + 1', () => {
    const pts = [
      { x: 0, y: 1 },
      { x: 1, y: 3 },
      { x: 2, y: 5 },
      { x: 3, y: 7 },
    ];
    const { w, b } = fitLinreg(pts);
    expect(w).toBeCloseTo(2, 6);
    expect(b).toBeCloseTo(1, 6);
    expect(mse(pts, w, b)).toBeCloseTo(0, 9);
  });

  it('matches a hand-computed MSE fixture', () => {
    // line y = x: residuals 0, −1, 0 → MSE = (0 + 1 + 0)/3
    const pts = [
      { x: 0, y: 0 },
      { x: 1, y: 2 },
      { x: 2, y: 2 },
    ];
    expect(mse(pts, 1, 0)).toBeCloseTo(1 / 3, 9);
    // and a second fixture: flat line y = 3 against y = {1, 5} → (4 + 4)/2 = 4
    const pts2 = [
      { x: 0, y: 1 },
      { x: 4, y: 5 },
    ];
    expect(mse(pts2, 0, 3)).toBeCloseTo(4, 9);
  });

  it('closed form beats or matches any other line', () => {
    const pts = [
      { x: 1, y: 2.2 },
      { x: 3, y: 3.9 },
      { x: 5, y: 6.1 },
      { x: 7, y: 7.8 },
      { x: 9, y: 10.2 },
    ];
    const { w, b } = fitLinreg(pts);
    const best = mse(pts, w, b);
    expect(best).toBeLessThanOrEqual(mse(pts, w + 0.1, b));
    expect(best).toBeLessThanOrEqual(mse(pts, w, b + 0.5));
    expect(best).toBeLessThanOrEqual(mse(pts, 1, 1));
  });

  it('descentStep strictly reduces MSE toward the optimum', () => {
    const pts = [
      { x: 0, y: 1 },
      { x: 2, y: 4 },
      { x: 4, y: 6 },
      { x: 6, y: 9 },
    ];
    let w = 0;
    let b = 0;
    let prev = mse(pts, w, b);
    for (let i = 0; i < 40; i++) {
      ({ w, b } = descentStep(pts, w, b, 0.08));
      const cur = mse(pts, w, b);
      expect(cur).toBeLessThanOrEqual(prev + 1e-12);
      prev = cur;
    }
    const opt = fitLinreg(pts);
    expect(prev).toBeCloseTo(mse(pts, opt.w, opt.b), 4);
  });
});

import { describe, it, expect } from 'vitest';
import { sigmoid, logLikelihood, ascentStep, type Point1D } from '../src/lib/ml/logreg';

describe('logistic regression (sigmoid + max likelihood)', () => {
  it('sigmoid hits its landmarks', () => {
    expect(sigmoid(0)).toBeCloseTo(0.5, 9);
    expect(sigmoid(100)).toBeCloseTo(1, 6);
    expect(sigmoid(-100)).toBeCloseTo(0, 6);
    // symmetry: σ(−z) = 1 − σ(z)
    expect(sigmoid(-1.3)).toBeCloseTo(1 - sigmoid(1.3), 9);
  });

  it('log-likelihood matches a hand fixture', () => {
    // one point at x = 0 with w = 5, b = 0 → p = σ(0) = 0.5 → LL = ln(0.5)
    const pts: Point1D[] = [{ x: 0, label: 1 }];
    expect(logLikelihood(pts, 5, 0)).toBeCloseTo(Math.log(0.5), 9);
    // perfect confidence on the right side → LL near 0
    const easy: Point1D[] = [
      { x: -10, label: 0 },
      { x: 10, label: 1 },
    ];
    expect(logLikelihood(easy, 3, 0)).toBeGreaterThan(-1e-6);
  });

  it('a gradient-ascent step increases the log-likelihood', () => {
    const pts: Point1D[] = [
      { x: 1, label: 0 },
      { x: 2, label: 0 },
      { x: 3, label: 0 },
      { x: 6, label: 1 },
      { x: 7, label: 1 },
      { x: 9, label: 1 },
    ];
    let w = 0;
    let b = 0;
    let prev = logLikelihood(pts, w, b);
    for (let i = 0; i < 50; i++) {
      ({ w, b } = ascentStep(pts, w, b, 0.01));
      const cur = logLikelihood(pts, w, b);
      expect(cur).toBeGreaterThanOrEqual(prev - 1e-12);
      prev = cur;
    }
    // after 50 steps the model should beat the w = 0 coin-flip baseline
    expect(prev).toBeGreaterThan(logLikelihood(pts, 0, 0));
  });
});

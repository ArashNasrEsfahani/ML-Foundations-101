import { describe, it, expect } from 'vitest';
import { posterior, bayesCounts } from '../src/lib/ml/bayes';

describe('posterior (Bayes rule for the disease-test story)', () => {
  it('matches the hand-computed textbook case: 1% prior, 90% sens, 9% fpr', () => {
    // 0.9*0.01 / (0.9*0.01 + 0.09*0.99) = 0.009 / 0.0981
    expect(posterior(0.01, 0.9, 0.09)).toBeCloseTo(0.0917, 3);
  });

  it('high prior + sharp test pushes the posterior above 90%', () => {
    // 0.99*0.1 / (0.99*0.1 + 0.01*0.9) = 0.099 / 0.108
    expect(posterior(0.1, 0.99, 0.01)).toBeCloseTo(0.9167, 3);
  });

  it('even prior gives likelihood-ratio result: 0.8*0.5 / (0.8*0.5 + 0.2*0.5)', () => {
    expect(posterior(0.5, 0.8, 0.2)).toBeCloseTo(0.8, 10);
  });

  it('rare disease at 0.1% prior stays tiny even with a 99% sensitive test', () => {
    // 0.99*0.001 / (0.99*0.001 + 0.05*0.999) = 0.00099 / 0.05094
    expect(posterior(0.001, 0.99, 0.05)).toBeCloseTo(0.0194, 3);
  });

  it('degenerate priors behave: 0 gives 0, 1 gives 1', () => {
    expect(posterior(0, 0.9, 0.05)).toBe(0);
    expect(posterior(1, 0.9, 0.05)).toBe(1);
  });

  it('is monotonically increasing in the prior', () => {
    const a = posterior(0.01, 0.9, 0.09);
    const b = posterior(0.05, 0.9, 0.09);
    const c = posterior(0.1, 0.9, 0.09);
    expect(b).toBeGreaterThan(a);
    expect(c).toBeGreaterThan(b);
  });

  it('is monotonically decreasing in the false-positive rate', () => {
    const a = posterior(0.02, 0.9, 0.01);
    const b = posterior(0.02, 0.9, 0.1);
    expect(a).toBeGreaterThan(b);
  });
});

describe('bayesCounts (whole-people dot grid)', () => {
  it('matches hand-computed counts for 1000 people, 1% prior, 90% sens, 9% fpr', () => {
    const c = bayesCounts(1000, 0.01, 0.9, 0.09);
    expect(c.sick).toBe(10);
    expect(c.healthy).toBe(990);
    expect(c.sickPos).toBe(9); // round(10 * 0.9)
    expect(c.healthyPos).toBe(89); // round(990 * 0.09) = round(89.1)
    expect(c.totalPos).toBe(98);
  });

  it('always partitions the population exactly', () => {
    const cases: [number, number, number][] = [
      [0.001, 0.5, 0.2],
      [0.1, 0.99, 0.01],
      [0.055, 0.73, 0.135],
    ];
    for (const [prior, sens, fpr] of cases) {
      const c = bayesCounts(1000, prior, sens, fpr);
      expect(c.sick + c.healthy).toBe(1000);
      expect(c.sickPos + c.sickNeg).toBe(c.sick);
      expect(c.healthyPos + c.healthyNeg).toBe(c.healthy);
      expect(c.totalPos).toBe(c.sickPos + c.healthyPos);
      expect(c.sickPos).toBeGreaterThanOrEqual(0);
      expect(c.healthyPos).toBeGreaterThanOrEqual(0);
    }
  });

  it('rounds tiny priors to at least the nearest whole person', () => {
    // 0.1% of 1000 = 1 sick dot
    const c = bayesCounts(1000, 0.001, 0.9, 0.05);
    expect(c.sick).toBe(1);
    expect(c.sickPos).toBe(1); // round(1 * 0.9)
  });

  it('dot-count posterior approximates the exact posterior', () => {
    const c = bayesCounts(1000, 0.05, 0.9, 0.08);
    const dotPosterior = c.sickPos / c.totalPos;
    expect(dotPosterior).toBeCloseTo(posterior(0.05, 0.9, 0.08), 1);
  });
});

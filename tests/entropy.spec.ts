import { describe, it, expect } from 'vitest';
import { entropy, splitEntropy, infoGain } from '../src/lib/ml/entropy';

describe('entropy (bits)', () => {
  it('is 1 bit for a 50/50 split', () => {
    expect(entropy([5, 5])).toBeCloseTo(1, 9);
    expect(entropy([50, 50])).toBeCloseTo(1, 9);
  });

  it('is 0 for a pure set', () => {
    expect(entropy([10, 0])).toBeCloseTo(0, 9);
    expect(entropy([0, 7])).toBeCloseTo(0, 9);
  });

  it('matches the classic 2-vs-1 fixture (≈ 0.9183)', () => {
    expect(entropy([2, 1])).toBeCloseTo(0.9182958340544896, 9);
    expect(entropy([4, 2])).toBeCloseTo(0.9182958340544896, 9); // scale invariant
  });

  it('empty and zero counts are handled', () => {
    expect(entropy([])).toBe(0);
    expect(entropy([0, 0])).toBe(0);
  });

  it('weighted split entropy averages group entropies by size', () => {
    // pure group of 4 + coin-flip group of 4 → 0.5 · 0 + 0.5 · 1 = 0.5
    expect(splitEntropy([[4, 0], [2, 2]])).toBeCloseTo(0.5, 9);
    // splitting a 50/50 parent into two pure halves gains a full bit
    expect(infoGain([4, 4], [[4, 0], [0, 4]])).toBeCloseTo(1, 9);
    // a useless split gains nothing
    expect(infoGain([4, 4], [[2, 2], [2, 2]])).toBeCloseTo(0, 9);
  });
});

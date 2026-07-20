import { describe, it, expect } from 'vitest';
import { xpFor, levelForXp, levelProgress } from '../src/state/levels';

describe('level curve', () => {
  it('is monotonically increasing', () => {
    for (let n = 1; n < 30; n++) {
      expect(xpFor(n + 1)).toBeGreaterThan(xpFor(n));
    }
  });

  it('level 1 starts at 0', () => {
    expect(xpFor(1)).toBe(0);
    expect(levelForXp(0)).toBe(1);
  });

  it('levelForXp inverts xpFor', () => {
    for (let n = 1; n < 20; n++) {
      expect(levelForXp(xpFor(n))).toBe(n);
      expect(levelForXp(xpFor(n + 1) - 1)).toBe(n);
    }
  });

  it('progress stays within [0,1]', () => {
    for (const xp of [0, 35, 70, 500, 4800]) {
      const p = levelProgress(xp);
      expect(p).toBeGreaterThanOrEqual(0);
      expect(p).toBeLessThanOrEqual(1);
    }
  });
});

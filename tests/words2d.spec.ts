import { describe, it, expect } from 'vitest';
import { WORDS2D, analogyPoint, nearestWord, neighborsOf, wordVec } from '../src/content/datasets/words2d';

describe('words2d semantic space', () => {
  it('has ≈55 unique words inside [0,10]²', () => {
    expect(WORDS2D.length).toBeGreaterThanOrEqual(50);
    const names = new Set(WORDS2D.map((w) => w.word));
    expect(names.size).toBe(WORDS2D.length);
    for (const w of WORDS2D) {
      expect(w.x).toBeGreaterThanOrEqual(0);
      expect(w.x).toBeLessThanOrEqual(10);
      expect(w.y).toBeGreaterThanOrEqual(0);
      expect(w.y).toBeLessThanOrEqual(10);
    }
  });

  it('keeps words comfortably apart (no near-duplicates to game analogies)', () => {
    let min = Infinity;
    for (let i = 0; i < WORDS2D.length; i++) {
      for (let j = i + 1; j < WORDS2D.length; j++) {
        min = Math.min(
          min,
          Math.hypot(WORDS2D[i].x - WORDS2D[j].x, WORDS2D[i].y - WORDS2D[j].y),
        );
      }
    }
    expect(min).toBeGreaterThanOrEqual(0.35);
  });

  it('king − man + woman lands nearest queen', () => {
    const p = analogyPoint('king', 'man', 'woman');
    const hit = nearestWord(p, ['king', 'man', 'woman']);
    expect(hit.word).toBe('queen');
    expect(hit.dist).toBeLessThan(0.15);
    // even without excluding the inputs, queen is the closest word
    expect(nearestWord(p).word).toBe('queen');
  });

  it('france − paris + rome lands nearest italy', () => {
    const p = analogyPoint('france', 'paris', 'rome');
    const hit = nearestWord(p, ['france', 'paris', 'rome']);
    expect(hit.word).toBe('italy');
    expect(hit.dist).toBeLessThan(0.15);
  });

  it('paris − france + italy lands nearest rome (the widget preset)', () => {
    const p = analogyPoint('paris', 'france', 'italy');
    const hit = nearestWord(p, ['paris', 'france', 'italy']);
    expect(hit.word).toBe('rome');
    expect(hit.dist).toBeLessThan(0.15);
  });

  it('more family analogies hold: prince/princess and tokyo/paris', () => {
    expect(nearestWord(analogyPoint('prince', 'man', 'woman'), ['prince', 'man', 'woman']).word).toBe(
      'princess',
    );
    expect(nearestWord(analogyPoint('tokyo', 'japan', 'france'), ['tokyo', 'japan', 'france']).word).toBe(
      'paris',
    );
  });

  it('neighborsOf finds same-cluster words', () => {
    const nb = neighborsOf('dog', 5).map((w) => w.word);
    const animals = new Set(['cat', 'horse', 'cow', 'wolf', 'lion', 'tiger', 'bird', 'fish', 'mouse']);
    expect(nb.every((w) => animals.has(w))).toBe(true);
    expect(() => wordVec('nonexistent')).toThrow();
  });
});

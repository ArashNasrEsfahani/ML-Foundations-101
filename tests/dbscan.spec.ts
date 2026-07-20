import { describe, it, expect } from 'vitest';
import { dbscan, clusterCount, NOISE } from '../src/lib/ml/dbscan';
import { rings9 } from '../src/content/datasets/rings9';

describe('dbscan', () => {
  it('hand-computed fixture: a tight pair plus a far point', () => {
    const pts = [
      { x: 0, y: 0 },
      { x: 0.5, y: 0 },
      { x: 1.0, y: 0 },
      { x: 9, y: 9 },
    ];
    const labels = dbscan(pts, 0.6, 2);
    expect(labels[0]).toBe(0);
    expect(labels[1]).toBe(0);
    expect(labels[2]).toBe(0);
    expect(labels[3]).toBe(NOISE);
    expect(clusterCount(labels)).toBe(1);
  });

  it('separates the two seeded rings into exactly 2 clusters at a suitable eps', () => {
    const pts = rings9();
    const labels = dbscan(pts, 0.9, 3);
    expect(clusterCount(labels)).toBe(2);
    expect(labels.filter((l) => l === NOISE).length).toBe(0);

    // every ring maps to a single, consistent cluster id
    const innerLabels = new Set(pts.filter((p) => p.ring === 0).map((_, i) => labels[i]));
    const inner = pts.map((p, i) => ({ ring: p.ring, l: labels[i] }));
    const innerIds = new Set(inner.filter((p) => p.ring === 0).map((p) => p.l));
    const outerIds = new Set(inner.filter((p) => p.ring === 1).map((p) => p.l));
    expect(innerIds.size).toBe(1);
    expect(outerIds.size).toBe(1);
    expect([...innerIds][0]).not.toBe([...outerIds][0]);
    expect(innerLabels.size).toBeGreaterThan(0); // sanity
  });

  it('labels scattered far points as noise without disturbing the ring clusters', () => {
    const pts: { x: number; y: number }[] = [
      ...rings9(),
      { x: 0.2, y: 0.2 },
      { x: 9.8, y: 0.3 },
      { x: 0.4, y: 9.7 },
    ];
    const labels = dbscan(pts, 0.9, 3);
    expect(clusterCount(labels)).toBe(2);
    const n = labels.length;
    expect(labels[n - 3]).toBe(NOISE);
    expect(labels[n - 2]).toBe(NOISE);
    expect(labels[n - 1]).toBe(NOISE);
  });

  it('a too-small eps shatters the sparse outer ring', () => {
    const pts = rings9();
    const labels = dbscan(pts, 0.3, 3);
    // outer-ring spacing (~0.6) exceeds eps, so points fall apart into noise/fragments
    const noise = labels.filter((l) => l === NOISE).length;
    expect(noise).toBeGreaterThan(10);
  });
});

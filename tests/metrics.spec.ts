import { describe, it, expect } from 'vitest';
import {
  confusionCounts,
  precision,
  recall,
  accuracy,
  rocPoints,
  auc,
  type ScoredExample,
} from '../src/lib/ml/metrics';

/**
 * Hand-computed fixture: 4 positives, 4 negatives.
 *
 * ranked by score:  0.9 P | 0.8 P | 0.7 N | 0.6 P | 0.4 N | 0.3 P | 0.2 N | 0.1 N
 *
 * At threshold 0.5 (positive iff score >= 0.5):
 *   predicted positive: 0.9 P, 0.8 P, 0.7 N, 0.6 P  → TP = 3, FP = 1
 *   predicted negative: 0.4 N, 0.3 P, 0.2 N, 0.1 N  → FN = 1, TN = 3
 *   precision = 3/4, recall = 3/4, accuracy = 6/8.
 *
 * AUC by pair counting: (pos, neg) pairs with pos ranked above neg = 13 of 16
 *   (0.9 and 0.8 beat all 4 negatives; 0.6 beats 3; 0.3 beats 2) → 13/16 = 0.8125.
 */
const fixture: ScoredExample[] = [
  { score: 0.9, label: 1 },
  { score: 0.8, label: 1 },
  { score: 0.7, label: 0 },
  { score: 0.6, label: 1 },
  { score: 0.4, label: 0 },
  { score: 0.3, label: 1 },
  { score: 0.2, label: 0 },
  { score: 0.1, label: 0 },
];

describe('confusionCounts', () => {
  it('matches the hand-computed confusion at t = 0.5', () => {
    expect(confusionCounts(fixture, 0.5)).toEqual({ tp: 3, fp: 1, fn: 1, tn: 3 });
  });

  it('threshold at/below every score predicts everything positive', () => {
    expect(confusionCounts(fixture, 0)).toEqual({ tp: 4, fp: 4, fn: 0, tn: 0 });
  });

  it('threshold above every score predicts everything negative', () => {
    expect(confusionCounts(fixture, 0.95)).toEqual({ tp: 0, fp: 0, fn: 4, tn: 4 });
  });

  it('uses score >= threshold (boundary example counts as positive)', () => {
    // t = 0.6: 0.6 P is predicted positive
    expect(confusionCounts(fixture, 0.6)).toEqual({ tp: 3, fp: 1, fn: 1, tn: 3 });
  });
});

describe('precision / recall / accuracy', () => {
  const c = confusionCounts(fixture, 0.5);

  it('precision = TP / (TP + FP)', () => {
    expect(precision(c)).toBeCloseTo(0.75, 10);
  });

  it('recall = TP / (TP + FN)', () => {
    expect(recall(c)).toBeCloseTo(0.75, 10);
  });

  it('accuracy = (TP + TN) / all', () => {
    expect(accuracy(c)).toBeCloseTo(0.75, 10);
  });

  it('degenerate denominators return 0 instead of NaN', () => {
    expect(precision({ tp: 0, fp: 0, fn: 2, tn: 2 })).toBe(0);
    expect(recall({ tp: 0, fp: 2, fn: 0, tn: 2 })).toBe(0);
    expect(accuracy({ tp: 0, fp: 0, fn: 0, tn: 0 })).toBe(0);
  });

  it('book example: TP=23, FP=12, FN=1, TN=556', () => {
    const book = { tp: 23, fp: 12, fn: 1, tn: 556 };
    expect(precision(book)).toBeCloseTo(23 / 35, 10);
    expect(recall(book)).toBeCloseTo(23 / 24, 10);
    expect(accuracy(book)).toBeCloseTo(579 / 592, 10);
  });
});

describe('rocPoints', () => {
  const pts = rocPoints(fixture);

  it('starts at (0,0) and ends at (1,1)', () => {
    expect(pts[0]).toEqual({ fpr: 0, tpr: 0 });
    expect(pts[pts.length - 1]).toEqual({ fpr: 1, tpr: 1 });
  });

  it('has one point per distinct score plus the origin', () => {
    expect(pts).toHaveLength(9); // 8 distinct scores + (0,0)
  });

  it('is monotonically non-decreasing in both coordinates', () => {
    for (let i = 1; i < pts.length; i++) {
      expect(pts[i].fpr).toBeGreaterThanOrEqual(pts[i - 1].fpr);
      expect(pts[i].tpr).toBeGreaterThanOrEqual(pts[i - 1].tpr);
    }
  });

  it('passes through the hand-computed step (0.25, 0.75) after 0.6 enters', () => {
    expect(pts.some((p) => p.fpr === 0.25 && p.tpr === 0.75)).toBe(true);
  });
});

describe('auc', () => {
  it('trapezoid area equals the hand-computed 13/16', () => {
    expect(auc(rocPoints(fixture))).toBeCloseTo(0.8125, 10);
  });

  it('perfectly separated scores give AUC = 1', () => {
    const perfect: ScoredExample[] = [
      { score: 0.9, label: 1 },
      { score: 0.8, label: 1 },
      { score: 0.3, label: 0 },
      { score: 0.2, label: 0 },
    ];
    expect(auc(rocPoints(perfect))).toBeCloseTo(1, 10);
  });

  it('scores inverted against labels give AUC = 0', () => {
    const inverted: ScoredExample[] = [
      { score: 0.9, label: 0 },
      { score: 0.1, label: 1 },
    ];
    expect(auc(rocPoints(inverted))).toBeCloseTo(0, 10);
  });
});

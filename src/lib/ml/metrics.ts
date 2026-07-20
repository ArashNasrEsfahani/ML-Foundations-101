/**
 * Binary-classification metrics over scored examples — pure, framework-free.
 *
 * An example is `{ score, label }`: the model's confidence (typically in [0,1])
 * plus the true class (1 = positive, 0 = negative). The prediction rule used
 * everywhere in this module: predict positive iff `score >= threshold`.
 */

export interface ScoredExample {
  score: number;
  /** 1 = positive class, 0 = negative class */
  label: 0 | 1;
}

export interface ConfusionCounts {
  tp: number;
  fp: number;
  fn: number;
  tn: number;
}

/** Tally the 2×2 confusion matrix at a given decision threshold. */
export function confusionCounts(scores: ScoredExample[], threshold: number): ConfusionCounts {
  const c: ConfusionCounts = { tp: 0, fp: 0, fn: 0, tn: 0 };
  for (const s of scores) {
    const predictedPositive = s.score >= threshold;
    if (predictedPositive) {
      if (s.label === 1) c.tp++;
      else c.fp++;
    } else {
      if (s.label === 1) c.fn++;
      else c.tn++;
    }
  }
  return c;
}

/** TP / (TP + FP). Returns 0 when no positive predictions were made. */
export function precision(c: ConfusionCounts): number {
  const denom = c.tp + c.fp;
  return denom === 0 ? 0 : c.tp / denom;
}

/** TP / (TP + FN). Returns 0 when the dataset holds no positive examples. */
export function recall(c: ConfusionCounts): number {
  const denom = c.tp + c.fn;
  return denom === 0 ? 0 : c.tp / denom;
}

/** (TP + TN) / all. Returns 0 on an empty tally. */
export function accuracy(c: ConfusionCounts): number {
  const total = c.tp + c.fp + c.fn + c.tn;
  return total === 0 ? 0 : (c.tp + c.tn) / total;
}

export interface RocPoint {
  fpr: number;
  tpr: number;
}

/**
 * ROC curve traced by sweeping the threshold from above the highest score
 * down through every distinct score value (ties handled together).
 * Starts at (0,0) — nothing predicted positive — and ends at (1,1).
 * Points come out sorted by ascending FPR, ready for `auc`.
 */
export function rocPoints(scores: ScoredExample[]): RocPoint[] {
  const pos = scores.filter((s) => s.label === 1).length;
  const neg = scores.length - pos;
  const sorted = [...scores].sort((a, b) => b.score - a.score);
  const pts: RocPoint[] = [{ fpr: 0, tpr: 0 }];
  let tp = 0;
  let fp = 0;
  let i = 0;
  while (i < sorted.length) {
    const t = sorted[i].score;
    while (i < sorted.length && sorted[i].score === t) {
      if (sorted[i].label === 1) tp++;
      else fp++;
      i++;
    }
    pts.push({ fpr: neg === 0 ? 0 : fp / neg, tpr: pos === 0 ? 0 : tp / pos });
  }
  return pts;
}

/** Area under an ROC curve by the trapezoid rule (points sorted by FPR). */
export function auc(pts: RocPoint[]): number {
  let area = 0;
  for (let i = 1; i < pts.length; i++) {
    area += ((pts[i].fpr - pts[i - 1].fpr) * (pts[i].tpr + pts[i - 1].tpr)) / 2;
  }
  return area;
}

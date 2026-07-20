/**
 * Entropy helpers for decision-tree learning (ID3) — pure, framework-free.
 * All entropies are in bits (log base 2).
 */

/** Shannon entropy of a class-count vector, e.g. entropy([5, 5]) = 1 bit. */
export function entropy(counts: number[]): number {
  let total = 0;
  for (const c of counts) total += c;
  if (total === 0) return 0;
  let h = 0;
  for (const c of counts) {
    if (c <= 0) continue;
    const p = c / total;
    h -= p * Math.log2(p);
  }
  return h;
}

/**
 * Weighted entropy of a split: each group is a class-count vector; the
 * groups' entropies are averaged, weighted by group size. This is the
 * quantity ID3 minimizes when choosing a split.
 */
export function splitEntropy(groups: number[][]): number {
  let total = 0;
  const sizes = groups.map((g) => {
    let n = 0;
    for (const c of g) n += c;
    total += n;
    return n;
  });
  if (total === 0) return 0;
  let h = 0;
  for (let i = 0; i < groups.length; i++) {
    if (sizes[i] === 0) continue;
    h += (sizes[i] / total) * entropy(groups[i]);
  }
  return h;
}

/** Information gain of a split = entropy(parent) − weighted entropy(children). */
export function infoGain(parent: number[], groups: number[][]): number {
  return entropy(parent) - splitEntropy(groups);
}

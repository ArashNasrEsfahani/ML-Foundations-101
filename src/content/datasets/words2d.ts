/**
 * A tiny hand-placed 2D "word embedding" space (≈58 words in [0,10]²).
 * Words are arranged in semantic neighborhoods, and the gender / royalty /
 * country-capital families form exact parallelograms so that vector
 * arithmetic works: king − man + woman = queen, france − paris + rome = italy,
 * paris − france + italy = rome, tokyo − japan + france = paris, and so on.
 */

export interface WordPt {
  word: string;
  x: number;
  y: number;
}

// people & royalty: royal offset (+0.5, +1.9), child offset (−0.4, −0.7)
const PEOPLE: WordPt[] = [
  { word: 'man', x: 1.6, y: 3.4 },
  { word: 'woman', x: 2.5, y: 4.0 },
  { word: 'boy', x: 1.2, y: 2.7 },
  { word: 'girl', x: 2.1, y: 3.3 },
  { word: 'king', x: 2.1, y: 5.3 },
  { word: 'queen', x: 3.0, y: 5.9 },
  { word: 'prince', x: 1.7, y: 4.6 },
  { word: 'princess', x: 2.6, y: 5.2 },
];

// countries, with capitals shifted by the same offset (+0.6, −2.2)
const GEO: WordPt[] = [
  { word: 'france', x: 4.8, y: 7.6 },
  { word: 'italy', x: 5.6, y: 7.1 },
  { word: 'japan', x: 6.4, y: 7.8 },
  { word: 'spain', x: 4.4, y: 6.7 },
  { word: 'germany', x: 5.9, y: 6.4 },
  { word: 'paris', x: 5.4, y: 5.4 },
  { word: 'rome', x: 6.2, y: 4.9 },
  { word: 'tokyo', x: 7.0, y: 5.6 },
  { word: 'madrid', x: 5.0, y: 4.5 },
  { word: 'berlin', x: 6.5, y: 4.2 },
];

const ANIMALS: WordPt[] = [
  { word: 'dog', x: 7.8, y: 8.6 },
  { word: 'cat', x: 8.3, y: 8.9 },
  { word: 'horse', x: 8.9, y: 8.3 },
  { word: 'cow', x: 9.3, y: 8.7 },
  { word: 'wolf', x: 7.5, y: 9.2 },
  { word: 'lion', x: 8.7, y: 9.4 },
  { word: 'tiger', x: 9.2, y: 9.1 },
  { word: 'bird', x: 8.0, y: 7.9 },
  { word: 'fish', x: 8.8, y: 7.6 },
  { word: 'mouse', x: 9.4, y: 7.9 },
];

const FOODS: WordPt[] = [
  { word: 'bread', x: 7.3, y: 2.9 },
  { word: 'cheese', x: 7.9, y: 3.2 },
  { word: 'apple', x: 8.5, y: 3.4 },
  { word: 'pizza', x: 7.6, y: 2.2 },
  { word: 'pasta', x: 8.2, y: 2.5 },
  { word: 'sushi', x: 9.0, y: 2.8 },
  { word: 'rice', x: 9.4, y: 2.3 },
  { word: 'soup', x: 7.2, y: 1.5 },
  { word: 'cake', x: 8.0, y: 1.2 },
  { word: 'tea', x: 8.8, y: 1.6 },
];

const VERBS: WordPt[] = [
  { word: 'run', x: 1.0, y: 9.4 },
  { word: 'walk', x: 1.7, y: 9.1 },
  { word: 'jump', x: 2.4, y: 9.5 },
  { word: 'swim', x: 0.8, y: 8.6 },
  { word: 'eat', x: 1.5, y: 8.3 },
  { word: 'drink', x: 2.2, y: 8.7 },
  { word: 'sleep', x: 2.9, y: 8.9 },
  { word: 'read', x: 2.7, y: 8.2 },
];

const WEATHER: WordPt[] = [
  { word: 'sun', x: 0.9, y: 1.8 },
  { word: 'rain', x: 1.6, y: 1.4 },
  { word: 'snow', x: 2.4, y: 1.7 },
  { word: 'cloud', x: 1.1, y: 0.9 },
  { word: 'wind', x: 2.0, y: 0.7 },
];

const MISC: WordPt[] = [
  { word: 'happy', x: 3.7, y: 2.2 },
  { word: 'sad', x: 4.4, y: 1.8 },
  { word: 'angry', x: 5.1, y: 2.3 },
  { word: 'book', x: 3.4, y: 7.0 },
  { word: 'pen', x: 3.9, y: 7.5 },
  { word: 'paper', x: 3.5, y: 6.3 },
  { word: 'music', x: 6.9, y: 3.4 },
];

export const WORDS2D: WordPt[] = [
  ...PEOPLE,
  ...GEO,
  ...ANIMALS,
  ...FOODS,
  ...VERBS,
  ...WEATHER,
  ...MISC,
];

const byName = new Map(WORDS2D.map((w) => [w.word, w]));

export function wordVec(word: string): { x: number; y: number } {
  const w = byName.get(word);
  if (!w) throw new Error(`unknown word: ${word}`);
  return { x: w.x, y: w.y };
}

/** Landing point of the analogy a − b + c. */
export function analogyPoint(a: string, b: string, c: string): { x: number; y: number } {
  const va = wordVec(a);
  const vb = wordVec(b);
  const vc = wordVec(c);
  return { x: va.x - vb.x + vc.x, y: va.y - vb.y + vc.y };
}

/** Nearest word to a point, optionally excluding some words (e.g. the analogy inputs). */
export function nearestWord(
  p: { x: number; y: number },
  exclude: string[] = [],
): { word: string; dist: number } {
  let best = '';
  let bestD = Infinity;
  for (const w of WORDS2D) {
    if (exclude.includes(w.word)) continue;
    const d = Math.hypot(w.x - p.x, w.y - p.y);
    if (d < bestD) {
      bestD = d;
      best = w.word;
    }
  }
  return { word: best, dist: bestD };
}

/** The k nearest neighbors of a word (excluding itself). */
export function neighborsOf(word: string, k: number): WordPt[] {
  const v = wordVec(word);
  return WORDS2D.filter((w) => w.word !== word)
    .map((w) => ({ w, d: Math.hypot(w.x - v.x, w.y - v.y) }))
    .sort((p, q) => p.d - q.d)
    .slice(0, k)
    .map((p) => p.w);
}

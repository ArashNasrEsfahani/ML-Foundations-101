/** Level curve: cumulative XP required to REACH level n (level 1 = 0 XP). */
export function xpFor(level: number): number {
  if (level <= 1) return 0;
  return Math.round(70 * Math.pow(level - 1, 1.55));
}

export function levelForXp(xp: number): number {
  let n = 1;
  while (xpFor(n + 1) <= xp && n < 99) n++;
  return n;
}

/** progress within the current level, 0..1 */
export function levelProgress(xp: number): number {
  const lvl = levelForXp(xp);
  const lo = xpFor(lvl);
  const hi = xpFor(lvl + 1);
  return clamp01((xp - lo) / (hi - lo || 1));
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

const TITLES = [
  'Novice',
  'Apprentice',
  'Tinkerer',
  'Analyst',
  'Modeler',
  'Optimizer',
  'Regularizer',
  'Ensembler',
  'Architect',
  'Hundred-Pager',
];

export function levelTitle(level: number): string {
  const idx = Math.min(TITLES.length - 1, Math.floor(((level - 1) / 15) * TITLES.length));
  return TITLES[idx];
}

export const XP = {
  section: 10,
  questionFirstTry: 5,
  questionRetry: 2,
  quizPerfectBonus: 10,
  challenge: 15,
  bossPass: 100,
  bossPerfectBonus: 50,
  finalExam: 250,
} as const;

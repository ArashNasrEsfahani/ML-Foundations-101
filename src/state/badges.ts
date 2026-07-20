import type { Chapter } from '../content/schema';
import type { SaveV1 } from './migrations';

export interface BadgeDef {
  id: string;
  name: string;
  hint: string; // shown when unearned
  secret?: boolean;
  earned: (save: SaveV1, chapters: Chapter[]) => boolean;
}

const chapterBadge = (chId: string, name: string): BadgeDef => ({
  id: chId,
  name,
  hint: `Pass the chapter ${chId.replace('ch', '').replace(/^0/, '')} boss exam.`,
  earned: (s) => !!s.bosses[chId]?.passed,
});

export const BADGES: BadgeDef[] = [
  chapterBadge('ch01', 'First Steps'),
  chapterBadge('ch02', 'Notation Ninja'),
  chapterBadge('ch03', 'Algorithm Apprentice'),
  chapterBadge('ch04', 'Descent Driver'),
  chapterBadge('ch05', 'Practice Makes Perfect'),
  chapterBadge('ch06', 'Deep Diver'),
  chapterBadge('ch07', 'Problem Solver'),
  chapterBadge('ch08', 'Seasoned Practitioner'),
  chapterBadge('ch09', 'Cluster Captain'),
  chapterBadge('ch10', 'Rank & File'),
  {
    id: 'ch11',
    name: 'The Hundred-Pager',
    hint: 'Pass the final cumulative exam.',
    earned: (s) => !!s.finalExam?.passed,
  },
  {
    id: 'flawless',
    name: 'Flawless',
    hint: 'Pass any boss exam without a single wrong answer.',
    earned: (s) => Object.values(s.bosses).some((b) => b.passed && b.best === 12),
  },
  {
    id: 'comeback',
    name: 'Comeback',
    hint: 'Pass a boss exam after failing it first.',
    earned: (s) => Object.values(s.bosses).some((b) => b.passed && b.attempts > 1),
  },
  {
    id: 'tinkerer',
    name: 'Tinkerer',
    hint: 'Complete 5 widget challenges.',
    earned: (s) => Object.keys(s.challenges).length >= 5,
  },
  {
    id: 'lab-rat',
    name: 'Lab Rat',
    hint: 'Complete 20 widget challenges.',
    earned: (s) => Object.keys(s.challenges).length >= 20,
  },
  {
    id: 'sharp-pencil',
    name: 'Sharp Pencil',
    hint: 'Answer 10 questions in a row correctly on the first try.',
    secret: true,
    earned: () => false, // awarded imperatively via streak counter in the store
  },
  {
    id: 'bright-idea',
    name: 'Bright Idea',
    hint: 'Open 10 hints. Curiosity is never penalized.',
    earned: (s) => s.hintsOpened.length >= 10,
  },
  {
    id: 'halfway',
    name: 'Halfway There',
    hint: 'Pass the chapter 5 boss exam.',
    earned: (s) => !!s.bosses['ch05']?.passed,
  },
  {
    id: 'completionist',
    name: 'Completionist',
    hint: 'Finish every section, every challenge, and every boss.',
    earned: (s, chapters) =>
      chapters.every(
        (c) =>
          c.sections.every((sec) => !!s.sections[sec.id]?.done) &&
          (c.bossPool.length === 0 || !!s.bosses[c.id]?.passed),
      ) && !!s.finalExam?.passed,
  },
  {
    id: 'certified',
    name: 'Certified',
    hint: 'Generate your certificate.',
    earned: (s) => !!s.finalExam?.passed && !!s.name,
  },
];

/** returns ids of badges newly earned in `after` compared to `after.badges` record */
export function newlyEarned(after: SaveV1, chapters: Chapter[]): string[] {
  const out: string[] = [];
  for (const b of BADGES) {
    if (after.badges[b.id]) continue;
    if (b.earned(after, chapters)) out.push(b.id);
  }
  return out;
}

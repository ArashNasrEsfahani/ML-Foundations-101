import { describe, it, expect } from 'vitest';
import type { Chapter } from '../src/content/schema';
import { freshSave } from '../src/state/storage';
import {
  isChapterUnlocked,
  isSectionUnlocked,
  isBossUnlocked,
} from '../src/state/unlock';

const mk = (id: string, sections: string[], softPrereq?: string): Chapter => ({
  id,
  number: parseInt(id.slice(2), 10),
  title: id,
  subtitle: '',
  pdfPages: [1, 1],
  badgeId: id,
  softPrereq,
  sections: sections.map((s) => ({ id: s, title: s, minutes: 1, blocks: [] })),
  bossPool: [
    { kind: 'tf', id: `${id}-q1`, prompt: 'x', answer: true, explain: '' },
  ],
});

const chapters: Chapter[] = [
  mk('ch01', ['s1', 's2']),
  mk('ch02', ['s3']),
  mk('ch03', ['s4'], 'ch01'),
  mk('ch04', ['s5']),
];

describe('unlock rules', () => {
  it('only chapter 1 unlocked at start', () => {
    const s = freshSave();
    expect(isChapterUnlocked(s, chapters, 'ch01')).toBe(true);
    expect(isChapterUnlocked(s, chapters, 'ch02')).toBe(false);
    expect(isChapterUnlocked(s, chapters, 'ch03')).toBe(false);
  });

  it('sections unlock sequentially', () => {
    const s = freshSave();
    expect(isSectionUnlocked(s, chapters, 'ch01', 's1')).toBe(true);
    expect(isSectionUnlocked(s, chapters, 'ch01', 's2')).toBe(false);
    s.sections['s1'] = { done: true, at: 0, perfect: false };
    expect(isSectionUnlocked(s, chapters, 'ch01', 's2')).toBe(true);
  });

  it('boss requires all sections done', () => {
    const s = freshSave();
    s.sections['s1'] = { done: true, at: 0, perfect: false };
    expect(isBossUnlocked(s, chapters, 'ch01')).toBe(false);
    s.sections['s2'] = { done: true, at: 0, perfect: false };
    expect(isBossUnlocked(s, chapters, 'ch01')).toBe(true);
  });

  it('next chapter unlocks when previous boss passed', () => {
    const s = freshSave();
    s.bosses['ch01'] = { attempts: 1, best: 12, passed: true };
    expect(isChapterUnlocked(s, chapters, 'ch02')).toBe(true);
  });

  it('soft prerequisite: ch03 opens from ch01 boss even if ch02 not passed', () => {
    const s = freshSave();
    s.bosses['ch01'] = { attempts: 1, best: 12, passed: true };
    expect(isChapterUnlocked(s, chapters, 'ch03')).toBe(true);
    expect(isChapterUnlocked(s, chapters, 'ch04')).toBe(false);
  });

  it("ch04 boss additionally requires ch02 passed", () => {
    const s = freshSave();
    s.bosses['ch01'] = { attempts: 1, best: 12, passed: true };
    s.bosses['ch03'] = { attempts: 1, best: 12, passed: true };
    s.sections['s5'] = { done: true, at: 0, perfect: false };
    expect(isBossUnlocked(s, chapters, 'ch04')).toBe(false);
    s.bosses['ch02'] = { attempts: 1, best: 12, passed: true };
    expect(isBossUnlocked(s, chapters, 'ch04')).toBe(true);
  });
});

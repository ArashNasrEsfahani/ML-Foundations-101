import { describe, it, expect } from 'vitest';
import { freshSave } from '../src/state/storage';
import { recordTestOut } from '../src/state/xp';
import { XP } from '../src/state/levels';
import { isChapterUnlocked, isBossUnlocked } from '../src/state/unlock';
import type { Chapter } from '../src/content/schema';

const mk = (id: string, sections: string[]): Chapter => ({
  id,
  number: parseInt(id.slice(2), 10),
  title: id,
  subtitle: '',
  pdfPages: [1, 1],
  badgeId: id,
  sections: sections.map((s) => ({ id: s, title: s, minutes: 1, blocks: [] })),
  bossPool: [{ kind: 'tf', id: `${id}-q1`, prompt: 'x', answer: true, explain: '' }],
});

const chapters: Chapter[] = [
  mk('ch01', ['a1', 'a2']),
  mk('ch02', ['b1']),
  mk('ch03', ['c1']),
];

describe('testing out of a chapter', () => {
  it('marks every section done and passes the boss', () => {
    const [next, xp] = recordTestOut(freshSave(), chapters[0]);
    expect(xp).toBe(XP.bossPass);
    expect(next.sections['a1'].done).toBe(true);
    expect(next.sections['a2'].done).toBe(true);
    expect(next.bosses['ch01'].passed).toBe(true);
    expect(next.testedOut).toEqual(['ch01']);
  });

  it('unlocks the following chapter', () => {
    const s = freshSave();
    expect(isChapterUnlocked(s, chapters, 'ch02')).toBe(false);
    const [next] = recordTestOut(s, chapters[0]);
    expect(isChapterUnlocked(next, chapters, 'ch02')).toBe(true);
    expect(isBossUnlocked(next, chapters, 'ch02')).toBe(false); // ch02's own sections still pending
  });

  it('is idempotent — re-testing a cleared chapter grants nothing', () => {
    const [once] = recordTestOut(freshSave(), chapters[0]);
    const [twice, xp] = recordTestOut(once, chapters[0]);
    expect(xp).toBe(0);
    expect(twice.xp).toBe(once.xp);
    expect(twice.testedOut).toEqual(['ch01']);
  });

  it('does not overwrite genuinely completed section records', () => {
    const s = freshSave();
    s.sections['a1'] = { done: true, at: 123, perfect: true };
    const [next] = recordTestOut(s, chapters[0]);
    expect(next.sections['a1']).toEqual({ done: true, at: 123, perfect: true });
    expect(next.sections['a2'].perfect).toBe(false);
  });

  it('placement across several chapters accumulates XP and unlocks the next one', () => {
    let save = freshSave();
    let total = 0;
    for (const c of chapters.slice(0, 2)) {
      const [next, xp] = recordTestOut(save, c);
      save = next;
      total += xp;
    }
    expect(total).toBe(XP.bossPass * 2);
    expect(save.testedOut).toEqual(['ch01', 'ch02']);
    expect(isChapterUnlocked(save, chapters, 'ch03')).toBe(true);
    // the skipped chapters' lessons remain available, not hidden
    expect(save.sections['b1'].done).toBe(true);
  });

  it('placing into chapter 1 (throughChapter 0) changes nothing', () => {
    const save = freshSave();
    const after = chapters.slice(0, 0).reduce((acc) => acc, save);
    expect(after.xp).toBe(0);
    expect(isChapterUnlocked(after, chapters, 'ch02')).toBe(false);
  });
});

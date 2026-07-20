import type { Chapter } from '../content/schema';
import type { SaveV1 } from './migrations';

/**
 * Free mode opens the whole course at once. It is a view over the same save,
 * not a separate one: XP, badges and completed sections are shared, so a
 * learner can switch back to the journey and pick up exactly where they were.
 */
export function isFreeMode(save: SaveV1): boolean {
  return save.mode === 'free';
}

export function isChapterUnlocked(save: SaveV1, chapters: Chapter[], chapterId: string): boolean {
  const idx = chapters.findIndex((c) => c.id === chapterId);
  if (idx < 0) return false;
  if (isFreeMode(save)) return true;
  if (idx === 0) return true;
  const chapter = chapters[idx];
  const prev = chapters[idx - 1];
  if (save.bosses[prev.id]?.passed) return true;
  // soft prerequisite: e.g. ch03 also opens once ch01's boss is passed
  if (chapter.softPrereq && save.bosses[chapter.softPrereq]?.passed) return true;
  return false;
}

export function isSectionUnlocked(
  save: SaveV1,
  chapters: Chapter[],
  chapterId: string,
  sectionId: string,
): boolean {
  const chapter = chapters.find((c) => c.id === chapterId);
  if (!chapter) return false;
  const idx = chapter.sections.findIndex((s) => s.id === sectionId);
  if (idx < 0) return false;
  if (isFreeMode(save)) return true;
  if (!isChapterUnlocked(save, chapters, chapterId)) return false;
  if (idx === 0) return true;
  return !!save.sections[chapter.sections[idx - 1].id]?.done;
}

export function isBossUnlocked(save: SaveV1, chapters: Chapter[], chapterId: string): boolean {
  const chapter = chapters.find((c) => c.id === chapterId);
  if (!chapter) return false;
  if (isFreeMode(save)) return true;
  if (!isChapterUnlocked(save, chapters, chapterId)) return false;
  // a chapter with a soft prerequisite must still have its hard prerequisites
  // (all its own sections) done; additionally ch04's boss requires ch02 passed
  const allSections = chapter.sections.every((s) => !!save.sections[s.id]?.done);
  if (!allSections) return false;
  if (chapter.id === 'ch04' && !save.bosses['ch02']?.passed) return false;
  return true;
}

export function isFinalUnlocked(save: SaveV1, chapters: Chapter[]): boolean {
  if (isFreeMode(save)) return true;
  return chapters.every((c) => save.bosses[c.id]?.passed || c.bossPool.length === 0);
}

export function chapterProgress(save: SaveV1, chapter: Chapter): number {
  const done = chapter.sections.filter((s) => !!save.sections[s.id]?.done).length;
  const bossDone = save.bosses[chapter.id]?.passed ? 1 : 0;
  return (done + bossDone) / (chapter.sections.length + 1);
}

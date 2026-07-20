import type { SaveV1 } from './migrations';
import { XP } from './levels';

/** All award helpers are pure and idempotent: re-doing content never re-grants XP. */

export function awardSection(save: SaveV1, sectionId: string, perfect: boolean): [SaveV1, number] {
  if (save.sections[sectionId]) return [save, 0];
  return [
    {
      ...save,
      xp: save.xp + XP.section,
      sections: { ...save.sections, [sectionId]: { done: true, at: Date.now(), perfect } },
    },
    XP.section,
  ];
}

export function awardQuestion(save: SaveV1, questionId: string, firstTry: boolean): [SaveV1, number] {
  if (save.questions[questionId]) return [save, 0];
  const xp = firstTry ? XP.questionFirstTry : XP.questionRetry;
  return [
    {
      ...save,
      xp: save.xp + xp,
      questions: { ...save.questions, [questionId]: { firstTry } },
    },
    xp,
  ];
}

export function awardQuizPerfect(save: SaveV1, quizId: string): [SaveV1, number] {
  const key = `perfect:${quizId}`;
  if (save.questions[key]) return [save, 0];
  return [
    {
      ...save,
      xp: save.xp + XP.quizPerfectBonus,
      questions: { ...save.questions, [key]: { firstTry: true } },
    },
    XP.quizPerfectBonus,
  ];
}

export function awardChallenge(save: SaveV1, challengeId: string, xp: number): [SaveV1, number] {
  if (save.challenges[challengeId]) return [save, 0];
  return [
    {
      ...save,
      xp: save.xp + xp,
      challenges: { ...save.challenges, [challengeId]: { at: Date.now() } },
    },
    xp,
  ];
}

export function recordBoss(
  save: SaveV1,
  chapterId: string,
  score: number,
  passed: boolean,
  total = 12,
): [SaveV1, number] {
  const prev = save.bosses[chapterId] ?? { attempts: 0, best: 0, passed: false };
  const firstPass = passed && !prev.passed;
  const perfect = firstPass && score === total;
  const xp = (firstPass ? XP.bossPass : 0) + (perfect ? XP.bossPerfectBonus : 0);
  return [
    {
      ...save,
      xp: save.xp + xp,
      bosses: {
        ...save.bosses,
        [chapterId]: {
          attempts: prev.attempts + 1,
          best: Math.max(prev.best, score),
          passed: prev.passed || passed,
        },
      },
    },
    xp,
  ];
}

/**
 * Clear a chapter by examination instead of by reading it. Sections are marked
 * done without their per-section XP — the player skipped that work — but the
 * boss award is granted, because they passed an equivalent exam.
 */
export function recordTestOut(
  save: SaveV1,
  chapter: { id: string; sections: { id: string }[] },
): [SaveV1, number] {
  if (save.bosses[chapter.id]?.passed) return [save, 0];

  const sections = { ...save.sections };
  for (const s of chapter.sections) {
    if (!sections[s.id]) sections[s.id] = { done: true, at: Date.now(), perfect: false };
  }
  const prev = save.bosses[chapter.id] ?? { attempts: 0, best: 0, passed: false };
  const testedOut = save.testedOut ?? [];

  return [
    {
      ...save,
      xp: save.xp + XP.bossPass,
      sections,
      bosses: {
        ...save.bosses,
        [chapter.id]: { attempts: prev.attempts + 1, best: Math.max(prev.best, 1), passed: true },
      },
      testedOut: testedOut.includes(chapter.id) ? testedOut : [...testedOut, chapter.id],
    },
    XP.bossPass,
  ];
}

export function recordFinal(save: SaveV1, score: number, passed: boolean): [SaveV1, number] {
  const prev = save.finalExam ?? { passed: false, best: 0 };
  const firstPass = passed && !prev.passed;
  const xp = firstPass ? XP.finalExam : 0;
  return [
    {
      ...save,
      xp: save.xp + xp,
      finalExam: { passed: prev.passed || passed, best: Math.max(prev.best, score) },
    },
    xp,
  ];
}

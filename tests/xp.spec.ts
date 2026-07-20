import { describe, it, expect } from 'vitest';
import { freshSave } from '../src/state/storage';
import {
  awardSection,
  awardQuestion,
  awardQuizPerfect,
  awardChallenge,
  recordBoss,
  recordFinal,
} from '../src/state/xp';
import { XP } from '../src/state/levels';

// storage.ts touches localStorage only inside functions we don't call here
describe('xp awards', () => {
  it('section award is idempotent', () => {
    const s0 = freshSave();
    const [s1, x1] = awardSection(s0, 'sec-a', true);
    expect(x1).toBe(XP.section);
    const [s2, x2] = awardSection(s1, 'sec-a', false);
    expect(x2).toBe(0);
    expect(s2.xp).toBe(XP.section);
  });

  it('question first-try vs retry', () => {
    const s0 = freshSave();
    const [s1, x1] = awardQuestion(s0, 'q1', true);
    expect(x1).toBe(XP.questionFirstTry);
    const [s2, x2] = awardQuestion(s1, 'q2', false);
    expect(x2).toBe(XP.questionRetry);
    const [, x3] = awardQuestion(s2, 'q1', true);
    expect(x3).toBe(0);
  });

  it('quiz perfect bonus only once', () => {
    const s0 = freshSave();
    const [s1, x1] = awardQuizPerfect(s0, 'quiz-1');
    expect(x1).toBe(XP.quizPerfectBonus);
    const [, x2] = awardQuizPerfect(s1, 'quiz-1');
    expect(x2).toBe(0);
  });

  it('challenge XP only granted once', () => {
    const s0 = freshSave();
    const [s1, x1] = awardChallenge(s0, 'c1', 15);
    expect(x1).toBe(15);
    const [, x2] = awardChallenge(s1, 'c1', 15);
    expect(x2).toBe(0);
  });

  it('boss: pass XP once, perfect bonus, attempts and best tracked', () => {
    const s0 = freshSave();
    const [s1, x1] = recordBoss(s0, 'ch01', 7, false);
    expect(x1).toBe(0);
    expect(s1.bosses['ch01']).toEqual({ attempts: 1, best: 7, passed: false });

    const [s2, x2] = recordBoss(s1, 'ch01', 12, true);
    expect(x2).toBe(XP.bossPass + XP.bossPerfectBonus);
    expect(s2.bosses['ch01']).toEqual({ attempts: 2, best: 12, passed: true });

    const [s3, x3] = recordBoss(s2, 'ch01', 10, true);
    expect(x3).toBe(0);
    expect(s3.bosses['ch01'].best).toBe(12);
  });

  it('final exam XP once', () => {
    const s0 = freshSave();
    const [s1, x1] = recordFinal(s0, 18, true);
    expect(x1).toBe(XP.finalExam);
    const [, x2] = recordFinal(s1, 20, true);
    expect(x2).toBe(0);
  });
});

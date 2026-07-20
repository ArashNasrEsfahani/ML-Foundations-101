import { describe, it, expect } from 'vitest';
import { chapters } from '../src/content';
import type { Question } from '../src/content/schema';
import { mulberry32, shuffled, hashString } from '../src/lib/rng';

/**
 * Guards against the most common multiple-choice tell: making the correct
 * answer the long, careful, hedged one and the distractors short and blunt.
 * A learner who never read the chapter can score well by always picking the
 * wordiest option, which makes the quiz measure nothing.
 *
 * Scope to specific chapters while editing:
 *   ML101_ONLY=ch03,ch04 npx vitest run tests/answer-balance.spec.ts
 * Print the worst offenders:
 *   ML101_REPORT=1 npx vitest run tests/answer-balance.spec.ts
 */

/** approximate what the learner actually reads: strip markdown-lite and TeX */
export function visibleLength(s: string): number {
  return s
    .replace(/\$[^$]*\$/g, 'xxxx') // an equation reads as one short token
    .replace(/\*\*|\*|`/g, '')
    .trim().length;
}

interface Analysed {
  chapter: string;
  id: string;
  correct: number;
  distractors: number[];
  ratio: number;
  isLongest: boolean;
}

// the project types only vite/client, so declare the bit of node we use here
declare const process: { env: Record<string, string | undefined> };

const only = (process.env.ML101_ONLY ?? '')
  .split(',')
  .map((s: string) => s.trim())
  .filter(Boolean);

const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / (xs.length || 1);

function analyse(): Analysed[] {
  const out: Analysed[] = [];
  const consider = (chapterId: string, q: Question) => {
    if (q.kind !== 'mcq') return;
    const lens = q.choices.map(visibleLength);
    const correct = lens[q.answer];
    const distractors = lens.filter((_, i) => i !== q.answer);
    out.push({
      chapter: chapterId,
      id: q.id,
      correct,
      distractors,
      ratio: correct / Math.max(1, mean(distractors)),
      isLongest: distractors.every((d) => correct > d),
    });
  };
  for (const c of chapters) {
    if (only.length && !only.includes(c.id)) continue;
    for (const s of c.sections)
      for (const b of s.blocks) if (b.type === 'quiz') for (const q of b.questions) consider(c.id, q);
    for (const q of c.bossPool) consider(c.id, q);
  }
  return out;
}

const questions = analyse();

if (process.env.ML101_REPORT) {
  const worst = [...questions].sort((a, b) => b.ratio - a.ratio).slice(0, 40);
  const byChapter = new Map<string, Analysed[]>();
  for (const q of questions) byChapter.set(q.chapter, [...(byChapter.get(q.chapter) ?? []), q]);
  console.log('\n--- per chapter ---');
  for (const [ch, qs] of [...byChapter.entries()].sort()) {
    const longest = qs.filter((q) => q.isLongest).length;
    console.log(
      `${ch}  n=${String(qs.length).padStart(3)}  longest=${String(longest).padStart(3)} (${((longest / qs.length) * 100).toFixed(0)}%)  avgRatio=${mean(qs.map((q) => q.ratio)).toFixed(2)}`,
    );
  }
  console.log('\n--- worst 40 by ratio ---');
  for (const q of worst) {
    console.log(`${q.ratio.toFixed(2)}x  ${q.id}  correct=${q.correct} distractors=[${q.distractors.join(',')}]`);
  }
}

describe('multiple-choice answers are not guessable by length', () => {
  it('has questions to check', () => {
    expect(questions.length).toBeGreaterThan(0);
  });

  it('the correct answer is not usually the longest option', () => {
    const longest = questions.filter((q) => q.isLongest);
    const rate = longest.length / questions.length;
    // with four options, chance alone puts this near 0.25
    expect(rate, `correct answer is the longest in ${(rate * 100).toFixed(1)}% of questions`)
      .toBeLessThan(0.4);
  });

  it('the correct answer is not systematically wordier', () => {
    const avg = mean(questions.map((q) => q.ratio));
    expect(avg, `correct answers average ${avg.toFixed(2)}x the length of distractors`)
      .toBeLessThan(1.18);
  });

  it('no single question gives itself away with a runaway correct answer', () => {
    const offenders = questions
      .filter((q) => q.correct > 1.9 * Math.max(...q.distractors))
      .map((q) => `${q.id} (${q.ratio.toFixed(1)}x)`);
    expect(offenders, `these answers dwarf every distractor:\n  ${offenders.join('\n  ')}`).toEqual([]);
  });
});

/**
 * Correct answers are all authored at index 0 for readability; what stops that
 * from being a giveaway is the per-question shuffle in QMcq. This reproduces
 * that shuffle with the real rng so a change to the seeding can't quietly make
 * the answer's on-screen position predictable.
 */
describe('the rendered position of the correct answer is unpredictable', () => {
  it('spreads correct answers across all four slots', () => {
    const slots = new Map<number, number>();
    let n = 0;
    for (const c of chapters) {
      const consider = (q: Question) => {
        if (q.kind !== 'mcq') return;
        const order = shuffled(
          q.choices.map((_, i) => i),
          mulberry32(hashString(q.id)),
        );
        const slot = order.indexOf(q.answer);
        slots.set(slot, (slots.get(slot) ?? 0) + 1);
        n++;
      };
      for (const s of c.sections)
        for (const b of s.blocks) if (b.type === 'quiz') for (const q of b.questions) consider(q);
      for (const q of c.bossPool) consider(q);
    }

    expect(n).toBeGreaterThan(100);
    const shares = [...slots.entries()].map(([slot, count]) => ({ slot, share: count / n }));
    // uniform would be 25% per slot; allow a generous band for a finite sample
    for (const { slot, share } of shares) {
      expect(share, `slot ${slot} holds ${(share * 100).toFixed(1)}% of correct answers`)
        .toBeGreaterThan(0.15);
      expect(share, `slot ${slot} holds ${(share * 100).toFixed(1)}% of correct answers`)
        .toBeLessThan(0.35);
    }
  });
});

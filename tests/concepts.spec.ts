import { describe, it, expect } from 'vitest';
import katex from 'katex';
import { concepts, getConcept, duplicateConceptIds } from '../src/content/concepts';
import { chapters } from '../src/content';
import { resolveHref } from '../src/content/links';
import { tokenizeInline, type InlineToken } from '../src/lib/inlineMd';

/** every inline string the course renders, tagged with where it came from */
function allProse(): { where: string; md: string }[] {
  const out: { where: string; md: string }[] = [];
  const push = (where: string, md?: string) => {
    if (md) out.push({ where, md });
  };

  for (const c of chapters) {
    for (const s of c.sections) {
      s.blocks.forEach((b, i) => {
        const where = `${s.id}#${i}`;
        if (b.type === 'p' || b.type === 'hint') push(where, b.md);
        if (b.type === 'list') b.items.forEach((it, j) => push(`${where}.${j}`, it));
        if (b.type === 'figure') push(where, b.caption);
        if (b.type === 'formula') b.terms.forEach((t, j) => push(`${where}.term${j}`, t.explain));
        if (b.type === 'quiz') {
          for (const q of b.questions) {
            push(`${q.id}.prompt`, q.prompt);
            push(`${q.id}.explain`, q.explain);
            if (q.kind === 'mcq' || q.kind === 'multi') q.choices.forEach((ch, j) => push(`${q.id}.${j}`, ch));
          }
        }
      });
    }
    for (const q of c.bossPool) {
      push(`${q.id}.prompt`, q.prompt);
      push(`${q.id}.explain`, q.explain);
      if (q.kind === 'mcq' || q.kind === 'multi') q.choices.forEach((ch, j) => push(`${q.id}.${j}`, ch));
    }
  }

  for (const c of concepts) {
    push(`concept:${c.id}.simple`, c.simple);
    push(`concept:${c.id}.technical`, c.technical);
    push(`concept:${c.id}.math`, c.math);
  }

  return out;
}

function flatten(tokens: InlineToken[]): InlineToken[] {
  const out: InlineToken[] = [];
  const stack = [...tokens];
  while (stack.length) {
    const t = stack.pop()!;
    out.push(t);
    if (t.kind === 'strong' || t.kind === 'em' || t.kind === 'link') stack.push(...t.children);
  }
  return out;
}

const prose = allProse();
const tokens = prose.map((p) => ({ ...p, tokens: flatten(tokenizeInline(p.md)) }));

const sectionIds = new Set(chapters.flatMap((c) => c.sections.map((s) => s.id)));

describe('concept registry', () => {
  it('has no duplicate ids', () => {
    expect(duplicateConceptIds()).toEqual([]);
  });

  it('uses kebab-case ids', () => {
    expect(concepts.filter((c) => !/^[a-z0-9]+(-[a-z0-9]+)*$/.test(c.id)).map((c) => c.id)).toEqual([]);
  });

  it('explains every concept at all three depths', () => {
    // short enough to fail loudly on a placeholder, long enough not to nag
    const thin = concepts.flatMap((c) =>
      (['simple', 'technical', 'math'] as const)
        .filter((k) => c[k].trim().length < 60)
        .map((k) => `${c.id}.${k}`),
    );
    expect(thin).toEqual([]);
  });

  it('keeps the simple level free of TeX and code', () => {
    const jargony = concepts.filter((c) => /\$|`/.test(c.simple)).map((c) => c.id);
    expect(jargony).toEqual([]);
  });

  it('points `teachesAt` at real sections', () => {
    const broken = concepts
      .filter((c) => c.teachesAt && !sectionIds.has(c.teachesAt))
      .map((c) => `${c.id} → ${c.teachesAt}`);
    expect(broken).toEqual([]);
  });

  it('points `see` at real concepts', () => {
    const broken = concepts.flatMap((c) =>
      (c.see ?? []).filter((s) => !getConcept(s)).map((s) => `${c.id} → ${s}`),
    );
    expect(broken).toEqual([]);
  });

  it('never links to a guessed YouTube video id', () => {
    // a `watch?v=` we made up is a dead link the reader discovers, not us; the
    // channel search always lands somewhere real, so that is the default
    const guessed = concepts.filter((c) => c.video && !c.video.startsWith('https://')).map((c) => c.id);
    expect(guessed).toEqual([]);
  });

  it('compiles the maths inside every explanation', () => {
    const bad: string[] = [];
    for (const c of concepts) {
      for (const k of ['simple', 'technical', 'math'] as const) {
        for (const t of flatten(tokenizeInline(c[k]))) {
          if (t.kind !== 'math') continue;
          try {
            katex.renderToString(t.tex, { throwOnError: true });
          } catch (e) {
            bad.push(`${c.id}.${k}: ${t.tex} — ${(e as Error).message}`);
          }
        }
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('cross references', () => {
  it('resolves every [[concept]] used anywhere in the course', () => {
    const broken = tokens.flatMap((p) =>
      p.tokens.filter((t) => t.kind === 'concept' && !getConcept(t.id)).map((t) => `${p.where}: ${(t as { id: string }).id}`),
    );
    expect(broken).toEqual([]);
  });

  it('resolves every [text](target) link', () => {
    const broken = tokens.flatMap((p) =>
      p.tokens
        .filter((t) => t.kind === 'link' && !resolveHref((t as { href: string }).href).ok)
        .map((t) => `${p.where}: ${(t as { href: string }).href}`),
    );
    expect(broken).toEqual([]);
  });

  it('never points a concept card at the section it is already on', () => {
    // a "read the section" button that reloads the page you are reading is noise
    const selfish: string[] = [];
    for (const c of chapters) {
      for (const s of c.sections) {
        for (const b of s.blocks) {
          const md = b.type === 'p' || b.type === 'hint' ? b.md : null;
          if (!md) continue;
          for (const t of flatten(tokenizeInline(md))) {
            if (t.kind === 'link' && t.href === `sec:${s.id}`) selfish.push(`${s.id}: ${t.href}`);
          }
        }
      }
    }
    expect(selfish).toEqual([]);
  });
});

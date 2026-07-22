import { describe, it, expect } from 'vitest';
import { chapters } from '../src/content';
import { concepts } from '../src/content/concepts';
import type { Block, Question, Section } from '../src/content/schema';

/**
 * Chapter 3 once shipped with 27 concept cards and not one `[[mark]]` in its
 * prose, so the whole SVM section named the RBF kernel without a single term
 * being unfoldable. Nothing failed: the cards existed, the glossary listed
 * them, later chapters even linked to them — the one place they were missing
 * was the section that teaches them. These tests close that hole.
 *
 * The rule: a concept is *introduced* exactly once, in the section named by its
 * `teachesAt`, and that introduction has to be marked. Referring to it again
 * from anywhere else is optional and unchecked.
 */

function questionText(q: Question): string[] {
  const out = [q.prompt, q.explain];
  if (q.kind === 'mcq' || q.kind === 'multi') out.push(...q.choices);
  if (q.kind === 'order') out.push(...q.items);
  if (q.kind === 'match') for (const [a, b] of q.pairs) out.push(a, b);
  return out;
}

/** every string in a block that reaches the reader through `renderInline` */
function blockText(b: Block): string[] {
  switch (b.type) {
    case 'p':
    case 'hint':
      return [b.md];
    case 'list':
      return b.items;
    case 'figure':
      return b.caption ? [b.caption] : [];
    case 'formula':
      // `parts[].label` is deliberately absent: it is printed as a raw string
      // under the maths, so markup in it would reach the reader as brackets
      return b.terms.map((t) => t.explain);
    case 'quiz':
      return b.questions.flatMap(questionText);
    case 'widget':
      return b.challenge ? [b.challenge.label] : [];
    case 'math':
    case 'code':
      return [];
  }
}

function sectionText(s: Section): string {
  return s.blocks.flatMap(blockText).join('\n');
}

const MARK = /\[\[([a-z0-9-]+)(?:\|[^\]]*)?\]\]/g;

const sections = chapters.flatMap((ch) => ch.sections.map((s) => ({ ...s, chapter: ch.id })));

/** section id → the set of concept ids marked anywhere inside it */
const markedIn = new Map<string, Set<string>>();
for (const s of sections) {
  const ids = new Set<string>();
  for (const m of sectionText(s).matchAll(MARK)) ids.add(m[1]);
  markedIn.set(s.id, ids);
}

describe('every concept is introduced where it is taught', () => {
  it('names a real section in teachesAt', () => {
    const ids = new Set(sections.map((s) => s.id));
    const dangling = concepts
      .filter((c) => c.teachesAt && !ids.has(c.teachesAt))
      .map((c) => `${c.id} → ${c.teachesAt}`);
    expect(dangling).toEqual([]);
  });

  it('has a teachesAt at all', () => {
    // without one there is no section responsible for explaining it, and the
    // card becomes the only place the idea is ever spelled out
    expect(concepts.filter((c) => !c.teachesAt).map((c) => c.id)).toEqual([]);
  });

  it('is marked with [[id]] inside that section', () => {
    const missing = concepts
      .filter((c) => c.teachesAt && !markedIn.get(c.teachesAt)?.has(c.id))
      .map((c) => `${c.id} — nothing marks it in ${c.teachesAt}`);
    expect(missing).toEqual([]);
  });
});

describe('the words shown for a mark stay plain', () => {
  it('carries no markup after the pipe', () => {
    // `[[kernel-trick|**the kernel trick**]]` puts the asterisks on screen: the
    // display text is printed as a raw string, so emphasis has to wrap the mark
    // — `**[[kernel-trick]]**` — rather than sit inside it
    // widget guides and intros carry marks too, and they live in .tsx rather
    // than in the content model — read them as source
    const widgets = import.meta.glob('../src/components/widgets/**/*.tsx', {
      eager: true,
      query: '?raw',
      import: 'default',
    }) as Record<string, string>;
    const bodies = [
      ...sections.map((s) => [s.id, sectionText(s)] as const),
      ...Object.entries(widgets).map(
        ([p, src]) => [p.replace('../src/components/widgets/', ''), src] as const,
      ),
    ];

    const bad: string[] = [];
    for (const [where, text] of bodies) {
      for (const m of text.matchAll(/\[\[[a-z0-9-]+\|([^\]]*)\]\]/g)) {
        if (/[*`$]|\[\[/.test(m[1])) bad.push(`${where}: [[…|${m[1]}]]`);
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('formula part labels stay plain', () => {
  it('carries no markup, because it is printed verbatim', () => {
    const bad: string[] = [];
    for (const s of sections) {
      for (const b of s.blocks) {
        if (b.type !== 'formula') continue;
        for (const p of b.parts ?? []) {
          if (p.label && /\[\[|\*\*|\$|`/.test(p.label)) bad.push(`${s.id}: "${p.label}"`);
        }
      }
    }
    expect(bad).toEqual([]);
  });
});

describe('every section pulls its weight', () => {
  it('marks at least one concept', () => {
    // a whole section of bare prose is the failure mode this file exists for
    const bare = sections.filter((s) => markedIn.get(s.id)!.size === 0).map((s) => s.id);
    expect(bare).toEqual([]);
  });

  it('marks a fair share of what it teaches', () => {
    // a section that teaches eight ideas and marks one is technically covered
    // by the test above and still leaves seven terms bare
    const thin: string[] = [];
    for (const s of sections) {
      const owed = concepts.filter((c) => c.teachesAt === s.id).length;
      const got = markedIn.get(s.id)!.size;
      if (owed >= 3 && got < owed) thin.push(`${s.id}: teaches ${owed}, marks ${got}`);
    }
    expect(thin).toEqual([]);
  });
});

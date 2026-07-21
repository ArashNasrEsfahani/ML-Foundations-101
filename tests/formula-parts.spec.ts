import { describe, it, expect } from 'vitest';
import katex from 'katex';
import { chapters } from '../src/content';

/**
 * Breaking an equation into pieces means each piece is rendered on its own, so
 * a piece that is only valid TeX in context — a dangling `^2`, an unmatched
 * `\left(` — silently renders as a KaTeX error box in the lesson. Compile every
 * piece here instead of finding out on the page.
 */
const formulas = chapters.flatMap((c) =>
  c.sections.flatMap((s) =>
    s.blocks.flatMap((b) =>
      b.type === 'formula' && b.parts?.length ? [{ id: `${s.id}: ${b.tex.slice(0, 40)}`, block: b }] : [],
    ),
  ),
);

describe('annotated formula parts', () => {
  it('has parts on the formulas worth breaking up', () => {
    expect(formulas.length).toBeGreaterThan(20);
  });

  it.each(formulas.map((f) => [f.id, f.block] as const))('%s', (_id, block) => {
    const parts = block.parts!;
    // a single piece is not a breakdown, it is just the equation again
    expect(parts.length).toBeGreaterThan(1);
    // and a breakdown with nothing explained is decoration
    expect(parts.some((p) => p.label)).toBe(true);

    for (const p of parts) {
      // the same string the renderer compiles, \displaystyle prefix and all
      expect(() =>
        katex.renderToString(`\\displaystyle ${p.tex}`, { throwOnError: true }),
      ).not.toThrow();
      // labels sit under the maths in a narrow column; long ones tower over it
      if (p.label) expect(p.label.length).toBeLessThanOrEqual(58);
    }
  });
});

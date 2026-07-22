import { describe, it, expect } from 'vitest';

/**
 * Two rules the widgets earned the hard way, kept here because neither is
 * visible to the type checker:
 *
 *  - a control nobody explains is a control nobody touches, so every widget
 *    carries a `guide`;
 *  - a loop running at full tilt shows the answer and hides the process, so
 *    every widget with a loop lets the reader slow it down.
 *
 * Source-level rather than render-level on purpose: the specs run in a node
 * environment with no DOM, and a grep over the source is enough to catch the
 * regression these are guarding against — someone adding a widget and
 * forgetting. Read through Vite's glob rather than `fs` so the suite needs no
 * node type definitions.
 */
const modules = import.meta.glob('../src/components/widgets/**/*.tsx', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>;

const sources = Object.entries(modules).map(([p, src]) => ({
  name: p.replace('../src/components/widgets/', ''),
  src,
}));

describe('widget controls', () => {
  it('finds the widgets', () => {
    expect(sources.length).toBeGreaterThan(20);
  });

  it('explains its controls wherever a widget frame is used', () => {
    const silent = sources
      .filter((s) => s.src.includes('<WidgetFrame') && !s.src.includes('guide={'))
      .map((s) => s.name);
    expect(silent).toEqual([]);
  });

  it('lets the reader slow down anything that runs on its own', () => {
    const racing = sources
      .filter((s) => /\buse(Raf|Ticker)\(/.test(s.src) && !s.src.includes('SpeedControl'))
      .map((s) => s.name);
    expect(racing).toEqual([]);
  });

  it('never hard-codes the interval a speed control is supposed to own', () => {
    // useTicker(fn, playing, 120) — a literal here means the speed buttons are
    // wired to a control that changes nothing
    const frozen = sources
      .filter((s) => s.src.includes('SpeedControl') && /use(Raf|Ticker)\([^)]*,\s*\d+\s*\)/.test(s.src))
      .map((s) => s.name);
    expect(frozen).toEqual([]);
  });
});

import { describe, it, expect } from 'vitest';
import { tokenizeInline, type InlineToken } from '../src/lib/inlineMd';
import { chapters } from '../src/content';

/** flatten to a comparable shape: kind + payload, children inlined */
function shape(tokens: InlineToken[]): unknown[] {
  return tokens.map((t) => {
    switch (t.kind) {
      case 'strong':
      case 'em':
        return [t.kind, shape(t.children)];
      case 'link':
        return [t.kind, t.href, shape(t.children)];
      case 'concept':
        return t.text === undefined ? [t.kind, t.id] : [t.kind, t.id, t.text];
      case 'math':
        return [t.kind, t.tex];
      default:
        return [t.kind, t.text];
    }
  });
}

describe('inline markdown-lite', () => {
  it('parses the four leaf kinds', () => {
    expect(shape(tokenizeInline('plain **b** *i* `c` $x$'))).toEqual([
      ['text', 'plain '],
      ['strong', [['text', 'b']]],
      ['text', ' '],
      ['em', [['text', 'i']]],
      ['text', ' '],
      ['code', 'c'],
      ['text', ' '],
      ['math', 'x'],
    ]);
  });

  // the bug this file was written for: an italic aside containing maths used to
  // render the TeX source verbatim, dollar signs and all
  it('parses maths nested inside emphasis', () => {
    expect(shape(tokenizeInline('— *is $x^{(j)}$ below $t$?* —'))).toEqual([
      ['text', '— '],
      [
        'em',
        [
          ['text', 'is '],
          ['math', 'x^{(j)}'],
          ['text', ' below '],
          ['math', 't'],
          ['text', '?'],
        ],
      ],
      ['text', ' —'],
    ]);
  });

  it('does not let a star inside TeX close an emphasis', () => {
    expect(shape(tokenizeInline('an *optimal* $(\\mathbf{w}^*, b^*)$ pair'))).toEqual([
      ['text', 'an '],
      ['em', [['text', 'optimal']]],
      ['text', ' '],
      ['math', '(\\mathbf{w}^*, b^*)'],
      ['text', ' pair'],
    ]);
    // ...even when the emphasis wraps the maths
    expect(shape(tokenizeInline('*the $w^*$ pair*'))).toEqual([
      ['em', [['text', 'the '], ['math', 'w^*'], ['text', ' pair']]],
    ]);
  });

  it('leaves an unclosed marker as literal text', () => {
    expect(shape(tokenizeInline('2 * 3 and a lone $'))).toEqual([['text', '2 * 3 and a lone $']]);
  });

  it('parses concept references, with and without display text', () => {
    expect(shape(tokenizeInline('the [[rbf-kernel]] and [[svm-c|its C dial]]'))).toEqual([
      ['text', 'the '],
      ['concept', 'rbf-kernel'],
      ['text', ' and '],
      ['concept', 'svm-c', 'its C dial'],
    ]);
  });

  it('parses cross-references and outbound links', () => {
    expect(shape(tokenizeInline('see [Chapter 4](sec:ch04-gradient-descent) or [the book](https://x.y)'))).toEqual([
      ['text', 'see '],
      ['link', 'sec:ch04-gradient-descent', [['text', 'Chapter 4']]],
      ['text', ' or '],
      ['link', 'https://x.y', [['text', 'the book']]],
    ]);
  });

  it('leaves brackets that are not links alone', () => {
    // prose brackets, an unclosed pair, and double brackets around plain words
    expect(shape(tokenizeInline('a [note] here [and [[a phrase]] too'))).toEqual([
      ['text', 'a [note] here [and [[a phrase]] too'],
    ]);
  });

  it('reads concepts and links nested inside emphasis', () => {
    expect(shape(tokenizeInline('*use [[entropy]] from [ch3](sec:ch03-decision-trees)*'))).toEqual([
      [
        'em',
        [
          ['text', 'use '],
          ['concept', 'entropy'],
          ['text', ' from '],
          ['link', 'sec:ch03-decision-trees', [['text', 'ch3']]],
        ],
      ],
    ]);
  });

  it('leaves no stray dollar signs anywhere in the course prose', () => {
    const offenders: string[] = [];
    const walk = (md: string) => {
      for (const t of tokenizeInline(md)) {
        const stack = [t];
        while (stack.length) {
          const cur = stack.pop()!;
          if (cur.kind === 'strong' || cur.kind === 'em' || cur.kind === 'link')
            stack.push(...cur.children);
          else if (cur.kind === 'text' && cur.text.includes('$')) offenders.push(md);
        }
      }
    };
    for (const c of chapters) {
      for (const s of c.sections) {
        for (const b of s.blocks) {
          if (b.type === 'p' || b.type === 'hint') walk(b.md);
          if (b.type === 'list') b.items.forEach(walk);
        }
      }
    }
    expect(offenders).toEqual([]);
  });
});

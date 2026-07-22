/**
 * The tokenizer behind the markdown-lite used in lesson prose: `**bold**`,
 * `*em*`, `` `code` ``, `$tex$`, `[[concept]]` and `[text](target)`.
 *
 * Kept separate from the React renderer so it can be tested in a plain node
 * environment, and written as a scanner rather than a regex because the two
 * requirements fight each other: emphasis has to nest (a `$…$` inside an
 * `*…*` is ordinary prose), while `*` is also a perfectly common character
 * *inside* TeX — `$(\mathbf{w}^*, b^*)$`. A scanner can consume maths and code
 * as opaque spans while hunting for a closing emphasis marker; an alternation
 * regex cannot.
 *
 * `[[gradient-descent]]` marks a term the reader can unfold into three depths;
 * `[[gradient-descent|walking downhill]]` does the same under different words.
 * `[text](sec:ch04-gradient-descent)` is a jump to another lesson, and
 * `[text](https://…)` an ordinary outbound link. Both bracket forms fall back
 * to literal text when they are not closed, so a stray `[` is harmless.
 */
export type InlineToken =
  | { kind: 'text'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'math'; tex: string }
  | { kind: 'strong'; children: InlineToken[] }
  | { kind: 'em'; children: InlineToken[] }
  | { kind: 'concept'; id: string; text?: string }
  | { kind: 'link'; href: string; children: InlineToken[] };

/**
 * Index of the next `marker` at this nesting level, skipping over `$…$` and
 * `` `…` `` spans so a `*` inside a formula never closes an emphasis. Returns
 * -1 when the emphasis is never closed, which makes the opener literal text.
 */
function findClose(src: string, from: number, marker: string): number {
  let i = from;
  while (i < src.length) {
    const c = src[i];
    if (c === '$' || c === '`') {
      const end = src.indexOf(c, i + 1);
      if (end < 0) return -1;
      i = end + 1;
      continue;
    }
    if (src.startsWith(marker, i)) return i;
    i += 1;
  }
  return -1;
}

export function tokenizeInline(md: string): InlineToken[] {
  const out: InlineToken[] = [];
  let buf = '';
  let i = 0;

  const flush = () => {
    if (buf) {
      out.push({ kind: 'text', text: buf });
      buf = '';
    }
  };

  while (i < md.length) {
    const c = md[i];

    if (c === '`' || c === '$') {
      const end = md.indexOf(c, i + 1);
      // `end > i + 1` rejects the empty span `$$`, which is almost always a typo
      if (end > i + 1) {
        flush();
        const inner = md.slice(i + 1, end);
        out.push(c === '`' ? { kind: 'code', text: inner } : { kind: 'math', tex: inner });
        i = end + 1;
        continue;
      }
    } else if (c === '*') {
      const marker = md.startsWith('**', i) ? '**' : '*';
      const start = i + marker.length;
      const end = findClose(md, start, marker);
      if (end > start) {
        flush();
        out.push({
          kind: marker === '**' ? 'strong' : 'em',
          children: tokenizeInline(md.slice(start, end)),
        });
        i = end + marker.length;
        continue;
      }
    } else if (md.startsWith('[[', i)) {
      const end = md.indexOf(']]', i + 2);
      if (end > i + 2) {
        const inner = md.slice(i + 2, end);
        const bar = inner.indexOf('|');
        const id = (bar < 0 ? inner : inner.slice(0, bar)).trim();
        const text = bar < 0 ? undefined : inner.slice(bar + 1);
        // an id is a slug; anything else is prose that happened to sit in
        // double brackets, and prose should be left exactly as written
        if (/^[a-z0-9-]+$/.test(id)) {
          flush();
          out.push({ kind: 'concept', id, text });
          i = end + 2;
          continue;
        }
      }
    } else if (c === '[') {
      const close = findClose(md, i + 1, ']');
      if (close > i + 1 && md[close + 1] === '(') {
        const paren = md.indexOf(')', close + 2);
        if (paren > close + 2) {
          flush();
          out.push({
            kind: 'link',
            href: md.slice(close + 2, paren),
            children: tokenizeInline(md.slice(i + 1, close)),
          });
          i = paren + 1;
          continue;
        }
      }
    }

    buf += c;
    i += 1;
  }

  flush();
  return out;
}

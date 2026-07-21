/**
 * The tokenizer behind the markdown-lite used in lesson prose: `**bold**`,
 * `*em*`, `` `code` `` and `$tex$`.
 *
 * Kept separate from the React renderer so it can be tested in a plain node
 * environment, and written as a scanner rather than a regex because the two
 * requirements fight each other: emphasis has to nest (a `$…$` inside an
 * `*…*` is ordinary prose), while `*` is also a perfectly common character
 * *inside* TeX — `$(\mathbf{w}^*, b^*)$`. A scanner can consume maths and code
 * as opaque spans while hunting for a closing emphasis marker; an alternation
 * regex cannot.
 */
export type InlineToken =
  | { kind: 'text'; text: string }
  | { kind: 'code'; text: string }
  | { kind: 'math'; tex: string }
  | { kind: 'strong'; children: InlineToken[] }
  | { kind: 'em'; children: InlineToken[] };

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
    }

    buf += c;
    i += 1;
  }

  flush();
  return out;
}

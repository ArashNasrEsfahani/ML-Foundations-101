import React from 'react';
import { TeX } from './TeX';

/** markdown-lite: **bold**, *em*, `code`, $tex$ — hand-rolled, no dependency. */
export function renderInline(md: string): React.ReactNode {
  const nodes: React.ReactNode[] = [];
  let rest = md;
  let key = 0;

  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\$[^$]+\$)/;

  while (rest.length > 0) {
    const m = rest.match(pattern);
    if (!m || m.index === undefined) {
      nodes.push(rest);
      break;
    }
    if (m.index > 0) nodes.push(rest.slice(0, m.index));
    const token = m[0];
    if (token.startsWith('**')) {
      nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith('`')) {
      nodes.push(<code key={key++}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith('$')) {
      nodes.push(<TeX key={key++} tex={token.slice(1, -1)} />);
    } else {
      nodes.push(<em key={key++}>{token.slice(1, -1)}</em>);
    }
    rest = rest.slice(m.index + token.length);
  }

  return <>{nodes}</>;
}

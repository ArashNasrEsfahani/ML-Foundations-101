import React from 'react';
import { TeX } from './TeX';
import { tokenizeInline, type InlineToken } from '../../lib/inlineMd';

function toNodes(tokens: InlineToken[]): React.ReactNode[] {
  return tokens.map((t, i) => {
    switch (t.kind) {
      case 'text':
        return <React.Fragment key={i}>{t.text}</React.Fragment>;
      case 'code':
        return <code key={i}>{t.text}</code>;
      case 'math':
        return <TeX key={i} tex={t.tex} />;
      case 'strong':
        return <strong key={i}>{toNodes(t.children)}</strong>;
      case 'em':
        return <em key={i}>{toNodes(t.children)}</em>;
    }
  });
}

/** markdown-lite: **bold**, *em*, `code`, $tex$ — nesting allowed inside emphasis. */
export function renderInline(md: string): React.ReactNode {
  return <>{toNodes(tokenizeInline(md))}</>;
}

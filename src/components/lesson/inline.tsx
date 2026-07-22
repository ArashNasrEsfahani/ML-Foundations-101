import React from 'react';
import { Link } from 'react-router-dom';
import { TeX } from './TeX';
import { tokenizeInline, type InlineToken } from '../../lib/inlineMd';
import { resolveHref } from '../../content/links';
import { ConceptRef } from './ConceptRef';

/**
 * `[text](sec:…)` inside the course, `[text](https://…)` out of it. A target
 * that no longer resolves renders as plain prose rather than a link to nowhere.
 */
function InlineLink({ href, children }: { href: string; children: React.ReactNode }) {
  const r = resolveHref(href);
  if (!r.ok) return <>{children}</>;
  if (r.external) {
    return (
      <a className="lesson-link out" href={r.href} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link className="lesson-link" to={r.href} title={r.hint}>
      {children}
    </Link>
  );
}

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
      case 'concept':
        return <ConceptRef key={i} id={t.id} text={t.text} />;
      case 'link':
        return (
          <InlineLink key={i} href={t.href}>
            {toNodes(t.children)}
          </InlineLink>
        );
    }
  });
}

/**
 * markdown-lite: `**bold**`, `*em*`, `` `code` ``, `$tex$`, `[[concept]]` and
 * `[text](sec:section-id)` — nesting allowed inside emphasis.
 */
export function renderInline(md: string): React.ReactNode {
  return <>{toNodes(tokenizeInline(md))}</>;
}

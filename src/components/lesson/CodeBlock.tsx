import React, { useMemo } from 'react';

/** Minimal Python highlighter — keywords, strings, comments, numbers. Monochrome-friendly. */
const KEYWORDS = new Set([
  'def', 'return', 'for', 'in', 'if', 'else', 'elif', 'while', 'import', 'from', 'as',
  'lambda', 'range', 'len', 'print', 'and', 'or', 'not', 'True', 'False', 'None', 'class',
]);

function highlight(code: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const lines = code.split('\n');
  lines.forEach((line, li) => {
    const tokens = line.split(/(#.*$|"[^"]*"|'[^']*'|\b\d+\.?\d*\b|\b\w+\b)/g).filter((t) => t !== '');
    tokens.forEach((tok, ti) => {
      const key = `${li}-${ti}`;
      if (tok.startsWith('#')) {
        out.push(<span key={key} style={{ color: 'var(--graphite)', fontStyle: 'italic' }}>{tok}</span>);
      } else if (/^["']/.test(tok)) {
        out.push(<span key={key} style={{ color: '#55534c' }}>{tok}</span>);
      } else if (KEYWORDS.has(tok)) {
        out.push(<strong key={key}>{tok}</strong>);
      } else {
        out.push(<span key={key}>{tok}</span>);
      }
    });
    if (li < lines.length - 1) out.push('\n');
  });
  return out;
}

export function CodeBlock({ code, caption }: { code: string; caption?: string }) {
  const nodes = useMemo(() => highlight(code), [code]);
  return (
    <figure style={{ margin: '1.2em 0' }}>
      <pre
        style={{
          background: 'var(--paper-2)',
          border: '1px solid var(--line)',
          borderRadius: 'var(--radius)',
          padding: '14px 18px',
          overflowX: 'auto',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          lineHeight: 1.55,
          whiteSpace: 'pre',
        }}
      >
        {nodes}
      </pre>
      {caption && (
        <figcaption style={{ fontSize: '0.85rem', color: 'var(--graphite)', marginTop: 4 }}>
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

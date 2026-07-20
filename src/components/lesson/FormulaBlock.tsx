import React, { useState } from 'react';
import { TeX } from './TeX';

/**
 * A display equation with tappable term explanations below it.
 * Terms are shown as small chips; tapping one reveals its plain-English meaning.
 */
export function FormulaBlock({
  tex,
  terms,
}: {
  tex: string;
  terms: { tex: string; explain: string }[];
}) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <div
      style={{
        margin: '1.2em 0',
        padding: '14px 18px',
        background: '#fffdf8',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
      }}
    >
      <TeX tex={tex} block />
      {terms.length > 0 && (
        <>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
            {terms.map((t, i) => (
              <button
                key={i}
                className="ghost"
                onClick={() => setActive(active === i ? null : i)}
                style={{
                  padding: '3px 12px',
                  fontSize: '0.9rem',
                  borderStyle: active === i ? 'solid' : 'dashed',
                  borderColor: active === i ? 'var(--ink)' : 'var(--line)',
                  color: active === i ? 'var(--ink)' : 'var(--graphite)',
                }}
              >
                <TeX tex={t.tex} />
              </button>
            ))}
          </div>
          {active !== null && (
            <p style={{ margin: '10px 2px 2px', fontSize: '0.95rem', color: 'var(--ink)' }}>
              <TeX tex={terms[active].tex} />
              <span style={{ color: 'var(--graphite)' }}> — {terms[active].explain}</span>
            </p>
          )}
          {active === null && (
            <p style={{ margin: '8px 2px 0', fontSize: '0.8rem', color: 'var(--graphite)' }}>
              tap a symbol to see what it means
            </p>
          )}
        </>
      )}
    </div>
  );
}

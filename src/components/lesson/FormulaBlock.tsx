import React, { useState } from 'react';
import { TeX } from './TeX';

/** the same wobbly stroke the map uses for progress — drawn, not ruled */
function SketchUnderline() {
  return (
    <svg
      aria-hidden
      width="100%"
      height="7"
      viewBox="0 0 100 7"
      preserveAspectRatio="none"
      style={{ display: 'block', margin: '3px 0 2px' }}
    >
      <path
        d="M1 4 q 25 -3 49 0 t 49 0"
        stroke="var(--line)"
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * The equation laid out piece by piece, each meaningful piece underlined and
 * captioned in plain English — the way you would annotate it in the margin.
 *
 * A CSS grid rather than a flex row, because the captions must line up in one
 * band underneath no matter how tall the pieces above them are: a fraction and
 * an equals sign have very different heights, and `grid` aligns by row where
 * flexbox would leave each column drifting on its own.
 */
function AnnotatedFormula({ parts }: { parts: { tex: string; label?: string }[] }) {
  return (
    <div style={{ overflowX: 'auto', overflowY: 'hidden', padding: '2px 0 4px' }}>
      <div
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridTemplateRows: 'auto auto',
          alignItems: 'baseline',
          columnGap: 7,
          // max-content + auto margins: centered while it fits, and when it does
          // not, the columns keep their width and the row scrolls instead of
          // collapsing to one word per line and colliding with its neighbour
          width: 'max-content',
          margin: '0 auto',
        }}
      >
        {parts.map((p, i) => (
          <React.Fragment key={i}>
            <div style={{ gridRow: 1, textAlign: 'center', padding: '0 2px' }}>
              <TeX tex={p.tex} displayStyle />
            </div>
            <div
              style={{
                gridRow: 2,
                maxWidth: 132,
                justifySelf: 'center',
                // the caption band should never squeeze the maths above it
                minWidth: 0,
              }}
            >
              {p.label && (
                <>
                  <SketchUnderline />
                  <div
                    style={{
                      fontFamily: 'var(--font-hand)',
                      fontSize: '1.05rem',
                      lineHeight: 1.25,
                      color: 'var(--graphite)',
                      textAlign: 'center',
                    }}
                  >
                    {p.label}
                  </div>
                </>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

/**
 * A display equation with tappable term explanations below it — and, when the
 * equation splits into meaningful pieces, those pieces annotated in place.
 */
export function FormulaBlock({
  tex,
  terms,
  parts,
}: {
  tex: string;
  terms: { tex: string; explain: string }[];
  parts?: { tex: string; label?: string }[];
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
      {parts && parts.length > 0 ? <AnnotatedFormula parts={parts} /> : <TeX tex={tex} block />}
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

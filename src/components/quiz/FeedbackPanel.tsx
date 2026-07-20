import React from 'react';
import { SketchIcon } from '../sketch/SketchIcon';
import { renderInline } from '../lesson/inline';
import type { Inline } from '../../content/schema';

export type FeedbackState = 'correct' | 'wrong-retry' | 'wrong-reveal';

/** The ONLY place in the app where the deep green / deep red colors appear. */
export function FeedbackPanel({
  state,
  explain,
  onContinue,
  onRetry,
  continueLabel = 'Continue',
}: {
  state: FeedbackState;
  explain: Inline;
  onContinue: () => void;
  onRetry?: () => void;
  continueLabel?: string;
}) {
  const correct = state === 'correct';
  const color = correct ? 'var(--ok)' : 'var(--bad)';
  const bg = correct ? 'var(--ok-bg)' : 'var(--bad-bg)';

  return (
    <div
      role="status"
      className={`anim-rise ${correct ? 'anim-glow-ok' : 'anim-glow-bad'}`}
      style={{
        marginTop: 14,
        padding: '14px 16px',
        background: bg,
        border: `1.5px solid ${color}`,
        borderRadius: 'var(--radius)',
        color: 'var(--ink)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color, fontWeight: 700 }}>
        <span className="anim-draw" style={{ display: 'inline-flex' }}>
          <SketchIcon name={correct ? 'check' : 'cross'} size={18} strokeWidth={2.2} />
        </span>
        <span className="anim-slide-left" style={{ animationDelay: '60ms' }}>
          {correct ? 'Correct!' : state === 'wrong-retry' ? 'Not quite — try once more.' : 'Not this time.'}
        </span>
      </div>
      {(correct || state === 'wrong-reveal') && (
        <p className="anim-fade" style={{ margin: '8px 0 0', fontSize: '0.97rem', animationDelay: '140ms' }}>
          {renderInline(explain)}
        </p>
      )}
      <div className="anim-fade" style={{ marginTop: 12, display: 'flex', gap: 10, animationDelay: '200ms' }}>
        {state === 'wrong-retry' && onRetry ? (
          <button onClick={onRetry} style={{ borderColor: color, color }}>
            Try again
          </button>
        ) : (
          <button className="primary" onClick={onContinue}>
            {continueLabel}
          </button>
        )}
      </div>
    </div>
  );
}

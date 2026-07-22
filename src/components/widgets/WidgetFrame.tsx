import React, { useState } from 'react';
import { PaperCard } from '../sketch/PaperCard';
import { SketchIcon } from '../sketch/SketchIcon';
import { ChallengeChip } from './ChallengeChip';
import { renderInline } from '../lesson/inline';
import type { Challenge } from '../../content/schema';
import { hashString } from '../../lib/rng';

/**
 * One row of the "what does this button do?" panel. `control` is the control's
 * own label, spelled exactly as it appears on screen so the eye can match them
 * up; `what` is markdown-lite, so it can carry `[[concepts]]` and maths.
 */
export interface GuideEntry {
  control: string;
  what: string;
}

export function WidgetFrame({
  title,
  intro,
  guide,
  children,
  onReset,
  challenge,
  challengeDone,
}: {
  title: string;
  /** one or two sentences on what the widget is for, above the controls */
  intro?: React.ReactNode;
  guide?: GuideEntry[];
  children: React.ReactNode;
  onReset?: () => void;
  challenge?: Challenge;
  challengeDone?: boolean;
}) {
  // Closed by default: a reader who already knows what a slider does should not
  // have to scroll past a glossary to reach the thing itself.
  const [guideOpen, setGuideOpen] = useState(false);

  return (
    <PaperCard
      seed={hashString(title) % 1000}
      padding={16}
      className="anim-rise"
      style={{ margin: '1.4em 0' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexWrap: 'wrap',
          marginBottom: 10,
        }}
      >
        <span style={{ fontFamily: 'var(--font-hand)', fontSize: '1.35rem', fontWeight: 700 }}>
          {title}
        </span>
        <span style={{ flex: 1 }} />
        {challenge && <ChallengeChip challenge={challenge} done={!!challengeDone} />}
        {guide && guide.length > 0 && (
          <button
            className="ghost"
            onClick={() => setGuideOpen((o) => !o)}
            aria-expanded={guideOpen}
            title="What does each control do?"
            style={{ padding: '4px 10px', fontSize: '0.82rem', display: 'inline-flex', gap: 6 }}
          >
            <SketchIcon name="question" size={15} />
            {guideOpen ? 'Hide the controls' : 'What do the controls do?'}
          </button>
        )}
        {onReset && (
          <button
            className="ghost"
            onClick={onReset}
            title="Reset"
            aria-label="Reset widget"
            style={{ padding: '4px 8px', display: 'inline-flex' }}
          >
            <SketchIcon name="reset" size={16} />
          </button>
        )}
      </div>

      {intro && (
        <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: 'var(--graphite)' }}>{intro}</p>
      )}

      {guide && guideOpen && (
        <div className="widget-guide anim-rise">
          <dl>
            {guide.map((g, i) => (
              <React.Fragment key={i}>
                <dt>{g.control}</dt>
                <dd>{renderInline(g.what)}</dd>
              </React.Fragment>
            ))}
          </dl>
        </div>
      )}

      {children}
    </PaperCard>
  );
}

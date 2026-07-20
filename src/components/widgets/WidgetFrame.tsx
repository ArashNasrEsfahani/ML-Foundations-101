import React from 'react';
import { PaperCard } from '../sketch/PaperCard';
import { SketchIcon } from '../sketch/SketchIcon';
import { ChallengeChip } from './ChallengeChip';
import type { Challenge } from '../../content/schema';
import { hashString } from '../../lib/rng';

export function WidgetFrame({
  title,
  children,
  onReset,
  challenge,
  challengeDone,
}: {
  title: string;
  children: React.ReactNode;
  onReset?: () => void;
  challenge?: Challenge;
  challengeDone?: boolean;
}) {
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
      {children}
    </PaperCard>
  );
}

import React from 'react';
import type { Challenge } from '../../content/schema';
import { useProgress } from '../../state/progressStore';
import { SketchIcon } from '../sketch/SketchIcon';

/**
 * Shows a widget's goal ("Goal: reach MSE < 20") and its done state.
 * Widgets call `useChallenge` and invoke `complete()` when the goal is met.
 */
export function useChallenge(challenge?: Challenge) {
  const { save, dispatch } = useProgress();
  const done = challenge ? !!save.challenges[challenge.id] : false;
  const complete = () => {
    if (challenge && !done) {
      dispatch({ type: 'challenge', challengeId: challenge.id, xp: challenge.xp, label: challenge.label });
    }
  };
  return { done, complete };
}

export function ChallengeChip({ challenge, done }: { challenge: Challenge; done: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        fontSize: '0.85rem',
        padding: '3px 12px',
        borderRadius: 999,
        border: `1.5px ${done ? 'solid var(--ink)' : 'dashed var(--graphite)'}`,
        color: done ? 'var(--ink)' : 'var(--graphite)',
        background: done ? 'var(--paper-2)' : 'transparent',
      }}
    >
      {done ? <SketchIcon name="check" size={14} strokeWidth={2.4} /> : <SketchIcon name="star" size={14} />}
      {done ? 'Done: ' : 'Goal: '}
      {challenge.label}
      {!done && <span style={{ opacity: 0.8 }}>· +{challenge.xp} XP</span>}
    </span>
  );
}

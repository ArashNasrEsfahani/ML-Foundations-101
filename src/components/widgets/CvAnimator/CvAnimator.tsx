import React, { useEffect, useMemo, useState } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { useTicker } from '../../../hooks/useRaf';
import { useSpeed, SpeedControl } from '../SpeedControl';
import { mulberry32 } from '../../../lib/rng';

const N = 20;
const W = 420;
const H = 118;
const KS = [3, 5, 10];

const X0 = 30;
const XSTEP = 360 / (N - 1);
const DOT_Y = 46;

const cell: React.CSSProperties = {
  border: '1px solid var(--line)',
  padding: '3px 14px',
  fontSize: '0.9rem',
  textAlign: 'center',
};

/**
 * k-fold cross-validation, one fold at a time: 20 examples in a row, the
 * held-out fold turns into open circles, and each round yields a simulated
 * validation score (deterministic — the mean "quality" of the examples the
 * model was trained on), finishing with mean ± std.
 */
export function CvAnimator({ challenge }: WidgetProps) {
  const { done: challengeDone, complete } = useChallenge(challenge);

  // hidden per-example quality — seeded, so every visitor sees the same round
  const skills = useMemo(() => {
    const rand = mulberry32(77);
    return Array.from({ length: N }, () => 0.55 + 0.4 * rand());
  }, []);

  const [k, setK] = useState(5);
  const [foldsRun, setFoldsRun] = useState(0);
  const [auto, setAuto] = useState(false);
  const speed = useSpeed();

  const foldOf = (i: number) => Math.floor((i * k) / N);

  const foldScore = (j: number): number => {
    const train = skills.filter((_, i) => foldOf(i) !== j);
    return train.reduce((a, b) => a + b, 0) / train.length;
  };
  const scores = Array.from({ length: foldsRun }, (_, j) => foldScore(j));

  const roundComplete = foldsRun === k;
  const mean = roundComplete ? scores.reduce((a, b) => a + b, 0) / k : 0;
  const std = roundComplete
    ? Math.sqrt(scores.reduce((a, s) => a + (s - mean) * (s - mean), 0) / k)
    : 0;

  const goalMet = k === 5 && roundComplete;
  useEffect(() => {
    if (goalMet) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalMet]);

  const activeFold = foldsRun - 1; // the fold currently shown as held out
  const nextFold = () => setFoldsRun((f) => Math.min(k, f + 1));

  // 1 s a fold: the band has to slide across and the dots re-pop left to right
  // before the next fold is held out, or the sweep reads as a flicker
  useTicker(
    () => {
      if (foldsRun + 1 >= k) setAuto(false); // the round is over — drop back to Run
      nextFold();
    },
    auto && !roundComplete,
    speed.ms(1000),
  );

  const pickK = (nk: number) => {
    setK(nk);
    setFoldsRun(0);
    setAuto(false);
  };
  const reset = () => {
    setK(5);
    setFoldsRun(0);
    setAuto(false);
  };

  // pixel span of a fold (for labels and separators)
  const foldSpan = (j: number) => {
    const idx = Array.from({ length: N }, (_, i) => i).filter((i) => foldOf(i) === j);
    return { first: idx[0], last: idx[idx.length - 1] };
  };

  return (
    <WidgetFrame
      title="Cross-validation, fold by fold"
      intro={
        <>
          20 labeled examples, not enough for a separate validation set. Split them into{' '}
          <strong>k folds</strong>; each round trains on the filled dots and validates on the open
          ones. Switching k restarts the round.
        </>
      }
      guide={[
        {
          control: '3 · 5 · 10',
          what: 'How many folds the 20 examples are cut into — the *k* of [[cross-validation]]. Larger k trains on more data each round but costs more rounds; k = 10 leaves only 2 examples to validate on.',
        },
        {
          control: 'Step: hold out fold n',
          what: 'Runs one round by hand: fold *n* becomes the open circles, the model trains on the rest, and its score lands in the table.',
        },
        {
          control: 'Run folds / Pause',
          what: 'Walks through the remaining rounds on a timer and stops when every fold has been held out once.',
        },
        {
          control: 'speed',
          what: 'Time per round: 5 s on *slow*, 1 s on *normal*, 250 ms on *fast*. Slow is worth it once, to watch which examples move out of training each round.',
        },
        {
          control: 'reset',
          what: 'Back to k = 5 with no rounds run.',
        },
        {
          control: 'F1 … Fk',
          what: 'The folds, left to right. A ✓ marks a fold that has already served as the [[validation-set|validation set]]; the bold one is held out right now.',
        },
        {
          control: 'validation score',
          what: 'What the model trained on this round scored on its held-out fold. The numbers differ because each round trains on a different 80% of the data — that spread is the point of the exercise.',
        },
        {
          control: 'all',
          what: 'Mean ± standard deviation across the folds. The mean is the estimate you would report; the ± says how much it depends on which examples happened to be held out.',
        },
      ]}
      onReset={reset}
      challenge={challenge}
      challengeDone={challengeDone}
    >
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: '0.95rem' }}>k =</span>
        {KS.map((nk) => (
          <button
            key={nk}
            onClick={() => pickK(nk)}
            aria-pressed={k === nk}
            style={{
              padding: '4px 14px',
              borderStyle: k === nk ? 'solid' : 'dashed',
              borderColor: k === nk ? 'var(--ink)' : 'var(--graphite)',
              color: k === nk ? 'var(--ink)' : 'var(--graphite)',
              background: k === nk ? 'var(--paper-2)' : 'var(--paper)',
            }}
          >
            {nk}
          </button>
        ))}
        <span style={{ flex: 1 }} />
        <SpeedControl value={speed.speed} onChange={speed.setSpeed} />
        <button className="ghost" onClick={() => setAuto((a) => !a)} disabled={roundComplete}>
          {auto ? 'Pause' : 'Run folds'}
        </button>
        <button className="primary" onClick={nextFold} disabled={roundComplete || auto}>
          {foldsRun === 0 ? 'Step: hold out fold 1' : roundComplete ? 'Round complete' : `Step: hold out fold ${foldsRun + 1}`}
        </button>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 'auto', display: 'block', background: '#fffdf8', borderRadius: 6 }}
      >
        {/* fold separators */}
        {Array.from({ length: k - 1 }, (_, j) => {
          const right = foldSpan(j).last;
          const x = X0 + (right + 0.5) * XSTEP;
          return (
            <line key={j} x1={x} y1={20} x2={x} y2={72} stroke="var(--graphite)" strokeWidth={1} strokeDasharray="4 4" />
          );
        })}
        {/* the held-out fold gets a sweeping highlight band */}
        {foldsRun > 0 &&
          (() => {
            const { first, last } = foldSpan(activeFold);
            const left = X0 + (first - 0.5) * XSTEP;
            const right = X0 + (last + 0.5) * XSTEP;
            return (
              <rect
                key={`band-${activeFold}`}
                className="anim-fade"
                x={left}
                y={22}
                width={right - left}
                height={48}
                rx={5}
                fill="var(--graphite)"
                fillOpacity={0.1}
                style={{ transition: 'x 0.4s cubic-bezier(0.22,0.8,0.3,1), width 0.4s cubic-bezier(0.22,0.8,0.3,1)' }}
              />
            );
          })()}
        {/* examples — a dot re-pops whenever it flips between train and held out,
            staggered left-to-right so the fold change reads as a sweep */}
        {skills.map((_, i) => {
          const heldOut = foldsRun > 0 && foldOf(i) === activeFold;
          const x = X0 + i * XSTEP;
          const span = foldsRun > 0 ? foldSpan(activeFold) : null;
          const delay = heldOut && span ? (i - span.first) * 45 : 0;
          return (
            <circle
              key={`${i}-${heldOut ? 'v' : 't'}`}
              className={foldsRun > 0 ? 'anim-pop' : undefined}
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'center',
                animationDelay: `${delay}ms`,
              }}
              cx={x}
              cy={DOT_Y}
              r={7}
              fill={heldOut ? '#fffdf8' : 'var(--ink)'}
              stroke={heldOut ? 'var(--ink)' : undefined}
              strokeWidth={heldOut ? 1.8 : undefined}
            />
          );
        })}
        {/* fold labels */}
        {Array.from({ length: k }, (_, j) => {
          const { first, last } = foldSpan(j);
          const cx = X0 + ((first + last) / 2) * XSTEP;
          const isActive = foldsRun > 0 && j === activeFold;
          const ran = j < foldsRun;
          return (
            <g key={j}>
              <text
                x={cx}
                y={94}
                textAnchor="middle"
                fontSize={12}
                fontWeight={isActive ? 700 : 400}
                fill={isActive ? 'var(--ink)' : 'var(--graphite)'}
              >
                F{j + 1}
                {ran && !isActive ? ' ✓' : ''}
              </text>
              {isActive && (
                <text x={cx} y={110} textAnchor="middle" fontSize={10} fill="var(--graphite)" fontStyle="italic">
                  held out
                </text>
              )}
            </g>
          );
        })}
      </svg>

      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'flex-start', marginTop: 12 }}>
        <table style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ ...cell, fontStyle: 'italic', color: 'var(--graphite)' }}>fold</th>
              <th style={{ ...cell, fontStyle: 'italic', color: 'var(--graphite)' }}>validation score</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: k }, (_, j) => (
              // the key flips the moment this fold's score lands, so the filled-in
              // row remounts and slides in
              <tr key={`${j}-${j < foldsRun}`} className={j < foldsRun ? 'anim-slide-left' : undefined}>
                <td style={cell}>F{j + 1}</td>
                <td style={{ ...cell, fontWeight: foldsRun > 0 && j === activeFold ? 700 : 400 }}>
                  {j < foldsRun ? foldScore(j).toFixed(3) : '—'}
                </td>
              </tr>
            ))}
            {roundComplete && (
              <tr className="anim-pop">
                <td style={{ ...cell, fontWeight: 700 }}>all</td>
                <td style={{ ...cell, fontWeight: 700 }}>
                  {mean.toFixed(3)} ± {std.toFixed(3)}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <p style={{ margin: 0, fontSize: '0.95rem', maxWidth: 300 }}>
          {foldsRun === 0 ? (
            <>Press <strong>Step</strong> to hold out the first fold and train on the rest.</>
          ) : roundComplete ? (
            <>
              Every example served in validation exactly once. The <strong>mean</strong> is your
              estimate of model quality; the <strong>±&nbsp;std</strong> says how much it wobbles
              across folds.
            </>
          ) : (
            <>
              Fold {activeFold + 1} is held out; the model trains on the other {N - (foldSpan(activeFold).last - foldSpan(activeFold).first + 1)}{' '}
              examples and is scored on the open circles.
            </>
          )}
        </p>
      </div>
    </WidgetFrame>
  );
}

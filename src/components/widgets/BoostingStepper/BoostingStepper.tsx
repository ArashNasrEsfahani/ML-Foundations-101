import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { makeFrame, Axes, Dot, PlotSvg } from '../Plot';
import { useTicker } from '../../../hooks/useRaf';
import { useSpeed, SpeedControl } from '../SpeedControl';
import { boost2d } from '../../../content/datasets/noisy2d';
import {
  adaboost,
  adaPredict,
  stumpError,
  stumpPredict,
  countErrors,
  type Pt2L,
} from '../../../lib/ml/stumps';

const W = 420;
const H = 340;
const GRID = 60;
const MAX_ROUNDS = 12;

/**
 * Step through AdaBoost one stump at a time: misclassified points swell
 * (radius ∝ example weight), each new stump draws its threshold line, and
 * a grayscale canvas raster shows the combined weighted-vote boundary.
 */
export function BoostingStepper({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const pts = useMemo(() => boost2d() as Pt2L[], []);
  const model = useMemo(() => adaboost(pts, MAX_ROUNDS), [pts]);
  const [round, setRound] = useState(0);
  const [auto, setAuto] = useState(false);
  const speed = useSpeed();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const frame = makeFrame(W, H, [0, 10], [0, 10]);
  const maxRound = model.stumps.length;

  // per-round stats: weighted error of stump t under the weights it was trained on
  const roundStats = useMemo(
    () =>
      model.stumps.map((s, t) => ({
        stump: s,
        alpha: model.alphas[t],
        eps: stumpError(s, pts, model.weightsHistory[t]),
      })),
    [model, pts],
  );

  const combinedErrors = useMemo(
    () => (round === 0 ? pts.length : countErrors(pts, (p) => adaPredict(model, p, round))),
    [round, model, pts],
  );

  const weightsNow = model.weightsHistory[Math.min(round, model.weightsHistory.length - 1)];

  const misclassified = useMemo(
    () => (round === 0 ? pts.map(() => false) : pts.map((p) => adaPredict(model, p, round) !== p.label)),
    [round, model, pts],
  );

  // raster of the combined boundary; shading = normalized weighted-vote margin
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    if (round === 0) {
      ctx.clearRect(0, 0, GRID, GRID);
      return;
    }
    let totalAlpha = 0;
    for (let t = 0; t < round; t++) totalAlpha += model.alphas[t];
    const img = ctx.createImageData(GRID, GRID);
    for (let r = 0; r < GRID; r++) {
      const y = 10 - ((r + 0.5) / GRID) * 10;
      for (let c = 0; c < GRID; c++) {
        const x = ((c + 0.5) / GRID) * 10;
        let s = 0;
        for (let t = 0; t < round; t++) {
          s += model.alphas[t] * stumpPredict(model.stumps[t], { x, y });
        }
        const margin = Math.max(-1, Math.min(1, s / (totalAlpha || 1)));
        const frac = 0.5 + 0.5 * margin;
        const i = (r * GRID + c) * 4;
        img.data[i] = 52;
        img.data[i + 1] = 52;
        img.data[i + 2] = 52;
        img.data[i + 3] = Math.round(10 + 58 * frac);
      }
    }
    ctx.putImageData(img, 0, 0);
  }, [round, model]);

  const goalMet = round > 0 && round <= 12 && combinedErrors === 0;
  useEffect(() => {
    if (goalMet) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalMet]);

  // no stumps left to add, or the committee already agrees with every label
  const canAdd = round < maxRound && !(round > 0 && combinedErrors === 0);
  const addStump = () => setRound((r) => Math.min(maxRound, r + 1));

  // 1 s a round: the new stump draws itself across the plot in 0.42 s and the
  // re-weighted points take another half-second to swell
  useTicker(addStump, auto && canAdd, speed.ms(1000));
  useEffect(() => {
    if (!canAdd) setAuto(false);
  }, [canAdd]);

  const reset = () => {
    setAuto(false);
    setRound(0);
  };

  const inner = {
    left: `${(frame.pad.l / W) * 100}%`,
    top: `${(frame.pad.t / H) * 100}%`,
    width: `${((W - frame.pad.l - frame.pad.r) / W) * 100}%`,
    height: `${((H - frame.pad.t - frame.pad.b) / H) * 100}%`,
  };
  const x0 = frame.pad.l;
  const x1 = W - frame.pad.r;
  const y0 = frame.pad.t;
  const y1 = H - frame.pad.b;

  return (
    <WidgetFrame
      title="Boost the stumps"
      intro={
        <>
          Each round trains one decision stump on the <em>weighted</em> data, then inflates the
          weights of the points it got wrong — bigger dot = heavier weight. Add stumps one at a
          time and watch the committee close in on the points nobody could classify.
        </>
      }
      guide={[
        {
          control: 'Add stump',
          what: 'Runs one round of [[adaboost|AdaBoost]]: fit the best single-split stump to the current weights, score it, then re-weight the points. Greys out when the vote is already perfect or the 12 rounds are spent.',
        },
        {
          control: 'Run rounds / Pause',
          what: 'Adds stumps on a timer and stops on its own at zero combined errors.',
        },
        {
          control: 'speed',
          what: 'Time per round: 5 s on *slow*, 1 s on *normal*, 250 ms on *fast*. On slow you can follow which points swell after each stump — that reweighting is the whole algorithm.',
        },
        {
          control: 'reset',
          what: 'Empties the committee back to round 0, with every point at equal weight.',
        },
        {
          control: 'round n / 12',
          what: 'How many [[weak-learner|weak learners]] have joined the vote. [[boosting|Boosting]] is built to work with a fixed, small budget of them.',
        },
        {
          control: 'dot size',
          what: 'The example’s current weight. Points the committee keeps getting wrong swell each round, which is what drags the next stump over to look at them.',
        },
        {
          control: 'dashed rings',
          what: 'Points the *combined* weighted vote still misclassifies — not the newest stump alone. They should thin out round by round.',
        },
        {
          control: 'the stump lines',
          what: 'Each round’s single split: the newest is solid, older ones fade to dashed. One stump is a straight cut, but a weighted stack of them is not.',
        },
        {
          control: 'weighted error ε',
          what: 'The share of *weight* (not of points) that stump got wrong, measured under the weights it was trained on. Anything below 0.5 is better than a coin flip and is worth a vote.',
        },
        {
          control: 'vote α',
          what: 'How much that stump counts in the final vote, $\\alpha = \\tfrac12\\ln\\frac{1-\\varepsilon}{\\varepsilon}$. A stump with a low ε speaks loudly; one near 0.5 barely whispers.',
        },
        {
          control: 'shaded background',
          what: 'The weighted vote across the plane, dark for one class and pale for the other. The washed-out band in between is where the committee is split.',
        },
      ]}
      onReset={reset}
      challenge={challenge}
      challengeDone={done}
    >
      {/* the stump lines are far longer than the shared .anim-draw dasharray, so
          they get a bespoke draw keyed to their own length; point radii ease. */}
      <style>{`
        @keyframes mlw-stump-draw {
          from { stroke-dashoffset: var(--mlw-len, 400); }
          to   { stroke-dashoffset: 0; }
        }
        .mlw-stump-new { animation: mlw-stump-draw 0.42s cubic-bezier(0.22,0.8,0.3,1) both; }
        .mlw-weighted circle {
          transition: r 0.5s cubic-bezier(0.22, 0.8, 0.3, 1), opacity 0.3s ease;
        }
      `}</style>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
        <button
          className="primary"
          onClick={addStump}
          disabled={!canAdd || auto}
          style={{ padding: '5px 14px', fontSize: '0.9rem' }}
        >
          Add stump
        </button>
        <button
          className="ghost"
          onClick={() => setAuto((a) => !a)}
          disabled={!canAdd}
          style={{ padding: '5px 12px', fontSize: '0.9rem' }}
        >
          {auto ? 'Pause' : 'Run rounds'}
        </button>
        <SpeedControl value={speed.speed} onChange={speed.setSpeed} />
        <span style={{ fontSize: '0.9rem', color: 'var(--graphite)' }}>
          round{' '}
          <strong key={round} className="anim-bump" style={{ display: 'inline-block', fontWeight: 400 }}>
            {round}
          </strong>{' '}
          / {MAX_ROUNDS}
        </span>
      </div>
      <div style={{ position: 'relative', background: '#fffdf8', borderRadius: 6 }}>
        <canvas
          ref={canvasRef}
          width={GRID}
          height={GRID}
          style={{ position: 'absolute', ...inner, pointerEvents: 'none' }}
        />
        <PlotSvg
          frame={frame}
          style={{ width: '100%', height: 'auto', display: 'block', background: 'transparent', position: 'relative' }}
        >
          <Axes frame={frame} xLabel="feature 1" yLabel="feature 2" />
          {/* stump threshold lines: newest solid graphite, older faint dashed */}
          {roundStats.slice(0, round).map(({ stump }, t) => {
            const newest = t === round - 1;
            const stroke = newest ? 'var(--graphite)' : 'var(--line)';
            const width = newest ? 1.6 : 1.1;
            const dash = newest ? undefined : '4 4';
            // the newest stump draws itself across the plot
            const len = stump.axis === 'x' ? y1 - y0 : x1 - x0;
            const drawProps = newest
              ? {
                  className: 'mlw-stump-new',
                  style: { ['--mlw-len' as string]: `${len}`, strokeDasharray: len } as React.CSSProperties,
                }
              : {};
            return stump.axis === 'x' ? (
              <line
                key={t}
                {...drawProps}
                x1={frame.sx(stump.threshold)}
                y1={y0}
                x2={frame.sx(stump.threshold)}
                y2={y1}
                stroke={stroke}
                strokeWidth={width}
                strokeDasharray={dash}
              />
            ) : (
              <line
                key={t}
                {...drawProps}
                x1={x0}
                y1={frame.sy(stump.threshold)}
                x2={x1}
                y2={frame.sy(stump.threshold)}
                stroke={stroke}
                strokeWidth={width}
                strokeDasharray={dash}
              />
            );
          })}
          {pts.map((p, i) => {
            const r = Math.max(3, Math.min(11, 4.2 * Math.sqrt(weightsNow[i] * pts.length)));
            return (
              // .mlw-weighted eases the radius, so re-weighted points swell instead of jumping
              <g key={i} className="mlw-weighted">
                <Dot x={frame.sx(p.x)} y={frame.sy(p.y)} cls={p.label === 1 ? 'a' : 'b'} r={r} />
                {misclassified[i] && (
                  <circle
                    className="anim-fade"
                    cx={frame.sx(p.x)}
                    cy={frame.sy(p.y)}
                    r={r + 4}
                    fill="none"
                    stroke="var(--graphite)"
                    strokeWidth={1.2}
                    strokeDasharray="3 2"
                  />
                )}
              </g>
            );
          })}
        </PlotSvg>
      </div>
      <p style={{ margin: '10px 0 6px', fontSize: '0.95rem' }}>
        {round === 0 ? (
          <>No stumps yet — the committee room is empty.</>
        ) : combinedErrors === 0 ? (
          <strong className="anim-pop" style={{ display: 'inline-block' }}>
            0 combined training errors in {round} rounds — the weighted vote nailed it.
          </strong>
        ) : (
          <>
            Combined training errors:{' '}
            <strong key={combinedErrors} className="anim-bump" style={{ display: 'inline-block' }}>
              {combinedErrors}
            </strong>
          </>
        )}
      </p>
      {round > 0 && (
        <div
          style={{
            maxHeight: 132,
            overflowY: 'auto',
            border: '1px solid var(--line)',
            borderRadius: 6,
            padding: '4px 10px',
          }}
        >
          <table style={{ width: '100%', fontSize: '0.85rem', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: 'var(--graphite)', textAlign: 'left' }}>
                <th style={{ padding: '2px 6px' }}>round</th>
                <th style={{ padding: '2px 6px' }}>split</th>
                <th style={{ padding: '2px 6px' }}>weighted error ε</th>
                <th style={{ padding: '2px 6px' }}>vote α</th>
              </tr>
            </thead>
            <tbody>
              {roundStats.slice(0, round).map(({ stump, eps, alpha }, t) => (
                // each newly mounted round row slides in from the right
                <tr key={t} className="anim-slide-left" style={{ fontWeight: t === round - 1 ? 700 : 400 }}>
                  <td style={{ padding: '2px 6px' }}>{t + 1}</td>
                  <td style={{ padding: '2px 6px' }}>
                    {stump.axis} &gt; {stump.threshold.toFixed(2)} ⇒ {stump.above === 1 ? '●' : '○'}
                  </td>
                  <td style={{ padding: '2px 6px' }}>{eps.toFixed(3)}</td>
                  <td style={{ padding: '2px 6px' }}>{alpha.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </WidgetFrame>
  );
}

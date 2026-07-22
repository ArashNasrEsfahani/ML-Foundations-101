import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { makeFrame, Axes, Dot, PlotSvg } from '../Plot';
import { imbalanced2d, oversample, undersample, type ImbPt } from '../../../content/datasets/imbalanced2d';

const W = 420;
const H = 340;
const GRID = 60;
const SIGMA = 0.7; // kernel width of the weighted radial-vote classifier
const OVER_FACTOR = 8;
const UNDER_KEEP = 0.15;
const CLASS_WEIGHT = 19; // = 95 majority / 5 minority
const OVER_SEED = 80802;
const UNDER_SEED = 80803;

type Strategy = 'none' | 'oversample' | 'undersample' | 'weights';

const STRATEGIES: { id: Strategy; label: string }[] = [
  { id: 'none', label: 'none' },
  { id: 'oversample', label: `oversample ×${OVER_FACTOR}` },
  { id: 'undersample', label: 'undersample' },
  { id: 'weights', label: `class weights ×${CLASS_WEIGHT}` },
];

/**
 * 95 majority points (open) vs 5 clustered minority points (filled).
 * A deterministic weighted radial-vote classifier is refit per strategy:
 * score(q) = Σ w_i · y_i · exp(−‖q−x_i‖² / 2σ²), predict its sign.
 * Tiny local counters compute overall accuracy and minority recall.
 */
export function ImbalanceLab({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const base = useMemo(() => imbalanced2d(), []);
  const [strategy, setStrategy] = useState<Strategy>('none');
  // stacked rasters so switching strategy cross-fades the decision wash
  const canvasA = useRef<HTMLCanvasElement>(null);
  const canvasB = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef(1);
  const [front, setFront] = useState(1);

  const frame = makeFrame(W, H, [0, 10], [0, 10]);

  const { train, weights } = useMemo(() => {
    if (strategy === 'oversample') {
      const t = oversample(base, OVER_FACTOR, OVER_SEED);
      return { train: t, weights: t.map(() => 1) };
    }
    if (strategy === 'undersample') {
      const t = undersample(base, UNDER_KEEP, UNDER_SEED);
      return { train: t, weights: t.map(() => 1) };
    }
    if (strategy === 'weights') {
      return { train: base, weights: base.map((p) => (p.label === 1 ? CLASS_WEIGHT : 1)) };
    }
    return { train: base, weights: base.map(() => 1) };
  }, [strategy, base]);

  const predict = useMemo(() => {
    const inv = 1 / (2 * SIGMA * SIGMA);
    return (q: { x: number; y: number }): 1 | -1 => {
      let s = 0;
      for (let i = 0; i < train.length; i++) {
        const dx = train[i].x - q.x;
        const dy = train[i].y - q.y;
        s += weights[i] * train[i].label * Math.exp(-(dx * dx + dy * dy) * inv);
      }
      return s >= 0 ? 1 : -1;
    };
  }, [train, weights]);

  // evaluate on the ORIGINAL data — resampling changes the training set, not the truth
  const metrics = useMemo(() => {
    let correct = 0;
    let minorityTotal = 0;
    let minorityCaught = 0;
    for (const p of base) {
      const pred = predict(p);
      if (pred === p.label) correct++;
      if (p.label === 1) {
        minorityTotal++;
        if (pred === 1) minorityCaught++;
      }
    }
    return {
      acc: correct / base.length,
      correct,
      recall: minorityTotal === 0 ? 0 : minorityCaught / minorityTotal,
      minorityCaught,
      minorityTotal,
    };
  }, [base, predict]);

  // which majority points survived undersampling (for faded rendering)
  const keptSet = useMemo(() => new Set<ImbPt>(train), [train]);

  useEffect(() => {
    const back = frontRef.current === 0 ? canvasB.current : canvasA.current;
    const ctx = back?.getContext('2d');
    if (!back || !ctx) return;
    const img = ctx.createImageData(GRID, GRID);
    for (let r = 0; r < GRID; r++) {
      const y = 10 - ((r + 0.5) / GRID) * 10;
      for (let c = 0; c < GRID; c++) {
        const x = ((c + 0.5) / GRID) * 10;
        const frac = predict({ x, y }) === 1 ? 1 : 0;
        const i = (r * GRID + c) * 4;
        img.data[i] = 52;
        img.data[i + 1] = 52;
        img.data[i + 2] = 52;
        img.data[i + 3] = Math.round(12 + 58 * frac); // darker wash = predicted minority region
      }
    }
    ctx.putImageData(img, 0, 0);
    frontRef.current = frontRef.current === 0 ? 1 : 0;
    setFront(frontRef.current);
  }, [predict]);

  const goalMet = metrics.recall >= 0.8 && metrics.acc >= 0.7;
  useEffect(() => {
    if (goalMet) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalMet]);

  const reset = () => setStrategy('none');

  const inner = {
    left: `${(frame.pad.l / W) * 100}%`,
    top: `${(frame.pad.t / H) * 100}%`,
    width: `${((W - frame.pad.l - frame.pad.r) / W) * 100}%`,
    height: `${((H - frame.pad.t - frame.pad.b) / H) * 100}%`,
  };

  return (
    <WidgetFrame
      title="Rescue the minority class"
      intro={
        <>
          95 open circles (majority) vs 5 filled dots (minority). The classifier is refit for each
          strategy; the shaded wash is the region it would call “minority”. Predicting majority
          everywhere already scores 95% accuracy — that’s the trap.
        </>
      }
      guide={[
        {
          control: 'none',
          what: 'Train on the [[imbalanced-dataset]] as it stands. The five minority points are outvoted everywhere, so the wash collapses and recall sits at zero.',
        },
        {
          control: 'oversample ×8',
          what: 'Duplicates each minority point eight times before training — see [[oversampling]]. No new information arrives; the same five points now carry eight votes each.',
        },
        {
          control: 'undersample',
          what: 'Throws away most of the majority class instead, keeping about 15% of it. Faded circles are the ones dropped: the balance improves and a lot of real data goes in the bin.',
        },
        {
          control: 'class weights ×19',
          what: 'Keeps every point but makes one minority point count as 19 majority ones — see [[class-weights]]. Same rebalancing, no copying and no discarding.',
        },
        {
          control: 'reset',
          what: 'Back to the untouched, unbalanced training set.',
        },
        {
          control: 'the shaded wash',
          what: 'Where the classifier would predict the minority class. Under *none* it barely exists; each strategy inflates it, and too much inflation is what costs accuracy.',
        },
        {
          control: 'overall accuracy',
          what: 'Share of all 100 points labelled correctly, always scored on the original data — resampling changes what the model trains on, never the truth. 95% here means nothing on its own.',
        },
        {
          control: 'minority recall',
          what: 'Of the 5 real minority points, how many were caught — see [[recall]]. This is the number the whole exercise is about; the goal is 0.8 or better without letting accuracy fall under 70%.',
        },
      ]}
      onReset={reset}
      challenge={challenge}
      challengeDone={done}
    >
      <style>{`.mlw-imb-dot circle { transition: opacity 0.35s ease; }`}</style>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
        {STRATEGIES.map((s) => (
          <button
            key={s.id}
            className={strategy === s.id ? 'primary' : ''}
            onClick={() => setStrategy(s.id)}
            style={{ padding: '5px 12px', fontSize: '0.88rem' }}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div style={{ position: 'relative', background: '#fffdf8', borderRadius: 6 }}>
        <canvas
          ref={canvasA}
          width={GRID}
          height={GRID}
          style={{
            position: 'absolute',
            ...inner,
            pointerEvents: 'none',
            opacity: front === 0 ? 1 : 0,
            transition: 'opacity 300ms ease',
          }}
        />
        <canvas
          ref={canvasB}
          width={GRID}
          height={GRID}
          style={{
            position: 'absolute',
            ...inner,
            pointerEvents: 'none',
            opacity: front === 1 ? 1 : 0,
            transition: 'opacity 300ms ease',
          }}
        />
        <PlotSvg
          frame={frame}
          style={{ width: '100%', height: 'auto', display: 'block', background: 'transparent', position: 'relative' }}
        >
          <Axes frame={frame} xLabel="feature 1" yLabel="feature 2" />
          {base.map((p, i) =>
            p.label === 1 ? (
              // minority points re-pop on every strategy change — most visibly when
              // oversampling multiplies them
              <g
                key={`m${i}-${strategy}`}
                className="anim-pop"
                style={{ transformBox: 'fill-box', transformOrigin: 'center', animationDelay: `${i * 55}ms` }}
              >
                <Dot x={frame.sx(p.x)} y={frame.sy(p.y)} cls="a" r={5.5} />
              </g>
            ) : (
              // majority points ease their fade when undersampling drops them
              <g key={`j${i}`} className="mlw-imb-dot">
                <Dot
                  x={frame.sx(p.x)}
                  y={frame.sy(p.y)}
                  cls="b"
                  r={4}
                  faded={strategy === 'undersample' && !keptSet.has(p)}
                />
              </g>
            ),
          )}
        </PlotSvg>
      </div>
      <table style={{ width: '100%', margin: '10px 0 0', fontSize: '0.92rem', borderCollapse: 'collapse' }}>
        <tbody>
          <tr>
            <td style={{ padding: '3px 8px', color: 'var(--graphite)' }}>overall accuracy</td>
            <td style={{ padding: '3px 8px' }}>
              <strong
                key={`a${metrics.correct}`}
                className="anim-bump"
                style={{ display: 'inline-block' }}
              >
                {(metrics.acc * 100).toFixed(0)}%
              </strong>{' '}
              <span style={{ color: 'var(--graphite)' }}>
                ({metrics.correct}/{base.length})
              </span>
            </td>
          </tr>
          <tr>
            <td style={{ padding: '3px 8px', color: 'var(--graphite)' }}>minority recall</td>
            <td style={{ padding: '3px 8px' }}>
              <strong
                key={`r${metrics.minorityCaught}`}
                className="anim-bump"
                style={{ display: 'inline-block' }}
              >
                {metrics.recall.toFixed(2)}
              </strong>{' '}
              <span style={{ color: 'var(--graphite)' }}>
                ({metrics.minorityCaught}/{metrics.minorityTotal} caught)
              </span>
            </td>
          </tr>
        </tbody>
      </table>
      <p style={{ margin: '8px 0 0', fontSize: '0.95rem' }}>
        {goalMet ? (
          <strong className="anim-pop" style={{ display: 'inline-block' }}>
            Minority rescued — recall ≥ 0.8 and accuracy still ≥ 70%.
          </strong>
        ) : metrics.recall < 0.8 ? (
          <>High accuracy, but the minority is being sacrificed. Try a strategy.</>
        ) : (
          <>Recall is up, but accuracy collapsed — a gentler rebalance would help.</>
        )}
      </p>
    </WidgetFrame>
  );
}

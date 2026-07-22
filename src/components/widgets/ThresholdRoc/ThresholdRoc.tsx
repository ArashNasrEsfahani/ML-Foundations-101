import React, { useEffect, useMemo, useState } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { makeFrame, Axes, PlotSvg } from '../Plot';
import { useSvgDrag } from '../../../hooks/useDrag';
import { scores1d } from '../../../content/datasets/scores1d';
import { confusionCounts, precision, recall, accuracy, rocPoints, auc } from '../../../lib/ml/metrics';
import { linearScale, clamp } from '../../../lib/math/scales';

const W = 420;
const H_STRIP = 250;
const H_ROC = 320;
const START_T = 0.5;

// strip pane layout (pixel space)
const STRIP_L = 26;
const STRIP_R = 398;
const POS_BASE = 104; // positives stack upward from here
const NEG_BASE = 132; // negatives stack downward from here
const STACK_DY = 9.5;
const AXIS_Y = 232;

const cellStyle: React.CSSProperties = {
  border: '1px solid var(--line)',
  padding: '4px 12px',
  textAlign: 'center',
  fontSize: '0.9rem',
};
const headStyle: React.CSSProperties = {
  ...cellStyle,
  color: 'var(--graphite)',
  fontSize: '0.78rem',
  fontStyle: 'italic',
};

/**
 * A number that pops whenever it changes. Re-keying on the value remounts the
 * element, which restarts the bump — counts only move when a dot crosses the
 * threshold, so this reads as a tick, not a strobe.
 */
function Count({ v }: { v: number | string }) {
  return (
    <strong key={String(v)} className="anim-bump" style={{ display: 'inline-block' }}>
      {v}
    </strong>
  );
}

/**
 * Drag a decision threshold across two overlapping score distributions;
 * the confusion matrix, precision/recall/accuracy and the ROC ball react live.
 */
export function ThresholdRoc({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const data = useMemo(() => scores1d(), []);
  const [threshold, setThreshold] = useState(START_T);

  const sxStrip = useMemo(() => linearScale([0, 1], [STRIP_L, STRIP_R]), []);

  // stack index per example so the strips read as dot histograms
  const stacks = useMemo(() => {
    const counts = new Map<string, number>();
    return data.map((s) => {
      const key = `${s.label}:${Math.floor(s.score / 0.025)}`;
      const lvl = counts.get(key) ?? 0;
      counts.set(key, lvl + 1);
      return lvl;
    });
  }, [data]);

  const roc = useMemo(() => rocPoints(data), [data]);
  const aucVal = useMemo(() => auc(roc), [roc]);

  const c = confusionCounts(data, threshold);
  const prec = precision(c);
  const rec = recall(c); // = TPR
  const acc = accuracy(c);
  const fpr = c.fp + c.tn === 0 ? 0 : c.fp / (c.fp + c.tn);

  const goalMet = rec >= 0.9 && fpr <= 0.2;
  useEffect(() => {
    if (goalMet) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalMet]);

  const dragProps = useSvgDrag((px) => {
    setThreshold(clamp(sxStrip.invert(px), 0.01, 0.99));
  });

  const rocFrame = makeFrame(W, H_ROC, [0, 1], [0, 1]);
  const tx = sxStrip(threshold);

  // shaded area under the ROC curve
  const aucPath = useMemo(() => {
    const pts = roc.map((p) => `L ${rocFrame.sx(p.fpr).toFixed(2)} ${rocFrame.sy(p.tpr).toFixed(2)}`);
    return `M ${rocFrame.sx(0)} ${rocFrame.sy(0)} ${pts.join(' ')} L ${rocFrame.sx(1)} ${rocFrame.sy(0)} Z`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roc]);
  const rocPath = useMemo(
    () =>
      roc
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${rocFrame.sx(p.fpr).toFixed(2)} ${rocFrame.sy(p.tpr).toFixed(2)}`)
        .join(' '),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [roc],
  );

  return (
    <WidgetFrame
      title="One threshold, every metric"
      intro={
        <>
          Each dot is one example with the model&rsquo;s confidence score: filled = actually spam,
          open = actually normal. Drag the vertical line — everything to its <em>right</em> gets
          predicted spam.
        </>
      }
      guide={[
        {
          control: 'drag the ◆ handle',
          what: 'Moves the [[decision-threshold]] *t* across the score axis. The model’s scores never change; you are only choosing where to cut them into a yes and a no.',
        },
        {
          control: 'reset',
          what: 'Puts the threshold back at t = 0.50, the default nobody should accept without checking.',
        },
        {
          control: 'the shaded region',
          what: 'Everything the model calls spam at this threshold. Drag left and it swallows more of both distributions.',
        },
        {
          control: 'TP · FN · FP · TN',
          what: 'The [[confusion-matrix]]: correctly caught spam, missed spam, false alarms, correctly passed mail. All four counts total 100 whatever the threshold — they only trade places.',
        },
        {
          control: 'precision',
          what: '[[precision]] — of everything flagged spam, the share that really was: `TP / (TP + FP)`. Raise the threshold and it climbs, because only the confident flags survive.',
        },
        {
          control: 'recall (TPR)',
          what: '[[recall]] — of all the real spam, the share caught: `TP / (TP + FN)`. It is the same number as the true positive rate on the ROC axis.',
        },
        {
          control: 'accuracy',
          what: 'Share of all 100 examples labeled correctly. It hides the trade the other two show, which is why it is the last number to look at.',
        },
        {
          control: 'the ROC curve',
          what: 'Every threshold at once, plotted as (FPR, TPR) — see [[roc-curve]]. The ball is your current threshold; dragging the handle slides it along the fixed curve.',
        },
        {
          control: 'AUC',
          what: 'Area under that curve — see [[auc]]. 1.0 is a model that ranks every spam above every non-spam, 0.5 is a coin flip, and it does not depend on the threshold at all.',
        },
        {
          control: 'the dashed diagonal',
          what: 'Where a model that guesses at random would sit. Any curve hugging it carries no information.',
        },
        {
          control: 'the dashed box',
          what: 'The challenge region: TPR ≥ 0.9 with FPR ≤ 0.2. Steer the ball into it.',
        },
      ]}
      onReset={() => setThreshold(START_T)}
      challenge={challenge}
      challengeDone={done}
    >

      {/* Pane A: score strips + draggable threshold */}
      <svg
        viewBox={`0 0 ${W} ${H_STRIP}`}
        {...dragProps}
        style={{
          width: '100%',
          height: 'auto',
          display: 'block',
          background: '#fffdf8',
          borderRadius: 6,
          touchAction: 'none',
        }}
      >
        {/* predicted-positive region */}
        <rect x={tx} y={26} width={Math.max(0, STRIP_R + 8 - tx)} height={AXIS_Y - 26} fill="var(--graphite)" opacity={0.08} />
        <text x={STRIP_L} y={18} fontSize={11} fill="var(--graphite)" fontStyle="italic">
          actual spam (positive) — filled
        </text>
        {data.map((s, i) =>
          s.label === 1 ? (
            <circle key={i} cx={sxStrip(s.score)} cy={POS_BASE - stacks[i] * STACK_DY} r={4} fill="var(--ink)" />
          ) : (
            <circle
              key={i}
              cx={sxStrip(s.score)}
              cy={NEG_BASE + stacks[i] * STACK_DY}
              r={4}
              fill="#fffdf8"
              stroke="var(--ink)"
              strokeWidth={1.5}
            />
          ),
        )}
        <text x={STRIP_L} y={224} fontSize={11} fill="var(--graphite)" fontStyle="italic">
          actual not-spam (negative) — open
        </text>
        {/* score axis */}
        <line x1={STRIP_L} y1={AXIS_Y} x2={STRIP_R} y2={AXIS_Y} stroke="var(--ink)" strokeWidth={1.3} />
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <line x1={sxStrip(t)} y1={AXIS_Y} x2={sxStrip(t)} y2={AXIS_Y + 4} stroke="var(--graphite)" strokeWidth={1} />
            <text x={sxStrip(t)} y={AXIS_Y + 15} textAnchor="middle" fontSize={10} fill="var(--graphite)">
              {t}
            </text>
          </g>
        ))}
        {/* threshold line + handle */}
        <line x1={tx} y1={26} x2={tx} y2={AXIS_Y} stroke="var(--ink)" strokeWidth={2.2} />
        <rect
          x={tx - 7}
          y={26}
          width={14}
          height={14}
          fill="#fffdf8"
          stroke="var(--ink)"
          strokeWidth={1.8}
          transform={`rotate(45 ${tx} ${33})`}
          style={{ cursor: 'grab' }}
        />
        <text
          x={tx}
          y={58}
          textAnchor="middle"
          fontSize={11}
          fill="var(--ink)"
          style={{ pointerEvents: 'none' }}
        >
          t = {threshold.toFixed(2)}
        </text>
      </svg>

      {/* confusion matrix + metric readouts */}
      <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center', margin: '12px 0' }}>
        <table style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={headStyle}></th>
              <th style={headStyle}>predicted spam</th>
              <th style={headStyle}>predicted not-spam</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <th style={headStyle}>actual spam</th>
              <td style={cellStyle}>
                <Count v={c.tp} /> <span style={{ color: 'var(--graphite)', fontSize: '0.78rem' }}>TP</span>
              </td>
              <td style={cellStyle}>
                <Count v={c.fn} /> <span style={{ color: 'var(--graphite)', fontSize: '0.78rem' }}>FN</span>
              </td>
            </tr>
            <tr>
              <th style={headStyle}>actual not-spam</th>
              <td style={cellStyle}>
                <Count v={c.fp} /> <span style={{ color: 'var(--graphite)', fontSize: '0.78rem' }}>FP</span>
              </td>
              <td style={cellStyle}>
                <Count v={c.tn} /> <span style={{ color: 'var(--graphite)', fontSize: '0.78rem' }}>TN</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div style={{ fontSize: '0.95rem', lineHeight: 1.9 }}>
          precision <Count v={prec.toFixed(2)} />
          <br />
          recall (TPR) <Count v={rec.toFixed(2)} />
          <br />
          accuracy <Count v={acc.toFixed(2)} />
        </div>
      </div>

      {/* Pane B: ROC curve */}
      <PlotSvg frame={rocFrame}>
        <Axes frame={rocFrame} xLabel="false positive rate" yLabel="true positive rate" />
        {/* the AUC shading washes in on first render — the fade lives on the
            wrapper so it can't clobber the path's own 0.13 opacity */}
        <g className="anim-fade">
          <path d={aucPath} fill="var(--graphite)" opacity={0.13} />
        </g>
        <line
          x1={rocFrame.sx(0)}
          y1={rocFrame.sy(0)}
          x2={rocFrame.sx(1)}
          y2={rocFrame.sy(1)}
          stroke="var(--graphite)"
          strokeWidth={1.1}
          strokeDasharray="4 4"
        />
        <path d={rocPath} fill="none" stroke="var(--ink)" strokeWidth={2.2} strokeLinejoin="round" />
        {/* goal region hint */}
        <rect
          x={rocFrame.sx(0)}
          y={rocFrame.sy(1)}
          width={rocFrame.sx(0.2) - rocFrame.sx(0)}
          height={rocFrame.sy(0.9) - rocFrame.sy(1)}
          fill="none"
          stroke="var(--graphite)"
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        {/* current operating point — glides along the curve as the threshold drags */}
        <circle
          className="mark-move-fast"
          cx={rocFrame.sx(fpr)}
          cy={rocFrame.sy(rec)}
          r={6.5}
          fill="var(--ink)"
          stroke="#fffdf8"
          strokeWidth={1.6}
        />
        <text x={rocFrame.sx(0.62)} y={rocFrame.sy(0.06)} fontSize={13} fill="var(--ink)">
          AUC = {aucVal.toFixed(2)}
        </text>
      </PlotSvg>

      <p style={{ margin: '10px 0 0', fontSize: '0.95rem' }}>
        At t = {threshold.toFixed(2)}: TPR <Count v={rec.toFixed(2)} />, FPR{' '}
        <Count v={fpr.toFixed(2)} />.{' '}
        {goalMet ? (
          <strong className="anim-pop" style={{ display: 'inline-block' }}>
            Inside the dashed goal box — high recall at a low false-alarm rate.
          </strong>
        ) : (
          <>Steer the ball into the dashed box: TPR ≥ 0.9 with FPR ≤ 0.2.</>
        )}
      </p>
    </WidgetFrame>
  );
}

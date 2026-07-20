import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { makeFrame, Axes, PlotSvg } from '../Plot';
import { EquationReadout, fmt, texSum } from '../EquationReadout';
import { useRaf } from '../../../hooks/useRaf';
import { mulberry32 } from '../../../lib/rng';
import { sigmoid, logLikelihood, ascentStep, type Point1D } from '../../../lib/ml/logreg';
import { clamp } from '../../../lib/math/scales';

const W = 420;
const H = 280;
const W_MIN = -2;
const W_MAX = 3;
const B_MIN = -15;
const B_MAX = 5;
const START = { w: 0.3, b: 0 };
const CLIMB_FRAMES = 90; // one animation frame per tick, 4 ascent steps each

/** 12 seeded 1D points labeled by a threshold, with the 2 nearest-to-threshold labels flipped. */
function makeData(): Point1D[] {
  const rand = mulberry32(51015);
  const pts: Point1D[] = [];
  for (let i = 0; i < 12; i++) {
    const x = 0.5 + (9 * i) / 11 + (rand() - 0.5) * 0.4;
    pts.push({ x, label: x > 5.1 ? 1 : 0 });
  }
  const byDist = pts
    .map((p, i) => ({ i, d: Math.abs(p.x - 5.1) }))
    .sort((a, b) => a.d - b.d);
  for (const { i } of byDist.slice(0, 2)) {
    pts[i] = { ...pts[i], label: pts[i].label === 1 ? 0 : 1 };
  }
  return pts;
}

/**
 * Bend the sigmoid over noisy 1D data and watch the log-likelihood climb.
 * Filled dots are currently classified correctly; open dots are mistakes, and
 * the two states cross-fade so a point visibly *flips* rather than blinking.
 */
export function SigmoidExplorer({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const pts = useMemo(() => makeData(), []);
  const [wb, setWb] = useState(START);
  const [fitting, setFitting] = useState(false);
  const framesLeft = useRef(0);

  const frame = makeFrame(W, H, [0, 10], [-0.18, 1.18]);
  const ll = logLikelihood(pts, wb.w, wb.b);

  const hit = ll > -6;
  useEffect(() => {
    if (hit) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hit]);

  // gradient ascent, one frame per tick so the curve sweeps instead of hopping
  useRaf(() => {
    setWb((cur) => {
      let { w, b } = cur;
      for (let i = 0; i < 4; i++) ({ w, b } = ascentStep(pts, w, b, 0.01));
      return { w: clamp(w, W_MIN, W_MAX), b: clamp(b, B_MIN, B_MAX) };
    });
    framesLeft.current -= 1;
    if (framesLeft.current <= 0) setFitting(false);
  }, fitting);

  const climb = () => {
    framesLeft.current = CLIMB_FRAMES;
    setFitting(true);
  };

  // sigmoid curve path
  const path = useMemo(() => {
    const parts: string[] = [];
    for (let i = 0; i <= 84; i++) {
      const x = (10 * i) / 84;
      const y = sigmoid(wb.w * x + wb.b);
      parts.push(`${i === 0 ? 'M' : 'L'} ${frame.sx(x).toFixed(1)} ${frame.sy(y).toFixed(1)}`);
    }
    return parts.join(' ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wb]);

  // decision line where σ = 0.5, i.e. wx + b = 0
  const xStar = Math.abs(wb.w) > 1e-6 ? -wb.b / wb.w : NaN;
  const showStar = Number.isFinite(xStar) && xStar >= 0 && xStar <= 10;

  const correctCount = pts.filter(
    (p) => (sigmoid(wb.w * p.x + wb.b) >= 0.5 ? 1 : 0) === p.label,
  ).length;

  const reset = () => {
    setFitting(false);
    framesLeft.current = 0;
    setWb(START);
  };

  const sliderRow = (
    label: string,
    value: number,
    min: number,
    max: number,
    step: number,
    set: (v: number) => void,
  ) => (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 180px' }}>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '0.85rem',
          width: 76,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {label} = {fmt(value)}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={fitting}
        onChange={(e) => set(Number(e.target.value))}
        style={{ flex: 1 }}
      />
    </label>
  );

  // f(x) = 1 / (1 + e^{-(0.30 x + 1.20)})
  const exponent = texSum([{ coef: wb.w, sym: 'x' }, { coef: wb.b }]);
  const substituted = `f(x) = \\frac{1}{1 + e^{-(${exponent})}}`;

  return (
    <WidgetFrame
      title="Squash the line into a probability"
      onReset={reset}
      challenge={challenge}
      challengeDone={done}
    >
      <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: 'var(--graphite)' }}>
        Each dot is one example: bottom row means label 0, top row means label 1. The curve is
        σ(wx + b). <strong>Filled</strong> dots are classified correctly right now, <strong>open</strong>{' '}
        dots are not. Two of the twelve labels are noisy — no curve gets everything.
      </p>
      <PlotSvg frame={frame}>
        <Axes frame={frame} xLabel="feature x" yLabel="p(y = 1)" />
        {/* 0.5 threshold guide */}
        <line
          x1={frame.sx(0)}
          y1={frame.sy(0.5)}
          x2={frame.sx(10)}
          y2={frame.sy(0.5)}
          stroke="var(--line)"
          strokeWidth={1}
          strokeDasharray="2 4"
        />
        {/* decision boundary */}
        {showStar && (
          <g>
            <line
              x1={frame.sx(xStar)}
              y1={frame.sy(-0.12)}
              x2={frame.sx(xStar)}
              y2={frame.sy(1.12)}
              stroke="var(--graphite)"
              strokeWidth={1.2}
              strokeDasharray="6 5"
            />
            <text
              x={frame.sx(xStar) + 5}
              y={frame.sy(1.09)}
              fontSize={10}
              fill="var(--graphite)"
              fontStyle="italic"
            >
              σ = 0.5
            </text>
          </g>
        )}
        {/* sigmoid curve */}
        <path d={path} fill="none" stroke="var(--ink)" strokeWidth={2.2} strokeLinecap="round" />
        {/* data: the filled and open forms are stacked and cross-faded, so a point
            changing its mind reads as a flip rather than a hard swap. */}
        {pts.map((p, i) => {
          const correct = (sigmoid(wb.w * p.x + wb.b) >= 0.5 ? 1 : 0) === p.label;
          const cx = frame.sx(p.x);
          const cy = frame.sy(p.label);
          return (
            <g key={i}>
              <circle cx={cx} cy={cy} r={6.5} fill="#fffdf8" stroke="#fffdf8" strokeWidth={3} />
              <circle
                className="mark-move"
                cx={cx}
                cy={cy}
                r={6}
                fill="#fffdf8"
                stroke="var(--ink)"
                strokeWidth={1.6}
                opacity={correct ? 0 : 1}
              />
              <circle
                className="mark-move"
                cx={cx}
                cy={cy}
                r={6}
                fill="var(--ink)"
                opacity={correct ? 1 : 0}
              />
            </g>
          );
        })}
      </PlotSvg>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', margin: '10px 0 0' }}>
        {sliderRow('w', wb.w, W_MIN, W_MAX, 0.05, (v) => setWb((c) => ({ ...c, w: v })))}
        {sliderRow('b', wb.b, B_MIN, B_MAX, 0.1, (v) => setWb((c) => ({ ...c, b: v })))}
      </div>

      <EquationReadout
        symbolic="f(x) = \frac{1}{1 + e^{-(wx + b)}}"
        substituted={substituted}
        stats={[
          { label: 'w', value: fmt(wb.w) },
          { label: 'b', value: fmt(wb.b) },
          { label: 'log-lik.', value: fmt(ll), emphasis: true },
          { label: 'σ = 0.5 at x', value: showStar ? fmt(xStar) : '—' },
        ]}
        note="The curve crosses 0.5 exactly where wx + b = 0, i.e. at x = −b/w."
      />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          flexWrap: 'wrap',
          marginTop: 10,
          fontSize: '0.95rem',
        }}
      >
        <span style={{ color: 'var(--graphite)' }}>{correctCount}/12 classified correctly</span>
        <span style={{ flex: 1 }} />
        <button onClick={climb} disabled={fitting}>
          <span key={fitting ? 'go' : 'idle'} className="anim-pop" style={{ display: 'inline-block' }}>
            {fitting ? 'climbing…' : 'gradient ascent'}
          </span>
        </button>
      </div>
    </WidgetFrame>
  );
}

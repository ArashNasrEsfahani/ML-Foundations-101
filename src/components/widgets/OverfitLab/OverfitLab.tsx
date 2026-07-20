import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { makeFrame, Axes, Dot, PlotSvg } from '../Plot';
import { wavepoints } from '../../../content/datasets/wavepoints';
import { fitPoly, predictPoly, mse } from '../../../lib/ml/polyfit';

const W = 420;
const H_FIT = 300;
const H_ERR = 230;
const MAX_DEGREE = 12;
const START_DEGREE = 1;
/** RMSE values above this are drawn clipped at the top of the error pane */
const ERR_CAP = 0.45;

/**
 * Capacity dial for a tiny regression problem: fit polynomials of degree 0–12
 * to 14 noisy training points, watch train error fall forever while
 * validation error traces a U — and find its bottom.
 */
export function OverfitLab({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const data = useMemo(() => wavepoints(), []);

  // one fit per degree, precomputed (train/val as RMSE for readable numbers)
  const fits = useMemo(
    () =>
      Array.from({ length: MAX_DEGREE + 1 }, (_, d) => {
        const coeffs = fitPoly(data.train, d);
        return {
          coeffs,
          train: Math.sqrt(mse(coeffs, data.train)),
          val: Math.sqrt(mse(coeffs, data.validation)),
        };
      }),
    [data],
  );
  const best = useMemo(
    () => fits.reduce((bi, f, i) => (f.val < fits[bi].val ? i : bi), 0),
    [fits],
  );

  const [degree, setDegree] = useState(START_DEGREE);
  const [visited, setVisited] = useState<Set<number>>(() => new Set([START_DEGREE]));
  useEffect(() => {
    setVisited((v) => (v.has(degree) ? v : new Set(v).add(degree)));
  }, [degree]);

  const othersVisited = [...visited].filter((d) => d !== best).length;
  const goalMet = degree === best && othersVisited >= 3;
  useEffect(() => {
    if (goalMet) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalMet]);

  const fitFrame = makeFrame(W, H_FIT, [0, 1], [0, 1]);
  const errFrame = makeFrame(W, H_ERR, [0, MAX_DEGREE], [0, ERR_CAP]);

  // fitted curve for the current degree, sampled densely and clipped to the pane
  const curvePath = useMemo(() => {
    const coeffs = fits[degree].coeffs;
    const parts: string[] = [];
    for (let i = 0; i <= 120; i++) {
      const x = i / 120;
      const y = Math.max(-3, Math.min(4, predictPoly(coeffs, x)));
      parts.push(`${i === 0 ? 'M' : 'L'} ${fitFrame.sx(x).toFixed(2)} ${fitFrame.sy(y).toFixed(2)}`);
    }
    return parts.join(' ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [degree, fits]);

  // A path's `d` cannot be transitioned, so changing degree leaves the outgoing
  // curve on screen for one beat to fade out under the incoming one.
  const prevPathRef = useRef(curvePath);
  const ghostKey = useRef(0);
  const [ghost, setGhost] = useState<{ d: string; k: number } | null>(null);
  useEffect(() => {
    if (prevPathRef.current !== curvePath) {
      setGhost({ d: prevPathRef.current, k: ++ghostKey.current });
      prevPathRef.current = curvePath;
    }
  }, [curvePath]);

  const errPath = (key: 'train' | 'val') =>
    fits
      .map(
        (f, d) =>
          `${d === 0 ? 'M' : 'L'} ${errFrame.sx(d).toFixed(2)} ${errFrame
            .sy(Math.min(f[key], ERR_CAP))
            .toFixed(2)}`,
      )
      .join(' ');

  const cur = fits[degree];
  const status =
    degree === best
      ? 'Lowest validation error — this capacity matches the data.'
      : degree < best
        ? 'Too stiff to follow the wave: both errors stay high (underfitting).'
        : 'Train error keeps shrinking, validation error climbs (overfitting).';

  const reset = () => {
    setDegree(START_DEGREE);
    setVisited(new Set([START_DEGREE]));
  };

  return (
    <WidgetFrame
      title="The capacity dial"
      onReset={reset}
      challenge={challenge}
      challengeDone={done}
    >
      <style>{`
        @keyframes mlw-curve-out { from { opacity: 0.55; } to { opacity: 0; } }
        .mlw-curve-out { animation: mlw-curve-out 0.34s ease-out both; }
      `}</style>
      <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: 'var(--graphite)' }}>
        Filled dots are <strong>training</strong> points, open dots are <strong>validation</strong>{' '}
        points the fit never sees. Slide the polynomial degree and watch both error curves.
      </p>
      <PlotSvg frame={fitFrame}>
        <defs>
          <clipPath id="overfitlab-clip">
            <rect
              x={fitFrame.pad.l}
              y={fitFrame.pad.t}
              width={W - fitFrame.pad.l - fitFrame.pad.r}
              height={H_FIT - fitFrame.pad.t - fitFrame.pad.b}
            />
          </clipPath>
        </defs>
        <Axes frame={fitFrame} xLabel="feature x" yLabel="target y" />
        <g clipPath="url(#overfitlab-clip)">
          {ghost && (
            <path
              key={ghost.k}
              className="mlw-curve-out"
              d={ghost.d}
              fill="none"
              stroke="var(--ink)"
              strokeWidth={2.2}
              strokeLinejoin="round"
            />
          )}
          <path
            key={curvePath}
            className="anim-fade"
            d={curvePath}
            fill="none"
            stroke="var(--ink)"
            strokeWidth={2.2}
            strokeLinejoin="round"
          />
          {data.train.map((p, i) => (
            <Dot key={`t${i}`} x={fitFrame.sx(p.x)} y={fitFrame.sy(p.y)} cls="a" r={4.5} />
          ))}
          {data.validation.map((p, i) => (
            <Dot key={`v${i}`} x={fitFrame.sx(p.x)} y={fitFrame.sy(p.y)} cls="b" r={4.5} />
          ))}
        </g>
      </PlotSvg>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '12px 0 6px' }}>
        <span style={{ fontSize: '0.95rem', whiteSpace: 'nowrap' }}>
          degree: <strong>{degree}</strong>
        </span>
        <input
          type="range"
          min={0}
          max={MAX_DEGREE}
          step={1}
          value={degree}
          onChange={(e) => setDegree(Number(e.target.value))}
          aria-label="polynomial degree"
          style={{ flex: 1 }}
        />
      </div>
      <p style={{ margin: '0 0 10px', fontSize: '0.95rem' }}>
        train RMSE{' '}
        <strong key={`t${degree}`} className="anim-bump" style={{ display: 'inline-block' }}>
          {cur.train.toFixed(3)}
        </strong>{' '}
        · validation RMSE{' '}
        <strong key={`v${degree}`} className="anim-bump" style={{ display: 'inline-block' }}>
          {cur.val.toFixed(3)}
        </strong>{' '}
        — {status}
      </p>

      <PlotSvg frame={errFrame}>
        <Axes frame={errFrame} xLabel="polynomial degree" yLabel="error (RMSE)" />
        {/* legend */}
        <g style={{ pointerEvents: 'none' }}>
          <line x1={W - 150} y1={26} x2={W - 122} y2={26} stroke="var(--ink)" strokeWidth={2.2} />
          <text x={W - 116} y={30} fontSize={11} fill="var(--graphite)">
            train
          </text>
          <line
            x1={W - 150}
            y1={44}
            x2={W - 122}
            y2={44}
            stroke="var(--ink)"
            strokeWidth={2.2}
            strokeDasharray="7 5"
          />
          <text x={W - 116} y={48} fontSize={11} fill="var(--graphite)">
            validation
          </text>
        </g>
        {/* current degree marker — slides with the dial */}
        <g className="mark-move" style={{ transform: `translateX(${errFrame.sx(degree)}px)` }}>
          <line
            x1={0}
            y1={errFrame.pad.t}
            x2={0}
            y2={H_ERR - errFrame.pad.b}
            stroke="var(--graphite)"
            strokeWidth={1.1}
            strokeDasharray="3 3"
          />
        </g>
        <path d={errPath('train')} fill="none" stroke="var(--ink)" strokeWidth={2.2} strokeLinejoin="round" />
        <path
          d={errPath('val')}
          fill="none"
          stroke="var(--ink)"
          strokeWidth={2.2}
          strokeDasharray="7 5"
          strokeLinejoin="round"
        />
        {/* off-the-chart markers for clipped validation values */}
        {fits.map((f, d) =>
          f.val > ERR_CAP ? (
            <text
              key={d}
              x={errFrame.sx(d)}
              y={errFrame.pad.t + 10}
              textAnchor="middle"
              fontSize={11}
              fill="var(--graphite)"
            >
              ↑
            </text>
          ) : null,
        )}
        {/* markers at the current degree — they glide along their error curves */}
        <circle
          className="mark-move"
          cx={errFrame.sx(degree)}
          cy={errFrame.sy(Math.min(cur.train, ERR_CAP))}
          r={4.5}
          fill="var(--ink)"
        />
        <circle
          className="mark-move"
          cx={errFrame.sx(degree)}
          cy={errFrame.sy(Math.min(cur.val, ERR_CAP))}
          r={4.5}
          fill="#fffdf8"
          stroke="var(--ink)"
          strokeWidth={1.6}
        />
      </PlotSvg>
      <p style={{ margin: '8px 0 0', fontSize: '0.9rem', color: 'var(--graphite)' }}>
        The solid curve only ever goes down — more capacity always memorizes training data better.
        The dashed curve is the honest judge{fits.some((f) => f.val > ERR_CAP) ? ' (↑ = off the chart)' : ''}.
      </p>
    </WidgetFrame>
  );
}

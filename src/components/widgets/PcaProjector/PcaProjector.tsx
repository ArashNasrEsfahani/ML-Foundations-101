import React, { useEffect, useMemo, useState } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { makeFrame, Axes, PlotSvg } from '../Plot';
import { EquationReadout, fmt } from '../EquationReadout';
import { useSvgDrag } from '../../../hooks/useDrag';
import { elong2d } from '../../../content/datasets/elong2d';
import { pca2, varianceCapturedAlong } from '../../../lib/ml/pca';

const W = 420;
const H = 412; // square plot area: angles on screen match angles in data
const START_ANGLE = 1.92; // ~110°, deliberately far from the true axis
const DEG = 180 / Math.PI;

/**
 * Rotate a projection axis through the data mean and watch how much variance
 * the 1D shadows keep. The best axis is the first principal component.
 *
 * The axis and every projection tick are drawn as *transformed groups* rather
 * than as lines with moving endpoints, so `.mark-move` can ease them. The
 * easing is switched off while the handle is held: direct manipulation must
 * track the pointer exactly, and only released / reset motion gets to glide.
 */
export function PcaProjector({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const pts = useMemo(() => elong2d(), []);
  const pca = useMemo(() => pca2(pts), [pts]);
  const frame = makeFrame(W, H, [0, 10], [0, 10]);

  const [angle, setAngle] = useState(START_ANGLE);
  const [showPCs, setShowPCs] = useState(false);
  const [dragging, setDragging] = useState(false);

  const u = { x: Math.cos(angle), y: Math.sin(angle) };
  const v = { x: -u.y, y: u.x };
  const mean = pca.mean;

  const captured = varianceCapturedAlong(pts, angle);
  const total = pca.var1 + pca.var2;
  const pctOfTotal = (captured / total) * 100;
  const pctOfMax = captured / pca.var1;

  const goalMet = pctOfMax >= 0.9;
  useEffect(() => {
    if (goalMet) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalMet]);

  const dragProps = useSvgDrag((px, py, phase) => {
    if (phase === 'start') setDragging(true);
    if (phase === 'end') setDragging(false);
    const x = frame.sx.invert(px);
    const y = frame.sy.invert(py);
    const dx = x - mean.x;
    const dy = y - mean.y;
    if (Math.hypot(dx, dy) > 0.3) setAngle(Math.atan2(dy, dx));
  });

  // pixels per data unit; the frame is square so x and y share this scale
  const k = frame.sx(1) - frame.sx(0);
  const mx = frame.sx(mean.x);
  const my = frame.sy(mean.y);
  // screen y points down, so a data-space angle θ is −θ on screen
  const screenDeg = -angle * DEG;
  const glide = dragging ? undefined : 'mark-move';

  const pcLine = (theta: number, len: number) => {
    const c = Math.cos(theta);
    const s = Math.sin(theta);
    return {
      x1: frame.sx(mean.x - len * c),
      y1: frame.sy(mean.y - len * s),
      x2: frame.sx(mean.x + len * c),
      y2: frame.sy(mean.y + len * s),
    };
  };

  // θ is an axis direction, so it only means anything modulo 180°
  const thetaDeg = ((angle * DEG) % 180 + 180) % 180;

  return (
    <WidgetFrame
      title="Cast the best shadow"
      onReset={() => {
        setAngle(START_ANGLE);
        setShowPCs(false);
      }}
      challenge={challenge}
      challengeDone={done}
    >
      <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: 'var(--graphite)' }}>
        Drag the square handle to rotate the projection axis through the data mean. Each point
        drops onto the axis; the ticks are the 1D versions of your 2D data. Keep as much spread
        (variance) as you can.
      </p>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
        <button
          className={showPCs ? 'primary' : 'ghost'}
          aria-pressed={showPCs}
          style={{ padding: '5px 10px' }}
          onClick={() => setShowPCs((s) => !s)}
        >
          <span
            key={showPCs ? 'on' : 'off'}
            className="anim-pop"
            style={{ display: 'inline-block' }}
          >
            {showPCs ? 'Hide PCs' : 'Reveal PCs'}
          </span>
        </button>
        <span style={{ fontSize: '0.95rem' }}>
          Captured variance:{' '}
          <strong style={{ fontVariantNumeric: 'tabular-nums' }}>{fmt(pctOfTotal, 1)}%</strong> of
          total
        </span>
        <span
          aria-hidden
          style={{
            display: 'inline-block',
            width: 150,
            height: 5,
            background: 'var(--line)',
            borderRadius: 3,
            transform: 'rotate(-0.6deg)',
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              display: 'block',
              width: `${Math.min(100, pctOfTotal).toFixed(1)}%`,
              height: '100%',
              background: 'var(--ink)',
              borderRadius: 3,
              transition: 'width 120ms linear',
            }}
          />
        </span>
      </div>
      <PlotSvg frame={frame} {...dragProps}>
        <defs>
          <clipPath id="pca-clip">
            <rect
              x={frame.pad.l}
              y={frame.pad.t}
              width={W - frame.pad.l - frame.pad.r}
              height={H - frame.pad.t - frame.pad.b}
            />
          </clipPath>
        </defs>
        <Axes frame={frame} xLabel="feature 1" yLabel="feature 2" />
        <g clipPath="url(#pca-clip)">
          {/* Each projection is one rigid group parked at the point's shadow and
              turned to face along v. In that local frame the drop line and the
              tick are both horizontal, so the whole thing slides along the axis
              with a single transform — which `.mark-move` can ease. */}
          {pts.map((p, i) => {
            const t = (p.x - mean.x) * u.x + (p.y - mean.y) * u.y; // coordinate along u
            const d = (p.x - mean.x) * v.x + (p.y - mean.y) * v.y; // distance along v
            const px = frame.sx(mean.x + t * u.x);
            const py = frame.sy(mean.y + t * u.y);
            return (
              <g
                key={i}
                className={glide}
                transform={`translate(${px.toFixed(2)} ${py.toFixed(2)}) rotate(${(screenDeg - 90).toFixed(2)})`}
              >
                {/* drop line from the shadow back up to the data point */}
                <line
                  x1={0}
                  y1={0}
                  x2={d * k}
                  y2={0}
                  stroke="var(--graphite)"
                  strokeWidth={0.8}
                  opacity={0.25}
                />
                {/* the tick itself, straddling the axis */}
                <line
                  x1={-0.09 * k}
                  y1={0}
                  x2={0.09 * k}
                  y2={0}
                  stroke="var(--ink)"
                  strokeWidth={1.4}
                  opacity={0.8}
                />
              </g>
            );
          })}
          {/* the data itself */}
          {pts.map((p, i) => (
            <circle key={i} cx={frame.sx(p.x)} cy={frame.sy(p.y)} r={3.2} fill="var(--ink)" opacity={0.55} />
          ))}
          {/* revealed principal components */}
          {/* NB: `.anim-draw` sets stroke-dasharray, which would eat these dashes —
              a plain fade is the right entrance for an already-dashed line. */}
          {showPCs && (
            <g className="anim-fade">
              <line {...pcLine(pca.angle1, 5.4)} stroke="var(--ink)" strokeWidth={1.5} strokeDasharray="8 5" />
              <line {...pcLine(pca.angle2, 2.2)} stroke="var(--graphite)" strokeWidth={1.3} strokeDasharray="4 4" />
            </g>
          )}
          {showPCs && (
            <g className="anim-fade" style={{ animationDelay: '120ms' }}>
              <text
                x={frame.sx(mean.x + 5.0 * Math.cos(pca.angle1))}
                y={frame.sy(mean.y + 5.0 * Math.sin(pca.angle1)) - 8}
                fontSize={11}
                fill="var(--ink)"
                fontStyle="italic"
                textAnchor="middle"
              >
                PC1
              </text>
              <text
                x={frame.sx(mean.x + 2.0 * Math.cos(pca.angle2)) + 10}
                y={frame.sy(mean.y + 2.0 * Math.sin(pca.angle2))}
                fontSize={11}
                fill="var(--graphite)"
                fontStyle="italic"
              >
                PC2
              </text>
            </g>
          )}
          {/* the projection axis: a horizontal line through the mean, rotated */}
          <g className={glide} transform={`rotate(${screenDeg.toFixed(2)} ${mx.toFixed(2)} ${my.toFixed(2)})`}>
            <line
              x1={mx - 5.6 * k}
              y1={my}
              x2={mx + 5.6 * k}
              y2={my}
              stroke="var(--ink)"
              strokeWidth={2}
              strokeLinecap="round"
            />
          </g>
        </g>
        {/* mean + rotation handle — the handle rides the same rotated group as the
            axis so the two can never drift apart while the eased motion plays */}
        <circle cx={mx} cy={my} r={4} fill="#fffdf8" stroke="var(--ink)" strokeWidth={1.6} />
        <g className={glide} transform={`rotate(${screenDeg.toFixed(2)} ${mx.toFixed(2)} ${my.toFixed(2)})`}>
          <rect
            x={mx + 4.4 * k - 7}
            y={my - 7}
            width={14}
            height={14}
            fill="#fffdf8"
            stroke="var(--ink)"
            strokeWidth={1.8}
            transform={`rotate(45 ${(mx + 4.4 * k).toFixed(2)} ${my.toFixed(2)})`}
            style={{ cursor: 'grab' }}
          />
        </g>
      </PlotSvg>

      <EquationReadout
        symbolic="\mathbf{u} = (\cos\theta,\ \sin\theta)"
        substituted={`\\mathbf{u} = (${fmt(u.x)},\\ ${fmt(u.y)}),\\qquad \\theta = ${fmt(thetaDeg, 1)}^\\circ`}
        aux="z_i = \mathbf{u}^\top(\mathbf{x}_i - \bar{\mathbf{x}})"
        stats={[
          { label: 'variance kept', value: `${fmt(pctOfTotal, 1)}%`, emphasis: true },
          { label: 'θ', value: `${fmt(thetaDeg, 1)}°` },
          { label: 'of the best axis', value: `${fmt(pctOfMax * 100, 0)}%` },
        ]}
        note="u is a unit vector, so zᵢ is just the signed distance of a point's shadow from the mean."
      />

      <p style={{ margin: '10px 0 0', fontSize: '0.95rem', overflowWrap: 'anywhere' }}>
        {goalMet ? (
          <strong key="win" className="anim-pop" style={{ display: 'inline-block' }}>
            That is (nearly) the first principal component — {Math.round(pctOfMax * 100)}% of the
            best possible variance.
          </strong>
        ) : (
          <>
            You are capturing <strong>{Math.round(pctOfMax * 100)}%</strong> of what the best axis
            could — keep rotating toward the long direction of the cloud.
          </>
        )}
      </p>
    </WidgetFrame>
  );
}

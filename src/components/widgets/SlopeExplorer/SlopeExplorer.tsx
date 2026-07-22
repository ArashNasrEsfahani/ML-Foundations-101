import React, { useEffect, useRef, useState } from 'react';
import { WidgetFrame, type GuideEntry } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { makeFrame, Axes, PlotSvg } from '../Plot';
import { useSvgDrag } from '../../../hooks/useDrag';
import { clamp } from '../../../lib/math/scales';

const W = 340;
const H = 260;

/* ---- pane 1: one input, a curve and its slope ---- */
const X1D: [number, number] = [-2, 5];
const fx = (x: number) => 0.6 * (x - 1.5) * (x - 1.5) + 1;
const dfx = (x: number) => 1.2 * (x - 1.5);
const F1 = makeFrame(W, H, X1D, [0, 9]);

const CURVE = (() => {
  const parts: string[] = [];
  for (let i = 0; i <= 80; i++) {
    const x = X1D[0] + ((X1D[1] - X1D[0]) * i) / 80;
    parts.push(`${i === 0 ? 'M' : 'L'} ${F1.sx(x).toFixed(1)} ${F1.sy(fx(x)).toFixed(1)}`);
  }
  return parts.join(' ');
})();

/* ---- pane 2: two inputs, contours and the gradient ---- */
const X2D: [number, number] = [-1.6, 5.6];
const Y2D: [number, number] = [-1.7, 3.7];
const F2 = makeFrame(W, H, X2D, Y2D);
/** g(x,y) = (x-2)^2 + 2(y-1)^2 → ∇g = [2(x-2), 4(y-1)] */
const gradG = (x: number, y: number): [number, number] => [2 * (x - 2), 4 * (y - 1)];
const LEVELS = [0.5, 1.5, 3, 5, 7.5, 10.5];

const START1 = -0.8;
const START2 = { x: 3.6, y: 2.5 };

const GUIDE: GuideEntry[] = [
  {
    control: 'the dot on the curve',
    what: 'Drag it left and right; it stays glued to the curve and the dashed tangent re-aims itself at every position. The challenge is to park it where the tangent goes flat.',
  },
  {
    control: 'the dashed tangent',
    what: 'The straight line that matches the curve’s direction at the dot, and its steepness *is* the derivative there. It turns solid when the slope is close enough to zero to count as flat.',
  },
  {
    control: 'slope',
    what: 'The number the tangent is showing: positive means the curve rises as x grows, negative means it falls, and the size says how steeply. Gradient descent moves against this sign, which is why a slope of zero is where it stops.',
  },
  {
    control: 'the dot on the contour map',
    what: 'Drag it anywhere in the right-hand panel — this surface has two inputs, so the dot is free in both directions. The arrow redraws itself from wherever you drop it.',
  },
  {
    control: 'the contour rings',
    what: 'Each ring joins the points where $g(x,y)$ has one fixed value, the way height lines work on a walking map. Rings packed close together mean steep ground, and the small dot at the centre is the bottom of the bowl.',
  },
  {
    control: 'the arrow',
    what: 'The gradient drawn at the dot: it points along the steepest way *uphill*, always square to the ring it sits on. Its length grows with the steepness, which is why it shrinks to nothing at the centre.',
  },
  {
    control: 'gradient = [·, ·], length',
    what: 'The two partial derivatives — how fast $g$ climbs if you move in x alone, then in y alone — and the overall steepness they add up to. Training walks in the opposite direction, $-\\nabla g$.',
  },
];

/**
 * Left: drag a point along f(x) and watch the tangent's slope.
 * Right: drag a point on a contour map and watch the gradient arrow point uphill.
 * Challenge: park the left point where the slope is (almost) zero.
 */
export function SlopeExplorer({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const [x1, setX1] = useState(START1);
  const [p2, setP2] = useState(START2);

  const slope = dfx(x1);
  const flat = Math.abs(slope) < 0.08;
  useEffect(() => {
    if (flat) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flat]);

  const drag1 = useSvgDrag((px) => {
    setX1(clamp(F1.sx.invert(px), X1D[0], X1D[1]));
  });
  const drag2 = useSvgDrag((px, py) => {
    setP2({
      x: clamp(F2.sx.invert(px), X2D[0], X2D[1]),
      y: clamp(F2.sy.invert(py), Y2D[0], Y2D[1]),
    });
  });

  // tangent segment around the point (clipped to the panel)
  const y1v = fx(x1);
  const tHalf = 1.4;
  const t0 = { x: x1 - tHalf, y: y1v - tHalf * slope };
  const t1 = { x: x1 + tHalf, y: y1v + tHalf * slope };

  // gradient arrow geometry (pixel space)
  const [gvx, gvy] = gradG(p2.x, p2.y);
  const gLen = Math.hypot(gvx, gvy);
  const K = 0.16; // data units of arrow per unit of gradient
  const ax0 = F2.sx(p2.x);
  const ay0 = F2.sy(p2.y);
  const ax1 = F2.sx(p2.x + K * gvx);
  const ay1 = F2.sy(p2.y + K * gvy);
  const ang = Math.atan2(ay1 - ay0, ax1 - ax0);
  // pixel length of the arrow, and an *unwrapped* heading so easing the rotation
  // never takes the long way round when the angle crosses ±180°
  const arrowLen = Math.hypot(ax1 - ax0, ay1 - ay0);
  const angRef = useRef((ang * 180) / Math.PI);
  let arrowDeg = (ang * 180) / Math.PI;
  while (arrowDeg - angRef.current > 180) arrowDeg -= 360;
  while (arrowDeg - angRef.current < -180) arrowDeg += 360;
  angRef.current = arrowDeg;

  // tangent segment as a rotated unit line so its swing can be transitioned
  const tx0 = F1.sx(t0.x);
  const ty0 = F1.sy(t0.y);
  const tx1 = F1.sx(t1.x);
  const ty1 = F1.sy(t1.y);
  const tanLen = Math.hypot(tx1 - tx0, ty1 - ty0);
  const tanDeg = (Math.atan2(ty1 - ty0, tx1 - tx0) * 180) / Math.PI; // dx > 0, so no wrap

  // contour ellipse geometry
  const pxPerX = F2.sx(1) - F2.sx(0);
  const pxPerY = F2.sy(0) - F2.sy(1);
  const c2x = F2.sx(2);
  const c2y = F2.sy(1);

  const reset = () => {
    setX1(START1);
    setP2(START2);
  };

  const slopeText = flat
    ? `slope ${slope.toFixed(2)} — flat ground: this is the minimum`
    : slope > 0
      ? `slope +${slope.toFixed(1)} — walking uphill (to the right)`
      : `slope ${slope.toFixed(1)} — walking downhill (to the right)`;

  return (
    <WidgetFrame
      title="Slopes and gradients"
      intro={
        <>
          The same idea at two sizes: on the left a function of one input, where the direction of
          travel is a single number, and on the right a function of two, where it takes an arrow.
          Drag either dot and watch what the tangent and the arrow do.
        </>
      }
      guide={GUIDE}
      onReset={reset}
      challenge={challenge}
      challengeDone={done}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {/* ------- pane 1: derivative ------- */}
        <div style={{ flex: '1 1 280px', minWidth: 260 }}>
          <p style={{ margin: '0 0 6px', fontSize: '0.9rem', color: 'var(--graphite)' }}>
            <strong style={{ color: 'var(--ink)' }}>One input.</strong> Drag the dot along the
            curve; the tangent line shows the derivative.
          </p>
          <PlotSvg frame={F1} {...drag1}>
            <defs>
              <clipPath id="slope-clip">
                <rect
                  x={F1.pad.l}
                  y={F1.pad.t}
                  width={W - F1.pad.l - F1.pad.r}
                  height={H - F1.pad.t - F1.pad.b}
                />
              </clipPath>
            </defs>
            <Axes frame={F1} xLabel="x" yLabel="f(x)" />
            <g clipPath="url(#slope-clip)">
              <path d={CURVE} fill="none" stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" />
              {/* the tangent eases into its new angle a beat behind the dot */}
              <g
                className="mark-move-fast"
                style={{ transform: `translate(${F1.sx(x1)}px, ${F1.sy(y1v)}px) rotate(${tanDeg}deg)` }}
              >
                <line
                  x1={-tanLen / 2}
                  y1={0}
                  x2={tanLen / 2}
                  y2={0}
                  stroke="var(--graphite)"
                  strokeWidth={1.6}
                  strokeDasharray={flat ? undefined : '7 4'}
                />
              </g>
            </g>
            <circle
              cx={F1.sx(x1)}
              cy={F1.sy(y1v)}
              r={7}
              fill="#fffdf8"
              stroke="var(--ink)"
              strokeWidth={1.8}
              style={{ cursor: 'grab' }}
            />
            <circle cx={F1.sx(x1)} cy={F1.sy(y1v)} r={2.6} fill="var(--ink)" style={{ pointerEvents: 'none' }} />
          </PlotSvg>
          <p style={{ margin: '8px 0 0', fontSize: '0.92rem' }}>
            {flat ? (
              <strong className="anim-pop" style={{ display: 'inline-block' }}>
                {slopeText}
              </strong>
            ) : (
              slopeText
            )}
          </p>
        </div>

        {/* ------- pane 2: gradient ------- */}
        <div style={{ flex: '1 1 280px', minWidth: 260 }}>
          <p style={{ margin: '0 0 6px', fontSize: '0.9rem', color: 'var(--graphite)' }}>
            <strong style={{ color: 'var(--ink)' }}>Two inputs.</strong> A contour map of{' '}
            g(x, y); drag the dot and watch the gradient arrow.
          </p>
          <PlotSvg frame={F2} {...drag2}>
            <defs>
              <clipPath id="grad-clip">
                <rect
                  x={F2.pad.l}
                  y={F2.pad.t}
                  width={W - F2.pad.l - F2.pad.r}
                  height={H - F2.pad.t - F2.pad.b}
                />
              </clipPath>
            </defs>
            <Axes frame={F2} xLabel="x" yLabel="y" />
            <g clipPath="url(#grad-clip)" style={{ pointerEvents: 'none' }}>
              {LEVELS.map((c, i) => (
                <ellipse
                  key={c}
                  cx={c2x}
                  cy={c2y}
                  rx={Math.sqrt(c) * pxPerX}
                  ry={Math.sqrt(c / 2) * pxPerY}
                  fill="none"
                  stroke="var(--graphite)"
                  strokeWidth={1.1}
                  opacity={0.9 - i * 0.08}
                  transform={`rotate(${i % 2 === 0 ? 1.6 : -1.4} ${c2x} ${c2y})`}
                />
              ))}
              {/* the bowl's bottom */}
              <circle cx={c2x} cy={c2y} r={2.2} fill="var(--graphite)" opacity={0.7} />
              {/* gradient arrow: points uphill */}
              {/* arrow drawn in its own rotated frame: heading, shaft length and
                  head position each ease, so it swings and stretches smoothly */}
              {gLen > 0.05 && (
                <g
                  className="mark-move-fast"
                  style={{ transform: `translate(${ax0}px, ${ay0}px) rotate(${arrowDeg}deg)` }}
                >
                  <g className="mark-move-fast" style={{ transform: `scaleX(${arrowLen / 100})` }}>
                    <line x1={0} y1={0} x2={100} y2={0} stroke="var(--ink)" strokeWidth={2} strokeLinecap="round" />
                  </g>
                  <g className="mark-move-fast" style={{ transform: `translateX(${arrowLen}px)` }}>
                    <line
                      x1={0}
                      y1={0}
                      x2={8.5 * Math.cos(2.6)}
                      y2={8.5 * Math.sin(2.6)}
                      stroke="var(--ink)"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                    <line
                      x1={0}
                      y1={0}
                      x2={8.5 * Math.cos(-2.6)}
                      y2={8.5 * Math.sin(-2.6)}
                      stroke="var(--ink)"
                      strokeWidth={2}
                      strokeLinecap="round"
                    />
                  </g>
                </g>
              )}
            </g>
            <circle
              cx={ax0}
              cy={ay0}
              r={7}
              fill="#fffdf8"
              stroke="var(--ink)"
              strokeWidth={1.8}
              style={{ cursor: 'grab' }}
            />
            <circle cx={ax0} cy={ay0} r={2.6} fill="var(--ink)" style={{ pointerEvents: 'none' }} />
          </PlotSvg>
          <p style={{ margin: '8px 0 0', fontSize: '0.92rem' }}>
            {gLen < 0.05 ? (
              <strong className="anim-pop" style={{ display: 'inline-block' }}>
                gradient ≈ [0, 0] — the bottom of the bowl
              </strong>
            ) : (
              <>
                gradient = [{gvx.toFixed(1)}, {gvy.toFixed(1)}], length {gLen.toFixed(1)}
              </>
            )}
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '0.85rem', color: 'var(--graphite)', fontStyle: 'italic' }}>
            the gradient points uphill; −gradient is the way down
          </p>
        </div>
      </div>
    </WidgetFrame>
  );
}

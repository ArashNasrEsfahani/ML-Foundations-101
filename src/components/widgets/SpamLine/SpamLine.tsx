import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WidgetFrame, type GuideEntry } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { makeFrame, Axes, Dot, PlotSvg } from '../Plot';
import { EquationReadout, fmt, texSum } from '../EquationReadout';
import { useSvgDrag } from '../../../hooks/useDrag';
import { spam2d } from '../../../content/datasets/spam2d';
import { clamp } from '../../../lib/math/scales';

const W = 420;
const H = 340;

// starts cutting straight through the spam cloud so the player has real work to do
const START = { h1: { x: 0.6, y: 7 }, h2: { x: 9.4, y: 7 } };

const GUIDE: GuideEntry[] = [
  {
    control: 'the ◇ handles',
    what: 'Drag either one anywhere in the plot; the boundary is the infinite line through both of them. Grab the one nearer your finger to swing the line, and move both the same way to slide it across without turning it.',
  },
  {
    control: 'dashed rings',
    what: 'One ring per point currently on the wrong side of the line. They are the errors the count below is counting, so aim to drag until none are left.',
  },
  {
    control: 'the dashed band',
    what: 'A pair of lines parked at the distance of the closest point, so the gap between them is the room your boundary has to spare. It is drawn faintly until nothing is misclassified, because a corridor around a wrong answer means nothing.',
  },
  {
    control: '‖w‖',
    what: 'The length of the weight vector. Here it is fixed at 1 because the widget uses the unit normal of your line, which is what lets the margin be read as a plain distance.',
  },
  {
    control: 'margin',
    what: 'The distance from the line to the nearest point, in the plot’s own units. Two different lines can both separate the data perfectly and still have very different margins — the bigger one is the safer classifier.',
  },
  {
    control: 'misclassified',
    what: 'How many of the emails the line currently gets wrong. Zero completes the challenge.',
  },
];

/**
 * Drag a straight line to separate spam (filled) from normal mail (open).
 *
 * The two handles define a direction d; the boundary's normal is w = (−d.y, d.x)
 * normalized, and b = w·h1, so the line is exactly w⁽¹⁾x⁽¹⁾ + w⁽²⁾x⁽²⁾ − b = 0.
 * The widget scores whichever of the two labelings is better, and flips (w, b)
 * together when the flipped one wins — so the printed equation can never
 * disagree with the picture.
 */
export function SpamLine({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const pts = useMemo(() => spam2d(), []);
  const [h1, setH1] = useState(START.h1);
  const [h2, setH2] = useState(START.h2);
  const grabbed = useRef<'h1' | 'h2' | null>(null);

  const frame = makeFrame(W, H, [0, 10], [0, 10]);

  /**
   * One pass over the data gives the oriented model, the error count, the
   * geometric margin and the per-point mistake flags — all mutually consistent.
   */
  const model = useMemo(() => {
    const dx = h2.x - h1.x;
    const dy = h2.y - h1.y;
    const len = Math.hypot(dx, dy) || 1e-9;
    // unit normal of the segment, and the offset that puts the line through h1
    let wx = -dy / len;
    let wy = dx / len;
    let b = wx * h1.x + wy * h1.y;

    // score this orientation, then adopt whichever labeling makes fewer mistakes
    let wrong = 0;
    let minDist = Infinity;
    for (const p of pts) {
      const s = wx * p.x + wy * p.y - b;
      if ((s >= 0 ? 1 : -1) !== p.label) wrong++;
      minDist = Math.min(minDist, Math.abs(s));
    }
    const flip = wrong > pts.length - wrong;
    if (flip) {
      wx = -wx;
      wy = -wy;
      b = -b;
    }
    const errors = flip ? pts.length - wrong : wrong;
    const flags = pts.map((p) => {
      const s = wx * p.x + wy * p.y - b;
      return (s >= 0 ? 1 : -1) !== p.label;
    });
    return { wx, wy, b, errors, marginDist: minDist, flags };
  }, [h1, h2, pts]);

  const { errors, marginDist } = model;
  const separated = errors === 0;

  useEffect(() => {
    if (separated) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [separated]);

  // ---- the celebratory beat: a short pulse each time 0 errors is reached
  const [celebrate, setCelebrate] = useState(false);
  const wasSeparated = useRef(false);
  useEffect(() => {
    if (separated && !wasSeparated.current) {
      wasSeparated.current = true;
      setCelebrate(true);
      const t = setTimeout(() => setCelebrate(false), 700);
      return () => clearTimeout(t);
    }
    if (!separated) wasSeparated.current = false;
    return undefined;
  }, [separated]);

  const dragProps = useSvgDrag((px, py, phase) => {
    const x = clamp(frame.sx.invert(px), 0, 10);
    const y = clamp(frame.sy.invert(py), 0, 10);
    if (phase === 'start') {
      const d1 = Math.hypot(frame.sx(h1.x) - px, frame.sy(h1.y) - py);
      const d2 = Math.hypot(frame.sx(h2.x) - px, frame.sy(h2.y) - py);
      grabbed.current = d1 < d2 ? 'h1' : 'h2';
    }
    if (grabbed.current === 'h1') setH1({ x, y });
    else if (grabbed.current === 'h2') setH2({ x, y });
    if (phase === 'end') grabbed.current = null;
  });

  // line + margin band geometry (extend the segment across the panel)
  const geo = useMemo(() => {
    const dx = h2.x - h1.x;
    const dy = h2.y - h1.y;
    const len = Math.hypot(dx, dy) || 1e-9;
    const ux = dx / len;
    const uy = dy / len;
    const nx = -uy;
    const ny = ux;
    const cx = (h1.x + h2.x) / 2;
    const cy = (h1.y + h2.y) / 2;
    const L = 16;
    const line = {
      x1: cx - ux * L, y1: cy - uy * L,
      x2: cx + ux * L, y2: cy + uy * L,
    };
    // the band always sits at the true distance to the nearest point; it is only
    // *meaningful* once nothing is on the wrong side, hence the opacity change.
    const off = Number.isFinite(marginDist) ? Math.max(marginDist, 0.06) : 0.06;
    const bands = [
      { x1: line.x1 + nx * off, y1: line.y1 + ny * off, x2: line.x2 + nx * off, y2: line.y2 + ny * off },
      { x1: line.x1 - nx * off, y1: line.y1 - ny * off, x2: line.x2 - nx * off, y2: line.y2 - ny * off },
    ];
    return { line, bands };
  }, [h1, h2, marginDist]);

  const reset = () => {
    setH1(START.h1);
    setH2(START.h2);
  };

  // live TeX: w⁽¹⁾x⁽¹⁾ + w⁽²⁾x⁽²⁾ − b = 0 with the numbers the handles just made
  const substituted = `${texSum([
    { coef: model.wx, sym: 'x^{(1)}' },
    { coef: model.wy, sym: 'x^{(2)}' },
    { coef: -model.b },
  ])} = 0`;
  const norm = Math.hypot(model.wx, model.wy);

  return (
    <WidgetFrame
      title="Draw the decision boundary"
      intro={
        <>
          Filled dots are spam, open dots are normal mail. Drag the two square handles until the
          line separates them — the equation underneath is the line you are drawing.
        </>
      }
      guide={GUIDE}
      onReset={reset}
      challenge={challenge}
      challengeDone={done}
    >
      <PlotSvg frame={frame} {...dragProps}>
        <defs>
          <clipPath id="spamline-clip">
            <rect x={frame.pad.l} y={frame.pad.t} width={W - frame.pad.l - frame.pad.r} height={H - frame.pad.t - frame.pad.b} />
          </clipPath>
        </defs>
        <Axes frame={frame} xLabel="exclamation marks!!" yLabel="money words" />
        <g clipPath="url(#spamline-clip)">
          {/* margin band: always drawn, faint until it actually means something.
              `key` remounts the group so .anim-draw-fast replays on each win. */}
          <g
            key={celebrate ? 'band-beat' : 'band'}
            className={celebrate ? 'anim-draw-fast' : undefined}
            style={{ transition: 'opacity 0.4s ease' }}
            opacity={separated ? 1 : 0.32}
          >
            {geo.bands.map((b, i) => (
              <line
                key={i}
                x1={frame.sx(b.x1)} y1={frame.sy(b.y1)} x2={frame.sx(b.x2)} y2={frame.sy(b.y2)}
                stroke="var(--graphite)"
                strokeWidth={separated ? 1.2 : 0.9}
                strokeDasharray="6 5"
              />
            ))}
          </g>
          {/* the boundary itself — thickens for a beat when separation lands */}
          <line
            x1={frame.sx(geo.line.x1)} y1={frame.sy(geo.line.y1)}
            x2={frame.sx(geo.line.x2)} y2={frame.sy(geo.line.y2)}
            stroke="var(--ink)"
            strokeWidth={celebrate ? 3.6 : 2.2}
            strokeLinecap="round"
            style={{ transition: 'stroke-width 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
          />
          {/* data: each dot carries its own paper halo, drawn immediately beneath
              itself, so dots stacked on top of each other still read as separate
              circles instead of one ink blob. */}
          {pts.map((p, i) => (
            <g key={i}>
              <circle
                cx={frame.sx(p.x)}
                cy={frame.sy(p.y)}
                r={5.5}
                fill="#fffdf8"
                stroke="#fffdf8"
                strokeWidth={3}
              />
              <Dot x={frame.sx(p.x)} y={frame.sy(p.y)} cls={p.label === 1 ? 'a' : 'b'} />
            </g>
          ))}
          {/* mistake rings, on their own layer above every halo so nothing clips
              them. They fade + scale in as a point becomes misclassified. */}
          <g>
            {pts.map((p, i) => (
              <circle
                key={i}
                className="mark-move"
                cx={frame.sx(p.x)}
                cy={frame.sy(p.y)}
                r={10.5}
                fill="none"
                stroke="var(--graphite)"
                strokeWidth={0.9}
                strokeDasharray="3 2.5"
                opacity={model.flags[i] ? 0.55 : 0}
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  transform: model.flags[i] ? 'scale(1)' : 'scale(0.55)',
                }}
              />
            ))}
          </g>
        </g>
        {/* handles */}
        {[h1, h2].map((h, i) => (
          <rect
            key={i}
            x={frame.sx(h.x) - 7} y={frame.sy(h.y) - 7} width={14} height={14}
            fill="#fffdf8" stroke="var(--ink)" strokeWidth={1.8}
            transform={`rotate(45 ${frame.sx(h.x)} ${frame.sy(h.y)})`}
            style={{ cursor: 'grab' }}
          />
        ))}
      </PlotSvg>

      <EquationReadout
        symbolic="\mathbf{w}\mathbf{x} - b = 0"
        substituted={substituted}
        aux="y = \mathrm{sign}(\mathbf{w}\mathbf{x} - b)"
        stats={[
          { label: '‖w‖', value: fmt(norm) },
          { label: 'margin', value: fmt(marginDist) },
          { label: 'misclassified', value: String(errors), emphasis: true },
        ]}
        note="w is the unit normal to the line, so ‖w‖ = 1 and the margin is a real distance."
      />

      <p style={{ margin: '10px 0 0', fontSize: '0.95rem', overflowWrap: 'anywhere' }}>
        {separated ? (
          <strong key="sep" className="anim-pop" style={{ display: 'inline-block' }}>
            Perfectly separated! Every dot is on its own side.
          </strong>
        ) : (
          <>
            Misclassified: <strong>{errors}</strong> (dashed circles)
          </>
        )}
      </p>
    </WidgetFrame>
  );
}

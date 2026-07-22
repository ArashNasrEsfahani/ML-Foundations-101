import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WidgetFrame, type GuideEntry } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { makeFrame, Axes, Dot, PlotSvg } from '../Plot';
import { EquationReadout, fmt, texSum } from '../EquationReadout';
import { useSpeed, SpeedControl } from '../SpeedControl';
import { useSvgDrag } from '../../../hooks/useDrag';
import { useRaf } from '../../../hooks/useRaf';
import { regress2d } from '../../../content/datasets/regress2d';
import { fitLinreg, mse, descentStep } from '../../../lib/ml/linreg';
import { clamp } from '../../../lib/math/scales';

const W = 420;
const H = 340;
const HX1 = 1.5; // x positions of the two line handles
const HX2 = 8.5;
const START = { w: -0.4, b: 7 };
const MAP = 90; // loss-map raster resolution
const FIT_STEPS = 110; // gradient steps taken by auto-fit
const FIT_LR = 0.035;
const STEP_MS = 22; // wall-clock time one gradient step gets at normal speed

const GUIDE: GuideEntry[] = [
  {
    control: 'the ◇ handles',
    what: 'Drag either one up or down to tilt and shift the line; the nearer handle is the one you grab. Everything else on the plot — the stems, the squares, the readout — is recomputed from wherever you leave them.',
  },
  {
    control: 'the squares',
    what: 'One per point, with a side equal to the vertical gap between the point and the line, so its **area** is that point’s squared error. Squaring is why a point twice as far away hurts four times as much, and why the fit swings toward outliers.',
  },
  {
    control: 'the inset map',
    what: 'Every possible line drawn as a single pixel: across is the slope $w$, down is the intercept $b$, and darker is worse. The small ring is the best line there is and the filled dot is the one you are currently holding.',
  },
  {
    control: 'auto-fit (gradient descent)',
    what: 'Hands the line to [[gradient-descent]] from wherever you left it and lets it walk downhill for 110 steps, tracing its path across the inset map. Start it from a badly wrong line to see the path curve.',
  },
  {
    control: 'speed',
    what: 'How fast auto-fit is allowed to run. Take it to *slow* to see the individual steps as separate moves, large at first and shrinking as the slope under the line flattens out.',
  },
  {
    control: 'MSE',
    what: 'The [[mean-squared-error]] of your current line: the average of all those square areas. It is the height of the valley at the dot in the inset map.',
  },
  {
    control: 'MSE*',
    what: 'The lowest MSE any straight line can reach on this data, marked by the ring in the inset map. It is not 0 because the points are not on a line — the challenge is to get within 5% of it.',
  },
];

/**
 * Drag a regression line through a scatter; squared errors appear as literal
 * squares on each residual stem. An inset heatmap shows the MSE valley over
 * (w, b) space, and "auto-fit" walks gradient descent down into it.
 */
export function RegressionLab({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const pts = useMemo(() => regress2d(), []);
  const opt = useMemo(() => fitLinreg(pts), [pts]);
  const bestMse = useMemo(() => mse(pts, opt.w, opt.b), [pts, opt]);

  const [line, setLine] = useState(START);
  const [fitting, setFitting] = useState(false);
  const speed = useSpeed();
  const stepsLeft = useRef(0);
  const grabbed = useRef<'h1' | 'h2' | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  /** breadcrumb trail of (w, b) visited during the current descent */
  const trail = useRef<{ w: number; b: number }[]>([]);

  const frame = makeFrame(W, H, [0, 10], [0, 10]);
  const curMse = mse(pts, line.w, line.b);

  // ---- challenge: within 5% of the best possible MSE
  const hit = curMse <= bestMse * 1.05 + 1e-9;
  useEffect(() => {
    if (hit) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hit]);

  // ---- auto-fit, paced in wall-clock time rather than one step per frame: at
  // `slow` there has to be visible daylight between two successive steps, which
  // a per-frame loop cannot give. The frame still owns the redraw, so the inset
  // map is never repainted more than once a frame however fast the descent runs.
  // The descent advances through a ref as well as through state, so a frame that
  // fires before React has committed the previous one still steps forward.
  const lineRef = useRef(line);
  lineRef.current = line;
  const owedMs = useRef(0);
  useRaf((dt) => {
    const perStep = speed.ms(STEP_MS);
    owedMs.current += dt;
    let next = lineRef.current;
    let moved = false;
    while (owedMs.current >= perStep && stepsLeft.current > 0) {
      owedMs.current -= perStep;
      next = descentStep(pts, next.w, next.b, FIT_LR);
      trail.current.push(next);
      stepsLeft.current -= 1;
      moved = true;
    }
    if (moved) {
      lineRef.current = next;
      setLine(next);
    }
    if (stepsLeft.current <= 0) setFitting(false);
  }, fitting);

  const autoFit = () => {
    trail.current = [{ ...line }];
    stepsLeft.current = FIT_STEPS;
    owedMs.current = 0;
    setFitting(true);
  };

  // ---- dragging the two diamond handles
  const handleY = (hx: number) => clamp(line.w * hx + line.b, 0, 10);
  const dragProps = useSvgDrag((px, py, phase) => {
    if (fitting) return;
    const y = clamp(frame.sy.invert(py), 0.2, 9.8);
    if (phase === 'start') {
      trail.current = [];
      const d1 = Math.hypot(frame.sx(HX1) - px, frame.sy(handleY(HX1)) - py);
      const d2 = Math.hypot(frame.sx(HX2) - px, frame.sy(handleY(HX2)) - py);
      grabbed.current = d1 < d2 ? 'h1' : 'h2';
    }
    if (grabbed.current) {
      const y1 = grabbed.current === 'h1' ? y : handleY(HX1);
      const y2 = grabbed.current === 'h2' ? y : handleY(HX2);
      const w = (y2 - y1) / (HX2 - HX1);
      setLine({ w, b: y1 - w * HX1 });
    }
    if (phase === 'end') grabbed.current = null;
  });

  // ---- loss-map raster (precomputed shades; dot + ring drawn per render)
  const wRange: [number, number] = [opt.w - 1.1, opt.w + 1.1];
  const bRange: [number, number] = [opt.b - 3.5, opt.b + 3.5];
  const shades = useMemo(() => {
    const out = new Float32Array(MAP * MAP);
    let vmax = -Infinity;
    for (let j = 0; j < MAP; j++) {
      for (let i = 0; i < MAP; i++) {
        const w = wRange[0] + ((i + 0.5) / MAP) * (wRange[1] - wRange[0]);
        const b = bRange[1] - ((j + 0.5) / MAP) * (bRange[1] - bRange[0]);
        const v = mse(pts, w, b);
        out[j * MAP + i] = v;
        if (v > vmax) vmax = v;
      }
    }
    const lmin = Math.log(Math.max(bestMse, 1e-9));
    const lmax = Math.log(vmax);
    for (let k = 0; k < out.length; k++) {
      out[k] = (Math.log(Math.max(out[k], 1e-9)) - lmin) / (lmax - lmin || 1);
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pts, bestMse]);

  /**
   * The static part of the inset (the MSE valley) is painted once into an
   * offscreen buffer; every frame just blits it and stamps the markers on top,
   * so a 60 fps descent cannot flicker.
   */
  const baseMap = useMemo(() => {
    const off = document.createElement('canvas');
    off.width = MAP;
    off.height = MAP;
    const octx = off.getContext('2d');
    if (!octx) return off;
    const img = octx.createImageData(MAP, MAP);
    for (let k = 0; k < MAP * MAP; k++) {
      const g = Math.round(245 - 155 * shades[k]);
      img.data[k * 4] = g;
      img.data[k * 4 + 1] = g;
      img.data[k * 4 + 2] = g;
      img.data[k * 4 + 3] = 255;
    }
    octx.putImageData(img, 0, 0);
    return off;
  }, [shades]);

  useEffect(() => {
    const cv = canvasRef.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    ctx.clearRect(0, 0, MAP, MAP);
    ctx.drawImage(baseMap, 0, 0);

    const toPx = (w: number, b: number) => ({
      x: ((clamp(w, wRange[0], wRange[1]) - wRange[0]) / (wRange[1] - wRange[0])) * MAP,
      y: ((bRange[1] - clamp(b, bRange[0], bRange[1])) / (bRange[1] - bRange[0])) * MAP,
    });

    // breadcrumb trail of the descent
    const path = trail.current;
    if (path.length > 1) {
      ctx.strokeStyle = 'rgba(42, 42, 40, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      path.forEach((s, i) => {
        const q = toPx(s.w, s.b);
        if (i === 0) ctx.moveTo(q.x, q.y);
        else ctx.lineTo(q.x, q.y);
      });
      ctx.stroke();
    }

    // ring at the optimum
    const o = toPx(opt.w, opt.b);
    ctx.strokeStyle = '#2a2a28';
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(o.x, o.y, 5, 0, Math.PI * 2);
    ctx.stroke();
    // dot at the current (w, b), clamped to the map edge
    const c = toPx(line.w, line.b);
    ctx.fillStyle = '#2a2a28';
    ctx.beginPath();
    ctx.arc(c.x, c.y, 3, 0, Math.PI * 2);
    ctx.fill();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseMap, line.w, line.b, opt.w, opt.b]);

  const reset = () => {
    setFitting(false);
    stepsLeft.current = 0;
    trail.current = [];
    setLine(START);
  };

  const pxPerY = (H - frame.pad.t - frame.pad.b) / 10;
  const y1 = line.w * -1 + line.b;
  const y2 = line.w * 11 + line.b;

  const substituted = `f(x) = ${texSum([{ coef: line.w, sym: 'x' }, { coef: line.b }])}`;

  return (
    <WidgetFrame
      title="Fit the line, shrink the squares"
      intro={
        <>
          Drag the diamond handles. Each point pays a penalty equal to the <em>area</em> of its
          square — that is the squared error. The inset map shows MSE over all (w, b) pairs:
          darker is worse, the small ring marks the optimum.
        </>
      }
      guide={GUIDE}
      onReset={reset}
      challenge={challenge}
      challengeDone={done}
    >
      <div style={{ position: 'relative' }}>
        <PlotSvg
          frame={frame}
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
          <defs>
            <clipPath id="reglab-clip">
              <rect
                x={frame.pad.l}
                y={frame.pad.t}
                width={W - frame.pad.l - frame.pad.r}
                height={H - frame.pad.t - frame.pad.b}
              />
            </clipPath>
          </defs>
          <Axes frame={frame} xLabel="feature x" yLabel="target y" />
          <g clipPath="url(#reglab-clip)">
            {/* residual stems + squared-error squares. The squares fade as well as
                shrink, and `.mark-move` eases that fade so the fit reads as the
                penalty draining away rather than as a stack of jump cuts. */}
            {pts.map((p, i) => {
              const yh = line.w * p.x + line.b;
              const r = Math.min(Math.abs(p.y - yh), 2.4);
              const side = r * pxPerY;
              const weight = Math.min(1, r / 2.4);
              return (
                <g key={i}>
                  <line
                    x1={frame.sx(p.x)}
                    y1={frame.sy(p.y)}
                    x2={frame.sx(p.x)}
                    y2={frame.sy(yh)}
                    stroke="var(--graphite)"
                    strokeWidth={1}
                    opacity={0.35 + 0.4 * weight}
                    className="mark-move"
                  />
                  <rect
                    x={frame.sx(p.x)}
                    y={frame.sy(Math.max(p.y, yh))}
                    width={side}
                    height={side}
                    fill="var(--graphite)"
                    opacity={0.07 + 0.13 * weight}
                    stroke="var(--graphite)"
                    strokeWidth={0.8}
                    className="mark-move"
                  />
                </g>
              );
            })}
            {/* the regression line */}
            <line
              x1={frame.sx(-1)}
              y1={frame.sy(y1)}
              x2={frame.sx(11)}
              y2={frame.sy(y2)}
              stroke="var(--ink)"
              strokeWidth={fitting ? 2.6 : 2.2}
              strokeLinecap="round"
              style={{ transition: 'stroke-width 0.3s ease' }}
            />
            {/* data */}
            {pts.map((p, i) => (
              <Dot key={`d${i}`} x={frame.sx(p.x)} y={frame.sy(p.y)} cls="a" r={4.5} />
            ))}
          </g>
          {/* diamond handles */}
          {[HX1, HX2].map((hx, i) => (
            <rect
              key={i}
              x={frame.sx(hx) - 7}
              y={frame.sy(handleY(hx)) - 7}
              width={14}
              height={14}
              fill="#fffdf8"
              stroke="var(--ink)"
              strokeWidth={1.8}
              transform={`rotate(45 ${frame.sx(hx)} ${frame.sy(handleY(hx))})`}
              style={{ cursor: 'grab' }}
            />
          ))}
        </PlotSvg>
        {/* inset MSE heatmap over (w, b) */}
        <canvas
          ref={canvasRef}
          width={MAP}
          height={MAP}
          style={{
            position: 'absolute',
            left: '10.5%',
            top: '5%',
            width: '22%',
            aspectRatio: '1 / 1',
            border: '1px solid var(--line)',
            borderRadius: 4,
            pointerEvents: 'none',
          }}
        />
      </div>

      <EquationReadout
        symbolic="f_{w,b}(x) = wx + b"
        substituted={substituted}
        stats={[
          { label: 'w', value: fmt(line.w) },
          { label: 'b', value: fmt(line.b) },
          { label: 'MSE', value: fmt(curMse, 3), emphasis: true },
          { label: 'MSE*', value: fmt(bestMse, 3) },
        ]}
        note="MSE* is the lowest error any straight line can reach on this data."
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
        <span style={{ flex: 1 }} />
        <SpeedControl value={speed.speed} onChange={speed.setSpeed} />
        <button onClick={autoFit} disabled={fitting}>
          <span key={fitting ? 'go' : 'idle'} className="anim-pop" style={{ display: 'inline-block' }}>
            {fitting ? 'descending…' : 'auto-fit (gradient descent)'}
          </span>
        </button>
      </div>
    </WidgetFrame>
  );
}

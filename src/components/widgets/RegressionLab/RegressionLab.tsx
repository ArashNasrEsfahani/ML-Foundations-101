import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { makeFrame, Axes, Dot, PlotSvg } from '../Plot';
import { EquationReadout, fmt, texSum } from '../EquationReadout';
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
const FIT_STEPS = 110; // gradient steps taken by auto-fit, one per animation frame
const FIT_LR = 0.035;

/**
 * Drag a regression line through a scatter; squared errors appear as literal
 * squares on each residual stem. An inset heatmap shows the MSE valley over
 * (w, b) space, and "auto-fit" walks gradient descent down into it — one step
 * per animation frame, so the line glides instead of stuttering.
 */
export function RegressionLab({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const pts = useMemo(() => regress2d(), []);
  const opt = useMemo(() => fitLinreg(pts), [pts]);
  const bestMse = useMemo(() => mse(pts, opt.w, opt.b), [pts, opt]);

  const [line, setLine] = useState(START);
  const [fitting, setFitting] = useState(false);
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

  // ---- auto-fit: one gradient step per frame (~60/s) so the motion is fluid
  // The descent advances through a ref as well as through state, so a frame that
  // fires before React has committed the previous one still steps forward.
  const lineRef = useRef(line);
  lineRef.current = line;
  useRaf(() => {
    const next = descentStep(pts, lineRef.current.w, lineRef.current.b, FIT_LR);
    lineRef.current = next;
    trail.current.push(next);
    setLine(next);
    stepsLeft.current -= 1;
    if (stepsLeft.current <= 0) setFitting(false);
  }, fitting);

  const autoFit = () => {
    trail.current = [{ ...line }];
    stepsLeft.current = FIT_STEPS;
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
      onReset={reset}
      challenge={challenge}
      challengeDone={done}
    >
      <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: 'var(--graphite)' }}>
        Drag the diamond handles. Each point pays a penalty equal to the <em>area</em> of its
        square — that is the squared error. The inset map shows MSE over all (w, b) pairs:
        darker is worse, the small ring marks the optimum.
      </p>
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
        <button onClick={autoFit} disabled={fitting}>
          <span key={fitting ? 'go' : 'idle'} className="anim-pop" style={{ display: 'inline-block' }}>
            {fitting ? 'descending…' : 'auto-fit (gradient descent)'}
          </span>
        </button>
      </div>
    </WidgetFrame>
  );
}

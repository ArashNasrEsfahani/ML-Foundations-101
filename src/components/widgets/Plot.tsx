import React from 'react';
import { linearScale, ticks, type Scale } from '../../lib/math/scales';

/**
 * Shared sketch-styled SVG plot frame: cream panel, thin ink axes, graphite ticks.
 * Children render in pixel space using the provided scales.
 */
export interface PlotFrame {
  sx: Scale;
  sy: Scale;
  w: number;
  h: number;
  pad: { l: number; r: number; t: number; b: number };
}

export function makeFrame(
  w: number,
  h: number,
  xDomain: [number, number],
  yDomain: [number, number],
  pad = { l: 36, r: 12, t: 12, b: 28 },
): PlotFrame {
  return {
    sx: linearScale(xDomain, [pad.l, w - pad.r]),
    sy: linearScale(yDomain, [h - pad.b, pad.t]),
    w,
    h,
    pad,
  };
}

export function Axes({
  frame,
  xLabel,
  yLabel,
  xTicks = true,
  yTicks = true,
}: {
  frame: PlotFrame;
  xLabel?: string;
  yLabel?: string;
  xTicks?: boolean;
  yTicks?: boolean;
}) {
  const { sx, sy, w, h, pad } = frame;
  const x0 = pad.l;
  const y0 = h - pad.b;

  return (
    <g style={{ pointerEvents: 'none' }}>
      {/* axis lines with a slight hand wobble */}
      <path
        d={`M ${x0} ${pad.t} q 1.5 ${(y0 - pad.t) / 2} 0 ${y0 - pad.t} M ${x0} ${y0} q ${(w - pad.r - x0) / 2} 1.5 ${w - pad.r - x0} 0`}
        stroke="var(--ink)"
        strokeWidth={1.3}
        fill="none"
        strokeLinecap="round"
      />
      {xTicks &&
        ticks(sx.domain[0], sx.domain[1], 5).map((t) => (
          <g key={`x${t}`}>
            <line x1={sx(t)} y1={y0} x2={sx(t)} y2={y0 + 4} stroke="var(--graphite)" strokeWidth={1} />
            <text x={sx(t)} y={y0 + 16} textAnchor="middle" fontSize={10} fill="var(--graphite)">
              {t}
            </text>
          </g>
        ))}
      {yTicks &&
        ticks(sy.domain[0], sy.domain[1], 5).map((t) => (
          <g key={`y${t}`}>
            <line x1={x0 - 4} y1={sy(t)} x2={x0} y2={sy(t)} stroke="var(--graphite)" strokeWidth={1} />
            <text x={x0 - 7} y={sy(t) + 3.5} textAnchor="end" fontSize={10} fill="var(--graphite)">
              {t}
            </text>
          </g>
        ))}
      {xLabel && (
        <text x={(x0 + w - pad.r) / 2} y={h - 4} textAnchor="middle" fontSize={11} fill="var(--graphite)" fontStyle="italic">
          {xLabel}
        </text>
      )}
      {yLabel && (
        <text
          x={10}
          y={(pad.t + y0) / 2}
          textAnchor="middle"
          fontSize={11}
          fill="var(--graphite)"
          fontStyle="italic"
          transform={`rotate(-90 10 ${(pad.t + y0) / 2})`}
        >
          {yLabel}
        </text>
      )}
    </g>
  );
}

/** data dot in the app's monochrome language: class A = filled ink, class B = open circle */
export function Dot({
  x,
  y,
  cls = 'a',
  r = 5,
  faded = false,
}: {
  x: number;
  y: number;
  cls?: 'a' | 'b' | 'c';
  r?: number;
  faded?: boolean;
}) {
  const common = { cx: x, cy: y, r, opacity: faded ? 0.3 : 1 };
  if (cls === 'a') return <circle {...common} fill="var(--ink)" />;
  if (cls === 'b') return <circle {...common} fill="#fffdf8" stroke="var(--ink)" strokeWidth={1.6} />;
  // class c: graphite cross-dot
  return (
    <g opacity={faded ? 0.3 : 1}>
      <circle cx={x} cy={y} r={r} fill="var(--graphite)" opacity={0.55} />
      <circle cx={x} cy={y} r={r} fill="none" stroke="var(--ink)" strokeWidth={1} />
    </g>
  );
}

export function PlotSvg({
  frame,
  children,
  ...rest
}: { frame: PlotFrame; children: React.ReactNode } & React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox={`0 0 ${frame.w} ${frame.h}`}
      style={{ width: '100%', height: 'auto', display: 'block', background: '#fffdf8', borderRadius: 6 }}
      {...rest}
    >
      {children}
    </svg>
  );
}

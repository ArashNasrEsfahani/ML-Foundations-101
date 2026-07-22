import React, { useCallback, useState } from 'react';
import { SketchIcon } from '../sketch/SketchIcon';

export type SpeedId = 'slow' | 'normal' | 'fast';

/**
 * A training run at full tilt is a smear: the boundary is already fitted by the
 * time you have looked up from the slider, and the thing the widget exists to
 * show — *the process* — never happens on screen. Every animated widget gets
 * this, and every one defaults to a pace you can actually follow.
 *
 * `slow` is deliberately far slower than a fifth of normal in feel, because
 * these loops all run per animation frame: dividing the work per frame by five
 * multiplies the wall-clock time by five.
 */
const MULT: Record<SpeedId, number> = { slow: 0.2, normal: 1, fast: 4 };

const LABELS: [SpeedId, string, string][] = [
  ['slow', 'slow', 'one step at a time — watch what each update actually does'],
  ['normal', 'normal', 'quick enough to see the trend, slow enough to follow'],
  ['fast', 'fast', 'skip ahead to the result'],
];

export interface Speed {
  speed: SpeedId;
  setSpeed: (s: SpeedId) => void;
  /** milliseconds between ticks for a `useTicker` loop whose base pace is `baseMs` */
  ms: (baseMs: number) => number;
  /** iterations per animation frame for a `useRaf` loop whose base is `base` */
  steps: (base: number) => number;
}

export function useSpeed(initial: SpeedId = 'normal'): Speed {
  const [speed, setSpeed] = useState<SpeedId>(initial);
  const ms = useCallback((baseMs: number) => Math.round(baseMs / MULT[speed]), [speed]);
  const steps = useCallback((base: number) => Math.max(1, Math.round(base * MULT[speed])), [speed]);
  return { speed, setSpeed, ms, steps };
}

export function SpeedControl({ value, onChange }: { value: SpeedId; onChange: (s: SpeedId) => void }) {
  return (
    <span className="speed-control">
      <SketchIcon name="speed" size={15} title="playback speed" />
      <span>speed</span>
      {LABELS.map(([id, label, why]) => (
        <button
          key={id}
          className={value === id ? 'primary' : 'ghost'}
          aria-pressed={value === id}
          title={why}
          onClick={() => onChange(id)}
        >
          {label}
        </button>
      ))}
    </span>
  );
}

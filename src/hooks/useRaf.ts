import { useEffect, useRef, useState } from 'react';

/** Play/pause simulation loop. `step` runs every animation frame while playing. */
export function useRaf(step: (dtMs: number) => void, playing: boolean) {
  const cb = useRef(step);
  cb.current = step;

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const loop = (t: number) => {
      const dt = Math.min(100, t - last);
      last = t;
      cb.current(dt);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [playing]);
}

/** Simple interval ticker for step-based animations (slower than raf). */
export function useTicker(tick: () => void, playing: boolean, ms: number) {
  const cb = useRef(tick);
  cb.current = tick;
  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => cb.current(), ms);
    return () => clearInterval(id);
  }, [playing, ms]);
}

export function usePlayState(initial = false): [boolean, () => void, (v: boolean) => void] {
  const [playing, setPlaying] = useState(initial);
  return [playing, () => setPlaying((p) => !p), setPlaying];
}

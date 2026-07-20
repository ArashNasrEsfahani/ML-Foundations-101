import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { useTicker } from '../../../hooks/useRaf';
import { mulberry32 } from '../../../lib/rng';

const N = 10; // input image is N×N
const K = 3; // filter is K×K
const OUT = N - K + 1; // 8×8 output feature map (stride 1, no padding)

type Kernel = number[][];

/** Seeded 10×10 grayscale image: bright vertical bar + dark diagonal on a dim wash. */
function makeImage(): number[][] {
  const rand = mulberry32(60620);
  const img: number[][] = [];
  for (let r = 0; r < N; r++) {
    const row: number[] = [];
    for (let c = 0; c < N; c++) row.push(0.25 + rand() * 0.12);
    img.push(row);
  }
  for (let r = 0; r < N; r++) img[r][6] = 0.92 + rand() * 0.06; // vertical bright bar
  for (let r = 0; r < N; r++) img[r][r] = 0.04 + rand() * 0.05; // dark diagonal
  return img.map((row) => row.map((v) => Math.round(v * 100) / 100));
}

const IMAGE = makeImage();

const PRESETS: Record<string, { label: string; k: Kernel }> = {
  horizontal: { label: 'horizontal edge', k: [[-1, -1, -1], [0, 0, 0], [1, 1, 1]] },
  vertical: { label: 'vertical edge', k: [[-1, 0, 1], [-1, 0, 1], [-1, 0, 1]] },
  blur: { label: 'blur', k: [[1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9], [1 / 9, 1 / 9, 1 / 9]] },
  sharpen: { label: 'sharpen', k: [[0, -1, 0], [-1, 5, -1], [0, -1, 0]] },
};

const copyK = (k: Kernel): Kernel => k.map((row) => row.slice());

const sameK = (a: Kernel, b: Kernel): boolean =>
  a.every((row, r) => row.every((v, c) => Math.abs(v - b[r][c]) < 1e-9));

/** equal to the vertical-edge kernel, up to a global sign flip */
const isVerticalEdge = (f: Kernel): boolean => {
  const v = PRESETS.vertical.k;
  const neg = v.map((row) => row.map((x) => -x));
  return sameK(f, v) || sameK(f, neg);
};

/** t = 0 → ink, t = 1 → paper */
const mix = (t: number): string => {
  const tt = Math.max(0, Math.min(1, t));
  const r = Math.round(42 + 213 * tt);
  const g = Math.round(42 + 211 * tt);
  const b = Math.round(40 + 208 * tt);
  return `rgb(${r},${g},${b})`;
};

const fmt = (v: number, dp = 2): string => {
  const s = v.toFixed(dp);
  return s.includes('.') ? s.replace(/0+$/, '').replace(/\.$/, '') : s;
};

const cellStyle = (bg: string): React.CSSProperties => ({
  aspectRatio: '1',
  background: bg,
  boxShadow: 'inset 0 0 0 0.5px rgba(42,42,40,0.18)',
});

/**
 * ConvScrubber — slide a 3×3 filter over a 10×10 image, watch the moving
 * dot product fill an 8×8 feature map, then max-pool it down to 4×4.
 */
export function ConvScrubber({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const [preset, setPreset] = useState<string>('horizontal');
  const [filter, setFilter] = useState<Kernel>(() => copyK(PRESETS.horizontal.k));
  const [pos, setPos] = useState({ r: 0, c: 0 });
  const [visited, setVisited] = useState<Set<number>>(() => new Set([0]));
  const [sweeping, setSweeping] = useState(false);
  const [showPool, setShowPool] = useState(false);
  const [inspect, setInspect] = useState<{ r: number; c: number } | null>(null);
  const gridRef = useRef<HTMLDivElement | null>(null);

  // full 8×8 feature map for the current filter (cheap: 64 dot products)
  const { outputs, maxAbs } = useMemo(() => {
    const out: number[][] = [];
    let m = 1e-9;
    for (let r = 0; r < OUT; r++) {
      const row: number[] = [];
      for (let c = 0; c < OUT; c++) {
        let s = 0;
        for (let i = 0; i < K; i++) for (let j = 0; j < K; j++) s += IMAGE[r + i][c + j] * filter[i][j];
        row.push(s);
        m = Math.max(m, Math.abs(s));
      }
      out.push(row);
    }
    return { outputs: out, maxAbs: m };
  }, [filter]);

  const swept = visited.size === OUT * OUT;

  // challenge: vertical-edge filter (preset or hand-entered, up to sign) + full sweep
  const verticalActive = preset === 'vertical' || isVerticalEdge(filter);
  useEffect(() => {
    if (verticalActive && swept) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [verticalActive, swept]);

  const moveTo = (r: number, c: number) => {
    const rr = Math.max(0, Math.min(OUT - 1, r));
    const cc = Math.max(0, Math.min(OUT - 1, c));
    setPos({ r: rr, c: cc });
    setVisited((v) => {
      const next = new Set(v);
      next.add(rr * OUT + cc);
      return next;
    });
  };

  // sweep animation: row-major scan, one output cell per tick
  useTicker(
    () => {
      const { r, c } = pos;
      if (c < OUT - 1) moveTo(r, c + 1);
      else if (r < OUT - 1) moveTo(r + 1, 0);
      else setSweeping(false);
    },
    sweeping,
    55,
  );

  const applyPreset = (key: string) => {
    setSweeping(false);
    setPreset(key);
    setFilter(copyK(PRESETS[key].k));
    setVisited(new Set([pos.r * OUT + pos.c])); // new filter → the map must be re-scanned
    setShowPool(false);
  };

  const cycleCell = (i: number, j: number) => {
    setSweeping(false);
    setPreset('custom');
    setFilter((f) => {
      const next = copyK(f);
      const v = next[i][j];
      next[i][j] = v === -1 ? 0 : v === 0 ? 1 : v === 1 ? -1 : 0;
      return next;
    });
    setVisited(new Set([pos.r * OUT + pos.c]));
    setShowPool(false);
  };

  const startSweep = () => {
    setPos({ r: 0, c: 0 });
    setVisited(new Set([0]));
    setSweeping(true);
  };

  const reset = () => {
    setSweeping(false);
    setPreset('horizontal');
    setFilter(copyK(PRESETS.horizontal.k));
    setPos({ r: 0, c: 0 });
    setVisited(new Set([0]));
    setShowPool(false);
    setInspect(null);
  };

  // drag over the input image → move the window (center follows the pointer)
  const pointerToCell = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = gridRef.current;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    const c = Math.floor(((e.clientX - rect.left) / rect.width) * N);
    const r = Math.floor(((e.clientY - rect.top) / rect.height) * N);
    if (r < 0 || r >= N || c < 0 || c >= N) return null;
    return { r, c };
  };
  const dragging = useRef(false);
  const handlePointer = (e: React.PointerEvent<HTMLDivElement>, phase: 'down' | 'move') => {
    if (sweeping) return;
    if (phase === 'down') {
      dragging.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
    } else if (!dragging.current) return;
    const cell = pointerToCell(e);
    if (!cell) return;
    setInspect(cell);
    moveTo(cell.r - 1, cell.c - 1); // window centered on the pointed cell
  };

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (sweeping) return;
    const { r, c } = pos;
    if (e.key === 'ArrowLeft') moveTo(r, c - 1);
    else if (e.key === 'ArrowRight') moveTo(r, c + 1);
    else if (e.key === 'ArrowUp') moveTo(r - 1, c);
    else if (e.key === 'ArrowDown') moveTo(r + 1, c);
    else return;
    e.preventDefault();
  };

  // pooled 4×4 map (max over 2×2 blocks, stride 2)
  const pooled = useMemo(() => {
    const p: number[][] = [];
    for (let r = 0; r < OUT / 2; r++) {
      const row: number[] = [];
      for (let c = 0; c < OUT / 2; c++) {
        row.push(
          Math.max(outputs[2 * r][2 * c], outputs[2 * r][2 * c + 1], outputs[2 * r + 1][2 * c], outputs[2 * r + 1][2 * c + 1]),
        );
      }
      p.push(row);
    }
    return p;
  }, [outputs]);

  const sum = outputs[pos.r][pos.c];
  const outShade = (v: number): string => mix(0.5 - v / (2 * maxAbs));

  return (
    <WidgetFrame title="Convolution scrubber" onReset={reset} challenge={challenge} challengeDone={done}>
      <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: 'var(--graphite)' }}>
        The image hides a bright vertical bar and a dark diagonal. Drag over it (or use the
        arrows) to slide the 3×3 filter; each stop multiplies patch and filter cell by cell
        and sums — one value of the feature map. Tap a filter cell to cycle −1 / 0 / 1.
      </p>

      {/* controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center', marginBottom: 10 }}>
        <label style={{ fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          filter preset
          <select
            value={preset}
            onChange={(e) => applyPreset(e.target.value)}
            aria-label="Filter preset"
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: '0.88rem',
              color: 'var(--ink)',
              background: '#fffdf8',
              border: '1.5px solid var(--line)',
              borderRadius: 6,
              padding: '3px 6px',
            }}
          >
            {Object.entries(PRESETS).map(([key, p]) => (
              <option key={key} value={key}>
                {p.label}
              </option>
            ))}
            {preset === 'custom' && <option value="custom">custom</option>}
          </select>
        </label>
        <span style={{ display: 'inline-flex', gap: 4 }}>
          {([['◀', 0, -1], ['▲', -1, 0], ['▼', 1, 0], ['▶', 0, 1]] as const).map(([sym, dr, dc]) => (
            <button
              key={sym}
              className="ghost"
              onClick={() => !sweeping && moveTo(pos.r + dr, pos.c + dc)}
              aria-label={`Step window ${sym === '◀' ? 'left' : sym === '▶' ? 'right' : sym === '▲' ? 'up' : 'down'}`}
              style={{ padding: '3px 9px', fontSize: '0.8rem' }}
            >
              {sym}
            </button>
          ))}
        </span>
        <button className="primary" onClick={sweeping ? () => setSweeping(false) : startSweep} style={{ padding: '4px 14px', fontSize: '0.88rem' }}>
          {sweeping ? 'Stop' : 'Sweep'}
        </button>
        <button
          onClick={() => setShowPool((s) => !s)}
          disabled={!swept}
          title={swept ? undefined : 'finish the sweep first'}
          style={{ padding: '4px 12px', fontSize: '0.88rem' }}
        >
          {showPool ? 'Hide 2×2 max-pool' : '2×2 max-pool'}
        </button>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
        {/* input image */}
        <div style={{ flex: '1 1 220px', maxWidth: 300 }}>
          <div
            ref={gridRef}
            onPointerDown={(e) => handlePointer(e, 'down')}
            onPointerMove={(e) => handlePointer(e, 'move')}
            onPointerUp={() => (dragging.current = false)}
            onKeyDown={onKey}
            tabIndex={0}
            role="grid"
            aria-label="10 by 10 input image; drag or use arrow keys to move the filter window"
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: `repeat(${N}, 1fr)`,
              border: '1.5px solid var(--line)',
              borderRadius: 4,
              overflow: 'hidden',
              touchAction: 'none',
              cursor: 'crosshair',
            }}
          >
            {IMAGE.map((row, r) =>
              row.map((v, c) => (
                <div key={`${r}-${c}`} title={`input(${r},${c}) = ${fmt(v)}`} style={cellStyle(mix(v))} />
              )),
            )}
            {/* filter window highlight — glides between cells instead of jumping.
                The box spans 3 of 10 columns, so one cell = 100/3 % of its own width. */}
            <div
              style={{
                position: 'absolute',
                left: 0,
                top: 0,
                width: '30%',
                height: '30%',
                transform: `translate(${(pos.c * 100) / 3}%, ${(pos.r * 100) / 3}%)`,
                transition: 'transform 0.12s cubic-bezier(0.22, 0.8, 0.3, 1)',
                border: '2.5px solid var(--ink)',
                borderRadius: 2,
                pointerEvents: 'none',
                boxShadow: '0 0 0 1.5px #fffdf8',
              }}
            />
          </div>
          <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: 'var(--graphite)', fontFamily: 'var(--font-mono)' }}>
            {inspect
              ? `input(${inspect.r},${inspect.c}) = ${fmt(IMAGE[inspect.r][inspect.c])}`
              : 'tap a pixel to read its value'}
          </p>
        </div>

        {/* filter + live equation */}
        <div style={{ flex: '0 1 190px', minWidth: 160 }}>
          <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: 'var(--graphite)' }}>filter (tap to edit)</p>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${K}, 40px)`, gap: 3 }}>
            {filter.map((row, i) =>
              row.map((v, j) => (
                <button
                  key={`${i}-${j}`}
                  onClick={() => cycleCell(i, j)}
                  aria-label={`filter cell row ${i} column ${j}, value ${fmt(v)}`}
                  style={{
                    padding: 0,
                    width: 40,
                    height: 40,
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.82rem',
                    background: '#fffdf8',
                  }}
                >
                  {fmt(v)}
                </button>
              )),
            )}
          </div>
          <p style={{ margin: '10px 0 4px', fontSize: '0.8rem', color: 'var(--graphite)' }}>
            patch × filter, cell by cell:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${K}, 1fr)`, gap: 2, maxWidth: 180 }}>
            {filter.map((row, i) =>
              row.map((f, j) => {
                const text = `${fmt(IMAGE[pos.r + i][pos.c + j])}·${fmt(f)}`;
                return (
                  // each product pops when its value changes — muted during a sweep,
                  // where 9 cells changing every 55ms would just be noise
                  <div
                    key={sweeping ? `${i}-${j}` : `${i}-${j}-${text}`}
                    className={sweeping ? undefined : 'anim-bump'}
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.66rem',
                      textAlign: 'center',
                      padding: '3px 1px',
                      background: 'var(--paper-2)',
                      borderRadius: 3,
                    }}
                  >
                    {text}
                  </div>
                );
              }),
            )}
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '0.95rem', fontFamily: 'var(--font-mono)' }}>
            output({pos.r},{pos.c}) ={' '}
            <strong
              key={sweeping ? 'sum' : `sum-${fmt(sum)}`}
              className={sweeping ? undefined : 'anim-bump'}
              style={{ display: 'inline-block' }}
            >
              {fmt(sum)}
            </strong>
          </p>
        </div>

        {/* feature map + pooled map */}
        <div style={{ flex: '0 1 210px', minWidth: 170 }}>
          <p style={{ margin: '0 0 4px', fontSize: '0.8rem', color: 'var(--graphite)' }}>
            8×8 feature map ({visited.size}/{OUT * OUT} computed)
            {swept && (
              <strong className="anim-pop" style={{ display: 'inline-block', marginLeft: 5 }}>
                ✓
              </strong>
            )}
          </p>
          <div
            style={{
              position: 'relative',
              display: 'grid',
              gridTemplateColumns: `repeat(${OUT}, 1fr)`,
              border: '1.5px solid var(--line)',
              borderRadius: 4,
              overflow: 'hidden',
            }}
          >
            {outputs.map((row, r) =>
              row.map((v, c) => {
                const seen = visited.has(r * OUT + c);
                const current = r === pos.r && c === pos.c;
                return (
                  // re-keying on `seen` remounts the cell the moment it is computed,
                  // so it pops into the map as the window passes over it
                  <div
                    key={`${r}-${c}-${seen}`}
                    className={seen ? 'anim-pop' : undefined}
                    title={seen ? `output(${r},${c}) = ${fmt(v)}` : `output(${r},${c}) — not computed yet`}
                    style={{
                      ...cellStyle(seen ? outShade(v) : '#fffdf8'),
                      ...(seen ? {} : { boxShadow: 'inset 0 0 0 0.5px var(--line)' }),
                      ...(current ? { outline: '2px solid var(--ink)', outlineOffset: -2 } : {}),
                    }}
                  />
                );
              }),
            )}
          </div>
          <p style={{ margin: '4px 0 0', fontSize: '0.72rem', color: 'var(--graphite)' }}>
            dark = strong positive response, light = negative
          </p>
          {showPool && (
            <>
              <p style={{ margin: '10px 0 4px', fontSize: '0.8rem', color: 'var(--graphite)' }}>
                after 2×2 max-pool (stride 2) → 4×4
              </p>
              <div
                className="anim-rise"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${OUT / 2}, 1fr)`,
                  border: '1.5px solid var(--line)',
                  borderRadius: 4,
                  overflow: 'hidden',
                  maxWidth: 120,
                }}
              >
                {pooled.map((row, r) =>
                  row.map((v, c) => (
                    <div key={`${r}-${c}`} title={`pooled(${r},${c}) = ${fmt(v)}`} style={cellStyle(outShade(v))} />
                  )),
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <p style={{ margin: '10px 0 0', fontSize: '0.95rem' }}>
        {verticalActive && swept ? (
          <strong className="anim-pop" style={{ display: 'inline-block' }}>
            Vertical edges found — the feature map lights up along both sides of the bright bar.
          </strong>
        ) : verticalActive ? (
          <>Right filter! Now press <strong>Sweep</strong> to scan the whole image.</>
        ) : (
          <>
            Which filter makes the <em>vertical</em> bar glow in the feature map? Compare what
            each preset responds to — or build your own from −1 / 0 / 1 cells.
          </>
        )}
      </p>
    </WidgetFrame>
  );
}

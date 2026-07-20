import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { makeFrame, Axes, Dot, PlotSvg } from '../Plot';
import { noisy2d } from '../../../content/datasets/noisy2d';
import {
  trainTree,
  treePredict,
  baggedTrees,
  forestPredict,
  forestVoteFraction,
  accuracy,
  type Pt2L,
} from '../../../lib/ml/stumps';

const W = 420;
const H = 340;
const GRID = 60;
const DEPTH = 2;
const FOREST_SEED = 2024;

/**
 * One depth-2 tree vs a bagged forest on noisy two-blob data.
 * A coarse grayscale canvas raster under the SVG shows the decision regions:
 * the forest's vote-fraction shading makes its smoother boundary visible.
 */
export function EnsembleSandbox({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const pts = useMemo(() => noisy2d() as Pt2L[], []);
  const [mode, setMode] = useState<'tree' | 'forest'>('tree');
  const [nTrees, setNTrees] = useState(10);
  // two stacked rasters: the new boundary is drawn into whichever canvas is
  // currently hidden, then the pair swaps opacity — so the boundary cross-fades
  // instead of flickering. No per-frame work; one swap per discrete change.
  const canvasA = useRef<HTMLCanvasElement>(null);
  const canvasB = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef(1);
  const [front, setFront] = useState(1);

  const frame = makeFrame(W, H, [0, 10], [0, 10]);

  const tree = useMemo(() => trainTree(pts, DEPTH), [pts]);
  const forest = useMemo(() => baggedTrees(pts, nTrees, DEPTH, FOREST_SEED), [pts, nTrees]);
  const treeAcc = useMemo(() => accuracy(pts, (p) => treePredict(tree, p)), [pts, tree]);
  const forestAcc = useMemo(() => accuracy(pts, (p) => forestPredict(forest, p)), [pts, forest]);

  // raster the decision regions (recomputed only on discrete state changes)
  useEffect(() => {
    // draw into the back canvas, then bring it forward
    const back = frontRef.current === 0 ? canvasB.current : canvasA.current;
    const ctx = back?.getContext('2d');
    if (!back || !ctx) return;
    const img = ctx.createImageData(GRID, GRID);
    for (let r = 0; r < GRID; r++) {
      const y = 10 - ((r + 0.5) / GRID) * 10;
      for (let c = 0; c < GRID; c++) {
        const x = ((c + 0.5) / GRID) * 10;
        const frac =
          mode === 'tree'
            ? treePredict(tree, { x, y }) === 1
              ? 1
              : 0
            : forestVoteFraction(forest, { x, y });
        const i = (r * GRID + c) * 4;
        img.data[i] = 52;
        img.data[i + 1] = 52;
        img.data[i + 2] = 52;
        img.data[i + 3] = Math.round(12 + 58 * frac); // grayscale wash, darker = class A
      }
    }
    ctx.putImageData(img, 0, 0);
    frontRef.current = frontRef.current === 0 ? 1 : 0;
    setFront(frontRef.current);
  }, [mode, tree, forest]);

  const misclassified = useMemo(() => {
    const predict =
      mode === 'tree'
        ? (p: { x: number; y: number }) => treePredict(tree, p)
        : (p: { x: number; y: number }) => forestPredict(forest, p);
    return pts.map((p) => predict(p) !== p.label);
  }, [mode, tree, forest, pts]);

  const goalMet = mode === 'forest' && nTrees >= 20 && forestAcc > treeAcc;
  useEffect(() => {
    if (goalMet) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalMet]);

  const reset = () => {
    setMode('tree');
    setNTrees(10);
  };

  const pct = (v: number) => `${(v * 100).toFixed(1)}%`;
  const inner = {
    left: `${(frame.pad.l / W) * 100}%`,
    top: `${(frame.pad.t / H) * 100}%`,
    width: `${((W - frame.pad.l - frame.pad.r) / W) * 100}%`,
    height: `${((H - frame.pad.t - frame.pad.b) / H) * 100}%`,
  };

  return (
    <WidgetFrame
      title="Grow a forest"
      onReset={reset}
      challenge={challenge}
      challengeDone={done}
    >
      <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: 'var(--graphite)' }}>
        Two noisy classes: filled dots vs open circles (about 12% of the labels are flipped on
        purpose). Compare one small tree with a bagged forest — the forest’s shading is its vote
        fraction, so a soft gradient means the trees disagree there.
      </p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
        <button
          className={mode === 'tree' ? 'primary' : ''}
          onClick={() => setMode('tree')}
          style={{ padding: '5px 12px', fontSize: '0.9rem' }}
        >
          one deep-ish tree
        </button>
        <button
          className={mode === 'forest' ? 'primary' : ''}
          onClick={() => setMode('forest')}
          style={{ padding: '5px 12px', fontSize: '0.9rem' }}
        >
          bagged forest
        </button>
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            fontSize: '0.9rem',
            color: mode === 'forest' ? 'var(--ink)' : 'var(--graphite)',
          }}
        >
          trees: <strong style={{ minWidth: 22, textAlign: 'right' }}>{nTrees}</strong>
          <input
            type="range"
            min={1}
            max={30}
            step={1}
            value={nTrees}
            disabled={mode === 'tree'}
            onChange={(e) => setNTrees(Number(e.target.value))}
            aria-label="number of trees in the forest"
          />
        </label>
      </div>
      <div style={{ position: 'relative', background: '#fffdf8', borderRadius: 6 }}>
        <canvas
          ref={canvasA}
          width={GRID}
          height={GRID}
          style={{
            position: 'absolute',
            ...inner,
            pointerEvents: 'none',
            opacity: front === 0 ? 1 : 0,
            transition: 'opacity 280ms ease',
          }}
        />
        <canvas
          ref={canvasB}
          width={GRID}
          height={GRID}
          style={{
            position: 'absolute',
            ...inner,
            pointerEvents: 'none',
            opacity: front === 1 ? 1 : 0,
            transition: 'opacity 280ms ease',
          }}
        />
        <PlotSvg
          frame={frame}
          style={{ width: '100%', height: 'auto', display: 'block', background: 'transparent', position: 'relative' }}
        >
          <Axes frame={frame} xLabel="feature 1" yLabel="feature 2" />
          {pts.map((p, i) => (
            <g key={i}>
              <Dot x={frame.sx(p.x)} y={frame.sy(p.y)} cls={p.label === 1 ? 'a' : 'b'} r={4.5} />
              {misclassified[i] && (
                <circle
                  cx={frame.sx(p.x)}
                  cy={frame.sy(p.y)}
                  r={8.5}
                  fill="none"
                  stroke="var(--graphite)"
                  strokeWidth={1.1}
                  strokeDasharray="3 2"
                />
              )}
            </g>
          ))}
        </PlotSvg>
      </div>
      <p style={{ margin: '10px 0 0', fontSize: '0.95rem' }}>
        Train accuracy — single tree: <strong>{pct(treeAcc)}</strong>
        {' · '}forest of {nTrees}:{' '}
        <strong key={pct(forestAcc)} className="anim-bump" style={{ display: 'inline-block' }}>
          {pct(forestAcc)}
        </strong>
        {mode === 'forest' && forestAcc > treeAcc && nTrees >= 20 ? (
          <>
            {' — '}
            <strong className="anim-pop" style={{ display: 'inline-block' }}>
              the council of weak trees wins.
            </strong>
          </>
        ) : mode === 'forest' && forestAcc <= treeAcc ? (
          ' — more trees, more diversity: keep sliding.'
        ) : null}
      </p>
    </WidgetFrame>
  );
}

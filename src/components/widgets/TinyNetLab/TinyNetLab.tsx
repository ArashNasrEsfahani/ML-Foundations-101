import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { Dot } from '../Plot';
import { useRaf, usePlayState } from '../../../hooks/useRaf';
import { useSpeed, SpeedControl } from '../SpeedControl';
import { hashString } from '../../../lib/rng';
import {
  createNet,
  forward,
  trainBatch,
  accuracy,
  type Net,
  type Sample,
} from '../../../lib/ml/nn';
import { xorQuads, circleSet, spiralSet, type NNPoint } from '../../../content/datasets/nnsets';

const SIZE = 340; // svg viewBox for the main pane
const RASTER = 64; // canvas raster resolution
const DOM = 1.05; // world half-extent: [-DOM, DOM]²
/**
 * Milliseconds per epoch at normal speed — a wall-clock pace, deliberately not
 * a count of epochs per animation frame. XOR is solved by about epoch 20, so
 * even the slowest whole number of epochs per frame (one) would be over in a
 * third of a second: the learning this widget exists to show would happen
 * before the reader looked up from the Play button. 100 ms gives 10 epochs a
 * second, 2 on slow, 40 on fast.
 */
const MS_PER_EPOCH = 100;
const EPOCH_CAP = 8000;

type DatasetKey = 'xor' | 'circle' | 'spiral';

const DATA: Record<DatasetKey, { label: string; pts: NNPoint[] }> = {
  xor: { label: 'XOR', pts: xorQuads() },
  circle: { label: 'Circle', pts: circleSet() },
  spiral: { label: 'Spiral', pts: spiralSet() },
};

const SAMPLES: Record<DatasetKey, Sample[]> = {
  xor: DATA.xor.pts.map((p) => ({ x: [p.x, p.y] as [number, number], y: p.label })),
  circle: DATA.circle.pts.map((p) => ({ x: [p.x, p.y] as [number, number], y: p.label })),
  spiral: DATA.spiral.pts.map((p) => ({ x: [p.x, p.y] as [number, number], y: p.label })),
};

const seedFor = (ds: DatasetKey, hidden: number, run: number): number =>
  (hashString(ds) % 100000) + hidden * 131 + run * 7919 + 5;

const px = (wx: number): number => ((wx + DOM) / (2 * DOM)) * SIZE;
const py = (wy: number): number => ((DOM - wy) / (2 * DOM)) * SIZE;

/** ink/graphite network diagram: line opacity and width ∝ |weight|. */
function NetDiagram({ net }: { net: Net }) {
  const W = 210;
  const H = 220;
  const cols = [36, 105, 174];
  const yAt = (n: number, i: number): number => {
    const gap = Math.min(28, (H - 44) / Math.max(1, n - 1));
    return H / 2 + (i - (n - 1) / 2) * gap;
  };
  const nIn = net.sizes[0];
  const nHid = net.sizes[1];
  let maxAbs = 1e-6;
  for (const layer of net.weights) for (const row of layer) for (const w of row) maxAbs = Math.max(maxAbs, Math.abs(w));

  const edges: { x1: number; y1: number; x2: number; y2: number; w: number }[] = [];
  for (let u = 0; u < nHid; u++) {
    for (let i = 0; i < nIn; i++) {
      edges.push({ x1: cols[0], y1: yAt(nIn, i), x2: cols[1], y2: yAt(nHid, u), w: net.weights[0][u][i] });
    }
    edges.push({ x1: cols[1], y1: yAt(nHid, u), x2: cols[2], y2: yAt(1, 0), w: net.weights[1][0][u] });
  }

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', background: '#fffdf8', borderRadius: 6, border: '1.5px solid var(--line)' }} role="img" aria-label="Network diagram: 2 inputs, hidden layer, 1 output">
      {/* A short transition damps the per-frame weight jitter into a smooth
          thickening. It is deliberately brief: these values are rewritten every
          animation frame during training, so a long transition would both lag
          badly and add needless interpolation work. */}
      <style>{`.mlw-edge { transition: stroke-width 140ms linear, opacity 140ms linear; }`}</style>
      {edges.map((e, k) => {
        const t = Math.min(1, Math.abs(e.w) / maxAbs);
        return (
          <line
            key={k}
            className="mlw-edge"
            x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
            stroke={e.w >= 0 ? 'var(--ink)' : 'var(--graphite)'}
            strokeDasharray={e.w >= 0 ? undefined : '4 3'}
            strokeWidth={0.7 + 1.9 * t}
            opacity={0.12 + 0.88 * t}
          />
        );
      })}
      {Array.from({ length: nIn }, (_, i) => (
        <g key={`in${i}`}>
          <circle cx={cols[0]} cy={yAt(nIn, i)} r={10} fill="#fffdf8" stroke="var(--ink)" strokeWidth={1.5} />
          <text x={cols[0]} y={yAt(nIn, i) + 3.5} textAnchor="middle" fontSize={10} fill="var(--ink)">
            x{i + 1}
          </text>
        </g>
      ))}
      {Array.from({ length: nHid }, (_, u) => (
        <circle key={`h${u}`} cx={cols[1]} cy={yAt(nHid, u)} r={9} fill="#fffdf8" stroke="var(--ink)" strokeWidth={1.5} />
      ))}
      <circle cx={cols[2]} cy={yAt(1, 0)} r={10} fill="#fffdf8" stroke="var(--ink)" strokeWidth={1.5} />
      <text x={cols[2]} y={yAt(1, 0) + 3.5} textAnchor="middle" fontSize={10} fill="var(--ink)">
        ŷ
      </text>
    </svg>
  );
}

/** last-200-epoch loss sparkline, graphite on paper. */
function LossSpark({ hist }: { hist: number[] }) {
  const W = 210;
  const H = 52;
  const win = hist.slice(-200);
  let path: string | null = null;
  if (win.length >= 2) {
    const max = Math.max(...win, 1e-9);
    path = win
      .map((v, i) => `${((i / (win.length - 1)) * (W - 10) + 5).toFixed(1)},${(H - 6 - (v / max) * (H - 16)).toFixed(1)}`)
      .join(' ');
  }
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block', background: '#fffdf8', borderRadius: 6, border: '1.5px solid var(--line)' }} role="img" aria-label="Training loss sparkline">
      <text x={7} y={13} fontSize={9} fill="var(--graphite)" fontStyle="italic">
        loss (last 200 epochs)
      </text>
      {path ? (
        <polyline points={path} fill="none" stroke="var(--ink)" strokeWidth={1.4} strokeLinejoin="round" />
      ) : (
        <text x={W / 2} y={H / 2 + 8} textAnchor="middle" fontSize={10} fill="var(--graphite)">
          press play to train
        </text>
      )}
    </svg>
  );
}

/**
 * TinyNetLab — train a 2→n→1 network live: pick a dataset, watch the decision
 * boundary raster form under the scatter, see weights thicken in the diagram.
 */
export function TinyNetLab({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const [dataset, setDataset] = useState<DatasetKey>('xor');
  const [hidden, setHidden] = useState(4);
  const [lr, setLr] = useState(0.5);
  const [run, setRun] = useState(0);
  const [playing, togglePlay, setPlaying] = usePlayState(false);
  const speed = useSpeed();
  const [stats, setStats] = useState({ epoch: 0, acc: 0, loss: NaN });

  const [burstKey, setBurstKey] = useState(0);

  const netRef = useRef<Net | null>(null);
  const lossHist = useRef<number[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const burstedRef = useRef(false);

  // lazy init so the first render has a diagram to draw
  if (netRef.current === null) {
    netRef.current = createNet([2, hidden, 1], seedFor(dataset, hidden, run));
  }

  const samples = SAMPLES[dataset];
  const pts = DATA[dataset].pts;

  const paintRaster = () => {
    const cv = canvasRef.current;
    const net = netRef.current;
    if (!cv || !net) return;
    const ctx = cv.getContext('2d');
    if (!ctx) return;
    const img = ctx.createImageData(RASTER, RASTER);
    const d = img.data;
    const input: number[] = [0, 0];
    const L = net.weights.length;
    for (let r = 0; r < RASTER; r++) {
      const wy = DOM - ((r + 0.5) / RASTER) * 2 * DOM;
      for (let c = 0; c < RASTER; c++) {
        input[0] = -DOM + ((c + 0.5) / RASTER) * 2 * DOM;
        input[1] = wy;
        const p = forward(net, input)[L][0];
        // paper (class 0) → graphite wash (class 1), soft mid-gray near p = 0.5
        const k = (r * RASTER + c) * 4;
        d[k] = Math.round(255 - 71 * p);
        d[k + 1] = Math.round(253 - 71 * p);
        d[k + 2] = Math.round(248 - 68 * p);
        d[k + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  };

  const rebuild = (ds: DatasetKey, h: number, runId: number) => {
    netRef.current = createNet([2, h, 1], seedFor(ds, h, runId));
    lossHist.current = [];
    burstedRef.current = false; // a fresh run may celebrate again
    setStats({ epoch: 0, acc: accuracy(netRef.current, SAMPLES[ds]), loss: NaN });
    paintRaster();
  };

  // initial raster once the canvas exists
  useEffect(() => {
    paintRaster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const trainEpochs = (n: number) => {
    const net = netRef.current;
    if (!net) return;
    let loss = NaN;
    for (let e = 0; e < n; e++) {
      loss = trainBatch(net, samples, lr);
      lossHist.current.push(loss);
    }
    const epoch = lossHist.current.length;
    paintRaster(); // raf-cadence repaint: once per burst, never per epoch
    setStats({ epoch, acc: accuracy(net, samples), loss });
    if (epoch >= EPOCH_CAP) setPlaying(false);
  };

  // fraction of an epoch owed from the last frame, so a pace below one epoch
  // per frame is expressible at all
  const owed = useRef(0);
  useRaf((dt) => {
    owed.current += dt / speed.ms(MS_PER_EPOCH);
    const n = Math.floor(owed.current);
    if (n < 1) return; // nothing to draw either, so skip the repaint and the render
    owed.current -= n;
    trainEpochs(n);
  }, playing);

  // challenge: ≥ 95% accuracy on the XOR dataset
  useEffect(() => {
    if (dataset === 'xor' && stats.epoch > 0 && stats.acc >= 0.95) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, dataset]);

  // one-shot celebration ring. `stats` updates every animation frame, so the
  // ref latch keeps this to a single extra render per run — no per-frame churn.
  useEffect(() => {
    if (dataset === 'xor' && stats.epoch > 0 && stats.acc >= 0.95 && !burstedRef.current) {
      burstedRef.current = true;
      setBurstKey((k) => k + 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stats, dataset]);

  const selectDataset = (k: DatasetKey) => {
    setPlaying(false);
    setDataset(k);
    rebuild(k, hidden, run);
  };
  const changeHidden = (h: number) => {
    setPlaying(false);
    setHidden(h);
    rebuild(dataset, h, run);
  };
  const reset = () => {
    setPlaying(false);
    const r = run + 1;
    setRun(r);
    rebuild(dataset, hidden, r); // fresh seed: new random starting weights
  };

  const net = netRef.current;

  return (
    <WidgetFrame
      title="TinyNet Lab"
      intro={
        <>
          Filled dots are class 1, open dots class 0. Press <em>Play</em> and watch gradient
          descent bend the shaded decision boundary around the data — at <em>slow</em> it moves
          one epoch at a time, which is the whole thing worth seeing here.
        </>
      }
      guide={[
        {
          control: 'XOR',
          what: 'Two diagonal pairs of clusters: no straight line can separate them, so the hidden layer has to bend one. This is the set the challenge is scored on.',
        },
        {
          control: 'Circle',
          what: 'One class ringed by the other. Watch the boundary close into a loop rather than sweep across the plane.',
        },
        {
          control: 'Spiral',
          what: 'Two interleaved arms — the hardest set here, and the one where 2 hidden units visibly are not enough. Expect a long run and partial accuracy.',
        },
        {
          control: 'hidden units',
          what: 'How many neurons sit in the middle layer, i.e. the network’s [[model-capacity|capacity]] to bend the boundary. Moving it restarts the run with fresh weights.',
        },
        {
          control: 'learning rate',
          what: 'The size of every [[gradient-descent]] step — see [[learning-rate]]. `0.1` crawls smoothly downhill, `1.0` races and can make the loss bounce instead of settle.',
        },
        {
          control: 'Play / Pause',
          what: 'Trains [[epoch|epochs]] continuously at the pace set by *speed*. The run stops by itself at 8000 epochs.',
        },
        {
          control: 'Step ×5',
          what: 'Trains exactly five epochs and stops, so you can see what one nudge of [[backpropagation]] does to the boundary. Only available while paused.',
        },
        {
          control: 'speed',
          what: 'Epochs per second while playing: 2 on *slow*, 10 on *normal*, 40 on *fast*. XOR is solved by about epoch 20, so on slow you can watch that happen one epoch at a time.',
        },
        {
          control: 'reset',
          what: 'Re-rolls the starting weights and clears the loss history, keeping the same data. A run stuck at 50% often solves on the next roll.',
        },
        {
          control: 'shaded background',
          what: 'The network’s prediction at every point of the plane: dark gray = class 1, paper = class 0, mid-gray = unsure. That mid-gray ribbon *is* the decision boundary.',
        },
        {
          control: 'epoch',
          what: 'One epoch is one pass of backpropagation over all the points. It counts the epochs trained so far, not the frames drawn.',
        },
        {
          control: 'accuracy',
          what: 'Share of the training points currently labeled correctly. On XOR, 50% means the network has settled for a straight line and needs a reset.',
        },
        {
          control: 'loss',
          what: 'Mean squared error over the training points: how *wrong* the outputs are, not only how many are wrong. It falls long before the accuracy moves.',
        },
        {
          control: 'loss (last 200 epochs)',
          what: 'The recent loss curve, rescaled to its own window so its shape stays visible as the numbers shrink. Flat means the run has [[convergence|converged]] — or is stuck.',
        },
        {
          control: 'line strength ∝ |weight|',
          what: 'In the diagram, thickness is the size of a weight and dashed means negative. A few edges thickening while the rest fade is the network choosing which hidden units do the work.',
        },
      ]}
      onReset={reset}
      challenge={challenge}
      challengeDone={done}
    >
      {/* controls */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'center', marginBottom: 10 }}>
        <span style={{ display: 'inline-flex', gap: 6 }}>
          {(Object.keys(DATA) as DatasetKey[]).map((k) => (
            <button
              key={k}
              className={dataset === k ? 'primary' : 'ghost'}
              onClick={() => selectDataset(k)}
              style={{ padding: '4px 12px', fontSize: '0.88rem' }}
            >
              {DATA[k].label}
            </button>
          ))}
        </span>
        <label style={{ fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          hidden units: <strong>{hidden}</strong>
          <input
            type="range"
            min={2}
            max={8}
            step={1}
            value={hidden}
            onChange={(e) => changeHidden(Number(e.target.value))}
            style={{ width: 90 }}
            aria-label="Number of hidden units"
          />
        </label>
        <label style={{ fontSize: '0.88rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          learning rate
          <select
            value={String(lr)}
            onChange={(e) => setLr(Number(e.target.value))}
            aria-label="Learning rate"
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
            <option value="0.1">0.1</option>
            <option value="0.5">0.5</option>
            <option value="1">1.0</option>
          </select>
        </label>
        <span style={{ display: 'inline-flex', gap: 6 }}>
          <button className="primary" onClick={togglePlay} style={{ padding: '4px 14px', fontSize: '0.88rem' }}>
            {playing ? 'Pause' : 'Play'}
          </button>
          <button onClick={() => trainEpochs(5)} disabled={playing} style={{ padding: '4px 12px', fontSize: '0.88rem' }}>
            Step ×5
          </button>
        </span>
        <SpeedControl value={speed.speed} onChange={speed.setSpeed} />
      </div>

      {/* main pane + side pane */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-start' }}>
        <div
          style={{
            position: 'relative',
            flex: '1 1 250px',
            maxWidth: 400,
            aspectRatio: '1',
            border: '1.5px solid var(--line)',
            borderRadius: 6,
            overflow: 'hidden',
            background: '#fffdf8',
          }}
        >
          <canvas
            ref={canvasRef}
            width={RASTER}
            height={RASTER}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}
            aria-hidden
          />
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
            role="img"
            aria-label="Scatter of the training points over the predicted decision regions"
          >
            {pts.map((p, i) => (
              <Dot key={i} x={px(p.x)} y={py(p.y)} cls={p.label === 1 ? 'a' : 'b'} r={4.5} />
            ))}
            {burstKey > 0 && (
              <circle
                key={burstKey}
                className="anim-ring-burst"
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={72}
                fill="none"
                stroke="var(--ink)"
                strokeWidth={2.6}
                style={{ transformBox: 'fill-box', transformOrigin: 'center', pointerEvents: 'none' }}
              />
            )}
          </svg>
        </div>

        <div style={{ flex: '0 1 220px', minWidth: 180, display: 'flex', flexDirection: 'column', gap: 8 }}>
          <NetDiagram net={net} />
          <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--graphite)' }}>
            line strength ∝ |weight| · dashed = negative
          </p>
          <LossSpark hist={lossHist.current} />
          {/* tabular figures: the counter ticks every frame, and proportional
              digits would make the whole line shuffle sideways as it runs */}
          <p
            style={{
              margin: 0,
              fontSize: '0.92rem',
              fontFamily: 'var(--font-mono)',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            epoch <strong>{stats.epoch}</strong> · accuracy{' '}
            <strong>{(stats.acc * 100).toFixed(0)}%</strong> · loss{' '}
            <strong>{Number.isFinite(stats.loss) ? stats.loss.toFixed(3) : '—'}</strong>
          </p>
        </div>
      </div>

      <p style={{ margin: '10px 0 0', fontSize: '0.95rem' }}>
        {dataset === 'xor' && stats.acc >= 0.95 && stats.epoch > 0 ? (
          <strong className="anim-pop" style={{ display: 'inline-block' }}>
            XOR solved — the hidden units carved the plane into the right quadrants.
          </strong>
        ) : dataset === 'xor' ? (
          <>Goal: reach 95%+ accuracy here on the XOR set. Stuck near 50%? Reset for a new start.</>
        ) : (
          <>The challenge counts on the XOR set — this one is for exploring capacity.</>
        )}
      </p>
    </WidgetFrame>
  );
}

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { makeFrame, Axes, Dot, PlotSvg } from '../Plot';
import { useSvgDrag } from '../../../hooks/useDrag';
import { mulberry32 } from '../../../lib/rng';
import { knnPredict, distance, type KnnPoint, type Metric } from '../../../lib/ml/knn';

const W = 420;
const H = 340;
const G = 60; // decision-region raster resolution
const MAX_PTS = 60;

type Pen = 'a' | 'b' | 'erase';

function seedPoints(): KnnPoint[] {
  const rand = mulberry32(60601);
  const jitter = () => (rand() - 0.5) * 1.6;
  const pts: KnnPoint[] = [];
  for (let i = 0; i < 3; i++) pts.push({ x: 3 + jitter(), y: 6.5 + jitter(), label: 1 });
  for (let i = 0; i < 3; i++) pts.push({ x: 7 + jitter(), y: 3.5 + jitter(), label: -1 });
  return pts;
}

/**
 * Paint your own dataset and watch kNN carve the plane. Compare k = 1 against
 * k = 7 to see how much the neighborhood size changes the map.
 */
export function KnnPainter({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const [points, setPoints] = useState<KnnPoint[]>(() => seedPoints());
  const [pen, setPen] = useState<Pen>('a');
  const [k, setK] = useState(3);
  const [metric, setMetric] = useState<Metric>('euclidean');
  const [compareFrac, setCompareFrac] = useState<number | null>(null);
  // two stacked rasters so the regions cross-fade when k or the metric changes
  const canvasA = useRef<HTMLCanvasElement | null>(null);
  const canvasB = useRef<HTMLCanvasElement | null>(null);
  const frontRef = useRef(1);
  const [front, setFront] = useState(1);

  const frame = makeFrame(W, H, [0, 10], [0, 10]);

  // ---- paint the decision regions (throttled)
  useEffect(() => {
    const t = setTimeout(() => {
      const cv = frontRef.current === 0 ? canvasB.current : canvasA.current;
      const ctx = cv?.getContext('2d');
      if (!cv || !ctx) return;
      const img = ctx.createImageData(G, G);
      for (let j = 0; j < G; j++) {
        for (let i = 0; i < G; i++) {
          const x = (10 * (i + 0.5)) / G;
          const y = 10 * (1 - (j + 0.5) / G);
          const label = points.length ? knnPredict(points, { x, y }, k, metric) : 1;
          const kIdx = (j * G + i) * 4;
          img.data[kIdx] = 42;
          img.data[kIdx + 1] = 42;
          img.data[kIdx + 2] = 40;
          img.data[kIdx + 3] = label === 1 ? 40 : 10; // two grays
        }
      }
      ctx.putImageData(img, 0, 0);
      frontRef.current = frontRef.current === 0 ? 1 : 0;
      setFront(frontRef.current);
    }, 120);
    return () => clearTimeout(t);
  }, [points, k, metric]);

  // ---- challenge: k=1 and k=7 disagree on ≥ 8% of the map
  const hit = compareFrac !== null && compareFrac >= 0.08;
  useEffect(() => {
    if (hit) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hit]);

  const compare = () => {
    if (points.length === 0) return;
    let diff = 0;
    for (let j = 0; j < G; j++) {
      for (let i = 0; i < G; i++) {
        const x = (10 * (i + 0.5)) / G;
        const y = 10 * (1 - (j + 0.5) / G);
        if (
          knnPredict(points, { x, y }, 1, metric) !== knnPredict(points, { x, y }, 7, metric)
        ) {
          diff++;
        }
      }
    }
    setCompareFrac(diff / (G * G));
  };

  // ---- pointer: place a point of the current class, or erase
  const dragProps = useSvgDrag((px, py, phase) => {
    if (phase !== 'start') return;
    const x = frame.sx.invert(px);
    const y = frame.sy.invert(py);
    if (x < 0.15 || x > 9.85 || y < 0.15 || y > 9.85) return;
    setCompareFrac(null);
    if (pen === 'erase') {
      setPoints((pts) => {
        let bi = -1;
        let bd = 0.7;
        pts.forEach((p, i) => {
          const d = Math.hypot(p.x - x, p.y - y);
          if (d < bd) {
            bd = d;
            bi = i;
          }
        });
        return bi >= 0 ? pts.filter((_, i) => i !== bi) : pts;
      });
    } else {
      setPoints((pts) =>
        pts.length >= MAX_PTS ? pts : [...pts, { x, y, label: pen === 'a' ? 1 : -1 }],
      );
    }
  });

  const reset = () => {
    setPoints(seedPoints());
    setPen('a');
    setK(3);
    setMetric('euclidean');
    setCompareFrac(null);
  };

  const penBtn = (p: Pen, label: string) => (
    <button
      className={pen === p ? 'primary' : 'ghost'}
      onClick={() => setPen(p)}
      style={{ padding: '3px 10px', fontSize: '0.82rem' }}
    >
      {label}
    </button>
  );

  return (
    <WidgetFrame
      title="Paint a neighborhood"
      onReset={reset}
      challenge={challenge}
      challengeDone={done}
    >
      <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: 'var(--graphite)' }}>
        Tap the plot to drop points of the selected class; kNN repaints its regions after
        every change. Cosine ignores position and only looks at <em>direction from the
        origin</em> — watch the regions turn into pie slices. To win the challenge, craft a
        dataset where k = 1 and k = 7 tell different stories.
      </p>
      <div
        style={{
          display: 'flex',
          gap: 10,
          rowGap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 8,
          fontSize: '0.88rem',
        }}
      >
        <span style={{ display: 'inline-flex', gap: 4 }}>
          {penBtn('a', 'pen: class A ●')}
          {penBtn('b', 'class B ○')}
          {penBtn('erase', 'eraser')}
        </span>
        <span style={{ color: 'var(--line)' }}>|</span>
        <span style={{ display: 'inline-flex', gap: 4 }}>
          <button
            className={metric === 'euclidean' ? 'primary' : 'ghost'}
            onClick={() => {
              setMetric('euclidean');
              setCompareFrac(null);
            }}
            style={{ padding: '3px 10px', fontSize: '0.82rem' }}
          >
            euclidean
          </button>
          <button
            className={metric === 'cosine' ? 'primary' : 'ghost'}
            onClick={() => {
              setMetric('cosine');
              setCompareFrac(null);
            }}
            style={{ padding: '3px 10px', fontSize: '0.82rem' }}
          >
            cosine
          </button>
        </span>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 130px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem' }}>k = {k}</span>
          <input
            type="range"
            min={1}
            max={7}
            step={2}
            value={k}
            onChange={(e) => setK(Number(e.target.value))}
            style={{ flex: 1 }}
          />
        </label>
      </div>
      <div style={{ position: 'relative', background: '#fffdf8', borderRadius: 6 }}>
        {[canvasA, canvasB].map((ref, idx) => (
          <canvas
            key={idx}
            ref={ref}
            width={G}
            height={G}
            style={{
              position: 'absolute',
              left: `${(frame.pad.l / W) * 100}%`,
              top: `${(frame.pad.t / H) * 100}%`,
              width: `${((W - frame.pad.l - frame.pad.r) / W) * 100}%`,
              height: `${((H - frame.pad.t - frame.pad.b) / H) * 100}%`,
              pointerEvents: 'none',
              opacity: front === idx ? 1 : 0,
              transition: 'opacity 260ms ease',
            }}
          />
        ))}
        <PlotSvg
          frame={frame}
          {...dragProps}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            background: 'transparent',
            position: 'relative',
            touchAction: 'none',
          }}
        >
          <Axes frame={frame} xLabel="feature 1" yLabel="feature 2" />
          {/* keyed by position so erasing a point doesn't re-pop every later one —
              only the dot you just painted animates in */}
          {points.map((p) => (
            <g
              key={`${p.x.toFixed(4)}:${p.y.toFixed(4)}:${p.label}`}
              className="anim-pop"
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              <Dot x={frame.sx(p.x)} y={frame.sy(p.y)} cls={p.label === 1 ? 'a' : 'b'} r={5} />
            </g>
          ))}
        </PlotSvg>
      </div>
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
        <span style={{ color: 'var(--graphite)' }}>
          <strong key={points.length} className="anim-bump" style={{ display: 'inline-block', fontWeight: 400 }}>
            {points.length}
          </strong>{' '}
          points
        </span>
        {compareFrac !== null && (
          <span className="anim-slide-left" key={compareFrac}>
            k=1 vs k=7 disagree on <strong>{(compareFrac * 100).toFixed(1)}%</strong> of the map
            {hit ? ' — that’s a real disagreement!' : ' (need ≥ 8%)'}
          </span>
        )}
        <span style={{ flex: 1 }} />
        <button onClick={compare} disabled={points.length === 0}>
          compare k=1 vs k=7
        </button>
      </div>
    </WidgetFrame>
  );
}

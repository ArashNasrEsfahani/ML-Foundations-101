import React, { useEffect, useMemo, useState } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { makeFrame, Axes, PlotSvg } from '../Plot';
import { blobs3 } from '../../../content/datasets/blobs3';
import { rings9 } from '../../../content/datasets/rings9';
import { dbscan, clusterCount, NOISE } from '../../../lib/ml/dbscan';

const W = 420;
const H = 412; // square plot area so the eps-circle is a true circle

function ClusterMark({ x, y, cluster }: { x: number; y: number; cluster: number }) {
  switch (cluster % 5) {
    case 0:
      return <circle cx={x} cy={y} r={4.4} fill="var(--ink)" />;
    case 1:
      return <circle cx={x} cy={y} r={4.4} fill="#fffdf8" stroke="var(--ink)" strokeWidth={1.6} />;
    case 2:
      return (
        <g>
          <circle cx={x} cy={y} r={4.4} fill="var(--graphite)" opacity={0.55} />
          <circle cx={x} cy={y} r={4.4} fill="none" stroke="var(--ink)" strokeWidth={1} />
        </g>
      );
    case 3:
      return <rect x={x - 3.8} y={y - 3.8} width={7.6} height={7.6} fill="var(--ink)" />;
    default:
      return (
        <path
          d={`M ${x} ${y - 5.2} L ${x + 4.6} ${y + 3.4} L ${x - 4.6} ${y + 3.4} Z`}
          fill="#fffdf8"
          stroke="var(--ink)"
          strokeWidth={1.4}
        />
      );
  }
}

/**
 * DBSCAN live: move the ε and minPts sliders and watch density-connected
 * clusters grow, split and dissolve into noise. Tap a point to see its
 * ε-neighborhood circle.
 */
export function DbscanExplorer({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const [dataset, setDataset] = useState<'blobs' | 'rings'>('blobs');
  const [eps, setEps] = useState(0.6);
  const [minPts, setMinPts] = useState(3);
  const [focus, setFocus] = useState<number | null>(null);

  const frame = makeFrame(W, H, [0, 10], [0, 10]);
  const pts = useMemo(
    () => (dataset === 'blobs' ? blobs3().map((p) => ({ x: p.x, y: p.y })) : rings9().map((p) => ({ x: p.x, y: p.y }))),
    [dataset],
  );
  const labels = useMemo(() => dbscan(pts, eps, minPts), [pts, eps, minPts]);
  const clusters = useMemo(() => clusterCount(labels), [labels]);
  const noise = useMemo(() => labels.filter((l) => l === NOISE).length, [labels]);

  const goalMet = dataset === 'rings' && clusters === 2 && noise <= 3;
  useEffect(() => {
    if (goalMet) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalMet]);

  const pickFocus = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    let best: number | null = null;
    let bestD = 26; // px threshold
    pts.forEach((p, i) => {
      const d = Math.hypot(frame.sx(p.x) - px, frame.sy(p.y) - py);
      if (d < bestD) {
        bestD = d;
        best = i;
      }
    });
    setFocus(best);
  };

  const epsPx = frame.sx(eps) - frame.sx(0);

  return (
    <WidgetFrame
      title="Grow clusters by density"
      intro={
        <>
          DBSCAN reruns on every slider move. Tap or hover a point to see its ε-circle. Small ×
          marks are noise — points no dense region wanted.
        </>
      }
      guide={[
        {
          control: 'blobs',
          what: 'Three round clumps — the easy case, and the one k-means also handles. Use it to get a feel for what the two sliders do before switching.',
        },
        {
          control: 'rings',
          what: 'Two concentric rings, the shape that breaks centroid-based clustering. The challenge asks for exactly 2 clusters here with at most 3 noise points.',
        },
        {
          control: 'ε',
          what: 'How far apart two points can be and still count as neighbours — see [[dbscan]]. Too small and everything becomes noise; too large and separate clusters merge into one.',
        },
        {
          control: 'minPts',
          what: 'How many neighbours within ε a point needs to be a [[core-point]] and grow a cluster from itself. Raising it thins the clusters to their dense spines and pushes the edges out to noise.',
        },
        {
          control: 'tap or hover a point',
          what: 'Draws that point’s ε-circle, which is the neighbourhood the algorithm actually counts. Move ε with a point selected and you can see the radius that decides everything.',
        },
        {
          control: 'reset',
          what: 'Back to the blobs at ε = 0.60 and minPts = 3.',
        },
        {
          control: 'the × marks',
          what: 'Noise: points that are neither core nor within ε of one. Unlike [[k-means]], DBSCAN is allowed to leave points unassigned.',
        },
        {
          control: 'Clusters found',
          what: 'How many density-connected groups came out. You never asked for this number — it is a consequence of ε and minPts, which is the whole difference from k-means.',
        },
        {
          control: 'noise points',
          what: 'How many points ended up unassigned. Watch it spike as ε shrinks: at some point every cluster dissolves into noise.',
        },
      ]}
      onReset={() => {
        setDataset('blobs');
        setEps(0.6);
        setMinPts(3);
        setFocus(null);
      }}
      challenge={challenge}
      challengeDone={done}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
        <button
          className={dataset === 'blobs' ? 'primary' : 'ghost'}
          style={{ padding: '5px 10px' }}
          onClick={() => {
            setDataset('blobs');
            setFocus(null);
          }}
        >
          blobs
        </button>
        <button
          className={dataset === 'rings' ? 'primary' : 'ghost'}
          style={{ padding: '5px 10px' }}
          onClick={() => {
            setDataset('rings');
            setFocus(null);
          }}
        >
          rings
        </button>
        <label style={{ fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          ε = {eps.toFixed(2)}
          <input
            type="range"
            min={0.2}
            max={2.2}
            step={0.05}
            value={eps}
            onChange={(e) => setEps(Number(e.target.value))}
            style={{ width: 110 }}
          />
        </label>
        <label style={{ fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          minPts = {minPts}
          <input
            type="range"
            min={2}
            max={8}
            step={1}
            value={minPts}
            onChange={(e) => setMinPts(Number(e.target.value))}
            style={{ width: 90 }}
          />
        </label>
      </div>
      <PlotSvg frame={frame} onPointerDown={pickFocus} onPointerMove={pickFocus} style={{ touchAction: 'none' }}>
        <Axes frame={frame} xLabel="feature 1" yLabel="feature 2" />
        {focus !== null && (
          <g style={{ pointerEvents: 'none' }}>
            <circle
              cx={frame.sx(pts[focus].x)}
              cy={frame.sy(pts[focus].y)}
              r={epsPx}
              fill="var(--graphite)"
              fillOpacity={0.08}
              stroke="var(--graphite)"
              strokeWidth={1.2}
              strokeDasharray="5 4"
              /* the radius grows/shrinks with the slider instead of jumping */
              style={{ transition: 'r 220ms cubic-bezier(0.22,0.8,0.3,1), cx 200ms ease-out, cy 200ms ease-out' }}
            />
          </g>
        )}
        {pts.map((p, i) => {
          const x = frame.sx(p.x);
          const y = frame.sy(p.y);
          // keying on the label means only points that actually changed cluster
          // remount — those cross-fade in, and points falling out to noise pop.
          return labels[i] === NOISE ? (
            <path
              key={`n${i}`}
              className="anim-pop"
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              d={`M ${x - 3.4} ${y - 3.4} L ${x + 3.4} ${y + 3.4} M ${x - 3.4} ${y + 3.4} L ${x + 3.4} ${y - 3.4}`}
              stroke="var(--graphite)"
              strokeWidth={1.4}
            />
          ) : (
            <g key={`c${i}-${labels[i]}`} className="anim-fade">
              <ClusterMark x={x} y={y} cluster={labels[i]} />
            </g>
          );
        })}
      </PlotSvg>
      <p style={{ margin: '10px 0 0', fontSize: '0.95rem' }}>
        Clusters found:{' '}
        <strong key={`k${clusters}`} className="anim-bump" style={{ display: 'inline-block' }}>
          {clusters}
        </strong>{' '}
        · noise points:{' '}
        <strong key={`n${noise}`} className="anim-bump" style={{ display: 'inline-block' }}>
          {noise}
        </strong>
        {goalMet && (
          <strong className="anim-pop" style={{ display: 'inline-block' }}>
            {' '}
            — the two rings, cleanly separated!
          </strong>
        )}
      </p>
      <p style={{ margin: '6px 0 0', fontSize: '0.88rem', color: 'var(--graphite)' }}>
        K-means could never pull the rings apart: it carves space into blob-shaped territories
        around centroids, and each territory would slice through both rings. DBSCAN never asks
        for a cluster count — it just follows chains of dense neighbors, whatever shape they trace.
      </p>
    </WidgetFrame>
  );
}

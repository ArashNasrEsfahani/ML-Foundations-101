import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { makeFrame, Axes, PlotSvg } from '../Plot';
import { useSvgDrag } from '../../../hooks/useDrag';
import { useTicker } from '../../../hooks/useRaf';
import { useSpeed, SpeedControl } from '../SpeedControl';
import { blobs3 } from '../../../content/datasets/blobs3';
import {
  assignPoints,
  updateCentroids,
  kmeansInit,
  maxCentroidShift,
  type P2,
} from '../../../lib/ml/kmeans';
import { clamp } from '../../../lib/math/scales';

const W = 420;
const H = 412; // square plot area: 372×372 px for the [0,10]² domain

const PERMS3 = [
  [0, 1, 2],
  [0, 2, 1],
  [1, 0, 2],
  [1, 2, 0],
  [2, 0, 1],
  [2, 1, 0],
];

/** Monochrome cluster marks: shades for k≤3, extra shapes for k>3. */
function ClusterMark({ x, y, cluster }: { x: number; y: number; cluster: number }) {
  switch (cluster % 5) {
    case 0:
      return <circle cx={x} cy={y} r={4.6} fill="var(--ink)" />;
    case 1:
      return <circle cx={x} cy={y} r={4.6} fill="#fffdf8" stroke="var(--ink)" strokeWidth={1.6} />;
    case 2:
      return (
        <g>
          <circle cx={x} cy={y} r={4.6} fill="var(--graphite)" opacity={0.55} />
          <circle cx={x} cy={y} r={4.6} fill="none" stroke="var(--ink)" strokeWidth={1} />
        </g>
      );
    case 3:
      return <rect x={x - 4} y={y - 4} width={8} height={8} fill="var(--ink)" />;
    default:
      return (
        <path
          d={`M ${x} ${y - 5.4} L ${x + 4.8} ${y + 3.6} L ${x - 4.8} ${y + 3.6} Z`}
          fill="#fffdf8"
          stroke="var(--ink)"
          strokeWidth={1.5}
        />
      );
  }
}

/**
 * Step through Lloyd's loop by hand: Assign points to the nearest centroid,
 * then Update each centroid to its cluster mean — watch the × marks glide
 * and the inertia fall until nothing moves anymore.
 */
export function KmeansStepper({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const pts = useMemo(() => blobs3(), []);
  const frame = makeFrame(W, H, [0, 10], [0, 10]);

  const seedCounter = useRef(0);
  const [k, setK] = useState(3);
  const [centroids, setCentroids] = useState<P2[]>(() => kmeansInit(pts, 3, 41));
  const [assignments, setAssignments] = useState<number[] | null>(null);
  const [inertia, setInertia] = useState<number | null>(null);
  const [phase, setPhase] = useState<'assign' | 'update'>('assign');
  const [converged, setConverged] = useState(false);
  const [auto, setAuto] = useState(false);
  const speed = useSpeed();
  const grabbed = useRef<number | null>(null);
  // animation bookkeeping: bump a generation counter so the marks re-play their
  // entrance, and remember which centroid travelled furthest so it can pulse.
  const [assignGen, setAssignGen] = useState(0);
  const [updateGen, setUpdateGen] = useState(0);
  const [movedIdx, setMovedIdx] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);

  const reinit = (newK: number, cs?: P2[]) => {
    setK(newK);
    setCentroids(cs ?? kmeansInit(pts, newK, 41 + 17 * ++seedCounter.current));
    setAssignments(null);
    setInertia(null);
    setPhase('assign');
    setConverged(false);
    setAuto(false);
    setMovedIdx(null);
  };

  const doAssign = () => {
    const { assignments: a, inertia: J } = assignPoints(pts, centroids);
    setAssignments(a);
    setInertia(J);
    setPhase('update');
    setAssignGen((g) => g + 1);
  };

  const doUpdate = () => {
    if (!assignments) return;
    const next = updateCentroids(pts, assignments, centroids);
    if (maxCentroidShift(centroids, next) < 0.01) {
      setConverged(true);
      setAuto(false);
    }
    // which centroid moved the most? it gets a one-shot ring
    let far = 0;
    let farD = -1;
    next.forEach((c, i) => {
      const d = Math.hypot(c.x - centroids[i].x, c.y - centroids[i].y);
      if (d > farD) {
        farD = d;
        far = i;
      }
    });
    setMovedIdx(farD > 0.02 ? far : null);
    setUpdateGen((g) => g + 1);
    setCentroids(next);
    setPhase('assign');
  };

  const step = () => (phase === 'assign' ? doAssign() : doUpdate());
  // 600 ms leaves the assignment wave and the centroid glide time to land
  // before the next half-step starts
  useTicker(step, auto && !converged, speed.ms(600));

  // challenge: converged with k = 3 and the partition matching the true blobs ≥ 95%
  const accuracy = useMemo(() => {
    if (!assignments || k !== 3) return 0;
    let best = 0;
    for (const perm of PERMS3) {
      let ok = 0;
      for (let i = 0; i < pts.length; i++) {
        if (perm[assignments[i]] === pts[i].blob) ok++;
      }
      best = Math.max(best, ok / pts.length);
    }
    return best;
  }, [assignments, k, pts]);

  const goalMet = converged && k === 3 && accuracy >= 0.95;
  useEffect(() => {
    if (goalMet) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [goalMet]);

  // drag a centroid to hand-place it (re-initializes the run)
  const dragProps = useSvgDrag((px, py, dragPhase) => {
    const x = clamp(frame.sx.invert(px), 0.2, 9.8);
    const y = clamp(frame.sy.invert(py), 0.2, 9.8);
    if (dragPhase === 'start') {
      setDragging(true);
      let best = 0;
      let bestD = Infinity;
      centroids.forEach((c, i) => {
        const d = Math.hypot(frame.sx(c.x) - px, frame.sy(c.y) - py);
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      });
      grabbed.current = best;
    }
    if (grabbed.current !== null) {
      const idx = grabbed.current;
      setCentroids((cs) => cs.map((c, i) => (i === idx ? { x, y } : c)));
      setAssignments(null);
      setInertia(null);
      setPhase('assign');
      setConverged(false);
      setMovedIdx(null);
    }
    if (dragPhase === 'end') {
      grabbed.current = null;
      setDragging(false);
    }
  });

  return (
    <WidgetFrame
      title="k-means, one step at a time"
      intro={
        <>
          Pick <em>k</em>, scatter the × centroids (or drag them anywhere), then alternate{' '}
          <strong>Assign</strong> and <strong>Update</strong> until nothing moves. Shades and shapes
          show cluster membership.
        </>
      }
      guide={[
        {
          control: 'k',
          what: 'How many [[centroid|centroids]] the algorithm is allowed to place — [[k-means]] never discovers this number, you assert it. Moving the slider scatters a fresh set and restarts the run.',
        },
        {
          control: 'Scatter centroids',
          what: 'Throws the × marks down at new random positions, same *k*. The end state depends on where they land, so re-scattering is the honest way to see the algorithm reach a different answer on identical data.',
        },
        {
          control: 'Assign',
          what: 'The first half of Lloyd’s loop: every point takes the shade of its nearest centroid. Nothing moves yet — only the labels change.',
        },
        {
          control: 'Update',
          what: 'The second half: each × jumps to the mean of the points that claimed it in the Assign step. The longest jump gets a one-shot ring.',
        },
        {
          control: 'Auto-run / Pause',
          what: 'Alternates Assign and Update on a timer until the centroids stop moving. It stops itself at [[convergence]].',
        },
        {
          control: 'speed',
          what: 'Time between half-steps: 3 s on *slow*, 600 ms on *normal*, 150 ms on *fast*. On slow you can see which half of the loop you are watching.',
        },
        {
          control: 'drag a × centroid',
          what: 'Hand-place any centroid on the plot. It clears the current assignment, so you can set up a bad start on purpose and watch it recover — or not.',
        },
        {
          control: 'reset',
          what: 'Back to k = 3 with the original scatter — the run every visitor starts from.',
        },
        {
          control: 'Inertia',
          what: 'The [[inertia]]: total squared distance from every point to its own centroid. Both halves of the loop can only push it down, so a value that stops falling means the run has converged.',
        },
        {
          control: 'shades and shapes',
          what: 'Cluster membership — filled, open, gray, square, triangle. They carry no order; two points sharing a mark chose the same centroid, nothing more.',
        },
      ]}
      onReset={() => reinit(3, kmeansInit(pts, 3, 41))}
      challenge={challenge}
      challengeDone={done}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
        <label style={{ fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          k = {k}
          <input
            type="range"
            min={2}
            max={5}
            step={1}
            value={k}
            onChange={(e) => reinit(Number(e.target.value))}
            style={{ width: 90 }}
          />
        </label>
        <button className="ghost" style={{ padding: '5px 10px' }} onClick={() => reinit(k)}>
          Scatter centroids
        </button>
        <button
          className={phase === 'assign' ? 'primary' : undefined}
          style={{ padding: '5px 12px' }}
          disabled={converged}
          onClick={doAssign}
        >
          Assign
        </button>
        <button
          className={phase === 'update' ? 'primary' : undefined}
          style={{ padding: '5px 12px' }}
          disabled={converged || !assignments}
          onClick={doUpdate}
        >
          Update
        </button>
        <button className="ghost" style={{ padding: '5px 10px' }} disabled={converged} onClick={() => setAuto((a) => !a)}>
          {auto ? 'Pause' : 'Auto-run'}
        </button>
        <SpeedControl value={speed.speed} onChange={speed.setSpeed} />
      </div>
      <PlotSvg frame={frame} {...dragProps}>
        <Axes frame={frame} xLabel="feature 1" yLabel="feature 2" />
        {pts.map((p, i) => {
          const x = frame.sx(p.x);
          const y = frame.sy(p.y);
          if (!assignments) {
            return <circle key={i} cx={x} cy={y} r={3.6} fill="var(--graphite)" opacity={0.45} />;
          }
          // remounting on every Assign replays the pop; the delay ripples outward
          // through the dataset but is capped so the whole wave lands in ~0.3s
          return (
            <g
              key={`${i}-${assignGen}`}
              className="anim-pop"
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'center',
                animationDelay: `${Math.min(i * 4, 300)}ms`,
              }}
            >
              <ClusterMark x={x} y={y} cluster={assignments[i]} />
            </g>
          );
        })}
        {centroids.map((c, i) => (
          <g
            key={i}
            className={dragging ? undefined : 'mark-move'}
            style={{
              transform: `translate(${frame.sx(c.x)}px, ${frame.sy(c.y)}px)`,
              cursor: 'grab',
            }}
          >
            {/* the centroid that travelled furthest on the last Update rings once */}
            {movedIdx === i && !converged && (
              <circle
                key={`m${updateGen}`}
                className="anim-ring-burst"
                r={13}
                fill="none"
                stroke="var(--ink)"
                strokeWidth={1.6}
                style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
              />
            )}
            {converged && (
              <circle
                key={`c${updateGen}`}
                className="anim-ring-burst"
                r={13}
                fill="none"
                stroke="var(--ink)"
                strokeWidth={1.6}
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  animationDelay: `${i * 110}ms`,
                }}
              />
            )}
            <circle r={11} fill="#fffdf8" opacity={0.75} />
            <path
              d="M -7 -7 L 7 7 M -7 7 L 7 -7"
              stroke="var(--ink)"
              strokeWidth={2.6}
              strokeLinecap="round"
            />
          </g>
        ))}
      </PlotSvg>
      <p style={{ margin: '10px 0 0', fontSize: '0.95rem' }}>
        {converged ? (
          <strong className="anim-pop" style={{ display: 'inline-block' }}>
            Converged! Centroids stopped moving.
            {k === 3 && accuracy >= 0.95
              ? ' Each blob got its own cluster.'
              : ' But is every blob its own cluster? Try k = 3 or a new scatter.'}
          </strong>
        ) : inertia !== null ? (
          <>
            Inertia (sum of squared distances to centroids):{' '}
            <strong
              key={inertia.toFixed(1)}
              className="anim-bump"
              style={{ display: 'inline-block' }}
            >
              {inertia.toFixed(1)}
            </strong>
            {' — now '}
            {phase === 'update' ? 'Update the centroids.' : 'Assign the points again.'}
          </>
        ) : (
          <>No assignment yet — press Assign to label every point with its nearest centroid.</>
        )}
      </p>
    </WidgetFrame>
  );
}

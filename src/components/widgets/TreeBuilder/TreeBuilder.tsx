import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import {
  mushrooms,
  MUSHROOM_FEATURES,
  MUSHROOM_VALUES,
  type MushroomFeature,
} from '../../../content/datasets/mushrooms';
import { entropy, splitEntropy } from '../../../lib/ml/entropy';

const SW = 420;
const SH = 258;

interface Action {
  path: string;
  feature: MushroomFeature;
}

interface TNode {
  path: string;
  rows: number[];
  depth: number;
  feature?: MushroomFeature;
  kids?: { value: string; node: TNode }[];
}

/** [edible, poisonous] counts for a set of row indices. */
function counts(rows: number[]): [number, number] {
  let e = 0;
  for (const r of rows) if (mushrooms[r].edible) e++;
  return [e, rows.length - e];
}

function findNode(node: TNode, path: string): TNode | null {
  if (node.path === path) return node;
  if (!node.kids) return null;
  for (const k of node.kids) {
    const hit = findNode(k.node, path);
    if (hit) return hit;
  }
  return null;
}

function buildTree(actions: Action[]): TNode {
  const root: TNode = { path: '', rows: mushrooms.map((_, i) => i), depth: 0 };
  for (const a of actions) {
    const node = findNode(root, a.path);
    if (!node || node.feature) continue;
    node.feature = a.feature;
    node.kids = MUSHROOM_VALUES[a.feature].map((v) => ({
      value: v,
      node: {
        path: node.path ? `${node.path}/${a.feature}:${v}` : `${a.feature}:${v}`,
        rows: node.rows.filter((r) => mushrooms[r][a.feature] === v),
        depth: node.depth + 1,
      },
    }));
  }
  return root;
}

function leavesOf(root: TNode): TNode[] {
  const out: TNode[] = [];
  const walk = (n: TNode) => {
    if (!n.kids) out.push(n);
    else n.kids.forEach((k) => walk(k.node));
  };
  walk(root);
  return out;
}

const isPure = (n: TNode) => {
  const [e, p] = counts(n.rows);
  return e === 0 || p === 0;
};

const featuresUsed = (path: string): Set<string> =>
  new Set(
    path
      .split('/')
      .filter(Boolean)
      .map((seg) => seg.split(':')[0]),
  );

/**
 * Grow an ID3 tree by hand on the 12-mushroom table: pick a leaf, compare the
 * entropy each feature would leave behind, split, and try to reach pure
 * leaves in at most 3 splits. "Prune back" undoes the last split.
 */
export function TreeBuilder({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const [actions, setActions] = useState<Action[]>([]);
  const [selPath, setSelPath] = useState('');

  const tree = useMemo(() => buildTree(actions), [actions]);
  const leaves = useMemo(() => leavesOf(tree), [tree]);
  const impure = leaves.filter((l) => !isPure(l));
  const allPure = impure.length === 0;

  // keep a useful leaf selected as the tree changes
  useEffect(() => {
    const sel = findNode(tree, selPath);
    if (!sel || sel.kids) {
      setSelPath(impure[0]?.path ?? '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree]);

  const win = allPure && actions.length > 0 && actions.length <= 3;
  useEffect(() => {
    if (win) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win]);

  const selNode = findNode(tree, selPath);
  const selIsLeaf = !!selNode && !selNode.kids;
  const selCounts: [number, number] = selNode ? counts(selNode.rows) : [0, 0];
  const selEntropy = entropy(selCounts);
  const selRows = new Set(selNode?.rows ?? []);
  const used = featuresUsed(selPath);

  const candidates =
    selIsLeaf && selNode && !isPure(selNode)
      ? MUSHROOM_FEATURES.filter((f) => !used.has(f)).map((f) => {
          const groups = MUSHROOM_VALUES[f].map((v) =>
            counts(selNode.rows.filter((r) => mushrooms[r][f] === v)),
          );
          const after = splitEntropy(groups);
          return { f, after, gain: selEntropy - after };
        })
      : [];

  const split = (f: MushroomFeature) => {
    if (!selNode) return;
    setActions((a) => [...a, { path: selNode.path, feature: f }]);
  };
  const prune = () => setActions((a) => a.slice(0, -1));
  const reset = () => {
    setActions([]);
    setSelPath('');
  };

  // ---- tree layout: leaves get evenly spaced slots, parents sit above the middle
  const placed = useMemo(() => {
    const slot = (SW - 36) / Math.max(leaves.length, 1);
    let li = 0;
    const pos = new Map<string, { x: number; y: number }>();
    const assign = (n: TNode): number => {
      let x: number;
      if (!n.kids) {
        x = 18 + slot * (li + 0.5);
        li++;
      } else {
        const xs = n.kids.map((k) => assign(k.node));
        x = (xs[0] + xs[xs.length - 1]) / 2;
      }
      pos.set(n.path, { x, y: 30 + n.depth * 64 });
      return x;
    };
    assign(tree);
    const nodes: TNode[] = [];
    const edges: { key: string; x1: number; y1: number; x2: number; y2: number; label: string }[] = [];
    const walk = (n: TNode) => {
      nodes.push(n);
      if (n.kids) {
        const p = pos.get(n.path)!;
        for (const k of n.kids) {
          const c = pos.get(k.node.path)!;
          // key by the child's path so an edge keeps its identity as the tree
          // re-lays out — only genuinely new branches re-draw themselves
          edges.push({ key: k.node.path, x1: p.x, y1: p.y + 15, x2: c.x, y2: c.y - 15, label: k.value });
          walk(k.node);
        }
      }
    };
    walk(tree);
    return { pos, nodes, edges };
  }, [tree, leaves.length]);

  // "prune back" removes nodes outright; keep a one-shot ghost of whatever
  // disappeared so the subtree fades out instead of blinking away
  const prevPlacedRef = useRef(placed);
  const ghostKey = useRef(0);
  const [ghosts, setGhosts] = useState<{ k: number; items: { x: number; y: number; label: string }[] } | null>(
    null,
  );
  useEffect(() => {
    const prev = prevPlacedRef.current;
    const livePaths = new Set(placed.nodes.map((n) => n.path));
    const gone = prev.nodes.filter((n) => !livePaths.has(n.path));
    if (gone.length > 0) {
      setGhosts({
        k: ++ghostKey.current,
        items: gone.map((n) => {
          const gp = prev.pos.get(n.path)!;
          const [e, po] = counts(n.rows);
          return { x: gp.x, y: gp.y, label: `${e}|${po}` };
        }),
      });
    }
    prevPlacedRef.current = placed;
  }, [placed]);

  return (
    <WidgetFrame
      title="Grow the mushroom tree"
      onReset={reset}
      challenge={challenge}
      challengeDone={done}
    >
      <style>{`
        @keyframes mlw-node-out {
          from { opacity: 0.8; transform: scale(1); }
          to   { opacity: 0; transform: scale(0.72); }
        }
        .mlw-node-out {
          transform-box: fill-box;
          transform-origin: center;
          animation: mlw-node-out 0.34s ease-in both;
          pointer-events: none;
        }
      `}</style>
      <p style={{ margin: '0 0 8px', fontSize: '0.9rem', color: 'var(--graphite)' }}>
        Twelve foraged mushrooms, three features, one question: which splits sort edible from
        poisonous fastest? Tap a leaf in the tree to select it (dashed ring), check the gain
        bars, then split. Nodes read <strong>edible | poisonous</strong>.
      </p>

      {/* the dataset */}
      <div style={{ overflowX: 'auto', marginBottom: 10 }}>
        <table
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '0.72rem',
            borderCollapse: 'collapse',
            width: '100%',
            minWidth: 320,
          }}
        >
          <thead>
            <tr>
              {['#', 'cap', 'color', 'dots', 'edible'].map((h) => (
                <th
                  key={h}
                  style={{
                    textAlign: 'left',
                    padding: '2px 8px',
                    borderBottom: '1.5px solid var(--ink)',
                    color: 'var(--graphite)',
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mushrooms.map((m, i) => (
              <tr key={i} style={{ background: selRows.has(i) ? 'var(--paper-2)' : 'transparent' }}>
                <td style={{ padding: '1px 8px', color: 'var(--graphite)' }}>{i + 1}</td>
                <td style={{ padding: '1px 8px' }}>{m.cap}</td>
                <td style={{ padding: '1px 8px' }}>{m.color}</td>
                <td style={{ padding: '1px 8px' }}>{m.dots}</td>
                <td style={{ padding: '1px 8px', fontWeight: m.edible ? 700 : 400 }}>
                  {m.edible ? 'yes' : 'no'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* split controls for the selected leaf */}
      <div
        style={{
          border: '1px dashed var(--line)',
          borderRadius: 6,
          padding: '8px 10px',
          marginBottom: 10,
          fontSize: '0.88rem',
        }}
      >
        {selNode && selIsLeaf && !isPure(selNode) ? (
          <>
            <div style={{ marginBottom: 6 }}>
              Selected leaf: <strong>{selCounts[0]}</strong> edible /{' '}
              <strong>{selCounts[1]}</strong> poisonous — entropy{' '}
              <strong>{selEntropy.toFixed(2)}</strong> bits. Highlighted rows above belong to it.
            </div>
            {candidates.map(({ f, after, gain }) => (
              <div
                key={f}
                style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '4px 0' }}
              >
                <button
                  onClick={() => split(f)}
                  style={{ padding: '3px 10px', fontSize: '0.85rem', minWidth: 108 }}
                >
                  split on {f}
                </button>
                <div
                  style={{
                    flex: 1,
                    height: 10,
                    border: '1px solid var(--line)',
                    borderRadius: 5,
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${Math.max(0, Math.min(1, gain / Math.max(selEntropy, 1e-9))) * 100}%`,
                      height: '100%',
                      background: 'var(--ink)',
                      opacity: 0.75,
                      transition: 'width 0.45s cubic-bezier(0.22, 0.8, 0.3, 1)',
                    }}
                  />
                </div>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.72rem',
                    color: 'var(--graphite)',
                    whiteSpace: 'nowrap',
                  }}
                >
                  after {after.toFixed(2)} · gain {gain.toFixed(2)}
                </span>
              </div>
            ))}
          </>
        ) : (
          <span style={{ color: 'var(--graphite)' }}>
            {allPure
              ? actions.length === 0
                ? 'Tap a leaf to begin.'
                : `Every leaf is pure — the tree is done in ${actions.length} split${actions.length === 1 ? '' : 's'}.`
              : 'Tap an impure leaf in the tree to see its candidate splits.'}
          </span>
        )}
      </div>

      {/* the tree */}
      <svg
        viewBox={`0 0 ${SW} ${SH}`}
        style={{ width: '100%', height: 'auto', display: 'block', background: '#fffdf8', borderRadius: 6 }}
      >
        {ghosts && (
          <g key={ghosts.k} className="mlw-node-out">
            {ghosts.items.map((g, i) => (
              <g key={i}>
                <circle cx={g.x} cy={g.y} r={15} fill="var(--paper-2)" stroke="var(--ink)" strokeWidth={1.6} />
                <text
                  x={g.x}
                  y={g.y + 3.5}
                  textAnchor="middle"
                  fontSize={10}
                  fontFamily="var(--font-mono)"
                  fill="var(--ink)"
                >
                  {g.label}
                </text>
              </g>
            ))}
          </g>
        )}
        {placed.edges.map((e) => {
          const mx = (e.x1 + e.x2) / 2;
          const my = (e.y1 + e.y2) / 2;
          return (
            // a freshly mounted branch draws itself; existing ones just re-render
            <g key={e.key} className="anim-draw-fast">
              <path
                d={`M ${e.x1} ${e.y1} Q ${mx + 3} ${my} ${e.x2} ${e.y2}`}
                fill="none"
                stroke="var(--graphite)"
                strokeWidth={1.2}
              />
              <text
                x={mx + (e.x2 < e.x1 ? -6 : 6)}
                y={my - 4}
                textAnchor={e.x2 < e.x1 ? 'end' : 'start'}
                fontSize={9}
                fontStyle="italic"
                fill="var(--graphite)"
              >
                {e.label}
              </text>
            </g>
          );
        })}
        {placed.nodes.map((n, idx) => {
          const p = placed.pos.get(n.path)!;
          const [e, po] = counts(n.rows);
          const pure = e === 0 || po === 0;
          const leaf = !n.kids;
          const pureEdible = pure && po === 0 && e > 0;
          const selected = leaf && n.path === selPath;
          return (
            // outer layer positions (and glides when the layout reflows);
            // inner layer owns the pop, since both would fight over `transform`
            <g
              key={n.path || 'root'}
              className="mark-move"
              style={{
                transform: `translate(${p.x}px, ${p.y}px)`,
                cursor: leaf && !pure ? 'pointer' : 'default',
              }}
              onClick={leaf ? () => setSelPath(n.path) : undefined}
            >
              <g
                className="anim-pop"
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  animationDelay: `${Math.min(idx * 45, 280)}ms`,
                }}
              >
                {selected && (
                  <circle
                    cx={0}
                    cy={0}
                    r={20}
                    fill="none"
                    stroke="var(--graphite)"
                    strokeWidth={1.2}
                    strokeDasharray="4 3"
                  />
                )}
                <circle
                  cx={0}
                  cy={0}
                  r={15}
                  fill={pureEdible ? 'var(--ink)' : leaf && pure ? '#fffdf8' : 'var(--paper-2)'}
                  stroke="var(--ink)"
                  strokeWidth={1.6}
                />
                <text
                  x={0}
                  y={3.5}
                  textAnchor="middle"
                  fontSize={10}
                  fontFamily="var(--font-mono)"
                  fill={pureEdible ? '#fffdf8' : 'var(--ink)'}
                >
                  {e}|{po}
                </text>
                {n.feature && (
                  <text x={0} y={27} textAnchor="middle" fontSize={9.5} fontStyle="italic" fill="var(--graphite)">
                    {n.feature}?
                  </text>
                )}
                {leaf && pure && n.rows.length > 0 && (
                  <text x={0} y={27} textAnchor="middle" fontSize={8.5} fill="var(--graphite)">
                    {pureEdible ? 'all edible' : 'all poisonous'}
                  </text>
                )}
              </g>
            </g>
          );
        })}
      </svg>

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
        <span>
          Splits used:{' '}
          <strong key={actions.length} className="anim-bump" style={{ display: 'inline-block' }}>
            {actions.length}
          </strong>{' '}
          / 3
          {!allPure && (
            <span style={{ color: 'var(--graphite)' }}>
              {' '}
              · impure leaves: {impure.length}
            </span>
          )}
        </span>
        {win && (
          <strong className="anim-pop" style={{ display: 'inline-block' }}>
            Pure leaves — a perfect little forager’s guide.
          </strong>
        )}
        <span style={{ flex: 1 }} />
        <button onClick={prune} disabled={actions.length === 0}>
          prune back
        </button>
      </div>
    </WidgetFrame>
  );
}

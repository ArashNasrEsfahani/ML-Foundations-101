import React, { useEffect, useMemo, useState } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { makeFrame, PlotSvg } from '../Plot';
import { WORDS2D, analogyPoint, nearestWord, neighborsOf } from '../../../content/datasets/words2d';
import { mulberry32, hashString } from '../../../lib/rng';

const W = 420;
const H = 400;
const FONT = 'Georgia, "Times New Roman", serif';

const PRESETS: [string, string, string][] = [
  ['king', 'man', 'woman'],
  ['paris', 'france', 'italy'],
];

function starPath(cx: number, cy: number, R = 8, r = 3.4): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? R : r;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${cx + rad * Math.cos(a)} ${cy + rad * Math.sin(a)}`);
  }
  return `M ${pts.join(' L ')} Z`;
}

function Arrow({
  x1,
  y1,
  x2,
  y2,
  stroke,
  width,
  dashed,
  animate,
  delay = 0,
}: {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: string;
  width: number;
  dashed?: boolean;
  /** draw the shaft on across the plot, then fade the head in behind it */
  animate?: boolean;
  delay?: number;
}) {
  const a = Math.atan2(y2 - y1, x2 - x1);
  const hl = 9;
  const p1 = { x: x2 - hl * Math.cos(a - 0.42), y: y2 - hl * Math.sin(a - 0.42) };
  const p2 = { x: x2 - hl * Math.cos(a + 0.42), y: y2 - hl * Math.sin(a + 0.42) };
  const len = Math.hypot(x2 - x1, y2 - y1);
  return (
    <g
      style={{ pointerEvents: 'none', ...(animate ? { ['--mlw-len' as string]: `${len}` } : {}) }}
      className={animate ? 'mlw-draw' : undefined}
    >
      <line
        x1={x1}
        y1={y1}
        x2={x2}
        y2={y2}
        stroke={stroke}
        strokeWidth={width}
        // an animated shaft owns its dasharray, so the "dashed" look is dropped
        // for the length of the draw only
        strokeDasharray={animate ? undefined : dashed ? '6 5' : undefined}
        strokeLinecap="round"
        style={animate ? { animationDelay: `${delay}ms` } : undefined}
      />
      <path
        d={`M ${x2} ${y2} L ${p1.x} ${p1.y} M ${x2} ${y2} L ${p2.x} ${p2.y}`}
        stroke={stroke}
        strokeWidth={width}
        strokeLinecap="round"
        fill="none"
        style={animate ? { animationDelay: `${delay + 300}ms` } : undefined}
      />
    </g>
  );
}

/**
 * A miniature word-embedding space. Explore neighborhoods by tapping words,
 * then switch to analogy mode and compute A − B + C with taps: the offset
 * vector B→C is transported to A and the landing point reveals the answer.
 */
export function WordSpace({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const frame = makeFrame(W, H, [-0.6, 10.9], [-0.4, 10.6], { l: 8, r: 8, t: 8, b: 8 });

  const [mode, setMode] = useState<'explore' | 'analogy'>('explore');
  const [selected, setSelected] = useState<string | null>(null);
  const [picks, setPicks] = useState<string[]>([]);
  const [solved, setSolved] = useState<string[]>([]);

  // deterministic per-word label jitter (visual only — arithmetic uses exact coords)
  const jitter = useMemo(() => {
    const m = new Map<string, { jx: number; jy: number }>();
    for (const w of WORDS2D) {
      const r = mulberry32(hashString(w.word));
      m.set(w.word, { jx: (r() - 0.5) * 0.16, jy: (r() - 0.5) * 0.16 });
    }
    return m;
  }, []);

  const labelPos = (word: string) => {
    const w = WORDS2D.find((p) => p.word === word)!;
    const j = jitter.get(word)!;
    return { x: frame.sx(w.x + j.jx), y: frame.sy(w.y + j.jy) };
  };

  const result = useMemo(() => {
    if (picks.length !== 3) return null;
    const p = analogyPoint(picks[0], picks[1], picks[2]);
    const hit = nearestWord(p, picks);
    return { p, hit, ok: hit.dist <= 0.15 };
  }, [picks]);

  const key = picks.length === 3 ? picks.join('|') : null;
  useEffect(() => {
    if (result?.ok && key && !solved.includes(key)) setSolved((s) => [...s, key]);
  }, [result, key, solved]);

  useEffect(() => {
    if (solved.length >= 2) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solved.length]);

  const onTap = (e: React.PointerEvent<SVGSVGElement>) => {
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    const py = ((e.clientY - rect.top) / rect.height) * H;
    const x = frame.sx.invert(px);
    const y = frame.sy.invert(py);
    let best: string | null = null;
    let bestD = 0.85; // data units
    for (const w of WORDS2D) {
      const d = Math.hypot(w.x - x, w.y - y);
      if (d < bestD) {
        bestD = d;
        best = w.word;
      }
    }
    if (!best) return;
    if (mode === 'explore') setSelected(best);
    else setPicks((p) => (p.length >= 3 ? [best] : [...p, best]));
  };

  const neighbors = useMemo(
    () => (mode === 'explore' && selected ? neighborsOf(selected, 5).map((w) => w.word) : []),
    [mode, selected],
  );

  const underlined = new Set(mode === 'explore' ? neighbors : picks);
  const [A, B, C] = [picks[0], picks[1], picks[2]];
  const expr = mode === 'analogy' ? `${A ?? '?'} − ${B ?? '?'} + ${C ?? '?'}` : null;

  return (
    <WidgetFrame
      title="Arithmetic with meanings"
      intro={
        mode === 'explore' ? (
          <>
            Every word is a point. Tap one to light up its five nearest neighbors — similar words
            live close together.
          </>
        ) : (
          <>
            Tap three words to build A − B + C. The dashed arrow is the B→C offset; the solid arrow
            carries it from A to the ★ landing point.
          </>
        )
      }
      guide={[
        {
          control: 'explore',
          what: 'Tapping a word underlines its five nearest neighbors by [[cosine-similarity]]. This is what [[word-embeddings]] buy you: distance on the page stands for similarity in meaning.',
        },
        {
          control: 'analogy',
          what: 'Switches to arithmetic mode, where three taps build A − B + C. A fourth tap starts a new triple.',
        },
        {
          control: 'tap a word',
          what: 'In explore mode it selects that word; in analogy mode it fills the next slot of the expression. The counter under the expression says which slot you are on.',
        },
        {
          control: 'king − man + woman',
          what: 'Loads the classic analogy without hunting for the words. The offset from *man* to *woman* is roughly the same vector everywhere in this space, which is why the sum lands on *queen*.',
        },
        {
          control: 'paris − france + italy',
          what: 'The same trick along a different direction — the capital-of offset instead of the gender one. One space, many meaningful directions.',
        },
        {
          control: 'reset',
          what: 'Clears the picks and returns to explore mode.',
        },
        {
          control: 'the dashed arrow',
          what: 'The offset from B to C, drawn where it lives. It is the vector about to be added to A.',
        },
        {
          control: 'the solid arrow and ★',
          what: 'That same offset transported to A, and where it lands. The landing point is almost never exactly on a word — the answer is whichever word is nearest.',
        },
        {
          control: 'the ring',
          what: 'The nearest word to the ★. Solid means the landing point sits practically on top of it and the analogy counts; dashed means the closest word is still some way off.',
        },
        {
          control: 'Analogies solved',
          what: 'How many distinct triples have landed on a word so far. Two clears the challenge.',
        },
      ]}
      onReset={() => {
        setMode('explore');
        setSelected(null);
        setPicks([]);
      }}
      challenge={challenge}
      challengeDone={done}
    >
      {/* analogy arrows span the whole plot, well past the shared .anim-draw
          dasharray, so they draw against their own measured length */}
      <style>{`
        @keyframes mlw-arrow-draw {
          from { stroke-dashoffset: var(--mlw-len, 200); }
          to   { stroke-dashoffset: 0; }
        }
        .mlw-draw > line {
          stroke-dasharray: var(--mlw-len, 200);
          animation: mlw-arrow-draw 0.42s cubic-bezier(0.22, 0.8, 0.3, 1) both;
        }
        .mlw-draw > path { animation: ml-fade 0.22s ease both; }
        @keyframes mlw-underline { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .mlw-underline {
          transform-box: fill-box;
          transform-origin: center;
          animation: mlw-underline 0.3s cubic-bezier(0.22, 0.8, 0.3, 1) both;
        }
      `}</style>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
        <button
          className={mode === 'explore' ? 'primary' : 'ghost'}
          style={{ padding: '5px 10px' }}
          onClick={() => {
            setMode('explore');
            setPicks([]);
          }}
        >
          explore
        </button>
        <button
          className={mode === 'analogy' ? 'primary' : 'ghost'}
          style={{ padding: '5px 10px' }}
          onClick={() => {
            setMode('analogy');
            setSelected(null);
          }}
        >
          analogy
        </button>
        {PRESETS.map((p) => (
          <button
            key={p.join()}
            className="ghost"
            style={{ padding: '5px 10px', fontFamily: FONT }}
            onClick={() => {
              setMode('analogy');
              setSelected(null);
              setPicks([...p]);
            }}
          >
            {p[0]} − {p[1]} + {p[2]}
          </button>
        ))}
      </div>
      {expr && (
        <p style={{ margin: '0 0 8px', fontSize: '1.02rem', fontFamily: FONT }}>
          {expr}
          {result && (
            <>
              {' '}
              ≈ <strong>{result.hit.word}</strong>{' '}
              {result.ok ? '✓ landed right on it' : '— nothing exactly there'}
            </>
          )}
          {!result && picks.length < 3 && (
            <span style={{ color: 'var(--graphite)', fontSize: '0.85rem' }}>
              {' '}
              (tap word {picks.length + 1} of 3)
            </span>
          )}
        </p>
      )}
      <PlotSvg frame={frame} onPointerDown={onTap} style={{ touchAction: 'manipulation', userSelect: 'none' }}>
        <defs>
          <clipPath id="ws-clip">
            <rect x={0} y={0} width={W} height={H} />
          </clipPath>
        </defs>
        <g clipPath="url(#ws-clip)">
          {/* neighbor connections in explore mode — they draw outward from the
              tapped word, one after another */}
          {mode === 'explore' && selected && (
            <g key={selected} className="anim-draw-fast">
              {neighbors.map((n, i) => {
                const a = labelPos(selected);
                const b = labelPos(n);
                return (
                  <line
                    key={n}
                    x1={a.x}
                    y1={a.y}
                    x2={b.x}
                    y2={b.y}
                    stroke="var(--graphite)"
                    strokeWidth={1}
                    opacity={0.55}
                    style={{ animationDelay: `${i * 70}ms` }}
                  />
                );
              })}
            </g>
          )}
          {/* analogy geometry */}
          {mode === 'analogy' && picks.length >= 3 && (
            <g key={`bc-${picks.join('|')}`} className="anim-fade">
              <Arrow {...(() => {
                const b = labelPos(picks[1]);
                const c = labelPos(picks[2]);
                return { x1: b.x, y1: b.y, x2: c.x, y2: c.y };
              })()} stroke="var(--graphite)" width={1.3} dashed />
            </g>
          )}
          {mode === 'analogy' && result && (
            <g key={`res-${picks.join('|')}`}>
              <Arrow
                x1={labelPos(picks[0]).x}
                y1={labelPos(picks[0]).y}
                x2={frame.sx(result.p.x)}
                y2={frame.sy(result.p.y)}
                stroke="var(--ink)"
                width={1.8}
                animate
                delay={160}
              />
              <path
                className="anim-pop"
                d={starPath(frame.sx(result.p.x), frame.sy(result.p.y))}
                fill="#fffdf8"
                stroke="var(--ink)"
                strokeWidth={1.6}
                style={{
                  pointerEvents: 'none',
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  animationDelay: '560ms',
                }}
              />
              {(() => {
                const n = labelPos(result.hit.word);
                const rx = result.hit.word.length * 3.1 + 9;
                return (
                  <ellipse
                    className="anim-pop"
                    cx={n.x}
                    cy={n.y - 3}
                    rx={rx}
                    ry={11}
                    fill="none"
                    stroke={result.ok ? 'var(--ink)' : 'var(--graphite)'}
                    strokeWidth={1.4}
                    strokeDasharray={result.ok ? undefined : '4 3'}
                    style={{
                      pointerEvents: 'none',
                      transformBox: 'fill-box',
                      transformOrigin: 'center',
                      animationDelay: '720ms',
                    }}
                  />
                );
              })()}
            </g>
          )}
          {/* the words */}
          {WORDS2D.map((w) => {
            const p = labelPos(w.word);
            const isSel = mode === 'explore' && selected === w.word;
            const under = underlined.has(w.word);
            const width = w.word.length * 5.4;
            return (
              <g key={w.word} style={{ cursor: 'pointer' }}>
                <text
                  x={p.x}
                  y={p.y}
                  textAnchor="middle"
                  fontSize={10.5}
                  fontFamily={FONT}
                  fontWeight={isSel || under ? 700 : 400}
                  fill="var(--ink)"
                >
                  {w.word}
                </text>
                {(isSel || under) && (
                  // the emphasis underline sweeps out from the middle of the word
                  <line
                    className="mlw-underline"
                    x1={p.x - width / 2}
                    y1={p.y + 3.5}
                    x2={p.x + width / 2}
                    y2={p.y + 3.5}
                    stroke={isSel ? 'var(--ink)' : 'var(--graphite)'}
                    strokeWidth={isSel ? 1.6 : 1.2}
                  />
                )}
              </g>
            );
          })}
        </g>
      </PlotSvg>
      <p style={{ margin: '10px 0 0', fontSize: '0.95rem' }}>
        Analogies solved:{' '}
        <strong key={solved.length} className="anim-bump" style={{ display: 'inline-block' }}>
          {Math.min(solved.length, 2)} / 2
        </strong>
        {solved.length >= 2 && (
          <strong className="anim-pop" style={{ display: 'inline-block' }}>
            {' '}
            — meaning really is directions in this space.
          </strong>
        )}
      </p>
    </WidgetFrame>
  );
}

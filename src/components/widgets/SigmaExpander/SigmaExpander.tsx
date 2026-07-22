import React, { useEffect, useState } from 'react';
import { WidgetFrame, type GuideEntry } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { TeX } from '../../lesson/TeX';
import { SketchIcon } from '../../sketch/SketchIcon';

/** the little vector every preset runs over */
const X = [2, 5, 1, 4];
const N = X.length;

interface Preset {
  id: string;
  label: string;
  symTex: string;
  termTex: string[];
  termVal: number[];
  op: '+' | '\\cdot';
  start: number;
  runningWord: string;
  finish: (acc: number) => number;
  /** wraps the expanded terms, e.g. the ¼(…) of an average */
  wrap?: (inner: string) => string;
  finishNote?: string;
}

const PRESETS: Preset[] = [
  {
    id: 'sum',
    label: 'sum',
    symTex: '\\sum_{j=1}^{4} x^{(j)}',
    termTex: X.map(String),
    termVal: X.slice(),
    op: '+',
    start: 0,
    runningWord: 'running sum',
    finish: (a) => a,
  },
  {
    id: 'squares',
    label: 'sum of squares',
    symTex: '\\sum_{j=1}^{4} \\left(x^{(j)}\\right)^{2}',
    termTex: X.map((v) => `${v}^{2}`),
    termVal: X.map((v) => v * v),
    op: '+',
    start: 0,
    runningWord: 'running sum',
    finish: (a) => a,
  },
  {
    id: 'product',
    label: 'product',
    symTex: '\\prod_{j=1}^{4} x^{(j)}',
    termTex: X.map(String),
    termVal: X.slice(),
    op: '\\cdot',
    start: 1,
    runningWord: 'running product',
    finish: (a) => a,
  },
  {
    id: 'average',
    label: 'average',
    symTex: '\\frac{1}{4} \\sum_{j=1}^{4} x^{(j)}',
    termTex: X.map(String),
    termVal: X.slice(),
    op: '+',
    start: 0,
    runningWord: 'running sum',
    finish: (a) => a / N,
    wrap: (inner) => `\\frac{1}{4}\\left(${inner}\\right)`,
    finishNote: 'the ÷ 4 happens once, after the last term',
  },
];

/** four presets that differ in exactly one way each, so each pill earns a row */
const GUIDE: GuideEntry[] = [
  {
    control: 'sum',
    what: 'The plain $\\sum$: add the four entries of the vector one after another. This is the shape every other preset is a variation on.',
  },
  {
    control: 'sum of squares',
    what: 'The same $\\sum$, but each entry is squared *before* it is added. The subscript still runs over the same four positions — only the thing being added changed.',
  },
  {
    control: 'product',
    what: 'A $\\prod$ instead of a $\\sum$: multiply rather than add, which is why the running total starts at 1 and not 0. Watch how fast it grows compared with the plain sum.',
  },
  {
    control: 'average',
    what: 'A $\\sum$ with a $\\tfrac{1}{4}$ in front of it. The division happens once, after the last term, which is why the running number does not look like an average until the expansion finishes.',
  },
  {
    control: 'expand the first term',
    what: 'Writes out one more term of the expression, replacing the $\\cdots$ with concrete numbers. It reads **add next term** from the second press onward and greys out once all four are written.',
  },
  {
    control: 'running sum / running product',
    what: 'The value of the part that is written out so far, not of the whole expression. For **average** it is still just the sum, since the division has not been applied yet.',
  },
  {
    control: 'the ✓ on a pill',
    what: 'Marks an expression you have already expanded all the way to its final value. The challenge asks for three different pills carrying one.',
  },
];

/**
 * Pick a Σ/Π expression and unroll it one concrete term at a time.
 * Challenge: fully expand 3 different expressions.
 */
export function SigmaExpander({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const [presetId, setPresetId] = useState<string>('sum');
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState<Set<string>>(new Set());

  const p = PRESETS.find((q) => q.id === presetId) ?? PRESETS[0];
  const full = step >= N;

  const acc = p.termVal
    .slice(0, step)
    .reduce((a, v) => (p.op === '+' ? a + v : a * v), p.start);

  const inner = p.termTex.slice(0, step).join(` ${p.op} `);
  const innerWithMore = full ? inner : `${inner} ${p.op} \\cdots`;
  const rhs = p.wrap ? p.wrap(innerWithMore) : innerWithMore;
  const displayTex =
    step === 0 ? p.symTex : `${p.symTex} = ${rhs}${full ? ` = ${p.finish(acc)}` : ''}`;

  const goal = Math.min(finished.size, 3);
  useEffect(() => {
    if (finished.size >= 3) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [finished]);

  const addTerm = () => {
    const next = Math.min(step + 1, N);
    setStep(next);
    if (next === N) {
      setFinished((prev) => (prev.has(p.id) ? prev : new Set(prev).add(p.id)));
    }
  };

  const pickPreset = (id: string) => {
    setPresetId(id);
    setStep(0);
  };

  const reset = () => {
    setPresetId('sum');
    setStep(0);
    setFinished(new Set());
  };

  return (
    <WidgetFrame
      title="Unroll the Σ and Π"
      intro={
        <>
          Every expression below runs over the same little vector{' '}
          <TeX tex="\mathbf{x} = [2,\, 5,\, 1,\, 4]" />. Pick one, then unroll it one concrete
          term at a time.
        </>
      }
      guide={GUIDE}
      onReset={reset}
      challenge={challenge}
      challengeDone={done}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {PRESETS.map((q) => {
          const active = q.id === presetId;
          const wasFinished = finished.has(q.id);
          return (
            <button
              key={q.id}
              className="ghost"
              onClick={() => pickPreset(q.id)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 12px',
                fontSize: '0.9rem',
                borderStyle: 'solid',
                borderWidth: 1.5,
                borderColor: active ? 'var(--ink)' : 'var(--line)',
                background: active ? 'var(--ink)' : 'transparent',
                color: active ? '#fffdf8' : 'var(--ink)',
                borderRadius: 999,
                cursor: 'pointer',
              }}
            >
              {q.label}
              {wasFinished && <SketchIcon name="check" size={13} strokeWidth={2.4} />}
            </button>
          );
        })}
      </div>

      <div
        style={{
          padding: '14px 16px',
          background: '#fffdf8',
          border: '1px solid var(--line)',
          borderRadius: 8,
          overflowX: 'auto',
        }}
      >
        {/* re-keying on the step count remounts the line, so every appended term
            slides the expression in from the right */}
        <div key={`${p.id}-${step}`} className="anim-slide-left">
          <TeX tex={displayTex} block />
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 12,
          marginTop: 12,
        }}
      >
        <button
          className="ghost"
          onClick={addTerm}
          disabled={full}
          style={{
            padding: '6px 14px',
            fontSize: '0.92rem',
            borderStyle: 'solid',
            borderWidth: 1.5,
            borderColor: 'var(--ink)',
            borderRadius: 8,
            cursor: full ? 'default' : 'pointer',
            opacity: full ? 0.45 : 1,
          }}
        >
          {step === 0 ? 'expand the first term' : 'add next term'}
        </button>
        <span style={{ fontSize: '0.9rem', color: 'var(--graphite)' }}>
          {full ? (
            <strong className="anim-pop" style={{ color: 'var(--ink)', display: 'inline-block' }}>
              fully expanded — value {p.finish(acc)}
            </strong>
          ) : step === 0 ? (
            'no terms yet'
          ) : (
            <>
              terms added: {step} of {N} · {p.runningWord}:{' '}
              <strong key={acc} className="anim-bump" style={{ display: 'inline-block', fontWeight: 400 }}>
                {acc}
              </strong>
              {p.finishNote ? ` (${p.finishNote})` : ''}
            </>
          )}
        </span>
      </div>

      <p style={{ margin: '10px 0 0', fontSize: '0.9rem' }}>
        <strong key={goal} className="anim-bump" style={{ display: 'inline-block' }}>
          {goal} of 3
        </strong>{' '}
        different expressions fully expanded.
      </p>
    </WidgetFrame>
  );
}

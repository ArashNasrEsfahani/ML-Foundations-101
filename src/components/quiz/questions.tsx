import React, { useMemo, useState } from 'react';
import type { Question } from '../../content/schema';
import { renderInline } from '../lesson/inline';
import { mulberry32, shuffled, hashString } from '../../lib/rng';

/**
 * One component per question kind. Contract: render the interaction, call
 * onSubmit(correct) exactly once per attempt. `reveal` shows the right answer
 * (used after a failed retry). `locked` freezes interaction during feedback.
 */
export interface QProps<Q extends Question = Question> {
  q: Q;
  onSubmit: (correct: boolean) => void;
  locked: boolean;
  reveal: boolean;
}

const choiceStyle = (state: 'idle' | 'selected' | 'reveal' | 'wrong'): React.CSSProperties => ({
  display: 'block',
  width: '100%',
  textAlign: 'left',
  marginBottom: 8,
  padding: '10px 14px',
  fontSize: '0.98rem',
  background:
    state === 'reveal' ? 'var(--ok-bg)' : state === 'wrong' ? 'var(--bad-bg)' : state === 'selected' ? 'var(--paper-2)' : '#fffdf8',
  borderColor:
    state === 'reveal' ? 'var(--ok)' : state === 'wrong' ? 'var(--bad)' : state === 'selected' ? 'var(--ink)' : 'var(--line)',
  borderWidth: 1.5,
  transition: 'background 0.25s ease, border-color 0.25s ease',
});

/** animation class for the answer the player actually chose */
const choiceAnim = (chosen: boolean, isRight: boolean): string | undefined => {
  if (!chosen) return undefined;
  return isRight ? 'anim-glow-ok' : 'anim-shake anim-glow-bad';
};

export function QMcq({ q, onSubmit, locked, reveal }: QProps<Extract<Question, { kind: 'mcq' }>>) {
  const order = useMemo(
    () => shuffled(q.choices.map((_, i) => i), mulberry32(hashString(q.id))),
    [q],
  );
  const [picked, setPicked] = useState<number | null>(null);

  return (
    <div>
      {order.map((ci, i) => {
        const chosen = picked === ci;
        const isRight = ci === q.answer;
        const state = reveal && isRight ? 'reveal' : chosen && locked ? 'wrong' : chosen ? 'selected' : 'idle';
        return (
          <button
            key={ci}
            disabled={locked}
            className={`anim-rise ${choiceAnim(chosen && locked, isRight) ?? ''}`}
            style={{ ...choiceStyle(state), animationDelay: `${i * 45}ms` }}
            onClick={() => {
              setPicked(ci);
              onSubmit(isRight);
            }}
          >
            {renderInline(q.choices[ci])}
          </button>
        );
      })}
    </div>
  );
}

export function QTrueFalse({ q, onSubmit, locked, reveal }: QProps<Extract<Question, { kind: 'tf' }>>) {
  const [picked, setPicked] = useState<boolean | null>(null);
  return (
    <div style={{ display: 'flex', gap: 12 }}>
      {[true, false].map((v, i) => {
        const chosen = picked === v;
        const isRight = v === q.answer;
        const state = reveal && isRight ? 'reveal' : chosen && locked ? 'wrong' : chosen ? 'selected' : 'idle';
        return (
          <button
            key={String(v)}
            disabled={locked}
            className={`anim-rise ${choiceAnim(chosen && locked, isRight) ?? ''}`}
            style={{
              ...choiceStyle(state),
              width: 120,
              textAlign: 'center',
              animationDelay: `${i * 60}ms`,
            }}
            onClick={() => {
              setPicked(v);
              onSubmit(isRight);
            }}
          >
            {v ? 'True' : 'False'}
          </button>
        );
      })}
    </div>
  );
}

export function QMulti({ q, onSubmit, locked, reveal }: QProps<Extract<Question, { kind: 'multi' }>>) {
  const order = useMemo(
    () => shuffled(q.choices.map((_, i) => i), mulberry32(hashString(q.id))),
    [q],
  );
  const [picked, setPicked] = useState<Set<number>>(new Set());

  const toggle = (i: number) => {
    const next = new Set(picked);
    if (next.has(i)) next.delete(i);
    else next.add(i);
    setPicked(next);
  };

  const check = () => {
    const want = new Set(q.answers);
    const ok = picked.size === want.size && [...picked].every((i) => want.has(i));
    onSubmit(ok);
  };

  return (
    <div>
      <p style={{ margin: '0 0 8px', fontSize: '0.85rem', color: 'var(--graphite)' }}>
        select all that apply
      </p>
      {order.map((ci) => (
        <button
          key={ci}
          disabled={locked}
          onClick={() => toggle(ci)}
          style={choiceStyle(
            reveal && q.answers.includes(ci) ? 'reveal' : picked.has(ci) ? 'selected' : 'idle',
          )}
        >
          <span style={{ marginRight: 8, fontFamily: 'var(--font-mono)' }}>
            {picked.has(ci) ? '☑' : '☐'}
          </span>
          {renderInline(q.choices[ci])}
        </button>
      ))}
      <button className="primary" disabled={locked || picked.size === 0} onClick={check}>
        Check
      </button>
    </div>
  );
}

export function QNumeric({ q, onSubmit, locked, reveal }: QProps<Extract<Question, { kind: 'numeric' }>>) {
  const [val, setVal] = useState('');
  const check = () => {
    const num = parseFloat(val.replace(',', '.'));
    onSubmit(Number.isFinite(num) && Math.abs(num - q.answer) <= q.tolerance);
  };
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
      <input
        type="text"
        inputMode="decimal"
        value={val}
        disabled={locked}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && val.trim() !== '' && !locked) check();
        }}
        style={{ width: 140 }}
        aria-label="numeric answer"
      />
      <button className="primary" disabled={locked || val.trim() === ''} onClick={check}>
        Check
      </button>
      {reveal && (
        <span style={{ color: 'var(--ok)', fontWeight: 700 }}>answer: {q.answer}</span>
      )}
    </div>
  );
}

export function QMatch({ q, onSubmit, locked, reveal }: QProps<Extract<Question, { kind: 'match' }>>) {
  // tap-to-place: tap a bank item (right side of the pair), then tap a target row
  const bankOrder = useMemo(
    () => shuffled(q.pairs.map((_, i) => i), mulberry32(hashString(q.id) ^ 0x9e37)),
    [q],
  );
  const [placed, setPlaced] = useState<(number | null)[]>(q.pairs.map(() => null));
  const [held, setHeld] = useState<number | null>(null);

  const placeAt = (row: number) => {
    if (held === null) return;
    const next = placed.slice();
    // if the held item was already placed elsewhere, remove it there
    const oldIdx = next.indexOf(held);
    if (oldIdx >= 0) next[oldIdx] = null;
    next[row] = held;
    setPlaced(next);
    setHeld(null);
  };

  const check = () => onSubmit(placed.every((p, i) => p === i));

  const unplaced = bankOrder.filter((i) => !placed.includes(i));

  return (
    <div>
      <div style={{ display: 'grid', gap: 8, marginBottom: 12 }}>
        {q.pairs.map(([left], row) => (
          <div key={row} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{ flex: 1, fontSize: '0.95rem' }}>{renderInline(left)}</div>
            <button
              disabled={locked}
              onClick={() => (placed[row] !== null && held === null ? setHeld(placed[row]) : placeAt(row))}
              style={{
                flex: 1,
                minHeight: 42,
                borderStyle: placed[row] === null ? 'dashed' : 'solid',
                borderColor:
                  reveal ? (placed[row] === row ? 'var(--ok)' : 'var(--bad)') :
                  placed[row] === null ? 'var(--line)' : 'var(--ink)',
                background: '#fffdf8',
                fontSize: '0.92rem',
              }}
            >
              {placed[row] !== null
                ? renderInline(q.pairs[placed[row]!][1])
                : held !== null
                  ? 'place here'
                  : '…'}
            </button>
          </div>
        ))}
      </div>
      {unplaced.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {unplaced.map((i) => (
            <button
              key={i}
              disabled={locked}
              onClick={() => setHeld(held === i ? null : i)}
              style={{
                fontSize: '0.92rem',
                borderColor: held === i ? 'var(--ink)' : 'var(--line)',
                background: held === i ? 'var(--paper-2)' : '#fffdf8',
              }}
            >
              {renderInline(q.pairs[i][1])}
            </button>
          ))}
        </div>
      )}
      <button
        className="primary"
        disabled={locked || placed.some((p) => p === null)}
        onClick={check}
      >
        Check
      </button>
    </div>
  );
}

export function QOrder({ q, onSubmit, locked, reveal }: QProps<Extract<Question, { kind: 'order' }>>) {
  const bankOrder = useMemo(
    () => shuffled(q.items.map((_, i) => i), mulberry32(hashString(q.id) ^ 0x51ab)),
    [q],
  );
  const [sequence, setSequence] = useState<number[]>([]);

  const check = () => onSubmit(sequence.every((v, i) => v === i));
  const remaining = bankOrder.filter((i) => !sequence.includes(i));

  return (
    <div>
      <ol style={{ paddingLeft: 24, minHeight: 30, margin: '0 0 10px' }}>
        {sequence.map((i, pos) => (
          <li key={i} style={{ marginBottom: 6 }}>
            <button
              disabled={locked}
              onClick={() => setSequence(sequence.filter((v) => v !== i))}
              style={{
                fontSize: '0.92rem',
                borderColor: reveal ? (i === pos ? 'var(--ok)' : 'var(--bad)') : 'var(--ink)',
              }}
            >
              {renderInline(q.items[i])}
            </button>
          </li>
        ))}
        {sequence.length === 0 && (
          <p style={{ color: 'var(--graphite)', fontSize: '0.85rem', margin: 0 }}>
            tap the steps below in the correct order
          </p>
        )}
      </ol>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
        {remaining.map((i) => (
          <button
            key={i}
            disabled={locked}
            onClick={() => setSequence([...sequence, i])}
            style={{ fontSize: '0.92rem', borderStyle: 'dashed', borderColor: 'var(--graphite)' }}
          >
            {renderInline(q.items[i])}
          </button>
        ))}
      </div>
      <button
        className="primary"
        disabled={locked || sequence.length !== q.items.length}
        onClick={check}
      >
        Check
      </button>
    </div>
  );
}

export function QuestionBody(props: QProps) {
  const { q } = props;
  switch (q.kind) {
    case 'mcq':
      return <QMcq {...(props as QProps<Extract<Question, { kind: 'mcq' }>>)} />;
    case 'tf':
      return <QTrueFalse {...(props as QProps<Extract<Question, { kind: 'tf' }>>)} />;
    case 'multi':
      return <QMulti {...(props as QProps<Extract<Question, { kind: 'multi' }>>)} />;
    case 'numeric':
      return <QNumeric {...(props as QProps<Extract<Question, { kind: 'numeric' }>>)} />;
    case 'match':
      return <QMatch {...(props as QProps<Extract<Question, { kind: 'match' }>>)} />;
    case 'order':
      return <QOrder {...(props as QProps<Extract<Question, { kind: 'order' }>>)} />;
  }
}

import React, { useEffect, useMemo, useState } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { TeX } from '../../lesson/TeX';
import { posterior, bayesCounts } from '../../../lib/ml/bayes';

const COLS = 40;
const ROWS = 25;
const N = COLS * ROWS; // 1000 people
const CELL = 10;
const MARG = 10;
const W = COLS * CELL + 2 * MARG; // 420
const H = ROWS * CELL + 2 * MARG; // 270
const R = 3.1;

const DEFAULTS = { prior: 1, sens: 90, fpr: 9 }; // percent

function Slider({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}) {
  return (
    <label style={{ display: 'block', fontSize: '0.9rem' }}>
      <span style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
        <span style={{ color: 'var(--graphite)' }}>{label}</span>
        <strong>
          {value}
          {unit}
        </strong>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: 'var(--ink)' }}
      />
    </label>
  );
}

/**
 * Natural-frequency view of Bayes' rule: 1000 dots, three sliders,
 * and the posterior P(sick | +) both as counted dots and as the exact formula.
 * Challenge: push the posterior above 50%.
 */
export function BayesBoxes({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const [priorPct, setPriorPct] = useState(DEFAULTS.prior);
  const [sensPct, setSensPct] = useState(DEFAULTS.sens);
  const [fprPct, setFprPct] = useState(DEFAULTS.fpr);

  const prior = priorPct / 100;
  const sens = sensPct / 100;
  const fpr = fprPct / 100;

  const c = bayesCounts(N, prior, sens, fpr);
  const post = posterior(prior, sens, fpr);
  const win = post > 0.5;

  useEffect(() => {
    if (win) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [win]);

  const dots = useMemo(() => {
    const els: React.ReactNode[] = [];
    for (let i = 0; i < N; i++) {
      const col = i % COLS;
      const row = Math.floor(i / COLS);
      const cx = MARG + CELL / 2 + col * CELL;
      const cy = MARG + CELL / 2 + row * CELL;
      const isSick = i < c.sick;
      const isPos = isSick ? i < c.sickPos : i - c.sick < c.healthyPos;
      const opacity = isPos ? 1 : 0.15;
      // re-tint as a ripple: delay by row so the wave sweeps down the grid, but
      // stays bounded (25 rows × 13ms ≈ 0.32s) and stays cheap — one shared
      // transition per dot, no JS per frame.
      const style: React.CSSProperties = {
        transition: 'opacity 0.24s ease-out',
        transitionDelay: `${row * 13}ms`,
      };
      if (isSick) {
        els.push(<circle key={i} style={style} cx={cx} cy={cy} r={R} fill="var(--ink)" opacity={opacity} />);
      } else {
        els.push(
          <circle
            key={i}
            style={style}
            cx={cx}
            cy={cy}
            r={R}
            fill="#fffdf8"
            stroke="var(--graphite)"
            strokeWidth={1.2}
            opacity={opacity}
          />,
        );
      }
    }
    return els;
  }, [c.sick, c.sickPos, c.healthyPos]);

  const formulaTex = `\\Pr(\\text{sick}\\mid +) = \\frac{${sens.toFixed(2)} \\times ${prior.toFixed(
    3,
  )}}{${sens.toFixed(2)} \\times ${prior.toFixed(3)} \\,+\\, ${fpr.toFixed(3)} \\times ${(
    1 - prior
  ).toFixed(3)}} = ${post.toFixed(3)}`;

  const reset = () => {
    setPriorPct(DEFAULTS.prior);
    setSensPct(DEFAULTS.sens);
    setFprPct(DEFAULTS.fpr);
  };

  return (
    <WidgetFrame
      title="1000 people take the test"
      onReset={reset}
      challenge={challenge}
      challengeDone={done}
    >
      <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: 'var(--graphite)' }}>
        Screening 1000 people for a rare illness — every dot is one person. Slide the three
        dials and watch who ends up testing positive.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 18px', marginBottom: 10, fontSize: '0.85rem' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <svg width={14} height={14} aria-hidden>
            <circle cx={7} cy={7} r={4.2} fill="var(--ink)" />
          </svg>
          sick, tests positive
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <svg width={14} height={14} aria-hidden>
            <circle cx={7} cy={7} r={4.2} fill="#fffdf8" stroke="var(--graphite)" strokeWidth={1.4} />
          </svg>
          healthy, tests positive
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
          <svg width={14} height={14} aria-hidden>
            <circle cx={7} cy={7} r={4.2} fill="var(--ink)" opacity={0.15} />
          </svg>
          tests negative
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <div style={{ flex: '2 1 300px', minWidth: 260 }}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            style={{ width: '100%', height: 'auto', display: 'block', background: '#fffdf8', borderRadius: 6 }}
          >
            {dots}
          </svg>
        </div>
        <div style={{ flex: '1 1 200px', minWidth: 190, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Slider
            label="prior P(sick)"
            value={priorPct}
            min={0.1}
            max={10}
            step={0.1}
            unit="%"
            onChange={setPriorPct}
          />
          <Slider
            label="sensitivity P(+ | sick)"
            value={sensPct}
            min={50}
            max={99}
            step={1}
            unit="%"
            onChange={setSensPct}
          />
          <Slider
            label="false positives P(+ | healthy)"
            value={fprPct}
            min={1}
            max={20}
            step={0.5}
            unit="%"
            onChange={setFprPct}
          />
        </div>
      </div>

      <p style={{ margin: '12px 0 0', fontSize: '0.95rem' }}>
        Of the <strong>{c.totalPos}</strong> dots that test positive, <strong>{c.sickPos}</strong>{' '}
        {c.sickPos === 1 ? 'is' : 'are'} actually sick →{' '}
        {/* keyed on the whole-percent value so a slider drag ticks rather than strobes */}
        {win ? (
          <strong key="win" className="anim-pop" style={{ display: 'inline-block' }}>
            P(sick | +) = {(post * 100).toFixed(1)}% — a positive result now means probably sick.
          </strong>
        ) : (
          <>
            <strong
              key={Math.round(post * 100)}
              className="anim-bump"
              style={{ display: 'inline-block' }}
            >
              P(sick | +) = {(post * 100).toFixed(1)}%
            </strong>{' '}
            — most positives are false alarms.
          </>
        )}
      </p>

      <div
        style={{
          marginTop: 10,
          padding: '10px 14px',
          background: '#fffdf8',
          border: '1px solid var(--line)',
          borderRadius: 8,
          overflowX: 'auto',
        }}
      >
        <TeX tex={formulaTex} block />
      </div>
      <p style={{ margin: '6px 0 0', fontSize: '0.8rem', color: 'var(--graphite)' }}>
        dot counts round to whole people; the formula is exact
      </p>
    </WidgetFrame>
  );
}

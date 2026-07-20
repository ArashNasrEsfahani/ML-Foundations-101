import React, { useRef } from 'react';
import { TeX } from '../lesson/TeX';

/**
 * The "live equation" panel shared by every geometry/boundary widget.
 *
 * It answers the question a draggable boundary always begs: *what equation am I
 * actually drawing?* The symbolic form sits on top (what the maths is called),
 * the substituted form underneath (what your hands just made it), and a row of
 * secondary readouts tracks the derived quantities.
 *
 * Everything is monochrome — a live equation is not answer feedback, so no
 * green/red ever appears here (see AUTHORING.md rule 2).
 */

/* ------------------------------------------------------------------ *
 * number formatting — stable width is the whole game while dragging
 * ------------------------------------------------------------------ */

/**
 * Fixed-decimal format that never emits "-0.00" and never emits "NaN".
 * Use this for every number that lands in an equation or a stat.
 */
export function fmt(n: number, dp = 2): string {
  if (!Number.isFinite(n)) return '—';
  const r = Number(n.toFixed(dp));
  // Number("-0.00") is -0, whose toFixed still prints the sign; normalise it.
  const safe = Object.is(r, -0) ? 0 : r;
  return safe.toFixed(dp);
}

/**
 * Same as {@link fmt} but always carries an explicit sign, so a value swinging
 * through zero never changes the rendered string width.
 */
export function fmtSigned(n: number, dp = 2): string {
  if (!Number.isFinite(n)) return '—';
  const body = fmt(Math.abs(n), dp);
  return `${n < 0 ? '-' : '+'}${body}`;
}

/** One addend of a substituted linear expression. */
export interface TexTerm {
  /** numeric coefficient (its sign becomes the joining operator) */
  coef: number;
  /** TeX for the symbol it multiplies; omit for a bare constant */
  sym?: string;
  dp?: number;
}

/**
 * Renders `[{coef: 0.62, sym: 'x^{(1)}'}, {coef: -5.41}]` as
 * `0.62\,x^{(1)} - 5.41`, folding each sign into the joining operator so the
 * expression reads like something a person would write.
 */
export function texSum(terms: TexTerm[], dp = 2): string {
  const parts: string[] = [];
  terms.forEach((t, i) => {
    const mag = fmt(Math.abs(t.coef), t.dp ?? dp);
    const body = t.sym ? `${mag}\\,${t.sym}` : mag;
    if (i === 0) parts.push(t.coef < 0 ? `-${body}` : body);
    else parts.push(t.coef < 0 ? `- ${body}` : `+ ${body}`);
  });
  return parts.join(' ') || '0';
}

/* ------------------------------------------------------------------ *
 * change flash
 * ------------------------------------------------------------------ */

/**
 * Returns a remount key + class that replays `.anim-bump` whenever `value`
 * changes. Keying the span forces the animation to restart (CSS animations do
 * not re-fire on a class that is already applied), and the first render is
 * deliberately quiet so panels do not twitch on mount.
 */
function useChangeFlash(value: string): { flashKey: number; flashClass: string } {
  const seen = useRef({ value, n: 0 });
  if (seen.current.value !== value) {
    seen.current = { value, n: seen.current.n + 1 };
  }
  const { n } = seen.current;
  return { flashKey: n, flashClass: n > 0 ? 'anim-bump' : '' };
}

/* ------------------------------------------------------------------ *
 * the panel
 * ------------------------------------------------------------------ */

export interface EqStat {
  label: string;
  value: string;
  /** draw the value a touch bolder — for the headline number of the widget */
  emphasis?: boolean;
}

export interface EquationReadoutProps {
  /** TeX of the general form, e.g. `\mathbf{w}\mathbf{x} - b = 0` */
  symbolic: string;
  /** TeX of the same equation with live numbers substituted in */
  substituted: string;
  /** optional third TeX line (prediction rule, objective, kernel, …) */
  aux?: string;
  stats?: EqStat[];
  /** short prose under the stats; wraps rather than overflowing the card */
  note?: string;
  style?: React.CSSProperties;
}

function StatValue({ value, emphasis }: { value: string; emphasis?: boolean }) {
  const { flashKey, flashClass } = useChangeFlash(value);
  return (
    <span
      key={flashKey}
      className={flashClass}
      style={{
        display: 'inline-block',
        fontFamily: 'var(--font-mono)',
        fontVariantNumeric: 'tabular-nums',
        fontWeight: emphasis ? 700 : 600,
        color: 'var(--ink)',
        // reserve width so a digit gaining/losing a character cannot shove the row
        minWidth: `${Math.max(2, value.length)}ch`,
        textAlign: 'left',
      }}
    >
      {value}
    </span>
  );
}

/** A single row of TeX, height-reserved and horizontally scrollable if long. */
function EqLine({
  tex,
  size,
  color,
  minHeight,
}: {
  tex: string;
  size: string;
  color: string;
  minHeight: number;
}) {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight,
        fontSize: size,
        color,
        overflowX: 'auto',
        overflowY: 'hidden',
        maxWidth: '100%',
      }}
    >
      <span style={{ whiteSpace: 'nowrap', padding: '0 2px' }}>
        <TeX tex={tex} />
      </span>
    </div>
  );
}

export function EquationReadout({
  symbolic,
  substituted,
  aux,
  stats,
  note,
  style,
}: EquationReadoutProps) {
  return (
    <div
      className="anim-fade"
      style={{
        background: '#fffdf8',
        border: '1px solid var(--line)',
        borderRadius: 'var(--radius)',
        padding: '10px 14px 12px',
        marginTop: 10,
        overflowWrap: 'anywhere',
        ...style,
      }}
    >
      <EqLine tex={symbolic} size="0.92rem" color="var(--graphite)" minHeight={22} />
      <EqLine tex={substituted} size="1.06rem" color="var(--ink)" minHeight={30} />
      {aux && <EqLine tex={aux} size="0.86rem" color="var(--graphite)" minHeight={24} />}

      {stats && stats.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: '4px 6px',
            marginTop: 8,
            paddingTop: 8,
            borderTop: '1px solid var(--line)',
            fontSize: '0.8rem',
            lineHeight: 1.5,
          }}
        >
          {stats.map((s, i) => (
            <React.Fragment key={s.label}>
              {i > 0 && (
                <span aria-hidden style={{ color: 'var(--line)', padding: '0 2px' }}>
                  ·
                </span>
              )}
              <span style={{ whiteSpace: 'nowrap' }}>
                <span
                  style={{
                    color: 'var(--graphite)',
                    letterSpacing: '0.04em',
                    marginRight: 5,
                  }}
                >
                  {s.label}
                </span>
                <StatValue value={s.value} emphasis={s.emphasis} />
              </span>
            </React.Fragment>
          ))}
        </div>
      )}

      {note && (
        <p
          style={{
            margin: '7px 0 0',
            fontSize: '0.8rem',
            color: 'var(--graphite)',
            textAlign: 'center',
            overflowWrap: 'anywhere',
          }}
        >
          {note}
        </p>
      )}
    </div>
  );
}

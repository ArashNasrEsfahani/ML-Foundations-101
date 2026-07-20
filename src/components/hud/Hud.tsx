import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useProgress, type Toast } from '../../state/progressStore';
import { levelForXp, levelProgress, levelTitle } from '../../state/levels';
import { SketchIcon } from '../sketch/SketchIcon';

function ToastCard({ toast, onDone }: { toast: Toast; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div
      className="anim-toast"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'var(--ink)',
        color: 'var(--paper)',
        borderRadius: 'var(--radius)',
        padding: '8px 16px',
        boxShadow: 'var(--shadow)',
        fontSize: '0.95rem',
        whiteSpace: 'nowrap',
      }}
    >
      <SketchIcon name={toast.kind === 'badge' ? 'medal' : 'star'} size={16} />
      {toast.text}
    </div>
  );
}

export function Hud() {
  const { save, toasts, dispatch } = useProgress();
  const location = useLocation();
  const lvl = levelForXp(save.xp);
  const prog = levelProgress(save.xp);
  const onMap = location.pathname === '/';

  // pop the XP counter whenever it grows
  const prevXp = useRef(save.xp);
  const [bump, setBump] = useState(0);
  useEffect(() => {
    if (save.xp > prevXp.current) setBump((b) => b + 1);
    prevXp.current = save.xp;
  }, [save.xp]);

  const prevLevel = useRef(lvl);
  const [levelPop, setLevelPop] = useState(0);
  useEffect(() => {
    if (lvl > prevLevel.current) setLevelPop((p) => p + 1);
    prevLevel.current = lvl;
  }, [lvl]);

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          padding: '10px 18px',
          background: 'color-mix(in srgb, var(--paper) 88%, transparent)',
          backdropFilter: 'blur(3px)',
          borderBottom: '1px solid var(--line)',
        }}
      >
        {!onMap ? (
          <Link
            to="/"
            aria-label="Back to map"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
          >
            <SketchIcon name="arrow-left" size={18} />
            <span style={{ fontFamily: 'var(--font-hand)', fontSize: '1.2rem' }}>Map</span>
          </Link>
        ) : (
          <span style={{ fontFamily: 'var(--font-hand)', fontSize: '1.45rem', fontWeight: 700 }}>
            ML 101
          </span>
        )}
        <span style={{ flex: 1 }} />
        <Link to="/about" aria-label="About the book" title="About the book" style={{ display: 'inline-flex' }}>
          <SketchIcon name="book" size={19} />
        </Link>
        <Link to="/badges" aria-label="Badges" style={{ display: 'inline-flex' }}>
          <SketchIcon name="medal" size={19} />
        </Link>
        <Link to="/settings" aria-label="Settings" style={{ display: 'inline-flex' }}>
          <SketchIcon name="gear" size={19} />
        </Link>
        {/* level medallion */}
        <div
          title={`Level ${lvl} — ${levelTitle(lvl)}`}
          style={{ display: 'flex', alignItems: 'center', gap: 8 }}
        >
          <svg key={`lvl-${levelPop}`} className={levelPop ? 'anim-pop' : undefined} width="34" height="34" viewBox="0 0 34 34" aria-hidden>
            <circle
              cx="17"
              cy="17"
              r="14.5"
              fill="#fffdf8"
              stroke="var(--ink)"
              strokeWidth="1.5"
              strokeDasharray="2.5 1.5"
            />
            <text
              x="17"
              y="21.5"
              textAnchor="middle"
              fontSize="13"
              fontFamily="var(--font-hand)"
              fontWeight="700"
              fill="var(--ink)"
            >
              {lvl}
            </text>
          </svg>
          <div style={{ lineHeight: 1.1 }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--graphite)' }}>
              {levelTitle(lvl)} ·{' '}
              <span
                key={`xp-${bump}`}
                className={bump ? 'anim-bump' : undefined}
                style={{ display: 'inline-block', fontVariantNumeric: 'tabular-nums', fontWeight: 700 }}
              >
                {save.xp} XP
              </span>
            </div>
            {/* hand-drawn underline XP bar */}
            <svg width="90" height="8" aria-hidden>
              <path
                d="M2 5 q 20 -2.5 44 0 t 42 0"
                stroke="var(--line)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                className="xp-underline"
                d="M2 5 q 20 -2.5 44 0 t 42 0"
                stroke="var(--ink)"
                strokeWidth="2.5"
                fill="none"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={`${Math.max(0.02, prog)} 1`}
              />
            </svg>
          </div>
        </div>
      </header>
      {/* toast stack */}
      <div
        style={{
          position: 'fixed',
          top: 64,
          right: 18,
          zIndex: 50,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          alignItems: 'flex-end',
          pointerEvents: 'none',
        }}
        aria-live="polite"
      >
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDone={() => dispatch({ type: 'dismissToast', id: t.id })} />
        ))}
      </div>
    </>
  );
}

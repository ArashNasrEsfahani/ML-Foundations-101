import React, { useEffect } from 'react';
import { useProgress } from '../../state/progressStore';
import { levelTitle } from '../../state/levels';
import { SketchIcon } from '../sketch/SketchIcon';
import { Illo } from '../../illustrations';

const SPARKS = 12;

/** Full-screen moment for a level-up or a new badge. Dismisses itself. */
export function CelebrationOverlay() {
  const { celebrations, dispatch } = useProgress();
  const current = celebrations[0];

  useEffect(() => {
    if (!current) return;
    const t = setTimeout(() => dispatch({ type: 'dismissCelebration', id: current.id }), 3200);
    return () => clearTimeout(t);
  }, [current, dispatch]);

  if (!current) return null;

  const isLevel = current.kind === 'level';

  return (
    <div
      className="anim-backdrop"
      onClick={() => dispatch({ type: 'dismissCelebration', id: current.id })}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'grid',
        placeItems: 'center',
        background: 'rgba(250, 247, 240, 0.82)',
        backdropFilter: 'blur(2px)',
        cursor: 'pointer',
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ position: 'relative', textAlign: 'center', padding: 24 }}>
        {/* radiating pencil ticks */}
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', pointerEvents: 'none' }}>
          {Array.from({ length: SPARKS }, (_, i) => (
            <span
              key={i}
              className="anim-spark"
              style={
                {
                  position: 'absolute',
                  width: 2,
                  height: 16,
                  background: 'var(--graphite)',
                  borderRadius: 2,
                  '--a': `${(360 / SPARKS) * i}deg`,
                  animationDelay: `${i * 26}ms`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/* burst rings */}
        <span
          className="anim-ring-burst"
          style={{
            position: 'absolute',
            left: '50%',
            top: 62,
            width: 120,
            height: 120,
            marginLeft: -60,
            marginTop: -60,
            borderRadius: '50%',
            border: '2px solid var(--ink)',
            pointerEvents: 'none',
          }}
        />

        <div className="anim-medal-in" style={{ position: 'relative' }}>
          {isLevel ? (
            <svg width="118" height="118" viewBox="0 0 118 118" aria-hidden>
              <circle cx="59" cy="59" r="50" fill="#fffdf8" stroke="var(--ink)" strokeWidth="2" strokeDasharray="4 3" />
              <circle cx="59" cy="59" r="42" fill="none" stroke="var(--graphite)" strokeWidth="1" />
              <text
                x="59"
                y="74"
                textAnchor="middle"
                fontSize="42"
                fontFamily="var(--font-hand)"
                fontWeight="700"
                fill="var(--ink)"
              >
                {current.level}
              </text>
            </svg>
          ) : (
            <Illo
              name={`badge-${current.badgeId}`}
              size={118}
              fallback={<SketchIcon name="medal" size={100} strokeWidth={1.1} />}
            />
          )}
        </div>

        <h2 style={{ margin: '10px 0 2px', fontSize: '2.6rem' }}>{current.title}</h2>
        <p style={{ margin: 0, color: 'var(--graphite)', fontSize: '1rem' }}>
          {isLevel ? levelTitle(current.level ?? 1) : current.subtitle}
        </p>
        <p style={{ margin: '14px 0 0', color: 'var(--graphite)', fontSize: '0.8rem' }}>tap to continue</p>
      </div>
    </div>
  );
}

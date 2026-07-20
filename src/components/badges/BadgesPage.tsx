import React from 'react';
import { useProgress } from '../../state/progressStore';
import { BADGES } from '../../state/badges';
import { SketchIcon } from '../sketch/SketchIcon';
import { Illo } from '../../illustrations';
import { PaperCard } from '../sketch/PaperCard';

export function BadgesPage() {
  const { save } = useProgress();
  const earnedCount = Object.keys(save.badges).length;

  return (
    <main style={{ maxWidth: 820, margin: '0 auto', padding: '28px 20px 80px' }}>
      <h1>
        Badges{' '}
        <span style={{ fontSize: '1.1rem', color: 'var(--graphite)' }}>
          {earnedCount}/{BADGES.length}
        </span>
      </h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
          gap: 16,
        }}
      >
        {BADGES.map((b, i) => {
          const earned = !!save.badges[b.id];
          return (
            <PaperCard
              key={b.id}
              seed={b.id.length * 31}
              padding={14}
              dashed={!earned}
              className={earned ? 'anim-pop' : 'anim-fade'}
              style={{
                textAlign: 'center',
                opacity: earned ? 1 : 0.55,
                animationDelay: `${Math.min(i, 14) * 45}ms`,
              }}
            >
              <div style={{ filter: earned ? undefined : 'grayscale(1)', opacity: earned ? 1 : 0.5 }}>
                <Illo
                  name={`badge-${b.id}`}
                  size={64}
                  fallback={<SketchIcon name="medal" size={48} strokeWidth={1.2} />}
                />
              </div>
              <div style={{ fontFamily: 'var(--font-hand)', fontSize: '1.2rem', fontWeight: 700, marginTop: 6 }}>
                {earned || !b.secret ? b.name : '???'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--graphite)', lineHeight: 1.4 }}>
                {earned ? 'Earned!' : b.secret ? 'A secret badge…' : b.hint}
              </div>
            </PaperCard>
          );
        })}
      </div>
    </main>
  );
}

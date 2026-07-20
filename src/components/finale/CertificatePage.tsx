import React from 'react';
import { Navigate } from 'react-router-dom';
import { useProgress } from '../../state/progressStore';
import { illustrationUrl } from '../../illustrations';

export function CertificatePage() {
  const { save, dispatch } = useProgress();
  if (!save.finalExam?.passed) return <Navigate to="/" replace />;

  const frameUrl = illustrationUrl('certificate-frame');

  return (
    <main style={{ maxWidth: 860, margin: '0 auto', padding: '28px 20px 80px' }}>
      <style>{`
        @media print {
          header, .no-print { display: none !important; }
          body { background: white !important; }
        }
      `}</style>
      <div className="no-print" style={{ display: 'flex', gap: 12, marginBottom: 18, alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Your name"
          value={save.name ?? ''}
          onChange={(e) => dispatch({ type: 'setName', name: e.target.value })}
          style={{ maxWidth: 280 }}
        />
        <button className="primary" onClick={() => window.print()}>
          Print / save as PDF
        </button>
      </div>

      <div
        style={{
          position: 'relative',
          aspectRatio: '1.414 / 1',
          background: '#fffdf8',
          boxShadow: 'var(--shadow)',
          display: 'grid',
          placeItems: 'center',
          padding: '8%',
          textAlign: 'center',
          backgroundImage: frameUrl ? `url(${frameUrl})` : undefined,
          backgroundSize: '100% 100%',
          border: frameUrl ? 'none' : '3px double var(--ink)',
          outline: frameUrl ? 'none' : '1.5px solid var(--ink)',
          outlineOffset: -14,
        }}
      >
        <div>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: '1.4rem', color: 'var(--graphite)' }}>
            This certifies that
          </div>
          <div
            style={{
              fontFamily: 'var(--font-hand)',
              fontSize: '3rem',
              fontWeight: 700,
              borderBottom: '2px solid var(--ink)',
              display: 'inline-block',
              padding: '0 30px 4px',
              minWidth: 280,
            }}
          >
            {save.name || '…'}
          </div>
          <p style={{ fontSize: '1.05rem', maxWidth: 460, margin: '18px auto 6px' }}>
            has completed <strong>ML 101 — The Foundations of Machine Learning</strong>, passing every chapter
            boss and the final exam, with {save.xp.toLocaleString()} XP earned along the way.
          </p>
          <div style={{ fontFamily: 'var(--font-hand)', fontSize: '1.2rem', color: 'var(--graphite)', marginTop: 14 }}>
            based on Andriy Burkov's “The Hundred-Page Machine Learning Book”
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--graphite)', marginTop: 6 }}>
            themlbook.com — now go and read the original
          </div>
        </div>
      </div>
    </main>
  );
}

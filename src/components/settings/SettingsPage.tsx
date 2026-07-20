import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProgress } from '../../state/progressStore';
import { exportSave } from '../../state/storage';
import { PaperCard } from '../sketch/PaperCard';
import { SketchIcon } from '../sketch/SketchIcon';

export function SettingsPage() {
  const { save, dispatch, importFromJson } = useProgress();
  const navigate = useNavigate();
  const [json, setJson] = useState('');
  const [msg, setMsg] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <main style={{ maxWidth: 'var(--maxw)', margin: '0 auto', padding: '28px 20px 80px' }}>
      <h1>Settings</h1>

      <PaperCard padding={20} seed={3} style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Your name</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--graphite)' }}>Printed on your certificate.</p>
        <input
          type="text"
          value={save.name ?? ''}
          placeholder="Your name"
          onChange={(e) => dispatch({ type: 'setName', name: e.target.value })}
          style={{ width: '100%', maxWidth: 340 }}
        />
      </PaperCard>

      <PaperCard padding={20} seed={19} style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>How you want to learn</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--graphite)', marginTop: 0 }}>
          Switch whenever you like. Your XP, badges and finished sections are the same in both —
          the only difference is what is reachable.
        </p>
        <div style={{ display: 'grid', gap: 10 }}>
          {(
            [
              {
                id: 'journey' as const,
                title: 'Full journey',
                blurb:
                  'Chapters unlock as you finish the one before. Boss exams gate the way forward, so the course paces you.',
              },
              {
                id: 'free' as const,
                title: 'Free roam',
                blurb:
                  'Every chapter, widget and exam is open from the start. Wander wherever you like and dip into whatever you need.',
              },
            ]
          ).map((opt) => {
            const active = (save.mode ?? 'journey') === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => dispatch({ type: 'setMode', mode: opt.id })}
                aria-pressed={active}
                className={active ? 'anim-pop' : undefined}
                style={{
                  textAlign: 'left',
                  padding: '12px 16px',
                  background: active ? 'var(--ink)' : '#fffdf8',
                  color: active ? 'var(--paper)' : 'var(--ink)',
                  borderColor: active ? 'var(--ink)' : 'var(--line)',
                  borderWidth: 1.5,
                  display: 'flex',
                  gap: 12,
                  alignItems: 'flex-start',
                }}
              >
                <SketchIcon name={opt.id === 'free' ? 'flag' : 'book'} size={20} style={{ marginTop: 3 }} />
                <span>
                  <span style={{ fontWeight: 700 }}>
                    {opt.title}
                    {active && ' — on'}
                  </span>
                  <br />
                  <span style={{ fontSize: '0.88rem', opacity: active ? 0.85 : 0.75 }}>{opt.blurb}</span>
                </span>
              </button>
            );
          })}
        </div>
      </PaperCard>

      <PaperCard padding={20} seed={11} style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Placement</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--graphite)' }}>
          {save.placement?.done
            ? save.placement.throughChapter > 0
              ? `You placed into Chapter ${save.placement.throughChapter + 1}. Retake it any time — placement only ever adds progress, never removes it.`
              : 'You chose to start from the beginning. You can still find your level at any point.'
            : 'Answer about six questions to find the right chapter to start from.'}
        </p>
        <button onClick={() => navigate('/placement')}>
          {save.placement?.done ? 'Retake the placement check' : 'Find my level'}
        </button>
      </PaperCard>

      <PaperCard padding={20} seed={5} style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Motion</h3>
        <label style={{ display: 'flex', gap: 10, alignItems: 'center', fontSize: '0.95rem' }}>
          <input
            type="checkbox"
            checked={!!save.reducedMotion}
            onChange={(e) => dispatch({ type: 'setReducedMotion', value: e.target.checked })}
          />
          Reduce animations
        </label>
      </PaperCard>

      <PaperCard padding={20} seed={9} style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Backup progress</h3>
        <p style={{ fontSize: '0.9rem', color: 'var(--graphite)' }}>
          Copy this text somewhere safe, or paste a backup to restore it.
        </p>
        <div style={{ display: 'flex', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          <button
            onClick={async () => {
              const data = exportSave();
              setJson(data);
              try {
                await navigator.clipboard.writeText(data);
                setMsg('Copied to clipboard.');
              } catch {
                setMsg('Copy the text below manually.');
              }
            }}
          >
            Export
          </button>
          <button
            onClick={() => {
              if (importFromJson(json)) setMsg('Progress restored.');
              else setMsg('That does not look like a valid backup.');
            }}
            disabled={json.trim() === ''}
          >
            Import
          </button>
          {msg && <span style={{ alignSelf: 'center', fontSize: '0.85rem', color: 'var(--graphite)' }}>{msg}</span>}
        </div>
        <textarea
          value={json}
          onChange={(e) => setJson(e.target.value)}
          rows={4}
          style={{ width: '100%', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}
          aria-label="save data JSON"
        />
      </PaperCard>

      <PaperCard padding={20} seed={15} dashed>
        <h3 style={{ marginTop: 0 }}>Start over</h3>
        {!confirmReset ? (
          <button className="ghost" onClick={() => setConfirmReset(true)}>
            Reset all progress…
          </button>
        ) : (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.95rem' }}>Erase everything — XP, badges, all of it?</span>
            <button
              onClick={() => {
                dispatch({ type: 'reset' });
                setConfirmReset(false);
                setMsg('');
                setJson('');
              }}
            >
              Yes, erase
            </button>
            <button className="ghost" onClick={() => setConfirmReset(false)}>
              Keep my progress
            </button>
          </div>
        )}
      </PaperCard>
    </main>
  );
}

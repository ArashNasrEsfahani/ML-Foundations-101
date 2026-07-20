import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { chapters } from '../../content';
import { useProgress } from '../../state/progressStore';
import { QuestionBody } from '../quiz/questions';
import { FeedbackPanel, type FeedbackState } from '../quiz/FeedbackPanel';
import { renderInline } from '../lesson/inline';
import { PaperCard } from '../sketch/PaperCard';
import { SketchIcon } from '../sketch/SketchIcon';
import { mulberry32, shuffled } from '../../lib/rng';
import type { Question } from '../../content/schema';

/**
 * Placement stays fast by only asking things you can answer in one tap —
 * matching and ordering questions are fine in an exam but too fiddly here.
 */
const isQuick = (q: Question) => q.kind === 'mcq' || q.kind === 'tf';
const quickPool = (c: (typeof chapters)[number]) => c.bossPool.filter(isQuick);

/** chapters eligible for placement — the conclusion has no exam pool */
const PROBEABLE = chapters.filter((c) => quickPool(c).length >= 2);
const PER_PROBE = 2;

/**
 * Adaptive placement check.
 *
 * Rather than marching through every chapter, this binary-searches the point
 * where the player's knowledge runs out: probe a chapter with two questions,
 * and move the window up if they clear it, down if they don't. An expert
 * settles in ~3 probes (6 questions); a beginner bails out after the first.
 *
 * `lo` = number of leading chapters confirmed known.
 */
export function PlacementQuiz() {
  const navigate = useNavigate();
  const { dispatch } = useProgress();

  const [phase, setPhase] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [lo, setLo] = useState(0);
  const [hi, setHi] = useState(PROBEABLE.length);
  const [probeIdx, setProbeIdx] = useState(() => Math.floor((0 + PROBEABLE.length + 1) / 2) - 1);
  const [qNum, setQNum] = useState(0);
  const [correctInProbe, setCorrectInProbe] = useState(0);
  const [asked, setAsked] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [seed] = useState(() => (Date.now() % 100000) + 1);

  const chapter = PROBEABLE[Math.min(probeIdx, PROBEABLE.length - 1)];

  const probeQuestions: Question[] = useMemo(() => {
    if (!chapter) return [];
    const rand = mulberry32(seed + probeIdx * 977);
    return shuffled(quickPool(chapter), rand).slice(0, PER_PROBE);
  }, [chapter, probeIdx, seed]);

  const q = probeQuestions[qNum];

  const settle = (newLo: number, newHi: number) => {
    if (newLo >= newHi) {
      setLo(newLo);
      setHi(newHi);
      setPhase('result');
      return;
    }
    const nextProbe = Math.floor((newLo + newHi + 1) / 2) - 1;
    setLo(newLo);
    setHi(newHi);
    setProbeIdx(nextProbe);
    setQNum(0);
    setCorrectInProbe(0);
    setFeedback(null);
  };

  const advance = () => {
    const isLast = qNum + 1 >= probeQuestions.length;
    if (!isLast) {
      setQNum(qNum + 1);
      setFeedback(null);
      return;
    }
    // cleared the probe only by answering everything in it correctly
    const cleared = correctInProbe === probeQuestions.length;
    if (cleared) settle(probeIdx + 1, hi);
    else settle(lo, probeIdx);
  };

  const onSubmit = (ok: boolean) => {
    if (ok) setCorrectInProbe((c) => c + 1);
    setAsked((a) => a + 1);
    setFeedback(ok ? 'correct' : 'wrong-reveal');
  };

  // ---------- intro ----------
  if (phase === 'intro') {
    return (
      <main className="anim-rise" style={{ maxWidth: 'var(--maxw)', margin: '0 auto', padding: '40px 20px' }}>
        <PaperCard padding={28} seed={23}>
          <div style={{ textAlign: 'center', marginBottom: 8 }}>
            <span className="anim-draw" style={{ display: 'inline-flex' }}>
              <SketchIcon name="flag" size={44} strokeWidth={1.2} />
            </span>
          </div>
          <h1 style={{ marginTop: 0, textAlign: 'center' }}>Where should you start?</h1>
          <p>
            If some of this book is already familiar, you don’t have to read your way back through
            it. Answer a handful of questions and the course will work out how far in you belong —
            usually in about <strong>six questions</strong>, because it zeroes in rather than
            marching through every chapter.
          </p>
          <p style={{ color: 'var(--graphite)', fontSize: '0.92rem' }}>
            Clear a chapter’s questions and everything up to it is marked as known, with the XP to
            match. Get one wrong and the search settles there. Nothing is ever locked back up, and
            you can retake this from Settings whenever you like.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 20, flexWrap: 'wrap' }}>
            <button className="primary" onClick={() => setPhase('quiz')}>
              Find my level
              <SketchIcon name="arrow-right" size={15} style={{ marginLeft: 8, verticalAlign: '-2px' }} />
            </button>
            <button
              onClick={() => {
                dispatch({ type: 'placement', throughChapter: 0 });
                navigate('/');
              }}
            >
              I’m new — start from the beginning
            </button>
          </div>
        </PaperCard>
      </main>
    );
  }

  // ---------- result ----------
  if (phase === 'result') {
    const startChapter = chapters[Math.min(lo, chapters.length - 1)];
    const skipped = chapters.slice(0, lo);
    return (
      <main className="anim-rise" style={{ maxWidth: 'var(--maxw)', margin: '0 auto', padding: '40px 20px' }}>
        <PaperCard padding={28} seed={27}>
          <div style={{ textAlign: 'center', position: 'relative' }}>
            <span
              className="anim-ring-burst"
              style={{
                position: 'absolute', left: '50%', top: 26, width: 88, height: 88,
                marginLeft: -44, marginTop: -44, borderRadius: '50%',
                border: '2px solid var(--ink)', pointerEvents: 'none',
              }}
            />
            <span className="anim-pop" style={{ display: 'inline-block' }}>
              <SketchIcon name={lo > 0 ? 'trophy' : 'book'} size={50} strokeWidth={1.2} />
            </span>
            <h1 style={{ margin: '10px 0 4px' }}>
              {lo === 0 ? 'Start at the beginning' : `You belong in Chapter ${startChapter.number}`}
            </h1>
            <p style={{ color: 'var(--graphite)', margin: 0 }}>
              {lo === 0
                ? 'Chapter 1 opens gently — this is the right place to begin.'
                : `${skipped.length} chapter${skipped.length === 1 ? '' : 's'} cleared, worth ${skipped.length * 100} XP.`}
            </p>
          </div>

          {lo > 0 && (
            <ul style={{ margin: '18px 0', paddingLeft: 22, fontSize: '0.95rem' }}>
              {skipped.map((c) => (
                <li key={c.id} style={{ marginBottom: 3 }}>
                  <strong>{c.title}</strong>{' '}
                  <span style={{ color: 'var(--graphite)' }}>— marked as known</span>
                </li>
              ))}
            </ul>
          )}

          <p style={{ fontSize: '0.88rem', color: 'var(--graphite)' }}>
            Skipped chapters stay fully readable — nothing is hidden, and you can go back through
            any of them for the widgets and the XP whenever you want.
          </p>

          <div style={{ display: 'flex', gap: 12, marginTop: 18, flexWrap: 'wrap' }}>
            <button
              className="primary"
              onClick={() => {
                dispatch({ type: 'placement', throughChapter: lo });
                navigate('/');
              }}
            >
              {lo === 0 ? 'Take me to Chapter 1' : `Unlock and start at Chapter ${startChapter.number}`}
            </button>
            <button
              onClick={() => {
                dispatch({ type: 'placement', throughChapter: 0 });
                navigate('/');
              }}
            >
              Ignore this — start from the beginning
            </button>
          </div>
        </PaperCard>
      </main>
    );
  }

  // ---------- quiz ----------
  if (!q) return null;

  return (
    <main style={{ maxWidth: 'var(--maxw)', margin: '0 auto', padding: '28px 20px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <h2 style={{ margin: 0 }}>Placement check</h2>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: '0.85rem', color: 'var(--graphite)' }}>
          question {asked + (feedback ? 0 : 1)} · narrowing it down
        </span>
      </div>

      <p style={{ fontSize: '0.85rem', color: 'var(--graphite)', margin: '0 0 10px' }}>
        Testing your grasp of <strong>Chapter {chapter.number} — {chapter.title}</strong>
      </p>

      <PaperCard key={`${probeIdx}-${qNum}`} padding={22} seed={probeIdx * 7 + qNum} className="anim-rise">
        <div style={{ fontSize: '1.05rem', marginBottom: 14 }}>{renderInline(q.prompt)}</div>
        <QuestionBody
          key={`${q.id}-${probeIdx}`}
          q={q}
          locked={feedback !== null}
          reveal={feedback !== null}
          onSubmit={onSubmit}
        />
        {feedback && (
          <FeedbackPanel
            state={feedback}
            explain={q.explain}
            onContinue={advance}
            continueLabel={qNum + 1 >= probeQuestions.length ? 'Next' : 'Continue'}
          />
        )}
      </PaperCard>

      <button
        className="ghost"
        style={{ marginTop: 18 }}
        onClick={() => {
          dispatch({ type: 'placement', throughChapter: 0 });
          navigate('/');
        }}
      >
        Skip this — just start at Chapter 1
      </button>
    </main>
  );
}

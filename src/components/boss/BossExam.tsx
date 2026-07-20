import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { chapters } from '../../content';
import { useProgress } from '../../state/progressStore';
import { isBossUnlocked, isFinalUnlocked, isChapterUnlocked } from '../../state/unlock';
import { QuestionBody } from '../quiz/questions';
import { FeedbackPanel, type FeedbackState } from '../quiz/FeedbackPanel';
import { renderInline } from '../lesson/inline';
import { SketchIcon } from '../sketch/SketchIcon';
import { PaperCard } from '../sketch/PaperCard';
import { mulberry32, shuffled } from '../../lib/rng';
import type { Question } from '../../content/schema';

/**
 * Boss exam: N questions sampled from the chapter pool, 3 "eraser" lives,
 * one shot per question (no retry). Pass = finish with >= passScore correct.
 * Also drives the final exam when chapterId === 'final'.
 */
export function BossExam({ final = false, testOut = false }: { final?: boolean; testOut?: boolean }) {
  const { chapterId } = useParams();
  const navigate = useNavigate();
  const { save, dispatch } = useProgress();

  const isFinal = final || chapterId === undefined;
  const chapter = isFinal ? undefined : chapters.find((c) => c.id === chapterId);

  const config = isFinal
    ? { count: 20, lives: 4, title: 'The Final Exam' }
    : testOut
      ? { count: 8, lives: 1, title: `Test out of Chapter ${chapter?.number}` }
      : { count: 12, lives: 3, title: `Chapter ${chapter?.number} Boss` };

  const pool: Question[] = useMemo(() => {
    if (isFinal) return chapters.flatMap((c) => c.bossPool);
    return chapter?.bossPool ?? [];
  }, [isFinal, chapter]);

  const [attemptSeed, setAttemptSeed] = useState(() => (Date.now() % 100000) + 1);

  const questions = useMemo(() => {
    const rand = mulberry32(attemptSeed);
    if (isFinal) {
      // spread across chapters: take proportionally, then top up randomly
      const picked: Question[] = [];
      for (const c of chapters) {
        const take = Math.min(c.bossPool.length, 2);
        picked.push(...shuffled(c.bossPool, rand).slice(0, take));
      }
      return shuffled(picked, rand).slice(0, config.count);
    }
    return shuffled(pool, rand).slice(0, config.count);
  }, [pool, attemptSeed, isFinal, config.count]);

  const [idx, setIdx] = useState(0);
  const [wrong, setWrong] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [phase, setPhase] = useState<'intro' | 'exam' | 'result'>('intro');

  if (!isFinal && !chapter) return <Navigate to="/" replace />;
  // testing out deliberately bypasses the "finish every section first" gate —
  // that is the whole point — but the chapter itself must still be reachable.
  if (!isFinal && chapter && testOut && (!isChapterUnlocked(save, chapters, chapter.id) || save.bosses[chapter.id]?.passed))
    return <Navigate to="/" replace />;
  if (
    !isFinal &&
    chapter &&
    !testOut &&
    !isBossUnlocked(save, chapters, chapter.id) &&
    !save.bosses[chapter.id]?.passed
  )
    return <Navigate to="/" replace />;
  if (isFinal && !isFinalUnlocked(save, chapters)) return <Navigate to="/" replace />;

  const total = Math.min(config.count, questions.length);
  const failed = wrong >= config.lives + 1;
  const q = questions[idx];

  const record = (passed: boolean, score: number) => {
    if (isFinal) dispatch({ type: 'final', score, passed });
    else if (chapter && testOut) {
      // passing marks the whole chapter cleared; failing costs nothing but time
      if (passed) dispatch({ type: 'testOut', chapterId: chapter.id });
    } else if (chapter) dispatch({ type: 'boss', chapterId: chapter.id, score, passed, total });
  };

  const handleSubmit = (ok: boolean) => {
    if (ok) {
      setCorrect((c) => c + 1);
      setFeedback('correct');
    } else {
      setWrong((w) => w + 1);
      setFeedback('wrong-reveal');
    }
  };

  const advance = () => {
    const newWrong = wrong;
    const newCorrect = correct;
    if (newWrong >= config.lives + 1) {
      record(false, newCorrect);
      setPhase('result');
      return;
    }
    if (idx + 1 >= total) {
      record(true, newCorrect);
      setPhase('result');
      return;
    }
    setIdx(idx + 1);
    setFeedback(null);
  };

  const retry = () => {
    setAttemptSeed((s) => s + 7919);
    setIdx(0);
    setWrong(0);
    setCorrect(0);
    setFeedback(null);
    setPhase('exam');
  };

  // ---------- render ----------
  const erasers = (
    <div style={{ display: 'flex', gap: 6 }} aria-label={`${Math.max(0, config.lives - wrong)} erasers left`}>
      {Array.from({ length: config.lives }, (_, i) => {
        const spent = i >= config.lives - wrong;
        // the most recently spent eraser is the one that just got crossed out
        const justSpent = spent && i === config.lives - wrong;
        return (
          <span
            key={i}
            className={justSpent ? 'anim-shake' : undefined}
            style={{
              opacity: spent ? 0.25 : 1,
              position: 'relative',
              transition: 'opacity 0.45s ease',
            }}
          >
            <SketchIcon name="eraser" size={22} />
            {spent && (
              <span
                className={justSpent ? 'anim-draw-fast' : undefined}
                style={{ position: 'absolute', left: 0, top: 0, color: 'var(--graphite)' }}
              >
                <SketchIcon name="cross" size={22} />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );

  if (phase === 'intro') {
    return (
      <main className="anim-rise" style={{ maxWidth: 'var(--maxw)', margin: '0 auto', padding: '40px 20px' }}>
        <PaperCard padding={28} seed={13}>
          <h1 style={{ marginTop: 0 }}>{config.title}</h1>
          {testOut && (
            <p style={{ color: 'var(--graphite)' }}>
              Already know this chapter? Clear this and it counts as read — sections marked done,
              the boss cleared, and the next chapter opened. Fail and nothing is lost; the chapter
              is simply waiting for you as usual.
            </p>
          )}
          <p>
            {total} questions drawn from {isFinal ? 'the whole book' : 'this chapter'}. You have{' '}
            <strong>{config.lives} erasers</strong> — each wrong answer uses one up. Lose them all
            and the attempt ends. You can always retry with a fresh set of questions.
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {erasers}
            <span style={{ flex: 1 }} />
            <button className="primary" onClick={() => setPhase('exam')}>
              Begin
            </button>
          </div>
        </PaperCard>
      </main>
    );
  }

  if (phase === 'result') {
    const passed = !failed;
    return (
      <main style={{ maxWidth: 'var(--maxw)', margin: '0 auto', padding: '40px 20px' }}>
        <PaperCard padding={28} seed={17}>
          <div style={{ textAlign: 'center', position: 'relative' }}>
            {passed && (
              <span
                className="anim-ring-burst"
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: 30,
                  width: 90,
                  height: 90,
                  marginLeft: -45,
                  marginTop: -45,
                  borderRadius: '50%',
                  border: '2px solid var(--ink)',
                  pointerEvents: 'none',
                }}
              />
            )}
            <span className={passed ? 'anim-pop' : 'anim-rise'} style={{ display: 'inline-block' }}>
              <span className="anim-draw" style={{ display: 'inline-flex' }}>
                <SketchIcon name={passed ? 'trophy' : 'eraser'} size={54} strokeWidth={1.2} />
              </span>
            </span>
            <h1 className="anim-rise" style={{ margin: '10px 0 4px', animationDelay: '160ms' }}>
              {passed
                ? testOut
                  ? 'Chapter cleared!'
                  : 'Boss defeated!'
                : testOut
                  ? 'Worth reading after all'
                  : 'Out of erasers'}
            </h1>
            <p className="anim-fade" style={{ color: 'var(--graphite)', animationDelay: '260ms' }}>
              {correct} of {total} correct.
              {passed && correct === total && ' A perfect run!'}
              {!passed && testOut && ' No harm done — the chapter is waiting for you.'}
            </p>
            <div
              className="anim-rise"
              style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 18, animationDelay: '340ms' }}
            >
              {!passed && !testOut && (
                <button className="primary" onClick={retry}>
                  Try again (new questions)
                </button>
              )}
              {!passed && testOut && chapter && (
                <button
                  className="primary"
                  onClick={() => navigate(`/ch/${chapter.id}/${chapter.sections[0].id}`)}
                >
                  Read the chapter
                </button>
              )}
              {passed && isFinal && (
                <button className="primary" onClick={() => navigate('/certificate')}>
                  Claim certificate
                </button>
              )}
              <button onClick={() => navigate('/')}>Back to map</button>
            </div>
          </div>
        </PaperCard>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 'var(--maxw)', margin: '0 auto', padding: '28px 20px 80px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18 }}>
        <h2 style={{ margin: 0 }}>{config.title}</h2>
        <span style={{ flex: 1 }} />
        <span style={{ fontSize: '0.85rem', color: 'var(--graphite)' }}>
          {idx + 1}/{total}
        </span>
        {erasers}
      </div>
      <PaperCard key={`q-${idx}`} padding={22} seed={idx + 29} className="anim-rise">
        <div style={{ fontSize: '1.05rem', marginBottom: 14 }}>{renderInline(q.prompt)}</div>
        <QuestionBody
          key={`${q.id}-${attemptSeed}`}
          q={q}
          locked={feedback !== null}
          reveal={feedback !== null}
          onSubmit={handleSubmit}
        />
        {feedback && (
          <FeedbackPanel
            state={feedback}
            explain={q.explain}
            onContinue={advance}
            continueLabel={
              wrong >= config.lives + 1 ? 'See result' : idx + 1 >= total ? 'Finish' : 'Next question'
            }
          />
        )}
      </PaperCard>
    </main>
  );
}

import React, { useState } from 'react';
import type { Question } from '../../content/schema';
import { QuestionBody } from './questions';
import { FeedbackPanel, type FeedbackState } from './FeedbackPanel';
import { renderInline } from '../lesson/inline';
import { useProgress } from '../../state/progressStore';
import { SketchIcon } from '../sketch/SketchIcon';

/**
 * Checkpoint quiz: sequences questions, instant feedback, one retry then reveal.
 * XP flows through the progress store (idempotent per question id).
 */
export function QuizEngine({
  quizId,
  questions,
  onComplete,
}: {
  quizId: string;
  questions: Question[];
  onComplete?: (allFirstTry: boolean) => void;
}) {
  const { dispatch } = useProgress();
  const [idx, setIdx] = useState(0);
  const [attempt, setAttempt] = useState(1);
  const [feedback, setFeedback] = useState<FeedbackState | null>(null);
  const [firstTryCount, setFirstTryCount] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[idx];

  const handleSubmit = (correct: boolean) => {
    if (correct) {
      const firstTry = attempt === 1;
      dispatch({ type: 'question', questionId: q.id, firstTry, correct: true });
      if (firstTry) setFirstTryCount((c) => c + 1);
      setFeedback('correct');
    } else {
      dispatch({ type: 'question', questionId: q.id, firstTry: false, correct: false });
      setFeedback(attempt === 1 ? 'wrong-retry' : 'wrong-reveal');
    }
  };

  const advance = () => {
    if (idx + 1 >= questions.length) {
      const perfect = firstTryCount === questions.length;
      if (perfect) dispatch({ type: 'quizPerfect', quizId });
      setFinished(true);
      onComplete?.(perfect);
      return;
    }
    setIdx(idx + 1);
    setAttempt(1);
    setFeedback(null);
  };

  if (finished) {
    const perfect = firstTryCount === questions.length;
    return (
      <div
        className="anim-pop"
        style={{ display: 'flex', alignItems: 'center', gap: 10, color: perfect ? 'var(--ok)' : 'var(--graphite)' }}
      >
        <span className="anim-draw" style={{ display: 'inline-flex' }}>
          <SketchIcon name={perfect ? 'star' : 'check'} size={18} />
        </span>
        <span style={{ fontWeight: perfect ? 700 : 400 }}>
          {perfect
            ? `Flawless — ${questions.length}/${questions.length} on the first try!`
            : `Checkpoint done — ${firstTryCount}/${questions.length} on the first try.`}
        </span>
      </div>
    );
  }

  return (
    <div key={q.id} className="anim-fade">
      <p style={{ fontSize: '0.8rem', color: 'var(--graphite)', margin: '0 0 6px' }}>
        Question {idx + 1} of {questions.length}
      </p>
      <div className="anim-slide-left" style={{ fontSize: '1.02rem', marginBottom: 12 }}>
        {renderInline(q.prompt)}
      </div>
      <QuestionBody
        key={`${q.id}-a${attempt}`}
        q={q}
        locked={feedback !== null}
        reveal={feedback === 'wrong-reveal' || feedback === 'correct'}
        onSubmit={handleSubmit}
      />
      {feedback && (
        <FeedbackPanel
          state={feedback}
          explain={q.explain}
          onContinue={advance}
          onRetry={() => {
            setAttempt(2);
            setFeedback(null);
          }}
          continueLabel={idx + 1 >= questions.length ? 'Finish checkpoint' : 'Continue'}
        />
      )}
    </div>
  );
}

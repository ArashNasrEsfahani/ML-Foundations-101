import React, { useMemo, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { chapters } from '../../content';
import { useProgress } from '../../state/progressStore';
import { isSectionUnlocked, isBossUnlocked } from '../../state/unlock';
import { BlockRenderer } from './BlockRenderer';
import { SketchIcon } from '../sketch/SketchIcon';

export function LessonPage() {
  const { chapterId, sectionId } = useParams();
  const navigate = useNavigate();
  const { save, dispatch } = useProgress();

  const chapter = chapters.find((c) => c.id === chapterId);
  const section = chapter?.sections.find((s) => s.id === sectionId);

  const quizIds = useMemo(
    () => (section ? section.blocks.filter((b) => b.type === 'quiz').map((b) => (b as { id: string }).id) : []),
    [section],
  );

  // a quiz counts as done if every one of its questions is recorded in the save
  const initiallyDone = useMemo(() => {
    const done: Record<string, boolean> = {};
    if (section) {
      for (const b of section.blocks) {
        if (b.type === 'quiz') {
          done[b.id] = b.questions.every((q) => !!save.questions[q.id]);
        }
      }
    }
    return done;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [section?.id]);

  const [quizDone, setQuizDone] = useState<Record<string, boolean>>(initiallyDone);
  const [quizPerfect, setQuizPerfect] = useState<Record<string, boolean>>({});

  if (!chapter || !section) return <Navigate to="/" replace />;
  if (!isSectionUnlocked(save, chapters, chapter.id, section.id)) return <Navigate to="/" replace />;

  const allQuizzesDone = quizIds.every((id) => quizDone[id]);
  const alreadyComplete = !!save.sections[section.id]?.done;
  const sectionIdx = chapter.sections.findIndex((s) => s.id === section.id);
  const nextSection = chapter.sections[sectionIdx + 1];

  const completeAndGo = () => {
    if (!alreadyComplete) {
      const perfect = quizIds.length > 0 && quizIds.every((id) => quizPerfect[id]);
      dispatch({ type: 'section', sectionId: section.id, perfect });
    }
    if (nextSection) navigate(`/ch/${chapter.id}/${nextSection.id}`);
    else if (isBossUnlocked({ ...save, sections: { ...save.sections, [section.id]: { done: true, at: 0, perfect: false } } }, chapters, chapter.id))
      navigate(`/boss/${chapter.id}`);
    else navigate('/');
  };

  return (
    <main
      key={section.id}
      className="anim-rise"
      style={{ maxWidth: 'var(--maxw)', margin: '0 auto', padding: '24px 20px 80px' }}
    >
      <p className="anim-fade" style={{ color: 'var(--graphite)', fontSize: '0.85rem', margin: 0 }}>
        Chapter {chapter.number} · {chapter.title} · ~{section.minutes} min
      </p>
      <h1 className="anim-slide-left" style={{ marginTop: 4, animationDelay: '70ms' }}>
        {section.title}
      </h1>

      <BlockRenderer
        blocks={section.blocks}
        sectionId={section.id}
        onQuizComplete={(quizId, perfect) => {
          setQuizDone((d) => ({ ...d, [quizId]: true }));
          setQuizPerfect((p) => ({ ...p, [quizId]: perfect }));
        }}
      />

      <footer
        style={{
          marginTop: 40,
          paddingTop: 20,
          borderTop: '1.5px dashed var(--line)',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
        }}
      >
        {alreadyComplete ? (
          <span
            className="anim-pop"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--graphite)' }}
          >
            <span className="anim-draw" style={{ display: 'inline-flex' }}>
              <SketchIcon name="check" size={16} />
            </span>{' '}
            Section complete
          </span>
        ) : (
          <span style={{ color: 'var(--graphite)', fontSize: '0.9rem' }}>
            {allQuizzesDone ? 'Nice work — wrap it up:' : 'Finish the checkpoint to complete this section.'}
          </span>
        )}
        <span style={{ flex: 1 }} />
        <button className="primary" disabled={!allQuizzesDone && !alreadyComplete} onClick={completeAndGo}>
          {alreadyComplete
            ? nextSection
              ? 'Next section'
              : 'Back to map'
            : nextSection
              ? 'Complete & continue'
              : 'Complete section'}
          <SketchIcon name="arrow-right" size={15} style={{ marginLeft: 8, verticalAlign: '-2px' }} />
        </button>
      </footer>
    </main>
  );
}

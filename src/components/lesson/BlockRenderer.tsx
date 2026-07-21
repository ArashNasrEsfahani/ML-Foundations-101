import React from 'react';
import type { Block } from '../../content/schema';
import { renderInline } from './inline';
import { TeX } from './TeX';
import { FormulaBlock } from './FormulaBlock';
import { CodeBlock } from './CodeBlock';
import { HintCallout } from './HintCallout';
import { QuizEngine } from '../quiz/QuizEngine';
import { widgetRegistry } from '../widgets/registry';
import { PaperCard } from '../sketch/PaperCard';
import { figureRegistry } from '../figures';

export function BlockRenderer({
  blocks,
  sectionId,
  onQuizComplete,
}: {
  blocks: Block[];
  sectionId: string;
  onQuizComplete?: (quizId: string, perfect: boolean) => void;
}) {
  return (
    <>
      {blocks.map((b, i) => {
        switch (b.type) {
          case 'p':
            return <p key={i}>{renderInline(b.md)}</p>;
          case 'math':
            return <TeX key={i} tex={b.tex} block />;
          case 'formula':
            return <FormulaBlock key={i} tex={b.tex} terms={b.terms} parts={b.parts} />;
          case 'list': {
            const items = b.items.map((it, j) => <li key={j}>{renderInline(it)}</li>);
            return b.ordered ? <ol key={i}>{items}</ol> : <ul key={i}>{items}</ul>;
          }
          case 'code':
            return <CodeBlock key={i} code={b.code} caption={b.caption} />;
          case 'hint':
            return <HintCallout key={i} md={b.md} hintId={`${sectionId}:hint:${i}`} />;
          case 'figure': {
            const Fig = figureRegistry[b.render];
            return (
              <figure key={i} style={{ margin: '1.4em 0', textAlign: 'center' }}>
                {Fig ? (
                  <Fig />
                ) : (
                  <div style={{ color: 'var(--graphite)', fontStyle: 'italic' }}>[figure: {b.render}]</div>
                )}
                {b.caption && (
                  <figcaption style={{ fontSize: '0.88rem', color: 'var(--graphite)', marginTop: 6 }}>
                    {renderInline(b.caption)}
                  </figcaption>
                )}
              </figure>
            );
          }
          case 'widget': {
            const Widget = widgetRegistry[b.id];
            if (!Widget) {
              return (
                <PaperCard key={i} dashed padding={16} style={{ margin: '1.4em 0' }}>
                  <span style={{ color: 'var(--graphite)', fontStyle: 'italic' }}>
                    Interactive: {b.id} (under construction)
                  </span>
                </PaperCard>
              );
            }
            return <Widget key={i} challenge={b.challenge} props={b.props} />;
          }
          case 'quiz':
            return (
              <PaperCard key={i} padding={20} seed={41} className="anim-rise" style={{ margin: '1.6em 0' }}>
                <h3 style={{ marginTop: 0 }}>✎ Checkpoint</h3>
                <QuizEngine
                  quizId={b.id}
                  questions={b.questions}
                  onComplete={(perfect) => onQuizComplete?.(b.id, perfect)}
                />
              </PaperCard>
            );
          default:
            return null;
        }
      })}
    </>
  );
}

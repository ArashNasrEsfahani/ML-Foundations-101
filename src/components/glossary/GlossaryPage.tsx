import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { conceptGroups, concepts, conceptVideo, type Concept } from '../../content/concepts';
import { chapters } from '../../content';
import { resolveHref } from '../../content/links';
import { renderInline } from '../lesson/inline';
import { PaperCard } from '../sketch/PaperCard';
import { SketchIcon } from '../sketch/SketchIcon';

const LEVELS = [
  { id: 'simple', label: 'In plain words' },
  { id: 'technical', label: 'A bit deeper' },
  { id: 'math', label: 'The maths' },
] as const;

type LevelId = (typeof LEVELS)[number]['id'];

/** everything a search box should look at — the words, not just the headword */
function haystack(c: Concept): string {
  return `${c.term} ${c.id} ${c.simple} ${c.technical}`.toLowerCase();
}

function Entry({ concept }: { concept: Concept }) {
  const [open, setOpen] = useState(false);
  const [level, setLevel] = useState<LevelId>('simple');
  const video = conceptVideo(concept);
  const teaches = concept.teachesAt ? resolveHref(`sec:${concept.teachesAt}`) : null;

  return (
    <div style={{ borderBottom: '1px dashed var(--line)', padding: '11px 0' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: 10,
          width: '100%',
          textAlign: 'left',
          background: 'none',
          border: 0,
          padding: 0,
          font: 'inherit',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-hand)',
            fontSize: '1.25rem',
            fontWeight: 700,
            flex: '0 0 auto',
          }}
        >
          {concept.term}
        </span>
        {!open && (
          <span
            style={{
              color: 'var(--graphite)',
              fontSize: '0.9rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
            }}
          >
            {concept.simple}
          </span>
        )}
      </button>

      {open && (
        <div className="anim-fade" style={{ marginTop: 8 }}>
          <div className="concept-tabs" style={{ maxWidth: 360 }}>
            {LEVELS.map((l) => (
              <button
                key={l.id}
                className={level === l.id ? 'concept-tab on' : 'concept-tab'}
                onClick={() => setLevel(l.id)}
              >
                {l.label}
              </button>
            ))}
          </div>
          <div style={{ fontSize: '0.96rem' }}>{renderInline(concept[level])}</div>
          <div className="concept-card-foot" style={{ marginTop: 9 }}>
            {video && (
              <a className="concept-video" href={video.url} target="_blank" rel="noreferrer">
                <SketchIcon name="play" size={15} />
                <span>{video.exact ? 'Watch the StatQuest video' : 'Find it on StatQuest'}</span>
              </a>
            )}
            {teaches?.ok && (
              <Link className="concept-goto" to={teaches.href} title={teaches.hint}>
                Read the section
                <SketchIcon name="arrow-right" size={13} />
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Every term the course marks up, in one place. The lesson pages explain things
 * where you meet them; this is for when you meet them again three chapters
 * later and the name has gone.
 */
export function GlossaryPage() {
  const [q, setQ] = useState('');

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return conceptGroups
      .map((g) => ({
        ...g,
        title: chapters.find((c) => c.id === g.chapterId)?.title ?? '',
        items: needle ? g.items.filter((c) => haystack(c).includes(needle)) : g.items,
      }))
      .filter((g) => g.items.length > 0);
  }, [q]);

  const shown = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <main
      className="anim-rise"
      style={{ maxWidth: 'var(--maxw)', margin: '0 auto', padding: '24px 20px 80px' }}
    >
      <h1 style={{ marginTop: 4 }}>Every term, three ways</h1>
      <p style={{ color: 'var(--graphite)', marginTop: 0 }}>
        {concepts.length} ideas from the course, each explained in plain words, then a little deeper,
        then in full maths. The same cards open by hovering any underlined term in a lesson.
      </p>

      <input
        type="text"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search — kernel, overfitting, entropy…"
        aria-label="Search the glossary"
        style={{ width: '100%', margin: '10px 0 4px' }}
      />
      <p style={{ fontSize: '0.82rem', color: 'var(--graphite)', margin: '0 0 18px' }}>
        {q.trim() ? `${shown} matching` : 'grouped by the chapter that teaches them'}
      </p>

      {groups.map((g) => (
        <PaperCard key={g.chapterId} padding={18} seed={g.number * 7} style={{ marginBottom: 18 }}>
          <div
            style={{
              fontFamily: 'var(--font-hand)',
              fontSize: '1.05rem',
              color: 'var(--graphite)',
              marginBottom: 4,
            }}
          >
            Chapter {g.number} · {g.title}
          </div>
          {g.items.map((c) => (
            <Entry key={c.id} concept={c} />
          ))}
        </PaperCard>
      ))}

      {groups.length === 0 && (
        <p style={{ color: 'var(--graphite)' }}>Nothing matches “{q}”.</p>
      )}

      <footer style={{ marginTop: 30 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <SketchIcon name="arrow-left" size={16} />
          Back to the map
        </Link>
      </footer>
    </main>
  );
}

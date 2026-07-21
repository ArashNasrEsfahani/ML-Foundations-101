import React from 'react';
import { PaperCard } from '../sketch/PaperCard';
import { SketchIcon } from '../sketch/SketchIcon';

/** Single source of truth for the author credit — used by the About page and the map footer. */
export const AUTHOR = 'Arash NasrEsfahani';
export const AUTHOR_SITE = 'https://arashnasresfahani.github.io';
export const AUTHOR_SITE_LABEL = 'arashnasresfahani.github.io';
export const AUTHOR_GITHUB = 'https://github.com/ArashNasrEsfahani';
export const PROJECT_REPO = 'https://github.com/ArashNasrEsfahani/ML-Foundations-101';

/** The full credit card: who built the course and where to find them. */
export function MadeByCard() {
  return (
    <PaperCard padding={24} seed={97} style={{ marginBottom: 20 }}>
      <h3 style={{ marginTop: 0 }}>Who made this</h3>
      <p style={{ margin: '0 0 14px' }}>
        The lessons, the exercises, the widgets and the drawings were put together by{' '}
        <strong>{AUTHOR}</strong>. The whole course is open source, so if something here is
        wrong — a shaky explanation, a widget that misbehaves, a question with two defensible
        answers — the repository is the place to say so.
      </p>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <a href={AUTHOR_SITE} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <button className="ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <SketchIcon name="globe" size={17} />
            {AUTHOR_SITE_LABEL}
          </button>
        </a>
        <a href={AUTHOR_GITHUB} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <button className="ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <SketchIcon name="github" size={17} />
            GitHub
          </button>
        </a>
      </div>
      <p style={{ margin: '12px 0 0', fontSize: '0.82rem', color: 'var(--graphite)' }}>
        The source for this course lives at{' '}
        <a className="credit-link" href={PROJECT_REPO} target="_blank" rel="noopener noreferrer">
          ML-Foundations-101
        </a>
        .
      </p>
    </PaperCard>
  );
}

/** The quiet one-line version, for the bottom of a page that is already busy. */
export function MadeByLine({ style }: { style?: React.CSSProperties }) {
  return (
    <p
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        flexWrap: 'wrap',
        margin: 0,
        fontSize: '0.84rem',
        color: 'var(--graphite)',
        ...style,
      }}
    >
      <span>Made by</span>
      <a
        className="credit-link"
        href={AUTHOR_SITE}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
      >
        <SketchIcon name="globe" size={14} />
        {AUTHOR}
      </a>
      <span aria-hidden>·</span>
      <a
        className="credit-link"
        href={AUTHOR_GITHUB}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}
      >
        <SketchIcon name="github" size={14} />
        GitHub
      </a>
    </p>
  );
}

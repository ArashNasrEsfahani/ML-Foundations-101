import React from 'react';
import { Link } from 'react-router-dom';
import { PaperCard } from '../sketch/PaperCard';
import { SketchIcon } from '../sketch/SketchIcon';
import { Illo } from '../../illustrations';
import { chapters } from '../../content';
import { MadeByCard } from './MadeBy';

const BOOK_URL = 'https://themlbook.com/';

export function AboutBook() {
  const sections = chapters.reduce((n, c) => n + c.sections.length, 0);

  return (
    <main className="anim-rise" style={{ maxWidth: 'var(--maxw)', margin: '0 auto', padding: '28px 20px 90px' }}>
      <div style={{ textAlign: 'center', marginBottom: 18 }}>
        <Illo
          name="hero-cover"
          size={110}
          fallback={<SketchIcon name="book" size={64} strokeWidth={1.1} />}
        />
        <h1 style={{ margin: '8px 0 2px' }}>About the book</h1>
        <p style={{ color: 'var(--graphite)', margin: 0, fontSize: '0.95rem' }}>
          where all of this comes from
        </p>
      </div>

      <PaperCard padding={24} seed={61} style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>The Hundred-Page Machine Learning Book</h3>
        <p style={{ margin: '0 0 12px' }}>
          by <strong>Andriy Burkov</strong> — a machine learning practitioner and PhD in artificial
          intelligence who set out to fit the genuinely useful parts of the field into about a
          hundred pages. It succeeds: the book moves from what a model actually is, through the
          fundamental algorithms, neural networks and the practical craft of making them work, to
          unsupervised learning and the corners of the field worth knowing exist.
        </p>
        <p style={{ margin: '0 0 12px' }}>
          What makes it unusual is the discipline of it. There is no padding, no chapter that exists
          to justify a page count, and no pretending that a topic is simple when it isn't. It is
          equally comfortable as a first map of the field and as a reference you return to when
          starting a project and asking "is this problem even machine-learnable?".
        </p>
        <p style={{ margin: 0 }}>
          Burkov publishes it on a <strong>“read first, buy later”</strong> basis: you can read it to
          decide whether it is worth your money, and buy it if it is. That is a generous way to
          publish a book, and it deserves to be repaid.
        </p>
      </PaperCard>

      <PaperCard padding={24} seed={67} style={{ marginBottom: 20 }}>
        <h3 style={{ marginTop: 0 }}>Please read the real thing</h3>
        <p>
          This course is a study companion, not a substitute. It covers the book's{' '}
          {chapters.length} chapters across {sections} interactive lessons, and it is good at the
          things a book cannot do — letting you drag a decision boundary, watch gradient descent
          overshoot, or train a small neural network and see the boundary bend. But every lesson
          here is a compression, written in our own words, of ideas the book explains properly.
        </p>
        <p>
          The book gives you the full argument: the derivations, the caveats, the practitioner's
          asides, and the author's judgement about what matters and what doesn't. If any of this
          course has been useful to you, the book is where to go next.
        </p>
        <a
          href={BOOK_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ textDecoration: 'none', display: 'inline-block', marginTop: 6 }}
        >
          <button className="primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <SketchIcon name="book" size={17} />
            Get the book at themlbook.com
            <SketchIcon name="arrow-right" size={15} />
          </button>
        </a>
        <p style={{ margin: '10px 0 0', fontSize: '0.82rem', color: 'var(--graphite)' }}>
          opens {BOOK_URL} in a new tab
        </p>
      </PaperCard>

      <MadeByCard />

      <PaperCard padding={20} seed={71} dashed>
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--graphite)' }}>
          <strong>Credit where it is due.</strong> All the ideas taught here are Andriy Burkov's;
          the wording, the exercises, the illustrations and the interactive widgets are this
          project's own. This course is an independent, unofficial companion and is not affiliated
          with or endorsed by the author or publisher.
        </p>
      </PaperCard>

      <div style={{ marginTop: 24 }}>
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
          <SketchIcon name="arrow-left" size={16} />
          Back to the map
        </Link>
      </div>
    </main>
  );
}

import React, { useCallback, useContext, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { getConcept, conceptVideo, type Concept } from '../../content/concepts';
import { resolveHref } from '../../content/links';
import { SketchIcon } from '../sketch/SketchIcon';
import { renderInline } from './inline';

/* ------------------------------------------------------------------ levels */

const LEVELS = [
  { id: 'simple', label: 'In plain words', blurb: 'no jargon, no symbols' },
  { id: 'technical', label: 'A bit deeper', blurb: 'what a practitioner means' },
  { id: 'math', label: 'The maths', blurb: 'the formal statement' },
] as const;

type LevelId = (typeof LEVELS)[number]['id'];

const LEVEL_KEY = 'ml101:concept-level';

/**
 * Which depth to open cards at, remembered across cards and across sessions.
 * Somebody who wants the maths wants the maths every time, and re-clicking the
 * third tab on every single term would be its own small punishment.
 */
function usePreferredLevel(): [LevelId, (l: LevelId) => void] {
  const [level, setLevel] = useState<LevelId>(() => {
    try {
      const v = localStorage.getItem(LEVEL_KEY);
      if (v === 'simple' || v === 'technical' || v === 'math') return v;
    } catch {
      /* storage can be denied; the default is fine */
    }
    return 'simple';
  });
  const set = useCallback((l: LevelId) => {
    setLevel(l);
    try {
      localStorage.setItem(LEVEL_KEY, l);
    } catch {
      /* ignore */
    }
  }, []);
  return [level, set];
}

/* ------------------------------------------------------- nested references */

/**
 * Set while rendering the inside of a card. A `[[concept]]` met in there must
 * not open a second floating card on top of the first — it swaps the card it is
 * already in, with a back arrow to return. One card on screen, always.
 */
const DrillContext = React.createContext<((id: string) => void) | null>(null);

/* -------------------------------------------------------------- the card */

function VideoLink({ concept }: { concept: Concept }) {
  const v = conceptVideo(concept);
  if (!v) return null;
  return (
    <a
      className="concept-video"
      href={v.url}
      target="_blank"
      rel="noreferrer"
      title={
        v.exact
          ? 'Opens the StatQuest video on YouTube'
          : 'Opens StatQuest’s channel, searched for this topic'
      }
    >
      <SketchIcon name="play" size={15} />
      <span>{v.exact ? 'Watch the StatQuest video' : 'Find it on StatQuest'}</span>
    </a>
  );
}

function ConceptCard({
  id,
  onDrill,
  onBack,
  canGoBack,
}: {
  id: string;
  onDrill: (id: string) => void;
  onBack: () => void;
  canGoBack: boolean;
}) {
  const [level, setLevel] = usePreferredLevel();
  const { pathname } = useLocation();
  const concept = getConcept(id);
  if (!concept) return null;

  const body = concept[level];
  const target = concept.teachesAt ? resolveHref(`sec:${concept.teachesAt}`) : null;
  // most terms are first marked in the very section that teaches them, where a
  // "read the section" button would reload the page under the reader's cursor
  const teaches = target?.href === pathname ? null : target;

  return (
    <DrillContext.Provider value={onDrill}>
      <div className="concept-card-head">
        {canGoBack && (
          <button className="concept-back" onClick={onBack} aria-label="Back to the previous term">
            <SketchIcon name="arrow-left" size={14} />
          </button>
        )}
        <strong className="concept-card-term">{concept.term}</strong>
      </div>

      <div className="concept-tabs" role="tablist" aria-label="Explanation depth">
        {LEVELS.map((l) => (
          <button
            key={l.id}
            role="tab"
            aria-selected={level === l.id}
            className={level === l.id ? 'concept-tab on' : 'concept-tab'}
            onClick={() => setLevel(l.id)}
            title={l.blurb}
          >
            {l.label}
          </button>
        ))}
      </div>

      <div className="concept-body">{renderInline(body)}</div>

      {concept.see && concept.see.length > 0 && (
        <div className="concept-see">
          <span className="concept-see-label">see also</span>
          {concept.see.map((s) => {
            const c = getConcept(s);
            if (!c) return null;
            return (
              <button key={s} className="concept-see-chip" onClick={() => onDrill(s)}>
                {c.term}
              </button>
            );
          })}
        </div>
      )}

      <div className="concept-card-foot">
        <VideoLink concept={concept} />
        {teaches?.ok && (
          <Link className="concept-goto" to={teaches.href} title={teaches.hint}>
            Read the section
            <SketchIcon name="arrow-right" size={13} />
          </Link>
        )}
      </div>
    </DrillContext.Provider>
  );
}

/* ----------------------------------------------------------- the popover */

const GAP = 8;
const MAXW = 372;

interface Box {
  left: number;
  top: number;
  width: number;
  /** the card is above the term rather than below it — flips the little tail */
  above: boolean;
}

function place(rect: DOMRect, cardH: number): Box {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const width = Math.min(MAXW, vw - 24);
  const below = vh - rect.bottom;
  const above = below < Math.min(cardH, 260) && rect.top > below;
  return {
    width,
    left: Math.max(12, Math.min(rect.left + rect.width / 2 - width / 2, vw - width - 12)),
    top: above ? Math.max(8, rect.top - GAP - cardH) : rect.bottom + GAP,
    above,
  };
}

/**
 * A term the reader can unfold. Hovering opens the card; clicking pins it open
 * (which is the only thing that works on a touch screen, and the only thing
 * that lets you reach the links inside).
 */
export function ConceptRef({ id, text }: { id: string; text?: string }) {
  const drill = useContext(DrillContext);
  const concept = getConcept(id);

  // inside a card: swap the card rather than stacking another one on top
  if (drill && concept) {
    return (
      <button className="concept-inline" onClick={() => drill(id)}>
        {text ?? concept.term}
      </button>
    );
  }

  // an id nobody has written yet: show the words, lose the decoration
  if (!concept) return <>{text ?? id}</>;

  return <ConceptTrigger concept={concept} text={text} />;
}

function ConceptTrigger({ concept, text }: { concept: Concept; text?: string }) {
  const [open, setOpen] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [stack, setStack] = useState<string[]>([concept.id]);
  const [box, setBox] = useState<Box | null>(null);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);
  const timer = useRef<number | undefined>(undefined);
  // Escape hands focus back to the term, and focus on the term is itself an
  // open gesture — without this the card shuts and reopens in the same frame
  const ignoreNextFocus = useRef(false);

  const cancelClose = () => window.clearTimeout(timer.current);
  const scheduleClose = () => {
    cancelClose();
    if (pinned) return;
    timer.current = window.setTimeout(() => setOpen(false), 220);
  };

  const shut = useCallback(() => {
    cancelClose();
    setOpen(false);
    setPinned(false);
    setStack([concept.id]);
  }, [concept.id]);

  // position on open, and keep it glued to the term while the page moves
  useLayoutEffect(() => {
    if (!open) {
      setBox(null);
      return;
    }
    const reposition = () => {
      const t = triggerRef.current;
      if (!t) return;
      setBox(place(t.getBoundingClientRect(), cardRef.current?.offsetHeight ?? 220));
    };
    reposition();
    // a second pass once the card has real height, so an above-placement
    // does not sit on top of the word it belongs to
    const raf = requestAnimationFrame(reposition);
    window.addEventListener('scroll', reposition, { capture: true, passive: true });
    window.addEventListener('resize', reposition);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', reposition, { capture: true } as EventListenerOptions);
      window.removeEventListener('resize', reposition);
    };
  }, [open, stack.length]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      // only claw focus back if it was inside the card; otherwise leave it alone
      const inside = !!cardRef.current?.contains(document.activeElement);
      ignoreNextFocus.current = true;
      shut();
      if (inside) triggerRef.current?.focus();
      window.setTimeout(() => {
        ignoreNextFocus.current = false;
      }, 0);
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (cardRef.current?.contains(t) || triggerRef.current?.contains(t)) return;
      shut();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onDown);
    };
  }, [open, shut]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const current = stack[stack.length - 1];

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={open ? 'concept-term on' : 'concept-term'}
        aria-expanded={open}
        aria-label={`${text ?? concept.term} — explain at three depths`}
        onMouseEnter={() => {
          cancelClose();
          setOpen(true);
        }}
        onMouseLeave={scheduleClose}
        onFocus={() => {
          if (!ignoreNextFocus.current) setOpen(true);
        }}
        onClick={() => {
          setOpen(true);
          setPinned((p) => !p);
        }}
      >
        {text ?? concept.term}
      </button>

      {open &&
        createPortal(
          <div
            ref={cardRef}
            className={`concept-card anim-rise${box?.above ? ' above' : ''}`}
            role="dialog"
            aria-label={`${concept.term} — explanation`}
            style={{
              position: 'fixed',
              left: box?.left ?? -9999,
              top: box?.top ?? -9999,
              width: box?.width ?? MAXW,
              visibility: box ? 'visible' : 'hidden',
            }}
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
          >
            <ConceptCard
              id={current}
              canGoBack={stack.length > 1}
              onBack={() => setStack((s) => s.slice(0, -1))}
              onDrill={(next) => {
                setPinned(true);
                setStack((s) => (s[s.length - 1] === next ? s : [...s, next]));
              }}
            />
            {pinned && (
              <button className="concept-close" onClick={shut} aria-label="Close">
                <SketchIcon name="cross" size={13} />
              </button>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}

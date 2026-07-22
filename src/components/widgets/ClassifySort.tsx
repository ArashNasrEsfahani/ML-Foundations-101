import React, { useMemo, useState } from 'react';
import { WidgetFrame, type GuideEntry } from './WidgetFrame';
import { useChallenge } from './ChallengeChip';
import type { Challenge } from '../../content/schema';
import { SketchIcon } from '../sketch/SketchIcon';
import { mulberry32, shuffled, hashString } from '../../lib/rng';

export interface SortCard {
  text: string;
  bucket: number;
}

/**
 * The two-tap mechanic is identical in every ClassifySort, so it explains
 * itself here; a caller only has to describe what its own piles mean.
 */
const MECHANIC_GUIDE: GuideEntry[] = [
  {
    control: 'the cards on top',
    what: 'Tap one to pick it up — it darkens to show it is the card being placed. Tapping it again puts it back down, and cards you have already sorted leave this row.',
  },
  {
    control: 'the dashed piles',
    what: 'Tap the pile a picked-up card belongs to. They stay greyed out until a card is in hand, because a pile is a destination and not a thing to read.',
  },
  {
    control: 'the sorted cards',
    what: 'Every placement is scored the moment you make it: a tick means the card landed in the right pile, a cross means it did not. Wrong cards stay where you put them so you can see the mistake you actually made.',
  },
];

/**
 * Generic tap-to-sort game: pick a card, tap the bucket it belongs to.
 * Green/red feedback per placement (this is answer feedback, so the colors are allowed).
 */
export function ClassifySort({
  title,
  intro,
  guide,
  buckets,
  cards,
  challenge,
}: {
  title: string;
  /** one or two sentences on what is being sorted and why */
  intro?: React.ReactNode;
  /** rows describing this game's own piles, appended after the shared mechanic */
  guide?: GuideEntry[];
  buckets: string[];
  cards: SortCard[];
  challenge?: Challenge;
}) {
  const { done: challengeDone, complete } = useChallenge(challenge);
  const order = useMemo(
    () => shuffled(cards.map((_, i) => i), mulberry32(hashString(title))),
    [cards, title],
  );
  const [placed, setPlaced] = useState<Record<number, { bucket: number; ok: boolean }>>({});
  const [active, setActive] = useState<number | null>(null);
  const [mistakes, setMistakes] = useState(0);

  const remaining = order.filter((i) => placed[i] === undefined);
  const doneAll = remaining.length === 0;
  const allRight = doneAll && Object.values(placed).every((p) => p.ok);

  const place = (bucket: number) => {
    if (active === null) return;
    const ok = cards[active].bucket === bucket;
    setPlaced((p) => ({ ...p, [active]: { bucket, ok } }));
    if (!ok) setMistakes((m) => m + 1);
    setActive(null);
    // finished?
    const newPlaced = { ...placed, [active]: { bucket, ok } };
    if (Object.keys(newPlaced).length === cards.length) {
      const perfect = Object.values(newPlaced).every((p) => p.ok);
      if (perfect) complete();
    }
  };

  const reset = () => {
    setPlaced({});
    setActive(null);
    setMistakes(0);
  };

  return (
    <WidgetFrame
      title={title}
      intro={intro}
      guide={[...MECHANIC_GUIDE, ...(guide ?? [])]}
      onReset={reset}
      challenge={challenge}
      challengeDone={challengeDone}
    >
      {/* card being sorted */}
      <div style={{ minHeight: 64, marginBottom: 12 }}>
        {remaining.length > 0 ? (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {remaining.map((i) => (
              <button
                key={i}
                onClick={() => setActive(active === i ? null : i)}
                style={{
                  fontSize: '0.92rem',
                  background: active === i ? 'var(--paper-2)' : '#fffdf8',
                  borderColor: active === i ? 'var(--ink)' : 'var(--line)',
                  borderWidth: 1.5,
                  maxWidth: 340,
                  textAlign: 'left',
                }}
              >
                {cards[i].text}
              </button>
            ))}
          </div>
        ) : (
          <p
            className={allRight ? 'anim-pop' : 'anim-rise'}
            style={{
              margin: 0,
              color: allRight ? 'var(--ok)' : 'var(--ink)',
              fontWeight: allRight ? 700 : 400,
            }}
          >
            {allRight
              ? 'All sorted correctly!'
              : `Sorted, with ${mistakes} misplacement${mistakes === 1 ? '' : 's'} — check the red ones below, then reset to try for a clean run.`}
          </p>
        )}
        {active !== null && (
          <p style={{ margin: '8px 0 0', fontSize: '0.85rem', color: 'var(--graphite)' }}>
            now tap the pile where it belongs ↓
          </p>
        )}
      </div>

      {/* buckets */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(auto-fit, minmax(150px, 1fr))`,
          gap: 10,
        }}
      >
        {buckets.map((label, b) => (
          <div key={b}>
            <button
              onClick={() => place(b)}
              disabled={active === null}
              style={{
                width: '100%',
                borderStyle: 'dashed',
                borderColor: active !== null ? 'var(--ink)' : 'var(--line)',
                fontWeight: 700,
                fontSize: '0.9rem',
                padding: '10px 8px',
              }}
            >
              {label}
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 6 }}>
              {order
                .filter((i) => placed[i]?.bucket === b)
                .map((i) => (
                  // two layers: the wrapper shakes a wrong placement, the card itself
                  // carries the glow (both are `animation` shorthands, so they can't
                  // sit on the same element)
                  <div key={i} className={placed[i].ok ? undefined : 'anim-shake'}>
                    <div
                      className={placed[i].ok ? 'anim-glow-ok' : 'anim-glow-bad'}
                      style={{
                        fontSize: '0.8rem',
                        lineHeight: 1.35,
                        padding: '5px 8px',
                        borderRadius: 4,
                        border: `1.3px solid ${placed[i].ok ? 'var(--ok)' : 'var(--bad)'}`,
                        background: placed[i].ok ? 'var(--ok-bg)' : 'var(--bad-bg)',
                        display: 'flex',
                        gap: 6,
                        alignItems: 'flex-start',
                      }}
                    >
                      <SketchIcon
                        name={placed[i].ok ? 'check' : 'cross'}
                        size={12}
                        strokeWidth={2.4}
                        style={{ marginTop: 2, color: placed[i].ok ? 'var(--ok)' : 'var(--bad)' }}
                      />
                      {cards[i].text}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>
    </WidgetFrame>
  );
}

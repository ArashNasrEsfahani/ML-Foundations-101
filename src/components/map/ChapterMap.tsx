import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import rough from 'roughjs';
import { chapters } from '../../content';
import { useProgress } from '../../state/progressStore';
import {
  isChapterUnlocked,
  isSectionUnlocked,
  isBossUnlocked,
  isFinalUnlocked,
  chapterProgress,
  isFreeMode,
} from '../../state/unlock';
import { SketchIcon } from '../sketch/SketchIcon';
import { PaperCard } from '../sketch/PaperCard';
import { Illo } from '../../illustrations';

const NODE = 74;

function ChapterEmblem({ chapterId, locked }: { chapterId: string; locked: boolean }) {
  return (
    <div
      style={{
        opacity: locked ? 0.35 : 1,
        filter: locked ? 'grayscale(1)' : undefined,
        transition: 'opacity 0.6s ease, filter 0.6s ease',
      }}
    >
      <Illo
        name={`${chapterId}-emblem`}
        size={46}
        fallback={<SketchIcon name={locked ? 'lock' : 'book'} size={34} strokeWidth={1.3} />}
      />
    </div>
  );
}

export function ChapterMap() {
  const { save, dispatch } = useProgress();
  const navigate = useNavigate();

  const freeMode = isFreeMode(save);

  const unlockedIds = useMemo(
    () => chapters.filter((c) => isChapterUnlocked(save, chapters, c.id)).map((c) => c.id),
    [save],
  );

  // chapters unlocked since the player last looked at the map get a little ceremony
  const [celebrating, setCelebrating] = useState<string[]>(() => {
    const seen = new Set(save.seenUnlocked ?? []);
    const fresh = unlockedIds.filter((id) => !seen.has(id));
    // a long-dormant save could have many at once — don't fire a fireworks show
    return fresh.length > 0 && fresh.length <= 2 ? fresh : [];
  });

  useEffect(() => {
    if (unlockedIds.length === 0) return;
    // free roam opens everything at once; recording that as "seen" would rob the
    // unlock ceremony from anyone who later switches back to the journey
    if (freeMode) return;
    const seen = new Set(save.seenUnlocked ?? []);
    const unseen = unlockedIds.filter((id) => !seen.has(id));
    if (unseen.length === 0) return;
    const t = setTimeout(() => {
      dispatch({ type: 'markUnlockSeen', chapterIds: unseen });
      setCelebrating([]);
    }, 1600);
    return () => clearTimeout(t);
  }, [unlockedIds, save.seenUnlocked, dispatch, freeMode]);

  const [openId, setOpenId] = useState<string | null>(() => {
    let last: string | null = null;
    for (const c of chapters) if (isChapterUnlocked(save, chapters, c.id)) last = c.id;
    return last;
  });

  // winding pencil path down the middle
  const pathD = useMemo(() => {
    const gen = rough.generator();
    const h = chapters.length * 150 + 120;
    const d = gen.curve(
      Array.from({ length: chapters.length + 2 }, (_, i) => [
        i % 2 === 0 ? 40 : 60,
        i * 140 + 30,
      ] as [number, number]),
      { roughness: 1.6, seed: 11, strokeWidth: 1.2 },
    );
    return { paths: gen.toPaths(d), h };
  }, []);

  const finalOpen = isFinalUnlocked(save, chapters);

  return (
    <main style={{ maxWidth: 760, margin: '0 auto', padding: '28px 18px 100px' }}>
      <div className="anim-rise" style={{ textAlign: 'center', marginBottom: 26 }}>
        <Illo
          name="hero-cover"
          size={130}
          fallback={<SketchIcon name="book" size={72} strokeWidth={1.1} />}
        />
        <h1 style={{ margin: '6px 0 2px' }}>The Foundations of Machine Learning</h1>
        <p style={{ color: 'var(--graphite)', margin: 0, fontSize: '0.95rem' }}>
          one pencil stroke at a time
        </p>
      </div>

      {/* free roam is easy to forget you turned on, so say so plainly */}
      {freeMode && (
        <div
          className="anim-rise"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            justifyContent: 'center',
            marginBottom: 20,
            fontSize: '0.88rem',
            color: 'var(--graphite)',
          }}
        >
          <SketchIcon name="flag" size={16} />
          <span>
            <strong style={{ color: 'var(--ink)' }}>Free roam</strong> — everything is open.
          </span>
          <button
            className="ghost"
            style={{ padding: '2px 12px', fontSize: '0.85rem' }}
            onClick={() => dispatch({ type: 'setMode', mode: 'journey' })}
          >
            Switch to the full journey
          </button>
        </div>
      )}

      {/* placement invitation — only while the course is still untouched */}
      {!freeMode && !save.placement?.done && save.xp === 0 && (
        <div className="anim-rise" style={{ marginBottom: 22, animationDelay: '90ms' }}>
          <PaperCard padding={18} seed={77}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
              <SketchIcon name="flag" size={30} strokeWidth={1.3} />
              <div style={{ flex: 1, minWidth: 220 }}>
                <div style={{ fontFamily: 'var(--font-hand)', fontSize: '1.35rem', fontWeight: 700 }}>
                  Not starting from zero?
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--graphite)' }}>
                  Answer about six questions and begin at the right chapter.
                </div>
              </div>
              <button className="primary" onClick={() => navigate('/placement')}>
                Find my level
              </button>
            </div>
          </PaperCard>
        </div>
      )}

      <div style={{ position: 'relative' }}>
        <svg
          aria-hidden
          width="100"
          height={pathD.h}
          style={{ position: 'absolute', left: 8, top: 0, pointerEvents: 'none', opacity: 0.4 }}
        >
          {pathD.paths.map((p, i) => (
            <path key={i} d={p.d} stroke="var(--graphite)" strokeWidth={1.2} fill="none" strokeDasharray="7 5" />
          ))}
        </svg>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 26, paddingLeft: 96 }}>
          {chapters.map((chapter, ci) => {
            const unlocked = isChapterUnlocked(save, chapters, chapter.id);
            const bossOpen = isBossUnlocked(save, chapters, chapter.id);
            const passed = !!save.bosses[chapter.id]?.passed;
            const testedOut = (save.testedOut ?? []).includes(chapter.id);
            const prog = chapterProgress(save, chapter);
            const open = openId === chapter.id;
            const justUnlocked = celebrating.includes(chapter.id);

            return (
              <section
                key={chapter.id}
                className="anim-rise"
                style={{ animationDelay: `${Math.min(ci, 8) * 55}ms` }}
              >
                <button
                  onClick={() => unlocked && setOpenId(open ? null : chapter.id)}
                  disabled={!unlocked}
                  aria-expanded={open}
                  className={justUnlocked ? 'anim-unlock-card' : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    width: '100%',
                    textAlign: 'left',
                    background: '#fffdf8',
                    border: `1.5px ${unlocked ? 'solid var(--ink)' : 'dashed var(--graphite)'}`,
                    borderRadius: 14,
                    padding: '12px 18px',
                    opacity: unlocked ? 1 : 0.55,
                    boxShadow: unlocked ? 'var(--shadow)' : 'none',
                    transition: 'opacity 0.5s ease, box-shadow 0.4s ease, border-color 0.5s ease',
                  }}
                >
                  {/* node circle */}
                  <div
                    style={{
                      width: NODE,
                      height: NODE,
                      flexShrink: 0,
                      borderRadius: '50%',
                      border: `2px ${unlocked ? 'solid var(--ink)' : 'dashed var(--graphite)'}`,
                      background: passed ? 'var(--paper-2)' : '#fffdf8',
                      display: 'grid',
                      placeItems: 'center',
                      position: 'relative',
                      transition: 'border-color 0.5s ease, background 0.4s ease',
                    }}
                  >
                    <ChapterEmblem chapterId={chapter.id} locked={!unlocked} />

                    {/* burst when this chapter just opened up */}
                    {justUnlocked && (
                      <>
                        <span
                          className="anim-ring-burst"
                          style={{
                            position: 'absolute',
                            inset: -6,
                            borderRadius: '50%',
                            border: '2px solid var(--ink)',
                            pointerEvents: 'none',
                          }}
                        />
                        <span
                          className="anim-unlock-lock"
                          style={{
                            position: 'absolute',
                            display: 'grid',
                            placeItems: 'center',
                            inset: 0,
                            color: 'var(--graphite)',
                          }}
                        >
                          <SketchIcon name="lock" size={26} />
                        </span>
                      </>
                    )}

                    {passed && (
                      <span
                        className="anim-pop"
                        style={{
                          position: 'absolute',
                          right: -4,
                          bottom: -4,
                          background: 'var(--ink)',
                          color: 'var(--paper)',
                          borderRadius: '50%',
                          width: 24,
                          height: 24,
                          display: 'grid',
                          placeItems: 'center',
                        }}
                      >
                        <SketchIcon name="check" size={13} strokeWidth={2.6} />
                      </span>
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '0.78rem', color: 'var(--graphite)' }}>
                      Chapter {chapter.number}
                    </div>
                    <div style={{ fontFamily: 'var(--font-hand)', fontSize: '1.5rem', fontWeight: 700 }}>
                      {chapter.title}
                    </div>
                    <div style={{ fontSize: '0.86rem', color: 'var(--graphite)' }}>{chapter.subtitle}</div>
                    {/* progress underline */}
                    <svg width="160" height="8" aria-hidden style={{ marginTop: 4 }}>
                      <path d="M2 5 q 40 -3 78 0 t 78 0" stroke="var(--line)" strokeWidth="2" fill="none" strokeLinecap="round" />
                      <path
                        className="xp-underline"
                        d="M2 5 q 40 -3 78 0 t 78 0"
                        stroke="var(--ink)"
                        strokeWidth="2.5"
                        fill="none"
                        strokeLinecap="round"
                        pathLength={1}
                        strokeDasharray={`${Math.max(0.01, prog)} 1`}
                      />
                    </svg>
                  </div>
                  {!unlocked && <SketchIcon name="lock" size={20} />}
                </button>

                {open && unlocked && (
                  <div
                    className="anim-fade"
                    style={{
                      margin: '10px 0 4px 30px',
                      paddingLeft: 26,
                      borderLeft: '1.5px dashed var(--line)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    {chapter.sections.map((s, si) => {
                      const sUnlocked = isSectionUnlocked(save, chapters, chapter.id, s.id);
                      const sDone = !!save.sections[s.id]?.done;
                      return (
                        <Link
                          key={s.id}
                          to={sUnlocked ? `/ch/${chapter.id}/${s.id}` : '#'}
                          onClick={(e) => !sUnlocked && e.preventDefault()}
                          className="anim-slide-left"
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            textDecoration: 'none',
                            color: sUnlocked ? 'var(--ink)' : 'var(--graphite)',
                            opacity: sUnlocked ? 1 : 0.5,
                            padding: '4px 0',
                            animationDelay: `${si * 40}ms`,
                          }}
                        >
                          <span
                            style={{
                              width: 14,
                              height: 14,
                              borderRadius: '50%',
                              flexShrink: 0,
                              border: `1.5px ${sDone ? 'solid var(--ink)' : sUnlocked ? 'solid var(--graphite)' : 'dashed var(--graphite)'}`,
                              background: sDone ? 'var(--ink)' : 'transparent',
                              transition: 'background 0.4s ease, border-color 0.4s ease',
                            }}
                          />
                          <span style={{ fontSize: '0.95rem' }}>{s.title}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--graphite)' }}>
                            ~{s.minutes} min
                          </span>
                        </Link>
                      );
                    })}
                    {chapter.bossPool.length > 0 && (
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                        <button
                          className={bossOpen && !passed ? 'primary anim-pop' : 'ghost'}
                          disabled={!bossOpen}
                          onClick={() => navigate(`/boss/${chapter.id}`)}
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                        >
                          <SketchIcon name={passed ? 'trophy' : 'star'} size={16} />
                          {passed
                            ? `Boss defeated (best ${save.bosses[chapter.id]?.best}/12) — replay`
                            : bossOpen
                              ? 'Take the boss exam'
                              : 'Boss exam — finish all sections first'}
                        </button>
                        {/* skip-ahead: only meaningful while the chapter is still open work */}
                        {!passed && (
                          <button
                            className="ghost"
                            onClick={() => navigate(`/testout/${chapter.id}`)}
                            title="Prove you already know this chapter"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}
                          >
                            <SketchIcon name="arrow-right" size={16} />
                            Already know it? Test out
                          </button>
                        )}
                      </div>
                    )}
                    {testedOut && (
                      <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--graphite)' }}>
                        cleared by examination — the lessons are still here whenever you want them
                      </p>
                    )}
                  </div>
                )}
              </section>
            );
          })}

          {/* final exam node */}
          <section className="anim-rise" style={{ animationDelay: '480ms' }}>
            <button
              onClick={() => finalOpen && navigate('/final')}
              disabled={!finalOpen}
              className={finalOpen && !save.finalExam?.passed ? 'anim-pulse' : undefined}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                width: '100%',
                textAlign: 'left',
                background: '#fffdf8',
                border: `2px ${finalOpen ? 'solid var(--ink)' : 'dashed var(--graphite)'}`,
                borderRadius: 14,
                padding: '14px 18px',
                opacity: finalOpen ? 1 : 0.55,
              }}
            >
              <SketchIcon name="flag" size={34} strokeWidth={1.3} />
              <div>
                <div style={{ fontFamily: 'var(--font-hand)', fontSize: '1.5rem', fontWeight: 700 }}>
                  The Final Exam
                </div>
                <div style={{ fontSize: '0.86rem', color: 'var(--graphite)' }}>
                  {save.finalExam?.passed
                    ? 'Passed! Claim your certificate.'
                    : finalOpen
                      ? '20 questions across the whole book.'
                      : 'Defeat every chapter boss to unlock.'}
                </div>
              </div>
              <span style={{ flex: 1 }} />
              {save.finalExam?.passed && (
                <Link to="/certificate" onClick={(e) => e.stopPropagation()} style={{ display: 'inline-flex' }}>
                  <SketchIcon name="trophy" size={24} />
                </Link>
              )}
            </button>
          </section>
        </div>
      </div>

      {/* the source this whole course is built on */}
      <div className="anim-fade" style={{ marginTop: 34 }}>
        <PaperCard padding={20} seed={83} dashed>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <SketchIcon name="book" size={30} strokeWidth={1.3} />
            <div style={{ flex: 1, minWidth: 230 }}>
              <div style={{ fontFamily: 'var(--font-hand)', fontSize: '1.3rem', fontWeight: 700 }}>
                Built on a very good book
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--graphite)' }}>
                Everything here comes from <em>The Hundred-Page Machine Learning Book</em> by Andriy
                Burkov. This course is a companion — the book is the real thing.
              </div>
            </div>
            <Link to="/about" style={{ textDecoration: 'none' }}>
              <button className="ghost">Read about it</button>
            </Link>
          </div>
        </PaperCard>
      </div>
    </main>
  );
}

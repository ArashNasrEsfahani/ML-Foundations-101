import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import type { SaveV1 } from './migrations';
import { load, saveDebounced, importSave, resetSave, flush, newer } from './storage';
import { readDisk } from './diskSync';
import {
  awardSection,
  awardQuestion,
  awardQuizPerfect,
  awardChallenge,
  recordBoss,
  recordFinal,
  recordTestOut,
} from './xp';
import { BADGES, newlyEarned } from './badges';
import { levelForXp } from './levels';
import { chapters } from '../content';

export interface Toast {
  id: number;
  kind: 'xp' | 'badge';
  text: string;
}

export interface Celebration {
  id: number;
  kind: 'level' | 'badge';
  title: string;
  subtitle: string;
  /** badge id, for the medallion art */
  badgeId?: string;
  level?: number;
}

interface StoreState {
  save: SaveV1;
  toasts: Toast[];
  celebrations: Celebration[];
  pencilStreak: number;
}

type Action =
  | { type: 'section'; sectionId: string; perfect: boolean }
  | { type: 'question'; questionId: string; firstTry: boolean; correct: boolean }
  | { type: 'quizPerfect'; quizId: string }
  | { type: 'challenge'; challengeId: string; xp: number; label: string }
  | { type: 'boss'; chapterId: string; score: number; passed: boolean; total?: number }
  | { type: 'final'; score: number; passed: boolean }
  | { type: 'testOut'; chapterId: string }
  | { type: 'placement'; throughChapter: number }
  | { type: 'hint'; hintId: string }
  | { type: 'setName'; name: string }
  | { type: 'setReducedMotion'; value: boolean }
  | { type: 'markUnlockSeen'; chapterIds: string[] }
  | { type: 'import'; save: SaveV1 }
  | { type: 'reset' }
  | { type: 'dismissToast'; id: number }
  | { type: 'dismissCelebration'; id: number };

let seq = 1;

function withToast(state: StoreState, kind: Toast['kind'], text: string): StoreState {
  return { ...state, toasts: [...state.toasts, { id: seq++, kind, text }] };
}

function withCelebration(state: StoreState, c: Omit<Celebration, 'id'>): StoreState {
  return { ...state, celebrations: [...state.celebrations, { ...c, id: seq++ }] };
}

function afterAward(state: StoreState, next: SaveV1, xp: number, label?: string): StoreState {
  const beforeLevel = levelForXp(state.save.xp);
  let s: StoreState = { ...state, save: next };

  if (xp > 0) s = withToast(s, 'xp', `+${xp} XP${label ? ` — ${label}` : ''}`);

  // level up is worth stopping the world for
  const afterLevel = levelForXp(next.xp);
  if (afterLevel > beforeLevel) {
    s = withCelebration(s, {
      kind: 'level',
      title: `Level ${afterLevel}`,
      subtitle: 'keep going — the pencil is warming up',
      level: afterLevel,
    });
  }

  // badge sweep
  const earned = newlyEarned(next, chapters);
  if (earned.length > 0) {
    const badges = { ...s.save.badges };
    for (const id of earned) badges[id] = { at: Date.now() };
    s = { ...s, save: { ...s.save, badges } };
    for (const id of earned) {
      const def = BADGES.find((b) => b.id === id);
      if (def) {
        s = withToast(s, 'badge', `Badge earned: ${def.name}`);
        s = withCelebration(s, {
          kind: 'badge',
          title: def.name,
          subtitle: 'badge earned',
          badgeId: def.id,
        });
      }
    }
  }
  return s;
}

function grantBadge(state: StoreState, id: string): StoreState {
  if (state.save.badges[id]) return state;
  const def = BADGES.find((b) => b.id === id);
  const save = { ...state.save, badges: { ...state.save.badges, [id]: { at: Date.now() } } };
  let s = { ...state, save };
  if (def) {
    s = withToast(s, 'badge', `Badge earned: ${def.name}`);
    s = withCelebration(s, { kind: 'badge', title: def.name, subtitle: 'badge earned', badgeId: def.id });
  }
  return s;
}

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'section': {
      const [next, xp] = awardSection(state.save, action.sectionId, action.perfect);
      return afterAward(state, next, xp, 'Section complete');
    }
    case 'question': {
      const streak = action.correct && action.firstTry ? state.pencilStreak + 1 : 0;
      let s: StoreState = { ...state, pencilStreak: streak };
      if (action.correct) {
        const [next, xp] = awardQuestion(s.save, action.questionId, action.firstTry);
        s = afterAward(s, next, xp);
      }
      if (streak >= 10) s = grantBadge(s, 'sharp-pencil');
      return s;
    }
    case 'quizPerfect': {
      const [next, xp] = awardQuizPerfect(state.save, action.quizId);
      return afterAward(state, next, xp, 'Perfect quiz');
    }
    case 'challenge': {
      const [next, xp] = awardChallenge(state.save, action.challengeId, action.xp);
      return afterAward(state, next, xp, action.label);
    }
    case 'boss': {
      const [next, xp] = recordBoss(state.save, action.chapterId, action.score, action.passed, action.total);
      return afterAward(state, next, xp, action.passed ? 'Boss defeated' : undefined);
    }
    case 'final': {
      const [next, xp] = recordFinal(state.save, action.score, action.passed);
      return afterAward(state, next, xp, action.passed ? 'Final exam passed' : undefined);
    }
    case 'testOut': {
      const chapter = chapters.find((c) => c.id === action.chapterId);
      if (!chapter) return state;
      const [next, xp] = recordTestOut(state.save, chapter);
      return afterAward(state, next, xp, `Tested out of ${chapter.title}`);
    }
    case 'placement': {
      // clear every chapter up to and including the one they demonstrated
      let save = state.save;
      let total = 0;
      for (const c of chapters.slice(0, Math.max(0, action.throughChapter))) {
        const [next, xp] = recordTestOut(save, c);
        save = next;
        total += xp;
      }
      save = {
        ...save,
        placement: { done: true, throughChapter: action.throughChapter, at: Date.now() },
      };
      return afterAward(state, save, total, total > 0 ? 'Placement complete' : undefined);
    }
    case 'hint': {
      if (state.save.hintsOpened.includes(action.hintId)) return state;
      const next = { ...state.save, hintsOpened: [...state.save.hintsOpened, action.hintId] };
      return afterAward(state, next, 0);
    }
    case 'setName':
      return afterAward(state, { ...state.save, name: action.name }, 0);
    case 'setReducedMotion':
      return { ...state, save: { ...state.save, reducedMotion: action.value } };
    case 'markUnlockSeen': {
      const seen = new Set(state.save.seenUnlocked ?? []);
      let changed = false;
      for (const id of action.chapterIds) {
        if (!seen.has(id)) {
          seen.add(id);
          changed = true;
        }
      }
      if (!changed) return state;
      return { ...state, save: { ...state.save, seenUnlocked: [...seen] } };
    }
    case 'import':
      return { save: action.save, toasts: [], celebrations: [], pencilStreak: 0 };
    case 'reset':
      return { save: resetSave(), toasts: [], celebrations: [], pencilStreak: 0 };
    case 'dismissToast':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };
    case 'dismissCelebration':
      return { ...state, celebrations: state.celebrations.filter((c) => c.id !== action.id) };
    default:
      return state;
  }
}

interface Store {
  save: SaveV1;
  toasts: Toast[];
  celebrations: Celebration[];
  dispatch: React.Dispatch<Action>;
  importFromJson: (json: string) => boolean;
}

const Ctx = createContext<Store | null>(null);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    save: load(),
    toasts: [],
    celebrations: [],
    pencilStreak: 0,
  }));

  // Every change is persisted immediately (see storage.saveNow).
  useEffect(() => {
    saveDebounced(state.save);
  }, [state.save]);

  // In local dev, reconcile with the on-disk mirror once at boot: it survives
  // port changes and cleared browser storage, which localStorage does not.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const disk = await readDisk();
      if (cancelled || !disk) return;
      const best = newer(disk, state.save);
      if (best && best !== state.save && (best.updatedAt ?? 0) > (state.save.updatedAt ?? 0)) {
        dispatch({ type: 'import', save: best });
      }
    })();
    return () => {
      cancelled = true;
    };
    // boot-only on purpose
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // never lose the last few actions when a tab closes or the phone sleeps
  useEffect(() => {
    const onHide = () => flush();
    window.addEventListener('pagehide', onHide);
    window.addEventListener('beforeunload', onHide);
    document.addEventListener('visibilitychange', onHide);
    return () => {
      window.removeEventListener('pagehide', onHide);
      window.removeEventListener('beforeunload', onHide);
      document.removeEventListener('visibilitychange', onHide);
    };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('reduced-motion', !!state.save.reducedMotion);
  }, [state.save.reducedMotion]);

  const store = useMemo<Store>(
    () => ({
      save: state.save,
      toasts: state.toasts,
      celebrations: state.celebrations,
      dispatch,
      importFromJson: (json: string) => {
        const imported = importSave(json);
        if (!imported) return false;
        dispatch({ type: 'import', save: imported });
        return true;
      },
    }),
    [state],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useProgress(): Store {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useProgress outside ProgressProvider');
  return ctx;
}

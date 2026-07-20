export const CURRENT_VERSION = 1;

export interface SaveV1 {
  v: 1;
  xp: number;
  sections: Record<string, { done: true; at: number; perfect: boolean }>;
  questions: Record<string, { firstTry: boolean }>;
  challenges: Record<string, { at: number }>;
  bosses: Record<string, { attempts: number; best: number; passed: boolean }>;
  finalExam?: { passed: boolean; best: number };
  badges: Record<string, { at: number }>;
  hintsOpened: string[];
  streak: { last: string; days: number };
  name?: string;
  reducedMotion?: boolean;
  /** chapters whose unlock animation has already played */
  seenUnlocked?: string[];
  /**
   * 'journey' (default) gates chapters behind the ones before them.
   * 'free' opens everything at once. Switching is reversible and never
   * touches earned progress — it only changes what is reachable.
   */
  mode?: 'journey' | 'free';
  /** chapters cleared by a test-out / placement quiz rather than by reading them */
  testedOut?: string[];
  /** placement check: whether it was taken (or explicitly declined) */
  placement?: { done: boolean; throughChapter: number; at: number };
  /** wall-clock of the last write; used to reconcile localStorage vs disk mirror */
  updatedAt?: number;
}

type Migration = (old: Record<string, unknown>) => Record<string, unknown>;

/** migrations[n] upgrades a save from version n to n+1 */
const migrations: Record<number, Migration> = {
  // future: 1: (old) => ({ ...old, v: 2, newField: ... })
};

export function migrate(raw: { v: number } & Record<string, unknown>): SaveV1 {
  let cur: Record<string, unknown> = raw;
  let v = raw.v;
  while (v < CURRENT_VERSION) {
    const step = migrations[v];
    if (!step) throw new Error(`no migration from v${v}`);
    cur = step(cur);
    v = (cur as { v: number }).v;
  }
  return cur as unknown as SaveV1;
}

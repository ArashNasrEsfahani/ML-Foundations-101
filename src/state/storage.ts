import { migrate, CURRENT_VERSION, type SaveV1 } from './migrations';
import { writeDisk, flushDisk } from './diskSync';

const KEY = 'ml101.save';
const BAK = 'ml101.save.bak';
/** rolling copy of the last known-good save, used to self-heal a wiped main key */
const MIRROR = 'ml101.save.mirror';

export function freshSave(): SaveV1 {
  return {
    v: CURRENT_VERSION,
    xp: 0,
    sections: {},
    questions: {},
    challenges: {},
    bosses: {},
    badges: {},
    hintsOpened: [],
    streak: { last: '', days: 0 },
    seenUnlocked: [],
    updatedAt: 0,
  };
}

function parse(raw: string | null): SaveV1 | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== 'object' || parsed === null || typeof parsed.v !== 'number') return null;
    return migrate(parsed);
  } catch {
    return null;
  }
}

function read(key: string): SaveV1 | null {
  try {
    return parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

/** the save that represents more progress wins — never silently downgrade a player */
export function newer(a: SaveV1 | null, b: SaveV1 | null): SaveV1 | null {
  if (!a) return b;
  if (!b) return a;
  const ta = a.updatedAt ?? 0;
  const tb = b.updatedAt ?? 0;
  if (ta !== tb) return ta > tb ? a : b;
  return (a.xp ?? 0) >= (b.xp ?? 0) ? a : b;
}

export function load(): SaveV1 {
  const main = read(KEY);
  const mirror = read(MIRROR);

  if (!main && !mirror) {
    // keep a corrupt payload around for forensics rather than throwing it away
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) localStorage.setItem(BAK, raw);
    } catch {
      /* ignore */
    }
    return freshSave();
  }

  const best = newer(main, mirror)!;
  // self-heal: if the main key was wiped or lagged behind, rewrite it
  if (best !== main) saveNow(best);
  return best;
}

export function saveNow(state: SaveV1): void {
  const stamped: SaveV1 = { ...state, updatedAt: Date.now() };
  const json = JSON.stringify(stamped);
  try {
    localStorage.setItem(KEY, json);
    localStorage.setItem(MIRROR, json);
  } catch {
    /* storage full or blocked — non-fatal */
  }
  writeDisk(stamped);
}

/**
 * Every state change is written synchronously — a save is a few KB, and losing
 * progress because a tab closed inside a debounce window is not acceptable.
 */
export function saveDebounced(state: SaveV1): void {
  saveNow(state);
}

/** called on pagehide/visibilitychange so the disk mirror never lags behind */
export function flush(): void {
  flushDisk();
}

export function exportSave(): string {
  try {
    return localStorage.getItem(KEY) ?? JSON.stringify(freshSave());
  } catch {
    return JSON.stringify(freshSave());
  }
}

export function importSave(json: string): SaveV1 | null {
  const parsed = parse(json);
  if (!parsed) return null;
  saveNow(parsed);
  return parsed;
}

export function resetSave(): SaveV1 {
  try {
    localStorage.removeItem(KEY);
    localStorage.removeItem(MIRROR);
  } catch {
    /* ignore */
  }
  const fresh = freshSave();
  writeDisk(fresh, true);
  return fresh;
}

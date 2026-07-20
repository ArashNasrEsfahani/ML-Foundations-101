import { describe, it, expect, beforeEach, vi } from 'vitest';

// minimal localStorage stub for the node test environment
const store = new Map<string, string>();
(globalThis as Record<string, unknown>).localStorage = {
  getItem: (k: string) => (store.has(k) ? store.get(k)! : null),
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
};

import {
  load,
  saveNow,
  freshSave,
  importSave,
  resetSave,
  exportSave,
  newer,
} from '../src/state/storage';

const KEY = 'ml101.save';
const MIRROR = 'ml101.save.mirror';

describe('storage', () => {
  beforeEach(() => store.clear());

  it('returns a fresh save when nothing stored', () => {
    const s = load();
    expect(s.v).toBe(1);
    expect(s.xp).toBe(0);
  });

  it('round-trips a save', () => {
    const s = freshSave();
    s.xp = 123;
    saveNow(s);
    expect(load().xp).toBe(123);
  });

  it('stamps updatedAt on every write', () => {
    const before = Date.now();
    saveNow(freshSave());
    const saved = JSON.parse(store.get(KEY)!);
    expect(saved.updatedAt).toBeGreaterThanOrEqual(before);
  });

  it('writes a mirror alongside the main key', () => {
    const s = freshSave();
    s.xp = 42;
    saveNow(s);
    expect(JSON.parse(store.get(MIRROR)!).xp).toBe(42);
  });

  it('self-heals from the mirror when the main key is wiped', () => {
    const s = freshSave();
    s.xp = 500;
    saveNow(s);
    store.delete(KEY); // simulate a partial storage clear
    const recovered = load();
    expect(recovered.xp).toBe(500);
    // and the main key is rewritten so the next load is normal
    expect(JSON.parse(store.get(KEY)!).xp).toBe(500);
  });

  it('falls back to a fresh save on corrupt JSON and keeps a backup', () => {
    store.set(KEY, '{not valid json!!');
    const s = load();
    expect(s.xp).toBe(0);
    expect(store.get('ml101.save.bak')).toBe('{not valid json!!');
  });

  it('prefers the payload with more progress when reconciling', () => {
    const older = { ...freshSave(), xp: 100, updatedAt: 1000 };
    const newest = { ...freshSave(), xp: 300, updatedAt: 2000 };
    expect(newer(older, newest)?.xp).toBe(300);
    expect(newer(newest, older)?.xp).toBe(300);
    // equal timestamps: more XP wins rather than silently downgrading
    const a = { ...freshSave(), xp: 10, updatedAt: 5 };
    const b = { ...freshSave(), xp: 90, updatedAt: 5 };
    expect(newer(a, b)?.xp).toBe(90);
    expect(newer(null, b)?.xp).toBe(90);
    expect(newer(a, null)?.xp).toBe(10);
  });

  it('rejects malformed payloads on import', () => {
    expect(importSave('"just a string"')).toBeNull();
    expect(importSave('{"noVersion": true}')).toBeNull();
    expect(importSave('nonsense')).toBeNull();
  });

  it('imports a valid save', () => {
    const s = freshSave();
    s.xp = 777;
    const imported = importSave(JSON.stringify(s));
    expect(imported?.xp).toBe(777);
    expect(load().xp).toBe(777);
  });

  it('export produces something import can read back', () => {
    const s = freshSave();
    s.xp = 64;
    s.badges = { ch01: { at: 1 } };
    saveNow(s);
    const json = exportSave();
    store.clear();
    const back = importSave(json);
    expect(back?.xp).toBe(64);
    expect(back?.badges.ch01).toEqual({ at: 1 });
  });

  it('reset clears both the main key and the mirror', () => {
    const s = freshSave();
    s.xp = 55;
    saveNow(s);
    const fresh = resetSave();
    expect(fresh.xp).toBe(0);
    expect(store.has(KEY)).toBe(false);
    expect(store.has(MIRROR)).toBe(false);
    expect(load().xp).toBe(0);
  });

  it('survives localStorage throwing (private mode / quota)', () => {
    const throwing = {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    };
    const original = (globalThis as Record<string, unknown>).localStorage;
    (globalThis as Record<string, unknown>).localStorage = throwing;
    expect(() => saveNow(freshSave())).not.toThrow();
    expect(load().xp).toBe(0);
    (globalThis as Record<string, unknown>).localStorage = original;
  });
});

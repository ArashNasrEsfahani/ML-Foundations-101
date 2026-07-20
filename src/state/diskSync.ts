import type { SaveV1 } from './migrations';

/**
 * Local-dev only: mirrors the save to a JSON file next to the project via a tiny
 * dev-server endpoint (see the ml101-save-server plugin in vite.config.ts).
 *
 * Why: localStorage is scoped to an exact origin, so a different port, a switch
 * between localhost and 127.0.0.1, or clearing browser data all look like "my
 * progress vanished". The disk mirror survives all of those.
 *
 * In production (Vercel) and in the offline single-file build this is a no-op —
 * there localStorage alone holds each visitor's own progress.
 */
const ENDPOINT = '/__ml101_save';

export const diskSyncEnabled: boolean = import.meta.env.DEV;

export async function readDisk(): Promise<SaveV1 | null> {
  if (!diskSyncEnabled) return null;
  try {
    const res = await fetch(ENDPOINT, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    if (typeof data !== 'object' || data === null || typeof data.v !== 'number') return null;
    return data as SaveV1;
  } catch {
    return null;
  }
}

let pending: ReturnType<typeof setTimeout> | undefined;
let latest: SaveV1 | null = null;

export function writeDisk(save: SaveV1, immediate = false): void {
  if (!diskSyncEnabled) return;
  latest = save;
  if (immediate) {
    flushDisk();
    return;
  }
  if (pending) clearTimeout(pending);
  pending = setTimeout(flushDisk, 250);
}

export function flushDisk(): void {
  if (!diskSyncEnabled || !latest) return;
  const body = JSON.stringify(latest);
  if (pending) {
    clearTimeout(pending);
    pending = undefined;
  }
  try {
    // sendBeacon survives page unload; fetch is the normal path
    if (navigator.sendBeacon) {
      navigator.sendBeacon(ENDPOINT, new Blob([body], { type: 'application/json' }));
    } else {
      void fetch(ENDPOINT, { method: 'POST', body, keepalive: true }).catch(() => {});
    }
  } catch {
    /* never let persistence break the app */
  }
}

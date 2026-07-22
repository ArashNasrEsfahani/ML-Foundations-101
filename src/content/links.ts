import { chapters } from './index';

/**
 * Where a `[text](target)` in lesson prose actually goes.
 *
 * Authors write `sec:ch04-gradient-descent`, never `#/ch/ch04/ch04-gradient-descent`:
 * the section id is the thing that is stable and checkable, and a test walks
 * every link in the course to make sure it still resolves. `ch:ch04` lands on
 * the chapter's opening section, which is the closest thing the map has to a
 * chapter address.
 */
export interface ResolvedLink {
  /** router path, or an absolute URL when `external` */
  href: string;
  external: boolean;
  /** false when the target no longer exists — the renderer then drops the link */
  ok: boolean;
  /** "Chapter 4 · Gradient Descent", for the title attribute */
  hint?: string;
}

function sectionLink(sectionId: string): ResolvedLink {
  for (const c of chapters) {
    const s = c.sections.find((x) => x.id === sectionId);
    if (s) {
      return {
        href: `/ch/${c.id}/${s.id}`,
        external: false,
        ok: true,
        hint: `Chapter ${c.number} · ${s.title}`,
      };
    }
  }
  return { href: '/', external: false, ok: false };
}

export function resolveHref(target: string): ResolvedLink {
  if (target.startsWith('sec:')) return sectionLink(target.slice(4).trim());

  if (target.startsWith('ch:')) {
    const ch = chapters.find((c) => c.id === target.slice(3).trim());
    if (!ch || ch.sections.length === 0) return { href: '/', external: false, ok: false };
    return {
      href: `/ch/${ch.id}/${ch.sections[0].id}`,
      external: false,
      ok: true,
      hint: `Chapter ${ch.number} · ${ch.title}`,
    };
  }

  if (/^https?:\/\//.test(target)) return { href: target, external: true, ok: true };

  // an in-app route written out longhand ('/badges', '/about')
  if (target.startsWith('/')) return { href: target, external: false, ok: true };

  return { href: '/', external: false, ok: false };
}

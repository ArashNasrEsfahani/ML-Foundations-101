import type { Concept } from './types';
import { conceptsCh01 } from './ch01';
import { conceptsCh02 } from './ch02';
import { conceptsCh03 } from './ch03';
import { conceptsCh04 } from './ch04';
import { conceptsCh05 } from './ch05';
import { conceptsCh06 } from './ch06';
import { conceptsCh07 } from './ch07';
import { conceptsCh08 } from './ch08';
import { conceptsCh09 } from './ch09';
import { conceptsCh10 } from './ch10';
import { conceptsCh11 } from './ch11';

export type { Concept } from './types';
export { statquestUrl, conceptVideo } from './types';

/**
 * Every concept in the course, in the order the chapters introduce them. A
 * concept is *defined* in the chapter that first teaches it properly and
 * *referred to* from anywhere, so later chapters can lean on earlier ones
 * without repeating themselves.
 */
export const concepts: Concept[] = [
  ...conceptsCh01,
  ...conceptsCh02,
  ...conceptsCh03,
  ...conceptsCh04,
  ...conceptsCh05,
  ...conceptsCh06,
  ...conceptsCh07,
  ...conceptsCh08,
  ...conceptsCh09,
  ...conceptsCh10,
  ...conceptsCh11,
];

/** the same concepts, kept in their chapters — what the glossary browses by */
export const conceptGroups: { chapterId: string; number: number; items: Concept[] }[] = [
  { chapterId: 'ch01', number: 1, items: conceptsCh01 },
  { chapterId: 'ch02', number: 2, items: conceptsCh02 },
  { chapterId: 'ch03', number: 3, items: conceptsCh03 },
  { chapterId: 'ch04', number: 4, items: conceptsCh04 },
  { chapterId: 'ch05', number: 5, items: conceptsCh05 },
  { chapterId: 'ch06', number: 6, items: conceptsCh06 },
  { chapterId: 'ch07', number: 7, items: conceptsCh07 },
  { chapterId: 'ch08', number: 8, items: conceptsCh08 },
  { chapterId: 'ch09', number: 9, items: conceptsCh09 },
  { chapterId: 'ch10', number: 10, items: conceptsCh10 },
  { chapterId: 'ch11', number: 11, items: conceptsCh11 },
];

const byId = new Map<string, Concept>();
for (const c of concepts) byId.set(c.id, c);

export function getConcept(id: string): Concept | undefined {
  return byId.get(id);
}

/** ids that appear more than once — a test fails on these rather than the app */
export function duplicateConceptIds(): string[] {
  const seen = new Set<string>();
  const dupes = new Set<string>();
  for (const c of concepts) {
    if (seen.has(c.id)) dupes.add(c.id);
    seen.add(c.id);
  }
  return [...dupes];
}

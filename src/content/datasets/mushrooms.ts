/**
 * Toy mushroom-foraging table for the TreeBuilder widget (12 rows, fixed).
 *
 * Hidden rule: a mushroom is edible iff it has NO dots AND (round cap OR
 * light color). Engineered so greedy entropy splitting reaches pure leaves
 * in exactly 3 splits (dots first — gain 0.46 — then cap/color below),
 * while a bad first split (cap or color) needs 4.
 */

export type CapShape = 'round' | 'flat';
export type CapColor = 'light' | 'dark';
export type HasDots = 'yes' | 'no';

export interface Mushroom {
  cap: CapShape;
  color: CapColor;
  dots: HasDots;
  edible: boolean;
}

export type MushroomFeature = 'cap' | 'color' | 'dots';

export const MUSHROOM_FEATURES: MushroomFeature[] = ['cap', 'color', 'dots'];

export const MUSHROOM_VALUES: Record<MushroomFeature, [string, string]> = {
  cap: ['round', 'flat'],
  color: ['light', 'dark'],
  dots: ['yes', 'no'],
};

/** 12 mushrooms: 6 edible, 6 poisonous (interleaved for display). */
export const mushrooms: Mushroom[] = [
  { cap: 'round', color: 'light', dots: 'no', edible: true },
  { cap: 'flat', color: 'dark', dots: 'no', edible: false },
  { cap: 'round', color: 'dark', dots: 'no', edible: true },
  { cap: 'round', color: 'light', dots: 'yes', edible: false },
  { cap: 'flat', color: 'light', dots: 'no', edible: true },
  { cap: 'flat', color: 'dark', dots: 'yes', edible: false },
  { cap: 'round', color: 'light', dots: 'no', edible: true },
  { cap: 'round', color: 'dark', dots: 'yes', edible: false },
  { cap: 'flat', color: 'light', dots: 'no', edible: true },
  { cap: 'flat', color: 'dark', dots: 'no', edible: false },
  { cap: 'round', color: 'dark', dots: 'no', edible: true },
  { cap: 'flat', color: 'light', dots: 'yes', edible: false },
];

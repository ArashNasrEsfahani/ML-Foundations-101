# ML 101 — Content & Widget Authoring Guide

This guide is the contract for anyone (human or agent) adding chapters/widgets.
Read it fully before writing a line. The reference implementations are:

- **Chapter content:** `src/content/chapters/ch01.ts` — copy its structure exactly.
- **Interactive widget (SVG/drag):** `src/components/widgets/SpamLine/SpamLine.tsx`
- **Interactive widget (sorting game):** `src/components/widgets/TaskSorter/TaskSorter.tsx`
- **Schema (single source of truth):** `src/content/schema.ts`

## Hard rules

1. **Paraphrase, never copy.** Read the assigned PDF pages of "100-Page ML.pdf" (Read tool,
   `pages` param) and teach the same concepts in fresh wording. No sentence may be copied.
2. **Monochrome theme.** Ink `var(--ink)`, graphite `var(--graphite)`, paper `#fffdf8`,
   lines `var(--line)`. Deep green `var(--ok)`/`var(--ok-bg)` and red `var(--bad)`/`var(--bad-bg)`
   appear ONLY in answer feedback (FeedbackPanel/ClassifySort already handle this).
   Never introduce any other color. Data marks: class A = filled ink dot, class B = open circle,
   class C = graphite dot (see `Plot.tsx` `Dot`).
3. **Do NOT edit shared files**: `registry.ts`, `figures.tsx`, `schema.ts`, `index.ts` (content),
   anything in `src/state/`, `src/components/{lesson,quiz,hud,map,boss}/`. You only ADD files:
   your chapter file(s), your widget folders, your dataset files, your `src/lib/ml/*` modules,
   your `tests/*.spec.ts`. (Integration into the registry happens afterwards, centrally.)
4. **No `figure` blocks.** Use widgets, hints, lists and formulas instead.
5. **No new dependencies.**

## Chapter files

`src/content/chapters/chXX.ts` exports `chXX: Chapter`. Follow `ch01.ts`:

- 3–7 sections per chapter, each 3–8 minutes: 2–6 `p` blocks, 1–2 equations
  (`math` or better `formula` with tappable `terms`), usually one `widget`, optional `hint`s,
  ending with ONE `quiz` block of 3–5 questions.
- Inline markdown-lite in all `md`/`prompt`/`explain` strings: `**bold**`, `*em*`,
  `` `code` ``, `$tex$` (KaTeX inline). Escape backslashes in TS strings (`\\mathbf{x}`).
- **Id conventions (globally unique):** sections `chXX-<slug>`, quizzes `chXX-q-<slug>`,
  questions `chXX-q-<slug>-N`, boss questions `chXX-boss-N`, challenges `chXX-challenge-<slug>`.
- Question kinds: `mcq`, `multi`, `tf`, `numeric` (with `tolerance`), `match` (pairs in correct
  pairing; presentation shuffles), `order` (items in correct order; presentation shuffles).
  Mix them. `explain` must teach, not just confirm.
- **bossPool: 18–24 questions** spanning the whole chapter (the boss samples 12).
  Include at least one `numeric` and one `match`/`order`.
- `pdfPages`: the chapter's [start, end] PDF pages (authoring reference).
- Widget challenges: `{ id, label, xp: 15 }` — label is a short goal ("reach MSE < 20").

## Widgets

One folder per widget: `src/components/widgets/<Name>/<Name>.tsx`, exporting
`export function <Name>({ challenge }: WidgetProps)`. Import `WidgetProps` from `../registry`.

Use the shared kit:

- `WidgetFrame` (title, reset button, challenge chip) — always wrap your widget in it.
- `useChallenge(challenge)` → `{ done, complete }`; call `complete()` inside a `useEffect`
  when the goal is achieved (never during render).
- `Plot.tsx`: `makeFrame(w, h, xDomain, yDomain)`, `<PlotSvg frame={f}>`, `<Axes frame={f}/>`,
  `<Dot/>`. Fixed viewBox (e.g. 420×340), width 100% — responsive by construction.
- `useSvgDrag` for pointer dragging in viewBox coords; `useRaf`/`useTicker`/`usePlayState`
  for animation loops.
- Seeded randomness ONLY: `mulberry32`, `gaussian`, `shuffled`, `hashString` from `src/lib/rng.ts`.
  Datasets live in `src/content/datasets/<name>.ts` and must be reproducible (fixed seed).
- Heavy rasters (decision boundaries): a `<canvas>` under the SVG, coarse grid (~60×60),
  grayscale only. Throttle re-rasters (compute in effect, not per-pointer-move).
- Keep algorithm math in **pure framework-free modules** `src/lib/ml/<name>.ts` with a
  matching `tests/<name>.spec.ts` (vitest) checking hand-computed fixtures.

## Sanity checks (each author runs before finishing)

```powershell
# type-check ONLY your import graph (other authors may have files in flight):
npx tsc --noEmit --strict --jsx react-jsx --module esnext --moduleResolution bundler `
  --target es2020 --skipLibCheck --types vite/client `
  src/content/chapters/chXX.ts src/components/widgets/<Name>/<Name>.tsx

# run ONLY your specs:
npx vitest run tests/<yourfile>.spec.ts
```

## Voice

Friendly, precise, a little playful; second person; short paragraphs. Teach the *why*
before the *how*. The book's spirit: practical value, no fluff, honest about limitations.

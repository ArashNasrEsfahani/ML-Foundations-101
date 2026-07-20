# ML 101 — The Hundred-Page Course

A gamified, fully interactive web course that teaches the material of Andriy Burkov's
*The Hundred-Page Machine Learning Book* — 11 chapters, 46 lessons, 21 hands-on
visualizations, checkpoint quizzes, boss exams, XP, badges, an adaptive placement
check, and a printable certificate. Everything runs in the browser; no backend, no
account. Progress is saved locally.

> **This is an unofficial study companion, not the book.** Every lesson here is our
> own paraphrase of ideas that Andriy Burkov explains properly and in full. The book
> itself is not redistributed in this repository — please get it from
> **[themlbook.com](https://themlbook.com/)**. This project is not affiliated with or
> endorsed by the author or publisher.
>
> The MIT license covers *this project's* code, lesson wording, exercises and
> illustrations only.

![screenshot](docs/screenshot-map.png)

## Run it

```bash
npm install        # once
npm run dev        # → http://localhost:5173
```

## Build the single-file offline version

```bash
npm run build      # → dist/index.html (one self-contained file)
```

`dist/index.html` works from a double-click (file://) — routing, math rendering,
widgets and saved progress all function offline. Share the file freely.

## Starting where you belong

You do not have to begin at page one.

- **Placement check** (offered on the map to new learners, and always available in
  Settings): an adaptive check that binary-searches your level rather than marching
  through the book — it usually settles in **about six questions**. Everything up to
  the chapter you demonstrate is marked as known, worth 100 XP each.
- **Test out of a single chapter**: every chapter you haven't cleared has an
  *"Already know it? Test out"* button — 8 questions, one eraser. Pass and the chapter
  counts as read and the next one opens; fail and nothing is lost.

Skipped chapters are never hidden. The lessons, widgets and their XP stay there for
whenever you want to go back, and placement only ever adds progress — it cannot take
any away.

## How your progress is saved

Every action — an answered question, a completed section, a widget challenge — is
written immediately, with no "save" button and no debounce window to lose work in.

- **Everywhere (including a Vercel deploy):** progress lives in the browser's own
  storage, so each visitor keeps their own progress on their own device automatically.
  There is no account and no server-side data. A second copy (`ml101.save.mirror`) is
  kept alongside the main one, and a partially cleared cache self-heals from it.
- **Local dev only, as a safety net:** the same save is mirrored to
  `.ml101-save.json` beside the project. Restart the dev server, clear the browser,
  or switch between `localhost` / `127.0.0.1` — the app reconciles on load and takes
  whichever copy has more progress. This file is gitignored.
- **Manual backup:** Settings → Export copies your save as text; Import restores it.
  This is how to move progress between the dev server and the offline `dist` file
  (they are different origins, so they keep separate browser storage).

The dev server is pinned to port 5173 and bound dual-stack on purpose: a drifting
port or a `localhost`-vs-`127.0.0.1` switch changes the storage origin, which is the
usual reason a local app appears to "forget" everything.

## Tests

```bash
npm run test       # vitest: ML engines + XP/unlock/storage logic
```

## Illustrations (optional, via Codex)

The app ships with built-in hand-drawn SVG artwork. To upgrade any of it with generated
pencil-sketch PNGs, open `CODEX_IMAGES.md` and hand it to Codex — it contains the style
guide, the exact filenames, and the save location (`src/assets/illustrations/`). The app
picks up whatever exists there automatically (dev: instantly; offline build: at next build).

After Codex drops new images, run:

```bash
python scripts/optimize_illustrations.py
```

It shrinks each PNG ~40× for the single-file build (originals are kept untouched in
`src/assets/illustrations/originals/`). Safe to re-run any time.

## Project layout

```
src/
  content/          typed lessons, quizzes, boss pools (one file per chapter)
  components/
    widgets/        interactive visualizations (one folder each)
    lesson/ quiz/   rendering + quiz engine
    map/ boss/ hud/ game shell
  lib/ml/           pure, unit-tested algorithm engines (GD, SVM, k-means, NN, …)
  state/            XP, levels, unlocks, badges, localStorage persistence
tests/              vitest specs
CODEX_IMAGES.md     work order for generated illustrations
AUTHORING.md        content/widget authoring conventions
```

Based on the book by Andriy Burkov ("read first, buy later"). All lesson text is
original paraphrase; buy the book — it is excellent and genuinely a hundred pages.

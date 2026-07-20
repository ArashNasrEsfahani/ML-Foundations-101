# Codex Work Order — Illustration Set for "ML 101" Teaching Webapp

**You (Codex) are asked to generate the images listed below, one by one, and save each
one to the exact path given.** The webapp being built in this folder auto-detects the
images by filename — nothing else is needed after saving. All images are optional
enhancements: the app has built-in SVG fallbacks, so generate them in any order and
skip any you can't do well.

---

## 1. Global style guide (applies to EVERY image)

- **Style:** minimal hand-drawn **pencil / graphite sketch**. Loose, confident single-weight
  strokes, like a quick sketch in a paper notebook. Slight line wobble is good. Light
  cross-hatching allowed for shading, used sparingly.
- **Color:** pure **grayscale only** — graphite gray (#2A2A28 to #7C7A74 range). Absolutely
  no color. No gradients, no shadows, no 3D rendering, no photorealism.
- **Background:** **transparent** (PNG alpha). If transparency is impossible, use flat
  cream `#FAF7F0` — never white, never any texture.
- **No text or letters inside any image.** No numbers, no labels, no watermarks.
- **Composition:** one single centered subject with generous empty margins (~15% padding).
  Simple enough to read at 64 px.
- **Format:** PNG, **1024×1024** unless a different size is stated.
- **Consistency matters more than beauty:** all 34 images should look drawn by the same
  hand with the same pencil.

## 2. How to save

Save every image to this folder, with the EXACT lowercase filename given (kebab-case, `.png`):

```
D:\Machine Learning 101\src\assets\illustrations\
```

Example: the first image below must end up at
`D:\Machine Learning 101\src\assets\illustrations\hero-cover.png`.

If you generate images into your own session folder first, copy them to the path above
and verify the filename matches character-for-character. Do not create subfolders.

---

## 3. Image list

### 3.1 App identity (2 images)

| Filename | Description |
|---|---|
| `hero-cover.png` | An open book lying flat, and floating above its pages a small scatter plot of dots with a sketched curved line separating two groups of dots. The app's cover emblem. |
| `mascot-bulb.png` | A friendly light bulb, hand-drawn, slightly tilted, with three short rays around the top. Used as the "hint" mascot. Keep it very simple and charming. |

### 3.2 Chapter emblems (11 images, one per chapter)

Round-ish composition (fits nicely in a circle), single subject.

| Filename | Chapter | Description |
|---|---|---|
| `ch01-emblem.png` | 1 — Introduction | A small robot head looking at three scattered dots through a magnifying glass. |
| `ch02-emblem.png` | 2 — Notation & Definitions | A large sketched Greek sigma (Σ) leaning against a small arrow vector; a tiny 2×2 matrix grid beside them. (Math symbols are allowed here as drawn shapes — this is the one exception to "no text".) |
| `ch03-emblem.png` | 3 — Fundamental Algorithms | A small branching decision tree: one root circle splitting into two, then four leaf circles, drawn like a hanging mobile. |
| `ch04-emblem.png` | 4 — Anatomy of a Learning Algorithm | A ball rolling down the inside of a sketched U-shaped curve, with a dashed arc showing its path toward the bottom. |
| `ch05-emblem.png` | 5 — Basic Practice | A carpenter's workbench view: a small ruler, a pencil, and a wavy curve drawn on a piece of paper. |
| `ch06-emblem.png` | 6 — Neural Networks & Deep Learning | A small network of circles in three columns (2, 3, 1) connected by lines — a tiny neural net diagram, hand-drawn. |
| `ch07-emblem.png` | 7 — Problems & Solutions | A Swiss-army knife, open, with three visible tools. |
| `ch08-emblem.png` | 8 — Advanced Practice | A balance scale with a big pile of dots on one pan and a single dot on the other (imbalanced data). |
| `ch09-emblem.png` | 9 — Unsupervised Learning | Three loose clusters of dots, each cluster circled by a freehand lasso line. |
| `ch10-emblem.png` | 10 — Other Forms of Learning | Two arrows: `king − man + woman ≈ queen` drawn purely as shapes — four small crowns/figures connected by two parallel arrows. Alternative if too complex: a compass rose. |
| `ch11-emblem.png` | 11 — Conclusion | A mountain summit with a small flag planted on top, dotted path leading up. |

### 3.3 Badge medallions (20 images)

Each is a **round medal/medallion**: a sketched double-line circle border with the subject
inside, and a tiny ribbon "V" hanging at the bottom. Same medal frame for all 20, only the
inner subject changes.

| Filename | Badge | Inner subject |
|---|---|---|
| `badge-ch01.png` | First Steps | A single footprint. |
| `badge-ch02.png` | Notation Ninja | A headband-wearing pencil (pencil with a small tied band). |
| `badge-ch03.png` | Algorithm Apprentice | A small tree branching into two leaves. |
| `badge-ch04.png` | Descent Driver | A ball at the bottom of a U-curve with a checkmark above it. |
| `badge-ch05.png` | Practice Makes Perfect | A target with an arrow in the center. |
| `badge-ch06.png` | Deep Diver | A diving mask / snorkel. |
| `badge-ch07.png` | Problem Solver | A jigsaw puzzle piece fitting into a gap. |
| `badge-ch08.png` | Seasoned Practitioner | A chef's hat over a whisk. |
| `badge-ch09.png` | Cluster Captain | A captain's hat above three circled dot-clusters. |
| `badge-ch10.png` | Rank & File | A podium with three steps. |
| `badge-ch11.png` | The Hundred-Pager | A closed book with a small laurel wreath around it. |
| `badge-flawless.png` | Flawless | A diamond/gem shape. |
| `badge-comeback.png` | Comeback | A phoenix-like bird rising, three flame strokes below. |
| `badge-tinkerer.png` | Tinkerer | A wrench crossing a screwdriver (X shape). |
| `badge-lab-rat.png` | Lab Rat | A cute mouse next to a lab flask. |
| `badge-sharp-pencil.png` | Sharp Pencil | A very sharp pencil tip, close-up, with two motion lines. |
| `badge-bright-idea.png` | Bright Idea | The light bulb (same one as the mascot) small, inside the medal. |
| `badge-halfway.png` | Halfway There | A circle half filled with hatching (half-moon). |
| `badge-completionist.png` | Completionist | A checklist card with three ticked boxes (boxes + checkmarks as shapes). |
| `badge-certified.png` | Certified | A rosette / prize ribbon. |

### 3.4 Certificate (1 image)

| Filename | Size | Description |
|---|---|---|
| `certificate-frame.png` | **1600×1131** (A4 landscape ratio) | An ornamental hand-drawn rectangular border frame for a certificate: double sketched line with small laurel sprigs in the four corners. The entire CENTER must stay completely empty/transparent (text goes there later). Border occupies only the outer ~8%. |

---

## 4. Checklist for Codex

1. Read the style guide (§1) before every batch — consistency is the top requirement.
2. Generate → save to `D:\Machine Learning 101\src\assets\illustrations\<filename>.png`.
3. Verify: 34 files total, exact names, PNG, grayscale, transparent background.
4. Do not modify any other file in this project.

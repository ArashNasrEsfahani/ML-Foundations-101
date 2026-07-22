import React, { useEffect, useMemo, useRef, useState } from 'react';
import { WidgetFrame, type GuideEntry } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { makeFrame, Axes, Dot, PlotSvg } from '../Plot';
import { EquationReadout, fmt, texSum } from '../EquationReadout';
import { spam2d } from '../../../content/datasets/spam2d';
import { moons } from '../../../content/datasets/moons';
import { rings } from '../../../content/datasets/rings';
import {
  fitLinearSvm,
  decisionLinear,
  fitKernelPerceptron,
  predictKernel,
  type LabeledPoint,
} from '../../../lib/ml/svm';

const W = 420;
const H = 340;
const G = 70; // boundary raster resolution

type DatasetId = 'separable' | 'noisy' | 'rings';
type KernelId = 'none' | 'rbf';

type Model =
  | { kind: 'linear'; w: [number, number]; b: number }
  | { kind: 'rbf'; alphas: number[]; gamma: number };

interface Fit {
  model: Model;
  /** points on the wrong side of the boundary */
  misses: number;
  /** Σ max(0, 1 − yᵢ(w·xᵢ − b)) — the soft-margin penalty actually being paid */
  hinge: number;
  /** points inside the margin (linear) or with a non-zero α (RBF) */
  supports: number;
}

/**
 * The three datasets are three different problems, the two mode buttons fit two
 * different models, and each mode leaves one slider inert — none of which the
 * plot says out loud, so the guide has to.
 */
const GUIDE: GuideEntry[] = [
  {
    control: 'separable',
    what: 'Two clean blobs with a gap between them, the easy case: a straight line can split them and still keep room on both sides. Start here to see what a healthy [[margin]] looks like before anything goes wrong.',
  },
  {
    control: 'moons',
    what: 'Two interleaving crescents that genuinely overlap, so no straight line gets every point right. This is the dataset where `C` has a real decision to make.',
  },
  {
    control: 'rings',
    what: 'One class enclosed by the other. A straight line cannot cut a circle, so `linear` is stuck no matter how you set `C` — this is the dataset the challenge wants you to hand to `RBF kernel`.',
  },
  {
    control: 'linear',
    what: 'Fits a soft-margin SVM: one straight boundary, placed to hold the widest corridor it can while paying for the points that violate it. The `C` slider is live in this mode and `γ` is not.',
  },
  {
    control: 'RBF kernel',
    what: 'Throws the straight line away and builds the boundary out of one Gaussian bump per active point — see [[kernel-trick]] and [[rbf-kernel]]. The boundary can now curve and close around a cluster, which is what the rings need.',
  },
  {
    control: 'C',
    what: 'The strictness dial of the straight-line fit — see [[svm-c]]. Drag it left and watch `margin 2/‖w‖` grow while `misclassified` creeps up; drag it right and the line contorts to catch stragglers. It greys out under `RBF kernel`, which fits a kernel perceptron with no slack budget for `C` to size.',
  },
  {
    control: 'γ',
    what: 'How tightly each Gaussian bump hugs its own point — see [[gamma-rbf]]. Small γ gives broad, smooth blobs; large γ shrinks them until the boundary wraps individual points and starts memorizing noise. It greys out under `linear`, where there is no kernel to shape.',
  },
  {
    control: 'the shading',
    what: 'The lighter half of the plot is the side the model calls $+1$, the plain paper half is $-1$, and the darker band between them is the strip where the score sits near zero. It dims for a moment while a new fit is being computed.',
  },
  {
    control: 'dashed rings',
    what: 'A ring marks a point the boundary actually leans on: a [[support-vector]] under `linear`, a point with a non-zero weight under `RBF kernel`. Every unringed point could be moved a little without shifting the boundary at all.',
  },
  {
    control: '‖w‖',
    what: 'The length of the weight vector — the one number the corridor width depends on. A big ‖w‖ means a steep, decisive score function and therefore a narrow corridor.',
  },
  {
    control: 'margin 2/‖w‖',
    what: 'The width of the corridor between the two classes, measured in the plot’s own feature units. This is the quantity the SVM is trying to make large, and the quantity `C` makes you give away.',
  },
  {
    control: 'hinge Σ',
    what: 'The total [[hinge-loss]] the fit is paying: each point adds $\\max(0,\\ 1 - y_i(\\mathbf{w}\\mathbf{x}_i - b))$, so a point safely outside the corridor adds nothing and a point on the wrong side adds more than 1. Zero here means every point clears the corridor with room to spare.',
  },
  {
    control: 'on margin',
    what: 'How many points sit on or inside the corridor — the ringed ones, the [[support-vector|support vectors]]. A handful is normal; a large number means `C` is low enough that the model is tolerating a wide, crowded corridor.',
  },
  {
    control: 'active kernels',
    what: 'Under `RBF kernel`, how many points carry a non-zero weight $\\alpha_i$ and so contribute a bump to the boundary. These are the ringed points, and the rest of the data has no say in where the boundary runs.',
  },
  {
    control: 'misclassified',
    what: 'Points currently on the wrong side of the boundary, out of the whole dataset. The challenge is to get this to 0 on `rings` with `RBF kernel` switched on.',
  },
];

/**
 * Soft margins and kernels, hands on: pick a dataset, trade errors for margin
 * with C, then switch on the RBF kernel and watch the boundary bend. The
 * readout underneath shows the objective you are actually minimizing.
 */
export function MarginPlayground({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const [ds, setDs] = useState<DatasetId>('separable');
  const [kern, setKern] = useState<KernelId>('none');
  const [logC, setLogC] = useState(0); // C = 10^logC ∈ [0.01, 100]
  const [gamma, setGamma] = useState(0.8);
  const [fit, setFit] = useState<Fit | null>(null);
  const [pending, setPending] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const frame = makeFrame(W, H, [0, 10], [0, 10]);
  const C = Math.pow(10, logC);

  const points: LabeledPoint[] = useMemo(() => {
    if (ds === 'separable') return spam2d();
    if (ds === 'noisy') return moons();
    return rings();
  }, [ds]);

  // ---- re-fit + re-raster, debounced ~150ms after any parameter change
  useEffect(() => {
    setPending(true);
    const t = setTimeout(() => {
      let m: Model;
      let score: (x: number, y: number) => number;
      let supports = 0;
      if (kern === 'none') {
        const lin = fitLinearSvm(points, C, 800, 0.02);
        m = { kind: 'linear', w: lin.w, b: lin.b };
        score = (x, y) => decisionLinear(lin, x, y);
        for (const p of points) {
          if (Math.abs(decisionLinear(lin, p.x, p.y)) <= 1.0001) supports++;
        }
      } else {
        const alphas = fitKernelPerceptron(points, gamma, 60);
        m = { kind: 'rbf', alphas, gamma };
        score = (x, y) => predictKernel(points, alphas, gamma, x, y);
        supports = alphas.filter((a) => a > 0).length;
      }

      let bad = 0;
      let hinge = 0;
      for (const p of points) {
        const s = score(p.x, p.y);
        if (p.label * s <= 0) bad++;
        hinge += Math.max(0, 1 - p.label * s);
      }

      // raster: light gray = +1 side, paper = −1 side, mid gray = near the boundary
      const cv = canvasRef.current;
      const ctx = cv?.getContext('2d');
      if (cv && ctx) {
        const scores = new Float32Array(G * G);
        let maxAbs = 1e-9;
        for (let j = 0; j < G; j++) {
          for (let i = 0; i < G; i++) {
            const x = (10 * (i + 0.5)) / G;
            const y = 10 * (1 - (j + 0.5) / G);
            const s = score(x, y);
            scores[j * G + i] = s;
            if (Math.abs(s) > maxAbs) maxAbs = Math.abs(s);
          }
        }
        const band = kern === 'none' ? 1 : 0.12 * maxAbs;
        const img = ctx.createImageData(G, G);
        for (let k = 0; k < G * G; k++) {
          const s = scores[k];
          const a = Math.abs(s) <= band ? 56 : s > 0 ? 26 : 0;
          img.data[k * 4] = 42;
          img.data[k * 4 + 1] = 42;
          img.data[k * 4 + 2] = 40;
          img.data[k * 4 + 3] = a;
        }
        // single putImageData replaces the whole buffer, so there is no flicker
        ctx.putImageData(img, 0, 0);
      }

      setFit({ model: m, misses: bad, hinge, supports });
      setPending(false);
    }, 150);
    return () => clearTimeout(t);
  }, [points, kern, C, gamma]);

  // ---- challenge: rings + RBF, zero misclassified
  const hit = ds === 'rings' && kern === 'rbf' && fit?.misses === 0;
  useEffect(() => {
    if (hit) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hit]);

  const model = fit?.model ?? null;
  const supportish = (p: LabeledPoint, i: number): boolean => {
    if (!model) return false;
    if (model.kind === 'linear') {
      return Math.abs(decisionLinear({ w: model.w, b: model.b }, p.x, p.y)) <= 1.0001;
    }
    return model.alphas[i] > 0;
  };

  const reset = () => {
    setDs('separable');
    setKern('none');
    setLogC(0);
    setGamma(0.8);
  };

  const seg = <T extends string>(
    options: [T, string][],
    cur: T,
    set: (v: T) => void,
  ) => (
    <span style={{ display: 'inline-flex', gap: 4 }}>
      {options.map(([v, lbl]) => {
        const on = cur === v;
        return (
          <button
            key={v}
            className={on ? 'primary' : 'ghost'}
            aria-pressed={on}
            onClick={() => set(v)}
            style={{ padding: '3px 10px', fontSize: '0.82rem' }}
          >
            <span
              key={on ? 'on' : 'off'}
              className={on ? 'anim-pop' : undefined}
              style={{ display: 'inline-block' }}
            >
              {lbl}
            </span>
          </button>
        );
      })}
    </span>
  );

  // ---- the live readout, one shape per mode
  const cText = fmt(C, C >= 10 ? 0 : 2);
  let readout: React.ReactNode = null;
  if (model && model.kind === 'linear') {
    const [w0, w1] = model.w;
    const norm = Math.hypot(w0, w1) || 1e-9;
    readout = (
      <EquationReadout
        key="linear"
        symbolic="\mathbf{w}\mathbf{x} - b = 0"
        substituted={`${texSum([
          { coef: w0, sym: 'x^{(1)}' },
          { coef: w1, sym: 'x^{(2)}' },
          { coef: -model.b },
        ])} = 0`}
        aux={`\\min\\ \\tfrac{1}{2}\\|\\mathbf{w}\\|^{2} + ${cText}\\sum_i \\max\\!\\left(0,\\ 1 - y_i(\\mathbf{w}\\mathbf{x}_i - b)\\right)`}
        stats={[
          { label: '‖w‖', value: fmt(norm) },
          { label: 'margin 2/‖w‖', value: fmt(2 / norm) },
          { label: 'hinge Σ', value: fmt(fit ? fit.hinge : 0) },
          { label: 'on margin', value: String(fit ? fit.supports : 0) },
          { label: 'misclassified', value: String(fit ? fit.misses : 0), emphasis: true },
        ]}
        note="Small C buys a wide margin by tolerating violations; large C pays almost anything to avoid them."
      />
    );
  } else if (model && model.kind === 'rbf') {
    readout = (
      <EquationReadout
        key="rbf"
        symbolic="K(\mathbf{x}, \mathbf{x}') = \exp\!\left(-\gamma\|\mathbf{x} - \mathbf{x}'\|^2\right)"
        substituted={`K(\\mathbf{x}, \\mathbf{x}') = \\exp\\!\\left(-${fmt(gamma)}\\,\\|\\mathbf{x} - \\mathbf{x}'\\|^2\\right)`}
        aux="\hat{y} = \mathrm{sign}\!\left(\textstyle\sum_i \alpha_i y_i K(\mathbf{x}_i, \mathbf{x})\right)"
        stats={[
          { label: 'γ', value: fmt(gamma) },
          { label: 'active kernels', value: String(fit ? fit.supports : 0) },
          { label: 'misclassified', value: String(fit ? fit.misses : 0), emphasis: true },
        ]}
        note="There is no line here: the boundary is a weighted sum of one bump per active point, so it can curve and close."
      />
    );
  }

  return (
    <WidgetFrame
      title="Margins, noise and kernels"
      intro={
        'The shaded region is one class’s side; the darker band hugs the [[decision-boundary|decision boundary]]. ' +
        'Points with a dashed ring are the [[support-vector|support vectors]] holding it up. Slide [[svm-c|C]] to ' +
        'trade [[margin]] width against mistakes — then hand the rings to the [[rbf-kernel|RBF kernel]], which ' +
        'replaces the straight line with a boundary built from one bump per point.'
      }
      guide={GUIDE}
      onReset={reset}
      challenge={challenge}
      challengeDone={done}
    >
      <div
        style={{
          display: 'flex',
          gap: 12,
          rowGap: 8,
          flexWrap: 'wrap',
          alignItems: 'center',
          marginBottom: 10,
          fontSize: '0.88rem',
        }}
      >
        {seg<DatasetId>(
          [
            ['separable', 'separable'],
            ['noisy', 'moons'],
            ['rings', 'rings'],
          ],
          ds,
          setDs,
        )}
        <span style={{ color: 'var(--line)' }}>|</span>
        {seg<KernelId>(
          [
            ['none', 'linear'],
            ['rbf', 'RBF kernel'],
          ],
          kern,
          setKern,
        )}
      </div>
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 8 }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 170px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              width: 74,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            C = {cText}
          </span>
          <input
            type="range"
            min={-2}
            max={2}
            step={0.1}
            value={logC}
            disabled={kern === 'rbf'}
            onChange={(e) => setLogC(Number(e.target.value))}
            style={{ flex: 1 }}
          />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, flex: '1 1 170px' }}>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              width: 74,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            γ = {fmt(gamma, 1)}
          </span>
          <input
            type="range"
            min={0.1}
            max={5}
            step={0.1}
            value={gamma}
            disabled={kern === 'none'}
            onChange={(e) => setGamma(Number(e.target.value))}
            style={{ flex: 1 }}
          />
        </label>
      </div>
      <div style={{ position: 'relative', background: '#fffdf8', borderRadius: 6 }}>
        <canvas
          ref={canvasRef}
          width={G}
          height={G}
          style={{
            position: 'absolute',
            left: `${(frame.pad.l / W) * 100}%`,
            top: `${(frame.pad.t / H) * 100}%`,
            width: `${((W - frame.pad.l - frame.pad.r) / W) * 100}%`,
            height: `${((H - frame.pad.t - frame.pad.b) / H) * 100}%`,
            pointerEvents: 'none',
            // the raster cannot ease between two fits, so it dips while the new
            // one is being computed and comes back up rather than snapping
            opacity: pending ? 0.4 : 1,
            transition: 'opacity 0.3s ease',
          }}
        />
        <PlotSvg
          frame={frame}
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            background: 'transparent',
            position: 'relative',
          }}
        >
          <Axes frame={frame} xLabel="feature 1" yLabel="feature 2" />
          {/* halo-backed dots so dense clusters stay legible */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={frame.sx(p.x)}
                cy={frame.sy(p.y)}
                r={5}
                fill="#fffdf8"
                stroke="#fffdf8"
                strokeWidth={3}
              />
              <Dot x={frame.sx(p.x)} y={frame.sy(p.y)} cls={p.label === 1 ? 'a' : 'b'} r={4.5} />
            </g>
          ))}
          {/* support rings on their own layer, fading in as points take the load */}
          <g>
            {points.map((p, i) => (
              <circle
                key={i}
                className="mark-move"
                cx={frame.sx(p.x)}
                cy={frame.sy(p.y)}
                r={10}
                fill="none"
                stroke="var(--graphite)"
                strokeWidth={0.9}
                strokeDasharray="3 2.5"
                opacity={supportish(p, i) ? 0.55 : 0}
                style={{
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                  transform: supportish(p, i) ? 'scale(1)' : 'scale(0.55)',
                }}
              />
            ))}
          </g>
        </PlotSvg>
      </div>

      {readout}

      <p style={{ margin: '10px 0 0', fontSize: '0.95rem', overflowWrap: 'anywhere' }}>
        {!fit ? (
          'fitting…'
        ) : (
          <>
            Misclassified: <strong>{fit.misses}</strong> / {points.length}
            {ds === 'rings' && kern === 'none' && (
              <span style={{ color: 'var(--graphite)' }}>
                {' '}— a straight line cannot cut a circle. Try the RBF kernel.
              </span>
            )}
            {hit && (
              <strong key="win" className="anim-pop" style={{ display: 'inline-block' }}>
                {' '}Rings separated — the kernel trick at work.
              </strong>
            )}
          </>
        )}
      </p>
    </WidgetFrame>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { WidgetFrame } from '../WidgetFrame';
import { useChallenge } from '../ChallengeChip';
import type { WidgetProps } from '../registry';
import { makeFrame, Axes, Dot, PlotSvg } from '../Plot';
import { useTicker, usePlayState } from '../../../hooks/useRaf';
import { spendingsSales } from '../../../content/datasets/spendingsSales';
import { closedForm, gradStep, loss } from '../../../lib/ml/gd';
import { clamp } from '../../../lib/math/scales';

const W = 420;
const H = 300;
const W_LO = -0.2;
const W_HI = 1.2;
const LOSS_HI = 400;
const ALPHA_LO = 0.0001;
const ALPHA_HI = 0.02; // top of the "reckless" zone
const RECKLESS_FROM = 0.01;
const DEFAULT_T = 70; // slider position ≈ α 0.004: diverges, so the player must tune it down
const DIVERGE_FACTOR = 10;
const CONVERGE_RATIO = 1.02;
const MAX_CHALLENGE_EPOCHS = 30;
const LOG_LINES = 8;

const FRAME_A = makeFrame(W, H, [W_LO, W_HI], [0, LOSS_HI]);
const FRAME_B = makeFrame(W, H, [0, 52], [0, 30]);

interface Snap {
  epoch: number;
  w: number;
  b: number;
  loss: number;
}

interface Sim {
  w: number;
  b: number;
  epoch: number;
  curLoss: number;
  initLoss: number;
  log: Snap[];
  hit: boolean;
}

function fmt(v: number): string {
  if (!Number.isFinite(v)) return v > 0 ? 'inf' : v < 0 ? '-inf' : 'nan';
  const a = Math.abs(v);
  if (a >= 10000) return v.toExponential(1);
  if (a >= 100) return v.toFixed(0);
  if (a >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

function sliderToAlpha(t: number): number {
  return ALPHA_LO * Math.pow(ALPHA_HI / ALPHA_LO, t / 100);
}

/**
 * Gradient descent, one epoch at a time, on the spendings→sales line f(x) = wx + b.
 * Pane A: the loss bowl over w (b frozen at its current value) with the descent ball.
 * Pane B: the data with the current regression line.
 */
export function DescentStepper({ challenge }: WidgetProps) {
  const { done, complete } = useChallenge(challenge);
  const data = useMemo(() => spendingsSales(), []);
  const opt = useMemo(() => {
    const cf = closedForm(data);
    return { ...cf, loss: loss(data, cf.w, cf.b) };
  }, [data]);

  const initSim = (): Sim => {
    const l0 = loss(data, 0, 0);
    return { w: 0, b: 0, epoch: 0, curLoss: l0, initLoss: l0, log: [], hit: false };
  };

  const [sim, setSim] = useState<Sim>(initSim);
  const [sliderT, setSliderT] = useState(DEFAULT_T);
  const [playing, togglePlay, setPlaying] = usePlayState(false);
  const alpha = sliderToAlpha(sliderT);

  const diverged = !Number.isFinite(sim.curLoss) || sim.curLoss > sim.initLoss * DIVERGE_FACTOR;
  const converged = sim.hit;

  const doStep = () => {
    setSim((s) => {
      if (!Number.isFinite(s.curLoss) || s.curLoss > s.initLoss * DIVERGE_FACTOR) return s;
      const next = gradStep(data, s.w, s.b, alpha);
      const nl = loss(data, next.w, next.b);
      const epoch = s.epoch + 1;
      return {
        ...s,
        w: next.w,
        b: next.b,
        epoch,
        curLoss: nl,
        log: [...s.log, { epoch, w: next.w, b: next.b, loss: nl }].slice(-LOG_LINES),
        hit: s.hit || (epoch <= MAX_CHALLENGE_EPOCHS && nl <= opt.loss * CONVERGE_RATIO),
      };
    });
  };

  useTicker(doStep, playing && !diverged, 120);

  useEffect(() => {
    if (diverged) setPlaying(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [diverged]);

  useEffect(() => {
    if (converged) complete();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [converged]);

  const reset = () => {
    setPlaying(false);
    setSim(initSim());
  };

  // Pane A: sample the loss bowl over w at the current (safe) b
  const bowlPath = useMemo(() => {
    const bSafe = Number.isFinite(sim.b) ? clamp(sim.b, -80, 80) : 0;
    const parts: string[] = [];
    const n = 64;
    for (let i = 0; i <= n; i++) {
      const wv = W_LO + ((W_HI - W_LO) * i) / n;
      const lv = Math.min(loss(data, wv, bSafe), LOSS_HI * 3);
      parts.push(`${i === 0 ? 'M' : 'L'} ${FRAME_A.sx(wv).toFixed(1)} ${FRAME_A.sy(lv).toFixed(1)}`);
    }
    return parts.join(' ');
  }, [data, sim.b]);

  const safeNum = (v: number, fallback: number) => (Number.isFinite(v) ? v : fallback);
  const ballX = FRAME_A.sx(clamp(safeNum(sim.w, W_HI * 2), W_LO, W_HI));
  const ballY = FRAME_A.sy(clamp(safeNum(sim.curLoss, LOSS_HI * 2), 0, LOSS_HI));

  const lineB0 = safeNum(sim.b, 0);
  const lineB1 = safeNum(sim.w, 0) * 52 + safeNum(sim.b, 0);

  // The fit line is drawn as an over-long horizontal line (clipped to the pane)
  // positioned by transform, because SVG x1/y1/x2/y2 are attributes and cannot be
  // transitioned — transform can, so the line swings smoothly into place.
  const fitX0 = FRAME_B.sx(0);
  const fitX1 = FRAME_B.sx(52);
  const fitY0 = FRAME_B.sy(clamp(lineB0, -2000, 2000));
  const fitY1 = FRAME_B.sy(clamp(lineB1, -2000, 2000));
  const fitMidX = (fitX0 + fitX1) / 2;
  const fitMidY = (fitY0 + fitY1) / 2;
  const fitAngle = (Math.atan2(fitY1 - fitY0, fitX1 - fitX0) * 180) / Math.PI;

  const paneCaption = { margin: '0 0 4px', fontSize: '0.85rem', color: 'var(--graphite)' } as const;

  return (
    <WidgetFrame
      title="Descend the loss bowl"
      onReset={reset}
      challenge={challenge}
      challengeDone={done}
    >
      <p style={{ margin: '0 0 10px', fontSize: '0.9rem', color: 'var(--graphite)' }}>
        Each <strong>Step</strong> runs one epoch of gradient descent on the spendings→sales data.
        The ball rolls down the loss bowl (left) while the line fits the points (right). Get the
        loss within 2% of the closed-form optimum ({fmt(opt.loss)}) in at most {MAX_CHALLENGE_EPOCHS}{' '}
        epochs — but mind the learning rate: too large and every step lands higher than the last.
      </p>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {/* the loss pane shakes once the run blows up */}
        <div style={{ flex: '1 1 260px', minWidth: 240 }} className={diverged ? 'anim-shake' : undefined}>
          <p style={paneCaption}>loss(w) with b frozen at its current value</p>
          <PlotSvg frame={FRAME_A}>
            <defs>
              <clipPath id="descent-clip-a">
                <rect
                  x={FRAME_A.pad.l}
                  y={FRAME_A.pad.t}
                  width={W - FRAME_A.pad.l - FRAME_A.pad.r}
                  height={H - FRAME_A.pad.t - FRAME_A.pad.b}
                />
              </clipPath>
            </defs>
            <Axes frame={FRAME_A} xLabel="w" yLabel="loss (MSE)" />
            <g clipPath="url(#descent-clip-a)">
              <line
                x1={FRAME_A.sx(opt.w)}
                y1={FRAME_A.pad.t}
                x2={FRAME_A.sx(opt.w)}
                y2={H - FRAME_A.pad.b}
                stroke="var(--graphite)"
                strokeWidth={1}
                strokeDasharray="5 4"
              />
              <text
                x={FRAME_A.sx(opt.w) + 5}
                y={FRAME_A.pad.t + 12}
                fontSize={10}
                fill="var(--graphite)"
                fontStyle="italic"
              >
                w*
              </text>
              <path d={bowlPath} fill="none" stroke="var(--ink)" strokeWidth={1.8} />
              <g
                className="mark-move-fast"
                style={{ transform: `translate(${ballX}px, ${ballY}px)` }}
              >
                <circle r={7} fill="var(--ink)" />
                <circle r={2.4} cx={-1.8} cy={-1.8} fill="#fffdf8" opacity={0.85} />
              </g>
            </g>
          </PlotSvg>
        </div>

        <div style={{ flex: '1 1 260px', minWidth: 240 }}>
          <p style={paneCaption}>ad spendings (millions) vs units sold — current fit</p>
          <PlotSvg frame={FRAME_B}>
            <defs>
              <clipPath id="descent-clip-b">
                <rect
                  x={FRAME_B.pad.l}
                  y={FRAME_B.pad.t}
                  width={W - FRAME_B.pad.l - FRAME_B.pad.r}
                  height={H - FRAME_B.pad.t - FRAME_B.pad.b}
                />
              </clipPath>
            </defs>
            <Axes frame={FRAME_B} xLabel="spendings" yLabel="units sold" />
            <g clipPath="url(#descent-clip-b)">
              {/* closed-form target fit */}
              <line
                x1={FRAME_B.sx(0)}
                y1={FRAME_B.sy(opt.b)}
                x2={FRAME_B.sx(52)}
                y2={FRAME_B.sy(opt.w * 52 + opt.b)}
                stroke="var(--graphite)"
                strokeWidth={1}
                strokeDasharray="5 4"
              />
              {/* current gradient-descent fit — glides via transform */}
              <line
                className="mark-move-fast"
                x1={-1500}
                y1={0}
                x2={1500}
                y2={0}
                stroke="var(--ink)"
                strokeWidth={2.2}
                strokeLinecap="round"
                style={{ transform: `translate(${fitMidX}px, ${fitMidY}px) rotate(${fitAngle}deg)` }}
              />
              {data.map((p, i) => (
                <Dot key={i} x={FRAME_B.sx(p.x)} y={FRAME_B.sy(p.y)} r={4} />
              ))}
            </g>
          </PlotSvg>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 10,
          margin: '12px 0 0',
        }}
      >
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.9rem' }}>
          α
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={sliderT}
            onChange={(e) => setSliderT(Number(e.target.value))}
            aria-label="learning rate"
            style={{ width: 140 }}
          />
        </label>
        <span style={{ fontFamily: 'ui-monospace, Consolas, monospace', fontSize: '0.85rem' }}>
          {alpha.toPrecision(2)}
          {alpha > RECKLESS_FROM && (
            <em style={{ color: 'var(--graphite)', marginLeft: 6 }}>(reckless zone)</em>
          )}
        </span>
        <span style={{ flex: 1 }} />
        <button onClick={doStep} disabled={diverged || playing}>
          Step
        </button>
        <button onClick={togglePlay} disabled={diverged}>
          {playing ? 'Pause' : 'Play'}
        </button>
        <button onClick={reset}>Reset</button>
      </div>

      <div
        style={{
          fontFamily: 'ui-monospace, Consolas, monospace',
          fontSize: '0.82rem',
          lineHeight: 1.55,
          margin: '10px 0 0',
          padding: '8px 10px',
          border: '1px solid var(--line)',
          borderRadius: 6,
          background: '#fffdf8',
          minHeight: '2.2em',
        }}
      >
        {sim.log.length === 0 ? (
          <span style={{ color: 'var(--graphite)' }}>
            epoch 0 · w={fmt(sim.w)} · b={fmt(sim.b)} · loss={fmt(sim.curLoss)} — press Step or Play
          </span>
        ) : (
          sim.log
            .slice()
            .reverse()
            .map((e) => (
              <div key={e.epoch} className="anim-slide-left">
                epoch {e.epoch} · w={fmt(e.w)} · b={fmt(e.b)} · loss={fmt(e.loss)}
              </div>
            ))
        )}
      </div>

      <p style={{ margin: '10px 0 0', fontSize: '0.95rem' }}>
        {diverged ? (
          <strong className="anim-pop" style={{ display: 'inline-block' }}>
            diverged — α too large. Each step overshoots the valley and climbs the far wall. Reset
            and try a smaller learning rate.
          </strong>
        ) : converged ? (
          <strong className="anim-pop" style={{ display: 'inline-block' }}>
            Converged: loss within 2% of the optimum in {MAX_CHALLENGE_EPOCHS} epochs or fewer.
          </strong>
        ) : (
          <>
            epoch <strong>{sim.epoch}</strong> · closed-form optimum: w*={fmt(opt.w)}, b*=
            {fmt(opt.b)}, loss={fmt(opt.loss)} (dashed)
          </>
        )}
      </p>
    </WidgetFrame>
  );
}

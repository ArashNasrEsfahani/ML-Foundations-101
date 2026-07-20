import { describe, it, expect } from 'vitest';
import { gradStep, loss, runEpochs, closedForm } from '../src/lib/ml/gd';
import { spendingsSales } from '../src/content/datasets/spendingsSales';

describe('gradient descent engine (1-feature linear regression)', () => {
  const pts = spendingsSales();

  it('gradStep matches a hand-computed update on a tiny fixture', () => {
    // points (1,1), (2,3) at w=0, b=0: residuals 1 and 3
    // ∂l/∂w = ((-2·1·1) + (-2·2·3)) / 2 = -7  →  w = 0 − 0.1·(−7) = 0.7
    // ∂l/∂b = ((-2·1) + (-2·3)) / 2 = -4      →  b = 0 − 0.1·(−4) = 0.4
    const t = gradStep([{ x: 1, y: 1 }, { x: 2, y: 3 }], 0, 0, 0.1);
    expect(t.w).toBeCloseTo(0.7, 10);
    expect(t.b).toBeCloseTo(0.4, 10);
  });

  it('loss is the mean squared error', () => {
    expect(loss([{ x: 1, y: 1 }, { x: 2, y: 3 }], 0, 0)).toBeCloseTo((1 + 9) / 2, 10);
    expect(loss([{ x: 1, y: 2 }], 1, 1)).toBe(0);
  });

  it('α = 0.001 converges toward the closed-form least-squares solution (within 5%)', () => {
    const opt = closedForm(pts);
    const optLoss = loss(pts, opt.w, opt.b);
    const { history } = runEpochs(pts, 0.001, 30000);
    const last = history[history.length - 1];
    expect(Math.abs(last.w - opt.w) / Math.abs(opt.w)).toBeLessThan(0.05);
    expect(Math.abs(last.b - opt.b) / Math.abs(opt.b)).toBeLessThan(0.05);
    expect(last.loss).toBeLessThan(optLoss * 1.05);
    // and the loss actually goes downhill along the way
    expect(history[100].loss).toBeLessThan(history[0].loss);
  });

  it('α = 1 diverges: the loss grows instead of shrinking', () => {
    const { history } = runEpochs(pts, 1, 5);
    expect(history[5].loss).toBeGreaterThan(history[0].loss * 10);
  });

  it('the widget challenge is winnable: a sane α reaches 1.02× the optimum inside 30 epochs', () => {
    // same condition the DescentStepper challenge checks
    const opt = closedForm(pts);
    const target = loss(pts, opt.w, opt.b) * 1.02;
    const { history } = runEpochs(pts, 0.0008, 30);
    expect(Math.min(...history.map((h) => h.loss))).toBeLessThan(target);
  });

  it('runEpochs history has epochs + 1 entries, starting from w = 0, b = 0', () => {
    const { history } = runEpochs(pts, 0.0005, 12);
    expect(history).toHaveLength(13);
    expect(history[0].w).toBe(0);
    expect(history[0].b).toBe(0);
    expect(history[0].loss).toBeCloseTo(loss(pts, 0, 0), 10);
  });
});

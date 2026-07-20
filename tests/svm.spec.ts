import { describe, it, expect } from 'vitest';
import {
  fitLinearSvm,
  decisionLinear,
  fitKernelPerceptron,
  predictKernel,
  rbfKernel,
  type LabeledPoint,
} from '../src/lib/ml/svm';
import { rings } from '../src/content/datasets/rings';

const separable: LabeledPoint[] = [
  { x: 1.5, y: 2.0, label: -1 },
  { x: 2.0, y: 1.2, label: -1 },
  { x: 2.5, y: 2.6, label: -1 },
  { x: 1.0, y: 3.0, label: -1 },
  { x: 3.0, y: 1.5, label: -1 },
  { x: 2.0, y: 2.5, label: -1 },
  { x: 7.0, y: 8.0, label: 1 },
  { x: 8.0, y: 7.5, label: 1 },
  { x: 8.5, y: 8.5, label: 1 },
  { x: 7.5, y: 7.0, label: 1 },
  { x: 9.0, y: 8.0, label: 1 },
  { x: 8.0, y: 9.0, label: 1 },
];

describe('linear soft-margin SVM (subgradient descent)', () => {
  it('reaches 100% training accuracy on a linearly separable toy set', () => {
    const model = fitLinearSvm(separable, 10, 800, 0.02);
    for (const p of separable) {
      expect(p.label * decisionLinear(model, p.x, p.y)).toBeGreaterThan(0);
    }
  });

  it('a larger C pushes hinge violations down', () => {
    const soft = fitLinearSvm(separable, 0.01, 800, 0.02);
    const hard = fitLinearSvm(separable, 50, 800, 0.02);
    const totalHinge = (m: { w: [number, number]; b: number }) =>
      separable.reduce(
        (s, p) => s + Math.max(0, 1 - p.label * decisionLinear(m, p.x, p.y)),
        0,
      );
    expect(totalHinge(hard)).toBeLessThanOrEqual(totalHinge(soft) + 1e-9);
  });
});

describe('RBF kernel perceptron', () => {
  it('rbf kernel is 1 at zero distance and decays', () => {
    expect(rbfKernel(3, 4, 3, 4, 0.5)).toBeCloseTo(1, 9);
    expect(rbfKernel(0, 0, 2, 0, 0.5)).toBeCloseTo(Math.exp(-2), 9);
  });

  it('classifies >90% of the rings dataset (a circle boundary)', () => {
    const data = rings();
    const alphas = fitKernelPerceptron(data, 0.8, 60);
    let correct = 0;
    for (const p of data) {
      const s = predictKernel(data, alphas, 0.8, p.x, p.y);
      if (p.label * s > 0) correct++;
    }
    expect(correct / data.length).toBeGreaterThan(0.9);
  });
});

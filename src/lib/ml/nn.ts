/**
 * Tiny dependency-free multilayer perceptron for TinyNetLab.
 *
 * Architecture: arbitrary layer sizes, tanh on hidden layers, sigmoid on the
 * single output unit, binary cross-entropy loss. Training is one pass of
 * per-example backprop per `trainBatch` call (deterministic: examples are
 * visited in the order given, no shuffling). Everything is plain arrays and
 * loops so a 2→8→1 net on ≤200 points runs hundreds of epochs per frame.
 */
import { mulberry32 } from '../rng';

export interface Net {
  /** layer sizes including input, e.g. [2, 4, 1] */
  sizes: number[];
  /** weights[l][u][i] — non-input layer l, unit u, incoming weight from unit i */
  weights: number[][][];
  /** biases[l][u] */
  biases: number[][];
}

export interface Sample {
  x: [number, number];
  /** class: 0 or 1 */
  y: number;
}

/** Seeded init: uniform weights scaled by fan-in, small random biases. */
export function createNet(sizes: number[], seed: number): Net {
  const rand = mulberry32(seed);
  const weights: number[][][] = [];
  const biases: number[][] = [];
  for (let l = 1; l < sizes.length; l++) {
    const fanIn = sizes[l - 1];
    const scale = 1.6 / Math.sqrt(fanIn);
    const W: number[][] = [];
    const b: number[] = [];
    for (let u = 0; u < sizes[l]; u++) {
      const row: number[] = [];
      for (let i = 0; i < fanIn; i++) row.push((rand() * 2 - 1) * scale);
      W.push(row);
      b.push((rand() * 2 - 1) * 0.1);
    }
    weights.push(W);
    biases.push(b);
  }
  return { sizes: sizes.slice(), weights, biases };
}

const sigmoid = (z: number): number => 1 / (1 + Math.exp(-z));

/**
 * Forward pass. Returns the activation vector of every layer:
 * result[0] is the input itself, result[L] the output layer (sigmoid).
 */
export function forward(net: Net, input: number[]): number[][] {
  const L = net.weights.length;
  const acts: number[][] = [input.slice()];
  for (let l = 0; l < L; l++) {
    const prev = acts[l];
    const W = net.weights[l];
    const b = net.biases[l];
    const out: number[] = new Array(W.length);
    for (let u = 0; u < W.length; u++) {
      let z = b[u];
      const row = W[u];
      for (let i = 0; i < row.length; i++) z += row[i] * prev[i];
      out[u] = l === L - 1 ? sigmoid(z) : Math.tanh(z);
    }
    acts.push(out);
  }
  return acts;
}

/**
 * One epoch of backprop (chain-rule gradient descent) over the batch,
 * updating after each example. Mutates `net` in place and returns the
 * mean binary cross-entropy over the epoch.
 */
export function trainBatch(net: Net, batch: Sample[], lr: number): number {
  const L = net.weights.length;
  let lossSum = 0;
  for (const s of batch) {
    const acts = forward(net, s.x);
    const p = acts[L][0];
    const pc = Math.min(1 - 1e-7, Math.max(1e-7, p));
    lossSum -= s.y * Math.log(pc) + (1 - s.y) * Math.log(1 - pc);

    // sigmoid + cross-entropy: dLoss/dz at the output is simply (p − y)
    let deltas: number[] = [p - s.y];
    for (let l = L - 1; l >= 0; l--) {
      const prev = acts[l];
      const W = net.weights[l];
      const b = net.biases[l];

      // propagate error to the previous layer BEFORE touching this layer's weights
      let prevDeltas: number[] | null = null;
      if (l > 0) {
        prevDeltas = new Array<number>(prev.length).fill(0);
        for (let u = 0; u < W.length; u++) {
          const row = W[u];
          const d = deltas[u];
          for (let i = 0; i < prev.length; i++) prevDeltas[i] += row[i] * d;
        }
        // tanh'(z) expressed through the activation: 1 − a²
        for (let i = 0; i < prev.length; i++) prevDeltas[i] *= 1 - prev[i] * prev[i];
      }

      for (let u = 0; u < W.length; u++) {
        const row = W[u];
        const d = deltas[u];
        for (let i = 0; i < prev.length; i++) row[i] -= lr * d * prev[i];
        b[u] -= lr * d;
      }
      if (prevDeltas) deltas = prevDeltas;
    }
  }
  return lossSum / batch.length;
}

/** Fraction of samples whose thresholded output (≥ 0.5 → 1) matches the label. */
export function accuracy(net: Net, data: Sample[]): number {
  if (data.length === 0) return 0;
  const L = net.weights.length;
  let correct = 0;
  for (const s of data) {
    const p = forward(net, s.x)[L][0];
    if ((p >= 0.5 ? 1 : 0) === s.y) correct++;
  }
  return correct / data.length;
}

/** Total number of trainable parameters (all weights + all biases). */
export function paramCount(net: Net): number {
  let n = 0;
  for (let l = 0; l < net.weights.length; l++) {
    for (const row of net.weights[l]) n += row.length;
    n += net.biases[l].length;
  }
  return n;
}

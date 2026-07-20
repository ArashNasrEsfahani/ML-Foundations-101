/** Typed content model — every lesson, quiz and widget reference is data conforming to this. */

/** markdown-lite: **bold**, *em*, `code`, $tex$ */
export type Inline = string;

export type WidgetId =
  // ch1-2
  | 'TaskSorter'
  | 'SpamLine'
  | 'SigmaExpander'
  | 'SlopeExplorer'
  | 'BayesBoxes'
  | 'VectorBoard'
  // ch3-4
  | 'RegressionLab'
  | 'SigmoidExplorer'
  | 'TreeBuilder'
  | 'MarginPlayground'
  | 'KnnPainter'
  | 'DescentStepper'
  // ch5-6
  | 'FeatureBench'
  | 'OverfitLab'
  | 'ThresholdRoc'
  | 'CvAnimator'
  | 'NeuronBuilder'
  | 'TinyNetLab'
  | 'ConvScrubber'
  // ch7-8
  | 'EnsembleSandbox'
  | 'BoostingStepper'
  | 'ActiveLearner'
  | 'ImbalanceLab'
  // ch9-10
  | 'KmeansStepper'
  | 'DbscanExplorer'
  | 'PcaProjector'
  | 'KdeBandwidth'
  | 'WordSpace';

export interface Challenge {
  id: string;
  label: string;
  xp: number;
}

export type Block =
  | { type: 'p'; md: Inline }
  | { type: 'math'; tex: string }
  | {
      type: 'formula';
      tex: string;
      terms: { tex: string; explain: string }[];
    }
  | { type: 'list'; items: Inline[]; ordered?: boolean }
  | { type: 'code'; lang: 'python'; code: string; caption?: string }
  | { type: 'hint'; md: Inline }
  | { type: 'figure'; render: string; caption?: Inline }
  | { type: 'widget'; id: WidgetId; props?: Record<string, unknown>; challenge?: Challenge }
  | { type: 'quiz'; id: string; questions: Question[] };

export type Question =
  | { kind: 'mcq'; id: string; prompt: Inline; choices: Inline[]; answer: number; explain: Inline }
  | { kind: 'multi'; id: string; prompt: Inline; choices: Inline[]; answers: number[]; explain: Inline }
  | { kind: 'tf'; id: string; prompt: Inline; answer: boolean; explain: Inline }
  | { kind: 'numeric'; id: string; prompt: Inline; answer: number; tolerance: number; explain: Inline }
  | { kind: 'match'; id: string; prompt: Inline; pairs: [Inline, Inline][]; explain: Inline }
  /** items given in correct order; presented shuffled */
  | { kind: 'order'; id: string; prompt: Inline; items: Inline[]; explain: Inline };

export interface Section {
  id: string; // 'ch01-what-is-ml'
  title: string;
  minutes: number;
  blocks: Block[];
}

export interface Chapter {
  id: string; // 'ch01'
  number: number;
  title: string;
  subtitle: string;
  /** authoring reference only, never shown */
  pdfPages: [number, number];
  sections: Section[];
  bossPool: Question[];
  badgeId: string;
  /** optional: this chapter also unlocks when `softPrereq` chapter's boss is passed */
  softPrereq?: string;
}

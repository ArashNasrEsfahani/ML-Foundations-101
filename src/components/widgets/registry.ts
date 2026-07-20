import type React from 'react';
import type { WidgetId, Challenge } from '../../content/schema';
import { TaskSorter } from './TaskSorter/TaskSorter';
import { SpamLine } from './SpamLine/SpamLine';
import { SigmaExpander } from './SigmaExpander/SigmaExpander';
import { SlopeExplorer } from './SlopeExplorer/SlopeExplorer';
import { BayesBoxes } from './BayesBoxes/BayesBoxes';
import { OverfitLab } from './OverfitLab/OverfitLab';
import { ThresholdRoc } from './ThresholdRoc/ThresholdRoc';
import { CvAnimator } from './CvAnimator/CvAnimator';
import { DescentStepper } from './DescentStepper/DescentStepper';
import { TinyNetLab } from './TinyNetLab/TinyNetLab';
import { ConvScrubber } from './ConvScrubber/ConvScrubber';
import { RegressionLab } from './RegressionLab/RegressionLab';
import { SigmoidExplorer } from './SigmoidExplorer/SigmoidExplorer';
import { TreeBuilder } from './TreeBuilder/TreeBuilder';
import { MarginPlayground } from './MarginPlayground/MarginPlayground';
import { KnnPainter } from './KnnPainter/KnnPainter';
import { KmeansStepper } from './KmeansStepper/KmeansStepper';
import { DbscanExplorer } from './DbscanExplorer/DbscanExplorer';
import { PcaProjector } from './PcaProjector/PcaProjector';
import { WordSpace } from './WordSpace/WordSpace';
import { EnsembleSandbox } from './EnsembleSandbox/EnsembleSandbox';
import { BoostingStepper } from './BoostingStepper/BoostingStepper';
import { ImbalanceLab } from './ImbalanceLab/ImbalanceLab';

export interface WidgetProps {
  challenge?: Challenge;
  props?: Record<string, unknown>;
}

/**
 * WidgetId → component. Widgets are added here as they are built;
 * BlockRenderer falls back to a "coming soon" card for unregistered ids.
 */
export const widgetRegistry: Partial<Record<WidgetId, React.ComponentType<WidgetProps>>> = {
  TaskSorter,
  SpamLine,
  SigmaExpander,
  SlopeExplorer,
  BayesBoxes,
  OverfitLab,
  ThresholdRoc,
  CvAnimator,
  DescentStepper,
  TinyNetLab,
  ConvScrubber,
  RegressionLab,
  SigmoidExplorer,
  TreeBuilder,
  MarginPlayground,
  KnnPainter,
  KmeansStepper,
  DbscanExplorer,
  PcaProjector,
  WordSpace,
  EnsembleSandbox,
  BoostingStepper,
  ImbalanceLab,
};

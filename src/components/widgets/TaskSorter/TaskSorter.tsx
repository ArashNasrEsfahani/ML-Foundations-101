import React from 'react';
import { ClassifySort } from '../ClassifySort';
import type { WidgetProps } from '../registry';

const BUCKETS = ['Supervised', 'Unsupervised', 'Semi-supervised', 'Reinforcement'];

const CARDS = [
  { text: 'Predict house prices from 5,000 sold houses with known prices.', bucket: 0 },
  { text: 'Flag credit-card fraud using a history of transactions labeled fraud / legit.', bucket: 0 },
  { text: 'Group customers into segments — no one has labeled the customers.', bucket: 1 },
  { text: 'Detect unusual server behavior given only normal traffic logs.', bucket: 1 },
  { text: '500 labeled X-rays plus 50,000 unlabeled ones — use both to build a diagnoser.', bucket: 2 },
  { text: 'A small set of tagged emails and a huge untagged archive, combined for training.', bucket: 2 },
  { text: 'Teach an agent to win at chess by playing and receiving win/lose rewards.', bucket: 3 },
  { text: 'A robot learns to walk by trying actions and being rewarded for moving forward.', bucket: 3 },
];

export function TaskSorter({ challenge }: WidgetProps) {
  return (
    <ClassifySort
      title="Sort the learning problems"
      buckets={BUCKETS}
      cards={CARDS}
      challenge={challenge}
    />
  );
}

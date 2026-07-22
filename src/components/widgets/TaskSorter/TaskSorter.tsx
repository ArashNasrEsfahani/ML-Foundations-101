import React from 'react';
import { ClassifySort } from '../ClassifySort';
import type { GuideEntry } from '../WidgetFrame';
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

/** the four piles are the four answers, so each one needs saying in its own right */
const GUIDE: GuideEntry[] = [
  {
    control: 'Supervised',
    what: 'For problems where every training example already carries the answer you want to predict. The give-away wording is *labeled*, *known prices*, *tagged as fraud or legit*.',
  },
  {
    control: 'Unsupervised',
    what: 'For problems with no answers at all — the model has to find structure on its own. The give-away is *no one has labeled*, or a description that names groups without naming which group.',
  },
  {
    control: 'Semi-supervised',
    what: 'For problems with a small labeled set and a much larger unlabeled one, used together. Look for two numbers in the same sentence, one of them far bigger and unlabeled.',
  },
  {
    control: 'Reinforcement',
    what: 'For problems where no example exists up front and the model learns from the consequences of its own actions. The give-away is a *reward*, a *win/lose* signal, or trying something and finding out.',
  },
];

export function TaskSorter({ challenge }: WidgetProps) {
  return (
    <ClassifySort
      title="Sort the learning problems"
      intro={
        <>
          Eight real jobs, four families of learning problem. What decides the answer is not the
          subject matter but what the data comes with: answers attached, no answers, a few
          answers, or only the consequences of acting.
        </>
      }
      guide={GUIDE}
      buckets={BUCKETS}
      cards={CARDS}
      challenge={challenge}
    />
  );
}

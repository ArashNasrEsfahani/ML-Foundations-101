import type { Chapter } from '../schema';

/** Chapter 5 — Basic Practice (book pp. 44–61), paraphrased in original words. */
export const ch05: Chapter = {
  id: 'ch05',
  number: 5,
  title: 'Basic Practice',
  subtitle: 'Features, overfitting, metrics, and tuning',
  pdfPages: [44, 61],
  badgeId: 'ch05',
  sections: [
    {
      id: 'ch05-feature-engineering',
      title: 'Turning Raw Data into Features',
      minutes: 8,
      blocks: [
        {
          type: 'p',
          md:
            'Real projects never hand you a ready-to-train dataset. You get logs, spreadsheets, text — raw material. **Feature engineering** is the craft of turning that raw material into feature vectors, and it eats most of a data analyst’s time and creativity. The goal is *informative* features: ones with high **predictive power**, so that a model built on them predicts labels well. A model that already does well on its own training data is said to have **low bias** — good features make that possible.',
        },
        {
          type: 'p',
          md:
            'Some algorithms only digest numbers, so categorical features need converting. The standard trick is **one-hot encoding**: a category with three values becomes three binary features —',
        },
        {
          type: 'list',
          items: ['red $= [1, 0, 0]$', 'yellow $= [0, 1, 0]$', 'green $= [0, 0, 1]$'],
        },
        {
          type: 'p',
          md:
            'Why not just write red $=1$, yellow $=2$, green $=3$ and keep one feature? Because numbers carry an *order*: 2 sits between 1 and 3, and yellow would suddenly sit “between” red and green. If the categories have no real order, the algorithm will hunt for a regularity that doesn’t exist — a shortcut to overfitting. One-hot costs extra dimensions but tells no lies. (If the values *are* ordered, like poor/decent/good/excellent, plain numbers 1–4 are fine.)',
        },
        {
          type: 'p',
          md:
            'The opposite move is **binning** (bucketing): chop a numeric feature into ranges and encode which bin the value falls into — ages 0–5 in one bin, 6–10 in the next, and so on. A well-chosen binning hands the algorithm a useful hint — *within this range, the exact value doesn’t matter* — which can let it learn from fewer examples.',
        },
        {
          type: 'p',
          md:
            'Numeric features also come in wildly different ranges, and that hurts gradient-based training: if $x^{(1)}$ lives in $[0, 1000]$ and $x^{(2)}$ in $[0, 0.0001]$, the derivative with respect to the big feature dominates every update. **Normalization** squeezes a feature into a standard range such as $[0, 1]$:',
        },
        {
          type: 'formula',
          tex: '\\bar{x}^{(j)} = \\frac{x^{(j)} - min^{(j)}}{max^{(j)} - min^{(j)}}',
          terms: [
            { tex: '\\bar{x}^{(j)}', explain: 'the rescaled value, now between 0 and 1' },
            { tex: 'x^{(j)}', explain: 'the raw value of feature j for this example' },
            { tex: 'min^{(j)}', explain: 'the smallest value feature j takes anywhere in the dataset' },
            { tex: 'max^{(j)}', explain: 'the largest value of feature j in the dataset' },
          ],
        },
        {
          type: 'p',
          md:
            '**Standardization** (z-score normalization) instead rescales a feature so it has mean $0$ and standard deviation $1$, like a standard normal distribution:',
        },
        {
          type: 'formula',
          tex: '\\hat{x}^{(j)} = \\frac{x^{(j)} - \\mu^{(j)}}{\\sigma^{(j)}}',
          terms: [
            { tex: '\\hat{x}^{(j)}', explain: 'the z-score: how many standard deviations above (or below) the mean this value sits' },
            { tex: '\\mu^{(j)}', explain: 'the mean of feature j, averaged over all examples' },
            { tex: '\\sigma^{(j)}', explain: 'the standard deviation of feature j from that mean' },
          ],
        },
        {
          type: 'list',
          items: [
            'Prefer **standardization** for unsupervised learning, for bell-curve-shaped features, and for features with extreme outliers (normalization would squash all the normal values into a tiny sliver of the range).',
            'Otherwise, **normalization** is the usual default — and when in doubt, try both and keep the winner.',
          ],
        },
        {
          type: 'p',
          md:
            'Finally, real datasets have holes: some examples arrive with **missing feature values**. Your options: drop those examples (affordable only if data is plentiful), use an algorithm that tolerates gaps, or fill the holes with a **data imputation** technique — replace the gap with the feature’s dataset-wide *mean*; with a value *outside* the normal range (so the model can learn “this was missing”); with a mid-range value (so it barely influences the prediction); or even train a small regression model that predicts the missing feature from the other features. With lots of data, you can also add a binary *was-it-missing* indicator feature.',
        },
        {
          type: 'hint',
          md:
            'Whatever imputation you pick, apply the **same** technique to incomplete examples at prediction time. And since you can’t know in advance which technique works best, try several and keep the one that scores highest — imputation is one more thing to tune.',
        },
        {
          type: 'quiz',
          id: 'ch05-q-features',
          questions: [
            {
              kind: 'mcq',
              id: 'ch05-q-features-1',
              prompt: 'Why is encoding red $=1$, yellow $=2$, green $=3$ a bad idea for an unordered category?',
              choices: [
                'It invents an order, so the algorithm chases a pattern that isn’t there',
                'Learning algorithms can only accept features that are already binary',
                'It costs three extra dimensions that the model has to fit weights for',
                'The original color names cannot be recovered from the encoded values',
              ],
              answer: 0,
              explain:
                'Numbers are ordered; unordered categories aren’t. Writing 1/2/3 puts yellow “between” red and green, and the algorithm will hunt for a regularity that doesn’t exist. One-hot encoding *spends* three dimensions precisely to avoid smuggling in that fake ordering — the cost is the price, not the problem.',
            },
            {
              kind: 'numeric',
              id: 'ch05-q-features-2',
              prompt:
                'A feature naturally ranges from $350$ to $1450$. Normalize the value $900$ into $[0,1]$.',
              answer: 0.5,
              tolerance: 0.01,
              explain: '$(900 - 350) / (1450 - 350) = 550 / 1100 = 0.5$ — dead center of the range, so 0.5.',
            },
            {
              kind: 'match',
              id: 'ch05-q-features-3',
              prompt: 'Match each technique to what it does:',
              pairs: [
                ['One-hot encoding', 'turns one categorical feature into several binary features'],
                ['Binning', 'turns a numeric feature into range-based buckets'],
                ['Standardization', 'rescales a feature to mean 0 and standard deviation 1'],
                ['Mean imputation', 'fills a missing value with the feature’s average'],
              ],
              explain:
                'Four everyday feature-engineering moves: categories → binaries, numbers → buckets, rescaling, and hole-filling.',
            },
            {
              kind: 'tf',
              id: 'ch05-q-features-4',
              prompt: 'A model cannot be trained at all unless every feature is normalized first.',
              answer: false,
              explain:
                'Rescaling is not a strict requirement — it mainly speeds up learning and avoids numeric overflow. Modern library implementations are fairly robust to mixed ranges.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch05-three-sets',
      title: 'Three Sets, Not One',
      minutes: 5,
      blocks: [
        {
          type: 'p',
          md:
            'So far “dataset” and “training set” were used as synonyms. In practice you carve your labeled data into **three** parts: a **training set**, a **validation set**, and a **test set**. First **shuffle** the examples, *then* split — otherwise a sorted file (say, all spam first) would send whole classes into one subset. The training set is the big slice; the two **holdout sets** are smaller, roughly equal, and the learning algorithm is *forbidden* from touching them while building the model.',
        },
        {
          type: 'p',
          md:
            'Why can’t you just evaluate on the training data? Because a model that simply memorizes every training example would score perfectly and be useless. What you actually care about is performance on examples the algorithm never saw — that’s the whole point of building a model.',
        },
        {
          type: 'p',
          md:
            'And why *two* holdout sets? Because they answer different questions. The **validation set** is your workbench: you use it to compare learning algorithms and to pick hyperparameter values. But all that picking slowly leaks information — the winner is partly tuned *to* the validation set. So you keep a **test set** locked away and open it only once, at the end, to honestly assess the model before it ships.',
        },
        {
          type: 'p',
          md:
            'Splits are a judgment call, not a law. The old rule of thumb is **70% / 15% / 15%**. With millions of examples, holding out 15% twice is wasteful — **95% / 2.5% / 2.5%** still leaves tens of thousands of holdout examples.',
        },
        {
          type: 'hint',
          md:
            'The validation and test sets are together called **holdout sets** — held out of training, held in reserve for judgment.',
        },
        {
          type: 'quiz',
          id: 'ch05-q-sets',
          questions: [
            {
              kind: 'order',
              id: 'ch05-q-sets-1',
              prompt: 'Put the workflow in the right order:',
              items: [
                'Shuffle the labeled examples',
                'Split them into training, validation, and test sets',
                'Train candidate models on the training set',
                'Compare candidates and tune hyperparameters on the validation set',
                'Assess the final model once on the test set',
              ],
              explain:
                'Shuffle before splitting, train on the big slice, choose on validation, and spend the test set exactly once at the very end.',
            },
            {
              kind: 'mcq',
              id: 'ch05-q-sets-2',
              prompt: 'What is the validation set for?',
              choices: [
                'Choosing between learning algorithms and tuning hyperparameter values',
                'Adding examples the algorithm can train on once the training set runs out',
                'Holding the examples whose feature values are incomplete or missing',
                'Reporting the final unbiased performance number before the model ships',
              ],
              answer: 0,
              explain:
                'Validation is the workbench for model selection and tuning. The final unbiased verdict is the *test* set’s job — using validation for it would report a number the model was tuned against. And no holdout set is ever fed back into training.',
            },
            {
              kind: 'tf',
              id: 'ch05-q-sets-3',
              prompt: 'It’s fine to tune hyperparameters against the test set, as long as you do it carefully.',
              answer: false,
              explain:
                'Every tuning decision leaks information about the set it’s tuned on. Once the test set influences your choices, it can no longer give an unbiased final assessment.',
            },
            {
              kind: 'mcq',
              id: 'ch05-q-sets-4',
              prompt: 'Your dataset has 40 million labeled examples. A sensible split is:',
              choices: [
                '95% training / 2.5% validation / 2.5% test',
                '33% training / 33% validation / 34% test',
                '15% training / 70% validation / 15% test',
                '100% training — holdouts are unnecessary at this scale',
              ],
              answer: 0,
              explain:
                'At big-data scale, 2.5% is still a million examples — plenty for judging. Keep the rest for training. Holdouts are never optional.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch05-overfitting',
      title: 'Underfitting and Overfitting',
      minutes: 8,
      blocks: [
        {
          type: 'p',
          md:
            'A model that makes many mistakes *on its own training data* has **high bias** — it **underfits**. Two usual suspects: the model is too simple for the shape of the data (a straight line forced through a curved cloud), or the features don’t carry enough signal (predicting cancer from height and blood pressure — no model can conjure a relationship that isn’t there). The fixes are symmetric: use a more expressive model, or engineer more informative features.',
        },
        {
          type: 'p',
          md:
            'The opposite disease is **overfitting**: excellent on training data, poor on holdout data. Statisticians call it **high variance** — resample the training set and you’d get a noticeably different model, because the model is bending itself around the *specific* noise, quirks, and sampling accidents of the examples it happened to see. Typical causes: a model too complex for the data (very deep trees, big neural networks), or too many features for too few examples. Even a plain linear model overfits happily when dimensions vastly outnumber examples.',
        },
        {
          type: 'p',
          md:
            'Polynomial regression makes the whole tradeoff visible with one knob: the **degree** is the model’s capacity. Degree 1 is a stiff ruler — it underfits a wavy dataset. Around the right degree, the curve follows the underlying shape. Push the degree high enough and the polynomial has spare capacity to thread through every noisy point — training error keeps melting toward zero while validation error takes off. Try it:',
        },
        {
          type: 'widget',
          id: 'OverfitLab',
          challenge: {
            id: 'ch05-challenge-overfit',
            label: 'find the degree with the lowest validation error',
            xp: 15,
          },
        },
        {
          type: 'p',
          md:
            'Notice what the widget teaches: you **cannot** diagnose overfitting from training error — it only ever improves with capacity. The dashed validation curve is the honest signal, and its minimum marks the capacity that matches your data.',
        },
        {
          type: 'list',
          items: [
            'If a model **overfits**, you can: pick a simpler model, reduce the dimensionality of the data, gather more training examples, or *regularize* — the most widely used cure, coming next.',
            'If a model **underfits**, go the other way: more capacity, or better features.',
          ],
        },
        {
          type: 'quiz',
          id: 'ch05-q-fit',
          questions: [
            {
              kind: 'mcq',
              id: 'ch05-q-fit-1',
              prompt: 'Training error is very low, but validation error is much higher. Diagnosis?',
              choices: [
                'Overfitting — the model learned the training set’s noise and quirks',
                'Underfitting — the model is too simple to capture the real pattern',
                'A broken split — the validation set must have been drawn differently',
                'A healthy fit — low training error is exactly what you are aiming for',
              ],
              answer: 0,
              explain:
                'A big train-to-holdout gap is the signature of overfitting (high variance): great memory, poor generalization. Underfitting would show high error on *both* sets, and low training error alone is never the goal — a lookup table achieves it.',
            },
            {
              kind: 'tf',
              id: 'ch05-q-fit-2',
              prompt:
                'Even a plain linear model can overfit — for example when the data has very many features but few training examples.',
              answer: true,
              explain:
                'With more dimensions than examples, a linear model can assign nonzero weights to enough features to fit the training set perfectly — including its noise.',
            },
            {
              kind: 'match',
              id: 'ch05-q-fit-3',
              prompt: 'Match the diagnosis to its symptom:',
              pairs: [
                ['High bias (underfitting)', 'many mistakes even on the training data'],
                ['High variance (overfitting)', 'training looks great, holdout data looks bad'],
                ['Good fit', 'low error on training and validation alike'],
              ],
              explain:
                'Bias = can’t even fit what it saw; variance = fits what it saw too literally; a good fit balances the two.',
            },
            {
              kind: 'mcq',
              id: 'ch05-q-fit-4',
              prompt: 'Which pair of moves addresses *underfitting*?',
              choices: [
                'Use a more expressive model, or engineer features with more signal',
                'Drop the noisiest training examples, or delete the weakest features',
                'Lower the polynomial degree, or add a stronger regularization penalty',
                'Reshuffle and re-split the data, or enlarge the validation set',
              ],
              answer: 0,
              explain:
                'Underfitting means not enough capacity or not enough signal — so add capacity or add signal. Cutting examples, cutting features, lowering the degree and regularizing all *reduce* capacity: they are medicine for the opposite disease. Reshuffling changes nothing about fit.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch05-regularization',
      title: 'Regularization',
      minutes: 6,
      blocks: [
        {
          type: 'p',
          md:
            '**Regularization** is an umbrella term for methods that push the learning algorithm toward a *less complex* model. You accept slightly higher bias in exchange for a big drop in variance — the famous **bias–variance tradeoff**. The mechanism is simple: add a penalty to the objective that grows when the model gets more complex, so the optimizer must now buy complexity with training-error savings.',
        },
        {
          type: 'p',
          md:
            'For linear regression, complexity lives in the weights. **L1 regularization** penalizes the sum of their absolute values:',
        },
        {
          type: 'formula',
          tex: '\\min_{\\mathbf{w},b}\\left[ C|\\mathbf{w}| + \\frac{1}{N}\\sum_{i=1}^{N}\\left(f_{\\mathbf{w},b}(\\mathbf{x}_i) - y_i\\right)^2 \\right]',
          terms: [
            { tex: 'C', explain: 'a hyperparameter you tune: how much simplicity matters relative to fitting the data' },
            { tex: '|\\mathbf{w}|', explain: 'the L1 penalty: |w^{(1)}| + |w^{(2)}| + … + |w^{(D)}|' },
            {
              tex: '\\frac{1}{N}\\sum_{i=1}^{N}(f_{\\mathbf{w},b}(\\mathbf{x}_i) - y_i)^2',
              explain: 'the ordinary training loss (mean squared error) from Chapter 3',
            },
          ],
        },
        {
          type: 'p',
          md: '**L2 regularization** penalizes the sum of *squared* weights instead:',
        },
        {
          type: 'formula',
          tex: '\\min_{\\mathbf{w},b}\\left[ C\\|\\mathbf{w}\\|^2 + \\frac{1}{N}\\sum_{i=1}^{N}\\left(f_{\\mathbf{w},b}(\\mathbf{x}_i) - y_i\\right)^2 \\right]',
          terms: [
            { tex: '\\|\\mathbf{w}\\|^2', explain: 'the L2 penalty: (w^{(1)})^2 + (w^{(2)})^2 + … + (w^{(D)})^2' },
            { tex: 'C', explain: 'again the knob: C = 0 recovers plain regression; huge C crushes all weights toward zero and underfits' },
          ],
        },
        {
          type: 'p',
          md:
            'Why do small weights mean a simpler model? Large weights let the function react violently to individual features — exactly the flexibility overfitting feeds on. Keeping weights small keeps the function smooth and boring, and boring generalizes. Your job as analyst is to tune $C$: enough regularization to tame the variance, not so much that bias explodes.',
        },
        {
          type: 'p',
          md:
            'The two penalties behave differently in a useful way. **L1** (called **lasso**) tends to drive many weights to *exactly zero*, producing a **sparse model** — effectively performing **feature selection** for free, which is great for explainability. **L2** (called **ridge**) shrinks weights smoothly without zeroing them, is differentiable (so gradient descent applies cleanly), and usually wins on pure holdout performance. **Elastic net** blends both. Neural networks add their own regularizers — **dropout**, **batch normalization** — plus non-mathematical tricks with a regularizing effect like **data augmentation** and **early stopping** (Chapter 8).',
        },
        {
          type: 'quiz',
          id: 'ch05-q-reg',
          questions: [
            {
              kind: 'mcq',
              id: 'ch05-q-reg-1',
              prompt: 'You want the model to automatically ignore most features. Which regularization?',
              choices: [
                'L1 — it drives many weights to exactly zero, switching features off',
                'L2 — it shrinks small weights all the way to zero the fastest',
                'Batch normalization — it rescales each layer’s inputs to drop features',
                'Any of them — all three penalties reduce the feature count equally',
              ],
              answer: 0,
              explain:
                'L1’s corners push weights to exactly 0, yielding a sparse model — feature selection for free. L2 shrinks weights smoothly *toward* zero but essentially never lands on it, so every feature stays in play, and batch normalization is a neural-network trick that removes nothing.',
            },
            {
              kind: 'tf',
              id: 'ch05-q-reg-2',
              prompt: 'Regularization typically increases bias a little in exchange for a significant reduction in variance.',
              answer: true,
              explain:
                'That’s the deal on offer: a slightly worse fit to the training data, a much more stable model on new data — the bias–variance tradeoff.',
            },
            {
              kind: 'mcq',
              id: 'ch05-q-reg-3',
              prompt: 'What happens if the regularization strength $C$ is set extremely high?',
              choices: [
                'Nearly all weights are crushed toward zero and the model underfits',
                'The penalty dominates, so the model fits the training noise even harder',
                'Training error is driven to exactly zero on every training example',
                'The decision surface bends, turning a linear model into a nonlinear one',
              ],
              answer: 0,
              explain:
                'A huge $C$ makes the penalty dominate the loss: the cheapest solution is a near-empty model — very simple, very biased. Overfitting and a zero training error are what happens with *too little* regularization, and no amount of $C$ changes the model’s functional form.',
            },
            {
              kind: 'match',
              id: 'ch05-q-reg-4',
              prompt: 'Match the name to the technique:',
              pairs: [
                ['Lasso', 'L1 — penalize absolute weight values'],
                ['Ridge', 'L2 — penalize squared weight values'],
                ['Elastic net', 'a combination of L1 and L2'],
              ],
              explain:
                'Lasso = L1 = sparsity; ridge = L2 = smooth shrinkage; elastic net mixes the two penalties.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch05-metrics',
      title: 'Scoring a Classifier',
      minutes: 9,
      blocks: [
        {
          type: 'p',
          md:
            'Once trained, a model faces the test set. For **regression** the ritual is short: check that the model beats the **mean model** (the baseline that always predicts the average label), then compare MSE on training versus test data — a test MSE *substantially higher* than the training MSE is the smell of overfitting. For **classification**, there’s a richer toolbox, and it all starts with one table.',
        },
        {
          type: 'p',
          md:
            'The **confusion matrix** crosses what was *true* with what was *predicted*. For spam detection, its four cells are:',
        },
        {
          type: 'list',
          items: [
            '**TP** (true positive) — spam, correctly flagged as spam',
            '**FN** (false negative) — spam that slipped through as normal mail',
            '**FP** (false positive) — a legitimate message wrongly flagged as spam',
            '**TN** (true negative) — normal mail, correctly left alone',
          ],
        },
        {
          type: 'p',
          md:
            'Two headline metrics fall straight out of the table. **Precision** asks: *of everything I flagged, how much was really spam?*',
        },
        {
          type: 'formula',
          tex: '\\text{precision} = \\frac{TP}{TP + FP}',
          terms: [
            { tex: 'TP', explain: 'correct positive predictions' },
            { tex: 'TP + FP', explain: 'everything the model predicted as positive — right or wrong' },
          ],
        },
        {
          type: 'p',
          md: '**Recall** asks the mirror question: *of all the real spam out there, how much did I catch?*',
        },
        {
          type: 'formula',
          tex: '\\text{recall} = \\frac{TP}{TP + FN}',
          terms: [
            { tex: 'TP', explain: 'the positives the model caught' },
            { tex: 'TP + FN', explain: 'all examples that are actually positive — caught or missed' },
          ],
        },
        {
          type: 'p',
          md:
            'The two pull against each other, and you almost always trade one for the other. Most classifiers output a confidence score, and you choose a **decision threshold**: predict positive only above it. Raise the threshold and the model flags less, more carefully — precision up, recall down. Lower it and the net widens — recall up, precision down. For spam you’d favor precision (a friend’s email in the spam folder hurts more than one spam getting through); for disease screening you’d favor recall.',
        },
        {
          type: 'p',
          md:
            '**Accuracy** $= \\frac{TP + TN}{TP + TN + FP + FN}$ is the fraction of all predictions that were right. It’s honest when all mistakes cost the same — and a liar when classes are imbalanced: with 99% non-spam, the do-nothing model that flags nothing scores 99% accuracy while catching zero spam. When mistakes differ in importance, use **cost-sensitive accuracy**: assign a cost to FP and to FN, multiply those two counts by their costs, then compute accuracy from the reweighted numbers.',
        },
        {
          type: 'p',
          md:
            'To see a classifier’s *whole* behavior instead of one threshold, sweep the threshold and plot the **ROC curve**: **TPR** $= \\frac{TP}{TP+FN}$ (identical to recall) against **FPR** $= \\frac{FP}{FP+TN}$. Threshold 0 flags everything — both rates hit 1. Threshold above every score flags nothing — both rates are 0. The **area under the curve (AUC)** compresses the picture to one number: 1.0 is a perfect ranking, 0.5 is coin-flipping, and below 0.5 means something is wired backwards. A good operating point is TPR close to 1 with FPR still near 0 — go find one:',
        },
        {
          type: 'widget',
          id: 'ThresholdRoc',
          challenge: {
            id: 'ch05-challenge-roc',
            label: 'hit TPR ≥ 0.9 with FPR ≤ 0.2',
            xp: 15,
          },
        },
        {
          type: 'hint',
          md:
            'ROC analysis needs a model that outputs scores or probabilities (logistic regression, neural nets, tree ensembles…). Metrics defined for two classes extend to many: pick one class as “positive”, lump the rest as “negative”, repeat per class.',
        },
        {
          type: 'quiz',
          id: 'ch05-q-metrics',
          questions: [
            {
              kind: 'numeric',
              id: 'ch05-q-metrics-1',
              prompt: 'A classifier produced $TP = 30$ and $FP = 10$. What is its precision?',
              answer: 0.75,
              tolerance: 0.01,
              explain: 'precision $= TP / (TP + FP) = 30 / 40 = 0.75$: three of every four flags were correct.',
            },
            {
              kind: 'mcq',
              id: 'ch05-q-metrics-2',
              prompt: 'When does accuracy become misleading?',
              choices: [
                'When one class vastly outnumbers the other',
                'When the model outputs scores rather than labels',
                'When the dataset was shuffled before splitting',
                'When precision and recall are equal',
              ],
              answer: 0,
              explain:
                'With 99% negatives, predicting “negative” always yields 99% accuracy and 0 usefulness. Imbalance is exactly when you reach for precision/recall or cost-sensitive accuracy.',
            },
            {
              kind: 'tf',
              id: 'ch05-q-metrics-3',
              prompt: 'Raising the decision threshold typically increases precision and decreases recall.',
              answer: true,
              explain:
                'A higher bar means fewer, more confident positive predictions: fewer false alarms (precision up), more misses (recall down).',
            },
            {
              kind: 'match',
              id: 'ch05-q-metrics-4',
              prompt: 'Match each confusion-matrix cell to the spam-filter event:',
              pairs: [
                ['TP', 'spam correctly sent to the spam folder'],
                ['FP', 'your friend’s message wrongly sent to the spam folder'],
                ['FN', 'spam that landed in your inbox'],
                ['TN', 'normal mail correctly delivered to the inbox'],
              ],
              explain:
                'True/false says whether the model was right; positive/negative says what it predicted. FP is the expensive one for spam filters.',
            },
            {
              kind: 'mcq',
              id: 'ch05-q-metrics-5',
              prompt: 'A model’s AUC is 0.5. What does that tell you?',
              choices: [
                'Its score ranking is no better than random guessing',
                'It classifies exactly half of the positives correctly',
                'It ranks every positive above every negative',
                'Its precision and recall both equal 0.5 as well',
              ],
              answer: 0,
              explain:
                'AUC 0.5 is the diagonal — the scores carry no ranking information at all. A perfect ranking (every positive above every negative) scores 1.0, and AUC pins down neither precision nor recall, both of which depend on the threshold you pick.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch05-tuning',
      title: 'Hyperparameter Tuning',
      minutes: 6,
      blocks: [
        {
          type: 'p',
          md:
            '**Hyperparameters** — $C$ for SVM or regularization, $\\epsilon$ and $d$ for ID3, $\\alpha$ for gradient descent — are the knobs the learning algorithm *doesn’t* set for itself. You, the analyst, must find good values experimentally. The simplest systematic recipe is **grid search**: pick a handful of candidate values per hyperparameter, train one model per *combination* on the training set, score each on the validation set, and keep the winner. With ranges you don’t know yet, sample on a logarithmic scale — $[0.001, 0.01, 0.1, 1, 10, 100, 1000]$ — then search more finely around the best cell. Only after all choosing is done do you confirm the final model on the test set.',
        },
        {
          type: 'p',
          md:
            'Grid search gets expensive fast — combinations multiply. **Random search** samples combinations from distributions you specify, with a fixed trial budget. **Bayesian optimization** goes further: it uses past results to decide which values to try next. There are also gradient-based and evolutionary tuning techniques, with library support for nearly any algorithm.',
        },
        {
          type: 'p',
          md:
            'One problem remains: what if you don’t have enough data to spare a decent validation set? **Cross-validation** simulates one. Keep a real test set aside; split the rest into $k$ equal **folds** (five is the everyday choice). Train $k$ times: each round holds out one fold as a temporary validation set and trains on the other $k-1$. Average the $k$ scores — that mean is your validation metric for the hyperparameter values being tried, and every example got to be validation data exactly once. When cross-validation has crowned the best hyperparameters, retrain once on *all* the training data with those values, then assess on the untouched test set.',
        },
        {
          type: 'widget',
          id: 'CvAnimator',
          challenge: {
            id: 'ch05-challenge-cv',
            label: 'run a full 5-fold round',
            xp: 15,
          },
        },
        {
          type: 'quiz',
          id: 'ch05-q-tuning',
          questions: [
            {
              kind: 'mcq',
              id: 'ch05-q-tuning-1',
              prompt: 'What separates a hyperparameter from a parameter?',
              choices: [
                'Parameters are learned from data; hyperparameters are set by you',
                'Hyperparameters must be whole numbers; parameters may be any real',
                'Parameters exist only in neural networks; other models have none',
                'Nothing — the two words name the same thing in different books',
              ],
              answer: 0,
              explain:
                'The algorithm optimizes $\\mathbf{w}$ and $b$ for you; nobody optimizes $C$ or $\\alpha$ unless *you* run the search. Hyperparameters are routinely real-valued ($\\alpha = 0.001$), and every model from linear regression up has parameters.',
            },
            {
              kind: 'numeric',
              id: 'ch05-q-tuning-2',
              prompt:
                'Grid search over 7 candidate values of $C$ and 2 kernel choices trains how many models (one per combination)?',
              answer: 14,
              tolerance: 0,
              explain: '$7 \\times 2 = 14$ combinations — this multiplication is why grids blow up with more hyperparameters.',
            },
            {
              kind: 'order',
              id: 'ch05-q-tuning-3',
              prompt: 'Order one round of $k$-fold cross-validation for a given hyperparameter setting:',
              items: [
                'Fix the hyperparameter values to evaluate',
                'Split the training data into k equal folds',
                'Train on k−1 folds, score on the held-out fold',
                'Rotate until every fold has been held out once',
                'Average the k scores into one validation metric',
              ],
              explain:
                'Fix → split → train/score → rotate → average. The average plays the role a real validation set would.',
            },
            {
              kind: 'tf',
              id: 'ch05-q-tuning-4',
              prompt: 'In 5-fold cross-validation, every training example is used for validation exactly once.',
              answer: true,
              explain:
                'Each example belongs to exactly one fold, and each fold is held out exactly once — that’s what makes the averaged score trustworthy.',
            },
          ],
        },
      ],
    },
  ],
  bossPool: [
    {
      kind: 'mcq',
      id: 'ch05-boss-1',
      prompt: 'One-hot encoding exists because…',
      choices: [
        'unordered categories must not be mapped onto ordered numbers',
        'learning algorithms cannot process more than ten distinct categories',
        'binary features are trained faster than real-valued features are',
        'it reduces the dimensionality of the resulting feature vector',
      ],
      answer: 0,
      explain:
        'Mapping red/yellow/green to 1/2/3 invents an order the data doesn’t have, tempting the algorithm to fit a phantom pattern. One-hot spends dimensions to stay truthful — note it *raises* dimensionality rather than lowering it, and speed is not the argument.',
    },
    {
      kind: 'mcq',
      id: 'ch05-boss-2',
      prompt: 'Binning (bucketing) a numeric feature can help the algorithm because…',
      choices: [
        'it signals that exact values inside a range do not matter',
        'it always raises accuracy, whatever bin boundaries you choose',
        'it removes outliers by discarding values outside the bins',
        'it turns categorical features into numbers the model can use',
      ],
      answer: 0,
      explain:
        'A thoughtful binning bakes domain knowledge into the features: “anywhere in this range is the same situation” — a hint that can let the algorithm learn from fewer examples. Badly chosen boundaries can hurt instead; outliers land in the end bins rather than vanishing; and binning runs the *other* direction, numbers to categories.',
    },
    {
      kind: 'numeric',
      id: 'ch05-boss-3',
      prompt:
        'A feature has mean $\\mu = 70$ and standard deviation $\\sigma = 8$. Compute the z-score of the value $86$.',
      answer: 2,
      tolerance: 0.01,
      explain: '$\\hat{x} = (86 - 70) / 8 = 16 / 8 = 2$: the value sits two standard deviations above the mean.',
    },
    {
      kind: 'numeric',
      id: 'ch05-boss-4',
      prompt: 'A feature ranges from $20$ to $120$. Normalize the value $45$ into $[0, 1]$.',
      answer: 0.25,
      tolerance: 0.01,
      explain: '$(45 - 20) / (120 - 20) = 25 / 100 = 0.25$ — a quarter of the way up the range.',
    },
    {
      kind: 'mcq',
      id: 'ch05-boss-5',
      prompt: 'Which feature is the strongest candidate for *standardization* rather than normalization?',
      choices: [
        'One with a few extreme outliers among otherwise ordinary values',
        'One already spread uniformly across the interval from 0 to 1',
        'One that only ever takes the two binary values 0 and 1',
        'One with no missing values anywhere in the training data',
      ],
      answer: 0,
      explain:
        'Min-max normalization lets the outliers define $min$ and $max$, squeezing every ordinary value into a sliver of $[0,1]$. Standardization rescales by the mean and standard deviation instead, so outliers stretch the tail rather than crushing the middle. A feature already in $[0,1]$, or already binary, needs no rescaling at all, and missingness is a separate problem.',
    },
    {
      kind: 'mcq',
      id: 'ch05-boss-6',
      prompt: 'Why would you impute a missing value with a number *outside* the feature’s normal range?',
      choices: [
        'So the model can treat “this value was missing” as its own case',
        'To raise the feature’s variance so the model weighs it more',
        'Because the feature’s mean is too expensive to compute at scale',
        'To make the feature obviously useless so the model drops it',
      ],
      answer: 0,
      explain:
        'A clearly abnormal value acts as a flag: the model can learn what to do when the feature is absent. Mid-range imputation does the opposite — it hides the gap harmlessly. Nothing here is about compute cost, and the goal is to keep the feature informative, not to discard it.',
    },
    {
      kind: 'tf',
      id: 'ch05-boss-7',
      prompt:
        'If you filled missing values with the feature mean during training, you should fill them the same way at prediction time.',
      answer: true,
      explain:
        'The model learned on data completed by one technique; incomplete future examples must be completed identically, or they come from a different distribution than the model expects.',
    },
    {
      kind: 'mcq',
      id: 'ch05-boss-8',
      prompt: 'The test set exists to…',
      choices: [
        'assess the finished model once, untouched by training or tuning',
        'supply the algorithm with extra data when training stalls early',
        'tune hyperparameters more precisely than validation allows',
        'hold the examples carrying the rarest labels in the dataset',
      ],
      answer: 0,
      explain:
        'Every decision made against a dataset leaks into the model. The test set’s value is its innocence: it influenced nothing, so its verdict is unbiased. Tuning against it — however carefully — spends exactly that innocence, and feeding it back into training destroys it outright.',
    },
    {
      kind: 'mcq',
      id: 'ch05-boss-9',
      prompt: 'With millions of examples, a reasonable three-way split is…',
      choices: ['95% / 2.5% / 2.5%', '50% / 25% / 25%', '15% / 70% / 15%', '99.99% / 0.005% / 0.005%'],
      answer: 0,
      explain:
        'The 70/15/15 rule of thumb predates big data. At scale, small holdout *percentages* are still huge in absolute count — keep the rest for training.',
    },
    {
      kind: 'order',
      id: 'ch05-boss-10',
      prompt: 'Order the practice workflow:',
      items: [
        'Shuffle the annotated examples',
        'Split into training, validation, and test sets',
        'Train candidate models on the training set',
        'Pick the best model and hyperparameters using the validation set',
        'Report final performance from the test set',
      ],
      explain:
        'Shuffle → split → train → select on validation → judge once on test. Skipping or reordering steps quietly biases the final number.',
    },
    {
      kind: 'mcq',
      id: 'ch05-boss-11',
      prompt: 'A model performs poorly *even on its training data*. This is called…',
      choices: [
        'underfitting (high bias) — the model or features are too weak',
        'overfitting (high variance) — the model is far too flexible',
        'over-regularization — the complexity penalty was set too low',
        'data leakage — the test set has contaminated the training set',
      ],
      answer: 0,
      explain:
        'Failing on data it has already seen means the model can’t even represent the pattern: too simple a model, or features without predictive power. Overfitting and leakage both make training performance look *better*, not worse — and a penalty set too low would add flexibility, not remove it.',
    },
    {
      kind: 'tf',
      id: 'ch05-boss-12',
      prompt: 'Only complex models like deep networks can overfit; linear models are immune.',
      answer: false,
      explain:
        'A linear model in a very high-dimensional space with few examples overfits readily — enough weights can memorize noise even along a flat surface.',
    },
    {
      kind: 'mcq',
      id: 'ch05-boss-13',
      prompt: 'Saying a model has “high variance” means…',
      choices: [
        'a differently drawn training set would give a rather different model',
        'its predicted values are spread over a very wide numeric range',
        'its features were never standardized or normalized before training',
        'its training error stays high and bounces around between epochs',
      ],
      answer: 0,
      explain:
        'Variance here means sensitivity to the particular sample, not spread in the outputs: the model shaped itself around this draw’s noise, which is why it stumbles on independently drawn test data. High training error is the *bias* symptom, and feature scaling is unrelated.',
    },
    {
      kind: 'multi',
      id: 'ch05-boss-14',
      prompt: 'Which are legitimate cures for overfitting? (select all that apply)',
      choices: [
        'Switch to a simpler model',
        'Gather more training examples',
        'Reduce the data’s dimensionality',
        'Add a regularization penalty',
        'Add many more engineered features',
      ],
      answers: [0, 1, 2, 3],
      explain:
        'Less capacity, more data, fewer dimensions, or a complexity penalty all fight variance. Piling on features does the opposite — more dimensions for the same examples is a classic way *into* an overfit.',
    },
    {
      kind: 'mcq',
      id: 'ch05-boss-15',
      prompt: 'In practice, L1 regularization is prized because it…',
      choices: [
        'yields a sparse model — most weights land at exactly zero',
        'guarantees the lowest test error of any regularization choice',
        'is differentiable everywhere, unlike the squared L2 penalty',
        'removes the need for a separate validation set when tuning',
      ],
      answer: 0,
      explain:
        'Sparsity doubles as feature selection and explainability. For raw holdout performance, though, L2 usually edges L1 out — and it is L2, the squared penalty, that is smoothly differentiable; L1’s absolute value has a corner at zero. You still tune $C$ on a validation set either way.',
    },
    {
      kind: 'mcq',
      id: 'ch05-boss-16',
      prompt: 'Setting the regularization hyperparameter $C$ to zero…',
      choices: [
        'recovers plain, non-regularized regression',
        'forces every weight down to exactly zero',
        'makes the penalty term dominate the loss',
        'turns the L2 penalty into an L1 penalty',
      ],
      answer: 0,
      explain:
        '$C$ scales the penalty, so $C = 0$ deletes it and leaves the ordinary objective. A huge $C$ is the *other* extreme, crushing weights until the model underfits — and no value of $C$ changes which penalty you chose.',
    },
    {
      kind: 'match',
      id: 'ch05-boss-17',
      prompt: 'Match the regularization name to its identity:',
      pairs: [
        ['Lasso', 'L1 — absolute-value penalty, produces sparsity'],
        ['Ridge', 'L2 — squared penalty, smooth shrinkage'],
        ['Elastic net', 'L1 and L2 combined'],
        ['Dropout', 'a neural-network-specific regularizer'],
      ],
      explain:
        'Same idea in different clothes: penalize complexity. Lasso zeroes weights, ridge shrinks them, elastic net mixes, dropout randomly silences neurons.',
    },
    {
      kind: 'numeric',
      id: 'ch05-boss-18',
      prompt:
        'A confusion matrix shows $TP = 23$, $FP = 12$, $FN = 1$, $TN = 556$. Compute the precision (to two decimals).',
      answer: 0.657,
      tolerance: 0.01,
      explain:
        'precision $= TP/(TP+FP) = 23/35 \\approx 0.66$. Note recall here is $23/24 \\approx 0.96$ — this model catches nearly everything but flags too eagerly.',
    },
    {
      kind: 'mcq',
      id: 'ch05-boss-19',
      prompt: 'A disease-screening model misses many patients who actually have the disease. Which metric is low?',
      choices: [
        'Recall — the share of true positives among all actual positives',
        'Precision — the share of true positives among positive predictions',
        'Accuracy — the share of correct predictions over all examples',
        'AUC — the area under the model’s ROC curve',
      ],
      answer: 0,
      explain:
        'Missed positives are false negatives, and FN lives in recall’s denominator: recall $= TP/(TP+FN)$. Screening problems prioritize recall.',
    },
    {
      kind: 'tf',
      id: 'ch05-boss-20',
      prompt:
        'If 99% of messages are not spam, a model that flags nothing achieves 99% accuracy while catching zero spam.',
      answer: true,
      explain:
        'The classic accuracy trap: class imbalance lets a useless model post a great-looking number. Reach for precision/recall or cost-sensitive accuracy instead.',
    },
    {
      kind: 'mcq',
      id: 'ch05-boss-21',
      prompt: 'Cost-sensitive accuracy handles classes of unequal importance by…',
      choices: [
        'multiplying the FP and FN counts by their assigned costs',
        'deleting examples of the class that costs less to misclassify',
        'raising the decision threshold until precision reaches 0.99',
        'reporting the training error of the rarer class separately',
      ],
      answer: 0,
      explain:
        'Assign each mistake type a price, reweight the two error cells, then compute accuracy as usual — expensive mistakes now drag the score down harder. Threshold moves and per-class reports change what you *look at*; only reweighting changes the metric itself, and throwing away examples throws away information.',
    },
    {
      kind: 'mcq',
      id: 'ch05-boss-22',
      prompt: 'On an ROC curve, setting the decision threshold to 0 (flag everything) lands you at…',
      choices: [
        'the top-right corner: TPR = 1 and FPR = 1',
        'the bottom-left corner: TPR = 0 and FPR = 0',
        'the top-left corner: TPR = 1 and FPR = 0',
        'the exact center of the plot, at TPR = FPR = 0.5',
      ],
      answer: 0,
      explain:
        'Predicting positive for everything catches every positive (TPR 1) and false-alarms on every negative (FPR 1). Threshold above every score gives the opposite corner.',
    },
    {
      kind: 'mcq',
      id: 'ch05-boss-23',
      prompt: 'A colleague reports an AUC of 0.38. The right reaction is…',
      choices: [
        'suspicion — below 0.5 is worse than random guessing',
        'celebration — a lower AUC means a lower error rate',
        'indifference — AUC says nothing about model quality',
        'approval — 0.38 comfortably clears the usual bar',
      ],
      answer: 0,
      explain:
        'Random ranking scores 0.5; a perfect one scores 1.0. AUC therefore runs *upward* with quality, and below 0.5 means the scores anti-correlate with the labels — often a flipped sign or swapped class labels rather than a genuinely terrible model.',
    },
    {
      kind: 'numeric',
      id: 'ch05-boss-24',
      prompt: 'In five-fold cross-validation, what percentage of the training data does each fold contain?',
      answer: 20,
      tolerance: 0.5,
      explain:
        'Five equal folds → $100\\% / 5 = 20\\%$ each. Each round trains on 80% and validates on the held-out 20%, until every fold has had its turn.',
    },
  ],
};

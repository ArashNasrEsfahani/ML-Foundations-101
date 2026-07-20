import type { Chapter } from '../schema';

/** Chapter 8 — Advanced Practice (book pp. 97–105), paraphrased in original words. */
export const ch08: Chapter = {
  id: 'ch08',
  number: 8,
  title: 'Advanced Practice',
  subtitle: 'Imbalance, regularization tricks, transfer learning',
  pdfPages: [97, 105],
  badgeId: 'ch08',
  sections: [
    {
      id: 'ch08-imbalanced',
      title: 'The 99% Accuracy Trap',
      minutes: 7,
      blocks: [
        {
          type: 'p',
          md:
            'Fraud detection sounds glamorous until you meet the data: for every fraudulent transaction there are hundreds of genuine ones. Here is the trap — a model that predicts *“genuine”* for **everything** scores 99% accuracy while catching exactly **zero** fraud. On an **imbalanced dataset**, overall accuracy is a vanity metric; what matters is the per-class view, especially the **recall on the minority class**: of all the fraud cases, how many did we actually catch?',
        },
        {
          type: 'p',
          md:
            'Why do learners fall into the trap? Take soft-margin SVM: every misclassified example contributes the same cost. Noise guarantees some points end up on the wrong side, and since minority examples are few, the cheapest arrangement is often to sacrifice *them* — the algorithm nudges the boundary into minority territory to keep the numerous majority points happy. Most learning algorithms behave the same way on imbalanced data.',
        },
        {
          type: 'p',
          md:
            'The fixes all amount to *making the minority count more*. **Class weights**: if your algorithm supports it (many SVM implementations do), set a higher misclassification cost for minority examples — the boundary shifts back, trading a few majority mistakes for minority coverage. **Oversampling**: make multiple copies of the minority examples so their class carries more weight. **Undersampling**: randomly remove majority examples instead. And you can synthesize *new* minority points: **SMOTE** and **ADASYN** pick a minority example $\\mathbf{x}_i$, choose one of its $k$ nearest minority neighbors $\\mathbf{x}_{zi}$, and interpolate: $\\mathbf{x}_{new} = \\mathbf{x}_i + \\lambda(\\mathbf{x}_{zi} - \\mathbf{x}_i)$ with random $\\lambda \\in [0, 1]$. ADASYN additionally generates more synthetics where minority examples are scarcest.',
        },
        {
          type: 'p',
          md:
            'A practical footnote: decision trees and the ensembles built from them — random forest, gradient boosting — are often less rattled by imbalance out of the box. Still, check the minority recall before you celebrate.',
        },
        {
          type: 'widget',
          id: 'ImbalanceLab',
          challenge: {
            id: 'ch08-challenge-imbalance',
            label: 'raise minority recall above 0.8 without accuracy collapse',
            xp: 15,
          },
        },
        {
          type: 'quiz',
          id: 'ch08-q-imbalanced',
          questions: [
            {
              kind: 'mcq',
              id: 'ch08-q-imbalanced-1',
              prompt: 'Which metric exposes the “always predict majority” classifier as useless?',
              choices: [
                'Recall on the minority class',
                'Overall accuracy',
                'Training time',
                'Number of parameters',
              ],
              answer: 0,
              explain:
                'The always-majority model has minority recall 0 — it catches nothing — while its overall accuracy can be a smug 99%.',
            },
            {
              kind: 'mcq',
              id: 'ch08-q-imbalanced-2',
              prompt: 'SMOTE creates new minority examples by…',
              choices: [
                'interpolating between a minority example and one of its nearest minority neighbors',
                'copying majority examples and flipping their labels',
                'adding Gaussian noise to majority examples',
                'deleting outliers',
              ],
              answer: 0,
              explain:
                '$\\mathbf{x}_{new} = \\mathbf{x}_i + \\lambda(\\mathbf{x}_{zi} - \\mathbf{x}_i)$, $\\lambda \\in [0,1]$: synthetic points appear along the segments connecting minority neighbors.',
            },
            {
              kind: 'mcq',
              id: 'ch08-q-imbalanced-3',
              prompt: 'Oversampling vs undersampling — which line is right?',
              choices: [
                'Oversampling duplicates minority examples; undersampling removes majority examples',
                'Oversampling removes minority examples; undersampling duplicates majority examples',
                'Both remove examples of both classes',
                'Both require a neural network',
              ],
              answer: 0,
              explain:
                'Two roads to the same goal: shift the balance of influence toward the minority class, either by adding its copies or by thinning the majority.',
            },
            {
              kind: 'tf',
              id: 'ch08-q-imbalanced-4',
              prompt:
                'Setting a higher misclassification cost for the minority class makes the algorithm work harder to classify those examples correctly.',
              answer: true,
              explain:
                'That is exactly what class weights do: the boundary moves so that expensive minority mistakes are avoided, even at the price of a few cheap majority mistakes.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch08-combining-nets',
      title: 'Combining Models, Combining Data',
      minutes: 6,
      blocks: [
        {
          type: 'p',
          md:
            'Random forest combines hundreds of *weak* models of the same kind. A different play: combine **two or three strong models** built by *different* algorithms — say an SVM and a random forest — for one extra bump in performance. Three standard ways: **averaging** (average the predictions; works for regression and for classifiers that output scores), **majority vote** (each classifier votes; ties are broken randomly or answered with “don’t know” if a wrong answer is costly), and **stacking** (train a *meta-model* whose input is the base models’ outputs: from base classifiers $f_1, f_2$, build training examples $\\hat{\\mathbf{x}}_i = [f_1(\\mathbf{x}_i), f_2(\\mathbf{x}_i)]$ with the original label — per-class scores can join the features too).',
        },
        {
          type: 'p',
          md:
            'Two health warnings. Always verify on the validation set that the combination actually beats every base model (and tune the stacked model’s hyperparameters with cross-validation). And remember *why* combining works: several strong, **uncorrelated** models that agree are probably agreeing on the truth. Stack three SVMs with slightly different hyperparameters and you’ll gain almost nothing — they make the same mistakes. Different algorithms, or different feature sets, are what buy independence.',
        },
        {
          type: 'p',
          md:
            'Now the data side. **Multiple inputs** usually means *multimodal* data — say, a picture plus a caption, and the label says whether the caption describes the picture. Shallow options: train one model per modality and combine them as above, or just concatenate the feature vectors into one wider vector. Neural networks are more graceful: build one **subnetwork per input type** (a CNN reads the image, an RNN reads the text), take each subnetwork’s **embedding**, concatenate them, and put a classification layer — softmax or sigmoid — on top. Deep-learning libraries ship ready-made layers for concatenating or averaging subnetwork outputs.',
        },
        {
          type: 'p',
          md:
            '**Multiple outputs** is the mirror problem: one input, several predictions — locate an object in an image *and* tag it as “person”, “cat” or “hamster”. When output combinations can’t be enumerated as fake classes, build a **shared encoder trunk with one head per output**: an encoder subnetwork produces the embedding; one head with ReLU outputs predicts the coordinates (positive reals — trained with MSE cost $C_1$); a second head with softmax predicts the tag (trained with cross-entropy cost $C_2$). You can’t optimize both costs at once, so you blend them with a hyperparameter $\\gamma \\in (0,1)$:',
        },
        {
          type: 'math',
          tex: 'C = \\gamma\\, C_1 + (1 - \\gamma)\\, C_2',
        },
        {
          type: 'p',
          md: '…and tune $\\gamma$ on the validation set, like any other hyperparameter.',
        },
        {
          type: 'quiz',
          id: 'ch08-q-combining',
          questions: [
            {
              kind: 'match',
              id: 'ch08-q-combining-1',
              prompt: 'Match each combination method to how it works:',
              pairs: [
                ['Averaging', 'apply all base models and average their outputs or scores'],
                ['Majority vote', 'each base classifier votes; the most common class wins'],
                ['Stacking', 'a meta-model learns from the base models’ outputs as features'],
              ],
              explain:
                'Averaging and voting need no extra training; stacking trains one more model on top — and must prove itself on the validation set.',
            },
            {
              kind: 'mcq',
              id: 'ch08-q-combining-2',
              prompt: 'Combining several strong models pays off most when the base models are…',
              choices: [
                'uncorrelated — different algorithms or different features',
                'identical copies of each other',
                'trained on the same errors',
                'as small as possible',
              ],
              answer: 0,
              explain:
                'Uncorrelated models that agree are likely agreeing on the truth. Three near-identical SVMs agree on their shared mistakes too — no gain.',
            },
            {
              kind: 'mcq',
              id: 'ch08-q-combining-3',
              prompt: 'The standard neural approach to an image + text input is…',
              choices: [
                'a CNN subnetwork for the image and an RNN for the text, embeddings concatenated, classifier on top',
                'converting the image into text first',
                'training on the image only and ignoring the text',
                'one gigantic fully connected layer on raw pixels and characters',
              ],
              answer: 0,
              explain:
                'One subnetwork per modality produces an embedding; concatenate (or average) them and add a softmax/sigmoid layer — libraries make this a few lines.',
            },
            {
              kind: 'numeric',
              id: 'ch08-q-combining-4',
              prompt:
                'Two-headed network: coordinate cost $C_1 = 2$, tag cost $C_2 = 1$, blend $\\gamma = 0.3$. Compute the combined cost $\\gamma C_1 + (1-\\gamma) C_2$.',
              answer: 1.3,
              tolerance: 0.01,
              explain: '$0.3 \\times 2 + 0.7 \\times 1 = 0.6 + 0.7 = 1.3$. Tuning $\\gamma$ decides which head’s accuracy you privilege.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch08-training-tricks',
      title: 'Making Neural Networks Behave',
      minutes: 6,
      blocks: [
        {
          type: 'p',
          md:
            'Training a neural network starts before the first gradient step: the data must be shaped for the network. Images get resized to identical dimensions, then standardized and normalized into $[0,1]$. Text gets **tokenized** — split into words, punctuation, symbols — then encoded as one-hot vectors or, usually better, **word embeddings** (bag of words can still serve a multilayer perceptron on longer texts). And resist the urge to reimplement this month’s exotic architecture from a paper: with clean, normalized, plentiful data, a boring proven architecture usually closes most of the gap — and actually ships.',
        },
        {
          type: 'p',
          md:
            'For the architecture size, climb gradually: start with one or two layers, train, and check whether the model fits the training data well (low bias). If not, grow layer sizes and depth until it does. Once training fit is good but validation performance is poor (high variance), add **regularization**. If regularizing kills the training fit, grow the network slightly — and keep looping until both training and validation look healthy. Besides L1 and L2, neural networks have their own regularizers:',
        },
        {
          type: 'p',
          md:
            '**Dropout** is disarmingly simple: on every training pass, temporarily switch off a random fraction of units. The dropout rate (between 0 and 1, tuned on validation) controls the strength — the more units silenced, the stronger the regularizing push, because no unit can rely on a specific partner always being awake.',
        },
        {
          type: 'p',
          md:
            '**Early stopping** watches the validation set as epochs pass. Training cost keeps falling forever, but validation performance rises, peaks, and then *deteriorates* — the moment overfitting begins. Save the model after every epoch (these saves are called **checkpoints**), and either stop when validation performance starts dropping or train on and pick the best checkpoint afterward.',
        },
        {
          type: 'p',
          md:
            '**Batch normalization** standardizes the outputs of each layer before the next layer consumes them. Technically it isn’t regularization — its headline benefits are faster and more stable training — but in practice it also has a regularizing effect. It’s nearly always worth trying: most libraries let you insert it between two layers with one line.',
        },
        {
          type: 'p',
          md:
            '**Data augmentation** manufactures extra labeled examples from the ones you have, by applying transformations that *keep the label true*: slightly zoom, rotate, flip, or darken an image, and a cat photo remains a cat photo. It regularizes almost any learner — not just networks — and is standard practice with images.',
        },
        {
          type: 'quiz',
          id: 'ch08-q-training',
          questions: [
            {
              kind: 'mcq',
              id: 'ch08-q-training-1',
              prompt: 'What does dropout do during training?',
              choices: [
                'Randomly excludes a fraction of units from each computation pass',
                'Deletes the smallest weights permanently',
                'Removes training examples with noisy labels',
                'Stops training early',
              ],
              answer: 0,
              explain:
                'Each pass silences a random subset of units, so the network can’t lean on any single unit — a simple and effective regularizer, with the rate tuned on validation data.',
            },
            {
              kind: 'mcq',
              id: 'ch08-q-training-2',
              prompt: 'Early stopping ends training when…',
              choices: [
                'performance on the validation set starts to deteriorate',
                'training cost reaches exactly zero',
                'the learning rate becomes negative',
                'the network runs out of layers',
              ],
              answer: 0,
              explain:
                'Falling training cost with worsening validation performance is the signature of overfitting — stop there, or keep checkpoints and pick the best one later.',
            },
            {
              kind: 'tf',
              id: 'ch08-q-training-3',
              prompt:
                'Batch normalization is technically not a regularization technique, yet it often has a regularizing effect — plus faster, more stable training.',
              answer: true,
              explain:
                'It standardizes each layer’s outputs before the next layer sees them; the regularization is a welcome side effect, which is why it’s almost always worth trying.',
            },
            {
              kind: 'mcq',
              id: 'ch08-q-training-4',
              prompt: 'Which is a correct example of data augmentation?',
              choices: [
                'Flipping a labeled cat photo horizontally and keeping the label “cat”',
                'Relabeling dog photos as cats to balance classes',
                'Removing all blurry images',
                'Doubling the learning rate',
              ],
              answer: 0,
              explain:
                'Augmentation applies label-preserving transformations — zoom, rotation, flips, darkening — to synthesize new examples that keep their original labels.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch08-transfer-efficiency',
      title: 'Borrowed Brains, Fast Code',
      minutes: 7,
      blocks: [
        {
          type: 'p',
          md:
            '**Transfer learning** is arguably *the* place where neural networks leave shallow models in the dust. The setting: you have a good model trained on one big dataset (wild animals), and a new problem from a *different distribution* (domestic animals) with only a small labeled dataset. A shallow learner would force you to build another big dataset. With a deep network, you operate: **1)** take the big trained model, **2)** gather your small labeled dataset, **3)** remove the last layer or layers — the classification head that sits after the embedding, **4)** bolt on new layers shaped for your problem, **5)** *freeze* the parameters of every remaining old layer, **6)** train only the new layers on your small dataset. The early layers already know how to see edges, textures and shapes — knowledge that transfers.',
        },
        {
          type: 'p',
          md:
            'No pre-trained model handy? Build your own stepping stone from *cheap* labels. Need a document classifier for your employer’s thousand-category taxonomy, but annotating a million documents is unaffordable? Train a first model on **Wikipedia pages**, using each page’s category as a free label — then fine-tune that model on a much smaller hand-annotated set from the real taxonomy. Far fewer expensive labels needed.',
        },
        {
          type: 'p',
          md:
            'From borrowed knowledge to raw speed: **algorithmic efficiency**. The **big O notation** classifies algorithms by how running time grows with input size $N$, ignoring constants ($5N^2$ is just $O(N^2)$). Example: to find the two most distant numbers in a set, a double loop compares every pair — $N^2$ comparisons, $O(N^2)$. A smarter single sweep tracks the running minimum and maximum: $O(N)$, and the answer is their pair. Both are “efficient” in the polynomial-time sense, but at big-data scale $O(N^2)$ crawls — practitioners hunt for $O(N)$, $O(N \\log N)$, even $O(\\log N)$.',
        },
        {
          type: 'p',
          md:
            'And a fistful of practical speed rules for scientific Python: **avoid loops** — write $\\mathbf{w}\\mathbf{x}$ as `numpy.dot(w, x)`, not an element-by-element loop; matrix and vector operations run in optimized C. Pick the **right data structure**: membership tests are fast in a `set` and slow in a `list`; key lookups belong in a `dict` (a hashmap). Prefer battle-tested libraries — numpy, scipy, scikit-learn — over hand-rolled code. Use **generators** to stream huge collections one element at a time, `cProfile` to find the real hotspots, and, when the algorithm itself can’t improve, `multiprocessing` or compilers like PyPy and Numba.',
        },
        {
          type: 'hint',
          md:
            'The transfer-learning recipe has a hidden hyperparameter: *how many* layers to remove and replace. Like everything else, it’s decided on the validation set.',
        },
        {
          type: 'quiz',
          id: 'ch08-q-transfer',
          questions: [
            {
              kind: 'mcq',
              id: 'ch08-q-transfer-1',
              prompt: 'In the transfer-learning recipe, why freeze the early layers of the pre-trained model?',
              choices: [
                'They already encode general knowledge (edges, textures) worth keeping — only the new head needs training on the small dataset',
                'Frozen layers use less disk space',
                'They cannot be trained at all',
                'Freezing increases the learning rate',
              ],
              answer: 0,
              explain:
                'The small dataset couldn’t retrain millions of parameters without overfitting; it *can* train a small new head on top of features that transfer.',
            },
            {
              kind: 'numeric',
              id: 'ch08-q-transfer-2',
              prompt:
                'The pairwise double-loop algorithm makes $N^2$ comparisons. For $N = 200$ examples, how many comparisons is that?',
              answer: 40000,
              tolerance: 0,
              explain:
                '$200^2 = 40{,}000$. The single-sweep min/max version needs only about 200 — that’s the practical gulf between $O(N^2)$ and $O(N)$.',
            },
            {
              kind: 'mcq',
              id: 'ch08-q-transfer-3',
              prompt: 'You need to repeatedly check whether an example belongs to a large collection. In Python, use…',
              choices: [
                'a `set` — membership tests are fast; in a `list` they are slow',
                'a `list` — order always helps',
                'a string of all elements',
                'nested tuples',
              ],
              answer: 0,
              explain:
                'When element order doesn’t matter, a set (or dict for key–value pairs) gives near-constant-time lookups; a list must be scanned.',
            },
            {
              kind: 'tf',
              id: 'ch08-q-transfer-4',
              prompt: 'Big O notation keeps constant factors: an algorithm doing $5N^2$ operations is written $O(5N^2)$.',
              answer: false,
              explain:
                'Constants are dropped — $5N^2$ is $O(N^2)$. Big O describes the *growth shape* of cost with input size, not the exact count.',
            },
          ],
        },
      ],
    },
  ],
  bossPool: [
    {
      kind: 'mcq',
      id: 'ch08-boss-1',
      prompt: 'Which situation is a textbook *imbalanced dataset*?',
      choices: [
        'Fraud detection: genuine transactions vastly outnumber fraudulent ones',
        'A coin-flip dataset with 50/50 heads and tails',
        'A regression problem with continuous labels',
        'A dataset with no labels at all',
      ],
      answer: 0,
      explain:
        'When one class is rare, most algorithms happily sacrifice it — the boundary drifts into minority territory to please the numerous majority.',
    },
    {
      kind: 'numeric',
      id: 'ch08-boss-2',
      prompt:
        'A dataset has 990 genuine and 10 fraudulent transactions. A model predicts “genuine” for everything. What is its accuracy in percent?',
      answer: 99,
      tolerance: 0.1,
      explain:
        '$990/1000 = 99\\%$ — while catching zero fraud. Minority recall (here 0) is the honest number to watch.',
    },
    {
      kind: 'tf',
      id: 'ch08-boss-3',
      prompt: 'On imbalanced data, high overall accuracy can coexist with a complete failure on the minority class.',
      answer: true,
      explain:
        'The always-majority classifier proves it. Judge models by per-class metrics — above all, minority recall.',
    },
    {
      kind: 'mcq',
      id: 'ch08-boss-4',
      prompt: 'Undersampling means…',
      choices: [
        'randomly removing examples of the majority class from the training set',
        'removing examples of the minority class',
        'shrinking the feature vectors',
        'training for fewer epochs',
      ],
      answer: 0,
      explain:
        'It rebalances by thinning the majority; oversampling instead duplicates the minority. Both make minority mistakes relatively more expensive.',
    },
    {
      kind: 'mcq',
      id: 'ch08-boss-5',
      prompt: 'SMOTE builds a synthetic minority example as $\\mathbf{x}_{new} = \\mathbf{x}_i + \\lambda(\\mathbf{x}_{zi} - \\mathbf{x}_i)$, where…',
      choices: [
        '$\\mathbf{x}_{zi}$ is a random minority nearest-neighbor of $\\mathbf{x}_i$ and $\\lambda$ is random in $[0,1]$',
        '$\\mathbf{x}_{zi}$ is the farthest majority point and $\\lambda = 2$',
        '$\\mathbf{x}_{zi}$ is the dataset mean and $\\lambda$ is negative',
        'both points are majority examples',
      ],
      answer: 0,
      explain:
        'The synthetic point lands on the segment between two nearby minority examples. ADASYN is similar but generates more where minority points are rare.',
    },
    {
      kind: 'mcq',
      id: 'ch08-boss-6',
      prompt: 'Which family of algorithms often tolerates imbalanced data comparatively well, out of the box?',
      choices: [
        'Decision trees and their ensembles (random forest, gradient boosting)',
        'k-means',
        'Linear regression',
        'Autoencoders',
      ],
      answer: 0,
      explain:
        'Tree-based methods are frequently less sensitive to imbalance — though minority recall should still be verified, never assumed.',
    },
    {
      kind: 'match',
      id: 'ch08-boss-7',
      prompt: 'Match each model-combination method to its mechanism:',
      pairs: [
        ['Averaging', 'mean of the base models’ predictions or scores'],
        ['Majority vote', 'the class predicted by most base classifiers wins'],
        ['Stacking', 'a meta-model trained on the base models’ outputs'],
      ],
      explain:
        'Averaging suits regression/score outputs; voting suits classifiers; stacking adds one learned combiner — validate that it beats each base model.',
    },
    {
      kind: 'mcq',
      id: 'ch08-boss-8',
      prompt: 'To build training data for a stacked meta-model over classifiers $f_1, f_2$, each example becomes…',
      choices: [
        '$\\hat{\\mathbf{x}}_i = [f_1(\\mathbf{x}_i), f_2(\\mathbf{x}_i)]$ with the original label $y_i$',
        'the concatenation of all raw features twice',
        'a random vector with a random label',
        'the average of $\\mathbf{x}_i$ and $y_i$',
      ],
      answer: 0,
      explain:
        'The meta-model sees only what the base models said (optionally including their per-class scores) and learns when to trust whom.',
    },
    {
      kind: 'tf',
      id: 'ch08-boss-9',
      prompt: 'Stacking three SVMs that differ only slightly in hyperparameters usually yields a big accuracy gain.',
      answer: false,
      explain:
        'Near-identical models are highly correlated — they share their mistakes. Gains come from combining models of a *different nature* or different features.',
    },
    {
      kind: 'mcq',
      id: 'ch08-boss-10',
      prompt: 'A neural network for image + text input typically…',
      choices: [
        'runs a CNN on the image and an RNN on the text, then concatenates the two embeddings under one classifier',
        'converts the image to a sentence first',
        'trains two networks that never communicate',
        'feeds raw pixels into the RNN',
      ],
      answer: 0,
      explain:
        'One subnetwork per modality, embeddings concatenated (or averaged), a softmax/sigmoid layer on top — the standard multimodal pattern.',
    },
    {
      kind: 'mcq',
      id: 'ch08-boss-11',
      prompt: 'A network must output an object’s coordinates *and* its tag. The standard design is…',
      choices: [
        'a shared encoder with two heads: a ReLU/MSE head for coordinates, a softmax/cross-entropy head for the tag',
        'two completely separate networks trained on different datasets',
        'one softmax head that outputs coordinates as probabilities',
        'a decision tree bolted onto a CNN',
      ],
      answer: 0,
      explain:
        'The encoder embedding feeds both heads; since the two costs can’t both be minimized exactly, they are blended as $\\gamma C_1 + (1-\\gamma) C_2$ with $\\gamma$ tuned on validation.',
    },
    {
      kind: 'numeric',
      id: 'ch08-boss-12',
      prompt:
        'Two-headed cost blend: $C_1 = 4$, $C_2 = 2$, $\\gamma = 0.5$. Compute $\\gamma C_1 + (1-\\gamma) C_2$.',
      answer: 3,
      tolerance: 0.01,
      explain: '$0.5 \\times 4 + 0.5 \\times 2 = 3$. Raising $\\gamma$ would prioritize the coordinate head’s accuracy.',
    },
    {
      kind: 'mcq',
      id: 'ch08-boss-13',
      prompt: 'The dropout hyperparameter is…',
      choices: [
        'the fraction of units randomly switched off on each training pass, tuned on validation data',
        'the number of layers to delete permanently',
        'the number of training examples to skip',
        'the final test accuracy',
      ],
      answer: 0,
      explain:
        'A value in $[0,1]$: higher means stronger regularization. Libraries let you set it per layer or insert dedicated dropout layers.',
    },
    {
      kind: 'mcq',
      id: 'ch08-boss-14',
      prompt: 'Models saved after each training epoch — used by early stopping — are called…',
      choices: ['checkpoints', 'snapshots of the dataset', 'residuals', 'embeddings'],
      answer: 0,
      explain:
        'Keep a checkpoint per epoch; stop when validation performance starts degrading, or train on and pick the best checkpoint at the end.',
    },
    {
      kind: 'tf',
      id: 'ch08-boss-15',
      prompt: 'Data augmentation only works for neural networks.',
      answer: false,
      explain:
        'Label-preserving transformations (zoom, flip, rotate, darken…) regularize virtually any learning algorithm — images are just the most common playground.',
    },
    {
      kind: 'order',
      id: 'ch08-boss-16',
      prompt: 'Order the transfer-learning recipe:',
      items: [
        'Train (or download) a deep model built on the original big dataset',
        'Compile a much smaller labeled dataset for the new problem',
        'Remove the last layer(s) — the old classification head',
        'Add new layers shaped for the new problem',
        'Freeze the remaining old layers',
        'Train only the new layers on the small dataset',
      ],
      explain:
        'Big model → small dataset → swap the head → freeze the body → train the head. How many layers to remove is itself a hyperparameter.',
    },
    {
      kind: 'mcq',
      id: 'ch08-boss-17',
      prompt: 'The Wikipedia trick for a document classifier with an expensive taxonomy is to…',
      choices: [
        'pre-train on Wikipedia pages labeled by their free categories, then fine-tune on a small hand-annotated set',
        'replace the taxonomy with Wikipedia categories forever',
        'annotate a million documents by hand first',
        'train only on the taxonomy definitions',
      ],
      answer: 0,
      explain:
        'Cheap, automatic labels build the first model; transfer learning then needs far fewer costly expert annotations for the real categories.',
    },
    {
      kind: 'numeric',
      id: 'ch08-boss-18',
      prompt:
        'The double-loop most-distant-pair algorithm on $N = 1000$ examples makes about $N^2$ comparisons. How many is that?',
      answer: 1000000,
      tolerance: 0,
      explain:
        'A million — versus roughly a thousand for the $O(N)$ single sweep that tracks the min and max. Growth rate is destiny at scale.',
    },
    {
      kind: 'mcq',
      id: 'ch08-boss-19',
      prompt: 'Why is `numpy.dot(w, x)` preferred over a hand-written Python loop computing $\\mathbf{w}\\mathbf{x}$?',
      choices: [
        'Vectorized matrix/vector operations run in optimized C — Python loops are dramatically slower',
        'The loop gives a mathematically different result',
        'numpy rounds more aggressively',
        'Loops are forbidden in Python',
      ],
      answer: 0,
      explain:
        '“Avoid loops whenever possible” is the first practical speed rule: scientific packages were engineered in C for exactly these operations.',
    },
    {
      kind: 'mcq',
      id: 'ch08-boss-20',
      prompt: 'In the big data era, scientists often hunt for algorithms with complexity around…',
      choices: ['$O(\\log N)$', '$O(N^3)$', '$O(2^N)$', '$O(N!)$'],
      answer: 0,
      explain:
        'Polynomial counts as “efficient” in theory, but $O(N^2)$ already crawls on huge inputs — logarithmic or near-linear growth is the practical target.',
    },
    {
      kind: 'mcq',
      id: 'ch08-boss-21',
      prompt: 'Which Python tool finds the slow spots (hotspots) in your code?',
      choices: ['`cProfile`', '`set()`', '`multiprocessing`', '`import antigravity`'],
      answer: 0,
      explain:
        'Profile first, optimize second. Then: better data structures, vectorization, generators — and multiprocessing or PyPy/Numba as the last resort.',
    },
  ],
};

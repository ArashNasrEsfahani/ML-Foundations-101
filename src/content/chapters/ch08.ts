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
            'Fraud detection sounds glamorous until you meet the data: for every fraudulent transaction there are hundreds of genuine ones. Here is the trap — a model that predicts *“genuine”* for **everything** scores 99% accuracy while catching exactly **zero** fraud. On an **[[imbalanced-dataset|imbalanced dataset]]**, overall accuracy is a vanity metric. What matters is the per-class view — accuracy being useless on skewed data is the whole reason [precision and recall](sec:ch05-metrics) exist — and above all the **[[recall|recall on the minority class]]**: of all the fraud cases, how many did we actually catch?',
        },
        {
          type: 'p',
          md:
            'Why do learners fall into the trap? Take [soft-margin SVM](sec:ch03-svm): every misclassified example contributes the same cost. Noise guarantees some points end up on the wrong side, and since minority examples are few, the cheapest arrangement is often to sacrifice *them* — the algorithm nudges the boundary into minority territory to keep the numerous majority points happy. Most learning algorithms behave the same way on imbalanced data.',
        },
        {
          type: 'p',
          md:
            'The fixes all amount to *making the minority count more*. **[[class-weights|Class weights]]**: if your algorithm supports it (many SVM implementations do), set a higher misclassification cost for minority examples — the boundary shifts back, trading a few majority mistakes for minority coverage. **[[oversampling|Oversampling]]**: make multiple copies of the minority examples so their class carries more weight. **[[undersampling|Undersampling]]**: randomly remove majority examples instead.',
        },
        {
          type: 'p',
          md:
            'The fourth option is the strange one: manufacture minority examples that were never observed. What *is* a synthetic example? Take two real fraud cases that sit close together in feature space — one at (amount 120, hour 03:00), another at (amount 200, hour 04:00) — and drop a brand-new point somewhere on the straight line between them, (amount 140, hour 03:15), say. No such transaction ever happened. The bet is that the region *between* two frauds is also fraud, so filling it in tells the classifier where the minority **territory** lies, instead of merely how tall the piles are on two isolated spots. Copies cannot do that: stack a point on itself ten times and the minority class is louder but no wider, and a flexible model will happily draw a tiny island around each tower.',
        },
        {
          type: 'p',
          md:
            'That is **[[smote|SMOTE]]** — Synthetic Minority Over-sampling Technique. Pick a minority example $\\mathbf{x}_i$, pick one of its $k$ nearest *minority* neighbors $\\mathbf{x}_{zi}$, and interpolate:',
        },
        {
          type: 'math',
          tex: '\\mathbf{x}_{new} = \\mathbf{x}_i + \\lambda(\\mathbf{x}_{zi} - \\mathbf{x}_i), \\quad \\lambda \\in [0, 1]',
        },
        {
          type: 'p',
          md:
            'Keeping $\\lambda$ inside $[0,1]$ is what confines the invented point to the segment joining two real ones; let it escape that range and you would be inventing fraud out beyond anywhere fraud has ever been seen. Two things go wrong even so. A *mislabeled* minority point stranded in majority territory gets synthetics manufactured all around it, so the noise is amplified rather than diluted. And in high dimensions the straight line between two neighbors can run through regions where no real example could live at all.',
        },
        {
          type: 'p',
          md:
            '**[[adasyn|ADASYN]]** runs the same interpolation with a budget rather than a flat quota. It counts, for each minority point, how many of its neighbors belong to the majority class, and spends most of its synthetics on the points that are losing — the ones pressed up against the frontier — while a point buried deep inside a comfortable minority cluster gets almost none. The effect is to push the boundary outward where the fight actually is, instead of fattening the part that was already won. That same instinct is its weakness: a mislabeled point in enemy territory looks exactly like a hard frontier point from the inside, and gets amplified hardest of all.',
        },
        {
          type: 'hint',
          md:
            'One procedural rule catches everybody at least once: resample *inside* each [[cross-validation]] fold, never before the split. Oversample first and copies of the same transaction land in both the training and the validation half — so the model is scored on rows it has already memorized, and the number that comes back is fiction.',
        },
        {
          type: 'p',
          md:
            'There is also a fix that costs nothing at all: leave training alone and move the **[[decision-threshold|decision threshold]]** afterwards. A classifier that outputs a probability was never obliged to cut at 0.5 — cut at 0.05 instead and minority recall climbs immediately, at the price of precision. Sweeping the threshold and reading the [precision–recall curve](sec:ch05-metrics) is usually the first thing to try, before touching the data at all.',
        },
        {
          type: 'p',
          md:
            'A practical footnote: decision trees and the ensembles built from them — [random forest](sec:ch07-ensembles-bagging), [gradient boosting](sec:ch07-boosting) — are often less rattled by imbalance out of the box, because a tree splits on purity rather than on a summed per-example cost, so a rare class can still earn a leaf of its own. Still, check the minority recall before you celebrate.',
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
                'Overall accuracy across both classes',
                'Precision on the majority class',
                'Recall on the majority class',
              ],
              answer: 0,
              explain:
                'The always-majority model has minority recall 0 — it catches nothing. Every other metric here flatters it: overall accuracy is 99%, majority recall is a perfect 1.0, and majority precision is roughly 0.99, because it never gets a majority case wrong.',
            },
            {
              kind: 'mcq',
              id: 'ch08-q-imbalanced-2',
              prompt: 'SMOTE creates new minority examples by…',
              choices: [
                'interpolating between a minority example and a nearby minority neighbor',
                'adding small Gaussian noise to each existing minority example',
                'duplicating minority examples until both classes are equal in size',
                'relabeling the majority examples closest to the minority region',
              ],
              answer: 0,
              explain:
                '$\\mathbf{x}_{new} = \\mathbf{x}_i + \\lambda(\\mathbf{x}_{zi} - \\mathbf{x}_i)$ with $\\lambda \\in [0,1]$: the synthetic point lands *on the segment* joining two nearby minority examples, so it respects the shape of the minority region. Plain duplication is oversampling, and relabeling majority points would simply corrupt the labels.',
            },
            {
              kind: 'mcq',
              id: 'ch08-q-imbalanced-3',
              prompt: 'Oversampling vs undersampling — which line is right?',
              choices: [
                'Oversampling duplicates minority examples; undersampling removes majority examples',
                'Oversampling removes minority examples; undersampling duplicates majority examples',
                'Oversampling duplicates majority examples; undersampling removes minority examples',
                'Both add synthetic examples; oversampling to the minority, undersampling to the majority',
              ],
              answer: 0,
              explain:
                'Two roads to the same goal: shift the balance of influence toward the minority class, either by adding copies of it or by thinning the majority. Note that neither one invents new points — synthesizing genuinely new minority examples is what SMOTE and ADASYN are for.',
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
            '[Random forest](sec:ch07-ensembles-bagging) combines hundreds of *weak* models of the same kind. A different play: combine **two or three strong models** built by *different* algorithms — say an SVM and a random forest — for one extra bump in performance. Three standard ways: **[[model-averaging|averaging]]** (average the predictions; works for regression and for classifiers that output scores), **majority vote** (each classifier votes; ties are broken randomly or answered with “don’t know” if a wrong answer is costly), and **[[stacking]]** (train a *meta-model* whose input is the base models’ outputs: from base classifiers $f_1, f_2$, build training examples $\\hat{\\mathbf{x}}_i = [f_1(\\mathbf{x}_i), f_2(\\mathbf{x}_i)]$ with the original label — per-class scores can join the features too).',
        },
        {
          type: 'p',
          md:
            'Two health warnings. Always verify on the [validation set](sec:ch05-three-sets) that the combination actually beats every base model (and tune the stacked model’s hyperparameters with **[[cross-validation]]**). And remember *why* combining works: several strong, **uncorrelated** models that agree are probably agreeing on the truth. Stack three SVMs with slightly different hyperparameters and you’ll gain almost nothing — they make the same mistakes. Different algorithms, or different feature sets, are what buy independence.',
        },
        {
          type: 'hint',
          md:
            'A trap specific to stacking. Build the meta-model’s training set from predictions the base models made about *their own* training data and those predictions come back flatteringly good — so the meta-model learns to trust an accuracy that will not survive contact with anything new. Generate the meta-features fold by fold instead, each base prediction made by a copy of the model that never saw that example, and the problem disappears.',
        },
        {
          type: 'p',
          md:
            'Now the data side. **Multiple inputs** usually means *multimodal* data — say, a picture plus a caption, and the label says whether the caption describes the picture. Shallow options: train one model per modality and combine them as above, or just concatenate the feature vectors into one wider vector. Neural networks are more graceful: build one **subnetwork per input type** (a [CNN](sec:ch06-cnn) reads the image, an [RNN](sec:ch06-rnn) reads the text), take each subnetwork’s **[[embedding]]**, concatenate them, and put a classification layer — softmax or sigmoid — on top. Deep-learning libraries ship ready-made layers for concatenating or averaging subnetwork outputs.',
        },
        {
          type: 'p',
          md:
            '**Multiple outputs** is the mirror problem: one input, several predictions — locate an object in an image *and* tag it as “person”, “cat” or “hamster”. When output combinations can’t be enumerated as fake classes, build a **shared encoder trunk with one head per output**: an [[encoder-decoder|encoder]] subnetwork produces the embedding; one head with [[relu|ReLU]] outputs predicts the coordinates (positive reals — trained with MSE cost $C_1$); a second head with softmax predicts the tag (trained with cross-entropy cost $C_2$). You can’t optimize both costs at once, so you blend them with a hyperparameter $\\gamma \\in (0,1)$:',
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
                'near-identical, so their agreement confirms the prediction',
                'trained on the same data with the same algorithm and settings',
                'as small and fast as possible, so many of them can be stacked',
              ],
              answer: 0,
              explain:
                'Uncorrelated models that agree are probably agreeing on the truth. Near-identical models agree on their *shared mistakes* too, so their consensus proves nothing — which is why three SVMs differing only in hyperparameters buy you almost nothing. Model size is beside the point here; independence is what pays.',
            },
            {
              kind: 'mcq',
              id: 'ch08-q-combining-3',
              prompt: 'The standard neural approach to an image + text input is…',
              choices: [
                'a CNN for the image and an RNN for the text, embeddings concatenated',
                'a captioning model that turns the image into text, then one RNN',
                'one CNN over the pixels, with the text discarded as redundant',
                'one wide fully connected layer reading raw pixels and characters',
              ],
              answer: 0,
              explain:
                'One subnetwork per modality produces an embedding; concatenate (or average) the embeddings and put a softmax or sigmoid layer on top — libraries ship ready-made layers for exactly this. Flattening both modalities into one wide layer throws away the structure each subnetwork exists to exploit.',
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
            'Training a neural network starts before the first gradient step: the data must be shaped for the network. Images get resized to identical dimensions, then [standardized and normalized](sec:ch05-feature-engineering) into $[0,1]$. Text gets **tokenized** — split into words, punctuation, symbols — then encoded as one-hot vectors or, usually better, **[[word-embeddings|word embeddings]]** (bag of words can still serve a multilayer perceptron on longer texts). And resist the urge to reimplement this month’s exotic architecture from a paper: with clean, normalized, plentiful data, a boring proven architecture usually closes most of the gap — and actually ships.',
        },
        {
          type: 'p',
          md:
            'For the architecture size, climb gradually: start with one or two layers, train, and check whether the model fits the training data well (low [[model-bias|bias]]). If not, grow layer sizes and depth until it does. Once training fit is good but validation performance is poor (high [[model-variance|variance]]), add [regularization](sec:ch05-regularization). If regularizing kills the training fit, grow the network slightly — and keep looping until both training and validation look healthy. Besides L1 and L2, neural networks have their own regularizers:',
        },
        {
          type: 'p',
          md:
            '**[[dropout|Dropout]]** is disarmingly simple: on every training pass, temporarily switch off a random fraction of units. The dropout rate (between 0 and 1, tuned on validation) controls the strength — the more units silenced, the stronger the regularizing push, because no unit can rely on a specific partner always being awake.',
        },
        {
          type: 'p',
          md:
            '**[[early-stopping|Early stopping]]** watches the validation set as epochs pass. Training cost keeps falling forever, but validation performance rises, peaks, and then *deteriorates* — the moment overfitting begins. Save the model after every epoch (these saves are called **[[checkpointing|checkpoints]]**), and either stop when validation performance starts dropping or train on and pick the best checkpoint afterward.',
        },
        {
          type: 'hint',
          md:
            'Training on past the peak and picking the best checkpoint afterwards is almost always the better of the two. Validation curves are noisy, so a dip of one epoch means nothing and a stopping rule that fires on it quits early; and the saved optimizer state — momentum buffers, step counters, where the learning-rate schedule had got to — is what lets a run *resume* rather than restart after a crashed machine.',
        },
        {
          type: 'p',
          md:
            '**[[batch-normalization|Batch normalization]]** standardizes the outputs of each layer before the next layer consumes them. Technically it isn’t regularization — its headline benefits are faster and more stable training — but in practice it also has a regularizing effect. It’s nearly always worth trying: most libraries let you insert it between two layers with one line.',
        },
        {
          type: 'p',
          md:
            '**[[data-augmentation|Data augmentation]]** manufactures extra labeled examples from the ones you have, by applying transformations that *keep the label true*: slightly zoom, rotate, flip, or darken an image, and a cat photo remains a cat photo. It regularizes almost any learner — not only networks — and is standard practice with images. The label-preserving condition is doing real work, though: flip a photograph of a cat and it is still a cat, but flip a photograph of the digit 2 and it is not a digit at all.',
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
                'Permanently deletes the units whose weights stay near zero',
                'Drops the training examples whose labels the network finds odd',
                'Halts training once validation performance stops improving',
              ],
              answer: 0,
              explain:
                'Each pass silences a *different* random subset of units, so no unit can rely on a specific partner always being awake. The silencing is temporary — nothing is deleted — and it acts on units, not on training examples. Halting on validation is early stopping, a separate regularizer.',
            },
            {
              kind: 'mcq',
              id: 'ch08-q-training-2',
              prompt: 'Early stopping ends training when…',
              choices: [
                'performance on the validation set starts to deteriorate',
                'the training cost stops falling and reaches exactly zero',
                'performance on the training set starts to deteriorate',
                'the validation cost has fallen for a fixed number of epochs',
              ],
              answer: 0,
              explain:
                'Training cost keeps falling more or less forever, so it can never signal the right moment. Validation performance instead rises, peaks, then turns — and that turn is where overfitting begins. Stop there, or keep checkpoints and pick the best one afterward.',
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
                'Flipping a labeled cat photo horizontally and keeping its label',
                'Relabeling some dog photos as cats to even out the two classes',
                'Deleting the blurry images so the network trains on clean data',
                'Doubling the learning rate so each example counts for twice as much',
              ],
              answer: 0,
              explain:
                'Augmentation *adds* examples through transformations that keep the label true — zoom, rotation, flips, darkening — and a flipped cat is still a cat. Falsifying labels breaks that guarantee, deleting images shrinks the data instead of growing it, and the learning rate is an optimizer knob.',
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
            '**[[transfer-learning|Transfer learning]]** is arguably *the* place where neural networks leave shallow models in the dust. The setting: you have a good model trained on one big dataset (wild animals), and a new problem from a *different distribution* (domestic animals) with only a small labeled dataset. A shallow learner would force you to build another big dataset. With a deep network, you operate: **1)** take the big trained model, **2)** gather your small labeled dataset, **3)** remove the last layer or layers — the classification head that sits after the [[embedding]], **4)** bolt on new layers shaped for your problem, **5)** *freeze* the parameters of every remaining old layer, **6)** train only the new layers on your small dataset. The early layers already know [how to see edges, textures and shapes](sec:ch06-cnn) — knowledge that transfers.',
        },
        {
          type: 'p',
          md:
            'Freezing does two jobs at once, and the second is the one people miss. It preserves the borrowed knowledge, yes — but it also cuts the number of trainable parameters from tens of millions down to a few thousand, and a small dataset cannot possibly estimate tens of millions of numbers without memorizing itself. Once the new head has settled, it is often worth *unfreezing* the top few old layers and continuing at a much smaller learning rate — fine-tuning. That usually buys a little more, provided the new dataset is large enough not to wash away the features you came for. The further the new problem sits from the original, the deeper you cut and the more you retrain.',
        },
        {
          type: 'p',
          md:
            'No pre-trained model handy? Build your own stepping stone from *cheap* labels. Need a document classifier for your employer’s thousand-category taxonomy, but annotating a million documents is unaffordable? Train a first model on **Wikipedia pages**, using each page’s category as a free label — then fine-tune that model on a much smaller hand-annotated set from the real taxonomy. Far fewer expensive labels needed.',
        },
        {
          type: 'p',
          md:
            'From borrowed knowledge to raw speed: **algorithmic efficiency**. The **[[big-o-notation|big O notation]]** classifies algorithms by how running time grows with input size $N$, ignoring constants ($5N^2$ is just $O(N^2)$). Example: to find the two most distant numbers in a set, a double loop compares every pair — $N^2$ comparisons, $O(N^2)$. A smarter single sweep tracks the running minimum and maximum: $O(N)$, and the answer is their pair. Both are “efficient” in the polynomial-time sense, but at big-data scale $O(N^2)$ crawls — practitioners hunt for $O(N)$, $O(N \\log N)$, even $O(\\log N)$.',
        },
        {
          type: 'p',
          md:
            'And a fistful of practical speed rules for scientific Python: **avoid loops** — write $\\mathbf{w}\\mathbf{x}$ as `numpy.dot(w, x)`, not an element-by-element loop; matrix and vector operations run in optimized C. Pick the **right data structure**: membership tests are fast in a `set` and slow in a `list`; key lookups belong in a `dict` (a hashmap). Prefer battle-tested libraries — numpy, scipy, [[scikit-learn]] — over hand-rolled code. Use **generators** to stream huge collections one element at a time, `cProfile` to find the real hotspots, and, when the algorithm itself can’t improve, `multiprocessing` or compilers like PyPy and Numba.',
        },
        {
          type: 'hint',
          md:
            'The two rules pull against each other, which is worth noticing. Big O compares *algorithms*; constants compare *implementations*. A vectorized numpy call and a Python loop can have identical complexity and differ by a factor of a hundred in wall-clock time — and no amount of that factor will save an $O(N^2)$ method once $N$ reaches a million. Fix the growth rate first, then the constant, and profile before you touch either.',
        },
        {
          type: 'hint',
          md:
            'The transfer-learning recipe has a hidden hyperparameter: *how many* layers to remove and replace. Like everything else, it’s decided on the [validation set](sec:ch05-three-sets).',
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
                'They already encode general features like edges and textures',
                'Frozen layers take up far less disk space in the saved model',
                'Their weights are integers and cannot receive gradient updates',
                'Freezing raises the effective learning rate for the new layers',
              ],
              answer: 0,
              explain:
                'Early layers learned to see edges, textures and shapes — knowledge that transfers across distributions, from wild animals to domestic ones. Freezing keeps it and, just as importantly, protects it: a small dataset could never retrain millions of parameters without overfitting, but it *can* train a small new head on top.',
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
                'a `set`, whose membership test is near constant time',
                'a `list`, since scanning it in order is cache-friendly',
                'a `tuple`, since immutable objects are looked up faster',
                'a single string of all the elements, searched with `in`',
              ],
              answer: 0,
              explain:
                'A `set` is a hashmap, so `x in s` costs about the same whatever the size; a `list` or `tuple` must be scanned element by element, and immutability buys nothing here. Use a `dict` when you need key–value pairs rather than bare membership.',
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
        'Fraud detection, where genuine transactions vastly outnumber fraud',
        'Coin flips, where heads and tails each appear about half the time',
        'House-price regression, where the labels are continuous numbers',
        'Clustering a corpus of documents that carries no labels at all',
      ],
      answer: 0,
      explain:
        'Imbalance is about the *proportion of each class*, so it needs labelled classes of unequal size. When one class is rare, most algorithms happily sacrifice it — the boundary drifts into minority territory to keep the numerous majority happy.',
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
        'randomly removing majority-class examples from the training set',
        'randomly removing minority-class examples from the training set',
        'shrinking every feature vector by dropping its least useful entries',
        'training on fewer epochs so the majority class is seen less often',
      ],
      answer: 0,
      explain:
        'It rebalances by thinning the majority; oversampling instead duplicates the minority. Both make minority mistakes relatively more expensive. Thinning the *minority* would deepen the very problem you are trying to fix, and “under” refers to sampling, not to features or epochs.',
    },
    {
      kind: 'mcq',
      id: 'ch08-boss-5',
      prompt: 'SMOTE builds a synthetic minority example as $\\mathbf{x}_{new} = \\mathbf{x}_i + \\lambda(\\mathbf{x}_{zi} - \\mathbf{x}_i)$, where…',
      choices: [
        '$\\mathbf{x}_{zi}$ is a nearby minority example and $\\lambda$ is random in $[0,1]$',
        '$\\mathbf{x}_{zi}$ is the majority point nearest to $\\mathbf{x}_i$ and $\\lambda$ can exceed 1',
        '$\\mathbf{x}_{zi}$ is the mean of the whole training set and $\\lambda$ is negative',
        'both $\\mathbf{x}_i$ and $\\mathbf{x}_{zi}$ are majority examples and $\\lambda$ is fixed at 0.5',
      ],
      answer: 0,
      explain:
        'Both endpoints are minority examples — $\\mathbf{x}_{zi}$ is one of $\\mathbf{x}_i$’s $k$ nearest minority neighbors — and keeping $\\lambda$ inside $[0,1]$ places the new point *between* them, safely inside the minority region. Let $\\lambda$ escape that range, or pick a majority endpoint, and you would be inventing minority points in majority territory. ADASYN works the same way but generates more synthetics where minority points are scarcest.',
    },
    {
      kind: 'mcq',
      id: 'ch08-boss-6',
      prompt: 'Which family of algorithms often tolerates imbalanced data comparatively well, out of the box?',
      choices: [
        'Decision trees and the ensembles built from them',
        'k-means and the other distance-based clustering methods',
        'Linear and logistic regression with a squared-error cost',
        'Autoencoders and the other reconstruction-based networks',
      ],
      answer: 0,
      explain:
        'Trees split on purity rather than on a summed per-example cost, so a rare class can still earn its own leaf — which is why random forest and gradient boosting are frequently less rattled by imbalance out of the box. Verify the minority recall anyway; never assume it.',
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
        'the vector $\\hat{\\mathbf{x}}_i = [f_1(\\mathbf{x}_i), f_2(\\mathbf{x}_i)]$, keeping the original label',
        'the raw features $\\mathbf{x}_i$, relabeled with $f_1$’s output',
        'a random vector paired with a randomly chosen label',
        'the average of $f_1(\\mathbf{x}_i)$ and $f_2(\\mathbf{x}_i)$, with no label',
      ],
      answer: 0,
      explain:
        'The base models’ outputs become the *features* and the true $y_i$ stays the target, so the meta-model learns when to trust whom. Per-class scores can join the feature vector too. Averaging the outputs is a different (and simpler) combination method that trains no meta-model at all.',
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
        'runs a CNN on the image and an RNN on the text, then joins the embeddings',
        'converts the image to a caption first, then runs one RNN over both texts',
        'trains two separate networks that never share a loss or a gradient step',
        'feeds the raw pixels into the RNN one row at a time, alongside the text',
      ],
      answer: 0,
      explain:
        'One subnetwork per modality, embeddings concatenated (or averaged), a softmax or sigmoid layer on top — the standard multimodal pattern. The point is that the whole thing trains as *one* network, so the shared loss shapes both subnetworks; two networks that never exchange a gradient would learn nothing about how the modalities relate.',
    },
    {
      kind: 'mcq',
      id: 'ch08-boss-11',
      prompt: 'A network must output an object’s coordinates *and* its tag. The standard design is…',
      choices: [
        'a shared encoder with one ReLU head and one softmax head',
        'two entirely separate networks, each trained on its own labeled dataset',
        'a single softmax head emitting the coordinates as probabilities',
        'a decision tree bolted onto the CNN’s embedding to predict both',
      ],
      answer: 0,
      explain:
        'One encoder subnetwork produces the embedding, which feeds both heads: ReLU outputs positive reals for the coordinates (trained with MSE cost $C_1$), softmax outputs a class distribution for the tag (trained with cross-entropy $C_2$). The two costs cannot both be minimized exactly, so they are blended as $\\gamma C_1 + (1-\\gamma) C_2$ with $\\gamma$ tuned on the validation set. A softmax cannot emit coordinates — its outputs are constrained to sum to 1.',
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
        'the fraction of units switched off at random on each training pass',
        'the number of layers deleted permanently once training ends',
        'the fraction of training examples skipped at random in each epoch',
        'the amount by which validation accuracy may drop before stopping',
      ],
      answer: 0,
      explain:
        'A value between 0 and 1, tuned on validation: the more units silenced, the stronger the regularizing push, because no unit can rely on a specific partner always being awake. The units come back for the next pass — nothing is deleted — and it is units that are dropped, never training examples.',
    },
    {
      kind: 'mcq',
      id: 'ch08-boss-14',
      prompt: 'Models saved after each training epoch — used by early stopping — are called…',
      choices: ['checkpoints', 'dataset snapshots', 'residuals', 'embeddings'],
      answer: 0,
      explain:
        'Keep one checkpoint per epoch; stop when validation performance starts degrading, or train on and pick the best checkpoint at the end. Residuals are gradient boosting’s targets, and an embedding is a learned representation of an input — neither is a saved model.',
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
        'pre-train on Wikipedia pages, using their categories as free labels',
        'replace the employer’s taxonomy with Wikipedia’s own category tree',
        'hand-annotate a million documents first, then train a single model',
        'train only on the written definitions of each taxonomy category',
      ],
      answer: 0,
      explain:
        'Wikipedia hands you millions of documents that are already categorized, so the labels cost nothing. That first model learns to read documents in general; fine-tuning then needs far fewer expensive expert annotations to map that reading ability onto the real thousand-category taxonomy — which stays the actual target.',
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
        'Vectorized matrix and vector operations run in optimized C code',
        'The Python loop computes a different quantity than the dot product',
        'numpy keeps more decimal places, so the result is more accurate',
        'numpy automatically spreads the loop across every available CPU core',
      ],
      answer: 0,
      explain:
        '“Avoid loops whenever possible” is the first practical speed rule: scientific packages were engineered in C for exactly these operations, so the interpreter overhead of a per-element Python loop disappears. The two versions compute the same number to the same precision — only the time differs.',
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
      choices: ['`cProfile`', '`timeit`', '`multiprocessing`', '`numba.jit`'],
      answer: 0,
      explain:
        'Profile first, optimize second: `cProfile` reports where the time actually goes, function by function. `timeit` only times a snippet you already suspect, while `multiprocessing` and `numba.jit` are ways to *fix* a hotspot — useless until you know which one to fix.',
    },
  ],
};

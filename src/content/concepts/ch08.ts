import type { Concept } from './types';

/**
 * Chapter 8's vocabulary: the practitioner's chapter. Most of these are not
 * algorithms but habits — what to do when one class is rare, when two models
 * disagree, when the labels ran out, and when the code is too slow.
 */
export const conceptsCh08: Concept[] = [
  {
    id: 'imbalanced-dataset',
    term: 'imbalanced dataset',
    simple:
      'A dataset where one class is rare — hundreds of ordinary transactions for every fraudulent one. The awkward part is that the rare class is nearly always the one you actually care about.',
    technical:
      'The ratio itself is not the problem; the problem is that most learners minimize a *sum* of equally weighted per-example losses, so writing off the entire minority class is cheap and often optimal. [[accuracy]] then stops measuring anything useful, which is exactly why [[precision]] and [[recall]] exist — see [the metrics section](sec:ch05-metrics). Four families of fix: reprice the loss ([[class-weights]]), rebalance the data ([[oversampling]], [[undersampling]]), synthesize minority points ([[smote]], [[adasyn]]), or leave training alone and move the [[decision-threshold]] afterwards, which costs nothing and works better than it has any right to.',
    math:
      'With a positive rate $\\pi$, the always-negative classifier scores accuracy $1-\\pi$ — $0.99$ at $\\pi = 0.01$ — while its [[recall]] is exactly 0. For a calibrated probabilistic model, weighting the positive class by $w$ is equivalent to leaving the weights alone and lowering the threshold from $0.5$ to $\\frac{1}{1+w}$, which is why reweighting and threshold-moving so often produce nearly the same boundary.',
    teachesAt: 'ch08-imbalanced',
    see: ['class-weights', 'smote', 'recall', 'decision-threshold', 'cost-sensitive-accuracy'],
  },
  {
    id: 'class-weights',
    term: 'class weights',
    simple:
      'Tell the algorithm that missing a rare case hurts more than missing a common one. Nothing about the data changes — only the price list.',
    technical:
      'Each example’s loss is multiplied by a factor attached to its class, so the optimizer will trade several cheap majority mistakes for one expensive minority catch and the boundary moves accordingly. Cheaper than resampling — no rows are copied or discarded, so training time is unchanged — and supported directly by most SVM, tree and neural implementations. The library default of weights inversely proportional to class frequency is a starting point, not an answer: the honest weight comes from what a false negative actually costs, and a missed tumour and a missed advert are not the same number.',
    math:
      'Minimize $\\sum_i c_{y_i}\\,\\ell(f(\\mathbf{x}_i), y_i)$ with the balanced choice $c_k \\propto \\frac{N}{C \\cdot N_k}$. In a [[soft-margin-svm]] this splits the penalty into $C_+$ and $C_-$, so the two classes buy margin at different exchange rates. Under a calibrated model, weight $w$ on the positive class shifts the optimal threshold to $\\frac{1}{1+w}$ — the same boundary reached from the other direction.',
    teachesAt: 'ch08-imbalanced',
    see: ['imbalanced-dataset', 'svm-c', 'cost-sensitive-accuracy', 'decision-threshold'],
  },
  {
    id: 'oversampling',
    term: 'oversampling',
    simple:
      'Copy the rare examples until they stop being rare. The same data, given a louder voice.',
    technical:
      'Random sampling with replacement from the minority class. For a loss that sums over examples it is close to equivalent to [[class-weights]], with one difference that bites: exact duplicates let a flexible model memorize individual points, so the minority region can end up as a scatter of tiny islands drawn around the copies rather than a region with shape. It also inflates the training set and therefore the training time. The procedural rule that catches people out: resample *inside* each [[cross-validation]] fold, never before the split — otherwise copies of one example sit in training and validation at once and the score is fiction.',
    math:
      'Duplicating a minority example $r$ times multiplies its total loss contribution by $r$, exactly as a class weight of $r$ would. What differs is everything downstream of the duplicates: a [[bootstrap-sample]] now draws copies of copies, and [[k-nearest-neighbors|kNN]] finds $k$ identical points at distance 0, so the effective neighborhood shrinks to a single original example.',
    teachesAt: 'ch08-imbalanced',
    see: ['undersampling', 'class-weights', 'smote', 'imbalanced-dataset'],
  },
  {
    id: 'undersampling',
    term: 'undersampling',
    simple:
      'Throw away most of the common examples until the two classes are the same size. Faster to train, sometimes better — but you are burning data you paid for.',
    technical:
      'Random deletion from the majority class. On a very large dataset it can be the right call, since it cuts training time enormously and the majority class had evidence to spare; on a small one it raises [[model-variance|variance]], because the fitted boundary now rests on fewer points. Informed variants delete selectively rather than at random: Tomek links remove majority points pressed right up against a minority point, cleaning the frontier. The compromise most practitioners settle on is to thin the majority *and* synthesize minority points at the same time, and it composes beautifully with [[bagging]] — give each bag a different balanced undersample and nothing is discarded for good.',
    math:
      'Cutting the majority from $N_-$ down to $N_+$ discards $N_- - N_+$ examples and leaves an effective training size of $2N_+$, so the sampling variability of the boundary grows roughly as $1/\\sqrt{2N_+}$. EasyEnsemble sidesteps the loss entirely: train $B$ models on $B$ different balanced undersamples and combine them by [[majority-vote]], so every majority example is seen by some member.',
    teachesAt: 'ch08-imbalanced',
    see: ['oversampling', 'imbalanced-dataset', 'bagging', 'model-variance'],
  },
  {
    id: 'smote',
    term: 'SMOTE',
    simple:
      'Rather than copy a rare example, invent a new one between two of them. Pick a rare point, pick one of its rare neighbors, and drop a fresh point somewhere on the line joining the two — a plausible example nobody actually recorded.',
    technical:
      'Synthetic Minority Over-sampling Technique. Interpolating *broadens* the minority region instead of raising a tower on an existing point, and that is exactly what stops a classifier from memorizing duplicates the way [[oversampling]] invites it to. Two failure modes are worth knowing. A mislabeled minority point sitting deep in majority territory gets synthetics manufactured around it, so the noise is amplified rather than diluted. And in high dimensions the straight segment between two neighbors can pass through regions where no real example could ever live. It also has nothing sensible to say about categorical features — the SMOTE-NC variant patches that by taking the majority category among the neighbors.',
    math:
      '$\\mathbf{x}_{\\text{new}} = \\mathbf{x}_i + \\lambda(\\mathbf{x}_{zi} - \\mathbf{x}_i)$ with $\\lambda \\sim \\mathrm{Uniform}(0,1)$ and $\\mathbf{x}_{zi}$ drawn from the $k$ nearest **minority** neighbors of $\\mathbf{x}_i$, conventionally $k=5$. Keeping $\\lambda$ inside $[0,1]$ confines the new point to the segment; letting it escape would extrapolate outside the region the minority class actually occupies. Generating $r$ synthetics per minority point multiplies the minority count by $1+r$.',
    teachesAt: 'ch08-imbalanced',
    see: ['adasyn', 'oversampling', 'imbalanced-dataset', 'k-nearest-neighbors'],
  },
  {
    id: 'adasyn',
    term: 'ADASYN',
    simple:
      'SMOTE with a sense of priority. It manufactures the most new examples where the rare class is losing ground — right on the frontier with the common class — and leaves the comfortable interior alone.',
    technical:
      'Adaptive Synthetic sampling. Each minority point receives a quota proportional to how many of its neighbors belong to the majority class, so a point surrounded by the enemy is judged hard and gets many synthetics, while a point buried inside a minority cluster gets almost none. The effect is to push the decision boundary outward into the difficult region rather than fattening the easy one. That same instinct is the weakness: noise and mislabeled minority points look exactly like hard frontier points from the inside, so ADASYN amplifies them harder than [[smote]] does.',
    math:
      'For minority point $\\mathbf{x}_i$ let $r_i$ be the fraction of its $k$ nearest neighbors that belong to the majority class; normalize $\\hat{r}_i = r_i / \\sum_j r_j$ and generate $g_i = \\hat{r}_i \\cdot G$ synthetics at $\\mathbf{x}_i$, where $G$ is the total wanted. Each one is built by the same interpolation SMOTE uses. Setting every $\\hat{r}_i$ equal recovers plain SMOTE, so ADASYN is SMOTE with a non-uniform budget.',
    teachesAt: 'ch08-imbalanced',
    see: ['smote', 'oversampling', 'imbalanced-dataset'],
  },
  {
    id: 'model-averaging',
    term: 'model averaging',
    simple:
      'Run two or three different models on the same input and take the average of their answers. Where they disagree the average lands between them; where they agree it changes nothing.',
    technical:
      'The simplest way to combine *strong* models, as opposed to the hundreds of weak ones inside a [[random-forest]]. It pays only to the extent the members are uncorrelated — average three SVMs differing in one hyperparameter and you gain almost nothing, because they make the same mistakes on the same examples. Averaging probabilities generally beats [[majority-vote]] when the members are calibrated, since it keeps the confidence information a vote throws away. The rule that keeps you honest: check on the [[validation-set]] that the combination actually beats every single member, because it does not always.',
    math:
      'For members with error variance $\\sigma^2$ and pairwise correlation $\\rho$, $\\mathrm{Var}\\!\\left(\\frac{1}{B}\\sum_b f_b\\right) = \\rho\\sigma^2 + \\frac{1-\\rho}{B}\\sigma^2$; at $\\rho = 1$ the average is worth no more than one model. By convexity the average’s squared error never exceeds the *mean* of the members’ squared errors — but it can easily exceed the *best* member’s, which is why validating the combination is not optional.',
    teachesAt: 'ch08-combining-nets',
    see: ['stacking', 'majority-vote', 'ensemble-learning', 'validation-set'],
  },
  {
    id: 'stacking',
    term: 'stacking',
    simple:
      'Train a second model whose only job is to decide when to trust each of the first models. Their predictions become its features, and the true answer stays its target.',
    technical:
      'Unlike [[model-averaging]], the combiner is *learned*, so it can discover that one base model is reliable on short documents and another on long ones — a fixed average cannot express that. The trap is subtle and common: if the meta-model is trained on predictions the base models made about their own training data, those predictions are flatteringly good, and the meta-model learns to trust an accuracy that will not survive deployment. The fix is out-of-fold generation — produce every meta-feature with [[cross-validation]], so each base prediction is made by a model that never saw that example. The meta-model is deliberately kept simple, usually [[logistic-regression]], because it has few features and overfits easily.',
    math:
      'From base models $f_1,\\dots,f_K$ build $\\hat{\\mathbf{x}}_i = [f_1(\\mathbf{x}_i), \\dots, f_K(\\mathbf{x}_i)]$ and fit $g$ on $\\{(\\hat{\\mathbf{x}}_i, y_i)\\}$ — per-class scores may be concatenated instead of hard labels, giving $K \\cdot C$ meta-features. Under $k$-fold out-of-fold generation, $f_j(\\mathbf{x}_i)$ is always produced by a copy of $f_j$ fitted without the fold containing $i$.',
    teachesAt: 'ch08-combining-nets',
    see: ['model-averaging', 'ensemble-learning', 'cross-validation', 'majority-vote'],
  },
  {
    id: 'transfer-learning',
    term: 'transfer learning',
    simple:
      'Do not start from nothing. Take a network that already learned to see on a million photographs, cut off its last layer, bolt on a new one shaped for your problem, and train only that. The hard part — edges, textures, shapes — is already done.',
    technical:
      'It works because the early layers of a [[deep-learning|deep]] network learn features that are generic rather than task-specific, and generic features survive a change of distribution — from wild animals to domestic ones, from photographs to sketches. Freezing them does two jobs at once: it preserves that knowledge, and it cuts the number of trainable parameters down to something a small dataset can actually estimate without [[overfitting]]. How deep to cut is a [[hyperparameter]] — the further your task is from the original, the more layers you replace. Unfreezing afterwards and fine-tuning at a much smaller [[learning-rate]] usually adds a little more, provided the new dataset is large enough not to wash the old features away.',
    math:
      'Split the parameters as $\\theta = (\\theta_{\\text{body}}, \\theta_{\\text{head}})$, discard $\\theta_{\\text{head}}$, and optimize only the new $\\theta_{\\text{new}}$: the search is over $|\\theta_{\\text{new}}|$ dimensions rather than $|\\theta|$ — thousands instead of tens of millions — and the sample complexity falls with it. The objective is unchanged; it is ordinary [[gradient-descent]] with most partial derivatives held at zero.',
    teachesAt: 'ch08-transfer-efficiency',
    see: ['deep-learning', 'embedding', 'overfitting', 'self-supervised-learning'],
  },
  {
    id: 'checkpointing',
    term: 'checkpointing',
    simple:
      'Save a copy of the model after every pass over the data. Training can then be paused, resumed after a crash, or rewound to whichever copy turned out to be the best one.',
    technical:
      'This is what makes [[early-stopping]] practical: you do not have to recognize the peak in validation performance at the moment it happens — train straight past it and afterwards keep the checkpoint with the best score. It also insures a multi-day run against a dead node, and saving the optimizer state alongside the weights (momentum buffers, step counters, learning-rate schedule position) is what lets a resumed run *continue* rather than restart. The cost is disk: a large model saved every [[epoch]] fills a drive quickly, so implementations keep only the best few.',
    math:
      'After epoch $e$, store $\\theta^{(e)}$ and record $S(\\theta^{(e)})$ on the [[validation-set]]; return $\\theta^{(e^\\star)}$ with $e^\\star = \\arg\\max_e S(\\theta^{(e)})$. Choosing the maximum over $E$ noisy estimates is itself a mild selection on the validation set — with many epochs and a small validation split, part of the winner’s margin is luck, which is exactly why the [[test-set]] is never touched until the end.',
    teachesAt: 'ch08-training-tricks',
    see: ['early-stopping', 'validation-set', 'test-set', 'epoch'],
  },
  {
    id: 'big-o-notation',
    term: 'big O notation',
    simple:
      'A way of saying how much slower a program gets as the data grows, ignoring everything that does not change with size. Doubling the input might double the work or quadruple it, and that difference is the only part that survives at scale.',
    technical:
      'It describes a growth shape, not a running time: constants and lower-order terms are dropped, so five million operations plus a quadratic term is quadratic. The practical consequence is a hierarchy that turns brutal at big-data sizes — a pairwise double loop over a million examples is a million million operations, while a single sweep is a million. Constants do still matter in the real world, which is why a vectorized call can beat an asymptotically better hand-written Python loop; the notation compares *algorithms*, not implementations, and profiling compares implementations.',
    math:
      '$f(N) = O(g(N))$ means there exist $c > 0$ and $N_0$ with $f(N) \\le c\\,g(N)$ for all $N \\ge N_0$ — hence $5N^2 + 300N = O(N^2)$. The hierarchy that matters: $O(1) < O(\\log N) < O(N) < O(N\\log N) < O(N^2) < O(2^N)$. Sorting is $O(N\\log N)$; the exhaustive most-distant-pair search is $O(N^2)$; tracking a running minimum and maximum is $O(N)$ and returns the same answer.',
    teachesAt: 'ch08-transfer-efficiency',
    see: ['scikit-learn', 'k-nearest-neighbors'],
  },
];

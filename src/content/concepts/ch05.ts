import type { Concept } from './types';

/**
 * Chapter 5's vocabulary — the practitioner's chapter. Three clusters live
 * here: turning raw material into features, the bias/variance story and its
 * cures, and how a classifier is actually scored.
 *
 * Note the two `model-` prefixes: `model-bias` and `model-variance` are
 * properties of a fitted model, deliberately kept distinct from the plain
 * statistical `variance` of a random variable, which Chapter 2 owns.
 */
export const conceptsCh05: Concept[] = [
  {
    id: 'feature-engineering',
    term: 'feature engineering',
    simple:
      'The craft of turning raw material — server logs, a spreadsheet, a page of free text — into the columns of numbers a learning algorithm can actually read. It eats most of the time on a real project, and the features you invent usually matter more than the algorithm you pick.',
    technical:
      'A feature is *informative* when knowing it changes what you would guess about the label. Weak features put a ceiling on performance that no amount of [[model-capacity|capacity]] can lift — that is [[underfitting]] you cannot train your way out of. The counter-pressure is that every extra feature is another dimension, and dimensions are paid for in examples, so the craft is as much restraint as invention.',
    math:
      'Formally you are choosing a map $\\phi: \\mathcal{R} \\to \\mathbb{R}^{D}$ from raw records to [[feature-vector|feature vectors]]. A one-at-a-time diagnostic is the mutual information $I(X^{(j)}; Y) = H(Y) - H(Y \\mid X^{(j)})$ — the same [[entropy]] drop a [[decision-tree]] maximizes at each split. It is only one-at-a-time: two features can each score zero and be perfectly predictive together, which is the XOR case.',
    teachesAt: 'ch05-feature-engineering',
    see: ['one-hot-encoding', 'binning', 'normalization', 'feature-selection'],
  },
  {
    id: 'one-hot-encoding',
    term: 'one-hot encoding',
    simple:
      'Give every category its own yes/no column. Red, yellow and green become three columns, and each example switches exactly one of them on. It looks wasteful, and it is the honest thing to do.',
    technical:
      'The alternative — red 1, yellow 2, green 3 — smuggles in an ordering the data does not have, and a linear model will duly conclude that yellow sits halfway between red and green. One-hot refuses to say anything the data did not say, at a cost of one dimension per level. That cost bites when [[cardinality]] is high: a user-id column becomes a million near-empty columns. Genuinely ordered categories (poor/decent/good/excellent) are a different case — plain integers are right there.',
    math:
      'A feature with $k$ levels becomes $k$ binary columns, level $j$ mapping to the basis vector with a single 1 in position $j$. Every pair of levels then sits at the same distance $\\sqrt{2}$ from every other, which is precisely the statement that no order has been imposed. Linear models often drop one column (*dummy coding*) because the $k$ columns sum to 1 and are therefore collinear with the intercept.',
    statquest: 'one-hot encoding',
    teachesAt: 'ch05-feature-engineering',
    see: ['cardinality', 'binning', 'one-hot-vector', 'feature-engineering'],
  },
  {
    id: 'binning',
    term: 'binning (bucketing)',
    simple:
      'Chop a number into ranges and record only which range it fell in. Ages become child, teenager, adult; the exact number stops mattering. You are throwing away detail on purpose.',
    technical:
      'A bin boundary is a claim that variation inside the bucket is noise — genuine domain knowledge, and a hint that can let a model learn from fewer examples. It also lets a linear model express a non-monotone relationship (risk high for the very young *and* the very old) that one weight cannot. What you give up is resolution, and the boundaries are arbitrary: two people a day apart in age can land in different bins and be treated as different kinds of thing.',
    math:
      'Given cut points $t_1 < t_2 < \\dots < t_k$, the value $x$ becomes the [[one-hot-encoding|one-hot]] vector of its bin index $\\sum_{m}\\mathbb{1}[x > t_m]$. Edges are chosen by equal width ($t_m$ evenly spaced), equal frequency (quantiles, so each bin holds $N/k$ examples), or by a supervised criterion such as maximizing [[information-gain]] — which is exactly what a [[decision-tree]] does when it splits a numeric feature.',
    teachesAt: 'ch05-feature-engineering',
    see: ['one-hot-encoding', 'decision-tree', 'feature-engineering'],
  },
  {
    id: 'normalization',
    term: 'normalization (min–max scaling)',
    simple:
      'Squeeze a feature so its smallest observed value becomes zero and its largest becomes one. A column measured in thousands and a column measured in thousandths then get an equal hearing.',
    technical:
      'It matters because a feature with a wide numeric range produces large [[partial-derivative|partial derivatives]], so [[gradient-descent]] takes lopsided steps and has to crawl. Its weakness is outliers: one wild value defines the maximum and crushes every ordinary value into a sliver near zero — that is when [[standardization]] is the better choice. The min and max are *fitted quantities*: compute them on the training data and reuse them unchanged everywhere else.',
    math:
      '$\\bar{x}^{(j)} = \\dfrac{x^{(j)} - \\min^{(j)}}{\\max^{(j)} - \\min^{(j)}}$, mapping the observed range onto $[0,1]$ exactly. The transform is affine, so it preserves the shape of the distribution — it neither symmetrizes a skew nor tames an outlier, it only rescales. A value beyond the training range at prediction time lands outside $[0,1]$, which is harmless for most models and worth knowing about.',
    teachesAt: 'ch05-feature-engineering',
    see: ['standardization', 'gradient-descent', 'feature-engineering'],
  },
  {
    id: 'standardization',
    term: 'standardization (z-score)',
    simple:
      'Rescale a feature so its average sits at zero and a typical distance from that average is one. A value then reads as two above typical rather than as eighty-six.',
    technical:
      'Preferred for bell-shaped features, for [[unsupervised-learning|unsupervised]] methods that lean on distances, and whenever outliers would wreck a min–max squeeze — an extreme value stretches the tail here rather than compressing the middle. It does not bound the output, so a pipeline that needs values inside a fixed range wants [[normalization]] instead. Like every fitted transform, $\\mu$ and $\\sigma$ come from the training data only; computing them over the whole dataset leaks the holdout sets into training.',
    math:
      '$\\hat{x}^{(j)} = \\dfrac{x^{(j)} - \\mu^{(j)}}{\\sigma^{(j)}}$, where $\\mu^{(j)}$ is the feature mean and $\\sigma^{(j)}$ its [[standard-deviation]]. The result has mean 0 and [[variance]] 1 by construction, for any input distribution whatsoever — the shape is untouched, only the location and the scale move.',
    teachesAt: 'ch05-feature-engineering',
    see: ['normalization', 'variance', 'standard-deviation'],
  },
  {
    id: 'data-imputation',
    term: 'data imputation',
    simple:
      'Filling in the blanks. Some rows arrive with a value missing and most algorithms refuse a hole, so you put something there — and what you choose to put there is a modelling decision, not a formality.',
    technical:
      'Four usual choices, with different intents: the feature mean (harmless, adds nothing); a value far outside the normal range (flags the gap, so the model can learn a rule for it); a mid-range value (so the feature barely moves the prediction); or a small regression predicting the missing feature from the others. With enough data, adding a binary *was-missing* indicator beats all of them, because missingness is usually informative — a blank income field is not a random blank. Whichever you pick, the identical rule must run at prediction time.',
    math:
      'Mean imputation replaces $x^{(j)}$ by $\\hat{\\mu}^{(j)} = \\frac{1}{|\\mathcal{S}_j|}\\sum_{i \\in \\mathcal{S}_j} x_i^{(j)}$ over the examples where the feature is present. It preserves the mean but shrinks the [[variance]], so it quietly biases anything that depends on spread. Regression imputation fits $x^{(j)} \\approx g(\\mathbf{x}^{(-j)})$; *multiple* imputation goes further and samples several completions, refitting once per completion so the uncertainty stays visible.',
    statquest: 'missing data',
    teachesAt: 'ch05-feature-engineering',
    see: ['feature-engineering', 'variance'],
  },
  {
    id: 'cardinality',
    term: 'cardinality',
    simple:
      'How many different values a column can take. Two for a yes/no field, a couple of hundred for a country, a million for a user id — and that last one is where the trouble starts.',
    technical:
      '[[one-hot-encoding|One-hot encoding]] a high-cardinality feature adds one column per level, nearly all of them almost always zero, and each has to earn its weight from a handful of examples. It also skews split-based learners: [[information-gain]] adores a feature with many levels, because it can carve the data into perfectly pure slivers that generalize to nothing. The remedies are grouping rare levels into a single *other* bucket, target or frequency encoding, and — for the truly large cases — an [[embedding-layer|embedding]] that learns a short dense vector per level.',
    math:
      'For a categorical feature with level set $\\mathcal{V}$, cardinality is $|\\mathcal{V}|$, and one-hot costs exactly $|\\mathcal{V}|$ parameters per downstream unit. The overfitting risk is visible in [[entropy]]: a split on a feature with $|\\mathcal{V}| = N$ gives $H = 0$ in every child and maximal apparent [[information-gain]]. C4.5 corrects for it by dividing the gain by the split’s own entropy, $-\\sum_k \\frac{|\\mathcal{S}_k|}{|\\mathcal{S}|}\\log_2\\frac{|\\mathcal{S}_k|}{|\\mathcal{S}|}$.',
    teachesAt: 'ch05-feature-engineering',
    see: ['one-hot-encoding', 'information-gain', 'embedding-layer'],
  },
  {
    id: 'training-set',
    term: 'training set',
    simple:
      'The big slice of your labelled data that the algorithm is allowed to learn from. Everything the model knows, it learned here.',
    technical:
      'Usually 70% of the data, and upwards of 95% when data is plentiful. Its size is the main lever on [[model-variance|variance]]: more examples make it harder for a model to bend around noise. What it cannot do is tell you whether the model [[generalization|generalizes]] — error measured here falls monotonically as [[model-capacity|capacity]] rises, so it is structurally silent about [[overfitting]]. Anything fitted, scalers and imputers included, must be fitted here and nowhere else.',
    math:
      'The training set $\\mathcal{S}_{\\text{train}} = \\{(\\mathbf{x}_i, y_i)\\}_{i=1}^{N}$ defines the *empirical risk* $\\hat{R}(f) = \\frac{1}{N}\\sum_i \\ell(f(\\mathbf{x}_i), y_i)$, which is what training minimizes. What you actually want small is the true risk $R(f) = \\mathbb{E}_{(\\mathbf{x},y)\\sim P}\\left[\\ell(f(\\mathbf{x}), y)\\right]$. Here is the catch: $\\hat{R}$ is an [[unbiased-estimator|unbiased estimate]] of $R$ only for a model chosen *independently* of this sample — and the trained model was chosen by looking at it.',
    teachesAt: 'ch05-three-sets',
    see: ['validation-set', 'test-set', 'holdout', 'overfitting'],
  },
  {
    id: 'validation-set',
    term: 'validation set',
    simple:
      'A small slice held back so you can compare candidates fairly. Train several models on the big slice, ask each about the held-back examples, and keep whichever answers best.',
    technical:
      'The workbench for every choice you make yourself: which algorithm, which [[hyperparameter]] values, which features, when to stop. Each of those decisions leaks a little of the validation set into the model, so after enough comparisons the validation score is optimistic — you have, mildly, fitted to it. That is exactly why a separate [[test-set]] exists, and why [[cross-validation]] takes over when the data is too small to spare a decent slice.',
    math:
      'With $k$ candidates scored on $n$ validation examples, each accuracy has standard error about $\\sqrt{p(1-p)/n}$, and you report the *maximum* of $k$ noisy scores — an estimator biased upward by roughly $\\sigma\\sqrt{2\\ln k}$ for large $k$. At $n = 1000$ that standard error is about $1.5$ percentage points, so a gap smaller than that between two candidates is not a gap.',
    statquest: 'cross validation',
    teachesAt: 'ch05-three-sets',
    see: ['test-set', 'cross-validation', 'hyperparameter', 'holdout'],
  },
  {
    id: 'test-set',
    term: 'test set',
    simple:
      'The sealed envelope. You open it once, at the very end, to learn how the finished model really does — and then it is spent.',
    technical:
      'Its entire value is its innocence: no decision was taken against it, so its verdict is unbiased. Peek at it, tune against it, or re-run after a disappointing number, and you have converted it into a second [[validation-set]] — the score survives, the guarantee does not. When reuse is unavoidable (a public benchmark, a project running for years), assume the number drifts optimistic with every look and treat the gap to [[training-set|training]] error as the more honest signal.',
    math:
      'Held-out error $\\hat{R}_{\\text{test}}(f) = \\frac{1}{n}\\sum_{i=1}^{n}\\ell(f(\\mathbf{x}_i), y_i)$ is an [[unbiased-estimator|unbiased estimator]] of the true risk $R(f)$ *given* that $f$ was fixed before the set was touched. Hoeffding’s inequality then bounds the error, $\\Pr(|\\hat{R} - R| > \\epsilon) \\le 2e^{-2n\\epsilon^{2}}$, so $n = 2000$ pins it to roughly $\\pm 0.03$ with 95% confidence — which is why a small test set cannot separate two close models however carefully you stare at it.',
    statquest: 'cross validation',
    teachesAt: 'ch05-three-sets',
    see: ['validation-set', 'holdout', 'training-set'],
  },
  {
    id: 'holdout',
    term: 'holdout set',
    simple:
      'Any data kept out of training so that it can judge the result. The validation and test sets together are your holdouts — data the learning algorithm is forbidden to see.',
    technical:
      'Holding out is the cheapest honest evaluation there is: one split, one fit, one score. Its weaknesses are the split itself — on a small dataset one unlucky partition moves the score by several points — and the examples training has lost. [[cross-validation]] fixes both by rotating the holdout, at $k$ times the compute. The split must respect structure: group by patient, by user, by document, or by time, or near-duplicates on both sides will hand you a score nobody can reproduce.',
    math:
      'A random split assigns each example independently, so a holdout of $n$ examples from a class with prevalence $p$ contains $\\mathrm{Binomial}(n, p)$ positives — at $p = 0.02$ and $n = 200$ that is four positives on average, with a real chance of one or none. *Stratified* splitting fixes the per-class counts instead of sampling them, which is why it is the default on [[imbalanced-dataset|imbalanced data]].',
    statquest: 'cross validation',
    teachesAt: 'ch05-three-sets',
    see: ['validation-set', 'test-set', 'cross-validation'],
  },
  {
    id: 'model-bias',
    term: 'bias (of a model)',
    simple:
      'How wrong a model is even on the data it trained on. A straight ruler laid over a curve has high bias — not because it was unlucky, but because it was never able to bend.',
    technical:
      'High bias means [[underfitting]]: the model family cannot express the pattern, or the features do not carry it. The signature is high error on training *and* holdout data at once — the two curves lie close together and both are bad. The cures add expressive power: a richer model, more [[model-capacity|capacity]], better features. This is not the statistical bias of an estimator; here it names the part of the error that no amount of extra data would remove.',
    math:
      'Write $\\bar{f}(\\mathbf{x}) = \\mathbb{E}_{\\mathcal{S}}\\left[f_{\\mathcal{S}}(\\mathbf{x})\\right]$ for the average prediction over training sets drawn from the same distribution. Bias is $\\bar{f}(\\mathbf{x}) - \\mathbb{E}[y \\mid \\mathbf{x}]$: the gap between the average model and the truth. It enters the error squared, $\\mathbb{E}\\left[(y - f_{\\mathcal{S}}(\\mathbf{x}))^{2}\\right] = \\mathrm{bias}^{2} + \\mathrm{variance} + \\sigma^{2}$, and more data shrinks the variance term while leaving bias exactly where it was.',
    statquest: 'bias and variance',
    teachesAt: 'ch05-overfitting',
    see: ['underfitting', 'model-variance', 'bias-variance-tradeoff', 'model-capacity'],
  },
  {
    id: 'model-variance',
    term: 'variance (of a model)',
    simple:
      'How much the model would change if you had happened to collect a different sample of the same data. High variance means it is memorizing the accidents of the examples it saw rather than the pattern behind them.',
    technical:
      'The signature of [[overfitting]]: near-perfect training error, distinctly worse holdout error, and a model that looks different every time you resample. Caused by [[model-capacity|capacity]] out of proportion to the data, or by more features than examples. It falls with more data, fewer dimensions, [[regularization]], or averaging several models — [[bagging]] exists for precisely this. It is not the [[variance]] of a random variable, which measures spread of values rather than sensitivity to the sample.',
    math:
      'Variance is $\\mathbb{E}_{\\mathcal{S}}\\left[\\left(f_{\\mathcal{S}}(\\mathbf{x}) - \\bar{f}(\\mathbf{x})\\right)^{2}\\right]$: the expected squared deviation of one fitted model from the average fitted model, over training sets $\\mathcal{S}$. It typically decays like $O(1/N)$ in the sample size and grows with the number of effectively free parameters — which is why the two levers against it are more data and fewer parameters.',
    statquest: 'bias and variance',
    teachesAt: 'ch05-overfitting',
    see: ['overfitting', 'model-bias', 'bias-variance-tradeoff', 'variance'],
  },
  {
    id: 'bias-variance-tradeoff',
    term: 'bias–variance tradeoff',
    simple:
      'Two ways of being wrong that pull in opposite directions. Make the model simpler and it stops chasing noise but starts missing the pattern; make it richer and it catches the pattern but starts chasing noise. The best model sits at neither end.',
    technical:
      'Total error splits into a bias part, a variance part and irreducible noise, and [[model-capacity|capacity]] moves the first two in opposite directions. That is why the validation curve is U-shaped while the training curve only falls: the minimum is where the marginal variance you buy costs more than the bias you shed. Every regularizer in this chapter trades a little [[model-bias|bias]] for a lot of [[model-variance|variance]]. The exchange rate is not fixed — more data flattens the variance arm, which is why large datasets support larger models.',
    math:
      'For squared loss the decomposition is exact: $\\mathbb{E}\\left[(y - f_{\\mathcal{S}}(\\mathbf{x}))^{2}\\right] = \\underbrace{\\left(\\bar{f}(\\mathbf{x}) - \\mathbb{E}[y \\mid \\mathbf{x}]\\right)^{2}}_{\\mathrm{bias}^{2}} + \\underbrace{\\mathbb{E}_{\\mathcal{S}}\\left[\\left(f_{\\mathcal{S}}(\\mathbf{x}) - \\bar{f}(\\mathbf{x})\\right)^{2}\\right]}_{\\mathrm{variance}} + \\sigma^{2}$. Only the first two terms are yours to move; $\\sigma^{2}$ is noise in $y$ itself and bounds the best error anyone could achieve.',
    statquest: 'bias and variance',
    teachesAt: 'ch05-regularization',
    see: ['model-bias', 'model-variance', 'regularization', 'model-capacity'],
  },
  {
    id: 'underfitting',
    term: 'underfitting',
    simple:
      'The model is not even good on the questions it was shown the answers to. Either it is too rigid to express the pattern, or the features it was handed do not contain the pattern at all.',
    technical:
      'Diagnosed by high error on the [[training-set]] alone — you do not need a holdout to spot it. Two distinct causes with different cures: too little [[model-capacity|capacity]] (a straight line through curved data — raise the degree, add layers, weaken [[regularization]]) or too little signal (predicting a disease from shoe size — no model recovers information the features never had). Adding examples helps neither, which is the fastest way to tell it apart from [[overfitting]].',
    math:
      'Underfitting is a large bias term: the best member of the hypothesis class $\\mathcal{F}$ is already far from the truth, $\\min_{f \\in \\mathcal{F}} R(f) \\gg \\sigma^{2}$. That gap is the *approximation error*, a property of the class rather than of the sample — which is exactly why letting $N \\to \\infty$ leaves it untouched.',
    statquest: 'bias and variance',
    teachesAt: 'ch05-overfitting',
    see: ['model-bias', 'overfitting', 'model-capacity', 'feature-engineering'],
  },
  {
    id: 'overfitting',
    term: 'overfitting',
    simple:
      'The model learned the exam paper instead of the subject. It scores brilliantly on the examples it studied and stumbles on anything new, because it fitted the accidents of those particular examples.',
    technical:
      'Diagnosed by the *gap*: low training error, much higher holdout error. Caused by [[model-capacity|capacity]] out of proportion to the data — a degree-20 polynomial through 15 points, a tree grown until every leaf is pure, more features than examples. Every cure either reduces effective capacity or increases effective data: a simpler model, [[regularization]], [[dimensionality-reduction|fewer dimensions]], [[data-augmentation]], [[early-stopping]], more labels. Notice it is invisible in the training curve, which falls monotonically with capacity and will reassure you all the way into the disaster.',
    math:
      'With capacity $h$ and $N$ examples, generalization bounds take the shape $R(f) \\le \\hat{R}(f) + O\\!\\left(\\sqrt{h/N}\\right)$ — see [[pac-learning]]. The gap term grows with capacity and shrinks with data, which is the whole story in one expression: at fixed $N$, driving $\\hat{R}$ to zero by raising $h$ buys training error with generalization.',
    statquest: 'bias and variance',
    teachesAt: 'ch05-overfitting',
    see: ['model-variance', 'underfitting', 'regularization', 'model-capacity'],
  },
  {
    id: 'model-capacity',
    term: 'model capacity',
    simple:
      'How many different shapes a model is able to take. A straight line has almost none; a high-degree wiggly curve has a great deal. Capacity is not good or bad in itself — it has to match the amount of data you have.',
    technical:
      'The dial behind the whole chapter: polynomial degree, tree depth, hidden units, number of features, and inversely the [[regularization]] strength. *Effective* capacity is not the raw parameter count — a heavily penalized thousand-parameter model can be less flexible than a free ten-parameter one, which is why regularization works at all. Raise it and training error falls monotonically while holdout error traces a U.',
    math:
      'Classical measures count the labellings a class can realize: the VC dimension is the largest number of points the class can label in every possible way. A linear classifier in $D$ dimensions has VC dimension $D + 1$; a 1-nearest-neighbour rule has infinite VC dimension and works perfectly well, which is a hint that the bound $R \\le \\hat{R} + O(\\sqrt{h/N})$ is loose rather than wrong.',
    statquest: 'bias and variance',
    teachesAt: 'ch05-overfitting',
    see: ['overfitting', 'underfitting', 'regularization', 'hyperparameter'],
  },
  {
    id: 'regularization',
    term: 'regularization',
    simple:
      'Charging the model rent for complexity. It may still be complicated, but only if the extra accuracy is worth the fee — and mostly it is not, so the model comes out simpler and travels better.',
    technical:
      'Any modification that lowers holdout error at the cost of training error. The classic form adds a penalty on the size of the weights, so the optimiser must buy each unit of complexity with training-error savings; the strength is a [[hyperparameter]] you tune. The purchase is a small rise in [[model-bias|bias]] for a large drop in [[model-variance|variance]]. The family is wider than penalties: [[dropout]], [[early-stopping]], [[data-augmentation]] and [[pruning]] are all regularizers, and so is choosing a smaller model to begin with.',
    math:
      'Minimize $\\hat{R}(f) + \\lambda\\,\\Omega(f)$ rather than $\\hat{R}(f)$ alone, with $\\Omega$ measuring complexity and $\\lambda \\ge 0$ pricing it. Under [[maximum-a-posteriori|MAP]] estimation this *is* a [[prior]] on the parameters: a Gaussian prior gives $\\Omega = \\|\\mathbf{w}\\|_2^{2}$, a Laplace prior gives $\\Omega = \\|\\mathbf{w}\\|_1$. Watch the letter: this chapter writes the strength as $C$, ridge and lasso libraries call it `alpha`, and SVM and logistic-regression libraries use $C$ for its *inverse*.',
    statquest: 'regularization ridge lasso',
    teachesAt: 'ch05-regularization',
    see: ['l1-regularization', 'l2-regularization', 'bias-variance-tradeoff', 'maximum-a-posteriori'],
  },
  {
    id: 'l1-regularization',
    term: 'L1 regularization (lasso)',
    simple:
      'Charge the model for the total size of its weights, each counted at face value. Under that charge the cheapest saving is to switch a feature off completely, so many weights end up at exactly zero.',
    technical:
      'The distinctive behaviour is [[sparse-model|sparsity]]: it does not merely shrink weights, it zeroes them, performing [[feature-selection]] as a side effect and leaving a model you can read aloud. The reason is geometric — the constraint region is a diamond whose corners sit on the axes, and a corner is a point where some weight is exactly zero. Two costs: it is not differentiable at zero, so plain [[gradient-descent]] needs help (subgradients, coordinate descent, proximal steps); and among correlated features it keeps one essentially at random and zeroes its twins.',
    math:
      '$\\Omega(\\mathbf{w}) = \\|\\mathbf{w}\\|_1 = \\sum_{j=1}^{D}\\left|w^{(j)}\\right|$, whose subgradient is $\\mathrm{sign}(w^{(j)})$ — a push of constant size no matter how small the weight, so a weight without enough gradient support is driven to zero and *stays* there. With orthogonal features the solution is soft thresholding, $w^{(j)} = \\mathrm{sign}(\\hat{w}^{(j)})\\max\\!\\left(0,\\ |\\hat{w}^{(j)}| - \\lambda\\right)$: subtract $\\lambda$, clip at zero.',
    statquest: 'lasso regression',
    teachesAt: 'ch05-regularization',
    see: ['l2-regularization', 'sparse-model', 'feature-selection', 'elastic-net'],
  },
  {
    id: 'l2-regularization',
    term: 'L2 regularization (ridge)',
    simple:
      'Charge the model for the squares of its weights. Large weights become very expensive and small ones nearly free, so everything is pulled gently toward zero without anything actually landing on it.',
    technical:
      'Smooth and [[convex]], so it drops straight into [[gradient-descent]]: the update becomes a small multiplicative shrink of every weight at every step, which is why frameworks call it *weight decay*. It handles correlated features gracefully, splitting the weight between them rather than picking a winner, and it usually edges out [[l1-regularization|L1]] on raw holdout error. What it will not give you is a sparse model — weights approach zero asymptotically and essentially never arrive.',
    math:
      '$\\Omega(\\mathbf{w}) = \\|\\mathbf{w}\\|_2^{2} = \\sum_j \\left(w^{(j)}\\right)^{2}$, with gradient $2w^{(j)}$: a push proportional to the weight, vanishing as the weight does. Ridge regression keeps a [[closed-form-solution]], $\\mathbf{w} = \\left(\\mathbf{X}^\\top\\mathbf{X} + \\lambda\\mathbf{I}\\right)^{-1}\\mathbf{X}^\\top\\mathbf{y}$ — and adding $\\lambda\\mathbf{I}$ makes that matrix invertible even when features are collinear, which is a second, quieter reason ridge is used.',
    statquest: 'ridge regression',
    teachesAt: 'ch05-regularization',
    see: ['l1-regularization', 'elastic-net', 'closed-form-solution', 'convex'],
  },
  {
    id: 'elastic-net',
    term: 'elastic net',
    simple:
      'Use both penalties at once, with a dial for how much of each. You get the feature-switching-off behaviour of one and the stability of the other.',
    technical:
      'The fix for lasso’s worst habit. Faced with a group of strongly correlated features, [[l1-regularization|L1]] keeps one at random and zeroes the rest, so the chosen set changes when you resample; adding an [[l2-regularization|L2]] term makes the penalty strictly convex again and the group is kept or dropped together. The price is two [[hyperparameter|hyperparameters]] instead of one, tuned together on a two-dimensional [[grid-search|grid]].',
    math:
      '$\\Omega(\\mathbf{w}) = \\alpha\\|\\mathbf{w}\\|_1 + (1 - \\alpha)\\|\\mathbf{w}\\|_2^{2}$ with mixing weight $\\alpha \\in [0,1]$: $\\alpha = 1$ is pure lasso, $\\alpha = 0$ pure ridge. Its constraint region is a diamond with bowed-out edges — it keeps the axis corners that produce sparsity while being strictly convex everywhere else, which is what buys back the unique solution lasso lacks.',
    statquest: 'elastic net regression',
    teachesAt: 'ch05-regularization',
    see: ['l1-regularization', 'l2-regularization', 'sparse-model'],
  },
  {
    id: 'sparse-model',
    term: 'sparse model',
    simple:
      'A model that uses only a handful of the features it was offered and ignores the rest completely. You can print it on an index card and hand it to whoever has to justify the decision.',
    technical:
      'Sparsity is a claim about the *solution*, not the data: most weights are exactly zero, so most features never enter a prediction. Three payoffs — cheaper inference, since the unused features need not even be collected; explainability, since a six-term model can be inspected; and often a genuine [[model-variance|variance]] reduction, when the discarded features were noise. The risk is false confidence: [[l1-regularization|L1]] picks one member of a correlated group essentially at random, so "the model selected feature 12" is a weaker statement than it looks.',
    math:
      'Sparsity is $\\|\\mathbf{w}\\|_0 = \\left|\\{j : w^{(j)} \\ne 0\\}\\right|$, a count of non-zeros. Minimizing it directly is combinatorial — $2^{D}$ subsets — so $\\|\\mathbf{w}\\|_1$ is used as its convex surrogate, and under conditions on the feature correlations the two recover the same support. That relaxation is the same one underlying compressed sensing.',
    statquest: 'lasso regression',
    teachesAt: 'ch05-regularization',
    see: ['l1-regularization', 'feature-selection', 'elastic-net'],
  },
  {
    id: 'feature-selection',
    term: 'feature selection',
    simple:
      'Deciding which columns actually deserve to be in the model. Dropping the ones that carry nothing makes it faster, easier to explain, and often better on new data.',
    technical:
      'Three families. *Filters* score each feature on its own — correlation, mutual information, a chi-squared test — which is cheap and blind to interactions. *Wrappers* search subsets and judge each by training a model: accurate, expensive. *Embedded* methods select while fitting, which is what [[l1-regularization|L1]] does for free and what tree importances give you afterwards. The trap in all three is selecting before splitting: choose features using the whole dataset and your [[cross-validation]] score is already contaminated.',
    math:
      'The exhaustive problem is $\\arg\\min_{\\mathcal{J} \\subseteq \\{1,\\dots,D\\}} R(f_{\\mathcal{J}})$ over $2^{D}$ subsets — 1024 for ten features, over a million for twenty. Greedy forward selection adds the feature with the largest improvement at each step and stops when the improvement is within noise: $O(D^{2})$ model fits, and a local optimum, as [[greedy-algorithm|greedy search]] always gives.',
    statquest: 'lasso regression',
    teachesAt: 'ch05-regularization',
    see: ['l1-regularization', 'sparse-model', 'dimensionality-reduction', 'feature-engineering'],
  },
  {
    id: 'dropout',
    term: 'dropout',
    simple:
      'While training a network, switch off a random handful of its units on every pass. No unit can count on any other being there, so the network stops building fragile chains and learns several independent routes to the answer.',
    technical:
      'A regularizer for [[neural-network|neural networks]] that costs nothing at prediction time. Each unit is kept with probability $p$ during training, independently per example and per step, so every update trains a different thinned sub-network; at test time all units are present and the weights are rescaled so the expected input to each unit is unchanged. The effect is close to averaging an exponentially large [[ensemble-learning|ensemble]]. Typical rates: around 0.5 in wide fully-connected layers, much less or none in convolutional layers, which are already constrained by weight sharing.',
    math:
      'Training multiplies each activation by an independent mask $m_j \\sim \\mathrm{Bernoulli}(p)$, giving $\\tilde{h}_j = m_j h_j$ and $\\mathbb{E}[\\tilde{h}_j] = p\\,h_j$. Inference must match that expectation, either by scaling weights by $p$ or — the usual implementation, *inverted dropout* — by dividing by $p$ during training. For a linear model with squared loss, dropout is provably equivalent to [[l2-regularization|L2]] on rescaled weights; for a deep network it is a stronger and stranger thing.',
    teachesAt: 'ch05-regularization',
    see: ['regularization', 'neural-network', 'ensemble-learning', 'early-stopping'],
  },
  {
    id: 'batch-normalization',
    term: 'batch normalization',
    simple:
      'Between the layers of a network, recentre and rescale the numbers flowing through so they stay in a sensible range. Later layers then stop having to chase a moving target every time the earlier ones change.',
    technical:
      'Standardizes each unit’s pre-activation using the mean and variance of the current [[minibatch]], then applies a learned scale and shift so the layer can undo the normalization when that is genuinely better. It permits much larger [[learning-rate|learning rates]], blunts sensitivity to initialization, and regularizes mildly, because each example’s normalization depends on which other examples share its batch — noise the network cannot fit. The catch is that training and inference behave differently (batch statistics against running averages), and small batches make the estimates noisy.',
    math:
      'For pre-activations $z_1,\\dots,z_m$ in a batch, $\\hat{z}_i = \\dfrac{z_i - \\mu_B}{\\sqrt{\\sigma_B^{2} + \\epsilon}}$ with $\\mu_B$ and $\\sigma_B^{2}$ the batch mean and [[variance]], then $y_i = \\gamma\\hat{z}_i + \\beta$ with $\\gamma, \\beta$ learned. The $\\epsilon$ guards against division by zero, and setting $\\gamma = \\sqrt{\\sigma_B^{2} + \\epsilon}$, $\\beta = \\mu_B$ recovers the identity — so inserting the layer can never cost expressive power.',
    teachesAt: 'ch05-regularization',
    see: ['regularization', 'neural-network', 'minibatch', 'standardization'],
  },
  {
    id: 'data-augmentation',
    term: 'data augmentation',
    simple:
      'Manufacture new training examples by altering the ones you have in ways that do not change the answer. A cat photo flipped left to right is still a cat, and now you have two.',
    technical:
      'The cheapest way to cut [[model-variance|variance]] when labels are scarce, because it attacks the sample size rather than the model. Every transform asserts an invariance: flips and crops for natural photographs, time-warps and background noise for audio, synonym swaps and back-translation for text. Assert a false one and you have poisoned the labels — mirroring a road sign changes what it says, and mirroring a digit turns 2 into nothing at all. Related to but distinct from [[smote]], which synthesizes examples of a rare class rather than variants of an existing one.',
    math:
      'With a set of label-preserving transforms $\\mathcal{T}$, training minimizes $\\frac{1}{N}\\sum_i \\mathbb{E}_{\\tau \\sim \\mathcal{T}}\\left[\\ell(f(\\tau(\\mathbf{x}_i)), y_i)\\right]$ instead of $\\frac{1}{N}\\sum_i \\ell(f(\\mathbf{x}_i), y_i)$. The expectation is estimated by drawing one fresh $\\tau$ per example per [[epoch]], so the model effectively never sees the same input twice. To second order this equals a penalty on the [[gradient]] of $f$ along the directions $\\mathcal{T}$ moves — a smoothness prior, which is why it regularizes.',
    teachesAt: 'ch05-regularization',
    see: ['regularization', 'overfitting', 'smote', 'dropout'],
  },
  {
    id: 'early-stopping',
    term: 'early stopping',
    simple:
      'Watch the score on held-out data while training, and stop the moment it starts getting worse instead of better. The epochs after that point are spent memorizing, not learning.',
    technical:
      'Regularization by wall clock. Gradient descent fits broad structure first and fine noise last, so the number of [[epoch|epochs]] behaves like a capacity dial and the validation minimum is where capacity meets the data. In practice you keep a running best checkpoint plus a *patience* — stop after $k$ epochs with no improvement, then restore the best weights — because the curve is noisy and the first uptick is usually nothing. One hyperparameter, no extra compute, which is why it is nearly always on.',
    math:
      'For a quadratic loss with curvature $\\lambda_i$ along eigendirection $i$, $t$ steps of gradient descent at rate $\\alpha$ leave the weight at $w_i(t) = \\left(1 - (1 - \\alpha\\lambda_i)^{t}\\right)w_i^{\\star}$. Low-curvature directions have barely moved when training stops — exactly the shrinkage [[l2-regularization|L2]] applies, with an effective penalty $\\lambda_{\\mathrm{L2}} \\approx 1/(\\alpha t)$. Stopping early and penalizing weights are, to this approximation, the same regularizer.',
    teachesAt: 'ch05-regularization',
    see: ['regularization', 'validation-set', 'l2-regularization', 'epoch'],
  },
  {
    id: 'confusion-matrix',
    term: 'confusion matrix',
    simple:
      'A four-box table crossing what was true with what the model said. Every classification metric you will ever quote is arithmetic on those four numbers.',
    technical:
      'One axis is the truth, the other the prediction — always check which way round a library prints it. Its value is that it keeps the two kinds of mistake apart, and they almost never cost the same: a false alarm and a miss have different consequences and often different price tags. Reading it before quoting any single score is a habit worth acquiring, because a scalar hides which mistake the model is making. For $k$ classes it becomes a $k \\times k$ table whose off-diagonal cells say which classes get mistaken for which.',
    math:
      'The binary table holds $TP, FP, FN, TN$ with $TP + FP + FN + TN = N$. Everything else is a ratio of its margins: [[precision]] $= TP/(TP+FP)$ divides by a column, [[recall]] $= TP/(TP+FN)$ divides by a row, [[accuracy]] $= (TP+TN)/N$ takes the diagonal over the whole. Once $N$ is fixed the table still has three free numbers, so no single scalar can summarize it without throwing something away.',
    statquest: 'confusion matrix',
    teachesAt: 'ch05-metrics',
    see: ['precision', 'recall', 'accuracy', 'f1-score'],
  },
  {
    id: 'precision',
    term: 'precision',
    simple:
      'Of everything the model flagged, what share was genuinely worth flagging? It is the question asked by whoever has to work through the alerts: how much of this is a waste of my time?',
    technical:
      'The column of the [[confusion-matrix]] you read when false alarms are expensive — spam filters, fraud escalation, anything a human triages. It says nothing at all about what was missed, so it is trivially maximized by flagging only the single most confident example: one flag, one hit, precision 1.0. Which is why it is never quoted alone, and why raising the [[decision-threshold]] to make it look good must always be reported next to the [[recall]] that move cost.',
    math:
      '$\\mathrm{precision} = \\dfrac{TP}{TP + FP}$. Unlike [[recall]] it depends on prevalence: for fixed [[true-positive-rate|TPR]] and [[false-positive-rate|FPR]] it equals $\\dfrac{\\pi\\,\\mathrm{TPR}}{\\pi\\,\\mathrm{TPR} + (1-\\pi)\\,\\mathrm{FPR}}$ where $\\pi$ is the positive rate — so the *same* classifier looks far worse on a rarer class. That is precisely why a precision–recall curve beats an [[roc-curve|ROC curve]] on [[imbalanced-dataset|imbalanced data]].',
    statquest: 'precision and recall',
    teachesAt: 'ch05-metrics',
    see: ['recall', 'confusion-matrix', 'decision-threshold', 'f1-score'],
  },
  {
    id: 'recall',
    term: 'recall',
    simple:
      'Of everything that really was worth catching, how much did the model actually catch? It is the question asked by whoever pays for the misses.',
    technical:
      'Also called sensitivity, and also called the [[true-positive-rate]] — three names for one ratio, depending on whether you arrived from medicine, radar or information retrieval. Prioritized whenever a miss is the expensive mistake: disease screening, safety alerts, legal discovery. It is trivially maximized by flagging everything, so it is meaningless without [[precision]] beside it. Unlike precision it does not move when the class balance changes, since its denominator counts only actual positives.',
    math:
      '$\\mathrm{recall} = \\dfrac{TP}{TP + FN}$ — the share of the positive row the model caught. The usual single-number compromise with [[precision]] is their harmonic mean, the [[f1-score]] $F_1 = 2\\frac{PR}{P+R}$. The harmonic mean rather than the arithmetic one, because it refuses to be rescued by one high value: $1.0$ and $0.0$ average to $0.5$ but give $F_1 = 0$.',
    statquest: 'precision and recall',
    teachesAt: 'ch05-metrics',
    see: ['precision', 'true-positive-rate', 'confusion-matrix', 'f1-score'],
  },
  {
    id: 'f1-score',
    term: 'F1 score',
    simple:
      'One number that refuses to let a model brag about catching everything, or about never crying wolf, unless it does both. It sits near the worse of the two rather than midway between them.',
    technical:
      'The harmonic mean of [[precision]] and [[recall]], and the default single score when the positive class is the rare and interesting one. Its virtue is that the [[decision-threshold]] cannot game it: pushing recall to 1.0 by flagging everything collapses precision and drags $F_1$ down with it. Its limitations are real — it ignores true negatives entirely, and it hard-codes precision and recall as equally important, which is rarely true. When they are not, use $F_\\beta$ and state the $\\beta$ you chose.',
    math:
      '$F_1 = 2\\cdot\\dfrac{P \\cdot R}{P + R} = \\dfrac{2\\,TP}{2\\,TP + FP + FN}$ — note that $TN$ never appears. The weighted form $F_\\beta = (1+\\beta^{2})\\dfrac{P R}{\\beta^{2}P + R}$ counts recall $\\beta$ times as important as precision: $\\beta = 2$ for screening, $\\beta = 0.5$ when false alarms are what hurt.',
    teachesAt: 'ch05-metrics',
    see: ['precision', 'recall', 'confusion-matrix', 'cost-sensitive-accuracy'],
  },
  {
    id: 'decision-threshold',
    term: 'decision threshold',
    simple:
      'Most classifiers hand you a confidence between zero and one rather than a verdict. The threshold is the line you draw across that confidence — above it you act, below it you do not — and it is your choice, not the model’s.',
    technical:
      'The cheapest lever in applied classification and the most often forgotten: the model is already trained, and sliding the threshold walks you along a whole curve of possible behaviours for free. Raise it and [[precision]] climbs while [[recall]] falls; lower it and the reverse. The default of 0.5 is a convention with no claim on your problem — it is optimal only when both mistakes cost the same and the classes are balanced. Choose it on the [[validation-set]], from the costs, and never on the [[test-set]].',
    math:
      'Predict positive when $\\Pr(y = 1 \\mid \\mathbf{x}) \\ge \\tau$. Under costs $c_{FP}$ and $c_{FN}$ the expected-cost-minimizing choice is $\\tau^{\\star} = \\dfrac{c_{FP}}{c_{FP} + c_{FN}}$ — with a miss ten times worse than a false alarm, $\\tau^{\\star} = 1/11 \\approx 0.09$, nowhere near $0.5$. Sweeping $\\tau$ from 1 down to 0 traces the [[roc-curve|ROC curve]] from one corner to the other.',
    statquest: 'ROC and AUC',
    teachesAt: 'ch05-metrics',
    see: ['precision', 'recall', 'roc-curve', 'cost-sensitive-accuracy'],
  },
  {
    id: 'accuracy',
    term: 'accuracy',
    simple:
      'The share of predictions that were right. The obvious metric — honest when every mistake costs the same and the classes are balanced, quietly useless when they are not.',
    technical:
      'Its failure mode is famous: with 99% negatives, answering "negative" every time scores 99% and catches nothing. The deeper problem is that it collapses the two error types into one number, so it cannot tell a model that misses everything from one that false-alarms constantly at the same total error rate. Report it beside a [[confusion-matrix]], and reach for [[precision]] and [[recall]], the [[f1-score]], [[cost-sensitive-accuracy]] or [[auc]] the moment the classes are skewed.',
    math:
      '$\\mathrm{accuracy} = \\dfrac{TP + TN}{TP + TN + FP + FN}$: the diagonal of the [[confusion-matrix]] over its total. The baseline to beat is not $0.5$ but the majority-class rate $\\max(\\pi, 1-\\pi)$. Cohen’s $\\kappa = \\dfrac{p_o - p_e}{1 - p_e}$ rescales accuracy against exactly that chance level, so $\\kappa = 0$ reads as "no better than guessing the prior".',
    statquest: 'confusion matrix',
    teachesAt: 'ch05-metrics',
    see: ['confusion-matrix', 'cost-sensitive-accuracy', 'imbalanced-dataset', 'f1-score'],
  },
  {
    id: 'cost-sensitive-accuracy',
    term: 'cost-sensitive accuracy',
    simple:
      'Not all mistakes cost the same, so stop counting them the same. Put a price on each kind of error and let the expensive ones drag the score down harder.',
    technical:
      'The honest version of [[accuracy]] when a false negative and a false positive have different consequences — a missed tumour against an unnecessary scan. Two places to apply it: at scoring time, or at training time by reweighting the [[loss-function|loss]] per class ([[class-weights]]) so the optimiser itself takes the prices seriously. Doing both is normal. The hard part is never the arithmetic; it is getting anyone to commit to the numbers, because the ratio between two costs is a policy decision wearing a statistical hat.',
    math:
      'Weight the error cells and compute as usual: $\\dfrac{TP + TN}{TP + TN + c_{FP}\\,FP + c_{FN}\\,FN}$. The equivalent view is expected cost $c_{FP}\\,FP + c_{FN}\\,FN$, minimized over the [[decision-threshold]] at $\\tau^{\\star} = c_{FP}/(c_{FP} + c_{FN})$ — so choosing costs and choosing a threshold are the same act, stated twice.',
    teachesAt: 'ch05-metrics',
    see: ['accuracy', 'decision-threshold', 'class-weights', 'imbalanced-dataset'],
  },
  {
    id: 'roc-curve',
    term: 'ROC curve',
    simple:
      'Rather than judging a classifier at one setting, sweep its threshold from strictest to loosest and plot the whole journey. The curve shows every trade the model is capable of offering, and you pick a point on it afterwards.',
    technical:
      'Plots [[true-positive-rate|TPR]] vertically against [[false-positive-rate|FPR]] horizontally, one point per threshold. The diagonal is a coin flip, the top-left corner is perfection, and a curve bulging toward that corner is a model that ranks positives above negatives. It needs a score rather than a bare label, which is why a rule-based classifier has no ROC curve. Its blind spot is imbalance: FPR divides by the vast negative pool, so a flood of false alarms barely moves the curve — with rare positives, plot precision against recall instead.',
    math:
      'The curve is $\\left\\{\\left(\\mathrm{FPR}(\\tau),\\ \\mathrm{TPR}(\\tau)\\right) : \\tau \\in [0,1]\\right\\}$, traced from $(1,1)$ at $\\tau = 0$ to $(0,0)$ once $\\tau$ exceeds every score. It is invariant to any strictly increasing transform of the scores — it depends only on their *ranking* — so a badly calibrated model and its calibrated twin share one ROC curve and have completely different useful thresholds.',
    statquest: 'ROC and AUC',
    teachesAt: 'ch05-metrics',
    see: ['auc', 'true-positive-rate', 'false-positive-rate', 'decision-threshold'],
  },
  {
    id: 'true-positive-rate',
    term: 'true positive rate (TPR)',
    simple:
      'The fraction of the genuinely positive cases that the model flagged. The same number as recall, under a name borrowed from radar operators.',
    technical:
      'The vertical axis of the [[roc-curve]], identical to [[recall]] and to sensitivity in medicine. Its denominator counts only actual positives, so it is unaffected by how many negatives the dataset contains — which is what makes ROC curves comparable across populations of different prevalence, and also what makes them flattering when positives are rare. Its complement $1 - \\mathrm{TPR}$ is the miss rate.',
    math:
      '$\\mathrm{TPR} = \\dfrac{TP}{TP + FN} = \\Pr(\\hat{y} = 1 \\mid y = 1)$ — a [[conditional-probability]] conditioned on the *truth*, not on the prediction, which is exactly what separates it from [[precision]]. Medicine quotes the pair (sensitivity, specificity), where specificity is $TN/(TN + FP) = 1 - \\mathrm{FPR}$.',
    statquest: 'sensitivity and specificity',
    teachesAt: 'ch05-metrics',
    see: ['recall', 'false-positive-rate', 'roc-curve'],
  },
  {
    id: 'false-positive-rate',
    term: 'false positive rate (FPR)',
    simple:
      'The fraction of the genuinely negative cases that the model wrongly flagged — the false-alarm rate. How often the bell rings when there is no fire.',
    technical:
      'The horizontal axis of the [[roc-curve]], and one minus specificity. Because it divides by the count of negatives, it stays small and moves slowly whenever negatives dominate: against 100,000 negatives, 500 false alarms is an FPR of 0.005 and looks negligible on the plot — while [[precision]], which divides by the flags actually raised, would tell you those 500 swamp your 50 real hits. That divergence is the single most useful thing to know about ROC curves.',
    math:
      '$\\mathrm{FPR} = \\dfrac{FP}{FP + TN} = \\Pr(\\hat{y} = 1 \\mid y = 0)$, the share of the negative row. Under a null hypothesis of no signal it is the significance level $\\alpha$ of the test — which makes the ROC curve, in statistical language, a plot of power against size as the critical value slides.',
    statquest: 'sensitivity and specificity',
    teachesAt: 'ch05-metrics',
    see: ['true-positive-rate', 'roc-curve', 'precision'],
  },
  {
    id: 'auc',
    term: 'AUC (area under the curve)',
    simple:
      'Squash the whole threshold-sweeping curve into one number by measuring the area beneath it. One means the model ranks every positive above every negative; a half means it is guessing.',
    technical:
      'Threshold-free, so it grades the model’s *ranking* rather than any particular decision — a strength before you have chosen a threshold and a weakness afterwards. Below 0.5 almost always means a sign error or swapped labels rather than a genuinely awful model, since inverting the scores would give $1 - \\mathrm{AUC}$. It inherits the [[roc-curve|ROC curve]]’s blind spot on [[imbalanced-dataset|imbalanced data]], where the area under the precision–recall curve is the better summary.',
    math:
      'AUC has an exact probabilistic reading: $\\Pr\\!\\left(s(\\mathbf{x}^{+}) > s(\\mathbf{x}^{-})\\right)$ for a randomly drawn positive and negative — the chance the model scores the positive higher. That makes it the normalized Mann–Whitney statistic, $\\mathrm{AUC} = \\frac{1}{n_{+}n_{-}}\\sum_{i : y_i = 1}\\ \\sum_{j : y_j = 0}\\mathbb{1}\\!\\left[s_i > s_j\\right]$, computable by sorting alone with no curve drawn at all.',
    statquest: 'ROC and AUC',
    teachesAt: 'ch05-metrics',
    see: ['roc-curve', 'decision-threshold', 'imbalanced-dataset'],
  },
  {
    id: 'grid-search',
    term: 'grid search',
    simple:
      'List a few candidate values for each knob, try every combination, and keep whichever scored best on held-out data. Crude, exhaustive, and often exactly right when there are only two knobs.',
    technical:
      'The default [[hyperparameter]] search: reproducible, trivially parallel, easy to reason about. Ranges you do not know should be sampled logarithmically — $10^{-3}$ up to $10^{3}$ — and then refined around the winner, because most hyperparameters act on a multiplicative scale. It dies of combinatorial explosion: three hyperparameters at five values each is 125 fits, multiplied again by $k$ if you are [[cross-validation|cross-validating]]. It also spends equal effort on knobs that matter and knobs that do not, which is exactly [[random-search]]’s argument against it.',
    math:
      'The search space is the Cartesian product of the candidate sets, of size $\\prod_{m=1}^{M}|\\mathcal{V}_m|$ — exponential in the number of hyperparameters $M$, and multiplied by $k$ folds. Note that a grid with $v$ values per axis explores only $v$ distinct values of *each individual* hyperparameter no matter how enormous the grid becomes, which is the observation [[random-search]] exploits.',
    teachesAt: 'ch05-tuning',
    see: ['random-search', 'bayesian-optimization', 'hyperparameter', 'cross-validation'],
  },
  {
    id: 'random-search',
    term: 'random search',
    simple:
      'Instead of a tidy grid, draw combinations at random from ranges you specify and stop when the budget runs out. Surprisingly, this usually beats the grid.',
    technical:
      'The reason is that hyperparameters are rarely equally important. A five-by-five grid spends five trials on each value of the one knob that matters; twenty-five random draws test twenty-five distinct values of it. You also get to stop at any point, and to give each hyperparameter its own distribution — log-uniform for [[learning-rate|learning rates]], uniform over a small integer set for depth. It remains memoryless: every draw ignores what the previous ones revealed, which is where [[bayesian-optimization]] takes over.',
    math:
      'If the optimum lies in the best $5\\%$ of the space, $n$ independent draws miss it with probability $0.95^{n}$, so $n = 60$ finds it with about $95\\%$ confidence — *regardless of the dimension* $M$, a property no grid has. The effective dimension of the search is the number of hyperparameters that actually move the score, and random search pays only for those.',
    teachesAt: 'ch05-tuning',
    see: ['grid-search', 'bayesian-optimization', 'hyperparameter'],
  },
  {
    id: 'bayesian-optimization',
    term: 'Bayesian optimization',
    simple:
      'Search with a memory. Fit a rough guess of how the score depends on the knobs, use it to pick the most promising setting to try next, then update the guess with what you found — and repeat.',
    technical:
      'Worth its overhead when each trial is expensive: if training takes six hours you can afford perhaps thirty settings, and spending them at random is wasteful. A surrogate model — usually a [[gaussian-process]] or a tree ensemble — predicts both the score and its uncertainty at every untried point, and an *acquisition function* picks the next trial by balancing exploitation of the current best against exploration of where the surrogate is unsure. The costs: it is sequential, so it parallelizes badly, and the surrogate has settings of its own.',
    math:
      'Model the validation score as $s(\\boldsymbol{\\theta}) \\sim \\mathcal{GP}(\\mu, k)$, giving a posterior mean $\\mu(\\boldsymbol{\\theta})$ and standard deviation $\\sigma(\\boldsymbol{\\theta})$ after each trial. Choose the next point by maximizing an acquisition such as expected improvement $\\mathbb{E}\\left[\\max\\!\\left(0,\\ s(\\boldsymbol{\\theta}) - s^{\\star}\\right)\\right]$, or the simpler upper confidence bound $\\mu(\\boldsymbol{\\theta}) + \\kappa\\,\\sigma(\\boldsymbol{\\theta})$ — where $\\kappa$ is literally the dial between exploitation and exploration.',
    teachesAt: 'ch05-tuning',
    see: ['grid-search', 'random-search', 'gaussian-process', 'hyperparameter'],
  },
  {
    id: 'cross-validation',
    term: 'cross-validation',
    simple:
      'When you cannot spare a decent chunk of data for judging, take turns. Split the training data into five parts, train five times leaving a different part out, and average the five scores.',
    technical:
      'Simulates a [[validation-set]] without permanently surrendering the examples, which makes it the default on small and medium data. Five or ten folds is the everyday choice: fewer folds means each fit sees less data (a pessimistic bias), more folds means more compute and more strongly correlated fits. Stratify the folds by class, and *group* them by subject, user or time whenever examples are not independent — otherwise near-duplicates land on both sides of a split and the score is fiction. When the winner is chosen, retrain on all the training data and judge once on the [[test-set]].',
    math:
      'Partition $\\mathcal{S}$ into folds $\\mathcal{S}_1,\\dots,\\mathcal{S}_k$ and report $\\mathrm{CV} = \\frac{1}{k}\\sum_{m=1}^{k}\\hat{R}\\!\\left(f_{\\mathcal{S}\\setminus\\mathcal{S}_m};\\ \\mathcal{S}_m\\right)$. Each fit trains on $\\frac{k-1}{k}N$ examples, so CV slightly *under*states the final model, which is trained on all $N$. At $k = N$ it becomes [[leave-one-out-cross-validation|leave-one-out]]: nearly unbiased, but $N$ fits and a high-variance estimate, since the $N$ training sets are almost identical to one another.',
    statquest: 'cross validation',
    teachesAt: 'ch05-tuning',
    see: ['validation-set', 'holdout', 'grid-search', 'leave-one-out-cross-validation'],
  },
];

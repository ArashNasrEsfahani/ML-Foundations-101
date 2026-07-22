import type { Concept } from './types';

/**
 * Chapter 7's vocabulary. The widest chapter in the book: a dozen unrelated
 * problems, each answered in a paragraph. The cards below carry the mechanism
 * the prose has no room for — why resampling decorrelates, what a reweighted
 * example does to the next learner, and what attention actually computes.
 */
export const conceptsCh07: Concept[] = [
  {
    id: 'kernel-regression',
    term: 'kernel regression',
    simple:
      'To predict at a new point, take a weighted average of every label you have ever seen — where nearby examples count for a lot and distant ones count for almost nothing. Nothing is fitted in advance: the training set is the model.',
    technical:
      'The smooth cousin of [[k-nearest-neighbors|kNN]]. Where kNN draws a hard circle around the $k$ closest points and gives them equal votes, kernel regression lets every point vote with a weight that decays with distance, so the fitted curve is continuous rather than a staircase. It is [[non-parametric-model|non-parametric]]: no coefficients, one [[bandwidth]] to tune, and $O(N)$ work per prediction. Its real limit is dimension — beyond a handful of features, every training point is roughly the same distance from the query, all the weights flatten out, and the prediction collapses toward the global mean.',
    math:
      '$f(x) = \\sum_{i=1}^{N} w_i y_i$ with $w_i = \\dfrac{k\\!\\left(\\frac{x_i - x}{b}\\right)}{\\sum_{l=1}^{N} k\\!\\left(\\frac{x_l - x}{b}\\right)}$ — the Nadaraya–Watson estimator. The weights are normalized to sum to 1, so the prediction is always a convex combination of observed labels and can never leave their range. In more than one dimension, replace $x_i - x$ with $\\|\\mathbf{x}_i - \\mathbf{x}\\|$.',
    statquest: 'lowess loess',
    teachesAt: 'ch07-beyond-two-classes',
    see: ['bandwidth', 'k-nearest-neighbors', 'non-parametric-model', 'kernel-function'],
  },
  {
    id: 'bandwidth',
    term: 'bandwidth',
    simple:
      'How far each training point’s influence reaches. Narrow it and the model listens only to its immediate neighbors; widen it and distant points get a say too, which calms the curve down.',
    technical:
      'The one dial on [[kernel-regression]] and [[kernel-density-estimation|KDE]], and the clearest instance of the [[bias-variance-tradeoff]] in the whole book. Too small and each prediction rests on one or two points, so noise passes straight through — [[overfitting]] with a smooth face. Too large and everything averages with everything, so genuine structure is flattened — [[underfitting]]. There is no default: it is chosen on the [[validation-set]], and the right value shrinks as the dataset grows.',
    math:
      'As $b \\to 0$, $f(x)$ tends to the label of the nearest training point; as $b \\to \\infty$, all $w_i \\to 1/N$ and $f(x)$ tends to $\\bar{y}$. For density estimation the error-optimal choice scales as $b^\\star \\propto N^{-1/5}$, which is why more data buys a *narrower* window rather than a wider one. It plays the role $k$ plays in [[k-nearest-neighbors|kNN]] and the inverse of the role $\\gamma$ plays in the [[gamma-rbf|RBF kernel]].',
    teachesAt: 'ch07-beyond-two-classes',
    see: ['kernel-regression', 'gamma-rbf', 'bias-variance-tradeoff', 'kernel-density-estimation'],
  },
  {
    id: 'softmax',
    term: 'softmax',
    simple:
      'Takes a row of raw scores and turns them into percentages that add up to one hundred. The biggest score gets the biggest share, nothing comes out negative, and the classes compete for a fixed pot.',
    technical:
      'The multiclass generalization of the [[sigmoid]]: exponentiate every score, then divide by the total. Exponentiating makes everything positive and amplifies differences; dividing forces the outputs to sum to 1, which is exactly what makes the result readable as a distribution over classes. That constraint is also its limit — because the pot is fixed, raising one class must lower another, so softmax cannot express *two labels at once* and [[multi-label-classification]] uses independent sigmoids instead. Paired with cross-entropy loss it has a famously clean gradient, which is why it sits on the end of nearly every classification network.',
    math:
      '$\\mathrm{softmax}(\\mathbf{z})_c = \\dfrac{e^{z_c}}{\\sum_{k=1}^{C} e^{z_k}}$. Adding a constant to every $z_k$ changes nothing, so implementations subtract $\\max_k z_k$ first to stop $e^{z}$ overflowing. With $C = 2$ it reduces to $\\sigma(z_1 - z_2)$, the ordinary sigmoid of the score gap; and with cross-entropy loss the gradient with respect to the scores is the strikingly simple $\\mathbf{p} - \\mathbf{y}$.',
    statquest: 'softmax argmax neural networks',
    teachesAt: 'ch07-beyond-two-classes',
    see: ['sigmoid', 'multiclass-classification', 'logistic-regression', 'multi-label-classification'],
  },
  {
    id: 'one-versus-rest',
    term: 'one versus rest',
    simple:
      'You have five bins to sort into and a tool that only answers yes or no. So train five yes/no models — “is it bin one, or not?”, “is it bin two, or not?” — and go with whichever one answers most confidently.',
    technical:
      'A wrapper, not an algorithm: it converts $C$ [[binary-classification|binary]] learners into a multiclass one, which is how a [[support-vector-machine|SVM]] gets to do multiclass at all. Two things go wrong quietly. Each sub-problem is [[imbalanced-dataset|imbalanced]] — one class against $C-1$ combined — and the $C$ models are fitted separately, so their scores were never calibrated against one another and comparing them is a leap of faith. The alternative, one-versus-one, trains a classifier for every *pair*: more models, but each is small, balanced, and only sees two classes.',
    math:
      'Predict $\\hat{y} = \\arg\\max_{c} s_c(\\mathbf{x})$, where $s_c$ is model $c$’s confidence — a probability for [[logistic-regression]], or the signed distance $d = \\frac{\\mathbf{w}_c\\mathbf{x} + b_c}{\\|\\mathbf{w}_c\\|}$ for an SVM. One-versus-rest costs $C$ models each trained on all $N$ examples; one-versus-one costs $\\binom{C}{2} = \\frac{C(C-1)}{2}$ models each trained on roughly $2N/C$, which is often the cheaper total when $C$ is large.',
    teachesAt: 'ch07-beyond-two-classes',
    see: ['multiclass-classification', 'softmax', 'support-vector-machine', 'imbalanced-dataset'],
  },
  {
    id: 'one-class-classification',
    term: 'one-class classification',
    simple:
      'Learning what normal looks like from normal examples only, then raising a flag at anything that does not fit. You use it when the interesting case — a fraud, an intrusion, a cracked weld — is far too rare to collect a decent pile of.',
    technical:
      'Also called unary classification, and the machinery behind [[outlier-detection|outlier, anomaly and novelty detection]]. Four standard shapes: fit a density and threshold it (the one-class Gaussian), wrap the data in a boundary ([[one-class-svm]]), measure distance to the nearest stored example (one-class kNN), or measure distance to a fitted centroid (one-class k-means). The genuinely hard part is not the model but the cutoff: with no negative examples there is no honest [[validation-set]] on which to measure a miss rate, so the threshold is usually set at whatever quantile of the training scores you can afford to lose as false alarms.',
    math:
      'The Gaussian version fits $\\boldsymbol{\\mu}$ and $\\boldsymbol{\\Sigma}$ by [[maximum-likelihood]] and flags $\\mathbf{x}$ when $f_{\\boldsymbol{\\mu},\\boldsymbol{\\Sigma}}(\\mathbf{x}) < \\tau$. Thresholding that density is equivalent to thresholding the Mahalanobis distance $(\\mathbf{x}-\\boldsymbol{\\mu})^\\top\\boldsymbol{\\Sigma}^{-1}(\\mathbf{x}-\\boldsymbol{\\mu})$, which under the Gaussian assumption follows a $\\chi^2$ distribution with $D$ degrees of freedom — so the cutoff can be read off a table as “flag the outermost 1%”.',
    teachesAt: 'ch07-beyond-two-classes',
    see: ['one-class-svm', 'outlier-detection', 'density-estimation', 'imbalanced-dataset'],
  },
  {
    id: 'one-class-svm',
    term: 'one-class SVM',
    simple:
      'Draw the tightest bubble you can around all the normal examples, allowing a small agreed fraction of them to sit outside. Anything landing outside the bubble afterwards is an anomaly.',
    technical:
      'Two formulations that coincide under an [[rbf-kernel|RBF kernel]]: separate the data from the origin with maximum [[margin]] in the kernel feature space, or find the smallest hypersphere enclosing the data. Either way it inherits the [[kernel-trick]], so the bubble is a curved shape in the original space rather than a ball. Its dial $\\nu$ does double duty — it is both a ceiling on the fraction of training points allowed outside and a floor on the fraction that end up as [[support-vector|support vectors]]. It is as sensitive to [[gamma-rbf|γ]] as any RBF model: too large and the bubble shrink-wraps every individual point.',
    math:
      'Minimize $\\tfrac{1}{2}\\|\\mathbf{w}\\|^2 + \\frac{1}{\\nu N}\\sum_i \\xi_i - \\rho$ subject to $\\mathbf{w}\\cdot\\phi(\\mathbf{x}_i) \\ge \\rho - \\xi_i$, $\\xi_i \\ge 0$; predict $\\mathrm{sign}\\!\\left(\\mathbf{w}\\cdot\\phi(\\mathbf{x}) - \\rho\\right)$. The hypersphere form (SVDD) minimizes $R^2 + C\\sum_i \\xi_i$ subject to $\\|\\phi(\\mathbf{x}_i) - \\mathbf{c}\\|^2 \\le R^2 + \\xi_i$. With an RBF kernel every $\\phi(\\mathbf{x})$ lies on a unit sphere, which is why the two problems have the same solution.',
    teachesAt: 'ch07-beyond-two-classes',
    see: ['one-class-classification', 'kernel-trick', 'soft-margin-svm', 'gamma-rbf'],
  },
  {
    id: 'multi-label-classification',
    term: 'multi-label classification',
    simple:
      'One thing can wear several labels at once — a photograph is mountain and conifer and road, all true together. The model has to be allowed to say yes more than once, and sometimes to say yes to nothing at all.',
    technical:
      'Not to be confused with [[multiclass-classification]], where exactly one label wins. The default recipe is *binary relevance*: one independent [[sigmoid]] per label, trained with binary cross-entropy, plus a [[decision-threshold|threshold]] tuned on the [[validation-set]]. Its blind spot is that the labels are scored independently, so nothing prevents an impossible combination. The *label powerset* trick — one invented class per observed combination — restores those correlations, at the cost of a class count that multiplies out and gives each combination very few examples to learn from.',
    math:
      'The target is $\\mathbf{y} \\in \\{0,1\\}^L$ rather than $y \\in \\{1,\\dots,C\\}$, and binary relevance minimizes $\\sum_{l=1}^{L}\\mathrm{BCE}(\\hat{y}_l, y_l)$. The powerset has $\\prod_l |\\mathcal{Y}_l|$ classes — six for two labels with two and three values, but $2^{10} = 1024$ for ten binary labels. Scoring uses per-label [[precision]] and [[recall]], or Hamming loss $\\frac{1}{L}\\sum_l \\mathbb{1}[\\hat{y}_l \\ne y_l]$.',
    teachesAt: 'ch07-beyond-two-classes',
    see: ['multiclass-classification', 'sigmoid', 'decision-threshold', 'softmax'],
  },
  {
    id: 'ensemble-learning',
    term: 'ensemble learning',
    simple:
      'Rather than hunt for one brilliant expert, assemble a large committee of mediocre ones and go with the crowd. It works on one condition: the members must be wrong about *different* things, so their mistakes cancel and only the signal survives.',
    technical:
      'The mechanism is error cancellation, and it needs both halves of that condition — each member better than a coin flip, and the members decorrelated. Two families do the manufacturing differently: [[bagging]] builds members in parallel from resampled data and attacks [[model-variance|variance]], [[boosting]] builds them in sequence from the previous members’ failures and attacks [[model-bias|bias]]. What you give up is legibility: a single [[decision-tree]] can be printed on one page and defended to a regulator, and five hundred cannot.',
    math:
      'For $B$ members with independent errors of probability $p < \\tfrac12$, the [[majority-vote]] errs with probability $\\sum_{k > B/2}\\binom{B}{k}p^k(1-p)^{B-k}$, which tends to 0 as $B$ grows — Condorcet’s jury theorem. Independence is doing all the work: for averaged regressors with error variance $\\sigma^2$ and pairwise correlation $\\rho$, $\\mathrm{Var}\\!\\left(\\frac{1}{B}\\sum_b f_b\\right) = \\rho\\sigma^2 + \\frac{1-\\rho}{B}\\sigma^2$. The second term vanishes with more members; the first never does.',
    teachesAt: 'ch07-ensembles-bagging',
    see: ['weak-learner', 'bagging', 'boosting', 'random-forest', 'majority-vote'],
  },
  {
    id: 'weak-learner',
    term: 'weak learner',
    simple:
      'A model barely good enough to beat a coin flip — a single yes/no question about one feature, say. Useless on its own, and exactly what an ensemble is looking for.',
    technical:
      'The workhorse is the *decision stump*: a [[decision-tree]] of depth one. High [[model-bias|bias]], low [[model-variance|variance]], and it trains in microseconds, which is what makes running hundreds of them affordable. The formal definition asks only for a consistent edge over chance, and the founding result of [[boosting]] is that this is enough: anything weakly learnable is strongly learnable. Watch which way the two families lean — [[boosting]] wants genuinely weak members because it will fix their bias, while [[random-forest]] deliberately grows *deep*, low-bias trees and lets averaging deal with their variance.',
    math:
      'A weak learner returns $h$ with $\\Pr[h(\\mathbf{x}) \\ne y] \\le \\tfrac{1}{2} - \\gamma$ for some edge $\\gamma > 0$, under any weighting of the data. Schapire’s result (1990) turns that into arbitrary accuracy: after $T$ rounds AdaBoost’s training error is at most $\\prod_{t}2\\sqrt{\\epsilon_t(1-\\epsilon_t)} \\le \\exp\\!\\left(-2\\sum_t \\gamma_t^2\\right)$, which decays exponentially in $T$.',
    teachesAt: 'ch07-ensembles-bagging',
    see: ['ensemble-learning', 'boosting', 'decision-tree', 'adaboost'],
  },
  {
    id: 'bagging',
    term: 'bagging',
    simple:
      'Make several shuffled copies of your dataset, train a separate model on each, and average the answers. Whatever one model got wrong because of the particular sample it happened to see gets diluted by the others.',
    technical:
      'Short for *bootstrap aggregating*. The engine is resampling with replacement: each copy overlaps the original heavily but not exactly, and a high-[[model-variance|variance]] learner reacts visibly to those differences, so the fitted trees genuinely differ. Averaging then cancels the part of each model’s error that came from the sample rather than from the signal — which is why it needs unstable members and does nothing at all for a stable one like [[linear-regression]]. It touches variance only: the average of $B$ biased trees is exactly as biased as one of them, which is the whole reason [[boosting]] exists as a separate idea.',
    math:
      'With $B$ members of error variance $\\sigma^2$ and pairwise correlation $\\rho$, $\\mathrm{Var}\\!\\left(\\frac{1}{B}\\sum_b f_b\\right) = \\rho\\sigma^2 + \\frac{1-\\rho}{B}\\sigma^2$, while $\\mathbb{E}\\!\\left[\\frac{1}{B}\\sum_b f_b\\right] = \\mathbb{E}[f_b]$ — the bias is untouched. Because each [[bootstrap-sample]] leaves out a fraction $(1-1/N)^N \\to e^{-1} \\approx 0.368$ of the data, every member can be scored on the examples it never saw, giving an out-of-bag error estimate for free.',
    statquest: 'bootstrapping',
    teachesAt: 'ch07-ensembles-bagging',
    see: ['bootstrap-sample', 'random-forest', 'majority-vote', 'model-variance'],
  },
  {
    id: 'bootstrap-sample',
    term: 'bootstrap sample',
    simple:
      'Draw examples one at a time from your dataset, writing each down and then putting it back, until you have as many as you started with. Some examples get picked twice or three times, some never get picked at all — and that is precisely the point.',
    technical:
      'Sampling *with replacement*: same size, different composition. Without replacement you would only reshuffle the same set, every model would see identical data, and the ensemble would be one model repeated. The duplicates matter as much as the omissions — a doubled example pulls the fitted tree toward itself exactly as if it carried twice the weight. The roughly 37% never drawn are the *out-of-bag* examples, and scoring each member on its own out-of-bag set gives a [[cross-validation]]-quality estimate without holding anything out.',
    math:
      'Any given example is missed with probability $(1 - 1/N)^N \\to e^{-1} \\approx 0.368$, so about $0.632N$ distinct examples appear. Its multiplicity is $\\mathrm{Binomial}(N, 1/N)$, which converges to $\\mathrm{Poisson}(1)$ — the reason streaming implementations draw a Poisson count per example instead of sampling the whole set.',
    statquest: 'bootstrapping',
    teachesAt: 'ch07-ensembles-bagging',
    see: ['bagging', 'random-forest', 'cross-validation'],
  },
  {
    id: 'majority-vote',
    term: 'majority vote',
    simple:
      'Every model in the committee names a class, and the class named most often wins. One member, one vote — how sure each of them felt does not enter into it.',
    technical:
      'The standard way to aggregate an ensemble of classifiers; averaging is its counterpart for regression and for scores. Throwing away confidence is a real loss — a member that was 51% sure counts the same as one that was 99% sure — so *soft voting*, averaging the predicted probabilities instead, usually scores a little better whenever the members are calibrated. Ties are broken at random, or answered with “don’t know” when a wrong answer costs more than an abstention, which is the sane default in medicine and credit.',
    math:
      'Hard voting predicts $\\arg\\max_c \\sum_{b=1}^{B}\\mathbb{1}[h_b(\\mathbf{x}) = c]$; soft voting predicts $\\arg\\max_c \\frac{1}{B}\\sum_b \\Pr\\nolimits_b(c \\mid \\mathbf{x})$. With independent members of error $p < \\tfrac12$ the vote’s error $\\sum_{k>B/2}\\binom{B}{k}p^k(1-p)^{B-k}$ falls monotonically in $B$ — and rises monotonically in $B$ once $p > \\tfrac12$, so a committee of members worse than chance is worse than any one of them.',
    teachesAt: 'ch07-ensembles-bagging',
    see: ['ensemble-learning', 'bagging', 'random-forest', 'model-averaging'],
  },
  {
    id: 'random-forest',
    term: 'random forest',
    simple:
      'A crowd of decision trees, each grown on a reshuffled copy of the data and each forbidden from looking at all the features when it chooses a split. Handicapping them is what stops them turning into copies of one another.',
    technical:
      '[[bagging]] plus feature subsampling at *every* split. Bagging alone is not enough when one or two features dominate: every tree picks them first, the trees end up near-identical, their errors coincide, and no vote can cancel a mistake everybody makes. Forcing each split to choose among $m$ random features makes different trees discover different structure. The trees are grown deep and unpruned on purpose — each is meant to be low-bias and high-variance, because averaging is what handles the variance. Two knobs: $B$, where more is never worse, only slower; and $m$, which is the real one.',
    math:
      'Defaults are $m = \\sqrt{D}$ for classification and $m = D/3$ for regression. In $\\mathrm{Var} = \\rho\\sigma^2 + \\frac{1-\\rho}{B}\\sigma^2$, shrinking $m$ lowers the correlation $\\rho$ but raises each tree’s own $\\sigma^2$ — that is exactly the trade $m$ tunes. Feature importance is read off the total weighted impurity decrease at all nodes splitting on a feature, $\\sum_{\\text{nodes }v \\text{ on } j} \\frac{|\\mathcal{S}_v|}{N}\\,\\mathrm{IG}(v)$.',
    statquest: 'random forests',
    teachesAt: 'ch07-ensembles-bagging',
    see: ['bagging', 'decision-tree', 'bootstrap-sample', 'model-variance'],
  },
  {
    id: 'boosting',
    term: 'boosting',
    simple:
      'Train a weak model, look at what it got wrong, then train the next one to concentrate on exactly those cases. Repeat a few hundred times and add all the specialists together.',
    technical:
      'Sequential and adaptive, where [[bagging]] is parallel and blind. Each round *changes the problem* the next learner faces — by reweighting the examples ([[adaboost]]) or by relabeling them with [[residual|residuals]] ([[gradient-boosting]]) — so what the ensemble reduces is [[model-bias|bias]]: it keeps adding capacity aimed precisely where the current model is weakest. That is also why it can [[overfitting|overfit]] where bagging essentially cannot, since nothing stops it from continuing to fit noise; depth, round count and [[learning-rate]] are the brakes. And it is inherently serial, so it never parallelizes the way a [[random-forest]] does.',
    math:
      'It builds an additive model $F_M(\\mathbf{x}) = \\sum_{m=1}^{M}\\alpha_m h_m(\\mathbf{x})$ by *forward stagewise* fitting: at step $m$, with $F_{m-1}$ frozen, choose $(\\alpha_m, h_m) = \\arg\\min \\sum_i L\\!\\left(y_i,\\ F_{m-1}(\\mathbf{x}_i) + \\alpha h(\\mathbf{x}_i)\\right)$. Choosing the exponential loss $e^{-yF(\\mathbf{x})}$ recovers AdaBoost exactly; choosing squared error recovers fitting residuals.',
    statquest: 'boosting',
    teachesAt: 'ch07-boosting',
    see: ['adaboost', 'gradient-boosting', 'bagging', 'weak-learner', 'model-bias'],
  },
  {
    id: 'adaboost',
    term: 'AdaBoost',
    simple:
      'Keep a running note of how much each training example still bothers you. Get one wrong and its weight goes up, so the next model cannot afford to ignore it; models that do well earn a louder voice in the final vote.',
    technical:
      'The reweighting is what forces the next learner to be *different*. A stump minimizes **weighted** error, so an example whose weight has doubled is worth two ordinary examples to it — the next stump will happily give up ground on easy cases to win that one back. There is a striking fact underneath: after the update, the previous stump scores exactly 50% on the reweighted data, a coin flip, so the next round genuinely starts from scratch on a problem the last one has nothing left to say about. The famous weakness is [[label|label noise]] — a permanently mislabeled example can never be got right, so its weight compounds round after round until it dominates the training set.',
    math:
      'With weighted error $\\epsilon_t$, set $\\alpha_t = \\tfrac{1}{2}\\ln\\frac{1-\\epsilon_t}{\\epsilon_t}$ and update $w_i \\leftarrow \\frac{w_i}{Z_t}\\exp\\!\\left(-\\alpha_t y_i h_t(\\mathbf{x}_i)\\right)$, so mistakes are multiplied by $e^{\\alpha_t} > 1$ and successes by $e^{-\\alpha_t} < 1$. Predict $\\mathrm{sign}\\!\\left(\\sum_t \\alpha_t h_t(\\mathbf{x})\\right)$. Training error is bounded by $\\prod_t 2\\sqrt{\\epsilon_t(1-\\epsilon_t)}$, so any persistent edge over chance drives it to zero exponentially.',
    statquest: 'adaboost',
    teachesAt: 'ch07-boosting',
    see: ['boosting', 'weak-learner', 'gradient-boosting', 'decision-tree'],
  },
  {
    id: 'gradient-boosting',
    term: 'gradient boosting',
    simple:
      'Start with the laziest guess there is — the average — then keep adding small trees, each trained to predict the error the current model has not managed to explain. Take small steps and the pile of trees creeps toward the answer.',
    technical:
      'The same repair-the-mistakes plan as [[adaboost]], but the correction signal is a [[residual]] rather than a weight, which makes it natural for [[regression]]. The insight that names it: fitting the residual *is* fitting the negative gradient of squared error, so swapping in the gradient of some other [[differentiable]] loss — absolute error, Huber, log loss — gives the same algorithm for a different objective. The [[learning-rate]] shrinks each tree’s contribution, and it trades directly against the number of trees: halve the rate and you need roughly twice as many, but you generalize better. Depth is the third knob, and it controls how many features a single tree can combine.',
    math:
      'Start from $f_0 = \\arg\\min_c \\sum_i L(y_i, c)$ — the mean under squared loss. At step $m$ compute pseudo-residuals $r_i = -\\left[\\frac{\\partial L(y_i, f(\\mathbf{x}_i))}{\\partial f(\\mathbf{x}_i)}\\right]_{f = f_{m-1}}$, which for $L = \\tfrac12(y-f)^2$ is exactly $y_i - f_{m-1}(\\mathbf{x}_i)$; fit a tree $h_m$ to those, then set $f_m = f_{m-1} + \\alpha h_m$. Each round is one [[gradient-descent]] step taken in *function* space, with $\\alpha$ as the step size.',
    statquest: 'gradient boost',
    teachesAt: 'ch07-boosting',
    see: ['residual', 'boosting', 'xgboost', 'learning-rate', 'gradient-descent'],
  },
  {
    id: 'residual',
    term: 'residual',
    simple:
      'What is left over. Subtract what the model already predicts from the truth, and the difference is the part it has failed to explain — which is exactly what the next model is handed as its training target.',
    technical:
      'In [[gradient-boosting]] the residuals become the new labels every round. Their sign says which way the prediction must move and their size says how far, which is the whole sense in which they act like a gradient. Residuals are also the best diagnostic you have: plot them against a feature and any remaining pattern means the model is still [[underfitting]] and another tree will help; if they look like structureless noise, further trees are fitting noise, and that is the point at which validation error turns upward.',
    math:
      '$r_i = y_i - f(\\mathbf{x}_i)$. For $L = \\tfrac12(y-f)^2$, $\\frac{\\partial L}{\\partial f} = -(y-f) = -r$, so the residual is the negative gradient of the loss with respect to the *prediction* — which is why gradient boosting can drop residuals and use $-\\partial L/\\partial f$ for any [[differentiable]] loss. For absolute loss that derivative is $\\mathrm{sign}(y-f)$, so the variant built on it ignores how large an outlier’s miss was and is correspondingly robust.',
    statquest: 'gradient boost',
    teachesAt: 'ch07-boosting',
    see: ['gradient-boosting', 'mean-squared-error', 'loss-function'],
  },
  {
    id: 'xgboost',
    term: 'XGBoost',
    simple:
      'A fast, careful implementation of gradient boosting that has won more competitions on table-shaped data than anything else. The same idea, engineered very hard.',
    technical:
      'Three things beyond textbook [[gradient-boosting]]. It puts a [[regularization|penalty]] on the tree itself — leaf count and leaf weights — *inside* the split criterion, so a split has to pay for the complexity it adds. It uses a second-order (Newton) approximation of the loss rather than plain residuals, which gives better-sized steps. And the engineering: row and column subsampling, cache-aware histogram split-finding, and a learned default direction for missing values, so gaps need no [[data-imputation|imputation]]. LightGBM and CatBoost differ mainly in how they grow trees and how they treat categorical features. On tabular data these remain the thing to beat, deep networks included.',
    math:
      'It minimizes $\\sum_i L(y_i, \\hat{y}_i) + \\sum_m \\Omega(h_m)$ with $\\Omega(h) = \\gamma T + \\tfrac{1}{2}\\lambda\\sum_{j=1}^{T} w_j^2$ for $T$ leaves. Expanding $L$ to second order with $g_i, h_i$ the first and second derivatives, the best weight for leaf $j$ is $w_j^\\star = -\\frac{\\sum_{i \\in I_j} g_i}{\\sum_{i \\in I_j} h_i + \\lambda}$, and a split is taken only if its gain exceeds $\\gamma$ — pruning built into the objective rather than bolted on afterwards.',
    statquest: 'xgboost',
    teachesAt: 'ch07-boosting',
    see: ['gradient-boosting', 'regularization', 'random-forest'],
  },
  {
    id: 'sequence-labeling',
    term: 'sequence labeling',
    simple:
      'Tag every item in a list rather than the list as a whole — one part of speech per word, one label per amino acid. Input and output are the same length and line up one to one.',
    technical:
      'What separates it from a pile of independent [[classification]] problems is that neighboring decisions are not independent: a determiner is rarely followed by a verb, and the continuation tag of an entity can only follow the beginning tag of the same type. Models that score the whole label sequence jointly — a [[conditional-random-field|CRF]], a hidden Markov model — can use that; a per-token classifier cannot and will happily emit impossible sequences. Named entity recognition, part-of-speech tagging and chunking are the standard tasks, usually encoded with BIO tags, and the standard modern architecture is a bidirectional [[gated-unit|gated]] [[recurrent-neural-network|RNN]] or transformer with a CRF layer on top.',
    math:
      'Training examples are pairs $(\\mathbf{X}, \\mathbf{Y})$ with $\\mathbf{X} = [x^1,\\dots,x^T]$, $\\mathbf{Y} = [y^1,\\dots,y^T]$ and $|\\mathbf{X}| = |\\mathbf{Y}|$. A per-token classifier maximizes $\\prod_t \\Pr(y^t \\mid \\mathbf{X})$, assuming independence; a joint model maximizes $\\Pr(\\mathbf{Y}\\mid\\mathbf{X})$ over all $C^T$ label sequences, which Viterbi searches in $O(TC^2)$ instead of enumerating.',
    teachesAt: 'ch07-sequences',
    see: ['conditional-random-field', 'recurrent-neural-network', 'sequence-to-sequence'],
  },
  {
    id: 'conditional-random-field',
    term: 'conditional random field',
    simple:
      'Logistic regression that scores a whole sequence of labels at once instead of each label on its own — so it can learn that some orderings make sense and others never occur.',
    technical:
      'A discriminative model of the entire label sequence given the input, built from hand-designed feature functions: “this word is capitalized”, “this word is in a gazetteer of city names”, “the previous label was the start of a person”. Because it normalizes over whole sequences rather than per token, it cannot be trapped by a locally attractive but globally impossible tagging. The price is threefold — someone must write those features, training is slow because the normalizing constant sums over every possible label sequence, and on large corpora a [[recurrent-neural-network|bidirectional gated RNN]] learns better features than people write. It survives as a final layer stitched onto a network, contributing the sequence constraints the network has no way to express.',
    math:
      '$\\Pr(\\mathbf{Y}\\mid\\mathbf{X}) = \\frac{1}{Z(\\mathbf{X})}\\exp\\!\\left(\\sum_{t}\\sum_{k}\\lambda_k f_k(y^{t-1}, y^{t}, \\mathbf{X}, t)\\right)$, where $Z(\\mathbf{X})$ sums that exponential over all $C^T$ sequences — computed in $O(TC^2)$ by the forward algorithm rather than enumerated. Training maximizes the [[log-likelihood]], which is [[convex]] in $\\boldsymbol{\\lambda}$; decoding takes the best path with Viterbi.',
    teachesAt: 'ch07-sequences',
    see: ['sequence-labeling', 'logistic-regression', 'recurrent-neural-network'],
  },
  {
    id: 'sequence-to-sequence',
    term: 'sequence-to-sequence',
    simple:
      'Read a whole sentence, work out what it means, then write a new one that need not be the same length. Four English words in, three French words out — a translator, a summarizer, a chatbot.',
    technical:
      'It drops [[sequence-labeling|sequence labeling]]’s one-label-per-token constraint by splitting the model into an [[encoder-decoder|encoder and a decoder]], with generation running *autoregressively*: each emitted token is fed back in as the next input until an end-of-sequence token appears. Training uses teacher forcing — feed the true previous token rather than the model’s own guess — which is fast and stable but creates exposure bias, because at inference the model must condition on its own mistakes, a situation it never met in training. Decoding is a search, not a lookup, so beam search over several partial sequences usually beats taking the best token at each step.',
    math:
      'It models $\\Pr(\\mathbf{Y}\\mid\\mathbf{X}) = \\prod_{t=1}^{T\'}\\Pr(y^t \\mid y^{<t}, \\mathbf{X})$, with input length $T$ and output length $T\'$ free to differ, and trains by minimizing $-\\sum_t \\log \\Pr(y^t \\mid y^{<t}, \\mathbf{X})$. Greedy decoding takes $\\arg\\max$ at each step, which is *not* the $\\arg\\max$ of the product; beam search keeps the $k$ best prefixes and approximates it properly.',
    statquest: 'sequence to sequence encoder decoder',
    teachesAt: 'ch07-sequences',
    see: ['encoder-decoder', 'attention', 'embedding', 'recurrent-neural-network'],
  },
  {
    id: 'encoder-decoder',
    term: 'encoder–decoder',
    simple:
      'Two networks working as a relay. The first squeezes the input down into a compact summary; the second unpacks that summary into the output. The summary is the only thing that passes between them.',
    technical:
      'The shape behind [[sequence-to-sequence|seq2seq]], the [[autoencoder]] and multimodal networks alike. Both halves are trained together — the loss is measured at the decoder’s output and [[backpropagation|backpropagates]] through the whole chain into the encoder — so the encoder learns whatever representation the decoder finds useful, rather than one specified by hand. The classic weakness is the bottleneck: one fixed-size vector has to carry an entire paragraph, and translation quality visibly decays with input length. That is precisely the problem [[attention]] was invented to solve.',
    math:
      'An encoder $E: \\mathbf{X}\\mapsto \\mathbf{c}$ and a decoder $D: (\\mathbf{c}, y^{<t}) \\mapsto \\Pr(y^t)$. In an RNN encoder $\\mathbf{c} = \\mathbf{h}^{T}$, the final [[hidden-state|hidden state]] — a fixed-length vector whatever $T$ is, so information from step 1 must survive $T$ successive updates to reach it. With attention the decoder consumes the full matrix $[\\mathbf{h}^1,\\dots,\\mathbf{h}^T]$ rather than the single vector $\\mathbf{c}$.',
    statquest: 'sequence to sequence encoder decoder',
    teachesAt: 'ch07-sequences',
    see: ['sequence-to-sequence', 'attention', 'embedding', 'autoencoder'],
  },
  {
    id: 'embedding',
    term: 'embedding',
    simple:
      'A list of numbers standing in for something that is not a number — a word, a face, a whole sentence. Things that mean similar things end up with similar lists, so distance in that space becomes a measurement of meaning.',
    technical:
      'A learned, dense, low-dimensional representation, as opposed to a sparse [[one-hot-encoding|one-hot]] code, which is orthogonal to everything and therefore says nothing about similarity. What makes embeddings valuable is that they *transfer*: a vector produced by an encoder trained on one task can be compared with [[cosine-similarity]], clustered, indexed for nearest-neighbor search, or fed to a second model trained on something else entirely. Chapter 7 uses them three ways — as the handoff between encoder and decoder, as the face vector in a [[siamese-network]], and as the label vector that makes [[zero-shot-learning]] possible.',
    math:
      'A map $\\phi: \\mathcal{X}\\to\\mathbb{R}^d$ with $d$ far below the number of distinct inputs — 300 dimensions for a vocabulary of 100,000 words. Similarity is read as $\\frac{\\phi(a)\\cdot\\phi(b)}{\\|\\phi(a)\\|\\,\\|\\phi(b)\\|}$ or as squared distance $\\|\\phi(a)-\\phi(b)\\|^2$; on unit-normalized vectors $\\|\\phi(a)-\\phi(b)\\|^2 = 2 - 2\\cos\\theta$, so the two rank neighbors identically.',
    statquest: 'word embedding word2vec',
    teachesAt: 'ch07-sequences',
    see: ['word-embeddings', 'cosine-similarity', 'encoder-decoder', 'autoencoder'],
  },
  {
    id: 'attention',
    term: 'attention',
    simple:
      'Instead of forcing the whole input through one small summary, let the decoder glance back at every part of the input each time it produces a word — and let it learn where to glance. Choosing a word for “bank”, it can look back at “river” three words earlier.',
    technical:
      'It replaces the single context vector with a weighted average of *all* the encoder states, recomputed at every output step. The weights come from a learned compatibility score between the decoder’s current state (the query) and each encoder state (the keys), pushed through a [[softmax]] so they sum to one — a soft, differentiable lookup rather than a hard choice. Two consequences follow. Any input position is now one step away from any output position, so long-range dependencies stop decaying the way they do along a recurrent chain — the [[vanishing-gradient]] problem, dissolved rather than patched. And the weights are legible: plot them and you get a word alignment nobody labeled. Strip the recurrence away and keep only attention and you have the transformer, and with it every large language model in use today.',
    math:
      'Score $e_{t,s} = a(\\mathbf{s}_t, \\mathbf{h}_s)$, normalize $\\alpha_{t,s} = \\frac{\\exp(e_{t,s})}{\\sum_{s\'}\\exp(e_{t,s\'})}$, and read $\\mathbf{c}_t = \\sum_s \\alpha_{t,s}\\mathbf{h}_s$. Taking $a(\\mathbf{q},\\mathbf{k}) = \\frac{\\mathbf{q}\\cdot\\mathbf{k}}{\\sqrt{d}}$ gives the whole mechanism in one line: $\\mathrm{Attention}(Q,K,V) = \\mathrm{softmax}\\!\\left(\\frac{QK^\\top}{\\sqrt{d}}\\right)V$. The $\\sqrt{d}$ keeps the [[dot-product|dot products]] out of the softmax’s flat region; the cost is $O(T \\cdot T\')$ pairs, quadratic in length, which is why long-context models need approximations.',
    statquest: 'attention for neural networks',
    teachesAt: 'ch07-sequences',
    see: ['encoder-decoder', 'sequence-to-sequence', 'softmax', 'vanishing-gradient'],
  },
  {
    id: 'active-learning',
    term: 'active learning',
    simple:
      'Let the model choose its own homework. It reads through the pile of unlabeled examples, finds the handful it is most confused about, and asks the human expert to label only those.',
    technical:
      'For the case where labels, not data and not compute, are the scarce resource — a radiologist’s hour costs more than a GPU’s. The standard criterion multiplies uncertainty by *density*, and the density factor is not decoration: the single most uncertain point in a dataset is usually a bizarre outlier whose label generalizes to nothing, so weighting by how typical a point is keeps the budget on examples that stand in for many others. Query-by-committee swaps uncertainty for disagreement among several models. The catch worth knowing: the labeled set it produces is deliberately not a random sample of the data, so it is biased, and it is tied to the model that chose it — change the learner later and you may have bought the wrong labels.',
    math:
      'Score each unlabeled point by $\\mathrm{density}(\\mathbf{x}) \\times \\mathrm{uncertainty}(\\mathbf{x})$. Uncertainty is $-|f(\\mathbf{x}) - 0.5|$ for a [[sigmoid]] output, the margin $\\frac{|\\mathbf{w}\\mathbf{x}+b|}{\\|\\mathbf{w}\\|}$ negated for an SVM, or [[entropy]] $-\\sum_c \\Pr(c\\mid\\mathbf{x})\\log\\Pr(c\\mid\\mathbf{x})$ in the multiclass case, which peaks at the uniform distribution. Query-by-committee instead scores by vote entropy, or by the mean $\\mathrm{KL}$ divergence of each member from the committee consensus.',
    teachesAt: 'ch07-few-labels',
    see: ['self-learning', 'semi-supervised-learning', 'entropy', 'decision-threshold'],
  },
  {
    id: 'self-learning',
    term: 'self-learning',
    simple:
      'Label what you can, guess the rest, and keep the guesses you feel surest about as though they were real labels. Retrain on the enlarged set and go round again.',
    technical:
      'The baseline [[semi-supervised-learning|semi-supervised]] method, also called self-training or pseudo-labeling. Why unlabeled data can help at all: a boundary running through a dense region of examples is probably in the wrong place, and unlabeled points are what show you where the dense regions are. The failure mode is confirmation bias — a confident mistake is adopted as truth, reinforced in the next round, and nothing anywhere in the loop can undo it. Gains are typically modest and occasionally negative, so the honest procedure is to keep a genuinely labeled [[validation-set]] outside the loop and check it every round.',
    math:
      'Given labeled $\\mathcal{L}$ and unlabeled $\\mathcal{U}$, iterate: fit $f$ on $\\mathcal{L}$, then move $\\{(\\mathbf{x}, f(\\mathbf{x})) : \\mathbf{x}\\in\\mathcal{U},\\ \\mathrm{conf}(\\mathbf{x}) > \\tau\\}$ into $\\mathcal{L}$. Lowering $\\tau$ buys more pseudo-labels and more wrong ones. Under the cluster assumption the procedure approximates entropy minimization — adding $-\\sum_{\\mathbf{x}\\in\\mathcal{U}}\\sum_c \\Pr(c\\mid\\mathbf{x})\\log\\Pr(c\\mid\\mathbf{x})$ to the objective, which pushes the boundary out of dense regions.',
    teachesAt: 'ch07-few-labels',
    see: ['semi-supervised-learning', 'active-learning', 'autoencoder'],
  },
  {
    id: 'autoencoder',
    term: 'autoencoder',
    simple:
      'A network shaped like an hourglass, trained to copy its input to its output. The trick is the narrow waist in the middle: to get the data through it, the network is forced to find a compact description of what the data actually is.',
    technical:
      'An [[encoder-decoder]] trained with reconstruction error as its loss and no labels at all — the input is its own target, which makes it [[self-supervised-learning|self-supervised]]. The bottleneck is the entire mechanism: without it the identity function is a perfect solution and nothing is learned. Variants earn their keep by making the copying harder — a [[denoising-autoencoder]] is handed a corrupted input and asked for the clean one, which rules out memorization. Three uses: nonlinear [[dimensionality-reduction]], pretraining a representation when labels are scarce, and [[outlier-detection]], because a point unlike the training data cannot be squeezed through the waist and back out again.',
    math:
      'Minimize $\\frac{1}{N}\\sum_i \\|\\mathbf{x}_i - g(f(\\mathbf{x}_i))\\|^2$ with encoder $f:\\mathbb{R}^D\\to\\mathbb{R}^d$, decoder $g:\\mathbb{R}^d\\to\\mathbb{R}^D$ and $d < D$. When $f$ and $g$ are linear and the loss is squared error, the optimum spans the same subspace as the top $d$ [[principal-component|principal components]] — so an autoencoder is [[principal-component-analysis|PCA]] with the linearity removed. The reconstruction error $\\|\\mathbf{x} - g(f(\\mathbf{x}))\\|^2$ doubles as an anomaly score.',
    teachesAt: 'ch07-few-labels',
    see: ['encoder-decoder', 'bottleneck-layer', 'denoising-autoencoder', 'dimensionality-reduction'],
  },
  {
    id: 'one-shot-learning',
    term: 'one-shot learning',
    simple:
      'Learning to recognize something from a single example. Your phone does not retrain itself on ten thousand pictures of your face — it stores one and compares against it.',
    technical:
      'The name describes deployment, not training: a [[siamese-network]] is trained on many identities and many triplets to learn a general-purpose face [[embedding]], and only after that does one reference image per new person suffice. It works because what was learned is a *similarity function* rather than a list of classes, so adding a person costs one vector in a database instead of one output unit and a retraining run — which is what a [[softmax]] would demand. Neighboring settings: few-shot learning, with $k$ examples per class, and the standard benchmark phrasing, $N$-way $k$-shot classification.',
    math:
      'Verification thresholds a distance: accept when $\\|f(A) - f(\\hat{A})\\|^2 < \\tau$, with $\\tau$ chosen from the false-accept rate you can tolerate — the same [[roc-curve|threshold sweep]] as any other detector. Identification takes $\\arg\\min_{j}\\|f(\\mathbf{x}) - f(\\mathbf{g}_j)\\|$ over an enrolled gallery. No parameter is refitted when a class is added, because the classifier is the distance, not the weights.',
    teachesAt: 'ch07-few-labels',
    see: ['siamese-network', 'triplet-loss', 'embedding', 'zero-shot-learning'],
  },
  {
    id: 'siamese-network',
    term: 'siamese network',
    simple:
      'One network, run twice. Feed it two photographs and it turns each into a list of numbers; if the two lists land close together, it is the same person. The same weights process both images, which is why it is called a twin.',
    technical:
      'Sharing the weights is the point, not an optimization: two separately trained networks would learn two incompatible coordinate systems, and a distance measured between them would mean nothing. Training uses pairs with a contrastive loss or triplets with the [[triplet-loss]], and hard-negative mining matters enormously — a randomly drawn negative is usually so obviously different that the loss is already zero and the batch teaches nothing. Beyond faces: signature verification, duplicate-question detection, and any problem where the list of classes is open-ended and grows after deployment.',
    math:
      'With shared parameters $\\theta$, the network computes $f_\\theta(\\mathbf{x}) \\in \\mathbb{R}^d$ for each input and scores a pair by $d(f_\\theta(\\mathbf{x}_1), f_\\theta(\\mathbf{x}_2))$, usually squared Euclidean or cosine. Contrastive loss is $y\\,d^2 + (1-y)\\max(0, m - d)^2$: pull matching pairs together, push non-matching pairs apart until they exceed a margin $m$. Because $\\theta$ is shared, gradients from both branches sum into the same weights.',
    teachesAt: 'ch07-few-labels',
    see: ['triplet-loss', 'one-shot-learning', 'embedding', 'metric-learning'],
  },
  {
    id: 'triplet-loss',
    term: 'triplet loss',
    simple:
      'Show the network three pictures — you, you again, and a stranger — and demand that the two of you end up closer together than either of you is to the stranger, by a comfortable gap. Once that gap is achieved, stop pushing.',
    technical:
      'The margin is what rules out the trivial solution: without it, mapping every input to the same point scores zero and learns nothing. With it, the loss vanishes only when the negative is genuinely further than the positive *by the margin*, so the [[embedding]] is forced to spread out. In practice nearly every randomly drawn triplet already satisfies that condition and contributes exactly zero gradient, so training speed is governed almost entirely by negative mining — finding the strangers the current model confuses with the anchor. It is the same “only penalize what is not yet comfortably right” shape as [[hinge-loss]].',
    math:
      '$\\ell = \\max\\!\\left(0,\\ \\|f(A)-f(P)\\|^2 - \\|f(A)-f(N)\\|^2 + \\alpha\\right)$, zero as soon as $\\|f(A)-f(N)\\|^2 \\ge \\|f(A)-f(P)\\|^2 + \\alpha$. Below that, the gradient pulls $f(P)$ toward $f(A)$ and pushes $f(N)$ away. Embeddings are normally constrained to the unit sphere, $\\|f(\\mathbf{x})\\| = 1$, so distances live in $[0,4]$ and the margin has a fixed meaning that cannot be gamed by scaling every vector up.',
    teachesAt: 'ch07-few-labels',
    see: ['siamese-network', 'one-shot-learning', 'hinge-loss', 'embedding'],
  },
  {
    id: 'zero-shot-learning',
    term: 'zero-shot learning',
    simple:
      'Recognizing something you were never shown. If a model has learned to read striped, orange and mammal off a set of pixels, it can name a tiger the first time it meets one — because the description of a tiger was already sitting in the language it predicts into.',
    technical:
      'The move is to stop predicting a class index and start predicting a point in a semantic space that the classes also live in: [[word-embeddings]], or hand-written attribute vectors. A [[softmax]] cannot do this at all, because its output units are fixed the moment training starts and an unseen class has no unit to light up. Prediction becomes nearest-neighbor search over whatever label vocabulary you supply at test time, and that vocabulary may grow long after training. Two known weaknesses: hubness, where a few semantic vectors turn out to be the nearest neighbor of almost everything, and a strong pull toward the classes actually seen in training.',
    math:
      'Learn $g: \\mathcal{X}\\to\\mathbb{R}^d$ mapping inputs into the same space as the label embeddings $\\phi(y)$, by minimizing $\\|g(\\mathbf{x}) - \\phi(y)\\|^2$ or a ranking loss on the compatibility $g(\\mathbf{x})\\cdot\\phi(y)$. Predict $\\hat{y} = \\arg\\min_{y \\in \\mathcal{Y}_{\\text{test}}}\\|g(\\mathbf{x}) - \\phi(y)\\|$, where $\\mathcal{Y}_{\\text{test}}$ may contain labels absent from $\\mathcal{Y}_{\\text{train}}$ — the classifier is the label’s embedding, not a row of a weight matrix.',
    teachesAt: 'ch07-few-labels',
    see: ['word-embeddings', 'embedding', 'one-shot-learning', 'cosine-similarity'],
  },
];

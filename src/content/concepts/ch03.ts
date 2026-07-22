import type { Concept } from './types';

/**
 * Chapter 3's vocabulary: the five classic algorithms, and — the part the book
 * races past in a paragraph — what a kernel actually is.
 */
export const conceptsCh03: Concept[] = [
  {
    id: 'linear-regression',
    term: 'linear regression',
    simple:
      'Draw the straight line that comes closest to a cloud of points, then read predictions off the line. Everything else in the chapter is a variation on that idea.',
    technical:
      'A [[model-based-learning|model-based]] regressor whose prediction is a weighted sum of the features plus an offset. Fitting means choosing the weights that minimize [[mean-squared-error]] on the training set. It has low [[model-capacity|capacity]] — it can only ever draw a flat surface — which is exactly why it rarely [[overfitting|overfits]] and why it is the sane thing to try first.',
    math:
      'The model is $f_{\\mathbf{w},b}(\\mathbf{x}) = \\mathbf{w}\\mathbf{x} + b$, a [[dot-product]] of the weight vector with the feature vector. Fitting solves $\\min_{\\mathbf{w},b} \\frac{1}{N}\\sum_{i=1}^{N}(f_{\\mathbf{w},b}(\\mathbf{x}_i) - y_i)^2$. Because that objective is [[convex]] and smooth, it has a [[closed-form-solution]]: $\\mathbf{w} = (\\mathbf{X}^\\top\\mathbf{X})^{-1}\\mathbf{X}^\\top\\mathbf{y}$.',
    statquest: 'linear regression',
    teachesAt: 'ch03-linear-regression',
    see: ['mean-squared-error', 'closed-form-solution', 'gradient-descent'],
  },
  {
    id: 'mean-squared-error',
    term: 'mean squared error',
    simple:
      'A score for how wrong a line is: measure how far off each prediction was, square each miss so that being under and being over both count as bad, and average.',
    technical:
      'The standard [[loss-function|loss]] for regression. Squaring makes the objective smooth and [[convex]], which is what lets you solve it in [[closed-form-solution|closed form]] or walk downhill with [[gradient-descent]]. The cost of squaring is that a single wild outlier can dominate the sum, so MSE fits are not robust; absolute error is the robust alternative, at the price of a kink at zero.',
    math:
      '$\\mathrm{MSE} = \\frac{1}{N}\\sum_{i=1}^{N}\\left(f(\\mathbf{x}_i) - y_i\\right)^2$. The square is what makes $\\partial \\mathrm{MSE}/\\partial w$ linear in $w$, and therefore what makes the whole thing solvable. Its units are the target’s units *squared*, which is why people often report $\\sqrt{\\mathrm{MSE}}$ instead.',
    statquest: 'mean squared error',
    teachesAt: 'ch03-linear-regression',
    see: ['loss-function', 'squared-loss', 'convex'],
  },
  {
    id: 'closed-form-solution',
    term: 'closed-form solution',
    simple:
      'A formula that hands you the answer directly, instead of a procedure that creeps toward it. Plug the numbers in, get the best model out — no iterations, no learning rate, no waiting.',
    technical:
      'Available when setting the derivative of the objective to zero can be solved algebraically. Linear regression has one; [[logistic-regression]] does not, which is precisely why the book introduces [[gradient-descent]] where it does. Closed form is exact but scales badly: inverting $\\mathbf{X}^\\top\\mathbf{X}$ costs roughly $O(D^3)$ in the number of features, so with many features iterative methods win anyway.',
    math:
      'Set $\\nabla_{\\mathbf{w}}\\,\\mathrm{MSE} = 0$ and solve. For linear regression that gives the *normal equations* $\\mathbf{X}^\\top\\mathbf{X}\\mathbf{w} = \\mathbf{X}^\\top\\mathbf{y}$, hence $\\mathbf{w} = (\\mathbf{X}^\\top\\mathbf{X})^{-1}\\mathbf{X}^\\top\\mathbf{y}$ whenever $\\mathbf{X}^\\top\\mathbf{X}$ is invertible.',
    teachesAt: 'ch03-linear-regression',
    see: ['gradient-descent', 'convex'],
  },
  {
    id: 'logistic-regression',
    term: 'logistic regression',
    simple:
      'A classifier with a misleading name. It draws a straight boundary like linear regression, then bends the output through an S-curve so the answer reads as a probability between 0 and 1 instead of an unbounded number.',
    technical:
      'A linear model wrapped in the [[sigmoid]]. The linear part $\\mathbf{w}\\mathbf{x} + b$ decides which side of the boundary a point falls on and how far; the sigmoid squashes that distance into a probability. Fitted by [[maximum-likelihood]] rather than least squares, and there is no [[closed-form-solution]], so it is trained with [[gradient-descent]]. The output being calibrated is what makes it so useful upstream of a [[decision-threshold]].',
    math:
      '$f_{\\mathbf{w},b}(\\mathbf{x}) = \\dfrac{1}{1 + e^{-(\\mathbf{w}\\mathbf{x} + b)}}$. Fitting maximizes the [[log-likelihood]] $\\sum_i \\left[y_i \\log f(\\mathbf{x}_i) + (1-y_i)\\log(1 - f(\\mathbf{x}_i))\\right]$ — equivalently, minimizes cross-entropy. The decision boundary is the set where $\\mathbf{w}\\mathbf{x} + b = 0$, i.e. where the sigmoid outputs exactly $0.5$.',
    statquest: 'logistic regression',
    teachesAt: 'ch03-logistic-regression',
    see: ['sigmoid', 'maximum-likelihood', 'log-likelihood', 'decision-threshold'],
  },
  {
    id: 'sigmoid',
    term: 'sigmoid (logistic function)',
    simple:
      'A smooth S-shaped squash. Feed it any number, however large or negative, and it comes back between 0 and 1 — so it turns a raw score into something you can call a probability.',
    technical:
      'Monotonic, differentiable everywhere, and centered so that an input of 0 gives 0.5. Its derivative has the tidy form $\\sigma(1-\\sigma)$, which is what makes [[backpropagation]] through it cheap. Its weakness is *saturation*: far from zero the curve is nearly flat, the gradient nearly zero, and learning stalls — the reason deep networks moved to [[relu]].',
    math:
      '$\\sigma(z) = \\dfrac{1}{1 + e^{-z}}$, with $\\sigma\'(z) = \\sigma(z)\\left(1 - \\sigma(z)\\right)$ and $\\sigma(-z) = 1 - \\sigma(z)$. The inverse is the *logit*, $\\log\\frac{p}{1-p}$, so logistic regression is exactly a linear model of the log-odds.',
    statquest: 'logistic function sigmoid',
    teachesAt: 'ch03-logistic-regression',
    see: ['logistic-regression', 'softmax', 'relu'],
  },
  {
    id: 'maximum-likelihood',
    term: 'maximum likelihood',
    simple:
      'Pick the settings that make the data you actually observed the least surprising. If a coin came up heads 7 times in 10, the likelihood-maximizing guess is that it lands heads 70% of the time.',
    technical:
      'A fitting principle rather than an algorithm: define the probability the model assigns to the observed labels, then choose parameters to maximize it. For regression with Gaussian noise, maximum likelihood *is* least squares — [[mean-squared-error]] falls out of it. For classification it gives cross-entropy. Adding a prior over the parameters instead gives [[maximum-a-posteriori]], and that prior is where [[regularization]] comes from.',
    math:
      'Maximize $L(\\mathbf{w}, b) = \\prod_{i=1}^{N} f(\\mathbf{x}_i)^{y_i}\\left(1 - f(\\mathbf{x}_i)\\right)^{1-y_i}$. In practice maximize its logarithm — see [[log-likelihood]] — because a product of $N$ small numbers underflows and a sum does not.',
    statquest: 'maximum likelihood',
    teachesAt: 'ch03-logistic-regression',
    see: ['log-likelihood', 'maximum-a-posteriori', 'likelihood'],
  },
  {
    id: 'log-likelihood',
    term: 'log-likelihood',
    simple:
      'The same "how unsurprising is my data" score, but with logarithms — which turns an unwieldy chain of multiplications into a simple sum.',
    technical:
      'Taking the log is safe because the logarithm is strictly increasing: whatever maximizes the likelihood maximizes its log. Three things are gained. Products become sums, so the gradient is a sum of per-example terms and [[stochastic-gradient-descent|SGD]] becomes possible. Numerical underflow disappears. And the resulting objective for a [[sigmoid]] output is exactly cross-entropy, which is [[convex]] in the weights.',
    math:
      '$\\log L = \\sum_{i=1}^{N}\\left[y_i\\log f(\\mathbf{x}_i) + (1 - y_i)\\log\\!\\left(1 - f(\\mathbf{x}_i)\\right)\\right]$. Minimizing $-\\log L$ is the usual framing, since optimizers descend. With $f = \\sigma(\\mathbf{w}\\mathbf{x}+b)$ the gradient collapses to the strikingly simple $\\sum_i (y_i - f(\\mathbf{x}_i))\\,\\mathbf{x}_i$.',
    teachesAt: 'ch03-logistic-regression',
    see: ['maximum-likelihood', 'gradient-descent'],
  },
  {
    id: 'decision-tree',
    term: 'decision tree',
    simple:
      'A flowchart of yes/no questions. Start at the top, answer each question about the example in front of you, and whichever box you land in gives the prediction.',
    technical:
      'Each internal node tests one feature against one threshold; each [[leaf-node|leaf]] holds a prediction. Built [[greedy-algorithm|greedily]] — at every node, take the split with the best [[information-gain]] right now and never reconsider it. Trees are [[non-parametric-model|non-parametric]], invariant to feature scaling, and read like an explanation, which is why they survive in regulated settings. Left unchecked a single tree [[overfitting|overfits]] hard, which is what [[pruning]] and [[ensemble-learning|ensembles]] exist to fix.',
    math:
      'A tree partitions the feature space into axis-aligned boxes $R_1,\\dots,R_M$ and predicts a constant per box: $f(\\mathbf{x}) = \\sum_{m} c_m\\,\\mathbb{1}[\\mathbf{x}\\in R_m]$. For classification $c_m$ is the [[majority-vote|majority label]] in the box; the split chosen at each node maximizes $H(\\mathcal{S}) - \\sum_k \\frac{|\\mathcal{S}_k|}{|\\mathcal{S}|}H(\\mathcal{S}_k)$.',
    statquest: 'decision trees',
    teachesAt: 'ch03-decision-trees',
    see: ['entropy', 'information-gain', 'id3', 'pruning', 'random-forest'],
  },
  {
    id: 'leaf-node',
    term: 'leaf',
    simple:
      'The bottom of the tree — a box with no more questions in it, holding the answer you get if you land there.',
    technical:
      'A leaf stores whatever the training examples that reached it agreed on: the majority class, the class proportions, or the mean target for regression. How pure leaves are allowed to be is the main capacity dial on a tree — split until every leaf is pure and you have memorized the training set.',
    math:
      'For classification, a leaf holding set $\\mathcal{S}$ predicts $\\arg\\max_y |\\{i \\in \\mathcal{S}: y_i = y\\}|$, or reports $\\Pr(y) = \\frac{1}{|\\mathcal{S}|}\\sum_{i\\in\\mathcal{S}}\\mathbb{1}[y_i = y]$. For regression it predicts $\\frac{1}{|\\mathcal{S}|}\\sum_{i\\in\\mathcal{S}} y_i$, the value minimizing squared error inside the box.',
    teachesAt: 'ch03-decision-trees',
    see: ['decision-tree', 'entropy'],
  },
  {
    id: 'entropy',
    term: 'entropy',
    simple:
      'How mixed up a group is. All-spam or all-not-spam is perfectly tidy and scores zero; a fifty-fifty mix is maximum mess and scores one.',
    technical:
      'Measured in bits: the average number of yes/no questions you would need to identify the label of a randomly drawn member of the set. A tree splits to *reduce* it, because a tidy group is one where a confident prediction is possible. Entropy is not the only purity measure — Gini impurity is cheaper and nearly always chooses the same splits.',
    math:
      'For a binary set with a fraction $p$ of positives, $H(\\mathcal{S}) = -p\\log_2 p - (1-p)\\log_2(1-p)$, maximal at $p=\\tfrac12$ where $H=1$, and zero at $p\\in\\{0,1\\}$ with the convention $0\\log_2 0 = 0$. In general, $H(\\mathcal{S}) = -\\sum_k p_k \\log_2 p_k$.',
    statquest: 'entropy for decision trees',
    teachesAt: 'ch03-decision-trees',
    see: ['information-gain', 'decision-tree'],
  },
  {
    id: 'information-gain',
    term: 'information gain',
    simple:
      'How much tidier a question makes things. Measure the mess before you split, measure the mess in the two piles afterwards, and the drop is the gain. The tree asks whichever question gains most.',
    technical:
      'The reduction in [[entropy]] from a split, with the child sets weighted by size so that a split isolating three examples cannot beat one that cleanly halves the data. Its known bias is toward high-[[cardinality|cardinality]] features — a split on a unique id gives perfect purity and zero generalization — which is why C4.5 normalizes it into *gain ratio*.',
    math:
      '$\\mathrm{IG} = H(\\mathcal{S}) - \\sum_{k}\\frac{|\\mathcal{S}_k|}{|\\mathcal{S}|}\\,H(\\mathcal{S}_k)$, where $\\mathcal{S}_k$ are the child sets. Equivalently $H(Y) - H(Y \\mid \\text{split})$: the mutual information between the label and the answer to the question. It is never negative, so a split can never *look* harmful on the training set — the reason [[pruning]] is needed.',
    statquest: 'information gain',
    teachesAt: 'ch03-decision-trees',
    see: ['entropy', 'decision-tree', 'pruning'],
  },
  {
    id: 'id3',
    term: 'ID3',
    simple:
      'The original recipe for growing a decision tree: at each step try every question, keep the one that tidies the data most, and repeat on each of the two piles.',
    technical:
      'Iterative Dichotomiser 3. Recursive, [[greedy-algorithm|greedy]], stops when a node is pure, too small, or too deep. It optimizes nothing globally — the tree it returns is not the best tree, just a tree built from locally best choices, because searching all trees is NP-hard. C4.5 adds gain ratio, numeric splits and [[pruning]]; CART adds Gini and regression trees.',
    math:
      'At each node choose the split $s^\\star = \\arg\\max_s \\left[H(\\mathcal{S}) - \\sum_k \\frac{|\\mathcal{S}_k^s|}{|\\mathcal{S}|}H(\\mathcal{S}_k^s)\\right]$, then recurse on each $\\mathcal{S}_k^{s^\\star}$. With $N$ examples and $D$ features, one node costs $O(ND)$ and a balanced tree $O(ND\\log N)$ overall.',
    teachesAt: 'ch03-decision-trees',
    see: ['decision-tree', 'information-gain', 'greedy-algorithm'],
  },
  {
    id: 'greedy-algorithm',
    term: 'greedy algorithm',
    simple:
      'Always take the best-looking step right now and never look back. Fast, and usually good — but it can walk confidently into a dead end that a little foresight would have avoided.',
    technical:
      'The pattern behind tree induction, [[boosting]] and feature selection alike. It is chosen when the exhaustive search is intractable: the number of possible decision trees is astronomically large, so the alternative is not a better algorithm but no algorithm. The failure mode is a split that looks weak alone but is excellent in combination — XOR is the classic case, where no single feature reduces [[entropy]] at all.',
    math:
      'Greedy induction returns a local optimum of the objective. Finding the smallest tree consistent with a training set is NP-complete (Hyafil & Rivest, 1976), so the guarantee available is only that each individual step maximizes $\\mathrm{IG}$, not that the sequence does.',
    teachesAt: 'ch03-decision-trees',
    see: ['decision-tree', 'id3'],
  },
  {
    id: 'pruning',
    term: 'pruning',
    simple:
      'Grow the tree too big on purpose, then cut back the branches that were only ever memorizing noise.',
    technical:
      'Post-pruning beats early stopping because a split that looks worthless can enable a valuable one beneath it — you cannot tell at the time. Branches are removed when collapsing them into a [[leaf-node|leaf]] does not hurt performance on a held-out [[validation-set]], or when the penalized objective improves. It is [[regularization]] for a model with no weights to shrink.',
    math:
      'Cost-complexity pruning minimizes $R_\\alpha(T) = R(T) + \\alpha|\\mathrm{leaves}(T)|$, where $R(T)$ is training error and $\\alpha \\ge 0$ prices each leaf. Sweeping $\\alpha$ from 0 upward produces a nested sequence of trees; the one with the best [[cross-validation]] score wins.',
    teachesAt: 'ch03-decision-trees',
    see: ['regularization', 'overfitting', 'validation-set'],
  },
  {
    id: 'non-parametric-model',
    term: 'non-parametric model',
    simple:
      'A model with no fixed-size set of dials. Instead of squeezing the data into a formula with three numbers in it, it keeps the data — or grows to fit it — so it can take whatever shape it needs.',
    technical:
      'The name is a misnomer: non-parametric means the number of parameters grows with the data, not that there are none. [[k-nearest-neighbors|kNN]] keeps every example; a [[decision-tree]] grows more nodes when given more data; [[kernel-density-estimation|KDE]] places one bump per point. The trade is flexibility for cost — prediction gets slower as the training set grows — and the [[hyperparameter]]s do not disappear, they just move (to $k$, to depth, to bandwidth).',
    math:
      'A parametric model fixes a parameter count $|\\theta| = D$ independent of $N$. A non-parametric one has effective complexity growing with $N$: kernel regression evaluates $\\sum_{i=1}^{N} w_i(\\mathbf{x})\\,y_i$, a sum over the *entire* training set, so prediction is $O(N)$ rather than $O(D)$.',
    teachesAt: 'ch03-decision-trees',
    see: ['k-nearest-neighbors', 'decision-tree', 'kernel-regression'],
  },
  {
    id: 'hinge-loss',
    term: 'hinge loss',
    simple:
      'A penalty that ignores you completely once you are right by a comfortable margin — and then grows steadily the more wrong you are. Getting it right is not enough; getting it right with room to spare is what stops the charge.',
    technical:
      'The loss behind the [[soft-margin-svm|soft-margin SVM]]. Points outside the margin and on the correct side contribute exactly zero, which is why an SVM’s boundary depends on only a handful of [[support-vector|support vectors]] and ignores the rest of the data entirely. It is [[convex]] but not differentiable at the hinge, so training uses a subgradient. Compare [[log-likelihood|log loss]], which never reaches zero and so keeps nudging on every example forever.',
    math:
      '$\\ell(\\mathbf{x}_i, y_i) = \\max\\!\\left(0,\\ 1 - y_i(\\mathbf{w}\\mathbf{x}_i - b)\\right)$ with labels $y_i \\in \\{-1, +1\\}$. Zero when $y_i(\\mathbf{w}\\mathbf{x}_i - b) \\ge 1$ — correct *and* beyond the margin — and rising linearly below that, passing through 1 at the boundary itself.',
    statquest: 'support vector machines',
    teachesAt: 'ch03-svm',
    see: ['soft-margin-svm', 'support-vector', 'loss-function'],
  },
  {
    id: 'soft-margin-svm',
    term: 'soft-margin SVM',
    simple:
      'A separating line that is allowed to give up on a few stubborn points rather than contorting itself to catch every last one. One dial decides how much it is willing to tolerate.',
    technical:
      'Real data overlaps, so demanding perfect separation either fails outright or produces a wildly overfitted boundary. The soft margin adds a [[hinge-loss]] term: the optimizer now balances a wide [[margin]] against the violations that width costs, with [[svm-c|C]] setting the exchange rate. This is [[regularization]] in disguise — $\\|\\mathbf{w}\\|^2$ is an L2 penalty, and the margin is what it buys.',
    math:
      'Minimize $\\tfrac{1}{2}\\|\\mathbf{w}\\|^2 + C\\sum_{i=1}^{N}\\max\\!\\left(0,\\,1 - y_i(\\mathbf{w}\\mathbf{x}_i - b)\\right)$. The margin width is $2/\\|\\mathbf{w}\\|$, so shrinking $\\|\\mathbf{w}\\|$ widens it. Note the book writes this as $C\\|\\mathbf{w}\\|^2 + {}$average hinge, which mirrors the role of $C$ relative to the library convention above.',
    statquest: 'support vector machines part 2 polynomial kernel',
    teachesAt: 'ch03-svm',
    see: ['hinge-loss', 'svm-c', 'margin', 'support-vector'],
  },
  {
    id: 'svm-c',
    term: 'C (the SVM penalty)',
    simple:
      'The strictness dial. Turn it down and the line is relaxed — wide, smooth, willing to misplace a few points. Turn it up and it becomes a perfectionist, bending itself out of shape to catch every last one.',
    technical:
      'C prices each unit of [[hinge-loss]] against margin width. Small C means a wide margin and many tolerated violations — high bias, low variance. Large C approaches the hard-margin SVM: it will contort the boundary around a single mislabeled point, which is textbook [[overfitting]]. There is no default worth trusting; C is tuned by [[cross-validation]], usually on a log scale.',
    math:
      'In $\\tfrac{1}{2}\\|\\mathbf{w}\\|^2 + C\\sum_i \\xi_i$ with slack $\\xi_i = \\max(0, 1 - y_i(\\mathbf{w}\\mathbf{x}_i - b))$, $C \\to 0$ minimizes $\\|\\mathbf{w}\\|$ alone (infinitely wide, useless margin) and $C \\to \\infty$ forces every $\\xi_i \\to 0$ (hard margin, only possible if the data is separable). $1/C$ plays the role $\\lambda$ plays in ridge regression.',
    teachesAt: 'ch03-svm',
    see: ['soft-margin-svm', 'regularization', 'bias-variance-tradeoff'],
  },
  {
    id: 'support-vector',
    term: 'support vector',
    simple:
      'The handful of points that actually hold the boundary in place. Move one and the boundary moves; delete any of the others and nothing happens at all.',
    technical:
      'The examples lying on or inside the margin — the only ones with non-zero weight in the fitted solution. This is why SVMs are memory-efficient at prediction time and why they are sensitive to mislabeled points *near the boundary* while being completely indifferent to outliers far on the correct side.',
    math:
      'In the dual formulation $\\mathbf{w} = \\sum_i \\alpha_i y_i \\mathbf{x}_i$, and $\\alpha_i > 0$ only for support vectors; every other $\\alpha_i$ is exactly zero. Prediction $\\mathrm{sign}\\!\\left(\\sum_{i \\in SV} \\alpha_i y_i (\\mathbf{x}_i\\mathbf{x}) - b\\right)$ therefore touches only that subset — and, crucially, touches the data *only through dot products*.',
    teachesAt: 'ch03-svm',
    see: ['margin', 'kernel-trick', 'soft-margin-svm'],
  },
  {
    id: 'kernel-function',
    term: 'kernel function',
    simple:
      'A similarity score between two examples. Hand it two points and it tells you how alike they are — and that single number is all some algorithms ever need to know about your data.',
    technical:
      'A kernel $k(\\mathbf{x}, \\mathbf{x}\')$ is any function that equals a [[dot-product]] in *some* feature space, without you ever having to build that space. Because [[support-vector|SVM]] training touches the data only through dot products, swapping the dot product for a kernel silently moves the whole algorithm into a richer space. The common choices are linear, polynomial, and — by a wide margin the default — the [[rbf-kernel|RBF kernel]].',
    math:
      'Valid kernels are exactly the symmetric [[positive-semidefinite|positive semidefinite]] functions (Mercer’s condition): for any points, the Gram matrix $K_{ij} = k(\\mathbf{x}_i, \\mathbf{x}_j)$ must have no negative eigenvalues. That condition guarantees some $\\phi$ exists with $k(\\mathbf{x},\\mathbf{x}\') = \\phi(\\mathbf{x})\\cdot\\phi(\\mathbf{x}\')$, even when $\\phi$ maps into infinitely many dimensions.',
    statquest: 'kernel trick',
    teachesAt: 'ch03-svm',
    see: ['kernel-trick', 'rbf-kernel', 'dot-product'],
  },
  {
    id: 'kernel-trick',
    term: 'the kernel trick',
    simple:
      'Two rings, one inside the other, cannot be split by a straight line on paper. But lift the inner ring off the page and a flat sheet slides right between them. The trick is that you get the benefit of that lift without ever doing it — you only ever compute similarities.',
    technical:
      'Formally: the SVM optimization and its predictions depend on the data *only* through dot products $\\mathbf{x}_i\\mathbf{x}_k$. So replace every dot product with a [[kernel-function|kernel]] and the algorithm behaves exactly as if you had first mapped every point through $\\phi$ into a high-dimensional space — while $\\phi$ is never applied to anything, and its output is never stored. A boundary that is a straight hyperplane up there is a curve down here.',
    math:
      'Take $\\phi(q_1,q_2) = (q_1^2,\\ \\sqrt{2}\\,q_1q_2,\\ q_2^2)$. Then $\\phi(\\mathbf{x})\\cdot\\phi(\\mathbf{x}\') = (\\mathbf{x}\\mathbf{x}\')^2$ — the three-dimensional dot product is computable by one multiply and one square in two dimensions. Prediction becomes $\\mathrm{sign}\\!\\left(\\sum_i \\alpha_i y_i\\, k(\\mathbf{x}_i, \\mathbf{x}) - b\\right)$: no $\\phi$ anywhere.',
    statquest: 'kernel trick',
    teachesAt: 'ch03-svm',
    see: ['kernel-function', 'rbf-kernel', 'support-vector'],
  },
  {
    id: 'rbf-kernel',
    term: 'RBF kernel',
    simple:
      'Similarity that falls off with distance, like a torch beam fading into the dark. Two points on top of each other score 1; move them apart and the score slides to 0. Give an SVM this and its boundary stops being a line and becomes a shape drawn around the points themselves.',
    technical:
      'Radial Basis Function, also called the Gaussian kernel: $k$ depends only on the distance between two points, never their direction — hence *radial*. Each training point effectively contributes a bump, and the decision boundary is the contour where the positive bumps outweigh the negative ones, which is why it can enclose a cluster, carve out an island, or draw several disconnected regions at once. Its implicit feature space has *infinitely* many dimensions, so an RBF SVM can in principle separate any finite dataset — which is exactly why it needs [[svm-c|C]] and [[gamma-rbf|γ]] tuned carefully, or it will happily memorize the training set.',
    math:
      '$k(\\mathbf{x}, \\mathbf{x}\') = \\exp\\!\\left(-\\gamma\\|\\mathbf{x} - \\mathbf{x}\'\\|^2\\right)$, equivalently $\\exp\\!\\left(-\\frac{\\|\\mathbf{x}-\\mathbf{x}\'\\|^2}{2\\sigma^2}\\right)$ with $\\gamma = 1/(2\\sigma^2)$. Expanding $e^{z}$ as its power series shows the implied $\\phi$ has one coordinate per polynomial degree — infinitely many. The prediction $\\sum_i \\alpha_i y_i \\exp(-\\gamma\\|\\mathbf{x}_i - \\mathbf{x}\\|^2)$ is a weighted sum of Gaussian bumps, one per [[support-vector|support vector]].',
    statquest: 'radial basis function RBF kernel',
    teachesAt: 'ch03-svm',
    see: ['kernel-trick', 'gamma-rbf', 'kernel-function', 'overfitting'],
  },
  {
    id: 'gamma-rbf',
    term: 'γ (RBF width)',
    simple:
      'How far each point’s influence reaches. Small γ means a wide, soft glow and a smooth boundary; large γ means a pinprick of light around every point, and a boundary that becomes a set of tiny islands drawn around individual examples.',
    technical:
      'γ is the inverse width of the bump. Too small and every point looks equally similar to every other, so the kernel degenerates toward a linear model and [[underfitting|underfits]]. Too large and each training point only resembles itself, so the model memorizes — perfect training accuracy, useless predictions. γ and [[svm-c|C]] interact, which is why they are tuned together on a 2D [[grid-search|grid]].',
    math:
      '$\\gamma = 1/(2\\sigma^2)$, so $\\sigma$ is the standard deviation of the Gaussian bump in input units. As $\\gamma \\to 0$, $k \\to 1$ for all pairs and the Gram matrix approaches rank one. As $\\gamma \\to \\infty$, $k \\to \\mathbb{1}[\\mathbf{x} = \\mathbf{x}\']$ — the identity matrix, i.e. a lookup table. A sane starting scale is $\\gamma \\approx 1/(D\\cdot\\mathrm{Var}(\\mathbf{x}))$, which is scikit-learn’s `gamma=\'scale\'`.',
    teachesAt: 'ch03-svm',
    see: ['rbf-kernel', 'svm-c', 'overfitting', 'grid-search'],
  },
  {
    id: 'kernel-perceptron',
    term: 'kernel perceptron',
    simple:
      'The simplest thing that can use a kernel: keep looping over the examples, and every time you get one wrong, add a bump centered on it. Do that enough times and the bumps add up to a working boundary.',
    technical:
      'The mistake-driven cousin of the SVM. It uses the same [[kernel-trick]] but replaces margin maximization with a plain error-correcting loop, so it converges fast and is trivial to implement — at the cost of the SVM’s margin guarantees. It is what the playground in this chapter actually runs, because it retrains in milliseconds while you drag a slider.',
    math:
      'Keep counts $\\alpha_i$, initially zero. For each misclassified $\\mathbf{x}_i$ — one where $y_i \\sum_j \\alpha_j y_j k(\\mathbf{x}_j, \\mathbf{x}_i) \\le 0$ — set $\\alpha_i \\leftarrow \\alpha_i + 1$. Predict $\\mathrm{sign}\\!\\left(\\sum_j \\alpha_j y_j k(\\mathbf{x}_j, \\mathbf{x})\\right)$. On separable data it converges in a finite number of mistakes; on noisy data it does not settle.',
    teachesAt: 'ch03-svm',
    see: ['kernel-trick', 'rbf-kernel'],
  },
  {
    id: 'k-nearest-neighbors',
    term: 'k-nearest neighbors',
    simple:
      'To label something new, look up the k most similar things you have already seen and take a vote. There is no training at all — the algorithm is the dataset.',
    technical:
      'The canonical [[instance-based-learning|instance-based]] and [[non-parametric-model|non-parametric]] method. Small k gives a jagged boundary that chases noise ([[overfitting]]); large k smooths it toward the global majority ([[underfitting]]). Everything depends on the [[distance-metric|distance function]], so unscaled features quietly wreck it — one feature measured in thousands drowns out every other. Prediction costs $O(ND)$ per query, which is why approximate nearest-neighbor indexes exist.',
    math:
      'Given a distance $d$, let $\\mathcal{N}_k(\\mathbf{x})$ be the $k$ closest training points. Classification predicts $\\arg\\max_y \\sum_{i \\in \\mathcal{N}_k(\\mathbf{x})}\\mathbb{1}[y_i = y]$; regression predicts $\\frac{1}{k}\\sum_{i\\in\\mathcal{N}_k(\\mathbf{x})} y_i$. Common distances: Euclidean $\\sqrt{\\sum_j (x^{(j)} - x\'^{(j)})^2}$ and [[cosine-similarity|cosine]].',
    statquest: 'k nearest neighbors',
    teachesAt: 'ch03-knn',
    see: ['instance-based-learning', 'cosine-similarity', 'non-parametric-model'],
  },
  {
    id: 'cosine-similarity',
    term: 'cosine similarity',
    simple:
      'Compare two things by the direction they point rather than how big they are. A short document and a long one about the same subject point the same way, even though their word counts are nothing alike.',
    technical:
      'The cosine of the angle between two vectors: 1 when parallel, 0 when perpendicular, −1 when opposed. Length-invariant, which is what makes it the default for text [[bag-of-words|bag-of-words]] vectors and for [[word-embeddings]], where magnitude mostly encodes frequency rather than meaning. On L2-normalized vectors it is a monotone function of Euclidean distance, so the two rank neighbors identically.',
    math:
      '$s(\\mathbf{x}, \\mathbf{x}\') = \\dfrac{\\mathbf{x}\\mathbf{x}\'}{\\|\\mathbf{x}\\|\\,\\|\\mathbf{x}\'\\|} = \\dfrac{\\sum_j x^{(j)}x\'^{(j)}}{\\sqrt{\\sum_j (x^{(j)})^2}\\sqrt{\\sum_j (x\'^{(j)})^2}}$. Cosine *distance* is $1 - s$, which is not a true [[distance-metric|metric]] — it violates the triangle inequality.',
    teachesAt: 'ch03-knn',
    see: ['dot-product', 'k-nearest-neighbors', 'word-embeddings'],
  },
  {
    id: 'instance-based-learning',
    term: 'instance-based learning',
    simple:
      'Learning by remembering. Instead of boiling the data down into a formula, keep the examples and answer new questions by looking up the ones that resemble them.',
    technical:
      'Also called lazy learning: training is trivial (store the data), prediction is expensive (search it). The opposite of [[model-based-learning|model-based]] learning, where the cost is paid up front. Instance-based methods adapt to any decision-boundary shape without being told what shape to expect, but they need the whole training set at prediction time and degrade badly in very high dimensions, where every point is roughly equidistant from every other.',
    math:
      'Prediction has the general form $f(\\mathbf{x}) = \\sum_{i=1}^{N} w_i(\\mathbf{x})\\,y_i$, where the weights depend on the query. [[k-nearest-neighbors|kNN]] uses $w_i = \\frac{1}{k}\\mathbb{1}[i \\in \\mathcal{N}_k(\\mathbf{x})]$; [[kernel-regression]] uses smooth weights $w_i \\propto k\\!\\left(\\frac{\\mathbf{x}_i - \\mathbf{x}}{b}\\right)$.',
    teachesAt: 'ch03-knn',
    see: ['k-nearest-neighbors', 'model-based-learning', 'non-parametric-model'],
  },
];

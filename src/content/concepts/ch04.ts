import type { Concept } from './types';

/**
 * Chapter 4's vocabulary: the three parts every supervised algorithm is
 * assembled from, and — the mechanism the whole book leans on — what it
 * actually means to walk a criterion downhill.
 */
export const conceptsCh04: Concept[] = [
  {
    id: 'loss-function',
    term: 'loss function',
    simple:
      'A rule that puts a price on one wrong answer. Hand it the truth and the model’s guess for a single example and it returns a number: zero for a perfect guess, larger the worse the miss.',
    technical:
      'The loss scores *one* example; averaging it over the training set gives the [[optimization-criterion|criterion]] you actually minimize. Choosing a loss is choosing what "wrong" means, and the choice decides which examples the optimiser chases: [[squared-loss]] grows quadratically, so one gross outlier can outweigh a hundred small errors; [[hinge-loss]] charges nothing at all once a point clears the margin; log loss never quite reaches zero, so it keeps nudging on every example forever.',
    math:
      'A loss is any $\\ell(y_i, f(\\mathbf{x}_i)) \\ge 0$ that is zero at a perfect prediction — squared $(y_i - f_i)^2$, hinge $\\max(0, 1 - y_i f_i)$, log $-[y_i\\log f_i + (1-y_i)\\log(1-f_i)]$. For a gradient method the shape that matters is $\\partial\\ell/\\partial f$: it is $-2(y_i - f_i)$ for the square, which grows without bound with the residual, and $\\pm 1$ for absolute error, which does not — the whole robustness difference in one derivative.',
    statquest: 'loss function',
    teachesAt: 'ch04-building-blocks',
    see: ['optimization-criterion', 'squared-loss', 'hinge-loss'],
  },
  {
    id: 'optimization-criterion',
    term: 'optimization criterion',
    simple:
      'The single number the whole training run tries to make small. One example’s penalty is not enough to steer by, so you fold all of them into one score — and that score is what the algorithm argues with.',
    technical:
      'Also called the cost function, the objective, or the empirical risk. Normally the average [[loss-function|loss]] over the training set, sometimes with a [[regularization]] term added that penalizes the parameters themselves rather than the errors. Averaging rather than summing is deliberate: it keeps the scale of the criterion — and therefore a workable [[learning-rate]] — independent of how many examples you happen to have.',
    math:
      '$J(\\mathbf{w},b) = \\frac{1}{N}\\sum_{i=1}^{N}\\ell\\!\\left(y_i, f_{\\mathbf{w},b}(\\mathbf{x}_i)\\right)$, optionally $+\\,\\lambda\\|\\mathbf{w}\\|^2$. What you would *like* to minimize is the true risk $\\mathbb{E}_{(\\mathbf{x},y)\\sim P}\\left[\\ell\\right]$, and you cannot, because $P$ is unknown — the training average is a sample estimate of it, and the gap between the two is exactly what [[generalization]] measures.',
    teachesAt: 'ch04-building-blocks',
    see: ['loss-function', 'optimization-routine', 'regularization'],
  },
  {
    id: 'optimization-routine',
    term: 'optimization routine',
    simple:
      'The search procedure. It is handed a score to make small and a set of dials to turn, and its entire job is to find the dial settings that give the lowest score.',
    technical:
      'The third building block, and the only one that is not about the problem — it is about the search. Algebra where a [[closed-form-solution]] exists, [[gradient-descent]] wherever the criterion is [[differentiable]], quadratic programming for the SVM, greedy recursion for a [[decision-tree]]. Swapping the routine never changes what "best" means; it changes how fast you reach it, and whether you reach it at all.',
    math:
      'Every routine attacks $\\theta^\\star = \\arg\\min_\\theta J(\\theta)$. First-order methods use only $\\nabla J$ and cost about $O(ND)$ per step. Second-order methods (Newton, L-BFGS) also use the curvature $\\nabla^2 J$ and reach the optimum in far fewer steps, but storing a $D \\times D$ Hessian costs $O(D^2)$ — which is why anything with $D$ in the millions is trained first-order and always will be.',
    teachesAt: 'ch04-building-blocks',
    see: ['gradient-descent', 'closed-form-solution', 'differentiable'],
  },
  {
    id: 'squared-loss',
    term: 'squared loss',
    simple:
      'Take how far off the prediction was and square it. Missing by four is sixteen times worse than missing by one, and overshooting counts exactly the same as falling short.',
    technical:
      'The per-example penalty behind linear regression; averaged over the training set it becomes [[mean-squared-error]]. Squaring buys a smooth, [[convex]] criterion, which is what makes both the closed form and [[gradient-descent]] work. It costs robustness: a single example missed by 10 contributes as much as a hundred examples missed by 1, so one mislabelled target can visibly drag the fitted line. Absolute error is the robust alternative, at the price of a kink at zero.',
    math:
      '$\\ell = \\left(y_i - f(\\mathbf{x}_i)\\right)^2$, with $\\partial\\ell/\\partial f = -2\\left(y_i - f(\\mathbf{x}_i)\\right)$ — the gradient is *proportional to the residual*, so a badly missed example pulls proportionally harder on the parameters. Under a Gaussian-noise assumption, minimizing it is exactly [[maximum-likelihood]] estimation, which is where its statistical licence comes from.',
    statquest: 'sum of squared residuals',
    teachesAt: 'ch04-building-blocks',
    see: ['mean-squared-error', 'loss-function', 'convex'],
  },
  {
    id: 'differentiable',
    term: 'differentiable',
    simple:
      'A function you can ask "which way is downhill from here?" at any point and get a straight answer from. A smooth hillside qualifies. A staircase does not — on each step the ground is dead flat, and at the edge it is a cliff.',
    technical:
      'The precondition for [[gradient-descent]], and the reason machine learning optimizes something other than what it cares about. Counting mistakes is the natural objective, but that count is a staircase: flat almost everywhere, so its gradient is zero and carries no hint of which direction helps. Surrogate losses — [[squared-loss]], log loss, [[hinge-loss]] — exist to be differentiable stand-ins for it. Almost-differentiable is enough in practice: hinge loss and [[relu]] each have exactly one kink, and a subgradient there works fine.',
    math:
      '$f$ is differentiable at $x$ when $\\lim_{h\\to 0}\\frac{f(x+h)-f(x)}{h}$ exists. With many parameters you need every [[partial-derivative|partial derivative]], and they assemble into the [[gradient]] $\\nabla f$. The 0–1 loss $\\mathbb{1}\\!\\left[y \\ne \\operatorname{sign} f\\right]$ has $\\nabla f = \\mathbf{0}$ everywhere it is defined and no derivative at all at the jump — nothing whatsoever to descend.',
    teachesAt: 'ch04-building-blocks',
    see: ['derivative', 'gradient', 'gradient-descent'],
  },
  {
    id: 'convex',
    term: 'convex',
    simple:
      'Bowl-shaped. Wherever you drop a marble it rolls to the same lowest point, so there is no such thing as getting stuck in the wrong dip and no reward for a clever starting position. A mountain range full of separate valleys is the opposite.',
    technical:
      'On a convex criterion every [[local-minimum]] is the [[global-minimum]], so the answer does not depend on where descent started or on the random seed — run it twice, get the same model. Linear regression, logistic regression and the SVM are all convex. A neural network is not, and the reason is almost embarrassingly simple: swap two hidden units and you get a different parameter vector with identical loss, and a function with two distinct equally-good minima cannot be convex. The practical consequence is what tuning means. On a convex problem you tune the [[learning-rate]] and little else; on a non-convex one, initialization, example ordering and noise all quietly become part of the model.',
    math:
      '$f$ is convex when $f\\!\\left(\\lambda a + (1-\\lambda)b\\right) \\le \\lambda f(a) + (1-\\lambda)f(b)$ for every $\\lambda \\in [0,1]$ — the chord never dips below the curve. For twice-differentiable $f$ the test is that the Hessian $\\nabla^2 f$ is positive semidefinite everywhere, or in one dimension $f\'\' \\ge 0$. Mean squared error passes because its Hessian is $\\frac{2}{N}\\mathbf{X}^\\top\\mathbf{X}$, a Gram matrix, and Gram matrices have no negative eigenvalues.',
    teachesAt: 'ch04-building-blocks',
    see: ['local-minimum', 'global-minimum', 'gradient-descent'],
  },
  {
    id: 'gradient-descent',
    term: 'gradient descent',
    simple:
      'Thick fog on a hillside, and you want the bottom of the valley. You cannot see it, but you can feel which way the ground tilts under your feet — so take a short step that way, feel again, and repeat. That is the whole algorithm, and it is how very nearly everything in modern machine learning is trained.',
    technical:
      'An iterative [[optimization-routine]] for any [[differentiable]] criterion. Each step evaluates the [[gradient]] — the vector of [[partial-derivative|partial derivatives]], which points in the direction of steepest *increase* — and moves against it, scaled by the [[learning-rate]]. It needs no algebra specific to the model, which is exactly why the same routine fits a two-parameter line and a two-billion-parameter network. What it returns is a [[local-minimum]]; on a [[convex]] criterion that happens to be the global one. It is not a machine learning algorithm — it is a general-purpose minimiser that machine learning uses constantly.',
    math:
      '$\\theta \\leftarrow \\theta - \\alpha\\,\\nabla J(\\theta)$, applied to every parameter in the same breath. The step is *proportional to the slope*, so the walk decelerates by itself as the ground flattens near a minimum — nothing programs that in. For an $L$-smooth [[convex]] $J$ and $\\alpha \\le 1/L$ the gap closes as $J(\\theta_t) - J^\\star = O(1/t)$: dependable, and painfully slow near the bottom, which is the gap the [[momentum]] family was built to close.',
    statquest: 'gradient descent',
    teachesAt: 'ch04-gradient-descent',
    see: ['learning-rate', 'epoch', 'convergence', 'stochastic-gradient-descent', 'gradient'],
  },
  {
    id: 'learning-rate',
    term: 'learning rate (α)',
    simple:
      'The length of your stride. Too short and you spend all day inching down the hill. Too long and you stride clean over the valley floor and land partway up the far side — then stride back over it, landing higher still.',
    technical:
      'Why overshoot compounds instead of correcting itself: the step is proportional to the slope, and on a bowl the far wall is *steeper* than where you started if you crossed the bottom. So the next step is longer, the one after longer again, and the loss climbs geometrically — [[divergence]]. Below the critical value the same feedback runs in your favour, steps shrinking as the ground flattens. No universal safe value exists, because the critical rate depends on the curvature of *your* criterion, which is why sweeping α over a log grid is the first thing anyone does with an unfamiliar model and why practitioners decay it as training proceeds.',
    math:
      'On a quadratic $J(w) = \\tfrac{c}{2}(w - w^\\star)^2$ the update gives $w_{t+1} - w^\\star = (1 - \\alpha c)(w_t - w^\\star)$: the distance to the optimum is multiplied by $|1 - \\alpha c|$ every step. It shrinks for $0 < \\alpha < 2/c$, lands exactly on the answer in one step at $\\alpha = 1/c$, oscillates while still converging between $1/c$ and $2/c$, and *grows* the instant $\\alpha > 2/c$. With many parameters $c$ becomes the largest eigenvalue of the Hessian, so the safe rate is dictated by the steepest direction while progress is dictated by the shallowest — the ratio between them is the condition number, and it is the reason [[adam]] exists.',
    statquest: 'gradient descent learning rate',
    teachesAt: 'ch04-gradient-descent',
    see: ['gradient-descent', 'divergence', 'convergence', 'adam'],
  },
  {
    id: 'convergence',
    term: 'convergence',
    simple:
      'The point where further work stops paying. Each pass changes the numbers less than the pass before it, until the changes are too small to matter and you stop.',
    technical:
      'Not a mathematical event but a stopping rule you choose: the parameters move less than a tolerance, the criterion improves by less than ε, the validation score stops improving ([[early-stopping]]), or a fixed [[epoch]] budget runs out. Under [[stochastic-gradient-descent|SGD]] the loss never truly settles — it rattles around a floor set by the gradient noise — so "converged" there means the running average has flattened, and decaying the [[learning-rate]] is what shrinks the rattle.',
    math:
      'The usual tests are $\\|\\theta_{t+1} - \\theta_t\\| < \\varepsilon$ or $\\|\\nabla J(\\theta_t)\\| < \\varepsilon$. On a convex quadratic, full-batch descent converges *linearly* — the error falls by a constant factor each step, so accuracy $\\varepsilon$ costs $O(\\log(1/\\varepsilon))$ steps. SGD with a fixed $\\alpha$ converges only into a ball of radius $O(\\alpha\\sigma^2)$ around the optimum; the Robbins–Monro conditions $\\sum_t \\alpha_t = \\infty$ and $\\sum_t \\alpha_t^2 < \\infty$ are what shrink that ball to a point.',
    teachesAt: 'ch04-gradient-descent',
    see: ['gradient-descent', 'learning-rate', 'early-stopping'],
  },
  {
    id: 'divergence',
    term: 'divergence',
    simple:
      'Training running backwards. The score you are trying to shrink gets bigger every pass, the numbers grow, and within a few dozen steps they are astronomically large or no longer numbers at all.',
    technical:
      'Nearly always a [[learning-rate]] set above the stability threshold: the step overshoots, lands somewhere steeper, and the next step is bigger still. In a training log the signature is a loss that rises monotonically and then turns into `inf` or `NaN` the moment a float overflows. Unscaled features are the common hidden cause — one feature measured in millions makes the criterion enormously steep along that axis, so an α that is comfortable for every other parameter is fatal for that one. The two standard cures are [[standardization|rescaling the features]] and clipping the gradient to a fixed norm.',
    math:
      'With $J(w) = \\tfrac{c}{2}(w - w^\\star)^2$ the distance to the optimum is multiplied by $|1 - \\alpha c|$ per step, so $\\alpha > 2/c$ makes that factor exceed 1 and the error grows as $|1-\\alpha c|^t$. Take $c = 1$ and $\\alpha = 3$: the factor is $2$, the distance doubles every single step, and forty steps turn an error of $1$ into roughly $10^{12}$.',
    teachesAt: 'ch04-gradient-descent',
    see: ['learning-rate', 'convergence', 'standardization'],
  },
  {
    id: 'epoch',
    term: 'epoch',
    simple:
      'One complete look at every training example. Learning is not a single reading of the textbook but many, and an epoch is one reading from cover to cover.',
    technical:
      'The unit training runs are measured in, because it is the only unit that means the same thing across batch sizes. Full-batch descent makes one parameter update per epoch. [[stochastic-gradient-descent|SGD]] with batches of 32 over 50,000 examples makes 1,563 of them — the same data seen, three orders of magnitude more updates, which is precisely why minibatch training reaches a given loss sooner in wall-clock time even though each individual step is worse. Reshuffling between epochs matters more than it sounds: leave the order fixed and the model can learn the order.',
    math:
      'With $N$ examples and batch size $B$, one epoch is $\\lceil N/B \\rceil$ updates and exactly $N$ gradient evaluations, whatever $B$ is. So the data cost per epoch is constant in $B$ while the number of steps is $O(N/B)$: shrinking the batch buys steps for free, and pays for them only in noise, each step’s gradient having variance $O(\\sigma^2/B)$ rather than $O(\\sigma^2/N)$.',
    teachesAt: 'ch04-gradient-descent',
    see: ['stochastic-gradient-descent', 'minibatch', 'gradient-descent'],
  },
  {
    id: 'stochastic-gradient-descent',
    term: 'stochastic gradient descent',
    simple:
      'Instead of consulting the entire dataset before every step, glance at a handful of examples and step straight away. Each step points slightly the wrong way, but you take thousands of them in the time the careful method takes one — and the wobble turns out to be useful in itself.',
    technical:
      'Replaces the exact gradient with an unbiased estimate computed from a random subset. The estimate is correct *on average*, so the walk drifts downhill even though no single step is trustworthy. Three things are bought. The cost of a step stops depending on dataset size, so a million examples are no slower per update than a thousand. Training becomes possible on data that never fits in memory, since only the [[minibatch]] does. And the noise itself acts as a mild [[regularization|regulariser]], jostling the parameters out of sharp, brittle minima. What it costs is a jagged loss curve that never fully settles — see [[convergence]].',
    math:
      'The true gradient is $\\nabla J = \\frac{1}{N}\\sum_{i=1}^{N}\\nabla\\ell_i$; the batch estimate $\\hat{g} = \\frac{1}{B}\\sum_{i \\in \\mathcal{B}}\\nabla\\ell_i$ satisfies $\\mathbb{E}[\\hat g] = \\nabla J$ with variance $\\sigma^2/B$. Noise therefore falls as $\\sigma/\\sqrt{B}$: halving it costs four times the batch, which is the diminishing return that keeps everyday batch sizes in the tens and hundreds rather than the millions.',
    statquest: 'stochastic gradient descent',
    teachesAt: 'ch04-gradient-descent',
    see: ['minibatch', 'epoch', 'gradient-descent', 'adam'],
  },
  {
    id: 'minibatch',
    term: 'minibatch',
    simple:
      'The small handful of examples used for one step. Not a single example, which is too jumpy, and not all of them, which is too slow — a few dozen, which is cheap and steady enough at once.',
    technical:
      'A [[hyperparameter]] with the unusual property that hardware sets it more than statistics do. A GPU multiplies a 32-row matrix nearly as fast as a 1-row one, so tiny batches waste the machine outright, while batches past the memory limit are impossible. Larger batches give smoother gradients and so tolerate a larger [[learning-rate]] — scaling α with the batch is the standard heuristic — but past a point they buy precision nobody needs and throw away the [[regularization|regularizing]] noise. Powers of two are conventional and matter far less than people assume.',
    math:
      '$B = 1$ is pure stochastic descent, $B = N$ is full-batch [[gradient-descent]], and everything between is minibatch. Gradient noise scales as $\\sigma/\\sqrt{B}$, so moving from $B = 32$ to $B = 1024$ — thirty-two times the compute per step — cuts the noise by only $\\sqrt{32} \\approx 5.7$. Per epoch you always pay $N$ gradient evaluations and receive $\\lceil N/B \\rceil$ updates.',
    teachesAt: 'ch04-gradient-descent',
    see: ['stochastic-gradient-descent', 'epoch', 'learning-rate'],
  },
  {
    id: 'momentum',
    term: 'momentum',
    simple:
      'Give the walker some weight. Rather than stepping purely by the slope underfoot, keep part of the previous step’s velocity — so a direction you keep being pushed in builds up speed, and a direction that keeps flipping cancels itself out.',
    technical:
      'Invented for the narrow-ravine problem. In a valley that is steep across and shallow along, plain [[gradient-descent]] zig-zags between the walls and creeps along the floor. Momentum fixes it because the across-direction gradient reverses on every step and so cancels in the running average, while the along-direction gradient always points the same way and accumulates. You get a much larger effective step in the useful direction without raising α past the point where the steep direction [[divergence|diverges]]. Nesterov’s variant evaluates the gradient at where the momentum is about to put you rather than where you are, which takes some of the overshoot out of the far end.',
    math:
      '$v \\leftarrow \\beta v + \\nabla J(\\theta)$, then $\\theta \\leftarrow \\theta - \\alpha v$, with $\\beta$ almost always $0.9$. Since $v$ is a geometric sum, a persistent gradient $g$ settles at $v = g/(1-\\beta)$ — an effective step ten times larger at $\\beta = 0.9$. The dynamics are literally those of a heavy ball rolling under friction $1 - \\beta$, which is where the name comes from.',
    teachesAt: 'ch04-gradient-descent',
    see: ['gradient-descent', 'adam', 'rmsprop'],
  },
  {
    id: 'adagrad',
    term: 'Adagrad',
    simple:
      'Give every dial its own stride length, and shorten a dial’s stride a little each time it moves. Dials that keep getting shoved hard settle down; dials that are rarely touched keep a long stride and can still travel when their turn comes.',
    technical:
      'The fix for parameters whose gradients differ wildly in size or frequency. In a bag-of-words model the weight for a common word receives a gradient on nearly every example while the weight for a rare word receives one a handful of times — a single global [[learning-rate]] is far too large for the first and far too small for the second. Adagrad divides each parameter’s step by the square root of the sum of all its past squared gradients. The flaw is in the word *sum*: it only ever grows, so the effective rate decays monotonically toward zero and long runs grind to a halt whether or not the problem called for it. [[rmsprop]] is the one-line repair.',
    math:
      'Accumulate $G_j \\leftarrow G_j + \\left(\\partial J/\\partial\\theta_j\\right)^2$, then step $\\theta_j \\leftarrow \\theta_j - \\frac{\\alpha}{\\sqrt{G_j} + \\epsilon}\\,\\partial J/\\partial\\theta_j$, where $\\epsilon \\approx 10^{-8}$ exists only to stop a division by zero. Because $G_j$ sums over all $t$ steps, the effective rate for a parameter with a steady gradient falls like $O(1/\\sqrt{t})$ — a schedule nobody chose and nobody can switch off.',
    teachesAt: 'ch04-gradient-descent',
    see: ['rmsprop', 'adam', 'learning-rate'],
  },
  {
    id: 'rmsprop',
    term: 'RMSProp',
    simple:
      'Adagrad with a short memory. Instead of adding up every gradient it has ever seen, it keeps a running average that forgets the distant past — so a stride that has grown short can lengthen again when the ground changes.',
    technical:
      'One change to [[adagrad]]: replace the ever-growing sum with an exponentially decaying average of the squared gradients. The per-parameter scaling survives, the terminal slowdown does not. This matters most on non-convex problems, where the curvature the optimiser faces at epoch 50 has nothing to do with what it faced at epoch 1 and a decision made early should not still be binding. Hinton proposed it on a lecture slide and never published it formally, which did not stop it being the default for recurrent networks for years.',
    math:
      '$s_j \\leftarrow \\rho s_j + (1-\\rho)\\left(\\partial J/\\partial\\theta_j\\right)^2$ with $\\rho \\approx 0.9$, then $\\theta_j \\leftarrow \\theta_j - \\frac{\\alpha}{\\sqrt{s_j} + \\epsilon}\\,\\partial J/\\partial\\theta_j$. Since $s_j$ estimates the recent mean square of that gradient, a steady gradient gives $(\\partial J/\\partial\\theta_j)/\\sqrt{s_j} \\approx \\pm 1$: the update keeps the *sign* and throws the magnitude away, which is what makes the step size predictable.',
    teachesAt: 'ch04-gradient-descent',
    see: ['adagrad', 'adam', 'momentum'],
  },
  {
    id: 'adam',
    term: 'Adam',
    simple:
      'The default. It bolts together the two good ideas — keep some of the direction you were already going in, and give every dial its own stride length — so it works acceptably on most problems with nobody tuning anything. That, rather than any proven superiority, is why almost everyone reaches for it first.',
    technical:
      'Adaptive Moment Estimation: a running average of the gradient ([[momentum]], the first moment) divided by a running average of its square ([[rmsprop]], the second moment). That division makes the step roughly scale-free — multiply your loss by a thousand and the steps barely move — which is why one α works across wildly different architectures and why it needs so little tuning. It also bias-corrects both averages, which only matters in the first few dozen steps, while they still remember having been initialized to zero. It is not trouble-free: on some problems a well-scheduled plain [[stochastic-gradient-descent|SGD]] generalizes better, and the interaction with weight decay was wrong for long enough to need its own correction, AdamW.',
    math:
      '$m \\leftarrow \\beta_1 m + (1-\\beta_1) g$ and $v \\leftarrow \\beta_2 v + (1-\\beta_2) g^2$ with $\\beta_1 = 0.9$, $\\beta_2 = 0.999$; de-bias with $\\hat m = m/(1-\\beta_1^t)$ and $\\hat v = v/(1-\\beta_2^t)$; then $\\theta \\leftarrow \\theta - \\alpha\\,\\hat m/(\\sqrt{\\hat v} + \\epsilon)$. When the gradient is steady $\\hat m/\\sqrt{\\hat v} \\approx \\pm 1$, so the step is bounded by roughly $\\alpha$ in every coordinate — which is why $\\alpha = 10^{-3}$ is a sane default no matter what units the loss is measured in.',
    teachesAt: 'ch04-gradient-descent',
    see: ['momentum', 'rmsprop', 'stochastic-gradient-descent', 'learning-rate'],
  },
  {
    id: 'scikit-learn',
    term: 'scikit-learn',
    simple:
      'The library most people actually use. It packs the classic algorithms behind two commands — fit, then predict — so trying a different model is a one-word edit rather than a rewrite.',
    technical:
      'Python and C, open source, and built around one uniform estimator interface: every model exposes `fit` and `predict`, most add `predict_proba` or `score`. That uniformity is the real product — it is what lets `Pipeline`, `GridSearchCV` and [[cross-validation]] operate on an estimator without knowing anything about what it is. Its scope is deliberately bounded: classical algorithms on data that fits in memory. GPUs and deep networks are somebody else’s problem, which is why PyTorch and TensorFlow live alongside it rather than inside it.',
    math:
      'The interface fixes the data layout before it fixes anything else: `fit(X, y)` wants `X` as an $N \\times D$ array — one row per example, one column per feature, column $j$ meaning the same thing in every row — and `y` of length $N$. The costs you pay are the algorithm’s, not the library’s: `LinearRegression` solves the normal equations in about $O(ND^2 + D^3)$, while `SVC` sits between $O(N^2 D)$ and $O(N^3 D)$, which is why the documentation quietly steers you toward `LinearSVC` past a few tens of thousands of rows.',
    teachesAt: 'ch04-engineers-and-particularities',
    see: ['hyperparameter', 'cross-validation'],
  },
];

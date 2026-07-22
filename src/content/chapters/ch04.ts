import type { Chapter } from '../schema';

/** Chapter 4 — Anatomy of a Learning Algorithm (book pp. 36–43), paraphrased in original words. */
export const ch04: Chapter = {
  id: 'ch04',
  number: 4,
  title: 'Anatomy of a Learning Algorithm',
  subtitle: 'Loss, optimization, and gradient descent',
  pdfPages: [36, 43],
  badgeId: 'ch04',
  sections: [
    {
      id: 'ch04-building-blocks',
      title: 'Three Building Blocks',
      minutes: 7,
      blocks: [
        {
          type: 'p',
          md:
            'Strip the paint off any supervised learning algorithm you have met so far and the same skeleton appears. Every one of them is assembled from **three building blocks**:',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'a **[[loss-function|loss function]]** — a per-example penalty measuring how badly the model missed on one training pair;',
            'an **[[optimization-criterion|optimization criterion]]** built from that loss — typically a *cost function* such as the average loss over the whole training set;',
            'an **[[optimization-routine|optimization routine]]** that uses the training data to find the parameter values that optimize the criterion.',
          ],
        },
        {
          type: 'p',
          md:
            'Concretely: [linear regression](sec:ch03-linear-regression) uses the **[[squared-loss|squared loss]]** $(y_i - (wx_i + b))^2$; averaging it over all $N$ examples yields the criterion, **mean squared error**, which you can minimize with a closed-form formula *or* iteratively. [Logistic regression](sec:ch03-logistic-regression) maximizes the **likelihood** of the observed labels (equivalently, minimizes negative log-likelihood). [SVM](sec:ch03-svm) charges **[[hinge-loss|hinge loss]]** for landing on the wrong side of the margin.',
        },
        {
          type: 'p',
          md:
            'The distinction between the first block and the second looks like pedantry until you change one without the other. Keep the squared loss and change the criterion — add a penalty on the size of the weights themselves — and you have ridge regression, the [regularization](sec:ch05-regularization) of Chapter 5, from the same loss. Keep the criterion as an average and change the loss, and you swap out what "wrong" means: the square chases the worst-missed examples hardest, while hinge loss stops caring about a point the moment it is comfortably right. Loss and criterion are two dials, not one.',
        },
        {
          type: 'p',
          md:
            'Not every algorithm plays this cleanly. [kNN](sec:ch03-knn) and [decision tree learning](sec:ch03-decision-trees) are old-timers, invented from intuition and experiment: they optimize their criteria only *implicitly*, and the formal criteria were worked out afterwards to explain why they work — science often runs in that order.',
        },
        {
          type: 'p',
          md:
            'Whenever the criterion is **[[differentiable]]**, two workhorse routines dominate modern practice: **[[gradient-descent|gradient descent]]** and its cousin **[[stochastic-gradient-descent|stochastic gradient descent]]**. Gradient descent hunts for a *local* minimum of a function: start at some point, then repeatedly step **proportional to the negative of the [gradient](sec:ch02-derivative-gradient)** at wherever you currently stand.',
        },
        {
          type: 'p',
          md:
            'Differentiability is a heavier constraint than it sounds, and it explains an oddity that trips up every newcomer: **nobody optimizes the thing they actually want**. What you want from a classifier is a low count of mistakes. But a count is a staircase — nudge a weight a hair and the count does not budge, nudge it a hair more and it jumps by one. Flat everywhere it is defined and vertical where it is not: the gradient is either zero or missing, so there is no downhill direction to read off it anywhere. The losses in the list above are therefore **surrogates**, picked because they are smooth stand-ins that fall when the mistake count falls. You minimize squared error or negative log-likelihood because you *can*, and then you measure accuracy — a [different quantity entirely](sec:ch05-metrics) — to find out whether it worked.',
        },
        {
          type: 'hint',
          md:
            'For linear regression, logistic regression and SVM the criterion is **[[convex]]** — one bowl, one minimum, and it is global. Neural networks are not convex, and the reason is almost silly: swap two hidden units and you get a different set of parameters with exactly the same loss, so there are at least two equally deep valleys, and a bowl has only one. In practice a good local minimum is usually enough.',
        },
        {
          type: 'quiz',
          id: 'ch04-q-blocks',
          questions: [
            {
              kind: 'mcq',
              id: 'ch04-q-blocks-1',
              prompt: 'Which three parts make up any supervised learning algorithm?',
              choices: [
                'A loss function, an optimization criterion, and an optimization routine',
                'A training set, a set of hyperparameters, and a stopping rule for training',
                'A decision boundary, a margin around it, and a kernel that reshapes the space',
                'A training set, a validation set, and a test set held back for the end',
              ],
              answer: 0,
              explain:
                'The loss scores one example, the criterion aggregates the loss into a single objective, and the routine (e.g. gradient descent) searches for parameters that optimize it on the training data. The three-way data split and the hyperparameters are things you bring *to* an algorithm; boundaries, margins and kernels belong to one particular family of them.',
            },
            {
              kind: 'match',
              id: 'ch04-q-blocks-2',
              prompt: 'Match each algorithm to the loss it is built on:',
              pairs: [
                ['Linear regression', 'squared error $(y_i - (wx_i + b))^2$'],
                ['SVM', 'hinge loss for margin violations'],
                ['Logistic regression', 'negative log-likelihood of the labels'],
              ],
              explain:
                'Different penalties, same skeleton: pick a loss, aggregate it into a criterion, optimize.',
            },
            {
              kind: 'tf',
              id: 'ch04-q-blocks-3',
              prompt:
                'kNN and decision-tree learning were originally designed around an explicit global optimization criterion.',
              answer: false,
              explain:
                'Both were invented experimentally, based on intuition. They optimize criteria implicitly; the formal criteria came later, to explain why they work.',
            },
            {
              kind: 'mcq',
              id: 'ch04-q-blocks-4',
              prompt: 'Gradient descent can be applied whenever the optimization criterion is…',
              choices: [
                'differentiable — a gradient exists at (almost) every point',
                'convex — a non-convex criterion has no gradient to follow',
                'already close to its minimum, so only small steps are needed',
                'a count of misclassified examples, which descent minimizes directly',
              ],
              answer: 0,
              explain:
                'Differentiability is what matters. [[convex|Convexity]] is a separate property: on non-convex criteria (neural networks) gradient descent still runs — it just promises only a *local* minimum. A count of errors is a step function: its gradient is zero almost everywhere, so there is nothing to descend.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch04-gradient-descent',
      title: 'Gradient Descent',
      minutes: 12,
      blocks: [
        {
          type: 'p',
          md:
            'Time to watch the machinery run. The demo problem: predict a company’s **units sold** from its **radio-ad spendings** (in millions). One feature, so the model is $f(x) = wx + b$ with exactly two parameters to learn. Linear regression has a [closed-form solution](sec:ch03-linear-regression), so gradient descent is not *needed* here — which is precisely why it makes the perfect glass-box demo: you can check every step against an answer you already know. [Logistic regression](sec:ch03-logistic-regression) is where the need becomes real, because setting its gradient to zero produces equations no one can solve algebraically. The criterion is the **[[mean-squared-error|mean squared error]]**:',
        },
        {
          type: 'formula',
          tex: 'l(w, b) = \\frac{1}{N}\\sum_{i=1}^{N} \\big(y_i - (w x_i + b)\\big)^2',
          parts: [
            { tex: 'l(w, b)', label: 'how bad this particular line is' },
            { tex: '=' },
            { tex: '\\frac{1}{N}\\sum_{i=1}^{N}', label: 'averaged over every example' },
            {
              tex: '\\big(y_i - (w x_i + b)\\big)^2',
              label: 'truth minus prediction, squared',
            },
          ],
          terms: [
            {
              tex: 'y_i - (w x_i + b)',
              explain: 'the residual: how far the line’s prediction sits from the true yᵢ',
            },
            {
              tex: '(\\;\\cdot\\;)^2',
              explain:
                'the [[squared-loss|squared loss]]: squaring removes the sign and punishes big misses far more than small ones',
            },
            {
              tex: '\\frac{1}{N}\\sum_{i=1}^{N}',
              explain: 'average over all N training examples — the “mean” in mean squared error',
            },
          ],
        },
        {
          type: 'p',
          md:
            'Gradient descent begins by asking, for each parameter separately: *if I nudge you a little, how does the loss change?* The answers are the **[[partial-derivative|partial derivatives]]** from [Chapter 2](sec:ch02-derivative-gradient). For the squared term you apply the **[[chain-rule|chain rule]]**: differentiate the outer square (giving $2\\times$ the residual), then multiply by the derivative of the residual with respect to the parameter — $-x_i$ for $w$, and $-1$ for $b$.',
        },
        {
          type: 'formula',
          tex: '\\frac{\\partial l}{\\partial w} = \\frac{1}{N}\\sum_{i=1}^{N} -2\\,x_i\\big(y_i - (w x_i + b)\\big)',
          parts: [
            { tex: '\\frac{\\partial l}{\\partial w}', label: 'which way the loss tilts as w moves' },
            { tex: '=' },
            { tex: '\\frac{1}{N}\\sum_{i=1}^{N}', label: 'averaged over the examples' },
            { tex: '-2\\,x_i', label: 'each one pulls in proportion to its x' },
            { tex: '\\big(y_i - (w x_i + b)\\big)', label: 'and to how badly it is missed' },
          ],
          terms: [
            {
              tex: '\\frac{\\partial l}{\\partial w}',
              explain:
                'how fast the loss changes when w alone moves — the slope of the loss bowl in the w direction',
            },
            {
              tex: '-2\\,x_i',
              explain:
                'chain rule at work: 2·residual from the square, times −xᵢ, the derivative of the residual with respect to w',
            },
            {
              tex: 'y_i - (w x_i + b)',
              explain: 'the residual again — examples the line misses badly pull on w the hardest',
            },
          ],
        },
        {
          type: 'formula',
          tex: '\\frac{\\partial l}{\\partial b} = \\frac{1}{N}\\sum_{i=1}^{N} -2\\big(y_i - (w x_i + b)\\big)',
          parts: [
            { tex: '\\frac{\\partial l}{\\partial b}', label: 'which way the loss tilts as b moves' },
            { tex: '=' },
            { tex: '\\frac{1}{N}\\sum_{i=1}^{N}', label: 'averaged over the examples' },
            { tex: '-2', label: 'no x here — b lifts the whole line equally' },
            { tex: '\\big(y_i - (w x_i + b)\\big)', label: 'so only the miss counts' },
          ],
          terms: [
            {
              tex: '\\frac{\\partial l}{\\partial b}',
              explain: 'the slope of the loss in the b direction: nudging b shifts the whole line up or down',
            },
            {
              tex: '-2',
              explain:
                'same chain rule, but the residual’s derivative with respect to b is just −1, so no xᵢ factor appears',
            },
          ],
        },
        {
          type: 'p',
          md:
            'The routine initializes $w \\leftarrow 0$, $b \\leftarrow 0$ and proceeds in **[[epoch|epochs]]**: one epoch uses the *entire* training set to update each parameter once. The size of the update is set by the **[[learning-rate|learning rate]]** $\\alpha$:',
        },
        {
          type: 'formula',
          tex: 'w \\leftarrow w - \\alpha \\frac{\\partial l}{\\partial w}, \\qquad b \\leftarrow b - \\alpha \\frac{\\partial l}{\\partial b}',
          parts: [
            { tex: 'w \\leftarrow w', label: 'move w…' },
            { tex: '-\\;\\alpha', label: '…by a small fraction α…' },
            { tex: '\\frac{\\partial l}{\\partial w}', label: '…of its slope, downhill' },
            {
              tex: ',\\qquad b \\leftarrow b - \\alpha \\frac{\\partial l}{\\partial b}',
              label: 'and b the same way, in the same breath',
            },
          ],
          terms: [
            {
              tex: '\\alpha',
              explain:
                'the [[learning-rate|learning rate]]: scales the step. Too small = a slow crawl over thousands of epochs; too large = overshoot and [[divergence]]',
            },
            {
              tex: '- \\alpha \\frac{\\partial l}{\\partial w}',
              explain:
                'step against the slope: a positive derivative means the loss grows to the right, so move left — and vice versa',
            },
            {
              tex: '\\leftarrow',
              explain: 'assignment: the new value replaces the old one, once per epoch',
            },
          ],
        },
        {
          type: 'p',
          md:
            'Why *subtract*? A derivative is a growth meter. If it is positive, the loss climbs as the parameter increases — so walk the other way. If it is negative, subtracting a negative moves the parameter right, again downhill. Repeat epoch after epoch, recomputing the derivatives with the fresh $w, b$; when the two values barely change any more, gradient descent has **[[convergence|converged]]** and you stop.',
        },
        {
          type: 'p',
          md:
            'The learning rate is a knife’s edge, and it is worth being precise about *why* the wrong side of it is so violent. The step you take is proportional to the slope where you are standing. Inside a bowl, the slope gets steeper the further you are from the bottom. So if a step carries you past the bottom and further up the opposite wall than you began, the ground there is steeper — and the **next** step, being proportional to that steeper slope, is longer still. Each epoch amplifies the last. The parameters do not wander off; they are catapulted, and the loss grows geometrically until a floating-point number gives up. That is **[[divergence]]** — you will manufacture it yourself in the widget below.',
        },
        {
          type: 'p',
          md:
            'Numbers make the edge visible. Take the simplest possible bowl, $l(w) = (w - 3)^2$, whose derivative is $2(w - 3)$. One update leaves the distance from the answer multiplied by exactly $|1 - 2\\alpha|$, every time. At $\\alpha = 0.1$ that factor is $0.8$: start at $w = 0$, three units out, and after ten epochs you are $0.32$ out — steady, unspectacular. At $\\alpha = 0.5$ the factor is $0$ and the very first step lands on $w = 3$ exactly. At $\\alpha = 1$ the factor is exactly $1$ and the parameter bounces between $0$ and $6$ for ever, making no progress and doing no harm. At $\\alpha = 1.1$ the factor is $1.2$, so the distance *grows* a fifth every epoch: three units out becomes eighteen after ten epochs, and roughly a hundred and seventy thousand after sixty. Nothing about the problem changed across those four runs — only the stride.',
        },
        {
          type: 'p',
          md:
            'The lesson generalizes past that toy bowl. The safe range for $\\alpha$ is set by the **curvature** of your criterion — how fast the slope itself changes — and you do not know that number in advance for any interesting model. Which is why nobody guesses α to three decimal places: they try $0.1$, $0.01$, $0.001$, watch the first few epochs, and keep whichever one goes down fastest without going up.',
        },
        {
          type: 'hint',
          md:
            'The nastiest version of this failure has nothing to do with α being obviously silly. Give one feature values in the millions and another values in the hundredths, and the criterion becomes a canyon: violently steep along one axis, nearly flat along the other. A single α has to serve both, so it is either too large for the steep axis (divergence) or too small for the flat one (a crawl). [Rescaling the features](sec:ch05-feature-engineering) before training is not cosmetic tidying — it is what makes a single learning rate possible at all.',
        },
        {
          type: 'code',
          lang: 'python',
          code: `def gd_epoch(x, y, w, b, alpha):
    """One epoch: a full sweep over the data, then one update of w and b."""
    n = len(x)
    grad_w, grad_b = 0.0, 0.0
    for xi, yi in zip(x, y):
        miss = yi - (w * xi + b)      # residual: how far off the line is
        grad_w += -2 * xi * miss / n  # accumulate dl/dw
        grad_b += -2 * miss / n       # accumulate dl/db
    return w - alpha * grad_w, b - alpha * grad_b

spendings = [8.2, 14.5, 21.3, 30.9, 42.0]  # radio ads, millions
sales     = [6.1, 9.0, 11.2, 15.8, 19.4]   # units sold
w, b = 0.0, 0.0
for epoch in range(150):
    w, b = gd_epoch(spendings, sales, w, b, alpha=0.001)`,
          caption:
            'One full-batch epoch of gradient descent for f(x) = wx + b. Loop it and (w, b) drift downhill; print the loss every few epochs and you will watch it shrink — the classic epoch-by-epoch training log.',
        },
        {
          type: 'widget',
          id: 'DescentStepper',
          challenge: {
            id: 'ch04-challenge-descent',
            label: 'converge in under 30 epochs without diverging',
            xp: 15,
          },
        },
        {
          type: 'p',
          md:
            'Plain gradient descent touches every example before it moves a muscle. On five data points that is nothing; on five hundred thousand it means half a million residuals computed for one update of two numbers. **Minibatch [[stochastic-gradient-descent|stochastic gradient descent]] (SGD)** breaks the deadlock by estimating the gradient from a small random handful — a **[[minibatch|batch]]** — and stepping immediately.',
        },
        {
          type: 'p',
          md:
            'Put numbers on it. With $N = 50{,}000$ examples, one epoch costs $50{,}000$ gradient evaluations *whichever* method you use — that is what an epoch means. What differs is how many steps you get for the money. Full batch: **one** update. Batches of 32: **1,563** updates. One example at a time: **50,000**. Same data read, same arithmetic done, three orders of magnitude more chances to improve — and the first useful move happens after 32 examples rather than after all fifty thousand.',
        },
        {
          type: 'p',
          md:
            'What you give up is exactness: a gradient measured on 32 examples points in roughly the right direction, not the right one, so the loss curve comes out jagged rather than smooth. Two things make that a good bargain. The error shrinks as the square root of the batch size, so a batch of 32 is already about six times steadier than a single example while costing a fraction of the full sweep. And the leftover noise is not purely a tax — it jostles the parameters, which helps a non-convex criterion shake free of narrow crevices and behaves, in practice, a little like [regularization](sec:ch05-overfitting).',
        },
        {
          type: 'p',
          md:
            'SGD then acquired a family of upgrades, each invented to fix one specific way plain descent wastes time:',
        },
        {
          type: 'list',
          items: [
            '**[[momentum|Momentum]]** gives the walker weight. It keeps a fraction of the previous step and adds the new gradient to it, so a direction you are pushed in repeatedly builds up speed while a direction that keeps reversing cancels itself out. The problem it solves is the *ravine*: a valley steep across and shallow along, where plain descent bounces off the walls and barely advances along the floor.',
            '**[[adagrad|Adagrad]]** gives every parameter its own α, shrinking it in proportion to how much that parameter has already been pushed. It was built for gradients of wildly different sizes — the weight on a common word gets a gradient from nearly every example, the weight on a rare word from a handful, and no single α suits both. Its flaw is that the shrinking never stops, so long runs slowly seize up.',
            '**[[rmsprop|RMSProp]]** is Adagrad with a short memory: a decaying average of recent squared gradients instead of a running total of all of them. The per-parameter scaling survives; the seizing up does not. That matters on non-convex problems, where the terrain at epoch 50 has nothing to do with the terrain at epoch 1.',
            '**[[adam|Adam]]** combines the two — momentum for the direction, RMSProp for the per-parameter stride. The division by the gradient’s own scale makes it nearly indifferent to what units your loss is measured in, which is why one default setting works across wildly different models and why it is what most people reach for without thinking.',
          ],
        },
        {
          type: 'p',
          md:
            'One thing to keep straight: none of these are machine learning algorithms. They are generic *minimizers* for any function that has a gradient — the same Adam that trains a language model will happily fit a curve to your electricity bill.',
        },
        {
          type: 'quiz',
          id: 'ch04-q-descent',
          questions: [
            {
              kind: 'numeric',
              id: 'ch04-q-descent-1',
              prompt:
                'Current $w = 0.5$, learning rate $\\alpha = 0.1$, and $\\frac{\\partial l}{\\partial w} = 2.0$. After one update $w \\leftarrow w - \\alpha\\frac{\\partial l}{\\partial w}$, what is $w$?',
              answer: 0.3,
              tolerance: 0.001,
              explain: '$w = 0.5 - 0.1 \\cdot 2.0 = 0.3$. The positive derivative said “loss grows to the right”, so $w$ moved left.',
            },
            {
              kind: 'mcq',
              id: 'ch04-q-descent-2',
              prompt: 'One **epoch** of full-batch gradient descent means:',
              choices: [
                'one complete pass over the training set, ending in one update per parameter',
                'one update of the parameters computed from a single randomly drawn training example',
                'the moment the parameters stop changing and the loss reaches its minimum',
                'one full pass over the validation set to measure the loss after training',
              ],
              answer: 0,
              explain:
                'Epoch = the whole training set used once, then one update of each parameter. A single-example update is the *stochastic* variant’s move. Convergence is what many epochs eventually produce, not what one epoch means, and epochs are counted over the training set — the validation set is never touched during training.',
            },
            {
              kind: 'tf',
              id: 'ch04-q-descent-3',
              prompt: 'Increasing the learning rate $\\alpha$ always makes gradient descent converge faster.',
              answer: false,
              explain:
                'Only up to a point. Past it each step overshoots the minimum and lands somewhere steeper, so the next step is longer still: the loss grows every epoch and the parameters run off to infinity. On the bowl $l(w) = (w-3)^2$ that point is exactly $\\alpha = 1$.',
            },
            {
              kind: 'mcq',
              id: 'ch04-q-descent-4',
              prompt: 'Why does the update rule *subtract* the partial derivative?',
              choices: [
                'The derivative points toward growth, and we want the loss to shrink',
                'The learning rate $\\alpha$ is defined to be negative, so subtracting adds the step',
                'Subtracting keeps every parameter positive, which the model requires',
                'The squared loss is always negative, so subtracting moves it up toward zero',
              ],
              answer: 0,
              explain:
                'A derivative is a growth indicator. Stepping against it — downhill — is the entire idea of gradient *descent*. $\\alpha$ is a positive step size; parameters are free to go negative; and a squared loss is never negative to begin with.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch04-engineers-and-particularities',
      title: 'Engineers, Libraries, and Particularities',
      minutes: 7,
      blocks: [
        {
          type: 'p',
          md:
            'Here is a working secret: unless you are a research scientist at a deep-pocketed lab, you **almost never implement learning algorithms yourself** — and you don’t hand-roll gradient descent either. You use **libraries**: open-source collections of algorithms engineered for stability and efficiency. The most used one is **[[scikit-learn]]**, written in Python and C. Training linear regression there is one real line, `model = LinearRegression().fit(x, y)`, and predicting is another, `model.predict(x_new)`.',
        },
        {
          type: 'hint',
          md:
            '"Engineered for stability" sounds like marketing until you write the naïve version. Compute a logistic model’s log-likelihood the obvious way and the moment the model is confident about an example, $\\sigma(z)$ rounds to exactly $1$, so $\\log(1 - \\sigma(z))$ becomes $\\log 0 = -\\infty$ and the whole sum is ruined; the library rearranges the algebra so that never happens. Solve linear regression by literally inverting $\\mathbf{X}^\\top\\mathbf{X}$ and two correlated features will hand you nonsense; the library factorizes instead. Your version and theirs implement the same equations. Theirs survives real data.',
        },
        {
          type: 'p',
          md:
            'The real magic is uniformity: swap `LinearRegression` for another regressor and *nothing else changes*. The same goes for classification — replace `LogisticRegression` with `SVC` (scikit-learn’s name for SVM), `DecisionTreeClassifier`, or `NearestNeighbors`, and the surrounding pipeline stays put.',
        },
        {
          type: 'p',
          md:
            'What the library will *not* forgive is malformed input. Most algorithms — SVM, linear and logistic regression, kNN with Euclidean or cosine metrics — require **numerical** features, and every example must be a vector of the **same fixed length**, where position $j$ means the same thing for every example. Decision trees are the easygoing exception: a categorical feature like color = red/yellow/green can stay as it is. (How to turn categories into numbers is [a Chapter 5 story](sec:ch05-feature-engineering).)',
        },
        {
          type: 'p',
          md: 'Beyond inputs, algorithms differ in a handful of practical ways worth knowing before you pick one:',
        },
        {
          type: 'list',
          items: [
            '**[[hyperparameter|Hyperparameters]]:** $C$ in SVM, $\\epsilon$ and $d$ in ID3 — and the solvers have their own, like $\\alpha$ in gradient descent.',
            '**Class weighting:** some algorithms (SVM among them) let you make mistakes on a chosen class extra costly — precious when that class is [rare in your training data](sec:ch08-imbalanced).',
            '**Scores vs. classes:** logistic regression and decision trees return a number between 0 and 1 readable as confidence; plain SVM and kNN just name the class. A score is worth more than it looks — it lets you [move the threshold afterwards](sec:ch05-metrics) instead of retraining.',
            '**Batch vs. online:** many algorithms (SVM, decision trees, logistic regression) build the model from the whole dataset and must be retrained from scratch when new data arrives; others — Naïve Bayes, scikit-learn’s `SGDClassifier`/`SGDRegressor` (the [[stochastic-gradient-descent|SGD]] of the previous section, wrapped as an estimator), the `PassiveAggressive` family — can update **incrementally**, one batch at a time.',
            '**One task or both:** decision trees, SVM and kNN handle classification *and* regression; many algorithms solve only one of the two.',
          ],
        },
        {
          type: 'p',
          md:
            'The first bullet deserves more than a bullet. A **parameter** is something training discovers — $w$ and $b$ came out of gradient descent, and you never touched them. A **hyperparameter** is something you decide *before* training starts, and nothing in the training run can tell you whether you decided well, because every one of them can be pushed in the direction that makes the training loss smaller. Set $C$ high enough, let ID3 grow deep enough, and the model will recite the training set back to you perfectly and be worthless on anything new. That is [overfitting](sec:ch05-overfitting), and it is why hyperparameters have to be judged on data the model has never been fitted to. [Chapter 5](sec:ch05-tuning) turns that principle into an actual procedure.',
        },
        {
          type: 'p',
          md:
            'So the everyday loop of an ML engineer looks like this: shape raw data into fixed-length numeric feature vectors, pick a candidate algorithm and hyperparameter values, call `fit`, measure quality on [held-out data](sec:ch05-three-sets), adjust, and repeat — and when fresh labeled examples arrive, either update the model incrementally or retrain, depending on what the algorithm supports. The library’s documentation tells you what problems each algorithm solves, what inputs it accepts, what its model outputs, and which hyperparameters it exposes.',
        },
        {
          type: 'quiz',
          id: 'ch04-q-engineers',
          questions: [
            {
              kind: 'mcq',
              id: 'ch04-q-engineers-1',
              prompt: 'Why do practitioners use libraries like scikit-learn instead of writing algorithms themselves?',
              choices: [
                'Library implementations are engineered for numerical stability and efficiency',
                'A hand-written implementation of a published algorithm cannot be used commercially',
                'Library algorithms reach higher accuracy than the same algorithm written by hand',
                'Optimizers like gradient descent are too intricate to program correctly by hand',
              ],
              answer: 0,
              explain:
                'The algorithms are the same — the library versions are simply battle-tested, fast, and one line away. They do not change the *accuracy* an algorithm can reach on your data, there is no legal barrier to writing your own, and gradient descent is famously a dozen lines of code. Effort, not capability, is the argument.',
            },
            {
              kind: 'multi',
              id: 'ch04-q-engineers-2',
              prompt: 'Which of these can update an existing model incrementally as new labeled data arrives? (pick all that apply)',
              choices: [
                'Naïve Bayes classifiers',
                'scikit-learn’s `SGDClassifier`',
                'a decision tree built with ID3',
                'the `PassiveAggressive` family',
              ],
              answers: [0, 1, 3],
              explain:
                'Those three learn one batch at a time. A plain decision tree (like SVM or logistic regression) is built from the whole dataset and must be rebuilt from scratch.',
            },
            {
              kind: 'tf',
              id: 'ch04-q-engineers-3',
              prompt:
                'Switching from `LogisticRegression` to `SVC` in scikit-learn requires rewriting the whole training pipeline.',
              answer: false,
              explain:
                'Uniform interfaces are the point: swap the estimator, keep `fit` and `predict`, change nothing else.',
            },
            {
              kind: 'mcq',
              id: 'ch04-q-engineers-4',
              prompt: 'A feature “color” takes the values red, yellow, or green. Which algorithm can consume it *as is*?',
              choices: [
                'decision tree learning',
                'SVM with an RBF kernel',
                'linear regression',
                'kNN with Euclidean distance',
              ],
              answer: 0,
              explain:
                'Trees split on categories natively. SVM, linear/logistic regression, and metric-based kNN all require numerical features.',
            },
          ],
        },
      ],
    },
  ],
  bossPool: [
    {
      kind: 'mcq',
      id: 'ch04-boss-1',
      prompt: 'Every supervised learning algorithm is a combination of…',
      choices: [
        'a loss function, an optimization criterion, and a routine that optimizes it',
        'a model architecture, a large dataset, and enough GPU time to converge',
        'a training set, a decision boundary, and a kernel that separates the classes',
        'a hypothesis, an experiment that tests it, and a conclusion drawn from both',
      ],
      answer: 0,
      explain:
        'Loss → criterion → optimization routine: the three building blocks behind every algorithm in the book. Architecture and compute are engineering choices layered on top; boundaries and kernels describe one family; and the scientific method, tempting as the parallel is, is not what the chapter is decomposing.',
    },
    {
      kind: 'match',
      id: 'ch04-boss-2',
      prompt: 'Match the algorithm to its loss:',
      pairs: [
        ['Linear regression', 'squared error'],
        ['SVM', 'hinge loss'],
        ['Logistic regression', 'negative log-likelihood'],
      ],
      explain:
        'Same skeleton, different penalty: squared misses, margin violations, or improbable labels.',
    },
    {
      kind: 'mcq',
      id: 'ch04-boss-3',
      prompt: 'Which pair of algorithms optimizes its criterion only *implicitly*, having been invented experimentally first?',
      choices: [
        'kNN and decision tree learning',
        'linear and logistic regression',
        'SVM and polynomial regression',
        'Naïve Bayes and linear regression',
      ],
      answer: 0,
      explain:
        'Both are among the oldest ML algorithms, born of intuition; their formal optimization criteria were derived later to explain them. Every other pair here was *designed* around an explicit criterion — squared error, likelihood, or the margin.',
    },
    {
      kind: 'tf',
      id: 'ch04-boss-4',
      prompt: 'A cost function such as mean squared error is an example of an optimization criterion built from a per-example loss.',
      answer: true,
      explain: 'The loss scores one example; averaging it over the training set gives the criterion to minimize.',
    },
    {
      kind: 'mcq',
      id: 'ch04-boss-5',
      prompt: 'Gradient descent finds a minimum by…',
      choices: [
        'starting at some point and repeatedly stepping against the local gradient',
        'evaluating every parameter combination on a grid and keeping the best',
        'solving the criterion’s closed-form equation in a single algebraic step',
        'sampling random parameter values until the loss stops improving',
      ],
      answer: 0,
      explain:
        'It is an iterative routine: measure the local slope, step *proportional to the negative of the gradient*, repeat until the parameters settle. Grids and random sampling ignore the slope entirely, and a closed form exists only for a few criteria — which is exactly why a general optimizer is needed.',
    },
    {
      kind: 'tf',
      id: 'ch04-boss-6',
      prompt:
        'For convex criteria — such as those of linear regression, logistic regression and SVM — any minimum gradient descent finds is the global one.',
      answer: true,
      explain:
        'Convex = one bowl. Neural networks are the non-convex case, where a good local minimum usually suffices.',
    },
    {
      kind: 'numeric',
      id: 'ch04-boss-7',
      prompt:
        'Take one gradient-descent update by hand: $w \\leftarrow w - \\alpha\\frac{\\partial l}{\\partial w}$ with $w = 2.0$, $\\alpha = 0.1$, $\\frac{\\partial l}{\\partial w} = 4.0$. What is the new $w$?',
      answer: 1.6,
      tolerance: 0.01,
      explain: '$2.0 - 0.1 \\cdot 4.0 = 1.6$: a positive slope pushes the parameter down the axis.',
    },
    {
      kind: 'numeric',
      id: 'ch04-boss-8',
      prompt:
        'Now the intercept: $b \\leftarrow b - \\alpha\\frac{\\partial l}{\\partial b}$ with $b = 1.0$, $\\alpha = 0.05$, $\\frac{\\partial l}{\\partial b} = -6.0$. New $b$?',
      answer: 1.3,
      tolerance: 0.01,
      explain:
        '$1.0 - 0.05 \\cdot (-6.0) = 1.3$. Subtracting a negative derivative moves the parameter right — still downhill.',
    },
    {
      kind: 'mcq',
      id: 'ch04-boss-9',
      prompt: 'In gradient descent, an **epoch** is…',
      choices: [
        'one use of the entire training set to update each parameter',
        'one update computed from a single randomly selected example',
        'one restart of training from freshly re-initialized parameters',
        'one halving of the learning rate once the loss stops falling',
      ],
      answer: 0,
      explain:
        'Full pass = one epoch; the derivatives are then recomputed with the updated parameters. The single-example update belongs to stochastic gradient descent, and neither re-initialization nor learning-rate schedules are part of what the word *epoch* counts.',
    },
    {
      kind: 'order',
      id: 'ch04-boss-10',
      prompt: 'Order the steps inside one full-batch training epoch for $f(x) = wx + b$:',
      items: [
        'Compute each example’s residual $y_i - (wx_i + b)$ with the current $w, b$',
        'Accumulate the partial derivatives $\\partial l/\\partial w$ and $\\partial l/\\partial b$ over all $N$ examples',
        'Subtract $\\alpha$ times each averaged derivative from its parameter',
        'Record the new loss and begin the next epoch with the updated $w, b$',
      ],
      explain:
        'Residuals → accumulated gradients → the α-scaled update → repeat. When w and b barely change, you stop.',
    },
    {
      kind: 'mcq',
      id: 'ch04-boss-11',
      prompt: 'You crank the learning rate α too high. What do you observe?',
      choices: [
        'The loss grows epoch after epoch and the parameters run off to infinity',
        'The loss drops faster every epoch, since larger steps cover more ground',
        'Training halts at the first epoch because the gradient becomes exactly zero',
        'The parameters oscillate forever between two fixed values, never diverging',
      ],
      answer: 0,
      explain:
        'Each step overshoots the valley and lands *higher* up the opposite wall — divergence, the signature failure of a too-large α. Bigger steps help only up to a point; past it the loss climbs, and nothing about a large α zeroes the gradient or pins the parameters to a stable cycle.',
    },
    {
      kind: 'tf',
      id: 'ch04-boss-12',
      prompt: 'When $w$ and $b$ barely change from one epoch to the next, gradient descent has converged and you can stop.',
      answer: true,
      explain: 'That plateau is the practical stopping rule — often after many epochs at a small α.',
    },
    {
      kind: 'mcq',
      id: 'ch04-boss-13',
      prompt: 'How does minibatch stochastic gradient descent speed up plain gradient descent?',
      choices: [
        'It estimates the gradient from small random subsets of the training data',
        'It uses a much larger learning rate that is guaranteed never to diverge',
        'It updates the parameters only every few epochs instead of every epoch',
        'It swaps the squared loss for a cheaper loss that is faster to compute',
      ],
      answer: 0,
      explain:
        'Small batches give cheap, noisy gradient estimates — a trade of exactness for speed that wins on large datasets. SGD updates *more* often, not less, keeps the same loss function, and enjoys no immunity from divergence: α still has to be chosen with care.',
    },
    {
      kind: 'match',
      id: 'ch04-boss-14',
      prompt: 'Match each SGD upgrade to its trick:',
      pairs: [
        ['Momentum', 'keeps part of the previous step, so a steady direction gathers speed'],
        ['Adagrad', 'scales α per parameter by the sum of its past squared gradients'],
        ['Adam', 'momentum for the direction, per-parameter scaling for the stride'],
      ],
      explain:
        'All three change how the raw gradient becomes a step. RMSProp is Adagrad with a decaying memory instead of a running total, and Adam is what you get by bolting momentum onto RMSProp.',
    },
    {
      kind: 'tf',
      id: 'ch04-boss-15',
      prompt: 'Gradient descent and its variants are themselves machine learning algorithms.',
      answer: false,
      explain:
        'They are general-purpose solvers of minimization problems — they minimize any function that has a gradient, ML criterion or not.',
    },
    {
      kind: 'mcq',
      id: 'ch04-boss-16',
      prompt: 'scikit-learn is…',
      choices: [
        'the most widely used open-source ML library, written in Python and C',
        'a proprietary cloud platform for training and serving neural networks',
        'a visualization toolkit for plotting loss landscapes and decision boundaries',
        'a public repository of pre-labeled datasets for benchmarking models',
      ],
      answer: 0,
      explain:
        'A library = algorithms plus supporting tools, implemented with stability and efficiency in mind — so engineers rarely implement algorithms themselves. It is free and runs locally: no cloud subscription, no dataset catalogue, no plotting layer of its own.',
    },
    {
      kind: 'mcq',
      id: 'ch04-boss-17',
      prompt: 'By the chain rule, $\\frac{\\partial}{\\partial w}\\big(y - (wx + b)\\big)^2$ equals…',
      choices: [
        '$-2x\\big(y - (wx + b)\\big)$',
        '$2\\big(y - (wx + b)\\big)$',
        '$-2\\big(y - (wx + b)\\big)$',
        '$x^2$',
      ],
      answer: 0,
      explain:
        'Outer square gives $2\\cdot$residual; the residual’s derivative with respect to $w$ is $-x$; multiply them.',
    },
    {
      kind: 'mcq',
      id: 'ch04-boss-18',
      prompt: 'Given a feature vector, which model can natively return a score between 0 and 1 interpretable as confidence?',
      choices: [
        'logistic regression',
        'a plain SVM',
        'kNN with a distance metric',
        'none of these models',
      ],
      answer: 0,
      explain:
        'Logistic regression (and decision trees) yield 0–1 scores directly. Plain SVM and kNN name only the class, though scores can be synthesized for them with extra tricks — which is why “none” is wrong too.',
    },
    {
      kind: 'tf',
      id: 'ch04-boss-19',
      prompt: 'Decision tree learning, SVM and kNN can each be used for both classification and regression.',
      answer: true,
      explain:
        'These three swing both ways; many other algorithms solve only one of the two problem types.',
    },
    {
      kind: 'mcq',
      id: 'ch04-boss-20',
      prompt: 'Linear regression has a closed-form solution, yet the book demonstrates gradient descent on it. Why is that a good choice?',
      choices: [
        'Its convex, bowl-shaped criterion makes every descent step easy to see',
        'Gradient descent is the only practical way to fit a regression line',
        'The closed-form solution exists only for classification problems',
        'Gradient descent finds a better line than the closed-form solution',
      ],
      answer: 0,
      explain:
        'A transparent problem is the best stage for demonstrating an optimizer — one bowl, one minimum, and you can check every step against the known exact answer. Gradient descent is *not* needed here, and it cannot beat the closed form; that redundancy is precisely what makes it a safe demo.',
    },
  ],
};

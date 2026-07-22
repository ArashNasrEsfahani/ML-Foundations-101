import type { Concept } from './types';

/**
 * Chapter 2's vocabulary — the maths-anxiety chapter. Every card here is
 * written for a reader who has met the symbol before and bounced off it, so
 * `simple` carries a picture, `technical` says what the symbol is *for*, and
 * `math` does the arithmetic out loud instead of asserting the result.
 */
export const conceptsCh02: Concept[] = [
  {
    id: 'scalar',
    term: 'scalar',
    simple:
      'A single number, on its own. Fifteen, minus three and a quarter, zero. Everything else in the toolbox is built by stacking these into longer arrangements.',
    technical:
      'Written as an italic lower-case letter — $x$, $a$, $\\lambda$ — so it is distinguishable at a glance from a bold [[vector]] or a bold capital [[matrix]]. The distinction is not pedantry: multiplying a vector by a scalar stretches it without turning it, while a [[dot-product]] takes two vectors in and hands a scalar back, and mixing up which object you are holding is how dimension errors happen.',
    math:
      '$x\\in\\mathbb{R}$. Scaling acts entrywise, $c\\mathbf{x} = \\left[cx^{(1)},\\dots,cx^{(D)}\\right]$, so $\\|c\\mathbf{x}\\| = |c|\\,\\|\\mathbf{x}\\|$ — the length scales by $|c|$ and a negative $c$ reverses the arrow without bending it.',
    teachesAt: 'ch02-data-structures',
    see: ['vector', 'matrix', 'dot-product'],
  },
  {
    id: 'vector',
    term: 'vector',
    simple:
      'An ordered list of numbers. Picture it two ways at once: as an arrow pointing away from the origin, and as the point where that arrow lands. Both pictures are the same list, and different corners of machine learning lean on different ones.',
    technical:
      'Bold lower-case: $\\mathbf{x}$, $\\mathbf{w}$. Its entries are indexed by a parenthesized superscript $x^{(j)}$, which leaves a plain superscript free to mean a power. Order is part of the definition — position $j$ must mean the same thing in every vector you compare — and that is the whole reason a [[feature-vector]] is a fixed-length list rather than a bag of facts. Addition and scaling work entrywise; the interesting operation, the [[dot-product]], does not.',
    math:
      '$\\mathbf{x} = \\left[x^{(1)},\\dots,x^{(D)}\\right]\\in\\mathbb{R}^{D}$, with Euclidean length $\\|\\mathbf{x}\\| = \\sqrt{\\sum_{j=1}^{D}\\left(x^{(j)}\\right)^{2}} = \\sqrt{\\mathbf{x}\\mathbf{x}}$. Three lookalikes worth separating: $\\mathbf{x}_i$ is the $i$-th example, $x^{(j)}$ is the $j$-th attribute, and $\\left(x^{(j)}\\right)^{2}$ is that attribute squared.',
    statquest: 'matrix algebra for neural networks',
    teachesAt: 'ch02-data-structures',
    see: ['scalar', 'matrix', 'dot-product', 'feature-vector'],
  },
  {
    id: 'matrix',
    term: 'matrix',
    simple:
      'A rectangular grid of numbers, rows by columns. A whole dataset is one of these: a row for each example, a column for each feature.',
    technical:
      'Bold capital: $\\mathbf{W}$, $\\mathbf{X}$. Two readings earn their keep. As storage, $\\mathbf{X}\\in\\mathbb{R}^{N\\times D}$ *is* the dataset. As an operator, a matrix is a linear transformation — multiplying by it rotates, stretches and projects vectors, which is exactly what one [[layer]] of a neural network does to its input. Multiplication does not commute, and the inner dimensions have to agree.',
    math:
      'For $\\mathbf{A}\\in\\mathbb{R}^{m\\times n}$ and $\\mathbf{B}\\in\\mathbb{R}^{n\\times p}$ the product has entries $(\\mathbf{A}\\mathbf{B})_{ik} = \\sum_{j=1}^{n}A_{ij}B_{jk}$ — every entry is a [[dot-product]] of one row with one column. The transpose $\\mathbf{A}^{\\top}$ swaps rows and columns, and $(\\mathbf{A}\\mathbf{B})^{\\top} = \\mathbf{B}^{\\top}\\mathbf{A}^{\\top}$.',
    statquest: 'matrix algebra for neural networks',
    teachesAt: 'ch02-data-structures',
    see: ['vector', 'dot-product'],
  },
  {
    id: 'dot-product',
    term: 'dot product',
    simple:
      'Take two lists of the same length, multiply them together position by position, and add up the results. One number comes out, and it answers a question about agreement: how much do these two lists point the same way?',
    technical:
      'The single most common operation in machine learning. Read as a weighted vote, $\\mathbf{w}\\mathbf{x}$ adds up every feature scaled by how much the model thinks it counts. Read as geometry it is $\\|\\mathbf{w}\\|\\|\\mathbf{x}\\|\\cos\\theta$: largest when the two arrows align, exactly zero when they are perpendicular, negative when they oppose. That second reading is why it doubles as a similarity score ([[cosine-similarity]]) and why the [[gradient]] turns out to be the direction of steepest ascent.',
    math:
      '$\\mathbf{w}\\mathbf{x}\\stackrel{\\text{def}}{=}\\sum_{j=1}^{D}w^{(j)}x^{(j)} = \\|\\mathbf{w}\\|\\,\\|\\mathbf{x}\\|\\cos\\theta$. With $\\mathbf{w} = [3,4]$ and $\\mathbf{x} = [4,3]$ it is $12 + 12 = 24$; both have length 5, so $\\cos\\theta = 24/25 = 0.96$, an angle of about $16^{\\circ}$. Setting $\\mathbf{x} = \\mathbf{w}$ gives $\\mathbf{w}\\mathbf{w} = \\|\\mathbf{w}\\|^{2}$, which is where the $\\tfrac12\\|\\mathbf{w}\\|^{2}$ in the SVM objective comes from.',
    statquest: 'matrix algebra for neural networks',
    teachesAt: 'ch02-data-structures',
    see: ['vector', 'cosine-similarity', 'hyperplane'],
  },
  {
    id: 'sigma-notation',
    term: 'summation (Σ)',
    simple:
      'Shorthand for adding a lot of things up. It has three parts and no more: where the counter starts, where it stops, and the recipe for one term. Read it out loud as a sentence and most of the fear goes away.',
    technical:
      'A capital sigma is a loop with the loop bounds written above and below it — `for i = 1 to n, add this`. Nearly every objective in this course is a sum over the training set, which is why it is everywhere, and why [[stochastic-gradient-descent|SGD]] is possible at all: a sum can be sampled a few terms at a time and still point roughly the right way, which a product cannot. Nested sigmas are nested loops, read outside in.',
    math:
      '$\\sum_{i=1}^{n}x_i \\stackrel{\\text{def}}{=} x_1 + x_2 + \\dots + x_n$. Two properties do most of the work when a loss is differentiated: sums split, $\\sum_i(a_i + b_i) = \\sum_i a_i + \\sum_i b_i$, and constants slide out, $\\sum_i c\\,a_i = c\\sum_i a_i$. Worked: $\\sum_{j=1}^{3}j^{2} = 1 + 4 + 9 = 14$.',
    teachesAt: 'ch02-data-structures',
    see: ['capital-pi-notation', 'expectation', 'vector'],
  },
  {
    id: 'capital-pi-notation',
    term: 'product (Π)',
    simple:
      'The same shorthand as the summation sign, but multiplying instead of adding. It shows up almost exclusively in one place: combining the chances of independent events, because independent chances multiply.',
    technical:
      'Products of many probabilities are numerically hostile — a few hundred factors below 1 underflow to exactly zero in floating point, and zero is a number no optimizer can recover from. The standard escape is the logarithm, which converts a product into a sum. That is the reason [[log-likelihood]] rather than likelihood is what actually gets maximized, and one reason [[maximum-likelihood]] training is tractable at all.',
    math:
      '$\\prod_{i=1}^{n}x_i \\stackrel{\\text{def}}{=} x_1\\cdot x_2\\cdots x_n$, and $\\log\\prod_i x_i = \\sum_i \\log x_i$. The danger is concrete: $0.1^{400} = 10^{-400}$ is far below the smallest double a machine can hold and becomes exactly $0$, while the corresponding sum of logarithms, $400\\ln 0.1 \\approx -921$, is an ordinary number.',
    teachesAt: 'ch02-data-structures',
    see: ['sigma-notation', 'log-likelihood', 'maximum-likelihood'],
  },
  {
    id: 'function-notation',
    term: 'function notation',
    simple:
      'A function is a machine with one slot: put a value in, get exactly one value out. The notation clustered around it — max, argmax, the left arrow — is the small vocabulary you need to read any algorithm in the book.',
    technical:
      'Four pieces get constant use. $f(x)$ maps each element of a domain to one element of a codomain, and a bold $\\mathbf{f}(x)$ returns a whole vector. $\\max_{a\\in\\mathcal{A}}f(a)$ is the best *value*, $\\arg\\max_{a\\in\\mathcal{A}}f(a)$ is the *input* achieving it — machine learning almost always wants the second, since what survives training is the parameters and not the score they earned. And $a \\leftarrow f(x)$ is assignment rather than an equation, which is why $a \\leftarrow a + 1$ makes perfect sense.',
    math:
      '$f:\\mathcal{X}\\to\\mathcal{Y}$. With $\\mathcal{A} = \\{1,2,3\\}$ and $f(a) = 10 - a$: $\\max_a f(a) = 9$ while $\\arg\\max_a f(a) = 1$. The two are tied together by $f\\!\\left(\\arg\\max_a f(a)\\right) = \\max_a f(a)$, and $\\arg\\max$ is properly a *set* whenever the best value is tied.',
    teachesAt: 'ch02-data-structures',
    see: ['local-minimum', 'model', 'sigma-notation'],
  },
  {
    id: 'local-minimum',
    term: 'local minimum',
    simple:
      'The bottom of a valley — a spot where every direction you could step is uphill. It need not be the lowest point in the whole landscape, only the lowest one within reach.',
    technical:
      'Training is a search for a low point on an error surface, so where the search can get stuck is a practical question. For a [[convex]] objective — linear regression, logistic regression, a linear SVM — there is a single valley and the distinction is empty. A neural network has astronomically many, though in high dimensions the genuine obstacles turn out to be saddle points and long flat plateaus rather than bad minima.',
    math:
      'A point $c$ is a local minimum when $f(x)\\ge f(c)$ for every $x$ within some distance of $c$. The necessary condition is $f\'(c) = 0$, which is equally true at maxima and inflection points and so identifies nothing on its own; the second derivative decides, with $f\'\'(c) > 0$ a minimum and $f\'\'(c) < 0$ a maximum.',
    statquest: 'gradient descent',
    teachesAt: 'ch02-data-structures',
    see: ['global-minimum', 'derivative', 'convex', 'gradient-descent'],
  },
  {
    id: 'global-minimum',
    term: 'global minimum',
    simple:
      'The lowest point anywhere in the landscape, not merely the lowest point in view. Finding one is easy when the landscape is a single bowl and generally impossible when it is a mountain range.',
    technical:
      'What optimization would like to reach and can rarely prove it has. [[convex|Convex]] objectives make it attainable, because every local minimum is global and [[gradient-descent]] cannot be trapped. Deep networks give that up, and the loss is smaller than it sounds: a good-enough minimum that [[generalization|generalizes]] often beats the true global minimum of the training objective, which by definition is also the best possible fit to the training noise.',
    math:
      'A point $c^{\\star}$ with $f(c^{\\star})\\le f(x)$ for every $x$ in the domain. For convex $f$ the set of minimizers is itself convex and any stationary point belongs to it; for non-convex $f$, verifying that a candidate is global is NP-hard in general, which is why nobody claims it.',
    statquest: 'gradient descent',
    teachesAt: 'ch02-data-structures',
    see: ['local-minimum', 'convex', 'gradient-descent'],
  },
  {
    id: 'derivative',
    term: 'derivative',
    simple:
      'How fast something is changing, right now. One number: how much the output moves for a tiny nudge of the input. Positive means rising, negative means falling, zero means flat ground — and flat ground is what an optimizer is hunting for.',
    technical:
      'The derivative at a point is the slope of the straight line that best matches the curve there. Its definition is a limit — take the slope between two nearby points and slide them together — but in practice you assemble it from a handful of memorized rules plus the [[chain-rule]]. Machine learning cares for two reasons: the sign says which way to move to reduce a loss, and the size says how urgently.',
    math:
      '$f\'(x) = \\lim_{h\\to 0}\\dfrac{f(x+h)-f(x)}{h}$. Take $f(x) = x^{2}$ at $x = 3$: over $h = 0.1$ the slope is $\\frac{3.1^{2}-3^{2}}{0.1} = \\frac{0.61}{0.1} = 6.1$, over $h = 0.01$ it is $6.01$, over $h=0.001$ it is $6.001$ — converging on $f\'(3) = 2\\cdot 3 = 6$. The rules used constantly: $\\frac{d}{dx}x^{n} = nx^{n-1}$, $\\frac{d}{dx}e^{x} = e^{x}$, $\\frac{d}{dx}\\ln x = 1/x$, and the derivative of a constant is $0$.',
    statquest: 'gradient descent',
    teachesAt: 'ch02-derivative-gradient',
    see: ['chain-rule', 'gradient', 'partial-derivative', 'local-minimum'],
  },
  {
    id: 'chain-rule',
    term: 'chain rule',
    simple:
      'When one thing drives another which drives a third, the rates multiply. If a gear turns three times for every turn of the handle, and the drum turns five times for every turn of the gear, the drum turns fifteen times per turn of the handle. That is the entire rule.',
    technical:
      'The rule for differentiating a function of a function, and the most important piece of calculus in this course: [[backpropagation]] is the chain rule applied layer by layer, from the loss backwards to every weight, and nothing besides. The practical skill is spotting the nesting — name the outer function, name the inner one, differentiate each in its own right, multiply.',
    math:
      'If $F(x) = f(g(x))$ then $F\'(x) = f\'(g(x))\\,g\'(x)$. Worked: $F(x) = (5x+1)^{2}$ has outer $f(u) = u^{2}$ and inner $g(x) = 5x+1$, so $F\'(x) = 2(5x+1)\\cdot 5 = 50x+10$ and $F\'(1) = 60$. In Leibniz notation the shape is unmistakable, $\\frac{dF}{dx} = \\frac{dF}{du}\\cdot\\frac{du}{dx}$, and for several nested stages the factors keep multiplying — which is exactly how a [[vanishing-gradient]] arises.',
    statquest: 'chain rule',
    teachesAt: 'ch02-derivative-gradient',
    see: ['derivative', 'backpropagation', 'gradient'],
  },
  {
    id: 'gradient',
    term: 'gradient',
    simple:
      'The derivative for functions with more than one input. Instead of a single slope it hands you a direction: the way that leads uphill fastest, with a length saying how steep that climb is. Turn around and you have the fastest way down, which is how nearly every model in this course is trained.',
    technical:
      'A vector holding one [[partial-derivative]] per input. Two facts do all the work. It points along steepest ascent, because the slope felt walking in a direction $\\mathbf{u}$ is the [[dot-product]] $\\nabla f\\cdot\\mathbf{u}$, which is largest when $\\mathbf{u}$ aligns with $\\nabla f$. And its length *is* that steepest slope, so a gradient near zero means flat ground and a step that goes nowhere. [[gradient-descent|Gradient descent]] is the one-line consequence.',
    math:
      '$\\nabla f \\stackrel{\\text{def}}{=}\\left[\\frac{\\partial f}{\\partial x^{(1)}},\\dots,\\frac{\\partial f}{\\partial x^{(D)}}\\right]$. For $f(x,y) = x^{2}y$ at $(2,3)$: $\\nabla f = \\left[2xy,\\;x^{2}\\right] = [12,\\,4]$, so the surface climbs three times faster along $x$ than along $y$ there, and the steepest slope available is $\\|\\nabla f\\| = \\sqrt{144+16}\\approx 12.65$. One descent step with rate $\\alpha$ is $\\mathbf{x}\\leftarrow\\mathbf{x}-\\alpha\\nabla f(\\mathbf{x})$.',
    statquest: 'gradient descent',
    teachesAt: 'ch02-derivative-gradient',
    see: ['partial-derivative', 'derivative', 'gradient-descent', 'dot-product'],
  },
  {
    id: 'partial-derivative',
    term: 'partial derivative',
    simple:
      'Stand on a hillside and walk due east, refusing to move north at all. How steeply does the ground rise? That is a partial derivative: the slope along one axis with every other input held still.',
    technical:
      'Mechanically it is ordinary differentiation with the other variables treated as constants, so their terms contribute zero exactly as a plain number would. It matters because of bookkeeping at scale — a network with a million weights has a million partials, and computing them one at a time would be hopeless, which is the problem [[backpropagation]] solves. What a single partial does *not* tell you is the slope in a diagonal direction; that needs the whole [[gradient]].',
    math:
      '$\\frac{\\partial f}{\\partial x^{(1)}}$ differentiates in $x^{(1)}$ alone. For $f(x^{(1)},x^{(2)}) = ax^{(1)}+bx^{(2)}+c$ it is $a$, since $bx^{(2)}$ and $c$ are frozen. A non-linear check on $f(x,y) = x^{2}y$ at $(2,3)$, where $\\partial f/\\partial x = 2xy = 12$: nudging $x$ to $2.01$ moves $f$ from $12$ to $12.1203$, a rise of $0.1203$ over a step of $0.01$ — a rate of $12.03$, closing on $12$ as the step shrinks.',
    statquest: 'gradient descent',
    teachesAt: 'ch02-derivative-gradient',
    see: ['gradient', 'derivative', 'chain-rule'],
  },
  {
    id: 'random-variable',
    term: 'random variable',
    simple:
      'A quantity whose value is settled by something you cannot predict: the face of a die, tomorrow’s rainfall, the height of the next stranger you pass. Not a number, but the rule saying which numbers are possible and how often each one turns up.',
    technical:
      'Written as an italic capital $X$, with lower-case $x$ for a value it took. Discrete variables take countably many values and are described by a [[probability-mass-function|pmf]]; continuous ones range over an interval and need a [[probability-density-function|pdf]]. All of supervised learning is a statement about random variables — examples are draws of a pair $(X, Y)$ from a joint distribution, and a model is an attempt to describe $Y$ once $X$ is known.',
    math:
      'Formally a function from outcomes to numbers, $X:\\Omega\\to\\mathbb{R}$, summarized by $\\mathbb{E}[X]$ and $\\mathrm{Var}(X)$. Independence of $X$ and $Y$ means $\\Pr(X=x, Y=y) = \\Pr(X=x)\\Pr(Y=y)$ for every pair — precisely the assumption that lets a dataset’s likelihood be written as a [[capital-pi-notation|product]] over examples.',
    statquest: 'probability distributions',
    teachesAt: 'ch02-random-variables',
    see: ['probability-mass-function', 'probability-density-function', 'expectation'],
  },
  {
    id: 'probability-mass-function',
    term: 'probability mass function',
    simple:
      'The list of how likely each possible value is, for a quantity with a countable set of outcomes. Every entry is at least zero and the whole list adds to one — a single unit of certainty, shared out.',
    technical:
      'The description of a discrete distribution, and what a classifier reports when it outputs class probabilities. [[expectation]], [[variance]] and every entropy calculation are computed from it. It differs from a [[probability-density-function|density]] in one crucial respect: a pmf value *is* a probability, so it can never exceed 1, whereas a density can be arbitrarily large.',
    math:
      '$p(x) = \\Pr(X=x)$ with $p(x)\\ge 0$ and $\\sum_x p(x) = 1$. Example: $\\Pr(X=\\text{red}) = 0.3$, $\\Pr(X=\\text{yellow}) = 0.45$, $\\Pr(X=\\text{blue}) = 0.25$ — three numbers summing to $1$. A fair die has $p(x) = 1/6$ on $\\{1,\\dots,6\\}$.',
    statquest: 'probability distributions',
    teachesAt: 'ch02-random-variables',
    see: ['probability-density-function', 'random-variable', 'expectation'],
  },
  {
    id: 'probability-density-function',
    term: 'probability density function',
    simple:
      'For quantities that can take any value in a range there is no sensible list — an exact height of 180 centimetres, to infinite precision, has probability zero. What you get instead is a curve, and probability is the area under it between two points.',
    technical:
      'A non-negative function whose total area is 1. Height is not probability, which is the standard trap: a density can exceed 1 — a uniform distribution on the interval from 0 to 0.5 has height 2 everywhere — because only areas are constrained. That is why a continuous likelihood may be greater than 1, and why comparing densities is legitimate while calling them probabilities is not. Estimating one from data is [[kernel-density-estimation]].',
    math:
      '$f_X(x)\\ge 0$ with $\\int_{\\mathbb{R}}f_X(x)\\,dx = 1$, and $\\Pr(a\\le X\\le b) = \\int_a^b f_X(x)\\,dx$. Consequently $\\Pr(X = c) = \\int_c^c f_X = 0$ at every single point. Expectation becomes an integral, $\\mathbb{E}[X] = \\int_{\\mathbb{R}}x f_X(x)\\,dx$ — the same weighted average with the sum replaced by its continuous cousin.',
    statquest: 'the normal distribution',
    teachesAt: 'ch02-random-variables',
    see: ['probability-mass-function', 'expectation', 'kernel-density-estimation'],
  },
  {
    id: 'expectation',
    term: 'expectation',
    simple:
      'The long-run average, worked out in advance. Weight every possible value by how often it happens, add them up, and you have the number the average of many draws will settle towards — even when it is a value the thing itself can never produce.',
    technical:
      'The center of mass of a distribution: balance the probabilities on a pencil and the expectation is where it balances. It is linear, which is why it appears in every derivation — $\\mathbb{E}[aX+bY] = a\\mathbb{E}[X]+b\\mathbb{E}[Y]$ holds whether or not $X$ and $Y$ are independent, and no other summary statistic is that well behaved. A model’s true risk is an expectation, [[variance]] is an expectation, and an [[unbiased-estimator]] is defined by one.',
    math:
      '$\\mathbb{E}[X]\\stackrel{\\text{def}}{=}\\sum_{i=1}^{k}x_i\\Pr(X = x_i)$, or $\\int_{\\mathbb{R}}xf_X(x)\\,dx$ in the continuous case. A fair die gives $\\frac{1+2+3+4+5+6}{6} = 3.5$, a face it does not have. Weighted example: values $1,2,3$ with probabilities $0.2, 0.5, 0.3$ give $0.2 + 1.0 + 0.9 = 2.1$.',
    statquest: 'expected values',
    teachesAt: 'ch02-random-variables',
    see: ['variance', 'standard-deviation', 'unbiased-estimator', 'sigma-notation'],
  },
  {
    id: 'variance',
    term: 'variance',
    simple:
      'How spread out the values are. Take each value’s distance from the average, square it so that too-high and too-low both count as spread, and average those. A large number means the outcomes are all over the place.',
    technical:
      'Squared units are the price of squaring, which is why its [[standard-deviation|square root]] is what usually gets reported. Variance adds for independent variables, and that additivity is the engine behind averaging: the mean of $n$ independent draws has variance $\\sigma^{2}/n$, so four times the data halves the wobble. In model selection the word is reused for a related idea — how much a fitted model would move on a fresh training set — under [[bias-variance-tradeoff]].',
    math:
      '$\\mathrm{Var}(X) = \\mathbb{E}\\!\\left[(X-\\mu)^{2}\\right] = \\mathbb{E}[X^{2}]-\\mu^{2}$ with $\\mu = \\mathbb{E}[X]$. For a fair die, $\\mathbb{E}[X^{2}] = \\frac{91}{6}\\approx 15.17$ and $\\mu^{2} = 12.25$, so $\\mathrm{Var}(X)\\approx 2.92$. For independent $X$ and $Y$, $\\mathrm{Var}(X+Y) = \\mathrm{Var}(X)+\\mathrm{Var}(Y)$.',
    statquest: 'variance',
    teachesAt: 'ch02-random-variables',
    see: ['standard-deviation', 'expectation', 'bias-variance-tradeoff'],
  },
  {
    id: 'standard-deviation',
    term: 'standard deviation',
    simple:
      'The spread, back in the original units. Variance comes out in squared pounds and squared centimetres, which nobody can picture, so take the square root and you have a typical distance from the average.',
    technical:
      'Written $\\sigma$, with $\\sigma^{2}$ the [[variance]]. Its value is that it is comparable with the mean: for a roughly bell-shaped distribution about two thirds of the mass sits within one $\\sigma$ of the mean and about 95% within two. It also sets the scale for [[standardization]], the preprocessing step that rewrites each feature as “how many standard deviations from its own mean”, so that no feature dominates a distance merely by being measured in small units.',
    math:
      '$\\sigma\\stackrel{\\text{def}}{=}\\sqrt{\\mathbb{E}\\!\\left[(X-\\mu)^{2}\\right]}$; for the fair die above, $\\sqrt{2.92}\\approx 1.71$. Standardizing is $z = \\frac{x-\\mu}{\\sigma}$, giving $\\mathbb{E}[z] = 0$ and $\\mathrm{Var}(z) = 1$. It is not linear — $\\sigma(X+Y)\\ne\\sigma(X)+\\sigma(Y)$ even for independent variables, because it is the *variances* that add.',
    statquest: 'standard deviation',
    teachesAt: 'ch02-random-variables',
    see: ['variance', 'expectation', 'standardization'],
  },
  {
    id: 'unbiased-estimator',
    term: 'unbiased estimator',
    simple:
      'A recipe for guessing something you cannot measure, which is not systematically wrong. Any single guess misses; what makes it unbiased is that the misses cancel — repeat the exercise on fresh samples forever and the average guess lands exactly on the truth.',
    technical:
      'Bias is a statement about the center of an estimator, not its accuracy on one sample, so an unbiased estimator can still be useless if it is wildly noisy — and a slightly biased estimator with far smaller [[variance]] is often the better tool, which is the whole argument for [[regularization]]. The classic fact: the sample mean is unbiased for the true mean, while the sample variance computed with $1/N$ is not, because the deviations are measured from the sample’s own mean rather than the true one.',
    math:
      '$\\hat\\theta(S_X)$ is unbiased for $\\theta$ when $\\mathbb{E}\\!\\left[\\hat\\theta(S_X)\\right] = \\theta$. The sample mean qualifies: $\\mathbb{E}\\!\\left[\\frac{1}{N}\\sum_{i=1}^{N}x_i\\right] = \\frac{1}{N}\\sum_i\\mathbb{E}[x_i] = \\mu$. The uncorrected variance does not — $\\mathbb{E}\\!\\left[\\frac{1}{N}\\sum_i(x_i-\\hat\\mu)^{2}\\right] = \\frac{N-1}{N}\\sigma^{2}$ — which is the entire reason for the $N-1$ denominator.',
    statquest: 'population and estimated variance',
    teachesAt: 'ch02-random-variables',
    see: ['expectation', 'variance', 'model-bias'],
  },
  {
    id: 'conditional-probability',
    term: 'conditional probability',
    simple:
      'How likely something is once you already know something else. The chance that a stranger is over six foot is one number; the chance that a professional basketball player is over six foot is quite another. Knowledge narrows the field you are averaging over.',
    technical:
      'The vertical bar means “given”. Conditioning restricts attention to the slice of the world where the condition holds and then renormalizes so that slice sums to 1 again. Classification is conditional probability with the notation hidden — $\\Pr(Y = \\text{spam}\\mid \\mathbf{X} = \\mathbf{x})$ is exactly what [[logistic-regression]] reports. The commonest mistake in reading one is swapping the sides: $\\Pr(A\\mid B)$ and $\\Pr(B\\mid A)$ can differ enormously, which is what [[bayes-rule]] is for.',
    math:
      '$\\Pr(A\\mid B) = \\dfrac{\\Pr(A, B)}{\\Pr(B)}$ whenever $\\Pr(B) > 0$: the joint probability, renormalized by the condition. Rearranged it gives the chain rule of probability, $\\Pr(A,B) = \\Pr(A\\mid B)\\Pr(B)$, and $A$ is independent of $B$ exactly when $\\Pr(A\\mid B) = \\Pr(A)$ — knowing $B$ changes nothing.',
    statquest: 'bayes theorem',
    teachesAt: 'ch02-bayes',
    see: ['bayes-rule', 'prior', 'posterior', 'likelihood'],
  },
  {
    id: 'bayes-rule',
    term: "Bayes' Rule",
    simple:
      'A rule for changing your mind by the right amount. You start with how common something is, you see a piece of evidence, and it tells you what to believe now. Its real lesson is that evidence never speaks alone — a rare thing stays fairly unlikely even after a fairly convincing test.',
    technical:
      'It flips a conditional round: you know how often the evidence shows up when the hypothesis is true, and you want how often the hypothesis is true when the evidence shows up. Those are different numbers and the gap between them is the [[prior]]. Concretely, a test catching 90% of a disease that affects 1 person in 100 leaves you only about 8% likely to be ill after a positive result, because the 10% false-alarm rate is charged against a vastly larger healthy population. Naive Bayes, [[maximum-a-posteriori|MAP]] estimation and every Bayesian method in Chapter 11 rest on it.',
    math:
      '$\\Pr(X = x\\mid Y = y) = \\dfrac{\\Pr(Y = y\\mid X = x)\\,\\Pr(X = x)}{\\Pr(Y = y)}$, which falls out of writing the joint two ways: $\\Pr(X,Y) = \\Pr(X\\mid Y)\\Pr(Y) = \\Pr(Y\\mid X)\\Pr(X)$. The denominator is only a normalizer, $\\Pr(Y = y) = \\sum_x \\Pr(Y = y\\mid X = x)\\Pr(X = x)$, so the memorable form is posterior $\\propto$ likelihood $\\times$ prior. In odds form, prior odds of $1{:}99$ times a likelihood ratio of $0.9/0.1 = 9$ gives posterior odds $9{:}99$, about $8.3\\%$.',
    statquest: 'bayes theorem',
    teachesAt: 'ch02-bayes',
    see: ['prior', 'posterior', 'likelihood', 'conditional-probability', 'maximum-a-posteriori'],
  },
  {
    id: 'prior',
    term: 'prior',
    simple:
      'What you believed before the evidence arrived. Often it is nothing grander than a base rate — how common the thing is in the population — and ignoring it is the most reliable way there is to misread a test result.',
    technical:
      'In parameter estimation the prior is a distribution over the parameter values themselves, encoding what you are willing to assume before seeing data. That is not a philosophical flourish: a Gaussian prior centered on zero *is* [[l2-regularization]], and a Laplace prior is [[l1-regularization]]. Its influence shrinks as examples accumulate, so it matters most exactly when data is scarce — which is when people are most tempted to leave it out.',
    math:
      '$\\Pr(X = x)$, or over parameters $\\Pr(\\boldsymbol\\theta)$. Since $\\log\\Pr(\\boldsymbol\\theta\\mid\\text{data}) = \\log\\Pr(\\text{data}\\mid\\boldsymbol\\theta) + \\log\\Pr(\\boldsymbol\\theta) + \\text{const}$, a prior $\\boldsymbol\\theta\\sim\\mathcal{N}(0,\\tau^{2}\\mathbf{I})$ contributes the term $-\\frac{1}{2\\tau^{2}}\\|\\boldsymbol\\theta\\|^{2}$ — a penalty on large weights, arrived at from probability rather than from taste.',
    statquest: 'bayes theorem',
    teachesAt: 'ch02-bayes',
    see: ['posterior', 'bayes-rule', 'maximum-a-posteriori', 'l2-regularization'],
  },
  {
    id: 'posterior',
    term: 'posterior',
    simple:
      'What you believe after the evidence. It is the answer Bayes’ Rule produces, and it becomes the starting belief for whatever evidence arrives next — which is what makes updating a belief something you can do one observation at a time.',
    technical:
      'A whole distribution rather than a single number, which is the Bayesian selling point: it carries its own uncertainty around with it. Collapsing it to its highest point gives the [[maximum-a-posteriori|MAP]] estimate and throws that uncertainty away. Computing it exactly needs the denominator $\\Pr(Y = y)$, which for anything realistic is an intractable sum or integral — hence [[markov-chain-monte-carlo|MCMC]] and variational approximations.',
    math:
      '$\\Pr(\\boldsymbol\\theta\\mid x) = \\frac{\\Pr(x\\mid\\boldsymbol\\theta)\\Pr(\\boldsymbol\\theta)}{\\Pr(x)}$. Processing examples one at a time is legitimate because yesterday’s posterior is today’s prior: after $N$ independent observations, $\\Pr(\\boldsymbol\\theta\\mid x_1,\\dots,x_N)\\propto\\Pr(\\boldsymbol\\theta)\\prod_{i=1}^{N}\\Pr(x_i\\mid\\boldsymbol\\theta)$, and the order they arrive in makes no difference to the result.',
    statquest: 'bayes theorem',
    teachesAt: 'ch02-bayes',
    see: ['prior', 'bayes-rule', 'maximum-a-posteriori', 'likelihood'],
  },
  {
    id: 'likelihood',
    term: 'likelihood',
    simple:
      'How well a candidate explanation accounts for what you actually saw. It turns the usual question around: instead of asking how probable the data is, hold the data fixed and ask which explanation makes it least surprising.',
    technical:
      'The same expression as a probability, read with the roles swapped — data fixed, parameters varying. That is why a likelihood is not a distribution over parameters, need not integrate to 1, and for continuous data can exceed 1 (it is a [[probability-density-function|density]]). Maximizing it alone is [[maximum-likelihood]]; multiplying by a [[prior]] first and then maximizing is [[maximum-a-posteriori|MAP]].',
    math:
      '$L(\\boldsymbol\\theta) = \\Pr(\\text{data}\\mid\\boldsymbol\\theta) = \\prod_{i=1}^{N}\\Pr(x_i\\mid\\boldsymbol\\theta)$ under independence. Coin example: seven heads in ten flips gives $L(p) = p^{7}(1-p)^{3}$, and differentiating $\\log L = 7\\log p + 3\\log(1-p)$ to zero puts the maximum at $p = 0.7$. Practice maximizes $\\log L$ rather than $L$, for the reasons under [[capital-pi-notation]].',
    statquest: 'probability is not likelihood',
    teachesAt: 'ch02-bayes',
    see: ['maximum-likelihood', 'prior', 'posterior', 'log-likelihood'],
  },
  {
    id: 'maximum-a-posteriori',
    term: 'maximum a posteriori (MAP)',
    simple:
      'Pick the explanation that best combines two things: how well it fits the data, and how plausible it was to begin with. It is maximum likelihood with an opinion — and the opinion is what stops it chasing noise when examples are thin on the ground.',
    technical:
      'MAP returns the single highest point of the [[posterior]], so it is a point estimate and not a distribution. Its practical importance is the identity it hides: taking logs turns “likelihood times prior” into “fit term plus penalty term”, which means every regularized model in this book is quietly a MAP estimate under some prior. As $N$ grows the likelihood dominates and MAP converges on plain [[maximum-likelihood]].',
    math:
      '$\\boldsymbol\\theta^{\\star} = \\arg\\max_{\\boldsymbol\\theta}\\Pr(\\boldsymbol\\theta\\mid\\text{data}) = \\arg\\max_{\\boldsymbol\\theta}\\prod_{i=1}^{N}\\Pr(x_i\\mid\\boldsymbol\\theta)\\,\\Pr(\\boldsymbol\\theta)$; the evidence is dropped because it does not depend on $\\boldsymbol\\theta$. In log form $\\boldsymbol\\theta^{\\star} = \\arg\\max\\left[\\sum_i\\log\\Pr(x_i\\mid\\boldsymbol\\theta) + \\log\\Pr(\\boldsymbol\\theta)\\right]$ — a sum, which machines handle, instead of a product, which they do not.',
    statquest: 'maximum likelihood',
    teachesAt: 'ch02-bayes',
    see: ['maximum-likelihood', 'posterior', 'prior', 'regularization'],
  },
  {
    id: 'hyperparameter',
    term: 'hyperparameter',
    simple:
      'A setting you choose before training starts, because the algorithm has no way of working it out from the data. How many neighbors to consult, how harshly to punish mistakes, how big a step to take — the dials on the outside of the machine.',
    technical:
      'The distinguishing test: [[model-parameters|parameters]] are fitted by the training procedure, hyperparameters are inputs to it. They cannot be tuned on the training set, where the answer would always be “maximum flexibility, please”, so they are settled on a [[validation-set]] by [[grid-search]], [[random-search]] or [[bayesian-optimization]], as [Chapter 5 sets out](sec:ch05-tuning). Most are searched on a log scale, because what matters is the order of magnitude rather than the third decimal place.',
    math:
      'Training solves $\\boldsymbol\\theta^{\\star}(\\lambda) = \\arg\\min_{\\boldsymbol\\theta}J(\\boldsymbol\\theta;\\lambda)$ for a fixed $\\lambda$, and tuning is the outer problem $\\lambda^{\\star} = \\arg\\min_{\\lambda}J_{\\text{val}}\\!\\left(\\boldsymbol\\theta^{\\star}(\\lambda)\\right)$ — two nested optimizations, which is why tuning costs so much more than fitting. Examples of $\\lambda$: $k$ in [[k-nearest-neighbors|kNN]], $C$ in an SVM, the [[learning-rate]] $\\alpha$, a tree’s maximum depth.',
    statquest: 'cross validation',
    teachesAt: 'ch02-ml-vocabulary',
    see: ['model-parameters', 'validation-set', 'grid-search', 'cross-validation'],
  },
  {
    id: 'classification',
    term: 'classification',
    simple:
      'Sorting examples into a fixed set of named buckets. Spam or not spam; cat, dog or horse; which of twelve genres. The buckets are decided before you start, and every example goes into exactly one.',
    technical:
      'The label set is finite and unordered — nothing says class 3 sits between class 2 and class 4 — which is precisely why raw class ids must not be fed to a model as a single number, and why [[one-hot-encoding]] exists. Most classifiers produce a score first and threshold it afterwards, so accuracy is as much a choice as a measurement; see [the metrics section](sec:ch05-metrics). Two buckets make it [[binary-classification]], more make it [[multiclass-classification]].',
    math:
      'Learn $f:\\mathbb{R}^{D}\\to\\{1,\\dots,C\\}$, usually as $f(\\mathbf{x}) = \\arg\\max_c s_c(\\mathbf{x})$ over per-class scores. The Bayes-optimal rule is $\\arg\\max_c\\Pr(Y = c\\mid\\mathbf{X} = \\mathbf{x})$ and its error rate is a floor no classifier can go below — every algorithm here is an attempt to approximate that one conditional distribution.',
    teachesAt: 'ch02-ml-vocabulary',
    see: ['binary-classification', 'multiclass-classification', 'regression', 'label'],
  },
  {
    id: 'regression',
    term: 'regression',
    simple:
      'Predicting a number rather than a category. What will this flat sell for, how many units ship next month, how long until the part fails. There is no right bucket to land in — only a distance from the truth.',
    technical:
      'The target is continuous and ordered, so being wrong by a little is genuinely better than being wrong by a lot and the [[loss-function|loss]] has to say so: squared error punishes large misses hardest, absolute error treats every miss proportionally and shrugs at outliers. Classification metrics do not transfer — there is no accuracy here, only [[mean-squared-error]], mean absolute error and $R^{2}$. The workhorse is [[linear-regression]].',
    math:
      'Learn $f:\\mathbb{R}^{D}\\to\\mathbb{R}$ minimizing $\\frac{1}{N}\\sum_{i=1}^{N}\\left(f(\\mathbf{x}_i)-y_i\\right)^{2}$. Worth knowing what that choice buys: the minimizer of expected squared error is the conditional mean $\\mathbb{E}[Y\\mid\\mathbf{X} = \\mathbf{x}]$, while the minimizer of absolute error is the conditional *median* — the loss decides which summary of the truth comes back.',
    statquest: 'linear regression',
    teachesAt: 'ch02-ml-vocabulary',
    see: ['linear-regression', 'classification', 'mean-squared-error'],
  },
  {
    id: 'binary-classification',
    term: 'binary classification',
    simple:
      'Classification with exactly two buckets: yes or no, sick or healthy, spam or not. Most classification problems in practice are this one, and the harder ones are often assembled out of it.',
    technical:
      'The two-class case is special because a single number suffices — one score, one threshold, one boundary. It is also where the interesting evaluation lives: when one class is rare, [[accuracy]] becomes useless (always answering “healthy” scores 99% on a disease affecting 1 in 100) and [[precision]], [[recall]] and the [[roc-curve]] take over. Encodings differ by algorithm, $\\{0,1\\}$ for [[logistic-regression]] and $\\{-1,+1\\}$ for the SVM.',
    math:
      'Learn $f:\\mathbb{R}^{D}\\to\\{0,1\\}$, typically as $\\mathbb{1}\\!\\left[s(\\mathbf{x}) > \\tau\\right]$ for a score $s$ and a [[decision-threshold|threshold]] $\\tau$. Sweeping $\\tau$ traces the entire [[roc-curve]] without retraining anything, which is why the threshold is a deployment decision rather than a modeling one.',
    statquest: 'logistic regression',
    teachesAt: 'ch02-ml-vocabulary',
    see: ['classification', 'multiclass-classification', 'decision-threshold', 'roc-curve'],
  },
  {
    id: 'multiclass-classification',
    term: 'multiclass classification',
    simple:
      'Three or more buckets, with each example still going into exactly one. Twelve music genres, twenty-six letters, a thousand kinds of object in a photograph.',
    technical:
      'Some algorithms handle it natively — a [[decision-tree]] or [[k-nearest-neighbors|kNN]] never cared how many classes there were. Others are binary at heart and must be wrapped: [[one-versus-rest]] trains one detector per class and takes the most confident, one-versus-one trains a detector per pair and votes. Neural networks turn scores into a distribution with the [[softmax]]. Do not confuse it with [[multi-label-classification]], where an example may belong to several classes at once.',
    math:
      'Learn $f:\\mathbb{R}^{D}\\to\\{1,\\dots,C\\}$ as $\\arg\\max_c s_c(\\mathbf{x})$. Softmax normalizes scores into probabilities, $\\Pr(y = c\\mid\\mathbf{x}) = \\frac{e^{s_c}}{\\sum_{k=1}^{C}e^{s_k}}$, trained by cross-entropy $-\\sum_c \\mathbb{1}[y = c]\\log\\Pr(y = c\\mid\\mathbf{x})$ — the multiclass generalization of [[log-likelihood|log loss]]. One-versus-rest needs $C$ models, one-versus-one needs $\\binom{C}{2}$.',
    statquest: 'softmax',
    teachesAt: 'ch02-ml-vocabulary',
    see: ['classification', 'one-versus-rest', 'softmax', 'multi-label-classification'],
  },
  {
    id: 'model-based-learning',
    term: 'model-based learning',
    simple:
      'Learn a formula from the data, then throw the data away. A spam filter trained on ten thousand messages ships as a list of weights, and the messages themselves are never consulted again.',
    technical:
      'The dominant style: training is expensive and happens once, prediction is cheap and happens constantly, and the fitted [[model-parameters]] are a fixed-size summary however much data went in. The trade against [[instance-based-learning]] is where the cost sits and how much shape you commit to in advance — a linear model can only ever draw a flat boundary, no matter how many examples it is shown.',
    math:
      'A family $f_{\\boldsymbol\\theta}$ is fixed first, and training compresses $N$ examples into $\\boldsymbol\\theta\\in\\mathbb{R}^{P}$ with $P$ independent of $N$. Prediction then costs $O(P)$ — for a linear model $O(D)$, whether $N$ was $10^{3}$ or $10^{9}$ — while an instance-based method pays $O(ND)$ per query.',
    teachesAt: 'ch02-ml-vocabulary',
    see: ['instance-based-learning', 'model', 'model-parameters'],
  },
];

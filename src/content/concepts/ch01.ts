import type { Concept } from './types';

/**
 * Chapter 1's vocabulary: the words the rest of the course is built on, plus
 * the one piece of geometry — the margin — that the introduction asserts and
 * never shows the working for.
 */
export const conceptsCh01: Concept[] = [
  {
    id: 'machine-learning',
    term: 'machine learning',
    simple:
      'The craft of getting a computer to work something out from examples instead of from instructions. Nobody can write the rule that separates spam from mail, so you hand over thousands of sorted messages and a procedure searches for a rule that reproduces them.',
    technical:
      'An engineering discipline with a three-step shape: collect a [[dataset]], run a learning algorithm over it to produce a [[model]], apply the model to new inputs. What separates it from ordinary programming is that the behavior is *derived* rather than authored; what it costs you is certainty, since the model is right about most inputs rather than every input, and only for as long as new inputs keep resembling the training data.',
    math:
      'A supervised learner picks $f^\\star = \\arg\\min_{f \\in \\mathcal{F}} \\frac{1}{N}\\sum_{i=1}^{N}\\ell(f(\\mathbf{x}_i), y_i)$ out of a chosen family $\\mathcal{F}$. The quantity anyone actually cares about is the expected loss over the true distribution, $\\mathbb{E}_{(\\mathbf{x},y)\\sim\\mathcal{D}}\\left[\\ell(f(\\mathbf{x}),y)\\right]$, which is never computable — every algorithm in this course is a different way of minimizing the first while keeping the second under control.',
    statquest: 'machine learning fundamentals',
    teachesAt: 'ch01-what-is-ml',
    see: ['dataset', 'model', 'generalization'],
  },
  {
    id: 'dataset',
    term: 'dataset',
    simple:
      'The pile of examples the algorithm learns from, and the boundary of everything it will ever know. A pattern absent from the pile cannot come out of the model, however clever the algorithm is.',
    technical:
      '$N$ examples, each a [[feature-vector]] of $D$ numbers, each optionally carrying a [[label]]. The load-bearing assumption is that the examples were drawn independently from the same distribution that will produce future inputs — collect your photographs in daylight and deploy at night and every guarantee in the field evaporates. Later chapters cut one dataset into a [training, validation and test set](sec:ch05-three-sets), which is a discipline rather than a formality.',
    math:
      'Written $\\{(\\mathbf{x}_i, y_i)\\}_{i=1}^{N}$ with $\\mathbf{x}_i \\in \\mathbb{R}^{D}$, or stacked into a design matrix $\\mathbf{X}\\in\\mathbb{R}^{N\\times D}$ — one row per example, one column per feature. The i.i.d. assumption is that $(\\mathbf{x}_i, y_i)\\sim\\mathcal{D}$ independently for every $i$, with $\\mathcal{D}$ unknown and never observed directly.',
    teachesAt: 'ch01-what-is-ml',
    see: ['feature-vector', 'label', 'training-set'],
  },
  {
    id: 'supervised-learning',
    term: 'supervised learning',
    simple:
      'Learning from worked answers. Every example arrives with the correct output attached, the algorithm looks for a rule that would have produced those answers, and then that rule is turned loose on examples that have none.',
    technical:
      'The setting for most of this course. It divides by what the [[label]] is: a finite set of classes makes it [[classification]], a real number makes it [[regression]]. The bottleneck is almost never the algorithm — labels are produced by people and therefore cost money, time and patience, which is exactly why [[semi-supervised-learning]] and [[transfer-learning]] exist at all.',
    math:
      'Given $\\{(\\mathbf{x}_i,y_i)\\}_{i=1}^{N}$, find $f$ minimizing $\\frac{1}{N}\\sum_{i=1}^{N}\\ell(f(\\mathbf{x}_i), y_i)$ over some family of candidate functions. The family fixes what shape the [[decision-boundary]] may take; the loss $\\ell$ fixes what being wrong costs, and changing either changes the answer more than changing the data usually does.',
    teachesAt: 'ch01-types-of-learning',
    see: ['unsupervised-learning', 'label', 'classification', 'regression'],
  },
  {
    id: 'unsupervised-learning',
    term: 'unsupervised learning',
    simple:
      'The same pile of examples with the answers stripped off. With nothing to copy, the algorithm has to report structure it found by itself: which examples belong together, which numbers can be thrown away without losing much, and which examples do not belong at all.',
    technical:
      'Three families cover nearly all of it: [[clustering]] returns a group id, [[dimensionality-reduction]] returns a shorter vector, [[outlier-detection]] returns a strangeness score. The hard part is not the algorithms but the scoring — with no labels there is no unambiguous notion of a correct answer, so results are judged by internal measures and by whether anything downstream got better.',
    math:
      'Given $\\{\\mathbf{x}_i\\}_{i=1}^{N}$ and no $y$, learn a map $g$: into $\\{1,\\dots,K\\}$ for clustering, into $\\mathbb{R}^{D\'}$ with $D\' \\ll D$ for dimensionality reduction, or into a density $p(\\mathbf{x})$ from which a strangeness score follows. Many of these are fitted by maximizing a likelihood over the inputs alone, $\\max_{\\boldsymbol\\theta}\\sum_i \\log p_{\\boldsymbol\\theta}(\\mathbf{x}_i)$.',
    statquest: 'clustering',
    teachesAt: 'ch01-types-of-learning',
    see: ['clustering', 'dimensionality-reduction', 'outlier-detection'],
  },
  {
    id: 'semi-supervised-learning',
    term: 'semi-supervised learning',
    simple:
      'A handful of labeled examples and a mountain of unlabeled ones. The mountain carries no answers, but it does show where the examples crowd together — and knowing that a boundary ought to run through empty ground rather than through a crowd turns out to be worth a great deal.',
    technical:
      'It works when one specific assumption holds: points in the same dense clump share a label, so the [[decision-boundary]] should pass through low-density regions. Under that assumption a thousand unlabeled points sharpen a boundary fitted from twenty labeled ones. When the assumption fails the unlabeled data actively misleads — one of the few techniques in the book that can leave you worse off than ignoring the extra data. [[self-learning|Self-training]] is the simplest recipe.',
    math:
      'Labeled $\\{(\\mathbf{x}_i,y_i)\\}_{i=1}^{l}$ alongside unlabeled $\\{\\mathbf{x}_j\\}_{j=l+1}^{l+u}$, typically with $u \\gg l$. Training minimizes $\\sum_{i=1}^{l}\\ell(f(\\mathbf{x}_i), y_i) + \\lambda\\,\\Omega\\!\\left(f, \\{\\mathbf{x}_j\\}\\right)$, where $\\Omega$ penalizes a boundary that cuts through a dense region and $\\lambda$ prices how far you trust that assumption.',
    teachesAt: 'ch01-types-of-learning',
    see: ['supervised-learning', 'self-learning', 'decision-boundary'],
  },
  {
    id: 'reinforcement-learning',
    term: 'reinforcement learning',
    simple:
      'Learning from consequences rather than from answers. Nobody tells the machine what the right move was; it acts, the world responds with a reward or with nothing, and it has to work out for itself which of its past moves deserve the credit.',
    technical:
      'The machine observes a *state*, takes an *action*, receives a *reward* and lands in a new state; what gets learned is a [[policy]]. Two difficulties have no counterpart in supervised learning. Rewards are delayed — a chess game yields one number after forty moves, and that number must somehow be apportioned across all forty (the credit-assignment problem). And the data is not given: the policy decides which states it will ever visit, so an agent that never explores never discovers the better strategy it was one step away from.',
    math:
      'Formalized as a Markov decision process $(\\mathcal{S}, \\mathcal{A}, P, R, \\gamma)$, with objective $\\pi^\\star = \\arg\\max_{\\pi}\\mathbb{E}\\!\\left[\\sum_{t=0}^{\\infty}\\gamma^{t}r_t\\right]$. The discount $\\gamma\\in[0,1)$ is what gives “long-term” a precise meaning: at $\\gamma = 0.9$ a reward forty steps away is worth $0.9^{40}\\approx 1.5\\%$ of the same reward now.',
    statquest: 'reinforcement learning',
    teachesAt: 'ch01-types-of-learning',
    see: ['policy', 'supervised-learning'],
  },
  {
    id: 'feature-vector',
    term: 'feature vector',
    simple:
      'Everything the machine will ever know about one example, written as a fixed-length list of numbers in a fixed order. Position three means the same thing for every example — if it is height in centimetres for one person, it is height in centimetres for all of them.',
    technical:
      'The common currency: every algorithm here consumes vectors, so text, images and dates must first be turned into numbers by [[feature-engineering]]. Consistency of position is what makes two examples comparable at all. Scale is the standard trap — a feature measured in thousands drowns out every other in any distance or gradient it appears in, which is what [[normalization]] exists to fix.',
    math:
      'The $i$-th example is $\\mathbf{x}_i = \\left[x_i^{(1)}, x_i^{(2)}, \\dots, x_i^{(D)}\\right]\\in\\mathbb{R}^{D}$: the subscript indexes the example, the parenthesized superscript indexes the dimension. So $x^{(2)}$ is the second feature while $\\left(x^{(2)}\\right)^{2}$ is that feature squared — notation unpacked in [Chapter 2](sec:ch02-data-structures).',
    teachesAt: 'ch01-types-of-learning',
    see: ['vector', 'dataset', 'feature-engineering', 'normalization'],
  },
  {
    id: 'label',
    term: 'label',
    simple:
      'The right answer attached to a training example: spam or not spam, the price the house sold for, which of twelve genres the song belongs to. It is what supervised learning imitates, and the reason supervised learning is expensive.',
    technical:
      'A finite label set makes the task [[classification]]; a real-valued one makes it [[regression]]. How a label is *encoded* is an algorithm’s convention rather than a fact about the problem — an SVM wants $\\{-1,+1\\}$, [[logistic-regression]] wants $\\{0,1\\}$, a multiclass network wants a [[one-hot-vector]]. Label noise sets a ceiling nothing downstream can lift: if 5% of your labels are wrong, no amount of capacity recovers the truth underneath them.',
    math:
      'For classification $y_i \\in \\{1,\\dots,C\\}$; for regression $y_i\\in\\mathbb{R}$. The SVM’s $\\pm 1$ encoding is not cosmetic — it is what collapses “correct, and beyond the margin” into the single condition $y_i(\\mathbf{w}\\mathbf{x}_i - b)\\ge 1$ covering both classes at once.',
    teachesAt: 'ch01-types-of-learning',
    see: ['feature-vector', 'classification', 'regression', 'one-hot-vector'],
  },
  {
    id: 'model',
    term: 'model',
    simple:
      'What comes out of training and answers questions. It is a formula with the numbers filled in — not a store of remembered examples, and not anything that understands the problem it was fitted to.',
    technical:
      'A parameterized function together with a set of fitted [[model-parameters]]. Most algorithms are [[model-based-learning|model-based]]: once the parameters are found the training data is discarded, so a classifier trained on 10,000 messages ships as a few thousand numbers. [[instance-based-learning|Instance-based]] methods invert that — they keep the data and do the work at prediction time instead.',
    math:
      'Written $f_{\\boldsymbol\\theta} : \\mathbb{R}^{D}\\to\\mathcal{Y}$, with $\\boldsymbol\\theta$ fitted by minimizing a training objective. A linear SVM has $\\boldsymbol\\theta = (\\mathbf{w}, b)\\in\\mathbb{R}^{D+1}$ and predicts $\\mathrm{sign}(\\mathbf{w}\\mathbf{x} - b)$; the size of $\\boldsymbol\\theta$ depends on $D$ and never on $N$.',
    teachesAt: 'ch01-what-is-ml',
    see: ['model-parameters', 'model-based-learning', 'instance-based-learning'],
  },
  {
    id: 'policy',
    term: 'policy',
    simple:
      'Reinforcement learning’s answer to the model: a rule saying what to do in each situation you might find yourself in. Not a prediction — an instruction.',
    technical:
      'A policy maps states to actions, or to a distribution over actions when deliberate randomness helps exploration. What makes learning one hard is that it feeds itself: the policy decides which states the agent ever visits, so it chooses its own training distribution, and an early mistake can hide the interesting part of the environment indefinitely.',
    math:
      'Deterministic $\\pi:\\mathcal{S}\\to\\mathcal{A}$, or stochastic $\\pi(a\\mid s)$. It is judged by its value function $V^{\\pi}(s) = \\mathbb{E}\\!\\left[\\sum_{t\\ge 0}\\gamma^{t}r_t \\mid s_0 = s\\right]$, and an optimal $\\pi^\\star$ is one whose value is at least as high as every other policy’s in every state at once — for a finite MDP such a policy always exists.',
    teachesAt: 'ch01-types-of-learning',
    see: ['reinforcement-learning', 'model'],
  },
  {
    id: 'bag-of-words',
    term: 'bag of words',
    simple:
      'Tip a document into a bag and shake until the word order falls out. What is left is a tally: for every word in a fixed dictionary, did this document contain it. The tally is the same length for every document, which is exactly what a learning algorithm needs.',
    technical:
      'Fix a dictionary of $V$ words; feature $j$ records word $j$’s presence, its count, or its TF-IDF weight. Word order and syntax are discarded entirely — “dog bites man” and “man bites dog” give identical vectors — and for topic-flavoured tasks such as spam detection that loss turns out to be survivable. The vectors are enormous and almost all zero, which is why sparse storage, linear models and [[cosine-similarity]] are its natural companions; [[word-embeddings]] are the modern answer where order and meaning genuinely matter.',
    math:
      'With a dictionary of $V$ words, $x^{(j)} = \\mathbb{1}\\!\\left[\\text{word } j \\text{ occurs}\\right]$, so $\\mathbf{x}\\in\\{0,1\\}^{V}$. For $V = 20{,}000$ and an email of a couple of hundred distinct words, roughly $1\\%$ of the entries are non-zero — a [[dot-product]] therefore costs $O(\\text{non-zeros})$ rather than $O(V)$.',
    teachesAt: 'ch01-how-supervised-works',
    see: ['feature-vector', 'cosine-similarity', 'word-embeddings'],
  },
  {
    id: 'support-vector-machine',
    term: 'support vector machine',
    simple:
      'Of all the straight lines that keep two groups of points apart, an SVM picks the one with the widest empty corridor around it. The reasoning: a boundary with room on both sides can afford to be slightly wrong about where the groups really sit.',
    technical:
      'A maximum-[[margin]] linear classifier. Its training problem is convex, so there is one global solution and no random restarts; its answer depends only on the handful of [[support-vector|support vectors]] touching the corridor, and deleting every other example changes nothing at all. Two limitations get repaired in [Chapter 3](sec:ch03-svm): overlapping classes need the [[soft-margin-svm|soft margin]], and curved boundaries need the [[kernel-trick]].',
    math:
      'Predict $f(\\mathbf{x}) = \\mathrm{sign}(\\mathbf{w}\\mathbf{x} - b)$. Training solves $\\min_{\\mathbf{w},b}\\tfrac{1}{2}\\|\\mathbf{w}\\|^{2}$ subject to $y_i(\\mathbf{w}\\mathbf{x}_i - b)\\ge 1$ for every $i$: a quadratic objective under linear constraints, i.e. a quadratic program. Minimizing $\\|\\mathbf{w}\\|$ and maximizing the corridor width $2/\\|\\mathbf{w}\\|$ are the same instruction written two ways.',
    statquest: 'support vector machines',
    teachesAt: 'ch01-how-supervised-works',
    see: ['margin', 'hyperplane', 'support-vector', 'soft-margin-svm', 'kernel-trick'],
  },
  {
    id: 'hyperplane',
    term: 'hyperplane',
    simple:
      'The flat thing that cuts a space into two halves. On a page it is a line, in a room it is a sheet of glass, and in the twenty-thousand-dimensional space of email vectors it is something with no picture at all — but the algebra is identical in every case.',
    technical:
      'In $D$ dimensions a hyperplane is a flat $(D{-}1)$-dimensional slice. The weight vector $\\mathbf{w}$ is its *normal*: it points at right angles to the surface, so $\\mathbf{w}$ fixes the orientation while $b$ fixes how far the surface sits from the origin. Flatness is precisely the limitation of a linear model — no straight cut separates two concentric rings — and it is the limitation the [[kernel-trick]] gets around.',
    math:
      'The set $\\{\\mathbf{x} : \\mathbf{w}\\mathbf{x} - b = 0\\}$. The signed distance from any point to it is $\\dfrac{\\mathbf{w}\\mathbf{x} - b}{\\|\\mathbf{w}\\|}$, which is why the raw score $\\mathbf{w}\\mathbf{x} - b$ only becomes a confidence after you divide by $\\|\\mathbf{w}\\|$; the plane’s own offset from the origin is $b/\\|\\mathbf{w}\\|$.',
    statquest: 'support vector machines',
    teachesAt: 'ch01-how-supervised-works',
    see: ['decision-boundary', 'margin', 'vector', 'dot-product'],
  },
  {
    id: 'decision-boundary',
    term: 'decision boundary',
    simple:
      'The frontier drawn across the space of possible examples where the model changes its mind. Step across it and the answer flips from one class to the other.',
    technical:
      'Every classifier has one, whether or not it is written down anywhere, and its *shape* is the real difference between algorithms. A linear model gives a [[hyperplane]], a [[decision-tree]] gives an axis-aligned staircase, [[k-nearest-neighbors|kNN]] gives a jagged polygon that follows the data, and an [[rbf-kernel|RBF]] SVM gives smooth closed curves that can enclose an island. Choosing an algorithm is largely choosing which shape you are willing to believe in.',
    math:
      'For a scoring function $f$ and threshold $\\tau$ it is the level set $\\{\\mathbf{x} : f(\\mathbf{x}) = \\tau\\}$. For the SVM that is $\\mathbf{w}\\mathbf{x} - b = 0$; for [[logistic-regression]] at a threshold of $0.5$ it is $\\sigma(\\mathbf{w}\\mathbf{x}+b) = 0.5$, the identical straight line — the sigmoid changes the reported confidence, not the boundary.',
    teachesAt: 'ch01-how-supervised-works',
    see: ['hyperplane', 'margin', 'logistic-regression', 'decision-tree'],
  },
  {
    id: 'margin',
    term: 'margin',
    simple:
      'The width of the empty corridor between the boundary and the closest points on either side of it. Any line that separates the two groups scores full marks on the data you already have; the margin is how you choose between them, and it is a bet about the data you have not seen.',
    technical:
      'The geometric margin is the distance from the boundary to the nearest example. A wide one means the boundary could be nudged in any direction without changing a single prediction, so the natural scatter of future examples is absorbed instead of misclassified. There is a scaling subtlety worth holding on to: $\\mathbf{w}\\mathbf{x} - b = 0$ and $10\\mathbf{w}\\mathbf{x} - 10b = 0$ describe the same line, so a raw score means nothing on its own. SVMs remove the ambiguity by *declaring* the nearest points to score $\\pm 1$, after which the corridor is pinned at $2/\\|\\mathbf{w}\\|$.',
    math:
      'The functional margin of example $i$ is $y_i(\\mathbf{w}\\mathbf{x}_i - b)$; dividing by $\\|\\mathbf{w}\\|$ converts it into an actual distance. Fixing the smallest functional margin at 1 makes each side $1/\\|\\mathbf{w}\\|$ wide and the corridor $2/\\|\\mathbf{w}\\|$. Concretely, $\\mathbf{w} = [0.5,\\,0.5]$ gives $\\|\\mathbf{w}\\| = \\sqrt{0.5}\\approx 0.707$ and a corridor of $2/0.707\\approx 2.83$ units.',
    statquest: 'support vector machines',
    teachesAt: 'ch01-how-supervised-works',
    see: ['support-vector-machine', 'hyperplane', 'generalization', 'soft-margin-svm'],
  },
  {
    id: 'model-parameters',
    term: 'parameters',
    simple:
      'The numbers inside the model that training is allowed to change. Before training they are arbitrary; afterwards they are the entire product — everything the algorithm learned, and all of it that gets kept.',
    technical:
      'Parameters are fitted from data; [[hyperparameter|hyperparameters]] are chosen by you beforehand and steer *how* the fitting happens. Mixing the two up is the classic beginner error, and the test is quick: if the algorithm can adjust it by looking at the training set, it is a parameter. Their count is a rough proxy for [[model-capacity|capacity]], and therefore for how readily a model will [[overfitting|overfit]].',
    math:
      'Collected as $\\boldsymbol\\theta$, with training defined as $\\boldsymbol\\theta^{\\star} = \\arg\\min_{\\boldsymbol\\theta} J(\\boldsymbol\\theta)$ for an objective $J$. A linear SVM over a 20,000-word dictionary carries $\\boldsymbol\\theta = (\\mathbf{w}, b)\\in\\mathbb{R}^{20{,}001}$, and those 20,001 numbers replace the 10,000 training emails completely.',
    teachesAt: 'ch01-how-supervised-works',
    see: ['model', 'hyperparameter', 'model-capacity'],
  },
  {
    id: 'generalization',
    term: 'generalization',
    simple:
      'Doing well on examples nobody has seen yet. It is the only thing that matters, and it is not the same as doing well on the examples you trained on — a model that memorized the training set scores perfectly there and can be worthless everywhere else.',
    technical:
      'It rests on one assumption: future examples come from the same distribution as the training ones. Granted that, more data helps and a boundary that does not hug individual points helps — a [[margin|wide margin]] is one way of buying it, [[regularization]] another. When the assumption breaks, because the world moved or the sensor was replaced, nothing in the training procedure warns you, which is why deployed models are monitored rather than trusted.',
    math:
      'The gap between true risk $R(f) = \\mathbb{E}_{(\\mathbf{x},y)\\sim\\mathcal{D}}\\left[\\ell(f(\\mathbf{x}),y)\\right]$ and the empirical risk $\\hat{R}(f)$ measured on the training set. Learning theory bounds it in the shape $R(f)\\le\\hat{R}(f) + O\\!\\left(\\sqrt{h/N}\\right)$, where $h$ measures the richness of the model family: more data shrinks the gap, more capacity widens it.',
    statquest: 'bias and variance',
    teachesAt: 'ch01-why-it-works',
    see: ['pac-learning', 'overfitting', 'margin', 'bias-variance-tradeoff'],
  },
  {
    id: 'pac-learning',
    term: 'PAC learning',
    simple:
      'The theory that admits you can never be certain, only probably nearly right — and then makes the admission precise enough to be useful. It answers the practical question: how many examples before I can trust this?',
    technical:
      'Probably Approximately Correct, due to Leslie Valiant in 1984. A model family is PAC-learnable if, for any tolerance and any confidence level, some algorithm finds a hypothesis inside that tolerance that often, using a number of examples polynomial in both. The payoff is not a number you compute in practice — the bounds are far too loose for that — but the shape of the trade-off: richer families need more data to earn the same guarantee.',
    math:
      'The requirement is $\\Pr\\!\\left[R(f)\\le\\epsilon\\right]\\ge 1-\\delta$, with $\\epsilon$ the error you will accept and $\\delta$ how often you will accept being unlucky. For a finite hypothesis set the sample complexity is $N \\ge \\frac{1}{\\epsilon}\\left(\\ln|\\mathcal{H}| + \\ln\\frac{1}{\\delta}\\right)$; for infinite families $\\ln|\\mathcal{H}|$ is replaced by the VC dimension, which for a [[hyperplane]] in $\\mathbb{R}^{D}$ is $D+1$.',
    teachesAt: 'ch01-why-it-works',
    see: ['generalization', 'model-capacity'],
  },
];

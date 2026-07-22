import type { Chapter } from '../schema';

/** Chapter 3 — Fundamental Algorithms (book pp. 3–16 of ch. 3), paraphrased in original words. */
export const ch03: Chapter = {
  id: 'ch03',
  number: 3,
  title: 'Fundamental Algorithms',
  subtitle: 'Linear regression, logistic regression, trees, SVM, kNN',
  pdfPages: [22, 35],
  badgeId: 'ch03',
  softPrereq: 'ch01',
  sections: [
    {
      id: 'ch03-linear-regression',
      title: 'Linear Regression',
      minutes: 7,
      blocks: [
        {
          type: 'p',
          md:
            'This chapter tours five algorithms that earn their place twice over: each is genuinely useful on its own, and each is a building block inside fancier methods. First up is the workhorse of prediction: **[[linear-regression]]**. You have labeled examples $\\{(\\mathbf{x}_i, y_i)\\}_{i=1}^N$ where every target $y_i$ is a *real number* — a price, a temperature, a weight — so this is a [[regression]] task rather than a [[classification]] one, and you want a [[model]] that predicts the target as a **linear combination** of the [[feature-vector|features]]:',
        },
        {
          type: 'formula',
          tex: 'f_{w,b}(x) = wx + b',
          parts: [
            { tex: 'f_{w,b}(x)', label: 'the prediction for input x' },
            { tex: '=' },
            { tex: 'wx', label: 'how steeply the answer follows x' },
            { tex: '+' },
            { tex: 'b', label: 'where the line starts' },
          ],
          terms: [
            { tex: 'f_{w,b}', explain: 'the model, parametrized by exactly two values: w and b' },
            { tex: 'w', explain: 'the slope — how much the prediction changes per unit of x (a vector \\mathbf{w} when there are many features)' },
            { tex: 'x', explain: 'the feature (or feature vector) of the example being predicted' },
            { tex: 'b', explain: 'the intercept — the prediction when x = 0' },
          ],
        },
        {
          type: 'p',
          md:
            'Look familiar? It is the [[support-vector-machine|SVM]] expression from [Chapter 1](sec:ch01-how-supervised-works) minus the sign operator. But the *role* of the [[hyperplane]] flips completely. The SVM hyperplane is a fence: it must sit **as far as possible** from the two groups it separates. The regression hyperplane is a clothesline: it must run **as close as possible** to every training point, because we read predictions directly off it. A line far from the dots would produce nonsense for new inputs.',
        },
        {
          type: 'p',
          md:
            'How do we measure "close to all points"? With an **[[optimization-criterion|objective]]** — the expression we minimize. Linear regression minimizes the average of squared differences between predictions and targets, the **[[mean-squared-error|mean squared error]]**:',
        },
        {
          type: 'formula',
          tex: '\\frac{1}{N} \\sum_{i=1}^{N} (f_{w,b}(\\mathbf{x}_i) - y_i)^2',
          parts: [
            { tex: '\\frac{1}{N} \\sum_{i=1}^{N}', label: 'averaged over all N examples' },
            {
              tex: '\\big(f_{w,b}(\\mathbf{x}_i) - y_i\\big)^2',
              label: 'one example’s miss, squared',
            },
          ],
          terms: [
            { tex: '(f_{w,b}(\\mathbf{x}_i) - y_i)^2', explain: 'the [[loss-function|loss function]] — here [[squared-loss|squared error loss]], the penalty one example charges the model' },
            { tex: '\\frac{1}{N}\\sum', explain: 'averaging losses over all N examples gives the cost function, also called the empirical risk' },
          ],
        },
        {
          type: 'p',
          md:
            'Why *squared*? Absolute differences would make sense too, and so would cubes — many design choices in ML are less inevitable than they look. The square won for practical reasons dating back to Legendre in 1705: it is **[[differentiable|smooth]]** (the absolute value has no continuous [[derivative]] at zero), and a smooth objective lets you set the [[gradient]] to zero and solve a **[[closed-form-solution|closed-form]]** system of equations — no iterative search needed. Squaring also exaggerates big misses, which pushes the line away from gross errors. Bonus: a model this simple rarely **[[overfitting|overfits]]** — it almost never memorizes noise.',
        },
        {
          type: 'widget',
          id: 'RegressionLab',
          challenge: {
            id: 'ch03-challenge-regression',
            label: 'get within 5% of the best possible MSE',
            xp: 15,
          },
        },
        {
          type: 'hint',
          md:
            '[[overfitting|Overfitting]] preview: fit these same dots with a degree-10 polynomial and it will thread through nearly every one — then predict garbage between them. [Chapter 5](sec:ch05-overfitting) deals with this properly.',
        },
        {
          type: 'quiz',
          id: 'ch03-q-linreg',
          questions: [
            {
              kind: 'mcq',
              id: 'ch03-q-linreg-1',
              prompt: 'What does linear regression minimize to find $w^*$ and $b^*$?',
              choices: [
                'The distance from the line to the closest training example',
                'The average squared gap between predictions and targets',
                'The number of training points that fall on the wrong side',
                'The combined absolute size of the learned weights',
              ],
              answer: 1,
              explain:
                'The objective is the mean squared error: the squared-error loss of each example, averaged over the whole training set. Distance to the *closest* example is what an SVM cares about, and "wrong side" only makes sense for a classifier.',
            },
            {
              kind: 'mcq',
              id: 'ch03-q-linreg-2',
              prompt: 'SVM and linear regression both use $\\mathbf{w}\\mathbf{x} + b$-style expressions. The key difference in the hyperplane’s job is:',
              choices: [
                'SVM needs many more features than regression does to work',
                'there is no real difference — the two fit the same line',
                'SVM wants it far from the examples; regression wants it close',
                'regression requires the data to be linearly separable',
              ],
              answer: 2,
              explain:
                'A decision boundary earns generalization by keeping its distance from both classes; a regression line earns accuracy by hugging the data, because predictions are read straight off it. Separability is a classification concern and has no meaning for regression.',
            },
            {
              kind: 'numeric',
              id: 'ch03-q-linreg-3',
              prompt:
                'A model predicts 4 and 6; the true targets are 3 and 9. Compute the MSE (average of squared errors).',
              answer: 5,
              tolerance: 0.01,
              explain: 'Errors are $1$ and $3$; squares are $1$ and $9$; the mean is $(1+9)/2 = 5$.',
            },
            {
              kind: 'tf',
              id: 'ch03-q-linreg-4',
              prompt:
                'Squared loss is preferred over absolute loss partly because it has a continuous derivative, enabling closed-form solutions.',
              answer: true,
              explain:
                '|x| kinks at zero, which blocks the neat calculus. The smooth square lets you set the gradient to zero and solve directly — Legendre called it "convenient".',
            },
          ],
        },
      ],
    },
    {
      id: 'ch03-logistic-regression',
      title: 'Logistic Regression',
      minutes: 7,
      blocks: [
        {
          type: 'p',
          md:
            'The name lies to you once: **[[logistic-regression]] is not regression** — it is a *[[binary-classification|classification]]* algorithm. The name is inherited from statistics, because its math looks so much like [[linear-regression|linear regression]]’s. The problem it solves: you want a linear model, but your [[label|labels]] are 0 or 1, while $wx + b$ happily outputs anything from $-\\infty$ to $+\\infty$. You need a squashing function whose output lives in $(0, 1)$ — then you can read the output as a *probability of being positive*.',
        },
        {
          type: 'formula',
          tex: 'f(x) = \\frac{1}{1 + e^{-x}}',
          terms: [
            { tex: 'e', explain: 'Euler’s number, the base of the natural logarithm; e^x is exp(x) in most languages' },
            { tex: 'e^{-x}', explain: 'huge for very negative x (output → 0), tiny for very positive x (output → 1)' },
          ],
        },
        {
          type: 'p',
          md:
            'This S-shaped curve is the **standard logistic function**, better known as the **[[sigmoid]]**. Feed it the familiar linear score and you get the logistic regression model: $f_{\\mathbf{w},b}(\\mathbf{x}) = 1 / (1 + e^{-(\\mathbf{w}\\mathbf{x} + b)})$. Its output is interpreted as $p(y{=}1 \\mid \\mathbf{x})$; if it is at least a [[decision-threshold|threshold]] (usually $0.5$), predict positive, otherwise negative. Note the anchor point: $\\sigma(0) = 0.5$, so the [[decision-boundary|decision boundary]] sits exactly where $\\mathbf{w}\\mathbf{x} + b = 0$.',
        },
        {
          type: 'p',
          md:
            'Training does *not* minimize [[squared-loss|squared error]] here. Instead we use **[[maximum-likelihood|maximum likelihood]]**: choose $\\mathbf{w}, b$ to make the labels we actually observed as probable as possible under the model. One example’s [[likelihood]] is $f(\\mathbf{x}_i)$ if $y_i = 1$ and $1 - f(\\mathbf{x}_i)$ if $y_i = 0$; assuming independent observations, the dataset’s likelihood is the **[[capital-pi-notation|product]]** of all of them — probabilities multiply, like coin flips.',
        },
        {
          type: 'math',
          tex: 'L_{\\mathbf{w},b} = \\prod_{i=1}^{N} f_{\\mathbf{w},b}(\\mathbf{x}_i)^{y_i}\\,(1 - f_{\\mathbf{w},b}(\\mathbf{x}_i))^{(1-y_i)}',
        },
        {
          type: 'p',
          md:
            'In practice we maximize the **[[log-likelihood|log-likelihood]]** $\\sum_i y_i \\ln f(\\mathbf{x}_i) + (1-y_i)\\ln(1 - f(\\mathbf{x}_i))$ instead: $\\ln$ is strictly increasing, so the best $(\\mathbf{w}, b)$ is unchanged, and sums of logs are far friendlier than products of many numbers between 0 and 1. One more contrast with linear regression: there is **no [[closed-form-solution|closed-form solution]]** this time. The optimum is found numerically — typically with **[[gradient-descent]]**, the subject of [Chapter 4](sec:ch04-gradient-descent).',
        },
        {
          type: 'widget',
          id: 'SigmoidExplorer',
          challenge: {
            id: 'ch03-challenge-sigmoid',
            label: 'reach log-likelihood above −6',
            xp: 15,
          },
        },
        {
          type: 'hint',
          md:
            'Log-likelihood is always ≤ 0, since it is a sum of logs of probabilities. A perfect, infinitely confident model would approach 0 — with noisy labels, the best you can do is "close-ish".',
        },
        {
          type: 'quiz',
          id: 'ch03-q-logreg',
          questions: [
            {
              kind: 'tf',
              id: 'ch03-q-logreg-1',
              prompt: 'Despite the name, logistic regression solves classification problems.',
              answer: true,
              explain:
                'The "regression" in the name is a historical artifact from statistics — the model outputs a class probability, not a real-valued target.',
            },
            {
              kind: 'numeric',
              id: 'ch03-q-logreg-2',
              prompt: 'What is the value of the sigmoid function at $x = 0$?',
              answer: 0.5,
              tolerance: 0.001,
              explain:
                '$1/(1+e^{0}) = 1/2$. That is why the 0.5-threshold decision boundary sits exactly at $\\mathbf{w}\\mathbf{x} + b = 0$.',
            },
            {
              kind: 'mcq',
              id: 'ch03-q-logreg-3',
              prompt: 'Why maximize the *log*-likelihood rather than the likelihood itself?',
              choices: [
                'taking the log makes the fitted model measurably more accurate',
                'the raw likelihood has no formula and cannot be computed',
                'the log converts the classification task back into regression',
                'ln preserves the maximizer and turns the product into a sum',
              ],
              answer: 3,
              explain:
                'Same argmax, nicer math. Because $\\ln$ is strictly increasing, whatever maximizes $L$ also maximizes $\\ln L$ — and a product of many small probabilities, which underflows to zero on a computer, becomes a well-behaved sum of logs.',
            },
            {
              kind: 'mcq',
              id: 'ch03-q-logreg-4',
              prompt: 'How is the optimum of logistic regression’s objective found?',
              choices: [
                'numerically, with an iterative method like gradient descent',
                'by the same closed-form equations as linear regression',
                'by sorting the examples and scanning for a threshold',
                'by exhaustively trying every possible $(\\mathbf{w}, b)$ pair',
              ],
              answer: 0,
              explain:
                'Unlike least squares, maximum likelihood for the sigmoid model has no closed-form solution — you cannot set the gradient to zero and solve. So the optimum is climbed towards iteratively, typically with gradient descent (Chapter 4).',
            },
          ],
        },
      ],
    },
    {
      id: 'ch03-decision-trees',
      title: 'Decision Trees',
      minutes: 8,
      blocks: [
        {
          type: 'p',
          md:
            'A **[[decision-tree|decision tree]]** plays twenty questions with your [[feature-vector|feature vector]]. It is an acyclic graph: each branching node examines one feature — *is $x^{(j)}$ below threshold $t$?* — and sends the example left or right; each **[[leaf-node|leaf]]** announces a class. Unlike [[logistic-regression|logistic regression]], which finds an *optimal* $(\\mathbf{w}^*, b^*)$ for a fixed formula, tree learning builds a **[[non-parametric-model|non-parametric]]** model piece by piece, approximately. The classic formulation covered in the book is **[[id3|ID3]]**.',
        },
        {
          type: 'p',
          md:
            'ID3 starts with every labeled example in a single node, predicting just the average label. Then it searches all features $j$ and all thresholds $t$, imagines splitting the set $\\mathcal{S}$ into $\\mathcal{S}_-$ (examples with $x^{(j)} < t$) and $\\mathcal{S}_+$ (the rest), and asks: *which split leaves the least uncertainty behind?* Uncertainty is measured by **[[entropy]]** — maximal when classes are perfectly mixed, zero when a set is pure:',
        },
        {
          type: 'formula',
          tex: 'H(\\mathcal{S}) = -p \\log_2 p - (1-p)\\log_2(1-p)',
          parts: [
            { tex: 'H(\\mathcal{S})', label: 'how mixed the set is, in bits' },
            { tex: '=' },
            { tex: '-p \\log_2 p', label: 'the surprise coming from the 1s' },
            { tex: '-' },
            { tex: '(1-p)\\log_2(1-p)', label: 'and the surprise from the 0s' },
          ],
          terms: [
            { tex: 'p', explain: 'the fraction of examples in the set labeled 1' },
            { tex: '\\log_2', explain: 'base-2 logarithm measures entropy in bits; the book uses ln — the shape and the argmin are the same' },
            { tex: 'H', explain: '1 bit for a 50/50 mix (useless leaf!), 0 for a pure set' },
          ],
        },
        {
          type: 'formula',
          tex: 'H(\\mathcal{S}_-, \\mathcal{S}_+) = \\frac{|\\mathcal{S}_-|}{|\\mathcal{S}|} H(\\mathcal{S}_-) + \\frac{|\\mathcal{S}_+|}{|\\mathcal{S}|} H(\\mathcal{S}_+)',
          parts: [
            { tex: 'H(\\mathcal{S}_-, \\mathcal{S}_+)', label: 'how mixed the two branches are, together' },
            { tex: '=' },
            { tex: '\\frac{|\\mathcal{S}_-|}{|\\mathcal{S}|}', label: 'the share going left' },
            { tex: 'H(\\mathcal{S}_-)', label: 'times that branch’s own entropy' },
            { tex: '+' },
            { tex: '\\frac{|\\mathcal{S}_+|}{|\\mathcal{S}|}', label: 'the share going right' },
            { tex: 'H(\\mathcal{S}_+)', label: 'times its entropy' },
          ],
          terms: [
            { tex: '\\frac{|\\mathcal{S}_-|}{|\\mathcal{S}|}', explain: 'each branch’s entropy is weighted by the fraction of examples that flow into it' },
            { tex: 'H(\\mathcal{S}_-, \\mathcal{S}_+)', explain: 'the weighted entropy of the split — ID3 picks the split minimizing this' },
          ],
        },
        {
          type: 'p',
          md:
            'The drop from $H(\\mathcal{S})$ to the weighted entropy after splitting is the **[[information-gain|information gain]]** — how many bits of uncertainty the question removes. ID3 greedily takes the best split, then recurses into each branch. It stops splitting a node when: the node is already pure, no attribute is left to split on, the best gain falls below some $\\epsilon$, or the tree hits a maximum depth $d$ ($\\epsilon$ and $d$ are [[hyperparameter|hyperparameters]], found experimentally).',
        },
        {
          type: 'p',
          md:
            'Note the word **[[greedy-algorithm|greedy]]**: each split is chosen by its *local* benefit, with no lookahead to future splits — so ID3 does **not** guarantee the globally optimal tree (backtracking during search can improve it, at a price). The most widely used refinement, **C4.5**, handles continuous *and* discrete features, tolerates missing values, and fights [[overfitting]] with **[[pruning]]**: grow the tree fully, then walk back through it and replace branches that don’t pull their weight with leaves.',
        },
        {
          type: 'widget',
          id: 'TreeBuilder',
          challenge: {
            id: 'ch03-challenge-tree',
            label: 'reach pure leaves in at most 3 splits',
            xp: 15,
          },
        },
        {
          type: 'quiz',
          id: 'ch03-q-trees',
          questions: [
            {
              kind: 'numeric',
              id: 'ch03-q-trees-1',
              prompt:
                'A node holds 6 edible and 6 poisonous mushrooms. What is its entropy in bits?',
              answer: 1,
              tolerance: 0.01,
              explain:
                'A perfect 50/50 mix is maximum uncertainty: $-0.5\\log_2 0.5 - 0.5\\log_2 0.5 = 1$ bit.',
            },
            {
              kind: 'mcq',
              id: 'ch03-q-trees-2',
              prompt: 'Among candidate splits, ID3 chooses the one that…',
              choices: [
                'splits the set into two subsets of exactly equal size',
                'minimizes the weighted entropy of the two subsets',
                'uses the feature whose values have the widest range',
                'maximizes the number of levels the finished tree has',
              ],
              answer: 1,
              explain:
                'The lowest weighted entropy after the split is the same thing as the highest information gain — the most uncertainty removed per question. How evenly the examples divide, and how large the feature values happen to be, do not enter into it.',
            },
            {
              kind: 'tf',
              id: 'ch03-q-trees-3',
              prompt:
                'Because each ID3 split decision is local, the algorithm is guaranteed to find the smallest possible tree.',
              answer: false,
              explain:
                'Greedy means no lookahead: a split that looks best now can force extra splits later. ID3 gives a good tree, not a provably optimal one.',
            },
            {
              kind: 'mcq',
              id: 'ch03-q-trees-4',
              prompt: 'What is *pruning* in C4.5?',
              choices: [
                'dropping every training example with a missing value',
                'discarding any feature whose numeric values grow too large',
                'growing the full tree, then cutting weak branches back to leaves',
                'stopping the recursion as soon as the first split is made',
              ],
              answer: 2,
              explain:
                'Pruning is a bottom-up cleanup pass that runs *after* the tree is fully grown: branches that do not contribute enough error reduction to justify themselves get collapsed into leaf nodes. It is C4.5’s main defense against overfitting.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch03-svm',
      title: 'Support Vector Machines',
      minutes: 10,
      blocks: [
        {
          type: 'p',
          md:
            '[Chapter 1](sec:ch01-how-supervised-works) left the [[support-vector-machine|SVM]] with a [[decision-boundary|boundary]] $\\mathbf{w}\\mathbf{x} - b = 0$, the constraints $y_i(\\mathbf{w}\\mathbf{x}_i - b) \\ge 1$, and the goal of minimizing $\\|\\mathbf{w}\\|$ (equivalently $\\frac{1}{2}\\|\\mathbf{w}\\|^2$, which suits quadratic-programming solvers). Widening the [[margin]] is the whole game — and here is the detail that makes everything below possible: only the examples sitting *on* the margin hold it in place. Those few are the **[[support-vector|support vectors]]**. Delete any other point and the boundary does not budge, which means the fitted model depends on the data through a mere handful of examples. Two hard questions remained, though. **One:** what if noise, outliers or mislabeled points make perfect separation impossible? **Two:** what if the true boundary isn’t a line at all — say, one class forms a ring around the other?',
        },
        {
          type: 'formula',
          tex: '\\max(0,\\; 1 - y_i(\\mathbf{w}\\mathbf{x}_i - b))',
          parts: [
            { tex: '\\max\\big(0,', label: 'zero once the point sits safely on its own side' },
            {
              tex: '1 - y_i(\\mathbf{w}\\mathbf{x}_i - b)',
              label: 'how far it strays into the margin, or past it',
            },
            { tex: '\\big)' },
          ],
          terms: [
            { tex: '\\max(0, \\cdot)', explain: 'zero when the example is on the correct side with room to spare (constraint satisfied) — see [[hinge-loss]]' },
            { tex: '1 - y_i(\\mathbf{w}\\mathbf{x}_i - b)', explain: 'grows the further a point strays past the [[margin]] onto the wrong side' },
          ],
        },
        {
          type: 'p',
          md:
            'Question one is answered by the **[[hinge-loss|hinge loss]]** above. Instead of demanding every constraint hold, the **[[soft-margin-svm|soft-margin SVM]]** minimizes a compromise between margin width ($\\|\\mathbf{w}\\|^2$) and average hinge loss, weighted by a [[hyperparameter]] written [[svm-c|C]]. In the convention used by our playground below, high $C$ makes violations expensive — the boundary contorts to classify everything — while low $C$ shrugs off a few mistakes to keep the margin wide. Wide margins [[generalization|generalize]]; zero training errors on noisy data usually don’t. $C$ is chosen experimentally, like ID3’s $\\epsilon$ and $d$.',
        },
        {
          type: 'p',
          md:
            'Question two has one of the most elegant answers in ML. If the classes aren’t linearly separable in the original space, *map them into a higher-dimensional space* where they are — a circle of points becomes a liftable bowl in 3D. Doing that mapping $\\phi$ explicitly would be brutally expensive. But the SVM optimization (in its Lagrange-multiplier form) touches the data **only through [[dot-product|dot products]]** $\\mathbf{x}_i \\mathbf{x}_k$. So we swap in a **[[kernel-function|kernel function]]** that returns what the dot product *would be* in the high-dimensional space, without ever going there: that is **[[kernel-trick]]**. Example: $k(\\mathbf{x}_i, \\mathbf{x}_k) = (\\mathbf{x}_i \\mathbf{x}_k)^2$ behaves exactly like mapping $(q_1, q_2) \\mapsto (q_1^2, \\sqrt{2} q_1 q_2, q_2^2)$ first — squaring one number in 2D does the work of a dot product in 3D.',
        },
        {
          type: 'p',
          md:
            'That squaring kernel gives you conic boundaries, but you have to pick the right polynomial degree for each dataset. So in practice almost nobody starts there. The default first choice is the **[[rbf-kernel|RBF kernel]]** — short for *radial basis function*, and also called the Gaussian kernel — and the way to understand it is to stop thinking about mapping points anywhere at all. Think about **similarity** instead. Ask two examples a single question: *how close together are you?* Points sitting on top of each other are maximally similar and score $1$. Slide them apart and the score fades smoothly toward $0$. Crucially the score depends on the **distance** between them and nothing else — not their direction, not where they sit on the plane — and that is precisely what the word *radial* is telling you. Written down, the fading is a bell curve over distance:',
        },
        {
          type: 'formula',
          tex: "k(\\mathbf{x}, \\mathbf{x}') = \\exp\\left(-\\frac{\\|\\mathbf{x} - \\mathbf{x}'\\|^2}{2\\sigma^2}\\right)",
          parts: [
            { tex: "k(\\mathbf{x}, \\mathbf{x}')", label: 'how similar two points are' },
            { tex: '=' },
            {
              tex: "\\exp\\left(-\\frac{\\|\\mathbf{x} - \\mathbf{x}'\\|^2}{2\\sigma^2}\\right)",
              label: '1 when identical, fading fast as they separate',
            },
          ],
          terms: [
            { tex: "\\|\\mathbf{x} - \\mathbf{x}'\\|^2", explain: 'squared [[euclidean-distance|Euclidean distance]] between the two feature vectors — the only thing the kernel ever looks at' },
            { tex: '\\sigma', explain: 'how fast similarity fades with distance: the smooth-vs-curvy dial, usually written as [[gamma-rbf|γ]] = 1/(2σ²)' },
            { tex: 'k', explain: 'the [[rbf-kernel|RBF kernel]] — a bell curve over distance, whose implicit feature space has infinitely many dimensions' },
          ],
        },
        {
          type: 'p',
          md:
            'Read the *picture* rather than the algebra. Every training example plants a soft bump centered on itself — positive for one class, negative for the other — and the boundary runs along the line where the bumps exactly cancel. Nothing about that line has to be straight: it can wrap around a cluster, enclose an island, or break into several disconnected pieces. That is question two, answered. The width of each bump is the one dial you have to set, written $\\sigma$ or, more often, [[gamma-rbf|γ]] $= 1/(2\\sigma^2)$. **Small γ** means broad, heavily overlapping bumps, and the boundary comes out smooth and nearly straight — it can [[underfitting|underfit]]. **Large γ** shrinks every bump to a pinprick around its own point, and the model stops generalizing and starts [[overfitting|memorizing]]. Because the RBF feature space is infinite-dimensional, a large enough γ can separate *any* finite dataset perfectly, noise included — which is a warning, not a feature. γ and [[svm-c|C]] have to be tuned together, and [Chapter 5](sec:ch05-tuning) shows how.',
        },
        {
          type: 'widget',
          id: 'MarginPlayground',
          challenge: {
            id: 'ch03-challenge-svm',
            label: 'separate the rings with the RBF kernel',
            xp: 15,
          },
        },
        {
          type: 'hint',
          md:
            'Two honesty notes: the book writes the soft-margin cost as $C\\|\\mathbf{w}\\|^2 + $ average hinge, so *its* $C$ plays the mirrored role of ours (most libraries use ours). And the playground’s RBF machine is a **[[kernel-perceptron|kernel perceptron]]** — the same kernel trick with a simpler trainer than a full SVM, which is why it refits instantly while you drag a slider.',
        },
        {
          type: 'quiz',
          id: 'ch03-q-svm',
          questions: [
            {
              kind: 'mcq',
              id: 'ch03-q-svm-1',
              prompt:
                'A training point satisfies $y_i(\\mathbf{w}\\mathbf{x}_i - b) = 2$. Its hinge loss is:',
              choices: ['1', '2', '−1', '0'],
              answer: 3,
              explain:
                '$\\max(0, 1 - 2) = 0$: points on the correct side, beyond the margin, cost nothing at all. Hinge loss can never go negative — being *extra* correct earns no bonus.',
            },
            {
              kind: 'mcq',
              id: 'ch03-q-svm-2',
              prompt: 'The kernel trick lets an SVM…',
              choices: [
                'act in a high-dimensional space via dot products alone',
                'train on unlabeled data by clustering it into two groups',
                'drop the bias $b$ because the mapping recenters the data',
                'guarantee zero training error on any dataset it is given',
              ],
              answer: 0,
              explain:
                'The optimization only ever touches the data through $\\mathbf{x}_i\\mathbf{x}_k$, so a kernel can return the dot product *as if* it had been computed after an expensive mapping φ — while φ is never actually applied to anything.',
            },
            {
              kind: 'tf',
              id: 'ch03-q-svm-3',
              prompt: 'The feature space implied by the RBF kernel has an infinite number of dimensions.',
              answer: true,
              explain:
                'That is the remarkable part: you compute a simple exponential of a distance, yet implicitly operate in an infinite-dimensional space.',
            },
            {
              kind: 'mcq',
              id: 'ch03-q-svm-4',
              prompt:
                'One class forms a tight cluster with the other class in a ring around it. Which tool fits the situation best?',
              choices: [
                'a hard-margin linear SVM',
                'an SVM with an RBF kernel',
                'a decision tree with a single split',
                'increasing C on a linear SVM',
              ],
              answer: 1,
              explain:
                'No straight line separates a ring from its center, so no amount of tuning $C$ on a linear SVM will help. The boundary has to be a closed curve, which is exactly what a kernel makes reachable.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch03-knn',
      title: 'k-Nearest Neighbors',
      minutes: 5,
      blocks: [
        {
          type: 'p',
          md:
            '**[[k-nearest-neighbors|k-Nearest Neighbors]]** is the algorithm that refuses to study. Every method so far digests the training data into [[model-parameters|parameters]] and can then throw the data away; kNN is **[[non-parametric-model|non-parametric]]** and **[[instance-based-learning|instance-based]]**: its "model" *is* the training set, kept in memory whole. When a new example $\\mathbf{x}$ arrives, kNN finds the $k$ stored examples closest to it and returns the **majority label** ([[classification]]) or the **average label** ([[regression]]). All the work happens at prediction time.',
        },
        {
          type: 'formula',
          tex: 'd(\\mathbf{x}_i, \\mathbf{x}_k) = \\sqrt{\\textstyle\\sum_{j=1}^{D} (x_i^{(j)} - x_k^{(j)})^2}',
          parts: [
            { tex: 'd(\\mathbf{x}_i, \\mathbf{x}_k)', label: 'how far apart two examples are' },
            { tex: '=' },
            {
              tex: '\\sqrt{\\textstyle\\sum_{j=1}^{D} (x_i^{(j)} - x_k^{(j)})^2}',
              label: 'square each feature’s gap, add them up, take the root',
            },
          ],
          terms: [
            { tex: 'd', explain: '[[euclidean-distance|Euclidean distance]] — the straight-line, "as the crow flies" measure of closeness' },
            { tex: '(x_i^{(j)} - x_k^{(j)})^2', explain: 'per-feature differences, squared and summed across all D dimensions' },
          ],
        },
        {
          type: 'p',
          md:
            '"Closest" is a choice, though. A popular alternative is negative **[[cosine-similarity|cosine similarity]]**: $\\cos(\\angle(\\mathbf{x}_i, \\mathbf{x}_k))$ is $1$ for vectors pointing the same direction, $0$ for orthogonal ones, $-1$ for opposite ones — it compares *directions* and ignores magnitudes (multiply by $-1$ to turn similarity into a distance). Other options include Chebychev, Mahalanobis and Hamming [[distance-metric|distances]]. Both the metric and $k$ are **[[hyperparameter|hyperparameters]]**: you pick them before learning starts, and the choice genuinely changes the answers.',
        },
        {
          type: 'widget',
          id: 'KnnPainter',
          challenge: {
            id: 'ch03-challenge-knn',
            label: 'paint a dataset where k=1 and k=7 disagree',
            xp: 15,
          },
        },
        {
          type: 'hint',
          md:
            'Small $k$ trusts each point individually — jagged regions, sensitive to noise. Large $k$ polls a bigger crowd — smoother regions, but small clusters get outvoted. Neither is "correct"; that is why $k$ is tuned.',
        },
        {
          type: 'quiz',
          id: 'ch03-q-knn',
          questions: [
            {
              kind: 'mcq',
              id: 'ch03-q-knn-1',
              prompt: 'After training, what does a kNN classifier store as its model?',
              choices: [
                'a weight vector and a bias',
                'only the k most important examples',
                'the entire training set',
                'a tree of if-then rules',
              ],
              answer: 2,
              explain:
                'kNN is instance-based: nothing is compressed into parameters, so every training example must stay in memory for prediction. It cannot even discard the "unimportant" ones, because which examples matter depends on the query.',
            },
            {
              kind: 'tf',
              id: 'ch03-q-knn-2',
              prompt: 'A cosine similarity of 0 means two feature vectors point in orthogonal directions.',
              answer: true,
              explain:
                'Cosine reads the angle: 1 = same direction, 0 = right angle, −1 = opposite. Lengths never enter into it.',
            },
            {
              kind: 'mcq',
              id: 'ch03-q-knn-3',
              prompt: 'Increasing $k$ from 1 to a larger value typically makes the decision regions…',
              choices: [
                'more jagged, following individual noisy points closely',
                'unchanged, since k only affects how fast prediction runs',
                'split into more regions, one per neighbor consulted',
                'smoother, at the risk of outvoting small clusters',
              ],
              answer: 3,
              explain:
                'A bigger jury averages out noisy individual points, which is why the regions get smoother — but a tiny genuine island of one class can then lose the vote to whatever surrounds it. Small $k$ has the opposite trade-off.',
            },
          ],
        },
      ],
    },
  ],
  bossPool: [
    {
      kind: 'mcq',
      id: 'ch03-boss-1',
      prompt: 'Linear regression finds its parameters by minimizing…',
      choices: [
        'the mean squared error over the training set',
        'the number of support vectors it has to keep',
        'the entropy remaining in the labels after fitting',
        'the width of the margin around the fitted line',
      ],
      answer: 0,
      explain:
        'The objective — the cost function, also called the empirical risk — is the average squared-error loss. Support vectors belong to the SVM, entropy to decision trees, and the margin to classification rather than regression.',
    },
    {
      kind: 'numeric',
      id: 'ch03-boss-2',
      prompt:
        'Predictions are 2 and 5; true targets are 1 and 2. Compute the mean squared error.',
      answer: 5,
      tolerance: 0.01,
      explain: 'Errors 1 and 3 → squares 1 and 9 → mean $(1+9)/2 = 5$.',
    },
    {
      kind: 'mcq',
      id: 'ch03-boss-3',
      prompt: 'The historical reason (Legendre, 1705) the error is *squared* before averaging:',
      choices: [
        'squares are always smaller than the absolute differences',
        'squares are smooth, so the gradient can be set to zero',
        'computers multiply much faster than they can subtract',
        'squaring guarantees the fitted model can never overfit',
      ],
      answer: 1,
      explain:
        'The absolute value kinks at zero and has no continuous derivative there; the square is smooth everywhere, so you can set the gradient to zero and solve the resulting system directly — no iterative search required.',
    },
    {
      kind: 'tf',
      id: 'ch03-boss-4',
      prompt:
        'The linear-regression hyperplane is chosen to lie as close as possible to the training examples, unlike the SVM’s.',
      answer: true,
      explain:
        'Regression reads predictions off the hyperplane, so it must hug the data; the SVM boundary keeps maximum distance from it.',
    },
    {
      kind: 'numeric',
      id: 'ch03-boss-5',
      prompt: 'Compute $\\sigma(0)$, the sigmoid of zero.',
      answer: 0.5,
      tolerance: 0.001,
      explain: '$1/(1+e^0) = 1/2$ — the "coin flip" point where the model is maximally unsure.',
    },
    {
      kind: 'mcq',
      id: 'ch03-boss-6',
      prompt: 'The optimization criterion of logistic regression is called…',
      choices: [
        'minimum squared error',
        'maximum margin',
        'maximum likelihood',
        'minimum entropy',
      ],
      answer: 2,
      explain:
        'Pick the parameters under which the labels you actually observed are most probable — maximized in log form for practicality. The other three criteria belong to linear regression, the SVM, and ID3 respectively.',
    },
    {
      kind: 'tf',
      id: 'ch03-boss-7',
      prompt:
        'Taking the logarithm of the likelihood changes which parameter values are optimal.',
      answer: false,
      explain:
        'ln is strictly increasing, so maximizing $\\ln L$ and maximizing $L$ give exactly the same $(\\mathbf{w}^*, b^*)$.',
    },
    {
      kind: 'numeric',
      id: 'ch03-boss-8',
      prompt: 'What is the entropy, in bits, of a set where exactly half the examples are labeled 1?',
      answer: 1,
      tolerance: 0.001,
      explain: 'The 50/50 mix is maximum uncertainty: 1 bit. A pure set is the other extreme: 0 bits.',
    },
    {
      kind: 'numeric',
      id: 'ch03-boss-9',
      prompt:
        'A split sends 4 examples into a pure subset (entropy 0) and 4 into a 50/50 subset (entropy 1). What is the weighted entropy of the split?',
      answer: 0.5,
      tolerance: 0.01,
      explain: 'Each subset holds half the examples: $\\frac{4}{8}\\cdot 0 + \\frac{4}{8}\\cdot 1 = 0.5$ bits.',
    },
    {
      kind: 'multi',
      id: 'ch03-boss-10',
      prompt: 'Select ALL conditions under which ID3 stops splitting a node:',
      choices: [
        'every example in the node already shares one label',
        'no attribute is left that could split the set',
        'the best split’s entropy reduction falls below ε',
        'the tree has reached its maximum depth $d$',
        'the node contains an even number of examples',
      ],
      answers: [0, 1, 2, 3],
      explain:
        'Purity, exhausted attributes, gain below ε, or depth $d$ — those are the four stopping criteria, and the last two are hyperparameters you choose experimentally. How many examples a node happens to hold, odd or even, has nothing to do with it.',
    },
    {
      kind: 'tf',
      id: 'ch03-boss-11',
      prompt:
        'Because ID3 evaluates each split locally with no lookahead, the tree it builds may not be globally optimal.',
      answer: true,
      explain:
        'Greedy algorithms trade optimality for speed; backtracking during the search can improve the tree at extra cost.',
    },
    {
      kind: 'mcq',
      id: 'ch03-boss-12',
      prompt: 'Which is NOT one of C4.5’s improvements over ID3?',
      choices: [
        'accepting continuous and discrete features',
        'handling examples with missing attributes',
        'pruning the finished tree to fight overfitting',
        'guaranteeing a globally optimal tree every time',
      ],
      answer: 3,
      explain:
        'C4.5 is still a greedy, local search, so it carries no optimality guarantee at all. Its three genuine additions over ID3 are continuous features, missing-value handling, and bottom-up pruning.',
    },
    {
      kind: 'match',
      id: 'ch03-boss-13',
      prompt: 'Match each algorithm to what it optimizes:',
      pairs: [
        ['Linear regression', 'average squared error'],
        ['Logistic regression', 'log-likelihood of the labels'],
        ['ID3', 'entropy left after each split'],
        ['Soft-margin SVM', 'margin width traded against hinge loss'],
      ],
      explain:
        'Four algorithms, four objectives — recognizing the objective is the fastest way to recognize the algorithm.',
    },
    {
      kind: 'order',
      id: 'ch03-boss-14',
      prompt: 'Order the steps of one round of ID3:',
      items: [
        'Take the set of examples at the current node',
        'Evaluate every candidate (feature, threshold) split',
        'Pick the split with the lowest weighted entropy',
        'Create the two child nodes and recurse into them',
        'Stop a branch when a leaf criterion is met',
      ],
      explain: 'Measure, choose greedily, split, recurse, stop — that loop builds the whole tree.',
    },
    {
      kind: 'mcq',
      id: 'ch03-boss-15',
      prompt: 'The hinge loss of a training example is exactly zero when…',
      choices: [
        '$y_i(\\mathbf{w}\\mathbf{x}_i - b) \\ge 1$ — correct side, at or beyond the margin',
        'the example sits exactly on the decision boundary',
        'the example is misclassified but close to the boundary',
        'the hyperparameter $C$ is set to zero',
      ],
      answer: 0,
      explain:
        'Hinge loss $\\max(0, 1 - y(\\mathbf{w}\\mathbf{x} - b))$ vanishes precisely when the original SVM constraint is satisfied. A point *on* the boundary scores 0, so its loss is a full 1 — sitting on the fence is not free.',
    },
    {
      kind: 'numeric',
      id: 'ch03-boss-16',
      prompt:
        'For a point with $y_i = +1$ and $\\mathbf{w}\\mathbf{x}_i - b = 0.3$, compute the hinge loss $\\max(0, 1 - y_i(\\mathbf{w}\\mathbf{x}_i - b))$.',
      answer: 0.7,
      tolerance: 0.01,
      explain:
        '$1 - 1 \\times 0.3 = 0.7 > 0$: the point is on the correct side but inside the margin, so it still pays a penalty.',
    },
    {
      kind: 'mcq',
      id: 'ch03-boss-17',
      prompt: 'The essence of the kernel trick is that the SVM optimization…',
      choices: [
        'ignores the data and samples candidate boundaries at random',
        'touches the data only through dot products, never the vectors',
        'transforms every vector explicitly into infinite dimensions first',
        'replaces the class labels with cluster ids before training',
      ],
      answer: 1,
      explain:
        'In the Lagrangian form only $\\mathbf{x}_i\\mathbf{x}_k$ ever appears — swap that for $k(\\mathbf{x}_i,\\mathbf{x}_k)$ and you are working in φ-space without ever computing φ. Doing the mapping explicitly is precisely the expense the trick avoids.',
    },
    {
      kind: 'mcq',
      id: 'ch03-boss-18',
      prompt: 'In the RBF kernel, the hyperparameter σ (or γ) controls…',
      choices: [
        'how many training examples the kernel keeps in memory',
        'the size of the steps gradient descent takes downhill',
        'how smooth or curvy the decision boundary turns out',
        'how many classes the classifier is able to separate',
      ],
      answer: 2,
      explain:
        'σ sets how fast similarity fades with distance. Small σ (large γ) means it fades quickly, so each point only influences its immediate surroundings and the boundary comes out wiggly and local; large σ gives smooth, almost-linear boundaries.',
    },
    {
      kind: 'tf',
      id: 'ch03-boss-19',
      prompt:
        'For kNN, "training" amounts to storing the dataset — the real computation happens when a prediction is requested.',
      answer: true,
      explain:
        'kNN is instance-based and non-parametric: no parameters are fitted in advance, so prediction time carries the load.',
    },
    {
      kind: 'match',
      id: 'ch03-boss-20',
      prompt: 'Match each distance notion to what it measures:',
      pairs: [
        ['Euclidean distance', 'straight-line distance between two points'],
        ['Negative cosine similarity', 'difference in direction, ignoring vector length'],
        ['Hamming distance', 'number of positions where two sequences differ'],
      ],
      explain:
        'The metric is a modeling choice: position, direction, or symbol-by-symbol disagreement.',
    },
    {
      kind: 'mcq',
      id: 'ch03-boss-21',
      prompt: 'In kNN, the value of $k$ and the distance metric are…',
      choices: [
        'parameters learned automatically from the training data',
        'fixed by the algorithm at $k = 3$ with Euclidean distance',
        'irrelevant once the training set is large enough',
        'hyperparameters the analyst sets before the algorithm runs',
      ],
      answer: 3,
      explain:
        'Like ID3’s ε and d, or the SVM’s C, they are set — and usually tuned — by the analyst, and the choice genuinely changes the predictions. Metrics *can* also be learned, as Chapter 10 of the book notes, but that is a separate problem.',
    },
    {
      kind: 'mcq',
      id: 'ch03-boss-22',
      prompt:
        'A dataset has one class in a central blob and the other in a surrounding ring. A linear SVM fails on it because…',
      choices: [
        'no straight line can separate a ring from its center',
        'the dataset has too few examples for a margin to form',
        'an SVM can only ever separate two classes at a time',
        'the ring and the blob overlap, so no margin exists',
      ],
      answer: 0,
      explain:
        'The true boundary is a closed curve, and no hyperplane in the original 2D space can trace one. Mapping into a higher-dimensional space — via a kernel — is exactly what makes the two classes linearly separable there.',
    },
  ],
};

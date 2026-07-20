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
            'This chapter tours five algorithms that earn their place twice over: each is genuinely useful on its own, and each is a building block inside fancier methods. First up is the workhorse of prediction: **linear regression**. You have labeled examples $\\{(\\mathbf{x}_i, y_i)\\}_{i=1}^N$ where every target $y_i$ is a *real number* — a price, a temperature, a weight — and you want a model that predicts it as a **linear combination** of the features:',
        },
        {
          type: 'formula',
          tex: 'f_{w,b}(x) = wx + b',
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
            'Look familiar? It is the SVM expression from Chapter 1 minus the sign operator. But the *role* of the hyperplane flips completely. The SVM hyperplane is a fence: it must sit **as far as possible** from the two groups it separates. The regression hyperplane is a clothesline: it must run **as close as possible** to every training point, because we read predictions directly off it. A line far from the dots would produce nonsense for new inputs.',
        },
        {
          type: 'p',
          md:
            'How do we measure "close to all points"? With an **objective** — the expression we minimize. Linear regression minimizes the average of squared differences between predictions and targets, the **mean squared error**:',
        },
        {
          type: 'formula',
          tex: '\\frac{1}{N} \\sum_{i=1}^{N} (f_{w,b}(\\mathbf{x}_i) - y_i)^2',
          terms: [
            { tex: '(f_{w,b}(\\mathbf{x}_i) - y_i)^2', explain: 'the loss function — here squared error loss, the penalty one example charges the model' },
            { tex: '\\frac{1}{N}\\sum', explain: 'averaging losses over all N examples gives the cost function, also called the empirical risk' },
          ],
        },
        {
          type: 'p',
          md:
            'Why *squared*? Absolute differences would make sense too, and so would cubes — many design choices in ML are less inevitable than they look. The square won for practical reasons dating back to Legendre in 1705: it is **smooth** (the absolute value has no continuous derivative at zero), and a smooth objective lets you set the gradient to zero and solve a **closed-form** system of equations — no iterative search needed. Squaring also exaggerates big misses, which pushes the line away from gross errors. Bonus: a model this simple rarely **overfits** — it almost never memorizes noise.',
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
            'Overfitting preview: fit these same dots with a degree-10 polynomial and it will thread through nearly every one — then predict garbage between them. Chapter 5 deals with this properly.',
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
                'The average squared difference between predictions and targets',
                'The distance from the line to the closest example',
                'The number of misclassified points',
                'The absolute size of the weights',
              ],
              answer: 0,
              explain:
                'The objective is the mean squared error — the average of the squared-error losses over the training set.',
            },
            {
              kind: 'mcq',
              id: 'ch03-q-linreg-2',
              prompt: 'SVM and linear regression both use $\\mathbf{w}\\mathbf{x} + b$-style expressions. The key difference in the hyperplane’s job is:',
              choices: [
                'SVM wants it far from the examples; regression wants it close to them',
                'SVM uses more features than regression',
                'regression requires the data to be separable',
                'there is no difference — they are the same algorithm',
              ],
              answer: 0,
              explain:
                'A decision boundary earns generalization by keeping its distance; a regression line earns accuracy by hugging the data.',
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
            'The name lies to you once: **logistic regression is not regression** — it is a *classification* algorithm. The name is inherited from statistics, because its math looks so much like linear regression’s. The problem it solves: you want a linear model, but your labels are 0 or 1, while $wx + b$ happily outputs anything from $-\\infty$ to $+\\infty$. You need a squashing function whose output lives in $(0, 1)$ — then you can read the output as a *probability of being positive*.',
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
            'This S-shaped curve is the **standard logistic function**, better known as the **sigmoid**. Feed it the familiar linear score and you get the logistic regression model: $f_{\\mathbf{w},b}(\\mathbf{x}) = 1 / (1 + e^{-(\\mathbf{w}\\mathbf{x} + b)})$. Its output is interpreted as $p(y{=}1 \\mid \\mathbf{x})$; if it is at least a threshold (usually $0.5$), predict positive, otherwise negative. Note the anchor point: $\\sigma(0) = 0.5$, so the decision boundary sits exactly where $\\mathbf{w}\\mathbf{x} + b = 0$.',
        },
        {
          type: 'p',
          md:
            'Training does *not* minimize squared error here. Instead we use **maximum likelihood**: choose $\\mathbf{w}, b$ to make the labels we actually observed as probable as possible under the model. One example’s likelihood is $f(\\mathbf{x}_i)$ if $y_i = 1$ and $1 - f(\\mathbf{x}_i)$ if $y_i = 0$; assuming independent observations, the dataset’s likelihood is the **product** of all of them — probabilities multiply, like coin flips.',
        },
        {
          type: 'math',
          tex: 'L_{\\mathbf{w},b} = \\prod_{i=1}^{N} f_{\\mathbf{w},b}(\\mathbf{x}_i)^{y_i}\\,(1 - f_{\\mathbf{w},b}(\\mathbf{x}_i))^{(1-y_i)}',
        },
        {
          type: 'p',
          md:
            'In practice we maximize the **log-likelihood** $\\sum_i y_i \\ln f(\\mathbf{x}_i) + (1-y_i)\\ln(1 - f(\\mathbf{x}_i))$ instead: $\\ln$ is strictly increasing, so the best $(\\mathbf{w}, b)$ is unchanged, and sums of logs are far friendlier than products of many numbers between 0 and 1. One more contrast with linear regression: there is **no closed-form solution** this time. The optimum is found numerically — typically with **gradient descent** (Chapter 4).',
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
                'ln is strictly increasing, so the maximizer is the same — and sums are easier to handle than products',
                'the log makes the model more accurate',
                'the likelihood cannot be computed at all',
                'the log turns classification into regression',
              ],
              answer: 0,
              explain:
                'Same argmax, nicer math: products of many small probabilities become well-behaved sums of logs.',
            },
            {
              kind: 'mcq',
              id: 'ch03-q-logreg-4',
              prompt: 'How is the optimum of logistic regression’s objective found?',
              choices: [
                'numerically, e.g. with gradient descent — there is no closed form',
                'by the same closed-form equations as linear regression',
                'by sorting the examples by feature value',
                'by trying every possible (w, b) pair',
              ],
              answer: 0,
              explain:
                'Unlike least squares, maximum likelihood for the sigmoid model has no closed-form solution, so we climb the objective iteratively.',
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
            'A **decision tree** plays twenty questions with your feature vector. It is an acyclic graph: each branching node examines one feature — *is $x^{(j)}$ below threshold $t$?* — and sends the example left or right; each **leaf** announces a class. Unlike logistic regression, which finds an *optimal* $(\\mathbf{w}^*, b^*)$ for a fixed formula, tree learning builds a **non-parametric** model piece by piece, approximately. The classic formulation covered in the book is **ID3**.',
        },
        {
          type: 'p',
          md:
            'ID3 starts with every labeled example in a single node, predicting just the average label. Then it searches all features $j$ and all thresholds $t$, imagines splitting the set $\\mathcal{S}$ into $\\mathcal{S}_-$ (examples with $x^{(j)} < t$) and $\\mathcal{S}_+$ (the rest), and asks: *which split leaves the least uncertainty behind?* Uncertainty is measured by **entropy** — maximal when classes are perfectly mixed, zero when a set is pure:',
        },
        {
          type: 'formula',
          tex: 'H(\\mathcal{S}) = -p \\log_2 p - (1-p)\\log_2(1-p)',
          terms: [
            { tex: 'p', explain: 'the fraction of examples in the set labeled 1' },
            { tex: '\\log_2', explain: 'base-2 logarithm measures entropy in bits; the book uses ln — the shape and the argmin are the same' },
            { tex: 'H', explain: '1 bit for a 50/50 mix (useless leaf!), 0 for a pure set' },
          ],
        },
        {
          type: 'formula',
          tex: 'H(\\mathcal{S}_-, \\mathcal{S}_+) = \\frac{|\\mathcal{S}_-|}{|\\mathcal{S}|} H(\\mathcal{S}_-) + \\frac{|\\mathcal{S}_+|}{|\\mathcal{S}|} H(\\mathcal{S}_+)',
          terms: [
            { tex: '\\frac{|\\mathcal{S}_-|}{|\\mathcal{S}|}', explain: 'each branch’s entropy is weighted by the fraction of examples that flow into it' },
            { tex: 'H(\\mathcal{S}_-, \\mathcal{S}_+)', explain: 'the weighted entropy of the split — ID3 picks the split minimizing this' },
          ],
        },
        {
          type: 'p',
          md:
            'The drop from $H(\\mathcal{S})$ to the weighted entropy after splitting is the **information gain** — how many bits of uncertainty the question removes. ID3 greedily takes the best split, then recurses into each branch. It stops splitting a node when: the node is already pure, no attribute is left to split on, the best gain falls below some $\\epsilon$, or the tree hits a maximum depth $d$ ($\\epsilon$ and $d$ are hyperparameters, found experimentally).',
        },
        {
          type: 'p',
          md:
            'Note the word **greedy**: each split is chosen by its *local* benefit, with no lookahead to future splits — so ID3 does **not** guarantee the globally optimal tree (backtracking during search can improve it, at a price). The most widely used refinement, **C4.5**, handles continuous *and* discrete features, tolerates missing values, and fights overfitting with **pruning**: grow the tree fully, then walk back through it and replace branches that don’t pull their weight with leaves.',
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
                'minimizes the weighted entropy of the resulting subsets',
                'produces subsets of exactly equal size',
                'uses the feature with the largest values',
                'maximizes the depth of the tree',
              ],
              answer: 0,
              explain:
                'Lowest weighted entropy after the split = highest information gain. Size balance and feature magnitude are irrelevant.',
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
                'growing the full tree, then replacing branches that barely reduce error with leaf nodes',
                'removing training examples with missing values',
                'cutting features whose values are too large',
                'stopping training after the first split',
              ],
              answer: 0,
              explain:
                'Pruning is a bottom-up cleanup pass: branches that don’t contribute enough error reduction get collapsed — a defense against overfitting.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch03-svm',
      title: 'Support Vector Machines',
      minutes: 8,
      blocks: [
        {
          type: 'p',
          md:
            'Chapter 1 left the SVM with a boundary $\\mathbf{w}\\mathbf{x} - b = 0$, the constraints $y_i(\\mathbf{w}\\mathbf{x}_i - b) \\ge 1$, and the goal of minimizing $\\|\\mathbf{w}\\|$ (equivalently $\\frac{1}{2}\\|\\mathbf{w}\\|^2$, which suits quadratic-programming solvers). Two hard questions remained. **One:** what if noise, outliers or mislabeled points make perfect separation impossible? **Two:** what if the true boundary isn’t a line at all — say, one class forms a ring around the other?',
        },
        {
          type: 'formula',
          tex: '\\max(0,\\; 1 - y_i(\\mathbf{w}\\mathbf{x}_i - b))',
          terms: [
            { tex: '\\max(0, \\cdot)', explain: 'zero when the example is on the correct side with room to spare (constraint satisfied)' },
            { tex: '1 - y_i(\\mathbf{w}\\mathbf{x}_i - b)', explain: 'grows the further a point strays past the margin onto the wrong side' },
          ],
        },
        {
          type: 'p',
          md:
            'Question one is answered by the **hinge loss** above. Instead of demanding every constraint hold, the **soft-margin SVM** minimizes a compromise between margin width ($\\|\\mathbf{w}\\|^2$) and average hinge loss, weighted by a hyperparameter $C$. In the convention used by our playground below, high $C$ makes violations expensive — the boundary contorts to classify everything — while low $C$ shrugs off a few mistakes to keep the margin wide. Wide margins generalize; zero training errors on noisy data usually don’t. $C$ is chosen experimentally, like ID3’s $\\epsilon$ and $d$.',
        },
        {
          type: 'p',
          md:
            'Question two has one of the most elegant answers in ML. If the classes aren’t linearly separable in the original space, *map them into a higher-dimensional space* where they are — a circle of points becomes a liftable bowl in 3D. Doing that mapping $\\phi$ explicitly would be brutally expensive. But the SVM optimization (in its Lagrange-multiplier form) touches the data **only through dot products** $\\mathbf{x}_i \\mathbf{x}_k$. So we swap in a **kernel function** that returns what the dot product *would be* in the high-dimensional space, without ever going there: that is the **kernel trick**. Example: $k(\\mathbf{x}_i, \\mathbf{x}_k) = (\\mathbf{x}_i \\mathbf{x}_k)^2$ behaves exactly like mapping $(q_1, q_2) \\mapsto (q_1^2, \\sqrt{2} q_1 q_2, q_2^2)$ first.',
        },
        {
          type: 'formula',
          tex: "k(\\mathbf{x}, \\mathbf{x}') = \\exp\\left(-\\frac{\\|\\mathbf{x} - \\mathbf{x}'\\|^2}{2\\sigma^2}\\right)",
          terms: [
            { tex: "\\|\\mathbf{x} - \\mathbf{x}'\\|^2", explain: 'squared Euclidean distance between the two feature vectors' },
            { tex: '\\sigma', explain: 'controls how fast similarity fades with distance: the analyst’s smooth-vs-curvy dial (widgets often use γ = 1/(2σ²))' },
            { tex: 'k', explain: 'the RBF (radial basis function) kernel — its implicit feature space has infinitely many dimensions' },
          ],
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
            'Two honesty notes: the book writes the soft-margin cost as $C\\|\\mathbf{w}\\|^2 + $ average hinge, so *its* $C$ plays the mirrored role of ours (most libraries use ours). And the playground’s RBF machine is a **kernel perceptron** — the same kernel trick with a simpler trainer than a full SVM.',
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
              choices: ['0', '1', '2', '−1'],
              answer: 0,
              explain:
                '$\\max(0, 1 - 2) = 0$: points on the correct side, beyond the margin, cost nothing at all.',
            },
            {
              kind: 'mcq',
              id: 'ch03-q-svm-2',
              prompt: 'The kernel trick lets an SVM…',
              choices: [
                'work in a high-dimensional space by computing only dot-product results, never the mapping itself',
                'train without any labels',
                'remove the need for the parameter b',
                'guarantee zero training error on any dataset',
              ],
              answer: 0,
              explain:
                'The optimization only ever needs $\\mathbf{x}_i\\mathbf{x}_k$; a kernel returns that dot product *as if* computed after an expensive mapping φ.',
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
                'an SVM with an RBF kernel',
                'a hard-margin linear SVM',
                'linear regression',
                'increasing C on a linear SVM',
              ],
              answer: 0,
              explain:
                'No straight line separates a ring from its center — the boundary must be a closed curve, which kernels make possible.',
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
            '**k-Nearest Neighbors** is the algorithm that refuses to study. Every method so far digests the training data into parameters and can then throw the data away; kNN is **non-parametric** and **instance-based**: its "model" *is* the training set, kept in memory whole. When a new example $\\mathbf{x}$ arrives, kNN finds the $k$ stored examples closest to it and returns the **majority label** (classification) or the **average label** (regression). All the work happens at prediction time.',
        },
        {
          type: 'formula',
          tex: 'd(\\mathbf{x}_i, \\mathbf{x}_k) = \\sqrt{\\textstyle\\sum_{j=1}^{D} (x_i^{(j)} - x_k^{(j)})^2}',
          terms: [
            { tex: 'd', explain: 'Euclidean distance — the straight-line, "as the crow flies" measure of closeness' },
            { tex: '(x_i^{(j)} - x_k^{(j)})^2', explain: 'per-feature differences, squared and summed across all D dimensions' },
          ],
        },
        {
          type: 'p',
          md:
            '"Closest" is a choice, though. A popular alternative is negative **cosine similarity**: $\\cos(\\angle(\\mathbf{x}_i, \\mathbf{x}_k))$ is $1$ for vectors pointing the same direction, $0$ for orthogonal ones, $-1$ for opposite ones — it compares *directions* and ignores magnitudes (multiply by $-1$ to turn similarity into a distance). Other options include Chebychev, Mahalanobis and Hamming distances. Both the metric and $k$ are **hyperparameters**: you pick them before learning starts, and the choice genuinely changes the answers.',
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
                'the entire training set',
                'a weight vector and a bias',
                'a tree of if-then rules',
                'only the k most important examples',
              ],
              answer: 0,
              explain:
                'kNN is instance-based: nothing is compressed into parameters, so every training example must stay in memory for prediction.',
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
                'smoother, at the risk of outvoting small genuine clusters',
                'more jagged and noise-sensitive',
                'identical — k has no effect',
                'disappear entirely',
              ],
              answer: 0,
              explain:
                'A bigger jury averages out noisy individual points, but a tiny island of one class can lose the vote to its surroundings.',
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
        'the number of support vectors',
        'the entropy of the labels',
        'the width of the margin',
      ],
      answer: 0,
      explain: 'The objective (cost function) is the average squared-error loss — the empirical risk.',
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
        'squares are smooth, enabling closed-form solutions via calculus',
        'squares are always smaller than absolute values',
        'computers multiply faster than they subtract',
        'it guarantees the model never overfits',
      ],
      answer: 0,
      explain:
        'The absolute value has no continuous derivative; the square does, so you can set the gradient to zero and solve directly.',
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
        'maximum likelihood',
        'minimum squared error',
        'maximum margin',
        'minimum entropy',
      ],
      answer: 0,
      explain:
        'Pick the parameters under which the observed labels are most probable — maximized in log form for practicality.',
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
        'the node’s examples all share one label',
        'no attribute is left to split on',
        'the best split’s entropy reduction is below a threshold ε',
        'the tree reached a maximum depth d',
        'the node contains an even number of examples',
      ],
      answers: [0, 1, 2, 3],
      explain:
        'Purity, exhausted attributes, gain below ε, or depth d — evenness of the count has nothing to do with it.',
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
        'guaranteeing the globally optimal tree',
        'accepting both continuous and discrete features',
        'handling incomplete examples',
        'pruning to fight overfitting',
      ],
      answer: 0,
      explain:
        'C4.5 is still greedy — no optimality guarantee. Its additions are continuous features, missing-value handling, and bottom-up pruning.',
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
        'C is set to zero',
      ],
      answer: 0,
      explain:
        'Hinge loss $\\max(0, 1 - y(\\mathbf{w}\\mathbf{x} - b))$ vanishes precisely when the original SVM constraint is satisfied.',
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
        'uses the data only via dot products, which a kernel can compute as if in a higher-dimensional space',
        'ignores the data entirely and samples random boundaries',
        'transforms every vector explicitly into infinite dimensions',
        'replaces the labels with cluster ids',
      ],
      answer: 0,
      explain:
        'In the Lagrangian form only $\\mathbf{x}_i\\mathbf{x}_k$ appears — swap that for $k(\\mathbf{x}_i,\\mathbf{x}_k)$ and you work in φ-space without ever computing φ.',
    },
    {
      kind: 'mcq',
      id: 'ch03-boss-18',
      prompt: 'In the RBF kernel, the hyperparameter σ (or γ) controls…',
      choices: [
        'how smooth or curvy the decision boundary is in the original space',
        'the number of training examples used',
        'the learning rate of gradient descent',
        'the number of classes',
      ],
      answer: 0,
      explain:
        'Small σ (large γ) → similarity fades fast → wiggly, local boundaries; large σ → smooth, almost-linear ones.',
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
        'hyperparameters chosen by the analyst before running the algorithm',
        'parameters learned from the training data automatically',
        'fixed by the algorithm at k = 3, Euclidean',
        'irrelevant to the predictions',
      ],
      answer: 0,
      explain:
        'Like ID3’s ε and d or the SVM’s C, they are set (or tuned) by the analyst — though metrics *can* also be learned, as Chapter 10 of the book notes.',
    },
    {
      kind: 'mcq',
      id: 'ch03-boss-22',
      prompt:
        'A dataset has one class in a central blob and the other in a surrounding ring. A linear SVM fails on it because…',
      choices: [
        'no hyperplane in the original 2D space can separate a ring from its center',
        'the dataset has too few examples',
        'SVMs cannot handle two classes',
        'the labels are not numeric',
      ],
      answer: 0,
      explain:
        'The true boundary is a closed curve. Mapping to a higher-dimensional space (via a kernel) is exactly what makes it linearly separable.',
    },
  ],
};

import type { Chapter } from '../schema';

/** Chapter 2 — Notation and Definitions (book pp. 10–21), paraphrased in original words. */
export const ch02: Chapter = {
  id: 'ch02',
  number: 2,
  title: 'Notation and Definitions',
  subtitle: "The math toolbox: vectors, probability, Bayes' rule",
  pdfPages: [10, 21],
  badgeId: 'ch02',
  sections: [
    {
      id: 'ch02-data-structures',
      title: 'Scalars, Vectors, and Σ',
      minutes: 7,
      blocks: [
        {
          type: 'p',
          md:
            'Before the algorithms, the alphabet. A **scalar** is a single number — 15, or $-3.25$ — written as an italic letter like $x$ or $a$. A **vector** is an ordered list of scalars called *attributes*, written in bold: $\\mathbf{x}$, $\\mathbf{w}$. You can picture a vector two ways: as an arrow pointing somewhere, or as a point in multi-dimensional space — both pictures are the same list of numbers. Attribute $j$ of a vector is written with a superscript index: $x^{(j)}$. The index names a **dimension** — a fixed position in the list.',
        },
        {
          type: 'p',
          md:
            'Careful: $x^{(2)}$ is *not* $x$ squared. The parenthesized superscript is an index; a plain superscript is a power. To square an indexed attribute you write $(x^{(j)})^2$. Variables can also carry two or more indices, like $x_{l,u}^{(j)}$ — in neural networks that could mean “input feature $j$ of unit $u$ in layer $l$”.',
        },
        {
          type: 'p',
          md:
            'A **matrix** is a rectangular grid of numbers — rows by columns — written as a bold capital like $\\mathbf{W}$. A **set** is an *unordered* collection of *unique* elements, written calligraphically: $\\mathcal{S}$. Sets can be finite, like $\\{1, 3, 18\\}$, or infinite intervals: $[a, b]$ includes both endpoints, $(a, b)$ excludes them, and $\\mathbb{R}$ is all real numbers. $x \\in \\mathcal{S}$ says “$x$ belongs to $\\mathcal{S}$”; $\\cap$ intersects two sets, $\\cup$ unites them, and $|\\mathcal{S}|$ counts the elements.',
        },
        {
          type: 'p',
          md:
            'The single most common symbol in ML papers is capital sigma — a compact way to write “add all of these up”:',
        },
        {
          type: 'formula',
          tex: '\\sum_{i=1}^{n} x_i \\;\\stackrel{\\text{def}}{=}\\; x_1 + x_2 + \\dots + x_{n-1} + x_n',
          terms: [
            { tex: '\\sum', explain: 'capital sigma: add up one term per value of the counter' },
            { tex: 'i=1', explain: 'the counter starts at 1…' },
            { tex: 'n', explain: '…and stops after n, so there are n terms in total' },
            { tex: 'x_i', explain: 'the recipe for each term: the i-th element of the collection' },
            {
              tex: '\\stackrel{\\text{def}}{=}',
              explain: 'reads “is defined as” — the left side is shorthand for the right side',
            },
          ],
        },
        {
          type: 'p',
          md:
            'Capital pi is the same idea with multiplication instead of addition: $\\prod_{i=1}^{n} x_i \\stackrel{\\text{def}}{=} x_1 \\cdot x_2 \\cdot \\ldots \\cdot x_n$, where $a \\cdot b$ (or just $ab$) means $a$ times $b$. Both symbols also run over vector attributes, e.g. $\\sum_{j=1}^{m} x^{(j)}$.',
        },
        {
          type: 'widget',
          id: 'SigmaExpander',
          challenge: {
            id: 'ch02-challenge-sigma',
            label: 'expand 3 different expressions',
            xp: 15,
          },
        },
        {
          type: 'p',
          md:
            'Vectors support a few basic operations. The **sum** $\\mathbf{x} + \\mathbf{z}$ adds attribute by attribute; the difference subtracts the same way. Multiplying a vector by a scalar scales every attribute: $\\mathbf{x}c = [cx^{(1)}, \\dots, cx^{(m)}]$. The **dot product** is different — it takes two vectors of the *same* dimensionality and returns a single scalar:',
        },
        {
          type: 'formula',
          tex: '\\mathbf{w}\\mathbf{x} \\;\\stackrel{\\text{def}}{=}\\; \\sum_{i=1}^{m} w^{(i)} x^{(i)}',
          terms: [
            { tex: '\\mathbf{w}\\mathbf{x}', explain: 'the dot product — some books write it w · x' },
            {
              tex: 'w^{(i)} x^{(i)}',
              explain: 'multiply matching attributes together, position by position',
            },
            { tex: '\\sum_{i=1}^{m}', explain: 'then add all m of those products into one scalar' },
          ],
        },
        {
          type: 'p',
          md:
            'A few more workhorses. A **function** $y = f(x)$ associates each element $x$ of its **domain** with a single element $y$ of its **codomain**; a bold $\\mathbf{f}(x)$ returns a whole vector. $\\max_{a \\in \\mathcal{A}} f(a)$ returns the *highest value* of $f$ over the set, while $\\arg\\max_{a \\in \\mathcal{A}} f(a)$ returns the *element that achieves it* — a distinction ML uses constantly. Finally, $a \\leftarrow f(x)$ is the **assignment operator**: variable $a$ *gets* the new value $f(x)$.',
        },
        {
          type: 'hint',
          md:
            'Reading tip: $f(x) \\ge f(c)$ for all $x$ near $c$ means $c$ is a **local minimum**; the smallest of all local minima is the **global minimum**. You’ll meet both again the moment we start optimizing models.',
        },
        {
          type: 'quiz',
          id: 'ch02-q-structures',
          questions: [
            {
              kind: 'mcq',
              id: 'ch02-q-structures-1',
              prompt: 'In this book’s notation, $x^{(2)}$ means…',
              choices: [
                'the second attribute of the vector $\\mathbf{x}$',
                '$x$ squared',
                'the second example in the dataset',
                'a set containing $x$ and 2',
              ],
              answer: 0,
              explain:
                'The parenthesized superscript indexes a dimension of the vector. A power has no parentheses — squaring attribute 2 would be $(x^{(2)})^2$.',
            },
            {
              kind: 'numeric',
              id: 'ch02-q-structures-2',
              prompt: 'Compute the dot product $\\mathbf{w}\\mathbf{x}$ for $\\mathbf{w} = [2, 3]$ and $\\mathbf{x} = [4, 1]$.',
              answer: 11,
              tolerance: 0.01,
              explain: 'Multiply matching attributes and add: $2 \\times 4 + 3 \\times 1 = 8 + 3 = 11$.',
            },
            {
              kind: 'match',
              id: 'ch02-q-structures-3',
              prompt: 'Match each piece of set notation to its meaning:',
              pairs: [
                ['$[a, b]$', 'all values from a to b, endpoints included'],
                ['$(a, b)$', 'all values between a and b, endpoints excluded'],
                ['$|\\mathcal{S}|$', 'the number of elements in the set'],
                ['$\\mathcal{S}_1 \\cap \\mathcal{S}_2$', 'the elements the two sets share'],
              ],
              explain:
                'Brackets include, parentheses exclude, vertical bars count, and ∩ keeps only what both sets contain (∪ would merge them).',
            },
            {
              kind: 'mcq',
              id: 'ch02-q-structures-4',
              prompt: 'For $\\mathcal{A} = \\{1, 2, 3\\}$ and $f(a) = 10 - a$, what is $\\arg\\max_{a \\in \\mathcal{A}} f(a)$?',
              choices: ['1', '9', '3', '10'],
              answer: 0,
              explain:
                'argmax returns the *element* that maximizes $f$, not the maximum value. $f(1) = 9$ is the highest, so argmax is 1 (while max is 9).',
            },
            {
              kind: 'tf',
              id: 'ch02-q-structures-5',
              prompt: 'The expression $a \\leftarrow a + 1$ means the variable $a$ gets a new value, one bigger than before.',
              answer: true,
              explain:
                'The arrow is assignment, not equality — as an equation $a = a + 1$ would be false, but as an assignment it simply updates $a$.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch02-derivative-gradient',
      title: 'Derivative and Gradient',
      minutes: 6,
      blocks: [
        {
          type: 'p',
          md:
            'The **derivative** $f\'$ of a function $f$ describes how fast the function grows or shrinks. If the derivative is a constant — say 5, or $-3$ — the function climbs (or falls) at that same rate everywhere. If $f\'$ is itself a function, the pace changes from region to region: where $f\'(x) > 0$ the function is rising at $x$, where $f\'(x) < 0$ it is falling, and where $f\'(x) = 0$ the slope is horizontal — flat ground. Finding a derivative is called **differentiation**.',
        },
        {
          type: 'p',
          md:
            'Derivatives of basic functions are known facts: if $f(x) = x^2$ then $f\'(x) = 2x$; if $f(x) = 2x$ then $f\'(x) = 2$; the derivative of any constant is 0. For composed functions there is the **chain rule**: if $F(x) = f(g(x))$ then $F\'(x) = f\'(g(x))\\,g\'(x)$. Example: $F(x) = (5x+1)^2$ is the square (outer $f$) of $5x+1$ (inner $g$), so $F\'(x) = 2(5x+1) \\cdot 5 = 50x + 10$.',
        },
        {
          type: 'p',
          md:
            'The **gradient** generalizes the derivative to functions with several inputs. A **partial derivative** focuses on one input and treats every other input as a frozen constant. For $f([x^{(1)}, x^{(2)}]) = ax^{(1)} + bx^{(2)} + c$: differentiating with respect to $x^{(1)}$ gives $a$ (the $bx^{(2)}$ and $c$ terms are constants, contributing 0), and with respect to $x^{(2)}$ gives $b$. The gradient collects them into a vector:',
        },
        {
          type: 'formula',
          tex: '\\nabla f \\;\\stackrel{\\text{def}}{=}\\; \\left[ \\frac{\\partial f}{\\partial x^{(1)}},\\; \\frac{\\partial f}{\\partial x^{(2)}} \\right]',
          terms: [
            { tex: '\\nabla f', explain: 'nabla f — the gradient, a vector with one slope per input' },
            {
              tex: '\\frac{\\partial f}{\\partial x^{(1)}}',
              explain: 'the partial derivative: how f changes when only the first input moves',
            },
          ],
        },
        {
          type: 'p',
          md:
            'The gradient has a beautiful geometric meaning: it points in the direction of **steepest increase** — uphill — and its length says how steep the climb is. Walk against it ($-\\nabla f$) and you descend as fast as possible. Try both pictures below.',
        },
        {
          type: 'widget',
          id: 'SlopeExplorer',
          challenge: {
            id: 'ch02-challenge-slope',
            label: 'find the point where the slope is zero',
            xp: 15,
          },
        },
        {
          type: 'hint',
          md:
            'Remember “zero slope = flat ground”. Training a model is largely a hunt for the place where the gradient of an error function is zero — Chapter 4 turns this into the **gradient descent** algorithm.',
        },
        {
          type: 'quiz',
          id: 'ch02-q-slopes',
          questions: [
            {
              kind: 'mcq',
              id: 'ch02-q-slopes-1',
              prompt: 'If $f\'(x) < 0$ at some point $x$, then at that point the function $f$ is…',
              choices: ['decreasing', 'increasing', 'flat', 'undefined'],
              answer: 0,
              explain:
                'Negative derivative means the function falls as $x$ grows; positive means it rises; zero means the slope is horizontal.',
            },
            {
              kind: 'numeric',
              id: 'ch02-q-slopes-2',
              prompt: 'For $f(x) = x^2$, the derivative is $f\'(x) = 2x$. What is the slope at $x = 3$?',
              answer: 6,
              tolerance: 0.01,
              explain: '$f\'(3) = 2 \\times 3 = 6$: at $x=3$ the parabola climbs 6 units of height per unit of $x$.',
            },
            {
              kind: 'tf',
              id: 'ch02-q-slopes-3',
              prompt: 'The gradient of a function points in the direction where the function *decreases* fastest.',
              answer: false,
              explain:
                'It points uphill — the direction of steepest *increase*. That’s why optimizers step along $-\\nabla f$ to go down.',
            },
            {
              kind: 'mcq',
              id: 'ch02-q-slopes-4',
              prompt: 'When computing $\\frac{\\partial f}{\\partial x^{(1)}}$, how is $x^{(2)}$ treated?',
              choices: [
                'as a constant, so its terms differentiate to zero',
                'as the main variable',
                'it is set equal to $x^{(1)}$',
                'it is removed from the function',
              ],
              answer: 0,
              explain:
                'A partial derivative moves one input at a time; everything else is frozen, and constants have zero derivative.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch02-random-variables',
      title: 'Random Variables and Statistics',
      minutes: 6,
      blocks: [
        {
          type: 'p',
          md:
            'A **random variable**, written as an italic capital like $X$, is a variable whose values are numerical outcomes of a random phenomenon: a coin flip (0 for heads, 1 for tails), a die roll, the height of the next stranger you pass. Random variables come in two kinds: **discrete** and **continuous**.',
        },
        {
          type: 'p',
          md:
            'A **discrete** random variable takes countably many distinct values. Its distribution is a list of probabilities, one per value, called the **probability mass function** (pmf) — for example $\\Pr(X = red) = 0.3$, $\\Pr(X = yellow) = 0.45$, $\\Pr(X = blue) = 0.25$. Every probability is $\\ge 0$ and the whole list sums to exactly 1.',
        },
        {
          type: 'p',
          md:
            'A **continuous** random variable (height, weight, time) takes infinitely many values in an interval — so the probability of any *exact* value is zero, and a list won’t do. Instead its distribution is a curve, the **probability density function** (pdf): a nonnegative function whose total area under the curve equals 1. Probability lives in *areas* under the pdf, not in single points.',
        },
        {
          type: 'formula',
          tex: '\\mathbb{E}[X] \\;\\stackrel{\\text{def}}{=}\\; \\sum_{i=1}^{k} x_i \\Pr(X = x_i)',
          terms: [
            {
              tex: '\\mathbb{E}[X]',
              explain: 'the expectation (mean, average, expected value), often written μ',
            },
            { tex: 'x_i', explain: 'one of the k possible values of X' },
            { tex: '\\Pr(X = x_i)', explain: 'how likely that value is — its weight in the average' },
          ],
        },
        {
          type: 'p',
          md:
            'The expectation is a *probability-weighted* average — frequent values pull it harder than rare ones. For a continuous variable the sum becomes an integral, $\\mathbb{E}[X] = \\int_{\\mathbb{R}} x f_X(x)\\,dx$, which is just “summation for continuous domains”. The second statistic you’ll meet everywhere is the **standard deviation** $\\sigma \\stackrel{\\text{def}}{=} \\sqrt{\\mathbb{E}[(X - \\mu)^2]}$, which measures how widely values spread around the mean; its square $\\sigma^2$ is the **variance**.',
        },
        {
          type: 'p',
          md:
            'In practice we rarely know the true distribution — we only observe some values of $X$. Those observed values are **examples**, and the collection is a **sample** or dataset. A statistic computed from a sample, written $\\hat{\\theta}(S_X)$, is an **unbiased estimator** of a true statistic $\\theta$ if $\\mathbb{E}[\\hat{\\theta}(S_X)] = \\theta$: average the estimate over unlimited fresh samples and you’d hit the true value exactly. The classic example — the **sample mean** is an unbiased estimator of the true expectation:',
        },
        {
          type: 'math',
          tex: '\\hat{\\mu} \\;=\\; \\frac{1}{N} \\sum_{i=1}^{N} x_i',
        },
        {
          type: 'quiz',
          id: 'ch02-q-random',
          questions: [
            {
              kind: 'numeric',
              id: 'ch02-q-random-1',
              prompt:
                'A discrete $X$ takes value 1 with probability 0.2, value 2 with probability 0.5, and value 3 with probability 0.3. Compute $\\mathbb{E}[X]$.',
              answer: 2.1,
              tolerance: 0.01,
              explain:
                'Weight each value by its probability: $1 \\times 0.2 + 2 \\times 0.5 + 3 \\times 0.3 = 0.2 + 1.0 + 0.9 = 2.1$.',
            },
            {
              kind: 'tf',
              id: 'ch02-q-random-2',
              prompt: 'For a continuous random variable, $\\Pr(X = c)$ is zero for any exact value $c$.',
              answer: true,
              explain:
                'With infinitely many possible values, any single point has probability 0 — that’s exactly why continuous variables need a *density* instead of a probability list.',
            },
            {
              kind: 'mcq',
              id: 'ch02-q-random-3',
              prompt: 'What makes $\\hat{\\theta}(S_X)$ an *unbiased* estimator of $\\theta$?',
              choices: [
                'Its expectation over all possible samples equals the true $\\theta$',
                'It returns exactly $\\theta$ on every sample',
                'It is computed from at least 1000 examples',
                'It always slightly overestimates $\\theta$',
              ],
              answer: 0,
              explain:
                'Any single sample gives a noisy estimate — unbiasedness says the noise averages out: over unlimited samples, the mean estimate is the true value.',
            },
            {
              kind: 'match',
              id: 'ch02-q-random-4',
              prompt: 'Match each object to what it describes:',
              pairs: [
                ['pmf', 'list of probabilities for a discrete variable'],
                ['pdf', 'density curve with total area 1 for a continuous variable'],
                ['expectation $\\mathbb{E}[X]$', 'the probability-weighted average value'],
                ['standard deviation $\\sigma$', 'how widely values spread around the mean'],
              ],
              explain:
                'pmf and pdf describe *where* probability sits; expectation and standard deviation summarize the distribution’s center and spread.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch02-bayes',
      title: "Bayes' Rule",
      minutes: 7,
      blocks: [
        {
          type: 'p',
          md:
            'The **conditional probability** $\\Pr(X = x \\mid Y = y)$ is the probability that $X$ equals $x$ *given that* we already know $Y$ equals $y$. **Bayes’ Rule** lets you flip a conditional around — compute the one you want from the one you know:',
        },
        {
          type: 'formula',
          tex: '\\Pr(X = x \\mid Y = y) = \\frac{\\Pr(Y = y \\mid X = x)\\,\\Pr(X = x)}{\\Pr(Y = y)}',
          terms: [
            {
              tex: '\\Pr(X = x \\mid Y = y)',
              explain: 'the posterior: what you want to know after seeing the evidence',
            },
            {
              tex: '\\Pr(Y = y \\mid X = x)',
              explain: 'the likelihood: how probable the evidence is if X were true',
            },
            { tex: '\\Pr(X = x)', explain: 'the prior: how probable X was before any evidence' },
            {
              tex: '\\Pr(Y = y)',
              explain: 'the evidence: the total probability of seeing Y = y at all',
            },
          ],
        },
        {
          type: 'p',
          md:
            'Why does this matter so much? Because intuition routinely ignores the **prior**. A test that is right 90% of the time *sounds* convincing — but if the illness it detects affects only 1% of people, most positive results come from the enormous healthy majority triggering false alarms. Counting dots makes this impossible to miss:',
        },
        {
          type: 'widget',
          id: 'BayesBoxes',
          challenge: {
            id: 'ch02-challenge-bayes',
            label: 'make the posterior exceed 50%',
            xp: 15,
          },
        },
        {
          type: 'p',
          md:
            'Bayes’ Rule also powers **parameter estimation**. Suppose you model $X$’s unknown distribution with a formula $f_{\\boldsymbol\\theta}$ that has tunable parameters — for instance the Gaussian, whose parameter vector is $\\boldsymbol\\theta = [\\mu, \\sigma]$. Start from a guessed **prior** $\\Pr(\\theta = \\hat\\theta)$ over candidate values, then feed examples in one at a time: each pass through Bayes’ Rule turns the prior into a posterior $\\Pr(\\theta = \\hat\\theta \\mid X = x)$, which becomes the prior for the next example. The best single value is picked by **maximum a posteriori** (MAP): $\\theta^* = \\arg\\max_{\\theta} \\prod_{i=1}^{N} \\Pr(\\theta = \\hat\\theta \\mid X = x_i)$.',
        },
        {
          type: 'hint',
          md:
            'Multiplying many probabilities produces astronomically tiny numbers that computers can’t store. The standard trick: maximize the *logarithm* instead — the log turns the product $\\prod$ into a sum $\\sum$, and machines are much happier adding.',
        },
        {
          type: 'quiz',
          id: 'ch02-q-bayes',
          questions: [
            {
              kind: 'match',
              id: 'ch02-q-bayes-1',
              prompt: 'Name the four pieces of Bayes’ Rule:',
              pairs: [
                ['$\\Pr(X = x \\mid Y = y)$', 'posterior — updated belief after the evidence'],
                ['$\\Pr(Y = y \\mid X = x)$', 'likelihood — chance of the evidence if X holds'],
                ['$\\Pr(X = x)$', 'prior — belief before any evidence'],
                ['$\\Pr(Y = y)$', 'evidence — overall chance of the observation'],
              ],
              explain:
                'posterior = likelihood × prior ÷ evidence. Naming the pieces makes every Bayesian formula readable.',
            },
            {
              kind: 'numeric',
              id: 'ch02-q-bayes-2',
              prompt:
                'Given $\\Pr(B \\mid A) = 0.8$, $\\Pr(A) = 0.3$, and $\\Pr(B) = 0.6$, use Bayes’ Rule to compute $\\Pr(A \\mid B)$.',
              answer: 0.4,
              tolerance: 0.01,
              explain: '$\\Pr(A \\mid B) = \\frac{0.8 \\times 0.3}{0.6} = \\frac{0.24}{0.6} = 0.4$.',
            },
            {
              kind: 'mcq',
              id: 'ch02-q-bayes-3',
              prompt:
                'A 90%-accurate test screens for a condition affecting 1% of people. Why are most positive results still false alarms?',
              choices: [
                'The healthy majority is so large that even a small false-positive rate produces many false positives',
                'The test becomes less accurate for rare diseases',
                '90% accuracy means 90% of positives are wrong',
                'The prior does not affect the posterior',
              ],
              answer: 0,
              explain:
                '10% of ~990 healthy people is ~99 false positives, versus ~9 true positives from the 10 sick ones. The tiny prior drags the posterior far below the test’s accuracy.',
            },
            {
              kind: 'tf',
              id: 'ch02-q-bayes-4',
              prompt:
                'MAP (maximum a posteriori) chooses the parameter value $\\hat\\theta$ that maximizes the product of posteriors over all examples.',
              answer: true,
              explain:
                'That is exactly the argmax in the MAP formula — and in practice you maximize the log of that product, turning it into a friendlier sum.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch02-ml-vocabulary',
      title: 'The Vocabulary of ML',
      minutes: 5,
      blocks: [
        {
          type: 'p',
          md:
            'Two kinds of knobs live inside every learning setup, and confusing them is the classic beginner mistake. **Parameters** are the variables that *define the model itself* — the learning algorithm adjusts them directly from the training data (the SVM’s $\\mathbf{w}^*$ and $b^*$ from Chapter 1). **Hyperparameters** are properties of the *algorithm*, not the model: the analyst must fix them *before* training starts, because the algorithm cannot learn them from data. How to choose them well is a Chapter 5 story.',
        },
        {
          type: 'p',
          md:
            '**Classification** means assigning a **label** from a finite set of **classes** to an unlabeled example — spam detection is the flagship case. Two classes (sick/healthy, spam/not_spam) make it **binary classification**; three or more make it **multiclass** — though each example still gets exactly one label. **Regression** instead predicts a real-valued **target**: estimating a house price from its area, bedrooms and location. Both are solved the same way at heart: feed labeled examples to a learning algorithm, get a model, apply it to new examples.',
        },
        {
          type: 'p',
          md:
            '**Model-based** algorithms — most of them — use the training data to build a compact model with learned parameters, then *throw the data away*: a trained SVM keeps only $\\mathbf{w}^*$ and $b^*$. **Instance-based** algorithms keep the whole dataset *as* the model. The best-known is **k-Nearest Neighbors** (kNN): to label a new example it looks at the $k$ closest training examples in feature space and outputs the label it sees most often in that neighborhood.',
        },
        {
          type: 'p',
          md:
            'Finally, **shallow** versus **deep**. A shallow algorithm learns its parameters *directly from the features* of the training examples — most supervised algorithms work this way. The notorious exception is the **neural network** with more than one **layer** between input and output: a **deep** network. In deep learning, most parameters learn not from the raw features but *from the outputs of preceding layers*. If that sounds abstract, relax — Chapter 6 opens the box.',
        },
        {
          type: 'quiz',
          id: 'ch02-q-vocab',
          questions: [
            {
              kind: 'match',
              id: 'ch02-q-vocab-1',
              prompt: 'Parameters or hyperparameters? Match each item:',
              pairs: [
                ['parameter', 'learned directly from the training data by the algorithm'],
                ['hyperparameter', 'set by the analyst before training begins'],
                ['$\\mathbf{w}$ and $b$ in an SVM', 'an example of parameters'],
                ['$k$ in k-Nearest Neighbors', 'an example of a hyperparameter'],
              ],
              explain:
                'If the algorithm tunes it from data, it’s a parameter; if you must choose it before pressing “train”, it’s a hyperparameter.',
            },
            {
              kind: 'match',
              id: 'ch02-q-vocab-2',
              prompt: 'Match each prediction task to its type:',
              pairs: [
                ['spam / not_spam for an email', 'binary classification'],
                ['one of 12 music genres for a song', 'multiclass classification'],
                ['the sale price of a house', 'regression'],
              ],
              explain:
                'Finite label set → classification (two classes = binary, more = multiclass); real-valued target → regression.',
            },
            {
              kind: 'match',
              id: 'ch02-q-vocab-3',
              prompt: 'Match each learning style to its signature:',
              pairs: [
                ['model-based', 'keeps learned parameters, discards the training data'],
                ['instance-based', 'keeps the whole dataset as the model'],
                ['deep learning', 'later parameters learn from outputs of earlier layers'],
              ],
              explain:
                'SVM is model-based (just $\\mathbf{w}^*, b^*$ survive), kNN is instance-based (the data *is* the model), and depth means layers feeding layers.',
            },
            {
              kind: 'tf',
              id: 'ch02-q-vocab-4',
              prompt: 'Most supervised learning algorithms are shallow.',
              answer: true,
              explain:
                'Shallow is the default: parameters learn straight from the features. Multi-layer neural networks are the famous exception.',
            },
            {
              kind: 'mcq',
              id: 'ch02-q-vocab-5',
              prompt: 'How does kNN predict the label of a new example?',
              choices: [
                'It finds the k closest training examples and outputs their most frequent label',
                'It applies the formula $\\mathrm{sign}(\\mathbf{w}\\mathbf{x} - b)$',
                'It averages all labels in the dataset',
                'It retrains a model from scratch on each query',
              ],
              answer: 0,
              explain:
                'kNN is pure neighborhood voting in feature space — which is why it must keep every training example around.',
            },
          ],
        },
      ],
    },
  ],
  bossPool: [
    {
      kind: 'mcq',
      id: 'ch02-boss-1',
      prompt: 'Which of these is a *matrix*?',
      choices: [
        'a rectangular array of numbers arranged in rows and columns',
        'an ordered list of scalar attributes',
        'a single numerical value',
        'an unordered collection of unique elements',
      ],
      answer: 0,
      explain:
        'Rows × columns = matrix (bold capital, like $\\mathbf{W}$). The other three are a vector, a scalar, and a set.',
    },
    {
      kind: 'numeric',
      id: 'ch02-boss-2',
      prompt: 'Compute the dot product of $[1, 2, 3]$ and $[4, 0, 2]$.',
      answer: 10,
      tolerance: 0.01,
      explain: '$1 \\times 4 + 2 \\times 0 + 3 \\times 2 = 4 + 0 + 6 = 10$ — a single scalar, as always.',
    },
    {
      kind: 'numeric',
      id: 'ch02-boss-3',
      prompt: 'Expand and evaluate $\\sum_{j=1}^{3} j^2$.',
      answer: 14,
      tolerance: 0.01,
      explain: 'Unroll the sigma: $1^2 + 2^2 + 3^2 = 1 + 4 + 9 = 14$.',
    },
    {
      kind: 'numeric',
      id: 'ch02-boss-4',
      prompt:
        'Apply Bayes’ Rule: $\\Pr(B \\mid A) = 0.9$, $\\Pr(A) = 0.1$, $\\Pr(B) = 0.18$. What is $\\Pr(A \\mid B)$?',
      answer: 0.5,
      tolerance: 0.01,
      explain: '$\\Pr(A \\mid B) = \\frac{0.9 \\times 0.1}{0.18} = \\frac{0.09}{0.18} = 0.5$ — a coin flip, despite the strong likelihood.',
    },
    {
      kind: 'match',
      id: 'ch02-boss-5',
      prompt: 'Match each symbol to its job:',
      pairs: [
        ['$\\sum$', 'add up a sequence of terms'],
        ['$\\prod$', 'multiply a sequence of terms'],
        ['$\\leftarrow$', 'assign a new value to a variable'],
        ['$|\\mathcal{S}|$', 'count the elements of a set'],
      ],
      explain:
        'Sigma sums, pi multiplies, the arrow assigns, and the cardinality bars count — four symbols that appear on nearly every page of ML.',
    },
    {
      kind: 'order',
      id: 'ch02-boss-6',
      prompt: 'Order the steps of iterative Bayesian parameter estimation:',
      items: [
        'Guess a prior $\\Pr(\\theta = \\hat\\theta)$ over the candidate parameter values',
        'Take one example $x$ from the sample',
        'Apply Bayes’ Rule to get the posterior $\\Pr(\\theta = \\hat\\theta \\mid X = x)$',
        'Use the updated probabilities as the prior for the next example',
      ],
      explain:
        'Prior → evidence → posterior → new prior: each example refines the belief, one Bayes update at a time.',
    },
    {
      kind: 'mcq',
      id: 'ch02-boss-7',
      prompt: 'What is the difference between $x^{(3)}$ and $x^3$?',
      choices: [
        'the first is attribute 3 of a vector; the second is x cubed',
        'they are two notations for the same thing',
        'the first is x cubed; the second is attribute 3',
        'the first only appears in neural networks',
      ],
      answer: 0,
      explain:
        'Parentheses in the superscript mean an index (a dimension), no parentheses means a power. Squaring an attribute needs both: $(x^{(3)})^2$.',
    },
    {
      kind: 'tf',
      id: 'ch02-boss-8',
      prompt: 'The open interval $(0, 1)$ contains the value 0.',
      answer: false,
      explain:
        'Parentheses exclude the endpoints: $(0,1)$ is everything strictly between 0 and 1. The bracketed $[0,1]$ would include both.',
    },
    {
      kind: 'mcq',
      id: 'ch02-boss-9',
      prompt: 'For a set $\\mathcal{A}$ and function $f$, what does $\\arg\\max_{a \\in \\mathcal{A}} f(a)$ return?',
      choices: [
        'the element of $\\mathcal{A}$ at which $f$ is highest',
        'the highest value $f(a)$ reaches',
        'the number of elements that maximize $f$',
        'the average of $f$ over the set',
      ],
      answer: 0,
      explain:
        'max returns the best *value*; argmax returns the *argument* achieving it. ML lives on argmax — we want the parameters, not the score.',
    },
    {
      kind: 'mcq',
      id: 'ch02-boss-10',
      prompt: 'If $f\'(c) = 0$ at some point $c$, what do we know about $f$ at $c$?',
      choices: [
        'its slope is horizontal there — flat ground, possibly a minimum or maximum',
        'the function is undefined at c',
        'the function must be at its global minimum',
        'the function is increasing at c',
      ],
      answer: 0,
      explain:
        'Zero derivative means zero slope. It *could* be a local minimum, a local maximum, or a plateau — flatness alone doesn’t say which.',
    },
    {
      kind: 'numeric',
      id: 'ch02-boss-11',
      prompt:
        'By the chain rule, $F(x) = (5x+1)^2$ has derivative $F\'(x) = 50x + 10$. Evaluate $F\'(1)$.',
      answer: 60,
      tolerance: 0.01,
      explain: '$F\'(1) = 50 \\times 1 + 10 = 60$: outer derivative $2(5x+1)$ times inner derivative 5, at $x=1$.',
    },
    {
      kind: 'mcq',
      id: 'ch02-boss-12',
      prompt: 'The gradient $\\nabla f$ of a multi-input function is…',
      choices: [
        'the vector of partial derivatives, pointing in the direction of steepest increase',
        'a single number describing the average slope',
        'the second derivative of the function',
        'the direction in which the function decreases fastest',
      ],
      answer: 0,
      explain:
        'One partial derivative per input, stacked into a vector that points uphill. Its negation, $-\\nabla f$, is the steepest way down.',
    },
    {
      kind: 'tf',
      id: 'ch02-boss-13',
      prompt: 'The probabilities in a pmf are each $\\ge 0$ and together sum to exactly 1.',
      answer: true,
      explain:
        'A pmf distributes one unit of probability across the countable values of a discrete random variable — nothing negative, nothing left over.',
    },
    {
      kind: 'mcq',
      id: 'ch02-boss-14',
      prompt: 'Why does a *continuous* random variable need a pdf instead of a pmf?',
      choices: [
        'it has infinitely many possible values, so each exact value has probability 0',
        'its values are not numbers',
        'a pmf would sum to more than 1',
        'continuous variables have no distribution',
      ],
      answer: 0,
      explain:
        'You can’t list probabilities for infinitely many points that each have probability zero — so probability is described by density, and lives in areas under the curve (total area 1).',
    },
    {
      kind: 'mcq',
      id: 'ch02-boss-15',
      prompt: 'The expectation $\\mathbb{E}[X]$ is also known as the…',
      choices: [
        'mean or expected value, often written μ',
        'standard deviation',
        'variance',
        'median',
      ],
      answer: 0,
      explain:
        'Mean, average, expected value, μ — four names for the probability-weighted center of the distribution.',
    },
    {
      kind: 'tf',
      id: 'ch02-boss-16',
      prompt:
        'The sample mean $\\frac{1}{N}\\sum_{i=1}^{N} x_i$ is an unbiased estimator of the true expectation $\\mathbb{E}[X]$.',
      answer: true,
      explain:
        'Averaged over unlimited fresh samples, sample means center exactly on the true mean — the definition of unbiasedness.',
    },
    {
      kind: 'mcq',
      id: 'ch02-boss-17',
      prompt: 'Which statement describes a *hyperparameter*?',
      choices: [
        'a property of the algorithm the analyst must set before training; not learned from data',
        'a variable the algorithm tunes directly from the training data',
        'the output of the trained model',
        'a synonym for the model’s weights',
      ],
      answer: 0,
      explain:
        'Hyperparameters (like $k$ in kNN) steer *how* learning happens; parameters (like $\\mathbf{w}, b$) are *what* is learned.',
    },
    {
      kind: 'mcq',
      id: 'ch02-boss-18',
      prompt: 'Which algorithm is the classic example of *instance-based* learning?',
      choices: ['k-Nearest Neighbors', 'Support Vector Machine', 'linear regression', 'gradient descent'],
      answer: 0,
      explain:
        'kNN keeps the entire dataset as its model and votes among neighbors at prediction time; SVM is model-based — it keeps only $\\mathbf{w}^*$ and $b^*$.',
    },
    {
      kind: 'tf',
      id: 'ch02-boss-19',
      prompt:
        'In deep learning, most model parameters are learned from the outputs of preceding layers rather than directly from the raw features.',
      answer: true,
      explain:
        'That layer-feeds-layer structure is precisely what makes a network “deep” — and what separates it from shallow learning.',
    },
    {
      kind: 'match',
      id: 'ch02-boss-20',
      prompt: 'Match each problem type to its description:',
      pairs: [
        ['binary classification', 'choose between exactly two classes'],
        ['multiclass classification', 'choose among three or more classes'],
        ['regression', 'predict a real-valued target'],
      ],
      explain:
        'Finite label set → classification, split by class count; a continuous numeric answer → regression.',
    },
  ],
};

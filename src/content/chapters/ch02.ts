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
            'Before the algorithms, the alphabet. A **[[scalar]]** is a single number — 15, or $-3.25$ — written as an italic letter like $x$ or $a$. A **[[vector]]** is an ordered list of scalars called *attributes*, written in bold: $\\mathbf{x}$, $\\mathbf{w}$. You can picture a vector two ways: as an arrow pointing somewhere, or as a point in multi-dimensional space — both pictures are the same list of numbers. Attribute $j$ of a vector is written with a superscript index: $x^{(j)}$. The index names a **dimension** — a fixed position in the list. These are the same $\\mathbf{w}$ and $\\mathbf{x}$ that already turned up in [Chapter 1’s spam classifier](sec:ch01-how-supervised-works); this section is the belated explanation of what they were.',
        },
        {
          type: 'p',
          md:
            'Careful: $x^{(2)}$ is *not* $x$ squared. The parenthesized superscript is an index; a plain superscript is a power. To square an indexed attribute you write $(x^{(j)})^2$. Variables can also carry two or more indices, like $x_{l,u}^{(j)}$ — in neural networks that could mean “input feature $j$ of unit $u$ in layer $l$”.',
        },
        {
          type: 'p',
          md:
            'A **[[matrix]]** is a rectangular grid of numbers — rows by columns — written as a bold capital like $\\mathbf{W}$. A **set** is an *unordered* collection of *unique* elements, written calligraphically: $\\mathcal{S}$. Sets can be finite, like $\\{1, 3, 18\\}$, or infinite intervals: $[a, b]$ includes both endpoints, $(a, b)$ excludes them, and $\\mathbb{R}$ is all real numbers. $x \\in \\mathcal{S}$ says “$x$ belongs to $\\mathcal{S}$”; $\\cap$ intersects two sets, $\\cup$ unites them, and $|\\mathcal{S}|$ counts the elements.',
        },
        {
          type: 'p',
          md:
            'The single most common symbol in ML papers is **[[sigma-notation|capital sigma]]** — a compact way to write “add all of these up”:',
        },
        {
          type: 'formula',
          tex: '\\sum_{i=1}^{n} x_i \\;\\stackrel{\\text{def}}{=}\\; x_1 + x_2 + \\dots + x_{n-1} + x_n',
          parts: [
            { tex: '\\sum_{i=1}^{n}', label: 'do this for i = 1, 2, … up to n' },
            { tex: 'x_i', label: 'the term you add each time' },
            { tex: '\\stackrel{\\text{def}}{=}' },
            { tex: 'x_1 + x_2 + \\dots + x_{n-1} + x_n', label: 'the same thing, written out in full' },
          ],
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
            'Read it out loud and the fear drains away: “for $i$ from 1 to $n$, add up $x_i$”. Three questions unlock any sigma you meet — where does the counter start, where does it stop, what is the recipe for one term? Everything else is decoration. Two facts make sigmas easy to push around, and both get used every time somebody differentiates an error function: sums split, $\\sum_i (a_i + b_i) = \\sum_i a_i + \\sum_i b_i$, and constants slide out, $\\sum_i c\\,a_i = c\\sum_i a_i$.',
        },
        {
          type: 'p',
          md:
            '**[[capital-pi-notation|Capital pi]]** is the same idea with multiplication instead of addition: $\\prod_{i=1}^{n} x_i \\stackrel{\\text{def}}{=} x_1 \\cdot x_2 \\cdot \\ldots \\cdot x_n$, where $a \\cdot b$ (or just $ab$) means $a$ times $b$. Both symbols also run over vector attributes, e.g. $\\sum_{j=1}^{m} x^{(j)}$. Pi shows up in almost exactly one place: combining the chances of independent events, which multiply. That is also its weakness — multiply four hundred numbers below 1 and a computer rounds the answer to zero — which is why the logarithm trick in [the Bayes section](sec:ch02-bayes) is not an optional flourish.',
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
            'Vectors support a few basic operations. The **sum** $\\mathbf{x} + \\mathbf{z}$ adds attribute by attribute; the difference subtracts the same way. Multiplying a vector by a scalar scales every attribute: $\\mathbf{x}c = [cx^{(1)}, \\dots, cx^{(m)}]$. The **[[dot-product|dot product]]** is different — it takes two vectors of the *same* dimensionality and returns a single scalar:',
        },
        {
          type: 'formula',
          tex: '\\mathbf{w}\\mathbf{x} \\;\\stackrel{\\text{def}}{=}\\; \\sum_{i=1}^{m} w^{(i)} x^{(i)}',
          parts: [
            { tex: '\\mathbf{w}\\mathbf{x}', label: 'the dot product of two vectors' },
            { tex: '\\stackrel{\\text{def}}{=}' },
            { tex: '\\sum_{i=1}^{m}', label: 'add up over all m positions' },
            { tex: 'w^{(i)} x^{(i)}', label: 'matching entries multiplied together' },
          ],
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
            'That definition says how to compute it and nothing about why anyone would want it. Two readings make it worth having. As a **weighted vote**: if $\\mathbf{x}$ records the features of an email and $\\mathbf{w}$ the weight the model places on each, then $\\mathbf{w}\\mathbf{x}$ totals up every piece of evidence, each scaled by how much it counts — which is precisely what the [spam classifier of Chapter 1](sec:ch01-how-supervised-works) computes before taking a sign. As **geometry**: $\\mathbf{w}\\mathbf{x} = \\|\\mathbf{w}\\|\\,\\|\\mathbf{x}\\|\\cos\\theta$, where $\\theta$ is the angle between the two arrows. Pointing the same way makes it large and positive, sitting at right angles makes it exactly zero, pointing oppositely makes it negative.',
        },
        {
          type: 'p',
          md:
            'A worked case, so the geometry is not merely asserted. Let $\\mathbf{w} = [3, 4]$ and $\\mathbf{x} = [4, 3]$. Multiply and add: $12 + 12 = 24$. Both vectors have length 5, so $\\cos\\theta = 24/25 = 0.96$ — an angle of about $16^{\\circ}$, meaning the two nearly, but not quite, point the same way. And setting $\\mathbf{x} = \\mathbf{w}$ gives $\\mathbf{w}\\mathbf{w} = \\|\\mathbf{w}\\|^{2}$, which is where the $\\|\\mathbf{w}\\|^{2}$ in the SVM objective came from: it is a dot product wearing a different hat.',
        },
        {
          type: 'p',
          md:
            'A few more workhorses. A **[[function-notation|function]]** $y = f(x)$ associates each element $x$ of its **domain** with a single element $y$ of its **codomain**; a bold $\\mathbf{f}(x)$ returns a whole vector. $\\max_{a \\in \\mathcal{A}} f(a)$ returns the *highest value* of $f$ over the set, while $\\arg\\max_{a \\in \\mathcal{A}} f(a)$ returns the *element that achieves it* — a distinction ML uses constantly. Finally, $a \\leftarrow f(x)$ is the **assignment operator**: variable $a$ *gets* the new value $f(x)$.',
        },
        {
          type: 'hint',
          md:
            'Reading tip: $f(x) \\ge f(c)$ for all $x$ near $c$ means $c$ is a **[[local-minimum|local minimum]]**; the smallest of all local minima is the **[[global-minimum|global minimum]]**. You’ll meet both again the moment we start [optimizing models](sec:ch04-gradient-descent) — and the difference between them is the difference between an optimizer that works and one that gets stuck.',
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
                'the value of $x$ raised to power 2',
                'the second example $\\mathbf{x}_2$ in the dataset',
                'the second attribute of the vector $\\mathbf{x}$',
                'the set whose elements are $x$ and 2',
              ],
              answer: 2,
              explain:
                'A parenthesized superscript indexes a dimension of the vector; a plain superscript is a power, so squaring attribute 2 needs both, $(x^{(2)})^2$. Examples are indexed with a *subscript*, as in $\\mathbf{x}_2$.',
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
              choices: ['9', '1', '3', '10'],
              answer: 1,
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
            'The **[[derivative]]** $f\'$ of a function $f$ describes how fast the function grows or shrinks. If the derivative is a constant — say 5, or $-3$ — the function climbs (or falls) at that same rate everywhere. If $f\'$ is itself a function, the pace changes from region to region: where $f\'(x) > 0$ the function is rising at $x$, where $f\'(x) < 0$ it is falling, and where $f\'(x) = 0$ the slope is horizontal — flat ground. Finding a derivative is called **differentiation**.',
        },
        {
          type: 'p',
          md:
            'Where does that number come from? Take two points on the curve, draw the straight line through them, measure its slope — then slide the second point towards the first and watch the slope settle. For $f(x) = x^2$ near $x = 3$: over a step of $0.1$ the rise is $3.1^2 - 3^2 = 0.61$, a slope of $6.1$. Over a step of $0.01$ the rise is $0.0601$, a slope of $6.01$. Over $0.001$, a slope of $6.001$. The number it closes in on — 6 — is the derivative at $x = 3$, and the rule $f\'(x) = 2x$ agrees. That limiting process *is* the definition; the rules below are shortcuts that save you from doing it by hand every time.',
        },
        {
          type: 'p',
          md:
            'Derivatives of basic functions are known facts: if $f(x) = x^2$ then $f\'(x) = 2x$; if $f(x) = 2x$ then $f\'(x) = 2$; the derivative of any constant is 0. For composed functions there is the **[[chain-rule|chain rule]]**: if $F(x) = f(g(x))$ then $F\'(x) = f\'(g(x))\\,g\'(x)$. The multiplication is the whole content of it, and gears make it obvious — if a gear turns 3 times for every turn of the handle, and a drum turns 5 times for every turn of that gear, the drum turns 15 times per turn of the handle. Rates through a chain multiply. Example: $F(x) = (5x+1)^2$ is the square (outer $f$) of $5x+1$ (inner $g$), so $F\'(x) = 2(5x+1) \\cdot 5 = 50x + 10$.',
        },
        {
          type: 'hint',
          md:
            'Keep the chain rule in view; it is not one topic among many. [Backpropagation](sec:ch06-neural-networks) — the algorithm that trains every neural network in existence — is the chain rule applied over and over, from the loss backwards to each individual weight, and it is nothing else besides.',
        },
        {
          type: 'p',
          md:
            'The **[[gradient]]** generalizes the derivative to functions with several inputs. Start with one input at a time. A **[[partial-derivative|partial derivative]]** asks: standing on a hillside, if I walk due east and refuse to move north at all, how steeply does the ground rise? Every other input is frozen — and a frozen variable is a constant, which is why its terms differentiate to zero and drop out of the answer.',
        },
        {
          type: 'p',
          md:
            'For $f([x^{(1)}, x^{(2)}]) = ax^{(1)} + bx^{(2)} + c$: differentiating with respect to $x^{(1)}$ gives $a$ (the $bx^{(2)}$ and $c$ terms are constants, contributing 0), and with respect to $x^{(2)}$ gives $b$. Something less flat makes the point better. For $f(x, y) = x^2 y$ the partials are $\\frac{\\partial f}{\\partial x} = 2xy$ and $\\frac{\\partial f}{\\partial y} = x^2$, which at the point $(2, 3)$ come to $12$ and $4$. Check the first against plain arithmetic: nudge $x$ from 2 to 2.01 and $f$ moves from $12$ to $12.1203$ — a rise of $0.1203$ for a step of $0.01$, a rate of $12.03$, closing on 12 as the step shrinks. The symbol is doing exactly what the nudge does.',
        },
        {
          type: 'p',
          md: 'The gradient collects the partials into a vector:',
        },
        {
          type: 'formula',
          tex: '\\nabla f \\;\\stackrel{\\text{def}}{=}\\; \\left[ \\frac{\\partial f}{\\partial x^{(1)}},\\; \\frac{\\partial f}{\\partial x^{(2)}} \\right]',
          parts: [
            { tex: '\\nabla f', label: 'the gradient of f' },
            { tex: '\\stackrel{\\text{def}}{=}' },
            {
              tex: '\\left[ \\frac{\\partial f}{\\partial x^{(1)}},\\; \\frac{\\partial f}{\\partial x^{(2)}} \\right]',
              label: 'one slope per input, listed side by side',
            },
          ],
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
            'The gradient has a geometric meaning worth more than the formula: it points in the direction of **steepest increase** — uphill — and its length says how steep that climb is. On $f(x,y) = x^2y$ at the point $(2,3)$ the gradient is $[12, 4]$: mostly east, a little north, with a steepness of $\\sqrt{12^2 + 4^2} \\approx 12.65$. Walk against it, along $-\\nabla f$, and you descend as fast as the surface allows.',
        },
        {
          type: 'p',
          md:
            'Why *that* direction and no other? Because the slope you feel walking in some direction $\\mathbf{u}$ is the [[dot-product|dot product]] $\\nabla f \\cdot \\mathbf{u}$ — and a dot product is largest when the two vectors point the same way. So the steepest direction is the gradient’s own, and the directions at right angles to it are exactly the ones along which the function does not change at all (walking around a hill rather than up it). Try both pictures below.',
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
            'Remember “zero slope = flat ground”. Training a model is largely a hunt for the place where the gradient of an error function is zero — [Chapter 4](sec:ch04-gradient-descent) turns this into the **[[gradient-descent|gradient descent]]** algorithm.',
        },
        {
          type: 'hint',
          md:
            'Flat ground is not automatically the bottom. A zero gradient marks a [[local-minimum|local minimum]], a maximum and a plateau alike, and on the error surface of a large model there are astronomically many of all three. This is why Chapter 4 spends its time on *how to walk downhill* rather than on solving for the flat spot directly: for anything past a straight line, solving is not on the table.',
        },
        {
          type: 'quiz',
          id: 'ch02-q-slopes',
          questions: [
            {
              kind: 'mcq',
              id: 'ch02-q-slopes-1',
              prompt: 'If $f\'(x) < 0$ at some point $x$, then at that point the function $f$ is…',
              choices: ['increasing', 'perfectly flat', 'undefined', 'decreasing'],
              answer: 3,
              explain:
                'A negative derivative means the function falls as $x$ grows; a positive one means it rises; exactly zero means the slope is horizontal. The derivative existing at all is what lets us ask the question.',
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
                'as a constant, so its terms drop out',
                'as a second variable that also moves freely',
                'as a copy of $x^{(1)}$, sharing the same value',
                'as a term to be deleted from the function first',
              ],
              answer: 0,
              explain:
                'A partial derivative moves one input at a time and freezes everything else, and a frozen term is a constant whose derivative is zero. The term is not deleted from the function — it simply contributes nothing to *this* slope.',
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
            'A **[[random-variable|random variable]]**, written as an italic capital like $X$, is a variable whose values are numerical outcomes of a random phenomenon: a coin flip (0 for heads, 1 for tails), a die roll, the height of the next stranger you pass. Random variables come in two kinds: **discrete** and **continuous**.',
        },
        {
          type: 'p',
          md:
            'A **discrete** random variable takes countably many distinct values. Its distribution is a list of probabilities, one per value, called the **[[probability-mass-function|probability mass function]]** (pmf) — for example $\\Pr(X = red) = 0.3$, $\\Pr(X = yellow) = 0.45$, $\\Pr(X = blue) = 0.25$. Every probability is $\\ge 0$ and the whole list sums to exactly 1.',
        },
        {
          type: 'p',
          md:
            'A **continuous** random variable (height, weight, time) takes infinitely many values in an interval — so the probability of any *exact* value is zero, and a list won’t do. Instead its distribution is a curve, the **[[probability-density-function|probability density function]]** (pdf): a nonnegative function whose total area under the curve equals 1. Probability lives in *areas* under the pdf, not in single points.',
        },
        {
          type: 'p',
          md:
            'Two numbers summarize a whole distribution, and between them they answer most practical questions: where it sits, and how spread out it is. Where it sits is the **[[expectation]]** — mean, average, expected value, $\\mu$, four names for one thing. Balance the list of probabilities on a pencil, and the expectation is the point where it balances.',
        },
        {
          type: 'formula',
          tex: '\\mathbb{E}[X] \\;\\stackrel{\\text{def}}{=}\\; \\sum_{i=1}^{k} x_i \\Pr(X = x_i)',
          parts: [
            { tex: '\\mathbb{E}[X]', label: 'the long-run average of X' },
            { tex: '\\stackrel{\\text{def}}{=}' },
            { tex: '\\sum_{i=1}^{k}', label: 'over every value X can take' },
            { tex: 'x_i', label: 'the value itself' },
            { tex: '\\Pr(X = x_i)', label: 'weighted by how often it comes up' },
          ],
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
            'The expectation is a *probability-weighted* average — frequent values pull it harder than rare ones. A fair die gives $\\frac{1+2+3+4+5+6}{6} = 3.5$, which repays a moment’s thought: the expectation is a value the die can never show. It is what the average of many rolls approaches, not a forecast of any single roll. For a continuous variable the sum becomes an integral, $\\mathbb{E}[X] = \\int_{\\mathbb{R}} x f_X(x)\\,dx$ — “summation for continuous domains”, and nothing more alarming than that.',
        },
        {
          type: 'p',
          md:
            'Spread is measured by the **[[variance]]**: take each value’s distance from the mean, square it so that overshooting and undershooting both count as spread, and average the results. For the fair die that is $\\frac{1}{6}\\sum_{x=1}^{6}(x - 3.5)^2 \\approx 2.92$. Squaring leaves the answer in squared units — squared pips, squared pounds — which nobody can picture, so it is usually reported as its square root, the **[[standard-deviation|standard deviation]]** $\\sigma \\stackrel{\\text{def}}{=} \\sqrt{\\mathbb{E}[(X - \\mu)^2]}$, about $1.71$ for the die. A typical roll lands roughly 1.7 away from 3.5, which sounds like the die you know.',
        },
        {
          type: 'p',
          md:
            'In practice we rarely know the true distribution — we only observe some values of $X$. Those observed values are **examples**, and the collection is a **sample** or dataset. A statistic computed from a sample, written $\\hat{\\theta}(S_X)$, is an **[[unbiased-estimator|unbiased estimator]]** of a true statistic $\\theta$ if $\\mathbb{E}[\\hat{\\theta}(S_X)] = \\theta$: average the estimate over unlimited fresh samples and you’d hit the true value exactly. This is not an academic nicety — every number you will ever report about a model, its accuracy and its error alike, is an estimate of this kind, computed on [data held back from training](sec:ch05-three-sets) that stands in for a world you cannot sample completely. The classic example — the **sample mean** is an unbiased estimator of the true expectation:',
        },
        {
          type: 'math',
          tex: '\\hat{\\mu} \\;=\\; \\frac{1}{N} \\sum_{i=1}^{N} x_i',
        },
        {
          type: 'hint',
          md:
            'The famous trap sits one step further on. The obvious sample variance, $\\frac{1}{N}\\sum_i (x_i - \\hat{\\mu})^2$, is *biased* — it comes out systematically too small. The deviations are measured from the sample’s own mean, which by construction sits closer to the sample than the true mean does, so the spread is understated every time. Dividing by $N - 1$ instead of $N$ corrects it exactly, and that is the entire reason for a denominator that otherwise looks like a typo.',
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
                'It returns exactly $\\theta$ on every sample it is given',
                'It is computed from a sample of at least 1000 examples',
                'Its expectation across samples equals the true $\\theta$',
                'It errs on the safe side by slightly overestimating $\\theta$',
              ],
              answer: 2,
              explain:
                'Any single sample gives a noisy estimate, and unbiasedness is the claim that the noise averages out: over unlimited fresh samples the mean estimate lands exactly on the true value. It says nothing about sample size, and a systematic overestimate is precisely what *bias* means.',
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
            'The **[[conditional-probability|conditional probability]]** $\\Pr(X = x \\mid Y = y)$ is the probability that $X$ equals $x$ *given that* we already know $Y$ equals $y$. The bar means “given”, and what it does is restrict attention to the slice of the world where the condition holds. **[[bayes-rule|Bayes’ Rule]]** lets you flip such a conditional around — compute the one you want from the one you know:',
        },
        {
          type: 'formula',
          tex: '\\Pr(X = x \\mid Y = y) = \\frac{\\Pr(Y = y \\mid X = x)\\,\\Pr(X = x)}{\\Pr(Y = y)}',
          // the prior is lifted out from under the bar — same arithmetic, but it
          // shows Bayes for what it is: a belief, adjusted by the evidence
          parts: [
            { tex: '\\Pr(X = x \\mid Y = y)', label: 'what you believe after the evidence' },
            { tex: '=' },
            {
              tex: '\\frac{\\Pr(Y = y \\mid X = x)}{\\Pr(Y = y)}',
              label: 'how much this evidence favors x',
            },
            { tex: '\\Pr(X = x)', label: 'what you believed before it' },
          ],
          terms: [
            {
              tex: '\\Pr(X = x \\mid Y = y)',
              explain: 'the [[posterior]]: what you want to know after seeing the evidence',
            },
            {
              tex: '\\Pr(Y = y \\mid X = x)',
              explain: 'the [[likelihood]]: how probable the evidence is if X were true',
            },
            { tex: '\\Pr(X = x)', explain: 'the [[prior]]: how probable X was before any evidence' },
            {
              tex: '\\Pr(Y = y)',
              explain: 'the evidence: the total probability of seeing Y = y at all',
            },
          ],
        },
        {
          type: 'p',
          md:
            'It looks like something you have to take on trust; it is two lines of algebra. The probability of both things happening can be written in either order — $\\Pr(X, Y) = \\Pr(X \\mid Y)\\Pr(Y)$, and equally $\\Pr(X, Y) = \\Pr(Y \\mid X)\\Pr(X)$. Set those two equal, divide through by $\\Pr(Y)$, and Bayes’ Rule falls out. Nothing has been added along the way: it is the definition of conditional probability, rearranged so that the conditional you know sits on the right and the one you want sits on the left.',
        },
        {
          type: 'p',
          md:
            'Why does this matter so much? Because intuition routinely ignores the **[[prior]]**. A test that is right 90% of the time *sounds* convincing — but if the illness it detects affects only 1% of people, most positive results come from the enormous healthy majority triggering false alarms.',
        },
        {
          type: 'p',
          md:
            'Count it out. Take 1,000 people; 1% are ill, so 10 are ill and 990 are not. The test catches 90% of the ill: 9 true positives. It also wrongly flags 10% of the healthy: 99 false alarms. So 108 people test positive and 9 of them are actually ill — a **[[posterior]]** of $9/108 \\approx 8.3\\%$. The test did nothing wrong. It is outnumbered: there are 99 healthy people for every ill one, and a 10% error rate applied to a crowd that size produces far more false positives than there are ill people in the room at all.',
        },
        {
          type: 'p',
          md:
            'There is a version of the same arithmetic that fits on a beer mat. Work in **odds** rather than probabilities, and the rule becomes: posterior odds = [[likelihood|likelihood ratio]] × prior odds. Here the prior odds are $1{:}99$, and the likelihood ratio — how much more often a positive shows up in the ill than in the healthy — is $0.9 / 0.1 = 9$. So the posterior odds are $9{:}99$, roughly $1{:}11$, which is the same $8.3\\%$ arrived at in one multiplication. In this form the lesson is unmissable: evidence *multiplies* your odds, it does not replace them, so a strong test applied to a rare condition still leaves you a long way from certainty. Counting dots makes it impossible to miss:',
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
            'Bayes’ Rule also powers **parameter estimation**. Suppose you model $X$’s unknown distribution with a formula $f_{\\boldsymbol\\theta}$ that has tunable parameters — for instance the Gaussian, whose parameter vector is $\\boldsymbol\\theta = [\\mu, \\sigma]$. Start from a guessed **prior** $\\Pr(\\theta = \\hat\\theta)$ over candidate values, then feed examples in one at a time: each pass through Bayes’ Rule turns the prior into a posterior $\\Pr(\\theta = \\hat\\theta \\mid X = x)$, which becomes the prior for the next example. The best single value is picked by **[[maximum-a-posteriori|maximum a posteriori]]** (MAP): $\\theta^* = \\arg\\max_{\\theta} \\prod_{i=1}^{N} \\Pr(\\theta = \\hat\\theta \\mid X = x_i)$.',
        },
        {
          type: 'p',
          md:
            'One line of that is worth unpacking, because it is where regularization secretly comes from. Take the logarithm of $\\Pr(x \\mid \\theta)\\Pr(\\theta)$ and the product becomes $\\log\\Pr(x \\mid \\theta) + \\log\\Pr(\\theta)$: a term measuring fit, plus a term depending only on the parameters. Drop the prior and you have plain [[maximum-likelihood]]. Keep a prior that prefers small parameter values and the second term turns into a penalty on large weights — which is exactly the [[l2-regularization|L2 penalty]] of [Chapter 5](sec:ch05-regularization). Two of the most useful ideas in the book turn out to be one idea, seen from opposite ends.',
        },
        {
          type: 'hint',
          md:
            'Multiplying many probabilities produces astronomically tiny numbers that computers can’t store. The standard trick: maximize the *logarithm* instead — the log turns the product $\\prod$ into a sum $\\sum$, and machines are much happier adding. The same move reappears the moment [logistic regression is fitted](sec:ch03-logistic-regression), where it has a name of its own: the [[log-likelihood]].',
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
                'A test loses accuracy when the condition it screens for is rare',
                'Far more healthy people are tested, so false alarms dominate',
                '90% accuracy means 90% of the positive results are wrong',
                'The prior rate of the condition does not enter the posterior',
              ],
              answer: 1,
              explain:
                'Out of 1000 people, 10% of the ~990 healthy ones gives ~99 false positives, against only ~9 true positives from the 10 who are sick. The test’s accuracy never changed — the tiny prior is what drags the posterior down to roughly 8%.',
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
            'Two kinds of knobs live inside every learning setup, and confusing them is the classic beginner mistake. **[[model-parameters|Parameters]]** are the variables that *define the model itself* — the learning algorithm adjusts them directly from the training data (the SVM’s $\\mathbf{w}^*$ and $b^*$ from [Chapter 1](sec:ch01-how-supervised-works)). **[[hyperparameter|Hyperparameters]]** are properties of the *algorithm*, not the model: the analyst must fix them *before* training starts, because the algorithm cannot learn them from data. How to choose them well is [a Chapter 5 story](sec:ch05-tuning).',
        },
        {
          type: 'p',
          md:
            'When you are unsure which one you are holding, there is a quick test. Could the algorithm settle it by looking harder at the training data? If yes, it is a parameter. If asking the training data would always return the same unhelpful answer — “more flexibility, please, and no penalties” — it is a hyperparameter, and it has to be decided elsewhere, on examples the model was never fitted to.',
        },
        {
          type: 'p',
          md:
            '**[[classification]]** means assigning a **label** from a finite set of **classes** to an unlabeled example — spam detection is the flagship case. Two classes (sick/healthy, spam/not_spam) make it **[[binary-classification|binary classification]]**; three or more make it **[[multiclass-classification|multiclass]]** — though each example still gets exactly one label.',
        },
        {
          type: 'p',
          md:
            '**[[regression]]** instead predicts a real-valued **target**: estimating a house price from its area, bedrooms and location. Both are solved the same way at heart — feed labeled examples to a learning algorithm, get a model, apply it to new examples, and [Chapter 3](sec:ch03-linear-regression) works through one of each. The difference that matters is what “wrong” means. A classifier is either right or it is not; a regressor is wrong *by an amount*, so its error has to care how far off it landed, and its scores are distances rather than counts.',
        },
        {
          type: 'p',
          md:
            '**[[model-based-learning|Model-based]]** algorithms — most of them — use the training data to build a compact model with learned parameters, then *throw the data away*: a trained SVM keeps only $\\mathbf{w}^*$ and $b^*$. **[[instance-based-learning|Instance-based]]** algorithms keep the whole dataset *as* the model. The best-known is **k-Nearest Neighbors** (kNN): to label a new example it looks at the $k$ closest training examples in feature space and outputs the label it sees most often in that neighborhood — [Chapter 3 builds one](sec:ch03-knn).',
        },
        {
          type: 'p',
          md:
            'Finally, **shallow** versus **deep**. A shallow algorithm learns its parameters *directly from the features* of the training examples — most supervised algorithms work this way. The notorious exception is the **neural network** with more than one **layer** between input and output: a **deep** network. In deep learning, most parameters learn not from the raw features but *from the outputs of preceding layers*. If that sounds abstract, relax — [Chapter 6](sec:ch06-neural-networks) opens the box.',
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
                'It applies the formula $\\mathrm{sign}(\\mathbf{w}\\mathbf{x} - b)$ learned at training time',
                'It averages the labels of every example in the dataset',
                'It retrains a model from scratch for each query',
                'It takes the majority label among the k nearest examples',
              ],
              answer: 3,
              explain:
                'kNN is pure neighborhood voting in feature space, which is exactly why it must keep every training example around. Nothing is fitted in advance and nothing is refitted per query — the lookup *is* the prediction.',
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
        'a rectangular array of numbers in rows and columns',
        'an ordered list of scalar attributes, written in bold',
        'a single numerical value, written as an italic letter',
        'an unordered collection of unique elements, written $\\mathcal{S}$',
      ],
      answer: 0,
      explain:
        'Rows × columns makes a matrix, written as a bold capital like $\\mathbf{W}$. The other three describe a vector, a scalar and a set — and each one names its own notation correctly.',
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
        'they are two notations for exactly the same quantity',
        'the first is x cubed; the second is attribute 3',
        'the first is attribute 3 of a vector; the second is x cubed',
        'the first indexes a layer; the second indexes a dimension',
      ],
      answer: 2,
      explain:
        'Parentheses in the superscript mean an index — a dimension — while no parentheses means a power. Squaring an attribute therefore needs both: $(x^{(3)})^2$. Layer indices exist too, but they appear as extra subscripts, not in place of the dimension index.',
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
        'the highest value $f(a)$ reaches over the set',
        'the element of $\\mathcal{A}$ at which $f$ is highest',
        'the number of elements at which $f$ is highest',
        'the average of $f(a)$ over all elements of $\\mathcal{A}$',
      ],
      answer: 1,
      explain:
        'max returns the best *value*; argmax returns the *argument* that achieves it. Machine learning lives on argmax, because what we want out of an optimization is the parameters, not the score they earned.',
    },
    {
      kind: 'mcq',
      id: 'ch02-boss-10',
      prompt: 'If $f\'(c) = 0$ at some point $c$, what do we know about $f$ at $c$?',
      choices: [
        'the function is undefined at the point $c$',
        'the function must be at its global minimum there',
        'the function is still increasing as it passes $c$',
        'its slope is horizontal there — flat ground',
      ],
      answer: 3,
      explain:
        'Zero derivative means zero slope. It *could* be a local minimum, a local maximum, or a plateau — flatness alone does not say which, and it certainly does not promise the *global* minimum.',
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
        'the vector of partial derivatives, one per input',
        'a single number giving the function’s average slope',
        'the second derivative, measuring how the slope changes',
        'the direction in which the function decreases fastest',
      ],
      answer: 0,
      explain:
        'One partial derivative per input, stacked into a vector — and that vector points in the direction of steepest *increase*, uphill. Its negation $-\\nabla f$ is the steepest way down, which is why optimizers step along it.',
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
        'its values are measurements rather than plain numbers',
        'a pmf over its values would sum to far more than 1',
        'each exact value has probability 0, so a list fails',
        'a continuous variable has no single fixed distribution',
      ],
      answer: 2,
      explain:
        'With infinitely many possible values, each single point carries probability zero, so there is nothing to list. Probability is described instead by a *density*, and it lives in the areas under that curve — which still total exactly 1.',
    },
    {
      kind: 'mcq',
      id: 'ch02-boss-15',
      prompt: 'The expectation $\\mathbb{E}[X]$ is also known as the…',
      choices: [
        'standard deviation, the typical spread around μ',
        'mean, also called the expected value or μ',
        'variance, the square of the standard deviation',
        'median, the value with half the mass on each side',
      ],
      answer: 1,
      explain:
        'Mean, average, expected value, μ — four names for the same probability-weighted center of the distribution. The other three are all real statistics, but they describe spread or position, not the center of mass.',
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
        'a variable the algorithm tunes from the training data',
        'a value the trained model outputs for each new example',
        'another name for the weights the model ends up with',
        'a property of the algorithm the analyst sets before training',
      ],
      answer: 3,
      explain:
        'Hyperparameters such as $k$ in kNN steer *how* learning happens and cannot be read off the data; parameters such as $\\mathbf{w}$ and $b$ are *what* the algorithm learns. Confusing the two is the classic beginner mistake.',
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

import type { Chapter } from '../schema';

/** Chapter 1 — Introduction (book pp. 3–9), paraphrased in original words. */
export const ch01: Chapter = {
  id: 'ch01',
  number: 1,
  title: 'Introduction',
  subtitle: 'What machine learning is — and why it works',
  pdfPages: [3, 9],
  badgeId: 'ch01',
  sections: [
    {
      id: 'ch01-what-is-ml',
      title: 'Machines Don’t Learn',
      minutes: 4,
      blocks: [
        {
          type: 'p',
          md:
            'Here is an honest way to start: **machines don’t actually learn**. What a “learning machine” really does is find a mathematical formula which, applied to a pile of inputs called the **[[dataset|training data]]**, produces the outputs we want. The useful part is that the same formula keeps producing correct outputs for *most new inputs too* — as long as those new inputs come from the same statistical distribution the training data came from.',
        },
        {
          type: 'p',
          md:
            'Why isn’t that “learning”? Because it is brittle in a way animal learning is not. If you learned a video game looking straight at the screen, you would still play fine if someone tilted the screen a little. A model trained on straight-screen data would suddenly fail on the tilted screen — unless it was explicitly trained on rotated examples as well.',
        },
        {
          type: 'hint',
          md:
            'The name “machine learning” is partly marketing: Arthur Samuel coined it at IBM in **1959** to make the technology sound exciting — much like “cognitive computing” decades later. The word “learning” is an analogy to animal learning, not the real thing.',
        },
        {
          type: 'p',
          md:
            'Still, **[[machine-learning|machine learning]]** is a universally accepted name for a real and useful discipline: the science and engineering of building machines that do useful things **without being explicitly programmed** to do them. A more practical definition: solve a problem by 1) collecting a **[[dataset]]**, and 2) algorithmically building a **[[model|statistical model]]** from that dataset, which you then use to solve the original problem.',
        },
        {
          type: 'p',
          md:
            'One distinction is worth fixing before anything else, because every later chapter leans on it: the **learning algorithm** is the procedure, the **model** is what the procedure produces. Support Vector Machine is an algorithm; the particular boundary it fits to your 10,000 emails is a model. Run the same algorithm over a different pile of emails and you get a different model — which is why “the model” is always a statement about one specific dataset, and why swapping the data is a far bigger change than swapping the algorithm. [Chapter 2 collects the rest of this vocabulary](sec:ch02-ml-vocabulary) in one place.',
        },
        {
          type: 'quiz',
          id: 'ch01-q-what',
          questions: [
            {
              kind: 'mcq',
              id: 'ch01-q-what-1',
              prompt: 'What does a supervised “learning machine” fundamentally produce?',
              choices: [
                'An indexed store of past answers to look up on demand',
                'A compressed copy of the training data it was given',
                'A formula that maps feature vectors to desired outputs',
                'A set of hand-written rules supplied by human experts',
              ],
              answer: 2,
              explain:
                'Training searches for a formula — the model — that reproduces the desired outputs on the training data and, if all goes well, on new data from the same distribution. Nothing is memorized, compressed or hand-authored along the way.',
            },
            {
              kind: 'tf',
              id: 'ch01-q-what-2',
              prompt:
                'A model trained on data from one distribution is expected to keep working on inputs drawn from a completely different distribution.',
              answer: false,
              explain:
                'The guarantee only covers inputs from the same (or a very similar) distribution as the training data — that is exactly the sense in which machines don’t truly “learn”.',
            },
            {
              kind: 'order',
              id: 'ch01-q-what-3',
              prompt: 'Put the machine-learning workflow in order:',
              items: [
                'Gather a dataset',
                'Algorithmically build a statistical model from it',
                'Use the model to solve the practical problem',
              ],
              explain: 'Dataset → model → predictions: that is the whole pipeline in miniature.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch01-types-of-learning',
      title: 'Four Kinds of Learning',
      minutes: 6,
      blocks: [
        {
          type: 'p',
          md:
            'Learning comes in four flavors: **supervised**, **unsupervised**, **semi-supervised**, and **reinforcement**. What separates them is not the algorithm but the *kind of feedback* the machine gets — the full answer for every example, no answers at all, answers for a lucky few, or nothing but a score that arrives long after the decision that earned it.',
        },
        {
          type: 'p',
          md:
            'In **[[supervised-learning|supervised learning]]** the dataset is a collection of *labeled examples* $\\{(\\mathbf{x}_i, y_i)\\}_{i=1}^N$ — notation unpacked in [Chapter 2](sec:ch02-data-structures). Each $\\mathbf{x}_i$ is a **[[feature-vector|feature vector]]**: a list of values (features) that each describe the example in a fixed way — feature $j$ means the same thing for every example (height, weight, word counts, …). The **[[label]]** $y_i$ is what we want to predict: one of a finite set of **classes** (spam / not_spam), or a real number, or something more complex. The goal is a **model** that deduces the correct label from a new feature vector.',
        },
        {
          type: 'p',
          md:
            'Make that concrete. To guess whether a customer will renew a subscription you might describe each one with four numbers — months subscribed, logins last month, support tickets opened, price paid — so a single example is $\\mathbf{x}_i = [14, 22, 0, 9.99]$ with $y_i = 1$ for renewed. Ten thousand such rows are the entirety of what the algorithm sees: no names, no story, no idea what a “support ticket” is. Whatever it learns, it learns from the arithmetic of those four columns, which is worth remembering the next time a model surprises you.',
        },
        {
          type: 'p',
          md:
            'In **[[unsupervised-learning|unsupervised learning]]** the examples come *without labels*: $\\{\\mathbf{x}_i\\}_{i=1}^N$. The model transforms each vector into something useful on its own: the id of a **cluster** it belongs to ([clustering](sec:ch09-kmeans)), a shorter vector ([dimensionality reduction](sec:ch09-pca)), or a score for how untypical it is ([outlier detection](sec:ch09-outliers)).',
        },
        {
          type: 'p',
          md:
            'The catch is scoring. In supervised learning you count how many predictions were right; here there is no right answer to count against, so “did it work?” becomes a matter of internal measures and of whether anything downstream improved. A clustering that looks beautiful and turns out to have grouped your customers by nothing more interesting than time zone is not detectably wrong — it is only useless, and telling those two apart is the whole difficulty of the field.',
        },
        {
          type: 'p',
          md:
            'In **[[semi-supervised-learning|semi-supervised learning]]** the dataset mixes a few labeled examples with many unlabeled ones. Extra unlabeled data may look like extra uncertainty, but it actually tells the algorithm more about where the data lives — a bigger sample sketches the underlying distribution better, and a good algorithm can exploit that.',
        },
        {
          type: 'p',
          md:
            'Why should examples with no answers help at all? Picture two dense clouds of points with a thin gap between them, and only three points labeled. A boundary drawn from those three alone could sit almost anywhere; a boundary that must *also* avoid slicing through the middle of either cloud has hardly any room left. That is the assumption doing the work — examples in the same dense clump share a label — and when the assumption is false, the extra data drags the boundary confidently to the wrong place. [Chapter 7 gets into the recipes](sec:ch07-few-labels).',
        },
        {
          type: 'p',
          md:
            'In **[[reinforcement-learning|reinforcement learning]]** the machine “lives” in an environment. It perceives a **state**, executes **actions**, and collects **rewards**. Its goal is a **[[policy]]**: a function from states to the actions that maximize expected long-term reward. This suits *sequential* decision problems — game playing, robotics, logistics — where there is no such thing as a single correct answer to copy, only a long chain of choices that ends well or badly.',
        },
        {
          type: 'p',
          md:
            'Two things make this genuinely harder than supervised learning, and both are worth knowing even if you never train an agent. The first is **delayed reward**. A chess engine that loses in forty moves is handed one number at the end: it was told the game was lost, never which move lost it. Spreading that single verdict back across forty decisions is the *credit assignment* problem, and it has no counterpart in a setting where every example arrives with its own answer stapled to it.',
        },
        {
          type: 'p',
          md:
            'The second is that the data is not handed over at all. A supervised learner is given its examples; an agent *generates* its own by acting, so a policy that never tries the unfamiliar door never finds out what is behind it. Trading **exploration** against exploiting what already works is the central tension of the field — and it means a reinforcement learner can fail not by fitting its data badly, but by never collecting the data that mattered.',
        },
        {
          type: 'hint',
          md:
            'Reinforcement learning is a course of its own, and this one leaves it here: every algorithm ahead assumes a fixed pile of examples that does not answer back. The phrase to search if you want the real thing is *Markov decision process* — states, actions, rewards, and a discount factor $\\gamma$ that gives “long-term” a precise meaning. At $\\gamma = 0.9$, a reward forty steps away is worth $0.9^{40} \\approx 1.5\\%$ of the same reward right now, which is how an agent ends up preferring a bird in the hand.',
        },
        {
          type: 'hint',
          md:
            'These four are the traditional carve-up, not a law of nature. A great deal of modern practice sits in between: [[self-supervised-learning|self-supervised]] methods manufacture labels out of the raw data itself — hide a word, predict it; hide a patch of an image, predict that — and then run perfectly ordinary supervised learning on the result. It is how most large language and vision models are trained, and it needs no human labeler at all.',
        },
        {
          type: 'widget',
          id: 'TaskSorter',
          challenge: {
            id: 'ch01-challenge-sorter',
            label: 'sort all 8 scenarios correctly',
            xp: 15,
          },
        },
        {
          type: 'quiz',
          id: 'ch01-q-types',
          questions: [
            {
              kind: 'mcq',
              id: 'ch01-q-types-1',
              prompt: 'What distinguishes semi-supervised learning from supervised learning?',
              choices: [
                'The labels are real numbers instead of classes',
                'The dataset also contains many unlabeled examples',
                'There is no dataset, only rewards from the environment',
                'The model returns cluster ids instead of labels',
              ],
              answer: 1,
              explain:
                'The goal is the same as supervised learning — predict a label — but the algorithm can also exploit a usually much larger pool of unlabeled examples. Real-valued labels would still be supervised (that is regression), rewards belong to reinforcement learning, and cluster ids are unsupervised output.',
            },
            {
              kind: 'match',
              id: 'ch01-q-types-2',
              prompt: 'Match each learning type to its signature ingredient:',
              pairs: [
                ['Supervised', 'labeled examples $(\\mathbf{x}_i, y_i)$'],
                ['Unsupervised', 'feature vectors only, no labels'],
                ['Reinforcement', 'states, actions and rewards'],
              ],
              explain:
                'Supervised = labels, unsupervised = no labels, reinforcement = an environment giving rewards for actions.',
            },
            {
              kind: 'tf',
              id: 'ch01-q-types-3',
              prompt:
                'In a feature vector, the value at position $j$ must describe the same kind of information for every example in the dataset.',
              answer: true,
              explain:
                'That consistency is what makes the vectors comparable: if $x^{(2)}$ is weight in kg for one person, it is weight in kg for everyone.',
            },
            {
              kind: 'mcq',
              id: 'ch01-q-types-4',
              prompt: 'Which task is a natural fit for *unsupervised* learning?',
              choices: [
                'Predicting tomorrow’s temperature from past labeled records',
                'Learning to play backgammon from win and lose feedback',
                'Diagnosing X-rays from a database of doctor-labeled scans',
                'Grouping news articles by topic when none were assigned',
              ],
              answer: 3,
              explain:
                'No labels were given, so the structure — the topic groups — has to be discovered by the algorithm itself. That is clustering. The other three all hand the algorithm either labels or rewards to learn from.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch01-how-supervised-works',
      title: 'How Supervised Learning Works',
      minutes: 8,
      blocks: [
        {
          type: 'p',
          md:
            'Let’s walk one example end to end: **spam detection**. You gather 10,000 email messages, each labeled *spam* or *not_spam*. Machines can’t read email, so each message must become a **[[feature-vector|feature vector]]**. One classic recipe, **[[bag-of-words|bag of words]]**, uses a dictionary of, say, 20,000 English words: feature $j$ is 1 if the message contains dictionary word $j$, else 0. Now every message is a 20,000-dimensional vector of 0s and 1s, paired with its label.',
        },
        {
          type: 'p',
          md:
            'Two things about that vector are worth noticing before we move on. It is enormous and almost entirely zeros — a typical email uses a couple of hundred distinct dictionary words out of twenty thousand, so roughly 99% of every vector is 0, and any sensible implementation stores only the positions that are not. And it has discarded word order completely: “free money now” and “now money free” produce the identical vector. For spam that loss turns out to be survivable, because spam is mostly betrayed by its vocabulary. For translation it would be fatal. Choosing what the numbers should be, and what gets thrown away in the process, is [feature engineering](sec:ch05-feature-engineering) — and it decides more outcomes than the choice of algorithm does.',
        },
        {
          type: 'p',
          md:
            'Labels also need to be numbers. The algorithm featured here — the **[[support-vector-machine|Support Vector Machine]]** — wants spam $= +1$ and not_spam $= -1$. At this point you have a **[[dataset]]** and a **learning algorithm**, and you apply the second to the first to get the **[[model]]**.',
        },
        {
          type: 'p',
          md:
            'SVM views every feature vector as a point in high-dimensional space. It draws a **[[hyperplane]]** — a straight line’s counterpart in 20,000 dimensions — that separates the $+1$ points from the $-1$ points. Any boundary separating classes is called a **[[decision-boundary|decision boundary]]**. The hyperplane is written with two **[[model-parameters|parameters]]**: a vector $\\mathbf{w}$ and a number $b$:',
        },
        {
          type: 'formula',
          tex: '\\mathbf{w}\\mathbf{x} - b = 0',
          parts: [
            { tex: '\\mathbf{w}\\mathbf{x}', label: 'every feature, weighted and added up' },
            { tex: '-' },
            { tex: 'b', label: 'a learned offset' },
            { tex: '= 0', label: 'right on the fence — this is the boundary' },
          ],
          terms: [
            { tex: '\\mathbf{w}', explain: 'a weight for each feature; learned from the data' },
            { tex: '\\mathbf{x}', explain: 'the feature vector of the message being classified' },
            {
              tex: '\\mathbf{w}\\mathbf{x}',
              explain: 'shorthand for w^{(1)}x^{(1)} + w^{(2)}x^{(2)} + \\dots + w^{(D)}x^{(D)}',
            },
            { tex: 'b', explain: 'a learned offset that shifts the boundary away from the origin' },
          ],
        },
        {
          type: 'p',
          md: 'Predictions take the sign of that expression — which side of the boundary is the point on?',
        },
        {
          type: 'math',
          tex: 'y = \\mathrm{sign}(\\mathbf{w}\\mathbf{x} - b)',
        },
        {
          type: 'p',
          md:
            'Learning means finding the best values $\\mathbf{w}^*$ and $b^*$. But “best” needs saying carefully, because when two clouds of points can be separated at all, they can usually be separated in infinitely many ways — tilt the boundary a little, shift it a little, and it still gets every training example right. All of those boundaries score full marks on the data you already have. SVM breaks the tie with a second demand: sit as far as possible from *both* clouds.',
        },
        {
          type: 'p',
          md:
            'The empty corridor between the boundary and the nearest examples on either side is the **[[margin]]**, and its width is what SVM maximizes. The argument for it is a bet about the future: a boundary squeezed up against a training point will misclassify any new point of that class that happens to land slightly further out, while a boundary with room to spare absorbs that scatter without changing its answer. Width, here, *is* **[[generalization]]** — bought in advance, out of data you have not seen yet.',
        },
        {
          type: 'p',
          md:
            'Turning that into arithmetic takes one careful step, and it is the step most introductions skip. The expression $\\mathbf{w}\\mathbf{x} - b$ is *not* a distance: multiply both $\\mathbf{w}$ and $b$ by 10 and every score grows tenfold while the boundary has not moved an inch. The genuine distance from a point to the hyperplane is $\\frac{|\\mathbf{w}\\mathbf{x} - b|}{\\|\\mathbf{w}\\|}$ — dividing by the length of $\\mathbf{w}$ is what cancels the arbitrary scaling. SVM disposes of the ambiguity by *choosing* a scale: it insists the closest examples score exactly $\\pm 1$.',
        },
        {
          type: 'p',
          md:
            'Everything follows from that choice. The nearest points now sit on the two “touching” hyperplanes $\\mathbf{w}\\mathbf{x} - b = 1$ and $\\mathbf{w}\\mathbf{x} - b = -1$, each at distance $\\frac{1}{\\|\\mathbf{w}\\|}$ from the boundary, so the corridor is $\\frac{2}{\\|\\mathbf{w}\\|}$ wide. Maximizing that fraction means *minimizing* the norm $\\|\\mathbf{w}\\|$ — and the requirement that no example strays into the corridor is written $y_i(\\mathbf{w}\\mathbf{x}_i - b) \\ge 1$ for every example, one inequality apiece, with the $\\pm 1$ label encoding quietly covering both classes in a single line.',
        },
        {
          type: 'p',
          md:
            'Worth doing once with real numbers. Take two examples in two dimensions: a positive at $(1, 1)$ and a negative at $(-1, -1)$. The widest corridor between them runs through the origin at right angles to the segment joining them — the line $x^{(1)} + x^{(2)} = 0$. To make each point score exactly $\\pm 1$ we need $\\mathbf{w} = [0.5,\\, 0.5]$ and $b = 0$: then $\\mathbf{w}\\mathbf{x} = 0.5 + 0.5 = 1$ at the positive point and $-1$ at the negative one. Its length is $\\|\\mathbf{w}\\| = \\sqrt{0.25 + 0.25} \\approx 0.707$, so the margin is $2 / 0.707 \\approx 2.83$ — exactly the distance between the two points, which is what it should be when they are the only two.',
        },
        {
          type: 'hint',
          md:
            'The scale-fixing move is not a trick played to make the algebra tidy — it is why the SVM objective is usually written $\\min \\frac{1}{2}\\|\\mathbf{w}\\|^2$ rather than “maximize the margin”. Squaring changes nothing about *where* the minimum sits (the norm is never negative), and the halving makes the derivative come out as a clean $\\mathbf{w}$ instead of $2\\mathbf{w}$.',
        },
        {
          type: 'widget',
          id: 'SpamLine',
          challenge: {
            id: 'ch01-challenge-spamline',
            label: 'separate spam from mail with 0 errors',
            xp: 15,
          },
        },
        {
          type: 'hint',
          md:
            'Real SVMs also handle noise (some points can never be separated) with a penalty [[hyperparameter]], and curved boundaries with **kernels** — both arrive in [Chapter 3](sec:ch03-svm).',
        },
        {
          type: 'quiz',
          id: 'ch01-q-svm',
          questions: [
            {
              kind: 'mcq',
              id: 'ch01-q-svm-1',
              prompt: 'In the spam example, what does the bag-of-words step accomplish?',
              choices: [
                'Turns each message into a fixed-length numeric vector',
                'Strips the known spam words out of every message',
                'Compresses the 10,000 messages so they fit in memory',
                'Assigns the +1 and −1 labels to each message automatically',
              ],
              answer: 0,
              explain:
                'Learning algorithms consume numbers, not text. Each message becomes a 20,000-dimensional vector of 0s and 1s recording which dictionary words appear; the labels are converted separately, in a step of their own.',
            },
            {
              kind: 'mcq',
              id: 'ch01-q-svm-2',
              prompt: 'A trained SVM predicts the label of a new message by computing:',
              choices: [
                'the distance to the nearest training example',
                'the average of all the training labels',
                'the sign of $\\mathbf{w}^*\\mathbf{x} - b^*$ for the new vector',
                'the count of spam words the message contains',
              ],
              answer: 2,
              explain:
                'The model is $f(\\mathbf{x}) = \\mathrm{sign}(\\mathbf{w}^*\\mathbf{x} - b^*)$: the positive side of the hyperplane means spam (+1), the negative side means not_spam (−1). No training example is consulted at prediction time — the two parameters are all that survive training.',
            },
            {
              kind: 'mcq',
              id: 'ch01-q-svm-3',
              prompt: 'Why does SVM prefer the boundary with the *largest* margin?',
              choices: [
                'It makes the training optimization converge much faster',
                'It leaves room for new points to land on the correct side',
                'It reduces the number of features the model has to use',
                'It guarantees zero training errors on any separable data',
              ],
              answer: 1,
              explain:
                'A boundary far from both classes tolerates the natural scatter of future examples, so a slightly unusual point still lands on the right side — that bought distance *is* generalization. Note that *any* separating boundary already achieves zero training error; the margin is about the examples you have not seen yet.',
            },
            {
              kind: 'tf',
              id: 'ch01-q-svm-4',
              prompt: 'Minimizing $\\|\\mathbf{w}\\|$ is how the SVM maximizes the margin between classes.',
              answer: true,
              explain:
                'The two extreme hyperplanes sit $\\frac{2}{\\|\\mathbf{w}\\|}$ apart — a smaller norm means a wider corridor.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch01-why-it-works',
      title: 'Why Models Work on New Data',
      minutes: 4,
      blocks: [
        {
          type: 'p',
          md:
            'Why should a boundary drawn from 10,000 old emails classify tomorrow’s email? Because of how the data was collected. If training examples are drawn *randomly and independently* by the same process that will produce future examples, then a new spam message is **statistically likely** to land near the other spam messages, and a new normal message near the normal ones. The boundary that separated the training clouds then, with high probability, separates the new arrivals too. Performing on data it was never shown is the only thing a model is really for, and it has a name: **[[generalization]]**.',
        },
        {
          type: 'p',
          md:
            'It is not a guarantee — unlikely inputs happen, and the model will make errors on some of them. But *less likely situations mean fewer errors*: on typical data the correct predictions dominate. And the larger the training set, the smaller the chance that a new example looks unlike everything seen before. This is also the reason any number a model reports about itself has to be measured on [examples held back from training](sec:ch05-three-sets): performance on data the model was fitted to says nothing about the arrivals still to come.',
        },
        {
          type: 'p',
          md:
            'This intuition explains why SVM chases the biggest **[[margin]]**: putting the boundary as far as possible from both classes minimizes the probability that a slightly unusual new example crosses to the wrong side.',
        },
        {
          type: 'p',
          md:
            'The assumption has a name — the data is *independent and identically distributed* — and it is the one that breaks first in practice. Spammers read the same research you do and change their vocabulary. A camera is replaced with a different model. A pricing model trained before a crash meets the world after it. Nothing in training warns you when this happens, because training data cannot know about a world collected after it. This is why deployed models are monitored rather than trusted, and why the honest question about any model is not “is it accurate?” but “is the world still the one it was fitted to?” The nearer failure — a model that never generalized in the first place because it memorized its training set — is [overfitting](sec:ch05-overfitting), and Chapter 5 is largely about spotting it.',
        },
        {
          type: 'hint',
          md:
            'Want the rigorous version? **[[pac-learning|PAC learning]]** — “probably approximately correct” — makes the hedging precise. It fixes two tolerances: how much error you will accept, and how often you will accept being unlucky. Then it asks how many examples are needed to stay inside the first tolerance at least that often. The answer grows with the richness of the model formula, which is the formal statement of a claim this course makes over and over: a more flexible model needs more data to earn the same trust.',
        },
        {
          type: 'quiz',
          id: 'ch01-q-why',
          questions: [
            {
              kind: 'mcq',
              id: 'ch01-q-why-1',
              prompt: 'What assumption makes a model likely to work on unseen data?',
              choices: [
                'The model has enough parameters to memorize the whole training set',
                'The training data was cleaned and verified by human experts',
                'The algorithm kept running until the training error reached zero',
                'New examples are drawn independently from the same distribution',
              ],
              answer: 3,
              explain:
                'Independent sampling from one and the same distribution is what makes a new point likely to land near old points of its class — the whole basis of generalization. Clean data and zero training error are both welcome, but neither says anything about the examples still to come.',
            },
            {
              kind: 'tf',
              id: 'ch01-q-why-2',
              prompt: 'A trained model is mathematically guaranteed to classify every future example correctly.',
              answer: false,
              explain:
                'Only *probably* and *approximately* correct: rare, atypical inputs will still be misclassified — but they are rare.',
            },
            {
              kind: 'mcq',
              id: 'ch01-q-why-3',
              prompt: 'Increasing the size of a (well-sampled) training set tends to:',
              choices: [
                'make an unfamiliar new example less likely to appear',
                'increase the number of errors the model makes on new data',
                'make the width of the margin irrelevant to generalization',
                'shift the true distribution the data is drawn from',
              ],
              answer: 0,
              explain:
                'More independent samples cover the distribution more densely, so a future example is less likely to look unlike everything seen before. The distribution itself is a fact about the world — collecting more data does not move it.',
            },
          ],
        },
      ],
    },
  ],
  bossPool: [
    {
      kind: 'mcq',
      id: 'ch01-boss-1',
      prompt: 'The phrase “machines don’t learn” refers to the fact that models…',
      choices: [
        'cannot store more than a handful of examples at once',
        'need a fresh human label for every input they ever see',
        'fail when the inputs are distorted or shifted',
        'never make correct predictions on genuinely new data',
      ],
      answer: 2,
      explain:
        'Distort the inputs slightly — rotate the screen — and the “learned” skill collapses, which animal learning survives easily. Models *do* generalize to new data from the same distribution; it is the shifted distribution they cannot survive.',
    },
    {
      kind: 'mcq',
      id: 'ch01-boss-2',
      prompt: 'Who coined the term “machine learning”, and when?',
      choices: [
        'Alan Turing, 1936',
        'Arthur Samuel, 1959',
        'John McCarthy, 1956',
        'Andriy Burkov, 2019',
      ],
      answer: 1,
      explain:
        'Arthur Samuel coined it at IBM in 1959, partly as attractive branding for clients and talent. McCarthy named *artificial intelligence* in 1956, and Burkov wrote the book this course follows.',
    },
    {
      kind: 'match',
      id: 'ch01-boss-3',
      prompt: 'Match the unsupervised task to its output:',
      pairs: [
        ['Clustering', 'the id of the group each example belongs to'],
        ['Dimensionality reduction', 'a feature vector with fewer features'],
        ['Outlier detection', 'a score of how untypical the example is'],
      ],
      explain: 'Each unsupervised model transforms unlabeled vectors into a different useful signal.',
    },
    {
      kind: 'tf',
      id: 'ch01-boss-4',
      prompt: 'In reinforcement learning, a policy maps environment states to actions that maximize expected average reward.',
      answer: true,
      explain: 'The policy plays the role the model plays in supervised learning — but over sequential decisions.',
    },
    {
      kind: 'mcq',
      id: 'ch01-boss-5',
      prompt: 'Which problem is best framed as *reinforcement* learning?',
      choices: [
        'Predicting apartment prices from labeled past sales records',
        'Grouping a library of unlabeled songs by acoustic similarity',
        'Classifying reviews as positive or negative using labeled reviews',
        'Steering a warehouse robot rewarded for fast, safe deliveries',
      ],
      answer: 3,
      explain:
        'Sequential actions taken inside an environment that answers with rewards — that is exactly the reinforcement setting. The other three hand you a fixed dataset up front, labeled or not.',
    },
    {
      kind: 'mcq',
      id: 'ch01-boss-6',
      prompt: 'In bag-of-words with a 20,000-word dictionary, one email becomes…',
      choices: [
        'a 20,000-dimensional vector of 0s and 1s',
        'a list of the words it spells wrongly',
        'a 2-dimensional point (words, chars)',
        'a single probability between 0 and 1',
      ],
      answer: 0,
      explain: 'Feature $j$ answers one fixed question: does dictionary word $j$ appear in this message?',
    },
    {
      kind: 'mcq',
      id: 'ch01-boss-7',
      prompt: 'What are the learned parameters of a linear SVM model?',
      choices: [
        'the number of clusters $k$ to form',
        'the training examples themselves, stored whole',
        'a weight vector $\\mathbf{w}$ and a bias $b$',
        'a decision tree of if-then rules over features',
      ],
      answer: 2,
      explain:
        'Training finds $\\mathbf{w}^*$ and $b^*$, and prediction is $\\mathrm{sign}(\\mathbf{w}^*\\mathbf{x} - b^*)$. Keeping the examples themselves would make the model instance-based, like kNN; $k$ belongs to clustering, not to SVM.',
    },
    {
      kind: 'tf',
      id: 'ch01-boss-8',
      prompt: 'Every classification learning algorithm — not just SVM — creates a decision boundary, explicitly or implicitly.',
      answer: true,
      explain:
        'The boundary’s form (straight, curved, complex) and how it is computed is precisely what differentiates algorithms.',
    },
    {
      kind: 'mcq',
      id: 'ch01-boss-9',
      prompt: 'The margin of an SVM is…',
      choices: [
        'the number of training points it misclassifies',
        'the distance from the boundary to the nearest points',
        'the total length of the learned weight vector $\\mathbf{w}$',
        'the number of features the model actually uses',
      ],
      answer: 1,
      explain:
        'Among all boundaries that separate the classes, SVM picks the one that maximizes this distance — the [[margin]]. The norm $\\|\\mathbf{w}\\|$ is closely related, since the margin equals $\\frac{2}{\\|\\mathbf{w}\\|}$, but it is not itself the margin.',
    },
    {
      kind: 'numeric',
      id: 'ch01-boss-10',
      prompt:
        'The distance between the hyperplanes $\\mathbf{w}\\mathbf{x} - b = 1$ and $\\mathbf{w}\\mathbf{x} - b = -1$ is $\\frac{2}{\\|\\mathbf{w}\\|}$. If $\\|\\mathbf{w}\\| = 4$, what is that distance?',
      answer: 0.5,
      tolerance: 0.01,
      explain: '$2 / 4 = 0.5$ — and this is why minimizing $\\|\\mathbf{w}\\|$ widens the margin.',
    },
    {
      kind: 'mcq',
      id: 'ch01-boss-11',
      prompt: 'Semi-supervised learning hopes that adding *unlabeled* examples will…',
      choices: [
        'remove the need for labeled examples altogether',
        'guarantee zero training error on the labeled examples',
        'reduce the number of features each example needs',
        'sketch the underlying distribution more accurately',
      ],
      answer: 3,
      explain:
        'A larger sample — labeled or not — reflects the source distribution better, and a good algorithm can exploit that extra structure. Semi-supervised learning still needs its labeled core; it simply gets more out of the unlabeled remainder.',
    },
    {
      kind: 'mcq',
      id: 'ch01-boss-12',
      prompt: 'Besides accuracy, which two practical properties differentiate learning algorithms?',
      choices: [
        'speed of model building and speed of prediction',
        'size of the source code and the choice of language',
        'number of classes and number of features supported',
        'amount of RAM and disk space the model occupies',
      ],
      answer: 0,
      explain:
        'In practice you often trade a little accuracy for a model that trains fast or predicts fast. Memory footprint and implementation details matter to engineers, but they are not what separates one *algorithm* from another.',
    },
    {
      kind: 'tf',
      id: 'ch01-boss-13',
      prompt: 'If a feature vector has $D$ dimensions, the SVM decision boundary is a $(D{-}1)$-dimensional hyperplane.',
      answer: true,
      explain: 'A line in 2D, a plane in 3D, a 19,999-dimensional hyperplane in the 20,000-dimensional spam space.',
    },
    {
      kind: 'mcq',
      id: 'ch01-boss-14',
      prompt: 'PAC learning theory analyzes the relationship between…',
      choices: [
        'training time, memory use, and hardware cost',
        'the choice of programming language and its speed',
        'model error, training-set size, and model-equation form',
        'the number of classes and the number of clusters found',
      ],
      answer: 2,
      explain:
        '“Probably approximately correct”: under what conditions will a learner probably produce an approximately correct classifier? [[pac-learning|The theory]] ties together how much data you have, how complex your model formula is, and how much error you are willing to tolerate.',
    },
    {
      kind: 'mcq',
      id: 'ch01-boss-15',
      prompt: 'A dataset of customer profiles with *no* labels needs segmenting into groups. The right tool is…',
      choices: ['linear regression', 'clustering', 'bag of words', 'a policy'],
      answer: 1,
      explain:
        'Unlabeled data plus a grouping goal equals clustering, the flagship unsupervised task. Regression needs numeric targets, bag of words is a feature encoding, and a policy belongs to reinforcement learning.',
    },
    {
      kind: 'tf',
      id: 'ch01-boss-16',
      prompt: 'Labels used by an SVM must be numeric, e.g. spam $= +1$ and not_spam $= -1$.',
      answer: true,
      explain: 'Some algorithms require numeric labels; for SVM the two classes become +1 and −1.',
    },
    {
      kind: 'mcq',
      id: 'ch01-boss-17',
      prompt: 'Outliers, noise, or labeling errors can make data impossible to separate perfectly. SVM’s practical answer is…',
      choices: [
        'deleting the offending training examples before fitting',
        'switching to an unsupervised clustering algorithm instead',
        'adding more words to the bag-of-words dictionary',
        'a hyperparameter that penalizes each misclassification',
      ],
      answer: 3,
      explain:
        'The soft-margin SVM tolerates some misclassified points in exchange for a wider, more robust margin, and that hyperparameter sets the exchange rate. Deleting inconvenient examples would only hide the noise the model has to live with.',
    },
    {
      kind: 'order',
      id: 'ch01-boss-18',
      prompt: 'Order the spam-detector pipeline:',
      items: [
        'Collect 10,000 labeled email messages',
        'Convert each message to a bag-of-words feature vector',
        'Convert labels to +1 / −1',
        'Run the SVM learning algorithm',
        'Classify new email with sign(wx − b)',
      ],
      explain: 'Data → features → numeric labels → training → prediction.',
    },
  ],
};

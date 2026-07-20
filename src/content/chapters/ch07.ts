import type { Chapter } from '../schema';

/** Chapter 7 — Problems and Solutions (book pp. 77–96), paraphrased in original words. */
export const ch07: Chapter = {
  id: 'ch07',
  number: 7,
  title: 'Problems and Solutions',
  subtitle: 'Ensembles, sequences, and learning with few labels',
  pdfPages: [77, 96],
  badgeId: 'ch07',
  sections: [
    {
      id: 'ch07-beyond-two-classes',
      title: 'Beyond Two Classes',
      minutes: 7,
      blocks: [
        {
          type: 'p',
          md:
            'Straight lines don’t fit curvy data. In one dimension you could throw a polynomial at the problem, but with a $D$-dimensional input and $D > 3$, guessing the right polynomial becomes hopeless. **Kernel regression** sidesteps the guessing: it is **non-parametric**, meaning there are *no parameters to learn* — the model is the training data itself, kNN-style. To predict at a point $x$, it averages *all* training labels, weighted by how similar each $x_i$ is to $x$:',
        },
        {
          type: 'formula',
          tex: 'f(x) = \\frac{1}{N}\\sum_{i=1}^{N} w_i y_i, \\quad w_i = \\frac{N\\,k\\!\\left(\\frac{x_i - x}{b}\\right)}{\\sum_{l=1}^{N} k\\!\\left(\\frac{x_l - x}{b}\\right)}',
          terms: [
            { tex: 'k(\\cdot)', explain: 'the kernel — a similarity function; the closer x_i is to x, the larger the weight' },
            { tex: 'w_i', explain: 'how much training label y_i counts toward the prediction at x' },
            { tex: 'b', explain: 'the bandwidth hyperparameter, tuned on the validation set' },
          ],
        },
        {
          type: 'p',
          md:
            'The most popular kernel is the Gaussian, $k(z) = \\frac{1}{\\sqrt{2\\pi}}\\exp(-z^2/2)$. The bandwidth $b$ controls the trade-off you already know: a large $b$ gives a smooth, calm curve; a tiny $b$ gives a jittery curve that chases every noisy point — overfitting in kernel clothing. For multi-dimensional inputs, replace the differences $x_i - x$ with Euclidean distances $\\|\\mathbf{x}_i - \\mathbf{x}\\|$.',
        },
        {
          type: 'p',
          md:
            'Next problem: **multiclass classification**, where $y \\in \\{1, \\dots, C\\}$. Some algorithms handle many classes natively. Decision trees predict the majority label in a leaf. kNN looks at the $k$ nearest neighbors and returns the most frequent class among them. Logistic regression swaps its sigmoid for the **softmax function** and outputs a probability per class. SVM, however, is stubbornly binary.',
        },
        {
          type: 'p',
          md:
            'For binary-only algorithms there’s **one versus rest**: turn one $C$-class problem into $C$ binary problems — “class 1 vs everything”, “class 2 vs everything”, and so on. To classify a new input, run all $C$ models and keep the *most certain* non-zero prediction. Certainty is the model’s score: a probability near 1 for logistic regression, or, for SVM, the distance $d = \\frac{\\mathbf{w}^*\\mathbf{x} + b^*}{\\|\\mathbf{w}\\|}$ from the input to the decision boundary — farther means surer.',
        },
        {
          type: 'p',
          md:
            'Sometimes you only *have* one class. Think of a secure network: piles of normal-traffic examples, almost no attack examples. **One-class classification** learns what the one class looks like and flags everything else — the machinery behind outlier, anomaly and novelty detection. The **one-class Gaussian** fits a multivariate normal distribution to the data by maximum likelihood (learning a mean vector $\\boldsymbol{\\mu}$ and a covariance matrix $\\boldsymbol{\\Sigma}$) and calls any input whose likelihood falls below a threshold an outlier. Cousins: **one-class k-means**, **one-class kNN**, and **one-class SVM**, which either separates the data from the origin or wraps it in the smallest possible hypersphere.',
        },
        {
          type: 'p',
          md:
            'Finally, one input can deserve *several* labels at once — a photo can be “conifer”, “mountain” *and* “road”. That’s **multi-label classification**. The workhorse approach: use any model that returns a per-label score and add a **threshold** hyperparameter — every label scoring above it gets predicted. Neural networks do this natively: one sigmoid output unit per label, trained with binary cross-entropy. When each label has only a few possible values, there’s a second trick: create one *fake class per combination* of real labels (2 values × 3 values = 6 fake classes) and solve it as plain multiclass. Its quiet superpower is keeping labels **correlated** — it can learn that `[spam, priority]` is a combination that should never happen.',
        },
        {
          type: 'hint',
          md:
            'The multi-label threshold is a genuine hyperparameter: choose it on the **validation set**, exactly like $b$ in kernel regression.',
        },
        {
          type: 'quiz',
          id: 'ch07-q-beyond',
          questions: [
            {
              kind: 'mcq',
              id: 'ch07-q-beyond-1',
              prompt: 'Why is kernel regression called *non-parametric*?',
              choices: [
                'It learns no parameters — predictions are computed directly from the stored training examples',
                'It has no hyperparameters at all',
                'It only works on data with few features',
                'It ignores the training labels',
              ],
              answer: 0,
              explain:
                'Nothing is fitted in advance: at prediction time, every training example votes with a kernel-similarity weight. The bandwidth $b$ is still a hyperparameter, though.',
            },
            {
              kind: 'mcq',
              id: 'ch07-q-beyond-2',
              prompt: 'You shrink the bandwidth $b$ to a very small value. The regression curve will…',
              choices: [
                'wiggle violently, hugging individual noisy points — overfitting',
                'become a flat horizontal line',
                'become perfectly linear',
                'stop depending on the data',
              ],
              answer: 0,
              explain:
                'A tiny $b$ means only extremely close neighbors get weight, so the curve chases each point. Large $b$ smooths; the sweet spot comes from the validation set.',
            },
            {
              kind: 'multi',
              id: 'ch07-q-beyond-3',
              prompt: 'Which algorithms extend to multiclass problems *naturally* (no one-vs-rest needed)?',
              choices: [
                'Decision trees',
                'kNN',
                'Logistic regression with softmax',
                'SVM',
              ],
              answers: [0, 1, 2],
              explain:
                'Trees vote in the leaf, kNN votes among neighbors, and softmax gives one probability per class. SVM is inherently binary — it needs one-vs-rest.',
            },
            {
              kind: 'tf',
              id: 'ch07-q-beyond-4',
              prompt: 'A one-class classifier is trained using examples of a single class only.',
              answer: true,
              explain:
                'That’s the whole point: model what “normal” looks like (e.g., a fitted Gaussian) and flag low-likelihood inputs as outliers — no attack examples required.',
            },
            {
              kind: 'mcq',
              id: 'ch07-q-beyond-5',
              prompt: 'In threshold-based multi-label classification, an input receives…',
              choices: [
                'every label whose score exceeds the threshold',
                'exactly one label: the argmax',
                'all labels, always',
                'a random label per prediction',
              ],
              answer: 0,
              explain:
                'Per-label scores plus one threshold means zero, one, or many labels can fire for the same input — exactly what “conifer + mountain + road” needs.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch07-ensembles-bagging',
      title: 'Wisdom of Weak Learners',
      minutes: 7,
      blocks: [
        {
          type: 'p',
          md:
            'The fundamental algorithms are simple, and simplicity has a price: sometimes the model just isn’t accurate enough. Deep networks could help — if you have mountains of labeled data. **Ensemble learning** takes the opposite road: instead of one heroic, super-accurate model, train a *large number* of cheap, low-accuracy models and merge their predictions into one high-accuracy **meta-model**.',
        },
        {
          type: 'p',
          md:
            'The cheap models come from **weak learners** — algorithms that can’t express complex boundaries but train and predict fast. The favorite is a decision tree stopped after just a few splits: shallow, biased, individually unimpressive. The magic condition is **diversity**: if each weak model is at least slightly better than a coin flip *and their mistakes land on different examples*, a council of hundreds of them votes the errors away. Good models tend to agree on the right answer; bad ones disagree on their wrong ones.',
        },
        {
          type: 'p',
          md:
            '**Bagging** manufactures the diversity. Build $B$ “copies” of the training set by **sampling with replacement**: draw $N$ examples at random from the original $N$, so each copy has duplicates and omissions. Train one tree per copy. To predict: average the $B$ outputs (regression) or take the **majority vote** (classification).',
        },
        {
          type: 'p',
          md:
            '**Random forest** is bagging plus one clever tweak: at every split, each tree may only consider a *random subset of the features*. Why hobble the trees? Because if one or two features are dominant predictors, every tree would pick them and the forest would collapse into near-identical, **correlated** trees — and correlated models make the *same* mistakes, which no vote can fix. Random subsets decorrelate the trees. The payoff is reduced **variance**: by averaging over many resampled views of the data, the quirks of any single sample — noise, outliers, unlucky draws — get diluted, which means less overfitting. The knobs to tune: the number of trees $B$ and the feature-subset size.',
        },
        {
          type: 'widget',
          id: 'EnsembleSandbox',
          challenge: {
            id: 'ch07-challenge-ensemble',
            label: 'beat the single tree with a 20-tree forest',
            xp: 15,
          },
        },
        {
          type: 'quiz',
          id: 'ch07-q-ensembles',
          questions: [
            {
              kind: 'mcq',
              id: 'ch07-q-ensembles-1',
              prompt: 'A *bootstrap sample* of a training set with $N$ examples is…',
              choices: [
                '$N$ examples drawn at random with replacement — duplicates allowed, some originals left out',
                'the first $N/2$ examples',
                '$N$ brand-new synthetic examples',
                'the same set with labels shuffled',
              ],
              answer: 0,
              explain:
                'Sampling with replacement keeps the set size at $N$ but changes its composition — every tree sees a slightly different world, and that is where diversity comes from.',
            },
            {
              kind: 'mcq',
              id: 'ch07-q-ensembles-2',
              prompt: 'Why does random forest restrict each split to a random subset of features?',
              choices: [
                'To decorrelate the trees — otherwise dominant features would make every tree nearly identical',
                'To make each tree train on fewer examples',
                'To guarantee zero training error',
                'To reduce the number of classes',
              ],
              answer: 0,
              explain:
                'Correlated trees agree on the same mistakes and majority voting can’t save them. Forcing different features into different trees keeps their errors independent.',
            },
            {
              kind: 'tf',
              id: 'ch07-q-ensembles-3',
              prompt: 'Bagging mainly reduces the *variance* of the final model, which means less overfitting.',
              answer: true,
              explain:
                'Averaging over many bootstrap resamples dilutes the effect of noise, outliers and unlucky sampling artifacts — the ingredients of variance.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch07-boosting',
      title: 'Boosting: Fix What’s Broken',
      minutes: 7,
      blocks: [
        {
          type: 'p',
          md:
            'Bagging builds its weak models in parallel, each blind to the others. **Boosting** builds them *in sequence*: every new weak model is trained to repair the mistakes the ensemble has made so far. The final model is a weighted combination of all the weak models built along the way.',
        },
        {
          type: 'p',
          md:
            'The classic version, **AdaBoost**, keeps a weight on every training example. Start uniform. Train a stump, then *raise* the weights of the examples it got wrong — the next stump literally cannot ignore them, because it minimizes *weighted* error. Each stump $t$ also earns a say in the final vote based on its weighted error $\\epsilon_t$:',
        },
        {
          type: 'formula',
          tex: '\\alpha_t = \\tfrac{1}{2}\\ln\\frac{1 - \\epsilon_t}{\\epsilon_t}',
          terms: [
            { tex: '\\epsilon_t', explain: 'the weighted training error of stump t (0 = perfect, 0.5 = coin flip)' },
            { tex: '\\alpha_t', explain: 'the stump’s vote weight in the final sum; the prediction is the sign of Σ α_t h_t(x)' },
          ],
        },
        {
          type: 'p',
          md:
            'Read that formula like a character reference: a stump with $\\epsilon_t = 0.5$ is a coin flip and gets $\\alpha_t = 0$ — no vote. The smaller the error, the louder the voice. Accurate-and-diverse specialists, each drilled on the previous round’s failures, add up to a boundary no single stump could draw.',
        },
        {
          type: 'p',
          md:
            '**Gradient boosting** applies the same “fix the leftovers” spirit to regression. Start with the laziest possible model: a constant, $f_0 = \\frac{1}{N}\\sum_i y_i$. Then compute what’s left to explain — the **residuals** — and relabel the training set with them:',
        },
        {
          type: 'math',
          tex: '\\hat{y}_i \\leftarrow y_i - f(\\mathbf{x}_i)',
        },
        {
          type: 'p',
          md:
            'Train a new tree to predict those residuals, add it to the model scaled by a learning rate $\\alpha$, recompute residuals, repeat $M$ times. Why “gradient”? No gradient is ever computed — but the residuals *play the role of one*: they point in the direction the model must move to shrink its error, and the learning rate is the cautious step size, exactly like gradient descent. It can be shown that training on residuals optimizes the model for mean squared error.',
        },
        {
          type: 'p',
          md:
            'Where bagging fights **variance**, boosting fights **bias** (underfitting) — so it *can* overfit, but tuning the tree depth, the number of trees and the learning rate keeps it in check. Gradient-boosted trees are among the strongest algorithms available for tabular data — the engine inside libraries like **XGBoost** and LightGBM — usually edging out random forests in accuracy, at the cost of slower, inherently sequential training.',
        },
        {
          type: 'widget',
          id: 'BoostingStepper',
          challenge: {
            id: 'ch07-challenge-boost',
            label: 'reach 0 training errors within 12 rounds',
            xp: 15,
          },
        },
        {
          type: 'quiz',
          id: 'ch07-q-boosting',
          questions: [
            {
              kind: 'mcq',
              id: 'ch07-q-boosting-1',
              prompt: 'After an AdaBoost round, which training examples get *heavier* weights?',
              choices: [
                'The ones the newest stump misclassified',
                'The ones classified correctly',
                'A random half of the dataset',
                'All weights stay equal forever',
              ],
              answer: 0,
              explain:
                'Boosting is sequential error-fixing: raising the weight of a mistake forces the next weak learner to prioritize it, because it minimizes *weighted* error.',
            },
            {
              kind: 'numeric',
              id: 'ch07-q-boosting-2',
              prompt:
                'A stump has weighted error $\\epsilon_t = 0.5$ (a coin flip). Compute its vote weight $\\alpha_t = \\tfrac{1}{2}\\ln\\frac{1-\\epsilon_t}{\\epsilon_t}$.',
              answer: 0,
              tolerance: 0.001,
              explain:
                '$\\frac{1-0.5}{0.5} = 1$ and $\\ln 1 = 0$: a learner no better than chance gets exactly zero say in the final vote.',
            },
            {
              kind: 'mcq',
              id: 'ch07-q-boosting-3',
              prompt: 'In gradient boosting, each new tree is trained to predict…',
              choices: [
                'the residuals $y_i - f(\\mathbf{x}_i)$ of the current ensemble',
                'the original labels, from scratch',
                'the predictions of the previous tree',
                'random noise, for regularization',
              ],
              answer: 0,
              explain:
                'Residuals are what the current model still gets wrong; predicting them and adding the result (scaled by the learning rate) nudges the ensemble toward lower MSE.',
            },
            {
              kind: 'tf',
              id: 'ch07-q-boosting-4',
              prompt: 'Bagging trains its models one after another, each one focusing on the previous models’ errors.',
              answer: false,
              explain:
                'That’s *boosting*. Bagging trains its models independently on bootstrap samples — they never see each other’s mistakes.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch07-sequences',
      title: 'Sequences In, Sequences Out',
      minutes: 5,
      blocks: [
        {
          type: 'p',
          md:
            'Sequences are everywhere — sentences, genes, stock prices, your last hundred clicks. **Sequence labeling** assigns a label to *every element*: the training example is a pair of equal-length lists $(\\mathbf{X}, \\mathbf{Y})$, like the words [“big”, “beautiful”, “car”] paired with [adjective, adjective, noun]. An RNN handles this directly, emitting one label per time step. The feature-engineering alternative is the **Conditional Random Field** (CRF) — think of it as logistic regression generalized to sequences. CRFs shine when you can handcraft informative features (for **named entity extraction**: “starts with a capital letter”, “appears in a list of city names”), but they train slowly, struggle with huge datasets, and have largely been outperformed by bidirectional gated RNNs — which happen to *love* huge datasets.',
        },
        {
          type: 'p',
          md:
            '**Sequence-to-sequence** (seq2seq) learning drops the equal-length requirement: input and output can differ in length, which is exactly what machine translation, chatbots, summarization and spelling correction need. The architecture has two halves. An **encoder** reads the input step by step and compresses its *meaning* into a vector (or matrix) of numbers — the **embedding**. A **decoder** takes that embedding, receives a start-of-sequence token, and generates outputs one at a time, feeding each output back in as its own next input until it decides to stop. Both halves are trained together: errors at the decoder’s mouth backpropagate all the way into the encoder.',
        },
        {
          type: 'p',
          md:
            'The weak link is that single fixed-size embedding — a long input has to squeeze through it like luggage through a mail slot. **Attention** fixes this with an extra set of learned parameters that let the decoder combine information from *all* encoder time steps at *every* output step — effectively learning where to look in the input while producing each output word. It preserves long-range dependencies better than gated units or bidirectional RNNs alone. An honest postscript: this mechanism turned out to be the seed of the transformer architectures behind today’s large language models — the book was written just before that avalanche.',
        },
        {
          type: 'quiz',
          id: 'ch07-q-sequences',
          questions: [
            {
              kind: 'order',
              id: 'ch07-q-sequences-1',
              prompt: 'Put the seq2seq translation pipeline in order:',
              items: [
                'The encoder reads the input sequence step by step',
                'The final encoder state becomes the embedding of the input’s meaning',
                'The decoder receives the embedding plus a start-of-sequence token',
                'The decoder emits outputs one by one, feeding each back as its next input',
              ],
              explain:
                'Encoder → embedding → decoder → autoregressive generation: the embedding is the handoff point between the two halves.',
            },
            {
              kind: 'mcq',
              id: 'ch07-q-sequences-2',
              prompt: 'What separates seq2seq learning from plain sequence labeling?',
              choices: [
                'Input and output sequences may have different lengths',
                'seq2seq needs no training data',
                'Sequence labeling has no labels',
                'seq2seq only works on images',
              ],
              answer: 0,
              explain:
                'Sequence labeling maps each element to a label (same length); seq2seq generalizes it — a 4-word English sentence can become a 3-word French one.',
            },
            {
              kind: 'mcq',
              id: 'ch07-q-sequences-3',
              prompt: 'The attention mechanism lets the decoder…',
              choices: [
                'combine information from all encoder time steps at each output step',
                'skip the encoder entirely',
                'compress the input into a smaller embedding',
                'run without any parameters',
              ],
              answer: 0,
              explain:
                'Instead of relying on one fixed-size embedding, attention gives the decoder learned, per-step access to the whole encoded input — much better retention of long-range information.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch07-few-labels',
      title: 'Learning with Few Labels',
      minutes: 8,
      blocks: [
        {
          type: 'p',
          md:
            'Labels are often the expensive part — a radiologist’s hour costs more than a GPU’s. **Active learning** stretches a labeling budget by letting the model choose *which* examples a human expert should annotate next. The classic recipe is uncertainty-driven: apply the current model to the unlabeled pool and score each example by **density × uncertainty** — how typical it is, times how unsure the model feels about it. Uncertainty is the score being close to 0.5 for a sigmoid classifier, the example sitting closest to the hyperplane for SVM, or maximum **entropy** over the class probabilities in the multiclass case. Send the top scorer to the expert, add the fresh label, retrain, repeat until the budget runs out. A related strategy, *query by committee*, trains several different models and asks the expert about the examples they disagree on most.',
        },
        {
          type: 'p',
          md:
            '**Semi-supervised learning** faces the same mix — few labels, many unlabeled examples — but with no expert on call. The frequently cited method is **self-learning**: train on the labeled data, apply the model to the unlabeled pool, and *adopt* the predictions the model is most confident about as if they were real labels; retrain and repeat. Improvements are usually modest, and the model can even get worse — confident nonsense is still nonsense. Why can unlabeled data help at all? Because a larger sample sketches the underlying data distribution more faithfully, and a good algorithm can exploit that shape. Neural methods pushed this far: the **ladder network** — a denoising **autoencoder** (an hourglass network with a bottleneck embedding, trained to reconstruct its own input) whose bottleneck simultaneously predicts the label — reached near-perfect MNIST accuracy from just 10 labeled examples per class.',
        },
        {
          type: 'p',
          md:
            '**One-shot learning** is the face-recognition setting: decide whether two photos show the *same* person. Training a two-input binary classifier would double the network and starve on scarce positive pairs. The elegant fix is a **siamese neural network**: a *single* network $f$ that maps one image to an embedding vector, trained so that same-person embeddings sit close together and different-person embeddings sit far apart. Training uses triplets — an anchor $A$, a positive $P$ (same person), a negative $N$ (someone else) — and the **triplet loss**:',
        },
        {
          type: 'formula',
          tex: '\\max\\!\\left(\\|f(A) - f(P)\\|^2 - \\|f(A) - f(N)\\|^2 + \\alpha,\\; 0\\right)',
          terms: [
            { tex: 'f', explain: 'the shared embedding network — the same weights process A, P and N' },
            { tex: 'A, P', explain: 'anchor and positive: two photos of the same person, whose embeddings should be close' },
            { tex: 'N', explain: 'negative: a different person, whose embedding should be pushed away from the anchor’s' },
            { tex: '\\alpha', explain: 'the margin: how much farther the negative must be than the positive before the loss reaches zero' },
          ],
        },
        {
          type: 'p',
          md:
            'Training goes faster with *hard* negatives — candidates the current model finds confusingly similar to the anchor — rather than random strangers the network tells apart instantly. Despite the name, training uses many photos per person; “one-shot” describes deployment: your phone stores **one** photo of you, and unlocking is just checking $\\|f(A) - f(\\hat{A})\\|^2 < \\tau$ for a threshold $\\tau$.',
        },
        {
          type: 'p',
          md:
            '**Zero-shot learning** aims even higher: predict labels that never appeared in training. The trick is to embed the *outputs* too. Word embeddings give every English word a vector whose dimensions capture aspects of meaning — a cartoon version: *mammalness*, *orangeness*, *stripeness*. Replace each training label with its word embedding and train the model to predict embeddings instead of classes. Show it a tiger — a class it never saw — and it can still detect “orange + striped + mammal” from the pixels, because zebras and clownfish taught it those pieces; the nearest word embedding to its output is, with luck, *tiger*.',
        },
        {
          type: 'hint',
          md:
            'Word embeddings are compared with **cosine similarity**, and Chapter 10 shows how they are learned from a text corpus.',
        },
        {
          type: 'quiz',
          id: 'ch07-q-fewlabels',
          questions: [
            {
              kind: 'mcq',
              id: 'ch07-q-fewlabels-1',
              prompt: 'Uncertainty-based active learning asks the human expert to label…',
              choices: [
                'the examples the current model is least sure about (e.g., score near 0.5, or closest to the hyperplane)',
                'the examples the model already classifies confidently',
                'a uniformly random sample',
                'only examples of the majority class',
              ],
              answer: 0,
              explain:
                'Confident predictions teach the model little. The informative examples live where the model hesitates — near the decision boundary.',
            },
            {
              kind: 'mcq',
              id: 'ch07-q-fewlabels-2',
              prompt: 'In self-learning (semi-supervised), which unlabeled examples get added to the training set?',
              choices: [
                'Those the model labels with confidence above a threshold — using its own predictions as labels',
                'Those the model finds most confusing',
                'All of them, with random labels',
                'None — unlabeled data is discarded',
              ],
              answer: 0,
              explain:
                'The model bootstraps itself on its confident predictions. It sometimes helps, modestly — and can even hurt, since confident mistakes get baked in.',
            },
            {
              kind: 'mcq',
              id: 'ch07-q-fewlabels-3',
              prompt: 'What does the triplet loss push the embedding network to do?',
              choices: [
                'Pull the anchor toward the positive and push it from the negative by at least the margin $\\alpha$',
                'Make all embeddings identical',
                'Maximize the distance between all pairs of images',
                'Predict the exact pixel values of the anchor',
              ],
              answer: 0,
              explain:
                'The loss is zero only once $\\|f(A)-f(N)\\|^2$ exceeds $\\|f(A)-f(P)\\|^2$ by the margin — same faces cluster, different faces separate.',
            },
            {
              kind: 'tf',
              id: 'ch07-q-fewlabels-4',
              prompt:
                'A zero-shot model can assign the label *tiger* even if no tiger image appeared in its training data.',
              answer: true,
              explain:
                'Because it predicts *label embeddings*, not classes: features like stripes and mammalness were learned from other animals, and the nearest word vector to the prediction can be a never-seen label.',
            },
          ],
        },
      ],
    },
  ],
  bossPool: [
    {
      kind: 'mcq',
      id: 'ch07-boss-1',
      prompt: 'In kernel regression, the kernel $k(\\cdot)$ plays the role of…',
      choices: [
        'a similarity function: closer training points get larger weights in the prediction',
        'a loss function to minimize',
        'a regularization penalty',
        'a random number generator',
      ],
      answer: 0,
      explain:
        'The prediction at $x$ is a weighted average of all training labels, and $k$ decides the weights: high for nearby $x_i$, low for distant ones.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-2',
      prompt: 'Which bandwidth behavior is correct for kernel regression?',
      choices: [
        'Large $b$ → smoother curve; small $b$ → wiggly, overfitting curve',
        'Large $b$ → overfitting; small $b$ → underfitting',
        '$b$ has no effect on the curve',
        '$b$ is learned by gradient descent',
      ],
      answer: 0,
      explain:
        '$b$ is a hyperparameter tuned on the validation set: it trades smoothness against flexibility, the classic under/overfitting dial.',
    },
    {
      kind: 'numeric',
      id: 'ch07-boss-3',
      prompt: 'You solve a 5-class problem with the one-versus-rest strategy. How many binary classifiers do you train?',
      answer: 5,
      tolerance: 0,
      explain: 'One per class: “class $c$ vs everything else”, for $c = 1, \\dots, 5$. Predict with the most certain one.',
    },
    {
      kind: 'tf',
      id: 'ch07-boss-4',
      prompt: 'SVM extends to multiclass problems naturally, without one-versus-rest.',
      answer: false,
      explain:
        'SVM is inherently binary. Decision trees, kNN and softmax logistic regression are the ones that go multiclass natively.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-5',
      prompt: 'In one-versus-rest with SVM, the “most certain” prediction is the one with…',
      choices: [
        'the largest distance from the input to that model’s decision boundary',
        'the smallest weight vector',
        'the fewest support vectors',
        'the shortest training time',
      ],
      answer: 0,
      explain:
        'SVM has no probabilities, but distance to the hyperplane, $d = \\frac{\\mathbf{w}^*\\mathbf{x}+b^*}{\\|\\mathbf{w}\\|}$, works as certainty: farther from the boundary means surer.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-6',
      prompt: 'Classifying network traffic as “normal vs anything else”, with only normal examples available, is a job for…',
      choices: ['one-class classification', 'multi-label classification', 'seq2seq learning', 'bagging'],
      answer: 0,
      explain:
        'One-class (unary) classification models the single available class — e.g., a fitted Gaussian — and flags low-likelihood inputs; the basis of anomaly and novelty detection.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-7',
      prompt: 'The one-class Gaussian method predicts an outlier when…',
      choices: [
        'the input’s likelihood under the fitted distribution falls below a threshold',
        'the input has negative feature values',
        'the input is far from the origin',
        'the model’s training error is high',
      ],
      answer: 0,
      explain:
        'Fit $\\boldsymbol{\\mu}$ and $\\boldsymbol{\\Sigma}$ by maximum likelihood, then threshold the density $f_{\\boldsymbol{\\mu},\\boldsymbol{\\Sigma}}(\\mathbf{x})$: inside the bell = the class, out in the tails = outlier.',
    },
    {
      kind: 'numeric',
      id: 'ch07-boss-8',
      prompt:
        'Multi-label via the fake-class (label powerset) trick: label 1 has 2 possible values and label 2 has 3. How many fake classes do you create?',
      answer: 6,
      tolerance: 0,
      explain:
        'One fake class per combination: $2 \\times 3 = 6$. Handy when combinations are few — and it keeps the labels correlated.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-9',
      prompt: 'The main advantage of the fake-class approach over independent per-label thresholding is that it…',
      choices: [
        'preserves correlations between labels (it can rule out impossible combinations)',
        'needs less training data',
        'trains faster on many labels',
        'removes the need for a validation set',
      ],
      answer: 0,
      explain:
        'Predicting combinations jointly lets the model learn that e.g. `[spam, priority]` never co-occurs — independent thresholds can’t know that.',
    },
    {
      kind: 'match',
      id: 'ch07-boss-10',
      prompt: 'Match each ensemble idea to its signature move:',
      pairs: [
        ['Bagging', 'train each model on a bootstrap sample, then vote'],
        ['Boosting', 'train models sequentially, each fixing the ensemble’s current errors'],
        ['Random forest', 'bagging plus random feature subsets at each split'],
      ],
      explain:
        'Bagging parallelizes over resampled data; boosting chains error-fixers; random forest decorrelates bagged trees with feature subsets.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-11',
      prompt: 'Why do correlated trees hurt a random forest?',
      choices: [
        'They tend to make the same mistakes, so voting can’t cancel their errors',
        'They take longer to train',
        'They use too much memory',
        'They can only handle two classes',
      ],
      answer: 0,
      explain:
        'The whole benefit of a vote is independent errors averaging out. If dominant features make every tree agree — including on the wrong answers — the vote adds nothing.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-12',
      prompt: 'Bagging vs boosting, in one line:',
      choices: [
        'bagging reduces variance; boosting reduces bias',
        'bagging reduces bias; boosting reduces variance',
        'both only reduce training time',
        'neither affects overfitting or underfitting',
      ],
      answer: 0,
      explain:
        'Averaging resampled models tames overfitting (variance); sequentially fixing errors tames underfitting (bias) — which is also why boosting *can* overfit if pushed.',
    },
    {
      kind: 'numeric',
      id: 'ch07-boss-13',
      prompt:
        'AdaBoost: a stump’s weighted error is $\\epsilon_t = 0.5$. What vote weight $\\alpha_t = \\tfrac{1}{2}\\ln\\frac{1-\\epsilon_t}{\\epsilon_t}$ does it get?',
      answer: 0,
      tolerance: 0.001,
      explain: '$\\ln(0.5/0.5) = \\ln 1 = 0$: a coin-flip learner gets zero say. Better-than-chance stumps get positive weight.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-14',
      prompt: 'Gradient boosting is called “gradient” boosting because…',
      choices: [
        'the residuals act like a gradient: they show the direction to adjust the model, taken with a small learning-rate step',
        'it computes exact gradients of the tree parameters',
        'it only works with gradient descent classifiers',
        'its inventor was named Gradient',
      ],
      answer: 0,
      explain:
        'No actual gradient is computed — the residuals are its proxy, and the learning rate is the step size, mirroring gradient descent’s move-a-little-and-reevaluate loop.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-15',
      prompt: 'The three principal hyperparameters of gradient boosting are…',
      choices: [
        'number of trees, learning rate, and tree depth',
        'bandwidth, margin, and threshold',
        'number of clusters, number of features, and batch size',
        'dropout rate, momentum, and patience',
      ],
      answer: 0,
      explain:
        'All three shape accuracy, and depth also sets training/prediction speed — shallower is faster. Tuning them is how boosting avoids overfitting.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-16',
      prompt: 'Sequence labeling means…',
      choices: [
        'assigning one label to every element of a sequence, like part-of-speech tags for each word',
        'assigning one label to the whole sequence',
        'sorting sequences by length',
        'generating a new sequence of different length',
      ],
      answer: 0,
      explain:
        'Training pairs are equal-length lists $(\\mathbf{X}, \\mathbf{Y})$ — one label per time step. Different-length outputs are seq2seq territory.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-17',
      prompt: 'CRFs work especially well when…',
      choices: [
        'the feature vectors contain many informative handcrafted features (e.g., “starts with a capital letter”)',
        'the dataset has millions of examples',
        'no labels are available',
        'inputs are raw images',
      ],
      answer: 0,
      explain:
        'CRF is like logistic regression generalized to sequences: it thrives on rich features but trains slowly — on huge datasets, bidirectional gated RNNs took over.',
    },
    {
      kind: 'order',
      id: 'ch07-boss-18',
      prompt: 'Order the seq2seq generation process:',
      items: [
        'Encoder ingests the input sequence step by step',
        'The input’s meaning is compressed into an embedding',
        'Decoder starts from a start-of-sequence token',
        'Decoder produces outputs one at a time, each fed back as its next input',
        'Generation stops and the output sequence is complete',
      ],
      explain:
        'Encoder → embedding → decoder loop → stop: both halves are trained together, with decoder errors backpropagating into the encoder.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-19',
      prompt: 'Active learning is most valuable when…',
      choices: [
        'labels are expensive to obtain, e.g., they require medical or financial experts',
        'the dataset is already fully labeled',
        'the model trains too quickly',
        'features are missing',
      ],
      answer: 0,
      explain:
        'Its whole purpose is spending a limited annotation budget on the examples that improve the model most — typically the most uncertain (and typical) ones.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-20',
      prompt: 'In multiclass active learning, a model’s uncertainty about an example is highest when…',
      choices: [
        'its predicted probabilities are uniform across classes (maximum entropy)',
        'one class has probability 1',
        'the example has large feature values',
        'the example was seen during training',
      ],
      answer: 0,
      explain:
        'Entropy $-\\sum_c \\Pr(c)\\ln\\Pr(c)$ peaks when every class looks equally likely — the model is maximally torn, so the label would be maximally informative.',
    },
    {
      kind: 'numeric',
      id: 'ch07-boss-21',
      prompt:
        'Triplet loss: $\\|f(A)-f(P)\\|^2 = 0.1$, $\\|f(A)-f(N)\\|^2 = 0.9$, margin $\\alpha = 0.3$. Compute $\\max(0.1 - 0.9 + 0.3,\\, 0)$.',
      answer: 0,
      tolerance: 0.001,
      explain:
        '$0.1 - 0.9 + 0.3 = -0.5$, and $\\max(-0.5, 0) = 0$: the negative is already farther than the positive by more than the margin, so nothing to fix.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-22',
      prompt: 'Why is it called *one-shot* learning if training uses many photos per person?',
      choices: [
        'Because at deployment a single stored photo per person is enough — compare embeddings with a threshold $\\tau$',
        'Because training takes one epoch',
        'Because only one class exists',
        'Because the network has one layer',
      ],
      answer: 0,
      explain:
        'The siamese network learns a general face-embedding. Then your phone needs just one reference photo: unlock if $\\|f(A)-f(\\hat{A})\\|^2 < \\tau$.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-23',
      prompt: 'Zero-shot learning becomes possible because…',
      choices: [
        'labels are represented as word embeddings whose dimensions encode reusable meaning components',
        'the model memorizes every possible label',
        'unlabeled data is always abundant',
        'softmax can output unseen classes',
      ],
      answer: 0,
      explain:
        'Predict embeddings, not classes: features like stripeness or mammalness learned from seen animals recombine to land near the word vector of an unseen one.',
    },
  ],
};

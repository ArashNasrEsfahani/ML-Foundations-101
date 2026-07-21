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
          parts: [
            { tex: 'f(x)', label: 'the prediction at x' },
            { tex: '=' },
            { tex: '\\frac{1}{N}\\sum_{i=1}^{N}', label: 'across every training point' },
            { tex: 'w_i', label: 'how much this one counts…' },
            { tex: 'y_i', label: '…times its label' },
            { tex: ',\\quad' },
            {
              tex: 'w_i = \\frac{N\\,k\\!\\left(\\frac{x_i - x}{b}\\right)}{\\sum_{l=1}^{N} k\\!\\left(\\frac{x_l - x}{b}\\right)}',
              label: 'and the nearer it is, the more it counts',
            },
          ],
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
                'No parameters are fitted — the stored training examples *are* the model',
                'It has no hyperparameters at all, so nothing has to be tuned on validation',
                'Its parameters are set by hand instead of estimated from the training data',
                'It weights every training label equally, so no coefficients need fitting',
              ],
              answer: 0,
              explain:
                'Nothing is fitted in advance: at prediction time every training example votes, weighted by its kernel similarity to $x$. *Non-parametric* does not mean hyperparameter-free — the bandwidth $b$ is still tuned on the validation set — and the weights $w_i$ are anything but equal.',
            },
            {
              kind: 'mcq',
              id: 'ch07-q-beyond-2',
              prompt: 'You shrink the bandwidth $b$ to a very small value. The regression curve will…',
              choices: [
                'wiggle violently, hugging individual noisy training points',
                'smooth out, since fewer neighbors means less influence from noise',
                'flatten toward the global mean of all training labels',
                'become linear, because the kernel weights approach a constant',
              ],
              answer: 0,
              explain:
                'A tiny $b$ gives weight only to extremely close neighbors, so the curve chases each point — that is overfitting in kernel clothing. Fewer contributing neighbors means *more* noise, not less; flattening toward the global mean is what a *large* $b$ does. The sweet spot comes from the validation set.',
            },
            {
              kind: 'multi',
              id: 'ch07-q-beyond-3',
              prompt: 'Which algorithms extend to multiclass problems *naturally* (no one-vs-rest needed)?',
              choices: [
                'Decision trees, which vote with the majority label in a leaf',
                'kNN, which takes the most frequent class among the $k$ neighbors',
                'Logistic regression, once its sigmoid is swapped for a softmax',
                'SVM, which scores each class by its distance to the hyperplane',
              ],
              answers: [0, 1, 2],
              explain:
                'Trees vote in the leaf, kNN votes among neighbors, and softmax gives one probability per class. SVM is inherently binary: scoring several classes by distance to a hyperplane is precisely the one-versus-rest wrapper, not a native multiclass SVM.',
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
                'every label whose individual score exceeds the threshold',
                'exactly one label — the single highest-scoring class',
                'the $k$ highest-scoring labels, for a fixed $k$',
                'all labels whose scores sum to more than the threshold',
              ],
              answer: 0,
              explain:
                'Each label is scored on its own and compared with the threshold, so zero, one, or many labels can fire for the same input — exactly what “conifer + mountain + road” needs. Taking an argmax or a fixed top-$k$ would force the count of labels rather than letting the input decide it.',
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
                '$N$ examples drawn at random *with replacement*, so duplicates appear',
                '$N$ examples drawn at random *without* replacement, so no duplicates',
                'a random half of the training set, with the rest held out',
                '$N$ synthetic examples interpolated between neighboring points',
              ],
              answer: 0,
              explain:
                'Replacement is the whole point: the sample stays size $N$ but changes composition, since some originals are drawn twice and others not at all. Drawing *without* replacement would just reshuffle the same set and give every tree identical data — no diversity, no ensemble.',
            },
            {
              kind: 'mcq',
              id: 'ch07-q-ensembles-2',
              prompt: 'Why does random forest restrict each split to a random subset of features?',
              choices: [
                'To decorrelate the trees, which would otherwise be near-identical',
                'To let each tree train on fewer examples, which speeds the forest up',
                'To force every tree to use the strongest predictors at its top split',
                'To lower each tree’s bias so the ensemble underfits less',
              ],
              answer: 0,
              explain:
                'If one or two features dominate, every tree picks them first and the forest collapses into copies that share their mistakes — and majority voting cannot cancel a mistake everyone makes. Note the subsets restrict *features*, not examples, and bagging attacks variance rather than bias.',
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
          parts: [
            { tex: '\\alpha_t', label: 'how loud this stump’s vote is' },
            { tex: '=' },
            {
              tex: '\\tfrac{1}{2}\\ln\\frac{1 - \\epsilon_t}{\\epsilon_t}',
              label: 'loud when its error is small, silent at a coin flip',
            },
          ],
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
                'The ones the newest stump classified correctly',
                'The ones farthest from the decision boundary',
                'A random half, resampled fresh each round',
              ],
              answer: 0,
              explain:
                'Boosting is sequential error-fixing: raising the weight of a mistake forces the next stump to prioritize it, because each stump minimizes *weighted* error. Random resampling is bagging’s trick, not boosting’s, and distance from the boundary plays no part in the weight update.',
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
                'the residuals $y_i - f(\\mathbf{x}_i)$ left over by the current ensemble',
                'the original labels, from scratch, on a reweighted sample',
                'the output of the previous tree, which it then refines',
                'the exact gradient of the loss w.r.t. the tree parameters',
              ],
              answer: 0,
              explain:
                'Residuals are what the current model still gets wrong; predicting them and adding the result (scaled by the learning rate) nudges the ensemble toward lower MSE. Reweighting examples and refitting the labels is AdaBoost’s scheme, and no true gradient of the tree parameters is ever computed.',
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
                'Input and output sequences are allowed to have different lengths',
                'seq2seq assigns one label to the whole input rather than per element',
                'sequence labeling needs no labeled training pairs, seq2seq does',
                'seq2seq processes the input in both directions, labeling does not',
              ],
              answer: 0,
              explain:
                'Sequence labeling pairs equal-length lists $(\\mathbf{X}, \\mathbf{Y})$ — one label per element; seq2seq drops that constraint, so a 4-word English sentence can become a 3-word French one. Both are supervised, and bidirectionality is an architecture choice available to either.',
            },
            {
              kind: 'mcq',
              id: 'ch07-q-sequences-3',
              prompt: 'The attention mechanism lets the decoder…',
              choices: [
                'combine information from all encoder steps at each output step',
                'skip the encoder and read the raw input sequence directly',
                'compress the encoder states into one smaller embedding',
                'reorder its own outputs after generation using learned weights',
              ],
              answer: 0,
              explain:
                'Attention adds learned parameters that give the decoder per-step access to the whole encoded input, instead of squeezing everything through one fixed-size embedding — which is why long-range dependencies survive. It *widens* the channel rather than compressing it, and it acts during generation, not after.',
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
          parts: [
            { tex: '\\max\\big(' },
            { tex: '\\|f(A) - f(P)\\|^2', label: 'how far the two photos of the same face land' },
            { tex: '-' },
            { tex: '\\|f(A) - f(N)\\|^2', label: 'how far the stranger lands' },
            { tex: '+' },
            { tex: '\\alpha', label: 'the head start you demand' },
            { tex: ',\\; 0\\big)', label: 'and nothing below zero — good enough is good enough' },
          ],
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
                'the examples the current model feels least certain about',
                'the examples the model already classifies most confidently',
                'a uniformly random sample of the unlabeled pool, to avoid bias',
                'the examples sitting farthest from the decision boundary',
              ],
              answer: 0,
              explain:
                'Uncertainty means a score near 0.5, or the example sitting *closest* to the hyperplane, or maximum entropy over the class probabilities. Confident predictions — and points far from the boundary — teach the model almost nothing, and a random sample wastes the budget on examples the model already handles.',
            },
            {
              kind: 'mcq',
              id: 'ch07-q-fewlabels-2',
              prompt: 'In self-learning (semi-supervised), which unlabeled examples get added to the training set?',
              choices: [
                'Those the model labels with confidence above a chosen threshold',
                'Those the model is most unsure about, being the most informative',
                'All of them, each labeled by a second model trained on the same data',
                'None — unlabeled examples only shape the validation split',
              ],
              answer: 0,
              explain:
                'The model bootstraps itself on its own confident predictions. Grabbing the *uncertain* ones is active learning, which only works because a human supplies the true label; here nobody does, so an unsure guess would poison the training set. Gains are usually modest, and confident mistakes get baked in.',
            },
            {
              kind: 'mcq',
              id: 'ch07-q-fewlabels-3',
              prompt: 'What does the triplet loss push the embedding network to do?',
              choices: [
                'Pull the anchor toward the positive and away from the negative',
                'Make every embedding as close as possible to the dataset mean',
                'Maximize the distance between every pair of images in a batch',
                'Reconstruct the anchor’s pixels from its embedding vector',
              ],
              answer: 0,
              explain:
                'The loss reaches zero only once $\\|f(A)-f(N)\\|^2$ exceeds $\\|f(A)-f(P)\\|^2$ by the margin $\\alpha$ — same faces cluster, different faces separate. Collapsing everything onto one point, or pushing *all* pairs apart, would destroy exactly the structure the margin is protecting.',
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
        'a similarity function that turns distance into a prediction weight',
        'a loss function whose minimization fits the model’s coefficients',
        'a regularization penalty that keeps the fitted curve from wiggling too much',
        'a random projection that reduces the input to fewer dimensions',
      ],
      answer: 0,
      explain:
        'The prediction at $x$ is a weighted average of *all* training labels, and $k$ decides the weights: high for nearby $x_i$, low for distant ones. There is no coefficient to fit and no penalty term — smoothness is controlled by the bandwidth $b$, not by a regularizer.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-2',
      prompt: 'Which bandwidth behavior is correct for kernel regression?',
      choices: [
        'Large $b$ → smoother curve; small $b$ → wiggly, overfitting curve',
        'Large $b$ → overfitting; small $b$ → smooth, underfitting curve',
        '$b$ rescales the predictions but leaves the curve’s shape alone',
        '$b$ is learned by gradient descent along with the kernel weights',
      ],
      answer: 0,
      explain:
        'A large $b$ gives distant points real weight, so the average is calm and flat; a small $b$ listens only to the nearest neighbors and chases noise. That is the classic under/overfitting dial — and $b$ is a hyperparameter, so it is tuned on the validation set, never fitted by gradient descent.',
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
        'the largest distance from the input to that model’s hyperplane',
        'the smallest weight vector, since a small $\\|\\mathbf{w}\\|$ means a wide margin',
        'the fewest support vectors, since fewer means a cleaner separation',
        'the smallest distance from the input to that model’s hyperplane',
      ],
      answer: 0,
      explain:
        'SVM outputs no probabilities, so certainty is read off the distance $d = \\frac{\\mathbf{w}^*\\mathbf{x}+b^*}{\\|\\mathbf{w}\\|}$: an input far from the boundary is one the model is sure about, while an input hugging the boundary is the one it would flip on. Margin width and support-vector count describe the *model*, not its confidence about this particular input.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-6',
      prompt: 'Classifying network traffic as “normal vs anything else”, with only normal examples available, is a job for…',
      choices: [
        'one-class classification',
        'multi-label classification',
        'semi-supervised self-learning',
        'one-versus-rest classification',
      ],
      answer: 0,
      explain:
        'One-class (unary) classification models the single available class — e.g., a fitted Gaussian — and flags low-likelihood inputs; the basis of anomaly and novelty detection. One-versus-rest needs labeled examples of every class, and self-learning needs at least a few labels of the class you are trying to find.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-7',
      prompt: 'The one-class Gaussian method predicts an outlier when…',
      choices: [
        'the input’s likelihood under the fitted Gaussian is below a cutoff',
        'the input lies more than one standard deviation away from the mean $\\boldsymbol{\\mu}$',
        'the model’s reconstruction error for that input exceeds a threshold',
        'the input falls outside the smallest hypersphere that wraps the data',
      ],
      answer: 0,
      explain:
        'Fit $\\boldsymbol{\\mu}$ and $\\boldsymbol{\\Sigma}$ by maximum likelihood, then threshold the density $f_{\\boldsymbol{\\mu},\\boldsymbol{\\Sigma}}(\\mathbf{x})$: inside the bell = the class, out in the tails = outlier. The cutoff is tuned, not fixed at one standard deviation; reconstruction error belongs to autoencoders, and the smallest enclosing hypersphere is one-class *SVM*.',
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
        'keeps the labels correlated, so impossible combinations never occur',
        'needs less training data, since one model replaces many others',
        'trains faster when the number of distinct labels is very large',
        'lets a single label take continuous values instead of discrete',
      ],
      answer: 0,
      explain:
        'Predicting whole combinations jointly lets the model learn that e.g. `[spam, priority]` never co-occurs — independent per-label thresholds cannot know that. The cost is the opposite of the other options: the number of fake classes multiplies out, so it needs *more* data and gets slower as labels are added.',
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
        'They make the same mistakes, so voting cannot cancel their errors',
        'They each need the full feature set, which slows every split',
        'They overfit individually, so the averaged forest inherits it',
        'They force the forest to grow far more trees for the same depth',
      ],
      answer: 0,
      explain:
        'The whole benefit of a vote is independent errors averaging out. If dominant features make every tree agree — including on the wrong answers — a hundred trees say exactly what one tree said. Individual trees overfitting is fine and expected; averaging is precisely what cancels that, *provided* the trees are diverse.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-12',
      prompt: 'Bagging vs boosting, in one line:',
      choices: [
        'bagging reduces variance; boosting reduces bias',
        'bagging reduces bias; boosting reduces variance',
        'both reduce variance; neither touches bias',
        'both reduce bias; neither touches variance',
      ],
      answer: 0,
      explain:
        'Averaging over resampled models dilutes noise and unlucky draws — that is variance, so bagging tames overfitting. Boosting instead stacks error-fixers onto an underfitting weak learner, which is bias — and is exactly why boosting *can* overfit if you push the depth or the number of rounds.',
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
        'the residuals act like a gradient, pointing where the model must move',
        'it computes the exact gradient of the loss for each tree’s split parameters',
        'each weak model is itself trained by gradient descent on the labels',
        'the learning rate is annealed along the gradient of the training cost',
      ],
      answer: 0,
      explain:
        'No actual gradient is ever computed. The residuals are its proxy — they point in the direction the model must move to shrink its error — and the learning rate $\\alpha$ is the cautious step size, mirroring gradient descent’s move-a-little-and-reevaluate loop. The trees themselves are fitted by ordinary splitting, not by descent.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-15',
      prompt: 'The three principal hyperparameters of gradient boosting are…',
      choices: [
        'number of trees, learning rate, and tree depth',
        'bandwidth, margin size, and decision threshold',
        'number of clusters, number of features, and batch size',
        'dropout rate, momentum, and early-stopping patience',
      ],
      answer: 0,
      explain:
        'All three shape accuracy, and depth also sets training and prediction speed — shallower is faster. Tuning them is how boosting keeps its appetite for bias reduction from tipping over into overfitting. The other options list knobs from kernel methods, clustering and neural networks.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-16',
      prompt: 'Sequence labeling means…',
      choices: [
        'assigning one label to every element of the input sequence',
        'assigning one label to the sequence as a whole, like a topic tag',
        'generating an output sequence of a different length',
        'sorting the training sequences by length before batching them',
      ],
      answer: 0,
      explain:
        'Training pairs are equal-length lists $(\\mathbf{X}, \\mathbf{Y})$ — one label per time step, as in [“big”, “beautiful”, “car”] → [adjective, adjective, noun]. One label for the whole sequence is ordinary classification, and different-length outputs are seq2seq territory.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-17',
      prompt: 'CRFs work especially well when…',
      choices: [
        'you can handcraft many informative features for each element',
        'the training set has millions of sequences and plenty of compute',
        'no labels are available and the structure must be inferred',
        'the input is raw pixels and the model must learn its own features',
      ],
      answer: 0,
      explain:
        'CRF is logistic regression generalized to sequences: it thrives on rich handcrafted features like “starts with a capital letter” or “appears in a list of city names”. But it trains slowly and struggles at scale, so on huge datasets — and on raw inputs where features must be learned — bidirectional gated RNNs took over.',
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
        'labels are expensive, because each one needs an expert’s time',
        'the dataset is already fully labeled but very large to train on',
        'the model trains so fast that retraining it costs almost nothing',
        'many feature values are missing and must be imputed first',
      ],
      answer: 0,
      explain:
        'Its whole purpose is spending a limited annotation budget on the examples that improve the model most — typically the ones scoring highest on density × uncertainty. If everything is already labeled there is no budget to spend, and cheap retraining is a convenience, not a reason to be selective about labels.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-20',
      prompt: 'In multiclass active learning, a model’s uncertainty about an example is highest when…',
      choices: [
        'its predicted class probabilities are close to uniform',
        'a single class takes almost all of the probability mass',
        'the example has unusually large feature values in every dimension',
        'the example already appeared in the labeled training set',
      ],
      answer: 0,
      explain:
        'Entropy $-\\sum_c \\Pr(c)\\ln\\Pr(c)$ peaks when every class looks equally likely — the model is maximally torn, so the expert’s label would be maximally informative. Probability mass concentrated on one class is the opposite: minimum entropy, and nothing left to learn.',
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
        'Because at deployment one stored photo per person is enough',
        'Because the network is trained for a single epoch over the data',
        'Because each person contributes exactly one triplet to training',
        'Because the model only ever distinguishes one class from all others',
      ],
      answer: 0,
      explain:
        '“One-shot” describes deployment, not training. The siamese network learns a general face embedding from many photos and many triplets; afterwards your phone stores a single reference photo and unlocks if $\\|f(A)-f(\\hat{A})\\|^2 < \\tau$. Note it is not one-class either — it compares two inputs.',
    },
    {
      kind: 'mcq',
      id: 'ch07-boss-23',
      prompt: 'Zero-shot learning becomes possible because…',
      choices: [
        'labels are predicted as word embeddings, not as discrete classes',
        'the softmax layer can grow new output units at prediction time',
        'the model memorizes every possible label in the language beforehand',
        'unlabeled images are abundant, so the model can self-train on them',
      ],
      answer: 0,
      explain:
        'Each label is replaced by its word embedding, whose dimensions carry reusable meaning components — a cartoon version: *mammalness*, *orangeness*, *stripeness*. Those pieces, learned from zebras and clownfish, recombine to land near the word vector for *tiger*. A softmax cannot do this: its output units are fixed at training time.',
    },
  ],
};

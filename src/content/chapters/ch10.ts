import type { Chapter } from '../schema';

/** Chapter 10 — Other Forms of Learning (book pp. 122–131), paraphrased in original words. */
export const ch10: Chapter = {
  id: 'ch10',
  number: 10,
  title: 'Other Forms of Learning',
  subtitle: 'Ranking, recommending, and word embeddings',
  pdfPages: [122, 131],
  badgeId: 'ch10',
  sections: [
    {
      id: 'ch10-metric-learning',
      title: 'Learning What “Close” Means',
      minutes: 5,
      blocks: [
        {
          type: 'p',
          md:
            'Every neighbor-based tool you have met — kNN, k-means, kernels — leans on a similarity measure, usually **Euclidean distance** or cosine similarity. Sensible defaults, but ultimately *arbitrary*, just like squared error was an arbitrary choice of loss. The proof: on some datasets one metric beats the other, so neither is universally right. The fix is very much in this book’s spirit: if the metric matters, **learn it from data** — then plug the learned metric into any algorithm that wants one.',
        },
        {
          type: 'p',
          md: 'The trick is to make the distance *parametrizable*. Slip a matrix into the middle of the Euclidean formula:',
        },
        {
          type: 'formula',
          tex: 'd_{\\mathbf{A}}(\\mathbf{x}, \\mathbf{x}\') = \\sqrt{(\\mathbf{x} - \\mathbf{x}\')^{\\top} \\mathbf{A}\\, (\\mathbf{x} - \\mathbf{x}\')}',
          terms: [
            { tex: '\\mathbf{A}', explain: 'a D×D matrix of learnable parameters — the metric itself' },
            {
              tex: '\\mathbf{x} - \\mathbf{x}\'',
              explain: 'the difference vector between the two examples being compared',
            },
            {
              tex: 'd_{\\mathbf{A}}',
              explain: 'with A = identity this is exactly Euclidean distance; a diagonal A weighs features unequally',
            },
          ],
        },
        {
          type: 'p',
          md:
            'To deserve the name *metric*, $d$ must satisfy three axioms: **nonnegativity**, the **triangle inequality**, and **symmetry**. The first two hold whenever $\\mathbf{A}$ is **positive semidefinite** — the matrix analog of a nonnegative number ($\\mathbf{z}^{\\top}\\mathbf{M}\\mathbf{z} \\ge 0$ for all $\\mathbf{z}$). Symmetry, if needed, comes cheap: average $d(\\mathbf{x},\\mathbf{x}\')$ with $d(\\mathbf{x}\',\\mathbf{x})$.',
        },
        {
          type: 'p',
          md:
            'Training data is two hand-built sets of pairs: $\\mathcal{S}$ holds pairs *you* judge similar, $\\mathcal{D}$ pairs you judge dissimilar. Learning then means: find a positive semidefinite $\\mathbf{A}$ that makes similar pairs as close as possible, while keeping the total distance across dissimilar pairs above some constant $c$ — solved by gradient descent with a modification that keeps $\\mathbf{A}$ positive semidefinite. And a familiar face fits this frame: **one-shot learning** with siamese networks and **triplet loss** is metric learning too — same-person photo pairs play $\\mathcal{S}$, random pairs play $\\mathcal{D}$.',
        },
        {
          type: 'quiz',
          id: 'ch10-q-metric',
          questions: [
            {
              kind: 'mcq',
              id: 'ch10-q-metric-1',
              prompt: 'What happens to $d_{\\mathbf{A}}$ when $\\mathbf{A}$ is the identity matrix?',
              choices: [
                'It reduces exactly to Euclidean distance',
                'It becomes cosine similarity',
                'It is always zero',
                'It stops being a metric',
              ],
              answer: 0,
              explain:
                'The identity leaves the difference vector untouched — the formula collapses to the usual $\\sqrt{(\\mathbf{x}-\\mathbf{x}\')^2}$.',
            },
            {
              kind: 'match',
              id: 'ch10-q-metric-2',
              prompt: 'Match each metric axiom to its statement:',
              pairs: [
                ['Nonnegativity', 'd(x, x′) ≥ 0'],
                ['Triangle inequality', 'd(x, x′) ≤ d(x, z) + d(z, x′)'],
                ['Symmetry', 'd(x, x′) = d(x′, x)'],
              ],
              explain:
                'PSD-ness of A buys the first two; averaging the two directions buys the third.',
            },
            {
              kind: 'tf',
              id: 'ch10-q-metric-3',
              prompt:
                'A diagonal $\\mathbf{A}$ with unequal entries makes some feature dimensions count more than others in the distance.',
              answer: true,
              explain:
                'Each diagonal entry scales one dimension’s contribution — a learned per-feature importance for “closeness”.',
            },
            {
              kind: 'mcq',
              id: 'ch10-q-metric-4',
              prompt: 'The training signal for metric learning consists of…',
              choices: [
                'a set of similar pairs and a set of dissimilar pairs, built by hand',
                'class labels for every example',
                'cluster assignments from k-means',
                'a ranked list of documents',
              ],
              answer: 0,
              explain:
                'Minimize distances over the similar set while keeping the dissimilar set’s distances above a constant — that constraint stops the trivial “everything is close” solution.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch10-ranking',
      title: 'Learning to Rank',
      minutes: 5,
      blocks: [
        {
          type: 'p',
          md:
            '**Learning to rank** is supervised learning where a training example is not one feature vector but a whole *ranked collection* of them — think of a search engine query with its list of documents, each document a feature vector (freshness, query-words-in-title, size, …) and each label a rank or relevance score. The goal is a function $f$ whose output values, sorted, reproduce the ranking the labels describe.',
        },
        {
          type: 'list',
          items: [
            '**Pointwise**: explode each collection into independent (document, score) examples and run plain regression. Simple — but each document is scored in isolation, blind to the rest of the list.',
            '**Pairwise**: a model $f(\\mathbf{x}_i, \\mathbf{x}_k)$ outputs a value near 1 when the first document should outrank the second. Better than pointwise, still imperfect — and the pairwise verdicts must then be assembled into a list.',
            '**Listwise**: optimize, directly, a metric that scores the *entire* ranking — such as **mean average precision** (MAP), which averages precision over the positions of relevant results across many queries.',
          ],
        },
        {
          type: 'p',
          md:
            'The state of the art, **LambdaMART**, is gradient boosting wearing a ranking hat: it grows regression trees for a scoring function $h$, and a sigmoid of $h(\\mathbf{x}_i) - h(\\mathbf{x}_k)$ predicts which document wins each pairwise duel, with cross-entropy as the cost. The genius move: instead of the true gradient, it uses the gradient *scaled by how much the ranking metric (say MAP) would change* if the two documents swapped places. That lets it effectively optimize the metric itself — something almost no supervised algorithm can claim, since metrics are usually non-differentiable and we settle for optimizing a surrogate cost instead.',
        },
        {
          type: 'hint',
          md:
            'From pairwise verdicts to a final list: plug the trained comparator $f$ into an ordinary **sorting algorithm**. Sorting only ever needs pairwise comparisons — so it will happily sort documents instead of numbers.',
        },
        {
          type: 'quiz',
          id: 'ch10-q-ranking',
          questions: [
            {
              kind: 'match',
              id: 'ch10-q-ranking-1',
              prompt: 'Match the ranking approach to its unit of learning:',
              pairs: [
                ['Pointwise', 'one document, one score — plain regression'],
                ['Pairwise', 'two documents — which should rank higher?'],
                ['Listwise', 'the whole list — optimize a ranking metric directly'],
              ],
              explain:
                'Point → pair → list: each step sees more context and typically ranks better.',
            },
            {
              kind: 'mcq',
              id: 'ch10-q-ranking-2',
              prompt: 'The weakness of the pointwise approach is that…',
              choices: [
                'it scores each document in isolation, ignoring the rest of the collection',
                'it cannot use regression models',
                'it needs pairwise labels',
                'it only works for two documents',
              ],
              answer: 0,
              explain:
                'A good *list* is a joint property — e.g. avoiding two near-identical results up top — which per-document scoring cannot see.',
            },
            {
              kind: 'mcq',
              id: 'ch10-q-ranking-3',
              prompt: 'What makes LambdaMART unusual among supervised algorithms?',
              choices: [
                'It effectively optimizes the evaluation metric directly, via metric-scaled gradients',
                'It requires no training data',
                'It uses k-means internally',
                'It cannot use decision trees',
              ],
              answer: 0,
              explain:
                'Metrics are usually non-differentiable, so we optimize a cost and hope; LambdaMART reshapes each gradient by the metric change a swap would cause.',
            },
            {
              kind: 'tf',
              id: 'ch10-q-ranking-4',
              prompt:
                'MAP is computed from relevance judgments made by human assessors over a collection of queries.',
              answer: true,
              explain:
                'Judges (Google calls them rankers) label results as relevant or not; average precision per query is then averaged over all queries.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch10-recommend',
      title: 'Learning to Recommend',
      minutes: 6,
      blocks: [
        {
          type: 'p',
          md:
            'Recommender systems suggest the next movie, book or song from a user’s consumption history. The two classic families: **content-based filtering** learns each user’s taste from *descriptions* of what they consume (science articles in, more science articles out). It works, but it can lock people into a **filter bubble** — an ever-narrowing loop of the same. **Collaborative filtering** ignores content entirely and leans on *other users*: if two people rated the same ten movies alike, each becomes a preview of the other’s future tastes. Its trouble: the user-by-item rating matrix is enormous and almost entirely empty, since each person touches a tiny sliver of the catalog. Real systems are usually **hybrids** of both.',
        },
        {
          type: 'p',
          md:
            '**Factorization machines** (FM) were designed precisely for such extremely sparse data. Each training row concatenates a one-hot user, a one-hot movie, the user’s past ratings and any handcrafted features; the target is the rating. A plain linear model over this can’t capture *interactions* between features (this user × that movie), and one weight per pair would explode the parameter count. FM’s answer: give every feature a small vector of **factors** and model each pairwise interaction as a dot product:',
        },
        {
          type: 'formula',
          tex: 'f(\\mathbf{x}) = b + \\sum_{i=1}^{D} w_i x_i + \\sum_{i=1}^{D}\\sum_{j=i+1}^{D} (\\mathbf{v}_i \\mathbf{v}_j)\\, x_i x_j',
          terms: [
            { tex: 'b,\\ w_i', explain: 'a bias and per-feature weights, exactly as in linear regression' },
            { tex: '\\mathbf{v}_i', explain: 'a k-dimensional factor vector for feature i, with k ≪ D' },
            {
              tex: '\\mathbf{v}_i \\mathbf{v}_j',
              explain: 'a dot product standing in for the pairwise weight w_ij — Dk parameters instead of D(D−1)',
            },
            { tex: 'x_i x_j', explain: 'the interaction term: nonzero only when both features fire together' },
          ],
        },
        {
          type: 'p',
          md:
            'Losses are the usual suspects: squared error for regression, hinge or logistic loss for classification, gradient descent to fit. Ratings on a 1–5 scale? Treat it as multiclass with **one versus rest**.',
        },
        {
          type: 'p',
          md:
            'The second effective tool is the **denoising autoencoder** from Chapter 7 — a network that rebuilds clean input from corrupted input. Recast recommendation as denoising: movies a user *would* love are treated as if a corruption process had deleted them from their preference list. Train by randomly zeroing some of the known ratings and asking the network to restore the intact vector; at prediction time, feed the user’s real ratings and recommend the unwatched items the model scores highest. (A sibling approach: a feed-forward net taking a one-hot user and a one-hot movie and outputting the predicted rating from training triplets.)',
        },
        {
          type: 'quiz',
          id: 'ch10-q-recommend',
          questions: [
            {
              kind: 'mcq',
              id: 'ch10-q-recommend-1',
              prompt: 'The “filter bubble” is a failure mode of…',
              choices: [
                'content-based filtering: users only ever see more of what they already consume',
                'collaborative filtering: ratings are too sparse',
                'factorization machines: too many parameters',
                'denoising autoencoders: too much noise',
              ],
              answer: 0,
              explain:
                'Recommending by content similarity narrows the loop; collaborative signals from other users are one way out.',
            },
            {
              kind: 'mcq',
              id: 'ch10-q-recommend-2',
              prompt: 'Why do factorization machines replace pairwise weights $w_{ij}$ with dot products $\\mathbf{v}_i\\mathbf{v}_j$?',
              choices: [
                'It cuts the interaction parameters from order D² to Dk, which sparse data can actually support',
                'Dot products are faster to type',
                'It removes the need for a bias term',
                'It makes the model linear',
              ],
              answer: 0,
              explain:
                'With extreme sparsity most pairs never co-occur, so per-pair weights can’t be estimated; shared factor vectors generalize across pairs.',
            },
            {
              kind: 'mcq',
              id: 'ch10-q-recommend-3',
              prompt: 'To train a denoising autoencoder as a recommender, you corrupt the input by…',
              choices: [
                'randomly zeroing some known ratings and training the network to restore them',
                'adding Gaussian noise to the user ids',
                'shuffling the movie titles',
                'removing the least active users',
              ],
              answer: 0,
              explain:
                'Hidden favorites are modeled as deleted entries; learning to un-delete is exactly learning to recommend.',
            },
            {
              kind: 'tf',
              id: 'ch10-q-recommend-4',
              prompt:
                'Collaborative filtering needs descriptions of the recommended items’ content to work.',
              answer: false,
              explain:
                'That is its defining trait (and drawback): it uses only the pattern of ratings across users, never the content itself.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch10-embeddings',
      title: 'Words as Vectors',
      minutes: 7,
      blocks: [
        {
          type: 'p',
          md:
            '**Word embeddings** are feature vectors that represent words so that *similar words get similar vectors*. Where do they come from? Learned from data, of course. The raw representation of a word is a **one-hot vector**: 10,000 dictionary words means 10,000 dimensions, all zeros except a single 1. One-hots are huge, and every pair of them is equally far apart — they encode identity, not meaning. The goal is a model mapping each one-hot to a short, dense vector (say 300 numbers) where geometry mirrors semantics.',
        },
        {
          type: 'p',
          md:
            'Cover a word in a sentence: “I almost finished reading the · on machine learning.” You would guess *book*, *article* or *paper* — the **context** gives it away. And that is exactly how a machine can discover those three words are related: they keep appearing in the same contexts across millions of sentences. **word2vec’s skip-gram** flips the game: given the *center* word, predict the context words around it. A window of text with its middle word masked is called a **skip-gram**, and the web supplies hundreds of millions of them for free.',
        },
        {
          type: 'p',
          md:
            'The model is a simple fully connected network: one-hot in, a small **embedding layer** in the middle, and softmax outputs predicting each context word, trained with negative log-likelihood. After training, throw the outputs away — the treasure is the embedding layer’s activations for each input word. Because the “labels” (context words) are carved out of plain unlabeled text, this style is called **self-supervised** learning. (Practical speed-ups for the huge softmax: *hierarchical softmax* and *negative sampling*.)',
        },
        {
          type: 'p',
          md:
            'The magic: directions in the learned space carry meaning. The vector from *man* to *woman* encodes something like gender — add it elsewhere and analogies fall out of pure arithmetic:',
        },
        {
          type: 'math',
          tex: '\\mathbf{v}_{king} - \\mathbf{v}_{man} + \\mathbf{v}_{woman} \\approx \\mathbf{v}_{queen}',
        },
        {
          type: 'widget',
          id: 'WordSpace',
          challenge: {
            id: 'ch10-challenge-words',
            label: 'solve two analogies with vector arithmetic',
            xp: 15,
          },
        },
        {
          type: 'quiz',
          id: 'ch10-q-embeddings',
          questions: [
            {
              kind: 'mcq',
              id: 'ch10-q-embeddings-1',
              prompt: 'What is wrong with one-hot vectors as word representations?',
              choices: [
                'They are huge and place every pair of words at the same distance — no notion of similarity',
                'They cannot represent rare words',
                'They contain negative numbers',
                'They change every time the text changes',
              ],
              answer: 0,
              explain:
                'One-hots encode only identity; embeddings compress them into a dense space where distance means relatedness.',
            },
            {
              kind: 'mcq',
              id: 'ch10-q-embeddings-2',
              prompt: 'The skip-gram model is trained to…',
              choices: [
                'predict the context words surrounding a given center word',
                'predict the next document a user will read',
                'translate between two languages',
                'compress images of text',
              ],
              answer: 0,
              explain:
                'Words sharing contexts end up with similar embeddings — which is exactly the property we wanted.',
            },
            {
              kind: 'tf',
              id: 'ch10-q-embeddings-3',
              prompt:
                'word2vec is called self-supervised because its training labels are extracted automatically from unlabeled text.',
              answer: true,
              explain:
                'No annotator labels anything: each window of raw text supplies both the input (center word) and the targets (its context).',
            },
            {
              kind: 'mcq',
              id: 'ch10-q-embeddings-4',
              prompt: 'After training a skip-gram network, the embedding of a word is…',
              choices: [
                'the embedding layer’s output when that word’s one-hot is fed in',
                'the softmax output probabilities',
                'the word’s row in the co-occurrence matrix',
                'the average of all context one-hots',
              ],
              answer: 0,
              explain:
                'The prediction head is scaffolding; the bottleneck activations are the reusable representation.',
            },
          ],
        },
      ],
    },
  ],
  bossPool: [
    {
      kind: 'mcq',
      id: 'ch10-boss-1',
      prompt: 'The argument for *learning* a distance metric is that…',
      choices: [
        'no fixed metric (Euclidean, cosine, …) is best for every dataset',
        'Euclidean distance is impossible to compute in high dimensions',
        'metrics cannot be used inside kNN',
        'cosine similarity is not symmetric',
      ],
      answer: 0,
      explain:
        'One metric beating another depending on the data proves neither is perfect — so parametrize the metric and fit it.',
    },
    {
      kind: 'numeric',
      id: 'ch10-boss-2',
      prompt:
        'Let $\\mathbf{A} = \\mathrm{diag}(4, 1)$ and $\\mathbf{x} - \\mathbf{x}\' = (1, 2)$. Compute $d_{\\mathbf{A}} = \\sqrt{4\\cdot 1^2 + 1\\cdot 2^2}$.',
      answer: 2.828,
      tolerance: 0.05,
      explain: '$\\sqrt{4 + 4} = \\sqrt{8} \\approx 2.83$ — the first dimension counts four times as much.',
    },
    {
      kind: 'mcq',
      id: 'ch10-boss-3',
      prompt: 'Requiring $\\mathbf{A}$ to be positive semidefinite guarantees…',
      choices: [
        'nonnegativity and the triangle inequality of the learned distance',
        'that A is diagonal',
        'symmetry of the distance',
        'that training converges in one step',
      ],
      answer: 0,
      explain:
        'PSD is the matrix version of “nonnegative number”; symmetry is handled separately by averaging the two directions.',
    },
    {
      kind: 'tf',
      id: 'ch10-boss-4',
      prompt:
        'One-shot learning with siamese networks and triplet loss can be viewed as metric learning with same-person pairs as the similar set.',
      answer: true,
      explain:
        'Photo pairs of one person form S, random pairs form D — the network learns an embedding whose distances respect that split.',
    },
    {
      kind: 'match',
      id: 'ch10-boss-5',
      prompt: 'Match the learning-to-rank approach to its description:',
      pairs: [
        ['Pointwise', 'regress a score for each document independently'],
        ['Pairwise', 'predict which of two documents outranks the other'],
        ['Listwise', 'directly optimize a whole-ranking metric like MAP'],
      ],
      explain: 'More context per training signal generally means better rankings.',
    },
    {
      kind: 'mcq',
      id: 'ch10-boss-6',
      prompt: 'In learning to rank, one *training example* is…',
      choices: [
        'a ranked collection of documents, each a feature vector with a rank label',
        'a single document with a class label',
        'a pair of users',
        'an unlabeled query string',
      ],
      answer: 0,
      explain:
        'The unit is the whole labeled list for one query — features might encode freshness, query-title overlap, size, and so on.',
    },
    {
      kind: 'mcq',
      id: 'ch10-boss-7',
      prompt: 'LambdaMART builds its scoring function using…',
      choices: [
        'gradient boosting of regression trees',
        'a support vector machine',
        'k-nearest neighbors',
        'a genetic algorithm',
      ],
      answer: 0,
      explain:
        'Trees are added to reduce the current error, but with gradients rescaled by the ranking-metric impact of swapping two documents.',
    },
    {
      kind: 'mcq',
      id: 'ch10-boss-8',
      prompt: 'Why is directly optimizing a metric like MAP normally off the table?',
      choices: [
        'Metrics are usually non-differentiable, so we optimize a differentiable cost instead',
        'Metrics are too cheap to compute',
        'MAP requires unlabeled data',
        'Optimizing metrics is illegal in competitions',
      ],
      answer: 0,
      explain:
        'The usual routine: minimize a surrogate cost, then tune hyperparameters while watching the metric. LambdaMART shortcuts this.',
    },
    {
      kind: 'mcq',
      id: 'ch10-boss-9',
      prompt: 'How do you turn a trained pairwise comparator into a final ranked list?',
      choices: [
        'Use it as the comparison inside a standard sorting algorithm',
        'Average all pairwise outputs into one score',
        'Retrain it as a pointwise model',
        'It is impossible without listwise training',
      ],
      answer: 0,
      explain:
        'Sorting algorithms only ever compare two items at a time — swap number comparison for the model f and they sort documents.',
    },
    {
      kind: 'tf',
      id: 'ch10-boss-10',
      prompt: 'Average precision for a query rewards rankings that place relevant documents near the top.',
      answer: true,
      explain:
        'It averages precision measured at each position where a relevant document appears; MAP then averages over queries.',
    },
    {
      kind: 'mcq',
      id: 'ch10-boss-11',
      prompt: 'Collaborative filtering recommends based on…',
      choices: [
        'the ratings of users with similar tastes, ignoring item content',
        'the textual description of each item',
        'the alphabetical order of titles',
        'the user’s device type',
      ],
      answer: 0,
      explain:
        'Two users agreeing on ten movies predict each other’s next favorites — no content needed (which is both its power and its blind spot).',
    },
    {
      kind: 'tf',
      id: 'ch10-boss-12',
      prompt:
        'The user-by-item rating matrix in real recommender systems is mostly empty because each user rates a tiny fraction of the catalog.',
      answer: true,
      explain:
        'Millions of users × huge catalogs, sparse cells — the very reason factorization machines were invented.',
    },
    {
      kind: 'mcq',
      id: 'ch10-boss-13',
      prompt: 'The FM interaction term $(\\mathbf{v}_i\\mathbf{v}_j)x_i x_j$ contributes only when…',
      choices: [
        'both features $x_i$ and $x_j$ are nonzero in the example',
        'the factors are orthogonal',
        'the example is an outlier',
        'i equals j',
      ],
      answer: 0,
      explain:
        'The product $x_i x_j$ gates the interaction — e.g. this specific user together with this specific movie.',
    },
    {
      kind: 'numeric',
      id: 'ch10-boss-14',
      prompt:
        'A factorization machine has D = 100 features and factor dimension k = 10. How many parameters do the factor vectors add (D·k)?',
      answer: 1000,
      tolerance: 0.5,
      explain:
        '100 × 10 = 1,000 — versus 100 × 99 = 9,900 individual pairwise weights $w_{ij}$. That gap grows brutally with D.',
    },
    {
      kind: 'mcq',
      id: 'ch10-boss-15',
      prompt: 'With labels in {1,2,3,4,5}, the book converts FM rating prediction into…',
      choices: [
        'five binary problems via one versus rest',
        'a clustering problem',
        'a ranking problem',
        'a density estimation problem',
      ],
      answer: 0,
      explain:
        'One-vs-rest is the standard bridge from a binary learner to a multiclass task — here, one binary model per star level.',
    },
    {
      kind: 'mcq',
      id: 'ch10-boss-16',
      prompt: 'At prediction time, a denoising-autoencoder recommender suggests…',
      choices: [
        'the not-yet-consumed items with the highest reconstructed scores',
        'the items the user already rated highest',
        'random items to escape the filter bubble',
        'only items with handcrafted features',
      ],
      answer: 0,
      explain:
        'Feed the uncorrupted rating vector in; the model “restores” items the corruption story says were deleted — the user’s likely favorites.',
    },
    {
      kind: 'order',
      id: 'ch10-boss-17',
      prompt: 'Order the word2vec skip-gram pipeline:',
      items: [
        'Collect a large amount of raw text',
        'Slide a window to extract skip-grams (center word + context)',
        'Train a network to predict context words from the center word',
        'Read each word’s embedding off the embedding layer',
      ],
      explain:
        'Self-supervision end to end: the text itself manufactures the training pairs.',
    },
    {
      kind: 'mcq',
      id: 'ch10-boss-18',
      prompt: 'Words like “book”, “paper” and “article” get similar embeddings because…',
      choices: [
        'they appear in similar contexts across many texts',
        'they have similar spelling',
        'they are all short words',
        'an annotator marked them as synonyms',
      ],
      answer: 0,
      explain:
        'Shared contexts → similar prediction targets → similar internal representations. Meaning by company kept.',
    },
    {
      kind: 'mcq',
      id: 'ch10-boss-19',
      prompt: 'Hierarchical softmax and negative sampling exist to…',
      choices: [
        'make training tractable despite the enormous output vocabulary',
        'improve the quality of small datasets',
        'remove the embedding layer',
        'add nonlinearity to the model',
      ],
      answer: 0,
      explain:
        'A softmax over tens of thousands of words is costly; tree-structured outputs or updating only sampled outputs keeps it fast.',
    },
    {
      kind: 'mcq',
      id: 'ch10-boss-20',
      prompt: 'The analogy $\\mathbf{v}_{king} - \\mathbf{v}_{man} + \\mathbf{v}_{woman} \\approx \\mathbf{v}_{queen}$ works because…',
      choices: [
        'consistent semantic relationships become consistent directions in the embedding space',
        'the vectors are one-hot',
        'queen is the most frequent word in English',
        'the model memorized this exact equation',
      ],
      answer: 0,
      explain:
        'The man→woman offset captures gender; transporting the same offset from king lands near queen. Geometry inherits semantics.',
    },
  ],
};

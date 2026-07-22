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
            'Every neighbor-based tool you have met — [kNN](sec:ch03-knn), k-means, kernels — leans on a similarity measure, usually **[[euclidean-distance|Euclidean distance]]** or [[cosine-similarity|cosine similarity]]. Sensible defaults, but ultimately *arbitrary*, just like squared error was an arbitrary choice of loss. The proof: on some datasets one metric beats the other, so neither is universally right. The fix is very much in this book’s spirit: if the metric matters, **[[metric-learning|learn it from data]]** — then plug the learned metric into any algorithm that wants one.',
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
            'To deserve the name *[[distance-metric|metric]]*, $d$ must satisfy three axioms: **nonnegativity**, the **[[triangle-inequality|triangle inequality]]**, and **symmetry**. The first two hold whenever $\\mathbf{A}$ is **[[positive-semidefinite]]** — the matrix analog of a nonnegative number ($\\mathbf{z}^{\\top}\\mathbf{M}\\mathbf{z} \\ge 0$ for all $\\mathbf{z}$). Symmetry, if needed, comes cheap: average $d(\\mathbf{x},\\mathbf{x}\')$ with $d(\\mathbf{x}\',\\mathbf{x})$.',
        },
        {
          type: 'p',
          md:
            'Training data is two hand-built sets of pairs: $\\mathcal{S}$ holds pairs *you* judge similar, $\\mathcal{D}$ pairs you judge dissimilar. Learning then means: find a positive semidefinite $\\mathbf{A}$ that makes similar pairs as close as possible, while keeping the total distance across dissimilar pairs above some constant $c$ — solved by [gradient descent](sec:ch04-gradient-descent) with a modification that keeps $\\mathbf{A}$ positive semidefinite. That second constraint is not decoration. Without it the optimizer finds the perfect degenerate answer in one step: set $\\mathbf{A} = \\mathbf{0}$, declare every pair to be at distance zero, and every similar pair is now as close as it could possibly be.',
        },
        {
          type: 'p',
          md:
            'It helps to know what a learned $\\mathbf{A}$ is actually *doing*. Every positive semidefinite matrix factors as $\\mathbf{A} = \\mathbf{L}^{\\top}\\mathbf{L}$, and substituting that in turns $d_{\\mathbf{A}}(\\mathbf{x},\\mathbf{x}\')$ into $\\lVert\\mathbf{L}\\mathbf{x} - \\mathbf{L}\\mathbf{x}\'\\rVert$ — plain Euclidean distance, measured after the space has been stretched, squashed and rotated by $\\mathbf{L}$. So learning a metric is learning a linear transformation of the features, and everything downstream that reads distances inherits it for free. Point a diagonal $\\mathbf{A}$ at a dataset whose salary column runs to six figures while its age column stops at 100, and the first thing it learns is the [standardization you should have applied by hand](sec:ch05-feature-engineering). Point a full $\\mathbf{A}$ at it and it can also learn that two features only matter *in combination*.',
        },
        {
          type: 'p',
          md:
            'And a familiar face fits this frame exactly: **[[one-shot-learning]]** with [[siamese-network|siamese networks]] and **[[triplet-loss]]**, from [Chapter 7](sec:ch07-few-labels), is metric learning too — same-person photo pairs play $\\mathcal{S}$, random pairs play $\\mathcal{D}$. The only difference is that the transformation being learned is a deep network rather than a matrix, so the geometry it can impose is no longer restricted to stretching and rotating.',
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
                'It becomes cosine similarity between the two vectors',
                'It collapses to zero for every pair of examples',
                'It loses the triangle inequality and stops being a metric',
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
                'a set of similar pairs and a set of dissimilar pairs',
                'a class label for every example, as in classification',
                'cluster assignments produced by running k-means first',
                'a target distance value attached to each pair of examples',
              ],
              answer: 0,
              explain:
                'Both sets $\\mathcal{S}$ and $\\mathcal{D}$ are built by hand. Minimize distances over the similar set while keeping the dissimilar set’s distances above a constant $c$ — that constraint stops the trivial “everything is close” solution. No numeric target distance is ever supplied.',
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
            '**[[learning-to-rank|Learning to rank]]** is supervised learning where a training example is not one feature vector but a whole *ranked collection* of them — think of a search engine query with its list of documents, each document a feature vector (freshness, query-words-in-title, size, …) and each label a rank or relevance score. The goal is a function $f$ whose output values, sorted, reproduce the ranking the labels describe. Only the order is graded, which has a consequence worth pausing on: a model that doubles every score it produces is exactly as good as the original, and a model that gets every score nearly right but reverses the top two is much worse.',
        },
        {
          type: 'list',
          items: [
            '**[[pointwise-ranking|Pointwise]]**: explode each collection into independent (document, score) examples and run plain regression. Simple — but each document is scored in isolation, blind to the rest of the list.',
            '**[[pairwise-ranking|Pairwise]]**: a model $f(\\mathbf{x}_i, \\mathbf{x}_k)$ outputs a value near 1 when the first document should outrank the second. Better than pointwise, still imperfect — and the pairwise verdicts must then be assembled into a list.',
            '**[[listwise-ranking|Listwise]]**: optimize, directly, a metric that scores the *entire* ranking — such as **[[mean-average-precision|mean average precision]]** (MAP), which averages precision over the positions of relevant results across many queries.',
          ],
        },
        {
          type: 'p',
          md:
            'The state of the art, **[[lambdamart|LambdaMART]]**, is [gradient boosting](sec:ch07-boosting) wearing a ranking hat. The MART half is ordinary: an additive ensemble of small regression trees builds up a scoring function $h$, each new tree fitted to the errors the ensemble so far still makes. The ranking half is where it earns its name, and it is worth walking through slowly.',
        },
        {
          type: 'p',
          md:
            'Start from the pairwise view. For two documents returned by one query, $\\sigma\\!\\left(h(\\mathbf{x}_i) - h(\\mathbf{x}_k)\\right)$ is the model’s belief that the first should outrank the second, and cross-entropy against the true order gives every misordered pair a gradient — a small arrow saying "push $i$ up, push $k$ down". Fitting the next tree to those arrows is plain pairwise ranking, and it treats every misordering as equally serious. It is not. Swapping the documents at ranks 1 and 2 wrecks the page; swapping ranks 40 and 41 changes nothing any human will ever see.',
        },
        {
          type: 'p',
          md:
            'So LambdaMART rescales each arrow by how much the ranking metric would actually move if those two documents traded places — a large factor for a swap near the top, almost nothing for a swap in the tail. The rescaled quantities are the *lambdas*, and the striking part is that no loss function was ever written down whose gradient they are. They are simply used *as* gradients, and it works: the next tree spends its capacity where the metric lives. That is how a supervised algorithm ends up optimizing a metric it cannot differentiate, which almost none of them can claim — the normal routine is to minimize a surrogate cost and hope the metric follows it.',
        },
        {
          type: 'hint',
          md:
            'From pairwise verdicts to a final list: plug the trained comparator $f$ into an ordinary **sorting algorithm**. Sorting only ever needs pairwise comparisons — so it will happily sort documents instead of numbers. One catch: a learned comparator need not be *transitive*, so it can insist that A beats B, B beats C and C beats A, and then the list you get depends on which sorting algorithm you used. Scoring each document once with a single function $h$ and sorting the numbers avoids the problem entirely, which is why [[lambdamart|LambdaMART]] is built that way.',
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
                'it scores each document blind to the rest of the list',
                'it can only be fit with classifiers, never with regression',
                'it needs every document pair to be labeled by hand',
                'it breaks down once a query returns more than two documents',
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
                'It effectively optimizes the evaluation metric itself',
                'It needs no labeled training data, only the query lists',
                'It clusters the documents with k-means before scoring them',
                'It replaces the trees of gradient boosting with linear models',
              ],
              answer: 0,
              explain:
                'Metrics are usually non-differentiable, so we optimize a cost and hope; LambdaMART reshapes each gradient by the metric change a swap would cause. It is still fully supervised gradient boosting over regression trees — the trees stay.',
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
            'Recommender systems suggest the next movie, book or song from a user’s consumption history. The two classic families: **[[content-based-filtering|content-based filtering]]** learns each user’s taste from *descriptions* of what they consume (science articles in, more science articles out). It works, but it can lock people into a **[[filter-bubble|filter bubble]]** — an ever-narrowing loop of the same. **[[collaborative-filtering|Collaborative filtering]]** ignores content entirely and leans on *other users*: if two people rated the same ten movies alike, each becomes a preview of the other’s future tastes. Its trouble: the user-by-item rating matrix is enormous and almost entirely empty, since each person touches a tiny sliver of the catalog. Real systems are usually **hybrids** of both.',
        },
        {
          type: 'p',
          md:
            'The two families also fail at opposite ends. Content-based filtering copes fine with an item nobody has touched yet, because it reads the item’s own description — but it cannot tell you about a film that resembles nothing you have watched. Collaborative filtering can make exactly that leap, since it never looks at content at all, but a brand-new item has no ratings and is therefore invisible until somebody takes a chance on it. That is the *cold-start* problem, and it is the practical reason production systems hybridize rather than pick a side.',
        },
        {
          type: 'p',
          md:
            '**[[factorization-machines|Factorization machines]]** (FM) were designed precisely for such extremely sparse data. Each training row concatenates a one-hot user, a one-hot movie, the user’s past ratings and any handcrafted features; the target is the rating. A plain linear model over this can’t capture *interactions* between features (this user × that movie), and one weight per pair would explode the parameter count. FM’s answer: give every feature a small vector of **factors** and model each pairwise interaction as a dot product:',
        },
        {
          type: 'formula',
          tex: 'f(\\mathbf{x}) = b + \\sum_{i=1}^{D} w_i x_i + \\sum_{i=1}^{D}\\sum_{j=i+1}^{D} (\\mathbf{v}_i \\mathbf{v}_j)\\, x_i x_j',
          parts: [
            { tex: 'f(\\mathbf{x})', label: 'the prediction' },
            { tex: '=' },
            { tex: 'b', label: 'a baseline' },
            { tex: '+' },
            { tex: '\\sum_{i=1}^{D} w_i x_i', label: 'each feature on its own, as in linear regression' },
            { tex: '+' },
            {
              tex: '\\sum_{i=1}^{D}\\sum_{j=i+1}^{D} (\\mathbf{v}_i \\mathbf{v}_j)\\, x_i x_j',
              label: 'and every pair of features, acting together',
            },
          ],
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
            'Why does swapping $w_{ij}$ for $\\mathbf{v}_i\\mathbf{v}_j$ do more than save memory? Because a per-pair weight can only ever be learned from examples where that exact pair appears together — and in a matrix that is 99% empty, almost no pair ever does, so almost every $w_{ij}$ would finish training at whatever value it was initialized to. A factor vector has no such problem. Every rating this user has given teaches $\\mathbf{v}_{user}$ something; every rating this film has received teaches $\\mathbf{v}_{film}$ something; and their dot product is then a genuine *prediction* about a pairing the model has never once observed. Sharing parameters across pairs is what buys generalization into the empty cells — the same bargain a [[word-embeddings|word embedding]] strikes a few pages from now.',
        },
        {
          type: 'p',
          md:
            'One more thing hides in that double sum: it looks quadratic in the feature count, which would be fatal at this width. It is not. The interaction term rewrites as $\\tfrac{1}{2}\\sum_{l}\\left[\\left(\\sum_i v_{il}x_i\\right)^2 - \\sum_i v_{il}^2 x_i^2\\right]$ — one pass per factor dimension — so the cost is linear in the number of *nonzero* features in a row. With a one-hot user and a one-hot movie, that is two.',
        },
        {
          type: 'p',
          md:
            'Losses are the usual suspects: [[squared-loss|squared error]] for regression, [[hinge-loss|hinge]] or logistic loss for classification, [gradient descent](sec:ch04-gradient-descent) to fit. Ratings on a 1–5 scale? Treat it as multiclass with **[[one-versus-rest|one versus rest]]**.',
        },
        {
          type: 'p',
          md:
            'The second effective tool is the **[[denoising-autoencoder|denoising autoencoder]]** from [Chapter 7](sec:ch07-few-labels) — a network that rebuilds clean input from corrupted input. Recast recommendation as denoising: movies a user *would* love are treated as if a corruption process had deleted them from their preference list. Train by randomly zeroing some of the known ratings and asking the network to restore the intact vector; at prediction time, feed the user’s real ratings and recommend the unwatched items the model scores highest. The corruption has to be *deletion* specifically, not added noise, because deletion is the story the recommendation is told as. (A sibling approach: a feed-forward net taking a one-hot user and a one-hot movie and outputting the predicted rating from training triplets.)',
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
                'content-based filtering: only more of what you already consume',
                'collaborative filtering: the rating matrix is mostly empty',
                'factorization machines: pairwise weights are too numerous',
                'denoising autoencoders: the corruption erases real ratings',
              ],
              answer: 0,
              explain:
                'Recommending by content similarity narrows the loop; collaborative signals from other users are one way out. The other three options name real difficulties — sparsity, parameter blow-up, corruption — but none of them is the filter bubble.',
            },
            {
              kind: 'mcq',
              id: 'ch10-q-recommend-2',
              prompt: 'Why do factorization machines replace pairwise weights $w_{ij}$ with dot products $\\mathbf{v}_i\\mathbf{v}_j$?',
              choices: [
                'It cuts the interaction parameters from order D² to Dk',
                'It makes the interaction terms differentiable during training',
                'It lets the bias term be dropped from the model entirely',
                'It keeps the model linear, so it stays easy to interpret',
              ],
              answer: 0,
              explain:
                'With extreme sparsity most pairs never co-occur, so per-pair weights can’t be estimated; shared factor vectors generalize across pairs and shrink the count from order $D^2$ to $Dk$. The bias and per-feature weights stay, and the interaction terms are what make the model *non*-linear.',
            },
            {
              kind: 'mcq',
              id: 'ch10-q-recommend-3',
              prompt: 'To train a denoising autoencoder as a recommender, you corrupt the input by…',
              choices: [
                'randomly zeroing some of the user’s known ratings',
                'adding Gaussian noise to every rating in the vector',
                'replacing each rating with that item’s average rating',
                'dropping the users who rated fewest items from the batch',
              ],
              answer: 0,
              explain:
                'Hidden favorites are modeled as deleted entries, so the corruption must be *deletion* — zero out known ratings and train the network to restore the intact vector. Learning to un-delete is exactly learning to recommend.',
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
            '**[[word-embeddings|Word embeddings]]** are feature vectors that represent words so that *similar words get similar vectors*. Where do they come from? Learned from data, of course. The raw representation of a word is a **[[one-hot-vector|one-hot vector]]**: 10,000 dictionary words means 10,000 dimensions, all zeros except a single 1. One-hots are huge, and every pair of them is equally far apart — they encode identity, not meaning. Nothing a model learns about *dog* can possibly transfer to *puppy*, because the two vectors have no coordinate in common. The goal is a model mapping each one-hot to a short, dense vector (say 300 numbers) where geometry mirrors semantics.',
        },
        {
          type: 'p',
          md:
            'Cover a word in a sentence: “I almost finished reading the · on machine learning.” You would guess *book*, *article* or *paper* — the surrounding **context** gives it away. And that is exactly how a machine can discover those three words are related: across millions of sentences they keep turning up in the same company.',
        },
        {
          type: 'p',
          md:
            '**[[word2vec]]** turns that observation into a training set. Slide a window of, say, five tokens along the raw text. The word in the middle is the *center*; the ones around it are the *context*. The **[[skip-gram]]** architecture takes the center word as its input and asks the model to predict the context words — one training pair per neighbor, so a single position in the corpus yields four examples. (Its sibling CBOW runs the arrow the other way, predicting the center from the context.) Nobody labels anything: the text supplies both the questions and the answers, which is why a corpus of a billion words becomes a training set of several billion examples at no cost.',
        },
        {
          type: 'p',
          md:
            'And here is why that produces vectors carrying meaning. The network has one narrow layer sitting between the input word and its predictions, so everything the model knows about a word has to be squeezed into that word’s row of the **[[embedding-layer|embedding layer]]** — the same bottleneck logic as an autoencoder, applied to a different task. Two words appearing in the same contexts must therefore make the same predictions: *book* and *paper* both need to put weight on *reading*, *the*, *published*, *pages*. And the only way for two words to produce the same predictions is for them to hold nearly the same vector. Similarity of usage gets *forced* into similarity of position. Nothing in the objective ever mentions meaning; it falls out of the compression.',
        },
        {
          type: 'p',
          md:
            'Mechanically it is a plain [fully connected network](sec:ch06-neural-networks) — one-hot in, the embedding layer in the middle, a [[softmax]] over the whole vocabulary out, trained with negative [[log-likelihood|log-likelihood]]. Afterwards the prediction head is scaffolding and gets thrown away; the embedding layer is the thing you keep. Because the “labels” are carved out of ordinary unlabeled text rather than supplied by an annotator, this style of training has a name of its own: **[[self-supervised-learning|self-supervised]]** learning, and it is the same trick that later produced BERT and every large language model. One practical snag: that softmax runs over tens of thousands of words for every single training pair. The two standard cures are *hierarchical softmax*, which replaces the flat vocabulary with a binary tree so each update touches about $\\log_2 V$ nodes, and *negative sampling*, which scores the true context word against a handful of random ones and leaves the rest alone.',
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
          type: 'hint',
          md:
            'The catch with embeddings of this kind: one vector per word *type*, so the river bank and the savings bank have to share a single point in space, and it lands somewhere unhelpful between the two. Fixing that is what contextual models do — they emit a vector per *occurrence*, computed from the sentence it sits in — but the underlying idea never changed. Meaning is still position, and position is still learned by predicting what company a word keeps. Note also that the window size is a real dial rather than a detail: a narrow window groups words by grammatical role, a wide one groups them by topic.',
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
                'They are huge, and every pair sits the same distance apart',
                'They can only represent words seen in the training corpus',
                'They mix negative and positive values, confusing softmax',
                'They have to be rebuilt whenever a new document arrives',
              ],
              answer: 0,
              explain:
                'One-hots encode only identity: every vector is a single 1 among thousands of zeros, so all pairs are equidistant and no two words can be “closer”. Embeddings compress them into a dense space where distance means relatedness.',
            },
            {
              kind: 'mcq',
              id: 'ch10-q-embeddings-2',
              prompt: 'The skip-gram model is trained to…',
              choices: [
                'predict the context words around a given center word',
                'predict the missing center word from its surrounding context',
                'predict which two words are synonyms in a dictionary',
                'reconstruct the one-hot vector from its own embedding',
              ],
              answer: 0,
              explain:
                'Skip-gram runs center → context; the reverse direction (context → center) is the *other* word2vec architecture, CBOW. Either way, words sharing contexts end up with similar embeddings — exactly the property we wanted.',
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
                'the embedding layer’s output for that word’s one-hot',
                'the softmax probabilities the network outputs for that word',
                'the word’s row in the corpus co-occurrence count matrix',
                'the average of the one-hot vectors of its context words',
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
        'no fixed metric is the best choice on every dataset',
        'Euclidean distance becomes too costly in high dimensions',
        'kNN and k-means cannot accept a user-supplied metric',
        'cosine similarity cannot be parametrized by a matrix',
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
        'nonnegativity and the triangle inequality of $d_{\\mathbf{A}}$',
        'that A stays diagonal, so features never interact',
        'symmetry, so d(x, x′) always equals d(x′, x)',
        'that gradient descent reaches the global optimum',
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
        'a ranked collection of documents, each with a rank label',
        'a single document paired with its own relevance score',
        'a pair of documents plus a label saying which one wins',
        'a query string whose documents have not been labeled',
      ],
      answer: 0,
      explain:
        'The unit is the whole labeled list for one query — features might encode freshness, query-title overlap, size, and so on. Single documents and document pairs are how *pointwise* and *pairwise* methods chop that list up afterwards, not what the data arrives as.',
    },
    {
      kind: 'mcq',
      id: 'ch10-boss-7',
      prompt: 'LambdaMART builds its scoring function using…',
      choices: [
        'gradient boosting of regression trees',
        'a support vector machine with an RBF kernel',
        'k-nearest neighbors over the document features',
        'a genetic algorithm searching over tree shapes',
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
        'Metrics are non-differentiable, so a surrogate cost is used',
        'Metrics are far too expensive to evaluate during training',
        'MAP can only be computed once the full test set is labeled',
        'Metrics depend on hyperparameters fixed before training',
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
        'Use it as the comparison inside a sorting algorithm',
        'Average the comparator’s outputs into one threshold',
        'Retrain the same model in pointwise mode on the scores',
        'You cannot — only listwise training produces a full list',
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
        'the ratings of users with similar tastes',
        'the description of each item the user has consumed',
        'the overall popularity of each item in the catalog',
        'the order in which the user consumed past items',
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
        'both features $x_i$ and $x_j$ are nonzero',
        'the factor vectors $\\mathbf{v}_i$ and $\\mathbf{v}_j$ point the same way',
        'the two features belong to different one-hot blocks',
        'the two features have equal values in the example',
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
        'five binary problems, one for each star level',
        'a clustering problem with five clusters',
        'a ranking problem over the rated items',
        'a density estimation problem for the ratings',
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
        'unseen items with the highest reconstructed scores',
        'already-rated items with the highest reconstructed scores',
        'unseen items whose reconstruction error is largest',
        'a random sample of unseen items, avoiding the bubble',
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
        'they share many of the same letters and word endings',
        'they occur with roughly the same frequency in English',
        'a synonym dictionary tied their vectors together',
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
        'make training tractable despite a huge output vocabulary',
        'let the model learn useful vectors from small corpora',
        'shrink the embedding layer so the vectors stay compact',
        'add the nonlinearity the plain softmax layer lacks',
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
        'a consistent relation becomes a consistent direction',
        'the embedding vectors are still one-hot underneath',
        'king and queen appear next to one another in the dictionary',
        'the training text contained this analogy many times',
      ],
      answer: 0,
      explain:
        'The man→woman offset captures gender; transporting the same offset from king lands near queen. Geometry inherits semantics.',
    },
  ],
};

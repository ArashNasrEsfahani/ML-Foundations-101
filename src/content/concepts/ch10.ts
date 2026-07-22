import type { Concept } from './types';

/**
 * Chapter 10's vocabulary: the three tasks that do not fit the
 * one-example-one-label mould — ranking, recommending, representing — plus the
 * machinery underneath a learned distance.
 */
export const conceptsCh10: Concept[] = [
  {
    id: 'euclidean-distance',
    term: 'Euclidean distance',
    simple:
      'Straight-line distance, the kind a ruler measures. Square the gap along each axis, add them up, take the square root — Pythagoras, extended to as many dimensions as you have features.',
    technical:
      'The default [[distance-metric|metric]] almost everywhere, and a default rather than a law. It treats every feature as equally important and every direction as equivalent, which is only reasonable once the features share a scale — otherwise the column with the biggest numbers decides everything on its own. In very high dimensions it degrades in a specific way: the ratio between a point’s nearest and farthest neighbour drifts toward one, so "nearest" stops carrying much information. Its relatives are Manhattan distance and, in general, the Minkowski family.',
    math:
      '$d(\\mathbf{x},\\mathbf{x}\') = \\sqrt{\\sum_{j=1}^{D}\\left(x^{(j)} - x\'^{(j)}\\right)^2} = \\lVert\\mathbf{x} - \\mathbf{x}\'\\rVert_2$, the $p = 2$ case of $\\left(\\sum_j |x^{(j)} - x\'^{(j)}|^{p}\\right)^{1/p}$. It is also the $\\mathbf{A} = \\mathbf{I}$ case of the learned metric $d_{\\mathbf{A}}$. Expanding the square gives $\\lVert\\mathbf{x}\\rVert^2 - 2\\,\\mathbf{x}\\mathbf{x}\' + \\lVert\\mathbf{x}\'\\rVert^2$ — it touches the data only through [[dot-product|dot products]], which is exactly what lets a [[kernel-function|kernel]] replace it.',
    teachesAt: 'ch10-metric-learning',
    see: ['distance-metric', 'metric-learning', 'cosine-similarity'],
  },
  {
    id: 'distance-metric',
    term: 'distance metric',
    simple:
      'A rule for how far apart two things are. To deserve the name it has to behave sensibly: never negative, the same in both directions, and never rewarding a detour through some third point.',
    technical:
      'Three axioms — nonnegativity (zero only for identical points), symmetry, and the [[triangle-inequality]]. The axioms are not pedantry. Nearest-neighbour indexes, ball trees and a good deal of clustering theory use the triangle inequality to prove that an entire branch of the search cannot contain the answer and skip it without computing anything; hand them a similarity that violates it and they return wrong neighbours rather than slow ones. [[cosine-similarity|Cosine distance]] is the everyday example of something useful that is not a metric. Since the choice changes the output of every neighbour-based algorithm you own, [[metric-learning|learning it]] is a reasonable thing to want.',
    math:
      '$d:\\mathcal{X}\\times\\mathcal{X}\\to\\mathbb{R}$ is a metric when $d(\\mathbf{x},\\mathbf{x}\')\\ge 0$ with equality only for $\\mathbf{x} = \\mathbf{x}\'$, $d(\\mathbf{x},\\mathbf{x}\') = d(\\mathbf{x}\',\\mathbf{x})$, and $d(\\mathbf{x},\\mathbf{x}\')\\le d(\\mathbf{x},\\mathbf{z}) + d(\\mathbf{z},\\mathbf{x}\')$. Dropping the "only for" clause leaves a pseudometric — which is what $d_{\\mathbf{A}}$ becomes when $\\mathbf{A}$ is singular, since then a whole subspace collapses to distance zero and distinct points become indistinguishable.',
    teachesAt: 'ch10-metric-learning',
    see: ['euclidean-distance', 'triangle-inequality', 'metric-learning'],
  },
  {
    id: 'metric-learning',
    term: 'metric learning',
    simple:
      'Rather than assuming you already know what similar means, show the algorithm pairs of things you consider alike and pairs you consider different, and let it work out the rule that agrees with you.',
    technical:
      'Parametrize the distance, then fit the parameters. The classic form slips a matrix $\\mathbf{A}$ into the middle of the Euclidean formula: a diagonal $\\mathbf{A}$ learns per-feature importance, a full one also learns which *combinations* of features matter. Supervision is two hand-built sets of pairs, similar and dissimilar, and the objective pulls the first together while pushing the second apart — the second half is essential, since without it the trivial $\\mathbf{A} = \\mathbf{0}$ declares everything identical. The learned metric then drops straight into [[k-nearest-neighbors|kNN]], [[k-means]] or anything else that takes a distance, which is what makes the effort pay more than once. [[siamese-network|Siamese networks]] with [[triplet-loss]] are the same idea with a network standing in for the matrix.',
    math:
      '$d_{\\mathbf{A}}(\\mathbf{x},\\mathbf{x}\') = \\sqrt{(\\mathbf{x}-\\mathbf{x}\')^{\\top}\\mathbf{A}(\\mathbf{x}-\\mathbf{x}\')}$, minimized over the similar set subject to $\\sum_{\\mathcal{D}} d_{\\mathbf{A}} \\ge c$ and $\\mathbf{A}\\succeq 0$. Because $\\mathbf{A}$ is [[positive-semidefinite|PSD]] it factors as $\\mathbf{A} = \\mathbf{L}^{\\top}\\mathbf{L}$, so $d_{\\mathbf{A}}(\\mathbf{x},\\mathbf{x}\') = \\lVert\\mathbf{L}\\mathbf{x} - \\mathbf{L}\\mathbf{x}\'\\rVert$ — learning a metric *is* learning a linear transformation and then measuring ordinary distance in the transformed space. Gradient steps are followed by a projection back onto the PSD cone.',
    teachesAt: 'ch10-metric-learning',
    see: ['distance-metric', 'positive-semidefinite', 'triplet-loss', 'k-nearest-neighbors'],
  },
  {
    id: 'positive-semidefinite',
    term: 'positive semidefinite',
    simple:
      'The matrix version of not negative. Squeeze any vector between the matrix and itself and the answer never comes out below zero — which is exactly what you need when that answer is about to be called a squared distance.',
    technical:
      'PSD is what keeps $d_{\\mathbf{A}}$ honest: it guarantees the quantity under the square root cannot go negative, and it is what makes the [[triangle-inequality]] hold. Three equivalent characterizations are worth carrying: every eigenvalue is at least zero; a factorization $\\mathbf{A} = \\mathbf{L}^{\\top}\\mathbf{L}$ exists; the matrix is the Gram matrix of some set of vectors. That last one is the same condition Mercer’s theorem places on a valid [[kernel-function|kernel]] — the SVM and metric learning lean on identical algebra. During training a gradient step can push $\\mathbf{A}$ out of the PSD set, so implementations project it back after every step.',
    math:
      '$\\mathbf{A}\\succeq 0$ iff $\\mathbf{z}^{\\top}\\mathbf{A}\\mathbf{z}\\ge 0$ for every $\\mathbf{z}$, equivalently iff every eigenvalue $\\lambda_j\\ge 0$. Projection onto the cone is by eigendecomposition: write $\\mathbf{A} = \\mathbf{U}\\,\\mathrm{diag}(\\boldsymbol{\\lambda})\\,\\mathbf{U}^{\\top}$ and return $\\mathbf{U}\\,\\mathrm{diag}(\\max(\\boldsymbol{\\lambda},0))\\,\\mathbf{U}^{\\top}$. Positive *definite* strengthens $\\ge$ to $>$, which additionally forces $d(\\mathbf{x},\\mathbf{x}\') = 0$ only when the two points coincide.',
    teachesAt: 'ch10-metric-learning',
    see: ['metric-learning', 'triangle-inequality', 'kernel-function'],
  },
  {
    id: 'triangle-inequality',
    term: 'triangle inequality',
    simple:
      'A detour never shortens a journey. Going from A to C by way of B is at least as long as going straight there — and a measure of distance that breaks this rule will eventually surprise you.',
    technical:
      'The axiom that makes a distance behave geometrically, and algorithms exploit it constantly. A ball tree or k-d tree discards an entire branch by proving from the inequality alone that nothing inside it can beat the best candidate found so far, without computing a single distance in that branch. Break the inequality and those indexes silently return the wrong neighbours. It is also why cosine *distance* is handled with care: $1 - \\cos$ violates it, while the angular distance $\\arccos$ does not.',
    math:
      '$d(\\mathbf{x},\\mathbf{x}\')\\le d(\\mathbf{x},\\mathbf{z}) + d(\\mathbf{z},\\mathbf{x}\')$ for all $\\mathbf{x},\\mathbf{x}\',\\mathbf{z}$. For $d_{\\mathbf{A}}$ it follows from $\\mathbf{A} = \\mathbf{L}^{\\top}\\mathbf{L}$: the distance is $\\lVert\\mathbf{L}(\\mathbf{x}-\\mathbf{x}\')\\rVert$, and writing that as $\\lVert\\mathbf{L}(\\mathbf{x}-\\mathbf{z}) + \\mathbf{L}(\\mathbf{z}-\\mathbf{x}\')\\rVert$ reduces the claim to the ordinary norm inequality $\\lVert\\mathbf{a}+\\mathbf{b}\\rVert\\le\\lVert\\mathbf{a}\\rVert + \\lVert\\mathbf{b}\\rVert$.',
    teachesAt: 'ch10-metric-learning',
    see: ['distance-metric', 'positive-semidefinite', 'euclidean-distance'],
  },
  {
    id: 'learning-to-rank',
    term: 'learning to rank',
    simple:
      'Learning to put things in the right order rather than to label them. What matters is not the score a document receives but whether it ends up above or below the others.',
    technical:
      'Supervised learning where one training example is an entire labelled list — a query with its candidate documents, each a feature vector, each with a relevance judgement. Only the ordering is graded, so a model that doubles every score is exactly as good as the original. Three framings differ in how much of the list a single training signal sees: [[pointwise-ranking|pointwise]], [[pairwise-ranking|pairwise]] and [[listwise-ranking|listwise]]. Beyond web search the same machinery drives feeds, ad auctions and the re-ranking stage of a recommender, where a cheap model fetches a thousand candidates and this one decides the order of the ten that get shown.',
    math:
      'Training data is $\\{(\\mathbf{X}_q, \\mathbf{y}_q)\\}$ with $\\mathbf{X}_q = (\\mathbf{x}_{q1},\\dots,\\mathbf{x}_{qm})$ and $y_{qi}$ a relevance grade. The goal is an $f$ whose induced order — sorting by $f(\\mathbf{x}_{qi})$ — maximizes a rank metric such as [[mean-average-precision|MAP]] or NDCG. Those metrics see $f$ only through the sort order, so they are piecewise constant in the parameters and have zero gradient almost everywhere. Every method below is a way around that fact.',
    teachesAt: 'ch10-ranking',
    see: ['pointwise-ranking', 'pairwise-ranking', 'listwise-ranking', 'mean-average-precision'],
  },
  {
    id: 'pointwise-ranking',
    term: 'pointwise ranking',
    simple:
      'Forget that the documents arrived as a list. Score each one on its own, then sort by the score. The simplest thing that could possibly work, and it often does.',
    technical:
      'Flatten every list into independent (document, relevance) examples and run ordinary [[regression]] or [[classification]]. The virtue is that it reuses everything you already own, including the tuning habits. The blindness is structural: a document is judged without reference to its competitors, so the model cannot learn that the third near-duplicate result is worth less than the first, and it cannot learn that relevance is relative to the pool this particular query returned. It also burns capacity fitting exact scores when only the order is marked.',
    math:
      'Minimize $\\sum_q\\sum_i \\ell\\!\\left(f(\\mathbf{x}_{qi}),\\, y_{qi}\\right)$ with $\\ell$ the [[squared-loss]] or a classification loss. The mismatch with the goal is visible in the objective: swapping the top two documents of a perfect ranking may cost a great deal of [[mean-average-precision|MAP]] while barely moving $\\sum\\ell$, and a uniform bias added to every score costs $\\sum\\ell$ a great deal while costing MAP nothing.',
    teachesAt: 'ch10-ranking',
    see: ['learning-to-rank', 'pairwise-ranking', 'regression'],
  },
  {
    id: 'pairwise-ranking',
    term: 'pairwise ranking',
    simple:
      'Teach the model to answer one question well: of these two documents, which should come first? Answer it for every pair, then hand the answers to an ordinary sorting algorithm and let it assemble the list.',
    technical:
      'Ranking becomes binary classification over pairs, which repairs pointwise’s blindness because the label is now inherently relative. It composes nicely too — any comparison-based sort will order documents once you give it the comparator. Two costs. The pair count is quadratic in list length, so sampling is normal practice. And a learned comparator need not be transitive, so the sorted result can depend on which sort algorithm ran; scoring each document once with a function $h$ and comparing the scores sidesteps that entirely, which is what [[lambdamart|LambdaMART]] does.',
    math:
      'Model $\\Pr(i \\succ k) = \\sigma\\!\\left(h(\\mathbf{x}_i) - h(\\mathbf{x}_k)\\right)$ and fit with cross-entropy against the labelled order — RankNet’s formulation. Because only the *difference* of scores enters, $h$ is identified up to an additive constant, and the sort is invariant to it. Sorting with a comparator costs $O(m\\log m)$ comparisons rather than the $O(m^2)$ pairs used in training.',
    teachesAt: 'ch10-ranking',
    see: ['learning-to-rank', 'listwise-ranking', 'lambdamart', 'sigmoid'],
  },
  {
    id: 'listwise-ranking',
    term: 'listwise ranking',
    simple:
      'Score the whole ordering at once and train against that score. If what you are graded on is the arrangement of the entire list, aim at it directly.',
    technical:
      'The framing closest to what is actually measured, and the hardest to optimize. Rank metrics are step functions of the model’s output — nudge a weight and either nothing happens or two documents swap and the metric jumps — so there is no gradient to descend. Two workarounds dominate: optimize a smooth surrogate defined over permutations, as ListNet does with a [[softmax]] over the list, or fabricate a gradient whose magnitude reflects how much the metric would move, which is the lambda inside [[lambdamart|LambdaMART]]. Listwise methods generally rank best and cost most to train.',
    math:
      'The target is $\\sum_q M\\!\\left(\\mathrm{sort}_f(\\mathbf{X}_q),\\, \\mathbf{y}_q\\right)$ for a metric $M$ such as [[mean-average-precision|MAP]] or NDCG. ListNet substitutes the cross-entropy between top-one distributions $P_f(i) = \\frac{\\exp f(\\mathbf{x}_i)}{\\sum_k \\exp f(\\mathbf{x}_k)}$ and the corresponding $P_y$, which is smooth in the parameters and therefore trainable by [[gradient-descent]].',
    teachesAt: 'ch10-ranking',
    see: ['learning-to-rank', 'mean-average-precision', 'lambdamart', 'softmax'],
  },
  {
    id: 'mean-average-precision',
    term: 'mean average precision',
    simple:
      'A single number for how well a search engine orders results. For one query, walk down the list and note the precision each time you hit something relevant, then average those; do it for many queries and average again.',
    technical:
      'MAP rewards putting relevant results near the top, because a hit at position 2 counts far more than the same hit at position 40. It needs binary relevance judgements from human assessors, which is where the real cost sits; when relevance comes in grades rather than yes/no, NDCG is the standard replacement. Being a function of the sort order alone, it is not differentiable in the model’s parameters — which is precisely the obstacle [[listwise-ranking|listwise methods]] exist to route around.',
    math:
      'For one query with relevant set $R$, $\\mathrm{AP} = \\frac{1}{|R|}\\sum_{n=1}^{m}P(n)\\,\\mathrm{rel}(n)$, where $P(n)$ is [[precision]] over the top $n$ results and $\\mathrm{rel}(n)\\in\\{0,1\\}$ marks the document at rank $n$. Then $\\mathrm{MAP} = \\frac{1}{|Q|}\\sum_q \\mathrm{AP}_q$. Promoting a relevant document from rank 10 to rank 2 changes AP substantially; moving it from 40 to 32 barely registers, which is the position weighting doing its job.',
    statquest: 'precision and recall',
    teachesAt: 'ch10-ranking',
    see: ['precision', 'learning-to-rank', 'listwise-ranking'],
  },
  {
    id: 'lambdamart',
    term: 'LambdaMART',
    simple:
      'The workhorse of real ranking systems. It grows a forest of small trees that score documents, and trains them with one shortcut: whenever two documents are in the wrong order, the size of the correction is set by how much the final ranking score would improve if they swapped.',
    technical:
      'MART is gradient-boosted regression trees; the lambda is the trick. A pairwise cross-entropy on $\\sigma\\!\\left(h(\\mathbf{x}_i) - h(\\mathbf{x}_k)\\right)$ supplies a direction for every misordered pair, and that direction is then multiplied by how much [[mean-average-precision|MAP]] or NDCG would change if the two swapped ranks. The scaled quantities are used *as if* they were gradients — no loss function is ever written down whose gradient they are — and the resulting model empirically optimizes the metric itself. It won the Yahoo Learning to Rank Challenge and remains a strong baseline; [[xgboost|XGBoost]] and LightGBM both ship it.',
    math:
      'For a pair with $y_i > y_k$, $\\lambda_{ik} = \\dfrac{-1}{1 + \\exp\\!\\left(h(\\mathbf{x}_i) - h(\\mathbf{x}_k)\\right)}\\cdot\\left|\\Delta Z_{ik}\\right|$, where $\\Delta Z_{ik}$ is the metric change caused by swapping their ranks. Each document’s pseudo-response is $\\lambda_i = \\sum_{k}\\lambda_{ik} - \\sum_{k}\\lambda_{ki}$, and the next tree is fitted to those $\\lambda_i$ exactly as [[gradient-boosting]] fits trees to [[residual|residuals]] — with the metric weighting deciding where the ensemble spends its capacity.',
    teachesAt: 'ch10-ranking',
    see: ['gradient-boosting', 'pairwise-ranking', 'mean-average-precision', 'xgboost'],
  },
  {
    id: 'content-based-filtering',
    term: 'content-based filtering',
    simple:
      'Recommend more of what someone already likes, judged by what the items themselves are about. Read three articles on volcanoes and you will be offered a fourth.',
    technical:
      'Build a profile from the features of the items a user consumed — genre, keywords, an [[embedding]] of the text — and score new items by similarity to that profile. It handles a brand-new item with no ratings at all, which [[collaborative-filtering]] cannot, and it can explain its suggestions in words. Its weakness is that it can only recommend along dimensions its features happen to encode, so it converges on more of the same and walks the user into a [[filter-bubble]]. Production systems hybridize: content features carry cold-start items, collaborative signal handles everything with a history.',
    math:
      'Represent item $j$ by $\\boldsymbol{\\phi}_j$ and user $u$ by $\\mathbf{p}_u = \\frac{1}{|I_u|}\\sum_{j\\in I_u} r_{uj}\\,\\boldsymbol{\\phi}_j$ over the items they rated, then score with [[cosine-similarity]] $\\hat{r}_{uj} = \\cos(\\mathbf{p}_u, \\boldsymbol{\\phi}_j)$. Equivalently, fit one small supervised model per user whose training set is that user’s own history — which is also why the approach collapses for a user with three ratings.',
    teachesAt: 'ch10-recommend',
    see: ['collaborative-filtering', 'filter-bubble', 'cosine-similarity'],
  },
  {
    id: 'collaborative-filtering',
    term: 'collaborative filtering',
    simple:
      'Recommend by finding people whose taste has matched yours so far, and offering what they liked next. Nobody has to know what the film is about — only who else enjoyed it.',
    technical:
      'Works entirely from the pattern of interactions in the user-by-item matrix. The classic implementations are neighbourhood-based (find similar users or similar items, average their ratings) and latent-factor (factorize the matrix into user and item vectors whose [[dot-product]] reconstructs a rating). It routinely beats content-based methods because it picks up qualities no feature schema encodes — mood, craft, the reason people who like this like that. Its two structural problems are sparsity, since each user touches a sliver of the catalogue, and cold start: an item with no ratings is invisible until somebody takes a chance on it.',
    math:
      'The matrix $\\mathbf{R}\\in\\mathbb{R}^{U\\times I}$ is observed only on a set $\\Omega$ of cells. Latent-factor CF fits $\\mathbf{R}\\approx\\mathbf{P}\\mathbf{Q}^{\\top}$ with $\\mathbf{P}\\in\\mathbb{R}^{U\\times k}$ and $\\mathbf{Q}\\in\\mathbb{R}^{I\\times k}$, minimizing $\\sum_{(u,j)\\in\\Omega}\\left(r_{uj} - \\mathbf{p}_u\\mathbf{q}_j\\right)^2 + \\lambda\\left(\\lVert\\mathbf{P}\\rVert^2 + \\lVert\\mathbf{Q}\\rVert^2\\right)$. The [[l2-regularization|penalty]] is not optional: with 99% of cells missing, an unpenalized fit reproduces the observed entries and predicts noise everywhere else.',
    teachesAt: 'ch10-recommend',
    see: ['content-based-filtering', 'factorization-machines', 'l2-regularization'],
  },
  {
    id: 'filter-bubble',
    term: 'filter bubble',
    simple:
      'The narrowing that happens when a system keeps showing you more of what you already agreed with. Each choice teaches it to offer less variety, and after a while the world looks smaller than it is.',
    technical:
      'A feedback loop rather than a single bad prediction: the model trains on what users clicked, users can only click what the model showed, and the training distribution collapses toward whatever the model already favoured. It is worst for pure [[content-based-filtering]], which has no mechanism for surprise at all. The standard mitigations are deliberate exploration (occasionally serve something the model is unsure about), a diversity term inside the ranking objective, and reporting catalogue coverage and novelty alongside accuracy — because a recommender tuned purely for click-through will happily maximize it while making the product worse.',
    math:
      'The loop is $\\pi_{t+1} = \\mathrm{fit}(\\mathcal{D}_t)$ with $\\mathcal{D}_t$ drawn from whatever $\\pi_t$ chose to display, so the data is not i.i.d. and the usual generalization argument does not apply. A diversity-aware objective picks a slate $S$ maximizing $\\sum_{j\\in S}\\hat{r}_{uj} - \\mu\\sum_{j\\ne j\'\\in S}\\mathrm{sim}(j,j\')$ — relevance minus redundancy, with $\\mu$ pricing one against the other.',
    teachesAt: 'ch10-recommend',
    see: ['content-based-filtering', 'collaborative-filtering'],
  },
  {
    id: 'factorization-machines',
    term: 'factorization machines',
    simple:
      'A model built for data that is almost entirely zeros. Instead of learning one weight for every pair of features — most of which never occur together anyway — it gives each feature a short vector, and the strength of a pair is how well their two vectors line up.',
    technical:
      'Designed for the one-hot-heavy, near-empty design matrices recommendation produces. A linear model over such data cannot express "this user likes this director"; one weight per pair could, but there are $O(D^2)$ of them and, worse, a pair that never co-occurs in training receives no gradient and finishes at whatever it was initialized to. Factorizing the weight matrix fixes both problems at once: $w_{ij}$ becomes $\\mathbf{v}_i\\mathbf{v}_j$, so evidence about a user paired with *any* film updates that user’s vector and therefore every pair involving them. It generalizes matrix factorization — feed it only a one-hot user and a one-hot item and you get exactly that — while still accepting timestamps, context and side features in the same row.',
    math:
      '$f(\\mathbf{x}) = b + \\sum_{i=1}^{D}w_i x_i + \\sum_{i=1}^{D}\\sum_{j=i+1}^{D}(\\mathbf{v}_i\\mathbf{v}_j)\\,x_i x_j$ with $\\mathbf{v}_i\\in\\mathbb{R}^{k}$ and $k\\ll D$, giving $Dk$ interaction parameters instead of $D(D-1)/2$. The double sum looks quadratic but is not: it rewrites as $\\frac{1}{2}\\sum_{l=1}^{k}\\left[\\left(\\sum_i v_{il}x_i\\right)^2 - \\sum_i v_{il}^2 x_i^2\\right]$, which costs $O(k\\bar{m})$ for $\\bar{m}$ nonzero features per row — linear time in the data that is actually there.',
    teachesAt: 'ch10-recommend',
    see: ['collaborative-filtering', 'word-embeddings', 'sparse-model'],
  },
  {
    id: 'denoising-autoencoder',
    term: 'denoising autoencoder',
    simple:
      'Train a network to repair damage. Show it a spoiled copy of something and ask for the clean original back; to succeed it has to learn what the clean version should look like rather than copying its input across.',
    technical:
      'An [[autoencoder]] whose input is deliberately corrupted — pixels blanked, entries zeroed, noise added — while the target stays intact. That kills the trivial identity solution, so the [[bottleneck-layer|code]] has to capture structure instead of memorizing. As a recommender the corruption story becomes the model: treat the items a user would love but has not seen as entries some process deleted, train by zeroing known ratings and demanding the full vector back, then at prediction time feed the real ratings and read off the highest restored scores among the unseen items.',
    math:
      'Sample a corruption $\\tilde{\\mathbf{x}}\\sim q(\\tilde{\\mathbf{x}}\\mid\\mathbf{x})$ — for masking noise, zero a random fraction $\\nu$ of the coordinates — and minimize $\\mathbb{E}_{q}\\lVert\\mathbf{x} - h(g(\\tilde{\\mathbf{x}}))\\rVert^2$, in the recommender case summing the loss only over observed entries. The gradient of that objective points along the data manifold: the network learns a map that pushes corrupted points back toward where the data actually lies.',
    teachesAt: 'ch10-recommend',
    see: ['autoencoder', 'bottleneck-layer', 'collaborative-filtering'],
  },
  {
    id: 'word-embeddings',
    term: 'word embeddings',
    simple:
      'Numbers standing in for words, arranged so that words used in similar ways end up near each other. Once meaning is a position, similarity becomes distance and you can do arithmetic with it.',
    technical:
      'Dense vectors, typically 100 to 300 numbers per word, learned so that geometry mirrors usage. They rest on the distributional hypothesis: words appearing in the same contexts mean similar things. Against the [[one-hot-vector|one-hot]] vectors they replace they are small, dense, and — the point — not equidistant, so a model trained on *dog* has already learned something about *puppy*. The limitation is one vector per word *type*: a static embedding cannot separate the two senses of *bank*, which is what contextual models such as BERT later fixed by producing a vector per occurrence instead.',
    math:
      'An embedding is a matrix $\\mathbf{E}\\in\\mathbb{R}^{V\\times d}$ with $V$ the vocabulary size and $d\\approx 300$. Looking up word $w$ is $\\mathbf{e}_w = \\mathbf{E}^{\\top}\\mathbf{o}_w$ for the one-hot $\\mathbf{o}_w$ — a matrix product that is really a row selection. Similarity is measured by [[cosine-similarity]] rather than [[euclidean-distance]], since vector length mostly tracks how often the word appears rather than what it means.',
    statquest: 'word embedding',
    teachesAt: 'ch10-embeddings',
    see: ['word2vec', 'embedding-layer', 'one-hot-vector', 'cosine-similarity'],
  },
  {
    id: 'word2vec',
    term: 'word2vec',
    simple:
      'A way of learning word vectors from nothing but raw text. Slide a window along billions of sentences and each time make the model guess which words keep company with which. Words that keep the same company drift together.',
    technical:
      'Two shallow architectures from Mikolov’s 2013 papers. [[skip-gram]] predicts the surrounding words from the centre word; CBOW predicts the centre from its surroundings. Skip-gram is slower but stronger on rare words, because each occurrence generates several training pairs; CBOW is faster and smooths over frequent ones. Neither is deep — one projection and one output layer — which is exactly why it could be trained on a hundred billion words in 2013 on ordinary hardware. Subsampling of frequent words and negative sampling are what make it practical, and the vectors are a by-product: the prediction head is discarded when training ends.',
    math:
      'Skip-gram maximizes $\\frac{1}{T}\\sum_{t=1}^{T}\\sum_{-c\\le j\\le c,\\,j\\ne 0}\\log p(w_{t+j}\\mid w_t)$, where each word carries an input vector $\\mathbf{v}_w$ and an output vector $\\mathbf{u}_w$ and $p(w_O\\mid w_I) = \\frac{\\exp(\\mathbf{u}_{w_O}^{\\top}\\mathbf{v}_{w_I})}{\\sum_{w=1}^{V}\\exp(\\mathbf{u}_{w}^{\\top}\\mathbf{v}_{w_I})}$. That denominator runs over the whole vocabulary, so negative sampling replaces it with $\\log\\sigma(\\mathbf{u}_{w_O}^{\\top}\\mathbf{v}_{w_I}) + \\sum_{l=1}^{K}\\mathbb{E}_{w_l\\sim P_n}\\log\\sigma(-\\mathbf{u}_{w_l}^{\\top}\\mathbf{v}_{w_I})$ — one true pair against $K$ random ones.',
    statquest: 'word2vec',
    teachesAt: 'ch10-embeddings',
    see: ['skip-gram', 'word-embeddings', 'self-supervised-learning', 'embedding-layer'],
  },
  {
    id: 'skip-gram',
    term: 'skip-gram',
    simple:
      'The training game behind word vectors: reveal one word and ask the model to guess the words that were around it. Get that right often enough and the model has had to learn what the word means by learning where it shows up.',
    technical:
      'A window of $2c+1$ tokens supplies $2c$ training pairs, all sharing the centre word as input. Nothing is annotated — the corpus manufactures its own labels, which is what makes this [[self-supervised-learning|self-supervised]] and why hundreds of millions of examples cost nothing. The window size is a real dial rather than a detail: a narrow window of two produces vectors grouping words by syntactic role, a wide one of ten groups them by topic, so *Paris* sits next to *Berlin* under one setting and next to *croissant* under the other. The name comes from allowing gaps — pairs are drawn from anywhere inside the window, not only from adjacent positions.',
    math:
      'For a corpus $w_1,\\dots,w_T$ and window $c$, the training set is $\\{(w_t, w_{t+j}) : 1\\le t\\le T,\\ -c\\le j\\le c,\\ j\\ne 0\\}$ and the objective is $\\sum_t\\sum_j \\log p(w_{t+j}\\mid w_t)$. In practice $c$ is resampled uniformly from $1$ to $c_{\\max}$ at each token, which weights nearby words more heavily without adding a single term to the loss.',
    statquest: 'word2vec skip gram',
    teachesAt: 'ch10-embeddings',
    see: ['word2vec', 'self-supervised-learning', 'word-embeddings'],
  },
  {
    id: 'embedding-layer',
    term: 'embedding layer',
    simple:
      'The layer that turns an item’s identity into a short list of numbers the rest of the network can use. It is a lookup table whose contents are learned rather than written by hand.',
    technical:
      'A weight matrix with one row per vocabulary item, indexed rather than multiplied — mathematically it is a dense layer applied to a [[one-hot-vector|one-hot]], but no implementation does the multiplication, because the product is a row selection. The rows start random and are updated by [[backpropagation]] like any other weights, so the representation is shaped by whatever task sits on top: train it for sentiment and *terrible* moves away from *wonderful* rather than toward it. It is not restricted to words — user ids, product ids and any categorical column with high [[cardinality]] are handled this way, and it is the standard alternative to [[one-hot-encoding]] once the category count runs into the thousands.',
    math:
      '$\\mathbf{E}\\in\\mathbb{R}^{V\\times d}$, and the layer computes $\\mathbf{e} = \\mathbf{E}^{\\top}\\mathbf{o}$ for a one-hot $\\mathbf{o}$, i.e. $\\mathbf{e}$ is row $w$ of $\\mathbf{E}$. The gradient is correspondingly sparse — only the rows for items appearing in the batch receive an update — which is why tables with millions of rows remain trainable at all.',
    statquest: 'word embedding',
    teachesAt: 'ch10-embeddings',
    see: ['one-hot-vector', 'word-embeddings', 'one-hot-encoding', 'bottleneck-layer'],
  },
  {
    id: 'self-supervised-learning',
    term: 'self-supervised learning',
    simple:
      'Learning from data that came with no labels, by hiding part of it and asking the model to work out what is missing. The answer was already in the data — you covered it up yourself.',
    technical:
      'Supervision manufactured from the input by a *pretext task*: predict the neighbouring words, fill in a masked token, restore a corrupted image, judge whether two crops came from the same photo. Since nobody annotates anything, the training set is as large as the internet, and the representation learned along the way transfers to real tasks with a fraction of the labelled data — this is the engine behind word2vec, BERT and every modern language model. It sits between [[supervised-learning|supervised]] and [[unsupervised-learning|unsupervised]] learning: the machinery is supervised, the data is not. Designing the pretext task is the whole art, since one too easy teaches nothing and one impossible teaches noise.',
    math:
      'Given unlabelled $\\{\\mathbf{x}_i\\}$, choose a transformation splitting each example into an input and a target, $(\\tilde{\\mathbf{x}}_i, t_i) = T(\\mathbf{x}_i)$, then minimize $\\sum_i \\ell\\!\\left(f(\\tilde{\\mathbf{x}}_i),\\, t_i\\right)$ by ordinary supervised means. For [[skip-gram]], $T$ takes a window and returns (centre, context); for a masked language model, $T$ blanks 15% of the tokens and returns them as the target.',
    teachesAt: 'ch10-embeddings',
    see: ['word2vec', 'skip-gram', 'unsupervised-learning', 'autoencoder'],
  },
  {
    id: 'one-hot-vector',
    term: 'one-hot vector',
    simple:
      'One slot per possible thing, all zeros except a single one in the slot that names it. It says which item this is and nothing whatsoever about what the item is like.',
    technical:
      'The default encoding for a categorical value, and for words a bad one twice over. It is enormous — one dimension per vocabulary entry — and it is geometrically flat: every pair of distinct one-hots sits at the same distance with a [[dot-product]] of zero, so *cat* is exactly as close to *kitten* as to *bulldozer*. Nothing learned about one word can transfer to another, and any model downstream must fit a separate parameter per entry, so rare words get almost no signal. [[embedding-layer|Embedding layers]] exist precisely to map these into a small dense space where distance carries meaning.',
    math:
      '$\\mathbf{o}_w\\in\\{0,1\\}^{V}$ with $o^{(j)} = \\mathbb{1}[j = w]$. For any $w\\ne w\'$, $\\mathbf{o}_w\\mathbf{o}_{w\'} = 0$ and $\\lVert\\mathbf{o}_w - \\mathbf{o}_{w\'}\\rVert = \\sqrt{2}$ — a constant, so [[euclidean-distance]] between one-hots carries no information at all. Left-multiplying a matrix by one selects a single column, which is what turns the encoding into a lookup.',
    statquest: 'word embedding',
    teachesAt: 'ch10-embeddings',
    see: ['embedding-layer', 'one-hot-encoding', 'word-embeddings'],
  },
];

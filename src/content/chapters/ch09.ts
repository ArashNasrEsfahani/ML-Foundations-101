import type { Chapter } from '../schema';

/** Chapter 9 — Unsupervised Learning (book pp. 106–121), paraphrased in original words. */
export const ch09: Chapter = {
  id: 'ch09',
  number: 9,
  title: 'Unsupervised Learning',
  subtitle: 'Clustering, dimensionality reduction, outliers',
  pdfPages: [106, 121],
  badgeId: 'ch09',
  sections: [
    {
      id: 'ch09-density',
      title: 'Guessing the Shape of Data',
      minutes: 5,
      blocks: [
        {
          type: 'p',
          md:
            'Everything so far assumed labels. Now they are gone. **[[unsupervised-learning|Unsupervised learning]]** works with bare [[feature-vector|feature vectors]] $\\{\\mathbf{x}_i\\}_{i=1}^N$ — and without labels there is no solid reference point to say how good your model is. Every score you have leaned on since [the metrics section](sec:ch05-metrics) compared a prediction against a truth; here there is no truth to compare against. That is why this chapter sticks to methods whose results can still be judged against the *data itself* rather than against human opinion.',
        },
        {
          type: 'p',
          md:
            'The first such task is **[[density-estimation]]**: reconstruct the [[probability-density-function|probability density function]] (pdf) of the unknown distribution your dataset was drawn from. A good density model tells you which inputs are *typical* and which are not — the backbone of novelty and intrusion detection. One option is **parametric**: assume the data is, say, a multivariate normal and fit its parameters. But that assumption is a gamble — if the real distribution looks nothing like a Gaussian, your model is doomed from the start. The **nonparametric** alternative lets the data speak: place a little smooth bump (a **kernel**) on every training example and add the bumps up. That is **[[kernel-density-estimation|kernel density estimation]]**, and the formula for it is shorter than the description:',
        },
        {
          type: 'formula',
          tex: '\\hat{f}_b(x) = \\frac{1}{Nb} \\sum_{i=1}^{N} k\\!\\left(\\frac{x - x_i}{b}\\right)',
          parts: [
            { tex: '\\hat{f}_b(x)', label: 'how dense the data is at x' },
            { tex: '=' },
            { tex: '\\frac{1}{Nb} \\sum_{i=1}^{N}', label: 'one bump per example, averaged' },
            {
              tex: 'k\\!\\left(\\frac{x - x_i}{b}\\right)',
              label: 'a bump b wide, fading with distance',
            },
          ],
          terms: [
            { tex: '\\hat{f}_b', explain: 'the estimated pdf — a sum of N small bumps, one per example' },
            { tex: 'k', explain: 'the kernel: a smooth bump shape, typically the standard Gaussian' },
            { tex: 'x_i', explain: 'a training example; each one contributes a bump centered on itself' },
            {
              tex: 'b',
              explain: 'the [[bandwidth]]: how wide each bump is — the single knob controlling bias vs. variance',
            },
          ],
        },
        {
          type: 'p',
          md:
            'Everything hinges on the bandwidth $b$. Make it tiny and the estimate turns into nervous spikes hugging each training point — **[[overfitting]]**. Make it huge and the bumps smear into one featureless mound that hides real structure — **[[underfitting]]**. Somewhere in between sits a curve that tracks the true pdf closely. This is [the same trade-off you met in Chapter 5](sec:ch05-overfitting) wearing different clothes: $b$ is the capacity dial. A small $b$ is a flexible model chasing every wobble of the sample; a large $b$ is a rigid one that has stopped listening.',
        },
        {
          type: 'p',
          md:
            'Watch it happen on three points sitting at $1$, $2$ and $8$. With $b = 0.3$ the estimate is three separate needles, and the flat ground between them reads as impossible — a future observation at $1.5$ would be assigned a density near zero, which three points give you no warrant to claim. With $b = 3$ the bumps merge into one broad hill centered near $3.7$, a value no observation is anywhere close to. Around $b = 0.8$ you get what the data actually said: a lump over $1$–$2$ and a smaller one out at $8$. The estimator never changed. Only the width did.',
        },
        {
          type: 'p',
          md:
            'If the machinery looks familiar, it should. This is [kernel regression](sec:ch07-beyond-two-classes) with the targets taken away. There, each neighbor contributed its own $y_i$ weighted by how near it was, and the weights were normalized to sum to one so the result was an average. Here there is no $y$ to average, so the weights themselves *are* the answer — how much neighbor is stacked over this spot. One smoothing idea, two jobs, and the same bandwidth trap in both.',
        },
        {
          type: 'hint',
          md:
            'How to pick $b$ without seeing the true pdf? Minimize the **[[mean-integrated-squared-error|mean integrated squared error]]** (MISE) — the continuous cousin of MSE — whose data-only estimate uses **[[leave-one-out-cross-validation]]**: score each candidate $b$ from a grid, keep the minimizer. Why leave-one-out rather than plain training likelihood? Because a bump centered on $x_i$ is guaranteed to score $x_i$ highly, so training likelihood is maximized by $b \\to 0$ — infinitely tall spikes and nothing in between. Removing the point first breaks that self-congratulation, and removing one bump from a sum of bumps is subtraction rather than retraining, so the whole sweep is cheap. For $D$-dimensional data, replace $x - x_i$ with the Euclidean distance $\\lVert\\mathbf{x} - \\mathbf{x}_i\\rVert$.',
        },
        {
          type: 'quiz',
          id: 'ch09-q-density',
          questions: [
            {
              kind: 'mcq',
              id: 'ch09-q-density-1',
              prompt: 'What does kernel density estimation output?',
              choices: [
                'An estimate of the pdf the data was drawn from',
                'A cluster id for each example, by local density',
                'A label for each example, from its nearest bump',
                'A lower-dimensional version of each feature vector',
              ],
              answer: 0,
              explain:
                'KDE models the shape of the data-generating distribution — one Gaussian bump per example, averaged.',
            },
            {
              kind: 'mcq',
              id: 'ch09-q-density-2',
              prompt: 'A very *small* bandwidth $b$ produces a density estimate that…',
              choices: [
                'spikes around individual points — overfitting',
                'flattens into one broad, smooth mound — underfitting',
                'tracks the true pdf more closely the smaller b gets',
                'approaches a Gaussian, since the kernel is Gaussian',
              ],
              answer: 0,
              explain:
                'Narrow bumps only cover their own training point, so the curve wiggles with the sample instead of the distribution. Shrinking $b$ therefore trades bias for variance — it does not march toward the truth — and the kernel’s own shape washes out once the bumps are summed.',
            },
            {
              kind: 'tf',
              id: 'ch09-q-density-3',
              prompt:
                'Assuming the data is multivariate normal makes the density model nonparametric.',
              answer: false,
              explain:
                'Fixing a distribution family and fitting its parameters is the *parametric* route; KDE is the nonparametric one.',
            },
            {
              kind: 'mcq',
              id: 'ch09-q-density-4',
              prompt: 'The bandwidth is chosen in practice by…',
              choices: [
                'grid search minimizing a cross-validated estimate of MISE',
                'maximizing the likelihood of the training set itself',
                'setting b to the standard deviation of the whole sample',
                'increasing b until the estimate has exactly one peak',
              ],
              answer: 0,
              explain:
                'Leave-one-out cross-validation gives an unbiased, data-only stand-in for the term of MISE that depends on $b$, and the minimizer over a grid of candidates wins. Plain training-set likelihood is useless here — it is maximized by $b \\to 0$, one infinite spike per example.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch09-kmeans',
      title: 'K-Means: Assign, Average, Repeat',
      minutes: 7,
      blocks: [
        {
          type: 'p',
          md:
            '**[[clustering|Clustering]]** assigns a group id to every example using only the unlabeled data. The most famous recipe, **[[k-means]]**, is a two-step dance. First choose $k$, the number of clusters, and drop $k$ points called **[[centroid|centroids]]** into feature space. Then loop: **assign** every example to its closest centroid (using, say, Euclidean distance), and **update** every centroid to the average of the examples just assigned to it. Repeat until the assignments stop changing. The final model is exactly that list of centroid ids, one per example.',
        },
        {
          type: 'p',
          md:
            'A handy score for a k-means state is the **[[inertia]]** — the total squared distance from each point to its own centroid. Every assign step and every update step can only lower it (or leave it alone), which is why the loop must settle down:',
        },
        {
          type: 'formula',
          tex: 'J = \\sum_{i=1}^{N} \\lVert \\mathbf{x}_i - \\mathbf{c}_{a(i)} \\rVert^2',
          parts: [
            { tex: 'J', label: 'how tightly the clusters hold together' },
            { tex: '=' },
            { tex: '\\sum_{i=1}^{N}', label: 'over every point' },
            {
              tex: '\\lVert \\mathbf{x}_i - \\mathbf{c}_{a(i)} \\rVert^2',
              label: 'its squared distance to its own centroid',
            },
          ],
          terms: [
            { tex: 'J', explain: 'inertia: how tightly the clusters hug their centroids — lower is tighter' },
            { tex: '\\mathbf{c}_{a(i)}', explain: 'the centroid currently assigned to example i' },
            { tex: 'a(i)', explain: 'the assignment: the id of the nearest centroid to example i' },
            { tex: '\\lVert\\cdot\\rVert^2', explain: 'squared Euclidean distance from a point to its centroid' },
          ],
        },
        {
          type: 'p',
          md:
            'Two warnings. The starting positions of the centroids matter: two runs with different random starts can settle into two different clusterings, so k-means finds *a* local optimum, not *the* best one. And $k$ itself is a **[[hyperparameter]]** — the algorithm never questions your choice; ask for 5 clusters in 3 blobs and it will dutifully carve up something.',
        },
        {
          type: 'p',
          md:
            'There is a third warning the two-step dance hides, and it is about *shape*. Because a point joins whichever centroid is nearest, the territory of each cluster is bounded by the perpendicular bisectors between centroids — straight lines. K-means can therefore only ever draw convex, roughly round cells. Two long parallel bands, or one ring around another, are not shapes it can express at any value of $k$, and it will not fail loudly; it will return a confident, wrong answer. That limitation is the entire motivation for the next section.',
        },
        {
          type: 'hint',
          md:
            'The standard cure for the initialization lottery is **k-means++**: put the first centroid on a random example, then draw each next one with probability proportional to its squared distance from the nearest centroid already placed. Far-flung regions are therefore likely to get a seed of their own, which is precisely what uniform random placement keeps failing at. Two other habits pay for themselves — [standardize the features](sec:ch05-feature-engineering) first, since centroids live in the data’s own units and a column measured in thousands will decide every assignment, and run the whole thing a dozen times and keep the clustering with the lowest [[inertia]].',
        },
        {
          type: 'widget',
          id: 'KmeansStepper',
          challenge: {
            id: 'ch09-challenge-kmeans',
            label: 'converge on 3 clusters with the right k',
            xp: 15,
          },
        },
        {
          type: 'quiz',
          id: 'ch09-q-kmeans',
          questions: [
            {
              kind: 'order',
              id: 'ch09-q-kmeans-1',
              prompt: 'Put one full round of k-means in order:',
              items: [
                'Choose k and place k centroids',
                'Assign each example to its nearest centroid',
                'Move each centroid to the mean of its assigned examples',
                'Repeat until assignments stop changing',
              ],
              explain:
                'Assign, then average, then repeat — Lloyd’s loop in four lines.',
            },
            {
              kind: 'mcq',
              id: 'ch09-q-kmeans-2',
              prompt: 'Why can two k-means runs on the same data give different clusterings?',
              choices: [
                'Random initial centroids lead to different local optima',
                'The assign step visits the examples in a different order',
                'k-means reshuffles the points, so the data itself differs',
                'Euclidean distance breaks ties differently each time',
              ],
              answer: 0,
              explain:
                'K-means only ever improves its current state, so where it starts decides which valley of the inertia landscape it lands in. The data is untouched between runs, and the assign step compares every point against fixed centroids — visiting order changes nothing.',
            },
            {
              kind: 'tf',
              id: 'ch09-q-kmeans-3',
              prompt: 'Inertia never increases from one k-means iteration to the next.',
              answer: true,
              explain:
                'Reassigning to the closest centroid can only shrink each term; averaging minimizes the within-cluster squared distance. Both steps are downhill.',
            },
            {
              kind: 'mcq',
              id: 'ch09-q-kmeans-4',
              prompt: 'In k-means, the number of clusters $k$ is…',
              choices: [
                'a hyperparameter the analyst must choose before training',
                'learned from the data as the loop drives inertia down',
                'fixed by the number of features in each input vector',
                'irrelevant, since extra centroids collapse onto each other',
              ],
              answer: 0,
              explain:
                'The algorithm takes k as given and never questions it — ask for five clusters in three blobs and it will carve up something. Techniques for choosing k exist ([[prediction-strength]], the [[gap-statistic|gap statistic]], elbow, silhouette) but none is provably optimal.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch09-dbscan',
      title: 'Clusters of Any Shape: DBSCAN',
      minutes: 7,
      blocks: [
        {
          type: 'p',
          md:
            'K-means is *centroid-based*: its clusters are blobs around centers. **[[dbscan|DBSCAN]]** is *density-based*. Instead of guessing a cluster count you set two knobs — a radius $\\epsilon$ and a threshold $n$ — and the count falls out of the data on its own. Draw a circle of radius $\\epsilon$ around an example and count who is inside: that circle is its **[[epsilon-neighborhood|ε-neighborhood]]**, and if at least $n$ examples sit in it, the point is standing in a crowd. Such a point is called a **[[core-point|core point]]**, and only core points are allowed to build anything.',
        },
        {
          type: 'p',
          md:
            'Now the growing, which is the part that makes the shapes. Take any core point nobody has visited and start a cluster with it, tipping its whole ε-neighborhood into a queue. Pop a point off the queue and add it to the cluster. If that point is *itself* core, tip its neighborhood into the queue as well — the stain spreads. If it is not core, it joins and the chain stops there: it is a **[[border-point|border point]]**, a passenger on the edge. When the queue empties, the cluster is finished; go and find another unvisited core point, and that starts cluster two. Points no chain ever reached belong to nothing at all and are labeled **noise** — DBSCAN’s built-in [[outlier-detection|outlier flag]], and one of the few clustering algorithms honest enough to say "this one belongs nowhere" instead of forcing it into the nearest blob.',
        },
        {
          type: 'p',
          md:
            'Notice what that procedure never does: it never measures anything from a center. A cluster is defined only by the chain of overlapping crowded circles that traced it out, so it can bend, fork and curl. That is why DBSCAN handles **arbitrary shapes** — rings, arcs, snakes — that no centroid-based method can express. Notice also where it will break. Two genuinely separate clusters joined by a thin bridge of points that are dense enough to be core will be merged into one, and a cluster whose points are just below the $n$ threshold vanishes into noise entirely. Both failures come from the same place: $\\epsilon$ and $n$ jointly encode one fixed density, and the whole dataset is judged against it.',
        },
        {
          type: 'p',
          md:
            'That fixed density is DBSCAN’s real weakness — one $\\epsilon$ cannot serve a tight cluster and a diffuse one at the same time — and choosing it is genuinely hard. **[[hdbscan|HDBSCAN]]** fixes exactly that. It drops $\\epsilon$ entirely, running the whole family of radii at once and keeping the clusters that survive longest as the radius shrinks, so clusters of different densities coexist. Only the intuitive knob $n$ remains, the smallest group you would still call a cluster. It is fast enough for millions of examples; modern k-means implementations are faster still, but HDBSCAN is a superb first thing to try on new data.',
        },
        {
          type: 'hint',
          md:
            'If you do have to set $\\epsilon$ by hand, the usual diagnostic is a k-distance plot: for every point measure the distance to its $n$-th nearest neighbor, sort those distances and plot the curve. It stays low and flat across the points inside clusters, then turns sharply upward as it reaches the stragglers — and the knee is a defensible $\\epsilon$. The same caution applies as for [[k-nearest-neighbors|kNN]]: $\\epsilon$ is a fixed radius in the raw feature space, so unscaled features wreck it before you begin.',
        },
        {
          type: 'widget',
          id: 'DbscanExplorer',
          challenge: {
            id: 'ch09-challenge-dbscan',
            label: 'cluster the rings correctly where k-means cannot',
            xp: 15,
          },
        },
        {
          type: 'p',
          md:
            'And how many clusters *does* your data have? For 2D you can look; beyond three dimensions you cannot. **[[prediction-strength]]** answers with a supervised-flavored trick: split the data into training and test sets, cluster both with the same $k$, and check consistency — for each test cluster, what fraction of its point *pairs* also fall into a common region of the training clustering? The score $ps(k)$ is the worst such fraction over test clusters. If $k$ is right, both clusterings tell the same story and $ps(k)$ stays high; experiments suggest keeping the largest $k$ with $ps(k) > 0.8$. For randomness-sensitive algorithms like k-means, average the score over several runs.',
        },
        {
          type: 'p',
          md:
            'One more family, because it changes what a cluster *is*. K-means and DBSCAN both commit each point to exactly one group. **[[soft-clustering|Soft clustering]]** hands every point a set of membership scores instead — 0.9 here, 0.1 there — which is far more honest about the points that genuinely sit between two groups. The standard vehicle is the **[[gaussian-mixture-model|Gaussian mixture model]]**: assume the data was produced by $k$ bell-shaped generators, each with its own center, its own width *and its own tilt*, plus a weight saying how often it fires. Because every cluster carries a full covariance matrix rather than a single radius, GMM clusters are stretched ellipses where k-means can only draw spheres.',
        },
        {
          type: 'p',
          md:
            'Fitting it is a chicken-and-egg problem — knowing the Gaussians would tell you which one made each point, and knowing which one made each point would tell you the Gaussians. **[[expectation-maximization]]** breaks the deadlock in exactly the way k-means does, with two alternating steps:',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            '**E step** — the *assign* step, softened. Hold the Gaussians fixed and work out, for every point, how likely each Gaussian is to have produced it. K-means answers this with a single winner; EM answers with a set of fractions summing to one, called the *responsibilities*.',
            '**M step** — the *update* step, weighted. Hold the responsibilities fixed and refit each Gaussian to the data, except that every point now counts toward every cluster in proportion to its responsibility. K-means averages the points it owns outright; EM takes a weighted average over *all* of them.',
          ],
        },
        {
          type: 'p',
          md:
            'Repeat, and the likelihood of the data climbs every round until it stops climbing. Same structure as k-means, same local-optimum caveat, same sensitivity to where you start — and k-means is literally the limiting case, the one you get by shrinking every Gaussian to a sphere and rounding every responsibility to 0 or 1. What the extra arithmetic buys is uncertainty: a point whose responsibilities come out near 0.5 and 0.5 is the model telling you not to trust its label.',
        },
        {
          type: 'hint',
          md:
            'Other ways to pick $k$: the **[[gap-statistic|gap statistic]]** compares your [[inertia]] against the inertia of structureless random data spread over the same region, and keeps the $k$ where your data wins by the widest margin; the elbow method looks for the bend in the inertia curve; average silhouette scores how much better each point fits its own cluster than the next-best one. For a GMM you can be stricter still — fit one mixture per candidate $k$ and keep whichever makes a held-out set most probable. Spectral and hierarchical clustering are worth knowing about, but k-means, HDBSCAN and GMM cover most of what comes up.',
        },
        {
          type: 'quiz',
          id: 'ch09-q-dbscan',
          questions: [
            {
              kind: 'match',
              id: 'ch09-q-dbscan-1',
              prompt: 'Match each DBSCAN role to its definition:',
              pairs: [
                ['Core point', 'has at least n examples within distance ε'],
                ['Border point', 'in a cluster, but with too few neighbors to expand it'],
                ['Noise point', 'reachable from no dense chain — an outlier'],
              ],
              explain:
                'Cores found and grow clusters, borders ride along, noise is left out entirely.',
            },
            {
              kind: 'mcq',
              id: 'ch09-q-dbscan-2',
              prompt: 'Why does DBSCAN handle ring-shaped clusters that k-means cannot?',
              choices: [
                'Clusters are traced out by chains of dense neighbors',
                'It places several centroids along each ring instead of one',
                'It swaps Euclidean distance for a curvature-aware metric',
                'It fits an ellipse to each cluster rather than a circle',
              ],
              answer: 0,
              explain:
                'A centroid-based cluster is a blob around its center; a density-based cluster is whatever a chain of ε-neighbors traces out. DBSCAN still uses ordinary Euclidean distance — the freedom comes from the chaining, not from the metric.',
            },
            {
              kind: 'mcq',
              id: 'ch09-q-dbscan-3',
              prompt: 'HDBSCAN improves on DBSCAN mainly by…',
              choices: [
                'dropping ε and coping with clusters of varying density',
                'running faster than every modern k-means implementation',
                'choosing ε automatically from the average nearest-neighbor gap',
                'merging border points into the nearest core cluster',
              ],
              answer: 0,
              explain:
                'ε is engineered away entirely, not auto-tuned; only the minimum-cluster-size knob n remains, which is easy to set by intuition. Speed is still k-means’ trump card.',
            },
            {
              kind: 'mcq',
              id: 'ch09-q-dbscan-4',
              prompt: 'Prediction strength picks a good number of clusters by checking whether…',
              choices: [
                'test-set pairs stay together under the training-set clustering',
                'inertia falls below a fixed fraction of its value at k=1',
                'each cluster ends up with roughly the same number of points',
                'adding one more cluster stops lowering the training error',
              ],
              answer: 0,
              explain:
                'If k matches the real structure, train- and test-based clusterings agree on which pairs belong together; ps(k) > 0.8 is the practical bar.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch09-pca',
      title: 'Fewer Dimensions, Most of the Story',
      minutes: 6,
      blocks: [
        {
          type: 'p',
          md:
            'Modern models shrug at millions of features, so **[[dimensionality-reduction]]** is used less than it once was — but it still has two killer applications. The first is **visualization**: humans cannot read a plot with more than three axes. The second is **interpretability**: if you are restricted to simple, explainable models, fewer (and less redundant, less noisy) features can make them viable.',
        },
        {
          type: 'p',
          md:
            '**[[principal-component-analysis|Principal component analysis]]** (PCA) is the classic. Imagine rotating a new coordinate system inside your cloud of points: the first axis — the **[[principal-component|first principal component]]** — points in the direction where the data varies *most*. The second is perpendicular to it and captures the most of what remains, and so on. To go from $D$ dimensions down to $D_{new}$, keep the top $D_{new}$ components and **project** each point onto them: in the 2D-to-1D case every point is replaced by a single coordinate — its shadow on the first component. With high-dimensional data it often happens that two or three components hold most of the variation, so a flat plot can honestly display a very tall dataset.',
        },
        {
          type: 'formula',
          tex: '\\mathrm{Var}_{\\mathbf{u}} = \\mathbf{u}^{\\top}\\, \\boldsymbol{\\Sigma}\\, \\mathbf{u}',
          parts: [
            { tex: '\\mathrm{Var}_{\\mathbf{u}}', label: 'how spread out the shadows are' },
            { tex: '=' },
            { tex: '\\mathbf{u}^{\\top}', label: 'the direction you are projecting onto…' },
            { tex: '\\boldsymbol{\\Sigma}', label: 'the data’s spread in every direction' },
            { tex: '\\mathbf{u}', label: '…applied once on each side' },
          ],
          terms: [
            { tex: '\\mathbf{u}', explain: 'a unit vector: the candidate direction to project onto' },
            { tex: '\\boldsymbol{\\Sigma}', explain: 'the covariance matrix of the (mean-centered) data' },
            {
              tex: '\\mathrm{Var}_{\\mathbf{u}}',
              explain: 'the variance of the 1D shadows along u — PC1 is the u that maximizes this',
            },
          ],
        },
        {
          type: 'p',
          md:
            'That formula answers "how spread out are the shadows along $\\mathbf{u}$" — but it does not yet say where the winning $\\mathbf{u}$ comes from, and PCA does not go looking for it. Maximize $\\mathbf{u}^{\\top}\\boldsymbol{\\Sigma}\\mathbf{u}$ subject to $\\mathbf{u}$ having length one, and the condition that drops out is $\\boldsymbol{\\Sigma}\\mathbf{u} = \\lambda\\mathbf{u}$: the eigenvector equation. The principal components *are* the **eigenvectors** of the covariance matrix, and each one’s **eigenvalue** is precisely the variance captured along it. So sorting the eigenvalues from largest to smallest sorts the components, keeping the top $D_{new}$ of them is the entire algorithm, and the variance you threw away is the sum of the eigenvalues you dropped. No search, no iteration — one eigendecomposition.',
        },
        {
          type: 'p',
          md:
            'Two consequences worth carrying away. First, a covariance matrix is symmetric, and the eigenvectors of a symmetric matrix are mutually perpendicular — so "the second axis is perpendicular to the first" is not a rule anyone imposed, it is something the algebra hands you. Second, PCA chases *raw* variance and is therefore at the mercy of your units: the same length recorded in millimeters has a million times the variance it has in meters, and will monopolize PC1 for no reason worth having. [Standardize first](sec:ch05-feature-engineering) unless the features already share a scale — and always center, because the covariance matrix assumes the mean has been subtracted.',
        },
        {
          type: 'widget',
          id: 'PcaProjector',
          challenge: {
            id: 'ch09-challenge-pca',
            label: 'find the axis capturing 90%+ of the variance',
            xp: 15,
          },
        },
        {
          type: 'p',
          md:
            'PCA is linear — it can only rotate and flatten, so a curved structure such as a spiral comes out as a smear. The modern nonlinear tools built for visualization, **[[umap|UMAP]]** and t-SNE, think differently: they design a similarity score between examples that respects *local* structure (how dense the data is around each point), then search — by [[gradient-descent]] — for low-dimensional coordinates whose similarities match the high-dimensional ones as closely as possible. On a benchmark like handwritten digits, UMAP separates the classes visually far better than PCA, without ever seeing a label. Speed-wise it sits between PCA (fastest) and autoencoders (slowest) — and recall from [Chapter 7](sec:ch07-few-labels) that an autoencoder’s **[[bottleneck-layer|bottleneck layer]]** is itself a learned low-dimensional representation.',
        },
        {
          type: 'hint',
          md:
            'Read a UMAP or t-SNE plot with care, because two things on it mean less than they appear to. The *size* of a cluster is not meaningful — the layout stretches sparse regions and compresses dense ones by design. The *distance between* two clusters is only loosely meaningful, since the objective is dominated by getting neighborhoods right, not by getting the global arrangement right. What you can trust is the neighborhoods themselves: points drawn together really were close. Treat the picture as a sketch worth investigating, never as coordinates worth modeling on.',
        },
        {
          type: 'quiz',
          id: 'ch09-q-pca',
          questions: [
            {
              kind: 'mcq',
              id: 'ch09-q-pca-1',
              prompt: 'The first principal component is the direction that…',
              choices: [
                'maximizes the variance of the projected data',
                'passes through the two most distant points in the cloud',
                'points from the origin toward the mean of the data',
                'aligns with the single feature of largest raw variance',
              ],
              answer: 0,
              explain:
                'PCA hunts for the axis whose 1D shadows spread out the most; each next component repeats the hunt in the remaining perpendicular directions.',
            },
            {
              kind: 'mcq',
              id: 'ch09-q-pca-2',
              prompt: 'After projecting 2D data onto PC1, each example is described by…',
              choices: [
                'one coordinate: its position along PC1',
                'two coordinates: its positions along PC1 and PC2',
                'one coordinate: its distance from the data mean',
                'one coordinate: the index of its nearest neighbor',
              ],
              answer: 0,
              explain:
                'That is the whole point of the reduction — one number per example instead of two, keeping most of the variation.',
            },
            {
              kind: 'tf',
              id: 'ch09-q-pca-3',
              prompt:
                'The most frequent use of dimensionality reduction today is speeding up training rather than visualization.',
              answer: false,
              explain:
                'Modern algorithms and hardware handle high dimensions fine; the top use case is plotting data humans can read (interpretability is the runner-up).',
            },
            {
              kind: 'mcq',
              id: 'ch09-q-pca-4',
              prompt: 'What is the core idea behind UMAP (and t-SNE)?',
              choices: [
                'Find low-D points whose similarities match the high-D ones',
                'Rotate the axes so that each new one captures maximal variance',
                'Cluster the data first, then plot one point per centroid',
                'Keep only the features whose variance exceeds a threshold',
              ],
              answer: 0,
              explain:
                'A local-density-aware similarity is computed in both spaces, and gradient descent moves the low-D points until the two sets of similarities agree.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch09-outliers',
      title: 'Spotting the Odd Ones Out',
      minutes: 4,
      blocks: [
        {
          type: 'p',
          md:
            '**[[outlier-detection|Outlier detection]]** asks: which examples in the dataset look nothing like a typical example? Three tools you already own solve it. **Density**: fit $\\hat{f}_b$ and flag inputs where the estimated density is tiny — they live where the data does not. **Reconstruction**: train an [[autoencoder]] on the dataset; because its bottleneck only memorizes the *common* structure, it rebuilds typical examples faithfully and butchers outliers — a large reconstruction error is the alarm. **[[one-class-classification|One-class classification]]**: train a model of the single class “normal” and let it answer *belongs / does not belong* for any new input.',
        },
        {
          type: 'p',
          md:
            'Which to choose? Density estimates shine when you also want probabilities; autoencoders scale to images and other rich inputs; one-class models give you a crisp decision boundary. All three share the same philosophy: model what *typical* looks like, then measure the distance from typical.',
        },
        {
          type: 'p',
          md:
            'All three also hand you a *score* rather than a verdict, so somebody still has to draw the line. The usual move is to assume a contamination rate — say you believe 1% of the data is junk — and put the threshold at the 1st percentile of the training scores. Notice what that fixes: how many false alarms you are willing to hear, not how many anomalies you will catch. Evaluating the result is the genuinely awkward part, because with no labels there is no [recall to measure](sec:ch05-metrics). What happens in practice is that a person inspects the top of the ranking and the threshold moves until the inspection stops being a waste of their afternoon.',
        },
        {
          type: 'hint',
          md:
            'Two jobs hide under one name. *Outlier detection* cleans a dataset you already hold, so the training data itself contains the contamination you are hunting. *Novelty detection* screens new arrivals against a training set you assume is clean. The models are the same; the assumption is not, and getting it backwards is why a detector sometimes learns that fraud is normal — it was trained on data full of it.',
        },
        {
          type: 'quiz',
          id: 'ch09-q-outliers',
          questions: [
            {
              kind: 'mcq',
              id: 'ch09-q-outliers-1',
              prompt: 'Why does an autoencoder struggle to reconstruct an outlier?',
              choices: [
                'Its bottleneck only encodes patterns common in the data',
                'Outliers activate far more units than typical inputs do',
                'The reconstruction loss is undefined outside the data range',
                'Its weights were regularized to ignore rare examples',
              ],
              answer: 0,
              explain:
                'The compressed code can only store regularities the network saw often — an outlier’s quirks never made it into the code.',
            },
            {
              kind: 'match',
              id: 'ch09-q-outliers-2',
              prompt: 'Match the outlier-detection route to its signal:',
              pairs: [
                ['Density estimation', 'the input lands where the estimated pdf is tiny'],
                ['Autoencoder', 'the reconstruction error is large'],
                ['One-class classifier', 'the model says “not a member of the class”'],
              ],
              explain:
                'Three models of “typical”, three different alarms for “atypical”.',
            },
            {
              kind: 'tf',
              id: 'ch09-q-outliers-3',
              prompt: 'A one-class classifier needs labeled examples of outliers to train.',
              answer: false,
              explain:
                'It trains on normal data alone — that is the whole appeal when anomalies are rare or unseen.',
            },
          ],
        },
      ],
    },
  ],
  bossPool: [
    {
      kind: 'mcq',
      id: 'ch09-boss-1',
      prompt: 'The fundamental difficulty of unsupervised learning is that…',
      choices: [
        'without labels there is no reference point for model quality',
        'unlabeled datasets are always far smaller than labeled ones',
        'distances between feature vectors become meaningless',
        'the algorithms cannot be trained by gradient descent',
      ],
      answer: 0,
      explain:
        'No labels means no ground truth for “desired behavior” — so this book prefers methods evaluable against the data itself.',
    },
    {
      kind: 'mcq',
      id: 'ch09-boss-2',
      prompt: 'In kernel density estimation, choosing a *huge* bandwidth $b$ leads to…',
      choices: [
        'an oversmoothed estimate that hides real structure',
        'sharp spikes around each individual training point',
        'a closer match to the true pdf, since noise is averaged out',
        'an estimate that is exactly a single fitted Gaussian',
      ],
      answer: 0,
      explain:
        'Wide bumps blur everything into one mound — the two-peak shape of the truth disappears. That is underfitting, not noise removal, and the result is a sum of many wide bumps rather than one fitted Gaussian.',
    },
    {
      kind: 'mcq',
      id: 'ch09-boss-3',
      prompt: 'The bandwidth $b^*$ is found by minimizing an estimate of…',
      choices: [
        'the mean integrated squared error (MISE)',
        'the negative log-likelihood of the training data',
        'the variance of the estimated density over the sample',
        'the squared error against a fitted parametric Gaussian',
      ],
      answer: 0,
      explain:
        'MISE swaps MSE’s sum for an integral and its average for an expectation; its b-dependent part is estimated with the leave-one-out trick and grid-searched.',
    },
    {
      kind: 'order',
      id: 'ch09-boss-4',
      prompt: 'Order the k-means procedure:',
      items: [
        'Choose the number of clusters k',
        'Place k centroids in feature space',
        'Assign each example to its nearest centroid',
        'Move each centroid to the average of its assigned examples',
        'Repeat assign/update until assignments stop changing',
      ],
      explain: 'The final model is simply the list of centroid ids assigned to the examples.',
    },
    {
      kind: 'numeric',
      id: 'ch09-boss-5',
      prompt:
        'Points $0, 2, 4$ on a line share one centroid at $2$. Inertia is the sum of squared distances to the centroid. Compute it.',
      answer: 8,
      tolerance: 0.01,
      explain: '$(0-2)^2 + (2-2)^2 + (4-2)^2 = 4 + 0 + 4 = 8$.',
    },
    {
      kind: 'mcq',
      id: 'ch09-boss-6',
      prompt: 'Two k-means runs on identical data produced different clusterings. The likeliest cause:',
      choices: [
        'different random initial centroid positions',
        'k-means shuffles the points between runs, so assignments differ',
        'the data contains no real cluster structure to recover',
        'ties in Euclidean distance are broken in a random order',
      ],
      answer: 0,
      explain:
        'Initialization decides which local optimum the loop reaches; variants exist that seed centroids from data properties to stabilize this.',
    },
    {
      kind: 'match',
      id: 'ch09-boss-7',
      prompt: 'Match the DBSCAN point type to its fate:',
      pairs: [
        ['Core point', 'founds or expands a cluster through its ε-neighborhood'],
        ['Border point', 'joins a cluster but cannot expand it'],
        ['Outlier', 'belongs to no cluster'],
      ],
      explain: 'Density chains run through core points only; borders are passengers, noise stays outside.',
    },
    {
      kind: 'mcq',
      id: 'ch09-boss-8',
      prompt: 'The signature advantage of DBSCAN over k-means is…',
      choices: [
        'clusters of arbitrary shape rather than round blobs',
        'the number of clusters is the only knob you must set',
        'it converges to the global optimum rather than a local one',
        'it gives each point a membership probability per cluster',
      ],
      answer: 0,
      explain:
        'Density chaining traces whatever shape the dense region has; centroid methods can only draw blobs around centers. DBSCAN still has two hyperparameters (ε and n), still finds only a local solution, and still assigns hard labels.',
    },
    {
      kind: 'mcq',
      id: 'ch09-boss-9',
      prompt: 'A single fixed ε is a problem for DBSCAN when…',
      choices: [
        'different clusters have different densities',
        'the clusters are convex rather than ring-shaped',
        'there are more clusters than there are features',
        'the dataset contains no noise points at all',
      ],
      answer: 0,
      explain:
        'One radius cannot be simultaneously right for a tight cluster and a sparse one — the motivation for HDBSCAN.',
    },
    {
      kind: 'mcq',
      id: 'ch09-boss-10',
      prompt: 'HDBSCAN keeps a single important hyperparameter. Which?',
      choices: [
        'n — the smallest group you would still call a cluster',
        'ε — the radius of the neighborhood searched around a point',
        'k — the number of clusters the algorithm should return',
        'b — the bandwidth controlling how wide each kernel bump is',
      ],
      answer: 0,
      explain:
        'The ε knob is engineered away; the minimum cluster size is easy to set by intuition. Try HDBSCAN first on new data.',
    },
    {
      kind: 'tf',
      id: 'ch09-boss-11',
      prompt:
        'Modern k-means implementations are faster than HDBSCAN, but HDBSCAN’s qualities can still make it the better practical choice.',
      answer: true,
      explain:
        'Speed is k-means’ trump card; shape-flexibility, noise handling and the friendlier hyperparameter are HDBSCAN’s.',
    },
    {
      kind: 'mcq',
      id: 'ch09-boss-12',
      prompt: 'Prediction strength for choosing k works by…',
      choices: [
        'checking that test pairs stay grouped in the training clustering',
        'picking the k at which the inertia curve stops falling steeply',
        'training a classifier whose accuracy peaks at the correct k',
        'projecting the data to two dimensions and counting the clouds',
      ],
      answer: 0,
      explain:
        'A co-membership matrix records which test pairs share a cluster under the training clustering’s regions; ps(k) is the worst per-cluster fraction.',
    },
    {
      kind: 'numeric',
      id: 'ch09-boss-13',
      prompt:
        'Per the experiments cited in the book, a reasonable number of clusters is the largest k whose prediction strength exceeds what threshold?',
      answer: 0.8,
      tolerance: 0.001,
      explain:
        'Keep the largest k with ps(k) above 0.8 — and average ps over several runs for randomness-sensitive algorithms like k-means.',
    },
    {
      kind: 'mcq',
      id: 'ch09-boss-14',
      prompt: 'How does a Gaussian mixture model differ from k-means?',
      choices: [
        'Each example gets a membership score in every cluster',
        'It needs the true cluster labels for a few examples',
        'It fixes the number of clusters automatically',
        'It forces every cluster to be a perfect circle',
      ],
      answer: 0,
      explain:
        'GMM is soft clustering — a score per cluster instead of one hard label. It is a weighted sum of Gaussians fit by expectation maximization on unlabeled data, its clusters are ellipses shaped by covariance matrices, and k is still yours to choose.',
    },
    {
      kind: 'tf',
      id: 'ch09-boss-15',
      prompt:
        'A practical way to pick k for a GMM is to choose the k whose model maximizes the likelihood of a held-out test set.',
      answer: true,
      explain:
        'Fit one mixture per candidate k on training data, then keep the k that makes the test examples most probable.',
    },
    {
      kind: 'mcq',
      id: 'ch09-boss-16',
      prompt: 'The EM algorithm used for GMMs resembles k-means because both…',
      choices: [
        'alternate between scoring examples and updating the clusters',
        'follow the gradient of a single differentiable loss',
        'commit each example to exactly one cluster per iteration',
        'need a labeled subset to initialize the cluster centers',
      ],
      answer: 0,
      explain:
        'EM’s update is a *weighted* average using membership likelihoods where k-means uses a plain average over hard assignments.',
    },
    {
      kind: 'mcq',
      id: 'ch09-boss-17',
      prompt: 'The most frequent use case for dimensionality reduction today is…',
      choices: [
        'visualizing data on a 2D or 3D plot',
        'speeding up training by cutting the feature count',
        'removing correlated features before clustering',
        'shrinking the trained model so it fits in memory',
      ],
      answer: 0,
      explain:
        'Humans max out at three axes; interpretability of simple models is the other big win (fewer, less redundant, less noisy features).',
    },
    {
      kind: 'numeric',
      id: 'ch09-boss-18',
      prompt:
        'A 2D dataset has variance 9 along PC1 and 1 along PC2. What percentage of total variance does PC1 capture?',
      answer: 90,
      tolerance: 1,
      explain: '$9 / (9 + 1) = 0.9$ — so a 1D projection keeps 90% of the story.',
    },
    {
      kind: 'match',
      id: 'ch09-boss-19',
      prompt: 'Match the technique to its unsupervised task:',
      pairs: [
        ['Kernel density estimation', 'modeling the pdf that generated the data'],
        ['HDBSCAN', 'grouping examples, arbitrary shapes, noise-aware'],
        ['PCA / UMAP', 'shrinking the number of dimensions'],
        ['Autoencoder reconstruction error', 'flagging untypical examples'],
      ],
      explain: 'Four tasks, four signature tools — the whole chapter in one matching.',
    },
    {
      kind: 'mcq',
      id: 'ch09-boss-20',
      prompt: 'UMAP finds low-dimensional coordinates by…',
      choices: [
        'gradient descent on a loss comparing two similarity sets',
        'rotating the coordinate axes until each captures maximal variance',
        'sampling coordinates from a fitted Gaussian mixture',
        'keeping the features that best predict the others',
      ],
      answer: 0,
      explain:
        'Its similarity metric respects local density; the mismatch between the two similarity sets (a fuzzy-set cross-entropy) is what gets minimized.',
    },
    {
      kind: 'tf',
      id: 'ch09-boss-21',
      prompt: 'In practice UMAP is slightly slower than PCA but faster than an autoencoder.',
      answer: true,
      explain:
        'And on data like handwritten digits it separates the classes visually best of the three — without ever seeing labels.',
    },
    {
      kind: 'mcq',
      id: 'ch09-boss-22',
      prompt: 'Using an autoencoder for outlier detection, an example is flagged when…',
      choices: [
        'the model reconstructs it poorly from the bottleneck code',
        'the model reconstructs it almost perfectly from the compressed code',
        'its bottleneck code has an unusually large norm',
        'the encoder and decoder disagree on its class label',
      ],
      answer: 0,
      explain:
        'The bottleneck stores only typical structure, so atypical inputs come back mangled — high reconstruction error is the outlier alarm.',
    },
  ],
};

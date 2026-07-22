import type { Concept } from './types';

/**
 * Chapter 9's vocabulary: what you can still learn once the labels are gone.
 * Three of these — where PCA's directions come from, how EM's two steps mirror
 * k-means', how a DBSCAN cluster actually grows — are the mechanisms the book
 * states as facts and never derives.
 */
export const conceptsCh09: Concept[] = [
  {
    id: 'density-estimation',
    term: 'density estimation',
    simple:
      'Work out where the data likes to live. Given nothing but a heap of unlabeled measurements, build a picture of which values are common, which are rare, and which are so rare that seeing one should make you suspicious.',
    technical:
      'The unsupervised job of recovering the [[probability-density-function|pdf]] a sample was drawn from. Two routes. *Parametric*: assume a family — a Gaussian, a mixture — and fit its parameters by [[maximum-likelihood]]; cheap and data-efficient, and wrong in a way you cannot detect when the family is wrong. *Nonparametric*: let the sample dictate the shape, as [[kernel-density-estimation]] does. Both get exponentially harder as dimensions pile up, since a fixed number of points spreads ever more thinly, which is why density-based [[outlier-detection]] usually runs on a reduced or learned representation rather than on raw inputs.',
    math:
      'Given $\\mathbf{x}_1,\\dots,\\mathbf{x}_N$ drawn independently from an unknown $f$, return an $\\hat{f} \\ge 0$ with $\\int \\hat{f}(\\mathbf{x})\\,d\\mathbf{x} = 1$. Quality is judged over the whole domain rather than at one point: the standard yardstick is [[mean-integrated-squared-error|MISE]], $\\mathbb{E}\\int (\\hat{f}(x) - f(x))^2\\,dx$. The parametric route sets $\\hat{f} = f_{\\hat{\\theta}}$ with $\\hat{\\theta} = \\arg\\max_{\\theta}\\sum_i \\log f_\\theta(\\mathbf{x}_i)$.',
    statquest: 'probability density function',
    teachesAt: 'ch09-density',
    see: ['kernel-density-estimation', 'mean-integrated-squared-error', 'outlier-detection'],
  },
  {
    id: 'kernel-density-estimation',
    term: 'kernel density estimation',
    simple:
      'Put a small smooth hill on top of every data point and add all the hills together. Where the points crowd, the hills stack into a peak; where they are scattered, the surface stays low. The sum is your guess at the shape of the whole distribution.',
    technical:
      'The nonparametric route to [[density-estimation]]. The kernel here is a *bump* — a shape that integrates to one, almost always the standard Gaussian — rather than the similarity function of [[kernel-function|the SVM sense]], although both amount to weighting neighbors smoothly. Which bump you choose barely matters; the [[bandwidth]] is the whole game. KDE is the density twin of [[kernel-regression]] from Chapter 7: identical weights, but where kernel regression averages the neighbors’ *targets*, KDE only counts how much neighbor is stacked overhead. Being [[non-parametric-model|non-parametric]], it stores every example and costs $O(N)$ per query.',
    math:
      '$\\hat{f}_b(x) = \\dfrac{1}{Nb}\\sum_{i=1}^{N} k\\!\\left(\\dfrac{x - x_i}{b}\\right)$, with the Gaussian kernel $k(z) = \\frac{1}{\\sqrt{2\\pi}}e^{-z^2/2}$. The $1/(Nb)$ is what keeps $\\int \\hat{f}_b = 1$: each bump contributes exactly $1/N$. In $D$ dimensions the estimator reads $\\frac{1}{Nb^D}\\sum_i k\\!\\left(\\frac{\\lVert\\mathbf{x} - \\mathbf{x}_i\\rVert}{b}\\right)$, and the sample size needed to hold the error fixed grows like $b^{-D}$ — the curse of dimensionality in one exponent.',
    teachesAt: 'ch09-density',
    see: ['density-estimation', 'bandwidth', 'kernel-regression', 'non-parametric-model'],
  },
  {
    id: 'mean-integrated-squared-error',
    term: 'mean integrated squared error',
    simple:
      'A score for how wrong a whole curve is, not just one prediction. Take the gap between your estimated density and the true one at every point, square it, add up along the entire axis, then average over the datasets you might have drawn.',
    technical:
      'MISE is to a density estimate what [[mean-squared-error|MSE]] is to a single prediction: the sum becomes an integral over the input space and the average becomes an expectation over samples. You cannot compute it — the true $f$ is precisely what you do not have — but expanding the square splits it into three terms, only two of which depend on the [[bandwidth]] being tuned, and one of those has an unbiased data-only estimate via [[leave-one-out-cross-validation]]. The third is a constant you can ignore while ranking candidates.',
    math:
      '$\\mathrm{MISE}(b) = \\mathbb{E}\\!\\int\\!\\left(\\hat{f}_b(x) - f(x)\\right)^2 dx = \\mathbb{E}\\!\\int \\hat{f}_b^2\\,dx \\;-\\; 2\\,\\mathbb{E}\\!\\int \\hat{f}_b f\\,dx \\;+\\; \\int f^2\\,dx$. The last term is free of $b$. The middle one is $\\mathbb{E}\\!\\left[\\hat{f}_b(X)\\right]$ for a fresh draw $X$, which is exactly what holding one example out estimates without bias. Minimizing $\\int\\hat{f}_b^2 - \\frac{2}{N}\\sum_i \\hat{f}_b^{(-i)}(x_i)$ over a grid of $b$ therefore minimizes MISE.',
    teachesAt: 'ch09-density',
    see: ['mean-squared-error', 'leave-one-out-cross-validation', 'bandwidth'],
  },
  {
    id: 'leave-one-out-cross-validation',
    term: 'leave-one-out cross-validation',
    simple:
      'Train on everything except one example, then see how the model does on the example you held back. Do that once for every example in turn and average. Nothing is wasted, and no model is ever scored on data it has already seen.',
    technical:
      '[[cross-validation]] pushed to its limit: $N$ folds of size one. Its appeal for [[kernel-density-estimation|KDE]] is that removing one point from a sum of bumps is arithmetic rather than retraining, so the whole sweep over candidate bandwidths is cheap. In general it is nearly unbiased — each fit sees $N-1$ examples — but high in variance, because the $N$ fits are trained on almost identical data and their errors are strongly correlated. That is why five- or ten-fold remains the default everywhere else.',
    math:
      '$\\mathrm{LOO}(b) = \\frac{1}{N}\\sum_{i=1}^{N}\\ell\\!\\left(\\hat{f}_b^{(-i)}(x_i)\\right)$, where $\\hat{f}_b^{(-i)}(x) = \\frac{1}{(N-1)b}\\sum_{j\\ne i} k\\!\\left(\\frac{x - x_j}{b}\\right)$ is built from every example but the $i$-th. It costs $N$ fits in general and one pass here, since $\\hat{f}_b^{(-i)}$ is $\\hat{f}_b$ with a single known bump subtracted.',
    statquest: 'cross validation',
    teachesAt: 'ch09-density',
    see: ['cross-validation', 'mean-integrated-squared-error', 'bandwidth'],
  },
  {
    id: 'clustering',
    term: 'clustering',
    simple:
      'Sorting a pile of things into groups without being told what the groups are, or even how many there should be. The only evidence available is which things resemble which.',
    technical:
      'Assigning a group id to every example from unlabeled data alone. With no ground truth there is no accuracy to report, so the answer is judged by an internal criterion ([[inertia]], density, likelihood) plus whether the groups mean anything to you. Every method smuggles in an assumption about what a cluster *is*: [[k-means]] says a round blob about a center, [[dbscan|DBSCAN]] says a connected dense region, a [[gaussian-mixture-model|mixture model]] says a tilted ellipse. Pick the assumption rather than the algorithm — and remember the [[distance-metric|distance]] matters at least as much as the method.',
    math:
      'A hard clustering is a map $a:\\{1,\\dots,N\\}\\to\\{1,\\dots,k\\}$; a [[soft-clustering|soft]] one is a set of weights $\\gamma_{ij}\\ge 0$ with $\\sum_j \\gamma_{ij} = 1$. The number of ways to split $N$ points into $k$ non-empty groups is the Stirling number $S(N,k)$, which is astronomically large even for tiny $N$ — so every practical method is an iterative or [[greedy-algorithm|greedy]] search and none of them is exhaustive.',
    statquest: 'clustering',
    teachesAt: 'ch09-kmeans',
    see: ['k-means', 'dbscan', 'soft-clustering', 'distance-metric'],
  },
  {
    id: 'k-means',
    term: 'k-means',
    simple:
      'Guess where the centers of the groups are, hand every point to its nearest center, then move each center to the middle of the points it just collected. Repeat. After a few rounds the centers slide into place and stop moving.',
    technical:
      'Lloyd’s algorithm: alternate an assign step and an update step, each of which can only lower [[inertia]], so the loop must halt — at a local optimum, not the best one. The cluster shape is baked in: membership is decided by nearest center, so the boundaries are straight and the cells convex, and it can never carve out a ring. It is dragged around by outliers, since the update is a plain mean, and it quietly prefers clusters of similar size and spread. Scale the features first, because [[centroid|centroids]] live in the data’s own units. Its trump card is speed — it is still the fastest thing in the room.',
    math:
      'Minimize $J = \\sum_{i=1}^{N}\\lVert\\mathbf{x}_i - \\mathbf{c}_{a(i)}\\rVert^2$ over both the assignment $a$ and the centers $\\mathbf{c}_j$. Holding $\\mathbf{c}$ fixed, the best $a(i) = \\arg\\min_j \\lVert\\mathbf{x}_i - \\mathbf{c}_j\\rVert$; holding $a$ fixed, the best $\\mathbf{c}_j = \\frac{1}{|C_j|}\\sum_{i\\in C_j}\\mathbf{x}_i$, since the mean is what minimizes squared distance. That is coordinate descent on $J$ — and exactly the hard-assignment limit of [[expectation-maximization|EM]] for a mixture of spherical Gaussians. Finding the global minimum is NP-hard.',
    statquest: 'k-means clustering',
    teachesAt: 'ch09-kmeans',
    see: ['centroid', 'inertia', 'clustering', 'expectation-maximization'],
  },
  {
    id: 'centroid',
    term: 'centroid',
    simple:
      'The center of gravity of a group of points — the place you get by averaging them. In k-means it is both the thing that defines a cluster and the thing recomputed every round.',
    technical:
      'A centroid is a point in feature space, not a data point: it can sit where no example does, which is why a "typical customer" produced this way can be a person who does not exist. The mean is chosen because it minimizes squared distance, which is what ties it to [[inertia]]; swap in the medoid — an actual example — and you get k-medoids, more robust to outliers and usable with a [[distance-metric|distance]] that has no notion of averaging. A centroid that ends a round with nothing assigned to it is an empty cluster, and implementations must decide whether to drop it or re-seed it somewhere useful.',
    math:
      '$\\mathbf{c}_j = \\frac{1}{|C_j|}\\sum_{i\\in C_j}\\mathbf{x}_i$, the unique minimizer of $\\sum_{i\\in C_j}\\lVert\\mathbf{x}_i - \\mathbf{c}\\rVert^2$ — differentiate, set to zero, and the mean falls straight out. The set of points nearer to $\\mathbf{c}_j$ than to any other center is its Voronoi cell, an intersection of half-spaces and therefore convex, which is the geometric reason k-means cannot express a ring.',
    statquest: 'k-means clustering',
    teachesAt: 'ch09-kmeans',
    see: ['k-means', 'inertia', 'distance-metric'],
  },
  {
    id: 'inertia',
    term: 'inertia',
    simple:
      'How tightly the clusters hold together: add up the squared distance from every point to the center of its own group. Small means neat little balls, large means sprawl.',
    technical:
      'Also called the within-cluster sum of squares. It is the objective k-means descends, which is precisely why it cannot be used naively to choose $k$: it falls monotonically as $k$ grows and reaches zero when every point is its own cluster. The elbow heuristic looks for where the fall flattens; the [[gap-statistic|gap statistic]] and [[prediction-strength]] turn that impression into something defensible. Comparing inertia across different feature scalings is meaningless, since the units change with the data.',
    math:
      '$J = \\sum_{j=1}^{k}\\sum_{i\\in C_j}\\lVert\\mathbf{x}_i - \\mathbf{c}_j\\rVert^2$. Both k-means steps are monotone in $J$: reassigning a point to a nearer center replaces one term with a smaller one, and re-averaging minimizes each inner sum exactly. Since the number of distinct assignments is finite and $J$ never increases, the loop terminates after finitely many iterations.',
    statquest: 'k-means clustering',
    teachesAt: 'ch09-kmeans',
    see: ['k-means', 'centroid', 'gap-statistic'],
  },
  {
    id: 'dbscan',
    term: 'DBSCAN',
    simple:
      'Grow clusters like spilled ink. Start at a point in a crowded spot, absorb everything within arm’s reach, then repeat from each newly absorbed point that is also in a crowded spot. The stain stops when it reaches empty ground, and whatever it never touched is noise.',
    technical:
      'Density-Based Spatial Clustering of Applications with Noise. Two knobs — a radius $\\epsilon$ and a count $n$ that decides what "crowded" means — and no cluster count, which falls out of the data instead. Its two gifts over [[k-means]] are arbitrary cluster shape and an explicit noise label, so points belonging nowhere are allowed to belong nowhere rather than being forced into the nearest blob. Its two curses are that $\\epsilon$ is genuinely hard to pick, and that a single global $\\epsilon$ cannot serve a dataset containing both a tight cluster and a diffuse one — the failure [[hdbscan|HDBSCAN]] was built to repair.',
    math:
      '$\\mathbf{x}$ is a [[core-point|core point]] when $|N_\\epsilon(\\mathbf{x})| \\ge n$ for $N_\\epsilon(\\mathbf{x}) = \\{\\mathbf{x}\' : d(\\mathbf{x},\\mathbf{x}\') \\le \\epsilon\\}$. Call $\\mathbf{x}\'$ *directly reachable* from a core $\\mathbf{x}$ when $\\mathbf{x}\'\\in N_\\epsilon(\\mathbf{x})$; a cluster is a maximal set closed under chains of that relation. Density-connectivity is an equivalence relation on core points, so the clusters are well defined, and the [[border-point|border points]] hang off whichever chain reached them. With a spatial index the cost is about $O(N\\log N)$; without one it is $O(N^2)$.',
    statquest: 'DBSCAN',
    teachesAt: 'ch09-dbscan',
    see: ['core-point', 'border-point', 'epsilon-neighborhood', 'hdbscan'],
  },
  {
    id: 'core-point',
    term: 'core point',
    simple:
      'A point standing in a crowd — it has at least the required number of neighbors within reach. Only these points are allowed to spread a cluster outward; everything else is a passenger.',
    technical:
      'Core status is the entire engine of [[dbscan|DBSCAN]]: membership propagates through core points and stops dead at non-core ones. Raising $n$ makes cores rarer, so clusters shrink and more points are declared noise; lowering it far enough makes every point core and merges the dataset into one blob. The point itself is normally counted inside its own neighborhood, so $n = 1$ is degenerate and $n \\approx 2D$ is a common rule of thumb in $D$ dimensions.',
    math:
      '$\\mathbf{x}$ is core iff $|N_\\epsilon(\\mathbf{x})| \\ge n$ with $N_\\epsilon(\\mathbf{x}) = \\{\\mathbf{x}_j : \\lVert\\mathbf{x} - \\mathbf{x}_j\\rVert \\le \\epsilon\\}$. Equivalently, a [[kernel-density-estimation|KDE]] built from a flat top-hat kernel of width $\\epsilon$ exceeds the threshold $n/(N\\cdot\\mathrm{vol}(\\epsilon))$ at $\\mathbf{x}$ — DBSCAN is density estimation with a hard cut-off in place of a smooth one.',
    statquest: 'DBSCAN',
    teachesAt: 'ch09-dbscan',
    see: ['dbscan', 'border-point', 'epsilon-neighborhood'],
  },
  {
    id: 'border-point',
    term: 'border point',
    simple:
      'A point on the fringe of a cluster: close enough to a crowded point to be swept in, but not crowded enough itself to pull anyone else along. It joins the party and the chain stops there.',
    technical:
      'Border points are why DBSCAN’s clusters have soft edges rather than a hard density cliff — the boundary extends one radius past the last dense point. They also carry the algorithm’s one genuine ambiguity: a border point within $\\epsilon$ of [[core-point|core points]] from two different clusters is given to whichever chain reached it first, so the result can depend on the order examples are visited. HDBSCAN’s reformulation removes that wrinkle by never assigning on a first-come basis.',
    math:
      '$\\mathbf{x}$ is border iff $|N_\\epsilon(\\mathbf{x})| < n$ and $\\mathbf{x}\\in N_\\epsilon(\\mathbf{x}\')$ for some core $\\mathbf{x}\'$. If neither holds it is noise, so the three labels partition the data: $\\mathcal{X} = \\text{core}\\sqcup\\text{border}\\sqcup\\text{noise}$. Note the asymmetry — reachability runs *from* cores only, which is what stops two clusters merging through a thin bridge of sparse points.',
    statquest: 'DBSCAN',
    teachesAt: 'ch09-dbscan',
    see: ['dbscan', 'core-point', 'outlier-detection'],
  },
  {
    id: 'epsilon-neighborhood',
    term: 'ε-neighborhood',
    simple:
      'The circle you draw around a point to ask who is nearby. Its radius is the one number deciding what counts as close, and everything else in the algorithm follows from that choice.',
    technical:
      'The $\\epsilon$-ball is DBSCAN’s entire notion of locality, and choosing its radius is the hardest practical part of the method. The standard diagnostic is a k-distance plot: for every point measure the distance to its $n$-th nearest neighbor, sort those distances, plot the curve, and take $\\epsilon$ at the knee where it turns sharply upward. Because it is a fixed radius in the raw feature space, unscaled features wreck it exactly as they wreck [[k-nearest-neighbors|kNN]] — and in very high dimensions all pairwise distances converge, so the ball is either empty or holds everything.',
    math:
      '$N_\\epsilon(\\mathbf{x}) = \\{\\mathbf{x}\'\\in\\mathcal{X} : d(\\mathbf{x},\\mathbf{x}\')\\le\\epsilon\\}$, usually with $d$ Euclidean. Its volume grows as $\\epsilon^D$, so the expected count is $\\mathbb{E}|N_\\epsilon(\\mathbf{x})| \\approx N f(\\mathbf{x})\\,V_D\\,\\epsilon^D$. A fixed $n$ therefore encodes a *density* threshold proportional to $\\epsilon^{-D}$ — which is the precise reason one $\\epsilon$ cannot serve two densities at once.',
    statquest: 'DBSCAN',
    teachesAt: 'ch09-dbscan',
    see: ['dbscan', 'core-point', 'hdbscan'],
  },
  {
    id: 'hdbscan',
    term: 'HDBSCAN',
    simple:
      'DBSCAN with the awkward radius knob taken off. Rather than committing to one notion of nearby, it runs the whole family of radii at once, watches which clusters survive longest as the radius shrinks, and keeps those.',
    technical:
      'Hierarchical DBSCAN. It rewrites distance as *mutual reachability* — ordinary distance inflated by how sparse the two points’ own neighborhoods are — builds a minimum spanning tree on that, and cutting the tree at every height gives a whole hierarchy of clusterings. Instead of slicing at one height, which is all a fixed $\\epsilon$ can do, it scores each candidate cluster by how long it persists across heights and keeps the stable ones. Clusters of different densities can then coexist, noise still gets its own label, and only $n$ — the smallest group you would still call a cluster — is left to choose. Slower than k-means, and usually the right first thing to run on data you know nothing about.',
    math:
      'Let $d_{\\mathrm{core}}(\\mathbf{x})$ be the distance to the $n$-th nearest neighbor, and define $d_{\\mathrm{mreach}}(\\mathbf{x},\\mathbf{x}\') = \\max\\{d_{\\mathrm{core}}(\\mathbf{x}),\\, d_{\\mathrm{core}}(\\mathbf{x}\'),\\, d(\\mathbf{x},\\mathbf{x}\')\\}$, which pushes sparse points away from everything while leaving dense ones untouched. Cutting the minimum spanning tree of $d_{\\mathrm{mreach}}$ at height $\\epsilon$ reproduces DBSCAN exactly; HDBSCAN instead keeps the clusters maximizing the persistence $\\sum_{\\mathbf{x}\\in C}\\left(\\lambda_{\\mathbf{x}} - \\lambda_{\\mathrm{birth}}\\right)$ with $\\lambda = 1/\\epsilon$.',
    statquest: 'DBSCAN',
    teachesAt: 'ch09-dbscan',
    see: ['dbscan', 'epsilon-neighborhood', 'clustering'],
  },
  {
    id: 'prediction-strength',
    term: 'prediction strength',
    simple:
      'Ask whether the grouping you found would survive being discovered twice. Split the data in half, cluster each half, and check whether pairs of points that shared a group in one half still share one in the other. Real structure replicates; an invented one does not.',
    technical:
      'A way to choose $k$ that borrows the discipline of a [[test-set|held-out set]] from supervised learning. Cluster the training half and the test half separately at the same $k$, then assign every test point to the nearest *training* center and count, inside each test cluster, the fraction of point pairs the training clustering also keeps together. Take the worst cluster’s fraction, so one incoherent group sinks the score rather than being averaged away. Keep the largest $k$ scoring above roughly 0.8, and average over restarts for anything as initialization-sensitive as [[k-means]].',
    math:
      'With test clusters $C_1,\\dots,C_k$ and a co-membership indicator $D[i,i\'] = 1$ when the training clustering puts $i$ and $i\'$ together, $ps(k) = \\min_{j}\\frac{1}{|C_j|(|C_j| - 1)}\\sum_{i\\ne i\'\\in C_j} D[i,i\']$. It is a minimum rather than a mean, and $ps(1) = 1$ trivially — which is why the rule keeps the *largest* $k$ clearing the bar rather than the best-scoring one.',
    teachesAt: 'ch09-dbscan',
    see: ['k-means', 'gap-statistic', 'cross-validation'],
  },
  {
    id: 'soft-clustering',
    term: 'soft clustering',
    simple:
      'Instead of stamping each point with one group, give it a share in each — seventy per cent this cluster, thirty per cent that one. Points sitting between two groups stop being forced to pick a side.',
    technical:
      'Also called fuzzy clustering. Every example carries a vector of membership weights summing to one, which is more honest near boundaries and hands you an uncertainty signal for free: a point split evenly between two clusters is a point worth looking at. [[gaussian-mixture-model|Gaussian mixtures]] are the standard vehicle, and they buy a second freedom on the way — each cluster gets its own covariance, so clusters become stretched ellipses instead of [[k-means]]’ spheres. Hardening a soft clustering is trivial (take the largest weight); softening a hard one is not.',
    math:
      'Memberships $\\gamma_{ij}\\ge 0$ with $\\sum_{j=1}^{k}\\gamma_{ij} = 1$ replace the hard assignment $a(i)$. For a mixture, $\\gamma_{ij} = \\Pr(z_i = j\\mid\\mathbf{x}_i)$ is a genuine posterior over which component generated the point. Hard assignment is the limit $\\gamma_{ij}\\to\\mathbb{1}\\!\\left[j = \\arg\\max_{j\'}\\gamma_{ij\'}\\right]$ — which is what k-means uses, and why it is [[expectation-maximization|EM]] with the softness turned off.',
    teachesAt: 'ch09-dbscan',
    see: ['gaussian-mixture-model', 'expectation-maximization', 'clustering'],
  },
  {
    id: 'gaussian-mixture-model',
    term: 'Gaussian mixture model',
    simple:
      'Assume the data was made by rolling a weighted die to pick one of several bell-shaped generators, then drawing a point from whichever came up. Fitting the model means working backwards to where those bells sit, how wide and tilted each is, and how often each fires.',
    technical:
      'A generative model: a weighted sum of $k$ Gaussians, each with its own mean, covariance and mixing weight. The covariance is the real payoff over [[k-means]] — a cluster can be a long thin ellipse pointing wherever it likes — and the model returns a per-cluster membership probability rather than a hard label. It is fitted by [[expectation-maximization]], because which component produced each point is never observed. Costs: $k$ still has to be chosen (held-out likelihood, AIC or BIC will do it), a full covariance carries $D(D+1)/2$ parameters per cluster and so needs plenty of data, and a component can collapse onto a single point and send the likelihood to infinity unless the covariance is floored.',
    math:
      '$p(\\mathbf{x}) = \\sum_{j=1}^{k}\\pi_j\\,\\mathcal{N}(\\mathbf{x}\\mid\\boldsymbol{\\mu}_j,\\boldsymbol{\\Sigma}_j)$ with $\\pi_j\\ge 0$ and $\\sum_j\\pi_j = 1$. Fitting maximizes $\\sum_i\\log\\sum_j\\pi_j\\mathcal{N}(\\mathbf{x}_i\\mid\\boldsymbol{\\mu}_j,\\boldsymbol{\\Sigma}_j)$ — a logarithm of a sum, which is exactly why there is no [[closed-form-solution|closed form]] and why EM exists. Constraining every $\\boldsymbol{\\Sigma}_j = \\sigma^2\\mathbf{I}$ and letting $\\sigma\\to 0$ recovers k-means precisely.',
    teachesAt: 'ch09-dbscan',
    see: ['expectation-maximization', 'soft-clustering', 'k-means', 'density-estimation'],
  },
  {
    id: 'expectation-maximization',
    term: 'expectation maximization',
    simple:
      'A fix for a chicken-and-egg problem. If you knew which cluster made each point you could describe the clusters; if you knew the clusters you could say which made each point. So guess the clusters, work out how much each point belongs to each — that is the E step — then redescribe every cluster using those shares as weights, which is the M step, and go round again.',
    technical:
      'The general recipe for [[maximum-likelihood]] when part of the data is missing; for a [[gaussian-mixture-model|mixture]] the missing part is which component generated each example. **E step**: with the parameters fixed, compute each component’s posterior responsibility for each point. **M step**: with the responsibilities fixed, recompute means, covariances and mixing weights as responsibility-*weighted* averages. It is [[k-means]] with the edges softened — same two alternating steps, a weighted average in place of a plain one over hard assignments. Every round provably raises the likelihood or leaves it flat, so it converges; like k-means, only to a local optimum, so restarts matter.',
    math:
      '**E step**: $\\gamma_{ij} = \\dfrac{\\pi_j\\,\\mathcal{N}(\\mathbf{x}_i\\mid\\boldsymbol{\\mu}_j,\\boldsymbol{\\Sigma}_j)}{\\sum_{l}\\pi_l\\,\\mathcal{N}(\\mathbf{x}_i\\mid\\boldsymbol{\\mu}_l,\\boldsymbol{\\Sigma}_l)}$. **M step**: with $N_j = \\sum_i\\gamma_{ij}$, set $\\boldsymbol{\\mu}_j = \\frac{1}{N_j}\\sum_i\\gamma_{ij}\\mathbf{x}_i$, $\\boldsymbol{\\Sigma}_j = \\frac{1}{N_j}\\sum_i\\gamma_{ij}(\\mathbf{x}_i - \\boldsymbol{\\mu}_j)(\\mathbf{x}_i-\\boldsymbol{\\mu}_j)^{\\top}$ and $\\pi_j = N_j/N$. Each iteration maximizes a lower bound on $\\log p(\\mathcal{X})$ that touches it at the current parameters, so the true log-likelihood never decreases.',
    teachesAt: 'ch09-dbscan',
    see: ['gaussian-mixture-model', 'k-means', 'maximum-likelihood', 'soft-clustering'],
  },
  {
    id: 'gap-statistic',
    term: 'gap statistic',
    simple:
      'Compare the tightness of your clusters against the tightness you would get from data with no structure at all. Scatter points at random over the same region, cluster those too, and keep the number of clusters where your data beats the random data by the widest margin.',
    technical:
      'The elbow heuristic asks a human to spot where the [[inertia]] curve bends; the gap statistic replaces the human with a null model. Generate reference datasets spread uniformly over the data’s bounding box — better, over the box of its [[principal-component|principal components]] — cluster them at each $k$, and measure how far the real log-inertia falls below the reference’s. The gap peaks where genuine structure exists and flattens once you are only splitting noise. It costs $B$ extra clusterings per $k$, and unlike the elbow it can return a defensible $k = 1$, meaning no clusters at all.',
    math:
      '$\\mathrm{Gap}(k) = \\frac{1}{B}\\sum_{b=1}^{B}\\log J_k^{(b)} - \\log J_k$, with $J_k$ the [[inertia]] on the real data and $J_k^{(b)}$ on the $b$-th uniform reference. Choose the smallest $k$ satisfying $\\mathrm{Gap}(k)\\ge\\mathrm{Gap}(k+1) - s_{k+1}$, where $s_{k+1}$ is the standard error across references — a one-standard-error rule that refuses to buy a cluster unless it is clearly worth paying for.',
    statquest: 'k-means clustering elbow plot',
    teachesAt: 'ch09-dbscan',
    see: ['inertia', 'prediction-strength', 'k-means'],
  },
  {
    id: 'dimensionality-reduction',
    term: 'dimensionality reduction',
    simple:
      'Describe each example with fewer numbers while losing as little as possible. A thousand columns become two, and suddenly the data fits on a page a person can look at.',
    technical:
      'Three motives, in decreasing modern importance. Plotting: humans stop at three axes. Interpretability: a simple model over five meaningful directions can be explained, one over a thousand raw ones cannot. Speed, which barely matters now that algorithms shrug at width. Methods split into linear ([[principal-component-analysis|PCA]], which can only rotate and drop axes) and nonlinear ([[umap|UMAP]], t-SNE, [[autoencoder|autoencoders]]). One trap catches everybody once: the reduction must be fitted on the training set alone and then applied to validation and test, or you have leaked.',
    math:
      'A map $g:\\mathbb{R}^{D}\\to\\mathbb{R}^{D_{new}}$ with $D_{new}\\ll D$, chosen to preserve some structure. PCA preserves variance and is linear, $g(\\mathbf{x}) = \\mathbf{W}^{\\top}(\\mathbf{x} - \\bar{\\mathbf{x}})$ with $\\mathbf{W}\\in\\mathbb{R}^{D\\times D_{new}}$ orthonormal. UMAP preserves a fuzzy neighborhood graph and is not a formula at all — the output coordinates themselves are the free parameters of an optimization.',
    statquest: 'PCA dimensionality reduction',
    teachesAt: 'ch09-pca',
    see: ['principal-component-analysis', 'umap', 'bottleneck-layer'],
  },
  {
    id: 'principal-component-analysis',
    term: 'principal component analysis',
    simple:
      'Find the direction in which the cloud of points is most stretched out and make that your new first axis. Find the most stretched direction at right angles to it for the second, and so on. Keep the first two or three and you have a flat picture that still shows most of the spread.',
    technical:
      'PCA rotates the coordinate system onto the axes of greatest variance and then discards the rest. Those axes are not searched for — they are the eigenvectors of the covariance matrix of the mean-centered data, and each [[principal-component|component]]’s eigenvalue is exactly the variance captured along it, so sorting eigenvalues sorts components. Centring is mandatory and scaling usually is: PCA chases raw variance, so a length in millimetres will monopolize the first component over the identical length in metres for no reason worth having. Being linear, it can only rotate and flatten — a curved manifold such as a spiral stays a smear.',
    math:
      'With $\\boldsymbol{\\Sigma} = \\frac{1}{N}\\sum_i(\\mathbf{x}_i - \\bar{\\mathbf{x}})(\\mathbf{x}_i - \\bar{\\mathbf{x}})^{\\top}$, the variance of the projections onto a unit direction $\\mathbf{u}$ is $\\mathbf{u}^{\\top}\\boldsymbol{\\Sigma}\\mathbf{u}$. Maximizing it subject to $\\lVert\\mathbf{u}\\rVert = 1$ gives the stationarity condition $\\boldsymbol{\\Sigma}\\mathbf{u} = \\lambda\\mathbf{u}$ — an eigenvector equation, with $\\mathbf{u}^{\\top}\\boldsymbol{\\Sigma}\\mathbf{u} = \\lambda$. So the top eigenvector is PC1 and its eigenvalue *is* the variance along it. In practice one takes the SVD $\\mathbf{X} = \\mathbf{U}\\mathbf{S}\\mathbf{V}^{\\top}$ and reads the components off $\\mathbf{V}$, which is numerically steadier than forming $\\boldsymbol{\\Sigma}$ at all.',
    statquest: 'principal component analysis PCA',
    teachesAt: 'ch09-pca',
    see: ['principal-component', 'dimensionality-reduction', 'umap'],
  },
  {
    id: 'principal-component',
    term: 'principal component',
    simple:
      'One of the new axes PCA builds: a direction through the cloud, together with a number saying how much of the spread lies along it. The first holds the most, and each later one holds the most of whatever is left.',
    technical:
      'Each component is a unit vector in the original feature space, so its entries are *loadings* — how much each original feature contributes — and that is the source of whatever interpretability PCA offers. Components are mutually orthogonal by construction, so the new features are uncorrelated, which is occasionally the real reason to run PCA at all. How many to keep is read off a scree plot or a cumulative-variance bar, 95% being a common one. Signs are arbitrary: a component and its negation describe the same direction, so never read meaning into which way it points.',
    math:
      'The $j$-th component is the eigenvector $\\mathbf{u}_j$ of $\\boldsymbol{\\Sigma}$ with the $j$-th largest eigenvalue $\\lambda_j$, and the variance it explains is the fraction $\\lambda_j/\\sum_l\\lambda_l$. Projecting gives the score $z_{ij} = \\mathbf{u}_j^{\\top}(\\mathbf{x}_i - \\bar{\\mathbf{x}})$, and truncating to $D_{new}$ components reconstructs $\\hat{\\mathbf{x}}_i = \\bar{\\mathbf{x}} + \\sum_{j\\le D_{new}} z_{ij}\\mathbf{u}_j$ with squared error $\\sum_{j > D_{new}}\\lambda_j$ — the discarded eigenvalues are precisely what you gave up.',
    statquest: 'PCA main ideas',
    teachesAt: 'ch09-pca',
    see: ['principal-component-analysis', 'dimensionality-reduction', 'variance'],
  },
  {
    id: 'umap',
    term: 'UMAP',
    simple:
      'Lay the points out on a flat page so that things which were neighbors in the original space end up neighbors on the page, and things that were far apart stay apart. It is closer to arranging a seating plan than to taking a photograph.',
    technical:
      'Uniform Manifold Approximation and Projection. It builds a weighted neighbor graph in the original space — each point’s edge weights normalized by the distance to its own nearest neighbors, so dense and sparse regions are treated alike — then places low-dimensional points and drags them about by [[gradient-descent]] until their graph matches. Against t-SNE it is faster, keeps more of the global arrangement, and can transform new points without refitting everything. The warnings matter as much as the method: distances *between* clusters on a UMAP plot are only loosely meaningful, cluster sizes are not meaningful at all, and changing the neighbor count changes the picture. Read the output as a sketch to inspect, never as coordinates to model on.',
    math:
      'In the high-dimensional space the directed edge weight is $\\exp\\!\\left(-\\dfrac{\\max\\left(0,\\, d(\\mathbf{x}_i,\\mathbf{x}_j) - \\rho_i\\right)}{\\sigma_i}\\right)$, where $\\rho_i$ is the distance to $i$’s nearest neighbor and $\\sigma_i$ is tuned so the weights of $i$’s edges sum to $\\log_2 k$; the weights are then symmetrized. In the low-dimensional space the weight is $\\left(1 + a\\lVert\\mathbf{y}_i - \\mathbf{y}_j\\rVert^{2b}\\right)^{-1}$, and the layout minimizes the fuzzy-set cross-entropy between the two sets of weights.',
    statquest: 'UMAP',
    teachesAt: 'ch09-pca',
    see: ['dimensionality-reduction', 'principal-component-analysis', 'gradient-descent'],
  },
  {
    id: 'bottleneck-layer',
    term: 'bottleneck layer',
    simple:
      'The narrow waist of a network asked to reproduce its own input. Everything has to squeeze through that gap, so the network is forced to keep only what matters and throw the rest away.',
    technical:
      'The middle layer of an [[autoencoder]], with far fewer units than the input. Because reconstruction must pass through it, its activations become a learned nonlinear low-dimensional code — the neural counterpart of a [[principal-component-analysis|PCA]] projection, and in fact a linear autoencoder under squared loss spans exactly the subspace PCA finds. Its width is the capacity dial: too wide and the network learns the identity map and compresses nothing, too narrow and every reconstruction blurs. It is also what makes autoencoders usable for [[outlier-detection]] — a code trained on typical data has no way to represent an atypical input, so what comes back is wrong.',
    math:
      'For an encoder $g:\\mathbb{R}^{D}\\to\\mathbb{R}^{d}$ and a decoder $h:\\mathbb{R}^{d}\\to\\mathbb{R}^{D}$ with $d\\ll D$, training minimizes $\\frac{1}{N}\\sum_i\\lVert\\mathbf{x}_i - h(g(\\mathbf{x}_i))\\rVert^2$ and the code is $\\mathbf{z}_i = g(\\mathbf{x}_i)$. With $g$ and $h$ linear the optimum makes $h\\circ g$ the rank-$d$ orthogonal projection onto the top-$d$ principal subspace, so the bottleneck buys nothing over PCA until the activations turn nonlinear.',
    teachesAt: 'ch09-pca',
    see: ['autoencoder', 'dimensionality-reduction', 'outlier-detection'],
  },
  {
    id: 'outlier-detection',
    term: 'outlier detection',
    simple:
      'Find the examples that do not look like the others. Not wrong, necessarily — just unusual enough that someone should take a second look: the fraudulent transaction, the failing sensor, the intruder on the network.',
    technical:
      'Always the same two moves — model what typical looks like, then measure how far from typical a given input sits. [[density-estimation|Density]] gives a probability and a natural threshold, an [[autoencoder]]’s reconstruction error scales to images and text, a [[one-class-classification|one-class classifier]] hands you a boundary instead of a score. One distinction is worth keeping straight: outlier detection cleans a dataset you already hold, novelty detection screens new arrivals against a set assumed clean. And with no labels anywhere, evaluation is genuinely awkward — what happens in practice is that a person inspects the top of the ranking and the threshold moves until the inspection stops wasting their time.',
    math:
      'Score, then threshold: flag $\\mathbf{x}$ when $\\hat{f}(\\mathbf{x}) < \\tau$, or when $\\lVert\\mathbf{x} - h(g(\\mathbf{x}))\\rVert^2 > \\tau$, or when a one-class decision function turns negative. $\\tau$ is normally an empirical quantile — assume a contamination rate $\\nu$ and put $\\tau$ at the $\\nu$-th percentile of the training scores, which fixes the [[false-positive-rate|false-alarm rate]] rather than the detection rate.',
    teachesAt: 'ch09-outliers',
    see: ['density-estimation', 'bottleneck-layer', 'one-class-classification'],
  },
];

import type { Concept } from './types';

/**
 * Chapter 11's vocabulary. The chapter itself is a two-page tour, so these
 * cards are the only place the course explains any of these nine ideas — they
 * are written to stand on their own rather than to gloss a paragraph.
 */
export const conceptsCh11: Concept[] = [
  {
    id: 'topic-modeling',
    term: 'topic modeling',
    simple:
      'Hand a computer ten thousand documents nobody has read and ask what they are about. It comes back with a few dozen clusters of words that keep turning up together — one about courts and evidence, one about goals and referees — and says how much of each document belongs to each theme.',
    technical:
      'Unsupervised discovery of themes in a text collection. A topic is not a label but a probability distribution over the vocabulary, and a document is a *mixture* of topics rather than a member of one — which is the right model, because a piece on sports medicine genuinely is part sport and part medicine. The output is descriptive rather than predictive: exploring archives, building navigation, triaging support tickets, and producing a compact feature vector per document. The topic count is yours to choose and topics arrive unnamed, so somebody has to read the top words of each and decide what to call it. [[latent-dirichlet-allocation|LDA]] is the standard method; non-negative matrix factorization is the simpler alternative.',
    math:
      'Given a document-term matrix $\\mathbf{C}\\in\\mathbb{Z}^{M\\times V}$, find $\\mathbf{C}\\approx\\boldsymbol{\\Theta}\\boldsymbol{\\Phi}$ with $\\boldsymbol{\\Theta}\\in\\mathbb{R}^{M\\times K}$ the document-topic mixtures and $\\boldsymbol{\\Phi}\\in\\mathbb{R}^{K\\times V}$ the topic-word distributions, rows of both summing to one. $K$ is far smaller than $V$, so this is [[dimensionality-reduction]] with a probabilistic reading: NMF solves it as an optimization, [[latent-dirichlet-allocation|LDA]] as posterior inference in a generative model.',
    teachesAt: 'ch11-whats-next',
    see: ['latent-dirichlet-allocation', 'clustering', 'dimensionality-reduction'],
  },
  {
    id: 'latent-dirichlet-allocation',
    term: 'latent Dirichlet allocation',
    simple:
      'A story about how documents get written: first pick a mixture of topics for the piece, then, for each word in turn, pick a topic from that mixture and pick a word from that topic’s vocabulary. The algorithm reads the finished documents and reasons backwards to the topics that would have produced them.',
    technical:
      'A generative Bayesian model for [[topic-modeling]]. Each document draws a topic mixture from a Dirichlet [[prior]]; each word draws a topic from that mixture, then a word from that topic’s distribution. The Dirichlet prior is doing real work — set its concentration low and documents are pushed toward a few dominant topics instead of a bland blend of all of them. Inference has no closed form, so it runs by collapsed Gibbs sampling (a [[markov-chain-monte-carlo|Monte Carlo]] method) or by variational approximation. Practical warnings: $K$ is a [[hyperparameter]] with no clean criterion, results shift between runs, and stopword handling matters more than it ought to. Note the acronym clash with linear discriminant analysis, which is an entirely unrelated method.',
    math:
      'For each document $m$, $\\boldsymbol{\\theta}_m\\sim\\mathrm{Dir}(\\alpha)$; for each topic $k$, $\\boldsymbol{\\phi}_k\\sim\\mathrm{Dir}(\\beta)$; for the $n$-th word, $z_{mn}\\sim\\mathrm{Mult}(\\boldsymbol{\\theta}_m)$ and then $w_{mn}\\sim\\mathrm{Mult}(\\boldsymbol{\\phi}_{z_{mn}})$. Collapsed Gibbs sampling integrates $\\boldsymbol{\\theta}$ and $\\boldsymbol{\\phi}$ away and resamples each topic assignment from $\\Pr(z_{mn} = k\\mid\\cdot)\\;\\propto\\;\\left(n_{mk}^{\\neg mn} + \\alpha\\right)\\dfrac{n_{kw}^{\\neg mn} + \\beta}{\\sum_{v}\\left(n_{kv}^{\\neg mn} + \\beta\\right)}$ — how much this document already likes topic $k$, times how much topic $k$ already likes this word.',
    teachesAt: 'ch11-whats-next',
    see: ['topic-modeling', 'markov-chain-monte-carlo', 'prior', 'bag-of-words'],
  },
  {
    id: 'gaussian-process',
    term: 'Gaussian process',
    simple:
      'Instead of fitting one curve through your points, imagine every curve that could pass through them, weighted by how plausible each is. Where the data is dense the curves agree and the prediction is confident; out where there is nothing they fan apart, and the model says so.',
    technical:
      'A distribution over functions rather than a function with parameters. You specify a kernel stating how correlated two outputs should be given how close their inputs are — the [[rbf-kernel|RBF kernel]] is the usual choice, and its length-scale sets how wiggly the plausible functions may be — and conditioning on the training data leaves a posterior that is again Gaussian, so the prediction *and* its uncertainty both come out in closed form. That honest uncertainty is the selling point, and it is what makes GPs the engine inside [[bayesian-optimization]] for hyperparameter search: propose next wherever the mean is high or the uncertainty is. The cost is an $N\\times N$ matrix inverse, so plain GPs stop working somewhere in the low thousands of points.',
    math:
      '$f\\sim\\mathcal{GP}\\!\\left(m(\\mathbf{x}),\\, k(\\mathbf{x},\\mathbf{x}\')\\right)$ means every finite set of inputs has $\\left(f(\\mathbf{x}_1),\\dots,f(\\mathbf{x}_N)\\right)\\sim\\mathcal{N}(\\mathbf{m},\\mathbf{K})$ with $K_{ij} = k(\\mathbf{x}_i,\\mathbf{x}_j)$. Conditioning on observations $\\mathbf{y}$ with noise $\\sigma^2$ gives, at a new $\\mathbf{x}_\\star$, mean $\\mathbf{k}_\\star^{\\top}(\\mathbf{K} + \\sigma^2\\mathbf{I})^{-1}\\mathbf{y}$ and variance $k(\\mathbf{x}_\\star,\\mathbf{x}_\\star) - \\mathbf{k}_\\star^{\\top}(\\mathbf{K}+\\sigma^2\\mathbf{I})^{-1}\\mathbf{k}_\\star$. The mean is a weighted sum of the training targets — [[kernel-regression]] with the weights derived rather than assumed — and the $O(N^3)$ inverse is the bottleneck.',
    teachesAt: 'ch11-whats-next',
    see: ['confidence-interval', 'kernel-regression', 'rbf-kernel', 'bayesian-optimization'],
  },
  {
    id: 'confidence-interval',
    term: 'confidence interval',
    simple:
      'A range instead of a single number, together with a statement about how often that range is right. A prediction of 42 tells you nothing about whether the model is guessing — 42 give or take 1 and 42 give or take 30 are very different claims.',
    technical:
      'Read frequentist, a 95% interval is a property of the *procedure*: repeat the experiment many times and 95% of the intervals it produces will contain the true value. It is not, strictly, a 95% probability that this particular interval contains it — that reading belongs to the Bayesian credible interval, which is what a [[gaussian-process|GP]] posterior actually gives you. Either way the practical use is the same: a wide interval means the model is extrapolating and should not be trusted. Keep two things apart — a confidence interval on a *parameter* and a prediction interval on a *new observation*. The second is always wider, because it must also carry the irreducible noise.',
    math:
      'For a mean with unknown [[variance]], $\\bar{x}\\pm t_{\\alpha/2,\\,N-1}\\,\\frac{s}{\\sqrt{N}}$, which narrows as $\\sqrt{N}$ — halving the width costs four times the data. For a Gaussian posterior with predictive mean $\\mu_\\star$ and variance $\\sigma_\\star^2$, the 95% interval is $\\mu_\\star\\pm 1.96\\,\\sigma_\\star$. When no formula applies, the bootstrap gets there empirically: resample the data with replacement, refit, and read off the 2.5th and 97.5th percentiles of the refits.',
    statquest: 'confidence intervals',
    teachesAt: 'ch11-whats-next',
    see: ['gaussian-process', 'variance', 'standard-deviation'],
  },
  {
    id: 'generalized-linear-model',
    term: 'generalized linear model',
    simple:
      'Linear regression, adapted for targets that are not ordinary numbers. Counts cannot be negative and probabilities have to stay between zero and one, so you keep the straight-line part and pass its output through a function that lands in the right range.',
    technical:
      'Three pieces: a linear predictor, a *link* function bending it onto the target’s natural scale, and a distribution from the exponential family describing the noise. [[logistic-regression]] is the member with a logit link and Bernoulli noise; Poisson regression, with a log link, is the one for counts, where plain [[linear-regression]] would cheerfully predict minus three accidents next month. You reach for a GLM when you want interpretable coefficients — each one is still a fixed effect on the linked scale — and your target is not a plain real number. Every member is fitted by [[maximum-likelihood]] using the same iteratively reweighted least squares routine.',
    math:
      '$g\\!\\left(\\mathbb{E}[y\\mid\\mathbf{x}]\\right) = \\mathbf{w}\\mathbf{x} + b$, where $g$ is the link. Identity link with Gaussian noise gives [[linear-regression]]; the logit $g(\\mu) = \\log\\frac{\\mu}{1-\\mu}$ with Bernoulli noise gives [[logistic-regression]]; a log link with Poisson noise gives $\\mathbb{E}[y] = e^{\\mathbf{w}\\mathbf{x}+b}$, which cannot go negative however extreme $\\mathbf{x}$ becomes. For every canonical link the [[log-likelihood]] is [[convex]] in $\\mathbf{w}$, so fitting has no local optima to worry about.',
    teachesAt: 'ch11-whats-next',
    see: ['linear-regression', 'logistic-regression', 'maximum-likelihood', 'sigmoid'],
  },
  {
    id: 'probabilistic-graphical-model',
    term: 'probabilistic graphical model',
    simple:
      'Draw the variables of your problem as circles and connect the ones that directly influence each other. The picture is the model: it says what depends on what, and every missing edge is a claim that those two things are unrelated once you know the ones in between.',
    technical:
      'A graph whose nodes are [[random-variable|random variables]] and whose edges encode conditional dependence, so the joint distribution factorizes into small local pieces rather than one intractable table. Directed versions are Bayesian networks, also sold as belief networks; undirected ones are Markov random fields, and the [[conditional-random-field|CRF]] from Chapter 7 is one of those. The payoff is that a single model answers questions in any direction — infer any variable from any subset of the others — and missing data is handled natively instead of imputed. The costs: somebody has to supply the structure, and exact inference is exponential in the graph’s treewidth, so real work leans on approximate inference or [[markov-chain-monte-carlo|sampling]].',
    math:
      'A Bayesian network factorizes as $p(x_1,\\dots,x_n) = \\prod_{i} p\\!\\left(x_i\\mid\\mathrm{pa}(x_i)\\right)$, where $\\mathrm{pa}$ names a node’s parents. A binary joint over $n$ variables needs $2^n - 1$ numbers; if no node has more than $m$ parents, the factorization needs $O(n2^{m})$ — that collapse is the entire point. Undirected models factorize over cliques instead, $p(\\mathbf{x}) = \\frac{1}{Z}\\prod_{c}\\psi_c(\\mathbf{x}_c)$, with the partition function $Z$ the usually intractable part.',
    teachesAt: 'ch11-whats-next',
    see: ['random-variable', 'conditional-probability', 'markov-chain-monte-carlo', 'conditional-random-field'],
  },
  {
    id: 'markov-chain-monte-carlo',
    term: 'Markov Chain Monte Carlo',
    simple:
      'A way of drawing samples from a distribution you can score but cannot sample from directly. Take a random walk through the space, preferring steps toward more probable places but sometimes accepting worse ones, and the places you end up visiting are distributed exactly as the target says they should be.',
    technical:
      'The workhorse of Bayesian computation. The posterior you want almost always has an unknown normalizing constant, but the accept/reject rule only ever compares two densities, so the constant cancels and never has to be computed — that single fact is what makes the method possible. Metropolis-Hastings is the general form; Gibbs sampling is the special case that resamples one variable at a time from its conditional, which fits [[probabilistic-graphical-model|graphical models]] perfectly; Hamiltonian Monte Carlo uses gradients to take long informed steps and is what modern tools actually run. The difficulties are all about trust: the chain needs a burn-in before its samples mean anything, consecutive samples are correlated, and no certificate of convergence exists — only diagnostics.',
    math:
      'Build a Markov chain whose stationary distribution is the target $p$. Metropolis-Hastings proposes $\\mathbf{x}\'\\sim q(\\cdot\\mid\\mathbf{x})$ and accepts with probability $\\min\\!\\left(1,\\ \\dfrac{p(\\mathbf{x}\')\\,q(\\mathbf{x}\\mid\\mathbf{x}\')}{p(\\mathbf{x})\\,q(\\mathbf{x}\'\\mid\\mathbf{x})}\\right)$ — note $p$ enters only as a ratio, so any unnormalized $\\tilde{p}\\propto p$ does. Detailed balance $p(\\mathbf{x})T(\\mathbf{x}\\to\\mathbf{x}\') = p(\\mathbf{x}\')T(\\mathbf{x}\'\\to\\mathbf{x})$ is what makes $p$ stationary, and expectations are then estimated by $\\frac{1}{S}\\sum_{s}g(\\mathbf{x}^{(s)})$ over the visited states.',
    teachesAt: 'ch11-whats-next',
    see: ['probabilistic-graphical-model', 'posterior', 'random-variable', 'latent-dirichlet-allocation'],
  },
  {
    id: 'generative-adversarial-network',
    term: 'generative adversarial network',
    simple:
      'Two networks with opposite jobs. One paints forgeries out of random noise; the other is a critic trying to tell forgeries from real photographs. Every time the critic catches a fake the forger learns something, and every time it is fooled the critic learns something.',
    technical:
      'A generator maps noise to samples, a discriminator scores samples as real or fake, and the two are trained against each other in a zero-sum game whose equilibrium has the generator matching the data distribution. The appeal is that no explicit density is ever written down — you get sharp samples without an intractable likelihood, which is how GANs produced the first photorealistic faces. The costs are equally real: training is unstable because the target is a saddle point rather than a minimum, mode collapse (the generator finds one convincing output and repeats it) is common, and there is no reliable number telling you the model is finished. Diffusion models have since taken most of this ground with a far more stable objective.',
    math:
      '$\\min_G\\max_D\\ \\mathbb{E}_{\\mathbf{x}\\sim p_{\\mathrm{data}}}\\left[\\log D(\\mathbf{x})\\right] + \\mathbb{E}_{\\mathbf{z}\\sim p_{\\mathbf{z}}}\\left[\\log\\left(1 - D(G(\\mathbf{z}))\\right)\\right]$. For a fixed $G$ the optimal discriminator is $D^{\\star}(\\mathbf{x}) = \\frac{p_{\\mathrm{data}}(\\mathbf{x})}{p_{\\mathrm{data}}(\\mathbf{x}) + p_G(\\mathbf{x})}$, and substituting it back shows the generator is minimizing the Jensen-Shannon divergence between $p_G$ and $p_{\\mathrm{data}}$ — whose minimum sits exactly at $p_G = p_{\\mathrm{data}}$.',
    teachesAt: 'ch11-whats-next',
    see: ['neural-network', 'autoencoder', 'density-estimation'],
  },
  {
    id: 'genetic-algorithm',
    term: 'genetic algorithm',
    simple:
      'Optimization by breeding. Keep a population of candidate answers, throw away the worst, mix pairs of the survivors to make offspring, jog a few of them at random, and repeat for a few hundred generations.',
    technical:
      'A gradient-free search, and that is the entire reason to use one: it needs only to *score* a candidate, never to differentiate the score. That makes it viable where gradients do not exist — discrete structures, simulator outputs, program code, network architectures, [[hyperparameter]] configurations. Crossover is what distinguishes it from plain [[random-search]]: it bets that good solutions are built from reusable parts worth recombining. What you pay is evaluations, thousands of them where [[gradient-descent]] would want dozens, so it earns its place only when the search space resists everything cheaper — and it brings its own dials (population size, mutation rate, selection pressure) and no convergence guarantee.',
    math:
      'Maintain a population $P_t = \\{\\mathbf{s}_1,\\dots,\\mathbf{s}_M\\}$ scored by a fitness $F(\\mathbf{s})$. Selection draws parents with probability increasing in $F$ — roulette-wheel uses $\\Pr(\\mathbf{s}_i) = F(\\mathbf{s}_i)/\\sum_j F(\\mathbf{s}_j)$; crossover splices two parents at a random cut point; mutation perturbs each coordinate with probability $p_m$. No derivative of $F$ appears anywhere, which is the point, and each generation costs $M$ evaluations rather than one.',
    teachesAt: 'ch11-whats-next',
    see: ['gradient-descent', 'random-search', 'hyperparameter'],
  },
];

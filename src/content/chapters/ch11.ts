import type { Chapter } from '../schema';

/** Chapter 11 — Conclusion (book pp. 132–135), paraphrased in original words. */
export const ch11: Chapter = {
  id: 'ch11',
  number: 11,
  title: 'Conclusion',
  subtitle: 'What comes after the hundredth page',
  pdfPages: [132, 135],
  badgeId: 'ch11',
  sections: [
    {
      id: 'ch11-whats-next',
      title: 'The Hundred-and-First Page',
      minutes: 6,
      blocks: [
        {
          type: 'p',
          md:
            'Look at that — you made it. If you followed most of what these eleven chapters covered, you are genuinely well equipped. (Yes, the book quietly overspent its hundred-page budget; forgive the marketing. Squeezing the margins was the alternative, and nobody deserves to be left alone with the original UMAP paper.) What you now hold is not *everything* — it is the working core: the algorithms and habits that show up in the day-to-day life of a data analyst or ML engineer, distilled from what would otherwise fill a shelf of thousand-page textbooks.',
        },
        {
          type: 'p',
          md:
            'So what would the *thousand-page* version of this book contain? Here is the guided tour of what was deliberately left out — each with the moment you would reach for it. Every name below is a concept you can unfold for a proper explanation, so treat the list as a set of doors rather than a set of labels:',
        },
        {
          type: 'list',
          items: [
            '**[[topic-modeling|Topic modeling]]** ([[latent-dirichlet-allocation|Latent Dirichlet Allocation]]): reach for it when you have a heap of documents nobody has read and no idea what is in them. LDA treats each document as a *mixture* of themes and each theme as a distribution over words, so a piece on sports medicine comes back as part sport and part medicine rather than being forced into one bucket. You get a compact feature vector per document as a bonus.',
            '**[[gaussian-process|Gaussian processes]]**: reach for one when a prediction on its own is not enough and you need to know how much to trust it. A GP returns a mean *and* a **[[confidence-interval|confidence interval]]** that widens wherever the training data thins out — which is exactly what makes it the engine inside [Bayesian hyperparameter search](sec:ch05-tuning). The bill is an $N \\times N$ matrix inverse, so a plain GP runs out of road in the low thousands of examples.',
            '**[[generalized-linear-model|Generalized linear models]]**: reach for one when you want [linear regression](sec:ch03-linear-regression)’s interpretable coefficients but your target is not a plain real number. Counts cannot go negative, probabilities cannot exceed one — so a GLM keeps the linear part and bends its output through a *link function* onto the right scale. [Logistic regression](sec:ch03-logistic-regression) is the family member you already know.',
            '**[[probabilistic-graphical-model|Probabilistic graphical models]]**: reach for one when you know how your variables depend on each other and want that structure stated in the model rather than buried in the weights. Nodes are [[random-variable|random variables]], edges are direct dependencies — “the sidewalk is wet because it rained” — and one such model answers questions in *any* direction, including with half the variables missing. [CRFs](sec:ch07-sequences) were a taste; the family is also sold as Bayesian networks and belief networks.',
            '**[[markov-chain-monte-carlo|Markov Chain Monte Carlo]]**: reach for it when you can *score* how probable a configuration is but cannot draw samples from the distribution directly — the normal situation once a dependency graph defines it. MCMC wanders the space accepting good moves and occasionally bad ones, and the trail it leaves ends up distributed exactly as the target says it should be.',
            '**[[generative-adversarial-network|Generative adversarial networks]]**: reach for one when you want to *produce* convincing data rather than label it. A generator paints from noise, a discriminator tries to catch it out, and the two train against each other until the forgeries stop being catchable. Famously unstable, and largely overtaken by diffusion models — but the adversarial idea turns up all over the field.',
            '**[[genetic-algorithm|Genetic algorithms]]**: reach for one when your objective cannot be differentiated at all — a simulator’s output, a discrete structure, a configuration file. Keep a population of candidates, breed the good ones, mutate a few, repeat. Gradient-free is the entire selling point; the price is thousands of evaluations where [gradient descent](sec:ch04-gradient-descent) would want dozens.',
            '**[[reinforcement-learning|Reinforcement learning]]**: reach for it when the problem is a *sequence* of decisions whose payoff arrives late — game playing, robot navigation, logistics, finance. An agent acts in an environment, collects rewards, and algorithms such as Q-learning turn that experience into a [[policy]]. It is a book of its own.',
          ],
        },
        {
          type: 'hint',
          md:
            'A pattern worth noticing across the whole list: none of these replaces what you already have, and every one of them *relaxes an assumption* this course quietly made on your behalf. GLMs relax the target being a real number. Gaussian processes relax a prediction being a single number. Graphical models relax the features being independent inputs to one function. Genetic algorithms relax the objective being differentiable. Reinforcement learning relaxes the idea that one decision is the whole task. So when a problem refuses to fit the shapes in Chapters 3 to 10, the useful question is not "which fancy method should I try" but "which assumption am I violating" — and the answer usually names the chapter of the thousand-page book you need.',
        },
        {
          type: 'p',
          md:
            'One last thing in the spirit of the book: the field refuses to stand still, so treat this course the way the author treats his wiki — as a living thing you keep returning to. Practice on real data, read greedily, and be generous with what you learn, the same way this book was generously shared on a *read first, pay if it helped* principle. The hundredth page is not an ending; it is the page where you start writing your own.',
        },
        {
          type: 'quiz',
          id: 'ch11-q-next',
          questions: [
            {
              kind: 'match',
              id: 'ch11-q-next-1',
              prompt: 'Match each omitted topic to the problem it solves:',
              pairs: [
                ['Topic modeling (LDA)', 'discover themes in unlabeled document collections'],
                ['Gaussian processes', 'regression with confidence intervals per prediction'],
                ['MCMC', 'sample from a complex, formula-defined distribution'],
                ['Genetic algorithms', 'optimize an objective you cannot differentiate'],
              ],
              explain:
                'Each tool earns its place the moment your problem outgrows this book’s core kit.',
            },
            {
              kind: 'match',
              id: 'ch11-q-next-2',
              prompt: 'Match the rest of the tour to their use cases:',
              pairs: [
                ['Generalized linear models', 'explainable linear-style models for non-standard targets'],
                ['Probabilistic graphical models', 'explicit dependency structure between random variables'],
                ['GANs', 'generate realistic-looking data such as photographs'],
                ['Reinforcement learning', 'sequential decisions maximizing long-term reward'],
              ],
              explain:
                'GLM generalizes regression, PGMs draw the dependency graph, GANs forge, RL acts.',
            },
            {
              kind: 'mcq',
              id: 'ch11-q-next-3',
              prompt: 'How does a GAN learn to generate authentic-looking images?',
              choices: [
                'Two networks compete: one forges images, the other spots fakes',
                'A network memorizes the training photos and replays them with noise',
                'A model clusters the training images and outputs each centroid',
                'Human raters score each generated image and the model retrains',
              ],
              answer: 0,
              explain:
                'The generator and the discriminator play a zero-sum game: the generator is punished when its fake is caught, the discriminator when it is fooled — so each keeps sharpening the other. No human is in the loop, and nothing is memorized or averaged.',
            },
            {
              kind: 'tf',
              id: 'ch11-q-next-4',
              prompt:
                'Genetic algorithms need the gradient of the objective function to search for an optimum.',
              answer: false,
              explain:
                'Their whole appeal is being gradient-free: selection, crossover and mutation over a population — at the price of speed.',
            },
            {
              kind: 'mcq',
              id: 'ch11-q-next-5',
              prompt: 'Reinforcement learning is the natural fit when…',
              choices: [
                'decisions are sequential and rewards arrive late',
                'you have a labeled table and want one prediction per row',
                'you need to visualize high-dimensional data on a flat plot',
                'the rating matrix is sparse and you must fill the gaps',
              ],
              answer: 0,
              explain:
                'An agent, an environment, states, actions, delayed rewards: games, robots, power grids, trading — a story of its own beyond this book.',
            },
          ],
        },
      ],
    },
  ],
  // The final exam covers this chapter — no boss fight (the map hides the button).
  bossPool: [],
};

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
            'So what would the *thousand-page* version of this book contain? Here is the guided tour of what was deliberately left out — and the moment you would reach for each:',
        },
        {
          type: 'list',
          items: [
            '**Topic modeling** (Latent Dirichlet Allocation): you have a pile of unlabeled documents and want to discover the topics running through them — LDA assigns topics to words, and counting a document’s topic-words reveals its themes.',
            '**Gaussian processes**: you want regression that comes with honest **confidence intervals** around every prediction — a principled competitor to kernel regression.',
            '**Generalized linear models**: you want the simplicity and explainability of linear regression, but your target is not a plain real number — GLMs stretch linear regression to many target types (logistic regression is one member of the family).',
            '**Probabilistic graphical models**: your variables depend on each other in an explicit structure — a graph of nodes (random variables) and edges (conditional dependence), like “sidewalk wetness depends on weather”; CRFs from Chapter 7 were a taste. Also sold under the names Bayesian networks and belief networks.',
            '**Markov Chain Monte Carlo**: you must *sample* from a distribution too complex for textbook formulas — e.g. one defined by a dependency graph — where sampling from a normal or uniform no longer cuts it.',
            '**Generative adversarial networks**: you want to *generate* realistic data (photographs, most famously) — two networks play a zero-sum game where one forges images and the other learns to spot the fakes, each sharpening the other.',
            '**Genetic algorithms**: your objective function cannot be differentiated at all — GA evolves a population of candidate solutions through selection, crossover and mutation; slower than gradients, but gradient-free (even usable for tuning hyperparameters).',
            '**Reinforcement learning**: your problem is *sequential* decision-making with long-term rewards — game playing, robot navigation, logistics, finance — where algorithms like Q-learning learn a policy from acting in an environment.',
          ],
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
                'A generator and a discriminator compete: one forges images, the other learns to detect fakes',
                'It memorizes the training photos and replays them',
                'It clusters images and outputs the centroids',
                'A human labels each generated image as good or bad',
              ],
              answer: 0,
              explain:
                'The zero-sum game punishes the generator when its fake is caught and the discriminator when it is fooled — both improve together.',
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
                'decisions are sequential and rewards accumulate over the long run',
                'the dataset is a labeled table of examples',
                'you need to visualize high-dimensional data',
                'the ratings matrix is sparse',
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

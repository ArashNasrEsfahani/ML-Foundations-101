import type { Chapter } from '../schema';

/** Chapter 6 — Neural Networks and Deep Learning (book pp. 62–76), paraphrased in original words. */
export const ch06: Chapter = {
  id: 'ch06',
  number: 6,
  title: 'Neural Networks and Deep Learning',
  subtitle: 'From one neuron to CNNs and RNNs',
  pdfPages: [62, 76],
  badgeId: 'ch06',
  sections: [
    {
      id: 'ch06-neural-networks',
      title: 'A Network Is a Nested Function',
      minutes: 7,
      blocks: [
        {
          type: 'p',
          md:
            'Surprise: you already know a neural network. **Logistic regression is one** — a single unit that weighs its inputs, adds a bias, and squashes the result. A neural network just does that trick *repeatedly*: it is a mathematical function built by **nesting** simpler functions. For a three-layer network that returns one number:',
        },
        {
          type: 'math',
          tex: 'y = f_{NN}(\\mathbf{x}) = f_3(f_2(f_1(\\mathbf{x})))',
        },
        {
          type: 'p',
          md:
            'Each **layer** $f_l$ has exactly the same anatomy: a linear transformation followed by a fixed nonlinear function, the **activation**:',
        },
        {
          type: 'formula',
          tex: 'f_l(\\mathbf{z}) = g_l(\\mathbf{W}_l\\mathbf{z} + \\mathbf{b}_l)',
          parts: [
            { tex: 'f_l(\\mathbf{z})', label: 'what this layer passes onward' },
            { tex: '=' },
            { tex: 'g_l\\big(', label: 'a bend applied at the very end' },
            { tex: '\\mathbf{W}_l\\mathbf{z}', label: 'every incoming number, weighted and mixed' },
            { tex: '+' },
            { tex: '\\mathbf{b}_l', label: 'plus each unit’s own offset' },
            { tex: '\\big)' },
          ],
          terms: [
            {
              tex: '\\mathbf{z}',
              explain: 'the vector arriving from the previous layer — or the raw input x for the first layer',
            },
            {
              tex: '\\mathbf{W}_l',
              explain:
                'a matrix of weights: one row per unit of the layer, each row a little linear model of its own; learned from data',
            },
            { tex: '\\mathbf{b}_l', explain: 'one bias number per unit, collected in a vector; also learned' },
            {
              tex: 'g_l',
              explain: 'the activation function — a fixed, usually nonlinear function chosen before training starts',
            },
            {
              tex: 'f_l(\\mathbf{z})',
              explain: 'the layer output: one activated number per unit, stacked into a vector for the next layer',
            },
          ],
        },
        {
          type: 'p',
          md:
            'Why a matrix $\\mathbf{W}_l$ and not a single weight vector? Because a layer holds many **units**, and each unit $u$ owns one row $\\mathbf{w}_{l,u}$: it computes $\\mathbf{w}_{l,u}\\mathbf{z} + b_{l,u}$ and passes the result through $g_l$. In a **multilayer perceptron** (the “vanilla” network) every unit receives *all* outputs of the previous layer — such layers are called **fully-connected**. The last layer usually has one unit: give it a linear activation and you have a regression model; give it the logistic (sigmoid) function and you have a binary classifier.',
        },
        {
          type: 'p',
          md:
            'The nonlinearity is not decoration — it is the whole point. $\\mathbf{W}_l\\mathbf{z} + \\mathbf{b}_l$ is a linear function, and a linear function of a linear function is *still linear*. Strip the activations out and a 50-layer tower collapses into one straight-line model that no amount of depth can save. The activations are what let the network bend.',
        },
        {
          type: 'p',
          md: 'Three activations cover most of practice — you will meet them constantly:',
        },
        {
          type: 'math',
          tex:
            '\\mathrm{relu}(z)=\\begin{cases}0 & \\text{if } z<0\\\\ z & \\text{otherwise}\\end{cases}\\qquad \\tanh(z)=\\frac{e^{z}-e^{-z}}{e^{z}+e^{-z}}',
        },
        {
          type: 'list',
          items: [
            '**ReLU** — zero for negative inputs, identity for positive ones; cheap and the default for hidden layers.',
            '**tanh** — an S-curve squashing any number into $(-1, 1)$.',
            '**sigmoid** (logistic) — the same S-shape squashed into $(0, 1)$; handy as an output that reads like a probability.',
          ],
        },
        {
          type: 'hint',
          md:
            'Activations must be differentiable (at least almost everywhere) — gradient descent needs their derivatives to learn $\\mathbf{W}_l$ and $\\mathbf{b}_l$.',
        },
        {
          type: 'quiz',
          id: 'ch06-q-nn',
          questions: [
            {
              kind: 'mcq',
              id: 'ch06-q-nn-1',
              prompt: 'A 10-layer network whose activations are all removed (pure $\\mathbf{W}\\mathbf{z}+\\mathbf{b}$ layers) computes…',
              choices: [
                'a single linear function, whatever the number of layers',
                'a piecewise function with one linear piece per hidden layer',
                'nothing at all — the layers cancel and the output is zero',
                'a nonlinear function, since depth itself supplies curvature',
              ],
              answer: 0,
              explain:
                'Linear ∘ linear = linear. Composing linear maps just multiplies the matrices into one matrix and the biases into one bias — the whole tower collapses to a single $\\mathbf{W}\\mathbf{z}+\\mathbf{b}$. Nothing cancels, and nothing bends: the nonlinear activations are what give depth its power.',
            },
            {
              kind: 'numeric',
              id: 'ch06-q-nn-2',
              prompt: 'Compute $\\mathrm{relu}(-3)$.',
              answer: 0,
              tolerance: 0,
              explain: 'ReLU maps every negative input to 0 and leaves positive inputs unchanged: relu(−3) = 0, relu(3) = 3.',
            },
            {
              kind: 'tf',
              id: 'ch06-q-nn-3',
              prompt:
                'In a fully-connected layer, every unit receives the outputs of *all* units of the previous layer as its inputs.',
              answer: true,
              explain:
                'That is the definition of fully-connected — and why the weights form a matrix: one full row of weights per unit.',
            },
            {
              kind: 'mcq',
              id: 'ch06-q-nn-4',
              prompt: 'To turn an MLP into a *binary classifier*, the natural activation for its single output unit is…',
              choices: [
                'the sigmoid (logistic) function',
                'a linear activation with no squashing',
                'the ReLU used in hidden layers',
                'no activation function at all',
              ],
              answer: 0,
              explain:
                'Sigmoid squashes the output into $(0, 1)$, readable as the probability of the positive class. A linear output — which is what “no activation” amounts to — makes it a regression model instead, and ReLU would let the output run to $+\\infty$ while pinning every negative score to a flat 0.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch06-tinynet',
      title: 'Training: Watch a Boundary Form',
      minutes: 8,
      blocks: [
        {
          type: 'p',
          md:
            'Where do all those weights and biases come from? The same place as in linear and logistic regression: pick a cost function that measures how wrong the outputs are, then run **gradient descent** on every parameter at once. The only news is bookkeeping — a network has parameters spread across layers, and **backpropagation** is the efficient way to get all their gradients: apply the **chain rule** starting from the output error and pass the blame backwards, layer by layer. Backprop computes gradients; gradient descent spends them.',
        },
        {
          type: 'p',
          md:
            'Here is the beautiful part. Each hidden unit is a tiny logistic-style model that learns to draw *one soft line* through the input plane — a **learned feature detector** that answers a yes-ish/no-ish question like “are we in the upper-left?”. The output unit never sees your raw features; it sees the hidden units’ answers and combines them. XOR-shaped data cannot be split by any single line, but *two* lines combined do it easily — which is exactly why the hidden layer is not optional there.',
        },
        {
          type: 'p',
          md:
            'Hidden-layer width is **capacity**. Two units can carve at most a couple of creases into the boundary; eight units can bend it into rings and spirals. Too little capacity underfits (the spiral defeats a 3-unit net no matter how long you train); too much capacity plus noisy data invites the overfitting you met in Chapter 5. Watch the loss sparkline too — descent sometimes stalls on a plateau before it finds the drop.',
        },
        {
          type: 'widget',
          id: 'TinyNetLab',
          challenge: {
            id: 'ch06-challenge-tinynet',
            label: 'train to 95%+ accuracy on XOR',
            xp: 15,
          },
        },
        {
          type: 'hint',
          md:
            'Stuck near 50% on XOR? Gradient descent started in an unlucky spot and stalled. Hit reset — it re-rolls the starting weights — and try again, or add a hidden unit. Real practitioners restart from new initializations all the time.',
        },
        {
          type: 'quiz',
          id: 'ch06-q-tinynet',
          questions: [
            {
              kind: 'mcq',
              id: 'ch06-q-tinynet-1',
              prompt: 'Backpropagation is best described as…',
              choices: [
                'a chain-rule scheme for computing every parameter’s gradient',
                'a way to run the network backwards and reconstruct its inputs',
                'a rule for choosing how many hidden units a layer should have',
                'a second optimizer that refines the weights after gradient descent',
              ],
              answer: 0,
              explain:
                'Backprop is “just” the chain rule, organized cleverly: the output error flows backwards and each layer reuses the work of the layer after it, so one sweep yields the gradient of the cost with respect to *every* parameter. It computes gradients; it never updates anything — gradient descent spends them. Layer widths remain your choice.',
            },
            {
              kind: 'tf',
              id: 'ch06-q-tinynet-2',
              prompt: 'A network with no hidden layer (plain logistic regression) can learn to classify XOR-arranged data perfectly.',
              answer: false,
              explain:
                'One unit draws one line, and no single straight line separates opposite quadrants. Hidden units supply the extra lines whose combination solves it.',
            },
            {
              kind: 'mcq',
              id: 'ch06-q-tinynet-3',
              prompt: 'In the lab, moving the hidden-units slider from 2 up to 8 mainly…',
              choices: [
                'raises capacity, letting the boundary bend in more places',
                'makes every epoch take a proportionally larger weight step',
                'raises the number of input features the network reads',
                'guarantees the run converges to 100% training accuracy',
              ],
              answer: 0,
              explain:
                'More hidden units = more learned line-detectors to combine = a more flexible boundary. Step size is the learning rate’s job, the input dimension is fixed by your data, and extra capacity buys flexibility rather than a convergence guarantee — an unlucky initialization can still stall.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch06-cnn',
      title: 'Convolutions: Networks That Slide',
      minutes: 8,
      blocks: [
        {
          type: 'p',
          md:
            'Try to feed an image to an MLP and the arithmetic turns ugly. Every pixel is a feature, so a modest 100×100 photo is a 10,000-dimensional input; bolt on a layer of $size_l$ units after a layer of $size_{l-1}$ and you add $(size_{l-1}+1)\\cdot size_l$ parameters — a single 1000-unit layer can cost over a million. Optimizing that is slow, hungry, and usually unnecessary.',
        },
        {
          type: 'p',
          md:
            'Unnecessary because images have **local structure**: neighboring pixels usually describe the same thing — sky, fur, brick — and the interesting exceptions are the **edges**, where two things touch. So instead of wiring every pixel to every unit, train a *small* pattern detector on a little square patch and **slide it across the whole image** like a moving window. One detector, reused everywhere.',
        },
        {
          type: 'p',
          md:
            'The detector is a small matrix $\\mathbf{F}$ called a **filter** (or kernel), say 3×3. At each window position you take the patch $\\mathbf{P}$ under the window and compute the **convolution** — a moving dot product:',
        },
        {
          type: 'formula',
          tex: '\\mathrm{conv}(\\mathbf{P},\\mathbf{F}) = \\sum_{i}\\sum_{j} P_{i,j}\\,F_{i,j}',
          parts: [
            { tex: '\\mathrm{conv}(\\mathbf{P},\\mathbf{F})', label: 'one number for this patch' },
            { tex: '=' },
            { tex: '\\sum_{i}\\sum_{j}', label: 'add over every cell of the window' },
            { tex: 'P_{i,j}\\,F_{i,j}', label: 'pixel times the filter weight sitting on it' },
          ],
          terms: [
            { tex: '\\mathbf{P}', explain: 'the patch of pixels currently under the sliding window' },
            {
              tex: '\\mathbf{F}',
              explain: 'the filter: a small matrix of weights, learned by backprop just like any other parameters',
            },
            {
              tex: 'P_{i,j}\\,F_{i,j}',
              explain: 'cell-by-cell products: each filter weight multiplied by the pixel it currently sits on',
            },
            {
              tex: '\\sum_i\\sum_j',
              explain:
                'add all nine products into one number — large when the patch resembles the pattern stored in the filter',
            },
          ],
        },
        {
          type: 'p',
          md:
            'The sum is big exactly when the patch *looks like* the filter — positive filter weights sitting on bright pixels, near-zero weights on the rest. Add a bias, apply a nonlinearity (usually ReLU), and the values collected across all window positions form a **feature map**: a picture of where the pattern lives. A convolution layer holds many filters, each producing its own map — and crucially the filters are **learned**, not hand-designed; the presets in the widget below are just intuition pumps.',
        },
        {
          type: 'p',
          md:
            'Two knobs control the sliding. **Stride** is the step size of the window — stride 2 skips every other position, so the output map shrinks. **Padding** surrounds the image with a ring of zeros so the filter can properly scan the borders, making the output bigger. And after convolving, CNNs often apply **pooling**: slide a small window that keeps only the max (or average) of each block. Pooling has *nothing to learn* — it is a fixed operator that shrinks the map and makes detection a bit more tolerant of small shifts.',
        },
        {
          type: 'p',
          md:
            'Stack these layers and magic compounds: the second layer convolves the whole *stack* of first-layer feature maps (a **volume**), detecting patterns *of patterns* — edges become corners, corners become eyes, eyes become faces. That is how CNNs read images with a fraction of an MLP’s parameters: small filters, reused at every position.',
        },
        {
          type: 'widget',
          id: 'ConvScrubber',
          challenge: {
            id: 'ch06-challenge-conv',
            label: 'find the filter that detects vertical edges',
            xp: 15,
          },
        },
        {
          type: 'quiz',
          id: 'ch06-q-cnn',
          questions: [
            {
              kind: 'mcq',
              id: 'ch06-q-cnn-1',
              prompt: 'The main reason a CNN needs far fewer parameters than a fully-connected network on images is…',
              choices: [
                'one small filter’s weights are reused at every image position',
                'CNNs downsample images before the first layer ever sees them',
                'convolution layers carry no weights, only fixed pooling rules',
                'CNNs drop the nonlinear activations, halving the parameter count',
              ],
              answer: 0,
              explain:
                'Weight sharing: a 3×3 filter costs 9 weights however large the image is, because the same detector slides everywhere, while an MLP pays for every pixel-to-unit wire. Filters are very much learned parameters, and CNNs keep their activations (usually ReLU) — it is *pooling*, not convolution, that has nothing to learn.',
            },
            {
              kind: 'numeric',
              id: 'ch06-q-cnn-2',
              prompt:
                'A 3×3 filter slides over a 10×10 image with stride 1 and no padding. How many positions fit along one side (i.e., the side length of the output map)?',
              answer: 8,
              tolerance: 0,
              explain: 'The window’s left edge can start at columns 1 through 8: $10 - 3 + 1 = 8$, giving an 8×8 feature map.',
            },
            {
              kind: 'mcq',
              id: 'ch06-q-cnn-3',
              prompt: 'Increasing the stride from 1 to 2 makes the output feature map…',
              choices: [
                'smaller — the window stops at fewer positions',
                'larger — each step covers more of the image',
                'identical in size — stride does not affect it',
                'noisier — every second pixel is set to zero',
              ],
              answer: 0,
              explain:
                'Stride is the step size of the moving window; bigger steps mean fewer stops, hence a smaller map. Nothing is zeroed — the skipped positions are simply never evaluated. Padding is the knob that pushes the output size back up.',
            },
            {
              kind: 'tf',
              id: 'ch06-q-cnn-4',
              prompt: 'A max-pooling layer contains trainable parameters that gradient descent must optimize.',
              answer: false,
              explain:
                'Pooling is a fixed operator — take the max (or average) of each block. It has hyperparameters (window size, stride) but nothing to learn.',
            },
          ],
        },
      ],
    },
    {
      id: 'ch06-rnn',
      title: 'Networks with Memory',
      minutes: 7,
      blocks: [
        {
          type: 'p',
          md:
            'Sentences, audio, price histories — some data comes as a **sequence**: a matrix whose rows are feature vectors and whose *row order matters*. You might want a label for every element, one class for the whole sequence, or a brand-new output sequence. Feed-forward networks are stuck here: they gulp a fixed-size vector in one bite. **Recurrent neural networks** (RNNs) instead read the sequence one timestep at a time.',
        },
        {
          type: 'p',
          md:
            'The trick is a loop. Each recurrent unit keeps a running **state** $\\mathbf{h}$ — its memory. At timestep $t$ the unit combines the current input $\\mathbf{x}^t$ with its *own state from the previous step*, and the very same parameters are reused at every timestep — **shared weights across time**:',
        },
        {
          type: 'formula',
          tex: '\\mathbf{h}^{t} = g\\left(\\mathbf{W}\\mathbf{x}^{t} + \\mathbf{U}\\mathbf{h}^{t-1} + \\mathbf{b}\\right)',
          parts: [
            { tex: '\\mathbf{h}^{t}', label: 'the memory after step t' },
            { tex: '=' },
            { tex: 'g\\big(' },
            { tex: '\\mathbf{W}\\mathbf{x}^{t}', label: 'what just arrived' },
            { tex: '+' },
            { tex: '\\mathbf{U}\\mathbf{h}^{t-1}', label: 'what it already remembered' },
            { tex: '+' },
            { tex: '\\mathbf{b}\\big)', label: 'an offset, then squashed' },
          ],
          terms: [
            { tex: '\\mathbf{x}^{t}', explain: 'the sequence element at position t — say, the word at position t of a sentence' },
            {
              tex: '\\mathbf{h}^{t-1}',
              explain: 'the state after the previous step: everything the unit remembers about the sequence so far',
            },
            { tex: '\\mathbf{W}', explain: 'weights for the fresh input — the same matrix at every timestep' },
            { tex: '\\mathbf{U}', explain: 'weights for the old state — also shared across all timesteps' },
            { tex: '\\mathbf{h}^{t}', explain: 'the updated memory, handed to the next timestep (and used for predictions)' },
          ],
        },
        {
          type: 'p',
          md:
            'To train this with backprop you **unroll** it: draw one copy of the unit per timestep, wired in a chain, all copies sharing the same $\\mathbf{W}, \\mathbf{U}, \\mathbf{b}$ — then run the chain rule through the whole thing (**backpropagation through time**). Now the catch: the longer the sequence, the *deeper* the unrolled network. With tanh-style activations each step multiplies the gradient by numbers smaller than one, so gradients from early timesteps shrink exponentially — the **vanishing gradient** problem. In practice the network “forgets” the start of long sequences: the cause–effect link between distant words gets lost.',
        },
        {
          type: 'p',
          md:
            'The practical fix is **gated units** — the **LSTM** (long short-term memory) and the **GRU** (gated recurrent unit). They add *gates*: little sigmoid valves in $(0,1)$, themselves learned from data, that decide when to write into a memory cell, when to keep it untouched, and when to erase it. A cell that holds its value acts like the identity function — derivative 1 — so the gradient can travel across many timesteps without dying. That single idea is why gated RNNs became the workhorses for text and speech. (Bi-directional RNNs, attention, and sequence-to-sequence models extend the family — a story for another day.)',
        },
        {
          type: 'quiz',
          id: 'ch06-q-rnn',
          questions: [
            {
              kind: 'order',
              id: 'ch06-q-rnn-1',
              prompt: 'Put the steps of an RNN processing the 3-token sequence “the → cat → sat” in order:',
              items: [
                'Initialize the state $\\mathbf{h}^0$ (e.g. to zeros)',
                'Combine token 1 with $\\mathbf{h}^0$ to produce state $\\mathbf{h}^1$',
                'Combine token 2 with $\\mathbf{h}^1$ to produce state $\\mathbf{h}^2$',
                'Combine token 3 with $\\mathbf{h}^2$ to produce state $\\mathbf{h}^3$',
                'Read the prediction from the final state $\\mathbf{h}^3$',
              ],
              explain:
                'One timestep per token, each folding the new input into the running memory with the *same* weights — the final state summarizes the whole sequence.',
            },
            {
              kind: 'tf',
              id: 'ch06-q-rnn-2',
              prompt: 'An RNN learns a different weight matrix for each timestep of the sequence.',
              answer: false,
              explain:
                'The same $\\mathbf{W}$, $\\mathbf{U}$ and $\\mathbf{b}$ are reused at every step — that sharing is what lets one RNN handle sequences of any length.',
            },
            {
              kind: 'mcq',
              id: 'ch06-q-rnn-3',
              prompt: 'Why do plain RNNs struggle to connect the first word of a long sentence to the last?',
              choices: [
                'repeated small derivatives shrink the earliest gradients toward zero',
                'the state vector eventually runs out of room to store more tokens',
                'the weight matrices are relearned from scratch at every timestep',
                'backprop cannot be applied to a network that contains a loop',
              ],
              answer: 0,
              explain:
                'Unrolling turns a long sequence into a very deep network, and backprop through time multiplies one sub-1 factor per step; over many steps the product vanishes, so early inputs barely influence learning — and get “forgotten”. The state is a fixed-size vector that overwrites rather than fills up, the weights are shared across time, and unrolling is exactly what makes the loop differentiable.',
            },
            {
              kind: 'mcq',
              id: 'ch06-q-rnn-4',
              prompt: 'The gates in an LSTM or GRU learn to control…',
              choices: [
                'when the memory cell is written, kept, or erased',
                'how fast gradient descent adjusts the shared weights',
                'how many timesteps the network unrolls the input into',
                'which activation function each recurrent layer uses',
              ],
              answer: 0,
              explain:
                'Gates are learned sigmoid valves in (0, 1). A cell that is “kept” passes its value through unchanged — identity, derivative 1 — which is exactly what lets gradients survive long spans.',
            },
          ],
        },
      ],
    },
  ],
  bossPool: [
    {
      kind: 'mcq',
      id: 'ch06-boss-1',
      prompt: 'A three-layer neural network computing a scalar output is, as a function, …',
      choices: [
        'a nested composition: $y = f_3(f_2(f_1(\\mathbf{x})))$',
        'a sum of three models: $f_1 + f_2 + f_3$',
        'three models voting by majority',
        'a table of three lookups',
      ],
      answer: 0,
      explain:
        'Layers compose rather than add or vote: each layer’s output vector becomes the next layer’s input. That nesting is the defining shape of a feed-forward network.',
    },
    {
      kind: 'mcq',
      id: 'ch06-boss-2',
      prompt: 'Inside one layer, $f_l(\\mathbf{z}) = g_l(\\mathbf{W}_l\\mathbf{z} + \\mathbf{b}_l)$. The role of $g_l$ is to…',
      choices: [
        'apply a fixed nonlinearity so the network can bend',
        'rescale the layer’s outputs to zero mean and unit variance',
        'decide which of the layer’s units are switched off',
        'compute the gradient of the cost for this layer’s weights',
      ],
      answer: 0,
      explain:
        'The activation is chosen before training and stays fixed; the learnable parts are $\\mathbf{W}_l$ and $\\mathbf{b}_l$. Without it, stacking layers would buy nothing. Rescaling is batch normalization’s job, switching units off is dropout’s, and gradients come from backpropagation — three separate pieces of machinery.',
    },
    {
      kind: 'tf',
      id: 'ch06-boss-3',
      prompt: 'Without nonlinear activations, adding more layers gives a network no extra expressive power.',
      answer: true,
      explain: 'A linear function of a linear function is linear — the whole stack collapses into a single matrix multiply plus bias.',
    },
    {
      kind: 'match',
      id: 'ch06-boss-4',
      prompt: 'Match each activation function to its behavior:',
      pairs: [
        ['ReLU', 'zero for negative inputs, identity for positive ones'],
        ['tanh', 'S-curve squashing values into $(-1, 1)$'],
        ['sigmoid', 'S-curve squashing values into $(0, 1)$'],
      ],
      explain: 'ReLU clips negatives to 0; tanh and sigmoid are S-shaped squashers differing in output range — tanh is centered on 0, sigmoid on 0.5.',
    },
    {
      kind: 'numeric',
      id: 'ch06-boss-5',
      prompt:
        'Count the parameters of an MLP with 2 inputs, one hidden layer of 3 units, and 1 output unit — weights *and* biases.',
      answer: 13,
      tolerance: 0,
      explain: 'Hidden: 3 units × 2 weights + 3 biases = 9. Output: 3 weights + 1 bias = 4. Total 9 + 4 = 13.',
    },
    {
      kind: 'mcq',
      id: 'ch06-boss-6',
      prompt: 'A layer is called *fully-connected* when…',
      choices: [
        'each of its units receives every output of the previous layer',
        'it is wired directly to both the input and the output layer',
        'every one of its weights has been trained to a nonzero value',
        'it holds the largest number of units allowed in the network',
      ],
      answer: 0,
      explain:
        'Full connectivity is about the wiring pattern between *consecutive* layers — every output feeds every unit — not about where the layer sits, how wide it is, or what its trained weights happen to be. CNNs exist precisely to relax this wiring.',
    },
    {
      kind: 'mcq',
      id: 'ch06-boss-7',
      prompt: 'A network ends in a single output unit with a *linear* activation. It is a…',
      choices: ['regression model', 'binary classifier', 'clustering model', 'convolutional filter'],
      answer: 0,
      explain: 'The last activation decides the task: linear output → regression; logistic output → binary classification.',
    },
    {
      kind: 'mcq',
      id: 'ch06-boss-8',
      prompt: 'Backpropagation earns its keep by…',
      choices: [
        'computing all parameter gradients with one chain-rule sweep',
        'pushing training examples backwards through the dataset order',
        'pruning away the layers that contribute least to the output',
        'replacing gradient descent with an exact closed-form solution',
      ],
      answer: 0,
      explain:
        'It is the chain rule organized layer by layer, reusing intermediate results so that one backward pass yields every gradient — those then feed ordinary gradient descent, which backprop complements rather than replaces. Nothing is pruned and no examples move.',
    },
    {
      kind: 'mcq',
      id: 'ch06-boss-9',
      prompt: 'Today, the term “deep learning” refers to…',
      choices: [
        'training neural networks with the modern toolkit, depth aside',
        'training only networks that have at least ten hidden layers',
        'training convolutional networks, and nothing else besides',
        'training networks without labels, in a purely unsupervised way',
      ],
      answer: 0,
      explain:
        'Since the vanishing/exploding gradient problems were largely tamed, “deep learning” names the modern toolkit; many business problems use just 2–3 hidden layers.',
    },
    {
      kind: 'tf',
      id: 'ch06-boss-10',
      prompt: 'Exploding gradients turned out easier to handle (e.g. gradient clipping, L1/L2 regularization) than vanishing gradients.',
      answer: true,
      explain: 'Clipping caps oversized updates directly. Vanishing gradients resisted for decades until ReLU, gated units and skip connections arrived.',
    },
    {
      kind: 'mcq',
      id: 'ch06-boss-11',
      prompt: 'Which trio of ideas helped make very deep networks trainable?',
      choices: [
        'ReLU activations, gated units, and residual skip connections',
        'larger images, more output classes, and much longer training',
        'decision trees, kernel tricks, and maximum-margin boundaries',
        'bag of words, one-hot encoding, and min-max normalization',
      ],
      answer: 0,
      explain:
        'Each attacks the vanishing gradient from a different side: ReLU avoids tiny derivatives, gates preserve memory across timesteps, skip connections shorten gradient paths. Scaling up the data or the training run does not touch the gradient itself, and the other two lists belong to classical ML and feature engineering.',
    },
    {
      kind: 'numeric',
      id: 'ch06-boss-12',
      prompt:
        'Convolve the patch $\\mathbf{P}=\\begin{bmatrix}1&0&1\\\\0&1&0\\\\1&0&1\\end{bmatrix}$ with the filter $\\mathbf{F}=\\begin{bmatrix}2&1&0\\\\1&3&1\\\\0&1&2\\end{bmatrix}$ (multiply cell by cell, then sum).',
      answer: 7,
      tolerance: 0,
      explain: 'Only cells where P has a 1 contribute: 2 (top-left) + 0 (top-right) + 3 (center) + 0 (bottom-left) + 2 (bottom-right) = 7.',
    },
    {
      kind: 'mcq',
      id: 'ch06-boss-13',
      prompt: 'The convolution of a patch with a filter produces a *large* value when…',
      choices: [
        'the patch’s pattern resembles the one stored in the filter',
        'the patch is mostly zeros and the filter is mostly ones',
        'the filter covers a larger area than the patch beneath it',
        'the stride is raised so the window visits fewer positions',
      ],
      answer: 0,
      explain:
        'It is a dot product: big when large filter weights line up with bright pixels. That is what makes a filter a pattern detector. Zeros contribute nothing to the sum, the filter and patch are the same size by construction, and stride changes *where* the window stops, not what any one convolution returns.',
    },
    {
      kind: 'match',
      id: 'ch06-boss-14',
      prompt: 'Match each CNN ingredient to what it does:',
      pairs: [
        ['filter (kernel)', 'a small learned pattern matrix slid across the image'],
        ['stride', 'the step size of the moving window'],
        ['padding', 'a ring of zeros added around the image'],
        ['pooling', 'a fixed max/average that shrinks the map, learns nothing'],
      ],
      explain: 'Filter = what to look for; stride = how the window moves; padding = room to scan the borders; pooling = fixed downsizing for robustness.',
    },
    {
      kind: 'tf',
      id: 'ch06-boss-15',
      prompt: 'With a bigger stride the output feature map gets smaller, while more padding makes it bigger.',
      answer: true,
      explain: 'Stride skips window positions (fewer outputs); padding adds fake border cells (more positions). They pull the output size in opposite directions.',
    },
    {
      kind: 'mcq',
      id: 'ch06-boss-16',
      prompt: 'When one convolution layer follows another, the second layer receives…',
      choices: [
        'the whole stack of first-layer feature maps — a volume',
        'only the single feature map with the strongest response',
        'the raw image again, alongside the first layer’s output',
        'the transposed filters of the first layer, not its maps',
      ],
      answer: 0,
      explain:
        'Layer $l$ outputs one map per filter; layer $l+1$ treats that stack as a volume and convolves through its whole depth. Nothing is discarded and the raw image is not re-supplied — this is how “patterns of patterns” (corners, textures, objects) emerge.',
    },
    {
      kind: 'mcq',
      id: 'ch06-boss-17',
      prompt: 'What makes a recurrent network different from a feed-forward one?',
      choices: [
        'its units keep a state that is fed back in at the next step',
        'it stacks many more hidden layers between input and output',
        'it accepts images rather than fixed-length feature vectors',
        'it is trained without gradient descent or backpropagation',
      ],
      answer: 0,
      explain:
        'The state vector is the unit’s memory of everything read so far; feeding it back is the loop that “recurrent” refers to. Depth is not the distinction — an RNN can be one layer deep — images are the CNN’s specialty, and RNNs are trained by gradient descent like everything else, via backpropagation through time.',
    },
    {
      kind: 'order',
      id: 'ch06-boss-18',
      prompt: 'Order the computation inside a single feed-forward unit:',
      items: [
        'Collect the previous layer’s outputs into an input vector',
        'Multiply by the unit’s weights and add its bias',
        'Apply the activation function to the result',
        'Send the activated value to every unit of the next layer',
      ],
      explain: 'Gather → linear step (wz + b) → nonlinearity → pass it on. Every unit in an MLP runs this same little pipeline.',
    },
    {
      kind: 'mcq',
      id: 'ch06-boss-19',
      prompt: 'Backpropagation *through time* makes the vanishing-gradient problem worse for RNNs because…',
      choices: [
        'longer sequences unroll into deeper chains of small derivatives',
        'RNN units carry no bias term that could stabilize the gradient',
        'the state vector grows longer with every extra timestep read',
        'sequences of varying length cannot be differentiated at all',
      ],
      answer: 0,
      explain:
        'Each timestep is one more layer in the unrolled chain — a 100-word sentence means a 100-deep gradient path of sub-1 factors, whose product collapses toward zero. RNNs do have a bias $\\mathbf{b}$, the state $\\mathbf{h}$ keeps a fixed size no matter how long the sequence, and unrolling makes the whole thing perfectly differentiable.',
    },
    {
      kind: 'mcq',
      id: 'ch06-boss-20',
      prompt: 'Gated units (LSTM, GRU) keep gradients alive over long sequences because…',
      choices: [
        'a cell kept unchanged acts like the identity function',
        'they run gradient descent with a much larger learning rate',
        'they skip backpropagation and update the gates directly',
        'their gates delete the oldest timesteps before unrolling',
      ],
      answer: 0,
      explain:
        'Storing a value untouched is applying $f(x) = x$; its derivative is 1, so the gradient passes through those timesteps without shrinking. Gated units are trained by ordinary backpropagation through time at ordinary learning rates — and their gates *preserve* distant history rather than discarding it.',
    },
    {
      kind: 'tf',
      id: 'ch06-boss-21',
      prompt: 'The softmax function, used for multiclass outputs, produces values that are all positive and sum to 1.',
      answer: true,
      explain: 'Softmax generalizes the sigmoid to several classes: each output is positive and the vector sums to 1, so it reads as a probability distribution.',
    },
  ],
};

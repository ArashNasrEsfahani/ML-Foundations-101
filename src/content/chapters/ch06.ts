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
            'Surprise: you already know a **[[neural-network|neural network]]**. A single [[unit|unit]] weighs its inputs, adds a bias, and squashes the result — which is precisely [logistic regression](sec:ch03-logistic-regression), under a new name and drawn as a circle. A neural network does that trick *repeatedly*: it is a mathematical function built by **nesting** simpler functions. For a three-layer network that returns one number:',
        },
        {
          type: 'math',
          tex: 'y = f_{NN}(\\mathbf{x}) = f_3(f_2(f_1(\\mathbf{x})))',
        },
        {
          type: 'p',
          md:
            'Each **[[layer]]** $f_l$ has exactly the same anatomy: a linear transformation followed by a fixed nonlinear function, the **[[activation-function|activation]]**:',
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
                'a matrix of weights: one row per [[unit]] of the layer, each row a little linear model of its own; learned from data',
            },
            { tex: '\\mathbf{b}_l', explain: 'one bias number per unit, collected in a vector; also learned' },
            {
              tex: 'g_l',
              explain: 'the [[activation-function|activation function]] — fixed, usually nonlinear, chosen before training starts',
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
            'Why a matrix $\\mathbf{W}_l$ and not a single weight vector? Because a layer holds many **[[unit|units]]**, and each unit $u$ owns one row $\\mathbf{w}_{l,u}$: it computes $\\mathbf{w}_{l,u}\\mathbf{z} + b_{l,u}$ and passes the result through $g_l$. In a **[[multilayer-perceptron|multilayer perceptron]]** (the “vanilla” network) every unit receives *all* outputs of the previous layer — such layers are called **fully-connected**. The last layer usually has one unit: give it a linear activation and you have a regression model; give it the logistic ([[sigmoid]]) function and you have a binary classifier.',
        },
        {
          type: 'p',
          md:
            'The nonlinearity is not decoration — it is the whole point. $\\mathbf{W}_l\\mathbf{z} + \\mathbf{b}_l$ is a linear function, and a linear function of a linear function is *still linear*. Strip the activations out and a 50-layer tower collapses into one straight-line model that no amount of depth can save. The activations are what let the network bend.',
        },
        {
          type: 'p',
          md:
            'That composition is also what separates this chapter from the previous ones. Trees, SVMs and linear models are **[[shallow-learning|shallow]]**: they fit their parameters straight to the features you handed them, so how well they can possibly do is decided by your [[feature-engineering|feature engineering]]. A deep network learns its own intermediate representations — layer 1 invents features out of the input, layer 2 invents features out of those. **[[deep-learning|Deep learning]]** is the name for training such networks, and today it names the modern toolkit rather than any particular depth: two or three hidden layers is entirely ordinary in production. The word carries the history of a period when three layers genuinely could not be trained, which is a story the [recurrent section](sec:ch06-rnn) picks up.',
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
            '**[[relu|ReLU]]** — zero for negative inputs, identity for positive ones; cheap and the default for hidden layers.',
            '**[[tanh]]** — an S-curve squashing any number into $(-1, 1)$.',
            '**[[sigmoid]]** (logistic) — the same S-shape squashed into $(0, 1)$; handy as an output that reads like a probability.',
          ],
        },
        {
          type: 'p',
          md:
            'Which to use where is not a matter of taste, and the deciding fact is not the shape of the curve but the size of its *derivative*. Backpropagation (next section) multiplies one derivative per layer on the way back, so any activation whose slope is reliably below 1 shrinks the learning signal a little at every layer it passes. The sigmoid’s slope never exceeds $0.25$: ten sigmoid layers and the gradient reaching the first one is at most a millionth of what left the output. Tanh does better, peaking at 1, but flattens beyond about $|z| = 3$. ReLU has slope exactly $1$ everywhere it is switched on, and multiplying by one costs nothing — which is most of the reason networks were able to get deep at all. That is the [[vanishing-gradient]] problem in miniature, and we will meet it properly in [the section on recurrent networks](sec:ch06-rnn).',
        },
        {
          type: 'p',
          md:
            'So: **ReLU in the hidden layers unless you have a reason**, and the output activation chosen by the task rather than by preference — nothing squashing for [[regression|a real-valued target]], sigmoid for [[binary-classification|one yes/no answer]], and [[softmax]] across the units for [a choice among several classes](sec:ch07-beyond-two-classes). ReLU has one failure of its own worth knowing: a unit whose input is negative for *every* example outputs zero, receives zero gradient, and can never recover. Practitioners call it a dead unit, and leaky ReLU — a small slope on the negative side instead of a flat zero — exists to prevent it.',
        },
        {
          type: 'hint',
          md:
            'Activations must be [[differentiable]] (at least almost everywhere) — [gradient descent](sec:ch04-gradient-descent) needs their derivatives to learn $\\mathbf{W}_l$ and $\\mathbf{b}_l$. ReLU has a kink at zero and is used anyway: the code returns a derivative of 0 there, the input is exactly zero essentially never, and nothing bad has ever come of it.',
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
            'Where do all those weights and biases come from? The same place as in linear and logistic regression: pick a cost function that measures how wrong the outputs are, then run [gradient descent](sec:ch04-gradient-descent) on every parameter at once. The only news is bookkeeping — a network has parameters spread across layers, and **[[backpropagation]]** is the efficient way to get all their gradients: apply [the chain rule](sec:ch02-derivative-gradient) starting from the output error and pass the blame backwards, layer by layer. Backprop computes gradients; gradient descent spends them.',
        },
        {
          type: 'p',
          md:
            '“It is the chain rule” is true and unhelpful, so let us actually run it through two layers. Take the smallest interesting network: two inputs, a hidden layer of three units with activation $g$, one output unit with no activation, and squared loss. Name the shapes, because the shapes are the whole trick — $\\mathbf{W}_1$ is $3\\times2$ and $\\mathbf{b}_1$ is a 3-vector; $\\mathbf{W}_2$ is $1\\times3$ and $b_2$ is a single number. The forward pass is four lines:',
        },
        {
          type: 'math',
          tex:
            '\\mathbf{z}_1 = \\mathbf{W}_1\\mathbf{x} + \\mathbf{b}_1 \\quad\\rightarrow\\quad \\mathbf{h} = g(\\mathbf{z}_1) \\quad\\rightarrow\\quad \\hat{y} = \\mathbf{W}_2\\mathbf{h} + b_2 \\quad\\rightarrow\\quad \\mathcal{L} = (\\hat{y} - y)^2',
        },
        {
          type: 'p',
          md:
            'Now walk backwards. The rule the chain rule gives us is mechanical: at each stage, take the derivative that arrived from above and multiply by the derivative of the local step. Keep one quantity per stage — call it $\\delta$, the sensitivity of the loss to that stage’s pre-activation — and everything else falls out of it:',
        },
        {
          type: 'list',
          ordered: true,
          items: [
            'Start at the loss. $\\delta_2 = \\partial\\mathcal{L}/\\partial\\hat{y} = 2(\\hat{y} - y)$. **One number** — how much the loss cares about the output.',
            'Second-layer weights. $\\partial\\mathcal{L}/\\partial\\mathbf{W}_2 = \\delta_2\\,\\mathbf{h}^\\top$: a number times a 3-vector, laid out as $1\\times3$ — *exactly the shape of* $\\mathbf{W}_2$. And $\\partial\\mathcal{L}/\\partial b_2 = \\delta_2$.',
            'Hand the blame down. $\\partial\\mathcal{L}/\\partial\\mathbf{h} = \\mathbf{W}_2^\\top\\delta_2$, a **3-vector**: the transpose is what routes the single output error back to the three units in proportion to how strongly each fed it.',
            'Cross the activation. $\\boldsymbol{\\delta}_1 = \\left(\\mathbf{W}_2^\\top\\delta_2\\right)\\odot g^{\\prime}(\\mathbf{z}_1)$, still a **3-vector**. The multiply is element-wise ($\\odot$) because $g$ was applied element-wise — unit 2’s activation never touched unit 3’s.',
            'First-layer weights. $\\partial\\mathcal{L}/\\partial\\mathbf{W}_1 = \\boldsymbol{\\delta}_1\\mathbf{x}^\\top$: a $3\\times1$ times a $1\\times2$ gives $3\\times2$ — *exactly the shape of* $\\mathbf{W}_1$. And $\\partial\\mathcal{L}/\\partial\\mathbf{b}_1 = \\boldsymbol{\\delta}_1$.',
          ],
        },
        {
          type: 'p',
          md:
            'Two things to take from that. First, **every gradient has the shape of the thing it differentiates** — which is the fastest debugging check there is; if your gradient for a $3\\times2$ matrix is not $3\\times2$, you have a transpose in the wrong place. Second, steps 3 to 5 are the *same three operations* as steps 1 to 2, one layer down: multiply by $\\mathbf{W}^\\top$, multiply element-wise by $g^{\\prime}$, take an outer product with the layer’s input. A hundred-layer network is that loop run a hundred times, which is why one backward sweep costs about what one forward pass costs, regardless of how many parameters there are.',
        },
        {
          type: 'p',
          md:
            'With numbers, on the thinnest possible slice — one input, one hidden unit, ReLU. Say $x = 2$, $w_1 = 3$, $b_1 = -1$, so $z_1 = 5$ and $h = \\mathrm{relu}(5) = 5$. Then $w_2 = 0.5$, $b_2 = 0$, so $\\hat{y} = 2.5$; the truth is $y = 1$, and the loss is $1.5^2 = 2.25$. Backwards: $\\delta_2 = 2(2.5 - 1) = 3$, so $\\partial\\mathcal{L}/\\partial w_2 = 3 \\times 5 = 15$. Passing down, $\\partial\\mathcal{L}/\\partial h = 0.5 \\times 3 = 1.5$; ReLU is switched on at $z_1 = 5$ so its derivative is 1 and $\\delta_1 = 1.5$; therefore $\\partial\\mathcal{L}/\\partial w_1 = 1.5 \\times 2 = 3$.',
        },
        {
          type: 'p',
          md:
            'Look at the two gradients: $15$ for the output weight, $3$ for the hidden one. The later layer feels the error five times as strongly, so with a shared learning rate it moves five times as fast. That asymmetry is normal and mostly harmless here — but now imagine the activation had been a sigmoid instead. At $z_1 = 5$ the sigmoid’s slope is about $0.0067$, so $\\delta_1$ would be $1.5 \\times 0.0067 \\approx 0.01$ rather than $1.5$: a **150-fold shrink at a single layer**. Stack ten such layers and the first one is receiving nothing at all. That is the vanishing gradient, arriving here as arithmetic rather than as a warning.',
        },
        {
          type: 'p',
          md:
            'Here is the beautiful part. Each hidden [[unit]] is a tiny logistic-style model that learns to draw *one soft line* through the input plane — a **learned feature detector** that answers a yes-ish/no-ish question like “are we in the upper-left?”. The output unit never sees your raw features; it sees the hidden units’ answers and combines them. XOR-shaped data cannot be split by any single line, but *two* lines combined do it easily — which is exactly why the hidden layer is not optional there.',
        },
        {
          type: 'p',
          md:
            'Hidden-layer width is **[[model-capacity|capacity]]**. Two units can carve at most a couple of creases into the boundary; eight units can bend it into rings and spirals. Too little capacity [[underfitting|underfits]] (the spiral defeats a 3-unit net no matter how long you train); too much capacity plus noisy data invites the [overfitting you met in Chapter 5](sec:ch05-overfitting). Watch the loss sparkline too — descent sometimes stalls on a plateau before it finds the drop.',
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
                'Backprop is “just” the [[chain-rule|chain rule]], organized cleverly: the output error flows backwards and each layer reuses the work of the layer after it, so one sweep yields the gradient of the cost with respect to *every* parameter. It computes gradients; it never updates anything — [[gradient-descent|gradient descent]] spends them. Layer widths remain your choice.',
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
            'Try to feed an image to an [[multilayer-perceptron|MLP]] and the arithmetic turns ugly. Every pixel is a feature, so a modest 100×100 photo is a 10,000-dimensional input; bolt on a layer of $size_l$ units after a layer of $size_{l-1}$ and you add $(size_{l-1}+1)\\cdot size_l$ parameters — a single 1000-unit layer can cost over a million. Optimizing that is slow, hungry, and usually unnecessary.',
        },
        {
          type: 'p',
          md:
            'Unnecessary because images have **local structure**: neighboring pixels usually describe the same thing — sky, fur, brick — and the interesting exceptions are the **edges**, where two things touch. So instead of wiring every pixel to every unit, train a *small* pattern detector on a little square patch and **slide it across the whole image** like a moving window. One detector, reused everywhere.',
        },
        {
          type: 'p',
          md:
            'The detector is a small matrix $\\mathbf{F}$ called a **[[filter]]** (or kernel — nothing to do with the [[kernel-function|kernels]] of Chapter 3), say 3×3. At each window position you take the patch $\\mathbf{P}$ under the window and compute the **[[convolution]]** — a moving [[dot-product|dot product]]:',
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
            'The sum is big exactly when the patch *looks like* the filter — positive filter weights sitting on bright pixels, near-zero weights on the rest. Add a bias, apply a nonlinearity (usually [[relu|ReLU]]), and the values collected across all window positions form a **[[feature-map|feature map]]**: a picture of where the pattern lives. A convolution layer holds many filters, each producing its own map — and crucially the filters are **learned** by [[backpropagation]], not hand-designed; the presets in the widget below are just intuition pumps.',
        },
        {
          type: 'p',
          md:
            'Two knobs control the sliding. **[[stride|Stride]]** is the step size of the window — stride 2 skips every other position, so the output map shrinks. **[[padding|Padding]]** surrounds the image with a ring of zeros so the filter can properly scan the borders, making the output bigger. And after convolving, CNNs often apply **[[pooling]]**: slide a small window that keeps only the max (or average) of each block. Pooling has *nothing to learn* — it is a fixed operator that shrinks the map and makes detection a bit more tolerant of small shifts.',
        },
        {
          type: 'p',
          md:
            'Those two knobs and the filter size decide the output size exactly, and it is worth being able to compute it rather than guess:',
        },
        {
          type: 'formula',
          tex: 'n_{\\text{out}} = \\left\\lfloor \\frac{n + 2p - k}{s} \\right\\rfloor + 1',
          parts: [
            { tex: 'n_{\\text{out}}', label: 'side length of the feature map' },
            { tex: '=' },
            { tex: '\\left\\lfloor \\frac{n + 2p - k}{s} \\right\\rfloor', label: 'how many extra steps the window can take' },
            { tex: '+ 1', label: 'plus the first position it starts from' },
          ],
          terms: [
            { tex: 'n', explain: 'side length of the incoming image or feature map' },
            { tex: 'k', explain: 'side length of the filter — 3 for a 3×3' },
            { tex: 'p', explain: 'how many rings of zero [[padding]] were added on each side' },
            { tex: 's', explain: 'the [[stride]]: how far the window jumps between looks' },
          ],
        },
        {
          type: 'p',
          md:
            'Try it on the quiz case below: $n = 10$, $k = 3$, no padding, stride 1 gives $(10 - 3)/1 + 1 = 8$. Add one ring of padding and you get $10$ back — which is why $p = (k-1)/2$ is called *same* padding, and why filter sizes are nearly always odd. Without it, every $3\\times3$ layer costs two pixels of side, so a $32\\times32$ input runs out of image after fifteen layers.',
        },
        {
          type: 'p',
          md:
            'Stack these layers and magic compounds: the second layer convolves the whole *stack* of first-layer feature maps (a **volume**), detecting patterns *of patterns* — edges become corners, corners become eyes, eyes become faces. That is how **[[convolutional-neural-network|CNNs]]** read images with a fraction of an MLP’s parameters: small filters, reused at every position.',
        },
        {
          type: 'p',
          md:
            'Depth also buys *reach*. A unit in the first layer sees a 3×3 window of the image, and nothing more. A unit in the second layer sees a 3×3 window of those units — which between them covered 5×5 of the original pixels. A third layer reaches 7×7, and any stride along the way multiplies the growth rather than adding to it. This is the **receptive field**, and it explains a design choice that otherwise looks arbitrary: three stacked 3×3 layers reach as far as one 7×7 layer, cost $3 \\times 9 = 27$ weights per channel instead of $49$, and pass through two extra nonlinearities on the way. Small filters, stacked deep, beat large filters — and that is why almost every modern architecture is built out of 3×3s.',
        },
        {
          type: 'hint',
          md:
            'Count the saving on the 100×100 photo from the top of this section. A fully-connected layer of 1000 units cost $10^7$ weights. A convolution layer with 64 filters of size 3×3 over three colour channels costs $64 \\times (3 \\times 3 \\times 3 + 1) = 1792$ — five thousand times fewer, and *the number does not change if the photo gets bigger*. That is what weight sharing buys, and it is a regularizer as much as a saving: a pattern learned from examples in one corner of the image is available in every other corner for free.',
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
            'Sentences, audio, price histories — some data comes as a **sequence**: a matrix whose rows are feature vectors and whose *row order matters*. You might want [a label for every element](sec:ch07-sequences), one class for the whole sequence, or a brand-new output sequence. Feed-forward networks are stuck here: they gulp a fixed-size vector in one bite. **[[recurrent-neural-network|Recurrent neural networks]]** (RNNs) instead read the sequence one timestep at a time.',
        },
        {
          type: 'p',
          md:
            'The trick is a loop. Each recurrent unit keeps a running **[[hidden-state|state]]** $\\mathbf{h}$ — its memory. At timestep $t$ the unit combines the current input $\\mathbf{x}^t$ with its *own state from the previous step*, and the very same parameters are reused at every timestep — **shared weights across time**:',
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
            'To train this with backprop you **unroll** it: draw one copy of the unit per timestep, wired in a chain, all copies sharing the same $\\mathbf{W}, \\mathbf{U}, \\mathbf{b}$ — then run [the chain rule](sec:ch02-derivative-gradient) through the whole thing (**[[backpropagation-through-time|backpropagation through time]]**). Now the catch: the longer the sequence, the *deeper* the unrolled network. With tanh-style activations each step multiplies the gradient by numbers smaller than one, so gradients from early timesteps shrink exponentially — the **[[vanishing-gradient|vanishing gradient]]** problem. In practice the network “forgets” the start of long sequences: the cause–effect link between distant words gets lost.',
        },
        {
          type: 'p',
          md:
            'Put a number on it. A 40-word sentence unrolls into a 40-deep chain, and the gradient arriving at word 1 has been multiplied by one factor per step. If a typical factor is $0.9$ — an ordinary value for a tanh unit — the signal reaching the first word is $0.9^{40} \\approx 0.015$: one and a half percent of what left the output. Drop the factor to $0.7$ and it is under *one part in a million*. The network is not choosing to ignore the beginning of the sentence; the instruction to change never arrives at all. (The mirror problem, factors above 1, makes gradients explode instead — that one is easy, you clip the gradient’s length at some ceiling and carry on. Vanishing has no such patch, which is why it took decades to fix.)',
        },
        {
          type: 'p',
          md:
            'The practical fix is **[[gated-unit|gated units]]** — the **[[lstm|LSTM]]** (long short-term memory) and the **[[gru|GRU]]** (gated recurrent unit). The word *gate* does a lot of unexplained work in most accounts, so here is what one actually is. A gate is a vector of numbers between 0 and 1, one per slot of the memory, produced by its own little [[sigmoid]] layer reading the current input and the previous state — and then applied by plain element-wise multiplication:',
        },
        {
          type: 'formula',
          tex: '\\mathbf{f}^{t} = \\sigma\\left(\\mathbf{W}_f\\mathbf{x}^{t} + \\mathbf{U}_f\\mathbf{h}^{t-1} + \\mathbf{b}_f\\right)',
          parts: [
            { tex: '\\mathbf{f}^{t}', label: 'one number in (0,1) per memory slot' },
            { tex: '=' },
            { tex: '\\sigma\\big(', label: 'squashed into (0,1) — so it reads as “how much”' },
            { tex: '\\mathbf{W}_f\\mathbf{x}^{t}', label: 'what just arrived' },
            { tex: '+' },
            { tex: '\\mathbf{U}_f\\mathbf{h}^{t-1}', label: 'and what is already remembered' },
            { tex: '+' },
            { tex: '\\mathbf{b}_f\\big)', label: 'plus an offset' },
          ],
          terms: [
            {
              tex: '\\mathbf{f}^{t}',
              explain:
                'the forget gate: 1 in a slot means keep that memory exactly, 0 means wipe it, 0.5 means halve it — and the value is recomputed from scratch at every timestep',
            },
            {
              tex: '\\mathbf{W}_f, \\mathbf{U}_f, \\mathbf{b}_f',
              explain:
                'the gate’s own weights, learned by [[backpropagation-through-time|backprop through time]] like everything else — nobody hand-writes the rule for when to forget',
            },
            {
              tex: '\\sigma',
              explain: 'the [[sigmoid]], whose whole job here is to produce a number between 0 and 1 that can act as a valve',
            },
          ],
        },
        {
          type: 'p',
          md:
            'An LSTM keeps a memory **cell** $\\mathbf{c}$ alongside the state it reports, and runs three such gates over it. The **forget** gate $\\mathbf{f}$ decides what of the old cell survives. The **input** gate $\\mathbf{i}$ decides how much of the freshly computed candidate $\\tilde{\\mathbf{c}}$ gets written in. The **output** gate $\\mathbf{o}$ decides how much of the cell is revealed to the rest of the network this step. The update is one line, and its shape is the point:',
        },
        {
          type: 'math',
          tex: '\\mathbf{c}^{t} = \\mathbf{f}^{t} \\odot \\mathbf{c}^{t-1} + \\mathbf{i}^{t} \\odot \\tilde{\\mathbf{c}}^{t} \\qquad \\mathbf{h}^{t} = \\mathbf{o}^{t} \\odot \\tanh\\left(\\mathbf{c}^{t}\\right)',
        },
        {
          type: 'p',
          md:
            'Compare that with the plain unit’s $\\mathbf{h}^{t} = g(\\mathbf{W}\\mathbf{x}^{t} + \\mathbf{U}\\mathbf{h}^{t-1} + \\mathbf{b})$. There, the old memory is matrix-multiplied and squashed at *every* step — two operations that shrink things, applied 40 times over. Here the old memory is multiplied by $\\mathbf{f}$ and **added to**. If the forget gate sits near 1 for some slot, that slot’s contents pass through untouched: $\\partial\\mathbf{c}^{t}/\\partial\\mathbf{c}^{t-1}$ is near 1, and multiplying the gradient by 1, forty times, changes nothing. The network has learned to build itself a gradient highway for whatever it decided was worth carrying.',
        },
        {
          type: 'p',
          md:
            'Concretely, on the sentence *“the **keys** that I left on the table by the door **are** gone”*: to conjugate *are* the network must still know, eight words later, that the subject was plural. A gated unit can devote one slot of its cell to that fact, set the forget gate near 1 on that slot so it survives the intervening clause, hold the input gate near 0 there so the clause cannot overwrite it, and open the output gate when the verb finally arrives. A plain RNN has no way to say *keep this one thing and leave it alone* — every step rewrites everything.',
        },
        {
          type: 'p',
          md:
            'A GRU makes the same bargain with fewer parts: one **update** gate does the jobs of forget and input together, so whatever it lets in, it makes room for by pushing out exactly that much, and there is no separate cell — the state is the memory. About a quarter fewer parameters, usually indistinguishable in accuracy, occasionally worse on the very longest dependencies. The choice between them is a [[hyperparameter]], not a principle.',
        },
        {
          type: 'hint',
          md:
            'Gating is one instance of a more general trick: give the gradient a path with derivative 1. **[[skip-connection|Skip connections]]** do the same thing with a bare wire instead of a learned valve, adding a layer’s input to its output so the layer only has to learn the correction — that is what lets image networks run to a hundred layers. Gates learn *when* to keep; skip connections always keep. (Bi-directional RNNs, [[attention]], and [sequence-to-sequence models](sec:ch07-sequences) extend the family — and attention eventually replaced recurrence altogether for text, by letting every step look directly at every other one instead of relaying memories down a chain.)',
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

import type { Concept } from './types';

/**
 * Chapter 6's vocabulary. The through-line is one idea repeated at three
 * scales: a unit is logistic regression, a layer is many of them, and a deep
 * network is layers composed — with CNNs and RNNs being the same machinery
 * with the wiring constrained by an assumption about the data.
 */
export const conceptsCh06: Concept[] = [
  {
    id: 'neural-network',
    term: 'neural network',
    simple:
      'A stack of simple functions, each feeding the next. Every layer takes the numbers the layer below produced, mixes them, bends them, and passes them on — and the whole tower turns out to be able to represent almost anything.',
    technical:
      'A nested composition in which each [[layer]] is a linear map followed by a fixed nonlinear [[activation-function]]. You already know the one-unit case: [[logistic-regression]] is a single unit with a [[sigmoid]] on the end. Every parameter is learned together by [[gradient-descent]] over the whole composition, with gradients supplied by [[backpropagation]]. What you buy is representational power; what you pay is a non-[[convex|convex]] objective — no closed form, no unique answer, and results that depend on where the weights started.',
    math:
      'For $L$ layers, $f_{NN}(\\mathbf{x}) = f_L \\circ \\dots \\circ f_1(\\mathbf{x})$ with $f_l(\\mathbf{z}) = g_l(\\mathbf{W}_l\\mathbf{z} + \\mathbf{b}_l)$. If layer $l$ holds $n_l$ units then $\\mathbf{W}_l$ is $n_l \\times n_{l-1}$ and $\\mathbf{b}_l \\in \\mathbb{R}^{n_l}$. The universal approximation theorem says one hidden layer with enough units approximates any continuous function on a bounded region to any accuracy — while saying nothing about *how many* units or how to find the weights, which is why depth and gradient descent are both still needed.',
    statquest: 'neural networks',
    teachesAt: 'ch06-neural-networks',
    see: ['layer', 'unit', 'multilayer-perceptron', 'backpropagation'],
  },
  {
    id: 'layer',
    term: 'layer',
    simple:
      'One stage of the network: a row of units that all read the same incoming numbers and each produce one number of their own. The next stage reads what this one produced.',
    technical:
      'Anatomically a layer is one matrix multiply, one bias add, and one activation applied element by element. In a [[multilayer-perceptron]] it is fully connected, so its weight matrix has one row per [[unit]] and one column per incoming value. The last layer is chosen by the task — a single linear unit for [[regression]], a [[sigmoid]] for [[binary-classification]], a [[softmax]] over $k$ units for [[multiclass-classification]]. Everything between input and output is *hidden*, hidden only in the sense that nothing outside the network reads it.',
    math:
      'A fully connected layer with $n_{l-1}$ inputs and $n_l$ units holds $n_l\\,n_{l-1}$ weights and $n_l$ biases — $n_l(n_{l-1}+1)$ parameters, and $O(n_l n_{l-1})$ multiply-adds per example. Stacking without a nonlinearity between gains nothing: $\\mathbf{W}_2(\\mathbf{W}_1\\mathbf{z} + \\mathbf{b}_1) + \\mathbf{b}_2 = (\\mathbf{W}_2\\mathbf{W}_1)\\mathbf{z} + (\\mathbf{W}_2\\mathbf{b}_1 + \\mathbf{b}_2)$, which is one layer again.',
    statquest: 'neural networks',
    teachesAt: 'ch06-neural-networks',
    see: ['unit', 'activation-function', 'neural-network', 'multilayer-perceptron'],
  },
  {
    id: 'unit',
    term: 'unit (neuron)',
    simple:
      'A single artificial neuron: it multiplies each of its inputs by a weight it has learned, adds them up with an offset, and bends the total through a fixed curve. That is the entire animal.',
    technical:
      'One unit owns one row of its layer’s weight matrix and one bias, so it computes a weighted sum passed through $g$ — precisely [[logistic-regression]] when $g$ is the [[sigmoid]]. Geometrically it draws one soft hyperplane through its input space and reports which side you are on and by how much, so a hidden unit is a *learned feature detector*, answering a question the network invented for itself. The power of a layer is in combining many such half-space answers: two hidden units solve XOR, which no single unit can.',
    math:
      'Unit $u$ of layer $l$ computes $h_{l,u} = g_l\\!\\left(\\sum_j W_{l,uj}z_j + b_{l,u}\\right)$. Its pre-activation vanishes on the hyperplane $\\mathbf{w}_{l,u}\\mathbf{z} + b_{l,u} = 0$, whose orientation is $\\mathbf{w}_{l,u}$ and whose distance from the origin is $-b_{l,u}/\\|\\mathbf{w}_{l,u}\\|$ — the weights say which way the boundary faces, the bias says where it sits.',
    teachesAt: 'ch06-neural-networks',
    see: ['layer', 'logistic-regression', 'activation-function', 'neural-network'],
  },
  {
    id: 'activation-function',
    term: 'activation function',
    simple:
      'The bend. After a unit adds up its weighted inputs it passes the total through a fixed curve, and that curve is the only thing stopping a deep network from collapsing into one straight line.',
    technical:
      'Chosen before training and never learned. It must be nonlinear, or depth buys nothing at all, and differentiable almost everywhere, or [[backpropagation]] cannot pass gradients through it. The practical choice is about gradients rather than shape: [[sigmoid]] and [[tanh]] saturate, driving derivatives toward zero for large inputs and starving the early layers — the [[vanishing-gradient]] problem — while [[relu]] keeps a derivative of exactly 1 across its whole positive half. Hidden layers take ReLU by default; output layers take whatever the task requires.',
    math:
      'Applied element-wise, $g(\\mathbf{v})_i = g(v_i)$, so its Jacobian is the diagonal matrix $\\mathrm{diag}\\!\\left(g^{\\prime}(v_1),\\dots,g^{\\prime}(v_n)\\right)$ — which is why the backward pass is a cheap element-wise multiply rather than a matrix solve. The derivatives that decide everything: $\\sigma^{\\prime} = \\sigma(1-\\sigma) \\le \\tfrac{1}{4}$, $\\tanh^{\\prime} = 1 - \\tanh^{2} \\le 1$, and $\\mathrm{relu}^{\\prime}(z) = \\mathbb{1}[z > 0]$. That first bound is the vanishing gradient written in one symbol.',
    statquest: 'activation functions neural networks',
    teachesAt: 'ch06-neural-networks',
    see: ['relu', 'tanh', 'sigmoid', 'vanishing-gradient'],
  },
  {
    id: 'relu',
    term: 'ReLU',
    simple:
      'Keep positive numbers exactly as they are and flatten every negative number to zero. That is the whole rule, and it is the default bend in nearly every modern network.',
    technical:
      'Cheap — one comparison, no exponentials — and, far more importantly, its derivative is exactly 1 wherever the unit is active, so gradients travel through many layers without shrinking. That single property is most of the reason networks got deep. Two costs: it is not differentiable at zero (the subgradient 0 is used and nothing bad happens), and a unit whose pre-activation is negative for every example is *dead* — zero output, zero gradient, permanently. Leaky ReLU gives the negative half a small slope to avoid that.',
    math:
      '$\\mathrm{relu}(z) = \\max(0, z)$ with $\\mathrm{relu}^{\\prime}(z) = \\mathbb{1}[z > 0]$. Since each unit is linear on either side of its own hinge, a ReLU network is a piecewise-linear function whose pieces are cells of an arrangement of hyperplanes — and the number of those cells grows exponentially with depth but only polynomially with width, which is one formal statement of why depth beats width.',
    statquest: 'ReLU activation function',
    teachesAt: 'ch06-neural-networks',
    see: ['activation-function', 'tanh', 'vanishing-gradient'],
  },
  {
    id: 'tanh',
    term: 'tanh',
    simple:
      'An S-shaped squash that maps any number into the range between minus one and plus one, sending zero to zero. It is the sigmoid, recentred so its output carries no built-in positive bias.',
    technical:
      'A rescaled [[sigmoid]], and the standard hidden activation before [[relu]] displaced it. Being zero-centred helps: sigmoid outputs are all positive, so every weight feeding the next unit receives a gradient of the same sign and updates zig-zag toward the optimum. Its remaining flaw is saturation — the curve is nearly flat once the input passes about 3 in magnitude, so the derivative collapses and learning stalls, which is precisely the [[vanishing-gradient]] mechanism. It survives inside [[lstm|LSTM]] cells, where a bounded, zero-centred state is exactly the point.',
    math:
      '$\\tanh(z) = \\dfrac{e^{z} - e^{-z}}{e^{z} + e^{-z}} = 2\\sigma(2z) - 1$, so it genuinely *is* the sigmoid, stretched and shifted. Its derivative $1 - \\tanh^{2}(z)$ peaks at 1 when $z = 0$ and decays to 0 in both tails — better than the sigmoid’s maximum of $\\tfrac{1}{4}$, but still below 1 almost everywhere, so a product across many layers still shrinks.',
    teachesAt: 'ch06-neural-networks',
    see: ['sigmoid', 'relu', 'activation-function', 'lstm'],
  },
  {
    id: 'multilayer-perceptron',
    term: 'multilayer perceptron (MLP)',
    simple:
      'The plain vanilla network: a few layers in a row, every unit wired to every unit in the layer before. No sliding windows, no loops, no cleverness — stacked layers and nothing else.',
    technical:
      'Also called a fully-connected or feed-forward network. The wiring is both its definition and its weakness: connecting every input to every unit costs one weight per pair, which is fine for forty features and hopeless for a ten-thousand-pixel image. [[convolutional-neural-network|CNNs]] and [[recurrent-neural-network|RNNs]] are MLPs with that wiring constrained by an assumption about the data — locality for images, weight sharing across time for sequences — and the constraint is exactly where their parameter savings come from.',
    math:
      'With layer sizes $n_0, n_1, \\dots, n_L$ the parameter count is $\\sum_{l=1}^{L}n_l(n_{l-1}+1)$. One hidden layer of 1000 units on a $100 \\times 100$ image is $10^{4}\\times 10^{3} = 10^{7}$ weights before the second layer exists — and not one of them knows that two adjacent pixels are related, since permuting the input pixels consistently would leave the model unchanged.',
    statquest: 'neural networks',
    teachesAt: 'ch06-neural-networks',
    see: ['neural-network', 'layer', 'convolutional-neural-network', 'unit'],
  },
  {
    id: 'backpropagation',
    term: 'backpropagation',
    simple:
      'The bookkeeping that tells every weight in the network how much it contributed to the final mistake. The error is measured at the output and passed backwards, each layer handing the layer below its share of the blame.',
    technical:
      'It is the [[chain-rule]], organized so that nothing is computed twice. A forward pass stores each layer’s activations; the backward pass carries one vector of partial derivatives from the output toward the input, and at each layer that vector yields both this layer’s parameter gradients and the vector to hand down. The cost is the same order as the forward pass and independent of the parameter count, which is the only reason a billion-parameter model is trainable. Backprop computes gradients; [[gradient-descent]] spends them.',
    math:
      'With $\\mathbf{z}_l = \\mathbf{W}_l\\mathbf{h}_{l-1} + \\mathbf{b}_l$, $\\mathbf{h}_l = g(\\mathbf{z}_l)$ and $\\boldsymbol{\\delta}_l = \\partial\\mathcal{L}/\\partial\\mathbf{z}_l$: the recursion is $\\boldsymbol{\\delta}_l = \\left(\\mathbf{W}_{l+1}^{\\top}\\boldsymbol{\\delta}_{l+1}\\right)\\odot g^{\\prime}(\\mathbf{z}_l)$, from which $\\partial\\mathcal{L}/\\partial\\mathbf{W}_l = \\boldsymbol{\\delta}_l\\mathbf{h}_{l-1}^{\\top}$ and $\\partial\\mathcal{L}/\\partial\\mathbf{b}_l = \\boldsymbol{\\delta}_l$. One matrix-vector product and one element-wise multiply per layer, and every gradient falls out.',
    statquest: 'backpropagation',
    teachesAt: 'ch06-tinynet',
    see: ['chain-rule', 'gradient-descent', 'vanishing-gradient', 'neural-network'],
  },
  {
    id: 'deep-learning',
    term: 'deep learning',
    simple:
      'Training neural networks with more than a couple of layers — and, these days, the whole modern toolkit that goes with them rather than any particular depth.',
    technical:
      'The name dates from when more than two hidden layers was genuinely hard to train, because gradients either vanished or exploded on the way back. What changed was the equipment rather than the idea: [[relu|ReLU]], better initialization, [[batch-normalization]], [[gated-unit|gates]], [[skip-connection|skip connections]], [[adam]]-style optimisers, GPUs, and datasets large enough to feed the capacity. Today the word names a practice, not a layer count — plenty of production models get by on two or three hidden layers.',
    math:
      'The difficulty was multiplicative. A gradient reaching layer 1 of an $L$-layer network carries the product $\\prod_{l=2}^{L}\\mathbf{W}_l^{\\top}\\mathrm{diag}\\!\\left(g^{\\prime}(\\mathbf{z}_l)\\right)$; if a typical factor has magnitude $\\rho$, the gradient scales as $\\rho^{L}$ — about $10^{-10}$ for $\\rho = 0.5$ and $L = 33$. Every item on the modern toolkit list is, one way or another, an attempt to hold $\\rho$ near 1.',
    statquest: 'neural networks deep learning',
    teachesAt: 'ch06-neural-networks',
    see: ['shallow-learning', 'vanishing-gradient', 'relu', 'skip-connection'],
  },
  {
    id: 'shallow-learning',
    term: 'shallow learning',
    simple:
      'Learning straight from the features you handed the algorithm, with nothing in between. Almost everything before this chapter — trees, support vector machines, linear models — works that way.',
    technical:
      'The contrast is over where the features come from. A shallow model fits its parameters directly to the representation you supplied, so the quality of that representation is entirely your problem: [[feature-engineering]] sets the ceiling. A deep model learns intermediate representations of its own, each layer building features out of the layer below. The trade is data and interpretability against effort — shallow methods remain the better bet on small tabular datasets, where gradient-boosted trees still beat networks routinely.',
    math:
      'A shallow model has the form $f(\\mathbf{x}) = g(\\boldsymbol{\\theta}, \\mathbf{x})$, one parametrized stage between input and output; a deep one is a composition $f_L \\circ \\dots \\circ f_1$ with several. The kernel view blurs the line: an [[rbf-kernel|RBF]] [[support-vector-machine|SVM]] is shallow in parameters and infinite-dimensional in features — but that feature space is fixed in advance rather than learned, which is the distinction that matters.',
    teachesAt: 'ch06-neural-networks',
    see: ['deep-learning', 'feature-engineering', 'support-vector-machine'],
  },
  {
    id: 'convolutional-neural-network',
    term: 'convolutional neural network (CNN)',
    simple:
      'A network built for pictures. Instead of wiring every pixel to every unit, it trains one small pattern detector and slides it across the whole image, reusing the same detector everywhere.',
    technical:
      'Two assumptions do all the work: patterns are *local* (a corner is settled by neighbouring pixels) and *translation-invariant* (an edge is an edge wherever it appears). Sharing one small [[filter]] across all positions cuts parameters by orders of magnitude and builds the invariance into the architecture instead of hoping the data will teach it. Stacked layers compose: edges into corners, corners into textures, textures into objects. The same idea runs in one dimension over text and audio, where the window slides along time.',
    math:
      'A layer with $F$ filters of size $k \\times k$ over a $C$-channel input holds $F(k^{2}C + 1)$ parameters, *independent of the image size* — sixty-four $3\\times3\\times3$ filters is 1792 numbers whether the image is $32\\times32$ or $4000\\times3000$. Its output is a volume of $F$ [[feature-map|feature maps]], each of side $\\left\\lfloor\\frac{n + 2p - k}{s}\\right\\rfloor + 1$ for [[padding]] $p$ and [[stride]] $s$.',
    statquest: 'convolutional neural networks',
    teachesAt: 'ch06-cnn',
    see: ['filter', 'convolution', 'feature-map', 'pooling'],
  },
  {
    id: 'filter',
    term: 'filter (kernel)',
    simple:
      'A small grid of weights describing a pattern to look for — an edge, a blob, a stripe. Slide it over the picture and it lights up wherever the picture resembles it.',
    technical:
      'Confusingly also called a kernel, with no relation to the [[kernel-function|kernels]] of Chapter 3. A filter has the same depth as its input, so a 3×3 filter over an RGB image is 3×3×3 weights plus a bias, and it emits one number per window position. The weights are *learned* by [[backpropagation]] like any other parameters — hand-designed filters such as the Sobel edge detector are how the field started, and a CNN’s whole point is that it discovers better ones. A layer holds many filters, each hunting a different thing.',
    math:
      'One filter $\\mathbf{F} \\in \\mathbb{R}^{k \\times k \\times C}$ contributes $k^{2}C + 1$ parameters and produces one [[feature-map]]. Its response is $g\\!\\left(\\sum_{i,j,c}P_{i,j,c}F_{i,j,c} + b\\right)$ — a [[dot-product]] between the patch and the filter, therefore maximal (at fixed patch norm) when the patch is a positive multiple of the filter itself. That is the precise sense in which a filter *is* the pattern it detects.',
    statquest: 'convolutional neural networks',
    teachesAt: 'ch06-cnn',
    see: ['convolution', 'feature-map', 'convolutional-neural-network', 'dot-product'],
  },
  {
    id: 'convolution',
    term: 'convolution',
    simple:
      'A moving dot product. Lay the little grid of weights over a patch of the picture, multiply each weight by the pixel beneath it, add everything up — then shift along and do it again.',
    technical:
      'The operation that makes a CNN cheap: one set of weights, applied at every position, produces a whole map of responses. Because the weights are reused, a pattern learned from examples in one corner of the image is available in every other corner for free — weight sharing is a regularizer as much as a saving. (Strictly, libraries compute *cross-correlation*: true convolution flips the filter first. Since the weights are learned, the flip changes nothing and everyone ignores it.)',
    math:
      'For the patch $\\mathbf{P}$ under the window, $\\mathrm{conv}(\\mathbf{P},\\mathbf{F}) = \\sum_i\\sum_j P_{i,j}F_{i,j}$, a [[dot-product]] of $k^{2}$ terms. Across the image the output at $(r,c)$ is $\\sum_{i,j}X_{rs+i,\\;cs+j}F_{i,j} + b$ with [[stride]] $s$. The operation is linear in both arguments, which is why an [[activation-function]] must follow it: a stack of convolutions with no bend between them is just one larger convolution.',
    statquest: 'convolutional neural networks',
    teachesAt: 'ch06-cnn',
    see: ['filter', 'feature-map', 'stride', 'padding'],
  },
  {
    id: 'feature-map',
    term: 'feature map',
    simple:
      'The picture a single detector produces: the same layout as the image, but every position holds how strongly the pattern was found there rather than a colour. Bright spots are sightings.',
    technical:
      'One filter, one map. A layer with sixty-four filters emits sixty-four maps stacked into a *volume*, and the next layer convolves through that whole depth — which is how it detects patterns of patterns rather than patterns of pixels. Maps shrink with depth ([[stride]] and [[pooling]]) while their number grows, trading spatial resolution for semantic richness: early maps say *where the edges are*, late maps say *whether there is a face*, and barely where.',
    math:
      'Input side $n$, filter $k$, [[padding]] $p$ and [[stride]] $s$ give a map of side $\\left\\lfloor\\frac{n + 2p - k}{s}\\right\\rfloor + 1$ — for $n = 10$, $k = 3$, $p = 0$, $s = 1$ that is 8. The layer’s output volume is therefore side $\\times$ side $\\times F$, and the next layer’s filters are $k \\times k \\times F$: their depth is dictated by how many maps arrived, not by anything you choose.',
    teachesAt: 'ch06-cnn',
    see: ['filter', 'convolution', 'pooling', 'convolutional-neural-network'],
  },
  {
    id: 'stride',
    term: 'stride',
    simple:
      'How far the sliding window jumps between one look and the next. Step by one and it inspects every position; step by two and it skips half of them, producing a smaller output.',
    technical:
      'A downsampling knob built into the convolution itself, and increasingly the preferred one — a strided convolution shrinks the map while still *learning* what to keep, whereas [[pooling]] shrinks it by a fixed rule. Stride 2 roughly quarters the size of a two-dimensional map, and therefore quarters the compute of every layer above it. Too large a stride steps clean over small features; strides beyond 2 are rare outside the first layer of very large images.',
    math:
      'With stride $s$ the window sits at positions $0, s, 2s, \\dots$, giving an output side of $\\left\\lfloor\\frac{n + 2p - k}{s}\\right\\rfloor + 1$. The receptive field — how much of the original image one deep unit ultimately sees — grows *multiplicatively* in the strides: one step at depth $l$ corresponds to $\\prod_{m < l}s_m$ input pixels, which is why a couple of stride-2 layers reach across a whole photograph.',
    teachesAt: 'ch06-cnn',
    see: ['padding', 'pooling', 'convolution', 'feature-map'],
  },
  {
    id: 'padding',
    term: 'padding',
    simple:
      'A border of zeros drawn around the image so the window can sit properly over the edges. Without it the corner pixels get looked at far less often than the middle ones, and the picture shrinks with every layer.',
    technical:
      'Two conventions. *Valid* padding adds nothing and lets the map lose $k-1$ pixels of side per layer; *same* padding adds exactly enough zeros to keep the size, which is what lets you stack twenty layers without running out of image. It costs almost nothing and biases the borders slightly, since the zeros are not observations — a network can learn to recognize its own frame, which is occasionally how it cheats. Reflection or replication padding avoids that for a little extra work.',
    math:
      'Adding $p$ zeros each side gives an output side of $\\left\\lfloor\\frac{n + 2p - k}{s}\\right\\rfloor + 1$; *same* padding at stride 1 needs $p = (k-1)/2$, which is 1 for $k = 3$ and 2 for $k = 5$ — and is why odd filter sizes are the convention. With no padding, $L$ stacked $3\\times3$ layers cost $2L$ pixels of side, so a $32\\times32$ input survives only fifteen of them.',
    teachesAt: 'ch06-cnn',
    see: ['stride', 'convolution', 'feature-map'],
  },
  {
    id: 'pooling',
    term: 'pooling',
    simple:
      'Shrink the map by looking at each little block and keeping one number for it — usually the largest. It throws away exactly where the pattern was and keeps the fact that it was there.',
    technical:
      'A fixed operator: no weights, nothing to learn, only a window size and a [[stride]]. Max pooling keeps the strongest response in each block, which buys tolerance to small shifts — nudge the input by a pixel and the maximum often does not move. It also cuts the map size and so the compute of everything above it. Modern architectures use it less than they did, preferring strided convolutions and a single global average pool at the end, because discarding position by a fixed rule turned out to cost more than it saved.',
    math:
      'Max pooling with window $k$ and stride $s$ outputs $\\max_{(i,j)\\,\\in\\,\\mathrm{block}}P_{i,j}$; average pooling outputs the mean. Its backward pass routes the entire gradient to the arg-max cell and zero to the rest, so it is differentiable almost everywhere despite being a hard selection. The usual $2\\times2$ window at stride 2 halves each side and quarters the map.',
    statquest: 'convolutional neural networks pooling',
    teachesAt: 'ch06-cnn',
    see: ['stride', 'feature-map', 'convolutional-neural-network'],
  },
  {
    id: 'recurrent-neural-network',
    term: 'recurrent neural network (RNN)',
    simple:
      'A network that reads a sequence one element at a time and keeps a running summary of everything it has seen so far. The same little network runs at every step; only its memory changes.',
    technical:
      'Built for data where order carries meaning — sentences, audio frames, price histories — which a fixed-input feed-forward network cannot represent. The same weights apply at every timestep, so one RNN handles sequences of any length and a pattern learned at position 3 is available at position 300. Trained by [[backpropagation-through-time]], and in its plain form crippled by the [[vanishing-gradient]] problem, which is why practical RNNs are almost always [[gated-unit|gated]]. Variants: bidirectional, stacked, and [[encoder-decoder|encoder–decoder]] for sequence-to-sequence work.',
    math:
      'At each step $\\mathbf{h}^{t} = g\\!\\left(\\mathbf{W}\\mathbf{x}^{t} + \\mathbf{U}\\mathbf{h}^{t-1} + \\mathbf{b}\\right)$ with $\\mathbf{h}^{0}$ usually zero, and an output $\\mathbf{y}^{t} = \\mathrm{softmax}\\!\\left(\\mathbf{V}\\mathbf{h}^{t} + \\mathbf{c}\\right)$ read at every step or only at the last. The parameter set $\\mathbf{W}, \\mathbf{U}, \\mathbf{b}$ does not grow with the sequence length $T$ — that sharing is the entire design.',
    statquest: 'recurrent neural networks',
    teachesAt: 'ch06-rnn',
    see: ['hidden-state', 'backpropagation-through-time', 'gated-unit', 'lstm'],
  },
  {
    id: 'hidden-state',
    term: 'hidden state',
    simple:
      'The network’s running memory: one fixed-size vector meant to hold everything worth remembering about the sequence so far. Each new element updates it.',
    technical:
      'A lossy summary, and its fixed size is both the strength and the ceiling. Strength: a 200-token sentence costs no more memory than a 5-token one. Ceiling: everything must be squeezed into those few hundred numbers, and each step overwrites rather than appends, so old information decays as new arrives. That bottleneck is why [[attention]] was invented — it lets a decoder look back at every step’s state instead of only the last.',
    math:
      'The state evolves as $\\mathbf{h}^{t} = g\\!\\left(\\mathbf{W}\\mathbf{x}^{t} + \\mathbf{U}\\mathbf{h}^{t-1} + \\mathbf{b}\\right)$, a nonlinear dynamical system in $\\mathbb{R}^{n}$ whose behaviour is governed by the spectral radius of $\\mathbf{U}$: below 1 the state contracts and forgets, above 1 it can blow up. The Jacobian $\\partial\\mathbf{h}^{t}/\\partial\\mathbf{h}^{t-1} = \\mathrm{diag}\\!\\left(g^{\\prime}(\\cdot)\\right)\\mathbf{U}$ is exactly the factor multiplied $T$ times over during [[backpropagation-through-time]].',
    statquest: 'recurrent neural networks',
    teachesAt: 'ch06-rnn',
    see: ['recurrent-neural-network', 'vanishing-gradient', 'gated-unit', 'attention'],
  },
  {
    id: 'backpropagation-through-time',
    term: 'backpropagation through time',
    simple:
      'To train a network that loops, first draw the loop out flat: one copy of the unit per element of the sequence, chained together. Then it is an ordinary deep network and ordinary backpropagation applies.',
    technical:
      '*Unrolling* turns a one-layer recurrent network into a feed-forward network $T$ layers deep, every layer sharing one set of weights — so each parameter’s gradient is the sum of its contributions at every timestep. Compute and memory scale with $T$, because every intermediate state must be kept for the backward pass; the standard remedy is *truncated* BPTT, which unrolls only the last twenty to fifty steps and accepts that longer dependencies go unlearned. Depth $T$ is also precisely where the [[vanishing-gradient]] problem comes from.',
    math:
      'For a loss $\\mathcal{L} = \\sum_t\\mathcal{L}_t$, $\\dfrac{\\partial\\mathcal{L}}{\\partial\\mathbf{U}} = \\sum_{t}\\sum_{k \\le t}\\dfrac{\\partial\\mathcal{L}_t}{\\partial\\mathbf{h}^{t}}\\left(\\prod_{m=k+1}^{t}\\dfrac{\\partial\\mathbf{h}^{m}}{\\partial\\mathbf{h}^{m-1}}\\right)\\dfrac{\\partial\\mathbf{h}^{k}}{\\partial\\mathbf{U}}$. That inner product of Jacobians over $t-k$ steps is the whole story: its magnitude decays or explodes geometrically in the gap, so gradients from distant timesteps arrive as noise or not at all.',
    statquest: 'recurrent neural networks',
    teachesAt: 'ch06-rnn',
    see: ['backpropagation', 'recurrent-neural-network', 'vanishing-gradient', 'chain-rule'],
  },
  {
    id: 'vanishing-gradient',
    term: 'vanishing gradient',
    simple:
      'The signal telling the early layers how to improve fades on its way back to them. Each layer it passes through shrinks it a little, and after enough layers there is nothing left — so the beginning of the network stops learning.',
    technical:
      'The mechanism is multiplication: [[backpropagation]] carries a product with one factor per layer, and if the typical factor is below 1 the product decays geometrically. Saturating activations are the classic culprit — the [[sigmoid]]’s derivative never exceeds 0.25, so ten sigmoid layers scale the gradient by at most a millionth. The symptom is a network whose late layers train while its early layers barely move, or an RNN that cannot connect the start of a sentence to its end. Every cure attacks the same product: [[relu|ReLU]], careful initialization, [[batch-normalization]], [[skip-connection|skip connections]], and [[gated-unit|gates]] in RNNs. Its mirror image, the exploding gradient, is far easier — clip the norm and carry on.',
    math:
      'The gradient reaching layer $l$ carries $\\prod_{m > l}\\mathbf{W}_m^{\\top}\\mathrm{diag}\\!\\left(g^{\\prime}(\\mathbf{z}_m)\\right)$; writing $\\rho$ for the typical singular value of one factor, its magnitude scales as $\\rho^{L-l}$. Only $\\rho = 1$ is stable — over 50 layers, $\\rho = 0.9$ leaves $0.5\\%$ of the signal and $\\rho = 1.1$ multiplies it by $117$. In an RNN the same factor is the recurrent Jacobian repeated $T$ times, so the condition becomes the spectral radius of $\\mathbf{U}$.',
    statquest: 'vanishing gradient problem',
    teachesAt: 'ch06-rnn',
    see: ['backpropagation-through-time', 'gated-unit', 'relu', 'skip-connection'],
  },
  {
    id: 'gated-unit',
    term: 'gated unit',
    simple:
      'A recurrent unit with taps on it. Small learned valves decide how much of the new input to let in, how much of the old memory to keep, and how much of it to reveal — so the unit can hold on to something for a hundred steps when that is useful.',
    technical:
      'A gate is a vector of numbers between 0 and 1, computed by its own little [[sigmoid]] layer from the current input and the previous state, and applied by element-wise multiplication. Multiplying by a value near 1 means *keep*, near 0 means *erase*, and because the keep path is then close to the identity, the gradient travels through it undiminished. It is the same trick as a [[skip-connection|skip connection]], but with a learned, input-dependent valve in place of a fixed wire. [[lstm|LSTMs]] and [[gru|GRUs]] are the two standard arrangements.',
    math:
      'A gate is $\\mathbf{g} = \\sigma\\!\\left(\\mathbf{W}_g\\mathbf{x}^{t} + \\mathbf{U}_g\\mathbf{h}^{t-1} + \\mathbf{b}_g\\right) \\in (0,1)^{n}$, applied as $\\mathbf{g}\\odot\\mathbf{v}$. The memory update is *additive*, $\\mathbf{c}^{t} = \\mathbf{f}\\odot\\mathbf{c}^{t-1} + \\mathbf{i}\\odot\\tilde{\\mathbf{c}}^{t}$, so $\\partial\\mathbf{c}^{t}/\\partial\\mathbf{c}^{t-1} = \\mathrm{diag}(\\mathbf{f})$ — with the forget gate near 1 that Jacobian is near the identity and the product over $T$ steps does not vanish. That is the entire mathematical content of gating.',
    statquest: 'long short-term memory',
    teachesAt: 'ch06-rnn',
    see: ['lstm', 'gru', 'vanishing-gradient', 'recurrent-neural-network'],
  },
  {
    id: 'lstm',
    term: 'LSTM',
    simple:
      'The classic gated recurrent unit. It keeps a separate memory cell alongside its output, with three valves: one deciding what to forget, one deciding what to write, and one deciding what to reveal.',
    technical:
      'Long short-term memory, from Hochreiter and Schmidhuber in 1997 — long before there was hardware to need it. The cell state is the conveyor belt: it is only ever multiplied by the forget gate and added to, never squashed through a nonlinearity, which is exactly what keeps its gradient alive across hundreds of steps. It costs four times a plain RNN’s parameters, and initializing the forget-gate bias to 1 (remember by default) is a standard trick that measurably helps. Largely displaced by [[attention]]-based models for text, still common for modest-length time series.',
    math:
      'From $\\mathbf{x}^{t}$ and $\\mathbf{h}^{t-1}$: forget $\\mathbf{f}$, input $\\mathbf{i}$ and output $\\mathbf{o}$ gates, each a $\\sigma(\\cdot)$, plus a candidate $\\tilde{\\mathbf{c}} = \\tanh(\\cdot)$. Then $\\mathbf{c}^{t} = \\mathbf{f}\\odot\\mathbf{c}^{t-1} + \\mathbf{i}\\odot\\tilde{\\mathbf{c}}$ and $\\mathbf{h}^{t} = \\mathbf{o}\\odot\\tanh\\!\\left(\\mathbf{c}^{t}\\right)$. Four gate-sized weight blocks over a state of size $n$ with input size $d$ come to $4n(n + d + 1)$ parameters.',
    statquest: 'long short-term memory LSTM',
    teachesAt: 'ch06-rnn',
    see: ['gated-unit', 'gru', 'recurrent-neural-network', 'vanishing-gradient'],
  },
  {
    id: 'gru',
    term: 'GRU',
    simple:
      'A slimmed-down gated unit. It merges the forget and write valves into one — whatever it lets in, it makes room for by pushing out the same amount — and drops the separate memory cell.',
    technical:
      'The gated recurrent unit, from 2014. Two gates instead of three, no separate cell state, roughly a quarter fewer parameters and correspondingly faster. Empirically it matches [[lstm|LSTM]] on most tasks and loses on a few long-memory ones; the honest summary is that the choice between them is a [[hyperparameter]], not a principle. Both exist for the same reason and by the same mechanism: an additive state update whose Jacobian sits near the identity.',
    math:
      'Update gate $\\mathbf{z}$ and reset gate $\\mathbf{r}$, each $\\sigma(\\cdot)$; candidate $\\tilde{\\mathbf{h}} = \\tanh\\!\\left(\\mathbf{W}\\mathbf{x}^{t} + \\mathbf{U}\\left(\\mathbf{r}\\odot\\mathbf{h}^{t-1}\\right) + \\mathbf{b}\\right)$; then $\\mathbf{h}^{t} = (1 - \\mathbf{z})\\odot\\mathbf{h}^{t-1} + \\mathbf{z}\\odot\\tilde{\\mathbf{h}}$. One $\\mathbf{z}$ playing both roles is the tying that removes the LSTM’s independent forget and input gates, at $3n(n + d + 1)$ parameters against the LSTM’s $4n(n + d + 1)$.',
    teachesAt: 'ch06-rnn',
    see: ['lstm', 'gated-unit', 'recurrent-neural-network'],
  },
  {
    id: 'skip-connection',
    term: 'skip connection',
    simple:
      'A wire carrying a layer’s input straight past it, to be added back to the output. The layer then only has to learn the correction, and the training signal gets a clear road back to the earlier layers.',
    technical:
      'The residual connection of ResNet, and the reason networks of a hundred layers train at all. A block computes *input plus correction* rather than replacing the input, so doing nothing is the default behaviour and a block with nothing useful to add can cheaply stay out of the way — whereas a plain stack must *learn* the identity, which turns out to be hard. On the backward pass the added path has derivative exactly 1, so gradients reach the bottom undiminished. The same idea powers transformers and U-Nets, and — with a learned valve instead of a bare wire — [[gated-unit|gated]] RNNs.',
    math:
      'A residual block computes $\\mathbf{h}_{l+1} = \\mathbf{h}_l + \\mathcal{F}(\\mathbf{h}_l)$, with Jacobian $\\mathbf{I} + \\partial\\mathcal{F}/\\partial\\mathbf{h}_l$. The gradient product over $L$ blocks expands into a sum over all path lengths, including the length-zero path of magnitude exactly 1 — so however small $\\partial\\mathcal{F}$ becomes, the [[vanishing-gradient]] product cannot collapse past it.',
    teachesAt: 'ch06-rnn',
    see: ['vanishing-gradient', 'gated-unit', 'deep-learning', 'backpropagation'],
  },
];

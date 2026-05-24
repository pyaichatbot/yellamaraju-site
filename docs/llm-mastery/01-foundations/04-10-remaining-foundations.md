# 04 — Context Windows

> *Module 01 | Foundations*

---

## What is a Context Window?

Every LLM has a maximum number of tokens it can "see" at once.

This is called the **context window** — like the model's working memory or attention span.

**Analogy:** Imagine you're reading a book, but you can only keep 10 pages in front of you at a time. When you turn to page 11, page 1 falls off the back. The model is the same — it can only "see" tokens up to its limit.

```
GPT-3.5          →  4,096 tokens  (~3,000 words)
GPT-4 Turbo      → 128,000 tokens (~96,000 words)
Claude 3 Opus    → 200,000 tokens (~150,000 words)
LLaMA 3 8B       →   8,192 tokens (~6,000 words)
Gemini 1.5 Pro   → 1,000,000 tokens (~750,000 words)
```

---

## What Goes Into the Context Window?

The context window contains EVERYTHING the model processes:

```
┌─────────────────────────────────────┐
│  System Prompt      (e.g., 500 tok) │
│  Conversation History (e.g., 2000)  │
│  Your New Message   (e.g., 200 tok) │
│  Retrieved Documents (e.g., 3000)   │
│                                     │
│  Total used: 5,700 tokens           │
│  Remaining: 122,300 tokens          │
└─────────────────────────────────────┘
```

When the context is full, older messages get dropped (usually from the beginning) or you hit an error.

---

## Why Context Window Size Matters

### Longer context = more capabilities
- Analyze a whole codebase at once
- Summarize long documents
- Maintain coherent very long conversations
- Process multiple documents together

### But longer context = more cost + slower responses
- Each token costs money (input tokens are usually cheaper than output)
- Processing 100K tokens takes real compute time
- You pay for every token in your context, every turn

### The "Lost in the Middle" Problem
Research shows that LLMs tend to pay more attention to tokens at the **beginning** and **end** of the context. Information buried in the middle gets attended to less.

Practical implication: Put the most important information at the start or end of your prompts.

---

## Context Window vs Memory

These are NOT the same thing:

| Context Window | Memory |
|---------------|--------|
| Within-conversation state | Across-conversation state |
| Automatic (included in the model) | Must be built explicitly |
| Lost when session ends | Can persist indefinitely |
| Costs tokens | Usually external storage |

LLMs have context windows by default. Memory requires RAG or external systems (covered in Module 06).

---

## Managing Context Efficiently

```python
# Bad: Sending entire conversation every time
messages = [
    {"role": "user", "content": "long message 1..."},  # 500 tokens
    {"role": "assistant", "content": "long reply 1..."}, # 800 tokens
    {"role": "user", "content": "long message 2..."},  # 500 tokens
    # ... 50 more turns
    {"role": "user", "content": "new question"}
]
# Total: might be 50,000 tokens — expensive!

# Better: Summarize old turns
# Keep recent turns in full, summarize older ones
messages = [
    {"role": "system", "content": "Summary of previous conversation: [brief summary]"},
    # Last 5 turns only:
    {"role": "user", "content": "recent question"},
    {"role": "assistant", "content": "recent answer"},
    {"role": "user", "content": "new question"}
]
```

---

*Next: [05 — Embeddings](./05-embeddings.md)*

---
---

# 05 — Embeddings

> *Module 01 | Foundations*

---

## The Problem: Computers Don't Understand Words

Computers work with numbers. Text is just characters.

How do you make a computer "understand" that "cat" and "kitten" are similar, but "cat" and "car" are less similar?

The answer: **embeddings**.

---

## What is an Embedding?

An **embedding** is a list of numbers that represents a piece of text.

```
"cat"    → [0.23, -0.14, 0.87, 0.03, -0.56, ...]  (1536 numbers)
"kitten" → [0.25, -0.12, 0.89, 0.01, -0.54, ...]  (1536 numbers)
"car"    → [0.71, 0.44, -0.23, 0.92, 0.11, ...]   (1536 numbers)
```

The key insight: **similar meanings = similar numbers**.

"Cat" and "kitten" have similar numbers (they're close in space).
"Cat" and "car" have very different numbers (they're far apart in space).

---

## The Vector Space Analogy

Imagine a map where every word is a point in space. Similar words are located near each other.

```
         animals
           ↑
    cat • kitten
    dog •   • puppy
           
           ←————→
        vehicles
    car •  truck
    bus •
```

This space can have 1536 dimensions (not 2 like a map), but the principle is the same.

---

## Famous Embedding Math

The classic demonstration:

```
king - man + woman ≈ queen

In embedding space:
vector("king") - vector("man") + vector("woman") ≈ vector("queen")
```

This works because the model learned relational patterns, not just individual words.

---

## Types of Embeddings

### Token Embeddings
Each token has a learned embedding (a fixed vector). These are the input to the model.

### Contextual Embeddings
Inside the transformer, embeddings update based on context:
- "bank" near "river" → different embedding than "bank" near "money"
- The same token gets different embeddings based on context

### Sentence/Document Embeddings
You can embed entire sentences or documents:
```
"The dog ran fast" → one vector representing the whole sentence
```
Useful for search, similarity comparison, RAG.

---

## Embeddings in Practice

```python
# Getting embeddings from OpenAI
from openai import OpenAI

client = OpenAI()

response = client.embeddings.create(
    model="text-embedding-3-small",
    input="The quick brown fox jumps over the lazy dog"
)

embedding = response.data[0].embedding
print(f"Embedding dimensions: {len(embedding)}")  # 1536
print(f"First 5 values: {embedding[:5]}")
```

```python
# Comparing similarity between two texts
import numpy as np

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

emb1 = get_embedding("I love cats")
emb2 = get_embedding("I adore kittens")
emb3 = get_embedding("I drive cars")

print(cosine_similarity(emb1, emb2))  # ~0.92 (very similar)
print(cosine_similarity(emb1, emb3))  # ~0.61 (less similar)
```

---

## Why Embeddings Matter for Engineers

1. **Semantic search**: Find documents by meaning, not just keywords
2. **RAG systems**: Find relevant context to inject into prompts
3. **Classification**: Cluster similar items together
4. **Recommendation**: "Similar to what you liked"
5. **Anomaly detection**: Outlier items in embedding space

---

*Next: [06 — Transformers](./06-transformers.md)*

---
---

# 06 — Transformers

> *Module 01 | Foundations*

---

## The Architecture That Changed Everything

In 2017, a paper titled "Attention Is All You Need" introduced the **Transformer** architecture.

Before transformers, AI used RNNs (Recurrent Neural Networks) which processed text one word at a time — slow and forgetful.

Transformers process all words **at the same time** (in parallel) and use "attention" to learn which words matter to which other words.

This made LLMs possible.

---

## The Transformer Building Blocks

A transformer model has these main parts:

```
Input Tokens
    ↓
[Token Embedding] — converts tokens to vectors
    ↓
[Positional Encoding] — adds position information
    ↓
[Transformer Block × N] — the main processing
  ├── [Multi-Head Attention] — what to pay attention to
  ├── [Add & Normalize]
  ├── [Feed-Forward Network] — process the information
  └── [Add & Normalize]
    ↓
[Output Layer] — predicts next token probabilities
```

---

## Transformer Block in Plain English

Each transformer block does two things:

### 1. Attention (Communication)
Tokens "look at" each other and figure out which ones are related.

"The cat sat on the **mat** because **it** was comfortable."

What does "it" refer to? The model uses attention to figure out that "it" → "mat".

### 2. Feed-Forward (Computation)
After tokens have communicated, each token processes its updated information independently.

Think of it as: attention = "gather information from neighbors", feed-forward = "think about it yourself".

---

## Why "Multi-Head" Attention?

Instead of one attention mechanism, transformers use many heads running in parallel.

Each head learns to look for **different kinds of relationships**:
- Head 1: Grammatical relationships (subject-verb)
- Head 2: Coreference (pronoun → noun)
- Head 3: Semantic similarity
- Head 4: Positional relationships
- ... (GPT-4 has 96+ attention heads per layer)

Then all heads' outputs are combined.

---

## Positional Encoding: Order Matters

Transformers process all tokens at once (in parallel), which means they don't naturally know the order.

"Dog bites man" vs "Man bites dog" — same tokens, different meaning.

Positional encoding adds a unique signal to each token based on its position, so the model knows where each token is in the sequence.

---

## Scale: Why Size Matters

| Model | Layers | Attention Heads | Hidden Size |
|-------|--------|----------------|------------|
| GPT-2 Small | 12 | 12 | 768 |
| GPT-2 Large | 36 | 20 | 1280 |
| GPT-3 | 96 | 96 | 12,288 |
| LLaMA 3 8B | 32 | 32 | 4,096 |
| LLaMA 3 70B | 80 | 64 | 8,192 |

More layers = deeper understanding. More heads = more types of patterns learned. Larger hidden size = richer representations.

---

*Next: [07 — Attention Mechanism](./07-attention-mechanism.md)*

---
---

# 07 — Attention Mechanism

> *Module 01 | Foundations*

---

## The Core Idea

**Attention** lets the model decide: when processing this token, which other tokens should I look at?

Like a human reader: when you read "it", your eyes scan back to find what "it" refers to. Attention is the mathematical version of that.

---

## Queries, Keys, and Values

The attention mechanism uses three concepts: **Q, K, V** (Query, Key, Value).

**Analogy: Library Search**

- **Query** = your search terms ("books about cats")
- **Key** = the label on each book
- **Value** = the actual content inside each book

The attention mechanism:
1. Takes your Query
2. Compares it against all Keys (every token in the context)
3. The most matching Keys get the highest score
4. Returns a weighted mix of Values based on those scores

---

## The Math (Simplified)

```
Attention(Q, K, V) = softmax(QK^T / √d) × V

Translation:
1. QK^T: How much does each query match each key? (dot product)
2. / √d: Scale down (prevents values from getting too large)
3. softmax(): Convert to probabilities (all add up to 1.0)
4. × V: Weight the values by those probabilities
```

You don't need to memorize this. The important insight: **higher match between Q and K = more of that token's V is included in the output**.

---

## Causal Masking

During training and generation, the model shouldn't be able to "cheat" by looking at future tokens.

Causal masking ensures each token can only attend to tokens **before** it (and itself):

```
Token 1: can see → [1]
Token 2: can see → [1, 2]
Token 3: can see → [1, 2, 3]
Token 4: can see → [1, 2, 3, 4]
```

This is why these models are called **causal language models**.

---

## Attention Visualization

If you could visualize what a model attends to:

```
"The cat sat on the mat because it was comfortable"

When processing "it":
→ "mat" gets 60% attention weight
→ "cat" gets 25% attention weight  
→ "sat" gets 10% attention weight
→ others: 5%

When processing "comfortable":
→ "it" gets 45% (since we just established it = mat)
→ "mat" gets 35%
→ others: 20%
```

---

*Next: [08 — Parameters](./08-parameters.md)*

---
---

# 08 — Parameters

> *Module 01 | Foundations*

---

## What are Parameters?

**Parameters** are the learnable numbers inside a model.

Think of a model's parameters as all the dials and knobs that get tuned during training. After training, they're fixed — they encode the model's "knowledge".

When someone says "LLaMA 3 8B", the "8B" means **8 billion parameters**.

---

## Where Parameters Live

In a transformer, parameters exist in:

1. **Embedding tables** — mapping token IDs to vectors
2. **Attention weight matrices** — Q, K, V projection weights
3. **Feed-forward network weights** — large dense matrices
4. **Layer normalization parameters** — small scaling factors

The vast majority live in attention and feed-forward layers.

---

## Parameters ≠ Intelligence (Directly)

More parameters generally means:
- More capacity to memorize facts
- More nuanced understanding
- Better at complex reasoning

But:
- A smaller model fine-tuned on specific data often beats a larger general model
- Efficiency improvements (quantization, LoRA) can shrink effective parameter needs
- Quality of training data matters more than raw parameter count

```
7B model + great data > 70B model + bad data
```

---

## How Much Memory Do Parameters Need?

Each parameter is a number. Different precisions use different memory:

| Precision | Bits per parameter | Memory for 7B model |
|-----------|-------------------|---------------------|
| float32 (fp32) | 32 bits (4 bytes) | ~28 GB |
| float16 (fp16) | 16 bits (2 bytes) | ~14 GB |
| bfloat16 (bf16) | 16 bits (2 bytes) | ~14 GB |
| int8 (Q8) | 8 bits (1 byte) | ~7 GB |
| int4 (Q4) | 4 bits (0.5 bytes) | ~3.5 GB |

This is why **quantization** (Module 03) is so important — it makes models 4-8x smaller with minimal quality loss.

---

## Rule of Thumb for VRAM

To run a model for inference:
```
Minimum VRAM ≈ model_parameters × bytes_per_param × 1.2

For LLaMA 3 8B at fp16:
= 8,000,000,000 × 2 bytes × 1.2
= ~19 GB VRAM

For LLaMA 3 8B at Q4:
= 8,000,000,000 × 0.5 bytes × 1.2
= ~4.8 GB VRAM
```

This is why quantized models matter so much for local inference.

---

*Next: [09 — Training vs Inference](./09-training-vs-inference.md)*

---
---

# 09 — Training vs Inference

> *Module 01 | Foundations*

---

## Two Very Different Things

| | Training | Inference |
|--|---------|-----------|
| What it is | Teaching the model | Using the model |
| When | Before deployment | Every time someone uses it |
| Cost | Very expensive | Cheaper per use |
| Hardware | Many GPUs, weeks/months | Fewer GPUs, milliseconds |
| Modifies weights | Yes | No |

---

## Training in Depth

Training is what creates the model. It involves:

1. **Data preparation**: Curating and cleaning training data
2. **Forward pass**: Run data through the model, get predictions
3. **Loss calculation**: How wrong were the predictions?
4. **Backward pass**: Calculate gradients (which direction to adjust each parameter)
5. **Weight update**: Adjust parameters slightly in the right direction
6. **Repeat**: Billions of times

### The scale of pre-training
- GPT-4 training: ~$100 million, ~3-6 months
- LLaMA 3 70B: ~$10 million, weeks
- Fine-tuning a model: $50-$5,000, hours to days

### Fine-tuning is also training
Fine-tuning = additional training on top of a pre-trained model. Much cheaper because:
- Starting from a good base (not random)
- Training on much less data
- Usually updating only some parameters (LoRA)

---

## Inference in Depth

Inference = using a trained model to generate outputs.

The steps:
1. Input tokens → embeddings
2. Process through all transformer layers
3. Output token probabilities
4. Sample next token
5. Repeat (autoregressive generation)

### Inference costs
- Proportional to: tokens processed × model size
- Input tokens cheaper than output tokens (output requires generating one token at a time)
- Larger models = slower inference + more memory

---

## The Memory Difference

**Training** needs to store:
- Model weights (parameters)
- Gradients (same size as weights!)
- Optimizer states (2x weights for Adam optimizer!)
- Activations (per batch)

Total: ~8-16x the model size in memory

```
Training LLaMA 3 8B at fp16:
= 14 GB (weights) + 14 GB (gradients) + 28 GB (optimizer) + activations
= ~80+ GB VRAM needed
= Need multiple A100 80GB GPUs
```

**Inference** only needs:
- Model weights
- KV cache (covered in Module 04)

```
Inference LLaMA 3 8B at fp16:
= ~14-19 GB VRAM
= Can run on a single A100 40GB
```

This is why you can't fine-tune a 70B model on your laptop, but you might be able to run it.

---

## LoRA Changes the Training Story

LoRA (covered in Module 03) is a technique that:
- Freezes the original model weights during fine-tuning
- Only trains small "adapter" matrices
- Reduces trainable parameters by 99%+
- Makes training feasible on consumer hardware

```
Training LLaMA 3 8B with LoRA (Q4 quantized):
= ~6 GB VRAM for the model
= ~2 GB for LoRA adapters and optimizer
= Total: ~8 GB VRAM
= Possible on a gaming GPU!
```

---

*Next: [10 — Open-Source vs Closed-Source Models](./10-open-vs-closed-source.md)*

---
---

# 10 — Open-Source vs Closed-Source Models

> *Module 01 | Foundations*

---

## The Two Worlds

### Closed-Source Models
- Trained and hosted by a company
- You access them via API (pay per token)
- You never see the weights (the actual model)
- Example: GPT-4 (OpenAI), Claude (Anthropic), Gemini (Google)

### Open-Source/Open-Weight Models  
- Weights are publicly released (you can download them)
- You can run them yourself, fine-tune them, modify them
- May have usage restrictions (Meta's LLaMA has commercial terms)
- Example: LLaMA 3 (Meta), Mistral, Qwen, Gemma

---

## Side-by-Side Comparison

| Factor | Closed-Source | Open-Source |
|--------|--------------|-------------|
| Cost | Pay per token | Free to run (pay for hardware) |
| Privacy | Data sent to provider | Fully local option |
| Customization | Limited (system prompts) | Full fine-tuning possible |
| Performance | Frontier performance | Slightly behind, closing fast |
| Deployment | Managed | You manage everything |
| Compliance | Depends on provider ToS | Full control |
| Latency | Network-dependent | Local = potentially faster |
| Uptime | Provider-dependent | You control |

---

## When to Use Each

### Use Closed-Source When:
- You need best-in-class performance RIGHT NOW
- You want zero infrastructure management
- Your use case doesn't need customization
- Privacy isn't critical
- You're prototyping quickly

### Use Open-Source When:
- Data privacy is critical (medical, legal, financial)
- You need to fine-tune for a specific domain
- Regulatory requirements prohibit third-party data processing (EU companies!)
- You want to reduce long-term costs (high volume)
- You need offline/air-gapped deployment
- You're building a product and need control

---

## The Closing Gap

Open-source models were 2-3 years behind closed-source in 2022.

By 2024-2025:
- LLaMA 3 70B competes with GPT-4 on many benchmarks
- Qwen 2.5 72B matches GPT-4o on coding
- Mistral Large 2 competes on reasoning
- Specialized fine-tunes often beat general frontier models on narrow tasks

The gap is closing. Fast.

---

## Practical Recommendation for Engineers

Start with:
1. **Prototype with Claude/GPT-4** (fast, easy, good)
2. **Identify your actual needs** (privacy? cost? customization?)
3. **Switch to open-source if needed** (LLaMA 3 or Mistral as base)
4. **Fine-tune for your specific domain**
5. **Evaluate and compare**

---

## 📝 Summary — Complete Foundations Module

You now understand the core foundations:
- LLMs predict the next token using neural networks trained on massive text
- Tokens are the atomic units (not words or characters)
- Context windows limit how much the model can see at once
- Embeddings turn text into numbers that capture meaning
- Transformers process all tokens in parallel using attention
- Attention determines which tokens influence which others
- Parameters are the learned numbers that store model knowledge
- Training creates models; inference uses them
- Open-source models give you freedom; closed-source gives you convenience

---

## 🧠 The Unified Mental Model

```
Text → Tokens → Numbers → Transformer Layers → Probabilities → Next Token
         (tokenizer)        (attention + math)  (softmax)     (sampling)

Training: Do this backward too. Adjust weights to improve predictions.
Inference: Go forward only. Generate one token at a time.
```

---

## 🏋️ Final Foundations Exercise

**Build a mini "text similarity" app using embeddings:**

```python
# Install: pip install anthropic numpy

import anthropic
import numpy as np

client = anthropic.Anthropic()

def get_embedding(text):
    # Note: Use OpenAI's embedding API or a HuggingFace model for embeddings
    # Claude's API doesn't expose embeddings directly
    # For this exercise, install: pip install sentence-transformers
    from sentence_transformers import SentenceTransformer
    model = SentenceTransformer('all-MiniLM-L6-v2')
    return model.encode(text)

def cosine_similarity(a, b):
    return np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b))

# Test pairs
pairs = [
    ("I love programming", "I enjoy coding"),
    ("I love programming", "The weather is nice today"),
    ("cat", "kitten"),
    ("cat", "automobile"),
    ("The bank approved my loan", "I sat by the river bank"),
]

for a, b in pairs:
    emb_a = get_embedding(a)
    emb_b = get_embedding(b)
    similarity = cosine_similarity(emb_a, emb_b)
    print(f"'{a}' vs '{b}'")
    print(f"  Similarity: {similarity:.3f}\n")
```

**Expected output:** Semantically similar sentences have similarity > 0.8. Unrelated sentences have similarity < 0.5.

---

*You've completed Module 01! Move to [Module 02 — Datasets & Training](../02-datasets-training/complete-module-02.md)*

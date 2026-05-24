# Module 04 — Inference & Optimization

> *Making models fast, cheap, and production-ready.*

---

# 01 — KV Cache

## The Problem: Quadratic Attention Cost

Every time a model generates a new token, it needs to compute attention over ALL previous tokens.

Without caching:
- Generate token 1: Compute attention over 1 token
- Generate token 2: Compute attention over 2 tokens (including token 1 again)
- Generate token 100: Compute attention over 100 tokens (99 recomputed!)

This is wasteful. Token 1's Key and Value never change. Why compute them again?

---

## The Solution: Cache the Keys and Values

**KV Cache** = store (cache) the Key and Value vectors for all previously processed tokens.

```
Without KV cache:
Token 50 generation:
  → Compute K, V for tokens 1-49 (wasted work)
  → Compute K, V for token 50
  → Compute attention

With KV cache:
Token 50 generation:
  → Retrieve cached K, V for tokens 1-49 (instant!)
  → Compute K, V for token 50 (just this one)
  → Compute attention
```

This makes autoregressive generation O(n) instead of O(n²) in compute.

---

## KV Cache Memory Cost

KV cache requires memory proportional to:
- Number of layers × number of heads × sequence length × head dimension × 2 (K and V)

For LLaMA 3 8B at 4K context:
```
32 layers × 32 heads × 4096 tokens × 128 dim × 2 × 2 bytes (fp16)
= ~2.1 GB just for KV cache
```

At 128K context (full window):
```
= ~67 GB for KV cache alone
```

This is why long context = more memory, not just for weights.

---

## KV Cache in Practice

In most inference frameworks, KV caching is automatic. But you should be aware of it for:

```python
# Hugging Face: KV cache is automatic in model.generate()
model.generate(
    input_ids,
    max_new_tokens=500,
    use_cache=True,   # Default: True. Never set to False for generation.
)

# For batched inference, KV cache grows with batch size too
# Monitor GPU memory when scaling batch sizes
```

---

## Prefix Caching: The Next Level

If many requests share the same prefix (like a long system prompt), cache the KV for that prefix and reuse across requests.

```
System prompt (2000 tokens) → compute once, cache
User question 1 → add to cached prefix
User question 2 → add to cached prefix (same cache!)
User question 3 → add to cached prefix

Instead of paying 2000 tokens 3 times = 6000 tokens
You pay 2000 tokens once + 3 short questions ≈ 2300 tokens total
```

Claude and GPT-4 offer **prompt caching** in their APIs:
```python
import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-sonnet-4-20250514",
    max_tokens=1024,
    system=[{
        "type": "text",
        "text": "Your very long system prompt here...",
        "cache_control": {"type": "ephemeral"}  # Cache this!
    }],
    messages=[{"role": "user", "content": "Quick question..."}]
)

# Second call reuses the cached prefix — much faster + cheaper
```

---

# 02 — Flash Attention

## The GPU Memory Bottleneck

Standard attention has a problem: it creates a full (sequence_length × sequence_length) attention matrix.

For a 10K token context:
- Attention matrix: 10,000 × 10,000 = 100 million values
- In fp16: 200 MB just for one attention layer
- × 32 layers = 6.4 GB for attention matrices alone

This moves data between GPU compute (fast) and GPU memory (slow) repeatedly.

**Flash Attention** is an algorithm that computes attention without materializing the full matrix.

---

## How Flash Attention Works (Simplified)

Instead of computing the whole attention matrix at once, Flash Attention:
1. Processes attention in **tiles** that fit in the fast on-chip SRAM
2. Accumulates results without writing the full matrix to GPU memory
3. Produces the same result but 2-8x faster and uses far less memory

```python
# Most modern libraries use Flash Attention automatically
# Just make sure you install it:
# pip install flash-attn --no-build-isolation

from transformers import AutoModelForCausalLM

model = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Meta-Llama-3-8B",
    attn_implementation="flash_attention_2",  # Enable Flash Attention 2
    torch_dtype=torch.bfloat16,
)
```

---

## Flash Attention Variants

| Version | Features | Speedup |
|---------|----------|---------|
| Flash Attention 1 | Core algorithm | 2-4x |
| Flash Attention 2 | Better parallelism, GQA | 2-8x |
| Flash Attention 3 | Hopper GPU (H100) optimized | Up to 16x |
| xFormers | Alternative implementation | 2-5x |
| SDPA (PyTorch) | Built-in, cross-platform | 1.5-3x |

---

## Grouped Query Attention (GQA)

Related to efficiency: LLaMA 3 uses **Grouped Query Attention** (GQA).

Standard attention: Each of 32 heads has its own K and V
GQA: Multiple query heads share the same K and V

```
Standard (MHA): 32 Q, 32 K, 32 V = 96 matrices
GQA (8 groups): 32 Q, 8 K, 8 V = 48 matrices
MQA (1 group): 32 Q, 1 K, 1 V = 34 matrices
```

GQA reduces KV cache size and memory without sacrificing much quality.

---

# 03 — Speculative Decoding

## The Autoregressive Bottleneck

LLM generation is **serial**: each token depends on the previous. You can't parallelize it.

But what if you could "guess" multiple tokens at once and verify them in parallel?

That's speculative decoding.

---

## How It Works

```
Two models:
1. Small draft model (fast, e.g., LLaMA 3 1B)
2. Large target model (slow but accurate, e.g., LLaMA 3 70B)

Steps:
1. Draft model generates 4-8 tokens quickly
2. Target model verifies ALL 4-8 tokens in ONE forward pass
   (verification is parallel, much faster than generation)
3. Accept tokens where draft and target agree
4. Reject from first disagreement onward
5. Target model generates the correct token at rejection point
6. Repeat
```

---

## Speed Gains

If the draft model guesses right 80% of the time:
- Old: 1 token per forward pass of large model
- Speculative: ~3-4 tokens per forward pass of large model

**Result: 2-4x speedup with identical output quality**

Because verification uses the same large model, the output is mathematically identical to running the large model alone — just faster.

---

## When to Use Speculative Decoding

Best for:
- Generating long responses (more tokens = more benefit)
- When a good small model exists in the same family (LLaMA 3 1B → 8B → 70B)
- Latency-critical applications

Less useful for:
- Very short responses (overhead isn't worth it)
- When small and large model outputs are very different

---

# 04 — Inference Optimization (Strategies Overview)

## The Optimization Stack

```
Application Layer
    ↓
[Prompt optimization] — reduce input tokens
[Output length control] — limit output tokens
    ↓
Framework Layer  
[vLLM / TensorRT-LLM] — efficient serving
[Flash Attention] — faster attention
[Speculative decoding] — faster generation
    ↓
Model Layer
[Quantization] — smaller model = faster
[Pruning] — remove unimportant weights
[Distillation] — smaller student model
    ↓
Hardware Layer
[GPU selection] — A100 vs H100 vs gaming GPU
[Memory bandwidth] — often the bottleneck
[Batch size tuning] — fill GPU efficiently
```

---

## Key Metrics

| Metric | Definition | Optimize For |
|--------|-----------|-------------|
| Time to First Token (TTFT) | Time until first output token appears | User experience (responsiveness) |
| Tokens Per Second (TPS) | How fast tokens are generated | Throughput |
| Tokens Per Second Per User | Throughput at scale | Cost efficiency |
| Memory Usage | Peak GPU memory | Hardware requirements |
| Cost Per Token | Total compute cost / tokens | Business model |

---

## Practical Optimization Checklist

```
□ Use quantized model (Q4 or Q8 instead of fp16)
□ Enable Flash Attention 2
□ Enable KV caching (on by default, don't disable)
□ Use prefix caching for shared system prompts
□ Limit max_tokens to what you actually need
□ Use streaming to improve perceived latency
□ Batch similar requests together
□ Use appropriate model size for the task
□ Consider speculative decoding for long generations
□ Profile before optimizing (measure, don't guess)
```

---

# 05 — Model Serving

## The Challenge: One Model, Many Users

Your model sits in GPU memory. Users send requests at random times. You need to:
- Handle concurrent requests
- Use GPU efficiently (don't let it sit idle)
- Return responses fast
- Scale when load increases

This is model serving.

---

## Naive Serving vs Production Serving

### Naive (Flask + HuggingFace generate):
```python
from flask import Flask, request
from transformers import pipeline

app = Flask(__name__)
pipe = pipeline("text-generation", model="llama-3-8b")

@app.route("/generate", methods=["POST"])
def generate():
    prompt = request.json["prompt"]
    return pipe(prompt)[0]["generated_text"]
# Problems: 
# - One request at a time
# - GPU mostly idle while tokenizing/detokenizing
# - No batching
# - No streaming
```

### Production (vLLM):
```python
from vllm import LLM, SamplingParams

llm = LLM(model="meta-llama/Meta-Llama-3-8B")
sampling_params = SamplingParams(temperature=0.7, max_tokens=512)

# Handles batching automatically, continuous batching,
# PagedAttention (efficient KV cache management),
# streaming, OpenAI-compatible API
```

---

## OpenAI-Compatible Serving

Most serving frameworks expose an OpenAI-compatible API. This means you can point any OpenAI-compatible client at your local server:

```python
# vLLM server: python -m vllm.entrypoints.openai.api_server --model llama-3-8b

from openai import OpenAI

# Point to local vLLM server instead of OpenAI
client = OpenAI(
    api_key="local",
    base_url="http://localhost:8000/v1"
)

response = client.chat.completions.create(
    model="meta-llama/Meta-Llama-3-8B-Instruct",
    messages=[{"role": "user", "content": "Hello!"}]
)
```

---

## Continuous Batching

Traditional batching: wait until you have N requests, process them together, return.
Problem: First request waits for N-1 others.

**Continuous batching**: process tokens for multiple requests simultaneously, dynamically adding/removing requests from the "batch" as they arrive/complete.

Result: Much better GPU utilization, lower latency for all users.

vLLM, TGI (Text Generation Inference), and TensorRT-LLM all implement this.

---

# 06 — Batch Inference

## When Latency Doesn't Matter

Batch inference = process many requests offline, not in real-time.

Use cases:
- Generating product descriptions for 10,000 items
- Classifying 1 million customer support tickets
- Summarizing 50,000 articles overnight

---

## Why Batch Inference is Cheaper

```
Interactive inference: 
- GPU processes one request at a time
- GPU utilization: maybe 30-50%
- Pay for idle time

Batch inference:
- GPU continuously processes requests
- GPU utilization: 80-95%
- Pay only for actual compute
- Usually 3-5x cheaper per token
```

Anthropic's Message Batches API offers 50% cost reduction:
```python
import anthropic

client = anthropic.Anthropic()

# Create a batch of up to 100,000 requests
batch = client.messages.batches.create(
    requests=[
        {
            "custom_id": f"product-{i}",
            "params": {
                "model": "claude-haiku-4-5-20251001",
                "max_tokens": 200,
                "messages": [{"role": "user", "content": f"Describe product {i}"}]
            }
        }
        for i in range(1000)
    ]
)

# Check status (batches complete in minutes to hours)
status = client.messages.batches.retrieve(batch.id)
print(f"Status: {status.processing_status}")

# Retrieve results when done
for result in client.messages.batches.results(batch.id):
    print(f"ID: {result.custom_id}, Response: {result.result.message.content}")
```

---

# 07 — GPU & VRAM Basics

## Why GPU Not CPU?

CPUs: Fast, few cores (8-128), great for sequential operations
GPUs: Slower per core, THOUSANDS of cores, great for parallel matrix math

Neural network operations are matrix multiplications — naturally parallel.

```
Matrix multiply A × B (1000×1000 matrices):
CPU (8 cores): sequential chunks → ~100ms
GPU (thousands of cores): all at once → ~1ms
```

---

## GPU Architecture for LLMs

Key specs that matter:

| Spec | Why It Matters |
|------|---------------|
| VRAM | How large a model you can run |
| Memory Bandwidth | How fast data moves → affects generation speed |
| FLOPS | Raw compute → affects throughput |
| Tensor Cores | Specialized matrix multiply → massive speedup |
| NVLink | Multi-GPU communication bandwidth |

---

## GPU Comparison for LLM Work

### Consumer GPUs
| GPU | VRAM | Bandwidth | Best For |
|-----|------|-----------|---------|
| RTX 3060 | 12 GB | 360 GB/s | 7B inference, small fine-tuning |
| RTX 3090/4090 | 24 GB | 936 GB/s | 13B inference, 7B fine-tuning |
| RTX 4090 | 24 GB | 1008 GB/s | Best consumer option |

### Professional/Cloud GPUs
| GPU | VRAM | Bandwidth | Best For |
|-----|------|-----------|---------|
| A100 40GB | 40 GB | 2 TB/s | 30B+ inference, 13B fine-tuning |
| A100 80GB | 80 GB | 2 TB/s | 70B inference, 30B fine-tuning |
| H100 80GB | 80 GB | 3.35 TB/s | Production serving, large models |
| H200 141GB | 141 GB | 4.8 TB/s | Frontier model inference |

---

## The Memory Bandwidth Bottleneck

For inference (not training), **memory bandwidth** often matters more than raw FLOPS.

Why: During token generation, the model loads all its weights from VRAM to compute. This memory transfer is the bottleneck.

```
Arithmetic Intensity = FLOPS / Memory Bytes transferred

During generation:
- Small batch (1 request): arithmetic intensity is LOW → memory-bound
- Large batch (many requests): arithmetic intensity is HIGHER → compute-bound

H100 vs A100 for inference:
- A100: 2 TB/s bandwidth → 1.0x inference speed
- H100: 3.35 TB/s bandwidth → ~1.7x inference speed (just from bandwidth!)
```

---

## Multi-GPU Setup: Tensor Parallelism

A 70B model doesn't fit on one GPU. Split across multiple:

```
Tensor Parallel (within a single node):
- Split each matrix across 4 GPUs
- GPUs communicate via NVLink (fast)
- All GPUs process each token together

Pipeline Parallel (across nodes):
- Put different layers on different GPUs
- Sequential, one layer feeds the next
- Higher latency, works across slow connections

Recommended: Tensor parallelism for inference
```

---

# 08 — Latency vs Quality Tradeoffs

## The Fundamental Tension

Every optimization has a cost-quality tradeoff:

| Optimization | Latency Impact | Quality Impact |
|-------------|--------------|---------------|
| Quantization (Q4) | Faster | -2-5% quality |
| Smaller model | Much faster | Significant quality loss |
| Lower temperature | Negligible | Less diverse |
| Fewer output tokens | Linear speedup | Less complete answers |
| Speculative decoding | 2-4x faster | Identical quality |
| Flash Attention | 2-8x faster | Identical quality |
| KV cache | Major speedup | Identical quality |

Flash Attention and KV cache are "free" — use them always.
Quantization/smaller models require careful evaluation.

---

## Decision Framework

```python
def choose_optimization(requirements):
    
    if requirements.quality == "critical" and latency == "flexible":
        return "Use large model, fp16, all accuracy"
    
    elif requirements.latency == "critical" and quality == "can_tolerate_loss":
        return "Use Q4 quantization + smaller model"
    
    elif requirements.cost == "critical":
        return "Batch inference + smallest model that meets quality bar"
    
    elif requirements.privacy == "critical":
        return "Local inference + quantized open-source model"
    
    else:
        return "vLLM + Q4/Q8 + Flash Attention — the balanced default"
```

---

## Practical Recommendations

| Use Case | Model Size | Quantization | Serving |
|----------|-----------|--------------|---------|
| Chatbot (interactive) | 7-13B | Q4_K_M | Ollama / vLLM |
| Document summarization | 7-13B | Q4_K_M | Batch + vLLM |
| Code generation | 13-34B | Q5_K_M | vLLM |
| Complex reasoning | 70B+ | Q4_K_M | vLLM multi-GPU |
| Production API | Closed API | N/A | Direct API |

---

## 📝 Module 04 Summary

| Concept | Key Takeaway |
|---------|-------------|
| KV Cache | Cache K,V vectors of past tokens. Free speedup. Always on. |
| Prefix Cache | Reuse KV for shared prefixes across requests. Saves cost at scale. |
| Flash Attention | Compute attention without materializing full matrix. 2-8x faster. |
| Speculative Decoding | Draft model guesses, large model verifies. 2-4x faster, same quality. |
| Batch Inference | Process offline in bulk. 3-5x cheaper per token. |
| GPU Selection | VRAM for capacity, bandwidth for speed. H100 > A100 > 4090 for LLMs. |
| Latency/Quality | KV cache + Flash Attention = free gains. Quantization = small quality trade. |

---

## 🧠 Mental Model

> Think of a GPU as a very fast but forgetful worker. They can compute blazing fast (FLOPS) but need to constantly fetch their notes from a filing cabinet (VRAM). The bottleneck is often the filing cabinet speed (memory bandwidth), not the worker's brain speed.
>
> KV cache keeps recent notes on the desk (fast). Flash Attention rearranges the filing system (efficient). Quantization makes each note smaller (more notes fit on the desk).

---

## 🏋️ Module Exercise

**Benchmark different inference configurations:**

```python
import time
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

def benchmark_inference(model_id, use_flash_attn=False, quantize=False):
    """Benchmark a model configuration"""
    
    kwargs = {
        "torch_dtype": torch.float16,
        "device_map": "auto"
    }
    
    if use_flash_attn:
        kwargs["attn_implementation"] = "flash_attention_2"
    
    if quantize:
        from transformers import BitsAndBytesConfig
        kwargs["quantization_config"] = BitsAndBytesConfig(load_in_4bit=True)
    
    model = AutoModelForCausalLM.from_pretrained(model_id, **kwargs)
    tokenizer = AutoTokenizer.from_pretrained(model_id)
    
    prompt = "Explain quantum entanglement in simple terms."
    inputs = tokenizer(prompt, return_tensors="pt").to("cuda")
    
    # Warmup
    model.generate(**inputs, max_new_tokens=10)
    
    # Benchmark
    start = time.time()
    with torch.no_grad():
        outputs = model.generate(**inputs, max_new_tokens=200, use_cache=True)
    elapsed = time.time() - start
    
    output_tokens = outputs.shape[1] - inputs.input_ids.shape[1]
    tps = output_tokens / elapsed
    
    return {
        "tokens_per_second": tps,
        "total_time": elapsed,
        "vram_used": torch.cuda.memory_allocated() / 1e9
    }

# Compare configurations (requires GPU with 24GB VRAM)
model = "meta-llama/Meta-Llama-3-8B-Instruct"

configs = [
    {"name": "Baseline fp16", "flash": False, "quant": False},
    {"name": "Flash Attention", "flash": True, "quant": False},
    {"name": "4-bit quantized", "flash": False, "quant": True},
    {"name": "Flash + 4-bit", "flash": True, "quant": True},
]

for cfg in configs:
    result = benchmark_inference(model, cfg["flash"], cfg["quant"])
    print(f"\n{cfg['name']}:")
    print(f"  Speed: {result['tokens_per_second']:.1f} tokens/sec")
    print(f"  VRAM: {result['vram_used']:.1f} GB")
```

**Expected learning:** Flash Attention saves memory but may not always improve speed on older GPUs. Quantization saves significant VRAM. Combining them gives the best memory efficiency.

---

*Move to [Module 05 — Local AI Ecosystem](../05-local-ai-ecosystem/complete-module-05.md)*

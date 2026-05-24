# Module 02 — Datasets & Training

> *How do you teach a model? What data does it learn from?*
> This module covers everything about data: what it looks like, how to build it, and how training works.

---

# 01 — SFT Datasets

## Enterprise Data Governance Gate

Before data is used for SFT, RAG, evaluation, or logging, create a data card and get the intended use approved.

Minimum data card fields:

| Field | Required answer |
|-------|-----------------|
| Source | Where the data came from and who owns it |
| Usage rights | Whether training, evaluation, retrieval, or logging is allowed |
| Sensitivity | Public, internal, confidential, restricted, regulated |
| PII/secrets | Whether personal data, credentials, keys, or privileged content appear |
| Retention | How long the dataset and derived artifacts can be kept |
| Deletion | How data is removed from datasets, indexes, checkpoints, and logs |
| Split strategy | Train, validation, and locked test set boundaries |
| Approval | Data owner and reviewer sign-off |

Enterprise anti-pattern:

```text
"We scraped a bunch of documents and fine-tuned."
```

Enterprise-ready pattern:

```text
"We trained on approved, versioned, licensed, non-production examples.
The locked test set was created before training and is not used for optimization.
PII handling, retention, deletion, and owner approval are documented."
```

Example data card:

```markdown
# Data Card - Compliance SFT Dataset v1

**Owner:** AI training cohort
**Source:** Public regulation excerpts plus synthetic questions generated from approved prompts
**Usage rights:** Evaluation and fine-tuning for internal training only
**Sensitivity:** Internal
**PII/secrets:** None allowed; run scan before training
**Derived artifacts:** Tokenized dataset, validation split, adapter checkpoint, eval report
**Retention:** Delete working copies after cohort; keep final non-sensitive report
**Deletion path:** Remove JSONL files, notebook uploads, vector indexes, checkpoints, and logs
**Split:** 80% train, 10% validation, 10% locked test created before training
**Approval:** Data owner plus security/privacy reviewer
```

---

## What is SFT?

**SFT = Supervised Fine-Tuning**

After a model is pre-trained (it knows about the world), you need to teach it to be **helpful** — to respond to instructions, answer questions, follow formats.

You do this with an SFT dataset: a collection of **instruction → response** pairs.

Think of it like: you've hired a very well-read intern. They know everything about the world. But they need to learn HOW to be useful in your specific job context. SFT is that job training.

---

## What an SFT Dataset Looks Like

The most basic format:

```json
{
  "instruction": "Summarize the following text in one sentence.",
  "input": "The quick brown fox jumps over the lazy dog. This is a classic sentence used in typography to show all letters of the alphabet.",
  "output": "This sentence about a fox jumping over a dog is commonly used in typography to display all 26 letters of the alphabet."
}
```

Or in chat format (more common now):

```json
{
  "messages": [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is the capital of Germany?"},
    {"role": "assistant", "content": "The capital of Germany is Berlin."}
  ]
}
```

---

## Types of SFT Data

| Type | Description | Example |
|------|-------------|---------|
| QA pairs | Question + Answer | "What is photosynthesis?" + explanation |
| Instruction following | Task description + completion | "Write a haiku about rain" + haiku |
| Coding | Problem description + working code | "Write a Python sort function" + code |
| Conversational | Multi-turn dialogue | Full conversation with context |
| Format following | Output in specific format | "Extract entities as JSON" + JSON |
| Chain of thought | Question + step-by-step reasoning | Math problem + working out + answer |

---

## Popular SFT Datasets

| Dataset | Description | Size |
|---------|-------------|------|
| Alpaca | GPT-4 generated instructions | 52K examples |
| OpenHermes | High-quality mixed instruction data | 1M+ examples |
| ShareGPT | Real ChatGPT conversations | 90K+ conversations |
| FLAN | Google's instruction tuning data | 1.8M examples |
| Dolly | Human-written instructions | 15K examples |
| UltraChat | Multi-turn conversations | 1.5M conversations |

---

## Quality vs Quantity

**The biggest insight in modern SFT:**

> 1,000 high-quality examples > 100,000 low-quality examples

Meta's LLaMA 2 paper showed that quality matters far more than volume.

This is why **data curation** is a full-time job in AI labs.

---

## What Makes an SFT Example "High Quality"?

- **Accurate**: The response must be factually correct
- **Complete**: Answers the question fully
- **Appropriate format**: Matches what users actually want
- **No harmful content**: No bias, toxicity, or wrong information
- **Diverse**: Covers many topics, styles, difficulty levels
- **Chain of thought**: Shows reasoning when appropriate

---

# 02 — Instruction Tuning

## What is Instruction Tuning?

Instruction tuning is the process of fine-tuning a pre-trained language model on SFT data to make it follow instructions.

Pre-trained model: "The cat sat on the mat. The dog..." (just predicts next words)

After instruction tuning: "Here's a haiku about cats..." (follows the instruction)

---

## The FLAN Papers: Where It Started

Google's FLAN (Fine-tuned Language Net) papers showed:
1. Fine-tuning on a diverse set of tasks makes models follow NEW, unseen instructions better
2. Chain-of-thought examples dramatically improve reasoning
3. Larger models benefit more from instruction tuning

Key insight: **Diversity of tasks matters.** A model trained on 1000 different task types generalizes better than one trained on 1000 examples of one task.

---

## Chat Templates: How Instructions Are Formatted

Different models use different chat templates. This is crucial — wrong template = garbled outputs.

### ChatML format (GPT models, Qwen, etc.)
```
<|im_start|>system
You are a helpful assistant.
<|im_end|>
<|im_start|>user
What is 2+2?
<|im_end|>
<|im_start|>assistant
2+2 equals 4.
<|im_end|>
```

### LLaMA 3 format
```
<|begin_of_text|><|start_header_id|>system<|end_header_id|>

You are a helpful assistant.<|eot_id|><|start_header_id|>user<|end_header_id|>

What is 2+2?<|eot_id|><|start_header_id|>assistant<|end_header_id|>

2+2 equals 4.<|eot_id|>
```

### Alpaca format (older, simpler)
```
Below is an instruction. Write a response.

### Instruction:
What is 2+2?

### Response:
2+2 equals 4.
```

**Why this matters:** You MUST use the exact template the model was trained with. Using the wrong template causes the model to produce strange outputs or not follow instructions properly.

```python
# Using Hugging Face tokenizer to apply the right template
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("meta-llama/Meta-Llama-3-8B-Instruct")

messages = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "What is 2+2?"}
]

# Apply the correct template automatically
prompt = tokenizer.apply_chat_template(
    messages,
    tokenize=False,
    add_generation_prompt=True
)
print(prompt)
```

---

# 03 — Preference Datasets

## Beyond "Correct vs Incorrect"

SFT teaches a model to be helpful. But "helpful" isn't binary.

Consider two answers to "Explain quantum entanglement":
- Answer A: Technically correct but dense, jargon-heavy
- Answer B: Correct, clear, uses good analogies

Both answers are "correct" for SFT. But humans strongly prefer B.

**Preference datasets** capture these comparisons.

---

## What a Preference Dataset Looks Like

```json
{
  "prompt": "Explain quantum entanglement to a non-scientist",
  "chosen": "Imagine you have two magic coins. Whenever you flip one and it lands heads, the other instantly lands tails — no matter how far apart they are. Quantum entanglement works similarly: two particles become linked so that measuring one instantly affects the other, even across vast distances.",
  "rejected": "Quantum entanglement is a phenomenon where two particles are correlated such that the quantum state of each cannot be described independently of the others, even when separated by a large distance. It involves non-local correlations that violate classical intuitions about locality."
}
```

Both "chosen" and "rejected" might be factually correct. The "chosen" is preferred because it's clearer and more appropriate for the audience.

---

## How Preference Data is Collected

### Human feedback (expensive but gold standard)
- Show human raters the same prompt with multiple responses
- Have them rank or choose preferred responses
- This is what OpenAI/Anthropic do internally with large rater teams

### AI feedback (cheaper, scalable)
- Use a strong model (like GPT-4) to rate/rank responses from a weaker model
- Called "AI feedback" or "model-as-judge"
- Faster and cheaper, but inherits the judging model's biases

### Constitutional AI (Anthropic's approach)
- Define principles (the "constitution")
- Have AI critique and revise its own responses based on those principles
- Creates preference data at scale without human raters for every example

---

## Popular Preference Datasets

| Dataset | Description |
|---------|-------------|
| HH-RLHF | Anthropic's human feedback data |
| Ultrafeedback | GPT-4 rated 64K prompts |
| Orca DPO | Microsoft's preference data |
| Argilla DPO Mix | Curated mix for DPO training |

---

# 04 — Synthetic Datasets

## The Data Problem

High-quality human-written data is:
- Expensive (need to pay humans)
- Slow to collect
- Hard to get in specialized domains
- May have quality inconsistencies

**Synthetic data** = data generated by an LLM.

---

## How Synthetic Data Generation Works

```python
import anthropic

client = anthropic.Anthropic()

def generate_qa_pair(topic):
    # Step 1: Generate a question about the topic
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=500,
        messages=[{
            "role": "user",
            "content": f"""Generate a challenging but reasonable question about {topic}.
            Output ONLY the question, nothing else."""
        }]
    )
    question = response.content[0].text
    
    # Step 2: Generate a high-quality answer
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1000,
        messages=[{
            "role": "user",
            "content": f"""Answer this question with accuracy and clarity:
            
            {question}
            
            Provide a thorough, well-structured answer."""
        }]
    )
    answer = response.content[0].text
    
    return {"instruction": question, "output": answer}

# Generate 100 examples about financial compliance
examples = [generate_qa_pair("EU financial regulation") for _ in range(100)]
```

---

## Techniques for High-Quality Synthetic Data

### Evol-Instruct (WizardLM technique)
Take a simple instruction and make it harder:
```
Original: "Write a Python function to sort a list"
Evolved: "Write a Python function to sort a list of dictionaries by multiple keys, with custom comparison functions and handling for None values"
```

### Self-Instruct
Have the model generate both the instruction AND the response, then filter for quality.

### Persona-based generation
Generate data from different perspectives:
```
"As a beginner programmer, ask a question about Python"
"As a senior developer, answer that question with best practices"
```

### Magpie (recent technique, 2024)
Prompt a model with just the system prompt and user role header — let it generate realistic user messages naturally.

---

## The Contamination Problem

Synthetic data risks include:
- **Model collapse**: If you train on AI-generated data, then generate more with that model, repeat... quality degrades over generations
- **Bias amplification**: LLMs have biases; synthetic data inherits them
- **Hallucinations in training data**: If the generator hallucinates, you train on wrong information

**Solutions:**
- Mix with real human data
- Use multiple different models
- Verify factual claims with external tools
- Filter aggressively

---

# 05 — Data Curation & Cleaning

## The "Garbage In, Garbage Out" Problem

If your training data has:
- Wrong answers → model learns wrong answers
- Harmful content → model learns harmful behaviors
- Bad formatting → model produces garbled outputs
- Duplicates → model memorizes instead of generalizing

Data cleaning is the most unglamorous but most impactful part of LLM development.

---

## Steps in Data Curation

### Step 1: Deduplication
Remove exact and near-duplicate entries:
```python
from datasets import Dataset
import hashlib

def deduplicate(examples):
    seen = set()
    unique = []
    for ex in examples:
        # Create hash of the instruction
        h = hashlib.md5(ex['instruction'].encode()).hexdigest()
        if h not in seen:
            seen.add(h)
            unique.append(ex)
    return unique
```

### Step 2: Length filtering
Too short = not useful. Too long = might be spam or scraped junk.
```python
def filter_by_length(example):
    instruction_len = len(example['instruction'].split())
    response_len = len(example['output'].split())
    return 10 <= instruction_len <= 500 and 20 <= response_len <= 2000
```

### Step 3: Quality scoring
Use a model or classifier to score quality:
```python
# Simple heuristics
def quality_score(example):
    score = 0
    response = example['output']
    
    # Penalize very short responses
    if len(response.split()) < 50:
        score -= 2
    
    # Penalize responses that start with "I cannot" (often refusals of legitimate questions)
    if response.startswith("I cannot") or response.startswith("I can't"):
        score -= 1
    
    # Reward structured responses
    if "##" in response or "1." in response:
        score += 1
    
    # Penalize repetitive text
    words = response.split()
    unique_ratio = len(set(words)) / len(words)
    if unique_ratio < 0.5:
        score -= 3
    
    return score
```

### Step 4: Language filtering
Ensure consistent language:
```python
from langdetect import detect

def filter_english(example):
    try:
        return detect(example['instruction']) == 'en'
    except:
        return False
```

### Step 5: Content safety filtering
Remove harmful content:
```python
# Use a classifier or model to flag harmful content
# Perspective API, OpenAI Moderation API, etc.
```

---

## Data Mixing

Don't train on one type of data only. Mix different sources with different ratios:

```python
# Example data mixing strategy
data_config = {
    "general_qa": {"path": "alpaca_data.json", "weight": 0.3},
    "coding": {"path": "code_instructions.json", "weight": 0.2},
    "domain_specific": {"path": "fiserv_compliance.json", "weight": 0.4},
    "conversations": {"path": "sharegpt.json", "weight": 0.1}
}

# Sample according to weights
import random

def sample_dataset(data_config, total_examples=100000):
    all_examples = []
    for name, config in data_config.items():
        data = load_data(config["path"])
        sample_size = int(total_examples * config["weight"])
        sample = random.sample(data, min(sample_size, len(data)))
        all_examples.extend(sample)
    
    random.shuffle(all_examples)
    return all_examples
```

---

# 06 — Dataset Formatting

## The Format Wars

Different training frameworks expect data in different formats. Getting this wrong is a common source of bugs.

### JSONL (JSON Lines) — most common
```jsonl
{"messages": [{"role": "user", "content": "Hello"}, {"role": "assistant", "content": "Hi there!"}]}
{"messages": [{"role": "user", "content": "What is AI?"}, {"role": "assistant", "content": "AI stands for..."}]}
```

### CSV/Parquet
```csv
instruction,output
"Summarize this text: ...","Here is a summary: ..."
"Write a haiku","Old pond..."
```

### HuggingFace datasets format
```python
from datasets import Dataset

data = {
    "instruction": ["What is AI?", "Write code to sort a list"],
    "output": ["AI stands for...", "def sort_list(lst): ..."]
}
dataset = Dataset.from_dict(data)
dataset.push_to_hub("your-username/your-dataset-name")
```

---

## Formatting for Different Frameworks

### For Unsloth/TRL (most common for fine-tuning)
```python
def format_prompt(example, tokenizer):
    messages = [
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": example["instruction"]},
        {"role": "assistant", "content": example["output"]}
    ]
    return tokenizer.apply_chat_template(messages, tokenize=False)
```

### For Axolotl
```yaml
# config.yml
datasets:
  - path: my_dataset.jsonl
    type: chat_template
    chat_template: chatml
```

---

# 07 — Fine-Tuning Basics

## What is Fine-Tuning?

Fine-tuning = taking a pre-trained model and continuing training on your specific dataset.

**Analogy:** A doctor is already a trained professional (pre-training). When they specialize in cardiology, they do additional training specific to heart conditions (fine-tuning).

---

## When to Fine-Tune vs When to Prompt

| Situation | Solution |
|-----------|----------|
| Model needs specific knowledge | Fine-tune or RAG |
| Model needs specific style/format | Fine-tune |
| Model needs to stay current | RAG (fine-tuning knowledge decays) |
| Task is well-defined and repeatable | Fine-tune |
| Quick prototype | Prompt engineering |
| Model should refuse certain things | Fine-tune |
| You want consistent output format | Fine-tune |

---

## The Fine-Tuning Process

```python
# High-level fine-tuning workflow

# 1. Load base model
from transformers import AutoModelForCausalLM, AutoTokenizer

model = AutoModelForCausalLM.from_pretrained("meta-llama/Meta-Llama-3-8B")
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Meta-Llama-3-8B")

# 2. Configure training
from transformers import TrainingArguments

training_args = TrainingArguments(
    output_dir="./results",
    num_train_epochs=3,
    per_device_train_batch_size=4,
    learning_rate=2e-4,
    save_steps=100,
    logging_steps=10,
)

# 3. Prepare dataset
# (formatted examples as shown above)

# 4. Train
from trl import SFTTrainer

trainer = SFTTrainer(
    model=model,
    tokenizer=tokenizer,
    train_dataset=dataset,
    args=training_args,
)

trainer.train()

# 5. Save
model.save_pretrained("./my-fine-tuned-model")
```

---

## Key Hyperparameters

| Hyperparameter | What It Does | Typical Range |
|----------------|-------------|---------------|
| learning_rate | How fast to adjust weights | 1e-5 to 5e-4 |
| num_train_epochs | How many times to see all data | 1-5 |
| batch_size | Examples processed at once | 2-32 |
| max_seq_length | Maximum token length | 512-4096 |
| warmup_steps | Gradual lr increase at start | 50-200 |
| weight_decay | Prevents overfitting | 0.01-0.1 |

**Learning rate is the most important.** Too high = model breaks (catastrophic forgetting). Too low = model doesn't learn.

---

## Overfitting: The Enemy of Fine-Tuning

**Overfitting** = the model memorizes training examples instead of learning general patterns.

Signs of overfitting:
- Training loss very low
- Validation loss going UP
- Model outputs suspiciously similar to training examples

Solutions:
- More diverse training data
- Fewer training epochs
- Lower learning rate
- Dropout regularization

```
Epoch 1: Train loss: 1.2, Val loss: 1.3  ✓ Good
Epoch 2: Train loss: 0.9, Val loss: 1.1  ✓ Good
Epoch 3: Train loss: 0.7, Val loss: 1.0  ✓ OK
Epoch 4: Train loss: 0.5, Val loss: 1.2  ⚠️ Starting to overfit
Epoch 5: Train loss: 0.3, Val loss: 1.8  ❌ Overfitting!
```

---

# 08 — Continued Pretraining

## When Fine-Tuning Isn't Enough

SFT teaches a model HOW to respond. But if the model doesn't KNOW your domain, SFT alone won't fix that.

Example: Fine-tuning LLaMA on Fiserv compliance data to answer questions.
- If LLaMA never saw PSD2 regulation text during pre-training, it won't know PSD2.
- SFT teaches it to answer in the right format.
- But the knowledge needs to come from somewhere.

Options:
1. **RAG**: Inject knowledge at inference time (usually better)
2. **Continued pretraining**: Inject knowledge during training

---

## What Continued Pretraining Does

It continues the pre-training phase (next-token prediction) on your domain data BEFORE doing SFT.

```
Base Model (general knowledge)
    ↓
Continued Pretraining on domain text (absorb domain knowledge)
    ↓
SFT (learn to be helpful in that domain)
    ↓
Domain Expert Model
```

This is expensive (more like pre-training than fine-tuning) but can dramatically improve performance in narrow domains.

---

## When to Use It

- Legal, medical, financial domains with specialized terminology
- Rare languages or languages underrepresented in pre-training
- Proprietary codebases the model never saw
- Technical documentation for niche software

---

# 09 — Hallucination Reduction

## What is Hallucination?

Hallucination = the model generates confident-sounding but false information.

```
User: "Who wrote the novel 'The Great Gatsby'?"
Good answer: "F. Scott Fitzgerald wrote The Great Gatsby."
Hallucination: "The Great Gatsby was written by Ernest Hemingway in 1926."
(Wrong author, potentially wrong year)
```

Hallucinations happen because:
- The model doesn't know something → generates a plausible-sounding guess
- The training data had contradictions
- The model learned to be confident, not accurate
- Very similar facts can "bleed" into each other

---

## Hallucination Reduction Techniques

### 1. RAG (Retrieval-Augmented Generation)
Give the model the actual information at inference time. If it can't find the answer in provided context, have it say "I don't know."
→ Best for factual, up-to-date information

### 2. Fine-tune with "I don't know" examples
Include training examples where the correct response is admitting uncertainty:
```json
{
  "instruction": "What is the CEO of XYZ Corp as of December 2024?",
  "output": "I don't have reliable information about XYZ Corp's current leadership. I recommend checking their official website or recent news sources."
}
```

### 3. Chain-of-thought fine-tuning
Train the model to show its reasoning before answering. Reasoning reveals uncertainty:
```
Question: What year was X invented?
Bad: "X was invented in 1943." (confident, possibly wrong)
Good: "Let me think through this. X was developed in the mid-20th century... Based on what I recall, it was around 1945, but I'm not entirely certain of the exact year."
```

### 4. Temperature tuning
Lower temperature = less random = less likely to generate off-the-wall hallucinations.
For factual tasks, use temperature 0 or close to 0.

### 5. Constitutional AI / RLAIF
Train the model to self-critique its responses. If it catches uncertainty, it should express it.

### 6. Structured output with citations
Force the model to cite sources for every claim. If it can't cite, it shouldn't state:
```
System prompt: "Answer only based on the provided documents. 
For each fact you state, include [Source: Document Name, Page X].
If the documents don't contain the answer, say 'The provided documents don't contain information about this.'"
```

---

## 📝 Module 02 Summary

| Concept | What You Learned |
|---------|-----------------|
| SFT datasets | Instruction-response pairs that teach models to be helpful |
| Instruction tuning | Training on diverse tasks with correct chat templates |
| Preference datasets | Chosen vs rejected pairs to capture human preference |
| Synthetic data | LLM-generated training data (powerful, but watch for quality) |
| Data curation | Dedup, filter, quality-score your data before training |
| Dataset formatting | JSONL, chat templates, framework-specific formats |
| Fine-tuning basics | Continued training on a pre-trained model, key hyperparameters |
| Continued pretraining | Inject domain knowledge before SFT |
| Hallucination reduction | RAG, "I don't know" training, structured outputs |

---

## 🧠 Mental Model

> Training data is school curriculum. SFT data is the textbook. Preference data is the grading rubric. Clean data is well-written lessons. Garbage data is studying the wrong material entirely.
> 
> The model becomes what it reads.

---

## ❌ Beginner Mistakes to Avoid

1. **Skipping data cleaning** — 1,000 clean examples beat 100,000 noisy ones
2. **Using the wrong chat template** — Breaks the model silently; outputs look weird
3. **Training too many epochs** — Leads to overfitting; 1-3 epochs is usually enough
4. **Relying on synthetic data only** — Mix with human-written data
5. **Not holding out a validation set** — You won't know if you're overfitting
6. **Fine-tuning for knowledge, when RAG is better** — Fine-tune for style/format; use RAG for facts

---

## 🏋️ Module Exercise

**Build and inspect a small SFT dataset:**

```python
# Build a tiny compliance QA dataset using Claude
import anthropic
import json

client = anthropic.Anthropic()

topics = [
    "GDPR data retention requirements",
    "PSD2 strong customer authentication",
    "Basel III capital requirements",
    "MiFID II transaction reporting",
    "AML/KYC verification procedures"
]

dataset = []

for topic in topics:
    # Generate Q&A pair
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=600,
        messages=[{
            "role": "user",
            "content": f"""Generate one detailed Q&A pair about: {topic}
            
Format as JSON with keys "instruction" and "output".
The instruction should be a specific question a compliance officer would ask.
The output should be a clear, accurate, professional answer (3-5 sentences).
Output ONLY the JSON, nothing else."""
        }]
    )
    
    try:
        qa_pair = json.loads(response.content[0].text)
        dataset.append(qa_pair)
        print(f"✓ Generated: {topic}")
    except json.JSONDecodeError:
        print(f"✗ Failed to parse: {topic}")

# Save as JSONL
with open("compliance_sft_dataset.jsonl", "w") as f:
    for example in dataset:
        f.write(json.dumps(example) + "\n")

print(f"\nDataset created: {len(dataset)} examples")

# Inspect quality
for ex in dataset[:2]:
    print("\n---")
    print(f"Q: {ex['instruction']}")
    print(f"A: {ex['output'][:200]}...")
```

**Goal:** Create 20-50 domain-specific examples and inspect them for quality. This is the foundation of every real fine-tuning project.

### Lab Submission

Submit:

- `compliance_sft_dataset.jsonl` with 20-50 examples.
- `data-card.md` documenting source, usage rights, sensitivity, PII/secrets status, retention, deletion, split strategy, and approval owner.
- `quality-report.md` with 10 manually inspected examples and notes on accuracy, completeness, format, and risk.
- `splits/` containing `train.jsonl`, `validation.jsonl`, and `test.jsonl`.
- `README.md` explaining how the dataset was generated, cleaned, and reviewed.

### Pass/Fail Standard

| Requirement | Pass standard |
|-------------|---------------|
| Dataset validity | Every line is valid JSON with `instruction` and `output` |
| Quality | At least 90% of sampled examples are accurate, complete, and in the intended style |
| Governance | Data card clearly allows the intended use and names an owner |
| Privacy | No real PII, secrets, privileged data, or unapproved customer data |
| Split discipline | Locked test split is created before any model training |
| Reproducibility | Generation prompt, model, date, and cleanup rules are documented |

---

*Move to [Module 03 — Fine-Tuning](../03-fine-tuning/complete-module-03.md)*

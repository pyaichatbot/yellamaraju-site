import { useState, useEffect, useRef } from "react";

const TOPICS = [
  {
    id: 0,
    title: "Eval Harness",
    emoji: "🧪",
    tagline: "The nervous system of every production LLM system",
    color: "#00D4AA",
    gradient: "linear-gradient(135deg, #00D4AA 0%, #007A62 100%)",
    level: "Foundation",
    readTime: "25 min",
    interviewWeight: "★★★★★",
    sections: [
      {
        title: "What Is an Eval Harness?",
        type: "concept",
        content: `An **eval harness** is the automated testing infrastructure that continuously measures whether your LLM system is actually doing what you think it's doing. 

Think of it like a **flight simulator for AI**: before any pilot (prompt, model, or retriever) goes into production, it runs through thousands of test scenarios. Failures are caught early, not in front of your users.

**Karpathy's mental model:** "LLM = CPU, context window = RAM, eval harness = the OS that tells you if the program crashed."

Without evals, you're flying blind. You might improve your prompt for three scenarios and unknowingly break 50 others — this is called **silent regression** and it kills production AI systems.`,
        analogy: {
          title: "🏥 The Hospital Analogy",
          text: "Imagine a hospital that never checks patient vitals after a procedure. Doctors 'feel good' about outcomes but have no data. An eval harness is the monitoring system that checks every patient (query), measures every outcome (response quality), and alerts when something degrades — before the patient dies (before users churn)."
        }
      },
      {
        title: "Architecture Deep Dive",
        type: "architecture",
        diagram: `
┌─────────────────────────────────────────────────────────────────┐
│                      EVAL HARNESS PIPELINE                       │
│                                                                   │
│  ┌─────────────┐    ┌──────────────┐    ┌───────────────────┐  │
│  │  Test Suite  │───▶│  LLM System  │───▶│  Scorer / Judge   │  │
│  │             │    │  (Under Test) │    │                   │  │
│  │ • Golden    │    │              │    │ • Rule-based      │  │
│  │   Q&A pairs │    │ Prompt +     │    │ • Embedding sim   │  │
│  │ • Edge cases│    │ RAG + Tools  │    │ • LLM-as-Judge    │  │
│  │ • Adversar. │    │              │    │ • Human eval      │  │
│  └─────────────┘    └──────────────┘    └─────────┬─────────┘  │
│                                                    │             │
│  ┌─────────────────────────────────────────────────▼──────────┐ │
│  │               METRICS AGGREGATOR                           │ │
│  │  Accuracy | Faithfulness | Relevance | Latency | Cost      │ │
│  └─────────────────────────────────────────────────┬──────────┘ │
│                                                    │             │
│  ┌─────────────────────────────────────────────────▼──────────┐ │
│  │         REGRESSION GATE (CI/CD)                            │ │
│  │   ✅ Score > threshold → Deploy  ❌ Score drops → Block    │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘`,
        content: `**The 5 layers of a production eval harness:**

**1. Test Suite (Inputs)** — Your golden dataset. Contains:
- Reference Q&A pairs manually verified by humans
- Adversarial inputs (jailbreaks, weird edge cases, typos)
- Regression tests from past failures
- Canary queries (simple cases that must NEVER fail)

**2. LLM System Under Test** — The actual pipeline (prompt + model + RAG + tools). This runs in isolation — same as production, but with test inputs.

**3. Scorer / Judge** — How you grade outputs. Hierarchy of trust:
- **Exact match**: "Is the answer 'Paris'?" (lowest cost, highest precision)
- **Embedding similarity**: Semantic overlap via cosine distance
- **LLM-as-Judge**: Ask GPT-4 or Claude to grade on a rubric (expensive, high signal)
- **Human eval**: Gold standard, used sparingly for calibration

**4. Metrics Aggregator** — Compiles scores into dashboard. Track trends, not just snapshots.

**5. Regression Gate** — The gatekeeper. In your CI/CD, if eval scores drop below thresholds → deployment blocked. This is called **eval-gated deployment**.`
      },
      {
        title: "Key Metrics You Must Know",
        type: "metrics",
        content: `**For RAG systems (RAGAS framework):**
- **Context Recall**: Did retrieval find the relevant chunks? (0-1)
- **Context Precision**: Of retrieved chunks, how many were actually useful? (0-1)
- **Answer Faithfulness**: Does the answer stay grounded in retrieved context? Key for hallucination detection
- **Answer Relevance**: Does the answer actually address the question?

**For general LLM systems:**
- **BLEU / ROUGE**: Token overlap with reference answers (good for summarization, bad for open-ended)
- **BERTScore**: Embedding-level semantic similarity (better than BLEU)
- **Pass@k**: For code — does the model solve the problem in k attempts?
- **LLM Judge Score**: 1-5 rubric scored by a frontier model (GPT-4, Claude)

**NFR metrics (Non-Functional Requirements):**
- P50/P95/P99 latency per eval run
- Token cost per query (track regressions in cost too!)
- Throughput: evals/hour capacity`
      },
      {
        title: "Anti-Patterns to Avoid",
        type: "antipatterns",
        items: [
          { name: "Eval on train data", desc: "Testing on the data you used to build the system. Like memorizing the exam answers. Gives false confidence — performance will be much worse in production." },
          { name: "LLM-only scoring", desc: "Using GPT-4 to grade GPT-4 outputs without any reference. The judge may share the same failure modes as the system under test." },
          { name: "No regression gate", desc: "Running evals as a report but not blocking deploys. Teams see scores drop and still ship. 'We'll fix it next sprint' kills products." },
          { name: "Static test suites", desc: "Never adding new failures to the test suite. Production always generates new edge cases. Your evals should grow with every incident." },
          { name: "Aggregate-only metrics", desc: "Only tracking average score. A system that scores 85% average might fail 100% on a critical subgroup (medical questions, legal queries)." }
        ]
      },
      {
        title: "System Design: Build a Production Eval Harness",
        type: "systemdesign",
        content: `**Scenario: You're building evals for a compliance chatbot at a fintech.**

**Step 1 — Define evaluation criteria upfront:**
- Faithfulness (never hallucinate regulations)
- Completeness (answer covers the full regulatory requirement)
- Citation accuracy (references are real and current)
- Refusal rate (system should refuse out-of-scope queries)

**Step 2 — Build the golden dataset:**
- 500 Q&A pairs from domain experts
- 100 adversarial inputs (trick questions, out-of-scope)
- 50 canary queries that must always pass

**Step 3 — Choose your scorer:**
- Rule-based: regex checks for citation format
- LLM judge: Claude grades faithfulness on 1-5 rubric
- Embedding: cosine sim > 0.85 with reference answer

**Step 4 — Wire into CI/CD:**
\`\`\`
GitHub PR → eval harness runs (2 min) → 
  if faithfulness < 0.90 → PR blocked ❌
  if latency p95 > 3s → PR blocked ❌
  if cost > $0.05/query → warning ⚠️
  else → deploy approved ✅
\`\`\`

**Step 5 — Online eval (production monitoring):**
Sample 5% of live queries → async eval → alert if scores drift`,
        nfrs: ["Eval suite runs < 5 min on CI", "95% eval coverage of production query distribution", "False positive rate on regression gate < 2%", "Eval results stored immutably for audit"]
      },
      {
        title: "Interview Q&A",
        type: "interview",
        qas: [
          { q: "How do you prevent eval leakage / data contamination?", a: "Keep eval sets in a separate, locked repo. Never expose them to the prompt engineering process. Use hash-based deduplication to ensure no train/eval overlap. Rotate a portion of the eval set monthly." },
          { q: "When would you use LLM-as-Judge vs. rule-based eval?", a: "Rule-based for precision requirements (regex, exact match, schema validation). LLM-as-Judge for semantic quality (does this response 'feel' right, is the tone appropriate, is the reasoning sound). Calibrate LLM judges against human labels first — aim for >85% agreement before trusting them." },
          { q: "How do you handle eval at scale (millions of daily queries)?", a: "Online stratified sampling: randomly sample 1-5% of queries per cohort (user type, query category). Run evals async so they don't block inference. Use lightweight heuristics for 95% of queries, full LLM-judge for the sampled 5%. Store all results in a time-series DB for trend detection." },
          { q: "What's the difference between offline eval and online eval?", a: "Offline eval: runs on fixed test sets before deployment. Catches regressions. Online eval: monitors live traffic after deployment. Catches distribution shift, novel failure modes, and real-world edge cases that test sets didn't anticipate. You need both." }
        ]
      }
    ]
  },
  {
    id: 1,
    title: "RAG + Reranking",
    emoji: "🔍",
    tagline: "Grounding LLMs in truth — the #1 production AI pattern",
    color: "#FF6B6B",
    gradient: "linear-gradient(135deg, #FF6B6B 0%, #C0392B 100%)",
    level: "Core",
    readTime: "30 min",
    interviewWeight: "★★★★★",
    sections: [
      {
        title: "What Is RAG?",
        type: "concept",
        content: `**RAG (Retrieval-Augmented Generation)** is the most important pattern in production LLM systems. Instead of relying on what the model memorized during training (which gets stale), RAG dynamically fetches relevant external knowledge at query time and includes it in the context.

**The core problem RAG solves:**
- LLMs hallucinate when asked about information they weren't trained on (post-cutoff events, private company data, specialized domain knowledge)
- Fine-tuning is expensive and creates knowledge that goes stale
- RAG is cheaper, fresher, and more auditable

**RAG reduces hallucination rates by 40-60% in production systems** compared to base models (DataCamp, 2026).`,
        analogy: {
          title: "📚 The Open-Book Exam Analogy",
          text: "Imagine a closed-book exam vs. open-book. A closed-book model memorizes everything but forgets details and makes things up under pressure. A RAG model takes an open-book exam — it retrieves the right pages, reads them, and answers based on what's in front of it. The answer is grounded, citable, and auditable. This is why regulated industries (finance, healthcare, legal) almost exclusively use RAG."
        }
      },
      {
        title: "Full RAG Architecture",
        type: "architecture",
        diagram: `
┌─────────────────────────────────────────────────────────────────────┐
│                   PRODUCTION RAG SYSTEM (2025)                       │
│                                                                       │
│  INDEXING PIPELINE (offline)                                         │
│  Documents → Chunker → Embedder → Vector DB + BM25 Index            │
│                                                                       │
│  QUERY PIPELINE (online, per request)                                │
│                                                                       │
│  User Query                                                           │
│      │                                                                │
│      ▼                                                                │
│  ┌───────────────┐                                                    │
│  │ Query Rewriter │ ← (Optional: expand, decompose, HyDE)           │
│  └───────┬───────┘                                                    │
│          │                                                            │
│    ┌─────┴──────────────────────────┐                                │
│    │                                │                                 │
│    ▼                                ▼                                 │
│  Dense Retrieval              Sparse Retrieval                        │
│  (Embedding + ANN)            (BM25 / TF-IDF)                       │
│    │                                │                                 │
│    └─────────────┬──────────────────┘                                │
│                  │ top-K candidates (e.g. 100)                       │
│                  ▼                                                    │
│         ┌───────────────┐                                            │
│         │   RERANKER    │  ← Cross-encoder (Cohere, BGE, etc.)     │
│         │ (Cross-Encoder)│                                           │
│         └───────┬───────┘                                            │
│                 │ top-N results (e.g. 5)                             │
│                 ▼                                                    │
│         ┌───────────────┐                                            │
│         │  Context      │                                            │
│         │  Assembly     │ ← "Lost in the middle" mitigation         │
│         └───────┬───────┘                                            │
│                 │                                                    │
│                 ▼                                                    │
│              LLM Generation                                           │
│                 │                                                    │
│                 ▼                                                    │
│           Final Answer + Citations                                   │
└─────────────────────────────────────────────────────────────────────┘`,
        content: `**Why two-stage retrieval (retrieve then rerank)?**

**Stage 1 — Recall phase:** Get the top-100 candidates fast using:
- **Dense retrieval**: Embed query → find nearest neighbors in vector space (semantic understanding)
- **Sparse retrieval**: BM25/TF-IDF for keyword matching (exact term precision)
- **Hybrid**: Combine both with Reciprocal Rank Fusion (RRF)

*Why not use a cross-encoder for initial retrieval?* Because cross-encoders compare query × document pairs, which is O(n) at query time — too slow for millions of documents.

**Stage 2 — Precision phase (Reranking):** Take top-100, rerank with a cross-encoder:
- Cross-encoder jointly encodes query + document → extremely accurate relevance score
- Cohere Rerank, BGE Reranker, ms-marco-MiniLM are common choices
- Reduces top-100 to top-5 with much higher precision`
      },
      {
        title: "Advanced RAG Techniques",
        type: "concept",
        content: `**Query Transformation:**
- **HyDE (Hypothetical Document Embeddings)**: Generate a hypothetical answer, then use IT as the retrieval query. Works because the embedding space of a well-formed answer is closer to relevant documents than a short query.
- **Sub-query decomposition**: Break "What were Apple's revenue and net profit in Q3 2024 and how did it compare to Q3 2023?" into 4 separate retrieval queries.
- **Query expansion**: Use LLM to generate synonyms and related terms before retrieval.

**Chunking Strategies (crucial and often overlooked):**
- **Fixed-size chunking**: 512 tokens with 10% overlap. Fast, simple, ignores structure.
- **Semantic chunking**: Split at topic boundaries (embed sentences, split where similarity drops). Better for long documents.
- **Hierarchical chunking**: Index both paragraph-level AND document-level summaries. At query time, match on summary, retrieve full paragraph.
- **Small-to-big**: Index small chunks for precision retrieval, expand to surrounding context for generation.

**The "Lost in the Middle" Problem:**
Research shows LLMs lose >30% accuracy for context in the middle of the prompt. **Fix**: Place the most relevant chunks at the beginning AND end of the context. Never bury critical information in the middle.`
      },
      {
        title: "Anti-Patterns",
        type: "antipatterns",
        items: [
          { name: "Naive chunking", desc: "Splitting documents every 512 tokens with no regard for sentence or paragraph boundaries. Chunks become semantically incoherent. Retrieval quality tanks." },
          { name: "No reranking", desc: "Passing top-5 from vector search directly to the LLM. Dense retrieval has high recall but low precision — you're sending noisy context and getting hallucinations." },
          { name: "One retrieval call per query", desc: "Complex queries need multiple retrievals. 'Compare Apple and Microsoft revenue' needs two separate lookups. Single retrieval misses one." },
          { name: "Embedding model mismatch", desc: "Using a generic embedding model for a specialized domain (legal, medical). Domain-specific embeddings dramatically outperform generic ones." },
          { name: "Stale vector index", desc: "Not updating the index when documents change. Users retrieve outdated information with full confidence. Implement incremental indexing with soft deletes." }
        ]
      },
      {
        title: "System Design: Enterprise Knowledge Base",
        type: "systemdesign",
        content: `**Design a RAG system for a 10M document legal knowledge base with 10K QPS**

**Indexing pipeline:**
- PDF/DOCX → Unstructured.io → clean text
- Semantic chunking (avg 300 tokens, max 512)
- Embed with domain-tuned model (e.g., legal-bert-large)
- Store in pgvector (scale) or Pinecone (managed)
- Also index in Elasticsearch for BM25

**Query pipeline:**
- HyDE query expansion for complex legal queries
- Hybrid retrieval: dense (top-100) + sparse (top-100) → RRF merge → top-100
- Cross-encoder reranker → top-5
- Context assembly with citation metadata
- LLM generation with "answer only from provided context" instruction

**Scale considerations:**
- ANN index (HNSW) for sub-10ms vector search
- Reranker batch size optimization (GPU inference, 8 queries/batch)
- Cache top-100 retrieval results for common queries (TTL: 1 hour)
- Async indexing for document updates (Kafka → worker → upsert)`,
        nfrs: ["E2E latency < 2s at P95", "Retrieval recall@5 > 0.85", "Index update lag < 30 minutes", "99.9% availability with multi-AZ vector DB"]
      },
      {
        title: "Interview Q&A",
        type: "interview",
        qas: [
          { q: "When would you choose RAG over fine-tuning?", a: "RAG: knowledge is external/private, updates frequently, needs citations, domain coverage is broad. Fine-tuning: you need specific behavior/style changes, latency is critical (no retrieval step), or you want to compress domain knowledge into weights. In practice, RAG + fine-tuning often work together: fine-tune for behavior, RAG for knowledge." },
          { q: "What's the difference between bi-encoder and cross-encoder retrieval?", a: "Bi-encoder (used in initial retrieval): encodes query and document INDEPENDENTLY. Pre-computes document embeddings offline. O(1) lookup at query time via ANN. High recall, moderate precision. Cross-encoder (used in reranking): encodes query AND document JOINTLY. Sees the full context of both. Much more accurate relevance scoring but O(n) — only feasible on small candidate sets." },
          { q: "How do you handle multi-hop reasoning in RAG?", a: "Iterative retrieval: retrieve → generate intermediate reasoning → retrieve again using the reasoning as a new query. Also called 'chain-of-thought RAG' or 'ReAct'. Example: 'What is the CEO of the company that acquired Figma?' → first retrieve Figma acquisition → then retrieve CEO of the acquirer." },
          { q: "How do you evaluate a RAG system?", a: "Use the RAGAS framework: Context Recall (did you retrieve the right chunks?), Context Precision (were retrieved chunks useful?), Answer Faithfulness (is the answer grounded in retrieved context?), Answer Relevance (does the answer address the question?). Run on a golden dataset with human-verified reference answers." }
        ]
      }
    ]
  },
  {
    id: 2,
    title: "Prompt Registry",
    emoji: "📋",
    tagline: "Version control for the soul of your LLM system",
    color: "#A29BFE",
    gradient: "linear-gradient(135deg, #A29BFE 0%, #6C5CE7 100%)",
    level: "Engineering",
    readTime: "20 min",
    interviewWeight: "★★★★☆",
    sections: [
      {
        title: "What Is a Prompt Registry?",
        type: "concept",
        content: `A **prompt registry** is a centralized versioned store for all LLM prompts used in your system. It treats prompts as first-class software artifacts — with versioning, testing, rollback, and A/B testing capabilities.

**The core problem:** Prompts are the code of AI systems. But teams often store them:
- Hardcoded in application code (can't change without deploy)
- In Google Docs or Notion (no versioning, no testing)
- In environment variables (scattered, unreviewed)

**Why this kills teams:** A product manager tweaks a prompt in a config file, pushes directly to prod, and breaks 30% of outputs. No test was run. No rollback is possible. No one knows what changed.

A prompt registry is the Git + CI/CD for your prompts.`,
        analogy: {
          title: "🏗️ The Building Codes Analogy",
          text: "Every building must comply with building codes (standards). An architect can't just 'try something' on a live building. They submit blueprints (prompts), they get reviewed, tested on a model, approved, and only then applied to the building (deployed to production). The prompt registry is the blueprint management system + approval workflow."
        }
      },
      {
        title: "Architecture",
        type: "architecture",
        diagram: `
┌────────────────────────────────────────────────────────────────┐
│                     PROMPT REGISTRY SYSTEM                      │
│                                                                  │
│  ┌──────────────┐   ┌───────────────┐   ┌──────────────────┐  │
│  │ Prompt Store │   │ Version Control│   │   Eval Runner    │  │
│  │              │   │               │   │                  │  │
│  │ • Template   │   │ • Git-backed  │   │ • Auto-run evals │  │
│  │   variables  │   │ • Semantic    │   │   on new versions│  │
│  │ • Model pins │   │   versioning  │   │ • Score gating   │  │
│  │ • Metadata   │   │ • Changelogs  │   │ • Human review   │  │
│  └──────┬───────┘   └───────────────┘   └──────────────────┘  │
│         │                                                        │
│  ┌──────▼────────────────────────────────────────────────────┐ │
│  │                   PROMPT API                               │ │
│  │  GET /prompts/{name}?version=latest&env=production        │ │
│  │  POST /prompts/{name}/deploy?target=canary                │ │
│  └────────────────────────────────────────────────────────────┘ │
│         │                                                        │
│  ┌──────▼──────┐  ┌──────────────┐  ┌─────────────────────┐  │
│  │ A/B Testing │  │  Rollback    │  │  Usage Analytics    │  │
│  │             │  │  (one-click) │  │  per prompt version  │  │
│  └─────────────┘  └──────────────┘  └─────────────────────┘  │
└────────────────────────────────────────────────────────────────┘`,
        content: `**What lives in a prompt registry entry:**

\`\`\`json
{
  "name": "compliance-classifier",
  "version": "3.2.1",
  "template": "You are a compliance expert at a European bank...\n\nClassify the following transaction: {{transaction}}\n\nRespond with: COMPLIANT | REVIEW | BLOCK",
  "model": { "provider": "anthropic", "model": "claude-sonnet-4-20250514", "temperature": 0.1 },
  "variables": ["transaction"],
  "eval_score": { "accuracy": 0.94, "f1": 0.91 },
  "created_by": "praveen@fiserv.com",
  "deployed_at": "2025-11-01T09:00:00Z",
  "tags": ["production", "compliance", "reviewed"]
}
\`\`\`

**Semantic versioning for prompts:**
- **Patch** (3.2.0 → 3.2.1): Typo fix, minor wording
- **Minor** (3.1.0 → 3.2.0): New instruction added, behavior expands
- **Major** (2.x → 3.0.0): Restructured prompt, model change, breaking behavior shift`
      },
      {
        title: "Anti-Patterns",
        type: "antipatterns",
        items: [
          { name: "Prompt in source code", desc: "Hardcoded prompts require code deploy to change. Marketing teams can't iterate. Hotfixes take hours instead of seconds." },
          { name: "No prompt testing", desc: "Changing a prompt without running evals. One word change can completely shift model behavior. Always A/B test prompt changes against your eval suite." },
          { name: "No variable templating", desc: "Concatenating strings to build prompts. Leads to injection vulnerabilities (user input can escape the prompt structure) and makes prompts hard to read." },
          { name: "Shared prompts across environments", desc: "Same prompt in dev, staging, and prod without environment-specific overrides. Prod prompts should have stricter safety instructions, different temperature, different few-shots." }
        ]
      },
      {
        title: "Interview Q&A",
        type: "interview",
        qas: [
          { q: "How do you do A/B testing for prompts in production?", a: "Route X% of traffic to prompt version A, (100-X)% to version B. Log outputs + business metrics (conversion, user rating, resolution rate). After statistical significance (typically 1000+ samples per variant), compare eval scores AND business metrics. Roll out the winner. Tools: Anthropic's prompt management, LangSmith, PromptLayer." },
          { q: "How do you prevent prompt injection in a template system?", a: "Escape user inputs before interpolation (strip curly braces, markdown that could escape the template). Use XML-tagged sections for user content. Run an input guardrail model (small classifier) to detect injection attempts before they reach the prompt. Separate system prompt from user content structurally, not just by convention." },
          { q: "How would you migrate 50 prompts from hardcoded to a registry?", a: "Extract → catalog (name, owner, environment, dependencies) → add to registry with current behavior as v1.0.0 → run eval baseline on v1.0.0 → wire application to pull from registry → deploy with feature flag → monitor for regressions. Never 'lift and shift' without an eval baseline." }
        ]
      }
    ]
  },
  {
    id: 3,
    title: "LLM Gateway",
    emoji: "🚪",
    tagline: "The intelligent traffic controller for all your model calls",
    color: "#FD79A8",
    gradient: "linear-gradient(135deg, #FD79A8 0%, #E84393 100%)",
    level: "Infrastructure",
    readTime: "25 min",
    interviewWeight: "★★★★☆",
    sections: [
      {
        title: "What Is an LLM Gateway?",
        type: "concept",
        content: `An **LLM Gateway** sits between your application code and every LLM provider (OpenAI, Anthropic, Azure OpenAI, Bedrock, local models). It's the single chokepoint through which all LLM traffic flows — giving you control, visibility, and resilience.

**Core responsibilities:**
- **Routing**: Send request to the right model/provider based on cost, latency, capability
- **Rate limiting**: Prevent runaway costs and enforce per-user quotas
- **Caching**: Return cached responses for semantically identical queries (massive cost reduction)
- **Fallback**: If OpenAI is down, route to Anthropic automatically
- **Observability**: Log every request/response for debugging and cost attribution
- **Auth**: API key management, per-team budgets

Think of it as **NGINX for LLMs** — but with AI-specific intelligence.`,
        analogy: {
          title: "✈️ The Air Traffic Control Analogy",
          text: "ATC doesn't fly planes — it ensures all planes (LLM requests) go to the right runway (model), don't collide (rate limits), know about weather/closures (provider outages), and are tracked (observability). Without ATC, planes (requests) make their own routing decisions, which is chaos at scale."
        }
      },
      {
        title: "Architecture",
        type: "architecture",
        diagram: `
┌────────────────────────────────────────────────────────────────────┐
│                        LLM GATEWAY                                  │
│                                                                      │
│  Incoming Request                                                    │
│       │                                                              │
│       ▼                                                              │
│  ┌────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐ │
│  │    Auth    │→ │  Rate Limit │→ │    Cache    │→ │  Router   │ │
│  │ (API key / │  │ (per user / │  │ (semantic   │  │  (cost /  │ │
│  │  OAuth)    │  │  per team)  │  │  + exact)   │  │  latency  │ │
│  └────────────┘  └─────────────┘  └─────────────┘  └─────┬─────┘ │
│                                                            │        │
│                          ┌─────────────────────────────────┤        │
│                          │                                 │        │
│                    ┌─────▼──────┐                  ┌──────▼─────┐ │
│                    │  Primary   │                  │  Fallback  │ │
│                    │  Provider  │                  │  Provider  │ │
│                    │ (Anthropic)│                  │  (OpenAI)  │ │
│                    └─────┬──────┘                  └──────┬─────┘ │
│                          │                                 │        │
│                          └─────────────┬───────────────────┘        │
│                                        │                            │
│                                        ▼                            │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │           OBSERVABILITY LAYER                               │  │
│  │  Latency | Tokens | Cost | Error rate | Model version      │  │
│  └─────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘`,
        content: `**Routing strategies:**

**1. Cost-optimized routing**: Simple queries → small model (gpt-4o-mini, $0.15/1M tokens); complex reasoning → large model (Claude Opus, $15/1M tokens). Classifier determines complexity tier.

**2. Latency-sensitive routing**: Real-time user-facing → fastest available endpoint; batch jobs → queue-based, cheapest option.

**3. Capability routing**: Code generation → Codex/DeepSeek-Coder; reasoning → o3/Claude; embeddings → text-embedding-3-large.

**4. Fallback chains**: 
\`\`\`
Primary: claude-opus-4 (Anthropic) 
  → On timeout/5xx: claude-sonnet-4 (Anthropic)
  → On full outage: gpt-4o (OpenAI)
  → On secondary failure: llama-3.1-70b (local)
\`\`\`

**Semantic caching:**
Embed the incoming query. If cosine similarity > 0.97 with a cached query, return the cached response. Works especially well for FAQ-type queries. Can reduce LLM calls by 20-40% in enterprise deployments. Tools: GPTCache, Redis + vector similarity.`
      },
      {
        title: "Anti-Patterns",
        type: "antipatterns",
        items: [
          { name: "Direct provider calls from app code", desc: "Each microservice calls OpenAI directly with its own API key. No central cost visibility, no rate limiting, no fallback. One rogue service can exhaust the company's API quota." },
          { name: "No semantic caching", desc: "Paying full price for 'What are your business hours?' asked 10,000 times/day. Semantic caching typically reduces this category by 80%." },
          { name: "Hard fallback to same provider", desc: "Falling back to another OpenAI model when OpenAI has an outage. True resilience requires cross-provider fallback." },
          { name: "Synchronous cost tracking", desc: "Tracking token costs in the hot path adds latency. Async emit cost events to a queue; process them out-of-band." }
        ]
      },
      {
        title: "Interview Q&A",
        type: "interview",
        qas: [
          { q: "How would you implement per-tenant rate limiting in an LLM gateway?", a: "Token bucket or sliding window algorithm per tenant ID. Store state in Redis (fast, distributed). Limits by: requests/minute, tokens/minute, $ spend/day. Return 429 with Retry-After header. Implement soft limits (warning at 80%) before hard limits. Separate limits for streaming vs. batch endpoints." },
          { q: "How do you handle streaming responses in an LLM gateway?", a: "Proxy the SSE (Server-Sent Events) stream through the gateway. Can't cache mid-stream, so cache only completed responses. Count tokens as stream completes (using tiktoken estimate or provider's usage field). For fallback during streaming: detect connection drop, restart from scratch on fallback provider (can't resume mid-stream)." },
          { q: "What open source LLM gateway options exist?", a: "LiteLLM (most popular, 100+ providers), Portkey, Kong AI Gateway, Traefik with LLM plugins. For enterprise: AWS Bedrock Gateway, Azure AI Gateway. LiteLLM gives unified API across OpenAI, Anthropic, Cohere, Replicate — critical for avoiding vendor lock-in." }
        ]
      }
    ]
  },
  {
    id: 4,
    title: "Tool-Calling Agent",
    emoji: "🤖",
    tagline: "LLMs that act, not just respond — the future is agentic",
    color: "#00B894",
    gradient: "linear-gradient(135deg, #00B894 0%, #00665A 100%)",
    level: "Advanced",
    readTime: "35 min",
    interviewWeight: "★★★★★",
    sections: [
      {
        title: "What Is a Tool-Calling Agent?",
        type: "concept",
        content: `A **tool-calling agent** is an LLM that can take actions in the world by calling functions/APIs. Instead of just generating text, it can:
- Search the web
- Query a database
- Execute code
- Call external APIs (Slack, Salesforce, GitHub)
- Read and write files

**The ReAct Loop** (Reason + Act): The agent cycles through:
1. **Think**: What do I need to do?
2. **Act**: Call a tool with structured arguments
3. **Observe**: Get the tool's output
4. **Repeat**: Until the task is complete or max steps reached

Karpathy on agents: *"The LLM is the CEO. Tools are the employees. The agent loop is the org chart."*`,
        analogy: {
          title: "🔧 The Swiss Army Knife Analogy",
          text: "A standard LLM is a consultant who gives great advice but never touches anything. A tool-calling agent is a consultant who also has a computer, a phone, a calculator, and access to every database — and actually executes the work. The tools are the blades of the Swiss Army knife; the LLM decides which one to use."
        }
      },
      {
        title: "Architecture",
        type: "architecture",
        diagram: `
┌────────────────────────────────────────────────────────────────────┐
│                   TOOL-CALLING AGENT SYSTEM                         │
│                                                                      │
│  User Request: "Book a flight to Berlin next Tuesday under $500"   │
│       │                                                              │
│       ▼                                                              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    AGENT LOOP                                 │  │
│  │                                                               │  │
│  │  Step 1: THINK → "I need today's date, flight options, cost"  │  │
│  │  Step 2: ACT  → call get_date()                              │  │
│  │  Step 3: OBS  → "2025-11-15 (Friday)"                        │  │
│  │  Step 4: ACT  → call search_flights(from="NYC",              │  │
│  │                   to="BER", date="2025-11-18")                │  │
│  │  Step 5: OBS  → [Flight A: $420, Flight B: $550, ...]        │  │
│  │  Step 6: ACT  → call book_flight(id="A", confirm=true)       │  │
│  │  Step 7: OBS  → "Booking confirmed: PNR XJ9247"              │  │
│  │  Step 8: FINAL → "I've booked Flight A to Berlin on          │  │
│  │                   Tuesday Nov 18 for $420. PNR: XJ9247"      │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                      │
│  TOOL REGISTRY:                                                      │
│  get_date() | search_flights() | book_flight() | send_email()      │
│  Each tool: JSON schema (name, description, parameters, returns)   │
│                                                                      │
│  SAFETY LAYER:                                                      │
│  • Max steps: 10  • Human-in-loop for irreversible actions         │
│  • Tool call logging  • Sandboxed execution                         │
└────────────────────────────────────────────────────────────────────┘`,
        content: `**How tool definitions work (Anthropic format):**
\`\`\`json
{
  "name": "search_flights",
  "description": "Search for available flights between two airports on a date. Returns up to 10 results sorted by price.",
  "input_schema": {
    "type": "object",
    "properties": {
      "from": { "type": "string", "description": "IATA departure airport code (e.g. 'JFK')" },
      "to": { "type": "string", "description": "IATA destination airport code (e.g. 'TXL')" },
      "date": { "type": "string", "description": "Date in YYYY-MM-DD format" },
      "max_price": { "type": "number", "description": "Maximum price in USD" }
    },
    "required": ["from", "to", "date"]
  }
}
\`\`\`

**Critical insight on tool descriptions:** The LLM decides which tool to call based ENTIRELY on the tool description. A bad description = wrong tool calls = agent failure. Treat tool descriptions like API documentation — precise, with examples, edge cases noted.`
      },
      {
        title: "Multi-Agent Systems",
        type: "concept",
        content: `**When single agents aren't enough:** Complex tasks benefit from specialization.

**Orchestrator-Subagent pattern:**
- **Orchestrator**: High-level coordinator, breaks task into subtasks, delegates
- **Subagents**: Specialists (research agent, coding agent, writing agent)
- Communication via structured messages (not free-form text)

**Parallel vs. Sequential execution:**
- Sequential: Orchestrator waits for each subagent. Simple, easy to debug.
- Parallel: Multiple subagents run concurrently. Faster for independent subtasks.

**Human-in-the-loop (HITL) — mandatory for production:**
- **Irreversible actions** (send email, delete data, make payment): Always require human confirmation
- **Low-confidence states**: If agent uncertainty > threshold, pause and ask
- **Max step exceeded**: Surface intermediate state to human

**The key question at Anthropic interviews:** "How do you prevent an agent from taking catastrophic irreversible actions?" → HITL checkpoints + action classification (reversible/irreversible) + sandboxed tools for testing`
      },
      {
        title: "Anti-Patterns",
        type: "antipatterns",
        items: [
          { name: "No max step limit", desc: "Agent enters infinite loops (tool always fails, agent retries forever). Always set max_steps = N, surface to human when exceeded." },
          { name: "No sandboxing for code execution", desc: "Agent runs arbitrary code directly on the host. Use Docker containers with resource limits, no network access, no filesystem write outside sandbox." },
          { name: "Ambiguous tool descriptions", desc: "Tools with overlapping descriptions cause the LLM to pick the wrong one. Make tool descriptions mutually exclusive and collectively exhaustive." },
          { name: "No action logging", desc: "Agent takes 15 actions, something goes wrong, you have no audit trail. Log every tool call: timestamp, input, output, duration, token cost." },
          { name: "Eager irreversible execution", desc: "Booking a flight, sending an email, charging a card without confirmation. Fatal in production. Classify every tool as reversible or irreversible. HITL for all irreversible actions." }
        ]
      },
      {
        title: "Interview Q&A",
        type: "interview",
        qas: [
          { q: "How do you handle agent failures and retries?", a: "Classify failures: transient (rate limit, timeout → retry with exponential backoff), logical (tool returned error → let LLM reason about the error and try different approach), unrecoverable (auth failure → surface to human). Set per-tool retry limits (max 3). If agent can't recover in N steps, return partial results with explanation, not a failure response." },
          { q: "How do you evaluate an agent system?", a: "Task completion rate (did it achieve the goal?), step efficiency (fewer steps = better), tool call accuracy (right tool, right parameters), hallucination rate (did it fabricate tool outputs?), HITL trigger rate (how often does it need human help?). Use trajectory-level eval, not just final answer eval — the path matters." },
          { q: "What's the difference between agents and chains?", a: "Chains: fixed, predetermined sequence of LLM calls. DAG structure known at design time. Predictable, fast, easy to test. Agents: dynamic, LLM decides what to do next at each step. Flexible, handles novel situations, harder to predict and test. Use chains when you know the workflow; use agents when the workflow depends on data discovered at runtime." }
        ]
      }
    ]
  },
  {
    id: 5,
    title: "Synthetic Data Pipeline",
    emoji: "🧬",
    tagline: "Teaching AI with AI-generated training data",
    color: "#FDCB6E",
    gradient: "linear-gradient(135deg, #FDCB6E 0%, #E17055 100%)",
    level: "Advanced",
    readTime: "25 min",
    interviewWeight: "★★★★☆",
    sections: [
      {
        title: "What Is Synthetic Data?",
        type: "concept",
        content: `**Synthetic data** is AI-generated training examples used to train or fine-tune models. It's a core technique at all frontier labs because:

1. **Privacy**: Real user data has PII, legal restrictions. Synthetic data is clean.
2. **Quantity**: You can generate millions of examples for rare scenarios.
3. **Quality control**: You define exactly what signals to train on.
4. **Cost**: Generating 10K examples with GPT-4 costs ~$50. Collecting and labeling real examples costs 100x more.

**Andrej Karpathy's insight:** *"The best data is data that teaches the model what you want, precisely. Synthetic data lets you engineer those exact teaching moments."*

OpenAI trained GPT-4's math reasoning partly on synthetic step-by-step solutions. Anthropic uses synthetic data for Constitutional AI (RLAIF). Meta used synthetic data to train LLaMA 3's coding abilities.`,
        analogy: {
          title: "🎮 The Flight Simulator Analogy",
          text: "Real pilots train in flight simulators before flying real planes. Synthetic data is the flight simulator for AI. You can create impossible scenarios (engine failure + storm + night), get unlimited practice, with zero real-world risk. The model learns from engineered perfect examples, then applies that learning to messy real-world data."
        }
      },
      {
        title: "Synthetic Data Pipeline Architecture",
        type: "architecture",
        diagram: `
┌─────────────────────────────────────────────────────────────────┐
│                 SYNTHETIC DATA PIPELINE                          │
│                                                                   │
│  SEED DATA (10-100 real examples)                                │
│       │                                                           │
│       ▼                                                           │
│  ┌───────────────┐                                               │
│  │ GENERATOR LLM │  ← Strong frontier model (GPT-4, Claude)     │
│  │               │    Persona-based prompting                    │
│  │  Generates:   │    Adversarial augmentation                   │
│  │  • Inputs     │    Edge case injection                        │
│  │  • Outputs    │                                               │
│  │  • Chain of   │                                               │
│  │    Thought    │                                               │
│  └───────┬───────┘                                               │
│          │ 100K-10M examples                                      │
│          ▼                                                        │
│  ┌───────────────┐                                               │
│  │ QUALITY FILTER│  ← Deduplication (MinHash / SimHash)         │
│  │               │    Rule-based filtering (length, format)      │
│  │               │    LLM scoring (quality rubric)               │
│  │               │    Reward model scoring                       │
│  └───────┬───────┘                                               │
│          │ curated subset                                         │
│          ▼                                                        │
│  ┌───────────────┐                                               │
│  │   DEBIASING   │  ← Check demographic balance                 │
│  │               │    Check topic distribution                   │
│  │               │    Red-teaming for safety                     │
│  └───────┬───────┘                                               │
│          │                                                        │
│          ▼                                                        │
│     Fine-tune target model                                        │
└─────────────────────────────────────────────────────────────────┘`,
        content: `**Key synthetic data techniques:**

**Self-Instruct**: Use a strong LLM to generate instruction-response pairs from a seed set. The model learns to follow instructions it generates for itself.

**Evol-Instruct (used in WizardLM)**: Iteratively evolve simple prompts into complex ones (add constraints, deepen reasoning, change persona) to create diverse difficulty levels.

**Persona-based generation**: "You are a confused first-year medical student. Ask an unclear question about drug interactions." Generates realistic edge cases that real users produce.

**Back-translation**: Generate the answer first, then generate the question that would produce that answer. Ensures answer quality.

**RLAIF (Reinforcement Learning from AI Feedback)**: Anthropic's technique. Generate many candidate outputs, use a "preference model" trained on Constitutional AI principles to score them, use scores as reward signal for RLHF.`
      },
      {
        title: "Anti-Patterns",
        type: "antipatterns",
        items: [
          { name: "Training on unfiltered synthetic data", desc: "Generator LLM produces confident-sounding but wrong answers. Without quality filtering, you train the target model to be confidently wrong. Always verify generated outputs against ground truth or with a separate verifier model." },
          { name: "No deduplication", desc: "LLMs generate redundant examples. Training on 1000 near-duplicate examples of the same concept wastes compute and biases the model. Use MinHash or embedding-based dedup." },
          { name: "Distribution mismatch", desc: "Generating synthetic data that looks nothing like real user queries. Model performs well on synthetic evals, fails on production. Always validate synthetic data distribution against real production data." },
          { name: "Privacy leakage in seeds", desc: "Using real customer data as seeds — the generated synthetic data retains statistical patterns that can be used to re-identify individuals. Always anonymize seeds first." }
        ]
      },
      {
        title: "Interview Q&A",
        type: "interview",
        qas: [
          { q: "How do you verify the quality of synthetic data?", a: "Multi-layer verification: (1) Rule-based: format, length, uniqueness checks. (2) LLM-as-Judge: rate quality on rubric (correctness, relevance, safety). (3) Reward model scoring if you have one. (4) Train on a small subset and eval on real data before committing to full fine-tune. Track model performance on held-out real data — not just synthetic eval." },
          { q: "What is the 'model collapse' problem with synthetic data?", a: "If you train a model on its own outputs, then train the next version on THOSE outputs, and repeat — quality degrades each generation. Information is lost, the model becomes increasingly generic and confidently wrong. Prevention: always include real human data in every training run. Never train exclusively on synthetic data for multiple generations." },
          { q: "When would you use synthetic data vs. human labeling?", a: "Synthetic data: for coverage at scale, rare scenarios, data augmentation, when privacy prevents real data use. Human labeling: for calibrating LLM judges, for subtle preference signals (style, tone), for safety-critical decisions. Best practice: use synthetic data for bulk training, human labels for reward model calibration and eval set curation." }
        ]
      }
    ]
  },
  {
    id: 6,
    title: "LoRA Fine-Tuning",
    emoji: "🎯",
    tagline: "Efficiently specializing LLMs for your domain",
    color: "#74B9FF",
    gradient: "linear-gradient(135deg, #74B9FF 0%, #0984E3 100%)",
    level: "Advanced",
    readTime: "30 min",
    interviewWeight: "★★★★☆",
    sections: [
      {
        title: "What Is LoRA?",
        type: "concept",
        content: `**LoRA (Low-Rank Adaptation)** is a parameter-efficient fine-tuning technique that adapts a pre-trained LLM to a specific task by training only a small number of additional parameters — instead of updating all model weights.

**The math insight:** Neural network weight matrices are often redundant (high rank). LoRA adds two small matrices (A and B) such that the weight update ΔW = A × B, where A and B have much lower rank than ΔW. This means:

- Full fine-tuning of LLaMA-70B: ~280GB of trainable parameters
- LoRA of LLaMA-70B (rank=16): ~50MB of trainable parameters
- **560x fewer parameters → fits on a single GPU**

**When to fine-tune vs. RAG:**
- **RAG**: Knowledge is external, updates frequently, needs citations → use RAG
- **Fine-tune**: Style/behavior change needed, specific domain terminology, format adherence, latency critical (no retrieval step) → fine-tune
- **Both**: Fine-tune for behavior + RAG for knowledge = most powerful combination`,
        analogy: {
          title: "🎹 The Piano Analogy",
          text: "Imagine a concert pianist (pre-trained LLM) who knows thousands of pieces. Teaching them a new piece from scratch (full fine-tuning) takes months. LoRA is like teaching them a new playing style — a small set of habits and adjustments that overlay on their existing skills. They don't need to relearn music theory; they just learn the delta."
        }
      },
      {
        title: "LoRA Architecture",
        type: "architecture",
        diagram: `
┌─────────────────────────────────────────────────────────────────┐
│                    LoRA MECHANISM                                │
│                                                                   │
│  FROZEN PRE-TRAINED WEIGHT MATRIX (W)                            │
│  ┌────────────────────────────────┐                              │
│  │  W (e.g., 4096 × 4096)        │                              │
│  │  Frozen — not updated          │                              │
│  └────────────────────────────────┘                              │
│                 +                                                 │
│  LoRA ADAPTER (trainable)                                        │
│  ┌──────────┐     ┌──────────┐                                  │
│  │  A       │  ×  │  B       │  =  ΔW                          │
│  │ 4096 × 16│     │ 16 × 4096│  (4096 × 4096)                  │
│  │ (trainable)    │ (trainable)│                                 │
│  └──────────┘     └──────────┘                                  │
│                                                                   │
│  Output = W·x + (A·B)·x × scaling_factor                        │
│                                                                   │
│  RANK r=16: 2 × 4096 × 16 = 131K params per layer              │
│  vs full fine-tune: 4096 × 4096 = 16M params per layer         │
│  SAVINGS: 99.2% fewer parameters                                 │
│                                                                   │
│  TYPICAL SETUP:                                                   │
│  Base model: LLaMA-3.1-8B (frozen on GPU)                        │
│  LoRA rank: 16-64                                                 │
│  Alpha: 32-128 (scaling factor)                                   │
│  Target modules: q_proj, v_proj, k_proj (attention layers)      │
└─────────────────────────────────────────────────────────────────┘`,
        content: `**QLoRA: Fine-tuning on consumer hardware:**
QLoRA = LoRA + 4-bit quantization of base model. Quantize the frozen base model weights from 16-bit to 4-bit (4x memory reduction), then add LoRA adapters in full precision. Result: Fine-tune LLaMA-70B on a single 48GB A100 GPU.

**Practical fine-tuning recipe:**
1. Choose base model (LLaMA-3.1, Mistral, Qwen2.5)
2. Prepare dataset: instruction-response format (Alpaca format or ChatML)
3. Configure LoRA: rank=16, alpha=32, target_modules=["q_proj","v_proj"]
4. Use Unsloth or HuggingFace PEFT library
5. Train with Cosine LR schedule, 3 epochs max
6. Merge adapters into base model for deployment
7. Eval on held-out test set — compare to base model and RAG baseline

**Tools:**
- Unsloth: 2x faster training, 50% less VRAM
- HuggingFace PEFT: most flexible, production-ready
- Axolotl: config-file driven, popular in community
- LLaMA Factory: GUI for fine-tuning`
      },
      {
        title: "Anti-Patterns",
        type: "antipatterns",
        items: [
          { name: "Fine-tuning on too little data", desc: "Fine-tuning on 50 examples. Model memorizes training set, fails to generalize. Minimum: 500-1000 high-quality examples. For complex behavior changes: 10K+." },
          { name: "Catastrophic forgetting", desc: "Fine-tuning on domain data causes model to 'forget' general capabilities. Always include a mix of general instruction-following data with domain data (typically 1:4 ratio)." },
          { name: "Wrong rank selection", desc: "Rank too low (r=2): model can't express the required adaptation. Rank too high (r=256): approaches full fine-tune, loses PEFT benefits. Start with r=16, scale up only if eval shows underfitting." },
          { name: "No base model comparison", desc: "Fine-tuned model looks better, but you never compared to a well-prompted base model. Often, a good RAG prompt outperforms a poorly fine-tuned model. Always run a base model baseline first." }
        ]
      },
      {
        title: "Interview Q&A",
        type: "interview",
        qas: [
          { q: "What hyperparameters matter most in LoRA fine-tuning?", a: "Rank (r): 16-64 for most tasks. Higher rank for complex behavior changes. Alpha (α): usually 2× rank. Controls scaling of LoRA updates. Learning rate: 1e-4 to 3e-4 for LoRA (10-100× higher than full fine-tune is fine because fewer parameters). Dropout: 0.05 for regularization. Target modules: at minimum q_proj and v_proj. Adding k_proj, o_proj, gate_proj improves results." },
          { q: "How do you serve multiple LoRA adapters efficiently?", a: "LoRA adapters are small (50-500MB). Keep the base model loaded on GPU once, hot-swap adapters per request. Libraries like vLLM support this natively. For a platform with 100 tenants each with a fine-tuned adapter: store adapters in S3, load on-demand with LRU cache. Batch requests by adapter to maximize GPU utilization." },
          { q: "When is full fine-tuning better than LoRA?", a: "Rarely necessary for behavior adaptation. Full fine-tuning is preferred when: (1) you're training from scratch or doing domain-adaptive pre-training on a massive corpus, (2) you're implementing RLHF reward model training, (3) you have evidence that LoRA can't express the needed weight updates (rare). In 95% of enterprise fine-tuning cases, LoRA or QLoRA is sufficient." }
        ]
      }
    ]
  },
  {
    id: 7,
    title: "Batch Inference Worker",
    emoji: "⚡",
    tagline: "Processing millions of LLM calls efficiently and cheaply",
    color: "#55EFC4",
    gradient: "linear-gradient(135deg, #55EFC4 0%, #00B894 100%)",
    level: "Infrastructure",
    readTime: "20 min",
    interviewWeight: "★★★☆☆",
    sections: [
      {
        title: "What Is Batch Inference?",
        type: "concept",
        content: `**Batch inference** is processing multiple LLM requests together in scheduled jobs rather than responding to each one in real-time. 

**When to use batch vs. real-time:**
- **Real-time**: User is waiting for response (chatbots, copilots) → optimize for latency
- **Batch**: No one waiting in real-time (document processing, data labeling, content generation at scale) → optimize for throughput and cost

**Why batch is dramatically cheaper:**
- Anthropic's Batch API: 50% discount on all models
- OpenAI Batch API: 50% discount
- GPU utilization goes from ~30% (interactive) to >90% (batch) via continuous batching
- Can use spot/preemptible instances (70% cheaper) since failures can be retried

**Real use cases:**
- Nightly processing of 1M customer support tickets for categorization
- Weekly generation of 500K product descriptions
- Daily eval runs across your entire golden test suite
- Bulk document summarization for knowledge base ingestion`,
        analogy: {
          title: "🏭 The Factory vs. Artisan Analogy",
          text: "Real-time inference is a bespoke tailor — making one garment at a time, immediately, at premium price. Batch inference is a factory — collecting 10,000 orders, running the machines 24 hours straight, delivering everything next morning at 10% of the per-unit cost. Same quality, massively different economics."
        }
      },
      {
        title: "Batch Worker Architecture",
        type: "architecture",
        diagram: `
┌─────────────────────────────────────────────────────────────────┐
│                  BATCH INFERENCE SYSTEM                          │
│                                                                   │
│  INPUT LAYER                                                      │
│  S3 / GCS bucket or Database table                               │
│  (1M documents queued for processing)                            │
│          │                                                        │
│          ▼                                                        │
│  ┌───────────────┐                                               │
│  │ JOB SCHEDULER │ ← Trigger: cron, event, or API              │
│  │ (Airflow /    │                                               │
│  │  Temporal)    │                                               │
│  └───────┬───────┘                                               │
│          │                                                        │
│          ▼                                                        │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 WORKER POOL                             │    │
│  │                                                         │    │
│  │  Worker 1: batch 1-10K   │ Worker 2: batch 10K-20K    │    │
│  │  Worker 3: batch 20K-30K │ Worker 4: batch 30K-40K    │    │
│  │  (Each worker: read → call LLM → write result → ack)  │    │
│  └─────────────────────────────────────────────────────────┘    │
│          │                                                        │
│          ▼                                                        │
│  ┌───────────────┐    ┌──────────────┐    ┌────────────────┐   │
│  │  DEAD LETTER  │    │   RESULTS    │    │  MONITORING    │   │
│  │  QUEUE (DLQ)  │    │  (S3/DB)     │    │  progress %    │   │
│  │  failed items │    │              │    │  ETA, costs    │   │
│  └───────────────┘    └──────────────┘    └────────────────┘   │
└─────────────────────────────────────────────────────────────────┘`,
        content: `**Key design decisions:**

**Concurrency control:** LLM APIs have rate limits (tokens/min, requests/min). Use a semaphore or token bucket to cap concurrent requests. Implement exponential backoff with jitter on 429s.

**Checkpointing:** For 1M item jobs, failures will happen. Store progress at item level (completed IDs in Redis or DB). On restart, skip completed items. Idempotency key = document ID + job ID.

**Cost optimization:**
- Use Anthropic/OpenAI Batch API (50% discount) for jobs with >24hr SLA
- Spot instances for workers — if killed, resume from checkpoint
- Prompt compression: remove whitespace, use efficient tokens
- Cache: deduplicate identical inputs before sending

**Monitoring:**
- Items processed/hour (throughput)
- Estimated completion time
- Cost per item (running total)
- Error rate (DLQ size)
- Token usage (watch for prompt explosion on edge cases)`
      },
      {
        title: "Anti-Patterns",
        type: "antipatterns",
        items: [
          { name: "No checkpointing", desc: "Processing 800K of 1M items, server dies, start over from 0. Always checkpoint at granular level. Use idempotent writes (upsert, not insert)." },
          { name: "Synchronous error handling", desc: "One bad document crashes the whole batch. Catch per-item exceptions, send to DLQ, continue processing. Review DLQ separately." },
          { name: "No rate limit awareness", desc: "Spinning up 100 workers all hitting the API simultaneously → 429 storm → backoff storm → job takes 10x longer than expected. Always calculate max concurrency from API rate limits." },
          { name: "Ignoring batch API discounts", desc: "Using real-time API for non-urgent jobs. 50% discount is massive at scale. 1M tokens at $3.00 → $1.50 with batch API. On 1B tokens/month: $1.5M savings annually." }
        ]
      },
      {
        title: "Interview Q&A",
        type: "interview",
        qas: [
          { q: "How do you handle partial failures in a batch job?", a: "Three-tier error handling: (1) Retry transient errors (timeout, rate limit) with exponential backoff, max 3 retries. (2) Send permanent errors (invalid input, context overflow) to a DLQ with error metadata. (3) After job completes, process DLQ separately — often with human review or a different prompt. Report: X% succeeded, Y% retried and succeeded, Z% failed (link to DLQ)." },
          { q: "How would you process 100M documents in 24 hours?", a: "Calculate: 100M / 24hr = ~1.2M docs/hr = ~333 docs/sec. If avg LLM call = 2s and 10 concurrent requests/worker → 5 docs/sec/worker → need 67 workers. Use spot GPU instances with Kubernetes job. Partition by doc ID range. Checkpoint every 1000 docs. Monitor via CloudWatch/Grafana. Anthropic Batch API gives 50% discount, factor into cost modeling." }
        ]
      }
    ]
  },
  {
    id: 8,
    title: "Hallucination Monitor",
    emoji: "🕵️",
    tagline: "Catching LLM lies before they reach your users",
    color: "#E17055",
    gradient: "linear-gradient(135deg, #E17055 0%, #C0392B 100%)",
    level: "Production",
    readTime: "25 min",
    interviewWeight: "★★★★★",
    sections: [
      {
        title: "What Is Hallucination?",
        type: "concept",
        content: `**Hallucination** occurs when an LLM generates content that is fluent and confident-sounding but factually wrong, fabricated, or unsupported by provided context.

**Types of hallucination:**
1. **Factuality errors**: Wrong facts ("Eiffel Tower is in Berlin")
2. **Faithfulness errors**: Answer contradicts or fabricates beyond provided context ("The document says X" when it doesn't)
3. **Citation hallucination**: References that don't exist
4. **Numerical hallucination**: Wrong numbers, statistics, dates

**Why models hallucinate (2025 research insight):** OpenAI's 2025 paper shows that next-token prediction training **rewards confident guessing over admitting uncertainty**. Models are penalized for saying "I don't know" during training, so they learn to bluff.

**Production impact:** A legal chatbot hallucinating case citations. A medical assistant fabricating drug dosages. A financial advisor inventing market statistics. These are existential risks, not bugs.`,
        analogy: {
          title: "📰 The Unreliable Journalist Analogy",
          text: "A journalist who fabricates quotes sounds completely authoritative. You can't tell from the writing style that the source didn't exist. A hallucination monitor is your fact-checking department — it independently verifies every claim before publication, catching fabrications the journalist delivered with complete confidence."
        }
      },
      {
        title: "Hallucination Monitor Architecture",
        type: "architecture",
        diagram: `
┌─────────────────────────────────────────────────────────────────┐
│               HALLUCINATION MONITOR SYSTEM                       │
│                                                                   │
│  LLM Response                                                     │
│       │                                                           │
│       ▼                                                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                 CLAIM EXTRACTOR                            │  │
│  │  "Paris is the capital of Italy" → atomic claim           │  │
│  │  "The company was founded in 1998" → atomic claim         │  │
│  └───────────────────────────────────────────────────────────┘  │
│       │                                                           │
│       ▼                                                           │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │ CONTEXT CHECK  │  │  KNOWLEDGE     │  │  CONSISTENCY     │  │
│  │                │  │  BASE CHECK    │  │  CHECK           │  │
│  │ Is claim in    │  │ (RAG / KG /    │  │ Does claim       │  │
│  │ provided docs? │  │  web search)   │  │ contradict       │  │
│  │ Faithfulness   │  │ Factuality     │  │ earlier parts?   │  │
│  └────────┬───────┘  └───────┬────────┘  └────────┬─────────┘  │
│           │                  │                     │             │
│           └──────────────────┴─────────────────────┘            │
│                              │                                   │
│                              ▼                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              HALLUCINATION SCORE                           │ │
│  │  Per-claim: SUPPORTED / UNSUPPORTED / CONTRADICTED        │ │
│  │  Overall: 0.0 (fully hallucinated) → 1.0 (fully grounded) │ │
│  └────────────────────────────────────────────────────────────┘ │
│                              │                                   │
│              ┌───────────────┼────────────────┐                 │
│              ▼               ▼                ▼                 │
│           PASS          WARN TO USER      BLOCK + ALERT         │
│        (score >0.9)    (0.7 < s < 0.9)  (score <0.7)           │
└─────────────────────────────────────────────────────────────────┘`,
        content: `**Detection methods (ranked by accuracy vs. cost):**

**1. Context-based faithfulness check (RAG systems):**
- Most important: if you have source documents, verify every claim appears in them
- Use NLI (Natural Language Inference) model: does the context ENTAIL the claim?
- Tools: MiniCheck, AlignScore, TrueTeacher

**2. Chain-of-Verification (CoVe):**
- Generate response → extract claims → generate verification questions → independently answer questions → compare to original claims
- More compute, much better accuracy
- Example: "The CEO was hired in 2018" → "When was this CEO hired?" → verify against source

**3. LLM-as-Judge with grounding:**
- Ask Claude/GPT-4: "Is this claim supported by the provided context? Quote the evidence."
- Structured output: {verdict: "SUPPORTED" | "UNSUPPORTED", evidence_quote: "...", confidence: 0.95}

**4. Knowledge graph verification:**
- For factual claims (geography, history, science): query Wikidata or internal knowledge graph
- Expensive but high precision for fact types

**5. Confidence calibration:**
- Train model to output uncertainty scores
- Flag responses where model is uncertain but sounds confident (high verbosity, hedging → uncertain)

**Anthropic's insight (2025):** Hallucinations can be reduced via targeted preference fine-tuning on "hard-to-hallucinate" examples — 90-96% reduction in specific domains without hurting quality.`
      },
      {
        title: "Anti-Patterns",
        type: "antipatterns",
        items: [
          { name: "Post-hoc hallucination detection only", desc: "Detecting after the user has already seen the response. Ideally, hallucination detection is in the pre-delivery pipeline, blocking bad responses before users see them." },
          { name: "Binary pass/fail monitoring", desc: "Treating hallucination as all-or-nothing. In practice, partial hallucinations (one wrong claim in ten) need nuanced handling — pass with citation warning, not full block." },
          { name: "Ignoring confidence-fluency gap", desc: "Models produce hallucinations in their most fluent prose. High readability score ≠ factual accuracy. The correlation is actually slightly negative for some failure modes." },
          { name: "No domain-specific calibration", desc: "A generic hallucination detector performs poorly on medical or legal terminology. Fine-tune or calibrate your detector on domain-specific examples." }
        ]
      },
      {
        title: "Interview Q&A",
        type: "interview",
        qas: [
          { q: "How would you build a hallucination monitor for a medical chatbot?", a: "Multi-layer: (1) Source grounding — only answer from retrieved medical literature, claim must be traceable to cited paper. (2) NLI check — AlignScore or similar to verify claims are entailed by sources. (3) Temporal validation — check if cited guidelines are current version. (4) Specialist LLM review — medical-tuned model rates clinical safety. (5) Human review queue — any response above certain risk score routed to clinician before delivery. Block responses below faithfulness threshold. Log everything for audit." },
          { q: "What metrics do you track for hallucination monitoring?", a: "Faithfulness score distribution (histogram, not just average), per-category hallucination rate (facts vs. citations vs. numbers), false positive rate of the detector (blocking correct responses), hallucination rate trend over time (catch model degradation), downstream impact (user correction rate, complaint rate correlated with hallucination score)." },
          { q: "How does RAG affect hallucination rates?", a: "RAG reduces factuality hallucinations by grounding generation in retrieved context. But: faithfulness hallucinations (model claims context says X when it doesn't) still occur. Poorly configured RAG can introduce new hallucinations (model confidently uses wrong retrieved chunk). RAG reduces hallucination 40-60% in practice, but you still need faithfulness monitoring." }
        ]
      }
    ]
  },
  {
    id: 9,
    title: "Cost/Latency Dashboard",
    emoji: "📊",
    tagline: "Seeing every token spent and every millisecond burned",
    color: "#FFEAA7",
    gradient: "linear-gradient(135deg, #FFEAA7 0%, #FDCB6E 100%)",
    level: "Production",
    readTime: "20 min",
    interviewWeight: "★★★☆☆",
    sections: [
      {
        title: "Why This Dashboard Matters",
        type: "concept",
        content: `At production scale, LLM costs can spiral from $5K/month to $500K/month without warning. A single poorly written prompt that adds 2000 tokens per call, multiplied by 10M calls/month = $60,000 of wasted spend.

**The three things you must observe in production LLM systems:**
1. **Cost**: Token usage, spend by team/feature/model
2. **Latency**: P50/P95/P99 response times, TTFT (time-to-first-token) for streaming
3. **Quality**: Error rate, hallucination rate, user satisfaction

**Karpathy principle:** "You cannot optimize what you cannot measure." At AI companies, observability is the first thing built, not the last.

**TTFT (Time To First Token)** — especially important for streaming UX. Users perceive streaming response starting as the "response time" — they'll wait 30s total if they see the first token in 1s. Optimize TTFT separately from total latency.`,
        analogy: {
          title: "🏎️ The F1 Race Car Telemetry Analogy",
          text: "An F1 team gets 200 data points per second from every sensor on the car. They don't guess why a tire is wearing unevenly — they see it in the data and fix it mid-race. Your LLM dashboard is this telemetry. Cost spike at 3am? You see which endpoint, which model, which team caused it, and fix it before the next morning."
        }
      },
      {
        title: "Dashboard Architecture",
        type: "architecture",
        diagram: `
┌───────────────────────────────────────────────────────────────────┐
│               COST / LATENCY OBSERVABILITY STACK                   │
│                                                                     │
│  LLM Gateway / SDK                                                  │
│  (Instrument every LLM call)                                        │
│       │                                                             │
│       ▼                                                             │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                   TELEMETRY LAYER                           │  │
│  │                                                             │  │
│  │  OpenTelemetry Spans:                                       │  │
│  │  • model, prompt_name, version, endpoint                    │  │
│  │  • input_tokens, output_tokens, total_cost                  │  │
│  │  • latency_ms, ttft_ms, streaming: true/false               │  │
│  │  • user_id, session_id, team_id                             │  │
│  │  • cache_hit: true/false                                    │  │
│  └─────────────────────────────────────────────────────────────┘  │
│       │                                                             │
│       ▼                                                             │
│  ┌──────────┐   ┌──────────────┐   ┌─────────────────────────┐   │
│  │ Kafka /  │   │  ClickHouse  │   │   Grafana / Datadog      │   │
│  │ Kinesis  │──▶│  (analytics  │──▶│   Dashboards            │   │
│  │ (stream) │   │  time-series)│   │   • Cost by team        │   │
│  └──────────┘   └──────────────┘   │   • Latency percentiles │   │
│                                    │   • Model comparison     │   │
│                                    │   • Anomaly alerts       │   │
│                                    └─────────────────────────┘   │
└───────────────────────────────────────────────────────────────────┘`,
        content: `**Must-have dashboard panels:**

**Cost panels:**
- Total spend today/MTD vs. budget (with burn rate projection)
- Cost by team/product/endpoint (who's spending what)
- Cost per successful response (efficiency metric — cache hits lower this)
- Model cost comparison (same use case, different models — pick the cheapest that meets quality bar)
- Token usage breakdown: input vs. output (output costs 3-5x more, optimize generation length)

**Latency panels:**
- P50, P95, P99 latency by endpoint (not average — averages hide tail latency)
- TTFT (time to first token) for streaming endpoints
- Latency by model (small vs. large model comparison)
- Slow query log (top-10 slowest requests — often reveal prompt issues)

**Quality panels:**
- Error rate by provider (catch provider degradation before users do)
- Retry rate (high retries = rate limit or reliability issue)
- Cache hit rate (low cache hit = missed optimization opportunity)
- Eval score trend (correlate with code deploys to catch regressions)`
      },
      {
        title: "Anti-Patterns",
        type: "antipatterns",
        items: [
          { name: "Only tracking average latency", desc: "P50 might be 800ms but P99 is 30s. 1% of users experience terrible UX. Always track percentiles. Set SLOs on P95 and P99, not average." },
          { name: "No cost attribution", desc: "One bill to the company's credit card. No way to know which team or feature is driving the cost spike. Attribution by team/endpoint/model is non-negotiable at scale." },
          { name: "Synchronous logging in hot path", desc: "Writing telemetry data in the same thread as the LLM call adds 10-50ms per request. Always async-emit telemetry to a queue." },
          { name: "No anomaly detection", desc: "A 10x cost spike happens at 2am. Nobody notices until the credit card is maxed. Set automated alerts: >2x normal spend/hour, >5x normal error rate." }
        ]
      },
      {
        title: "Interview Q&A",
        type: "interview",
        qas: [
          { q: "How would you reduce LLM costs by 40% without hurting quality?", a: "(1) Semantic caching: cache responses for similar queries (20-30% reduction). (2) Model routing: use small models (claude-haiku, gpt-4o-mini) for simple queries, large models for complex (10-20% reduction). (3) Prompt compression: remove redundant whitespace, use efficient phrasings (5-10% token reduction). (4) Batch API: 50% discount for non-real-time workloads. (5) Output length control: instruct models to be concise, set max_tokens. Measure quality before/after each change." },
          { q: "What observability stack would you recommend?", a: "OpenTelemetry for instrumentation (standard, works with all providers). Kafka for telemetry streaming (decouple from hot path). ClickHouse for analytics queries (fast on token/cost time-series). Grafana for dashboards. PagerDuty for alerts. For LLM-specific: LangSmith, Langfuse, or Helicone provide pre-built LLM dashboards if you don't want to build from scratch." }
        ]
      }
    ]
  },
  {
    id: 10,
    title: "Context Router",
    emoji: "🧭",
    tagline: "Sending the right context to the right model at the right time",
    color: "#B2BEC3",
    gradient: "linear-gradient(135deg, #B2BEC3 0%, #636E72 100%)",
    level: "Advanced",
    readTime: "25 min",
    interviewWeight: "★★★★☆",
    sections: [
      {
        title: "What Is a Context Router?",
        type: "concept",
        content: `A **context router** is the intelligent layer that decides:
1. **Which model** should handle this request (based on complexity, cost, capability)
2. **How much context** to include (within token limits, prioritizing most relevant)
3. **What kind of context** to inject (RAG, memory, tools, system prompt variant)
4. **How to compress** the context if it exceeds limits

**Karpathy's 2025 framing:** *"The LLM is the CPU, the context window is RAM. Context engineering is the OS — deciding what gets loaded into RAM for each computation."*

**Why routing matters:** A simple greeting query doesn't need a 200K token context window with all user history, a complex RAG retrieval, and a premium model. It needs a fast, cheap model with minimal context. Routing mismatches are one of the biggest sources of wasted LLM spend.`,
        analogy: {
          title: "📬 The Mail Sorting Analogy",
          text: "A post office sorts mail by destination, size, urgency, and type. A postcard goes standard mail. A fragile package gets special handling. Urgent courier gets priority lane. The context router sorts every LLM request — simple questions get the economy lane, complex multi-step reasoning gets business class, safety-critical queries get the VIP treatment with full context, best model, human review."
        }
      },
      {
        title: "Context Router Architecture",
        type: "architecture",
        diagram: `
┌───────────────────────────────────────────────────────────────────┐
│                     CONTEXT ROUTER                                 │
│                                                                     │
│  Incoming Request: {query, user_id, session_history, tools_avail} │
│        │                                                            │
│        ▼                                                            │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                  CLASSIFIER                                 │  │
│  │  • Complexity: simple / medium / complex                    │  │
│  │  • Domain: general / code / medical / legal / math          │  │
│  │  • Sensitivity: low / medium / high (PII, compliance)       │  │
│  │  • Intent: chat / Q&A / generation / reasoning / agentic    │  │
│  └──────────────────────────┬──────────────────────────────────┘  │
│                             │                                       │
│          ┌──────────────────┼─────────────────────┐               │
│          ▼                  ▼                       ▼               │
│     SIMPLE TIER        MEDIUM TIER            COMPLEX TIER         │
│     gpt-4o-mini       claude-sonnet         claude-opus-4          │
│     4K context         32K context           200K context           │
│     No RAG            RAG (top-3)           RAG (top-10)           │
│     $0.15/1M tok      $3/1M tok             $15/1M tok             │
│          │                  │                       │               │
│          └──────────────────┴─────────────────────┘               │
│                             │                                       │
│                    ┌────────▼────────┐                             │
│                    │ CONTEXT BUILDER │                             │
│                    │ • Retrieved docs│                             │
│                    │ • Memory        │                             │
│                    │ • Prompt variant│                             │
│                    │ • Window mgmt   │                             │
│                    └─────────────────┘                             │
└───────────────────────────────────────────────────────────────────┘`,
        content: `**Context window management strategies:**

**1. Sliding window:** Keep the N most recent turns. Simple, loses early context.

**2. Summarization:** Compress older turns with a small LLM. "Summary of previous 20 turns: [...]". Keeps key info, reduces tokens.

**3. Memory retrieval:** Store all conversation history in a vector DB. At each turn, retrieve semantically relevant past turns (not just recent). Best for long-term conversations.

**4. Token budget allocation:**
\`\`\`
Total window: 32K tokens
  System prompt: 500 tokens (fixed)
  Retrieved context: 8K tokens
  Conversation history: 4K tokens  
  Current query: 500 tokens
  Reserved for output: 2K tokens
  Safety margin: 17K (unused)
\`\`\`

**5. Context compression (LLMLingua):** Neural compression that removes low-importance tokens while preserving semantics. 4-8x compression with <5% quality loss. Critical for long document processing.

**The "lost in the middle" fix:** Always place the most relevant retrieved chunks at the TOP and BOTTOM of the context, never in the middle. Liu et al. (2024) showed >30% accuracy drop for information buried mid-context.`
      },
      {
        title: "Anti-Patterns",
        type: "antipatterns",
        items: [
          { name: "One model for all queries", desc: "Using GPT-4 or Claude Opus for 'hello, how are you'. 99% of simple queries can be handled by a 10x cheaper model with no quality difference. Routing alone typically reduces LLM costs 30-50%." },
          { name: "Naïve context truncation", desc: "Truncating context from the beginning when window is full. Loses the system prompt and early instructions. Always truncate middle content, preserve beginning and end." },
          { name: "No context budget enforcement", desc: "System prompt grows over time as features are added. Eventually exceeds the token budget, silently truncating user content. Set hard limits and monitoring on each context section." },
          { name: "Classification on the hot path", desc: "Running a heavy ML classifier to route every query adds 200ms+ to P50 latency. Use a fast, small classifier (distilbert, <10ms) or rule-based pre-filters." }
        ]
      },
      {
        title: "System Design: Multi-Model Router for Enterprise",
        type: "systemdesign",
        content: `**Design a context router for an enterprise AI assistant handling 1M queries/day across teams (HR, Legal, Finance, Engineering)**

**Query classification:**
- Fast classifier (DistilBERT, 5ms): complexity + domain
- Rule-based: check for PII → compliance tier
- Check query length as proxy for complexity

**Routing table:**
| Class | Model | Context | Cost/query |
|-------|-------|---------|------------|
| Simple chat | claude-haiku | 4K | $0.0003 |
| Domain Q&A | claude-sonnet | 16K + RAG | $0.003 |
| Complex reasoning | claude-opus | 64K + full RAG | $0.03 |
| Compliance-sensitive | claude-opus + HITL | 32K + audit | $0.10 |

**Context builder per domain:**
- HR: employee handbook RAG + HR policy prompt variant
- Legal: legal corpus RAG + citation-required prompt
- Finance: financial data RAG + disclaimer prompt
- Engineering: code context + tool calling enabled

**Savings at 1M queries/day:**
- Without routing: all queries to claude-opus → $30,000/day
- With routing: 70% haiku, 25% sonnet, 5% opus → $4,650/day
- **85% cost reduction**`,
        nfrs: ["Routing decision < 15ms P99", "Routing accuracy (correct tier) > 95%", "Context assembly < 50ms P95", "System handles 5K QPS peak"]
      },
      {
        title: "Interview Q&A",
        type: "interview",
        qas: [
          { q: "How do you train a query complexity classifier?", a: "Collect production queries → label them by complexity (using LLM-as-Judge or human labels → 3-5 classes). Train a fast classifier (DistilBERT, logistic regression on embeddings, or even simple heuristics: query length, number of constraints, presence of 'compare', 'analyze', 'multi-step' signals). Validate against ground truth: does routing match human judgment? A/B test routing thresholds against quality and cost metrics." },
          { q: "How do you handle a query that straddles complexity tiers?", a: "Use probabilistic routing with a score, not hard cutoffs. If complexity score is 0.52 (threshold 0.5), route to medium tier to be safe. Track these boundary cases and use them to improve the classifier. For latency-critical applications, err toward simpler models; for quality-critical, err toward more capable models. Let business context determine the threshold." },
          { q: "What's context engineering and how does it differ from prompt engineering?", a: "Prompt engineering: crafting the instructions/examples in your prompts (what you say to the model). Context engineering: the broader architectural decisions about what information flows into the context window — when to retrieve, what to compress, what to prioritize, how much history to include. Prompt engineering is one tool within context engineering. In 2025, Karpathy and Anthropic both identified context engineering as the primary leverage point in production AI systems." }
        ]
      }
    ]
  }
];

const getLevelColor = (level) => {
  const map = { "Foundation": "#00D4AA", "Core": "#FF6B6B", "Engineering": "#A29BFE", "Infrastructure": "#FD79A8", "Advanced": "#74B9FF", "Production": "#FDCB6E" };
  return map[level] || "#888";
};

export default function LLMTutorials() {
  const [activeTopic, setActiveTopic] = useState(null);
  const [activeSection, setActiveSection] = useState(0);
  const [expandedQAs, setExpandedQAs] = useState({});
  const [completedTopics, setCompletedTopics] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const contentRef = useRef(null);

  const toggleQA = (key) => setExpandedQAs(prev => ({ ...prev, [key]: !prev[key] }));

  const markComplete = (topicId) => {
    setCompletedTopics(prev => new Set([...prev, topicId]));
  };

  const filteredTopics = searchQuery
    ? TOPICS.filter(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.tagline.toLowerCase().includes(searchQuery.toLowerCase()))
    : TOPICS;

  const renderContent = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, i) => {
      if (line.startsWith('**') && line.endsWith('**') && !line.slice(2, -2).includes('**')) {
        return <h4 key={i} style={{ color: activeTopic ? TOPICS[activeTopic.id].color : '#00D4AA', marginTop: 20, marginBottom: 8, fontSize: 15, fontWeight: 700 }}>{line.slice(2, -2)}</h4>;
      }
      if (line.startsWith('- ') || line.startsWith('• ')) {
        const content = line.slice(2);
        return (
          <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
            <span style={{ color: activeTopic ? TOPICS[activeTopic.id].color : '#00D4AA', flexShrink: 0, marginTop: 2 }}>▸</span>
            <span style={{ color: '#CCC', lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: content.replace(/\*\*([^*]+)\*\*/g, `<strong style="color:#FFF">$1</strong>`) }} />
          </div>
        );
      }
      if (line.startsWith('```')) return null;
      if (line.includes('**')) {
        return <p key={i} style={{ color: '#CCC', lineHeight: 1.8, marginBottom: 8 }} dangerouslySetInnerHTML={{ __html: line.replace(/\*\*([^*]+)\*\*/g, `<strong style="color:#FFF">$1</strong>`) }} />;
      }
      if (line.trim() === '') return <div key={i} style={{ height: 8 }} />;
      return <p key={i} style={{ color: '#CCC', lineHeight: 1.8, marginBottom: 6 }}>{line}</p>;
    });
  };

  if (activeTopic) {
    const topic = activeTopic;
    const section = topic.sections[activeSection];

    return (
      <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", background: '#0A0A0F', minHeight: '100vh', color: '#E0E0E0' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(180deg, #111118 0%, #0A0A0F 100%)', borderBottom: '1px solid #1E1E2E', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 16, position: 'sticky', top: 0, zIndex: 100 }}>
          <button onClick={() => setActiveTopic(null)} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: '#AAA', padding: '8px 16px', borderRadius: 8, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s' }}>
            ← Back
          </button>
          <div style={{ fontSize: 22 }}>{topic.emoji}</div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#FFF' }}>{topic.title}</div>
            <div style={{ fontSize: 11, color: '#666' }}>{topic.readTime} read · {topic.interviewWeight} interview weight</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={() => markComplete(topic.id)} style={{ background: completedTopics.has(topic.id) ? topic.color : 'transparent', border: `1px solid ${topic.color}`, color: completedTopics.has(topic.id) ? '#000' : topic.color, padding: '6px 14px', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              {completedTopics.has(topic.id) ? '✓ Done' : 'Mark Done'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto' }}>
          {/* Sidebar */}
          <div style={{ width: 220, flexShrink: 0, padding: '20px 0', borderRight: '1px solid #1A1A2E', position: 'sticky', top: 61, height: 'calc(100vh - 61px)', overflowY: 'auto' }}>
            {topic.sections.map((s, i) => (
              <button key={i} onClick={() => { setActiveSection(i); contentRef.current?.scrollTo(0, 0); }}
                style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 16px', background: activeSection === i ? `${topic.color}15` : 'transparent', borderLeft: activeSection === i ? `3px solid ${topic.color}` : '3px solid transparent', border: 'none', cursor: 'pointer', color: activeSection === i ? topic.color : '#666', fontSize: 12, fontWeight: activeSection === i ? 600 : 400, lineHeight: 1.5, transition: 'all 0.2s' }}>
                {s.title}
              </button>
            ))}
          </div>

          {/* Main content */}
          <div ref={contentRef} style={{ flex: 1, padding: '32px 40px', overflowY: 'auto', maxHeight: 'calc(100vh - 61px)' }}>
            <div style={{ maxWidth: 800 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
                <span style={{ background: `${topic.color}22`, color: topic.color, padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>{section.type}</span>
                <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#FFF' }}>{section.title}</h2>
              </div>

              {/* Analogy box */}
              {section.analogy && (
                <div style={{ background: `${topic.color}10`, border: `1px solid ${topic.color}30`, borderRadius: 12, padding: 20, marginBottom: 24 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: topic.color, marginBottom: 8 }}>{section.analogy.title}</div>
                  <div style={{ color: '#BBB', lineHeight: 1.8, fontSize: 14 }}>{section.analogy.text}</div>
                </div>
              )}

              {/* Main content */}
              {section.content && (
                <div style={{ marginBottom: 24, fontSize: 14 }}>{renderContent(section.content)}</div>
              )}

              {/* Architecture diagram */}
              {section.diagram && (
                <div style={{ background: '#0D0D1A', border: `1px solid ${topic.color}30`, borderRadius: 12, padding: 20, marginBottom: 24, overflowX: 'auto' }}>
                  <div style={{ fontSize: 11, color: topic.color, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>Architecture Diagram</div>
                  <pre style={{ color: '#8BE9FD', fontSize: 12, lineHeight: 1.6, margin: 0, fontFamily: 'monospace', whiteSpace: 'pre' }}>{section.diagram}</pre>
                </div>
              )}

              {/* Metrics */}
              {section.type === 'metrics' && section.content && (
                <div style={{ marginBottom: 24 }}>{renderContent(section.content)}</div>
              )}

              {/* Anti-patterns */}
              {section.items && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  {section.items.map((item, i) => (
                    <div key={i} style={{ background: '#120B0B', border: '1px solid #3D1515', borderRadius: 10, padding: 16, display: 'flex', gap: 14 }}>
                      <div style={{ color: '#E74C3C', fontSize: 18, flexShrink: 0, marginTop: 2 }}>⚠</div>
                      <div>
                        <div style={{ color: '#FF6B6B', fontWeight: 700, fontSize: 14, marginBottom: 6 }}>{item.name}</div>
                        <div style={{ color: '#AAA', fontSize: 13, lineHeight: 1.7 }}>{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* System design */}
              {section.type === 'systemdesign' && section.nfrs && (
                <div style={{ background: '#0D1117', border: '1px solid #2D2D4E', borderRadius: 12, padding: 20, marginBottom: 24 }}>
                  <div style={{ fontSize: 12, color: '#A29BFE', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>Non-Functional Requirements (NFRs)</div>
                  {section.nfrs.map((nfr, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                      <span style={{ color: '#A29BFE' }}>◆</span>
                      <span style={{ color: '#CCC', fontSize: 13 }}>{nfr}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Interview Q&A */}
              {section.qas && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                  <div style={{ fontSize: 12, color: '#FDCB6E', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 700 }}>🎯 Interview Questions & Answers</div>
                  {section.qas.map((qa, i) => (
                    <div key={i} style={{ background: '#0D1117', border: `1px solid ${expandedQAs[`${activeTopic.id}-${activeSection}-${i}`] ? topic.color + '50' : '#2D2D3E'}`, borderRadius: 10, overflow: 'hidden', transition: 'border 0.2s' }}>
                      <button onClick={() => toggleQA(`${activeTopic.id}-${activeSection}-${i}`)}
                        style={{ width: '100%', textAlign: 'left', padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                        <div style={{ color: '#FFF', fontWeight: 600, fontSize: 14, lineHeight: 1.5 }}>Q: {qa.q}</div>
                        <span style={{ color: topic.color, fontSize: 18, flexShrink: 0, marginTop: 1 }}>{expandedQAs[`${activeTopic.id}-${activeSection}-${i}`] ? '−' : '+'}</span>
                      </button>
                      {expandedQAs[`${activeTopic.id}-${activeSection}-${i}`] && (
                        <div style={{ padding: '0 18px 16px', borderTop: `1px solid ${topic.color}20` }}>
                          <div style={{ color: '#00D4AA', fontSize: 12, fontWeight: 600, marginBottom: 8, marginTop: 12 }}>ANSWER:</div>
                          <div style={{ color: '#CCC', fontSize: 13, lineHeight: 1.8 }}>{qa.a}</div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 32, paddingTop: 24, borderTop: '1px solid #1A1A2E' }}>
                <button onClick={() => { if (activeSection > 0) setActiveSection(s => s - 1); }}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: activeSection > 0 ? '#CCC' : '#444', padding: '10px 20px', borderRadius: 8, cursor: activeSection > 0 ? 'pointer' : 'default', fontSize: 13 }}>
                  ← Previous
                </button>
                <div style={{ color: '#444', fontSize: 12, alignSelf: 'center' }}>{activeSection + 1} / {topic.sections.length}</div>
                {activeSection < topic.sections.length - 1 ? (
                  <button onClick={() => setActiveSection(s => s + 1)}
                    style={{ background: topic.gradient, border: 'none', color: '#FFF', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    Next →
                  </button>
                ) : (
                  <button onClick={() => { markComplete(topic.id); setActiveTopic(null); }}
                    style={{ background: topic.gradient, border: 'none', color: '#FFF', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                    ✓ Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // HOME VIEW
  return (
    <div style={{ fontFamily: "'JetBrains Mono', 'Fira Code', monospace", background: '#080810', minHeight: '100vh', color: '#E0E0E0' }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(180deg, #0D0D1F 0%, #080810 100%)', padding: '48px 32px 40px', textAlign: 'center', borderBottom: '1px solid #1A1A2E', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'radial-gradient(circle at 50% 0%, rgba(0,212,170,0.08) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: 11, letterSpacing: 4, color: '#00D4AA', fontWeight: 700, textTransform: 'uppercase', marginBottom: 12 }}>yellamaraju.com/tutorials</div>
          <h1 style={{ fontSize: 'clamp(24px, 4vw, 40px)', fontWeight: 800, margin: '0 0 12px', background: 'linear-gradient(135deg, #FFF 30%, #00D4AA 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.2 }}>
            LLM Systems Engineering
          </h1>
          <p style={{ color: '#666', fontSize: 14, maxWidth: 600, margin: '0 auto 24px', lineHeight: 1.8 }}>
            Zero to expert — 11 production AI topics that get you hired at Anthropic, OpenAI & Meta. 
            Inspired by <span style={{ color: '#00D4AA' }}>Karpathy</span> &amp; <span style={{ color: '#00D4AA' }}>Andrew Ng</span>'s teaching philosophy.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <div style={{ background: 'rgba(0,212,170,0.1)', border: '1px solid rgba(0,212,170,0.2)', padding: '6px 14px', borderRadius: 20, fontSize: 12, color: '#00D4AA' }}>11 Core Topics</div>
            <div style={{ background: 'rgba(162,155,254,0.1)', border: '1px solid rgba(162,155,254,0.2)', padding: '6px 14px', borderRadius: 20, fontSize: 12, color: '#A29BFE' }}>Beginner → Expert</div>
            <div style={{ background: 'rgba(253,203,110,0.1)', border: '1px solid rgba(253,203,110,0.2)', padding: '6px 14px', borderRadius: 20, fontSize: 12, color: '#FDCB6E' }}>Interview Ready</div>
            <div style={{ background: 'rgba(255,107,107,0.1)', border: '1px solid rgba(255,107,107,0.2)', padding: '6px 14px', borderRadius: 20, fontSize: 12, color: '#FF6B6B' }}>Production Patterns</div>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ background: '#0D0D1A', borderBottom: '1px solid #1A1A2E', padding: '12px 32px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 12, color: '#666', flexShrink: 0 }}>Progress: {completedTopics.size}/{TOPICS.length}</div>
        <div style={{ flex: 1, height: 4, background: '#1A1A2E', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${(completedTopics.size / TOPICS.length) * 100}%`, background: 'linear-gradient(90deg, #00D4AA, #A29BFE)', borderRadius: 2, transition: 'width 0.5s ease' }} />
        </div>
        <button onClick={() => setShowSearch(!showSearch)}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#888', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12 }}>
          🔍 Search
        </button>
      </div>

      {showSearch && (
        <div style={{ padding: '12px 32px', background: '#0A0A14', borderBottom: '1px solid #1A1A2E' }}>
          <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search topics..."
            style={{ width: '100%', background: '#111120', border: '1px solid #2D2D4E', color: '#FFF', padding: '10px 16px', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' }} />
        </div>
      )}

      {/* Topics grid */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filteredTopics.map((topic) => (
            <div key={topic.id}
              onClick={() => { setActiveTopic(topic); setActiveSection(0); setExpandedQAs({}); }}
              style={{ background: '#0D0D1A', border: `1px solid ${completedTopics.has(topic.id) ? topic.color + '50' : '#1E1E2E'}`, borderRadius: 14, padding: 24, cursor: 'pointer', transition: 'all 0.25s', position: 'relative', overflow: 'hidden' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = topic.color + '80'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = '#10101E'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = completedTopics.has(topic.id) ? topic.color + '50' : '#1E1E2E'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#0D0D1A'; }}>
              {completedTopics.has(topic.id) && (
                <div style={{ position: 'absolute', top: 12, right: 12, background: topic.color, color: '#000', width: 22, height: 22, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>✓</div>
              )}
              <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 3, background: topic.gradient, borderRadius: '0 14px 14px 0' }} />
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 28, lineHeight: 1 }}>{topic.emoji}</div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: '#444' }}>#{topic.id}</span>
                    <span style={{ background: getLevelColor(topic.level) + '20', color: getLevelColor(topic.level), padding: '2px 8px', borderRadius: 4, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }}>{topic.level}</span>
                  </div>
                  <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#FFF', marginBottom: 4 }}>{topic.title}</h3>
                  <p style={{ margin: 0, fontSize: 12, color: '#666', lineHeight: 1.5 }}>{topic.tagline}</p>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 12 }}>
                  <span style={{ fontSize: 11, color: '#555' }}>⏱ {topic.readTime}</span>
                  <span style={{ fontSize: 11, color: '#555' }}>{topic.sections.length} sections</span>
                </div>
                <div style={{ fontSize: 11, color: topic.color }}>
                  {topic.interviewWeight}
                </div>
              </div>
              <div style={{ marginTop: 14, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {topic.sections.map((s, i) => (
                  <span key={i} style={{ background: '#161622', color: '#555', padding: '2px 8px', borderRadius: 4, fontSize: 10 }}>{s.type}</span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Learning path */}
        <div style={{ marginTop: 48, background: '#0D0D1A', border: '1px solid #1E1E2E', borderRadius: 16, padding: 28 }}>
          <h3 style={{ margin: '0 0 20px', fontSize: 16, fontWeight: 700, color: '#FFF' }}>🗺️ Recommended Learning Path</h3>
          <div style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
            {[
              { phase: "Phase 1", title: "Foundation", topics: [0], color: "#00D4AA", desc: "Eval first — always" },
              { phase: "Phase 2", title: "Core Patterns", topics: [1, 2, 3], color: "#FF6B6B", desc: "RAG + Registry + Gateway" },
              { phase: "Phase 3", title: "Agentic AI", topics: [4, 5], color: "#A29BFE", desc: "Agents + Synthetic Data" },
              { phase: "Phase 4", title: "Specialization", topics: [6, 7], color: "#74B9FF", desc: "Fine-tuning + Scale" },
              { phase: "Phase 5", title: "Production", topics: [8, 9, 10], color: "#FDCB6E", desc: "Safety + Observability" },
            ].map((phase, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0, flexShrink: 0 }}>
                <div style={{ background: '#111120', border: `1px solid ${phase.color}30`, borderRadius: 10, padding: '12px 16px', minWidth: 160 }}>
                  <div style={{ fontSize: 10, color: phase.color, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>{phase.phase}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#FFF', marginBottom: 4 }}>{phase.title}</div>
                  <div style={{ fontSize: 11, color: '#555', marginBottom: 8 }}>{phase.desc}</div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {phase.topics.map(id => (
                      <span key={id} style={{ background: phase.color + '20', color: phase.color, padding: '2px 6px', borderRadius: 4, fontSize: 10, fontWeight: 600 }}>#{id}</span>
                    ))}
                  </div>
                </div>
                {i < 4 && <div style={{ width: 24, height: 2, background: '#1E1E2E', flexShrink: 0 }}>→</div>}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', marginTop: 40, color: '#333', fontSize: 12 }}>
          <p>yellamaraju.com/tutorials · Research-backed content from Karpathy, Andrew Ng, RAGAS, Anthropic, OpenAI papers</p>
          <p style={{ marginTop: 4 }}>Built to help you crack interviews at Anthropic · OpenAI · Meta · Google DeepMind</p>
        </div>
      </div>
    </div>
  );
}

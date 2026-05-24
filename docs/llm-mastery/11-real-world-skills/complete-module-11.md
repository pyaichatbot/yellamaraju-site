# Module 11 — Real-World Skills

> *Building things people actually use: chatbots, copilots, automation, SaaS products, coding workflows, orchestration systems, and AI product thinking.*

---

# 01 — Building Chatbots

## What Makes a Good Chatbot vs a Bad One

**Bad chatbot:** Answers questions. Forgets immediately. No personality. No purpose.

**Good chatbot:** Has a defined role, remembers context, handles edge cases gracefully, knows when to escalate, measures its own performance.

---

## The Production Chatbot Stack

```python
# production_chatbot.py
import anthropic
import json
from datetime import datetime
from typing import Optional

client = anthropic.Anthropic()

class ProductionChatbot:
    """
    Production-ready chatbot with:
    - Role definition via system prompt
    - Conversation memory (last N turns)
    - Tool use support
    - Error handling and fallbacks
    - Response logging
    """

    def __init__(
        self,
        name: str,
        system_prompt: str,
        model: str = "claude-haiku-4-5-20251001",
        max_history_turns: int = 10,
        tools: Optional[list] = None
    ):
        self.name = name
        self.system_prompt = system_prompt
        self.model = model
        self.max_history_turns = max_history_turns
        self.tools = tools or []
        self.conversation_history = []
        self.session_id = datetime.now().strftime("%Y%m%d_%H%M%S")

    def chat(self, user_message: str) -> str:
        # Add user message to history
        self.conversation_history.append({
            "role": "user",
            "content": user_message
        })

        # Trim history if too long (keep last N turns)
        if len(self.conversation_history) > self.max_history_turns * 2:
            self.conversation_history = self.conversation_history[-(self.max_history_turns * 2):]

        # Build API call
        api_kwargs = {
            "model": self.model,
            "max_tokens": 1024,
            "system": self.system_prompt,
            "messages": self.conversation_history
        }
        if self.tools:
            api_kwargs["tools"] = self.tools

        try:
            response = client.messages.create(**api_kwargs)

            # Handle tool use
            while response.stop_reason == "tool_use":
                tool_results = self._process_tools(response.content)
                self.conversation_history.append({"role": "assistant", "content": response.content})
                self.conversation_history.append({"role": "user", "content": tool_results})
                response = client.messages.create(**api_kwargs)

            assistant_message = response.content[0].text

            # Add to history
            self.conversation_history.append({
                "role": "assistant",
                "content": assistant_message
            })

            # Log (in production: write to database)
            self._log(user_message, assistant_message)

            return assistant_message

        except anthropic.APIError as e:
            fallback = "I'm experiencing a technical issue. Please try again in a moment."
            print(f"API Error in session {self.session_id}: {e}")
            return fallback

    def _process_tools(self, content_blocks: list) -> list:
        """Override this method to implement your tools"""
        results = []
        for block in content_blocks:
            if block.type == "tool_use":
                results.append({
                    "type": "tool_result",
                    "tool_use_id": block.id,
                    "content": f"Tool {block.name} not implemented"
                })
        return results

    def _log(self, user_msg: str, assistant_msg: str):
        """Log conversation turn (write to DB in production)"""
        log_entry = {
            "session_id": self.session_id,
            "timestamp": datetime.now().isoformat(),
            "user": user_msg[:200],  # Truncate for logs
            "assistant": assistant_msg[:200],
        }
        # print(json.dumps(log_entry))  # Or write to database

    def reset(self):
        """Clear conversation history"""
        self.conversation_history = []

# =========================================
# Example: Compliance Chatbot
# =========================================

COMPLIANCE_SYSTEM = """You are ComplianceBot, an AI assistant for Fiserv's regulatory compliance team.

SCOPE: EU financial regulations — GDPR, PSD2, MiFID II, DORA, Basel III, AML/KYC.

BEHAVIOR:
- Cite specific regulation articles (e.g., "GDPR Article 17")
- Express uncertainty when needed: "Based on my understanding, you should verify with legal counsel"
- Decline off-topic requests: "I specialize in financial compliance. Please use a general assistant for other topics."
- Never give binding legal advice

OUTPUT FORMAT:
- Short answers: 2-3 sentences
- Complex questions: structured markdown with headers
- Always end advice with: "⚠️ Confirm with your legal team before implementing."

PERSONALITY: Professional, precise, helpful. Not robotic."""

# Create and run the chatbot
compliance_bot = ProductionChatbot(
    name="ComplianceBot",
    system_prompt=COMPLIANCE_SYSTEM,
    model="claude-haiku-4-5-20251001",
    max_history_turns=15
)

# Interactive conversation
def run_cli_chatbot(bot: ProductionChatbot):
    print(f"\n{'='*50}")
    print(f" {bot.name} — Type 'quit' to exit, 'reset' to clear history")
    print(f"{'='*50}\n")

    while True:
        user_input = input("You: ").strip()
        if not user_input:
            continue
        if user_input.lower() == "quit":
            break
        if user_input.lower() == "reset":
            bot.reset()
            print("[History cleared]\n")
            continue

        response = bot.chat(user_input)
        print(f"\n{bot.name}: {response}\n")

# Uncomment to run interactively:
# run_cli_chatbot(compliance_bot)

# Test without interaction
response = compliance_bot.chat("What are GDPR's requirements for data breach notification?")
print(f"Bot: {response}")
```

---

## Chatbot Anti-Patterns to Avoid

| Anti-Pattern | Problem | Fix |
|-------------|---------|-----|
| No system prompt | Random personality, inconsistent | Define role and constraints |
| Infinite context | Costs grow unbounded | Limit to last N turns |
| No error handling | Crashes on API errors | Fallback responses |
| No guardrails | Says anything | Scope restrictions in system prompt |
| Overlong responses | Feels like a report, not a chat | Explicit length guidance |
| No logging | Can't debug or improve | Log every turn |

---

# 02 — AI Copilots

## What is a Copilot?

A copilot is embedded AI that assists humans in their existing workflow — without replacing them.

The human stays in control. The AI suggests, drafts, and analyzes. The human decides and acts.

---

## Copilot Design Patterns

### Pattern 1: In-Line Suggestions
```python
# As user types a clause, copilot analyzes it in real-time
def analyze_contract_clause_realtime(clause: str) -> dict:
    """Called on every paragraph update — must be fast"""

    if len(clause.strip()) < 50:
        return {}  # Too short to analyze

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",  # Fast model for real-time
        max_tokens=200,
        messages=[{
            "role": "user",
            "content": f"""Quick compliance check for this contract clause.
Return JSON only: {{"risk": "low/medium/high", "issue": "brief issue or null", "suggestion": "brief fix or null"}}

Clause: {clause}"""
        }]
    )

    try:
        return json.loads(response.content[0].text)
    except:
        return {}
```

### Pattern 2: On-Demand Analysis
```python
# Button in UI triggers comprehensive analysis
def comprehensive_document_review(document_text: str) -> dict:
    """Full analysis when user clicks 'Review' — can take longer"""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        system="You are a senior compliance counsel reviewing documents.",
        messages=[{
            "role": "user",
            "content": f"""Perform a full compliance review of this document.

Document:
{document_text}

Analyze for:
1. GDPR compliance issues
2. PSD2 implications
3. MiFID II requirements
4. General contractual risks

Return structured JSON:
{{
  "overall_risk": "low/medium/high/critical",
  "gdpr_issues": [{{"article": "...", "issue": "...", "severity": "...", "fix": "..."}}],
  "psd2_issues": [...],
  "mifid_issues": [...],
  "general_risks": [...],
  "recommended_actions": ["list"],
  "needs_legal_review": true/false
}}"""
        }]
    )

    try:
        return json.loads(response.content[0].text)
    except:
        return {"raw_analysis": response.content[0].text}
```

### Pattern 3: Response Drafting
```python
# Customer service copilot: suggests responses to agents
def suggest_response(customer_message: str, context: dict) -> list[str]:
    """Generate 3 response options for the human agent to choose from"""

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=800,
        system="""You are helping a customer service agent draft responses.
Generate 3 different response options: formal, friendly, and brief.""",
        messages=[{
            "role": "user",
            "content": f"""Customer message: {customer_message}

Context: {json.dumps(context)}

Generate 3 response options in JSON:
{{"formal": "...", "friendly": "...", "brief": "..."}}"""
        }]
    )

    try:
        options = json.loads(response.content[0].text)
        return [options["formal"], options["friendly"], options["brief"]]
    except:
        return [response.content[0].text]
```

---

# 03 — AI Automation

## Three Levels of AI Automation

### Level 1: Single-Step Automation
One LLM call replaces a manual task:
```python
# Manual: Person reads document, writes summary
# Automated: LLM reads, summarizes, saves

def auto_summarize_and_save(document_path: str, output_path: str):
    with open(document_path) as f:
        content = f.read()

    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=500,
        messages=[{"role": "user", "content": f"Summarize this compliance document in bullet points:\n\n{content}"}]
    )

    summary = response.content[0].text
    with open(output_path, "w") as f:
        f.write(summary)

    print(f"Saved summary to {output_path}")
```

### Level 2: Pipeline Automation
Multiple LLM steps, each transforming data:
```python
def compliance_pipeline(document: str) -> dict:
    # Step 1: Extract → Step 2: Classify → Step 3: Assess → Step 4: Report
    extracted = extract_obligations(document)
    classified = classify_by_regulation(extracted)
    assessed = assess_risk(classified)
    report = generate_report(assessed)
    return {"report": report, "risk": assessed}
```

### Level 3: Agentic Automation
LLM decides what steps to take:
```python
def agentic_compliance_audit(company_name: str):
    """Autonomously research, analyze, and report compliance status"""
    # Agent decides: search web → fetch regulations → analyze gaps → write report
    return compliance_agent.run(f"Perform a compliance gap analysis for {company_name}")
```

---

## Batch Automation with Claude

```python
import anthropic
import json

client = anthropic.Anthropic()

# Process 1000 documents overnight at 50% discount
def batch_process_documents(documents: list[dict]) -> str:
    """Use Anthropic batch API for cost-efficient bulk processing"""

    batch_requests = []
    for i, doc in enumerate(documents):
        batch_requests.append({
            "custom_id": f"doc-{i:04d}",
            "params": {
                "model": "claude-haiku-4-5-20251001",
                "max_tokens": 300,
                "messages": [{
                    "role": "user",
                    "content": f"""Extract compliance obligations from this text.
Return JSON: {{"obligations": ["list"], "regulation": "most relevant regulation", "risk": "low/medium/high"}}

Text: {doc['content'][:2000]}"""
                }]
            }
        })

    # Submit batch
    batch = client.messages.batches.create(requests=batch_requests)
    print(f"Batch submitted: {batch.id}")
    print(f"Processing {len(batch_requests)} documents...")
    return batch.id

def retrieve_batch_results(batch_id: str) -> list:
    """Retrieve completed batch results"""
    import time

    while True:
        batch = client.messages.batches.retrieve(batch_id)
        print(f"Status: {batch.processing_status} | "
              f"Complete: {batch.request_counts.succeeded}/{batch.request_counts.processing + batch.request_counts.succeeded}")

        if batch.processing_status == "ended":
            break
        time.sleep(30)

    results = []
    for result in client.messages.batches.results(batch_id):
        if result.result.type == "succeeded":
            try:
                data = json.loads(result.result.message.content[0].text)
                results.append({"id": result.custom_id, "data": data})
            except:
                results.append({"id": result.custom_id, "error": "parse_failed"})

    return results
```

---

# 04 — AI SaaS Workflows

## Building AI-Powered Products

A minimal viable AI SaaS product needs:

```
1. User Authentication
2. LLM API integration
3. Usage tracking (token counting)
4. Rate limiting (prevent abuse)
5. Cost management (per-user limits)
6. Prompt management (versioned, tested prompts)
7. Output storage (save generated content)
8. Evaluation hooks (measure quality)
```

---

## Minimal AI SaaS Architecture

```python
# ai_saas_core.py

import anthropic
from datetime import datetime
import sqlite3
import hashlib

client = anthropic.Anthropic()

# Database setup
def init_db():
    conn = sqlite3.connect("ai_saas.db")
    conn.execute("""CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY, api_key TEXT, plan TEXT,
        monthly_token_limit INTEGER, tokens_used INTEGER DEFAULT 0,
        created_at TEXT)""")
    conn.execute("""CREATE TABLE IF NOT EXISTS usage_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT, prompt TEXT, response TEXT,
        input_tokens INTEGER, output_tokens INTEGER,
        model TEXT, cost_usd REAL, timestamp TEXT)""")
    conn.commit()
    return conn

db = init_db()

class AISaaSService:

    PLANS = {
        "free": {"monthly_tokens": 100_000, "models": ["claude-haiku-4-5-20251001"]},
        "starter": {"monthly_tokens": 1_000_000, "models": ["claude-haiku-4-5-20251001", "claude-sonnet-4-20250514"]},
        "pro": {"monthly_tokens": 10_000_000, "models": ["claude-haiku-4-5-20251001", "claude-sonnet-4-20250514", "claude-opus-4"]},
    }

    TOKEN_PRICES = {
        "claude-haiku-4-5-20251001": {"input": 0.25/1e6, "output": 1.25/1e6},
        "claude-sonnet-4-20250514": {"input": 3.0/1e6, "output": 15.0/1e6},
    }

    def generate(self, user_id: str, prompt: str, model: str = "claude-haiku-4-5-20251001",
                 max_tokens: int = 500, system: str = "") -> dict:

        # 1. Get user
        user = db.execute("SELECT * FROM users WHERE id=?", (user_id,)).fetchone()
        if not user:
            return {"error": "User not found"}

        _, _, plan, token_limit, tokens_used, _ = user

        # 2. Check plan model access
        if model not in self.PLANS.get(plan, {}).get("models", []):
            return {"error": f"Model {model} not available on {plan} plan"}

        # 3. Check token budget
        estimated_tokens = len(prompt.split()) + max_tokens
        if tokens_used + estimated_tokens > token_limit:
            return {"error": "Monthly token limit reached. Please upgrade your plan."}

        # 4. Generate
        messages = [{"role": "user", "content": prompt}]
        kwargs = {"model": model, "max_tokens": max_tokens, "messages": messages}
        if system:
            kwargs["system"] = system

        response = client.messages.create(**kwargs)
        output_text = response.content[0].text

        # 5. Track usage
        input_tokens = response.usage.input_tokens
        output_tokens = response.usage.output_tokens
        price = self.TOKEN_PRICES.get(model, {"input": 0, "output": 0})
        cost = input_tokens * price["input"] + output_tokens * price["output"]

        db.execute("""INSERT INTO usage_log
            (user_id, prompt, response, input_tokens, output_tokens, model, cost_usd, timestamp)
            VALUES (?,?,?,?,?,?,?,?)""",
            (user_id, prompt[:500], output_text[:500],
             input_tokens, output_tokens, model, cost, datetime.now().isoformat()))

        db.execute("UPDATE users SET tokens_used = tokens_used + ? WHERE id = ?",
                   (input_tokens + output_tokens, user_id))
        db.commit()

        return {
            "text": output_text,
            "usage": {"input": input_tokens, "output": output_tokens},
            "cost_usd": round(cost, 6)
        }

    def get_usage_stats(self, user_id: str) -> dict:
        user = db.execute("SELECT plan, monthly_token_limit, tokens_used FROM users WHERE id=?",
                         (user_id,)).fetchone()
        if not user:
            return {"error": "User not found"}
        plan, limit, used = user
        return {
            "plan": plan,
            "tokens_used": used,
            "token_limit": limit,
            "usage_pct": round(used / limit * 100, 1),
            "remaining": limit - used
        }
```

---

# 05 — AI Coding Workflows

## LLMs in Your Development Workflow

The best developers use AI throughout the development process:

### Code Generation
```python
def generate_code_from_spec(spec: str, language: str = "python") -> str:
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=2000,
        system=f"""You are an expert {language} developer.
Write production-quality code: typed, documented, with error handling.
Include only code, no explanation.""",
        messages=[{"role": "user", "content": f"Implement this specification:\n\n{spec}"}]
    )
    return response.content[0].text
```

### Automated Code Review
```python
def automated_code_review(code: str, language: str = "python") -> dict:
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1500,
        messages=[{
            "role": "user",
            "content": f"""Review this {language} code. Return JSON:
{{
  "rating": 1-10,
  "critical": [{{"line": "...", "issue": "...", "fix": "..."}}],
  "warnings": ["..."],
  "positives": ["..."],
  "improved_code": "full corrected version"
}}

Code:
```{language}
{code}
```"""
        }]
    )
    try:
        return json.loads(response.content[0].text)
    except:
        return {"raw": response.content[0].text}
```

### Test Generation
```python
def generate_tests(function_code: str, language: str = "python") -> str:
    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=1500,
        system=f"Write comprehensive {language} unit tests. Cover happy path, edge cases, and error cases.",
        messages=[{"role": "user", "content": f"Write tests for:\n\n```{language}\n{function_code}\n```"}]
    )
    return response.content[0].text
```

### Documentation Generation
```python
def generate_docs(code: str) -> str:
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=1000,
        messages=[{
            "role": "user",
            "content": f"""Generate complete documentation for this code.
Include: purpose, parameters, return values, examples, error handling.

```python
{code}
```"""
        }]
    )
    return response.content[0].text
```

---

## CI/CD Integration

```yaml
# .github/workflows/ai_review.yml
name: AI Code Review

on:
  pull_request:
    types: [opened, synchronize]

jobs:
  ai-review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
        with:
          fetch-depth: 0

      - name: Get changed files
        id: changed
        run: |
          git diff --name-only origin/main...HEAD > changed_files.txt
          cat changed_files.txt

      - name: AI Code Review
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
        run: |
          python3 << 'EOF'
          import anthropic, subprocess, os

          client = anthropic.Anthropic()

          with open("changed_files.txt") as f:
              files = [l.strip() for l in f if l.strip().endswith(".py")]

          for filepath in files[:5]:  # Review up to 5 files
              try:
                  with open(filepath) as f:
                      code = f.read()
              except:
                  continue

              resp = client.messages.create(
                  model="claude-haiku-4-5-20251001",
                  max_tokens=500,
                  messages=[{
                      "role": "user",
                      "content": f"Quick review of {filepath}. Flag only critical issues (bugs, security, data leaks). Max 5 bullet points.\n\n{code[:3000]}"
                  }]
              )
              print(f"\n## AI Review: {filepath}")
              print(resp.content[0].text)
          EOF
```

---

# 06 — AI Orchestration Systems

## What is AI Orchestration?

Orchestration is coordinating multiple AI calls, tools, and services to accomplish complex goals.

Key components:
- **Router**: Decides which agent/model handles a request
- **Planner**: Breaks goals into subtasks
- **Executor**: Runs each subtask
- **Memory**: Passes state between steps
- **Evaluator**: Checks output quality

---

## Simple Orchestration with Claude

```python
class ComplianceOrchestrationSystem:
    """
    Orchestrates multiple AI components for compliance automation:
    - Document ingestion
    - Obligation extraction
    - Risk assessment
    - Report generation
    - Notification routing
    """

    def __init__(self):
        self.client = anthropic.Anthropic()

    def _call_model(self, system: str, prompt: str, model="claude-haiku-4-5-20251001",
                    max_tokens=500, expect_json=False) -> str:
        resp = self.client.messages.create(
            model=model,
            max_tokens=max_tokens,
            system=system,
            messages=[{"role": "user", "content": prompt}]
        )
        text = resp.content[0].text
        if expect_json:
            try:
                return json.loads(text)
            except:
                return {}
        return text

    def process_regulatory_update(self, regulation_text: str, regulation_name: str) -> dict:
        """Full orchestration pipeline for a new regulatory document"""

        print(f"\n📋 Processing: {regulation_name}")

        # Step 1: Extract key obligations
        print("  1/5 Extracting obligations...")
        obligations = self._call_model(
            system="Expert regulatory analyst. Extract specific compliance obligations.",
            prompt=f"Extract all compliance obligations from this {regulation_name} text as a JSON list. Each item: {{\"obligation\": \"...\", \"deadline\": \"...\", \"applies_to\": \"...\"}}\n\n{regulation_text[:3000]}",
            model="claude-sonnet-4-20250514",
            max_tokens=800,
            expect_json=True
        )

        # Step 2: Classify by impact
        print("  2/5 Classifying impact...")
        impact = self._call_model(
            system="Compliance risk assessor for a payment services company.",
            prompt=f"Classify these obligations by impact on a payment services company. Return JSON: {{\"high_impact\": [...], \"medium_impact\": [...], \"low_impact\": [...]}}\n\nObligations: {json.dumps(obligations)[:1500]}",
            max_tokens=600,
            expect_json=True
        )

        # Step 3: Identify gaps (compare to known controls)
        print("  3/5 Identifying gaps...")
        known_controls = ["KYC process", "GDPR DPO appointed", "SCA implemented", "AML monitoring active"]
        gaps = self._call_model(
            system="Compliance gap analyst.",
            prompt=f"Given these existing controls: {known_controls}\n\nAnd these new obligations: {json.dumps(impact.get('high_impact', []))}\n\nIdentify compliance gaps. Return JSON list of gaps.",
            model="claude-sonnet-4-20250514",
            max_tokens=600,
            expect_json=True
        )

        # Step 4: Generate action plan
        print("  4/5 Generating action plan...")
        action_plan = self._call_model(
            system="Compliance program manager. Create actionable implementation plans.",
            prompt=f"Create an action plan to address these compliance gaps. Include owner, timeline, and resources.\nGaps: {json.dumps(gaps)[:1000]}\nReturn JSON: {{\"actions\": [{{\"action\": \"...\", \"owner\": \"...\", \"deadline_days\": N, \"priority\": \"high/medium/low\"}}]}}",
            model="claude-sonnet-4-20250514",
            max_tokens=800,
            expect_json=True
        )

        # Step 5: Generate executive summary
        print("  5/5 Writing executive summary...")
        summary = self._call_model(
            system="Executive communications specialist. Write clear, concise briefings for senior management.",
            prompt=f"""Write a 3-paragraph executive summary of this regulatory update:
Regulation: {regulation_name}
Key obligations found: {len(obligations) if isinstance(obligations, list) else 'multiple'}
High-impact items: {len(impact.get('high_impact', [])) if isinstance(impact, dict) else 'several'}
Gaps identified: {len(gaps) if isinstance(gaps, list) else 'several'}
Actions required: {len(action_plan.get('actions', [])) if isinstance(action_plan, dict) else 'multiple'}""",
            model="claude-sonnet-4-20250514",
            max_tokens=600
        )

        result = {
            "regulation": regulation_name,
            "obligations_extracted": obligations,
            "impact_classification": impact,
            "gaps_identified": gaps,
            "action_plan": action_plan,
            "executive_summary": summary,
            "processed_at": datetime.now().isoformat()
        }

        print(f"\n✅ Processing complete for {regulation_name}")
        return result

# Usage
system = ComplianceOrchestrationSystem()

sample_regulation = """
DORA Article 17: ICT-related incidents
Financial entities shall establish, implement and maintain a management process to detect, manage and notify ICT-related incidents.
Financial entities shall classify ICT-related incidents and shall determine their impact based on the following criteria:
(a) the number of clients or financial counterparts affected;
(b) the duration of the ICT-related incident;
(c) the geographical spread with regard to the areas affected by the ICT-related incident;
(d) the data losses that the ICT-related incident entails, in relation to availability, authenticity, integrity or confidentiality of data;
(e) the criticality of the services affected;
(f) the economic impact, in particular direct and indirect costs and losses.
"""

result = system.process_regulatory_update(sample_regulation, "DORA Article 17")
print(f"\nExecutive Summary:\n{result['executive_summary']}")
```

---

# 07 — AI Product Thinking

## From Engineer to AI Product Builder

Technical skill is necessary but not sufficient. The best AI engineers also think like product managers:

---

## The AI Product Canvas

Before building anything, answer these questions:

```
WHO IS THE USER?
  - Who uses this? (Compliance officer? Developer? End consumer?)
  - What is their technical level?
  - What do they care about most?

WHAT IS THE CORE JOB-TO-BE-DONE?
  - What task does this replace or augment?
  - What does success look like for them?
  - How do they measure value?

WHERE DOES AI ADD GENUINE VALUE?
  - What's currently slow, expensive, or error-prone?
  - What would take humans hours that AI can do in seconds?
  - What is the quality bar? (Good enough? Or needs to be perfect?)

WHAT ARE THE FAILURE MODES?
  - What happens when the AI is wrong? Is it recoverable?
  - Who is harmed if quality degrades?
  - What safeguards prevent bad outputs reaching users?

WHAT IS THE BUSINESS MODEL?
  - API cost per user action
  - Pricing strategy (subscription? per-use? per-seat?)
  - Break-even point

HOW DO YOU MEASURE SUCCESS?
  - Accuracy/quality metrics
  - User adoption and retention
  - Cost per interaction
  - Time saved vs baseline
```

---

## Common AI Product Failure Modes

| Failure | Root Cause | Prevention |
|---------|-----------|------------|
| "It hallucinates too much" | Wrong model for task, no RAG | Use RAG for factual tasks |
| "Users don't trust it" | No transparency, no sources | Show citations, explain confidence |
| "Too slow" | Model too large, no caching | Right-size model, add caching |
| "Too expensive to scale" | Overengineered, wrong model | Start cheap, upgrade only where needed |
| "Nobody uses it" | Solves wrong problem | Talk to users first, build later |
| "Quality degrades over time" | No eval pipeline | Automated evals in CI/CD |

---

## The Right Model for the Right Task

```python
# AI Product Model Router — match task to model economically
class ProductModelRouter:

    def route(self, task_type: str, content: str, quality_required: str = "good") -> str:
        """
        Route to cheapest model that meets quality requirements.
        quality_required: "fast", "good", "best"
        """

        # Fast/cheap for simple classification and extraction
        if task_type in ["classify", "extract_keywords", "yes_no_question", "summarize_short"]:
            return "claude-haiku-4-5-20251001"

        # Medium quality for analysis and drafting
        if task_type in ["analyze", "draft", "compare", "summarize_long"]:
            if quality_required == "fast":
                return "claude-haiku-4-5-20251001"
            return "claude-sonnet-4-20250514"

        # Best quality for complex reasoning
        if task_type in ["complex_reasoning", "legal_analysis", "architecture_design"]:
            return "claude-sonnet-4-20250514"

        # Default: Sonnet (good balance)
        return "claude-sonnet-4-20250514"

router = ProductModelRouter()

# A compliance platform might use:
print(router.route("classify", "document text"))          # haiku = cheap
print(router.route("analyze", "contract text"))           # sonnet = good
print(router.route("complex_reasoning", "architecture"))  # sonnet = best available
```

---

## Building Toward the FDE Role

For a Forward Deployed Engineer at Anthropic or OpenAI, demonstrate:

### Technical Depth
- Fine-tuned a model end-to-end (QLoRA → evaluation → deployment)
- Built a RAG system with proper chunking, retrieval, and evaluation
- Implemented multi-agent workflows with tool use
- Set up observability (OpenTelemetry traces, evaluation dashboards)

### Domain Expertise
- Applied AI to a real business problem (compliance automation)
- Understand regulatory requirements (GDPR, PSD2, DORA, Basel III)
- Know where AI fails and how to mitigate it in high-stakes domains

### Product Thinking
- Built something users actually use
- Measured quality systematically
- Wrote clear technical documentation

### Communication
- Published technical writing (blog posts, GitHub)
- Can explain complex concepts in plain language
- Gives internal tech talks (you already do this at Fiserv)

---

## 📝 Module 11 Summary

| Skill | Key Takeaway |
|-------|-------------|
| Chatbots | System prompt + conversation history + error handling + logging |
| Copilots | AI assists human workflows without replacing human judgment |
| AI Automation | 3 levels: single-step, pipeline, agentic — match to use case |
| AI SaaS | Track usage, enforce limits, manage cost, version prompts |
| AI Coding | Code gen, review, tests, docs — use AI throughout the SDLC |
| Orchestration | Coordinate multiple AI components for complex workflows |
| Product Thinking | Right model, right task, measure quality, manage cost |

---

## 🧠 Mental Model

> Building AI products is like being an architect.
> You don't pour concrete yourself — you design the system that works.
> Pick the right materials (models), design the right structure (prompts, agents, RAG),
> measure what matters (evals), and make it affordable at scale (cost analysis).
> The building is the product. The architect is you.

---

## ❌ Final Beginner Mistakes

1. **Over-engineering before validating** — Build a 1-prompt MVP first. Does it solve the problem?
2. **Ignoring hallucinations in production** — Add grounding, citations, and validation for factual tasks
3. **No human fallback** — Always have a way to escalate to humans for critical decisions
4. **Single model for everything** — Route tasks to the right model by complexity and cost
5. **No monitoring** — You can't improve what you don't measure
6. **Skipping evals** — Build your eval suite first, before you build the product

---

## 🏋️ Final Capstone Exercise

**Build an enterprise-ready compliance automation product.**

The prototype below is the starting point, not the finish line. For enterprise completion, submit an implementation packet that proves the system can be reviewed, measured, and operated.

### Capstone Brief

Build a compliance document processor that ingests regulatory text, extracts obligations, classifies risk, recommends actions, writes an executive summary, and produces evaluation evidence.

Required users:

- Compliance analyst reviewing regulatory obligations.
- Engineering owner responsible for implementation and operations.
- Risk/security reviewer approving whether the workflow can run on enterprise data.

Required deliverables:

| Deliverable | Required contents |
|-------------|-------------------|
| Use-case brief | User, business value, data classification, risk tier, non-goals |
| Architecture | Data flow, model calls, RAG/agent decisions, access boundaries, fallback path |
| Implementation | Runnable code or notebook, setup instructions, sample inputs, structured outputs |
| Evaluation | Baseline, locked test set, quality metrics, safety/privacy cases, release threshold |
| Governance packet | Data card, model inventory entry, human oversight plan, approval checklist |
| Security controls | Identity assumption, RBAC/ABAC plan, secrets handling, logging/redaction policy |
| Operations | SLOs, monitoring signals, incident runbook, rollback plan, change record |
| Demo script | 5-10 minute walkthrough with success case, failure case, and release decision |

### Acceptance Criteria

The capstone passes only if:

1. The workflow returns structured JSON for obligations, risk, actions, summary, and metadata.
2. The system refuses or escalates when the document is outside scope or too risky.
3. The evaluation suite compares the capstone against a baseline prompt or previous version.
4. At least 5 failure cases are documented with severity and remediation.
5. Prompt/response logging is privacy-safe by default.
6. Human review is required before high-risk recommendations become actions.
7. The release decision is explicit: approve, approve with conditions, or block.

### Capstone Rubric

Score out of 100:

| Category | Points |
|----------|--------|
| Use-case framing | 10 |
| Architecture and access boundaries | 15 |
| Working implementation | 15 |
| Evaluation and failure analysis | 15 |
| Governance packet | 15 |
| Security and privacy controls | 10 |
| Operations and rollback | 10 |
| Demo and communication | 10 |

Enterprise-ready completion requires **85+**.

### Starter Implementation

```python
"""
CAPSTONE: Compliance Document Processor

Features to implement:
1. Document ingestion (text input)
2. Obligation extraction (SFT-style prompting)
3. Risk classification (few-shot prompting)
4. Action recommendations (chain-of-thought)
5. Executive summary (output formatting)
6. Evaluation (LLM-as-judge)
7. Cost tracking (token counting)

This demonstrates: prompting, pipelines, evaluation, and product thinking.
"""

import anthropic
import json
import time

client = anthropic.Anthropic()

def process_compliance_document(document: str, document_name: str) -> dict:
    total_tokens = {"input": 0, "output": 0}
    start_time = time.time()

    def call(prompt: str, system: str = "", model="claude-haiku-4-5-20251001", max_tokens=500) -> str:
        resp = client.messages.create(
            model=model, max_tokens=max_tokens,
            system=system or "You are a compliance expert.",
            messages=[{"role": "user", "content": prompt}]
        )
        total_tokens["input"] += resp.usage.input_tokens
        total_tokens["output"] += resp.usage.output_tokens
        return resp.content[0].text

    # 1. Extract obligations
    raw_obligations = call(
        f"Extract compliance obligations as JSON list of strings:\n\n{document[:2000]}",
        max_tokens=400
    )
    try:
        obligations = json.loads(raw_obligations)
    except:
        obligations = [raw_obligations]

    # 2. Classify risk
    risk_result = call(
        f"Classify overall risk: low/medium/high/critical. Return JSON: {{\"level\": \"...\", \"reason\": \"...\"}}\n\nObligations: {json.dumps(obligations[:5])}",
        max_tokens=200
    )
    try:
        risk = json.loads(risk_result)
    except:
        risk = {"level": "medium", "reason": risk_result}

    # 3. Recommend actions
    actions = call(
        f"List 3 concrete actions to address these obligations. Return JSON list: [{{'action': '...', 'priority': 'high/medium/low'}}]\n\nObligations: {json.dumps(obligations[:5])}",
        max_tokens=400
    )
    try:
        action_list = json.loads(actions)
    except:
        action_list = [{"action": actions, "priority": "medium"}]

    # 4. Executive summary
    summary = call(
        f"Write a 2-sentence executive summary of this compliance document and its implications.\nDocument: {document_name}\nRisk: {risk.get('level')}\nKey obligations: {len(obligations)}",
        model="claude-haiku-4-5-20251001",
        max_tokens=150
    )

    # 5. Self-evaluate quality
    quality = call(
        f"Rate this compliance analysis quality (1-5) and explain. Return JSON: {{\"score\": N, \"reason\": \"...\"}}\n\nAnalysis:\nObligations: {len(obligations)}\nRisk: {risk}\nActions: {len(action_list)}\nSummary: {summary}",
        max_tokens=150
    )
    try:
        quality_score = json.loads(quality)
    except:
        quality_score = {"score": 3, "reason": "Unable to evaluate"}

    # Cost calculation
    total_cost = (total_tokens["input"] * 0.25 + total_tokens["output"] * 1.25) / 1e6
    elapsed = round(time.time() - start_time, 2)

    return {
        "document_name": document_name,
        "obligations_count": len(obligations),
        "obligations": obligations[:5],  # First 5 for display
        "risk": risk,
        "recommended_actions": action_list,
        "executive_summary": summary,
        "quality_score": quality_score,
        "metadata": {
            "total_input_tokens": total_tokens["input"],
            "total_output_tokens": total_tokens["output"],
            "total_cost_usd": round(total_cost, 6),
            "processing_time_sec": elapsed
        }
    }

# Test it
sample_doc = """
DORA Article 19 - Reporting of major ICT-related incidents:
Financial entities shall report major ICT-related incidents to the competent authority.
The initial notification shall be submitted as soon as possible and no later than 4 hours
from the moment the financial entity has become aware that the incident qualifies as major.
The intermediate report shall be submitted within 72 hours of the initial notification.
The final report shall be submitted within one month after the submission of the intermediate report.
Financial entities shall also notify clients potentially affected by the major ICT-related incident.
"""

result = process_compliance_document(sample_doc, "DORA Article 19 - Incident Reporting")

print("=" * 60)
print(f"Document: {result['document_name']}")
print(f"Obligations found: {result['obligations_count']}")
print(f"Risk level: {result['risk'].get('level', 'unknown').upper()}")
print(f"\nExecutive Summary:\n{result['executive_summary']}")
print(f"\nRecommended Actions:")
for a in result['recommended_actions']:
    if isinstance(a, dict):
        print(f"  [{a.get('priority', 'medium').upper()}] {a.get('action', a)}")
print(f"\nQuality Score: {result['quality_score'].get('score', '?')}/5")
print(f"\nCost: ${result['metadata']['total_cost_usd']} | Time: {result['metadata']['processing_time_sec']}s")
```

**Challenge:** Extend this into a Streamlit or FastAPI app. Add a database. Add multiple documents. Track quality over time. That's a real AI product.

### Required Enterprise Extensions

Add these before considering the capstone complete:

1. **Data card:** source, license, sensitivity, PII status, retention, deletion, and owner.
2. **Model inventory entry:** model, provider, approved use, fallback, retention setting, and owner.
3. **Evaluation suite:** 10+ test documents or questions with expected topics and failure severities.
4. **Safety tests:** prompt injection, out-of-scope request, missing evidence, and legal-advice escalation.
5. **Privacy-safe telemetry:** request ID, model, token counts, latency, eval version, and document IDs; no raw prompt logging by default.
6. **Human oversight:** high-risk outputs require reviewer approval before recommended actions are executed.
7. **Release gate:** a final markdown report with pass/fail thresholds and release decision.

### Enterprise Wrapper Skeleton

Use this wrapper pattern to connect the prototype code to enterprise evidence.

```python
from dataclasses import dataclass
from datetime import datetime
from hashlib import sha256

@dataclass
class ReviewDecision:
    approved: bool
    reviewer: str
    reason: str

def hash_text(value: str) -> str:
    return sha256(value.encode("utf-8")).hexdigest()[:16]

def log_safe_event(event: dict) -> None:
    """Log metadata, not raw regulated content."""
    safe_event = {
        "timestamp": datetime.utcnow().isoformat(),
        "request_id": event["request_id"],
        "document_hash": hash_text(event["document_text"]),
        "model": event["model"],
        "input_tokens": event["input_tokens"],
        "output_tokens": event["output_tokens"],
        "latency_ms": event["latency_ms"],
        "risk_level": event["risk_level"],
        "release_gate_version": event["release_gate_version"],
    }
    print(safe_event)

def requires_human_review(result: dict) -> bool:
    return result["risk"].get("level") in {"high", "critical"}

def release_gate(eval_results: dict) -> dict:
    return {
        "quality_pass": eval_results["pass_rate"] >= 0.85,
        "privacy_pass": eval_results["privacy_failures"] == 0,
        "safety_pass": eval_results["critical_failures"] == 0,
        "cost_pass": eval_results["avg_cost_usd"] <= 0.15,
    }
```

---

# 🎓 Curriculum Complete

Congratulations. You've covered:

| Module | Topics |
|--------|--------|
| 01 Foundations | LLMs, transformers, tokens, embeddings, parameters, training |
| 02 Datasets | SFT, instruction tuning, preferences, synthetic data, cleaning |
| 03 Fine-Tuning | LoRA, QLoRA, DPO, RLHF, quantization, GGUF |
| 04 Inference | KV cache, Flash Attention, speculative decoding, serving, GPU |
| 05 Ecosystem | llama.cpp, Ollama, vLLM, MLX, HuggingFace, Unsloth, Axolotl |
| 06 RAG & Memory | RAG, vector DBs, chunking, retrieval, memory systems |
| 07 Agents | Prompting, system prompts, tool calling, agents, multi-agent |
| 08 Model Types | VLMs, SLMs, dense, MoE, coding models, reasoning models |
| 09 Deployment | Local, on-device, API serving, cloud GPUs, edge AI |
| 10 Evaluation | Benchmarks, human evals, LLM-as-judge, cost analysis, speed |
| 11 Real-World | Chatbots, copilots, automation, SaaS, coding, orchestration, product |
| 12 Governance | Risk classification, data governance, security controls, release gates, monitoring, incident response |

---

## What to Build Next

Given your background, these are the highest-value next projects:

1. **Compliance Automation System** (FDE-targeting project)
   - Ingest regulatory PDFs → RAG pipeline → Claude API → structured output
   - Add evaluation suite + observability
   - Document it on GitHub as your flagship project

2. **Fine-tuned Compliance Model**
   - Build 200+ example SFT dataset from real regulatory text
   - QLoRA fine-tune on LLaMA 3.1 8B
   - Evaluate vs base model + Claude Haiku
   - Publish model + results on Hugging Face

3. **Publish What You Build**
   - Technical blog post on yellamaraju.com for each module you implement
   - LinkedIn posts with benchmarks and screenshots
   - GitHub repo with clean code and documentation

The skills are now yours. Build with them.

---

*End of LLM Mastery Curriculum*

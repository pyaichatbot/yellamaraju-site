# Enterprise Assessment Guide

Use this guide to run LLM Mastery as a measurable enterprise training program. The goal is not only to complete exercises. The goal is to produce evidence that an LLM system can be built, evaluated, released, and operated responsibly.

---

## Course-Level Outcomes

By the end of the course, a learner should be able to:

1. Explain how LLMs, embeddings, RAG, agents, fine-tuning, and model serving work at an engineering level.
2. Choose between prompting, RAG, fine-tuning, local models, hosted APIs, and agentic workflows for a specific enterprise use case.
3. Build a prototype with measurable quality, cost, latency, and safety behavior.
4. Create evaluation datasets, baselines, release thresholds, and regression tests.
5. Identify data governance, privacy, security, access-control, and compliance risks.
6. Prepare a release packet with operational controls, monitoring, rollback, human oversight, and incident response.

---

## Standard Module Header Template

Add this block near the top of each module when updating the course:

```markdown
## Enterprise Module Brief

**Target roles:** AI engineers, platform engineers, product engineers, security/risk reviewers

**Prerequisites:** List required prior modules, tools, accounts, hardware, and data access.

**Learning objectives:**
1. Objective tied to an observable learner behavior.
2. Objective tied to a practical system decision.
3. Objective tied to an enterprise control or review artifact.

**Enterprise scenario:** One realistic business use case used throughout the module.

**Required artifact:** The file, notebook, report, architecture diagram, eval output, or review packet learners must submit.

**Readiness gate:** The pass/fail standard for moving to the next module.
```

---

## Module Assessment Matrix

| Module | Required artifact | Readiness gate |
|--------|-------------------|----------------|
| 01 Foundations | Model-selection note | Correctly compares at least 3 model options by cost, latency, context, privacy, and deployment constraint |
| 02 Datasets & Training | Data card and dataset sample | Documents source, license, sensitivity, PII handling, split strategy, quality checks, and approval status |
| 03 Fine-Tuning | Experiment report | Compares base vs tuned model on locked eval set and identifies regressions, cost, and rollback plan |
| 04 Inference & Optimization | Capacity estimate | Includes latency budget, concurrency target, model size, batch strategy, and failure mode |
| 05 Local AI Ecosystem | Toolchain decision record | Names owner, support model, security review, artifact provenance, and operational risks |
| 06 RAG & Memory | RAG architecture and eval results | Enforces document access controls before generation and reports retrieval/citation quality |
| 07 Agents & Workflows | Agent control plan | Defines tool allowlist, scoped credentials, human approvals, transaction logs, and rollback/undo behavior |
| 08 Model Types | Model fit assessment | Maps task types to model families and explains quality, cost, privacy, and deployment tradeoffs |
| 09 Deployment | Deployment readiness review | Covers identity, RBAC, secrets, network controls, audit logs, SLOs, monitoring, incident response, and rollback |
| 10 Evaluation | Release gate report | Shows baseline, pass/fail thresholds, safety/privacy tests, cost, latency, and approval decision |
| 11 Real-World Skills | Capstone implementation packet | Demonstrates end-to-end product workflow with evals, governance, observability, and demo |
| 12 Governance & Operations | AI system readiness packet | Provides risk classification, data review, model inventory, vendor review, controls, and operating cadence |

---

## Quiz And Checkpoint Pattern

Each module should include a short checkpoint before the lab:

1. **Concept check:** 5-8 questions that test core terms and tradeoffs.
2. **Decision check:** 2 scenario questions asking what approach to choose and why.
3. **Risk check:** 2 questions asking what can fail in production and what control mitigates it.
4. **Evidence check:** Ask what artifact proves the learner's answer is not just an opinion.

Example:

```markdown
### Readiness Check

1. What is the difference between context window and memory?
2. When should you prefer RAG over fine-tuning?
3. What access-control failure can happen in a vector database?
4. What metric would prove retrieval quality improved?
5. What evidence would you show a security reviewer before release?
```

---

## Lab Artifact Standard

Every lab should tell learners exactly what to submit:

- `README.md` explaining the use case, assumptions, and setup.
- Source code or notebook that can be run by another learner.
- `eval_results.json` or equivalent metrics output.
- Screenshots or logs only when they add evidence.
- Risk notes: known limitations, failure cases, safety controls, and rollback.
- Cost notes: expected token/GPU/API costs and scaling assumptions.

---

## Sample Passing Artifact Packet

Use this as the minimum shape for a passing capstone or module submission.

```text
compliance-capstone/
  README.md
  architecture.md
  data-card.md
  model-inventory.md
  eval/
    eval_cases.jsonl
    eval_results.json
    failure_analysis.md
  src/
    process_document.py
    telemetry.py
    approval_workflow.py
  governance/
    release-gate.md
    risk-register.md
    incident-runbook.md
    change-record.md
```

Example `release-gate.md`:

```markdown
# Release Gate

**Use case:** Compliance obligation extraction for internal analyst review
**Risk tier:** Tier 3 - Business Critical
**Baseline:** Single prompt with no retrieval or structured eval
**Candidate:** RAG-grounded workflow with structured JSON output

| Gate | Threshold | Result | Decision |
|------|-----------|--------|----------|
| Domain quality | >= 85% pass rate | 88% | Pass |
| Critical hallucinations | 0 | 0 | Pass |
| Prompt injection | Blocks 8/8 test cases | 8/8 | Pass |
| Privacy leakage | 0 PII/secrets in logs | 0 | Pass |
| Latency | P95 < 8s | 6.4s | Pass |
| Cost | < $0.15/document | $0.07 | Pass |

**Decision:** Approve with conditions.

**Conditions:**
- Limit rollout to compliance analysts for 30 days.
- Require human approval before recommended actions become tickets.
- Review failures weekly and update eval set before broader release.
```

Example `data-card.md`:

```markdown
# Data Card

**Data set:** Synthetic DORA/GDPR/PSD2 compliance excerpts
**Owner:** Compliance training facilitator
**Source:** Public regulation excerpts and synthetic scenarios
**Usage rights:** Training, RAG, evaluation
**Sensitivity:** Internal training data, no real customer data
**PII:** None expected; automated scan required before use
**Retention:** Keep for course duration plus 90 days
**Deletion:** Remove local indexes, uploaded files, logs, and derived eval artifacts
**Approval:** Training owner and security reviewer
```

---

## Rubric

Score each lab out of 20.

| Category | Points | Standard |
|----------|--------|----------|
| Technical correctness | 5 | The implementation works and uses the right technique for the task |
| Measurement | 4 | Includes baseline, metrics, thresholds, and repeatable eval evidence |
| Enterprise controls | 4 | Addresses data handling, access, logging, human oversight, and security controls appropriate to the module |
| Operational readiness | 3 | Includes monitoring, failure modes, rollback, and ownership where relevant |
| Communication | 2 | Clear artifact structure, assumptions, and decision rationale |
| Reproducibility | 2 | Setup, dependencies, and expected outputs are documented |

Pass threshold:

- **16-20:** Enterprise-ready for the module scope.
- **12-15:** Acceptable for learning, but needs remediation before capstone.
- **0-11:** Not ready; redo the lab with facilitator feedback.

---

## Capstone Scoring

Score the final capstone out of 100.

| Category | Points | Standard |
|----------|--------|----------|
| Use-case framing | 10 | Clear user, business value, risk level, non-goals, and success criteria |
| Architecture | 15 | Appropriate use of prompting/RAG/fine-tuning/agents, clear data flow, access boundaries, and deployment target |
| Implementation | 15 | Working workflow with structured outputs, error handling, and documented assumptions |
| Evaluation | 15 | Baseline, test set, quality metrics, safety/privacy tests, failure analysis, and release thresholds |
| Governance | 15 | Data review, risk classification, human oversight, model/vendor inventory, approval checklist |
| Security and privacy | 10 | Identity, RBAC/ABAC, secrets, logging redaction, tenant isolation or document ACLs where applicable |
| Operations | 10 | Monitoring, SLOs, incident response, rollback, ownership, and change-management plan |
| Demo and communication | 10 | Clear demo script, decision record, and executive summary |

Capstone standard:

- **85-100:** Enterprise-ready training completion.
- **70-84:** Strong prototype, not yet release-ready.
- **Below 70:** Needs remediation before certification.

---

## Facilitator Checklist

Before the cohort starts:

- Confirm API keys, local model options, GPU access, and fallback paths.
- Provide a sample non-sensitive document set.
- Define allowed data types and banned data types for labs.
- Set a shared cost budget and usage monitoring.
- Prepare answer keys and sample passing artifacts.

During the cohort:

- Review evaluation design before learners optimize systems.
- Require learners to document failure cases, not hide them.
- Keep security/privacy review lightweight but explicit.
- Run at least one peer review before final capstone.

At completion:

- Confirm every learner has submitted the capstone implementation packet.
- Review whether release thresholds are evidence-based.
- Capture common gaps as updates to the curriculum.

---

## Exemplar Answer Keys

These are compact answer keys facilitators can use for calibration. They are intentionally short; a passing learner artifact should be more detailed.

### Module 02 Dataset Lab

Passing answer should include:

- Valid JSONL with `instruction` and `output`.
- Data card states public/synthetic source, approved internal training use, no real PII, deletion path, and owner.
- Train/validation/test split exists before any fine-tuning.
- Quality report flags weak synthetic examples instead of claiming everything is perfect.
- At least one example is rejected for being vague, hallucinated, too short, or poorly formatted.

Failing answer examples:

- Uses scraped or customer data with no source/rights.
- Has no locked test split.
- Does not inspect examples manually.
- Stores PII in the dataset or logs.

### Module 06 RAG Lab

Passing answer should include:

- Chunk metadata includes tenant, classification, groups, source status, and source ID.
- Unauthorized query cannot retrieve restricted chunks.
- Expected source appears in top 3 for most eval questions.
- Answers cite approved retrieved sources.
- Prompt-injection document is retrieved but not obeyed.
- Deleted document is not retrievable after index update.

Failing answer examples:

- Applies access control after generation instead of before retrieval.
- Logs full sensitive documents.
- Claims citation quality without checking cited source IDs.

### Module 07 Agent Lab

Passing answer should include:

- Tool allowlist and approval rules.
- Scoped credentials for each tool.
- Tool-call log sample with request ID, tool, argument hash, result, and decision.
- At least 5 failure tests.
- High-risk write/send/update actions stop for human approval.

Failing answer examples:

- Lets the model call arbitrary tools.
- Gives a broad credential to every tool.
- Has no rollback or escalation for bad actions.

### Module 09 Deployment Lab

Passing answer should include:

- Benchmark compares at least two models.
- SLOs define latency, availability, error-rate, and cost targets.
- Readiness review covers identity, authorization, secrets, logging, audit, fallback, rollback, and owner.
- Incident assumptions name alert triggers and first responder.

Failing answer examples:

- Only reports tokens/sec with no operational decision.
- Uses API keys as the only identity story.
- Has no degraded mode when the model is unavailable.

### Module 10 Evaluation Lab

Passing answer should include:

- Domain, safety, privacy, and prompt-injection cases.
- Baseline comparison.
- Severity assigned to every failed case.
- Thresholds written before the final decision.
- Release decision is explicit and tied to evidence.

Failing answer examples:

- Uses only three keyword checks.
- Changes thresholds after seeing results.
- Has no safety/privacy cases.
- Says "model looks good" without approval criteria.

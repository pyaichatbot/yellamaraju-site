# Module 12 - Enterprise Governance & Operations

> Building an LLM system is engineering. Getting it approved, monitored, and trusted is governance.

---

## Enterprise Module Brief

**Target roles:** AI engineers, platform engineers, product owners, security reviewers, privacy/legal partners, risk owners, operations leads.

**Prerequisites:** Modules 01, 06, 07, 09, and 10. Learners should understand model selection, RAG, agents, deployment, and evaluation.

**Learning objectives:**
1. Classify an AI use case by risk, data sensitivity, user impact, and autonomy.
2. Design governance gates for data, model, vendor, evaluation, release, and operations.
3. Build a readiness packet that security, privacy, legal, risk, and engineering can review.
4. Define monitoring, incident response, rollback, and change-management practices for LLM systems.

**Enterprise scenario:** A compliance automation assistant that ingests regulatory documents, retrieves relevant obligations, drafts risk summaries, and recommends actions to human reviewers.

**Required artifact:** AI system readiness packet.

**Readiness gate:** The packet must include risk classification, data review, model/vendor review, evaluation thresholds, security controls, human oversight, monitoring, incident response, and rollback.

---

# 01 - AI Risk Classification

## Why Risk Classification Comes First

Before choosing a model or writing code, classify the use case. The same technical pattern can be low risk in one context and high risk in another.

Example:

| Use case | Risk level | Why |
|----------|------------|-----|
| Summarize public blog posts | Low | Public data, low user impact |
| Draft internal policy summaries | Medium | Internal data, business impact if wrong |
| Recommend compliance actions | High | Regulated decision support, legal and operational consequences |
| Automatically deny a customer claim | Very high | Direct impact on rights, finances, or access to services |

## Risk Classification Checklist

| Question | Low-risk answer | Higher-risk answer |
|----------|-----------------|--------------------|
| What data is processed? | Public or synthetic | PII, confidential, regulated, privileged |
| Who uses the output? | Internal learner | Customer, regulator, executive, production workflow |
| What action follows the output? | Informational only | Approval, denial, payment, legal, medical, financial, security action |
| Can humans override it? | Yes, required | No, hidden, or impractical |
| How visible is failure? | Easy to detect | Silent or delayed harm |
| Does it affect protected groups? | No | Possibly or directly |
| Is it externally exposed? | No | Public API, customer app, third-party integration |

## Risk Tiers

| Tier | Description | Required controls |
|------|-------------|-------------------|
| Tier 1 - Experimental | Lab or sandbox only | No sensitive data, no production users, cost limit |
| Tier 2 - Internal Assistive | Helps employees, no autonomous decisions | Data classification, logging policy, eval baseline, human review |
| Tier 3 - Business Critical | Influences operations or regulated work | Formal risk review, access control, audit logs, release gates, monitoring |
| Tier 4 - High Impact | Affects rights, finances, safety, employment, credit, healthcare, or legal outcomes | Executive risk owner, legal/privacy review, strong human oversight, incident process, periodic audit |

## Framework Mapping

Use this mapping to connect course artifacts to common enterprise review language. This is not legal advice; it is a practical translation layer for engineering training.

| Course artifact | NIST AI RMF alignment | ISO/IEC 42001 alignment | EU AI Act-style concern |
|-----------------|----------------------|--------------------------|-------------------------|
| Risk classification | Govern, Map | AI management planning and risk process | Determine risk category and obligations |
| Data card | Map, Manage | Data management and impact assessment | Data governance, quality, relevance, bias controls |
| Model inventory | Govern | Asset and supplier governance | Technical documentation and provider/deployer accountability |
| Evaluation release gate | Measure, Manage | Performance evaluation and operational controls | Accuracy, robustness, cybersecurity, human oversight evidence |
| Human oversight plan | Manage | Roles, responsibilities, operational control | Oversight, override, and automation-bias mitigation |
| Incident runbook | Manage | Corrective action and continual improvement | Post-market monitoring and serious incident response |
| Change record | Govern, Manage | Change control and lifecycle management | Substantial modification and version traceability |

---

# 02 - Data Governance

## The Enterprise Data Rule

Do not put data into an LLM workflow until you know:

1. Where the data came from.
2. Who owns it.
3. Whether it contains PII, secrets, regulated, copyrighted, or privileged content.
4. Whether the intended use is allowed.
5. How long it is retained.
6. How it can be deleted.
7. Who can access it.
8. Whether it leaves an approved environment.

## Data Card Template

```markdown
# Data Card

**Dataset/document set name:**
**Owner:**
**Source:**
**License/usage rights:**
**Sensitivity:** Public / Internal / Confidential / Restricted
**PII present:** Yes / No / Unknown
**Regulated data:** None / GDPR / HIPAA / PCI / Financial / Other
**Allowed use:** Prompting / RAG / Evaluation / Fine-tuning / Logging
**Prohibited use:**
**Retention period:**
**Deletion process:**
**Access control model:**
**Approval owner:**
**Known quality issues:**
```

## RAG Data Controls

RAG systems need permission checks before retrieval, not only after generation.

Required controls:

- Store document owner, classification, source, version, and ACL metadata with every chunk.
- Filter candidate chunks by user, tenant, group, purpose, and data classification before prompt construction.
- Keep retrieval audit logs: user, query hash, document IDs, chunk IDs, timestamp, model, and decision.
- Support deletion and re-indexing when a source document is removed or access changes.
- Track source freshness and expire stale chunks.
- Test prompt injection from retrieved documents.

Example retrieval policy:

```python
def allowed_chunk(user, chunk):
    return (
        chunk["tenant_id"] == user.tenant_id
        and chunk["classification"] in user.allowed_classifications
        and bool(set(chunk["groups"]) & set(user.groups))
        and chunk["source_status"] == "approved"
    )
```

---

# 03 - Model And Vendor Governance

## Model Inventory

Every model used in production should have an inventory entry.

```markdown
# Model Inventory Entry

**Model name/version:**
**Provider or owner:**
**Open/closed/source license:**
**Hosting location:**
**Approved environments:**
**Approved use cases:**
**Disallowed use cases:**
**Data sent to provider:**
**Training-on-customer-data setting:**
**Retention setting:**
**Fallback model:**
**Evaluation baseline:**
**Known limitations:**
**Owner:**
**Review date:**
```

## Vendor Review Questions

- Does the provider train on submitted data?
- What are retention and deletion terms?
- Where is data processed and stored?
- Are enterprise controls available: SSO, audit logs, data residency, DPA, private networking?
- What availability/SLA commitments exist?
- How are model updates announced?
- Can you pin model versions?
- What happens during provider outage?

---

# 04 - Security Architecture

## Minimum Production Controls

| Control | Why it matters |
|---------|----------------|
| SSO/OIDC/SAML | Central identity and offboarding |
| RBAC or ABAC | Limits who can use sensitive workflows |
| Scoped service accounts | Prevents one compromised tool from accessing everything |
| Secrets manager | Keeps API keys out of code, logs, and notebooks |
| Private networking or egress controls | Prevents unexpected data movement |
| Encryption in transit and at rest | Protects prompts, documents, embeddings, logs, and outputs |
| Audit logs | Supports investigation and compliance evidence |
| Prompt/response redaction | Prevents telemetry from becoming a data leak |
| Rate limits and quotas | Controls abuse and spend |
| Artifact integrity | Verifies model/container/checkpoint provenance |

## Privacy-Safe Telemetry

Do not default to logging full prompts and responses. Prefer structured metadata.

Good telemetry:

```json
{
  "request_id": "req_123",
  "user_id_hash": "u_7f3a",
  "tenant_id": "tenant_a",
  "use_case": "compliance_summary",
  "model": "approved-model-v3",
  "input_tokens": 1840,
  "output_tokens": 420,
  "latency_ms": 3200,
  "retrieved_document_ids": ["doc_17", "doc_22"],
  "policy_decision": "allowed",
  "eval_version": "release-gate-2026-05",
  "error_code": null
}
```

Only capture prompt or response text when:

- The user or customer has approved it.
- Sensitive data is redacted.
- Access is restricted.
- Retention is short and documented.
- The capture supports debugging, audit, or quality improvement.

---

# 05 - Evaluation As Release Governance

## Evaluation Is A Gate

Enterprise evaluation decides whether the system can ship. It is not just a benchmark comparison.

Release gates should include:

- Baseline comparison against current process or base model.
- Domain-specific quality tests.
- Safety and refusal tests.
- Prompt-injection and jailbreak tests.
- Privacy leakage tests.
- Retrieval quality and citation tests for RAG.
- Tool-use authorization tests for agents.
- Bias/protected-class checks where relevant.
- Cost, latency, and throughput tests.
- Human review of high-severity failure cases.

## Release Gate Template

```markdown
# Release Gate Report

**Use case:**
**Version under review:**
**Baseline:**
**Eval dataset version:**
**Quality threshold:**
**Safety threshold:**
**Latency/cost threshold:**
**Results:**
**Known failures:**
**Residual risk:**
**Human oversight plan:**
**Decision:** Approve / Approve with conditions / Block
**Approvers:**
```

---

# 06 - Human Oversight

Human oversight is not "a person can look at it someday." It is a designed control.

Define:

- Which outputs require human review.
- Who is qualified to review them.
- What evidence the reviewer sees.
- How they approve, reject, override, or escalate.
- How disagreements are logged.
- When the AI system must stop or fall back.

High-risk outputs should include:

- Confidence or uncertainty signal.
- Source citations.
- Reason for escalation.
- Reviewer action.
- Audit trail.

---

# 07 - Monitoring And Incident Response

## What To Monitor

| Signal | Examples |
|--------|----------|
| Quality | eval pass rate, user correction rate, hallucination reports |
| Safety | refusal failures, jailbreak success, prompt injection alerts |
| Privacy | PII leakage, cross-tenant retrieval, secret exposure |
| Reliability | error rate, timeout rate, provider outage, fallback usage |
| Cost | tokens per request, spend per tenant, abnormal usage |
| Latency | time to first token, total response time, queue depth |
| Drift | new failure themes, changed source documents, model version changes |

## Incident Runbook

```markdown
# AI Incident Runbook

**Trigger:** What alert or report starts the incident?
**Severity:** Low / Medium / High / Critical
**Immediate action:** Disable feature / switch fallback / block tenant / freeze deployment
**Owner:** Incident commander and technical owner
**Evidence to collect:** request IDs, model version, prompt hash, retrieved docs, policy decision, logs
**Customer/user communication:** Who communicates and when?
**Root-cause analysis:** Model behavior / data issue / retrieval issue / tool issue / access control / provider outage
**Remediation:** Code fix, prompt fix, eval addition, policy update, data cleanup, provider change
**Post-incident review:** What control failed? What gate catches this next time?
```

---

# 08 - Change Management

Treat prompts, retrieval settings, eval datasets, models, and tool permissions as versioned production artifacts.

Changes that need review:

- Model version changes.
- Prompt/system instruction changes.
- Tool permission changes.
- New data sources.
- Embedding model changes.
- Chunking/retrieval changes.
- Eval threshold changes.
- Logging/retention changes.
- New user group or tenant rollout.

Minimum change record:

```markdown
# AI Change Record

**Change:**
**Reason:**
**Affected users/use cases:**
**Risk level:**
**Eval result before/after:**
**Security/privacy impact:**
**Rollback plan:**
**Approver:**
**Deployment date:**
```

---

## Module Exercise

**Build an AI system readiness packet for the compliance automation capstone.**

Your packet must include:

1. Use-case brief and risk tier.
2. Data card for all source documents and evaluation data.
3. Model inventory entry.
4. RAG or agent control plan, if used.
5. Release gate report with quality, safety, privacy, cost, and latency thresholds.
6. Security architecture checklist.
7. Human oversight plan.
8. Monitoring dashboard outline.
9. Incident runbook.
10. Change-management record for the first production release.

**Pass standard:** Another team should be able to review the packet and decide whether the system is approved, approved with conditions, or blocked.

---

## Summary

| Topic | Key takeaway |
|-------|--------------|
| Risk classification | Decide controls before implementation |
| Data governance | Know source, rights, sensitivity, retention, deletion, and access |
| Model governance | Track model versions, vendors, approved uses, and limitations |
| Security | Identity, access, secrets, network, audit logs, and telemetry controls are production basics |
| Evaluation | Release gates need safety, privacy, quality, cost, and latency evidence |
| Human oversight | Define who reviews what, when, and with what authority |
| Operations | Monitor failures, respond to incidents, and version AI changes |

---

## Mental Model

> Enterprise AI is a lifecycle, not a model call.
>
> Intake -> risk classify -> approve data -> choose model -> build -> evaluate -> release -> monitor -> respond -> review -> improve.

---

## Mistakes To Avoid

1. Shipping without a named risk owner.
2. Treating API keys as enterprise identity.
3. Logging raw prompts by default.
4. Running RAG without document-level permissions.
5. Letting agents use broad credentials.
6. Releasing model or prompt changes without eval regression tests.
7. Assuming human oversight exists because a human is somewhere in the process.
8. Having no rollback when the model, vendor, prompt, or retrieval system fails.

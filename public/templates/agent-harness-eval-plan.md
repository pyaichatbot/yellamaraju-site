# Agent Harness Eval Plan

Use this worksheet before releasing an AI agent that can call tools, modify state, or hand work to other systems.

## 1. Agent Scope

| Question | Answer |
|---|---|
| What job is the agent responsible for? |  |
| What jobs are explicitly out of scope? |  |
| Which tools can it call? |  |
| Which tools can change state? |  |
| When must it ask a human? |  |

## 2. Tool Boundaries

| Tool | Allowed Use | Not Allowed | Required Checks |
|---|---|---|---|
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

## 3. Eval Dataset

Start with 30 to 50 representative examples. Include normal work, ambiguous work, and hostile or risky inputs.

| Case Type | Count | Example Source |
|---|---|---|
| Happy path |  |  |
| Ambiguous request |  |  |
| Missing context |  |  |
| Tool failure |  |  |
| Unsafe or out-of-scope request |  |  |
| Recovery after mistake |  |  |

## 4. Pass Criteria

| Criterion | Passing Behavior |
|---|---|
| Task completion |  |
| Tool selection |  |
| State-changing action safety |  |
| Escalation judgment |  |
| Explanation quality |  |
| Cost and latency |  |

## 5. Failure Review

Do not only track total score. Sort failures by type.

| Failure Category | Examples | Likely Fix |
|---|---|---|
| Wrong tool |  | Tool descriptions or routing logic |
| Missing escalation |  | Policy, prompt, or harness guardrail |
| Bad recovery |  | State tracking or retry policy |
| Hallucinated action |  | Tool confirmation and output validation |
| Too expensive or slow |  | Model routing, caching, or narrower context |

## 6. Release Gate

| Gate | Threshold | Result |
|---|---|---|
| Critical failures | 0 allowed |  |
| Escalation accuracy | 95% or better |  |
| Tool-call success | 98% or better |  |
| Cost per task | Within budget |  |
| p95 latency | Within target |  |

## 7. Maintenance

| Trigger | Action |
|---|---|
| Model version changes | Rerun the regression set |
| Tool API changes | Add new tool-failure cases |
| User complaints increase | Sample failures and update evals |
| New workflow added | Create a new eval slice |

---

**Template Version:** 1.0  
**Last Updated:** 2026-05-03

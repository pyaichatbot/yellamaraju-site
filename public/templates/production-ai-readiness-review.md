# Production AI Readiness Review

Use this review before an AI feature reaches real users. The goal is not to slow the team down. The goal is to make the risks visible while there is still time to fix them.

## 1. System Summary

| Question | Answer |
|---|---|
| What user workflow does this AI system support? |  |
| Who owns the system after launch? |  |
| Which model, provider, and version are used? |  |
| What tools, APIs, or databases can the system access? |  |
| What is the fallback when the model fails? |  |

## 2. User Impact

| Risk | Notes |
|---|---|
| Can the system affect money, access, legal status, health, or safety? |  |
| Can a wrong answer harm a customer relationship? |  |
| Can the output be mistaken for official company policy? |  |
| Does a human review high-impact outputs before action? |  |

## 3. Evaluation Coverage

| Eval Area | Status | Evidence |
|---|---|---|
| Happy-path examples | Not started / Partial / Covered |  |
| Edge cases | Not started / Partial / Covered |  |
| Refusal and escalation cases | Not started / Partial / Covered |  |
| Regression set for future model changes | Not started / Partial / Covered |  |
| Human review rubric | Not started / Partial / Covered |  |

## 4. Failure Modes

List the top five ways this system can fail.

| Failure Mode | User Impact | Detection Signal | Mitigation |
|---|---|---|---|
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |
|  |  |  |  |

## 5. Observability

| Signal | Owner | Alert Threshold |
|---|---|---|
| Model error rate |  |  |
| Tool call failure rate |  |  |
| Escalation rate |  |  |
| User correction or complaint rate |  |  |
| Cost per workflow |  |  |
| Latency p95 |  |  |

## 6. Launch Decision

| Gate | Decision | Notes |
|---|---|---|
| Evals pass | Go / No-go |  |
| Fallback path tested | Go / No-go |  |
| Monitoring live | Go / No-go |  |
| Owner assigned | Go / No-go |  |
| Rollback plan ready | Go / No-go |  |

## 7. Review Notes

- What are we comfortable shipping?
- What still feels fragile?
- What will we measure in the first week?
- What would make us roll back?

---

**Template Version:** 1.0  
**Last Updated:** 2026-05-03

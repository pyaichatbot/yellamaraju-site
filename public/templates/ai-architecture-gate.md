# AI Architecture Gate – Decision Framework

**Use Case Name:** _________________________________

**Date:** _________________________________

**Submitted By:** _________________________________

**AI Architect/Platform Owner:** _________________________________

---

## Objective

The AI Architecture Gate ensures **only justified, feasible, and safe AI use cases** move into implementation.

This gate is **mandatory** before:
- Budget approval
- Model selection
- Vendor onboarding

---

## Gate 1: Problem Validation

**Every AI initiative MUST start with a problem statement WITHOUT mentioning AI.**

### Problem Statement (Non-AI Framing)

**Business Pain:**
_________________________________
_________________________________

**Current Workflow:**
_________________________________
_________________________________

**Who Owns the Problem:**
- Name: _________________________________
- Role: _________________________________
- Department: _________________________________

**Cost of Doing Nothing:**
- Time cost: _________________________________
- Money cost: _________________________________
- Error cost: _________________________________

### Success Metrics

**Measurable Success Metric:**
- Metric: _________________________________
- Baseline: _________________________________
- Target: _________________________________
- How measured: _________________________________

**Non-AI Solution Considered:**
- [ ] Rules/heuristics tested
- [ ] Manual process improvement considered
- [ ] Basic automation evaluated
- [ ] Other: _________________________________

**Why Non-AI Solutions Are Insufficient:**
_________________________________
_________________________________

### Gate 1 Decision

- [ ] ✅ **PASS** - Clear business owner, measurable success metric, non-AI solution considered
- [ ] ❌ **FAIL** - Missing required elements

**Notes:**
_________________________________

---

## Gate 2: AI Necessity

**Answer YES to at least 3 of the following for AI to be justified:**

- [ ] Problem is ambiguous or probabilistic
- [ ] Rules cannot fully capture logic
- [ ] Some error is acceptable
- [ ] Pattern exists in historical data
- [ ] Humans struggle to scale decisions

**Count:** _____ out of 5

### Justification

**Why rules are insufficient:**
_________________________________
_________________________________

**Why heuristics fail:**
_________________________________
_________________________________

**Why AI adds value:**
_________________________________
_________________________________

### Gate 2 Decision

- [ ] ✅ **PASS** - At least 3 criteria met, clear justification
- [ ] ❌ **FAIL** - Less than 3 criteria met, or insufficient justification

**If FAIL:** Use automation or rules instead of AI.

**Notes:**
_________________________________

---

## Gate 3: AI Level Approval

**Select the appropriate AI capability level:**

| Level | Description | Selected |
|-------|-------------|----------|
| **AI-Assisted** | Human decides, AI suggests | [ ] |
| **AI-Integrated** | AI embedded in workflow | [ ] |
| **AI-Driven** | AI makes primary decision | [ ] |
| **Agentic AI** | AI plans + executes steps | [ ] |

**Default Recommendation:** AI-Integrated

**Selected Level:** _________________________________

**Justification for Selected Level:**
_________________________________
_________________________________

### Agentic AI Requirements (If Level = Agentic AI)

Agentic AI requires additional safeguards:

- [ ] Human-in-the-loop (HITL) defined for critical decisions
- [ ] Comprehensive audit logging implemented
- [ ] Kill switch for emergency shutdown
- [ ] Extensive testing and validation plan
- [ ] Risk assessment completed
- [ ] Executive approval obtained

**HITL Implementation:**
_________________________________

**Audit Logging Plan:**
_________________________________

**Kill Switch Mechanism:**
_________________________________

### Gate 3 Decision

- [ ] ✅ **PASS** - Appropriate level selected, requirements met (if Agentic)
- [ ] ❌ **FAIL** - Level not justified, or Agentic requirements not met

**Notes:**
_________________________________

---

## Gate 4: Data & Compliance

### Data Readiness Check

**Data Source Identified:**
- Source: _________________________________
- Location: _________________________________
- Format: _________________________________

**Data Ownership:**
- Owner: _________________________________
- Contact: _________________________________
- Access granted: [ ] Yes [ ] Pending [ ] No

**Historical Depth:**
- Time period: _________________________________
- Volume: _____ records
- Update frequency: _________________________________

**Data Quality:**
- Completeness: _____% (target: >85%)
- Accuracy: _____% (target: >85%)
- Freshness: _____ (how recent?)

**Labels Available:**
- [ ] Yes, fully labeled
- [ ] Partial labels
- [ ] No labels (unsupervised learning)

### Compliance & Security

**GDPR / Regulatory Review:**
- [ ] Review completed
- [ ] Compliance officer: _________________________________
- [ ] Date: _________________________________
- [ ] Status: [ ] Approved [ ] Pending [ ] Issues

**Security Sign-Off:**
- [ ] Security review completed
- [ ] Security officer: _________________________________
- [ ] Date: _________________________________
- [ ] Status: [ ] Approved [ ] Pending [ ] Issues

**Privacy Considerations:**
- [ ] PII handling reviewed
- [ ] Data retention policy defined
- [ ] Access controls defined
- [ ] Encryption requirements met

**Regulatory Compliance:**
- [ ] Industry regulations reviewed (specify): _________________________________
- [ ] Data residency requirements met
- [ ] Audit trail requirements defined

### Gate 4 Decision

- [ ] ✅ **PASS** - Data source approved, compliance review done, security sign-off obtained
- [ ] ❌ **FAIL** - Data issues, compliance blockers, or security concerns

**Notes:**
_________________________________

---

## Gate 5: Risk Assessment

### Error Tolerance

**Error Tolerance Defined:**
- Acceptable error rate: _____%
- Critical errors: _____% (zero tolerance)
- Non-critical errors: _____% (acceptable)

**Impact of Errors:**
- Low impact: _________________________________
- Medium impact: _________________________________
- High impact: _________________________________

**Error Handling Strategy:**
_________________________________
_________________________________

### Fallback Strategy

**Fallback Plan Defined:**
- [ ] Manual process fallback
- [ ] Rule-based fallback
- [ ] Previous system fallback
- [ ] Other: _________________________________

**Fallback Trigger Conditions:**
_________________________________
_________________________________

**Fallback Activation Process:**
_________________________________
_________________________________

**Rollback Strategy:**
- [ ] Rollback plan documented
- [ ] Rollback tested
- [ ] Rollback timeline: _____ hours/days

### Monitoring & KPIs

**Monitoring KPIs Agreed:**
- KPI 1: _________________________________ = _____
- KPI 2: _________________________________ = _____
- KPI 3: _________________________________ = _____

**Monitoring Tools:**
- [ ] Observability platform selected
- [ ] Dashboards defined
- [ ] Alerting rules configured
- [ ] Team trained on monitoring

**Human-in-the-Loop (HITL) Defined:**
- [ ] HITL required: [ ] Yes [ ] No
- [ ] HITL trigger conditions: _________________________________
- [ ] HITL review process: _________________________________
- [ ] HITL team assigned: _________________________________

**Monitoring Frequency:**
- [ ] Real-time
- [ ] Hourly
- [ ] Daily
- [ ] Weekly

### Risk Assessment Summary

**Risk Level:**
- [ ] Low - Minimal impact if fails
- [ ] Medium - Moderate impact, manageable
- [ ] High - Significant impact, requires extra safeguards

**Risk Mitigation:**
_________________________________
_________________________________

### Gate 5 Decision

- [ ] ✅ **PASS** - Error tolerance defined, fallback strategy exists, monitoring KPIs agreed
- [ ] ❌ **FAIL** - Risk assessment incomplete or risks too high

**Notes:**
_________________________________

---

## Gate Summary

| Gate | Status | Notes |
|------|--------|-------|
| Gate 1: Problem Validation | ✅ / ❌ | |
| Gate 2: AI Necessity | ✅ / ❌ | |
| Gate 3: AI Level Approval | ✅ / ❌ | |
| Gate 4: Data & Compliance | ✅ / ❌ | |
| Gate 5: Risk Assessment | ✅ / ❌ | |

**Total Gates Passed:** _____ out of 5

---

## Final Decision

**Decision:**
- [ ] ✅ **APPROVED TO BUILD** - All gates passed, proceed to implementation
- [ ] 🔄 **REVISE & RESUBMIT** - Some gates need work, resubmit after addressing issues
- [ ] ❌ **REJECTED** - Non-AI solution recommended, or too many blockers

**Reasoning:**
_________________________________
_________________________________
_________________________________

**Recommended Next Steps:**
1. _________________________________
2. _________________________________
3. _________________________________

**If APPROVED:**
- Budget approval: [ ] Pending [ ] Approved
- Team assignment: [ ] Pending [ ] Assigned
- Timeline: Start date: _____ | Target completion: _____

**If REVISED:**
- Issues to address: _________________________________
- Resubmission deadline: _____
- Owner: _________________________________

**If REJECTED:**
- Alternative solution recommended: _________________________________
- Reason for rejection: _________________________________

---

## Mandatory Outputs (If Approved)

Every approved use case must submit:

- [ ] **AI Use Case One-Pager** - 1-page summary
- [ ] **Chosen AI Level** - Documented in Gate 3
- [ ] **30-Day Pilot Plan** - Initial validation plan

**One-Pager Summary:**
- Problem: _________________________________
- Solution: _________________________________
- Expected impact: _________________________________
- Timeline: _________________________________

**30-Day Pilot Plan:**
- Week 1: _________________________________
- Week 2: _________________________________
- Week 3: _________________________________
- Week 4: _________________________________
- Success criteria: _________________________________

---

## Stop Conditions

**Stop the initiative if ANY of the following occur:**

- [ ] Business value is unclear
- [ ] Data quality is insufficient
- [ ] Risk exceeds tolerance
- [ ] Compliance blockers cannot be resolved
- [ ] ROI becomes negative
- [ ] Team cannot operationalize

**If stopped, document reason:**
_________________________________
_________________________________

---

## Sign-Off

**Submitted By:**
- Name: _________________ Date: _______
- Role: _________________
- Signature: _________________

**AI Architect / Platform Owner:**
- Name: _________________ Date: _______
- Decision: [ ] Approved [ ] Revise [ ] Rejected
- Signature: _________________

**Business Owner:**
- Name: _________________ Date: _______
- Signature: _________________

**Security/Compliance:**
- Name: _________________ Date: _______
- Signature: _________________

**Finance (If budget >€100K):**
- Name: _________________ Date: _______
- Signature: _________________

---

## Internal Standard Reference

This gate implements the **AI Internal Standard** principles:

1. ✅ Problem First (Non-AI Framing) - Gate 1
2. ✅ AI Suitability Gate - Gate 2
3. ✅ AI Capability Level Selection - Gate 3
4. ✅ Data Readiness Check - Gate 4
5. ✅ Risk & Control - Gate 5
6. ✅ Mandatory Output - Documented above
7. ✅ Stop Conditions - Documented above

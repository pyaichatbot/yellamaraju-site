# AI Use Case Assessment Worksheet

**Use Case Name:** _________________________________

**Date:** _________________________________

**Assessor:** _________________________________

---

## Dimension 1: Desirability — Is the Problem Worth Solving?

### Problem Statement (Without Mentioning AI)

**What is the actual business problem?**
_________________________________
_________________________________
_________________________________

**Who owns this problem?**
_________________________________

**What's the current cost of this problem?**
- Time cost: _________________________________
- Money cost: _________________________________
- Error cost: _________________________________

**What's the cost of doing nothing?**
_________________________________

**What does "solved" look like?**
_________________________________

### Success Metrics

**Baseline Performance (Current State):**
- Metric 1: _________________________________ = _________________________________
- Metric 2: _________________________________ = _________________________________
- Metric 3: _________________________________ = _________________________________

**Target Performance (Success State):**
- Metric 1: _________________________________ = _________________________________
- Metric 2: _________________________________ = _________________________________
- Metric 3: _________________________________ = _________________________________

**How will we measure success?**
- [ ] Quantitative metric (specify): _________________________________
- [ ] Qualitative feedback (specify): _________________________________
- [ ] Business impact (specify): _________________________________

### Strategic Alignment

- [ ] Aligns with business priorities
- [ ] Executive sponsorship confirmed
- [ ] Users are engaged and supportive
- [ ] Clear business owner identified

### Desirability Score (1-10)

| Criterion | Score (1-10) | Notes |
|-----------|--------------|-------|
| Quantified Impact | ___ / 10 | |
| Strategic Alignment | ___ / 10 | |
| Success Metrics Clarity | ___ / 10 | |
| Business Owner Commitment | ___ / 10 | |
| **TOTAL** | **___ / 40** | |

**Desirability Decision:**
- ✅ **PASS** (Score ≥30): Problem is worth solving
- 🟡 **REVIEW** (Score 20-29): Needs refinement
- ❌ **FAIL** (Score <20): Not worth solving

---

## Dimension 2: Feasibility — Can We Technically Do This?

### Data Reality Check

**Do we HAVE the data we need?** (Not "can we collect it"—do we HAVE it?)
- [ ] Yes, data exists
- [ ] No, data doesn't exist
- [ ] Partial, some data exists

**Data Details:**
- Data source: _________________________________
- Data owner: _________________________________
- Historical depth: _________________________________
- Volume: _________________________________ records
- Update frequency: _________________________________

**Data Quality:**
- [ ] Labeled training data available
- [ ] Data completeness: _____% (target: >85%)
- [ ] Data accuracy: _____% (target: >85%)
- [ ] Data freshness: _____ (how recent?)
- [ ] Missing values: _____% (target: <15%)

**Data Access:**
- [ ] Legal/compliance approval obtained
- [ ] Privacy review completed
- [ ] Data owner has granted access
- [ ] Technical access is feasible

### Technical Fit

**Does this problem require AI, or would rules/heuristics work?**
- [ ] Problem is ambiguous/probabilistic → AI needed
- [ ] Rules can fully capture logic → No AI needed
- [ ] Some error is acceptable → AI suitable
- [ ] Pattern exists in historical data → AI suitable
- [ ] Humans struggle to scale decisions → AI suitable

**Simpler Solutions Tested:**
1. _________________________________ → Result: _________________________________
2. _________________________________ → Result: _________________________________
3. _________________________________ → Result: _________________________________

**Why simpler solutions are insufficient:**
_________________________________
_________________________________

**Technical Skills:**
- [ ] Team has required ML/AI skills
- [ ] Can acquire skills through training
- [ ] Need to hire external expertise
- [ ] Skills gap is a blocker

**Integration Feasibility:**
- [ ] Can integrate with existing systems
- [ ] No major technical blockers
- [ ] Infrastructure is ready
- [ ] API/access available

### Compliance & Governance

- [ ] GDPR/compliance review completed
- [ ] Security sign-off obtained
- [ ] Data residency requirements met
- [ ] Industry regulations considered
- [ ] Audit logging requirements defined

### Feasibility Score (1-10)

| Criterion | Score (1-10) | Notes |
|-----------|--------------|-------|
| Data Availability | ___ / 10 | |
| Data Quality | ___ / 10 | |
| Technical Skills | ___ / 10 | |
| Integration Feasibility | ___ / 10 | |
| Compliance Readiness | ___ / 10 | |
| **TOTAL** | **___ / 50** | |

**Feasibility Decision:**
- ✅ **PASS** (Score ≥40): Technically feasible
- 🟡 **REVIEW** (Score 30-39): Needs PoC to validate
- ❌ **FAIL** (Score <30): Not feasible right now

---

## Dimension 3: Viability — Can We Sustain This?

### ROI Calculation

**Annual Benefit (What will be saved/earned):**
- Benefit 1: _________________________________ = €_____ / year
- Benefit 2: _________________________________ = €_____ / year
- Benefit 3: _________________________________ = €_____ / year
- **Total Annual Benefit:** €_____ / year

**Implementation Cost (One-time):**
- Development: €_____
- Infrastructure setup: €_____
- Team training: €_____
- **Total Implementation Cost:** €_____

**Operating Cost (Ongoing, per year):**
- Infrastructure: €_____ / year
- Team (FTE): €_____ / year
- Maintenance: €_____ / year
- **Total Operating Cost:** €_____ / year

**Payback Period:**
- Year 1: €_____ (benefit) - €_____ (implementation) - €_____ (ops) = €_____
- Year 2: €_____ (benefit) - €_____ (ops) = €_____
- **Payback achieved in:** _____ months

**Risk-Adjusted Scenario (50% as good):**
- Annual benefit (50%): €_____ / year
- Payback period: _____ months
- Still positive? [ ] Yes [ ] No

### Team & Skills

- [ ] Team is assigned
- [ ] Team has required skills
- [ ] Training plan is defined
- [ ] Can maintain long-term
- [ ] Succession plan exists

### Change Management

- [ ] Users are engaged
- [ ] Process changes are defined
- [ ] Training plan for users
- [ ] Adoption strategy exists
- [ ] Organization is ready

### Viability Score (1-10)

| Criterion | Score (1-10) | Notes |
|-----------|--------------|-------|
| ROI Positive | ___ / 10 | |
| Payback Period | ___ / 10 | |
| Team Readiness | ___ / 10 | |
| Change Management | ___ / 10 | |
| **TOTAL** | **___ / 40** | |

**Viability Decision:**
- ✅ **PASS** (Score ≥30): Financially justified
- 🟡 **REVIEW** (Score 20-29): Needs refinement
- ❌ **FAIL** (Score <20): Not financially justified

---

## AI Level Selection

**Recommended AI Level:**
- [ ] Level 0: No AI needed (rules/heuristics)
- [ ] Level 1: Analytics/BI (statistical models)
- [ ] Level 2: AI-Supported (human decides, AI suggests)
- [ ] Level 3: AI-Integrated (AI decides, embedded in workflow)
- [ ] Level 4: Advanced ML (real-time, complex patterns)
- [ ] Level 5: Agentic AI (autonomous execution)

**Why this level?**
_________________________________
_________________________________

**Estimated Cost:** €_____

**Estimated Timeline:** _____ weeks/months

**Can we start simpler and upgrade later?**
- [ ] Yes, start at Level _____
- [ ] No, need this level from day one

---

## Overall Assessment

### Summary Scores

| Dimension | Score | Decision |
|----------|-------|----------|
| Desirability | ___ / 40 | ✅ / 🟡 / ❌ |
| Feasibility | ___ / 50 | ✅ / 🟡 / ❌ |
| Viability | ___ / 40 | ✅ / 🟡 / ❌ |
| **TOTAL** | **___ / 130** | |

### Final Recommendation

- [ ] ✅ **GO** - Proceed to build (all dimensions pass)
- [ ] 🟡 **POC** - Run 2-4 week proof-of-concept (uncertainty exists)
- [ ] 🔄 **PIVOT** - Change approach (simpler level, different solution)
- [ ] ❌ **STOP** - Not viable right now (come back in 6-12 months)

### Reasoning

_________________________________
_________________________________
_________________________________

### Next Steps

1. _________________________________
2. _________________________________
3. _________________________________

### Approved By

- Business Owner: _________________ Date: _______
- Technical Lead: _________________ Date: _______
- Finance Lead: _________________ Date: _______
- AI Architect: _________________ Date: _______

---

**Template Version:** 1.0  
**Last Updated:** January 2025


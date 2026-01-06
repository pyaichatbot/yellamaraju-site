# AI Use Case Decision Tree

**Visual Guide for Evaluating AI Use Cases**

---

## Quick Reference Decision Tree

```
START: AI Use Case Idea
    │
    ├─→ Is the problem REAL?
    │   │   (Quantified impact? Clear owner?)
    │   │
    │   ├─→ NO → STOP: No Problem
    │   │
    │   └─→ YES → Continue
    │
    ├─→ Does a SIMPLER solution work?
    │   │   (Rules? Heuristics? Manual process?)
    │   │
    │   ├─→ YES → Use Simpler Solution
    │   │         STOP AI Work
    │   │
    │   └─→ NO → Continue
    │
    ├─→ Is DATA available?
    │   │   (Quality >85%? Labeled? Accessible?)
    │   │
    │   ├─→ NO → STOP: Collect Data First
    │   │         (Come back in 6-12 months)
    │   │
    │   └─→ YES → Continue
    │
    ├─→ Is ROI POSITIVE?
    │   │   (Payback <18 months? Risk-adjusted?)
    │   │
    │   ├─→ NO → STOP: Not Financially Justified
    │   │
    │   └─→ YES → Continue
    │
    ├─→ Is AI LEVEL clear?
    │   │   (Start simple? Can upgrade later?)
    │   │
    │   ├─→ NO → POC: Validate Approach
    │   │         (2-4 weeks, €50K-100K)
    │   │         │
    │   │         └─→ POC Success?
    │   │             ├─→ YES → GO: Build
    │   │             └─→ NO → PIVOT or STOP
    │   │
    │   └─→ YES → GO: Build to Specified Level
    │
END: Decision Made
```

---

## Detailed Decision Points

### Decision Point 1: Problem Validation

**Question:** Is the problem REAL?

**Checklist:**
- [ ] Problem is clearly defined (not "we want AI")
- [ ] Quantified impact exists (cost, time, errors)
- [ ] Clear business owner identified
- [ ] Success metrics are defined
- [ ] Baseline performance is measured

**If NO:**
- ❌ **STOP**: No real problem
- Document why: _________________________________
- Revisit when problem is clearly defined

**If YES:**
- ✅ Continue to Decision Point 2

---

### Decision Point 2: Simpler Solution Test

**Question:** Does a SIMPLER solution work?

**Test These (In Order):**
1. **Rules/Heuristics:**
   - [ ] Can rules solve this?
   - [ ] What's the 80/20—can 20% of rules solve 80%?
   - Result: _________________________________

2. **Manual Process Improvement:**
   - [ ] Can we improve the current process?
   - [ ] What if we just add more people?
   - Result: _________________________________

3. **Basic Automation:**
   - [ ] Can we automate without AI?
   - [ ] Would RPA/workflow automation work?
   - Result: _________________________________

4. **Statistical Analysis:**
   - [ ] Would basic analytics/BI work?
   - [ ] Can regression/clustering solve this?
   - Result: _________________________________

**If ANY simpler solution works:**
- ✅ **USE IT**: Simpler solution
- ❌ **STOP AI work**: You've saved months and money
- Document: _________________________________

**If NO simpler solution works:**
- ✅ Continue to Decision Point 3

---

### Decision Point 3: Data Reality Check

**Question:** Is DATA available?

**Checklist:**
- [ ] Data EXISTS (not "can we collect it")
- [ ] Data is LABELED (for supervised learning)
- [ ] Data QUALITY >85% (completeness, accuracy)
- [ ] Data is ACCESSIBLE (legal, technical access)
- [ ] Data is FRESH (current, not outdated)
- [ ] Sufficient VOLUME (minimum records for ML)

**Data Details:**
- Source: _________________________________
- Volume: _____ records
- Quality: _____% completeness, _____% accuracy
- Labels: [ ] Yes [ ] No [ ] Partial
- Access: [ ] Approved [ ] Pending [ ] Blocked

**If NO:**
- ❌ **STOP**: Collect data first
- Action: _________________________________
- Timeline: Come back in 6-12 months
- Document: _________________________________

**If YES:**
- ✅ Continue to Decision Point 4

**If UNCLEAR:**
- 🟡 **POC**: Run 2-4 week PoC to validate data
- Continue to Decision Point 4 with PoC plan

---

### Decision Point 4: ROI Calculation

**Question:** Is ROI POSITIVE?

**Calculate:**

**Annual Benefit:**
- Benefit 1: €_____ / year
- Benefit 2: €_____ / year
- Benefit 3: €_____ / year
- **Total:** €_____ / year

**Implementation Cost:**
- Development: €_____
- Infrastructure: €_____
- Training: €_____
- **Total:** €_____

**Operating Cost (per year):**
- Infrastructure: €_____ / year
- Team: €_____ / year
- Maintenance: €_____ / year
- **Total:** €_____ / year

**Payback Period:**
- Year 1: €_____ (benefit) - €_____ (implementation) - €_____ (ops) = €_____
- Year 2: €_____ (benefit) - €_____ (ops) = €_____
- **Payback:** _____ months

**Risk-Adjusted (50% as good):**
- Annual benefit: €_____ / year
- Payback: _____ months
- Still positive? [ ] Yes [ ] No

**If NO:**
- ❌ **STOP**: Not financially justified
- Reason: _________________________________
- Alternative: Consider PoC to validate assumptions

**If YES:**
- ✅ Continue to Decision Point 5

---

### Decision Point 5: AI Level Selection

**Question:** Is AI LEVEL clear?

**Select Level (see AI Level Decision Matrix):**
- [ ] Level 0: No AI (rules/heuristics)
- [ ] Level 1: Analytics/BI
- [ ] Level 2: AI-Supported (default)
- [ ] Level 3: AI-Integrated
- [ ] Level 4: Advanced ML
- [ ] Level 5: Agentic AI

**Selected Level:** Level _____

**Why this level?**
_________________________________

**Can we start simpler and upgrade later?**
- [ ] Yes, start at Level _____
- [ ] No, need this level from day one

**If UNCLEAR:**
- 🟡 **POC**: Run 2-4 week PoC to validate approach
- Cost: €50K-100K
- Timeline: 4 weeks
- Success criteria: _________________________________

**If CLEAR:**
- ✅ **GO**: Build to specified level
- Proceed to implementation planning

---

## Decision Matrix Summary

| Problem? | Simpler Works? | Data Available? | ROI Positive? | AI Level Clear? | DECISION |
|----------|----------------|----------------|---------------|----------------|----------|
| ✅ YES | ❌ NO | ✅ YES | ✅ YES | ✅ YES | ✅ **GO** - Build |
| ✅ YES | ❌ NO | 🟡 UNCLEAR | ✅ YES | ✅ YES | 🟡 **POC** - Validate data |
| ✅ YES | ❌ NO | ✅ YES | ✅ YES | 🟡 UNCLEAR | 🟡 **POC** - Validate approach |
| ✅ YES | ❌ NO | ❌ NO | ✅ YES | - | ❌ **STOP** - Collect data |
| ✅ YES | ❌ NO | ✅ YES | ❌ NO | - | ❌ **STOP** - Not justified |
| ✅ YES | ✅ YES | - | - | - | ✅ **GO** - Use simpler |
| ❌ NO | - | - | - | - | ❌ **STOP** - No problem |

---

## Your Decision

**Use Case Name:** _________________________________

**Date:** _________________________________

**Decision Point Results:**

1. Problem Validation: [ ] ✅ Pass [ ] ❌ Fail
2. Simpler Solution Test: [ ] ✅ Pass [ ] ❌ Fail
3. Data Reality Check: [ ] ✅ Pass [ ] ❌ Fail [ ] 🟡 Unclear
4. ROI Calculation: [ ] ✅ Pass [ ] ❌ Fail
5. AI Level Selection: [ ] ✅ Clear [ ] 🟡 Unclear

**Final Decision:**
- [ ] ✅ **GO** - Proceed to build
- [ ] 🟡 **POC** - Run proof-of-concept
- [ ] 🔄 **PIVOT** - Change approach
- [ ] ❌ **STOP** - Not viable

**Reasoning:**
_________________________________
_________________________________

**Next Steps:**
1. _________________________________
2. _________________________________
3. _________________________________

**Approved By:**
- Business Owner: _________________ Date: _______
- Technical Lead: _________________ Date: _______
- Finance Lead: _________________ Date: _______
- AI Architect: _________________ Date: _______

---

## Key Principles

1. **Start with the problem, not the solution**
2. **Test simpler first** - Rules solve 80% of problems
3. **Check data early** - It's the biggest blocker
4. **Calculate real ROI** - Include all costs
5. **Start simple** - Level 2-3 for most use cases
6. **Use PoCs for uncertainty** - €50K to answer €5M question
7. **Embrace NO decisions** - They save time and money

---

**Template Version:** 1.0  
**Last Updated:** January 2025


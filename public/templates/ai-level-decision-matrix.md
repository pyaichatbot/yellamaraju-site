# AI Level Decision Matrix

**Use Case Name:** _________________________________

**Date:** _________________________________

---

## Understanding AI Levels

Use this matrix to select the appropriate AI level for your use case. **Start simple. Upgrade later if needed.**

---

## Level 0: This Doesn't Need AI

**What It Is:**
- Rule-based logic
- Simple automation
- Heuristics
- If-then-else statements

**Examples:**
- "If transaction amount > €5,000, flag for review"
- "Route ticket to team based on category"
- "Send email when status changes"
- "Calculate discount based on customer tier"

**When to Use:**
- ✅ Problem is deterministic (same input → same output)
- ✅ Rules can capture all cases
- ✅ No pattern recognition needed
- ✅ Logic is straightforward

**When NOT to Use:**
- ❌ Problem is probabilistic
- ❌ Patterns are complex
- ❌ Rules can't capture all cases

**Cost:** €5K-20K  
**Time:** 2 weeks  
**Complexity:** Low

**Decision Criteria:**
- [ ] Problem is deterministic
- [ ] Rules can solve 100% of cases
- [ ] No ML/AI expertise needed

**→ If all checked: Use Level 0. Stop here.**

---

## Level 1: Traditional Data Analytics / BI

**What It Is:**
- Statistical models
- Regression analysis
- Basic analytics
- Time series forecasting
- Clustering

**Examples:**
- Sales forecasting with linear regression
- Customer segmentation with k-means
- Trend analysis with time series
- A/B test analysis
- Correlation analysis

**When to Use:**
- ✅ Linear relationships in data
- ✅ Historical patterns predict future
- ✅ No real-time decisions needed
- ✅ Statistical analysis sufficient

**When NOT to Use:**
- ❌ Non-linear relationships
- ❌ Real-time decisions required
- ❌ Complex pattern recognition needed

**Cost:** €20K-50K  
**Time:** 3 weeks  
**Complexity:** Low-Medium

**Decision Criteria:**
- [ ] Linear relationships exist
- [ ] Historical data predicts future
- [ ] Statistical models sufficient
- [ ] No real-time requirements

**→ If all checked: Use Level 1.**

---

## Level 2: AI-Supported (Human Decision-Making Enhanced)

**What It Is:**
- AI suggests, human decides
- Human-in-the-loop (HITL)
- AI improves efficiency but doesn't replace humans
- Augmented intelligence

**Examples:**
- AI recommends products, human approves
- AI flags anomalies, human investigates
- AI generates content, human edits
- AI suggests code changes, developer reviews
- AI identifies at-risk customers, retention team decides offers

**When to Use:**
- ✅ Human judgment is critical
- ✅ AI improves efficiency but can't replace humans
- ✅ Error tolerance is low
- ✅ Decisions need human oversight

**When NOT to Use:**
- ❌ Decisions are routine and well-defined
- ❌ High volume requires full automation
- ❌ Human oversight is not feasible

**Cost:** €50K-150K  
**Time:** 4-6 weeks  
**Complexity:** Medium

**Decision Criteria:**
- [ ] Human judgment is essential
- [ ] AI supports but doesn't replace humans
- [ ] Error tolerance is low
- [ ] Decisions need human review

**→ If all checked: Use Level 2. (Default recommendation for most use cases)**

---

## Level 3: AI-Integrated (Automated Decision-Making in Workflow)

**What It Is:**
- AI makes decisions, embedded in business process
- Automated decision-making
- High automation rate (90%+)
- Human review only for edge cases

**Examples:**
- Automated fraud detection (approve/decline)
- Automated document classification
- Automated content moderation
- Automated ticket routing
- Automated code review (with human override)

**When to Use:**
- ✅ Decisions are routine and well-defined
- ✅ Error tolerance is acceptable
- ✅ High volume requires automation
- ✅ Human review only for exceptions

**When NOT to Use:**
- ❌ Decisions are complex and require judgment
- ❌ Error tolerance is very low
- ❌ Human oversight is required for all decisions

**Cost:** €150K-400K  
**Time:** 8-12 weeks  
**Complexity:** Medium-High

**Decision Criteria:**
- [ ] Decisions are routine
- [ ] Error tolerance is acceptable
- [ ] High volume requires automation
- [ ] Human review only for edge cases (5-10%)

**→ If all checked: Use Level 3.**

---

## Level 4: Advanced ML (Real-Time, Complex Patterns)

**What It Is:**
- Deep learning
- Ensemble models
- Real-time inference
- Complex pattern recognition
- Adaptive systems

**Examples:**
- Real-time fraud detection with ensemble models
- Computer vision for quality control
- Natural language understanding for complex queries
- Recommendation systems with deep learning
- Predictive maintenance with neural networks

**When to Use:**
- ✅ Patterns are complex and evolving
- ✅ Real-time decisions required
- ✅ Traditional ML insufficient
- ✅ Large-scale data available

**When NOT to Use:**
- ❌ Simple patterns can be captured with Level 2-3
- ❌ Real-time not required
- ❌ Limited data available
- ❌ Cost/complexity not justified

**Cost:** €400K-1M+  
**Time:** 12-24 weeks  
**Complexity:** High

**Decision Criteria:**
- [ ] Complex patterns that evolve over time
- [ ] Real-time inference required (<100ms latency)
- [ ] Traditional ML insufficient
- [ ] Large-scale labeled data available (100K+ records)
- [ ] ROI justifies complexity and cost

**→ If all checked: Use Level 4. (Requires strong justification)**

---

## Level 5: Agentic AI (Autonomous Task Execution)

**What It Is:**
- AI agents that plan, execute, and adapt autonomously
- Multi-agent systems
- Self-optimizing systems
- Autonomous decision-making with minimal human oversight

**Examples:**
- Multi-agent systems for complex workflows
- Autonomous research agents
- Self-optimizing trading systems
- Autonomous customer service agents
- Multi-agent orchestration for complex tasks

**When to Use:**
- ✅ Tasks require planning and multi-step execution
- ✅ System needs to adapt to new situations
- ✅ Human oversight acceptable but not required for each decision
- ✅ Complex workflows with multiple agents

**When NOT to Use:**
- ❌ Single-step decisions
- ❌ Human oversight required for all decisions
- ❌ Cost/complexity not justified
- ❌ Risk tolerance is low

**Cost:** €1M+  
**Time:** 6-24 months  
**Complexity:** Very High

**Requirements for Level 5:**
- [ ] Human-in-the-loop (HITL) for critical decisions
- [ ] Comprehensive audit logging
- [ ] Kill switch for emergency shutdown
- [ ] Extensive testing and validation
- [ ] Risk assessment completed
- [ ] Executive approval obtained

**Decision Criteria:**
- [ ] Multi-step planning and execution required
- [ ] System must adapt autonomously
- [ ] Human oversight acceptable but not required per decision
- [ ] ROI justifies €1M+ investment
- [ ] All requirements above are met

**→ If all checked: Use Level 5. (Requires extensive justification and approval)**

---

## Decision Flow

**Start Here:**

1. **Is the problem deterministic?** (Same input → same output)
   - YES → **Level 0** (No AI needed)
   - NO → Continue

2. **Are linear relationships sufficient?** (Statistical models work)
   - YES → **Level 1** (Analytics/BI)
   - NO → Continue

3. **Is human judgment critical?** (AI supports, doesn't replace)
   - YES → **Level 2** (AI-Supported) ← **Default recommendation**
   - NO → Continue

4. **Are decisions routine and well-defined?** (High automation acceptable)
   - YES → **Level 3** (AI-Integrated)
   - NO → Continue

5. **Are patterns complex and evolving?** (Real-time, deep learning needed)
   - YES → **Level 4** (Advanced ML)
   - NO → Continue

6. **Does it require autonomous planning and execution?** (Multi-agent systems)
   - YES → **Level 5** (Agentic AI)
   - NO → Re-evaluate

---

## Your Use Case Assessment

**Problem Description:**
_________________________________
_________________________________

**Selected Level:** Level _____ (0 / 1 / 2 / 3 / 4 / 5)

**Why this level?**
_________________________________
_________________________________

**Estimated Cost:** €_____

**Estimated Timeline:** _____ weeks/months

**Can we start simpler and upgrade later?**
- [ ] Yes, start at Level _____
- [ ] No, need this level from day one

**Justification:**
_________________________________
_________________________________

---

## Key Principles

1. **Start Simple** - Most problems don't need Level 4 or 5
2. **Upgrade Later** - You can always increase complexity if needed
3. **Match Complexity** - Don't over-engineer
4. **Default to Level 2-3** - AI-Supported or AI-Integrated for most use cases
5. **Justify Higher Levels** - Level 4-5 require strong justification and ROI

---

## Approval

**Recommended by:** _________________ Date: _______

**Approved by:** _________________ Date: _______

**AI Architect:** _________________ Date: _______

# Ralph Pre-Launch Checklist

Use this checklist before every Ralph run to ensure success and prevent costly mistakes.

---

## 1. Environment Setup

### System Requirements
- [ ] Claude Code installed (version >= 1.0)
- [ ] Ralph plugin installed: `/plugin install ralph-wiggum@claude-plugins-official`
- [ ] Git repository initialized with proper `.gitignore`
- [ ] All dependencies installed (`npm install` or equivalent)
- [ ] API authentication working (test with simple Claude Code command)

### Cost Controls
- [ ] API spending alerts configured on dashboard
- [ ] Budget approved for this task: $__________
- [ ] Alert threshold set at 80% of budget
- [ ] Hard stop configured at 100% of budget
- [ ] Cost calculator estimates reviewed: $__________

### Safety Nets
- [ ] Working on feature branch (NOT main/master)
  - Branch name: `ralph/_______________`
- [ ] Backup or snapshot taken (especially if using --dangerously-skip-permissions)
- [ ] Using sandboxed environment if running with elevated permissions
- [ ] Team notified if running overnight or long sessions

---

## 2. Task Definition Quality

### Task Overview
- [ ] Task has a clear one-sentence goal
- [ ] Category identified (Migration/Testing/Documentation/Refactoring/Other)
- [ ] Estimated iterations calculated (conservative estimate)
- [ ] Priority level set (High/Medium/Low)

### Success Criteria Review
- [ ] Success criteria are measurable (not subjective)
- [ ] All criteria can be automatically verified
- [ ] Number of criteria is appropriate (3-7 recommended)
- [ ] Criteria cover: Functionality, Quality, Standards, Performance, Documentation

### Measurability Check
For each success criterion, ask: "Can this be verified by a script?"

1. Criterion: ________________________________
   - [ ] Measurable automatically

2. Criterion: ________________________________
   - [ ] Measurable automatically

3. Criterion: ________________________________
   - [ ] Measurable automatically

4. Criterion: ________________________________
   - [ ] Measurable automatically

5. Criterion: ________________________________
   - [ ] Measurable automatically

---

## 3. Verification System

### Automated Tests
- [ ] Unit tests exist and currently pass
- [ ] Integration tests exist (if applicable)
- [ ] Test coverage baseline documented: ____%
- [ ] Target coverage defined: ____%
- [ ] Tests are deterministic (no flaky tests)

### Quality Checks
- [ ] Linting configured and passing
- [ ] Type checking enabled (TypeScript/Flow if applicable)
- [ ] Build process working and tested
- [ ] Security scanning available (`npm audit` or equivalent)
- [ ] Performance benchmarks defined (if applicable)

### Verification Commands Tested
Run these commands manually to ensure they work:

```bash
# Test suite
npm run test
# Status: [ ] Pass [ ] Fail

# Linting
npm run lint
# Status: [ ] Pass [ ] Fail

# Type checking
npm run typecheck
# Status: [ ] Pass [ ] Fail

# Build
npm run build
# Status: [ ] Pass [ ] Fail

# All verification
npm run verify:all
# Status: [ ] Pass [ ] Fail
```

### Baseline Green
- [ ] All verification commands pass BEFORE starting Ralph
- [ ] Current codebase is in working state
- [ ] No existing broken tests or build failures
- [ ] Git status is clean or only expected changes present

---

## 4. Task Configuration

### Completion Promise Review
- [ ] Completion promise is unambiguous
- [ ] Promise includes verification results
- [ ] Promise is in correct XML format: `<promise>...</promise>`
- [ ] Promise text is unique (won't appear accidentally in code)

Example format:
```xml
<promise>
TASK_COMPLETE:
- Tests: X/X pass
- Lint: Clean
- Build: Success
VERIFIED
</promise>
```

### Iteration Limits
- [ ] Max iterations set appropriately:
  - [ ] 5-10 for simple tasks
  - [ ] 15-25 for medium tasks
  - [ ] 30-50 for complex tasks
  - [ ] 50+ only for proven patterns
- [ ] Timeout per iteration: 5 minutes (default)
- [ ] Total time limit considered: _____ hours

### Scope Definition
- [ ] Files to focus on clearly listed
- [ ] Files to AVOID clearly listed (especially: configs, .env, secrets)
- [ ] Dependencies documented
- [ ] Known constraints identified
- [ ] Common pitfalls documented

---

## 5. Context & Constraints

### Files & Directories

**Focus areas:**
```
List specific files or patterns Ralph should work on:
- 
- 
- 
```

**Off-limits:**
```
List files/directories Ralph must NOT modify:
- .env*
- *.config.js
- secrets/
- 
```

### Dependencies
- [ ] All required dependencies installed
- [ ] Version requirements documented
- [ ] No conflicting dependencies

### Constraints
- [ ] Backward compatibility requirements defined
- [ ] Performance requirements specified
- [ ] Security requirements clear
- [ ] Platform/runtime constraints noted

---

## 6. Risk Assessment

### Task Complexity
- [ ] Complexity level assessed:
  - [ ] Low (well-understood, mechanical)
  - [ ] Medium (some unknowns, but clear path)
  - [ ] High (experimental, many unknowns)

### Risk Mitigation
- [ ] High-risk changes identified
- [ ] Rollback plan documented
- [ ] Manual intervention triggers defined
- [ ] Escalation path clear (who to contact if issues)

### Known Issues
- [ ] Common pitfalls for this type of task documented
- [ ] Previous failures analyzed and lessons applied
- [ ] Edge cases identified

---

## 7. Cost & ROI

### Cost Estimation

**Inputs:**
- Estimated context size per iteration: _______ tokens
- Estimated output per iteration: _______ tokens
- Max iterations: _______
- Model: [ ] Opus 4.5 [ ] Sonnet 4

**Calculation:**
```
Cost per iteration = 
  (context_tokens / 1M × $input_price) + 
  (output_tokens / 1M × $output_price)

Total estimated cost = cost_per_iteration × max_iterations
```

**Estimate:** $__________

### ROI Calculation

**Manual effort estimate:**
- Hours to complete manually: _______
- Hourly rate: $_______
- Manual cost: $_______

**Ralph cost:** $_______

**Expected ROI:** _______%

**Approval:**
- [ ] Cost estimate reviewed by: ________________
- [ ] ROI justified
- [ ] Budget approved

---

## 8. Monitoring & Logging

### Before Launch
- [ ] Logging enabled for iteration tracking
- [ ] Git commit messages will be descriptive
- [ ] Progress tracking file created (optional but recommended)
- [ ] Monitoring dashboard configured (if using community forks)

### During Execution
Plan to monitor:
- [ ] Iteration count vs. progress
- [ ] Cost accumulation vs. estimate
- [ ] Error patterns
- [ ] Git commit quality

---

## 9. Recovery Plan

### If Ralph Fails
1. **Stop command ready:** `/cancel-ralph`
2. **Review git history:** `git log --oneline --graph`
3. **Analyze failures:** `git show [commit-hash]`
4. **Rollback if needed:** `git reset --hard [safe-commit]`

### Manual Intervention Triggers
Stop Ralph if:
- [ ] No progress for 10+ iterations
- [ ] Same error repeating 5+ times
- [ ] Cost exceeds 90% of budget
- [ ] Unexpected files being modified
- [ ] Context pollution evident

### Escalation
- **Primary contact:** ________________
- **Backup contact:** ________________
- **Documentation:** ________________

---

## 10. Post-Completion Review Plan

### After Ralph Completes
- [ ] Human review checklist prepared
- [ ] Code review assignee identified: ________________
- [ ] Testing strategy documented
- [ ] Deployment plan ready
- [ ] Documentation update plan defined

### Review Focus Areas
- [ ] Code quality meets team standards
- [ ] No security vulnerabilities introduced
- [ ] Performance is acceptable
- [ ] Documentation is accurate
- [ ] All edge cases handled
- [ ] No unintended side effects

---

## 11. Final Pre-Flight

### Last Checks Before Launch
- [ ] Read through task definition one more time
- [ ] All checklist items above completed
- [ ] Peer review of task definition (recommended)
- [ ] Emergency stop procedure understood
- [ ] Confidence level: [ ] High [ ] Medium [ ] Low

### If Confidence is Low
Consider:
- [ ] Starting with smaller scope
- [ ] Reducing max iterations
- [ ] Getting peer review
- [ ] Running during work hours (not overnight)

---

## Launch Command

Once all checks pass, use this command:

```bash
/ralph-loop "$(cat TASK-DEFINITION.md)" \
  --max-iterations [NUMBER] \
  --completion-promise "[PROMISE-TEXT]"
```

Or for the official plugin:

```bash
/ralph-wiggum:ralph-loop "[TASK]" \
  --max-iterations [NUMBER] \
  --completion-promise "[PROMISE]"
```

---

## Post-Launch Monitoring

### First 30 Minutes
- [ ] Monitor first 3-5 iterations closely
- [ ] Verify Ralph is making progress
- [ ] Check cost accumulation rate
- [ ] Ensure no unexpected file changes

### If On Track
- [ ] Reduce monitoring frequency
- [ ] Check periodically (every 1-2 hours)
- [ ] Let Ralph work

### If Off Track
- [ ] Stop Ralph (`/cancel-ralph`)
- [ ] Review failures
- [ ] Adjust task definition
- [ ] Restart with refined approach

---

## Checklist Sign-Off

**Task:** ________________________________

**Prepared by:** ________________ **Date:** ________

**Reviewed by:** ________________ **Date:** ________ (recommended)

**Approved to launch:** [ ] Yes [ ] No

**Launch time:** ________ **Completed:** ________

**Actual cost:** $________ **Actual iterations:** ________

**Success:** [ ] Yes [ ] Partial [ ] No

**Lessons learned:**
- 
- 
- 

---

## Quick Reference

### Essential Commands
```bash
# Install plugin
/plugin install ralph-wiggum@claude-plugins-official

# Start Ralph
/ralph-loop "task" --max-iterations N

# Stop Ralph
/cancel-ralph

# Check status
/ralph-status

# Review progress
git log --oneline -20
```

### Common Pitfalls to Avoid
1. ❌ No iteration limit set
2. ❌ Vague success criteria
3. ❌ No automated verification
4. ❌ Working on main branch
5. ❌ No cost monitoring
6. ❌ Baseline not green
7. ❌ No rollback plan
8. ❌ Insufficient monitoring

### Success Indicators
✅ Clear, measurable goals
✅ Automated verification works
✅ Cost estimate reasonable
✅ Baseline passes all checks
✅ Branch protection in place
✅ Monitoring configured
✅ Team aware of run
✅ Recovery plan documented

---

**Remember:** Time spent on this checklist is investment in Ralph success. Rush it and pay the price in failed iterations and wasted API costs.

**The Ralph Way:** Better to fail predictably than succeed unpredictably.

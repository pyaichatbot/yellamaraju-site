# Task Definition Guide for Ralph Wiggum

## Overview

Writing effective task definitions is the #1 skill for successful Ralph implementation. This guide teaches you how to transform vague requirements into Ralph-ready specifications that converge to working solutions.

## The Golden Rule

**Clear goals + Automated verification = Successful Ralph loops**

If you can't measure success, Ralph can't achieve it.

## Task Definition Template

```markdown
# RALPH TASK DEFINITION

## Task Overview
**Goal:** [One sentence description]
**Category:** [Migration/Testing/Documentation/Refactoring/Other]
**Estimated Iterations:** [5-50]
**Estimated Cost:** $[Amount]
**Priority:** [High/Medium/Low]

## Pre-Flight Checklist
- [ ] Task is measurable (not subjective)
- [ ] Automated tests exist or will be created
- [ ] Git repository initialized with proper .gitignore
- [ ] Dependencies installed and working
- [ ] Baseline working (current code passes all checks)
- [ ] Cost estimate calculated and approved
- [ ] Max iterations set appropriately
- [ ] Team notified (if running overnight)
- [ ] Backup/snapshot taken

## Primary Objective

[2-3 paragraph detailed description of what needs to be accomplished]

## Success Criteria (Must ALL be true)

1. **Functional Requirements:**
   - [Specific feature or behavior]
   - [Specific feature or behavior]
   - [Specific feature or behavior]

2. **Quality Requirements:**
   - Test coverage >= [X]%
   - All existing tests pass
   - [New test requirements]

3. **Code Standards:**
   - Zero linting errors
   - TypeScript strict mode passes (if applicable)
   - Code complexity < [threshold]
   - No security vulnerabilities

4. **Performance Requirements:**
   - Build time < [X] seconds
   - Bundle size change < [X]%
   - No performance regressions

5. **Documentation Requirements:**
   - README updated
   - Inline documentation added
   - CHANGELOG entry created

## Verification Commands

These commands MUST ALL pass before task completion:

```bash
# Run these commands in order
npm run test              # All tests must pass
npm run lint              # Zero errors
npm run typecheck         # If TypeScript
npm run build             # Must succeed
npm run perf-check        # Performance validation (optional)
```

## Completion Promise

```xml
<promise>
RALPH_VERIFICATION_COMPLETE:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK: [Task name]
STATUS: COMPLETE

Verification Results:
✅ Tests: [X/X] passed
✅ Lint: Clean  
✅ TypeCheck: Passed
✅ Build: Success
✅ Coverage: [XX]%

All success criteria met.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TASK_COMPLETE
</promise>
```

## Configuration

### Iteration Limits
- **Conservative (new tasks):** --max-iterations 10
- **Moderate (tested patterns):** --max-iterations 25
- **Aggressive (known tasks):** --max-iterations 50
- **Marathon (complex tasks):** --max-iterations 100

### Timeout Settings
- **Max time:** [Hours] hours
- **Per iteration timeout:** 5 minutes

### Cost Controls
- **Budget:** $[Amount]
- **Alert at:** 80% of budget
- **Hard stop at:** 100% of budget

## Context for Ralph

### Files to Focus On
```
[List specific files or glob patterns]
src/components/**/*.tsx
src/utils/**/*.ts
```

### Files to Avoid
```
[List files that should NEVER be modified]
src/legacy/**/*
*.config.js
.env*
```

### Key Dependencies
- [Library name] v[version]
- [Library name] v[version]

### Known Constraints
- [Constraint 1: e.g., Must maintain backward compatibility]
- [Constraint 2: e.g., Cannot modify database schema]
- [Constraint 3: e.g., Must work with Node 18+]

### Common Pitfalls
- **Pitfall 1:** [Description and how to avoid]
- **Pitfall 2:** [Description and how to avoid]
- **Pitfall 3:** [Description and how to avoid]

## Expected Outcomes

### Deliverables
1. [Specific file or feature with acceptance criteria]
2. [Specific file or feature with acceptance criteria]
3. [Specific file or feature with acceptance criteria]

### Git History Should Show
- Clear, descriptive commit messages for each iteration
- Visible progress toward completion
- Failed attempts with error context included
- Final successful iteration

### Human Review Focus Areas
After Ralph completes, reviewers should focus on:
- [ ] Code quality meets team standards
- [ ] No security vulnerabilities introduced
- [ ] Performance is acceptable
- [ ] Documentation is accurate and complete
- [ ] Edge cases are handled properly

## Escape Hatches

### Automatic Stops
- Max iterations reached
- Cost limit exceeded
- Time limit exceeded
- Repeating same error 5+ times

### Manual Intervention Triggers
Stop and review if:
- No progress for 10+ iterations
- Same failure pattern repeating
- Context pollution evident
- Unexpected file modifications
- Cost escalating faster than expected

### Recovery Procedures
If Ralph fails or gets stuck:

1. **Review the git history:**
   ```bash
   git log --oneline --graph
   ```

2. **Analyze failure patterns:**
   ```bash
   git show [commit-hash]
   ```

3. **Update task definition:**
   - Add more specific criteria
   - Clarify ambiguous requirements
   - Provide examples of expected output

4. **Restart with refined prompt:**
   ```bash
   /ralph-loop "$(cat PROMPT-REFINED.md)" \
     --max-iterations [adjusted-number]
   ```

## Examples of Good vs Bad Task Definitions

### ❌ BAD: Vague and Unmeasurable

```markdown
Make the code better and faster.
Add some tests.
Update the docs.
```

**Why it fails:**
- "Better" is subjective
- "Faster" has no metric
- "Some tests" is not measurable
- No verification commands

### ✅ GOOD: Specific and Measurable

```markdown
Refactor authentication module for performance.

Success Criteria:
1. Reduce auth check latency from 150ms to <50ms
2. Test coverage >= 90% (currently 45%)
3. All 23 existing tests pass
4. Zero TypeScript errors
5. Lighthouse performance score >= 95

Verification:
npm run test && npm run typecheck && npm run perf-benchmark

Completion Promise: <promise>AUTH_REFACTOR_COMPLETE</promise>
```

**Why it succeeds:**
- Specific performance target (150ms → <50ms)
- Measurable coverage goal (90%)
- Clear test requirement (23 tests pass)
- Automated verification
- Unambiguous completion signal

## Task Complexity Guidelines

### Simple Tasks (5-10 iterations)
- Add types to single file
- Fix specific linting errors
- Update one dependency
- Generate basic documentation

### Medium Tasks (15-30 iterations)
- Migrate testing framework
- Refactor module architecture
- Expand test coverage
- Update multiple dependencies

### Complex Tasks (40-50+ iterations)
- Framework migration (e.g., React 16 → 19)
- Complete rewrite of subsystem
- Comprehensive security audit fixes
- Large-scale refactoring

## Quality Checklist

Before running Ralph, verify your task definition has:

- [ ] One clear primary objective
- [ ] 3-7 measurable success criteria
- [ ] Specific verification commands
- [ ] Unambiguous completion promise
- [ ] Appropriate iteration limit
- [ ] Cost estimate with approval
- [ ] List of files to focus on
- [ ] List of files to avoid
- [ ] Known pitfalls documented
- [ ] Recovery procedures defined
- [ ] Human review points identified

## Advanced Patterns

### Pattern 1: Incremental Expansion

Instead of one huge task, break into sequential tasks:

```bash
# Task 1: Foundation
/ralph-loop "Add types to core utilities" --max-iterations 10

# Task 2: Build on foundation  
/ralph-loop "Add types to services (using typed utilities)" --max-iterations 15

# Task 3: Complete
/ralph-loop "Add types to components (using typed services)" --max-iterations 20
```

### Pattern 2: Test-First Development

Define comprehensive tests, then let Ralph implement:

```markdown
Success Criteria:
1. All 47 test cases pass (tests already written)
2. Coverage >= 95%
3. No implementation in test files
```

### Pattern 3: Benchmark-Driven Optimization

Use measurable performance targets:

```markdown
Success Criteria:
1. Lighthouse score >= 95 (currently 78)
2. First Contentful Paint < 1.5s (currently 3.2s)
3. Bundle size < 250KB (currently 380KB)
4. All existing functionality works
```

## Troubleshooting Guide

### Issue: Ralph keeps failing on same thing

**Diagnosis:** Criteria too strict or dependencies missing

**Solution:**
1. Review error messages in git commits
2. Relax overly strict criteria
3. Add missing dependencies to task definition
4. Provide example of expected output

### Issue: Ralph completes but code is wrong

**Diagnosis:** Weak completion promise or no verification

**Solution:**
1. Strengthen verification commands
2. Add more specific success criteria
3. Make completion promise conditional on verification passing
4. Add automated quality checks

### Issue: Ralph wanders off-task

**Diagnosis:** Vague objective or missing constraints

**Solution:**
1. Narrow the scope
2. Be more specific about what NOT to change
3. Add explicit examples
4. List files to avoid

### Issue: Costs higher than expected

**Diagnosis:** Context window too large or inefficient prompting

**Solution:**
1. Reduce files in focus
2. Exclude unnecessary directories
3. Use more targeted prompts
4. Consider splitting into smaller tasks

## Templates Library

### Template: Dependency Update
```markdown
Goal: Update [dependency] from v[X] to v[Y]

Success Criteria:
- package.json shows [dependency]@[Y]
- All tests pass
- No deprecation warnings
- Build succeeds

Verification: npm run test && npm run build
Completion: <promise>DEPENDENCY_UPDATED</promise>
Max Iterations: 15
```

### Template: Test Coverage
```markdown
Goal: Increase coverage for [module] to [X]%

Success Criteria:
- Coverage >= [X]% (currently [Y]%)
- All new tests pass
- Existing tests unaffected
- No flaky tests

Verification: npm run test:coverage
Completion: <promise>COVERAGE_TARGET_MET</promise>
Max Iterations: 20
```

### Template: Documentation
```markdown
Goal: Generate comprehensive docs for [module]

Success Criteria:
- All public APIs documented
- Usage examples for top 5 functions
- README updated
- No broken links
- Markdown lint passes

Verification: npm run docs:validate
Completion: <promise>DOCS_COMPLETE</promise>
Max Iterations: 10
```

## Next Steps

1. **Start small:** Pick a simple, low-risk task
2. **Use template:** Fill in task definition template
3. **Review:** Have peer review your task definition
4. **Test:** Run with conservative iteration limit
5. **Iterate:** Refine based on results
6. **Scale:** Gradually increase complexity

Remember: The time you invest in writing a clear task definition is repaid 10x in reliable Ralph execution.

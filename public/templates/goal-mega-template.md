# Goal-Based Agent Work Template

Use this template when assigning a long-running task to Codex, Claude Code, or another autonomous coding agent. The goal is to create a bounded work contract: one outcome, explicit context, strict constraints, measurable success criteria, verification commands, stop rules, and final proof.

## Master Skeleton

```markdown
/goal [THE FINAL OUTCOME - state what done looks like in one clear line]

CONTEXT:
- Project: [Name and core description of what you are building]
- Stack: [Languages, frameworks, runtimes, infrastructure packages]
- Current State: [What code, schemas, docs, or stubs exist today]
- Working Dir: [Absolute path, repo scope, branch, worktree, or container boundary]
- Audience: [End user, stakeholder, internal team, or technical reviewer]

SCOPE:
- Allowed files/directories:
  - [Path or module]
  - [Path or module]
- Out of scope:
  - [Path, module, behavior, or system that must not change]
  - [Path, module, behavior, or system that must not change]

SUCCESS CRITERIA (ALL MUST BE TRUE):
1. [Specific, binary, measurable outcome A]
2. [Specific, binary, measurable outcome B]
3. [Specific, binary, measurable outcome C]
4. Final deliverable compiles, runs, or renders without errors.
5. Clear proof can be shown through test output, build output, screenshots, URLs, logs, or generated artifacts.

OPERATING RULES:
1. PLAN FIRST: Produce a numbered task list before modifying or creating code.
2. WORK AUTONOMOUSLY: Do not ask clarifying questions unless blocked by missing external infrastructure, credentials, or contradictory requirements.
3. SELF-VERIFY: After each meaningful checkpoint, run the relevant verification command or inspect the changed artifact.
4. DEBUG YOURSELF: If a compilation, runtime, lint, or test error occurs, diagnose and fix it before returning control.
5. USE AVAILABLE TOOLS: Use terminal execution, file search, browser checks, MCP tools, and code execution environments when they provide real evidence.
6. NO PLACEHOLDERS: Do not leave TODOs, partial stubs, fake data, mock fragments, or non-functional examples unless explicitly requested.
7. PROGRESS LOG: Keep a compact internal log of completed checkpoints, decisions made, blockers found, and verification results.
8. STAY ON GOAL: If unrelated issues are discovered, note them in the final report and continue the assigned task.
9. IF BLOCKED: State the exact blocker, preserve current work, and continue any parallelizable safe checks.
10. CHECK SUCCESS BEFORE STOPPING: Re-read every success criterion and verify each condition before finalizing.

QUALITY BAR:
- Code: Clean, typed where applicable, consistent with local conventions, and ready for review.
- Design: Minimal surface area, resilient failure handling, and no unnecessary abstractions.
- Security: No secret exposure, unsafe permission broadening, or unreviewed state-changing behavior.
- Docs: Document new environment variables, operational decisions, or new run commands.
- Output: Prepared to pass an adversarial senior-level code review.

VERIFY:
- [Command or check 1]
- [Command or check 2]
- [Command or check 3]
- Confirm git status only contains scoped, intentional changes.

STOP RULES:
- Stop if requirements conflict with existing architecture, schema, policy, or security boundaries.
- Stop if a required secret, account, paid service, or production credential is unavailable.
- Stop before changing public contracts, database schemas, authentication logic, billing logic, or deployment settings unless explicitly in scope.
- Stop if verification cannot be run and no equivalent proof can be produced.

FINAL DELIVERABLE EXPECTED:
- [ ] Confirmation that each success criterion is satisfied
- [ ] Files created, modified, or deleted
- [ ] How to run, test, preview, or deploy
- [ ] Verification proof with command names and results
- [ ] Engineering log: key decisions, known limitations, and follow-ups

Begin by outputting the initial plan. Then execute end-to-end until the goal is complete or genuinely blocked.
```

## Production Example: Stripe Webhook Ingestion

```markdown
/goal Implement Stripe webhook ingestion with signature verification and idempotency protection.

CONTEXT:
- Project: Core Billing Ingestion Pipeline
- Stack: Node.js, TypeScript, Express, Redis, Prisma ORM
- Current State: Stripe webhook route exists as an unauthenticated POST stub in src/routes/billing.ts
- Working Dir: /workspace/backend-service
- Audience: Internal ledger and financial compliance systems

SCOPE:
- Allowed files/directories:
  - src/routes/billing.ts
  - src/services/billing/**
  - src/routes/billing.test.ts
  - README.md
- Out of scope:
  - User authentication middleware
  - Payment provider account configuration
  - Prisma schema changes unless StripeEvent already exists

SUCCESS CRITERIA (ALL MUST BE TRUE):
1. Webhook signatures are verified with the official Stripe SDK and environment secrets.
2. Incoming event ids are processed through a Redis-backed idempotency layer.
3. Successfully parsed events are written to the Prisma StripeEvent table.
4. Tests cover valid event, duplicate event, invalid signature, and Redis unavailable behavior.
5. TypeScript compilation and the targeted billing test suite pass.

OPERATING RULES:
1. PLAN FIRST: Produce a numbered task list before modifying or creating code.
2. WORK AUTONOMOUSLY: Do not ask clarifying questions unless blocked by missing external infrastructure, credentials, or contradictory requirements.
3. SELF-VERIFY: After each meaningful checkpoint, run the relevant verification command or inspect the changed artifact.
4. DEBUG YOURSELF: If a compilation, runtime, lint, or test error occurs, diagnose and fix it before returning control.
5. USE AVAILABLE TOOLS: Use terminal execution, file search, browser checks, MCP tools, and code execution environments when they provide real evidence.
6. NO PLACEHOLDERS: Do not leave TODOs, partial stubs, fake data, mock fragments, or non-functional examples unless explicitly requested.
7. PROGRESS LOG: Keep a compact internal log of completed checkpoints, decisions made, blockers found, and verification results.
8. STAY ON GOAL: If unrelated issues are discovered, note them in the final report and continue the assigned task.
9. IF BLOCKED: State the exact blocker, preserve current work, and continue any parallelizable safe checks.
10. CHECK SUCCESS BEFORE STOPPING: Re-read every success criterion and verify each condition before finalizing.

QUALITY BAR:
- Code: Express routes must use explicit typed request interfaces.
- Design: Redis connectivity dropouts must fail safely without double-processing events.
- Security: Raw body handling must preserve Stripe signature verification correctness.
- Docs: Document new environment variables in README.md.
- Output: Prepared to pass an adversarial senior-level code review.

VERIFY:
- npm run test -- src/routes/billing.test.ts
- npx tsc --noEmit
- rg "TODO|placeholder|fake" src/routes/billing.ts src/services/billing README.md
- git status --short

STOP RULES:
- Stop if the Stripe SDK is unavailable and adding it requires dependency approval.
- Stop if Prisma does not contain a StripeEvent model.
- Stop before changing user profile schemas, authentication middleware, or payment provider account settings.

FINAL DELIVERABLE EXPECTED:
- [ ] Confirmation that each success criterion is satisfied
- [ ] Files created, modified, or deleted
- [ ] How to run, test, preview, or deploy
- [ ] Verification proof with command names and results
- [ ] Engineering log: key decisions, known limitations, and follow-ups

Begin by outputting the initial plan. Then execute end-to-end until the goal is complete or genuinely blocked.
```

## Quick Checklist

Before starting a goal, confirm:

| Question | Answer |
|---|---|
| Is there exactly one primary outcome? |  |
| Is the working directory or worktree isolated? |  |
| Are allowed and forbidden files listed? |  |
| Are success criteria binary and measurable? |  |
| Are verification commands available locally? |  |
| Are stop rules explicit for security, data, billing, and architecture risk? |  |
| Does the final report require proof, not just a summary? |  |

---

**Template Version:** 1.0  
**Last Updated:** 2026-05-16

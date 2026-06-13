Yes — based on the current Supermemory docs/repo, the right implementation is:

Repo → AI SDLC CLI Context Compiler → Supermemory
Repo + Supermemory recall → AI SDLC CLI Context Pack → Codex / Claude / Copilot

Supermemory should not replace your graphify-style context engine. It should become the persistent repo/team memory layer behind it.

1. What Supermemory gives you

Supermemory is a memory/context engine with ingestion, memory extraction, hybrid semantic search, file ingestion, graph-style memory relationships, and a full Memory API. The local self-hosted version runs as a single binary and exposes the same API as the hosted platform.  

Important capabilities for your AI SDLC CLI:

1. Documents → raw inputs you add
2. Memories → extracted knowledge units
3. Graph memory → updates / extends / derives relationships
4. Container tags → isolated memory namespaces
5. Metadata filters → repo/team/branch/classification-level filtering
6. Local self-hosting → localhost:6767
7. SDK/API compatibility → same API hosted or local

Supermemory separates documents from memories: documents are raw inputs, while memories are semantic knowledge units extracted and connected from those inputs.  

2. Key design decision

Your CLI should remain the context compiler.

Supermemory should be the memory substrate.

AI SDLC CLI owns:
- repo scanning
- graphify-style repo understanding
- AI SDLC policy/spec interpretation
- secret scanning
- classification
- context pack generation
- tool-specific output
Supermemory owns:
- persistent memory
- semantic recall
- graph-based memory evolution
- long-term repo/team knowledge

Do not let Codex/Claude/Copilot directly write to Supermemory in your enterprise design.

3. Target architecture

┌──────────────────────────────┐
│ Developer Repo                │
│ code/docs/ADR/tests/CI/CD     │
└───────────────┬──────────────┘
                ↓
┌──────────────────────────────┐
│ AI SDLC CLI                   │
│ Context Compiler              │
│ - scan repo                   │
│ - build graph                 │
│ - classify context            │
│ - apply AI SDLC spec          │
│ - sanitize                    │
└───────────────┬──────────────┘
                ↓
┌──────────────────────────────┐
│ Supermemory                   │
│ Persistent repo/team memory   │
└───────────────┬──────────────┘
                ↓
┌──────────────────────────────┐
│ AI SDLC CLI Context Pack      │
│ - CLAUDE.md                   │
│ - AGENTS.md                   │
│ - copilot-instructions.md     │
│ - codex context               │
└───────────────┬──────────────┘
                ↓
┌──────────────────────────────┐
│ Claude / Codex / Copilot      │
└──────────────────────────────┘

4. Hosting recommendation

For your case:

Phase 1: Personal POC
AI SDLC CLI → local Supermemory on laptop
Phase 2: Team POC
AI SDLC CLI → shared internal Supermemory VM
Phase 3: Enterprise
AI SDLC CLI → governed Supermemory deployment / enterprise platform

Self-hosted Supermemory runs on your own hardware, uses local embeddings, and stores data under ./.supermemory or $SUPERMEMORY_DATA_DIR. It exposes the full Memory API locally.    

For local:

curl -fsSL https://supermemory.ai/install | bash
supermemory-server

Default API:

http://localhost:6767

5. Context model for AI SDLC

Create a standard ContextUnit.

id: repo:payment-service:architecture-summary:main
repo_id: payment-service
org_id: fiserv-local
team_id: platform-team
scope: repo_shared
branch: main
commit_sha: abc123
source_path: docs/architecture.md
context_type: architecture_summary
classification: internal
stability: stable
status: approved
created_by: praveen
updated_by: praveen
valid_from: 2026-06-13
valid_until: null
tags:
  - architecture
  - payments
  - release-readiness
summary: >
  Payment service follows event-driven settlement processing...

Supermemory should receive this as curated content, not raw code dump.

6. Container tag strategy

Supermemory recommends container tags for isolated memory spaces, and each container tag maps to its own isolated vector namespace.  

Use strict naming:

org:fiserv:repo:payment-service
org:fiserv:repo:payment-service:branch:feature-x
org:fiserv:repo:payment-service:user:praveen
org:fiserv:team:platform
org:fiserv:framework:ai-sdlc

For most repo-level retrieval:

containerTag = org:fiserv:repo:payment-service

For personal working memory:

containerTag = org:fiserv:repo:payment-service:user:praveen

For branch context:

containerTag = org:fiserv:repo:payment-service:branch:feature-login

7. Metadata strategy

Use metadata for filtering.

{
  "repo_id": "payment-service",
  "team_id": "platform-team",
  "branch": "main",
  "commit_sha": "abc123",
  "context_type": "architecture_decision",
  "classification": "internal",
  "status": "approved",
  "stability": "stable",
  "source": "docs/adr/004.md",
  "ai_sdlc_version": "1.0"
}

Supermemory supports metadata filters during ingestion and search, including exact, numeric, date, AND/OR filtering.  

8. What CLI should publish to Supermemory

Publish only stable, reusable repo/team knowledge:

✅ Architecture summaries
✅ ADR summaries
✅ domain glossary
✅ coding conventions
✅ API contracts
✅ test strategy
✅ deployment model
✅ release checklist
✅ known risks
✅ known fragile modules
✅ approved AI SDLC guardrails
✅ lessons learned from reviews/incidents

Do not publish by default:

❌ full source code
❌ secrets
❌ customer data
❌ production logs
❌ raw Jira tickets
❌ internal emails/chats
❌ temporary local debugging notes into shared memory

9. CLI command design

Add these commands to your existing CLI:

ai-sdlc memory init
ai-sdlc memory status
ai-sdlc context scan
ai-sdlc context classify
ai-sdlc context publish
ai-sdlc context recall "How should this repo be tested?"
ai-sdlc context pack --tool claude
ai-sdlc context pack --tool codex
ai-sdlc context pack --tool copilot
ai-sdlc context diff
ai-sdlc context approve
ai-sdlc context deprecate

Recommended workflow:

ai-sdlc context scan
ai-sdlc context classify
ai-sdlc context publish --scope repo
ai-sdlc context recall "release readiness rules"
ai-sdlc context pack --tool claude

10. Context preparation algorithm

Your CLI should prepare context in this order:

1. Detect repo identity
2. Read AI SDLC spec
3. Scan repo files
4. Build graphify-style repo map
5. Extract stable context units
6. Classify each unit
7. Run secret/sensitive-data scan
8. Compare with previous memory
9. Publish approved/stable units to Supermemory
10. Recall relevant memories for current task
11. Build final AI tool context pack

Pseudo-flow:

repo = detect_repo()
spec = load_ai_sdlc_spec()
graph = build_graphify_context(repo)
units = extract_context_units(graph, spec)
safe_units = []
for unit in units:
    unit = classify(unit)
    unit = attach_metadata(unit, repo, spec)
    if unit.contains_secret or unit.classification in ["restricted", "confidential"]:
        continue
    if unit.stability in ["stable", "approved"]:
        safe_units.append(unit)
publish_to_supermemory(safe_units)
task_context = recall_from_supermemory(
    query=current_task,
    container_tag=f"org:{org}:repo:{repo.name}",
    metadata_filters={
        "status": "approved",
        "classification": "internal"
    }
)
pack = build_tool_context(task_context, graph, tool="claude")
write_context_files(pack)

11. Supermemory API usage pattern

Add document/memory:

await client.add({
  content: contextUnitMarkdown,
  containerTag: "org:fiserv:repo:payment-service",
  customId: "repo-payment-service-adr-004-abc123",
  metadata: {
    repo_id: "payment-service",
    context_type: "architecture_decision",
    status: "approved",
    classification: "internal",
    commit_sha: "abc123"
  },
  dreaming: "instant"
});

Search memory:

const results = await client.search.memories({
  q: "What release checks apply before production deployment?",
  containerTag: "org:fiserv:repo:payment-service",
  limit: 8
});

Supermemory supports document ingestion, search, profiles, metadata filters, and processing modes such as dynamic and instant.  

12. Multiple people working on same repo

Use three memory scopes:

1. repo_shared
2. branch_shared
3. user_private

Example:

org:fiserv:repo:payment-service
org:fiserv:repo:payment-service:branch:feature-x
org:fiserv:repo:payment-service:user:alice

Rules:

repo_shared:
  only approved/stable context
branch_shared:
  feature-specific temporary context
user_private:
  local notes, debugging trail, personal AI interaction memory

Conflict handling:

draft → proposed → approved → active
                      ↓
                deprecated/conflicting

Never allow silent overwrite of shared memory.

13. Tool-specific context output

Your CLI should generate:

CLAUDE.md
AGENTS.md
.github/copilot-instructions.md
.ai-sdlc/context-pack.md
.ai-sdlc/repo-memory.json
.ai-sdlc/context-manifest.json

Example AGENTS.md sections:

# AI SDLC Context
## Repo Purpose
...
## Architecture
...
## Approved Patterns
...
## Forbidden Changes
...
## Testing Rules
...
## Release Readiness
...
## Known Risks
...
## Relevant Historical Decisions
...

14. Security and governance

Minimum enterprise controls:

1. Secret scanning before publish
2. PII/customer-data detection
3. classification labels
4. repo/team ownership
5. approval gate for shared memory
6. audit log for publish/update/delete
7. memory expiry/deprecation
8. source traceability to file + commit
9. role-based publish rights
10. read boundaries by repo/team

Supermemory has graph memory that can update, extend, or derive relationships between memories, and tracks latest information with isLatest; this is powerful but means you need governance over what is allowed to become shared team memory.  

15. MVP implementation plan

Sprint 1 — Local integration

Goal:

AI SDLC CLI can publish and recall context from local Supermemory.

Build:

- Supermemory config in CLI
- local server health check
- repo_id detection
- containerTag convention
- publish one context unit
- recall by query

Commands:

ai-sdlc memory status
ai-sdlc memory publish --file .ai-sdlc/repo-profile.md
ai-sdlc memory recall "architecture"

Sprint 2 — Context compiler integration

Goal:

Graphify-flavoured context generation produces structured ContextUnits.

Build:

- context_unit schema
- extractor from current graph output
- stability classifier
- source-path + commit metadata
- customId generation

Sprint 3 — Safety layer

Goal:

Only safe context reaches Supermemory.

Build:

- secret scanner
- classification rules
- allow/deny file patterns
- no raw source mode by default
- publish dry-run

Sprint 4 — Tool context packs

Goal:

CLI recalls memory and writes Claude/Codex/Copilot context files.

Build:

- context recall
- ranking/deduplication
- token budget control
- CLAUDE.md generator
- AGENTS.md generator
- Copilot instructions generator

Sprint 5 — Team workflow

Goal:

Multiple developers can work on same repo safely.

Build:

- repo_shared vs user_private scopes
- proposed/approved memory flow
- context diff
- context approve
- context deprecate

16. Final recommendation

Implement like this:

Do not:
Codex/Claude/Copilot → Supermemory directly
Do:
Repo → AI SDLC CLI → Supermemory
Supermemory → AI SDLC CLI → Codex/Claude/Copilot

Your strongest product positioning:

AI SDLC CLI becomes the enterprise context compiler.
Supermemory becomes the persistent memory engine.
AI coding tools receive governed, repo-aware, team-aware context.
------------

Yes — then you should not use container tags as “one tag per repo only.” For your goal, use them as memory isolation boundaries, and use metadata for exact filtering.

Correct container strategy

Container tag = boundary
Metadata = search/filter dimensions

For team code search across repos:

containerTag: org:myorg:team:payments

Then metadata:

{
  "repo": "settlement-service",
  "branch": "main",
  "language": "csharp",
  "context_type": "code_symbol",
  "symbol": "PaymentReversalHandler",
  "file_path": "src/Payments/ReversalHandler.cs",
  "commit_sha": "abc123",
  "cve_relevant": true
}

Supermemory supports container tags for grouping by user/project and metadata filters for precise retrieval. Its docs describe metadata filtering for AND/OR, string, numeric, date, and time-range queries.    

For your use case, use 3 levels

1. org:company:framework:ai-sdlc
   Shared framework memory
2. org:company:team:payments
   Cross-repo team memory
3. org:company:repo:payments:settlement-service
   Repo-specific memory

For incident/CVE search, query multiple scopes:

Search team container:
org:company:team:payments
Filter:
context_type in ["dependency", "api_endpoint", "code_symbol", "data_flow"]
cve_relevant = true

What to index from day one

For each repo, your CLI should create searchable units:

repo_profile
service_ownership
architecture_summary
api_endpoint
dependency_inventory
code_symbol_summary
data_flow_summary
auth_flow_summary
external_integration
deployment_config
known_risk
incident_pattern
test_coverage_summary

Not raw code first. Store summaries + pointers.

Example:

context_type: dependency_inventory
repo: settlement-service
package: Newtonsoft.Json
version: 12.0.1
ecosystem: nuget
file_path: src/Settlement/Settlement.csproj
cve_relevant: true

For incident/bug/CVE analysis

Your CLI flow should be:

Incident/CVE reported
   ↓
CLI extracts indicators:
package, endpoint, class, error text, stack trace, CVE ID
   ↓
Search Supermemory across team containers
   ↓
Fetch exact repo files locally/GitLab
   ↓
Generate impact report

Supermemory should answer:

Which repos may be affected?
Which modules use this dependency?
Which APIs touch this data flow?
What previous decisions/incidents are related?

Your CLI/GitLab should verify:

Exact file content
Exact dependency version
Exact branch/commit
Exact blast radius

Strong recommendation

Build it as:

AI SDLC CLI
  → repo indexer
  → symbol/dependency/API extractor
  → context classifier
  → Supermemory publisher
  → incident/CVE search command

Commands:

ai-sdlc index repo
ai-sdlc index team --group payments
ai-sdlc search "where do we deserialize JWT claims?"
ai-sdlc cve scan CVE-2025-xxxx --team payments
ai-sdlc incident analyze incident.md --team payments

The key point: Supermemory is your searchable team memory, not your source-of-truth code database.
Your CLI remains the authority that builds, verifies, and packages context.

--
Correct. Do not index all branches as shared team context.

Use this rule:

Shared/team memory = only production-truth context
Personal/temporary memory = feature branches

Better hierarchy:

org:myorg
org:myorg:team:payments
org:myorg:team:payments:repo:settlement-service

Then metadata carries source truth:

repo: settlement-service
team: payments
source_ref: main
source_type: main_branch
commit_sha: abc123
prod_deployed: true
release_tag: v2026.06.1
context_status: active

Recommended indexing policy

Index into shared memory only from:

main/master
release tags
production deployment tag
approved ADRs
approved docs
merged PRs

Do not put these into shared memory:

feature branches
local changes
draft PRs
experimental branches
developer notes
unmerged code

Feature branches can be used only as temporary private context:

org:myorg:user:praveen:repo:settlement-service:branch:feature-x

And mark it clearly:

scope: user_private
source_type: feature_branch
context_status: temporary
expires_at: 2026-06-20

Best enterprise model

Team shared memory:
main/release/prod truth
Repo shared memory:
stable repo architecture and approved decisions
User memory:
temporary feature/debugging context
Branch memory:
only short-lived, never used for team-wide answers

So for incident/CVE analysis, search only:

prod_deployed = true
OR source_type in ["main_branch", "release_tag"]

That avoids stale or wrong context from random branches.
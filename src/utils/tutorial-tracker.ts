export interface ModuleState {
  visited: boolean;
  visitedAt: string | null;
  completed: boolean;
  completedAt: string | null;
}

export interface TutorialProgress {
  version: 1;
  pathId: string;
  enrolledAt: string;
  emailHash: string;
  modules: Record<string, ModuleState>;
  completionPercent: number;
  visitedPercent: number;
  currentModule: string | null;
  lastAccessed: string;
  streakDays: number;
  lastStreakDate: string | null;
}

interface PathConfig {
  title: string;
  modules: string[];
  moduleLabels: Record<string, string>;
}

export const TRACKED_PATHS: Record<string, PathConfig> = {
  'llm-mastery': {
    title: 'LLM Mastery for Enterprise AI Engineering',
    modules: [
      'beginner/00-course-overview',
      'beginner/01-what-is-an-llm',
      'beginner/02-how-ai-models-work',
      'beginner/03-tokens-tokenization',
      'beginner/04-foundations-context-embeddings-transformers',
      'intermediate/01-datasets-training-governance',
      'intermediate/02-fine-tuning-lora-qlora-dpo',
      'intermediate/03-inference-optimization-serving',
      'intermediate/04-local-ai-ecosystem',
      'intermediate/05-rag-memory-access-control',
      'intermediate/06-agents-workflows-tool-safety',
      'intermediate/07-model-types-selection',
      'intermediate/08-design-patterns-antipatterns',
      'advanced/01-deployment-readiness',
      'advanced/02-evaluation-release-gates',
      'advanced/03-real-world-skills-capstone',
      'advanced/04-enterprise-governance-operations',
      'advanced/05-assessment-guide-certification',
    ],
    moduleLabels: {
      'beginner/00-course-overview': 'Course Overview',
      'beginner/01-what-is-an-llm': 'What Is an LLM?',
      'beginner/02-how-ai-models-work': 'How AI Models Work',
      'beginner/03-tokens-tokenization': 'Tokens & Tokenization',
      'beginner/04-foundations-context-embeddings-transformers': 'Foundations: Context, Embeddings, Transformers',
      'intermediate/01-datasets-training-governance': 'Datasets & Training Governance',
      'intermediate/02-fine-tuning-lora-qlora-dpo': 'Fine-Tuning: LoRA, QLoRA, DPO',
      'intermediate/03-inference-optimization-serving': 'Inference Optimization & Serving',
      'intermediate/04-local-ai-ecosystem': 'Local AI Ecosystem',
      'intermediate/05-rag-memory-access-control': 'RAG, Memory & Access Control',
      'intermediate/06-agents-workflows-tool-safety': 'Agents, Workflows & Tool Safety',
      'intermediate/07-model-types-selection': 'Model Types & Selection',
      'intermediate/08-design-patterns-antipatterns': 'Design Patterns & Anti-Patterns',
      'advanced/01-deployment-readiness': 'Deployment Readiness',
      'advanced/02-evaluation-release-gates': 'Evaluation & Release Gates',
      'advanced/03-real-world-skills-capstone': 'Real-World Skills & Capstone',
      'advanced/04-enterprise-governance-operations': 'Enterprise Governance & Operations',
      'advanced/05-assessment-guide-certification': 'Assessment Guide & Certification',
    },
  },
  'langgraph': {
    title: 'LangGraph',
    modules: [
      'beginner/01-langgraph-core-beginner',
      'beginner/02-nodes-and-edges-beginner',
      'beginner/03-state-and-persistence-beginner',
      'beginner/04-conditional-routing-beginner',
      'beginner/05-cycles-and-reflection-beginner',
      'beginner/06-human-in-the-loop-beginner',
      'beginner/07-langgraph-vs-langchain-beginner',
      'beginner/08-deployment-and-scaling-beginner',
      'beginner/09-evaluation-beginner',
      'beginner/10-multi-agent-systems-beginner',
      'intermediate/01-langgraph-core-intermediate',
      'intermediate/02-nodes-and-edges-intermediate',
      'intermediate/03-state-and-persistence-intermediate',
      'intermediate/04-conditional-routing-intermediate',
      'intermediate/05-cycles-and-reflection-intermediate',
      'intermediate/06-human-in-the-loop-intermediate',
      'intermediate/07-langgraph-vs-langchain-intermediate',
      'intermediate/08-deployment-and-scaling-intermediate',
      'intermediate/09-evaluation-intermediate',
      'intermediate/10-multi-agent-systems-intermediate',
      'advanced/01-langgraph-core-advanced',
      'advanced/02-nodes-and-edges-advanced',
      'advanced/03-state-and-persistence-advanced',
      'advanced/04-conditional-routing-advanced',
      'advanced/05-cycles-and-reflection-advanced',
      'advanced/06-human-in-the-loop-advanced',
      'advanced/07-langgraph-vs-langchain-advanced',
      'advanced/08-deployment-and-scaling-advanced',
      'advanced/09-evaluation-advanced',
      'advanced/10-multi-agent-systems-advanced',
    ],
    moduleLabels: {
      'beginner/01-langgraph-core-beginner': 'LangGraph Core',
      'beginner/02-nodes-and-edges-beginner': 'Nodes & Edges',
      'beginner/03-state-and-persistence-beginner': 'State & Persistence',
      'beginner/04-conditional-routing-beginner': 'Conditional Routing',
      'beginner/05-cycles-and-reflection-beginner': 'Cycles & Reflection',
      'beginner/06-human-in-the-loop-beginner': 'Human-in-the-Loop',
      'beginner/07-langgraph-vs-langchain-beginner': 'LangGraph vs LangChain',
      'beginner/08-deployment-and-scaling-beginner': 'Deployment & Scaling',
      'beginner/09-evaluation-beginner': 'Evaluation',
      'beginner/10-multi-agent-systems-beginner': 'Multi-Agent Systems',
      'intermediate/01-langgraph-core-intermediate': 'LangGraph Core',
      'intermediate/02-nodes-and-edges-intermediate': 'Nodes & Edges',
      'intermediate/03-state-and-persistence-intermediate': 'State & Persistence',
      'intermediate/04-conditional-routing-intermediate': 'Conditional Routing',
      'intermediate/05-cycles-and-reflection-intermediate': 'Cycles & Reflection',
      'intermediate/06-human-in-the-loop-intermediate': 'Human-in-the-Loop',
      'intermediate/07-langgraph-vs-langchain-intermediate': 'LangGraph vs LangChain',
      'intermediate/08-deployment-and-scaling-intermediate': 'Deployment & Scaling',
      'intermediate/09-evaluation-intermediate': 'Evaluation',
      'intermediate/10-multi-agent-systems-intermediate': 'Multi-Agent Systems',
      'advanced/01-langgraph-core-advanced': 'LangGraph Core',
      'advanced/02-nodes-and-edges-advanced': 'Nodes & Edges',
      'advanced/03-state-and-persistence-advanced': 'State & Persistence',
      'advanced/04-conditional-routing-advanced': 'Conditional Routing',
      'advanced/05-cycles-and-reflection-advanced': 'Cycles & Reflection',
      'advanced/06-human-in-the-loop-advanced': 'Human-in-the-Loop',
      'advanced/07-langgraph-vs-langchain-advanced': 'LangGraph vs LangChain',
      'advanced/08-deployment-and-scaling-advanced': 'Deployment & Scaling',
      'advanced/09-evaluation-advanced': 'Evaluation',
      'advanced/10-multi-agent-systems-advanced': 'Multi-Agent Systems',
    },
  },
  'system-design': {
    title: 'System Design for AI & FDE',
    modules: [
      'beginner/01-system-design-foundations-for-ai-builders',
      'beginner/02-storage-apis-and-auth-basics',
      'beginner/03-reliability-basics-for-ai-products',
      'beginner/04-fde-system-design-starter-scenarios',
      'intermediate/01-scaling-patterns-hashing-sharding-and-replication',
      'intermediate/02-service-communication-and-mesh-patterns',
      'intermediate/03-database-internals-and-storage-tiers',
      'intermediate/04-reliability-and-interview-walkthroughs',
      'advanced/01-llm-inference-and-serving-architecture',
      'advanced/02-production-rag-vector-search-and-embeddings',
      'advanced/03-multi-agent-mcp-and-prompt-caching-systems',
      'advanced/04-safety-compliance-and-human-approval-pipelines',
      'advanced/05-global-distributed-systems-for-ai-infrastructure',
    ],
    moduleLabels: {
      'beginner/01-system-design-foundations-for-ai-builders': 'System Design Foundations for AI Builders',
      'beginner/02-storage-apis-and-auth-basics': 'Storage, APIs & Auth Basics',
      'beginner/03-reliability-basics-for-ai-products': 'Reliability Basics for AI Products',
      'beginner/04-fde-system-design-starter-scenarios': 'FDE System Design Starter Scenarios',
      'intermediate/01-scaling-patterns-hashing-sharding-and-replication': 'Scaling Patterns: Hashing, Sharding & Replication',
      'intermediate/02-service-communication-and-mesh-patterns': 'Service Communication & Mesh Patterns',
      'intermediate/03-database-internals-and-storage-tiers': 'Database Internals & Storage Tiers',
      'intermediate/04-reliability-and-interview-walkthroughs': 'Reliability & Interview Walkthroughs',
      'advanced/01-llm-inference-and-serving-architecture': 'LLM Inference & Serving Architecture',
      'advanced/02-production-rag-vector-search-and-embeddings': 'Production RAG, Vector Search & Embeddings',
      'advanced/03-multi-agent-mcp-and-prompt-caching-systems': 'Multi-Agent, MCP & Prompt Caching Systems',
      'advanced/04-safety-compliance-and-human-approval-pipelines': 'Safety, Compliance & Human Approval Pipelines',
      'advanced/05-global-distributed-systems-for-ai-infrastructure': 'Global Distributed Systems for AI Infrastructure',
    },
  },
  'llm-systems': {
    title: 'LLM Systems Engineering',
    modules: [
      'intermediate/01-eval-harness',
      'intermediate/02-rag-plus-reranking',
      'intermediate/03-prompt-registry',
      'intermediate/04-llm-gateway',
      'advanced/01-tool-calling-agent',
      'advanced/02-synthetic-data-pipeline',
      'advanced/03-lora-fine-tuning',
      'advanced/04-batch-inference-worker',
      'advanced/05-hallucination-monitor',
      'advanced/06-cost-latency-dashboard',
      'advanced/07-context-router',
    ],
    moduleLabels: {
      'intermediate/01-eval-harness': 'Eval Harness',
      'intermediate/02-rag-plus-reranking': 'RAG + Reranking',
      'intermediate/03-prompt-registry': 'Prompt Registry',
      'intermediate/04-llm-gateway': 'LLM Gateway',
      'advanced/01-tool-calling-agent': 'Tool-Calling Agent',
      'advanced/02-synthetic-data-pipeline': 'Synthetic Data Pipeline',
      'advanced/03-lora-fine-tuning': 'LoRA Fine-Tuning',
      'advanced/04-batch-inference-worker': 'Batch Inference Worker',
      'advanced/05-hallucination-monitor': 'Hallucination Monitor',
      'advanced/06-cost-latency-dashboard': 'Cost/Latency Dashboard',
      'advanced/07-context-router': 'Context Router',
    },
  },
};

export type TrackedPathId = keyof typeof TRACKED_PATHS;

// Backward-compat alias used by LlmMasteryGate
export const LLM_MASTERY_MODULES = TRACKED_PATHS['llm-mastery'].modules;

export function getStorageKey(pathId: string): string {
  return `${pathId}-progress`;
}

export function getPathModules(pathId: string): string[] {
  return TRACKED_PATHS[pathId]?.modules ?? [];
}

export function getModuleLabel(pathId: string, moduleSlug: string): string {
  return TRACKED_PATHS[pathId]?.moduleLabels[moduleSlug] ?? moduleSlug;
}

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function load(pathId: string): TutorialProgress | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(getStorageKey(pathId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TutorialProgress;
    if (!parsed.enrolledAt || parsed.version !== 1) return null;
    return parsed;
  } catch {
    return null;
  }
}

function save(progress: TutorialProgress): void {
  if (!isBrowser()) return;
  try {
    localStorage.setItem(getStorageKey(progress.pathId), JSON.stringify(progress));
  } catch {
    // Storage quota exceeded
  }
}

function calcPercents(pathId: string, modules: Record<string, ModuleState>) {
  const allModules = getPathModules(pathId);
  const total = allModules.length;
  if (total === 0) return { completionPercent: 0, visitedPercent: 0 };
  let completed = 0;
  let visited = 0;
  for (const slug of allModules) {
    const m = modules[slug];
    if (!m) continue;
    if (m.completed) completed++;
    if (m.visited || m.completed) visited++;
  }
  return {
    completionPercent: Math.round((completed / total) * 1000) / 10,
    visitedPercent: Math.round((visited / total) * 1000) / 10,
  };
}

function nextIncomplete(pathId: string, modules: Record<string, ModuleState>): string | null {
  for (const slug of getPathModules(pathId)) {
    if (!modules[slug]?.completed) return slug;
  }
  return null;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function updateStreak(progress: TutorialProgress): void {
  const today = todayStr();
  if (progress.lastStreakDate === today) return;
  progress.streakDays = (progress.streakDays || 0) + 1;
  progress.lastStreakDate = today;
}

function makeProgress(pathId: string, emailHash: string): TutorialProgress {
  const allModules = getPathModules(pathId);
  const modules: Record<string, ModuleState> = {};
  for (const slug of allModules) {
    modules[slug] = { visited: false, visitedAt: null, completed: false, completedAt: null };
  }
  const now = new Date().toISOString();
  return {
    version: 1,
    pathId,
    enrolledAt: now,
    emailHash,
    modules,
    completionPercent: 0,
    visitedPercent: 0,
    currentModule: allModules[0] ?? null,
    lastAccessed: now,
    streakDays: 1,
    lastStreakDate: todayStr(),
  };
}

// ── Public API ────────────────────────────────────────────────────────────────

export function isTracking(pathId: string): boolean {
  return load(pathId) !== null;
}

/** Backward-compat alias for LlmMasteryGate */
export function isEnrolled(): boolean {
  return isTracking('llm-mastery');
}

/** Start tracking with optional email (llm-mastery uses email; others pass undefined) */
export function startTracking(pathId: string, email?: string): TutorialProgress {
  const emailHash = email
    ? btoa(email.toLowerCase().trim()).slice(0, 8)
    : 'anon';
  const progress = makeProgress(pathId, emailHash);
  save(progress);
  return progress;
}

/** Backward-compat alias for LlmMasteryGate */
export function enroll(email: string): TutorialProgress {
  return startTracking('llm-mastery', email);
}

export function getProgress(pathId: string): TutorialProgress | null {
  return load(pathId);
}

export function markVisited(pathId: string, moduleSlug: string): void {
  const progress = load(pathId);
  if (!progress) return;
  const m = progress.modules[moduleSlug];
  if (!m) return;
  if (!m.visited) {
    m.visited = true;
    m.visitedAt = new Date().toISOString();
  }
  progress.currentModule = nextIncomplete(pathId, progress.modules);
  progress.lastAccessed = new Date().toISOString();
  updateStreak(progress);
  const { visitedPercent, completionPercent } = calcPercents(pathId, progress.modules);
  progress.visitedPercent = visitedPercent;
  progress.completionPercent = completionPercent;
  save(progress);
}

export function markComplete(pathId: string, moduleSlug: string): void {
  const progress = load(pathId);
  if (!progress) return;
  const m = progress.modules[moduleSlug];
  if (!m) return;
  const now = new Date().toISOString();
  if (!m.visited) { m.visited = true; m.visitedAt = now; }
  if (!m.completed) { m.completed = true; m.completedAt = now; }
  progress.currentModule = nextIncomplete(pathId, progress.modules);
  progress.lastAccessed = now;
  updateStreak(progress);
  const { visitedPercent, completionPercent } = calcPercents(pathId, progress.modules);
  progress.visitedPercent = visitedPercent;
  progress.completionPercent = completionPercent;
  save(progress);
}

export function isModuleComplete(pathId: string, moduleSlug: string): boolean {
  return Boolean(load(pathId)?.modules[moduleSlug]?.completed);
}

export function isModuleVisited(pathId: string, moduleSlug: string): boolean {
  const m = load(pathId)?.modules[moduleSlug];
  return Boolean(m?.visited || m?.completed);
}

export function getNextModule(pathId: string, moduleSlug: string): string | null {
  const modules = getPathModules(pathId);
  const idx = modules.indexOf(moduleSlug);
  if (idx === -1 || idx === modules.length - 1) return null;
  return modules[idx + 1];
}

export function getPrevModule(pathId: string, moduleSlug: string): string | null {
  const modules = getPathModules(pathId);
  const idx = modules.indexOf(moduleSlug);
  if (idx <= 0) return null;
  return modules[idx - 1];
}

export function clearProgress(pathId: string): void {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(getStorageKey(pathId));
  } catch {
    // ignore
  }
}

export function exportProgress(pathId: string): string {
  const progress = load(pathId);
  if (!progress) return '{}';
  return JSON.stringify(progress, null, 2);
}

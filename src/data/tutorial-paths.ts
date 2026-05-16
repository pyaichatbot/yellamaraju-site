export type TutorialPathId = 'genai' | 'llm-systems' | 'langgraph' | 'system-design' | 'ai-literacy';
export type TutorialLevel = 'beginner' | 'intermediate' | 'advanced';

export const TUTORIAL_LEVELS: Array<{
  key: TutorialLevel;
  label: string;
  subtitle: string;
  time: string;
  color: string;
}> = [
  { key: 'beginner', label: 'Beginner', subtitle: 'Build the foundation', time: '15-25 min each', color: 'var(--tut-beginner)' },
  { key: 'intermediate', label: 'Intermediate', subtitle: 'Design and implement real systems', time: '25-35 min each', color: 'var(--tut-intermediate)' },
  { key: 'advanced', label: 'Advanced', subtitle: 'Operate production-grade systems', time: '35-45 min each', color: 'var(--tut-advanced)' },
];

export const TUTORIAL_PATHS: Array<{
  id: TutorialPathId;
  title: string;
  shortTitle: string;
  description: string;
  audience: string;
  outcome: string;
  accent: string;
  order: number;
  recommendedLevel: TutorialLevel;
  tags: string[];
}> = [
  {
    id: 'genai',
    title: 'GenAI Foundations',
    shortTitle: 'GenAI',
    description: 'Core GenAI concepts, APIs, prompts, structured outputs, RAG, agents, evals, and production AI basics.',
    audience: 'DEV, QA, BA, and PM learners who need practical AI fluency.',
    outcome: 'Understand and build the baseline AI application patterns used across the rest of the site.',
    accent: 'var(--tut-beginner)',
    order: 1,
    recommendedLevel: 'beginner',
    tags: ['Foundations', 'Build', 'AI Apps'],
  },
  {
    id: 'llm-systems',
    title: 'LLM Systems Engineering',
    shortTitle: 'LLM Systems',
    description: 'Production LLM architecture patterns: eval harnesses, RAG, gateways, prompt registries, routing, monitoring, and cost controls.',
    audience: 'Builders responsible for reliable model-backed products.',
    outcome: 'Design the runtime systems that make LLM features measurable, safe, and operable.',
    accent: 'var(--color-accent)',
    order: 2,
    recommendedLevel: 'intermediate',
    tags: ['Operate', 'Architecture', 'Reliability'],
  },
  {
    id: 'langgraph',
    title: 'LangGraph',
    shortTitle: 'LangGraph',
    description: 'Stateful agent workflows, graph nodes, routing, persistence, human approval, deployment, evaluation, and multi-agent patterns.',
    audience: 'Developers building controllable agent workflows.',
    outcome: 'Move from linear chains to durable, inspectable, resumable agent graphs.',
    accent: 'var(--tut-intermediate)',
    order: 3,
    recommendedLevel: 'beginner',
    tags: ['Agents', 'Build', 'Interview Prep'],
  },
  {
    id: 'system-design',
    title: 'System Design for AI/FDE',
    shortTitle: 'System Design',
    description: 'Distributed systems and AI infrastructure design for FDE-style interviews and production architecture decisions.',
    audience: 'Engineers, PMs, and BAs who need to explain architecture trade-offs clearly.',
    outcome: 'Design scalable AI systems with explicit user promises, failure modes, and operational controls.',
    accent: 'var(--tut-advanced)',
    order: 4,
    recommendedLevel: 'beginner',
    tags: ['Architecture', 'Interview Prep', 'FDE'],
  },
  {
    id: 'ai-literacy',
    title: 'AI Literacy for Real Decision Making',
    shortTitle: 'AI Literacy',
    description: 'How AI fails, what models cannot do, privacy risks, bias testing, prompt injection, and defensible deployment decisions.',
    audience: 'DEV, QA, BA, PM, and Exec audiences who work alongside AI systems.',
    outcome: 'Spot AI failure modes before they become incidents and make AI deployment decisions that hold up under scrutiny.',
    accent: 'var(--tut-literacy)',
    order: 5,
    recommendedLevel: 'beginner',
    tags: ['Governance', 'Risk', 'Safety', 'Decision Making'],
  },
];

export const LEGACY_LEVELS = ['beginner', 'intermediate', 'advanced'] as const;

export function getTutorialPath(id: string) {
  return TUTORIAL_PATHS.find((p) => p.id === id);
}

export function getTutorialLevel(level: string) {
  return TUTORIAL_LEVELS.find((l) => l.key === level);
}

export function splitTutorialSlug(slug: string) {
  const [path, level, ...rest] = slug.split('/');
  return { path, level, slug: rest.join('/') };
}

export function tutorialHref(entry: { slug: string }) {
  const parts = splitTutorialSlug(entry.slug);
  return `/tutorials/${parts.path}/${parts.level}/${parts.slug}`;
}

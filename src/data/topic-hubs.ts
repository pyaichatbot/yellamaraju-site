export interface TopicHub {
  slug: string;
  title: string;
  description: string;
  featuredPost: string;
  posts: string[];
  templates?: string[];
  relatedTags?: string[];
}

export const topicHubs: TopicHub[] = [
  {
    slug: 'production-llm-systems',
    title: 'Production LLM Systems',
    description: 'Practical architecture, API design, context management, cost control, and reliability patterns for shipping LLM-backed software.',
    featuredPost: 'anatomy-of-a-production-llm-call',
    posts: [
      'anatomy-of-a-production-llm-call',
      'what-happens-when-you-call-an-llm-api',
      'prompt-engineering-demos-vs-production',
      'context-window-vs-attention-window-llm-architecture',
      'recursive-language-models-paradigm-shift',
      'ai-data-quality-when-training-data-becomes-time-bomb-part-1',
      'ai-data-quality-when-training-data-becomes-time-bomb-part-2',
      'why-ai-systems-quietly-degrade',
    ],
    relatedTags: ['Production', 'LLM API', 'Architecture', 'RAG'],
  },
  {
    slug: 'agentic-ai-systems',
    title: 'Agentic AI Systems',
    description: 'Agent harnesses, orchestration loops, self-improving systems, automation patterns, and practical agent infrastructure.',
    featuredPost: 'agent-harness-explained-missing-layer-ai-systems',
    posts: [
      'agent-harness-explained-missing-layer-ai-systems',
      'from-agent-harness-to-self-improving-ai-systems',
      'how-ralph-wiggum-became-biggest-name-in-ai',
      'openclaw-self-hosted-ai-assistant-security-guide',
      'decentralized-ai-compute-depin-networks',
    ],
    templates: [
      'ralph-task-definition-guide',
      'ralph-pre-launch-checklist',
      'ralph-prd',
      'ralph-implementation-skill',
    ],
    relatedTags: ['AI Agents', 'Agent Harness', 'Automation', 'Self-Improving AI'],
  },
  {
    slug: 'ai-evaluation-reliability',
    title: 'AI Evaluation & Reliability',
    description: 'Benchmarks, eval design, drift detection, degradation, prompt testing, regression gates, and reliability practices for AI systems.',
    featuredPost: 'understanding-llm-benchmarks-complete-guide',
    posts: [
      'understanding-llm-benchmarks-complete-guide',
      'why-ai-systems-quietly-degrade',
      'from-agent-harness-to-self-improving-ai-systems',
      'prompt-engineering-demos-vs-production',
      'red-teaming-ai-systems-practitioners-guide',
      'ai-data-quality-when-training-data-becomes-time-bomb-part-1',
      'ai-data-quality-when-training-data-becomes-time-bomb-part-2',
    ],
    relatedTags: ['AI Evaluation', 'Testing', 'MLOps', 'Benchmarks'],
  },
  {
    slug: 'ai-security-governance',
    title: 'AI Security & Governance',
    description: 'Security reviews, supply-chain risk, red teaming, data governance, ownership models, and approval gates for production AI.',
    featuredPost: 'red-teaming-ai-systems-practitioners-guide',
    posts: [
      'red-teaming-ai-systems-practitioners-guide',
      'supply-chain-attacks-vibe-coding-safer-dependency-habits',
      'openclaw-self-hosted-ai-assistant-security-guide',
      'sloperators-why-ai-outputs-need-owners-not-better-models',
      'ai-data-quality-when-training-data-becomes-time-bomb-part-2',
      'before-you-build-ai-use-case-evaluation',
    ],
    templates: [
      'ai-architecture-gate',
      'ai-use-case-assessment-worksheet',
      'poc-validation-checklist',
      'ai-roi-calculator',
      'ai-level-decision-matrix',
    ],
    relatedTags: ['Security', 'Governance', 'Supply Chain', 'Red Teaming'],
  },
  {
    slug: 'claude-ai-coding',
    title: 'Claude & AI Coding Workflows',
    description: 'Claude Code, autonomous coding loops, promptable development workflows, and practical guardrails for AI-assisted engineering.',
    featuredPost: 'how-ralph-wiggum-became-biggest-name-in-ai',
    posts: [
      'how-ralph-wiggum-became-biggest-name-in-ai',
      'prompt-engineering-demos-vs-production',
      'supply-chain-attacks-vibe-coding-safer-dependency-habits',
    ],
    relatedTags: ['Claude', 'Development', 'Prompt Engineering', 'AI Agents'],
  },
];

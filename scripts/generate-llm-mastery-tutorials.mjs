import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const sourceRoot = path.join(root, 'docs/llm-mastery');
const targetRoot = path.join(root, 'src/content/tutorials/llm-mastery');

const date = '2026-05-24';
const pathTitle = 'LLM Mastery';
const pathOrder = 6;
const roles = ['dev', 'qa', 'ba', 'pm', 'exec'];

const modules = [
  {
    source: 'README.md',
    level: 'beginner',
    slug: '00-course-overview',
    title: 'Course Overview',
    description: 'How to use LLM Mastery as a free enterprise AI engineering course.',
    module: 1,
    totalModules: 5,
    estimatedTime: '20 min',
    tags: ['LLM Mastery', 'Enterprise AI', 'Course Overview'],
    prerequisites: [],
  },
  {
    source: '01-foundations/01-llm-basics.md',
    level: 'beginner',
    slug: '01-what-is-an-llm',
    title: 'What Is an LLM?',
    description: 'The plain-English mental model for large language models and the modern LLM ecosystem.',
    module: 2,
    totalModules: 5,
    estimatedTime: '25 min',
    tags: ['LLM Foundations', 'Model Selection', 'AI Basics'],
    prerequisites: [],
  },
  {
    source: '01-foundations/02-how-models-work.md',
    level: 'beginner',
    slug: '02-how-ai-models-work',
    title: 'How AI Models Work',
    description: 'Neural networks, training, softmax, architecture, and why next-token prediction becomes useful behavior.',
    module: 3,
    totalModules: 5,
    estimatedTime: '30 min',
    tags: ['LLM Foundations', 'Neural Networks', 'Training'],
    prerequisites: ['What Is an LLM?'],
  },
  {
    source: '01-foundations/03-tokens-tokenization.md',
    level: 'beginner',
    slug: '03-tokens-tokenization',
    title: 'Tokens and Tokenization',
    description: 'How tokenization affects cost, context windows, latency, multilingual behavior, and practical engineering decisions.',
    module: 4,
    totalModules: 5,
    estimatedTime: '30 min',
    tags: ['Tokens', 'Context Window', 'Cost'],
    prerequisites: ['How AI Models Work'],
  },
  {
    source: '01-foundations/04-10-remaining-foundations.md',
    level: 'beginner',
    slug: '04-foundations-context-embeddings-transformers',
    title: 'Context, Embeddings, Transformers, and Model Choices',
    description: 'The remaining foundation layer: context windows, embeddings, transformers, attention, parameters, training vs inference, and open vs closed models.',
    module: 5,
    totalModules: 5,
    estimatedTime: '55 min',
    tags: ['Embeddings', 'Transformers', 'Context Windows', 'Model Selection'],
    prerequisites: ['Tokens and Tokenization'],
  },
  {
    source: '02-datasets-training/complete-module-02.md',
    level: 'intermediate',
    slug: '01-datasets-training-governance',
    title: 'Datasets, Training, and Data Governance',
    description: 'SFT data, instruction tuning, preference data, synthetic data, curation, formatting, and enterprise data cards.',
    module: 1,
    totalModules: 8,
    estimatedTime: '50 min',
    tags: ['Datasets', 'Fine-Tuning', 'Data Governance'],
    prerequisites: ['LLM Foundations'],
  },
  {
    source: '03-fine-tuning/complete-module-03.md',
    level: 'intermediate',
    slug: '02-fine-tuning-lora-qlora-dpo',
    title: 'Fine-Tuning with LoRA, QLoRA, DPO, and RLHF',
    description: 'How to customize models responsibly and prove the tuned model is better than the baseline.',
    module: 2,
    totalModules: 8,
    estimatedTime: '55 min',
    tags: ['Fine-Tuning', 'LoRA', 'QLoRA', 'Evaluation'],
    prerequisites: ['Datasets, Training, and Data Governance'],
  },
  {
    source: '04-inference-optimization/complete-module-04.md',
    level: 'intermediate',
    slug: '03-inference-optimization-serving',
    title: 'Inference and Optimization',
    description: 'KV cache, Flash Attention, speculative decoding, serving, batching, GPU memory, and latency-quality tradeoffs.',
    module: 3,
    totalModules: 8,
    estimatedTime: '45 min',
    tags: ['Inference', 'Optimization', 'Serving', 'Latency'],
    prerequisites: ['LLM Foundations'],
  },
  {
    source: '05-local-ai-ecosystem/complete-module-05.md',
    level: 'intermediate',
    slug: '04-local-ai-ecosystem',
    title: 'Local AI Ecosystem',
    description: 'llama.cpp, Ollama, vLLM, MLX, Hugging Face, Unsloth, Axolotl, PEFT, and TRL.',
    module: 4,
    totalModules: 8,
    estimatedTime: '50 min',
    tags: ['Local AI', 'vLLM', 'Ollama', 'Hugging Face'],
    prerequisites: ['Inference and Optimization'],
  },
  {
    source: '06-rag-memory/complete-module-06.md',
    level: 'intermediate',
    slug: '05-rag-memory-access-control',
    title: 'RAG, Memory, and Access Control',
    description: 'Retrieval-augmented generation, vector databases, chunking, memory systems, semantic search, and enterprise RAG security gates.',
    module: 5,
    totalModules: 8,
    estimatedTime: '60 min',
    tags: ['RAG', 'Vector Databases', 'Memory', 'Access Control'],
    prerequisites: ['Tokens and Tokenization', 'Embeddings'],
  },
  {
    source: '07-agents-workflows/complete-module-07.md',
    level: 'intermediate',
    slug: '06-agents-workflows-tool-safety',
    title: 'Agents, Workflows, and Tool Safety',
    description: 'Prompting, system prompts, tool calling, agents, multi-agent workflows, browser agents, and enterprise tool-use controls.',
    module: 6,
    totalModules: 8,
    estimatedTime: '50 min',
    tags: ['Agents', 'Tool Calling', 'Prompt Engineering', 'Safety'],
    prerequisites: ['RAG, Memory, and Access Control'],
  },
  {
    source: '08-model-types/complete-module-08.md',
    level: 'intermediate',
    slug: '07-model-types-selection',
    title: 'Model Types and Selection',
    description: 'Vision-language models, small language models, dense vs MoE, coding models, reasoning models, and fit-for-purpose selection.',
    module: 7,
    totalModules: 8,
    estimatedTime: '45 min',
    tags: ['Model Selection', 'VLMs', 'SLMs', 'Reasoning Models'],
    prerequisites: ['LLM Foundations'],
  },
  {
    source: '00-design-patterns-antipatterns.md',
    level: 'intermediate',
    slug: '08-design-patterns-antipatterns',
    title: 'LLM Engineering Patterns and Anti-Patterns',
    description: 'Production design patterns, anti-patterns, decision tables, and real-world scenarios across the full LLM lifecycle.',
    module: 8,
    totalModules: 8,
    estimatedTime: '70 min',
    tags: ['Patterns', 'Anti-Patterns', 'Production AI'],
    prerequisites: ['Agents, Workflows, and Tool Safety'],
  },
  {
    source: '09-deployment/complete-module-09.md',
    level: 'advanced',
    slug: '01-deployment-readiness',
    title: 'Deployment Readiness',
    description: 'Local, on-device, API, cloud GPU, and edge deployment with identity, audit, SLO, fallback, and incident assumptions.',
    module: 1,
    totalModules: 5,
    estimatedTime: '50 min',
    tags: ['Deployment', 'SLOs', 'Operations', 'Security'],
    prerequisites: ['Inference and Optimization'],
  },
  {
    source: '10-evaluation/complete-module-10.md',
    level: 'advanced',
    slug: '02-evaluation-release-gates',
    title: 'Evaluation and Release Gates',
    description: 'Benchmarks, human evals, LLM-as-judge, cost, speed, safety, privacy, prompt injection, failure severity, and release decisions.',
    module: 2,
    totalModules: 5,
    estimatedTime: '55 min',
    tags: ['Evaluation', 'Release Gates', 'LLMOps', 'Safety'],
    prerequisites: ['Deployment Readiness'],
  },
  {
    source: '11-real-world-skills/complete-module-11.md',
    level: 'advanced',
    slug: '03-real-world-skills-capstone',
    title: 'Real-World Skills and Capstone',
    description: 'Build usable AI products and complete the enterprise compliance automation capstone.',
    module: 3,
    totalModules: 5,
    estimatedTime: '75 min',
    tags: ['Capstone', 'AI Product', 'Compliance Automation'],
    prerequisites: ['Evaluation and Release Gates'],
  },
  {
    source: '12-enterprise-governance/complete-module-12.md',
    level: 'advanced',
    slug: '04-enterprise-governance-operations',
    title: 'Enterprise Governance and Operations',
    description: 'Risk classification, data governance, model/vendor governance, security, human oversight, monitoring, incident response, and change management.',
    module: 4,
    totalModules: 5,
    estimatedTime: '60 min',
    tags: ['Governance', 'Risk', 'Security', 'Operations'],
    prerequisites: ['Evaluation and Release Gates'],
  },
  {
    source: 'enterprise-assessment-guide.md',
    level: 'advanced',
    slug: '05-assessment-guide-certification',
    title: 'Assessment Guide and Certification Standard',
    description: 'Rubrics, module gates, exemplar artifacts, facilitator checklist, and capstone scoring for running LLM Mastery as a cohort.',
    module: 5,
    totalModules: 5,
    estimatedTime: '40 min',
    tags: ['Assessment', 'Rubrics', 'Cohort Training', 'Certification'],
    prerequisites: ['Enterprise Governance and Operations'],
  },
];

const moduleBySource = new Map(modules.map((module) => [
  module.source.replace(/^\.\//, ''),
  module,
]));

function tutorialUrlFor(meta) {
  return `/tutorials/llm-mastery/${meta.level}/${meta.slug}`;
}

function quote(value) {
  return JSON.stringify(value);
}

function frontmatter(meta) {
  return [
    '---',
    `title: ${quote(meta.title)}`,
    `description: ${quote(meta.description)}`,
    `level: ${meta.level}`,
    'path: llm-mastery',
    `pathTitle: ${quote(pathTitle)}`,
    `pathOrder: ${pathOrder}`,
    `module: ${meta.module}`,
    `totalModules: ${meta.totalModules}`,
    `roles: ${JSON.stringify(roles)}`,
    `tags: ${JSON.stringify(meta.tags)}`,
    `date: ${date}`,
    `estimatedTime: ${quote(meta.estimatedTime)}`,
    `prerequisites: ${JSON.stringify(meta.prerequisites)}`,
    '---',
    '',
  ].join('\n');
}

function escapeMdxText(body) {
  const lines = body.split('\n');
  let inFence = false;
  return lines.map((line, index) => {
    const trimmed = line.trim();

    if (!inFence && trimmed.startsWith('```')) {
      inFence = true;
      return line.replace('```', '````');
    }

    if (inFence && trimmed === '```') {
      const nextMeaningful = lines.slice(index + 1).find((candidate) => candidate.trim() !== '')?.trim() ?? '';
      const looksLikeFenceEnd = nextMeaningful === '' || nextMeaningful === '---' || nextMeaningful.startsWith('#') || nextMeaningful.startsWith('*Next:');
      if (looksLikeFenceEnd) {
        inFence = false;
        return line.replace('```', '````');
      }
    }

    if (inFence) return line;
    return line
      .replaceAll('<', '&lt;')
      .replaceAll('{', '&#123;')
      .replaceAll('}', '&#125;');
  }).join('\n');
}

function normalizeSourceLink(fromSource, href) {
  if (/^(https?:|mailto:|#)/.test(href)) return null;

  const cleanHref = href.split('#')[0];
  const hash = href.includes('#') ? `#${href.split('#').slice(1).join('#')}` : '';
  const resolved = path
    .normalize(path.join(path.dirname(fromSource), cleanHref))
    .replaceAll(path.sep, '/')
    .replace(/^\.\//, '');

  return { resolved, hash };
}

function rewriteInternalLinks(body, fromSource) {
  return body.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, label, href) => {
    const normalized = normalizeSourceLink(fromSource, href);
    if (!normalized) return match;

    const target = moduleBySource.get(normalized.resolved);
    if (!target) {
      return normalized.resolved.endsWith('.md') ? label : match;
    }

    return `[${label}](${tutorialUrlFor(target)}${normalized.hash})`;
  });
}

function addCourseNotice(body, meta) {
  return [
    `> **LLM Mastery course page.** This lesson is part ${meta.module} of ${meta.totalModules} in the ${meta.level} track. Use the lab and assessment sections as the completion standard, not optional reading.`,
    '',
    `**Required mastery artifact:** by the end of this lesson, update the running enterprise readiness packet for a realistic use case. Treat examples and vendor names as dated illustrations; defend decisions with current model, cost, risk, and evaluation evidence.`,
    '',
    body.trim(),
    '',
  ].join('\n');
}

await fs.rm(targetRoot, { recursive: true, force: true });

for (const meta of modules) {
  const sourcePath = path.join(sourceRoot, meta.source);
  const targetDir = path.join(targetRoot, meta.level);
  const targetPath = path.join(targetDir, `${meta.slug}.mdx`);
  const source = await fs.readFile(sourcePath, 'utf8');
  const linked = rewriteInternalLinks(source, meta.source);
  const body = addCourseNotice(escapeMdxText(linked), meta);
  await fs.mkdir(targetDir, { recursive: true });
  await fs.writeFile(targetPath, `${frontmatter(meta)}${body}`);
}

console.log(`Generated ${modules.length} LLM Mastery tutorial pages`);

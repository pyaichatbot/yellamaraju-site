export interface Template {
  slug: string;
  title: string;
  description: string;
  category: string;
  relatedBlogPost?: string;
  tags: string[];
  featured?: boolean;
}

export interface TemplateCategory {
  id: string;
  name: string;
  description: string;
  icon?: string;
}

export const categories: TemplateCategory[] = [
  {
    id: 'ai-use-cases',
    name: 'AI Use Cases',
    description: 'Frameworks and templates for evaluating AI use cases, calculating ROI, and making informed decisions.',
  },
  {
    id: 'ralph-wiggum',
    name: 'Ralph Wiggum',
    description: 'Production-ready templates, checklists, and guides for implementing autonomous AI coding with Ralph Wiggum loops.',
  },
];

export const templates: Template[] = [
  // AI Use Case Templates
  {
    slug: 'ai-use-case-assessment-worksheet',
    title: 'AI Use Case Assessment Worksheet',
    description: '3-dimensional evaluation framework (Desirability, Feasibility, Viability) with scoring system.',
    category: 'ai-use-cases',
    relatedBlogPost: 'before-you-build-ai-use-case-evaluation',
    tags: ['evaluation', 'framework', 'assessment'],
    featured: true,
  },
  {
    slug: 'ai-architecture-gate',
    title: 'AI Architecture Gate',
    description: 'Enterprise governance and approval process with 5 gates. Mandatory before budget approval.',
    category: 'ai-use-cases',
    relatedBlogPost: 'before-you-build-ai-use-case-evaluation',
    tags: ['governance', 'enterprise', 'approval'],
  },
  {
    slug: 'ai-roi-calculator',
    title: 'AI ROI Calculator',
    description: 'Financial analysis template with cost/benefit calculations, risk scenarios, and sensitivity analysis.',
    category: 'ai-use-cases',
    relatedBlogPost: 'before-you-build-ai-use-case-evaluation',
    tags: ['roi', 'financial', 'analysis'],
    featured: true,
  },
  {
    slug: 'poc-validation-checklist',
    title: 'PoC Validation Checklist',
    description: '4-week proof-of-concept framework with success criteria, week-by-week structure, and decision gates.',
    category: 'ai-use-cases',
    relatedBlogPost: 'before-you-build-ai-use-case-evaluation',
    tags: ['poc', 'validation', 'checklist'],
  },
  {
    slug: 'ai-level-decision-matrix',
    title: 'AI Level Decision Matrix',
    description: 'Reference guide for selecting the appropriate AI level (0-5) with explanations and cost estimates.',
    category: 'ai-use-cases',
    relatedBlogPost: 'before-you-build-ai-use-case-evaluation',
    tags: ['decision', 'matrix', 'levels'],
  },
  // Ralph Wiggum Templates
  {
    slug: 'ralph-task-definition-guide',
    title: 'Ralph Task Definition Guide',
    description: 'How to write Ralph-ready task definitions with measurable success criteria and verification patterns.',
    category: 'ralph-wiggum',
    relatedBlogPost: 'how-ralph-wiggum-became-biggest-name-in-ai',
    tags: ['task-definition', 'planning', 'guide'],
    featured: true,
  },
  {
    slug: 'ralph-pre-launch-checklist',
    title: 'Ralph Pre-Launch Checklist',
    description: 'Comprehensive checklist to ensure success before every Ralph run, covering environment, cost controls, and safety nets.',
    category: 'ralph-wiggum',
    relatedBlogPost: 'how-ralph-wiggum-became-biggest-name-in-ai',
    tags: ['checklist', 'preparation', 'safety'],
    featured: true,
  },
  {
    slug: 'ralph-prd',
    title: 'Ralph Product Requirements Document',
    description: 'Complete PRD for implementing Ralph Wiggum autonomous coding workflows in production environments.',
    category: 'ralph-wiggum',
    relatedBlogPost: 'how-ralph-wiggum-became-biggest-name-in-ai',
    tags: ['prd', 'requirements', 'documentation'],
  },
  {
    slug: 'ralph-implementation-skill',
    title: 'Ralph Implementation Skill Guide',
    description: 'Step-by-step guide to mastering autonomous AI coding with Ralph Wiggum loops, from basics to advanced patterns.',
    category: 'ralph-wiggum',
    relatedBlogPost: 'how-ralph-wiggum-became-biggest-name-in-ai',
    tags: ['implementation', 'skills', 'tutorial'],
  },
];

export function getTemplatesByCategory(categoryId: string): Template[] {
  return templates.filter(t => t.category === categoryId);
}

export function getCategoryById(categoryId: string): TemplateCategory | undefined {
  return categories.find(c => c.id === categoryId);
}

export function getTemplateBySlug(slug: string): Template | undefined {
  return templates.find(t => t.slug === slug);
}

export function getAllCategories(): TemplateCategory[] {
  return categories;
}

export function getFeaturedTemplates(): Template[] {
  return templates.filter(t => t.featured);
}


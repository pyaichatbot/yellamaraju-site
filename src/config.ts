export const SITE = {
  title: 'Praveen Srinag Yellamaraju',
  description: 'Production AI systems field guide for practitioners: architectures, evals, agent harnesses, reliability patterns, and operating checklists.',
  author: 'Praveen Srinag Yellamaraju',
  url: 'https://www.yellamaraju.com',
  image: '/images/praveen.jpg',
  locale: 'en-US',
  twitter: '@praveensrinagy', // Update with actual handle if available
  linkedin: 'www.linkedin.com/in/praveensrinagy',
  newsletter: {
    provider: 'beehiiv',
    formId: import.meta.env.PUBLIC_BEEHIIV_FORM_ID || '',
    enabled: Boolean(import.meta.env.PUBLIC_BEEHIIV_FORM_ID),
  },
};

export const NAV_ITEMS = [
  { label: 'Home', href: '/' },
  { label: 'Field Guide', href: '/blog' },
  { label: 'Tutorials', href: '/tutorials' },
  { label: 'Topics', href: '/topics' },
  {
    label: 'Build',
    href: '#',
    children: [
      {
        label: 'Developer Productivity',
        href: '/developer-productivity',
        description: 'Engineering workflows, tooling, and execution systems',
      },
      {
        label: 'Templates',
        href: '/templates',
        description: 'Reusable checklists, docs, and operating artifacts',
      },
    ],
  },
  {
    label: 'Labs',
    href: '#',
    children: [
      {
        label: 'AI Playground',
        href: 'https://pyaichatbot.github.io/ai-learning-playground/',
        description: 'Interactive learning labs and runnable examples',
      },
      {
        label: 'Subagent Evals',
        href: 'https://pyaichatbot.github.io/subagent-evals/',
        description: 'Evaluation harnesses for multi-agent behavior',
      },
    ],
  },
  { 
    label: 'About', 
    href: '#',
    children: [
      { label: 'About Me', href: '/about', description: 'Profile, focus areas, and projects' },
      { label: 'Resume', href: '/resume', description: 'Experience and background' },
      { label: 'Contact', href: '/contact', description: 'Start a conversation' }
    ]
  }
];

export const POSTS_PER_PAGE = 10;

export const TOPICS = [
  'AI/ML',
  'Agentic AI',
  'Prompt Engineering',
  'Architecture',
  'Cloud',
  'Leadership',
  'Career'
];

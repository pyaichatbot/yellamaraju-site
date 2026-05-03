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
  { label: 'Topics', href: '/topics' },
  { label: 'Developer Productivity', href: '/developer-productivity' },
  { 
    label: 'Assets', 
    href: '#',
    children: [
      { label: 'Templates', href: '/templates' }
    ]
  },
  { label: 'AI Playground', href: 'https://pyaichatbot.github.io/ai-learning-playground/' },
  { label: 'Subagent Evals', href: 'https://pyaichatbot.github.io/subagent-evals/' },
  { 
    label: 'About', 
    href: '#',
    children: [
      { label: 'About Me', href: '/about' },
      { label: 'Resume', href: '/resume' },
      { label: 'Contact', href: '/contact' }
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

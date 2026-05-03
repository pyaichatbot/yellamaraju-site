import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import ragIndexIntegration from './src/integrations/rag-index';

const hiddenBlogPaths = [
  '/blog/cca-foundations-agentic-architecture/',
  '/blog/cca-foundations-claude-code-config/',
  '/blog/cca-foundations-context-management/',
  '/blog/cca-foundations-learning-series-overview/',
  '/blog/cca-foundations-prompt-engineering/',
  '/blog/cca-foundations-tool-design-mcp/',
  '/blog/llm-living-knowledge-engine/',
  '/blog/understanding-llm-benchmarks-short-guide/',
];

// https://astro.build/config
export default defineConfig({
  site: 'https://www.yellamaraju.com',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !hiddenBlogPaths.some((path) => page.endsWith(path)),
    }),
    ragIndexIntegration(),
  ],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});

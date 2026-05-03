import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import ragIndexIntegration from './src/integrations/rag-index';

const hiddenSitemapPaths = ['/blog/understanding-llm-benchmarks-short-guide/'];

// https://astro.build/config
export default defineConfig({
  site: 'https://yellamaraju.com',
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !hiddenSitemapPaths.some((path) => page.endsWith(path)),
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

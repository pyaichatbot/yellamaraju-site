import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import ragIndexIntegration from './src/integrations/rag-index';

// https://astro.build/config
export default defineConfig({
  site: 'https://yellamaraju.com',
  integrations: [mdx(), sitemap(), ragIndexIntegration()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
      wrap: true
    }
  }
});

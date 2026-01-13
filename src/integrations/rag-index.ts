/**
 * Astro Integration: RAG Index Generator
 * 
 * Generates RAG index at build time
 * Story 10.1: Build-Time RAG Content Preparation
 */

import type { AstroIntegration } from 'astro';

export default function ragIndexIntegration(): AstroIntegration {
  return {
    name: 'rag-index-generator',
    hooks: {
      'astro:build:done': async ({ logger }) => {
        try {
          logger.info('🔍 Generating RAG index...');
          // Dynamic import to avoid loading astro:content at module level
          const { generateRAGIndex } = await import('../utils/generate-rag-index');
          await generateRAGIndex();
          logger.info('✅ RAG index generated successfully');
        } catch (error) {
          logger.error(`❌ Error generating RAG index: ${error instanceof Error ? error.message : String(error)}`);
          // Don't throw - allow build to complete even if RAG index fails
          logger.warn('⚠️  Build will continue but RAG index generation failed');
        }
      },
    },
  };
}

/**
 * Astro Integration: RAG Index Generator
 * 
 * Generates RAG index at build time by ensuring the API endpoint is built
 * Story 10.1: Build-Time RAG Content Preparation
 * 
 * Note: We use the API endpoint approach because astro:content cannot be
 * imported in integration hooks. The endpoint (rag-index.json.ts) has
 * proper access to astro:content and will generate the files during build.
 */

import type { AstroIntegration } from 'astro';

export default function ragIndexIntegration(): AstroIntegration {
  return {
    name: 'rag-index-generator',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        try {
          logger.info('🔍 Ensuring RAG index files are in dist/...');
          
          // The API endpoint (rag-index.json.ts) should have already generated
          // files to public/rag-index/ during the build. Now we copy them to dist/
          const { copyFile, mkdir, readdir } = await import('fs/promises');
          const { join } = await import('path');
          const { fileURLToPath } = await import('url');
          
          const publicDir = join(process.cwd(), 'public', 'rag-index');
          const distPath = fileURLToPath(dir);
          const distDir = join(distPath, 'rag-index');
          
          // Check if files exist in public/
          let files: string[] = [];
          try {
            files = await readdir(publicDir);
          } catch (error) {
            logger.warn('⚠️  RAG index files not found in public/. The API endpoint may not have run during build.');
            logger.warn('   This is expected if the endpoint was not built. Files will be generated on first request.');
            return;
          }
          
          // Create dist directory
          await mkdir(distDir, { recursive: true });
          
          // Copy all JSON files from public/rag-index/ to dist/rag-index/
          let copiedCount = 0;
          for (const file of files) {
            if (file.endsWith('.json')) {
              const sourcePath = join(publicDir, file);
              const destPath = join(distDir, file);
              await copyFile(sourcePath, destPath);
              copiedCount++;
            }
          }
          
          if (copiedCount > 0) {
            logger.info(`✅ Copied ${copiedCount} RAG index file(s) to dist/`);
          } else {
            logger.warn('⚠️  No RAG index files found to copy. The API endpoint may need to be called during build.');
          }
        } catch (error) {
          logger.error(`❌ Error copying RAG index files: ${error instanceof Error ? error.message : String(error)}`);
          // Don't throw - allow build to complete even if copy fails
          logger.warn('⚠️  Build will continue but RAG index files may not be available');
        }
      },
    },
  };
}

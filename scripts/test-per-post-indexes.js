#!/usr/bin/env node
/**
 * Test script for per-post RAG indexes
 * 
 * Tests that:
 * 1. Manifest file exists and is valid
 * 2. Each post's individual JSON file exists and is valid
 * 3. Chunks are properly structured
 * 4. Function can retrieve chunks from individual files
 * 
 * Usage:
 *   npm run test:per-post-indexes
 */

import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Test configuration
const TEST_POSTS_LIMIT = 3; // Test first 3 posts to keep output manageable

/**
 * Test manifest file
 */
async function testManifest() {
  console.log('📋 Testing manifest file...\n');
  
  const manifestPaths = [
    join(projectRoot, 'dist', 'rag-index', 'manifest.json'),
    join(projectRoot, 'public', 'rag-index', 'manifest.json'),
  ];
  
  let manifest = null;
  let manifestPath = null;
  
  for (const path of manifestPaths) {
    try {
      const content = await readFile(path, 'utf-8');
      manifest = JSON.parse(content);
      manifestPath = path;
      console.log(`✅ Manifest found at: ${path}`);
      break;
    } catch (error) {
      continue;
    }
  }
  
  if (!manifest) {
    console.error('❌ Manifest file not found in dist/ or public/');
    return null;
  }
  
  // Validate manifest structure
  console.log(`\n📊 Manifest Info:`);
  console.log(`   Version: ${manifest.version}`);
  console.log(`   Generated: ${manifest.generatedAt}`);
  console.log(`   Total Posts: ${manifest.posts?.length || 0}`);
  
  if (!manifest.posts || manifest.posts.length === 0) {
    console.error('❌ Manifest has no posts');
    return null;
  }
  
  console.log(`\n✅ Manifest validation passed\n`);
  return manifest;
}

/**
 * Test individual post index file
 */
async function testPostIndex(post, index) {
  const postNum = index + 1;
  console.log(`\n${'='.repeat(60)}`);
  console.log(`📄 Testing Post ${postNum}/${TEST_POSTS_LIMIT}: ${post.title}`);
  console.log(`   Slug: ${post.slug}`);
  console.log(`   Expected chunks: ${post.chunkCount}`);
  console.log(`   Index file: ${post.indexFile}`);
  
  // Find the actual file
  const indexPaths = [
    join(projectRoot, 'dist', 'rag-index', `${post.slug}.json`),
    join(projectRoot, 'public', 'rag-index', `${post.slug}.json`),
  ];
  
  let indexData = null;
  let indexPath = null;
  
  for (const path of indexPaths) {
    try {
      const content = await readFile(path, 'utf-8');
      indexData = JSON.parse(content);
      indexPath = path;
      break;
    } catch (error) {
      continue;
    }
  }
  
  if (!indexData) {
    console.error(`   ❌ Index file not found`);
    return false;
  }
  
  console.log(`   ✅ Index file found: ${indexPath}`);
  
  // Validate structure
  const checks = {
    hasVersion: !!indexData.version,
    hasGeneratedAt: !!indexData.generatedAt,
    hasChunks: Array.isArray(indexData.chunks),
    hasIndex: !!indexData.index,
    chunkCount: indexData.chunks?.length || 0,
  };
  
  console.log(`\n   📊 Validation:`);
  console.log(`      Version: ${checks.hasVersion ? '✅' : '❌'} ${indexData.version || 'missing'}`);
  console.log(`      Generated: ${checks.hasGeneratedAt ? '✅' : '❌'} ${indexData.generatedAt || 'missing'}`);
  console.log(`      Chunks array: ${checks.hasChunks ? '✅' : '❌'}`);
  console.log(`      Lunr index: ${checks.hasIndex ? '✅' : '❌'}`);
  console.log(`      Chunk count: ${checks.chunkCount} (expected: ${post.chunkCount})`);
  
  if (checks.chunkCount !== post.chunkCount) {
    console.warn(`      ⚠️  Chunk count mismatch!`);
  }
  
  // Validate chunk structure
  if (checks.hasChunks && checks.chunkCount > 0) {
    const firstChunk = indexData.chunks[0];
    const chunkChecks = {
      hasText: typeof firstChunk.text === 'string' && firstChunk.text.length > 0,
      hasMetadata: !!firstChunk.metadata,
      hasChunkId: !!firstChunk.metadata?.chunkId,
      hasPostUrl: !!firstChunk.metadata?.postUrl,
      hasPostTitle: !!firstChunk.metadata?.postTitle,
      hasPostSlug: !!firstChunk.metadata?.postSlug,
      chunkIdFormat: firstChunk.metadata?.chunkId?.startsWith(post.slug) || false,
    };
    
    console.log(`\n   🔍 Chunk Structure (first chunk):`);
    console.log(`      Text: ${chunkChecks.hasText ? '✅' : '❌'} (${firstChunk.text.length} chars)`);
    console.log(`      Metadata: ${chunkChecks.hasMetadata ? '✅' : '❌'}`);
    console.log(`      Chunk ID: ${chunkChecks.hasChunkId ? '✅' : '❌'} ${firstChunk.metadata?.chunkId || 'missing'}`);
    console.log(`      Post URL: ${chunkChecks.hasPostUrl ? '✅' : '❌'}`);
    console.log(`      Post Title: ${chunkChecks.hasPostTitle ? '✅' : '❌'}`);
    console.log(`      Post Slug: ${chunkChecks.hasPostSlug ? '✅' : '❌'}`);
    console.log(`      ID Format: ${chunkChecks.chunkIdFormat ? '✅' : '❌'} (should start with "${post.slug}")`);
    
    // Test Lunr index
    if (checks.hasIndex) {
      try {
        const lunr = await import('lunr');
        const index = lunr.default.Index.load(indexData.index);
        console.log(`\n   🔎 Lunr Index:`);
        console.log(`      ✅ Index loaded successfully`);
        console.log(`      Fields: ${indexData.index.fields?.join(', ') || 'unknown'}`);
        
        // Try a simple search
        const searchResults = index.search('production');
        console.log(`      Test search ("production"): ${searchResults.length} results`);
      } catch (lunrError) {
        console.error(`      ❌ Failed to load Lunr index: ${lunrError.message}`);
      }
    }
    
    // Validate all chunks have consistent structure
    let allValid = true;
    for (let i = 0; i < Math.min(5, checks.chunkCount); i++) {
      const chunk = indexData.chunks[i];
      if (!chunk.metadata?.chunkId || !chunk.text) {
        allValid = false;
        console.warn(`      ⚠️  Chunk ${i} has missing fields`);
      }
    }
    
    if (allValid) {
      console.log(`      ✅ Sample chunks validated`);
    }
  }
  
  const allChecksPassed = 
    checks.hasVersion &&
    checks.hasGeneratedAt &&
    checks.hasChunks &&
    checks.hasIndex &&
    checks.chunkCount > 0 &&
    checks.chunkCount === post.chunkCount;
  
  if (allChecksPassed) {
    console.log(`\n   ✅ Post index validation PASSED`);
    return true;
  } else {
    console.log(`\n   ❌ Post index validation FAILED`);
    return false;
  }
}

/**
 * Test function can retrieve chunks from individual files
 */
async function testFunctionWithChunks(post, indexData) {
  console.log(`\n   🧪 Testing function retrieval...`);
  
  if (!indexData.chunks || indexData.chunks.length === 0) {
    console.log(`      ⚠️  No chunks to test`);
    return false;
  }
  
  // Get first chunk ID
  const chunkId = indexData.chunks[0].metadata.chunkId;
  const functionUrl = process.env.FUNCTION_URL || 'http://localhost:9999/.netlify/functions/chat';
  
  try {
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:9999',
      },
      body: JSON.stringify({
        query: 'test query',
        chunkIds: [chunkId],
      }),
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.chunks && data.chunks.length > 0) {
        console.log(`      ✅ Function retrieved chunk successfully`);
        console.log(`      Retrieved: ${data.chunks[0].chunkId}`);
        return true;
      } else {
        console.log(`      ⚠️  Function responded but no chunks returned`);
        return false;
      }
    } else {
      console.log(`      ⚠️  Function returned ${response.status} (server may not be running)`);
      return false;
    }
  } catch (error) {
    console.log(`      ⚠️  Function test skipped (server not running): ${error.message}`);
    return false;
  }
}

/**
 * Main test function
 */
async function runTests() {
  console.log('🧪 Testing Per-Post RAG Indexes\n');
  console.log('='.repeat(60));
  
  // Test manifest
  const manifest = await testManifest();
  if (!manifest) {
    console.error('\n❌ Manifest test failed. Cannot continue.');
    process.exit(1);
  }
  
  // Test individual post indexes
  const postsToTest = manifest.posts.slice(0, TEST_POSTS_LIMIT);
  const results = [];
  
  for (let i = 0; i < postsToTest.length; i++) {
    const post = postsToTest[i];
    const passed = await testPostIndex(post, i);
    results.push({ post: post.title, passed });
    
    // Also test function retrieval if index is valid
    if (passed) {
      // Load the index data again for function test
      const indexPaths = [
        join(projectRoot, 'dist', 'rag-index', `${post.slug}.json`),
        join(projectRoot, 'public', 'rag-index', `${post.slug}.json`),
      ];
      
      for (const indexPath of indexPaths) {
        try {
          const content = await readFile(indexPath, 'utf-8');
          const indexData = JSON.parse(content);
          await testFunctionWithChunks(post, indexData);
          break;
        } catch (error) {
          continue;
        }
      }
    }
  }
  
  // Summary
  console.log(`\n${'='.repeat(60)}`);
  console.log('📊 Test Summary\n');
  
  const passedCount = results.filter(r => r.passed).length;
  const totalCount = results.length;
  
  results.forEach((result, index) => {
    const status = result.passed ? '✅' : '❌';
    console.log(`${status} ${index + 1}. ${result.post}`);
  });
  
  console.log(`\n📈 Results: ${passedCount}/${totalCount} posts passed`);
  
  if (passedCount === totalCount) {
    console.log('\n✅ All per-post index tests PASSED!');
    process.exit(0);
  } else {
    console.log('\n❌ Some tests failed. Check the output above for details.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('\n❌ Test execution failed:', error);
  process.exit(1);
});

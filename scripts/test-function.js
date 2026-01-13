#!/usr/bin/env node
/**
 * Test script for Netlify Function locally
 * 
 * Usage:
 *   npm run test:function
 * 
 * Or with custom query:
 *   npm run test:function -- "your question here"
 */

const testQuery = process.argv[2] || "What are the key takeaways?";

/**
 * Load real chunk IDs from RAG index files (file system)
 * netlify functions:serve doesn't serve static files, so we read from disk
 */
async function getRealChunkIds() {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');
    const { fileURLToPath } = await import('url');
    const { dirname } = await import('path');
    
    // Get project root directory
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const projectRoot = path.join(__dirname, '..');
    
    // Try to load manifest from file system
    const manifestPaths = [
      path.join(projectRoot, 'dist', 'rag-index', 'manifest.json'),
      path.join(projectRoot, 'public', 'rag-index', 'manifest.json'),
    ];
    
    let manifest = null;
    for (const manifestPath of manifestPaths) {
      try {
        const manifestContent = await fs.readFile(manifestPath, 'utf-8');
        manifest = JSON.parse(manifestContent);
        console.log(`✅ Loaded manifest from: ${manifestPath}`);
        break;
      } catch (e) {
        // Try next path
        continue;
      }
    }
    
    if (manifest && manifest.posts && manifest.posts.length > 0) {
      // Get first post's index file
      const firstPost = manifest.posts[0];
      const indexPaths = [
        path.join(projectRoot, 'dist', 'rag-index', `${firstPost.slug}.json`),
        path.join(projectRoot, 'public', 'rag-index', `${firstPost.slug}.json`),
      ];
      
      for (const indexPath of indexPaths) {
        try {
          const indexContent = await fs.readFile(indexPath, 'utf-8');
          const indexData = JSON.parse(indexContent);
          
          if (indexData.chunks && indexData.chunks.length > 0) {
            // Return first 2 chunk IDs
            const chunkIds = indexData.chunks.slice(0, 2).map(chunk => chunk.metadata.chunkId);
            console.log(`✅ Loaded ${chunkIds.length} chunk IDs from: ${indexPath}`);
            return chunkIds;
          }
        } catch (e) {
          // Try next path
          continue;
        }
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not load real chunk IDs from file system:', error.message);
  }
  
  // Fallback: return empty array (function should handle this gracefully)
  return [];
}

async function testFunction() {
  const functionUrl = process.env.FUNCTION_URL || 'http://localhost:9999/.netlify/functions/chat';
  
  console.log('🧪 Testing Netlify Function locally...\n');
  console.log(`📍 Function URL: ${functionUrl}`);
  console.log(`💬 Test Query: "${testQuery}"\n`);

  // Try to get real chunk IDs, fallback to empty array
  const chunkIds = await getRealChunkIds();
  console.log(`📦 Using ${chunkIds.length} chunk IDs: ${chunkIds.length > 0 ? chunkIds.join(', ') : '(empty - testing graceful handling)'}\n`);

  const testPayload = {
    query: testQuery,
    currentUrl: '/blog/test-post/',
    chunkIds: chunkIds,
  };

  try {
    console.log('📤 Sending POST request...');
    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:9999',
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`);
    console.log('📋 Response Headers:');
    response.headers.forEach((value, key) => {
      console.log(`   ${key}: ${value}`);
    });

    // Try to get response as text first to see what we're getting
    const responseText = await response.text();
    console.log('\n📦 Response Body (raw):');
    console.log(responseText);
    
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('\n📦 Response Body (parsed):');
      console.log(JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('\n❌ Failed to parse response as JSON');
      console.error('Response was:', responseText.substring(0, 200));
      return 1;
    }

    if (response.ok && data.success) {
      console.log('\n✅ Test PASSED - Function responded successfully!');
      return 0;
    } else {
      console.log('\n❌ Test FAILED - Function returned error');
      return 1;
    }
  } catch (error) {
    console.error('\n❌ Test FAILED - Error occurred:');
    console.error(error.message);
    
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Tip: The function server is not running!');
      console.error('\n   Start the server in a separate terminal:');
      console.error('   npm run functions:serve');
      console.error('\n   Or run the full dev server:');
      console.error('   npm run dev:netlify');
      console.error('\n   Then run this test again in another terminal.');
    } else {
      console.error('\n💡 Check:');
      console.error('   1. Function server is running');
      console.error('   2. Function URL is correct:', functionUrl);
      console.error('   3. No firewall blocking localhost:9999');
    }
    
    return 1;
  }
}

// Test OPTIONS (CORS preflight)
async function testCORS() {
  const functionUrl = process.env.FUNCTION_URL || 'http://localhost:9999/.netlify/functions/chat';
  
  console.log('\n🌐 Testing CORS preflight (OPTIONS)...');
  
  try {
    const response = await fetch(functionUrl, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:9999',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'Content-Type',
      },
    });

    console.log(`Status: ${response.status}`);
    if (response.status === 204) {
      console.log('✅ CORS preflight PASSED');
      return true;
    } else {
      console.log('❌ CORS preflight FAILED');
      return false;
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.message.includes('fetch failed')) {
      console.error('❌ CORS test error: Server not running');
      console.error('   Start server with: npm run functions:serve');
    } else {
      console.error('❌ CORS test error:', error.message);
    }
    return false;
  }
}

// Run tests
(async () => {
  const corsOk = await testCORS();
  const result = await testFunction();
  process.exit(result);
})();

#!/usr/bin/env node
/**
 * Test script that starts the function server and then tests it
 * 
 * Usage:
 *   npm run test:function:auto
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const testQuery = process.argv[2] || "What are the key takeaways?";
const FUNCTION_URL = 'http://localhost:9999/.netlify/functions/chat';
const MAX_WAIT_TIME = 30000; // 30 seconds

console.log('🚀 Starting function server and testing...\n');

// Start the function server
const serverProcess = spawn('npm', ['run', 'functions:serve'], {
  cwd: join(__dirname, '..'),
  stdio: ['ignore', 'pipe', 'pipe'],
  shell: true,
});

let serverReady = false;
let serverOutput = '';

// Wait for server to be ready
serverProcess.stdout.on('data', (data) => {
  const output = data.toString();
  serverOutput += output;
  process.stdout.write(output);
  
  // Check if server is ready (Netlify CLI outputs specific messages)
  if (output.includes('Server now ready') || 
      output.includes('Functions server is listening') ||
      output.includes('localhost:9999')) {
    serverReady = true;
  }
});

serverProcess.stderr.on('data', (data) => {
  const output = data.toString();
  serverOutput += output;
  process.stderr.write(output);
});

// Wait for server to be ready, then test
const waitForServer = async () => {
  const startTime = Date.now();
  
  while (!serverReady && (Date.now() - startTime) < MAX_WAIT_TIME) {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Try to ping the server
    try {
      const response = await fetch(FUNCTION_URL, {
        method: 'OPTIONS',
        signal: AbortSignal.timeout(1000),
      });
      if (response.status === 204 || response.status === 405) {
        serverReady = true;
        break;
      }
    } catch (e) {
      // Server not ready yet, continue waiting
    }
  }
  
  if (!serverReady) {
    console.error('\n❌ Server did not start within 30 seconds');
    serverProcess.kill();
    process.exit(1);
  }
  
  return true;
};

// Run the test
const runTest = async () => {
  console.log('\n✅ Server is ready! Running tests...\n');
  
  // Import and run the test
  const { default: testFunction } = await import('./test-function.js');
  
  // Set environment variable for test script
  process.env.FUNCTION_URL = FUNCTION_URL;
  
  // Run the test
  const testPayload = {
    query: testQuery,
    currentUrl: '/blog/test-post/',
    chunkIds: ['test-post-chunk-0', 'test-post-chunk-1'],
  };

  try {
    console.log('📤 Sending POST request...');
    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:9999',
      },
      body: JSON.stringify(testPayload),
    });

    console.log(`\n📊 Response Status: ${response.status} ${response.statusText}`);
    const data = await response.json();
    console.log('\n📦 Response Body:');
    console.log(JSON.stringify(data, null, 2));

    if (response.ok && data.success) {
      console.log('\n✅ Test PASSED!');
      serverProcess.kill();
      process.exit(0);
    } else {
      console.log('\n❌ Test FAILED');
      serverProcess.kill();
      process.exit(1);
    }
  } catch (error) {
    console.error('\n❌ Test error:', error.message);
    serverProcess.kill();
    process.exit(1);
  }
};

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\n🛑 Stopping server...');
  serverProcess.kill();
  process.exit(0);
});

// Start the process
waitForServer().then(() => {
  // Give server a moment to fully initialize
  setTimeout(runTest, 2000);
});

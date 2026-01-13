/**
 * Netlify Function: Chat API Endpoint
 * 
 * Serverless API endpoint for Ask Praveen.AI chatbot.
 * Handles chat requests, validates input, retrieves chunks, and returns responses.
 * 
 * Story 10.4: Netlify Function Chat API Endpoint
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import type { RAGIndex, Chunk } from '../../src/utils/generate-rag-index';

// Site configuration
const SITE_URL = 'https://www.yellamaraju.com';
const ALLOWED_ORIGINS = [
  'https://www.yellamaraju.com',
  'https://yellamaraju.com',
  'http://localhost:4321', // Astro dev server
  'http://localhost:8888', // Netlify dev (default)
  'http://localhost:9999', // Netlify dev (custom port)
];

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds
const RATE_LIMIT_MAX = 10; // 10 requests per window
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Request validation
interface ChatRequest {
  query: string;
  currentUrl?: string;
  chunkIds: string[];
}

interface ChatResponse {
  success: boolean;
  answer?: string;
  citations?: string[];
  chunks?: Array<{
    chunkId: string;
    text: string;
    postUrl: string;
    postTitle: string;
  }>;
  error?: string;
  rateLimit?: {
    remaining: number;
    resetAt: number;
  };
}

/**
 * Check rate limit for IP address
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
    // Reset window
    const resetAt = now + RATE_LIMIT_WINDOW;
    rateLimitStore.set(ip, { count: 1, resetAt });
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  record.count++;
  return { allowed: true, remaining: RATE_LIMIT_MAX - record.count, resetAt: record.resetAt };
}

/**
 * Get client IP address from request
 */
function getClientIP(event: HandlerEvent): string {
  // Try various headers (Netlify, Cloudflare, etc.)
  const forwardedFor = event.headers['x-forwarded-for'];
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() || 'unknown';
  }
  
  return (
    event.headers['x-real-ip'] ||
    event.headers['cf-connecting-ip'] ||
    event.headers['x-client-ip'] ||
    'unknown'
  );
}

/**
 * Validate origin header
 */
function validateOrigin(origin: string | null): boolean {
  if (!origin) return false;
  
  // Allow requests from allowed origins
  return ALLOWED_ORIGINS.some(allowed => {
    if (origin === allowed) return true;
    // Allow subdomains in development
    if (allowed.includes('localhost') && origin.includes('localhost')) return true;
    return false;
  });
}

/**
 * Validate request body
 */
function validateRequest(body: any): { valid: boolean; error?: string; data?: ChatRequest } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { query, currentUrl, chunkIds } = body;

  // Validate query
  if (!query || typeof query !== 'string') {
    return { valid: false, error: 'Query is required and must be a string' };
  }

  if (query.trim().length === 0) {
    return { valid: false, error: 'Query cannot be empty' };
  }

  if (query.length > 500) {
    return { valid: false, error: 'Query exceeds maximum length of 500 characters' };
  }

  // Validate chunkIds
  if (!Array.isArray(chunkIds)) {
    return { valid: false, error: 'chunkIds must be an array' };
  }

  if (chunkIds.length > 10) {
    return { valid: false, error: 'Maximum 10 chunkIds allowed' };
  }

  // Validate chunkId format
  for (const chunkId of chunkIds) {
    if (typeof chunkId !== 'string' || !chunkId.trim()) {
      return { valid: false, error: 'Invalid chunkId format' };
    }
  }

  return {
    valid: true,
    data: {
      query: query.trim(),
      currentUrl: currentUrl || undefined,
      chunkIds: chunkIds.filter((id: string) => id.trim()),
    },
  };
}

/**
 * Load RAG index from static file
 * In production, this would be loaded from Netlify Blobs or CDN
 * For now, we fetch from the deployed site's public directory
 */
async function loadRAGIndex(): Promise<RAGIndex> {
  try {
    // First, try to load from file system (for local development)
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      // Try multiple possible paths
      const possiblePaths = [
        path.join(process.cwd(), 'public', 'rag-index.json'),
        path.join(process.cwd(), 'dist', 'rag-index.json'),
        path.join(process.cwd(), '..', 'public', 'rag-index.json'),
      ];
      
      for (const indexPath of possiblePaths) {
        try {
          const fileContent = await fs.readFile(indexPath, 'utf-8');
          const ragIndex = JSON.parse(fileContent) as RAGIndex;
          
          if (ragIndex && ragIndex.chunks && ragIndex.index) {
            console.log(`✅ Loaded RAG index from file system: ${indexPath}`);
            return ragIndex;
          }
        } catch (fileError) {
          // File doesn't exist or invalid, try next path
          continue;
        }
      }
    } catch (fsError) {
      // File system access failed, fall back to HTTP
      console.log('File system access failed, trying HTTP...');
    }
    
    // Fall back to HTTP fetch (for production or when file system not available)
    const possibleUrls = [
      'http://localhost:9999/rag-index.json', // Netlify dev (custom port)
      'http://localhost:8888/rag-index.json', // Netlify dev (default port)
      'http://localhost:4321/rag-index.json', // Astro dev
      `${SITE_URL}/rag-index.json`,
      'https://yellamaraju.com/rag-index.json',
    ];
    
    let ragIndex: RAGIndex | null = null;
    let lastError: Error | null = null;
    
    for (const url of possibleUrls) {
      try {
        const response = await fetch(url, {
          headers: {
            'Accept': 'application/json',
          },
        });
        
        if (response.ok) {
          ragIndex = await response.json();
          if (ragIndex && ragIndex.chunks && ragIndex.index) {
            console.log(`✅ Loaded RAG index from HTTP: ${url}`);
            return ragIndex;
          }
        }
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        continue;
      }
    }
    
    throw lastError || new Error('Failed to load RAG index from file system or any URL');
  } catch (error) {
    console.error('Error loading RAG index:', error);
    throw new Error(`Failed to load RAG index: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get chunks by IDs from RAG index
 */
function getChunksByIds(ragIndex: RAGIndex, chunkIds: string[]): Chunk[] {
  const chunksMap = new Map<string, Chunk>();
  
  // Build map for quick lookup
  ragIndex.chunks.forEach(chunk => {
    chunksMap.set(chunk.metadata.chunkId, chunk);
  });

  // Retrieve requested chunks
  const chunks: Chunk[] = [];
  for (const chunkId of chunkIds) {
    const chunk = chunksMap.get(chunkId);
    if (chunk) {
      chunks.push(chunk);
    } else {
      console.warn(`Chunk not found: ${chunkId}`);
    }
  }

  return chunks;
}

/**
 * Create CORS headers
 */
function createCORSHeaders(origin: string | null): Record<string, string> {
  const allowedOrigin = validateOrigin(origin) ? origin! : ALLOWED_ORIGINS[0];
  
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400', // 24 hours
  };
}

/**
 * Main handler function
 */
export const handler = async (
  event: HandlerEvent,
  context: HandlerContext
) => {
  const startTime = Date.now();
  const origin: string | null = event.headers.origin || event.headers.referer || null;

  // Handle OPTIONS (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: createCORSHeaders(origin),
    };
  }

  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        ...createCORSHeaders(origin),
      },
      body: JSON.stringify({ success: false, error: 'Method not allowed' }),
    };
  }

  try {
    // Validate origin
    if (!validateOrigin(origin)) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          ...createCORSHeaders(null),
        },
        body: JSON.stringify({ success: false, error: 'Origin not allowed' }),
      };
    }

    // Check rate limit
    const clientIP = getClientIP(event);
    const rateLimit = checkRateLimit(clientIP);

    if (!rateLimit.allowed) {
      return {
        statusCode: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
          'X-RateLimit-Reset': String(rateLimit.resetAt),
          'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          ...createCORSHeaders(origin),
        },
        body: JSON.stringify({
          success: false,
          error: 'Rate limit exceeded',
          rateLimit: {
            remaining: rateLimit.remaining,
            resetAt: rateLimit.resetAt,
          },
        }),
      };
    }

    // Parse and validate request body
    let body: any;
    try {
      body = JSON.parse(event.body || '{}');
    } catch (error) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          ...createCORSHeaders(origin),
        },
        body: JSON.stringify({ success: false, error: 'Invalid JSON in request body' }),
      };
    }

    const validation = validateRequest(body);
    if (!validation.valid) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          ...createCORSHeaders(origin),
        },
        body: JSON.stringify({ success: false, error: validation.error }),
      };
    }

    const { query, chunkIds } = validation.data!;

    // Load RAG index
    let ragIndex: RAGIndex;
    try {
      ragIndex = await loadRAGIndex();
    } catch (error) {
      console.error('Failed to load RAG index:', error);
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json',
          ...createCORSHeaders(origin),
        },
        body: JSON.stringify({
          success: false,
          error: 'Failed to load content index. Please try again later.',
        }),
      };
    }

    // Get chunks by IDs
    const chunks = getChunksByIds(ragIndex, chunkIds);

    // If no chunks provided or found, return a helpful message instead of error
    // This allows the function to work even when client-side search hasn't found chunks yet
    if (chunks.length === 0) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createCORSHeaders(origin),
        },
        body: JSON.stringify({
          success: true,
          answer: `I received your query: "${query}". However, no specific content chunks were provided. ` +
            `This might happen if the client-side search hasn't loaded yet, or if the query doesn't match any indexed content. ` +
            `\n\n*Note: Full RAG search and LLM processing will be available once Story 10.3 (client-side search) and Story 10.5 (LLM integration) are complete.*`,
          citations: [],
          chunks: [],
          rateLimit: {
            remaining: rateLimit.remaining,
            resetAt: rateLimit.resetAt,
          },
        }),
      };
    }

    // Extract citations (unique post URLs)
    const citations: string[] = Array.from(
      new Set(chunks.map(chunk => chunk.metadata.postUrl))
    );

    // Prepare response
    // Note: LLM processing will be added in Story 10.5
    // For now, return chunks with a useful preview of the relevant content
    let answer = `I found ${chunks.length} relevant section(s) from the blog that match your query: "${query}".\n\n`;
    
    // Show preview of top chunks (up to 3)
    const previewChunks = chunks.slice(0, 3);
    previewChunks.forEach((chunk, index) => {
      const previewText = chunk.text.length > 300 
        ? chunk.text.substring(0, 300) + '...' 
        : chunk.text;
      answer += `**${index + 1}. From "${chunk.metadata.postTitle}":**\n${previewText}\n\n`;
    });
    
    if (chunks.length > 3) {
      answer += `*...and ${chunks.length - 3} more relevant section(s).*\n\n`;
    }
    
    answer += `*Note: Full AI-powered answers with natural language processing will be available in Story 10.5 (LLM integration). For now, you can see the relevant content excerpts above and click the citation links to read the full posts.*`;
    
    const response: ChatResponse = {
      success: true,
      answer,
      citations,
      chunks: chunks.map(chunk => ({
        chunkId: chunk.metadata.chunkId,
        text: chunk.text,
        postUrl: chunk.metadata.postUrl,
        postTitle: chunk.metadata.postTitle,
      })),
      rateLimit: {
        remaining: rateLimit.remaining,
        resetAt: rateLimit.resetAt,
      },
    };

    const duration = Date.now() - startTime;
    console.log(`Chat API: ${duration}ms - Query: "${query.substring(0, 50)}..." - Chunks: ${chunks.length}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': String(rateLimit.resetAt),
        ...createCORSHeaders(origin),
      },
      body: JSON.stringify(response),
    };
  } catch (error) {
    console.error('Chat API error:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        ...createCORSHeaders(origin),
      },
      body: JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Internal server error',
      }),
    };
  }
};

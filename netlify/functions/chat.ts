/**
 * Netlify Function: Chat API Endpoint with Groq LLM Integration
 * 
 * Serverless API endpoint for Ask Praveen.AI chatbot.
 * Handles chat requests, retrieves chunks, calls Groq LLM, and returns AI-powered responses.
 * 
 * Enhanced with:
 * - Groq LLM integration (llama-3.3-70b-versatile)
 * - Smart chunk loading (per-post indexes)
 * - Better error handling
 * - Streaming support (optional)
 */

import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import type { RAGIndex, Chunk } from '../../src/utils/generate-rag-index';

// Configuration
const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const SITE_URL = process.env.URL || 'https://yellamaraju.com';
const PRODUCTION_URL = 'https://yellamaraju.com';
const IS_PRODUCTION = !process.env.NETLIFY_DEV;

const ALLOWED_ORIGINS = [
  'https://www.yellamaraju.com',
  'https://yellamaraju.com',
  'http://localhost:4321', // Astro dev
  'http://localhost:8888', // Netlify dev
  'http://localhost:9999', // Netlify dev (custom)
  'http://127.0.0.1:4321',
  'http://127.0.0.1:8888',
];

// Rate limiting
const RATE_LIMIT_WINDOW = 60 * 1000; // 60 seconds
const RATE_LIMIT_MAX = 10; // 10 requests per minute
const rateLimitStore = new Map<string, { count: number; resetAt: number }>();

// Interfaces
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
  tokensUsed?: number;
  processingTime?: number;
}

/**
 * Check rate limit for IP
 */
function checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetAt) {
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
 * Get client IP
 */
function getClientIP(event: HandlerEvent): string {
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
 * Validate origin
 */
function validateOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGINS.some(allowed => {
    if (origin === allowed) return true;
    if (allowed.includes('localhost') && origin.includes('localhost')) return true;
    if (allowed.includes('127.0.0.1') && origin.includes('127.0.0.1')) return true;
    return false;
  });
}

/**
 * Validate request
 */
function validateRequest(body: any): { valid: boolean; error?: string; data?: ChatRequest } {
  if (!body || typeof body !== 'object') {
    return { valid: false, error: 'Invalid request body' };
  }

  const { query, currentUrl, chunkIds } = body;

  if (!query || typeof query !== 'string') {
    return { valid: false, error: 'Query is required and must be a string' };
  }

  if (query.trim().length === 0) {
    return { valid: false, error: 'Query cannot be empty' };
  }

  if (query.length > 1000) { // Increased from 500 for complex questions
    return { valid: false, error: 'Query exceeds maximum length of 1000 characters' };
  }

  if (!Array.isArray(chunkIds)) {
    return { valid: false, error: 'chunkIds must be an array' };
  }

  if (chunkIds.length > 15) { // Increased from 10 for better context
    return { valid: false, error: 'Maximum 15 chunkIds allowed' };
  }

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
 * Extract post slug from URL
 */
function extractPostSlug(url: string): string | null {
  try {
    let path = url;
    if (url.includes('://')) {
      try {
        const urlObj = new URL(url);
        path = urlObj.pathname;
      } catch {
        const match = url.match(/\/blog\/([^\/\?#]+)/);
        return match ? match[1] : null;
      }
    }
    
    const match = path.match(/\/blog\/([^\/\?#]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}

/**
 * Load per-post RAG index (optimized for serverless)
 */
async function loadPostRAGIndex(postSlug: string): Promise<RAGIndex | null> {
  try {
    // Try file system first (faster in serverless)
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const possiblePaths = [
        path.join(process.cwd(), 'public', 'rag-index', `${postSlug}.json`),
        path.join(process.cwd(), 'dist', 'rag-index', `${postSlug}.json`),
        path.join(process.cwd(), '..', 'public', 'rag-index', `${postSlug}.json`),
      ];
      
      for (const indexPath of possiblePaths) {
        try {
          const content = await fs.readFile(indexPath, 'utf-8');
          const ragIndex = JSON.parse(content) as RAGIndex;
          if (ragIndex && ragIndex.chunks && ragIndex.index) {
            console.log(`✅ Loaded per-post index from file: ${postSlug}`);
            return ragIndex;
          }
        } catch {
          continue;
        }
      }
    } catch {
      // Fall through to HTTP
    }
    
    // HTTP fallback
    const urls = IS_PRODUCTION
      ? [
          `${PRODUCTION_URL}/rag-index/${postSlug}.json`,
          `https://www.yellamaraju.com/rag-index/${postSlug}.json`,
        ]
      : [
          `http://localhost:9999/rag-index/${postSlug}.json`,
          `http://localhost:8888/rag-index/${postSlug}.json`,
          `http://localhost:4321/rag-index/${postSlug}.json`,
          `${PRODUCTION_URL}/rag-index/${postSlug}.json`,
        ];
    
    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(url, {
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
        });
        
        clearTimeout(timeout);
        
        if (response.ok) {
          const ragIndex = await response.json();
          if (ragIndex && ragIndex.chunks && ragIndex.index) {
            console.log(`✅ Loaded per-post index from HTTP: ${postSlug}`);
            return ragIndex;
          }
        }
      } catch {
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error(`Failed to load per-post index for ${postSlug}:`, error);
    return null;
  }
}

/**
 * Load legacy RAG index (fallback)
 */
async function loadLegacyRAGIndex(): Promise<RAGIndex | null> {
  try {
    // Try file system
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const possiblePaths = [
        path.join(process.cwd(), 'public', 'rag-index.json'),
        path.join(process.cwd(), 'dist', 'rag-index.json'),
        path.join(process.cwd(), '..', 'public', 'rag-index.json'),
      ];
      
      for (const indexPath of possiblePaths) {
        try {
          const content = await fs.readFile(indexPath, 'utf-8');
          const ragIndex = JSON.parse(content) as RAGIndex;
          if (ragIndex && ragIndex.chunks && ragIndex.index) {
            console.log(`✅ Loaded legacy index from file`);
            return ragIndex;
          }
        } catch {
          continue;
        }
      }
    } catch {
      // Fall through
    }
    
    // HTTP fallback
    const urls = IS_PRODUCTION
      ? [`${PRODUCTION_URL}/rag-index.json`]
      : [
          'http://localhost:9999/rag-index.json',
          'http://localhost:8888/rag-index.json',
          'http://localhost:4321/rag-index.json',
          `${PRODUCTION_URL}/rag-index.json`,
        ];
    
    for (const url of urls) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(url, {
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
        });
        
        clearTimeout(timeout);
        
        if (response.ok) {
          const ragIndex = await response.json();
          if (ragIndex && ragIndex.chunks && ragIndex.index) {
            console.log(`✅ Loaded legacy index from HTTP`);
            return ragIndex;
          }
        }
      } catch {
        continue;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Failed to load legacy RAG index:', error);
    return null;
  }
}

/**
 * Get chunks by IDs
 */
function getChunksByIds(ragIndex: RAGIndex, chunkIds: string[]): Chunk[] {
  const chunksMap = new Map<string, Chunk>();
  ragIndex.chunks.forEach(chunk => {
    chunksMap.set(chunk.metadata.chunkId, chunk);
  });

  const chunks: Chunk[] = [];
  for (const chunkId of chunkIds) {
    const chunk = chunksMap.get(chunkId);
    if (chunk) {
      chunks.push(chunk);
    }
  }

  return chunks;
}

/**
 * Call Groq LLM API
 */
async function callGroqLLM(query: string, chunks: Chunk[]): Promise<{ answer: string; tokensUsed: number }> {
  if (!GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY not configured. Please set it in your Netlify environment variables.');
  }

  // Build context from chunks
  const context = chunks
    .map((chunk, i) => {
      const sectionInfo = chunk.metadata.sectionTitle 
        ? `## ${chunk.metadata.sectionTitle}\n\n`
        : '';
      return `[Chunk ${i + 1} from "${chunk.metadata.postTitle}"]\n${sectionInfo}${chunk.text}`;
    })
    .join('\n\n---\n\n');

  // System prompt
  const systemPrompt = `You are Praveen.AI, an AI assistant helping users understand blog posts by Praveen Yellamaraju, an AI Architect specializing in enterprise AI systems, RAG, agents, and production AI implementations.

Your role:
- Answer questions about the blog content provided below
- Use ONLY information from the provided content - do not make up information
- Be concise but thorough (aim for 2-4 paragraphs)
- Reference specific sections or concepts when helpful
- If the content doesn't fully answer the question, say so honestly
- Use a professional but conversational tone
- Format your response with markdown for readability

Blog Post Content:
${context}`;

  const userPrompt = `Question: ${query}

Please answer based on the blog post content provided. If you need to reference specific sections, mention them by name.`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // Fast + smart
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.3, // Low for factual accuracy
        max_tokens: 1500, // Increased for detailed answers
        top_p: 0.9,
        frequency_penalty: 0.1, // Slight penalty to avoid repetition
        presence_penalty: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', errorText);
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const answer = data.choices[0]?.message?.content;
    const tokensUsed = data.usage?.total_tokens || 0;

    if (!answer) {
      throw new Error('No answer generated by LLM');
    }

    return { answer, tokensUsed };
  } catch (error) {
    console.error('Groq API call failed:', error);
    throw error;
  }
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
    'Access-Control-Max-Age': '86400',
  };
}

/**
 * Main handler
 */
export const handler: Handler = async (event, context) => {
  const startTime = Date.now();
  const origin = event.headers.origin || event.headers.referer || null;

  // Handle OPTIONS (CORS preflight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: createCORSHeaders(origin),
    };
  }

  // Only POST allowed
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
      console.warn(`Invalid origin: ${origin}`);
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
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': String(rateLimit.resetAt),
          'Retry-After': String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)),
          ...createCORSHeaders(origin),
        },
        body: JSON.stringify({
          success: false,
          error: 'Rate limit exceeded. Please wait before trying again.',
          rateLimit: {
            remaining: 0,
            resetAt: rateLimit.resetAt,
          },
        }),
      };
    }

    // Parse request
    let body: any;
    try {
      body = JSON.parse(event.body || '{}');
    } catch {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          ...createCORSHeaders(origin),
        },
        body: JSON.stringify({ success: false, error: 'Invalid JSON' }),
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

    const { query, currentUrl, chunkIds } = validation.data!;

    // If no chunks, return helpful message
    if (chunkIds.length === 0) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createCORSHeaders(origin),
        },
        body: JSON.stringify({
          success: true,
          answer: "I couldn't find specific content chunks to answer your question. This might happen if:\n\n" +
            "1. The client-side search is still loading\n" +
            "2. Your question doesn't match any indexed content\n" +
            "3. You're asking about a different blog post\n\n" +
            "Try rephrasing your question or ask about specific topics from this post.",
          citations: [],
          chunks: [],
          rateLimit: {
            remaining: rateLimit.remaining,
            resetAt: rateLimit.resetAt,
          },
        }),
      };
    }

    // Load RAG index (try per-post first, fallback to legacy)
    let ragIndex: RAGIndex | null = null;
    
    if (currentUrl) {
      const postSlug = extractPostSlug(currentUrl);
      if (postSlug) {
        ragIndex = await loadPostRAGIndex(postSlug);
      }
    }
    
    if (!ragIndex) {
      console.log('Per-post index not found, trying legacy index...');
      ragIndex = await loadLegacyRAGIndex();
    }
    
    if (!ragIndex) {
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

    // Get chunks
    const chunks = getChunksByIds(ragIndex, chunkIds);

    if (chunks.length === 0) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          ...createCORSHeaders(origin),
        },
        body: JSON.stringify({
          success: true,
          answer: "I found the chunk references but couldn't load the actual content. Please try refreshing the page.",
          citations: [],
          chunks: [],
          rateLimit: {
            remaining: rateLimit.remaining,
            resetAt: rateLimit.resetAt,
          },
        }),
      };
    }

    // Call Groq LLM
    let answer: string;
    let tokensUsed = 0;

    try {
      const result = await callGroqLLM(query, chunks);
      answer = result.answer;
      tokensUsed = result.tokensUsed;
    } catch (error) {
      console.error('LLM call failed:', error);
      
      // Fallback: return chunk excerpts
      answer = `I found relevant content but couldn't process it with AI right now. Here's what I found:\n\n`;
      chunks.slice(0, 3).forEach((chunk, i) => {
        const preview = chunk.text.length > 200 
          ? chunk.text.substring(0, 200) + '...' 
          : chunk.text;
        answer += `**${i + 1}. ${chunk.metadata.sectionTitle || 'Section'}:**\n${preview}\n\n`;
      });
      
      answer += `\n*Note: AI processing is temporarily unavailable. ${error instanceof Error ? error.message : 'Please try again later.'}*`;
    }

    // Extract citations
    const citations = Array.from(
      new Set(
        chunks.map(chunk => {
          const url = chunk.metadata.postUrl;
          const section = chunk.metadata.sectionId ? `#${chunk.metadata.sectionId}` : '';
          return url + section;
        })
      )
    );

    const processingTime = Date.now() - startTime;
    console.log(`✅ Chat processed: ${processingTime}ms, ${chunks.length} chunks, ${tokensUsed} tokens`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-RateLimit-Limit': String(RATE_LIMIT_MAX),
        'X-RateLimit-Remaining': String(rateLimit.remaining),
        'X-RateLimit-Reset': String(rateLimit.resetAt),
        ...createCORSHeaders(origin),
      },
      body: JSON.stringify({
        success: true,
        answer,
        citations,
        tokensUsed,
        processingTime,
        rateLimit: {
          remaining: rateLimit.remaining,
          resetAt: rateLimit.resetAt,
        },
      }),
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
/**
 * RAG Index Generation Endpoint
 * 
 * Generates RAG index at build time
 * Story 10.1: Build-Time RAG Content Preparation
 */

import { generateRAGIndex } from '../utils/generate-rag-index';

export async function GET() {
  // Generate the index
  await generateRAGIndex();
  
  // Return a simple response (the file is written to public/)
  return new Response(
    JSON.stringify({ 
      status: 'success', 
      message: 'RAG index generated successfully',
      path: '/rag-index.json'
    }),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );
}

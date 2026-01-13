/**
 * Build-Time RAG Content Preparation
 * 
 * This utility:
 * 1. Parses all MDX blog posts from src/content/blog/*.mdx
 * 2. Extracts frontmatter (title, slug, date, tags, URL)
 * 3. Chunks body text (300-600 tokens, 100-token overlap)
 * 4. Builds Lunr search index with chunk metadata
 * 5. Outputs to public/rag-index.json
 * 
 * Story 10.1: Build-Time RAG Content Preparation
 */

import { getCollection } from 'astro:content';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import lunr from 'lunr';
import { SITE } from '../config';

// Token approximation: ~4 characters per token for English text
const CHARS_PER_TOKEN = 4;

// Chunking configuration
const MIN_CHUNK_TOKENS = 300;
const MAX_CHUNK_TOKENS = 600;
const OVERLAP_TOKENS = 100;

export interface ChunkMetadata {
  chunkId: string;
  postUrl: string;
  postTitle: string;
  postSlug: string;
  postDate: string;
  postTags: string[];
  chunkIndex: number;
  totalChunks: number;
}

export interface Chunk {
  text: string;
  metadata: ChunkMetadata;
}

export interface RAGIndex {
  chunks: Chunk[];
  index: ReturnType<lunr.Index['toJSON']>;
  version: string;
  generatedAt: string;
}

/**
 * Estimate token count from text
 * Uses approximation: ~4 characters per token
 */
function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Clean markdown text for chunking
 * Removes code blocks, inline code, links, and formatting
 */
function cleanMarkdown(text: string): string {
  return text
    .replace(/```[\s\S]*?```/g, '') // Remove code blocks
    .replace(/`[^`]+`/g, '') // Remove inline code
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Convert links to text
    .replace(/[#*_~]/g, '') // Remove markdown formatting
    .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
    .trim();
}

/**
 * Extract overlap text from end of chunk (last N tokens)
 */
function getOverlapText(text: string, overlapTokens: number): string {
  const overlapChars = overlapTokens * CHARS_PER_TOKEN;
  if (text.length <= overlapChars) {
    return text;
  }
  
  // Find last sentence boundary before overlap point
  const overlapStart = text.length - overlapChars;
  const lastSentence = text.lastIndexOf('.', overlapStart);
  const lastNewline = text.lastIndexOf('\n', overlapStart);
  const boundary = Math.max(lastSentence, lastNewline);
  
  if (boundary > 0) {
    return text.substring(boundary + 1).trim();
  }
  
  return text.substring(overlapStart).trim();
}

/**
 * Split text into chunks with overlap
 * Target: 300-600 tokens per chunk, 100-token overlap
 */
function chunkText(text: string): Array<{ text: string; startIndex: number }> {
  const cleaned = cleanMarkdown(text);
  const chunks: Array<{ text: string; startIndex: number }> = [];
  
  // Split by paragraphs first (preserve semantic boundaries)
  const paragraphs = cleaned.split(/\n\n+/).filter(p => p.trim().length > 0);
  
  let currentChunk = '';
  let currentTokens = 0;
  let startIndex = 0;
  
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    const paraTokens = estimateTokens(paragraph);
    
    // If adding this paragraph would exceed max, finalize current chunk
    if (currentTokens + paraTokens > MAX_CHUNK_TOKENS && currentChunk.length > 0) {
      // Ensure we meet minimum token requirement
      if (currentTokens >= MIN_CHUNK_TOKENS) {
        chunks.push({ text: currentChunk.trim(), startIndex });
        startIndex = chunks.length;
        
        // Start new chunk with overlap (last ~100 tokens of previous chunk)
        const overlapText = getOverlapText(currentChunk, OVERLAP_TOKENS);
        currentChunk = overlapText + '\n\n' + paragraph;
        currentTokens = estimateTokens(currentChunk);
      } else {
        // Current chunk is too small, keep adding
        currentChunk += '\n\n' + paragraph;
        currentTokens += paraTokens;
      }
    } else {
      // Add paragraph to current chunk
      if (currentChunk.length > 0) {
        currentChunk += '\n\n' + paragraph;
      } else {
        currentChunk = paragraph;
        startIndex = chunks.length;
      }
      currentTokens += paraTokens;
    }
    
    // If we've reached a good size, finalize chunk
    if (currentTokens >= MIN_CHUNK_TOKENS && currentTokens <= MAX_CHUNK_TOKENS) {
      chunks.push({ text: currentChunk.trim(), startIndex });
      startIndex = chunks.length;
      
      // Start new chunk with overlap
      const overlapText = getOverlapText(currentChunk, OVERLAP_TOKENS);
      currentChunk = overlapText;
      currentTokens = estimateTokens(currentChunk);
    }
  }
  
  // Add remaining text as final chunk if it meets minimum
  if (currentChunk.trim().length > 0) {
    const finalTokens = estimateTokens(currentChunk);
    if (finalTokens >= MIN_CHUNK_TOKENS || chunks.length === 0) {
      chunks.push({ text: currentChunk.trim(), startIndex });
    } else if (chunks.length > 0) {
      // Merge with last chunk if too small
      chunks[chunks.length - 1].text += '\n\n' + currentChunk.trim();
    }
  }
  
  return chunks;
}

/**
 * Generate RAG index for a single blog post
 */
async function generatePostIndex(post: any): Promise<{ chunks: Chunk[]; index: ReturnType<lunr.Index['toJSON']> }> {
  const postUrl = `${SITE.url}/blog/${post.slug}/`;
  const postTitle = post.data.title;
  const postSlug = post.slug;
  const postDate = post.data.date.toISOString();
  const postTags = post.data.tags || [];
  
  // Extract and clean body text
  const bodyText = post.body;
  
  // Chunk the text
  const textChunks = chunkText(bodyText);
  
  // Create chunk objects with metadata
  const chunks: Chunk[] = [];
  for (let i = 0; i < textChunks.length; i++) {
    const chunk = textChunks[i];
    const chunkId = `${postSlug}-chunk-${i}`;
    
    chunks.push({
      text: chunk.text,
      metadata: {
        chunkId,
        postUrl,
        postTitle,
        postSlug,
        postDate,
        postTags,
        chunkIndex: i,
        totalChunks: textChunks.length,
      },
    });
  }
  
  // Build Lunr search index for this post
  const index = lunr(function () {
    this.ref('chunkId');
    this.field('text');
    this.field('postTitle');
    this.field('postTags');
    
    // Add all chunks to index
    chunks.forEach((chunk) => {
      this.add({
        chunkId: chunk.metadata.chunkId,
        text: chunk.text,
        postTitle: chunk.metadata.postTitle,
        postTags: chunk.metadata.postTags.join(' '),
      });
    });
  });
  
  return {
    chunks,
    index: index.toJSON(),
  };
}

/**
 * Generate RAG indexes - one per blog post
 * Creates individual JSON files in public/rag-index/ directory
 */
export async function generateRAGIndex(): Promise<void> {
  console.log('🔍 Generating per-post RAG indexes...');
  
  // Get all published blog posts
  const posts = await getCollection('blog', ({ data }) => !data.draft && !data.hide);
  
  console.log(`📝 Found ${posts.length} blog posts`);
  
  // Create output directory
  const { mkdir } = await import('fs/promises');
  const outputDir = join(process.cwd(), 'public', 'rag-index');
  try {
    await mkdir(outputDir, { recursive: true });
  } catch (error) {
    // Directory might already exist, that's fine
  }
  
  // Manifest to track all posts and their index files
  const manifest: {
    version: string;
    generatedAt: string;
    posts: Array<{
      slug: string;
      title: string;
      url: string;
      date: string;
      tags: string[];
      chunkCount: number;
      indexFile: string;
    }>;
  } = {
    version: '2.0.0', // Version 2.0 for per-post indexes
    generatedAt: new Date().toISOString(),
    posts: [],
  };
  
  let totalChunks = 0;
  let totalSize = 0;
  
  // Process each post and generate individual index
  for (const post of posts) {
    const postSlug = post.slug;
    const postTitle = post.data.title;
    const postUrl = `${SITE.url}/blog/${post.slug}/`;
    const postDate = post.data.date.toISOString();
    const postTags = post.data.tags || [];
    
    // Generate index for this post
    const { chunks, index } = await generatePostIndex(post);
    
    // Create RAG index object for this post
    const ragIndex: RAGIndex = {
      chunks,
      index,
      version: '2.0.0',
      generatedAt: new Date().toISOString(),
    };
    
    // Write individual index file
    const indexFileName = `${postSlug}.json`;
    const indexFilePath = join(outputDir, indexFileName);
    const indexJson = JSON.stringify(ragIndex, null, 2);
    await writeFile(indexFilePath, indexJson, 'utf-8');
    
    // Calculate file size
    const { stat } = await import('fs/promises');
    const stats = await stat(indexFilePath);
    const sizeKB = (stats.size / 1024).toFixed(2);
    totalSize += stats.size;
    
    totalChunks += chunks.length;
    
    // Add to manifest
    manifest.posts.push({
      slug: postSlug,
      title: postTitle,
      url: postUrl,
      date: postDate,
      tags: postTags,
      chunkCount: chunks.length,
      indexFile: `/rag-index/${indexFileName}`,
    });
    
    console.log(`  ✓ ${postTitle}: ${chunks.length} chunks (${sizeKB} KB)`);
  }
  
  // Write manifest file
  const manifestPath = join(process.cwd(), 'public', 'rag-index', 'manifest.json');
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8');
  
  console.log(`\n✅ Generated ${posts.length} per-post indexes`);
  console.log(`📦 Total chunks: ${totalChunks}`);
  console.log(`📏 Total size: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);
  console.log(`📋 Manifest written to ${manifestPath}`);
  
  // Also generate a legacy single-file index for backward compatibility
  // (can be removed later if not needed)
  console.log('\n📦 Generating legacy single-file index for backward compatibility...');
  await generateLegacyIndex(posts);
}

/**
 * Generate legacy single-file index (for backward compatibility)
 * This combines all posts into one file
 */
async function generateLegacyIndex(posts: any[]): Promise<void> {
  const allChunks: Chunk[] = [];
  
  // Collect all chunks from all posts
  for (const post of posts) {
    const { chunks } = await generatePostIndex(post);
    allChunks.push(...chunks);
  }
  
  // Build combined Lunr index
  const index = lunr(function () {
    this.ref('chunkId');
    this.field('text');
    this.field('postTitle');
    this.field('postTags');
    
    allChunks.forEach((chunk) => {
      this.add({
        chunkId: chunk.metadata.chunkId,
        text: chunk.text,
        postTitle: chunk.metadata.postTitle,
        postTags: chunk.metadata.postTags.join(' '),
      });
    });
  });
  
  // Create combined RAG index
  const ragIndex: RAGIndex = {
    chunks: allChunks,
    index: index.toJSON(),
    version: '1.0.0', // Legacy version
    generatedAt: new Date().toISOString(),
  };
  
  // Write legacy file
  const legacyPath = join(process.cwd(), 'public', 'rag-index.json');
  await writeFile(legacyPath, JSON.stringify(ragIndex, null, 2), 'utf-8');
  
  const { stat } = await import('fs/promises');
  const stats = await stat(legacyPath);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`  ✓ Legacy index: ${allChunks.length} chunks (${sizeMB} MB)`);
}

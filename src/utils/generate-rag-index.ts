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
  sectionId?: string; // Heading ID (anchor) for the section this chunk belongs to
  sectionTitle?: string; // Heading text for the section
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
 * Extract headings and their positions from text (handles both HTML and markdown)
 * Returns array of headings in order with their positions
 * Note: Astro's post.body is raw markdown/MDX, not rendered HTML
 */
function extractHeadings(text: string): Array<{ id: string; title: string; position: number; textMatch: string }> {
  const headings: Array<{ id: string; title: string; position: number; textMatch: string }> = [];
  
  // First, try markdown headings (Astro's post.body is markdown/MDX)
  // Match: ## Heading or ## Heading {#id}
  // Use multiline mode - match at start of line (after optional whitespace)
  const markdownHeadingRegex = /^[ \t]*(#{2,3})\s+(.+?)(?:\s*\{#([^}]+)\})?$/gm;
  let match: RegExpExecArray | null;
  while ((match = markdownHeadingRegex.exec(text)) !== null) {
    const title = match[2].trim();
    const explicitId = match[3];
    
    // Generate ID from title if not explicitly provided
    // This matches Astro's heading ID generation
    const id = explicitId || title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special chars
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Collapse multiple hyphens
      .trim();
    
    headings.push({ 
      id, 
      title, 
      position: match.index,
      textMatch: match[0]
    });
  }
  
  // Also try HTML headings (in case we're processing rendered HTML)
  // Match: <h2 id="id">Title</h2> or <h3 id="id">Title</h3>
  const htmlHeadingRegex = /<(h[2-3])(?:\s+[^>]*)?(?:id=["']([^"']+)["'])?[^>]*>(.+?)<\/\1>/gi;
  while ((match = htmlHeadingRegex.exec(text)) !== null) {
    let id = match[2]; // Explicit ID if present
    let title = match[3].trim();
    // Remove any nested HTML tags from title
    title = title.replace(/<[^>]+>/g, '').trim();
    
    // If no explicit ID, generate one from title (matching Astro's behavior)
    if (!id) {
      id = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-') // Collapse multiple hyphens
        .trim();
    }
    
    // Only add if we haven't already found this heading as markdown
    const existing = headings.find(h => h.id === id && match && Math.abs(h.position - match.index) < 50);
    if (!existing) {
      headings.push({ 
        id, 
        title, 
        position: match.index,
        textMatch: match[0]
      });
    }
  }
  
  // Sort by position
  headings.sort((a, b) => a.position - b.position);
  
  return headings;
}

/**
 * Split text into chunks with overlap
 * Target: 300-600 tokens per chunk, 100-token overlap
 * Now includes section/heading information
 */
function chunkText(text: string): Array<{ text: string; startIndex: number; sectionId?: string; sectionTitle?: string }> {
  // Extract headings from original text first
  const headings = extractHeadings(text);
  
  // Clean text for chunking
  const cleaned = cleanMarkdown(text);
  
  // Create a mapping: for each heading, find its approximate position in cleaned text
  // We'll track which section we're in as we process paragraphs
  const headingPositions = new Map<number, { id: string; title: string }>();
  for (const heading of headings) {
    // Try to find the heading text in cleaned text
    // Clean the heading title the same way we clean the text
    const cleanedHeadingTitle = heading.title
      .replace(/<[^>]+>/g, '') // Remove any HTML tags
      .trim()
      .toLowerCase();
    const cleanedLower = cleaned.toLowerCase();
    
    // Try exact match first
    let pos = cleanedLower.indexOf(cleanedHeadingTitle);
    
    // If not found, try matching without special characters (in case of formatting differences)
    if (pos < 0) {
      const normalizedHeading = cleanedHeadingTitle.replace(/[^\w\s-]/g, '');
      const normalizedCleaned = cleanedLower.replace(/[^\w\s-]/g, '');
      pos = normalizedCleaned.indexOf(normalizedHeading);
      // Adjust position back to original cleaned text
      if (pos >= 0) {
        // Find the actual position in original cleaned text
        let normalizedPos = 0;
        for (let i = 0; i < cleanedLower.length; i++) {
          if (/[\w\s-]/.test(cleanedLower[i])) {
            if (normalizedPos === pos) {
              pos = i;
              break;
            }
            normalizedPos++;
          }
        }
      }
    }
    
    if (pos >= 0) {
      headingPositions.set(pos, { id: heading.id, title: heading.title });
    } else {
      // If exact match fails, try finding just key words from the heading
      const headingWords = cleanedHeadingTitle.split(/\s+/).filter(w => w.length > 3);
      if (headingWords.length > 0) {
        // Try to find a unique phrase from the heading (first 2-3 significant words)
        const phrase = headingWords.slice(0, Math.min(3, headingWords.length)).join(' ');
        pos = cleanedLower.indexOf(phrase);
        if (pos >= 0) {
          headingPositions.set(pos, { id: heading.id, title: heading.title });
        }
      }
    }
  }
  
  const chunks: Array<{ text: string; startIndex: number; sectionId?: string; sectionTitle?: string }> = [];
  
  // Split by paragraphs first (preserve semantic boundaries)
  const paragraphs = cleaned.split(/\n\n+/).filter(p => p.trim().length > 0);
  
  let currentChunk = '';
  let currentTokens = 0;
  let startIndex = 0;
  let currentPosition = 0; // Track position in cleaned text
  let currentSection: { id: string; title: string } | null = null;
  
  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i].trim();
    const paraTokens = estimateTokens(paragraph);
    
    // Check if this paragraph itself is a heading (heading text might appear as a paragraph after cleaning)
    // This handles cases where headings appear as plain text in cleaned content
    const paraLower = paragraph.toLowerCase().trim();
    let foundHeadingInParagraph = false;
    for (const heading of headings) {
      const headingTextLower = heading.title.toLowerCase().trim();
      // Check if paragraph exactly matches or starts with the heading text
      // Also check if the heading text appears as a standalone line in the paragraph
      if (paraLower === headingTextLower || 
          paraLower.startsWith(headingTextLower + '\n') || 
          paraLower.startsWith(headingTextLower + ' ') ||
          paraLower.includes('\n' + headingTextLower + '\n') ||
          paraLower.endsWith('\n' + headingTextLower)) {
        currentSection = { id: heading.id, title: heading.title };
        foundHeadingInParagraph = true;
        break;
      }
    }
    
    // If we didn't find a heading in this paragraph, check if we've passed a heading
    if (!foundHeadingInParagraph) {
      let nearestHeading: { id: string; title: string } | null = null;
      let nearestPos = -1;
      for (const [pos, heading] of headingPositions.entries()) {
        if (pos <= currentPosition && pos > nearestPos) {
          nearestHeading = heading;
          nearestPos = pos;
        }
      }
      if (nearestHeading) {
        currentSection = nearestHeading;
      }
    }
    
    // If adding this paragraph would exceed max, finalize current chunk
    if (currentTokens + paraTokens > MAX_CHUNK_TOKENS && currentChunk.length > 0) {
      // Ensure we meet minimum token requirement
      if (currentTokens >= MIN_CHUNK_TOKENS) {
        chunks.push({ 
          text: currentChunk.trim(), 
          startIndex,
          sectionId: currentSection?.id,
          sectionTitle: currentSection?.title
        });
        startIndex = chunks.length;
        
        // Start new chunk with overlap (last ~100 tokens of previous chunk)
        const overlapText = getOverlapText(currentChunk, OVERLAP_TOKENS);
        currentChunk = overlapText + '\n\n' + paragraph;
        currentTokens = estimateTokens(currentChunk);
        currentPosition += paragraph.length + 2; // +2 for \n\n
      } else {
        // Current chunk is too small, keep adding
        currentChunk += '\n\n' + paragraph;
        currentTokens += paraTokens;
        currentPosition += paragraph.length + 2;
      }
    } else {
      // Add paragraph to current chunk
      if (currentChunk.length > 0) {
        currentChunk += '\n\n' + paragraph;
        currentPosition += paragraph.length + 2;
      } else {
        currentChunk = paragraph;
        startIndex = chunks.length;
      }
      currentTokens += paraTokens;
    }
    
    // If we've reached a good size, finalize chunk
    if (currentTokens >= MIN_CHUNK_TOKENS && currentTokens <= MAX_CHUNK_TOKENS) {
      chunks.push({ 
        text: currentChunk.trim(), 
        startIndex,
        sectionId: currentSection?.id,
        sectionTitle: currentSection?.title
      });
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
      chunks.push({ 
        text: currentChunk.trim(), 
        startIndex,
        sectionId: currentSection?.id,
        sectionTitle: currentSection?.title
      });
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
        sectionId: chunk.sectionId,
        sectionTitle: chunk.sectionTitle,
      },
    });
  }
  
  // Build Lunr search index for this post
  const index = lunr(function () {
    this.ref('chunkId');
    this.field('text', { boost: 10 }); // Main content - highest boost
    this.field('sectionTitle', { boost: 5 }); // Section titles - high boost for heading matches
    this.field('postTitle', { boost: 2 });
    this.field('postTags', { boost: 1 });
    
    // Add all chunks to index
    chunks.forEach((chunk) => {
      this.add({
        chunkId: chunk.metadata.chunkId,
        text: chunk.text,
        sectionTitle: chunk.metadata.sectionTitle || '', // Add section title to index
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

/**
 * Client-Side RAG Search Utility
 * 
 * Provides client-side lexical search using Lunr to retrieve relevant
 * blog chunks before calling the LLM API.
 * 
 * Story 10.3: Client-Side Lexical Search (Lunr)
 */

import lunr from 'lunr';
import type { Chunk, ChunkMetadata, RAGIndex } from './generate-rag-index';

export interface ChunkResult {
  chunkId: string;
  text: string;
  postUrl: string;
  postTitle: string;
  postSlug: string;
  postDate: string;
  postTags: string[];
  score: number;
  metadata: ChunkMetadata;
}

export interface SearchOptions {
  currentUrl?: string;
  limit?: number;
  filterCurrentPost?: boolean;
}

/**
 * Manifest interface for per-post indexes
 */
interface PostManifest {
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
}

/**
 * RAG Search Manager
 * Handles loading and searching per-post RAG indexes
 * Optimized to load only the current post's index initially
 */
export class RAGSearchManager {
  private indexes: Map<string, lunr.Index> = new Map(); // Map of postSlug -> index
  private chunks: Map<string, Chunk> = new Map(); // Map of chunkId -> chunk
  private manifest: PostManifest | null = null;
  private loadedPosts: Set<string> = new Set(); // Track which posts are loaded
  private loading = false;
  private loadError: Error | null = null;

  /**
   * Load manifest file
   */
  private async loadManifest(): Promise<PostManifest | null> {
    if (this.manifest) return this.manifest;

    try {
      const response = await fetch('/rag-index/manifest.json');
      if (!response.ok) {
        throw new Error(`Failed to load manifest: ${response.status}`);
      }
      this.manifest = await response.json();
      return this.manifest;
    } catch (error) {
      console.warn('⚠️ Failed to load manifest, falling back to legacy single-file index');
      throw error;
    }
  }

  /**
   * Extract post slug from URL
   * Handles various URL formats:
   * - /blog/{slug}/
   * - /blog/{slug}
   * - https://domain.com/blog/{slug}/
   * - https://domain.com/blog/{slug}
   */
  private getPostSlugFromUrl(url: string): string | null {
    try {
      // Remove protocol and domain if present
      let path = url;
      if (url.includes('://')) {
        try {
          const urlObj = new URL(url);
          path = urlObj.pathname;
        } catch {
          // If URL parsing fails, try regex
          const match = url.match(/\/blog\/([^\/\?]+)/);
          return match ? match[1] : null;
        }
      }
      
      // Extract slug from path: /blog/{slug}/ or /blog/{slug}
      const match = path.match(/\/blog\/([^\/\?]+)/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }

  /**
   * Load a specific post's index
   */
  private async loadPostIndex(postSlug: string): Promise<void> {
    if (this.loadedPosts.has(postSlug)) return;

    try {
      const response = await fetch(`/rag-index/${postSlug}.json`);
      if (!response.ok) {
        throw new Error(`Failed to load index for ${postSlug}: ${response.status}`);
      }

      const ragIndex: RAGIndex = await response.json();
      
      if (!ragIndex || !ragIndex.chunks || !ragIndex.index) {
        throw new Error(`Invalid index format for ${postSlug}`);
      }

      // Reconstruct Lunr index
      const index = lunr.Index.load(ragIndex.index);
      this.indexes.set(postSlug, index);

      // Add chunks to global map
      ragIndex.chunks.forEach(chunk => {
        this.chunks.set(chunk.metadata.chunkId, chunk);
      });

      this.loadedPosts.add(postSlug);
      console.log(`✅ Loaded index for ${postSlug}: ${ragIndex.chunks.length} chunks`);
    } catch (error) {
      console.error(`❌ Failed to load index for ${postSlug}:`, error);
      throw error;
    }
  }

  /**
   * Load RAG index for current post (optimized loading)
   * Falls back to legacy single-file index if manifest not available
   */
  async loadIndex(currentUrl?: string): Promise<void> {
    if (this.loading) {
      // Wait for existing load to complete
      while (this.loading) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      if (this.loadError) throw this.loadError;
      return;
    }

    this.loading = true;
    this.loadError = null;

    try {
      const startTime = performance.now();
      
      // Try to load manifest and current post index
      try {
        const manifest = await this.loadManifest();
        
        if (!manifest) {
          throw new Error('Manifest is null');
        }
        
        // Extract post slug from current URL
        const postSlug = currentUrl ? this.getPostSlugFromUrl(currentUrl) : null;
        
        if (postSlug) {
          // Load current post's index (fast!)
          await this.loadPostIndex(postSlug);
          const loadTime = performance.now() - startTime;
          console.log(`✅ RAG index loaded for current post (${postSlug}) in ${loadTime.toFixed(2)}ms`);
        } else {
          console.warn('⚠️ Could not extract post slug from URL, loading all posts...');
          // Load all post indexes (fallback)
          for (const post of manifest.posts) {
            await this.loadPostIndex(post.slug);
          }
        }
      } catch (manifestError) {
        // Fallback to legacy single-file index
        console.log('📦 Falling back to legacy single-file index...');
        const response = await fetch('/rag-index.json');
        if (!response.ok) {
          throw new Error(`Failed to load RAG index: ${response.status} ${response.statusText}`);
        }

        const ragIndex: RAGIndex = await response.json();
        
        if (!ragIndex || !ragIndex.chunks || !ragIndex.index) {
          throw new Error('Invalid RAG index format: missing chunks or index');
        }

        // Reconstruct Lunr index from JSON
        const index = lunr.Index.load(ragIndex.index);
        this.indexes.set('__legacy__', index);

        // Build chunks map for quick lookup
        ragIndex.chunks.forEach(chunk => {
          this.chunks.set(chunk.metadata.chunkId, chunk);
        });

        this.loadedPosts.add('__legacy__');
      }

      const loadTime = performance.now() - startTime;
      console.log(`✅ RAG index loaded: ${this.chunks.size} chunks in ${loadTime.toFixed(2)}ms`);
    } catch (error) {
      this.loadError = error instanceof Error ? error : new Error('Unknown error loading RAG index');
      throw this.loadError;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Load additional post indexes for cross-post search
   */
  async loadAdditionalPosts(postSlugs: string[]): Promise<void> {
    for (const slug of postSlugs) {
      if (!this.loadedPosts.has(slug)) {
        try {
          await this.loadPostIndex(slug);
        } catch (error) {
          console.warn(`⚠️ Failed to load index for ${slug}:`, error);
        }
      }
    }
  }

  /**
   * Search for relevant chunks across loaded indexes
   * 
   * @param query - Search query
   * @param options - Search options
   * @returns Array of chunk results sorted by relevance
   */
  async searchChunks(
    query: string,
    options: SearchOptions = {}
  ): Promise<ChunkResult[]> {
    const {
      currentUrl,
      limit = 5,
      filterCurrentPost = false,
    } = options;

    // Ensure index is loaded
    if (this.indexes.size === 0) {
      await this.loadIndex(currentUrl);
    }

    if (this.indexes.size === 0 || !query.trim()) {
      return [];
    }

    const startTime = performance.now();

    try {
      // Search across all loaded indexes
      const allSearchResults: Array<{ ref: string; score: number }> = [];
      
      for (const [postSlug, index] of this.indexes.entries()) {
        const searchResults = index.search(query);
        // Add results with post context
        searchResults.forEach(result => {
          allSearchResults.push({
            ref: result.ref,
            score: result.score,
          });
        });
      }
      
      // Sort by score (highest first)
      allSearchResults.sort((a, b) => b.score - a.score);
      
      // Take top results
      const searchResults = allSearchResults.slice(0, limit * 2); // Get more than needed for filtering

      // Convert search results to ChunkResult objects
      const results: ChunkResult[] = [];

      for (const result of searchResults) {
        const chunkId = result.ref;
        const chunk = this.chunks.get(chunkId);

        if (!chunk) {
          console.warn(`Chunk not found: ${chunkId}`);
          continue;
        }

        // Filter by current post URL if requested
        if (filterCurrentPost && currentUrl) {
          const normalizedCurrentUrl = this.normalizeUrl(currentUrl);
          const normalizedPostUrl = this.normalizeUrl(chunk.metadata.postUrl);
          
          if (normalizedPostUrl !== normalizedCurrentUrl) {
            continue;
          }
        }

        results.push({
          chunkId: chunk.metadata.chunkId,
          text: chunk.text,
          postUrl: chunk.metadata.postUrl,
          postTitle: chunk.metadata.postTitle,
          postSlug: chunk.metadata.postSlug,
          postDate: chunk.metadata.postDate,
          postTags: chunk.metadata.postTags,
          score: result.score || 0,
          metadata: chunk.metadata,
        });

        // Stop when we have enough results
        if (results.length >= limit) {
          break;
        }
      }

      const searchTime = performance.now() - startTime;
      console.log(`🔍 Search completed in ${searchTime.toFixed(2)}ms: ${results.length} results`);

      return results;
    } catch (error) {
      console.error('Search error:', error);
      return [];
    }
  }

  /**
   * Search with smart filtering:
   * - First tries current post only (ensures current post index is loaded)
   * - Falls back to all posts if no results
   * 
   * @param query - Search query
   * @param currentUrl - Current post URL
   * @param limit - Maximum number of results
   * @returns Array of chunk results
   */
  async searchChunksSmart(
    query: string,
    currentUrl?: string,
    limit: number = 5
  ): Promise<ChunkResult[]> {
    // First, try searching only current post
    if (currentUrl) {
      // Extract post slug and ensure current post index is loaded
      const postSlug = this.getPostSlugFromUrl(currentUrl);
      
      if (postSlug) {
        // Ensure current post's index is loaded
        if (!this.loadedPosts.has(postSlug)) {
          try {
            await this.loadPostIndex(postSlug);
          } catch (error) {
            console.warn(`⚠️ Failed to load current post index (${postSlug}), will search all posts:`, error);
          }
        }
        
        // Search only in current post's index
        if (this.indexes.has(postSlug)) {
          const currentPostResults = await this.searchChunksInPost(postSlug, query, limit);
          
          // If we found results in current post, return them
          if (currentPostResults.length > 0) {
            return currentPostResults;
          }
        }
      }
    }

    // Fall back to searching all posts
    return this.searchChunks(query, {
      currentUrl,
      limit,
      filterCurrentPost: false,
    });
  }

  /**
   * Search chunks within a specific post's index
   */
  private async searchChunksInPost(
    postSlug: string,
    query: string,
    limit: number
  ): Promise<ChunkResult[]> {
    const index = this.indexes.get(postSlug);
    if (!index) {
      return [];
    }

    try {
      const searchResults = index.search(query);
      
      // Convert to ChunkResult objects
      const results: ChunkResult[] = [];
      for (const result of searchResults.slice(0, limit)) {
        const chunkId = result.ref;
        const chunk = this.chunks.get(chunkId);
        
        if (chunk) {
          results.push({
            chunkId: chunk.metadata.chunkId,
            text: chunk.text,
            postUrl: chunk.metadata.postUrl,
            postTitle: chunk.metadata.postTitle,
            postSlug: chunk.metadata.postSlug,
            postDate: chunk.metadata.postDate,
            postTags: chunk.metadata.postTags,
            score: result.score || 0,
            metadata: chunk.metadata,
          });
        }
      }
      
      return results;
    } catch (error) {
      console.error(`Error searching in post ${postSlug}:`, error);
      return [];
    }
  }

  /**
   * Normalize URL for comparison
   */
  private normalizeUrl(url: string): string {
    try {
      // Remove trailing slashes and normalize
      const normalized = url.replace(/\/+$/, '');
      // Extract pathname if it's a full URL
      if (normalized.startsWith('http')) {
        const urlObj = new URL(normalized);
        return urlObj.pathname.replace(/\/+$/, '');
      }
      return normalized.replace(/\/+$/, '');
    } catch {
      return url.replace(/\/+$/, '');
    }
  }

  /**
   * Get chunk by ID
   */
  getChunk(chunkId: string): Chunk | undefined {
    return this.chunks.get(chunkId);
  }

  /**
   * Check if index is loaded
   */
  isLoaded(): boolean {
    return this.indexes.size > 0;
  }

  /**
   * Get total number of chunks
   */
  getChunkCount(): number {
    return this.chunks.size;
  }
}

// Singleton instance
let searchManager: RAGSearchManager | null = null;

/**
 * Get or create the RAG search manager instance
 */
export function getRAGSearchManager(): RAGSearchManager {
  if (!searchManager) {
    searchManager = new RAGSearchManager();
  }
  return searchManager;
}

/**
 * Convenience function: Search chunks with default options
 */
export async function searchChunks(
  query: string,
  currentUrl?: string,
  limit: number = 5
): Promise<ChunkResult[]> {
  const manager = getRAGSearchManager();
  return manager.searchChunksSmart(query, currentUrl, limit);
}

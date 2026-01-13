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
  sectionId?: string;
  sectionTitle?: string;
}

export interface SearchOptions {
  currentUrl?: string;
  limit?: number;
  filterCurrentPost?: boolean;
  sectionId?: string; // Optional: filter by section/heading ID
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
        // Escape colons and other special characters that Lunr interprets as field separators
        const escapedQuery = query.replace(/:/g, ' ').trim();
        const searchResults = index.search(escapedQuery);
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
        
        // Filter by section ID if provided
        if (options.sectionId && chunk.metadata.sectionId !== options.sectionId) {
          continue;
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
          sectionId: chunk.metadata.sectionId,
          sectionTitle: chunk.metadata.sectionTitle,
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
   * - Supports section-based filtering via sectionId
   * 
   * @param query - Search query
   * @param currentUrl - Current post URL
   * @param limit - Maximum number of results
   * @param sectionId - Optional section/heading ID to filter by
   * @returns Array of chunk results
   */
  async searchChunksSmart(
    query: string,
    currentUrl?: string,
    limit: number = 5,
    sectionId?: string
  ): Promise<ChunkResult[]> {
    // If sectionId is provided, prioritize chunks from that section
    if (sectionId && currentUrl) {
      const postSlug = this.getPostSlugFromUrl(currentUrl);
      if (postSlug) {
        // Ensure current post's index is loaded
        if (!this.loadedPosts.has(postSlug)) {
          try {
            await this.loadPostIndex(postSlug);
          } catch (error) {
            console.warn(`⚠️ Failed to load current post index (${postSlug}):`, error);
          }
        }
        
        // Search within the specific section first
        if (this.indexes.has(postSlug)) {
          const sectionResults = await this.searchChunksInPost(postSlug, query, limit, sectionId);
          if (sectionResults.length > 0) {
            console.log(`✅ Found ${sectionResults.length} results in section ${sectionId}`);
            return sectionResults;
          }
        }
      }
    }
    
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
      sectionId,
    });
  }

  /**
   * Search chunks within a specific post's index
   */
  private async searchChunksInPost(
    postSlug: string,
    query: string,
    limit: number,
    sectionId?: string
  ): Promise<ChunkResult[]> {
    const index = this.indexes.get(postSlug);
    if (!index) {
      return [];
    }

    try {
      // First, try exact section title match (for heading text queries)
      // Normalize query: lowercase, trim, and handle colons
      const normalizedQuery = query.toLowerCase().trim();
      // Also create a version without colons for matching
      const normalizedQueryNoColon = normalizedQuery.replace(/:/g, '').replace(/\s+/g, ' ').trim();
      let results: ChunkResult[] = [];
      
      // Check if query matches any section title exactly or closely
      let checkedChunks = 0;
      for (const chunk of this.chunks.values()) {
        if (chunk.metadata.postSlug !== postSlug) continue;
        if (sectionId && chunk.metadata.sectionId !== sectionId) continue;
        
        checkedChunks++;
        const sectionTitle = chunk.metadata.sectionTitle?.toLowerCase().trim();
        if (sectionTitle) {
          // Normalize section title for comparison (remove extra spaces)
          const normalizedSectionTitle = sectionTitle.replace(/\s+/g, ' ').trim();
          const normalizedSectionTitleNoColon = normalizedSectionTitle.replace(/:/g, '').replace(/\s+/g, ' ').trim();
          
          // Exact match (with or without colon)
          if (normalizedSectionTitle === normalizedQuery || 
              normalizedSectionTitleNoColon === normalizedQueryNoColon) {
            results.push({
              chunkId: chunk.metadata.chunkId,
              text: chunk.text,
              postUrl: chunk.metadata.postUrl,
              postTitle: chunk.metadata.postTitle,
              postSlug: chunk.metadata.postSlug,
              postDate: chunk.metadata.postDate,
              postTags: chunk.metadata.postTags,
              score: 10.0, // High score for exact section title match
              metadata: chunk.metadata,
              sectionId: chunk.metadata.sectionId,
              sectionTitle: chunk.metadata.sectionTitle,
            });
          }
          // Partial match (query contains section title or vice versa)
          else if (normalizedSectionTitle.includes(normalizedQuery) || 
                   normalizedQuery.includes(normalizedSectionTitle) ||
                   normalizedSectionTitleNoColon.includes(normalizedQueryNoColon) ||
                   normalizedQueryNoColon.includes(normalizedSectionTitleNoColon)) {
            results.push({
              chunkId: chunk.metadata.chunkId,
              text: chunk.text,
              postUrl: chunk.metadata.postUrl,
              postTitle: chunk.metadata.postTitle,
              postSlug: chunk.metadata.postSlug,
              postDate: chunk.metadata.postDate,
              postTags: chunk.metadata.postTags,
              score: 8.0, // High score for partial section title match
              metadata: chunk.metadata,
              sectionId: chunk.metadata.sectionId,
              sectionTitle: chunk.metadata.sectionTitle,
            });
          }
        }
      }
      
      if (checkedChunks === 0) {
        console.warn(`⚠️ No chunks found for post ${postSlug} (chunks might not be loaded yet)`);
      }
      
      // If we found exact/partial section matches, return them (sorted by score, then by chunk index)
      if (results.length > 0) {
        // Remove duplicates (same chunkId)
        const uniqueResults = new Map<string, ChunkResult>();
        for (const result of results) {
          if (!uniqueResults.has(result.chunkId) || uniqueResults.get(result.chunkId)!.score < result.score) {
            uniqueResults.set(result.chunkId, result);
          }
        }
        results = Array.from(uniqueResults.values())
          .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.metadata.chunkIndex - b.metadata.chunkIndex;
          })
          .slice(0, limit);
        
        if (results.length > 0) {
          console.log(`✅ Found ${results.length} chunks matching section title: "${query}"`);
          return results;
        }
      }
      
      // Fall back to Lunr search
      // Escape colons and other special characters that Lunr interprets as field separators
      // Replace colons with spaces to prevent field parsing errors
      // Also escape other Lunr special characters: +, -, *, ~, ^, :, "
      const escapedQuery = query
        .replace(/:/g, ' ') // Replace colons with spaces
        .replace(/\+/g, ' ') // Replace + with space
        .replace(/\*/g, ' ') // Replace * with space
        .replace(/~/g, ' ') // Replace ~ with space
        .replace(/\^/g, ' ') // Replace ^ with space
        .replace(/"/g, ' ') // Replace " with space
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      let searchResults: lunr.Index.Result[] = [];
      try {
        searchResults = index.search(escapedQuery);
      } catch (searchError) {
        // If search fails (e.g., query parsing error), try a simpler query
        console.warn(`⚠️ Lunr search failed for query "${query}", trying simplified query:`, searchError);
        // Try searching just the words without special characters
        const simpleQuery = query.replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
        if (simpleQuery) {
          try {
            searchResults = index.search(simpleQuery);
          } catch (simpleError) {
            console.error(`⚠️ Even simplified search failed:`, simpleError);
            // Return empty results - section title matching already tried
            return [];
          }
        }
      }
      
      // Convert to ChunkResult objects
      results = [];
      for (const result of searchResults) {
        const chunkId = result.ref;
        const chunk = this.chunks.get(chunkId);
        
        if (!chunk) continue;
        
        // Filter by section ID if provided
        if (sectionId && chunk.metadata.sectionId !== sectionId) {
          continue;
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
          sectionId: chunk.metadata.sectionId,
          sectionTitle: chunk.metadata.sectionTitle,
        });
        
        if (results.length >= limit) break;
      }
      
      return results;
    } catch (error) {
      console.error(`Error searching in post ${postSlug}:`, error);
      return [];
    }
  }

  /**
   * Search chunks by section ID (heading anchor)
   * Returns all chunks that belong to a specific section
   */
  async searchChunksBySection(
    sectionId: string,
    currentUrl?: string,
    limit: number = 10
  ): Promise<ChunkResult[]> {
    const postSlug = currentUrl ? this.getPostSlugFromUrl(currentUrl) : null;
    
    if (!postSlug) {
      console.warn('⚠️ Could not extract post slug from URL for section search');
      return [];
    }
    
    // Ensure post index is loaded
    if (!this.loadedPosts.has(postSlug)) {
      try {
        await this.loadPostIndex(postSlug);
      } catch (error) {
        console.error(`❌ Failed to load index for ${postSlug}:`, error);
        return [];
      }
    }
    
    // Get all chunks for this post and filter by section
    const results: ChunkResult[] = [];
    for (const chunk of this.chunks.values()) {
      if (chunk.metadata.postSlug === postSlug && chunk.metadata.sectionId === sectionId) {
        results.push({
          chunkId: chunk.metadata.chunkId,
          text: chunk.text,
          postUrl: chunk.metadata.postUrl,
          postTitle: chunk.metadata.postTitle,
          postSlug: chunk.metadata.postSlug,
          postDate: chunk.metadata.postDate,
          postTags: chunk.metadata.postTags,
          score: 1.0, // Full match for section-based search
          metadata: chunk.metadata,
          sectionId: chunk.metadata.sectionId,
          sectionTitle: chunk.metadata.sectionTitle,
        });
        
        if (results.length >= limit) break;
      }
    }
    
    return results;
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

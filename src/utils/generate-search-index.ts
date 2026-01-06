import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export interface SearchIndexItem {
  title: string;
  description: string;
  content: string;
  tags: string[];
  slug: string;
  date: string;
  excerpt: string;
}

export async function generateSearchIndex(): Promise<SearchIndexItem[]> {
  const blogPosts = await getCollection('blog', ({ data }) => !data.draft);
  
  return blogPosts.map((post: CollectionEntry<'blog'>) => {
    // Extract text content from MDX (remove markdown syntax)
    const content = post.body
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/`[^`]+`/g, '') // Remove inline code
      .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Convert links to text
      .replace(/[#*_~]/g, '') // Remove markdown formatting
      .replace(/\n+/g, ' ') // Replace newlines with spaces
      .trim();
    
    // Create excerpt (first 500 characters)
    const excerpt = content.substring(0, 500).trim() + (content.length > 500 ? '...' : '');
    
    return {
      title: post.data.title,
      description: post.data.description || '',
      content: content,
      tags: post.data.tags || [],
      slug: post.slug,
      date: post.data.date.toISOString(),
      excerpt: excerpt,
    };
  });
}


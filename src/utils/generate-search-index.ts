import { getCollection } from 'astro:content';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { templates } from '../data/templates';

export interface SearchIndexItem {
  title: string;
  description: string;
  content: string;
  tags: string[];
  slug: string;
  date?: string;
  excerpt: string;
  type: 'blog' | 'template';
  category?: string;
}

export async function generateSearchIndex(): Promise<SearchIndexItem[]> {
  const items: SearchIndexItem[] = [];
  
  // Add blog posts
  const blogPosts = await getCollection('blog', ({ data }) => !data.draft && !data.hide);
  
  for (const post of blogPosts) {
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
    
    items.push({
      title: post.data.title,
      description: post.data.description || '',
      content: content,
      tags: post.data.tags || [],
      slug: post.slug,
      date: post.data.date.toISOString(),
      excerpt: excerpt,
      type: 'blog',
    });
  }
  
  // Add templates
  for (const template of templates) {
    try {
      const templatePath = join(process.cwd(), 'public', 'templates', `${template.slug}.md`);
      const content = await readFile(templatePath, 'utf-8');
      
      // Extract text content from markdown
      const textContent = content
        .replace(/```[\s\S]*?```/g, '') // Remove code blocks
        .replace(/`[^`]+`/g, '') // Remove inline code
        .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1') // Convert links to text
        .replace(/[#*_~]/g, '') // Remove markdown formatting
        .replace(/\n+/g, ' ') // Replace newlines with spaces
        .trim();
      
      // Create excerpt (first 500 characters)
      const excerpt = textContent.substring(0, 500).trim() + (textContent.length > 500 ? '...' : '');
      
      items.push({
        title: template.title,
        description: template.description,
        content: textContent,
        tags: template.tags || [],
        slug: `${template.category}/${template.slug}`,
        excerpt: excerpt,
        type: 'template',
        category: template.category,
      });
    } catch (error) {
      // Skip templates that can't be read
      console.warn(`Could not read template ${template.slug}:`, error);
    }
  }
  
  return items;
}


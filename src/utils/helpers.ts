// Date formatting
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}

// Calculate reading time
export function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return `${minutes} min read`;
}

// Generate slug from title
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

// Sort posts by date (newest first)
export function sortPostsByDate(posts: any[]): any[] {
  return posts.sort((a, b) => {
    const dateA = new Date(a.data.date);
    const dateB = new Date(b.data.date);
    return dateB.getTime() - dateA.getTime();
  });
}

// Sort posts with pinned posts first, then by date
export function sortPostsWithPinned(posts: any[]): any[] {
  return posts.sort((a, b) => {
    // Pinned posts always come first
    const aPinned = a.data.pinned || false;
    const bPinned = b.data.pinned || false;
    
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    
    // If both pinned or both not pinned, sort by date (newest first)
    const dateA = new Date(a.data.date);
    const dateB = new Date(b.data.date);
    return dateB.getTime() - dateA.getTime();
  });
}

// Get unique tags from posts
export function getUniqueTags(posts: any[]): string[] {
  const tags = new Set<string>();
  posts.forEach(post => {
    post.data.tags?.forEach((tag: string) => tags.add(tag));
  });
  return Array.from(tags).sort();
}

// Filter posts by tag
export function filterPostsByTag(posts: any[], tag: string): any[] {
  return posts.filter(post => 
    post.data.tags?.map((t: string) => t.toLowerCase()).includes(tag.toLowerCase())
  );
}

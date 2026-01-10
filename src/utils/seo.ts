import type { CollectionEntry } from 'astro:content';
import { SITE } from '../config';

export interface StructuredData {
  '@context': string;
  '@type': string;
  [key: string]: any;
}

/**
 * Generate Website structured data
 */
export function generateWebsiteSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.title,
    url: SITE.url,
    description: SITE.description,
    publisher: {
      '@type': 'Person',
      name: SITE.author,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${SITE.url}/blog?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * Generate Person structured data for author
 */
export function generatePersonSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: SITE.author,
    url: SITE.url,
    image: new URL(SITE.image, SITE.url).toString(),
    jobTitle: 'AI Advisor',
    description: SITE.description,
    sameAs: [
      SITE.twitter ? `https://twitter.com/${SITE.twitter.replace('@', '')}` : null,
      SITE.linkedin ? `https://${SITE.linkedin}` : null,
    ].filter(Boolean),
  };
}

/**
 * Generate Article structured data for blog posts
 */
export function generateArticleSchema(
  post: CollectionEntry<'blog'>,
  canonicalURL: string
): StructuredData {
  const imageUrl = post.data.image
    ? new URL(post.data.image, SITE.url).toString()
    : new URL(SITE.image, SITE.url).toString();

  const articleSchema: StructuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.data.title,
    description: post.data.description,
    image: imageUrl,
    datePublished: post.data.date.toISOString(),
    dateModified: post.data.date.toISOString(),
    author: {
      '@type': 'Person',
      name: SITE.author,
      url: SITE.url,
    },
    publisher: {
      '@type': 'Person',
      name: SITE.author,
      url: SITE.url,
      logo: {
        '@type': 'ImageObject',
        url: new URL(SITE.image, SITE.url).toString(),
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalURL,
    },
    url: canonicalURL,
  };

  // Add keywords from tags
  if (post.data.tags && post.data.tags.length > 0) {
    articleSchema.keywords = post.data.tags.join(', ');
  }

  // Add article section if series exists
  if (post.data.series) {
    articleSchema.articleSection = post.data.series;
  }

  return articleSchema;
}

/**
 * Generate BreadcrumbList structured data
 */
export function generateBreadcrumbSchema(
  items: Array<{ name: string; url: string }>
): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: new URL(item.url, SITE.url).toString(),
    })),
  };
}

/**
 * Generate Organization structured data (optional, for business)
 */
export function generateOrganizationSchema(): StructuredData {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE.title,
    url: SITE.url,
    logo: new URL(SITE.image, SITE.url).toString(),
    founder: {
      '@type': 'Person',
      name: SITE.author,
    },
  };
}


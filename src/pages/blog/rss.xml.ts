import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '../../config';

export async function GET(context: APIContext) {
  const posts = await getCollection('blog', ({ data }) => !data.draft);
  
  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site || SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/blog/${post.slug}/`,
      categories: post.data.tags,
    })),
    customData: `<language>en-us</language>`,
  });
}

import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()),
    image: z.string().optional(),
    draft: z.boolean().optional().default(false),
    series: z.string().optional(),
    seriesPart: z.number().optional(),
    pinned: z.boolean().optional().default(false),
    hide: z.boolean().optional().default(false),
  }),
});

export const collections = { blog };

import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    dateModified: z.date().optional(),
    tags: z.array(z.string()),
    image: z.string().optional(),
    socialImage: z.string().optional(),
    socialImageWidth: z.number().optional(),
    socialImageHeight: z.number().optional(),
    socialImageType: z.string().optional(),
    draft: z.boolean().optional().default(false),
    series: z.string().optional(),
    seriesPart: z.number().optional(),
    presentation: z.enum(['premium-editorial']).optional(),
    premiumAccent: z.string().optional(),
    premiumAccent2: z.string().optional(),
    premiumAccent3: z.string().optional(),
    premiumAccent4: z.string().optional(),
    pinned: z.boolean().optional().default(false),
    hide: z.boolean().optional().default(false),
  }),
});

const tutorials = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    level: z.enum(['beginner', 'intermediate', 'advanced']),
    path: z.enum(['genai', 'llm-systems', 'langgraph', 'system-design']).default('genai'),
    pathTitle: z.string().optional(),
    pathOrder: z.number().int().min(1).optional(),
    module: z.number().int().min(1),
    totalModules: z.number().int().min(1),
    roles: z.array(z.enum(['dev', 'qa', 'ba', 'pm'])),
    tags: z.array(z.string()),
    date: z.date(),
    estimatedTime: z.string(),
    prerequisites: z.array(z.string()).default([]),
    draft: z.boolean().optional().default(false),
  }),
});

export const collections = { blog, tutorials };

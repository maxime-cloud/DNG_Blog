import { defineCollection, defineContentConfig, z } from '@nuxt/content'

export default defineContentConfig({
  collections: {
    blog: defineCollection({
      type: 'page',
      source: 'blog/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        publishedAt: z.string().optional(),
        coverImage: z.string().optional(),
        author: z.string().optional(),
        status: z.string().optional(),
        distros: z.array(z.string()).optional(),
        series: z.string().optional(),
        seriesOrder: z.number().optional()
      })
    }),
    docs: defineCollection({
      type: 'page',
      source: 'docs/**/*.md',
      schema: z.object({
        title: z.string(),
        description: z.string().optional(),
        order: z.number().optional(),
        icon: z.string().optional()
      })
    })
  }
})

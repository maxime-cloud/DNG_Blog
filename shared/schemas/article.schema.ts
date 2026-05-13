import * as z from 'zod'

export const createArticleSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  slug: z.string().optional(),
  excerpt: z.string().max(500).optional(),
  status: z.enum(['draft', 'published', 'archived']),
  categoryIds: z.array(z.string()).optional(),
  tagIds: z.array(z.string()).optional()
})

export const updateArticleSchema = createArticleSchema.partial()

export type CreateArticleInput = z.infer<typeof createArticleSchema>
export type UpdateArticleInput = z.infer<typeof updateArticleSchema>

import * as z from 'zod'

export const learningPathSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  slug: z.string().min(2).max(200),
  description: z.string().max(1000).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional()
})

export const addStepSchema = z.object({
  articleId: z.string().min(1, 'Article requis'),
  stepOrder: z.number().int().min(1),
  stepTitle: z.string().min(3).max(200).optional()
})

export type LearningPathInput = z.infer<typeof learningPathSchema>
export type AddStepInput = z.infer<typeof addStepSchema>

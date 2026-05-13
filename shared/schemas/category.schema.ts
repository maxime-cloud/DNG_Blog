import * as z from 'zod'

export const categorySchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(100),
  slug: z.string().min(2).max(100),
  description: z.string().max(500).optional(),
  color: z.string().optional(),
  icon: z.string().optional()
})

export const tagSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(50),
  slug: z.string().min(1).max(50)
})

export type CategoryInput = z.infer<typeof categorySchema>
export type TagInput = z.infer<typeof tagSchema>

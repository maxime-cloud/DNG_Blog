import * as z from 'zod'

export const commentSchema = z.object({
  content: z
    .string()
    .min(3, 'Le commentaire doit contenir au moins 3 caractères')
    .max(2000, 'Le commentaire ne peut pas dépasser 2000 caractères')
})

export type CommentInput = z.infer<typeof commentSchema>

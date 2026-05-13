import * as z from 'zod'

export const newsletterSchema = z.object({
  email: z.email('Adresse email invalide'),
  name: z.string().optional()
})

export type NewsletterInput = z.infer<typeof newsletterSchema>

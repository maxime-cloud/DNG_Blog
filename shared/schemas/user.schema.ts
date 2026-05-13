import * as z from 'zod'

export const updateProfileSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères').max(50),
  bio: z.string().max(500).optional(),
  githubUrl: z.string().url('URL GitHub invalide').optional().or(z.literal('')),
  websiteUrl: z.string().url('URL invalide').optional().or(z.literal(''))
})

export const changeEmailSchema = z.object({
  email: z.email('Adresse email invalide'),
  currentPassword: z.string().min(1, 'Mot de passe requis')
})

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
    newPassword: z
      .string()
      .min(8, 'Minimum 8 caractères')
      .regex(/[A-Z]/, 'Au moins une majuscule')
      .regex(/[0-9]/, 'Au moins un chiffre'),
    confirmPassword: z.string()
  })
  .refine(data => data.newPassword === data.confirmPassword, {
    message: 'Les mots de passe ne correspondent pas',
    path: ['confirmPassword']
  })

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>

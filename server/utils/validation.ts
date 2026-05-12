import z from 'zod'

export const articleSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().max(500).optional(),
  content: z.string().min(10),
  categoryId: z.coerce.string().optional(),
  tags: z.array(z.string()).optional(),
  coverImage: z.url().optional(),
  status: z.enum(['DRAFT', 'REVIEW', 'PUBLISHED', 'ARCHIVED']).optional(),
  scheduledAt: z.date().optional(),
  seriesId: z.coerce.string().optional(),
  seriesOrder: z.number().optional()
})

export const commentSchema = z.object({
  content: z.string().min(1).max(2000),
  parentId: z.string().optional()
})

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  username: z
    .string()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  bio: z.string().max(500).optional(),
  image: z.url().optional(),
  githubUrl: z.url().optional(),
  websiteUrl: z.url().optional()
})

export const newsletterSchema = z.object({
  email: z.email(),
  name: z.string().min(2).max(50).optional()
})

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(20)
})

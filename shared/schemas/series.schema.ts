import * as z from 'zod'

export const seriesSchema = z.object({
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères').max(200),
  slug: z.string().min(2).max(200),
  description: z.string().max(1000).optional()
})

export const addArticleToSeriesSchema = z.object({
  articleId: z.string().min(1, 'Article requis'),
  seriesOrder: z.number().int().min(1)
})

export type SeriesInput = z.infer<typeof seriesSchema>
export type AddArticleToSeriesInput = z.infer<typeof addArticleToSeriesSchema>

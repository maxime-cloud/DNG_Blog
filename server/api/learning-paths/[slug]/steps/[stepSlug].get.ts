import { defineEventHandler, createError, getRouterParam } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const pathSlug = getRouterParam(event, 'slug')
    const stepSlug = getRouterParam(event, 'stepSlug')
    const session = await getAuthSession(event)
    const userId = session?.user.id ?? null

    const path = await prisma.learningPath.findFirst({
      where: { slug: pathSlug, isPublished: true },
      select: {
        id: true,
        title: true,
        slug: true,
        steps: {
          orderBy: { stepOrder: 'asc' },
          select: {
            id: true,
            stepOrder: true,
            stepTitle: true,
            article: {
              select: {
                id: true,
                title: true,
                slug: true,
                excerpt: true,
                coverImageUrl: true,
                publishedAt: true,
                author: {
                  select: { id: true, name: true, image: true }
                },
                tags: {
                  select: { tag: { select: { id: true, name: true, slug: true } } }
                },
                categories: {
                  select: { category: { select: { id: true, name: true, slug: true } } }
                }
              }
            }
          }
        },
        ...(userId && {
          userProgress: {
            where: { userId },
            select: { stepId: true }
          }
        })
      }
    })

    if (!path) {
      throw createError({ statusCode: 404, statusMessage: 'Parcours introuvable' })
    }

    const stepIndex = path.steps.findIndex(s => s.article?.slug === stepSlug)
    if (stepIndex === -1) {
      throw createError({ statusCode: 404, statusMessage: 'Étape introuvable dans ce parcours' })
    }

    const { userProgress, steps, ...pathRest } = path as any
    const completedStepIds: Set<number> = new Set(
      userId ? (userProgress ?? []).map((p: any) => p.stepId) : []
    )

    const currentStep = steps[stepIndex]
    const prevStep = stepIndex > 0 ? steps[stepIndex - 1] : null
    const nextStep = stepIndex < steps.length - 1 ? steps[stepIndex + 1] : null

    return {
      data: {
        path: {
          ...pathRest,
          stepsCount: steps.length,
          steps: steps.map((s: any) => ({
            id: s.id,
            stepOrder: s.stepOrder,
            stepTitle: s.stepTitle ?? s.article?.title ?? null,
            articleSlug: s.article?.slug ?? null,
            isCompleted: userId ? completedStepIds.has(s.id) : null
          }))
        },
        step: {
          id: currentStep.id,
          stepOrder: currentStep.stepOrder,
          stepTitle: currentStep.stepTitle,
          isCompleted: userId ? completedStepIds.has(currentStep.id) : false,
          article: {
            ...currentStep.article,
            tags: currentStep.article.tags.map((t: any) => t.tag),
            categories: currentStep.article.categories.map((c: any) => c.category)
          }
        },
        navigation: {
          prev: prevStep
            ? {
                stepOrder: prevStep.stepOrder,
                stepTitle: prevStep.stepTitle ?? prevStep.article?.title ?? null,
                articleSlug: prevStep.article?.slug ?? null
              }
            : { stepOrder: null, stepTitle: null, articleSlug: null },
          next: nextStep
            ? {
                stepOrder: nextStep.stepOrder,
                stepTitle: nextStep.stepTitle ?? nextStep.article?.title ?? null,
                articleSlug: nextStep.article?.slug ?? null
              }
            : { stepOrder: null, stepTitle: null, articleSlug: null }
        }
      }
    }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/learning-paths/:slug/steps/:stepSlug', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})

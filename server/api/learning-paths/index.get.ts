import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (event) => {
  try {
    const session = await getAuthSession(event)
    const userId = session?.user.id ?? null

    const paths = await prisma.learningPath.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        description: true,
        difficulty: true,
        coverImageUrl: true,
        _count: { select: { steps: true } },
        ...(userId && {
          userProgress: {
            where: { userId },
            select: { stepId: true }
          }
        })
      }
    })

    const data = paths.map((p) => {
      const { userProgress, ...rest } = p as any
      return {
        ...rest,
        userProgress: userId
          ? { completedSteps: userProgress?.length ?? 0 }
          : null
      }
    })

    return { data }
  } catch (error: any) {
    if (error.statusCode) throw error
    console.error('[API] GET /api/learning-paths', error)
    throw createError({ statusCode: 500, statusMessage: 'Erreur serveur' })
  }
})

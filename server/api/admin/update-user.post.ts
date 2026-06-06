import { auth } from '~/lib/auth'

export default defineEventHandler(async (event) => {
  const session = await auth.api.getSession({ 
    headers: Object.fromEntries(
      Object.entries(event.node.req.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v])
    ) as HeadersInit
  })
  if (session?.user.role !== 'admin') {
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })
  }

  const { userId, data } = await readBody(event)
  if (!userId || !data) throw createError({ statusCode: 400, statusMessage: 'UserId and data required' })

  await auth.api.adminUpdateUser({
    body: { userId, data },
    headers: Object.fromEntries(
      Object.entries(event.node.req.headers).map(([k, v]) => [k, Array.isArray(v) ? v.join(',') : v])
    ) as HeadersInit
  })
  return { success: true }
})

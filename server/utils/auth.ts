import { createError, type H3Event } from 'h3'
import { auth } from '~/lib/auth'

type Session = typeof auth.$Infer.Session

const ROLE_LEVEL: Record<string, number> = {
  reader: 0,
  author: 1,
  admin: 2
}

export async function getAuthSession(event: H3Event): Promise<Session | null> {
  const session = await auth.api.getSession({ headers: event.headers })
  return session ?? null
}

export async function requireAuth(event: H3Event): Promise<Session> {
  const session = await getAuthSession(event)
  if (!session) {
    throw createError({ statusCode: 401 })
  }
  return session
}

export async function requireRole(
  event: H3Event,
  minRole: 'reader' | 'author' | 'admin'
): Promise<Session> {
  const session = await requireAuth(event)
  const userLevel = ROLE_LEVEL[session.user.role ?? 'reader'] ?? 0
  const requiredLevel = ROLE_LEVEL[minRole] ?? 0
  if (userLevel < requiredLevel) {
    throw createError({ statusCode: 403 })
  }
  return session
}

export function checkBanned(session: Session): void {
  if (session.user.banned === true) {
    throw createError({ statusCode: 403, statusMessage: 'Compte suspendu' })
  }
}

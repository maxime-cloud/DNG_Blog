import { createError, getRequestIP } from 'h3'
import type { H3Event } from 'h3'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

export function rateLimit(
  event: H3Event,
  opts: { max: number, windowMs: number }
): void {
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'unknown'
  const route = event.path ?? '/'
  const key = `${ip}:${route}`
  const now = Date.now()

  // Clean up expired entries
  for (const [k, entry] of store.entries()) {
    if (now > entry.resetAt) {
      store.delete(k)
    }
  }

  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + opts.windowMs })
    return
  }

  entry.count++

  if (entry.count > opts.max) {
    throw createError({ statusCode: 429, statusMessage: 'Too many requests' })
  }
}

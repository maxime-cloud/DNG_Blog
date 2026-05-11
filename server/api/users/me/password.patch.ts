import { defineEventHandler, createError } from 'h3'

export default defineEventHandler(async (_event) => {
  throw createError({
    statusCode: 501,
    statusMessage: 'Use Better Auth\'s password reset flow'
  })
})

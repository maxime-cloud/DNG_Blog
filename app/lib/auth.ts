import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { admin } from 'better-auth/plugins'
// If your Prisma file is located elsewhere, you can change the path
import { prisma } from './prisma'
import { sendPasswordResetEmail, sendEmailVerificationEmail } from './mailer'

// const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql'
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,

    // try to singin with your email
    /* onExistingUserSignUp: async ({ user }, request) => {

    }, */

    sendResetPassword: async ({ user, url }) => {
      void sendPasswordResetEmail(user.email, url)
    }
  },
  emailVerification: {
    sendOnSignUp: true, // envoie automatiquement l'email à l'inscription
    autoSignInAfterVerification: true, // connecte l'utilisateur après vérification
    sendVerificationEmail: async ({ user, url }) => {
      void sendEmailVerificationEmail(user.email, url)
    }
  },
  plugins: [
    admin({
      defaultRole: 'reader', // tout nouvel utilisateur sera "reader" par défaut
      adminRoles: ['admin'] // les rôles considérés comme "admin" par le plugin
    })
  ],
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string
    }
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds (5 minutes)
      strategy: 'compact' // or "jwt" or "jwe"
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24 // 1 day (every 1 day the session expiration is updated)
  }
})

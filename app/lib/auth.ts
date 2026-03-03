import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { admin } from "better-auth/plugins";
// If your Prisma file is located elsewhere, you can change the path
import { prisma } from "./prisma";

// const prisma = new PrismaClient();

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    autoSignIn: false,
    
    // try to singin with your email
    onExistingUserSignUp: async ({ user }, request) => {
      
    },
    
    // Reset password via Plunk
    sendResetPassword: async ({ user, url }) => {
      await $fetch("https://api.useplunk.com/v1/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PLUNK_SECRET_API_KEY}`,
        },
        body: {
          to: user.email,
          subject: "Réinitialisation de ton mot de passe",
          subscribed: true,
          name: "DNG Blog",
          body: `
             <h2>Réinitialisation du mot de passe</h2>
             <p>Clique sur le lien ci-dessous pour réinitialiser ton mot de passe :</p>
             <a href="${url}" style="
               display: inline-block;
               padding: 12px 24px;
               background: #4f46e5;
               color: white;
               border-radius: 6px;
               text-decoration: none;
             ">Réinitialiser mon mot de passe</a>
             <p>Ce lien expire dans 1h. Si tu n'as pas demandé cette action, ignore cet email.</p>
           `,
          data: {},
        },
      })
    }
  },
  emailVerification: {
    sendOnSignUp: true, // envoie automatiquement l'email à l'inscription
    autoSignInAfterVerification: true, // connecte l'utilisateur après vérification
    sendVerificationEmail: async ({ user, url }) => {
      await $fetch("https://api.useplunk.com/v1/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PLUNK_SECRET_API_KEY}`,
        },
        body: {
          to: user.email,
          subject: "Vérifie ton adresse email",
          subscribed: true,
          name: "DNG Blog",
          body: `
              <h2>Bienvenue ${user.name} !</h2>
              <p>Clique sur le lien ci-dessous pour vérifier ton adresse email :</p>
              <a href="${url}" style="
                display: inline-block;
                padding: 12px 24px;
                background: #4f46e5;
                color: white;
                border-radius: 6px;
                text-decoration: none;
              ">Vérifier mon email</a>
              <p>Ce lien expire dans 24h.</p>
            `,
          data: {},
        },
      });
    },
  },
  plugins: [
    admin(),
  ],
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID as string,
      clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60, // Cache duration in seconds (5 minutes)
      strategy: "compact", // or "jwt" or "jwe"
    },
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day (every 1 day the session expiration is updated)
  },
});

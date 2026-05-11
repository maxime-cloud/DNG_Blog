import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import {
  welcomeEmailHtml,
  passwordResetEmailHtml,
  emailVerificationHtml,
  emailChangeConfirmHtml,
  newsletterConfirmHtml,
  newsletterWelcomeHtml,
  commentNotificationHtml,
  commentReplyHtml,
  adminReportHtml,
  newsletterCampaignHtml
} from '../../server/emails/templates'

let transporter: Transporter | null | undefined = undefined

function getTransporter(): Transporter | null {
  if (transporter !== undefined) return transporter

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env

  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    console.warn('[mailer] SMTP not configured — emails will not be sent.')
    transporter = null
    return null
  }

  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    secure: Number(SMTP_PORT) === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS }
  })

  return transporter
}

async function send(to: string, subject: string, html: string): Promise<void> {
  const t = getTransporter()
  if (!t) {
    console.warn(`[mailer] Email not sent to ${to} — no transporter available.`)
    return
  }
  await t.sendMail({ from: process.env.SMTP_FROM ?? process.env.SMTP_USER, to, subject, html })
}

export async function sendWelcomeEmail(to: string, name: string): Promise<void> {
  await send(to, `Bienvenue sur StackTrace, ${name} !`, welcomeEmailHtml(name))
}

export async function sendPasswordResetEmail(to: string, resetUrl: string): Promise<void> {
  await send(to, 'Réinitialisation de votre mot de passe', passwordResetEmailHtml(resetUrl))
}

export async function sendEmailVerificationEmail(to: string, verifyUrl: string): Promise<void> {
  await send(to, 'Vérifiez votre adresse email', emailVerificationHtml(verifyUrl))
}

export async function sendEmailChangeConfirmEmail(to: string, confirmUrl: string): Promise<void> {
  await send(
    to,
    'Confirmez le changement de votre adresse email',
    emailChangeConfirmHtml(confirmUrl)
  )
}

export async function sendNewsletterConfirmEmail(
  to: string,
  name: string,
  confirmUrl: string
): Promise<void> {
  await send(
    to,
    'Confirmez votre inscription à la newsletter',
    newsletterConfirmHtml(name, confirmUrl)
  )
}

export async function sendNewsletterWelcomeEmail(to: string, name: string): Promise<void> {
  await send(to, 'Bienvenue dans la newsletter StackTrace !', newsletterWelcomeHtml(name))
}

export async function sendCommentNotificationEmail(
  to: string,
  articleTitle: string,
  articleUrl: string
): Promise<void> {
  await send(
    to,
    `Nouveau commentaire sur « ${articleTitle} »`,
    commentNotificationHtml(articleTitle, articleUrl)
  )
}

export async function sendCommentReplyEmail(
  to: string,
  commenterName: string,
  articleUrl: string
): Promise<void> {
  await send(
    to,
    `${commenterName} a répondu à votre commentaire`,
    commentReplyHtml(commenterName, articleUrl)
  )
}

export async function sendAdminReportEmail(
  adminEmail: string,
  commentUrl: string,
  reportCount: number
): Promise<void> {
  await send(
    adminEmail,
    `Commentaire signalé ${reportCount} fois`,
    adminReportHtml(commentUrl, reportCount)
  )
}

export async function sendNewsletterCampaign(
  to: string,
  subject: string,
  htmlBody: string,
  unsubscribeUrl: string
): Promise<void> {
  await send(to, subject, newsletterCampaignHtml(htmlBody, unsubscribeUrl))
}

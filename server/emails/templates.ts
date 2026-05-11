const SITE_URL = process.env.NUXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
const SITE_NAME = 'StackTrace'
const PRIMARY = '#16a34a'

function layout(content: string, footerExtra = ''): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${SITE_NAME}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border:1px solid #e5e7eb;">

        <!-- Header -->
        <tr>
          <td style="background:#0a0a0a;padding:24px 32px;">
            <a href="${SITE_URL}" style="color:#ffffff;text-decoration:none;font-size:20px;font-weight:700;letter-spacing:-0.5px;">${SITE_NAME}</a>
          </td>
        </tr>

        <!-- Content -->
        <tr>
          <td style="padding:40px 32px;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 32px;">
            <p style="margin:0;font-size:12px;color:#6b7280;line-height:1.6;">
              ${SITE_NAME} — <a href="${SITE_URL}" style="color:${PRIMARY};text-decoration:none;">${SITE_URL}</a>
              ${footerExtra}
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function h1(text: string): string {
  return `<h1 style="margin:0 0 24px;font-size:24px;font-weight:700;color:#0a0a0a;line-height:1.3;">${text}</h1>`
}

function p(text: string): string {
  return `<p style="margin:0 0 16px;font-size:15px;color:#374151;line-height:1.7;">${text}</p>`
}

function btn(text: string, url: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:24px 0;">
    <tr>
      <td style="background:${PRIMARY};padding:14px 28px;">
        <a href="${url}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">${text}</a>
      </td>
    </tr>
  </table>`
}

function divider(): string {
  return `<hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;" />`
}

function small(text: string): string {
  return `<p style="margin:0;font-size:13px;color:#6b7280;line-height:1.6;">${text}</p>`
}

// ── Email templates ──────────────────────────────────────────────────────────

export function welcomeEmailHtml(name: string): string {
  return layout(`
    ${h1(`Bienvenue sur ${SITE_NAME}, ${name} !`)}
    ${p('Votre compte est maintenant actif. Vous pouvez commencer à lire, commenter et sauvegarder vos articles préférés.')}
    ${btn('Découvrir les articles', `${SITE_URL}/articles`)}
    ${divider()}
    ${small('Si vous n\'avez pas créé ce compte, vous pouvez ignorer cet email.')}
  `)
}

export function passwordResetEmailHtml(resetUrl: string): string {
  return layout(`
    ${h1('Réinitialisation de votre mot de passe')}
    ${p('Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.')}
    ${btn('Réinitialiser mon mot de passe', resetUrl)}
    ${divider()}
    ${small('Ce lien est valable pendant <strong>1 heure</strong>. Si vous n\'êtes pas à l\'origine de cette demande, ignorez cet email — votre mot de passe restera inchangé.')}
  `)
}

export function emailVerificationHtml(verifyUrl: string): string {
  return layout(`
    ${h1('Confirmez votre adresse email')}
    ${p(`Merci de vous être inscrit sur ${SITE_NAME}. Pour activer votre compte, vérifiez votre adresse email en cliquant sur le bouton ci-dessous.`)}
    ${btn('Vérifier mon adresse email', verifyUrl)}
    ${divider()}
    ${small('Si vous n\'avez pas créé de compte sur ${SITE_NAME}, ignorez cet email.')}
  `)
}

export function emailChangeConfirmHtml(confirmUrl: string): string {
  return layout(`
    ${h1('Confirmez le changement de votre adresse email')}
    ${p('Vous avez demandé à modifier l\'adresse email associée à votre compte. Confirmez cette modification en cliquant sur le bouton ci-dessous.')}
    ${btn('Confirmer le changement d\'email', confirmUrl)}
    ${divider()}
    ${small('Si vous n\'êtes pas à l\'origine de cette demande, ignorez cet email et sécurisez votre compte en changeant votre mot de passe.')}
  `)
}

export function newsletterConfirmHtml(name: string, confirmUrl: string): string {
  return layout(`
    ${h1(`${name}, confirmez votre inscription !`)}
    ${p(`Merci de votre intérêt pour la newsletter ${SITE_NAME}. Un dernier clic pour confirmer votre inscription et recevoir nos meilleurs articles.`)}
    ${btn('Confirmer mon inscription', confirmUrl)}
    ${divider()}
    ${small('Vous recevez cet email car vous avez rempli le formulaire d\'inscription sur ${SITE_NAME}. Si ce n\'est pas vous, ignorez cet email.')}
  `)
}

export function newsletterWelcomeHtml(name: string): string {
  return layout(`
    ${h1(`Bienvenue dans la newsletter, ${name} !`)}
    ${p('Votre inscription est confirmée. Vous recevrez nos prochains articles directement dans votre boîte mail — sans spam, uniquement du contenu de qualité.')}
    ${p('En attendant, découvrez nos derniers articles :')}
    ${btn('Lire les derniers articles', `${SITE_URL}/articles`)}
  `)
}

export function commentNotificationHtml(articleTitle: string, articleUrl: string): string {
  return layout(`
    ${h1('Nouveau commentaire sur votre article')}
    ${p(`Un nouveau commentaire a été approuvé sur votre article <strong>"${articleTitle}"</strong>.`)}
    ${btn('Voir le commentaire', articleUrl)}
  `)
}

export function commentReplyHtml(commenterName: string, articleUrl: string): string {
  return layout(`
    ${h1(`${commenterName} a répondu à votre commentaire`)}
    ${p(`<strong>${commenterName}</strong> a répondu à votre commentaire. Cliquez pour lire la réponse et continuer la discussion.`)}
    ${btn('Voir la réponse', articleUrl)}
  `)
}

export function adminReportHtml(commentUrl: string, reportCount: number): string {
  return layout(`
    ${h1(`⚠️ Commentaire signalé ${reportCount} fois`)}
    ${p(`Un commentaire a été signalé <strong>${reportCount} fois</strong> par des utilisateurs et nécessite votre attention.`)}
    ${btn('Voir le commentaire signalé', commentUrl)}
    ${divider()}
    ${small('Vous recevez cet email en tant qu\'administrateur de ${SITE_NAME}.')}
  `)
}

export function newsletterCampaignHtml(body: string, unsubscribeUrl: string): string {
  return layout(
    body,
    `<br />• <a href="${unsubscribeUrl}" style="color:#6b7280;">Se désabonner</a>`
  )
}

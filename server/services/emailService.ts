import { env } from '../config/env.js';

/**
 * Service d'envoi d'emails
 * Pour le MVP: logs seulement, pas de vrais envois
 * À intégrer avec Sendgrid, Mailgun, etc. en production
 */

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

/**
 * Envoyer un email de vérification
 */
export async function sendVerificationEmail(
  email: string,
  username: string,
  verificationToken: string
): Promise<boolean> {
  try {
    const verificationUrl = `${env.APP_URL}/verify-email/${verificationToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            .header { text-align: center; margin-bottom: 20px; }
            .button { display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin: 20px 0; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Bienvenue sur TWTC Mining!</h1>
            </div>
            <p>Bonjour ${username},</p>
            <p>Veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous:</p>
            <a href="${verificationUrl}" class="button">Vérifier mon email</a>
            <p>Ou collez ce lien dans votre navigateur:</p>
            <p><small>${verificationUrl}</small></p>
            <p>Ce lien expire dans 24 heures.</p>
            <div class="footer">
              <p>Si vous n'avez pas créé ce compte, veuillez ignorer cet email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // EN PRODUCTION: Utiliser Sendgrid/Mailgun
    if (env.NODE_ENV === 'production') {
      // TODO: Implémenter avec un provider email réel
      console.log('📧 [PRODUCTION EMAIL] To:', email);
      console.log('📧 [PRODUCTION EMAIL] Subject:', 'Vérifiez votre email TWTC');
      console.log('📧 [PRODUCTION EMAIL] Verification URL:', verificationUrl);
      // await sendgridClient.send({ to: email, subject, html });
    } else {
      // EN DÉVELOPPEMENT: Log seulement
      console.log('\n📧 [DEV EMAIL] Verification email would be sent:');
      console.log('   To:', email);
      console.log('   Subject: Vérifiez votre email TWTC');
      console.log('   Verification URL:', verificationUrl);
      console.log('   Token:', verificationToken);
    }

    return true;
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    return false;
  }
}

/**
 * Envoyer un email de réinitialisation de mot de passe
 */
export async function sendPasswordResetEmail(
  email: string,
  username: string,
  resetToken: string
): Promise<boolean> {
  try {
    const resetUrl = `${env.APP_URL}/reset-password/${resetToken}`;

    const html = `
      <!DOCTYPE html>
      <html>
        <body>
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Réinitialisation de mot de passe</h2>
            <p>Bonjour ${username},</p>
            <p>Cliquez sur le lien ci-dessous pour réinitialiser votre mot de passe:</p>
            <a href="${resetUrl}" style="display: inline-block; background-color: #6366f1; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; margin: 20px 0;">
              Réinitialiser le mot de passe
            </a>
            <p>Ce lien expire dans 1 heure.</p>
          </div>
        </body>
      </html>
    `;

    console.log('\n📧 [DEV EMAIL] Password reset email would be sent:');
    console.log('   To:', email);
    console.log('   Reset URL:', resetUrl);

    return true;
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return false;
  }
}

export const emailService = {
  sendVerificationEmail,
  sendPasswordResetEmail,
};

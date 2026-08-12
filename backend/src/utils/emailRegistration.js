const { createTransporter } = require('./emailShared');


/**
 * Notify the platform operator (info@merita.care) that a new user has registered.
 * Internal admin notification — NOT sent to the end user.
 *
 * @param {object} details
 * @param {string} details.firstName
 * @param {string} details.lastName
 * @param {string} details.email  - the new user's email
 * @param {string} details.role   - 'care_giver' | 'care_recipient'
 */
const sendNewRegistrationNotification = async ({ firstName, lastName, email, role }) => {
  const transporter = createTransporter();

  // Operator notification recipients (comma-separated). Override via ADMIN_NOTIFY_EMAIL.
  const adminEmails = process.env.ADMIN_NOTIFY_EMAIL || 'info@merita.care, artzymeri2001@gmail.com';
  // In development, redirect to the dev inbox to avoid emailing the operator while testing.
  const isDevelopment = process.env.NODE_ENV === 'development';
  const recipient = isDevelopment ? 'artzymeri2001@gmail.com' : adminEmails;

  const roleLabels = {
    care_giver: 'Alltagsbegleiter:in / Freiberufler:in (Caregiver)',
    care_recipient: 'Pflegebedürftige:r (Care recipient)',
  };
  const roleLabel = roleLabels[role] || role || 'Unbekannt';
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || '—';
  const registeredAt = new Date().toLocaleString('de-DE', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: 'Europe/Berlin',
  });

  const html = `
    <!DOCTYPE html>
    <html lang="de">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f9fafb; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 520px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 32px; text-align: center;">
                  <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">MyHelper.me</h1>
                  <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">Neue Registrierung</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 32px;">
                  <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin: 0 0 8px 0;">
                    🎉 Ein neuer Nutzer hat sich registriert
                  </h2>
                  <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                    Soeben hat sich eine neue Person auf MyHelper.me registriert. Hier die wichtigsten Angaben:
                  </p>
                  <!-- Details -->
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border: 1px solid #f3f4f6; border-radius: 12px; overflow: hidden;">
                    <tr>
                      <td style="padding: 14px 20px; border-bottom: 1px solid #eef0f2;">
                        <span style="display: block; color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">Name</span>
                        <span style="color: #111827; font-size: 15px; font-weight: 600;">${fullName}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 14px 20px; border-bottom: 1px solid #eef0f2;">
                        <span style="display: block; color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">E-Mail</span>
                        <a href="mailto:${email}" style="color: #ea580c; font-size: 15px; font-weight: 600; text-decoration: none;">${email}</a>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 14px 20px; border-bottom: 1px solid #eef0f2;">
                        <span style="display: block; color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">Rolle</span>
                        <span style="color: #111827; font-size: 15px; font-weight: 600;">${roleLabel}</span>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 14px 20px;">
                        <span style="display: block; color: #9ca3af; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 2px;">Zeitpunkt</span>
                        <span style="color: #111827; font-size: 15px; font-weight: 600;">${registeredAt} (Europe/Berlin)</span>
                      </td>
                    </tr>
                  </table>
                  <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 24px 0 0 0;">
                    Diese Nachricht wurde automatisch von MyHelper.me gesendet und dient nur zur Information – es ist keine Aktion erforderlich.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 32px; border-top: 1px solid #f3f4f6; text-align: center;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} MyHelper.me · Automatische Benachrichtigung
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;

  const mailOptions = {
    from: `MyHelper <${process.env.EMAIL_FROM}>`,
    to: recipient,
    replyTo: email,
    subject: `🎉 Neue Registrierung: ${fullName} (${roleLabel})`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 New-registration notification sent to ${recipient} (messageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send new-registration notification:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendNewRegistrationNotification };

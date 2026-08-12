const { createTransporter, generateVerificationCode } = require('./emailShared');


/**
 * Send email verification code
 * All emails in German as requested.
 * 
 * @param {string} to - Recipient email
 * @param {string} firstName - User's first name
 * @param {string} code - 6-digit verification code
 */
const sendVerificationEmail = async (to, firstName, code) => {
  const transporter = createTransporter();

  // Development mode: override recipient to avoid Resend testing restrictions
  const isDevelopment = process.env.NODE_ENV === 'development';
  const recipient = isDevelopment ? 'artzymeri2001@gmail.com' : to;
  
  if (isDevelopment && to !== recipient) {
    console.log(`🔧 [DEV MODE] Redirecting email from ${to} to ${recipient}`);
  }

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
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 32px; text-align: center;">
                  <h1 style="color: #ffffff; font-size: 24px; font-weight: 700; margin: 0;">MyHelper</h1>
                  <p style="color: rgba(255,255,255,0.9); font-size: 14px; margin: 8px 0 0 0;">Pflegeplattform</p>
                </td>
              </tr>
              <!-- Body -->
              <tr>
                <td style="padding: 32px;">
                  <h2 style="color: #111827; font-size: 20px; font-weight: 600; margin: 0 0 8px 0;">
                    Hallo ${firstName},
                  </h2>
                  <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                    Vielen Dank für Ihre Registrierung bei MyHelper. Bitte verwenden Sie den folgenden Code, um Ihre E-Mail-Adresse zu bestätigen:
                  </p>
                  <!-- Code Box -->
                  <div style="background-color: #fffbeb; border: 2px solid #f59e0b; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
                    <p style="color: #92400e; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin: 0 0 8px 0;">
                      Ihr Bestätigungscode
                    </p>
                    <p style="color: #111827; font-size: 36px; font-weight: 700; letter-spacing: 8px; margin: 0;">
                      ${code}
                    </p>
                  </div>
                  <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0 0 8px 0;">
                    Dieser Code ist <strong>10 Minuten</strong> gültig.
                  </p>
                  <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0;">
                    Falls Sie diese Registrierung nicht angefordert haben, können Sie diese E-Mail ignorieren.
                  </p>
                </td>
              </tr>
              <!-- Footer -->
              <tr>
                <td style="padding: 24px 32px; border-top: 1px solid #f3f4f6; text-align: center;">
                  <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                    © ${new Date().getFullYear()} MyHelper. Alle Rechte vorbehalten.
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
    subject: 'MyHelper – Ihr Bestätigungscode',
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Verification email sent to ${recipient} (messageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send verification email:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Send resend verification code email
 * 
 * @param {string} to - Recipient email
 * @param {string} firstName - User's first name
 * @param {string} code - 6-digit verification code
 */
const sendResendVerificationEmail = async (to, firstName, code) => {
  // Uses the same template as the initial verification
  return sendVerificationEmail(to, firstName, code);
};

module.exports = { generateVerificationCode, sendVerificationEmail, sendResendVerificationEmail };

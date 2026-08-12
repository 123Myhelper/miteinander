const { createTransporter } = require('./emailShared');


/**
 * Send user feedback to info@myhelper.me
 * 
 * @param {object} user - User object with id, email, firstName, lastName, role
 * @param {string} message - Feedback message
 */
const sendFeedbackEmail = async (user, message) => {
  const transporter = createTransporter();

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
            <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 560px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
              <tr>
                <td style="background: linear-gradient(135deg, #f59e0b, #ea580c); padding: 24px 32px; text-align: center;">
                  <h1 style="color: #ffffff; font-size: 20px; font-weight: 700; margin: 0;">📬 Neues Benutzer-Feedback</h1>
                </td>
              </tr>
              <tr>
                <td style="padding: 32px;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
                    <tr>
                      <td style="padding: 8px 16px;">
                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Name</p>
                        <p style="margin: 0; font-size: 15px; color: #111827; font-weight: 600;">${user.firstName} ${user.lastName}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 16px;">
                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">E-Mail</p>
                        <p style="margin: 0; font-size: 15px; color: #111827;">${user.email}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 16px;">
                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Rolle</p>
                        <p style="margin: 0; font-size: 15px; color: #111827;">${user.role === 'care_giver' ? 'Pflegekraft' : 'Pflegebedürftiger'}</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 8px 16px;">
                        <p style="margin: 0 0 4px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Benutzer-ID</p>
                        <p style="margin: 0; font-size: 15px; color: #111827;">#${user.id}</p>
                      </td>
                    </tr>
                  </table>

                  <p style="margin: 0 0 8px 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px;">Feedback-Nachricht</p>
                  <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 20px;">
                    <p style="margin: 0; font-size: 15px; color: #111827; line-height: 1.6; white-space: pre-wrap;">${message}</p>
                  </div>

                  <p style="margin: 24px 0 0 0; font-size: 12px; color: #9ca3af; text-align: center;">
                    Gesendet am ${new Date().toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
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
    from: `"MyHelper Feedback" <${process.env.SMTP_USER || process.env.EMAIL_FROM}>`,
    to: 'info@myhelper.me',
    replyTo: user.email,
    subject: `Feedback von ${user.firstName} ${user.lastName} (${user.role === 'care_giver' ? 'Pflegekraft' : 'Pflegebedürftiger'})`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Feedback email sent from ${user.email} (messageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send feedback email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendFeedbackEmail };

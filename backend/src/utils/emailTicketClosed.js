const { createTransporter } = require('./emailShared');


/**
 * Send email when a support ticket has been closed.
 * Sent to the care_giver or care_recipient who opened the ticket.
 * All emails in German.
 * 
 * @param {string} to - Recipient email
 * @param {string} firstName - User's first name
 * @param {number} ticketId - The ticket ID
 */
const sendTicketClosedEmail = async (to, firstName, ticketId) => {
  const transporter = createTransporter();

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
                    Ihr Support-Ticket <strong>#${ticketId}</strong> wurde geschlossen.
                  </p>
                  <!-- Info Box -->
                  <div style="background-color: #f0fdf4; border: 2px solid #22c55e; border-radius: 12px; padding: 24px; text-align: center; margin: 0 0 24px 0;">
                    <p style="color: #166534; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">
                      Ticket #${ticketId}
                    </p>
                    <p style="color: #15803d; font-size: 16px; font-weight: 700; margin: 0;">
                      ✅ Geschlossen
                    </p>
                  </div>
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0;">
                    Wir hoffen, dass Ihr Anliegen zu Ihrer Zufriedenheit gelöst wurde. Falls Sie weitere Hilfe benötigen, können Sie jederzeit ein neues Support-Ticket erstellen.
                  </p>
                  <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0;">
                    Vielen Dank, dass Sie MyHelper nutzen.
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
    subject: `MyHelper – Ihr Support-Ticket #${ticketId} wurde geschlossen`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Ticket closed email sent to ${recipient} (messageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send ticket closed email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendTicketClosedEmail };

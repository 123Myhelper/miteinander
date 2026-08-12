const { createTransporter } = require('./emailShared');


/**
 * Send email when a support ticket is assigned to a support staff member by an admin.
 * Sent to the support employee.
 * All emails in German.
 * 
 * @param {string} to - Support staff email
 * @param {string} staffFirstName - Support staff first name
 * @param {number} ticketId - The ticket ID
 * @param {string} userName - Name of the user who opened the ticket
 */
const sendTicketAssignedEmail = async (to, staffFirstName, ticketId, userName) => {
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
                    Hallo ${staffFirstName},
                  </h2>
                  <p style="color: #6b7280; font-size: 15px; line-height: 1.6; margin: 0 0 24px 0;">
                    Ein Administrator hat Ihnen ein neues Support-Ticket zugewiesen.
                  </p>
                  <!-- Ticket Info Box -->
                  <div style="background-color: #fffbeb; border: 2px solid #f59e0b; border-radius: 12px; padding: 24px; margin: 0 0 24px 0;">
                    <p style="color: #92400e; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; font-weight: 600; margin: 0 0 12px 0;">
                      Ticket-Details
                    </p>
                    <table cellpadding="0" cellspacing="0" style="width: 100%;">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding: 4px 0;">Ticket-Nr.:</td>
                        <td style="color: #111827; font-size: 14px; font-weight: 600; padding: 4px 0; text-align: right;">#${ticketId}</td>
                      </tr>
                      <tr>
                        <td style="color: #6b7280; font-size: 14px; padding: 4px 0;">Benutzer:</td>
                        <td style="color: #111827; font-size: 14px; font-weight: 600; padding: 4px 0; text-align: right;">${userName}</td>
                      </tr>
                    </table>
                  </div>
                  <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 8px 0;">
                    Bitte melden Sie sich bei der Plattform an, um das Ticket zu bearbeiten und dem Benutzer zu antworten.
                  </p>
                  <p style="color: #9ca3af; font-size: 13px; line-height: 1.6; margin: 0;">
                    Bei Fragen wenden Sie sich an Ihren Administrator.
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
    subject: `MyHelper – Neues Support-Ticket #${ticketId} zugewiesen`,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Ticket assigned email sent to ${recipient} (messageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Failed to send ticket assigned email:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = { sendTicketAssignedEmail };

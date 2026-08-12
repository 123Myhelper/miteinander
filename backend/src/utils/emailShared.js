const nodemailer = require('nodemailer');

/**
 * Email utility using STRATO SMTP.
 * 
 * Uses the STRATO mailbox to send all transactional emails.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Log in to STRATO → Email management
 * 2. Create a mailbox (e.g. noreply@myhelper.me) or use webmaster@myhelper.me
 * 3. Set the mailbox password
 * 4. Add these to your backend .env file:
 *    SMTP_HOST=smtp.strato.de
 *    SMTP_PORT=465
 *    SMTP_USER=noreply@myhelper.me
 *    SMTP_PASS=your-mailbox-password
 *    EMAIL_FROM=noreply@myhelper.me
 */

// Create reusable transporter using STRATO SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.strato.de',
    port: parseInt(process.env.SMTP_PORT, 10) || 465,
    secure: true, // true for port 465 (SSL)
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: true,
    },
  });
};

/**
 * Generate a 6-digit verification code
 */
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = { createTransporter, generateVerificationCode };

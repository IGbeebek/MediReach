const nodemailer = require('nodemailer');
const config = require('../config');

let transporter;

const getTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.smtp.host,
      port: config.smtp.port,
      secure: config.smtp.port === 465,
      auth: {
        user: config.smtp.user,
        pass: config.smtp.password,
      },
    });
  }
  return transporter;
};

/**
 * Send an email.
 * @param {{ to: string, subject: string, html: string }} options
 */
const sendEmail = async ({ to, subject, html }) => {
  const transport = getTransporter();
  await transport.sendMail({
    from: config.smtp.from,
    to,
    subject,
    html,
  });
};

/**
 * Send a password-reset email.
 * @param {string} to        Recipient email
 * @param {string} resetUrl  Full URL with token
 */
const sendPasswordResetEmail = async (to, resetUrl) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
      <h2 style="color:#2563eb;">MediReach — Password Reset</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password. Click the button below to proceed:</p>
      <a href="${resetUrl}"
         style="display:inline-block;padding:12px 24px;background:#2563eb;color:#fff;
                text-decoration:none;border-radius:6px;margin:16px 0;">
        Reset Password
      </a>
      <p style="font-size:13px;color:#666;">
        If you did not request this, please ignore this email. The link will expire in 1 hour.
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
      <p style="font-size:12px;color:#999;">&copy; MediReach Online Pharmacy</p>
    </div>
  `;

  await sendEmail({ to, subject: 'Reset your MediReach password', html });
};

/**
 * Send a password-reset OTP code via email.
 * @param {string} to    Recipient email
 * @param {string} code  6-digit OTP code
 */
const sendPasswordResetCode = async (to, code) => {
  const html = `
    <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;">
      <h2 style="color:#2563eb;">MediReach — Password Reset Code</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password. Use the code below to proceed:</p>
      <div style="margin:24px 0;text-align:center;">
        <span style="display:inline-block;padding:16px 32px;background:#f0f7ff;border:2px dashed #2563eb;
                     border-radius:10px;font-size:32px;font-weight:bold;letter-spacing:8px;color:#2563eb;">
          ${code}
        </span>
      </div>
      <p style="font-size:14px;color:#333;">
        Enter this code on the password reset page to set a new password.
      </p>
      <p style="font-size:13px;color:#666;">
        If you did not request this, please ignore this email. The code will expire in 1 hour.
      </p>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0;">
      <p style="font-size:12px;color:#999;">&copy; MediReach Online Pharmacy</p>
    </div>
  `;

  await sendEmail({ to, subject: 'Your MediReach Password Reset Code', html });
};

module.exports = { sendEmail, sendPasswordResetEmail, sendPasswordResetCode };

const nodemailer = require('nodemailer');
const { env } = require('../config');
const { logger } = require('../config/logger');
const { ApiError } = require('../utils');

function ensureEmailConfigured() {
  logger.info({ operation: 'smtp.ensureConfigured' }, 'Service invoked');
  if (!env.smtpHost || !env.smtpUser || !env.smtpPass || !env.smtpFromEmail) {
    throw new ApiError(503, 'Email verification is not configured');
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

async function sendVerificationEmail({ name, email, token }) {
  logger.info({ operation: 'smtp.sendVerificationEmail' }, 'Service invoked');
  ensureEmailConfigured();
  const verificationUrl = new URL('/verify-email', env.clientUrls[0]);
  verificationUrl.searchParams.set('token', token);

  try {
    const transporter = nodemailer.createTransport({
      host: env.smtpHost,
      port: env.smtpPort,
      secure: env.smtpSecure,
      auth: { user: env.smtpUser, pass: env.smtpPass },
    });
    const response = await transporter.sendMail({
      from: { name: env.smtpFromName, address: env.smtpFromEmail },
      to: { name, address: email },
      subject: 'Verify your BYNEMSTOYS email',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#402e2a">
          <h1>Welcome to BYNEMSTOYS</h1>
          <p>Hello ${escapeHtml(name)},</p>
          <p>Please verify your email address to activate your account.</p>
          <p><a href="${verificationUrl.toString()}" style="display:inline-block;padding:12px 20px;background:#9c4054;color:#fff;text-decoration:none;border-radius:999px">Verify email</a></p>
          <p>This link expires in one hour. If you did not create this account, you can ignore this email.</p>
        </div>
      `,
    });
    logger.info({
      operation: 'smtp.sendVerificationEmail',
      providerMessageId: response.messageId,
    }, 'Service completed');
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error({
      operation: 'smtp.sendVerificationEmail',
      errorCode: error.code,
      providerResponse: error.response,
    }, 'Service failed');
    throw new ApiError(502, 'Unable to send verification email. Please try again');
  }
}

module.exports = { ensureEmailConfigured, sendVerificationEmail };

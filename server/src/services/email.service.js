const axios = require('axios');
const { env } = require('../config');
const { logger } = require('../config/logger');
const { ApiError } = require('../utils');

function ensureEmailConfigured() {
  logger.info({ operation: 'brevo.ensureConfigured' }, 'Service invoked');
  if (!env.brevoApiKey || !env.brevoSenderEmail) {
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
  logger.info({ operation: 'brevo.sendVerificationEmail' }, 'Service invoked');
  ensureEmailConfigured();
  const verificationUrl = new URL('/verify-email', env.storeUrl);
  verificationUrl.searchParams.set('token', token);

  try {
    const response = await axios.post('https://api.brevo.com/v3/smtp/email', {
      sender: { name: env.brevoSenderName, email: env.brevoSenderEmail },
      to: [{ email, name }],
      subject: 'Verify your BYNEMSTOYS email',
      htmlContent: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#402e2a">
          <h1>Welcome to BYNEMSTOYS</h1>
          <p>Hello ${escapeHtml(name)},</p>
          <p>Please verify your email address to activate your account.</p>
          <p><a href="${verificationUrl.toString()}" style="display:inline-block;padding:12px 20px;background:#9c4054;color:#fff;text-decoration:none;border-radius:999px">Verify email</a></p>
          <p>This link expires in one hour. If you did not create this account, you can ignore this email.</p>
        </div>
      `,
    }, {
      headers: { 'api-key': env.brevoApiKey, accept: 'application/json' },
      timeout: 15000,
    });
    logger.info({
      operation: 'brevo.sendVerificationEmail',
      providerMessageId: response.data?.messageId,
    }, 'Service completed');
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error({
      operation: 'brevo.sendVerificationEmail',
      errorCode: error.code,
      errorMessage: error.message,
      providerStatus: error.response?.status,
      providerResponse: error.response?.data,
    }, 'Service failed');
    throw new ApiError(502, 'Unable to send verification email. Please try again');
  }
}

module.exports = { ensureEmailConfigured, sendVerificationEmail };

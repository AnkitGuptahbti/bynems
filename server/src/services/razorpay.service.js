const crypto = require('crypto');
const axios = require('axios');
const { logger } = require('../config/logger');
const { ApiError } = require('../utils');

const configured = Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET);

async function createPaymentOrder({ amount, receipt, notes = {} }) {
  logger.info({ operation: 'razorpay.createOrder', receipt, amount }, 'Service invoked');
  if (!configured) throw new ApiError(503, 'Online payments are not configured');
  try {
    const response = await axios.post(
      'https://api.razorpay.com/v1/orders',
      { amount: Math.round(amount * 100), currency: 'INR', receipt, notes },
      {
        auth: {
          username: process.env.RAZORPAY_KEY_ID,
          password: process.env.RAZORPAY_KEY_SECRET,
        },
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      }
    );
    logger.info({ operation: 'razorpay.createOrder', receipt, providerOrderId: response.data.id }, 'Service completed');
    return response.data;
  } catch (error) {
    logger.error({
      operation: 'razorpay.createOrder',
      receipt,
      errorCode: error.code,
      providerStatus: error.response?.status,
      providerMessage: error.response?.data?.error?.description,
    }, 'Service failed');
    const message = error.response?.data?.error?.description || 'Unable to create Razorpay order';
    throw new ApiError(error.response?.status || 502, message);
  }
}

function verifyPaymentSignature({ razorpayOrderId, razorpayPaymentId, signature }) {
  logger.info({ operation: 'razorpay.verifyPaymentSignature', razorpayOrderId, razorpayPaymentId }, 'Service invoked');
  if (!process.env.RAZORPAY_KEY_SECRET) return false;
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest('hex');
  const valid = Boolean(signature) && expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  logger.info({ operation: 'razorpay.verifyPaymentSignature', razorpayOrderId, valid }, 'Service completed');
  return valid;
}

function verifyWebhookSignature(rawBody, signature) {
  logger.info({ operation: 'razorpay.verifyWebhookSignature' }, 'Service invoked');
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const valid = expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  logger.info({ operation: 'razorpay.verifyWebhookSignature', valid }, 'Service completed');
  return valid;
}

module.exports = { configured, createPaymentOrder, verifyPaymentSignature, verifyWebhookSignature };

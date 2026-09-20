const axios = require('axios');
const crypto = require('crypto');
const { logger } = require('../config/logger');
const { ApiError } = require('../utils');

const configured = Boolean(process.env.NIMBUSPOST_API_KEY && process.env.NIMBUSPOST_API_SECRET);
const api = axios.create({
  baseURL: process.env.NIMBUSPOST_BASE_URL || 'https://api.nimbuspost.com/v1',
  timeout: 12000,
});

async function request(method, url, data) {
  logger.info({ operation: 'nimbuspost.request', method, endpoint: url }, 'Service invoked');
  if (!configured) throw new ApiError(503, 'Shipping provider is not configured');
  try {
    const response = await api.request({
      method,
      url,
      data,
      headers: {
        Authorization: `Bearer ${process.env.NIMBUSPOST_API_KEY}`,
        'X-API-Secret': process.env.NIMBUSPOST_API_SECRET,
      },
    });
    logger.info({ operation: 'nimbuspost.request', method, endpoint: url, providerStatus: response.status }, 'Service completed');
    return response.data;
  } catch (error) {
    logger.error({
      operation: 'nimbuspost.request',
      method,
      endpoint: url,
      errorCode: error.code,
      providerStatus: error.response?.status,
    }, 'Service failed');
    const message = error.response?.data?.message || 'NimbusPost request failed';
    throw new ApiError(error.response?.status >= 400 && error.response?.status < 500 ? 422 : 502, message);
  }
}

const createShipment = (payload) => {
  logger.info({ operation: 'nimbuspost.createShipment', orderNumber: payload.order_number }, 'Service invoked');
  return request('post', '/shipments', payload);
};
const trackShipment = (awbNumber) => {
  logger.info({ operation: 'nimbuspost.trackShipment', awbNumber }, 'Service invoked');
  return request('get', `/shipments/track/${encodeURIComponent(awbNumber)}`);
};

function verifyWebhook(rawBody, signature) {
  logger.info({ operation: 'nimbuspost.verifyWebhook' }, 'Service invoked');
  const secret = process.env.NIMBUSPOST_WEBHOOK_SECRET;
  if (!secret || !signature) return false;
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  const valid = expected.length === signature.length &&
    crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  logger.info({ operation: 'nimbuspost.verifyWebhook', valid }, 'Service completed');
  return valid;
}

module.exports = { configured, createShipment, trackShipment, verifyWebhook };

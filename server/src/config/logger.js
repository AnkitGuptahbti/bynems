const crypto = require('crypto');
const pino = require('pino');
const pinoHttp = require('pino-http');
const { sanitizeForLog } = require('../middleware/request-logging');

const nodeEnv = process.env.NODE_ENV || 'development';
const logger = pino({
  level: process.env.LOG_LEVEL || (nodeEnv === 'production' ? 'info' : 'debug'),
  enabled: nodeEnv !== 'test',
  base: {
    service: 'bynemsteddy-api',
    environment: nodeEnv,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      'password',
      'token',
      'credential',
      'authorization',
      'cookie',
      'req.headers.authorization',
      'req.headers.cookie',
      'body.password',
      'body.token',
      'body.credential',
      'body.razorpay_signature',
    ],
    censor: '[REDACTED]',
  },
  transport: nodeEnv === 'development'
    ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
        ignore: 'pid,hostname',
        singleLine: true,
      },
    }
    : undefined,
});

function sanitizeUrl(rawUrl) {
  try {
    const parsed = new URL(rawUrl, 'http://local');
    for (const [key, value] of parsed.searchParams.entries()) {
      parsed.searchParams.set(key, sanitizeForLog(value, key));
    }
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return String(rawUrl).split('?')[0];
  }
}

const httpLogger = pinoHttp({
  logger,
  genReqId(req, res) {
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();
    res.setHeader('x-request-id', requestId);
    return requestId;
  },
  customLogLevel(_req, res, error) {
    if (error || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  customSuccessMessage(req, res) {
    return `${req.method} ${sanitizeUrl(req.originalUrl || req.url)} completed with ${res.statusCode}`;
  },
  customErrorMessage(req, res) {
    return `${req.method} ${sanitizeUrl(req.originalUrl || req.url)} failed with ${res.statusCode}`;
  },
  serializers: {
    req(req) {
      return {
        id: req.id,
        method: req.method,
        url: sanitizeUrl(req.url),
        remoteAddress: req.remoteAddress,
        userAgent: req.headers?.['user-agent'],
      };
    },
    res(res) {
      return { statusCode: res.statusCode };
    },
    err: pino.stdSerializers.err,
  },
});

module.exports = { logger, httpLogger };

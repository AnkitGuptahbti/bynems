const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
const { env } = require('./config');
const { httpLogger } = require('./config/logger');
const webhookRoutes = require('./webhooks');
const apiRoutes = require('./routes');
const { ApiError } = require('./utils');
const { notFound, errorHandler } = require('./middleware');
const { requestPayloadLogger } = require('./middleware/request-logging');

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(httpLogger);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({
  origin(origin, callback) {
    if (!origin || env.clientUrls.includes(origin)) return callback(null, true);
    return callback(new ApiError(403, 'Origin is not allowed by CORS'));
  },
  credentials: true,
}));
app.use('/api/webhooks', webhookRoutes);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());
app.use(mongoSanitize({ replaceWith: '_' }));
app.use(requestPayloadLogger);
app.use('/api', rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: env.nodeEnv === 'production' ? 200 : 1000,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests; please try again later' },
}));
app.get('/health', (_req, res) => res.json({ success: true, service: 'bynemsteddy-api', uptime: process.uptime() }));
app.use('/api', apiRoutes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;

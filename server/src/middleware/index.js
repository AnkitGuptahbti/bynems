const jwt = require('jsonwebtoken');
const multer = require('multer');
const { validationResult } = require('express-validator');
const { User } = require('../models');
const { env } = require('../config');
const { logger } = require('../config/logger');
const { ApiError, asyncHandler } = require('../utils');

const protect = asyncHandler(async (req, _res, next) => {
  const headerToken = req.headers.authorization?.startsWith('Bearer ')
    ? req.headers.authorization.slice(7)
    : null;
  const token = headerToken || req.cookies?.token;
  if (!token) throw new ApiError(401, 'Authentication required');
  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret);
  } catch {
    throw new ApiError(401, 'Invalid or expired token');
  }
  const user = await User.findById(payload.sub);
  if (!user || !user.isActive) throw new ApiError(401, 'User account is unavailable');
  if (!user.isEmailVerified) throw new ApiError(403, 'Please verify your email before continuing');
  req.user = user;
  if (req.log) req.log = req.log.child({ userId: user._id.toString(), role: user.role });
  next();
});

const authorize = (...roles) => (req, _res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new ApiError(403, 'Insufficient permissions'));
  next();
};

const validate = (req, _res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) return next();
  const details = errors.array({ onlyFirstError: true });
  return next(new ApiError(422, details[0]?.msg || 'Validation failed', details));
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 10 },
  fileFilter: (_req, file, cb) => cb(null, ['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)),
});

const notFound = (req, _res, next) => next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));

const errorHandler = (err, req, res, _next) => {
  let status = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  if (err.name === 'CastError') { status = 400; message = 'Invalid resource identifier'; }
  if (err.code === 11000) { status = 409; message = `Duplicate value for ${Object.keys(err.keyValue || {}).join(', ')}`; }
  if (err.name === 'ValidationError') { status = 422; message = Object.values(err.errors).map((e) => e.message).join(', '); }
  const requestLogger = req.log || logger;
  const context = {
    err,
    statusCode: status,
    method: req.method,
    path: req.path,
    userId: req.user?._id?.toString(),
  };
  if (status >= 500) requestLogger.error(context, 'Request failed');
  else requestLogger.warn(context, 'Request rejected');
  res.status(status).json({
    success: false,
    message: status === 500 && env.nodeEnv === 'production' ? 'Internal server error' : message,
    ...(err.details && { errors: err.details }),
    ...(env.nodeEnv !== 'production' && { stack: err.stack }),
  });
};

module.exports = { protect, authorize, validate, upload, notFound, errorHandler };

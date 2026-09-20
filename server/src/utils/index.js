const crypto = require('crypto');

class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const createOrderId = () => `BYN-${Date.now().toString(36).toUpperCase()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;

function calculateCouponDiscount(coupon, subtotal) {
  if (!coupon || !coupon.isActive) return 0;
  const amount = coupon.type === 'PERCENT' ? subtotal * coupon.value / 100 : coupon.value;
  return Math.max(0, Math.min(subtotal, coupon.maxDiscount ? Math.min(amount, coupon.maxDiscount) : amount));
}

module.exports = { ApiError, asyncHandler, createOrderId, calculateCouponDiscount };

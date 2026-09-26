const { Coupon } = require('../models');
const { ApiError, asyncHandler, calculateCouponDiscount } = require('../utils');

const validateCoupon = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'coupons.validate', couponCode: req.body.code }, 'Controller invoked');
  const coupon = await Coupon.findOne({ code: req.body.code.toUpperCase(), isActive: true });
  if (!coupon || (coupon.expiresAt && coupon.expiresAt < new Date()) || (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)) throw new ApiError(422, 'Coupon is invalid or expired');
  const subtotal = Number(req.body.subtotal);
  if (subtotal < coupon.minOrderAmount) throw new ApiError(422, `Minimum order amount is ₹${coupon.minOrderAmount}`);
  res.json({ success: true, coupon: { code: coupon.code, discount: calculateCouponDiscount(coupon, subtotal) } });
});

module.exports = { validateCoupon };

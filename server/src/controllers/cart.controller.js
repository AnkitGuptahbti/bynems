const { Cart, Product, Coupon } = require('../models');
const { ApiError, asyncHandler, calculateCouponDiscount } = require('../utils');

function findVariant(product, variantId) {
  return product?.variants?.id(variantId) || product?.variants?.find((variant) => String(variant._id) === String(variantId));
}

async function populatedCart(userId) {
  return Cart.findOne({ user: userId }).populate('items.product', 'name slug images price mrp variants isActive').populate('coupon');
}

function serialize(cart) {
  if (!cart) return { items: [], subtotal: 0, discount: 0, total: 0 };
  const items = cart.items.filter((item) => item.product?.isActive).map((item) => {
    const variant = findVariant(item.product, item.variantId);
    const unitPrice = variant?.price ?? item.product.price;
    return { ...item.toObject(), unitPrice, lineTotal: unitPrice * item.quantity, availableStock: variant?.stock || 0 };
  });
  const subtotal = items.reduce((sum, item) => sum + item.lineTotal, 0);
  const discount = calculateCouponDiscount(cart.coupon, subtotal);
  return { id: cart._id, items, coupon: cart.coupon, subtotal, discount, total: subtotal - discount };
}

const getCart = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'cart.get' }, 'Controller invoked');
  res.json({ success: true, cart: serialize(await populatedCart(req.user._id)) });
});

const addItem = asyncHandler(async (req, res) => {
  const { productId, variantId, quantity = 1, size, color } = req.body;
  req.log.info({ operation: 'cart.addItem', productId, variantId, quantity }, 'Controller invoked');
  const product = await Product.findOne({ _id: productId, isActive: true });
  const variant = findVariant(product, variantId)
    || product?.variants?.find((entry) => entry.label === size && (!color || entry.color === color))
    || product?.variants?.[0];
  if (!product || !variant) throw new ApiError(404, 'Product or variant not found');
  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) cart = new Cart({ user: req.user._id, items: [] });
  const existing = cart.items.find((item) => item.product.equals(product._id) && String(item.variantId) === String(variant._id));
  const newQuantity = (existing?.quantity || 0) + Number(quantity);
  if (newQuantity > variant.stock) throw new ApiError(409, 'Requested quantity exceeds available stock');
  if (existing) existing.quantity = newQuantity;
  else {
    cart.items.push({
      product: product._id,
      variantId: variant._id,
      size: variant.label,
      color: variant.color,
      quantity: newQuantity,
    });
  }
  await cart.save();
  res.status(201).json({ success: true, cart: serialize(await populatedCart(req.user._id)) });
});

const updateItem = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'cart.updateItem', itemId: req.params.itemId, quantity: req.body.quantity }, 'Controller invoked');
  const cart = await Cart.findOne({ user: req.user._id });
  const item = cart?.items.id(req.params.itemId);
  if (!item) throw new ApiError(404, 'Cart item not found');
  const product = await Product.findById(item.product);
  const variant = findVariant(product, item.variantId);
  if (Number(req.body.quantity) > (variant?.stock || 0)) throw new ApiError(409, 'Requested quantity exceeds available stock');
  item.quantity = Number(req.body.quantity);
  await cart.save();
  res.json({ success: true, cart: serialize(await populatedCart(req.user._id)) });
});

const removeItem = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'cart.removeItem', itemId: req.params.itemId }, 'Controller invoked');
  const cart = await Cart.findOneAndUpdate({ user: req.user._id }, { $pull: { items: { _id: req.params.itemId } } }, { new: true });
  if (!cart) throw new ApiError(404, 'Cart not found');
  res.json({ success: true, cart: serialize(await populatedCart(req.user._id)) });
});

const applyCoupon = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'cart.applyCoupon', couponCode: req.body.code }, 'Controller invoked');
  const coupon = await Coupon.findOne({ code: req.body.code.toUpperCase(), isActive: true });
  if (!coupon || (coupon.expiresAt && coupon.expiresAt < new Date()) || (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit)) {
    throw new ApiError(422, 'Coupon is invalid or expired');
  }
  const cart = await populatedCart(req.user._id);
  if (!cart || serialize(cart).subtotal < coupon.minOrderAmount) throw new ApiError(422, `Minimum order amount is ₹${coupon.minOrderAmount}`);
  cart.coupon = coupon._id;
  await cart.save();
  res.json({ success: true, cart: serialize(await populatedCart(req.user._id)) });
});

const clearCart = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'cart.clear' }, 'Controller invoked');
  await Cart.findOneAndUpdate({ user: req.user._id }, { items: [], coupon: null }, { upsert: true });
  res.json({ success: true, cart: { items: [], subtotal: 0, discount: 0, total: 0 } });
});

module.exports = { getCart, addItem, updateItem, removeItem, applyCoupon, clearCart };

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const { Schema, model } = mongoose;
const imageSchema = new Schema({ url: { type: String, required: true }, publicId: String, alt: String }, { _id: false });
const addressFields = {
  fullName: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  address: { type: String, required: true, trim: true },
  apartment: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  pincode: { type: String, required: true, trim: true },
  country: { type: String, default: 'India' },
};

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, trim: true },
  password: { type: String, minlength: 8, select: false },
  googleId: { type: String, unique: true, sparse: true, select: false },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, select: false },
  emailVerificationExpires: { type: Date, select: false },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  isActive: { type: Boolean, default: true },
  wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
}, { timestamps: true });
userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});
userSchema.methods.comparePassword = function comparePassword(value) {
  return bcrypt.compare(value, this.password);
};

const categorySchema = new Schema({
  name: { type: String, required: true, unique: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: String,
  image: imageSchema,
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 },
}, { timestamps: true });

const variantSchema = new Schema({
  label: { type: String, required: true, trim: true },
  color: { type: String, required: true, trim: true },
  lengthCm: { type: Number, required: true, min: 0 },
  breadthCm: { type: Number, required: true, min: 0 },
  heightCm: { type: Number, required: true, min: 0 },
  weightGrams: { type: Number, required: true, min: 0 },
  stock: { type: Number, required: true, min: 0, default: 0 },
  price: { type: Number, required: true, min: 0 },
  sku: { type: String, required: true, trim: true, uppercase: true },
  images: [imageSchema],
});

const productSchema = new Schema({
  name: { type: String, required: true, trim: true, index: 'text' },
  slug: { type: String, required: true, unique: true, lowercase: true },
  sku: { type: String, required: true, unique: true, uppercase: true },
  category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
  description: { type: String, required: true },
  specifications: { type: Map, of: String },
  tags: [{ type: String, lowercase: true, trim: true }],
  images: [imageSchema],
  price: { type: Number, required: true, min: 0 },
  mrp: { type: Number, required: true, min: 0 },
  variants: { type: [variantSchema], validate: [(value) => value.length > 0, 'At least one variant is required'] },
  featured: { type: Boolean, default: false },
  bestseller: { type: Boolean, default: false },
  newArrival: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.virtual('discountPercent').get(function discountPercent() {
  return this.mrp > this.price ? Math.round(((this.mrp - this.price) / this.mrp) * 100) : 0;
});
productSchema.set('toJSON', { virtuals: true });

const cartSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items: [{
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId },
    size: { type: String, required: true },
    color: String,
    quantity: { type: Number, min: 1, max: 20, required: true },
  }],
  coupon: { type: Schema.Types.ObjectId, ref: 'Coupon', default: null },
}, { timestamps: true });

const addressSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  label: { type: String, default: 'Home' },
  ...addressFields,
  isDefault: { type: Boolean, default: false },
}, { timestamps: true });

const orderItemSchema = new Schema({
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  name: String,
  image: String,
  variantId: Schema.Types.ObjectId,
  size: String,
  color: String,
  lengthCm: Number,
  breadthCm: Number,
  heightCm: Number,
  weightGrams: Number,
  sku: String,
  quantity: { type: Number, min: 1 },
  unitPrice: { type: Number, min: 0 },
  total: { type: Number, min: 0 },
}, { _id: false });

const trackingEventSchema = new Schema({
  status: String,
  description: String,
  location: String,
  occurredAt: { type: Date, default: Date.now },
}, { _id: false });

const orderSchema = new Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  items: [orderItemSchema],
  subtotal: { type: Number, required: true },
  discount: { type: Number, default: 0 },
  shippingCharge: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  couponCode: String,
  paymentMethod: { type: String, enum: ['ONLINE', 'COD'], required: true },
  paymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'], default: 'PENDING' },
  orderStatus: { type: String, enum: ['PENDING', 'PLACED', 'CONFIRMED', 'PACKED', 'SHIPPED', 'DELIVERED', 'CANCELLED'], default: 'PENDING' },
  shippingStatus: { type: String, default: 'PENDING' },
  shippingAddress: { type: new Schema(addressFields, { _id: false }), required: true },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  nimbusOrderId: String,
  awbNumber: String,
  courier: String,
  estimatedDelivery: Date,
  tracking: [trackingEventSchema],
}, { timestamps: true });

const paymentSchema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
  provider: { type: String, default: 'razorpay' },
  providerOrderId: { type: String, index: true },
  providerPaymentId: String,
  amount: Number,
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['created', 'captured', 'failed', 'refunded'], default: 'created' },
  raw: Schema.Types.Mixed,
}, { timestamps: true });

const shipmentSchema = new Schema({
  order: { type: Schema.Types.ObjectId, ref: 'Order', required: true, unique: true },
  provider: { type: String, default: 'nimbuspost' },
  providerOrderId: String,
  awbNumber: { type: String, index: true },
  courier: String,
  status: { type: String, default: 'PENDING' },
  estimatedDelivery: Date,
  tracking: [trackingEventSchema],
  raw: Schema.Types.Mixed,
}, { timestamps: true });

const couponSchema = new Schema({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  type: { type: String, enum: ['PERCENT', 'FIXED'], required: true },
  value: { type: Number, required: true, min: 0 },
  maxDiscount: Number,
  minOrderAmount: { type: Number, default: 0 },
  expiresAt: Date,
  usageLimit: Number,
  usedCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const reviewSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  order: { type: Schema.Types.ObjectId, ref: 'Order' },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: String,
  comment: { type: String, required: true, maxlength: 2000 },
  isApproved: { type: Boolean, default: true },
}, { timestamps: true });
reviewSchema.index({ user: 1, product: 1 }, { unique: true });

module.exports = {
  User: model('User', userSchema),
  Product: model('Product', productSchema),
  Category: model('Category', categorySchema),
  Cart: model('Cart', cartSchema),
  Order: model('Order', orderSchema),
  Payment: model('Payment', paymentSchema),
  Shipment: model('Shipment', shipmentSchema),
  Coupon: model('Coupon', couponSchema),
  Review: model('Review', reviewSchema),
  Address: model('Address', addressSchema),
};

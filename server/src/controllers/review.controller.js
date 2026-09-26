const { Order, Review } = require('../models');
const { ApiError, asyncHandler } = require('../utils');

const publishedFilter = {
  $or: [
    { status: 'APPROVED' },
    { status: { $exists: false }, isApproved: true },
  ],
};

function reviewStatus(review) {
  if (review.status) return review.status;
  return review.isApproved ? 'APPROVED' : 'PENDING';
}

const listReviews = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'reviews.list', productId: req.params.productId }, 'Controller invoked');
  const reviews = await Review.find({ product: req.params.productId, ...publishedFilter }).populate('user', 'name').sort('-createdAt');
  res.json({ success: true, reviews });
});

const listMyReviews = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'reviews.mine' }, 'Controller invoked');
  const reviews = await Review.find({ user: req.user._id }).select('product rating comment status isApproved createdAt').sort('-createdAt');
  res.json({ success: true, reviews: reviews.map((review) => ({ ...review.toJSON(), status: reviewStatus(review) })) });
});

const getReviewEligibility = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'reviews.eligibility', productId: req.params.productId }, 'Controller invoked');
  const existing = await Review.findOne({ user: req.user._id, product: req.params.productId }).select('rating comment status isApproved createdAt');
  if (existing) {
    return res.json({
      success: true,
      canReview: false,
      alreadyReviewed: true,
      status: reviewStatus(existing),
      review: existing,
    });
  }
  const delivered = await Order.findOne({
    user: req.user._id,
    orderStatus: 'DELIVERED',
    'items.product': req.params.productId,
  }).select('_id');
  res.json({ success: true, canReview: Boolean(delivered), alreadyReviewed: false, status: null });
});

const createReview = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'reviews.create', productId: req.params.productId, rating: req.body.rating }, 'Controller invoked');
  const existing = await Review.findOne({ user: req.user._id, product: req.params.productId }).select('_id');
  if (existing) throw new ApiError(409, 'You have already reviewed this product');
  const delivered = await Order.findOne({
    user: req.user._id,
    orderStatus: 'DELIVERED',
    'items.product': req.params.productId,
  }).select('_id');
  if (!delivered) throw new ApiError(403, 'You can review this product after your order is delivered');
  const review = await Review.create({
    rating: req.body.rating,
    comment: req.body.comment,
    title: req.body.title,
    product: req.params.productId,
    user: req.user._id,
    order: delivered._id,
    status: 'PENDING',
    isApproved: false,
  });
  res.status(201).json({ success: true, review, message: 'Review submitted for approval' });
});

const listAdminReviews = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'reviews.admin.list', status: req.query.status }, 'Controller invoked');
  const status = String(req.query.status || '').toUpperCase();
  let filter = {};
  if (status === 'PENDING') filter = { $or: [{ status: 'PENDING' }, { status: { $exists: false }, isApproved: false }] };
  else if (status === 'APPROVED') filter = { $or: [{ status: 'APPROVED' }, { status: { $exists: false }, isApproved: true }] };
  else if (status === 'REJECTED') filter = { status: 'REJECTED' };
  const reviews = await Review.find(filter)
    .populate('user', 'name email')
    .populate('product', 'name slug images')
    .sort('-createdAt');
  res.json({
    success: true,
    reviews: reviews.map((review) => ({ ...review.toJSON(), status: reviewStatus(review) })),
  });
});

const moderateReview = asyncHandler(async (req, res) => {
  const status = String(req.body.status || '').toUpperCase();
  req.log.info({ operation: 'reviews.admin.moderate', reviewId: req.params.id, status }, 'Controller invoked');
  if (!['APPROVED', 'REJECTED'].includes(status)) throw new ApiError(422, 'Choose approve or reject');
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { status, isApproved: status === 'APPROVED' },
    { new: true, runValidators: true }
  ).populate('user', 'name email').populate('product', 'name slug images');
  if (!review) throw new ApiError(404, 'Review not found');
  res.json({ success: true, review: { ...review.toJSON(), status: reviewStatus(review) } });
});

module.exports = { listReviews, listMyReviews, getReviewEligibility, createReview, listAdminReviews, moderateReview };

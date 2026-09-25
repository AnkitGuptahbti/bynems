const { body, query } = require('express-validator');

const indianPhone = (field = 'phone', { optional = false } = {}) => {
  const rule = body(field).trim();
  if (optional) rule.optional({ values: 'falsy' });
  else rule.notEmpty().withMessage('Enter a valid 10-digit Indian mobile number');
  return rule.matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number');
};

const emailField = (field = 'email', { optional = false } = {}) => {
  const rule = body(field).trim();
  if (optional) rule.optional({ values: 'falsy' });
  return rule.isEmail().withMessage('Enter a valid email address').normalizeEmail();
};

const addressValidators = (prefix = '') => {
  const field = (name) => (prefix ? `${prefix}.${name}` : name);
  return [
    body(field('label')).optional({ values: 'falsy' }).trim().isLength({ min: 2, max: 30 }).withMessage('Address label must be 2-30 characters'),
    body(field('fullName')).trim().isLength({ min: 2, max: 80 }).withMessage('Enter a valid full name'),
    indianPhone(field('phone')),
    emailField(field('email'), { optional: true }),
    body(field('address')).trim().isLength({ min: 8, max: 200 }).withMessage('Enter a complete street address'),
    body(field('apartment')).optional({ values: 'falsy' }).trim().isLength({ max: 120 }).withMessage('Apartment or landmark is too long'),
    body(field('city')).trim().isLength({ min: 2, max: 80 }).withMessage('Enter a valid city'),
    body(field('state')).trim().isLength({ min: 2, max: 80 }).withMessage('Select a valid state'),
    body(field('pincode')).trim().matches(/^\d{6}$/).withMessage('Pincode must be 6 digits'),
    body(field('country')).optional({ values: 'falsy' }).trim().isLength({ min: 2, max: 80 }).withMessage('Enter a valid country'),
  ];
};

const trackPhone = query('phone').trim().matches(/^[6-9]\d{9}$/).withMessage('Enter the 10-digit mobile number used for the order');

module.exports = { indianPhone, emailField, addressValidators, trackPhone };

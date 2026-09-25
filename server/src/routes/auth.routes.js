const express = require('express');
const { body } = require('express-validator');
const auth = require('../controllers/auth.controller');
const { protect, validate } = require('../middleware');

const router = express.Router();

const validateRegister = [
  body('name').trim().isLength({ min: 2, max: 80 }).withMessage('Enter a valid full name'),
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be at least 8 characters'),
  body('phone').trim().matches(/^[6-9]\d{9}$/).withMessage('Enter a valid 10-digit Indian mobile number'),
  validate,
];
const validateLogin = [
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  body('password').notEmpty().withMessage('Enter your password'),
  validate,
];
const validateEmailVerification = [
  body('token').isHexadecimal().isLength({ min: 64, max: 64 }).withMessage('Verification link is invalid or incomplete'),
  validate,
];
const validateResendVerification = [
  body('email').isEmail().withMessage('Enter a valid email address').normalizeEmail(),
  validate,
];
const validateGoogleLogin = [
  body('credential').isString().notEmpty().withMessage('Google sign-in could not be completed'),
  validate,
];

router.post('/register', validateRegister, auth.register);
router.post('/login', validateLogin, auth.login);
router.post('/verify-email', validateEmailVerification, auth.verifyEmail);
router.post('/resend-verification', validateResendVerification, auth.resendVerification);
router.post('/google', validateGoogleLogin, auth.googleLogin);
router.get('/me', protect, auth.me);
router.post('/logout', auth.logout);

module.exports = router;

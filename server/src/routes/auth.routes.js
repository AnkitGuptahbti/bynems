const express = require('express');
const { body } = require('express-validator');
const auth = require('../controllers/auth.controller');
const { protect, validate } = require('../middleware');

const router = express.Router();

const validateRegister = [
  body('name').trim().isLength({ min: 2, max: 80 }),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8, max: 128 }),
  body('phone').optional().isMobilePhone('en-IN'),
  validate,
];
const validateLogin = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
];
const validateEmailVerification = [
  body('token').isHexadecimal().isLength({ min: 64, max: 64 }),
  validate,
];
const validateResendVerification = [
  body('email').isEmail().normalizeEmail(),
  validate,
];
const validateGoogleLogin = [
  body('credential').isString().notEmpty(),
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

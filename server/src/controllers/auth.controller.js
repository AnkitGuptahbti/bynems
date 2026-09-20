const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const { User } = require('../models');
const { env } = require('../config');
const { ApiError, asyncHandler } = require('../utils');
const { ensureEmailConfigured, sendVerificationEmail } = require('../services/email.service');

const googleClient = new OAuth2Client();

function issueToken(user) {
  return jwt.sign({ sub: user._id.toString(), role: user.role }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, phone: user.phone, role: user.role };
}

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.nodeEnv === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function createVerificationToken() {
  const token = crypto.randomBytes(32).toString('hex');
  return {
    token,
    tokenHash: crypto.createHash('sha256').update(token).digest('hex'),
    expires: new Date(Date.now() + 60 * 60 * 1000),
  };
}

const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body;
  req.log.info({ operation: 'auth.register' }, 'Controller invoked');
  ensureEmailConfigured();
  if (await User.exists({ email: email.toLowerCase() })) throw new ApiError(409, 'Email is already registered');
  const verification = createVerificationToken();
  const user = await User.create({
    name,
    email,
    phone,
    password,
    isEmailVerified: false,
    emailVerificationToken: verification.tokenHash,
    emailVerificationExpires: verification.expires,
  });
  try {
    await sendVerificationEmail({ name: user.name, email: user.email, token: verification.token });
  } catch (error) {
    await User.deleteOne({ _id: user._id });
    throw error;
  }
  res.status(201).json({
    success: true,
    message: 'Account created. Check your email to verify your account before logging in.',
  });
  req.log.info({ userId: user._id.toString() }, 'User registered');
});

const login = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'auth.login' }, 'Controller invoked');
  const user = await User.findOne({ email: req.body.email.toLowerCase() }).select('+password');
  if (!user || !user.password || !(await user.comparePassword(req.body.password))) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.isActive) throw new ApiError(403, 'Account is disabled');
  if (!user.isEmailVerified) throw new ApiError(403, 'Please verify your email before logging in');
  const token = issueToken(user);
  setAuthCookie(res, token);
  req.log.info({ userId: user._id.toString(), role: user.role }, 'User logged in');
  res.json({ success: true, token, user: publicUser(user) });
});

const verifyEmail = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'auth.verifyEmail' }, 'Controller invoked');
  const tokenHash = crypto.createHash('sha256').update(req.body.token).digest('hex');
  const user = await User.findOne({
    emailVerificationToken: tokenHash,
    emailVerificationExpires: { $gt: new Date() },
  }).select('+emailVerificationToken +emailVerificationExpires');
  if (!user) throw new ApiError(400, 'Verification link is invalid or has expired');

  user.isEmailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save();
  req.log.info({ userId: user._id.toString() }, 'User email verified');
  res.json({ success: true, message: 'Email verified. You can now log in.' });
});

const resendVerification = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'auth.resendVerification' }, 'Controller invoked');
  ensureEmailConfigured();
  const user = await User.findOne({ email: req.body.email.toLowerCase() });
  const response = {
    success: true,
    message: 'If an unverified account exists, a new verification email has been sent.',
  };
  if (!user || user.isEmailVerified) return res.json(response);

  const verification = createVerificationToken();
  user.emailVerificationToken = verification.tokenHash;
  user.emailVerificationExpires = verification.expires;
  await user.save();
  await sendVerificationEmail({ name: user.name, email: user.email, token: verification.token });
  return res.json(response);
});

const googleLogin = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'auth.googleLogin' }, 'Controller invoked');
  if (!env.googleClientId) throw new ApiError(503, 'Google sign-in is not configured');
  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: req.body.credential,
      audience: env.googleClientId,
    });
    payload = ticket.getPayload();
  } catch {
    throw new ApiError(401, 'Invalid Google credential');
  }
  if (!payload?.sub || !payload.email || !payload.email_verified) {
    throw new ApiError(401, 'Google email is not verified');
  }

  let user = await User.findOne({ $or: [{ googleId: payload.sub }, { email: payload.email.toLowerCase() }] });
  if (!user) {
    user = new User({
      name: payload.name || payload.email.split('@')[0],
      email: payload.email,
      googleId: payload.sub,
      isEmailVerified: true,
    });
  } else {
    if (!user.isActive) throw new ApiError(403, 'Account is disabled');
    user.googleId = payload.sub;
    user.isEmailVerified = true;
  }
  await user.save();

  const token = issueToken(user);
  setAuthCookie(res, token);
  req.log.info({ userId: user._id.toString(), role: user.role }, 'User logged in with Google');
  res.json({ success: true, token, user: publicUser(user) });
});

const me = asyncHandler(async (req, res) => {
  req.log.info({ operation: 'auth.me' }, 'Controller invoked');
  res.json({ success: true, user: publicUser(req.user) });
});
const logout = (req, res) => {
  req.log.info({ operation: 'auth.logout' }, 'Controller invoked');
  res.clearCookie('token').json({ success: true, message: 'Logged out' });
};

module.exports = { register, login, verifyEmail, resendVerification, googleLogin, me, logout };

const mongoose = require('mongoose');
const { v2: cloudinary } = require('cloudinary');

const clientUrls = (process.env.CLIENT_URL || 'http://localhost:3000')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

function storeUrlScore(url) {
  try {
    const { hostname } = new URL(url);
    if (hostname === 'www.bynemstoys.com') return 3;
    if (hostname === 'bynemstoys.com') return 2;
    if (hostname.endsWith('.vercel.app')) return 0;
    return 1;
  } catch {
    return -1;
  }
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  clientUrls,
  storeUrl: process.env.STORE_URL?.trim() || [...clientUrls].sort((a, b) => storeUrlScore(b) - storeUrlScore(a))[0],
  brevoApiKey: process.env.BREVO_API_KEY,
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL,
  brevoSenderName: process.env.BREVO_SENDER_NAME || 'BYNEMSTEDDY',
  googleClientId: process.env.GOOGLE_CLIENT_ID,
  shippingCharge: Number(process.env.SHIPPING_CHARGE) || 99,
  freeShippingThreshold: Number(process.env.FREE_SHIPPING_THRESHOLD) || 1499,
};

function validateEnv() {
  const missing = ['MONGODB_URI', 'JWT_SECRET'].filter((key) => !process.env[key]);
  if (missing.length) throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

async function connectDatabase() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 10000 });
}

const cloudinaryConfigured = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (cloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

module.exports = { env, validateEnv, connectDatabase, cloudinary, cloudinaryConfigured };

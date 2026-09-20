require('dotenv').config();
const slugify = require('slugify');
const { connectDatabase } = require('../config');
const { logger } = require('../config/logger');
const { Category, Product, User } = require('../models');

const cloudinaryImages = [
  'https://res.cloudinary.com/vtqlnbr7/image/upload/v1789845925/luwadlin-bosman-WAVA6ZbothA-unsplash_lpwlh5.jpg',
  'https://res.cloudinary.com/vtqlnbr7/image/upload/v1789845925/aedrian-salazar-BYTHFbiTL1w-unsplash_i3glof.jpg',
  'https://res.cloudinary.com/vtqlnbr7/image/upload/v1789845922/natalie-kinnear-0hZAhSF9uuY-unsplash_muhqbo.jpg',
  'https://res.cloudinary.com/vtqlnbr7/image/upload/v1789845922/fer-troulik-cUloFtZErQM-unsplash_nqjive.jpg',
];

const categories = [
  { name: 'Teddy Bears', description: 'Timeless cuddles for every age', image: { url: cloudinaryImages[0], alt: 'Teddy Bears' }, sortOrder: 1 },
  { name: 'Animal Soft Toys', description: 'A soft and friendly little zoo', image: { url: cloudinaryImages[1], alt: 'Animal Soft Toys' }, sortOrder: 2 },
  { name: 'Divine / Religious Characters', description: 'Blessings made huggable', image: { url: cloudinaryImages[2], alt: 'Divine and religious characters' }, sortOrder: 3 },
  { name: 'Cartoon Characters', description: 'Cheerful friends for playtime', image: { url: cloudinaryImages[3], alt: 'Cartoon Characters' }, sortOrder: 4 },
  { name: 'Superhero Characters', description: 'Big courage for little heroes', image: { url: cloudinaryImages[0], alt: 'Superhero Characters' }, sortOrder: 5 },
  { name: 'Kids / Gift Collection', description: 'Thoughtful smiles, beautifully packed', image: { url: cloudinaryImages[2], alt: 'Kids and gift collection' }, sortOrder: 6 },
];

const products = [
  { name: 'Cocoa Classic Teddy', sku: 'BYN-COCOA-01', category: 'Teddy Bears', price: 899, mrp: 1299, tags: ['teddy', 'classic', 'birthday'], featured: true, bestseller: true, image: cloudinaryImages[0] },
  { name: 'Little Love Teddy', sku: 'BYN-LOVE-01', category: 'Teddy Bears', price: 749, mrp: 1099, tags: ['teddy', 'love', 'gift'], featured: true, bestseller: true, image: cloudinaryImages[1] },
  { name: 'Rose Hug Teddy', sku: 'BYN-ROSE-01', category: 'Kids / Gift Collection', price: 999, mrp: 1399, tags: ['rose', 'romantic', 'gift'], newArrival: true, image: cloudinaryImages[2] },
  { name: 'Golden Gentle Bear', sku: 'BYN-GOLD-01', category: 'Teddy Bears', price: 1199, mrp: 1599, tags: ['premium', 'golden', 'teddy'], featured: true, image: cloudinaryImages[3] },
  { name: 'Birthday Cuddle Bear', sku: 'BYN-BDAY-01', category: 'Kids / Gift Collection', price: 849, mrp: 1199, tags: ['birthday', 'kids', 'gift'], bestseller: true, image: cloudinaryImages[0] },
  { name: 'Tiny Heart Companion', sku: 'BYN-HEART-01', category: 'Kids / Gift Collection', price: 649, mrp: 899, tags: ['small', 'heart', 'gift'], newArrival: true, image: cloudinaryImages[1] },
  { name: 'Blessings Plush Friend', sku: 'BYN-BLESS-01', category: 'Divine / Religious Characters', price: 1099, mrp: 1499, tags: ['divine', 'blessing', 'gift'], newArrival: true, image: cloudinaryImages[2] },
  { name: 'Brave Little Hero Bear', sku: 'BYN-HERO-01', category: 'Superhero Characters', price: 1299, mrp: 1799, tags: ['hero', 'kids', 'adventure'], featured: true, image: cloudinaryImages[3] },
];

async function seed() {
  if (!process.env.MONGODB_URI) throw new Error('MONGODB_URI is required');
  await connectDatabase();
  await Category.updateMany(
    { slug: { $in: ['animal-friends', 'gift-sets'] } },
    { $set: { isActive: false } }
  );
  await Product.updateMany(
    { sku: { $in: ['BTN-HONEY-01', 'BTN-BLUSH-01', 'BTN-NIGHT-01', 'BTN-BUNNY-01', 'BTN-ELEPH-01', 'BTN-LION-01', 'BTN-PAIR-01', 'BTN-HAMPER-01'] } },
    { $set: { isActive: false } }
  );
  const categoryMap = {};
  for (const item of categories) {
    const slug = slugify(item.name, { lower: true, strict: true });
    categoryMap[item.name] = await Category.findOneAndUpdate({ slug }, { ...item, slug, isActive: true }, { upsert: true, new: true });
  }
  for (const item of products) {
    const { category, image, ...data } = item;
    await Product.findOneAndUpdate(
      { sku: data.sku },
      {
        ...data,
        slug: slugify(data.name, { lower: true, strict: true }),
        category: categoryMap[category]._id,
        description: `${data.name} made with a velvety-soft outer fabric and child-friendly filling. A comforting companion and thoughtful gift.`,
        specifications: { Material: 'Premium plush fabric', Filling: 'Soft recycled polyester', Care: 'Gentle hand wash', Origin: 'India' },
        images: [
          { url: image, alt: data.name },
          { url: cloudinaryImages[(products.indexOf(item) + 1) % cloudinaryImages.length], alt: `${data.name} alternate view` },
        ],
        variants: [
          { label: '10×10×10 cm', color: 'Brown', lengthCm: 10, breadthCm: 10, heightCm: 10, weightGrams: 180, stock: 24, price: data.price, sku: `${data.sku}-BR-S`, images: [{ url: cloudinaryImages[0], alt: `${data.name} brown 10cm` }] },
          { label: '15×15×40 cm', color: 'Brown', lengthCm: 15, breadthCm: 15, heightCm: 40, weightGrams: 420, stock: 16, price: data.price + 300, sku: `${data.sku}-BR-M`, images: [{ url: cloudinaryImages[1], alt: `${data.name} brown 15cm` }] },
          { label: '10×10×10 cm', color: 'Cream', lengthCm: 10, breadthCm: 10, heightCm: 10, weightGrams: 180, stock: 12, price: data.price, sku: `${data.sku}-CR-S`, images: [{ url: cloudinaryImages[2], alt: `${data.name} cream 10cm` }] },
        ],
        isActive: true,
      },
      { upsert: true, new: true, runValidators: true }
    );
    await Product.updateOne({ sku: data.sku }, { $unset: { sizes: 1 } });
  }
  if (process.env.SEED_ADMIN_EMAIL && process.env.SEED_ADMIN_PASSWORD) {
    const email = process.env.SEED_ADMIN_EMAIL.toLowerCase();
    const existing = await User.findOne({ email });
    if (existing) {
      existing.role = 'admin';
      existing.isEmailVerified = true;
      await existing.save();
    } else {
      await User.create({
        name: 'Store Admin',
        email,
        password: process.env.SEED_ADMIN_PASSWORD,
        role: 'admin',
        isEmailVerified: true,
      });
    }
  }
  logger.info({ categories: categories.length, products: products.length }, 'Catalogue seed completed');
  process.exit(0);
}

seed().catch((error) => {
  logger.fatal({ err: error }, 'Catalogue seed failed');
  process.exit(1);
});

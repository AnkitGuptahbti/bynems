Build a complete modern B2C e-commerce website for a soft-toy brand called "BYNEMSTEDDY".

TECH STACK
- Frontend: React.js
- Styling: Tailwind CSS
- Backend: Node.js + Express.js
- Database: MongoDB
- Image storage: Cloudinary
- Payment: Razorpay
- Shipping: NimbusPost
- Authentication: JWT
- Responsive: Mobile-first
- Use reusable React components
- Do not use hardcoded product data in the UI; structure the frontend to consume REST APIs from the backend.

BRAND
Brand name: BYNEMSTEDDY

The business manufactures and sells soft toys and character-based toys directly to customers.

Product categories:
1. Teddy Bears
2. Animal Soft Toys
3. Divine / Religious Characters
4. Cartoon Characters
5. Superhero Characters
6. Kids / Gift Collection

DESIGN DIRECTION
Create a premium, cute, modern D2C e-commerce experience.

The website should feel:
- Cute
- Warm
- Premium
- Trustworthy
- Family-friendly
- Gift-oriented
- Modern Indian D2C brand

Do NOT make it look like:
- Amazon
- IndiaMART
- A generic toy store
- A childish school website
- A marketplace

Use a clean white/cream background with soft rounded cards, beautiful product photography, subtle shadows, generous spacing and a strong visual hierarchy.

Products themselves should provide most of the color.

Use tasteful animations and hover effects, but don't over-animate the website.

==================================================
HOME PAGE
==================================================

Create the homepage in this order:

1. NAVBAR

Desktop:
- BYNEMSTEDDY logo/name on the left
- Home
- Shop
- Categories
- New Arrivals
- Best Sellers
- About
- Search icon
- Account icon
- Wishlist icon
- Cart icon

Mobile:
- Logo
- Search
- Cart
- Hamburger menu

Navbar should be sticky.

==================================================

2. HERO SECTION
==================================================

Create a large premium hero section.

Headline:

"MAKE EVERY MOMENT A LITTLE MORE SPECIAL"

Subheading:

"Cute, cuddly and lovable soft toys made for every special moment."

CTA buttons:

[ SHOP NOW ]
[ EXPLORE COLLECTION ]

Use a large high-quality lifestyle/product image showing multiple soft toys together.

The hero should immediately communicate that BYNEMSTEDDY is a soft-toy and gifting brand.

==================================================

3. SHOP BY CATEGORY
==================================================

Heading:

"SHOP BY CATEGORY"

Create visually attractive category cards for:

- Teddy Bears
- Animal Soft Toys
- Divine
- Cartoon Characters
- Superheroes
- Gifts

Each card should contain:
- Category image
- Category name
- Short description
- "Shop Now →"

Use large images and rounded cards.

On desktop: 3 cards per row.

On mobile: 2 cards per row or horizontal scrolling where appropriate.

==================================================

4. BEST SELLERS
==================================================

Heading:

"BEST SELLERS"

Subheading:

"Some of our most-loved cuddly companions."

Create a responsive product carousel/grid.

Each ProductCard should display:

- Product image
- Product name
- Category
- Rating
- Current price
- Original/MRP price
- Discount percentage
- Wishlist heart
- Add to Cart button

Example products can be dummy products for UI development, but structure the code so real products will later come from MongoDB.

Do not use copyrighted celebrity/movie character images as placeholders.

==================================================

5. NEW ARRIVALS
==================================================

Create a New Arrivals section.

Show 4-8 products.

Include:

- Product image
- Product name
- Price
- Rating
- NEW badge
- Wishlist
- Add to Cart

CTA:

[ VIEW ALL PRODUCTS ]

==================================================

6. GIFT / OCCASION SECTION
==================================================

Create:

"GIFTS FOR EVERY SPECIAL MOMENT"

Categories:

- Birthday
- Baby Gifts
- Festivals
- Kids
- Couple Gifts
- Just Because

Use beautiful visual cards.

==================================================

7. BRAND STORY
==================================================

Create a split section:

Left:
Beautiful soft-toy image.

Right:

"MADE TO BRING SMILES"

Write a short brand story about creating lovable soft toys and memorable gifts.

CTA:

[ OUR STORY ]

==================================================

8. WHY BYNEMSTEDDY
==================================================

Create 4-6 trust features:

- Premium Quality
- Soft & Comfortable
- Secure Payments
- Fast Delivery
- Easy Returns
- Carefully Packed

Use simple line icons.

==================================================

9. CUSTOMER REVIEWS
==================================================

Create a testimonials/reviews section.

Each review should contain:

- Customer name
- Star rating
- Review
- Optional product name

Use realistic placeholder data only for UI development.

Clearly structure it so real reviews can later come from MongoDB.

==================================================

10. INSTAGRAM / SOCIAL SECTION
==================================================

Create:

"FOLLOW OUR WORLD OF CUTE"

Show a grid of product/lifestyle images.

CTA:

"@BYNEMSTEDDY"

==================================================

11. NEWSLETTER
==================================================

Create a simple newsletter section:

"GET THE CUTEST UPDATES"

Input:
Email address

Button:
Subscribe

==================================================

12. FOOTER
==================================================

Footer columns:

SHOP
- Teddy Bears
- Animals
- Divine
- Cartoon
- Superhero
- New Arrivals

HELP
- Contact Us
- Shipping
- Returns
- FAQs
- Track Order

COMPANY
- About Us
- Privacy Policy
- Terms & Conditions
- Refund Policy

SOCIAL:
Instagram
Facebook
WhatsApp

==================================================
SHOP PAGE
==================================================

Create a professional product listing page.

Top:

SHOP ALL

Category tabs:

All
Teddy
Animals
Divine
Cartoon
Superhero
Gifts

Sidebar/Desktop filters:

- Category
- Price
- Size
- Availability
- Rating

Sort dropdown:

- Popular
- Newest
- Price: Low to High
- Price: High to Low
- Rating

Product grid:
4 columns desktop
2 columns tablet
2 columns mobile

Use pagination or "Load More".

==================================================
PRODUCT DETAILS PAGE
==================================================

Create a premium product detail page.

Left:
Large product image gallery.

Use Cloudinary-ready image URLs.

Right:

Product name
Rating
Review count
Price
MRP
Discount

Size selector:
Small
Medium
Large

Quantity selector.

Buttons:

[ ADD TO CART ]
[ BUY NOW ]

Then:

- Delivery/pincode checker
- Estimated delivery
- Secure payment
- Easy returns
- Product highlights

Below product section:

Tabs/sections:

Description
Specifications
Size Guide
Shipping & Returns
Reviews

Also create:

"YOU MAY ALSO LIKE"

with related products.

==================================================
SEARCH
==================================================

Create a search overlay/page.

Search products by:

- Product name
- Category
- Tags

Show live search suggestions.

==================================================
CART
==================================================

Create a modern cart page.

Each item:

Product image
Product name
Selected size
Price
Quantity
Remove
Wishlist

Order summary:

Subtotal
Discount
Shipping
Total

CTA:

[ PROCEED TO CHECKOUT ]

Also support coupon codes.

==================================================
CHECKOUT
==================================================

Create a clean single-page checkout.

Customer information:

- Full name
- Phone
- Email

Address:

- Address
- Apartment/area
- City
- State
- Pincode

Order summary.

Payment methods:

- UPI
- Credit/Debit Card
- Net Banking
- COD

Online payments will be processed through Razorpay.

Do NOT expose Razorpay secret keys in React.

Razorpay integration must happen through the Node.js backend.

==================================================
ORDER FLOW
==================================================

Implement the architecture for:

Customer places order
↓
Backend creates internal order
↓
Backend creates Razorpay order
↓
Customer completes payment
↓
Backend verifies Razorpay payment
↓
Order marked as PAID
↓
Backend creates shipment through NimbusPost
↓
AWB/tracking information stored in MongoDB
↓
Customer can track order

For COD:

Customer places COD order
↓
Order confirmed
↓
Backend creates NimbusPost shipment
↓
COD shipment
↓
Courier delivery

Never trust only frontend payment success.
Payment must be verified server-side.

==================================================
ORDER TRACKING
==================================================

Create:

/track-order

Customer enters:

- Order ID
- Phone number

Show:

Order placed
↓
Confirmed
↓
Packed
↓
Shipped
↓
Out for delivery
↓
Delivered

Show:

- Courier
- AWB number
- Tracking information
- Estimated delivery

Design the tracking system so shipment status can later be updated through NimbusPost webhooks.

==================================================
AUTHENTICATION
==================================================

Customer authentication:

- Register
- Login
- Logout
- Forgot password
- Reset password

Use JWT authentication.

Customer dashboard:

- Profile
- My Orders
- Order details
- Addresses
- Wishlist

==================================================
ADMIN PANEL
==================================================

Create a separate admin dashboard.

Admin features:

Dashboard:
- Total sales
- Orders
- Revenue
- Customers
- Products
- Low stock
- Recent orders

PRODUCT MANAGEMENT:

- Add product
- Edit product
- Delete product
- Upload images
- Manage price
- Manage MRP
- Manage discount
- Manage category
- Manage sizes
- Manage stock
- Product description
- Product specifications
- Product tags
- Featured/bestseller/new-arrival status

Images should be uploaded to Cloudinary.

Do NOT store actual image files inside MongoDB.

Store Cloudinary URLs/public IDs in MongoDB.

ORDER MANAGEMENT:

- View orders
- View customer information
- Payment status
- Order status
- Shipping status
- AWB number
- Tracking information
- Cancel order
- Refund status

CUSTOMER MANAGEMENT:

- View customers
- Customer orders
- Customer details

COUPONS:

- Create coupon
- Discount percentage/fixed amount
- Minimum order amount
- Expiry
- Usage limit
- Active/inactive

==================================================
BACKEND
==================================================

Use:

Node.js
Express.js
MongoDB
Mongoose
JWT
Cloudinary
Razorpay SDK/API
NimbusPost API

Create a clean backend architecture:

src/
  controllers/
  routes/
  models/
  services/
  middleware/
  utils/
  config/
  webhooks/

Separate integrations:

services/
  razorpay.service.js
  nimbuspost.service.js
  cloudinary.service.js

Keep Razorpay and NimbusPost credentials in environment variables.

Example:

RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=

NIMBUSPOST_API_KEY=
NIMBUSPOST_API_SECRET=

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

JWT_SECRET=
MONGODB_URI=

Never commit .env to Git.

==================================================
MONGODB MODELS
==================================================

Create appropriate schemas for:

User
Product
Category
Cart
Order
Payment
Shipment
Coupon
Review
Address

Order should maintain:

orderId
user
items
subtotal
discount
shippingCharge
totalAmount
paymentStatus
orderStatus
shippingStatus
shippingAddress
razorpayOrderId
razorpayPaymentId
nimbusOrderId
awbNumber
tracking information
timestamps

==================================================
API STRUCTURE
==================================================

Create REST APIs such as:

/api/auth
/api/products
/api/categories
/api/cart
/api/orders
/api/payments
/api/shipments
/api/coupons
/api/reviews
/api/users
/api/admin

Payment:

POST /api/payments/create
POST /api/payments/verify
POST /api/webhooks/razorpay

Shipping:

POST /api/shipments/create
GET /api/shipments/:orderId
GET /api/shipments/:orderId/track
POST /api/webhooks/nimbuspost

Use proper authentication and authorization middleware.

==================================================
CLOUDINARY
==================================================

Use Cloudinary for:

- Product images
- Product galleries
- Category images
- Banner images

Admin should be able to upload multiple product images.

Optimize images for fast loading.

Use responsive image sizes.

==================================================
SECURITY
==================================================

Implement:

- JWT authentication
- Password hashing
- Input validation
- API rate limiting
- CORS
- Helmet
- Secure HTTP-only cookies where appropriate
- MongoDB injection protection
- Proper error handling
- Environment variables
- Razorpay webhook signature verification

Never expose:
- Razorpay secret
- NimbusPost credentials
- Cloudinary secret
- JWT secret

to the frontend.

==================================================
RESPONSIVENESS
==================================================

The website must work perfectly on:

- Mobile
- Tablet
- Laptop
- Desktop

Mobile shopping experience is extremely important.

Use Tailwind responsive classes.

==================================================
UX DETAILS
==================================================

Add:

- Loading skeletons
- Empty states
- Error states
- Toast notifications
- Product image zoom
- Wishlist animation
- Cart drawer
- Sticky mobile add-to-cart button
- Smooth scrolling
- Hover effects
- Proper form validation
- Accessible buttons and inputs

Do not overuse animations.

==================================================
CODE QUALITY
==================================================

Use reusable components.

Avoid duplicate code.

Use clean folder structure.

Use meaningful variable/function names.

Keep frontend and backend separated.

Create reusable API service functions.

Do not hardcode secrets.

Do not hardcode production payment/shipping credentials.

Use dummy products only for initial UI demonstration.

Make the project production-ready and easy to extend.

==================================================
IMPORTANT
==================================================

This is a real D2C soft-toy business.

The website should prioritize:

1. Product photography
2. Easy browsing
3. Mobile shopping
4. Fast checkout
5. Trust
6. Simple navigation
7. Conversion
8. Easy product management

The final design should feel like a premium Indian D2C soft-toy/gifting brand rather than a generic e-commerce template.
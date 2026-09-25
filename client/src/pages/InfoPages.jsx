import { Link } from 'react-router-dom'
import { Building2, Clock3, Mail, MapPin, PackageCheck, Phone, Truck } from 'lucide-react'

const BUSINESS = {
  brand: 'BYNEMSTOYS',
  tradeName: 'ByNems',
  email: 'bynemstoysindia@gmail.com',
  phone: '9318471492',
  address: 'D-002, 3rd Floor, Hamza Apartment III, Shersha Marg, near Shersha Masjid, Haldoni Village, Greater Noida, Gautam Buddha Nagar, Uttar Pradesh 201308, India',
}

export function ContactUs() {
  return <InfoPage eyebrow="WE ARE HERE TO HELP" title="Contact us" intro="Questions about a toy, an order or a delivery? Reach our team using the details below.">
    <div className="grid gap-4 md:grid-cols-3">
      <ContactCard icon={Phone} title="Call us" href={`tel:+91${BUSINESS.phone}`} text={`+91 ${BUSINESS.phone}`} note="Monday–Saturday, 10:00 AM–6:00 PM IST" />
      <ContactCard icon={Mail} title="Email us" href={`mailto:${BUSINESS.email}`} text={BUSINESS.email} note="We usually respond within two business days." />
      <ContactCard icon={MapPin} title="Registered office" text={BUSINESS.address} />
    </div>
    <Section title="When contacting us">
      <p>Please include your order ID and the email or phone number used for the order. For damaged or incorrect products, attach clear photographs of the product, packaging and shipping label so we can assist quickly.</p>
    </Section>
    <BusinessIdentity />
  </InfoPage>
}

export function ShippingPolicy() {
  return <InfoPage eyebrow="DELIVERY INFORMATION" title="Shipping policy" intro="How BYNEMSTOYS prepares, dispatches and delivers your order across India.">
    <FeatureGrid items={[
      [PackageCheck, 'Careful processing', 'Orders are checked and usually dispatched within 1–2 business days.'],
      [Truck, 'Tracked delivery', 'Tracking details become available after the courier assigns an AWB number.'],
      [Clock3, 'Delivery estimates', 'Most orders arrive 3–7 business days after dispatch; remote locations may take longer.'],
    ]} />
    <Section title="Shipping charges"><p>Applicable shipping charges, discounts and free-shipping eligibility are calculated from your cart and displayed at checkout before payment.</p></Section>
    <Section title="Tracking your order"><p>Use the tracking link sent with your shipment update or visit our <Link className="font-bold underline" to="/track-order">Track Order</Link> page with your order ID and phone number.</p></Section>
    <Section title="Delivery delays"><p>Weather, public holidays, courier disruptions, remote-area serviceability and other events outside our control can affect delivery estimates. We will share available updates but cannot guarantee a specific delivery date.</p></Section>
    <Section title="Address accuracy"><p>Please review the delivery address and phone number before placing your order. Contact us immediately if a correction is needed. Once dispatched, address changes depend on courier approval and may not be possible.</p></Section>
    <Section title="Failed delivery or returned shipment"><p>If delivery fails because the recipient is unavailable or the address is incomplete, the courier may reattempt delivery or return the parcel. Additional shipping charges may apply before redispatch.</p></Section>
  </InfoPage>
}

export function ReturnsPolicy() {
  return <InfoPage eyebrow="SHOP WITH CONFIDENCE" title="Returns policy" intro="Eligible products may be requested for return within seven days of delivery.">
    <Section title="Return eligibility"><List items={[
      'The request is raised within seven calendar days of delivery.',
      'The product is unused, unwashed and in its original condition.',
      'Original tags, accessories, packaging and invoice are available.',
      'The product passes our inspection after it is returned.',
    ]} /></Section>
    <Section title="Damaged, defective or incorrect product"><p>Contact us within 48 hours of delivery with your order ID and clear photos or video of the product, packaging and shipping label. After verification, we will arrange an appropriate replacement, return or refund.</p></Section>
    <Section title="Products that cannot be returned"><List items={[
      'Personalised, customised or made-to-order products unless defective.',
      'Products showing signs of use, washing, alteration or accidental damage.',
      'Products returned without original components, tags or packaging.',
      'Items identified as non-returnable on their product page for hygiene or safety reasons.',
    ]} /></Section>
    <Section title="How to request a return"><p>Email <a className="font-bold underline" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> or call <a className="font-bold underline" href={`tel:+91${BUSINESS.phone}`}>+91 {BUSINESS.phone}</a>. Do not send a product to the registered office until our team provides return instructions.</p></Section>
    <Section title="Return shipping"><p>For verified damaged, defective or incorrect products, BYNEMSTOYS will arrange or reimburse reasonable return shipping. For other approved returns, return shipping may be deducted from the refund.</p></Section>
  </InfoPage>
}

export function FAQs() {
  const questions = [
    ['How can I place an order?', 'Choose a product and size, add it to your cart, sign in, enter a delivery address and complete checkout using an available payment method.'],
    ['Can I pay Cash on Delivery?', 'Cash on Delivery is currently unavailable. Please use UPI, card or net banking through our secure Razorpay checkout.'],
    ['How do I track my order?', 'Open Track Order and enter the order ID and phone number used at checkout. Tracking starts after an AWB number is assigned.'],
    ['Can I change or cancel an order?', 'Contact us as soon as possible. Changes or cancellation are possible only before packing or dispatch and cannot be guaranteed afterward.'],
    ['How long does delivery take?', 'Orders are generally dispatched in 1–2 business days and commonly arrive 3–7 business days after dispatch. Remote locations can take longer.'],
    ['What if my product arrives damaged?', 'Contact us within 48 hours with your order ID and clear photographs or video of the product, outer packaging and shipping label.'],
    ['How do returns and refunds work?', 'Eligible return requests must be raised within seven days of delivery. Refunds are processed after the returned product passes inspection.'],
    ['Are product colours and sizes exact?', 'We provide measurements and representative photographs. Minor colour variation can occur because of lighting, screens and production batches.'],
    ['How can I contact BYNEMSTOYS?', `Email ${BUSINESS.email} or call +91 ${BUSINESS.phone} during business hours.`],
  ]
  return <InfoPage eyebrow="QUICK ANSWERS" title="Frequently asked questions" intro="Helpful answers about ordering, delivery, returns and products.">
    <div className="space-y-3">{questions.map(([question, answer]) => <details key={question} className="rounded-2xl border border-cocoa/10 bg-white p-5"><summary className="cursor-pointer font-display text-lg font-bold">{question}</summary><p className="pt-3 leading-7 text-cocoa/60">{answer}</p></details>)}</div>
    <div className="mt-8 rounded-3xl bg-blush p-7 text-center"><h2 className="font-display text-2xl font-bold">Still need help?</h2><p className="mt-2 text-cocoa/60">Our team will be happy to assist.</p><Link className="button-primary mt-5" to="/contact">Contact us</Link></div>
  </InfoPage>
}

export function AboutUs() {
  return <InfoPage eyebrow="OUR STORY" title="Made for real hugs" intro="BYNEMSTOYS is an Indian toy and gifting brand based in Greater Noida, Uttar Pradesh.">
    <div className="grid items-center gap-8 rounded-[2rem] bg-white p-6 md:grid-cols-2 md:p-9">
      <img src="https://res.cloudinary.com/vtqlnbr7/image/upload/v1789845922/natalie-kinnear-0hZAhSF9uuY-unsplash_muhqbo.jpg" alt="A BYNEMSTOYS teddy bear" className="aspect-[4/3] w-full rounded-3xl object-cover" />
      <div><h2 className="font-display text-3xl font-bold">Warmth in every detail</h2><p className="mt-4 leading-8 text-cocoa/65">We create and curate lovable toys, dolls and cuddly animal companions. Our goal is simple: offer cheerful friends and thoughtful gifts that bring comfort, imagination and memorable smiles.</p><p className="mt-4 leading-8 text-cocoa/65">From expressive details to gift-ready presentation, every BYNEMSTOYS experience is designed around joy, trust and real hugs.</p></div>
    </div>
    <BusinessIdentity />
  </InfoPage>
}

export function PrivacyPolicy() {
  return <InfoPage eyebrow="YOUR DATA MATTERS" title="Privacy policy" intro="This policy explains how BYNEMSTOYS collects, uses and protects information when you use bynemstoys.com." updated>
    <Section title="Information we collect"><List items={[
      'Account information such as name, email, phone number and encrypted password.',
      'Delivery and billing information required to fulfil an order.',
      'Order, cart, wishlist, payment-status and customer-support records.',
      'Technical information such as IP address, browser, device and request logs used for security and troubleshooting.',
      'Google account information you authorise when using Google Sign-In.',
    ]} /></Section>
    <Section title="How we use information"><List items={[
      'To create accounts, process orders, collect payments and arrange delivery.',
      'To provide order tracking, support, returns, refunds and fraud prevention.',
      'To send essential account and transaction communications.',
      'To improve site performance, security, products and customer experience.',
      'To meet tax, accounting, legal and regulatory obligations.',
    ]} /></Section>
    <Section title="Service providers"><p>We share only necessary information with providers that support our operations, including Razorpay for payments, NimbusPost and courier partners for shipping, Cloudinary for images, Brevo for transactional email, Google for sign-in, and hosting/database providers. Their handling of data is governed by their own policies and contractual obligations.</p></Section>
    <Section title="Payments"><p>Card, UPI and banking credentials are entered through Razorpay. BYNEMSTOYS does not store full card details. We retain provider order IDs, payment IDs and payment status for reconciliation and support.</p></Section>
    <Section title="Cookies and local storage"><p>We use essential cookies and browser storage to maintain authentication, carts, wishlists and preferences. Blocking these technologies may prevent some features from working.</p></Section>
    <Section title="Retention and security"><p>We keep information only as long as needed for the stated purposes, legal requirements, dispute resolution and fraud prevention. We use access controls, encryption in transit, password hashing and restricted credentials, but no internet system can guarantee absolute security.</p></Section>
    <Section title="Your choices"><p>You may request access, correction or deletion of eligible personal information by contacting us. Some records must be retained for tax, legal, payment or fraud-prevention obligations.</p></Section>
    <Section title="Contact"><p>For privacy questions, email <a className="font-bold underline" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.</p></Section>
  </InfoPage>
}

export function TermsAndConditions() {
  return <InfoPage eyebrow="USING OUR STORE" title="Terms & conditions" intro="These terms govern access to bynemstoys.com and purchases from BYNEMSTOYS." updated>
    <Section title="Business identity"><p>BYNEMSTOYS is operated by ByNems from Uttar Pradesh, India. By using the website or placing an order, you agree to these terms and the policies linked from this website.</p></Section>
    <Section title="Accounts"><p>You are responsible for providing accurate information and safeguarding your account credentials. You must notify us of suspected unauthorised access. We may restrict accounts used fraudulently or in violation of these terms.</p></Section>
    <Section title="Product information"><p>We aim to present accurate descriptions, dimensions, prices and images. Handmade or batch-produced products may have minor variations. Screen and lighting settings can affect colour appearance.</p></Section>
    <Section title="Pricing and orders"><p>Prices are displayed in Indian Rupees and include applicable taxes unless stated otherwise. Shipping or other applicable charges are shown before payment. An order may be cancelled or refunded if a product is unavailable, pricing is incorrect, payment fails, serviceability is unavailable or fraud is suspected.</p></Section>
    <Section title="Payments"><p>Orders currently require online payment through Razorpay. Payment confirmation remains subject to successful provider verification. Cash on Delivery is not currently available.</p></Section>
    <Section title="Shipping, returns and refunds"><p>Our Shipping, Returns and Refund policies form part of these terms. Delivery dates are estimates and may be affected by circumstances outside our reasonable control.</p></Section>
    <Section title="Intellectual property"><p>The BYNEMSTOYS name, website design, copy, graphics and original product content may not be copied, republished or commercially used without written permission. Third-party marks remain the property of their respective owners.</p></Section>
    <Section title="Limitation and acceptable use"><p>Do not misuse the website, attempt unauthorised access, introduce malicious code or interfere with operations. To the extent permitted by law, liability is limited to the value of the affected order, except where liability cannot legally be limited.</p></Section>
    <Section title="Governing law"><p>These terms are governed by Indian law. Subject to applicable consumer law, disputes are subject to the courts having jurisdiction in Gautam Buddha Nagar, Uttar Pradesh.</p></Section>
    <Section title="Contact"><p>Questions about these terms may be sent to <a className="font-bold underline" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.</p></Section>
  </InfoPage>
}

export function RefundPolicy() {
  return <InfoPage eyebrow="FAIR & CLEAR" title="Refund and cancellation policy" intro="How cancellations, approved returns and payment reversals are handled." updated>
    <Section title="Order cancellation"><p>Contact us immediately if you need to cancel. We can accept cancellation only before the order is packed or dispatched. Personalised or made-to-order products may not be cancellable after production begins.</p></Section>
    <Section title="Refund eligibility"><p>Refunds are issued for approved cancellations, verified failed transactions charged to the customer, and returns that meet our Returns Policy. A return does not automatically guarantee a refund until inspection is completed.</p></Section>
    <Section title="Refund method and timing"><p>Approved refunds are sent to the original online payment method. Processing is initiated by us after approval and commonly appears within 5–10 business days, depending on Razorpay, the bank or payment provider.</p></Section>
    <Section title="Deductions"><p>Original shipping charges and return shipping may be non-refundable for preference-based returns. They will not be deducted when we verify that the delivered product was damaged, defective or incorrect.</p></Section>
    <Section title="Failed or duplicate payments"><p>If money is debited but no successful order is confirmed, first check your bank statement for an automatic reversal. Contact us with the transaction reference if the amount is not reversed within the timeframe communicated by your bank.</p></Section>
    <Section title="Contact"><p>To request assistance, email <a className="font-bold underline" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> with your order ID and reason.</p></Section>
  </InfoPage>
}

function InfoPage({ eyebrow, title, intro, updated = false, children }) {
  return <main><section className="hero-bg border-b border-cocoa/10"><div className="page-width py-14 text-center sm:py-20"><p className="eyebrow">{eyebrow}</p><h1 className="font-display text-4xl font-bold tracking-tight sm:text-6xl">{title}</h1><p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-cocoa/60">{intro}</p>{updated && <p className="mt-4 text-xs font-bold uppercase tracking-wider text-cocoa/40">Last updated: 20 September 2026</p>}</div></section><div className="page-width max-w-5xl! space-y-7 py-12 sm:py-16">{children}</div></main>
}

function Section({ title, children }) {
  return <section className="rounded-3xl bg-white p-6 shadow-sm sm:p-8"><h2 className="font-display text-2xl font-bold">{title}</h2><div className="mt-3 leading-7 text-cocoa/65">{children}</div></section>
}

function List({ items }) {
  return <ul className="space-y-2">{items.map((item) => <li key={item} className="flex gap-3"><span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-rose" /><span>{item}</span></li>)}</ul>
}

function ContactCard({ icon: Icon, title, href, text, note }) {
  const content = <><Icon className="text-rose" /><h2 className="mt-4 font-display text-xl font-bold">{title}</h2><p className="mt-2 break-words text-sm leading-6 text-cocoa/65">{text}</p>{note && <p className="mt-2 text-xs leading-5 text-cocoa/40">{note}</p>}</>
  return href ? <a href={href} className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">{content}</a> : <div className="rounded-3xl bg-white p-6 shadow-sm">{content}</div>
}

function FeatureGrid({ items }) {
  return <div className="grid gap-4 md:grid-cols-3">{items.map(([Icon, title, text]) => <div key={title} className="rounded-3xl bg-white p-6 shadow-sm"><Icon className="text-rose" /><h2 className="mt-4 font-display text-xl font-bold">{title}</h2><p className="mt-2 text-sm leading-6 text-cocoa/60">{text}</p></div>)}</div>
}

function BusinessIdentity() {
  return <Section title="Our office"><p>{BUSINESS.brand} is the customer-facing brand of {BUSINESS.tradeName}, based in Greater Noida.</p><div className="mt-6 flex gap-3 rounded-2xl bg-cream p-4"><Building2 className="shrink-0 text-rose" /><p className="text-sm leading-6">{BUSINESS.address}</p></div></Section>
}

export { BUSINESS }

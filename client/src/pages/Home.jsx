import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Box, CreditCard, Gift, HeartHandshake, PackageCheck, ShieldCheck, Star } from 'lucide-react'
import { useShop } from '../context/ShopContext'
import { ProductCard, SectionHeading, FieldError } from '../components/store'
import { PATTERNS } from '../lib/validation'

const TESTIMONIALS = [
  { name: 'Ananya Sharma', city: 'Noida', quote: 'The teddy was even softer than it looked online. My niece has not let go of it since her birthday.' },
  { name: 'Rohit Mehta', city: 'Delhi', quote: 'Packed beautifully and delivered on time. It made a last-minute gift feel thoughtful.' },
  { name: 'Priya Nair', city: 'Bengaluru', quote: 'Lovely stitching and the colours matched the photos. We will be back for the next celebration.' },
]

const BANNER_DESKTOP = 'https://res.cloudinary.com/vtqlnbr7/image/upload/v1790357529/ChatGPT_Image_Sep_25_2026_11_01_46_PM_hykze7.png'
const BANNER_MOBILE = 'https://res.cloudinary.com/vtqlnbr7/image/upload/v1790358031/ChatGPT_Image_Sep_25_2026_11_09_55_PM_krlxbt.png'

export default function Home() {
  const { products, categories, catalogLoading, catalogError } = useShop()
  const bestsellers = products.filter((product) => product.bestseller).slice(0, 4)
  const newArrivals = products.filter((product) => product.newArrival).slice(0, 4)
  return <main>
    <section className="hero-banner">
      <picture>
        <source media="(min-width: 768px)" srcSet={BANNER_DESKTOP} />
        <img src={BANNER_MOBILE} alt="Adorable plush toys for every occasion" />
      </picture>
    </section>

    <section id="categories" className="page-width section-space">
      <SectionHeading eyebrow="FIND THEIR FAVOURITE" title="Shop by category" description="From classic teddy hugs to cheerful little characters, there is a friend for every story." />
      {catalogError && <CatalogMessage message={catalogError} />}
      {catalogLoading && <CatalogMessage message="Loading categories…" />}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {categories.map((category) => (
          <Link to={`/shop?category=${category.slug}`} key={category._id || category.slug} className="category-card group">
            <img src={category.image?.url} alt={category.image?.alt || category.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-cocoa/80 via-cocoa/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-2.5 text-white md:p-3">
              <h3 className="font-display text-sm font-bold md:text-base">{category.name}</h3>
            </div>
          </Link>
        ))}
      </div>
    </section>

    <section className="bg-white/60 py-16 md:py-20"><div className="page-width">
      <div className="flex items-end justify-between gap-5"><SectionHeading eyebrow="CUSTOMER FAVOURITES" title="Best sellers" description="Some of our most-loved cuddly companions." /><Link to="/shop?sort=popular" className="mb-8 hidden items-center gap-2 font-bold md:flex">View all <ArrowRight size={17} /></Link></div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:gap-6 lg:grid-cols-4">{bestsellers.map((product) => <ProductCard key={product._id} product={product} />)}</div>
    </div></section>

    <section className="page-width section-space">
      <SectionHeading eyebrow="FRESHLY ARRIVED" title="New little friends" />
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:gap-6 lg:grid-cols-4">{newArrivals.map((product) => <ProductCard key={product._id} product={product} />)}</div>
      <div className="mt-10 text-center"><Link to="/shop?sort=newest" className="button-secondary">View all products <ArrowRight size={18} /></Link></div>
    </section>

    <section className="page-width section-space">
      <SectionHeading eyebrow="HAPPY HUGS" title="What families are saying" description="A few words from people who recently gifted or received a BYNEMSTOYS cuddle." />
      <div className="grid gap-4 md:grid-cols-3">
        {TESTIMONIALS.map((item) => (
          <article key={item.name} className="rounded-[1.5rem] bg-white p-6 shadow-sm">
            <div className="flex text-gold">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={15} fill="currentColor" />)}</div>
            <p className="mt-4 text-sm leading-7 text-cocoa/70">“{item.quote}”</p>
            <p className="mt-5 font-bold">{item.name}</p>
            <p className="text-xs text-cocoa/45">{item.city}</p>
          </article>
        ))}
      </div>
    </section>

    <TrustStrip />
    <Newsletter />
  </main>
}

function TrustStrip() {
  const items = [[HeartHandshake, 'Premium quality'], [ShieldCheck, 'Soft & comfortable'], [CreditCard, 'Secure payments'], [Box, 'Fast delivery'], [PackageCheck, 'Easy returns'], [Gift, 'Carefully packed']]
  return <section className="mb-16 border-y border-cocoa/10 bg-white py-10 md:mb-20"><div className="page-width grid grid-cols-2 gap-7 md:grid-cols-3 lg:grid-cols-6">{items.map(([Icon, title]) => <div className="text-center" key={title}><Icon className="mx-auto mb-3 text-rose" /><p className="text-sm font-bold">{title}</p></div>)}</div></section>
}

function CatalogMessage({ message }) {
  return <p className="mb-6 rounded-2xl bg-white p-5 text-center text-sm text-cocoa/60">{message}</p>
}

function Newsletter() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const submit = (event) => {
    event.preventDefault()
    const value = email.trim()
    if (!value) return setError('Enter your email address')
    if (!PATTERNS.email.test(value)) return setError('Enter a valid email address')
    setError('')
    setMessage('Thanks! We will send the cutest updates to your inbox.')
    setEmail('')
  }

  return <section className="page-width pb-8"><div className="rounded-[1.75rem] bg-cocoa px-5 py-10 text-center text-white sm:rounded-[2.5rem] sm:px-6 sm:py-14 md:px-14"><p className="eyebrow text-peach!">A LITTLE JOY IN YOUR INBOX</p><h2 className="font-display text-3xl font-bold md:text-5xl">Get the cutest updates</h2><p className="mx-auto mt-3 max-w-xl text-white/60">New friends, gifting ideas and members-only treats. No clutter, only cuddles.</p><form onSubmit={submit} className="mx-auto mt-7 max-w-lg" noValidate>
    <div className="flex flex-col gap-2 rounded-2xl bg-white p-2 sm:flex-row">
      <input type="email" value={email} onChange={(event) => { setEmail(event.target.value); setError(''); setMessage('') }} placeholder="Your email address" className="min-w-0 flex-1 rounded-xl px-4 py-3 text-cocoa outline-none" />
      <button className="button-primary bg-rose!">Subscribe</button>
    </div>
    <FieldError message={error} />
    {message && <p className="mt-3 text-sm font-semibold text-peach">{message}</p>}
  </form></div></section>
}

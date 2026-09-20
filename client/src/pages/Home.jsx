import { Link } from 'react-router-dom'
import { ArrowRight, Box, CreditCard, Gift, HeartHandshake, PackageCheck, ShieldCheck, Star } from 'lucide-react'
import { occasions } from '../data/catalog'
import { useShop } from '../context/ShopContext'
import { ProductCard, SectionHeading } from '../components/store'

export default function Home() {
  const { products, categories, catalogLoading, catalogError } = useShop()
  const bestsellers = products.filter((product) => product.bestseller).slice(0, 4)
  const newArrivals = products.filter((product) => product.newArrival).slice(0, 4)
  return <main>
    <section className="hero-bg overflow-hidden">
      <div className="page-width grid min-h-[76vh] items-center gap-8 py-12 lg:grid-cols-2 lg:py-16">
        <div className="relative z-10">
          <p className="eyebrow">CUDDLES, MADE WITH LOVE</p>
          <h1 className="max-w-2xl font-display text-5xl font-bold leading-[.98] tracking-[-.05em] text-cocoa sm:text-6xl lg:text-7xl">Make every moment a little more special.</h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-cocoa/65">Cute, cuddly and lovable soft toys made for every special moment—and all the lovely little ones between.</p>
          <div className="mt-8 flex flex-wrap gap-3"><Link className="button-primary" to="/shop">Shop now <ArrowRight size={18} /></Link><a className="button-secondary" href="#categories">Explore collection</a></div>
          <div className="mt-10 flex flex-wrap gap-5 text-xs font-bold text-cocoa/60"><span className="flex items-center gap-2"><ShieldCheck size={17} /> Child-friendly</span><span className="flex items-center gap-2"><PackageCheck size={17} /> Carefully packed</span><span className="flex items-center gap-2"><Gift size={17} /> Gift-ready</span></div>
        </div>
        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute -left-4 top-12 h-24 w-24 rounded-full bg-gold/30 blur-2xl" />
          <img src="https://res.cloudinary.com/vtqlnbr7/image/upload/v1789845925/luwadlin-bosman-WAVA6ZbothA-unsplash_lpwlh5.jpg" alt="A lovable teddy bear" className="aspect-[4/5] w-full rounded-[3rem] object-cover shadow-[0_35px_80px_rgba(88,53,35,.22)]" />
          <div className="absolute -bottom-5 -left-3 rounded-2xl bg-white p-4 shadow-xl"><div className="flex text-gold">{[1,2,3,4,5].map((n) => <Star key={n} size={15} fill="currentColor" />)}</div><p className="mt-1 text-sm font-bold">Loved by happy families</p></div>
        </div>
      </div>
    </section>

    <section id="categories" className="page-width section-space">
      <SectionHeading eyebrow="FIND THEIR FAVOURITE" title="Shop by category" description="From classic teddy hugs to cheerful little characters, there is a friend for every story." />
      {catalogError && <CatalogMessage message={catalogError} />}
      {catalogLoading && <CatalogMessage message="Loading categories…" />}
      <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-3">{categories.map((category) => <Link to={`/shop?category=${category.slug}`} key={category._id || category.slug} className="category-card group">
        <img src={category.image?.url} alt={category.image?.alt || category.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-cocoa/85 via-cocoa/5 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-4 text-white md:p-6"><h3 className="font-display text-lg font-bold md:text-2xl">{category.name}</h3><p className="hidden text-sm text-white/70 md:block">{category.description}</p><span className="mt-2 inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider">Shop now <ArrowRight size={14} /></span></div>
      </Link>)}</div>
    </section>

    <section className="bg-white/60 py-18"><div className="page-width">
      <div className="flex items-end justify-between gap-5"><SectionHeading eyebrow="CUSTOMER FAVOURITES" title="Best sellers" description="Some of our most-loved cuddly companions." /><Link to="/shop?sort=popular" className="mb-8 hidden items-center gap-2 font-bold md:flex">View all <ArrowRight size={17} /></Link></div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:gap-6 lg:grid-cols-4">{bestsellers.map((product) => <ProductCard key={product._id} product={product} />)}</div>
    </div></section>

    <section className="page-width section-space">
      <SectionHeading eyebrow="FRESHLY ARRIVED" title="New little friends" />
      <div className="grid grid-cols-2 gap-x-3 gap-y-8 md:gap-6 lg:grid-cols-4">{newArrivals.map((product) => <ProductCard key={product._id} product={product} />)}</div>
      <div className="mt-10 text-center"><Link to="/shop?sort=newest" className="button-secondary">View all products <ArrowRight size={18} /></Link></div>
    </section>

    <section className="bg-blush/70 py-18"><div className="page-width">
      <SectionHeading eyebrow="WRAPPED IN JOY" title="Gifts for every special moment" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">{occasions.map(([name, description], index) => <Link to={`/shop?q=${name}`} key={name} className="rounded-[1.5rem] bg-white p-4 transition hover:-translate-y-1 hover:shadow-lg">
        <div className="mb-4 grid aspect-square place-items-center rounded-full bg-peach/40 text-3xl">{['🎂','🍼','🪔','🌈','💞','✨'][index]}</div><h3 className="font-display font-bold">{name}</h3><p className="mt-1 text-xs leading-5 text-cocoa/50">{description}</p>
      </Link>)}</div>
    </div></section>

    <section id="story" className="page-width section-space grid items-center gap-10 lg:grid-cols-2">
      <div className="relative"><img src="https://res.cloudinary.com/vtqlnbr7/image/upload/v1789845922/natalie-kinnear-0hZAhSF9uuY-unsplash_muhqbo.jpg" className="aspect-[5/4] w-full rounded-[2.5rem] object-cover" alt="Soft toy made with care" /><div className="absolute -bottom-5 right-5 rounded-2xl bg-gold p-5 font-display text-lg font-bold text-white shadow-xl">Made for<br />real hugs.</div></div>
      <div className="lg:px-10"><p className="eyebrow">OUR STORY</p><h2 className="section-title">Made to bring smiles</h2><p className="mt-5 text-lg leading-8 text-cocoa/65">At BYNEMSTOYS, we believe the best gifts become part of someone's story. We create lovable soft toys with gentle materials, expressive details and plenty of heart—so every hug feels a little more special.</p><Link className="button-primary mt-7" to="/about">Our story <ArrowRight size={18} /></Link></div>
    </section>

    <TrustStrip />
    <Newsletter />
  </main>
}

function TrustStrip() {
  const items = [[HeartHandshake, 'Premium quality'], [ShieldCheck, 'Soft & comfortable'], [CreditCard, 'Secure payments'], [Box, 'Fast delivery'], [PackageCheck, 'Easy returns'], [Gift, 'Carefully packed']]
  return <section className="border-y border-cocoa/10 bg-white py-10"><div className="page-width grid grid-cols-2 gap-7 md:grid-cols-3 lg:grid-cols-6">{items.map(([Icon, title]) => <div className="text-center" key={title}><Icon className="mx-auto mb-3 text-rose" /><p className="text-sm font-bold">{title}</p></div>)}</div></section>
}

function CatalogMessage({ message }) {
  return <p className="mb-6 rounded-2xl bg-white p-5 text-center text-sm text-cocoa/60">{message}</p>
}

function Newsletter() {
  return <section className="page-width"><div className="rounded-[2.5rem] bg-cocoa px-6 py-14 text-center text-white md:px-14"><p className="eyebrow text-peach!">A LITTLE JOY IN YOUR INBOX</p><h2 className="font-display text-3xl font-bold md:text-5xl">Get the cutest updates</h2><p className="mx-auto mt-3 max-w-xl text-white/60">New friends, gifting ideas and members-only treats. No clutter, only cuddles.</p><form className="mx-auto mt-7 flex max-w-lg flex-col gap-2 rounded-2xl bg-white p-2 sm:flex-row"><input type="email" required placeholder="Your email address" className="min-w-0 flex-1 rounded-xl px-4 py-3 text-cocoa outline-none" /><button className="button-primary bg-rose!">Subscribe</button></form></div></section>
}

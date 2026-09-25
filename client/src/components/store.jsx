import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ArrowRight, Heart, Menu, Minus, Package, Plus, Search, ShoppingBag, Star, UserRound, X } from 'lucide-react'
import { BULK_RULES, validateFields } from '../lib/validation'
import { useShop } from '../context/ShopContext'

const money = (value) => `₹${Number(value || 0).toLocaleString('en-IN')}`

function InstagramIcon({ size = 18 }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24">
    <defs>
      <linearGradient id="instagram-gradient" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0" stopColor="#feda75" />
        <stop offset=".35" stopColor="#fa7e1e" />
        <stop offset=".6" stopColor="#d62976" />
        <stop offset=".82" stopColor="#962fbf" />
        <stop offset="1" stopColor="#4f5bd5" />
      </linearGradient>
    </defs>
    <rect x="1" y="1" width="22" height="22" rx="6" fill="url(#instagram-gradient)" />
    <rect x="6" y="6" width="12" height="12" rx="4" fill="none" stroke="white" strokeWidth="1.8" />
    <circle cx="12" cy="12" r="3" fill="none" stroke="white" strokeWidth="1.8" />
    <circle cx="17.1" cy="6.9" r="1" fill="white" />
  </svg>
}

function EmailIcon({ size = 18 }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24">
    <rect x="1" y="1" width="22" height="22" rx="6" fill="#ea4335" />
    <path d="M5.5 8.2 12 12.6 18.5 8.2" fill="none" stroke="white" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="5.2" y="7.6" width="13.6" height="8.8" rx="1.4" fill="none" stroke="white" strokeWidth="1.7" />
  </svg>
}

function PhoneIcon({ size = 18 }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24">
    <rect x="1" y="1" width="22" height="22" rx="6" fill="#34a853" />
    <path d="M8.4 7.6c.4-.8 1.5-.9 2-.2l1 1.4c.3.5.2 1.1-.2 1.5l-.7.7c.6 1.2 1.7 2.3 2.9 2.9l.7-.7c.4-.4 1-.5 1.5-.2l1.4 1c.7.5.6 1.6-.2 2A4.4 4.4 0 0 1 13 16.8c-2.8 0-5.8-3-5.8-5.8 0-1.2.3-2.3.9-3.2Z" fill="white" />
  </svg>
}

function LocationIcon({ size = 18 }) {
  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24">
    <rect x="1" y="1" width="22" height="22" rx="6" fill="#4285f4" />
    <path d="M12 6.4c-2.3 0-4.1 1.8-4.1 4.2 0 2.8 4.1 7 4.1 7s4.1-4.2 4.1-7c0-2.4-1.8-4.2-4.1-4.2Z" fill="#ea4335" />
    <circle cx="12" cy="10.4" r="1.5" fill="white" />
  </svg>
}

export function Header() {
  const { cartCount, wishlist, setCartOpen, user } = useShop()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const sort = new URLSearchParams(location.search).get('sort')
  const navClass = (active) => active ? 'text-rose' : 'transition hover:text-rose'
  const navItems = [
    ['Home', '/', location.pathname === '/' && location.hash !== '#categories'],
    ['Shop', '/shop', location.pathname === '/shop' && !['newest', 'popular'].includes(sort)],
    ['Categories', '/#categories', location.pathname === '/' && location.hash === '#categories'],
    ['New Arrivals', '/shop?sort=newest', location.pathname === '/shop' && sort === 'newest'],
    ['Best Sellers', '/shop?sort=popular', location.pathname === '/shop' && sort === 'popular'],
    ['About', '/about', location.pathname === '/about'],
  ]

  const search = (event) => {
    event.preventDefault()
    const query = String(new FormData(event.currentTarget).get('query') || '').trim()
    if (query.length < 2) return
    setSearchOpen(false)
    navigate(`/shop?q=${encodeURIComponent(query)}`)
  }

  return <>
    <header className="sticky top-0 z-40 border-b border-cocoa/10 bg-cream/95 backdrop-blur-xl">
      <div className="page-width flex h-16 items-center justify-between gap-2 sm:h-18 sm:gap-4">
        <button className="icon-button lg:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu"><Menu /></button>
        <Link to="/" className="flex min-w-0 items-center gap-2">
          <img src="/logo.png" className="h-9 w-9 shrink-0 rounded-full object-cover sm:h-11 sm:w-11" alt="BYNEMSTOYS" />
          <span className="truncate font-display text-base font-bold tracking-tight text-cocoa sm:text-xl">BYNEMSTOYS</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-semibold lg:flex">
          {navItems.map(([label, href, active]) => label === 'Categories' ? <a key={label} href={href} className={navClass(active)}>{label}</a> : <Link key={label} to={href} className={navClass(active)}>{label}</Link>)}
        </nav>
        <div className="flex items-center gap-1">
          <button className="icon-button" onClick={() => setSearchOpen(true)} aria-label="Search"><Search /></button>
          <Link className="icon-button hidden sm:grid" to={user?.role === 'admin' ? '/admin' : '/account'} aria-label="Account"><UserRound /></Link>
          <Link className="icon-button relative hidden sm:grid" to="/wishlist" aria-label="Wishlist"><Heart /><Count value={wishlist.length} /></Link>
          <button className="icon-button relative" onClick={() => setCartOpen(true)} aria-label="Cart"><ShoppingBag /><Count value={cartCount} /></button>
        </div>
      </div>
    </header>
    {menuOpen && <div className="fixed inset-0 z-50 bg-cocoa/25 backdrop-blur-sm" onClick={() => setMenuOpen(false)}>
      <aside className="h-full w-[82%] max-w-sm bg-cream p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mb-10 flex items-center justify-between"><strong className="font-display text-xl">Menu</strong><button className="icon-button" onClick={() => setMenuOpen(false)}><X /></button></div>
        <nav className="flex flex-col gap-6 text-lg font-semibold" onClick={() => setMenuOpen(false)}>
          {navItems.map(([label, href, active]) => label === 'Categories' ? <a key={label} href={href} className={navClass(active)}>{label}</a> : <Link key={label} to={href} className={navClass(active)}>{label}</Link>)}
          <Link to="/track-order" className={navClass(location.pathname === '/track-order')}>Track order</Link>
          <Link to={user?.role === 'admin' ? '/admin' : '/account'} className={navClass(location.pathname.startsWith('/account') || location.pathname === '/admin')}>My account</Link>
        </nav>
      </aside>
    </div>}
    {searchOpen && <div className="fixed inset-0 z-50 bg-cocoa/45 px-4 pt-24 backdrop-blur-md" onClick={() => setSearchOpen(false)}>
      <form onSubmit={search} className="mx-auto flex max-w-2xl flex-col gap-2 overflow-hidden rounded-2xl bg-white p-2 shadow-2xl sm:flex-row" onClick={(event) => event.stopPropagation()}>
        <div className="flex min-w-0 flex-1 items-center">
          <Search className="mx-3 shrink-0 self-center text-cocoa/50" />
          <input name="query" autoFocus className="min-w-0 flex-1 bg-transparent py-3 outline-none" placeholder="Search teddy bears, gifts..." />
        </div>
        <button className="button-primary sm:w-auto">Search</button>
      </form>
    </div>}
    <CartDrawer />
  </>
}

function Count({ value }) {
  return value ? <span className="absolute right-0 top-0 grid h-4 min-w-4 place-items-center rounded-full bg-rose px-1 text-[10px] font-bold text-white">{value}</span> : null
}

export function ProductCard({ product }) {
  const { addToCart, wishlist, toggleWishlist } = useShop()
  const id = product.id || product._id
  const discount = Math.round((1 - product.price / product.mrp) * 100)
  const image = product.image || product.images?.[0]?.url || product.images?.[0]
  return <article className="product-card group">
    <div className="relative aspect-square overflow-hidden rounded-[1.4rem] bg-blush">
      <Link to={`/products/${product.slug || id}`}><img src={image} alt={product.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /></Link>
      <button onClick={() => toggleWishlist(id)} className={`absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 shadow-sm ${wishlist.includes(id) ? 'text-rose' : 'text-cocoa'}`} aria-label="Add to wishlist"><Heart size={18} fill={wishlist.includes(id) ? 'currentColor' : 'none'} /></button>
      <div className="absolute left-2 top-2 flex max-w-[70%] flex-wrap gap-1">{product.isNew && <span className="badge">NEW</span>}{product.bestseller && <span className="badge bg-cocoa!">BESTSELLER</span>}</div>
    </div>
    <div className="px-0.5 pt-3 sm:px-1 sm:pt-4">
      <p className="mb-1 truncate text-[10px] font-semibold uppercase tracking-wider text-cocoa/50 sm:text-xs sm:tracking-widest">{product.categoryName || String(product.category).replaceAll('-', ' ')}</p>
      <Link to={`/products/${product.slug || id}`} className="line-clamp-2 font-display text-sm font-bold text-cocoa sm:text-lg">{product.name}</Link>
      {product.rating > 0 && <div className="mt-2 flex items-center gap-1 text-sm"><Star size={14} className="fill-gold text-gold" /><b>{product.rating}</b><span className="text-cocoa/40">({product.reviewCount || 0})</span></div>}
      <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 sm:mt-3"><strong className="text-base sm:text-lg">{money(product.price)}</strong><del className="text-xs text-cocoa/40 sm:text-sm">{money(product.mrp)}</del><span className="text-xs font-bold text-green-700">{discount}% off</span></div>
      <button onClick={() => addToCart(product, product.defaultVariantId || product.variants?.[0]?._id)} className="button-secondary mt-3 w-full sm:mt-4"><ShoppingBag size={16} /> Add to cart</button>
    </div>
  </article>
}

function CartDrawer() {
  const { cart, cartOpen, setCartOpen, subtotal, updateQuantity, removeFromCart } = useShop()
  return <div className={`fixed inset-0 z-50 transition ${cartOpen ? 'visible bg-cocoa/30' : 'invisible'}`} onClick={() => setCartOpen(false)}>
    <aside className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream p-5 shadow-2xl transition duration-300 ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={(event) => event.stopPropagation()}>
      <div className="flex items-center justify-between border-b border-cocoa/10 pb-5"><h2 className="font-display text-2xl font-bold">Your bag</h2><button className="icon-button" onClick={() => setCartOpen(false)}><X /></button></div>
      <div className="flex-1 space-y-5 overflow-y-auto py-5">
        {!cart.length && <div className="grid h-full place-items-center text-center text-cocoa/55"><div><ShoppingBag className="mx-auto mb-4" size={42} /><p>Your bag is waiting for something cuddly.</p><Link to="/shop" onClick={() => setCartOpen(false)} className="button-primary mt-5">Explore toys</Link></div></div>}
        {cart.map((item) => {
          const { product, quantity } = item
          const id = product.id || product._id
          const variant = item.variant || product.variants?.find((entry) => String(entry._id) === String(item.variantId))
          const image = variant?.images?.[0]?.url || product.image || product.images?.[0]?.url || product.images?.[0]
          return <div key={`${id}-${item.variantId || item.size}`} className="flex gap-3">
            <img src={image} className="h-20 w-20 shrink-0 rounded-2xl object-cover" alt="" />
            <div className="min-w-0 flex-1"><h3 className="truncate font-bold">{product.name}</h3><p className="text-sm text-cocoa/50">{variant?.color || item.color || '—'} · {variant?.label || item.size}</p><strong>{money(variant?.price || product.price)}</strong>
              <div className="mt-2 flex items-center justify-between"><div className="flex items-center rounded-full border border-cocoa/15"><button className="p-1.5" onClick={() => updateQuantity(id, item.variantId, quantity - 1)}><Minus size={14} /></button><span className="w-7 text-center text-sm">{quantity}</span><button className="p-1.5" onClick={() => updateQuantity(id, item.variantId, quantity + 1)}><Plus size={14} /></button></div><button onClick={() => removeFromCart(id, item.variantId)} className="text-xs font-bold text-rose">REMOVE</button></div>
            </div>
          </div>
        })}
      </div>
      {!!cart.length && <div className="border-t border-cocoa/10 pt-5"><div className="mb-4 flex justify-between"><span>Subtotal</span><strong className="text-xl">{money(subtotal)}</strong></div><Link to="/checkout" onClick={() => setCartOpen(false)} className="button-primary w-full">Checkout <ArrowRight size={18} /></Link><Link to="/cart" onClick={() => setCartOpen(false)} className="mt-3 block text-center text-sm font-bold underline">View full cart</Link></div>}
    </aside>
  </div>
}

export function Footer() {
  const { categories } = useShop()
  return <footer className="mt-16 bg-cocoa pb-28 text-cream sm:mt-20 sm:pb-5">
    <div className="page-width grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-5">
      <div className="sm:col-span-2">
        <div className="mb-4 flex items-center gap-3"><img src="/logo.png" alt="BYNEMSTOYS" className="h-12 w-12 rounded-full" /><strong className="font-display text-xl">BYNEMSTOYS</strong></div>
        <p className="max-w-sm text-sm leading-7 text-cream/65">Lovable soft toys made to bring comfort, wonder and very big smiles.</p>
        <div className="mt-5 space-y-3 text-sm text-cream/65">
          <a className="flex w-fit items-center gap-2 transition hover:text-white" href="https://www.instagram.com/bynemssoftteddy/" target="_blank" rel="noreferrer"><InstagramIcon/> Instagram</a>
          <a className="flex w-fit max-w-full items-center gap-2 break-all transition hover:text-white" href="mailto:bynemstoysindia@gmail.com"><span className="shrink-0"><EmailIcon/></span> bynemstoysindia@gmail.com</a>
          <a className="flex w-fit items-center gap-2 transition hover:text-white" href="tel:+919318471492"><PhoneIcon/> +91 93184 71492</a>
          <p className="flex items-center gap-2"><LocationIcon/> Greater Noida, Uttar Pradesh, India</p>
        </div>
      </div>
      <FooterLinks title="SHOP" links={categories.map((category) => ({ label: category.name, href: `/shop?category=${category.slug}` }))} />
      <FooterLinks title="HELP" links={[{ label: 'Contact Us', href: '/contact' }, { label: 'Shipping', href: '/shipping' }, { label: 'Returns', href: '/returns' }, { label: 'FAQs', href: '/faqs' }, { label: 'Track Order', href: '/track-order' }]} />
      <FooterLinks title="COMPANY" links={[{ label: 'About Us', href: '/about' }, { label: 'Privacy Policy', href: '/privacy' }, { label: 'Terms & Conditions', href: '/terms' }, { label: 'Refund Policy', href: '/refund-policy' }]} />
    </div>
    <div className="border-t border-white/10 py-5 text-center text-xs text-cream/50">© {new Date().getFullYear()} BYNEMSTOYS · ByNems. Made with warmth in India.</div>
  </footer>
}

function FooterLinks({ title, links }) {
  return <div><h3 className="mb-4 text-xs font-bold tracking-[.2em] text-peach">{title}</h3><ul className="space-y-3 text-sm text-cream/65">{links.map((item) => { const link = typeof item === 'string' ? { label: item, href: '#' } : item; return <li key={link.label}><Link to={link.href}>{link.label}</Link></li> })}</ul></div>
}

export function SectionHeading({ eyebrow, title, description }) {
  return <div className="mb-8 max-w-2xl"><p className="eyebrow">{eyebrow}</p><h2 className="section-title">{title}</h2>{description && <p className="mt-3 text-cocoa/60">{description}</p>}</div>
}

export function FieldError({ message }) {
  if (!message) return null
  return <p className="mt-1.5 text-xs font-semibold text-red-600">{message}</p>
}

const WHATSAPP_NUMBER = '919318471492'
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=` + encodeURIComponent('Hi BYNEMSTOYS, I have a question about an order.')

function WhatsAppIcon({ size = 28 }) {
  return (
    <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="white">
      <path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.84c0 1.74.46 3.44 1.33 4.95L2 22l5.36-1.4a10 10 0 0 0 4.68 1.19h.01c5.46 0 9.89-4.4 9.89-9.85C21.94 6.4 17.5 2 12.04 2Zm5.77 13.9c-.24.68-1.4 1.25-1.93 1.33-.5.07-1.12.1-1.81-.11-.41-.13-.95-.31-1.64-.6-2.89-1.25-4.77-4.16-4.92-4.35-.14-.2-1.17-1.56-1.17-2.97 0-1.42.74-2.11 1-2.4.26-.28.56-.35.75-.35h.54c.17 0 .4 0 .62.47.24.52.8 1.96.87 2.1.07.14.12.31.02.5-.1.2-.14.31-.28.48l-.42.5c-.14.14-.3.3-.13.58.17.28.77 1.27 1.65 2.06 1.14 1.01 2.1 1.33 2.39 1.48.3.14.46.12.64-.07.17-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.26.1 1.68.79 1.97.94.28.14.47.22.54.34.07.12.07.7-.17 1.38Z" />
    </svg>
  )
}

export function WhatsAppButton() {
  const [open, setOpen] = useState(false)
  const [errors, setErrors] = useState({})

  const sendBulkOrder = (event) => {
    event.preventDefault()
    const fields = Object.fromEntries(new FormData(event.currentTarget))
    const nextErrors = validateFields(fields, BULK_RULES)
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    const message = [
      'Hi BYNEMSTOYS, I want a bulk / wholesale order.',
      '',
      `Name: ${fields.name.trim()}`,
      `Phone: ${fields.phone.trim()}`,
      `City: ${fields.city.trim()}`,
      `Quantity: ${fields.quantity.trim()} pieces`,
      fields.product?.trim() ? `Product: ${fields.product.trim()}` : '',
      fields.note?.trim() ? `Message: ${fields.note.trim()}` : '',
    ].filter(Boolean).join('\n')
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    setOpen(false)
    setErrors({})
    event.currentTarget.reset()
  }

  return (
    <>
      <div className="whatsapp-dock">
        <button type="button" className="bulk-float" onClick={() => setOpen(true)} aria-label="Click for bulk order">
          <Package size={16} />
          <span>Bulk order</span>
        </button>
        <a className="whatsapp-float" href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="Chat on WhatsApp">
          <WhatsAppIcon />
        </a>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-cocoa/50 p-3 backdrop-blur-sm sm:p-8" onMouseDown={() => { setOpen(false); setErrors({}) }}>
          <div className="mx-auto max-w-md rounded-3xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-cocoa/10 p-5">
              <div>
                <p className="eyebrow">WHOLESALE & EVENTS</p>
                <h2 className="font-display text-2xl font-bold">Bulk order inquiry</h2>
              </div>
              <button className="icon-button" onClick={() => { setOpen(false); setErrors({}) }} aria-label="Close"><X /></button>
            </div>
            <form onSubmit={sendBulkOrder} noValidate className="grid gap-4 p-5">
              <p className="text-sm text-cocoa/55">Tell us what you need for schools, gifting, or wholesale. We will reply on WhatsApp.</p>
              <div><input className={`input ${errors.name ? 'input-error' : ''}`} name="name" placeholder="Your name" /><FieldError message={errors.name} /></div>
              <div><input className={`input ${errors.phone ? 'input-error' : ''}`} name="phone" inputMode="numeric" maxLength="10" placeholder="WhatsApp number" /><FieldError message={errors.phone} /></div>
              <div><input className={`input ${errors.city ? 'input-error' : ''}`} name="city" placeholder="City" /><FieldError message={errors.city} /></div>
              <div><input className={`input ${errors.quantity ? 'input-error' : ''}`} name="quantity" type="number" min="10" placeholder="Quantity (minimum 10)" /><FieldError message={errors.quantity} /></div>
              <input className="input" name="product" placeholder="Product or category (optional)" />
              <textarea className="input min-h-24" name="note" placeholder="Occasion, budget or custom request (optional)" />
              <button className="button-primary w-full"><WhatsAppIcon size={18} /> Send on WhatsApp</button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

export { money }

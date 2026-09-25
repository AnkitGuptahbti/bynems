import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, ChevronDown, Heart, MapPin, Minus, PackageCheck, Plus, Search, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react'
import { FieldError, ProductCard, SectionHeading, money } from '../components/store'
import { useShop } from '../context/ShopContext'
import { AddressForm } from './AccountDetails'
import { TRACK_RULES, validateFields } from '../lib/validation'

export function Shop() {
  const { products, categories, catalogLoading, catalogError } = useShop()
  const [params, setParams] = useSearchParams()
  const [visible, setVisible] = useState(8)
  const category = params.get('category') || 'all'
  const query = (params.get('q') || '').toLowerCase()
  const sort = params.get('sort') || 'popular'

  const filtered = useMemo(() => {
    let items = products.filter((product) => (category === 'all' || product.category === category) && (!query || `${product.name} ${product.category} ${(product.tags || []).join(' ')}`.toLowerCase().includes(query)))
    if (sort === 'price-low') items = [...items].sort((a, b) => a.price - b.price)
    if (sort === 'price-high') items = [...items].sort((a, b) => b.price - a.price)
    if (sort === 'rating') items = [...items].sort((a, b) => b.rating - a.rating)
    if (sort === 'newest') items = [...items].sort((a, b) => Number(b.isNew) - Number(a.isNew))
    return items
  }, [products, category, query, sort])

  const update = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
  }

  return <main className="page-width py-8 sm:py-12">
    <p className="eyebrow">OUR SOFTEST COLLECTION</p><h1 className="font-display text-3xl font-bold sm:text-4xl md:text-6xl">Shop all</h1>
    <div className="mt-8 flex gap-2 overflow-x-auto pb-2">
      {[{ name: 'All', slug: 'all' }, ...categories].map((item) => <button key={item.slug} onClick={() => update('category', item.slug)} className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold ${category === item.slug ? 'border-cocoa bg-cocoa text-white' : 'border-cocoa/15 bg-white'}`}>{item.name}</button>)}
    </div>
    <div className="my-8 flex flex-col justify-between gap-3 border-y border-cocoa/10 py-4 sm:flex-row">
      <form className="flex min-w-0 w-full items-center gap-2 rounded-full bg-white px-4 sm:w-auto" onSubmit={(event) => { event.preventDefault(); update('q', new FormData(event.currentTarget).get('q')) }}><Search size={18} className="shrink-0" /><input name="q" defaultValue={params.get('q')} placeholder="Search products" className="min-w-0 flex-1 py-3 outline-none" /></form>
      <label className="select-wrap text-sm font-bold">Sort by
        <select value={sort} onChange={(event) => update('sort', event.target.value)}>
          <option value="popular">Popular</option>
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to high</option>
          <option value="price-high">Price: High to low</option>
          <option value="rating">Rating</option>
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 text-cocoa/50" size={16} />
      </label>
    </div>
    <p className="mb-6 text-sm text-cocoa/50">{filtered.length} cuddly companions</p>
    {catalogLoading && <div className="rounded-3xl bg-white py-20 text-center"><p className="font-bold">Loading the catalogue…</p></div>}
    {catalogError && <div className="rounded-3xl bg-red-50 py-20 text-center text-red-700"><p className="font-bold">{catalogError}</p></div>}
    {!catalogLoading && !catalogError && (filtered.length ? <div className="grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-3 md:gap-6 lg:grid-cols-4">{filtered.slice(0, visible).map((product) => <ProductCard product={product} key={product.id || product._id} />)}</div> : <div className="rounded-3xl bg-white py-20 text-center"><p className="text-lg font-bold">No toys found</p><button onClick={() => setParams({})} className="button-secondary mt-4">Clear filters</button></div>)}
    {visible < filtered.length && <div className="mt-12 text-center"><button className="button-secondary" onClick={() => setVisible((value) => value + 8)}>Load more</button></div>}
  </main>
}

function imageUrl(item) {
  return item?.url || item || ''
}

export function ProductDetails() {
  const { slug } = useParams()
  const { products, catalogLoading, addToCart, wishlist, toggleWishlist } = useShop()
  const product = products.find((item) => item.slug === slug || item._id === slug)
  const [color, setColor] = useState('')
  const [variantId, setVariantId] = useState('')
  const [quantity, setQuantity] = useState(1)
  const [activeImage, setActiveImage] = useState('')
  const colors = product?.colors?.length ? product.colors : [...new Set((product?.variants || []).map((variant) => variant.color).filter(Boolean))]
  const selectedColor = colors.includes(color) ? color : colors[0]
  const colorVariants = (product?.variants || []).filter((variant) => !selectedColor || variant.color === selectedColor)
  const selectedVariant = colorVariants.find((variant) => String(variant._id) === String(variantId)) || colorVariants[0] || product?.variants?.[0]
  const variantGallery = (selectedVariant?.images || []).map(imageUrl).filter(Boolean)
  const productGallery = (product?.images || []).map(imageUrl).filter(Boolean)
  const gallery = [...variantGallery, ...productGallery].filter((url, index, list) => list.indexOf(url) === index)
  const defaultImage = variantGallery[0] || productGallery[0] || product?.image || ''
  const image = (variantGallery.length ? variantGallery.includes(activeImage) : gallery.includes(activeImage)) ? activeImage : defaultImage

  if (catalogLoading) return <main className="page-width py-20 text-center"><p className="font-bold">Loading product…</p></main>
  if (!product) return <main className="page-width py-20 text-center"><h1 className="font-display text-3xl font-bold">Product not found</h1><Link to="/shop" className="button-secondary mt-5">Back to shop</Link></main>
  const id = product.id || product._id
  const displayPrice = selectedVariant?.price || product.price

  const chooseColor = (nextColor) => {
    const nextVariant = (product.variants || []).find((variant) => variant.color === nextColor)
    setColor(nextColor)
    setVariantId(nextVariant?._id || '')
    setActiveImage(nextVariant?.images?.[0]?.url || product.images?.[0]?.url || '')
  }

  const chooseVariant = (variant) => {
    setVariantId(variant._id)
    setActiveImage(variant.images?.[0]?.url || product.images?.[0]?.url || '')
  }

  return <main className="page-width py-8 md:py-12">
    <Link to="/shop" className="mb-6 inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={17} /> Back to shop</Link>
    <div className="grid gap-9 lg:grid-cols-2">
      <div><div className="overflow-hidden rounded-[2rem] bg-blush"><img key={image} src={image} className="aspect-square w-full object-cover transition hover:scale-110" alt={product.name} /></div><div className="mt-3 grid grid-cols-4 gap-3">{gallery.slice(0, 8).map((item) => <button key={item} type="button" onClick={() => setActiveImage(item)} className={`overflow-hidden rounded-xl ${item === image ? 'ring-2 ring-cocoa' : ''}`}><img src={item} className="aspect-square w-full object-cover" alt="" /></button>)}</div></div>
      <div className="min-w-0 lg:pl-8"><p className="eyebrow">{String(product.category).replaceAll('-', ' ')}</p><h1 className="font-display text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">{product.name}</h1>
        {product.rating > 0 && <div className="mt-4 flex items-center gap-2"><span className="flex items-center gap-1 rounded-full bg-green-700 px-2 py-1 text-xs font-bold text-white">{product.rating} <Star size={11} fill="white" /></span><span className="text-sm text-cocoa/50">{product.reviewCount || 0} verified reviews</span></div>}
        <div className="mt-6 flex items-baseline gap-3"><strong className="text-3xl">{money(displayPrice)}</strong><del className="text-lg text-cocoa/40">{money(product.mrp)}</del><span className="font-bold text-green-700">{Math.round((1-displayPrice/product.mrp)*100)}% off</span></div><p className="text-xs text-cocoa/40">Inclusive of all taxes</p>
        <p className="mt-6 leading-7 text-cocoa/65">{product.description}</p>
        {!!colors.length && <div className="mt-7"><strong>Select colour</strong><div className="mt-3 flex flex-wrap gap-2">{colors.map((item) => <button key={item} onClick={() => chooseColor(item)} className={`rounded-full border px-5 py-2.5 text-sm font-bold ${selectedColor === item ? 'border-cocoa bg-cocoa text-white' : 'border-cocoa/20 bg-white'}`}>{item}</button>)}</div></div>}
        {!!colorVariants.length && <div className="mt-7"><strong>Select size</strong><div className="mt-3 flex flex-wrap gap-2">{colorVariants.map((variant) => <button key={variant._id} onClick={() => chooseVariant(variant)} className={`rounded-full border px-5 py-2.5 text-sm font-bold ${String(selectedVariant?._id) === String(variant._id) ? 'border-cocoa bg-cocoa text-white' : 'border-cocoa/20 bg-white'}`}>{variant.label}</button>)}</div></div>}
        {selectedVariant && <div className="mt-5 rounded-2xl bg-white p-4 text-sm text-cocoa/65"><p><b>Dimensions:</b> {selectedVariant.lengthCm} × {selectedVariant.breadthCm} × {selectedVariant.heightCm} cm</p><p className="mt-1"><b>Weight:</b> {selectedVariant.weightGrams} g</p><p className="mt-1"><b>Stock:</b> {selectedVariant.stock} available</p></div>}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row"><div className="flex w-fit items-center rounded-full border border-cocoa/15 bg-white"><button className="p-3" onClick={() => setQuantity(Math.max(1, quantity-1))}><Minus size={16} /></button><span className="w-8 text-center">{quantity}</span><button className="p-3" onClick={() => setQuantity(quantity+1)}><Plus size={16} /></button></div><div className="flex min-w-0 flex-1 gap-3"><button onClick={() => addToCart(product, selectedVariant?._id, quantity)} className="button-primary min-w-0 flex-1"><ShoppingBag size={18} /> Add to cart</button><button onClick={() => toggleWishlist(id)} className="icon-button h-12 w-12 shrink-0 border border-cocoa/15 bg-white"><Heart fill={wishlist.includes(id) ? 'currentColor' : 'none'} /></button></div></div>
        <Link to="/checkout" onClick={() => addToCart(product, selectedVariant?._id, quantity)} className="button-secondary mt-3 w-full">Buy now</Link>
        <div className="mt-7 grid grid-cols-3 gap-2 rounded-2xl bg-white p-4 text-center text-xs font-bold"><span><Truck className="mx-auto mb-2 text-rose" />Fast delivery</span><span><ShieldCheck className="mx-auto mb-2 text-rose" />Secure payment</span><span><PackageCheck className="mx-auto mb-2 text-rose" />Easy returns</span></div>
        <details className="product-detail" open><summary>Description</summary><p>{product.description}</p></details><details className="product-detail"><summary>Shipping & returns</summary><p>Dispatched within 1–2 business days. Easy returns within 7 days of delivery.</p></details>
      </div>
    </div>
    <section className="pt-20"><SectionHeading eyebrow="MORE TO LOVE" title="You may also like" /><div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">{products.filter((item) => item !== product).slice(0,4).map((item) => <ProductCard key={item.id || item._id} product={item} />)}</div></section>
  </main>
}

export function Cart() {
  const { cart, subtotal, updateQuantity, removeFromCart } = useShop()
  const shipping = subtotal >= 999 ? 0 : 79
  return <main className="page-width py-8 sm:py-12"><h1 className="font-display text-3xl font-bold sm:text-4xl">Your shopping bag</h1>
    {!cart.length ? <EmptyBag /> : <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]"><div className="space-y-4">{cart.map((item) => { const {product,quantity}=item; const id=product.id||product._id; const variant=item.variant||product.variants?.find((entry)=>String(entry._id)===String(item.variantId)); const image=variant?.images?.[0]?.url||product.image||product.images?.[0]?.url||product.images?.[0]; return <article key={`${id}-${item.variantId||item.size}`} className="flex gap-3 rounded-3xl bg-white p-3 sm:gap-4 sm:p-4"><img src={image} className="h-20 w-20 shrink-0 rounded-2xl object-cover sm:h-28 sm:w-28" /><div className="flex min-w-0 flex-1 flex-col"><Link to={`/products/${product.slug||id}`} className="font-display text-base font-bold sm:text-lg">{product.name}</Link><span className="text-xs text-cocoa/50 sm:text-sm">{variant?.color||item.color} · {variant?.label||item.size}{variant?.weightGrams ? ` · ${variant.weightGrams}g` : ''}</span><strong className="mt-1">{money(variant?.price||product.price)}</strong><div className="mt-auto flex items-center justify-between gap-2"><div className="flex rounded-full border border-cocoa/15"><button className="p-2" onClick={()=>updateQuantity(id,item.variantId,quantity-1)}><Minus size={14}/></button><span className="w-7 self-center text-center">{quantity}</span><button className="p-2" onClick={()=>updateQuantity(id,item.variantId,quantity+1)}><Plus size={14}/></button></div><button onClick={()=>removeFromCart(id,item.variantId)} className="text-xs font-bold text-rose">REMOVE</button></div></div></article>})}</div><OrderSummary subtotal={subtotal} shipping={shipping} /></div>}
  </main>
}

function EmptyBag() { return <div className="mt-8 rounded-3xl bg-white py-20 text-center"><ShoppingBag className="mx-auto text-cocoa/30" size={50}/><h2 className="mt-4 font-display text-2xl font-bold">Your bag feels a little light</h2><p className="mt-2 text-cocoa/50">Fill it with a friend made for hugs.</p><Link to="/shop" className="button-primary mt-6">Start shopping</Link></div> }

function OrderSummary({subtotal,shipping,showCheckout=true}) { return <aside className="h-fit rounded-3xl bg-white p-6"><h2 className="font-display text-xl font-bold">Order summary</h2><div className="mt-5 space-y-3 text-sm"><div className="flex justify-between"><span>Subtotal</span><span>{money(subtotal)}</span></div><div className="flex justify-between"><span>Shipping</span><span className={shipping ? '' : 'font-bold text-green-700'}>{shipping ? money(shipping) : 'FREE'}</span></div><div className="flex justify-between border-t border-cocoa/10 pt-4 text-lg font-bold"><span>Total</span><span>{money(subtotal+shipping)}</span></div></div><input placeholder="Coupon code" className="input mt-5"/>{showCheckout&&<Link to="/checkout" className="button-primary mt-4 w-full">Proceed to checkout <ArrowRight size={17}/></Link>}</aside> }

export function Wishlist() {
  const { products, wishlist } = useShop()
  const saved = products.filter((product) => wishlist.includes(product.id || product._id))
  return <main className="page-width py-12"><SectionHeading eyebrow="SAVED FOR LATER" title="Your wishlist" />{saved.length ? <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-6">{saved.map((product)=><ProductCard key={product.id||product._id} product={product}/>)}</div> : <div className="rounded-3xl bg-white py-20 text-center"><Heart className="mx-auto text-cocoa/30" size={48}/><p className="mt-4 font-bold">No favourites yet.</p><Link to="/shop" className="button-secondary mt-5">Find something lovable</Link></div>}</main>
}

function loadRazorpay() {
  if (window.Razorpay) return Promise.resolve(true)
  return new Promise((resolve) => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

export function Checkout() {
  const { cart, subtotal, user, apiRequest, clearCart } = useShop()
  const navigate = useNavigate()
  const [loading,setLoading] = useState(false)
  const [error,setError] = useState('')
  const [addresses,setAddresses] = useState([])
  const [selectedAddressId,setSelectedAddressId] = useState('')
  const [addressesLoading,setAddressesLoading] = useState(true)
  const [addressFormOpen,setAddressFormOpen] = useState(false)
  const [addressSaving,setAddressSaving] = useState(false)
  const [addressError,setAddressError] = useState('')
  const shipping=subtotal>=999?0:79

  useEffect(() => {
    if (!user) return
    apiRequest('/users/addresses')
      .then((data) => {
        setAddresses(data.addresses)
        setSelectedAddressId((current) => current || data.addresses.find((address) => address.isDefault)?._id || data.addresses[0]?._id || '')
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setAddressesLoading(false))
  }, [apiRequest, user])

  const addAddress = async (event) => {
    event.preventDefault()
    setAddressSaving(true)
    setAddressError('')
    const fields = Object.fromEntries(new FormData(event.currentTarget))
    try {
      const created = await apiRequest('/users/addresses', {
        method: 'POST',
        body: JSON.stringify({ ...fields, isDefault: fields.isDefault === 'on' }),
      })
      const refreshed = await apiRequest('/users/addresses')
      setAddresses(refreshed.addresses)
      setSelectedAddressId(created.address._id)
      setAddressFormOpen(false)
    } catch (requestError) {
      setAddressError(requestError.message)
    } finally {
      setAddressSaving(false)
    }
  }

  const placeOrder = async (event) => {
    event.preventDefault(); setLoading(true); setError('')
    try {
      const selectedAddress = addresses.find((address) => address._id === selectedAddressId)
      if (!selectedAddress) throw new Error('Add and select a delivery address before continuing')
      await apiRequest('/cart', { method: 'DELETE' })
      for (const item of cart) {
        const variantId = item.variantId || item.variant?._id || item.product?.variants?.find((variant) => variant.label === item.size)?._id || item.product?.variants?.[0]?._id
        if (!item.product?._id || !variantId) throw new Error('Select a product variant before paying')
        await apiRequest('/cart/items', { method: 'POST', body: JSON.stringify({ productId: item.product._id, variantId, quantity: item.quantity }) })
      }
      const paymentMethod = 'ONLINE'
      const payload = {
        paymentMethod,
        shippingAddress: {
          fullName: selectedAddress.fullName, phone: selectedAddress.phone, email: selectedAddress.email,
          address: selectedAddress.address, apartment: selectedAddress.apartment,
          city: selectedAddress.city, state: selectedAddress.state,
          pincode: selectedAddress.pincode, country: selectedAddress.country,
        },
      }
      const created = await apiRequest('/orders', { method: 'POST', body: JSON.stringify(payload) })
      const order = created.order
      if (!(await loadRazorpay())) throw new Error('Could not load the secure payment window')
      const { payment } = await apiRequest('/payments/create', { method: 'POST', body: JSON.stringify({ orderId: order.orderId }) })
      await new Promise((resolve, reject) => {
        const checkout = new window.Razorpay({
          key: payment.keyId, amount: payment.amount, currency: payment.currency,
          order_id: payment.orderId, name: 'BYNEMSTOYS', description: order.orderId,
          prefill: { name: selectedAddress.fullName, email: selectedAddress.email, contact: selectedAddress.phone },
          theme: { color: '#4b3025' },
          handler: async (response) => {
            try {
              await apiRequest('/payments/verify', { method: 'POST', body: JSON.stringify(response) })
              resolve()
            } catch (paymentError) { reject(paymentError) }
          },
          modal: { ondismiss: () => reject(new Error('Payment was cancelled')) },
        })
        checkout.open()
      })
      clearCart()
      navigate(`/order-success?order=${order.orderId}`)
    } catch (requestError) { setError(requestError.message) } finally { setLoading(false) }
  }
  if(!user) return <main className="page-width grid min-h-[65vh] place-items-center py-12"><div className="max-w-md rounded-3xl bg-white p-8 text-center"><ShieldCheck className="mx-auto text-rose" size={42}/><h1 className="mt-4 font-display text-3xl font-bold">Sign in to checkout</h1><p className="mt-2 text-cocoa/55">Your account keeps payment and delivery details secure.</p><Link to="/account" className="button-primary mt-6">Login or create account</Link></div></main>
  if(!cart.length) return <main className="page-width py-12"><EmptyBag/></main>
  return <main className="page-width py-8 pb-24 sm:py-12">
    <h1 className="font-display text-3xl font-bold sm:text-4xl">Checkout</h1>
    {error&&<p className="mt-5 rounded-xl bg-red-50 p-4 text-sm font-semibold text-red-700">{error}</p>}
    <form onSubmit={placeOrder} className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
      <div className="space-y-6">
        <fieldset className="form-card">
          <legend>Delivery address</legend>
          {addressesLoading ? <p className="text-sm text-cocoa/50">Loading saved addresses…</p> : <>
            {!!addresses.length && <div className="grid gap-3 sm:grid-cols-2">{addresses.map((address) => <label key={address._id} className={`cursor-pointer rounded-2xl border p-4 transition ${selectedAddressId === address._id ? 'border-rose bg-blush/40 ring-2 ring-rose/10' : 'border-cocoa/10'}`}><div className="flex items-start gap-3"><input type="radio" name="savedAddress" value={address._id} checked={selectedAddressId === address._id} onChange={() => setSelectedAddressId(address._id)} className="mt-1 accent-rose"/><div><div className="flex items-center gap-2"><MapPin size={16} className="text-rose"/><strong>{address.label}</strong>{address.isDefault&&<span className="badge">DEFAULT</span>}</div><p className="mt-2 text-sm font-bold">{address.fullName}</p><p className="mt-1 text-xs leading-5 text-cocoa/55">{address.address}{address.apartment ? `, ${address.apartment}` : ''}<br/>{address.city}, {address.state} {address.pincode}<br/>{address.phone}</p></div></div></label>)}</div>}
            {!addresses.length && <div className="rounded-2xl bg-cream p-6 text-center"><MapPin className="mx-auto text-cocoa/30"/><p className="mt-3 font-bold">Add a delivery address to continue</p><p className="mt-1 text-sm text-cocoa/50">Your saved address will also be available for future orders.</p></div>}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row"><button type="button" className="button-secondary" onClick={() => { setAddressError(''); setAddressFormOpen(true) }}><Plus size={17}/> Add new address</button>{!!addresses.length&&<Link to="/account/addresses" className="button-secondary">Manage addresses</Link>}</div>
          </>}
        </fieldset>
        <fieldset className="form-card">
          <legend>Payment method</legend>
          <div className="payment-option"><ShieldCheck className="text-rose"/><span><b>Pay securely online</b><small>UPI, Card or Net Banking via Razorpay</small></span></div>
          <p className="mt-3 text-xs text-cocoa/45">Cash on Delivery is currently unavailable.</p>
        </fieldset>
      </div>
      <aside><OrderSummary subtotal={subtotal} shipping={shipping} showCheckout={false}/><button disabled={loading||addressesLoading||!selectedAddressId} className="button-primary mt-4 w-full">{loading?'Placing order…':`Pay securely · ${money(subtotal+shipping)}`}</button></aside>
    </form>
    {addressFormOpen&&<AddressForm user={user} saving={addressSaving} error={addressError} onSubmit={addAddress} onClose={() => { setAddressFormOpen(false); setAddressError('') }}/>}
  </main>
}

export function TrackOrder() {
  const { apiRequest } = useShop()
  const [params] = useSearchParams()
  const [result,setResult]=useState(null)
  const [error,setError]=useState('')
  const [fieldErrors,setFieldErrors]=useState({})
  const submit=async(event)=>{
    event.preventDefault(); setError(''); setResult(null)
    const fields=Object.fromEntries(new FormData(event.currentTarget))
    const nextErrors = validateFields(fields, TRACK_RULES)
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    try {
      const data=await apiRequest(`/orders/track/${encodeURIComponent(fields.orderId)}?phone=${encodeURIComponent(fields.phone)}`)
      setResult(data.order)
    } catch(requestError) { setError(requestError.message) }
  }
  const progress = [
    ['CONFIRMED', 'Order confirmed'],
    ['PACKED', 'Packed'],
    ['SHIPPED', 'Shipped'],
    ['OUT_FOR_DELIVERY', 'Out for delivery'],
    ['DELIVERED', 'Delivered'],
  ]
  const statusIndex = (status) => progress.findIndex(([value]) => value === status)
  const isPaid = result?.paymentStatus === 'PAID'
  const currentIndex = result && isPaid
    ? Math.max(statusIndex(result.orderStatus), statusIndex(result.shippingStatus), 0)
    : -1
  const displayStatus = !result
    ? ''
    : !isPaid
      ? result.paymentStatus === 'FAILED' ? 'PAYMENT FAILED' : result.paymentStatus === 'REFUNDED' ? 'PAYMENT REFUNDED' : 'AWAITING PAYMENT'
      : result.shippingStatus && result.shippingStatus !== 'PENDING'
        ? result.shippingStatus
        : result.orderStatus

  return <main className="page-width max-w-3xl! py-16">
    <div className="text-center"><p className="eyebrow">WHERE IS MY CUDDLE?</p><h1 className="font-display text-4xl font-bold md:text-5xl">Track your order</h1><p className="mt-3 text-cocoa/55">Enter your order details for the latest delivery update.</p></div>
    <form onSubmit={submit} noValidate className="mt-8 grid gap-3 rounded-3xl bg-white p-6 shadow-sm sm:grid-cols-2"><div><input className={`input ${fieldErrors.orderId ? 'input-error' : ''}`} name="orderId" defaultValue={params.get('order') || ''} placeholder="Order ID" /><FieldError message={fieldErrors.orderId} /></div><div><input className={`input ${fieldErrors.phone ? 'input-error' : ''}`} name="phone" inputMode="numeric" maxLength="10" defaultValue={params.get('phone') || ''} placeholder="Phone number" /><FieldError message={fieldErrors.phone} /></div><button className="button-primary sm:col-span-2">Track order</button>{error&&<p className="text-center text-sm font-semibold text-red-700 sm:col-span-2">{error}</p>}</form>
    {result&&<div className="mt-7 rounded-3xl bg-white p-7">
      <div className="flex justify-between gap-4"><div><p className="text-xs text-cocoa/50">ORDER</p><strong>{result.orderId}</strong></div><span className="badge h-fit">{String(displayStatus).replaceAll('_',' ')}</span></div>
      {!isPaid&&<div className="mt-5 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800"><strong>{result.paymentStatus === 'FAILED' ? 'Payment failed' : result.paymentStatus === 'REFUNDED' ? 'Payment refunded' : 'Payment pending'}</strong><p className="mt-1">{result.paymentStatus === 'FAILED' ? 'This order was not confirmed because the payment failed.' : result.paymentStatus === 'REFUNDED' ? 'The payment for this order has been refunded.' : 'This order will be confirmed after payment is completed.'}</p></div>}
      {result.awbNumber&&<p className="mt-4 text-sm text-cocoa/55">Courier: <b>{result.courier}</b> · AWB: <b>{result.awbNumber}</b></p>}
      <div className="mt-8 space-y-0">{progress.map(([,step],index)=><div className="flex gap-4" key={step}><div className="flex flex-col items-center"><span className={`grid h-7 w-7 place-items-center rounded-full ${index<=currentIndex?'bg-green-700 text-white':'bg-cocoa/10'}`}>{index<=currentIndex?<Check size={14}/>:index+1}</span>{index<progress.length-1&&<i className="h-10 w-px bg-cocoa/15"/>}</div><span className={index<=currentIndex?'font-bold':'text-cocoa/40'}>{step}</span></div>)}</div>
    </div>}
  </main>
}

export function OrderSuccess() {
  const { clearCart } = useShop()
  const [params]=useSearchParams()
  useEffect(() => { clearCart() }, [clearCart])
  return <main className="page-width grid min-h-[65vh] place-items-center py-12"><div className="max-w-lg rounded-[2rem] bg-white p-8 text-center shadow-sm"><div className="mx-auto grid h-18 w-18 place-items-center rounded-full bg-green-100 text-green-700"><Check size={34}/></div><h1 className="mt-5 font-display text-4xl font-bold">Your cuddle is confirmed!</h1><p className="mt-3 text-cocoa/55">We will send tracking updates as soon as your order is packed.</p><p className="mt-5 rounded-xl bg-cream p-3 text-sm">Order ID: <b>{params.get('order')}</b></p><Link to="/" className="button-primary mt-6">Continue shopping</Link></div></main>
}

import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Edit3, MapPin, Package, Plus, Star, Trash2, Truck, X } from 'lucide-react'
import { FieldError, money } from '../components/store'
import { useShop } from '../context/ShopContext'
import { ADDRESS_RULES, INDIAN_STATES, REVIEW_RULES, validateFields } from '../lib/validation'

function productIdOf(item) {
  return String(item.product?._id || item.product || '')
}

export function MyOrders() {
  const { user, apiRequest } = useShop()
  const [orders, setOrders] = useState([])
  const [reviewStatusByProduct, setReviewStatusByProduct] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reviewing, setReviewing] = useState(null)
  const [reviewSaving, setReviewSaving] = useState(false)
  const [reviewError, setReviewError] = useState('')

  useEffect(() => {
    if (!user) return
    Promise.all([apiRequest('/orders'), apiRequest('/reviews/mine')])
      .then(([orderData, reviewData]) => {
        setOrders(orderData.orders)
        setReviewStatusByProduct(Object.fromEntries((reviewData.reviews || []).map((review) => [String(review.product), review.status || (review.isApproved ? 'APPROVED' : 'PENDING')])))
      })
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [apiRequest, user])

  if (!user) return <Navigate to="/account" replace />

  const saveReview = async ({ rating, comment }) => {
    if (!reviewing) return
    setReviewSaving(true)
    setReviewError('')
    try {
      await apiRequest(`/reviews/${reviewing.productId}`, {
        method: 'POST',
        body: JSON.stringify({ rating, comment }),
      })
      setReviewStatusByProduct((current) => ({ ...current, [reviewing.productId]: 'PENDING' }))
      setReviewing(null)
    } catch (requestError) {
      setReviewError(requestError.message)
    } finally {
      setReviewSaving(false)
    }
  }

  return (
    <AccountPage title="My orders" subtitle="View your purchases and delivery progress.">
      {loading && <Message text="Loading your orders…" />}
      {error && <Message text={error} error />}
      {!loading && !error && !orders.length && (
        <div className="rounded-3xl bg-white py-16 text-center">
          <Package className="mx-auto text-cocoa/25" size={48} />
          <h2 className="mt-4 font-display text-xl font-bold">No orders yet</h2>
          <p className="mt-2 text-sm text-cocoa/50">Your future cuddly companions will appear here.</p>
          <Link to="/shop" className="button-primary mt-6">Start shopping</Link>
        </div>
      )}
      <div className="space-y-5">
        {orders.map((order) => (
          <article key={order._id} className="overflow-hidden rounded-3xl bg-white shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-cocoa/10 p-5">
              <div><span className="text-xs text-cocoa/45">ORDER</span><strong className="ml-2">{order.orderId}</strong><p className="mt-1 text-xs text-cocoa/45">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p></div>
              <div className="flex items-center gap-2"><span className="badge">{order.paymentStatus === 'PENDING' ? 'PAYMENT PENDING' : order.paymentStatus}</span><span className="rounded-full bg-cocoa/10 px-3 py-1 text-xs font-bold">{order.orderStatus === 'PENDING' ? 'AWAITING PAYMENT' : order.orderStatus}</span></div>
            </div>
            <div className="space-y-3 p-5">
              {order.items.map((item, index) => {
                const productId = productIdOf(item)
                const delivered = order.orderStatus === 'DELIVERED'
                const reviewStatus = reviewStatusByProduct[productId]
                return (
                  <div key={`${item.sku}-${index}`} className="flex flex-wrap items-center gap-3 sm:gap-4">
                    <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl bg-cream object-cover" />
                    <div className="min-w-0 flex-1"><strong className="block truncate">{item.name}</strong><span className="text-xs text-cocoa/50">{[item.color, item.size, item.weightGrams ? `${item.weightGrams}g` : ''].filter(Boolean).join(' · ')} · Qty {item.quantity}</span></div>
                    <strong>{money(item.total)}</strong>
                    {delivered && productId && (reviewStatus === 'APPROVED'
                      ? <span className="w-full text-xs font-bold text-green-700 sm:w-auto">Reviewed</span>
                      : reviewStatus === 'PENDING'
                        ? <span className="w-full text-xs font-bold text-amber-700 sm:w-auto">Awaiting approval</span>
                        : reviewStatus === 'REJECTED'
                          ? <span className="w-full text-xs font-bold text-cocoa/45 sm:w-auto">Not published</span>
                          : <button type="button" className="button-secondary min-h-10! w-full px-4 text-xs sm:w-auto" onClick={() => { setReviewError(''); setReviewing({ productId, productName: item.name }) }}><Star size={14} /> Rate & review</button>
                    )}
                  </div>
                )
              })}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 bg-cream/60 px-5 py-4">
              <div><span className="text-sm text-cocoa/50">Total </span><strong className="text-lg">{money(order.totalAmount)}</strong></div>
              <Link to={`/track-order?order=${encodeURIComponent(order.orderId)}&phone=${encodeURIComponent(order.shippingAddress.phone)}`} className="button-secondary min-h-10!"><Truck size={16} /> Track order</Link>
            </div>
          </article>
        ))}
      </div>
      {reviewing && (
        <ReviewForm
          productName={reviewing.productName}
          saving={reviewSaving}
          error={reviewError}
          onSubmit={saveReview}
          onClose={() => { setReviewing(null); setReviewError('') }}
        />
      )}
    </AccountPage>
  )
}

export function Addresses() {
  const { user, apiRequest } = useShop()
  const [addresses, setAddresses] = useState([])
  const [editing, setEditing] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const loadAddresses = useCallback(async () => {
    if (!user) return
    try {
      const data = await apiRequest('/users/addresses')
      setAddresses(data.addresses)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [apiRequest, user])

  useEffect(() => {
    const timer = window.setTimeout(loadAddresses, 0)
    return () => window.clearTimeout(timer)
  }, [loadAddresses])

  if (!user) return <Navigate to="/account" replace />

  const openForm = (address = null) => {
    setEditing(address)
    setFormOpen(true)
    setError('')
  }

  const saveAddress = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    const fields = Object.fromEntries(new FormData(event.currentTarget))
    const payload = { ...fields, isDefault: fields.isDefault === 'on' }
    try {
      await apiRequest(`/users/addresses${editing ? `/${editing._id}` : ''}`, {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify(payload),
      })
      setFormOpen(false)
      setEditing(null)
      await loadAddresses()
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteAddress = async (address) => {
    if (!window.confirm(`Delete the ${address.label} address?`)) return
    try {
      await apiRequest(`/users/addresses/${address._id}`, { method: 'DELETE' })
      await loadAddresses()
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <AccountPage title="Saved addresses" subtitle="Manage addresses used during checkout." action={<button className="button-primary" onClick={() => openForm()}><Plus size={17} /> Add address</button>}>
      {error && <Message text={error} error />}
      {loading && <Message text="Loading your addresses…" />}
      {!loading && !addresses.length && <div className="rounded-3xl bg-white py-16 text-center"><MapPin className="mx-auto text-cocoa/25" size={48} /><h2 className="mt-4 font-display text-xl font-bold">No saved addresses</h2><button className="button-primary mt-6" onClick={() => openForm()}><Plus size={17} /> Add your first address</button></div>}
      <div className="grid gap-4 md:grid-cols-2">
        {addresses.map((address) => (
          <article key={address._id} className="rounded-3xl bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-3"><div className="flex items-center gap-2"><MapPin className="text-rose" size={20} /><h2 className="font-display text-xl font-bold">{address.label}</h2>{address.isDefault && <span className="badge">DEFAULT</span>}</div><div className="flex"><button className="icon-button" onClick={() => openForm(address)} aria-label="Edit address"><Edit3 size={16} /></button><button className="icon-button text-red-600" onClick={() => deleteAddress(address)} aria-label="Delete address"><Trash2 size={16} /></button></div></div>
            <p className="mt-4 font-bold">{address.fullName}</p>
            <p className="mt-1 text-sm leading-6 text-cocoa/60">{address.address}{address.apartment ? `, ${address.apartment}` : ''}<br />{address.city}, {address.state} {address.pincode}<br />{address.country}</p>
            <p className="mt-3 text-sm text-cocoa/60">{address.phone}{address.email ? ` · ${address.email}` : ''}</p>
          </article>
        ))}
      </div>
      {formOpen && <AddressForm address={editing} user={user} saving={saving} error={error} onSubmit={saveAddress} onClose={() => { setFormOpen(false); setEditing(null); setError('') }} />}
    </AccountPage>
  )
}

function AddressField({ name, error, className = '', ...props }) {
  return <div className={className}><input name={name} className={`input ${error ? 'input-error' : ''}`} {...props} /><FieldError message={error} /></div>
}

export function AddressForm({ address, user, saving, error, onSubmit, onClose }) {
  const [fieldErrors, setFieldErrors] = useState({})
  const selectedState = INDIAN_STATES.includes(address?.state) ? address.state : address?.state || ''

  const handleSubmit = (event) => {
    event.preventDefault()
    const fields = Object.fromEntries(new FormData(event.currentTarget))
    const nextErrors = validateFields(fields, ADDRESS_RULES)
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSubmit(event)
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-cocoa/50 p-3 backdrop-blur-sm sm:p-8" onMouseDown={onClose}>
      <div className="mx-auto max-w-2xl rounded-3xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-cocoa/10 p-5 sm:px-7">
          <h2 className="font-display text-2xl font-bold">{address ? 'Edit address' : 'Add address'}</h2>
          <button className="icon-button" onClick={onClose}><X /></button>
        </div>
        <form onSubmit={handleSubmit} noValidate className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">
          {error && <div className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 sm:col-span-2">{error}</div>}
          <AddressField name="label" placeholder="Label (Home, Work)" defaultValue={address?.label || 'Home'} error={fieldErrors.label} />
          <AddressField name="fullName" placeholder="Full name" defaultValue={address?.fullName || user.name} error={fieldErrors.fullName} />
          <AddressField name="phone" inputMode="numeric" maxLength="10" placeholder="Phone number" defaultValue={address?.phone || user.phone} error={fieldErrors.phone} />
          <AddressField name="email" type="email" placeholder="Email" defaultValue={address?.email || user.email} error={fieldErrors.email} />
          <AddressField name="address" className="sm:col-span-2" placeholder="House number, street and area" defaultValue={address?.address} error={fieldErrors.address} />
          <AddressField name="apartment" className="sm:col-span-2" placeholder="Apartment or landmark (optional)" defaultValue={address?.apartment} />
          <AddressField name="city" placeholder="City" defaultValue={address?.city} error={fieldErrors.city} />
          <div>
            <select name="state" defaultValue={selectedState} className={`select ${fieldErrors.state ? 'select-error' : ''}`}>
              <option value="">Select state</option>
              {INDIAN_STATES.map((state) => <option key={state} value={state}>{state}</option>)}
              {selectedState && !INDIAN_STATES.includes(selectedState) && <option value={selectedState}>{selectedState}</option>}
            </select>
            <FieldError message={fieldErrors.state} />
          </div>
          <AddressField name="pincode" inputMode="numeric" maxLength="6" placeholder="6-digit pincode" defaultValue={address?.pincode} error={fieldErrors.pincode} />
          <AddressField name="country" placeholder="Country" defaultValue={address?.country || 'India'} error={fieldErrors.country} />
          <label className="flex items-center gap-2 text-sm font-bold sm:col-span-2"><input type="checkbox" name="isDefault" defaultChecked={address?.isDefault} /> Make this my default address</label>
          <div className="flex justify-end gap-3 border-t border-cocoa/10 pt-5 sm:col-span-2">
            <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
            <button disabled={saving} className="button-primary">{saving ? 'Saving…' : 'Save address'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export function ReviewForm({ productName, saving, error, onSubmit, onClose }) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const handleSubmit = (event) => {
    event.preventDefault()
    const nextErrors = validateFields({ rating, comment }, REVIEW_RULES)
    setFieldErrors(nextErrors)
    if (Object.keys(nextErrors).length) return
    onSubmit({ rating: Number(rating), comment: comment.trim() })
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-cocoa/50 p-3 backdrop-blur-sm sm:p-8" onMouseDown={onClose}>
      <div className="mx-auto max-w-lg rounded-3xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-cocoa/10 p-5 sm:px-7">
          <div>
            <p className="eyebrow">VERIFIED BUYER</p>
            <h2 className="font-display text-2xl font-bold">Rate this product</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close review form"><X /></button>
        </div>
        <form onSubmit={handleSubmit} noValidate className="grid gap-4 p-5 sm:p-7">
          {productName && <p className="text-sm font-bold text-cocoa/70">{productName}</p>}
          <p className="text-xs text-cocoa/50">Your review is checked before it appears on the product page.</p>
          {error && <div className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</div>}
          <div>
            <p className="mb-2 text-sm font-bold">Your rating</p>
            <div className="flex gap-1" role="radiogroup" aria-label="Rating">
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} onClick={() => setRating(star)} className="p-1" aria-label={`${star} star${star > 1 ? 's' : ''}`}>
                  <Star size={28} className={star <= rating ? 'fill-gold text-gold' : 'text-cocoa/25'} />
                </button>
              ))}
            </div>
            <FieldError message={fieldErrors.rating} />
          </div>
          <div>
            <textarea className={`input min-h-28 ${fieldErrors.comment ? 'input-error' : ''}`} value={comment} onChange={(event) => setComment(event.target.value)} maxLength={2000} placeholder="Share what you liked about this toy" />
            <FieldError message={fieldErrors.comment} />
          </div>
          <div className="flex justify-end gap-3 border-t border-cocoa/10 pt-5">
            <button type="button" className="button-secondary" onClick={onClose}>Cancel</button>
            <button disabled={saving} className="button-primary">{saving ? 'Submitting…' : 'Submit review'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AccountPage({ title, subtitle, action, children }) {
  return <main className="page-width py-10 sm:py-14"><Link to="/account" className="mb-6 inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={17} /> Back to account</Link><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">MY ACCOUNT</p><h1 className="font-display text-4xl font-bold">{title}</h1><p className="mt-2 text-cocoa/50">{subtitle}</p></div>{action}</div>{children}</main>
}

function Message({ text, error = false }) {
  return <p className={`mb-5 rounded-2xl p-5 text-center text-sm ${error ? 'bg-red-50 font-semibold text-red-700' : 'bg-white text-cocoa/50'}`}>{text}</p>
}

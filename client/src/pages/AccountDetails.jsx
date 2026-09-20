import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowLeft, Edit3, MapPin, Package, Plus, Trash2, Truck, X } from 'lucide-react'
import { money } from '../components/store'
import { useShop } from '../context/ShopContext'

export function MyOrders() {
  const { user, apiRequest } = useShop()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return
    apiRequest('/orders')
      .then((data) => setOrders(data.orders))
      .catch((requestError) => setError(requestError.message))
      .finally(() => setLoading(false))
  }, [apiRequest, user])

  if (!user) return <Navigate to="/account" replace />

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
              {order.items.map((item, index) => (
                <div key={`${item.sku}-${index}`} className="flex items-center gap-4">
                  <img src={item.image} alt={item.name} className="h-16 w-16 rounded-xl bg-cream object-cover" />
                  <div className="min-w-0 flex-1"><strong className="block truncate">{item.name}</strong><span className="text-xs text-cocoa/50">{[item.color, item.size, item.weightGrams ? `${item.weightGrams}g` : ''].filter(Boolean).join(' · ')} · Qty {item.quantity}</span></div>
                  <strong>{money(item.total)}</strong>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 bg-cream/60 px-5 py-4">
              <div><span className="text-sm text-cocoa/50">Total </span><strong className="text-lg">{money(order.totalAmount)}</strong></div>
              <Link to={`/track-order?order=${encodeURIComponent(order.orderId)}&phone=${encodeURIComponent(order.shippingAddress.phone)}`} className="button-secondary min-h-10!"><Truck size={16} /> Track order</Link>
            </div>
          </article>
        ))}
      </div>
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

export function AddressForm({ address, user, saving, error, onSubmit, onClose }) {
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-cocoa/50 p-3 backdrop-blur-sm sm:p-8" onMouseDown={onClose}><div className="mx-auto max-w-2xl rounded-3xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-center justify-between border-b border-cocoa/10 p-5 sm:px-7"><h2 className="font-display text-2xl font-bold">{address ? 'Edit address' : 'Add address'}</h2><button className="icon-button" onClick={onClose}><X /></button></div><form onSubmit={onSubmit} className="grid gap-4 p-5 sm:grid-cols-2 sm:p-7">{error && <div className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700 sm:col-span-2">{error}</div>}<input className="input" name="label" placeholder="Label (Home, Work)" defaultValue={address?.label || 'Home'} required /><input className="input" name="fullName" placeholder="Full name" defaultValue={address?.fullName || user.name} required /><input className="input" name="phone" placeholder="Phone number" defaultValue={address?.phone || user.phone} required /><input className="input" name="email" type="email" placeholder="Email" defaultValue={address?.email || user.email} /><input className="input sm:col-span-2" name="address" placeholder="House number, street and area" defaultValue={address?.address} required /><input className="input sm:col-span-2" name="apartment" placeholder="Apartment or landmark (optional)" defaultValue={address?.apartment} /><input className="input" name="city" placeholder="City" defaultValue={address?.city} required /><input className="input" name="state" placeholder="State" defaultValue={address?.state} required /><input className="input" name="pincode" inputMode="numeric" pattern="[0-9]{6}" placeholder="6-digit pincode" defaultValue={address?.pincode} required /><input className="input" name="country" placeholder="Country" defaultValue={address?.country || 'India'} required /><label className="flex items-center gap-2 text-sm font-bold sm:col-span-2"><input type="checkbox" name="isDefault" defaultChecked={address?.isDefault} /> Make this my default address</label><div className="flex justify-end gap-3 border-t border-cocoa/10 pt-5 sm:col-span-2"><button type="button" className="button-secondary" onClick={onClose}>Cancel</button><button disabled={saving} className="button-primary">{saving ? 'Saving…' : 'Save address'}</button></div></form></div></div>
}

function AccountPage({ title, subtitle, action, children }) {
  return <main className="page-width py-10 sm:py-14"><Link to="/account" className="mb-6 inline-flex items-center gap-2 text-sm font-bold"><ArrowLeft size={17} /> Back to account</Link><div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><p className="eyebrow">MY ACCOUNT</p><h1 className="font-display text-4xl font-bold">{title}</h1><p className="mt-2 text-cocoa/50">{subtitle}</p></div>{action}</div>{children}</main>
}

function Message({ text, error = false }) {
  return <p className={`mb-5 rounded-2xl p-5 text-center text-sm ${error ? 'bg-red-50 font-semibold text-red-700' : 'bg-white text-cocoa/50'}`}>{text}</p>
}

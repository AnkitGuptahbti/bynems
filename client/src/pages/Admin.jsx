import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import {
  AlertTriangle, Box, Boxes, Check, ClipboardList, Edit3, ExternalLink, FolderTree,
  LayoutDashboard, LogOut, Package, Plus, Search, ShoppingBag, Star, Trash2,
  Upload, Users, X,
} from 'lucide-react'
import { money } from '../components/store'
import { useShop } from '../context/ShopContext'

const sections = [
  ['dashboard', 'Dashboard', LayoutDashboard],
  ['products', 'Products', Boxes],
  ['categories', 'Categories', FolderTree],
  ['orders', 'Orders', ClipboardList],
  ['reviews', 'Reviews', Star],
]

export function Admin() {
  const { user, setUser, apiRequest } = useShop()
  const [section, setSection] = useState('dashboard')
  const [data, setData] = useState({ summary: null, products: [], categories: [], orders: [], reviews: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [modal, setModal] = useState(null)

  const loadData = useCallback(async () => {
    if (user?.role !== 'admin') return
    setLoading(true)
    setError('')
    try {
      const [summary, products, categories, orders, reviews] = await Promise.all([
        apiRequest('/admin/summary'),
        apiRequest('/admin/products?limit=100'),
        apiRequest('/admin/categories'),
        apiRequest('/admin/orders'),
        apiRequest('/admin/reviews'),
      ])
      setData({
        summary: summary.summary,
        products: products.products,
        categories: categories.categories,
        orders: orders.orders,
        reviews: reviews.reviews,
      })
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [apiRequest, user])

  useEffect(() => {
    const timer = window.setTimeout(loadData, 0)
    return () => window.clearTimeout(timer)
  }, [loadData])

  if (!user || user.role !== 'admin') return <Navigate to="/account" replace />

  const completeAction = async (message) => {
    setModal(null)
    setNotice(message)
    await loadData()
  }

  const remove = async (type, item) => {
    if (!window.confirm(`Archive "${item.name}"? It will no longer appear in the store.`)) return
    try {
      await apiRequest(`/admin/${type}/${item._id}`, { method: 'DELETE' })
      await completeAction(`${type === 'products' ? 'Product' : 'Category'} archived`)
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const updateOrder = async (id, updates) => {
    try {
      await apiRequest(`/admin/orders/${id}`, { method: 'PATCH', body: JSON.stringify(updates) })
      await completeAction('Order updated')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  const moderateReview = async (review, status) => {
    const action = status === 'APPROVED' ? 'Approve' : 'Reject'
    if (!window.confirm(`${action} this review for ${review.product?.name || 'this product'}?`)) return
    try {
      await apiRequest(`/admin/reviews/${review._id}`, { method: 'PATCH', body: JSON.stringify({ status }) })
      await completeAction(status === 'APPROVED' ? 'Review approved and published' : 'Review rejected')
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <main className="min-h-screen bg-[#f4f1ec] lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="border-b border-cocoa/10 bg-cocoa text-white lg:sticky lg:top-0 lg:h-screen lg:border-b-0">
        <div className="flex items-center justify-between p-5 lg:block lg:p-7">
          <Link to="/" className="flex items-center gap-3">
            <img src="/logo.png" alt="BYNEMSTOYS" className="h-11 w-11 rounded-full" />
            <div><strong className="block font-display">BYNEMSTOYS</strong><span className="text-xs text-white/50">Admin console</span></div>
          </Link>
          <Link to="/" className="icon-button text-white lg:hidden" aria-label="Open storefront"><ExternalLink /></Link>
        </div>
        <nav className="flex gap-2 overflow-x-auto px-4 pb-4 lg:flex-col lg:px-5">
          {sections.map(([id, label, Icon]) => (
            <button key={id} onClick={() => setSection(id)} className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition lg:w-full ${section === id ? 'bg-white text-cocoa' : 'text-white/65 hover:bg-white/10 hover:text-white'}`}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
        <div className="hidden px-5 lg:absolute lg:inset-x-0 lg:bottom-6 lg:block">
          <Link to="/" className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white/65 hover:bg-white/10 hover:text-white"><ExternalLink size={18} /> View storefront</Link>
          <button onClick={() => { localStorage.removeItem('bynems-token'); setUser(null) }} className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold text-white/65 hover:bg-white/10 hover:text-white"><LogOut size={18} /> Logout</button>
        </div>
      </aside>

      <section className="min-w-0 p-4 sm:p-7 lg:p-10">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="eyebrow">ADMINISTRATION</p><h1 className="font-display text-3xl font-bold capitalize sm:text-4xl">{section}</h1><p className="mt-1 text-sm text-cocoa/50">Welcome back, {user.name}</p></div>
          {section === 'products' && <button className="button-primary" onClick={() => setModal({ type: 'product' })}><Plus size={17} /> Add product</button>}
          {section === 'categories' && <button className="button-primary" onClick={() => setModal({ type: 'category' })}><Plus size={17} /> Add category</button>}
        </header>

        {error && <Alert tone="error" message={error} onClose={() => setError('')} />}
        {notice && <Alert tone="success" message={notice} onClose={() => setNotice('')} />}
        {loading && <div className="rounded-3xl bg-white p-12 text-center text-cocoa/50">Loading live store data…</div>}
        {!loading && section === 'dashboard' && <Dashboard summary={data.summary} />}
        {!loading && section === 'products' && <Products products={data.products} onEdit={(item) => setModal({ type: 'product', item })} onDelete={(item) => remove('products', item)} />}
        {!loading && section === 'categories' && <Categories categories={data.categories} onEdit={(item) => setModal({ type: 'category', item })} onDelete={(item) => remove('categories', item)} />}
        {!loading && section === 'orders' && <Orders orders={data.orders} onUpdate={updateOrder} />}
        {!loading && section === 'reviews' && <Reviews reviews={data.reviews} onModerate={moderateReview} />}
      </section>

      {modal?.type === 'product' && <ProductForm item={modal.item} categories={data.categories.filter((category) => category.isActive)} apiRequest={apiRequest} onClose={() => setModal(null)} onSaved={() => completeAction(`Product ${modal.item ? 'updated' : 'created'}`)} />}
      {modal?.type === 'category' && <CategoryForm item={modal.item} apiRequest={apiRequest} onClose={() => setModal(null)} onSaved={() => completeAction(`Category ${modal.item ? 'updated' : 'created'}`)} />}
    </main>
  )
}

function Dashboard({ summary }) {
  const cards = [
    [money(summary?.revenue), 'Revenue', Box],
    [String(summary?.orders || 0), 'Orders', Package],
    [String(summary?.customers || 0), 'Customers', Users],
    [String(summary?.products || 0), 'Active products', ShoppingBag],
    [String(summary?.lowStock || 0), 'Low stock', AlertTriangle],
    [String(summary?.pendingReviews || 0), 'Pending reviews', Star],
  ]
  return <>
    <div className="grid grid-cols-2 gap-4 xl:grid-cols-6">{cards.map(([value, label, Icon]) => <div key={label} className="rounded-2xl bg-white p-5 shadow-sm"><Icon className="mb-5 text-rose" /><strong className="block font-display text-2xl">{value}</strong><span className="text-sm text-cocoa/50">{label}</span></div>)}</div>
    <div className="mt-6 rounded-3xl bg-white p-5 shadow-sm"><h2 className="font-display text-xl font-bold">Recent orders</h2><OrderTable orders={summary?.recentOrders || []} /></div>
  </>
}

function Products({ products, onEdit, onDelete }) {
  const [query, setQuery] = useState('')
  const filtered = products.filter((product) => `${product.name} ${product.sku} ${product.category?.name || ''}`.toLowerCase().includes(query.toLowerCase()))
  return <Panel title={`${products.length} products`} query={query} setQuery={setQuery}>
    <div className="overflow-x-auto"><table className="w-full min-w-[820px] text-left text-sm"><thead><tr className="border-b border-cocoa/10 text-cocoa/45"><th>Product</th><th>Category</th><th>Price</th><th>Variants</th><th>Stock</th><th>Status</th><th /></tr></thead><tbody>{filtered.map((product) => <tr key={product._id} className="border-b border-cocoa/5"><td><div className="flex items-center gap-3"><img src={product.images?.[0]?.url} alt="" className="h-12 w-12 rounded-xl bg-cream object-cover" /><div><strong className="block">{product.name}</strong><span className="text-xs text-cocoa/45">{product.sku}</span></div></div></td><td>{product.category?.name || '—'}</td><td>{money(product.price)}</td><td>{(product.variants || []).length}</td><td>{(product.variants || []).reduce((sum, variant) => sum + Number(variant.stock || 0), 0)}</td><td><Status active={product.isActive} /></td><td><Actions onEdit={() => onEdit(product)} onDelete={() => onDelete(product)} /></td></tr>)}</tbody></table></div>
    {!filtered.length && <Empty text="No products found" />}
  </Panel>
}

function Categories({ categories, onEdit, onDelete }) {
  const [query, setQuery] = useState('')
  const filtered = categories.filter((category) => `${category.name} ${category.description || ''}`.toLowerCase().includes(query.toLowerCase()))
  return <Panel title={`${categories.length} categories`} query={query} setQuery={setQuery}>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{filtered.map((category) => <article key={category._id} className="overflow-hidden rounded-2xl border border-cocoa/10"><img src={category.image?.url} alt={category.name} className="aspect-[3/1] w-full bg-cream object-cover" /><div className="p-5"><div className="flex items-start justify-between gap-3"><div><h3 className="font-display text-lg font-bold">{category.name}</h3><p className="mt-1 text-sm text-cocoa/50">{category.description || 'No description'}</p></div><Status active={category.isActive} /></div><div className="mt-5"><Actions onEdit={() => onEdit(category)} onDelete={() => onDelete(category)} /></div></div></article>)}</div>
    {!filtered.length && <Empty text="No categories found" />}
  </Panel>
}

function Orders({ orders, onUpdate }) {
  const [query, setQuery] = useState('')
  const filtered = orders.filter((order) => `${order.orderId} ${order.user?.name || ''} ${order.shippingAddress?.fullName || ''}`.toLowerCase().includes(query.toLowerCase()))
  return <Panel title={`${orders.length} orders`} query={query} setQuery={setQuery}><OrderTable orders={filtered} editable onUpdate={onUpdate} />{!filtered.length && <Empty text="No orders found" />}</Panel>
}

function reviewTone(status) {
  if (status === 'APPROVED') return 'bg-green-100 text-green-700'
  if (status === 'REJECTED') return 'bg-red-100 text-red-700'
  return 'bg-amber-100 text-amber-800'
}

function Reviews({ reviews, onModerate }) {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('PENDING')
  const filtered = reviews.filter((review) => {
    const matchesStatus = status === 'ALL' || review.status === status
    const haystack = `${review.product?.name || ''} ${review.user?.name || ''} ${review.user?.email || ''} ${review.comment || ''}`.toLowerCase()
    return matchesStatus && haystack.includes(query.toLowerCase())
  })
  return <Panel title={`${reviews.filter((review) => review.status === 'PENDING').length} pending · ${reviews.length} total`} query={query} setQuery={setQuery}>
    <div className="mb-5 flex flex-wrap gap-2">
      {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((value) => (
        <button key={value} type="button" onClick={() => setStatus(value)} className={`rounded-full px-4 py-2 text-xs font-bold ${status === value ? 'bg-cocoa text-white' : 'bg-cream text-cocoa/60'}`}>
          {value === 'ALL' ? 'All' : value.charAt(0) + value.slice(1).toLowerCase()}
        </button>
      ))}
    </div>
    <div className="space-y-4">
      {filtered.map((review) => (
        <article key={review._id} className="rounded-2xl border border-cocoa/10 p-4 sm:p-5">
          <div className="flex flex-col gap-4 sm:flex-row">
            <img src={review.product?.images?.[0]?.url} alt="" className="h-16 w-16 rounded-xl bg-cream object-cover" />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <strong className="block">{review.product?.name || 'Product'}</strong>
                  <span className="text-xs text-cocoa/45">{review.user?.name || 'Customer'}{review.user?.email ? ` · ${review.user.email}` : ''}</span>
                </div>
                <span className={`rounded-full px-2 py-1 text-xs font-bold ${reviewTone(review.status)}`}>{review.status}</span>
              </div>
              <div className="mt-2 flex items-center gap-0.5 text-gold">{[1, 2, 3, 4, 5].map((star) => <Star key={star} size={14} className={star <= review.rating ? 'fill-gold' : 'text-cocoa/20'} />)}</div>
              <p className="mt-3 text-sm leading-6 text-cocoa/70">{review.comment}</p>
              <p className="mt-2 text-xs text-cocoa/40">{review.createdAt ? new Date(review.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}</p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            {review.status !== 'APPROVED' && <button type="button" className="button-primary min-h-10!" onClick={() => onModerate(review, 'APPROVED')}><Check size={16} /> Approve</button>}
            {review.status !== 'REJECTED' && <button type="button" className="button-secondary min-h-10! text-red-700" onClick={() => onModerate(review, 'REJECTED')}><X size={16} /> Reject</button>}
          </div>
        </article>
      ))}
    </div>
    {!filtered.length && <Empty text={status === 'PENDING' ? 'No reviews waiting for approval' : 'No reviews found'} />}
  </Panel>
}

function OrderTable({ orders, editable = false, onUpdate }) {
  return <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead><tr className="border-b border-cocoa/10 text-cocoa/45"><th>Order</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead><tbody>{orders.map((order) => <tr key={order._id} className="border-b border-cocoa/5"><td className="font-bold">{order.orderId}</td><td>{order.user?.name || order.shippingAddress?.fullName || 'Customer'}</td><td>{money(order.totalAmount)}</td><td>{editable ? <select className="select min-h-10! py-2 text-xs" value={order.paymentStatus} onChange={(event) => onUpdate(order._id, { paymentStatus: event.target.value })}>{['PENDING','PAID','FAILED','REFUNDED'].map((status) => <option key={status}>{status}</option>)}</select> : <span className="badge">{order.paymentStatus}</span>}</td><td>{editable ? <select className="select min-h-10! py-2 text-xs" value={order.orderStatus} onChange={(event) => onUpdate(order._id, { orderStatus: event.target.value })}>{['PENDING','PLACED','CONFIRMED','PACKED','SHIPPED','DELIVERED','CANCELLED'].map((status) => <option key={status}>{status}</option>)}</select> : order.orderStatus}</td></tr>)}</tbody></table></div>
}

const COLOR_OPTIONS = ['Brown', 'Cream', 'White', 'Pink', 'Golden', 'Grey', 'Black', 'Red', 'Blue']

function blankVariant(price = '') {
  return { label: '', color: 'Brown', lengthCm: 10, breadthCm: 10, heightCm: 10, weightGrams: 200, stock: 0, price, sku: '', images: [] }
}

function ProductForm({ item, categories, apiRequest, onClose, onSaved }) {
  const [images, setImages] = useState(item?.images || [])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [variants, setVariants] = useState(() => {
    if (item?.variants?.length) return item.variants.map((variant) => ({ ...variant, images: variant.images || [] }))
    if (item?.sizes?.length) {
      return item.sizes.map((size) => ({ ...blankVariant(size.price || item.price), label: size.label, stock: size.stock, sku: size.sku || '' }))
    }
    return [blankVariant(item?.price || '')]
  })

  const updateVariant = (index, field, value) => {
    setVariants((current) => current.map((variant, i) => i === index ? { ...variant, [field]: value } : variant))
  }

  const uploadTo = async (event, apply) => {
    const files = [...event.target.files]
    event.target.value = ''
    if (!files.length) return
    setSaving(true); setError('')
    try {
      const form = new FormData()
      files.forEach((file) => form.append('images', file))
      form.append('folder', 'bynemstoys/products')
      const data = await apiRequest('/admin/uploads', { method: 'POST', body: form })
      apply(data.images)
    } catch (uploadError) { setError(uploadError.message) } finally { setSaving(false) }
  }

  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError('')
    if (!images.length) {
      setError('Upload at least one product image')
      setSaving(false)
      return
    }
    if (!variants.length) {
      setError('Add at least one variant with size, color and weight')
      setSaving(false)
      return
    }
    const fields = Object.fromEntries(new FormData(event.currentTarget))
    if (!String(fields.name || '').trim()) { setError('Enter a product name'); setSaving(false); return }
    if (!String(fields.sku || '').trim()) { setError('Enter a product SKU'); setSaving(false); return }
    if (!fields.category) { setError('Select a category'); setSaving(false); return }
    if (Number(fields.price) < 0 || Number(fields.mrp) < 0) { setError('Price and MRP must be 0 or more'); setSaving(false); return }
    if (!String(fields.description || '').trim() || fields.description.trim().length < 10) {
      setError('Enter a product description of at least 10 characters')
      setSaving(false)
      return
    }
    if (variants.some((variant) => !variant.color || Number(variant.lengthCm) <= 0 || Number(variant.weightGrams) <= 0)) {
      setError('Each variant needs a colour, dimensions and weight')
      setSaving(false)
      return
    }
    const payload = {
      name: fields.name, sku: fields.sku, category: fields.category,
      price: Number(fields.price), mrp: Number(fields.mrp), description: fields.description,
      tags: fields.tags.split(',').map((tag) => tag.trim()).filter(Boolean),
      images,
      variants: variants.map((variant, index) => ({
        ...(variant._id ? { _id: variant._id } : {}),
        label: variant.label || `${variant.lengthCm}×${variant.breadthCm}×${variant.heightCm} cm`,
        color: variant.color,
        lengthCm: Number(variant.lengthCm),
        breadthCm: Number(variant.breadthCm),
        heightCm: Number(variant.heightCm),
        weightGrams: Number(variant.weightGrams),
        stock: Number(variant.stock) || 0,
        price: Number(variant.price || fields.price),
        sku: variant.sku || `${fields.sku}-${String(variant.color || 'C').slice(0, 2).toUpperCase()}-${index + 1}`,
        images: variant.images || [],
      })),
      featured: fields.featured === 'on', bestseller: fields.bestseller === 'on',
      newArrival: fields.newArrival === 'on', isActive: fields.isActive === 'on',
    }
    try {
      await apiRequest(`/admin/products${item ? `/${item._id}` : ''}`, { method: item ? 'PATCH' : 'POST', body: JSON.stringify(payload) })
      await onSaved()
    } catch (requestError) { setError(requestError.message) } finally { setSaving(false) }
  }

  return <Modal title={item ? 'Edit product' : 'Add product'} onClose={onClose}><form onSubmit={submit} className="space-y-5">
    {error && <Alert tone="error" message={error} />}
    <div className="grid gap-4 sm:grid-cols-2"><Field label="Product name"><input className="input" name="name" defaultValue={item?.name} required /></Field><Field label="SKU"><input className="input" name="sku" defaultValue={item?.sku} required /></Field><Field label="Category"><select className="select" name="category" defaultValue={item?.category?._id || ''} required><option value="">Select category</option>{categories.map((category) => <option key={category._id} value={category._id}>{category.name}</option>)}</select></Field><Field label="Tags (comma separated)"><input className="input" name="tags" defaultValue={item?.tags?.join(', ')} /></Field><Field label="Base selling price"><input className="input" name="price" type="number" min="0" defaultValue={item?.price} required /></Field><Field label="MRP"><input className="input" name="mrp" type="number" min="0" defaultValue={item?.mrp} required /></Field></div>
    <Field label="Description"><textarea className="input min-h-28" name="description" defaultValue={item?.description} required /></Field>
    <div>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div><span className="block text-sm font-bold">Product variants</span><p className="text-xs text-cocoa/45">Add different sizes, colours and weights for the same product.</p></div>
        <button type="button" className="button-secondary min-h-10!" onClick={() => setVariants((current) => [...current, blankVariant(current[0]?.price || item?.price || '')])}><Plus size={16} /> Add variant</button>
      </div>
      <div className="space-y-4">
        {variants.map((variant, index) => (
          <div key={variant._id || index} className="rounded-2xl border border-cocoa/10 bg-cream/50 p-4">
            <div className="mb-3 flex items-center justify-between"><strong className="text-sm">Variant {index + 1}</strong>{variants.length > 1 && <button type="button" className="text-xs font-bold text-rose" onClick={() => setVariants((current) => current.filter((_, i) => i !== index))}>Remove</button>}</div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <Field label="Colour"><select className="select" value={COLOR_OPTIONS.includes(variant.color) ? variant.color : 'Custom'} onChange={(event) => updateVariant(index, 'color', event.target.value === 'Custom' ? '' : event.target.value)}>{COLOR_OPTIONS.map((color) => <option key={color}>{color}</option>)}<option>Custom</option></select></Field>
              {!COLOR_OPTIONS.includes(variant.color) && <Field label="Custom colour"><input className="input" value={variant.color} onChange={(event) => updateVariant(index, 'color', event.target.value)} placeholder="e.g. Lavender" required /></Field>}
              <Field label="Length (cm)"><input className="input" type="number" min="0.1" step="0.1" value={variant.lengthCm} onChange={(event) => updateVariant(index, 'lengthCm', event.target.value)} required /></Field>
              <Field label="Breadth (cm)"><input className="input" type="number" min="0.1" step="0.1" value={variant.breadthCm} onChange={(event) => updateVariant(index, 'breadthCm', event.target.value)} required /></Field>
              <Field label="Height (cm)"><input className="input" type="number" min="0.1" step="0.1" value={variant.heightCm} onChange={(event) => updateVariant(index, 'heightCm', event.target.value)} required /></Field>
              <Field label="Weight (grams)"><input className="input" type="number" min="1" value={variant.weightGrams} onChange={(event) => updateVariant(index, 'weightGrams', event.target.value)} required /></Field>
              <Field label="Stock"><input className="input" type="number" min="0" value={variant.stock} onChange={(event) => updateVariant(index, 'stock', event.target.value)} required /></Field>
              <Field label="Variant price"><input className="input" type="number" min="0" value={variant.price} onChange={(event) => updateVariant(index, 'price', event.target.value)} required /></Field>
              <Field label="Variant SKU"><input className="input" value={variant.sku} onChange={(event) => updateVariant(index, 'sku', event.target.value)} placeholder="Auto from product SKU" /></Field>
              <Field label="Size label"><input className="input" value={variant.label} onChange={(event) => updateVariant(index, 'label', event.target.value)} placeholder="Auto from L×B×H" /></Field>
            </div>
            <div className="mt-4">
              <span className="mb-2 block text-sm font-bold">Variant images</span>
              <p className="mb-2 text-xs text-cocoa/45">These photos are shown when this colour and size is selected.</p>
              <ImageList images={variant.images || []} onRemove={(image) => updateVariant(index, 'images', (variant.images || []).filter((entry) => entry !== image))} onUpload={(event) => uploadTo(event, (uploaded) => updateVariant(index, 'images', [...(variant.images || []), ...uploaded]))} />
            </div>
          </div>
        ))}
      </div>
    </div>
    <div>
      <span className="mb-2 block text-sm font-bold">Product images</span>
      <p className="mb-2 text-xs text-cocoa/45">Shared photos for the whole product. These stay visible along with the selected variant photos.</p>
      <ImageList images={images} onRemove={(image) => setImages((current) => current.filter((entry) => entry !== image))} onUpload={(event) => uploadTo(event, (uploaded) => setImages((current) => [...current, ...uploaded]))} />
    </div>
    <div className="flex flex-wrap gap-5">{[['featured','Featured'],['bestseller','Bestseller'],['newArrival','New arrival'],['isActive','Active']].map(([name,label]) => <label key={name} className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name={name} defaultChecked={name === 'isActive' ? item?.isActive !== false : item?.[name]} /> {label}</label>)}</div>
    <FormActions saving={saving} onClose={onClose} />
  </form></Modal>
}

function CategoryForm({ item, apiRequest, onClose, onSaved }) {
  const [image, setImage] = useState(item?.image || null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const upload = async (event) => {
    if (!event.target.files[0]) return
    setSaving(true); setError('')
    try {
      const form = new FormData()
      form.append('images', event.target.files[0])
      form.append('folder', 'bynemstoys/categories')
      const data = await apiRequest('/admin/uploads', { method: 'POST', body: form })
      setImage(data.images[0])
    } catch (uploadError) { setError(uploadError.message) } finally { setSaving(false) }
  }
  const submit = async (event) => {
    event.preventDefault(); setSaving(true); setError('')
    if (!image) {
      setError('Upload a category image')
      setSaving(false)
      return
    }
    const fields = Object.fromEntries(new FormData(event.currentTarget))
    if (!String(fields.name || '').trim() || fields.name.trim().length < 2) {
      setError('Enter a category name')
      setSaving(false)
      return
    }
    const payload = { name: fields.name, description: fields.description, sortOrder: Number(fields.sortOrder) || 0, image, isActive: fields.isActive === 'on' }
    try {
      await apiRequest(`/admin/categories${item ? `/${item._id}` : ''}`, { method: item ? 'PATCH' : 'POST', body: JSON.stringify(payload) })
      await onSaved()
    } catch (requestError) { setError(requestError.message) } finally { setSaving(false) }
  }
  return <Modal title={item ? 'Edit category' : 'Add category'} onClose={onClose}><form onSubmit={submit} className="space-y-5">{error && <Alert tone="error" message={error} />}<Field label="Category name"><input className="input" name="name" defaultValue={item?.name} required /></Field><Field label="Description"><textarea className="input min-h-24" name="description" defaultValue={item?.description} /></Field><Field label="Display order"><input className="input" name="sortOrder" type="number" min="0" defaultValue={item?.sortOrder || 0} /></Field><div><span className="mb-2 block text-sm font-bold">Category image</span>{image ? <div className="relative w-fit"><img src={image.url} alt="" className="h-28 w-44 rounded-xl object-cover" /><button type="button" onClick={() => setImage(null)} className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full bg-cocoa text-white"><X size={14} /></button></div> : <label className="flex h-28 w-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-cocoa/20 bg-cream text-sm font-bold text-cocoa/50"><Upload size={20} /> Upload image<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={upload} /></label>}</div><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" name="isActive" defaultChecked={item?.isActive !== false} /> Active</label><FormActions saving={saving} onClose={onClose} /></form></Modal>
}

function Modal({ title, onClose, children }) {
  return <div className="fixed inset-0 z-50 overflow-y-auto bg-cocoa/50 p-3 backdrop-blur-sm sm:p-8" onMouseDown={onClose}><div className="mx-auto max-w-5xl rounded-3xl bg-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()}><div className="flex items-center justify-between border-b border-cocoa/10 p-5 sm:px-7"><h2 className="font-display text-2xl font-bold">{title}</h2><button className="icon-button" onClick={onClose}><X /></button></div><div className="p-5 sm:p-7">{children}</div></div></div>
}

function Panel({ title, query, setQuery, children }) {
  return <div className="rounded-3xl bg-white p-5 shadow-sm"><div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><h2 className="font-display text-xl font-bold">{title}</h2><div className="flex items-center rounded-full bg-cream px-3"><Search size={16} /><input value={query} onChange={(event) => setQuery(event.target.value)} className="bg-transparent py-2 pl-2 outline-none" placeholder="Search" /></div></div>{children}</div>
}

function ImageList({ images, onRemove, onUpload }) {
  return <div className="flex flex-wrap gap-3">{images.map((image) => <div key={image.publicId || image.url} className="group relative"><img src={image.url} alt="" className="h-20 w-20 rounded-xl object-cover" /><button type="button" onClick={() => onRemove(image)} className="absolute -right-2 -top-2 grid h-6 w-6 place-items-center rounded-full bg-cocoa text-white"><X size={13} /></button></div>)}<label className="grid h-20 w-20 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-cocoa/20 bg-cream text-cocoa/50"><Upload size={20} /><input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={onUpload} /></label></div>
}
function Field({ label, children }) { return <label className="block"><span className="mb-1.5 block text-sm font-bold">{label}</span>{children}</label> }
function Status({ active }) { return <span className={`rounded-full px-2 py-1 text-xs font-bold ${active ? 'bg-green-100 text-green-700' : 'bg-cocoa/10 text-cocoa/50'}`}>{active ? 'Active' : 'Archived'}</span> }
function Empty({ text }) { return <p className="py-12 text-center text-sm text-cocoa/50">{text}</p> }
function Actions({ onEdit, onDelete }) { return <div className="flex justify-end gap-1"><button onClick={onEdit} className="icon-button" title="Edit"><Edit3 size={16} /></button><button onClick={onDelete} className="icon-button text-red-600" title="Archive"><Trash2 size={16} /></button></div> }
function FormActions({ saving, onClose }) { return <div className="flex justify-end gap-3 border-t border-cocoa/10 pt-5"><button type="button" className="button-secondary" onClick={onClose}>Cancel</button><button disabled={saving} className="button-primary">{saving ? 'Saving…' : 'Save'}</button></div> }
function Alert({ tone, message, onClose }) { return <div className={`mb-5 flex items-center justify-between rounded-xl p-4 text-sm font-semibold ${tone === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}><span>{message}</span>{onClose && <button onClick={onClose}><X size={16} /></button>}</div> }

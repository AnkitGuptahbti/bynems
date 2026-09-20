import { createContext, useContext, useEffect, useMemo, useState } from 'react'

const ShopContext = createContext(null)

function resolveApiUrl() {
  const raw = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/$/, '')
  return raw.endsWith('/api') ? raw : `${raw}/api`
}

const API_URL = resolveApiUrl()

async function apiRequest(path, options = {}) {
  const token = localStorage.getItem('bynems-token')
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      ...(options.body && !(options.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await response.json().catch(() => ({}))
  if (!response.ok) throw new Error(data.message || 'Something went wrong')
  return data
}

function readStored(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback
  } catch {
    return fallback
  }
}

function variantLabel(variant) {
  if (variant.label) return variant.label
  if (variant.lengthCm && variant.breadthCm && variant.heightCm) {
    return `${variant.lengthCm}×${variant.breadthCm}×${variant.heightCm} cm`
  }
  return 'Standard'
}

function normalizeProduct(product) {
  const category = product.category
  const variants = (product.variants || product.sizes || []).map((variant) => ({
    ...variant,
    label: variantLabel(variant),
  }))
  const first = variants[0]
  return {
    ...product,
    category: category?.slug || category,
    categoryName: category?.name,
    variants,
    colors: [...new Set(variants.map((variant) => variant.color).filter(Boolean))],
    sizes: variants.map((variant) => variant.label),
    size: first?.label,
    defaultVariantId: first?._id,
    isNew: product.newArrival,
  }
}

function findCartVariant(product, variantId) {
  return (product?.variants || []).find((variant) => String(variant._id) === String(variantId)) || product?.variants?.[0]
}

export function ShopProvider({ children }) {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [catalogLoading, setCatalogLoading] = useState(true)
  const [catalogError, setCatalogError] = useState('')
  const [cart, setCart] = useState(() => readStored('bynems-cart', []))
  const [wishlist, setWishlist] = useState(() => readStored('bynems-wishlist', []))
  const [user, setUser] = useState(() => readStored('bynems-user', null))
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/products?limit=50`),
      fetch(`${API_URL}/categories`),
    ])
      .then(async ([productResponse, categoryResponse]) => {
        if (!productResponse.ok || !categoryResponse.ok) throw new Error('Unable to load the catalogue')
        return Promise.all([productResponse.json(), categoryResponse.json()])
      })
      .then(([productPayload, categoryPayload]) => {
        const liveProducts = (productPayload.items || []).map(normalizeProduct)
        setProducts(liveProducts)
        setCategories(categoryPayload.categories || [])
        setCart((current) => current.map((item) => {
          const product = liveProducts.find((entry) => entry._id === item.product?._id)
          if (!product) return null
          const variant = product.variants.find((entry) => String(entry._id) === String(item.variantId))
            || product.variants.find((entry) => entry.label === item.size)
            || product.variants[0]
          if (!variant) return null
          return { ...item, product, variantId: variant._id, variant, size: variant.label, color: variant.color }
        }).filter(Boolean))
      })
      .catch((error) => setCatalogError(error.message))
      .finally(() => setCatalogLoading(false))
  }, [])

  useEffect(() => {
    if (!localStorage.getItem('bynems-token')) return
    apiRequest('/auth/me').then((data) => setUser(data.user)).catch(() => {
      localStorage.removeItem('bynems-token')
      setUser(null)
    })
  }, [])

  useEffect(() => localStorage.setItem('bynems-cart', JSON.stringify(cart)), [cart])
  useEffect(() => localStorage.setItem('bynems-wishlist', JSON.stringify(wishlist)), [wishlist])
  useEffect(() => localStorage.setItem('bynems-user', JSON.stringify(user)), [user])

  const addToCart = (product, variantId = product.defaultVariantId, quantity = 1) => {
    const variant = findCartVariant(product, variantId)
    if (!variant) return
    setCart((current) => {
      const found = current.find((item) => (item.product.id || item.product._id) === (product.id || product._id) && String(item.variantId) === String(variant._id))
      if (found) return current.map((item) => item === found ? { ...item, quantity: item.quantity + quantity } : item)
      return [...current, { product, variantId: variant._id, variant, size: variant.label, color: variant.color, quantity }]
    })
    const productId = product._id
    if (productId && variant._id && localStorage.getItem('bynems-token')) {
      apiRequest('/cart/items', { method: 'POST', body: JSON.stringify({ productId, variantId: variant._id, quantity }) }).catch(() => {})
    }
    setCartOpen(true)
  }

  const updateQuantity = (id, variantId, quantity) => {
    if (quantity < 1) return
    setCart((current) => current.map((item) => ((item.product.id || item.product._id) === id && String(item.variantId) === String(variantId)) ? { ...item, quantity } : item))
  }

  const removeFromCart = (id, variantId) => setCart((current) => current.filter((item) => (item.product.id || item.product._id) !== id || String(item.variantId) !== String(variantId)))
  const toggleWishlist = (id) => setWishlist((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = cart.reduce((sum, item) => {
    const variant = item.variant || findCartVariant(item.product, item.variantId)
    return sum + Number(variant?.price ?? item.product.price) * item.quantity
  }, 0)

  const value = useMemo(() => ({
    products, categories, catalogLoading, catalogError, cart, wishlist, user, setUser, cartOpen, setCartOpen, addToCart,
    updateQuantity, removeFromCart, toggleWishlist, cartCount, subtotal, apiUrl: API_URL, apiRequest,
  }), [products, categories, catalogLoading, catalogError, cart, wishlist, user, cartOpen, cartCount, subtotal])

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>
}

export function useShop() {
  const context = useContext(ShopContext)
  if (!context) throw new Error('useShop must be used inside ShopProvider')
  return context
}

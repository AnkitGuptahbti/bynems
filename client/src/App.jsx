import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { Header, Footer } from './components/store'
import { ShopProvider } from './context/ShopContext'
import Home from './pages/Home'
import { Cart, Checkout, OrderSuccess, ProductDetails, Shop, TrackOrder, Wishlist } from './pages/Commerce'
import { Account, VerifyEmail } from './pages/Account'
import { Addresses, MyOrders } from './pages/AccountDetails'
import { Admin } from './pages/Admin'
import {
  AboutUs, ContactUs, FAQs, PrivacyPolicy, RefundPolicy, ReturnsPolicy,
  ShippingPolicy, TermsAndConditions,
} from './pages/InfoPages'

function ScrollToTop() {
  const { pathname, search, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      const target = document.getElementById(hash.slice(1))
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' })
        return
      }
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname, search, hash])
  return null
}

function StoreRoutes() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  return <>
    <ScrollToTop />
    {!isAdmin && <Header />}
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/shop" element={<Shop />} />
      <Route path="/products/:slug" element={<ProductDetails />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/wishlist" element={<Wishlist />} />
      <Route path="/track-order" element={<TrackOrder />} />
      <Route path="/order-success" element={<OrderSuccess />} />
      <Route path="/account" element={<Account />} />
      <Route path="/account/orders" element={<MyOrders />} />
      <Route path="/account/addresses" element={<Addresses />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/shipping" element={<ShippingPolicy />} />
      <Route path="/returns" element={<ReturnsPolicy />} />
      <Route path="/faqs" element={<FAQs />} />
      <Route path="/about" element={<AboutUs />} />
      <Route path="/privacy" element={<PrivacyPolicy />} />
      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/refund-policy" element={<RefundPolicy />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="*" element={<Home />} />
    </Routes>
    {!isAdmin && <Footer />}
  </>
}

export default function App() {
  return <BrowserRouter><ShopProvider><StoreRoutes /></ShopProvider></BrowserRouter>
}

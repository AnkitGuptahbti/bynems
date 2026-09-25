import { useEffect, useRef, useState } from 'react'
import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { Heart, LogOut, MapPin, ShoppingBag } from 'lucide-react'
import { useShop } from '../context/ShopContext'
import { FieldError } from '../components/store'
import { AUTH_RULES, validateFields } from '../lib/validation'

export function Account() {
  const { user, setUser, apiUrl } = useShop()
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})

  const acceptAuth = (data) => {
    localStorage.setItem('bynems-token', data.token)
    setUser(data.user)
  }

  const submit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')
    const payload = Object.fromEntries(new FormData(event.currentTarget))
    const rules = mode === 'register' ? AUTH_RULES : { email: AUTH_RULES.email, password: AUTH_RULES.password }
    const nextErrors = validateFields(payload, rules)
    if (Object.keys(nextErrors).length) {
      setFieldErrors(nextErrors)
      setLoading(false)
      return
    }
    setFieldErrors({})
    try {
      const response = await fetch(`${apiUrl}/auth/${mode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to continue')
      if (mode === 'register') {
        setMessage(data.message)
        setMode('login')
      } else {
        acceptAuth(data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const googleLogin = async (credential) => {
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch(`${apiUrl}/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Google sign-in failed')
      acceptAuth(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resendVerification = async () => {
    if (!email) {
      setError('Enter your email address first')
      return
    }
    setLoading(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch(`${apiUrl}/auth/resend-verification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to resend verification email')
      setMessage(data.message)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (user?.role === 'admin') return <Navigate to="/admin" replace />

  if (user) {
    return (
      <main className="page-width py-12">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <p className="eyebrow">MY ACCOUNT</p>
            <h1 className="font-display text-4xl font-bold">Hello, {user.name?.split(' ')[0] || 'Friend'}!</h1>
          </div>
          <button className="button-secondary" onClick={() => { localStorage.removeItem('bynems-token'); setUser(null) }}>
            <LogOut size={17} /> Logout
          </button>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          <DashboardTile icon={ShoppingBag} title="My orders" text="View and track your purchases" link="/account/orders" />
          <DashboardTile icon={MapPin} title="Addresses" text="Manage delivery addresses" link="/account/addresses" />
          <DashboardTile icon={Heart} title="Wishlist" text="See your saved companions" link="/wishlist" />
        </div>
      </main>
    )
  }

  return (
    <main className="page-width grid min-h-[70vh] place-items-center py-12">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-sm">
        <div className="text-center">
          <img src="/logo.png" alt="BYNEMSTOYS" className="mx-auto h-16 w-16 rounded-full" />
          <h1 className="mt-4 font-display text-3xl font-bold">{mode === 'login' ? 'Welcome back' : 'Join our world of cute'}</h1>
          <p className="mt-2 text-sm text-cocoa/50">{mode === 'login' ? 'Your favourites are waiting.' : 'Save favourites and track every cuddle.'}</p>
        </div>
        <div className="mt-7 flex justify-center">
          <GoogleSignIn onCredential={googleLogin} />
        </div>
        <div className="my-5 flex items-center gap-3 text-xs text-cocoa/40">
          <span className="h-px flex-1 bg-cocoa/10" />
          OR
          <span className="h-px flex-1 bg-cocoa/10" />
        </div>
        <form className="space-y-4" onSubmit={submit} noValidate>
          {mode === 'register' && <div><input className={`input ${fieldErrors.name ? 'input-error' : ''}`} name="name" placeholder="Full name" /><FieldError message={fieldErrors.name} /></div>}
          <div><input className={`input ${fieldErrors.email ? 'input-error' : ''}`} name="email" type="email" placeholder="Email address" value={email} onChange={(event) => setEmail(event.target.value)} /><FieldError message={fieldErrors.email} /></div>
          {mode === 'register' && <div><input className={`input ${fieldErrors.phone ? 'input-error' : ''}`} name="phone" inputMode="numeric" maxLength="10" placeholder="Phone number" /><FieldError message={fieldErrors.phone} /></div>}
          <div><input className={`input ${fieldErrors.password ? 'input-error' : ''}`} name="password" type="password" placeholder="Password" /><FieldError message={fieldErrors.password} /></div>
          {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          {message && <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">{message}</p>}
          <button disabled={loading} className="button-primary w-full">{loading ? 'Please wait…' : mode === 'login' ? 'Login' : 'Create account'}</button>
        </form>
        {mode === 'login' && (
          <button disabled={loading} onClick={resendVerification} className="mt-4 w-full text-center text-sm font-bold underline">
            Resend verification email
          </button>
        )}
        <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); setMessage(''); setFieldErrors({}) }} className="mt-4 w-full text-center text-sm font-bold underline">
          {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Login'}
        </button>
      </div>
    </main>
  )
}

function GoogleSignIn({ onCredential }) {
  const containerRef = useRef(null)
  const callbackRef = useRef(onCredential)
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID

  useEffect(() => {
    callbackRef.current = onCredential
  }, [onCredential])

  useEffect(() => {
    if (!clientId) return undefined
    const renderButton = () => {
      if (!window.google || !containerRef.current) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: ({ credential }) => callbackRef.current(credential),
      })
      containerRef.current.replaceChildren()
      window.google.accounts.id.renderButton(containerRef.current, {
        theme: 'outline',
        size: 'large',
        shape: 'pill',
        width: 320,
        text: 'continue_with',
      })
    }

    let script = document.getElementById('google-identity-services')
    if (!script) {
      script = document.createElement('script')
      script.id = 'google-identity-services'
      script.src = 'https://accounts.google.com/gsi/client'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }
    if (window.google) renderButton()
    else script.addEventListener('load', renderButton)
    return () => script.removeEventListener('load', renderButton)
  }, [clientId])

  if (!clientId) return null
  return <div ref={containerRef} aria-label="Continue with Google" />
}

export function VerifyEmail() {
  const { apiUrl } = useShop()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [status, setStatus] = useState(token ? 'Verifying your email…' : 'Verification link is missing its token.')
  const [failed, setFailed] = useState(!token)
  const started = useRef(false)

  useEffect(() => {
    if (started.current || !token) return
    started.current = true
    fetch(`${apiUrl}/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })
      .then(async (response) => {
        const data = await response.json()
        if (!response.ok) throw new Error(data.message || 'Verification failed')
        setStatus(data.message)
      })
      .catch((error) => {
        setFailed(true)
        setStatus(error.message)
      })
  }, [apiUrl, token])

  return (
    <main className="page-width grid min-h-[65vh] place-items-center py-12">
      <div className="w-full max-w-md rounded-[2rem] bg-white p-8 text-center shadow-sm">
        <img src="/logo.png" alt="BYNEMSTOYS" className="mx-auto h-16 w-16 rounded-full" />
        <h1 className="mt-5 font-display text-3xl font-bold">{failed ? 'Could not verify email' : 'Email verification'}</h1>
        <p className={`mt-3 text-sm ${failed ? 'text-red-700' : 'text-cocoa/60'}`}>{status}</p>
        <Link to="/account" className="button-primary mt-6 inline-flex">Go to login</Link>
      </div>
    </main>
  )
}

function DashboardTile({ icon: Icon, title, text, link = '#' }) {
  return <Link to={link} className="rounded-3xl bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg"><Icon className="mb-5 text-rose" /><h2 className="font-display text-xl font-bold">{title}</h2><p className="mt-1 text-sm text-cocoa/50">{text}</p></Link>
}

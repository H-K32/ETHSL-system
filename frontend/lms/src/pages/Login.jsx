// src/pages/Login.jsx
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/login.css'

export default function Login() {
  const { login } = useAuth()
  const nav = useNavigate()
  const loc = useLocation()
  const [form, setForm] = useState({ username: '', password: '' })
  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    setErr(null); setLoading(true)
    try {
      const data = await login(form)
      // Route based on profile completion state
      const dest = loc.state?.from?.pathname
      if (dest && dest !== '/login') {
        nav(dest, { replace: true })
      } else if (!data?.profile_completed) {
        nav('/complete-profile', { replace: true })
      } else {
        nav('/dashboard', { replace: true })
      }
    } catch (e) {
      const detail = e?.response?.data?.detail || ''
      if (detail === 'email_not_verified' || detail.toLowerCase().includes('no active account')) {
        setErr('Account not verified. Please check your email and click the verification link.')
      } else {
        setErr(detail || 'Invalid credentials')
      }
    } finally { setLoading(false) }
  }

  return (
    <div className="lp-stage">
      {/* organic background shapes */}
      <span className="lp-blob lp-blob--a" />
      <span className="lp-blob lp-blob--b" />
      <span className="lp-blob lp-blob--c" />
      <span className="lp-grid" />

      <div className="lp-card">
        <div className="lp-tag">
          <span className="lp-dot" />
          <span>secure entry</span>
        </div>

        <h1 className="lp-title">
          Hello again<span className="lp-period">.</span>
        </h1>
        <p className="lp-sub">Sign in to keep climbing.</p>

        <form onSubmit={onSubmit} className="lp-form">
          <div className="lp-field">
            <input
              id="lp-user"
              className="lp-input"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              placeholder=" "
              required
            />
            <label htmlFor="lp-user">Username or Email</label>
          </div>

          <div className="lp-field">
            <input
              id="lp-pass"
              type="password"
              className="lp-input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              placeholder=" "
              required
            />
            <label htmlFor="lp-pass">Password</label>
            
          </div>

          {err && <p className="lp-error">{err}</p>}

          <button disabled={loading} className="lp-btn">
            <span>{loading ? 'Signing in…' : 'Sign in'}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="lp-foot-row">
  <span className="lp-foot-line" />
  <Link to="/forgot-password" className="lp-forgot">
  Forgot password?
</Link>
  <span className="lp-foot-line" />
</div>


          <p className="lp-foot">
            New here? <Link to="/register" className="lp-link">Create an account</Link>
          </p> 
          
        </form>
      </div>
    </div>
  )
}

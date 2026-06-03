// src/pages/Login.jsx
import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useLanguage } from '../context/LanguageContext.jsx'
import '../styles/login.css'

export default function Login() {
  const { login } = useAuth()
  const { t, toggleLanguage, lang } = useLanguage()
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
      if (detail === 'account_inactive') {
        setErr('inactive')
      } else {
        setErr(t('invalidCredentials'))
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

      {/* Language Toggle */}
      <button 
        onClick={toggleLanguage}
        className="language-toggle"
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '8px 16px',
          background: 'rgba(255, 255, 255, 0.9)',
          border: '1px solid #e0e0e0',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: 'bold',
          fontSize: '14px',
          zIndex: 100
        }}
      >
        {lang === 'en' ? 'አማርኛ' : 'English'}
      </button>

      <div className="lp-card">
        <div className="lp-tag">
          <span className="lp-dot" />
          <span>ETHSL</span>
        </div>

        <h1 className="lp-title">
          {t('helloAgain')}<span className="lp-period">.</span>
        </h1>
        <p className="lp-sub">{t('signInToKeepClimbing')}</p>

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
            <label htmlFor="lp-user">{t('usernameOrEmail')}</label>
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
            <label htmlFor="lp-pass">{t('password')}</label>
            
          </div>

          {err === 'inactive' ? (
            <p className="lp-error">
              {t('noActiveAccount')} {' '}
              <a href="/#contact" className="lp-link">{t('contactUs')}</a>{' '}{t('forAssistance')}
            </p>
          ) : err ? (
            <p className="lp-error">{err}</p>
          ) : null}

          <button disabled={loading} className="lp-btn">
            <span>{loading ? t('signingIn') : t('signIn')}</span>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M13 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="lp-foot-row">
  <span className="lp-foot-line" />
  <Link to="/forgot-password" className="lp-forgot">
    {t('forgotPassword')}
</Link>
  <span className="lp-foot-line" />
</div>


          <p className="lp-foot">
            {t('newHere')} <Link to="/register" className="lp-link">{t('createAccount')}</Link>
          </p> 
          
        </form>
      </div>
    </div>
  )
}

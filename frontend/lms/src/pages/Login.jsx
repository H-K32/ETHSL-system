import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

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
      await login(form)
      const dest = loc.state?.from?.pathname || '/levels'
      nav(dest, { replace: true })
    } catch (e) {
      setErr(e?.response?.data?.detail || 'Invalid credentials')
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Welcome back</h1>
      <p className="text-sm text-slate-500 mt-1">Login to continue your learning.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4 bg-white p-6 rounded-xl border border-slate-200">
        <Field label="Username or Email">
          <input
            className="input"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </Field>
        <Field label="Password">
          <input
            type="password"
            className="input"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            required
          />
        </Field>
        {err && <p className="text-sm text-red-600">{err}</p>}
        <button disabled={loading} className="btn-primary w-full">
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
        <p className="text-sm text-slate-500 text-center">
          New here? <Link to="/register" className="text-brand-600 hover:underline">Create an account</Link>
        </p>
      </form>
      <Style />
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <div className="mt-1">{children}</div>
    </label>
  )
}

function Style() {
  return (
    <style>{`
      .input{width:100%;padding:.6rem .75rem;border:1px solid #e2e8f0;border-radius:.5rem;outline:none}
      .input:focus{border-color:#3b6ef7;box-shadow:0 0 0 3px rgba(59,110,247,.15)}
      .btn-primary{background:#2f5be0;color:#fff;padding:.6rem .9rem;border-radius:.5rem;font-weight:500}
      .btn-primary:hover{background:#2548b8}
      .btn-primary:disabled{opacity:.6}
    `}</style>
  )
}

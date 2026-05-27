import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/register.css'

export default function Register() {
  const { register } = useAuth()
  const nav = useNavigate()

  const [form, setForm] = useState({
    username: '',
    email: '',
    password: '',
    password2: '',
    full_name: '',
    gender: ''
  })

  const [err, setErr] = useState(null)
  const [loading, setLoading] = useState(false)

  // 👀 toggle password visibility
  const [showPassword, setShowPassword] = useState(false)

  // ---------------- PASSWORD LOGIC ----------------
  const validatePassword = (password) => {
    const minLength = password.length >= 8
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /\d/.test(password)
    return { minLength, hasUpper, hasLower, hasNumber }
  }

  const passwordChecks = validatePassword(form.password)

  const strengthScore =
    Object.values(passwordChecks).filter(Boolean).length

  const strengthLabel =
    strengthScore <= 1
      ? 'Weak'
      : strengthScore === 2
      ? 'Fair'
      : strengthScore === 3
      ? 'Good'
      : 'Strong'

  const isPasswordValid =
    strengthScore === 4

  const canSubmit =
    form.username &&
    form.email &&
    form.gender &&
    form.password === form.password2 &&
    isPasswordValid &&
    !loading

  // ---------------- SUBMIT ----------------
  const onSubmit = async (e) => {
    e.preventDefault()
    setErr(null)

    if (!isPasswordValid) {
      return setErr(
        'Password must be 8+ chars with uppercase, lowercase, and number'
      )
    }

    if (form.password !== form.password2) {
      return setErr('Passwords do not match')
    }

    if (!form.gender) {
      return setErr('Please select gender')
    }

    setLoading(true)

    try {
      await register(form)
      nav('/check-email')
    } catch (e) {
      const data = e?.response?.data
      setErr(
        typeof data === 'string'
          ? data
          : data?.detail || JSON.stringify(data || {}) || 'Could not register'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-slate-900">Create your account</h1>
      <p className="text-sm text-slate-500 mt-1">
        Start with a quick placement test.
      </p>

      <form
        onSubmit={onSubmit}
        className="mt-6 space-y-4 bg-white p-6 rounded-xl border border-slate-200"
      >

        {/* Username */}
        <Field label="Username">
          <input
            className="input"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            required
          />
        </Field>

        {/* Full name */}
        <Field label="Full Name">
          <input
            className="input"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />
        </Field>

        {/* Email */}
        <Field label="Email">
          <input
            type="email"
            className="input"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
        </Field>

        {/* Gender */}
        <Field label="Gender">
          <select
            className="input"
            value={form.gender}
            onChange={(e) => setForm({ ...form, gender: e.target.value })}
            required
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </Field>

<Field label="Password">
  <div className="relative">
    <input
      type={showPassword ? 'text' : 'password'}
      className="input"
      value={form.password}
      onChange={(e) =>
        setForm({ ...form, password: e.target.value })
      }
      required
    />

    {/* toggle */}
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute right-2 top-2 text-xs text-gray-500"
    >
      {showPassword ? 'Hide 👁' : 'Show 👁'}
    </button>
  </div>

  {/* 🔐 PASSWORD RULES (NEW) */}
  <div className="mt-2 space-y-1 text-xs">
    
    {/* length */}
    <p className={passwordChecks.minLength ? "text-green-600" : "text-red-500"}>
      {passwordChecks.minLength ? "✔" : "✖"} At least 8 characters
    </p>

    {/* uppercase */}
    <p className={passwordChecks.hasUpper ? "text-green-600" : "text-red-500"}>
      {passwordChecks.hasUpper ? "✔" : "✖"} At least 1 uppercase letter
    </p>

    {/* lowercase */}
    <p className={passwordChecks.hasLower ? "text-green-600" : "text-red-500"}>
      {passwordChecks.hasLower ? "✔" : "✖"} At least 1 lowercase letter
    </p>

    {/* number */}
    <p className={passwordChecks.hasNumber ? "text-green-600" : "text-red-500"}>
      {passwordChecks.hasNumber ? "✔" : "✖"} At least 1 number
    </p>
  </div>

  {/* strength bar */}
  <div className="h-2 bg-gray-200 rounded mt-2">
    <div
      className={`h-2 rounded transition-all ${
        strengthScore <= 1
          ? 'bg-red-500 w-1/4'
          : strengthScore === 2
          ? 'bg-yellow-500 w-2/4'
          : strengthScore === 3
          ? 'bg-blue-500 w-3/4'
          : 'bg-green-500 w-full'
      }`}
    />
  </div>

  <p className="text-xs mt-1 text-gray-500">
    Strength: {strengthLabel}
  </p>
</Field>

        {/* Confirm password */}
        <Field label="Confirm Password">
          <input
            type={showPassword ? 'text' : 'password'}
            className="input"
            value={form.password2}
            onChange={(e) =>
              setForm({ ...form, password2: e.target.value })
            }
            required
          />
        </Field>

        {err && (
          <p className="text-sm text-red-600 break-words">{err}</p>
        )}

        {/* SUBMIT */}
        <button
          disabled={!canSubmit}
          className="btn-primary w-full disabled:opacity-50"
        >
          {loading ? 'Creating…' : 'Create account'}
        </button>

        <p className="text-sm text-slate-500 text-center">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-600 hover:underline">
            Sign in
          </Link>
        </p>
      </form>

      <style>{`
        .input{width:100%;padding:.6rem .75rem;border:1px solid #e2e8f0;border-radius:.5rem;outline:none}
        .input:focus{border-color:#3b6ef7;box-shadow:0 0 0 3px rgba(59,110,247,.15)}
        .btn-primary{background:#2f5be0;color:#fff;padding:.6rem .9rem;border-radius:.5rem;font-weight:500}
        .btn-primary:hover{background:#2548b8}
        .btn-primary:disabled{opacity:.6}
      `}</style>
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
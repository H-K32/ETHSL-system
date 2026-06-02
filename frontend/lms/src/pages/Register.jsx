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
  const [fieldErrors, setFieldErrors] = useState({ full_name: '', username: '' })
  const [loading, setLoading] = useState(false)

  const [showPassword, setShowPassword] = useState(false)
  const [passwordFocused, setPasswordFocused] = useState(false)

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

  const FULL_NAME_REGEX = /^[a-zA-Z ]+$/
  const USERNAME_REGEX = /^[a-zA-Z0-9]+$/

  const canSubmit =
    form.email &&
    form.gender &&
    form.password === form.password2 &&
    isPasswordValid &&
    !loading

  // ---------------- SUBMIT ----------------
  const onSubmit = async (e) => {
    e.preventDefault()
    setErr(null)

    // ✅ validation FIRST
    setFieldErrors({ full_name: '', username: '' })

    if (form.full_name && !FULL_NAME_REGEX.test(form.full_name)) {
      return setFieldErrors(f => ({ ...f, full_name: 'Full name can only contain letters and spaces.' }))
    }

    if (form.username && !USERNAME_REGEX.test(form.username)) {
      return setFieldErrors(f => ({ ...f, username: 'Username can only contain letters and numbers.' }))
    }

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
      const data = await register(form)
      nav('/check-email', { state: { uidb64: data?.uidb64 } })
    } catch (e) {
      const data = e?.response?.data

      setErr(
        data?.username?.[0] ? 'Use a different username' : null ||
        data?.email?.[0] ||
        data?.password?.[0] ||
        data?.detail ||
        (typeof data === 'string' ? data : null) ||
        'Could not register'
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

        {/* Full name */}
        <Field label="Full Name">
          <input
            className="input"
            value={form.full_name}
            onChange={(e) => {
              setForm({ ...form, full_name: e.target.value })
              setFieldErrors(f => ({ ...f, full_name: '' }))
            }}
            required
          />
          {fieldErrors.full_name && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.full_name}</p>
          )}
        </Field>

        <Field label="Username">
          <input
            className="input"
            value={form.username}
            onChange={(e) => {
              setForm({ ...form, username: e.target.value })
              setFieldErrors(f => ({ ...f, username: '' }))
            }}
            required
          />
          {fieldErrors.username && (
            <p className="text-xs text-red-600 mt-1">{fieldErrors.username}</p>
          )}
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

        {/* PASSWORD */}
        <Field label="Password">
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              className="input"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
              onFocus={() => setPasswordFocused(true)}
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2 top-2 text-xs text-gray-500"
            >
              {showPassword ? 'Hide 👁' : 'Show 👁'}
            </button>
          </div>

          <div className="mt-2 space-y-1 text-xs">
            {passwordFocused && (
              <>
                <p className={passwordChecks.minLength ? "text-green-600" : "text-red-500"}>
                  {passwordChecks.minLength ? "✔" : "✖"} At least 8 characters
                </p>
                <p className={passwordChecks.hasUpper ? "text-green-600" : "text-red-500"}>
                  {passwordChecks.hasUpper ? "✔" : "✖"} At least 1 uppercase letter
                </p>
                <p className={passwordChecks.hasLower ? "text-green-600" : "text-red-500"}>
                  {passwordChecks.hasLower ? "✔" : "✖"} At least 1 lowercase letter
                </p>
                <p className={passwordChecks.hasNumber ? "text-green-600" : "text-red-500"}>
                  {passwordChecks.hasNumber ? "✔" : "✖"} At least 1 number
                </p>
              </>
            )}
          </div>

          {passwordFocused && (
            <>
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
            </>
          )}
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
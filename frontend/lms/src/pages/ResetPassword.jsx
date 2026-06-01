import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import "../styles/resetpassword.css"

function validate(password) {
  const checks = {
    minLength: password.length >= 8,
    hasUpper:  /[A-Z]/.test(password),
    hasNumber: /\d/.test(password),
  }
  return checks
}

export default function ResetPassword() {
  const { uidb64, token } = useParams()
  const nav = useNavigate()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [msg, setMsg] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const checks = validate(password)
  const isPasswordValid = Object.values(checks).every(Boolean)

  const submit = async (e) => {
    e.preventDefault()
    setMsg("")

    if (!isPasswordValid) {
      setMsg("Password does not meet the requirements below.")
      return
    }

    if (password !== confirmPassword) {
      setMsg("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      await axios.post(
        `https://ethsl-system.onrender.com/api/users/password-reset-confirm/${uidb64}/${token}/`,
        { password }
      )
      setSuccess(true)
      setMsg("Password reset successful. Redirecting...")
      setTimeout(() => nav("/login"), 1500)
    } catch (err) {
      const data = err?.response?.data
      const pwdError = data?.password
      if (pwdError) {
        const msg = Array.isArray(pwdError) ? pwdError[0] : pwdError
        if (msg.toLowerCase().includes('previous') || msg.toLowerCase().includes('used before')) {
          setMsg("Can't use a password you've used before. Please choose a new password.")
        } else {
          setMsg(msg)
        }
      } else {
        setMsg(data?.non_field_errors?.[0] || data?.detail || "Invalid or expired link.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reset-password-container">
      <div className="reset-password-card">
        <h2>Reset Password</h2>
        <p>Enter your new password below</p>

        <form onSubmit={submit}>
          <div className="form-group">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setMsg("") }}
              disabled={loading}
              required
            />
          </div>

          {/* live password requirements */}
          {password && (
            <ul className="reset-checks">
              <li className={checks.minLength ? "check-pass" : "check-fail"}>
                {checks.minLength ? "✔" : "✖"} At least 8 characters
              </li>
              <li className={checks.hasUpper ? "check-pass" : "check-fail"}>
                {checks.hasUpper ? "✔" : "✖"} At least 1 uppercase letter
              </li>
              <li className={checks.hasNumber ? "check-pass" : "check-fail"}>
                {checks.hasNumber ? "✔" : "✖"} At least 1 number
              </li>
            </ul>
          )}

          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setMsg("") }}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className={`reset-button ${loading ? "loading" : ""}`}
            disabled={loading || !password || !confirmPassword}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {msg && (
          <div className={`reset-message ${success ? "success" : "error"}`}>
            {msg}
          </div>
        )}
      </div>
    </div>
  )
}
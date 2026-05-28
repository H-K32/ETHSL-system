import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import "../styles/resetpassword.css"

export default function ResetPassword() {
  const { uidb64, token } = useParams()
  const nav = useNavigate()

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()

    setMsg("")

    // ✅ VALIDATE FIRST (IMPORTANT)
    if (password !== confirmPassword) {
      setMsg("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setMsg("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      await axios.post(
        `https://ethsl-system.onrender.com/api/users/password-reset-confirm/${uidb64}/${token}/`,
        { password }
      )

      setMsg("Password reset successful. Redirecting...")

      setTimeout(() => nav("/login"), 1500)
    } catch (err) {
      setMsg("Invalid or expired link.")
    } finally {
      setLoading(false)
    }
  }

  const isDisabled = loading || !password || !confirmPassword

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
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className={`reset-button ${loading ? "loading" : ""}`}
            disabled={isDisabled}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>
        </form>

        {msg && (
          <div className={`reset-message ${msg.includes("successful") ? "success" : "error"}`}>
            {msg}
          </div>
        )}
      </div>
    </div>
  )
}
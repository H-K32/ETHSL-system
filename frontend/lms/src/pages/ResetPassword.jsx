import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import "../styles/resetpassword.css"

export default function ResetPassword() {
  const { uidb64, token } = useParams()
  const nav = useNavigate()

  const [password, setPassword] = useState("")
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg("")

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
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className={`reset-button ${loading ? "loading" : ""}`} disabled={loading}>
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
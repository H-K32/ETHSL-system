import { useState } from "react"
import axios from "axios"
import "../styles/forgotpassword.css"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [msg, setMsg] = useState("")
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMsg("")

    try {
      await axios.post(
        "https://ethsl-system.onrender.com/api/users/password-reset/",
        { email }
      )

      setMsg("If the email exists, a reset link has been sent.")
    } catch (err) {
      setMsg("Something went wrong.")
    } finally {
      setLoading(false)
    }
  }

  return (
    
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <h2>Forgot Password</h2>
        <p>Enter your email to reset your password</p>

        {msg && (
          <div className={`forgot-message ${msg.includes("sent") ? "success" : "error"}`}>
            {msg}
          </div>
        )}

        <form onSubmit={submit}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <button type="submit" className="reset-button" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="forgot-footer">
          <a href="/login">Back to Login</a>
        </div>
      </div>
    </div>
  )
}
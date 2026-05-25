import { useState } from "react"
import axios from "axios"

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
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h2>Forgot Password</h2>

      <form onSubmit={submit}>
        <input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <button disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
    </div>
  )
}
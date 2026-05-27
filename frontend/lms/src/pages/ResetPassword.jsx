import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"

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
    <div style={{ maxWidth: 400, margin: "80px auto" }}>
      <h2>Reset Password</h2>

      <form onSubmit={submit}>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ width: "100%", padding: 10, marginBottom: 10 }}
        />

        <button disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>

      {msg && <p style={{ marginTop: 10 }}>{msg}</p>}
    </div>
  )
}
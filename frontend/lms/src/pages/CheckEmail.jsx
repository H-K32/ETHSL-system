import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function CheckEmail() {
  const { state } = useLocation()
  const nav = useNavigate()
  const intervalRef = useRef(null)

  useEffect(() => {
    const uidb64 = state?.uidb64
    if (!uidb64) return

    intervalRef.current = setInterval(async () => {
      try {
        const { data } = await axios.get(
          `https://ethsl-system.onrender.com/api/users/email-verification-status/${uidb64}/`
        )
        if (data.verified) {
          clearInterval(intervalRef.current)
          // Redirect to complete profile instead of login
          nav('/complete-profile', { replace: true })
        }
      } catch {
        // silently ignore network errors and keep polling
      }
    }, 3000)

    return () => clearInterval(intervalRef.current)
  }, [state, nav])

  return (
    <div className="max-w-md mx-auto text-center mt-20">
      <h1 className="text-xl font-bold">Verify your email</h1>
      <p className="mt-2 text-gray-600">
        We sent you a verification link. Please check your inbox.
      </p>
      <p className="mt-4 text-sm text-gray-400 animate-pulse">
        Waiting for verification…
      </p>
    </div>
  )
}

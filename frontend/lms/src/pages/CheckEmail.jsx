import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import api from '../api/client.js'

export default function CheckEmail() {
  const { state } = useLocation()
  const nav = useNavigate()
  const intervalRef = useRef(null)

  useEffect(() => {
    const uidb64 = state?.uidb64
    if (!uidb64) return

    intervalRef.current = setInterval(async () => {
      try {
        const { data } = await api.get(
          `/users/email-verification-status/${uidb64}/`
        )
        if (data.verified) {
          clearInterval(intervalRef.current)
          nav('/login', { replace: true })
        }
      } catch {
        // silently ignore network errors and keep polling
      }
    }, 3000)

    return () => clearInterval(intervalRef.current)
  }, [state, nav])

  return (
    <div className="max-w-md mx-auto text-center mt-20 px-4">
      <div className="text-5xl mb-4">📧</div>
      <h1 className="text-xl font-bold text-slate-800">Check your email</h1>
      <p className="mt-2 text-gray-600">
        We sent a verification link to your inbox. Click it to activate your account.
      </p>
      <p className="mt-4 text-sm text-gray-400 animate-pulse">
        Waiting for verification…
      </p>
      <p className="mt-6 text-xs text-gray-400">
        Already verified?{' '}
        <button
          onClick={() => nav('/login')}
          className="text-blue-600 hover:underline font-medium"
        >
          Sign in
        </button>
      </p>
    </div>
  )
}

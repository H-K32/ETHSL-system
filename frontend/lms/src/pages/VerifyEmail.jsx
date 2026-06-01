import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/client.js'

export default function VerifyEmail() {
  const { uidb64, token } = useParams()
  const nav = useNavigate()
  const [status, setStatus] = useState('loading')

  useEffect(() => {
    api.get(`/users/verify-email/${uidb64}/${token}/`)
      .then(() => {
        setStatus('success')
        setTimeout(() => nav('/login', { replace: true }), 2500)
      })
      .catch(() => setStatus('error'))
  }, [uidb64, token, nav])

  return (
    <div className="max-w-md mx-auto text-center mt-20 px-4">
      {status === 'loading' && (
        <>
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <h1 className="text-xl font-bold text-slate-800">Verifying your email…</h1>
          <p className="text-gray-500 mt-2 text-sm">This should only take a moment.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="text-5xl mb-4">✅</div>
          <h1 className="text-xl font-bold text-green-600">Email Verified!</h1>
          <p className="text-gray-500 mt-2 text-sm">Your account is now active. Redirecting you to sign in…</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="text-5xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-red-600">Verification Failed</h1>
          <p className="text-gray-500 mt-2 text-sm">The link is invalid or has expired.</p>
          <button
            onClick={() => nav('/register')}
            className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Back to Register
          </button>
        </>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

export default function VerifyEmail() {
  const { uid, token } = useParams()
  const nav = useNavigate()

  const [status, setStatus] = useState('loading') 
  // loading | success | error

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axios.get(
          //`https://ethsl-system.onrender.com/api/users/verify-email/${uid}/${token}/`
          "https://ethsl-system-production.up.railway.app/api" + `/users/verify-email/${uid}/${token}/`
        )

        setStatus('success')

        // redirect after success
        setTimeout(() => {
          nav('/login')
        }, 2000)

      } catch (err) {
        setStatus('error')
      }
    }

    verifyEmail()
  }, [uid, token, nav])

  return (
    <div className="max-w-md mx-auto text-center mt-20">
      
      {status === 'loading' && (
        <>
          <h1 className="text-xl font-bold">Verifying...</h1>
          <p className="text-gray-600 mt-2">
            Please wait while we verify your email.
          </p>
        </>
      )}

      {status === 'success' && (
        <>
          <h1 className="text-xl font-bold text-green-600">
            Email Verified ✅
          </h1>
          <p className="text-gray-600 mt-2">
            Redirecting you to login...
          </p>
        </>
      )}

      {status === 'error' && (
        <>
          <h1 className="text-xl font-bold text-red-600">
            Verification Failed ❌
          </h1>
          <p className="text-gray-600 mt-2">
            Link is invalid or expired.
          </p>
        </>
      )}
    </div>
  )
}
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import Spinner from './Spinner.jsx'

export default function ProtectedRoute() {
  const { user, loading } = useAuth()
  const loc = useLocation()

  if (loading) return <Spinner />

  if (!user && !localStorage.getItem('access_token')) {
    return <Navigate to="/login" state={{ from: loc }} replace />
  }

  // If placement is required and not yet passed, redirect to placement test.
  // Allow /placement itself through so the user isn't caught in a redirect loop.
  if (
    user &&
    user.placement_required &&
    !user.placement_passed &&
    loc.pathname !== '/placement'
  ) {
    return <Navigate to="/placement" state={{ level: user.level }} replace />
  }

  return <Outlet />
}

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
  return <Outlet />
}

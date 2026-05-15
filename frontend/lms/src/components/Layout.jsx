import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const link = ({ isActive }) =>
    `px-3 py-2 rounded-md text-sm font-medium ${
      isActive ? 'text-brand-700 bg-brand-50' : 'text-slate-600 hover:text-brand-600'
    }`

  return (
    <div className="min-h-full flex flex-col">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white grid place-items-center font-bold">E</div>
            <span className="font-semibold text-slate-800">ETHSL LMS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-1">
            {user && <NavLink to="/levels" className={link}>Levels</NavLink>}
            {user && <NavLink to="/profile" className={link}>Profile</NavLink>}
          </nav>
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span className="hidden sm:inline text-sm text-slate-500">
                  {user.username || user.email}
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-1.5 text-sm rounded-md border border-slate-200 hover:bg-slate-50"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3 py-1.5 text-sm rounded-md text-slate-700 hover:bg-slate-100"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-3 py-1.5 text-sm rounded-md bg-brand-600 text-white hover:bg-brand-700"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 py-6 text-sm text-slate-500">
          © {new Date().getFullYear()} ETHSL Learner LMS
        </div>
      </footer>
    </div>
  )
}

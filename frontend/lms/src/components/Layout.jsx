import React, { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../api/client.js'
import '../styles/layout.css'

export default function Layout() {
  const { user, logout } = useAuth()
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()
  const location = useLocation()
  
  const navLinkClass = ({ isActive }) =>
    `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  const showSidebar = user && !isAuthPage

  useEffect(() => {
    if (!user) {
      setUnreadCount(0)
      return
    }

    const isWarningExpired = (dateString) => {
      const warningDate = new Date(dateString)
      const now = new Date()
      const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000
      return now - warningDate > THIRTY_DAYS_MS
    }

    const fetchUnreadNotifications = async () => {
      try {
        const response = await api.get('/users/profile/')
        const userData = response.data
        if (userData.warning_message) {
          const warningDate = userData.warning_date || new Date().toISOString()
          setUnreadCount(isWarningExpired(warningDate) ? 0 : 1)
        } else {
          setUnreadCount(0)
        }
      } catch (err) {
        setUnreadCount(0)
      }
    }

    fetchUnreadNotifications()
  }, [user])
  
  return (
    <div className="layout-container">
      {/* Sidebar - Always show when logged in */}
      {showSidebar && (
        <aside className="sidebar">
          <div className="sidebar-content">
            {/* Logo */}
            <Link to="/dashboard" className="logo">
              <div className="logo-icon">
                <span>E</span>
              </div>
              <span className="logo-text">ETHSL LMS</span>
            </Link>

            {/* Navigation - Placement REMOVED */}
            <nav className="nav-menu">
              <NavLink to="/dashboard" className={navLinkClass}>
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Dashboard</span>
              </NavLink>
              
              <NavLink to="/levels" className={navLinkClass}>
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>Levels</span>
              </NavLink>

              <NavLink to="/curriculum" className={navLinkClass}>
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Curriculum</span>
              </NavLink>

              <NavLink to="/progress" className={navLinkClass}>
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Progress</span>
              </NavLink>

              <NavLink to="/certificates" className={navLinkClass}>
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m1-5H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2z" />
                </svg>
                <span>Certificates</span>
              </NavLink>

              <NavLink to="/community" className={navLinkClass}>
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span>Community</span>
              </NavLink>

              <NavLink to="/notifications" className={navLinkClass}>
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span>Notifications</span>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </NavLink>

              <NavLink to="/profile" className={navLinkClass}>
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Profile</span>
              </NavLink>
            </nav>

            {/* User Section - Only logout button now */}
            <div className="user-section">
              <button onClick={logout} className="logout-btn">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Main Content */}
      <div className={`main-wrapper ${!showSidebar ? 'full-width' : ''}`}>
        <main className="main-content">
          <Outlet />
        </main>
        
        {!isAuthPage && (
          <footer className="footer">
            <p>© {new Date().getFullYear()} ETHSL Learner LMS. All rights reserved.</p>
          </footer>
        )}
      </div>
    </div>
  )
}
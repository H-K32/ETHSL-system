import { Link, NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import '../styles/layout.css'




export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  
  const navLinkClass = ({ isActive }) =>
    `nav-link ${isActive ? 'nav-link-active' : 'nav-link-inactive'}`

  // Check if current page is auth pages (no sidebar for login/register)
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register'
  const showSidebar = user && !isAuthPage

  // Dashboard stats
  const stats = [
    { label: 'Courses Enrolled', value: '3', icon: '📚', color: '#4f46e5' },
    { label: 'Lessons Completed', value: '12', icon: '✅', color: '#10b981' },
    { label: 'Quiz Score', value: '85%', icon: '📊', color: '#f59e0b' },
    { label: 'Current Streak', value: '7', icon: '🔥', color: '#ef4444' },
  ]

  const recentActivities = [
    { title: 'Completed Level 1', date: '2 hours ago' },
    { title: 'Scored 90% on Quiz', date: 'Yesterday' },
    { title: 'Started Level 2', date: '3 days ago' },
  ]

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

              <NavLink to="/progress" className={navLinkClass}>
                <svg className="nav-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <span>Progress</span>
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
                <span className="notification-badge">3</span>
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
          {/* Dashboard Content - Main view when at /dashboard */}
          {location.pathname === '/dashboard' && (
            <div className="dashboard-container">
              {/* Welcome Section */}
              <div className="welcome-section">
                <div className="welcome-text">
                  <h1 className="welcome-title">
                    Welcome back, <span className="gradient-name">{user?.username || 'Learner'}! 👋</span>
                  </h1>
                  <p className="welcome-subtitle">Continue your learning journey. You're making great progress!</p>
                </div>
                <div className="welcome-emoji">🌟</div>
              </div>

              {/* Stats Grid */}
              <div className="stats-grid">
                {stats.map((stat, index) => (
                  <div key={index} className="stat-card">
                    <div className="stat-icon" style={{ background: `${stat.color}15` }}>
                      <span>{stat.icon}</span>
                    </div>
                    <div className="stat-info">
                      <p className="stat-value">{stat.value}</p>
                      <p className="stat-label">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Activity */}
              <div className="dashboard-card">
                <div className="card-header">
                  <h3>Recent Activity</h3>
                  <Link to="/progress" className="view-all">View All →</Link>
                </div>
                <div className="activity-list">
                  {recentActivities.map((activity, index) => (
                    <div key={index} className="activity-item">
                      <div className="activity-dot"></div>
                      <div className="activity-content">
                        <p className="activity-title">{activity.title}</p>
                        <p className="activity-date">{activity.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions">
                <h3 className="quick-title">Quick Actions</h3>
                <div className="actions-grid">
                  <Link to="/levels" className="action-btn">
                    <span>📖</span>
                    <span>Continue Learning</span>
                  </Link>
                  <Link to="/progress" className="action-btn">
                    <span>📈</span>
                    <span>View Progress</span>
                  </Link>
                  <Link to="/community" className="action-btn">
                    <span>💬</span>
                    <span>Join Discussion</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Other routes will render here */}
          {location.pathname !== '/dashboard' && <Outlet />}
        </main>
        
        {/* Footer - Hide on auth pages */}
        {!isAuthPage && (
          <footer className="footer">
            <p>© {new Date().getFullYear()} ETHSL Learner LMS. All rights reserved.</p>
          </footer>
        )}
      </div>
    </div>
  )
}